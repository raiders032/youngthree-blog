---
title: "Coroutine Builder"
description: "코틀린 코루틴의 다양한 빌더(runBlocking, launch, async)와 CoroutineStart 실행 옵션(DEFAULT, LAZY, ATOMIC, UNDISPATCHED)에 대한 상세 설명과 실제 활용 패턴, 성능 최적화 방법을 코드 예제와 함께 알아봅니다."
tags: [ "COROUTINE", "KOTLIN", "CONCURRENCY", "ASYNC", "BACKEND", "ANDROID", "MOBILE" ]
keywords: [ "코루틴", "coroutine", "코루틴빌더", "코루틴 빌더", "coroutine builder", "launch", "async", "runBlocking", "코루틴스타트", "CoroutineStart", "코틀린", "kotlin", "동시성", "concurrency", "비동기", "asynchronous", "지연실행", "lazy coroutine", "코루틴취소", "coroutine cancellation", "안드로이드", "android" ]
draft: false
hide_title: true
---

## 1 Coroutine Builder

- 코루틴을 만드는 함수를 코루틴 빌더라고 합니다.
	- 예를들어 `launch`, `async` 등이 코루틴 빌더입니다.
  - 코루틴을 생성한다는 말에는 실행한다는 의미가 포함되어 있습니다.
- 이들은 각각 다른 방식으로 코루틴을 실행하며, 특정 스코프에서 코루틴을 시작합니다.

## 2 CoroutineScope과의 관계

- 코루틴 빌더는 CoroutineScope의 확장 함수입니다.
- 따라서 CoroutineScope 내에서만 사용할 수 있습니다.
- CoroutineScope는 코루틴의 생명주기를 관리하며, 코루틴이 실행되는 스코프를 제공합니다.
- 쉽게 말해 코루틴들을 묶어서 관리하는 컨테이너라고 생각하면 됩니다.
- 따라서 CoroutineScope 내에서만 코루틴 빌더를 사용할 수 있습니다.
  - 예외적으로 `runBlocking`은 CoroutineScope의 확장 함수가 아니므로 CoroutineScope 내부에서 사용하지 않아도 됩니다.
  - `runBlocking`은 내부적으로 자체 CoroutineScope를 생성합니다.
- [자세한 내용은 CoroutineScope 참고](../CoroutineScope/CoroutineScope.md)

## 3 kotlinx.coroutines 제공 코루틴 빌더

- kotlinx.coroutines는 코루틴을 시작하는 데 사용할 수 있는 여러 빌더를 제공합니다.
- 대표적으로 `runBlocking`, `launch`, `async` 등이 있습니다.

## 4 runBlocking

- `runBlocking`은 호출된 스레드를 차단하고, 내부 블록(코루틴 스코프 내의 모든 코루틴)이 완료될 때까지 대기합니다.
  - 여기서 차단이라는 의미는 runBlocking 블록 내부의 모든 작업이 실행될 때까지 스레드를 차지하는 것을 의미합니다.
- 이는 `runBlocking`이 주로 테스트 환경이나 메인 함수와 같이 코루틴이 기본적으로 지원되지 않는 환경에서 사용될 때 유용합니다.
- `runBlocking`은 Coroutine Builder이자 CoroutineScope를 생성하는 함수입니다.

### 4.1 runBlocking의 사용처

- `runBlocking`은 주로 테스트나 메인 함수에서 사용됩니다.
- 코루틴이 스레드를 블로킹하지 않고 작업을 중단시키기만 하는 것이 일반적인 법칙입니다.
	- 하지만 블로킹이 필요한 경우가 있습니다.
	- 메인 함수의 경우 프로그램을 너무 빨리 끝내지 않기 위해 스레드를 블로킹해야 합니다.
	- 이런 경우 `runBlocking`을 사용하면 됩니다.

### 4.2 CoroutineScope와의 관계

- `runBlocking`은 CoroutineScope의 확장 함수가 아닙니다.
	- 따라서 runBlocking은 자식 코루틴이 될 수 없습니다.
	- launch와 async는 항상 부모 스코프의 컨텍스트를 상속받지만, runBlocking은 완전히 독립적인 최상위 코루틴을 생성합니다.
- runBlocking은 코루틴을 실행하기 위한 자체적인 CoroutineScope를 제공합니다.
	- 이 스코프 내에서 시작되는 모든 코루틴은 `runBlocking`의 스코프에 속하게 됩니다.

### 4.3 runBlocking 사용 예시

**예시**

```kotlin
@Test  
fun runBlockingTest() {  
    runBlocking {  
        delay(1000L)  
        println("[${Thread.currentThread().name}] World!")  
    }  
    runBlocking {  
        delay(1000L)  
        println("[${Thread.currentThread().name}] World!")  
    }  
    runBlocking {  
        delay(1000L)  
        println("[${Thread.currentThread().name}] World!")  
    }  
    println("[${Thread.currentThread().name}] Hello, ")  
}
```

```
[Test worker @coroutine#1] World! // (1초 후)
[Test worker @coroutine#2] World! // (1초 후)
[Test worker @coroutine#3] World! // (1초 후)
[Test worker] Hello,
```

## 5 launch

- `launch`는 새로운 코루틴을 시작하고 작업을 비동기적으로 실행합니다.
- 반환 값이 필요 없는 작업에 적합합니다.
- 실행을 완료하는 데 시간이 걸리는 작업을 백그라운드에서 실행할 때 유용합니다.
- CoroutineScope의 확장 함수입니다.

### 5.1 launch 사용 예시

**예시**

```kotlin
    @Test
    fun testRunBlocking() {
        // runBlocking은 현재 스레드(테스트 스레드)를 차단하는 코루틴 빌더
        // CoroutineName으로 "MainCoroutine"이라는 이름을 지정
        runBlocking(CoroutineName("MainCoroutine")) { // this: CoroutineScope

            // 메인 코루틴의 이름과 실행 중인 스레드 이름 출력
            // 출력 예: "Main coroutine: CoroutineName(MainCoroutine), Thread: Test worker"
            println("Main coroutine: ${coroutineContext[CoroutineName]}, Thread: ${Thread.currentThread().name}")

            // launch는 새 코루틴을 비동기적으로 시작하는 코루틴 빌더
            // 부모 코루틴을 중단시키지 않고 즉시 반환함
            // 자식 코루틴의 이름을 "ChildCoroutine"으로 지정
            launch(CoroutineName("ChildCoroutine")) {

                // 자식 코루틴이 시작되면 실행됨 (메인 코루틴이 "Hello" 출력 후)
                // 출력 예: "Before delay - Coroutine: CoroutineName(ChildCoroutine), Thread: Test worker @ChildCoroutine#2"
                println("Before delay - Coroutine: ${coroutineContext[CoroutineName]}, Thread: ${Thread.currentThread().name}")

                // delay는 현재 코루틴만 일시 중단하고 스레드는 차단하지 않음
                // 이 시간 동안 스레드는 다른 코루틴을 실행할 수 있음
                delay(1000L)

                // 1초 후 코루틴이 재개됨
                // 같은 코루틴 ID(#2)를 가진 것을 확인할 수 있음 (동일한 코루틴이 재개됨)
                // 출력 예: "After delay - Coroutine: CoroutineName(ChildCoroutine), Thread: Test worker @ChildCoroutine#2"
                println("After delay - Coroutine: ${coroutineContext[CoroutineName]}, Thread: ${Thread.currentThread().name}")

                // 마지막으로 "World!" 출력
                println("World!")
            }

            // launch가 즉시 반환되므로 메인 코루틴은 중단 없이 "Hello" 출력
            // 이 라인은 자식 코루틴의 어떤 출력보다 먼저 실행됨
            println("Hello")

            // 이 시점에서 메인 코루틴은 명시적인 코드가 더 이상 없지만
            // runBlocking은 모든 자식 코루틴(launch로 시작한)이 완료될 때까지 대기함
            // 따라서 "World!"가 출력되기 전에 테스트가 종료되지 않음
        }
        // runBlocking이 종료되면 모든 자식 코루틴이 완료된 상태임
    }
```

## 6 async

- async는 launch와 유사하지만, 결과 값을 반환할 수 있는 Deferred 객체를 반환합니다.
	- Deferred에는 작업이 끝나면 값을 반환하는 중단 메서드인 await가 있습니다.
- 결과 값을 반환하는 비동기 작업에 적합합니다.
- 반환된 Deferred 객체의 await() 함수를 통해 비동기적으로 계산된 결과를 얻을 수 있습니다.
- async 빌더는 호출되자마자 코루틴을 즉시 시작합니다.
- async가 동작하는 방식은 launch와 비슷하지만 값을 반환한다는 추가적인 특징이 있다.
	- launch를 async로 대체해도 코드는 여전히 똑같은 방식으로 동작하지만 권장하지 않는 방식이다.

**예시**

```kotlin
fun main() = runBlocking {
    val result = async {
        computeSomething()
    }
    // await()를 사용하여 결과를 얻음
    println("The result is ${result.await()}") 
}

suspend fun computeSomething(): Int {
    delay(1000L) // 예: 어떤 계산을 수행
    return 42 // 계산 결과
}
```

- `async` 블록은 새로운 코루틴을 시작하고 `Deferred` 객체를 반환합니다. 이 객체는 나중에 결과를 얻기 위해 사용됩니다.
- `computeSomething()` 함수는 1초 후에 42를 반환합니다.
- `result.await()` 호출로 메인 코루틴은 `computeSomething()`의 결과가 준비될 때까지 일시 중단됩니다.
- 결과가 준비되면, "The result is 42"가 출력됩니다.
- `async`는 결과를 반환하는 비동기 작업에 적합하며, `await()`를 통해 그 결과를 얻을 수 있습니다.

## 7 launch와 async의 차이점

- 코틀린 코루틴 라이브러리에서 제공하는 `launch`와 `async`는 가장 기본적인 코루틴 빌더들입니다.
- 두 빌더는 모두 비동기 작업을 실행한다는 공통점이 있지만, 목적과 동작 방식에서 중요한 차이점이 있습니다.
- 이 문서에서는 두 빌더의 핵심적인 차이점을 자세히 살펴보겠습니다.

### 7.1 반환 타입의 차이

- `launch`와 `async`의 가장 근본적인 차이점은 반환하는 객체의 타입입니다:
- **launch**: `Job` 객체를 반환합니다.
- **async**: `Deferred<T>` 객체를 반환합니다. 여기서 `T`는 코루틴이 생성하는 결과의 타입입니다.
- `Deferred<T>`는 `Job`의 하위 타입입니다. 
  - 즉, `Deferred`는 `Job`의 모든 기능을 상속받으며, 추가로 결과 값을 반환하는 기능을 가지고 있습니다.

```kotlin
// launch 예제
val job = launch {
    delay(1000L)
    println("작업 완료!")
}

// async 예제
val deferred = async {
    delay(1000L)
    "비동기 작업의 결과"
}
```

### 7.2 Job과 Deferred의 기능 비교

#### Job 객체의 기능

- `Job` 객체는 코루틴의 생명주기를 관리하는 데 사용됩니다
- [Job 참고](../Job/Job.md)

```kotlin
val job = launch {
    // 비동기 작업
}

// 코루틴 완료 대기
job.join()

// 코루틴 취소
job.cancel()

// 코루틴 상태 확인
println("활성 상태: ${job.isActive}")
println("완료 상태: ${job.isCompleted}")
println("취소 상태: ${job.isCancelled}")
```

- `Job`은 코루틴의 상태를 추적하고, 코루틴을 취소하거나 완료를 대기하는 등의 제어 기능을 제공합니다.
- 하지만 `Job`은 코루틴의 실행 결과를 반환하지 않습니다.

#### Deferred 객체의 기능

- `Deferred<T>`는 `Job`의 모든 기능에 더해 `await()` 함수를 통해 결과 값을 반환하는 기능이 있습니다

```kotlin
val deferred = async {
    // 계산 작업 수행
    42
}

// 코루틴 완료 및 결과 대기
val result = deferred.await() // 42 반환

// Job의 기능도 모두 사용 가능
println("활성 상태: ${deferred.isActive}")
deferred.cancel() // 취소 가능
```

- `await()`는 코루틴이 완료될 때까지 현재 코루틴을 일시 중단시킨 후, 결과가 준비되면 해당 결과를 반환합니다.
- 코루틴 실행 중 예외가 발생하면, `await()`는 같은 예외를 다시 던집니다.

### 7.3 사용 목적의 차이

- 반환 타입의 차이로 인해 두 빌더의 주요 사용 목적이 다릅니다:

#### launch의 주요 사용 사례

- `launch`는 "실행하고 잊어버리기(fire and forget)" 방식의 작업에 적합합니다.
- 결과 값이 필요 없는 비동기 작업을 실행할 때 사용합니다

```kotlin
// UI 업데이트
launch {
    updateUserInterface()
}

// 로깅이나 분석 데이터 전송
launch {
    logUserAction(action)
}

// 백그라운드 작업 실행
launch {
    sendEmail(user, "알림")
    updateUserLastNotified(user)
}
```

- 위 예제들에서는 작업의 결과를 기다리거나 활용할 필요가 없기 때문에 `launch`가 적합합니다.

#### async의 주요 사용 사례

- `async`는 결과 값이 필요한 비동기 작업에 사용합니다.
- 특히 여러 비동기 작업을 병렬로 실행한 후 결과를 조합해야 할 때 유용합니다:

```kotlin
// 두 API 호출을 병렬로 실행
val userDeferred = async { repository.getUser(userId) }
val postsDeferred = async { repository.getPosts(userId) }

// 두 작업이 모두 완료될 때까지 기다린 후 결과 사용
val user = userDeferred.await()
val posts = postsDeferred.await()

// 결과 조합
displayUserWithPosts(user, posts)
```

- 이 예제에서는 사용자 정보와 게시물을 동시에 가져온 후, 두 결과를 함께 사용합니다.
- `async`를 사용하면 두 작업을 병렬로 실행하여 전체 실행 시간을 줄일 수 있습니다.

#### async 작업 결과 한 번에 기다리기

- 여러 `async` 작업의 결과를 개별적으로 `await`하는 대신 `awaitAll()` 함수를 사용하면 코드를 더 간결하게 작성할 수 있습니다:

```kotlin
// 여러 API 호출을 병렬로 실행
val deferreds = listOf(
    async { repository.getUser(userId) },
    async { repository.getPosts(userId) },
    async { repository.getFollowers(userId) }
)

// 모든 작업이 완료될 때까지 한 번에 기다림
val (user, posts, followers) = deferreds.awaitAll()

// 결과 사용
displayUserProfile(user, posts, followers)
```

- `awaitAll()`은 모든 비동기 작업이 완료될 때까지 기다린 후, 결과를 리스트로 반환합니다.
- 구조 분해 선언(destructuring declaration)을 사용하면 결과를 개별 변수로 쉽게 분리할 수 있습니다.
- 이 방식은 특히 동적인 개수의 비동기 작업을 처리할 때 유용합니다.

:::tip
실제 프로덕션 코드에서는 항상 예외 처리를 추가하세요. 어느 하나의 비동기 작업이 실패하면 `awaitAll()`도 예외를 발생시킵니다.
:::

### 7.4 예외 처리의 차이

- 두 빌더는 예외 처리 방식에도 차이가 있습니다:

#### launch의 예외 처리

- `launch`에서 발생한 예외는 즉시 부모 코루틴으로 전파됩니다

```kotlin
try {
    launch {
        println("작업 시작")
        throw RuntimeException("오류 발생") // 즉시 부모로 전파
    }
    println("이 코드는 실행됩니다") // launch는 비동기적으로 실행되므로
} catch (e: Exception) {
    // 이 블록은 실행되지 않습니다 (예외가 직접 캐치되지 않음)
    println("예외 처리: ${e.message}")
}
```

- `launch`에서 발생한 예외는 기본적으로 부모 코루틴으로 전파되어 부모 코루틴도 취소시킵니다.
- 이는 구조적 동시성(Structured Concurrency)의 원칙을 따르는 것입니다.

#### async의 예외 처리

- `async`에서 발생한 예외는 `await()`를 호출할 때까지 전파되지 않습니다:

```kotlin
val deferred = async {
    println("작업 시작")
    throw RuntimeException("오류 발생") // 즉시 전파되지 않음
}

// 다른 작업 수행 가능
println("async 후 코드 실행")

try {
    deferred.await() // 여기서 예외가 전파됨
} catch (e: Exception) {
    // 이 블록이 실행됨
    println("예외 처리: ${e.message}")
}
```

- `async`는 예외를 내부적으로 저장했다가 `await()`가 호출될 때 예외를 던집니다.
- 이런 지연된 예외 전파 방식은 여러 비동기 작업 중 일부가 실패하더라도 다른 작업의 결과를 처리할 수 있게 해줍니다.

### 7.5 성능 고려사항

- 결과 값이 필요하지 않은 작업에 `async`를 사용하면 약간의 오버헤드가 발생할 수 있습니다.
- `Deferred` 객체는 결과를 저장하기 위한 추가 메모리와 로직이 필요하기 때문입니다.
- 따라서 결과를 사용하지 않는 경우에는 `launch`를 사용하는 것이 더 효율적입니다.

```kotlin
// 권장되지 않는 방식 (결과를 사용하지 않음)
async {
    updateDatabase()
} // await()를 호출하지 않음

// 권장되는 방식
launch {
    updateDatabase()
}
```

### 7.6 코드로 보는 주요 차이점

- 다음 예제는 `launch`와 `async`의 주요 차이점을 명확하게 보여줍니다:

```kotlin
fun main() = runBlocking {
    // launch 예제
    val job = launch {
        delay(1000L)
        println("launch 완료")
        // 반환값 없음
    }
    
    // async 예제
    val deferred = async {
        delay(1000L)
        println("async 완료")
        "async 결과" // 반환값 있음
    }
    
    // launch는 결과를 반환하지 않음
    job.join() // 완료 대기만 가능
    
    // async는 결과를 반환함
    val result = deferred.await() // 결과 대기 및 반환
    println("결과: $result")
    
    // 두 빌더 모두 상태 확인과 취소가 가능
    println("job 완료 상태: ${job.isCompleted}")
    println("deferred 완료 상태: ${deferred.isCompleted}")
}
```

- 이 예제에서는 `launch`와 `async`의 사용법과 반환값의 차이를 보여줍니다.
- `launch`는 단순히 작업을 실행하고 `Job`을 반환하는 반면, `async`는 작업을 실행하고 `Deferred`를 통해 결과를 제공합니다.

### 7.7 요약

`launch`와 `async`의 차이점을 요약하면 다음과 같습니다:

| 특성    | launch      | async           |
|-------|-------------|-----------------|
| 반환 타입 | Job         | `Deferred<T>`   |
| 결과 반환 | 불가능         | 가능 (await() 사용) |
| 주요 용도 | 결과가 필요없는 작업 | 결과가 필요한 작업      |
| 예외 전파 | 즉시          | await() 호출 시    |
| 사용 패턴 | "실행하고 잊기"   | "실행하고 결과 사용하기"  |

## 8. CoroutineStart 옵션

- 코루틴 빌더(`launch`, `async`)는 코루틴이 어떻게 시작될지를 제어하는 `start` 파라미터를 제공합니다.
- `CoroutineStart` 열거형은 코루틴의 시작 방식을 정의하며, 다양한 상황에 맞게 코루틴 실행을 최적화할 수 있습니다.

### 8.1 CoroutineStart 종류

- `CoroutineStart.DEFAULT`
	- DEFAULT 모드에서는 코루틴이 생성되면 지정된 디스패처에 따라 스케줄링됩니다.
	- 현재 스레드는 코루틴을 생성한 후 즉시 자신의 작업을 계속 진행합니다.
	- 새 코루틴은 디스패처의 스케줄링 정책에 따라 적절한 스레드에 배치되어 실행됩니다.
- `CoroutineStart.LAZY`: 코루틴이 명시적으로 시작되기 전까지는 실행되지 않습니다.
- `CoroutineStart.ATOMIC`: DEFAULT와 유사하지만, 코루틴이 시작되기 전에 취소될 수 없습니다.
- `CoroutineStart.UNDISPATCHED`
	- 첫 중단점까지 현재 스레드에서 코루틴을 즉시 실행합니다.
	- 즉 코루틴이 생성된 직후 현재 스레드에서 즉시 실행됩니다.
	- 첫 번째 중단점에 도달한 후에야 코루틴은 지정된 디스패처에 의해 스케줄링됩니다.

### 8.2 LAZY 옵션 활용

- LAZY 옵션은 코루틴을 즉시 실행하지 않고, `start()` 또는 `join()`/`await()` 호출 시에만 실행합니다.
- 조건부로 코루틴을 실행해야 할 때 유용합니다.

```kotlin
// 지연 시작 코루틴 생성
val job = launch(start = CoroutineStart.LAZY) {
    println("지연 실행 코루틴")
    delay(1000L)
    println("작업 완료")
}

// 필요할 때 명시적으로 시작
if (someCondition) {
    job.start() // 코루틴 실행 시작
}

// 또는 join() 호출 시 자동으로 시작
job.join() // 아직 시작되지 않았다면 시작하고, 완료될 때까지 대기
```

```kotlin
// async에서의 LAZY 사용 예
val deferred = async(start = CoroutineStart.LAZY) {
    println("지연 계산 시작")
    computeValue()
}

// 나중에 결과가 필요할 때만 계산 시작
if (needResult) {
    val result = deferred.await() // 계산 시작 및 결과 대기
    println("계산 결과: $result")
}
```

### 8.3 ATOMIC과 UNDISPATCHED 활용

- ATOMIC은 시작 직후 취소를 방지해야 할 때 유용합니다.
- UNDISPATCHED는 디스패처 전환 없이 첫 중단점까지 즉시 실행하여 성능을 최적화할 때 사용합니다.

```kotlin
// 취소 불가능한 초기화 작업
launch(start = CoroutineStart.ATOMIC) {
    // 이 부분은 취소되지 않고 반드시 실행됨
    initializeCriticalResources()
    
    // 중단점 이후로는 일반적인 코루틴처럼 취소될 수 있음
    delay(100)
    regularWork()
}
```

```kotlin
// 현재 스레드에서 첫 중단점까지 즉시 실행
launch(Dispatchers.IO, start = CoroutineStart.UNDISPATCHED) {
    // 이 코드는 현재 스레드에서 실행됨
    val initialData = prepareData()
    
    // 중단점 이후 Dispatchers.IO로 전환됨
    delay(100)
    processData(initialData)
}
```

### 8.4 실용적인 사용 사례

- LAZY는 계산 비용이 높지만 결과가 항상 필요하지는 않은 작업에 적합합니다.
- ATOMIC은 리소스 정리나 중요한 초기화 작업에 유용합니다.
- UNDISPATCHED는 첫 작업을 현재 스레드에서 빠르게 처리해야 할 때 성능 최적화에 도움이 됩니다.

:::tip
CoroutineStart 옵션은 코루틴의 실행 시점과 방식을 세밀하게 제어할 수 있게 해주므로, 성능 최적화나 특수한 동시성 패턴 구현 시 적절히 활용하면 좋습니다.
:::

### 8.5 옵션 선택 시 고려사항

- `DEFAULT`: 대부분의 일반적인 상황에서 적합합니다. 코루틴을 즉시 실행하고 싶을 때 사용합니다.
- `LAZY`: 다음과 같은 경우에 사용합니다:
	- 조건부 실행이 필요할 때
	- 계산 비용이 높은 작업을 필요할 때만 실행하고 싶을 때
	- 여러 비동기 작업을 준비한 후 한꺼번에 시작하고 싶을 때
- `ATOMIC`: 다음과 같은 경우에 사용합니다:
	- 중요한 초기화 작업이 취소되지 않도록 보장해야 할 때
	- 리소스 획득과 같은 작업이 중간에 취소되면 안 될 때
- `UNDISPATCHED`: 다음과 같은 경우에 사용합니다:
	- 디스패처 전환 비용을 줄이고 싶을 때
	- 첫 작업을 현재 스레드에서 바로 처리해야 할 때
	- UI 스레드에서 짧은 계산을 수행한 후 백그라운드로 전환하고 싶을 때

#### 복합 예제: 여러 옵션 활용하기

```kotlin
fun main() = runBlocking {
    // 1. LAZY로 여러 작업 준비
    val task1 = async(start = CoroutineStart.LAZY) { 
        delay(100)
        "Task 1 결과" 
    }
    
    val task2 = async(start = CoroutineStart.LAZY) { 
        delay(200) 
        "Task 2 결과" 
    }
    
    // 필요할 때 모든 작업 시작
    println("모든 작업 시작...")
    task1.start()
    task2.start()
    
    // 2. ATOMIC으로 취소 불가능한 정리 작업
    val cleanupJob = launch(start = CoroutineStart.ATOMIC) {
        println("중요 리소스 정리 시작")
        delay(50)
        println("중요 리소스 정리 완료")
    }
    
    // 3. UNDISPATCHED로 현재 스레드에서 즉시 계산
    launch(Dispatchers.IO, start = CoroutineStart.UNDISPATCHED) {
        val result = performQuickCalculation() // 현재 스레드에서 실행
        println("빠른 계산 결과: $result")
        
        delay(10) // 중단점 이후 IO 디스패처로 전환
        performLongRunningTask() // IO 스레드에서 실행
    }
    
    // 모든 결과 수집
    println("Task 1: ${task1.await()}")
    println("Task 2: ${task2.await()}")
    cleanupJob.join()
}
```

- 이 복합 예제는 다양한 CoroutineStart 옵션을 상황에 맞게 활용하는 방법을 보여줍니다.
- 각 옵션의 특성을 이해하고 적절히 조합하면 더 효율적이고 안정적인 비동기 코드를 작성할 수 있습니다.