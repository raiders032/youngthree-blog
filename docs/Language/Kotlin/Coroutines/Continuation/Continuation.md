---
title: "Continuation-passing style"
description: "코틀린 코루틴이 내부적으로 어떻게 동작하는지 상세히 알아봅니다. 컨티뉴에이션 패싱 스타일을 중심으로 코루틴의 핵심 매커니즘을 이해하고, 실제 예제를 통해 suspending function이 어떻게 변환되는지 살펴봅니다."
tags: [ "KOTLIN", "COROUTINE", "CONTINUATION", "CONCURRENT_PROGRAMMING", "BACKEND" ]
keywords: [ "코틀린", "kotlin", "코루틴", "coroutine", "컨티뉴에이션", "continuation", "서스펜딩 함수", "suspending function", "동시성", "concurrent", "백엔드", "backend" ]
draft: true
hide_title: true
---

## 1. 코루틴의 내부 구현 이해하기

- 코루틴의 핵심인 중단 함수의 내부 동작 원리를 이해하면 코루틴을 더 효과적으로 활용할 수 있습니다.
- 이를 위해 컨티뉴에이션 패싱 스타일을 중심으로 살펴보겠습니다.

### 1.1 핵심 개념 요약

- suspending 함수는 상태 머신으로 동작합니다
- 함수의 시작점과 각 suspending 함수 호출 이후마다 상태가 존재합니다
- 상태 번호와 로컬 변수는 중단 전에 continuation 객체에 저장됩니다
- 함수의 continuation은 호출자 함수의 continuation을 포함하여 콜 스택을 형성합니다

## 2. Continuation-passing style

### 2.1 기본 구현 방식

- 코틀린은 suspending 함수를 구현하기 위해 continuation-passing style을 채택했습니다.
- 이는 continuation을 함수의 마지막 파라미터로 전달하는 방식입니다.

### 2.2 컴파일러의 코드 변환

```kotlin
// 원본 코드
suspend fun getUser(): User?
suspend fun setUser(user: User)
suspend fun checkAvailability(flight: Flight): Boolean

// 컴파일러가 변환한 코드
fun getUser(continuation: Continuation<*>): Any?
fun setUser(user: User, continuation: Continuation<*>): Any
fun checkAvailability(
    flight: Flight,
    continuation: Continuation<*>
): Any
```

- 컴파일러는 suspending 함수를 다음과 같이 변환합니다:
- Continuation 파라미터 추가
	- 반환 타입을 Any 또는 Any?로 변경
	- 중단 시 COROUTINE_SUSPENDED 반환 (중단 함수는 중단되는 경우 COROUTINE_SUSPENDED 마커를 반환합니다)
	- 완료 시 원래 선언된 타입의 값 반환
	- getUser 함수가 User? 또는 COROUTINE_SUSPENDED을 반환할 수 있기 때문에 가장 가까운 슈퍼 타입인 Any?로 반환 타입이 변경됩니다.

## 3. 간단한 함수의 내부 구현

### 3.1 기본 예제 분석

```kotlin
// 원본 코드
suspend fun myFunction() {
    println("Before")
    delay(1000) // suspending
    println("After")
}

// 컴파일러가 변환한 코드
fun myFunction(continuation: Continuation<Unit>): Any {
    val continuation = continuation as? MyFunctionContinuation
        ?: MyFunctionContinuation(continuation)

    if (continuation.label == 0) {
        println("Before")
        continuation.label = 1
        if (delay(1000, continuation) == COROUTINE_SUSPENDED) {
            return COROUTINE_SUSPENDED
        }
    }
    if (continuation.label == 1) {
        println("After")
        return Unit
    }
    error("Impossible")
}
```

- 가장 먼저 아규먼트인 continuation의 타입을 확인하여 새로 시작하는 것인지 아니면 이전에 중단된 것을 재개하는 것인지 확인합니다.
- MyFunctionContinuation이라면 이전에 중단된 것을 재개하는 것이고 아니라면 새로 시작하는 것입니다.
	- 그 이유는 각 함수마다 자신만의 continuation을 가지고 있어 다른 중단 함수를 호출할 때 continuation을 넘겨줍니다.
	- 아규먼트인 continuation이 나의 것인지 아니면 다른 함수의 것인지 확인하기 위해 MyFunctionContinuation인지 확인합니다.
	- 이를 통해 중단 함수의 시작과 재개를 구분할 수 있습니다.
- 밑에 MyFunctionContinuation 클래스를 자세히 살펴보겠습니다.

### 3.2 Continuation 클래스

```kotlin
class MyFunctionContinuation(
    val completion: Continuation<Unit>
) : Continuation<Unit> {
    override val context: CoroutineContext
        get() = completion.context

    var label = 0
    var result: Result<Any>? = null

    override fun resumeWith(result: Result<Unit>) {
        this.result = result
        val res = try {
            val r = myFunction(this)
            if (r == COROUTINE_SUSPENDED) return
            Result.success(r as Unit)
        } catch (e: Throwable) {
            Result.failure(e)
        }
        completion.resumeWith(res)
    }
}
```

- MyFunctionContinuation 클래스는 Continuation 인터페이스를 구현합니다.
- 현재의 상태를 나타내는 label과 결과를 저장하는 result 프로퍼티를 가집니다.
- MyFunctionContinuation은 생성자로 Continuation을 받아 초기화합니다.
	- 앞서 언급한 것 처럼 호출된 함수의 Continuation으로 호출한 함수가 넘겨준 Continuation을 포장합니다.
	- 여시서 completion이 myFunction을 호출한 중단 함수의 Continuation입니다.
	- 이후 resumeWith 함수에서 completion.resumeWith(res)를 호출하여 결과를 반환합니다.
	- 즉 이전에 중단된 함수에 결과를 반환하면서 재개합니다.
- resumeWith 함수는 결과를 받아 처리하는 함수입니다.
	- 결과를 받아 result에 저장하고 myFunction을 호출합니다.
	- 즉 자기 자신을 호출합니다. 이 때 자기 자신(Continuation)을 파라미터로 넘겨줍니다.
	- 이 Continuation에는 실행 정보가 담겨 있습니다.
	- 이 resumeWith 함수는 myFunction에서 호출한 delay(1000, continuation) 중단 함수의 위해 호출됩니다.
	- delay 함수 호출 전에 continuation.label을 1로 변경하고 전달했기 때문에 delay 함수가 continuation의 resumeWith 함수를 호출하면 continuation.label이
	  1된 상태로 myFunction이 재개됩니다.

:::tip
IntelliJ IDEA에서는 Tools > Kotlin > Show Kotlin bytecode 메뉴를 통해 실제 생성되는 바이트코드를 확인할 수 있습니다.
:::

## 4. 상태를 가진 함수의 구현

### 4.1 로컬 변수와 파라미터 처리

함수가 중단되고 재개될 때는 로컬 변수와 파라미터의 상태도 보존되어야 합니다. 다음 예제를 통해 살펴보겠습니다:

```kotlin
suspend fun myFunction(surname: String) {
    println("Before")
    var name = "John"
    delay(1000) // suspending
    println("His name is: $name $surname")
    println("After")
}
```

이 함수는 내부적으로 다음과 같이 변환됩니다:

```kotlin
fun myFunction(surname: String, continuation: Continuation<Unit>): Any {
    val continuation = continuation as? MyFunctionContinuation
        ?: MyFunctionContinuation(surname, continuation)

    var name = continuation.name

    if (continuation.label == 0) {
        println("Before")
        name = "John"
        continuation.name = name
        continuation.label = 1
        if (delay(1000, continuation) == COROUTINE_SUSPENDED) {
            return COROUTINE_SUSPENDED
        }
    }
    if (continuation.label == 1) {
        println("His name is: $name ${continuation.surname}")
        println("After")
        return Unit
    }
    error("Impossible")
}
```

:::note
continuation은 객체를 복사하지 않고 참조만 저장합니다. suspending 함수 호출의 가장 큰 비용은 continuation 객체 생성입니다.
:::

## 5. 값을 반환하는 함수의 구현

### 5.1 반환값과 예외 처리

suspending 함수에서 값을 반환받아 사용하는 경우를 살펴보겠습니다:

```kotlin
suspend fun printUser(token: String) {
    println("Before")
    val userId = getUserId(token) // suspending
    println("Got userId: $userId")
    val userName = getUserName(userId, token) // suspending
    println(User(userId, userName))
    println("After")
}
```

이 함수는 다음과 같이 변환됩니다:

```kotlin
fun printUser(token: String, continuation: Continuation<*>): Any {
    val continuation = continuation as? PrintUserContinuation
        ?: PrintUserContinuation(continuation as Continuation<Unit>, token)

    var result: Result<Any>? = continuation.result
    var userId: String? = continuation.userId
    val userName: String

    if (continuation.label == 0) {
        println("Before")
        continuation.label = 1
        val res = getUserId(token, continuation)
        if (res == COROUTINE_SUSPENDED) {
            return COROUTINE_SUSPENDED
        }
        result = Result.success(res)
    }
    // ... 나머지 상태 처리
}
```

## 6. 콜 스택의 구현

### 6.1 Continuation 체인

일반적인 함수 호출에서는 가상 머신이 콜 스택을 사용하여 함수의 상태와 반환 주소를 저장합니다. 하지만 코루틴이 중단되면 스레드가 해제되면서 콜 스택도 사라집니다.

이를 해결하기 위해 continuation이 콜 스택을 대체합니다:

```kotlin
CContinuation(
    i = 4,
    label = 1,
    completion = BContinuation(
        i = 4,
        label = 1,
        completion = AContinuation(
            label = 2,
            user = User@1234,
            completion = ...
        )
    )
)
```

:::info
각 continuation은 다음을 저장합니다:

- 현재 상태 (label)
- 로컬 변수와 파라미터
- 호출자 함수의 continuation에 대한 참조
  :::

### 6.2 재개 프로세스

함수가 재개될 때의 프로세스는 다음과 같습니다:

1. continuation이 자신의 함수를 호출
2. 함수가 완료되면 호출자 함수의 continuation을 재개
3. 이 과정이 스택의 최상위에 도달할 때까지 반복

## 7. 실제 구현의 최적화

실제 코드는 다음과 같은 추가적인 메커니즘과 최적화를 포함합니다:

- 더 나은 예외 스택 트레이스 구성
- 코루틴 중단 인터셉션
- 다양한 레벨의 최적화:
	- 사용되지 않는 변수 제거
	- 꼬리 호출 최적화
	- 재귀 대신 루프 사용

:::tip[성능에 관하여]
suspending 함수의 오버헤드는 생각보다 크지 않습니다. 상태 분할과 점프는 매우 저렴한 연산이며, continuation 객체 생성만이 실질적인 비용입니다.
:::

## 8. 다른 컨텍스트에서의 suspending 함수

### 8.1 클래스 멤버로서의 suspending 함수

클래스의 멤버 함수인 경우, continuation은 추가로 객체에 대한 참조도 저장해야 합니다:

```kotlin
class UserRepository {
    suspend fun getUser(id: String): User {
        // UserRepository의 참조가 continuation에 저장됨
        return getUserFromApi(id)
    }
}
```

:::note
확장 함수나 인라인 클래스 내부의 함수와 같이 여러 리시버를 가진 함수들도 모두 continuation에 암시적으로 저장됩니다.
:::