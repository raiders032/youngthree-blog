---
title: "CoroutineScope"
description: "코틀린 코루틴의 핵심 개념인 CoroutineScope를 상세히 알아봅니다. 스코프의 생명주기 관리, 코루틴 빌더와의 관계, 구조적 동시성 원칙, 그리고 다양한 스코프 종류와 활용 패턴을 실제 코드 예제와 함께 설명합니다."
tags: [ "COROUTINE", "KOTLIN", "CONCURRENCY", "ASYNC", "BACKEND", "ANDROID", "MOBILE" ]
keywords: [ "코루틴", "coroutine", "코루틴스코프", "코루틴 스코프", "coroutine scope", "코루틴빌더", "코루틴 빌더", "launch", "async", "구조적 동시성", "structured concurrency", "lifecycleScope", "viewModelScope", "GlobalScope", "코틀린", "kotlin", "동시성", "concurrency", "비동기", "asynchronous", "안드로이드", "android" ]
draft: false
hide_title: true
---

## 1. CoroutineScope란?

- CoroutineScope는 간단히 말해서 코루틴이 실행되는 "영역" 또는 "컨테이너"입니다. 
- 이것은 코루틴들의 생명주기를 관리하고 그룹화하는 역할을 합니다.

### 1.1 코루틴 빌더와의 관계

- 코루틴 빌더는 코루틴을 생성하는 함수입니다.
- launch, async 같은 코루틴 빌더들은 모두 CoroutineScope의 확장 함수입니다.
- 이 말은 launch, async를 호출하려면 먼저 코루틴 스코프가 필요하다는 뜻입니다.
- 코드로 보면: `someScope.launch { ... }` 이런 식으로 항상 "어떤 스코프 안에서" 코루틴을 시작합니다.
- [Builder 참고](../Builder/Builder.md)

## 2. 구조화된 동시성(Structured Concurrency)

- 코루틴은 구조적 동시성이라는 원칙을 따릅니다. 
- 이는 새로운 코루틴이 오직 특정 CoroutineScope 내에서만 실행될 수 있으며, 이 스코프가 코루틴의 수명을 제한한다는 의미입니다.
- 실제 애플리케이션에서는 많은 코루틴을 실행합니다. 구조적 동시성은 이러한 코루틴들이 손실되거나 누수되지 않도록 보장합니다. 
- 외부 스코프는 모든 자식 코루틴이 완료될 때까지 완료될 수 없습니다. 
- 또한 구조적 동시성은 코드의 오류가 적절히 보고되고 절대 손실되지 않도록 보장합니다.

## 3. CoroutineScope 인터페이스

```kotlin
public interface CoroutineScope {
    public val coroutineContext: CoroutineContext
}
```

- [레퍼런스](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/)
- CoroutineScope는 새로운 코루틴을 위한 스코프(범위)를 정의합니다. 
- 모든 코루틴 빌더(launch, async 등)는 CoroutineScope의 확장 함수이며, 이 스코프의 coroutineContext를 상속받아 모든 컨텍스트 요소와 취소 기능을 자동으로 전파합니다.

## 4. CoroutineScope 구현체

- CoroutineScope 인터페이스를 구현한 클래스들이 있습니다.
- 이들은 다양한 스코프를 제공하며, 각각의 특징에 따라 사용됩니다.
- 가장 대표적인 것은 다음과 같습니다:
	- `GlobalScope`: 앱 전체의 생명주기 동안 살아있는 스코프

## 5. coroutineScope 함수

```kotlin
suspend fun <R> coroutineScope(block: suspend CoroutineScope.() -> R): R
```

- [레퍼런스](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/coroutine-scope.html)
- CoroutineScope를 생성하고 이 스코프와 함께 지정된 일시 중단 블록을 호출합니다. 
- suspend 키워드가 있어 다른 일시 중단 함수 내에서만 호출 가능합니다.
- 외부 스코프의 coroutineContext를 상속받습니다. 특히 외부 Job을 부모로 사용하여 새 Job을 생성합니다.
- 이 스코프 내의 어떤 자식 코루틴이 실패하면, 전체 스코프가 실패하고 다른 모든 자식 코루틴들이 취소됩니다.
- 제공된 블록과 그 안에서 시작된 모든 자식 코루틴이 완료되어야 반환됩니다.

```kotlin
suspend fun doWork() {
    val result = coroutineScope {
        val part1 = async { doSomethingUseful1() }
        val part2 = async { doSomethingUseful2() }
        part1.await() + part2.await()
    }
    // 모든 코루틴이 완료된 후에만 이 지점에 도달합니다
    println("결과: $result")
}
```
- 이 예시에서는 두 개의 비동기 작업을 동시에 시작하고, 두 작업이 모두 완료될 때까지 기다린 후 결과를 조합합니다.

### 5.1 runBlocking과 비교

- 두 빌더는 모두 본문과 모든 자식들이 완료될 때까지 기다린다는 점에서 비슷해 보일 수 있지만, 중요한 차이점이 있습니다.
- runBlocking은 스레드를 차단합니다. 여기서 차단의 의미는 블록 내부의 모든 작업이 완료될 때까지 현재 스레드를 차지한다는 뜻입니다.
- runBlocking과 달리 coroutineScope는 스레드를 차단하지 않고 일시 중단만 합니다.
- 이것이 coroutineScope가 더 효율적인 자원 사용을 가능하게 하는 이유입니다.

참고

- https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/
- https://kotlinlang.org/docs/coroutines-basics.html#structured-concurrency