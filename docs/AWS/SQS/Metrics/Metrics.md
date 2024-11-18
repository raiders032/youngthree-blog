## 1 Amazon SQS 메트릭 소개

- Amazon Simple Queue Service(SQS)는 분산 애플리케이션의 구성 요소 간 메시지를 전송, 저장 및 수신할 수 있는 완전관리형 메시지 큐잉 서비스입니다.
- SQS는 Amazon CloudWatch와 통합되어 다양한 메트릭을 제공합니다.
- 이러한 메트릭을 통해 큐의 성능을 모니터링하고, 문제를 진단하며, Auto Scaling 정책을 설정할 수 있습니다.



## 2 주요 SQS 메트릭

### 2.1 ApproximateNumberOfMessagesVisible

- 큐에서 검색 가능한 메시지의 대략적인 수입니다.
- **사용 사례**: 이 메트릭은 큐의 현재 부하를 나타내며, Auto Scaling 정책에서 자주 사용됩니다.
- **Auto Scaling 적용**: 이 값이 증가하면 더 많은 처리 용량(EC2 인스턴스)이 필요할 수 있음을 의미합니다.



### 2.2 ApproximateNumberOfMessagesNotVisible

- 처리 중이거나 시간 초과되지 않은 메시지의 대략적인 수입니다.
- **사용 사례**: 현재 처리 중인 메시지의 수를 파악하는 데 유용합니다.
- **Auto Scaling 적용**: 이 값이 지속적으로 높다면 처리 용량이 부족할 수 있음을 나타냅니다.



### 2.3 ApproximateNumberOfMessagesDelayed

- 지연된 메시지의 대략적인 수입니다.
- **사용 사례**: 지연 큐를 사용하는 경우 유용합니다.
- **Auto Scaling 적용**: 일반적으로 Auto Scaling에 직접적으로 사용되지 않지만, 특정 시나리오에서는 유용할 수 있습니다.



### 2.4 ApproximateAgeOfOldestMessage

- 큐에서 가장 오래된 메시지의 대략적인 나이(초)입니다.
- **사용 사례**: 메시지 처리 지연을 모니터링하는 데 유용합니다.
- **Auto Scaling 적용**: 이 값이 증가하면 처리 용량을 늘려야 할 수 있음을 나타냅니다.



### 2.5 NumberOfMessagesSent

- 지정된 기간 동안 큐에 성공적으로 추가된 메시지의 수입니다.
- **사용 사례**: 큐로의 유입 트래픽을 모니터링하는 데 유용합니다.
- **Auto Scaling 적용**: 급격한 증가는 추가 처리 용량이 필요할 수 있음을 나타냅니다.



### 2.6 NumberOfMessagesReceived

- 지정된 기간 동안 모든 요청에 대해 큐에서 반환된 메시지의 수입니다.
- **사용 사례**: 메시지 처리 속도를 모니터링하는 데 유용합니다.
- **Auto Scaling 적용**: 이 값이 NumberOfMessagesSent보다 지속적으로 낮다면 처리 용량 증가가 필요할 수 있습니다.



### 2.7 NumberOfEmptyReceives

- 메시지를 반환하지 않은 ReceiveMessage API 호출의 수입니다.
- **사용 사례**: 불필요한 API 호출을 식별하는 데 유용합니다.
- **Auto Scaling 적용**: 이 값이 높다면 처리 용량을 줄일 수 있음을 나타낼 수 있습니다.



## 3 SQS 메트릭을 이용한 효과적인 Auto Scaling

SQS 메트릭을 이용하여 효과적인 Auto Scaling 정책을 설정하는 방법은 다음과 같습니다:

- **기본 메트릭 선택**
	- `ApproximateNumberOfMessagesVisible`은 가장 일반적으로 사용되는 메트릭입니다. 
	- 이는 현재 처리 대기 중인 메시지의 수를 나타냅니다.
- **임계값 설정**
	- 예: 메시지 수가 1000개를 초과하면 인스턴스를 추가
	- 예: 메시지 수가 100개 미만으로 떨어지면 인스턴스를 제거
- **복합 메트릭 사용**
	- 더 정교한 Auto Scaling을 위해 여러 메트릭을 조합할 수 있습니다.
	- 예: `ApproximateNumberOfMessagesVisible`와 현재 실행 중인 인스턴스 수를 조합하여 사용자 정의 메트릭 생성
	- 이 복합 메트릭은 큐의 부하와 현재 처리 용량을 동시에 고려할 수 있게 해줍니다.
- **CloudWatch 경보 설정**
	- 선택한 메트릭에 대한 CloudWatch 경보를 생성
	- 생성한 경보를 Auto Scaling 정책과 연결
- **주기적인 모니터링 및 조정**
	- Auto Scaling 정책의 효과를 주기적으로 검토
	- 필요에 따라 임계값이나 사용하는 메트릭을 조정





## 4 실제 사용 사례: 파일 처리 시스템

- 다음과 같은 파일 처리 시스템을 가정해 봅시다:
	- SQS 큐에 파일 처리 요청이 들어옵니다.
	- EC2 인스턴스가 이 요청을 처리합니다.
	- 파일 크기에 따라 처리 시간이 다양합니다.



**예시 설정**

- **사용자 정의 메트릭 생성**
	- `ApproximateNumberOfMessagesVisible`을 현재 실행 중인 EC2 인스턴스 수로 나눕니다.
	- 이 메트릭은 "인스턴스당 대기 중인 메시지 수"를 나타냅니다.
- **CloudWatch에 메트릭 게시**
	- 이 사용자 정의 메트릭을 매분 CloudWatch에 게시합니다.
- **Auto Scaling 정책 설정**
	- 이 사용자 정의 메트릭이 특정 임계값(예: 인스턴스당 10개의 메시지)을 초과하면 인스턴스를 추가합니다.
	- 메트릭이 낮은 임계값(예: 인스턴스당 2개의 메시지) 아래로 떨어지면 인스턴스를 제거합니다.



## 5 결론

- SQS 메트릭은 큐의 상태와 성능을 모니터링하는 데 중요한 도구입니다.
- `ApproximateNumberOfMessagesVisible`은 Auto Scaling에 가장 일반적으로 사용되는 메트릭입니다.
- 그러나 더 효과적인 Auto Scaling을 위해서는 여러 메트릭을 조합한 사용자 정의 메트릭을 사용하는 것이 좋습니다.
- 적절한 메트릭 선택과 Auto Scaling 정책 설정을 통해 비용 효율적이고 성능이 우수한 시스템을 구축할 수 있습니다.