## 1 Elastic Load Balancing

- Elastic Load Balancing(ELB)는 AWS에서 제공하는 로드 밸런싱 서비스입니다.
- ELB는 다양한 타겟에 걸쳐 들어오는 애플리케이션 트래픽을 자동으로 분배합니다.
- 타겟에는 EC2 인스턴스, 컨테이너, IP 주소 등이 포함될 수 있습니다.
- ELB는 등록된 타겟의 상태를 주기적으로 확인하고, 건강한 타겟으로만 트래픽을 분배하여 애플리케이션의 가용성을 높입니다.
- ELB의 종류는 아래 4가지가 있습니다.
	- Application Load Balancers
	- Network Load Balancers
	- Gateway Load Balancers
	- Classic Load Balancers(Deprecated)



### 1.1 ELB와 리전

- **ELB는 리전 단위로 운영**됩니다. 이는 각 리전에서 별도의 ELB를 설정하고 관리해야 함을 의미합니다.
- ELB는 동일 리전 내의 여러 가용 영역(AZ)에 트래픽을 분산할 수 있지만, **다른 리전으로 트래픽을 분산할 수는 없습니다**.
- 만약 **여러 리전에 걸쳐 고가용성 및 재해 복구(Disaster Recovery)를 위해 설정**하려면, 각 리전마다 별도의 ELB를 설정해야 합니다. 이를 통해 각 리전에서 독립적인 트래픽 관리와 리소스 분배가 가능합니다.

ㅋㅋㅋㅋ

## 2 Application Load Balancer

 * [레퍼런스](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)
 * Application Load Balancer는 주로 HTTP/HTTPS 트래픽을 처리하며 OSI 7계층에서 작동합니다.
 * ALB는 웹소켓과 HTTP/2도 지원하며, URL, 헤더, 메소드 등을 기반으로 트래픽 라우팅 규칙을 설정할 수 있습니다.
 * ALB는 사용자 세션을 특정 타겟에 고정시키는 스티키 세션 기능도 제공합니다.
 * [[ALB]] 참고



## 3 Network Load Balancer

* [레퍼런스](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html)
* Network Load Balancer는 높은 성능과 저지연 연결을 처리하는 데 최적화되어 있습니다. 
* NLB는 주로 TCP, UDP, TLS 트래픽을 처리하며, 이는 OSI 모델의 4계층인 전송 계층에서 작동합니다.
* NLB는 수백만 개의 요청을 초당 처리할 수 있으며, 자동 스케일링 및 무중단 서비스를 제공합니다.
* [[NLB]] 참고



## 4 Gateway Load Balancer

- [레퍼런스](https://docs.aws.amazon.com/elasticloadbalancing/latest/gateway/introduction.html)
- Gateway Load Balancer은 아래와 같은 어플라이언스를 배포, 확장 및 관리하기 위한 서비스이다.
	- 방화벽
	- 침입 탐지 시스템(IDS intrusion detection system)
	- 침입 방지 시스템(IPS intrusion prevention systems)
	- 심층 패킷 검사 시스템
- Gateway Load Balancer는 모든 트랙픽에 대해 단일 입구 및 출구 지점 역할을 하는 동시에 수요에 따라 가상 어플라이언스를 확장하는 기능을 한다.
- Gateway Load Balancer는 OSI 모델의 3계층인 네트워크 계층에서 작동한다.
- 이 로드 밸런서는 모든 포트에 걸쳐 모든 IP 패킷을 청취하고, 리스너 규칙에 지정된 대상 그룹으로 트래픽을 전달한다.
- [[GWLB]] 참고



## 5 VPC 서브넷과 로드 밸런서의 관계

- VPC(가상 프라이빗 클라우드)는 AWS 리소스를 위한 논리적 네트워크를 제공하는 서비스입니다.
- VPC 내에는 여러 개의 서브넷을 생성할 수 있습니다. 서브넷은 VPC의 IP 주소 범위 내에서 할당된 작은 네트워크 세그먼트입니다.
- 서브넷은 퍼블릭 서브넷과 프라이빗 서브넷으로 나눌 수 있습니다.



### 5.1 퍼블릭 서브넷

- 퍼블릭 서브넷은 인터넷 게이트웨이와 연결되어 있어 인터넷과 직접 통신할 수 있는 서브넷입니다.
- 퍼블릭 서브넷에 배치된 리소스는 외부에서 접근이 가능합니다.
- Application Load Balancer(ALB)와 Network Load Balancer(NLB)는 퍼블릭 서브넷에 배치되어 인터넷 트래픽을 처리할 수 있습니다.
- 퍼블릭 서브넷의 라우트 테이블에는 0.0.0.0/0 경로가 인터넷 게이트웨이를 통해 설정되어 있어야 합니다.



### 5.2 프라이빗 서브넷

- 프라이빗 서브넷은 인터넷 게이트웨이와 직접 연결되지 않은 서브넷입니다.
- 프라이빗 서브넷에 배치된 리소스는 인터넷에서 직접 접근할 수 없습니다.
- 일반적으로 EC2 인스턴스와 같은 애플리케이션 서버는 프라이빗 서브넷에 배치됩니다.
- 프라이빗 서브넷에서 외부 인터넷과 통신하려면 NAT 게이트웨이나 NAT 인스턴스를 사용해야 합니다.



### 5.3 로드 밸런서와 서브넷

- **ALB와 퍼블릭 서브넷**: 인터넷 트래픽을 처리하기 위해 ALB는 퍼블릭 서브넷에 배치되어야 합니다. ALB는 퍼블릭 서브넷에서 트래픽을 수신한 후, 이를 프라이빗 서브넷의 타겟으로 전달합니다.
- **NLB와 퍼블릭 서브넷**: NLB도 퍼블릭 서브넷에 배치되어 인터넷 트래픽을 처리할 수 있습니다. NLB는 고성능, 저지연 트래픽 처리를 위해 설계되었습니다.
- **게이트웨이 로드 밸런서와 서브넷**: Gateway Load Balancer는 주로 보안 장비를 위한 로드 밸런싱을 제공하며, 퍼블릭 및 프라이빗 서브넷에서 작동할 수 있습니다.