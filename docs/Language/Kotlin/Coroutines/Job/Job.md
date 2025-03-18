---
title: "Job과 Deferred"
description: "코틀린 코루틴의 핵심 요소인 Job과 Deferred에 대해 자세히 알아봅니다. Job의 기본 개념부터 실전 활용법까지 단계별로 설명하며, 안드로이드 개발에서 비동기 작업을 효과적으로 관리하는 방법을 다룹니다. 생명주기, 상태 전환, 취소 메커니즘 등 Job의 모든 측면을 코드 예제와 함께 살펴봅니다."
tags: [ "COROUTINE", "JOB", "DEFERRED", "KOTLIN", "CONCURRENCY", "ANDROID", "BACKEND" ]
keywords: [ "코틀린", "kotlin", "코루틴", "coroutine", "코틀린 코루틴", "kotlin coroutines", "잡", "job", "디퍼드", "deferred", "비동기", "asynchronous", "동시성", "concurrency", "생명주기", "lifecycle", "취소", "cancellation", "안드로이드", "android", "백엔드", "backend", "kotlinx.coroutines", "structured concurrency", "구조적 동시성" ]
draft: false
hide_title: true
---

## 1. 코루틴 Job 소개

- 코틀린 코루틴 라이브러리에서 Job은 비동기 작업의 생명주기를 관리하는 핵심 요소입니다.
- Job은 코루틴 실행의 결과를 표현하며, 실행 중인 코루틴을 제어할 수 있는 핸들(handle)을 제공합니다.
- Job 인터페이스는 `kotlinx.coroutines` 패키지의 일부로, 코루틴의 상태 확인, 완료 대기, 취소 등의 기능을 제공합니다.

### 1.1 Job의 정의와 역할

- Job은 생명주기를 가진 취소 가능한 작업의 개념을 추상화합니다.
- 기본적으로 코루틴 빌더(`launch`, `async` 등)는 Job을 반환하거나 내부적으로 Job을 가지고 있습니다.
- Job의 주요 역할:
	- 코루틴의 상태 추적
	- 코루틴의 취소 및 예외 처리
	- 코루틴 완료 대기
	- 부모-자식 관계 관리(구조적 동시성)

### 1.2 Job 인터페이스의 특성

- Job은 인터페이스로, 다음과 같은 주요 프로퍼티와 메서드를 제공합니다:
	- `isActive`: 코루틴이 활성 상태인지 확인
	- `isCompleted`: 코루틴이 완료되었는지 확인
	- `isCancelled`: 코루틴이 취소되었는지 확인
	- `cancel()`: 코루틴 취소
	- `join()`: 코루틴 완료 대기
	- `children`: 자식 코루틴 목록

### 1.3 Deferred와 Job의 관계

- `Deferred<T>`는 Job의 하위 인터페이스로, 비동기 작업의 결과를 제공합니다.
- `async` 코루틴 빌더는 `Deferred<T>` 객체를 반환합니다.
- Deferred는 Job의 모든 기능을 상속하면서 추가로 결과값을 처리하는 기능을 제공합니다.
- Deferred가 제공하는 주요 메서드:
	- `await()`: 코루틴이 완료될 때까지 대기하고 결과를 반환
	- `getCompleted()`: 코루틴이 이미 완료된 경우 결과를 즉시 반환 (완료되지 않은 경우 예외 발생)

```kotlin
// Job과 Deferred의 관계 비교
fun main() = runBlocking {
    // Job을 반환하는 launch
    val job = launch {
        delay(1000)
        println("Job 완료")
        // 반환값이 없음
    }
    
    // Deferred<Int>를 반환하는 async
    val deferred = async {
        delay(1000)
        println("Deferred 완료")
        42 // 반환값
    }
    
    job.join() // 완료만 대기, 반환값 없음
    val result = deferred.await() // 완료 대기 및 결과값(42) 반환
    
    println("Job은 완료 여부만 알 수 있음: ${job.isCompleted}")
    println("Deferred는 완료 여부와 결과값을 모두 알 수 있음: ${deferred.isCompleted}, 결과: $result")
}
```

## 2. Job의 생명주기

- Job은 명확한 생명주기를 가지며, 여러 상태 간의 전환이 이루어집니다.
- 이 생명주기를 이해하는 것은 코루틴을 효과적으로 관리하는 데 필수적입니다.

### 2.1 Job의 상태

- Job은 다음과 같은 상태를 가질 수 있습니다:
  - New, Active, Completing, Completed, Cancelling, Cancelled
- **New**
  - 생성된 상태(active=false, completed=false, cancelled=false)
- **Active**
  - 활성 상태(active=true, completed=false, cancelled=false)
- **Completing**
  - 완료 중인 상태(active=true, completed=false, cancelled=false)
  - 부모 코루틴의 모든 코드가 실행되었지만 아직 완료되지 않은 상태입니다.
  - 완료 중인 상태의 부모 코루틴은 모든 자식 코루틴이 완료되면 Completed 상태로 전환됩니다.
- **Completed**: 정상적으로 완료된 상태(active=false, completed=true, cancelled=false)
- **Cancelling**: 취소 중인 상태(active=false, completed=false, cancelled=true)
- **Cancelled**: 취소된 상태(active=false, completed=true, cancelled=true)

### 2.2 상태 전이 다이어그램

- Job의 상태는 다음과 같은 순서로 전이됩니다:
	- New → Active → Completing → Completed
	- New → Active → Cancelling → Cancelled
	- New → Cancelling → Cancelled

## 3. Job 생성과 기본 사용법

- Job을 생성하고 사용하는 방법은 크게 세 가지로 나눌 수 있습니다.
- 코루틴 빌더를 통한 간접 생성, Job() 생성자를 통한 직접 생성, SupervisorJob을 통한 생성이 있습니다.

### 3.1 코루틴 빌더를 통한 Job 생성

- `launch`나 `async`와 같은 코루틴 빌더는 Job 인스턴스를 반환합니다.
- 이렇게 생성된 Job을 통해 코루틴의 상태를 확인하고 취소할 수 있습니다.

#### launch로 Job 생성하기

```kotlin
fun main() = runBlocking {
    // launch는 Job을 반환합니다
    val job = launch {
        println("코루틴 시작")
        delay(1000)
        println("코루틴 완료")
    }
    
    println("Job 상태: isActive = ${job.isActive}")
    
    job.join() // 코루틴 완료 대기
    println("작업 완료 후 상태: isCompleted = ${job.isCompleted}")
}
```

이 코드는 `launch` 코루틴 빌더를 사용하여 Job을 생성하고, 코루틴의 상태를 확인하는 방법을 보여줍니다.

#### async로 Deferred 생성하기

```kotlin
fun main() = runBlocking {
    // async는 Deferred<T>를 반환하며, 이는 Job의 하위 타입입니다
    val deferred = async {
        println("비동기 계산 시작")
        delay(1000)
        println("비동기 계산 완료")
        42 // 반환값
    }
    
    println("Deferred 상태: isActive = ${deferred.isActive}")
    
    val result = deferred.await() // 결과 대기
    println("계산 결과: $result")
    println("작업 완료 후 상태: isCompleted = ${deferred.isCompleted}")
}
```

`async`는 `Deferred<T>` 타입을 반환하며, 이는 Job의 하위 타입으로 결과값을 제공합니다.

### 3.2 Job() 생성자 사용

- `Job()`을 직접 호출하여 새로운 Job 인스턴스를 생성할 수 있습니다.
- 이렇게 생성된 Job은 초기에 활성 상태가 아니며, 자식 코루틴을 위한 부모 Job으로 주로 사용됩니다.

```kotlin
fun main() = runBlocking {
    // 새 Job 인스턴스 생성
    val parentJob = Job()
    
    // parentJob을 부모로 하는 코루틴 시작
    val childJob = launch(parentJob) {
        println("자식 코루틴 시작")
        delay(1000)
        println("자식 코루틴 완료")
    }
    
    println("부모 Job 상태: isActive = ${parentJob.isActive}")
    println("자식 Job 상태: isActive = ${childJob.isActive}")
    
    // 부모 Job 취소 - 모든 자식도 취소됨
    parentJob.cancel()
    delay(100) // 취소 처리 시간을 위한 짧은 대기
    
    println("취소 후 부모 Job 상태: isCancelled = ${parentJob.isCancelled}")
    println("취소 후 자식 Job 상태: isCancelled = ${childJob.isCancelled}")
}
```

이 예제는 부모 Job을 생성하고 자식 코루틴을 시작한 후, 부모 Job을 취소하여 자식 코루틴도 함께 취소되는 것을 보여줍니다.

### 3.3 SupervisorJob 사용

- `SupervisorJob`은 일반 Job과 유사하지만, 자식 코루틴의 실패가 다른 자식이나 부모에게 전파되지 않는 특별한 Job입니다.
- 여러 독립적인 작업을 관리할 때 유용합니다.

```kotlin
fun main() = runBlocking {
    // SupervisorJob 생성
    val supervisorJob = SupervisorJob()
    
    val scope = CoroutineScope(coroutineContext + supervisorJob)
    
    // 첫 번째 자식 코루틴 (예외 발생)
    val job1 = scope.launch {
        delay(500)
        println("자식 1 실행 중")
        throw RuntimeException("자식 1 실패")
    }
    
    // 두 번째 자식 코루틴
    val job2 = scope.launch {
        delay(1000)
        println("자식 2 실행 완료") // 여전히 실행됨
    }
    
    delay(1500) // 모든 코루틴이 실행될 시간 허용
    
    println("SupervisorJob 상태: isCancelled = ${supervisorJob.isCancelled}")
    println("자식 1 상태: isCancelled = ${job1.isCancelled}")
    println("자식 2 상태: isCompleted = ${job2.isCompleted}")
    
    // 정리
    supervisorJob.cancel()
}
```

이 예제는 `SupervisorJob`을 사용하여 하나의 자식 코루틴이 실패해도 다른 자식이 계속 실행되도록 하는 방법을 보여줍니다.

## 4. Job 취소 메커니즘

- 코루틴의 취소는 협력적(cooperative)입니다.
- 코루틴 코드는 취소 신호를 확인하고 적절히 대응해야 합니다.

### 4.1.기본 취소 방법

- Job의 `cancel()` 메서드를 호출하여 코루틴을 취소할 수 있습니다.
- 취소는 코루틴이 일시 중단 지점(suspension point)에 도달했을 때 효과가 있습니다.

```kotlin
fun main() = runBlocking {
    val job = launch {
        repeat(1000) { i ->
            println("작업 진행 중... $i")
            delay(100) // 일시 중단 지점
        }
    }
    
    delay(300) // 3번 출력할 시간을 줌
    println("취소 요청")
    job.cancel() // 취소 요청
    job.join() // 취소 완료 대기
    println("취소 완료")
}
```

이 예제는 코루틴을 시작하고 일정 시간 후에 취소하는 기본적인 방법을 보여줍니다.

### 4.2 취소 확인 및 협력

- 계산 작업과 같이 일시 중단 지점이 없는 코드는 명시적으로 취소 상태를 확인해야 합니다.
- `isActive` 프로퍼티나 `ensureActive()` 메서드를 사용하여 취소 상태를 확인할 수 있습니다.

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()
    
    val job = launch {
        var nextPrintTime = startTime
        var i = 0
        
        // 취소 상태를 확인하는 계산 집약적 루프
        while (isActive) { // 취소되면 루프 종료
            if (System.currentTimeMillis() >= nextPrintTime) {
                println("작업 진행 중... ${i++}")
                nextPrintTime += 100L
            }
        }
    }
    
    delay(300) // 몇 개의 메시지가 출력될 시간 허용
    println("취소 요청")
    job.cancel()
    println("취소 완료")
}
```

이 예제는 계산 집약적인 루프에서 `isActive` 프로퍼티를 확인하여 취소에 협력하는 방법을 보여줍니다.

### 4.3 취소와 예외 처리

- 코루틴 취소는 내부적으로 `CancellationException`을 던져 구현됩니다.
- 이 예외는 정상적인 종료로 간주되어 부모 코루틴에게 전파되지 않습니다.
- `try-finally` 블록을 사용하여 취소 시 정리 작업을 수행할 수 있습니다.

```kotlin
fun main() = runBlocking {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("작업 진행 중... $i")
                delay(100)
            }
        } finally {
            // 취소된 경우에도 실행됨
            println("작업 정리 중...")
            delay(100) // 오류: 취소된 코루틴에서 지연 시도
        }
    }
    
    delay(300)
    println("취소 요청")
    job.cancel()
    job.join()
    println("취소 완료")
}
```

이 코드는 오류를 발생시킵니다. 왜냐하면 취소된 코루틴에서 `delay()`와 같은 일시 중단 함수를 호출하면 `CancellationException`이 다시 발생하기 때문입니다.

### 4.4 취소 중 정리 작업 수행하기

- `withContext(NonCancellable)`을 사용하여 취소가 불가능한 블록을 만들 수 있습니다.
- 이 블록 내에서는 취소 상태에 관계없이 일시 중단 함수를 안전하게 호출할 수 있습니다.

```kotlin
fun main() = runBlocking {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("작업 진행 중... $i")
                delay(100)
            }
        } finally {
            withContext(NonCancellable) {
                println("정리 작업 시작...")
                delay(300) // 취소 상태에서도 안전하게 지연 가능
                println("정리 작업 완료")
            }
        }
    }
    
    delay(300)
    println("취소 요청")
    job.cancel()
    job.join()
    println("메인: 이제 정리 작업이 완료됨")
}
```

이 예제는 `NonCancellable` 컨텍스트를 사용하여 취소된 코루틴에서도 안전하게 정리 작업을 수행하는 방법을 보여줍니다.

## 5. Deferred의 고급 활용법

### 5.1 Deferred와 결과 처리

- `Deferred<T>`는 비동기 계산의 결과를 처리하는 다양한 방법을 제공합니다.
- `await()` 외에도 여러 유용한 확장 함수를 사용할 수 있습니다.

```kotlin
fun main() = runBlocking {
    val deferred = async {
        delay(1000)
        "결과값"
    }
    
    // 기본적인 await()
    val result = deferred.await()
    println("기본 await 결과: $result")
    
    // 타임아웃과 함께 사용
    val deferredWithTimeout = async {
        delay(2000)
        "지연된 결과"
    }
    
    try {
        // 500ms 타임아웃으로 await
        val timeoutResult = withTimeout(500) {
            deferredWithTimeout.await()
        }
        println("타임아웃 내에 결과 받음: $timeoutResult")
    } catch (e: TimeoutCancellationException) {
        println("타임아웃 발생: ${e.message}")
    }
    
    // awaits 함수로 여러 Deferred 결과 기다리기
    val deferred1 = async { delay(100); "첫 번째" }
    val deferred2 = async { delay(200); "두 번째" }
    val allResults = awaitAll(deferred1, deferred2)
    println("모든 결과: $allResults")
}
```

### 5.2 예외 처리와 Deferred

- Deferred 작업에서 예외가 발생하면 `await()` 호출 시 해당 예외가 다시 발생합니다.
- `async`에서 예외를 처리하는 방법은 여러 가지가 있습니다.

```kotlin
fun main() = runBlocking {
    // 1. try-catch를 async 내부에서 사용
    val deferred1 = async {
        try {
            throw RuntimeException("내부 오류")
            "성공" // 도달하지 않음
        } catch (e: Exception) {
            "오류 처리됨: ${e.message}"
        }
    }
    
    println("내부 처리된 결과: ${deferred1.await()}")
    
    // 2. await 호출 시 예외 처리
    val deferred2 = async {
        delay(100)
        throw RuntimeException("외부에서 처리할 오류")
        "성공" // 도달하지 않음
    }
    
    try {
        println("결과: ${deferred2.await()}")
    } catch (e: Exception) {
        println("외부에서 예외 처리: ${e.message}")
    }
    
    // 3. SupervisorJob을 사용하여 개별 오류 격리
    val supervisor = SupervisorJob()
    val scope = CoroutineScope(coroutineContext + supervisor)
    
    val deferred3 = scope.async {
        delay(100)
        throw RuntimeException("독립적인 오류")
        "독립적인 결과" // 도달하지 않음
    }
    
    val deferred4 = scope.async {
        delay(200)
        "정상 완료"
    }
    
    try {
        deferred3.await()
    } catch (e: Exception) {
        println("deferred3 오류: ${e.message}")
    }
    
    println("deferred4 결과: ${deferred4.await()}")
    
    supervisor.cancel() // 정리
}
```

### 5.3 Deferred와 비동기 시퀀스 처리

- `async`와 `Deferred`를 사용하여 비동기 시퀀스 처리를 구현할 수 있습니다.
- 이는 일련의 작업을 병렬로 실행하고 결과를 순차적으로 처리할 때 유용합니다.

```kotlin
fun main() = runBlocking {
    // ID 목록
    val ids = listOf("user1", "user2", "user3", "user4", "user5")
    
    // 비동기로 모든 사용자 정보를 가져오기
    val deferredUsers = ids.map { id ->
        async {
            fetchUserInfo(id) // 가상의 사용자 정보 조회 함수
        }
    }
    
    // 결과를 순차적으로 처리
    val users = deferredUsers.awaitAll()
    
    // 추가 처리
    val processedUsers = users.mapIndexed { index, user ->
        "처리된 ${index + 1}번째 사용자: $user"
    }
    
    processedUsers.forEach { println(it) }
}

// 가상의 사용자 정보 조회 함수
suspend fun fetchUserInfo(id: String): String {
    delay(100) // 네트워크 지연 시뮬레이션
    return "사용자 $id의 정보"
}
```

## 6. Job과 구조적 동시성

- 구조적 동시성(Structured Concurrency)은 코루틴의 핵심 개념 중 하나입니다.
- 부모-자식 관계를 통해 코루틴의 생명주기가 계층적으로 관리됩니다.

### 6.1 부모-자식 관계

- 코루틴 스코프 내에서 시작된 모든 코루틴은 해당 스코프의 자식이 됩니다.
- 부모 코루틴이 취소되면 모든 자식 코루틴도 자동으로 취소됩니다.
- 자식 코루틴이 실패하면 부모 코루틴(및 다른 모든 자식)도 취소됩니다.

```kotlin
fun main() = runBlocking {
    // 부모 코루틴
    val parentJob = launch {
        println("부모: 시작")
        
        // 첫 번째 자식
        launch {
            println("자식 1: 시작")
            delay(800)
            println("자식 1: 완료") // 출력되지 않음
        }
        
        // 두 번째 자식
        launch {
            println("자식 2: 시작")
            delay(300)
            println("자식 2: 실패")
            throw RuntimeException("자식 2 오류")
        }
        
        delay(1000)
        println("부모: 완료") // 출력되지 않음
    }
    
    parentJob.join() // 예외로 인해 일찍 완료됨
    println("메인: 완료")
}
```

이 예제는 자식 코루틴이 실패하면 부모와 다른 모든 자식도 취소되는 구조적 동시성의 기본 원칙을 보여줍니다.

### 6.2 예외 처리와 SupervisorJob

- `SupervisorJob`을 사용하면 자식 코루틴의 실패가 부모와 다른 자식에게 전파되지 않습니다.
- 이를 통해 여러 독립적인 작업을 안전하게 실행할 수 있습니다.

```kotlin
fun main() = runBlocking {
    val supervisor = SupervisorJob()
    
    with(CoroutineScope(coroutineContext + supervisor)) {
        // 첫 번째 자식
        val firstChild = launch {
            println("첫 번째 자식: 시작")
            delay(500)
            println("첫 번째 자식: 오류 발생")
            throw RuntimeException("첫 번째 자식 실패")
        }
        
        // 두 번째 자식
        val secondChild = launch {
            println("두 번째 자식: 시작")
            delay(1000)
            println("두 번째 자식: 완료") // 여전히 출력됨
        }
        
        delay(1500) // 모든 코루틴이 완료될 시간 허용
        
        // 상태 확인
        println("첫 번째 자식: ${if (firstChild.isCancelled) "취소됨" else "활성"}")
        println("두 번째 자식: ${if (secondChild.isCompleted) "완료됨" else "활성"}")
    }
    
    supervisor.cancel() // 스코프 정리
    println("완료")
}
```

이 예제는 `SupervisorJob`을 사용하여 하나의 자식 코루틴 실패가 다른 자식에게 영향을 주지 않는 방법을 보여줍니다.

### 6.3 Job 계층 구조 관리

- `coroutineContext[Job]`를 사용하여 현재 코루틴의 Job에 접근할 수 있습니다.
- `job.children`을 사용하여 자식 코루틴 목록을 얻을 수 있습니다.
- `job.parent`를 사용하여 부모 Job에 접근할 수 있습니다.

```kotlin
fun main() = runBlocking {
    val parentJob = launch {
        println("부모 시작, Job: ${coroutineContext[Job]}")
        
        // 자식 코루틴들 시작
        val children = List(3) { index ->
            launch {
                println("자식 $index 시작, 부모: ${coroutineContext[Job]?.parent}")
                delay(1000)
                println("자식 $index 완료")
            }
        }
        
        // 자식 목록 출력
        println("활성 자식 코루틴: ${coroutineContext[Job]?.children?.count()}")
        
        delay(1500) // 모든 자식이 완료될 때까지 기다림
        println("부모 완료")
    }
    
    parentJob.join()
    println("모든 코루틴 완료")
}
```

이 예제는 Job 계층 구조를 탐색하고 관리하는 방법을 보여줍니다.