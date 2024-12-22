## 1 MongoDB 트랜잭션이란?

- MongoDB의 트랜잭션은 여러 문서에 대한 읽기와 쓰기 작업을 하나의 논리적 단위로 묶어주는 기능입니다.
- 트랜잭션을 사용하면 여러 작업이 모두 성공하거나 모두 실패하는 것을 보장할 수 있습니다.
- MongoDB 4.0부터 복제 셋에서 다중 문서 트랜잭션을 지원하기 시작했습니다.
- MongoDB 4.2부터는 분산 트랜잭션을 지원하여 샤딩된 클러스터에서도 트랜잭션을 사용할 수 있습니다.



## 2 트랜잭션의 ACID 특성

- MongoDB의 트랜잭션은 ACID 특성을 보장합니다:
	- **Atomicity (원자성)**: 트랜잭션 내의 모든 작업이 성공하거나 모두 실패합니다.
	- **Consistency (일관성)**: 트랜잭션 실행 전후로 데이터베이스가 일관된 상태를 유지합니다.
	- **Isolation (격리성)**: 동시에 실행되는 트랜잭션들은 서로 영향을 주지 않습니다.
	- **Durability (지속성)**: 트랜잭션이 성공적으로 완료되면 그 결과는 영구적으로 저장됩니다.



## 3 트랜잭션 사용 방법

- Java에서 MongoDB 트랜잭션을 사용하는 방법에는 두 가지가 있습니다:
	- Core API (명시적 트랜잭션)
	- Callback API (함수 형태의 트랜잭션)



### 3.1 Core API를 사용한 트랜잭션

**Java 예시 - Core API**

```java
// MongoDB 클라이언트 설정
MongoClient mongoClient = MongoClients.create("mongodb://localhost:27017");
MongoDatabase database = mongoClient.getDatabase("bankDB");
MongoCollection<Document> accounts = database.getCollection("accounts");

// 세션 시작
ClientSession session = mongoClient.startSession();

TransactionOptions txnOptions = TransactionOptions.builder()
        .readPreference(ReadPreference.primary())
        .readConcern(ReadConcern.LOCAL)
        .writeConcern(WriteConcern.MAJORITY)
        .build();

try {
    // 트랜잭션 시작
    session.startTransaction(txnOptions);

    // 계좌에서 출금
    accounts.updateOne(session,
            Filters.eq("_id", fromAccountId),
            Updates.inc("balance", -amount));

    // 다른 계좌로 입금
    accounts.updateOne(session,
            Filters.eq("_id", toAccountId),
            Updates.inc("balance", amount));

    // 트랜잭션 커밋
    session.commitTransaction();
} catch (Exception e) {
    // 에러 발생 시 롤백
    session.abortTransaction();
    throw e;
} finally {
    // 세션 종료
    session.close();
}
```

- Core API를 사용할 때는 트랜잭션의 시작, 커밋, 롤백을 직접 제어합니다.
- try-catch 블록을 사용하여 에러 처리를 명시적으로 수행합니다.



### 3.2 Callback API를 사용한 트랜잭션

**Java 예시 - Callback API**

```java
// MongoDB 클라이언트 설정
MongoClient mongoClient = MongoClients.create("mongodb://localhost:27017");
MongoDatabase database = mongoClient.getDatabase("bankDB");
MongoCollection<Document> accounts = database.getCollection("accounts");

TransactionOptions txnOptions = TransactionOptions.builder()
        .readPreference(ReadPreference.primary())
        .readConcern(ReadConcern.LOCAL)
        .writeConcern(WriteConcern.MAJORITY)
        .build();

// 트랜잭션 실행
ClientSession session = mongoClient.startSession();
try {
    session.withTransaction(() -> {
        // 계좌에서 출금
        accounts.updateOne(session,
                Filters.eq("_id", fromAccountId),
                Updates.inc("balance", -amount));

        // 다른 계좌로 입금
        accounts.updateOne(session,
                Filters.eq("_id", toAccountId),
                Updates.inc("balance", amount));
                
        return "Transaction successful";
    }, txnOptions);
} finally {
    session.close();
}
```

- Callback API는 트랜잭션의 커밋과 롤백을 자동으로 처리합니다.
- 코드가 더 간결하고 실수할 가능성이 줄어듭니다.



## 4 트랜잭션 제한사항

- MongoDB 트랜잭션을 사용할 때 알아야 할 제한사항들이 있습니다:
	- 기본 트랜잭션 제한 시간은 60초입니다.
	- 단일 트랜잭션의 크기는 16MB로 제한됩니다.
	- capped collection에서는 트랜잭션을 사용할 수 없습니다.
	- 트랜잭션 내에서는 콜렉션 생성이나 인덱스 생성 같은 관리 작업을 수행할 수 없습니다.



## 5 트랜잭션 성능 고려사항

- 트랜잭션을 사용할 때 성능을 위해 고려해야 할 사항들입니다:
	- 트랜잭션은 단일 작업보다 오버헤드가 크므로 필요한 경우에만 사용합니다.
	- 트랜잭션 내의 작업 수를 최소화합니다.
	- 트랜잭션 실행 시간을 최소화하여 다른 작업이 블로킹되는 것을 방지합니다.
	- 트랜잭션에서 수정하는 문서의 수를 최소화합니다.



## 6 트랜잭션 모범 사례

- MongoDB 트랜잭션 사용 시 권장되는 모범 사례들입니다:
	- 항상 적절한 타임아웃을 설정합니다.
	- 에러 처리 코드를 반드시 구현합니다.
	- 트랜잭션이 실패하면 재시도 로직을 구현합니다.
	- 트랜잭션 내에서는 필요한 최소한의 작업만 수행합니다.
	- 세션은 사용 후 반드시 종료합니다.



**Java 예시 - 재시도 로직**
```java
public void executeTransactionWithRetry(MongoClient mongoClient) {
    final int maxRetries = 3;
    int retryCount = 0;
    
    while (retryCount < maxRetries) {
        ClientSession session = mongoClient.startSession();
        try {
            session.withTransaction(() -> {
                // 트랜잭션 로직
                return "Transaction successful";
            });
            break; // 성공하면 루프 종료
        } catch (Exception e) {
            retryCount++;
            if (retryCount == maxRetries) {
                throw new RuntimeException("트랜잭션 재시도 횟수 초과", e);
            }
            try {
                // 재시도 전 대기
                Thread.sleep(1000 * retryCount);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new RuntimeException(ie);
            }
        } finally {
            session.close();
        }
    }
}
```



## 7 트랜잭션 모니터링

- MongoDB의 트랜잭션 모니터링 방법입니다:
	- MongoDB Compass를 사용하여 트랜잭션 상태를 시각적으로 확인할 수 있습니다.
	- Java 드라이버의 모니터링 API를 사용하여 트랜잭션을 추적할 수 있습니다.
	- 로그 파일에서 트랜잭션 관련 이벤트를 확인할 수 있습니다.



**Java 예시 - 트랜잭션 모니터링**

```java
MongoClient mongoClient = MongoClients.create(
    MongoClientSettings.builder()
        .applyToConnectionPoolSettings(builder ->
            builder.addConnectionPoolListener(new ConnectionPoolListener() {
                @Override
                public void connectionCheckedOut(ConnectionCheckedOutEvent event) {
                    System.out.println("Connection checked out: " + event);
                }
            })
        )
        .build()
);
```



## 8 트랜잭션 디버깅

- 트랜잭션 문제를 해결하기 위한 디버깅 방법입니다:
	- Java의 로깅 프레임워크를 사용하여 트랜잭션 로그를 기록합니다.
	- MongoDB 로그 파일에서 트랜잭션 관련 에러를 확인합니다.
	- JVM 모니터링 도구를 사용하여 트랜잭션 성능을 분석합니다.



**Java 예시 - 로깅 설정**

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TransactionManager {
    private static final Logger logger = LoggerFactory.getLogger(TransactionManager.class);
    
    public void executeTransaction() {
        logger.info("트랜잭션 시작");
        try {
            // 트랜잭션 로직
            logger.info("트랜잭션 성공적으로 완료");
        } catch (Exception e) {
            logger.error("트랜잭션 실패: ", e);
            throw e;
        }
    }
}
```



## 9 결론

- MongoDB의 트랜잭션은 데이터 일관성이 중요한 작업에서 필수적인 기능입니다.
- Java에서 MongoDB 트랜잭션을 사용할 때는 적절한 예외 처리와 리소스 관리가 중요합니다.
- 트랜잭션을 적절히 사용하면 데이터 무결성을 보장할 수 있습니다.
- 하지만 성능 오버헤드가 있으므로 필요한 경우에만 사용해야 합니다.
- 트랜잭션 사용 시 모범 사례를 따르고 적절한 모니터링을 구현하는 것이 중요합니다.