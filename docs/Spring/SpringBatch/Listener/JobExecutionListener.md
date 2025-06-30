---
title: "JobExecutionListener"
description: "스프링 배치의 JobExecutionListener를 활용하여 Job 실행 전후에 커스텀 로직을 추가하는 방법을 상세히 알아봅니다. 실무에서 활용할 수 있는 알림, 초기화, 정리 작업 등의 예제와 함께 설명합니다."
tags: ["JOB_EXECUTION_LISTENER", "SPRING_BATCH", "SPRING", "BACKEND", "JAVA", "BATCH_PROCESSING", "LIFECYCLE"]
keywords: ["JobExecutionListener", "잡실행리스너", "스프링배치", "Spring Batch", "배치리스너", "Job Execution Listener", "배치생명주기", "batch lifecycle", "스프링", "Spring", "자바", "Java", "백엔드", "backend", "beforeJob", "afterJob"]
draft: false
hide_title: true
---

## 1. Intercepting Job Execution

- 이번 글에서는 잡 실행 전후에 커스텀 로직을 추가할 수 있는 `JobExecutionListener`를 소개합니다.  
- 스프링 배치의 모든 잡은 명확한 생명주기를 가집니다.  
- 스프링 배치는 생명주기의 다양한 시점에 로직을 삽입할 수 있는 기능을 제공합니다.  
- `JobExecutionListener`는 배치 작업(Job)의 실행 전과 후에 커스텀 로직을 수행할 수 있도록 해주는 인터페이스입니다.  
- 이를 활용하면 작업 시작 전 초기화, 작업 완료 후 정리 등 필요한 처리를 쉽게 구현할 수 있습니다.

## 2. 활용 사례

### 2.1 주요 용도

- **알림**: Job이 시작되거나 완료될 때 알림을 보내는 로직을 추가할 수 있습니다.
- **초기화**: Job 실행 전에 필요한 리소스를 초기화하는 작업을 수행할 수 있습니다.
- **정리**: Job 실행 후에 사용한 리소스를 정리하거나 후처리를 수행할 수 있습니다.
- **에러 처리**: Job 실패 시 특별한 처리 로직을 수행할 수 있습니다.

## 3. JobExecutionListener 인터페이스

### 3.1 기본 구조

#### 인터페이스 정의

```java
package org.springframework.batch.core;  
  
public interface JobExecutionListener {  
    default void beforeJob(JobExecution jobExecution) {  
    }  
  
    default void afterJob(JobExecution jobExecution) {  
    }  
}
```

- JobExecutionListener는 두 개의 기본 메서드를 제공하는 함수형 인터페이스입니다.

### 3.2 메서드 설명

- **beforeJob 메서드**
	- 잡을 실행하기 전에 `beforeJob` 메서드가 자동으로 호출됩니다.
	- Job 시작 전 초기화 작업에 활용됩니다.
- **afterJob 메서드**
	- 잡의 처리가 완료되면 `afterJob` 메서드가 자동으로 호출됩니다.
	- 잡의 완료 상태에 관계없이 호출됩니다.
	- 따라서 잡의 종료 상태에 따라 어떤 일을 수행할지 결정할 수 있습니다.

## 4. JobExecutionListener 구현

### 4.1 기본 구현 예제

#### 인터페이스 구현 방식

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
        log.info("Job 시작 전 실행: {}", jobExecution.getJobInstance().getJobName());
        log.info("Job Parameters: {}", jobExecution.getJobParameters());
        
        // 초기화 작업 수행
        initializeResources();
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        log.info("Job 완료 후 실행: {}", jobExecution.getJobInstance().getJobName());
        log.info("Job 상태: {}", jobExecution.getStatus());
        
        if (jobExecution.getStartTime() != null && jobExecution.getEndTime() != null) {
            long duration = jobExecution.getEndTime().getTime() - jobExecution.getStartTime().getTime();
            log.info("실행 시간: {}ms", duration);
        }
        
        // Job 상태에 따른 분기 처리
        if (jobExecution.getStatus().isUnsuccessful()) {
            handleJobFailure(jobExecution);
        } else {
            handleJobSuccess(jobExecution);
        }
        
        // 정리 작업 수행
        cleanupResources();
    }
    
    private void initializeResources() {
        log.info("리소스 초기화 작업 수행");
        // 데이터베이스 연결, 파일 시스템 준비 등
    }
    
    private void handleJobSuccess(JobExecution jobExecution) {
        log.info("Job 성공 처리 로직 실행");
        // 성공 알림, 후속 작업 트리거 등
    }
    
    private void handleJobFailure(JobExecution jobExecution) {
        log.error("Job 실패 처리 로직 실행");
        log.error("실패 이유: {}", jobExecution.getAllFailureExceptions());
        // 실패 알림, 에러 리포팅 등
    }
    
    private void cleanupResources() {
        log.info("리소스 정리 작업 수행");
        // 임시 파일 삭제, 연결 해제 등
    }
}
```

- 위의 예제에서는 `CustomJobExecutionListener`가 `JobExecutionListener` 인터페이스를 구현합니다.
- `beforeJob`과 `afterJob` 메서드를 오버라이드하여 Job의 실행 전후에 로그를 출력하고 상태에 따른 분기 처리를 수행합니다.

### 4.2 어노테이션 기반 구현

- 스프링 배치에서는 어노테이션을 사용하여 JobExecutionListener를 구현할 수도 있습니다.

#### @BeforeJob과 @AfterJob 사용

```java
import org.springframework.batch.core.annotation.BeforeJob;
import org.springframework.batch.core.annotation.AfterJob;
import org.springframework.batch.core.JobExecution;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class AnnotationBasedJobListener {

    @BeforeJob
    public void handleJobStart(JobExecution jobExecution) {
        log.info("Job 시작: {}", jobExecution.getJobInstance().getJobName());
        log.info("시작 시간: {}", jobExecution.getStartTime());
    }

    @AfterJob
    public void handleJobCompletion(JobExecution jobExecution) {
        log.info("Job 완료: {}", jobExecution.getJobInstance().getJobName());
        log.info("완료 상태: {}", jobExecution.getStatus());
        log.info("종료 시간: {}", jobExecution.getEndTime());
    }
}
```

- 어노테이션 방식을 사용할 경우, 메서드명은 자유롭게 지정할 수 있으며 `@BeforeJob`과 `@AfterJob` 어노테이션으로 시점을 지정합니다.

## 5. JobExecutionListener 등록

```java
@Configuration
@EnableBatchProcessing
public class BatchConfiguration {

    @Bean
    public Job sampleJob(JobRepository jobRepository, 
                        Step sampleStep,
                        JobExecutionListener jobExecutionListener) {
        return new JobBuilder("sampleJob", jobRepository)
                .start(sampleStep)
                .listener(jobExecutionListener) // Listener 등록
                .build();
    }

```

- `JobBuilder`를 사용하여 Job을 생성할 때 `listener()` 메서드를 호출하여 `JobExecutionListener`를 등록합니다.

### 5.2 다중 Listener 등록

```java
@Bean
public Job multiListenerJob(JobRepository jobRepository,
                           Step step,
                           JobExecutionListener listener1,
                           JobExecutionListener listener2,
                           JobExecutionListener listener3) {
    return new JobBuilder("multiListenerJob", jobRepository)
            .start(step)
            .listener(listener1)
            .listener(listener2)
            .listener(listener3)
            .build();
}
```

- 여러 개의 Listener를 등록할 수 있으며, 등록된 순서대로 실행됩니다.

## 6. 주의사항 및 모범 사례

### 6.1 예외 처리

#### 안전한 Listener 구현

```java
@Slf4j
@Component
public class SafeJobExecutionListener implements JobExecutionListener {

    @Override
    public void beforeJob(JobExecution jobExecution) {
        try {
            // 초기화 로직
            performInitialization(jobExecution);
        } catch (Exception e) {
            log.error("Job 초기화 중 오류 발생", e);
            // Job 실행을 중단하고 싶다면 RuntimeException을 던질 수 있음
            // throw new RuntimeException("초기화 실패", e);
        }
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        try {
            // 정리 로직
            performCleanup(jobExecution);
        } catch (Exception e) {
            log.error("Job 정리 작업 중 오류 발생", e);
            // afterJob에서는 예외를 던져도 Job 상태에 영향 없음
        }
    }
    
    private void performInitialization(JobExecution jobExecution) {
        // 초기화 로직 구현
    }
    
    private void performCleanup(JobExecution jobExecution) {
        // 정리 로직 구현
    }
}
```

- Listener에서 발생할 수 있는 예외를 적절히 처리하여 Job 실행에 영향을 주지 않도록 구현합니다.