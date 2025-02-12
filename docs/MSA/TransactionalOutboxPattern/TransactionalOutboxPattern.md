---
title: "Transactional Outbox Pattern"
description: "분산 시스템에서 데이터 일관성을 보장하기 위한 트랜잭셔널 아웃박스 패턴을 상세히 설명합니다. 패턴의 구현 방식인 폴링 발행기와 트랜잭션 로그 테일링의 장단점과 적절한 사용 상황을 알아봅니다."
tags: [ "DISTRIBUTED_SYSTEM", "DATABASE", "TRANSACTION", "ARCHITECTURE", "BACKEND", "SYSTEM_DESIGN" ]
keywords: [ "트랜잭셔널 아웃박스", "transactional outbox", "분산 시스템", "distributed system", "데이터 일관성", "data consistency", "폴링 발행기", "polling publisher", "트랜잭션 로그 테일링", "transaction log tailing", "이벤트 발행", "메시지 큐", "message queue", "데이터베이스", "database" ]
draft: false
hide_title: true
---

## 1. 트랜잭셔널 아웃박스 패턴 소개

- 분산 시스템에서 데이터베이스 트랜잭션과 메시지 발행을 원자적으로 처리하는 것은 까다로운 문제입니다.
- 트랜잭셔널 아웃박스 패턴은 이 문제를 해결하기 위한 효과적인 방법을 제시합니다.

### 1.1 패턴의 핵심 개념

- 트랜잭셔널 아웃박스 패턴의 핵심은 메시지나 이벤트를 즉시 외부 시스템으로 발행하지 않고, 데이터베이스 트랜잭션의 일부로 outbox 테이블에 저장하는 것입니다.
- 이후 별도의 프로세스가 이 테이블을 모니터링하여 메시지를 실제로 발행합니다.

#### 기본 구조

```sql
CREATE TABLE outbox
(
    id             UUID PRIMARY KEY,
    aggregate_type VARCHAR(255),
    aggregate_id   VARCHAR(255),
    event_type     VARCHAR(255),
    payload        JSONB,
    created_at     TIMESTAMP,
    published      BOOLEAN DEFAULT FALSE
);
```

## 2. 패턴 구현 방식

### 2.1 트랜잭션 처리 과정

- 비즈니스 로직 실행과 동시에 outbox 테이블에 이벤트 저장
- 동일한 트랜잭션 내에서 두 작업이 원자적으로 처리
- 트랜잭션 성공 시 이벤트가 안전하게 저장됨을 보장

#### 예시 코드

```java
@Transactional
public void createOrder(Order order) {
    // 주문 저장
    orderRepository.save(order);
    
    // outbox 테이블에 이벤트 저장
    OutboxEvent event = new OutboxEvent(
        "Order",
        order.getId(),
        "OrderCreated",
        convertToJson(order)
    );
    outboxRepository.save(event);
}
```

### 2.2 구현 방식 비교

트랜잭셔널 아웃박스 패턴은 크게 두 가지 방식으로 구현할 수 있습니다:

- 폴링 발행기(Polling Publisher) 방식
- 트랜잭션 로그 테일링(Transaction Log Tailing) 방식

## 3. 폴링 발행기 방식

### 3.1 작동 방식

- 주기적으로 outbox 테이블의 미발행 이벤트 조회
- 이벤트를 메시지 브로커로 발행
- 발행 성공 시 이벤트를 처리됨으로 표시

:::tip
폴링 간격은 시스템의 요구사항에 따라 조정할 수 있습니다. 실시간성이 중요한 경우 짧게, 리소스 효율성이 중요한 경우 길게 설정합니다.
:::

#### 구현 예시

```java
@Scheduled(fixedRate = 1000)
public void publishEvents() {
    List<OutboxEvent> events = outboxRepository
        .findByPublishedFalse();
    
    for (OutboxEvent event : events) {
        try {
            messageQueue.publish(event);
            event.setPublished(true);
            outboxRepository.save(event);
        } catch (Exception e) {
            log.error("Failed to publish event: " + event.getId());
        }
    }
}
```

### 3.2 장단점

- 장점:
	- 구현이 단순하고 직관적
	- 데이터베이스 부하가 예측 가능
	- 장애 복구가 용이
	- 데이터베이스 벤더 중립적
- 단점:
	- 폴링 간격만큼의 지연 발생
	- 불필요한 데이터베이스 쿼리 발생 가능
	- 확장 시 폴링 중복 처리 고려 필요

## 4. 트랜잭션 로그 테일링 방식

### 4.1 작동 방식

- 데이터베이스의 트랜잭션 로그를 직접 읽어서 변경사항 감지
- 감지된 변경사항을 메시지 브로커로 발행
- 데이터베이스 벤더의 CDC(Change Data Capture) 기능 활용

:::info
PostgreSQL의 경우 logical decoding을 통해 트랜잭션 로그 테일링을 구현할 수 있으며, Debezium 같은 도구를 활용하면 편리합니다.
:::

### 4.2 장단점

- 장점:
	- 실시간에 가까운 처리 가능
	- 데이터베이스 부하 최소화
	- 변경사항 유실 위험 감소
- 단점:
	- 구현이 상대적으로 복잡
	- 데이터베이스 벤더 의존적
	- 트랜잭션 로그 관리 오버헤드

### 4.3 선택 기준

- 폴링 발행기 선택 시:
	- 구현 복잡도를 낮추고 싶은 경우
	- 데이터베이스 벤더 중립성이 필요한 경우
	- 약간의 지연이 허용되는 경우
- 트랜잭션 로그 테일링 선택 시:
	- 실시간 처리가 중요한 경우
	- 데이터베이스 리소스가 제한적인 경우
	- 특정 데이터베이스 벤더의 CDC 기능을 활용할 수 있는 경우

## 5. 실제 적용 시 고려사항

### 5.1 성능 최적화

- 인덱스 전략
	- created_at과 published 컬럼에 대한 적절한 인덱스 설정
	- 주기적인 처리완료 레코드 정리
- 배치 처리
	- 한 번에 여러 메시지를 발행하여 네트워크 오버헤드 감소
	- 적절한 배치 크기 설정으로 메모리 사용 최적화

### 5.2 장애 처리

- 멱등성 보장
	- 메시지 ID를 통한 중복 발행 방지
	- 수신자 측의 멱등한 처리 구현
- 재시도 전략
	- 발행 실패 시 지수 백오프를 통한 재시도
	- Dead Letter Queue를 통한 실패 메시지 관리

## 6. 결론

- 트랜잭셔널 아웃박스 패턴은 분산 시스템에서 데이터 일관성을 보장하기 위한 효과적인 솔루션입니다.
- 폴링 발행기와 트랜잭션 로그 테일링은 각각의 장단점이 있으며, 시스템의 요구사항에 따라 적절한 방식을 선택해야 합니다.
- 특히 마이크로서비스 아키텍처에서 서비스 간 데이터 일관성을 유지하면서도 결합도를 낮게 유지하고자 할 때 이 패턴은 매우 유용합니다.
- 다만, 구현 복잡도와 운영 비용을 고려하여 실제 적용 여부를 결정해야 하며, 시스템의 규모와 요구사항에 맞게 적절히 최적화하는 것이 중요합니다.