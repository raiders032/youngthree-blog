## 1 AWS SAM CLI

- [레퍼런스](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)
- AWS Serverless Application Model(SAM)은 서버리스 애플리케이션을 개발하고 배포하기 위한 오픈 소스 프레임워크입니다 
- 그리고 AWS SAM CLI는 이 프레임워크를 더욱 효과적으로 사용할 수 있게 해주는 명령줄 도구입니다 
- 이 글에서는 AWS SAM CLI의 주요 기능과 사용 방법에 대해 알아보겠습니다.



## 2 AWS SAM CLI의 주요 기능

AWS SAM CLI는 다음과 같은 주요 기능을 제공합니다:

- 서버리스 애플리케이션 초기화
- 로컬 테스트 및 디버깅
- 애플리케이션 빌드 및 패키징
- AWS 클라우드에 배포
- 실시간 로그 확인

이러한 기능들을 통해 개발자는 서버리스 애플리케이션의 전체 라이프사이클을 효과적으로 관리할 수 있습니다.



## 3 AWS SAM CLI 설치하기

AWS SAM CLI를 사용하기 위해서는 먼저 설치가 필요합니다 설치 과정은 다음과 같습니다:

- AWS CLI 설치
- Docker 설치 (로컬 테스트를 위해 필요)
- AWS SAM CLI 설치

각 운영 체제별 설치 방법은 AWS 공식 문서를 참조하시기 바랍니다.



## 4 서버리스 애플리케이션 초기화하기

AWS SAM CLI를 이용해 새로운 서버리스 애플리케이션을 시작하는 방법은 다음과 같습니다:

```bash
sam init
```

- 이 명령어를 실행하면 대화형 프롬프트가 시작됩니다.
- 템플릿 소스, 런타임, 프로젝트 이름 등을 선택할 수 있습니다.
- 선택이 완료되면 기본적인 프로젝트 구조가 생성됩니다.



## 5 애플리케이션 빌드하기

애플리케이션 코드를 작성한 후, 다음 명령어로 빌드할 수 있습니다:

```bash
sam build
```

- 이 명령어는 애플리케이션의 종속성을 해결하고 배포 패키지를 생성합니다.
- 빌드된 아티팩트는 `.aws-sam` 디렉토리에 저장됩니다.



## 6 로컬에서 애플리케이션 테스트하기

- AWS SAM CLI는 로컬 환경에서 서버리스 애플리케이션을 테스트할 수 있는 다양한 옵션을 제공합니다. 
- Lambda 함수만 테스트하거나, API Gateway와 함께 전체 API를 시뮬레이션할 수 있습니다.



### 6.1 Lambda 함수 테스트하기

```bash
sam local invoke [FunctionName] --event events/event.json
```

- Lambda 함수를 직접 호출하여 테스트하려면 위 명령어를 사용합니다
	- 지정된 Lambda 함수를 로컬에서 한 번 실행합니다.
	- 함수 실행 후 즉시 종료됩니다.
	- 주로 특정 이벤트나 페이로드로 함수를 테스트할 때 사용합니다.
- 이 명령어는 로컬 Docker 컨테이너에서 지정된 Lambda 함수를 실행합니다.
- `[FunctionName]`은 테스트하려는 함수의 이름입니다 (template.yaml 파일에 정의된 이름).
- `--event` 옵션을 사용하여 테스트 이벤트 데이터를 제공할 수 있습니다.



```bash
sam local start-lambda <options>
```

- AWS Lambda를 로컬에서 에뮬레이션하는 엔드포인트를 시작합니다.
- 지속적으로 실행되는 로컬 Lambda 에뮬레이터를 시작합니다.
-  8080 포트에서 HTTP 서버를 실행합니다.
- AWS CLI나 SDK를 사용하여 이 로컬 엔드포인트에 요청을 보낼 수 있습니다.



### 6.2 API Gateway와 함께 테스트하기

```bash
sam local start-api
```

- 전체 API를 로컬에서 테스트하려면 다음 명령어를 사용합니다
- 이 명령어는 로컬 HTTP 서버를 시작하여 API Gateway를 시뮬레이션합니다.
- 동시에 연결된 Lambda 함수도 로컬 Docker 컨테이너에서 실행됩니다.



### 6.3 실제 실행 테스트

- `sam local start-api` 명령어로 API를 시작한 후, 실제 API 호출을 시뮬레이션하려면 다음과 같이 할 수 있습니다
- curl 명령어나 웹 브라우저를 사용하여 로컬 API 엔드포인트에 요청을 보냅니다.
	- 예시: ` curl http://localhost:3000/hello`
	- 여기서 '/hello'는 API의 경로입니다.
- 또는 Postman과 같은 API 테스트 도구를 사용하여 다양한 HTTP 메서드와 페이로드로 API를 테스트할 수 있습니다.



## 7 애플리케이션 패키징하기

- 애플리케이션을 빌드한 후, 다음 단계는 패키징입니다. 이 과정은 `sam package` 명령어를 사용하여 수행합니다:

```bash
sam package --output-template-file packaged.yaml --s3-bucket your-s3-bucket-name
```



### 7.1 주요 기능

- 빌드된 아티팩트를 지정된 S3 버킷에 업로드합니다.
- 업로드된 아티팩트의 S3 위치를 참조하는 새로운 SAM 템플릿을 생성합니다.



### 7.2 사용 시기

- 애플리케이션을 AWS 클라우드에 배포하기 직전에 사용합니다.
- `sam deploy` 명령어를 별도로 실행하려는 경우에 필요합니다.



### 7.3 주의사항

- S3 버킷은 미리 생성되어 있어야 합니다.
- 생성된 `packaged.yaml` 파일은 배포 단계에서 사용됩니다.



## 8  AWS 클라우드에 배포하기

애플리케이션을 AWS 클라우드에 배포하려면 다음 명령어를 사용합니다:

```bash
sam deploy --guided
```

- 이 명령어는 대화형 프롬프트를 통해 배포 설정을 구성합니다.
- 설정이 완료되면 애플리케이션을 AWS CloudFormation을 통해 배포합니다.



## 9  SAM Accelerate (sam sync)

- SAM Accelerate는 AWS 리소스를 배포할 때 지연 시간을 줄이기 위한 기능 세트입니다.
- 'sam sync' 명령어를 통해 사용할 수 있습니다.



### 9 .1 sam sync의 주요 기능

- SAM 템플릿에 선언된 프로젝트를 AWS와 동기화합니다.
- 인프라를 업데이트하지 않고 코드 변경 사항을 AWS에 동기화합니다.
    - 서비스 API와 CloudFormation을 우회하여 빠른 업데이트를 수행합니다.



### 9 .2 sam sync 사용 예시

- **기본 사용**: `sam sync`
    - 코드와 인프라를 동기화합니다.
- **코드만 동기화**: `sam sync --code`
    - 인프라를 업데이트하지 않고 코드 변경 사항만 동기화합니다.
    - CloudFormation을 우회하여 몇 초 만에 업데이트를 완료합니다.
- **특정 Lambda 함수 동기화**: `sam sync --code --resource AWS::Serverless::Function`
    - 모든 Lambda 함수와 그 종속성만 동기화합니다.
- **특정 리소스 동기화**: `sam sync --code --resource-id HelloWorldLambdaFunction`
    - ID로 지정된 특정 리소스만 동기화합니다.
- **자동 동기화**: `sam sync --watch`
    - 파일 변경을 모니터링하고 변경 사항이 감지되면 자동으로 동기화합니다.
    - 구성 변경이 포함된 경우 `sam sync`를 사용합니다.
    - 코드 변경만 있는 경우 `sam sync --code`를 사용합니다.



### 9 .3 SAM Accelerate의 장점

- **개발 속도 향상**: 코드 변경 사항을 빠르게 AWS에 반영할 수 있어 개발 주기가 단축됩니다.
- **인프라 변경 최소화**: 코드 변경만 필요한 경우 인프라 업데이트를 건너뛰어 배포 시간을 크게 줄일 수 있습니다.
- **유연한 동기화 옵션**: 전체 프로젝트, 특정 함수, 또는 특정 리소스만 선택적으로 동기화할 수 있습니다.
- **자동화된 워크플로**: `--watch` 옵션을 사용하여 변경 사항을 자동으로 감지하고 동기화할 수 있습니다.



## 10 결론

AWS SAM CLI는 서버리스 애플리케이션 개발 프로세스를 크게 간소화합니다 초기화부터 배포, 테스트까지 전체 라이프사이클을 관리할 수 있는 강력한 도구입니다 특히 로컬 테스트 기능과 실시간 동기화 기능은 개발 생산성을 크게 향상시킵니다 

서버리스 아키텍처를 고려하고 계신다면, AWS SAM CLI는 반드시 익혀두어야 할 도구입니다 이를 통해 더 효율적이고 안정적인 서버리스 애플리케이션을 개발할 수 있을 것입니다.