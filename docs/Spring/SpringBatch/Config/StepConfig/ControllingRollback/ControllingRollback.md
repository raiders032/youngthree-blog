---
title: "Spring Batch 롤백 제어와 트랜잭션 Reader 처리 방법"
description: "Spring Batch에서 Step 처리 중 발생하는 예외에 대한 롤백을 제어하는 방법과 트랜잭션 Reader를 처리하는 방법을 상세히 알아봅니다. noRollback 설정과 readerIsTransactionalQueue 옵션을 통한 실무적인 배치 처리 최적화 방법을 제공합니다."
tags: ["SPRING_BATCH", "SPRING", "BACKEND", "JAVA", "TRANSACTION", "DATABASE"]
keywords: ["스프링배치", "Spring Batch", "롤백제어", "rollback control", "트랜잭션", "transaction", "ItemWriter", "ItemReader", "noRollback", "readerIsTransactionalQueue", "배치처리", "batch processing", "스프링", "Spring", "자바", "Java", "백엔드", "backend"]
draft: false
hide_title: true
---

## 1. Spring Batch 롤백 제어 개요

- Spring Batch에서 Step 실행 중 예외가 발생하면 기본적으로 전체 트랜잭션이 롤백됩니다.
- 하지만 실무에서는 특정 예외에 대해서는 롤백을 방지해야 하는 경우가 있습니다.
- Spring Batch는 이러한 요구사항을 위해 롤백 제어 기능과 트랜잭션 Reader 처리 옵션을 제공합니다.

## 2. 기본 롤백 동작 방식

### 2.1 ItemWriter 예외 처리

- 기본적으로 `ItemWriter`에서 발생하는 모든 예외는 Step의 트랜잭션 롤백을 발생시킵니다.
- retry나 skip 설정과 관계없이 예외 발생 시 롤백이 수행됩니다.
- 이는 데이터 일관성을 보장하기 위한 안전장치 역할을 합니다.

### 2.2 ItemReader 예외 처리

- skip이 설정된 경우, `ItemReader`에서 발생하는 예외는 롤백을 발생시키지 않습니다.
- 이는 Reader 단계에서의 오류가 전체 트랜잭션에 영향을 주지 않도록 하기 위함입니다.

:::info[롤백 동작의 이해]

롤백은 데이터베이스의 ACID 특성을 보장하는 중요한 메커니즘입니다. Spring Batch에서는 청크 단위로 트랜잭션이 관리되며, 청크 내 어떤 항목에서든 예외가 발생하면 해당 청크 전체가 롤백됩니다.

:::

## 3. 롤백 제어 설정 방법

### 3.1 noRollback 설정

- 특정 예외 타입에 대해 롤백을 방지하려면 `noRollback()` 메서드를 사용합니다.
- 이는 예외가 발생해도 트랜잭션을 무효화하지 않는 경우에 유용합니다.

#### Java Configuration을 통한 설정

```java
@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
                .<String, String>chunk(2, transactionManager)
                .reader(itemReader())
                .writer(itemWriter())
                .faultTolerant()
                .noRollback(ValidationException.class)
                .build();
}
```

이 설정을 통해 `ValidationException`이 발생해도 트랜잭션이 롤백되지 않습니다.

### 3.2 여러 예외 타입 설정

- 여러 예외 타입에 대해 롤백을 방지하려면 각각의 예외 클래스를 지정할 수 있습니다.

```java
@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
                .<String, String>chunk(2, transactionManager)
                .reader(itemReader())
                .writer(itemWriter())
                .faultTolerant()
                .noRollback(ValidationException.class)
                .noRollback(BusinessException.class)
                .build();
}
```

## 4. 트랜잭션 Reader 처리

### 4.1 트랜잭션 Reader의 필요성

- `ItemReader`는 기본적으로 forward-only 계약을 가집니다.
- Step은 롤백 시 재읽기를 피하기 위해 reader 입력을 버퍼링합니다.
- 하지만 JMS 큐와 같은 트랜잭션 리소스 기반 Reader의 경우 특별한 처리가 필요합니다.

:::warning[JMS 큐와 트랜잭션]

JMS 큐는 트랜잭션과 연결되어 있어, 롤백 시 큐에서 가져온 메시지들이 다시 큐로 돌아갑니다. 이런 경우 Step의 버퍼링 기능이 오히려 문제가 될 수 있습니다.

:::

### 4.2 readerIsTransactionalQueue 설정

- 트랜잭션 리소스 기반 Reader의 경우 `readerIsTransactionalQueue()` 옵션을 사용합니다.
- 이 설정은 Step이 아이템을 버퍼링하지 않도록 합니다.

#### 트랜잭션 큐 Reader 설정

```java
@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
                .<String, String>chunk(2, transactionManager)
                .reader(itemReader())
                .writer(itemWriter())
                .readerIsTransactionalQueue()
                .build();
}
```

이 설정을 통해 JMS 큐와 같은 트랜잭션 리소스에서 안전하게 데이터를 읽을 수 있습니다.

## 5. 실무 적용 사례

### 5.1 검증 예외 처리 사례

- 데이터 검증 과정에서 발생하는 예외는 보통 롤백 대상이 아닙니다.
- 잘못된 데이터 포맷이나 비즈니스 룰 위반 등은 로그만 남기고 처리를 계속할 수 있습니다.

```java
@Bean
public Step dataValidationStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("dataValidationStep", jobRepository)
                .<CustomerData, ProcessedData>chunk(100, transactionManager)
                .reader(customerDataReader())
                .processor(validationProcessor())
                .writer(processedDataWriter())
                .faultTolerant()
                .noRollback(DataValidationException.class)
                .noRollback(FormatException.class)
                .skip(DataValidationException.class)
                .skipLimit(1000)
                .build();
}
```

### 5.2 메시지 큐 처리 사례

- JMS나 RabbitMQ와 같은 메시지 큐에서 데이터를 읽는 경우의 설정입니다.

```java
@Bean
public Step messageProcessingStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("messageProcessingStep", jobRepository)
                .<Message, ProcessedMessage>chunk(50, transactionManager)
                .reader(jmsMessageReader())
                .processor(messageProcessor())
                .writer(messageWriter())
                .readerIsTransactionalQueue()
                .faultTolerant()
                .retry(ConnectionException.class)
                .retryLimit(3)
                .build();
}
```

## 6. 주의사항과 모범 사례

### 6.1 주의사항

- `noRollback` 설정은 신중하게 사용해야 합니다.
- 데이터 일관성에 영향을 줄 수 있는 예외는 롤백되도록 두는 것이 안전합니다.
- 트랜잭션 Reader 설정은 실제로 트랜잭션 리소스를 사용하는 경우에만 적용해야 합니다.

:::danger[데이터 일관성 주의]

noRollback 설정을 과도하게 사용하면 데이터 불일치 문제가 발생할 수 있습니다. 반드시 비즈니스 로직을 충분히 검토한 후 적용하시기 바랍니다.

:::

### 6.2 모범 사례

- 예외 타입별로 명확한 처리 전략을 수립합니다.
- 롤백하지 않는 예외는 반드시 로깅하여 추적 가능하도록 합니다.
- 트랜잭션 리소스 사용 시에는 해당 리소스의 특성을 정확히 이해하고 설정합니다.

```java
@Bean
public Step robustProcessingStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("robustProcessingStep", jobRepository)
                .<InputData, OutputData>chunk(200, transactionManager)
                .reader(inputDataReader())
                .processor(dataProcessor())
                .writer(outputDataWriter())
                .faultTolerant()
                // 비즈니스 예외는 롤백하지 않음
                .noRollback(BusinessValidationException.class)
                .noRollback(DataFormatException.class)
                // 시스템 예외는 재시도
                .retry(DatabaseException.class)
                .retry(NetworkException.class)
                .retryLimit(3)
                // 복구 불가능한 예외는 스킵
                .skip(CorruptedDataException.class)
                .skipLimit(100)
                .build();
}
```

## 7. 마치며

- Spring Batch의 롤백 제어 기능은 복잡한 배치 처리 시나리오에서 매우 유용한 도구입니다.
- 적절한 예외 처리 전략과 트랜잭션 리소스 처리를 통해 안정적이고 효율적인 배치 애플리케이션을 구축할 수 있습니다.
- 항상 데이터 일관성과 비즈니스 요구사항을 고려하여 설정을 적용하시기 바랍니다.

## 참고

- https://docs.spring.io/spring-batch/reference/step/chunk-oriented-processing/controlling-rollback.html