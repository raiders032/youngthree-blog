## 1 Target Group이란?

- **Target Group**은 Application Load Balancer(ALB) 또는 Network Load Balancer(NLB)가 트래픽을 라우팅할 대상으로 그룹화한 것입니다.
- Target Group은 특정 유형의 리소스(예: EC2 인스턴스, Lambda 함수, IP 주소 등)를 포함합니다.
- 각 Target Group은 고유한 헬스 체크 설정을 가지고 있어, 대상의 상태를 지속적으로 모니터링하고 비정상적인 대상을 자동으로 제외합니다.



## 2 Target Group의 주요 기능

### 2.1 트래픽 라우팅

- **ALB와의 통합**: ALB는 클라이언트 요청을 받아 Target Group으로 트래픽을 분배합니다. ALB는 URL 경로, 호스트 이름, HTTP 헤더 등의 라우팅 규칙을 사용하여 트래픽을 적절한 Target Group으로 전달합니다.
- **NLB와의 통합**: NLB는 TCP/UDP 트래픽을 받아 Target Group으로 분배합니다. 주로 네트워크 레벨에서 트래픽을 처리합니다.



### 2.2 헬스 체크

- **헬스 체크**: Target Group은 대상 리소스의 상태를 모니터링하는 헬스 체크를 구성할 수 있습니다. 헬스 체크를 통해 비정상적인 대상을 감지하고, 트래픽 분배에서 제외할 수 있습니다.
- **헬스 체크 설정**: 헬스 체크 간격, 시간 초과, 재시도 횟수 등을 설정하여 대상의 상태를 지속적으로 모니터링합니다.



### 2.3 유연한 구성

- **다양한 대상 유형 지원**: Target Group은 EC2 인스턴스, Lambda 함수, IP 주소 등의 다양한 대상 유형을 지원합니다.
- **동적 업데이트**: Target Group에 새로운 대상을 추가하거나 기존 대상을 제거할 수 있습니다. 이러한 변경 사항은 실시간으로 반영됩니다.



## 3 Target Group 생성 및 설정

- AWS Management Console에 로그인합니다.
- EC2 대시보드로 이동합니다.
- 왼쪽 메뉴에서 "Target Groups"를 선택합니다.
- "Create target group" 버튼을 클릭합니다.



### 3.1 Step1: Specify group details


- 기본 설정을 입력합니다.
    - **Target type**: 대상 유형을 선택합니다 (예: Instances, IP addresses, Lambda functions).
    - **Target group name**: Target Group의 이름을 입력합니다.
    - VPC를 선택합니다.
        - Target Group이 속할 VPC를 선택합니다.
- 헬스 체크 구성
    - 헬스 체크 설정을 구성합니다.
	- **Protocol**: 헬스 체크에 사용할 프로토콜을 선택합니다 (예: HTTP, HTTPS, TCP).
	- **Path**: 헬스 체크 요청을 보낼 경로를 입력합니다 (예: `/healthcheck`).
	- **Port**: 헬스 체크 요청을 보낼 포트를 설정합니다.
	- **Interval**: 헬스 체크 간격을 설정합니다 (초 단위).
	- **Timeout**: 헬스 체크 응답 대기 시간을 설정합니다 (초 단위).
	- **Unhealthy threshold**: 비정상 상태로 간주하기 위한 연속 실패 횟수를 설정합니다.
	- **Healthy threshold**: 정상 상태로 간주하기 위한 연속 성공 횟수를 설정합니다.


### 3.2 Step2: 대상 등록

- Target Group에 등록할 대상을 선택합니다.
- **Add targets**: 등록할 대상(예: EC2 인스턴스)을 선택하고, 대상 그룹에 추가합니다.
- 설정을 검토하고, "Create target group" 버튼을 클릭하여 Target Group을 생성합니다.



## 4 ALB 및 ASG와의 통합

### 4.1 ALB와 Target Group 통합

- **ALB 설정**: ALB를 생성하거나 기존 ALB를 수정하여 Target Group을 연결합니다.
- **라우팅 규칙**: ALB의 리스너에 라우팅 규칙을 추가하여 특정 조건에 따라 트래픽을 Target Group으로 라우팅합니다.



### 4.2 ASG와 Target Group 통합

- **ASG 설정**: Auto Scaling Group을 생성하거나 기존 ASG를 수정하여 Target Group에 인스턴스를 등록합니다.
- **헬스 체크 통합**: ASG는 Target Group의 헬스 체크 결과를 사용하여 비정상 인스턴스를 교체하고, 필요한 경우 새 인스턴스를 생성합니다.



## 5 마무리

- Target Group은 ALB와 NLB가 트래픽을 분배할 대상을 그룹화하는 중요한 구성 요소입니다.
- Target Group을 사용하면 다양한 대상 유형을 유연하게 관리하고, 헬스 체크를 통해 서비스의 안정성을 유지할 수 있습니다.
- ALB와 ASG와의 통합을 통해 애플리케이션의 고가용성, 확장성, 안정성을 높일 수 있습니다.



**참고 자료**

- [AWS Target Group 설명서](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html)
- [ALB 설정 가이드](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-getting-started.html)