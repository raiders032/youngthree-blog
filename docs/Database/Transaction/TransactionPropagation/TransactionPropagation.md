---
title: "Transaction Propagation"
description: "스프링의 트랜잭션 전파 속성에 대해 상세히 알아봅니다. 각 전파 옵션의 특징과 실제 사용 사례를 통해 효과적인 트랜잭션 관리 방법을 설명합니다."
tags: ["TRANSACTION", "SPRING", "BACKEND", "DATABASE", "PROGRAMMING"]
keywords: ["트랜잭션", "transaction", "트랜잭션 전파", "propagation", "스프링", "spring", "전파 속성", "전파 레벨", "트랜잭션 관리", "REQUIRED", "REQUIRES_NEW", "SUPPORTS"]
draft: false
hide_title: true
---

## 1. 트랜잭션 전파란?
- 트랜잭션 전파(Transaction Propagation)는 이미 진행 중인 트랜잭션이 있을 때 추가 트랜잭션 처리를 어떻게 할지 정의하는 방식입니다.

:::info
트랜잭션 전파는 주로 **서비스 계층의 메서드 호출** 시 트랜잭션 간의 관계를 설정하는 데 사용됩니다.
:::

### 1.1 전파가 필요한 이유

- 여러 트랜잭션이 중첩되어 실행될 때 어떻게 처리할지 결정해야 함
- 각각의 비즈니스 로직에 맞는 트랜잭션 범위 설정 필요
- 성능과 데이터 일관성 사이의 균형 유지

## 2. 트랜잭션 전파 옵션

스프링에서 제공하는 7가지 전파 옵션에 대해 알아보겠습니다.

### 2.1 REQUIRED (기본값)

```java
@Transactional(propagation = Propagation.REQUIRED)
public void someMethod() {
    // 메서드 내용
}
```

- 가장 많이 사용되는 기본 전파 옵션
- 특징:
    - 진행 중인 트랜잭션이 있으면 참여
    - 없으면 새 트랜잭션 생성
- 사용 시나리오:
    - 대부분의 서비스 메서드
    - 단일 트랜잭션으로 처리되어야 하는 비즈니스 로직

:::warning
REQUIRED를 사용할 때는 예외 처리에 주의해야 합니다. 하나의 트랜잭션에서 발생한 예외가 전체 트랜잭션을 롤백시킬 수 있습니다.
:::

### 2.2 REQUIRES_NEW

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void independentOperation() {
    // 항상 새로운 트랜잭션에서 실행되는 로직
}
```

- 항상 새로운 트랜잭션을 생성
- 특징:
    - 기존 트랜잭션은 일시 중단
    - 새 트랜잭션이 완전히 독립적으로 실행
    - 각각의 트랜잭션이 별도로 커밋/롤백
- 사용 시나리오:
    - 로깅
    - 감사(Audit) 기록
    - 알림 발송

### 2.3 SUPPORTS

```java
@Transactional(propagation = Propagation.SUPPORTS)
public void optionalTransaction() {
    // 트랜잭션이 있으면 참여, 없어도 실행
}
```

- 트랜잭션이 필수가 아닌 경우 사용
- 특징:
    - 진행 중인 트랜잭션이 있으면 참여
    - 없어도 트랜잭션 없이 실행
- 사용 시나리오:
    - 조회 전용 메서드
    - 트랜잭션이 없어도 되는 단순 작업

### 2.4 NOT_SUPPORTED

```java
@Transactional(propagation = Propagation.NOT_SUPPORTED)
public void nonTransactionalOperation() {
    // 트랜잭션 없이 실행되어야 하는 로직
}
```

- 트랜잭션 없이 실행
- 특징:
    - 진행 중인 트랜잭션이 있으면 일시 중단
    - 트랜잭션 없이 실행
- 사용 시나리오:
    - 단순 조회 작업
    - 트랜잭션 오버헤드를 피하고 싶은 경우

### 2.5 MANDATORY

```java
@Transactional(propagation = Propagation.MANDATORY)
public void mustHaveTransaction() {
    // 반드시 트랜잭션 내에서 실행되어야 하는 로직
}
```

- 반드시 트랜잭션 내에서 실행되어야 함
- 특징:
    - 진행 중인 트랜잭션이 없으면 예외 발생
    - 트랜잭션이 있어야만 실행 가능
- 사용 시나리오:
    - 중요한 비즈니스 로직
    - 반드시 트랜잭션 컨텍스트가 필요한 경우

### 2.6 NEVER

```java
@Transactional(propagation = Propagation.NEVER)
public void mustNotHaveTransaction() {
    // 트랜잭션이 있으면 안 되는 로직
}
```

- 트랜잭션이 있으면 안 되는 경우
- 특징:
    - 진행 중인 트랜잭션이 있으면 예외 발생
    - 트랜잭션 없이 실행
- 사용 시나리오:
    - 읽기 전용 작업
    - 트랜잭션이 필요 없는 단순 작업

### 2.7 NESTED

```java
@Transactional(propagation = Propagation.NESTED)
public void nestedOperation() {
    // 중첩 트랜잭션에서 실행되는 로직
}
```

- 중첩 트랜잭션 생성
- 특징:
    - 진행 중인 트랜잭션이 있으면 중첩 트랜잭션 생성
    - 없으면 새 트랜잭션 생성
    - 부모 트랜잭션의 커밋/롤백에 영향을 받음
- 사용 시나리오:
    - 특정 작업을 독립적으로 롤백하고 싶은 경우
    - 대용량 배치 작업

:::warning
NESTED는 모든 데이터베이스에서 지원하지 않을 수 있습니다. 주로 SAVEPOINT를 사용하여 구현됩니다.
:::

## 3. 실제 사용 예시

### 3.1 주문 처리 시스템

```java
@Service
public class OrderService {
    
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private InventoryService inventoryService;
    
    @Transactional
    public void processOrder(Order order) {
        // 메인 트랜잭션 (REQUIRED)
        paymentService.processPayment(order);  // REQUIRED
        inventoryService.updateStock(order);   // REQUIRED
        notificationService.sendEmail(order);  // REQUIRES_NEW
    }
}

@Service
public class NotificationService {
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendEmail(Order order) {
        // 별도의 트랜잭션에서 이메일 발송
        // 실패해도 주문/결제는 영향 없음
    }
}
```

### 3.2 로깅 시스템

```java
@Service
public class AuditService {
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(String action, String user) {
        AuditLog log = new AuditLog(action, user);
        auditRepository.save(log);
    }
}

@Service
public class UserService {
    
    @Autowired
    private AuditService auditService;
    
    @Transactional
    public void updateUser(User user) {
        userRepository.save(user);
        // 로깅은 별도 트랜잭션으로 처리
        auditService.logAction("USER_UPDATE", user.getId());
    }
}
```

## 4. 전파 속성 선택 시 고려사항

### 4.1 성능 고려사항

- 트랜잭션 생성과 관리에는 비용이 발생
- REQUIRES_NEW는 새로운 트랜잭션을 생성하므로 오버헤드 발생
- 불필요한 트랜잭션은 피하는 것이 좋음

### 4.2 데이터 일관성

- REQUIRED는 하나의 트랜잭션으로 묶여 일관성 보장
- REQUIRES_NEW는 독립적인 트랜잭션으로 처리되어 부분 실패 가능
- 비즈니스 요구사항에 따라 적절한 선택 필요

### 4.3 예외 처리

```java
@Service
public class ComplexService {
    
    @Transactional
    public void process() {
        try {
            // 주요 비즈니스 로직
            mainOperation();
            
            // 부가적인 작업 (별도 트랜잭션)
            additionalOperation();
        } catch (Exception e) {
            // 예외 처리
            handleException(e);
        }
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private void additionalOperation() {
        // 실패해도 메인 트랜잭션에 영향 없는 작업
    }
}
```

## 5. 주의사항

### 5.1 자기 호출의 한계

```java
@Service
public class SelfInvocationService {
    
    @Transactional
    public void method1() {
        // 트랜잭션 적용됨
        method2(); // 트랜잭션 적용 안됨!
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void method2() {
        // 같은 클래스 내부 호출은 트랜잭션 적용 안됨
    }
}
```

:::warning
같은 클래스 내의 메서드 호출은 프록시를 통해 동작하는 스프링 AOP의 특성상 트랜잭션 전파가 동작하지 않습니다.
:::

### 5.2 해결 방법

```java
@Service
public class GoodDesignService {
    
    @Autowired
    private GoodDesignService self; // 자기 자신을 주입
    
    @Transactional
    public void method1() {
        // 트랜잭션 적용됨
        self.method2(); // 프록시를 통한 호출로 트랜잭션 적용됨
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void method2() {
        // 정상적으로 새로운 트랜잭션 생성
    }
}
```

## 6. 결론

트랜잭션 전파는 복잡한 비즈니스 로직에서 데이터 일관성을 보장하면서도 유연한 트랜잭션 관리를 가능하게 합니다.
각 전파 옵션의 특성을 이해하고 상황에 맞게 적절히 사용하는 것이 중요합니다.

:::tip
대부분의 경우 기본값인 REQUIRED를 사용하되, 특별한 요구사항이 있는 경우에만 다른 옵션을 고려하세요.
:::

## 참고 자료

- [Spring Transaction Management Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#transaction)
- [Understanding Transaction Propagation in Spring](https://www.baeldung.com/spring-transactional-propagation-isolation)