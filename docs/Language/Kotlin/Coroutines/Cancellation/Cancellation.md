---
title: "Cancellation"
description: "코틀린 코루틴의 취소 메커니즘에 대해 상세히 알아봅니다. 취소의 기본 원리부터 고급 패턴까지 단계별로 설명하며, 취소가 어떻게 구현되고 어떤 방식으로 코루틴 계층에 전파되는지 살펴봅니다. 취소의 협력적 특성, 예외 처리, 자원 정리, 그리고 실제 프로젝트에서의 활용 방법을 코드 예제와 함께 제공합니다."
tags: ["COROUTINE", "CANCELLATION", "KOTLIN", "CONCURRENCY", "ANDROID", "BACKEND"]
keywords: ["코틀린", "kotlin", "코루틴", "coroutine", "코틀린 코루틴", "kotlin coroutines", "취소", "cancellation", "취소 전파", "cancellation propagation", "코루틴 취소", "coroutine cancellation", "비동기", "asynchronous", "동시성", "concurrency", "예외 처리", "exception handling", "자원 정리", "resource cleanup", "안드로이드", "android", "백엔드", "backend", "구조적 동시성", "structured concurrency", "CancellationException", "isActive", "ensureActive", "NonCancellable"]
draft: false
hide_title: true
---

## 1. 코루틴 취소의 기본 개념

- 코틀린 코루틴의 취소(Cancellation)는 실행 중인 비동기 작업을 안전하게 중단하는 메커니즘입니다.
- 사용자가 작업을 취소하거나, 타임아웃이 발생하거나, 오류가 발생할 때 코루틴을 취소해야 하는 상황이 자주 발생합니다.
- 코루틴 취소는 코루틴 라이브러리의 핵심 기능으로, 자원 낭비를 방지하고 앱의 응답성을 유지하는 데 중요합니다.

### 1.1 취소가 필요한 이유

- 실행 중인 작업이 더 이상 필요하지 않을 때 시스템 자원을 절약합니다.
- 사용자 경험을 향상시킵니다 - 사용자가 요청한 작업을 즉시 중단할 수 있습니다.
- 메모리 누수를 방지합니다 - 더 이상 필요하지 않은 작업이 계속 실행되면 메모리 누수가 발생할 수 있습니다.
- 오류 처리를 단순화합니다 - 작업 중 오류가 발생했을 때 관련된 모든 작업을 깔끔하게 정리할 수 있습니다.

### 1.2 코루틴 취소의 특성

- **협력적(Cooperative)**: 코루틴 취소는 강제적이지 않고 협력적입니다. 코루틴은 취소 신호를 확인하고 스스로 종료해야 합니다.
- **구조적(Structured)**: 부모-자식 관계에 따라 취소가 전파됩니다. 부모가 취소되면 모든 자식도 취소됩니다.
- **예외 기반(Exception-based)**: 취소는 내부적으로 `CancellationException`을 사용하여 구현됩니다.
- **선언적(Declarative)**: 복잡한 콜백 없이 간결하게 취소 로직을 작성할 수 있습니다.

## 2. 코루틴 취소의 작동 방식

- 코루틴 취소는 복잡한 내부 메커니즘을 가지고 있지만, 사용자 관점에서는 비교적 간단합니다.
- 취소의 핵심 개념과 내부 작동 방식을 이해하면 효과적으로 활용할 수 있습니다.

### 2.1 취소의 기본 흐름

1. `Job.cancel()` 또는 관련 메서드가 호출됩니다.
2. Job의 상태가 '취소 중(Cancelling)'으로 변경됩니다.
3. `CancellationException`이 코루틴 내부로 전파됩니다.
4. 코루틴이 다음 일시 중단 지점(suspension point)에 도달하면 예외가 발생합니다.
5. 코루틴이 예외를 처리하고 정리 작업을 수행합니다.
6. Job의 상태가 '취소됨(Cancelled)'으로 변경됩니다.

:::info[Job 상태 변화]
취소 시 Job 상태 전이: Active → Cancelling → Cancelled
:::

### 2.2 취소와 CancellationException

- 코루틴 취소는 내부적으로 `CancellationException`을 사용하여 구현됩니다.
- 이는 일반 예외와 달리 코루틴의 정상적인 종료로 간주되어 부모 코루틴에게 전파되지 않습니다.
- 개발자는 이 예외를 직접 처리하거나 무시할 수 있습니다.

```kotlin
fun main() = runBlocking {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("코루틴 실행 중... $i")
                delay(500)
            }
        } catch (e: CancellationException) {
            println("코루틴이 취소되었습니다: ${e.message}")
            throw e // 재전파하는 것이 일반적인 관행입니다
        }
    }
    
    delay(1300) // 일부 반복 실행 후
    println("취소 요청")
    job.cancel("사용자에 의한 취소") // 취소 이유 지정
    job.join() // 취소 완료 대기
    
    println("메인 코루틴 종료")
}
```
이 예제에서는 코루틴을 시작하고 일정 시간 후에 취소합니다. 코루틴은 `CancellationException`을 포착하여 메시지를 출력하고 다시 던집니다.

### 2.3 취소의 협력적 특성

- 코루틴 취소는 협력적입니다. 즉, 코루틴 코드가 취소에 협력해야 합니다.
- 코루틴은 다음 방법 중 하나로 취소에 협력할 수 있습니다:
	- 일시 중단 함수(`delay()`, `yield()` 등) 호출하기
	- 명시적으로 취소 상태 확인하기(`isActive`, `ensureActive()`)

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()
    
    val job = launch {
        var nextPrintTime = startTime
        var i = 0
        
        // 계산 집약적인 루프 - 취소를 확인해야 함
        while (i < 5 && isActive) { // isActive로 취소 상태 확인
            if (System.currentTimeMillis() >= nextPrintTime) {
                println("코루틴 실행 중... ${i++}")
                nextPrintTime += 500L
            }
        }
        
        // 대안: ensureActive() 사용
        // while (i < 5) {
        //     ensureActive() // 취소되었으면 CancellationException 발생
        //     // 계산 작업
        // }
    }
    
    delay(1300)
    println("취소 요청")
    job.cancel()
    job.join()
    
    println("메인 코루틴 종료")
}
```
이 예제는 계산 집약적인 루프에서 `isActive` 프로퍼티를 확인하여 취소에 협력하는 방법을 보여줍니다.

## 3. 코루틴 취소 방법

- 코루틴을 취소하는 다양한 방법과 각 방법의 특징에 대해 알아보겠습니다.

### 3.1 Job.cancel() 사용

- 가장 기본적인 취소 방법은 `Job.cancel()`을 호출하는 것입니다.
- 선택적으로 취소 이유를 문자열이나 예외로 전달할 수 있습니다.

```kotlin
fun main() = runBlocking {
    val job = launch {
        repeat(100) { i ->
            println("작업 $i 실행 중...")
            delay(100)
        }
    }
    
    delay(300) // 몇 개의 작업이 실행될 시간 허용
    
    // 기본 취소
    // job.cancel()
    
    // 취소 이유 지정
    job.cancel("더 이상 필요하지 않음")
    
    // 사용자 정의 예외로 취소
    // job.cancel(CancellationException("사용자가 취소 버튼을 클릭함"))
    
    job.join() // 취소 완료 대기
    println("취소 후 상태: ${if (job.isCancelled) "취소됨" else "활성"}")
}
```
이 예제는 `cancel()` 메서드를 사용하여 코루틴을 취소하는 다양한 방법을 보여줍니다.

### 3.2 cancelAndJoin() 사용

- `cancel()`과 `join()`을 순차적으로 호출하는 것은 일반적인 패턴입니다.
- 이를 단순화하기 위해 `cancelAndJoin()` 확장 함수를 사용할 수 있습니다.

```kotlin
fun main() = runBlocking {
    val job = launch {
        repeat(100) { i ->
            println("작업 $i 실행 중...")
            delay(100)
        }
    }
    
    delay(300)
    
    // cancel()과 join()을 한 번에 호출
    job.cancelAndJoin()
    
    println("취소 완료")
}
```
이 예제는 `cancelAndJoin()`을 사용하여 코루틴을 취소하고 완료를 대기하는 간결한 방법을 보여줍니다.

### 3.3 withTimeout() 사용

- 작업이 지정된 시간 내에 완료되지 않으면 자동으로 취소되어야 할 때 `withTimeout()`을 사용할 수 있습니다.
- 타임아웃이 발생하면 `TimeoutCancellationException`(CancellationException의 하위 클래스)이 발생합니다.

```kotlin
fun main() = runBlocking {
    try {
        val result = withTimeout(1000L) {
            repeat(50) { i ->
                println("작업 $i 실행 중...")
                delay(100)
            }
            "완료" // 반환값 (도달하지 않음)
        }
        println("결과: $result")
    } catch (e: TimeoutCancellationException) {
        println("타임아웃으로 인해 취소됨")
    }
    
    // 예외를 피하려면 withTimeoutOrNull 사용
    val result = withTimeoutOrNull(1000L) {
        repeat(50) { i ->
            println("작업 $i 실행 중...")
            delay(100)
        }
        "완료" // 반환값 (도달하지 않음)
    }
    
    println("결과: ${result ?: "타임아웃"}")
}
```
이 예제는 `withTimeout()`과 `withTimeoutOrNull()`을 사용하여 작업에 시간 제한을 설정하는 방법을 보여줍니다.

### 3.4 코루틴 스코프 취소

- `CoroutineScope.cancel()`을 호출하면 해당 스코프에서 시작된 모든 코루틴이 취소됩니다.
- 이는 관련된 여러 작업을 한 번에 취소할 때 유용합니다.

```kotlin
fun main() = runBlocking {
    val scope = CoroutineScope(Job())
    
    // 여러 코루틴 시작
    scope.launch {
        delay(100)
        println("첫 번째 코루틴")
        delay(1000)
        println("이 메시지는 출력되지 않습니다")
    }
    
    scope.launch {
        delay(200)
        println("두 번째 코루틴")
        delay(1000)
        println("이 메시지도 출력되지 않습니다")
    }
    
    delay(300) // 첫 번째 출력이 표시될 시간 허용
    
    // 스코프 취소 - 모든 코루틴 취소
    scope.cancel()
    
    // 모든 코루틴 완료 대기
    scope.coroutineContext[Job]?.join()
    
    println("모든 코루틴이 취소되었습니다")
}
```
이 예제는 코루틴 스코프를 취소하여 해당 스코프에서 시작된 모든 코루틴을 한 번에 취소하는 방법을 보여줍니다.

## 4. 취소와 예외 처리

- 코루틴 취소와 예외 처리는 밀접하게 관련되어 있습니다.
- 취소는 내부적으로 예외를 사용하여 구현되며, 예외 처리 메커니즘과 함께 작동합니다.

### 4.1 CancellationException과 다른 예외

- `CancellationException`은 코루틴의 정상적인 취소를 나타내며, 부모 코루틴에게 전파되지 않습니다.
- 다른 예외는 오류 상태를 나타내며, 부모 코루틴에게 전파되어 부모도 취소시킵니다.

```kotlin
fun main() = runBlocking {
    val parentJob = launch {
        // 첫 번째 자식 (정상 취소)
        val child1 = launch {
            try {
                delay(1000)
                println("첫 번째 자식: 이 메시지는 출력되지 않습니다")
            } catch (e: CancellationException) {
                println("첫 번째 자식: 취소됨")
                // throw e // 재전파 (선택 사항)
            }
        }
        
        // 두 번째 자식 (예외 발생)
        val child2 = launch {
            try {
                delay(500)
                throw RuntimeException("두 번째 자식에서 오류 발생")
            } catch (e: Exception) {
                if (e is CancellationException) {
                    println("두 번째 자식: 취소됨")
                } else {
                    println("두 번째 자식: 예외 발생 - ${e.message}")
                    throw e // 재전파 (중요)
                }
            }
        }
        
        // 세 번째 자식
        val child3 = launch {
            delay(800)
            println("세 번째 자식: 작업 중...")
            try {
                delay(1000)
                println("세 번째 자식: 이 메시지는 출력되지 않습니다")
            } catch (e: CancellationException) {
                println("세 번째 자식: 취소됨")
            }
        }
        
        // 자식 완료 대기
        try {
            child1.join()
            child2.join() // 여기서 예외가 발생함
            child3.join()
            println("부모: 모든 자식 완료됨")
        } catch (e: Exception) {
            println("부모: 자식에서 예외 발생 - ${e.message}")
        }
    }
    
    parentJob.join()
    println("메인: 완료")
}
```
이 예제는 `CancellationException`과 다른 예외가 코루틴 계층에서 어떻게 다르게 처리되는지 보여줍니다.

### 4.2 try-finally 블록을 사용한 자원 정리

- 코루틴이 취소되더라도 `try-finally` 블록을 사용하여 자원을 정리할 수 있습니다.
- 그러나 취소된 코루틴에서는 일시 중단 함수를 호출할 수 없다는 점에 주의해야 합니다.

```kotlin
fun main() = runBlocking {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("코루틴 작업 $i")
                delay(100)
            }
        } finally {
            // 취소 여부에 관계없이 항상 실행됨
            println("자원 정리 시작")
            
            // 주의: 취소된 코루틴에서 delay()를 호출하면 CancellationException이 다시 발생함
            // delay(100) // 오류!
            
            println("자원 정리 완료")
        }
    }
    
    delay(300) // 일부 작업이 실행될 시간 허용
    job.cancel() // 코루틴 취소
    job.join() // 취소 완료 대기
    
    println("메인: 완료")
}
```
이 예제는 `try-finally` 블록을 사용하여 코루틴 취소 시 자원을 정리하는 방법을 보여줍니다.

### 4.3 NonCancellable 컨텍스트 사용

- 취소된 코루틴에서 일시 중단 함수를 안전하게 호출하려면 `NonCancellable` 컨텍스트를 사용할 수 있습니다.
- 이는 취소 불가능한 블록을 만들어 자원 정리와 같은 중요한 작업을 완료할 수 있게 합니다.

```kotlin
fun main() = runBlocking {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("코루틴 작업 $i")
                delay(100)
            }
        } finally {
            // NonCancellable 컨텍스트에서 실행
            withContext(NonCancellable) {
                println("자원 정리 시작")
                delay(300) // 이제 안전하게 호출 가능
                println("300ms 후: 자원 정리 완료")
            }
        }
    }
    
    delay(300) // 일부 작업이 실행될 시간 허용
    job.cancel() // 코루틴 취소
    job.join() // 취소 완료 대기
    
    println("메인: 완료")
}
```
이 예제는 `NonCancellable` 컨텍스트를 사용하여 취소된 코루틴에서도 안전하게 일시 중단 함수를 호출하는 방법을 보여줍니다.

## 5. 취소의 전파 및 구조적 동시성

- 코틀린 코루틴의 취소는 구조적 동시성 원칙에 따라 계층적으로 전파됩니다.
- 이러한 취소 전파 메커니즘을 이해하면 복잡한 비동기 작업을 효과적으로 관리할 수 있습니다.

### 5.1 부모에서 자식으로의 취소 전파

- 부모 코루틴이 취소되면 모든 자식 코루틴도 자동으로 취소됩니다.
- 이는 자원 누수를 방지하고 관련된 모든 작업이 함께 취소되도록 보장합니다.

```kotlin
fun main() = runBlocking {
    // 부모 코루틴
    val parentJob = launch {
        println("부모: 시작")
        
        // 첫 번째 자식
        launch {
            println("자식 1: 시작")
            delay(1000)
            println("자식 1: 이 메시지는 출력되지 않습니다")
        }
        
        // 두 번째 자식
        launch {
            println("자식 2: 시작")
            delay(1000)
            println("자식 2: 이 메시지도 출력되지 않습니다")
        }
        
        delay(200) // 자식들이 시작할 시간 허용
        println("부모: 진행 중")
    }
    
    delay(500) // 부모가 일부 작업을 수행할 시간 허용
    println("메인: 부모 취소 요청")
    
    // 부모 취소 - 모든 자식도 취소됨
    parentJob.cancel()
    parentJob.join()
    
    println("메인: 완료")
}
```
이 예제는 부모 코루틴이 취소되면 모든 자식 코루틴도 자동으로 취소되는 방식을 보여줍니다.

### 5.2 자식에서 부모로의 취소 전파

- 자식 코루틴에서 `CancellationException`이 아닌 예외가 발생하면 부모 코루틴(및 다른 모든 자식)이 취소됩니다.
- 이는 "실패는 빨리 전파되어야 한다"는 원칙을 따릅니다.

```kotlin
fun main() = runBlocking {
    // 부모 코루틴
    val parentJob = launch {
        println("부모: 시작")
        
        // 첫 번째 자식
        launch {
            println("자식 1: 시작")
            delay(500)
            println("자식 1: 작업 진행 중...")
            delay(1000)
            println("자식 1: 이 메시지는 출력되지 않습니다")
        }
        
        // 두 번째 자식 (예외 발생)
        launch {
            println("자식 2: 시작")
            delay(300)
            println("자식 2: 오류 발생")
            throw RuntimeException("자식 2에서 오류 발생")
        }
        
        // 세 번째 자식
        launch {
            println("자식 3: 시작")
            delay(400)
            println("자식 3: 이 메시지는 출력되지 않습니다")
        }
        
        delay(1500)
        println("부모: 이 메시지는 출력되지 않습니다")
    }
    
    try {
        parentJob.join()
    } catch (e: Exception) {
        println("메인: 부모 코루틴에서 예외 발생 - ${e.message}")
    }
    
    println("메인: 완료")
}
```
이 예제는 자식 코루틴에서 예외가 발생하면 부모 코루틴과 다른 모든 자식 코루틴이 취소되는 방식을 보여줍니다.

### 5.3 SupervisorJob으로 취소 전파 제한

- `SupervisorJob`을 사용하면 자식 코루틴의 실패가 부모와 다른 자식에게 전파되지 않도록 할 수 있습니다.
- 이는 독립적인 작업을 관리할 때 유용합니다.

```kotlin
fun main() = runBlocking {
    // SupervisorJob 사용
    val supervisor = SupervisorJob()
    
    with(CoroutineScope(coroutineContext + supervisor)) {
        // 첫 번째 자식
        val child1 = launch {
            println("자식 1: 시작")
            delay(500)
            println("자식 1: 작업 진행 중...")
            delay(500)
            println("자식 1: 완료")
        }
        
        // 두 번째 자식 (예외 발생)
        val child2 = launch {
            println("자식 2: 시작")
            delay(300)
            println("자식 2: 오류 발생")
            throw RuntimeException("자식 2에서 오류 발생")
        }
        
        // 세 번째 자식
        val child3 = launch {
            println("자식 3: 시작")
            delay(400)
            println("자식 3: 작업 진행 중...")
            delay(600)
            println("자식 3: 완료")
        }
        
        // 모든 자식이 완료(또는 취소)될 때까지 대기
        joinAll(child1, child2, child3)
    }
    
    // 정리
    supervisor.cancel()
    println("메인: 완료")
}
```
이 예제는 `SupervisorJob`을 사용하여 하나의 자식 코루틴 실패가 다른 자식 코루틴에게 영향을 주지 않도록 하는 방법을 보여줍니다.

### 5.4 supervisorScope 사용

- `supervisorScope`는 `SupervisorJob`을 사용하는 코루틴 스코프를 생성하는 더 간결한 방법입니다.
- 이는 특정 블록 내에서만 감독 동작이 필요할 때 유용합니다.

```kotlin
fun main() = runBlocking {
    println("메인: 시작")
    
    try {
        supervisorScope {
            // 첫 번째 자식
            val child1 = launch {
                println("자식 1: 시작")
                delay(500)
                println("자식 1: 작업 진행 중...")
                delay(500)
                println("자식 1: 완료")
            }
            
            // 두 번째 자식 (예외 발생)
            val child2 = launch {
                println("자식 2: 시작")
                delay(300)
                println("자식 2: 오류 발생")
                throw RuntimeException("자식 2에서 오류 발생")
            }
            
            // 모든 자식이 완료될 때까지 대기
            delay(1200)
            println("supervisorScope: 모든 비취소 자식 완료")
        }
        println("supervisorScope 블록 이후: 성공적으로 완료")
    } catch (e: Exception) {
        println("예외 포착: ${e.message}")
    }
    
    println("메인: 완료")
}
```
이 예제는 `supervisorScope`를 사용하여 특정 블록 내에서 감독 동작을 활성화하는 방법을 보여줍니다.

## 6. 실전 취소 패턴

- 실제 애플리케이션에서 코루틴 취소를 효과적으로 사용하는 몇 가지 일반적인 패턴을 살펴보겠습니다.

### 6.1 안드로이드에서의 생명주기 인식 취소

- 안드로이드 앱에서는 화면 전환, 기기 회전, 앱 백그라운드 전환 등으로 인해 작업을 취소해야 하는 경우가 많습니다.
- 코루틴을 적절한 생명주기 스코프에 연결하면 자동으로 취소를 처리할 수 있습니다.

```kotlin
class MyViewModel : ViewModel() {
    // viewModelScope는 ViewModel이 제거될 때 자동으로 취소됨
    fun loadData() {
        viewModelScope.launch {
            try {
                val result = repository.fetchData()
                _data.value = result
            } catch (e: CancellationException) {
                // 취소 처리 (필요한 경우)
                Log.d("MyViewModel", "데이터 로딩이 취소됨")
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }
}

class MyFragment : Fragment() {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // viewLifecycleOwner.lifecycleScope는 뷰가 파괴될 때 자동으로 취소됨
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                // UI 관련 작업
            } catch (e: CancellationException) {
                // 취소 처리
            }
        }
        
        // 특정 생명주기 상태에서만 실행
        viewLifecycleOwner.lifecycleScope.launchWhenResumed {
            // Fragment가 RESUMED 상태일 때만 실행되고, 
            // 다른 상태로 전환되면 자동으로 일시 중단됨
        }
    }
}
```
이 예제는 안드로이드의 다양한 생명주기 스코프를 사용하여 화면 전환이나 앱 상태 변화에 따라 코루틴을 자동으로 취소하는 방법을 보여줍니다.

### 6.2 사용자 작업 취소 구현

- 사용자가 파일 다운로드, 긴 계산, 네트워크 요청 등을 취소할 수 있도록 하는 UI를 구현할 때 코루틴 취소를 활용할 수 있습니다.
- 취소 버튼을 `Job.cancel()`에 연결하여 간단하게 구현할 수 있습니다.

```kotlin
class DownloadViewModel : ViewModel() {
    private var downloadJob: Job? = null
    
    private val _progress = MutableLiveData<Int>()
    val progress: LiveData<Int> = _progress
    
    private val _status = MutableLiveData<DownloadStatus>()
    val status: LiveData<DownloadStatus> = _status
    
    fun startDownload(url: String, destinationFile: File) {
        // 이미 실행 중인 다운로드가 있으면 취소
        downloadJob?.cancel()
        
        _status.value = DownloadStatus.STARTED
        
        downloadJob = viewModelScope.launch {
            try {
                // 다운로드 진행 상황 업데이트를 위한 Flow 수집
                fileDownloader.downloadFile(url, destinationFile)
                    .collect { progress ->
                        _progress.value = progress
                    }
                
                _status.value = DownloadStatus.COMPLETED
            } catch (e: CancellationException) {
                _status.value = DownloadStatus.CANCELLED
            } catch (e: Exception) {
                _status.value = DownloadStatus.ERROR
            }
        }
    }
    
    fun cancelDownload() {
        downloadJob?.cancel("사용자가 다운로드를 취소함")
        _status.value = DownloadStatus.CANCELLING
    }
    
    enum class DownloadStatus {
        IDLE, STARTED, CANCELLING, CANCELLED, COMPLETED, ERROR
    }
}

// UI에서 취소 버튼 처리
cancelButton.setOnClickListener {
    viewModel.cancelDownload()
}
```
이 예제는 다운로드와 같은 장시간 실행 작업에 취소 기능을 구현하는 방법을 보여줍니다.

### 6.3 타임아웃 및 백오프 전략

- 네트워크 요청이나 I/O 작업에 타임아웃을 설정하여 무한정 대기하는 것을 방지할 수 있습니다.
- 재시도 로직에 점진적 백오프를 구현하여 자원을 효율적으로 사용할 수 있습니다.

```kotlin
suspend fun fetchDataWithTimeout(api: Api): Result<Data> {
    return try {
        // 5초 타임아웃 설정
        withTimeout(5000L) {
            api.fetchData()
        }
        Result.success(data)
    } catch (e: TimeoutCancellationException) {
        Result.failure(e)
    } catch (e: Exception) {
        Result.failure(e)
    }
}

suspend fun fetchWithRetry(
    api: Api,
    maxAttempts: Int = 3,
    initialDelayMillis: Long = 1000
): Result<Data> {
    var currentDelay = initialDelayMillis
    
    repeat(maxAttempts) { attempt ->
        try {
            // 각 시도마다 타임아웃 설정
            val result = withTimeout(5000L) {
                api.fetchData()
            }
            return Result.success(result)
        } catch (e: TimeoutCancellationException) {
            if (attempt == maxAttempts - 1) return Result.failure(e)
            
            // 지수 백오프 (각 시도마다 지연 시간 2배 증가)
            delay(currentDelay)
            currentDelay *= 2
        } catch (e: Exception) {
            // 재시도할 필요가 없는 오류 (서버 4xx 오류 등)
            if (e is HttpException && e.code() in 400..499) {
                return Result.failure(e)
            }
            
            if (attempt == maxAttempts - 1) return Result.failure(e)
            
            // 재시도를 위한 지연
            delay(currentDelay)
            currentDelay *= 2
        }
    }
    
    // 이 부분에 도달하지 않아야 함
    return Result.failure(IllegalStateException("모든 재시도 실패"))
}
```
이 예제는 타임아웃과 지수 백오프를 사용하여 네트워크 요청을 더 안정적으로 만드는 방법을 보여줍니다.

### 6.4 부분 취소와 병렬 처리

- 여러 작업을 병렬로 실행할 때 일부만 취소해야 하는 경우가 있습니다.
- `async`와 개별 Job 관리를 통해 이를 구현할 수 있습니다.

```kotlin
suspend fun loadDashboardData(
    userApi: UserApi,
    statsApi: StatsApi,
    newsApi: NewsApi,
    timeout: Long = 5000L
): DashboardData = coroutineScope {
    // 세 API를 병렬로 호출
    val userDeferred = async {
        try {
            withTimeout(timeout) {
                userApi.getUserProfile()
            }
        } catch (e: Exception) {
            // 타임아웃이나 오류 시 기본값 반환
            UserProfile.DEFAULT
        }
    }
    
    val statsDeferred = async {
        try {
            withTimeout(timeout) {
                statsApi.getLatestStats()
            }
        } catch (e: Exception) {
            Stats.DEFAULT
        }
    }
    
    val newsDeferred = async {
        try {
            withTimeout(timeout) {
                newsApi.getLatestNews()
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    // 부분 취소 예시: 통계 데이터 로딩 취소
    if (shouldCancelStats()) {
        statsDeferred.cancel("통계 데이터가 필요하지 않음")
    }
    
    // 가능한 모든 데이터 수집
    val user = userDeferred.await()
    // 취소된 경우에도 await()는 안전하게 호출 가능 (기본값 반환)
    val stats = statsDeferred.await()
    val news = newsDeferred.await()
    
    DashboardData(user, stats, news)
}
```
이 예제는 여러 병렬 작업 중 일부만 선택적으로 취소하는 방법을 보여줍니다.

## 7. 취소의 모범 사례와 일반적인 함정

- 코루틴 취소를 효과적으로 사용하기 위한 모범 사례와 피해야 할 일반적인 함정을 살펴보겠습니다.

### 7.1 모범 사례

- **적절한 스코프 사용**: 코루틴을 적절한 생명주기 스코프에 연결하여 자동 취소를 활용하세요.
- **취소 상태 확인**: 계산 집약적인 코드에서는 주기적으로 `isActive`를 확인하거나 `ensureActive()`를 호출하세요.
- **자원 정리**: `try-finally` 블록과 필요에 따라 `NonCancellable` 컨텍스트를 사용하여 취소 시 자원을 정리하세요.
- **타임아웃 설정**: 장시간 실행 작업에는 `withTimeout()`을 사용하여 무한정 실행되는 것을 방지하세요.
- **예외 처리**: `CancellationException`과 다른 예외를 적절히 구분하여 처리하세요.

```kotlin
// 권장 패턴
suspend fun loadData(): Result<Data> = withContext(Dispatchers.IO) {
    try {
        // 주기적으로 취소 확인
        ensureActive()
        
        val result = api.fetchData()
        Result.success(result)
    } catch (e: CancellationException) {
        // 취소 예외는 다시 던져서 전파
        throw e
    } catch (e: Exception) {
        Result.failure(e)
    } finally {
        withContext(NonCancellable) {
            // 취소되더라도 실행되어야 하는 정리 코드
            closeResources()
        }
    }
}
```

### 7.2 일반적인 함정

- **취소 상태 무시**: 계산 집약적인 루프에서 취소 상태를 확인하지 않으면 즉시 취소되지 않습니다.
- **취소 예외 삼키기**: `CancellationException`을 포착하고 다시 던지지 않으면 취소가 전파되지 않습니다.
- **부적절한 컨텍스트**: 취소된 코루틴에서 `NonCancellable` 없이 일시 중단 함수를 호출하면 예외가 발생합니다.
- **전역 스코프 남용**: `GlobalScope`를 사용하면 생명주기와 연결되지 않아 자원 누수가 발생할 수 있습니다.
- **무한 재시도**: 취소 처리 로직이 없는 무한 재시도는 취소 신호를 무시할 수 있습니다.

```kotlin
// 피해야 할 패턴
fun loadDataInGlobalScope() {
    // 문제: 이 코루틴은 앱 생명주기와 연결되지 않음
    GlobalScope.launch {
        while (true) {
            try {
                val result = api.fetchData()
                // 처리...
                
                delay(1000)
            } catch (e: Exception) {
                // 문제: CancellationException도 여기서 포착됨
                Log.e("Error", "데이터 로드 실패", e)
                // 잠시 대기 후 재시도
                delay(5000)
                // 계속 재시도 (취소 무시)
            }
        }
    }
}
```
이 예제는 피해야 할 일반적인 패턴을 보여줍니다.

### 7.3 취소 가능한 I/O 작업

- I/O 작업은 종종 취소에 협력적이지 않을 수 있습니다.
- 이러한 작업을 취소 가능하게 만들기 위한 추가 단계가 필요할 수 있습니다.

```kotlin
suspend fun readFileWithCancellation(file: File): String = withContext(Dispatchers.IO) {
    val channel = AsynchronousFileChannel.open(file.toPath(), StandardOpenOption.READ)
    
    try {
        val buffer = ByteBuffer.allocate(4096)
        val stringBuilder = StringBuilder()
        
        var position = 0L
        
        while (isActive) { // 취소 확인
            ensureActive() // 명시적 취소 확인
            
            val bytesRead = channel.read(buffer, position).await()
            
            if (bytesRead <= 0) break
            
            buffer.flip()
            stringBuilder.append(Charsets.UTF_8.decode(buffer))
            buffer.clear()
            
            position += bytesRead
        }
        
        stringBuilder.toString()
    } finally {
        channel.close()
    }
}

// AsyncChannel 확장 함수 (CompletionHandler를 코루틴과 연결)
suspend fun <T> AsynchronousFileChannel.read(
    buffer: ByteBuffer,
    position: Long
): Int = suspendCancellableCoroutine { cont ->
    read(buffer, position, null, object : CompletionHandler<Int, Any?> {
        override fun completed(result: Int, attachment: Any?) {
            cont.resume(result)
        }
        
        override fun failed(exc: Throwable, attachment: Any?) {
            cont.resumeWithException(exc)
        }
    })
    
    // 취소 콜백 등록
    cont.invokeOnCancellation {
        try {
            if (isOpen) {
                close()
            }
        } catch (e: Exception) {
            // 닫기 실패 처리
        }
    }
}
```
이 예제는 저수준 I/O 작업을 취소 가능하게 만드는 방법을 보여줍니다.

## 8. 취소와 관련된 고급 주제

- 코루틴 취소와 관련된 몇 가지 고급 주제와 기술을 살펴보겠습니다.

### 8.1 CancellableContinuation 활용

- `suspendCancellableCoroutine`을 사용하여 취소 가능한 비동기 작업을 구현할 수 있습니다.
- 이를 통해 콜백 기반 API를 취소를 지원하는 일시 중단 함수로 변환할 수 있습니다.

```kotlin
suspend fun <T> callbackToSuspend(
    callback: (Callback<T>) -> Unit
): T = suspendCancellableCoroutine { cont ->
    // 콜백 객체 생성
    val callback = object : Callback<T> {
        override fun onSuccess(result: T) {
            cont.resume(result)
        }
        
        override fun onError(error: Exception) {
            cont.resumeWithException(error)
        }
    }
    
    try {
        // 콜백 등록
        callback(callback)
        
        // 취소 콜백 등록
        cont.invokeOnCancellation {
            // 여기서 작업 취소 처리
            // 예: 네트워크 요청 취소, 리소스 해제 등
            cleanup()
        }
    } catch (e: Exception) {
        // 콜백 등록 실패 시
        if (cont.isActive) cont.resumeWithException(e)
    }
}
```
이 예제는 `suspendCancellableCoroutine`을 사용하여 콜백 기반 API를 취소를 지원하는 일시 중단 함수로 변환하는 방법을 보여줍니다.

### 8.2 select 표현식과 취소

- `select` 표현식을 사용하면 여러 일시 중단 연산 중 하나를 선택적으로 실행할 수 있습니다.
- 선택되지 않은 연산은 자동으로 취소됩니다.

```kotlin
suspend fun fetchFromFastestSource(api1: Api, api2: Api): Data = coroutineScope {
    // 두 API 호출 중 더 빠른 것 선택
    select<Data> {
        async { api1.fetchData() }.onAwait { result ->
            println("API 1에서 결과 수신")
            result
        }
        
        async { api2.fetchData() }.onAwait { result ->
            println("API 2에서 결과 수신")
            result
        }
    }
    // 선택되지 않은 호출은 자동으로 취소됨
}
```
이 예제는 `select` 표현식을 사용하여 두 API 호출 중 더 빠른 것을 선택하고 다른 하나를 자동으로 취소하는 방법을 보여줍니다.

### 8.3 취소 예외 사용자 정의

- 기본 `CancellationException` 대신 사용자 정의 취소 예외를 사용하여 취소 이유를 더 구체적으로 표현할 수 있습니다.
- 이렇게 하면 취소 이유에 따라 다른 정리 작업을 수행할 수 있습니다.

```kotlin
// 사용자 정의 취소 예외
class UserInitiatedCancellation : CancellationException("사용자가 작업을 취소함")
class TimeoutCancellation : CancellationException("작업 시간 초과")
class LowMemoryCancellation : CancellationException("메모리 부족으로 작업 취소")

fun cancelWithReason(job: Job, reason: String) {
    when (reason) {
        "user" -> job.cancel(UserInitiatedCancellation())
        "timeout" -> job.cancel(TimeoutCancellation())
        "memory" -> job.cancel(LowMemoryCancellation())
        else -> job.cancel(CancellationException(reason))
    }
}

suspend fun performTaskWithCustomCancellation() = coroutineScope {
    val job = launch {
        try {
            // 작업 수행
            performLongTask()
        } catch (e: CancellationException) {
            when (e) {
                is UserInitiatedCancellation -> {
                    // 사용자 취소에 대한 특별 처리
                    println("사용자 요청으로 취소됨")
                }
                is TimeoutCancellation -> {
                    // 타임아웃에 대한 특별 처리
                    println("시간 초과로 취소됨")
                }
                is LowMemoryCancellation -> {
                    // 메모리 부족에 대한 특별 처리
                    println("메모리 부족으로 취소됨")
                }
                else -> {
                    println("알 수 없는 이유로 취소됨: ${e.message}")
                }
            }
            
            throw e // 재전파
        }
    }
    
    // 예시: 취소 이유 지정
    delay(1000)
    cancelWithReason(job, "user")
    
    job.join()
}
```
이 예제는 사용자 정의 취소 예외를 사용하여 취소 이유를 더 구체적으로 표현하는 방법을 보여줍니다.

## 9. 결론

- 코틀린 코루틴의 취소 메커니즘은 비동기 작업을 안전하게 중단하고 자원을 효율적으로 관리하는 강력한 도구입니다.
- 취소의 협력적 특성을 이해하고, 적절한 취소 확인과 자원 정리를 구현하는 것이 중요합니다.
- 구조적 동시성과 취소 전파를 활용하여 복잡한 비동기 작업 계층을 효과적으로 관리할 수 있습니다.

### 9.1 핵심 요약

- 코루틴 취소는 협력적입니다. 코드가 취소를 인식하고 적절히 대응해야 합니다.
- 취소는 내부적으로 `CancellationException`을 사용하여 구현됩니다.
- 계산 집약적인 코드에서는 `isActive`나 `ensureActive()`를 사용하여 취소 상태를 확인해야 합니다.
- `try-finally`와 `NonCancellable` 컨텍스트를 사용하여 취소 시 자원을 정리할 수 있습니다.
- 부모 코루틴이 취소되면 모든 자식 코루틴도 취소되고, 자식 코루틴의 예외는 부모에게 전파됩니다.
- `SupervisorJob`이나 `supervisorScope`를 사용하여 예외 전파를 제한할 수 있습니다.

### 9.2 앞으로의 발전

- 코틀린 코루틴 라이브러리는 계속 발전하고 있으며, 취소 메커니즘도 개선될 것입니다.
- 취소 관련 API의 발전과 새로운 패턴에 주목하고, 최신 모범 사례를 따르는 것이 중요합니다.
- 적절한 취소 처리를 통해 더 안정적이고 자원 효율적인 애플리케이션을 구축할 수 있습니다.

코루틴 취소를 마스터하면 비동기 코드의 안정성과 효율성을 크게 향상시킬 수 있습니다. 이 가이드가 코틀린 코루틴 취소의 복잡한 개념을 이해하고 실제 애플리케이션에 효과적으로 적용하는 데 도움이 되기를 바랍니다.