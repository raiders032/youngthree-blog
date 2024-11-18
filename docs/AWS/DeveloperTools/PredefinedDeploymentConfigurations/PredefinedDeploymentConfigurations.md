## 1 Predefined Deployment Configurations 이해하기

- AWS CodeDeploy는 다양한 배포 시나리오를 지원하기 위해 여러 가지 사전 정의된 배포 구성(Predefined Deployment Configurations)을 제공합니다. 
- 이러한 구성들은 EC2/온프레미스 컴퓨팅 플랫폼과 Amazon ECS 컴퓨팅 플랫폼에 따라 다르게 적용됩니다.
- 각 구성은 배포 방식과 트래픽 이동 패턴을 결정하는 중요한 역할을 합니다.



## 2 EC2/온프레미스 컴퓨팅 플랫폼의 Predefined Configurations

- EC2/온프레미스 환경에서는 세 가지 주요 predefined configuration이 제공됩니다.



### 2.1 CodeDeployDefault.AllAtOnce

- **In-place 배포:**
  - 가능한 많은 인스턴스에 동시에 애플리케이션 배포를 시도합니다.
  - 하나 이상의 인스턴스에 성공적으로 배포되면 전체 배포가 '성공'으로 표시됩니다.
  - 모든 인스턴스에 배포 실패 시에만 전체 배포가 '실패'로 표시됩니다.



- **Blue/Green 배포:**
  - 대체 환경 배포: In-place 배포와 동일한 규칙을 따릅니다.
  - 트래픽 전환: 모든 인스턴스로 한 번에 트래픽을 전환합니다.



### 2.2 CodeDeployDefault.HalfAtATime

- **In-place 배포:**
  - 한 번에 최대 절반의 인스턴스에 배포합니다.
  - 절반 이상의 인스턴스에 성공적으로 배포되면 전체 배포가 성공합니다.

- **Blue/Green 배포:**
  - 대체 환경 배포: In-place 배포와 동일한 규칙을 따릅니다.
  - 트래픽 전환: 한 번에 최대 절반의 인스턴스로 트래픽을 전환합니다.



### 2.3 CodeDeployDefault.OneAtATime

- **In-place 배포:**
  - 한 번에 하나의 인스턴스에만 배포합니다.
  - 마지막 인스턴스를 제외한 모든 인스턴스에 성공적으로 배포되어야 전체 배포가 성공합니다.



- **Blue/Green 배포:**
  - 대체 환경 배포: In-place 배포와 동일한 규칙을 따릅니다.
  - 트래픽 전환: 한 번에 하나의 인스턴스로 트래픽을 전환합니다.



## 3 Amazon ECS 컴퓨팅 플랫폼의 Predefined Configurations

- Amazon ECS 환경에서는 트래픽 이동 패턴에 따라 다양한 configuration이 제공됩니다.



### 3.1 Linear 배포 구성

- **CodeDeployDefault.ECSLinear10PercentEvery1Minutes:**
	- 매 1분마다 10%의 트래픽을 이동시킵니다.
- **CodeDeployDefault.ECSLinear10PercentEvery3Minutes:**
	- 매 3분마다 10%의 트래픽을 이동시킵니다.



### 3.2 Canary 배포 구성

- **CodeDeployDefault.ECSCanary10Percent5Minutes:**
	- 첫 번째로 10%의 트래픽을 이동시키고, 5분 후 나머지 90%를 이동시킵니다.
- **CodeDeployDefault.ECSCanary10Percent15Minutes:**
	- 첫 번째로 10%의 트래픽을 이동시키고, 15분 후 나머지 90%를 이동시킵니다.



### 3.3 All-at-once 배포 구성

- **CodeDeployDefault.ECSAllAtOnce:**
	- 모든 트래픽을 한 번에 업데이트된 Amazon ECS 컨테이너로 이동시킵니다.



## 4 주의사항

- EC2/온프레미스 환경에서 가용 영역별 정상 호스트 수를 지정하는 기능(zonal configuration)은 predefined configuration에서 지원되지 않습니다.
- 이 기능을 사용하려면 사용자 정의 배포 구성을 생성해야 합니다.
- Network Load Balancer를 사용하는 경우, Amazon ECS 배포에서는 CodeDeployDefault.ECSAllAtOnce 구성만 지원됩니다.



## 5 결론

- AWS CodeDeploy의 Predefined Deployment Configurations는 다양한 배포 시나리오에 맞춰 최적화된 옵션을 제공합니다.
- 이를 통해 개발자와 운영 팀은 애플리케이션의 특성과 요구사항에 맞는 배포 전략을 쉽게 선택하고 구현할 수 있습니다.