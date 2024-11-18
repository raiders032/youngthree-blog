## 1 Amazon EventBridge란?

- Amazon EventBridge는 서버리스 이벤트 버스 서비스입니다.
- 애플리케이션 간의 데이터 전송을 실시간으로 처리할 수 있게 해줍니다.
- AWS 서비스, SaaS 애플리케이션 및 사용자 지정 애플리케이션의 이벤트를 쉽게 연결할 수 있습니다.
- 이벤트 기반 아키텍처를 구현하는 데 최적화되어 있습니다.



## 2 EventBridge 핵심 개념

- **이벤트(Event)**: 환경의 상태 변화를 나타내는 JSON 형식의 데이터 레코드입니다.
- **규칙(Rule)**: 이벤트를 필터링하고 대상으로 라우팅하는 방법을 정의합니다.
- **이벤트 버스(Event Bus)**: 이벤트가 전달되는 파이프라인입니다.
- **대상(Target)**: 규칙과 일치하는 이벤트가 전송되는 AWS 서비스나 리소스입니다.



## 3 이벤트 소스

### 3.1 AWS 서비스 이벤트

- **EC2 인스턴스 상태 변경**:
	- 인스턴스 시작, 중지, 종료 등의 상태 변경
	- CPU 사용률, 메모리 사용량 등의 메트릭 임계값 초과
- **AWS Trusted Advisor**:
	- 비용 최적화 권장 사항
	- 보안 권장 사항
	- 성능 개선 제안
- **CloudWatch Alarms**:
	- 메트릭 기반 경보 상태 변경
	- 복합 경보 상태 변경



### 3.2 사용자 정의 이벤트

- 애플리케이션에서 생성된 커스텀 이벤트
- AWS SDK나 CLI를 통해 직접 생성된 이벤트
- 외부 시스템에서 발생한 이벤트



## 4 EventBridge 규칙 구성

### 4.1 이벤트 패턴 규칙

```json
{
  "source": ["aws.ec2"],
  "detail-type": ["EC2 Instance State-change Notification"],
  "detail": {
    "state": ["running", "stopped"]
  }
}
```
- 위 예시는 EC2 인스턴스의 상태가 'running' 또는 'stopped'로 변경될 때 트리거되는 규칙입니다.



### 4.2 일정 기반 규칙

```json
{
  "schedule": "rate(5 minutes)"
}
```
- 위 예시는 5분마다 트리거되는 규칙입니다.



## 5 EventBridge 대상 구성

### 5.1 Lambda 함수 대상

```json
{
  "targets": [{
    "id": "SendEmailFunction",
    "arn": "arn:aws:lambda:region:account-id:function:function-name",
    "input": {
      "recipient": "team@company.com",
      "subject": "EC2 Instance State Change"
    }
  }]
}
```
- 위 예시는 이벤트 발생 시 특정 Lambda 함수를 호출하여 이메일을 전송하는 대상 구성입니다.



### 5.2 SNS 주제 대상

```json
{
  "targets": [{
    "id": "NotificationTopic",
    "arn": "arn:aws:sns:region:account-id:topic-name",
    "inputTransformer": {
      "inputTemplate": "EC2 instance state changed to: <state>"
    }
  }]
}
```

- 위 예시는 이벤트 발생 시 SNS 주제로 알림을 전송하는 대상 구성입니다.



## 6 모니터링 및 운영 사례

### 6.1 이벤트 모니터링

- CloudWatch 메트릭을 통해 EventBridge 규칙의 호출 횟수, 실패 횟수 등을 모니터링할 수 있습니다.
- 실패한 이벤트는 DLQ(Dead Letter Queue)로 전송하여 추후 분석할 수 있습니다.



### 6.2 문제 해결 시나리오

- **시나리오 1: EC2 인스턴스 자동 종료**
	- CPU 사용률이 낮은 EC2 인스턴스 감지
	- EventBridge 규칙을 통해 자동 종료 작업 트리거
	- 관리자에게 SNS 알림 전송
- **시나리오 2: 리소스 생성 알림**
	- 새로운 EC2 인스턴스 생성 감지
	- EventBridge 규칙을 통해 SNS 주제로 알림 전송
	- 이메일을 통해 관련 팀에게 즉시 통보



## 7 EventBridge 보안

- IAM 역할과 정책을 통해 이벤트 버스 접근 제어
- AWS KMS를 통한 이벤트 데이터 암호화
- VPC 엔드포인트를 통한 프라이빗 액세스 지원
- CloudTrail을 통한 API 호출 감사



## 8 모범 사례

- 이벤트 패턴은 가능한 한 구체적으로 정의하여 불필요한 처리 방지
- DLQ를 구성하여 실패한 이벤트 추적 및 재처리
- 중요한 규칙에 대해서는 백업 알림 구성
- 이벤트 스키마를 문서화하여 일관성 유지
- 정기적으로 규칙과 대상의 상태 확인



## 9 결론

- EventBridge는 이벤트 기반 아키텍처를 구현하는 강력한 도구입니다.
- AWS 서비스 간의 자동화된 워크플로우를 구축할 수 있습니다.
- 적절한 모니터링과 보안 설정으로 안정적인 운영이 가능합니다.
- 다양한 사용 사례에 맞춰 유연하게 구성할 수 있습니다.