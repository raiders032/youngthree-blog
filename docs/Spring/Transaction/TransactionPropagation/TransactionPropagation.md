---
title: "Transaction Propagation"
description: "스프링의 트랜잭션 전파(Transaction Propagation)의 개념과 동작 원리를 상세히 알아봅니다. 물리적/논리적 트랜잭션의 차이점, REQUIRED/REQUIRES_NEW/NESTED 등 다양한 전파 옵션들의 특징과 실제 활용 사례를 다루며, rollback-only 처리와 주의사항까지 실전 예제 코드와 함께 설명합니다."
tags: [ "SPRING_TRANSACTION", "PROPAGATION", "SPRING", "JAVA", "BACKEND", "DATABASE" ]
keywords: [
  "스프링", "spring",
  "트랜잭션", "transaction",
  "트랜잭션 전파", "transaction propagation",
  "전파", "propagation",
  "롤백", "rollback",
  "롤백 온리", "rollback only",
  "required", "requires new", "nested",
  "물리적 트랜잭션", "논리적 트랜잭션",
  "스프링부트", "spring boot",
  "@Transactional"
]
draft: false
hide_title: true
---

## 1. 트랜잭션 전파란?

- 트랜잭션 전파(Transaction Propagation)는 진행 중인 트랜잭션의 범위에서 새로운 트랜잭션이 시작될 때, 이 두 트랜잭션을 어떻게 처리할지 결정하는 정책입니다.
- 스프링에서는 `@Transactional` 애노테이션의 `propagation` 속성을 통해 트랜잭션 전파를 설정할 수 있습니다.

### 1.1 주요 트랜잭션 개념

#### 1.1.1 물리적 트랜잭션 vs 논리적 트랜잭션

**물리적 트랜잭션(Physical Transaction)**

- 실제 데이터베이스와의 연결에서 시작되고 커밋 또는 롤백되는 실제 트랜잭션입니다
- 데이터베이스 연결, 커밋, 롤백과 같은 실제 리소스 작업을 수행합니다
- 예: 하나의 데이터베이스 연결에서 실행되는 실제 트랜잭션

**논리적 트랜잭션(Logical Transaction)**

- 스프링이 트랜잭션 범위를 관리하기 위해 사용하는 개념적인 트랜잭션 단위입니다
- `@Transactional`이 적용된 각 메서드는 하나의 논리적 트랜잭션 범위를 가집니다
- 여러 논리적 트랜잭션이 하나의 물리적 트랜잭션을 공유할 수 있습니다

#### 1.1.2 외부 트랜잭션 vs 내부 트랜잭션

**외부 트랜잭션(Outer Transaction)**

- 먼저 시작된 트랜잭션을 의미합니다
- 다른 트랜잭션을 포함하는 더 큰 범위의 트랜잭션입니다

**내부 트랜잭션(Inner Transaction)**

- 이미 진행 중인 트랜잭션(외부 트랜잭션) 안에서 시작되는 새로운 트랜잭션입니다

**예시**

```java
@Transactional
public void outer() {  // 외부 트랜잭션
  inner();  // 내부 트랜잭션 호출
}

@Transactional
public void inner() {  // 내부 트랜잭션
// 외부 트랜잭션 내에서 실행됨
}
```

### 1.2 트랜잭션 관계의 예시

다음 코드로 이해해봅시다:

```java
@Service
public class OrderService {
    @Transactional  // 외부 트랜잭션
    public void processOrder(Order order) {  // 논리적 트랜잭션 시작
        orderRepository.save(order);
        paymentService.processPayment(order);  // 내부 트랜잭션 호출
    }  // 논리적 트랜잭션 종료
}

@Service
public class PaymentService {
    @Transactional  // 내부 트랜잭션
    public void processPayment(Order order) {  // 새로운 논리적 트랜잭션 시작
        // PROPAGATION_REQUIRED인 경우:
        // - 외부 트랜잭션의 물리적 트랜잭션을 재사용
        // PROPAGATION_REQUIRES_NEW인 경우:
        // - 새로운 물리적 트랜잭션 시작
    }  // 논리적 트랜잭션 종료
}
```

1. `processOrder()`는 외부 트랜잭션이며 하나의 논리적 트랜잭션 범위를 가집니다
2. `processPayment()`는 내부 트랜잭션이며 별도의 논리적 트랜잭션 범위를 가집니다
3. 전파 설정에 따라 이 두 논리적 트랜잭션이 하나의 물리적 트랜잭션을 공유할지(REQUIRED) 또는 별도의 물리적 트랜잭션을 사용할지(REQUIRES_NEW) 결정됩니다

## 2. 스프링의 트랜잭션 전파 설정

- 스프링에서는 `@Transactional` 애노테이션의 `propagation` 속성을 통해 트랜잭션 전파를 설정할 수 있습니다.
- 전파 옵션
  - `REQUIRED`: 기본값, 외부 트랜잭션이 있으면 참여하고, 없으면 새로운 트랜잭션을 시작합니다
  - `REQUIRES_NEW`: 외부 트랜잭션을 일시 중단하고 새로운 트랜잭션을 시작합니다
  - `NESTED`: 중첩 트랜잭션을 생성합니다
  - `SUPPORTS`: 외부 트랜잭션이 있으면 참여하고, 없으면 트랜잭션 없이 실행합니다
  - `NOT_SUPPORTED`: 외부 트랜잭션을 일시 중단하고 트랜잭션 없이 실행합니다
  - `NEVER`: 외부 트랜잭션이 있으면 예외를 발생시킵니다

**예시**

```java
@Transactional(propagation = Propagation.REQUIRED)
public void createPost(Post post) {
    // 게시글 저장 로직
}
```

- `@Transactional` 애노테이션의 `propagation` 속성을 통해 트랜잭션 전파 설정 가능
- `Propagation.REQUIRED`는 기본값으로, 외부 트랜잭션이 있으면 참여하고, 없으면 새로운 트랜잭션을 시작합니다

## 3. 주요 전파 옵션 살펴보기

### 3.1 REQUIRED (기본값)

- 가장 많이 사용되는 기본 옵션입니다. 진행 중인 트랜잭션이 있으면 그것을 사용하고, 없으면 새로 시작합니다.
- 스프링 공식 문서에 따르면, `PROPAGATION_REQUIRED`는 현재 범위에 대해 물리적 트랜잭션을 강제합니다.
  - 각각의 @Transactional 메서드는 자신만의 논리적 트랜잭션 범위를 가지지만 반드시 하나의 물리적 트랜잭션을 공유한다는 의미입니다
  - 즉, 데이터베이스와의 실제 연결은 하나만 사용되고, 커밋과 롤백도 이 하나의 물리적 트랜잭션에서 이루어집니다
- 이미 트랜잭션이 존재한다면 그 '외부' 트랜잭션에 참여하고, 없다면 새로운 트랜잭션을 생성합니다.
- 이는 동일 스레드 내의 일반적인 호출 스택 구성(예: 여러 리포지토리 메서드에 위임하는 서비스 파사드)에서 적합한 기본값입니다.

#### 3.1.1 논리적 트랜잭션과 롤백 동작

- `PROPAGATION_REQUIRED` 설정이 적용된 각 메서드에 대해 논리적 트랜잭션 범위가 생성됩니다.
- **논리적 트랜잭션의 독립성**:
  - 각 논리적 트랜잭션 범위는 독립적으로 롤백 여부를 결정할 수 있습니다.
  - 예를 들어, 내부 메서드에서 문제가 발생하면 해당 메서드는 rollback-only 마커를 설정할 수 있습니다.
- **물리적 트랜잭션 공유**:
  - 모든 논리적 트랜잭션은 하나의 물리적 트랜잭션을 공유합니다.
  - 한 곳에서 rollback-only로 마킹되면, 전체 트랜잭션이 롤백되어야 합니다.
- **UnexpectedRollbackException 발생**:
  - 내부 트랜잭션이 rollback-only 마커를 설정했지만 외부 트랜잭션은 이를 인식하지 못한 채 커밋을 시도하는 경우
  - 스프링은 `UnexpectedRollbackException`을 발생시킵니다.
  - 이는 의도된 동작으로, 트랜잭션 호출자가 실제로는 롤백된 트랜잭션이 커밋되었다고 잘못 이해하는 것을 방지합니다.

**예시**

```java
@Service
@Transactional
public class OrderService {
    @Autowired
    private PaymentService paymentService;
    
    public void processOrder(Order order) {  // 외부 트랜잭션 시작
        orderRepository.save(order);
        
        try {
            // 내부 트랜잭션 시작 (같은 물리적 트랜잭션 사용)
            paymentService.processPayment(order);
        } catch (Exception e) {
            // 이 catch 블록이 있더라도,
            // 내부 트랜잭션이 이미 rollback-only를 설정했다면
            // 전체 트랜잭션은 롤백됩니다.
            log.error("결제 처리 실패", e);
        }
        
        // 여기서 커밋을 시도하지만, 내부 트랜잭션이 rollback-only를 설정했다면
        // UnexpectedRollbackException이 발생합니다.
    }  // 외부 트랜잭션 종료
}

@Service
public class PaymentService {
    @Transactional(propagation = Propagation.REQUIRED)
    public void processPayment(Order order) {
        if (!isValidPayment(order)) {
            // 문제가 발생하면 rollback-only 마커 설정
            // 이 마커는 이 트랜잭션이 반드시 롤백되어야 함을 나타냅니다
            TransactionAspectSupport.currentTransactionStatus()
                .setRollbackOnly();
            throw new PaymentException("잘못된 결제 정보");
        }
        paymentRepository.save(order.getPayment());
    }
}
```

- `processOrder()`는 외부 트랜잭션을 시작하고, `paymentService.processPayment()`를 호출합니다.
- `processPayment()`는 REQUIRED 전파 설정으로 내부 트랜잭션을 시작하며, 결제 처리 중 문제가 발생하면 rollback-only 마커를 설정합니다.
- 외부 트랜잭션은 내부 트랜잭션의 롤백 여부를 인식하고, 내부 트랜잭션이 롤백되면 전체 트랜잭션도 롤백됩니다.

#### 3.1.2 트랜잭션 특성 승계

- 기본적으로 참여하는 트랜잭션은 외부 범위의 특성을 승계하여 자신의 로컬 격리 수준, 타임아웃 값, 읽기 전용 플래그 등을 자동으로 무시됩니다.
  - 따라서 내부 트랜잭션이 자신의 격리 수준을 설정하더라고 무시되며 외부 트랜잭션의 격리 수준을 따릅니다.
  - 이는 하나의 물리적 트랜잭션을 공유하기 때문입니다.
  - 기본적으로는 내부 트랜잭션의 설정을 "조용히 무시"합니다.
- 만약 트랜잭션의 안정성을 위해 다른 격리 수준을 가진 기존 트랜잭션에 참여할 때 격리 수준 선언이 거부되기를 원한다면,
  - 트랜잭션 매니저의 `validateExistingTransactions` 플래그를 `true`로 설정하면 됩니다.
  - 이렇게 하면 격리 수준이 일치하지 않을 때 예외가 발생합니다.

### 3.2 REQUIRES_NEW

- `PROPAGATION_REQUIRES_NEW`는
  `PROPAGATION_REQUIRED`와 달리, 각각의 영향을 받는 트랜잭션 범위에 대해 항상 독립적인 물리적 트랜잭션을 사용하며, 외부 범위의 기존 트랜잭션에 절대 참여하지 않습니다.
- 스프링 공식 문서에 따르면, 이러한 구성에서는 기본 리소스 트랜잭션이 서로 다르기 때문에 독립적으로 커밋되거나 롤백될 수 있습니다.
- 내부 트랜잭션의 롤백 상태가 외부 트랜잭션에 영향을 주지 않으며, 내부 트랜잭션의 잠금은 완료 즉시 해제됩니다.
- 또한 이러한 독립적인 내부 트랜잭션은 자체적으로 격리 수준, 타임아웃, 읽기 전용 설정을 선언할 수 있으며, 외부 트랜잭션의 특성을 상속받지 않습니다.

```java
@Service
@Transactional
public class OrderService {
    private final PaymentService paymentService;
    
    public void processOrder(Order order) {
        // 주문 정보 저장
        orderRepository.save(order);
        
        try {
            // 결제 처리 (새로운 트랜잭션에서 실행)
            paymentService.processPayment(order);
        } catch (PaymentException e) {
            // 결제 실패 시에도 주문 정보는 저장됨
            order.setStatus(OrderStatus.PAYMENT_FAILED);
            orderRepository.save(order);
        }
    }
}

@Service
public class PaymentService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processPayment(Order order) {
        // 결제 처리 로직
        // 실패해도 주문 트랜잭션에 영향 없음
    }
}
```

- REQUIRES_NEW를 사용하면 결제 처리가 실패해도 주문 정보는 저장됩니다.

### 3.3 NESTED

- `PROPAGATION_NESTED`는 단일 물리적 트랜잭션 내에서 여러 개의 저장점(savepoint)을 사용하여 롤백할 수 있는 지점을 만듭니다.
- 스프링 공식 문서에 따르면, 이러한 부분 롤백을 통해 내부 트랜잭션 범위가 자신의 범위에 대한 롤백을 트리거할 수 있으며, 외부 트랜잭션은 일부 작업이 롤백되었음에도 불구하고 물리적 트랜잭션을 계속 진행할 수 있습니다.
- 이 설정은 일반적으로 JDBC 저장점에 매핑되므로 JDBC 리소스 트랜잭션에서만 작동합니다.

```java
@Service
@Transactional
public class ArticleService {
    private final ImageService imageService;
    
    public void createArticle(Article article, List<Image> images) {
        // 게시글 저장
        articleRepository.save(article);
        
        try {
            // 이미지 처리 (중첩 트랜잭션에서 실행)
            imageService.saveImages(images);
        } catch (ImageProcessingException e) {
            // 이미지 저장 실패해도 게시글은 저장됨
            article.setHasImages(false);
            articleRepository.save(article);
        }
    }
}

@Service
public class ImageService {
    @Transactional(propagation = Propagation.NESTED)
    public void saveImages(List<Image> images) {
        // 이미지 저장 로직
    }
}
```

## 4. 실제 활용 시나리오

### 4.1 포인트 시스템

```java
@Service
@Transactional
public class ShoppingService {
    private final OrderService orderService;
    private final PointService pointService;
    
    public void purchase(Order order) {
        // 주문 처리 (메인 트랜잭션)
        orderService.createOrder(order);
        
        try {
            // 포인트 적립 (독립적인 트랜잭션)
            pointService.addPoint(order.getUser(), calculatePoints(order));
        } catch (Exception e) {
            // 포인트 적립 실패해도 주문은 완료
            log.error("포인트 적립 실패", e);
        }
    }
}

@Service
public class PointService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void addPoint(User user, int point) {
        // 포인트 적립 로직
    }
}
```

## 5. 주의사항

### 5.1 REQUIRES_NEW 사용 시 주의점

- 스프링 공식 문서는 `REQUIRES_NEW` 사용 시 다음과 같은 중요한 주의사항을 언급합니다:
  - 외부 트랜잭션에 연결된 리소스는 그대로 유지되는 반면, 내부 트랜잭션은 새로운 데이터베이스 연결과 같은 자체 리소스를 획득합니다.
  - 이는 연결 풀 고갈로 이어질 수 있으며, 여러 스레드가 활성 외부 트랜잭션을 가지고 내부 트랜잭션을 위한 새 연결을 획득하기 위해 대기하는 경우 데드락이 발생할 수 있습니다.
  - 따라서 연결 풀 크기가 적절히 설정되어 있지 않다면 `REQUIRES_NEW`를 사용하지 마십시오.
  - 연결 풀 크기는 동시 실행 스레드 수보다 최소 1 이상 커야 합니다.

### 5.2 기타 주의사항

- 트랜잭션 전파 설정은 프록시를 통한 호출에서만 동작합니다. 같은 클래스 내의 내부 메서드 호출에서는 전파 설정이 적용되지 않습니다.
- NESTED는 모든 데이터베이스가 지원하지 않을 수 있으므로, 사용 전 확인이 필요합니다.
- `REQUIRED` 전파 설정에서 내부 트랜잭션이 롤백 전용으로 표시되면, 외부 호출자가 예상하지 못한 롤백이 발생할 수 있으며 이 경우 `UnexpectedRollbackException`이 발생합니다.

## 6. 결론

- 트랜잭션 전파는 복잡한 비즈니스 로직에서 데이터 일관성을 유지하면서도 유연한 트랜잭션 관리를 가능하게 합니다.
- 각 전파 옵션의 특징을 이해하고 상황에 맞게 적절히 사용하면, 더 안정적이고 유지보수하기 쉬운 애플리케이션을 구축할 수 있습니다.