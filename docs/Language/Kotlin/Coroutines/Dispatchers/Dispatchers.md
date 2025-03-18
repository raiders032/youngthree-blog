---
title: "Dispatcher"
description: "코틀린 코루틴의 핵심 요소인 디스패처(Dispatcher)에 대해 상세히 알아봅니다. 각 디스패처 유형의 특징과 활용 방법, 성능 최적화 전략부터 실제 사용 사례와 주의사항까지 코루틴 디스패처 활용을 위한 모든 것을 다룹니다."
tags: [ "COROUTINE", "DISPATCHER", "KOTLIN", "CONCURRENCY", "ASYNCHRONOUS", "ANDROID", "BACKEND" ]
keywords: [ "코루틴", "coroutine", "디스패처", "dispatcher", "코틀린", "kotlin", "동시성", "concurrency", "비동기", "asynchronous", "스레드풀", "thread pool", "IO 디스패처", "메인 디스패처", "기본 디스패처", "제한된 디스패처", "안드로이드", "백엔드", "서버" ]
draft: false
hide_title: true
---

## 1. 코루틴 디스패처란?

- 코루틴 디스패처(Dispatcher)는 코루틴이 실행될 스레드 또는 스레드 풀을 결정하는 중요한 요소입니다.
- 디스패처는 코루틴의 실행 컨텍스트(CoroutineContext)의 핵심 구성 요소로, 코루틴이 어떤 스레드에서 실행될지를 제어합니다.
- 적절한 디스패처 선택은 애플리케이션의 응답성과 성능에 직접적인 영향을 미칩니다.
- launch와 async 같은 모든 코루틴 빌더들은 선택적으로 CoroutineContext 매개변수를 받을 수 있습니다.
	- 이를 통해 새로운 코루틴을 위한 디스패처와 다른 컨텍스트 요소들을 명시적으로 지정할 수 있습니다.

### 1.1 디스패처의 역할

- 코루틴 코드 블록을 적절한 스레드에 배정(dispatch)합니다.
- 작업 특성에 맞는 스레드 풀을 관리합니다.
- 코루틴 간의 작업 전환과 스레드 전환을 효율적으로 처리합니다.
- 스레드 자원을 효과적으로 활용하여 시스템 성능을 최적화합니다.

:::info
코루틴은 실행되는 스레드에 종속되지 않으며, 한 스레드에서 일시 중단되었다가 다른 스레드에서 재개될 수 있습니다. 이러한 유연성을 제공하는 것이 바로 디스패처의 역할입니다.
:::

## 2. 코틀린에서 제공하는 표준 디스패처

코틀린의 `kotlinx.coroutines` 라이브러리는 다양한 사용 사례에 맞게 설계된 여러 표준 디스패처를 제공합니다.

### 2.1 Dispatchers.Default

- CPU 집약적인 작업을 위해 최적화된 디스패처입니다.
- JVM의 공유 스레드 풀을 사용합니다.
- 기본적으로 시스템 코어 수에 맞춰진 스레드 수(최소 2개)를 갖습니다.
- 명시적으로 디스패처를 지정하지 않으면 기본적으로 사용되는 디스패처입니다.

#### 사용 예시

```kotlin
import kotlinx.coroutines.*

suspend fun performComplexCalculation() {
    withContext(Dispatchers.Default) {
        // CPU 집약적인 계산 작업
        val result = (1..1_000_000).map { it * it }.sum()
        println("계산 결과: $result")
    }
}
```

이 예시에서는 많은 수의 제곱 계산과 합산 과정이 CPU 자원을 집중적으로 사용하므로 Default 디스패처를 사용합니다.

### 2.2 Dispatchers.IO

- 입출력 작업에 최적화된 디스패처입니다.
- 네트워크 요청, 파일 작업, 데이터베이스 연산과 같은 블로킹 I/O 작업에 적합합니다.
- Default 디스패처와 스레드 풀을 공유하지만, 더 많은 스레드를 사용하도록 구성되어 있습니다.
- 많은 스레드가 I/O 작업으로 블로킹되더라도 다른 작업이 계속 실행될 수 있도록 합니다.

#### 사용 예시

```kotlin
import kotlinx.coroutines.*
import java.io.File

suspend fun readFileContent(path: String): String {
    return withContext(Dispatchers.IO) {
        File(path).readText()
    }
}

suspend fun fetchNetworkData(url: String): String {
    return withContext(Dispatchers.IO) {
        // URL 연결 및 데이터 가져오기
        URL(url).readText()
    }
}
```

파일 읽기와 네트워크 요청은 모두 I/O 작업이므로 IO 디스패처를 사용합니다.

### 2.3 Dispatchers.Main

- UI 스레드에서 실행되는 디스패처입니다.
  - 백엔드 애플리케이션에서는 거의 사용하지 않습니다만, 특정 프레임워크에서는 이와 유사한 "메인" 스레드 개념이 있을 수 있습니다.
- 안드로이드, JavaFX, Swing 등의 UI 프레임워크에서 주로 사용됩니다.
- UI 업데이트와 같은 가벼운 작업에 적합합니다.
- 특히 안드로이드에서는 `kotlinx-coroutines-android` 의존성을 추가해야 사용할 수 있습니다.

:::warning
Main 디스패처는 UI 스레드에서 실행되므로, 오래 걸리는 작업을 이 디스패처에서 실행하면 UI가 멈추거나 응답하지 않을 수 있습니다.
:::

#### 사용 예시 (안드로이드)

```kotlin
import kotlinx.coroutines.*
import android.widget.TextView

suspend fun updateUI(result: String, textView: TextView) {
    withContext(Dispatchers.Main) {
        textView.text = result
    }
}

// 실제 사용 사례
suspend fun loadAndDisplayData(textView: TextView) {
    val result = withContext(Dispatchers.IO) {
        // 백그라운드에서 데이터 로드
        fetchDataFromNetwork()
    }
    
    // UI 업데이트는 Main 스레드에서
    updateUI(result, textView)
}
```

UI 요소를 업데이트하려면 반드시 Main 디스패처를 사용해야 합니다.

### 2.4 Dispatchers.Unconfined

- 특별한 디스패처로, 코루틴을 특정 스레드에 제한하지 않습니다.
- 동작 방식
  - 특별한 디스패처로, 코루틴이 시작된 스레드에서 실행을 시작합니다.
  - 코루틴이 첫 번째 일시 중단 지점(예: delay() 호출)에 도달하면 코루틴 실행이 중단됩니다.
  - 코루틴이 다시 재개될 때, 어떤 스레드가 재개를 트리거했는지에 상관없이 그 스레드에서 코드가 계속 실행됩니다.
  - 이를 반복합니다.
- Unconfined는 스레드를 확정하지 않고(unconfined = '제한되지 않은') 코루틴이 어떤 스레드에서 깨어나든 그 스레드에서 계속 실행되도록 합니다.
- 문서에도 명시되어 있듯이 일반적으로 사용하지 않는 것이 좋습니다.
  - 코루틴이 어떤 스레드에서 실행될지 예측하기 어려워집니다. 이는 코드 디버깅을 복잡하게 만들 수 있습니다.
- 정확한 스레드 제어가 필요하지 않은 유닛 테스트에서 가끔 사용될 수 있습니다.

:::danger
Dispatchers.Unconfined는 예측하기 어려운 동작을 초래할 수 있으므로 확실히 이해하고 있지 않다면 사용을 피하는 것이 좋습니다.
:::

#### 사용 예시

```kotlin
import kotlinx.coroutines.*

suspend fun demonstrateUnconfinedDispatcher() {
    withContext(Dispatchers.Unconfined) {
        println("시작: ${Thread.currentThread().name}")
        
        delay(100) // 일시 중단 지점
        
        println("재개: ${Thread.currentThread().name}")
        // 일시 중단 후 다른 스레드에서 재개될 수 있음
    }
}
```

이 예시에서는 코루틴이 일시 중단된 후 다른 스레드에서 재개될 수 있음을 보여줍니다.

## 3. 커스텀 디스패처 생성 및 활용

- 기본 제공되는 디스패처 외에도 특정 요구 사항에 맞는 커스텀 디스패처를 생성하여 사용할 수 있습니다.

### 3.1 newSingleThreadContext

- 코루틴 실행을 위한 새로운 단일 스레드를 생성합니다.
- 동시에 하나의 작업만 처리하므로 순서가 중요한 작업에 적합합니다.
- 리소스를 명시적으로 해제해야 하므로 주의가 필요합니다.

#### 사용 예시

```kotlin
import kotlinx.coroutines.*

suspend fun useSingleThreadContext() {
    val singleThreadContext = newSingleThreadContext("SingleThreadCtx")
    
    try {
        withContext(singleThreadContext) {
            println("단일 스레드에서 실행 중: ${Thread.currentThread().name}")
            // 순차적으로 처리해야 하는 작업
        }
    } finally {
        // 리소스 해제
        singleThreadContext.close()
    }
}
```

이 디스패처는 사용 후 반드시 `close()` 메서드로 리소스를 해제해야 합니다.

### 3.2 newFixedThreadPoolContext

- 지정된 수의 스레드를 가진 새로운 스레드 풀을 생성합니다.
- 동시에 처리할 작업 수를 제한해야 할 때 유용합니다.
- 특정 작업 그룹에 전용 스레드 풀이 필요할 때 사용합니다.

#### 사용 예시

```kotlin
import kotlinx.coroutines.*

suspend fun useFixedThreadPool() {
    val fixedThreadPool = newFixedThreadPoolContext(4, "QuadCore")
    
    try {
        withContext(fixedThreadPool) {
            // 병렬로 여러 작업 실행
            val jobs = List(10) { index ->
                launch {
                    println("작업 $index는 ${Thread.currentThread().name}에서 실행 중")
                    delay(1000)
                }
            }
            jobs.forEach { it.join() }
        }
    } finally {
        // 리소스 해제
        fixedThreadPool.close()
    }
}
```

- 4개의 스레드를 가진 풀을 생성하여 10개의 작업을 실행합니다.

### 3.3 제한된 디스패처 (limitedParallelism)

- 기존 디스패처의 병렬성을 제한하는 새로운 디스패처를 생성합니다.
- 코틀린 1.6부터 추가된 기능으로, 리소스 사용량을 더 세밀하게 제어할 수 있습니다.
- 특히 IO 작업에서 동시 접속 수를 제한할 때 유용합니다.

#### 사용 예시

```kotlin
import kotlinx.coroutines.*

suspend fun useLimitedParallelism() {
    // IO 디스패처에서 최대 10개의 스레드만 사용하는 제한된 디스패처
    val limitedDispatcher = Dispatchers.IO.limitedParallelism(10)
    
    withContext(limitedDispatcher) {
        // 최대 10개의 스레드로 제한된 병렬 작업
        val jobs = List(20) { index ->
            launch {
                println("작업 $index 시작")
                delay(1000)
                println("작업 $index 완료")
            }
        }
        jobs.forEach { it.join() }
    }
}
```

- 이 예시에서는 IO 디스패처의 병렬성을 10개 스레드로 제한합니다.

## 4. 디스패처 전환과 컨텍스트 관리

- 코루틴은 실행 중에 다른 디스패처로 전환할 수 있으며, 이는 다양한 작업 특성에 맞게 최적의 환경을 제공합니다.

### 4.1 withContext를 사용한 디스패처 전환

- `withContext`는 현재 코루틴의 컨텍스트를 일시적으로 변경합니다.
- 블록이 완료되면 원래 컨텍스트로 돌아갑니다.
- 디스패처 전환에 가장 많이 사용되는 방법입니다.

#### 사용 예시

```kotlin
import kotlinx.coroutines.*

suspend fun loadAndProcessData() {
    // UI 스레드에서 시작
    val result = withContext(Dispatchers.IO) {
        // IO 스레드에서 데이터 로드
        val data = fetchDataFromNetwork()
        
        // 데이터 처리는 CPU 집약적인 작업이므로 Default 디스패처로 전환
        val processedData = withContext(Dispatchers.Default) {
            processData(data)
        }
        
        processedData
    }
    
    // 다시 UI 스레드로 돌아와서 결과 표시
    updateUI(result)
}
```

이 코드는 네트워크 작업, 데이터 처리, UI 업데이트에 각각 최적화된 디스패처를 사용합니다.

### 4.2 launch와 async에서의 디스패처 지정

- 새 코루틴을 시작할 때 디스패처를 지정할 수 있습니다.
- `launch`와 `async` 코루틴 빌더의 첫 번째 매개변수로 컨텍스트를 전달합니다.

#### 사용 예시

```kotlin
import kotlinx.coroutines.*

fun CoroutineScope.performParallelTasks() {
    // IO 디스패처에서 실행되는 코루틴
    val networkJob = launch(Dispatchers.IO) {
        val result = fetchDataFromNetwork()
        println("네트워크 결과: $result")
    }
    
    // Default 디스패처에서 실행되는 코루틴
    val computationJob = launch(Dispatchers.Default) {
        val result = performComplexCalculation()
        println("계산 결과: $result")
    }
    
    // 병렬로 실행된 두 작업이 모두 완료될 때까지 대기
    runBlocking {
        networkJob.join()
        computationJob.join()
    }
}
```

이 예시에서는 네트워크 작업과 복잡한 계산 작업을 서로 다른 디스패처에서 병렬로 실행합니다.

### 4.3 컨텍스트 결합과 상속

- 코루틴은 부모 코루틴의 컨텍스트를 상속받습니다.
- `+` 연산자를 사용하여 여러 컨텍스트 요소를 결합할 수 있습니다.

#### 사용 예시

```kotlin
import kotlinx.coroutines.*

fun CoroutineScope.demonstrateContextCombination() {
    // 기본 컨텍스트에 이름 추가
    launch(Dispatchers.Default + CoroutineName("NamedCoroutine")) {
        println("코루틴 이름: ${coroutineContext[CoroutineName]?.name}")
        println("디스패처: ${coroutineContext[ContinuationInterceptor]}")
        
        // 하위 코루틴은 부모의 컨텍스트(디스패처와 이름)를 상속
        launch {
            println("하위 코루틴 이름: ${coroutineContext[CoroutineName]?.name}")
            println("하위 코루틴 디스패처: ${coroutineContext[ContinuationInterceptor]}")
        }
    }
}
```

이 예시는 컨텍스트 요소를 결합하고 하위 코루틴이 부모의 컨텍스트를 상속받는 방식을 보여줍니다.

## 5. 디스패처 선택 가이드라인

상황에 맞는 최적의 디스패처를 선택하는 것은 코루틴의 효율성과 애플리케이션의 성능에 큰 영향을 미칩니다.

### 5.1 작업 유형별 권장 디스패처

- **CPU 집약적인 작업**: 복잡한 계산, 데이터 처리, 알고리즘 실행
	- 권장: `Dispatchers.Default`
	- 이유: CPU 코어 수에 최적화된 스레드 풀 제공
- **I/O 작업**: 파일 읽기/쓰기, 네트워크 통신, 데이터베이스 작업
	- 권장: `Dispatchers.IO`
	- 이유: 많은 스레드를 활용하여 I/O 블로킹 작업을 효율적으로 처리
- **UI 관련 작업**: UI 요소 업데이트, 사용자 이벤트 처리
	- 권장: `Dispatchers.Main`
	- 이유: UI 프레임워크의 메인 스레드에서 실행되어야 함
- **순서가 중요한 작업**: 순차적으로 처리해야 하는 작업
	- 권장: `newSingleThreadContext`
	- 이유: 단일 스레드에서 처리하여 순서 보장
- **제한된 동시성이 필요한 작업**: 리소스 사용량을 제한해야 하는 작업
	- 권장: `limitedParallelism`을 사용한 제한된 디스패처
	- 이유: 동시 실행 스레드 수를 제한하여 리소스 관리

### 5.2 실제 사용 시나리오와 권장 패턴

#### 안드로이드 앱에서의 네트워크 요청 처리

```kotlin
import kotlinx.coroutines.*
import android.widget.TextView

class NetworkRepository {
    suspend fun fetchData(): String {
        return withContext(Dispatchers.IO) {
            // 네트워크 요청 수행
            api.fetchData()
        }
    }
}

class DataProcessor {
    suspend fun processData(rawData: String): ProcessedData {
        return withContext(Dispatchers.Default) {
            // CPU 집약적인 데이터 처리
            parseAndTransform(rawData)
        }
    }
}

class MainActivity : AppCompatActivity() {
    private val repository = NetworkRepository()
    private val processor = DataProcessor()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        val resultTextView = findViewById<TextView>(R.id.resultTextView)
        
        lifecycleScope.launch {
            try {
                val rawData = repository.fetchData()
                val processedData = processor.processData(rawData)
                
                // UI 업데이트는 Main 디스패처에서
                withContext(Dispatchers.Main) {
                    resultTextView.text = processedData.toString()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    resultTextView.text = "오류 발생: ${e.message}"
                }
            }
        }
    }
}
```

이 패턴은 각 작업 유형에 맞는 디스패처를 사용하여 안드로이드 앱의 성능과 응답성을 최적화합니다.

#### 백엔드 서비스에서의 데이터베이스 작업

```kotlin
import kotlinx.coroutines.*
import java.sql.Connection

class DatabaseService {
    // 데이터베이스 연결 수를 10개로 제한
    private val dbDispatcher = Dispatchers.IO.limitedParallelism(10)
    
    suspend fun fetchUsers(): List<User> {
        return withContext(dbDispatcher) {
            // 데이터베이스 작업 수행
            val connection = getConnection()
            try {
                // SQL 쿼리 실행 및 결과 변환
                executeQuery(connection, "SELECT * FROM users")
            } finally {
                connection.close()
            }
        }
    }
    
    suspend fun processUserData(users: List<User>): List<UserStats> {
        return withContext(Dispatchers.Default) {
            // 사용자 데이터 처리는 CPU 집약적인 작업
            users.map { calculateUserStatistics(it) }
        }
    }
}
```

이 예시는 백엔드 서비스에서 데이터베이스 연결 수를 제한하고 데이터 처리에 적절한 디스패처를 사용하는 방법을 보여줍니다.

## 6. 디스패처 성능 최적화 및 디버깅

코루틴 디스패처를 효율적으로 사용하고 문제를 해결하기 위한 고급 기법들을 알아봅시다.

### 6.1 디스패처 성능 모니터링 및 최적화

- 스레드 덤프와 프로파일링 도구를 사용하여 디스패처 성능을 모니터링합니다.
- 적절한 병렬성 레벨을 설정하여 스레드 전환 오버헤드를 최소화합니다.
- 작업 특성에 따라 디스패처를 선택하여 시스템 리소스를 효율적으로 활용합니다.

#### 성능 최적화 팁

```kotlin
import kotlinx.coroutines.*

// 여러 작은 I/O 작업을 그룹화하여 디스패처 전환 오버헤드 줄이기
suspend fun optimizedDataFetch() {
    return withContext(Dispatchers.IO) {
        // 여러 I/O 작업을 병렬로 실행
        val result1 = async { api.fetchData1() }
        val result2 = async { api.fetchData2() }
        val result3 = async { api.fetchData3() }
        
        // 모든 결과 조합
        combineResults(result1.await(), result2.await(), result3.await())
    }
}

// CPU 집약적인 작업에 코어 수에 맞는 병렬성 제한
val cpuDispatcher = Dispatchers.Default.limitedParallelism(
    Runtime.getRuntime().availableProcessors()
)
```

여러 작은 작업을 그룹화하고 CPU 코어 수에 맞게 병렬성을 조정하면 성능을 향상시킬 수 있습니다.

### 6.2 디스패처 관련 문제 해결 및 디버깅

- 스레드 스타베이션(Thread Starvation)
- 스레드 누수(Thread Leakage)
- 데드락(Deadlock)
- 과도한 컨텍스트 전환

#### 디버깅 도구 및 기법

```kotlin
import kotlinx.coroutines.*

// 디버깅을 위한 코루틴 이름 지정
launch(Dispatchers.IO + CoroutineName("NetworkFetch")) {
    // 작업 내용
}

// 디버그 모드에서 코루틴 정보 출력
withContext(Dispatchers.Default) {
    println("현재 스레드: ${Thread.currentThread().name}")
    println("코루틴 이름: ${coroutineContext[CoroutineName]}")
    println("디스패처: ${coroutineContext[ContinuationInterceptor]}")
}
```

코루틴에 이름을 지정하고 컨텍스트 정보를 출력하면 디버깅이 용이해집니다.

### 6.3 일반적인 안티패턴과 주의사항

:::danger
아래 패턴들은 성능 문제와 버그를 유발할 수 있으므로 피해야 합니다.
:::

- **UI 스레드에서 오래 걸리는 작업 실행**: Main 디스패처에서 무거운 작업을 실행하면 UI가 멈춥니다.
- **불필요한 디스패처 전환**: 과도한 `withContext` 호출은 성능 오버헤드를 발생시킵니다.
- **잘못된 디스패처 선택**: I/O 작업에 Default 디스패처를 사용하거나, CPU 작업에 IO 디스패처를 사용하는 경우
- **리소스 해제 실패**: `newSingleThreadContext`와 같은 디스패처를 사용 후 해제하지 않는 경우
- **전역 디스패처 커스터마이징**: 표준 디스패처를 전역적으로 수정하면 예상치 못한 영향을 미칠 수 있습니다.

#### 안티패턴 예시와 개선 방법

```kotlin
// 안티패턴: Main 디스패처에서 무거운 작업 실행
launch(Dispatchers.Main) {
    processLargeData() // UI가 멈춤
}

// 개선: 적절한 디스패처 사용
launch(Dispatchers.Main) {
    val result = withContext(Dispatchers.Default) {
        processLargeData()
    }
    updateUI(result) // UI 업데이트만 Main 디스패처에서
}

// 안티패턴: 불필요한 디스패처 전환
withContext(Dispatchers.IO) {
    val data = fetchData()
    withContext(Dispatchers.Default) {
        // 여기서는 Default 디스패처로 전환할 필요 없음
        val processed = processData(data)
        withContext(Dispatchers.IO) {
            // 다시 IO 디스패처로 돌아올 필요 없음
            saveData(processed)
        }
    }
}

// 개선: 최적화된 디스패처 전환
withContext(Dispatchers.IO) {
    val data = fetchData()
    // IO 작업이 완료된 후 CPU 작업으로 전환
    val processed = withContext(Dispatchers.Default) {
        processData(data)
    }
    // CPU 작업 완료 후 다시 IO 작업으로 전환
    saveData(processed)
}
```

불필요한 디스패처 전환을 줄이고 작업 특성에 맞는 디스패처를 사용하면 성능이 향상됩니다.

## 7. 결론

- 코틀린 코루틴의 디스패처는 비동기 프로그래밍의 핵심 요소로, 스레드 관리를 추상화하고 효율적인 동시성을 제공합니다.
- 각 디스패처는 특정 유형의 작업에 최적화되어 있으며, 적절한 디스패처 선택은 애플리케이션의 성능과 응답성에 직접적인 영향을 미칩니다.
- Dispatchers.Default, Dispatchers.IO, Dispatchers.Main과 같은 표준 디스패처는 대부분의 사용 사례를 커버

참고

- https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html
- https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-dispatcher/