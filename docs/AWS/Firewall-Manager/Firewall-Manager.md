## 1 Firewall Manager

- AWS Firewall Manager는 AWS Network Firewall과 같은 보안 서비스를 중앙에서 관리할 수 있는 서비스입니다.
- 이를 사용하면, 다수의 VPC 및 AWS 계정에 걸쳐 일관된 보안 정책을 쉽게 적용하고 관리할 수 있습니다.
- 이는 특히 대규모 환경에서 보안 정책의 일관성을 유지하고, 복잡한 구성 관리를 단순화하는 데 매우 유용합니다.



## 2 Network Firewall과 Firewall Manager의 연동

- AWS Network Firewall과 AWS Firewall Manager의 통합은 강력한 네트워크 보안 구성을 가능하게 합니다.
    - [[Network-Firewall]] 참고
- 사용자는 Network Firewall을 통해 세부적인 보안 규칙을 설정하고, 이 규칙들을 Firewall Manager를 사용하여 여러 VPC 및 계정에 걸쳐 일관되게 적용할 수 있습니다.
- 이러한 방식으로, 사용자는 AWS 환경 전체에 걸쳐 일관된 보안 정책을 유지하면서도, 필요에 따라 특정 VPC 또는 계정에 대한 세부적인 규칙 조정이 가능합니다.



## 3 AWS WAF 및 AWS Shield와의 연동

- **AWS WAF (Web Application Firewall)**
    - **AWS Firewall Manager**를 사용하여 여러 AWS 계정 및 리소스에 걸쳐 일관된 웹 애플리케이션 방화벽 규칙을 배포할 수 있습니다.
    - 웹 애플리케이션 방화벽 규칙을 통해 SQL 인젝션, 크로스 사이트 스크립팅(XSS) 등의 웹 기반 공격을 방어합니다.
    - 관리형 규칙 세트를 사용하여 빠르게 위협에 대응할 수 있으며, 커스텀 규칙을 통해 특정 애플리케이션의 요구사항에 맞는 보안 구성을 할 수 있습니다.
- **AWS Shield**
    - AWS Shield와의 통합을 통해 DDoS(Distributed Denial of Service) 공격으로부터 보호할 수 있습니다.
    - **AWS Shield Standard**는 기본적으로 제공되는 DDoS 보호 서비스이며, **AWS Shield Advanced**는 더욱 강력한 보호와 실시간 공격 대응을 제공합니다.
    - **AWS Firewall Manager**는 AWS Shield Advanced를 사용하여 모든 AWS 계정과 리소스에 걸쳐 일관된 DDoS 방어 전략을 수립하고 관리할 수 있게 해줍니다.
    - Firewall Manager는 또한 AWS Shield Advanced에서 제공하는 비용 보호 기능을 통해 DDoS 공격 중 발생할 수 있는 비용을 관리할 수 있게 해줍니다.