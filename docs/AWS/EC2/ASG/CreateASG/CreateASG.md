## 1 Auto Scaling Group 생성하기

- EC2 Auto Scaling Group(ASG)을 사용하면 애플리케이션의 수요 변화에 따라 자동으로 인스턴스를 조정할 수 있습니다.
- 이 가이드에서는 EC2 콘솔을 사용하여 Launch Template을 기반으로 Auto Scaling Group을 생성하는 방법을 설명합니다.
- 비용 절감을 최대화하기 위해 스팟 인스턴스를 활용하는 방법도 포함됩니다.



## 2 Auto Scaling Group 생성 단계

### 2.1 Launch Template 생성

- Launch Template은 EC2 인스턴스를 시작할 때 필요한 모든 설정을 저장한 템플릿입니다.
- 여러 Auto Scaling Group이나 인스턴스를 시작할 때 일관된 설정을 적용할 수 있습니다.
- 자세한 내용은 아래를 참고하세요
    - [[LaunchTemplate]]



### 2.2 Auto Scaling Group 생성

- EC2 대시보드로 돌아가서, 왼쪽 메뉴에서 "Auto Scaling Groups"를 선택합니다.
- "Create Auto Scaling group" 버튼을 클릭합니다.



#### 2.2.1 Step1: Launch Template 선택

- Auto Scaling 그룹에 의해 시작되는 모든 EC2 인스턴스에 공통으로 적용되는 설정을 포함하는 런치 템플릿을 지정합니다.
- Auto Scaling group 이름을 입력하고, 앞서 생성한 런치 템플릿을 드롭다운 메뉴에서 선택합니다.



#### 2.2.2 Step2: 인스턴스 시작 옵션 선택

- 이 단계에서는 인스턴스가 시작될 VPC 네트워크 환경을 선택하고, 인스턴스 유형과 구매 옵션을 사용자 지정할 수 있습니다.



**설정하기**

- **인스턴스 유형 요구 사항 설정**
	- **Launch template**: 생성한 Launch Template을 사용하여 인스턴스를 시작할 수 있습니다.
	- **Override launch template**: Launch Template의 설정을 덮어쓰고 다른 인스턴스 속성이나 유형을 지정할 수 있습니다.
- **네트워크 설정**
	- 여기서는 인스턴스가 시작될 VPC 네트워크 환경을 선택하고, 가용 영역과 서브넷을 정의합니다.



#### 2.2.3 Step3: 고급 옵션 구성 (선택 사항)

- 이 단계에서는 Auto Scaling 그룹을 로드 밸런서나 VPC Lattice와 통합하고, 헬스 체크를 설정할 수 있는 옵션을 제공합니다. 
- 이러한 옵션을 통해 네트워크 트래픽 분산, 서비스 간 통신 설정, 헬스 체크 관리 등을 보다 세밀하게 조정할 수 있습니다.



**로드 밸런싱 설정**

![[Pasted image 20240719130645.png]]
- Auto Scaling 그룹을 기존 로드 밸런서에 연결하거나 새로운 로드 밸런서를 생성하여 네트워크 트래픽을 여러 서버에 분산시킬 수 있습니다.
- **No load balancer**: 로드 밸런서를 사용하지 않습니다.
	- 선택 시 Auto Scaling 그룹의 트래픽은 로드 밸런서를 거치지 않고 직접 인스턴스로 전달됩니다.
- **Attach to an existing load balancer**: 기존 로드 밸런서에 연결합니다.
	- 이미 설정된 로드 밸런서 중 하나를 선택하여 Auto Scaling 그룹과 연동합니다.
	- 선택된 로드 밸런서의 Target Group에 새로운 인스턴스가 자동으로 추가되어 트래픽을 수신하게 됩니다.
- **Attach to a new load balancer**: 새로운 로드 밸런서를 생성하여 연결합니다.
	- Auto Scaling 그룹에 연결할 기본 로드 밸런서를 빠르게 생성합니다.



**VPC Lattice 통합 옵션 설정**

- VPC Lattice를 사용하여 Auto Scaling 그룹의 네트워크 접근성과 다른 서비스와의 연결성을 개선하고 확장성을 높일 수 있습니다.
- **No VPC Lattice service**: VPC Lattice 서비스를 사용하지 않습니다.
	- 선택 시 VPC Lattice는 Auto Scaling 그룹의 네트워크 접근 및 다른 서비스와의 연결을 관리하지 않습니다.
- **Attach to VPC Lattice service**: VPC Lattice 서비스를 연결합니다.
	- 지정된 VPC Lattice 타겟 그룹과 연동된 수신 요청이 Auto Scaling 그룹으로 라우팅됩니다.
	- VPC Lattice는 AWS 서비스 간 통신을 용이하게 하고 애플리케이션을 연결 및 관리하는 데 도움을 줍니다.



**헬스 체크 설정**

- 헬스 체크는 비정상적인 인스턴스를 교체하여 가용성을 높이는 데 도움이 됩니다. 
- 여러 헬스 체크를 사용할 경우, 모두 평가되며 하나라도 실패하면 인스턴스가 교체됩니다.
- **EC2 health checks**: 항상 활성화된 기본 EC2 헬스 체크를 사용합니다.
- **Additional health check types** (선택 사항):
	- **Turn on Elastic Load Balancing health checks**: 로드 밸런싱 헬스 체크를 활성화합니다.
		- Elastic Load Balancing이 요청을 처리할 인스턴스가 있는지 모니터링합니다.
		- 비정상 인스턴스를 감지하면, 다음 주기적 점검 시 EC2 Auto Scaling이 해당 인스턴스를 교체할 수 있습니다.
	- **Turn on VPC Lattice health checks**: VPC Lattice 헬스 체크를 활성화합니다.
		- VPC Lattice를 통해 인스턴스 상태를 모니터링하고, 비정상 인스턴스를 교체합니다.
	




#### 2.2.4 Step4: 그룹 크기 및 스케일링 구성 (선택 사항)

- **Step 6**: 그룹 크기 및 스케일링을 구성합니다.
    - **Desired capacity**: 초기 인스턴스 수를 설정합니다.
    - **Minimum capacity**: 최소 인스턴스 수를 설정합니다.
    - **Maximum capacity**: 최대 인스턴스 수를 설정합니다.
    - **Scaling policies**: Target tracking scaling policy를 선택하여 인스턴스 수를 자동으로 조정합니다.

#### 2.2.5 알림 설정 (선택 사항)

- **Step 7**: Notifications에서 필요에 따라 알림 설정을 구성합니다.
    - **Notifications**: 인스턴스가 추가되거나 제거될 때 알림을 받도록 설정할 수 있습니다.

#### 2.2.6 태그 설정 (선택 사항)

- **Step 8**: Tags를 추가하여 리소스를 관리합니다.
    - **Tags**: 리소스를 식별하고 관리하기 위한 태그를 추가합니다.

#### 2.2.7 설정 검토

- **Step 9**: Review 단계에서 설정을 확인하고 "Create Auto Scaling group" 버튼을 클릭합니다.
    - **Review**: 모든 설정을 검토하여 오류가 없는지 확인합니다.
    - **Create Auto Scaling group**: 설정이 완료되면 이 버튼을 클릭하여 Auto Scaling Group을 생성합니다.



## 3 비용 절감 전략

### 3.1 스팟 인스턴스 활용

- 비용 절감을 극대화하기 위해 스팟 인스턴스를 사용합니다.
    - **최대 90% 할인**: 스팟 인스턴스를 사용하면 온디맨드 인스턴스 대비 최대 90%까지 할인된 가격으로 인스턴스를 사용할 수 있습니다.
    - **중단 가능성**: 스팟 인스턴스는 AWS에서 필요 시 중단될 수 있으므로 중요한 워크로드에는 적합하지 않을 수 있습니다.

### 3.2 예약 인스턴스 사용

- 장기적으로 사용할 인스턴스에 대해서는 예약 인스턴스를 사용하여 비용을 절감합니다.
    - **1년 또는 3년 예약**: 예약 인스턴스는 1년 또는 3년 단위로 예약할 수 있으며, 온디맨드 인스턴스 대비 저렴한 가격으로 제공됩니다.

### 3.3 혼합 모드

- 온디맨드 인스턴스와 스팟 인스턴스를 혼합하여 유연성을 높입니다.
    - **온디맨드 인스턴스**: 안정성이 필요한 워크로드에 적합합니다.
    - **스팟 인스턴스**: 비용을 절감할 수 있지만, 중단 가능성이 있는 워크로드에 적합합니다.

### 3.4 동적 및 예측 스케일링

- 트래픽 패턴을 모니터링하고, 예측하여 인스턴스를 자동으로 조정합니다.
    - **동적 스케일링**: 현재의 트래픽을 기반으로 인스턴스 수를 조정합니다.
    - **예측 스케일링**: 기계 학습을 통해 미래의 트래픽 패턴을 예측하고 미리 인스턴스를 확장하거나 축소합니다.