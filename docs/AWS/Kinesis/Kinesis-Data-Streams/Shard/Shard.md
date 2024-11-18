## 1 Kinesis Data Streams의 Shard

- Kinesis Data Streams는 대규모 데이터 스트리밍을 처리하기 위한 서비스입니다.
- 스트림 데이터는 여러 개의 샤드(shard)로 분할되어 병렬 처리됩니다.
- 샤드는 Kinesis Data Streams의 핵심 구성 요소 중 하나입니다.



## 2 Shard의 개념

- Shard는 Kinesis Data Streams에서 데이터 레코드를 저장하고 처리하는 기본 단위입니다.
- 각 샤드는 고정된 용량을 가지고 있으며, 읽기 및 쓰기 용량이 제한됩니다.
- 데이터를 스트림에 넣으면 특정 샤드에 할당되며, 소비자는 해당 샤드에서 데이터를 읽어 처리합니다.



### 2.1 Shard의 특성

- 각 샤드는 초당 1MB의 쓰기 용량과 2MB의 읽기 용량을 가집니다.
- 또한, 각 샤드는 초당 최대 1,000개의 PUT 레코드를 처리할 수 있습니다.
- Shard의 읽기 용량은 초당 5개의 GET 요청과 2개의 레코드 반환으로 제한됩니다.



### 2.2 Shard의 구성

- Kinesis 스트림은 하나 이상의 샤드로 구성될 수 있으며, 스트림의 용량은 샤드의 개수에 따라 결정됩니다.
- 필요에 따라 샤드를 추가하거나 제거하여 스트림의 용량을 조절할 수 있습니다.
- 샤드를 추가하면 스트림의 쓰기 및 읽기 용량이 증가하고, 샤드를 제거하면 용량이 감소합니다.



## 3 Shard의 데이터 분할

- 데이터를 샤드에 분배하기 위해 Kinesis는 파티션 키(partition key)를 사용합니다.
- 파티션 키는 데이터를 샤드에 균등하게 분배하는 데 사용되는 문자열 값입니다.
- Kinesis는 파티션 키의 해시 값을 계산하여 데이터를 특정 샤드에 할당합니다.



### 3.1 파티션 키의 중요성

- 파티션 키를 통해 데이터를 효과적으로 분산시켜 각 샤드의 부하를 균등하게 할 수 있습니다.
- 파티션 키를 잘못 설정하면 특정 샤드에 부하가 집중될 수 있으므로, 키를 적절히 선택하는 것이 중요합니다.



### 3.2 파티션 키 사용 예시

```python
import boto3

kinesis_client = boto3.client('kinesis')
response = kinesis_client.put_record(
	StreamName='my-stream',
	Data=b'{"key":"value"}',
	PartitionKey='partition-key-1'
)
```

- 위 예시에서 `partition-key-1`은 파티션 키로 사용되며, 이 키의 해시 값에 따라 데이터가 샤드에 할당됩니다.



### 3.3 파티션 키 선택 시 고려사항

- 데이터의 균등 분포: 파티션 키를 선택할 때 데이터가 균등하게 분산되도록 해야 합니다.
- 키의 다양성: 너무 적은 수의 파티션 키를 사용하면 특정 샤드에 부하가 집중될 수 있습니다.
- 해시 충돌 방지: 해시 충돌이 발생하지 않도록 파티션 키를 잘 설계해야 합니다.
- 동일 파티션 키 데이터 순서 보장: 동일한 파티션 키를 가진 데이터는 동일한 샤드에 할당되어 순서가 보장됩니다.



## 4 Shard의 확장과 축소

- 스트림의 트래픽이 증가하거나 감소함에 따라 샤드를 확장하거나 축소할 수 있습니다.
- Kinesis는 샤드를 병합(merge)하거나 분할(split)하여 스트림의 용량을 조절할 수 있습니다.



### 4.1 Shard 병합

```bash
aws kinesis merge-shards --stream-name my-stream --shard-to-merge shardId-000000000000 --adjacent-shard-to-merge shardId-000000000001
```

- 두 개의 샤드를 병합하여 하나의 샤드로 만드는 과정입니다.
- 병합을 통해 샤드의 수를 줄이고, 스트림의 용량을 축소할 수 있습니다.
- 샤드를 병합하면 원래의 두 샤드는 더 이상 데이터를 수집하지 않으며, 데이터 보관 기간(retention period)이 끝나면 자동으로 삭제됩니다. 
	- 이는 샤드 병합 후에 스트림 내 불필요한 샤드가 남지 않도록 보장합니다. 
	- 기본적인 데이터 보관 기간은 24시간에서 최대 7일로 설정할 수 있습니다.
- 샤드를 병합할 때는 항상 두 개의 샤드만을 하나의 새로운 샤드로 병합할 수 있습니다. 
	- 세 개 이상의 샤드를 병합하려면 여러 번의 병합 작업을 수행해야 합니다. 
	- 예를 들어, 세 개의 샤드를 하나로 병합하려면 두 개의 샤드를 먼저 병합한 후, 남은 샤드와 다시 병합해야 합니다.


### 4.2 Shard 분할

```bash
aws kinesis split-shard --stream-name my-stream --shard-to-split shardId-000000000000 --new-starting-hash-key 170141183460469231731687303715884105728
```

- 하나의 샤드를 두 개의 샤드로 분할하는 과정입니다.
- 분할을 통해 샤드의 수를 늘리고, 스트림의 용량을 확장할 수 있습니다.
- 샤드를 나누거나 병합하면, 기존의 샤드는 닫히게 됩니다.
	- 닫힌 샤드는 더 이상 데이터를 수집하지 않으며, 해당 샤드의 데이터 보관 기간(retention period)이 끝나면 자동으로 삭제됩니다. 
	- 보관 기간은 기본적으로 24시간에서 최대 7일로 설정할 수 있습니다.
- 하나의 샤드를 분할(Split)할 때, 최대 두 개의 새로운 샤드로만 나눌 수 있습니다. 
	- 예를 들어, 하나의 핫 샤드를 세 개 이상의 샤드로 나누려면 여러 번의 분할 작업이 필요합니다.



## 5 Shard 모니터링

- Kinesis Data Streams의 샤드 성능을 모니터링하기 위해 Amazon CloudWatch를 사용할 수 있습니다.
- CloudWatch는 각 샤드의 메트릭을 제공하며, 이를 통해 샤드의 상태를 모니터링하고 필요에 따라 확장 또는 축소할 수 있습니다.



## 6 ProvisionedThroughputExceeded 오류

### 6.1 ProvisionedThroughputExceeded 개념

- ProvisionedThroughputExceeded는 Kinesis Data Streams에서 발생할 수 있는 오류입니다.
- 이 오류는 스트림의 프로비저닝된 처리량(throughput)을 초과했을 때 발생합니다.
- 즉, 데이터의 읽기 또는 쓰기 요청이 샤드의 용량을 초과할 때 이 오류가 발생합니다.



### 6.2 프로듀서 측면에서의 ProvisionedThroughputExceeded

- 프로듀서가 데이터를 너무 빠르게 보내거나, 특정 파티션 키에 데이터가 집중될 때 발생할 수 있습니다.
- 예를 들어, 초당 1MB 이상의 데이터를 단일 샤드에 쓰려고 할 때 이 오류가 발생합니다.



#### 6.2.1 프로듀서 문제 해결 방법
1. **파티션 키 최적화**: 
	- 데이터가 균등하게 분산되도록 파티션 키를 다양하게 사용합니다.
	- 예: 타임스탬프나 고유 ID를 파티션 키로 사용
2. **재시도 로직 구현**:
	- 오류 발생 시 지수 백오프(exponential backoff)를 사용하여 재시도합니다.
3. **배치 처리**:
	- PutRecords API를 사용하여 여러 레코드를 한 번에 전송합니다.
4. **샤드 개수 증가**:
	- 스트림의 샤드 수를 늘려 전체 처리량을 증가시킵니다.


### 6.3 컨슈머 측면에서의 ProvisionedThroughputExceeded

- 컨슈머가 데이터를 너무 빠르게 읽거나, 너무 자주 API를 호출할 때 발생할 수 있습니다.
- 예를 들어, 단일 샤드에서 초당 2MB 이상의 데이터를 읽으려고 할 때 이 오류가 발생합니다.



#### 6.3.1 컨슈머 문제 해결 방법
1. **Enhanced Fan-Out 사용**:
	- 각 컨슈머에게 전용 처리량을 제공하여 다른 컨슈머의 영향을 받지 않도록 합니다.
2. **GetRecords 호출 간격 조정**:
	- GetRecords API 호출 사이에 적절한 간격을 두어 초당 호출 횟수를 제한합니다.
3. **병렬 처리**:
	- 여러 개의 컨슈머를 사용하여 부하를 분산시킵니다.
4. **샤드 개수 증가**:
	- 스트림의 샤드 수를 늘려 전체 읽기 처리량을 증가시킵니다.



### 6.4 모니터링 및 자동 스케일링

- CloudWatch 경보를 설정하여 ProvisionedThroughputExceeded 오류를 모니터링합니다.
- AWS Lambda와 CloudWatch 경보를 조합하여 자동으로 샤드를 추가하는 시스템을 구현할 수 있습니다.

```python
import boto3

def lambda_handler(event, context):
    kinesis = boto3.client('kinesis')
    
    # 현재 샤드 수 확인
    stream_info = kinesis.describe_stream(StreamName='your-stream-name')
    current_shard_count = len(stream_info['StreamDescription']['Shards'])
    
    # 샤드 수 증가
    new_shard_count = current_shard_count * 2  # 예: 샤드 수를 두 배로 증가
    
    kinesis.update_shard_count(
        StreamName='your-stream-name',
        TargetShardCount=new_shard_count,
        ScalingType='UNIFORM_SCALING'
    )
    
    print(f"Increased shard count from {current_shard_count} to {new_shard_count}")
```

- 위 Lambda 함수는 ProvisionedThroughputExceeded 오류가 발생했을 때 트리거되어 자동으로 샤드 수를 증가시킵니다.



### 6.5 결론

- ProvisionedThroughputExceeded 오류는 Kinesis Data Streams의 성능 한계에 도달했을 때 발생합니다.
- 이 오류를 해결하기 위해서는 데이터 분산, 재시도 로직 구현, 배치 처리, 샤드 수 증가 등의 방법을 사용할 수 있습니다.
- 적절한 모니터링과 자동 스케일링 시스템을 구축하면 이 오류를 사전에 방지하고 효율적으로 대응할 수 있습니다.



## 7 결론

- Kinesis Data Streams의 샤드는 스트림 데이터를 저장하고 처리하는 기본 단위입니다.
- 샤드는 고정된 읽기 및 쓰기 용량을 가지며, 필요에 따라 확장하거나 축소할 수 있습니다.
- 파티션 키를 사용하여 데이터를 샤드에 분배하고, CloudWatch를 통해 샤드 성능을 모니터링할 수 있습니다.
