---
title: "Redis Data Type"
description: "Redis의 다양한 데이터 타입을 상세히 알아봅니다. String, List, Set, Hash, Sorted Set 등 핵심 데이터 타입의 특징과 활용 사례, 주요 명령어를 실제 예제와 함께 자세히 설명합니다. 캐싱, 큐잉, 세션 관리 등 실전 활용을 위한 완벽 가이드입니다."
tags: [ "REDIS", "DATABASE", "CACHING", "BACKEND", "SYSTEM_DESIGN" ]
keywords: [ "레디스", "Redis", "데이터타입", "Data Types", "캐시", "Cache", "인메모리", "In-memory", "데이터베이스", "Database", "문자열", "String", "리스트", "List", "셋", "Set", "정렬셋", "Sorted Set", "해시", "Hash" ]
draft: false
hide_title: true
---

## 1. Redis 데이터 타입 개요

- Redis는 강력한 인메모리 데이터 구조 서버로, 다양한 데이터 타입을 기본적으로 지원합니다. 
- 각 데이터 타입은 특정 사용 사례에 최적화되어 있어, 개발자가 상황에 맞는 가장 효율적인 데이터 구조를 선택할 수 있습니다.
- [레퍼런스](https://redis.io/docs/latest/develop/data-types/)

### 1.1 Redis Community Edition 지원 데이터 타입

Redis Community Edition에서 기본적으로 제공하는 데이터 타입들은 다음과 같습니다:

- String: 가장 기본적인 데이터 타입으로, 바이트 시퀀스를 저장
- List: 삽입 순서가 유지되는 문자열 컬렉션
- Set: 순서가 없는 유니크한 문자열 집합
- Hash: 필드-값 쌍을 저장하는 레코드 타입
- Sorted Set: 점수에 따라 정렬되는 유니크한 문자열 집합
- Stream: 로그와 같은 추가 전용 데이터 구조
- Bitmap: 비트 단위 연산을 지원하는 문자열 특수 타입
- Bitfield: 문자열 내에서 여러 카운터를 효율적으로 인코딩
- Geospatial: 위치 기반 데이터를 저장하고 처리

:::info
Redis Enterprise와 Redis Stack에서는 JSON, 확률적 데이터 타입, 시계열 데이터 등 추가적인 데이터 타입을 제공합니다.
:::

## 2. Redis 키 설계 원칙

- Redis에서 키는 바이너리 세이프하며, 모든 바이너리 시퀀스를 키로 사용할 수 있습니다. 
- 하지만 효율적인 키 설계를 위해 다음 원칙들을 고려해야 합니다.

### 2.1 키 설계 가이드라인

- **키 길이 최적화**
	- 너무 긴 키는 메모리 사용량 증가
	- 키 검색 시 비교 연산 비용 증가
	- 최대 키 크기는 512MB이지만, 간결한 키 사용 권장
- **가독성 있는 네이밍**
	- 좋은 예: `user:1000:followers`
	- 피해야 할 예: `u1000flw`
	- 약간의 메모리 오버헤드는 가독성과 유지보수성으로 상쇄
- **일관된 네이밍 스키마**
	- 권장 포맷: `object-type:id:field`
	- 멀티 워드 구분자: `.` 또는 `-` 사용
	- 예시: `comment:1234:reply.to` 또는 `user:1000:profile-image`

## 3. String Type

문자열은 Redis의 가장 기본적인 데이터 타입으로, 텍스트뿐만 아니라 정수, 부동 소수점 등 다양한 데이터를 저장할 수 있습니다.

### 3.1 String 타입의 특징

- 바이너리 세이프한 데이터 저장 가능
- 최대 512MB까지 저장 가능
- 전체 문자열 조작 또는 부분 수정 가능
- 숫자의 경우 원자적 증감 연산 지원

### 3.2 주요 String 명령어

#### SET

문자열 값을 키에 저장합니다.

```bash
SET key value [EX seconds] [PX milliseconds] [NX|XX]
```

```bash
redis> SET mykey "Hello"
"OK"
redis> SET counter 100
"OK"
```

#### GET

저장된 문자열 값을 조회합니다.

```bash
GET key
```

```bash
redis> GET mykey
"Hello"
redis> GET nonexisting
(nil)
```

#### APPEND

기존 문자열에 새로운 값을 붙입니다.

```bash
APPEND key value
```

```bash
redis> SET greeting "Hello"
"OK"
redis> APPEND greeting " World"
(integer) 11
redis> GET greeting
"Hello World"
```

## 4. List Type

List는 문자열 요소들의 순서가 있는 컬렉션으로, 양방향 연결 리스트로 구현되어 있습니다.

### 4.1 List 타입의 특징

- 삽입 순서 유지
- 양방향 요소 추가/제거 가능
- 인덱스 기반 접근 지원
- 스택이나 큐로 활용 가능

### 4.2 주요 List 명령어

#### LPUSH/RPUSH

리스트의 왼쪽/오른쪽에 요소를 추가합니다.

```bash
LPUSH key value [value ...]
RPUSH key value [value ...]
```

```bash
redis> LPUSH mylist "world"
(integer) 1
redis> LPUSH mylist "hello"
(integer) 2
redis> LRANGE mylist 0 -1
1) "hello"
2) "world"
```

#### LPOP/RPOP

리스트의 왼쪽/오른쪽에서 요소를 제거하고 반환합니다.

```bash
LPOP key
RPOP key
```

```bash
redis> RPUSH tasks "task1" "task2" "task3"
(integer) 3
redis> LPOP tasks
"task1"
```

## 5. Set Type

Set은 순서가 없는 유니크한 문자열의 집합으로, 멤버십 테스트와 집합 연산에 최적화되어 있습니다.

### 5.1 Set 타입의 특징

- 중복 요소 불허
- O(1) 시간 복잡도의 멤버십 테스트
- 집합 연산(교집합, 합집합, 차집합) 지원
- 요소 순서 보장하지 않음

### 5.2 주요 Set 명령어

#### SADD

Set에 하나 이상의 멤버를 추가합니다.

```bash
SADD key member [member ...]
```

```bash
redis> SADD myset "apple" "banana" "cherry"
(integer) 3
redis> SADD myset "apple"
(integer) 0  # 이미 존재하는 요소는 추가되지 않음
```

#### SMEMBERS

Set의 모든 멤버를 반환합니다.

```bash
SMEMBERS key
```

```bash
redis> SMEMBERS myset
1) "cherry"
2) "banana"
3) "apple"
```

## 6. Sorted Set Type

- Sorted Set은 Set의 특성에 점수 기반 정렬 기능을 추가한 데이터 타입입니다.

### 6.1 Sorted Set의 특징

- 각 멤버는 연관된 점수(score)를 가짐
- 점수 기반으로 자동 정렬
  - 같은 점수의 경우 사전순으로 정렬
- 범위 검색과 순위 계산에 최적화
- 중복 멤버 불허

### 6.2 주요 Sorted Set 명령어

#### ZADD

점수와 함께 멤버를 추가합니다.

```bash
ZADD key score member [score member ...]
```

```bash
redis> ZADD leaderboard 100 "user1" 200 "user2" 150 "user3"
(integer) 3
```

#### ZRANGE

점수 순으로 멤버를 조회합니다.

```bash
ZRANGE key start stop [WITHSCORES]
```

```bash
redis> ZRANGE leaderboard 0 -1 WITHSCORES
1) "user1"
2) "100"
3) "user3"
4) "150"
5) "user2"
6) "200"
```

## 7. Hash Type

Hash는 필드-값 쌍을 저장하는 레코드 타입으로, 객체를 표현하는데 적합합니다.

### 7.1 Hash의 특징

- 하나의 키 아래 여러 필드-값 쌍 저장
- 각 필드는 유니크
- 객체의 부분 업데이트 가능
- 메모리 효율적인 객체 저장

### 7.2 주요 Hash 명령어

#### HSET

하나 이상의 필드-값 쌍을 설정합니다.

```bash
HSET key field value [field value ...]
```

```bash
redis> HSET user:1000 username "john" email "john@example.com" age 30
(integer) 3
```

#### HGET

특정 필드의 값을 조회합니다.

```bash
HGET key field
```

```bash
redis> HGET user:1000 username
"john"
```

## 8. 데이터 타입 선택 가이드

각 사용 사례에 맞는 최적의 데이터 타입 선택을 위한 가이드입니다.

### 8.1 String 사용 시나리오

- 단순 키-값 캐싱
- 카운터 구현
- 세션 토큰 저장

### 8.2 List 사용 시나리오

- 작업 큐 구현
- 최근 활동 이력 관리
- 타임라인 구현

### 8.3 Set 사용 시나리오

- 유니크 태그 관리
- 친구 관계 관리
- 투표 시스템 구현

### 8.4 Sorted Set 사용 시나리오

- 랭킹 시스템
- 우선순위 큐
- 실시간 리더보드

### 8.5 Hash 사용 시나리오

- 사용자 프로필 저장
- 상품 정보 관리
- 세션 데이터 저장

:::tip 성능 최적화 팁
각 데이터 타입은 특정 작업에 최적화되어 있습니다. 예를 들어, 정렬이 필요한 경우 List를 사용하여 직접 정렬하는 것보다 Sorted Set을 사용하는 것이 더 효율적입니다.
:::