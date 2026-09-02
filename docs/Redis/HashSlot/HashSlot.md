---
title: "Redis Hash Slot"
description: "Redis Cluster의 키 분산 모델(Key Distribution Model)과 해시 슬롯(Hash Slot), 해시 태그(Hash Tag)의 동작 원리를 정리합니다."
keywords: ["Redis", "Redis Cluster", "Hash Slot", "CRC16", "Hash Tag", "샤딩", "Sharding"]
tags: ["Redis", "Cluster", "Sharding"]
hide_title: true
last_update:
  date: 2026-08-03
  author: youngthree
---

## 1. 개요

- Redis Cluster는 키 공간(key space)을 **16384개의 해시 슬롯(hash slot)**으로 나눠서 관리합니다.
- 이 구조상 이론적으로 클러스터는 최대 16384개의 마스터 노드로 구성할 수 있지만, 실제 권장되는 최대 규모는 약 **1000개 노드** 수준입니다.
- 클러스터에 속한 각 마스터 노드는 16384개의 슬롯 중 일부를 담당합니다.

:::info[클러스터의 안정(stable) 상태란]

클러스터 재구성(하나의 노드에서 다른 노드로 해시 슬롯이 옮겨지는 작업)이 진행 중이지 않은 상태를 말합니다. 안정 상태에서는 하나의 해시 슬롯이 항상 **하나의 노드**에 의해서만 서비스됩니다. 다만 그 노드는 장애나 네트워크 분할(net split) 상황에서 자신을 대체할 하나 이상의 레플리카를 가질 수 있고, 이 레플리카는 (오래된 데이터 조회를 허용하는 경우) 읽기 작업을 확장하는 데도 사용될 수 있습니다.

:::

## 2. 키 분산 모델 (Key Distribution Model)

### 2.1 기본 알고리즘

키를 해시 슬롯에 매핑하는 기본 알고리즘은 다음과 같습니다. (해시 태그 예외는 3장에서 다룹니다.)

```
HASH_SLOT = CRC16(key) mod 16384
```

### 2.2 CRC16 사양

- Name: XMODEM (ZMODEM, CRC-16/ACORN 이라고도 불림)
- Width: 16 bit
- Poly: 1021 (x^16 + x^12 + x^5 + 1)
- Initialization: 0000
- Reflect Input byte: False
- Reflect Output CRC: False
- Xor constant to output CRC: 0000
- 입력 `"123456789"`에 대한 출력: `31C3`

- CRC16의 16비트 출력 중 **14비트만 사용**합니다. 그래서 위 공식에 `mod 16384`(2^14) 연산이 들어갑니다.
- Redis 팀의 테스트 결과, CRC16은 다양한 종류의 키를 16384개의 슬롯에 고르게 분산시키는 데 매우 효과적이었습니다.

:::tip[CRC16 레퍼런스 구현]

CRC16 알고리즘의 레퍼런스 구현(ANSI C)은 Redis Cluster 공식 스펙 문서의 Appendix A에서 확인할 수 있습니다. 핵심 로직은 미리 계산된 256개 항목의 룩업 테이블(`crc16tab`)을 이용한 테이블 기반 CRC 계산입니다.

```c
uint16_t crc16(const char *buf, int len) {
    int counter;
    uint16_t crc = 0;
    for (counter = 0; counter < len; counter++)
            crc = (crc<<8) ^ crc16tab[((crc>>8) ^ *buf++)&0x00FF];
    return crc;
}
```

전체 구현(룩업 테이블 포함): [Appendix A: CRC16 reference implementation in ANSI C](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/#appendix-a-crc16-reference-implementation-in-ansi-c)

:::

### 2.3 예시: 3개 노드 클러스터의 슬롯 분배

| 노드 | 담당 슬롯 |
|---|---|
| Node A | 0 ~ 5500 |
| Node B | 5501 ~ 11000 |
| Node C | 11001 ~ 16383 |

## 3. 해시 태그 (Hash Tags)

### 3.1 목적

- 해시 태그는 **여러 키를 동일한 해시 슬롯에 배정**하기 위한 예외 규칙입니다.
- Redis Cluster에서 멀티 키(multi-key) 연산을 구현하는 데 사용됩니다. (관련 문서: [MGET - 부록: 멀티 키 연산](../Commands/MGET/MGET.md))

### 3.2 규칙

키에 `{...}` 패턴이 있으면 `{`와 `}` 사이의 부분 문자열만 해싱해서 슬롯을 계산합니다. `{`나 `}`가 여러 번 나올 수 있으므로 알고리즘은 다음과 같이 명확히 정의됩니다.

1. 키에 `{` 문자가 포함되어 있다.
2. 그 `{`의 오른쪽에 `}` 문자가 있다.
3. 첫 번째 `{`와 첫 번째 `}` 사이에 하나 이상의 문자가 있다.

위 세 조건을 모두 만족하면, 키 전체가 아니라 **첫 번째 `{`와 그 다음 첫 번째 `}` 사이의 부분 문자열만** 해싱합니다.

### 3.3 예시

| 키 | 실제로 해싱되는 부분 | 설명 |
|---|---|---|
| `{user1000}.following`, `{user1000}.followers` | `user1000` | 두 키 모두 `user1000`만 해싱되어 **같은 슬롯**에 배정됨 |
| `foo{}{bar}` | `foo{}{bar}` (키 전체) | 첫 `{` 바로 뒤에 `}`가 와서 그 사이에 문자가 없음 → 조건 3 불만족, 키 전체를 해싱 |
| `foo{{bar}}zap` | `{bar` | 첫 `{`와 그 오른쪽의 첫 `}` 사이 문자열 |
| `foo{bar}{zap}` | `bar` | 처음으로 유효하게(또는 무효하게) 매칭되는 `{`, `}` 쌍에서 알고리즘이 멈춤 |

:::info[바이너리 키 이름]

위 알고리즘에 따르면 키가 `{}`로 시작하면 항상 **키 전체**가 해싱됩니다. 이는 바이너리 데이터를 키 이름으로 사용할 때 유용합니다.

:::

### 3.4 Glob 스타일 패턴 최적화

- `KEYS`, `SCAN`, `SORT`처럼 glob 스타일 패턴을 받는 명령어는, 패턴이 **단일 슬롯만을 의미하는 경우** 최적화됩니다.
- 패턴에 매칭될 수 있는 모든 키가 특정 슬롯에만 속한다는 것이 보장되면, 그 슬롯만 검색합니다.
- 이 최적화는 **Redis 8.0**에서 도입되었습니다.

최적화가 적용되는 조건:

- 패턴에 해시 태그가 포함되어 있고
- 해시 태그 앞에 와일드카드나 이스케이프 문자가 없고
- 중괄호 안의 해시 태그 자체에도 와일드카드나 이스케이프 문자가 없을 것

```bash
# 해시 태그를 인식해서 abc가 속한 슬롯만 스캔
SCAN 0 MATCH {abc}*

# 아래 패턴들은 해시 태그를 인식하지 못해 모든 슬롯을 스캔
SCAN 0 MATCH *{abc}
SCAN 0 MATCH {a*c}
SCAN 0 MATCH {a\*bc}
```

### 3.5 해시 태그를 반영한 HASH_SLOT 구현

해시 태그 예외를 반영한 `HASH_SLOT` 함수의 Ruby, C 구현 예시입니다.

**Ruby**

```ruby
def HASH_SLOT(key)
    s = key.index "{"
    if s
        e = key.index "}",s+1
        if e && e != s+1
            key = key[s+1..e-1]
        end
    end
    crc16(key) % 16384
end
```

**C**

```c
unsigned int HASH_SLOT(char *key, int keylen) {
    int s, e; /* start-end indexes of { and } */

    /* Search the first occurrence of '{'. */
    for (s = 0; s < keylen; s++)
        if (key[s] == '{') break;

    /* No '{' ? Hash the whole key. This is the base case. */
    if (s == keylen) return crc16(key,keylen) & 16383;

    /* '{' found? Check if we have the corresponding '}'. */
    for (e = s+1; e < keylen; e++)
        if (key[e] == '}') break;

    /* No '}' or nothing between {} ? Hash the whole key. */
    if (e == keylen || e == s+1) return crc16(key,keylen) & 16383;

    /* If we are here there is both a { and a } on its right. Hash
     * what is in the middle between { and }. */
    return crc16(key+s+1,e-s-1) & 16383;
}
```

- 두 구현 모두 로직은 동일합니다: `{`를 찾고 → 그 오른쪽에서 `}`를 찾고 → 둘 사이에 문자가 있으면 그 부분만, 아니면 키 전체를 `crc16`에 넣어 슬롯을 계산합니다.
- C 구현에서 `& 16383`은 `mod 16384`와 동일한 결과를 내는 비트 연산입니다 (16384 = 2^14이기 때문).

## 4. MGET과의 관계

- 이 문서의 슬롯/해시 태그 개념은 [MGET 문서의 멀티 키 연산 부록](../Commands/MGET/MGET.md#7-부록-멀티-키multi-key-연산)에서 설명한 **single-slot / cross-slot** 동작 방식의 근거가 되는 내용입니다.
- 예를 들어 클러스터에서 `MGET`이 single-slot 제약을 갖는 구성이라면, 서로 다른 이름의 키라도 해시 태그(`{tag}`)를 붙여 강제로 같은 슬롯에 배정함으로써 `CROSSSLOT` 에러를 피할 수 있습니다.

## 참고

- [Redis Cluster Specification - Key distribution model](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/#key-distribution-model)
- [Redis Cluster Specification - Hash tags](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/#hash-tags)
- [Redis Cluster Specification - Appendix A](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/#appendix-a-crc16-reference-implementation-in-ansi-c)
- [Redis Cluster](../Redis-Cluster/Redis-Cluster.md)
- [MGET](../Commands/MGET/MGET.md)
