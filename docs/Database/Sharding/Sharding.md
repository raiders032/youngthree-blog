---
title: "Sharding"
description: "대규모 데이터베이스 확장을 위한 샤딩(Sharding)의 개념부터 실제 구현까지 상세히 알아봅니다. 모듈러 샤딩과 레인지 샤딩의 차이점, ACID 특성 보장의 어려움, 그리고 실제 구현 시 고려해야 할 기술적 한계점을 다룹니다."
tags: ["DATABASE", "BACKEND", "SYSTEM_DESIGN"]
keywords: ["데이터베이스 샤딩", "database sharding", "샤딩", "sharding", "DB 샤딩", "DB분할", "데이터베이스 분할", "수평분할", "horizontal partitioning", "모듈러 샤딩", "레인지 샤딩", "DB 스케일링", "database scaling", "분산 데이터베이스", "distributed database"]
draft: false
hide_title: true
---

## 1 Sharding 개요

- 샤딩은 대규모 데이터베이스를 샤드(shard)라는 작은 단위로 분할하는 기술입니다.
- 모든 샤드는 같은 스키마를 사용하지만 샤드에 보관된 데이터 사이에는 중복이 없습니다.
- 각 샤드는 독립적으로 동작하는 데이터베이스로, 전체 데이터의 부분집합을 저장합니다.

### 1.1 데이터베이스 확장

- 데이터베이스의 규모를 확장하는 데는 두 가지 접근법이 있습니다:
	- Scale Up(수직적 확장):
		- 더 강력한 하드웨어로 업그레이드
		- CPU, 메모리, 스토리지 증설
		- 비용이 기하급수적으로 증가
	- Scale Out(수평적 확장):
		- 더 많은 서버를 추가
		- 데이터를 여러 서버에 분산
		- 상대적으로 비용 효율적
- Scale Up의 한계:
	- 하드웨어 증설만으로는 감당할 수 없는 데이터 규모
	- 단일 서버의 물리적 한계 존재
	- 비용 대비 효율성 감소
- 분산 데이터베이스의 제약:
	- Cassandra, Dynamo 등은 처음부터 분산 환경을 고려하여 설계
	- 하지만 범위 검색이나 JOIN 연산에 제약이 많음
	- ACID 특성을 완벽히 보장하기 어려움

### 1.2 수평 분할

- 수평 분할(Horizontal Partitioning)의 특징:
	- 동일한 스키마를 가진 데이터를 여러 테이블로 분할
	- 각 분할은 전체 데이터의 부분집합을 포함
	- 데이터는 특정 기준에 따라 분할됨
- 수평 분할의 목적:
	- 인덱스 크기 감소
	- 작업 동시성 향상
	- 데이터 접근 성능 개선
	- 관리의 용이성

## 2 Sharding 방식

### 2.1 Modular sharding

- 모듈러 샤딩의 작동 방식:
	- PK를 모듈러(나머지) 연산한 결과로 DB를 결정
	- 예: user_id % 4로 4개의 샤드에 분배
- 장점:
	- 데이터가 균일하게 분산됨
	- 부하가 고르게 분배됨
	- 예측 가능한 데이터 분포
- 단점:
	- DB 증설 시 데이터 재정렬 필요
	- 재정렬 과정에서 서비스 영향 가능성
- 적합한 사용 사례:
	- 데이터 증가율이 예측 가능한 경우
	- 데이터 크기가 일정 수준에서 유지되는 경우
	- 균일한 부하 분산이 중요한 경우

### 2.2 Range sharding

- 레인지 샤딩의 작동 방식:
	- PK의 범위를 기준으로 DB를 결정
	- 예: user_id 1-1000000은 DB1, 1000001-2000000은 DB2
- 장점:
	- DB 증설 시 재정렬 비용이 적음
	- 범위 기반 쿼리 성능이 좋음
	- 데이터 지역성(Locality) 활용 가능
- 단점:
	- 특정 DB에 데이터가 몰릴 수 있음
	- 불균형한 부하 발생 가능성
	- 핫스팟(Hot Spot) 발생 위험
- 적합한 사용 사례:
	- 데이터가 급격히 증가하는 경우
	- 범위 기반 쿼리가 많은 경우
	- 시계열 데이터 처리

## 3 근본적 한계1 : Resharding

- Resharding이 필요한 상황:
	- 데이터 증가로 추가 샤드 필요
	- 특정 샤드의 빠른 공간 소진
	- 불균형한 데이터 분포 발생
- Resharding의 어려움:
	- 샤드 키 재계산 필요
	- 데이터 재배치 작업 필요
	- 서비스 영향 최소화 고려

## 4 근본적 한계2: Celebrity Problem

- 문제 발생 원인:
	- 특정 샤드에 인기 데이터 집중
	- 불균형한 접근 패턴
	- 데이터 분포의 왜곡
- 영향과 해결 방안:
	- 특정 샤드 서버 과부하
	- 캐싱 계층 도입
	- 인기 데이터 특별 처리

## 5 근본적 한계3: ACID 보장의 어려움

### 5.1 원자성(Atomicity) 문제

- 원자성이란 트랜잭션의 작업이 모두 성공하거나 모두 실패해야 하는 특성입니다.
- 샤딩 환경에서는 여러 샤드에 걸친 트랜잭션의 원자성 보장이 어렵습니다.

**계좌 이체 예시**

```sql
-- 샤드 1의 데이터베이스
UPDATE accounts
SET balance = balance - 1000
WHERE account_id = 'A123';
-- 출금 계좌

-- 샤드 2의 데이터베이스
UPDATE accounts
SET balance = balance + 1000
WHERE account_id = 'B456'; -- 입금 계좌
```

- 문제 상황:
	- 네트워크 장애로 한 쪽 샤드만 업데이트될 수 있음
	- 두 작업 중 하나라도 실패하면 모두 롤백되어야 함
	- 분산 환경에서는 롤백 처리와 상태 관리가 복잡함
- 이러한 문제를 해결하기 위해 2단계 커밋이나 사가(Saga) 패턴 같은 분산 트랜잭션 처리 방식이 필요합니다.

**해결책**

```plaintext
1단계 (준비 단계)
- 코디네이터: "트랜잭션 준비하세요"
- 샤드 1: "출금 준비 완료"
- 샤드 2: "입금 준비 완료"

2단계 (커밋 단계)
- 코디네이터: "모두 준비되었으니 커밋하세요"
- 샤드 1: "출금 커밋 완료"
- 샤드 2: "입금 커밋 완료"
```

- 해결을 위한 2단계 커밋(Two-Phase Commit) 예시

### 5.2 일관성(Consistency) 문제

- 일관성이란 데이터베이스가 항상 정해진 규칙을 만족해야 하는 특성입니다.

**예시**

```sql
-- 전체 사용자의 포인트 합계가 항상 일정해야 하는 경우 

-- 샤드 1의 포인트 합계 
SELECT SUM(points)
FROM users;
-- 결과: 50000

-- 샤드 2의 포인트 합계 
SELECT SUM(points)
FROM users;
-- 결과: 30000 

-- 전체 합계: 80000 (항상 일정해야 함)
```

- 문제 상황:
	- 샤드 간 데이터 이동 시 일시적인 불일치 발생 가능
	- 여러 샤드의 데이터를 집계할 때 시점 불일치 발생
	- 비즈니스 규칙(예: 전체 포인트 합계는 변하지 않아야 함)을 보장하기 어려움

### 5.3 격리성(Isolation) 문제

- 격리성이란 동시에 실행되는 트랜잭션들이 서로 영향을 주지 않아야 하는 특성입니다.

**글로벌 순위 시스템 예시**

```sql
-- 여러 샤드에 분산된 게임 점수를 실시간 순위로 집계 
SELECT user_id, score
FROM game_scores
ORDER BY score
        DESC LIMIT 10;
```

- 문제 상황:
	- 각 샤드의 데이터 갱신 시점이 달라 정확한 순위 산정이 어려움
	- 샤드 간의 데이터 정렬과 집계에서 시간 차이 발생
	- 글로벌 락(Lock)을 사용할 경우 성능이 크게 저하됨

### 5.4 지속성(Durability) 문제

- 지속성이란 커밋된 트랜잭션의 결과가 영구적으로 보존되어야 하는 특성입니다.

**데이터 복제 예시**

```plaintext
샤드 1 (Primary)
  ├── 복제본 A (Sync)
  └── 복제본 B (Async)

샤드 2 (Primary)
  ├── 복제본 C (Sync)
  └── 복제본 D (Async)
```

- 문제 상황:
	- 각 샤드의 복제본 간 동기화 지연 발생
	- 일부 복제본 서버 장애 시 복구 절차 복잡
	- 데이터 센터 간 복제 시 네트워크 지연 문제

## 6 근본적 한계 4: 조인 연산의 한계

**복잡한 조인 연산의 한계**

- 샤딩된 데이터베이스에서 여러 샤드에 걸친 데이터를 조인하고 집계하는 작업은 상당한 도전 과제입니다.
- 아래 예시를 통해 이러한 한계를 살펴보겠습니다.

**지역별 주문 데이터 조회 예시**

```sql
-- 샤드가 지역별로 나뉘어 있을 때:
-- 샤드 1 (서울 지역 DB)
SELECT customer_id, SUM(amount) as total_amount
FROM orders
GROUP BY customer_id;

-- 샤드 2 (부산 지역 DB)
SELECT customer_id, SUM(amount) as total_amount
FROM orders
GROUP BY customer_id;

-- 아래와 같은 전체 지역 통합 쿼리는 불가능:
SELECT c.customer_name, SUM(o.amount) as total_amount
FROM customers c
         JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name
ORDER BY total_amount DESC LIMIT 10;

```

- 서로 다른 데이터베이스 간의 직접적인 SQL JOIN이 불가능
	- 서울 DB의 orders 테이블과 부산 DB의 orders 테이블은 물리적으로 분리되어 있음
	- 하나의 SQL 문으로 두 DB를 동시에 조회할 수 없음

**분산 환경에서의 데이터 처리 방식**

여러 샤드의 데이터를 조합해야 하는 경우, 다음과 같은 단계로 처리해야 합니다:

1. 각 지역 샤드에서 데이터 조회
2. 애플리케이션에서 데이터 병합
3. 결과 필터링 및 정렬

```python
def get_top_customers():
    # 각 지역 샤드에서 주문 데이터 조회
    seoul_orders = shard1.execute("""
        SELECT customer_id, SUM(amount) as total
        FROM orders 
        GROUP BY customer_id
    """)
    
    busan_orders = shard2.execute("""
        SELECT customer_id, SUM(amount) as total
        FROM orders 
        GROUP BY customer_id
    """)
    
    # 전체 고객 정보 조회
    customers = customer_db.execute("""
        SELECT customer_id, customer_name
        FROM customers
    """)
    
    # 데이터 병합 및 집계
    customer_totals = {}
    for order in seoul_orders + busan_orders:
        cid = order['customer_id']
        if cid in customer_totals:
            customer_totals[cid] += order['total']
        else:
            customer_totals[cid] = order['total']
    
    # 결과 생성 및 정렬
    results = []
    for customer in customers:
        cid = customer['customer_id']
        if cid in customer_totals:
            results.append({
                'name': customer['customer_name'],
                'total_amount': customer_totals[cid]
            })
    
    return sorted(results, 
                 key=lambda x: x['total_amount'], 
                 reverse=True)[:10]
```

**성능 저하 요인**

1. 여러 샤드와의 통신 오버헤드
	- 각 샤드에 쿼리를 보내고 결과를 받는 네트워크 지연 발생
	- 동시에 여러 샤드와 통신해야 하는 복잡성
1. 대량 데이터 전송 비용
	- 각 샤드에서 많은 양의 데이터를 가져와야 함
	- 네트워크 대역폭 사용량 증가
1. 메모리 상에서의 데이터 처리
	- 애플리케이션에서 대량의 데이터를 병합하고 처리
	- 메모리 사용량 증가
	- 복잡한 집계 연산 필요

## 7 근본적 한계5: 비용 문제

### 7.1 라이센스 비용 예시

- Oracle Enterprise Edition 기준:
	- 단일 서버: 프로세서 당 $47,500/년
	- 4대의 샤드 서버: $47,500 x 4 = $190,000/년
	- 각 샤드의 고가용성을 위한 복제본 추가 시 비용 2배

### 7.2 운영 비용 예시

- 인프라 비용:
	- 각 샤드 서버의 하드웨어 비용
	- 네트워크 비용
	- 모니터링 시스템 비용
- 인적 자원 비용:
	- DBA 인건비 증가
	- 개발자 추가 투입
	- 24/7 운영 지원 인력
- 관리 도구 비용:
	- 샤드 관리 도구
	- 모니터링 도구
	- 백업/복구 도구

## 8 결론

- 샤딩은 데이터베이스 확장을 위한 중요한 기술이지만 신중한 설계가 필요합니다.
- 특히 RDBMS의 샤딩은 ACID 특성 보장과 관련된 여러 기술적 어려움이 있습니다.
- 샤딩 도입 시 비즈니스 요구사항과 기술적 제약사항을 충분히 고려해야 합니다.
- 경우에 따라 NoSQL이나 NewSQL 등 대안 검토도 필요할 수 있습니다.