---
title: "Composite Index"
description: "MySQL 데이터베이스에서 복합 인덱스의 개념부터 활용까지 상세히 알아봅니다. 복합 인덱스의 작동 원리, 좌측 접두사 규칙, 실제 쿼리 예제와 함께 성능 최적화 방법을 설명합니다. 데이터베이스 성능 향상을 위한 실용적인 가이드입니다."
tags: [ "MYSQL", "DATABASE", "PERFORMANCE", "SQL", "BACKEND" ]
keywords: [ "복합 인덱스", "composite index", "다중 컬럼 인덱스", "multiple-column indexes", "MySQL 인덱스", "MySQL index", "인덱스 최적화", "index optimization", "좌측 접두사", "leftmost prefix", "데이터베이스 성능", "database performance", "인덱스 설계", "index design", "쿼리 최적화", "query optimization" ]
draft: false
hide_title: true
---

## 1. 복합 인덱스(Composite Index)란?

- 복합 인덱스는 두 개 이상의 컬럼을 결합하여 생성한 인덱스입니다.
- MySQL에서는 최대 16개의 컬럼을 하나의 인덱스로 결합할 수 있습니다.
- 단일 복합 인덱스로 여러 유형의 쿼리 성능을 향상시킬 수 있습니다.
- 인덱스에 포함된 컬럼들의 순서가 쿼리 성능에 중요한 영향을 미칩니다.

## 2. 복합 인덱스의 작동 원리

- 복합 인덱스는 지정된 컬럼들의 값을 연결하여 정렬된 데이터 구조를 생성합니다.
- MySQL은 이 정렬된 구조를 활용하여 쿼리를 더 빠르게 실행합니다.
- 복합 인덱스는 다음 경우에 활용됩니다:
	- 인덱스의 모든 컬럼을 테스트하는 쿼리
	- 첫 번째 컬럼만 테스트하는 쿼리
	- 첫 번째와 두 번째 컬럼을 테스트하는 쿼리
	- 인덱스의 좌측부터 연속된 컬럼들을 테스트하는 쿼리

### 2.1 복합 인덱스의 내부 구조

- 복합 인덱스는 B-트리 구조로 구현되어 있습니다.
- 인덱스 노드는 복합 키(여러 컬럼 값의 조합)를 기준으로 정렬됩니다.
- 이 구조는 범위 검색과 정확한 일치 검색 모두에 효율적입니다.

:::tip
복합 인덱스의 컬럼 순서는 성능에 큰 영향을 미칩니다. 일반적으로 선택성(selectivity)이 높은 컬럼(고유한 값이 많은 컬럼)을 인덱스의 앞쪽에 배치하는 것이 좋습니다.
[Selectivity Cardinality 참고](../Selectivity-Cardinality/Selectivity-Cardinality.md)
:::

## 3. 복합 인덱스 사용 규칙

### 3.1 좌측 접두사 규칙(Leftmost Prefix Rule)

- 복합 인덱스의 가장 중요한 특성은 **좌측 접두사 규칙**입니다.
- MySQL은 인덱스의 왼쪽부터 시작하는 컬럼들만 사용할 수 있으며, 중간 컬럼을 건너뛸 수 없습니다.
- 예를 들어, `(col1, col2, col3)` 인덱스가 있다면:
	- `col1`만 조건으로 사용하는 쿼리에 활용 가능
	- `col1, col2`를 조건으로 사용하는 쿼리에 활용 가능
	- `col1, col2, col3` 모두를 조건으로 사용하는 쿼리에 활용 가능
	- `col2`만 또는 `col2, col3`만 조건으로 사용하는 쿼리에는 활용 불가

:::warning
복합 인덱스에서 첫 번째 컬럼(좌측 컬럼)을 조건에 포함하지 않으면 해당 인덱스는 사용되지 않습니다. 이 규칙을 이해하는 것이 복합 인덱스 설계의 핵심입니다.
:::

#### 좌측 접두사 예시

- `(last_name, first_name)`으로 구성된 복합 인덱스가 있을 때:
	- `WHERE last_name = 'Kim'` → 인덱스 사용 가능
	- `WHERE last_name = 'Kim' AND first_name = 'Minho'` → 인덱스 사용 가능
	- `WHERE first_name = 'Minho'` → 인덱스 사용 불가

### 3.2 첫 번째 범위 조건 이후 규칙

- MySQL은 복합 인덱스에서 첫 번째 범위 조건(`>`, `<`, `BETWEEN` 등) 이후의 컬럼은 인덱스 스캔에 활용하지 않습니다.
- 범위 조건은 다음 컬럼의 정렬 순서를 깨뜨리기 때문입니다.
- 예를 들어, `(first_name, last_name, birthday)` 인덱스가 있을 때:
	- `WHERE first_name = 'Aaron' AND last_name = 'Francis' AND birthday = '1989-02-14'` → 모든 컬럼 인덱스 사용
	- `WHERE first_name = 'Aaron' AND last_name < 'Francis' AND birthday = '1989-02-14'` → `first_name`과 `last_name`만 인덱스
	  사용, `birthday`는 인덱스 사용 불가

:::info
이 두 가지 규칙(좌측 접두사 규칙과 첫 번째 범위 조건 이후 규칙)이 복합 인덱스 사용의 핵심입니다. 이를 이해하면 복합 인덱스를 효과적으로 활용할 수 있습니다.
:::

## 4. 복합 인덱스 실전 예제

### 4.1 테이블 구조 및 인덱스 생성

```sql
-- 단일 컬럼 인덱스 생성
ALTER TABLE people
    ADD INDEX first_name (first_name);
ALTER TABLE people
    ADD INDEX last_name (last_name);
ALTER TABLE people
    ADD INDEX birthday (birthday);

-- 복합 인덱스 생성
ALTER TABLE people
    ADD INDEX multi (first_name, last_name, birthday);
```

복합 인덱스를 생성한 후, `SHOW INDEXES` 명령을 통해 인덱스 구조를 확인할 수 있습니다:

```sql
SHOW
INDEXES FROM people;
```

결과:

```
| Table  | Non_unique | Key_name | Seq_in_index | Column_name | Collation | Cardinality | Index_type |
|--------|------------|----------|--------------|-------------|-----------|-------------|------------|
| people |          1 | multi    |            1 | first_name  | A         |        3107 | BTREE      |
| people |          1 | multi    |            2 | last_name   | A         |      419540 | BTREE      |
| people |          1 | multi    |            3 | birthday    | A         |      491583 | BTREE      |
```

여기서 `Seq_in_index` 열은 복합 인덱스 내의 컬럼 순서를 나타냅니다. 이 순서는 인덱스 사용 방식에 중요한 영향을 미칩니다.

### 4.2 EXPLAIN을 통한 인덱스 사용 분석

MySQL에서는 `EXPLAIN` 명령을 사용하여 쿼리가 인덱스를 어떻게 활용하는지 분석할 수 있습니다.

#### 4.2.1 모든 컬럼에 대한 동등 조건

```sql
EXPLAIN
SELECT *
FROM people
WHERE first_name = 'Aaron'
  AND last_name = 'Francis';
```

결과:

```
| id | select_type | table  | type | possible_keys | key   | key_len | ref         | rows | filtered |
|----|-------------|--------|------|---------------|-------|---------|-------------|------|----------|
|  1 | SIMPLE      | people | ref  | multi         | multi | 404     | const,const |    1 |   100.00 |
```

`key_len` 값이 404바이트인 것은 MySQL이 `first_name`과 `last_name` 두 컬럼을 모두 인덱스로 사용하고 있음을 나타냅니다.

```sql
EXPLAIN
SELECT *
FROM people
WHERE first_name = 'Aaron'
  AND last_name = 'Francis'
  AND birthday = '1989-02-14';
```

결과:

```
| id | select_type | table  | type | possible_keys | key   | key_len | ref               | rows | filtered |
|----|-------------|--------|------|---------------|-------|---------|-------------------|------|----------|
|  1 | SIMPLE      | people | ref  | multi         | multi | 407     | const,const,const |    1 |   100.00 |
```

`key_len`이 407바이트로 증가한 것은 세 개의 컬럼 모두 인덱스로 사용되고 있음을 의미합니다.

#### 4.2.2 범위 조건이 있는 경우

```sql
EXPLAIN
SELECT *
FROM people
WHERE first_name = 'Aaron'
  AND last_name < 'Francis'
  AND birthday = '1989-02-14';
```

결과:

```
| id | select_type | table  | type  | possible_keys | key   | key_len | ref | rows | filtered |
|----|-------------|--------|-------|---------------|-------|---------|-----|------|----------|
|  1 | SIMPLE      | people | range | multi         | multi | 404     |     |   55 |    10.00 |
```

`key_len`이 404바이트로 유지되는 것은 MySQL이 `first_name`과 `last_name`까지만 인덱스를 사용하고, 범위 조건(`<`) 이후의 `birthday` 컬럼은 인덱스 스캔에 활용하지 않음을
보여줍니다.

### 4.3 인덱스를 활용하는 쿼리와 활용하지 못하는 쿼리

#### 4.3.1 인덱스를 활용하는 쿼리 예시

```sql
-- 인덱스의 첫 번째 컬럼만 사용 (가능)
SELECT *
FROM people
WHERE first_name = 'Aaron';

-- 인덱스의 처음 두 컬럼 사용 (가능)
SELECT *
FROM people
WHERE first_name = 'Aaron'
  AND last_name = 'Francis';

-- 인덱스의 모든 컬럼 사용 (가능)
SELECT *
FROM people
WHERE first_name = 'Aaron'
  AND last_name = 'Francis'
  AND birthday = '1989-02-14';

-- 첫 번째 컬럼에 동등 조건, 두 번째 컬럼에 범위 조건 (가능, 두 컬럼까지만 사용)
SELECT *
FROM people
WHERE first_name = 'Aaron'
  AND last_name < 'Francis';
```

#### 4.3.2 인덱스를 활용하지 못하는 쿼리 예시

```sql
-- 인덱스의 첫 번째 컬럼을 사용하지 않음 (불가)
SELECT *
FROM people
WHERE last_name = 'Francis';

-- 인덱스의 첫 번째 컬럼을 건너뛰고 두 번째, 세 번째 컬럼만 사용 (불가)
SELECT *
FROM people
WHERE last_name = 'Francis'
  AND birthday = '1989-02-14';

-- OR 조건으로 인덱스 첫 번째 컬럼이 선택적 (불가)
SELECT *
FROM people
WHERE first_name = 'Aaron'
   OR last_name = 'Francis';
```

:::info
`OR` 조건에서 인덱스가 제대로 작동하려면 모든 조건에 인덱스가 적용될 수 있어야 합니다. 그렇지 않으면 MySQL은 전체 테이블 스캔을 수행할 가능성이 높습니다.
:::

## 5. 성능 고려사항과 대안

### 5.1 복합 인덱스 vs 개별 인덱스

- 복합 인덱스는 여러 컬럼을 조합한 단일 인덱스입니다.
- 개별 인덱스는 각 컬럼에 별도로 생성된 인덱스입니다.
- MySQL에서는 여러 조건을 사용할 때:
	- 복합 인덱스가 있다면 직접 적절한 행을 찾습니다.
	- 개별 인덱스만 있다면 인덱스 병합(Index Merge) 최적화를 시도하거나 가장 제한적인 인덱스를 선택합니다.

:::tip
쿼리 패턴을 분석하여 자주 함께 사용되는 컬럼에 복합 인덱스를 생성하는 것이 좋습니다. 하지만 불필요한 인덱스는 INSERT, UPDATE, DELETE 성능을 저하시킬 수 있으므로 주의해야 합니다.
:::

### 5.2 해시 컬럼 대안

- 복합 인덱스의 대안으로 "해시된" 컬럼을 도입할 수 있습니다.
- 여러 컬럼의 정보를 기반으로 해시된 값을 저장하는 방식입니다.
- 이 컬럼이 충분히 짧고, 고유하며, 인덱싱되어 있다면 넓은 범위의 컬럼을 포함하는 복합 인덱스보다 빠를 수 있습니다.

#### 해시 컬럼 사용 예시

```sql
-- 해시 컬럼 추가
ALTER TABLE orders
    ADD COLUMN customer_product_hash CHAR(32);

-- 해시 값 업데이트
UPDATE orders
SET customer_product_hash = MD5(CONCAT(customer_id, product_id));

-- 해시 컬럼에 인덱스 생성
CREATE INDEX idx_customer_product ON orders (customer_product_hash);

-- 해시 컬럼을 사용한 쿼리
SELECT *
FROM orders
WHERE customer_product_hash = MD5(CONCAT(5, 10))
  AND customer_id = 5
  AND product_id = 10;
```

이 접근 방식은 광범위한 복합 인덱스보다 저장 공간을 절약하면서도 빠른 조회가 가능합니다.

## 6. 복합 인덱스 설계 모범 사례

### 6.1 복합 인덱스 컬럼 순서 결정 원칙

복합 인덱스를 설계할 때 컬럼 순서를 결정하는 몇 가지 중요한 원칙이 있습니다:

- **동등 조건 먼저**: 자주 동등 조건(`=`)으로 사용되는 컬럼을 인덱스의 앞쪽에 배치합니다.
- **범위 조건 나중에**: 범위 조건(`>, <, BETWEEN` 등)으로 사용되는 컬럼은 가능한 인덱스의 마지막에 배치합니다.
- **선택성 고려**: 높은 선택성(고유한 값이 많은)을 가진 컬럼을 인덱스의 왼쪽에 배치합니다.
- **쿼리 패턴 분석**: 가장 자주 사용되는 쿼리 패턴을 분석하여 해당 패턴에 최적화된 인덱스를 설계합니다.
- **불필요한 인덱스 제거**: 인덱스를 너무 많이 생성하지 않도록 주의합니다. 각 인덱스는 INSERT, UPDATE, DELETE 작업의 성능을 저하시킵니다.
- **EXPLAIN 검증**: `EXPLAIN` 명령어를 사용하여 쿼리가 인덱스를 올바르게 사용하는지 반드시 확인합니다.

:::info[인덱스 선택성 이해하기]
선택성(Selectivity)은 인덱스된 컬럼의 고유한 값 수를 전체 행 수로 나눈 비율입니다. 예를 들어, 성별 컬럼은 선택성이 낮고(값이 몇 개 없음), 이메일 컬럼은 선택성이 높습니다(대부분 고유함). 높은
선택성을 가진 컬럼을 인덱스 앞쪽에 배치하면 더 효율적인 인덱스 스캔이 가능합니다.
:::

### 6.2 인덱스 설계 시나리오

- 사용자 로그인 테이블의 경우:
	- `(email, password)` 복합 인덱스는 로그인 쿼리에 효과적
	- 이메일이 고유하므로 인덱스의 첫 번째 컬럼으로 적합
- 주문 내역 테이블의 경우:
	- `(user_id, order_date)` 복합 인덱스는 특정 사용자의 주문 내역 조회에 효과적
	- 주문일 범위 검색이 필요하므로 `order_date`를 두 번째 컬럼으로 배치
- 고객 검색 시스템의 경우:
	- `(status, created_at, customer_id)` 복합 인덱스는 활성 고객의 최근 주문 조회에 효과적
	- 상태는 동등 조건(`status = 'active'`)으로 사용되고, 생성일은 범위 조건으로 사용될 가능성이 높음

### 6.3 key_len을 통한 인덱스 사용 분석

`EXPLAIN` 명령의 `key_len` 값은 MySQL이 인덱스의 어느 부분까지 사용하는지 파악하는 데 매우 유용합니다:

- `key_len`이 길수록 더 많은 인덱스 컬럼이 사용되고 있음을 의미합니다.
- 범위 조건이 있는 경우, 해당 컬럼까지만 `key_len`에 포함되는지 확인합니다.
- 쿼리를 수정한 후 `key_len` 값의 변화를 관찰하면 인덱스 사용 최적화에 도움이 됩니다.

:::tip
인덱스 설계는 완벽하게 한 번에 끝내는 것이 아니라, 실제 쿼리 성능을 모니터링하고 지속적으로 개선해나가는 과정입니다. 정기적으로 데이터베이스의 쿼리와 인덱스 사용 패턴을 분석하여 최적화하는 것이 좋습니다.
:::

## 7. 복합 인덱스의 실전 활용

### 7.1 단일 인덱스 vs 복합 인덱스

많은 경우 여러 개의 단일 컬럼 인덱스보다 하나의 잘 설계된 복합 인덱스가 더 효율적일 수 있습니다:

- 단일 컬럼에 각각 인덱스를 생성하는 경우:
  ```sql
  ALTER TABLE people ADD INDEX first_name (first_name);
  ALTER TABLE people ADD INDEX last_name (last_name);
  ALTER TABLE people ADD INDEX birthday (birthday);
  ```

- 복합 인덱스로 통합하는 경우:
  ```sql
  ALTER TABLE people ADD INDEX multi (first_name, last_name, birthday);
  ```

복합 인덱스는 여러 컬럼에 걸친 쿼리에서 더 효율적으로 작동할 수 있지만, 앞서 설명한 좌측 접두사 규칙과 범위 조건 제한을 고려해야 합니다.

### 7.2 복합 인덱스 발전 과정

복합 인덱스를 마스터하는 것은 데이터베이스 사용자가 초급에서 고급으로 발전하는 중요한 단계입니다:

1. **기본 이해**: 단일 컬럼 인덱스의 개념과 작동 방식 이해
2. **좌측 접두사 규칙 습득**: 복합 인덱스에서 컬럼 순서의 중요성 이해
3. **범위 조건 제한 인식**: 범위 조건 이후의 컬럼이 인덱스 스캔에 활용되지 않는다는 점 파악
4. **EXPLAIN 분석 능력**: 쿼리 실행 계획을 분석하고 인덱스 사용 여부 확인
5. **최적화 기술 적용**: 애플리케이션의 실제 쿼리 패턴에 맞춰 인덱스 최적화

### 7.3 결론

- 복합 인덱스는 여러 컬럼을 포함하는 쿼리의 성능을 크게 향상시킬 수 있는 강력한 도구입니다.
- 좌측 접두사 규칙과 범위 조건 제한을 이해하고 이에 맞게 인덱스와 쿼리를 설계하는 것이 중요합니다.
- 실제 쿼리 패턴을 분석하여 가장 효율적인 인덱스 구성을 선택해야 합니다.
- `EXPLAIN`을 활용한 쿼리 분석과 실제 성능 측정을 통해 최적의 인덱스 전략을 수립해야 합니다.
- 인덱스는 조회 성능을 향상시키지만 데이터 수정 작업의 오버헤드를 증가시키므로 균형을 찾는 것이 중요합니다.

:::tip[실무 조언]
실제 프로덕션 환경에서는 주기적으로 인덱스 사용 현황을 모니터링하고, 사용되지 않는 인덱스는 제거하는 것이 좋습니다. MySQL의 `performance_schema`를 활용하면 인덱스 사용 통계를 확인할 수
있습니다. 복합 인덱스를 마스터하면 단순한 데이터베이스 사용자에서 진정한 데이터베이스 전문가로 발전할 수 있습니다.
:::

참고

- https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html
- https://planetscale.com/learn/courses/mysql-for-developers/indexes/composite-indexes#creating-a-composite-index