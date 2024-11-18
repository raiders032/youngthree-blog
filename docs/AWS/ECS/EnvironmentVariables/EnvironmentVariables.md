## 1 Amazon ECS에서 Environment Variables 사용하기

- Amazon ECS(Environment Variables)는 컨테이너화된 애플리케이션에서 중요한 설정 값을 관리하고 전달하는 데 사용됩니다.
- 환경 변수(Environment Variables)는 URL과 같은 간단한 값부터 API 키, 데이터베이스 비밀번호와 같은 민감한 정보까지 다양하게 포함할 수 있습니다.
- 이 블로그 글에서는 ECS에서 환경 변수를 사용하는 방법과 다양한 소스에서 환경 변수를 로드하는 방법을 설명합니다.



## 2 Environment Variables 정의 및 관리

### 2.1 Environment Variables의 주요 사용 사례

- **Hardcoded**: 간단한 URL 또는 특정 설정 값을 직접 태스크 정의에 하드코딩할 수 있습니다.
- **SSM Parameter Store**: AWS Systems Manager Parameter Store를 사용하여 민감한 변수(예: API 키, 공유 설정)를 관리할 수 있습니다.
- **Secrets Manager**: AWS Secrets Manager를 사용하여 데이터베이스 비밀번호와 같은 민감한 변수를 관리할 수 있습니다.



## 3 환경 변수 설정 방법

### 3.1 Hardcoded 환경 변수

- **하드코딩된 환경 변수**는 태스크 정의에서 직접 설정할 수 있습니다.
- 이는 간단한 설정 값이나 변경되지 않는 고정 값을 지정할 때 유용합니다.
- 예를 들어, 태스크 정의에서 다음과 같이 설정할 수 있습니다:

```json
{
  "containerDefinitions": [
	{
	  "name": "my-container",
	  "image": "my-image",
	  "environment": [
		{
		  "name": "ENV_VAR",
		  "value": "value"
		}
	  ]
	}
  ]
}
```



## 4 민감한 정보 관리

### 4.1 SSM Parameter Store

- AWS Systems Manager Parameter Store는 **민감한 정보를 안전하게 저장**하고 관리할 수 있는 서비스입니다.
- 환경 변수를 SSM Parameter Store에 저장하고, 태스크 정의에서 이를 참조할 수 있습니다.
- 다음과 같이 설정할 수 있습니다:

```json
{
  "containerDefinitions": [
	{
	  "name": "my-container",
	  "image": "my-image",
	  "secrets": [
		{
		  "name": "DB_PASSWORD",
		  "valueFrom": "arn:aws:ssm:us-west-2:123456789012:parameter/my-secure-string"
		}
	  ]
	}
  ]
}
```



### 4.2 Secrets Manager

- AWS Secrets Manager는 민감한 데이터를 안전하게 저장하고 관리하는 데 사용됩니다.
- 데이터베이스 비밀번호와 같은 민감한 정보를 Secrets Manager에 저장하고 태스크 정의에서 이를 참조할 수 있습니다.
- 예를 들어 다음과 같이 설정할 수 있습니다:

```json
{
  "containerDefinitions": [
	{
	  "name": "my-container",
	  "image": "my-image",
	  "secrets": [
		{
		  "name": "DB_PASSWORD",
		  "valueFrom": "arn:aws:secretsmanager:us-west-2:123456789012:secret:mysecret"
		}
	  ]
	}
  ]
}
```



## 5 환경 변수의 대량 관리

- 환경 변수를 대량으로 관리해야 하는 경우 Amazon S3를 사용할 수 있습니다.
- 환경 파일을 Amazon S3에 저장하고 태스크 정의에서 이를 참조할 수 있습니다.
- 다음은 환경 변수를 파일로 관리하는 예입니다:

```json
{
  "containerDefinitions": [
	{
	  "name": "my-container",
	  "image": "my-image",
	  "environmentFiles": [
		{
		  "value": "arn:aws:s3:::mybucket/myfile.env",
		  "type": "s3"
		}
	  ]
	}
  ]
}
```



## 6 Best Practices

- **작은 이미지 사용**: 가능한 작은 Docker 이미지를 사용하여 배포 속도를 높이고 보안 위험을 줄입니다.
- **명확한 로깅 설정**: CloudWatch Logs를 사용하여 애플리케이션 로그를 중앙에서 모니터링할 수 있도록 구성합니다.
- **환경 변수의 안전한 관리**: 환경 변수를 통해 중요한 정보를 안전하게 전달하고, 필요에 따라 AWS Secrets Manager 또는 Parameter Store를 사용합니다.
- **리소스 할당 최적화**: 각 컨테이너에 필요한 최소한의 리소스만 할당하여 비용을 절감하고 효율성을 높입니다.



**참고 자료**

- [Amazon ECS 공식 문서](https://docs.aws.amazon.com/ecs/latest/userguide/what-is-ecs.html)
- [ECS Task Definitions 관리](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html)

