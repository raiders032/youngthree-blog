## 1 CloudTrail Insights

- **CloudTrail Insights**는 AWS CloudTrail의 기능으로, 계정에서 발생하는 비정상적인 활동을 자동으로 탐지하고 분석하는 도구입니다.
- 이를 통해 AWS 환경에서 발생하는 비정상적인 API 호출이나 시스템 활동을 감지하여 보안 침해나 운영상의 문제를 조기에 발견하고 대응할 수 있습니다.



## 2 주요 기능

### 2.1 비정상적인 활동 탐지

- CloudTrail Insights는 평상시와 다른 비정상적인 API 호출 패턴을 자동으로 감지합니다.
- 다음과 같은 비정상적인 활동을 탐지할 수 있습니다:
	- 자원 프로비저닝 오류 (inaccurate resource provisioning)
	- 서비스 한도 초과 (hitting service limits)
	- AWS IAM 작업의 폭증 (Bursts of AWS IAM actions)
	- 주기적인 유지 관리 활동의 격차 (Gaps in periodic maintenance activity)
- 이러한 이상 현상은 보안 침해, 시스템 오류, 또는 설정 오류로 인한 문제일 수 있습니다.



### 2.2 인사이트 이벤트 생성

- CloudTrail Insights는 일반적인 관리 이벤트를 분석하여 기준선(baseline)을 생성합니다.
- 비정상적인 활동이 감지되면, CloudTrail Insights는 이를 기반으로 인사이트 이벤트(Insight Events)를 생성합니다.
- 인사이트 이벤트는 기존의 CloudTrail 이벤트와 동일한 형식으로 기록되며, 발생 원인과 영향을 받은 리소스를 분석할 수 있는 추가 정보를 포함합니다.



### 2.3 실시간 모니터링 및 알림

- CloudTrail Insights는 실시간으로 계정 활동을 모니터링하며, 이상 활동이 발생할 때 알림을 받을 수 있습니다.
- Amazon CloudWatch와 통합하여 인사이트 이벤트 발생 시 알람을 설정할 수 있습니다.
- CloudTrail Insights 이벤트는 다음과 같은 방식으로 처리됩니다:
	- CloudTrail 콘솔에서 이상 현상을 확인
	- Amazon S3로 이벤트 데이터 저장
	- EventBridge 이벤트를 생성하여 자동화 필요에 맞게 처리



## 3 CloudTrail Insights 활성화 방법

1. **CloudTrail 콘솔 접속**: AWS Management Console에서 CloudTrail 콘솔에 접속합니다.
2. **트레일 설정**: 기존의 트레일을 선택하거나 새로운 트레일을 생성합니다.
3. **인사이트 활성화**: 트레일 설정에서 "CloudTrail Insights" 옵션을 활성화합니다.
4. **CloudWatch 알람 설정**: CloudTrail Insights 이벤트 발생 시 알림을 받기 위해 CloudWatch 알람을 설정합니다.



## 4 CloudTrail Insights의 활용 사례

### 4.1 보안 침해 탐지

- 인사이트 이벤트를 통해 보안 침해를 조기에 감지할 수 있습니다.
- 예를 들어, 특정 리소스에 대한 액세스 시도가 갑자기 증가하면 보안 문제가 있을 수 있습니다.



### 4.2 운영 이상 탐지

- 인프라 구성 또는 설정 오류로 인한 비정상적인 API 호출을 감지할 수 있습니다.
- 예를 들어, EC2 인스턴스 생성 요청이 비정상적으로 증가할 경우 설정 오류나 스크립트 오류일 수 있습니다.



### 4.3 비용 최적화

- 비정상적인 자원 사용 패턴을 감지하여 불필요한 비용이 발생하지 않도록 조치를 취할 수 있습니다.
- 예를 들어, 불필요하게 많은 리소스가 생성되거나 사용될 경우 이를 빠르게 인지하고 대응할 수 있습니다.



## 5 CloudTrail Insights 활용 팁

- **적절한 알람 설정**: CloudWatch와 연동하여 인사이트 이벤트 발생 시 관리자에게 즉시 알림이 가도록 설정하는 것이 중요합니다.
- **정기적인 모니터링**: CloudTrail Insights 로그를 정기적으로 검토하여, 평상시와 다른 활동이 발생했는지 확인합니다.
- **보안 규정 준수**: CloudTrail Insights를 통해 기록된 비정상적인 활동은 감사 및 규정 준수를 위해 유용하게 사용할 수 있습니다.



## 6 결론

- CloudTrail Insights는 AWS 환경에서 발생하는 비정상적인 활동을 자동으로 감지하고 분석하는 강력한 도구입니다.
- 이를 통해 보안 강화, 운영 효율성 개선, 비용 절감 등을 달성할 수 있습니다.
- CloudTrail Insights를 활성화하고 지속적으로 모니터링하여 AWS 환경을 안전하게 유지하세요.



**관련 자료**:

- [AWS CloudTrail Insights 공식 문서](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-insights.html)
- [AWS CloudTrail 사용 가이드](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html)
