---
title: "Redis Pub/Sub"
description: "Redis의 Publish/Subscribe 메시징 시스템을 상세히 알아봅니다. 기본 개념부터 실제 사용법, 패턴 매칭 구독까지 실무에서 바로 활용할 수 있는 내용을 다룹니다."
tags: ["REDIS", "PUBSUB", "MESSAGE_QUEUE", "DATABASE", "BACKEND"]
keywords: ["레디스", "Redis", "펍섭", "pub/sub", "발행구독", "메시지큐", "message queue", "메시징시스템", "messaging system", "데이터베이스", "database"]
draft: false
hide_title: true
---

## 1. Redis Pub/Sub 개요
- Redis의 Pub/Sub(Publish/Subscribe) 시스템은 메시지 브로커링을 구현한 기능으로, 발행자와 구독자 간의 효율적인 메시지 전달을 지원합니다.
- 이 시스템의 핵심은 발행자와 구독자가 서로를 알 필요 없이 메시지를 주고받을 수 있다는 점입니다.

### 1.1 핵심 특징
- 발행자는 특정 채널에 메시지를 발행
- 구독자는 관심 있는 채널을 구독하여 메시지 수신
- 발행자와 구독자 간의 완전한 디커플링
- 확장성이 뛰어난 네트워크 토폴로지 구성 가능

## 2. 기본 명령어

### 2.1 구독 관련 명령어

#### SUBSCRIBE 명령어
```bash
SUBSCRIBE channel1 channel2
```
하나 이상의 채널을 구독할 수 있습니다. 구독 후에는 해당 채널로 전송되는 모든 메시지를 수신합니다.

#### UNSUBSCRIBE 명령어
```bash
UNSUBSCRIBE channel1
```
특정 채널의 구독을 취소합니다. 인자 없이 사용하면 모든 채널의 구독이 취소됩니다.

### 2.2 발행 관련 명령어

#### PUBLISH 명령어
```bash
PUBLISH channel1 "Hello World"
```
지정된 채널에 메시지를 발행합니다. 해당 채널을 구독 중인 모든 클라이언트가 이 메시지를 수신합니다.

## 3. 메시지 전달 특성

### 3.1 At-most-once 전달 방식

Redis Pub/Sub는 at-most-once 메시지 전달 방식을 사용합니다. 이는 다음을 의미합니다:

- 메시지는 최대 한 번만 전달됨
- 서버가 메시지를 보낸 후에는 재전송되지 않음
- 네트워크 문제 등으로 메시지가 손실되면 복구 불가능

:::warning
중요한 메시지의 경우, Redis Streams를 사용하여 더 강력한 전달 보장을 받을 수 있습니다.
:::

### 3.2 데이터베이스 범위

Pub/Sub 시스템은 Redis의 키 스페이스와 완전히 독립적으로 동작합니다:

- 데이터베이스 번호와 무관하게 작동
- DB 10에서 발행된 메시지는 DB 1의 구독자도 수신 가능
- 환경 분리가 필요한 경우 채널 이름에 접두어 사용 권장 (예: "prod:", "dev:")

## 4. 패턴 매칭 구독

### 4.1 기본 사용법

글로브 스타일 패턴을 사용하여 여러 채널을 한 번에 구독할 수 있습니다:

```bash
PSUBSCRIBE news.*
```

이 명령으로 다음과 같은 모든 채널의 메시지를 수신할 수 있습니다:
- news.tech
- news.sports
- news.weather

### 4.2 주의사항

:::info
하나의 메시지가 여러 패턴과 일치하는 경우, 구독자는 같은 메시지를 여러 번 받을 수 있습니다.
:::

## 5. 실무 적용 팁

### 5.1 사용 적합 사례

- 실시간 알림 시스템
- 채팅 애플리케이션
- 실시간 모니터링 시스템
- 이벤트 기반 아키텍처

### 5.2 구현 시 고려사항

- 메시지 손실 허용 여부 검토
- 패턴 구독 시 중복 수신 고려
- 클라이언트 라이브러리의 재연결 정책 설정
- 채널 명명 규칙 수립

## 6. Redis 7.0의 Sharded Pub/Sub

Redis 7.0부터는 클러스터 환경에서 더 효율적인 Pub/Sub을 위한 Sharded Pub/Sub이 도입되었습니다:

- 채널이 슬롯에 할당되어 관리됨
- 클러스터 내 제한된 범위로 메시지 전파
- 수평적 확장성 개선
- SSUBSCRIBE, SUNSUBSCRIBE, SPUBLISH 명령어 사용

:::tip
대규모 시스템에서는 Sharded Pub/Sub을 통해 더 나은 성능을 얻을 수 있습니다.
:::