---
title: "EXPLAIN"
description: "MySQL EXPLAIN 결과를 해석하는 방법 - 출력 컬럼, 조인 타입, Extra 정보를 통한 쿼리 실행 계획 분석 가이드"
keywords: ["MySQL", "EXPLAIN", "실행 계획", "쿼리 최적화", "조인 타입"]
tags: ["Database", "MySQL", "Performance"]
hide_title: true
last_update:
  date: 2026-02-04
  author: youngthree
---

## 1. EXPLAIN

- `EXPLAIN`은 MySQL이 쿼리를 어떻게 실행하는지 보여주는 명령어입니다.
- `SELECT`, `DELETE`, `INSERT`, `REPLACE`, `UPDATE` 문에 사용할 수 있습니다.
- 쿼리 앞에 `EXPLAIN`을 붙이면 실행 계획을 확인할 수 있습니다.

```sql
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
```

### 1.1 출력 결과의 읽는 순서

- EXPLAIN은 SELECT 문에서 사용된 **각 테이블마다 한 행**의 정보를 반환합니다.
- 출력 순서는 MySQL이 쿼리를 처리하면서 **테이블을 읽는 순서**와 동일합니다.
- MySQL의 테이블 처리 방식:
  1. 첫 번째 테이블에서 행을 읽습니다.
  2. 두 번째 테이블에서 매칭되는 행을 찾고, 세 번째 테이블로 계속 진행합니다.
  3. 모든 테이블이 처리되면 선택된 컬럼을 출력합니다.
  4. 이전 테이블로 되돌아가며 매칭되는 행이 더 있는 테이블을 찾습니다.
  5. 해당 테이블에서 다음 행을 읽고, 다시 다음 테이블부터 과정을 반복합니다.

## 2. 출력 컬럼

EXPLAIN의 결과는 다음 컬럼으로 구성됩니다.

| 컬럼 | 의미 |
|------|------|
| `id` | SELECT 식별자 (쿼리 내 순서) |
| `select_type` | SELECT 유형 |
| `table` | 출력 행이 참조하는 테이블 |
| `partitions` | 매칭되는 파티션 |
| `type` | **조인 타입 (성능 판단의 핵심)** |
| `possible_keys` | 사용 가능한 인덱스 목록 |
| `key` | **실제로 선택된 인덱스** |
| `key_len` | 사용된 인덱스 키의 길이 |
| `ref` | 인덱스와 비교되는 컬럼 또는 상수 |
| `rows` | **검사할 것으로 예상되는 행 수** |
| `filtered` | 테이블 조건으로 필터링되는 행의 비율 (%) |
| `Extra` | **추가 정보 (성능 판단에 중요)** |

### 2.1 id (JSON name: select_id)

- **SELECT 식별자**입니다. 쿼리 안에 있는 각 `SELECT`에 **순서대로 붙는 번호**입니다.
- 서브쿼리나 UNION이 있으면 EXPLAIN 행이 여러 개 나오고, **`id`가 같으면 같은 SELECT에 속한** 테이블입니다.

**id가 NULL인 경우**

- 해당 행이 **다른 행들의 UNION 결과**를 가리킬 때 `id`는 **NULL**입니다.
- 이때 `table` 컬럼에는 `<unionM,N>` 같은 값이 나오며, **id가 M인 행과 id가 N인 행을 UNION한 결과**를 의미합니다.

**같은 id / 다른 id**

- **같은 id** = 같은 SELECT 블록에 속함. 한 단계에서 함께 조인되는 테이블들입니다.
- **id가 다름** = 서로 다른 SELECT (바깥 쿼리 vs 서브쿼리 등).

**예시**

```sql
-- id가 모두 1: 하나의 SELECT에서 orders, users 조인 → 같은 id
SELECT * FROM orders o JOIN users u ON o.user_id = u.id;

-- id 1: 바깥 SELECT (users) / id 2: 서브쿼리 SELECT (orders) → id 다름
SELECT * FROM users u
WHERE u.id = (SELECT user_id FROM orders ORDER BY id DESC LIMIT 1);
```

- 조인 쿼리: `orders`와 `users`가 **id 1**로 나옵니다.
- 서브쿼리 쿼리: 바깥 `users`는 **id 1**, 안쪽 `orders`는 **id 2**로 나옵니다.
- **UNION**을 쓰는 쿼리에서는, UNION 결과를 나타내는 행이 **id NULL**, `table`은 **`<unionM,N>`** 으로 나옵니다 (id가 M, N인 SELECT들의 UNION 결과).

### 2.2 select_type

| 값 | 의미 |
|------|------|
| `SIMPLE` | 단순 SELECT (UNION이나 서브쿼리를 사용하지 않음) |
| `PRIMARY` | 가장 바깥쪽 SELECT |
| `UNION` | UNION에서 두 번째 이후의 SELECT |
| `DEPENDENT UNION` | UNION에서 두 번째 이후의 SELECT이며, 외부 쿼리에 의존 |
| `UNION RESULT` | UNION의 결과 |
| `SUBQUERY` | 서브쿼리의 첫 번째 SELECT |
| `DEPENDENT SUBQUERY` | 서브쿼리의 첫 번째 SELECT이며, 외부 쿼리에 의존 |
| `DERIVED` | 파생 테이블 (FROM 절의 서브쿼리) |
| `DEPENDENT DERIVED` | 다른 테이블에 의존하는 파생 테이블 |
| `MATERIALIZED` | 구체화된 서브쿼리 |
| `UNCACHEABLE SUBQUERY` | 결과를 캐시할 수 없어 외부 쿼리의 각 행마다 재평가해야 하는 서브쿼리 |
| `UNCACHEABLE UNION` | 캐시할 수 없는 서브쿼리에 속하는 UNION의 두 번째 이후 SELECT |

- `DEPENDENT`는 일반적으로 **상관 서브쿼리(Correlated Subquery)**의 사용을 의미합니다.
- `DEPENDENT SUBQUERY`와 `UNCACHEABLE SUBQUERY`의 차이:
  - `DEPENDENT SUBQUERY`: 외부 컨텍스트 변수의 **서로 다른 값 세트**마다 한 번만 재평가
  - `UNCACHEABLE SUBQUERY`: 외부 쿼리의 **모든 행**마다 재평가

### 2.3 table

- 해당 행이 참조하는 테이블 이름입니다.
- `<unionM,N>`: id가 M과 N인 행의 UNION 결과
- `<derivedN>`: id가 N인 파생 테이블
- `<subqueryN>`: id가 N인 구체화된 서브쿼리

### 2.4 key와 possible_keys

- `possible_keys`: MySQL이 행을 찾기 위해 **사용할 수 있는** 인덱스 목록
- `key`: 실제로 **사용하기로 결정한** 인덱스
- `key`가 `NULL`이면 인덱스를 사용하지 않은 것입니다.

:::warning[possible_keys에 있는데 key가 NULL인 경우]

인덱스가 존재하지만 옵티마이저가 사용하지 않기로 결정한 것입니다. `WHERE` 절을 점검하거나 `FORCE INDEX` 힌트를 고려해 보세요.

:::

### 2.5 key_len

- 사용된 인덱스 키의 바이트 길이입니다.
- 복합 인덱스에서 **몇 개의 컬럼이 실제로 사용되었는지** 판단하는 데 활용합니다.
- `NULL` 허용 컬럼은 1바이트가 추가됩니다.

### 2.6 ref

- **인덱스(`key`)로 행을 찾을 때, 어떤 값과 비교하는지**를 나타냅니다.
- 즉, "이 테이블의 인덱스에 **이 값**을 넣어서 조회한다"에서 **이 값**이 무엇인지가 `ref`입니다.

**나올 수 있는 값**

| ref 값 | 의미 | 예시 쿼리 |
|--------|------|-----------|
| `const` | **상수**와 비교해서 인덱스 조회 | `WHERE id = 1`, `WHERE email = 'a@b.com'` |
| `테이블명.컬럼명` | **다른 테이블의 컬럼** 값으로 인덱스 조회 (조인 시) | `FROM a JOIN b ON a.id = b.user_id` → b 쪽에서 `a.id`로 조회 |
| `func` | **함수/연산 결과**와 비교해서 인덱스 조회 | `WHERE YEAR(created_at) = 2024` 등. 어떤 함수인지는 `EXPLAIN` 후 `SHOW WARNINGS`로 확인 |

**예시**

```sql
-- ref = 'const' (상수로 조회)
EXPLAIN SELECT * FROM users WHERE id = 10;
-- key: PRIMARY, ref: const

-- ref = '다른 테이블.컬럼' (조인 시)
EXPLAIN SELECT * FROM orders o JOIN users u ON u.id = o.user_id;
-- orders 쪽: key가 user_id 인덱스, ref: test.u.id (users.id 값으로 orders.user_id 인덱스 조회)
```

- `ref`가 `const`이거나 다른 테이블의 PK/UNIQUE 컬럼이면, 인덱스로 **한 건 또는 소수 행**만 찾는 좋은 접근입니다.
- `ref`가 `func`이면 인덱스 컬럼을 함수로 감싼 경우가 많아, 인덱스를 제대로 쓰지 못할 수 있으므로 `SHOW WARNINGS`로 원인을 확인하는 것이 좋습니다.

### 2.7 rows

- MySQL이 쿼리를 실행하기 위해 **검사해야 한다고 예상하는 행 수**입니다.
- InnoDB에서는 추정값이며 항상 정확하지는 않습니다.
- 조인 시 각 테이블의 `rows`를 곱하면 전체 검사 행 수를 대략 알 수 있습니다.

### 2.8 filtered

- 테이블 조건에 의해 필터링될 행의 **예상 비율**(%)입니다.
- `rows × filtered`가 다음 테이블과 조인되는 행 수입니다.
- 예: `rows`가 1000이고 `filtered`가 50.00이면 → 500행이 다음 테이블과 조인

## 3. type (조인 타입)

- `type`은 EXPLAIN에서 **가장 중요한 컬럼**입니다. 
- 테이블에 어떻게 접근하는지를 나타내며, 위에서 아래로 갈수록 성능이 나빠집니다.

| type | 설명 | 성능 |
|------|------|------|
| `system` | 테이블에 행이 1개 (system 테이블) | 최상 |
| `const` | PK 또는 UNIQUE 인덱스로 1행만 매칭 | 최상 |
| `eq_ref` | 조인 시 PK/UNIQUE NOT NULL로 1행씩 조회 | 매우 좋음 |
| `ref` | 인덱스의 일부만 사용, 여러 행 매칭 가능 | 좋음 |
| `fulltext` | FULLTEXT 인덱스 사용 | 좋음 |
| `ref_or_null` | ref와 동일하나 NULL 추가 검색 | 좋음 |
| `index_merge` | 여러 인덱스를 병합하여 사용 | 보통 |
| `unique_subquery` | IN 서브쿼리에서 PK 조회로 대체 | 보통 |
| `index_subquery` | IN 서브쿼리에서 인덱스 조회로 대체 | 보통 |
| `range` | 인덱스 범위 스캔 (BETWEEN, IN, >, < 등) | 보통 |
| `index` | 인덱스 풀 스캔 (데이터 파일은 안 읽음) | 나쁨 |
| `ALL` | **테이블 풀 스캔** | 최악 |

### 3.1 const

- PK 또는 UNIQUE 인덱스의 **모든 컬럼**을 상수와 비교할 때 사용됩니다.
- 최대 1행만 매칭되므로 매우 빠릅니다.

```sql
-- const 예시
SELECT * FROM users WHERE id = 1;
SELECT * FROM users WHERE pk_part1 = 1 AND pk_part2 = 2;
```

### 3.2 eq_ref

- 조인에서 **이전 테이블(들)에서 나온 행 조합 하나당, 이 테이블에서는 정확히 1행만** 읽는 조인 타입입니다.
- `system`, `const` 다음으로 좋은 조인 타입이며, 조인 쿼리에서는 사실상 **가장 이상적인 형태**입니다.

**언제 나오는가**

- 조인 조건에서 **`=` 연산자**로 비교하고,
- 비교 대상 컬럼에 **PRIMARY KEY** 또는 **UNIQUE NOT NULL** 인덱스가 걸려 있어서,
- "이 값으로 찾으면 **항상 1행만** 나온다"는 것이 보장될 때 사용됩니다.
- 비교하는 값은 **상수**이거나, **이미 읽은 앞쪽 테이블의 컬럼**이면 됩니다.

**동작 방식**

- 예: `orders`와 `users`를 `users.id = orders.user_id`로 조인할 때,
  - `orders`에서 한 행을 읽으면 `orders.user_id` 값이 정해집니다.
  - 그 값으로 `users`의 **PK(`id`)** 를 조회하면 **항상 1명의 사용자**만 나옵니다.
- 그래서 "이전 테이블 행 조합 하나당, 이 테이블에서는 1행만 읽는다"고 하는 것입니다.

**예시**

```sql
-- users.id가 PK이므로, orders의 각 행마다 users에서 1행만 조회 → eq_ref
SELECT * FROM orders o
JOIN users u ON u.id = o.user_id;

-- ref와의 차이: ref는 한 값에 여러 행이 매칭될 수 있음 (예: user_id 인덱스)
-- eq_ref는 PK/UNIQUE라서 한 값에 1행만 매칭됨
```

### 3.3 ref

- 조인에서 **이전 테이블(들)의 행 조합 하나마다**, 이 테이블에서는 **인덱스 값이 같은 행을 모두** 읽는 조인 타입입니다.
- eq_ref는 "값 하나당 1행"이 보장되지만, ref는 **같은 인덱스 값에 여러 행이 매칭될 수 있다**는 점이 다릅니다.

**ref가 쓰이는 경우**

- 조인이 **인덱스 키의 왼쪽 접두사만** 사용할 때 (복합 인덱스의 일부 컬럼만 조건에 사용)
- 또는 사용하는 키가 **PRIMARY KEY나 UNIQUE가 아닐 때**
- 즉, **키 값 하나로 1행만 선택된다고 보장할 수 없을 때** ref가 사용됩니다.
- 사용하는 키가 **소수의 행만** 매칭시키면 ref도 괜찮은 조인 타입입니다.

**연산자**

- `ref`는 인덱스가 걸린 컬럼을 `=` 또는 `<=>` 로 비교할 때 사용할 수 있습니다.

**예시**

```sql
-- 단일 테이블: key_column과 expr 비교
SELECT * FROM ref_table WHERE key_column = expr;

-- 조인: ref_table.key_column과 other_table.column 비교
SELECT * FROM ref_table, other_table
  WHERE ref_table.key_column = other_table.column;

-- 복합 인덱스: key_column_part1은 other_table.column과, key_column_part2는 상수 1과 비교
SELECT * FROM ref_table, other_table
  WHERE ref_table.key_column_part1 = other_table.column
  AND ref_table.key_column_part2 = 1;
```

**eq_ref와의 차이**

| 구분 | eq_ref | ref |
|------|--------|-----|
| 인덱스 | PRIMARY KEY 또는 UNIQUE NOT NULL | 그 외 인덱스 (또는 복합 인덱스의 왼쪽 접두사만 사용) |
| 행 수 | 키 값당 **1행** | 키 값당 **여러 행 가능** |
| 적합한 경우 | 조인 시 "한 건만 매칭"이 보장될 때 | 한 값에 여러 행이 있어도 될 때 (매칭 행이 적으면 좋음) |

### 3.4 range

- **주어진 범위에 해당하는 행만** 인덱스를 사용해서 가져오는 조인 타입입니다.
- 테이블 전체나 인덱스 전체를 읽지 않고, **인덱스에서 조건에 맞는 구간만** 스캔합니다.

**EXPLAIN 출력에서**

- `key`: range 접근에 사용된 인덱스
- `key_len`: 사용된 **가장 긴 키 부분**의 길이
- `ref`: range 타입에서는 **NULL** (상수/범위로만 검색하므로 다른 테이블 컬럼 참조 없음)

**언제 사용되는가**

- 인덱스가 걸린 컬럼을 **상수와** 비교할 때 다음 연산자를 쓰면 range 접근이 가능합니다.
- `=`, `<>`, `>`, `>=`, `<`, `<=`, `IS NULL`, `<=>`, `BETWEEN`, `LIKE`, `IN()`

**예시 (MySQL 문서 기준)**

```sql
-- 단일 값
SELECT * FROM tbl_name WHERE key_column = 10;

-- 범위 (BETWEEN)
SELECT * FROM tbl_name WHERE key_column BETWEEN 10 AND 20;

-- 여러 값 (IN)
SELECT * FROM tbl_name WHERE key_column IN (10, 20, 30);

-- 복합 인덱스: key_part1은 상수, key_part2는 IN
SELECT * FROM tbl_name WHERE key_part1 = 10 AND key_part2 IN (10, 20, 30);
```

- `LIKE`는 **앞부분이 상수**인 경우에만 range로 사용될 수 있습니다 (예: `LIKE 'abc%'`). `LIKE '%abc'`처럼 앞에 와일드카드가 있으면 range가 되지 않습니다.

### 3.5 index

- 인덱스 트리를 **전체 스캔**합니다.
- 두 가지 경우에 발생합니다.
  - **커버링 인덱스**: 쿼리에 필요한 모든 데이터가 인덱스에 있어서 테이블을 읽을 필요 없음 (`Extra`에 `Using index` 표시)
  - **인덱스 순서 스캔**: 인덱스 순서대로 데이터 행을 조회
- ALL보다는 낫지만, 인덱스 전체를 읽으므로 여전히 느릴 수 있습니다.

### 3.6 ALL

- 테이블의 **모든 행을 처음부터 끝까지 스캔**합니다.
- 대부분의 경우 적절한 인덱스를 추가하여 회피해야 합니다.

:::danger[ALL은 피해야 합니다]

`ALL`이 나타나면 `WHERE` 절의 컬럼에 인덱스가 있는지 확인하세요. 데이터가 많을수록 성능 저하가 심각합니다.

:::

## 4. Extra

- `Extra` 컬럼은 쿼리 실행에 대한 추가 정보를 제공합니다. 
- 주의해야 할 값과 긍정적인 값을 구분하는 것이 중요합니다.

### 4.1 주의가 필요한 값

| 값 | 의미 | 대응 |
|------|------|------|
| `Using filesort` | 정렬을 위해 추가 패스 필요 | ORDER BY 컬럼에 인덱스 추가 고려 |
| `Using temporary` | 임시 테이블 생성 필요 | GROUP BY, ORDER BY 최적화 |
| `Using where` | WHERE 절로 행 필터링 (인덱스만으로 부족) | 인덱스 커버리지 점검 |

### 4.2 긍정적인 값

| 값 | 의미 |
|------|------|
| `Using index` | **커버링 인덱스** 사용. 테이블 데이터를 읽지 않고 인덱스만으로 처리 |
| `Using index condition` | **인덱스 컨디션 푸시다운(ICP)** 적용. 인덱스 레벨에서 먼저 필터링 |
| `Using index for group-by` | 인덱스만으로 GROUP BY/DISTINCT 처리 |

### 4.3 기타 주요 값

| 값 | 의미 |
|------|------|
| `Using join buffer (hash join)` | 해시 조인 사용 |
| `Using join buffer (Block Nested Loop)` | 블록 중첩 루프 조인 사용 |
| `Using MRR` | Multi-Range Read 최적화 사용 |
| `Backward index scan` | 역방향 인덱스 스캔 (InnoDB 내림차순) |
| `Select tables optimized away` | 옵티마이저가 최적화로 테이블 접근 불필요 판단 |
| `Impossible WHERE` | WHERE 절이 항상 false |
| `Not exists` | LEFT JOIN 최적화로 매칭 행 발견 후 추가 스캔 중단 |
| `Zero limit` | LIMIT 0으로 결과 없음 |
| `Distinct` | 첫 번째 매칭 행 발견 후 추가 검색 중단 |

### 4.4 Extra 값 상세 설명


#### Using filesort (JSON: using_filesort)

- MySQL이 **정렬된 순서로 행을 반환하기 위해 추가 패스**를 수행한다는 의미입니다.
- 동작 방식:
  1. 조인 타입에 따라 **모든 행**을 읽고,
  2. `WHERE` 절을 만족하는 행에 대해 **정렬 키(sort key)**와 **행에 대한 포인터**를 저장한 뒤,
  3. **정렬 키를 정렬**하고,
  4. 정렬된 순서대로 행을 읽어 반환합니다.
- 즉, 인덱스로 정렬된 결과를 바로 쓰지 못하고 **별도 정렬 단계**가 들어갑니다.
- `ORDER BY`나 `GROUP BY`가 인덱스와 맞지 않을 때 자주 나타납니다.

:::tip[개선 방향]

`ORDER BY`에 사용되는 컬럼(또는 조합)에 인덱스를 추가하거나, 기존 인덱스 순서를 활용하도록 쿼리를 조정하면 filesort를 줄일 수 있습니다.

:::

#### Using temporary (JSON: using_temporary_table)

- 쿼리를 처리하기 위해 MySQL이 **임시 테이블**을 만들어 그 결과를 담는다는 의미입니다.
- **자주 나타나는 경우**: `GROUP BY`와 `ORDER BY`에 **서로 다른 컬럼(또는 순서)**이 지정되어 있을 때입니다.
  - 예: `GROUP BY a` 인데 `ORDER BY b` → 그룹 결과를 만든 뒤 다시 정렬해야 하므로 임시 테이블이 필요할 수 있습니다.
- 임시 테이블 생성·삭제와 디스크 I/O가 발생할 수 있어, `Using filesort`와 함께 성능 점검 대상으로 보는 것이 좋습니다.

:::tip[개선 방향]

`GROUP BY`와 `ORDER BY`를 **같은 컬럼(또는 같은 순서)**으로 맞추거나, 해당 컬럼에 인덱스를 두어 임시 테이블 없이 처리되도록 쿼리·인덱스를 조정할 수 있습니다.

:::

#### Using index (JSON: using_index)

- **테이블 데이터(실제 행)를 읽지 않고**, **인덱스 트리만**으로 필요한 컬럼 정보를 가져온다는 의미입니다.
- 쿼리에서 사용하는 컬럼이 **어떤 하나의 인덱스에 모두 포함**될 때 이 전략을 쓸 수 있습니다 (커버링 인덱스).
- InnoDB에서 **사용자 정의 클러스터드 인덱스**가 있는 경우, `type`이 `index`이고 `key`가 `PRIMARY`이면 `Extra`에 `Using index`가 없어도 그 인덱스(PRIMARY)를 사용할 수 있습니다.
- `EXPLAIN FORMAT=TRADITIONAL`, `FORMAT=JSON`, `FORMAT=TREE` 모두 커버링 인덱스 사용 정보를 보여줍니다.

#### Using where (JSON: attached_condition)

- **WHERE 절**이 있어서, 다음 테이블과 조인할 행이나 클라이언트로 보낼 행을 **제한**한다는 의미입니다.
- 즉, "어떤 행을 매칭할지 / 반환할지"를 WHERE로 걸러냅니다.
- **주의**: `type`이 `ALL` 또는 `index`인데 `Extra`에 `Using where`가 **없다**면, 테이블의 모든 행을 가져오고 있다는 뜻이므로, "모든 행을 의도한 것이 아니라면" 쿼리나 인덱스 설계를 점검하는 것이 좋습니다.
- JSON 포맷에서는 `Using where`에 대응하는 단일 프로퍼티는 없고, `attached_condition`에 사용된 WHERE 조건이 들어갑니다.

#### Using index condition (JSON: using_index_condition)

- **인덱스 컨디션 푸시다운(ICP, Index Condition Pushdown)** 이 적용되었다는 의미입니다.
- 동작 방식:
  - 먼저 **인덱스 튜플(인덱스 엔트리)**에 접근하고,
  - **인덱스만으로 판단 가능한 조건**을 인덱스 단계에서 먼저 검사한 뒤,
  - 조건을 만족하는 경우에만 **실제 테이블 행(풀 row)**을 읽습니다.
- 즉, "꼭 필요할 때만" 테이블 행을 읽도록 **조건을 인덱스 쪽으로 밀어 넣은(push down)** 최적화입니다.
- Index Condition Pushdown Optimization 문서 참고.

:::note[Using index와의 차이]

- `Using index`: 테이블 행을 **전혀** 읽지 않고 인덱스만 사용 (커버링 인덱스).
- `Using index condition`: 인덱스에서 먼저 조건을 걸러서, **읽어야 할 테이블 행 수**를 줄입니다. 필요 시 테이블 행은 읽습니다.

:::

## 5. 실전 해석 가이드

### 5.1 좋은 실행 계획의 특징

```sql
EXPLAIN SELECT * FROM users WHERE id = 1;
```

```
+----+------+------+------+------+------+------+
| id | type | key  | rows | filtered | Extra |
+----+------+------+------+------+------+------+
|  1 | const| PRIMARY | 1 | 100.00 | NULL  |
+----+------+------+------+------+------+------+
```

- `type`이 `const` 또는 `eq_ref`
- `key`에 실제 인덱스가 표시됨
- `rows`가 적음
- `Extra`에 `Using filesort`나 `Using temporary` 없음

### 5.2 나쁜 실행 계획의 특징

```sql
EXPLAIN SELECT * FROM users WHERE name LIKE '%kim%';
```

```
+----+------+------+------+------+------+-----------+
| id | type | key  | rows | filtered | Extra       |
+----+------+------+------+------+------+-----------+
|  1 | ALL  | NULL | 50000| 11.11 | Using where |
+----+------+------+------+------+------+-----------+
```

- `type`이 `ALL` (풀 테이블 스캔)
- `key`가 `NULL` (인덱스 미사용)
- `rows`가 큼
- `Extra`에 `Using filesort`, `Using temporary`

### 5.3 조인 성능 예측

- 각 테이블의 `rows`를 곱하면 전체 검사 행 수를 추정할 수 있습니다.

```sql
EXPLAIN SELECT * FROM orders o
JOIN users u ON u.id = o.user_id
JOIN products p ON p.id = o.product_id;
```

```
+----+------+------+------+------+
| id | table| type | key  | rows |
+----+------+------+------+------+
|  1 | o    | ALL  | NULL | 10000|   -- 풀 스캔
|  1 | u    | eq_ref| PRIMARY | 1 |   -- PK로 1행
|  1 | p    | eq_ref| PRIMARY | 1 |   -- PK로 1행
+----+------+------+------+------+
```

- 총 검사 행 수: 10,000 × 1 × 1 = **10,000행**
- `orders` 테이블만 풀 스캔이고 나머지는 PK 조인이므로 합리적

### 5.4 해석 체크리스트

1. **type 확인**: `ALL`이나 `index`가 있으면 인덱스 추가 고려
2. **key 확인**: `NULL`이면 인덱스를 사용하지 않는 것
3. **rows 확인**: 예상 검사 행 수가 과도하지 않은지 확인
4. **Extra 확인**: `Using filesort`, `Using temporary`가 있으면 최적화 여지
5. **key_len 확인**: 복합 인덱스의 일부만 사용하는지 확인

## 6. EXPLAIN 출력 포맷

### 6.1 TRADITIONAL (기본)

```sql
EXPLAIN SELECT * FROM users WHERE id = 1;
```

테이블 형태로 출력됩니다.

### 6.2 JSON

```sql
EXPLAIN FORMAT=JSON SELECT * FROM users WHERE id = 1;
```

JSON 형태로 더 상세한 정보를 제공합니다. 비용(cost) 정보가 포함됩니다.

### 6.3 TREE

```sql
EXPLAIN FORMAT=TREE SELECT * FROM users WHERE id = 1;
```

트리 형태로 쿼리 처리 과정을 직관적으로 보여줍니다. 해시 조인 사용 여부도 확인할 수 있습니다.

### 6.4 ANALYZE

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE id = 1;
```

- **실제로 쿼리를 실행**하고 예상값과 실제값을 비교합니다.
- TREE 포맷으로 출력되며, 실제 실행 시간과 행 수가 포함됩니다.

:::warning[EXPLAIN ANALYZE는 쿼리를 실제로 실행합니다]

일반 `EXPLAIN`은 실행 계획만 보여주지만, `EXPLAIN ANALYZE`는 쿼리를 실행하므로 데이터 변경 쿼리에 주의하세요.

:::

## 7. 참고

- [MySQL 8.4 EXPLAIN Output Format](https://dev.mysql.com/doc/refman/8.4/en/explain-output.html)
