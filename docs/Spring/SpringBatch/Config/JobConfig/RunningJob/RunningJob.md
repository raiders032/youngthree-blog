---
title: "Spring Batch Job 실행"
description: "Spring Batch에서 Job을 실행하는 다양한 방법을 알아봅니다. 커맨드라인 실행부터 웹 컨테이너에서의 비동기 실행까지, CommandLineJobRunner 사용법과 실제 구현 예제를 통해 배치 Job 실행의 모든 것을 설명합니다."
tags: [ "SPRING_BATCH", "SPRING", "BACKEND", "JAVA", "JOB_SCHEDULER", "BATCH_PROCESSING" ]
keywords: [ "스프링배치", "Spring Batch", "배치처리", "batch processing", "Job실행", "Job execution", "CommandLineJobRunner", "JobLauncher", "배치Job", "batch job", "스프링", "Spring", "백엔드", "backend", "자바", "Java", "스케줄러", "scheduler", "비동기실행", "asynchronous execution" ]
draft: false
hide_title: true
---

## 1. Spring Batch Job 실행 개요

- Spring Batch에서 배치 Job을 실행하기 위해서는 최소한 두 가지 구성 요소가 필요합니다.
	- **Job**: 실행할 배치 작업
	- **JobLauncher**: Job을 실행하는 런처
- 이 두 구성 요소는 같은 컨텍스트에 있을 수도 있고, 서로 다른 컨텍스트에 위치할 수도 있습니다.
- 예를 들어, 커맨드라인에서 Job을 실행하면 각 Job마다 새로운 JVM이 생성되어 고유한 JobLauncher를 가지게 됩니다.
- 반면 웹 컨테이너 내에서 실행하는 경우에는 일반적으로 하나의 JobLauncher가 여러 요청을 처리하게 됩니다.

:::info
Spring Batch는 다양한 실행 환경에서 유연하게 동작할 수 있도록 설계되었으며, 각 환경에 맞는 최적의 실행 방식을 제공합니다.
:::

## 2. 커맨드라인에서 Job 실행하기

### 2.1 엔터프라이즈 스케줄러와의 연동

- 엔터프라이즈 스케줄러에서 배치 Job을 실행할 때 주로 커맨드라인에서 실행합니다.
- Spring Batch는 이를 위해 CommandLineJobRunner를 제공합니다.

### 2.2 CommandLineJobRunner 사용법

- Spring Batch는 커맨드라인에서 Job을 실행할 수 있는 `CommandLineJobRunner` 클래스를 제공합니다.
- 이 클래스는 main 메소드를 가진 진입점 역할을 하며, 다음 네 가지 작업을 수행합니다.
	- 적절한 ApplicationContext 로드
	- 커맨드라인 인자를 JobParameters로 파싱
	- 인자를 기반으로 적절한 Job 찾기
	- 애플리케이션 컨텍스트에서 제공된 JobLauncher를 사용하여 Job 실행

#### 2.2.1 필수 인자

- CommandLineJobRunner는 다음과 같은 필수 인자를 요구합니다.
	- jobPath: ApplicationContext를 생성하는 데 사용되는 XML 파일의 위치 또는 Java Configuration 클래스의 완전한 클래스명
	- jobName: 실행할 Job의 이름
- 추가 인자들은 name=value 형태의 JobParameters가 됩니다

#### 2.2.2 실행 예시

- 다음은 Java Configuration을 사용한 Job 실행 예시입니다.
- 명령을 실행하기 전에 Java Configuration 설정을 해야합니다.

```bash
java CommandLineJobRunner io.spring.EndOfDayJobConfiguration endOfDay schedule.date=2007-05-05,java.time.LocalDate
```

- 위 명령은 `io.spring.EndOfDayJobConfiguration`을 jobPath로 사용하고, `endOfDay`라는 이름의 Job을 실행합니다.
- 추가 인자인 `schedule.date=2007-05-05,java.time.LocalDate`는 JobParameters로 전달됩니다.
	- 형식은 `name=value,java.type`입니다.

```bash
java CommandLineJobRunner io.spring.EndOfDayJobConfiguration endOfDay \
                         schedule.date=2007-05-05,java.time.LocalDate,true \
                         vendor.id=123,java.lang.Long,false
```

- 위 명령은 `schedule.date`와 `vendor.id`라는 두 개의 JobParameters를 전달합니다.
- 기본적으로 CommandLineJobRunner는 DefaultJobParametersConverter를 사용하여 키/값 쌍을 식별 Job 파라미터로 암시적으로 변환합니다.
- 만약 식별성을 명시적으로 지정하고 싶다면 suffix를 사용하여 지정할 수 있습니다.
	- 위 예시에서 `schedule.date`는 `true`로, `vendor.id`는 `false`로 식별성을 지정했습니다.
- 사용자 정의 변환이 필요한 경우 JobParametersConverter를 구현하여 사용할 수 있습니다.

## 3. Exit Code 처리

### 3.1 Exit Code의 중요성

- 커맨드라인에서 배치 Job을 실행할 때, 엔터프라이즈 스케줄러는 프로세스 레벨에서만 작동합니다.
- 따라서 Job의 성공이나 실패를 스케줄러에게 알리는 유일한 방법은 반환 코드(return code)입니다.
	- `0`: 성공
	- `1`: 일반적인 실패
	- `기타 숫자`: 복잡한 시나리오 처리 (예: 4 반환 시 Job B 실행, 5 반환 시 Job C 실행)

### 3.2 ExitCodeMapper 인터페이스

- Spring Batch는 ExitStatus를 숫자 형태의 exit code로 변환하기 위해 ExitCodeMapper 인터페이스를 제공합니다.

```java
public interface ExitCodeMapper {
    public int intValue(String exitCode);
}
```

#### 3.2.1 기본 구현체

`SimpleJvmExitCodeMapper`가 기본 구현체로 사용되며, 다음과 같은 값을 반환합니다.

- `0`: 완료
- `1`: 일반적인 오류
- `2`: Job runner 오류 (예: 컨텍스트에서 Job을 찾을 수 없는 경우)

:::warning
더 복잡한 exit code 처리가 필요한 경우, ExitCodeMapper 인터페이스의 사용자 정의 구현을 제공해야 합니다. 이 구현체는 ApplicationContext의 root level bean으로
선언되어야 합니다.
:::

## 4. 웹 컨테이너에서 Job 실행하기

### 4.1 웹 환경에서의 배치 처리

- 전통적으로 오프라인 처리는 커맨드라인에서 실행되었지만, HttpRequest에서 실행하는 것이 더 나은 경우들이 있습니다.
	- 리포팅
	- 임시 Job 실행
	- 웹 애플리케이션 지원

### 4.2 비동기 Job 실행

- 웹 환경에서 배치 Job을 실행할 때 가장 중요한 고려사항은 비동기 실행입니다.
- 배치 Job은 본질적으로 오래 실행되는 작업이므로, HttpRequest를 블로킹하지 않아야 합니다.

#### 4.2.1 비동기 Job 실행 흐름

1. 웹 컨트롤러가 비동기로 구성된 JobLauncher를 사용하여 Job 실행
2. JobLauncher가 즉시 JobExecution 반환 (Job은 백그라운드에서 계속 실행)
3. 컨트롤러가 즉시 응답 반환 (HttpRequest 처리 완료)

#### 4.2.2 Spring MVC 컨트롤러 예시

```java
@Controller
public class JobLauncherController {

    @Autowired
    JobLauncher jobLauncher;

    @Autowired
    Job job;

    @RequestMapping("/jobLauncher.html")
    public void handle() throws Exception {
        jobLauncher.run(job, new JobParameters());
    }
}
```

:::danger
웹 환경에서 동기적으로 Job을 실행하면 HttpRequest가 Job이 완료될 때까지 블로킹되어 사용자 경험이 크게 저하됩니다. 반드시 비동기 JobLauncher를 사용해야 합니다.
:::

## 5. JobLauncher 구성

### 5.1 동기 vs 비동기 JobLauncher

- JobLauncher는 동기와 비동기 모드로 구성할 수 있습니다.
  - **동기 모드**: Job이 완료될 때까지 대기 (커맨드라인 환경에 적합)
  - **비동기 모드**: Job을 백그라운드에서 실행하고 즉시 반환 (웹 환경에 적합)

### 5.2 비동기 JobLauncher 구성 예시

```java
@Bean
public JobLauncher asyncJobLauncher(JobRepository jobRepository) {
    TaskExecutorJobLauncher jobLauncher = new TaskExecutorJobLauncher();
    jobLauncher.setJobRepository(jobRepository);
    jobLauncher.setTaskExecutor(new SimpleAsyncTaskExecutor());
    return jobLauncher;
}
```

## 6. 실행 환경별 선택 가이드

### 6.1 커맨드라인 실행을 선택해야 하는 경우

- 엔터프라이즈 스케줄러와 연동이 필요한 경우
- 정해진 시간에 자동으로 실행되어야 하는 경우
- 시스템 리소스를 독점적으로 사용해야 하는 대용량 배치 작업
- 운영 체제 레벨의 모니터링이 필요한 경우

### 6.2 웹 컨테이너 실행을 선택해야 하는 경우

- 사용자의 요청에 따라 즉시 실행되어야 하는 경우
- 웹 UI를 통한 Job 모니터링이 필요한 경우
- 동적인 Job 파라미터 입력이 필요한 경우
- RESTful API를 통한 Job 제어가 필요한 경우

:::tip
대부분의 엔터프라이즈 환경에서는 정기적인 배치 작업은 커맨드라인으로, 사용자 요청 기반의 임시 작업은 웹 환경에서 실행하는 하이브리드 방식을 사용합니다.
:::

## 7. 마치며

- Spring Batch는 다양한 실행 환경에서 배치 Job을 유연하게 실행할 수 있는 풍부한 기능을 제공합니다. 
- CommandLineJobRunner를 통한 전통적인 배치 처리부터 웹 환경에서의 비동기 실행까지, 각 환경의 특성에 맞는 최적의 실행 방법을 선택하여 사용할 수 있습니다.

## 참고

- https://docs.spring.io/spring-batch/reference/job/running.html
- https://docs.spring.io/spring-batch/reference/job/configuring-launcher.html