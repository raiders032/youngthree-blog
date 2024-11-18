## 1 AWS Systems Manager 소개

- AWS Systems Manager는 AWS 클라우드와 온프레미스 인프라를 관리하기 위한 통합 관리 도구입니다.
- 이 서비스는 애플리케이션과 인프라를 안전하게 운영 및 관리하고, 소프트웨어 인벤토리를 관리하며, 패치를 적용하는 등 다양한 기능을 제공합니다.
- Systems Manager를 사용하면 운영 작업을 자동화하고, 보안을 강화하며, 비용을 절감할 수 있습니다.



## 2 주요 기능

### 2.1 운영 관리

- Systems Manager는 AWS 리소스의 운영 상태를 모니터링하고 관리하는 데 도움을 줍니다.
- 주요 기능으로는 자동화된 대시보드, 인시던트 관리, 변경 관리 등이 있습니다.



### 2.2 애플리케이션 관리

- 애플리케이션의 배포와 구성을 관리하는 기능을 제공합니다.
- 파라미터 스토어를 통해 구성 데이터를 안전하게 저장하고 관리할 수 있습니다.



### 2.3 변경 관리

- 인프라와 애플리케이션의 변경 사항을 추적하고 관리할 수 있습니다.
- 변경 요청, 승인 프로세스, 자동화된 변경 구현 등을 지원합니다.



### 2.4 노드 관리

- EC2 인스턴스, 온프레미스 서버, 가상 머신 등 다양한 유형의 노드를 관리할 수 있습니다.
- 패치 관리, 인벤토리 관리, 원격 액세스 등의 기능을 제공합니다.



## 3 Systems Manager 구성 요소

### 3.1 Fleet Manager

- Fleet Manager는 EC2 인스턴스와 온프레미스 서버를 포함한 전체 서버 플릿을 관리하는 통합 사용자 인터페이스입니다.
- 이를 통해 서버의 상태를 모니터링하고, 문제를 해결하며, 소프트웨어를 관리할 수 있습니다.



### 3.2 Run Command

- Run Command를 사용하면 여러 EC2 인스턴스나 온프레미스 서버에서 동시에 명령을 실행할 수 있습니다.
- 이는 소프트웨어 업데이트, 구성 변경, 문제 해결 등에 유용합니다.
- [[Run-Command]] 참고



### 3.3 Patch Manager

- Patch Manager는 운영 체제와 애플리케이션의 패치 적용 프로세스를 자동화합니다.
- 패치 적용 일정을 설정하고, 패치 적용 상태를 모니터링할 수 있습니다.
- [[Patch-Manager]] 참고



### 3.4 State Manager

- State Manager는 인스턴스의 구성 상태를 유지하는 데 도움을 줍니다.
- 예를 들어, 특정 소프트웨어가 항상 설치되어 있고 실행 중인지 확인할 수 있습니다.



### 3.5 Inventory

- Inventory는 관리형 인스턴스의 소프트웨어 인벤토리를 수집하고 관리합니다.
- 이를 통해 어떤 소프트웨어가 설치되어 있는지, 버전은 무엇인지 등을 쉽게 파악할 수 있습니다.
- [[Systems-Manager-Inventory]] 참고



### 3.6 Automation

- Automation은 일반적인 유지 관리 및 배포 작업을 자동화하는 데 사용됩니다.
- 예를 들어, EC2 인스턴스의 AMI 생성, 패치 적용, VPC 설정 등을 자동화할 수 있습니다.



## 4 Systems Manager 설정

### 4.1 IAM 권한 설정

- Systems Manager를 사용하기 위해서는 적절한 IAM 권한이 필요합니다.
- EC2 인스턴스에 Systems Manager 에이전트를 설치하고 관리할 수 있는 권한이 필요합니다.



**IAM 정책 예시**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:DescribeAssociation",
                "ssm:GetDeployablePatchSnapshotForInstance",
                "ssm:GetDocument",
                "ssm:DescribeDocument",
                "ssm:GetManifest",
                "ssm:GetParameter",
                "ssm:GetParameters",
                "ssm:ListAssociations",
                "ssm:ListInstanceAssociations",
                "ssm:PutInventory",
                "ssm:PutComplianceItems",
                "ssm:PutConfigurePackageResult",
                "ssm:UpdateAssociationStatus",
                "ssm:UpdateInstanceAssociationStatus",
                "ssm:UpdateInstanceInformation"
            ],
            "Resource": "*"
        }
    ]
}
```

- 이 정책은 Systems Manager의 기본적인 작업을 수행할 수 있는 권한을 부여합니다.



### 4.2 Systems Manager 에이전트 설치

- EC2 인스턴스나 온프레미스 서버에서 Systems Manager를 사용하려면 SSM Agent를 설치해야 합니다.
- 최신 Amazon Linux 2 AMI에는 SSM Agent가 기본적으로 설치되어 있습니다.



**Ubuntu에 SSM Agent 설치 예시**

```bash
wget https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/debian_amd64/amazon-ssm-agent.deb
sudo dpkg -i amazon-ssm-agent.deb
sudo systemctl enable amazon-ssm-agent
sudo systemctl start amazon-ssm-agent
```

- 이 명령어들은 Ubuntu 서버에 SSM Agent를 다운로드하고 설치한 후 실행합니다.



## 5 Systems Manager 활용 사례

### 5.1 대규모 패치 관리

- Patch Manager를 사용하여 수백 또는 수천 대의 서버에 동시에 보안 패치를 적용할 수 있습니다.
- 패치 적용 기준을 설정하고, 패치 적용 시간을 예약할 수 있습니다.



### 5.2 구성 관리 자동화

- State Manager를 사용하여 서버의 구성 상태를 일관되게 유지할 수 있습니다.
- 예를 들어, 모든 웹 서버에 특정 설정 파일이 항상 존재하도록 할 수 있습니다.



### 5.3 운영 자동화

- Automation을 사용하여 복잡한 운영 작업을 자동화할 수 있습니다.
- 예를 들어, 새로운 EC2 인스턴스를 생성하고, 필요한 소프트웨어를 설치하고, 네트워크 설정을 구성하는 전체 프로세스를 자동화할 수 있습니다.



### 5.4 보안 강화

- Systems Manager를 사용하여 보안 정책을 적용하고 모니터링할 수 있습니다.
- 예를 들어, 모든 서버에 특정 보안 설정이 적용되어 있는지 확인하고, 위반 사항을 자동으로 수정할 수 있습니다.



## 6 모범 사례

- Systems Manager를 효과적으로 사용하기 위한 몇 가지 모범 사례를 소개합니다.



### 6.1 태그 사용

- EC2 인스턴스와 기타 리소스에 태그를 적절히 사용하세요.
- 태그를 통해 Systems Manager 작업의 대상을 쉽게 지정할 수 있습니다.



### 6.2 최소 권한 원칙 적용

- IAM 정책을 설정할 때 최소한의 필요한 권한만 부여하세요.
- 이는 보안을 강화하고 의도하지 않은 작업을 방지하는 데 도움이 됩니다.



### 6.3 자동화 문서 버전 관리

- Automation 문서를 사용할 때는 버전 관리를 철저히 하세요.
- 이를 통해 변경 사항을 추적하고 필요시 이전 버전으로 롤백할 수 있습니다.



### 6.4 정기적인 감사

- Systems Manager 활동을 정기적으로 감사하세요.
- AWS CloudTrail과 통합하여 모든 API 호출을 로깅하고 모니터링할 수 있습니다.



## 7 결론

- AWS Systems Manager는 강력하고 유연한 인프라 관리 도구입니다.
- 이를 통해 운영을 자동화하고, 보안을 강화하며, 비용을 절감할 수 있습니다.
- Systems Manager의 다양한 구성 요소를 이해하고 적절히 활용하면, AWS 환경을 더욱 효율적으로 관리할 수 있습니다.
- 지속적인 학습과 실험을 통해 Systems Manager의 기능을 최대한 활용하시기 바랍니다.