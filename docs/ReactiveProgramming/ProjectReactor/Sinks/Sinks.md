---
title: "Sinks"
description: "Project Reactor의 Sinks에 대해 상세히 알아봅니다. 기본 개념부터 실전 활용 패턴, 주의사항까지 실제 예제와 함께 설명합니다. 리액티브 프로그래밍을 더 효과적으로 구현하고 싶은 개발자를 위한 실용적인 가이드입니다."
tags: [ "REACTOR", "REACTIVE_PROGRAMMING", "SPRING_WEBFLUX", "SPRING", "BACKEND", "JAVA" ]
keywords: [ "프로젝트 리액터", "Project Reactor", "싱크", "Sinks", "리액티브", "Reactive", "웹플럭스", "WebFlux", "스프링", "Spring", "백엔드", "Backend", "자바", "Java", "리액티브 스트림", "Reactive Streams", "프로그래밍", "Programming" ]
draft: false
hide_title: true
---

## 1. Sinks 소개

- Sinks는 Project Reactor 3.4.0에서 도입된 새로운 기능으로, 명령형 프로그래밍 방식으로 리액티브 스트림을 생성하고 관리할 수 있게 해주는 도구입니다.
- 기존의 `FluxProcessor`와 `EmitterProcessor`를 대체하여 더 안전하고 유연한 방식으로 스트림을 다룰 수 있습니다.
- Sinks는 스레드 안전성을 보장하며, 동시성 처리에 대한 다양한 전략을 제공합니다.

## 2. Sinks의 주요 특징

### 2.1 스레드 안전성

- Sinks는 멀티스레드 환경에서 안전하게 이벤트를 발행할 수 있도록 설계되었습니다.
- 여러 스레드에서 동시에 이벤트를 발행할 때 발생할 수 있는 경쟁 상태를 방지합니다.
- 실패 시 재시도 정책을 설정할 수 있어 더욱 안정적인 동작을 보장합니다.

### 2.2 다양한 emit 전략

- `tryEmitNext()`: 즉시 성공 또는 실패를 반환
- `emitNext()`: 성공할 때까지 재시도
- `tryEmitComplete()`: 스트림 종료 시도
- `tryEmitError()`: 에러 발행 시도

## 3. Sinks의 종류

- Reactor에서 Sinks를 사용하여 프로그래밍 방식으로 signal을 전송할 수 있는 방법은 크게 `Sinks.One`과 `Sinks.Many`로 나눌 수 있습니다.

### 3.1 Sinks.One

- 단일 요소를 발행하기 위한 Sink입니다.
- `Mono`와 유사한 동작을 제공합니다.

```java
Sinks.One<String> sink = Sinks.one();
Mono<String> mono = sink.asMono();

sink.tryEmitValue("Hello Reactor!");
```

- `tryEmitValue()`: 단일 요소 발행 시도
- `tryEmitError()`: 에러 발행 시도

### 3.2 Sinks.Many

- 여러 요소를 발행할 수 있는 Sink입니다.
- `Flux`와 유사한 동작을 제공합니다.
- 다양한 특성을 가진 Many Sink를 생성할 수 있습니다.

```java
// 멀티캐스트 Sink 생성
Sinks.Many<String> sink = Sinks.many().multicast().onBackpressureBuffer();
Flux<String> flux = sink.asFlux();

sink.tryEmitNext("First");
sink.tryEmitNext("Second");
sink.tryEmitNext("Third");
```

### 3.3 Sinks.Many의 주요 타입

- `unicast()`: 단일 구독자만 허용
- `multicast()`: 여러 구독자 허용
- `replay()`: 이전 발행된 요소들을 새로운 구독자에게 재전송

## 4. 실전 활용 패턴

### 4.1 실시간 이벤트 처리

```java
@Service
public class EventService {
    private final Sinks.Many<Event> eventSink = Sinks.many().multicast().onBackpressureBuffer();
    
    public Flux<Event> subscribeToEvents() {
        return eventSink.asFlux();
    }
    
    public void publishEvent(Event event) {
        eventSink.tryEmitNext(event)
                 .orThrow(); // 발행 실패 시 예외 발생
    }
}
```

### 4.2 WebFlux에서의 활용

```java
@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService eventService;
    
    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Event> streamEvents() {
        return eventService.subscribeToEvents();
    }
    
    @PostMapping
    public Mono<Void> createEvent(@RequestBody Event event) {
        eventService.publishEvent(event);
        return Mono.empty();
    }
}
```

## 5. 주의사항 및 모범 사례

### 5.1 에러 처리

- Sink 사용 시 발행 실패를 적절히 처리해야 합니다.
- `tryEmit` 계열 메서드는 `EmitResult`를 반환하므로 결과를 확인해야 합니다.

```java
EmitResult result = sink.tryEmitNext(data);
if (result.isFailure()) {
    // 실패 처리 로직
    logger.error("Failed to emit: {}", result);
}
```

### 5.2 백프레셔 관리

- 구독자의 처리 속도를 고려하여 적절한 백프레셔 전략을 선택해야 합니다.
- `onBackpressureBuffer()`: 버퍼에 저장
- `onBackpressureError()`: 에러 발생
- `onBackpressureDrop()`: 초과 데이터 폐기

:::warning
과도한 버퍼링은 메모리 문제를 일으킬 수 있으므로, 적절한 버퍼 크기를 설정하는 것이 중요합니다.
:::

### 5.3 리소스 관리

- Sink를 더 이상 사용하지 않을 때는 `tryEmitComplete()`를 호출하여 적절히 종료해야 합니다.
- 구독자가 없는 경우에도 메모리 누수를 방지하기 위해 리소스를 정리해야 합니다.

## 6. 마치며

- Sinks는 Project Reactor에서 명령형과 리액티브 프로그래밍을 자연스럽게 연결해주는 강력한 도구입니다.
- 스레드 안전성과 다양한 배압 처리 전략을 제공하여 실시간 이벤트 처리 시스템 구축에 적합합니다.
- 적절한 타입과 설정을 선택하고 에러 처리를 철저히 하면, 안정적이고 효율적인 리액티브 시스템을 구축할 수 있습니다.