## 1 Shield

- AWS Shield는 Amazon Web Services(AWS)에서 제공하는 DDoS(Distributed Denial of Service) 공격 방어 서비스입니다.
- AWS Shield는 두 가지 버전, 즉 기본 보호 기능을 제공하는 AWS Shield Standard와 향상된 보호 기능을 제공하는 AWS Shield Advanced로 나뉩니다. 



## 2 AWS Shield Standard

- AWS Shield Standard는 모든 AWS 고객에게 기본적으로 제공되는 DDoS 보호 서비스입니다. 
- 추가 비용 없이 제공되며, 대부분의 일반적인 네트워크 및 전송 계층 DDoS 공격을 자동으로 감지하고 완화합니다.



**주요기능**

- 자동 보호: AWS Shield Standard는 모든 AWS 서비스에 기본적으로 적용되어 네트워크 및 전송 계층에서 발생하는 DDoS 공격을 자동으로 방어합니다.
- 24/7 모니터링: AWS 인프라는 연중무휴 모니터링되며, DDoS 공격 발생 시 자동으로 탐지 및 완화됩니다.
- 글로벌 네트워크: AWS의 글로벌 네트워크 인프라를 활용하여 대규모 DDoS 공격을 효율적으로 완화합니다.
- 추가 비용 없음: AWS Shield Standard는 추가 비용 없이 제공되며, AWS WAF 및 기타 AWS 서비스 요금에 포함되어 있습니다.



## 3 AWS Shield Advanced

- AWS Shield Advanced는 보다 강화된 DDoS 보호 기능을 제공하며, 중요한 애플리케이션을 보호하기 위한 추가적인 보안 기능과 전문적인 지원을 제공합니다. 
- AWS Shield Advanced는 추가 비용이 발생하지만, 대규모 DDoS 공격에 대한 보다 종합적인 보호를 원하는 고객에게 적합합니다.
- AWS Shield Advanced는 Amazon EC2 인스턴스, Elastic Load Balancing 로드 밸런서, Amazon CloudFront, 그리고 Amazon Route 53 호스팅 영역에 대한 확장된 DDoS 공격 보호 기능을 제공합니다.



**주요 기능**

- 확장된 DDoS 보호: AWS Shield Advanced는 네트워크 및 전송 계층뿐만 아니라 애플리케이션 계층의 DDoS 공격도 방어합니다.
- 실시간 공격 대시보드: AWS 관리 콘솔에서 실시간으로 DDoS 공격 현황을 모니터링할 수 있는 대시보드를 제공합니다.
- DDoS 대응 팀(DRT) 지원: DDoS 공격 발생 시 AWS의 DDoS 대응 팀(DRT)으로부터 24/7 지원을 받을 수 있습니다.
- 비용 보호: DDoS 공격으로 인해 발생한 AWS 서비스 사용량 증가 비용을 보호합니다.
- 애플리케이션 레이어 보호: AWS WAF(Web Application Firewall)와 통합하여 애플리케이션 계층의 공격도 방어합니다.
- 확장된 로그 및 보고: 공격 로그와 보고서를 통해 상세한 분석과 대응을 지원합니다.




## 4 AWS Shield와 통합되는 주요 서비스

- AWS Shield는 여러 AWS 서비스와 통합되어 DDoS 공격으로부터 애플리케이션을 보호합니다.
- **주요 통합 서비스**
	- **Amazon CloudFront**: AWS Shield는 CloudFront와 통합하여 전 세계적으로 분산된 콘텐츠 전송을 보호합니다. CloudFront의 글로벌 엣지 로케이션 네트워크와 결합하여 DDoS 공격을 효과적으로 방어합니다.
	- **Elastic Load Balancing (ELB)**: AWS Shield는 ELB와 통합하여 웹 애플리케이션의 트래픽을 분산하고 DDoS 공격으로부터 보호합니다. ALB(Application Load Balancer), NLB(Network Load Balancer) 및 CLB(Classic Load Balancer) 모두 지원됩니다.
	- **Amazon Route 53**: AWS Shield는 Amazon Route 53과 통합하여 DNS 기반의 DDoS 공격을 방어합니다. 글로벌 DNS 인프라와 결합하여 높은 가용성과 탄력성을 제공합니다.
	- **AWS Global Accelerator**: AWS Shield는 AWS Global Accelerator와 통합하여 여러 AWS 리전 간의 애플리케이션 가용성과 성능을 향상시키는 동시에 DDoS 공격을 완화합니다.



## 5 주요 AWS 보안 서비스와 비교

- **Macie**:
    - **목적**: 민감한 데이터 보호에 중점을 두고 S3 버킷의 민감한 데이터를 자동으로 식별하고 보안 위험을 평가합니다.
    - **주요 기능**: 기계 학습을 사용한 데이터 분류 및 데이터 보호 모니터링, S3 버킷 보안 분석.
- **Inspector**:
    - **목적**: EC2 인스턴스, 컨테이너, Lambda 함수의 소프트웨어 취약성을 검사하여 보안 문제를 조기에 발견하고 해결합니다.
    - **주요 기능**: 자동화된 취약성 평가, 보안 모범 사례 준수 검토, 상세 보고서 제공.
- **GuardDuty**:
    - **목적**: AWS 계정 및 리소스에 대한 실시간 위협 탐지 기능을 제공하여 보안 위협에 신속하게 대응합니다.
    - **주요 기능**: 기계 학습을 활용한 이상 징후 탐지, CloudTrail, VPC Flow Logs, DNS 로그 분석, 보안 이벤트 통지.
- **Detective**:
    - **목적**: 보안 사건의 원인 분석 및 포렌식 조사에 도움을 주며, GuardDuty와 통합하여 위협의 근본 원인을 파악합니다.
    - **주요 기능**: 시각적 데이터 분석, GuardDuty 및 AWS CloudTrail 통합, 상관 관계 분석.
- **WAF (Web Application Firewall)**:
    - **목적**: 웹 애플리케이션을 다양한 웹 공격으로부터 보호합니다.
    - **주요 기능**: SQL 인젝션, 크로스 사이트 스크립팅(XSS) 등의 공격 차단, 사용자 정의 규칙 작성, 실시간 웹 트래픽 모니터링.
- **Shield**:
    - **목적**: AWS 애플리케이션을 DDoS 공격으로부터 보호합니다.
    - **주요 기능**: 자동화된 DDoS 보호(Shield Standard), 고급 보호 및 비용 보호(Shield Advanced), 24/7 DDoS 응답 팀 지원.