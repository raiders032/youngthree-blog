---
title: "Spring Batch Configuration"
description: "Spring Boot 3.0에서 변경된 Spring Batch 설정 방법을 알아봅니다. @EnableBatchProcessing 어노테이션의 변화, JobBuilder와 StepBuilder 사용법, 그리고 실제 프로젝트에서 적용할 수 있는 Configuration 작성 방법을 상세히 다룹니다."
tags: ["SPRING_BATCH", "SPRING_BOOT", "SPRING", "BACKEND", "JAVA", "CONFIGURATION", "ENTERPRISE"]
keywords: ["스프링부트3", "Spring Boot 3", "스프링배치", "Spring Batch", "배치설정", "Batch Configuration", "@EnableBatchProcessing", "JobBuilder", "StepBuilder", "JobBuilderFactory", "StepBuilderFactory", "마이그레이션", "업그레이드", "배치처리"]
draft: false
hide_title: true
---

## 1. Spring Boot 3.0과 Spring Batch 개요

- Spring Boot 3.0에서는 Spring Batch 설정 방식에 중요한 변경사항들이 도입되었습니다.
- 기존의 `@EnableBatchProcessing` 어노테이션 사용 방식이 변경되었고, Job과 Step을 생성하는 Builder 클래스들도 새로운 방식으로 교체되었습니다.
- 이러한 변경사항들은 Spring Batch의 사용성을 개선하고, 더 직관적인 API를 제공하기 위한 목적으로 이루어졌습니다.

## 2. 의존성 설정

### 2.1 Gradle 의존성 추가

- Spring Boot 3.0에서 Spring Batch를 사용하기 위해서는 다음과 같이 의존성을 추가합니다.

```groovy
implementation 'org.springframework.boot:spring-boot-starter-batch:3.0.0'
```

### 2.2 Maven 의존성 추가

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-batch</artifactId>
    <version>3.0.0</version>
</dependency>
```

:::info[버전 호환성]
Spring Boot 3.0은 Java 17 이상을 요구하며, Spring Framework 6.0을 기반으로 합니다.
기존 프로젝트를 업그레이드할 때는 이러한 요구사항을 확인해야 합니다.
:::

## 3. Spring Boot 3.0의 주요 변경사항

### 3.1 @EnableBatchProcessing 어노테이션 변경

- Spring Boot 3.0에서는 `@EnableBatchProcessing` 어노테이션의 사용이 권장되지 않습니다.
- 이전 버전에서는 Spring Batch 기능을 활성화하기 위해 반드시 이 어노테이션을 사용해야 했지만, Spring Boot 3.0부터는 자동 구성만으로도 충분합니다.
- `spring-boot-starter-batch` 의존성을 추가하면 Spring Boot가 자동으로 필요한 Batch 컴포넌트들을 구성해줍니다.

#### 3.1.1 기존 방식 (Spring Boot 2.x)

```java
@Configuration
@EnableBatchProcessing  // 더 이상 권장되지 않음
public class BatchConfiguration {
    // 설정 코드
}
```

#### 3.1.2 새로운 방식 (Spring Boot 3.0)

```java
@Configuration
public class BatchConfiguration {
    // @EnableBatchProcessing 제거
    // 자동 구성에 의존
}
```

:::warning[@EnableBatchProcessing 사용 시 주의사항]
Spring Boot 3.0에서 `@EnableBatchProcessing`을 사용하면 자동 구성이 비활성화됩니다.
이는 개발자가 모든 Batch 관련 빈을 직접 구성해야 함을 의미하므로, 특별한 이유가 없다면 사용하지 않는 것이 좋습니다.
:::

### 3.2 Builder 클래스 변경사항

- `JobBuilderFactory`와 `StepBuilderFactory`가 deprecated되었습니다.
- 대신 `JobBuilder`와 `StepBuilder` 클래스를 직접 사용해야 합니다.
- 새로운 Builder 클래스들은 Job 또는 Step의 이름과 JobRepository를 생성자에서 받아 더 명시적인 API를 제공합니다.

#### 3.2.1 기존 방식 (Deprecated)

```java
@Configuration
public class OldBatchConfiguration {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;  // Deprecated

    @Autowired
    private StepBuilderFactory stepBuilderFactory;  // Deprecated

    @Bean
    public Job job() {
        return jobBuilderFactory.get("myJob")
                .start(step1())
                .build();
    }

    @Bean
    public Step step1() {
        return stepBuilderFactory.get("step1")
                .tasklet((contribution, chunkContext) -> {
                    System.out.println("Hello World!");
                    return RepeatStatus.FINISHED;
                })
                .build();
    }
}
```

#### 3.2.2 새로운 방식 (Recommended)

```java
@Configuration
public class BatchConfiguration {

    @Bean
    public Job job(JobRepository jobRepository, Step step1) {
        return new JobBuilder("myJob", jobRepository)
                .start(step1)
                .build();
    }

    @Bean
    public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        return new StepBuilder("step1", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    System.out.println("Hello World!");
                    return RepeatStatus.FINISHED;
                }, transactionManager)
                .build();
    }
}
```

## 4. 실제 Configuration 예시

### 4.1 기본 Batch Configuration

```java
@Configuration
public class SampleBatchConfiguration {

    @Bean
    public Job sampleJob(JobRepository jobRepository, Step sampleStep) {
        return new JobBuilder("sampleJob", jobRepository)
                .start(sampleStep)
                .build();
    }

    @Bean
    public Step sampleStep(JobRepository jobRepository, 
                          PlatformTransactionManager transactionManager) {
        return new StepBuilder("sampleStep", jobRepository)
                .tasklet(sampleTasklet(), transactionManager)
                .build();
    }

    @Bean
    public Tasklet sampleTasklet() {
        return (contribution, chunkContext) -> {
            System.out.println("Sample Batch Job 실행!");
            return RepeatStatus.FINISHED;
        };
    }
}
```

### 4.2 Chunk 기반 처리 Configuration

```java
@Configuration
public class ChunkBatchConfiguration {

    @Bean
    public Job chunkJob(JobRepository jobRepository, Step chunkStep) {
        return new JobBuilder("chunkJob", jobRepository)
                .start(chunkStep)
                .build();
    }

    @Bean
    public Step chunkStep(JobRepository jobRepository, 
                         PlatformTransactionManager transactionManager,
                         ItemReader<String> reader,
                         ItemProcessor<String, String> processor,
                         ItemWriter<String> writer) {
        return new StepBuilder("chunkStep", jobRepository)
                .<String, String>chunk(10, transactionManager)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }

    @Bean
    public ItemReader<String> reader() {
        return new ListItemReader<>(Arrays.asList("item1", "item2", "item3"));
    }

    @Bean
    public ItemProcessor<String, String> processor() {
        return item -> "processed " + item;
    }

    @Bean
    public ItemWriter<String> writer() {
        return items -> items.forEach(System.out::println);
    }
}
```

### 4.3 다중 Step을 가진 Job Configuration

```java
@Configuration
public class MultiStepBatchConfiguration {

    @Bean
    public Job multiStepJob(JobRepository jobRepository, 
                           Step step1, Step step2, Step step3) {
        return new JobBuilder("multiStepJob", jobRepository)
                .start(step1)
                .next(step2)
                .next(step3)
                .build();
    }

    @Bean
    public Step step1(JobRepository jobRepository, 
                     PlatformTransactionManager transactionManager) {
        return new StepBuilder("step1", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    System.out.println("Step 1 실행");
                    return RepeatStatus.FINISHED;
                }, transactionManager)
                .build();
    }

    @Bean
    public Step step2(JobRepository jobRepository, 
                     PlatformTransactionManager transactionManager) {
        return new StepBuilder("step2", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    System.out.println("Step 2 실행");
                    return RepeatStatus.FINISHED;
                }, transactionManager)
                .build();
    }

    @Bean
    public Step step3(JobRepository jobRepository, 
                     PlatformTransactionManager transactionManager) {
        return new StepBuilder("step3", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    System.out.println("Step 3 실행");
                    return RepeatStatus.FINISHED;
                }, transactionManager)
                .build();
    }
}
```

## 5. JobRepository와 TransactionManager 설정

### 5.1 자동 구성 활용

- Spring Boot 3.0에서는 `JobRepository`와 `PlatformTransactionManager`가 자동으로 구성됩니다.
- 특별한 요구사항이 없다면 이들을 직접 정의할 필요가 없으며, 의존성 주입을 통해 사용할 수 있습니다.

### 5.2 커스텀 설정이 필요한 경우

```java
@Configuration
public class CustomBatchConfiguration {

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:h2:mem:testdb");
        dataSource.setUsername("sa");
        dataSource.setPassword("");
        return dataSource;
    }

    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

    // JobRepository는 Spring Boot가 자동으로 구성하므로 별도 정의 불필요
}
```

:::tip[의존성 주입 활용]
Spring Boot 3.0에서는 JobRepository와 TransactionManager를 메서드 파라미터로 주입받아 사용하는 것이 권장됩니다.
이는 코드를 더 깔끔하게 만들고, Spring Boot의 자동 구성을 최대한 활용할 수 있게 해줍니다.
:::

## 6. 마이그레이션 가이드

### 6.1 기존 코드 업데이트 단계

- Spring Boot 2.x에서 3.0으로 마이그레이션할 때 다음 단계를 따르세요.

#### 6.1.1 1단계: @EnableBatchProcessing 제거

```java
// 변경 전
@Configuration
@EnableBatchProcessing
public class BatchConfig {
    // ...
}

// 변경 후
@Configuration
public class BatchConfig {
    // ...
}
```

#### 6.1.2 2단계: Builder Factory를 Builder로 교체

```java
// 변경 전
@Autowired
private JobBuilderFactory jobBuilderFactory;

@Autowired
private StepBuilderFactory stepBuilderFactory;

// 변경 후 - 필드 주입 제거, 메서드 파라미터로 변경
```

#### 6.1.3 3단계: Job과 Step 빈 정의 수정

```java
// 변경 전
@Bean
public Job job() {
    return jobBuilderFactory.get("myJob")
        .start(step())
        .build();
}

// 변경 후
@Bean
public Job job(JobRepository jobRepository, Step myStep) {
    return new JobBuilder("myJob", jobRepository)
        .start(myStep)
        .build();
}
```

### 6.2 마이그레이션 체크리스트

- Java 17 이상 사용 확인
- Spring Boot 3.0 의존성 업데이트
- `@EnableBatchProcessing` 어노테이션 제거
- `JobBuilderFactory`, `StepBuilderFactory` 사용 중단
- 새로운 `JobBuilder`, `StepBuilder` 적용
- 테스트 코드 동작 확인

## 7. 마치며

- Spring Boot 3.0에서의 Spring Batch 설정 변경사항은 처음에는 복잡해 보일 수 있지만, 실제로는 더 직관적이고 명확한 API를 제공합니다.
- `@EnableBatchProcessing` 없이도 자동 구성이 모든 것을 처리해주므로, 개발자는 비즈니스 로직에 더 집중할 수 있습니다.
- 새로운 Builder 클래스들은 더 명시적인 의존성 관리를 가능하게 하여, 코드의 가독성과 유지보수성을 향상시킵니다.
- 마이그레이션 과정에서는 단계별로 천천히 접근하고, 각 단계마다 충분한 테스트를 거치는 것이 중요합니다.