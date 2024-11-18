## 1 Kinesis Data Streams Consumers

- Kinesis Data Streams는 실시간 데이터 스트리밍을 위한 강력한 플랫폼입니다.
- 데이터 스트림에 기록된 데이터를 처리하고 분석하는 소비자(Consumer) 애플리케이션을 작성할 수 있습니다.



## 2 Consumer 유형

- **AWS Lambda**: 서버리스 컴퓨팅을 통해 데이터를 실시간으로 처리.
- **Kinesis Data Analytics**: SQL 쿼리를 사용하여 실시간 데이터 분석.
- **Kinesis Data Firehose**: 데이터를 지속적으로 캡처하여 Amazon S3, Redshift, Elasticsearch Service, Splunk로 전송.
- **Custom Consumer**:
	- **AWS SDK**: 클래식 또는 Enhanced Fan-Out.
	- **Kinesis Client Library(KCL)**: 데이터 스트림에서 데이터를 읽는 것을 단순화.



## 3 Shared Fan-Out Consumer

- **Shared Fan-Out Consumer**는 기본 소비자 유형입니다.
- 소비자 애플리케이션은 Kinesis Data Streams에서 데이터를 읽기 위해 샤드를 공유합니다.
- 각 샤드는 초당 최대 2MB의 데이터와 최대 5개의 읽기 요청을 처리할 수 있습니다.
- 읽기 처리량이 제한되므로 여러 소비자가 동일한 샤드를 공유하면 처리 속도가 느려질 수 있습니다.



### 3.1 Shared Fan-Out Consumer의 특징

- **낮은 소비자 애플리케이션 수**: 소수의 소비자 애플리케이션을 위해 최적화됨.
- **읽기 처리량**: 샤드당 초당 2MB 또는 최대 5개의 GetRecords API 호출.
- **지연 시간**: 약 200ms.
- **비용 절감**: 비용을 최소화함.
- **데이터 폴링**: 소비자가 GetRecords API 호출을 사용하여 Kinesis에서 데이터를 폴링.
- **데이터 반환**: 최대 10MB 또는 최대 10,000개의 레코드를 반환 (이후 5초 동안 스로틀링).



### 3.2 Shared Fan-Out Consumer 예시

- 온라인 쇼핑몰에서 주문 처리 시스템을 구현한다고 가정해 봅시다.
- 이 시스템은 Kinesis Data Stream을 사용하여 주문 데이터를 수집하고 처리합니다.
- 하나의 샤드에 여러 소비자 애플리케이션이 연결되어 있습니다:
    1. 주문 확인 애플리케이션
    2. 재고 관리 애플리케이션
    3. 배송 처리 애플리케이션



**작동 방식:**

- 각 애플리케이션은 주기적으로 Kinesis Data Stream에서 데이터를 폴링합니다.
- 샤드의 총 처리량(초당 2MB)을 세 애플리케이션이 공유합니다.
- 만약 주문 확인 애플리케이션이 1MB/s를 사용하면, 나머지 두 애플리케이션은 1MB/s를 공유해야 합니다.
- 피크 시간에 주문량이 증가하면, 애플리케이션들은 제한된 처리량으로 인해 지연될 수 있습니다.



## 4 Enhanced Fan-Out Consumer

- **Enhanced Fan-Out Consumer**는 소비자 애플리케이션이 데이터를 읽을 때 전용 읽기 처리량을 제공합니다.
- 각 소비자는 샤드당 초당 최대 2MB의 데이터와 최대 5개의 읽기 요청을 별도로 할당받습니다.
- 이를 통해 여러 소비자가 동시에 동일한 샤드에서 데이터를 읽을 때도 성능 저하 없이 실시간으로 데이터를 처리할 수 있습니다.
- Enhanced Fan-Out을 사용하려면 추가 비용이 발생하지만, 높은 처리량과 낮은 지연 시간을 보장합니다.



### 4.1 Enhanced Fan-Out Consumer의 특징

- **다수의 소비자 애플리케이션 지원**: 동일한 스트림에 대해 여러 소비자 애플리케이션 지원.
- **읽기 처리량**: 소비자별로 샤드당 초당 2MB의 데이터 처리.
- **지연 시간**: 약 70ms.
- **높은 비용**: 더 높은 비용 발생.
- **HTTP/2를 통한 데이터 푸시**: Kinesis가 SubscribeToShard API를 통해 HTTP/2로 데이터를 소비자에게 푸시.
- **소프트 리미트**: 데이터 스트림당 5개의 소비자 애플리케이션(KCL) 제한 (기본값).



### 4.2 Enhanced Fan-Out Consumer 예시

- 앞서 설명한 온라인 쇼핑몰의 주문 처리 시스템을 Enhanced Fan-Out Consumer로 개선해 봅시다.



**작동 방식:**

- 각 소비자 애플리케이션(주문 확인, 재고 관리, 배송 처리)은 Enhanced Fan-Out Consumer로 등록됩니다.
- 각 애플리케이션은 샤드로부터 독립적으로 초당 2MB의 데이터를 받을 수 있습니다.
- Kinesis는 HTTP/2를 통해 각 소비자에게 데이터를 직접 푸시합니다.
- 피크 시간에도 각 애플리케이션은 다른 애플리케이션의 처리 속도에 영향을 받지 않고 일정한 처리량을 유지할 수 있습니다.




## 5 데이터 처리

- 소비자 애플리케이션은 **GetRecords** API를 사용하여 Kinesis 데이터 스트림에서 데이터를 읽습니다.
- 데이터는 **Kinesis Client Library(KCL)** 또는 **AWS SDK**를 사용하여 처리할 수 있습니다.
- **KCL**은 샤드 분할, 재시도 로직, 체크포인팅 등을 자동으로 관리하여 데이터 처리를 단순화합니다.



## 6 KCL 예시

```java
public class SampleConsumer {
	public static void main(String[] args) {
		KinesisClientLibConfiguration config = new KinesisClientLibConfiguration(
			"sample-consumer",
			"sample-stream",
			credentialsProvider,
			workerId
		);

		IRecordProcessorFactory recordProcessorFactory = new SampleRecordProcessorFactory();
		Worker worker = new Worker.Builder()
			.recordProcessorFactory(recordProcessorFactory)
			.config(config)
			.build();

		worker.run();
	}
}
```

- 위 예시는 Kinesis Client Library(KCL)를 사용하여 Kinesis 데이터 스트림에서 데이터를 읽고 처리하는 Java 애플리케이션입니다.
- **KinesisClientLibConfiguration**을 사용하여 KCL을 구성하고, **Worker**를 생성하여 데이터를 처리합니다.



## 7 Kinesis Data Analytics

- Kinesis Data Streams에서 데이터를 실시간으로 처리하고 분석하는 데 **Kinesis Data Analytics**를 사용할 수 있습니다.
- SQL 쿼리를 사용하여 데이터 스트림에서 데이터를 변환하고, 집계하고, 필터링할 수 있습니다.
- **Kinesis Data Analytics**는 복잡한 데이터 처리 파이프라인을 쉽게 구축할 수 있도록 도와줍니다.



## 8 Kinesis Data Firehose

- Kinesis Data Streams에서 데이터를 지속적으로 캡처하여 **Amazon S3**, **Amazon Redshift**, **Amazon Elasticsearch Service**, **Splunk** 등으로 전송할 수 있습니다.
- Kinesis Data Firehose는 데이터를 실시간으로 로드하는 완전 관리형 서비스입니다.
- 데이터를 전송하기 전에 변환하고, 압축하고, 암호화할 수 있습니다.



## 9 데이터 보안

- Kinesis Data Streams는 전송 중인 데이터와 저장된 데이터를 암호화하여 보안성을 높입니다.
- AWS Key Management Service(KMS)를 사용하여 데이터 암호화 키를 관리할 수 있습니다.
- 데이터 액세스 권한을 제어하기 위해 IAM 정책을 사용할 수 있습니다.



## 10 예시 CloudFormation 템플릿

```yaml
Resources:
  MyKinesisStream:
	Type: "AWS::Kinesis::Stream"
	Properties:
	  ShardCount: 2
	  StreamName: "MyDataStream"

  MyKinesisConsumer:
	Type: "AWS::Kinesis::StreamConsumer"
	Properties:
	  StreamARN: !GetAtt MyKinesisStream.Arn
	  ConsumerName: "MyEnhancedConsumer"
```

- 위 예시는 두 개의 샤드를 가진 Kinesis 데이터 스트림과 Enhanced Fan-Out Consumer를 생성하는 CloudFormation 템플릿입니다.
