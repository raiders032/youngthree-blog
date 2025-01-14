##  1 Spring Batch ChunkListener 개요

- Spring Batch에서 ChunkListener는 청크 처리 과정의 주요 이벤트를 감지하고 반응할 수 있게 해주는 인터페이스입니다.
- 청크(Chunk)란 Spring Batch에서 데이터를 처리할 때 사용하는 작은 데이터 덩어리를 의미합니다.
- ChunkListener를 사용하면 청크 처리의 시작, 성공, 실패 등의 이벤트를 모니터링하고 필요한 작업을 수행할 수 있습니다.



##  2 ChunkListener 인터페이스

- ChunkListener 인터페이스는 다음과 같은 메서드를 제공합니다:

```java
public interface ChunkListener extends StepListener {
    void beforeChunk(ChunkContext context);
    void afterChunk(ChunkContext context);
    void afterChunkError(ChunkContext context);
}
```

- `beforeChunk(ChunkContext context)`: 청크 처리 시작 전에 호출됩니다.
- `afterChunk(ChunkContext context)`: 청크 처리가 성공적으로 완료된 후 호출됩니다.
- `afterChunkError(ChunkContext context)`: 청크 처리 중 에러가 발생했을 때 호출됩니다.



##  3 ChunkListener 구현하기

- ChunkListener를 구현하는 방법은 크게 두 가지가 있습니다:
  1. ChunkListener 인터페이스를 직접 구현하는 방법
  2. 어노테이션을 사용하는 방법



###  3.1 인터페이스 구현 방식

- ChunkListener 인터페이스를 직접 구현하는 방법은 다음과 같습니다:

```java
public class MyChunkListener implements ChunkListener {

    @Override
    public void beforeChunk(ChunkContext context) {
        System.out.println("청크 처리를 시작합니다.");
    }

    @Override
    public void afterChunk(ChunkContext context) {
        System.out.println("청크 처리를 성공적으로 완료했습니다.");
    }

    @Override
    public void afterChunkError(ChunkContext context) {
        System.out.println("청크 처리 중 에러가 발생했습니다.");
    }
}
```

- 이 방식은 모든 메서드를 구현해야 하므로 코드가 다소 길어질 수 있습니다.
- 하지만 각 메서드에 대한 완전한 제어가 가능하며, 복잡한 로직을 구현하기에 적합합니다.



###  3.2 어노테이션 방식

- 어노테이션을 사용하면 더 간단하게 ChunkListener를 구현할 수 있습니다:

```java
public class MyChunkListener {

    @BeforeChunk
    public void beforeChunk(ChunkContext context) {
        System.out.println("청크 처리를 시작합니다.");
    }

    @AfterChunk
    public void afterChunk(ChunkContext context) {
        System.out.println("청크 처리를 성공적으로 완료했습니다.");
    }

    @AfterChunkError
    public void afterChunkError(ChunkContext context) {
        System.out.println("청