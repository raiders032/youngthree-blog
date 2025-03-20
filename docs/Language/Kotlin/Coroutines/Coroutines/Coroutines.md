---
title: "Coroutine"
description: "코틀린의 코루틴에 대한 기본 개념부터 실제 활용까지 알아봅니다. 루틴과 코루틴의 차이, 코루틴의 핵심 원리와 스레드 양보 메커니즘, 그리고 코루틴이 안드로이드 개발에 가져온 변화를 살펴봅니다."
tags: [ "COROUTINE", "KOTLIN", "ASYNC", "ANDROID", "BACKEND", "JVM" ]
keywords: [ "코루틴", "coroutine", "코틀린", "kotlin", "비동기", "asynchronous", "async", "동시성", "concurrency", "스레드", "thread", "일시 중단", "suspension", "안드로이드", "android", "백엔드", "backend", "JVM", "delay", "launch", "async", "await", "flow", "채널", "channel", "디스패처", "dispatcher" ]
draft: false
hide_title: true
---

## 1. 코루틴의 개념과 배경

- 코틀린 코루틴(Coroutine)은 비동기 프로그래밍을 간소화하기 위해 설계된 강력한 도구입니다.
- 비동기 작업을 마치 동기 코드처럼 작성할 수 있게 해주어, 복잡한 콜백 구조나 스레드 관리로부터 개발자를 해방시켜 줍니다.
- 하지만 코루틴을 제대로 이해하기 위해서는 먼저 기본적인 개념부터 살펴볼 필요가 있습니다.

### 1.1 루틴, 서브루틴, 코루틴의 관계

- 루틴
	- 루틴은 컴퓨터 프로그램의 일부로, 특정한 일을 실행하기 위한 일련의 명령입니다. 이를 함수 또는 프로시저라고도 합니다.
	- 루틴은 프로그램의 흐름을 구성하는 기본 단위로, 메인 루틴과 서브 루틴으로 나뉩니다.
	- 메인 루틴은 프로그램의 주 흐름을 담당하며, 서브 루틴은 메인 루틴 내에서 호출되어 특정 작업을 수행합니다
- 서브루틴
	- 서브루틴은 메인 루틴 내에서 호출되는 함수로, 프로그램의 특정 부분을 처리합니다.
	- 서브루틴은 호출 시점에 실행이 시작되고, 종료 시점에 호출한 루틴으로 돌아갑니다
	- 서브루틴은 항상 호출한 지점에서 시작하여 완료될 때까지 제어권을 가지며, 호출한 루틴은 서브루틴이 완료될 때까지 다른 작업을 수행할 수 없습니다.
	- 서브루틴은 한 번 호출되면 실행이 완료될 때까지 다른 작업을 수행할 수 없습니다.
	- 즉, 서브루틴이 실행 중일 때는 다른 서브루틴이나 메인 루틴의 실행이 중단됩니다
- 코루틴(Coroutine)
	- 여기서 코루틴은 협력적(Co-operative)으로 실행되는 루틴을 의미합니다.
	- 코루틴은 실행 중간에 중단되었다가 나중에 중단된 지점에서 다시 실행을 재개할 수 있는 특별한 형태의 루틴입니다.

:::info[용어의 기원]
'코루틴(Coroutine)'이라는 용어는 '함께(Co)'와 '루틴(Routine)'의 합성어로, 1958년 Melvin Conway가 처음 사용했습니다. 이는 여러 루틴이 협력적으로 실행되는 개념을 설명하기 위해
만들어졌습니다.
:::

### 1.2 코루틴과 스레드의 차이

- 코루틴과 스레드는 모두 동시성 프로그래밍을 가능하게 하지만, 중요한 차이점이 있습니다:
- **스레드**는 운영체제 수준에서 관리되며, 컨텍스트 스위칭 비용이 큽니다.
- **코루틴**은 프로그램 수준에서 관리되며, 매우 가벼운 컨텍스트 스위칭을 제공합니다.
- 하나의 스레드에서 수천 개의 코루틴을 실행할 수 있습니다.
- 코루틴은 언제 실행을 일시 중단하고 재개할지 명시적으로 제어할 수 있습니다.
- 이러한 특성 덕분에 코루틴은 비동기 작업을 효율적으로 처리하면서도 동기 코드와 유사한 직관적인 방식으로 코드를 작성할 수 있게 해줍니다.

:::info
코루틴은 일시 중단 가능한 계산의 인스턴스입니다. 개념적으로 스레드와 유사한데, 다른 코드와 동시에 실행되는 코드 블록을 가진다는 점에서 그렇습니다. 그러나 코루틴은 특정 스레드에 구속되지 않습니다. 하나의 스레드에서 실행을 일시 중단하고 다른 스레드에서 재개할 수 있습니다.
:::

## 2. 코루틴의 핵심 원리: 스레드 양보 메커니즘

- 코루틴의 핵심은 스레드 양보(yielding) 메커니즘에 있습니다.
- 이는 코루틴이 실행 중 필요에 따라 현재 사용 중인 스레드를 다른 코루틴에게 양보하고 나중에 다시 실행을 재개할 수 있게 해줍니다.

### 2.1 일반 루틴과 코루틴의 근본적 차이

- 일반 루틴과 코루틴의 가장 큰 차이점은 스레드 사용 방식에 있습니다
- **일반 루틴(함수)**
	- 블로킹 호출(I/O 작업, 네트워크 요청 등)이 발생하면 해당 스레드를 계속 점유한 채 블록 상태로 유지합니다.
	- 이는 스레드 리소스를 비효율적으로 사용하게 만들며, 특히 다수의 동시 작업이 필요한 경우 스레드 풀 고갈로 이어질 수 있습니다.
- **코루틴**
	- 블로킹 작업을 만나면 현재 스레드를 양보하고 일시 중단(suspend)됩니다.
	- 이 스레드는 다른 코루틴이 사용할 수 있게 되며, 일시 중단된 코루틴은 나중에 블로킹 작업이 완료되면 (동일하거나 다른) 스레드에서 실행을 재개합니다.
	- 이를 통해 적은 수의 스레드로도 많은 동시 작업을 효율적으로 처리할 수 있게 됩니다.
	- 이러한 특성은 특히 I/O 바운드 작업이 많은 애플리케이션(웹 서버, 모바일 앱 등)에서 큰 이점을 제공합니다.

### 2.2 스레드 양보가 발생하는 상황

- 코루틴에서 스레드 양보가 발생하는 주요 상황은 다음과 같습니다:

#### 2.2.1 delay 함수 호출

- 코루틴이 `delay` 함수를 호출하면, 해당 코루틴은 사용하던 스레드를 양보하고 지정된 시간 동안 일시 중단됩니다.
- 이 시간 동안 다른 코루틴이 해당 스레드를 사용할 수 있습니다.

```kotlin
suspend fun example() {
    println("시작")
    delay(1000) // 1초 동안 현재 코루틴 일시 중단 (스레드 양보)
    println("1초 후")
}
```

#### 2.2.2 Job.join() 또는 Deferred.await() 호출

- 이러한 함수들이 호출되면, 해당 함수를 호출한 코루틴은 스레드를 양보하고, 대상 코루틴이 완료될 때까지 일시 중단됩니다.
- 이를 통해 코루틴 간의 종속성을 쉽게 관리할 수 있습니다.

```kotlin
val job = launch {
    // 시간이 걸리는 작업
    delay(2000)
}
job.join() // job이 완료될 때까지 현재 코루틴 일시 중단

val deferred = async {
    // 결과를 반환하는 시간이 걸리는 작업
    delay(2000)
    "결과"
}
val result = deferred.await() // 결과가 준비될 때까지 현재 코루틴 일시 중단
```

#### 2.2.3 yield 함수 호출

- 명시적으로 스레드 사용 권한을 양보해야 할 때 사용됩니다.

```kotlin
suspend fun processData(items: List<Item>) {
    for (item in items) {
        process(item)
        yield() // 다른 코루틴에게 실행 기회 제공
    }
}
```

### 2.3 코루틴의 실행 스레드 특성

- 코루틴의 실행 스레드와 관련된 중요한 특성은 다음과 같습니다:
- 코루틴이 스레드를 양보하면 일시 중단되고, 이후 재개될 때 실행 스레드가 바뀔 수 있습니다.
- 코루틴이 스레드를 양보하지 않으면 실행 스레드가 바뀌지 않습니다.
- 이러한 특성은 코루틴이 효율적으로 스레드 리소스를 활용할 수 있게 해주며, 특히 I/O 작업이나 네트워크 요청과 같은 비동기 작업을 처리할 때 큰 이점을 제공합니다.

## 3. 코루틴의 주요 구성 요소

- 코틀린 코루틴은 여러 핵심 구성 요소로 이루어져 있으며, 이들이 함께 작동하여 강력한 비동기 프로그래밍 모델을 제공합니다.

### 3.1 코루틴 빌더

- 코루틴 빌더는 코루틴을 시작하는 함수입니다.
- 주요 코루틴 빌더로는 다음과 같은 것들이 있습니다
- [자세한 내용 Builder 참고](../Builder/Builder.md)

#### 3.1.1 launch

- **launch**: 결과를 반환하지 않는 코루틴을 시작하며, Job 객체를 반환합니다.

```kotlin
val job = scope.launch {
    // 백그라운드 작업 수행
    delay(1000)
    println("작업 완료")
}
```

#### 3.1.2 async

- **async**: 결과를 반환하는 코루틴을 시작하며, `Deferred<T>` 객체를 반환합니다.

```kotlin
val deferred = scope.async {
    // 결과를 계산하는 작업
    delay(1000)
    "계산된 결과"
}
val result = deferred.await() // 결과 기다리기
```

#### 3.1.3 runBlocking

- **runBlocking**: 코루틴 내부의 모든 작업이 완료될 때까지 현재 스레드를 블로킹합니다. 주로 테스트나 메인 함수에서 사용됩니다.

```kotlin
runBlocking {
    delay(2000)
    println("2초 후")
}
println("runBlocking 이후") // 2초 후에 출력됨
```

### 3.2 코루틴 스코프

- 코루틴 스코프는 코루틴의 생명주기를 정의합니다.
- 모든 코루틴은 특정 스코프 내에서 실행되며, 해당 스코프가 취소되면 그 안의 모든 코루틴도 취소됩니다.
- **GlobalScope**: 애플리케이션 전체 수명 동안 존재하는 스코프입니다. 사용을 권장하지 않습니다.
- **CoroutineScope**: 사용자 정의 스코프를 생성할 수 있습니다.
- **viewModelScope**, **lifecycleScope**: 안드로이드에서 특정 컴포넌트의 생명주기에 맞춰 관리되는 스코프입니다.
- [CoroutineScope 참고](../CoroutineScope/CoroutineScope.md)

```kotlin
class MyViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            // ViewModel이 제거될 때 자동으로 취소됨
            val data = repository.fetchData()
            _liveData.value = data
        }
    }
}
```

### 3.3 디스패처

- 디스패처는 코루틴이 실행될 스레드나 스레드 풀을 결정합니다.
- 코틀린은 다음과 같은 기본 디스패처를 제공합니다:
	- **Dispatchers.Default**: CPU 집약적인 작업에 최적화된 스레드 풀
	- **Dispatchers.IO**: I/O 작업에 최적화된 스레드 풀
	- **Dispatchers.Main**: 안드로이드나 스윙과 같은 UI 프레임워크에서 메인 스레드에 접근
- [Dispatchers 참고](../Dispatchers/Dispatchers.md)

```kotlin
// CPU 집약적인 작업
launch(Dispatchers.Default) {
    // 복잡한 계산 수행
}

// I/O 작업
launch(Dispatchers.IO) {
    // 파일 읽기/쓰기 또는 네트워크 요청
}

// UI 업데이트
launch(Dispatchers.Main) {
    // UI 컴포넌트 업데이트
}
```

## 4. 코루틴의 실제 활용

- 코루틴은 다양한 실제 시나리오에서 강력한 도구로 활용될 수 있습니다.
- 특히 안드로이드 개발에서 코루틴의 도입은 비동기 프로그래밍 방식을 크게 개선했습니다.

### 4.1 안드로이드 개발에서의 코루틴 활용

- 안드로이드 개발에서 코루틴은 다음과 같은 상황에서 특히 유용합니다:
- **네트워크 요청**: Retrofit과 함께 사용하여 네트워크 요청을 간단히 처리할 수 있습니다.

```kotlin
viewModelScope.launch {
    try {
        val response = apiService.fetchData() // suspend 함수
        _data.value = response
    } catch (e: Exception) {
        _error.value = e.message
    }
}
```

- **Room 데이터베이스 접근**: 로컬 데이터베이스 작업을 메인 스레드 외부에서 쉽게 처리할 수 있습니다.

```kotlin
viewModelScope.launch {
    val users = userDao.getAllUsers() // suspend 함수
    _usersLiveData.value = users
}
```

- **병렬 작업 처리**: 여러 비동기 작업을 병렬로 실행하고 모든 결과를 기다릴 수 있습니다.

```kotlin
viewModelScope.launch {
    val deferreds = listOf(
        async { repository.fetchDataFromSource1() },
        async { repository.fetchDataFromSource2() }
    )
    val results = deferreds.awaitAll()
    _combinedData.value = combineResults(results)
}
```

### 4.2 백엔드 개발에서의 코루틴 활용

- 코루틴은 Ktor나 Spring WebFlux와 같은 프레임워크를 사용한 백엔드 개발에서도 큰 이점을 제공합니다:
- **높은 처리량**: 적은 수의 스레드로 많은 요청을 처리할 수 있습니다.
- **간결한 비동기 코드**: 복잡한 콜백이나 반응형 체인 없이 직관적인 코드 작성이 가능합니다.
- **리소스 효율성**: 스레드를 블로킹하지 않고 I/O 작업을 효율적으로 처리합니다.

```kotlin
// Ktor 서버에서의 코루틴 사용 예
get("/users") {
    val users = userRepository.getAllUsers() // suspend 함수
    call.respond(users)
}
```

### 4.3 고급 코루틴 기능

실제 애플리케이션에서는 다음과 같은 고급 코루틴 기능도 유용하게 활용됩니다:

- **Flow**: 비동기적으로 계산되는 데이터 스트림을 표현합니다.

```kotlin
val dataFlow: Flow<Data> = repository.getDataFlow()

viewModelScope.launch {
    dataFlow.collect { data ->
        // 데이터 처리
    }
}
```

- **채널**: 코루틴 간 통신을 위한 파이프라인을 제공합니다.

```kotlin
val channel = Channel<Event>()

// 이벤트 보내기
launch {
    channel.send(Event("something happened"))
}

// 이벤트 받기
launch {
    for (event in channel) {
        // 이벤트 처리
    }
}
```

- **공유 상태 관리**: 뮤텍스와 같은 동기화 프리미티브를 사용하여 공유 상태를 안전하게 관리합니다.

```kotlin
val mutex = Mutex()
var sharedState = 0

launch {
    mutex.withLock {
        // 공유 상태 안전하게 업데이트
        sharedState++
    }
}
```

## 5. 코루틴 사용 시 주의사항

- 코루틴은 강력한 도구이지만, 적절히 사용하기 위해 몇 가지 주의해야 할 점이 있습니다.

### 5.1 예외 처리

- 코루틴 내에서 발생한 예외는 코루틴의 상위 계층으로 전파되며, 적절히 처리되지 않으면 애플리케이션 충돌을 유발할 수 있습니다.
- [ExceptionsHandling 참고](../ExceptionsHandling/ExceptionsHandling.md)

```kotlin
// 예외 처리 방법
launch {
    try {
        // 예외가 발생할 수 있는 코드
    } catch (e: Exception) {
        // 예외 처리
    }
}

// 또는 코루틴 컨텍스트에 예외 핸들러 제공
val exceptionHandler = CoroutineExceptionHandler { _, exception ->
    // 예외 처리
}

launch(exceptionHandler) {
    // 코드
}
```

### 5.2 코루틴 취소 처리

- 장시간 실행되는 코루틴은 적절히 취소될 수 있어야 합니다.
- 코루틴 취소는 협력적이므로, 코루틴 코드가 취소 요청을 감지하고 적절히 대응해야 합니다.
- [Cancellation 참고](../Cancellation/Cancellation.md)

```kotlin
val job = launch {
    while (isActive) { // 취소 확인
        // 작업 수행
    }
}

// 나중에 코루틴 취소
job.cancel()
```

### 5.3 메모리 누수 방지

- 특히 안드로이드와 같은 환경에서는 적절한 스코프를 사용하여 메모리 누수를 방지해야 합니다.

```kotlin
// 나쁜 예: GlobalScope 사용
GlobalScope.launch {
    // 애플리케이션 생명주기 동안 계속 실행됨
}

// 좋은 예: 컴포넌트 생명주기에 맞는 스코프 사용
viewModelScope.launch {
    // ViewModel이 제거될 때 자동으로 취소됨
}
```

## 6. 결론

- 코틀린 코루틴은 비동기 프로그래밍의 복잡성을 크게 줄이면서도 고성능 애플리케이션을 개발할 수 있게 해주는 강력한 도구입니다.
- 루틴, 서브루틴과 달리 코루틴은 서로 협력적으로 실행되며 필요에 따라 스레드를 양보하는 메커니즘을 통해 효율적인 리소스 활용을 가능하게 합니다.
- 코루틴의 주요 장점은 다음과 같습니다:
	- 복잡한 비동기 코드를 동기 코드처럼 직관적으로 작성할 수 있습니다.
	- 가벼운 구현으로 수천 개의 동시 작업을 효율적으로 처리할 수 있습니다.
	- 코드의 가독성과 유지보수성이 크게 향상됩니다.
	- 비동기 작업의 취소와 예외 처리가 간소화됩니다.