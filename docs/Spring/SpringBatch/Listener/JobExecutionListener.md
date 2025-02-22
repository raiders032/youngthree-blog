## 1 JobExecutionListener

- 모든 잡은 생명주기를 갖습니다.
- 스프링 배치는 생명주기의 여러 시점에 로직을 추가할 수 있는 기능을 제공합니다.
- `JobExecutionListener`는 배치 작업(Job)의 실행 전후에 커스텀 로직을 수행할 수 있도록 하는 인터페이스입니다.
- 이를 통해 작업 시작 전 초기화 작업을 하거나, 작업 완료 후 정리 작업을 수행할 수 있습니다.

## 2 활용 사례

- **알림**: Job이 시작되거나 완료될 때 알림을 보내는 로직을 추가할 수 있습니다.
- **초기화**: Job 실행 전에 필요한 리소스를 초기화하는 작업을 수행할 수 있습니다.
- **정리**: Job 실행 후에 사용한 리소스를 정리하거나 후처리를 수행할 수 있습니다.

## 3 JobExecutionListener 인터페이스

```java
package org.springframework.batch.core;  
  
public interface JobExecutionListener {  
    default void beforeJob(JobExecution jobExecution) {  
    }  
  
    default void afterJob(JobExecution jobExecution) {  
    }  
}
```

- **beforeJob**
	- 잡을 실행하기 전에 `beforeJob` 메서드가 자동으로 호출됩니다.
- **afterJob**
	- 잡의 처리가 완료되면 `afterJob` 메서드가 자동으로 호출됩니다.
	- 잡의 완료 상태에 관계없이 호출됩니다.
	- 따라서 잡의 종료 상태에 따라 어떤 일을 수행할지 결정할 수 있습니다.

## 4 구현

- 아래는 `JobExecutionListener`를 구현하여 Job 실행 전후에 커스텀 로직을 추가하는 예제입니다:

```java
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CustomJobExecutionListener implements JobExecutionListener {

    @Override
    public void beforeJob(JobExecution jobExecution) {
        log.info("Job 시작 전 실행: " + jobExecution.getJobInstance().getJobName());
        // 초기화 작업 수행
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        log.info("Job 완료 후 실행: " + jobExecution.getJobInstance().getJobName());
        log.info("Job 상태: " + jobExecution.getStatus());
        // 정리 작업 수행
    }
}
```

- 위의 예제에서는 CustomJobExecutionListener가 JobExecutionListener 인터페이스를 구현하고, beforeJob과 afterJob 메서드를 오버라이드하여 Job의 실행 전후에
  로그를 출력하고 있습니다.

## 5 JobExecutionListener 등록

```java
@Configuration
public class BatchConfiguration {

    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private final JobExecutionListener jobExecutionListener;

    public BatchConfiguration(JobBuilderFactory jobBuilderFactory, 
                              StepBuilderFactory stepBuilderFactory, 
                              JobExecutionListener jobExecutionListener) {
        this.jobBuilderFactory = jobBuilderFactory;
        this.stepBuilderFactory = stepBuilderFactory;
        this.jobExecutionListener = jobExecutionListener;
    }

    @Bean
    public Job sampleJob() {
        return jobBuilderFactory.get("sampleJob")
                .start(sampleStep())
                .listener(jobExecutionListener) // Listener 등록
                .build();
    }

    @Bean
    public Step sampleStep() {
        return stepBuilderFactory.get("sampleStep")
                .<String, String>chunk(10)
                .reader(reader())
                .processor(processor())
                .writer(writer())
                .build();
    }

    // reader, processor, writer 빈 정의
}
```

- `Job`을 구성할 때 `listener` 메서드를 사용하여 `JobExecutionListener`를 등록합니다: