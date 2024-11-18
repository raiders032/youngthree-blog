## 1 AWS CodeDeploy - Lambda Platform

- AWS CodeDeploy를 사용하여 Lambda 함수의 새로운 버전을 자동으로 배포할 수 있습니다.
- Lambda 별칭에 대한 트래픽 이동을 자동화할 수 있습니다.
- SAM(Serverless Application Model) 프레임워크와 통합되어 있습니다.



## 2 배포 유형

- Lambda 플랫폼에서는 다음과 같은 배포 유형을 지원합니다:
	- **Linear**: 일정 시간 간격으로 트래픽을 점진적으로 이동
		- LambdaLinear10PercentEvery3Minutes
		- LambdaLinear10PercentEvery10Minutes
	- **Canary**: 특정 비율로 테스트 후 전체 전환
		- LambdaCanary10Percent5Minutes
		- LambdaCanary10Percent30Minutes
	- **AllAtOnce**: 즉시 전체 트래픽 전환



## 3 배포 프로세스

### 3.1 기본 프로세스

- 새로운 Lambda 함수 버전을 생성합니다.
- appspec.yml 파일에 버전 정보를 지정합니다.
- CodeDeploy가 새로운 Lambda 함수 버전으로 업데이트합니다.
- Lambda 별칭이 새로운 버전을 참조하도록 업데이트됩니다.



### 3.2 트래픽 이동

- 트래픽은 다음과 같이 이동됩니다:
	- 현재 버전(V1)에서 새로운 버전(V2)으로 점진적으로 이동
	- 이동 중 문제가 발생하면 자동으로 롤백 가능
	- CloudWatch 알람을 통한 자동 롤백 트리거 설정 가능



## 4 배포 설정

### 4.1 appspec.yml 구성

```yaml
version: 0.0
Resources:
  - MyFunction:
      Type: AWS::Lambda::Function
      Properties:
        Name: myfunction
        Alias: myalias
        CurrentVersion: 1
        TargetVersion: 2
```

- appspec.yml 파일에서 다음 정보를 지정합니다:
	- 함수 이름
	- 별칭 이름
	- 현재 버전
	- 대상 버전



## 5 모니터링 및 롤백

- CloudWatch를 통해 다음 항목을 모니터링할 수 있습니다:
	- 함수 오류율
	- 함수 지연 시간
	- 함수 호출 횟수
- 롤백 조건을 설정할 수 있습니다:
	- CloudWatch 알람 기반 롤백
	- 수동 롤백
	- 배포 실패 시 자동 롤백



## 6 보안 고려사항

- IAM 역할 및 권한:
	- CodeDeploy에 Lambda 함수 업데이트 권한 필요
	- CloudWatch 메트릭 및 로그 접근 권한
- 암호화:
	- Lambda 환경 변수 암호화
	- KMS 키 사용 권한



## 7 모범 사례

- 단계적 배포 사용:
	- Canary 또는 Linear 배포로 리스크 최소화
	- 충분한 모니터링 기간 설정
- 자동화된 테스트 구현:
	- 배포 전 단위 테스트
	- 배포 후 통합 테스트
- 롤백 계획 수립:
	- 자동 롤백 조건 정의
	- 수동 롤백 절차 문서화