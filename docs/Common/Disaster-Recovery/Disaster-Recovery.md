---
title: "Disaster Recovery"
description: "기업의 비즈니스 연속성을 보장하는 다양한 재해 복구(DR) 전략을 알아봅니다. 백업 및 복원부터 핫 스탠바이까지 각 전략의 장단점과 RTO, RPO 개념을 중심으로 최적의 DR 전략 선택 방법을 설명합니다."
tags: ["DISASTER_RECOVERY", "BUSINESS_CONTINUITY", "CLOUD", "SYSTEM_DESIGN", "INFRASTRUCTURE", "DEVOPS"]
keywords: ["재해 복구", "disaster recovery", "DR", "비즈니스 연속성", "business continuity", "백업 복원", "backup restore", "파일럿 라이트", "pilot light", "웜 스탠바이", "warm standby", "핫 스탠바이", "hot standby", "활성-활성", "active-active", "RTO", "RPO", "복구 시간 목표", "복구 시점 목표", "클라우드 재해 복구", "고가용성", "가용성"]
draft: false
hide_title: true
---

## 1. 재해 복구 전략

- 재해 복구(Disaster Recovery, DR) 전략은 시스템, 데이터 및 애플리케이션을 재해 발생 시 빠르게 복구하고 정상 운영을 재개할 수 있도록 계획하는 것을 의미합니다.
- DR 전략은 기업의 비즈니스 연속성을 보장하고, 데이터 손실을 최소화하며, 다운타임을 줄이는 데 중요한 역할을 합니다.

## 2. 재해 복구 전략의 유형

### 2.1 백업 및 복원(Backup and Restore)

- 데이터를 주기적으로 백업하고, 재해 발생 시 이 백업 데이터를 복원하는 방식입니다.
- 장점
	- 비용 효율적이며 설정이 간단합니다.
- 단점
	- 복원 시간이 오래 걸릴 수 있으며, 최신 데이터 손실이 발생할 수 있습니다.
- 사용 사례
	- 중소규모 기업이나 복구 시간이 크게 중요하지 않은 시스템에 적합합니다.

:::info
백업 및 복원 전략은 가장 기본적이고 널리 사용되는 DR 전략이지만, 복구 시간이 길다는 점을 고려해야 합니다.
:::

### 2.2 파일럿 라이트(Pilot Light)

- 재해 복구를 위해 최소한의 인프라를 미리 구성해두고, 재해 발생 시 전체 시스템으로 확장하는 방식입니다.
- 장점
	- 비용 효율적이며, 빠른 확장이 가능합니다.
- 단점
	- 전체 시스템으로 확장하는 데 시간이 걸릴 수 있습니다.
- 사용 사례
	- 예산이 제한적이지만 빠른 복구가 필요한 경우에 적합합니다.

### 2.3 웜 스탠바이(Warm Standby)

- 주 시스템의 축소 버전을 항상 실행 상태로 유지하다가, 재해 발생 시 전체 시스템으로 전환하는 방식입니다.
- 장점
	- 빠른 전환이 가능하며, 복구 시간이 짧습니다.
- 단점
	- 지속적인 리소스 유지 비용이 발생합니다.
- 사용 사례
	- 높은 가용성과 빠른 복구가 필수적인 시스템에 적합합니다.

### 2.4 핫 스탠바이(Hot Standby) / 멀티 사이트 활성-활성(Active-Active)

- 두 개 이상의 활성 시스템을 각각 다른 지역에 배치하여, 하나의 시스템이 장애가 발생해도 다른 시스템이 즉시 서비스를 제공할 수 있도록 하는 방식입니다.
- 장점
	- 거의 즉시 복구가 가능하며, 중단 시간이 거의 없습니다.
- 단점
	- 높은 비용이 발생하며, 복잡한 설정과 관리가 필요합니다.
- 사용 사례
	- 금융, 의료, 통신 등 매우 높은 가용성과 신뢰성이 요구되는 시스템에 적합합니다.

:::tip
기업의 예산과 비즈니스 요구사항에 따라 적절한 전략을 선택하는 것이 중요합니다. 특히 중요한 시스템의 경우 웜 스탠바이나 핫 스탠바이 방식을 고려해보세요.
:::

## 3. 재해 복구 전략의 주요 요소

### 3.1 복구 시간 목표 (Recovery Time Objective, RTO)

- 재해 발생 후 시스템이나 애플리케이션이 복구되기까지 걸리는 최대 허용 시간입니다.
- 비즈니스 요구에 따라 RTO가 결정되며, 짧을수록 더 빠른 복구가 필요합니다.

### 3.2 복구 시점 목표 (Recovery Point Objective, RPO)

- 재해 발생 시 복구할 수 있는 데이터의 최신 시점으로, 데이터 손실을 감수할 수 있는 최대 허용 시간입니다.
- 비즈니스 연속성과 데이터의 중요도에 따라 RPO가 결정되며, 짧을수록 더 빈번한 백업이 필요합니다.

:::warning
RTO와 RPO는 재해 복구 계획의 핵심 지표입니다. 각 시스템과 애플리케이션별로 적절한 RTO와 RPO를 설정하고, 이에 맞는 재해 복구 전략을 수립해야 합니다.
:::

## 4. 재해 복구 전략 선택 시 고려사항

- 비즈니스 요구사항: 서비스 중단이 비즈니스에 미치는 영향 평가
- 비용: 각 전략별 구현 및 유지보수 비용 분석
- 기술적 복잡성: 조직의 기술적 역량과 리소스 고려
- 규제 및 컴플라이언스 요구사항: 업종별 데이터 보호 및 가용성 관련 법규 준수
- 확장성: 비즈니스 성장에 따른 DR 전략의 확장 가능성

## 5. 클라우드 기반 재해 복구

- 클라우드 서비스는 유연하고 비용 효율적인 재해 복구 솔루션을 제공합니다.
- AWS, Azure, Google Cloud와 같은 주요 클라우드 제공업체는 다양한 재해 복구 옵션을 제공합니다.
- 클라우드 기반 DR의 장점:
	- 온디맨드 리소스 활용으로 비용 최적화
	- 글로벌 인프라를 통한 지리적 이중화
	- 자동화된 백업 및 복구 프로세스
	- 빠른 구축 및 테스트 가능성

:::info
재해 복구 전략은 정기적인 테스트와 검증이 필수적입니다. 실제 재해 상황에서 계획대로 작동하는지 확인하기 위해 DR 훈련을 주기적으로 실시하세요.
:::