## 1 Spring Batch의 Step 구성 및 예외 처리 가이드

- Spring Batch에서 Step은 배치 처리의 핵심 단위입니다.
- 이 가이드에서는 Step의 기본 예외 처리 방식과 다양한 구성 옵션에 대해 자세히 설명합니다.
- 초보자도 이해할 수 있도록 최대한 상세하게 설명하겠습니다.

## 2 Spring Batch의 기본 예외 처리

- Spring Batch는 기본적으로 예외 발생 시 해당 Step을 실패 처리합니다.
- 예외가 발생하면 현재 처리 중인 청크(chunk)가 롤백되고 Step이 종료됩니다.
- 이는 데이터 무결성을 보장하기 위한 안전한 접근 방식입니다.

**기본 예외 처리의 특징**

- 모든 예외는 Step 실패의 원인이 됩니다.
- 청크 단위로 트랜잭션이 관리되므로, 예외 발생 시 해당 청크의 모든 처리가 롤백됩니다.
- Job은 실패한 Step에서 중단됩니다.

**기본 구성 예시**

```java
@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
                .<String, String>chunk(10, transactionManager)
                .reader(itemReader())
                .processor(itemProcessor())
                .writer(itemWriter())
                .build();
}
```

- 위 예시에서는 별도의 예외 처리 구성이 없으므로, 어떤 예외라도 발생하면 Step이 실패합니다.

## 3 Skip 로직 구성하기

- Skip 로직은 처리 중 발생하는 특정 오류를 무시하고 계속 진행하도록 설정하는 것입니다.
- 기본 예외 처리와 달리, 일부 예외를 허용하여 배치 작업을 계속 진행할 수 있게 합니다.

### 3.1 Skip 구성 방법

- `faultTolerant()` 메서드를 사용하여 내결함성 처리를 활성화합니다.
- `skipLimit()` 메서드로 최대 Skip 횟수를 설정합니다.
- `skip()` 메서드로 Skip할 예외 유형을 지정합니다.

**Skip 구성 예시**

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

- 이 구성에서는 `FlatFileParseException`이 발생해도 Step이 계속 실행됩니다.
- 최대 10번까지 이 예외를 Skip할 수 있으며, 11번째 발생 시 Step이 실패합니다.

### 3.2 Skip 로직의 상세 동작

- Skip 카운트는 `skip()`으로 지정된 예외가 발생할 때마다 증가합니다.
- `skipLimit()`으로 설정한 값에 도달하면, 다음 Skip 대상 예외 발생 시 Step이 실패합니다.
- `noSkip()` 메서드를 사용하여 특정 예외는 Skip하지 않도록 설정할 수 있습니다.

**상세 Skip 구성 예시**

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

- 이 구성에서:
	1. `Exception`과 그 하위 예외들이 Skip 대상이 됩니다.
	2. `FileNotFoundException`은 Skip되지 않고 즉시 Step을 실패시킵니다.
	3. 그 외 예외들은 최대 10번까지 Skip됩니다.

## 4 Retry 로직 구성하기

- Retry 로직은 일시적인 문제로 인한 예외 발생 시 작업을 재시도하도록 설정하는 것입니다.
- 네트워크 오류나 일시적인 데이터베이스 잠금 등의 상황에서 유용합니다.

### 4.1 Retry 구성 방법

- `faultTolerant()` 메서드로 내결함성 처리를 활성화합니다.
- `retryLimit()` 메서드로 최대 재시도 횟수를 지정합니다.
- `retry()` 메서드로 재시도할 예외 유형을 지정합니다.

**Retry 구성 예시**

```java
@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
                .<String, String>chunk(10, transactionManager)
                .reader(itemReader())
                .writer(itemWriter())
                .faultTolerant()
                .retryLimit(3)
                .retry(DeadlockLoserDataAccessException.class)
                .build();
}
```

- 이 구성은 `DeadlockLoserDataAccessException` 발생 시 최대 3번까지 재시도합니다.

## 5 Rollback 제어하기

- 기본적으로 모든 예외는 트랜잭션 롤백을 유발합니다.
- 하지만 일부 예외는 롤백이 필요 없는 경우가 있습니다.

**Rollback 제어 예시**

```java
@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
                .<String, String>chunk(10, transactionManager)
                .reader(itemReader())
                .writer(itemWriter())
                .faultTolerant()
                .noRollback(ValidationException.class)
                .build();
}
```

- 이 구성에서는 `ValidationException`이 발생해도 트랜잭션이 롤백되지 않습니다.

## 6 결론

- Spring Batch는 기본적으로 엄격한 예외 처리를 통해 데이터 무결성을 보장합니다.
- Skip, Retry, Rollback 제어 등의 구성을 통해 유연한 예외 처리가 가능합니다.
- 이러한 구성을 적절히 활용하면 안정적이고 효율적인 배치 처리 시스템을 구축할 수 있습니다.
- 실제 운영 환경에서는 데이터의 특성과 비즈니스 요구사항을 고려하여 적절한 예외 처리 전략을 선택해야 합니다.