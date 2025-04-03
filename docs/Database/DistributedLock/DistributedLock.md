---
title: "Distributed Lock"
description: "분산 환경에서 자원에 대한 동시성을 관리하는 분산 락(Distributed Lock)의 개념부터 Redis를 활용한 실제 구현 방법까지 상세히 알아봅니다. 분산 락의 필요성, 구현 시 주의사항, 최적화 전략 등 MSA 환경에서 발생하는 동시성 문제를 해결하기 위한 실용적인 가이드를 제공합니다."
tags: [ "DISTRIBUTED_LOCK", "REDIS", "CONCURRENCY", "MSA", "BACKEND", "SYSTEM_DESIGN" ]
keywords: [ "분산락", "distributed lock", "디스트리뷰티드락", "분산 락", "레디스", "redis", "동시성", "concurrency", "락", "lock", "MSA", "마이크로서비스", "microservice", "스핀락", "spinlock", "데드락", "deadlock", "백엔드", "backend", "시스템 디자인", "system design", "동기화", "synchronization", "뮤텍스", "mutex" ]
draft: false
hide_title: true
---

## 1. Distributed Lock (분산 락)

- 분산 락(Distributed Lock)은 여러 서버에서 동시에 접근할 수 있는 자원에 대한 동시성을 관리하기 위한 메커니즘입니다.
- 분산 환경에서 동일한 자원에 대한 경쟁 상태(Race Condition)를 방지하고 데이터 일관성을 보장하는 데 사용됩니다.
- MSA(Micro Service Architecture) 환경에서 특히 중요한 개념으로, 여러 독립적인 서비스가 공유 자원에 안전하게 접근하기 위해 필수적입니다.

## 2. 분산 락의 필요성

- 일반적으로 하나의 서버에서만 접근할 수 있는 자원에 대해서는 언어에서 제공하는 락을 사용하여 동기화를 보장할 수 있습니다.
  - 예를 들어, Java에서는 `synchronized` 키워드나 `ReentrantLock`을 사용하여 메서드나 블록에 락을 걸 수 있습니다.
  - 이 경우, 하나의 JVM 내에서의 동기화는 보장됩니다.
- 하지만 여러 서버에서 접근할 수 있는 자원에 대해서는 이러한 로컬 동기화 메커니즘을 사용할 수 없습니다.
  - 한 서버에 락이 걸려있더라도 다른 서버로 동일한 요청이 가게 된다면 동기화를 보장할 수 없습니다.
  - 이런 경우에 분산 락을 사용하여 여러 서버 간의 동기화를 보장할 수 있습니다.
- 분산 락은 Redis, ZooKeeper, 데이터베이스 등 공통된 저장소를 이용하여 자원이 사용 중인지를 체크합니다. 그래서 전체 서버에서 동기화된 처리가 가능해집니다.

### 2.1 실제 사용 사례

- 재고 관리 시스템에서 동일 상품에 대한 동시 주문 처리
- 중복 결제 방지
- 동시 예약 시스템(공연, 좌석, 숙소 등)
- 특정 사용자에 대한 동시 작업 제한
- 대규모 배치 작업의 중복 실행 방지
- 리더 선출(Leader Election)

:::info[실제 사례: 우아한형제들 재고 이관]
우아한형제들은 WMS(창고 관리 시스템)에서 재고 이관 작업 시 Redisson을 활용한 분산 락을 구현했습니다. 이를 통해 다수의 사용자가 동시에 같은 재고에 접근하는 경우에도 데이터 일관성을 유지하면서 성공적으로 이관 작업을 수행할 수 있었습니다.
:::

## 3. 분산 락의 구현 방법

- 분산 락을 구현하는 방법은 여러 가지가 있습니다.
  - Redis를 활용한 방법(SETNX, Redisson)
  - 데이터베이스를 활용한 방법(SELECT FOR UPDATE, 락 테이블)
  - ZooKeeper를 이용한 방법
  - etcd를 이용한 방법
- 가장 많이 사용되는 방법은 Redis를 이용한 분산 락입니다.
- Redis는 빠른 속도와 높은 가용성 덕분에 분산 락을 구현하는 데 적합합니다.

### 3.1 Redis SETNX를 이용한 기본적인 분산 락 구현

- Redis의 `SETNX` 명령어는 주어진 키가 존재하지 않을 때만 값을 설정하는 원자적 연산입니다.
- 이 특성을 활용하여 분산 락을 구현할 수 있습니다.

```java
void doProcess() {
    String lockKey = "lock:resource:123"; // 락의 키는 보호하려는 리소스를 식별할 수 있어야 합니다

    try {
        while (!tryLock(lockKey)) { // 락 획득 시도
            try {
                Thread.sleep(50); // 재시도 전에 짧은 대기 시간
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        
        // 락을 획득했으므로 안전하게 작업 수행
        // 여기에 리소스에 접근하는 코드 작성
    } finally {
        unlock(lockKey); // 락 해제 (매우 중요!)
    }
}

boolean tryLock(String key) {
    // SETNX 명령어: 키가 없으면 값 설정 후 1 반환, 키가 이미 있으면 0 반환
    return command.setnx(key, "1") == 1; 
}

void unlock(String key) {
    command.del(key); // 락 해제를 위해 키 삭제
}
```

- 위 코드는 기본적인 스핀 락(Spin Lock) 형태의 분산 락입니다.
- 락 획득 시도가 실패할 경우 일정 시간 대기 후 다시 시도합니다.
- 이 방식의 문제점은 락을 가진 서버가 작업을 완료하기 전에 장애가 발생할 경우, 락이 영구적으로 남아있을 수 있다는 점입니다.

### 3.2 만료 시간을 설정한 개선된 분산 락

- 락이 영구적으로 남는 문제를 해결하기 위해 만료 시간(Timeout)을 설정해야 합니다.
- Redis 2.6.12 버전부터는 `SET` 명령어에 옵션을 추가하여 이를 구현할 수 있습니다.

```java
boolean tryLock(String key, long timeoutMillis) {
    // SET key value NX EX seconds: 키가 없으면 값 설정 후 만료 시간 설정
    String result = command.set(key, UUID.randomUUID().toString(), 
                          "NX", "PX", timeoutMillis);
    return "OK".equals(result);
}

void unlock(String key) {
    command.del(key);
}
```

- 위 코드에서는 락을 획득할 때 UUID를 값으로 저장하고 만료 시간을 설정합니다.
- UUID는 어떤 프로세스가 락을 획득했는지 식별하는 데 사용될 수 있으며, 다른 프로세스의 락을 실수로 해제하는 것을 방지합니다.

### 3.3 안전한 락 해제 구현

- 다른 프로세스의 락을 실수로 해제하는 것을 방지하기 위해, 락을 해제할 때 자신이 설정한 값인지 확인해야 합니다.
- Redis의 Lua 스크립트를 사용하여 이를 원자적으로 수행할 수 있습니다.

```java
String lockValue = UUID.randomUUID().toString();

boolean tryLock(String key, String value, long timeoutMillis) {
    String result = command.set(key, value, "NX", "PX", timeoutMillis);
    return "OK".equals(result);
}

void unlock(String key, String value) {
    // Lua 스크립트를 사용하여 값이 같을 때만 삭제
    String script = "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                    "return redis.call('del', KEYS[1]) " +
                    "else return 0 end";
    command.eval(script, Collections.singletonList(key), 
                Collections.singletonList(value));
}
```

- 이 구현에서는 Lua 스크립트를 사용하여 키의 값을 확인한 후 일치할 경우에만 삭제합니다.
- 이렇게 하면 다른 프로세스의 락을 실수로 해제하는 것을 방지할 수 있습니다.

### 3.4 Redisson을 활용한 분산 락 구현

- 위에서 설명한 모든 패턴과 주의사항을 직접 구현하는 것은 복잡하고 오류가 발생하기 쉽습니다.
- Redisson은 Redis 기반의 Java 클라이언트 라이브러리로, 분산 락을 포함한 다양한 분산 객체와 서비스를 제공합니다.

```java
// Redisson 클라이언트 설정
Config config = new Config();
config.useSingleServer().setAddress("redis://127.0.0.1:6379");
RedissonClient redisson = Redisson.create(config);

// 분산 락 획득
RLock lock = redisson.getLock("myLock");

try {
    // 락 획득 시도 (최대 10초 대기, 30초 후 자동 해제)
    boolean isLocked = lock.tryLock(10, 30, TimeUnit.SECONDS);
    
    if (isLocked) {
        // 락 획득 성공, 안전하게 작업 수행
        // ...
    }
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
} finally {
    // 락 해제 (락을 보유하고 있는 경우에만)
    if (lock.isHeldByCurrentThread()) {
        lock.unlock();
    }
}
```

- Redisson은 내부적으로 앞서 설명한 모든 패턴을 구현하고 있습니다.
- 워치독(Watchdog) 메커니즘을 통해 락을 가진 클라이언트가 살아있는 동안 자동으로 락의 만료 시간을 연장합니다.
- 재시도 메커니즘, 페어락(Fair Lock), 읽기-쓰기 락(ReadWriteLock) 등 고급 기능도 제공합니다.

## 4. 분산 락 구현 시 주의사항

### 4.1 Lock 획득 Timeout 설정

- 스핀 락 방식으로 무한정 락 획득을 시도하는 것은 다음과 같은 문제가 있습니다.
  - 서버 리소스 낭비 및 응답 지연
  - Redis에 불필요한 부하 발생
  - 클라이언트 요청 타임아웃 발생 가능성

```java
boolean acquireLockWithTimeout(String lockKey, long acquireTimeout) {
    long end = System.currentTimeMillis() + acquireTimeout;
    while (System.currentTimeMillis() < end) {
        if (tryLock(lockKey)) {
            return true;
        }
        try {
            Thread.sleep(10); // 짧은 대기 시간
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
    return false; // 지정된 시간 내에 락 획득 실패
}
```

- 위 코드는 지정된 시간 동안만 락 획득을 시도하고, 시간이 초과되면 실패를 반환합니다.
- 이를 통해 클라이언트에게 빠른 응답을 제공하고 Redis의 부하를 줄일 수 있습니다.

### 4.2 Lock Timeout(TTL) 설정

- 락을 획득한 프로세스가 작업을 완료하기 전에 비정상 종료되면 락이 영구적으로 남아있을 수 있습니다.
- 이를 방지하기 위해 락에 적절한 만료 시간(TTL)을 설정해야 합니다.

```java
boolean tryLock(String key, long ttlMillis) {
    return "OK".equals(command.set(key, "1", "NX", "PX", ttlMillis));
}
```

- TTL 값은 애플리케이션의 특성에 맞게 설정해야 합니다.
  - 너무 짧으면 작업 완료 전에 락이 해제될 수 있음
  - 너무 길면 프로세스 장애 시 다른 프로세스가 오래 대기해야 함

:::warning[TTL 설정의 중요성]
TTL은 작업 완료에 필요한 최대 시간보다 약간 길게 설정하는 것이 좋습니다. 이는 네트워크 지연, 서버 부하 등의 요소를 고려한 값이어야 합니다. 만약 작업이 TTL보다 오래 걸릴 가능성이 있다면, Redisson의 워치독 메커니즘처럼 락을 주기적으로 갱신하는 방법을 고려해야 합니다.
:::

### 4.3 락 해제 보장

- 락을 획득한 프로세스가 작업을 완료한 후에는 반드시 락을 해제해야 합니다.
- `finally` 블록을 사용하여 예외가 발생하더라도 락이 해제되도록 보장합니다.

```java
String lockKey = "lock:resource:123";
try {
    if (tryLock(lockKey)) {
        // 작업 수행
    }
} finally {
    unlock(lockKey); // 항상 락 해제 시도
}
```

- 하지만 이 방식도 프로세스가 비정상 종료되면 락이 해제되지 않을 수 있습니다.
- 이런 경우를 대비하여 TTL 설정이 중요합니다.

### 4.4 Redis Cluster 환경에서의 고려사항

- Redis Cluster 환경에서는 노드 간 데이터 동기화에 시간이 걸릴 수 있습니다.
- 따라서 노드 장애 발생 시 락 정보가 유실될 가능성이 있습니다.

```java
// RedLock 알고리즘 구현 예시 (여러 Redis 인스턴스에 락 획득 시도)
boolean tryLock(List<JedisPool> jedisPools, String key, long ttl) {
    int minLocks = jedisPools.size() / 2 + 1; // 과반수 이상
    int acquired = 0;
    
    for (JedisPool pool : jedisPools) {
        if (tryLockOnInstance(pool, key, ttl)) {
            acquired++;
        }
    }
    
    return acquired >= minLocks;
}
```

- Redis의 개발자 Antirez가 제안한 RedLock 알고리즘은 이러한 문제를 해결하기 위한 방법 중 하나입니다.
- 여러 독립적인 Redis 인스턴스에 락을 요청하고, 과반수 이상에서 성공했을 때 락을 획득한 것으로 간주합니다.

### 4.5 데이터베이스를 이용한 분산 락

- Redis가 아닌 데이터베이스를 이용하여 분산 락을 구현할 수도 있습니다.
- MySQL을 이용한 구현 예시:

```sql
-- 락 테이블 생성
CREATE TABLE distributed_lock
(
    lock_key   VARCHAR(64) PRIMARY KEY,
    lock_value VARCHAR(128) NOT NULL,
    expire_at  TIMESTAMP    NOT NULL
);

-- 락 획득 시도
INSERT INTO distributed_lock (lock_key, lock_value, expire_at)
VALUES ('resource:123', 'process:456', NOW() + INTERVAL 30 SECOND) ON DUPLICATE KEY
UPDATE
    lock_value = IF(expire_at < NOW(), VALUES (lock_value), lock_value),
    expire_at = IF(expire_at < NOW(), VALUES (expire_at), expire_at);

-- 영향받은 행이 1개면 락 획득 성공

-- 락 해제
DELETE
FROM distributed_lock
WHERE lock_key = 'resource:123'
  AND lock_value = 'process:456';
```

:::info[실제 사례: 우아한형제들 MySQL 분산 락]
우아한형제들은 특정 상황에서 MySQL을 이용한 분산 락을 구현했습니다. 이 방식은
`FOR UPDATE` 구문을 활용하여 트랜잭션 동안 락을 유지하는 방식으로, MySQL InnoDB 엔진의 행 단위 잠금 기능을 활용합니다. 이 방식은 데이터베이스 연결이 끊어지면 자동으로 락이 해제되는 장점이 있습니다.
:::

## 5. 트랜잭션과 분산 락

- 분산 락과 데이터베이스 트랜잭션은 별개의 개념이지만, 함께 사용할 때 순서가 매우 중요합니다.
- 분산 락은 여러 서버에서의 동시 접근을 제어하는 반면, 트랜잭션은 데이터베이스 작업의 원자성을 보장합니다.

### 5.1 트랜잭션 커밋 후 락 해제의 중요성

- 분산 락과 트랜잭션을 함께 사용할 때 반드시 트랜잭션이 커밋된 후에 락을 해제해야 합니다.
- 트랜잭션 커밋 전에 락을 해제하면 데이터 일관성 문제가 발생할 수 있습니다.

```java
// 잘못된 구현 예시: 트랜잭션 내에서 락 획득과 해제
@Transactional
public void processOrderIncorrect(Long orderId) {
    String lockKey = "order:" + orderId;
    
    try {
        if (!lockService.tryLock(lockKey, 5000, 30000)) {
            throw new RuntimeException("Failed to acquire lock");
        }
        
        // 데이터베이스 작업 수행
        // ...
        
    } finally {
        // 트랜잭션이 아직 커밋되지 않았는데 락 해제
        // 다른 스레드가 락을 획득하여 변경 중인 데이터에 접근할 수 있음
        lockService.unlock(lockKey);
    }
    // 트랜잭션이 여기서 커밋됨
}

// 올바른 구현 예시: 트랜잭션 커밋 후 락 해제
public void processOrderCorrect(Long orderId) {
    String lockKey = "order:" + orderId;
    boolean locked = false;
    
    try {
        // 락 획득
        if (!lockService.tryLock(lockKey, 5000, 30000)) {
            throw new RuntimeException("Failed to acquire lock");
        }
        locked = true;
        
        // 트랜잭션 시작 및 커밋
        transactionTemplate.execute(status -> {
            // 데이터베이스 작업 수행
            // ...
            return null; // 트랜잭션 성공적으로 커밋
        });
        
    } finally {
        // 락 획득에 성공한 경우에만 락 해제
        if (locked) {
            lockService.unlock(lockKey);
        }
    }
}
```

- 위 예시에서 첫 번째 코드는 트랜잭션이 커밋되기 전에 락이 해제될 수 있어 위험합니다.

### 5.2 로스트 업데이트 예시: 재고 관리 시스템

- 재고 관리 시스템에서 발생할 수 있는 로스트 업데이트 현상을 간단히 설명하겠습니다

**초기 데이터**:

- 상품ID: 1001, 상품명: "스마트폰", 재고량: 10개

**상황 설명**:

- **트랜잭션 A** (주문 처리): 고객이 스마트폰 3개를 주문합니다.
  - 트랜잭션 A가 시작되고 분산 락을 획득합니다.
  - 현재 재고를 확인합니다: 10개
  - 주문 수량 3개를 차감하여 새 재고를 계산합니다: 10 - 3 = 7개
  - 재고를 7개로 업데이트합니다.
  - 트랜잭션을 아직 커밋하지 않았는데, 이 시점에서 분산 락을 해제합니다. (잘못된 구현)
- **트랜잭션 B** (재고 조정): 창고 관리자가 실물 재고를 확인하고 2개를 추가하기로 합니다.
  - 트랜잭션 B가 시작되고 분산 락을 획득합니다. (트랜잭션 A가 이미 락을 해제했으므로 가능)
  - 현재 재고를 확인합니다: 트랜잭션 A가 아직 커밋하지 않았으므로 이전 값인 10개가 조회됩니다.
  - 재고 2개를 추가하여 새 재고를 계산합니다: 10 + 2 = 12개
  - 재고를 12개로 업데이트합니다.
  - 트랜잭션 B를 커밋합니다.
- **트랜잭션 A의 완료**: 이후 트랜잭션 A도 커밋됩니다.
  - 그러나 트랜잭션 A는 자신이 처음 읽은 값(10개)에서 3개를 차감한 7개로 재고를 설정합니다.

**최종 결과**:

- 데이터베이스의 최종 재고량: 7개
- 이 결과가 정확한 결과일까요?
  - 트랜잭션 B는 재고를 12개로 변경했지만, 이후 트랜잭션 A가 7개로 덮어썼습니다.
  - 트랜잭션 B의 변경사항(+2)이 완전히 손실되었습니다.
  - 올바른 최종 결과는 각 트랜잭션의 변경사항이 모두 반영된 9개(10-3+2)가 되어야 합니다.

**원인 분석**:

- 두 트랜잭션 모두 동일한 초기값(10개)을 기준으로 계산했습니다.
- 트랜잭션 B는 12개로 변경하고 커밋했습니다.
- 트랜잭션 A는 7개로 변경하고 커밋했는데, A가 나중에 커밋되었으므로 B의 변경사항(12개)을 덮어썼습니다.
- 결과적으로 트랜잭션 B의 변경사항(+2)이 완전히 손실되는 로스트 업데이트가 발생했습니다.
- 실제로는 A와 B의 변경사항이 모두 반영된 9개가 되어야 정확합니다.

**해결책**:

- 트랜잭션이 완전히 커밋된 후에만 분산 락을 해제해야 합니다.
- 이렇게 하면 트랜잭션은 순차적으로 실행되어 각 트랜잭션이 이전 트랜잭션의 변경사항을 반영한 최신 데이터를 기반으로 연산을 수행하게 됩니다.
- 트랜잭션 A가 커밋을 완료한 후에만 락을 해제하면, 트랜잭션 B는 재고가 7개인 상태에서 시작하여 최종적으로 9개의 재고를 만들게 됩니다.

## 6. 결론

- 분산 락은 분산 환경에서 자원에 대한 동시 접근을 제어하기 위한 필수적인 메커니즘입니다.
- Redis, 데이터베이스, ZooKeeper 등 다양한 방법으로 구현할 수 있으며, 각각 장단점이 있습니다.
- 분산 락을 구현할 때는 다음 사항을 고려해야 합니다.
  - 락 획득 타임아웃
  - 락 유지 시간(TTL)
  - 안전한 락 해제 방법
  - 분산 환경에서의 신뢰성
  - 성능 최적화
- 직접 구현하기보다는 Redisson과 같은 검증된 라이브러리를 사용하는 것이 안전합니다.
- 분산 락은 완벽한 해결책이 아니며, 특정 상황에서는 다른 동시성 제어 메커니즘을 고려해야 할 수도 있습니다.

## 참고 자료

- [Redis 공식 문서: Distributed Locks](https://redis.io/topics/distlock)
- [Channel.io 블로그: Distributed Lock](https://channel.io/ko/blog/articles/distributedlock-abc2d95c)
- [Hyperconnect 기술 블로그: Redis Distributed Lock 구현하기](https://hyperconnect.github.io/2019/11/15/redis-distributed-lock-1.html)
- [우아한형제들 기술 블로그: WMS 재고 이관을 위한 분산 락 사용기](https://techblog.woowahan.com/17416/)
- [우아한형제들 기술 블로그: MySQL을 이용한 분산락으로 여러 서버에 걸친 동시성 관리](https://techblog.woowahan.com/2631/)
- [컬리 기술 블로그: Redisson을 이용한 분산 락 구현](https://helloworld.kurly.com/blog/distributed-redisson-lock/)