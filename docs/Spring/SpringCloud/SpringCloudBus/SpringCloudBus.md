---
title: "Spring Cloud Bus"
description: "Spring Cloud Bus를 사용하여 분산 시스템의 구성 정보를 효과적으로 동기화하는 방법을 알아봅니다. AMQP와 Kafka를 활용한 메시지 브로커 설정부터 실제 구현 예제까지 상세히 다룹니다."
tags: ["SPRING_CLOUD_BUS", "SPRING_CLOUD", "SPRING_BOOT", "MICROSERVICES", "RABBITMQ", "KAFKA", "BACKEND", "JAVA"]
keywords: ["스프링 클라우드 버스", "spring cloud bus", "마이크로서비스", "microservices", "스프링 클라우드", "spring cloud", "설정 동기화", "Configuration synchronization", "메시지 브로커", "message broker", "래빗엠큐", "rabbitmq", "카프카", "kafka"]
draft: false
hide_title: true
---

## 1. Spring Cloud Bus 개요
- Spring Cloud Bus는 분산 시스템의 노드들을 경량 메시지 브로커로 연결하여 구성 정보 변경이나 시스템 관리 명령을 효과적으로 전파할 수 있게 해주는 도구입니다. 
- 확장된 Spring Boot 애플리케이션의 분산 액추에이터 역할을 하며, 애플리케이션 간의 통신 채널로도 활용할 수 있습니다.

:::info
Spring Cloud Bus는 AMQP 브로커나 Kafka를 전송 계층으로 사용할 수 있으며, 각각에 대한 스타터 의존성을 제공합니다.
:::

## 2. 시작하기

### 2.1 의존성 설정
- Spring Cloud Bus는 클래스패스에서 자신을 감지하면 자동으로 설정됩니다. 
- 다음 의존성 중 하나를 추가하여 시작할 수 있습니다:
  - AMQP (RabbitMQ) 사용 시: `spring-cloud-starter-bus-amqp`
  - Kafka 사용 시: `spring-cloud-starter-bus-kafka`

### 2.2 메시지 브로커 설정
- 로컬 환경에서는 기본 설정으로 동작하지만, 원격 환경에서는 브로커 접속 정보를 설정해야 합니다.

#### RabbitMQ 설정 예시
```yaml
spring:
  rabbitmq:
    host: mybroker.com
    port: 5672
    username: user
    password: secret
```

## 3. Bus 엔드포인트 활용
- Spring Cloud Bus는 세 가지 주요 엔드포인트를 제공합니다

### 3.1 /actuator/busrefresh
- `RefreshScope` 캐시를 초기화하고 `@ConfigurationProperties`를 다시 바인딩합니다.

:::info
@RefreshScope는 Spring Cloud에서 제공하는 특별한 scope입니다. 이 애노테이션이 붙은 빈은 런타임에 재생성이 가능합니다. 따라서 `/actuator/refresh` 엔드포인트가 호출되면 해당 빈이 새로운 설정값으로 다시 만들어집니다
:::

```properties
# 엔드포인트 활성화
management.endpoints.web.exposure.include=busrefresh
```

### 3.2 /actuator/busenv
- 여러 인스턴스의 환경 변수를 지정된 값으로 변경합니다.

```properties
# 엔드포인트 활성화
management.endpoints.web.exposure.include=busenv
```

#### 사용 예시
```json
{
    "name": "key1",
    "value": "value1"
}
```
- `/actuator/busenv`로 POST 요청을 보내면 모든 인스턴스의 `key1` 환경 변수가 `value1`로 변경됩니다.

### 3.3 /actuator/busshutdown
- 애플리케이션을 정상적으로 종료합니다.

```properties
# 엔드포인트 활성화
management.endpoints.web.exposure.include=busshutdown
```

## 4. 인스턴스 주소 지정

### 4.1 서비스 ID 구성
- 각 인스턴스는 고유한 서비스 ID를 가지며, `spring.cloud.bus.id`로 설정할 수 있습니다. 기본값은 다음 형식을 따릅니다:

```
app:index:id
```
- `app`: `vcap.application.name` 또는 `spring.application.name`
- `index`: 인스턴스 구분을 위한 인덱스
- `id`: 인스턴스 고유 식별자

:::warning
서비스 ID는 반드시 고유해야 합니다. 동일한 ID를 가진 여러 인스턴스가 있으면 이벤트가 처리되지 않을 수 있습니다.
:::

## 5. 이벤트 추적
- 이벤트 추적을 활성화하려면 다음 설정을 추가합니다:

```properties
spring.cloud.bus.trace.enabled=true
```

#### 추적 데이터 예시
```json
{
  "timestamp": "2015-11-26T10:24:44.411+0000",
  "info": {
    "signal": "spring.cloud.bus.ack",
    "type": "RefreshRemoteApplicationEvent",
    "id": "c4d374b7-58ea-4928-a312-31984def293b",
    "origin": "stores:8081",
    "destination": "*:**"
  }
}
```

## 6. 커스텀 이벤트 구현

### 6.1 이벤트 클래스 작성

```java
public class MyEvent extends RemoteApplicationEvent {
    // 이벤트 구현
}
```

### 6.2 이벤트 스캔 설정

```java
@Configuration
@RemoteApplicationEventScan(basePackageClasses = BusConfiguration.class)
public class BusConfiguration {
    // 설정 구현
}
```

:::tip
커스텀 이벤트를 사용할 때는 생산자와 소비자 모두 클래스 정의에 접근할 수 있어야 합니다.
:::

## 7. 주요 설정 속성

| 속성 | 기본값 | 설명 |
|------|--------|------|
| spring.cloud.bus.enabled | true | Bus 활성화 여부 |
| spring.cloud.bus.destination | - | 메시지 목적지 이름 |
| spring.cloud.bus.trace.enabled | false | 이벤트 추적 활성화 여부 |
| spring.cloud.bus.ack.enabled | true | 응답 메시지 활성화 여부 |

## 8. 마치며
- Spring Cloud Bus는 마이크로서비스 아키텍처에서 구성 정보를 효과적으로 동기화할 수 있는 강력한 도구입니다. 
- 메시지 브로커를 통한 이벤트 기반 통신으로 시스템의 일관성을 유지하면서도 유연한 확장이 가능합니다.

:::tip 실무 적용 팁
- 개발 환경에서는 RabbitMQ를, 프로덕션 환경에서는 Kafka를 사용하는 것이 일반적입니다.
- 민감한 설정 정보는 암호화하여 전송하는 것을 권장합니다.
- 이벤트 추적은 디버깅 시에만 활성화하여 성능 영향을 최소화합니다.
:::