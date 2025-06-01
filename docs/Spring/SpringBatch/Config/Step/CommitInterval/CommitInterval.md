## 1 Spring Batch의 Commit Interval 설정 가이드

- Spring Batch에서 Step의 중요한 설정 중 하나인 Commit Interval에 대해 알아보겠습니다.
- Commit Interval은 배치 처리의 성능과 안정성에 큰 영향을 미치는 중요한 요소입니다.

## 2 Commit Interval이란?

- Commit Interval은 한 트랜잭션 내에서 처리할 아이템의 수를 지정하는 설정입니다.
- Step은 아이템을 읽고 쓰는 과정에서 주기적으로 트랜잭션을 커밋합니다.
- 이 때 사용되는 것이 `PlatformTransactionManager`입니다.

## 3 Commit Interval의 중요성

- Commit Interval을 1로 설정하면 각 아이템을 처리할 때마다 트랜잭션을 시작하고 커밋합니다.
- 하지만 트랜잭션을 시작하고 커밋하는 과정은 비용이 많이 듭니다.
- 따라서 가능한 한 많은 아이템을 한 트랜잭션 내에서 처리하는 것이 효율적입니다.
- 적절한 Commit Interval은 처리하는 데이터의 유형과 Step이 상호작용하는 리소스에 따라 다릅니다.

## 4 Commit Interval 설정 방법

- Java Configuration을 사용하여 Commit Interval을 설정할 수 있습니다.
- `StepBuilder`의 `chunk()` 메소드를 사용하여 Commit Interval을 지정합니다.

**Java 설정 예시**

```java
@Bean
public Job sampleJob(JobRepository jobRepository, Step step1) {
    return new JobBuilder("sampleJob", jobRepository)
                     .start(step1)
                     .build();
}

@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
                .<String, String>chunk(10, transactionManager)
                .reader(itemReader())
                .writer(itemWriter())
                .build();
}
```

- 위 예시에서는 Commit Interval을 10으로 설정했습니다.
- 이는 `chunk(10, transactionManager)` 부분에서 지정됩니다.

## 5 Commit Interval의 동작 방식

- Commit Interval이 10으로 설정된 경우, 다음과 같이 동작합니다:
	1. 처리 시작 시 트랜잭션이 시작됩니다.
	2. `ItemReader`의 `read` 메소드가 호출될 때마다 카운터가 증가합니다.
	3. 카운터가 10에 도달하면, 누적된 아이템 리스트가 `ItemWriter`에 전달됩니다.
	4. 그 후 트랜잭션이 커밋됩니다.
- 이 과정을 통해 10개의 아이템이 하나의 트랜잭션 내에서 처리됩니다.

## 6 Commit Interval 설정 시 고려사항

- 데이터의 특성: 처리하는 데이터의 크기와 복잡성에 따라 적절한 값을 설정해야 합니다.
- 시스템 리소스: 메모리 사용량과 데이터베이스 연결 수를 고려해야 합니다.
- 오류 복구: Commit Interval이 너무 크면 오류 발생 시 재처리해야 할 데이터량이 많아집니다.
- 성능: 너무 작은 값은 잦은 트랜잭션으로 인한 성능 저하를, 너무 큰 값은 메모리 부족을 야기할 수 있습니다.

## 7 결론

- Commit Interval은 Spring Batch의 성능 튜닝에 중요한 요소입니다.
- 적절한 Commit Interval 설정을 통해 배치 작업의 효율성과 안정성을 높일 수 있습니다.
- 실제 운영 환경에서는 다양한 값으로 테스트를 수행하여 최적의 Commit Interval을 찾는 것이 좋습니다.

## 참고

- https://docs.spring.io/spring-batch/reference/step/chunk-oriented-processing/commit-interval.html