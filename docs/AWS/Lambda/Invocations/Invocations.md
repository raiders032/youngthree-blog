## 1 AWS Lambda 함수 호출(Invocation) 이해하기

- AWS Lambda는 서버리스 컴퓨팅 서비스로, 개발자가 인프라 관리 없이 코드를 실행할 수 있게 해줍니다.
- Lambda 함수를 사용하기 위해서는 함수를 호출(invoke)해야 합니다.
- Lambda 함수 호출에는 크게 두 가지 방식이 있습니다
    - 동기식(Synchronous) 호출
    - 비동기식(Asynchronous) 호출



## 2 동기식 호출 (Synchronous Invocation)

- 동기식 호출은 즉각적인 응답이 필요한 상황에서 사용됩니다.
- 호출자는 함수 실행이 완료될 때까지 기다리고 결과를 직접 받습니다.



### 2.1 동기식 호출의 특징

- **즉시 응답**:
    - 함수 실행이 완료되면 바로 결과를 반환합니다.
    - 실시간 처리가 필요한 경우에 적합합니다.
- **오류 처리**:
    - 오류 발생 시 호출자가 직접 처리해야 합니다.
    - 재시도 로직은 호출자 측에서 구현해야 합니다.
- **타임아웃**:
    - 기본 제한 시간은 3초입니다.
    - 최대 900초(15분)까지 설정 가능합니다.



### 2.2 동기식 호출의 사용 사례

- **사용자 호출 서비스**
    - **Elastic Load Balancing (Application Load Balancer)**:
        - 웹 애플리케이션의 요청을 Lambda 함수로 직접 라우팅할 때 사용합니다.
        - 마이크로서비스 아키텍처에서 서버리스 백엔드를 구현할 때 유용합니다.
    - **Amazon API Gateway**
        - RESTful API나 WebSocket API의 백엔드로 Lambda 함수를 사용할 때 적합합니다.
        - 모바일 앱이나 웹 애플리케이션의 백엔드 로직을 구현하는 데 자주 사용됩니다.
    - **Amazon CloudFront (Lambda@Edge)**
        - CDN의 엣지 로케이션에서 콘텐츠를 동적으로 수정하거나 생성할 때 사용합니다.
        - 사용자에게 가까운 위치에서 빠른 응답 시간을 제공할 수 있습니다.
    - **Amazon S3 Batch**
        - S3 객체에 대한 대량 작업을 수행할 때 Lambda 함수를 사용합니다.
        - 예를 들어, 많은 수의 S3 객체에 대한 메타데이터 수정이나 포맷 변환 등에 활용할 수 있습니다.
- **서비스 호출**:
    - **Amazon Cognito**
        - 사용자 인증 및 권한 부여 과정에서 커스텀 로직을 실행할 때 사용합니다.
        - 예를 들어, 사용자 등록 시 추가적인 데이터 검증이나 처리가 필요한 경우에 활용할 수 있습니다.
    - **AWS Step Functions**
        - 복잡한 워크플로우의 각 단계에서 Lambda 함수를 실행할 때 사용합니다.
        - 비즈니스 프로세스 자동화나 데이터 처리 파이프라인 구축에 유용합니다.
- **기타 서비스**:
    - **Amazon Lex**
        - 챗봇의 의도 처리나 대화 흐름 관리를 위해 Lambda 함수를 사용합니다.
        - 사용자 입력에 대한 동적 응답 생성에 활용할 수 있습니다.
    - **Amazon Alexa**
        - Alexa 스킬의 백엔드 로직을 구현할 때 Lambda 함수를 사용합니다.
        - 음성 명령에 대한 처리와 응답 생성에 적합합니다.
    - **Amazon Kinesis Data Firehose**
        - 데이터 스트림의 실시간 처리와 변환을 위해 Lambda 함수를 사용합니다.
        - 예를 들어, 로그 데이터의 포맷 변경이나 필터링 등에 활용할 수 있습니다.



### 2.3 동기식 호출 예시 코드

**AWS SDK for Python (Boto3)을 사용한 동기식 Lambda 함수 호출:**

```python
import boto3
lambda_client = boto3.client('lambda')
response = lambda_client.invoke(
    FunctionName='my-function',
    InvocationType='RequestResponse',
    Payload='{"key1": "value1", "key2": "value2"}'
)
print(response['Payload'].read().decode('utf-8'))

```

- 이 코드는 'my-function'이라는 Lambda 함수를 동기적으로 호출합니다.
- 'RequestResponse'는 동기식 호출을 나타냅니다.
- 함수의 응답은 'response' 변수에 저장됩니다.



## 3 비동기식 호출 (Asynchronous Invocation)

- 비동기식 호출은 즉각적인 응답이 필요하지 않은 경우에 사용됩니다.
- Lambda가 이벤트를 수신하고 처리하지만, 호출자는 결과를 기다리지 않습니다.



### 3.1 비동기식 호출의 특징

- **즉시 반환**:
    - Lambda는 이벤트를 큐에 넣고 추가 정보 없이 성공 응답을 즉시 반환합니다.
    - 백그라운드 작업이나 시간이 오래 걸리는 처리에 적합합니다.
- **내부 이벤트 큐**:
    - Lambda는 비동기 호출을 위한 내부 이벤트 큐를 관리합니다.
    - 별도의 프로세스가 큐에서 이벤트를 읽어 함수로 전송합니다.
- **자동 재시도**:
    - 오류 발생 시 Lambda가 자동으로 재시도합니다.
    - 기본적으로 총 3회 시도합니다 (초기 시도 + 2회 재시도).
    - 첫 번째 재시도 전 1분 대기, 두 번째 재시도 전 2분 대기합니다.
- **Dead-Letter Queue (DLQ) 지원**:
    - 모든 재시도 후에도 처리에 실패한 이벤트를 위해 DLQ를 구성할 수 있습니다.
    - DLQ로 Amazon SQS(Simple Queue Service) 또는 Amazon SNS(Simple Notification Service)를 사용할 수 있습니다.
    - DLQ를 사용하려면 적절한 IAM 권한이 필요합니다.
- **멱등성 보장**:
    - 재시도 발생 시 중복 처리를 방지하기 위해 함수 로직이 멱등성을 가져야 합니다.
    - 멱등성은 동일한 작업을 여러 번 수행해도 결과가 달라지지 않는 특성을 말합니다.
    - 비동기 호출에서 Lambda 함수가 여러 번 실행되더라도 최종 결과가 동일해야 함을 의미합니다.
- **CloudWatch Logs에서의 중복 로그**:
    - 함수가 재시도되면 CloudWatch Logs에 중복된 로그 항목이 생성될 수 있습니다.
- **비동기 처리의 이점**:
    - 결과를 기다리지 않고 많은 작업을 빠르게 처리할 수 있습니다 (예: 1000개의 파일 처리).



### 3.2 비동기식 호출의 사용 사례

- **Amazon S3**
    - 파일 업로드 시 처리 작업을 트리거할 때 사용합니다.
- **Amazon SNS**
    - 메시지 발행 시 Lambda 함수를 트리거할 때 사용합니다.
- **Amazon EventBridge (CloudWatch Events)**
    - 스케줄된 작업이나 AWS 서비스 상태 변경에 반응할 때 사용합니다.



### 3.3 비동기식 호출 예시 코드

**AWS CLI를 사용한 비동기식 Lambda 함수 호출:**

```bash
aws lambda invoke \
  --function-name my-function  \
  --invocation-type Event \
  --cli-binary-format raw-in-base64-out \
  --payload '{ "key": "value" }' response.json
```

- 이 명령은 'my-function'이라는 Lambda 함수를 비동기적으로 호출합니다.
- 'Event'는 비동기식 호출을 나타냅니다.
- 응답으로는 상태 코드 202가 반환되며, 함수의 실행 결과는 포함되지 않습니다.
	- AWS Lambda의 비동기 호출에서 202 상태 코드는 Lambda가 이벤트를 성공적으로 큐에 넣었음을 의미합니다.
	- 함수의 실행 결과나 성공 여부와는 무관합니다.
	- 단지 Lambda 서비스가 요청을 수락했고 나중에 처리할 것임을 나타냅니다.



### 3.4 Lambda Destinations

![[Pasted image 20240830094235.png]]

- 2019년 11월부터 Lambda 함수의 결과를 특정 목적지(destination)로 보내도록 구성할 수 있게 되었습니다.
- 비동기식 호출의 경우, 성공적인 실행과 실패한 실행에 대해 각각 다른 목적지를 정의할 수 있습니다.



#### 3.4.1 Destinations for Asynchronous Invocation

- 비동기식 호출에 대한 목적지로 다음 서비스들을 사용할 수 있습니다:
	- Amazon SQS (Simple Queue Service)
	- Amazon SNS (Simple Notification Service)
	- AWS Lambda (다른 Lambda 함수)
	- Amazon EventBridge bus



#### 3.4.2 AWS 권장사항

- AWS는 이제 DLQ(Dead Letter Queue) 대신 Destinations 사용을 권장합니다.
- 그러나 필요한 경우 DLQ와 Destinations를 동시에 사용할 수 있습니다.



### 3.5 Event Source Mapping

- 폐기된 이벤트 배치(discarded event batches)를 처리하기 위해 Event Source Mapping 기능을 사용할 수 있습니다.
- 이 기능은 다음 서비스에서 사용 가능합니다:
	- Amazon SQS
	- Amazon SNS



#### 3.5.1 DLQ 직접 연결

- SQS에서 직접 DLQ로 이벤트를 보낼 수 있습니다.



## 4 동기식 vs 비동기식 호출: 언제 무엇을 사용해야 할까?

- **동기식 호출 선택 시기**:
    - 즉각적인 응답이 필요한 경우
    - 함수의 결과를 바로 사용해야 하는 경우
    - 오류를 즉시 처리해야 하는 경우
- **비동기식 호출 선택 시기**:
    - 백그라운드 작업을 처리할 때
    - 긴 처리 시간이 예상되는 작업
    - 이벤트 기반의 워크플로우를 구현할 때



## 5 결론

- Lambda 함수 호출 방식을 선택할 때는 애플리케이션의 요구사항을 신중히 고려해야 합니다.
- 동기식 호출은 즉각적인 응답이 필요한 실시간 처리에 적합합니다.
- 비동기식 호출은 백그라운드 처리와 이벤트 기반 아키텍처에 이상적입니다.
- Lambda의 내부 이벤트 큐 시스템은 비동기 호출의 신뢰성과 확장성을 보장합니다.
- 두 방식을 적절히 조합하여 사용하면 효율적이고 확장 가능한 서버리스 애플리케이션을 구축할 수 있습니다.
- Lambda의 호출 방식을 이해하고 적절히 활용하면, 서버리스 아키텍처의 장점을 최대한 활용할 수 있습니다.