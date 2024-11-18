## 1 CloudFormation Helper Scripts의 활용

### 1.1 EC2 User Data의 문제점

- EC2 User Data는 인스턴스 초기 설정에 유용하지만, 몇 가지 한계점이 있습니다:
	- 대규모 인스턴스 구성을 처리하기 어렵습니다.
	- 인스턴스를 종료하지 않고 상태를 변경하기 어렵습니다.
	- 스크립트의 가독성이 떨어질 수 있습니다.
	- 스크립트의 성공적인 완료 여부를 확인하기 어렵습니다.
- 이러한 문제를 해결하기 위해 CloudFormation Helper Scripts가 등장했습니다.



## 2 CloudFormation Helper Scripts 소개

- CloudFormation Helper Scripts는 EC2 인스턴스 구성을 더욱 효과적으로 관리할 수 있게 해주는 Python 스크립트입니다.
- 주요 스크립트:
	- cfn-init
	- cfn-signal
	- cfn-get-metadata
	- cfn-hup
- 이 스크립트들은 Amazon Linux AMI에 기본적으로 포함되어 있으며, 다른 Linux 배포판에서는 yum 또는 dnf를 통해 설치할 수 있습니다.



## 3 AWS::CloudFormation::Init

- AWS::CloudFormation::Init은 EC2 인스턴스 구성을 선언적으로 정의할 수 있게 해주는 CloudFormation의 기능입니다.
- 구성 요소:
	- Packages: Linux/Windows에서 사전 패키지된 앱과 컴포넌트를 다운로드하고 설치합니다.
	- Groups: 사용자 그룹을 정의합니다.
	- Users: 사용자를 정의하고 그룹에 할당합니다.
	- Sources: 파일과 아카이브를 다운로드하여 EC2 인스턴스에 배치합니다.
	- Files: EC2 인스턴스에 파일을 생성합니다. 인라인 또는 URL에서 내용을 가져올 수 있습니다.
	- Commands: 일련의 명령을 실행합니다.
	- Services: sysvinit 서비스 목록을 시작합니다.
- 이러한 구성 요소들은 지정된 순서대로 실행됩니다.



## 4 cfn-init 스크립트

- cfn-init 스크립트는 리소스 메타데이터를 검색하고 해석하여 패키지 설치, 파일 생성, 서비스 시작 등의 작업을 수행합니다.
- 이 스크립트를 사용하면 복잡한 EC2 구성을 보다 읽기 쉽게 만들 수 있습니다.
- EC2 인스턴스는 CloudFormation 서비스에 쿼리하여 초기화 데이터를 가져옵니다.
- AWS::CloudFormation::Init은 리소스의 Metadata 섹션에 정의되어야 합니다.
- 로그는 /var/log/cfn-init.log 파일에 기록됩니다.



## 5 cfn-signal과 Wait Conditions

- cfn-signal 스크립트는 EC2 인스턴스가 cfn-init을 통해 적절히 구성되었는지 CloudFormation에 알려주는 역할을 합니다.
- 사용 방법:
	- cfn-init 직후에 cfn-signal을 실행합니다.
	- 리소스 생성의 성공/실패 여부를 CloudFormation 서비스에 알립니다.
- Wait Condition:
	- cfn-signal로부터 신호를 받을 때까지 템플릿 실행을 차단합니다.
	- CreationPolicy를 통해 정의할 수 있습니다(EC2, Auto Scaling Group에서도 작동).
	- 필요한 경우 여러 개의 신호를 기다리도록 설정할 수 있습니다.



## 6 Wait Condition 문제 해결

- Wait Condition이 필요한 수의 신호를 받지 못했을 경우, 다음 사항을 확인해야 합니다:
	- AMI에 CloudFormation helper 스크립트가 설치되어 있는지 확인합니다.
	- cfn-init과 cfn-signal 명령이 인스턴스에서 성공적으로 실행되었는지 확인합니다.
		- /var/log/cloud-init.log 또는 /var/log/cfn-init.log 파일을 통해 디버깅할 수 있습니다.
	- 인스턴스가 인터넷에 연결되어 있는지 확인합니다.
		- 프라이빗 서브넷의 경우 NAT 디바이스를 통해, 퍼블릭 서브넷의 경우 인터넷 게이트웨이를 통해 연결되어야 합니다.
		- 연결 테스트: `curl -I https://aws.amazon.com`



**로그 확인 방법**

```bash
cat /var/log/cloud-init.log
cat /var/log/cfn-init.log
```

- 로그를 확인하려면 인스턴스에 로그인해야 하며, 스택 생성 실패 시 인스턴스가 삭제되지 않도록 롤백 실패를 비활성화해야 합니다.



## 7 CloudFormation Helper Scripts의 장점

- 대규모 및 복잡한 인스턴스 구성을 더욱 효과적으로 관리할 수 있습니다.
- 인스턴스를 종료하지 않고도 구성을 업데이트할 수 있습니다.
- 구성 스크립트의 가독성이 향상됩니다.
- 구성 프로세스의 성공 여부를 명확하게 확인할 수 있습니다.
- 인프라를 코드로 관리할 수 있어 버전 관리와 협업이 용이해집니다.



## 8 결론

- EC2 User Data는 간단한 초기 설정에는 유용하지만, 복잡한 구성 관리에는 한계가 있습니다.
- CloudFormation Helper Scripts는 이러한 한계를 극복하고 더욱 강력하고 유연한 인스턴스 구성 관리를 가능하게 합니다.
- 이를 통해 인프라의 일관성을 유지하고, 구성 관리를 자동화하며, 전체적인 시스템 신뢰성을 향상시킬 수 있습니다.
- CloudFormation Helper Scripts를 활용하면 대규모 클라우드 환경에서도 효율적이고 안정적인 인프라 관리가 가능해집니다.