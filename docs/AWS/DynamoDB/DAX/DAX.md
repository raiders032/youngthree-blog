## 1 Amazon DynamoDB Accelerator (DAX)

- Amazon DynamoDB Accelerator (DAX)는 Amazon DynamoDB를 위한 완전관리형 고가용성 인메모리 캐시입니다.
- DAX는 DynamoDB의 읽기 성능을 최대 10배까지 향상시킬 수 있으며, 초당 수백만 건의 요청을 처리할 수 있습니다.
	- DAX는 캐싱을 통해 읽기 병목 문제를 해결합니다.
	- 캐시된 데이터에 대해 마이크로초 단위의 지연 시간을 제공합니다.
- 애플리케이션 로직 수정이 필요 없으며, 기존 DynamoDB API와 호환됩니다.
- 캐시의 기본 TTL(Time To Live)은 5분입니다.
- DAX (DynamoDB Accelerator)는 DynamoDB의 읽기 작업을 주로 캐싱합니다. 
	- 구체적으로 다음과 같은 항목들을 캐싱합니다
	- 개별 항목 읽기 결과: GetItem, BatchGetItem 등의 API 호출 결과를 캐싱합니다.
	- 쿼리 결과: Query API 호출의 결과를 캐싱합니다.
	- 스캔 결과: Scan API 호출의 결과를 캐싱합니다.



## 2 DAX의 주요 특징

- **완전관리형**: AWS가 DAX 클러스터의 모든 관리 작업을 수행하므로, 사용자는 애플리케이션 개발에만 집중할 수 있습니다.
- **고가용성**: 여러 가용 영역에 걸쳐 DAX 노드를 배포하여 고가용성을 제공합니다.
- **일관성**: DAX는 DynamoDB의 최종적 일관된 읽기 및 강력한 일관된 읽기 모델을 모두 지원합니다.
- **암호화**: 저장 데이터 및 전송 중인 데이터에 대한 암호화를 제공합니다.
- **확장성**: 수요에 따라 DAX 클러스터를 쉽게 확장할 수 있습니다.



## 3 DAX의 작동 방식

- DAX는 DynamoDB 테이블의 앞에 위치하는 인메모리 캐시로 작동합니다.
- 애플리케이션이 데이터를 요청하면, DAX는 먼저 자체 캐시를 확인합니다.
- 캐시에 데이터가 있으면 (캐시 히트), DAX는 즉시 데이터를 반환합니다.
- 캐시에 데이터가 없으면 (캐시 미스), DAX는 DynamoDB에서 데이터를 가져와 캐시에 저장한 후 애플리케이션에 반환합니다.



## 4 DAX의 사용 사례

- **읽기 집약적 워크로드**: 자주 액세스되는 데이터를 캐싱하여 읽기 성능을 크게 향상시킵니다.
- **실시간 데이터 처리**: 마이크로초 단위의 응답 시간이 필요한 실시간 애플리케이션에 적합합니다.
- **게임 리더보드**: 빈번한 업데이트와 읽기가 필요한 게임 리더보드 구현에 이상적입니다.
- **세션 저장**: 웹 애플리케이션의 사용자 세션 정보를 빠르게 저장하고 검색할 수 있습니다.



## 5 DAX 구현하기

### 5.1 DAX 클러스터 생성

- AWS Management Console, AWS CLI, 또는 AWS SDK를 사용하여 DAX 클러스터를 생성할 수 있습니다.
- 클러스터 생성 시 노드 유형, 노드 수, 서브넷 그룹 등을 지정합니다.



**AWS CLI를 사용한 DAX 클러스터 생성 예시**

```bash
aws dax create-cluster \
	--cluster-name MyDAXCluster \
	--node-type dax.r4.large \
	--replication-factor 3 \
	--iam-role-arn arn:aws:iam::123456789012:role/DAXServiceRole \
	--subnet-group MySubnetGroup
```



### 5.2 애플리케이션에서 DAX 사용하기

- DAX SDK를 사용하여 애플리케이션에서 DAX를 구현할 수 있습니다.
- 기존 DynamoDB 코드를 약간만 수정하여 DAX를 사용할 수 있습니다.

**Java에서 DAX 사용 예시**

```java
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazon.dax.client.dynamodbv2.AmazonDaxClientBuilder;

AmazonDaxClientBuilder builder = AmazonDaxClientBuilder.standard();
builder.withEndpointConfiguration("mydaxcluster.123abc.dax-clusters.us-west-2.amazonaws.com:8111");
DynamoDBMapper mapper = new DynamoDBMapper(builder.build());

// 이제 mapper 객체를 사용하여 DynamoDB 작업을 수행할 수 있습니다.
```



## 6 ElastiCache와의 차이점

- **DynamoDB 전용**
    - DAX는 DynamoDB와 통합되어 동작하는 전용 캐시 솔루션입니다.
    - ElastiCache는 Redis 및 Memcached를 지원하는 범용 인-메모리 캐시로, 다양한 데이터베이스와 애플리케이션에 사용할 수 있습니다.
- **통합의 용이성**
    - DAX는 DynamoDB API와 호환되므로 애플리케이션 코드를 수정할 필요 없이 쉽게 통합할 수 있습니다.
    - ElastiCache는 별도의 캐시 계층을 설정하고 애플리케이션 로직을 수정하여 통합해야 합니다.
- **성능**
    - DAX는 마이크로초 단위의 지연 시간을 제공하여 DynamoDB의 읽기 성능을 크게 향상시킵니다.
    - ElastiCache는 밀리초 단위의 지연 시간을 제공하며, 다양한 캐싱 전략을 지원합니다.
- **관리의 편리성**
    - DAX는 DynamoDB와 통합된 관리형 서비스로, 관리와 운영이 간편합니다.
    - ElastiCache는 다양한 설정과 튜닝이 필요하며, 더 많은 관리 작업이 요구될 수 있습니다.
- **사용 사례**
    - DAX는 읽기 집중적이고 DynamoDB와 직접 연동되는 애플리케이션에 적합합니다.
    - ElastiCache는 다양한 데이터 소스와의 통합이 필요하거나, 복잡한 캐싱 전략을 요구하는 애플리케이션에 적합합니다.



## 7 DAX 모니터링 및 관리

- **CloudWatch**: DAX 클러스터의 성능을 모니터링하기 위해 Amazon CloudWatch를 사용할 수 있습니다.
- **주요 지표**: 
  - CPUUtilization: CPU 사용률
  - NetworkBytesIn/Out: 네트워크 트래픽
  - CacheHitRate: 캐시 히트율
  - QueryCacheHits/Misses: 쿼리 캐시 히트 및 미스 수

**CloudWatch 경보 설정 예시 (AWS CLI)**

```bash
aws cloudwatch put-metric-alarm \
	--alarm-name "DAX-CPUUtilization-Alarm" \
	--alarm-description "Alarm when CPU exceeds 70%" \
	--metric-name CPUUtilization \
	--namespace AWS/DAX \
	--statistic Average \
	--period 300 \
	--threshold 70 \
	--comparison-operator GreaterThanThreshold \
	--dimensions Name=ClusterID,Value=MyDAXCluster \
	--evaluation-periods 2 \
	--alarm-actions arn:aws:sns:us-west-2:123456789012:MyTopic
```



## 8 결론

- Amazon DynamoDB Accelerator (DAX)는 DynamoDB의 읽기 성능을 대폭 향상시키는 강력한 인메모리 캐시 솔루션입니다.
- 읽기 집약적인 워크로드나 실시간 애플리케이션에 특히 유용하며, 구현이 간단하고 관리가 쉽습니다.
- DAX를 사용하면 애플리케이션의 성능을 크게 개선하면서도 DynamoDB의 확장성과 가용성을 그대로 유지할 수 있습니다.
- 하지만 모든 상황에 적합한 것은 아니므로, 사용 사례를 잘 분석하고 DAX가 적합한지 판단해야 합니다.