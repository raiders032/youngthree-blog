## 1. 뷰(View) 소개

- 우리는 지난 시간에 `JOIN`과 `CASE` 문, `GROUP BY`를 총동원하여 '카테고리별, 상태별 주문 현황'이라는 매우 유용한 보고서를 만드는 쿼리를 완성했습니다.
  - [JOIN 참고](../SQL/Join/Join.md)
  - [CASE 참고](../SQL/Case/Case.md)

```sql
-- 지난 시간에 만든 복잡하고 유용한 쿼리
SELECT
    p.category,
    COUNT(*) AS total_orders,
    SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_count,
    SUM(CASE WHEN o.status = 'SHIPPED' THEN 1 ELSE 0 END) AS shipped_count,
    SUM(CASE WHEN o.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count
FROM
    orders o
JOIN
    products p ON o.product_id = p.product_id
GROUP BY
    p.category;
```

### 1.1 문제 상황

- 이 쿼리는 매우 유용해서, 우리 쇼핑몰의 재무팀, 마케팅팀, 운영팀에서 매일 아침 확인해야 하는 핵심 지표라고 가정해 봅시다.
- 여기서 오늘의 문제 상황이 발생합니다.

**복잡성**

- 이 쿼리는 너무 길고 복잡합니다.
- SQL에 익숙하지 않은 직원이 이 쿼리를 매번 실수 없이 정확하게 입력하기란 거의 불가능에 가깝습니다.

**재사용성**

- 여러 팀의 여러 사람이 이 쿼리를 사용하려면, 각자 이 긴 쿼리문을 어딘가에 저장해두고 복사-붙여넣기를 해야 합니다.
- 만약 보고서의 로직이 변경되면(예: '반품 완료' 상태 추가), 모든 사람이 각자 저장해 둔 쿼리를 수정해야 하는 끔찍한 상황이 발생합니다.

**보안**

- 이 쿼리를 실행하려면, 사용자는 원본 테이블인 `orders`와 `products`에 직접 접근할 수 있는 권한(`SELECT` 권한)이 있어야 합니다.
- 하지만 운영팀 직원에게는 고객의 개인정보나 상품의 원가 같은 민감한 정보가 담겨있을 수 있는 원본 테이블 전체를 보여주고 싶지 않습니다.
- 딱 이 요약된 보고서 내용만 보게 하고 싶습니다.

### 1.2 해결책

- 왜 우리는 이런 불편함과 위험을 감수해야만 할까요?
- 이 복잡한 쿼리 자체를 데이터베이스에 하나의 '바로 가기'처럼 저장해두고, 필요할 때마다 간단한 이름으로 불러 쓸 수는 없을까요?
- 이 모든 문제를 한 번에 해결해 주는 마법 같은 도구가 바로 **뷰(VIEW)**입니다.

## 2. 뷰(VIEW)의 개념

### 2.1 뷰의 정의

:::info[뷰의 개념]

**뷰(View)는 실제 데이터를 가지고 있지 않은 '가상의 테이블'입니다. 그 실체는 데이터베이스에 이름과 함께 저장된 하나의 `SELECT` 쿼리문입니다.**

:::

- 컴퓨터 바탕화면의 '바로 가기(Shortcut)' 아이콘을 생각하면 쉽습니다.

**바로 가기 아이콘**

- 바로 가기 아이콘은 그 자체로 프로그램 파일이 아닙니다. 단지 실제 프로그램이 어디에 있는지 위치 정보만 담고 있습니다.
- 우리는 복잡한 경로를 찾아 들어갈 필요 없이, 바로 가기 아이콘을 더블클릭하는 것만으로 프로그램을 실행할 수 있습니다.

**뷰도 똑같습니다**

- 뷰는 그 자체로 데이터를 저장하는 테이블이 아닙니다. 단지 복잡한 `SELECT` 쿼리문 자체를 저장하고 있습니다.
- 우리는 복잡한 쿼리를 실행할 필요 없이, `SELECT * FROM 나의_바로가기_뷰;`라는 간단한 명령만으로 그 복잡한 쿼리의 결과를 얻을 수 있습니다.

### 2.2 뷰(VIEW)의 동작 원리

- 사용자가 `v_category_order_status`라는 뷰를 조회하면, 데이터베이스 내부에서는 다음과 같은 일이 일어납니다.

1. 사용자가 `SELECT * FROM v_category_order_status;`라는 쿼리를 실행합니다.
2. 데이터베이스는 `v_category_order_status`라는 이름의 실제 테이블을 찾지 않습니다. 대신, 이 뷰에 정의된(저장된) 원래의 긴 `SELECT` 쿼리문을 찾아냅니다.
3. 데이터베이스는 그 저장된 `SELECT` 쿼리문(우리가 위에서 만든 복잡한 쿼리)을 **그 순간에 실행**합니다.
4. 실행 결과가 사용자에게 반환됩니다. 사용자는 마치 그냥 테이블을 조회한 것처럼 느끼게 됩니다.

:::tip[최신 데이터 유지]
뷰는 데이터를 저장하지 않기 때문에, 우리가 뷰를 조회할 때마다 항상 최신 상태의 원본 테이블(`orders`, `products`)을 기준으로 쿼리가 실행됩니다. 따라서 **뷰의 데이터는 항상 최신 상태를 유지**합니다.
:::

### 2.3 뷰(VIEW)를 사용하는 이유

**1. 편리성**

- 복잡한 쿼리를 단순화하여 쉽게 재사용할 수 있습니다.

**2. 보안성**

- 사용자에게 원본 테이블에 대한 접근 권한을 주지 않고, 뷰를 통해서만 제한된 데이터(특정 행이나 특정 컬럼)에 접근하도록 허용할 수 있습니다.
- 민감한 정보를 숨기는 데 매우 효과적입니다.

**3. 논리적 독립성**

- 만약 나중에 원본 테이블의 구조가 일부 변경되더라도, 뷰의 정의만 수정하면 뷰를 사용하는 응용 프로그램은 코드를 바꿀 필요가 없을 수도 있습니다.
- 뷰가 중간에서 변화를 흡수하는 '추상화 계층' 역할을 하기 때문입니다.

:::note[실무의 핵심 기능]

뷰는 단순히 편의 기능이 아니라, 데이터베이스의 보안과 유지보수성을 크게 향상시키는 실무의 핵심 기능입니다.

:::

## 3. 뷰 생성하기

### 3.1 CREATE VIEW: 뷰 생성하기

- 뷰를 생성하는 명령어는 `CREATE VIEW`입니다.
- 문법은 아주 직관적입니다.

```sql
CREATE VIEW 뷰이름 AS SELECT 쿼리문;
```

### 3.2 뷰 생성 예제

- 이제 이 문법에 따라, 우리의 복잡한 쿼리를 `v_category_order_status`라는 이름의 뷰로 데이터베이스에 저장해 봅시다.
- 뷰 이름 앞에는 `v_`나 `view_` 같은 접두사를 붙여서 다른 테이블과 쉽게 구분할 수 있도록 하는 것이 실무에서 흔히 사용하는 좋은 습관입니다.

```sql
DROP VIEW IF EXISTS v_category_order_status; -- 만약 뷰가 이미 존재한다면 제거

CREATE VIEW v_category_order_status AS
SELECT
    p.category,
    COUNT(*) AS total_orders,
    SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_count,
    SUM(CASE WHEN o.status = 'SHIPPED' THEN 1 ELSE 0 END) AS shipped_count,
    SUM(CASE WHEN o.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count
FROM
    orders o
JOIN
    products p ON o.product_id = p.product_id
GROUP BY
    p.category;
```

- 이 쿼리를 실행하고 나면, 우리 데이터베이스에 `v_category_order_status`라는 새로운 객체가 생성됩니다.
- 이 뷰는 실제 데이터를 담고 있는 것이 아니라, 위 `SELECT` 쿼리문 자체를 품고 있는 것입니다.

## 4. 뷰 조회하기

### 4.1 SELECT로 뷰 조회하기

- 뷰를 조회하는 것은 너무나도 간단합니다.
- 뷰를 그냥 하나의 테이블이라고 생각하고 `SELECT` 문을 사용하면 됩니다.
- 이제 저 길고 복잡한 쿼리 대신, 우리가 만든 뷰의 이름을 사용하여 결과를 불러와 봅시다.

```sql
SELECT * FROM v_category_order_status;
```

**실행 결과**

| category | total_orders | completed_count | shipped_count | pending_count |
|----------|--------------|-----------------|---------------|---------------|
| 전자기기 | 5 | 2 | 2 | 1 |
| 도서 | 2 | 2 | 0 | 0 |

- 간단한 쿼리 한 줄로 복잡한 쿼리를 실행했을 때와 완벽하게 동일한 결과를 얻었습니다.

### 4.2 뷰에 WHERE 절과 ORDER BY 사용하기

- 뷰 역시 테이블처럼 다룰 수 있으므로, `WHERE` 절이나 `ORDER BY`를 사용해서 뷰의 결과를 필터링하거나 정렬할 수도 있습니다.

```sql
SELECT *
FROM v_category_order_status
WHERE category = '전자기기';
```

**실행 결과**

| category | total_orders | completed_count | shipped_count | pending_count |
|----------|--------------|-----------------|---------------|---------------|
| 전자기기 | 5 | 2 | 2 | 1 |

## 5. 뷰 수정하기

### 5.1 ALTER VIEW: 뷰 수정하기

- 뷰를 사용하다 보면, 저장된 쿼리의 내용을 수정해야 할 일이 생깁니다.
- 예를 들어, 마케팅팀에서 "카테고리별 주문 건수뿐만 아니라, 총 매출액도 함께 보고 싶어요."라는 추가 요청을 했다고 가정해 봅시다.
- 이때 사용하는 명령어가 `ALTER VIEW`입니다.
- `CREATE VIEW`와 문법은 거의 동일하며, 기존 뷰의 정의를 새로운 `SELECT` 쿼리로 덮어씁니다.

```sql
ALTER VIEW v_category_order_status AS
SELECT
    p.category,
    SUM(p.price * o.quantity) AS total_sales,  -- 매출액 컬럼 추가!
    COUNT(*) AS total_orders,
    SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_count,
    SUM(CASE WHEN o.status = 'SHIPPED' THEN 1 ELSE 0 END) AS shipped_count,
    SUM(CASE WHEN o.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count
FROM
    orders o
JOIN
    products p ON o.product_id = p.product_id
GROUP BY
    p.category;
```

### 5.2 수정된 뷰 확인하기

- 뷰의 정의를 수정한 뒤, 다시 한번 뷰를 조회해 봅시다.

```sql
SELECT * FROM v_category_order_status;
```

**실행 결과**

| category | total_sales | total_orders | completed_count | shipped_count | pending_count |
|----------|-------------|--------------|-----------------|---------------|---------------|
| 전자기기 | 770000 | 5 | 2 | 2 | 1 |
| 도서 | 84000 | 2 | 2 | 0 | 0 |

- `total_sales`라는 새로운 컬럼이 성공적으로 추가된 것을 확인할 수 있습니다.
- 뷰를 사용하는 모든 팀은 이제 별도의 수정 없이 이 새로운 보고서를 즉시 받아볼 수 있게 됩니다.

## 6. 뷰 삭제하기

### 6.1 DROP VIEW: 뷰 삭제하기

- 더 이상 사용하지 않는 뷰는 `DROP VIEW` 명령어로 간단하게 삭제할 수 있습니다.

```sql
DROP VIEW v_category_order_status;
```

- 이 명령어를 실행하면 뷰의 정의, 즉 우리가 저장했던 '바로 가기'가 데이터베이스에서 사라집니다.

:::warning[원본 테이블은 안전합니다]
**뷰를 삭제해도 원본 테이블인 `orders`와 `products`의 데이터는 단 하나도 손상되거나 변경되지 않습니다.** 그저 쿼리를 저장해 둔 편리한 '도구' 하나가 사라지는 것뿐입니다.
:::

## 7. 뷰의 장점과 단점

### 7.1 뷰의 장점

**1. 편리성과 재사용성**

- 가장 큰 장점입니다. 복잡한 `SELECT` 쿼리(수십 줄에 달하는 `JOIN`, 서브쿼리, `CASE` 문의 조합)를 뷰 뒤에 숨겨둘 수 있습니다.
- **사용자 입장**: 쿼리의 내부 로직을 전혀 몰라도, `SELECT * FROM v_my_report;` 한 줄만으로 원하는 결과를 얻을 수 있습니다.
- **개발자 입장**: 동일한 로직이 여러 곳에서 필요할 때, 뷰 하나만 만들어두면 모두가 재사용할 수 있습니다. 만약 로직을 수정해야 할 경우, 뷰의 정의(`ALTER VIEW`)만 한 번 수정하면 이 뷰를 사용하는 모든 곳에 즉시 반영되므로 유지보수성이 극적으로 향상됩니다.

**2. 보안성**

- 실무에서 뷰를 사용하는 가장 중요한 이유 중 하나입니다. 뷰는 데이터베이스에 대한 섬세한 '권한 제어'를 가능하게 합니다.
- **특정 컬럼 숨기기**: `employees` 테이블에서 `salary`(연봉)나 `private_info`(개인정보) 컬럼을 제외한 뷰를 만들어, 일반 직원들에게는 해당 뷰만 조회할 수 있는 권한을 줄 수 있습니다.
- **특정 행만 노출하기**: 마케팅팀 직원에게는 `orders` 테이블에서 '마케팅' 캠페인을 통해 들어온 주문 데이터만 보여주는 뷰를 만들어 제공할 수 있습니다.
- 이렇게 하면, 사용자에게 원본 테이블에 대한 직접적인 접근 권한을 주지 않고도, 그들이 꼭 봐야 할 데이터만 안전하게 노출하는 것이 가능해집니다.

**3. 논리적 데이터 독립성**

- 뷰는 일종의 '추상화 계층' 역할을 합니다.
- 만약 데이터베이스 구조를 변경해야 하는 상황(테이블 분리, 컬럼명 변경 등)이 발생했다고 합시다. 이때, 변경 이전과 동일한 구조의 뷰를 새로 만들어 준다면, 이 뷰를 사용하던 응용 프로그램들은 원본 테이블이 변경되었다는 사실조차 모른 채 기존 코드를 그대로 사용할 수 있습니다.
- 뷰가 중간에서 물리적인 테이블의 변화를 숨겨주는 방패 역할을 하는 셈입니다.

### 7.2 뷰의 단점 및 주의사항

**1. 성능 문제**

- `SELECT * FROM my_view;`라는 간단한 쿼리 뒤에는 어마어마하게 무거운 실제 쿼리가 숨어있을 수 있습니다.
- **착각**: 사용자는 자신이 매우 가벼운 쿼리를 실행한다고 착각하지만, 실제로는 시스템에 큰 부하를 주는 쿼리를 날리고 있을 수 있습니다.
- **최적화의 한계**: 데이터베이스의 쿼리 옵티마이저는 매우 똑똑하지만, 뷰의 구조가 너무 복잡해지면 최적의 실행 계획을 찾아내는 데 어려움을 겪을 수 있습니다.

:::warning[뷰 중첩 주의]
특히 **뷰 위에 또 다른 뷰를 쌓는 방식(Nested Views)**은 성능 저하의 주된 원인이 되므로 가급적 피해야 합니다.
:::

**2. 업데이트 제약**

- 뷰를 테이블처럼 다룰 수 있다고 했지만, 그것은 주로 **조회(읽기)**에 국한된 이야기입니다.
- **수정 불가(대부분의 경우)**: `JOIN`, 집계 함수(`SUM`, `COUNT` 등), `GROUP BY`, `DISTINCT` 등을 사용한 복잡한 뷰는 일반적으로 `INSERT`, `UPDATE`, `DELETE`가 불가능합니다. 왜냐하면 데이터베이스 입장에서, 뷰의 한 행을 수정하는 것이 원본 테이블들의 데이터를 어떻게 바꿔야 하는지에 대한 명확한 규칙을 특정할 수 없기 때문입니다.
- **수정 가능**: 뷰가 오직 하나의 기본 테이블만을 참조하고, 뷰의 모든 컬럼이 기본 테이블의 실제 컬럼을 직접 참조하는 경우에는 뷰에 데이터를 추가/수정할 수 있습니다. 이 경우 원본 테이블의 값이 변경됩니다.

:::tip[실무 규칙]
**"뷰는 기본적으로 조회용이다"**라고 생각하는 것이 가장 안전하고 일반적인 원칙입니다. 데이터를 수정해야 한다면, 뷰가 아닌 원본 테이블에 직접 수행해야 합니다.
:::

### 7.3 정리

- 뷰는 만능 해결책이 아닙니다.
- 복잡한 로직을 편리하게 재사용하고 보안을 강화하는 데는 좋은 도구지만, 성능 저하의 가능성을 내포하고 있으며 데이터 수정에는 제약이 따른다는 한계를 가지고 있습니다.

## 8. 문제와 풀이

### 8.1 문제1: 고객의 기본 정보만 보여주는 뷰 생성하기

**문제**

- `users` 테이블에는 고객의 주소, 생년월일과 같은 민감한 정보가 포함되어 있습니다.
- 마케팅팀에서는 고객에게 이메일을 보내기 위해 이름과 이메일 주소만 필요합니다.
- 보안을 위해 고객의 `user_id`, `name`, `email` 컬럼만을 포함하는 `v_customer_email_list`라는 이름의 뷰(View)를 생성해라.

**실행 결과**

| user_id | 고객명 | 이메일 |
|---------|--------|--------|
| 1 | 션 | sean@example.com |
| 2 | 네이트 | nate@example.com |
| 3 | 세종대왕 | sejong@example.com |
| 4 | 이순신 | sunsin@example.com |
| 5 | 마리 퀴리 | marie@example.com |
| 6 | 레오나르도 다빈치 | vinci@example.com |

**정답**

```sql
-- 기존에 뷰가 있다면 삭제
DROP VIEW IF EXISTS v_customer_email_list;

-- 뷰 생성
CREATE VIEW v_customer_email_list AS
SELECT
    user_id,
    name AS 고객명,
    email AS 이메일
FROM
    users;

-- 생성된 뷰 조회
SELECT * FROM v_customer_email_list;
```

### 8.2 문제2: 주문 상세 정보를 통합한 뷰 생성하기

**문제**

- 운영팀에서는 현재 주문 내역을 확인할 때마다 `orders`, `users`, `products` 테이블을 매번 `JOIN` 해야 해서 불편함을 겪고 있습니다.
- 주문 ID(`order_id`), 고객 이름(`name`), 상품 이름(`name`), 주문 수량(`quantity`), 주문 상태(`status`)를 한 번에 볼 수 있는 `v_order_summary`라는 이름의 뷰를 생성하여 업무 효율을 높여라.

**실행 결과**

| order_id | 고객명 | 상품명 | 주문수량 | 주문상태 |
|----------|--------|--------|----------|----------|
| 1 | 션 | 프리미엄 게이밍 마우스 | 1 | COMPLETED |
| 2 | 션 | 관계형 데이터베이스 입문 | 2 | COMPLETED |
| 3 | 네이트 | 기계식 키보드 | 1 | SHIPPED |
| 4 | 세종대왕 | 관계형 데이터베이스 입문 | 1 | COMPLETED |
| 5 | 이순신 | 4K UHD 모니터 | 1 | PENDING |
| 6 | 마리 퀴리 | 프리미엄 게이밍 마우스 | 1 | COMPLETED |
| 7 | 네이트 | 프리미엄 게이밍 마우스 | 2 | SHIPPED |

**정답**

```sql
-- 기존에 뷰가 있다면 삭제
DROP VIEW IF EXISTS v_order_summary;

-- 뷰 생성
CREATE VIEW v_order_summary AS
SELECT
    o.order_id,
    u.name AS '고객명',
    p.name AS '상품명',
    o.quantity AS '주문수량',
    o.status AS '주문상태'
FROM
    orders o
JOIN
    users u ON o.user_id = u.user_id
JOIN
    products p ON o.product_id = p.product_id;

-- 생성된 뷰 조회
SELECT * FROM v_order_summary;
```

### 8.3 문제3: '전자기기' 카테고리 매출 분석 뷰 생성하기

**문제**

- 전략기획팀은 '전자기기' 카테고리의 상품들에 대한 주문 건수와 총매출액을 집중적으로 분석하고자 합니다.
- `products` 테이블과 `orders` 테이블을 `JOIN` 하여, '전자기기' 카테고리에 속한 상품들의 총주문 건수(`total_orders`)와 총매출액(`total_sales`)을 계산하는 `v_electronics_sales_status` 뷰를 생성해ra.

**실행 결과**

| category | total_orders | total_sales |
|----------|--------------|-------------|
| 전자기기 | 5 | 770000 |

**정답**

```sql
-- 기존에 뷰가 있다면 삭제
DROP VIEW IF EXISTS v_electronics_sales_status;

-- 뷰 생성
CREATE VIEW v_electronics_sales_status AS
SELECT
    p.category,
    COUNT(o.order_id) AS total_orders,
    SUM(p.price * o.quantity) AS total_sales
FROM
    orders o
JOIN
    products p ON o.product_id = p.product_id
WHERE
    p.category = '전자기기'
GROUP BY
    p.category;

-- 생성된 뷰 조회
SELECT * FROM v_electronics_sales_status;
```

### 8.4 문제4: 기존 뷰에 정보 추가하여 수정하기

**문제**

- 문제 3에서 만들었던 `v_electronics_sales_status` 뷰가 매우 유용하다는 피드백을 받았습니다.
- 전략기획팀에서 총매출액뿐만 아니라, 평균 주문액(`average_order_value`)도 함께 보고 싶다는 추가 요청이 왔습니다.
- 기존 뷰를 삭제하지 말고, `ALTER VIEW`를 사용하여 `v_electronics_sales_status` 뷰의 정의를 수정해라.
- 총 주문 건수, 총매출액, 그리고 평균 주문액을 보여주도록 변경해야 합니다.

**실행 결과**

| category | total_orders | total_sales | average_order_value |
|----------|--------------|-------------|---------------------|
| 전자기기 | 5 | 770000 | 154000.0000 |

**정답**

```sql
-- 뷰 수정
ALTER VIEW v_electronics_sales_status AS
SELECT
    p.category,
    COUNT(o.order_id) AS total_orders,
    SUM(p.price * o.quantity) AS total_sales,
    AVG(p.price * o.quantity) AS average_order_value
FROM
    orders o
JOIN
    products p ON o.product_id = p.product_id
WHERE
    p.category = '전자기기'
GROUP BY
    p.category;

-- 수정된 뷰 조회
SELECT * FROM v_electronics_sales_status;
```

## 9. 정리

### 9.1 핵심 요약

**뷰(View) 소개**

- 뷰(View)는 실제 데이터를 가지지 않는 '가상의 테이블'이며, 그 실체는 데이터베이스에 저장된 `SELECT` 쿼리문입니다.
- 복잡하고 긴 쿼리를 매번 작성할 필요 없이, 뷰를 통해 간단하게 조회할 수 있어 편리합니다.
- 사용자는 원본 테이블에 직접 접근할 필요 없이 뷰를 통해서만 제한된 데이터에 접근하게 되므로 보안성이 향상됩니다.
- 뷰를 조회할 때마다 저장된 `SELECT` 쿼리가 실행되므로, 데이터는 항상 원본 테이블의 최신 상태를 반영합니다.
- 원본 테이블의 구조가 변경되어도 뷰의 정의만 수정하면 되므로, 논리적 데이터 독립성을 제공합니다.

**뷰 생성, 조회, 수정, 삭제**

- `CREATE VIEW 뷰이름 AS SELECT 쿼리문;` 명령어를 사용하여 뷰를 생성합니다.
- 생성된 뷰는 일반 테이블처럼 `SELECT` 문을 사용하여 조회할 수 있으며, `WHERE`나 `ORDER BY` 절도 사용 가능합니다.
- `ALTER VIEW 뷰이름 AS SELECT 쿼리문;` 명령어를 사용하여 기존 뷰의 정의(저장된 쿼리)를 수정합니다.
- `DROP VIEW 뷰이름;` 명령어를 사용하여 뷰를 삭제할 수 있으며, 뷰를 삭제해도 원본 테이블의 데이터는 전혀 손상되지 않습니다.

**뷰의 장점과 단점**

- **장점**:
  - **편리성과 재사용성**: 복잡한 쿼리를 단순화하고 재사용하여 유지보수성을 높입니다.
  - **보안성**: 특정 행이나 열만 노출하여 사용자별 데이터 접근 권한을 세밀하게 제어할 수 있습니다.
  - **논리적 데이터 독립성**: 테이블 구조가 변경되어도 뷰를 사용하는 응용 프로그램은 영향을 받지 않도록 보호하는 추상화 계층 역할을 합니다.
- **단점 및 주의사항**:
  - **성능 문제**: 뷰의 쿼리가 단순해 보여도 실제로는 시스템에 큰 부하를 줄 수 있으며, 특히 뷰를 중첩하여 사용하면 성능 저하의 원인이 될 수 있습니다.
  - **업데이트 제약**: `JOIN`이나 집계 함수(`SUM`, `COUNT` 등)를 사용한 복잡한 뷰는 데이터를 수정(`INSERT`, `UPDATE`, `DELETE`)할 수 없습니다. 뷰는 기본적으로 '조회용'으로 사용하는 것이 원칙입니다.