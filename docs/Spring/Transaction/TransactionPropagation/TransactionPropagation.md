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
  "@Transaction"
]
draft: false
hide_title: true
---

## 1. 트랜잭션 전파란?

- 트랜잭션 전파(Transaction Propagation)는 진행 중인 트랜잭션의 범위에서 새로운 트랜잭션이 시작될 때, 이 두 트랜잭션을 어떻게 처리할지 결정하는 정책입니다.
- 스프링에서는 `@Transactional` 애노테이션의 `propagation` 속성을 통해 트랜잭션 전파를 설정할 수 있습니다.
- 트랜잭션 전파(Transaction Propagation)는 스프링 프레임워크에서 제공하는 기능으로, 데이터베이스 자체에 있는 기능이 아닙니다.
	- 스프링은 여러 데이터베이스 트랜잭션 관리 방식을 추상화하여 일관된 API로 제공합니다.
	- 데이터베이스는 단순히 트랜잭션의 시작(BEGIN), 커밋(COMMIT), 롤백(ROLLBACK)만 알고 있습니다.
	- 중첩 트랜잭션이나 트랜잭션 간 관계는 데이터베이스가 아닌 스프링이 관리합니다.
	- 스프링은 TransactionManager를 사용하여 트랜잭션 상태를 추적하고 관리합니다.
	- 트랜잭션 동기화 매니저(Transaction Synchronization Manager)를 통해 현재 쓰레드의 트랜잭션 정보를 유지합니다.

### 1.1 주요 트랜잭션 개념

#### 1.1.1 물리적 트랜잭션 vs 논리적 트랜잭션

##### 물리적 트랜잭션(Physical Transaction)

- 실제 데이터베이스와의 연결에서 시작되고 커밋 또는 롤백되는 실제 트랜잭션입니다.
- 데이터베이스 연결, 커밋, 롤백과 같은 실제 리소스 작업을 수행합니다.
- 실제 커넥션을 통해서 트랜잭션을 시작( `setAutoCommit(false))` 하고, 실제 커넥션을 통해서 커밋, 롤백하는 단위입니다.
- 예: 하나의 데이터베이스 연결에서 실행되는 실제 트랜잭션.

##### 논리적 트랜잭션(Logical Transaction)

- 스프링이 트랜잭션 범위를 관리하기 위해 사용하는 개념적인 트랜잭션 단위입니다
- **`@Transactional`이 적용된 각 메서드는 하나의 논리적 트랜잭션 범위를 가집니다**
- 여러 논리적 트랜잭션이 하나의 물리적 트랜잭션을 공유할 수 있습니다.
	- 즉 하나의 물리적 트랜잭션 안에 여러 개의 논리적 트랜잭션이 존재할 수 있습니다.
	- 다시 말하면 물리적 트랜잭션이 여러개의 논리적 트랜잭션을 묶는 컨테이너와 같은 역할을 한다고 볼 수 있습니다.
- 논리 트랜잭션은 트랜잭션 매니저를 통해 트랜잭션을 사용하는 단위입니다.

##### 원칙

- 모든 논리 트랜잭션이 커밋되어야 물리 트랜잭션이 커밋됩니다.
- 하나의 논리 트랜잭션이라도 롤백되면 물리 트랜잭션은 롤백됩니다.

#### 1.1.2 외부 트랜잭션 vs 내부 트랜잭션

##### 외부 트랜잭션(Outer Transaction)

- 먼저 시작된 트랜잭션을 의미합니다
- 다른 트랜잭션을 포함하는 더 큰 범위의 트랜잭션입니다.
- 처음 트랜잭션을 시작한 외부 트랜잭션이 물리 트랜잭션을 관리하도록 합니다.

##### 내부 트랜잭션(Inner Transaction)

- 이미 진행 중인 트랜잭션(외부 트랜잭션) 안에서 시작되는 새로운 트랜잭션입니다.

##### 예시

```java
@Test
void inner_commit() {
    log.info("외부 트랜잭션 시작");
    TransactionStatus outer = txManager.getTransaction(new DefaultTransactionAttribute());
    log.info("outer.isNewTransaction()={}", outer.isNewTransaction());
    
    log.info("내부 트랜잭션 시작");
    TransactionStatus inner = txManager.getTransaction(new DefaultTransactionAttribute());
    log.info("inner.isNewTransaction()={}", inner.isNewTransaction());
    
    log.info("내부 트랜잭션 커밋");
    txManager.commit(inner);
    
    log.info("외부 트랜잭션 커밋");
    txManager.commit(outer);
}
```

- TransactionStatus은 트랜잭션의 상태를 나타내는 인터페이스입니다.
	- [레퍼런스](https://docs.spring.io/spring-framework/docs/4.3.17.RELEASE_to_4.3.18.RELEASE/Spring%20Framework%204.3.18.RELEASE/org/springframework/transaction/TransactionStatus.html)
- `outer.isNewTransaction()`은 true를 반환합니다. 외부 트랜잭션이 새로 시작되었음을 나타냅니다.
- `inner.isNewTransaction()`은 false를 반환합니다. 내부 트랜잭션이 외부 트랜잭션에 참여하고 있음을 나타냅니다.

#### 1.1.3 중복 커밋 문제

- 위 코드에서 재미있는 부분은 commit을 2번 하는 것입니다.
- 내부 트랜잭션을 시작할 때 `Participating in existing transaction` 이라는 메시지를 확인할 수 있다.
- 이 메시지는 내부 트랜잭션이 기존에 존재하는 외부 트랜잭션에 참여한다는 뜻이다.
- 실행 결과를 보면 외부 트랜잭션을 시작하거나 커밋할 때는 DB 커넥션을 통한 물리 트랜잭션을 시작(`manual commit` )하고, DB 커넥션을 통해 커밋 하는 것을 확인할 수 있다.
- 그러나 내부 트랜잭션을 시작하거나 커밋할 때는 DB 커넥션을 통해 커밋하는 로그를 전혀 확인할 수 없습니다.
- 만약 내부 트랜잭션이 실제 물리 트랜잭션을 커밋하면 트랜잭션이 끝나버립니다. 때문에, 트랜잭션을 처음 시작한 외부 트랜잭션까지 이어갈 수 없습니다.
- 따라서 내부 트랜잭션은 DB 커넥션을 통한 물리 트랜잭션을 커밋하면 안됩니다.
- 스프링은 이렇게 여러 트랜잭션이 함께 사용되는 경우, **처음 트랜잭션을 시작한 외부 트랜잭션이 실제 물리 트랜잭션을 관리**하도록 합니다.
- 이를 통해 트랜잭션 중복 커밋 문제를 해결한다.

##### 동작 과정

- `txManager.getTransaction()`를 호출해서 외부 트랜잭션을 시작합니다.
- 트랜잭션 매니저는 데이터소스를 통해 커넥션을 생성합니다.
- 생성한 커넥션을 수동 커밋 모드(`setAutoCommit(false)`)로 설정합니다.
  - 물리 트랜잭션을 시작합니다.
- 트랜잭션 매니저는 트랜잭션 동기화 매니저에 커넥션을 보관합니다.
- 트랜잭션 매니저는 트랜잭션을 생성한 결과를 `TransactionStatus`에 담아서 반환합니다.
  - 여기에 신규 트랜잭션의 여부가 담겨 있습니다.
  - `isNewTransaction`를 통해 신규 트랜잭션 여부를 확인할 수 있습니다. 
  - 트랜잭션을 처음 시작했으므로 신규 트랜잭션입니다.(`true`)
- 로직1이 사용되고, 커넥션이 필요한 경우 트랜잭션 동기화 매니저를 통해 트랜잭션이 적용된 커넥션을 획득해서 사용합니다.
- `txManager.getTransaction()`를 호출해서 내부 트랜잭션을 시작합니다.
- 트랜잭션 매니저는 트랜잭션 동기화 매니저를 통해서 기존 트랜잭션이 존재하는지 확인합니다.
- 기존 트랜잭션이 존재하므로 기존 트랜잭션에 참여합니다. 기존 트랜잭션에 참여한다는 뜻은 사실 아무것도 하지 않는다는 뜻입니다.
- 이미 기존 트랜잭션인 외부 트랜잭션에서 물리 트랜잭션을 시작했습니다. 그리고 물리 트랜잭션이 시작된 커넥션을 트랜잭션 동기화 매니저에 담아두었습니다.
- 따라서 이미 물리 트랜잭션이 진행 중이므로 그냥 두면 이후 로직이 기존에 시작된 트랜잭션을 자연스럽게 사용하게 되는 것입니다.
- 이후 로직은 자연스럽게 트랜잭션 동기화 매니저에 보관된 기존 커넥션을 사용하게 됩니다.
- 트랜잭션 매니저는 트랜잭션을 생성한 결과를 `TransactionStatus`에 담아서 반환하는데, 여기에서 `isNewTransaction`를 통해 신규 트랜잭션 여부를 확인할 수 있습니다.
  - 여기서는 기존 트랜잭션에 참여했기 때문에 신규 트랜잭션이 아닙니다. (`false`)
- 로직2가 사용되고, 커넥션이 필요한 경우 트랜잭션 동기화 매니저를 통해 외부 트랜잭션이 보관한 커넥션을 획득해서 사용합니다.
- 로직2가 끝나고 트랜잭션 매니저를 통해 내부 트랜잭션을 커밋합니다.
- 트랜잭션 매니저는 커밋 시점에 신규 트랜잭션 여부에 따라 다르게 동작합니다.
  - 이 경우 신규 트랜잭션이 아니기 때문에 실제 커밋을 호출하지 않습니다.
  - 이 부분이 중요한데, 실제 커넥션에 커밋이나 롤백을 호출하면 물리 트랜잭션이 끝나버립니다.
  - 아직 트랜잭션이 끝난 것이 아니기 때문에 실제 커밋을 호출하면 안됩니다.
- 로직1이 끝나고 트랜잭션 매니저를 통해 외부 트랜잭션을 커밋합니다.
  - 트랜잭션 매니저는 커밋 시점에 신규 트랜잭션 여부에 따라 다르게 동��합니다.
  - 외부 트랜잭션은 신규 트랜잭션입니다. 따라서 DB 커넥션에 실제 커밋을 호출합니다.
  - 트랜잭션 매니저에 커밋하는 것이 논리적인 커밋이라면, 실제 커넥션에 커밋하는 것을 물리 커밋이라 할 수 있습니다.
  - 실제 데이터베이스에 커밋이 반영되고, 물리 트랜잭션도 끝납니다.

#### 1.1.4 내부 트랜잭션 롤백

- 모든 논리 트랜잭션이 커밋되어야 물리 트랜잭션이 커밋됩니다.
- 따라서 논리 트랜잭션이 하나라도 롤백되면 물리 트랜잭션도 롤백됩니다.
- 앞서 살펴본 내부 트랜잭션은 커밋 또는 롤백을 하지 않습니다.
  - 그 이유는 최상위 외부 트랜잭션이 물리 트랜잭션을 관리하기 때문입니다. (최상위 외부 트랜잭션의 여부는 `isNewTransaction()`을 통해 확인할 수 있습니다.)
  - 따라서 내부 트랜잭션에서 롤백을하면 실제 물리 트랜잭션을 롤백하는 것이 아니라 해당 트랜잭션을 rollback-only로 설정합니다.
- 이제 최상위 외부 트랜잭션이 커밋을 시도할 때, 내부 트랜잭션이 rollback-only로 설정되어 있으면 물리 트랜잭션은 롤백하고 `UnexpectedRollbackException` 예외를 던집니다.
	- `UnexpectedRollbackException`은 스프링에서 제공하는 예외로, 런타임 예외입니다.

## 2. 스프링의 트랜잭션 전파 설정

- 스프링에서는 `@Transactional` 애노테이션의 `propagation` 속성을 통해 트랜잭션 전파를 설정할 수 있습니다.
- 전파 옵션
	- `REQUIRED`: 기본값, 외부 트랜잭션이 있으면 참여하고, 없으면 새로운 트랜잭션을 시작합니다
	- `REQUIRES_NEW`: 외부 트랜잭션을 일시 중단하고 새로운 트랜잭션을 시작합니다
	- `NESTED`: 중첩 트랜잭션을 생성합니다
	- `SUPPORTS`: 외부 트랜잭션이 있으면 참여하고, 없으면 트랜잭션 없이 실행합니다
	- `NOT_SUPPORTED`: 외부 트랜잭션을 일시 중단하고 트랜잭션 없이 실행합니다
	- `NEVER`: 외부 트랜잭션이 있으면 예외를 발생시킵니다

### 2.1 예시 코드

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

- 진행 중인 트랜잭션이 있으면 그것을 사용하고, 없으면 새로 시작합니다.
- 가장 많이 사용되는 기본 옵션입니다.
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

- 새로운 물리 트랜잭션을 시작하고, 외부 트랜잭션이 존재하면 이를 일시 중지합니다.
- `PROPAGATION_REQUIRES_NEW`는 항상 독립적인 물리적 트랜잭션을 사용하며, 외부 범위의 기존 트랜잭션에 절대 참여하지 않습니다.
- 스프링 공식 문서에 따르면, 이러한 구성에서는 기본 리소스 트랜잭션이 서로 다르기 때문에 독립적으로 커밋되거나 롤백될 수 있습니다.
- 내부 트랜잭션의 롤백 상태가 외부 트랜잭션에 영향을 주지 않으며, 내부 트랜잭션의 잠금은 완료 즉시 해제됩니다.
- 또한 이러한 독립적인 내부 트랜잭션은 자체적으로 격리 수준, 타임아웃, 읽기 전용 설정을 선언할 수 있으며, 외부 트랜잭션의 특성을 상속받지 않습니다.
- REQUIRES_NEW` 를 사용하면 데이터베이스 커넥션이 동시에 2개 사용된다는 점을 주의해야 합니다.

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

#### 3.2.1 REQUIRES_NEW 주의 사항

- 스프링 공식 문서는 `REQUIRES_NEW` 사용 시 다음과 같은 중요한 주의사항을 언급합니다.
- 외부 트랜잭션에 연결된 리소스는 그대로 유지되는 반면, 내부 트랜잭션은 새로운 데이터베이스 연결과 같은 자체 리소스를 획득합니다.
- 이는 연결 풀 고갈로 이어질 수 있으며, 여러 스레드가 활성 외부 트랜잭션을 가지고 내부 트랜잭션을 위한 새 연결을 획득하기 위해 대기하는 경우 데드락이 발생할 수 있습니다.
- 따라서 연결 풀 크기가 적절히 설정되어 있지 않다면 `REQUIRES_NEW`를 사용하지 마십시오.
- 연결 풀 크기는 동시 실행 스레드 수보다 최소 1 이상 커야 합니다.

##### 동작 과정

- 외부 트랜잭션이 실행 중일 때 REQUIRES_NEW가 설정된 메서드가 호출되면, 스프링은 일단 외부 트랜잭션을 일시 중지합니다.
- 새로운 물리적 트랜잭션(내부 트랜잭션)을 시작하고, 이를 위해 새로운 데이터베이스 연결을 획득합니다.
- 내부 트랜잭션이 완료(커밋 또는 롤백)될 때까지 외부 트랜잭션은 일시 중지 상태를 유지합니다.
- 내부 트랜잭션이 완료되면 외부 트랜잭션이 다시 활성화되어 계속 진행됩니다.
- 중요한 점은 이 과정에서 두 개의 별도 데이터베이스 연결이 사용된다는 것입니다.

### 3.3 SUPPORT

- `PROPAGATION_SUPPORTS`는 외부 트랜잭션이 있으면 참여하고, 없으면 트랜잭션 없이 실행합니다.

### 3.4 NOT_SUPPORT

- 트랜잭션 없이 실행합니다. 외부 트랜잭션이 있으면 일시 중단합니다.

### 3.5 MANDATORY

- `PROPAGATION_MANDATORY`는 외부 트랜잭션이 반드시 존재해야 하며, 없으면 예외를 발생시킵니다.
- 트랜잭션이 없으면 `IllegalTransactionStateException`이 발생합니다.

### 3.6 NEVER

- `PROPAGATION_NEVER`는 트랜잭션을 사용하지 않는다는 의미입니다.
- 기존 트랜잭션이 있으면 `IllegalTransactionStateException` 예외를 발생시킵니다.

### 3.7 NESTED

- `PROPAGATION_NESTED`는 중첩 트랜잭션을 생성합니다.
- 기존 트랜잭션이 없으면 새로운 트랜잭션을 시작합니다.
- 기존 트랜잭션이 있으면 중첩 트랜잭션을 생성합니다.
	- 중첩 트랜잭션은 외부 트랜잭션의 영향을 받지만 중첩 트랜잭션은 외부에 영향을 주지 않습니다.
	- 즉 중첩 트랜잭션이 롤백되어도 외부 트랜잭션은 커밋할 수 있습니다.
	- 외부 트랜잭션이 롤백 되면 중첩 트랜잭션도 함께 롤백됩니다.

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

## 참고

- https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html
- https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/Propagation.html
- https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-db-2/dashboard