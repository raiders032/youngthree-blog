---
title: "Template Callback Pattern"
description: "스프링 프레임워크에서 널리 사용되는 템플릿 콜백 패턴을 상세히 다룹니다. 전략 패턴의 발전된 형태로서의 템플릿 콜백 패턴의 개념, 구현 방법, 그리고 실제 스프링에서의 활용 사례까지 실무에 바로 적용할 수 있는 내용을 다룹니다."
tags: [ "TEMPLATE_CALLBACK", "DESIGN_PATTERN", "STRATEGY_PATTERN", "SPRING", "JAVA", "BACKEND" ]
keywords: [
  "템플릿 콜백 패턴",
  "template callback pattern",
  "전략 패턴",
  "strategy pattern",
  "콜백",
  "callback",
  "템플릿 메서드",
  "template method",
  "JdbcTemplate",
  "RestTemplate",
  "TransactionTemplate",
  "람다식",
  "lambda",
  "익명 클래스",
  "anonymous class",
  "스프링",
  "spring",
  "자바",
  "java"
]
draft: false
hide_title: true
---

## 1. 템플릿 콜백 패턴 개요

- 템플릿 콜백 패턴은 전략 패턴을 발전시킨 스프링 프레임워크의 핵심 디자인 패턴입니다.
	- [Strategy 패턴 참고](../Strategy/Strategy.md)
- 이 패턴의 핵심은 변하지 않는 템플릿 부분과 변하는 콜백 부분을 분리하는 것입니다.

### 1.1 핵심 개념

- 전략 패턴의 발전된 형태
- 실행 시점에 여러 전략을 파라미터로 전달 가능
- Context가 템플릿 역할을 수행
- 변하는 부분은 파라미터로 전달된 콜백이 처리

:::info
템플릿 콜백 패턴은 GOF의 디자인 패턴은 아니지만, 스프링 프레임워크에서 널리 사용되는 패턴입니다. JdbcTemplate, RestTemplate, TransactionTemplate 등 스프링의 많은 기능들이
이 패턴을 기반으로 구현되어 있습니다.
:::

## 2. 콜백의 이해

### 2.1 콜백이란?

- 콜백(Callback)은 다른 코드의 인수로 넘겨주는 실행 가능한 코드를 의미합니다.
- 콜백을 받는 코드는 필요에 따라 즉시 실행하거나 나중에 실행할 수 있습니다.

### 2.2 자바에서의 콜백 구현 방법

- 자바에서 콜백을 구현하는 방법은 시간에 따라 발전해왔습니다
- Java 8 이전
	- 단일 메소드 인터페이스 구현
	- 익명 내부 클래스 사용
- Java 8 이후
	- 람다식을 통한 간결한 구현
	- 함수형 인터페이스 활용

## 3. 패턴 구현하기

### 3.1 콜백 인터페이스 정의

```java
public interface Callback {
    void call();
}
```

- 콜백 인터페이스는 `call()` 메서드 하나만 정의합니다.

### 3.2 템플릿 클래스 구현

```java
@Slf4j
public class TimeLogTemplate {
    public void execute(Callback callback) {
        long startTime = System.currentTimeMillis(); 
        
        // 비즈니스 로직 실행
        callback.call(); // 콜백 호출
        
        long endTime = System.currentTimeMillis();
        long resultTime = endTime - startTime;
        log.info("resultTime={}", resultTime);
    }
}
```

- `execute()` 메서드는 콜백을 파라미터로 받아 실행합니다.
- 비즈니스 로직 실행 전후에 시간을 측정하여 로그로 출력합니다.
- 콜백을 호출하는 부분이 템플릿의 핵심 로직입니다.
- 이렇게 하면 템플릿 클래스는 변하지 않는 부분을 담당하게 됩니다.
	- 시간 측정, 로깅 등

### 3.3 실전 활용 예제

```java
@Test
void callbackExample() {
    TimeLogTemplate template = new TimeLogTemplate(); 
    
    // 람다식을 사용한 콜백 전달
    template.execute(() -> log.info("비즈니스 로직1 실행")); 
    template.execute(() -> log.info("비즈니스 로직2 실행"));
}
```

- `execute()` 메서드에 람다식을 사용하여 콜백을 전달합니다.
- 람다식을 통해 간결하게 콜백을 구현할 수 있습니다.
- 전략 패턴과 비교하여 템플릿 콜백 패턴은 더 유연하고 간결한 구현이 가능합니다.

## 4. 스프링에서의 활용

- 스프링 프레임워크는 템플릿 콜백 패턴을 적극적으로 활용합니다:
  - JdbcTemplate: 데이터베이스 연동
  - RestTemplate: HTTP 통신
  - TransactionTemplate: 트랜잭션 처리
  - RedisTemplate: Redis 데이터 접근

:::tip
스프링에서 클래스 이름이 'XxxTemplate'인 경우, 대부분 템플릿 콜백 패턴이 적용되어 있습니다.
:::

## 5. 장점과 활용 전략

### 5.1 패턴의 장점

- 코드 재사용성 향상
- 변경에 유연한 설계
- 비즈니스 로직 집중도 향상
- 중복 코드 제거

### 5.2 실무 활용 전략

- 공통 로직 템플릿화
- 트랜잭션 처리
- 리소스 해제
- 성능 측정

## 6. 마치며

- 템플릿 콜백 패턴은 스프링 프레임워크의 근간을 이루는 핵심 디자인 패턴입니다.
- 이 패턴을 잘 이해하고 활용하면 더 유연하고 견고한 애플리케이션을 구현할 수 있습니다.

참고 자료:

- [스프링 핵심 원리 - 고급편](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B3%A0%EA%B8%89%ED%8E%B8/dashboard)