## 1 MongoDB 스키마 설계란?

- MongoDB는 유연한 스키마를 제공하지만, 이는 스키마 설계가 필요 없다는 의미가 아닙니다.
- 효율적인 스키마 설계는 애플리케이션의 성능과 확장성에 직접적인 영향을 미칩니다.
- 스키마 설계 시에는 데이터 구조, 쿼리 패턴, 성능 요구사항 등을 종합적으로 고려해야 합니다.



## 2 데이터 모델링: 내장 vs 참조

### 2.1 내장 방식 (Embedding)

- 관련 데이터를 단일 문서 내에 저장하는 방식입니다.
- 장점:
	- 단일 쿼리로 모든 관련 데이터 조회 가능
	- 원자적 업데이트 지원
	- 일관성 보장이 쉬움
- 단점:
	- 문서 크기 제한 (16MB)
	- 데이터 중복 가능성
	- 대규모 데이터 업데이트 시 성능 저하



**내장 방식 예시**

```javascript
{
    "_id": ObjectId("..."),
    "orderId": "ORD123",
    "customer": {
        "name": "John Doe",
        "email": "john@example.com",
        "address": {
            "street": "123 Main St",
            "city": "Seoul",
            "country": "Korea"
        }
    },
    "items": [
        {
            "product": "Laptop",
            "price": 1200,
            "quantity": 1
        },
        {
            "product": "Mouse",
            "price": 50,
            "quantity": 2
        }
    ]
}
```



### 2.2 참조 방식 (References)

- 다른 컬렉션의 문서를 참조하는 방식입니다.
- 장점:
	- 데이터 중복 최소화
	- 대규모 데이터 세트 처리 용이
	- 메모리 사용 효율적
- 단점:
	- 여러 쿼리 필요
	- 조인 연산($lookup) 필요
	- 일관성 관리가 복잡



**참조 방식 예시**

```javascript
// orders 컬렉션
{
    "_id": ObjectId("..."),
    "orderId": "ORD123",
    "customerId": ObjectId("customer_id"),
    "items": [
        {
            "productId": ObjectId("product_id1"),
            "quantity": 1
        },
        {
            "productId": ObjectId("product_id2"),
            "quantity": 2
        }
    ]
}

// customers 컬렉션
{
    "_id": ObjectId("customer_id"),
    "name": "John Doe",
    "email": "john@example.com"
}

// products 컬렉션
{
    "_id": ObjectId("product_id1"),
    "name": "Laptop",
    "price": 1200
}
```



### 2.3 카디널리티 고려사항

- 카디널리티는 데이터 관계의 수량적 특성을 나타냅니다:
	- **1:1 관계**: 주로 내장 방식 사용
	- **1:N 관계 (N이 작은 경우)**: 내장 방식 고려
	- **1:N 관계 (N이 큰 경우)**: 참조 방식 사용
	- **N:N 관계**: 일반적으로 참조 방식 사용



**카디널리티 기반 선택 가이드**

```javascript
// 1:1 관계 (내장)
{
    "_id": ObjectId("..."),
    "user": "john_doe",
    "profile": {
        "address": "123 Main St",
        "phone": "123-456-7890"
    }
}

// 1:N 관계 (N이 큰 경우, 참조)
{
    "_id": ObjectId("..."),
    "userId": ObjectId("..."),
    "posts": [ObjectId("post1"), ObjectId("post2")]  // 많은 포스트
}
```



## 3 최적화를 위한 팁

### 3.1 인덱싱 전략

- 쿼리 패턴에 맞는 인덱스 생성
- 복합 인덱스 순서 최적화
- 불필요한 인덱스 제거
- 와일드카드 인덱스 사용 고려



**인덱스 생성 예시**

```javascript
// 단일 필드 인덱스
db.users.createIndex({ "email": 1 });

// 복합 인덱스
db.orders.createIndex({ 
    "status": 1, 
    "orderDate": -1 
});

// 텍스트 검색을 위한 인덱스
db.products.createIndex({ 
    "description": "text" 
});
```



### 3.2 쿼리 최적화

- 필요한 필드만 조회 (Projection)
- 페이지네이션 사용
- 적절한 배치 크기 사용
- 커버링 인덱스 활용



**최적화된 쿼리 예시**

```javascript
// 필요한 필드만 조회
db.users.find(
    { "status": "active" },
    { "name": 1, "email": 1 }
);

// 페이지네이션
db.products.find()
    .skip(20)
    .limit(10)
    .sort({ "created": -1 });
```



## 4 일관성 고려사항

### 4.1 트랜잭션 사용

- 다중 문서 트랜잭션 활용
- 트랜잭션 범위 최소화
- 적절한 write concern 설정

**트랜잭션 예시**
```javascript
const session = client.startSession();
session.startTransaction();

try {
    await orders.updateOne(
        { _id: orderId },
        { $set: { status: "completed" } },
        { session }
    );
    
    await inventory.updateOne(
        { _id: productId },
        { $inc: { stock: -quantity } },
        { session }
    );
    
    await session.commitTransaction();
} catch (error) {
    await session.abortTransaction();
    throw error;
} finally {
    session.endSession();
}
```



### 4.2 데이터 일관성 유지

- 스키마 검증 규칙 설정
- 원자적 업데이트 연산 사용
- 버전 관리 구현

**스키마 검증 예시**
```javascript
db.createCollection("users", {
   validator: {
      $jsonSchema: {
         required: ["name", "email"],
         properties: {
            name: {
               type: "string",
               description: "must be a string and is required"
            },
            email: {
               type: "string",
               pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
               description: "must be a valid email address and is required"
            }
         }
      }
   }
});
```



## 5 스키마 마이그레이션

### 5.1 마이그레이션 전략

- 점진적 마이그레이션 수행
- 백업 및 롤백 계획 수립
- 다운타임 최소화
- 데이터 검증 절차 포함

**마이그레이션 스크립트 예시**
```javascript
// 기존 문서 구조 변경
async function migrateDocuments() {
    const cursor = db.users.find({ schemaVersion: 1 });
    
    while (await cursor.hasNext()) {
        const doc = await cursor.next();
        
        await db.users.updateOne(
            { _id: doc._id },
            {
                $set: {
                    "profile.fullName": `${doc.firstName} ${doc.lastName}`,
                    "schemaVersion": 2
                },
                $unset: {
                    "firstName": "",
                    "lastName": ""
                }
            }
        );
    }
}
```



## 6 스키마 관리 방법

### 6.1 버전 관리

- 스키마 버전 필드 추가
- 문서화 관리
- 변경 이력 추적

**버전 관리 예시**
```javascript
{
    "_id": ObjectId("..."),
    "schemaVersion": 2,
    "data": {
        // 버전 2에 해당하는 데이터 구조
    },
    "lastUpdated": ISODate("2024-03-15")
}
```



### 6.2 문서화

- 스키마 설계 문서 작성
- API 문서와 연계
- 변경 사항 기록



## 7 MongoDB가 적합하지 않은 경우

- 다음과 같은 상황에서는 다른 데이터베이스 사용을 고려해야 합니다:
  - 복잡한 조인이 많은 경우
  - 강력한 ACID 트랜잭션이 필요한 경우
  - 데이터 정규화가 매우 중요한 경우
  - 복잡한 SQL 쿼리가 필요한 경우
  - 레거시 시스템과의 강한 통합이 필요한 경우

### 7.1 대체 고려사항

- 관계형 데이터베이스 (PostgreSQL, MySQL)
- 특화된 데이터베이스 (시계열 DB, 그래프 DB)
- 하이브리드 접근 방식



## 8 결론

- MongoDB 스키마 설계는 비즈니스 요구사항과 기술적 제약을 모두 고려해야 합니다.
- 내장과 참조 방식의 적절한 조합이 중요합니다.
- 성능과 확장성을 위한 최적화는 필수적입니다.
- 일관성과 데이터 무결성을 보장하기 위한 전략이 필요합니다.
- 지속적인 스키마 관리와 개선이 필요합니다.
- 적절한 사용 사례 선정이 프로젝트 성공의 핵심입니다.