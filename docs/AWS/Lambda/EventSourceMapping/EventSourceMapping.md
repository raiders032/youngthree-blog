## 1 AWS Lambda의 Event Source Mapping 이해하기

- AWS Lambda는 서버리스 컴퓨팅의 핵심 서비스로, 다양한 이벤트 소스와 연동하여 작동합니다.
- 이 중에서 Event Source Mapping은 스트림 및 큐 기반 서비스와 Lambda 함수를 연결하는 중요한 메커니즘입니다.



## 2 Event Source Mapping이란?

- Event Source Mapping은 Lambda 내에서 생성되고 관리되는 리소스입니다.
- 이는 스트림이나 큐에서 레코드를 읽어 Lambda 함수를 호출하는 역할을 합니다.
- 주로 대용량 스트리밍 데이터나 큐의 메시지를 처리하는 데 사용됩니다.



## 3 지원되는 서비스

- Event Source Mapping은 다음과 같은 AWS 서비스와 함께 사용됩니다:
	- Amazon DocumentDB (MongoDB 호환)
	- Amazon DynamoDB
	- Amazon Kinesis
	- Amazon MQ
	- Amazon Managed Streaming for Apache Kafka (Amazon MSK)
	- Self-managed Apache Kafka
	- Amazon Simple Queue Service (Amazon SQS)



## 4 Event Source Mapping vs 직접 트리거

- 일부 AWS 서비스는 트리거를 통해 Lambda 함수를 직접 호출할 수 있습니다.
- 트리거는 개별적이고 실시간 처리가 필요한 이벤트에 적합합니다.
- 반면, Event Source Mapping은 대량의 레코드를 배치로 처리하는 데 더 효율적입니다.



## 5 배치 처리 동작

- Event Source Mapping의 배치 처리는 다음과 같은 특징을 가집니다:
- **배치 윈도우**: 레코드를 모아 단일 페이로드로 만드는 최대 시간입니다.
- **배치 크기**: 단일 배치의 최대 레코드 수입니다.
- Lambda는 다음 세 가지 조건 중 하나가 충족되면 함수를 호출합니다:
	1. 배치 윈도우가 최대값에 도달
	2. 배치 크기가 충족됨
	3. 페이로드 크기가 6MB에 도달



## 6 배치 처리의 이점

- 개별 레코드 처리보다 배치 처리가 더 효율적입니다.
- 다양한 배치 및 레코드 크기로 테스트하여 최적의 성능을 찾을 수 있습니다.
- 큰 배치 크기는 호출 오버헤드를 더 많은 레코드에 분산시켜 처리량을 증가시킬 수 있습니다.



## 7 오류 처리 및 재시도

- 함수가 오류를 반환하면 Event Source Mapping은 기본적으로 전체 배치를 재처리합니다.
- 순서대로 처리를 보장하기 위해 오류 해결 전까지 해당 샤드의 처리를 일시 중지합니다.
- 스트림 소스(DynamoDB, Kinesis)의 경우 최대 재시도 횟수를 구성할 수 있습니다.
- 폐기된 이벤트 배치에 대한 호출 기록을 대상으로 보내도록 구성할 수 있습니다.



## 8 주의사항

- Event Source Mapping은 각 이벤트를 최소 한 번 처리하므로 중복 처리가 발생할 수 있습니다.
- 이를 방지하기 위해 Lambda 함수를 멱등성(idempotent)을 가지도록 구현하는 것이 중요합니다.



## 9 결론

- Event Source Mapping은 AWS Lambda와 스트림 또는 큐 기반 서비스를 효율적으로 연동하는 강력한 메커니즘입니다.
- 배치 처리, 오류 처리, 재시도 로직 등을 제공하여 대규모 데이터 처리 시나리오에서 높은 신뢰성과 효율성을 제공합니다.
- 적절한 구성과 함수 구현을 통해 서버리스 아키텍처의 장점을 최대한 활용할 수 있습니다.