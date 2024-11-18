## 1 Amazon EventBridge 이벤트 버스

- Amazon EventBridge는 AWS 서비스, SaaS 애플리케이션, 커스텀 애플리케이션에서 발생하는 이벤트를 중앙에서 관리하고 처리할 수 있는 이벤트 버스 기능을 제공합니다.
- 이를 통해 다양한 소스의 이벤트를 수집, 필터링 및 전달하여 이벤트 기반 아키텍처를 구축할 수 있습니다.



## 2 이벤트 버스(Event Bus)

- 이벤트 버스는 이벤트가 수신되고 전송되는 곳입니다.
- 기본(Default) 이벤트 버스는 AWS 계정당 하나씩 제공되며, 대부분의 이벤트를 처리합니다.
- 커스텀(Custom) 이벤트 버스를 생성하여 특정 애플리케이션이나 워크로드에 맞게 이벤트를 분리하고 관리할 수 있습니다.
- 파트너 이벤트 버스는 SaaS(Software as a Service) 파트너로부터 직접 이벤트를 수신합니다.



### 2.1 이벤트 버스 예시

**기본 이벤트 버스**

```yaml
Resources:
  MyDefaultEventBusRule:
	Type: "AWS::Events::Rule"
	Properties:
	  EventPattern:
		source:
		  - "aws.ec2"
		detail-type:
		  - "EC2 Instance State-change Notification"
		detail:
		  state:
			- "pending"
	  State: "ENABLED"
	  Targets:
		- Arn: !GetAtt MyLambdaFunction.Arn
		  Id: "MyLambdaFunction"
```

- **설명**: 기본 이벤트 버스 예시 (클라우드 포메이션 템플릿)



**커스텀 이벤트 버스**

```yaml
Resources:
  MyCustomEventBus:
	Type: "AWS::Events::EventBus"
	Properties:
	  Name: "MyCustomEventBus"
```

- **설명**: 커스텀 이벤트 버스 예시 (클라우드 포메이션 템플릿)



## 3 이벤트 소스(Event Source)

- 이벤트 소스는 이벤트가 발생하는 서비스나 애플리케이션을 나타냅니다.
- EventBridge는 AWS 서비스, SaaS 애플리케이션, 커스텀 애플리케이션에서 발생하는 이벤트를 수신할 수 있습니다.



### 3.1 AWS 서비스 이벤트

- EventBridge는 AWS 서비스에서 발생하는 이벤트를 기본적으로 수신할 수 있습니다.
- 예를 들어, EC2 인스턴스 상태 변경, S3 버킷 이벤트 등을 처리할 수 있습니다.



### 3.2 SaaS 애플리케이션 이벤트

- EventBridge는 다양한 SaaS 애플리케이션과 통합되어 이벤트를 수신할 수 있습니다.
- 이를 통해 외부 서비스와의 통합을 쉽게 구현할 수 있습니다.



### 3.3 커스텀 애플리케이션 이벤트

- EventBridge는 커스텀 애플리케이션에서 발생하는 이벤트도 처리할 수 있습니다.
- 애플리케이션 코드에서 EventBridge로 이벤트를 전송할 수 있습니다.



## 4 이벤트 필터링 및 규칙(Event Rules)

- 이벤트 필터링은 특정 조건에 따라 이벤트를 필터링하여 원하는 대상에만 전달하는 기능입니다.
- 규칙(Rule)을 사용하여 이벤트 패턴을 정의하고, 이벤트를 필터링 및 전달할 수 있습니다.



### 4.1 이벤트 필터링 예시

**EC2 인스턴스 상태 변경 이벤트 필터링**

```yaml
Resources:
  MyEC2InstanceStateChangeRule:
	Type: "AWS::Events::Rule"
	Properties:
	  EventPattern:
		source:
		  - "aws.ec2"
		detail-type:
		  - "EC2 Instance State-change Notification"
		detail:
		  state:
			- "running"
	  State: "ENABLED"
	  Targets:
		- Arn: !GetAtt MyLambdaFunction.Arn
		  Id: "MyLambdaFunction"
```

- **설명**: EC2 인스턴스 상태 변경 이벤트를 필터링하는 예시 (클라우드 포메이션 템플릿)



## 5 이벤트 대상(Event Targets)

- 이벤트 대상(Target)은 필터링된 이벤트가 전달되는 서비스나 리소스를 나타냅니다.
- EventBridge는 다양한 AWS 서비스 및 커스텀 애플리케이션을 대상으로 이벤트를 전달할 수 있습니다.



### 5.1 이벤트 대상 예시

**Lambda 함수를 대상으로 하는 예시**

```yaml
Resources:
  MyLambdaTargetRule:
	Type: "AWS::Events::Rule"
	Properties:
	  EventPattern:
		source:
		  - "aws.ec2"
		detail-type:
		  - "EC2 Instance State-change Notification"
	  State: "ENABLED"
	  Targets:
		- Arn: !GetAtt MyLambdaFunction.Arn
		  Id: "MyLambdaFunction"
```

- **설명**: Lambda 함수를 대상으로 이벤트를 전달하는 예시 (클라우드 포메이션 템플릿)



**SQS 큐를 대상으로 하는 예시**

```yaml
Resources:
  MySQSTargetRule:
	Type: "AWS::Events::Rule"
	Properties:
	  EventPattern:
		source:
		  - "aws.ec2"
		detail-type:
		  - "EC2 Instance State-change Notification"
	  State: "ENABLED"
	  Targets:
		- Arn: !GetAtt MyQueue.Arn
		  Id: "MyQueue"
```

- **설명**: SQS 큐를 대상으로 이벤트를 전달하는 예시 (클라우드 포메이션 템플릿)



## 6 이벤트 아카이빙 및 리플레이

- EventBridge는 이벤트를 아카이빙하여 나중에 다시 재생할 수 있는 기능을 제공합니다.
- 이를 통해 과거의 이벤트를 분석하거나, 실패한 처리를 다시 시도할 수 있습니다.



### 6.1 이벤트 아카이빙 설정 예시

**이벤트 아카이빙 설정**

```yaml
Resources:
  MyEventBus:
	Type: "AWS::Events::EventBus"
	Properties:
	  Name: "MyEventBus"

  MyArchive:
	Type: "AWS::Events::Archive"
	Properties:
	  SourceArn: !GetAtt MyEventBus.Arn
	  RetentionDays: 30
```

- **설명**: 이벤트 아카이빙 설정 예시 (클라우드 포메이션 템플릿)



### 6.2 이벤트 리플레이 설정 예시

**이벤트 리플레이 설정**

```yaml
Resources:
  MyReplay:
	Type: "AWS::Events::Replay"
	Properties:
	  EventSourceArn: !GetAtt MyArchive.Arn
	  EventStartTime: "2024-01-01T00:00:00Z"
	  EventEndTime: "2024-01-02T00:00:00Z"
```

- **설명**: 이벤트 리플레이 설정 예시 (클라우드 포메이션 템플릿)



## 7 결론

- Amazon EventBridge는 다양한 소스에서 발생하는 이벤트를 중앙에서 관리하고 처리할 수 있는 강력한 기능을 제공합니다.
- 이벤트 버스를 통해 이벤트를 분리하고 관리할 수 있으며, 필터링 및 규칙을 사용하여 원하는 대상에만 이벤트를 전달할 수 있습니다.
- 또한, 이벤트 아카이빙 및 리플레이 기능을 통해 과거의 이벤트를 분석하거나 다시 처리할 수 있습니다.



**참고 자료**
- [Amazon EventBridge 공식 문서](https://docs.aws.amazon.com/eventbridge/latest/userguide/what-is-amazon-eventbridge.html)
- [AWS Management Console](https://aws.amazon.com/console/)
