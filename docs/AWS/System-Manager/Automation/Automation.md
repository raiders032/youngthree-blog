## 1 AWS Systems Manager Automation 소개

- AWS Systems Manager Automation은 EC2 인스턴스 및 기타 AWS 리소스의 일반적인 유지 보수 및 배포 작업을 간소화하는 강력한 도구입니다. 
- 이 서비스를 통해 복잡한 운영 작업을 자동화하고 표준화할 수 있어 인프라 관리의 효율성과 일관성을 크게 향상시킬 수 있습니다.



## 2 Automation의 주요 기능

### 2.1 일반적인 작업 자동화

- Automation을 사용하면 다음과 같은 일반적인 작업을 쉽게 자동화할 수 있습니다:
	- EC2 인스턴스 재시작
	- Amazon Machine Image (AMI) 생성
	- EBS 스냅샷 생성
	- 패치 적용 및 소프트웨어 업데이트
	- AWS 리소스 구성 변경
- 이러한 작업을 자동화함으로써 수동 작업에 따른 오류를 줄이고 운영 효율성을 높일 수 있습니다.



### 2.2 Automation Runbook

- Automation의 핵심은 Automation Runbook입니다. 
- 이는 "Automation" 유형의 SSM Document로, EC2 인스턴스나 AWS 리소스에서 수행할 작업을 정의합니다.
- **사전 정의된 Runbook**: AWS는 많은 일반적인 작업에 대해 사전 정의된 Runbook을 제공합니다.
- **커스텀 Runbook**: 특정 요구사항에 맞는 사용자 정의 Runbook을 생성할 수 있습니다.
- Runbook은 YAML 또는 JSON 형식으로 작성되며, 파라미터, 단계, 조건부 분기 등을 포함할 수 있습니다.



## 3 Automation 실행 방법

- Automation Runbook은 다양한 방법으로 실행할 수 있어 유연성이 높습니다:



### 3.1 수동 실행

- AWS Management Console
- AWS CLI
- AWS SDK

이 방법은 즉각적인 작업 수행이 필요할 때 유용합니다.



**AWS CLI를 사용한 Runbook 실행 예시:**

```bash
aws ssm start-automation-execution \
    --document-name "AWS-RestartEC2Instance" \
    --parameters "InstanceId=i-1234567890abcdef0"
```



### 3.2 Amazon EventBridge를 통한 트리거

- 특정 이벤트 발생 시 자동으로 Automation을 실행할 수 있습니다.
	- 새로운 EC2 인스턴스가 시작될 때 자동으로 보안 설정을 적용
	- S3 버킷에 특정 파일이 업로드될 때 처리 워크플로우 시작



### 3.3 Maintenance Windows를 사용한 스케줄 실행

- 정기적인 유지 보수 작업을 위해 Maintenance Windows와 통합하여 특정 시간에 Automation을 실행할 수 있습니다.



### 3.4 AWS Config 규칙 교정

- AWS Config 규칙 위반 시 자동으로 Automation을 실행하여 문제를 해결할 수 있습니다.
- 예시
	- 비규격 보안 그룹 설정을 자동으로 수정
	- 태그 정책을 위반한 리소스에 자동으로 필수 태그 적용



## 4 Automation Runbook 예시

다음은 EC2 인스턴스를 재시작하고 상태를 확인하는 간단한 Automation Runbook 예시입니다:

```yaml
schemaVersion: '0.3'
description: 'Restart an EC2 instance and verify it's running'
parameters:
  InstanceId:
    type: 'String'
    description: 'The ID of the EC2 instance to restart'
mainSteps:
  - name: 'stopInstance'
    action: 'aws:changeInstanceState'
    inputs:
      InstanceIds: 
        - '{{InstanceId}}'
      DesiredState: 'stopped'
  - name: 'startInstance'
    action: 'aws:changeInstanceState'
    inputs:
      InstanceIds:
        - '{{InstanceId}}'
      DesiredState: 'running'
  - name: 'verifyInstanceRunning'
    action: 'aws:waitForAwsResourceProperty'
    inputs:
      Service: 'ec2'
      Api: 'DescribeInstances'
      InstanceIds:
        - '{{InstanceId}}'
      PropertySelector: '$.Reservations[0].Instances[0].State.Name'
      DesiredValues:
        - 'running'
```

- 이 Runbook은 지정된 EC2 인스턴스를 중지하고 다시 시작한 후, 인스턴스가 실제로 실행 중인지 확인합니다.



## 5 Automation의 장점

- **일관성**: 표준화된 프로세스를 통해 작업의 일관성을 보장합니다.
- **효율성**: 반복적인 작업을 자동화하여 시간과 리소스를 절약합니다.
- **오류 감소**: 수동 작업에 따른 인적 오류를 줄일 수 있습니다.
- **감사 및 규정 준수**: 모든 자동화 작업은 로깅되어 감사 및 규정 준수에 도움이 됩니다.
- **유연성**: 다양한 트리거 방식을 통해 여러 시나리오에 대응할 수 있습니다.



## 6 결론

- AWS Systems Manager Automation은 AWS 리소스 관리를 위한 강력하고 유연한 도구입니다. 
- 사전 정의된 Runbook을 활용하거나 사용자 정의 Runbook을 작성하여 다양한 운영 작업을 자동화할 수 있습니다. 
- 수동 실행부터 이벤트 기반 트리거, 예약 실행, 그리고 규정 준수 교정까지 다양한 실행 방식을 지원하여 거의 모든 운영 시나리오에 적용할 수 있습니다. 
- Automation을 효과적으로 활용하면 인프라 관리의 효율성, 안정성, 일관성을 크게 향상시킬 수 있으며, 이는 결과적으로 운영 비용 절감과 서비스 품질 향상으로 이어집니다.



**참고 자료**

- [AWS Systems Manager Automation 공식 문서](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-automation.html)
- [AWS Systems Manager Automation Runbook 참조](https://docs.aws.amazon.com/systems-manager-automation-runbooks/latest/userguide/automation-runbook-reference.html)