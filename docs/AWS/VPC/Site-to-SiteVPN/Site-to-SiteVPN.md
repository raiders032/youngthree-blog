## 1 AWS Site-to-Site VPN

- AWS Site-to-Site VPN은 Amazon Web Services(AWS)에서 제공하는 서비스로, 온프레미스 네트워크와 AWS의 가상 사설 클라우드(VPC)를 안전하게 연결하는 방법을 제공합니다.
- 이 서비스는 공용 인터넷을 통해 암호화된 통신을 제공하여, 두 네트워크 간의 데이터를 안전하게 전송할 수 있도록 합니다.



### 1.1 주요 개념

- **VPN 연결**: 온프레미스 장비와 VPC 간의 보안 연결입니다.
- **VPN 터널**: 고객 네트워크와 AWS 간의 암호화된 링크로, 고가용성을 위해 각 VPN 연결에는 두 개의 터널이 포함됩니다.
- **고객 게이트웨이(Customer Gateway)**: AWS 측에 고객의 게이트웨이 장비 정보를 제공하는 AWS 리소스입니다.
- **고객 게이트웨이 장비**: 고객 측의 Site-to-Site VPN 연결을 위한 물리적 장비 또는 소프트웨어 애플리케이션입니다.
- **타겟 게이트웨이(Target Gateway)**: AWS 측의 VPN 엔드포인트를 일반적으로 지칭하는 용어입니다.
- **가상 프라이빗 게이트웨이(Virtual Private Gateway)**: VPC에 연결되는 AWS 측의 VPN 엔드포인트입니다.
- **트랜짓 게이트웨이(Transit Gateway)**: 여러 VPC와 온프레미스 네트워크를 상호 연결하고, VPN 엔드포인트로 사용할 수 있는 허브 역할을 합니다.



## 2 Site-to-Site VPN의 기능

- **IKEv2 지원**: 최신 암호화 표준을 사용하여 보안성을 높입니다.
- **NAT 트래버설**: NAT(Network Address Translation) 장치 뒤에 있는 장비와의 통신을 지원합니다.
- **다양한 암호화 옵션**: AES 256-bit 암호화, SHA-2 해싱, 다양한 Diffie-Hellman 그룹 등.
- **클라우드워치 메트릭스**: VPN 연결 상태와 성능을 모니터링할 수 있습니다.
- **재사용 가능한 IP 주소**: 고객 게이트웨이의 IP 주소를 재사용할 수 있습니다.
- **IPv6 지원**: 트랜짓 게이트웨이에서 IPv6 트래픽 지원.



## 3 Site-to-Site VPN의 제한 사항

- **IPv6 제한**: 가상 프라이빗 게이트웨이를 통한 VPN 연결에서는 IPv6 트래픽을 지원하지 않습니다.
- **Path MTU Discovery 미지원**: 경로 최대 전송 단위(Path Maximum Transmission Unit) 탐색을 지원하지 않습니다.



## 4 관리 및 가격

- **관리 인터페이스**: AWS Management Console, AWS CLI, AWS SDKs, Query API 등을 통해 Site-to-Site VPN 리소스를 관리할 수 있습니다.
- **가격**: VPN 연결 시간과 데이터 전송에 따라 요금이 부과됩니다. 자세한 내용은 [AWS Site-to-Site VPN 가격 페이지](https://aws.amazon.com/vpn/pricing/)에서 확인할 수 있습니다.