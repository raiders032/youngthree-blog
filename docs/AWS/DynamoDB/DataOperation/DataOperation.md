## 1 DynamoDB 데이터 작업 개요

- DynamoDB는 AWS의 NoSQL 데이터베이스 서비스로, 다양한 데이터 작업을 지원합니다.
- 주요 작업으로는 쓰기, 읽기, 삭제, 배치 작업 등이 있습니다.



## 2 데이터 쓰기 작업

### 2.1 PutItem

- 새 항목을 생성하거나 기존 항목을 완전히 대체합니다.
- 동일한 기본 키를 가진 항목이 있으면 덮어씁니다.
- WCU(쓰기 용량 단위)를 소비합니다.



### 2.2 UpdateItem

- 기존 항목의 속성을 편집하거나, 항목이 없으면 새로 생성합니다.
- 원자성 카운터 구현에 사용될 수 있습니다 (조건 없이 숫자 속성 증가).



### 2.3 조건부 쓰기

- 특정 조건이 충족될 때만 쓰기/수정/삭제를 수행합니다.
- 동시 접근 시 데이터 일관성 유지에 도움이 됩니다.
- 성능에 영향을 주지 않습니다.
- 조건부 쓰기는 DynamoDB에서 데이터 무결성을 유지하고 동시성 문제를 해결하는 데 중요한 기능입니다.
- 조건부 쓰기는 다음 작업에서 사용할 수 있습니다:
	- PutItem
	- UpdateItem
	- DeleteItem
	- BatchWriteItem



#### 2.3.1 조건 표현식

- 조건 표현식을 사용하여 어떤 항목을 수정할지 결정할 수 있습니다. 
- 주요 조건 표현식은 다음과 같습니다:
1. `attribute_exists`: 속성이 존재하는지 확인
2. `attribute_not_exists`: 속성이 존재하지 않는지 확인
3. `attribute_type`: 속성의 데이터 타입 확인
4. `contains`: 문자열 포함 여부 확인
5. `begins_with`: 문자열의 시작 부분 확인
6. `IN`: 여러 값 중 하나와 일치하는지 확인
7. `between`: 두 값 사이에 있는지 확인
8. `size`: 문자열 길이 확인



**예시**

```bash
// 특정 속성이 존재할 때만 항목 삭제
aws dynamodb delete-item \
  --table-name ProductCatalog \
  --key '{ "Id": { "N": "456" } }' \
  --condition-expression "attribute_exists(Price)"

// 가격이 특정 범위 내에 있고 제품 카테고리가 특정 값 중 하나일 때만 항목 삭제
aws dynamodb delete-item \ 
  --table-name ProductCatalog \ 
  --key '{ "Id": { "N": "456" } }' \ 
  --condition-expression "(ProductCategory IN (:cat1, :cat2)) and (Price between :lo and :hi)" \ 
  --expression-attribute-values file://values.json


// 문자열이 특정 접두사로 시작할 때만 항목 삭제
aws dynamodb delete-item \
  --table-name ProductCatalog \
  --key '{ "Id": { "N": "456" } }' \
  --condition-expression "begins_with(Pictures.FrontView, :v_sub)" \
  --expression-attribute-values file://values.json
```



#### 2.3.2 주의사항

- 필터 표현식(Filter Expression)은 읽기 쿼리의 결과를 필터링하는 데 사용되는 반면, 조건 표현식(Condition Expression)은 쓰기 작업에 사용됩니다.
- 조건부 쓰기를 사용하면 데이터 일관성을 유지하고 동시성 문제를 해결할 수 있지만, 조건이 충족되지 않으면 작업이 실패할 수 있습니다.
- 복잡한 조건을 사용할 때는 성능에 영향을 줄 수 있으므로 주의가 필요합니다.



## 3 데이터 읽기 작업

### 3.1 GetItem

- 기본 키를 기반으로 항목을 읽습니다.
- 기본 키는 HASH 또는 HASH+RANGE 구조일 수 있습니다.
- 기본적으로 최종적 일관된 읽기를 사용하며, 강력한 일관된 읽기 옵션도 제공합니다.
- ProjectionExpression을 사용해 특정 속성만 검색할 수 있습니다.



### 3.2 Query

- 파티션 키 값(필수)과 정렬 키 값(선택)을 기반으로 항목을 검색합니다.
- **KeyConditionExpression**을 사용하여 파티션 키와 정렬 키에 대한 검색 조건을 지정합니다.
- **FilterExpression**을 사용하여 **KeyConditionExpression**으로 검색된 결과에서 추가적인 속성(애트리뷰트)을 기반으로 필터링이 가능합니다.
	- 이 필터링은 **검색된 결과에서만 적용**되며, **전체 데이터에 대해 읽기 용량(RCU)을 소모**합니다.
	- 애트리뷰트 자체를 기준으로 직접 검색하는 것은 불가능합니다.
- 최대 1MB의 데이터 또는 지정된 제한 수만큼의 항목을 반환합니다.
- 결과에 대한 페이지네이션이 가능합니다.



**Query 작업 과정**

- **KeyConditionExpression**을 사용하여 파티션 키와 정렬 키로 항목을 검색합니다.
	- 이 단계에서 DynamoDB는 파티션 키와 정렬 키에 맞는 항목들을 찾아냅니다.
- **FilterExpression**을 사용하여 검색된 결과를 추가적으로 필터링합니다.
	- 필터링은 **KeyConditionExpression**으로 검색된 항목들 중에서만 적용됩니다.



### 3.3 Scan

- [DynamoDB Scan API 문서](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html)
- Scan 작업은 DynamoDB 테이블 전체를 읽어와 모든 항목을 반환하는 작업입니다.
- 필터 조건이 있는 경우, FilterExpression을 통해 데이터를 필터링합니다.
- 필터링은 서버 측에서 이루어지지만, 모든 항목을 스캔한 후에 필터가 적용됩니다.
- 따라서, 필터링된 결과만 반환되더라도 스캔 과정에서 전체 데이터를 읽어오는 데 소비되는 RCU는 동일합니다.
- 최대 1MB의 데이터를 반환하며, 페이지네이션을 통해 추가 데이터를 읽을 수 있습니다.
- Scan 작업은 많은 RCU를 소비하므로, 가능한 한 Query 작업을 사용하는 것이 효율적입니다.
- 병렬 스캔을 사용하여 성능을 개선할 수 있습니다.



## 4 데이터 삭제 작업

### 4.1 DeleteItem

- 개별 항목을 삭제합니다.
- 조건부 삭제가 가능합니다.



### 4.2 DeleteTable

- 테이블과 모든 항목을 한 번에 삭제합니다.
- 개별 항목 삭제보다 빠릅니다.



## 5 배치 작업

- 여러 작업을 병렬로 처리하여 지연 시간을 줄이고 효율성을 높입니다.
- 일부 작업이 실패할 경우 재시도가 필요합니다.



### 5.1 BatchWriteItem

- 최대 25개의 PutItem 및/또는 DeleteItem 작업을 한 번에 수행합니다.
- 최대 16MB의 데이터 쓰기, 항목당 최대 400KB까지 가능합니다.
- 실패한 작업은 UnprocessedItems로 반환됩니다.



### 5.2 BatchGetItem

- 여러 테이블에서 최대 100개의 항목을 병렬로 검색합니다.
- 최대 16MB의 데이터를 검색할 수 있습니다.
- 실패한 읽기 작업은 UnprocessedKeys로 반환됩니다.



## 6 PartiQL

- DynamoDB용 SQL 호환 쿼리 언어입니다.
- SQL을 사용하여 DynamoDB 데이터를 선택, 삽입, 업데이트, 삭제할 수 있습니다.
- 여러 DynamoDB 테이블에 걸친 쿼리 실행이 가능합니다.
- AWS 관리 콘솔, NoSQL Workbench, DynamoDB API, AWS CLI, AWS SDK 등에서 사용 가능합니다.



## 7 조건부 표현식

- PutItem, UpdateItem, DeleteItem, BatchWriteItem 작업에서 사용 가능합니다.
- 다양한 조건 표현식을 사용하여 수정할 항목을 결정할 수 있습니다.
- 주요 표현식: attribute_exists, attribute_not_exists, attribute_type, contains, begins_with 등
- 필터 표현식은 읽기 쿼리 결과를 필터링하는 반면, 조건 표현식은 쓰기 작업에 사용됩니다.