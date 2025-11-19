---
title: "Redis Sorted Sets"
description: "Redis Sorted Sets의 개념, 동작 원리, 주요 명령어, 그리고 실전 활용 방법을 상세히 다룹니다."
keywords: ["Redis", "Sorted Sets", "ZADD", "ZRANGE", "Leaderboard", "데이터구조"]
tags: ["Redis", "DataStructure", "NoSQL"]
hide_title: true
last_update:
  date: 2025-11-14
  author: youngthree
---

## 1. 개요

- Redis Sorted Set은 **점수(score)로 정렬된 고유한 문자열(member) 컬렉션**입니다. 
- 여러 문자열이 동일한 점수를 가질 경우, 사전순으로 정렬됩니다.

### 1.1 주요 활용 사례

- **리더보드(Leaderboard)**: 대규모 온라인 게임에서 최고 점수의 순위를 쉽게 관리
- **속도 제한기(Rate Limiter)**: 슬라이딩 윈도우 방식의 API 요청 제한

### 1.2 특징

- Sorted Set은 **Set과 Hash의 혼합**으로 생각할 수 있습니다:
- **Set처럼**: 고유하고 반복되지 않는 문자열 요소로 구성
- **Hash처럼**: 각 요소가 부동소수점 값(점수)과 연결됨

:::info[Sorted Set의 정렬 규칙]

Sorted Set의 요소는 다음 규칙에 따라 정렬됩니다:

1. **점수가 다른 경우**: 점수가 높은 요소가 더 큽니다 (`A.score > B.score` → `A > B`)
2. **점수가 같은 경우**: 사전순으로 뒤에 있는 문자열이 더 큽니다
3. Sorted Set은 고유한 요소만 가지므로 동일한 문자열은 존재할 수 없습니다

:::

## 2. 기본 명령어

### 2.1 ZADD - 요소 추가

`ZADD` 명령어로 점수와 함께 요소를 추가할 수 있습니다.

```bash
> ZADD racer_scores 10 "Norem"
(integer) 1
> ZADD racer_scores 12 "Castilla"
(integer) 1
> ZADD racer_scores 8 "Sam-Bodden" 10 "Royce" 6 "Ford" 14 "Prickett"
(integer) 4
```

- racer_scores 라는 Sorted Set에 레이서 점수를 추가했습니다.


```bash
> ZRANGE racer_scores 0 -1
1) "Ford"
2) "Sam-Bodden"
3) "Norem"
4) "Royce"
5) "Castilla"
6) "Prickett"
```

- ZRANGE 명령어로 레이서 점수를 조회했습니다.

:::tip[ZADD의 특징]

- `SADD`와 유사하지만 점수를 추가로 받습니다
- 가변 인자를 지원하여 여러 점수-값 쌍을 한 번에 추가할 수 있습니다
- 형식: `ZADD key score member [score member ...]`

:::

### 2.2 ZRANGE / ZREVRANGE - 범위 조회

Sorted Set은 이미 정렬되어 있어 정렬된 요소를 반환하는 것이 간단합니다.

```bash
> ZRANGE racer_scores 0 -1
1) "Ford"
2) "Sam-Bodden"
3) "Norem"
4) "Royce"
5) "Castilla"
6) "Prickett"

> ZREVRANGE racer_scores 0 -1
1) "Prickett"
2) "Castilla"
3) "Royce"
4) "Norem"
5) "Sam-Bodden"
6) "Ford"
```

- `ZRANGE`: 낮은 점수부터 높은 점수 순서 (오름차순)
- `ZREVRANGE`: 높은 점수부터 낮은 점수 순서 (내림차순)
- `0`과 `-1`은 첫 번째 요소부터 마지막 요소까지를 의미합니다

### 2.3 WITHSCORES - 점수와 함께 조회

```bash
> ZRANGE racer_scores 0 -1 WITHSCORES
 1) "Ford"
 2) "6"
 3) "Sam-Bodden"
 4) "8"
 5) "Norem"
 6) "10"
 7) "Royce"
 8) "10"
 9) "Castilla"
10) "12"
11) "Prickett"
12) "14"
```

## 3. 범위 연산

### 3.1 ZRANGEBYSCORE - 점수 범위로 조회

점수 범위를 지정하여 요소를 조회할 수 있습니다.

```bash
> ZRANGEBYSCORE racer_scores -inf 10
1) "Ford"
2) "Sam-Bodden"
3) "Norem"
4) "Royce"
```

- `-inf`: 음의 무한대
- 양쪽 극값이 모두 포함됩니다

### 3.2 ZREM / ZREMRANGEBYSCORE - 요소 삭제

```bash
> ZREM racer_scores "Castilla"
(integer) 1

> ZREMRANGEBYSCORE racer_scores -inf 9
(integer) 2

> ZRANGE racer_scores 0 -1
1) "Norem"
2) "Royce"
3) "Prickett"
```

- `ZREM`: 특정 요소 삭제
- `ZREMRANGEBYSCORE`: 점수 범위로 요소 삭제 (삭제된 요소 개수 반환)

## 4. 순위 조회

### 4.1 ZRANK / ZREVRANK

정렬된 요소 집합에서 특정 요소의 순위(위치)를 조회할 수 있습니다.

```bash
> ZRANK racer_scores "Norem"
(integer) 0

> ZREVRANK racer_scores "Norem"
(integer) 2
```

- `ZRANK`: 오름차순 기준 순위 (0부터 시작)
- `ZREVRANK`: 내림차순 기준 순위

## 5. 사전순 정렬

### 5.1 개념

- Redis 2.8부터 모든 요소가 동일한 점수를 가질 때 사전순으로 범위를 조회하는 기능이 추가되었습니다.

### 5.2 주요 명령어

- `ZRANGEBYLEX`: 사전순 범위 조회
- `ZREVRANGEBYLEX`: 사전순 역순 범위 조회
- `ZREMRANGEBYLEX`: 사전순 범위 삭제
- `ZLEXCOUNT`: 사전순 범위 개수

### 5.3 예시

```bash
> ZADD racer_scores 0 "Norem" 0 "Sam-Bodden" 0 "Royce" 0 "Castilla" 0 "Prickett" 0 "Ford"
(integer) 3

> ZRANGE racer_scores 0 -1
1) "Castilla"
2) "Ford"
3) "Norem"
4) "Prickett"
5) "Royce"
6) "Sam-Bodden"

> ZRANGEBYLEX racer_scores [A [L
1) "Castilla"
2) "Ford"
```

:::info[사전순 범위 지정]

- `[`: 포함 (inclusive)
- `(`: 미포함 (exclusive)
- `+`: 양의 무한대
- `-`: 음의 무한대

:::

### 5.4 활용: 범용 인덱스

이 기능은 Sorted Set을 **범용 인덱스**로 사용할 수 있게 합니다.

**예시: 128비트 정수 인덱싱**
- 모든 요소를 동일한 점수(예: 0)로 추가
- 128비트 숫자를 빅 엔디안 형식의 16바이트 접두사로 사용
- 빅 엔디안 숫자는 사전순 정렬 시 숫자순으로도 정렬됨

## 6. 리더보드 구현

### 6.1 점수 업데이트

Sorted Set의 점수는 언제든지 업데이트할 수 있습니다. 이미 존재하는 요소에 대해 `ZADD`를 호출하면 `O(log(N))` 시간 복잡도로 점수와 위치가 업데이트됩니다.

### 6.2 ZINCRBY - 점수 증가

```bash
> ZADD racer_scores 100 "Wood"
(integer) 1
> ZADD racer_scores 100 "Henshaw"
(integer) 1

> ZADD racer_scores 150 "Henshaw"
(integer) 0

> ZINCRBY racer_scores 50 "Wood"
"150"
> ZINCRBY racer_scores 50 "Henshaw"
"200"
```

- `ZADD`: 이미 존재하는 멤버의 경우 0 반환 (점수 업데이트)
- `ZINCRBY`: 기존 점수에 값을 더하고 새로운 점수 반환

:::tip[리더보드 활용 사례]

Facebook 게임과 같은 애플리케이션에서:
- 높은 점수순으로 사용자 정렬
- 순위 조회 기능 (예: "당신은 #4932위입니다")
- 상위 N명의 사용자 표시

수많은 업데이트가 발생하는 환경에서 Sorted Set이 적합합니다.

:::

## 7. 구현 및 성능

### 7.1 내부 구조

:::info[이중 구조 구현]

Sorted Set은 **Skip List**와 **Hash Table**을 모두 포함하는 이중 구조로 구현되어 있습니다.

- 요소 추가 시: `O(log(N))` 연산 수행
- 정렬된 요소 조회 시: 이미 정렬되어 있어 추가 작업 불필요

:::

### 7.2 시간 복잡도

- 대부분의 Sorted Set 연산: **O(log(n))** (n은 멤버 수)
- `ZRANGE` 명령어: **O(log(n) + m)** (m은 반환되는 결과 수)

:::warning[대량 조회 시 주의]

`ZRANGE` 명령어로 수만 개 이상의 결과를 반환하는 경우 주의가 필요합니다. 결과 수(m)만큼 추가 시간이 소요됩니다.

:::

## 8. 주요 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `ZADD` | 새 멤버와 점수를 추가 (이미 존재하면 점수 업데이트) |
| `ZRANGE` | 주어진 범위 내의 멤버를 정렬된 순서로 반환 |
| `ZRANK` | 오름차순 기준 멤버의 순위 반환 |
| `ZREVRANK` | 내림차순 기준 멤버의 순위 반환 |
| `ZINCRBY` | 멤버의 점수를 증가시킴 |
| `ZREM` | 멤버 삭제 |
| `ZRANGEBYSCORE` | 점수 범위로 멤버 조회 |
| `ZREMRANGEBYSCORE` | 점수 범위로 멤버 삭제 |
| `ZRANGEBYLEX` | 사전순 범위로 멤버 조회 |

전체 Sorted Set 명령어 목록은 [Redis 공식 문서](https://redis.io/commands/?group=sorted-set)를 참고하세요.

## 9. 대안

- Redis Sorted Set은 때때로 다른 Redis 데이터 구조를 인덱싱하는 데 사용됩니다. 데이터를 인덱싱하고 쿼리해야 하는 경우, **JSON 데이터 타입**과 **Redis Query Engine** 기능을 고려해보세요.

## 참고

- [Redis Sorted Sets Explained](https://redis.io/topics/data-types-intro#sorted-sets) - Redis Sorted Sets에 대한 재미있는 소개
- [Redis University RU101](https://university.redis.com/courses/ru101/) - Redis Sorted Sets를 상세히 다루는 강좌
