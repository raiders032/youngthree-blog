## 1 ItemReader

- ItemReader는 다양한 소스(데이터베이스, 파일, XML 등)로부터 데이터를 읽어오는 역할을 담당합니다.
- 스프링 배치는 다양한 유형의 데이터 소스에 대응하는 ItemReader 구현체를 제공하며, 필요에 따라 커스텀 ItemReader를 개발할 수도 있습니다.
- 대표적인 ItemReader 구현체로는 Cursor 기반과 Paging 기반이 있습니다.
	- Cursor 기반은 데이터를 순차적으로 읽어오며, 읽어온 데이터는 메모리에 저장되지 않습니다.
	- Paging 기반은 데이터를 페이지 단위로 나누어 읽어오며, 페이지 단위로 메모리에 로드됩니다.
- Cursor 기반은 대량의 데이터를 처리할 때 성능이 선형적으로 증가하며, 메모리 사용량도 일정하게 유지됩니다.
- Paging 기반은 offset이 커질수록 성능이 지수적으로 감소할 수 있으며, 특히 대용량 데이터 처리시 이러한 현상이 두드러집니다.

### 1.1 성능 개선의 시작

- Spring Batch 성능의 핵심은 ItemReader의 최적화에 있습니다.
- 데이터 조회 패턴에 따라 성능 차이가 크게 발생할 수 있습니다.
	- 예를 들어, 100만 개의 전체 주문 정보를 순차적으로 읽는 경우는 성능에 큰 영향이 없습니다.
	- 반면 10억 개의 데이터 중 특정 조건에 맞는 100만 개를 조회하는 경우, ItemReader의 성능이 전체 배치 작업의 병목이 될 수 있습니다.
- Select 쿼리의 최적화만으로도 상당한 성능 개선을 기대할 수 있습니다.

### 1.2 Chunk Processing과 페이징

- 대용량 데이터는 메모리 제약으로 인해 한 번에 처리할 수 없습니다.
- 이를 해결하기 위해 Spring Batch는 Chunk Processing을 도입했습니다.
- Chunk Processing에서는 일반적으로 Page 기반 ItemReader를 활용합니다.
- 하지만 페이징 방식에는 구조적인 한계가 있습니다.
	- Limit-Offset 방식은 offset이 증가할수록 쿼리 성능이 급격히 저하됩니다.
	- 이는 데이터베이스가 offset만큼의 레코드를 스킵하기 위해 매번 스캔해야 하기 때문입니다.

## 2 Cursor 기반 ItemReader

- Cursor 기반 ItemReader는 데이터베이스의 Cursor를 사용하여 데이터를 읽어옵니다.
- 한 번의 쿼리로 데이터베이스와 연결을 유지한 상태에서 실행되므로, 대용량 데이터 처리에 적합합니다.
- Cursor를 사용하면 데이터를 순차적으로 읽어올 수 있으며, 읽어온 데이터는 메모리에 저장되지 않습니다.
- 데이터를 순차적으로 읽어오기 때문에 성능이 선형적으로 증가하며, 메모리 사용량도 일정하게 유지됩니다.
- 대표적인 Cursor 기반 ItemReader 구현체로는 JdbcCursorItemReader, HibernateCursorItemReader, StoredProcedureItemReader 등이 있습니다.

### 2.1 구현체

- JdbcCursorItemReader
	- JDBC 표준 Cursor를 사용하여 데이터를 순차적으로 조회합니다.
	- 쿼리 결과를 RowMapper를 통해 도메인 객체로 매핑합니다.
	- 데이터베이스 Cursor는 결과 집합을 순회하는 포인터 역할을 합니다.
		- 전체 결과를 메모리에 한 번에 로드하지 않고 포인터를 이동하며 순차적으로 접근합니다.
		- 메모리 사용량이 일정하게 유지되어 대용량 데이터 처리에 적합합니다.
	- 주의사항: 배치 작업 완료 전까지 데이터베이스 connection을 유지해야 하므로 timeout 설정에 유의해야 합니다.
- HibernateCursorItemReader
	- Hibernate의 stateless session을 활용한 cursor 기반 구현체입니다.
	- 영속성 컨텍스트를 사용하지 않아 메모리 사용량이 효율적입니다.
	- JPA 엔티티를 그대로 사용할 수 있어 도메인 모델 매핑이 용이합니다.
- JpaCursorItemReader
	- 실제 데이터베이스 cursor를 사용하지 않고 애플리케이션에서 전체 데이터를 조회한 후 메모리에서 cursor처럼 동작합니다.
	- 대용량 데이터 처리 시 OutOfMemoryError 발생 위험이 높아 사용을 권장하지 않습니다.

## 3 Paging 기반 ItemReader

- Paging 기반 ItemReader는 데이터베이스의 페이징 기능을 사용하여 데이터를 일정 크기로 나누어 읽어옵니다.
- 페이징을 사용하면 대량의 데이터를 한 번에 메모리에 로드하지 않고, 일정 크기로 나누어 처리할 수 있습니다.
- 각 페이지마다 새로운 쿼리가 실행되며, 이는 offset이 커질수록 성능 저하를 야기할 수 있습니다.
- 대표적인 Paging 기반 ItemReader 구현체로는 JdbcPagingItemReader, HibernatePagingItemReader, JpaPagingItemReader 등이 있습니다.

### 3.1 구현체

- JdbcPagingItemReader
	- JDBC를 사용하여 페이징 처리된 데이터를 읽어옵니다.
	- 각 페이지마다 새로운 쿼리가 실행되며, offset과 limit을 사용하여 페이징을 구현합니다.
	- offset이 커질수록 성능이 저하되므로, 대용량 데이터 처리시 주의가 필요합니다.
	- 데이터의 일관성을 위해 정렬(Order by) 조건이 반드시 필요합니다.

### 3.2 페이징 방식의 한계와 성능 최적화

- Paging 기반 ItemReader는 offset이 증가할수록 성능이 지수적으로 감소하는 한계가 있습니다.
- offset 10,000은 10,000개의 레코드를 읽고 버린 후에야 원하는 데이터에 접근할 수 있습니다.
- 데이터가 많아질수록 이러한 오버헤드가 심각한 성능 저하를 초래합니다.

#### Zero Offset Paging을 통한 최적화

- Zero Offset Paging은 offset을 사용하지 않고 페이징을 구현하는 기법입니다.
- 구현 방법:
	- 먼저 기준이 되는 컬럼(보통 PK)으로 데이터를 정렬합니다.
	- 이전 페이지의 마지막 PK 값을 기준으로 다음 데이터를 조회합니다.
	- 예시: `WHERE id > ?` 조건을 사용하여 이전 페이지의 마지막 ID보다 큰 데이터를 조회

```sql
-- 일반적인 페이징 쿼리
SELECT *
FROM orders
ORDER BY id LIMIT 10000, 10;

-- Zero Offset 페이징 쿼리
SELECT *
FROM orders
WHERE id > :lastSeenId
ORDER BY id LIMIT 10;
```

:::tip
대용량 데이터 처리 시에는 페이징 방식보다 Cursor 방식의 사용을 우선 고려하세요. Cursor 방식은 데이터베이스의 부하를 최소화하면서 일관된 성능을 제공합니다.
:::

