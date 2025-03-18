---
title: "Suspending Function"
description: "코틀린의 일시 중단 함수(suspend function)의 개념부터 고급 활용법까지 상세히 알아봅니다. 코루틴과의 관계, 내부 동작 원리, 실제 사용 패턴과 모범 사례까지 일시 중단 함수의 모든 것을 다룹니다."
tags: [ "COROUTINE", "SUSPEND_FUNCTION", "KOTLIN", "ASYNCHRONOUS_PROGRAMMING", "ANDROID", "BACKEND" ]
keywords: [ "코틀린", "kotlin", "코루틴", "coroutine", "서스펜드 함수", "suspend function", "일시 중단 함수", "비동기 프로그래밍", "asynchronous programming", "동시성", "concurrency", "서스펜딩 함수", "suspending function", "비동기", "async", "코루틴 스코프", "coroutineScope", "withContext", "async/await", "continuation" ]
draft: false
hide_title: true
---

## 1. 일시 중단 함수(Suspending Function)란?

- 일시 중단 함수는 코틀린 코루틴의 핵심 구성 요소로, `suspend` 키워드로 선언된 함수입니다.
- 이 함수들은 실행 중간에 일시 중단되었다가 나중에 다시 재개될 수 있는 특별한 함수입니다.
- 일반 함수와 달리, 실행을 멈추고 스레드를 차단하지 않고 반환할 수 있어 비동기 프로그래밍에 이상적입니다.

:::note[기본 구문]

```kotlin
suspend fun doSomething() {
    // 시간이 걸리는 작업
}
```

:::

### 1.1 일시 중단 함수와 일반 함수의 차이

- 일반 함수는 실행이 시작되면 완료될 때까지 해당 스레드를 독점적으로 사용합니다.
	- 즉, 함수가 긴 작업을 수행하는 경우 그 스레드는 다른 일을 할 수 없습니다.
- 일시 중단 함수는 특정 지점(suspend 지점)에서 실행을 일시적으로 멈추고, 사용하던 스레드를 반환할 수 있습니다.
	- 이 스레드는 다른 작업을 처리하다가, 중단된 작업이 계속될 준비가 되면 같은 스레드나 다른 스레드에서 작업을 재개합니다.
- 일시 중단 함수는 반드시 코루틴 스코프 내부나 다른 일시 중단 함수 안에서만 호출할 수 있습니다.
	- 일반 함수에서는 직접 호출할 수 없습니다.
- 컴파일러는 일시 중단 함수를 '상태 머신'으로 변환합니다.
	- 이 상태 머신은 함수가 중단된 위치를 기억했다가, 나중에 정확히 그 지점부터 실행을 재개할 수 있게 해줍니다.

```kotlin
// 일반 함수
fun regularFunction() {
    // 장시간 실행되는 작업 - 완료될 때까지 스레드 차단
}

// 일시 중단 함수
suspend fun suspendingFunction() {
    // 장시간 실행되는 작업 - 스레드를 차단하지 않고 일시 중단 가능
}

// 사용 예시
fun main() = runBlocking {
    suspendingFunction() // 코루틴 내에서 호출 가능
}

// 컴파일 오류 - 일시 중단 함수는 코루틴 외부에서 직접 호출할 수 없음
// fun main() {
//     suspendingFunction()
// }
```

## 2. 코루틴과 일시 중단 함수의 관계

- 일시 중단 함수는 코루틴 시스템의 기반이 되는 핵심 요소입니다.
- 코루틴은 일시 중단 함수를 실행하는 실행 단위이며, 일시 중단 함수는 코루틴의 실행을 일시 중단시키는 메커니즘을 제공합니다.

### 2.1 상호 의존성

- 일시 중단 함수는 코루틴 내에서만 호출될 수 있습니다.
- 코루틴은 일시 중단 함수를 통해 비차단 방식으로 일시 중단되고 재개됩니다.
- 이 둘의 관계는 다음과 같이 요약할 수 있습니다:
	- 코루틴은 일시 중단 함수를 실행하는 컨테이너입니다.
	- 일시 중단 함수는 코루틴이 효율적으로 일시 중단되고 재개될 수 있도록 하는 메커니즘입니다.

```kotlin
// 코루틴과 일시 중단 함수의 관계 예시
fun main() = runBlocking {
    // 여기서 runBlocking은 코루틴을 시작하는 빌더입니다
    println("코루틴 시작")
    
    delay(1000) // 일시 중단 함수 - 코루틴을 일시 중단합니다
    
    println("코루틴 재개")
}
```

### 2.2 코루틴 빌더와 일시 중단 함수

- 코루틴 빌더(`launch`, `async`, `runBlocking` 등)는 코루틴을 생성하고 일시 중단 함수를 실행하는 진입점입니다.
- 이 빌더들은 일시 중단 함수가 실행될 수 있는 코루틴 컨텍스트를 제공합니다.

```kotlin
fun main() = runBlocking {
    // launch는 새 코루틴을 시작하는 빌더
    val job = launch {
        delay(1000) // 일시 중단 함수
        println("코루틴 내부 작업 완료")
    }
    
    // async는 결과를 반환하는 코루틴을 시작하는 빌더
    val deferred = async {
        delay(2000) // 일시 중단 함수
        "작업 결과"
    }
    
    // await는 일시 중단 함수
    val result = deferred.await()
    println("결과: $result")
}
```

## 3. 일시 중단 함수의 내부 동작 원리

- 일시 중단 함수는 컴파일 시점에 특별한 변환을 거쳐 상태 머신으로 변환됩니다.
- 이 변환 과정은 컨티뉴에이션 패싱 스타일(Continuation-Passing Style, CPS) 변환과 유사합니다.

### 3.1 컨티뉴에이션(Continuation)

- 컨티뉴에이션은 코루틴이 일시 중단된 후 어디서부터 다시 실행해야 하는지에 대한 정보를 담고 있습니다.
- 모든 일시 중단 함수는 마지막 파라미터로 `Continuation` 객체를 암시적으로 받습니다.

```kotlin
// 컴파일러는 다음과 같이 변환합니다:
suspend fun myFunction(param: Type): Result
// 위 함수는 다음과 유사한 형태로 변환됩니다:
fun myFunction(param: Type, continuation: Continuation<Result>): Any
```

### 3.2 상태 머신(State Machine)

- 일시 중단 함수는 여러 상태를 가진 상태 머신으로 변환됩니다.
- 각 상태는 일시 중단 지점을 나타내며, 함수가 재개될 때 어느 지점부터 실행해야 하는지 결정합니다.

```kotlin
suspend fun complexFunction() {
    println("상태 0")
    delay(1000) // 일시 중단 지점 1
    println("상태 1")
    delay(1000) // 일시 중단 지점 2
    println("상태 2")
}

// 위 함수는 대략 다음과 같이 변환됩니다(단순화된 형태):
fun complexFunction(continuation: Continuation<Unit>): Any {
    val state = continuation.state
    
    when (state) {
        0 -> {
            println("상태 0")
            return delay(1000, ContinuationImpl(1))
        }
        1 -> {
            println("상태 1")
            return delay(1000, ContinuationImpl(2))
        }
        2 -> {
            println("상태 2")
            return Unit
        }
    }
}
```

:::info[참고]
실제 변환은 이보다 훨씬 복잡하지만, 기본 아이디어는 함수가 여러 진입점을 가진 상태 머신으로 변환된다는 것입니다.
:::

## 4. 일시 중단 함수의 활용 패턴

### 4.1 순차적 실행

- 일시 중단 함수는 비동기 작업을 순차적으로 실행하는 데 이상적입니다.
- 코드는 동기식처럼 보이지만 실제로는 비동기적으로 실행됩니다.

```kotlin
suspend fun fetchUserAndPosts(): Pair<User, List<Post>> {
    val user = fetchUser() // 첫 번째 API 호출
    val posts = fetchPosts(user.id) // 두 번째 API 호출 (첫 번째 결과에 의존)
    return user to posts
}

// 사용 예시
suspend fun displayUserData() {
    val (user, posts) = fetchUserAndPosts()
    displayUser(user)
    displayPosts(posts)
}
```

### 4.2 병렬 실행

- `async`와 `await`를 사용하여 여러 일시 중단 함수를 병렬로 실행할 수 있습니다.

```kotlin
suspend fun fetchUserAndPostsConcurrently(): Pair<User, List<Post>> = coroutineScope {
    val userDeferred = async { fetchUser() }
    val postsDeferred = async { fetchPosts("temp_id") } // 병렬로 시작
    
    val user = userDeferred.await()
    val posts = postsDeferred.await()
    
    user to posts
}
```

### 4.3 오류 처리

- 일시 중단 함수에서 발생한 예외는 일반 함수와 동일한 방식으로 처리할 수 있습니다.
- `try-catch` 블록이나 고차 함수를 사용하여 예외를 처리할 수 있습니다.

```kotlin
suspend fun fetchUserSafely(): User? {
    return try {
        fetchUser()
    } catch (e: Exception) {
        println("사용자 정보를 가져오는 중 오류 발생: ${e.message}")
        null
    }
}

// 고차 함수 활용
suspend fun <T> runSafely(block: suspend () -> T): Result<T> {
    return try {
        Result.success(block())
    } catch (e: Exception) {
        Result.failure(e)
    }
}

// 사용 예시
suspend fun fetchData() {
    val userResult = runSafely { fetchUser() }
    userResult.onSuccess { user ->
        println("사용자: $user")
    }.onFailure { error ->
        println("오류: $error")
    }
}
```

## 5. 일시 중단 함수 만들기

### 5.1 기본 일시 중단 함수 작성

- `suspend` 키워드를 사용하여 함수를 일시 중단 함수로 선언합니다.
- 내부에서 다른 일시 중단 함수를 호출할 수 있습니다.

```kotlin
suspend fun myCustomSuspendFunction() {
    // 다른 일시 중단 함수 호출
    delay(1000)
    
    // 일반 함수 호출
    regularFunction()
    
    // 추가 작업
}
```

### 5.2 코루틴 빌더를 사용한 일시 중단 함수

- `coroutineScope`를 사용하여 새로운 코루틴 스코프를 생성하는 일시 중단 함수를 만들 수 있습니다.
- 이는 구조화된 동시성을 보장하는 데 유용합니다.

```kotlin
suspend fun loadDataConcurrently(): CombinedData = coroutineScope {
    val part1 = async { loadPart1() }
    val part2 = async { loadPart2() }
    
    CombinedData(part1.await(), part2.await())
}
```

### 5.3 콜백 API를 일시 중단 함수로 변환

- 기존의 콜백 기반 API를 `suspendCoroutine` 또는 `suspendCancellableCoroutine`을 사용하여 일시 중단 함수로 변환할 수 있습니다.

```kotlin
suspend fun fetchUserFromApi(userId: String): User = suspendCoroutine { continuation ->
    // 기존 콜백 기반 API 호출
    api.fetchUser(userId, object : Callback<User> {
        override fun onSuccess(user: User) {
            continuation.resume(user)
        }
        
        override fun onError(error: Throwable) {
            continuation.resumeWithException(error)
        }
    })
}

// 취소 지원 버전
suspend fun fetchUserFromApiCancellable(userId: String): User = suspendCancellableCoroutine { continuation ->
    val call = api.fetchUser(userId, object : Callback<User> {
        override fun onSuccess(user: User) {
            continuation.resume(user)
        }
        
        override fun onError(error: Throwable) {
            continuation.resumeWithException(error)
        }
    })
    
    // 취소 처리
    continuation.invokeOnCancellation {
        call.cancel()
    }
}
```

## 6. 일시 중단 함수와 컨텍스트 전환

### 6.1 withContext 활용

- `withContext`는 코루틴 컨텍스트를 변경하면서 코드 블록을 실행하는 일시 중단 함수입니다.
- 주로 디스패처를 변경하여 다른, 스레드에서 코드를 실행하는 데 사용됩니다.

```kotlin
suspend fun fetchAndProcessData(): ProcessedData {
    // IO 스레드에서 데이터 가져오기
    val rawData = withContext(Dispatchers.IO) {
        api.fetchData() // 네트워크 호출
    }
    
    // CPU 집약적인 작업은 Default 디스패처에서 처리
    val processedData = withContext(Dispatchers.Default) {
        processData(rawData) // 데이터 처리
    }
    
    // UI 업데이트는 Main 스레드에서 수행
    return withContext(Dispatchers.Main) {
        updateUI(processedData)
        processedData
    }
}
```

### 6.2 디스패처 선택 가이드라인

- `Dispatchers.Main`: UI 관련 작업
- `Dispatchers.IO`: 파일 I/O, 네트워크 요청, 데이터베이스 작업
- `Dispatchers.Default`: CPU 집약적 작업(복잡한 계산, 큰 목록 처리 등)

```kotlin
suspend fun loadAndDisplayImage(imageUrl: String) {
    // IO 디스패처에서 이미지 다운로드
    val bytes = withContext(Dispatchers.IO) {
        downloadImage(imageUrl)
    }
    
    // Default 디스패처에서 이미지 처리
    val processedBitmap = withContext(Dispatchers.Default) {
        processBitmap(bytes)
    }
    
    // Main 디스패처에서 UI 업데이트
    withContext(Dispatchers.Main) {
        displayImage(processedBitmap)
    }
}
```

## 7. 고급 패턴 및 기법

### 7.1 Flow와 일시 중단 함수

- Flow는 여러 값을 비동기적으로 방출하는 스트림을 나타냅니다.
- flow 빌더 내에서 일시 중단 함수를 사용하여 비동기 데이터 스트림을 생성할 수 있습니다.

```kotlin
fun fetchNewsPeriodically(): Flow<News> = flow {
    while (true) {
        val latestNews = fetchLatestNews() // 일시 중단 함수
        emit(latestNews) // 결과 방출
        delay(60000) // 1분 대기
    }
}

// 사용 예시
suspend fun collectNews() = coroutineScope {
    fetchNewsPeriodically()
        .collect { news ->
            displayNews(news)
        }
}
```

### 7.2 Mutex와 Semaphore

- 코루틴에서 공유 상태에 대한 접근을 제어하기 위해 일시 중단 기반의 동기화 프리미티브를 사용할 수 있습니다.

```kotlin
suspend fun safeIncrement(counter: AtomicInteger, mutex: Mutex) {
    mutex.withLock {
        // 이 블록은 한 번에 하나의 코루틴만 실행 가능
        val currentValue = counter.get()
        delay(10) // 시뮬레이션된 작업
        counter.set(currentValue + 1)
    }
}
```

### 7.3 타임아웃 처리

- `withTimeout` 또는 `withTimeoutOrNull`을 사용하여 일시 중단 함수의 실행 시간을 제한할 수 있습니다.

```kotlin
suspend fun fetchWithTimeout(url: String): String {
    return withTimeout(5000L) { // 5초 제한
        fetchData(url) // 일시 중단 함수
    }
}

// null 반환 버전
suspend fun fetchWithTimeoutOrNull(url: String): String? {
    return withTimeoutOrNull(5000L) {
        fetchData(url)
    }
}
```

## 8. 실제 활용 사례

### 8.1 Android에서의 활용

- Android에서는 ViewModel, Repository, 각종 유틸리티 클래스에서 일시 중단 함수를 활용할 수 있습니다.

```kotlin
class UserRepository(private val api: UserApi) {
    suspend fun getUser(userId: String): User {
        return withContext(Dispatchers.IO) {
            api.fetchUser(userId)
        }
    }
    
    suspend fun updateUserProfile(user: User): User {
        return withContext(Dispatchers.IO) {
            api.updateUser(user)
        }
    }
}

class UserViewModel(private val repository: UserRepository) : ViewModel() {
    private val _user = MutableLiveData<User>()
    val user: LiveData<User> = _user
    
    fun loadUser(userId: String) {
        viewModelScope.launch {
            try {
                val result = repository.getUser(userId)
                _user.value = result
            } catch (e: Exception) {
                // 오류 처리
            }
        }
    }
}
```

### 8.2 서버 사이드에서의 활용

- 서버 애플리케이션에서는 요청 처리, 데이터베이스 접근, 외부 API 호출 등에 일시 중단 함수를 활용할 수 있습니다.

```kotlin
class OrderService(
    private val repository: OrderRepository,
    private val paymentService: PaymentService,
    private val notificationService: NotificationService
) {
    suspend fun processOrder(order: Order): OrderResult {
        // 트랜잭션 처리
        val savedOrder = repository.saveOrder(order)
        
        // 결제 처리
        val paymentResult = paymentService.processPayment(order.paymentDetails)
        
        // 결제 상태 업데이트
        val updatedOrder = repository.updatePaymentStatus(
            savedOrder.id,
            paymentResult.status
        )
        
        // 알림 발송
        notificationService.sendOrderConfirmation(updatedOrder)
        
        return OrderResult(updatedOrder, paymentResult)
    }
}

// Ktor 서버에서의 사용 예
fun Application.configureRouting() {
    val orderService = OrderService(...)
    
    routing {
        post("/orders") {
            val order = call.receive<Order>()
            val result = orderService.processOrder(order)
            call.respond(result)
        }
    }
}
```

## 9. 모범 사례와 권장 사항

### 9.1 일시 중단 함수 설계 원칙

- 순수성 유지: 일시 중단 함수는 가능한 한 부작용을 최소화하고 예측 가능한 결과를 반환해야 합니다.
- 취소 지원: 일시 중단 함수는 취소를 적절히 처리해야 합니다.
- 컨텍스트 준수: 특정 스레드에서 실행해야 하는 코드는 적절한 디스패처를 사용해야 합니다.

```kotlin
// 좋은 예시
suspend fun fetchData(): Data = withContext(Dispatchers.IO) {
    // 네트워크 요청
}

// 나쁜 예시 - 컨텍스트 지정 없음
suspend fun fetchData(): Data {
    // 이 함수가 어떤 스레드에서 실행될지 불명확함
}
```

### 9.2 안티 패턴

- 블로킹 코드: 일시 중단 함수 내에서 스레드를 차단하는 블로킹 코드를 사용하지 마세요.
- 스레드 지역 변수 의존: 일시 중단 함수는 스레드 간에 이동할 수 있으므로 ThreadLocal에 의존하면 안 됩니다.
- 무거운 계산: CPU 집약적인 작업은 적절한 디스패처에서 실행해야 합니다.

```kotlin
// 나쁜 예시 - 블로킹 코드
suspend fun badFunction() {
    Thread.sleep(1000) // 스레드 차단 - delay(1000) 사용 권장
}

// 좋은 예시 - 적절한 디스패처 사용
suspend fun heavyComputation(): Result = withContext(Dispatchers.Default) {
    // CPU 집약적 작업
}
```

### 9.3 디버깅 팁

- 로깅: 코루틴 컨텍스트와 함께 로그를 남겨 디버깅을 용이하게 합니다.
- 코루틴 이름 지정: 코루틴에 이름을 부여하여 디버깅을 용이하게 합니다.
- 코루틴 디버거 사용: IntelliJ IDEA나 Android Studio의 코루틴 디버거를 활용합니다.

```kotlin
suspend fun debuggableFunction() = coroutineScope {
    launch(CoroutineName("DataLoader") + Dispatchers.IO) {
        println("코루틴 시작: ${coroutineContext[CoroutineName]}")
        // ...
    }
}
```

## 10. 결론

- 일시 중단 함수는 코틀린 코루틴 시스템의 핵심 구성 요소로, 비동기 코드를 동기 코드처럼 작성할 수 있게 해줍니다.
- 이 함수들은 코루틴 내에서 실행되며, 스레드를 차단하지 않고 일시 중단되었다가 재개될 수 있습니다.
- 일시 중단 함수는 컴파일 시점에 상태 머신으로 변환되어 효율적인 비동기 코드 실행을 가능하게 합니다.
- 적절한 패턴과 모범 사례를 따르면 일시 중단 함수를 사용하여 가독성 높고 유지보수하기 쉬운 비동기 코드를 작성할 수 있습니다.

:::info[추가 자료]

- [코틀린 공식 문서 - 코루틴](https://kotlinlang.org/docs/coroutines-overview.html)
- [코틀린 공식 문서 - 일시 중단 함수](https://kotlinlang.org/docs/composing-suspending-functions.html)
- [코루틴 가이드 - 취소와 타임아웃](https://kotlinlang.org/docs/cancellation-and-timeouts.html)
- [Android 개발자 문서 - 코루틴](https://developer.android.com/kotlin/coroutines)
  :::