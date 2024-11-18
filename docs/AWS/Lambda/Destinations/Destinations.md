## 1 AWS Lambda Destinations 소개

- AWS Lambda Destinations은 Lambda 함수의 실행 결과를 다른 AWS 서비스로 쉽게 전송할 수 있게 해주는 기능입니다.
- 이 기능을 사용하면 함수 실행 후 추가적인 로직 없이도 결과를 지정된 대상으로 자동으로 보낼 수 있습니다.
- Destinations을 사용하면 서버리스 애플리케이션의 워크플로우를 더 간단하고 효율적으로 구성할 수 있습니다.



## 2 Destinations의 주요 특징

- Lambda Destinations은 함수의 비동기 호출(Asynchronous invocation)과 이벤트 소스 매핑 호출(Event source mapping invocation)에 대해 구성할 수 있습니다.
- 함수 실행 결과에 따라 성공과 실패 시나리오를 각각 다르게 처리할 수 있습니다.
- 지원되는 대상은 호출 유형에 따라 다릅니다:
	- 비동기 호출: Lambda 함수, Amazon SQS, Amazon SNS, Amazon EventBridge
	- 이벤트 소스 매핑 호출: Amazon SNS, Amazon SQS
- Destinations을 사용하면 함수 코드 내에서 직접 결과를 처리하는 로직을 줄일 수 있어 코드 복잡성이 감소합니다.



## 3 Destinations 설정 방법

- Lambda 함수의 Destinations은 AWS Management Console, AWS CLI, 또는 AWS SDK를 통해 설정할 수 있습니다.
- 함수 구성 시 "비동기 호출" 또는 "이벤트 소스 매핑" 섹션에서 Destinations을 지정할 수 있습니다.
- 호출 유형에 따라 사용 가능한 Destination type이 다르므로 주의해야 합니다.



**AWS CLI를 사용한 비동기 호출 Destinations 설정 예시**

```bash
aws lambda put-function-event-invoke-config \
    --function-name my-function \
    --destination-config '{"OnSuccess":{"Destination": "arn:aws:sqs:us-east-2:123456789012:destination"},"OnFailure":{"Destination": "arn:aws:sns:us-east-2:123456789012:destination"}}'
```

- 이 명령어는 'my-function'이라는 Lambda 함수에 대해 비동기 호출 시 성공은 SQS 큐로, 실패는 SNS 토픽으로 결과를 전송하도록 설정합니다.



**AWS CLI를 사용한 이벤트 소스 매핑 Destinations 설정 예시**

```bash
aws lambda create-event-source-mapping \
    --function-name my-function \
    --event-source-arn arn:aws:sqs:us-east-2:123456789012:source-queue \
    --destination-config '{"OnFailure":{"Destination": "arn:aws:sqs:us-east-2:123456789012:destination-queue"}}'
```

- 이 명령어는 'my-function'이라는 Lambda 함수에 대해 이벤트 소스 매핑 호출 시 실패 케이스에 대해 SQS 큐로 결과를 전송하도록 설정합니다.



## 4 Destinations 사용 시나리오

### 4.1 비동기 호출 시나리오

#### 4.1.1 성공 시나리오

- 함수가 성공적으로 실행되면 결과를 지정된 "성공" 대상으로 전송합니다.
- 예: 이미지 처리 함수가 성공적으로 실행된 후 처리된 이미지의 메타데이터를 SQS 큐로 전송



#### 4.1.2 실패 시나리오

- 함수 실행이 실패하면 오류 정보를 지정된 "실패" 대상으로 전송합니다.
- 예: 데이터 처리 함수가 실패하면 오류 상세 정보를 SNS 토픽으로 전송하여 관리자에게 알림



### 4.2 이벤트 소스 매핑 호출 시나리오

#### 4.2.1 실패 시나리오

- 이벤트 처리가 실패하면 실패한 레코드 정보를 지정된 "실패" 대상으로 전송합니다.
- 예: Kinesis 스트림에서 데이터 처리 중 실패한 레코드를 SQS 데드 레터 큐로 전송



## 5 Destinations의 이점

- **간소화된 아키텍처**: 추가적인 코드 없이 함수 실행 결과를 다른 서비스로 쉽게 전달할 수 있습니다.
- **오류 처리 개선**: 실패 케이스에 대한 자동화된 처리가 가능해져 시스템의 안정성이 향상됩니다.
- **운영 부담 감소**: 함수 결과 처리를 위한 추가 인프라 구성이 필요 없어 운영 부담이 줄어듭니다.
- **가시성 향상**: 함수 실행 결과를 명확하게 추적할 수 있어 시스템 모니터링이 용이해집니다.



## 6 Destinations 사용 시 주의사항

- 비동기 호출과 이벤트 소스 매핑 호출에 대해 사용 가능한 Destination type이 다릅니다.
- 비동기 호출의 경우 함수의 실행 시간이 최대 실행 시간(15분)을 초과하면 Destinations으로 전송되지 않습니다.
- 이벤트 소스 매핑 호출의 경우 실패 시나리오에 대해서만 Destinations을 구성할 수 있습니다.
- Destinations 설정 시 IAM 권한을 적절히 설정해야 합니다. Lambda 함수가 지정된 대상에 접근할 수 있는 권한이 필요합니다.



## 7 Destinations 사용 예시

### 7.1 비동기 호출 예시

- 다음은 이미지 처리 워크플로우에서 비동기 호출 Destinations을 활용하는 예시입니다:

1. S3 버킷에 이미지가 업로드됩니다.
2. 이벤트 트리거로 Lambda 함수가 비동기적으로 호출됩니다.
3. Lambda 함수가 이미지를 처리합니다.
4. 처리 성공 시:
   - 처리된 이미지 메타데이터를 SQS 큐로 전송합니다.
   - 다른 Lambda 함수가 큐를 폴링하여 메타데이터를 데이터베이스에 저장합니다.
5. 처리 실패 시:
   - 오류 정보를 SNS 토픽으로 전송합니다.
   - 관리자가 SNS 구독을 통해 오류 알림을 받습니다.

### 7.2 이벤트 소스 매핑 호출 예시

- 다음은 Kinesis 스트림 처리에서 이벤트 소스 매핑 Destinations을 활용하는 예시입니다:

1. Kinesis 스트림으로 데이터가 지속적으로 유입됩니다.
2. Lambda 함수가 Kinesis 스트림을 이벤트 소스로 사용하여 데이터를 처리합니다.
3. 처리 성공 시:
   - 정상적으로 처리된 데이터는 그대로 다음 단계로 진행됩니다.
4. 처리 실패 시:
   - 실패한 레코드 정보를 SQS 데드 레터 큐로 전송합니다.
   - 별도의 프로세스가 데드 레터 큐를 모니터링하여 실패한 레코드를 재처리하거나 분석합니다.



## 8 결론

- AWS Lambda Destinations은 서버리스 아키텍처에서 워크플로우를 간소화하고 효율성을 높이는 강력한 도구입니다.
- 비동기 호출과 이벤트 소스 매핑 호출에 대해 각각 다른 Destination 옵션을 제공하여 다양한 시나리오에 대응할 수 있습니다.
- 함수 실행 결과를 자동으로 처리함으로써 개발자는 비즈니스 로직에 더 집중할 수 있습니다.
- 오류 처리와 모니터링을 개선하여 애플리케이션의 안정성과 가시성을 향상시킬 수 있습니다.
- Destinations을 효과적으로 활용하면 더 견고하고 유지보수가 용이한 서버리스 애플리케이션을 구축할 수 있습니다.