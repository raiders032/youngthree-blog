## 1 Network Load Balancer

* [레퍼런스](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html)
* Network Load Balancer는 높은 성능과 저지연 연결을 처리하는 데 최적화되어 있습니다. 
* NLB는 주로 TCP, UDP, TLS 트래픽을 처리하며, 이는 OSI 모델의 4계층인 전송 계층에서 작동합니다.
* NLB는 수백만 개의 요청을 초당 처리할 수 있으며, 자동 스케일링 및 무중단 서비스를 제공합니다.



### 1.1 ALB와 NLB 비교

- **ALB**
    - 지연시간: 약 400ms
    - 프로토콜: HTTP, HTTPS, WebSocket, HTTP/2
- **NLB**
    - 지연시간: 약 100ms 이하
    - 프로토콜: TCP, UDP, TLS



## 2 Listener

- Network Load Balancer에 하나 이상의 listener를 추가합니다.
- listener는 설정된 프로토콜과 포트를 통해 클라이언트로부터 연결 요청을 확인하고 해당 요청을 타겟 그룹으로 포워딩합니다.



### 2.1 TLS 리스너 구성

- TLS 리스너는 클라이언트와 NLB 간의 TLS 트래픽을 처리합니다.
- TLS 리스너를 구성하려면 AWS Certificate Manager(ACM)에서 인증서를 생성하거나 가져와야 합니다.
- NLB 설정 시, TLS 리스너를 추가하고 해당 인증서를 선택하여 보안 연결을 설정합니다.



**구성 단계**

1. **AWS Certificate Manager에서 인증서 생성**:
    - ACM을 통해 인증서를 생성하거나 가져옵니다.
2. **NLB 생성**:
    - AWS Management Console에서 EC2 서비스로 이동하여 "Load Balancers"를 선택하고 "Create Load Balancer"를 클릭합니다.
    - "Network Load Balancer"를 선택하고 기본 설정을 입력합니다.
3. **TLS 리스너 추가**:
    - 리스너 구성 단계에서 프로토콜로 "TLS"를 선택하고 포트 번호를 입력합니다.
    - "Default SSL certificate" 섹션에서 ACM 인증서를 선택합니다.
4. **대상 그룹 설정**:
    - TLS 리스너에서 라우팅할 대상 그룹을 선택합니다.
5. **NLB 생성 완료**:
    - 설정을 검토하고 "Create" 버튼을 클릭하여 NLB를 생성합니다.



## 3 Target Group

- **Target Group**은 Network Load Balancer (NLB)가 클라이언트 요청을 분산시킬 대상을 정의하는 논리적인 그룹입니다.
- NLB는 지정된 프로토콜과 포트 번호를 사용하여 트래픽을 하나 이상의 타겟으로 라우팅합니다.



### 3.1 타겟 유형

- **EC2 인스턴스**: NLB는 다양한 프로토콜(TCP, UDP, TLS)을 사용하는 EC2 인스턴스를 타겟으로 설정할 수 있습니다. 이는 가장 일반적으로 사용되는 타겟 유형으로, AWS의 가상 서버를 통해 트래픽을 처리합니다.
- **IP 주소**: 특정 IP 주소를 타겟으로 지정할 수 있습니다. 이를 통해 온프레미스 시스템이나 다른 클라우드 서비스와의 통합이 가능합니다. 이 기능을 사용하면 AWS 외부의 인프라와 연결할 수 있어 유연한 네트워크 구성이 가능합니다.
- **Application Load Balancer (ALB)**: NLB는 ALB를 타겟으로 설정하여 HTTP/HTTPS 트래픽을 처리할 수 있습니다. 이는 멀티 레이어 로드 밸런싱 구조를 만들 수 있으며, NLB가 4계층에서 트래픽을 관리하고, ALB가 7계층에서 추가적인 라우팅을 처리하는 구조를 구축할 수 있습니다.
- **Lambda**:  ALB만 사용가능하며 NLB에서는 사용할 수 없습니다.



### 3.2 헬스 체크

- **헬스 체크**는 NLB가 각 타겟의 상태를 모니터링하는 방법입니다. 헬스 체크는 주기적으로 수행되며, 타겟이 요청을 처리할 준비가 되었는지를 확인합니다.
- 헬스 체크가 성공적인 타겟만을 사용하여 트래픽을 분산시킴으로써, 서비스의 안정성을 높입니다.
- 헬스 체크는 TCP, HTTP, HTTPS 프로토콜을 사용하여 설정할 수 있으며, 특정 경로, 타임아웃, 재시도 횟수 등을 설정할 수 있습니다.
	- HTTP/HTTPS 프로토콜은 헬스 체크 용도로만 사용할 수 있습니다. 
	- 실제 트래픽의 라우팅에는 TCP, UDP, TLS 프로토콜만 지원합니다.



## 4 Sticky Sessions in Network Load Balancer (NLB)

### 4.1 정의 및 기능

- **Sticky Sessions**는 특정 클라이언트의 세션이 특정 백엔드 타겟에 고정되도록 하는 기능을 말합니다.
- Network Load Balancer(NLB)는 전송 계층(OSI 4계층)에서 작동하므로, Application Load Balancer(ALB)에서처럼 쿠키를 사용하여 세션을 고정하지 않습니다.
- 대신, NLB는 클라이언트의 **소스 IP 주소**와 **포트** 정보를 기반으로 세션을 유지합니다. 
	- 이를 **Source IP Affinity** 또는 **Client IP Affinity**라고 합니다.



### 4.2 작동 방식

- NLB에서 Sticky Sessions은 클라이언트의 소스 IP 주소와 포트 정보를 기반으로 트래픽을 특정 백엔드 타겟으로 고정합니다.
- 클라이언트가 동일한 소스 IP 주소와 포트를 사용하여 연결을 시도할 때, NLB는 이전에 할당된 동일한 타겟 인스턴스로 트래픽을 라우팅합니다.
- 이 방식은 클라이언트와 서버 간의 세션 일관성을 유지하는 데 사용되며, 특히 상태 저장(Stateful) 애플리케이션에서 유용합니다.



### 4.3 설정 방법

- NLB의 Target Group을 설정할 때, Sticky Sessions을 활성화할 수 있습니다.
- Target Group 설정에서 `Stickiness`를 활성화하고, 세션 유지 기간(초)을 설정할 수 있습니다.
- 설정된 시간 동안 동일한 소스 IP와 포트에서 오는 요청은 동일한 타겟 인스턴스로 라우팅됩니다.



### 4.4 장점과 고려 사항

- **장점**: 클라이언트 세션이 일정한 서버에 고정되므로, 세션 정보를 서버 간에 동기화할 필요가 줄어듭니다. 이는 상태 저장 애플리케이션에서 세션 일관성을 유지하는 데 도움이 됩니다.
- **고려 사항**: 특정 서버에 트래픽이 집중될 수 있으므로, 서버 간 부하 분산이 균등하지 않을 수 있습니다. 이로 인해 일부 서버가 과부하될 수 있으므로, 설정을 신중하게 조정할 필요가 있습니다.



## 5 Cross-Zone Load Balancing in Network Load Balancer (NLB)

### 5.1 정의 및 기능

- **Cross-Zone Load Balancing**은 Network Load Balancer(NLB)에서 여러 가용 영역(AZ)에 걸쳐 트래픽을 고르게 분산시키는 기능입니다.
- 이 기능을 활성화하면, NLB는 동일 리전 내의 모든 가용 영역에 걸쳐 있는 타겟 인스턴스에 트래픽을 균등하게 분배합니다.
- 이를 통해 특정 가용 영역에 트래픽이 과도하게 집중되는 것을 방지하고, 전체 인프라의 안정성과 가용성을 높일 수 있습니다.



### 5.2 작동 방식

- Cross-Zone Load Balancing이 활성화된 경우, NLB는 각 가용 영역의 모든 타겟에 균등하게 트래픽을 분산합니다.
- 예를 들어, 두 개의 가용 영역(AZ A, AZ B)에 각각 4개의 타겟 인스턴스가 있을 경우, Cross-Zone Load Balancing을 사용하면 각 인스턴스는 전체 리전에서 들어오는 트래픽의 1/8씩을 처리하게 됩니다.



### 5.3 활성화 방법

- 기본적으로 Network Load Balancer(NLB)의 Cross-Zone Load Balancing 기능은 **비활성화**되어 있습니다.
- AWS Management Console, CLI, SDK를 통해 NLB의 설정에서 Cross-Zone Load Balancing을 활성화할 수 있습니다.
- NLB를 생성하거나 기존 NLB의 설정을 편집할 때, 이 기능을 활성화하거나 비활성화할 수 있습니다.



### 5.4 장점과 고려 사항

- **장점**
    - 고가용성: 특정 가용 영역의 인스턴스에 장애가 발생하더라도, 다른 가용 영역의 인스턴스가 트래픽을 처리할 수 있어 서비스의 중단을 최소화할 수 있습니다.
    - 부하 균등화: 모든 가용 영역에 걸쳐 트래픽이 균등하게 분배되어, 인스턴스 간의 부하가 고르게 분포됩니다.
- **고려 사항**
    - 비용: Cross-Zone Load Balancing 기능이 활성화되면, 가용 영역 간의 데이터 전송 비용이 발생할 수 있습니다.
    - 일부 상황에서는 가용 영역 간의 트래픽 분배를 신중하게 계획해야 할 필요가 있습니다.