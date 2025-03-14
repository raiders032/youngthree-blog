## 1 AWS ENI

- ENI (Elastic Network Interface)는 Amazon EC2 인스턴스에서 사용할 수 있는 네트워크 인터페이스입니다.
- ENI는 기본 네트워크 인터페이스 외에 추가로 생성 및 연결할 수 있는 가상 네트워크 카드입니다.
- ENI는 VPC 내에서 네트워크를 분리하고, 보안을 강화하며, 네트워크 트래픽을 유연하게 관리하는 데 사용됩니다.



## 2 주요 기능

### 2.1 기본 기능

- Elastic Network Interface는 기본적으로 다음과 같은 기능을 제공합니다:
- 프라이빗 IP 주소: 하나 이상의 프라이빗 IP 주소를 할당할 수 있습니다.
- 퍼블릭 IP 주소: 필요에 따라 퍼블릭 IP 주소를 할당할 수 있습니다.
- Elastic IP 주소: Elastic IP 주소를 연결할 수 있습니다.
- 보안 그룹: 하나 이상의 보안 그룹을 연결하여 네트워크 트래픽을 제어할 수 있습니다.
- MAC 주소: 고유한 MAC 주소를 가집니다.
- DNS 호스트 이름: 필요에 따라 DNS 호스트 이름을 할당할 수 있습니다.



### 2.2 고가용성 및 가용성 영역 간 통신

- ENI는 고가용성을 지원합니다:
- 가용성 영역 간 통신: ENI를 통해 서로 다른 가용성 영역 간에 통신할 수 있습니다.
- 장애 조치: 인스턴스가 실패할 경우 ENI를 다른 인스턴스로 이동할 수 있습니다.



### 2.3 다양한 사용 사례

- ENI는 다양한 사용 사례에 활용될 수 있습니다:
- 다중 네트워크 인터페이스를 통한 트래픽 분리: 하나의 인스턴스에서 여러 ENI를 사용하여 트래픽을 분리하고 관리할 수 있습니다.
- 보안 강화: 다양한 보안 그룹을 ENI에 연결하여 세분화된 보안 정책을 적용할 수 있습니다.
- 네트워크 모니터링: 트래픽을 모니터링하고 분석하는 데 ENI를 사용할 수 있습니다.



### 2.4 ENI 관리

- ENI는 AWS Management Console, CLI, SDK를 통해 쉽게 관리할 수 있습니다:
- 생성 및 삭제: 필요에 따라 ENI를 생성하고 삭제할 수 있습니다.
- 연결 및 분리: ENI를 EC2 인스턴스에 연결하거나 분리할 수 있습니다.
- 속성 수정: 할당된 IP 주소, 보안 그룹 등 속성을 수정할 수 있습니다.