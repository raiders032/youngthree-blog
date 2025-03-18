---
title: "Exceptions Handling"
description: "코틀린 코루틴에서 발생하는 예외를 효과적으로 처리하는 방법을 심층적으로 알아봅니다. 코루틴의 예외 전파 메커니즘, 예외 처리를 위한 다양한 패턴, 실제 사용 사례와 모범 사례까지 코루틴 예외 처리의 모든 것을 다룹니다."
tags: [ "COROUTINE", "EXCEPTION_HANDLING", "KOTLIN", "ANDROID", "BACKEND" ]
keywords: [ "코틀린", "kotlin", "코루틴", "coroutine", "예외", "exception", "예외처리", "exception handling", "코루틴 예외", "coroutine exception", "에러 핸들링", "error handling", "try-catch", "supervisorScope", "coroutineExceptionHandler", "취소", "cancellation", "예외 전파", "exception propagation", "구조화된 동시성", "structured concurrency" ]
draft: false
hide_title: true
---

## 1. 코루틴 예외 처리의 기본 원리

- 코틀린 코루틴은 일반적인 코드와 다른 독특한 예외 처리 메커니즘을 가지고 있습니다.
- 코루틴의 예외 처리를 이해하려면 코루틴의 구조화된 동시성(Structured Concurrency) 개념을 알아야 합니다.
- 구조화된 동시성이란 코루틴이 부모-자식 관계를 형성하며, 이 계층 구조를 따라 예외가 전파된다는 것을 의미합니다.

### 1.1 일반 코드와 코루틴의 예외 처리 차이

- 일반 코드에서는 예외가 발생하면 호출 스택을 따라 위로 전파됩니다.
- 코루틴에서는 예외가 발생하면 계층 구조를 따라 부모 코루틴으로 전파됩니다.
- 일반 함수와 달리, 코루틴은 비동기적으로 실행되기 때문에 예외 전파 방식이 다릅니다.

:::note[중요 개념]
코루틴에서 처리되지 않은 예외는 해당 코루틴을 즉시 취소하고, 부모 코루틴에도 전파되어 결국 모든 관련 코루틴이 취소될 수 있습니다.
:::

### 1.2 예외 전파 메커니즘

- 코루틴에서 예외가 발생하면 다음과 같은 과정으로 처리됩니다:
	- 예외가 발생한 코루틴은 즉시 취소됩니다.
	- 예외는 부모 코루틴으로 전파됩니다.
	- 부모 코루틴은 모든 자식 코루틴을 취소합니다.
	- 이 과정이 루트 코루틴까지 계속됩니다.

#### 1.2.1 예외 전파 예시

```kotlin
fun main() = runBlocking {
    try {
        coroutineScope {
            launch {
                println("자식 코루틴 1 시작")
                delay(100)
                throw RuntimeException("자식 코루틴 1 예외 발생")
            }
            
            launch {
                println("자식 코루틴 2 시작")
                delay(1000)
                println("이 코드는 실행되지 않습니다") // 첫 번째 코루틴의 예외로 인해 취소됨
            }
        }
    } catch (e: Exception) {
        println("예외 잡힘: ${e.message}")
    }
    
    println("프로그램 계속 실행")
}
```

위 코드에서는 첫 번째 자식 코루틴에서 발생한 예외가 부모 코루틴으로 전파되어 두 번째 자식 코루틴이 취소되고, 최종적으로 try-catch 블록에서 예외가 잡힙니다.

## 2. 코루틴에서 예외 처리하기

- 코루틴에서 예외를 처리하는 여러 방법이 있습니다.
- 각 방법은 서로 다른 상황과 요구사항에 적합합니다.

### 2.1 try-catch 블록 사용하기

- 가장 기본적인 방법은 코루틴 내부에서 try-catch 블록을 사용하는 것입니다.
- 이 방법은 특정 코루틴 내에서 발생하는 예외만 처리할 수 있습니다.

```kotlin
suspend fun fetchData(): String = coroutineScope {
    try {
        // 네트워크 호출 또는 기타 예외가 발생할 수 있는 작업
        delay(1000)
        "데이터"
    } catch (e: Exception) {
        // 예외 처리
        println("예외 발생: ${e.message}")
        "기본 데이터" // 오류 발생 시 반환할 기본값
    }
}
```

### 2.2 CoroutineExceptionHandler 사용하기

- `CoroutineExceptionHandler`는 코루틴 빌더에 전달할 수 있는 컨텍스트 요소입니다.
- 코루틴 계층 구조의 루트 코루틴에만 효과가 있습니다.
- 자식 코루틴에서 발생한 예외를 부모 코루틴에서 처리할 수 있게 해줍니다.

```kotlin
fun main() = runBlocking {
    val handler = CoroutineExceptionHandler { _, exception ->
        println("예외 핸들러에서 잡힌 예외: ${exception.message}")
    }
    
    val job = launch(handler) {
        launch {
            throw RuntimeException("자식 코루틴에서 예외 발생")
        }
    }
    
    job.join() // 코루틴이 완료될 때까지 대기
    println("프로그램 계속 실행")
}
```

:::warning[주의사항]
`CoroutineExceptionHandler`는 `launch`와 같은 루트 코루틴에만 효과가 있으며, `async`나 자식 코루틴에는 적용되지 않습니다. `async`에서 발생한 예외는 `await()` 호출
시에만 전파됩니다.
:::

### 2.3 supervisorScope 사용하기

- `supervisorScope`는 자식 코루틴의 실패가 다른 자식 코루틴에 영향을 주지 않도록 합니다.
- 한 자식 코루틴의 예외가 다른 자식 코루틴을 취소하지 않도록 할 때 유용합니다.

```kotlin
fun main() = runBlocking {
    supervisorScope {
        val job1 = launch {
            try {
                println("자식 1 시작")
                delay(500)
                throw RuntimeException("자식 1 예외")
            } catch (e: Exception) {
                println("자식 1 예외 처리: ${e.message}")
            }
        }
        
        val job2 = launch {
            println("자식 2 시작")
            delay(1000)
            println("자식 2 완료") // 자식 1의 예외에도 불구하고 실행됨
        }
        
        job1.join()
        job2.join()
    }
    
    println("모든 작업 완료")
}
```

## 3. async와 예외 처리

- `async` 코루틴 빌더는 `launch`와 다른 예외 처리 방식을 가집니다.
- `async`는 결과 또는 예외를 `Deferred` 객체에 저장하고, `await()` 호출 시에만 예외가 전파됩니다.

### 3.1 async의 예외 처리 특성

- `async` 내부에서 예외가 발생해도 즉시 부모로 전파되지 않습니다.
- `await()` 호출 시에만 예외가 던져집니다.
- 이로 인해 `async`를 사용할 때는 항상 `await()`를 호출해야 예외를 적절히 처리할 수 있습니다.

```kotlin
fun main() = runBlocking {
    val deferred = async {
        println("비동기 작업 시작")
        delay(1000)
        throw RuntimeException("비동기 작업 실패")
    }
    
    // 여기서는 예외가 발생하지 않음
    delay(2000)
    println("await() 호출 전")
    
    try {
        deferred.await() // 여기서 예외가 전파됨
    } catch (e: Exception) {
        println("예외 잡힘: ${e.message}")
    }
    
    println("프로그램 계속 실행")
}
```

### 3.2 여러 async 작업 처리하기

- 여러 `async` 작업을 처리할 때는 `awaitAll`이나 개별 `await` 호출로 예외를 처리할 수 있습니다.
- 각 방법에 따라 예외 처리 전략이 달라집니다.

```kotlin
fun main() = runBlocking {
    val deferreds = listOf(
        async {
            delay(100)
            println("작업 1 완료")
            "결과 1"
        },
        async {
            delay(200)
            throw RuntimeException("작업 2 실패")
        },
        async {
            delay(300)
            println("작업 3 완료")
            "결과 3"
        }
    )
    
    try {
        val results = deferreds.awaitAll() // 첫 번째 예외에서 중단됨
        println("모든 결과: $results") // 이 코드는 실행되지 않음
    } catch (e: Exception) {
        println("예외 발생: ${e.message}")
        
        // 이미 완료된 작업의 결과 수집
        deferreds.forEachIndexed { index, deferred ->
            if (deferred.isCompleted && !deferred.isCancelled) {
                try {
                    println("작업 ${index + 1} 결과: ${deferred.await()}")
                } catch (e: Exception) {
                    println("작업 ${index + 1} 예외: ${e.message}")
                }
            }
        }
    }
}
```

## 4. 취소와 예외 처리

- 코루틴 취소는 내부적으로 `CancellationException`을 사용합니다.
- 이 예외는 정상적인 코루틴 종료로 간주되어 부모 코루틴으로 전파되지 않습니다.

### 4.1 취소 예외 처리하기

- `CancellationException`은 일반적으로 처리할 필요가 없습니다.
- 취소 시 리소스를 정리해야 할 경우에만 이 예외를 처리합니다.

```kotlin
fun main() = runBlocking {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("작업 $i 실행 중...")
                delay(500)
            }
        } catch (e: CancellationException) {
            println("코루틴 취소됨: ${e.message}")
            throw e // 취소 예외는 다시 던져야 함
        } finally {
            println("리소스 정리 작업 수행")
        }
    }
    
    delay(1300)
    println("코루틴 취소")
    job.cancel("사용자에 의한 취소")
    job.join()
    
    println("메인 코루틴 종료")
}
```

:::danger[주의사항]
취소된 코루틴 내에서는 다른 일시 중단 함수를 호출할 수 없습니다. 취소 후 정리 작업이 필요하면 `withContext(NonCancellable) { ... }` 블록을 사용해야 합니다.
:::

### 4.2 NonCancellable 컨텍스트 사용하기

- 취소된 코루틴에서 정리 작업을 위해 일시 중단 함수를 호출해야 할 경우 `NonCancellable` 컨텍스트를 사용합니다.

```kotlin
fun main() = runBlocking {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("작업 $i 실행 중...")
                delay(500)
            }
        } finally {
            withContext(NonCancellable) {
                println("정리 작업 시작")
                delay(1000) // 취소 상태에서도 실행 가능
                println("정리 작업 완료")
            }
        }
    }
    
    delay(1300)
    job.cancelAndJoin()
    println("메인 코루틴 종료")
}
```

## 5. 고급 예외 처리 패턴

### 5.1 과제: 재시도 메커니즘 구현하기

- 네트워크 요청과 같은 실패할 수 있는 작업에 대해 재시도 로직을 구현하는 것은 일반적인 요구사항입니다.
- 코루틴을 사용하면 이를 깔끔하게 구현할 수 있습니다.

```kotlin
suspend fun <T> retry(
    times: Int,
    initialDelay: Long,
    maxDelay: Long,
    factor: Double = 2.0,
    block: suspend () -> T
): T {
    var currentDelay = initialDelay
    repeat(times) { attempt ->
        try {
            return block()
        } catch (e: Exception) {
            println("시도 ${attempt + 1}/${times} 실패: ${e.message}")
            
            if (attempt == times - 1) throw e
            
            delay(currentDelay)
            currentDelay = (currentDelay * factor).toLong().coerceAtMost(maxDelay)
        }
    }
    throw IllegalStateException("This line should never be reached")
}

// 사용 예:
suspend fun fetchData(): String {
    return retry(
        times = 3,
        initialDelay = 100,
        maxDelay = 1000
    ) {
        // 네트워크 요청 시뮬레이션
        if (Math.random() < 0.7) throw IOException("네트워크 오류")
        "데이터 가져오기 성공"
    }
}
```

### 5.2 Circuit Breaker 패턴

- Circuit Breaker 패턴은 반복적인 실패를 감지하고 일정 시간 동안 작업 시도를 중단하는 방식입니다.
- 시스템 과부하를 방지하고 빠른 실패(fail-fast)를 제공합니다.

```kotlin
class CircuitBreaker(
    private val maxFailures: Int,
    private val resetTimeout: Long,
    private val openTimeout: Long
) {
    private var failures = 0
    private var state = State.CLOSED
    private var lastFailureTime = 0L
    
    enum class State { CLOSED, OPEN, HALF_OPEN }
    
    suspend fun <T> execute(block: suspend () -> T): T {
        when (state) {
            State.OPEN -> {
                val timeSinceLastFailure = System.currentTimeMillis() - lastFailureTime
                if (timeSinceLastFailure >= resetTimeout) {
                    state = State.HALF_OPEN
                } else {
                    throw CircuitBreakerOpenException("서킷 브레이커가 열린 상태입니다")
                }
            }
            State.HALF_OPEN, State.CLOSED -> {
                // 계속 진행
            }
        }
        
        return try {
            val result = block()
            if (state == State.HALF_OPEN) {
                state = State.CLOSED
                failures = 0
            }
            result
        } catch (e: Exception) {
            failures++
            lastFailureTime = System.currentTimeMillis()
            
            if (failures >= maxFailures || state == State.HALF_OPEN) {
                state = State.OPEN
                delay(openTimeout) // OPEN 상태로 전환 시 지연
            }
            throw e
        }
    }
    
    class CircuitBreakerOpenException(message: String) : Exception(message)
}
```

## 6. 실제 사용 사례

### 6.1 Android에서의 코루틴 예외 처리

- Android에서는 ViewModel이나 lifecycle 범위에서 코루틴을 실행하는 경우가 많습니다.
- 이런 환경에서의 예외 처리는 앱 안정성에 중요합니다.

```kotlin
class MyViewModel : ViewModel() {
    private val exceptionHandler = CoroutineExceptionHandler { _, exception ->
        // 오류 로깅
        Log.e("MyViewModel", "코루틴 예외 발생", exception)
        
        // UI 상태 업데이트
        _uiState.value = UiState.Error(exception.message ?: "알 수 없는 오류")
    }
    
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState
    
    fun loadData() {
        viewModelScope.launch(exceptionHandler) {
            _uiState.value = UiState.Loading
            
            try {
                val result = repository.fetchData()
                _uiState.value = UiState.Success(result)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "알 수 없는 오류")
            }
        }
    }
    
    sealed class UiState {
        object Loading : UiState()
        data class Success(val data: String) : UiState()
        data class Error(val message: String) : UiState()
    }
}
```

### 6.2 서버 사이드 Kotlin에서의 예외 처리

- 서버 애플리케이션에서는 여러 요청을 동시에 처리하면서 예외를 적절히 관리해야 합니다.
- 각 요청의 실패가 전체 서버에 영향을 미치지 않도록 해야 합니다.

```kotlin
class UserService(private val repository: UserRepository) {
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    
    suspend fun getUsers(): List<User> = supervisorScope {
        val activeUsers = async { repository.getActiveUsers() }
        val inactiveUsers = async { repository.getInactiveUsers() }
        
        val result = mutableListOf<User>()
        
        try {
            result.addAll(activeUsers.await())
        } catch (e: Exception) {
            logger.error("활성 사용자 조회 실패", e)
        }
        
        try {
            result.addAll(inactiveUsers.await())
        } catch (e: Exception) {
            logger.error("비활성 사용자 조회 실패", e)
        }
        
        result
    }
    
    fun processUserData(userId: String, completion: (Result<ProcessedData>) -> Unit) {
        serviceScope.launch {
            val result = try {
                val userData = repository.getUserData(userId)
                val processedData = processData(userData)
                Result.success(processedData)
            } catch (e: Exception) {
                logger.error("사용자 데이터 처리 실패: $userId", e)
                Result.failure(e)
            }
            
            withContext(Dispatchers.Main) {
                completion(result)
            }
        }
    }
}
```

## 7. 모범 사례와 권장 사항

### 7.1 코루틴 예외 처리 모범 사례

- 적절한 스코프와 컨텍스트를 선택하세요.
	- `supervisorScope`는 독립적인 작업에 사용하세요.
	- `coroutineScope`는 모든 작업이 성공해야 하는 경우에 사용하세요.
- 루트 코루틴에 항상 `CoroutineExceptionHandler`를 적용하세요.
- `async`를 사용할 때는 항상 `await()`를 호출하여 예외를 확인하세요.
- 구조화된 동시성 원칙을 따라 코루틴 누수를 방지하세요.

### 7.2 안티 패턴과 주의사항

- 전역 예외 핸들러에만 의존하지 마세요.
- 빈 catch 블록을 사용하지 마세요 - 항상 예외를 기록하거나 처리하세요.
- `CancellationException`을 삼키지 마세요 - 다시 던져야 합니다.
- 취소된 코루틴에서 일시 중단 함수를 호출할 때 `NonCancellable`을 사용하는 것을 잊지 마세요.

:::warning[주의사항]
코루틴 빌더에 전달된 예외 핸들러는 해당 코루틴 내에서 시작된 모든 자식 코루틴에게 상속되지 않습니다. 각 독립적인 코루틴 계층에 대해 별도의 예외 처리를 설정해야 합니다.
:::

## 8. 결론

- 코틀린 코루틴의 예외 처리는 일반 코드와 다른 고유한 동작 방식을 가집니다.
- 구조화된 동시성 원칙과 코루틴의 계층 구조를 이해하면 효과적인 예외 처리 전략을 구현할 수 있습니다.
- 적절한 예외 처리 메커니즘(try-catch, CoroutineExceptionHandler, supervisorScope 등)을 상황에 맞게 선택하는 것이, 견고하고 유지보수하기 쉬운 비동기 코드를 작성하는
  핵심입니다.
- 코루틴의 예외 처리는 단순한 오류 관리를 넘어 효율적인 리소스 관리와 앱 안정성을 위한 중요한 요소입니다.

참고

- https://kotlinlang.org/docs/exception-handling.html