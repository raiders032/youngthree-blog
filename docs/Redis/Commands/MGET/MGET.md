---
title: "Redis MGET"
description: "Redis MGET 명령어의 문법, 인자, 반환값, 시간복잡도와 예제를 정리합니다."
keywords: ["Redis", "MGET", "String", "Commands", "명령어"]
tags: ["Redis", "Commands", "String"]
hide_title: true
last_update:
  date: 2026-08-03
  author: youngthree
---

## 1. 개요

- `MGET`은 **하나 이상의 키에 대한 문자열 값을 원자적(atomically)으로 반환**하는 명령어입니다.
- 문자열 값을 가지고 있지 않거나 존재하지 않는 키에 대해서는 `nil`을 반환합니다.
- 이런 이유로 `MGET` 연산은 **절대 실패하지 않습니다**.

## 2. Syntax

```
MGET key [key ...]
```

| 항목 | 값 |
|------|------|
| 그룹(Group) | string |
| 최초 지원 버전(Since) | 1.0.0 |
| 시간 복잡도 | O(N) — N은 조회할 키의 개수 |
| Command flags | `readonly`, `fast` |
| ACL 카테고리 | `@read`, `@string`, `@fast` |

:::info[클러스터 환경 주의]

`MGET`은 여러 키를 한 번에 다루는 멀티 키(multi-key) 명령어이기 때문에, Redis Cluster 환경에서는 동작 방식이 달라질 수 있습니다. 자세한 내용은 [멀티 키 연산 문서](https://redis.io/docs/latest/develop/using-commands/multi-key-operations)를 참고하세요.

:::

## 3. 필수 인자

### `key [key ...]`

- 값을 조회할 하나 이상의 키입니다. 
가변 인자를 지원하므로 여러 키를 한 번에 조회할 수 있습니다.

## 4. 반환값

**RESP2 / RESP3 공통**

- [Array reply](https://redis.io/docs/latest/develop/reference/protocol-spec#arrays): 지정한 키들의 값 목록을 순서대로 반환합니다.
- 존재하지 않거나 문자열 타입이 아닌 키는 `nil`로 채워집니다.

## 5. 예제

```bash
> SET key1 "Hello"
OK
> SET key2 "World"
OK
> MGET key1 key2 nonexisting
1) "Hello"
2) "World"
3) (nil)
```

- `key1`, `key2`는 정상적으로 값을 반환했습니다.
- 존재하지 않는 `nonexisting` 키는 `(nil)`로 반환되었지만, 명령어 자체는 에러 없이 성공했습니다.

### 5.1 Python (redis-py)

```python
r.set("key1", "Hello")
r.set("key2", "World")

mget_result = r.mget("key1", "key2", "nonexisting")
print(mget_result)
# >>> ['Hello', 'World', None]
```

### 5.2 Node.js (node-redis)

```javascript
await client.set('key1', 'Hello');
await client.set('key2', 'World');

const mgetResult = await client.mGet(['key1', 'key2', 'nonexisting']);
console.log(mgetResult); // >>> [ 'Hello', 'World', null ]
```

:::tip[MGET의 특징]

- 존재하지 않는 키나 문자열이 아닌 타입(List, Hash 등)의 키는 에러 대신 `nil`로 반환됩니다.
- 여러 번의 `GET` 요청을 한 번의 라운드트립으로 묶을 수 있어, 다수의 키를 조회할 때 네트워크 오버헤드를 줄일 수 있습니다.
- 값을 설정할 때 사용하는 [`MSET`](https://redis.io/docs/latest/commands/mset/)과 함께 자주 사용됩니다.

:::

## 6. Redis Software / Redis Cloud 호환성

| Redis Software | Redis Cloud |
|---|---|
| ✅ Standard, ✅ Active-Active | ✅ Standard, ✅ Active-Active |

## 7. 부록: 멀티 키(Multi-key) 연산

- `MGET`은 여러 키를 한 번에 다루는 **멀티 키 명령어**입니다. 
- 멀티 키 명령어는 Redis의 구성(단일 인스턴스인지, 클러스터인지 등)에 따라 동작 방식이 크게 달라지므로 별도로 정리합니다.

### 7.1 Redis 구성(Configuration) 5가지

- Redis는 멀티 키 명령어의 동작이 서로 다른 5가지 구성을 지원합니다.
- ROS: Redis Open Source, RS: Redis Software

1. **ROS/RS 클러스터링 비활성화** - 단일 Redis 인스턴스
2. **ROS, 클러스터링 활성화** - Redis Open Source 클러스터
3. **RS, 클러스터링 활성화, OSS Cluster API 활성화** - Redis Software (ROS 클러스터 호환 모드)
4. **RS, 클러스터링 활성화, OSS Cluster API 비활성화** - Redis Software 자체 클러스터링
5. **RS, Active-Active** - 샤드가 하나뿐이어도 클러스터로 취급됨

### 7.2 명령어 동작 방식 3가지

각 구성에서 멀티 키 명령어는 다음 세 가지 동작 중 하나를 보입니다.

- **single-slot**: 모든 키가 동일한 해시 슬롯(hash slot)에 있어야 동작
- **cross-slot (all shards)**: 클러스터의 모든 샤드에 걸쳐 동작 가능
- **cross-slot (within a single shard)**: 슬롯은 넘나들 수 있지만 하나의 샤드 내에서만 동작

### 7.3 읽기 전용(Read-only) 명령어

| 동작 | 명령어 |
|---|---|
| ROS/RS 클러스터링 비활성화: 전체 DB(단일 샤드)<br/>ROS 클러스터링 활성화, RS 클러스터링 활성화(OSS Cluster API 활성화): 현재 샤드<br/>RS 클러스터링 활성화(OSS Cluster API 비활성화): 모든 샤드 | `DBSIZE`, `KEYS`, `SCAN` |
| ROS/RS 클러스터링 비활성화: cross-slot<br/>ROS 클러스터링 활성화, RS 클러스터링 활성화(OSS Cluster API 활성화): single-slot<br/>RS 클러스터링 활성화(OSS Cluster API 비활성화): cross-slot (all shards) | `EXISTS`, **`MGET`** |
| ROS/RS 클러스터링 비활성화: cross-slot<br/>ROS/RS 클러스터링 활성화(둘 다): single-slot | `PFCOUNT`, `SDIFF`, `SINTER`, `SINTERCARD`, `SUNION`, `WATCH`, `XREAD`, `XREADGROUP`, `ZDIFF`, `ZINTER`, `ZINTERCARD`, `ZUNION` |
| ROS/RS 클러스터링 비활성화: cross-slot<br/>ROS/RS 클러스터링 활성화(둘 다): single-shard | `JSON.MGET`<br/>`CROSSSLOT` 에러는 발생하지 않지만, 클러스터링이 활성화된 상태에서 지정한 키들이 같은 슬롯에 있지 않으면 현재 샤드에 있는 슬롯들에 대해서만 부분 결과를 반환합니다. |
| ROS/RS 클러스터링 비활성화: cross-slot (all shards)<br/>ROS/RS 클러스터링 활성화(둘 다): cross-slot (all shards), 트랜잭션의 일부로 사용 불가 | `TS.MGET`, `TS.MRANGE`, `TS.MREVRANGE`, `TS.QUERYINDEX` |

:::warning[클러스터 모드에서 MGET 사용 시]

Redis Cluster(OSS Cluster API 활성화) 환경에서는 `MGET`에 전달하는 모든 키가 **동일한 해시 슬롯**에 있어야 합니다. 그렇지 않으면 `CROSSSLOT` 에러가 발생합니다. 해결하려면 [해시 태그(hash tag)](#75-문제-해결)로 관련 키들을 같은 슬롯에 묶어야 합니다.

:::

### 7.4 읽기/쓰기(Read-write) 명령어

참고로 `MGET`과 짝을 이루는 `MSET`을 포함한 대표적인 읽기/쓰기 멀티 키 명령어의 동작은 다음과 같습니다.

| 동작 | 명령어 |
|---|---|
| ROS/RS 클러스터링 비활성화: 전체 DB(단일 샤드)<br/>ROS 클러스터링 활성화, RS 클러스터링 활성화(OSS Cluster API 활성화): 현재 샤드<br/>RS 클러스터링 활성화(OSS Cluster API 비활성화): 모든 샤드 | `FLUSHALL`, `FLUSHDB` |
| ROS/RS 클러스터링 비활성화: cross-slot<br/>ROS 클러스터링 활성화, RS 클러스터링 활성화(OSS Cluster API 활성화): single-slot<br/>RS 클러스터링 활성화(OSS Cluster API 비활성화): cross-slot (all shards) | `DEL`, `MSET`, `TOUCH`, `UNLINK`<br/>(Active-Active에서는 `DEL`, `MSET`, `UNLINK`가 single-slot) |
| ROS/RS 클러스터링 비활성화: cross-slot<br/>ROS/RS 클러스터링 활성화(둘 다): single-slot | `BITOP`, `BLMOVE`, `BLMPOP`, `BLPOP`, `BRPOP`, `BRPOPLPUSH`, `BZMPOP`, `BZPOPMAX`, `BZPOPMIN`, `CMS.MERGE`, `COPY`, `GEORADIUS`/`GEORADIUSBYMEMBER`(STORE/STOREDIST 사용 시), `GEOSEARCHSTORE`, `JSON.MSET`, `LMOVE`, `LMPOP`, `MSETNX`, `PFMERGE`, `RENAME`, `RENAMENX`, `RPOPLPUSH`, `SDIFFSTORE`, `SINTERSTORE`, `SMOVE`, `SUNIONSTORE`, `TDIGEST.MERGE`, `TS.MADD`, `ZDIFFSTORE`, `ZINTERSTORE`, `ZMPOP`, `ZRANGESTORE`, `ZUNIONSTORE` |
| ROS/RS 클러스터링 비활성화: cross-slot<br/>ROS/RS 클러스터링 활성화(둘 다): single-shard | `TS.CREATERULE`, `TS.DELETERULE`<br/>`CROSSSLOT` 에러는 발생하지 않지만, 클러스터링이 활성화된 상태에서 지정한 두 키가 같은 슬롯에 있지 않으면 `(error) ERR TSDB: the key does not exist`가 발생합니다. |

### 7.5 파이프라인, 트랜잭션, 스크립트

| 동작 | 대상 |
|---|---|
| ROS/RS 클러스터링 비활성화: cross-slot<br/>ROS 클러스터링 활성화, RS 클러스터링 활성화(OSS Cluster API 활성화): single-slot<br/>RS 클러스터링 활성화(OSS Cluster API 비활성화): cross-slot (all shards) | 파이프라인(Pipelines) |
| ROS/RS 클러스터링 비활성화: cross-slot<br/>ROS/RS 클러스터링 활성화(둘 다): single-slot | `MULTI`/`EXEC` 트랜잭션 내부의 키들<br/>`EVAL`/`EVALSHA`로 실행되는 Lua 스크립트 내부의 키들 |

### 7.6 구성별 예제

**단일 인스턴스 (클러스터링 없음)** — 모든 멀티 키 연산이 제약 없이 동작합니다.

```redis
# 파이프라인은 어떤 키에 대해서도 자유롭게 동작
PIPELINE
SET user:1 "Alice"
SET product:100 "Widget"
GET user:1
GET product:100
EXEC

# 트랜잭션도 어떤 키든 자유롭게 사용 가능
MULTI
SET counter:a 1
SET counter:b 2
INCR counter:a
INCR counter:b
EXEC
```

**클러스터 환경** — 슬롯 분산을 고려해야 합니다.

```redis
# 키들이 서로 다른 슬롯에 있으면 실패할 수 있음
MSET user:1 "Alice" user:2 "Bob"

# 해시 태그를 사용해 같은 슬롯으로 강제
MSET {users}:1 "Alice" {users}:2 "Bob"

# 특정 키가 속한 슬롯 확인
CLUSTER KEYSLOT user:1
CLUSTER KEYSLOT {users}:1
```

**Active-Active 데이터베이스** — 쓰기 연산에 추가 제약이 있습니다.

```redis
# 읽기 연산은 슬롯을 넘나들며 동작 가능
MGET user:1 user:2 product:100

# 쓰기 연산은 반드시 같은 슬롯이어야 함
MSET {data}:user:1 "Alice" {data}:user:2 "Bob"
```

### 7.7 문제 해결

**자주 발생하는 에러**

- `CROSSSLOT`: 요청한 키들이 동일한 슬롯으로 해시되지 않음
- `MOVED`: 리샤딩 중 키가 다른 노드로 이동함
- `TRYAGAIN`: 마이그레이션 중이라 연산을 일시적으로 사용할 수 없음

**해결 방법**

1. 관련 키들을 묶기 위해 **해시 태그(hash tag)** 사용 (예: `{users}:1`, `{users}:2`)
2. 크로스 슬롯 연산을 최소화하도록 **데이터 모델 재설계**
3. 에러 발생 시 **클러스터 상태 확인**
4. 일시적 실패에 대비한 **재시도 로직 구현**

### 7.8 성능 고려사항

- **single-slot 연산**은 조정(coordination) 과정이 없어 가장 빠릅니다.
- **cross-slot 연산**은 내부 라우팅으로 인해 지연 시간이 더 클 수 있습니다.
- `KEYS`, `FLUSHALL` 같은 **패턴 명령어**는 모든 샤드를 스캔하므로 비용이 클 수 있습니다.
- 모듈 명령어는 cross-slot에 최적화된 구현을 갖고 있을 수 있습니다.

## 참고

- [Redis 공식 문서 - MGET](https://redis.io/docs/latest/commands/mget/)
- [멀티 키 연산](https://redis.io/docs/latest/develop/using-commands/multi-key-operations)
- [MSET](https://redis.io/docs/latest/commands/mset/)
