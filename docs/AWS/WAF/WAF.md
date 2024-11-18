## 1 AWS WAF – Web Application Firewall

- AWS WAF(Web Application Firewall)는 웹 애플리케이션을 보호하기 위한 서비스로, 주로 SQL 인젝션 및 XSS(교차 사이트 스크립팅)와 같은 일반적인 웹 공격을 방어합니다.
- HTTP 레벨에서 작동하는 Layer 7 방화벽으로, TCP/UDP 레벨의 Layer 4 방화벽과는 다릅니다.
	- NLB는 Layer 4에서 작동하므로, AWS WAF와는 호환되지 않습니다.
- 네트워크 로드 밸런서(Layer 4)는 지원하지 않으며, 고정 IP를 사용하기 위해서는 Global Accelerator를 사용하고 ALB에 WAF를 적용할 수 있습니다.
- AWS WAF는 Layer 7에서 작동하는 웹 애플리케이션 방화벽입니다.



## 2 주요 기능

### 2.1 웹 ACL (Web Access Control List) 정의

- 웹 애플리케이션에 적용할 규칙을 정의합니다.
- **IP Set**: 최대 10,000개의 IP 주소를 설정할 수 있으며, 더 많은 IP를 설정하려면 여러 규칙을 사용할 수 있습니다.
- **HTTP 헤더, HTTP 본문, URI 문자열**: 특정 패턴을 기반으로 필터링할 수 있습니다.
- **공격 보호**: SQL 인젝션, XSS와 같은 일반적인 공격을 방어합니다.
- **크기 제한 및 지리적 매칭**: 특정 크기 이상의 요청을 차단하거나 특정 국가에서의 접근을 차단할 수 있습니다.
- **Rate-based 규칙**: 이벤트 발생 빈도를 기준으로 규칙을 설정하여 DDoS 공격을 방어할 수 있습니다.
- **웹 ACL의 범위**: CloudFront를 제외하고는 지역별로 적용됩니다.



### 2.2 다양한 배포 옵션

- AWS WAF는 여러 AWS 서비스에 배포할 수 있습니다.
- **Application Load Balancer(ALB)**: ALB에 WAF를 적용하여 웹 애플리케이션을 보호합니다.
- **API Gateway**: API 트래픽을 보호할 수 있습니다.
- **CloudFront**: 글로벌 콘텐츠 배포 네트워크와 통합하여 보안을 강화합니다.
- **AppSync GraphQL API**: GraphQL API를 보호합니다.
- **Cognito User Pool**: 사용자 풀을 보호합니다.



### 2.3 고정 IP 지원

- 네트워크 로드 밸런서(Layer 4)는 AWS WAF를 지원하지 않으므로, 고정 IP를 사용하려면 Global Accelerator를 통해 고정 IP를 설정하고 Application Load Balancer에 WAF를 적용할 수 있습니다.



## 3 사용 사례

### 3.1 웹 애플리케이션 보호

- AWS WAF를 사용하여 SQL 인젝션 및 XSS 공격으로부터 웹 애플리케이션을 보호할 수 있습니다.
- 웹 ACL을 사용하여 특정 IP 주소나 지리적 위치에서의 접근을 차단할 수 있습니다.



### 3.2 DDoS 방어

- HTTP Flood 공격은 많은 양의 HTTP 요청을 보내 웹 서버의 자원을 소모시켜 서비스를 방해하는 DDoS(Distributed Denial of Service) 공격 유형입니다.
- AWS WAF를 사용하여 HTTP Flood 공격을 효과적으로 방지할 수 있습니다.
- **Rate-based 규칙**
	- 특정 시간 동안의 요청 수를 기반으로 비정상적인 트래픽을 탐지하고 차단합니다.
	- 예를 들어, 특정 IP 주소가 초당 일정 횟수 이상의 요청을 보내면 해당 IP를 차단할 수 있습니다.
- **위협 인텔리전스 피드**: 실시간으로 제공되는 위협 인텔리전스 데이터를 사용하여 알려진 악성 IP 주소를 차단할 수 있습니다.
- **자동화된 대응**: CloudWatch와 통합하여 실시간 로그와 지표를 통해 비정상적인 트래픽 패턴을 탐지하고 자동으로 대응합니다.



### 3.3 규정 준수

- AWS WAF는 웹 애플리케이션 보안 규정을 준수하는 데 도움이 됩니다.
- 금융 서비스, 헬스케어, 정부 기관 등 다양한 산업의 보안 요구 사항을 충족할 수 있습니다.



## 4 지리적 접근 제한

- AWS WAF는 지리적 위치를 기반으로 특정 국가나 지역에서의 접근을 차단할 수 있습니다.
- **Geolocation 조건**: 웹 ACL 규칙에 지리적 위치를 추가하여 특정 국가에서의 트래픽을 허용하거나 차단할 수 있습니다.
- **사용 사례**: 특정 국가의 법적 규정을 준수하거나, 특정 국가에서 발생하는 의심스러운 트래픽을 차단하는 데 유용합니다.



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



**참고 자료**

- [AWS WAF 공식 문서](https://aws.amazon.com/ko/waf/)
- [AWS WAF 관리형 규칙](https://aws.amazon.com/ko/waf/managed-rules/)
- [AWS WAF 블로그](https://aws.amazon.com/ko/blogs/security/tag/aws-waf/)
