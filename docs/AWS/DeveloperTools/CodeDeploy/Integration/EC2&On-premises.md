## 1 AWS CodeDeploy - EC2/On-premises Platform

- EC2 인스턴스와 온프레미스 서버에 애플리케이션을 배포하는 플랫폼입니다.
- In-place 배포와 Blue/Green 배포 방식을 모두 지원합니다.
- 대상 인스턴스에 CodeDeploy Agent가 설치되어 있어야 합니다.



## 2 배포 속도 설정

- 배포 속도는 다음과 같이 설정할 수 있습니다:
	- **AllAtOnce**: 가장 큰 다운타임이 발생하지만 가장 빠른 배포가 가능합니다.
	- **HalfAtATime**: 용량이 50% 감소하지만 다운타임을 줄일 수 있습니다.
	- **OneAtATime**: 가장 느리지만 가용성 영향이 가장 적습니다.
	- **Custom**: 사용자 정의 비율을 설정할 수 있습니다.



## 3 In-place Deployment

- In-place 배포는 다음과 같은 과정으로 진행됩니다:
	- 현재 실행 중인 애플리케이션을 중지합니다.
	- 새로운 버전의 애플리케이션을 설치합니다.
	- 업데이트된 애플리케이션을 시작합니다.
- Load Balancer를 사용하는 경우:
	- 인스턴스 업데이트 전에 트래픽을 중단합니다.
	- 인스턴스 업데이트 후에 트래픽을 다시 시작합니다.



## 4 Blue/Green Deployment

- Blue/Green 배포는 다음과 같은 방식으로 진행됩니다:
	- 새로운 환경(Green)을 생성합니다.
	- 새 환경에 업데이트된 애플리케이션을 배포합니다.
	- 트래픽을 점진적으로 새 환경으로 전환합니다.



## 5 Deployment Hooks

### 5.1 배포 수명주기 이벤트

- 배포 프로세스는 다음과 같은 순서로 진행되며, 일부 이벤트에서 사용자 정의 스크립트를 실행할 수 있습니다:



#### Load Balancer 사용 시 시작 이벤트

1. BeforeBlockTraffic (✓): Load Balancer에서 트래픽을 차단하기 전 실행할 스크립트
2. BlockTraffic: Load Balancer에서 인스턴스로의 트래픽 차단
3. AfterBlockTraffic (✓): 트래픽이 차단된 후 실행할 스크립트

#### 애플리케이션 배포 이벤트

4. ApplicationStop (✓): 현재 버전의 애플리케이션 중지
5. DownloadBundle: 애플리케이션 번들 다운로드
6. BeforeInstall (✓): 파일 복호화, 현재 버전 백업 등 설치 전 작업
7. Install: 애플리케이션 파일 복사
8. AfterInstall (✓): 애플리케이션 구성, 파일 권한 변경 등 설치 후 작업
9. ApplicationStart (✓): ApplicationStop에서 중지된 서비스 시작
10. ValidateService (✓): 배포 완료 확인 및 검증

#### Load Balancer 사용 시 종료 이벤트

11. BeforeAllowTraffic (✓): Load Balancer에 등록하기 전 상태 확인
12. AllowTraffic: Load Balancer에서 인스턴스로의 트래픽 허용
13. AfterAllowTraffic (✓): 트래픽이 허용된 후 실행할 스크립트

> ✓ 표시는 사용자가 직접 스크립트를 작성하여 실행할 수 있는 이벤트를 나타냅니다.



### 5.2 Blue/Green 배포 시 수명주기 이벤트

- Blue/Green 배포에서는 새로운 환경(Green)과 기존 환경(Blue)에서 서로 다른 이벤트가 실행됩니다.



#### Green(Replacement) 환경 이벤트

1. ApplicationStop (✓)
2. DownloadBundle
3. BeforeInstall (✓)
4. Install
5. AfterInstall (✓)
6. ApplicationStart (✓)
7. ValidateService (✓)
8. BeforeAllowTraffic (✓)
9. AllowTraffic
10. AfterAllowTraffic (✓)

#### Blue(Original) 환경 이벤트

1. BeforeBlockTraffic (✓)
2. BlockTraffic
3. AfterBlockTraffic (✓)

> ✓ 표시는 사용자가 직접 스크립트를 작성하여 실행할 수 있는 이벤트를 나타냅니다.



### 5.3 주요 Hook 사용 예시

#### BeforeInstall 단계 예시

- 설치 전 수행해야 할 작업을 실행합니다:
	- 현재 버전의 애플리케이션 백업 생성
	- 설치에 필요한 파일 복호화
	- 필요한 종속성 패키지 설치

#### AfterInstall 단계 예시

- 설치 후 필요한 구성 작업을 수행합니다:
	- 애플리케이션 설정 파일 구성
	- 파일 및 디렉토리 권한 설정
	- 데이터베이스 스키마 업데이트

#### ApplicationStart 단계 예시

- 애플리케이션 실행에 필요한 작업을 수행합니다:
	- 필요한 시스템 서비스 시작
	- 애플리케이션 프로세스 실행
	- 외부 서비스 연결 초기화

#### ValidateService 단계 예시

- 배포된 애플리케이션의 정상 동작을 확인합니다:
	- 핵심 기능 테스트 수행
	- 필요한 포트 및 엔드포인트 접근 가능 여부 확인
	- 로그 파일 정상 생성 확인

#### BeforeAllowTraffic 단계 예시

- 트래픽 허용 전 최종 점검을 수행합니다:
	- 애플리케이션 상태 확인
	- 시스템 리소스 사용량 확인
	- 보안 설정 검증



## 6 배포 구성

- 배포 중 언제든지 사용 가능해야 하는 인스턴스의 수를 지정합니다.
- 사전 정의된 배포 구성을 사용할 수 있습니다:
	- **CodeDeployDefault.AllAtOnce**: 가능한 많은 인스턴스에 동시 배포
	- **CodeDeployDefault.HalfAtATime**: 최대 절반의 인스턴스에 배포
	- **CodeDeployDefault.OneAtATime**: 한 번에 하나의 인스턴스에만 배포
- 사용자 정의 배포 구성도 생성할 수 있습니다.



## 7 모니터링 및 알림

- CodeDeploy는 배포 이벤트를 SNS 토픽으로 발행할 수 있습니다:
	- DeploymentSuccess: 배포 성공 시 알림
	- DeploymentFailure: 배포 실패 시 알림
	- InstanceFailure: 인스턴스 실패 시 알림
- CloudWatch와 통합되어 상세한 모니터링이 가능합니다.