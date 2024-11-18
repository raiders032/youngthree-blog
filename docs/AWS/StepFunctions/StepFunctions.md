## 1 AWS Step Functions

- AWS Step Functions는 워크플로우를 상태 머신으로 모델링하는 서버리스 워크플로우 관리 서비스입니다.
- 복잡한 비즈니스 프로세스와 애플리케이션 워크플로우를 시각적으로 구성하고 실행할 수 있습니다.
- 주문 처리, 데이터 처리, 웹 애플리케이션 등 다양한 워크플로우에 적용 가능합니다.



## 2 주요 특징

- JSON으로 작성된 상태 머신을 사용하여 워크플로우를 정의합니다.
- 워크플로우와 실행 과정, 실행 이력을 시각적으로 확인할 수 있습니다.
- SDK 호출, API Gateway, EventBridge(CloudWatch Events)를 통해 워크플로우를 시작할 수 있습니다.



## 3 Step Functions의 상태 유형

- AWS Step Functions에서는 워크플로우를 구성하기 위해 다양한 유형의 상태를 사용합니다. 
- 각 상태는 특정 기능을 수행하며, 이들을 조합하여 복잡한 워크플로우를 만들 수 있습니다.



### 3.1 상태 유형

- Task State: 작업을 수행하는 상태
- Choice State: 조건을 테스트하여 특정 분기로 전송
- Fail or Succeed State: 실행을 실패 또는 성공으로 종료
- Pass State: 입력을 출력으로 전달하거나 고정 데이터를 주입
- Wait State: 특정 시간 동안 또는 지정된 시간/날짜까지 지연
- Map State: 단계를 동적으로 반복



### 3.1 Task State 상세 설명

- Task State는 Step Functions에서 실제 작업을 수행하는 핵심 상태입니다. 
- 다양한 AWS 서비스를 호출하거나 사용자 정의 활동을 실행할 수 있습니다.


#### 3.1.1 AWS 서비스 통합

- Task State를 통해 다음과 같은 AWS 서비스를 호출할 수 있습니다:
	- Lambda 함수 실행
	- AWS Batch 작업 실행
	- Amazon ECS 태스크 실행 및 완료 대기
	- DynamoDB 항목 삽입 또는 수정
	- Amazon SNS 또는 SQS에 메시지 게시
	- 다른 Step Functions 워크플로우 시작



#### 3.1.2 Activity 실행

- Task State는 또한 Activity를 실행할 수 있습니다:
- EC2, Amazon ECS, 또는 온프레미스 환경에서 실행 가능
- Activity는 Step Functions에서 작업을 폴링하고 결과를 반환하는 방식으로 동작



#### 3.1.3 오류 처리

- Task State에서는 다음과 같은 오류 처리 메커니즘을 제공합니다:
- Retry: 일시적인 오류에 대해 작업을 재시도
- Catch: 특정 오류 유형에 대해 대체 경로 실행



#### 3.1.4 타임아웃 설정

- 장기 실행 태스크에 대해 타임아웃을 설정하여 무한 대기 상태를 방지할 수 있습니다.



## 4 Step Functions의 오류 처리 - Retry와 Catch

- Step Functions에서는 Retry와 Catch를 통해 강력한 오류 처리 기능을 제공합니다. 
- 이를 통해 워크플로우의 안정성과 신뢰성을 높일 수 있습니다.
- 다양한 이유로 런타임 오류가 발생할 수 있습니다:
    - 상태 머신 정의 문제 (예: Choice 상태에서 일치하는 규칙 없음)
    - 작업 실패 (예: Lambda 함수에서 예외 발생)
    - 일시적인 문제 (예: 네트워크 분할 이벤트)
- 미리 정의된 오류 코드:
    - States.ALL: 모든 오류 이름과 일치
    - States.Timeout: 작업이 TimeoutSeconds보다 오래 실행되거나 하트비트가 수신되지 않음
    - States.TaskFailed: 실행 실패
    - States.Permissions: 코드 실행에 대한 권한 부족



### 4.1 Retry (재시도)

- Retry는 작업이 실패했을 때 자동으로 재시도하는 메커니즘입니다.
- 특정 유형의 오류에 대해 재시도 횟수, 간격, 백오프 전략 등을 설정할 수 있습니다.
- 주요 특징:
	- ErrorEquals: 특정 오류 유형을 지정합니다.
	- IntervalSeconds: 재시도 사이의 초기 대기 시간을 설정합니다.
	- MaxAttempts: 최대 재시도 횟수를 지정합니다. 기본값은 3이며, 0으로 설정하면 재시도하지 않습니다.
	- BackoffRate: 각 재시도마다 대기 시간을 증가시키는 비율을 설정합니다.



**Step Functions Retry 예시**

```json
{
  "HelloWorld": {
    "Type": "Task",
    "Resource": "arn:aws:lambda:REGION:ACCOUNT_ID:function:FUNCTION_NAME",
    "Retry": [
      {
        "ErrorEquals": ["CustomError"],
        "IntervalSeconds": 1,
        "MaxAttempts": 2,
        "BackoffRate": 2.0
      },
      {
        "ErrorEquals": ["States.TaskFailed"],
        "IntervalSeconds": 30,
        "MaxAttempts": 2,
        "BackoffRate": 2.0
      },
      {
        "ErrorEquals": ["States.ALL"],
        "IntervalSeconds": 5,
        "MaxAttempts": 5,
        "BackoffRate": 2.0
      }
    ],
    "End": true
  }
}
```

- CustomError가 발생하면 1초 후에 재시도하며, 최대 2번 시도합니다.
- States.TaskFailed 오류가 발생하면 30초 후에 재시도하며, 최대 2번 시도합니다.
- 다른 모든 오류(States.ALL)에 대해서는 5초 후에 재시도하며, 최대 5번 시도합니다.
- BackoffRate가 2.0이므로 각 재시도마다 대기 시간이 2배씩 증가합니다.



### 4.2 Catch (오류 포착)

- Catch는 특정 오류가 발생했을 때 다른 상태로 전환하는 메커니즘입니다.
- Retry 후에도 오류가 해결되지 않았을 때 사용됩니다.
- 주요 특징:
	- ErrorEquals: 포착할 특정 오류 유형을 지정합니다.
	- Next: 오류 발생 시 전환할 다음 상태를 지정합니다.
	- ResultPath: 오류 정보를 어떤 방식으로 다음 상태에 전달할지 지정합니다.



**Step Functions Catch 예시**

```json
{
  "HelloWorld": {
    "Type": "Task",
    "Resource": "arn:aws:lambda:REGION:ACCOUNT_ID:function:FUNCTION_NAME",
    "Catch": [
      {
        "ErrorEquals": ["CustomError"],
        "Next": "CustomErrorFallback"
      },
      {
        "ErrorEquals": ["States.TaskFailed"],
        "Next": "ReservedTypeFallback"
      },
      {
        "ErrorEquals": ["States.ALL"],
        "Next": "CatchAllFallback",
        "ResultPath": "$.error"
      }
    ],
    "End": true
  },
  "CustomErrorFallback": {
    "Type": "Pass",
    "Result": "This is a fallback from a custom error",
    "End": true
  },
  "ReservedTypeFallback": {
    "Type": "Pass",
    "Result": "This is a fallback from a reserved error code",
    "End": true
  },
  "CatchAllFallback": {
    "Type": "Pass",
    "Result": "This is a fallback from any other error",
    "End": true
  }
}
```

- CustomError가 발생하면 CustomErrorFallback 상태로 전환됩니다.
- States.TaskFailed 오류가 발생하면 ReservedTypeFallback 상태로 전환됩니다.
- 다른 모든 오류(States.ALL)에 대해서는 CatchAllFallback 상태로 전환되며, 오류 정보가 $.error 경로에 저장됩니다.



## 5 Step Functions - Wait for Task Token과 Activity Tasks

### 5.1 Wait for Task Token

- Wait for Task Token 기능은 Step Functions가 외부 프로세스나 시스템의 응답을 기다릴 수 있게 해주는 메커니즘입니다. 
- 이 기능의 작동 과정은 다음과 같습니다:

1. Task 상태 설정:
    - Resource 필드에 `.waitForTaskToken`을 추가하여 Step Functions에게 Task Token을 기다리도록 지시합니다.
2. Task Token 생성 및 전송:
    - Step Functions는 Task Token을 생성하고, 이를 지정된 리소스(예: SQS 큐)로 전송합니다.
3. 외부 프로세스 실행:
    - SQS 큐를 구독하는 외부 프로세스(예: Lambda 함수, EC2 인스턴스의 애플리케이션, ECS 태스크 등)가 메시지와 함께 Task Token을 수신합니다.
4. 작업 처리:
    - 외부 프로세스는 필요한 작업을 수행합니다. 이는 데이터 처리, 외부 API 호출, 인간의 승인 대기 등 다양한 작업일 수 있습니다.
5. 결과 반환:
    - 작업이 완료되면, 외부 프로세스는 Task Token과 함께 `SendTaskSuccess` 또는 `SendTaskFailure` API를 호출하여 Step Functions에 결과를 반환합니다.
6. 워크플로우 재개:
    - Step Functions는 반환된 Task Token을 확인하고, 성공 또는 실패 응답에 따라 워크플로우를 계속 진행합니다.



### 5.2 Activity Tasks

- Activity Tasks는 Step Functions의 작업을 외부 워커(Activity Worker)가 수행할 수 있게 해주는 기능입니다. 
- 이 기능의 작동 과정은 다음과 같습니다:

1. Activity 정의:
    - Step Functions에서 Activity를 생성하고 ARN을 받습니다.
2. Activity Worker 설정:
    - EC2 인스턴스, Lambda 함수, 모바일 디바이스 등에서 Activity Worker를 구현합니다.
3. 작업 폴링:
    - Activity Worker는 `GetActivityTask` API를 사용하여 주기적으로 Step Functions에서 작업을 폴링합니다.
4. 작업 수행:
    - 작업을 받으면 Activity Worker는 필요한 처리를 수행합니다.
5. 결과 반환:
    - 작업 완료 후, Activity Worker는 `SendTaskSuccess` 또는 `SendTaskFailure` API를 사용하여 결과를 Step Functions에 반환합니다.
6. 작업 유지:
    - 장기 실행 작업의 경우, `TimeoutSeconds`를 설정하고 주기적으로 `SendTaskHeartbeat`를 호출하여 작업을 활성 상태로 유지합니다.
    - 이를 통해 Activity Task는 최대 1년까지 실행될 수 있습니다.



## 5.3 Wait for Task Token과 Activity Tasks의 차이점

### 5.3.1 통신 방식

1. Wait for Task Token (푸시 방식):
    - Step Functions가 Task Token을 외부 서비스(예: SQS)로 푸시합니다.
    - 외부 프로세스는 메시지를 수신하고 작업을 수행합니다.
    - 작업 완료 후 프로세스가 능동적으로 결과를 Step Functions로 다시 푸시합니다.
2. Activity Tasks (풀 방식):
    - Activity Worker가 주기적으로 Step Functions를 폴링하여 작업을 요청합니다.
    - Step Functions는 작업이 있을 때 이를 Worker에게 전달합니다.
    - Worker는 작업 완료 후 결과를 Step Functions로 다시 보냅니다.



## 6 사용 사례

### 6.1 데이터 처리 파이프라인

- Step Functions를 사용하여 대규모 데이터 수집, 변환, 로딩(ETL) 작업을 자동화할 수 있습니다.
- 각 단계는 독립적으로 실행되며, 오류 발생 시 재시도 또는 대체 경로를 통해 안정적인 처리가 가능합니다.



### 6.2 마이크로서비스 조정

- 마이크로서비스 아키텍처에서 여러 서비스를 조정할 때 Step Functions를 사용하면 복잡한 비즈니스 로직을 시각적으로 관리할 수 있습니다.
- Parallel State를 활용하여 독립적인 서비스를 병렬로 실행하고 전체 워크플로우를 효율적으로 조정할 수 있습니다.



### 6.3 장기 실행 프로세스

- Activity Tasks를 활용하여 최대 1년까지 실행될 수 있는 장기 실행 프로세스를 관리할 수 있습니다.
- 주기적인 하트비트 전송을 통해 장기 실행 작업의 상태를 모니터링하고 제어할 수 있습니다.



## 7 결론

AWS Step Functions는 복잡한 워크플로우를 시각적으로 모델링하고 관리할 수 있는 강력한 도구입니다. 다양한 상태 유형, 오류 처리 메커니즘, 그리고 Activity Tasks를 통한 유연성을 제공하여 광범위한 사용 사례에 적용할 수 있습니다. 서버리스 아키텍처에서부터 장기 실행 프로세스 관리까지, Step Functions는 다양한 워크플로우 요구 사항을 효과적으로 충족시킬 수 있습니