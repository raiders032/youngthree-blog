## 1 CloudFormation CLI 기본 명령어

- AWS CloudFormation은 인프라를 코드로 관리할 수 있게 해주는 강력한 서비스입니다. 
- 이 블로그 포스트에서는 AWS CLI를 사용하여 CloudFormation 스택을 관리하는 방법에 대해 알아보겠습니다.
- AWS CLI를 통해 CloudFormation 스택을 생성, 업데이트, 삭제할 수 있습니다.
- 가장 자주 사용되는 명령어들은 다음과 같습니다:
	- `aws cloudformation create-stack`
	- `aws cloudformation update-stack`
	- `aws cloudformation delete-stack`
	- `aws cloudformation describe-stacks`



## 2 스택 생성하기

**create-stack 명령어 예시**

```bash
aws cloudformation create-stack \
    --stack-name my-new-stack \
    --template-body file://template.yaml \
    --parameters ParameterKey=KeyPairName,ParameterValue=MyKeyPair
```

- 스택을 생성하려면 `create-stack` 명령어를 사용합니다.
- 기본적인 사용법은 다음과 같습니다
- 이 명령어는 'my-new-stack'이라는 이름의 스택을 생성합니다.
- `--template-body` 옵션은 로컬 파일 시스템의 템플릿 파일을 지정합니다.
- `--parameters` 옵션을 통해 템플릿에 필요한 파라미터를 전달할 수 있습니다.



## 3 스택 업데이트하기

**update-stack 명령어 예시**

```bash
aws cloudformation update-stack \
    --stack-name my-existing-stack \
    --template-body file://updated-template.yaml \
    --parameters ParameterKey=KeyPairName,ParameterValue=MyNewKeyPair
```

- 기존 스택을 업데이트하려면 `update-stack` 명령어를 사용합니다.
- 사용법은 `create-stack`과 유사합니다:
- 이 명령어는 'my-existing-stack'이라는 이름의 스택을 업데이트합니다.
- 새로운 템플릿 파일과 업데이트된 파라미터를 지정할 수 있습니다.



## 4 롤백 비활성화 옵션

**롤백 비활성화 예시**

```bash
aws cloudformation create-stack \
    --stack-name my-no-rollback-stack \
    --template-body file://template.yaml \
    --disable-rollback
```

- 스택 생성 또는 업데이트 중 오류가 발생했을 때 기본적으로 CloudFormation은 롤백을 수행합니다.
- 하지만 때로는 오류가 발생해도 성공적으로 프로비저닝된 리소스를 보존해야 할 필요가 있습니다.
- 이럴 때 `--disable-rollback` 옵션을 사용할 수 있습니다.
- 이 옵션을 사용하면 오류 발생 시 CloudFormation이 롤백을 수행하지 않고 프로세스를 중지합니다.
- 성공적으로 생성된 리소스는 그대로 유지되어 디버깅에 도움이 될 수 있습니다.



## 5 스택 삭제하기

**delete-stack 명령어**

```bash
aws cloudformation delete-stack --stack-name my-stack-to-delete
```

- 스택을 삭제하려면 `delete-stack` 명령어를 사용합니다:
- 이 명령어는 지정된 스택과 관련된 모든 리소스를 삭제합니다.
- 삭제 전에 반드시 필요한 데이터를 백업하세요.



## 6 스택 상태 확인하기

**describe-stacks 명령어**

```bash
aws cloudformation describe-stacks --stack-name my-stack
```

- 스택의 현재 상태를 확인하려면 `describe-stacks` 명령어를 사용합니다:
- 이 명령어는 스택의 현재 상태, 출력값, 파라미터 등의 정보를 제공합니다.
- 스택 생성이나 업데이트 후 진행 상황을 모니터링하는 데 유용합니다.



## 7 주의사항 및 팁

- **롤백 비활성화 사용 시 주의**: `--disable-rollback` 옵션은 디버깅에 유용하지만, 부분적으로 생성된 리소스에 대한 수동 정리가 필요할 수 있습니다.
- **파라미터 파일 사용**: 많은 파라미터가 있는 경우, JSON 파일로 파라미터를 관리하고 `--parameters file://params.json` 형식으로 사용할 수 있습니다.
- **변경 세트 사용**: 중요한 업데이트 전에는 `create-change-set` 명령어로 변경 사항을 미리 확인하는 것이 좋습니다.
- **태그 활용**: `--tags Key=Environment,Value=Production` 형식으로 태그를 추가하여 리소스 관리를 용이하게 할 수 있습니다.



## 8 스택 이벤트 확인하기

**describe-stack-events 명령어**

```bash
aws cloudformation describe-stack-events --stack-name my-stack
```

- 스택의 상세 이벤트 로그를 확인하려면 `describe-stack-events` 명령어를 사용합니다.
- 이 명령어는 스택 생성, 업데이트, 삭제 과정에서 발생한 모든 이벤트를 시간 순서대로 보여줍니다.
- 이벤트 로그를 통해 리소스 생성 순서, 실패한 리소스, 에러 메시지 등을 파악할 수 있습니다.
- 이는 스택 작업 중 문제 해결과 디버깅에 매우 유용합니다.



**이벤트 로그 상세 보기**

```bash

aws cloudformation describe-stack-events \
    --stack-name my-stack \
    --query 'StackEvents[*].[Timestamp,ResourceStatus,ResourceType,LogicalResourceId,ResourceStatusReason]' \
    --output table
```

- 기본 명령어는 모든 이벤트를 반환하므로, 특정 정보를 필터링하여 볼 수 있습니다.
- 예를 들어, `--query` 옵션을 사용하여 원하는 필드만 선택할 수 있습니다:
- 이 명령어는 이벤트의 타임스탬프, 리소스 상태, 리소스 타입, 논리적 리소스 ID, 상태 변경 이유를 표 형태로 출력합니다.
- 주요 필드 설명:
    - **Timestamp**: 이벤트 발생 시간
    - **ResourceStatus**: 리소스의 현재 상태 (예: CREATE_IN_PROGRESS, CREATE_COMPLETE, CREATE_FAILED 등)
    - **ResourceType**: AWS 리소스의 타입 (예: AWS::EC2::Instance)
    - **LogicalResourceId**: 템플릿에서 정의한 리소스의 논리적 이름
    - **ResourceStatusReason**: 상태 변경의 이유나 에러 메시지



**활용 방법**

- **실시간 모니터링**: 스택 생성 또는 업데이트 중 주기적으로 이벤트 로그를 확인하여 진행 상황을 모니터링합니다.
- **에러 디버깅**: 리소스 생성 실패 시 `ResourceStatusReason`을 통해 에러 원인을 파악합니다.
- **자동화 스크립트 통합**: CI/CD 파이프라인에서 이 명령어를 사용하여 배포 상태를 추적하고 자동 알림을 설정할 수 있습니다.
- **이벤트 히스토리 분석**: 과거 스택 작업의 이력을 분석하여 인프라 관리 개선에 활용합니다.



**주의 사항**

- **이벤트 보존 기간**: CloudFormation 이벤트는 일정 기간 후에 삭제될 수 있으므로 필요한 경우 로그를 별도로 저장해야 합니다.
- **권한 설정**: 이 명령어를 실행하려면 해당 스택에 대한 `cloudformation:DescribeStackEvents` 권한이 필요합니다.



## 9 스택 목록 조회하기

**list-stacks 명령어**

```bash
aws cloudformation list-stacks
```

- 모든 스택(삭제된 스택 포함)의 목록을 조회하려면 `list-stacks` 명령어를 사용합니다.
- 이 명령어는 기본적으로 90일 이내의 모든 스택 이력을 보여줍니다.



**활성 스택만 조회하기**

```bash
aws cloudformation list-stacks \
--stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE
```

- 활성 상태의 스택만 조회하려면 `--stack-status-filter` 옵션을 사용합니다.
- 여러 상태를 지정하여 필터링할 수 있습니다.



**주요 특징 및 사용 팁**

- **이력 관리**: 삭제된 스택을 포함한 90일 간의 스택 이력을 제공하여 감사 및 문제 해결에 유용합니다.
- **필터링**: 다양한 상태 필터를 조합하여 원하는 스택만 조회할 수 있습니다.
- **출력 형식**: `--output` 옵션을 사용하여 json, table 등 다양한 형식으로 결과를 출력할 수 있습니다.
- **쿼리**: `--query` 옵션을 사용하여 특정 필드만 추출하거나 결과를 정렬할 수 있습니다.



**사용 예시 (JSON 출력 및 필드 선택)**

```bash
aws cloudformation list-stacks \
    --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
    --query 'StackSummaries[*].[StackName,StackStatus,CreationTime]' \
    --output json
```

- 이 명령어는 생성 완료 또는 업데이트 완료 상태의 스택 이름, 상태, 생성 시간만을 JSON 형식으로 출력합니다.



**주의사항**

- 대규모 환경에서는 많은 수의 스택이 반환될 수 있으므로, 필요에 따라 필터링을 적절히 사용하세요.
- 권한 설정: 이 명령어를 실행하려면 `cloudformation:ListStacks` 권한이 필요합니다.



## 10 결론

- AWS CLI를 통한 CloudFormation 관리는 인프라 자동화의 핵심입니다.
- 이러한 명령어들을 마스터하면 복잡한 인프라를 효율적으로 관리할 수 있습니다.
- 항상 최신 AWS CLI 버전을 사용하고, AWS 문서를 참조하여 새로운 기능과 옵션을 확인하세요.
- 실제 환경에 적용하기 전에 테스트 환경에서 충분히 연습하는 것이 중요합니다.