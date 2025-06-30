---
title: "Job Parameters"
description: "스프링 배치의 JobParameters 개념부터 실제 활용까지 상세히 알아봅니다. JobParameters의 생성 방법, 타입별 활용법, 그리고 실무에서 자주 사용되는 패턴들을 예제와 함께 설명합니다."
tags: [ "JOB_PARAMETERS", "SPRING_BATCH", "SPRING", "BACKEND", "JAVA", "BATCH_PROCESSING" ]
keywords: [ "JobParameters", "잡파라미터", "스프링배치", "Spring Batch", "배치파라미터", "Job Parameters", "배치처리", "batch processing", "스프링", "Spring", "자바", "Java", "백엔드", "backend" ]
draft: false
hide_title: true
---

## 1. JobParameters란

- JobParameters는 스프링 배치에서 배치 작업 실행 시 전달되는 매개변수들의 집합입니다.
- 배치 작업을 실행할 때마다 다른 설정값이나 데이터를 전달할 수 있도록 해주는 핵심 기능입니다.
- JobParameters는 Job 인스턴스를 구분하는 식별자 역할도 수행하며, 동일한 Job이라도 다른 JobParameters를 가지면 별개의 JobInstance로 처리됩니다.
	- JobInstance를 다른 JobInstance와 구별시켜주는 것이 JobParameters라고 할 수 있습니다.

### 1.1 JobParameters의 필요성

- 배치 작업에서 실행할 때마다 다른 값을 전달해야 하는 경우가 많습니다.
- 예를 들어, 특정 날짜의 데이터만 처리하거나, 처리할 파일의 경로를 지정하는 등의 상황에서 JobParameters가 필요합니다.
- 또한 배치 작업의 재실행이나 실패 시 복구를 위해서도 JobParameters가 중요한 역할을 합니다.

## 2. JobParameters의 기본 구조

### 2.1 JobParameter 타입

- 스프링 배치 5.x에서는 기본적으로 7가지 타입의 편의 메서드를 제공합니다.
	- **STRING**: 문자열 값을 저장
	- **LONG**: 정수 값을 저장
	- **DOUBLE**: 실수 값을 저장
	- **DATE**: java.util.Date 타입의 날짜 값을 저장
	- **LocalDate**: 날짜만 저장 (java.time.LocalDate)
	- **LocalTime**: 시간만 저장 (java.time.LocalTime)
	- **LocalDateTime**: 날짜와 시간을 저장 (java.time.LocalDateTime)
- 기본 7가지 타입 외에도 `addJobParameter(String name, T value, Class<T> type)` 메서드를 통해 임의의 사용자 정의 타입을 JobParameter로 사용할 수 있습니다.

### 2.2 JobParameter의 속성

- **identifying**: JobInstance 식별에 사용되는지 여부를 결정하는 플래그
- **value**: 실제 파라미터 값
- **type**: 파라미터의 데이터 타입

:::tip
identifying 속성을 false로 설정하면, 해당 파라미터는 JobInstance 식별에 사용되지 않습니다. 이는 실행시마다 변경되는 타임스탬프 같은 값에 유용합니다.
:::

## 3. JobParameters 생성 방법

### 3.1 JobParametersBuilder 사용

#### JobParametersBuilder를 통한 생성

```java
JobParameters jobParameters = new JobParametersBuilder()
    .addString("inputFile", "/data/input.csv")
    .addLong("processDate", 20241215L)
    .addDouble("threshold", 0.95)
    .addDate("executionTime", new Date())
    .addLocalDate("targetDate", LocalDate.of(2024, 12, 15))
    .addLocalDateTime("startTime", LocalDateTime.now())
    .toJobParameters();
```

- JobParametersBuilder는 체이닝 방식으로 다양한 타입의 파라미터를 추가할 수 있습니다.

#### 사용자 정의 타입 사용

```java
// 임의의 타입을 JobParameter로 사용
MyCustomType customObject = new MyCustomType("data");

JobParameters jobParameters = new JobParametersBuilder()
    .addJobParameter("customParam", customObject, MyCustomType.class)
    .addJobParameter("enumParam", MyEnum.ACTIVE, MyEnum.class, true) // identifying
    .toJobParameters();
```

- 제네릭 메서드를 사용하여 임의의 타입을 JobParameter로 사용할 수 있습니다.

#### identifying 속성 설정

```java
JobParameters jobParameters = new JobParametersBuilder()
    .addString("inputFile", "/data/input.csv", true)  // identifying
    .addDate("timestamp", new Date(), false)          // non-identifying
    .toJobParameters();
```

- 세 번째 파라미터로 identifying 여부를 설정할 수 있습니다.

### 3.2 명령행에서 JobParameters 전달

#### 명령행에서 타입 지정

```bash
java -jar batch-application.jar --job.name=processDataJob \
    inputFile=/data/input.csv \
    processDate=20241215 \
    threshold=0.95 \
    scheduleDate=2024-12-15,java.time.LocalDate \
    isActive=true,java.lang.Boolean
```

- 명령행에서 `name=value,type` 형식으로 특정 타입을 지정할 수 있습니다.
- Spring Boot는 `--`로 시작하는 커맨드라인 인수를 Environment 프로퍼티로 변환합니다.
- 따라서 배치 Job에 파라미터를 전달할 때는 `--` 없이 일반 형식을 사용해야 합니다.

### 3.3 프로그래밍 방식으로 Job 실행

#### JobLauncher를 통한 실행

```java
@Service
public class BatchService {
    
    @Autowired
    private JobLauncher jobLauncher;
    
    @Autowired
    private Job processDataJob;
    
    public void runBatch(String inputFile, Long processDate) throws Exception {
        JobParameters jobParameters = new JobParametersBuilder()
            .addString("inputFile", inputFile)
            .addLong("processDate", processDate)
            .addDate("timestamp", new Date(), false)
            .toJobParameters();
            
        JobExecution jobExecution = jobLauncher.run(processDataJob, jobParameters);
    }
}
```

- 앞서 소개한 `JobParametersBuilder`를 사용하여 JobParameters를 생성하고, `JobLauncher`를 통해 Job을 실행합니다.

## 4. JobParameters 활용 방법

### 4.1 Step에서 JobParameters 접근

#### StepExecutionContext를 통한 접근

```java
@Component
public class MyTasklet implements Tasklet {
    
    @Override
    public RepeatStatus execute(StepContribution contribution, 
                               ChunkContext chunkContext) throws Exception {
        
        JobParameters jobParameters = contribution.getStepExecution()
            .getJobExecution()
            .getJobParameters();
            
        String inputFile = jobParameters.getString("inputFile");
        Long processDate = jobParameters.getLong("processDate");
        
        // 비즈니스 로직 수행
        processData(inputFile, processDate);
        
        return RepeatStatus.FINISHED;
    }
}
```

- Tasklet 내에서 JobParameters에 접근하여 필요한 값을 가져올 수 있습니다.

#### @Value 어노테이션을 통한 주입

```java
@Component
@StepScope
public class MyProcessor implements ItemProcessor<InputData, OutputData> {
    
    @Value("#{jobParameters['inputFile']}")
    private String inputFile;
    
    @Value("#{jobParameters['threshold']}")
    private Double threshold;
    
    @Override
    public OutputData process(InputData item) throws Exception {
        // JobParameters 값을 사용한 처리 로직
        if (item.getScore() > threshold) {
            return processItem(item, inputFile);
        }
        return null;
    }
}
```

- @StepScope와 함께 @Value 어노테이션을 사용하여 JobParameters를 직접 주입받을 수 있습니다.
- 이를 Lazy Binding이라고 하며, Step이 실행될 때 JobParameters가 주입됩니다.
- Lazy Binding으로 구성될 빈은 스텝이나 잡 스코프를 사용해야 합니다.
	- 이 스코프의 기능은 스텝이나 잡의 실행 범위에 들어갈 때까지 빈 생성을 지연시키는 것입니다.
	- 이렇게 함으로써 명령행 또는 다른 소스에서 받아들인 잡 파라미터를 빈 생성 시점에 주입할 수 있습니다.

### 4.2 Job Configuration에서 JobParameters 활용

#### Step 설정에서 JobParameters 사용

```java
@Configuration
@EnableBatchProcessing
public class BatchConfig {
    
    @Bean
    public Job processDataJob(JobRepository jobRepository, Step processStep) {
        return new JobBuilder("processDataJob", jobRepository)
            .start(processStep)
            .build();
    }
    
    @Bean
    @StepScope
    public FlatFileItemReader<InputData> itemReader(
            @Value("#{jobParameters['inputFile']}") String inputFile) {
        
        return new FlatFileItemReaderBuilder<InputData>()
            .name("inputFileReader")
            .resource(new FileSystemResource(inputFile))
            .delimited()
            .names("id", "name", "value")
            .targetType(InputData.class)
            .build();
    }
}
```

- @StepScope를 사용하여 Job 설정에서도 JobParameters를 활용할 수 있습니다.

## 5. JobParameters 검증

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
- DefaultJobParametersValidator는 필수 파라미터와 선택적 파라미터를 설정할 수 있는 기능을 제공합니다.
  - 위 예시에서는 `date`와 `amount`를 필수 파라미터로, `volume`을 선택적 파라미터로 설정하고 있습니다.
  - 더 강력한 유효성 검증이 필요하다면 `JobParametersValidator` 인터페이스를 구현하여 커스텀 검증 로직을 작성해야 합니다.

### 5.2 JobParametersValidator 인터페이스

```java
@FunctionalInterface
public interface JobParametersValidator {
    void validate(@Nullable JobParameters parameters) throws JobParametersInvalidException;
}
```

- 복잡한 검증 로직이 필요한 경우 `JobParametersValidator` 인터페이스를 구현하여 커스텀 검증기를 작성할 수 있습니다.
- validate 메서드의 반환 타입이 `void`이므로 JobParametersInvalidException를 던지지 않으면 검증이 성공한 것으로 간주됩니다.
- 따라서 검증 실패 시에는 `JobParametersInvalidException`을 던져야 합니다.

### 5.3 커스텀 Validator 구현

```java
@Component
public class CustomJobParametersValidator implements JobParametersValidator {
    
    @Override
    public void validate(JobParameters parameters) throws JobParametersInvalidException {
        String inputFile = parameters.getString("inputFile");
        Long processDate = parameters.getLong("processDate");
        
        if (inputFile == null || inputFile.isEmpty()) {
            throw new JobParametersInvalidException("inputFile parameter is required");
        }
        
        if (processDate == null || processDate <= 0) {
            throw new JobParametersInvalidException("processDate must be a positive number");
        }
        
        // 파일 존재 여부 확인
        File file = new File(inputFile);
        if (!file.exists()) {
            throw new JobParametersInvalidException("Input file does not exist: " + inputFile);
        }
    }
}
```

- 위와 같이 `JobParametersValidator`를 구현하여 JobParameters의 유효성을 검증할 수 있습니다.

#### Job에 Validator 적용

```java
@Bean
public Job processDataJob(JobRepository jobRepository, 
                         Step processStep,
                         CustomJobParametersValidator validator) {
    return new JobBuilder("processDataJob", jobRepository)
        .validator(validator)
        .start(processStep)
        .build();
}
```

- 앞서 구현한 `CustomJobParametersValidator`를 Job의 설정에서 Validator로 등록하여, Job 실행 전에 파라미터를 검증할 수 있습니다.

### 5.4 두 가지 이상의 JobParametersValidator 사용

- JobBuilder를 통해서는 하나의 Validator만 설정할 수 있습니다.
- 하지만 단일 검증자로는 복잡한 검증 로직을 처리하기 어려운 경우가 있습니다.
  - 이를 각 검증자가 하나의 책임만 담당하도록 변경할 수 있습니다.
- 만약 두 가지 이상의 JobParametersValidator를 사용하고 싶다면, 이를 조합하여 하나의 Validator로 만들어야 합니다.
- 이 기능을 제공하는 것이 바로 `CompositeJobParametersValidator`입니다.
- `CompositeJobParametersValidator`는 여러 개의 JobParametersValidator를 하나로 묶어 순차적으로 검증을 수행합니다.
  - 설정된 리스트의 순서대로 검증자들을 실행하며, 첫 번째 실패 시점에서 즉시 중단됩니다.

```java
/**
 * 여러 검증자를 조합한 복합 검증 구성
 */
@Configuration
public class JobValidationConfig {
    
    /**
     * 복합 검증자 구성
     * 여러 개별 검증자들을 순차적으로 실행
     */
    @Bean
    public CompositeJobParametersValidator compositeValidator() {
        CompositeJobParametersValidator validator = new CompositeJobParametersValidator();
        
        // 개별 검증자들을 리스트로 설정
        validator.setValidators(Arrays.asList(
            requiredParametersValidator(),
            fileExistenceValidator(), 
            dateFormatValidator(),
            businessRuleValidator()
        ));
        
        return validator;
    }
    
    /**
     * 필수 파라미터 검증자
     */
    @Bean
    public JobParametersValidator requiredParametersValidator() {
        return new RequiredParametersValidator();
    }
    
    /**
     * 파일 존재 검증자
     */
    @Bean  
    public JobParametersValidator fileExistenceValidator() {
        return new FileExistenceValidator();
    }
    
    /**
     * 날짜 형식 검증자
     */
    @Bean
    public JobParametersValidator dateFormatValidator() {
        return new DateFormatValidator();
    }
    
    /**
     * 비즈니스 규칙 검증자
     */
    @Bean
    public JobParametersValidator businessRuleValidator() {
        return new BusinessRuleValidator();
    }
}
```

- 위와 같이 `CompositeJobParametersValidator`를 사용하여 여러 개의 JobParametersValidator를 조합할 수 있습니다.

## 6. JobParameters와 JobInstance 관계

### 6.1 JobInstance 식별 규칙

- JobInstance는 Job 이름과 identifying JobParameters의 조합으로 식별됩니다.
- 동일한 Job과 동일한 identifying JobParameters를 가진 JobInstance는 한 번만 성공적으로 실행될 수 있습니다.
- 실패한 JobInstance는 동일한 JobParameters로 재실행할 수 있습니다.

#### JobInstance 식별 예시

```java
// 첫 번째 실행
JobParameters params1 = new JobParametersBuilder()
    .addString("inputFile", "/data/file1.csv")
    .addDate("timestamp", new Date(), false)  // non-identifying
    .toJobParameters();

// 두 번째 실행 - 같은 JobInstance
JobParameters params2 = new JobParametersBuilder()
    .addString("inputFile", "/data/file1.csv")
    .addDate("timestamp", new Date(), false)  // 다른 값이지만 non-identifying
    .toJobParameters();

// 세 번째 실행 - 다른 JobInstance
JobParameters params3 = new JobParametersBuilder()
    .addString("inputFile", "/data/file2.csv")  // 다른 identifying 값
    .addDate("timestamp", new Date(), false)
    .toJobParameters();
```

- identifying 파라미터만 JobInstance 식별에 사용되므로, 위 예시에서 params1과 params2는 같은 JobInstance를 생성합니다.

### 6.2 재실행 처리

- 성공한 JobInstance는 동일한 JobParameters로 재실행할 수 없습니다.
- 재실행이 필요한 경우 다른 identifying JobParameters를 사용하거나, JobRepository에서 해당 JobInstance를 삭제해야 합니다.
- 성공적으로 완료된 Job을 동일한 identifying JobParameters로 재실행하려고 하면 JobInstanceAlreadyCompleteException이 발생합니다.

## 7. 마치며

- JobParameters는 스프링 배치에서 배치 작업의 유연성과 재사용성을 높여주는 핵심 기능입니다.
- 적절한 타입과 identifying 속성 설정을 통해 배치 작업을 효율적으로 관리할 수 있습니다.
- 실무에서는 날짜, 파일 경로, 환경 설정 등 다양한 용도로 JobParameters를 활용하여 동적이고 유연한 배치 시스템을 구축할 수 있습니다.
- JobParameters 검증과 JobInstance 관리를 통해 안정적인 배치 시스템을 운영할 수 있습니다.