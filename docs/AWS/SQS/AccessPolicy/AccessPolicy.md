## 1 SQS Queue Access Policy

- Amazon Simple Queue Service(SQS)는 메시지를 송수신할 수 있는 완전 관리형 메시지 대기열 서비스입니다. 
- 이 글에서는 SQS Queue Access Policy에 대해 알아보고, 이를 통해 대기열에 대한 액세스 권한을 어떻게 제어할 수 있는지 설명하겠습니다.



## 2 SQS Queue Access Policy란?

- SQS Queue Access Policy는 대기열에 대한 액세스 권한을 제어하기 위해 사용됩니다.
- 이를 통해 특정 사용자, 그룹, 역할, AWS 서비스가 대기열에 접근할 수 있는 권한을 정의할 수 있습니다.
- Access Policy는 JSON 형식으로 작성되며, 다양한 조건을 설정할 수 있습니다.



## 3 SQS Queue Access Policy의 구성 요소

- SQS Queue Access Policy는 다음과 같은 주요 구성 요소로 이루어져 있습니다:
	- **Version**: 정책 문서의 버전을 정의합니다.
	- **Id**: 정책의 식별자를 정의합니다.
	- **Statement**: 하나 이상의 액세스 제어 규칙을 포함합니다.



**Statement의 구성 요소**

- **Effect**: 정책의 효과를 정의합니다. `Allow` 또는 `Deny` 값을 가질 수 있습니다.
- **Principal**: 정책이 적용되는 주체를 정의합니다. `*`는 모든 주체를 의미합니다.
- **Action**: 정책이 허용하거나 거부하는 작업을 정의합니다.
- **Resource**: 정책이 적용되는 리소스를 정의합니다. SQS 대기열의 ARN을 사용합니다.
- **Condition**: 정책이 적용되는 조건을 정의합니다



## 4 SQS Queue Access Policy 예시

```json
{
  "Version": "2012-10-17",
  "Id": "example-ID",
  "Statement": [
	{
	  "Effect": "Allow",
	  "Principal": {
		"AWS": "arn:aws:iam::123456789012:user/ExampleUser"
	  },
	  "Action": [
		"sqs:SendMessage",
		"sqs:ReceiveMessage",
		"sqs:DeleteMessage",
		"sqs:GetQueueAttributes"
	  ],
	  "Resource": "arn:aws:sqs:us-east-1:123456789012:ExampleQueue"
	}
  ]
}
```

- SQS Queue Access Policy의 예시입니다. 
- 이 정책은 특정 IAM 사용자가 SQS 대기열에서 메시지를 송수신할 수 있도록 허용합니다.



## 5 조건부 액세스 제어

```json
{
  "Version": "2012-10-17",
  "Id": "example-ID",
  "Statement": [
	{
	  "Effect": "Allow",
	  "Principal": {
		"AWS": "arn:aws:iam::123456789012:user/ExampleUser"
	  },
	  "Action": "sqs:SendMessage",
	  "Resource": "arn:aws:sqs:us-east-1:123456789012:ExampleQueue",
	  "Condition": {
		"IpAddress": {
		  "aws:SourceIp": "203.0.113.0/24"
		}
	  }
	}
  ]
}
```

- SQS Queue Access Policy는 **Condition** 키워드를 사용하여 조건부 액세스 제어를 설정할 수 있습니다. 
- 예를 들어, 특정 IP 주소에서만 대기열에 접근할 수 있도록 제한할 수 있습니다.



## 6 SQS Queue Access Policy 적용 방법

- SQS Queue Access Policy는 AWS Management Console, AWS CLI 또는 AWS SDK를 사용하여 적용할 수 있습니다. 
- AWS Management Console을 통해 정책을 적용하는 방법은 다음과 같습니다:


**적용 과정**

1. AWS Management Console에 로그인합니다.
2. SQS 서비스로 이동합니다.
3. 액세스 정책을 적용할 대기열을 선택합니다.
4. "Queue Actions"를 클릭한 후 "Edit Queue Permissions"를 선택합니다.
5. 정책을 입력하고 저장합니다.

AWS CLI를 통해 정책을 적용하는 방법은 다음과 같습니다:

```sh
aws sqs set-queue-attributes --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/ExampleQueue --attributes Policy='{"Version":"2012-10-17","Id":"example-ID","Statement":[{"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:user/ExampleUser"},"Action":["sqs:SendMessage","sqs:ReceiveMessage","sqs:DeleteMessage","sqs:GetQueueAttributes"],"Resource":"arn:aws:sqs:us-east-1:123456789012:ExampleQueue"}]}'
```



## 7 요약

- SQS Queue Access Policy는 대기열에 대한 액세스 권한을 제어하기 위한 강력한 도구입니다. 
- 이를 통해 특정 사용자, 그룹, 역할 또는 AWS 서비스가 대기열에 접근할 수 있는 권한을 정의할 수 있습니다. 
- 또한, 조건부 액세스 제어를 통해 보다 세밀한 권한 관리를 할 수 있습니다.