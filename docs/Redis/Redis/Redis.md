---
title: "Redis"
description: "Redis(Remote Dictionary Server)의 핵심 개념과 특징을 알아봅니다. 인메모리 데이터 저장소의 장점, 주요 데이터 구조, 일반적인 사용 사례를 통해 Redis의 기본을 이해할 수 있습니다."
tags: ["REDIS", "DATABASE", "CACHE", "NOSQL", "BACKEND", "INFRASTRUCTURE"]
keywords: ["레디스", "redis", "인메모리", "in-memory", "캐시", "cache", "데이터베이스", "database", "노에스큐엘", "nosql", "백엔드", "backend", "키밸류", "key-value", "데이터구조", "data structure"]
draft: false
hide_title: true
sidebar_position: 1
---

## 1. Redis란 무엇인가?
- Redis(Remote Dictionary Server)는 고성능 인메모리 데이터 저장소입니다. 
- 오픈소스로 개발되어 있으며, 다양한 데이터 구조를 지원하는 NoSQL 데이터베이스이자 캐시, 메시지 브로커, 큐로서 활용됩니다.

### 1.1 Redis의 주요 특징
- 인메모리 데이터 저장
    - 모든 데이터를 메모리에 저장하여 초고속 읽기/쓰기 성능 제공
    - 디스크 저장은 선택적으로 가능 (영속성 보장)
- 다양한 데이터 구조 지원
    - Strings, Lists, Sets, Sorted Sets, Hashes 등 기본 제공
    - Bitmaps, HyperLogLog 등 고급 데이터 구조도 지원
    - [데이터 타입 참고](../Data-Type/Data-Type.md)
- 단순하고 직관적인 명령어
    - GET, SET과 같은 간단한 명령어로 데이터 조작
    - 복잡한 쿼리 언어 학습 불필요

## 2. Redis의 핵심 개념


### 2.1 인메모리 저장소
- 인메모리 저장소의 특징과 장단점을 살펴보겠습니다.
- 장점
    - 초고속 데이터 접근 (마이크로초 단위 응답)
    - 예측 가능한 성능 (디스크 I/O 지연 없음)
    - 실시간 애플리케이션에 적합
- 단점
    - 메모리 용량 제한
    - 서버 재시작 시 데이터 손실 가능성
    - 상대적으로 높은 운영 비용

:::tip
Redis는 RDB 스냅샷과 AOF 로그를 통해 데이터 영속성을 보장할 수 있습니다. 중요한 데이터는 적절한 영속성 전략을 선택하세요.
:::

## 3. Redis의 일반적인 사용 사례

### 3.1 캐싱
- Redis의 가장 일반적인 사용 사례는 데이터베이스 캐싱입니다.
- 사용 예시
  - 세션 저장소
  - API 응답 캐싱
  - 데이터베이스 쿼리 결과 캐싱

:::info
캐싱을 통해 데이터베이스 부하를 줄이고 응답 시간을 크게 개선할 수 있습니다.
:::

### 3.2 실시간 분석
- 실시간 카운터, 방문자 추적 등에 활용됩니다.
- 활용 사례
    - 페이지 조회수 집계
    - 실시간 랭킹 시스템
    - 사용자 행동 분석

### 3.3 메시지 브로커
- pub/sub 기능을 통해 메시지 브로커로 활용 가능합니다.
- 사용 예시
  - 실시간 채팅
  - 이벤트 알림 
- [자세한 내용 참고](../Pub-Sub/Pub-Sub.md)

```redis
SUBSCRIBE news
PUBLISH news "Breaking: Redis 7.0 released!"
```