---
title: "Micrometer로 시작하는 애플리케이션 메트릭 수집"
description: "Micrometer를 사용하여 JVM 기반 애플리케이션의 메트릭을 수집하는 방법을 알아봅니다. 기본 개념부터 실제 활용까지 상세히 설명합니다."
tags: [ "MICROMETER", "MONITORING", "METRICS", "SPRING_BOOT", "JAVA", "BACKEND" ]
keywords: [ "마이크로미터", "모니터링", "메트릭", "스프링 부트", "자바", "메트릭 수집", "성능 측정", "애플리케이션 모니터링" ]
draft: false
hide_title: true
---

## 1. Micrometer 소개

- Micrometer는 JVM 기반 애플리케이션을 위한 메트릭 계측 라이브러리입니다.
- 가장 인기 있는 모니터링 시스템들의 계측 클라이언트들에 대한 간단한 파사드(facade)를 제공하여, 벤더 종속 없이 JVM 기반 애플리케이션 코드에 계측을 추가할 수 있게 해줍니다.
- 메트릭 수집 작업에 최소한의 오버헤드만 추가하면서 메트릭의 이식성을 최대화하도록 설계되었습니다.

### 1.1 의존성

- `micrometer-core` 모듈은 최소한의 의존성만을 갖습니다.
- 일시 중지 감지(pause detection) 기능 사용 시 LatencyUtils 의존성이 필요합니다.
- 클라이언트 측 백분위수 사용 시 HdrHistogram이 필요합니다.

## 2. 주요 특징

### 2.1 일반적 특징

- 벤더 중립적인 메트릭 파사드
- 다양한 모니터링 시스템 지원 (Prometheus, Graphite, DataDog 등)
- 차원 기반의 메트릭 수집
- 풍부한 메트릭 타입 제공

### 2.2 지원하는 모니터링 시스템

- Micrometer는 크게 세 부분으로 구성됩니다.
	- 계측 SPI가 포함된 코어 모듈(모든 모니터링 시스템에 공통적인 인터페이스)
	- 다양한 모니터링 시스템용 구현체가 포함된 모듈들(각각을 레지스트리라고 함)
	- 테스트 킷
- 이러한 구조 덕분에 이러한 구조 덕분에 개발자는 코어 모듈의 API만 사용하면 되고, 실제로 어떤 모니터링 시스템을 사용할지는 나중에 선택할 수 있습니다.

:::info[SPI(Service Provider Interface)]

SPI(Service Provider Interface)는 서비스 제공자가 구현하고자 하는 인터페이스를 정의한 API의 집합입니다. 쉽게 말하면, 특정 서비스를 구현할 때 지켜야 하는 규약이나 약속을 의미합니다.
Micrometer의 경우를 예로 들면:

Micrometer는 메트릭을 수집하는 인터페이스(SPI)를 정의합니다.
각 모니터링 시스템(Prometheus, Graphite 등)은 이 인터페이스를 구현합니다.
덕분에 개발자는 하나의 API만 사용하면 되고, 여러 모니터링 시스템을 쉽게 바꿔가며 사용할 수 있습니다.
:::

#### 차원성(Dimensionality)

메트릭 이름에 태그 키/값 쌍을 추가할 수 있는지에 대한 특성입니다.

**차원적 시스템**:

- 태그 키/값 쌍으로 메트릭을 풍부하게 만들 수 있음
- 지원 시스템: AppOptics, Atlas, Azure Monitor, Cloudwatch, Datadog, Datadog StatsD, Dynatrace, Elastic, Humio, Influx,
  KairosDB, New Relic, Prometheus, SignalFx, Sysdig StatsD, Telegraf StatsD, Wavefront

**계층적 시스템**:

- 단순한 평면 메트릭 이름만 지원
- Micrometer는 태그 키/값 쌍을 평면화하여 이름에 추가
- 지원 시스템: Graphite, Ganglia, JMX, Etsy StatsD

#### 비율 집계(Rate Aggregation)

지정된 시간 간격 동안의 샘플 집합 집계 방식에 대한 특성입니다.

**클라이언트 측 집계**:

- 애플리케이션에서 이산 샘플(예: 카운트)을 비율로 변환하여 전송
- 지원 시스템: AppOptics, Atlas, Azure Monitor, Datadog, Dynatrace, Elastic, Graphite, Ganglia, Humio, Influx, JMX, Kairos,
  New Relic, 모든 StatsD 변종들, SignalFx

**서버 측 집계**:

- 누적 값을 서버에서 집계
- 지원 시스템: Prometheus, Wavefront

#### 게시(Publishing)

메트릭 데이터 전송 방식에 대한 특성입니다.

**클라이언트 푸시 방식**:

- 애플리케이션이 정기적인 간격으로 메트릭을 시스템에 푸시
- 지원 시스템: AppOptics, Atlas, Azure Monitor, Datadog, Dynatrace, Elastic, Graphite, Ganglia, Humio, Influx, JMX, Kairos,
  New Relic, SignalFx, Wavefront

**서버 폴링 방식**:

- 모니터링 시스템이 애플리케이션으로부터 메트릭을 폴링
- 지원 시스템: Prometheus, 모든 StatsD 변종들

#### 추가 고려사항

- 모니터링 시스템마다 다음과 같은 세부적인 차이가 있습니다:
	- 측정의 기본 단위(특히 시간)에 대한 개념
	- 메트릭의 표준 명명 규칙
	- 기타 시스템별 특수 요구사항
- Micrometer는 이러한 각 시스템의 요구사항에 맞춰 레지스트리별로 메트릭을 자동으로 커스터마이즈합니다.

## 3. Meter와 Registry

### 3.1 Meter

- Meter는 Micrometer의 핵심 인터페이스로, 메트릭 수집을 위한 기본 단위입니다.
- 다양한 Meter 타입이 존재하며, 각각의 용도가 다릅니다:
	- Gauge: 현재 값을 측정 (예: 현재 활성 사용자 수)
	- Timer: 시간 관련 측정 (예: API 응답 시간)
	- Counter: 증가하는 값 측정 (예: 총 요청 수)
- 메트릭 수집은 성능에 큰 영향을 미치지 않도록 설계되어 있습니다.
- 각 Meter는 이름과 태그(차원)로 구분되며, 이를 통해 데이터를 다양한 관점에서 분석할 수 있습니다.

### 3.2 Registry

- Micrometer의 Meter들은 MeterRegistry에서 생성되고 관리됩니다.
- 지원되는 각 모니터링 시스템마다 MeterRegistry의 구현체가 있습니다.
- 레지스트리를 생성하는 방법은 각 구현체마다 다릅니다.

#### SimpleMeterRegistry

- Micrometer는 각 meter의 최신 값을 메모리에 보관하고 데이터를 어디에도 내보내지 않는 SimpleMeterRegistry를 포함합니다.
- 아직 선호하는 모니터링 시스템이 없다면, simple 레지스트리를 사용하여 메트릭 작업을 시작할 수 있습니다

#### Composite Registries

- Micrometer는 여러 레지스트리를 추가할 수 있는 CompositeMeterRegistry를 제공하여 여러 모니터링 시스템에 동시에 메트릭을 게시할 수 있게 합니다

## 4. Counter

- 가장 단순한 메트릭으로, 단순히 숫자를 세는 용도입니다
- 오직 증가만 가능하며, 감소는 불가능합니다
- 예: API 호출 횟수, 에러 발생 횟수 등
- Timer나 DistributionSummary로 측정할 수 있는 것은 카운터로 측정하지 않는 것이 좋습니다
	- Timer와 DistributionSummary는 이미 자체적으로 count를 포함하고 있습니다
- 절대값보다는 "시간당 발생 비율"에 집중하세요
	- 예: "총 1000건의 에러" 보다는 "분당 10건의 에러 발생" 이 더 유용합니다

## 5. Gauge

- 현재 값을 보여주는 측정기입니다
- 시계의 온도계처럼 현재 상태를 보여줍니다
- 증가/감소가 모두 가능합니다
- 주로 사용하는 예:
	- 컬렉션이나 맵의 현재 크기
	- 현재 실행 중인 스레드 수
	- 메모리 사용량
  - CPU 사용률
- 게이지 사용 시 주의사항
	- 자연스러운 상한선이 있는 것을 모니터링할 때 사용하세요
	- 계속 증가하는 값(예: 요청 수)은 게이지로 측정하지 마세요
  - Counter로 측정할 수 있는 것은 게이지로 측정하지 마세요

## 6. Timer

- 짧은 시간 지연(latency)과 이벤트 빈도를 측정하기 위한 도구
- 모든 Timer는 최소한 두 가지를 측정:
  - 총 소요 시간
  - 이벤트 발생 횟수
- 백엔드 시스템에 따라 추가로 측정:
  - 최대값
  - 백분위수
	- 히스토그램
- Timer의 주요 특징
  - 음수 값은 지원하지 않음
  - 너무 긴 시간 측정은 피해야 함 (최대 292.3년)
	- 시간 단위는 모니터링 시스템에 따라 자동 변환됨

### 6.1 Timer 사용 방법

```java
// 기본적인 Timer 생성
Timer timer = Timer
    .builder("my.timer")
    .description("설명")
    .tags("region", "test")
    .register(registry);

// 시간 측정 방법들
timer.record(() -> doSomething());  // 반환값 필요없는 경우
timer.recordCallable(() -> getValue());  // 반환값 필요한 경우

// Timer.Sample 사용
Timer.Sample sample = Timer.start(registry);
Response response = doSomething();
sample.stop(registry.timer("my.timer", 
    "status", response.status()));
```

### 6.2 @Timed 어노테이션 사용

```java
@Configuration
public class TimedConfig {
    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }
}

@Service
public class ExampleService {
    @Timed
    public void someMethod() {
        // 이 메서드의 실행 시간이 자동으로 측정됨
    }

    @Timed
    @Async
    public CompletableFuture<?> asyncMethod() {
        // CompletableFuture가 완료될 때까지의 시간 측정
        return CompletableFuture.supplyAsync(() -> ...);
    }
}
```

- 메서드의 실행 시간을 자동으로 측정하려면 `@Timed` 어노테이션을 사용하세요

```java
@Timed
public void processOrder(@MeterTag("orderId") String id) {
    // orderId 태그가 자동으로 추가됨
}
```

- `@MeterTag` 어노테이션을 사용하여 메서드 파라미터를 태그로 추가할 수 있습니다