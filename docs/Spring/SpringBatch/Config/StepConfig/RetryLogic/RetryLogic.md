---
title: "Retry Logic"
description: "Spring Batch에서 예외 상황을 효과적으로 처리하기 위한 재시도(Retry) 로직 설정 방법을 알아봅니다. StepConfig 실행 중 발생하는 일시적 예외를 처리하고 배치 처리의 안정성을 높이는 실용적인 가이드입니다."
tags: ["SPRING_BATCH", "RETRY", "EXCEPTION_HANDLING", "SPRING", "BACKEND", "JAVA"]
keywords: ["스프링배치", "Spring Batch", "재시도", "retry", "리트라이", "예외처리", "exception handling", "DeadlockLoserDataAccessException", "데드락", "deadlock", "배치처리", "batch processing", "스프링", "Spring", "자바", "Java", "백엔드"]
draft: false
hide_title: true
---

## 1. Spring Batch 재시도 로직의 필요성

- Spring Batch에서 Step을 실행하는 동안 다양한 예외가 발생할 수 있습니다.
- 모든 예외가 치명적인 것은 아니며, 일부는 재시도를 통해 성공할 수 있습니다.
- 예외의 성격에 따라 적절한 처리 방식을 선택하는 것이 중요합니다.

### 1.1 예외 유형별 처리 방식

- 예외를 크게 두 가지 유형으로 분류할 수 있습니다
  - **결정적 예외(Deterministic Exception)**: 재시도해도 같은 결과가 나오는 예외
  - **비결정적 예외(Non-deterministic Exception)**: 재시도하면 성공할 가능성이 있는 예외

#### 1.1.1 결정적 예외의 예시

- `FlatFileParseException`: 파일 읽기 중 발생하는 파싱 오류
- 동일한 레코드에 대해 항상 같은 예외가 발생합니다.
- ItemReader를 재설정해도 해결되지 않습니다.
- 이런 경우에는 Skip 처리나 Step 실패로 처리하는 것이 적절합니다.

#### 1.1.2 비결정적 예외의 예시

- `DeadlockLoserDataAccessException`과 같이  잠시 기다린 후 재시도하면 성공할 가능성이 있는 예외가 있습니다.
  - `DeadlockLoserDataAccessException`은 데이터베이스 데드락으로 인한 예외입니다.
  - 현재 프로세스가 다른 프로세스가 잠금을 보유한 레코드를 업데이트하려 할 때 발생합니다.
- 이러한 비결정적 예외의 경우에는 재시도 로직을 적용하는 것이 효과적입니다.

:::tip[재시도 대상 예외 선정 기준]
재시도 대상 예외를 선정할 때는 다음 기준을 고려해야 합니다:
- 일시적인 네트워크 문제로 인한 예외
- 동시성 제어로 인한 데이터베이스 예외
- 외부 시스템의 일시적 장애로 인한 예외
:::

## 2. 재시도 로직 설정 방법

### 2.1 기본 재시도 설정

- Spring Batch에서 재시도 로직을 설정하는 방법은 다음과 같습니다.

#### 2.1.1 Java Configuration 방식

```java
@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
                .<String, String>chunk(2, transactionManager)
                .reader(itemReader())
                .writer(itemWriter())
                .faultTolerant()
                .retryLimit(3)
                .retry(DeadlockLoserDataAccessException.class)
                .build();
}
```

- 이 설정에서 각 옵션의 의미는 다음과 같습니다
- `faultTolerant()`: 오류 허용 모드를 활성화합니다.
- `retryLimit(3)`: 개별 아이템에 대해 최대 3번까지 재시도를 허용합니다.
- `retry(DeadlockLoserDataAccessException.class)`: 지정된 예외에 대해서만 재시도를 수행합니다.

### 2.2 다중 예외 타입 지원

- 여러 종류의 예외에 대해 재시도를 적용하고 싶다면 다음과 같이 설정할 수 있습니다.

#### 2.2.1 여러 예외 타입 설정

```java
@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
                .<String, String>chunk(2, transactionManager)
                .reader(itemReader())
                .writer(itemWriter())
                .faultTolerant()
                .retryLimit(3)
                .retry(DeadlockLoserDataAccessException.class)
                .retry(OptimisticLockingFailureException.class)
                .retry(TransientDataAccessException.class)
                .build();
}
```

## 참고

- https://docs.spring.io/spring-batch/reference/step/chunk-oriented-processing/retry-logic.html