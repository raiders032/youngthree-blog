## 1 AWS API Gateway Endpoint Types

- AWS API Gateway는 RESTful API와 WebSocket API를 생성, 배포, 관리할 수 있는 완전관리형 서비스입니다.
- API Gateway는 세 가지 주요 엔드포인트 유형을 제공합니다.
- 각 엔드포인트 유형은 특정 사용 사례와 요구 사항에 맞게 설계되었습니다.



## 2 Edge-Optimized Endpoint

- Edge-Optimized 엔드포인트는 API Gateway의 기본 엔드포인트 유형입니다.
- 전 세계에 분산된 클라이언트를 대상으로 하는 API에 적합합니다.
- 주요 특징:
	- 클라이언트의 요청은 CloudFront Edge 로케이션을 통해 라우팅됩니다.
	- 이를 통해 전반적인 지연 시간을 개선할 수 있습니다.
	- API Gateway 자체는 여전히 하나의 리전에만 존재합니다.



## 3 Regional Endpoint

- Regional 엔드포인트는 API와 동일한 리전 내에 있는 클라이언트를 위해 설계되었습니다.
- 주요 특징:
	- 같은 리전 내의 클라이언트에게 최적화된 성능을 제공합니다.
	- 필요한 경우 CloudFront와 수동으로 결합할 수 있습니다.
	- CloudFront와 수동으로 결합하면 캐싱 전략과 배포에 대한 더 많은 제어권을 가질 수 있습니다.



## 4 Private Endpoint

- Private 엔드포인트는 VPC 내부에서만 접근 가능한 API를 위한 옵션입니다.
- 주요 특징:
	- VPC 내부의 인터페이스 VPC 엔드포인트(ENI)를 통해서만 접근할 수 있습니다.
	- 접근 제어를 위해 리소스 정책을 사용합니다.
	- 높은 수준의 보안이 요구되는 내부 서비스에 적합합니다.



## 5 엔드포인트 유형 비교

### 5.1 Edge-Optimized vs Regional

- **Edge-Optimized**:
	- 글로벌 사용자 기반을 가진 애플리케이션에 적합
	- CloudFront를 자동으로 활용하여 지연 시간 감소
- **Regional**:
	- 특정 리전 내의 사용자를 대상으로 하는 애플리케이션에 적합
	- 필요시 CloudFront와 수동 통합 가능



### 5.2 Private vs Public (Edge-Optimized 및 Regional)

- **Private**:
	- VPC 내부에서만 접근 가능
	- 높은 보안이 요구되는 내부 서비스에 적합
- **Public (Edge-Optimized 및 Regional)**:
	- 인터넷을 통해 공개적으로 접근 가능
	- 일반적인 웹 서비스 및 모바일 앱 백엔드에 적합



## 6 엔드포인트 선택 가이드

- **글로벌 사용자 기반**: Edge-Optimized 엔드포인트 사용
- **특정 리전 내 사용자**: Regional 엔드포인트 사용
- **세밀한 캐싱 제어 필요**: Regional 엔드포인트 + CloudFront 수동 통합
- **VPC 내부 서비스**: Private 엔드포인트 사용



## 7 결론

- API Gateway의 다양한 엔드포인트 유형은 다양한 사용 사례와 요구 사항을 충족시킵니다.
- 적절한 엔드포인트 유형을 선택함으로써 성능을 최적화하고 보안을 강화할 수 있습니다.
- 프로젝트의 요구 사항을 신중히 고려하여 가장 적합한 엔드포인트 유형을 선택하는 것이 중요합니다.