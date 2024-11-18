## 1 AWS API Gateway Integration Types

- AWS API Gateway는 다양한 백엔드 서비스와 API를 통합할 수 있는 유연한 방법을 제공합니다.
- 이러한 통합 방식을 'Integration Types'라고 부릅니다.
- 각 Integration Type은 특정 사용 사례와 백엔드 서비스에 최적화되어 있습니다.



## 2 AWS Integration Types

### 2.1 AWS Lambda Function

- Lambda 함수와 API Gateway를 직접 통합하는 방식입니다.
- 특징:
	- 서버리스 아키텍처를 구현하는 데 이상적입니다.
	- API Gateway가 자동으로 Lambda 함수를 호출합니다.
	- 요청 데이터를 Lambda 이벤트로 변환합니다.



**예시 설정:**

```json
{
  "type": "AWS_PROXY",
  "httpMethod": "POST",
  "uri": "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:MyFunction/invocations",
  "passthroughBehavior": "WHEN_NO_MATCH",
  "timeoutInMillis": 29000
}
```



### 2.2 AWS Service

- 다른 AWS 서비스와 API Gateway를 통합하는 방식입니다.
- 특징:
	- S3, DynamoDB, SQS 등 다양한 AWS 서비스와 통합 가능합니다.
	- API Gateway가 AWS 서비스의 API를 대신 호출합니다.



**예시 설정 (DynamoDB와 통합):**

```json
{
  "type": "AWS",
  "httpMethod": "POST",
  "uri": "arn:aws:apigateway:us-east-1:dynamodb:action/PutItem",
  "credentials": "arn:aws:iam::123456789012:role/APIGatewayDynamoDBRole",
  "requestTemplates": {
	"application/json": {
	  "TableName": "MyTable",
	  "Item": {
		"id": { "S": "$input.path('$.id')" },
		"name": { "S": "$input.path('$.name')" }
	  }
	}
  },
  "passthroughBehavior": "WHEN_NO_TEMPLATES"
}
```



### 2.3 HTTP Endpoint

- 공개적으로 접근 가능한 HTTP 엔드포인트와 API Gateway를 통합하는 방식입니다.
- 특징:
	- 기존의 HTTP API나 웹 서비스와 통합할 때 사용합니다.
	- API Gateway가 프록시 역할을 수행합니다.



**예시 설정:**

```json
{
  "type": "HTTP",
  "httpMethod": "GET",
  "uri": "http://example.com/path/to/resource",
  "connectionType": "INTERNET",
  "passthroughBehavior": "WHEN_NO_MATCH"
}
```



### 2.4 Mock Integration

- 백엔드 없이 API 응답을 시뮬레이션하는 방식입니다.
- 특징:
	- API 프로토타이핑이나 테스트에 유용합니다.
	- API Gateway가 직접 응답을 생성합니다.



**예시 설정:**

```json
{
  "type": "MOCK",
  "requestTemplates": {
	"application/json": "{\"statusCode\": 200}"
  },
  "passthroughBehavior": "WHEN_NO_MATCH"
}
```



## 3 Proxy vs Non-Proxy Integration

- API Gateway는 각 Integration Type에 대해 Proxy와 Non-Proxy 통합을 지원합니다.



### 3.1 Proxy Integration

- API Gateway가 요청을 최소한으로 처리하고 백엔드로 전달합니다.
- 백엔드가 응답 형식을 완전히 제어합니다.
- 구성이 간단하고 빠릅니다.



### 3.2 Non-Proxy Integration

- API Gateway에서 요청과 응답을 변형할 수 있습니다.
- 매핑 템플릿을 사용하여 데이터 형식을 조정할 수 있습니다.
- 더 많은 제어와 유연성을 제공하지만, 설정이 복잡할 수 있습니다.



## 4 Integration Type 선택 가이드

- **Lambda Function**: 서버리스 아키텍처를 구현하거나 커스텀 로직이 필요한 경우
- **AWS Service**: 다른 AWS 서비스와 직접 통합해야 하는 경우
- **HTTP Endpoint**: 기존 HTTP API나 웹 서비스와 통합해야 하는 경우
- **Mock Integration**: API 프로토타이핑이나 테스트가 필요한 경우



## 5 Best Practices

- **보안**: 각 Integration Type에 맞는 적절한 IAM 권한을 설정합니다.
- **성능**: 캐싱을 활용하여 백엔드 부하를 줄이고 응답 시간을 개선합니다.
- **에러 처리**: 각 Integration Type에 맞는 에러 처리 로직을 구현합니다.
- **모니터링**: CloudWatch를 사용하여 API 성능과 오류를 모니터링합니다.



## 6 결론

- API Gateway의 다양한 Integration Type은 다양한 백엔드 서비스와의 유연한 통합을 가능하게 합니다.
- 프로젝트의 요구사항과 아키텍처에 따라 적절한 Integration Type을 선택하는 것이 중요합니다.
- Proxy와 Non-Proxy 통합 옵션을 통해 더욱 세밀한 제어가 가능합니다.
- 적절한 Integration Type 선택과 구성을 통해 효율적이고 확장 가능한 API를 구축할 수 있습니다.