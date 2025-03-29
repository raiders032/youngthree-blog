---
title: "JPA 지연 로딩과 N+1 문제 해결 전략"
description: "JPA에서 발생하는 N+1 문제의 원인과 다양한 해결 방법을 알아봅니다. 엔티티 직접 노출, DTO 변환, 페치 조인, DTO 직접 조회 등 다양한 성능 최적화 방법을 코드 예제와 함께 설명합니다. 실무에서 JPA 애플리케이션의 성능을 효과적으로 개선하는 기법을 배울 수 있습니다."
tags: ["JPA", "N_PLUS_1", "FETCH_JOIN", "PERFORMANCE", "SPRING_DATA_JPA", "BACKEND", "JAVA"]
keywords: ["JPA 지연 로딩", "N+1 문제", "N plus 1", "페치 조인", "fetch join", "성능 최적화", "엔플러스원", "DTO 변환", "JPQL", "지연 로딩", "Lazy Loading", "즉시 로딩", "Eager Loading", "영속성 컨텍스트", "OSIV", "API 성능", "JPA 성능", "ToOne 관계"]
draft: false
hide_title: true
---

## 1. 지연 로딩과 조회 성능 최적화

- ToOne 관계에서 지연 로딩으로 발생할 수 있는 N+1 문제의 해결법을 알아봅니다.
- 아래 예시에서 `order` -> `member` 와 `order` -> `delivery` 의 관계는 모두 ToOne 관계이며 `fetch = FetchType.LAZY` 로 설정되어 있습니다.

## 2. 엔티티를 직접 노출 버전

- 엔티티를 직접 노출하는 컨트롤러
	- **예시일 뿐 컨트롤러에 엔티티를 직접 노출해서는 안됩니다**
	- `order` -> `member` 와 `order` -> `delivery` 의 관계는 모두 ToOne 관계이며 `fetch = FetchType.LAZY` 로 설정되어 있습니다.
	- 따라서 실제 엔티티 대신 프록시가 존재합니다.
	- jackson 라이브러리는 기본적으로 초기화되지 않은 프록시 객체를 json으로 어떻게 생성해야 하는지 모릅니다
		- 이 문제를 해결하기 위해 `Hibernate5Module` 모듈을 등록합니다
		- 초기화되지 않은 프록시 객체를 `null`로 처리해서 문제를 해결합니다.
		- 그러나 엔티티를 직접 노출하는 것은 좋지 않기 때문에 이 방식을 사용할 일은 없습니다.
- 양방향 연관 관계시 무한 루프 문제를 방지하기 위해 `@JsonIgnore` 사용합니다

### 2.1 예시

```java
@RestController
@RequiredArgsConstructor
public class OrderSimpleApiController {
    private final OrderRepository orderRepository;

    @GetMapping("/api/v1/simple-orders")
    public List<Order> ordersV1() {
        // order를 가져오는 쿼리 1회 실행
        List<Order> all = orderRepository.findAll();
        
        for (Order order : all) {
            // Lazy 강제 초기화: 연관된 member를 가져오기 위한 쿼리 실행
            order.getMember().getName();
            // Lazy 강제 초기화: 연관된 delivery를 가져오기 위한 쿼리 실행
            order.getDelivery().getAddress();
        }
        return all;
    }
}
```

:::danger
즉시 로딩을 설정하면 연관관계가 필요 없는 경우에도 데이터를 항상 조회해서 성능 문제가 발생할 수 있습니다. 즉시 로딩으로 설정하면 성능 튜닝이 매우 어려워 집니다. 항상 지연 로딩을 기본으로 하고, 성능 최적화가 필요한 경우에는 페치 조인(fetch join)을 사용합니다!
:::

## 3. 엔티티를 DTO로 변환하는 버전

- 엔티티를 DTO로 변환하는 일반적인 방법입니다.

### 3.1 예시

```java
@RestController
@RequiredArgsConstructor
public class OrderSimpleApiController {
    private final OrderRepository orderRepository;

    @GetMapping("/api/v2/simple-orders")
    public List<SimpleOrderDto> ordersV2() {
    		// order를 가져오는 쿼리 1회 실행
        List<Order> orders = orderRepository.findAll();
        List<SimpleOrderDto> result = orders
        	.stream()
        	.map(o -> new SimpleOrderDto(o)).collect(toList()); // DTO로 변환에서 쿼리가 2회 실행됩니다.
        return result;
    }

    @Data
    static class SimpleOrderDto {
        private Long orderId;
        private String name;
        private LocalDateTime orderDate;
        private OrderStatus orderStatus;
        private Address address;

        public SimpleOrderDto(Order order) {
            orderId = order.getId();
            name = order.getMember().getName(); // Lazy 강제 초기화: 연관된 member를 가져오기 위한 쿼리 실행
            orderDate = order.getOrderDate();
            orderStatus = order.getStatus();
            address = order.getDelivery().getAddress(); // Lazy 강제 초기화: 연관된 delivery를 가져오기 위한 쿼리 실행
        }
    }
}
```

- 쿼리가 총 1 + N + N번 실행됩니다.
	- `order` 가져오기 1회 총 N개의 order를 가져옵니다.
	- `order` -> `member` 지연 로딩 N번
	- `order` -> `delivery` 지연 로딩 N번
- 엔티티를 직접 노출 버전에서 엔티티를 직접 사용하지 않고 DTO를 사용해 개선했지만 여전히 N + 1 문제가 발생합니다.

## 4. 엔티티를 DTO로 변환 + 페치 조인 최적화 버전

- 엔티티를 DTO로 변환하는 버전의 N + 1 문제를 페치 조인을 이용해 해결해봅니다
- 엔티티를 페치 조인(fetch join)을 사용해서 쿼리 1번에 조회합니다
	- `order` -> `member` 프록시 객체가 아닌 실제 객체이므로 지연로딩하지 않습니다.
	- `order` -> `delivery` 프록시 객체가 아닌 실제 객체이므로 지연로딩하지 않습니다.
- [페치 조인은 JPQL 참고](../JPQL/JPQL.md)

```java
@RestController
@RequiredArgsConstructor
public class OrderSimpleApiController {
  private final OrderRepository orderRepository;

  @GetMapping("/api/v3/simple-orders")
  public List<SimpleOrderDto> ordersV3() {
  	// order를 가져오는 쿼리 1회 실행(fetch join을 사용하여 member와 delivery를 함께 가져옵니다)
    List<Order> orders = orderRepository.findAllWithMemberDelivery();
    List<SimpleOrderDto> result = orders.stream()
      .map(o -> new SimpleOrderDto(o))
      .collect(toList());
    return result;
  }

  public List<Order> findAllWithMemberDelivery() {
    // 페치 조인을 사용해서 연관된 엔티티를 SQL 한 번에 함께 조회하는 것이 가능합니다
		// Order와 연관된 member와 delivery 엔티티를 한번에 조회합니다
    return em.createQuery(
      "select o from Order o" +
      " join fetch o.member m" +
      " join fetch o.delivery d", Order.class)
      .getResultList();
  }

  @Data
  static class SimpleOrderDto {
    private Long orderId;
    private String name;
    private LocalDateTime orderDate;
    private OrderStatus orderStatus;
    private Address address;

    public SimpleOrderDto(Order order) {
      orderId = order.getId();
      name = order.getMember().getName(); // member는 실제 객체 따라서 지연로딩하지 않습니다.
      orderDate = order.getOrderDate();
      orderStatus = order.getStatus();
      address = order.getDelivery().getAddress(); // delivery는 실제 객체 따라서 지연로딩하지 않습니다.
    }
  }
}
```

- 쿼리가 총 1번 실행됩니다.
	- `order` 가져오기 1회 총 N개의 order를 가져옵니다.
  - fetch join을 사용해서 `order` -> `member`와 `order` -> `delivery`를 한번에 가져옵니다
	- 따라서 SimpleOrderDto 생성시 지연 로딩이 발생하지 않습니다.
  - order.getMember() 와 order.getDelivery()를 호출하면 프록시가 아닌 실제 객체를 사용합니다.

## 5. JPA에서 DTO 직접 조회

- 일반적인 SQL을 사용할 때 처럼 원하는 값을 선택해서 조회합니다
- `new` 명령어를 사용해서 JPQL의 결과를 DTO로 즉시 변환합니다
- 리포지토리 재사용성 떨어짐, API 스펙에 맞춘 코드가 리포지토리에 들어가는 단점이 있습니다

### 5.1 예시

```java
@Repository
@RequiredArgsConstructor
public class OrderSimpleQueryRepository {
    private final EntityManager em;

    public List<OrderSimpleQueryDto> findOrderDtos() {
        return em.createQuery(
                "select new jpabook.jpashop.repository.order.simplequery.OrderSimpleQueryDto(o.id, m.name, o.orderDate, o.status, d.address)" +
                " from Order o" +
                " join o.member m" +
                " join o.delivery d", OrderSimpleQueryDto.class)
                .getResultList();
    }
}
```

```java
@Data
public class OrderSimpleQueryDto {
    private Long orderId;
    private String name;
    private LocalDateTime orderDate;
    private OrderStatus orderStatus;
    private Address address;

    public OrderSimpleQueryDto(Long orderId, String name, LocalDateTime
            orderDate, OrderStatus orderStatus, Address address) {
        this.orderId = orderId;
        this.name = name;
        this.orderDate = orderDate;
        this.orderStatus = orderStatus;
        this.address = address;
    }
}
```

## 6. 쿼리 방식 선택 권장 순서

1. 우선 엔티티를 DTO로 변환하는 방법을 선택합니다.
2. 필요하면 페치 조인으로 성능을 최적화 합니다. 대부분의 성능 이슈가 해결됩니다.
3. 그래도 안되면 DTO로 직접 조회하는 방법을 사용합니다.
4. 최후의 방법은 JPA가 제공하는 네이티브 SQL이나 스프링 JDBC Template을 사용해서 SQL을 직접 사용합니다.

**참조**

- https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81%EB%B6%80%ED%8A%B8-JPA-API%EA%B0%9C%EB%B0%9C-%EC%84%B1%EB%8A%A5%EC%B5%9C%EC%A0%81%ED%99%94/dashboard