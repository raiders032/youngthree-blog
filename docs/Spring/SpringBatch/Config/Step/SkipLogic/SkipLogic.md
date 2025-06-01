---
title: "Skip Logic"
description: "Spring Batch에서 Skip Logic을 구성하는 방법을 상세히 알아봅니다. 예외 처리 전략부터 skipLimit 설정, 특정 예외 제외까지 실무에서 활용할 수 있는 완벽한 가이드를 제공합니다."
tags: ["SPRING_BATCH", "SKIP_LOGIC", "EXCEPTION_HANDLING", "SPRING", "BACKEND", "JAVA"]
keywords: ["스프링배치", "Spring Batch", "스킵로직", "Skip Logic", "예외처리", "Exception Handling", "skipLimit", "스킵리미트", "faultTolerant", "내결함성", "배치처리", "Batch Processing", "Spring Boot", "스프링부트"]
draft: false
hide_title: true
---

## 1. Skip Logic이란?

- Spring Batch에서 Skip Logic은 step 처리 중 발생하는 예외를 처리하여 전체 step의 실패를 방지하는 중요한 기능입니다. 
- 데이터 처리 과정에서 일부 레코드에 문제가 있더라도 전체 step 작업을 중단하지 않고 해당 레코드만 건너뛰고 계속 진행할 수 있게 해줍니다.

:::info
Skip Logic은 데이터의 성격과 비즈니스 요구사항에 따라 신중하게 결정해야 합니다. 금융 데이터처럼 정확성이 중요한 경우에는 스킵을 허용하지 않는 것이 좋지만, 벤더 목록 같은 데이터에서는 일부 잘못된 형식의 레코드를 건너뛰는 것이 적절할 수 있습니다.
:::

## 2. 기본 Skip 설정

### 2.1 Skip Limit 설정

- Spring Batch에서 Skip Logic을 사용하려면 먼저 `faultTolerant()`를 활성화하고 `skipLimit()`를 설정해야 합니다.
- 만약 `skipLimit()`을 설정하지 않으면 기본값은 10입니다. 즉, 최대 10개의 아이템을 스킵할 수 있습니다.

#### 기본 Skip 설정 예시

```java
@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
            .<String, String>chunk(10, transactionManager)
            .reader(flatFileItemReader())
            .writer(itemWriter())
            .faultTolerant()
            .skipLimit(10)
            .skip(FlatFileParseException.class)
            .build();
}
```

- 이 설정에서는 `FlatFileParseException`이 발생할 때마다 해당 아이템을 건너뛰며, 최대 10개까지 스킵을 허용합니다.

### 2.2 Skip Limit의 동작 방식

:::warning
skipLimit에 도달하면 다음 예외가 발생할 때 Step이 실패합니다. 즉, 11번째 스킵할 예외가 발생하면 Step이 중단됩니다.
:::

- Skip 카운트는 읽기(read), 처리(process), 쓰기(write) 단계별로 별도로 집계됩니다.
- 하지만 제한은 모든 스킵에 대해 전체적으로 적용됩니다
  - 즉 읽기 단계에서 5개, 처리 단계에서 3개, 쓰기 단계에서 2개가 스킵되었다면 총 10개로 계산됩니다.
- `skipLimit()`을 명시적으로 설정하지 않으면 기본값은 10입니다

## 3. 고급 Skip 설정

### 3.1 여러 예외 타입 처리

- 앞서 예시의 문제점은 `FlatFileParseException` 외의 다른 예외가 발생하면 Job이 실패한다는 것입니다. 
- 더 유연한 처리를 위해 다양한 예외 설정 방법을 살펴보겠습니다.

#### 모든 예외를 스킵하되 특정 예외만 제외하기

```java
@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
            .<String, String>chunk(10, transactionManager)
            .reader(flatFileItemReader())
            .writer(itemWriter())
            .faultTolerant()
            .skipLimit(10)
            .skip(Exception.class)
            .noSkip(FileNotFoundException.class)
            .build();
}
```

- 위 설정에서느 모든 `Exception`을 스킵 가능하도록 설정했습니다.
- `FileNotFoundException`은 치명적인 예외로 처리하여 스킵하지 않도록 설정합니다.
  - 즉 `FileNotFoundException`이 발생하면 즉시 Step이 실패합니다.

### 3.2 예외 계층 구조와 스킵 결정

- 예외의 스킵 가능 여부는 클래스 계층 구조에서 가장 가까운 상위 클래스에 의해 결정됩니다. 
- 분류되지 않은 예외는 치명적인 것으로 처리됩니다.
- Spring Batch는 예외 처리 시 다음과 같은 우선순위를 따릅니다:
  - 발생한 예외와 정확히 일치하는 설정이 있으면 해당 설정을 적용
  - 일치하는 설정이 없으면 상위 클래스 중 가장 가까운 설정을 적용
  - 어떤 설정도 적용되지 않으면 치명적인 예외로 처리

## 4. 실무 적용 가이드

### 4.1 데이터 특성에 따른 Skip 전략

#### 금융 데이터 처리

```java
@Bean
public Step financialDataStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("financialDataStep", jobRepository)
            .<Transaction, Transaction>chunk(100, transactionManager)
            .reader(transactionReader())
            .processor(transactionProcessor())
            .writer(transactionWriter())
            .faultTolerant()
            .skipLimit(0) // 금융 데이터는 스킵 허용하지 않음
            .build();
}
```

- skipLimit을 0으로 설정하여 금융 데이터 처리 시 예외가 발생하면 즉시 Step이 실패하도록 합니다.

#### 일반 마스터 데이터 처리

```java
@Bean
public Step vendorDataStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("vendorDataStep", jobRepository)
            .<Vendor, Vendor>chunk(50, transactionManager)
            .reader(vendorReader())
            .processor(vendorProcessor())
            .writer(vendorWriter())
            .faultTolerant()
            .skipLimit(100)
            .skip(ValidationException.class)
            .skip(DataFormatException.class)
            .noSkip(SystemException.class)
            .build();
}
```

- 일반 마스터 데이터 처리에서는 `ValidationException`과 `DataFormatException`을 스킵하고, `SystemException`은 치명적인 예외로 처리합니다.

### 4.2 Skip과 Retry 조합 사용

```java
@Bean
public Step resilientStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("resilientStep", jobRepository)
            .<String, String>chunk(10, transactionManager)
            .reader(itemReader())
            .writer(itemWriter())
            .faultTolerant()
            .skipLimit(10)
            .skip(ValidationException.class)
            .retryLimit(3)
            .retry(TransientException.class)
            .build();
}
```

이 설정에서는:
- `TransientException`이 발생하면 최대 3번까지 재시도
- `ValidationException`이 발생하면 재시도 없이 바로 스킵
- 최대 10개까지 스킵 허용

## 5. 주의사항 및 모범 사례

### 5.1 설정 순서

:::info

`skip()`과 `noSkip()` 메서드의 호출 순서는 중요하지 않습니다. Spring Batch가 예외 계층 구조를 기반으로 적절한 설정을 찾아 적용합니다.

:::

### 5.2 로깅 및 모니터링

Skip된 레코드는 반드시 로깅되어야 하며, 이는 일반적으로 리스너를 통해 처리됩니다:

```java
@Bean
public Step monitoredStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("monitoredStep", jobRepository)
            .<String, String>chunk(10, transactionManager)
            .reader(itemReader())
            .writer(itemWriter())
            .faultTolerant()
            .skipLimit(10)
            .skip(Exception.class)
            .listener(skipListener())
            .build();
}
```

### 5.3 성능 고려사항

- Skip이 빈번하게 발생하면 성능에 영향을 줄 수 있습니다
- Skip된 아이템의 수가 예상보다 많다면 데이터 품질이나 처리 로직을 재검토해야 합니다
- 적절한 skipLimit 설정으로 무한 스킵을 방지해야 합니다

## 6. 마치며

Spring Batch의 Skip Logic은 견고한 배치 처리 시스템을 구축하는 데 필수적인 기능입니다. 데이터의 특성과 비즈니스 요구사항을 충분히 고려하여 적절한 Skip 전략을 수립하고, 모니터링을 통해 지속적으로 개선해 나가는 것이 중요합니다.

:::warning

Skip Logic을 사용할 때는 항상 데이터 정합성과 비즈니스 규칙을 우선적으로 고려해야 합니다. 편의를 위해 무분별하게 Skip을 허용하면 데이터 품질 문제가 발생할 수 있습니다.

:::