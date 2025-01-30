---
title: "Backpressure"
description: "리액티브 스트림에서 데이터 흐름 제어를 위한 백프레셔의 개념과 구현 방식을 설명합니다. Observer 패턴의 한계부터 백프레셔를 통한 해결 방안까지 상세히 다룹니다."
tags: [ "REACTIVE_PROGRAMMING", "REACTIVE_STREAMS", "BACKPRESSURE", "CONCURRENCY", "SYSTEM_DESIGN" ]
keywords: [ "백프레셔", "리액티브스트림", "옵저버패턴", "동시성", "스트림제어", "데이터흐름", "시스템설계", "backpressure", "reactivestreams" ]
draft: false
hide_title: true
---

## 1. 백프레셔의 필요성

- 이번 글에서는 리액티브 스트림에서 데이터 흐름을 제어하는 백프레셔(Backpressure)를 도입한 이유와 구현 방식에 대해 알아봅니다.

### 1.1 Observer 패턴의 한계

- 먼저 Observer 패턴을 통한 데이터 흐름 제어의 한계를 살펴봅니다.
- 패턴이란 한 객체의 상태가 바뀌면 그 객체의 의존하는 다른 객체에게 연락이 가고 자동으로 내용이 갱신되는 방식으로 일대다 의존성을 정의하는 것입니다.
- [Observer 참고](../../../Design-Pattern/Observer/Observer.md)

### 1.2 Push 방식의 문제점

- Observer 패턴에서 Subject가 데이터를 Push하는 방식은 다음과 같은 문제점이 있습니다:
	- Producer가 Consumer의 처리 능력을 고려하지 않고 데이터를 전송합니다
	- Consumer의 처리 속도가 Producer의 생산 속도를 따라가지 못하면 문제가 발생합니다
	- 예: Producer가 초당 100개 메시지 전송, Consumer는 초당 10개 처리 가능

### 1.3 버퍼 오버플로우 문제

- 고정 길이 버퍼
	- 신규 메시지 거절
	- 재전송으로 인한 추가 네트워크/CPU 비용 발생
- 가변 길이 버퍼
	- Out of Memory 발생
	- 서버 크래시 위험

## 2. 백프레셔를 통한 해결

### 2.1 Pull 방식 도입

- Consumer가 처리 가능한 만큼만 데이터를 요청합니다
- Producer는 요청받은 수량만 전송합니다
- Consumer의 현재 처리 상태에 따라 동적으로 요청량 조절

### 2.2 백프레셔 구현 방식

#### 요청 기반 흐름 제어

```java
interface Subscription {
    void request(long n);    // n개 항목 요청
    void cancel();          // 구독 취소
}

interface Subscriber<T> {
    void onSubscribe(Subscription s);
    void onNext(T item);
    void onError(Throwable t);
    void onComplete();
}
```

#### 동적 흐름 제어

- Consumer는 처리 중인 작업량을 모니터링합니다
- 버퍼 상태에 따라 요청량을 조절합니다
- 시스템 부하에 따라 적응적으로 대응합니다

## 3. 실제 적용 사례

### 3.1 데이터베이스 조회

:::tip 데이터베이스 조회 최적화

```java
// 기존 방식 (메모리 부족 위험)
List<User> users = repository.findAll();  // 전체 데이터를 메모리에 적재

// 백프레셔 적용
Flux<User> userFlux = repository.findAll()  // 스트림으로 처리
    .limitRate(10)                          // 한 번에 10개씩 요청
    .doOnNext(this::processUser);           // 개별 처리
```

:::

### 3.2 이벤트 스트림 처리

- 실시간 데이터 처리 시스템
- IoT 센서 데이터 수집
- 로그 처리 시스템

## 4. 백프레셔 설계 시 고려사항

- 적절한 버퍼 크기 설정
- 요청량 조절 알고리즘 선택
- 오버플로우 상황 대응 전략
- 시스템 모니터링 및 메트릭 수집

:::warning 주의사항
백프레셔 구현 시 데드락이나 라이브락이 발생하지 않도록 주의해야 합니다. Producer와 Consumer 간의 요청-응답 사이클이 서로를 블로킹하지 않도록 설계해야 합니다.
:::