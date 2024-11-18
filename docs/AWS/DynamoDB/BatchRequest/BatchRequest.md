## 1 DynamoDB 배치 작업 이해하기

- Amazon DynamoDB는 빠르고 예측 가능한 성능과 원활한 확장성을 제공하는 완전 관리형 NoSQL 데이터베이스 서비스입니다.
- DynamoDB의 강력한 기능 중 하나는 단일 API 호출로 여러 항목을 읽고 쓸 수 있는 배치 작업입니다.
- 이 기능은 높은 처리량과 낮은 지연 시간을 요구하는 애플리케이션의 성능과 효율성을 최적화하는 데 필수적입니다.



## 2 BatchGetItem

- [레퍼런스](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html)
- **BatchGetItem**은 여러 DynamoDB 테이블에서 한 번에 여러 항목을 검색할 수 있는 API 작업입니다.
- 이 API를 사용하면 최대 100개의 항목 또는 16MB의 데이터를 한 번에 검색할 수 있습니다.
- 각 항목은 주로 기본 키(파티션 키와 정렬 키)를 사용하여 식별됩니다.
- 이 작업은 읽기 작업에 필요한 API 호출 수를 크게 줄여 효율성을 높이고 비용을 절감할 수 있습니다.



### 2.1 특징

- **다중 테이블**: 단일 요청으로 여러 테이블에서 항목을 읽을 수 있습니다.
- **최대 항목 수**: 최대 100개의 항목 또는 16MB의 데이터를 요청할 수 있습니다.
- **일관성**: 강력한 일관성 읽기 또는 최종 일관성 읽기를 선택할 수 있습니다.



### 2.2 BatchGetItem 사용 방법


**요청 예시:**

```json
{
    "RequestItems": {
        "Forum": {
            "Keys": [
                {
                    "Name":{"S":"Amazon DynamoDB"}
                },
                {
                    "Name":{"S":"Amazon RDS"}
                },
                {
                    "Name":{"S":"Amazon Redshift"}
                }
            ],
            "ProjectionExpression":"Name, Threads, Messages, Views"
        },
        "Thread": {
            "Keys": [
                {
                    "ForumName":{"S":"Amazon DynamoDB"},
                    "Subject":{"S":"Concurrent reads"}
                }
            ],
            "ProjectionExpression":"Tags, Message"
        }
    },
    "ReturnConsumedCapacity": "TOTAL"
}
```

- RequestItems:
    - 검색할 테이블과 각 테이블에서 가져올 항목들을 지정합니다.
    - 이 예시에서는 "Forum"과 "Thread" 두 개의 테이블에서 항목을 검색합니다.
- Keys:
    - 각 테이블에서 검색할 항목들의 기본 키 값을 지정합니다.
    - "Forum" 테이블에서는 "Name" 속성을 키로 사용하여 3개의 항목을 검색합니다.
    - "Thread" 테이블에서는 "ForumName"과 "Subject"를 복합 키로 사용하여 1개의 항목을 검색합니다.
- ProjectionExpression:
    - 각 테이블에서 검색할 속성들을 지정합니다.
    - "Forum" 테이블에서는 "Name, Threads, Messages, Views" 속성을 검색합니다.
    - "Thread" 테이블에서는 "Tags, Message" 속성을 검색합니다.
- ReturnConsumedCapacity:
    - 소비된 용량 정보의 반환 수준을 지정합니다.
    - "TOTAL"로 설정되어 있어 전체 작업에 대한 소비 용량을 반환합니다.
- ConsistentRead:
    - 이 예시에는 없지만, 필요 시 강력한 일관성 읽기 여부를 설정할 수 있습니다.
    - 기본값은 false로, 최종 일관성 읽기를 사용합니다.



### 2.3 BatchGetItem 사용 시 주의사항

- 한 번의 호출로 최대 100개의 항목만 검색할 수 있습니다.
- 검색 결과의 총 크기가 16MB를 초과할 수 없습니다.
- 처리되지 않은 키가 있는 경우, 지수 백오프(Exponential Backoff) 알고리즘을 사용하여 재시도하는 것이 좋습니다.
- DynamoDB는 결과를 특정 순서로 반환하지 않습니다. 필요한 경우 애플리케이션에서 정렬 로직을 구현해야 합니다.



### 2.4 BatchGetItem 제한 사항

- **크기 제한**: BatchGetItem은 최대 100개의 항목 또는 16MB의 데이터 중 작은 쪽을 검색할 수 있습니다.
- **처리량 소비**: 이 작업은 접근하는 테이블에서 읽기 용량 단위를 소비합니다.
- **UnprocessedKeys**: 응답에 UnprocessedKeys가 포함되면 요청한 모든 항목을 검색하지 못했음을 나타냅니다. 이는 프로비저닝된 처리량이 불충분하거나 크기 제한에 도달했기 때문일 수 있습니다.



### 2.5 UnprocessedKeys 처리 방법

- **재시도 로직**: UnprocessedKeys에 반환된 항목에 대해 재시도 메커니즘을 구현합니다. 이를 통해 결국 모든 요청된 항목을 검색할 수 있습니다.
- **지수 백오프**: 재시도 로직에서 지수 백오프를 사용하여 DynamoDB에 즉시 재시도 시도로 부담을 주는 것을 피합니다.
- **프로비저닝된 처리량 증가**: UnprocessedKeys가 자주 발생하는 경우, 영향을 받는 테이블에 대한 프로비저닝된 읽기 용량을 늘리는 것을 고려하세요.
- **요청 분할**: 크기 제한에 도달할 가능성을 줄이기 위해 대규모 배치 요청을 더 작은 요청으로 나눕니다.
- **병렬 처리**: 전체 성능을 향상시키기 위해 여러 개의 작은 BatchGetItem 요청을 병렬로 처리합니다.



## 3 BatchWriteItem

- **BatchWriteItem**은 한 번의 요청으로 하나 이상의 DynamoDB 테이블에 여러 항목을 넣거나 삭제할 수 있는 API 작업입니다.
- 이 작업은 대량 쓰기 작업을 효율적으로 관리하는 데 도움이 됩니다.



### 3.1 특징

- **다중 테이블**: 단일 요청으로 여러 테이블에 쓰기 작업을 수행할 수 있습니다.
- **최대 작업 수**: 단일 요청에 최대 25개의 `PutRequest` 및 `DeleteRequest` 작업을 포함할 수 있으며, 총 크기 제한은 16MB입니다.
- **비트랜잭션성**: 이 작업은 원자성을 지원하지 않으므로 일부 작업은 성공하고 일부는 실패할 수 있습니다.



### 3.2 사용 예제

```python
import boto3

## DynamoDB 클라이언트 생성
dynamodb = boto3.client('dynamodb')

## BatchWriteItem 요청
response = dynamodb.batch_write_item(
    RequestItems={
        'TableName': [
            {
                'PutRequest': {
                    'Item': {
                        'PrimaryKey': {'S': 'Key1'},
                        'Attribute': {'S': 'Value1'}
                    }
                }
            },
            {
                'DeleteRequest': {
                    'Key': {
                        'PrimaryKey': {'S': 'Key2'}
                    }
                }
            }
        ]
    }
)

print(response)

```



## 4 배치 작업의 이점

- DynamoDB의 배치 작업을 통해 애플리케이션의 성능을 최적화하고 비용을 절감할 수 있습니다.
- `BatchGetItem`과 `BatchWriteItem`은 모두 다중 테이블 지원, 최대 항목 수 제한, 비트랜잭션성 등의 특징을 가지고 있어 다양한 사용 사례에 적합합니다.