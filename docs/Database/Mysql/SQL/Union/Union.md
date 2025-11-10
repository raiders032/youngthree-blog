## 1. UNION 소개

- 우리는 지금까지 `JOIN`, 서브쿼리라는 강력한 도구들을 배웠습니다.
  - [JOIN 참고](../../SQL/Join/Join.md)
  - [서브쿼리 참고](../../SQL/Subquery/Subquery.md)
- 이 기술들의 공통점은 기존 테이블의 정보를 조합하거나 필터링해서, 우리가 원하는 형태의 '하나의 결과 집합(Result Set)'을 만들어내는 것이었습니다.

### 1.1 JOIN vs UNION

- `JOIN`이 여러 테이블을 **옆으로(수평으로)** 붙여서 더 많은 정보를 가진 컬럼들을 만드는 기술이었다면, `UNION`은 여러 개의 결과 집합을 **아래로(수직으로)** 이어 붙여서 더 많은 행을 가진 하나의 집합으로 만드는 기술입니다.
- `JOIN`이 정보를 풍성하게 만드는 기술이라면, `UNION`은 흩어진 집합들을 하나로 모으는 기술이라고 할 수 있습니다.

### 1.2 문제 상황

**"우리 쇼핑몰은 현재 활동 중인 고객을 `users` 테이블에, 과거에 탈퇴한 고객을 `retired_users`라는 별도의 테이블에 보관하고 있다. 연말을 맞아 모든 고객(활동+탈퇴)에게 감사 이메일을 보내기 위해, 두 테이블에 흩어져 있는 이름과 이메일을 합쳐서 하나의 전체 목록을 만들어야 한다."**

- 이 업무는 `JOIN`으로는 해결할 수 없습니다.
- 두 테이블은 서로 연결된 관계가 아니라, 구조는 비슷하지만 분리된 별개의 집합이기 때문입니다.

### 1.3 실습 준비: retired_users 테이블 생성

- 이 문제를 실습하기 위해, 먼저 '탈퇴한 고객' 정보를 담을 `retired_users` 테이블을 임시로 만들어 봅시다.
- 일부러 현재 활동 고객인 '션'을 탈퇴 고객 명단에도 포함시켰습니다.

```sql
-- 본 실습을 위한 탈퇴 고객 테이블 생성
DROP TABLE IF EXISTS retired_users;
CREATE TABLE retired_users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    retired_date DATE NOT NULL
);

-- 탈퇴 고객 데이터 입력
INSERT INTO retired_users (id, name, email, retired_date) VALUES
(1, '션', 'sean@example.com', '2024-12-31'),
(7, '아이작 뉴턴', 'newton@example.com', '2025-01-10');
```

- '션'은 `users` 테이블에도 포함되고 `retired_users` 테이블에도 포함됩니다.
- 비즈니스 로직에는 맞지 않지만 개발자의 실수로 두 곳에 모두 입력되었다고 가정합시다.

## 2. UNION의 개념과 사용법

### 2.1 두 개의 고객 명단

**1. 활동 고객 명단 (users 테이블)**

```sql
SELECT name, email FROM users;
```

**실행 결과**

| name | email |
|------|-------|
| 션 | sean@example.com |
| 네이트 | nate@example.com |
| 세종대왕 | sejong@example.com |
| 이순신 | sunsin@example.com |
| 마리 퀴리 | marie@example.com |
| 레오나르도 다빈치 | vinci@example.com |

**2. 탈퇴 고객 명단 (retired_users 테이블)**

```sql
SELECT name, email FROM retired_users;
```

**실행 결과**

| name | email |
|------|-------|
| 션 | sean@example.com |
| 아이작 뉴턴 | newton@example.com |

### 2.2 UNION으로 합치기

- `UNION` 연산자는 이 두 개의 `SELECT` 문의 결과를 하나로 합쳐줍니다.
- 사용법은 아주 간단합니다. 두 `SELECT` 문 사이에 `UNION` 키워드를 넣어주기만 하면 됩니다.

```sql
SELECT name, email FROM users
UNION
SELECT name, email FROM retired_users;
```

**실행 결과**

| name | email |
|------|-------|
| 션 | sean@example.com |
| 네이트 | nate@example.com |
| 세종대왕 | sejong@example.com |
| 이순신 | sunsin@example.com |
| 마리 퀴리 | marie@example.com |
| 레오나르도 다빈치 | vinci@example.com |
| 아이작 뉴턴 | newton@example.com |

### 2.3 UNION의 중복 제거 특징

- 결과를 자세히 살펴봅시다.
- '션'은 `users` 테이블에도 있고 `retired_users` 테이블에도 있었습니다.
- 하지만 최종 결과 목록에는 **단 한 번만** 나타납니다.
- 이것이 `UNION`의 특징입니다. **`UNION`은 기본적으로 두 결과 집합을 합친 뒤, 완전히 중복되는 행은 자동으로 제거하여 고유한 값만 남깁니다.**
- 이메일 목록을 만들 때 중복된 주소로 두 번 발송하는 실수를 원천적으로 방지해주니 매우 유용한 기능입니다.

### 2.4 UNION 사용의 핵심 규칙

:::warning[UNION 사용 규칙]

`UNION`으로 연결되는 모든 `SELECT` 문은 다음 조건을 만족해야 합니다.

- **컬럼의 개수가 동일해야 합니다.**
- 각 `SELECT` 문의 같은 위치에 있는 컬럼들은 서로 **호환 가능한 데이터 타입**이어야 합니다. (예: 숫자 타입은 숫자 타입끼리, 문자 타입은 문자 타입끼리)
- 최종 결과의 컬럼 이름은 **첫 번째 `SELECT` 문의 컬럼 이름**을 따릅니다.

:::

## 3. UNION ALL

### 3.1 문제 상황

**"마케팅팀에서 두 종류의 고객에게 이벤트 안내 메일을 보내려고 한다. 첫 번째 그룹은 '전자기기' 카테고리의 상품을 구매한 이력이 있는 고객이고, 두 번째 그룹은 '서울'에 거주하는 고객이다. 두 그룹의 명단을 합쳐서 전체 발송 목록을 만들고 싶다."**

- 여기서 중요한 질문이 생깁니다.
- **'서울'에 살면서 '전자기기'를 구매한 고객은 두 그룹에 모두 속하게 되는데, 이 고객을 최종 목록에 한 번만 포함해야 할까? 아니면 중복을 허용해도 될까?**
- 정답은 "비즈니스 요구사항에 따라 다르다"입니다.
- 하지만 이 선택에 따라 우리는 `UNION`과 `UNION ALL` 중 무엇을 쓸지 결정해야 합니다.

### 3.2 UNION과 UNION ALL의 차이

- `UNION`과 `UNION ALL`의 유일한 차이점은 '중복 처리' 여부입니다.

| 구분 | 동작 방식 |
|------|----------|
| **UNION** | 두 결과 집합을 합친 후, **중복된 행을 제거**합니다. |
| **UNION ALL** | 중복 제거 과정 없이, 두 결과 집합을 **그대로 모두 합칩니다**. |

### 3.3 UNION 사용 시 (중복 제거)

```sql
-- 전자기기 구매 고객
SELECT u.name, u.email
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
INNER JOIN products p ON o.product_id = p.product_id
WHERE p.category = '전자기기'
UNION
-- 서울 거주 고객
SELECT name, email
FROM users
WHERE address LIKE '서울%';
```

**그룹별 고객**

- **전자기기 구매 고객**: 션, 마리 퀴리, 네이트, 네이트(중복), 이순신
- **서울 거주 고객**: 션, 세종대왕, 마리 퀴리
- **중복 고객**: 션, 네이트(중복), 마리 퀴리

**실행 결과**

| name | email |
|------|-------|
| 션 | sean@example.com |
| 마리 퀴리 | marie@example.com |
| 네이트 | nate@example.com |
| 이순신 | sunsin@example.com |
| 세종대왕 | sejong@example.com |

- 총 5명의 고유한 고객 목록이 생성되었습니다.
- 중복된 '션'과 '네이트', '마리 퀴리'는 한 번씩만 포함되었습니다.

### 3.4 UNION ALL 사용 시 (중복 허용)

```sql
-- 전자기기 구매 고객
SELECT u.name, u.email
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
INNER JOIN products p ON o.product_id = p.product_id
WHERE p.category = '전자기기'
UNION ALL
-- 서울 거주 고객
SELECT name, email
FROM users
WHERE address LIKE '서울%';
```

**실행 결과**

| name | email |
|------|-------|
| 션 | sean@example.com |
| 마리 퀴리 | marie@example.com |
| 네이트 | nate@example.com |
| 네이트 | nate@example.com |
| 이순신 | sunsin@example.com |
| 션 | sean@example.com |
| 세종대왕 | sejong@example.com |
| 마리 퀴리 | marie@example.com |

- `UNION ALL`은 각 `SELECT` 문의 결과를 그대로 모두 이어 붙입니다.
- '전자기기' 구매 내역은 총 5건(네이트 2건 포함)이고, '서울' 거주 고객은 3명이므로 총 8개의 행이 반환됩니다.
- 결과를 보면 '션', '네이트', '마리 퀴리'가 중복되어 나타나는 것을 확인할 수 있습니다.

### 3.5 실무 가이드: 성능이 핵심이다

**결론부터 말하면, `UNION ALL`이 `UNION`보다 훨씬 빠릅니다.**

:::tip[성능 차이의 이유]

**UNION**

- 두 결과를 합친 뒤, 중복을 제거하기 위해 데이터베이스는 보이지 않는 곳에서 추가 작업을 해야 합니다.
- 보통 전체 결과를 정렬(Sort)한 다음, 서로 인접한 행들을 비교하여 중복을 찾아내는 과정을 거칩니다.
- 데이터의 양이 수십만, 수백만 건이라면 이 정렬과 비교 작업은 엄청난 비용과 시간을 소모합니다.

**UNION ALL**

- 이런 추가 작업이 전혀 없습니다.
- 그냥 첫 번째 `SELECT` 결과 아래에 두 번째 `SELECT` 결과를 가져다 붙이기만 하면 됩니다.

:::

**실무 가이드라인**

1. **중복을 제거해야만 하는 명확한 요구사항이 있을 때만 `UNION`을 사용합니다.**
   - 예: 고유한 이메일 주소 목록, 고유한 고객 ID 목록 등
2. **그 외의 모든 경우에는 `UNION ALL`을 우선적으로 사용합니다.**
   - 두 결과 집합에 중복이 발생할 수 없다는 것을 명확히 아는 경우
   - 중복이 발생해도 비즈니스 로직상 상관없는 경우

:::note[핵심 실무 팁]
**"중복을 제거할 필요가 없다면, 항상 `UNION ALL`을 사용하자"**
불필요한 `UNION` 사용은 쿼리를 느리게 만드는 주범이 될 수 있습니다.
:::

## 4. UNION 정렬

- `UNION` 또는 `UNION ALL`을 사용하여 여러 `SELECT` 문의 결과를 합칠 때, 최종 결과 집합에 대해 정렬(Sorting)을 적용할 수 있습니다.
- 이때 `ORDER BY` 절의 위치가 중요합니다.

### 4.1 ORDER BY 위치 규칙

- `ORDER BY` 절은 **전체 `UNION` 연산의 가장 마지막에 한 번만** 사용해야 합니다.
- 만약 각 `SELECT` 문 안에 `ORDER BY`를 사용하면 에러가 발생하거나, 예상과 다른 결과가 나올 수 있습니다.
- 왜냐하면 `UNION`은 각 `SELECT` 문의 개별적인 정렬 순서가 아니라, 합쳐진 최종 결과 전체에 대한 순서를 결정해야 하기 때문입니다.

### 4.2 기본 정렬 예제

**활동 고객과 탈퇴 고객의 명단을 합친 후, 이름(name)을 기준으로 오름차순 정렬**

```sql
SELECT name, email FROM users
UNION
SELECT name, email FROM retired_users
ORDER BY name; -- 최종 결과에 대한 정렬
```

**실행 결과**

| name | email |
|------|-------|
| 네이트 | nate@example.com |
| 레오나르도 다빈치 | vinci@example.com |
| 마리 퀴리 | marie@example.com |
| 세종대왕 | sejong@example.com |
| 션 | sean@example.com |
| 아이작 뉴턴 | newton@example.com |
| 이순신 | sunsin@example.com |

- `ORDER BY` 절을 `UNION` 연산자의 마지막에 배치함으로써, 합쳐진 모든 고객의 이름이 글자 순서대로 깔끔하게 정렬된 것을 확인할 수 있습니다.

### 4.3 UNION에 나오지 않는 필드를 사용한다면?

:::warning[ORDER BY 컬럼 제약]

`UNION` 또는 `UNION ALL` 연산의 `ORDER BY` 절에서는 **첫 번째 `SELECT` 문의 컬럼 이름이나 해당 컬럼의 별칭(Alias)만 사용할 수 있습니다.**

이는 `UNION` 결과 집합의 컬럼 이름이 첫 번째 `SELECT` 문을 따르기 때문입니다.

:::

**컬럼 이름이 다른 경우**

```sql
SELECT name, email, created_at FROM users -- created_at
UNION ALL
SELECT name, email, retired_date FROM retired_users; -- retired_date
```

**실행 결과**

| name | email | created_at |
|------|-------|------------|
| 션 | sean@example.com | ... |
| 네이트 | nate@example.com | ... |
| 세종대왕 | sejong@example.com | ... |
| 이순신 | sunsin@example.com | ... |
| 마리 퀴리 | marie@example.com | ... |
| 레오나르도 다빈치 | vinci@example.com | ... |
| 션 | sean@example.com | ... |
| 아이작 뉴턴 | newton@example.com | ... |

- 첫 번째 `SELECT` 문은 `created_at`, 두 번째 `SELECT` 문은 `retired_date`를 사용했습니다.
- 실행 결과를 보면 컬럼 이름에 `created_at`이 들어가 있는 것을 확인할 수 있습니다.
- 만약 첫 번째 `SELECT` 문에 없는 컬럼을 `ORDER BY` 절에서 사용하려고 하면 에러가 발생합니다.

**오류 예시**

```sql
SELECT name, email, created_at FROM users
UNION ALL
SELECT name, email, retired_date FROM retired_users
ORDER BY retired_date; -- 첫 번째 SELECT 문에 없는 컬럼
```

**실행 결과**

```
Error Code: 1054. Unknown column 'retired_date' in 'order clause'
```

### 4.4 별칭을 사용하기

- `created_at`, `retired_date`과 같이 이름이 다른 컬럼이 있다면 별칭을 사용하는 것을 권장합니다.
- 나중에 쿼리를 다시 보거나 다른 개발자가 볼 때, `created_at`이라는 이름만으로는 `retired_date`도 포함하여 정렬된다는 사실을 즉시 파악하기 어려울 수 있기 때문입니다.
- `event_date`와 같은 중립적인 별칭은 해당 컬럼이 여러 종류의 날짜 정보를 담고 있음을 명확하게 보여줍니다.

```sql
SELECT name, email, created_at AS event_date FROM users
UNION ALL
SELECT name, email, retired_date AS event_date FROM retired_users
ORDER BY event_date DESC; -- 별칭을 사용하여 정렬
```

**실행 결과**

| name | email | event_date |
|------|-------|------------|
| 션 | sean@example.com | ... |
| 네이트 | nate@example.com | ... |
| 세종대왕 | sejong@example.com | ... |
| 이순신 | sunsin@example.com | ... |
| 마리 퀴리 | marie@example.com | ... |
| 레오나르도 다빈치 | vinci@example.com | ... |
| 아이작 뉴턴 | newton@example.com | ... |
| 션 | sean@example.com | ... |

## 5. 문제와 풀이

### 5.1 문제1: 전체 고객 목록 조회하기

**문제**

- 우리 쇼핑몰의 모든 고객(활동 고객과 탈퇴 고객)의 이름과 이메일을 중복 없이 조회하여 하나의 목록으로 만들어라.

**실행 결과**

| 이름 | 이메일 |
|------|-------|
| 션 | sean@example.com |
| 네이트 | nate@example.com |
| 세종대왕 | sejong@example.com |
| 이순신 | sunsin@example.com |
| 마리 퀴리 | marie@example.com |
| 레오나르도 다빈치 | vinci@example.com |
| 아이작 뉴턴 | newton@example.com |

**정답**

```sql
SELECT name AS 이름, email AS 이메일
FROM users
UNION
SELECT name, email
FROM retired_users;
```

### 5.2 문제2: 특별 이벤트 대상자 목록 만들기 (중복 포함)

**문제**

- 마케팅팀에서 두 그룹의 고객에게 이벤트를 진행하려고 합니다.
  1. '전자기기' 카테고리 상품을 한 번이라도 구매한 고객
  2. 한 번의 주문으로 상품을 2개 이상 구매한 고객
- 두 그룹에 모두 해당하는 고객도 있을 수 있습니다.
- 성능을 고려하여, 두 그룹의 목록을 **중복 제거 없이** 모두 합쳐서 조회해라.
- 컬럼 별칭은 `고객명`, `이메일`로 지정합니다.

**실행 결과**

| 고객명 | 이메일 |
|------|-------|
| 션 | sean@example.com |
| 마리 퀴리 | marie@example.com |
| 네이트 | nate@example.com |
| 이순신 | sunsin@example.com |
| 션 | sean@example.com |
| 네이트 | nate@example.com |

**정답**

```sql
-- 전자기기 구매 고객
SELECT DISTINCT u.name AS 고객명, u.email AS 이메일
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
INNER JOIN products p ON o.product_id = p.product_id
WHERE p.category = '전자기기'
UNION ALL
-- 한 번에 2개 이상 구매한 고객
SELECT DISTINCT u.name AS 고객명, u.email AS 이메일
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
WHERE o.quantity > 1;
```

### 5.3 문제3: 회사 주요 이벤트 타임라인 만들기

**문제**

- 회사의 주요 이벤트 타임라인을 만들려고 합니다.
- '고객 가입' 이벤트와 '상품 주문' 이벤트를 시간 순서대로 정렬하여 조회해라.
- `users` 테이블의 `created_at`은 '고객 가입' 이벤트로 간주합니다.
- `orders` 테이블의 `order_date`는 '상품 주문' 이벤트로 간주합니다.
- 결과는 `이벤트_날짜`, `이벤트_종류`, `상세_내용` 컬럼으로 구성합니다.
- `상세_내용`에는 고객 가입 시 고객의 이름, 상품 주문 시 상품의 이름을 표시합니다.
- 최신 이벤트가 가장 위에 오도록 내림차순으로 정렬해라.

**실행 결과**

| 이벤트_날짜 | 이벤트_종류 | 상세_내용 |
|------------|------------|----------|
| 2025-08-19 20:33:32 | 고객 가입 | 션 |
| 2025-08-19 20:33:32 | 고객 가입 | 네이트 |
| 2025-08-19 20:33:32 | 고객 가입 | 세종대왕 |
| 2025-08-19 20:33:32 | 고객 가입 | 이순신 |
| 2025-08-19 20:33:32 | 고객 가입 | 마리 퀴리 |
| 2025-08-19 20:33:32 | 고객 가입 | 레오나르도 다빈치 |
| 2025-06-17 12:00:00 | 상품 주문 | 프리미엄 게이밍 마우스 |
| 2025-06-16 18:00:00 | 상품 주문 | 프리미엄 게이밍 마우스 |
| 2025-06-15 11:30:00 | 상품 주문 | 4K UHD 모니터 |
| 2025-06-12 09:00:00 | 상품 주문 | 관계형 데이터베이스 입문 |
| 2025-06-11 14:20:00 | 상품 주문 | 기계식 키보드 |
| 2025-06-10 10:05:00 | 상품 주문 | 관계형 데이터베이스 입문 |
| 2025-06-10 10:00:00 | 상품 주문 | 프리미엄 게이밍 마우스 |

**정답**

```sql
SELECT
    created_at AS 이벤트_날짜,
    '고객 가입' AS 이벤트_종류,
    name AS 상세_내용
FROM users
UNION ALL
SELECT
    o.order_date AS 이벤트_날짜,
    '상품 주문' AS 이벤트_종류,
    p.name AS 상세_내용
FROM orders o
INNER JOIN products p ON o.product_id = p.product_id
ORDER BY 이벤트_날짜 DESC;
```

### 5.4 문제4: 회사 전체 인명록 만들기

**문제**

- 회사의 모든 관련 인물(`users`의 고객과 `employees`의 직원)을 통합한 인명록을 만들어라.
- 결과에는 `이름`, `역할`('고객' 또는 '직원'), `이메일` 컬럼이 포함되어야 합니다.
- 고객의 연락처는 `email` 컬럼을 사용합니다.
- 직원의 연락처는 `name` 컬럼 뒤에 `'@my-shop.com'`을 붙여서 생성합니다.
- 최종 결과는 이름(가나다/알파벳 순)으로 오름차순 정렬해라.

**실행 결과**

| 이름 | 역할 | 이메일 |
|------|------|-------|
| 김회장 | 직원 | 김회장@my-shop.com |
| 네이트 | 고객 | nate@example.com |
| 레오나르도 다빈치 | 고객 | vinci@example.com |
| 마리 퀴리 | 고객 | marie@example.com |
| 박사장 | 직원 | 박사장@my-shop.com |
| 세종대왕 | 고객 | sejong@example.com |
| 션 | 고객 | sean@example.com |
| 이부장 | 직원 | 이부장@my-shop.com |
| 이순신 | 고객 | sunsin@example.com |
| 정대리 | 직원 | 정대리@my-shop.com |
| 최과장 | 직원 | 최과장@my-shop.com |
| 홍사원 | 직원 | 홍사원@my-shop.com |

**정답**

```sql
SELECT
    name AS 이름,
    '고객' AS 역할,
    email AS 이메일
FROM users
UNION ALL
SELECT
    name AS 이름,
    '직원' AS 역할,
    CONCAT(name, '@my-shop.com') AS 이메일
FROM employees
ORDER BY 이름;
```

## 6. 정리

### 6.1 핵심 요약

**UNION**

- `JOIN`이 테이블을 수평으로 붙여 컬럼을 늘리는 기술이라면 `UNION`은 여러 결과 집합을 수직으로 붙여 행을 늘리는 기술입니다.
- 흩어져 있는 데이터를 하나의 집합으로 모으는 데 사용합니다.
- `UNION`으로 연결하는 모든 `SELECT` 문은 컬럼 개수가 같고 같은 위치의 컬럼은 호환 가능한 데이터 타입이어야 합니다.
- 최종 결과의 컬럼 이름은 첫 번째 `SELECT` 문의 컬럼 이름을 따릅니다.
- 두 결과 집합을 합친 뒤 중복되는 행은 자동으로 제거하여 고유한 값만 남깁니다.

**UNION ALL**

- `UNION`과 `UNION ALL`의 유일한 차이점은 중복 처리 여부입니다.
- `UNION`은 중복된 행을 제거하지만 `UNION ALL`은 중복 제거 없이 결과 집합을 그대로 모두 합칩니다.
- 성능은 `UNION ALL`이 `UNION`보다 훨씬 빠릅니다.
- `UNION`은 중복 제거를 위해 정렬과 비교 작업을 추가로 수행하기 때문입니다.
- 중복을 명확히 제거해야 하는 경우가 아니라면 성능을 위해 항상 `UNION ALL`을 우선적으로 사용하는 것이 좋습니다.

**UNION 정렬**

- `UNION`으로 합친 최종 결과 집합을 정렬하려면 `ORDER BY` 절을 전체 쿼리의 가장 마지막에 한 번만 사용해야 합니다.
- `ORDER BY` 절에서는 첫 번째 `SELECT` 문의 컬럼 이름이나 별칭만 사용할 수 있습니다.
- 첫 번째 `SELECT` 문에 없는 컬럼을 기준으로 정렬하면 오류가 발생합니다.
- 서로 다른 이름의 컬럼을 합쳐 정렬할 때는 별칭을 사용하는 것을 권장합니다.


