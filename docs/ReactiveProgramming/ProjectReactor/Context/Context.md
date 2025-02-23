---
title: "Context"
description: "Project Reactor의 Context에 대해 상세히 알아봅니다. 기본 개념부터 실전 활용 패턴, 주의사항까지 실제 예제와 함께 설명합니다. 리액티브 프로그래밍에서 컨텍스트를 효과적으로 활용하고 싶은 개발자를 위한 실용적인 가이드입니다."
tags: ["REACTOR", "REACTIVE_PROGRAMMING", "SPRING_WEBFLUX", "SPRING", "BACKEND", "JAVA"]
keywords: ["프로젝트 리액터", "Project Reactor", "컨텍스트", "Context", "리액티브", "Reactive", "웹플럭스", "WebFlux", "스프링", "Spring", "백엔드", "Backend", "자바", "Java", "리액티브 스트림", "Reactive Streams", "컨텍스트 전파", "Context Propagation"]
draft: false
hide_title: true
---

## 1. Context 소개

- Context는 Project Reactor에서 제공하는 리액티브 스트림의 메타데이터 저장소입니다.
	- 키/값 형태의 데이터를 저장하고 전파하는 역할을 수행합니다.
- ThreadLocal과 유사하지만 리액티브 스트림에 최적화된 방식으로 동작합니다.
  - ThreadLocal은 스레드별로 데이터를 저장하고 전파하는 반면, Context는 리액티브 스트림의 구독자별로 데이터를 저장하고 전파합니다.
  - 즉 구동이 발생할 때마다 해당 구독과 연결된 하나의 Context가 생성된다고 볼 수 있습니다.
- 구독자로부터 발행자 방향으로(downstream에서 upstream으로) 전파되는 특성을 가집니다.
- 주로 인증 정보, 추적 ID, 로깅 설정 등의 메타데이터를 전달하는 데 사용됩니다.

## 2. Context의 주요 특징

### 2.1 불변성(Immutability)

- Context는 불변(immutable) 객체입니다.
- 데이터를 추가하면 새로운 Context 인스턴스가 생성됩니다.
- 이는 데이터의 안전성을 보장하고 부수 효과를 방지합니다.

### 2.2 구독 범위

- Context는 구독별로 독립적으로 존재합니다.
- 하나의 Flux나 Mono에 여러 구독자가 있을 경우, 각 구독자는 자신만의 Context를 가집니다.
- 이를 통해 구독자별로 서로 다른 메타데이터를 관리할 수 있습니다.

## 3. Context 사용하기

### 3.1 Context 생성 및 데이터 추가

```java
Context context = Context.of("user", "admin", "requestId", "123");

// 체이닝을 통한 데이터 추가
Context newContext = context.put("role", "ADMIN");
```

- of 메서드는 key/value 쌍을 인자로 받아 Context에 여러 개의 값을 추가할 수 있습니다.
- put 메서드는 기존 Context에 새로운 key/value 쌍을 추가한 새로운 Context를 반환합니다.

### 3.2 subscriberContext() / contextWrite() 사용

```java
Flux<String> flux = Flux.just("data")
    .contextWrite(context -> context.put("requestId", UUID.randomUUID().toString()))
    .flatMap(data -> getRoleFromContext())
    .contextWrite(Context.of("user", "admin"));
```

### 3.3 Context 데이터 읽기

```java
Mono<String> mono = Mono.just("Hello")
    .flatMap(data -> Mono.deferContextual(ctx -> 
        Mono.just(data + " " + ctx.get("user"))))
    .contextWrite(Context.of("user", "John"));
```

## 4. 실전 활용 패턴

### 4.1 인증 정보 전파

```java
@Service
public class SecurityService {
    public Flux<Data> getSecuredData() {
        return Flux.just(new Data())
            .flatMap(this::enrichWithUser)
            .contextWrite(context -> 
                context.put("authToken", SecurityContextHolder.getContext().getAuthentication()));
    }
    
    private Mono<Data> enrichWithUser(Data data) {
        return Mono.deferContextual(ctx -> {
            Authentication auth = ctx.get("authToken");
            data.setUser(auth.getName());
            return Mono.just(data);
        });
    }
}
```

### 4.2 로깅 MDC 통합

```java
public class ReactiveLoggingContext {
    private static final String CORRELATION_ID = "correlationId";
    
    public static Function<Context, Context> withCorrelationId() {
        return context -> {
            String correlationId = UUID.randomUUID().toString();
            return context.put(CORRELATION_ID, correlationId);
        };
    }
    
    public static Mono<String> getCorrelationId() {
        return Mono.deferContextual(ctx -> 
            Mono.just(ctx.getOrDefault(CORRELATION_ID, "unknown")));
    }
}
```

### 4.3 에러 처리와 Context

```java
public class ReactiveErrorHandler {
    public static <T> Mono<T> handleError(Throwable error) {
        return Mono.deferContextual(ctx -> {
            String correlationId = ctx.get("correlationId");
            log.error("Error occurred for request {}: {}", 
                     correlationId, error.getMessage());
            return Mono.error(new CustomException(error, correlationId));
        });
    }
}
```

## 5. 주의사항 및 모범 사례

### 5.1 Context 전파 방향

:::warning
Context는 downstream에서 upstream으로 전파됩니다. 따라서 Context를 설정하는 위치가 매우 중요합니다.
:::

```java
// 잘못된 사용
Flux.just("data")
    .contextWrite(Context.of("key", "value"))  // 먼저 실행
    .map(data -> data.toUpperCase())
    .contextWrite(Context.of("key2", "value2")); // 나중에 실행

// 올바른 사용
Flux.just("data")
    .map(data -> data.toUpperCase())
    .contextWrite(Context.of("key2", "value2")) // 먼저 실행
    .contextWrite(Context.of("key", "value"));  // 나중에 실행
```

### 5.2 성능 고려사항

- Context 조작은 새로운 인스턴스를 생성하므로, 과도한 Context 수정은 피해야 합니다.
- 필요한 데이터만 Context에 저장하고, 불필요한 데이터는 제거합니다.

### 5.3 스레드 전환 시 주의사항

```java
Flux.just("data")
    .publishOn(Schedulers.boundedElastic())
    .flatMap(data -> Mono.deferContextual(ctx -> {
        // Context는 스레드 전환 후에도 유지됩니다.
        String user = ctx.get("user");
        return processData(data, user);
    }))
    .contextWrite(Context.of("user", "admin"));
```

## 6. Spring WebFlux 통합

### 6.1 웹 요청 처리

```java
@RestController
@RequestMapping("/api")
public class ReactiveController {
    @GetMapping("/data")
    public Flux<Data> getData() {
        return Flux.just(new Data())
            .flatMap(this::enrichWithRequestContext)
            .contextWrite(this::addRequestContext);
    }
    
    private Context addRequestContext(Context context) {
        return context
            .put("requestId", UUID.randomUUID().toString())
            .put("timestamp", Instant.now());
    }
    
    private Mono<Data> enrichWithRequestContext(Data data) {
        return Mono.deferContextual(ctx -> {
            data.setRequestId(ctx.get("requestId"));
            return Mono.just(data);
        });
    }
}
```

## 7. 마치며

- Context는 리액티브 스트림에서 메타데이터를 전파하는 강력한 메커니즘을 제공합니다.
- ThreadLocal의 대안으로 사용되며, 리액티브 프로그래밍의 특성에 맞게 설계되었습니다.
- 인증 정보, 로깅 컨텍스트, 추적 ID 등을 효과적으로 전파할 수 있습니다.
- Context의 전파 방향과 불변성을 이해하고 적절히 활용하면, 리액티브 애플리케이션의 메타데이터 관리를 효과적으로 수행할 수 있습니다.