## 1 Amazon SQS 설정 가이드

- Amazon Simple Queue Service (SQS)는 분산 시스템의 구성 요소 간 메시지를 안정적으로 전송, 저장, 수신할 수 있는 완전 관리형 메시지 대기열 서비스입니다. 
	- [[SQS]] 참고
- SQS를 효과적으로 활용하기 위해 설정할 수 있는 몇 가지 중요한 옵션에 대해 알아보겠습니다.



## 2 Delay Queue

- Delay Queue는 메시지가 큐에 도착한 후 일정 시간이 지나야 소비자가 접근할 수 있도록 지연시키는 기능입니다.



### 2.1 Delay Queue 주요 기능

- **메시지 지연**: 메시지를 큐에 추가한 후 즉시 처리하지 않고 지정된 시간이 지난 후에 처리할 수 있습니다.
- **큐 수준 지연**: 큐 생성 시 지연 시간을 설정하여 해당 큐의 모든 메시지에 대해 동일한 지연 시간을 적용할 수 있습니다.
- **메시지 수준 지연**: 개별 메시지마다 지연 시간을 설정하여 큐의 다른 메시지와는 별도로 지연 시간을 설정할 수 있습니다.



### 2.2 Delay Queue 설정 방법

#### 2.2.1 콘솔을 사용한 큐 수준 지연 설정

1. AWS Management Console에 로그인합니다.
2. Amazon SQS 콘솔로 이동합니다.
3. "Create queue" 버튼을 클릭하여 새 큐를 생성합니다.
4. 큐 이름을 입력하고 "Delay Seconds" 필드에 원하는 지연 시간을 설정한 후 "Create Queue"를 클릭합니다.



#### 2.2.2 클라우드포메이션 템플릿을 사용한 큐 수준 지연 설정

```yaml
Resources:
  MyQueue:
	Type: "AWS::SQS::Queue"
	Properties:
	  QueueName: "MyDelayQueue"
	  DelaySeconds: 60
```

- 다음은 CloudFormation 템플릿을 사용하여 SQS 큐를 생성하는 예제입니다
- 위 예제에서는 CloudFormation 템플릿을 사용하여 "MyDelayQueue"라는 이름의 SQS 큐를 생성하고, 큐에 추가된 모든 메시지가 60초 동안 지연됩니다.



#### 2.2.3 콘솔을 사용한 메시지 수준 지연 설정

1. AWS Management Console에 로그인합니다.
2. Amazon SQS 콘솔로 이동합니다.
3. 메시지를 보내려는 큐를 선택합니다.
4. "Send and receive messages"를 클릭합니다.
5. "Message body"에 메시지를 입력하고 "Delay delivery" 필드에 원하는 지연 시간을 입력한 후 "Send message"를 클릭합니다.



#### 2.2.4 AWS CLI를 사용한 메시지 수준 지연 설정

```sh
aws sqs send-message --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue --message-body "Hello World" --delay-seconds 30
```

- 다음은 AWS CLI를 사용하여 메시지 수준 지연을 설정하는 예제입니다:
- 위 예제에서는 "Hello World" 메시지가 큐에 추가된 후 30초 동안 지연됩니다



## 3 Long Polling

- Long Polling은 메시지가 없을 때 일정 시간 동안 대기하여 메시지가 도착하면 즉시 반환하는 기능입니다. 
- 이를 통해 빈 응답을 줄이고 비용을 절감하며 애플리케이션 성능을 향상시킬 수 있습니다.



### 3.1 Long Polling 주요 기능

- **메시지 대기 시간**: 큐에서 메시지를 검색할 때 최대 20초까지 대기할 수 있습니다.
- **비용 절감**: 빈 응답을 줄여 요청 횟수를 줄임으로써 비용을 절감할 수 있습니다.
- **성능 향상**: 클라이언트 애플리케이션이 지속적으로 폴링하지 않아도 되므로, 네트워크 및 시스템 리소스 사용을 최적화할 수 있습니다.



### 3.2 Long Polling 설정 방법

#### 3.2.1 콘솔을 사용한 큐 수준 Long Polling 설정

1. AWS Management Console에 로그인합니다.
2. Amazon SQS 콘솔로 이동합니다.
3. 설정하려는 큐를 선택합니다.
4. "Edit" 버튼을 클릭합니다.
5. "Receive Message Wait Time" 필드에 원하는 대기 시간을 입력한 후 저장합니다.



#### 3.2.2 클라우드포메이션 템플릿을 사용한 큐 수준 Long Polling 설정

```yaml
Resources:
  MyQueue:
	Type: "AWS::SQS::Queue"
	Properties:
	  QueueName: "MyQueue"
	  ReceiveMessageWaitTimeSeconds: 20
```

- 다음은 CloudFormation 템플릿을 사용하여 SQS 큐를 생성하는 예제입니다
- 위 예제에서는 CloudFormation 템플릿을 사용하여 큐의 메시지를 검색할 때 최대 20초 동안 대기합니다.



#### 3.2.3 AWS CLI를 사용한 개별 메시지 요청에 Long Polling 설정

```sh
aws sqs receive-message --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue --wait-time-seconds 20
```

- 다음은 AWS CLI를 사용하여 개별 메시지 요청에 Long Polling을 설정하는 예제입니다:
- 위 예제에서는 해당 요청에 대해 최대 20초 동안 메시지를 대기합니다.



## 4 DLQ(Dead-Letter Queue)

- DLQ는 메시지 처리 실패 시 메시지를 저장하는 기능을 제공합니다. 
- 이를 통해 디버깅 및 재처리할 수 있는 유용한 도구를 제공합니다.



### 4.1 DLQ 주요 기능

- 네트워크 문제나 코드 오류 등으로 인해 메시지가 처리되지 않는 경우 발생할 수 있는 문제를 해결합니다.
- 실패한 메시지를 저장하여 나중에 다시 처리하거나 분석할 수 있습니다.
- 모든 메시지가 최종적으로 처리되도록 보장할 수 있습니다.
- [[Dead-Letter-Queue]] 참고



### 4.2 DLQ 설정 방법

#### 4.2.1 새로운 큐 생성

1. AWS Management Console에 로그인합니다.
2. Amazon SQS 콘솔로 이동합니다.
3. "Create queue" 버튼을 클릭하여 새 큐를 생성합니다.
4. 큐 이름을 입력하고 필요한 설정을 완료한 후 "Create Queue"를 클릭합니다.



#### 4.2.2 DLQ로 설정

1. 소스 큐를 선택하고 "Edit" 버튼을 클릭합니다.
2. "Redrive policy" 섹션에서 "Configure dead-letter queue"를 클릭합니다.
3. 생성한 큐를 DLQ로 선택합니다.
4. `maxReceiveCount` 값을 설정합니다. 이 값은 메시지가 소스 큐에서 최대 몇 번까지 수신될 수 있는지를 정의합니다.
5. 설정을 저장합니다.



## 5 SQS Extended Client

- Amazon SQS Extended Client는 SQS 메시지 크기 제한(256KB)을 극복하기 위해 Amazon S3를 사용하여 큰 메시지를 저장하는 기능을 제공합니다. 
- 이 클라이언트를 사용하면 SQS 메시지가 최대 2GB까지 커질 수 있습니다.



### 5.1 주요 기능

- **큰 메시지 지원**: SQS의 기본 메시지 크기 제한(256KB)을 넘는 메시지를 처리할 수 있습니다.
- **S3에 메시지 저장**: 큰 메시지를 S3에 저장하고, SQS 메시지에는 S3 객체의 참조를 포함합니다.
- **투명한 처리**: 클라이언트는 S3에 저장된 메시지를 자동으로 관리하므로, 애플리케이션 코드를 크게 변경할 필요가 없습니다.



### 5.2 사용 방법

```java
// S3 클라이언트 생성
AmazonS3 s3 = new AmazonS3Client();

// SQS 클라이언트 생성
AmazonSQS sqs = new AmazonSQSClient();

// SQS Extended 클라이언트 설정
ExtendedClientConfiguration extendedClientConfig = new ExtendedClientConfiguration()
	.withLargePayloadSupportEnabled(s3, "MyS3Bucket")
	.withMessageSizeThreshold(256 * 1024); // 256KB

// SQS Extended 클라이언트 생성
AmazonSQSExtendedClient extendedSqs = new AmazonSQSExtendedClient(sqs, extendedClientConfig);

// 메시지 전송
extendedSqs.sendMessage(new SendMessageRequest()
	.withQueueUrl("https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue")
	.withMessageBody("This is a large message that will be stored in S3"));
```

- 위 예제에서는 큰 메시지를 S3에 저장하고, 해당 참조를 SQS 메시지로 전송하는 방법을 보여줍니다.



## 6 SQS 사용 사례

### 6.1 Delay Queue 사용 사례

- **배치 작업**: 특정 시간 이후에 시작해야 하는 배치 작업을 예약할 때 유용합니다.
- **재시도 로직**: 오류 발생 시 일정 시간이 지난 후 다시 시도하는 로직에 사용할 수 있습니다.
- **시간 기반 이벤트**: 일정 시간이 지난 후에 발생해야 하는 이벤트를 트리거할 때 유용합니다.



### 6.2 Long Polling 사용 사례

- **비동기 작업 처리**: 메시지가 도착할 때까지 대기하므로, 비동기 작업 처리에 적합합니다.
- **비용 절감**: 빈 응답을 줄여 요청 횟수를 줄임으로써 비용을 절감할 수 있습니다.
- **효율적인 자원 사용**: 클라이언트 애플리케이션이 지속적으로 폴링하지 않아도 되므로, 네트워크 및 시스템 리소스 사용을 최적화할 수 있습니다.



### 6.3 DLQ 사용 사례

- **에러 메시지 격리**: 처리할 수 없는 메시지를 격리하여 시스템의 안정성을 높일 수 있습니다.
- **디버깅 및 재처리**: 실패한 메시지를 저장하여 나중에 다시 처리하거나 분석할 수 있습니다.
- **메시지 손실 방지**: 모든 메시지가 최종적으로 처리되도록 보장할 수 있습니다.



## 7 결론

- Amazon SQS는 다양한 설정 옵션을 제공하여 메시지 전송 및 처리 시스템을 유연하게 구축할 수 있도록 합니다. 
- Delay Queue, Long Polling, DLQ 및 SQS Extended Client를 활용하면 더욱 안정적이고 효율적인 메시지 처리 시스템을 구축할 수 있습니다. 
- 이러한 기능들을 적절히 활용하여 애플리케이션의 성능과 신뢰성을 높일 수 있습니다.
