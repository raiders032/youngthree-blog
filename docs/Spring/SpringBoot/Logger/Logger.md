---
title: "Spring Boot Actuator Loggers"
description: "Spring Boot Actuator의 로깅 기능과 설정 방법을 상세히 알아봅니다. 런타임에서의 로그 레벨 조정과 OpenTelemetry 통합 등 실제 예제와 함께 설명합니다."
tags: [ "SPRING_BOOT", "ACTUATOR", "LOGGING", "OPENTELEMETRY", "BACKEND", "JAVA" ]
keywords: [ "스프링부트", "액추에이터", "로거", "로깅", "spring boot", "actuator", "logger", "logging", "오픈텔레메트리", "opentelemetry", "모니터링", "로그레벨" ]
draft: false
hide_title: true
---

## 1. Actuator Loggers 개요

- Spring Boot Actuator의 Loggers 기능은 애플리케이션의 로그 레벨을 런타임에 확인하고 설정할 수 있게 해주는 강력한 도구입니다.
- 이를 통해 운영 중인 애플리케이션의 로깅 동작을 동적으로 제어할 수 있습니다.

## 2. 로그 레벨

### 2.1 지원하는 로그 레벨

- Actuator는 다음과 같은 로그 레벨을 지원합니다
- `TRACE`: 가장 상세한 로깅 레벨
- `DEBUG`: 디버깅을 위한 상세 정보
- `INFO`: 일반적인 정보성 메시지
- `WARN`: 경고성 메시지
- `ERROR`: 오류 메시지
- `FATAL`: 치명적인 오류 메시지
- `OFF`: 로깅 비활성화
- `null`: 명시적 설정 없음 (기본 설정 사용)

### 2.2 로그 레벨 구성

- 명시적 구성 레벨: 직접 설정한 로그 레벨
- 유효 로그 레벨: 로깅 프레임워크에 의해 적용된 실제 로그 레벨

## 3. 로거 설정 방법

### 3.1 로거 조회

- `/actuator/loggers` 엔드포인트를 통해 전체 로거 목록 조회
- `/actuator/loggers/{로거-이름}` 으로 특정 로거의 설정 확인

### 3.2 로그 레벨 변경

```json
{
  "configuredLevel": "DEBUG"
}
```

- 특정 로거의 레벨을 변경하려면 해당 로거의 URI로 POST 요청을 보냅니다:

```json
{
  "configuredLevel": null
}
```

- 로거의 레벨을 기본값으로 되돌리려면 `null`을 설정합니다

## 4. OpenTelemetry 통합

- OpenTelemetry(OTel)는 원격 측정 데이터를 생성, 수집 및 내보내기 위한 오픈 소스 관찰 가능성 프레임워크입니다.
- Cloud Native Computing Foundation(CNCF)에서 관리하며, 다음과 같은 주요 기능을 제공합니다.
	- 통합된 데이터 모델: OpenTelemetry는 트레이스, 메트릭 및 로그를 포함한 다양한 원격 측정 데이터를 표준화된 형식으로 처리합니다.
	- 벤더 중립성: OTel은 특정 벤더에 구애받지 않으며, 다양한 백엔드 시스템(예: Jaeger, Prometheus)으로 데이터를 전송할 수 있는 유연성을 제공합니다.
	- 자동 계측 지원: OpenTelemetry는 코드에 최소한의 변경으로 자동 계측을 지원하여 개발자가 쉽게 원격 측정 데이터를 수집할 수 있도록 돕습니다.
	- Collector: OpenTelemetry Collector는 원격 측정 데이터를 수신하고 처리하여 원하는 백엔드로 내보내는 역할을 합니다.
- Micrometer와 비교
	- Micrometer는 자바 애플리케이션의 메트릭을 측정하는 도구
	- OpenTelemetry는 이런 메트릭들을 포함해서 더 넓은 범위의 모니터링 데이터를 수집하고 표준화하는 도구

### 4.1 기본 설정

- OpenTelemetry 로깅은 기본적으로 비활성화되어 있습니다.
- 활성화하려면 엔드포인트 설정이 필요합니다:

```properties
management.otlp.logging.endpoint=https://otlp.example.com:4318/v1/logs
```

### 4.2 로깅 애펜더 설정

- OpenTelemetry 로깅을 위해서는 `logback-spring.xml` 또는 `log4j2-spring.xml`에 추가 설정이 필요합니다.

### 4.3 OpenTelemetry 인스턴스 초기화

- 애플리케이션 시작 시 OpenTelemetry 인스턴스를 프로그래밍 방식으로 설정해야 합니다:

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.instrumentation.logback.appender.v1_0.OpenTelemetryAppender;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Component;

@Component
class OpenTelemetryAppenderInitializer implements InitializingBean {
    private final OpenTelemetry openTelemetry;

    OpenTelemetryAppenderInitializer(OpenTelemetry openTelemetry) {
        this.openTelemetry = openTelemetry;
    }

    @Override
    public void afterPropertiesSet() {
        OpenTelemetryAppender.install(this.openTelemetry);
    }
}
```

## 5. 모범 사례

### 5.1 로그 레벨 관리

- 프로덕션 환경에서는 기본적으로 INFO 레벨 사용
- 문제 해결 시에만 일시적으로 DEBUG 또는 TRACE 레벨로 조정
- 변경 후 원래 레벨로 복구하는 것을 잊지 않기

### 5.2 보안 고려사항

- 로거 엔드포인트에 대한 접근 제한 설정
- 로그 레벨 변경 권한을 가진 사용자 관리
- 민감한 정보가 로그에 노출되지 않도록 주의

## 6. 마치며

- Actuator의 Loggers 기능을 활용하면 운영 중인 애플리케이션의 로깅을 효과적으로 관리할 수 있습니다.
- 특히 문제 해결 과정에서 로그 레벨을 동적으로 조정할 수 있는 기능은 매우 유용합니다.
- OpenTelemetry와의 통합을 통해 더욱 강력한 관찰성을 확보할 수 있습니다.