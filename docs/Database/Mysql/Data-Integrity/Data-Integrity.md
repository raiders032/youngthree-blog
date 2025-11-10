---
title: "Data Integrity"
description: "MySQL 데이터 무결성 완벽 가이드 - NOT NULL, UNIQUE, PRIMARY KEY, FOREIGN KEY, CHECK 제약 조건을 통한 데이터 정확성과 일관성 보장"
keywords: ["MySQL", "Data Integrity", "Constraints", "Foreign Key", "CHECK", "NOT NULL", "UNIQUE"]
tags: ["Database", "MySQL", "Data Integrity", "Constraints"]
hide_title: true
last_update:
  date: 2025-10-22
  author: youngthree
---

## 1. 데이터 무결성이 중요한 이유

-  데이터베이스의 가장 근본적이고 중요한 역할은 데이터를 **'안전하게 지키고 관리하는 것'**입니다.

### 1.1 쓰레기 데이터(Garbage Data)란?

- 어느 날, 당신이 쇼핑몰의 월별 매출 보고서를 뽑았는데, 총매출액이 마이너스(-)로 나왔다고 상상해 보세요.
- 황급히 원본 데이터를 살펴보니, 누군가의 실수 혹은 프로그램 버그로 인해 상품의 가격(`price`)에 음수 값이 들어가 있거나, 주문 수량(`quantity`)에 -1이 입력된 것을 발견했습니다.
- 또 다른 예로, 분명히 우리 쇼핑몰의 전체 고객은 5명인데, `orders` 테이블에는 존재하지도 않는 `user_id` 99번 고객의 주문 기록이 남아있습니다.
- 이런 말도 안 되는 데이터, 현실 세계에서는 결코 존재할 수 없는 데이터를 우리는 **'쓰레기 데이터(Garbage Data)'**라고 부릅니다.

:::info[Garbage In, Garbage Out (GIGO)]

컴퓨터 과학에는 아주 유명한 격언이 있습니다.

**"Garbage In, Garbage Out (GIGO)"**

쓰레기가 들어가면, 쓰레기가 나온다는 뜻입니다. 잘못된 데이터가 데이터베이스에 저장되는 순간, 그 데이터를 기반으로 한 모든 분석, 보고서, 그리고 애플리케이션의 동작은 신뢰를 잃고 심각한 오류를 야기하게 됩니다.

:::

### 1.2 쓰레기 데이터가 초래하는 재앙

#### 잘못된 비즈니스 결정

- 매출액이 음수로 찍힌 보고서를 믿고 다음 달 사업 계획을 세울 수는 없습니다.

#### 치명적인 시스템 오류

- 애플리케이션 코드는 상품 가격이 항상 양수일 것이라고 가정하고 만들어졌는데, 음수 가격을 마주치는 순간 예외를 발생시키며 멈춰버릴 수 있습니다.

#### 데이터 불일치

- `users` 테이블에서는 탈퇴한 고객을 삭제했는데, `orders` 테이블에는 그 고객의 주문 기록이 그대로 남아 '주인 없는 주문'이라는 유령 데이터가 되어 떠돌아다닙니다.

### 1.3 데이터를 지키는 최후의 보루

- 그렇다면 이 쓰레기 데이터가 애초에 데이터베이스에 저장되지 못하도록 막을 책임은 누구에게 있을까요?
- 물론 데이터를 입력하는 애플리케이션(웹사이트, 앱 등)에서 1차적으로 검증해야 합니다.
- 하지만 그것만으로는 충분하지 않습니다.
  - 애플리케이션에 미처 발견하지 못한 버그가 있을 수 있습니다.
  - 여러 다른 종류의 애플리케이션이 하나의 데이터베이스에 접근할 수도 있습니다.
  - 개발자나 관리자가 데이터베이스에 직접 접속해서 데이터를 수정할 수도 있습니다.
- 따라서 우리는 데이터베이스를 **데이터를 지키는 최후의 보루**로 만들어야 합니다.
- 어떤 경로로 데이터 변경 요청이 들어오든, 데이터베이스 스스로가 말도 안 되는 값은 거부하고 데이터의 정확성과 일관성을 지킬 수 있도록 규칙을 설정해야 합니다.

### 1.4 데이터 무결성(Data Integrity)

- 이렇게 **데이터의 정확성, 일관성, 유효성을 유지하려는 성질**을 **데이터 무결성(Data Integrity)**이라고 부릅니다.
- 그리고 이 데이터 무결성을 강제하기 위해, 테이블의 특정 컬럼에 설정하는 규칙이 바로 **제약 조건(Constraints)**입니다.

### 1.5 제약 조건(Constraints)의 역할

- 제약 조건은 테이블에 데이터를 `INSERT`, `UPDATE`, `DELETE` 할 때, "이 규칙을 어기면 절대 안 돼!" 라고 외치는 문지기와 같습니다.
  - `price` 컬럼에는 0 이상의 값만 받도록 규칙을 정하고, 음수 값을 넣으려는 시도는 거부합니다.
  - `email` 컬럼에는 중복된 값이 들어올 수 없도록 규칙을 정하고, 이미 가입된 이메일은 거부합니다.
  - `orders` 테이블의 `user_id`는 반드시 `users` 테이블에 존재하는 `user_id` 값만 받도록 규칙을 정하고, 유령 회원의 주문은 거부합니다.
- 제약 조건을 잘 설정해 둔 데이터베이스는 애플리케이션의 버그나 사용자의 실수로부터 데이터를 지켜내는 튼튼한 성벽이 됩니다.

## 2. 기본 제약 조건

- 데이터의 정확성과 일관성, 즉 '데이터 무결성'을 지키기 위해 제약 조건이라는 규칙이 왜 필요한지에 대해 배웠습니다.
- 제약 조건은 데이터베이스에 '쓰레기 데이터'가 들어오는 것을 막는 최후의 보루 역할을 합니다.
- 우리는 이미 테이블을 처음 만들 때 `NOT NULL`, `UNIQUE`, `PRIMARY KEY` 같은 몇몇 제약 조건들을 사용해왔습니다.
- 이번 시간에는 이 제약 조건들이 각각 어떤 종류의 무결성을, 어떻게 지켜주는지 그 역할을 알아보겠습니다.

### 2.1 NOT NULL: NULL 값 방지

- **역할**: 해당 컬럼에 `NULL` 값(값이 없는 상태)이 저장되는 것을 허용하지 않습니다. 반드시 필요한 정보가 누락되는 것을 막습니다.
- **문법 예시**: `email VARCHAR(255) NOT NULL`

#### 위반 시나리오

- 회원 가입 시 필수 정보인 이메일을 실수로 `NULL`로 입력하려고 시도해 보겠습니다.

```sql
-- 이메일(NOT NULL)에 NULL 값을 입력 시도 (에러 발생)
INSERT INTO users (name, email) VALUES ('냐옹이', NULL);
```

**실행 결과 에러**

```
Error Code: 1048. Column 'email' cannot be null
```

- 데이터베이스는 `email` 컬럼은 `NULL`일 수 없다는 명확한 에러 메시지를 반환하며, 이 `INSERT` 명령을 거부합니다.
- 이렇게 `NOT NULL` 제약 조건은 필수 데이터의 누락을 원천적으로 차단합니다.

### 2.2 UNIQUE: 중복 값 방지

- **역할**: 해당 컬럼에 들어가는 모든 값은 테이블 내에서 반드시 고유해야(unique) 합니다. 중복 데이터가 쌓이는 것을 막습니다.
- **문법 예시**: `email VARCHAR(255) UNIQUE`

#### 위반 시나리오

- 이미 가입된 이메일 주소('sean@example.com')로 다른 사람이 또 가입을 시도하는 상황입니다.

```sql
-- 이메일(UNIQUE)에 중복 값을 입력 시도 (에러 발생)
INSERT INTO users (name, email, address) VALUES ('가짜 션', 'sean@example.com', '서울시 어딘가');
```

**실행 결과 에러**

```
Error Code: 1062. Duplicate entry 'sean@example.com' for key 'users.email'
```

- 데이터베이스는 'sean@example.com'이라는 값이 `users.email` 키에 대해 중복되었다는 에러와 함께 `INSERT`를 거부합니다.

### 2.3 PRIMARY KEY: 행의 대표 식별자

- **역할**: 테이블의 각 행을 고유하게 식별할 수 있는 단 하나의 대표 키입니다. `NOT NULL`과 `UNIQUE` 제약 조건의 특징을 모두 포함합니다.
- 즉, 기본 키 컬럼은 절대 `NULL`일 수 없으며, 절대 중복될 수 없습니다.
- **특징**: 테이블당 오직 하나만 설정할 수 있으며, 이 기본 키를 기준으로 데이터가 저장되고 검색되므로 성능에도 매우 중요한 역할을 합니다.
- MySQL은 기본 키에 자동으로 고성능 인덱스를 생성합니다.
- **문법 예시**: `user_id BIGINT PRIMARY KEY`

#### 위반 시나리오

- 이미 존재하는 `user_id` 1번으로 새로운 데이터를 삽입하려고 하거나, `id`를 `NULL`로 삽입하려고 시도해 보겠습니다.

```sql
-- 기본 키(PRIMARY KEY)에 중복 값을 입력 시도 (에러 발생)
INSERT INTO users (user_id, name, email) VALUES (1, '누군가', 'someone@example.com');
```

**실행 결과 에러**

```
Error Code: 1062. Duplicate entry '1' for key 'users.PRIMARY'
```

:::note[AUTO_INCREMENT와 NULL]

참고로 `users` 테이블의 `user_id`는 `AUTO_INCREMENT`를 사용했습니다. 따라서 자동 증가하는 값이기 때문에 `NULL`을 입력해도 값이 자동으로 입력됩니다. 만약 `AUTO_INCREMENT`가 아니라면 PK에 `NULL`을 입력하면 오류가 발생합니다.

:::

### 2.4 DEFAULT: 기본값 설정

- **역할**: 특정 컬럼에 값을 명시적으로 입력하지 않았을 경우, 자동으로 설정될 기본값을 지정합니다.
- 엄밀히 말해 무결성을 '강제'하는 규칙이라기보다는, 데이터 누락을 방지하고 입력을 편리하게 해주는 기능에 가깝습니다.
- **문법 예시**: `status VARCHAR(50) DEFAULT 'PENDING'`

#### 주문 테이블 DDL

```sql
CREATE TABLE orders (
  order_id BIGINT AUTO_INCREMENT,
  ...
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, SHIPPED, CANCELLED
  ...
);
```

#### 활용 시나리오

- `orders` 테이블에 주문을 추가할 때, 주문 상태(`status`)를 따로 지정하지 않으면 기본값인 'PENDING'으로 자동 설정됩니다.

```sql
-- status 컬럼을 생략하고 INSERT
INSERT INTO orders (user_id, product_id, quantity) VALUES (2, 2, 1);
```

- 이제 방금 넣은 데이터를 조회해 보겠습니다.

```sql
SELECT * FROM orders ORDER BY order_id DESC LIMIT 1;
```

**실행 결과**

| order_id | user_id | product_id | order_date | quantity | status  |
|----------|---------|------------|------------|----------|---------|
| 8        | 2       | 2          | ...        | 1        | PENDING |

:::note[order_id 값]

`order_id` 값은 자동 증가하는 값이므로 다른 값이 나타날 수 있습니다.

:::

- `status` 컬럼에 우리가 지정한 기본값인 'PENDING'이 자동으로 들어간 것을 확인할 수 있습니다.
- 지금까지 배운 제약 조건들은 모두 **하나의 테이블 내부**에서 데이터의 유효성을 지키는 규칙들이었습니다.
- 하지만 데이터베이스의 핵심은 '관계'이며, 이 관계는 여러 테이블에 걸쳐 있습니다.
- `orders` 테이블의 `user_id`는 반드시 `users` 테이블에 존재하는 값이어야만 합니다.

## 3. 외래 키 제약 조건

- `NOT NULL`, `UNIQUE`, `PRIMARY KEY`는 모두 하나의 테이블 안에서 데이터의 유효성을 지키는 규칙들이었습니다.
- 하지만 데이터베이스의 진정한 힘은 '관계'에 있고, 이 관계는 여러 테이블에 걸쳐서 맺어집니다.

### 3.1 참조 무결성(Referential Integrity)

- 여기서 가장 중요한 무결성 원칙, **참조 무결성(Referential Integrity)**이 등장합니다.
- 참조 무결성이란, **두 테이블의 관계가 항상 유효하고 일관된 상태를 유지해야 한다**는 원칙입니다.
- 예를 들어, `orders` 테이블의 `user_id` 컬럼은 반드시 `users` 테이블에 실제로 존재하는 `user_id` 값만을 참조해야 합니다.
- 만약 존재하지도 않는 유령 회원의 주문이 있다면, 이 관계는 깨진 것입니다.
- 이러한 테이블 간의 관계 무결성을 강제하는 가장 강력한 제약 조건이 바로 **외래 키(Foreign Key)**입니다.

### 3.2 외래 키(FK)의 역할: 유령 데이터를 막아라

- 외래 키 제약 조건은 두 가지 중요한 규칙을 통해 우리의 데이터를 보호합니다.
  1. **자식 테이블(`orders`)에 `INSERT`, `UPDATE` 할 때**: 부모 테이블(`users`)에 존재하지 않는 `user_id` 값을 자식 테이블(`orders`)의 `user_id` 컬럼에 넣으려는 시도를 막습니다. (유령 주문 생성 방지)
  2. **부모 테이블(`users`)에서 `DELETE`, `UPDATE` 할 때**: 자식 테이블(`orders`)에서 참조하고 있는 `user_id` 값을 가진 행을 함부로 삭제하거나 변경하지 못하게 막습니다. (기존 주문을 유령 주문으로 만드는 것 방지)

### 3.3 위반 시나리오

- 우리 테이블에는 이미 외래 키가 설정되어 있습니다. 이 규칙을 직접 위반해 보겠습니다.

#### 1. 유령 주문 생성 시도

- 존재하지 않는 `user_id`인 999번 고객의 주문을 넣어보겠습니다.

```sql
-- 존재하지 않는 user_id(999)로 주문을 생성 시도 (에러 발생)
INSERT INTO orders (user_id, product_id, quantity) VALUES (999, 1, 1);
```

**실행 결과 에러**

```
Error Code: 1452. Cannot add or update a child row: a foreign key constraint
fails (`my_shop2`.`orders`, CONSTRAINT `fk_orders_users` FOREIGN KEY
(`user_id`) REFERENCES `users` (`user_id`))
```

- 데이터베이스는 `fk_orders_users` 외래 키 제약 조건이 실패했다는 명확한 에러를 출력하며, 이 `INSERT`를 거부했습니다.

#### 2. 주문이 있는 고객 삭제 시도

- '션' 고객(`user_id`=1)은 이미 주문 기록이 있습니다.
- `orders` 테이블의 '션' 고객(`user_id`=1)의 주문

```sql
SELECT * FROM orders WHERE user_id = 1;
```

| order_id | user_id | product_id | order_date          | quantity | status    |
|----------|---------|------------|---------------------|----------|-----------|
| 1        | 1       | 1          | 2025-06-10 10:00:00 | 1        | COMPLETED |
| 2        | 1       | 4          | 2025-06-10 10:05:00 | 2        | COMPLETED |

- 이 고객을 `users` 테이블에서 삭제하려고 시도해 보겠습니다.

```sql
-- 자식 테이블(orders)에서 참조하고 있는 부모 데이터(users)를 삭제 시도 (에러 발생)
DELETE FROM users WHERE user_id = 1;
```

**실행 결과 에러**

```
Error Code: 1451. Cannot delete or update a parent row: a foreign key
constraint fails (`my_shop2`.`orders`, CONSTRAINT `fk_orders_users` FOREIGN
KEY (`user_id`) REFERENCES `users` (`user_id`))
```

- 역시나 데이터베이스는 이 고객을 참조하는 주문이 있기 때문에 삭제할 수 없다는 오류를 발생시키며 삭제를 막습니다.
- 만약 이 삭제 쿼리가 성공한다면 `orders` 테이블에는 '션' 고객(`user_id`=1)의 주문이 남아있지만, `users` 테이블의 션은 제거됩니다.
- 결과적으로 주문 내역만 있고, 실제 고객은 사라지는 심각한 문제가 발생합니다. 그리고 향후 이 주문이 누구의 주문인지 찾을 수 없게 됩니다.

:::tip[올바른 삭제 순서]

만약 부모 테이블의 션(`user_id = 1`) 데이터를 삭제하고 싶다면 다음과 같이 자식 테이블의 션 관련 데이터를 먼저 삭제하고, 이후에 부모 테이블을 삭제하는 순서로 진행해야 합니다.

```sql
DELETE FROM orders WHERE user_id = 1; -- 1.자식 테이블의 션(user_id = 1) 관련 데이터 제거
DELETE FROM users WHERE user_id = 1;  -- 2.부모 테이블의 션(user_id = 1) 관련 데이터 제거
```

:::

### 3.4 ON DELETE / ON UPDATE 옵션

- 데이터베이스가 부모 데이터의 삭제나 수정을 무조건 막는 것이 기본값(`RESTRICT`)이며 가장 안전한 정책입니다.
- 하지만 때로는 비즈니스 규칙에 따라 다른 정책이 필요할 수 있습니다.
- 예를 들어 "회원이 탈퇴하면, 그 회원의 모든 주문 기록도 함께 삭제되어야 한다"와 같은 경우입니다.
- 이럴 때 사용하는 것이 외래 키의 `ON DELETE`와 `ON UPDATE` 옵션입니다.
  - **`RESTRICT` (기본값)**: 자식 테이블에 참조하는 행이 있으면 부모 테이블의 행을 삭제/수정할 수 없습니다. (방금 확인한 동작)
  - **`CASCADE`**: 부모 테이블의 행이 삭제/수정되면, 그를 참조하는 자식 테이블의 행도 **함께 자동으로** 삭제/수정됩니다.
  - **`SET NULL`**: 부모 테이블의 행이 삭제/수정되면, 자식 테이블의 해당 외래 키 컬럼의 값을 `NULL`로 설정합니다. (단, 이 옵션을 쓰려면 자식 테이블의 외래 키 컬럼이 `NULL`을 허용해야 합니다.)

### 3.5 ON DELETE CASCADE 실습

- `CASCADE` 옵션의 강력한 힘을 직접 확인해 보겠습니다.
- 기존 `orders` 테이블을 삭제하고, `ON DELETE CASCADE` 옵션을 추가하여 다시 만들어 보겠습니다.

```sql
-- 실습을 위해 기존 테이블 삭제 후 CASCADE 옵션으로 재생성
DROP TABLE orders;

CREATE TABLE orders (
  order_id BIGINT AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  quantity INT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  PRIMARY KEY (order_id),
  CONSTRAINT fk_orders_users FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE, -- CASCADE 옵션 추가
  CONSTRAINT fk_orders_products FOREIGN KEY (product_id)
    REFERENCES products(product_id)
);

-- 션 회원 다시 등록
INSERT INTO users(user_id, name, email, address, birth_date) VALUES
(1, '션', 'sean@example.com', '서울시 강남구', '1990-01-15');

-- 주문 데이터 다시 입력
INSERT INTO orders(user_id, product_id, quantity, status) VALUES
(1, 1, 1, 'COMPLETED'),
(1, 4, 2, 'COMPLETED'),
(2, 2, 1, 'SHIPPED');
```

:::note[데이터 상태 확인]

앞서 user_id = 1 션 회원을 삭제했다면, 스크립트를 참고해서 먼저 션 회원을 다시 등록하세요. 만약 user_id = 1 션 회원을 삭제하지 않았다면 "션 회원 다시 등록" 스크립트는 실행하지 마세요.

:::

- 새로 저장한 주문 데이터를 확인해 보겠습니다.

```sql
SELECT * FROM orders;
```

| order_id | user_id | product_id | order_date          | quantity | status    |
|----------|---------|------------|---------------------|----------|-----------|
| 1        | 1       | 1          | 2025-06-30 11:12:23 | 1        | COMPLETED |
| 2        | 1       | 4          | 2025-06-30 11:12:23 | 2        | COMPLETED |
| 3        | 2       | 2          | 2025-06-30 11:12:23 | 1        | SHIPPED   |

- '션' 고객(`user_id`=1)의 주문이 2건 있는 것을 확인할 수 있습니다. (`order_id:1,2`)
- 이제 다시, 주문 기록이 있는 '션' 고객(`user_id`=1)을 삭제해 보겠습니다.

```sql
DELETE FROM users WHERE user_id = 1;
```

- 이번에는 아무 에러 없이 쿼리가 성공적으로 실행됩니다.
- 과연 `orders` 테이블은 어떻게 변했을까요? 전체 주문 기록을 조회해 보겠습니다.

```sql
SELECT * FROM orders;
```

| order_id | user_id | product_id | order_date          | quantity | status  |
|----------|---------|------------|---------------------|----------|---------|
| 3        | 2       | 2          | 2025-06-30 11:12:23 | 1        | SHIPPED |

- `users` 테이블에서 `user_id` 1번 고객을 삭제하자, 그를 참조하던 `orders` 테이블의 주문 기록들이 연쇄적으로 함께 삭제된 것을 확인할 수 있습니다. (`order_id:1,2` 제거)
- `CASCADE` 옵션은 매우 편리하지만, 의도치 않은 대량의 데이터 삭제를 유발할 수 있으므로 반드시 비즈니스 로직을 명확히 이해하고 신중에 신중을 기해서 사용해야 합니다.

:::warning[CASCADE - 실무 이야기]

`CASCADE` 옵션은 분명 편리한 기능이지만, 잘못 사용할 경우 예상치 못한 대량의 데이터가 함께 삭제되는 경우가 있습니다. 특히 관계가 복잡하게 얽혀 있는 경우에는 파급 효과를 예측하기 어렵습니다. 이런 문제로 실무에서는 `CASCADE` 옵션은 잘 사용하지 않습니다. 대신에 **애플리케이션 계층에서 명시적으로 관련된 데이터를 처리하는 방식**이 더 선호됩니다.

:::

- 외래 키는 테이블 간의 관계를 정의하는 것을 넘어, 그 관계가 항상 올바른 상태를 유지하도록 강제하는 데이터베이스의 핵심적인 무결성 장치입니다.

## 4. CHECK 제약 조건

- 지금까지 우리는 데이터의 존재 여부(`NOT NULL`), 유일성(`UNIQUE`), 테이블 간의 관계(`FOREIGN KEY`) 등 데이터의 '구조'와 '관계'에 대한 무결성을 지키는 제약 조건들을 배웠습니다.
- 하지만 아직 해결하지 못한 문제가 남아있습니다. 데이터의 **'내용'** 자체에 대한 규칙은 어떻게 적용할까요?
- 예를 들어,
  - 상품의 가격(`price`)이나 재고 수량(`stock_quantity`)은 절대 음수일 수 없습니다.
  - 할인율(`discount_rate`)은 0%에서 100% 사이의 값이어야 합니다.
- `NOT NULL` 제약 조건은 가격에 `-5000`이라는 값이 들어오는 것을 막지 못합니다.
- `UNIQUE` 제약 조건은 할인율이 `200`이 되는 것을 막지 못합니다.
- 이런 값들은 형식적으로는 유효하지만, 비즈니스 논리상으로는 명백한 '쓰레기 데이터'입니다.

### 4.1 CHECK 제약 조건의 역할과 문법

- 이처럼 특정 컬럼에 들어갈 수 있는 값의 범위나 조건을 직접 지정하여, 한층 더 강화된 비즈니스 규칙을 적용하고 싶을 때 사용하는 것이 바로 **`CHECK` 제약 조건**입니다.
- `CHECK` 제약 조건은 특정 컬럼에 대해, `INSERT` 또는 `UPDATE`가 일어날 때마다 지정된 조건식이 '참(`true`)'인지를 검사합니다.
- 만약 조건식이 거짓(`false`)이면, 데이터베이스는 해당 데이터의 입력을 거부하고 에러를 발생시킵니다.
- 문법은 테이블을 생성할 때 컬럼 정의 뒤에 `CHECK (조건식)`을 추가해 주면 됩니다.

### 4.2 CHECK 제약 조건 적용

- 이제 우리 `products` 테이블을 더 튼튼하게 만들기 위해, `CHECK` 제약 조건을 추가하여 다시 설계해 보겠습니다.

```sql
-- 실습을 위해 기존 테이블들을 삭제합니다.
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;

-- CHECK 제약 조건을 추가하여 products 테이블 재생성
CREATE TABLE products (
  product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price INT NOT NULL CHECK (price >= 0),
  stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
  discount_rate DECIMAL(5, 2) DEFAULT 0.00 CHECK (discount_rate BETWEEN 0.00 AND 100.00)
);
```

- `price >= 0`: 가격은 0 이상이어야 합니다.
- `stock_quantity >= 0`: 재고 수량은 0 이상이어야 합니다.
- `discount_rate BETWEEN 0.00 AND 100.00`: 할인율은 0과 100 사이의 값이어야 합니다. (`(discount_rate >= 0 AND discount_rate <= 100)`과 동일)

:::tip[제약 조건 이름 지정하기]

참고로 제약 조건에 이름을 부여하려면 DDL에서 다음과 같은 SQL을 작성하면 됩니다.

```sql
CONSTRAINT products_chk_price CHECK (price >= 0)
```

:::

### 4.3 위반 시나리오

- 이제 이 튼튼해진 `products` 테이블에 잘못된 데이터를 입력하려고 시도하면 어떤 일이 벌어지는지 확인해 보겠습니다.

#### 1. 가격에 음수 입력 시도

```sql
-- 가격(price)에 음수 값을 입력 시도 (에러 발생)
INSERT INTO products (name, category, price, stock_quantity)
VALUES ('오류상품', '전자기기', -5000, 10);
```

**실행 결과 에러**

```
Error Code: 3819. Check constraint 'products_chk_1' is violated.
```

- 데이터베이스가 `products_chk_1`이라는 이름의 `CHECK` 제약 조건(가격은 0 이상)이 위반되었다며, 데이터 입력을 단호하게 거부했습니다.

#### 2. 할인율에 범위를 벗어난 값 입력 시도

```sql
-- 할인율(discount_rate)에 100을 초과하는 값을 입력 시도 (에러 발생)
INSERT INTO products (name, category, price, stock_quantity, discount_rate)
VALUES ('초특가상품', '패션', 50000, 20, 120.00);
```

**실행 결과 에러**

```
Error Code: 3819. Check constraint 'products_chk_3' is violated.
```

- 이번에도 할인율의 범위를 검사하는 `CHECK` 제약 조건이 '문지기' 역할을 훌륭하게 수행했습니다.
- 이처럼 `CHECK` 제약 조건은 애플리케이션 레벨에서 놓칠 수 있는 데이터의 유효성 검사를 데이터베이스가 직접 수행하여, 비즈니스 규칙에 어긋나는 데이터가 저장될 가능성을 원천적으로 차단하는 강력한 수단입니다.

:::info[실무 이야기: 데이터 검증, 어디서 하는 게 좋을까?]

**요즘 대세는 애플리케이션 코드**: 대부분의 비즈니스 로직과 유효성 검사는 애플리케이션에서 직접 처리합니다. 훨씬 유연하고 테스트가 쉽기 때문입니다.

**DB `CHECK` 제약 조건은 신중하게**: 이런 이유로 데이터베이스의 `CHECK` 제약 조건은 잘 사용하지 않는 추세입니다.

**'최후의 방어선'으로 활용**: `CHECK` 제약 조건을 쓴다면, 간단하지만 절대 값이 바뀌면 안 되는 핵심 데이터에만 '최후의 방어선'으로 사용하는 것이 좋습니다.

:::

## 5. 정리

### 5.1 데이터 무결성이 중요한 이유

- 데이터베이스의 가장 중요한 역할은 데이터를 안전하게 지키고 관리하는 것입니다.
- '쓰레기 데이터(Garbage Data)'는 잘못된 비즈니스 결정, 시스템 오류, 데이터 불일치 등 심각한 문제를 야기합니다. (Garbage In, Garbage Out)
- 데이터베이스는 애플리케이션의 버그나 사용자의 실수로부터 데이터를 보호하는 최후의 보루 역할을 해야 합니다.
- 데이터의 정확성, 일관성, 유효성을 유지하려는 성질을 '데이터 무결성(Data Integrity)'이라고 합니다.
- 데이터 무결성을 강제하기 위해 테이블의 특정 컬럼에 설정하는 규칙이 '제약 조건(Constraints)'입니다.

### 5.2 기본 제약 조건

- `NOT NULL`: 컬럼에 `NULL` 값이 저장되는 것을 허용하지 않아 필수 정보의 누락을 방지합니다.
- `UNIQUE`: 해당 컬럼의 모든 값이 테이블 내에서 고유해야 함을 보장하여 중복 데이터가 쌓이는 것을 막습니다.
- `PRIMARY KEY`: 테이블의 각 행을 고유하게 식별하는 대표 키로, `NOT NULL`과 `UNIQUE` 제약 조건의 특징을 모두 포함합니다. 테이블당 하나만 설정할 수 있습니다.
- `DEFAULT`: 특정 컬럼에 값을 명시적으로 입력하지 않았을 경우, 자동으로 설정될 기본값을 지정합니다.

### 5.3 외래 키 제약 조건

- '참조 무결성'은 두 테이블 사이의 관계가 항상 유효하고 일관된 상태를 유지해야 한다는 원칙입니다.
- '외래 키(Foreign Key)'는 이러한 테이블 간의 관계 무결성을 강제하는 가장 강력한 제약 조건입니다.
- 외래 키는 자식 테이블에 존재하지 않는 부모 키 값을 입력하는 것을 막고, 자식 테이블에서 참조하고 있는 부모 데이터를 함부로 삭제하거나 수정하지 못하게 합니다.
- `ON DELETE` / `ON UPDATE` 옵션을 통해 부모 데이터가 변경될 때 자식 데이터가 어떻게 동작할지 정책을 설정할 수 있습니다.
  - `RESTRICT` (기본값): 자식 행이 있으면 부모 행의 변경/삭제를 막습니다.
  - `CASCADE`: 부모 행이 변경/삭제되면, 이를 참조하는 자식 행도 함께 자동 변경/삭제됩니다.
  - `SET NULL`: 부모 행이 변경/삭제되면, 자식 행의 해당 외래 키 컬럼 값을 `NULL`로 설정합니다.
- `CASCADE` 옵션은 편리하지만 의도치 않은 대량 데이터 변경을 유발할 수 있으므로, 실무에서는 비즈니스 로직을 명확히 이해하고 신중하게 사용해야 합니다.

### 5.4 CHECK 제약 조건

- `CHECK` 제약 조건은 컬럼에 들어갈 수 있는 값의 범위나 조건을 직접 지정하여, 데이터의 '내용'에 대한 비즈니스 규칙을 강제합니다.
- `INSERT` 또는 `UPDATE` 시, `CHECK` 조건식이 '참(true)'이 아니면 데이터베이스는 해당 작업을 거부하고 에러를 발생시킵니다.
- 예를 들어 '가격은 0 이상이어야 한다(`price >= 0`)' 또는 '할인율은 0과 100 사이여야 한다(`discount_rate BETWEEN 0 AND 100`)'와 같은 규칙을 적용할 수 있습니다.
- `CHECK` 제약 조건은 애플리케이션 레벨에서 놓칠 수 있는 데이터 유효성 검사를 데이터베이스가 직접 수행하여 데이터 무결성을 강화하는 최후의 수단입니다.