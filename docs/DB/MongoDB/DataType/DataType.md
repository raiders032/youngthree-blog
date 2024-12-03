---
title: "MongoDB 데이터 타입"
description: "MongoDB 데이터 타입 완벽 가이드: MongoDB에서 사용할 수 있는 모든 데이터 타입을 상세히 알아봅니다. 각 데이터 타입의 특징과 사용 사례, 제한사항을 실제 예제와 함께 설명합니다."
tags: ["MONGODB", "DATABASE", "NOSQL", "BACKEND"]
keywords: ["몽고디비", "mongodb", "데이터타입", "data types", "도큐먼트", "document", "BSON", "binary JSON", "NoSQL", "디비", "데이터베이스"]
draft: false
hide_title: true
---

## 1. MongoDB 데이터 타입 개요

- MongoDB는 BSON(Binary JSON) 형식을 사용하여 데이터를 저장합니다. 
- BSON은 JSON의 확장된 형태로, 더 많은 데이터 타입을 지원합니다.
- 기존 JSON의 한계점
  - 날짜형이 없다.
  - 함수나 정규 표현식을 표현할 수 없다.

## 2. 기본 데이터 타입

### 2.1 문자열 (String)
- UTF-8 인코딩을 사용하는 텍스트 데이터
- 최대 크기: 16MB

```javascript
{
  name: "John Doe",
  email: "john@example.com"
}
```

### 2.2 숫자 (Number)
- Integer (32bit, 64bit)
- Double (64bit)
- Decimal128 (128bit)

```javascript
{
  age: 25,                    // Integer
  price: 99.99,              // Double
  balance: NumberDecimal("1000.55")  // Decimal128
}
```

### 2.3 불리언 (Boolean)
- true 또는 false 값

```javascript
{
  isActive: true,
  isDeleted: false
}
```

### 2.4 날짜 (Date)
- UNIX 시간으로부터의 밀리초 단위
  - 1970년 1월 1일 부터의 시간을 밀리초로 표현
- 내부적으로 64bit 정수로 저장


```javascript
{
  createdAt: new Date(),
  lastLogin: ISODate("2024-03-15T09:00:00Z")
}
```

## 3. 복합 데이터 타입

### 3.1 객체 (Object)
- 중첩된 필드를 포함하는 도큐먼트
- 도큐먼트는 부모 도큐먼트의 값으로 포함될 수 있음

```javascript
{
  address: {
    street: "123 Main St",
    city: "Seoul",
    country: "South Korea"
  }
}
```

### 3.2 배열 (Array)
- 값의 Set 또는 List를 배열로 표현할 수 있다.
- 여러 값을 순서대로 저장
- 다양한 타입의 요소 포함 가능

```javascript
{
  tags: ["mongodb", "database", "nosql"],
  scores: [85, 92, 78],
  mixed: ["string", 42, { key: "value" }]
}
```

## 4. 특수 데이터 타입

### 4.1 ObjectId
- ObjectId는 도큐먼트를 식별하는 고유한 값으로 12바이트 길이의 16진수 문자열입니다.
- 자동 생성되는 고유한 문서 ID

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011")
}
```

### 4.2 Null
- null 값 표현
- 필드의 부재를 나타냄

```javascript
{
  middleName: null
}
```

### 4.3 Binary Data
- 이미지, 파일 등의 바이너리 데이터
- 최대 16MB

```javascript
{
  profileImage: BinData(0, "base64EncodedData")
}
```

### 4.4 정규식 (Regular Expression)
- 패턴 매칭을 위한 정규표현식

```javascript
{
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
}
```

## 5. 고급 데이터 타입

### 5.1 Timestamp
- 내부 MongoDB 작업을 위한 특수 타입
- 복제 작업 추적에 사용

```javascript
{
  lastModified: Timestamp(1624984548, 1)
}
```

### 5.2 MinKey/MaxKey
- 모든 BSON 요소와의 비교에서 최소/최대값

```javascript
{
  score: MinKey(),
  highScore: MaxKey()
}
```

## 6. 데이터 타입 사용 시 주의사항

### 6.1 크기 제한
- 단일 도큐먼트 최대 크기: 16MB
- 큰 파일은 GridFS 사용 권장

:::warning
16MB를 초과하는 데이터는 저장할 수 없으며, 초과 시 에러가 발생합니다.
:::

### 6.2 타입 변환
- 자동 타입 변환을 피하고 명시적 변환 권장
- 쿼리 시 타입 일치 확인 필요

:::tip
스키마 검증을 사용하여 데이터 타입 일관성 유지를 권장합니다.
```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "age"],
      properties: {
        name: { bsonType: "string" },
        age: { bsonType: "int" }
      }
    }
  }
})
```
:::

## 7. 데이터 타입 선택 가이드

### 7.1 숫자 타입 선택
- 정수: Int32 또는 Int64
- 금액: Decimal128 (정확한 소수점 계산)
- 일반 실수: Double

### 7.2 날짜/시간 처리
- 날짜만: ISODate
- 타임스탬프: Timestamp
- 시간대 고려: Date + 시간대 정보 별도 저장

## 8. 마치며

MongoDB의 다양한 데이터 타입을 적절히 활용하면 효율적인 데이터 모델링이 가능합니다. 각 타입의 특성과 제한사항을 이해하고 사용하는 것이 중요합니다.