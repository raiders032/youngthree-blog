## 1 Amazon S3 Event Notifications

- Amazon S3 Event Notifications는 S3 버킷에서 발생하는 이벤트(예: 객체 생성, 삭제 등)에 대한 알림을 설정할 수 있는 기능입니다. 
- 이를 통해 S3 버킷의 변경 사항을 실시간으로 감지하고, 다양한 AWS 서비스(SNS, SQS, Lambda)와 통합하여 자동화된 워크플로우를 구현할 수 있습니다.
- S3 Event Notifications는 다양한 이벤트를 감지할 수 있습니다.
	- S3:ObjectCreated, S3:ObjectRemoved, S3:ObjectRestore, S3:Replication
- 객체 이름 필터링이 가능하여, 예를 들어 "jpg" 파일에 대해서만 이벤트를 트리거할 수 있습니다.
- 이 기능은 S3에 업로드된 이미지의 썸네일을 생성하는 등의 용도로 사용될 수 있습니다.
- 원하는 만큼 많은 S3 이벤트를 생성할 수 있습니다.
- S3 이벤트 알림은 일반적으로 몇 초 내에 이벤트를 전달하지만, 때때로 1분 이상 걸릴 수 있습니다.



### 1.1 주요 기능

- **실시간 알림**: 객체가 S3 버킷에 업로드되거나 삭제될 때, 이를 즉시 감지하여 알림을 보냅니다.
- **다양한 통합 옵션**: S3 이벤트를 SNS 주제, SQS 대기열, 또는 Lambda 함수로 전달할 수 있습니다.
- **자동화된 워크플로우**: 이벤트 기반의 자동화된 작업을 설정하여 운영 효율성을 높일 수 있습니다.



## 2 S3 Event Notifications 설정

- S3 Event Notifications를 설정하려면 먼저 이벤트를 수신할 SNS 주제, SQS 대기열, 또는 Lambda 함수를 준비해야 합니다. 
- 그런 다음 S3 버킷에 알림 설정을 추가합니다.



### 2.1 SNS 토픽과 통합

- SNS 토픽에 S3에서 메시지를 게시할 수 있는 권한을 부여하려면 다음과 같은 리소스 정책을 설정해야 합니다.

```json
{
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Allow",
    "Action": "SNS:Publish",
    "Principal": {
      "Service": "s3.amazonaws.com"
    },
    "Resource": "arn:aws:sns:us-east-1:123456789012:MyTopic",
    "Condition": {
      "ArnLike": {
        "aws:SourceArn": "arn:aws:s3:::MyBucket"
      }
    }
  }
}
```

- **Effect**: 허용할 작업을 정의합니다.
- **Action**: `SNS:Publish` – S3가 SNS 주제에 메시지를 게시할 수 있도록 허용합니다.
- **Principal**: `s3.amazonaws.com` 서비스가 작업을 수행할 수 있도록 지정합니다.
- **Resource**: SNS 주제의 ARN을 지정합니다.
- **Condition**: 작업이 지정된 S3 버킷에서만 수행되도록 조건을 설정합니다.



### 2.2 SQS 대기열과 통합

- SQS 대기열에 S3에서 메시지를 보낼 수 있는 권한을 부여하려면 다음과 같은 리소스 정책을 설정해야 합니다.

```json
{
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Allow",
    "Action": "SQS:SendMessage",
    "Principal": {
      "Service": "s3.amazonaws.com"
    },
    "Resource": "arn:aws:sqs:us-east-1:123456789012:MyQueue",
    "Condition": {
      "ArnLike": {
        "aws:SourceArn": "arn:aws:s3:::MyBucket"
      }
    }
  }
}
```

- **Effect**: 허용할 작업을 정의합니다.
- **Action**: `SQS:SendMessage` – S3가 SQS 대기열에 메시지를 보낼 수 있도록 허용합니다.
- **Principal**: `s3.amazonaws.com` 서비스가 작업을 수행할 수 있도록 지정합니다.
- **Resource**: SQS 대기열의 ARN을 지정합니다.
- **Condition**: 작업이 지정된 S3 버킷에서만 수행되도록 조건을 설정합니다.



### 2.3 Lambda 함수와 통합

- Lambda 함수에 S3에서 함수를 호출할 수 있는 권한을 부여하려면 다음과 같은 리소스 정책을 설정해야 합니다.

```json
{
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Allow",
    "Action": "lambda:InvokeFunction",
    "Principal": {
      "Service": "s3.amazonaws.com"
    },
    "Resource": "arn:aws:lambda:us-east-1:123456789012:function:MyFunction",
    "Condition": {
      "ArnLike": {
        "AWS:SourceArn": "arn:aws:s3:::MyBucket"
      }
    }
  }
}
```

- **Effect**: 허용할 작업을 정의합니다.
- **Action**: `lambda:InvokeFunction` – S3가 Lambda 함수를 호출할 수 있도록 허용합니다.
- **Principal**: `s3.amazonaws.com` 서비스가 작업을 수행할 수 있도록 지정합니다.
- **Resource**: Lambda 함수의 ARN을 지정합니다.
- **Condition**: 작업이 지정된 S3 버킷에서만 수행되도록 조건을 설정합니다.



### 2.4 Amazon EventBridge와 통합

- Amazon EventBridge (이전 이름: Amazon CloudWatch Events)는 S3 버킷 이벤트를 EventBridge로 전송하여 다양한 이벤트 기반 워크플로를 구성할 수 있습니다. 
- EventBridge 규칙을 사용하여 다른 AWS 서비스 및 엔드포인트로 이벤트를 라우팅할 수 있습니다.

1. **EventBridge 콘솔로 이동**: AWS Management Console에서 EventBridge 서비스를 선택합니다.
2. **규칙 생성**: 새로운 규칙을 생성합니다.
3. **이벤트 소스 선택**: 이벤트 소스로 S3를 선택합니다.
4. **대상 설정**: 이벤트가 전달될 대상을 선택합니다. 예를 들어, Lambda 함수, SQS 대기열, SNS 주제 등.
5. **규칙 활성화**: 규칙을 저장하고 활성화합니다.



## 3 S3 Event Notifications 설정 방법

1. **S3 콘솔로 이동**: AWS Management Console에서 S3 서비스를 선택합니다.
2. **버킷 선택**: 이벤트 알림을 설정할 버킷을 선택합니다.
3. **이벤트 알림 설정**: 버킷의 "Properties" 탭에서 "Event notifications" 섹션으로 이동하여 "Create event notification"을 클릭합니다.
4. **이벤트 정의**: 이벤트 이름을 지정하고, 트리거가 될 이벤트 유형(예: 객체 생성, 삭제 등)을 선택합니다.
5. **대상 선택**: 알림을 보낼 대상을 SNS 주제, SQS 대기열, 또는 Lambda 함수 중에서 선택합니다.
6. **필터 설정**: 알림이 적용될 객체의 Prefix 및 Suffix를 설정할 수 있습니다.
7. **저장**: 설정을 저장하여 알림을 활성화합니다.



## 4 결론

- Amazon S3 Event Notifications를 사용하면 S3 버킷의 변경 사항을 실시간으로 감지하고, 이를 SNS, SQS, Lambda 등과 통합하여 다양한 자동화 작업을 수행할 수 있습니다. 
- 올바른 IAM 권한 설정을 통해 안전하고 효율적인 이벤트 처리를 구현할 수 있습니다. 