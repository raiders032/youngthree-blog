## 1 AWS ELB의 모니터링과 메트릭: 성능 최적화를 위한 종합 가이드

- Amazon Elastic Load Balancer(ELB)는 애플리케이션의 트래픽을 효율적으로 분산시키는 핵심 서비스입니다.
- ELB의 성능을 최적화하고 문제를 신속하게 해결하기 위해서는 모니터링과 메트릭 분석이 필수적입니다.
- 이 글에서는 ELB의 주요 모니터링 메트릭, 문제 해결 방법, 그리고 관련 기능들을 상세히 알아보겠습니다.



## 2 ELB 모니터링의 중요성

- ELB 모니터링을 통해 다음과 같은 이점을 얻을 수 있습니다:
	- 서비스 가용성 향상
	- 성능 병목 현상 조기 발견
	- 비정상적인 트래픽 패턴 감지
	- 리소스 사용 최적화
	- 사용자 경험 개선



## 3 CloudWatch를 통한 ELB 메트릭 모니터링

- 모든 ELB 메트릭은 CloudWatch로 직접 전송됩니다.
- 주요 메트릭은 다음과 같습니다:
	- BackendConnectionErrors: 백엔드 연결 오류 수
	- HealthyHostCount: 정상 상태의 호스트 수
	- UnHealthyHostCount: 비정상 상태의 호스트 수
	- Latency: 요청 처리 지연 시간
	- RequestCount: 총 요청 수
	- RequestCountPerTarget: 대상당 요청 수
	- SurgeQueueLength: 대기 중인 요청 또는 연결 수 (최대 1024)
	- SpilloverCount: 대기열 초과로 거부된 요청 수



## 4 Application Load Balancer(ALB) 특화 메트릭

- ALB는 추가적인 HTTP 관련 메트릭을 제공합니다:
	- HTTPCode_Backend_2XX: 성공적인 요청 수
	- HTTPCode_Backend_3XX: 리다이렉션된 요청 수
	- HTTPCode_ELB_4XX: 클라이언트 오류 수
	- HTTPCode_ELB_5XX: 서버 오류 수



## 5 ELB 문제 해결을 위한 메트릭 활용

- 주요 HTTP 오류 코드와 해결 방법:
	- HTTP 400 (BAD_REQUEST): 클라이언트의 잘못된 요청. 요청 형식 확인 필요.
	- HTTP 503 (Service Unavailable): 정상 인스턴스 부족. HealthyHostCount 메트릭 확인.
	- HTTP 504 (Gateway Timeout): EC2 인스턴스의 keep-alive 설정 확인. 
- 문제 해결을 위한 추가 팁:
	- CloudWatch에서 적절한 경보 설정
	- AWS 공식 문서의 문제 해결 가이드 참조: [ELB 문제 해결 가이드](https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/ts-elb-error-message.html)



## 6 ELB 액세스 로그 활용

- ELB 액세스 로그는 S3에 저장되며 다음 정보를 포함합니다:
	- 시간
	- 클라이언트 IP 주소
	- 지연 시간
	- 요청 경로
	- 서버 응답
	- Trace ID
- 액세스 로그의 장점:
	- 컴플라이언스 요구사항 충족
	- ELB 또는 EC2 인스턴스 종료 후에도 액세스 데이터 보존
	- 기본적으로 암호화되어 저장
	- S3 스토리지 비용만 발생



## 7 Application Load Balancer의 요청 추적

- ALB는 각 HTTP 요청에 'X-Amzn-Trace-Id' 헤더를 추가합니다.
- 예: X-Amzn-Trace-Id: Root=1-67891233-abcdef012345678912345678
- 이 기능은 로그 분석이나 분산 추적 플랫폼에서 단일 요청을 추적하는 데 유용합니다.
- 현재 ALB는 X-Ray와 직접적으로 통합되어 있지 않습니다.



## 8 ELB 모니터링 전략 수립

- 효과적인 ELB 모니터링 전략을 수립하기 위한 단계:
  1. 주요 메트릭 식별: 애플리케이션에 중요한 메트릭을 선별합니다.
  2. 베이스라인 설정: 정상 상태의 메트릭 값을 파악합니다.
  3. 경보 설정: 주요 메트릭에 대한 CloudWatch 경보를 구성합니다.
  4. 대시보드 생성: 중요 메트릭을 한눈에 볼 수 있는 대시보드를 만듭니다.
  5. 로그 분석 자동화: 액세스 로그를 자동으로 분석하는 시스템을 구축합니다.
  6. 정기적인 리뷰: 모니터링 전략을 주기적으로 검토하고 개선합니다.



## 9 결론

- ELB의 효과적인 모니터링은 안정적이고 고성능의 애플리케이션 운영을 위해 필수적입니다.
- CloudWatch 메트릭, 액세스 로그, 요청 추적 등 다양한 도구를 활용하여 종합적인 모니터링 체계를 구축할 수 있습니다.
- 지속적인 모니터링과 분석을 통해 잠재적인 문제를 사전에 파악하고, 서비스의 품질을 꾸준히 개선할 수 있습니다.
- ELB 모니터링은 단순한 관찰을 넘어, 적극적인 성능 최적화와 문제 해결의 핵심 도구로 활용되어야 합니다.