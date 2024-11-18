## 1 AWS CodeDeploy - ECS Platform

- AWS CodeDeploy는 Amazon ECS 서비스에 새로운 애플리케이션 버전을 자동으로 배포하는 서비스입니다.
- Blue/Green 배포 방식만을 지원하며, 무중단 배포가 가능합니다.
- 애플리케이션 로드 밸런서(ALB)와의 연동이 필수적입니다.



## 2 사전 요구사항

- ECS 배포를 위해서는 다음 구성 요소가 필요합니다:
	- **ECS 클러스터**: 컨테이너를 실행할 ECS 클러스터가 구성되어 있어야 합니다.
	- **ECS 서비스**: ALB와 연결된 ECS 서비스가 있어야 합니다.
	- **태스크 정의**: 새로운 버전의 컨테이너 이미지와 설정이 포함된 태스크 정의가 필요합니다.
	- **로드 밸런서**: Application Load Balancer가 구성되어 있어야 합니다.
	- **대상 그룹**: Blue/Green 환경을 위한 두 개의 대상 그룹이 필요합니다.



## 3 배포 프로세스

### 3.1 기본 워크플로우

- ECS 배포는 다음 단계로 진행됩니다:
	- 개발자가 새로운 컨테이너 이미지를 ECR에 푸시합니다.
	- 새로운 ECS 태스크 정의를 생성합니다.
	- appspec.yml 파일에 새로운 태스크 정의를 참조합니다.
	- CodeDeploy가 Blue/Green 배포를 시작합니다.



### 3.2 트래픽 이동 방식

- 트래픽 전환은 다음 방식 중 하나로 설정할 수 있습니다:
	- **Canary**:
		- ECSCanary10Percent5Minutes
		- ECSCanary10Percent15Minutes
	- **Linear**:
		- ECSLinear10PercentEvery1Minutes
		- ECSLinear10PercentEvery3Minutes
	- **AllAtOnce**:
		- ECSAllAtOnce



## 4 Configuration

### 4.1 appspec.yml 설정

```yaml
version: 0.0
Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: "arn:aws:ecs:region:account-id:task-definition/task-name:1"
        LoadBalancerInfo:
          ContainerName: "sample-app"
          ContainerPort: 80
        PlatformVersion: "LATEST"
Hooks:
  - BeforeInstall: "LambdaFunctionToValidateBeforeInstall"
  - AfterInstall: "LambdaFunctionToValidateAfterInstall"
  - AfterAllowTestTraffic: "LambdaFunctionToValidateTestTraffic"
  - BeforeAllowTraffic: "LambdaFunctionToValidateBeforeTraffic"
  - AfterAllowTraffic: "LambdaFunctionToValidateAfterTraffic"
```

- appspec.yml 파일은 다음 정보를 포함합니다:
	- 새로운 태스크 정의의 ARN
	- 컨테이너 이름과 포트
	- 배포 수명 주기 이벤트에 대한 후크 함수



## 5 배포 수명 주기 이벤트

- ECS 배포는 다음과 같은 수명 주기 이벤트를 지원합니다:
	- **BeforeInstall**: 설치 전 검증
	- **AfterInstall**: 설치 후 검증
	- **AfterAllowTestTraffic**: 테스트 트래픽 허용 후 검증
	- **BeforeAllowTraffic**: 프로덕션 트래픽 허용 전 검증
	- **AfterAllowTraffic**: 프로덕션 트래픽 허용 후 검증



## 6 모니터링 및 롤백

### 6.1 모니터링

- 다음 도구를 통해 배포를 모니터링할 수 있습니다:
	- **CloudWatch**: 메트릭과 로그 모니터링
	- **CloudWatch Alarms**: 주요 지표에 대한 경보 설정
	- **CodeDeploy 콘솔**: 배포 상태와 이벤트 확인
	- **AWS CLI**: 배포 상태 조회 및 관리



### 6.2 롤백 설정

- 롤백은 다음과 같은 경우에 트리거될 수 있습니다:
	- **자동 롤백**: 
		- 배포 실패 시
		- CloudWatch 경보 발생 시
		- 수명 주기 이벤트 실패 시
	- **수동 롤백**: 
		- 콘솔에서 수동으로 롤백 실행
		- AWS CLI를 통한 롤백 명령 실행



## 7 모범 사례

### 7.1 배포 전략

- 안전한 배포를 위해 다음 사항을 고려합니다:
	- Canary 배포로 시작하여 리스크 최소화
	- 충분한 모니터링 기간 설정
	- 자동 롤백 조건 정의
	- 배포 전후 검증 단계 구현



### 7.2 성능 최적화

- 배포 성능 향상을 위한 권장 사항:
	- 컨테이너 이미지 최적화
	- 태스크 정의 메모리/CPU 설정 최적화
	- 적절한 트래픽 전환 비율 선택
	- 효율적인 헬스 체크 구성



## 8 문제 해결

- 일반적인 문제 해결 가이드:
	- **배포 실패**:
		- 태스크 정의 유효성 확인
		- IAM 권한 검증
		- 로드 밸런서 구성 확인
	- **트래픽 전환 실패**:
		- 대상 그룹 헬스 체크 설정 확인
		- 컨테이너 포트 매핑 검증
		- 보안 그룹 설정 확인
	- **컨테이너 시작 실패**:
		- 리소스 제약 확인
		- 이미지 풀 권한 확인
		- 환경 변수 설정 검증



## 9 보안 고려사항

- ECS 배포의 보안을 강화하기 위한 권장 사항:
	- IAM 역할 최소 권한 원칙 적용
	- 보안 그룹 규칙 최적화
	- 컨테이너 이미지 취약점 스캔
	- 민감한 데이터는 AWS Secrets Manager 사용
	- VPC 엔드포인트 활용으로 통신 보안 강화