## 1 MongoDB 스키마 패턴이란?

- MongoDB는 유연한 스키마를 제공하지만, 효율적인 데이터 모델링을 위해서는 적절한 패턴의 사용이 중요합니다.
- 각 패턴은 특정 사용 사례와 요구사항에 맞춰 선택되어야 합니다.
- 올바른 패턴 선택은 애플리케이션의 성능과 확장성에 직접적인 영향을 미칩니다.



## 2 다형성 패턴 (Polymorphic Pattern)

- 컬렉션 내 모든 도큐먼트가 유사하지만 동일하지 않은 구조를 가질 때 적합합니다.
- 애플리케이션에서 실행되는 공통 쿼리를 지원하는 도큐먼트에서 공통 필드를 식별하는 것이 핵심입니다.
- 클래스/서브클래스와 같은 자식 집합을 식별하는데 도움이 됩니다.

**예시**
```javascript
// 다형성 패턴 예시
{
    "_id": ObjectId("..."),
    "type": "car",
    "brand": "Toyota",
    "model": "Camry",
    "year": 2024
}

{
    "_id": ObjectId("..."),
    "type": "motorcycle",
    "brand": "Honda",
    "engineSize": "1000cc",
    "hasABS": true
}
```



## 3 속성 패턴 (Attribute Pattern)

- 검색하거나 쿼리하려는 공통 특성을 찾는 도큐먼트에 필드의 서브셋이 있는 경우에 적합합니다.
- 데이터를 키/값 쌍의 배열로 재구성하고 배열 요소에 인덱스를 만드는 작업이 포함됩니다.
- 동적인 필드가 많은 경우에 특히 유용합니다.

**예시**
```javascript
// 일반적인 구조
{
    "_id": ObjectId("..."),
    "name": "Product A",
    "price": 100,
    "color": "red",
    "size": "large"
}

// 속성 패턴 적용
{
    "_id": ObjectId("..."),
    "name": "Product A",
    "attributes": [
        {"key": "price", "value": 100},
        {"key": "color", "value": "red"},
        {"key": "size", "value": "large"}
    ]
}
```



## 4 버킷 패턴 (Bucket Pattern)

- 데이터가 일정 기간 동안 스트림으로 유입되는 시계열 데이터에 적합합니다.
- MongoDB에서의 데이터를 특정 시간 범위의 데이터를 각각 보유하는 도큐먼트 셋으로 '버킷화'합니다.
- 예를 들어 1시간 버킷을 사용해 해당 시간 동안의 모든 판독 값을 단일 도큐먼트 내 배열에 배치할 수 있습니다.

**예시**
```javascript
{
    "_id": ObjectId("..."),
    "timeSlot": ISODate("2024-03-15T10:00:00Z"),
    "sensorId": "sensor123",
    "readings": [
        {"time": ISODate("2024-03-15T10:05:00Z"), "value": 22.5},
        {"time": ISODate("2024-03-15T10:10:00Z"), "value": 23.1},
        {"time": ISODate("2024-03-15T10:15:00Z"), "value": 22.8}
    ]
}
```



## 5 계산된 패턴 (Computed Pattern)

- 데이터를 자주 계산해야 할 때나 데이터 접근 패턴이 읽기 집약적인 경우에 사용합니다.
- 주요 도큐먼트가 수정되는 백그라운드에서 계산을 수행하도록 관리합니다.
- 미리 계산된 필드 및 도큐먼트의 유효한 근사치를 제공합니다.

**예시**
```javascript
{
    "_id": ObjectId("..."),
    "productId": "prod123",
    "price": 100,
    "quantity": 50,
    "totalValue": 5000,  // 미리 계산된 값
    "lastCalculated": ISODate("2024-03-15T10:00:00Z")
}
```



## 6 서브셋 패턴 (Subset Pattern)

- 자주 사용하는 데이터와 자주 사용하지 않는 데이터를 두 개의 개별 컬렉션으로 분할하도록 합니다.
- 예를 들어 사용자의 상세 정보와 기본 정보를 분리하여 저장할 수 있습니다.
- 자주 액세스하는 데이터를 작게 유지하여 성능을 최적화할 수 있습니다.

**예시**
```javascript
// users 컬렉션 (자주 사용되는 데이터)
{
    "_id": ObjectId("..."),
    "username": "john_doe",
    "email": "john@example.com",
    "lastLogin": ISODate("2024-03-15T10:00:00Z")
}

// user_details 컬렉션 (덜 사용되는 데이터)
{
    "_id": ObjectId("..."),
    "userId": ObjectId("..."),
    "address": "123 Main St",
    "phoneNumber": "123-456-7890",
    "preferences": {
        "newsletter": true,
        "notifications": false
    }
}
```



## 7 확장된 참조 패턴 (Extended Reference Pattern)

- 다른 컬렉션의 데이터를 자주 조회해야 할 때 사용하는 패턴입니다.
- 자주 사용되는 필드들을 복제하여 조인 연산을 줄이는 것이 핵심입니다.
- 데이터 중복을 허용하는 대신 조회 성능을 향상시킵니다.
- 패턴 사용이 필요한 상황
	- 다른 컬렉션의 데이터를 매번 조회하는 경우
	- 조인 연산이 성능에 병목이 되는 경우
	- 참조되는 데이터가 자주 변경되지 않는 경우
	- 실시간 데이터 일관성이 최우선이 아닌 경우



**예시**

```javascript
// orders 컬렉션
{
    "_id": ObjectId("..."),
    "orderDate": ISODate("2024-03-15"),
    // 자주 사용되는 고객 정보 포함
    "customer": {
        "_id": ObjectId("..."),
        "name": "John Doe",
        "email": "john@example.com"
    },
    "items": [
        {
            "productId": ObjectId("..."),
            "name": "Product A",  // 자주 사용되는 제품 정보
            "price": 99.99,
            "quantity": 2
        }
    ]
}
```



## 8 트리 패턴 (Tree Pattern)

- 계층적 데이터가 있을 때 적합합니다.
- MongoDB에는 동일한 도큐먼트 내 배열에 계층구조를 쉽게 저장할 수 있습니다.
- 예를 들어 조직도나 카테고리 구조와 같은 계층적 데이터를 저장할 때 유용합니다.

**예시**
```javascript
// 배열 기반 트리 구조
{
    "_id": ObjectId("..."),
    "name": "Electronics",
    "path": ["Electronics"],
    "parent": null
}

{
    "_id": ObjectId("..."),
    "name": "Smartphones",
    "path": ["Electronics", "Smartphones"],
    "parent": "Electronics"
}
```



## 9 결론

- MongoDB 스키마 패턴은 각각의 장단점이 있으며, 사용 사례에 따라 적절한 패턴을 선택해야 합니다.
- 여러 패턴을 조합하여 사용할 수도 있으며, 이는 애플리케이션의 요구사항에 따라 결정됩니다.
- 성능, 확장성, 유지보수성을 모두 고려하여 패턴을 선택해야 합니다.
- 패턴 선택 시 데이터의 성장 가능성과 쿼리 패턴도 함께 고려해야 합니다.