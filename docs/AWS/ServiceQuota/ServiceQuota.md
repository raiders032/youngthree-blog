## 1 AWS Service Quota

- AWS Service Quota는 AWS 계정의 리소스나 작업에 대한 최대 제한값입니다.
- 이전에는 'AWS Service Limits'라고 불렸습니다.
- 각 AWS 서비스별로 기본 할당량이 설정되어 있습니다.
- 비즈니스 요구사항에 따라 할당량 증가를 요청할 수 있습니다.
- AWS는 이러한 제한을 통해 리소스의 과도한 프로비저닝을 방지합니다.



## 2 EC2 Service Quota의 주요 항목

- EC2 인스턴스 실행 제한
	- 리전별로 실행할 수 있는 최대 인스턴스 수
	- 인스턴스 유형별로 다른 제한이 적용될 수 있음
- 예약 인스턴스 제한
- EBS 볼륨 제한
- 탄력적 IP 주소 제한
- AMI 제한
- 스냅샷 제한



## 3 Service Quota 확인 방법

- AWS Management Console을 통한 확인:
	- Service Quotas 콘솔에서 확인
	- EC2 대시보드의 'Limits' 섹션에서 확인
- AWS CLI를 통한 확인:
	- `aws service-quotas list-service-quotas` 명령 사용
- AWS API를 통한 확인:
	- Service Quotas API 사용
	- ListServiceQuotas 작업 호출



## 4 Service Quota 모니터링

### 4.1 CloudWatch를 통한 모니터링

- Service Quotas는 CloudWatch와 통합되어 있습니다.
- 할당량 사용률을 CloudWatch 지표로 확인할 수 있습니다.
- CloudWatch 경보를 설정하여 특정 임계값에 도달하면 알림을 받을 수 있습니다.



### 4.2 할당량 사용률 경보 설정

- Service Quotas 콘솔에서 직접 CloudWatch 경보 생성 가능:
	- 특정 서비스의 할당량 선택
	- '알림 생성' 옵션 선택
	- 사용률 임계값 설정 (예: 70%)
	- SNS 토픽 설정하여 알림 수신
- 이는 가장 운영 효율적인 모니터링 방법입니다.



### 4.3 수동 모니터링 구현

- Lambda 함수를 사용한 커스텀 모니터링도 가능합니다:
	- Service Quotas API를 호출하여 현재 사용량 확인
	- 사용률 계산 및 임계값 비교
	- SNS를 통한 알림 전송
- EventBridge로 정기적인 모니터링 자동화 가능
- 하지만 이는 추가적인 유지보수가 필요하므로 권장되지 않습니다.



## 5 Service Quota 관리 모범 사례

- 프로덕션 환경을 위한 권장사항:
	- 할당량 사용률 70% 이상에서 경보 설정
	- 정기적인 할당량 사용률 검토
	- 필요한 경우 미리 할당량 증가 요청
	- 자동화된 모니터링 구축



### 5.1 할당량 증가 요청

- AWS Support Center를 통해 요청 가능
- Service Quotas 콘솔에서 직접 요청 가능
- 증가 요청 시 고려사항:
	- 비즈니스 필요성 설명
	- 예상 사용량 제시
	- 현재 사용 패턴 설명



### 5.2 자동 할당량 관리

- AWS Auto Scaling과 함께 사용할 때 주의사항:
	- Auto Scaling 그룹의 최대 용량이 EC2 인스턴스 할당량을 초과하지 않도록 설정
	- 할당량에 여유를 두어 긴급 상황 대비
	- 할당량 초과 시 자동 조정 작업이 실패할 수 있음



## 6 CloudWatch와 SNS를 활용한 할당량 모니터링 구성

### 6.1 CloudWatch 경보 생성

- Service Quotas 콘솔에서:
	- 해당 EC2 서비스 할당량 선택
	- CloudWatch 경보 생성 옵션 선택
	- 임계값 70% 설정
	- 경보 상태 진입 시 SNS 알림 설정



### 6.2 SNS 토픽 구성

- 알림을 받을 SNS 토픽 생성
- 이메일, SMS 등 원하는 엔드포인트 구독 설정
- 알림 템플릿 커스터마이즈 가능



## 7 문제 해결 및 대응 방안

- 할당량 한도에 도달했을 때의 대응:
	- 불필요한 리소스 정리
	- 다른 리전으로 워크로드 분산
	- 할당량 증가 요청
	- 리소스 최적화 검토



## 8 결론

- EC2 Service Quota는 AWS 리소스의 효율적인 관리를 위해 중요합니다.
- CloudWatch와 SNS를 활용한 모니터링이 가장 효율적인 방법입니다.
- 할당량 사용률 70%에서 경보를 설정하는 것이 모범 사례입니다.
- 자동화된 모니터링과 적절한 대응 계획이 필요합니다.
- 커스텀 모니터링 구현보다는 AWS 제공 도구 활용이 권장됩니다.