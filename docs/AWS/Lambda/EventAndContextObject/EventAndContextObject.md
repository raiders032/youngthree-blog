## 1 Lambda - Event and Context Objects

- AWS Lambda는 서버리스 컴퓨팅 서비스로, 이벤트에 응답하여 코드를 실행합니다.
- Lambda 함수가 트리거될 때, 두 가지 중요한 객체를 받습니다
	- Event 객체와 Context 객체입니다.
- 이 두 객체는 Lambda 함수의 동작과 실행 환경에 대한 중요한 정보를 제공합니다.
- 이 글에서는 Event 객체와 Context 객체에 대해 자세히 알아보겠습니다.



## 2 Event 객체

- Event 객체는 Lambda 함수를 호출한 서비스로부터 받은 데이터를 포함합니다.
- 이 객체의 구조는 트리거 소스에 따라 다양합니다.
- Event 객체를 통해 함수는 처리해야 할 데이터나 이벤트에 대한 정보를 얻습니다.
- 테스트 이벤트를 작성할 때, 여러분은 실제로 이 event 객체의 내용을 정의하는 것입니다.



### 2.1 Event 객체의 특징

- **동적 구조**: 이벤트 소스에 따라 구조가 달라집니다.
- **JSON 형식**: 대부분의 경우 JSON 형식으로 데이터를 포함합니다.
- **읽기 전용**: 함수 내에서 수정할 수 없습니다.
- **크기 제한**: 최대 6MB까지의 데이터를 포함할 수 있습니다.



### 2.2 Event 객체 예시

아래는 S3 버킷에 객체가 생성될 때 트리거되는 Lambda 함수의 Event 객체 예시입니다.

```json
{
  "Records": [
	{
	  "eventVersion": "2.1",
	  "eventSource": "aws:s3",
	  "awsRegion": "us-west-2",
	  "eventTime": "2023-08-12T10:30:00.000Z",
	  "eventName": "ObjectCreated:Put",
	  "s3": {
		"bucket": {
		  "name": "example-bucket"
		},
		"object": {
		  "key": "example-object.jpg",
		  "size": 1024
		}
	  }
	}
  ]
}
```

- 이 예시에서 Event 객체는 S3 버킷 이름, 객체 키, 크기 등의 정보를 포함하고 있습니다.
- Lambda 함수는 이 정보를 활용하여 새로 생성된 객체에 대한 처리를 수행할 수 있습니다.



### 2.3 테스트 이벤트

- 테스트 이벤트는 Lambda 콘솔에서 함수를 테스트할 때 사용되는 JSON 형식의 데이터입니다.
- 이 테스트 이벤트는 실제 환경에서 Lambda 함수가 받을 수 있는 event 객체를 시뮬레이션합니다.
- 테스트 이벤트를 통해 다양한 시나리오에 대한 함수의 동작을 검증할 수 있습니다.
- 테스트 이벤트 생성
	- Lambda 콘솔에서 함수를 선택한 후 '테스트' 탭으로 이동합니다.
	- '새 이벤트' 버튼을 클릭하여 새로운 테스트 이벤트를 생성할 수 있습니다.
	- 이벤트 템플릿을 선택하거나 직접 JSON 형식의 이벤트를 작성할 수 있습니다.
- 테스트 이벤트 실행
	- 생성한 테스트 이벤트를 선택하고 '테스트' 버튼을 클릭하여 함수를 실행할 수 있습니다.
	- 실행 결과, 로그, 실행 시간 등의 정보를 확인할 수 있습니다.
- 테스트 이벤트 공유
	- AWS Lambda는 테스트 이벤트를 다른 사용자와 공유할 수 있는 기능을 제공합니다.
	- 공유 방법:
	    1. Lambda 콘솔에서 함수를 선택합니다.
	    2. '테스트' 탭으로 이동합니다.
	    3. 공유하려는 테스트 이벤트를 선택합니다.
	    4. '작업' 드롭다운 메뉴에서 '공유'를 선택합니다.
	    5. 공유 링크가 생성되며, 이를 다른 사용자에게 전달할 수 있습니다.
	- 공유된 테스트 이벤트는 받는 사람의 AWS 계정에 자동으로 추가됩니다.
	- 이를 통해 팀 내에서 일관된 테스트 시나리오를 유지하고 협업을 촉진할 수 있습니다.



## 3 Context 객체

- Context 객체는 Lambda 함수의 실행 환경에 대한 정보를 제공합니다.
- 이 객체는 함수의 실행 시간, 메모리 할당, AWS 요청 ID 등의 메타데이터를 포함합니다.
- Context 객체를 통해 함수는 자신의 실행 상태를 확인하고 관리할 수 있습니다.



### 3.1 Context 객체의 주요 속성

- **functionName**: 현재 실행 중인 Lambda 함수의 이름입니다.
- **functionVersion**: 함수의 버전입니다.
- **memoryLimitInMB**: 함수에 할당된 메모리 양입니다.
- **awsRequestId**: 현재 호출에 대한 고유 식별자입니다.
- **logGroupName**: CloudWatch Logs의 로그 그룹 이름입니다.
- **logStreamName**: CloudWatch Logs의 로그 스트림 이름입니다.
- **getRemainingTimeInMillis()**: 함수의 남은 실행 시간을 밀리초 단위로 반환하는 메서드입니다.



### 3.2 Context 객체 사용 예시

아래는 Python에서 Context 객체를 사용하는 간단한 예시입니다.

```python
import json

def lambda_handler(event, context):
	# Context 객체 사용 예시
	print(f"Function name: {context.function_name}")
	print(f"Memory limit: {context.memory_limit_in_mb} MB")
	print(f"Remaining time: {context.get_remaining_time_in_millis()} ms")
	
	# Event 객체 처리 예시
	print(f"Event: {json.dumps(event)}")
	
	return {
		'statusCode': 200,
		'body': json.dumps('Hello from Lambda!')
	}
```

- 이 예시에서는 Context 객체를 사용하여 함수 이름, 메모리 제한, 남은 실행 시간을 출력합니다.
- 또한 Event 객체를 JSON 문자열로 변환하여 출력합니다.



## 4 Event와 Context 객체의 활용

- **로깅 및 모니터링**: Context 객체의 정보를 활용하여 함수 실행에 대한 상세한 로그를 생성할 수 있습니다.
- **조건부 로직**: Event 객체의 내용에 따라 함수의 동작을 다르게 할 수 있습니다.
- **성능 최적화**: Context 객체의 getRemainingTimeInMillis() 메서드를 사용하여 함수의 실행 시간을 관리할 수 있습니다.
- **에러 처리**: Event 객체의 구조를 확인하여 잘못된 입력을 처리할 수 있습니다.



## 5 결론

- AWS Lambda의 Event와 Context 객체는 함수의 효율적인 실행과 관리를 위한 중요한 도구입니다.
- Event 객체를 통해 함수는 처리해야 할 데이터와 이벤트 정보를 얻을 수 있습니다.
- Context 객체는 함수의 실행 환경과 상태에 대한 중요한 메타데이터를 제공합니다.
- 두 객체를 적절히 활용하면 더 강력하고 유연한 Lambda 함수를 작성할 수 있습니다.
- Lambda 함수를 개발할 때는 항상 이 두 객체의 특성과 활용 방법을 고려하는 것이 좋습니다.