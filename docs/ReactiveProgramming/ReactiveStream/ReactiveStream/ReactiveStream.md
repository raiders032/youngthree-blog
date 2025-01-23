---
title: "Reactive Streams 완벽 가이드"
description: "Reactive Streams의 등장 배경부터 핵심 컴포넌트인 Publisher, Subscriber, Subscription, Processor의 상세 스펙까지 알아봅니다. 비동기 스트림 처리의 표준을 이해하고 실제 프로젝트에 적용하기 위한 포괄적인 가이드입니다."
tags: [ "REACTIVE_STREAMS", "JAVA", "ASYNC", "BACKEND", "PROGRAMMING" ]
keywords: [ "리액티브 스트림즈", "reactive streams", "리액티브", "reactive", "비동기", "async", "논블록킹", "non-blocking", "자바", "java", "백엔드", "backend", "프로그래밍", "역압력", "backpressure", "발행구독", "pub/sub", "퍼블리셔", "publisher", "서브스크라이버", "subscriber" ]
draft: false
hide_title: true
---

## 1. 등장 배경과 핵심 개념

### 1.1 데이터 스트림이란?

- 데이터 스트림은 시간에 따라 연속적으로 발생하는 데이터의 흐름을 의미합니다.
- 전통적인 데이터 처리 방식과 비교했을 때 다음과 같은 특징이 있습니다:
	- **동적인 데이터 크기**
		- 기존 컬렉션과 달리 크기가 미리 정해져 있지 않습니다
		- 무한히 지속될 수 있는 데이터 시퀀스를 다룰 수 있습니다
	- **실시간 처리**
		- 데이터가 발생하는 즉시 처리가 가능합니다
		- 모든 데이터가 도착할 때까지 기다릴 필요가 없습니다
	- **비동기 처리**
		- 데이터 생산과 소비가 서로 다른 속도로 일어날 수 있습니다
		- 생산자와 소비자가 서로 독립적으로 동작합니다

### 1.2 등장 배경

- Reactive Streams의 등장에는 다음과 같은 배경이 있습니다:
- **비동기 처리의 필요성**
  - 실시간 데이터 처리 요구 증가
  - 대용량 데이터 스트림 처리 필요성
  - 시스템 자원의 효율적 활용 요구
- **기존 방식의 한계**
  - 동기식 처리 방식의 성능 제약
  - 메모리 사용량 제어의 어려움
  - 데이터 생산-소비 속도 불일치 문제
- **표준화 요구**
  - 각 업체별로 다른 구현 방식 사용
  - 라이브러리 간 호환성 부재
  - 재사용 가능한 컴포넌트 부족

### 1.3 Reactive Streams의 목적과 범위

- Reactive Streams는 non-blocking backpressure를 갖춘 비동기 스트림 처리를 위한 표준을 제공하는 것을 목적으로 합니다.

### 1.1 주요 목표

- 비동기 시스템에서 데이터 스트림(특히 크기가 정해지지 않은 "실시간" 데이터)을 안전하게 처리
- 빠른 데이터 생산자(Producer)가 수신자(Consumer)를 압도하지 않도록 리소스 사용을 제어
- 네트워크 호스트 간 또는 단일 머신의 여러 CPU 코어에서 병렬 컴퓨팅 리소스 활용 지원

### 1.2 핵심 특징

- 무제한 개수의 요소를 순차적으로 처리
- 컴포넌트 간 비동기 방식으로 요소 전달
- 필수적인 non-blocking backpressure 지원
- 스레드 간 데이터 교환을 위한 bounded queue 사용

:::info
Reactive Streams는 데이터 변환, 분할, 병합 등의 구체적인 스트림 조작 방법을 규정하지 않습니다. 대신 서로 다른 API 컴포넌트 간의 데이터 스트림 중재에 중점을 둡니다.
:::

### 1.3 구현체

- 대표적인 구현체로 Project Reactor가 있습니다.
- Reactive Streams는 단순히 JVM 기반에서 Async Non-Blocking 처리를 위한 스펙을 명세한 것이며 다른 구현체로는 RxJava, Akka Streams 등이 있습니다.

## 2. Publisher 상세 스펙

### 2.1 기본 인터페이스

```java
public interface Publisher<T> {
    public void subscribe(Subscriber<? super T> s);
}
```

### 2.2 Publisher의 필수 규칙

1. **데이터 전송 제한**
	- Publisher가 Subscriber에게 신호하는 onNext의 총 횟수는 해당 Subscriber의 Subscription을 통해 요청된 총 요소 수보다 항상 적거나 같아야 합니다.
	- 이는 Publisher가 Subscriber가 요청한 것보다 많은 요소를 보낼 수 없음을 의미합니다.
2. **종료 시나리오**
	- Publisher는 요청된 것보다 적은 수의 onNext를 호출할 수 있으며, onComplete나 onError로 종료할 수 있습니다.
	- Publisher가 실패하면 반드시 onError를 신호해야 합니다.
	- 성공적으로 종료되면(유한 스트림의 경우) 반드시 onComplete를 신호해야 합니다.
3. **신호 순서**
	- 모든 신호는 반드시 onSubscribe → onNext* → (onError | onComplete) 순서를 따라야 합니다.
	- Subscriber에 대한 onSubscribe, onNext, onError, onComplete 신호는 반드시 직렬화되어야 합니다.
4. **구독 관리**
	- Publisher.subscribe는 제공된 Subscriber에게 다른 신호를 보내기 전에 반드시 onSubscribe를 호출해야 합니다.
	- subscribe는 원하는 만큼 호출할 수 있지만, 매번 다른 Subscriber여야 합니다.
	- Publisher는 여러 Subscriber를 지원할 수 있으며, 각 Subscription이 unicast인지 multicast인지 결정합니다.

### 2.3 종료 상태 관리

- onError나 onComplete가 신호되면 해당 Subscriber의 Subscription은 취소된 것으로 간주됩니다.
- 종료 상태가 신호된 후에는 추가 신호가 발생하지 않아야 합니다.
- Subscription이 취소되면 해당 Subscriber는 결국 신호 수신을 중단해야 합니다.

## 3. Subscriber 상세 스펙

### 3.1 기본 인터페이스

```java
public interface Subscriber<T> {
    public void onSubscribe(Subscription s);
    public void onNext(T t);
    public void onError(Throwable t);
    public void onComplete();
}
```

### 3.2 Subscriber의 필수 규칙

1. **요청 관리**
	- onNext 신호를 받으려면 반드시 Subscription.request(long n)을 통해 수요를 신호해야 합니다.
	- 동기식 Subscriber 구현의 경우, 신호 재정렬을 방지하기 위해 신호 처리 마지막에 Subscription 메서드를 호출하는 것이 강력히 권장됩니다.
2. **성능 고려사항**
	- 신호 처리가 Publisher의 응답성에 부정적인 영향을 미칠 수 있다고 판단되면, 비동기적으로 신호를 처리하는 것이 권장됩니다.
	- 한 번에 하나의 요소만 요청하는 것은 비효율적인 "stop-and-wait" 프로토콜을 초래하므로, 처리 가능한 최대치를 요청하는 것이 권장됩니다.
3. **종료 상태 처리**
	- onComplete()와 onError(Throwable t) 호출 후에는 Subscription이나 Publisher의 메서드를 호출해서는 안 됩니다.
	- 이러한 신호를 받은 후에는 Subscription이 취소된 것으로 간주해야 합니다.
4. **구독 관리**
	- 이미 활성 Subscription이 있는 상태에서 onSubscribe 신호를 받으면 새로운 Subscription에서 cancel()을 호출해야 합니다.
	- Subscription이 더 이상 필요하지 않으면 반드시 cancel()을 호출해야 합니다.
5. **스레드 안전성**
	- Subscription의 request와 cancel 메서드에 대한 모든 호출은 반드시 직렬화되어야 합니다.
	- 신호 메서드에 대한 모든 호출은 반드시 해당 신호의 처리보다 먼저 발생해야 합니다.

## 4. Subscription 상세 스펙

### 4.1 기본 인터페이스

```java
public interface Subscription {
    public void request(long n);
    public void cancel();
}
```

### 4.2 Subscription의 필수 규칙

1. **호출 컨텍스트**
	- request와 cancel은 반드시 해당 Subscriber 컨텍스트 내에서만 호출되어야 합니다.
	- Subscription은 onNext나 onSubscribe 내에서의 동기식 request 호출을 허용해야 합니다.
2. **요청 처리**
	- cancel되지 않은 상태에서 request(long n)는 반드시 요청된 추가 요소 수를 해당 Subscriber에게 등록해야 합니다.
	- 인자가 ≤ 0인 경우 IllegalArgumentException으로 onError를 신호해야 합니다.
	- request는 무제한 횟수의 호출을 지원해야 하며, 2^63-1까지의 수요를 지원해야 합니다.
3. **취소 처리**
	- cancel은 반드시 적시에 반환되어야 하며, 멱등성을 가지고 스레드 안전해야 합니다.
	- cancel 후의 추가 request 호출은 NOP(No Operation)이어야 합니다.
	- cancel은 Publisher에게 결국 해당 Subscriber에 대한 신호를 중단하도록 요청해야 합니다.
4. **성능 고려사항**
	- request는 호출자의 응답성을 고려하여 적시에 반환해야 합니다.
	- Publisher와 Subscriber 간의 동기식 재귀에 상한을 두어야 합니다(깊이 1 권장).

## 5. Processor 상세 스펙

### 5.1 기본 인터페이스

```java
public interface Processor<T, R> extends Subscriber<T>, Publisher<R> {
}
```

### 5.2 Processor의 필수 규칙

1. **계약 준수**
	- Processor는 처리 스테이지를 나타내며, Publisher와 Subscriber 모두의 계약을 준수해야 합니다.
2. **에러 처리**
	- onError 신호를 복구하기로 선택할 수 있습니다.
	- 복구하는 경우 Subscription을 취소된 것으로 간주해야 합니다.
	- 복구하지 않는 경우 즉시 Subscriber들에게 onError 신호를 전파해야 합니다.

:::tip
마지막 Subscriber가 구독을 취소할 때 Processor의 상위 Subscription도 취소하여 취소 신호가 상위로 전파되도록 하는 것이 좋은 방법입니다.
:::

## 6. 동기식 vs 비동기식 처리

### 6.1 처리 방식의 이해

Reactive Streams에서는 데이터 처리 방식을 크게 두 가지로 나눌 수 있습니다:

1. **동기식 처리**
	- 데이터를 받은 즉시 같은 스레드에서 처리
	- 처리가 완료될 때까지 다음 데이터를 받지 않음
	- 간단하지만 블로킹이 발생할 수 있음
2. **비동기식 처리**
	- 데이터 수신과 처리를 별도의 스레드에서 수행
	- 데이터를 받자마자 처리 큐에 넣고 다음 데이터를 받을 수 있음
	- 더 복잡하지만 높은 처리량 달성 가능

:::info
Reactive Streams API는 Publisher가 절대로 블로킹되지 않아야 한다고 규정합니다. 하지만 실제 데이터 처리는 동기식이나 비동기식 모두 가능합니다.
:::

### 6.2 실제 구현 예시

다음과 같은 데이터 처리 파이프라인이 있다고 가정해보겠습니다:

```
nioSelectorThreadOrigin → map(f) → filter(p) → consumeTo(toNioSelectorOutput)
```

이 파이프라인은:

1. NIO selector에서 데이터를 읽고 (origin)
2. 데이터를 변환하고 (map)
3. 필터링한 후 (filter)
4. 최종 출력으로 전송 (consumeTo)

이 파이프라인은 다음과 같은 세 가지 방식으로 구현할 수 있습니다:

#### 1. 완전 비동기 처리

```
nioSelectorThreadOrigin | map(f) | filter(p) | consumeTo(toNioSelectorOutput)
-------------- R1 ----  | - R2 - | -- R3 --- | ---------- R4 ----------------
```

- 각 단계가 독립적인 스레드(R1~R4)에서 실행
- 각 '|' 는 스레드 간 경계를 나타냄
- 최대의 병렬성을 제공하지만 스레드 간 전환 오버헤드 발생

#### 2. 부분 비동기 처리

```
nioSelectorThreadOrigin map(f) filter(p) | consumeTo(toNioSelectorOutput)
------------------- R1 ----------------- | ---------- R2 ----------------
```

- map과 filter를 입력 스레드(R1)에서 동기적으로 처리
- 최종 출력만 별도 스레드(R2)에서 처리
- 스레드 전환을 최소화하면서도 출력 블로킹 방지

#### 3. 최종 소비자까지 작업 융합

```
nioSelectorThreadOrigin | map(f) filter(p) consumeTo(toNioSelectorOutput)
--------- R1 ---------- | ------------------ R2 -------------------------
```

- 입력만 별도 스레드(R1)로 처리
- 나머지 모든 작업을 하나의 스레드(R2)에서 처리
- 스레드 전환 최소화로 성능 향상 가능

### 6.3 버퍼 크기 제어와 배압(Backpressure)

스트림 처리에서 중요한 것은 메모리 사용량을 제어하는 것입니다. 이를 위해 Subscriber는 세 가지 핵심 숫자를 추적합니다:

1. **요청한 총 요소 수 (P)**
	- Subscriber가 Publisher에게 요청한 데이터의 총 개수
	- `request(n)` 호출을 통해 설정
2. **처리된 요소 수 (N)**
	- 지금까지 실제로 처리 완료된 데이터의 개수
	- `onNext()` 호출이 성공할 때마다 증가
3. **입력 버퍼의 요소 수 (B)**
	- 현재 처리 대기 중인 데이터의 개수
	- 아직 처리되지 않고 버퍼에 있는 데이터의 수

이를 통해 **남은 수용 가능 용량** 계산이 가능합니다:

- 기본 계산: P - N (요청량 - 처리량)
- 정확한 계산: P - B - N (요청량 - 버퍼량 - 처리량)

:::warning 중요한 제약사항

- Publisher는 절대로 요청받은 것보다 많은 데이터를 전송해서는 안 됩니다
- 제어 불가능한 데이터 소스(예: 센서 데이터)의 경우:
	1. 초과 데이터를 버퍼링하거나
	2. 데이터를 폐기하여
	   반드시 구독자의 수용 능력 제한을 지켜야 합니다
	   :::

## 참고 자료

- [Reactive Streams 공식 명세](https://www.reactive-streams.org/)
- [Java 9 Flow API 문서](https://docs.oracle.com/javase/9/docs/api/java/util/concurrent/Flow.html)
- [구현체 요구사항](https://github.com/reactive-streams/reactive-streams-jvm)