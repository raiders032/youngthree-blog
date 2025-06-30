## 1 Partitioning

- 스프링 배치에서의 파티셔닝(Partitioning)은 대량의 데이터를 병렬로 처리하여 성능을 향상시키는 핵심 기법입니다.
- 하나의 큰 작업을 여러 개의 작은 파티션으로 나누어, 각 파티션을 독립적인 스레드나 프로세스에서 동시에 처리할 수 있습니다.
- 스프링 배치는 이러한 파티셔닝 구현을 위해 Partitioner와 PartitionHandler 인터페이스를 제공합니다.

### 1.1 스프링 배치의 병렬 처리 방식들

- 파티셔닝 외에도 스프링 배치는 다양한 병렬 처리 방식을 지원합니다:
  - 멀티쓰레드 Step
  - Parallel Steps
  - Remote Chunking
- 이들은 모두 기존 스프링 배치 코드를 크게 변경하지 않고도 구현할 수 있으며, 풍부한 레퍼런스와 안정성을 바탕으로 운영 환경에서 검증된 방식들입니다.

### 1.2 Partitioning이란?

- 파티셔닝은 매니저(Manager) Step이 대량의 데이터 처리 작업을 여러 개의 작업자(Worker) Step으로 분할하여 처리하는 방식입니다.
- 매니저가 전체 데이터를 더 작은 단위의 파티션으로 나누면, 각 작업자 Step이 할당받은 파티션을 독립적으로 처리합니다.
- 이때 작업자 Step은 로컬 환경뿐만 아니라 원격 환경에서도 실행 가능하여, 확장된 JVM 환경에서의 분산 처리가 가능합니다.
- 파티셔닝의 핵심 개념
  - 매니저(Manager): 전체 작업을 분할하고 조율하는 역할
  - 작업자(Worker): 분할된 작업을 실제로 수행하는 Step
  - 파티션: 분할된 데이터 또는 작업 단위

### 1.3 Multi-threaded Step과 비교

- 멀티쓰레드 Step: 단일 Step 내에서 Chunk 단위로 쓰레드를 생성하여 분할 처리합니다.
- 파티셔닝: 독립적인 Worker Step을 구성하고, 각 Step이 별도의 StepExecution 파라미터 환경을 가지고 처리합니다.

:::info
파티셔닝은 로컬 환경에서 실행할 경우 멀티쓰레드로 작동하지만, 멀티쓰레드 Step과는 본질적으로 다릅니다. 파티셔닝에서는 각 Worker Step이 독립적인 실행 환경을 가지므로, ItemReader와 ItemWriter의 멀티쓰레드 환경 지원 여부가 중요하지 않습니다.
:::

## 2 주요 인터페이스

### 2.1 Partitioner

```java
public interface Partitioner {
    Map<String, ExecutionContext> partition(int gridSize);
}
```

- Partitioner 인터페이스는 파티셔닝된 Step (Worker Step)을 위한 Step Executions을 생성하는 인터페이스입니다.
- Partitioner는 데이터를 분할하는 로직을 정의하는 인터페이스입니다.
- 주로 데이터베이스, 파일, 또는 기타 데이터 소스를 기반으로 데이터를 여러 파티션으로 나누는 역할을 합니다.
- Partitioner는 `map<String, ExecutionContext>`를 반환하는 partition 메서드를 제공합니다.
- `gridSize`는 생성할 파티션의 수를 나타냅니다.
  - 즉 몇개의 StepExecution을 생성할지 정의히하는 값입니다.
  - 일반적으로 StepExecution당 하나의 Worker Step을 매핑하기 때문에 gridSize는 Worker Step의 개수를 의미합니다.
- 반환된 Map의 각 엔트리는 파티션의 이름(String)과 해당 파티션의 컨텍스트(ExecutionContext)를 포함합니다.

### 2.2 PartitionHandler

```java
public interface PartitionHandler {
    Collection<StepExecution> handle(StepExecutionSplitter stepSplitter, StepExecution stepExecution) throws Exception;
}
```

- PartitionHandler 인터페이스는 매니저 (마스터) Step이 Worker Step를 어떻게 다룰지를 정의하는 인터페이스입니다.
- PartitionHandler는 파티셔너가 생성한 파티션을 받아 각각의 파티션을 실행하는 역할을 합니다.
- PartitionHandler은 일반적으로 직접 구현하지 않고 스프링 배치에서 제공하는 구현체를 사용합니다.
  - TaskExecutorPartitionHandler: 단일 JVM 내에서 분할 개념을 사용할 수 있도록 같은 JVM 내에서 스레드로 분할 실행합니다.
  - MessageChannelPartitionHandler: 원격 환경에서 분할된 작업을 실행하기 위해 메시지 채널을 사용합니다.

## 참고

- https://www.codenary.co.kr/discoveries/7113
- https://jojoldu.tistory.com/550