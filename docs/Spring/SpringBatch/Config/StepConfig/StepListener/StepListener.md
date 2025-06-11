---
title: "Spring Batch Step Listener"
description: "Spring Batch에서 Step 실행 과정을 모니터링하고 제어하는 다양한 Listener들에 대해 알아봅니다. StepExecutionListener, ChunkListener, ItemReadListener, ItemProcessListener, ItemWriteListener, SkipListener의 사용법과 실제 구현 예시를 상세히 설명합니다."
tags: [ "SPRING_BATCH", "SPRING", "BACKEND", "JAVA", "BATCH_PROCESSING" ]
keywords: [ "스프링배치", "Spring Batch", "스텝리스너", "Step Listener", "StepExecutionListener", "ChunkListener", "ItemReadListener", "ItemProcessListener", "ItemWriteListener", "SkipListener", "배치처리", "batch processing", "스프링", "Spring", "자바", "Java", "백엔드", "backend" ]
draft: false
hide_title: true
---

## 1. Spring Batch Step Listener 소개

- Spring Batch에서 Step 실행 과정 중에는 다양한 이벤트가 발생하며, 개발자는 이러한 이벤트에 대해 특정 로직을 수행해야 할 경우가 있습니다.
- 예를 들어, 플랫 파일 작성 시 푸터를 추가하려면 Step이 완료되었을 때 ItemWriter에게 알림을 보내야 합니다.
- Spring Batch는 이러한 요구사항을 충족하기 위해 다양한 Step 범위의 Listener를 제공합니다.

:::info

Step Listener는 Step, Tasklet, 또는 Chunk 선언 내에서 listeners 엘리먼트를 통해 적용할 수 있습니다. 기능이 적용되는 레벨에서 리스너를 선언하는 것을 권장합니다.

:::

## 2. Step Listener 등록 방법

### 2.1 Java Configuration을 통한 등록

#### Java Configuration 예시

```java
@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
    return new StepBuilder("step1", jobRepository)
                .<String, String>chunk(10, transactionManager)
                .reader(reader())
                .writer(writer())
                .listener(chunkListener())
                .build();
}
```

위 예시는 chunk 레벨에서 리스너를 적용하는 방법을 보여줍니다.

### 2.2 자동 등록

- ItemReader, ItemWriter, 또는 ItemProcessor가 StepListener 인터페이스를 구현하는 경우, Step에 자동으로 등록됩니다.
- 이는 해당 컴포넌트가 Step에 직접 주입된 경우에만 적용됩니다.
- 리스너가 다른 컴포넌트 내부에 중첩되어 있는 경우에는 명시적으로 등록해야 합니다.

### 2.3 어노테이션을 통한 등록

- Spring Batch는 어노테이션 기반의 접근 방식도 지원합니다.
- 일반적인 Java 객체의 메서드에 어노테이션을 추가하면 해당하는 StepListener 타입으로 자동 변환됩니다.

## 3. StepExecutionListener

### 3.1 개념

- StepExecutionListener는 Step 실행에 대한 가장 일반적인 리스너입니다.
- Step이 시작되기 전과 종료된 후(정상 종료 또는 실패)에 알림을 받을 수 있습니다.

### 3.2 StepExecutionListener 인터페이스

```java
public interface StepExecutionListener extends StepListener {

    void beforeStep(StepExecution stepExecution);

    ExitStatus afterStep(StepExecution stepExecution);

}
```

- `beforStep` 메서드는 Step 실행 전에 호출됩니다.
- `afterStep` 메서드는 `ExitStatus`를 반환하여, Step 완료 시 반환되는 종료 코드를 수정할 수 있는 기회를 제공합니다.

### 3.3 대응하는 어노테이션

- `@BeforeStep`: Step 실행 전에 호출됩니다.
- `@AfterStep`: Step 실행 후에 호출됩니다.

## 4. ChunkListener

### 4.1 개념

- "Chunk"는 트랜잭션 범위 내에서 처리되는 아이템들을 의미합니다.
- 각 커밋 간격마다 트랜잭션을 커밋하면서 청크를 처리합니다.
- ChunkListener를 사용하여 청크 처리가 시작되기 전이나 성공적으로 완료된 후에 로직을 수행할 수 있습니다.

### 4.2 ChunkListener 인터페이스

```java
public interface ChunkListener extends StepListener {

    void beforeChunk(ChunkContext context);
    void afterChunk(ChunkContext context);
    void afterChunkError(ChunkContext context);

}
```

- `beforeChunk`: 트랜잭션이 시작된 후 ItemReader에서 읽기가 시작되기 전에 호출됩니다.
- `afterChunk`: 청크가 커밋된 후에 호출됩니다(롤백이 발생하면 호출되지 않습니다).
- `afterChunkError`: 청크 처리 중 오류가 발생했을 때 호출됩니다.

### 4.3 대응하는 어노테이션

- `@BeforeChunk`
- `@AfterChunk`
- `@AfterChunkError`

### 4.4 ChunkListener 주의사항

- ChunkListener는 체크된 예외를 던지도록 설계되지 않았습니다. 
- ChunkListener의 메서드들(beforeChunk, afterChunk, afterChunkError)에서 IOException, SQLException 같은 체크된 예외를 던지면 안 됩니다.
- 오류는 구현체에서 처리해야 하며, 그렇지 않으면 Step이 종료됩니다.
  - 리스너에서 예외가 발생해서 전체 배치 처리가 중단되는 것은 바람직하지 않습니다. 따라서 리스너 내부에서 예외를 처리해야 합니다.

## 5. ItemReadListener

### 5.1 개념

- ItemReadListener는 읽기 오류가 발생한 레코드를 로깅하여 나중에 처리할 때 유용합니다.

### 5.2 ItemReadListener 인터페이스

```java
public interface ItemReadListener<T> extends StepListener {

    void beforeRead();
    void afterRead(T item);
    void onReadError(Exception ex);

}
```

- `beforeRead`: ItemReader의 각 read 호출 전에 호출됩니다.
- `afterRead`: 성공적인 read 호출 후에 호출되며, 읽은 아이템을 전달받습니다.
- `onReadError`: 읽기 중 오류가 발생했을 때 호출되며, 발생한 예외를 제공합니다.

### 5.3 대응하는 어노테이션

- `@BeforeRead`
- `@AfterRead`
- `@OnReadError`

## 6. ItemProcessListener

### 6.1 개념

- ItemProcessListener는 아이템 처리 과정을 모니터링할 수 있습니다.

### 6.2 ItemProcessListener 인터페이스

```java
public interface ItemProcessListener<T, S> extends StepListener {

    void beforeProcess(T item);
    void afterProcess(T item, S result);
    void onProcessError(T item, Exception e);

}
```

- `beforeProcess`: ItemProcessor의 process 메서드 호출 전에 호출되며, 처리될 아이템을 전달받습니다.
- `afterProcess`: 아이템이 성공적으로 처리된 후 호출됩니다.
- `onProcessError`: 처리 중 오류가 발생했을 때 호출되며, 예외와 처리하려던 아이템을 제공합니다.

### 6.3 대응하는 어노테이션

- `@BeforeProcess`
- `@AfterProcess`
- `@OnProcessError`

## 7. ItemWriteListener

### 7.1 개념

- ItemWriteListener는 아이템 쓰기 과정을 모니터링할 수 있습니다.

### 7.2 ItemWriteListener 인터페이스

```java
public interface ItemWriteListener<S> extends StepListener {

    void beforeWrite(List<? extends S> items);
    void afterWrite(List<? extends S> items);
    void onWriteError(Exception exception, List<? extends S> items);

}
```

- `beforeWrite`: ItemWriter의 write 메서드 호출 전에 호출되며, 쓰여질 아이템 목록을 전달받습니다.
- `afterWrite`: 아이템들이 성공적으로 쓰여진 후 호출되지만, 청크 처리와 관련된 트랜잭션이 커밋되기 전에 호출됩니다.
- `onWriteError`: 쓰기 중 오류가 발생했을 때 호출되며, 예외와 쓰려던 아이템들을 제공합니다.

### 7.3 대응하는 어노테이션

- `@BeforeWrite`
- `@AfterWrite`
- `@OnWriteError`

## 8. SkipListener

### 8.1 개념

- ItemReadListener, ItemProcessListener, ItemWriteListener는 모두 오류 알림 메커니즘을 제공하지만, 레코드가 실제로 스킵되었다는 것을 알려주지는 않습니다.
- 예를 들어, onWriteError는 오류가 발생할 때마다 호출되는데, 이는 아이템이 재시도를 통해 최종적으로 성공한 경우에도 마찬가지입니다.
- 즉, "오류 발생"과 "실제 스킵"은 다른 개념이며, 재시도 로직이 있는 경우 오류가 발생해도 최종적으로는 성공할 수 있습니다.
- SkipListener는 재시도를 모두 시도한 후에도 실패하여 실제로 스킵된 아이템만을 추적하기 위한 별도의 인터페이스입니다.

### 8.2 SkipListener 인터페이스

```java
public interface SkipListener<T,S> extends StepListener {

    void onSkipInRead(Throwable t);
    void onSkipInProcess(T item, Throwable t);
    void onSkipInWrite(S item, Throwable t);

}
```

- `onSkipInRead`: 읽기 중 아이템이 스킵될 때마다 호출됩니다.
- `onSkipInProcess`: 처리 중 아이템이 스킵될 때 호출됩니다.
- `onSkipInWrite`: 쓰기 중 아이템이 스킵될 때 호출됩니다. 아이템이 성공적으로 읽혔기 때문에 아이템 자체도 인수로 제공됩니다.

:::tip
롤백으로 인해 같은 아이템이 여러 번 스킵된 것으로 등록될 수 있다는 점에 주의하세요.
:::

### 8.3 대응하는 어노테이션

- `@OnSkipInRead`
- `@OnSkipInWrite`
- `@OnSkipInProcess`

## 9. SkipListener와 트랜잭션

### 9.1 주요 보장 사항

- Spring Batch는 SkipListener에 대해 두 가지를 보장합니다:
	- 적절한 skip 메서드가 아이템당 한 번만 호출됩니다.
	- SkipListener는 항상 트랜잭션이 커밋되기 직전에 호출됩니다.

### 9.2 트랜잭션 보장의 중요성

- 이러한 보장은 리스너가 호출하는 모든 트랜잭션 리소스가 ItemWriter 내의 실패로 인해 롤백되지 않도록 하기 위한 것입니다.
- 가장 일반적인 SkipListener 사용 사례는 스킵된 아이템을 로깅하여 나중에 다른 배치 프로세스나 사람이 문제를 평가하고 수정할 수 있도록 하는 것입니다.

## 10. 실제 사용 예시

### 10.1 스킵된 아이템 로깅 예시

#### 커스텀 SkipListener 구현

```java
@Component
public class CustomSkipListener implements SkipListener<String, String> {

    private static final Logger logger = LoggerFactory.getLogger(CustomSkipListener.class);

    @Override
    public void onSkipInRead(Throwable t) {
        logger.warn("읽기 과정에서 스킵 발생: {}", t.getMessage());
    }

    @Override
    public void onSkipInProcess(String item, Throwable t) {
        logger.warn("처리 과정에서 스킵 발생 - 아이템: {}, 오류: {}", item, t.getMessage());
    }

    @Override
    public void onSkipInWrite(String item, Throwable t) {
        logger.warn("쓰기 과정에서 스킵 발생 - 아이템: {}, 오류: {}", item, t.getMessage());
    }
}
```

### 10.2 Step에 리스너 등록

#### Step Configuration 예시

```java
@Bean
public Step processStep(JobRepository jobRepository, 
                       PlatformTransactionManager transactionManager,
                       CustomSkipListener skipListener) {
    return new StepBuilder("processStep", jobRepository)
                .<String, String>chunk(100, transactionManager)
                .reader(itemReader())
                .processor(itemProcessor())
                .writer(itemWriter())
                .faultTolerant()
                .skip(Exception.class)
                .skipLimit(10)
                .listener(skipListener)
                .build();
}
```

## 11. 마치며

- Spring Batch의 다양한 Step Listener들은 배치 처리 과정에서 발생하는 이벤트를 세밀하게 모니터링하고 제어할 수 있게 해줍니다.
- 각 리스너는 특정 시점과 상황에 맞게 설계되어 있어, 요구사항에 따라 적절한 리스너를 선택하여 사용할 수 있습니다.
- 트랜잭션과의 관계를 이해하고 적절히 활용하면, 안정적이고 추적 가능한 배치 시스템을 구축할 수 있습니다.

## 참고

- https://docs.spring.io/spring-batch/reference/step/chunk-oriented-processing/intercepting-execution.html