## 1 API Gateway Stages in AWS

- API Gateway는 AWS에서 제공하는 완전 관리형 서비스로, API를 생성, 게시, 유지 관리, 모니터링 및 보안 설정할 수 있게 해줍니다.
- API Gateway의 '스테이지'는 API 수명 주기 관리의 핵심 요소입니다.
- 스테이지를 통해 API의 다양한 버전을 관리하고 배포할 수 있습니다.



## 2 API Gateway 스테이지란?

- 스테이지는 API의 특정 배포 스냅샷입니다.
- 각 스테이지는 고유한 URL을 가지며, API의 특정 버전을 나타냅니다.
- 개발, 테스트, 프로덕션 등 다양한 환경을 위한 여러 스테이지를 만들 수 있습니다.



## 3 스테이지의 주요 특징

- **버전 관리**: 각 스테이지는 API의 특정 버전을 나타냅니다.
- **독립적인 설정**: 각 스테이지마다 고유한 설정을 가질 수 있습니다.
- **URL 관리**: 각 스테이지는 고유한 URL을 가집니다.
- **환경 분리**: 개발, 테스트, 프로덕션 등 다양한 환경을 분리할 수 있습니다.
- **롤백 용이성**: 문제 발생 시 이전 스테이지로 쉽게 롤백할 수 있습니다.



## 4 스테이지 생성 및 관리

### 4.1 스테이지 생성

- API Gateway 콘솔, AWS CLI, 또는 SDK를 통해 스테이지를 생성할 수 있습니다.
- 스테이지 생성 시 이름, 설명, 배포할 API 버전 등을 지정합니다.



**AWS CLI를 사용한 스테이지 생성 예시**

```bash
aws apigateway create-stage \
	--rest-api-id 1234567890 \
	--stage-name prod \
	--deployment-id a1b2c3
```

- 이 명령은 'prod'라는 이름의 새 스테이지를 생성합니다.
- `--rest-api-id`는 대상 API의 ID를 지정합니다.
- `--deployment-id`는 배포할 특정 API 버전을 지정합니다.



### 4.2 스테이지 설정

- 각 스테이지에는 다음과 같은 설정을 구성할 수 있습니다:
	- 캐싱
	- 로깅
	- 스로틀링
	- WAF (Web Application Firewall) 연동
	- 클라이언트 인증서
	- 스테이지 변수



## 5 API Gateway 스테이지 변수

- 스테이지 변수는 API Gateway에서 환경 변수와 유사한 역할을 합니다.
- 각 스테이지에 대해 구성할 수 있는 키-값 쌍으로, 자주 변경되는 설정 값을 관리하는 데 유용합니다.
- 이를 통해 스테이지별로 다른 설정을 쉽게 적용할 수 있습니다.



### 5.1 스테이지 변수의 주요 특징

- **환경별 설정**: 개발(Dev), 테스트(Test), 프로덕션(Prod) 등 각 환경에 맞는 설정을 쉽게 관리할 수 있습니다.
- **동적 구성**: API의 동작을 변경하지 않고도 설정을 동적으로 변경할 수 있습니다.
- **보안**: 민감한 정보를 직접 코드에 노출시키지 않고 관리할 수 있습니다.
- **유연성**: Lambda 함수 ARN, HTTP 엔드포인트, 매개변수 매핑 템플릿 등 다양한 곳에서 활용 가능합니다.



### 5.2 스테이지 변수 사용 사례

- **Lambda 별칭 지정**: 각 스테이지에 해당하는 Lambda 함수 별칭을 지정할 수 있습니다.
- **환경별 백엔드 URL 설정**: 개발, 테스트, 프로덕션 환경의 서로 다른 백엔드 URL을 지정할 수 있습니다.
- **로깅 레벨 조정**: 각 환경에 맞는 로깅 레벨을 설정할 수 있습니다.
- **기능 플래그 관리**: 특정 기능의 활성화/비활성화를 스테이지별로 관리할 수 있습니다.



### 5.3 스테이지 변수 사용 예시

**스테이지 변수 정의 예시**

```json
{
  "lambdaAlias": "PROD",
  "backendUrl": "https://api.example.com/v1",
  "environment": "production",
  "logLevel": "INFO",
  "featureFlag": "enabled"
}
```

- 이러한 변수들은 API Gateway 콘솔, AWS CLI, 또는 CloudFormation을 통해 설정할 수 있습니다.



### 5.4 스테이지 변수 참조 방법

- 스테이지 변수는 `${stageVariables.variableName}` 형식으로 참조할 수 있습니다.
- 사용 가능한 위치:
	- Lambda 함수 ARN
	- HTTP 엔드포인트 URL
	- 매개변수 매핑 템플릿
	- AWS Lambda 함수의 컨텍스트 객체



**Lambda 함수 ARN에서의 사용 예시**

```
arn:aws:lambda:${stageVariables.region}:account-id:function:${stageVariables.functionName}:${stageVariables.lambdaAlias}
```
    



### 5.5 Lambda 별칭과 스테이지 변수 연동

- 스테이지 변수를 사용하여 각 API Gateway 스테이지가 적절한 Lambda 함수 버전을 호출하도록 설정할 수 있습니다.
- 예를 들어:
	- Prod 스테이지 → PROD Lambda 별칭 (안정적인 최신 버전)
	- Test 스테이지 → TEST Lambda 별칭 (테스트 중인 버전)
	- Dev 스테이지 → DEV Lambda 별칭 또는 $LATEST (개발 중인 최신 버전)
- 이 방식을 통해 API Gateway 설정을 변경하지 않고도 Lambda 함수의 다양한 버전을 쉽게 관리하고 배포할 수 있습니다.



### 5.6 주의사항

- 스테이지 변수는 암호화되지 않으므로 민감한 정보(예: API 키, 데이터베이스 비밀번호)를 직접 저장하는 것은 피해야 합니다.
- 대신 AWS Secrets Manager나 Systems Manager Parameter Store를 활용하여 민감한 정보를 안전하게 관리하고, 스테이지 변수에서는 이들의 참조만 저장하는 것이 좋습니다.



## 6 스테이지 배포

- API를 변경한 후에는 새로운 배포를 생성하고 이를 스테이지에 연결해야 합니다.
- 이 과정을 통해 API의 새 버전을 특정 스테이지에 반영할 수 있습니다.



**AWS CLI를 사용한 배포 생성 및 스테이지 업데이트 예시**

```bash
## 새 배포 생성
aws apigateway create-deployment \
	--rest-api-id 1234567890 \
	--stage-name prod \
	--description "Production deployment"

## 스테이지 업데이트
aws apigateway update-stage \
	--rest-api-id 1234567890 \
	--stage-name prod \
	--patch-operations op=replace,path=/deploymentId,value=a1b2c3
```

- 첫 번째 명령은 새로운 배포를 생성합니다.
- 두 번째 명령은 'prod' 스테이지를 새 배포로 업데이트합니다.



## 7 스테이지 보안

- API Gateway 스테이지의 보안은 매우 중요합니다.
- 다음과 같은 보안 기능을 활용할 수 있습니다:
	- SSL/TLS 암호화
	- API 키
	- AWS WAF (Web Application Firewall) 통합
	- IAM 역할 및 정책
	- Lambda 권한 부여자



## 8 모니터링 및 로깅

- CloudWatch와 통합하여 각 스테이지의 성능을 모니터링할 수 있습니다.
- 액세스 로그를 활성화하여 API 호출에 대한 상세 정보를 기록할 수 있습니다.



**CloudWatch 로그 활성화 예시**

```bash
aws apigateway update-stage \
	--rest-api-id 1234567890 \
	--stage-name prod \
	--patch-operations op=replace,path=/accessLogSettings/destinationArn,value=arn:aws:logs:region:account-id:log-group:API-Gateway-Execution-Logs_rest-api-id/prod
```

- 이 명령은 'prod' 스테이지에 대한 CloudWatch 로깅을 활성화합니다.



## 9 결론

- API Gateway의 스테이지는 API 수명 주기 관리의 핵심 요소입니다.
- 스테이지를 통해 개발, 테스트, 프로덕션 환경을 효과적으로 분리하고 관리할 수 있습니다.
- 적절한 스테이지 관리는 API의 안정성, 보안성, 성능을 향상시키는 데 큰 도움이 됩니다.
- API Gateway 스테이지를 잘 활용하면 더 효율적이고 안전한 API 관리가 가능해집니다.