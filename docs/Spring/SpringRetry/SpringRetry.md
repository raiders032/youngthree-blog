---
title: "스프링 Retry로 안정적인 서비스 구현하기"
description: "Spring Retry 라이브러리를 활용하여 일시적인 장애를 효과적으로 처리하는 방법을 알아봅니다. 재시도 로직 구현부터 실제 프로젝트 적용까지 상세히 다룹니다."
tags: [ "SPRING_RETRY", "SPRING", "BACKEND", "JAVA" ]
keywords: [ "스프링 리트라이", "spring retry", "리트라이", "retry", "재시도", "장애처리", "spring", "스프링", "백엔드", "java", "자바" ]
draft: false
hide_title: true
---

## 1. Spring Retry 소개

- Spring Retry는 일시적인 장애가 발생했을 때 작업을 자동으로 재시도할 수 있게 해주는 라이브러리입니다.
- 네트워크 일시 장애나 일시적인 DB 장애와 같은 상황에서 특히 유용합니다.

### 1.1 주요 특징

- 선언적 재시도: @Retryable 어노테이션을 통한 간단한 설정
- 다양한 재시도 정책: 고정 대기, 지수 백오프 등 지원
- 복구 메커니즘: @Recover를 통한 실패 처리
- 상태 기반 재시도: 트랜잭션 컨텍스트 유지 가능

## 2. Spring Retry 설정하기

### 2.1 의존성 추가

#### Maven

```xml

<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>
<dependency>
<groupId>org.springframework</groupId>
<artifactId>spring-aspects</artifactId>
</dependency>
```

#### Gradle

```groovy
implementation 'org.springframework.retry:spring-retry'
implementation 'org.springframework:spring-aspects'
```

### 2.2 기본 설정

Spring Boot 애플리케이션에서는 @EnableRetry 어노테이션을 추가하여 활성화합니다.

```java
@EnableRetry
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

## 3. @Retryable 사용하기

### 3.1 기본 사용법

가장 간단한 형태의 @Retryable 사용 예시입니다.

```java
@Service
public class RemoteService {
    
    @Retryable(retryFor = RemoteAccessException.class)
    public void callRemoteService() {
        // 원격 서비스 호출 로직
    }
}
```

### 3.2 상세 설정

재시도 횟수, 대기 시간 등을 상세하게 설정할 수 있습니다.

```java
@Service
public class RemoteService {
    
    @Retryable(
        retryFor = {RemoteAccessException.class, ServiceException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public String processOrder(String orderId) {
        // 주문 처리 로직
        return "처리완료";
    }
}
```

- retryFor: 재시도할 예외 클래스 지정
- maxAttempts: 최대 재시도 횟수 (기본값: 3)
- backoff: 재시도 사이의 대기 시간 설정
	- delay: 첫 재시도 전 대기시간 (밀리초)
	- multiplier: 다음 재시도시 대기시간 승수

### 3.3 실패 처리하기

@Recover 어노테이션을 사용하여 모든 재시도가 실패했을 때의 처리를 정의할 수 있습니다.

```java
@Service
public class RemoteService {
    
    @Retryable(retryFor = RemoteAccessException.class)
    public String processOrder(String orderId) {
        // 주문 처리 로직
        throw new RemoteAccessException("서비스 일시적 장애");
    }
    
    @Recover
    public String recover(RemoteAccessException e, String orderId) {
        // 모든 재시도 실패 후 실행되는 복구 로직
        return "주문 처리 실패: " + orderId;
    }
}
```

:::info
@Recover 메서드는 다음 규칙을 따라야 합니다:

- @Retryable 메서드와 같은 클래스에 위치
- 반환 타입이 @Retryable 메서드와 동일
- 첫 번째 매개변수는 처리할 예외 타입
- 나머지 매개변수는 @Retryable 메서드의 매개변수와 동일한 순서
  :::

### 3.4 동적 재시도 설정

표현식을 사용하여 런타임에 재시도 동작을 제어할 수 있습니다.

```java
@Service
public class RemoteService {
    
    @Retryable(
        maxAttemptsExpression = "#{@retryConfig.maxAttempts}",
        backoff = @Backoff(
            delayExpression = "#{@retryConfig.initialDelay}",
            multiplierExpression = "#{@retryConfig.multiplier}"
        )
    )
    public void dynamicRetryExample() {
        // 비즈니스 로직
    }
}

@Configuration
public class RetryConfig {
    @Bean
    public RetryProperties retryConfig() {
        return new RetryProperties(3, 1000L, 2.0);
    }
}
```

## 4. 실전 사용 예시

### 4.1 외부 API 호출

```java
@Service
public class ExternalApiService {
    
    @Retryable(
        retryFor = {RestClientException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 500, maxDelay = 3000)
    )
    public ApiResponse callExternalApi(String requestData) {
        return restTemplate.postForObject(
            "https://api.external.com/data",
            requestData,
            ApiResponse.class
        );
    }
    
    @Recover
    public ApiResponse handleApiFailure(RestClientException e, String requestData) {
        log.error("API 호출 실패: {}", requestData, e);
        return ApiResponse.failure("일시적인 서비스 장애");
    }
}
```

### 4.2 데이터베이스 작업

```java
@Service
public class OrderService {
    
    @Retryable(
        retryFor = {DataAccessException.class},
        maxAttempts = 2,
        backoff = @Backoff(delay = 100)
    )
    @Transactional
    public void processOrder(Order order) {
        orderRepository.save(order);
        // 추가 처리 로직
    }
    
    @Recover
    public void handleDbError(DataAccessException e, Order order) {
        notificationService.notifyOrderError(order);
        throw new OrderProcessingException("주문 처리 실패", e);
    }
}
```

## 5. 주의사항

### 5.1 트랜잭션 처리

- @Retryable은 기본적으로 트랜잭션을 롤백하지 않습니다
- 트랜잭션 롤백이 필요한 경우 @Transactional과 함께 사용해야 합니다

### 5.2 재시도 대상 선정

- 일시적인 장애가 예상되는 경우에만 사용
- 영구적인 오류(잘못된 입력값 등)는 재시도 대상에서 제외
- 멱등성이 보장되는 작업에 사용

### 5.3 성능 고려사항

- 적절한 재시도 횟수와 대기 시간 설정
- 불필요한 재시도로 인한 리소스 낭비 방지
- 시스템 부하를 고려한 backoff 전략 선택

## 6. 마치며

- Spring Retry를 활용하면 일시적인 장애에 대한 복원력을 갖춘 서비스를 구현할 수 있습니다.
- 특히 마이크로서비스 아키텍처에서 서비스 간 통신의 안정성을 높이는 데 매우 유용합니다.

참고

- https://github.com/spring-projects/spring-retry/tree/main