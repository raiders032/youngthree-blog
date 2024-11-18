## 1 AWS Systems Manager Run Command 소개

- AWS Systems Manager Run Command는 AWS에서 관리형 인스턴스에 대한 명령을 실행하고 관리할 수 있는 강력한 도구입니다.
- 이 서비스는 AWS 계정의 EC2 인스턴스와 온프레미스 서버를 포함한 다양한 환경에서 명령을 중앙에서 실행할 수 있는 기능을 제공합니다.
- Run Command를 사용하면 SSH 접속 없이도 원격으로 명령을 실행할 수 있어 보안과 편의성이 향상됩니다.



### 1.1 AWS Systems Manager Run Command의 주요 기능

- **중앙 관리**: 다양한 인스턴스 및 서버에서 명령을 중앙에서 실행하고 관리할 수 있습니다.
- **보안 및 감사**: IAM과 통합되어 있으며, CloudTrail을 통해 모든 명령 실행 기록을 감사하고 추적할 수 있습니다.
- **다양한 명령 실행**: 쉘 스크립트, PowerShell 스크립트, Windows 명령 등 다양한 형식의 명령을 실행할 수 있습니다.
- **문서(Document) 실행**: 미리 정의된 스크립트나 명령 세트인 '문서'를 실행할 수 있습니다.
- **대규모 실행**: 리소스 그룹을 사용하여 여러 인스턴스에서 동시에 명령을 실행할 수 있습니다.
- **실행 제어**: 속도 제어 및 오류 제어 기능을 제공하여 대규모 실행 시 안전성을 보장합니다.
- **출력 관리**: 명령 실행 결과를 콘솔에서 확인하거나 S3 버킷 또는 CloudWatch Logs로 전송할 수 있습니다.
- **알림 기능**: SNS를 통해 명령 실행 상태(진행 중, 성공, 실패 등)에 대한 알림을 받을 수 있습니다.
- **이벤트 기반 실행**: EventBridge와 통합되어 특정 이벤트 발생 시 자동으로 명령을 실행할 수 있습니다.



## 2 리소스 그룹을 통한 대규모 명령 실행

- Run Command의 가장 강력한 기능 중 하나는 **리소스 그룹을 사용하여 여러 인스턴스에서 동시에 명령을 실행**할 수 있다는 점입니다.
- **리소스 그룹 정의**: 태그, AWS 계정, AWS 리전 등을 기준으로 리소스 그룹을 정의할 수 있습니다.
- **대규모 실행**: 수백, 수천 개의 인스턴스에 동시에 명령을 실행할 수 있어 대규모 인프라 관리가 용이합니다.
- **유연한 대상 지정**: 특정 애플리케이션 서버, 개발 환경, 프로덕션 환경 등을 그룹화하여 필요한 인스턴스 집합에만 명령을 실행할 수 있습니다.



**예시 사용 사례**

```bash
aws ssm send-command \
    --document-name "AWS-RunShellScript" \
    --targets "Key=tag:Environment,Values=Production" \
    --parameters commands=["yum update -y"] \
    --comment "Updating all production servers"
```

- 이 명령은 'Environment' 태그가 'Production'인 모든 인스턴스에서 yum update 명령을 실행합니다.



## 3 속도 제어 및 오류 제어

- 대규모 명령 실행 시 안전성과 신뢰성을 보장하기 위해 Run Command는 **속도 제어(Rate Control)와 오류 제어(Error Control) 기능**을 제공합니다.



### 3.1 속도 제어 (Rate Control)

- **동시성 제어**: 한 번에 명령을 실행할 수 있는 인스턴스의 수를 제한할 수 있습니다.
- **오류 임계값**: 특정 수 또는 비율의 인스턴스에서 오류가 발생하면 명령 실행을 중지할 수 있습니다.



### 3.2 오류 제어 (Error Control)

- **오류 발생 시 중지**: 지정된 수의 오류가 발생하면 추가 인스턴스에서의 명령 실행을 중지합니다.
- **오류 무시**: 일부 오류를 무시하고 계속 실행할 수 있도록 설정할 수 있습니다.



**예시 설정**

```bash
aws ssm send-command \
    --document-name "AWS-RunShellScript" \
    --targets "Key=tag:Environment,Values=Production" \
    --parameters commands=["yum update -y"] \
    --max-concurrency "10%" \
    --max-errors "5"
```

- 이 명령은 한 번에 전체 대상 인스턴스의 10%에서만 실행되며, 5개의 인스턴스에서 오류가 발생하면 실행을 중지합니다.



## 4 SSM Documents와의 통합

- Run Command는 **SSM Documents**와 긴밀하게 통합되어 있어, 복잡한 작업을 사전에 정의하고 재사용할 수 있습니다.
	- [[Documents]] 참고
- **문서 유형**: Run Command는 'Command' 유형의 SSM Documents를 사용합니다.
- **파라미터화**: Documents에 파라미터를 정의하여 실행 시 다양한 입력을 받을 수 있습니다.
- **버전 관리**: Documents의 버전을 관리하여 변경 이력을 추적하고 특정 버전을 실행할 수 있습니다.



**예시 SSM Document**

```yaml
schemaVersion: '2.2'
description: 'Install software and run security updates'
parameters:
  software:
    type: String
    description: 'Software package to install'
    default: 'httpd'
mainSteps:
  - action: 'aws:runShellScript'
    name: 'installSoftware'
    inputs:
      runCommand:
        - 'yum update -y'
        - 'yum install -y {{ software }}'
        - 'yum update --security -y'
```



**Document를 사용한 Run Command 실행**

```bash
aws ssm send-command \
    --document-name "Install-And-Update" \
    --parameters "software=nginx" \
    --targets "Key=tag:Role,Values=WebServer"
```

- 이 명령은 'Role' 태그가 'WebServer'인 모든 인스턴스에 nginx를 설치하고 보안 업데이트를 수행합니다.



## 5 결론

- AWS Systems Manager Run Command는 강력한 기능과 유연성을 제공하여 대규모 인프라 관리를 효율적으로 수행할 수 있게 해줍니다.
- **리소스 그룹**을 통해 수많은 인스턴스에 동시에 명령을 실행할 수 있어 대규모 운영이 가능합니다.
- **속도 제어와 오류 제어** 기능으로 안전하고 신뢰성 있는 명령 실행을 보장합니다.
- **SSM Documents와의 통합**으로 복잡한 작업을 표준화하고 재사용할 수 있어 일관성과 효율성을 높일 수 있습니다.
- 이러한 기능들을 활용하면 인프라 관리의 복잡성을 크게 줄이고, 대규모 환경에서도 빠르고 안전하게 작업을 수행할 수 있습니다.



**참고 자료**

- [AWS Systems Manager Run Command 공식 문서](https://docs.aws.amazon.com/systems-manager/latest/userguide/execute-remote-commands.html)
- [AWS Systems Manager 사용 사례](https://aws.amazon.com/systems-manager/features/)