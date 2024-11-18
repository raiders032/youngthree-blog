## 1 CloudFormation Stack Policies

- CloudFormation Stack Policies는 스택의 리소스를 보호하기 위해 적용할 수 있는 규칙 집합입니다. 
- 이를 통해 의도하지 않은 리소스 변경을 방지할 수 있습니다. 
- 이번 포스트에서는 Stack Policies의 개념과 사용법에 대해 알아보겠습니다.



## 2 Stack Policies란?

- Stack Policies는 CloudFormation 스택의 리소스를 보호하기 위해 사용됩니다.
- 특정 리소스에 대한 업데이트를 허용하거나 거부하는 규칙을 정의할 수 있습니다.
- 이를 통해 중요한 리소스가 실수로 수정되거나 삭제되는 것을 방지할 수 있습니다.



## 3 Stack Policies 사용법

```json
{
  "Statement": [
	{
	  "Effect": "Deny",
	  "Action": "Update:Modify",
	  "Principal": "*",
	  "Resource": "LogicalResourceId/MyImportantResource"
	}
  ]
}
```

- Stack Policies는 JSON 형식으로 정의되며, `AWS::CloudFormation::Stack` 리소스의 `StackPolicy` 속성에 적용됩니다.
- Stack Policy를 적용하려면 스택을 생성하거나 업데이트할 때 정책을 포함해야 합니다.
- 위 예제는 `MyImportantResource`라는 논리적 리소스 ID에 대한 업데이트를 거부하는 Stack Policy를 정의합니다.



## 4 Stack Policies의 주요 요소

- `Effect`: 정책의 효과를 정의합니다. `Allow` 또는 `Deny` 값을 가질 수 있습니다.
- `Action`: 정책이 적용되는 액션을 정의합니다. 예를 들어, `Update:Modify`는 리소스의 수정을 의미합니다.
- `Principal`: 정책이 적용되는 주체를 정의합니다. `*`은 모든 주체를 의미합니다.
- `Resource`: 정책이 적용되는 리소스를 정의합니다. 논리적 리소스 ID를 사용합니다.



## 5 Stack Policies 예시

### 5.1 특정 리소스 업데이트 금지 예시

```json
{
  "Statement": [
	{
	  "Effect": "Deny",
	  "Action": "Update:Modify",
	  "Principal": "*",
	  "Resource": "LogicalResourceId/MyImportantResource"
	}
  ]
}
```

- 위 정책은 `MyImportantResource` 리소스에 대한 모든 업데이트를 거부합니다.



### 5.2 특정 리소스 삭제 금지 예시

```json
{
  "Statement": [
	{
	  "Effect": "Deny",
	  "Action": "Update:Delete",
	  "Principal": "*",
	  "Resource": "LogicalResourceId/MyCriticalResource"
	}
  ]
}
```

- 위 정책은 `MyCriticalResource` 리소스에 대한 삭제를 거부합니다.



### 5.3 여러 리소스 보호 예시

```json
{
  "Statement": [
	{
	  "Effect": "Deny",
	  "Action": "Update:*",
	  "Principal": "*",
	  "Resource": [
		"LogicalResourceId/Resource1",
		"LogicalResourceId/Resource2"
	  ]
	}
  ]
}
```

- 위 정책은 `Resource1`과 `Resource2` 리소스에 대한 모든 업데이트를 거부합니다.



## 6 Stack Policies 적용 방법

- AWS Management Console, AWS CLI, 또는 AWS SDK를 사용하여 Stack Policy를 적용할 수 있습니다.
- 스택을 생성하거나 업데이트할 때 `--stack-policy-body` 또는 `--stack-policy-url` 옵션을 사용하여 Stack Policy를 지정할 수 있습니다.



### 6.1 AWS CLI를 통한 Stack Policy 적용 예시

```sh
aws cloudformation create-stack --stack-name my-stack --template-body file://template.json --stack-policy-body file://policy.json
```

- 위 명령어는 `template.json` 템플릿을 사용하여 `my-stack` 스택을 생성하고, `policy.json` 파일에 정의된 Stack Policy를 적용합니다.



## 7 요약

- Stack Policies는 CloudFormation 스택의 리소스를 보호하기 위해 사용됩니다.
- 특정 리소스에 대한 업데이트나 삭제를 허용하거나 거부하는 규칙을 정의할 수 있습니다.
- 이를 통해 중요한 리소스가 실수로 수정되거나 삭제되는 것을 방지할 수 있습니다.
