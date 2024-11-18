## 1 Amazon API Gateway

- Amazon API Gateway는 개발자가 안전하게 API를 생성, 게시, 유지 관리, 모니터링 및 보호할 수 있도록 지원하는 완전 관리형 서비스입니다. 
- API Gateway는 웹 애플리케이션, 백엔드 서비스, 마이크로서비스, 모바일 애플리케이션, IoT 디바이스 등을 위한 API를 구축하고 관리하는 데 필요한 모든 기능을 제공합니다.



## 2. 주요 기능

### 2.1 API 생성 및 관리

- Amazon API Gateway는 RESTful API 및 WebSocket API를 쉽게 생성하고 관리할 수 있습니다. 
- API Gateway는 AWS Management Console, CLI, SDK 또는 API를 통해 API를 생성하고 구성할 수 있는 다양한 방법을 제공합니다.
- **RESTful API**: HTTP를 통해 요청과 응답을 주고받는 API를 구축할 수 있습니다.
- **WebSocket API**: 실시간 양방향 통신이 필요한 애플리케이션을 위한 API를 구축할 수 있습니다.



### 2.2 통합 및 변환

- API Gateway는 다양한 백엔드 서비스와 통합할 수 있어, 데이터 변환, 요청 및 응답 매핑, 사용자 정의 로직 실행 등을 유연하게 수행할 수 있습니다. 
- 주요 통합 옵션은 다음과 같습니다
	- AWS Lambda 통합: Lambda 함수를 호출하여 요청을 처리합니다.
	- HTTP 엔드포인트 통합: 외부 HTTP 엔드포인트와의 통합을 지원합니다.
	- AWS 서비스 통합: 다른 AWS API를 API Gateway를 통해 노출할 수 있습니다.
	- Mock 통합: 백엔드 없이도 API를 테스트할 수 있습니다.



### 2.3 보안 및 접근 제어

- API Gateway는 다양한 보안 기능을 제공하여 API를 보호합니다.
- **AWS Identity and Access Management (IAM)**: 사용자 및 역할 기반 접근 제어를 설정할 수 있습니다.
- **Amazon Cognito**: 사용자 인증 및 권한 부여를 위한 사용자 풀과 통합할 수 있습니다.
- **API 키**: API 키를 생성하여 클라이언트 응용 프로그램의 접근을 제어할 수 있습니다.
- **사용자 지정 도메인 이름**: 사용자 지정 도메인을 사용하여 API의 접근성을 높일 수 있습니다.



### 2.4 성능 최적화 및 캐싱

- API Gateway는 API 응답 시간을 단축하고 비용을 절감할 수 있는 다양한 성능 최적화 기능을 제공합니다.
- **캐싱**: API 응답을 캐싱하여 백엔드 서비스의 부하를 줄이고 응답 시간을 단축할 수 있습니다.
- **단계(Stage)**: 개발, 테스트, 프로덕션 등의 단계별로 API를 배포하고 관리할 수 있습니다.
- **스로틀링**: 클라이언트 요청을 제한하여 API의 성능을 최적화할 수 있습니다.



### 2.5 모니터링 및 로깅

- API Gateway는 API의 성능과 상태를 모니터링하고 문제를 해결할 수 있는 다양한 도구를 제공합니다.
- **Amazon CloudWatch**: API 호출 메트릭을 모니터링하고 알림을 설정할 수 있습니다.
- **AWS CloudTrail**: API 호출 이력을 기록하여 보안 및 규정 준수를 지원합니다.
- **API Gateway 액세스 로그**: API 요청과 응답에 대한 자세한 로그를 생성할 수 있습니다.



## 3 사용 사례

### 3.1 서버리스 백엔드

- API Gateway는 AWS Lambda와 결합하여 서버리스 백엔드를 구축할 수 있습니다. 
- 이를 통해 인프라 관리 없이 코드 실행과 API 요청 처리를 할 수 있습니다.



### 3.2 마이크로서비스 아키텍처

- API Gateway는 마이크로서비스 아키텍처를 구현하는 데 유용합니다. 
- 각 마이크로서비스를 독립적으로 관리하고, API Gateway를 통해 서비스 간 통신을 쉽게 할 수 있습니다.



### 3.3 모바일 및 웹 애플리케이션

- API Gateway는 모바일 및 웹 애플리케이션의 백엔드 API로 사용될 수 있습니다. 
- Amazon Cognito와 통합하여 사용자 인증 및 권한 부여를 간편하게 관리할 수 있습니다.



## 4 VPC 링크

- VPC 링크(VPC Link)는 Amazon API Gateway에서 API를 AWS VPC(가상 사설 클라우드) 내부의 프라이빗 리소스에 연결할 수 있게 해주는 기능입니다.
- 이를 통해 API Gateway는 VPC 내부의 프라이빗 리소스와 안전하게 통신할 수 있으며, 이 과정에서 공용 인터넷을 통하지 않고 AWS 내부 네트워크를 사용합니다.


### 4.1 VPC 링크의 주요 기능

- **프라이빗 통합 지원**: VPC 링크를 사용하면 API Gateway가 VPC 내부의 EC2 인스턴스, RDS 데이터베이스, 내부 웹 애플리케이션 등 프라이빗 리소스에 접근할 수 있습니다.
- **보안 강화**: 공용 인터넷을 사용하지 않고 AWS 내부 네트워크를 통해 연결을 유지하므로 데이터 전송의 보안성이 강화됩니다.
- **AWS PrivateLink 통합**: VPC 링크는 AWS PrivateLink와 통합되어, API Gateway와 VPC의 프라이빗 리소스 간의 연결을 가능하게 합니다.



### 4.2 VPC 링크의 종류

- **REST API를 위한 VPC 링크**: REST API에서 VPC 내부의 프라이빗 리소스에 접근하려면 VPC 링크를 설정해야 합니다. 이때 AWS PrivateLink를 통해 연결이 이루어집니다.
- **HTTP API를 위한 VPC 링크**: HTTP API에서는 VPC 링크를 통해 Application Load Balancer(ALB)나 AWS Cloud Map 서비스와 같은 다양한 백엔드 리소스에 접근할 수 있습니다. 이 경우 AWS PrivateLink를 사용하지 않으며, VPC 간 NAT를 사용하여 연결을 관리합니다.



### 4.3 사용 사례

- **내부 애플리케이션 통합**: 기업의 내부 애플리케이션이 API Gateway를 통해 프라이빗 리소스에 접근하도록 할 때 유용합니다.
- **보안 및 규정 준수 강화**: 외부 인터넷을 통한 데이터 전송을 방지하고 AWS 네트워크를 활용하여 보안을 강화할 수 있습니다.
- **멀티 테넌시 환경**: 여러 VPC에서 API Gateway를 통해 공통 프라이빗 리소스에 접근해야 할 때 VPC 링크를 활용할 수 있습니다.



### 4.4 Amazon ECS와의 통합

- **Amazon ECS와의 통합**: Amazon ECS(Elastic Container Service)는 컨테이너화된 애플리케이션을 관리하기 위한 서비스입니다. API Gateway와 Amazon ECS는 VPC 링크를 통해 통합될 수 있습니다.
- **프라이빗 ECS 서비스 접근**: API Gateway를 통해 프라이빗 ECS 서비스로의 요청을 처리할 수 있습니다. 이를 통해 API Gateway는 ECS 클러스터 내부의 컨테이너로 트래픽을 전달하고, ECS는 API Gateway를 통해 외부 요청을 처리할 수 있습니다.
- **ALB를 통한 로드 밸런싱**: VPC 링크를 설정할 때, API Gateway는 Application Load Balancer(ALB)를 사용하여 Amazon ECS의 컨테이너 인스턴스에 트래픽을 분배합니다. 이는 컨테이너화된 애플리케이션의 확장성 및 가용성을 높여줍니다.
- **보안 및 네트워크 관리**: API Gateway와 ECS 간의 통신은 AWS의 네트워크 인프라를 통해 보호되며, 세부적인 보안 그룹 설정을 통해 접근 제어를 관리할 수 있습니다.



## 5 API Gateway - CloudWatch Metrics

- API Gateway는 CloudWatch와 통합되어 다양한 메트릭을 제공합니다. 이를 통해 API의 성능과 상태를 모니터링할 수 있습니다.
- 메트릭은 스테이지별로 제공되며, 상세 메트릭을 활성화할 수 있는 옵션이 있습니다.
- 주요 메트릭:
	- **CacheHitCount & CacheMissCount**: 캐시의 효율성을 측정합니다.
	- **Count**: 주어진 기간 동안의 총 API 요청 수를 나타냅니다.
	- **IntegrationLatency**: API Gateway가 백엔드로 요청을 전달하고 응답을 받는 데 걸리는 시간을 측정합니다.
	- **Latency**: 클라이언트의 요청부터 응답까지 걸리는 총 시간을 측정합니다. 이는 IntegrationLatency와 API Gateway의 오버헤드를 포함합니다.
	- **4XXError (클라이언트 측) & 5XXError (서버 측)**: 클라이언트 및 서버 측 오류의 발생 횟수를 측정합니다.
- 이러한 메트릭을 통해 API의 성능, 오류율, 캐시 효율성 등을 모니터링하고 최적화할 수 있습니다.



## 6 API Gateway - 로깅 및 추적

- API Gateway는 로깅과 추적 기능을 제공하여 API 요청과 응답에 대한 상세한 정보를 수집하고 분석할 수 있게 합니다.



### 6.1 CloudWatch Logs

- CloudWatch Logs는 요청/응답 본문에 대한 정보를 포함합니다.
- 스테이지 레벨에서 CloudWatch 로깅을 활성화할 수 있으며, 로그 레벨(ERROR, DEBUG, INFO)을 설정할 수 있습니다.
- API 별로 설정을 오버라이드할 수 있어 유연한 로깅 관리가 가능합니다.



### 6.2 X-Ray

- X-Ray를 활성화하면 API Gateway에서 요청에 대한 추가 정보를 얻을 수 있습니다.
- X-Ray API Gateway와 AWS Lambda를 함께 사용하면 전체적인 요청 흐름을 파악할 수 있습니다.



**참고 자료**
- [Amazon API Gateway 공식 문서](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)
- [AWS Management Console](https://aws.amazon.com/console/)
