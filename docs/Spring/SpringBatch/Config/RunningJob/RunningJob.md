---
title: "Spring Batch Job 실행 방법"
description: "Spring Batch에서 Job을 실행하는 다양한 방법을 알아봅니다. 커맨드라인과 웹 컨테이너 환경에서의 Job 실행, Exit Code 처리, 그리고 실제 프로젝트에서 활용할 수 있는 실전 팁까지 상세히 다룹니다."
tags: [ "SPRING_BATCH", "SPRING", "BACKEND", "JAVA", "JOB_SCHEDULER", "ENTERPRISE" ]
keywords: [ "스프링배치", "Spring Batch", "배치작업", "Job 실행", "JobLauncher", "CommandLineJobRunner", "배치처리", "스케줄러", "웹컨테이너", "비동기처리", "Exit Code", "엔터프라이즈" ]
draft: false
hide_title: true
---

## 1. Spring Batch Job 실행 개요

- 이번 글에서는 Spring Batch에서 Job을 실행하는 방법에 대해 알아봅니다.
- Spring Batch에서 배치 작업을 실행하기 위해서는 최소한 두 가지 요소가 필요합니다.
	- 실행할 Job
	- Job을 시작하는 JobLauncher
- 이 두 요소는 같은 컨텍스트 내에 있을 수도 있고, 서로 다른 컨텍스트에 있을 수도 있습니다.
  - 커맨드라인에서 실행하면 각 Job마다 독립된 JVM과 JobLauncher가 생성되지만, 웹 애플리케이션에서는 하나의 JobLauncher를 여러 요청이 공유하게 됩니다.
  - 웹 컨테이너 환경에서는 일반적으로 하나의 JobLauncher가 여러 요청에서 공유되어 사용됩니다. 이때는 비동기 Job 실행을 위해 구성되는 것이 일반적입니다.

## 2. 커맨드라인에서 Job 실행하기

### 2.1 엔터프라이즈 스케줄러와의 연동

- 실제 운영 환경에서는 대부분 엔터프라이즈 스케줄러(cron, Autosys, Control-M 등)를 통해 배치 작업을 관리합니다. 
- 이런 스케줄러들은 Quartz와 달리 Java 애플리케이션과 직접 통신하지 않고, 운영체제 프로세스 레벨에서 작업을 수행합니다.
- 따라서 스케줄러가 배치 작업을 실행하려면 다음과 같은 방법들을 사용해야 합니다.
  - 셸 스크립트 (가장 일반적)
  - Perl, Ruby 등의 스크립트 언어
  - Ant, Maven 같은 빌드 도구

### 2.2 CommandLineJobRunner 사용법

- Spring Batch는 커맨드라인 실행을 위한 `CommandLineJobRunner` 클래스를 제공합니다. 
- 이 클래스는 main 메서드를 가진 진입점 역할을 하며, 다음 네 가지 작업을 수행합니다.
  - ApplicationContext를 로드하여 Spring 컨테이너 구성
  - 전달받은 커맨드라인 인수를 JobParameters 객체로 변환
  - 지정된 Job 이름으로 실행할 Job을 찾아서 위치 확인
	- Spring 컨테이너에서 JobLauncher를 가져와서 Job 실행
- 이 모든 과정이 커맨드라인에서 전달받은 인수만으로 처리되기 때문에, 별도의 복잡한 설정 없이도 배치 작업을 실행할 수 있습니다.

#### 2.2.1 필수 인수

| 인수      | 설명                                                            |
|---------|---------------------------------------------------------------|
| jobPath | ApplicationContext 생성에 사용되는 XML 파일의 위치 또는 Java 설정 클래스의 완전한 이름 |
| jobName | 실행할 Job의 이름                                                   |

- CommandLineJobRunner를 사용할 때 반드시 전달해야 하는 인수는 두 개입니다.
- 이 두 인수는 순서가 중요합니다. 첫 번째가 jobPath, 두 번째가 jobName이어야 하며, 그 뒤의 모든 인수들은 JobParameters로 인식됩니다.

#### 2.2.2 실행 예시

```bash
# Java 설정 클래스를 사용한 실행
java CommandLineJobRunner io.spring.EndOfDayJobConfiguration endOfDay schedule.date=2007-05-05,java.time.LocalDate

# identifying 파라미터와 non-identifying 파라미터 구분
java CommandLineJobRunner io.spring.EndOfDayJobConfiguration endOfDay \
                         schedule.date=2007-05-05,java.time.LocalDate,true \
                         vendor.id=123,java.lang.Long,false
```

- JobParameters에서 identifying 여부를 명시적으로 지정할 수 있습니다. 
- 파라미터 끝에 `true` 또는 `false`를 추가하여 해당 파라미터가 Job 인스턴스를 식별하는 데 사용되는지 여부를 결정할 수 있습니다.

:::tip[파라미터 구분의 중요성]
Spring Batch에서는 JobParameters를 identifying과 non-identifying으로 구분합니다. 
Identifying 파라미터는 Job 인스턴스를 구별하는 데 사용되므로, 같은 값으로는 중복 실행이 불가능합니다. 
반면 non-identifying 파라미터는 실행 로직에만 영향을 주고 중복 실행을 허용합니다.
예를 들어, 매일 실행되는 배치에서 날짜는 identifying으로, 처리 모드 같은 옵션은 non-identifying으로 설정하는 것이 일반적입니다.
:::

#### 2.2.3 Java 설정 예시

```java
@Configuration
@EnableBatchProcessing
public class EndOfDayJobConfiguration {

    @Bean
    public Job endOfDay(JobRepository jobRepository, Step step1) {
        return new JobBuilder("endOfDay", jobRepository)
                    .start(step1)
                    .build();
    }

    @Bean
    public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        return new StepBuilder("step1", jobRepository)
                    .tasklet((contribution, chunkContext) -> null, transactionManager)
                    .build();
    }
}
```

### 2.3 Spring Boot에서 커맨드라인 실행

- Spring Boot 애플리케이션을 커맨드라인에서 실행할 때는 별도의 CommandLineJobRunner 없이도 배치 Job을 실행할 수 있습니다.
- Spring Boot는 `--`로 시작하는 커맨드라인 인수를 Environment 프로퍼티로 변환합니다.
- 하지만 배치 Job에 파라미터를 전달할 때는 `--` 없이 일반 형식을 사용해야 합니다.

#### 2.3.1 Spring Boot 실행 예시

```bash
# 정확한 방법: -- 없이 파라미터 전달
java -jar myapp.jar someParameter=someValue anotherParameter=anotherValue

# 혼용 예시: 서버 설정과 배치 파라미터를 함께 전달
java -jar myapp.jar --server.port=7070 someParameter=someValue
```
- 위의 혼용 예시에서 `--server.port=7070`은 Environment 프로퍼티가 되고, `someParameter=someValue`만 배치 Job에 전달됩니다.
- Spring Boot에서 배치 Job에 파라미터를 전달할 때는 반드시 `--` 없는 형식을 사용해야 합니다.
  - Environment 프로퍼티(`--`로 시작)는 배치 Job에서 무시됩니다.

## 3. Exit Code 처리

### 3.1 Exit Code의 중요성

- 실제 운영 환경에서 배치 작업을 관리하다 보면, 스케줄러가 작업의 성공/실패 여부를 어떻게 알 수 있는지가 중요한 문제가 됩니다. 
- 대부분의 엔터프라이즈 스케줄러는 Java 애플리케이션 내부의 상태를 직접 확인할 수 없고, 오직 프로세스가 반환하는 숫자(Exit Code)로만 결과를 판단합니다.
- 일반적인 Exit Code 규칙은 다음과 같습니다.
  - 0: 성공적으로 완료
  - 1: 일반적인 오류 발생
	- 기타 숫자: 특별한 시나리오 처리

### 3.2 ExitCodeMapper 인터페이스

```java
public interface ExitCodeMapper {
    public int intValue(String exitCode);
}
```

- Spring Batch는 Job의 실행 결과를 Exit Code로 변환하기 위해 ExitCodeMapper 인터페이스를 제공합니다.
- 이 인터페이스의 역할은 간단합니다. Spring Batch 내부에서 생성되는 문자열 형태의 exit code를 스케줄러가 이해할 수 있는 숫자로 변환하는 것입니다.

#### 3.2.1 기본 구현체: SimpleJvmExitCodeMapper

- 별도의 설정 없이 사용할 수 있는 기본 구현체의 동작 방식입니다.
  - 0: Job이 정상적으로 완료된 경우
  - 1: Job 실행 중 일반적인 오류가 발생한 경우
  - 2: CommandLineJobRunner 자체의 문제 (Job을 찾을 수 없는 경우 등)
- 이 정도면 대부분의 기본적인 배치 관리 시나리오를 커버할 수 있습니다.
- 더 복잡한 워크플로우가 필요한 경우, 자신만의 ExitCodeMapper를 구현할 수 있습니다. 
  - 예를 들어, 데이터 처리량에 따라 다른 Exit Code를 반환하거나, 특정 비즈니스 조건에 따라 후속 작업을 분기하고 싶을 때 유용합니다.
  - 커스텀 구현체는 Spring ApplicationContext에서 루트 레벨 빈으로 등록하면 CommandLineJobRunner가 자동으로 감지하여 사용합니다.

## 4. 웹 컨테이너에서 Job 실행하기

### 4.1 웹 환경에서의 배치 실행 필요성

- 전통적으로는 배치 작업을 커맨드라인에서 실행하는 것이 일반적이었지만, 현대의 웹 애플리케이션 환경에서는 HTTP 요청을 통해 배치를 실행해야 하는 경우가 점점 늘어나고 있습니다.
- 다음과 같은 상황에서 웹 기반 실행이 유용합니다.
  - 리포팅 작업: 사용자가 요청한 시점에 즉시 보고서 생성
  - 임시(ad-hoc) 작업: 정기적이지 않은 일회성 데이터 처리
  - 관리자 기능: 웹 관리 페이지에서 배치 작업 수동 실행
	- API 기반 통합: 다른 시스템에서 REST API를 통한 배치 작업 트리거

### 4.2 비동기 실행의 중요성

- 웹 환경에서 배치 작업을 실행할 때 가장 중요한 원칙은 절대로 동기적으로 실행하면 안 된다는 것입니다. 
- 배치 작업은 본질적으로 오래 걸리는 작업이기 때문에, HTTP 요청을 블로킹하면 다음과 같은 심각한 문제가 발생합니다.
  - 웹 서버의 스레드 풀 고갈
  - 사용자 브라우저의 타임아웃
  - 전체 웹 애플리케이션 성능 저하
- 따라서 반드시 비동기 JobLauncher를 사용해서 Job을 백그라운드에서 실행하고, HTTP 응답은 즉시 반환해야 합니다.

### 4.3 Spring MVC Controller 예시

```java
@Controller
public class JobLauncherController {

    @Autowired
    JobLauncher jobLauncher;

    @Autowired
    Job job;

    @RequestMapping("/jobLauncher.html")
    public void handle() throws Exception{
        jobLauncher.run(job, new JobParameters());
    }
}
```

#### 4.3.1 비동기 실행의 장점

- 즉시 응답: HTTP 요청은 배치 완료를 기다리지 않고 바로 응답
- 작업 추적: 반환된 JobExecution ID로 작업 상태를 별도로 조회 가능
- 리소스 보호: 웹 서버의 스레드가 배치 작업에 묶이지 않음
- 사용자 경험: 웹 페이지가 멈추지 않고 정상적으로 동작

:::danger
동기적으로 Job을 실행하면 Job이 완료될 때까지 HTTP 요청이 블로킹되어 웹 애플리케이션의 성능에 심각한 영향을 줄 수 있습니다. 반드시 비동기 JobLauncher를 사용하세요.
:::

## 5. Spring Boot와 통합

### 5.1 자동 구성 활성화

- Spring Boot에서 Spring Batch 자동 구성을 활성화하려면 spring-boot-starter-batch를 클래스패스에 추가하기만 하면 됩니다.
- 이렇게 하면 Spring Boot가 필요한 모든 Batch 컴포넌트를 자동으로 구성해줍니다.

```groovy
implementation 'org.springframework.boot:spring-boot-starter-batch'
```

### 5.2 애플리케이션 시작 시 Job 자동 실행

- [레퍼런스](https://docs.spring.io/spring-boot/how-to/batch.html#howto.batch.running-jobs-on-startup)
- Spring Boot에서는 애플리케이션 시작 시점에 자동으로 Job을 실행할 수 있는 기능을 제공합니다.
  - Spring Boot는 JobLauncherApplicationRunner를 통해 애플리케이션 시작 시 Job을 자동 실행합니다.
  - 이 컴포넌트는 BatchAutoConfiguration에 의해 자동으로 구성됩니다.
- 애플리케이션 컨텍스트에서 단일 Job 빈이 발견되면, 시작 시점에 자동으로 실행됩니다.
- 여러 개의 Job 빈이 있는 경우, `spring.batch.job.name` 프로퍼티로 실행할 Job을 지정해야 합니다.
- Job 자동 실행을 비활성화하려면 `spring.batch.job.enabled=false`로 설정합니다.

### 5.3 Batch 전용 DataSource 설정

- 기본적으로 Spring Batch는 Job 세부 정보를 저장하기 위해 DataSource가 필요합니다.
- Spring Batch는 기본적으로 하나의 DataSource를 기대합니다.
  - 하나의 DataSource가 있다면 그것을 배치와 애플리케이션 데이터 모두에 사용합니다.
- 애플리케이션 데이터와 배치 데이터를 분리하고 싶다면, 별도의 DataSource를 설정할 수 있습니다.
  - 별도의 Batch 전용 DataSource를 사용하려면 @BatchDataSource 어노테이션을 사용합니다.

#### 설정 예시

```java
@Configuration
public class DualDataSourceConfig {
    
    /**
     * 메인 애플리케이션 데이터 소스
     * 기본 후보에서 제외하여 배치에서 자동 선택되지 않도록 함
     */
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.main")
    public DataSource mainDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    /**
     * 배치 전용 데이터 소스
     * 기본 후보에서 제외하고 명시적으로 배치용으로 지정
     */
    @Bean(defaultCandidate = false)
    @BatchDataSource
    @ConfigurationProperties("spring.datasource.batch")
    public DataSource batchDataSource() {
        return DataSourceBuilder.create().build();
    }
}
```

- 위 예시에서는 두 개의 DataSource를 설정합니다.
  - `mainDataSource`: 애플리케이션 데이터용
  - `batchDataSource`: 배치 전용 데이터 소스
- defaultCandidate는 Spring의 @Bean 어노테이션 속성으로, 해당 빈이 자동 주입(Auto-wiring)의 기본 후보가 될지를 결정하는 설정입니다.
- defaultCandidate는 true가 기본값이며, false로 설정하면 해당 빈은 자동 주입의 기본 후보에서 제외됩니다.
- batchDataSource 빈을 defaultCandidate=false로 설정하여, 명시적으로 지정해야만 주입되도록 합니다.
- 이를 통해 애플리케이션의 일반적인 컴포넌트들은 메인 DataSource를 사용하고, Spring Batch는 전용 DataSource를 사용하도록 깔끔하게 분리할 수 있습니다.

## 5. 실전 적용 팁

### 5.1 환경별 실행 방식 선택

- 개발/테스트: IDE에서 직접 실행 또는 커맨드라인
- 운영 환경: 엔터프라이즈 스케줄러와 커맨드라인 조합
- 웹 기반 관리: 웹 컨테이너에서 비동기 실행

### 5.2 JobParameters 활용

- JobParameters를 통해 실행 시점에 동적으로 값을 전달할 수 있습니다.
  - 날짜 범위 지정
  - 파일 경로 설정
  - 처리 모드 선택

### 5.3 모니터링 고려사항

- Exit Code를 통한 실행 결과 확인
- JobExecution을 통한 상세 실행 정보 추적
- 웹 환경에서는 별도의 모니터링 페이지 구성 고려

## 참고

- https://docs.spring.io/spring-boot/how-to/batch.html#howto.batch.running-jobs-on-startup