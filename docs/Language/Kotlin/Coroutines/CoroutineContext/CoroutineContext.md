---
title: "Coroutine Context"
description: "코틀린 코루틴의 핵심 요소인 코루틴 컨텍스트의 개념과 구성 요소를 자세히 알아봅니다. 디스패처, Job, CoroutineName, 예외 처리 등 코루틴 컨텍스트의 모든 측면과 실제 활용 방법을 코드 예제와 함께 설명합니다."
tags: [ "COROUTINE", "COROUTINE_CONTEXT", "KOTLIN", "ANDROID", "CONCURRENCY", "ASYNCHRONOUS", "BACKEND" ]
keywords: [ "코루틴", "coroutine", "코루틴 컨텍스트", "coroutine context", "코틀린", "kotlin", "동시성", "concurrency", "비동기", "asynchronous", "디스패처", "dispatcher", "잡", "job", "코루틴 스코프", "coroutine scope", "코루틴 빌더", "coroutine builder", "코루틴 이름", "안드로이드", "백엔드" ]
draft: false
hide_title: true
---

## 1. 코루틴 컨텍스트란?

- 코루틴 컨텍스트(CoroutineContext)는 코틀린 코루틴의 실행 환경을 정의하는 인터페이스입니다.
- 코루틴이 어떤 스레드에서 실행될지, 어떤 예외 처리기를 사용할지, 코루틴의 생명주기를 어떻게 관리할지 등의 정보를 포함합니다.
- 코루틴 컨텍스트는 여러 요소(Element)의 집합으로, 각 요소는 특정 측면(스레드 정책, 예외 처리 등)을 담당합니다.
- `CoroutineContext`는 일종의 맵(Map)과 유사한 인덱싱된 집합으로, 키(Key)와 값(Element)의 쌍으로 구성됩니다.

:::info
코루틴 컨텍스트는 코루틴이 실행되는 환경과 정책을 결정합니다. 자바의 `ExecutorService`나 스레드 관련 설정보다 더 풍부한 정보를 담고 있어 코루틴의 강력한 기능을 가능하게 합니다.
:::

## 2. 코루틴 컨텍스트의 주요 구성 요소

### 2.1 CoroutineDispatcher (디스패처)

- 코루틴이 어떤 스레드 또는 스레드 풀에서 실행될지 결정합니다.
- 코루틴의 실행 컨텍스트를 제공하는 가장 기본적인 요소입니다.
- [Dispatchers 참고](../Dispatchers/Dispatchers.md)

### 2.2 Job

- 코루틴의 생명주기를 관리하는 요소입니다.
- 코루틴의 상태를 추적하고, 코루틴을 취소하거나 완료를 대기할 수 있습니다.
- 부모-자식 관계를 통해 구조화된 동시성(structured concurrency)을 지원합니다.

#### 2.2.1 Job 생성 및 사용

```kotlin
// 코루틴 빌더로 Job 생성
val job = launch {
    // 작업 수행
}

// 명시적 Job 생성
val job = Job()
launch(job) {
    // job에 연결된 코루틴
}

// Job 상태 확인
println("Job is active: ${job.isActive}")
println("Job is completed: ${job.isCompleted}")
println("Job is cancelled: ${job.isCancelled}")

// Job 완료 대기
job.join() // 코루틴 내부에서 호출

// Job 취소
job.cancel("취소 이유")
```

#### 2.2.2 Job의 상태

- Job은 다음과 같은 상태를 가집니다:
	- `New`: 아직 실행되지 않은 상태
	- `Active`: 실행 중인 상태
	- `Completing`: 작업이 완료되고 있는 상태
	- `Completed`: 정상적으로 완료된 상태
	- `Cancelling`: 취소 중인 상태
	- `Cancelled`: 취소된 상태

#### 2.2.3 부모-자식 관계

```kotlin
val parentJob = launch {
    // 부모 코루틴
    
    val childJob = launch {
        // 자식 코루틴
    }
    
    // 부모가 취소되면 자식도 자동으로 취소됩니다
}

// 부모를 취소하면 모든 자식도 취소됩니다
parentJob.cancel()
```

- 코루틴은 부모-자식 관계를 통해 구조화된 동시성을 지원합니다.
- 부모 코루틴이 취소되면 모든 자식 코루틴도 자동으로 취소됩니다.
- 자식 코루틴이 예외로 실패하면 부모 코루틴도 취소됩니다.

### 2.3 CoroutineName

- 디버깅을 위해 코루틴에 이름을 부여하는 요소입니다.
- 로그에서 특정 코루틴을 식별하는 데 유용합니다.

```kotlin
launch(CoroutineName("데이터로딩코루틴")) {
    println("코루틴 이름: ${coroutineContext[CoroutineName]?.name}")
    // 출력: 코루틴 이름: 데이터로딩코루틴
}
```

### 2.4 CoroutineExceptionHandler

- 코루틴 내에서 발생한 예외를 처리하는 요소입니다.
- 특히 루트 코루틴의 예외를 처리할 때 중요합니다.

```kotlin
val exceptionHandler = CoroutineExceptionHandler { context, exception ->
    println("코루틴 예외 발생: $exception")
    println("코루틴 컨텍스트: $context")
}

// 예외 핸들러 사용
launch(exceptionHandler) {
    throw RuntimeException("에러 발생!")
}
```

:::warning
`CoroutineExceptionHandler`는 루트 코루틴(다른 코루틴의 자식이 아닌 코루틴)에서만 동작합니다. 자식 코루틴의 예외는 부모로 전파되므로, 부모 코루틴에 예외 핸들러를 설정해야 합니다.
:::

## 3. 코루틴 컨텍스트 결합과 상속

### 3.1 컨텍스트 요소 결합

```kotlin
// 여러 컨텍스트 요소 결합
val combinedContext = Dispatchers.IO + CoroutineName("네트워크 작업") + exceptionHandler

launch(combinedContext) {
    // 결합된 컨텍스트에서 실행
}
```

- 코루틴 컨텍스트는 `+` 연산자를 사용하여 결합할 수 있습니다.
- 결합 시 동일한 키를 가진 요소가 있으면 오른쪽 요소가 왼쪽 요소를 대체합니다.

### 3.2 컨텍스트 상속과 수정

```kotlin
// 부모로부터 컨텍스트 상속
launch {
    // 부모 컨텍스트 사용
    
    launch(Dispatchers.IO) {
        // 부모에서 상속받은 컨텍스트에 Dispatchers.IO만 변경
    }
    
    withContext(Dispatchers.Default) {
        // 임시로 디스패처만 변경
    }
}
```

- 자식 코루틴은 부모 코루틴의 컨텍스트를 상속받습니다.
- 자식 코루틴에서 특정 요소를 변경할 수 있지만, 부모 코루틴의 `Job`은 항상 새로운 자식 `Job`으로 대체됩니다.
- `withContext`를 사용하여 현재 코루틴 내에서 일시적으로 컨텍스트를 변경할 수 있습니다.

## 4. 컨텍스트 접근과 활용

- CoroutineContext는 컬렉션과 비슷하기 때문에 get을 이용해 유일한 키를 가진 원소를 찾을 수 있습니다.
	- 추가적으로 대괄호를 사용해 CoroutineContext의 특정 요소에 접근할 수 있습니다.
- CoroutineContext에서는 모든 원소를 식별할 수 있는 유일한 키를 가지고 있습니다.
-

### 4.1 현재 컨텍스트 접근

```kotlin
launch {
    // 전체 컨텍스트 접근
    println("현재 컨텍스트: $coroutineContext")
    
    // 특정 요소 접근
    val dispatcher = coroutineContext[ContinuationInterceptor]
    val job = coroutineContext[Job]
    val name = coroutineContext[CoroutineName]?.name ?: "unnamed"
    
    println("디스패처: $dispatcher")
    println("Job: $job")
    println("이름: $name")
}
```

- 코루틴 내에서 `coroutineContext` 속성을 통해 현재 컨텍스트에 접근할 수 있습니다.
- 인덱싱 연산자 `[key]`를 사용하여 특정 요소에 접근할 수 있습니다.
- `coroutineContext[CoroutineName]`
	- CoroutineName을 찾기 위해서는 CoroutineName을 사용하면 됩니다.
	- 여기서 CoroutineName은 타입이 아닌 캠패니언 객체입니다.
	- 클래스의 이름이 컴패니언 객체에 대한 참조로 사용되는 코틀린 언어 특징 때문에 `[CoroutineName]`은 `[CoroutineName.key]`가 됩니다.

### 4.2 withContext를 사용한 컨텍스트 전환

```kotlin
launch(Dispatchers.Main) {
    // UI 스레드에서 실행
    updateLoadingState(true)
    
    val result = withContext(Dispatchers.IO) {
        // IO 스레드에서 실행
        api.fetchData() // 네트워크 요청
    }
    
    // 다시 UI 스레드로 돌아옴
    updateLoadingState(false)
    displayResult(result)
}
```

- `withContext`를 사용하면 코루틴 내에서 컨텍스트를 일시적으로 변경할 수 있습니다.
- 주로 스레드를 전환하는 데 사용되며, UI 업데이트와 백그라운드 작업을 함께 수행할 때 유용합니다.
- 코드의 가독성을 높이고 콜백 패턴을 피할 수 있습니다.

### 4.3 isActive 속성 활용

```kotlin
launch {
    while (isActive) { // isActive는 coroutineContext[Job]?.isActive의 축약형
        // 취소 가능한 반복 작업
        delay(1000)
        println("작업 수행 중...")
    }
}
```

- `isActive`는 현재 코루틴이 활성 상태인지(취소되지 않았는지) 확인하는 속성입니다.
- 장시간 실행되는 작업이나 루프에서 코루틴의 취소 여부를 확인하는 데 유용합니다.

### 4.4 컨텍스트 원소 제거

- `minusKey` 함수를 사용하여 특정 키를 가진 요소를 제거할 수 있습니다.
- 원본 컨텍스트는 불변(immutable)이므로 변경되지 않고, 대신 새로운 컨텍스트가 반환됩니다.
- 주로 필요하지 않은 요소를 제거하거나 특정 동작을 재정의하기 전에 기존 요소를 제거할 때 유용합니다.

**예시**

```kotlin
launch {
    // 현재 컨텍스트 확인
    println("기존 컨텍스트: $coroutineContext")
    
    // 특정 요소 제거
    val newContext = coroutineContext.minusKey(CoroutineName.Key)
    
    // 제거된 컨텍스트 확인
    println("요소 제거 후 컨텍스트: $newContext")
    
    // 새 컨텍스트로 코루틴 시작
    withContext(newContext) {
        println("현재 코루틴 이름: ${coroutineContext[CoroutineName]?.name ?: "이름 없음"}")
    }
}
```

## 5. 고급 컨텍스트 활용 패턴

### 5.1 코루틴 스코프 커스터마이징

```kotlin
// 커스텀 코루틴 스코프 생성
val customScope = CoroutineScope(
    Dispatchers.Default +
    SupervisorJob() +
    CoroutineName("CustomScope") +
    exceptionHandler
)

// 커스텀 스코프 사용
customScope.launch {
    // 커스텀 스코프에서 코루틴 실행
}
```

- `CoroutineScope`를 직접 생성하여 애플리케이션 전체에서 사용할 수 있는 커스텀 스코프를 만들 수 있습니다.
- 디스패처, 예외 처리, 이름 등을 설정하여 특정 용도에 맞게 스코프를 최적화할 수 있습니다.

### 5.2 SupervisorJob을 사용한 예외 격리

```kotlin
launch(SupervisorJob()) {
    // 첫 번째 자식 코루틴
    launch {
        delay(100)
        throw RuntimeException("에러 발생!")
    }
    
    // 두 번째 자식 코루틴 - 위의 예외에 영향 받지 않음
    launch {
        delay(200)
        println("이 코드는 실행됩니다.")
    }
}
```

- `SupervisorJob`은 일반 `Job`과 달리 자식 코루틴이 실패해도 다른 자식 코루틴은 취소되지 않습니다.
- 서로 독립적인 여러 작업을 실행할 때 유용합니다.

### 5.3 컨텍스트 요소 커스터마이징

```kotlin
// 커스텀 코루틴 컨텍스트 요소 정의
class LoggingContext(val id: String) : AbstractCoroutineContextElement(Key) {
    companion object Key : CoroutineContext.Key<LoggingContext>
}

// 커스텀 요소 사용
launch(LoggingContext("REQ-123")) {
    val requestId = coroutineContext[LoggingContext]?.id
    println("요청 ID: $requestId") // 출력: 요청 ID: REQ-123
}
```

- 자신만의 컨텍스트 요소를 정의하여 코루틴에 추가 정보를 전달할 수 있습니다.
- 로깅, 트레이싱, 요청 식별 등 다양한 용도로 활용할 수 있습니다.

## 6. 실제 활용 사례

### 6.1 안드로이드에서의 활용

```kotlin
class MainActivity : AppCompatActivity() {
    // 액티비티의 생명주기와 연결된 코루틴 스코프
    private val mainScope = MainScope() // Dispatchers.Main + SupervisorJob
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        mainScope.launch {
            // UI 업데이트
            progressBar.isVisible = true
            
            try {
                // 백그라운드 작업
                val result = withContext(Dispatchers.IO) {
                    repository.fetchData()
                }
                
                // UI 업데이트
                textView.text = result
            } finally {
                progressBar.isVisible = false
            }
        }
    }
    
    override fun onDestroy() {
        // 액티비티 소멸 시 모든 코루틴 취소
        mainScope.cancel()
        super.onDestroy()
    }
}
```

- 안드로이드에서는 UI 작업과 백그라운드 작업을 적절히 분리하는 것이 중요합니다.
- `MainScope()`는 안드로이드의 메인 스레드에서 실행되는 스코프를 제공합니다.
- 액티비티 생명주기와 코루틴 생명주기를 연결하여 메모리 누수를 방지합니다.

### 6.2 서버 애플리케이션에서의 활용

```kotlin
// Ktor 서버에서의 코루틴 컨텍스트 활용
fun Application.module() {
    install(CallLogging)
    
    routing {
        get("/data") {
            // 요청 처리를 위한 코루틴 컨텍스트 설정
            withContext(Dispatchers.IO + CoroutineName("DataFetcher")) {
                // 데이터베이스 조회 등 IO 작업
                val data = repository.fetchData()
                call.respond(data)
            }
        }
    }
}
```

- 서버 애플리케이션에서는 요청 처리 시 적절한 디스패처를 사용하여 서버 성능을 최적화할 수 있습니다.
- 코루틴 이름을 통해 요청 로깅과 모니터링이 가능합니다.

### 6.3 테스트에서의 활용

```kotlin
class MyTest {
    // 테스트를 위한 코루틴 실행기
    @get:Rule
    val mainCoroutineRule = MainCoroutineRule()
    
    @Test
    fun testAsync() = runTest {
        // 테스트에서 시간을 제어할 수 있는 가상 시간 사용
        val result = withContext(Dispatchers.IO) {
            repository.fetchData()
        }
        
        assertEquals("expected", result)
    }
}

// 테스트를 위한 메인 디스패처 규칙
class MainCoroutineRule : TestWatcher() {
    private val testDispatcher = StandardTestDispatcher()
    
    override fun starting(description: Description) {
        Dispatchers.setMain(testDispatcher)
    }
    
    override fun finished(description: Description) {
        Dispatchers.resetMain()
    }
}
```

- 테스트에서는 특수한 테스트 디스패처를 사용하여 코루틴의 실행을 제어할 수 있습니다.
- 가상 시간을 사용하여 지연(delay)이 있는 코드도 빠르게 테스트할 수 있습니다.

## 7. 주의사항 및 모범 사례

### 7.1 메모리 누수 방지

```kotlin
class MyViewModel : ViewModel() {
    // viewModelScope는 ViewModel이 소멸될 때 자동으로 취소됨
    fun loadData() {
        viewModelScope.launch {
            // 안전하게 코루틴 사용
        }
    }
}
```

- 항상 코루틴의 생명주기를 관리하고, 더 이상 필요하지 않을 때 취소해야 합니다.
- 안드로이드에서는 `lifecycleScope`, `viewModelScope` 등의 스코프를 활용하여 생명주기와 연동할 수 있습니다.

### 7.2 디스패처 선택 지침

- `Dispatchers.Default`: CPU 집약적 작업(계산, 알고리즘 등)
- `Dispatchers.IO`: 네트워크, 파일 I/O, 데이터베이스 작업
- `Dispatchers.Main`: UI 갱신 (UI 프레임워크가 있는 경우)
- 복잡한 작업은 여러 디스패처를 적절히 조합하여 사용하세요.

:::tip
디스패처를 전환할 때는 `withContext`를 사용하는 것이 좋습니다. 새로운 코루틴을 시작하는 것보다 효율적이고 코드도 더 깔끔해집니다.
:::

### 7.3 예외 처리 전략

```kotlin
// 글로벌 예외 핸들러 설정
val handler = CoroutineExceptionHandler { _, exception ->
    log.error("코루틴 예외 발생", exception)
}

// SupervisorJob과 함께 사용
val scope = CoroutineScope(SupervisorJob() + handler)

scope.launch {
    // 이 코루틴의 예외는 핸들러에 의해 처리됨
}
```

- 코루틴의 예외 처리는 구조화된 동시성 모델을 따릅니다.
- 루트 코루틴에 `CoroutineExceptionHandler`를 설정하여 예외를 처리하세요.
- 오류 격리가 필요하면 `SupervisorJob`을 사용하세요.

### 7.4 컨텍스트 오버헤드 최소화

- 코루틴 컨텍스트 전환은 약간의 오버헤드가 있습니다.
- 불필요한 컨텍스트 전환을 피하고, 관련 작업은 같은 컨텍스트에서 실행하세요.
- 최적화가 필요한 경우, 세밀한 컨텍스트 전환보다는 작업을 논리적으로 그룹화하는 것이 좋습니다.

## 8. 결론

- 코루틴 컨텍스트는 코루틴의 실행 환경을 정의하는 강력한 메커니즘입니다.
- 디스패처를 통해 스레드 관리, Job을 통한 생명주기 제어, 예외 처리 등 다양한 측면을 제어할 수 있습니다.
- 컨텍스트를 적절히 활용하면 간결하고 유지보수하기 쉬운 비동기 코드를 작성할 수 있습니다.
- 코루틴 컨텍스트를 이해하고 효과적으로 활용하는 것은 코틀린에서 비동기 프로그래밍을 마스터하는 데 핵심적인 부분입니다.

:::info
코루틴 컨텍스트와 관련된 더 자세한 내용은 [코틀린 공식 문서](https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html)를 참조하세요.
:::