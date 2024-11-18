## 1 AWS SAM(Serverless Application Model) 소개

- AWS SAM은 서버리스 애플리케이션을 쉽게 개발하고 배포할 수 있게 해주는 오픈소스 프레임워크입니다.
- SAM은 AWS CloudFormation의 확장으로, 서버리스 리소스를 간단하게 정의할 수 있습니다.
	- CloudFormation의 모든 기능을 지원합니다: Outputs, Mappings, Parameters, Resources 등
- 개발자들이 서버리스 애플리케이션을 더 빠르고 효율적으로 구축할 수 있도록 도와줍니다.
- SAM은 Lambda 함수를 배포하기 위해 CodeDeploy를 사용할 수 있습니다.
- SAM은 Lambda, API Gateway, DynamoDB를 로컬에서 실행하는 데 도움을 줄 수 있습니다.



## 2 AWS SAM의 주요 특징

- **간소화된 문법**: CloudFormation 템플릿보다 더 간단한 문법을 제공합니다.
- **로컬 테스팅**: SAM CLI를 사용하여 로컬 환경에서 Lambda 함수를 테스트할 수 있습니다.
- **통합 패키징 및 배포**: 애플리케이션 코드와 인프라를 함께 패키징하고 배포할 수 있습니다.
- **정책 템플릿**: 일반적인 사용 사례에 대한 사전 정의된 IAM 정책 템플릿을 제공합니다.
- **AWS 서비스와의 통합**: API Gateway, DynamoDB, S3 등 다양한 AWS 서비스와 쉽게 통합됩니다.



## 3 SAM 템플릿 구조

- SAM 템플릿은 YAML 또는 JSON 형식으로 작성됩니다.
- 템플릿은 크게 세 부분으로 구성됩니다
	- 글로벌 섹션
	- 리소스 섹션
	- 출력 섹션



### 3.1 글로벌 섹션

- 템플릿의 메타데이터와 전역 설정을 정의합니다.



**글로벌 섹션 예시**

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: 'SAM Template for a simple serverless application'
```

- AWSTemplateFormatVersion
	-  템플릿의 AWS CloudFormation 호환 버전을 지정합니다.
	- **값**: 현재는 '2010-09-09'가 유일한 유효한 값입니다.
	- **예시**: `AWSTemplateFormatVersion: '2010-09-09'`
- Transform
	- SAM 템플릿임을 나타내는 선언입니다.
	- **값**: 'AWS::Serverless-2016-10-31'을 사용합니다.
	- 이 선언으로 인해 CloudFormation은 SAM 문법을 인식하고 처리합니다.



### 3.2 리소스 섹션

- 서버리스 애플리케이션의 리소스를 정의합니다.
- Lambda 함수, API Gateway, DynamoDB 테이블 등을 포함할 수 있습니다.



**리소스 섹션 예시**

```yaml
Resources:
  HelloWorldFunction:
	Type: AWS::Serverless::Function
	Properties:
	  CodeUri: hello-world/
	  Handler: app.lambda_handler
	  Runtime: python3.8
	  Events:
		HelloWorld:
		  Type: Api
		  Properties:
			Path: /hello
			Method: get
```




### 3.3 출력 섹션

- 템플릿 실행 후 반환되는 값을 정의합니다.
- API 엔드포인트 URL, 함수 ARN 등을 출력할 수 있습니다.



**출력 섹션 예시**

```yaml
Outputs:
  HelloWorldApi:
	Description: "API Gateway endpoint URL for Prod stage for Hello World function"
	Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/hello/"
```




## 4 SAM과 다른 AWS 서비스와의 통합

- SAM은 다양한 AWS 서비스와 쉽게 통합됩니다.
- 주요 통합 서비스들은 다음과 같습니다:



### 4.1 API Gateway

- HTTP API 또는 REST API를 쉽게 정의하고 Lambda 함수와 연결할 수 있습니다.



**API Gateway 통합 예시**

```yaml
Resources:
  HelloWorldFunction:
	Type: AWS::Serverless::Function
	Properties:
	  # ... 기타 속성들 ...
	  Events:
		HelloWorld:
		  Type: Api
		  Properties:
			Path: /hello
			Method: get
```




### 4.2 DynamoDB

- 서버리스 데이터베이스 테이블을 정의하고 Lambda 함수와 연결할 수 있습니다.



**DynamoDB 통합 예시**

```yaml
Resources:
  MyTable:
	Type: AWS::Serverless::SimpleTable
	Properties:
	  PrimaryKey:
		Name: id
		Type: String
```
  


## 5 SAM의 장점

- **개발 속도 향상**: 간단한 문법과 로컬 테스팅 기능으로 개발 속도를 높입니다.
- **인프라 as 코드**: 애플리케이션 코드와 인프라를 함께 버전 관리할 수 있습니다.
- **비용 효율성**: 서버리스 아키텍처를 통해 운영 비용을 절감할 수 있습니다.
- **확장성**: AWS의 다양한 서비스와 쉽게 통합되어 확장 가능한 애플리케이션을 구축할 수 있습니다.



## 6 결론

- AWS SAM은 서버리스 애플리케이션 개발을 간소화하고 가속화하는 강력한 도구입니다.
- SAM Accelerate (sam sync) 기능을 통해 개발자는 더욱 빠르고 효율적으로 애플리케이션을 개발하고 배포할 수 있습니다.
- 로컬 테스팅, 빠른 동기화, AWS 서비스와의 긴밀한 통합은 서버리스 애플리케이션 개발 경험을 크게 향상시킵니다.
- 서버리스 애플리케이션을 구축하고자 하는 개발자라면 AWS SAM과 SAM Accelerate 기능을 적극 활용해 보시기 바랍니다.