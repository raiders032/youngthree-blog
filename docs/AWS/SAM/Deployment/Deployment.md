## 1 SAM 서버리스 애플리케이션 배포 가이드

- AWS Serverless Application Model(SAM)과 AWS CodeDeploy를 통합하여 서버리스 애플리케이션을 안전하고 효율적으로 배포하는 방법을 알아봅니다.
- 이 가이드는 SAM과 CodeDeploy의 기본 개념부터 실제 배포 프로세스까지 자세히 설명합니다.



## 2 SAM과 CodeDeploy 통합의 이점

- SAM은 서버리스 애플리케이션을 위한 프레임워크로, Lambda 함수 배포 시 CodeDeploy를 기본적으로 사용합니다.
- 이 통합은 다음과 같은 이점을 제공합니다:
	- 트래픽 쉬프팅: 새 버전으로 점진적으로 트래픽을 이동시킬 수 있습니다.
	- 검증 훅: 배포 전후에 검증 Lambda 함수를 실행할 수 있습니다.
	- 자동 롤백: CloudWatch 경보를 통해 문제 발생 시 자동으로 이전 버전으로 롤백할 수 있습니다.



## 3 SAM 템플릿 구성

- SAM 템플릿에서 Lambda 함수 배포를 위한 주요 설정은 다음과 같습니다:

**SAM 템플릿 예시**

```yaml
Resources:
  MyLambdaFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs12.x
      CodeUri: s3://bucket/code.zip
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Canary10Percent10Minutes
      Alarms:
        - !Ref AliasErrorMetricGreaterThanZeroAlarm
        - !Ref LatestVersionErrorMetricGreaterThanZeroAlarm
      Hooks:
        PreTraffic: !Ref PreTrafficLambdaFunction
        PostTraffic: !Ref PostTrafficLambdaFunction
```

- `AutoPublishAlias`: 새 코드가 감지되면 자동으로 새 버전을 생성하고 지정된 별칭(여기서는 'live')을 업데이트합니다.
- `DeploymentPreference`: 배포 전략을 지정합니다. 여기서는 10분 동안 10%의 트래픽을 새 버전으로 전환하는 Canary 배포를 사용합니다.
- `Alarms`: 롤백을 트리거할 수 있는 CloudWatch 경보를 지정합니다.
- `Hooks`: 트래픽 쉬프팅 전후에 실행할 Lambda 함수를 지정합니다.



## 4 배포 프로세스 상세 설명

### 4.1 배포 트리거

- 새로운 코드가 리포지토리에 푸시되면 CI/CD 파이프라인(예: AWS CodePipeline)이 트리거됩니다.
- 파이프라인은 SAM 템플릿을 사용하여 새로운 배포를 시작합니다.



### 4.2 새 버전 생성

- CodeDeploy는 새로운 Lambda 함수 버전을 생성합니다.
- `AutoPublishAlias` 설정에 따라 지정된 별칭이 새 버전을 가리키도록 업데이트됩니다.



### 4.3 사전 트래픽 검증

- 트래픽 쉬프팅이 시작되기 전에 `PreTraffic` 후크로 지정된 Lambda 함수가 실행됩니다.
- 이 함수는 새 버전의 기본적인 기능을 검증합니다.
- 검증에 실패하면 배포가 중단되고 롤백됩니다.



### 4.4 트래픽 쉬프팅

- 사전 검증이 성공하면 `DeploymentPreference`에 지정된 전략에 따라 트래픽 쉬프팅이 시작됩니다.
- 예시의 'Canary10Percent10Minutes' 설정은 다음과 같이 작동합니다:
	- 처음 10분 동안 새 버전으로 10%의 트래픽을 전환합니다.
	- 문제가 없으면 나머지 90%의 트래픽을 새 버전으로 전환합니다.



### 4.5 모니터링 및 롤백

- 배포 중 지정된 CloudWatch 경보가 트리거되면 자동으로 이전 버전으로 롤백됩니다.
- 이를 통해 문제가 있는 배포로 인한 영향을 최소화할 수 있습니다.



### 4.6 사후 트래픽 검증

- 모든 트래픽이 새 버전으로 전환된 후 `PostTraffic` 후크로 지정된 Lambda 함수가 실행됩니다.
- 이 함수는 새 버전이 완전히 배포된 후의 전체적인 시스템 상태를 검증합니다.



## 5 배포 전략 옵션

- SAM은 다음과 같은 다양한 배포 전략을 제공합니다:
- `Canary`: 일정 비율의 트래픽을 새 버전으로 전환한 후, 문제가 없으면 나머지를 전환합니다.
	- 예: `Canary10Percent30Minutes`
- `Linear`: 일정한 간격으로 트래픽을 점진적으로 새 버전으로 전환합니다.
	- 예: `Linear10PercentEvery10Minutes`
- `AllAtOnce`: 모든 트래픽을 즉시 새 버전으로 전환합니다.



## 6 모범 사례

- 철저한 테스트: 사전/사후 트래픽 후크를 활용하여 새 버전을 철저히 검증합니다.
- 점진적 롤아웃: Canary 또는 Linear 전략을 사용하여 위험을 최소화합니다.
- 모니터링: 관련 메트릭에 대한 CloudWatch 경보를 설정하여 문제를 빠르게 감지합니다.
- 롤백 계획: 자동 롤백 외에도 수동 롤백 절차를 준비합니다.



## 7 결론

- SAM과 CodeDeploy의 통합은 서버리스 애플리케이션의 안전하고 효율적인 배포를 가능하게 합니다.
- 트래픽 쉬프팅, 검증 후크, 자동 롤백 등의 기능을 통해 배포 위험을 크게 줄일 수 있습니다.
- 이러한 기능들을 적절히 활용하면 높은 신뢰성과 가용성을 유지하면서 빠른 배포 주기를 달성할 수 있습니다.