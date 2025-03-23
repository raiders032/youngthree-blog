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

## 2. @Transactional

- @Transactional은 메서드나 클래스에 적용하여 트랜잭션 경계를 선언적으로 정의합니다.
- 클래스에 적용하면 해당 클래스의 모든 public 메서드에 트랜잭션이 적용됩니다.
- 메서드에 적용하면 해당 메서드에만 트랜잭션이 적용됩니다.
- @Transactional의 주요 속성:
  - propagation: 트랜잭션 전파 방식 설정 (기본값: REQUIRED)
  - isolation: 트랜잭션 격리 수준 설정 (기본값: DEFAULT)
  - timeout: 트랜잭션 타임아웃 설정 (기본값: -1, 즉 데이터베이스 기본값 사용)
  - readOnly: 읽기 전용 트랜잭션 설정 (기본값: false)
  - rollbackFor: 지정된 예외 발생 시 롤백 (기본적으로 롤백되지 않는 예외도 롤백 가능)
  - noRollbackFor: 지정된 예외 발생 시 롤백하지 않음 (기본적으로 롤백되는 예외도 롤백하지 않을 수 있음)

#### 기본 사용 예시
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

## 3. 예외 처리

- Spring의 @Transactional 어노테이션의 기본 동작은 다음과 같습니다
- 기본적으로 unchecked 예외(RuntimeException 및 Error)가 발생하면 트랜잭션을 롤백합니다.
- checked 예외(Exception)가 발생하면 롤백하지 않습니다.
- rollbackFor: 지정된 예외가 발생하면 롤백합니다 (기본적으로 롤백되지 않는 checked 예외도 롤백하도록 할 수 있음)
- noRollbackFor: 지정된 예외가 발생해도 롤백하지 않습니다 (기본적으로 롤백되는 unchecked 예외도 롤백하지 않도록 할 수 있음)

#### Unchecked Exception 예시 - 자동 롤백
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

#### Checked Exception 예시 - 기본적으로 롤백되지 않음
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
            // IOException은 checked exception이므로 기본적으로 롤백되지 않음
            // 이 경우 트랜잭션이 커밋되고 부분적으로 저장된 데이터가 남을 수 있음
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

#### rollbackFor 속성 사용 예시 - Checked Exception도 롤백
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

## 참고