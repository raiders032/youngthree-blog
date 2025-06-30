---
title: "ItemReader"
description: "Spring Batch의 핵심 컴포넌트인 ItemReader의 성능 최적화 방법을 상세히 알아봅니다. Cursor 기반과 Paging 기반 ItemReader의 차이점, 대용량 데이터 처리 시 발생하는 성능 이슈와 해결책, Zero Offset Paging 기법까지 실무에서 바로 적용할 수 있는 최적화 전략을 제공합니다."
tags: ["SPRING_BATCH", "ITEMREADER", "PERFORMANCE", "DATABASE", "SPRING", "BACKEND", "JAVA"]
keywords: ["스프링배치", "Spring Batch", "ItemReader", "아이템리더", "배치처리", "batch processing", "성능최적화", "performance optimization", "커서", "cursor", "페이징", "paging", "대용량데이터", "bulk data", "제로오프셋", "zero offset", "데이터베이스", "database", "스프링", "Spring", "자바", "Java", "백엔드", "backend"]
draft: false
hide_title: true
---

## 1. ItemReader 개요

- ItemReader는 Spring Batch의 핵심 컴포넌트로, 다양한 소스(데이터베이스, 파일, XML 등)로부터 데이터를 읽어오는 역할을 담당합니다.
- Spring Batch는 다양한 유형의 데이터 소스에 대응하는 ItemReader 구현체를 제공하며, 필요에 따라 커스텀 ItemReader를 개발할 수도 있습니다.
- 배치 처리 성능의 핵심은 ItemReader의 최적화에 있습니다.

### 1.1 ItemReader 인터페이스 구조

#### ItemReader 기본 구조
```java
package org.springframework.batch.item;

import org.springframework.lang.Nullable;

@FunctionalInterface
public interface ItemReader<T> {
    @Nullable
    T read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException;
}
```

- ItemReader 인터페이스는 단일 메서드 `read()`를 정의하는 함수형 인터페이스입니다.
- Spring Batch가 ItemReader의 read 메서드를 호출하면 해당 메서드는 스텝 내에서 처리할 아이템 한 개를 반환합니다.
- 스텝에서는 아이템 개수를 세어서 청크 내의 데이터가 몇 개나 처리됐는지를 관리합니다.

### 1.2 성능 최적화의 중요성

- Spring Batch 성능의 핵심은 ItemReader의 최적화에 있습니다.
- 데이터 조회 패턴에 따라 성능 차이가 크게 발생할 수 있습니다.
- 예시를 통한 성능 차이:
	- 100만 개의 전체 주문 정보를 순차적으로 읽는 경우: 성능에 큰 영향 없음
	- 10억 개의 데이터 중 특정 조건에 맞는 100만 개를 조회하는 경우: ItemReader가 전체 배치 작업의 병목이 될 수 있음
- Select 쿼리의 최적화만으로도 상당한 성능 개선을 기대할 수 있습니다.

## 2. 데이터베이스 기반 ItemReader 종류

- Spring Batch는 데이터베이스에서 데이터를 읽어오는 다양한 ItemReader 구현체를 제공합니다.
- 대표적인 ItemReader 구현체로는 Cursor 기반과 Paging 기반이 있습니다.

### 2.1 Chunk Processing과 페이징

- 대용량 데이터는 메모리 제약으로 인해 한 번에 처리할 수 없습니다.
- 이를 해결하기 위해 Spring Batch는 Chunk Processing을 도입했습니다.
- 스프링 배치에서는 한 번에 처리할 만큼의 레코드만 로딩하는 별도의 두 가지 방법을 제공합니다.
  - 이 두 가지 방법은 Cursor 기반과 Paging 기반입니다.

### 2.2 Cursor vs Paging 비교

- **Cursor 기반**:
	- 데이터를 순차적으로 읽어오며, 읽어온 데이터는 메모리에 저장되지 않습니다.
	- 대량의 데이터를 처리할 때 성능이 선형적으로 증가하며, 메모리 사용량도 일정하게 유지됩니다.
- **Paging 기반**:
	- 데이터를 페이지 단위로 나누어 읽어오며, 페이지 단위로 메모리에 로드됩니다.
	- offset이 커질수록 성능이 지수적으로 감소할 수 있으며, 특히 대용량 데이터 처리시 이러한 현상이 두드러집니다.

## 3. Cursor 기반 ItemReader

- Cursor 기반 ItemReader는 데이터베이스의 Cursor를 사용하여 데이터를 읽어옵니다.
- 한 번의 쿼리로 데이터베이스와 연결을 유지한 상태에서 실행되므로, 대용량 데이터 처리에 적합합니다.

### 3.1 Cursor 방식의 장점

- 데이터를 순차적으로 읽어올 수 있으며, 읽어온 데이터는 메모리에 저장되지 않습니다.
- 데이터를 순차적으로 읽어오기 때문에 성능이 선형적으로 증가하며, 메모리 사용량도 일정하게 유지됩니다.
- 전체 결과를 메모리에 한 번에 로드하지 않고 포인터를 이동하며 순차적으로 접근합니다.

### 3.2 주요 Cursor 기반 구현체

#### 3.2.1 JdbcCursorItemReader

```java
@Bean
public JdbcCursorItemReader<Customer> customerItemReader() {
    return new JdbcCursorItemReaderBuilder<Customer>()
            .name("customerItemReader")
            .dataSource(dataSource)
            .sql("SELECT id, name, email FROM customer ORDER BY id")
            .rowMapper(new CustomerRowMapper())
            .build();
}
```

- JDBC 표준 Cursor를 사용하여 데이터를 순차적으로 조회합니다.
- JdbcCursorItemReader는 ResultSet을 생성하면서 커서를 연 다음, 스프링 배치 read 메서드를 호출할 때마다 도메인 객체로 매핑할 로우를 가져옵니다.
- JdbcCursorItemReader를 구성하려면 데이터 소스, SQL 쿼리, RowMapper를 지정해야 합니다.
  - 쿼리 결과를 RowMapper를 통해 도메인 객체로 매핑합니다.
- 데이터베이스 Cursor는 결과 집합을 순회하는 포인터 역할을 합니다.

:::warning
배치 작업 완료 전까지 데이터베이스 connection을 유지해야 하므로 timeout 설정에 유의해야 합니다.
:::

#### 3.2.2 HibernateCursorItemReader

```java
@Bean
public HibernateCursorItemReader<Customer> customerItemReader() {
    return new HibernateCursorItemReaderBuilder<Customer>()
            .name("customerItemReader")
            .sessionFactory(sessionFactory)
            .queryString("FROM Customer ORDER BY id")
            .build();
}
```

- Hibernate의 stateless session을 활용한 cursor 기반 구현체입니다.
- 영속성 컨텍스트를 사용하지 않아 메모리 사용량이 효율적입니다.
- JPA 엔티티를 그대로 사용할 수 있어 도메인 모델 매핑이 용이합니다.

#### 3.2.3 JpaCursorItemReader

:::danger
JpaCursorItemReader는 실제 데이터베이스 cursor를 사용하지 않고 애플리케이션에서 전체 데이터를 조회한 후 메모리에서 cursor처럼 동작합니다. 대용량 데이터 처리 시 OutOfMemoryError 발생 위험이 높아 사용을 권장하지 않습니다.
:::

## 4. Paging 기반 ItemReader

- Paging 기반 ItemReader는 데이터베이스의 페이징 기능을 사용하여 데이터를 일정 크기로 나누어 읽어옵니다.
- 각 페이지마다 새로운 쿼리가 실행되며, 이는 offset이 커질수록 성능 저하를 야기할 수 있습니다.

### 4.1 JdbcPagingItemReader 구현 예시

```java
@Bean
public JdbcPagingItemReader<Customer> customerItemReader() {
    Map<String, Object> parameterValues = new HashMap<>();
    
    return new JdbcPagingItemReaderBuilder<Customer>()
            .name("customerItemReader")
            .dataSource(dataSource)
            .selectClause("SELECT id, name, email")
            .fromClause("FROM customer")
            .whereClause("WHERE status = 'ACTIVE'")
            .sortKeys(Map.of("id", Order.ASCENDING))
            .parameterValues(parameterValues)
            .rowMapper(new CustomerRowMapper())
            .pageSize(1000)
            .build();
}
```

- JDBC를 사용하여 페이징 처리된 데이터를 읽어옵니다.
- 각 페이지마다 새로운 쿼리가 실행되며, offset과 limit을 사용하여 페이징을 구현합니다.
- 데이터의 일관성을 위해 정렬(Order by) 조건이 반드시 필요합니다.

### 4.2 페이징 방식의 성능 한계

- Paging 기반 ItemReader는 offset이 증가할수록 성능이 지수적으로 감소하는 한계가 있습니다.
- offset 10,000은 10,000개의 레코드를 읽고 버린 후에야 원하는 데이터에 접근할 수 있습니다.
- 데이터가 많아질수록 이러한 오버헤드가 심각한 성능 저하를 초래합니다.
- 이 경우 커서 방식의 ItemReader 또는 Zero Offset Paging 기법을 고려해야 합니다.

#### 성능 저하 예시

```sql
-- 첫 번째 페이지 (빠름)
SELECT * FROM orders ORDER BY id LIMIT 0, 1000;

-- 10,000번째 페이지 (매우 느림)
SELECT * FROM orders ORDER BY id LIMIT 10000000, 1000;
```

## 5. Zero Offset Paging 최적화 기법

### 5.1 Zero Offset Paging 개념

- Zero Offset Paging은 offset을 사용하지 않고 페이징을 구현하는 기법입니다.
- 이 방식을 통해 대용량 데이터 처리 시 발생하는 성능 저하 문제를 해결할 수 있습니다.

### 5.2 구현 방법

#### 기본 구현 예시

```sql
-- 일반적인 페이징 쿼리 (성능 저하)
SELECT *
FROM orders
ORDER BY id LIMIT 10000, 10;

-- Zero Offset 페이징 쿼리 (성능 최적화)
SELECT *
FROM orders
WHERE id > :lastSeenId
ORDER BY id LIMIT 10;
```

- 먼저 기준이 되는 컬럼(보통 PK)으로 데이터를 정렬합니다.
- 이전 페이지의 마지막 PK 값을 기준으로 다음 데이터를 조회합니다.
- `WHERE id > ?` 조건을 사용하여 이전 페이지의 마지막 ID보다 큰 데이터를 조회합니다.

#### Custom ItemReader 구현 예시

```java
@Component
public class ZeroOffsetPagingItemReader implements ItemReader<Order> {
    
    private final JdbcTemplate jdbcTemplate;
    private final int pageSize;
    private Long lastSeenId = 0L;
    private Iterator<Order> currentPageIterator;
    
    public ZeroOffsetPagingItemReader(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.pageSize = 1000;
    }
    
    @Override
    public Order read() throws Exception {
        if (currentPageIterator == null || !currentPageIterator.hasNext()) {
            List<Order> nextPage = fetchNextPage();
            if (nextPage.isEmpty()) {
                return null; // 더 이상 읽을 데이터가 없음
            }
            currentPageIterator = nextPage.iterator();
            lastSeenId = nextPage.get(nextPage.size() - 1).getId();
        }
        
        return currentPageIterator.next();
    }
    
    private List<Order> fetchNextPage() {
        String sql = "SELECT id, customer_id, order_date FROM orders " +
                    "WHERE id > ? ORDER BY id LIMIT ?";
        
        return jdbcTemplate.query(sql, 
            new Object[]{lastSeenId, pageSize}, 
            new OrderRowMapper());
    }
}
```

이 방식을 사용하면 offset을 사용하지 않아 일관된 성능을 유지할 수 있습니다.

## 6. 최적화 전략 및 권장사항

### 6.1 ItemReader 선택 가이드

- **대용량 데이터 (100만 건 이상)**: Cursor 기반 ItemReader 우선 고려
- **중간 규모 데이터**: Zero Offset Paging 기법 적용
- **소규모 데이터**: 일반 Paging ItemReader 사용 가능

### 6.2 성능 최적화 체크리스트

- 적절한 인덱스 설정 확인
- 데이터베이스 Connection Pool 설정 최적화
- 청크 사이즈 조정을 통한 성능 튜닝
- 불필요한 컬럼 조회 최소화
- WHERE 조건 최적화

:::tip
대용량 데이터 처리 시에는 페이징 방식보다 Cursor 방식의 사용을 우선 고려하세요. Cursor 방식은 데이터베이스의 부하를 최소화하면서 일관된 성능을 제공합니다.
:::

## 7. 마치며

- ItemReader는 Spring Batch 성능의 핵심 요소입니다.
- Cursor 기반과 Paging 기반 각각의 특성을 이해하고 상황에 맞는 선택이 중요합니다.
- Zero Offset Paging과 같은 최적화 기법을 통해 대용량 데이터 처리 성능을 크게 개선할 수 있습니다.
- 실무에서는 데이터 규모, 시스템 환경, 성능 요구사항을 종합적으로 고려하여 최적의 ItemReader를 선택해야 합니다.