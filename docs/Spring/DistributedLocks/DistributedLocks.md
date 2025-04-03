---
title: "Distributed Locks"
description: "분산 환경에서 동시성 제어를 위한 Spring의 LockRegistry와 RedisLockRegistry 활용법을 알아봅니다. Redis를 사용한 분산 락 구현 방법, 락 모드 선택, 갱신 전략 등을 실제 사례와 함께 설명합니다."
tags: [ "REDIS", "DISTRIBUTED_LOCK", "SPRING_INTEGRATION", "CONCURRENCY", "SPRING", "BACKEND", "JAVA" ]
keywords: [ "분산락", "distributed lock", "디스트리뷰티드락", "레디스", "redis", "스프링", "spring", "동시성제어", "concurrency control", "스프링 인테그레이션", "spring integration", "락 레지스트리", "lock registry", "pub-sub", "pub/sub", "스핀락", "spin lock" ]
draft: false
hide_title: true
---

## 1. 분산 락(Distributed Locks) 개요

- 분산 환경에서는 특정 리소스에 대한 작업이 배타적으로 수행되어야 하는 상황이 자주 발생합니다.
- 단일 애플리케이션에서는 Java의 `java.util.concurrent.locks.Lock` 구현체를 사용하여 해결할 수 있습니다.
- 그러나 애플리케이션이 여러 서버에 분산되거나 클러스터에서 실행될 때는 단순한 로컬 락으로는 동시성 제어가 불가능합니다.
- 분산 환경에서는 모든 서버가 공유할 수 있는 외부 저장소를 기반으로 락을 구현해야 합니다.
- [Distributed Lock 더 보기](../../Database/DistributedLock/DistributedLock.md)

## 2. Spring의 LockRegistry 인터페이스

- Spring Integration은 락 관리를 위한 `LockRegistry` 인터페이스를 제공합니다.
- 이 인터페이스는 일반적인 락 관리 기능을 정의하며, 구현체에 따라 단일 JVM 내 락이나 분산 락으로 활용할 수 있습니다.
- 동일한 인터페이스를 통해 다양한 저장소 기반의 락 구현체를 일관된 방식으로 사용할 수 있습니다.

### 2.1 주요 메서드

- `obtain(Object lockKey)`
  - 주어진 락 키에 대한 락 객체를 획득합니다.
- `void executeLocked(Object lockKey, CheckedRunnable<E> runnable)`
  - 락을 획득하고 주어진 작업을 실행합니다.
- `T executeLocked(Object lockKey, CheckedCallable<T,E> callable)`
  - 락을 획득하고 결과를 반환하는 작업을 실행합니다.
- `void executeLocked(Object lockKey, Duration waitLockDuration, CheckedRunnable<E> runnable)`
  - 지정된 시간 동안 락 획득을 시도하고 작업을 실행합니다.
  - 지정 시간동안 락을 획득하지 못하면 TimeoutException가 발생합니다.
- `T executeLocked(Object lockKey, Duration waitLockDuration, CheckedCallable<T,E> callable)`
  - 지정된 시간 동안 락 획득을 시도하고 결과를 반환하는 작업을 실행합니다.
  - 지정 시간동안 락을 획득하지 못하면 TimeoutException가 발생합니다.

### 2.2 사용 예시

```java
// 락을 직접 관리하는 방식
Lock lock = registry.obtain("someLockKey");
try {
    if (lock.tryLock(3, TimeUnit.SECONDS)) {
        try {
            // 배타적 리소스에 접근하는 코드
        }
        finally {
            lock.unlock();
        }
    }
}
catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}

// executeLocked를 사용한 간편한 방식 (Spring 6.2 이상)
registry.executeLocked("someLockKey", () -> {
    // 배타적 리소스에 접근하는 코드
});
```

### 2.3 주요 구현체

- `DefaultLockRegistry`: `ReentrantLock` API 기반의 인메모리 락 구현체로, 단일 JVM 내에서만 유효하며 분산 환경에서는 사용할 수 없습니다.
- `RedisLockRegistry`: Redis를 사용하여 여러 서버 간에 분산 락을 구현합니다.
- `JdbcLockRegistry`: 데이터베이스를 사용한 분산 락 구현체입니다.
- `ZookeeperLockRegistry`: Zookeeper를 사용한 분산 락 구현체입니다.
- 각 구현체는 사용 목적과 환경에 따라 선택해야 하며, 분산 환경에서는 `DefaultLockRegistry`가 아닌 분산 저장소 기반 구현체를 사용해야 합니다.

## 3. LockRegistry 확장 인터페이스

### 3.1 ExpirableLockRegistry

```java
public interface ExpirableLockRegistry extends LockRegistry {
    void expireUnusedOlderThan(long age);
}
```

- 일정 시간 이상 사용되지 않은 락을 자동으로 제거할 수 있는 기능을 제공합니다.
- 오래된 락으로 인한 자원 낭비를 방지하는 데 유용합니다.

### 3.2 RenewableLockRegistry

```java
public interface RenewableLockRegistry extends LockRegistry {
    void renewLock(Object lockKey);
}
```

- 이미 획득한 락의 유효 시간을 연장할 수 있는 기능을 제공합니다.
- 장시간 실행되는 작업에서 락이 중간에 만료되는 것을 방지할 수 있습니다.

## 4. RedisLockRegistry 활용하기

- Spring Integration 4.0부터 도입된 `RedisLockRegistry`는 Redis를 사용하여 분산 락을 구현합니다.
- Redis의 원자적 연산을 활용하여 여러 서버 간에 일관된 락 관리가 가능합니다.

### 4.1 기본 설정

```groovy
implementation 'org.springframework.boot:spring-boot-starter-integration'
implementation "org.springframework.integration:spring-integration-redis"
```

```java
@Bean
public RedisLockRegistry redisLockRegistry(RedisConnectionFactory redisConnectionFactory) {
    return new RedisLockRegistry(redisConnectionFactory, "lock-registry", 30000);
}
```

- `RedisLockRegistry(RedisConnectionFactory connectionFactory, String registryKey, long expireAfter)`
- `connectionFactory`: RedisConnectionFactory를 사용하여 Redis 서버와 연결합니다.
- `expireAfter`: 락 만료 시간(밀리초 단위)입니다. 기본값은 60000ms(1분)입니다.
- `registryKey`:
  - registryKey 매개변수는 락 키의 접두사(prefix)를 의미합니다.
  - Redis에 저장되는 락의 실제 키는 `registryKey:lockKey` 형태로 구성됩니다.

### 4.2 락 모드 설정

- Spring Integration 5.5.13부터 두 가지 락 획득 모드를 지원합니다:
  - `RedisLockType.SPIN_LOCK`: 주기적으로(100ms) 락 획득 가능 여부를 확인합니다. 기본값입니다.
  - `RedisLockType.PUB_SUB_LOCK`: Redis pub-sub 기능을 활용하여 락 해제 알림을 받습니다.

```java
@Bean
public RedisLockRegistry redisLockRegistry(RedisConnectionFactory redisConnectionFactory) {
    RedisLockRegistry registry = new RedisLockRegistry(redisConnectionFactory, "lock-registry", 30000);
    registry.setRedisLockType(RedisLockType.PUB_SUB_LOCK); // PUB_SUB_LOCK 또는 SPIN_LOCK
    return registry;
}
```

:::tip 일반적으로 PUB_SUB_LOCK 모드가 더 효율적입니다. 클라이언트와 Redis 서버 간 네트워크 통신이 적고, 락이 해제되는 즉시 알림을 받아 처리할 수 있습니다. 하지만 마스터/복제본 구성(예: AWS ElastiCache)에서는 pub-sub을 지원하지 않을 수 있으므로 환경에 맞게 선택해야 합니다.
:::

### 4.3 락 갱신 스케줄러 설정

- Spring Integration 6.4부터 락 갱신 스케줄러를 설정할 수 있습니다
- 락 갱신 스케줄러의 특징:
  - 락이 성공적으로 획득된 후 자동으로 갱신합니다.
  - 갱신 주기는 락 만료 시간의 1/3입니다.
  - 락을 명시적으로 해제하거나 Redis에서 키가 삭제될 때까지 갱신이 계속됩니다.

```java
@Bean
public RedisLockRegistry redisLockRegistry(RedisConnectionFactory redisConnectionFactory) {
    RedisLockRegistry registry = new RedisLockRegistry(redisConnectionFactory, "lock-registry", 30000);
    registry.setRenewalTaskScheduler(taskScheduler);
    return registry;
}
```

:::info 기본적으로 RedisLockRegistry를 생성할 때
`expireAfter`를 설정합니다. 이 값은 락이 획득된 후 자동으로 만료되는 시간을 설정합니다. 장시간 실행되는 작업은 락 갱신 스케줄러를 활용하여 락이 중간에 만료되지 않도록 합니다.
:::

### 4.4 활용 사례

#### 중복 결제 방지

```java
@Service
public class PaymentService {
    private final LockRegistry lockRegistry;
    
    public PaymentService(LockRegistry lockRegistry) {
        this.lockRegistry = lockRegistry;
    }
    
    public void processPayment(String orderId, BigDecimal amount) {
        lockRegistry.executeLocked("payment-" + orderId, () -> {
            // 주문 상태 확인
            Order order = orderRepository.findById(orderId).orElseThrow();
            
            if (order.isPaid()) {
                throw new IllegalStateException("이미 결제된 주문입니다.");
            }
            
            // 결제 처리 로직
            paymentGateway.process(orderId, amount);
            
            // 주문 상태 업데이트
            order.markAsPaid();
            orderRepository.save(order);
        });
    }
}

```

#### 분산 스케줄러 - 단일 인스턴스 실행 보장

```java
@Scheduled(fixedRate = 60000)
public void scheduledTask() {
    try {
        lockRegistry.executeLocked("scheduled-task-lock", Duration.ofSeconds(5), () -> {
            // 이 코드는 여러 서버 중 하나의 인스턴스에서만 실행됩니다.
            performScheduledTask();
        });
    } catch (TimeoutException e) {
        // 락 획득 시간 초과 처리
        log.warn("다른 인스턴스가 이미 작업을 실행 중입니다.");
    }
}
```

## 5. 주의사항 및 모범 사례

- 락 만료 시간 설정: 작업 예상 실행 시간보다 충분히 길게 설정하되, 무한정 길게 설정하면 장애 시 다른 서버가 작업을 대체할 수 없습니다.
- 락 갱신 전략: 장시간 실행되는 작업은 락 갱신 스케줄러를 활용하여 락이 중간에 만료되지 않도록 합니다.
- 예외 처리: 락 획득 실패나 작업 실행 중 예외 발생 시의 처리 로직을 명확히 정의합니다.
- 데드락 방지: 락 획득 시도 시간(timeout)을 설정하고, 불필요하게 여러 락을 동시에 획득하지 않도록 합니다.
- Redis 장애 대비: Redis 클러스터 구성이나 장애 발생 시의 대체 전략을 마련합니다.

## 6. 요약

- 분산 환경에서 동시성 제어를 위해 Spring Integration의 `LockRegistry`와 Redis 기반의 `RedisLockRegistry`를 활용할 수 있습니다.
- 락 모드, 갱신 전략, 만료 시간 등을 적절히 설정하여 시스템 요구사항에 맞는 분산 락을 구현합니다.
- 이를 통해 중복 결제 방지, 단일 인스턴스 작업 실행 보장 등 분산 환경에서의 동시성 문제를 효과적으로 해결할 수 있습니다.

## 참고

- [Spring Integration 공식 문서 - Distributed Locks](https://docs.spring.io/spring-integration/reference/distributed-locks.html)
- [Spring Integration 공식 문서 - Redis](https://docs.spring.io/spring-integration/reference/redis.html#redis-lock-registry)
- [WMS 재고 이관을 위한 분산 락 사용기](https://techblog.woowahan.com/17416/)