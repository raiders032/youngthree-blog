---
title: "ItemProcessor"
description: "Spring Batch의 ItemProcessor를 활용한 데이터 변환, 체이닝, 필터링, 검증 등의 핵심 기능을 상세히 알아봅니다. 실제 코드 예제와 함께 배치 처리에서 비즈니스 로직을 효과적으로 구현하는 방법을 설명합니다."
tags: ["ITEM_PROCESSOR", "SPRING_BATCH", "SPRING", "BACKEND", "JAVA", "BATCH_PROCESSING"]
keywords: ["ItemProcessor", "Spring Batch", "스프링 배치", "아이템 프로세서", "데이터 변환", "배치 처리", "비즈니스 로직", "체이닝", "필터링", "검증", "Validation", "CompositeItemProcessor", "Validator", "BeanValidating"]
draft: false
hide_title: true
---

## 1. ItemProcessor 소개

- Spring Batch에서 ItemProcessor는 ItemReader와 ItemWriter 사이에서 비즈니스 로직을 처리하는 핵심 컴포넌트입니다.
- ItemReader로 읽어온 데이터를 ItemWriter로 쓰기 전에 변환, 검증, 필터링 등의 작업을 수행합니다.
- ItemProcessor는 Step에서 선택적으로 사용할 수 있으며, 복잡한 비즈니스 로직을 깔끔하게 분리할 수 있습니다.

### 1.1 ItemProcessor의 필요성

- ItemReader와 ItemWriter만으로는 단순한 읽기/쓰기만 가능합니다.
- 실제 배치 처리에서는 데이터 변환, 검증, 필터링 등의 비즈니스 로직이 필요합니다.
- Composite 패턴을 사용하여 ItemWriter나 ItemReader를 감싸는 방법도 있지만, ItemProcessor가 더 명확하고 효율적입니다.

:::info[Composite 패턴 예시]

ItemWriter를 감싸서 비즈니스 로직을 추가하는 방법도 있지만, 단순한 변환의 경우 ItemProcessor가 더 적합합니다.

:::

## 2. ItemProcessor 기본 인터페이스

### 2.1 인터페이스 구조

```java
public interface ItemProcessor<I, O> {
    O process(I item) throws Exception;
}
```

- 입력 타입 I와 출력 타입 O를 제네릭으로 지정합니다.
- process 메서드에서 하나의 객체를 받아 변환된 객체를 반환합니다.
- 입력과 출력 타입이 다를 수 있어 유연한 데이터 변환이 가능합니다.

### 2.2 기본 구현 예시

#### Foo를 Bar로 변환하는 예시

```java
public class Foo {}

public class Bar {
    public Bar(Foo foo) {}
}

public class FooProcessor implements ItemProcessor<Foo, Bar> {
    public Bar process(Foo foo) throws Exception {
        // 간단한 변환 로직: Foo를 Bar로 변환
        return new Bar(foo);
    }
}

public class BarWriter implements ItemWriter<Bar> {
    public void write(Chunk<? extends Bar> bars) throws Exception {
        // Bar 객체들을 처리
    }
}
```

이 예시에서 FooProcessor는 Foo 타입의 객체를 받아 Bar 타입으로 변환합니다.

#### Step 설정에서 ItemProcessor 사용

```java
@Bean
public Job ioSampleJob(JobRepository jobRepository, Step step1) {
    return new JobBuilder("ioSampleJob", jobRepository)
            .start(step1)
            .build();
}

@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
            .<Foo, Bar>chunk(2, transactionManager)
            .reader(fooReader())
            .processor(fooProcessor())
            .writer(barWriter())
            .build();
}
```

- chunk 처리에서 입력 타입 Foo와 출력 타입 Bar를 명시합니다.
- processor() 메서드로 ItemProcessor를 설정합니다.

:::tip[ItemProcessor는 선택사항]

ItemReader와 ItemWriter와 달리 ItemProcessor는 Step에서 선택적으로 사용할 수 있습니다. 단순한 읽기/쓰기만 필요한 경우 생략 가능합니다.

:::

## 3. ItemProcessor 체이닝

### 3.1 체이닝의 필요성

- 하나의 변환만으로는 복잡한 비즈니스 로직을 처리하기 어려운 경우가 있습니다.
- 여러 개의 ItemProcessor를 연결하여 단계적으로 데이터를 변환할 수 있습니다.
- CompositeItemProcessor를 사용하여 여러 프로세서를 체인처럼 연결합니다.

### 3.2 체이닝 구현 예시

#### 다단계 변환 클래스 정의

```java
public class Foo {}

public class Bar {
    public Bar(Foo foo) {}
}

public class Foobar {
    public Foobar(Bar bar) {}
}

public class FooProcessor implements ItemProcessor<Foo, Bar> {
    public Bar process(Foo foo) throws Exception {
        // Foo를 Bar로 변환
        return new Bar(foo);
    }
}

public class BarProcessor implements ItemProcessor<Bar, Foobar> {
    public Foobar process(Bar bar) throws Exception {
        // Bar를 Foobar로 변환
        return new Foobar(bar);
    }
}

public class FoobarWriter implements ItemWriter<Foobar>{
    public void write(Chunk<? extends Foobar> items) throws Exception {
        // 최종 결과 처리
    }
}
```

이 예시에서는 Foo → Bar → Foobar로 2단계 변환을 수행합니다.

#### CompositeItemProcessor 설정

```java
CompositeItemProcessor<Foo,Foobar> compositeProcessor = 
    new CompositeItemProcessor<Foo,Foobar>();

List itemProcessors = new ArrayList();
itemProcessors.add(new FooProcessor());
itemProcessors.add(new BarProcessor());

compositeProcessor.setDelegates(itemProcessors);
```

- 여러 개의 ItemProcessor를 리스트로 만들어 순서대로 실행됩니다.
- 첫 번째 프로세서의 출력이 두 번째 프로세서의 입력이 됩니다.

#### Spring Configuration으로 CompositeItemProcessor 설정

```java
@Bean
public Job ioSampleJob(JobRepository jobRepository, Step step1) {
    return new JobBuilder("ioSampleJob", jobRepository)
            .start(step1)
            .build();
}

@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
            .<Foo, Foobar>chunk(2, transactionManager)
            .reader(fooReader())
            .processor(compositeProcessor())
            .writer(foobarWriter())
            .build();
}

@Bean
public CompositeItemProcessor compositeProcessor() {
    List<ItemProcessor> delegates = new ArrayList<>(2);
    delegates.add(new FooProcessor());
    delegates.add(new BarProcessor());

    CompositeItemProcessor processor = new CompositeItemProcessor();
    processor.setDelegates(delegates);

    return processor;
}
```

최종적으로 Foo 타입을 입력받아 Foobar 타입으로 출력하는 복합 프로세서가 완성됩니다.

## 4. 레코드 필터링

### 4.1 필터링과 스킵의 차이

- **필터링**: 레코드가 유효하지만 처리하지 않아도 되는 경우 (예: 삭제 대상 레코드)
- **스킵**: 레코드가 잘못되어 처리할 수 없는 경우 (예: 형식 오류)

### 4.2 필터링 구현 방법

- ItemProcessor에서 null을 반환하면 해당 레코드가 필터링됩니다.
- Spring Batch 프레임워크가 null 결과를 감지하여 ItemWriter로 전달하지 않습니다.

#### 필터링 예시

```java
public class RecordFilterProcessor implements ItemProcessor<Record, Record> {
    
    @Override
    public Record process(Record record) throws Exception {
        // 삭제 타입 레코드는 필터링
        if ("DELETE".equals(record.getRecordType())) {
            return null; // 필터링됨
        }
        
        // INSERT, UPDATE 레코드만 통과
        return record;
    }
}
```

:::warning[예외 처리 주의사항]

ItemProcessor에서 예외가 발생하면 스킵으로 처리됩니다. 의도적인 필터링을 위해서는 반드시 null을 반환해야 합니다.

:::

## 5. 입력 데이터 검증

### 5.1 검증의 필요성

- ItemReader에서 파싱이 성공해도 비즈니스 로직 관점에서 유효하지 않을 수 있습니다.
- 예: 나이 필드가 음수인 경우, 필수 필드가 비어있는 경우 등
- Spring Batch는 다양한 검증 프레임워크와 연동할 수 있는 Validator 인터페이스를 제공합니다.

### 5.2 Validator 인터페이스

```java
public interface Validator<T> {
    void validate(T value) throws ValidationException;
}
```

- 객체가 유효하지 않으면 예외를 던지고, 유효하면 정상적으로 반환합니다.
- 기존 검증 프레임워크를 활용하여 구현할 수 있습니다.

### 5.3 ValidatingItemProcessor 사용

#### Spring Validator를 활용한 검증

```java
@Bean
public ValidatingItemProcessor itemProcessor() {
    ValidatingItemProcessor processor = new ValidatingItemProcessor();
    processor.setValidator(validator());
    return processor;
}

@Bean
public SpringValidator validator() {
    SpringValidator validator = new SpringValidator();
    validator.setValidator(new TradeValidator());
    return validator;
}
```

ValidatingItemProcessor를 사용하면 검증 로직을 깔끔하게 분리할 수 있습니다.

### 5.4 Bean Validation (JSR-303) 활용

#### Bean Validation 어노테이션 사용 예시

```java
class Person {

    @NotEmpty
    private String name;

    public Person(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

Person 클래스의 name 필드에 @NotEmpty 어노테이션을 적용하여 빈 값을 검증합니다.

#### BeanValidatingItemProcessor 설정

```java
@Bean
public BeanValidatingItemProcessor<Person> beanValidatingItemProcessor() throws Exception {
    BeanValidatingItemProcessor<Person> beanValidatingItemProcessor = new BeanValidatingItemProcessor<>();
    beanValidatingItemProcessor.setFilter(true);
    return beanValidatingItemProcessor;
}
```

- BeanValidatingItemProcessor는 JSR-303 어노테이션을 자동으로 검증합니다.
- setFilter(true)를 설정하면 검증 실패 시 예외 대신 필터링됩니다.

## 6. 장애 허용성 (Fault Tolerance)

### 6.1 장애 허용성의 중요성

- 배치 처리 중 오류가 발생하면 청크가 롤백될 수 있습니다.
- 롤백 시 읽기 단계에서 캐시된 아이템들이 재처리될 수 있습니다.
- ItemProcessor는 동일한 입력에 대해 동일한 결과를 보장하는 멱등성(idempotent)을 가져야 합니다.

### 6.2 멱등성 구현 방법

- 입력 아이템을 변경하지 않고, 결과 객체만 업데이트합니다.
- 외부 시스템 호출이나 상태 변경을 최소화합니다.
- 가능한 한 순수 함수 형태로 구현합니다.

#### 멱등성을 고려한 구현 예시

```java
public class SafeItemProcessor implements ItemProcessor<InputData, OutputData> {
    
    @Override
    public OutputData process(InputData input) throws Exception {
        // 입력 객체는 변경하지 않음
        // 새로운 결과 객체만 생성하여 반환
        OutputData output = new OutputData();
        output.setProcessedValue(input.getRawValue() * 2);
        output.setTimestamp(System.currentTimeMillis());
        
        return output;
    }
}
```

:::danger[상태 변경 주의사항]

재처리될 수 있으므로 ItemProcessor에서 입력 아이템을 직접 수정하거나 외부 상태를 변경하는 것은 위험합니다. 항상 새로운 결과 객체를 생성하여 반환하세요.

:::

## 7. 실제 활용 사례

### 7.1 데이터 변환 파이프라인

```java
@Component
public class CustomerDataProcessor implements ItemProcessor<RawCustomer, ProcessedCustomer> {
    
    @Override
    public ProcessedCustomer process(RawCustomer rawCustomer) throws Exception {
        // 데이터 정제 및 변환
        ProcessedCustomer processed = new ProcessedCustomer();
        processed.setName(rawCustomer.getName().trim().toUpperCase());
        processed.setEmail(rawCustomer.getEmail().toLowerCase());
        processed.setAge(calculateAge(rawCustomer.getBirthDate()));
        
        return processed;
    }
    
    private int calculateAge(LocalDate birthDate) {
        return Period.between(birthDate, LocalDate.now()).getYears();
    }
}
```

### 7.2 조건부 처리와 필터링

```java
@Component
public class OrderProcessor implements ItemProcessor<Order, ProcessedOrder> {
    
    @Override
    public ProcessedOrder process(Order order) throws Exception {
        // 취소된 주문은 필터링
        if ("CANCELLED".equals(order.getStatus())) {
            return null;
        }
        
        // 유효한 주문만 처리
        ProcessedOrder processed = new ProcessedOrder();
        processed.setOrderId(order.getId());
        processed.setTotalAmount(calculateTotal(order));
        processed.setProcessedDate(LocalDateTime.now());
        
        return processed;
    }
    
    private BigDecimal calculateTotal(Order order) {
        return order.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
```

## 8. 마치며

- ItemProcessor는 Spring Batch에서 비즈니스 로직을 처리하는 핵심 컴포넌트입니다.
- 데이터 변환, 검증, 필터링 등 다양한 용도로 활용할 수 있습니다.
- CompositeItemProcessor를 통해 복잡한 처리 과정을 단계별로 나눌 수 있습니다.
- 장애 허용성을 위해 멱등성을 고려한 구현이 중요합니다.
- 적절한 검증과 필터링을 통해 안정적인 배치 처리 시스템을 구축할 수 있습니다.