---
title: "Spring Transaction"
description: "Spring의 트랜잭션 관리 방식, PlatformTransactionManager, 트랜잭션 동기화, @Transactional 어노테이션의 속성과 예외 처리 전략까지 상세히 설명합니다. 실제 예시 코드와 함께 프로그래밍 방식 및 선언적 트랜잭션 관리를 이해하고 JPA와 JdbcTemplate을 함께 사용하는 방법을 알아봅니다."
tags: [ "SPRING", "TRANSACTION", "JPA", "JDBC", "MYBATIS", "JAVA", "BACKEND" ]
keywords: [ "스프링", "Spring", "트랜잭션", "Transaction", "PlatformTransactionManager", "트랜잭션 매니저", "트랜잭션 동기화", "ThreadLocal", "JpaTransactionManager", "DataSourceTransactionManager", "@Transaction", "선언적 트랜잭션", "프로그래밍 방식 트랜잭션", "트랜잭션 전파", "propagation", "isolation", "롤백", "rollback", "rollbackFor", "예외처리", "exception handling", "checked exception", "unchecked exception", "트랜잭션 격리 수준", "readOnly", "timeout" ]
draft: false
hide_title: true
---

## 1. Spring Transaction

- Spring Framework는 선언적 트랜잭션 관리와 프로그래밍 방식 트랜잭션 관리를 모두 지원합니다.
- 트랜잭션은 데이터베이스 작업의 논리적 단위로, ACID 속성(원자성, 일관성, 격리성, 지속성)을 보장합니다.
- Spring은 다양한 트랜잭션 관리자를 제공하여 JDBC, JPA, Hibernate 등 여러 기술과 통합할 수 있습니다.
- 기본적으로 PlatformTransactionManager 인터페이스를 통해 트랜잭션을 추상화합니다.

## 2. PlatformTransactionManager

### 2.1 PlatformTransactionManager의 필요성

- 각각의 데이터 접근 기술들은 트랜잭션을 처리하는 방식에 차이가 있습니다.
- JDBC 기술과 JPA 기술은 트랜잭션을 사용하는 코드 자체가 완전히 다릅니다.
- 아래는 두 기술의 트랜잭션 처리 방식 비교입니다.

#### JDBC 트랜잭션 코드 예시

```java
public void accountTransfer(String fromId, String toId, int money) throws SQLException {
    Connection con = null;
    try {
        con = dataSource.getConnection();
        con.setAutoCommit(false); // 트랜잭션 시작
        
        // 비즈니스 로직
        bizLogic(con, fromId, toId, money);
        
        con.commit(); // 성공시 커밋
    } catch (Exception e) {
        if (con != null) {
            con.rollback(); // 실패시 롤백
        }
        throw new IllegalStateException(e);
    } finally {
        if (con != null) {
            release(con);
        }
    }
}
```

#### JPA 트랜잭션 코드 예시

```java
public static void main(String[] args) {
    // 엔티티 매니저 팩토리 생성
    EntityManagerFactory emf = Persistence.createEntityManagerFactory("jpabook");
    EntityManager em = emf.createEntityManager(); // 엔티티 매니저 생성
    EntityTransaction tx = em.getTransaction(); // 트랜잭션 기능 획득
    
    try {
        tx.begin(); // 트랜잭션 시작
        logic(em); // 비즈니스 로직
        tx.commit(); // 트랜잭션 커밋
    } catch (Exception e) {
        tx.rollback(); // 트랜잭션 롤백
    } finally {
        em.close(); // 엔티티 매니저 종료
    }
    emf.close(); // 엔티티 매니저 팩토리 종료
}
```

#### 스프링 트랜잭션 추상화 사용 코드 예시

```java
public void accountTransfer(String fromId, String toId, int money) {
    // 트랜잭션 매니저를 통한 일관된 방식의 트랜잭션 처리
    TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());
    
    try {
        // 비즈니스 로직 - JDBC 또는 JPA 등 다양한 데이터 접근 기술 사용 가능
        bizLogic(fromId, toId, money);
        
        transactionManager.commit(status); // 성공시 커밋
    } catch (Exception e) {
        transactionManager.rollback(status); // 실패시 롤백
        throw new IllegalStateException(e);
    }
}
```

- 위 코드에서 볼 수 있듯이, 스프링의 트랜잭션 추상화를 사용하면:
- 데이터 접근 기술과 무관하게 동일한 방식으로 트랜잭션을 관리할 수 있습니다.
- JDBC, JPA 등 다양한 데이터 접근 기술을 사용하더라도 트랜잭션 관리 코드는 변경할 필요가 없습니다.
- 데이터 접근 기술을 변경하더라도 트랜잭션 관리 코드는 그대로 유지됩니다.

### 2.2 PlatformTransactionManager 인터페이스

```java
package org.springframework.transaction;

import org.springframework.lang.Nullable;

public interface PlatformTransactionManager extends TransactionManager {
    TransactionStatus getTransaction(@Nullable TransactionDefinition definition) throws TransactionException;

    void commit(TransactionStatus status) throws TransactionException;

    void rollback(TransactionStatus status) throws TransactionException;
}
```

- 트랜잭션은 트랜잭션 시작(획득), 커밋, 롤백으로 단순하게 추상화 되어 있습니다.
- 스프링은 트랜잭션을 추상화해서 제공할 뿐만 아니라, 실무에서 주로 사용하는 데이터 접근 기술에 대한 트랜잭션 매니저의 구현체도 제공합니다.
- 예를 들어 JDBC의 경우 `DataSourceTransactionManager`, JPA의 경우 `JpaTransactionManager`가 있습니다.
- 스프링 부트는 어떤 데이터 접근 기술을 사용하는지를 자동으로 인식해서 적절한 트랜잭션 매니저 를 선택해서 스프링 빈으로 등록해줍니다.
	- 때문에 트랜잭션 매니저를 선택하고 등록하는 과정도 생략할 수 있습니다.

:::info
스프링 5.3부터는 JDBC 트랜잭션을 관리할 때 `DataSourceTransactionManager` 를 상속받아서 약간의 기능을 확장한 `JdbcTransactionManager` 를 제공합니다. 둘의 기능
차이는 크지 않으므로 같은 것으로 이해하셔도 됩니다.
:::

### 2.3 PlatformTransactionManager 사용법

- PlatformTransactionManager을 사용하는 방법은 크게 두 가지로 나눌 수 있습니다.
  - 프로그래밍 방식: 트랜잭션을 직접 관리하는 방법
  - 선언적 방식: AOP를 사용하여 트랜잭션을 관리하는 방법

#### 프로그래밍 방식

- 프로그래밍 방식은 트랜잭션을 직접 관리하는 방법으로, 코드에서 직접 트랜잭션을 시작하고 커밋하거나 롤백합니다.
  - 트랜잭션 매니저 또는 트랜잭션 템플릿 등을 직접 사용하여 트랜잭션을 관리합니다.
- 프로그래밍 방식은 애플리케이션 코드에 트랜잭션 관리를 직접 구현해야 하므로 코드가 복잡해질 수 있습니다.
  - 애플리케이션 코드가 트랜잭션이라는 기술 코드와 강하게 결합됩니다.
  - 따라서 선언적 트랜잭션 관리가 더 일반적으로 사용됩니다.

```java
// 트랜잭션 시작
TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());
try {
    // 비즈니스 로직
    bizLogic(fromId, toId, money);
    transactionManager.commit(status); // 성공시 커밋
} catch (Exception e) {
    transactionManager.rollback(status); // 실패시 롤백
    throw new IllegalStateException(e);
}
```

- 위 코드에서 볼 수 있듯이, 프로그래밍 방식은 트랜잭션을 직접 관리하는 방식입니다.
- 트랜잭션을 시작하고, 비즈니스 로직을 실행한 후, 성공 시 커밋하고 실패 시 롤백합니다.

#### 선언적 방식

- 선언적 트랜잭션 관리는 AOP(Aspect Oriented Programming)를 사용하여 트랜잭션을 관리하는 방법입니다.
- @Transactional 어노테이션을 사용하여 메서드나 클래스에 트랜잭션을 적용합니다.
- 스프링은 AOP를 사용하여 트랜잭션을 관리하므로, 코드에서 직접 트랜잭션을 관리할 필요가 없습니다.
- 이 방법은 코드의 가독성을 높이고 유지보수를 용이하게 합니다.
- 실무에서는 대부분 선언적 트랜잭션 관리를 사용합니다.

### 2.4 JPA와 JdbcTemplate 또는 Mybatis 함께 사용하기

- JPA, 스프링 데이터 JPA, Querydsl은 개발 생산성을 크게 향상시키지만, 학습 곡선이 높고 복잡한 통계 쿼리에는 적합하지 않을 수 있습니다.
- 복잡한 통계 쿼리가 필요한 경우 JdbcTemplate이나 MyBatis를 JPA와 함께 사용하는 방법이 좋은 대안입니다.
- 트랜잭션 관리 측면에서:
	- JPA 기술들은 JpaTransactionManager를 사용합니다.
	- JdbcTemplate, MyBatis는 DataSourceTransactionManager를 사용합니다.
	- JpaTransactionManager는 DataSourceTransactionManager의 기능도 대부분 제공하기 때문에, JpaTransactionManager 하나만 등록하면 JPA, JdbcTemplate, MyBatis를 모두 하나의 트랜잭션으로 관리할 수 있습니다.
- 결과적으로 이 기술들을 함께 사용하면서도 트랜잭션 일관성을 유지할 수 있습니다.

:::danger
이렇게 JPA와 JdbcTemplate을 함께 사용할 경우 JPA의 플러시 타이밍에 주의해야 합니다. JPA는 데이터를 변경하면
변경 사항을 즉시 데이터베이스에 반영하지 않습니다. 기본적으로 트랜잭션이 커밋되는 시점에 변경 사항을 데이터베이스
에 반영합니다. 그래서 하나의 트랜잭션 안에서 JPA를 통해 데이터를 변경한 다음에 JdbcTemplate을 호출하는 경우
JdbcTemplate에서는 JPA가 변경한 데이터를 읽지 못하는 문제가 발생합니다.
이 문제를 해결하려면 JPA 호출이 끝난 시점에 JPA가 제공하는 플러시라는 기능을 사용해서 JPA의 변경 내역을 데이터
베이스에 반영해주어야 합니다. 그래야 그 다음에 호출되는 JdbcTemplate에서 JPA가 반영한 데이터를 사용할 수 있습니다.
:::

## 3. 트랜잭션 동기화

- 스프링이 제공하는 트랜잭션 매니저는 크게 2가지 역할을 합니다.
	- 트랜잭션 추상화: 트랜잭션을 시작하고 커밋하거나 롤백하는 기능을 추상화합니다.
	- 리소스 동기화: 트랜잭션과 관련된 리소스를 동기화합니다.
- 트랜잭션을 유지하려면 트랜잭션의 시작부터 끝까지 같은 데이터베이스 커넥션을 유지해야 합니다.
- 결국 같은 커넥션을 동기화(맞추어 사용)하기 위해서 이전에는 파라미터로 커넥션을 전달하는 방법을 사용했습니다.
- 파라미터로 커넥션을 전달하는 방법은 코드가 지저분해지는 것은 물론이고, 커넥션을 넘기는 메서드와 넘기지 않는 메서드를 중복해서 만들어야 하는 등 여러가지 단점들이 많습니다.

### 3.1 트랜잭션 동기화 매니저

- `org.springframework.transaction.support.TransactionSynchronizationManager`
- 스프링은 **트랜잭션 동기화 매니저**를 제공합니다.
- **이것은 쓰레드 로컬(`ThreadLocal`)을 사용해서 커넥션을 동기화해줍니다.**
  - [ThreadLocal 참고](../../../Language/Java/ThreadLocal/ThreadLocal.md)
- 트랜잭션 매니저는 내부에서 이 트랜잭션 동기화 매니저를 사용합니다.
- 트랜잭션 동기화 매니저는 쓰레드 로컬을 사용하기 때문에 멀티쓰레드 상황에 안전하게 커넥션을 동기화할 수 있습니다.
- 따라서 커넥션이 필요하면 트랜잭션 동기화 매니저를 통해 커넥션을 획득하면 됩니다.
- 따라서 이전처럼 파라미터로 커넥션을 전달하지 않아도 됩니다.

### 3.2 동작 방식

- 서비스 계층에서 `transactionManager.getTransaction()`을 호출해서 트랜잭션을 시작합니다.
- 트랜잭션을 시작하려면 먼저 데이터베이스 커넥션이 필요합니다. 트랜잭션 매니저는 내부에서 데이터소스를 사용해서 커넥션을 생성합니다.
- 커넥션을 수동 커밋 모드로 변경해서 실제 데이터베이스 트랜잭션을 시작합니다.
- 커넥션을 트랜잭션 동기화 매니저에 보관합니다.
- 트랜잭션 동기화 매니저는 쓰레드 로컬에 커넥션을 보관합니다. 따라서 멀티 쓰레드 환경에 안전하게 커넥션을 보관할 수 있습니다.
- 서비스는 비즈니스 로직을 실행하면서 리포지토리의 메서드들을 호출합니다. 이때 커넥션을 파라미터로 전달하지 않습니다.
- 리포지토리 메서드들은 트랜잭션이 시작된 커넥션이 필요합니다.
	- 리포지토리는 `DataSourceUtils.getConnection()`을 사용해서 트랜잭션 동기화 매니저에 보관된 커넥션을 꺼내서 사용합니다.
	- 이 과정을 통해서 자연스럽게 같은 커넥션을 사용하고, 트랜잭션도 유지됩니다.
	- 획득한 커넥션을 사용해서 SQL을 데이터베이스에 전달해서 실행합니다.
- 비즈니스 로직이 끝나고 트랜잭션을 종료합니다. 트랜잭션은 커밋하거나 롤백하면 종료됩니다.
- 트랜잭션을 종료하려면 동기화된 커넥션이 필요합니다. 트랜잭션 동기화 매니저를 통해 동기화된 커넥션을 획득합니다.
- 획득한 커넥션을 통해 데이터베이스에 트랜잭션을 커밋하거나 롤백합니다.
- 전체 리소스를 정리합니다.
	- 트랜잭션 동기화 매니저를 정리합니다. 쓰레드 로컬은 사용후 꼭 정리해야 합니다.
	- `con.setAutoCommit(true)`로 되돌립니다. 커넥션 풀을 고려해야 합니다.
	- `con.close()`를 호출하여 커넥션을 종료합니다. 커넥션 풀을 사용하는 경우 `con.close()`를 호출하면 커넥션 풀에 반환됩니다.

## 4. @Transactional

- @Transactional은 메서드나 클래스에 적용하여 트랜잭션 경계를 선언적으로 정의합니다.
- 클래스에 적용하면 해당 클래스의 모든 public 메서드에 트랜잭션이 적용됩니다.
- 메서드에 적용하면 해당 메서드에만 트랜잭션이 적용됩니다.
- `@Transactional` 을 통한 선언적 트랜잭션 관리 방식을 사용하게 되면 기본적으로 프록시 방식의 AOP가 적용됩니다.
	- [AOP는 이 곳을 참고하세요](../../AOP/AOP.md)
- @Transactional의 주요 속성:
	- propagation: 트랜잭션 전파 방식 설정 (기본값: REQUIRED)
	- isolation: 트랜잭션 격리 수준 설정 (기본값: DEFAULT)
	- timeout: 트랜잭션 타임아웃 설정 (기본값: -1, 즉 데이터베이스 기본값 사용)
	- readOnly: 읽기 전용 트랜잭션 설정 (기본값: false)
	- rollbackFor: 지정된 예외 발생 시 롤백 (기본적으로 롤백되지 않는 예외도 롤백 가능)
	- noRollbackFor: 지정된 예외 발생 시 롤백하지 않음 (기본적으로 롤백되는 예외도 롤백하지 않을 수 있음)

### 4.1 @Transactional 적용 위치

- @Transactional은 클래스 또는 메서드에 적용할 수 있습니다.
  - 인터페이스에 `@Transactional` 사용하는 것은 스프링 공식 메뉴얼에서 권장하지 않는 방법입니다.
  - AOP를 적용하는 방식에 따라서 인터페이스에 애노테이션을 두면 AOP가 적용이 되지 않는 경우도 있기 때문입니다.
  - 따라서 실제로는 클래스에 적용하는 것이 일반적입니다.
- 클래스에 적용하면 해당 클래스의 모든 public 메서드에 @Transactional 적용됩니다.
	- 이 경우 메서드에 @Transaction을 명시적으로 적용할 필요가 없습니다.
  - 클래스에도 @Transaction이 있고 메서드에도 @Transaction이 있는 경우 메서드의 @Transaction이 우선합니다.

#### 4.1.1 우선순위

1. 클래스의 메서드
2. 클래스의 타입
3. 인터페이스의 메서드
4. 인터페이스의 타입

```java
@Service
public class UserService {
    
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Transactional
    public User createUser(String name, String email) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        return userRepository.save(user);
    }
    
    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }
}
```

### 4.2 예외 처리

- Spring의 @Transactional 어노테이션의 기본 동작은 다음과 같습니다
- 기본적으로 unchecked 예외(RuntimeException 및 Error)가 발생하면 트랜잭션을 롤백합니다.
- checked 예외(Exception)가 발생하면 롤백하지 않습니다.
- 아래 속성으로 예외 처리 동작을 조정할 수 있습니다
	- rollbackFor: 지정된 예외가 발생하면 롤백합니다 (기본적으로 롤백되지 않는 checked 예외도 롤백하도록 할 수 있음)
	- noRollbackFor: 지정된 예외가 발생해도 롤백하지 않습니다 (기본적으로 롤백되는 unchecked 예외도 롤백하지 않도록 할 수 있음)

#### 4.2.1 Unchecked Exception

```java
@Service
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final AccountRepository accountRepository;
    
    @Transactional
    public void processPayment(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));
            
        if (account.getBalance().compareTo(amount) < 0) {
            // RuntimeException은 자동으로 트랜잭션 롤백을 발생시킵니다
            throw new InsufficientBalanceException("Insufficient balance for account: " + accountId);
        }
        
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);
        
        Payment payment = new Payment();
        payment.setAccount(account);
        payment.setAmount(amount);
        payment.setTimestamp(LocalDateTime.now());
        paymentRepository.save(payment);
    }
}
```

- 위 예시에서 `InsufficientBalanceException`은 RuntimeException이므로, 트랜잭션이 롤백됩니다.

#### 4.2.2 Checked Exception

```java
@Service
public class ReportService {
    
    private final ReportRepository reportRepository;
    
    @Transactional
    public Report generateReport(Long userId) throws ReportGenerationException {
        Report report = new Report();
        report.setUserId(userId);
        report.setGeneratedAt(LocalDateTime.now());
        
        try {
            // 외부 API 호출 또는 복잡한 처리
            byte[] reportData = generateReportData(userId);
            report.setData(reportData);
            return reportRepository.save(report);
        } catch (IOException e) { 
            // IOException을 checked exception인 ReportGenerationException으로 변환
            // checked exception이므로 기본적으로 롤백되지 않음
            throw new ReportGenerationException("Failed to generate report", e);
        }
    }
    
    private byte[] generateReportData(Long userId) throws IOException {
        // 실제 보고서 생성 로직
        // IOException이 발생할 수 있음
        return new byte[0];
    }
}
```

- ReportGenerationException은 checked exception이므로 기본적으로 롤백을 유발하지 않습니다.
- 롤백을 원한다면 `@Transactional(rollbackFor = ReportGenerationException.class)`을 사용해야 합니다.

#### 4.2.3 rollbackFor 속성 사용

```java
@Service
public class DocumentService {
    
    private final DocumentRepository documentRepository;
    
    // checked exception인 DocumentProcessingException이 발생해도 롤백하도록 설정
    @Transactional(rollbackFor = DocumentProcessingException.class)
    public Document processDocument(Long id) throws DocumentProcessingException {
        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Document not found: " + id));
            
        try {
            // 문서 처리 로직
            byte[] processedContent = processContent(document.getContent());
            document.setProcessedContent(processedContent);
            document.setStatus("PROCESSED");
            return documentRepository.save(document);
        } catch (IOException e) {
            // 이 예외가 발생하면 트랜잭션이 롤백됨
            throw new DocumentProcessingException("Failed to process document", e);
        }
    }
    
    private byte[] processContent(byte[] content) throws IOException {
        // 문서 처리 로직
        return content;
    }
}

// 사용자 정의 checked exception
public class DocumentProcessingException extends Exception {
    public DocumentProcessingException(String message) {
        super(message);
    }
    
    public DocumentProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

- rollbackFor 속성을 사용하여 checked exception인 `DocumentProcessingException`이 발생해도 트랜잭션이 롤백되도록 설정했습니다.

### 4.3 트랜잭션 매니저 지정하기

- 트랜잭션을 사용하려면 먼저 스프링 빈에 등록된 어떤 트랜잭션 매니저를 사용할지 알아야 합니다.
- 프로그래밍방식으로 코드로 직접 트랜잭션을 사용할 때 트랜잭션 매니저를 주입 받아서 사용했습니다.
	- `@Transactional` 에서도 트랜잭션 프록시가 사용할 트랜잭션 매니저를 지정해주어야 합니다.
- 사용할 트랜잭션 매니저를 지정할 때는 `value` , `transactionManager` 둘 중 하나에 트랜잭션 매니저의 스프링 빈 의 이름을 적어주면 됩니다.
	- 이 값을 생략하면 기본으로 등록된 트랜잭션 매니저를 사용하기 때문에 대부분 생략합니다.
	- 사용하는 트랜잭션 매 니저가 둘 이상이라면 다음과 같이 트랜잭션 매니저의 이름을 지정해서 구분하면 됩니다.

### 4.4 트랜잭션 전파 옵션 선택하기

- [Transaction Propagation 참고](../TransactionPropagation/TransactionPropagation.md)

### 4.5 격리 수준 지정하기

- 트랜잭션 격리 수준을 지정할 수 있습니다.
- 기본 값은 데이터베이스에서 설정한 트랜잭션 격리 수준을 사용하는 `DEFAULT`입니다.
	- 대부분 데이터베이스에서 설정한 기준을 따릅니다.
	- 애플리케이션 개발자가 트랜잭션 격리 수준을 직접 지정하는 경우는 드뭅니다.
- 지원되는 속성 값
	- `DEFAULT` : 데이터베이스에서 설정한 격리 수준을 따릅니다.
	- `READ_UNCOMMITTED` : 커밋되지 않은 읽기
	- `READ_COMMITTED` : 커밋된 읽기
	- `REPEATABLE_READ` : 반복 가능한 읽기
	- `SERIALIZABLE` : 직렬화 가능
- [격리 수준에 대한 자세한 내용은 Isolation Levels 참고](../../../Database/Isolation-Levels/Isolation-Levels.md)

### 4.6 timeout 설정하기

- 트랜잭션 수행 시간에 대한 타임아웃을 초 단위로 지정합니다.
- 기본 값은 트랜잭션 시스템의 타임아웃을 사용합니다.
- 운영 환경에 따라 동작하는 경우도 있고 그렇지 않은 경우도 있기 때문에 꼭 확인하고 사용해야 합니다.
- `timeoutString` 도 있는데, 숫자 대신 문자 값으로 지정할 수 있습니다.

### 4.7 readOnly

### 4.8 주의 사항

- `@Transactional`을 사용하면 스프링의 트랜잭션 AOP가 적용됩니다.
- 트랜잭션 AOP는 기본적으로 프록시 방식의 AOP를 사용합니다.
- 프록시 내부 호출에 대해 트랜잭션이 적용되지 않습니다.
	- 트랜잭션을 적용하려면 항상 프록시를 통해서 대상 객체(Target)을 호출해야 합니다.
	- 만약 프록시를 거치지 않고 대상 객체를 직접 호출하게 되면 AOP가 적용되지 않고, 트랜잭션도 적용되지 않습니다.
	- 실무에서 반드시 한번은 만나서 고생하는 문제이기 때문에 꼭 이해하고 넘어가야 합니다.

#### 4.8.1 프록시 내부 호출 문제 예시

```java
@Service
public class OrderService {
    
    // 프록시 내부 호출 문제 발생
    @Transactional
    public void createOrder(Order order) {
        // 트랜잭션 적용됨
        orderRepository.save(order);
        
        // 내부 호출 - updateInventory() 메서드는 별도의 트랜잭션으로 동작하지 않음
        updateInventory(order);
        
        // 만약 여기서 예외 발생하면 orderRepository.save()만 롤백되고 
        // updateInventory()에서 수행된 작업은 롤백되지 않음
        throw new RuntimeException("주문 중 오류 발생");
    }
    
    @Transactional
    public void updateInventory(Order order) {
        // 트랜잭션이 적용되지 않는 문제 발생! (내부 호출이므로)
        for (OrderItem item : order.getItems()) {
            inventoryRepository.decreaseStock(item.getProductId(), item.getQuantity());
        }
    }
}
```

#### 4.8.2 해결 방법 1: 별도의 클래스로 분리

```java
@Service
public class OrderService {
    
    private final InventoryService inventoryService;
    
    public OrderService(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }
    
    @Transactional
    public void createOrder(Order order) {
        // 트랜잭션 적용됨
        orderRepository.save(order);
        
        // 외부 호출 - 별도의 Bean을 통한 호출로 트랜잭션 정상 적용
        inventoryService.updateInventory(order);
        
        // 예외 발생시 모든 작업이 롤백됨
        throw new RuntimeException("주문 중 오류 발생");
    }
}

@Service
public class InventoryService {
    
    @Transactional
    public void updateInventory(Order order) {
        // 트랜잭션 정상 적용됨
        for (OrderItem item : order.getItems()) {
            inventoryRepository.decreaseStock(item.getProductId(), item.getQuantity());
        }
    }
}
```

#### 4.8.3 해결 방법 2: 자기 자신 주입 (Self-Injection)

```java
@Service
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    
    // 자기 자신을 주입 - 실제 인스턴스가 아닌 프록시가 주입됨
    @Autowired
    private OrderService self;
    
    @Transactional
    public void createOrder(Order order) {
        orderRepository.save(order);
        
        // self를 통해 프록시 경유하여 호출
        self.updateInventory(order);
        
        // 예외 발생시 모든 작업이 함께 롤백됨
        throw new RuntimeException("주문 중 오류 발생");
    }
    
    @Transactional
    public void updateInventory(Order order) {
        // 트랜잭션 정상 적용됨
        for (OrderItem item : order.getItems()) {
            inventoryRepository.decreaseStock(item.getProductId(), item.getQuantity());
        }
    }
}
```

- 해결은 가능하나 자기 자신을 주입하는 것은 권장되지 않습니다.
- 앞서 설명한 해결 방법1을 사용하는 것이 좋습니다.

#### 4.8.4 메서드 접근 제한자 문제

- 스프링 부트 3.0 미만에서는 public 메서드에만 @Transactional이 적용됩니다.
- 외부에서 호출할 수 잇는 protected, package-visible(default) 메서드에 대해서는 @Transactional이 적용되지 않습니다.
- 참고로 `public` 이 아닌곳에 `@Transactional` 이 붙어 있으면 예외가 발생하지는 않고, 트랜잭션 적용만 무시됩니다.
- 스프링 부트 3.0 부터는 `protected` , `package-visible`에도 트랜잭션이 적용됩니다.

```java
@Service
public class PaymentService {
    
    // public이 아닌 메서드에 @Transactional 적용 - 기본적으로 작동하지 않음
    @Transactional
    protected void processPayment(Long orderId, BigDecimal amount) {
        // 스프링 부트 3.0 미만에서는 트랜잭션이 적용되지 않음
        // 스프링 부트 3.0 이상에서는 적용됨
        paymentRepository.save(new Payment(orderId, amount));
    }
    
    // private 메서드에 @Transactional 적용 - 작동하지 않음
    @Transactional
    private void logPayment(Payment payment) {
        // 스프링 부트 버전과 관계없이 트랜잭션이 적용되지 않음
        paymentLogRepository.save(new PaymentLog(payment));
    }
}
```

#### 4.8.5 주의사항 요약

1. **프록시 내부 호출 문제**
	- 같은 클래스 내에서 @Transactional 메서드 호출 시 트랜잭션 적용되지 않음
	- 해결책: 별도 클래스로 분리하거나, 자기 자신을 주입받아 프록시를 통해 호출
2. **메서드 접근 제한자 제약**
	- 스프링 부트 3.0 미만: public 메서드에만 트랜잭션 적용
	- 스프링 부트 3.0 이상: public, protected, package-visible(default) 메서드에 적용
	- private 메서드는 모든 버전에서 트랜잭션 적용 불가
3. **초기화 메서드 주의**
	- @PostConstruct와 같은 초기화 메서드에서는 @Transactional이 작동하지 않음
	- 이 시점에서는 AOP 프록시 생성이 완료되지 않았기 때문
4. **Proxy 모드 vs AspectJ 모드**
	- 기본 설정은 Proxy 모드이며, 이 경우 위의 제약사항들이 적용됨
	- AspectJ 모드를 사용하면 private 메서드, 내부 호출 등에도 트랜잭션 적용 가능하나 설정이 복잡함

## 참고

- https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-db-2/dashboard