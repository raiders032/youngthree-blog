## 1 AWS API Gateway 로깅 및 모니터링

- AWS API Gateway는 RESTful API와 WebSocket API를 생성, 게시, 유지 관리, 모니터링 및 보호하기 위한 완전관리형 서비스입니다.
- API Gateway의 효과적인 운영을 위해서는 로깅과 모니터링이 필수적입니다.
- 이 글에서는 API Gateway의 로깅 및 모니터링 방법에 대해 상세히 알아보겠습니다.



## 2 API Gateway 로깅

- API Gateway는 CloudWatch Logs를 사용하여 API 호출, 지연 시간, 오류 등의 정보를 로깅합니다.
- 로깅을 통해 API의 성능, 오류, 사용 패턴 등을 분석할 수 있습니다.



### 2.1 실행 로깅 설정

- 실행 로깅은 API 스테이지 레벨에서 설정합니다.
- CloudWatch 로그 그룹을 생성하고 API Gateway에 로그를 쓸 수 있는 권한을 부여해야 합니다.



**IAM 역할 생성 예시**

```json
{
  "Version": "2012-10-17",
  "Statement": [
	{
	  "Effect": "Allow",
	  "Action": [
		"logs:CreateLogGroup",
		"logs:CreateLogStream",
		"logs:DescribeLogGroups",
		"logs:DescribeLogStreams",
		"logs:PutLogEvents",
		"logs:GetLogEvents",
		"logs:FilterLogEvents"
	  ],
	  "Resource": "arn:aws:logs:*:*:*"
	}
  ]
}
```

- 이 IAM 역할은 API Gateway가 CloudWatch Logs에 로그를 쓸 수 있는 권한을 부여합니다.



### 2.2 액세스 로깅 설정

- 액세스 로깅은 API에 대한 호출자, 소스 IP, 요청 시간 등의 정보를 기록합니다.
- API 스테이지 설정에서 액세스 로깅을 활성화할 수 있습니다.



**액세스 로그 형식 예시**

```
$context.identity.sourceIp $context.identity.caller $context.identity.user [$context.requestTime] "$context.httpMethod $context.resourcePath $context.protocol" $context.status $context.responseLength $context.requestId
```

- 이 형식은 소스 IP, 호출자, 사용자, 요청 시간, HTTP 메서드, 리소스 경로, 프로토콜, 상태 코드, 응답 길이, 요청 ID를 기록합니다.



## 3 API Gateway 모니터링

- API Gateway는 Amazon CloudWatch와 통합되어 다양한 메트릭을 제공합니다.
- 이러한 메트릭을 통해 API의 성능, 가용성, 오류율 등을 모니터링할 수 있습니다.



### 3.1 주요 CloudWatch 메트릭

- **4XXError**: 클라이언트 측 오류의 수
- **5XXError**: 서버 측 오류의 수
- **CacheHitCount**: 캐시 히트 수
- **CacheMissCount**: 캐시 미스 수
- **Count**: API 요청 총 수
- **IntegrationLatency**: 백엔드 통합 지연 시간
	- API Gateway가 백엔드 서비스에 요청을 보낸 시점부터 백엔드로부터 응답을 받는 시점까지의 시간입니다.
- **Latency**: 전체 API 요청 지연 시간
	- 클라이언트가 요청을 보낸 시점부터 API Gateway가 응답을 반환하는 시점까지의 총 시간입니다.



### 3.2 CloudWatch 대시보드 생성

- CloudWatch 대시보드를 사용하여 API Gateway 메트릭을 시각화할 수 있습니다.
- 대시보드에 그래프, 숫자 위젯 등을 추가하여 API의 상태를 한눈에 파악할 수 있습니다.



**CloudWatch 대시보드 생성 예시**

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'CloudWatch Dashboard for API Gateway'
Resources:
  ApiGatewayDashboard:
	Type: AWS::CloudWatch::Dashboard
	Properties:
	  DashboardName: ApiGatewayMonitoring
	  DashboardBody: !Sub |
		{
		  "widgets": [
			{
			  "type": "metric",
			  "x": 0,
			  "y": 0,
			  "width": 12,
			  "height": 6,
			  "properties": {
				"metrics": [
				  [ "AWS/ApiGateway", "Count", "ApiName", "${ApiGatewayName}" ],
				  [ ".", "4XXError", ".", "." ],
				  [ ".", "5XXError", ".", "." ]
				],
				"view": "timeSeries",
				"stacked": false,
				"region": "${AWS::Region}",
				"title": "API Gateway Requests and Errors",
				"period": 300
			  }
			},
			{
			  "type": "metric",
			  "x": 0,
			  "y": 6,
			  "width": 12,
			  "height": 6,
			  "properties": {
				"metrics": [
				  [ "AWS/ApiGateway", "Latency", "ApiName", "${ApiGatewayName}" ],
				  [ ".", "IntegrationLatency", ".", "." ]
				],
				"view": "timeSeries",
				"stacked": false,
				"region": "${AWS::Region}",
				"title": "API Gateway Latency",
				"period": 300
			  }
			}
		  ]
		}
```

- 이 CloudFormation 템플릿은 API Gateway의 요청 수, 오류, 지연 시간을 보여주는 대시보드를 생성합니다.



### 3.3 CloudWatch 경보 설정

- 중요한 메트릭에 대해 CloudWatch 경보를 설정하여 문제 발생 시 신속하게 대응할 수 있습니다.
- 예를 들어, 5XX 오류가 일정 임계값을 초과할 경우 알림을 받도록 설정할 수 있습니다.

**CloudWatch 경보 생성 예시**

```yaml
Resources:
  High5XXErrorAlarm:
	Type: AWS::CloudWatch::Alarm
	Properties:
	  AlarmDescription: Alarm if 5XX errors exceed threshold
	  MetricName: 5XXError
	  Namespace: AWS/ApiGateway
	  Statistic: Sum
	  Period: 300
	  EvaluationPeriods: 1
	  Threshold: 10
	  AlarmActions:
		- !Ref SNSTopicArn
	  ComparisonOperator: GreaterThanThreshold
	  Dimensions:
		- Name: ApiName
		  Value: !Ref ApiGatewayName
```

- 이 CloudFormation 템플릿은 5분 동안 5XX 오류가 10개를 초과할 경우 SNS 주제로 알림을 보내는 경보를 생성합니다.



## 4 X-Ray를 사용한 분산 추적

- AWS X-Ray를 사용하여 API Gateway를 통과하는 요청의 전체 경로를 추적할 수 있습니다.
- X-Ray는 요청이 API Gateway에서 Lambda 함수, 데이터베이스 등 다른 AWS 서비스로 이동하는 과정을 시각화합니다.



### 4.1 X-Ray 활성화

- API Gateway 콘솔에서 X-Ray 추적을 활성화할 수 있습니다.
- API 스테이지 설정에서 'X-Ray Tracing' 옵션을 켜면 됩니다.



### 4.2 X-Ray 대시보드 활용

- X-Ray 콘솔에서 서비스 맵과 트레이스를 확인할 수 있습니다.
- 서비스 맵은 API의 전체 아키텍처를 시각적으로 보여줍니다.
- 트레이스는 개별 요청의 상세한 정보를 제공합니다.



## 5 결론

- API Gateway의 로깅과 모니터링은 API의 성능, 안정성, 보안을 유지하는 데 필수적입니다.
- CloudWatch Logs, CloudWatch 메트릭, CloudWatch 대시보드, CloudWatch 경보, 그리고 X-Ray를 조합하여 종합적인 모니터링 솔루션을 구축할 수 있습니다.
- 이러한 도구들을 효과적으로 활용하면 API의 문제를 사전에 감지하고, 성능을 최적화하며, 사용자 경험을 개선할 수 있습니다.