---
title: "ItemReadListener"
description: "Spring Batch의 ItemReadListener를 활용하여 데이터 읽기 과정에서 발생하는 오류를 처리하고 로깅하는 방법을 알아봅니다. 인터페이스 기반 구현과 어노테이션 기반 구현 방법을 실제 예제와 함께 설명합니다."
tags: [ "ITEM_READ_LISTENER", "SPRING_BATCH", "SPRING", "BACKEND", "JAVA", "ERROR_HANDLING" ]
keywords: [ "스프링배치", "Spring Batch", "ItemReadListener", "아이템리드리스너", "배치처리", "batch processing", "오류처리", "error handling", "로깅", "logging", "스킵로직", "skip logic", "BeforeRead", "AfterRead", "OnReadError", "스프링", "Spring", "자바", "Java", "백엔드", "backend" ]
draft: false
hide_title: true
---

## 1. ItemReadListener란?

- Spring Batch에서 데이터 읽기 과정을 모니터링하고 제어하기 위한 리스너입니다.
- 데이터를 읽기 전, 읽은 후, 그리고 읽기 오류가 발생했을 때의 상황을 감지하여 적절한 처리를 할 수 있게 해줍니다.
- 특히 스킵 로직(skip logic)과 함께 사용하여 읽기 오류가 발생한 레코드를 로깅하고 나중에 처리할 수 있도록 도와줍니다.

:::info
ItemReadListener는 Spring Batch의 StepListener를 확장한 인터페이스로, Step 실행 과정에서 Item 읽기 단계의 생명주기를 관리합니다.
:::

## 2. ItemReadListener 인터페이스 구조

#### 2.1 ItemReadListener 인터페이스 정의

```java
public interface ItemReadListener<T> extends StepListener {

    void beforeRead();
    void afterRead(T item);
    void onReadError(Exception ex);

}
```

- 이 인터페이스는 세 개의 메서드를 제공하여 읽기 과정의 각 단계를 처리할 수 있습니다.

### 2.2 메서드별 설명

#### beforeRead() 메서드

- ItemReader의 read() 메서드가 호출되기 전에 실행됩니다.
- 읽기 작업 시작 전에 필요한 준비 작업이나 로깅을 수행할 수 있습니다.

#### afterRead(T item) 메서드

- read() 메서드가 성공적으로 완료된 후 호출됩니다.
- 읽어온 아이템을 매개변수로 받아 성공한 읽기 작업에 대한 후처리를 수행할 수 있습니다.

#### onReadError(Exception ex) 메서드

- 읽기 과정에서 오류가 발생했을 때 호출됩니다.
- 발생한 예외 정보를 받아 적절한 오류 처리 및 로깅을 수행할 수 있습니다.

## 3. 인터페이스 기반 구현

### 3.1 기본 구현 예제

#### 커스텀 ItemReadListener 구현

```java
@Component
@Slf4j
public class CustomItemReadListener implements ItemReadListener<Customer> {

    @Override
    public void beforeRead() {
        log.debug("데이터 읽기 시작");
    }

    @Override
    public void afterRead(Customer item) {
        if (item != null) {
            log.info("고객 데이터 읽기 성공: ID={}, 이름={}", 
                     item.getId(), item.getName());
        } else {
            log.debug("더 이상 읽을 데이터가 없습니다.");
        }
    }

    @Override
    public void onReadError(Exception ex) {
        log.error("데이터 읽기 중 오류 발생: {}", ex.getMessage(), ex);
        
        // 오류 통계 수집
        incrementErrorCount();
        
        // 알림 시스템에 오류 전송
        sendErrorNotification(ex);
    }
    
    private void incrementErrorCount() {
        // 오류 카운터 증가 로직
    }
    
    private void sendErrorNotification(Exception ex) {
        // 외부 모니터링 시스템에 알림 전송
    }
}
```

### 3.2 Step 설정에 리스너 등록

#### Job Configuration에서 리스너 등록

```java
@Configuration
@EnableBatchProcessing
public class BatchJobConfiguration {

    @Autowired
    private CustomItemReadListener itemReadListener;

    @Bean
    public Step customerProcessingStep() {
        return stepBuilderFactory.get("customerProcessingStep")
                .<Customer, Customer>chunk(100)
                .reader(customerItemReader())
                .processor(customerItemProcessor())
                .writer(customerItemWriter())
                .listener(itemReadListener)  // 리스너 등록
                .faultTolerant()
                .skip(DataIntegrityViolationException.class)
                .skipLimit(10)
                .build();
    }
}
```

## 4. 어노테이션 기반 구현

### 4.1 지원하는 어노테이션

- Spring Batch는 인터페이스 구현 대신 어노테이션을 사용한 구현 방식도 지원합니다
  - `@BeforeRead`: beforeRead() 메서드와 동일한 기능
  - `@AfterRead`: afterRead() 메서드와 동일한 기능
  - `@OnReadError`: onReadError() 메서드와 동일한 기능

### 4.2 어노테이션 기반 구현 예제

#### 어노테이션을 사용한 리스너 구현

```java
@Component
@Slf4j
public class AnnotationBasedReadListener {

    private int readCount = 0;
    private int errorCount = 0;

    @BeforeRead
    public void beforeReading() {
        readCount++;
        log.debug("{}번째 데이터 읽기 시도", readCount);
    }

    @AfterRead
    public void afterReading(Customer customer) {
        if (customer != null) {
            log.info("고객 정보 읽기 완료: {} ({}번째)", 
                     customer.getName(), readCount);
            
            // 데이터 유효성 검사
            validateCustomerData(customer);
        }
    }

    @OnReadError
    public void onReadingError(Exception exception) {
        errorCount++;
        log.error("{}번째 읽기에서 오류 발생 (총 오류: {}회): {}", 
                  readCount, errorCount, exception.getMessage());
        
        // 오류 유형별 분류
        categorizeError(exception);
        
        // 특정 오류 횟수 초과 시 Job 중단 신호
        if (errorCount > 50) {
            log.error("오류 횟수가 임계값을 초과했습니다. Job 중단을 고려하세요.");
        }
    }
    
    private void validateCustomerData(Customer customer) {
        // 읽어온 데이터의 유효성 검사 로직
        if (customer.getEmail() == null || !customer.getEmail().contains("@")) {
            log.warn("유효하지 않은 이메일 주소: {}", customer.getEmail());
        }
    }
    
    private void categorizeError(Exception exception) {
        if (exception instanceof DataAccessException) {
            log.error("데이터베이스 접근 오류 발생");
        } else if (exception instanceof FileNotFoundException) {
            log.error("파일을 찾을 수 없습니다");
        } else {
            log.error("알 수 없는 오류 유형: {}", exception.getClass().getSimpleName());
        }
    }
}
```