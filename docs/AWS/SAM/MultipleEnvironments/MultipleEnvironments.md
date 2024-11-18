## 1 SAM - Multiple Environments 소개

- AWS Serverless Application Model (SAM)은 서버리스 애플리케이션을 구축하고 배포하기 위한 강력한 프레임워크입니다.
- SAM을 사용하면 개발, 테스트, 스테이징, 프로덕션 등 여러 환경에서 애플리케이션을 효과적으로 관리할 수 있습니다.
- 이 글에서는 SAM을 사용하여 여러 환경을 관리하는 방법과 환경별 구성 파일의 사용, 그리고 환경별 배포 과정에 대해 자세히 알아보겠습니다.



## 2 환경별 구성 파일

- SAM은 `samconfig.toml` 파일을 통해 환경별 구성을 관리합니다.
- 이 파일은 TOML(Tom's Obvious, Minimal Language) 형식으로 작성되며, 각 환경에 대한 설정을 포함합니다.
- `samconfig.toml` 파일은 프로젝트 루트 디렉토리에 위치합니다.



### 2.1 samconfig.toml 구조

```toml
[dev]
[dev.deploy]
[dev.deploy.parameters]
stack_name = "my-app-dev"
s3_bucket = "my-deployment-bucket-dev"
parameter_overrides = "Environment=dev"

[prod]
[prod.deploy]
[prod.deploy.parameters]
stack_name = "my-app-prod"
s3_bucket = "my-deployment-bucket-prod"
parameter_overrides = "Environment=prod"
```

- 각 섹션 (`[dev]`, `[prod]`)은 다른 환경을 나타냅니다.
- `[환경명.deploy.parameters]` 아래에 해당 환경에 특화된 파라미터들을 정의합니다.
- `stack_name`: 생성될 CloudFormation 스택의 이름입니다.
- `s3_bucket`: 배포에 사용될 S3 버킷 이름입니다.
- `parameter_overrides`: SAM 템플릿의 파라미터를 오버라이드할 때 사용합니다.



### 2.2 samconfig.toml 사용 방법

- SAM CLI는 배포 명령 실행 시 자동으로 `samconfig.toml` 파일을 읽어 해당 환경의 설정을 적용합니다.
- 환경별 설정을 사용하려면 `--config-env` 옵션을 사용하여 원하는 환경을 지정합니다.



## 3 환경별 배포

- SAM CLI의 `deploy` 명령어를 사용하여 각 환경에 애플리케이션을 배포할 수 있습니다.
- `--config-env` 옵션을 사용하여 특정 환경의 설정을 적용할 수 있습니다.



### 3.1 배포 명령어

```bash
## 개발 환경 배포
sam deploy --config-env dev

## 프로덕션 환경 배포
sam deploy --config-env prod
```



### 3.2 --config-env 옵션의 동작

1. SAM CLI는 프로젝트 루트 디렉토리에서 `samconfig.toml` 파일을 찾습니다.
2. `--config-env` 옵션에 지정된 환경 이름(예: dev, prod)에 해당하는 섹션을 찾습니다.
3. 해당 환경의 설정값들을 읽어 배포 과정에 적용합니다.
4. `parameter_overrides`에 지정된 값들은 SAM 템플릿의 파라미터를 오버라이드합니다.
5. 지정된 S3 버킷을 사용하여 배포 아티팩트를 업로드합니다.
6. 지정된 스택 이름으로 CloudFormation 스택을 생성 또는 업데이트합니다.

예를 들어, `sam deploy --config-env dev` 명령을 실행하면:
- `my-app-dev`라는 이름의 CloudFormation 스택이 생성됩니다.
- 배포 아티팩트는 `my-deployment-bucket-dev` S3 버킷에 업로드됩니다.
- SAM 템플릿의 `Environment` 파라미터는 `dev` 값으로 오버라이드됩니다.



## 4 환경별 리소스 관리

- SAM 템플릿에서 조건문을 사용하여 환경에 따라 리소스 구성을 다르게 할 수 있습니다.
- 이를 통해 개발 환경과 프로덕션 환경의 리소스 스펙을 적절히 조정할 수 있습니다.



**리소스 구성 예시:**

```yaml
Parameters:
  Environment:
    Type: String
    Default: dev
    AllowedValues:
      - dev
      - prod

Conditions:
  IsProduction: !Equals [ !Ref Environment, prod ]

Resources:
  MyTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub ${AWS::StackName}-table
      BillingMode: !If [ IsProduction, PROVISIONED, PAY_PER_REQUEST ]
      ProvisionedThroughput: 
        !If 
          - IsProduction
          - ReadCapacityUnits: 50
            WriteCapacityUnits: 50
          - !Ref AWS::NoValue
```

- 이 예시에서는 프로덕션 환경일 때만 프로비저닝된 용량을 사용하고, 개발 환경에서는 온디맨드 용량을 사용합니다.



## 5 환경별 변수 관리

- Lambda 함수의 환경 변수를 사용하여 환경별로 다른 설정을 적용할 수 있습니다.
- SAM 템플릿에서 환경 변수를 정의하고, 배포 시 오버라이드할 수 있습니다.



**환경 변수 예시:**

```yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs14.x
      Environment:
        Variables:
          TABLE_NAME: !Ref MyTable
          LOG_LEVEL: !If [IsProduction, "INFO", "DEBUG"]
          API_ENDPOINT: !If [IsProduction, "https://api.prod.example.com", "https://api.dev.example.com"]
```

- 이 예시에서는 프로덕션 환경과 개발 환경에서 로그 레벨과 API 엔드포인트를 다르게 설정합니다.



## 6 결론

- SAM의 다중 환경 관리 기능을 활용하면 일관성 있고 효율적인 서버리스 애플리케이션 개발이 가능합니다.
- `samconfig.toml` 파일과 `--config-env` 옵션을 사용하여 환경별 설정을 쉽게 관리하고 적용할 수 있습니다.
- 조건문과 환경 변수를 활용하여 각 환경의 특성에 맞는 리소스 구성과 애플리케이션 동작을 구현할 수 있습니다.
- 이러한 기능들을 잘 활용하면, 개발부터 프로덕션까지 원활한 애플리케이션 라이프사이클 관리가 가능해집니다.
- SAM의 다중 환경 관리 기능은 복잡한 서버리스 아키텍처를 효과적으로 관리하고 운영하는 데 큰 도움이 됩니다.