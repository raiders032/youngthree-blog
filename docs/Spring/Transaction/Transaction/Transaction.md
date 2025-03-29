---
title: "Spring Transaction"
description: "Spring의 트랜잭션 관리 방식과 @Transaction 어노테이션의 사용법, 예외 처리 전략에 대해 간결하게 설명합니다. 실제 예시 코드와 함께 트랜잭션 롤백 동작을 이해하는 데 필요한 핵심 내용을 다룹니다."
tags: ["SPRING", "TRANSACTION", "JAVA", "BACKEND"]
keywords: ["스프링", "Spring", "트랜잭션", "Transaction", "@Transaction", "롤백", "rollback", "예외처리", "exception handling", "checked exception", "unchecked exception"]
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
- 예를 들어 JDBC 기술과 JPA 기술은 트랜잭션 을 사용하는 코드 자체가 다릅니다.
- 스프링은 이런 문제를 해결하기 위해 트랜잭션 추상화를 제공합니다.
- 트랜잭션을 사용하는 입장에서는 스프링 트랜잭션 추상화를 통해 둘을 동일한 방식으로 사용할 수 있습니다.

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
- 여기에 더해서 스프링 부트는 어떤 데이터 접근 기술을 사용하는지를 자동으로 인식해서 적절한 트랜잭션 매니저 를 선택해서 스프링 빈으로 등록해줍니다.
  - 때문에 트랜잭션 매니저를 선택하고 등록하는 과정도 생략할 수 있습니다.

:::info
스프링 5.3부터는 JDBC 트랜잭션을 관리할 때 `DataSourceTransactionManager` 를 상속받아서 약간의 기능을 확장한 `JdbcTransactionManager` 를 제공합니다. 둘의 기능 차이는 크지 않으므로 같은 것으로 이해하셔도 됩니다.
:::

### 2.3 PlatformTransactionManager 사용법

- PlatformTransactionManager을 사용하는 방법은 크게 두 가지로 나눌 수 있습니다.
- 하나는 프로그래밍 방식으로 트랜잭션을 관리하는 방법이고, 다른 하나는 선언적 트랜잭션 관리입니다.
- 프로그래밍 방식은 트랜잭션을 직접 관리하는 방법으로, 코드에서 직접 트랜잭션을 시작하고 커밋하거나 롤백합니다.
- 선언적 트랜잭션 관리는 AOP(Aspect Oriented Programming)를 사용하여 트랜잭션을 관리하는 방법입니다.
  - @Transactional 어노테이션을 사용하여 메서드나 클래스에 트랜잭션을 적용합니다.
- 프로그래밍 방식은 애플리케이션 코드에 트랜잭션 관리를 직접 구현해야 하므로 코드가 복잡해질 수 있습니다.
- 따라서 선언적 트랜잭션 관리가 더 일반적으로 사용됩니다.

## 3. @Transactional

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

### 3.1 기본 사용 예시
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

### 3.2 예외 처리

- Spring의 @Transactional 어노테이션의 기본 동작은 다음과 같습니다
- 기본적으로 unchecked 예외(RuntimeException 및 Error)가 발생하면 트랜잭션을 롤백합니다.
- checked 예외(Exception)가 발생하면 롤백하지 않습니다.
- 아래 속성으로 예외 처리 동작을 조정할 수 있습니다
  - rollbackFor: 지정된 예외가 발생하면 롤백합니다 (기본적으로 롤백되지 않는 checked 예외도 롤백하도록 할 수 있음)
  - noRollbackFor: 지정된 예외가 발생해도 롤백하지 않습니다 (기본적으로 롤백되는 unchecked 예외도 롤백하지 않도록 할 수 있음)

#### 3.2.1 Unchecked Exception

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

#### 3.2.2 Checked Exception

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

#### 3.2.3 rollbackFor 속성 사용

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

### 3.3 트랜잭션 매니저 지정하기

- 트랜잭션을 사용하려면 먼저 스프링 빈에 등록된 어떤 트랜잭션 매니저를 사용할지 알아야 합니다.
- 프로그래밍방식으로 코드로 직접 트랜잭션을 사용할 때 트랜잭션 매니저를 주입 받아서 사용했습니다.
  - `@Transactional` 에서도 트랜잭션 프록시가 사용할 트랜잭션 매니저를 지정해주어야 합니다.
- 사용할 트랜잭션 매니저를 지정할 때는 `value` , `transactionManager` 둘 중 하나에 트랜잭션 매니저의 스프링 빈 의 이름을 적어주면 됩니다.
  - 이 값을 생략하면 기본으로 등록된 트랜잭션 매니저를 사용하기 때문에 대부분 생략합니다.
  - 사용하는 트랜잭션 매 니저가 둘 이상이라면 다음과 같이 트랜잭션 매니저의 이름을 지정해서 구분하면 됩니다.

### 3.4 트랜잭션 전파 옵션 선택하기

- [Transaction Propagation 참고](../TransactionPropagation/TransactionPropagation.md)

### 3.5 격리 수준 지정하기

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

### 3.6 timeout 설정하기

- 트랜잭션 수행 시간에 대한 타임아웃을 초 단위로 지정합니다.
- 기본 값은 트랜잭션 시스템의 타임아웃을 사용합니다.
- 운영 환경에 따라 동작하는 경우도 있고 그렇지 않은 경우도 있기 때문에 꼭 확인하고 사용해야 합니다.
- `timeoutString` 도 있는데, 숫자 대신 문자 값으로 지정할 수 있습니다.

### 3.7 readOnly

### 3.5 주의 사항

- `@Transactional`을 사용하면 스프링의 트랜잭션 AOP가 적용됩니다. 트랜잭션 AOP는 기본적으로 프록시 방식의 AOP를 사용합니다.
- 프록시 내부 호출에 대해 트랜잭션이 적용되지 않습니다.
  - 트랜잭션을 적용하려면 항상 프록시를 통해서 대상 객체(Target)을 호출해야 합니다.
  - 만약 프록시를 거치지 않고 대상 객체를 직접 호출하게 되면 AOP가 적용되지 않고, 트랜잭션도 적용되지 않습니다.
  - 실무에서 반드시 한번은 만나서 고생하는 문제이기 때문에 꼭 이해하고 넘어가야 합니다.
- 스프링의 트랜잭션 AOP 기능은 `public` 메서드에만 트랜잭션을 적용하도록 기본 설정이 되어 있습니다.
  - 스프링 부트 3.0 부터는 `protected` , `package-visible` (default 접근제한자)에도 트랜잭션이 적용됩니다.

## 참고