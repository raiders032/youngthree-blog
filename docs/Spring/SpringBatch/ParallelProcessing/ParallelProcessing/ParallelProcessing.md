## 1. Scaling and Parallel Processing

- 대부분의 배치 처리 문제는 단일 스레드, 단일 프로세스 작업으로 해결할 수 있습니다.
	- 더 복잡한 구현을 생각하기 전에 이것이 여러분의 요구사항을 충족하는지 먼저 제대로 확인하는 것이 우선입니다.
	- 현실적인 작업의 성능을 측정하고 가장 간단한 구현이 먼저 여러분의 요구사항을 충족하는지 확인해보세요.
	- 표준 하드웨어로도 수백 메가바이트의 파일을 1분 이내에 읽고 쓸 수 있습니다.

### 1.1 두 가지 접근법

- 높은 수준에서 보면, 병렬 처리에는 두 가지 모드가 있습니다
	- 단일 프로세스, 다중 스레드
	- 다중 프로세스
- 이들은 다음과 같이 카테고리로 나뉩니다:
  - 다중 스레드 Step (단일 프로세스)
  - 병렬 Steps (단일 프로세스)
  - Step의 원격 청킹 (다중 프로세스)
  - Step 파티셔닝 (단일 또는 다중 프로세스)

## 2. Multi-threaded Step(다중 스레드 Step)

- 병렬 처리를 시작하는 가장 간단한 방법은 Step 구성에 TaskExecutor를 추가하는 것입니다.
- Java 구성을 사용할 때는 다음 예시와 같이 step에 TaskExecutor를 추가할 수 있습니다

```java
@Bean
public TaskExecutor taskExecutor() {
    return new SimpleAsyncTaskExecutor("spring_batch");
}

@Bean
public Step sampleStep(TaskExecutor taskExecutor, JobRepository jobRepository, PlatformTransactionManager transactionManager) {
	return new StepBuilder("sampleStep", jobRepository)
				.<String, String>chunk(10, transactionManager)
				.reader(itemReader())
				.writer(itemWriter())
				.taskExecutor(taskExecutor)
				.build();
}
```

- 이 예시에서 taskExecutor는 TaskExecutor 인터페이스를 구현하는 다른 빈 정의에 대한 참조입니다. 
- TaskExecutor는 표준 Spring 인터페이스이므로, 사용 가능한 구현체의 세부사항은 Spring 사용자 가이드를 참조하세요. 
- 가장 간단한 다중 스레드 TaskExecutor는 SimpleAsyncTaskExecutor입니다.
  - SimpleAsyncTaskExecutor를 사용할 경우 쓰레드를 계속해서 생성할 수 있기 때문에 실제 운영 환경에서는 대형 장애를 발생시킬 수 있으니 주의해야 합니다.
- 구성의 결과는 Step이 각 아이템 청크(각 커밋 간격)를 별도의 실행 스레드에서 읽기, 처리, 쓰기를 실행한다는 것입니다. 
- 이는 아이템이 처리되는 순서가 고정되지 않으며, 청크가 단일 스레드 케이스와 비교했을 때 연속되지 않는 아이템을 포함할 수 있음을 의미합니다.

### 2.1 제한 사항

- 일반적인 배치 사용 사례에서 다중 스레드 Step 구현을 사용하는 데는 몇 가지 제한이 있습니다.
- Step의 많은 참여자들(예: reader와 writer)은 상태를 가집니다. 
- 상태가 스레드별로 분리되지 않으면, 이러한 컴포넌트들은 다중 스레드 Step에서 사용할 수 없습니다. 
- 특히, Spring Batch의 대부분의 reader와 writer는 다중 스레드 사용을 위해 설계되지 않았습니다.
- Spring Batch는 ItemWriter와 ItemReader의 일부 구현을 제공합니다.
  -  Javadoc을 확인해서 thread-safe한지 확인하세요.
- reader가 스레드 안전하지 않다면, 제공된 SynchronizedItemStreamReader로 장식하거나 자신만의 동기화 위임자에서 사용할 수 있습니다.
  - read() 호출을 동기화할 수 있고, 처리와 쓰기가 청크의 가장 비싼 부분인 한, 여러분의 step은 여전히 단일 스레드 구성보다 훨씬 빠르게 완료될 수 있습니다.

## 3. Parallel Steps(병렬 Steps)

- 병렬화가 필요한 애플리케이션 로직이 별개의 책임으로 나뉘고 개별 step에 할당될 수 있는 한, 단일 프로세스에서 병렬화할 수 있습니다. 
- 병렬 Step 실행은 구성하고 사용하기 쉽습니다.

## 4. Remote Chunking(원격 청킹)

- 원격 청킹에서는 Step 처리가 여러 프로세스에 걸쳐 분할되며, 일부 미들웨어를 통해 서로 통신합니다.

## 5. Partitioning(파티셔닝)

- Spring Batch는 또한 Step 실행을 파티셔닝하고 원격으로 실행하기 위한 SPI를 제공합니다. 
- 이 경우, 원격 참여자들은 로컬 처리를 위해 구성되고 사용될 수 있었던 Step 인스턴스들입니다.
- 자세한 내용은 아래 문서를 참고하세요.
  - [Partitioning.md](../Partitioning/Partitioning.md)

## 참고

- https://docs.spring.io/spring-batch/reference/scalability.html