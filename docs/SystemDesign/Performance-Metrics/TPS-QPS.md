##  1 TPS와 QPS

- 시스템 설계에서 성능을 측정하는 주요 지표로 QPS와 TPS가 있습니다.
- 이 글에서는 QPS와 TPS의 차이점을 실제 예시를 통해 자세히 설명합니다.
- 각 지표가 시스템 설계에서 어떤 의미를 가지는지 알아봅니다.



##  2 기본 개념

###  2.1 QPS (Query Per Second)

- 시스템이 초당 처리할 수 있는 쿼리의 수를 의미합니다.
- 주로 읽기(READ) 작업의 처리량을 나타냅니다.
- 데이터베이스 관점에서는 SELECT 쿼리의 처리량입니다.
- 트랜잭션을 필요로 하지 않는 단순 조회 작업을 포함합니다.



###  2.2 TPS (Transaction Per Second)

- 시스템이 초당 처리할 수 있는 트랜잭션의 수를 의미합니다.
- 주로 쓰기(WRITE) 작업의 처리량을 나타냅니다.
- 데이터베이스 관점에서는 INSERT, UPDATE, DELETE 쿼리의 처리량입니다.
- 데이터 정합성을 위해 트랜잭션으로 처리되어야 하는 작업들을 포함합니다.



##  3 실제 예시를 통한 이해

###  3.1 이커머스 시스템 예시

- 상품 조회 (QPS):
    - 상품 목록 보기
    - 상품 상세 정보 보기
    - 재고 확인
    - 리뷰 목록 조회
- 주문 처리 (TPS):
    - 상품 주문
    - 결제 처리
    - 재고 감소
    - 주문 상태 변경



###  3.2 소셜 미디어 시스템 예시

- 피드 조회 (QPS):
    - 타임라인 로딩
    - 프로필 조회
    - 댓글 목록 보기
- 상태 업데이트 (TPS):
    - 게시물 작성
    - 좋아요 처리
    - 팔로우/언팔로우



##  4 코드로 보는 QPS와 TPS

###  4.1 단순 조회 예시 (QPS)

**상품 조회 API**

```java
@GetMapping("/products/{id}")
public Product getProduct(@PathVariable Long id) {
    return productRepository.findById(id);
}
```



**데이터베이스 쿼리**

```sql
SELECT * FROM products WHERE id = 123;
```

- 단일 쿼리로 처리됩니다.
- 트랜잭션이 필요하지 않습니다.
- QPS 카운트가 1 증가합니다.



###  4.2 트랜잭션 처리 예시 (TPS)

**주문 처리 API**

```java
@Transactional
@PostMapping("/orders")
public Order createOrder(@RequestBody OrderRequest request) {
    // 1. 재고 확인
    Product product = productRepository.findById(request.getProductId());
    
    // 2. 재고 감소
    product.decreaseStock(request.getQuantity());
    productRepository.save(product);
    
    // 3. 주문 생성
    Order order = new Order(request);
    orderRepository.save(order);
    
    // 4. 결제 처리
    Payment payment = paymentService.process(order);
    
    return order;
}
```



**데이터베이스 쿼리**

```sql
-- 트랜잭션 시작
BEGIN TRANSACTION;

-- 재고 확인
SELECT * FROM products WHERE id = 123;

-- 재고 감소
UPDATE products SET stock = stock - 1 WHERE id = 123;

-- 주문 생성
INSERT INTO orders (product_id, user_id, quantity) VALUES (123, 456, 1);

-- 결제 정보 저장
INSERT INTO payments (order_id, amount, status) VALUES (789, 50000, 'COMPLETED');

-- 트랜잭션 종료
COMMIT;
```

- 여러 쿼리가 하나의 트랜잭션으로 처리됩니다.
- QPS는 4 증가합니다.
	- 각각의 SQL 명령문(SELECT, UPDATE, INSERT)은 하나의 쿼리로 카운트되므로 QPS(Query Per Second)는 4가 증가합니다.
- TPS는 1 증가합니다.
	- 모든 쿼리들은 하나의 트랜잭션으로 묶여있기 때문에 TPS(Transaction Per Second)는 1만 증가합니다.