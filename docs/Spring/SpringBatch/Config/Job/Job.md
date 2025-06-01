## 1 Spring Batch Job 구성 가이드 (Java 설정)

- Spring Batch에서 Java 설정을 사용하여 Job을 구성하는 방법에 대해 자세히 알아보겠습니다.
- Job은 배치 처리의 가장 상위 개념으로, 전체 배치 프로세스를 캡슐화합니다.
- 이 가이드에서는 Job 구성, 재시작 가능성, 실행 가로채기, 파라미터 검증 등 다양한 측면을 다룹니다.

## 2 Job 구성하기

- Spring Batch에서는 Job은 인터페이스로 정의되어 있으며, 이를 구현하는 여러 클래스가 존재합니다.
- 대부분의 구현체들은 제공되는 빌더로 추상화되어 있습니다.
- Java 설정에서는 `JobBuilder`를 사용하여 Job을 구성합니다.
  - `org.springframework.batch.core.job.builder.JobBuilder` 클래스로 Job을 생성할 수 있습니다.

### 2.1 Java 설정 예시

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

### 3.1 재시작 방지 설정 (Java 설정)

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

### 4.1 JobExecutionListener 인터페이스

```java
public interface JobExecutionListener {
    void beforeJob(JobExecution jobExecution);
    void afterJob(JobExecution jobExecution);
}
```

- `beforeJob`: Job 실행 전에 호출됩니다.
- `afterJob` Job 실행 후에 호출되며, Job의 성공 여부와 관계없이 항상 호출됩니다.

```java
public void afterJob(JobExecution jobExecution){
    if (jobExecution.getStatus() == BatchStatus.COMPLETED ) {
        //job success
    }
    else if (jobExecution.getStatus() == BatchStatus.FAILED) {
        //job failure
    }
}
```

- `afterJob` 메소드는 잡의 성공 여부와 관계 없이 호출됩니다.
- 만약 성공과 실패 여부를 알고 싶다면 `JobExecution` 객체의 상태를 통해 확인할 수 있습니다.

### 4.1 Listener 추가 (Java 설정)

```java
@Bean
public Job footballJob(JobRepository jobRepository) {
    return new JobBuilder("footballJob", jobRepository)
                     .listener(sampleListener())
                     .start(playerLoad())
                     .next(gameLoad())
                     .next(playerSummarization())
                     .build();
}
```

- `listener()` 메소드를 사용하여 Job에 listener를 추가할 수 있습니다.

## 5 JobParametersValidator

- Job 실행 시 전달되는 파라미터의 유효성을 검증하기 위해 `JobParametersValidator`를 사용할 수 있습니다.
- 이는 필수 파라미터가 모두 제공되었는지 확인하는 등의 용도로 유용합니다.
- 간단한 경우 `DefaultJobParametersValidator`를 사용할 수 있으며, 복잡한 검증 로직이 필요한 경우 `JobParametersValidator` 직접 인터페이스를 구현할 수 있습니다

### 5.1 Java 설정 예시

```java
@Bean
public Job job1(JobRepository jobRepository) {
    return new JobBuilder("job1", jobRepository)
                     .validator(parametersValidator())
                     .start(step1())
                     .next(step2())
                     .build();
}

@Bean
public JobParametersValidator parametersValidator() {
    DefaultJobParametersValidator validator = new DefaultJobParametersValidator();
    validator.setRequiredKeys(new String[]{"date", "amount"});
    validator.setOptionalKeys(new String[]{"volume"});
    return validator;
}
```

- `validator()` 메소드를 사용하여 Job에 파라미터 검증기를 추가할 수 있습니다.
- Spring Batch에서 제공하는 `DefaultJobParametersValidator`를 사용하거나, 필요에 따라 직접 `JobParametersValidator` 인터페이스를 구현할 수 있습니다.
- 위 예시에서는 `date`와 `amount`를 필수 파라미터로, `volume`을 선택적 파라미터로 설정하고 있습니다.

## 6 결론

- Spring Batch의 Job 구성은 Java 설정을 통해 매우 유연하고 강력하게 할 수 있습니다.
- `JobBuilder`를 사용하여 Job을 정의하고 구성할 수 있습니다.
- 재시작 가능성, 실행 가로채기, 파라미터 검증 등 다양한 기능을 활용하여 복잡한 배치 처리 로직을 구현할 수 있습니다.
- 이러한 기능들을 적절히 활용하면 견고하고 유지보수가 용이한 배치 애플리케이션을 개발할 수 있습니다.
- Java 설정을 통해 코드 기반의 명확하고 타입 안전한 Job 구성이 가능하며, 이는 대규모 및 복잡한 배치 애플리케이션 개발에 특히 유용합니다.

## 참고

- https://docs.spring.io/spring-batch/reference/job/configuring.html