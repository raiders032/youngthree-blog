## 1 개요

- AWS는 인프라 최적화를 위한 두 가지 주요 서비스를 제공합니다:
	- AWS Trusted Advisor
	- AWS Compute Optimizer
- 두 서비스는 서로 다른 목적과 범위를 가지고 있어 상호 보완적으로 사용됩니다.



## 2 서비스 범위 비교

### 2.1 AWS Trusted Advisor

- 포괄적인 AWS 환경 검사를 제공합니다:
	- 비용 최적화
	- 성능
	- 보안
	- 내결함성
	- 서비스 한도
- AWS의 모든 서비스를 대상으로 베스트 프랙티스를 점검합니다.



### 2.2 AWS Compute Optimizer

- 컴퓨팅 리소스에 특화된 상세 분석을 제공합니다:
	- EC2 인스턴스 
	- EBS 볼륨
	- Lambda 함수
	- ECS 서비스
- 머신 러닝을 활용한 심층적인 워크로드 분석을 수행합니다.



## 3 주요 차이점

### 3.1 분석 방식

- **Trusted Advisor**:
	- 현재 상태의 스냅샷을 기반으로 검사
	- 미리 정의된 규칙과 임계값 사용
	- 즉각적인 점검 결과 제공
- **Compute Optimizer**:
	- 최소 14일간의 메트릭 데이터 분석
	- 머신 러닝 알고리즘 활용
	- 워크로드 패턴 기반의 세부적인 분석



### 3.2 추천 범위

- **Trusted Advisor**:
	- AWS 환경 전반에 대한 포괄적 추천
	- 일반적인 모범 사례 기반 권장사항
	- 비용, 보안, 성능 등 다양한 측면 포함
- **Compute Optimizer**:
	- 컴퓨팅 리소스에 대한 깊이 있는 분석
	- 워크로드 특성에 기반한 구체적 권장사항
	- 리소스 사양 최적화에 중점



### 3.3 대상 사용자

- **Trusted Advisor**:
	- 클라우드 아키텍트
	- 시스템 관리자
	- 보안 담당자
	- 비용 관리자
- **Compute Optimizer**:
	- 인프라 엔지니어
	- 성능 최적화 전문가
	- 용량 계획 담당자
	- DevOps 엔지니어



## 4 권장 사용 사례

### 4.1 Trusted Advisor 활용

- 다음과 같은 경우 Trusted Advisor를 사용합니다:
	- AWS 환경의 전반적인 상태 점검
	- 보안 취약점 식별
	- 비용 절감 기회 파악
	- 서비스 한도 모니터링
	- 기본적인 성능 및 가용성 검사



**보안 점검 예시**

```bash
## Trusted Advisor 보안 점검 결과 조회
aws support describe-trusted-advisor-check-result \
    --check-id-security-groups-specific-ports
```



### 4.2 Compute Optimizer 활용

- 다음과 같은 경우 Compute Optimizer를 사용합니다:
	- 워크로드에 최적화된 인스턴스 유형 선택
	- EBS 볼륨 성능 최적화
	- Lambda 함수 메모리 설정 최적화
	- 컨테이너 리소스 할당 최적화



**인스턴스 추천 조회**

```bash
## Compute Optimizer 인스턴스 추천 조회
aws compute-optimizer get-ec2-instance-recommendations \
    --filters Name=Finding,Values=OVER_PROVISIONED
```



## 5 통합 사용 전략

### 5.1 초기 평가

- 새로운 AWS 환경 구축 시:
  1. Trusted Advisor로 전반적인 상태 점검
  2. 기본적인 모범 사례 적용
  3. Compute Optimizer 활성화
  4. 데이터 수집 시작



### 5.2 지속적 최적화

- 운영 중인 환경의 최적화:
  1. Trusted Advisor로 정기적인 상태 점검
  2. Compute Optimizer로 리소스 사용 패턴 분석
  3. 두 서비스의 추천사항 통합 검토
  4. 우선순위에 따른 최적화 실행



## 6 비용 구조

### 6.1 Trusted Advisor

- AWS Support 플랜에 따라 다른 기능 제공:
	- Basic & Developer: 제한된 검사만 가능
	- Business & Enterprise: 전체 검사 가능
	- 추가 비용 없음 (Support 플랜 비용에 포함)



### 6.2 Compute Optimizer

- 기본 사용은 무료:
	- 기본 추천 기능 무료 제공
	- Enhanced Infrastructure Metrics 사용 시 추가 비용
	- 추가 룩백 기간 설정 시 비용 발생



## 7 보고서 및 알림

### 7.1 Trusted Advisor

- 제공하는 보고서:
	- 주간 상태 업데이트
	- 점검 항목별 상세 보고서
	- CSV 형식 내보내기
	- CloudWatch와 통합된 알림



### 7.2 Compute Optimizer

- 제공하는 보고서:
	- 리소스별 상세 분석 보고서
	- 비용 절감 예측
	- 성능 개선 기회
	- 추천 사항 이력



## 8 결론

- 두 서비스는 각각의 강점을 가지고 있습니다:
	- Trusted Advisor: 전반적인 AWS 환경 최적화
	- Compute Optimizer: 컴퓨팅 리소스 세부 최적화
- 두 서비스를 함께 사용하면 더 효과적인 클라우드 최적화가 가능합니다.
- 각 서비스의 특성을 이해하고 적절히 활용하는 것이 중요합니다.