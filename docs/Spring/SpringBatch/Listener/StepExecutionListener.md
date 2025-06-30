---
title: "StepExecutionListener"
description: "스프링 배치의 StepExecutionListener를 활용하여 Step 실행 전후에 커스텀 로직을 추가하는 방법을 설명합니다. 인터페이스 구현부터 애노테이션 기반 리스너까지 다양한 구현 방법과 실제 적용 사례를 다룹니다."
tags: ["SPRING_BATCH", "LISTENER", "STEP", "SPRING", "BACKEND", "JAVA"]
keywords: ["스프링배치", "Spring Batch", "StepExecutionListener", "스텝실행리스너", "배치", "batch", "리스너", "listener", "스텝", "step", "생명주기", "lifecycle", "스프링", "spring", "자바", "java", "백엔드", "backend"]
draft: false
hide_title: true
---

## 1. StepExecutionListener란

- 스프링 배치에서 모든 Step은 생명주기를 갖습니다.
- `StepExecutionListener`는 Step의 실행 전후에 커스텀 로직을 수행할 수 있도록 하는 인터페이스입니다.
- 이를 통해 작업 시작 전 초기화 작업이나 작업 완료 후 정리 작업을 수행할 수 있습니다.
- 스프링 배치는 생명주기의 여러 시점에 로직을 추가할 수 있는 기능을 제공하며, StepExecutionListener는 그 중 하나입니다.

## 2. 주요 활용 사례

### 2.1 일반적인 사용 목적

- **로깅**: Step의 시작과 종료를 로그로 기록하여 배치 작업의 진행 상황을 추적합니다.
- **알림**: Step이 시작되거나 완료될 때 관리자에게 알림을 보내는 로직을 추가할 수 있습니다.
- **초기화**: Step 실행 전에 필요한 리소스나 설정을 초기화하는 작업을 수행합니다.
- **정리**: Step 실행 후에 사용한 리소스를 정리하거나 후처리를 수행합니다.
- **성능 모니터링**: Step의 실행 시간을 측정하고 성능 지표를 수집합니다.

### 2.2 실무 적용 예시

- **임시 파일 관리**: Step에서 사용할 임시 파일을 생성하고, 완료 후 삭제합니다.
- **외부 시스템 연동**: Step 실행 전후에 외부 시스템에 상태를 알리는 API 호출을 수행합니다.

## 3. StepExecutionListener 인터페이스

### 3.1 인터페이스 구조

```java
package org.springframework.batch.core;

public interface StepExecutionListener {
    default void beforeStep(StepExecution stepExecution) {
    }

    default ExitStatus afterStep(StepExecution stepExecution) {
        return stepExecution.getExitStatus();
    }
}
```

### 3.2 메서드 설명

- **beforeStep(StepExecution stepExecution)**
	- Step을 실행하기 전에 자동으로 호출됩니다.
	- StepExecution 객체를 통해 Step의 메타데이터에 접근할 수 있습니다.
	- 초기화 로직이나 준비 작업을 수행하는 데 사용됩니다.
- **afterStep(StepExecution stepExecution)**
	- Step의 처리가 완료되면 자동으로 호출됩니다.
	- Step의 성공, 실패에 관계없이 항상 호출됩니다.
	- `ExitStatus`를 반환하여 Step의 종료 상태를 조작할 수 있습니다.
	- 정리 작업이나 후처리 로직을 수행하는 데 사용됩니다.

:::info[ExitStatus 반환의 중요성]
`afterStep` 메서드가 `ExitStatus`를 반환하는 것은 다른 Listener 메서드와의 중요한 차이점입니다. 이를 통해 Step의 종료 상태를 동적으로 변경할 수 있어, 비즈니스 로직에 따른 흐름 제어가 가능합니다.
:::

## 4. 인터페이스 구현 방식

### 4.1 기본 구현 예제

```java
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CustomStepExecutionListener implements StepExecutionListener {

    @Override
    public void beforeStep(StepExecution stepExecution) {
        log.info("=== Step 시작 ===");
        log.info("Step 이름: {}", stepExecution.getStepName());
        log.info("Job 이름: {}", stepExecution.getJobExecution().getJobInstance().getJobName());
        log.info("시작 시간: {}", stepExecution.getStartTime());
        
        // 초기화 작업 수행
        initializeResources();
    }

    @Override
    public ExitStatus afterStep(StepExecution stepExecution) {
        log.info("=== Step 완료 ===");
        log.info("Step 이름: {}", stepExecution.getStepName());
        log.info("종료 상태: {}", stepExecution.getExitStatus());
        log.info("읽은 항목 수: {}", stepExecution.getReadCount());
        log.info("쓴 항목 수: {}", stepExecution.getWriteCount());
        log.info("건너뛴 항목 수: {}", stepExecution.getSkipCount());
        
        // 정리 작업 수행
        cleanupResources();
        
        // 조건에 따른 ExitStatus 변경 예제
        if (stepExecution.getSkipCount() > 100) {
            log.warn("건너뛴 항목이 너무 많습니다. 상태를 WARNING으로 변경합니다.");
            return new ExitStatus("WARNING", "Too many skipped items");
        }
        
        return stepExecution.getExitStatus();
    }
    
    private void initializeResources() {
        log.info("리소스 초기화 중...");
        // 실제 초기화 로직
    }
    
    private void cleanupResources() {
        log.info("리소스 정리 중...");
        // 실제 정리 로직
    }
}
```

## 5. 애노테이션 기반 리스너

### 5.1 @BeforeStep과 @AfterStep 애노테이션

- 스프링 배치는 인터페이스 구현 외에도 애노테이션을 사용한 간편한 리스너 생성 방법을 제공합니다.
- `@BeforeStep`과 `@AfterStep` 애노테이션을 사용하여 Step의 생명주기 이벤트에 대응하는 메서드를 정의할 수 있습니다.

```java
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.core.annotation.AfterStep;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AnnotationBasedStepListener {

    @BeforeStep
    public void beforeStepExecution(StepExecution stepExecution) {
        log.info("애노테이션 기반 - Step 시작: {}", stepExecution.getStepName());
        // 초기화 로직
    }

    @AfterStep
    public ExitStatus afterStepExecution(StepExecution stepExecution) {
        log.info("애노테이션 기반 - Step 완료: {}", stepExecution.getStepName());
        log.info("처리된 항목 수: {}", stepExecution.getWriteCount());
        
        // 정리 로직
        return stepExecution.getExitStatus();
    }
}
```

### 5.2 애노테이션 방식의 장점

- **간결성**: 인터페이스를 구현할 필요 없이 필요한 메서드에만 애노테이션을 적용할 수 있습니다.
- **선택적 구현**: `@BeforeStep`이나 `@AfterStep` 중 필요한 것만 구현할 수 있습니다.
- **가독성**: 애노테이션을 통해 메서드의 역할이 명확하게 드러납니다.

## 6. StepExecutionListener 등록 방법

### 6.1 Step 빌더를 통한 등록

```java
@Configuration
public class BatchConfiguration {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final StepExecutionListener stepExecutionListener;

    public BatchConfiguration(JobRepository jobRepository,
                              PlatformTransactionManager transactionManager,
                              StepExecutionListener stepExecutionListener) {
        this.jobRepository = jobRepository;
        this.transactionManager = transactionManager;
        this.stepExecutionListener = stepExecutionListener;
    }

    @Bean
    public Job sampleJob() {
        return new JobBuilder("sampleJob", jobRepository)
                .start(sampleStep())
                .build();
    }

    @Bean
    public Step sampleStep() {
        return new StepBuilder("sampleStep", jobRepository)
                .<String, String>chunk(10, transactionManager)
                .reader(itemReader())
                .processor(itemProcessor())
                .writer(itemWriter())
                .listener(stepExecutionLi            .writer(itemWriter())
                .listener(stepExecutionListener) // 리스너 등록
                .build();
    }

    // reader, processor, writer 빈 정의...
}
```

### 6.2 여러 리스너 등록

```java
@Bean
public Step multiListenerStep() {
    return new StepBuilder("multiListenerStep", jobRepository)
            .<String, String>chunk(100, transactionManager)
            .reader(itemReader())
            .processor(itemProcessor())
            .writer(itemWriter())
            .listener(performanceListener)      // 성능 모니터링 리스너
            .listener(notificationListener)     // 알림 리스너
            .listener(loggingListener)         // 로깅 리스너
            .build();
}
```

### 6.3 애노테이션 기반 리스너 등록

```java
@Bean
public Step annotationListenerStep() {
    return new StepBuilder("annotationListenerStep", jobRepository)
            .<String, String>chunk(50, transactionManager)
            .reader(itemReader())
            .processor(itemProcessor())
            .writer(itemWriter())
            .listener(annotationBasedStepListener) // 애노테이션 기반 리스너
            .build();
}
```

## 7. 실무 활용 팁

### 7.1 리스너 실행 순서

- 여러 개의 리스너가 등록된 경우, 등록된 순서대로 실행됩니다.
- `beforeStep`은 등록 순서대로, `afterStep`은 역순으로 실행됩니다.

### 7.2 예외 처리

```java
@BeforeStep
public void beforeStepWithExceptionHandling(StepExecution stepExecution) {
    try {
        // 위험할 수 있는 초기화 작업
        initializeExternalSystem();
    } catch (Exception e) {
        log.error("Step 초기화 중 오류 발생", e);
        // 예외를 다시 던지면 Step 실행이 중단됩니다
        throw new RuntimeException("Step 초기화 실패", e);
    }
}

@AfterStep
public ExitStatus afterStepWithExceptionHandling(StepExecution stepExecution) {
    try {
        cleanupResources();
        return stepExecution.getExitStatus();
    } catch (Exception e) {
        log.error("Step 정리 중 오류 발생", e);
        // 정리 작업 실패는 Step의 성공 여부에 영향을 주지 않도록 할 수 있습니다
        return stepExecution.getExitStatus();
    }
}
```

## 8. 마치며

- `StepExecutionListener`는 스프링 배치에서 Step의 생명주기를 활용한 강력한 확장 포인트입니다.
- 인터페이스 구현 방식과 애노테이션 기반 방식 모두 지원하므로, 상황에 맞는 방법을 선택할 수 있습니다.
- 로깅, 모니터링, 알림, 리소스 관리 등 다양한 용도로 활용할 수 있어 배치 애플리케이션의 품질을 높이는 데 도움이 됩니다.