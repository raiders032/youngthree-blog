## 1 Spring Batch Job Configuration

- Spring Batch에서 Java 설정을 사용하여 Job을 구성하는 방법에 대해 자세히 알아보겠습니다.
- Job Configuration에 앞서 Spring Batch의 기본 설정이 완료되야 합니다.
  - [Batch Configuration](../../BatchConfig/BatchConfig.md) 참고
- Spring Batch에서는 Job은 인터페이스로 정의되어 있으며, 이를 구현하는 여러 클래스가 존재합니다.
- 대부분의 구현체들은 제공되는 빌더로 추상화되어 있습니다.
- Java 설정에서는 `JobBuilder`를 사용하여 Job을 구성합니다.
  - `org.springframework.batch.core.job.builder.JobBuilder` 클래스로 Job을 생성할 수 있습니다.

## 2 Java 설정 예시

```java
@Bean
public Job footballJob(JobRepository jobRepository) {
    return new JobBuilder("footballJob", jobRepository)
                     .start(playerLoad())
                     .next(gameLoad())
                     .next(playerSummarization())
                     .build();
}
```

- 위 예시에서는 `JobBuilder`를 사용하여 `footballJob`이라는 이름의 Job을 생성합니다.
- `start()` 메소드로 시작 Step을 지정하고, `next()` 메소드로 다음 Step들을 연결합니다.
- `build()` 메소드를 호출하여 최종적으로 Job 객체를 생성합니다.
- `JobRepository`는 Job의 실행 정보를 저장하고 관리하는 역할을 합니다.

## 3 Job의 재시작 가능성

- 배치 작업을 실행할 때 중요한 고려사항 중 하나는 Job이 재시작될 때의 동작입니다.
- 이미 `JobExecution`이 존재하는 `JobInstance`에 대해 Job을 실행하는 것을 "재시작"이라고 합니다.
- 이상적으로는 모든 Job이 중단된 지점부터 다시 시작할 수 있어야 하지만, 항상 가능한 것은 아닙니다.

### 3.1 재시작 방지 설정

- Job이 절대 재시작되어서는 안 되고 항상 새로운 JobInstance의 일부로 실행되어야 한다면, restartable 속성을 false로 설정할 수 있습니다.

```java
@Bean
public Job footballJob(JobRepository jobRepository) {
    return new JobBuilder("footballJob", jobRepository)
                     .preventRestart()
                     .start(playerLoad())
                     .next(gameLoad())
                     .next(playerSummarization())
                     .build();
}
```

- `preventRestart()` 메소드를 사용하면 Job의 재시작을 방지할 수 있습니다.
- 재시작이 불가능한 Job을 재시작하려고 하면 `JobRestartException`이 발생합니다.

### 3.2 JobRestartException

- JobRestartException은 재시작이 불가능한 Job에 대해 재시작을 시도할 때 발생하는 예외입니다.

#### 예시 코드

```java
Job job = new SimpleJob();
job.setRestartable(false);

JobParameters jobParameters = new JobParameters();

JobExecution firstExecution = jobRepository.createJobExecution(job, jobParameters);
jobRepository.saveOrUpdate(firstExecution);

try {
    jobRepository.createJobExecution(job, jobParameters);
    fail();
}
catch (JobRestartException e) {
    // 예상된 예외
}
```

- 위 JUnit 코드는 이 예외가 발생하는 상황을 보여줍니다.
- 재시작할 수 없는 Job에 대해 첫 번째 JobExecution을 생성하는 시도는 문제없이 진행됩니다.
- 그러나 두 번째 JobExecution을 생성하려고 하면 `JobRestartException`이 발생합니다.

## 4 Job 실행 가로채기

- Job 실행 중 특정 시점에 custom 코드를 실행하고 싶을 때 `JobExecutionListener`를 사용할 수 있습니다.
- `JobExecutionListener` 인터페이스는 `beforeJob`과 `afterJob` 두 메소드를 제공합니다.
- 자세한 내용은 아래 문서를 참고하세요.
  - [JobExecutionListener](../../../Listener/JobExecutionListener.md)

## 5 결론

- Spring Batch의 Job 구성은 Java 설정을 통해 매우 유연하고 강력하게 할 수 있습니다.
- @EnableBatchProcessing 어노테이션이나 DefaultBatchConfiguration 클래스를 사용하여 기본 인프라를 설정할 수 있습니다.
- `JobBuilder`를 사용하여 Job을 정의하고 구성할 수 있습니다.
- 재시작 가능성, 실행 가로채기, 파라미터 검증 등 다양한 기능을 활용하여 복잡한 배치 처리 로직을 구현할 수 있습니다.
- 이러한 기능들을 적절히 활용하면 견고하고 유지보수가 용이한 배치 애플리케이션을 개발할 수 있습니다.
- Java 설정을 통해 코드 기반의 명확하고 타입 안전한 Job 구성이 가능하며, 이는 대규모 및 복잡한 배치 애플리케이션 개발에 특히 유용합니다.

## 참고

- https://docs.spring.io/spring-batch/reference/job/configuring.html
- https://docs.spring.io/spring-batch/reference/job/java-config.html