---
title: "Database"
---

# 데이터베이스

## 기본 개념

- [정규화(Database Normalization)](Database-Normalization/Database-Normalization.md)
	- 이상, 함수 종속, 정규화
- [키(Key)](Key/Key.md)
	- Primary Key, Candidate Key, Alternate Key
	- Super Key, Foreign Key, Surrogate Key
- [식별자(UUID And Sequential ID)](UUID-And-SequentialID/UUID-And-SequentialID.md)
- [CAP 이론](CAP/CAP/CAP.md)

## 동시성 제어

- [트랜잭션(Transaction)](/docs/Database/Transaction/Transaction/Transaction.md)
- [트랜잭션 전파(TransactionPropagation)](Transaction/TransactionPropagation/TransactionPropagation.md)
- [분산 트랜잭션(DistributedTransaction)](DistributedTransation/DistributedTransaction.md)
- [격리 수준(Isolation Levels)](Isolation-Levels/Isolation-Levels.md)
	- Dirty reads, Non-repeatable reads, Phantom reads
	- READ UNCOMMITED, READ COMMITED
	- REAPEATABLE READ, SERIALIZABLE
- [잠금(Locking)](Locking/Locking.md)
	- Optimistic Locking, Pessimistic Locking
	- Exclusive locks, shared locks
- [DistributedLock.md](DistributedLock/DistributedLock.md)

## 성능 최적화

- [인덱스(Index)](/docs/Database/Index/Index/Index.md)
- [샤딩(Sharding)](Sharding/Sharding.md)

## 데이터베이스 유형

- [NoSQL](NoSQL/index.md)
- [MongoDB](MongoDB/index.md)
- [Redis](Redis/index.md)

## 응용

- [ORM](ORM/ORM.md)
- [CDC(Change Data Capture)](CDC/CDC.md)