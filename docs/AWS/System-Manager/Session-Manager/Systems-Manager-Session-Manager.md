## 1 AWS Systems Manager Session Manager 소개

- AWS Systems Manager Session Manager는 AWS Systems Manager의 완전 관리형 기능입니다.
- Amazon EC2 인스턴스, 엣지 디바이스, 온프레미스 서버 및 가상 머신(VM)을 안전하게 관리할 수 있는 방법을 제공합니다.
- Session Manager를 사용하면 인바운드 포트를 열거나, bastion 호스트를 유지 관리하거나, SSH 키를 관리할 필요 없이 안전하게 노드 관리를 할 수 있습니다.
- 관리되는 노드에 대한 접근을 제어하고, 엄격한 보안 관행을 준수하며, 노드 접근 세부 정보를 포함한 완전한 감사 로그를 제공합니다.
- 엔드 유저에게 간편한 원클릭 크로스 플랫폼 액세스를 제공합니다.



## 2 Session Manager의 장점

### 2.1 중앙 집중식 접근 제어

- IAM 정책을 통해 관리되는 노드에 대한 접근을 제어할 수 있습니다.
- 관리자들은 단일 위치에서 접근 권한을 부여하고 철회할 수 있습니다. 
- 조직의 개별 사용자나 그룹이 Session Manager를 사용할 수 있는지, 그리고 어떤 노드에 접근할 수 있는지를 제어할 수 있습니다.



### 2.2 인바운드 포트 없음 및 bastion 호스트 관리 불필요

- 인바운드 SSH 포트나 원격 PowerShell 포트를 열어둘 필요가 없어 보안이 향상됩니다.
- SSH 키와 인증서, bastion 호스트 및 점프 박스를 관리할 필요가 없습니다.



### 2.3 원클릭 접근

- AWS Systems Manager 콘솔이나 Amazon EC2 콘솔을 사용하여 클릭 한번에 세션을 시작할 수 있습니다.
- AWS CLI를 사용하여 단일 명령어 또는 일련의 명령어를 실행하는 세션을 시작할 수도 있습니다.
- IAM 정책을 통해 접근 권한이 제공되므로 연결 시간이 크게 단축됩니다.



### 2.4 하이브리드 및 멀티클라우드 환경 지원

- Amazon EC2 인스턴스뿐만 아니라 하이브리드 및 멀티클라우드 환경의 비 EC2 노드에도 연결할 수 있습니다. 
- 비 EC2 노드에 연결하려면 고급 인스턴스 티어를 활성화해야 하며, 이에 대한 비용이 발생합니다.
- EC2 인스턴스에 연결하는 데는 추가 비용이 발생하지 않습니다.



### 2.5 포트 포워딩

- 관리되는 노드 내부의 포트를 클라이언트의 로컬 포트로 리디렉션할 수 있습니다.
- 로컬 포트에 연결하여 노드 내부에서 실행 중인 서버 애플리케이션에 접근할 수 있습니다.



### 2.6 크로스 플랫폼 지원

- Windows, Linux 및 macOS를 모두 지원합니다.
- Linux 및 macOS 관리 노드에 대해 SSH 클라이언트를 사용하거나 Windows Server 관리 노드에 대해 RDP 연결을 사용할 필요가 없습니다.



### 2.7 세션 활동 로깅 및 감사

- 다음 AWS 서비스와 통합하여 로깅 및 감사 기능을 제공합니다:
    - **AWS CloudTrail**: Session Manager API 호출에 대한 정보를 캡처하고 로그 파일에 기록합니다.
    - **Amazon S3**: 세션 로그 데이터를 S3 버킷에 저장할 수 있습니다.
    - **Amazon CloudWatch Logs**: 로그 데이터를 CloudWatch Logs 로그 그룹으로 전송할 수 있습니다.
    - **Amazon EventBridge 및 Amazon SNS**: 세션 시작/종료 알림을 받고 자동화된 응답을 트리거할 수 있습니다.



## 3 Session Manager 설정

Session Manager를 설정하기 위해서는 클라이언트(사용자)와 에이전트(EC2 인스턴스) 양쪽에 대한 설정이 필요합니다.



### 3.1 클라이언트(사용자) 설정

- **IAM 사용자 또는 역할 생성**
	- Session Manager에 접근할 수 있는 IAM 사용자나 역할을 생성합니다.
	- 이 사용자나 역할에 Session Manager 접근을 위한 적절한 권한을 부여합니다.
- **IAM 정책 설정**
	- 다음과 같은 정책을 IAM 사용자나 역할에 연결합니다:
		- `AmazonSSMFullAccess`: Systems Manager의 모든 기능에 대한 완전한 접근 권한을 제공합니다.
		- 또는 더 세분화된 권한을 위해 사용자 지정 정책을 생성할 수 있습니다.
- **AWS CLI 또는 콘솔 설정**
	- AWS CLI를 사용하려면 로컬 시스템에 설치하고 구성합니다.
	- AWS Management Console을 사용하려면 브라우저에서 접근할 수 있도록 설정합니다.



### 3.2 에이전트(EC2 인스턴스) 설정

1. **IAM 역할 생성**
    - EC2 인스턴스용 IAM 역할을 생성합니다.
    - 이 역할에 `AmazonSSMManagedInstanceCore` 관리형 정책을 연결합니다.
    - 이 정책은 Systems Manager Agent(SSM Agent)가 인스턴스에서 명령을 실행하고 AWS와 통신할 수 있도록 권한을 부여합니다.
2. **IAM 역할을 EC2 인스턴스에 할당**
    - 생성한 IAM 역할을 EC2 인스턴스에 할당합니다.
    - 이를 통해 인스턴스는 SSM Agent를 통해 AWS Systems Manager와 통신하고, Session Manager를 통한 원격 명령을 실행할 수 있습니다.
3. **SSM Agent 설치 및 구성**
    - EC2 인스턴스에 SSM Agent가 설치되어 있고 실행 중인지 확인합니다.
    - 대부분의 최신 Amazon Linux, Amazon Linux 2, Ubuntu 등에는 SSM Agent가 기본적으로 설치되어 있습니다.
    - 설치되어 있지 않다면 AWS 문서를 참조하여 설치합니다.
4. **보안 그룹 설정**
    - EC2 인스턴스의 보안 그룹에서 인바운드 SSH 포트(22)를 열 필요가 없습니다.
    - SSM Agent는 아웃바운드 HTTPS 연결만을 사용하여 AWS Systems Manager 서비스와 통신합니다.



## 4 Session Manager 사용

### 4.1 AWS Management Console을 통한 사용

1. AWS Systems Manager 콘솔에 접속합니다.
2. 왼쪽 메뉴에서 "Session Manager"를 선택합니다.
3. "Start session" 버튼을 클릭합니다.
4. 연결하려는 인스턴스를 선택하고 "Start session"을 클릭합니다.
5. 브라우저 기반 셸이 열리며, 이를 통해 인스턴스와 상호작용할 수 있습니다.



### 4.2 AWS CLI를 통한 사용

1. AWS CLI가 설치되어 있고 구성되어 있는지 확인합니다.
2. 다음 명령어를 실행하여 세션을 시작합니다:

**세션 시작**
```bash
aws ssm start-session --target i-1234567890abcdef0
```

- `i-1234567890abcdef0`는 연결하려는 EC2 인스턴스의 ID입니다.



## 5 보안 고려사항

- Session Manager를 사용할 때는 다음과 같은 보안 사항을 고려해야 합니다:
    - 최소 권한 원칙을 적용하여 사용자와 역할에 필요한 최소한의 권한만 부여합니다.
    - CloudTrail을 활성화하여 모든 Session Manager 활동을 로깅합니다.
    - 세션 로그를 암호화하여 S3 버킷이나 CloudWatch Logs에 저장합니다.
    - IAM 정책을 사용하여 특정 인스턴스에 대한 접근을 제한합니다.
    - AWS KMS를 사용하여 세션 데이터를 암호화합니다.



## 6 결론

- AWS Systems Manager Session Manager는 EC2 인스턴스와 기타 관리형 노드에 대한 안전하고 감사 가능한 관리형 접근을 제공합니다.
- SSH 키나 인바운드 포트 없이도 안전한 접근이 가능해 보안을 강화하고 관리를 간소화합니다.
- 적절한 IAM 정책과 역할 설정을 통해 세분화된 접근 제어가 가능합니다.
- 로깅과 감사 기능을 통해 규정 준수 요구사항을 충족할 수 있습니다.
- Session Manager를 효과적으로 사용하면 인프라 관리의 보안성과 효율성을 크게 향상시킬 수 있습니다.