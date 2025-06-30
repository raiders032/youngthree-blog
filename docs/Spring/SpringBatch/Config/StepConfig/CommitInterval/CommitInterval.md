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

### 4.1 Java 설정 예시

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

## 7 동적 청크 크기 조절

- 고정된 Commit Interval 외에도 Spring Batch는 동적으로 청크 크기를 조절할 수 있는 방법을 제공합니다.
- 이를 위해 `CompletionPolicy` 인터페이스를 사용합니다.
- `CompletionPolicy`는 청크가 완료되어야 하는 시점을 결정하는 정책을 정의합니다.
	- 이를 통해 청크가 완료되는 시점을 프로그래밍 방식으로 조정할 수 있습니다.

### 7.1 CompletionPolicy 종류

- Spring Batch는 다양한 CompletionPolicy의 구현체를 제공합니다. 아래는 주요 구현체입니다
- `SimpleCompletionPolicy`
	- 고정된 개수의 아이템을 처리한 후 청크를 완료합니다 (기본 설정).
	- 이 개수가 미리 구성해둔 임계값에 도달하면 청크 완료로 표시합니다.
- `TimeoutTerminationPolicy`
	- 지정된 시간이 경과한 후 청크를 완료합니다.
	- 타임 아웃만으로 청크 완료 시점을 결정하는 것은 충분하지 않습니다. 따라서 이 정책은 다른 CompletionPolicy와 함께 사용됩니다.
- `CompositeCompletionPolicy`
	- 여러 CompletionPolicy를 조합하여 사용합니다.
	- 여러 정책 중 하나라도 충족되면 청크를 완료합니다.

### 7.2 CompositeCompletionPolicy 활용

- 실제 예시를 통해 CompositeCompletionPolicy를 설정하는 방법을 알아보겠습니다.

#### 7.2.1 CompositeCompletionPolicy 설정 예시

```java
@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    // 최대 100개 또는 30초 중 먼저 도달하는 조건으로 청크 완료
    CompositeCompletionPolicy completionPolicy = new CompositeCompletionPolicy();
    completionPolicy.setPolicies(new CompletionPolicy[] {
        new SimpleCompletionPolicy(100),
        new TimeoutTerminationPolicy(30)
    });
    
    return new StepBuilder("step1", jobRepository)
                .<String, String>chunk(completionPolicy, transactionManager)
                .reader(itemReader())
                .writer(itemWriter())
                .build();
}
```

- 위 예시에서는 100개의 아이템을 처리하거나 30초가 경과하면 청크가 완료됩니다.
- 두 조건 중 먼저 충족되는 조건에 의해 청크가 완료됩니다.

### 7.3 사용자 정의 CompletionPolicy

- Spring Batch는 기본 제공되는 CompletionPolicy 외에도 사용자 정의 CompletionPolicy를 구현할 수 있습니다.

#### 7.3.1 메모리 기반 CompletionPolicy 예시

#### 7.3.1 RandomChunkSizePolicy 구현

```java
public class RandomChunkSizePolicy implements CompletionPolicy {
    private final int minChunkSize;
    private final int maxChunkSize;
    private final Random random = new Random();
    private int targetChunkSize;
    private int currentCount;
    
    public RandomChunkSizePolicy(int minChunkSize, int maxChunkSize) {
        this.minChunkSize = minChunkSize;
        this.maxChunkSize = maxChunkSize;
        this.targetChunkSize = generateRandomChunkSize();
    }
    
    private int generateRandomChunkSize() {
        return random.nextInt(maxChunkSize - minChunkSize + 1) + minChunkSize;
    }
    
    @Override
    public boolean isComplete(RepeatContext context, RepeatStatus result) {
        return currentCount >= targetChunkSize;
    }
    
    @Override
    public boolean isComplete(RepeatContext context) {
        return isComplete(context, null);
    }
    
    @Override
    public RepeatContext start(RepeatContext parent) {
        currentCount = 0;
        targetChunkSize = generateRandomChunkSize();
        return new SimpleRepeatContext(parent);
    }
    
    @Override
    public void update(RepeatContext context) {
        currentCount++;
    }
}
```

- **start(RepeatContext parent)**: 새로운 청크가 시작될 때 호출됩니다.
	- 카운터를 0으로 초기화하고 새로운 랜덤 청크 크기를 생성합니다.
	- RepeatContext 객체를 반환하여 청크 처리 과정에서 상태를 관리합니다.
- **update(RepeatContext context)**: 각 아이템이 처리될 때마다 호출됩니다.
	- 현재 처리된 아이템 개수를 증가시킵니다.
	- 청크 완료 조건을 판단하기 위한 상태를 업데이트합니다.
- **isComplete(RepeatContext context, RepeatStatus result)**: 청크가 완료되었는지 판단합니다.
	- 현재 처리된 아이템 개수가 목표 청크 크기에 도달했는지 확인합니다.
	- true를 반환하면 현재 청크가 완료되어 트랜잭션이 커밋됩니다.
- **isComplete(RepeatContext context)**: 위의 메서드와 동일하지만 RepeatStatus 없이 호출되는 오버로드 메서드입니다.
	- 내부적으로 첫 번째 isComplete 메서드를 호출합니다.

### 7.4 동적 청크 크기 조절의 장점

- **유연성**: 처리 상황에 따라 적응적으로 청크 크기를 조절할 수 있습니다.
- **리소스 최적화**: 메모리 사용량이나 처리 시간에 따라 청크 크기를 조절하여 시스템 리소스를 효율적으로 사용할 수 있습니다.
- **안정성**: 예상보다 큰 데이터나 복잡한 처리로 인한 시스템 부하를 방지할 수 있습니다.

## 8 결론

- Commit Interval은 Spring Batch의 성능 튜닝에 중요한 요소입니다.
- 고정된 Commit Interval 외에도 CompletionPolicy를 통한 동적 청크 크기 조절이 가능합니다.
- CompositeCompletionPolicy를 활용하면 여러 조건을 조합하여 더욱 유연한 청크 완료 정책을 구현할 수 있습니다.
- 실제 운영 환경에서는 데이터 특성과 시스템 환경을 고려하여 최적의 설정을 찾는 것이 중요합니다.

## 참고

- https://docs.spring.io/spring-batch/reference/step/chunk-oriented-processing/commit-interval.html
- [스프링 배치 완벽 가이드](https://product.kyobobook.co.kr/detail/S000001805018?utm_source=google&utm_medium=cpc&utm_campaign=googleSearch&gt_network=g&gt_keyword=&gt_target_id=aud-901091942354:dsa-435935280379&gt_campaign_id=9979905549&gt_adgroup_id=132556570510&gad_source=1)