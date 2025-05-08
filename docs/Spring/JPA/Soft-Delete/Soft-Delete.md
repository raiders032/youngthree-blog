---
title: "JPA Soft Delete"
description: "Spring Data JPA에서 소프트 삭제를 구현하는 방법을 알아봅니다. 데이터를 물리적으로 삭제하지 않고 논리적으로만 삭제 처리하는 기법의 개념, 구현 방법, 그리고 다양한 활용 패턴을 예제 코드와 함께 자세히 설명합니다."
tags: ["SOFT_DELETE", "JPA", "SPRING_DATA_JPA", "DATABASE", "SPRING", "BACKEND", "JAVA"]
keywords: ["소프트 삭제", "soft delete", "논리 삭제", "logical delete", "JPA", "스프링 데이터", "Spring Data", "스프링 JPA", "데이터 히스토리", "데이터 보존", "Spring Boot", "하이버네이트", "Hibernate", "엔티티", "entity", "어노테이션", "annotation", "SQLDelete", "Where", "Filter", "FilterDef"]
draft: false
hide_title: true
---

## 1. 소프트 삭제(Soft Delete)

- 데이터베이스를 다룰 때 일반적으로 데이터를 물리적으로 삭제하는 작업이 필요합니다.
- 그러나 비즈니스 요구사항에 따라 데이터를 영구적으로 삭제하지 않아야 하는 경우가 있습니다.
  - 데이터 히스토리 추적
  - 감사(Audit) 목적
  - 참조 무결성(Reference Integrity) 유지
- 이런 상황에서는 데이터를 실제로 삭제하는 대신, 단순히 '삭제된 상태'로 표시하여 애플리케이션에서 접근할 수 없게 만들 수 있습니다.
- 이러한 기법을 소프트 삭제(Soft Delete) 또는 논리적 삭제(Logical Delete)라고 합니다.

## 2. 소프트 삭제란?

- 소프트 삭제는 데이터베이스 테이블에서 데이터를 물리적으로 삭제하는 대신, 해당 데이터를 '삭제됨'으로 표시하는 업데이트 프로세스를 수행합니다.
- 일반적인 구현 방법은 데이터가 삭제되었는지 여부를 나타내는 필드를 추가하는 것입니다.

### 2.1 예시: 물리적 삭제 vs 소프트 삭제

- 다음과 같은 구조의 상품 테이블이 있다고 가정해봅시다:

```
+----+------------------+--------+
| id | name             | price  |
+----+------------------+--------+
| 1  | Smartphone       | 599.99 |
| 2  | Laptop           | 999.99 |
| 3  | Wireless Earbuds | 129.99 |
+----+------------------+--------+
```

#### 물리적 삭제

- 물리적 삭제의 경우, 다음과 같은 SQL 명령을 실행합니다:

```sql
DELETE FROM table_product WHERE id=1
```

- 이 명령은 id가 1인 제품을 데이터베이스 테이블에서 영구적으로 제거합니다.

#### 소프트 삭제

- 소프트 삭제를 구현하려면 먼저 테이블에 삭제 여부를 나타내는 필드를 추가합니다:

```
+----+------------------+--------+---------+
| id | name             | price  | deleted |
+----+------------------+--------+---------+
| 1  | Smartphone       | 599.99 | 0       |
| 2  | Laptop           | 999.99 | 0       |
| 3  | Wireless Earbuds | 129.99 | 0       |
+----+------------------+--------+---------+
```

- 'deleted' 필드에는 0 또는 1 값이 들어갑니다.
  - 1은 데이터가 삭제되었음을 나타냅니다.
  - 0은 데이터가 삭제되지 않았음을 나타냅니다.
- 따라서 삭제 프로세스에서는 DELETE 명령 대신 다음과 같은 UPDATE 명령을 실행합니다:

```sql
UPDATE table_product SET deleted=1 WHERE id=1
```

- 이 방식으로 실제로 행을 삭제하지 않고 단지 '삭제된 상태'로 표시만 합니다.
- 데이터를 조회할 때는 삭제되지 않은 행만 가져오도록 필터를 추가합니다:

```sql
SELECT * FROM table_product WHERE deleted=0
```

## 3. Spring JPA에서 소프트 삭제 구현하기

- Spring JPA를 사용하면 소프트 삭제 구현이 훨씬 간단해집니다.
- 몇 가지 JPA 어노테이션만으로 이 기능을 구현할 수 있습니다.
- JPA는 대부분의 SQL 쿼리를 내부적으로 생성하고 실행하므로, 우리는 이 메커니즘을 활용할 수 있습니다.

### 3.1 엔티티 클래스 정의

- 가장 중요한 부분은 엔티티 클래스를 생성하는 것입니다.
- 앞서 예로 든 상품 테이블에 대한 Product 엔티티 클래스를 만들어 보겠습니다:

```java
@Entity
@Table(name = "table_product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private double price;

    private boolean deleted = Boolean.FALSE;

    // setter, getter 메서드
}
```

- 여기서 `deleted` 속성을 추가하고 기본값을 `FALSE`로 설정했습니다.
- 다음 단계는 JPA 리포지토리의 삭제 명령을 오버라이드하는 것입니다.

### 3.2 소프트 삭제 어노테이션 적용

- 기본적으로 JPA 리포지토리의 삭제 명령은 SQL DELETE 쿼리를 실행합니다.
- 이를 변경하기 위해 엔티티 클래스에 몇 가지 어노테이션을 추가하겠습니다:

```java
@Entity
@Table(name = "table_product")
@SQLDelete(sql = "UPDATE table_product SET deleted = true WHERE id=?")
@Where(clause = "deleted=false")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private double price;

    private boolean deleted = Boolean.FALSE;
   
    // setter, getter 메서드
}
```

- `@SQLDelete` 어노테이션을 사용하여 삭제 명령을 오버라이드합니다.
  - 이 어노테이션은 삭제 명령을 SQL UPDATE 명령으로 변환하여 데이터를 영구적으로 삭제하는 대신 `deleted` 필드 값을 true로 변경합니다.
- `@Where` 어노테이션은 데이터를 읽을 때 필터를 추가합니다.
  - 위 예시에서는 `deleted = true`인 상품 데이터는 결과에 포함되지 않습니다.

### 3.3 리포지토리 클래스

- 리포지토리 클래스에는 특별한 변경이 필요하지 않습니다.
- Spring Boot 애플리케이션에서 일반적인 리포지토리 클래스처럼 작성할 수 있습니다:

```java
public interface ProductRepository extends CrudRepository<Product, Long> {
    
}
```

### 3.4 서비스 클래스

- 서비스 클래스도 특별한 처리가 필요하지 않습니다.
- 리포지토리에서 원하는 함수를 호출하면 됩니다.
- 다음 예시에서는 레코드를 생성하고 소프트 삭제를 수행하는 세 가지 리포지토리 함수를 호출합니다:

```java
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;

    public Product create(Product product) {
        return productRepository.save(product);
    }

    public void remove(Long id) {
        productRepository.deleteById(id);
    }

    public Iterable<Product> findAll() {
        return productRepository.findAll();
    }
}
```

## 4. 삭제된 데이터 조회하기

- `@Where` 어노테이션을 사용하면 삭제된 상품 데이터를 가져올 수 없습니다.
- 그러나 삭제된 데이터도 접근 가능하게 하고 싶은 경우가 있을 수 있습니다.
  - 예를 들어, 관리자 권한을 가진 사용자가 "삭제된" 데이터를 볼 수 있게 하는 경우입니다.
- 이를 구현하기 위해서는 `@Where` 어노테이션 대신 `@FilterDef`와 `@Filter` 어노테이션을 사용해야 합니다.
- 이 어노테이션들을 사용하면 필요에 따라 조건을 동적으로 추가할 수 있습니다:

```java
@Entity
@Table(name = "table_product")
@SQLDelete(sql = "UPDATE table_product SET deleted = true WHERE id=?")
@FilterDef(name = "deletedProductFilter", parameters = @ParamDef(name = "isDeleted", type = "boolean"))
@Filter(name = "deletedProductFilter", condition = "deleted = :isDeleted")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private double price;

    private boolean deleted = Boolean.FALSE;
}
```

- `@FilterDef` 어노테이션은 `@Filter` 어노테이션에서 사용할 기본 요구사항을 정의합니다.
- 또한 동적 매개변수나 필터를 처리하기 위해 `ProductService` 서비스 클래스의 `findAll()` 함수를 변경해야 합니다:

```java
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private EntityManager entityManager;

    public Product create(Product product) {
        return productRepository.save(product);
    }

    public void remove(Long id) {
        productRepository.deleteById(id);
    }

    public Iterable<Product> findAll(boolean isDeleted) {
        Session session = entityManager.unwrap(Session.class);
        Filter filter = session.enableFilter("deletedProductFilter");
        filter.setParameter("isDeleted", isDeleted);
        Iterable<Product> products = productRepository.findAll();
        session.disableFilter("deletedProductFilter");
        return products;
    }
}
```

- 여기서는 Product 엔티티 읽기 프로세스에 영향을 주는 Filter 객체에 추가할 `isDeleted` 매개변수를 추가했습니다.

:::tip[사용 예시]
```java
// 삭제되지 않은 상품만 조회
productService.findAll(false);

// 삭제된 상품만 조회
productService.findAll(true);
```
:::

## 5. 소프트 삭제의 장단점

### 5.1 장점

- **데이터 보존**: 실수로 삭제된 데이터를 복구할 수 있습니다.
- **감사 및 이력 추적**: 모든 데이터의 변경 이력을 유지할 수 있습니다.
- **참조 무결성**: 다른 엔티티에서 참조하는 데이터를 물리적으로 삭제하지 않아 무결성을 유지할 수 있습니다.
- **비즈니스 요구사항 충족**: 일부 규제 환경에서는 데이터를 영구 삭제하지 않아야 하는 요구사항이 있을 수 있습니다.

### 5.2 단점

- **성능**: 모든 쿼리에 추가 필터가 포함되므로 약간의 성능 저하가 발생할 수 있습니다.
- **복잡성**: 조회 로직이 복잡해질 수 있으며, 특히 여러 테이블을 조인할 때 어려움이 있을 수 있습니다.
- **저장 공간**: 삭제된 데이터도 계속 저장되므로 데이터베이스 크기가 더 커질 수 있습니다.

## 참고

- https://www.baeldung.com/spring-jpa-soft-delete