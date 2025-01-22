---
title: "Project Reactor 시작하기: 리액티브 프로그래밍의 첫걸음"
description: "Java 리액티브 프로그래밍의 핵심 라이브러리인 Project Reactor를 처음 접하는 개발자를 위한 가이드입니다. 리액터의 기본 개념부터 실제 사용법까지, 단계별로 쉽게 설명합니다."
tags: [ "PROJECT_REACTOR", "REACTIVE_PROGRAMMING", "SPRING_WEBFLUX", "JAVA", "BACKEND" ]
keywords: [ "프로젝트 리액터", "project reactor", "리액터", "reactor", "리액티브", "reactive", "웹플럭스", "webflux", "스프링", "spring", "자바", "java", "백프레셔", "backpressure", "입문", "기초", "가이드" ]
draft: false
hide_title: true
---

## 1. Project Reactor란?

- Project Reactor는 현대적인 애플리케이션이 필요로 하는 고성능, 비동기, 논블로킹 프로그래밍을 지원하는 Java 라이브러리입니다.
- 리액티브 프로그래밍을 위한 다양한 기능을 제공하여, 더 효율적이고 탄력적인 시스템을 구축할 수 있게 해줍니다.

### 1.1 리액티브 프로그래밍과의 관계

- 리액티브 프로그래밍이란 데이터나 이벤트의 흐름을 중심으로 하는 프로그래밍 방식입니다.
- 마우스 클릭이나 네트워크 응답같은 이벤트가 발생했을 때, 이에 "반응"하여 처리하는 방식으로 동작합니다.
- 리액터는 이러한 리액티브 프로그래밍을 Java에서 쉽게 구현할 수 있도록 도와줍니다.
- [ReactiveProgramming 참고](../../ReactiveProgramming/ReactiveProgramming.md)

**리액티브 프로그래밍 예시**

```java
// 사용자의 클릭 이벤트를 처리하는 예시
buttonClicks.subscribe(event -> {
    System.out.println("버튼이 클릭되었습니다!");
});

// 데이터베이스 조회 결과를 처리하는 예시
userRepository.findById(userId)
    .subscribe(user -> {
        System.out.println("사용자를 찾았습니다: " + user.getName());
    });
```

### 1.2 리액티브 스트림즈와의 관계

- 리액터는 Reactive Streams라는 표준 사양을 구현합니다.
- 아래와 같은 리액티브 스트림즈의 핵심 인터페이스들을 구현하여 리액티브 프로그래밍을 지원합니다.
	- Publisher: 데이터를 제공하는 발행자
	- Subscriber: 데이터를 소비하는 구독자
	- Subscription: 발행자와 구독자 사이의 구독 관계
	- Processor: 발행자이면서 동시에 구독자인 중간 처리자
- [ReactiveStream 참고](../../ReactiveStream/ReactiveStream.md)

### 1.3 개발 배경과 Spring과의 관계

- VMware(구 Pivotal)에서 개발한 리액터는 Spring Framework 5.0부터 도입된 Spring WebFlux의 핵심 기술입니다.
- Spring Boot로 리액티브 웹 애플리케이션을 만들 때 자연스럽게 리액터를 사용하게 됩니다.

:::tip[알아두면 좋은 점]
Spring WebFlux를 사용하면 리액터의 기능을 자연스럽게 활용할 수 있습니다. 예를 들어, REST API의 응답을 Mono나 Flux로 반환할 수 있습니다.
:::

## 2. Project Reactor의 특징

### 2.1 주요 특징

1. **비동기-논블로킹 프로그래밍**
	- 작업이 완료될 때까지 기다리지 않고 다른 작업을 수행할 수 있습니다.
	- 예를 들어, 여러 데이터베이스 쿼리를 동시에 실행할 수 있습니다.
2. **선언적 프로그래밍**
   ```java
   // 명령형 프로그래밍
   List<String> result = new ArrayList<>();
   for(User user : users) {
       if(user.getAge() > 19) {
           result.add(user.getName());
       }
   }

   // 리액터의 선언적 프로그래밍
   Flux.fromIterable(users)
       .filter(user -> user.getAge() > 19)
       .map(User::getName)
       .subscribe(result::add);
   ```
3. **데이터 흐름 제어**
	- 데이터 생산자와 소비자 사이의 속도 차이를 조절할 수 있습니다.
	- 이를 통해 시스템의 안정성을 보장합니다.
4. **풍부한 연산자**
	- 데이터 변환, 필터링, 조합 등 다양한 연산자를 제공합니다.
	- 복잡한 데이터 처리 로직을 간단하게 구현할 수 있습니다.

## 3. 리액터의 핵심 구성 요소

- 리액터의 핵심 구성 요소는 Mono와 Flux입니다.
- Mono와 Flux는 Reactive Streams의 Publisher 인터페이스를 구현한 클래스로, 데이터를 처리하는 데 사용됩니다.

### 3.1 Mono

- Mono는 `Publisher<T>`를 구현하는 클래스로, 0개 또는 1개의 데이터를 처리합니다.
- Optional과 비슷하지만, 비동기 처리와 리액티브 스트림즈의 모든 기능을 지원합니다.
- 주로 단일 결과를 반환하는 작업(예: HTTP 요청, 데이터베이스 쿼리)에 사용됩니다.

```java
// 단일 데이터를 처리하는 Mono 예시
Mono<String> mono = Mono.just("Hello, Reactor!");
mono.subscribe(message -> System.out.println(message));

// API 응답을 처리하는 예시
Mono<User> userMono = webClient.get()
    .uri("/users/{id}", userId)
    .retrieve()
    .bodyToMono(User.class);
```

### 3.2 Flux

- Flux도 `Publisher<T>`를 구현하며, 0개 이상의 데이터를 처리합니다.
- Java의 Stream과 비슷하지만, 비동기 처리와 백프레셔를 지원합니다.
- 여러 항목의 스트림(예: 데이터베이스 쿼리 결과, 이벤트 스트림)을 처리할 때 사용됩니다.

```java
// 여러 데이터를 처리하는 Flux 예시
Flux<Integer> numbers = Flux.just(1, 2, 3, 4, 5);
numbers.subscribe(
    number -> System.out.println(number),
    error -> System.err.println("에러 발생: " + error),
    () -> System.out.println("완료!")
);

// 실시간 데이터를 처리하는 예시
Flux<StockPrice> prices = webClient.get()
    .uri("/stocks/{symbol}/price", symbol)
    .retrieve()
    .bodyToFlux(StockPrice.class);
```

## 4. Hot과 Cold Publishers: 리액티브 스트림의 두 가지 발행 방식

- 리액티브 프로그래밍에서 Publisher는 데이터를 발행하는 방식에 따라 Hot과 Cold로 나뉩니다.
- 이 두 가지 방식은 각각 다른 사용 사례와 특성을 가지고 있어, 상황에 맞는 적절한 선택이 중요합니다.

### 4.1 Cold Publishers

- Cold Publisher는 Netflix나 YouTube 같은 주문형 스트리밍 서비스와 유사하게 동작합니다.
- 각 구독자는 자신만의 독립적인 데이터 스트림을 받습니다.

#### 주요 특징

- **구독 기반 실행**: 구독이 발생할 때만 데이터 스트림이 시작됩니다.
- **데이터 재생성**: 새로운 구독자마다 처음부터 모든 데이터를 다시 생성합니다.
- **독립적인 실행**: 각 구독자는 다른 구독자의 영향을 받지 않는 독립적인 데이터 스트림을 가집니다.
- **리소스 효율성**: 구독자가 없을 때는 리소스를 사용하지 않습니다.

#### 일반적인 사용 사례

- HTTP 요청
- 데이터베이스 쿼리
- 파일 읽기
- 데이터 변환 작업

```java
// Cold Publisher 예시
Flux<Integer> coldNumbers = Flux.range(1, 3);

// 첫 번째 구독
coldNumbers.subscribe(num -> 
    System.out.println("첫 번째 구독자: " + num));
// 출력:
// 첫 번째 구독자: 1
// 첫 번째 구독자: 2
// 첫 번째 구독자: 3

// 두 번째 구독
coldNumbers.subscribe(num -> 
    System.out.println("두 번째 구독자: " + num));
// 출력:
// 두 번째 구독자: 1
// 두 번째 구독자: 2
// 두 번째 구독자: 3
```

### 4.2 Hot Publishers

- Hot Publisher는 실시간 TV 방송이나 라이브 스트리밍과 유사하게 동작합니다.
- 구독자의 존재 여부와 관계없이 데이터를 발행하며, 구독자는 구독 시점 이후의 데이터만 받을 수 있습니다.

#### 주요 특징

- **즉시 실행**: 구독자의 존재 여부와 관계없이 데이터 스트림이 시작됩니다.
- **공유 스트림**: 모든 구독자가 동일한 데이터 스트림을 공유합니다.
- **실시간 데이터**: 구독 시점 이후의 데이터만 수신 가능합니다.
- **리소스 공유**: 여러 구독자가 동일한 데이터 스트림을 공유하므로 리소스 효율적입니다.

#### 일반적인 사용 사례

- 실시간 주식 가격 업데이트
- 센서 데이터 스트리밍
- 실시간 채팅 메시지
- 사용자 이벤트 (마우스 클릭, 키보드 입력 등)

```java
// Hot Publisher 예시
ConnectableFlux<Long> hotNumbers = Flux.interval(Duration.ofSeconds(1))
    .publish();

// 스트림 시작
hotNumbers.connect();

// 1초 후 첫 번째 구독
Thread.sleep(1000);
hotNumbers.subscribe(num -> 
    System.out.println("첫 번째 구독자: " + num));

// 3초 후 두 번째 구독
Thread.sleep(3000);
hotNumbers.subscribe(num -> 
    System.out.println("두 번째 구독자: " + num));

// 출력:
// 첫 번째 구독자: 0
// 첫 번째 구독자: 1
// 첫 번째 구독자: 2
// 첫 번째 구독자: 3 | 두 번째 구독자: 3
// 첫 번째 구독자: 4 | 두 번째 구독자: 4
```

### 4.3 선택 가이드

- 적절한 Publisher 유형을 선택하기 위한 고려사항:
- **데이터의 성격**
	- 재실행 가능한 작업: Cold Publisher
	- 실시간/이벤트성 데이터: Hot Publisher
- **구독자 관계**
	- 독립적인 데이터 스트림 필요: Cold Publisher
	- 공유 데이터 스트림 필요: Hot Publisher
- **리소스 사용**
	- 구독당 새로운 리소스 필요: Cold Publisher
	- 리소스 공유 필요: Hot Publisher

## 5. BackPressure 이해하기

:::info[백프레셔란?]
데이터를 처리하는 소비자가 처리할 수 있는 양만큼만 데이터를 요청하는 메커니즘입니다. 마치 수도꼭지로 물의 양을 조절하는 것과 비슷합니다.
:::

### 5.1 BaseSubscriber 사용하기

- BaseSubscriber를 사용하면 데이터 요청을 세밀하게 제어할 수 있습니다
- BaseSubscriber는 Reactive Streams의 Subscriber 인터페이스를 구현하는 추상 클래스입니다
- 구독 생명주기를 더 세밀하게 제어할 수 있는 훅 메서드들을 제공합니다.
	- hookOnSubscribe(): 구독 시작 시 호출
	- hookOnNext(): 데이터 수신 시 호출
	- hookOnComplete(): 완료 시 호출
	- hookOnError(): 에러 발생 시 호출
	- hookOnCancel(): 취소 시 호출
- Subscription 인터페이스의 request() 메서드를 내부적으로 구현합니다.
	- Subscription의 request()를 직접 호출할 필요가 없고 BaseSubscriber의 request()를 호출하면 됩니다.

```java
Flux.range(1, 100)
    .subscribe(new BaseSubscriber<Integer>() {
        @Override
        protected void hookOnNext(Integer value) {
            System.out.println("받은 값: " + value);
            request(1); // 한 번에 하나씩만 요청
        }
    });
```

### 5.2 백프레셔 전략

- 데이터가 너무 많이 들어올 때 처리하는 방법:
	- BUFFER: 처리하지 못한 데이터를 임시 저장
	- DROP: 처리하지 못하는 데이터는 무시
	- LATEST: 가장 최신 데이터만 유지
	- ERROR: 처리 용량 초과 시 오류 발생

## 6. Scheduler 소개

- Project Reactor의 Scheduler는 리액티브 스트림에서 작업이 실행될 스레드를 관리하는 핵심 컴포넌트입니다.
- 개발자가 직접 스레드를 제어하는 대신, Scheduler가 작업의 실행 컨텍스트를 효율적으로 관리합니다.
- [Scheduler 참고](../Scheduler/Scheduler.md)

## 7. Context 소개

- Context는 리액티브 체인에서 데이터를 전달하는 방법을 제공합니다

```java
Mono.just("Hello")
    .transformDeferredContextual((data, context) -> 
        data.map(s -> s + " " + context.get("user")))
    .contextWrite(context -> context.put("user", "Reactor"))
    .subscribe(System.out::println);  // 출력: "Hello Reactor"
```