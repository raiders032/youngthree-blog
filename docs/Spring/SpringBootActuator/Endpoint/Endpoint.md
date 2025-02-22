---
title: "SpringBootActuator Endpoints 완벽 가이드"
description: "Spring Boot Actuator의 핵심 기능인 엔드포인트들의 특징과 활용 방법을 알아봅니다. 운영 환경에서 애플리케이션 모니터링과 관리에 필수적인 엔드포인트들을 자세히 설명합니다."
tags: [ "SPRING_BOOT", "ACTUATOR", "MONITORING", "BACKEND", "JAVA", "WEB" ]
keywords: [ "스프링부트", "액추에이터", "엔드포인트", "모니터링", "spring boot", "actuator", "endpoints", "monitoring", "운영", "관리", "매트릭스", "로깅" ]
draft: false
hide_title: true
---

## 1. Actuator Endpoints 소개

- Spring Boot Actuator의 엔드포인트는 애플리케이션을 모니터링하고 상호작용할 수 있게 해주는 핵심 기능입니다. 
- 각 엔드포인트는 특정한 모니터링 또는 관리 기능을 제공하며, HTTP 또는 JMX를 통해 접근할 수 있습니다.

## 2. 주요 엔드포인트 목록

### 2.1 핵심 엔드포인트

- **health (`/actuator/health`)**
	- 애플리케이션의 건강 상태 정보 제공
	- 데이터베이스 연결, 디스크 공간 등 주요 시스템 상태 확인
	- 쿠버네티스 같은 컨테이너 환경의 라이브니스/레디니스 프로브로 활용
- **info (`/actuator/info`)**
	- 애플리케이션의 기본 정보 제공
	- Git 정보, 빌드 정보, 환경 정보 등 포함
	- 커스텀 정보 추가 가능
- **metrics (`/actuator/metrics`)**
	- 애플리케이션의 각종 메트릭 정보 제공
	- JVM 메모리 사용량, CPU 사용량, HTTP 요청 통계 등
	- Micrometer 통합으로 다양한 모니터링 시스템 지원

### 2.2 관리 및 모니터링 엔드포인트

- **beans (`/actuator/beans`)**
	- 스프링 컨테이너에 등록된 모든 빈 목록 제공
	- 빈의 타입, 의존성 관계 등 상세 정보 포함
- **conditions (`/actuator/conditions`)**
	- 자동 구성 조건 평가 결과 제공
	- 특정 빈이나 설정이 활성화/비활성화된 이유 파악 가능
- **configprops (`/actuator/configprops`)**
	- `@ConfigurationProperties` 설정 정보 조회
	- 현재 적용된 설정값 확인 가능

### 2.3 로깅 및 디버깅 엔드포인트

- **loggers (`/actuator/loggers`)**
	- 로깅 레벨 조회 및 실시간 변경 기능
	- 패키지/클래스별 로그 레벨 동적 제어
- **threaddump (`/actuator/threaddump`)**
	- 스레드 덤프 정보 제공
	- 데드락, 병목 현상 등 문제 분석에 활용
- **heapdump (`/actuator/heapdump`)**
	- JVM 힙 덤프 파일 생성
	- 메모리 누수 분석에 활용

## 3. 엔드포인트 보안 설정

### 3.1 기본 보안 정책

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info  # 기본적으로 health와 info만 공개
```

### 3.2 Spring Security 통합

```java
@Configuration
public class ActuatorSecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.requestMatcher(EndpointRequest.toAnyEndpoint())
            .authorizeRequests()
            .requestMatchers(EndpointRequest.to("health", "info")).permitAll()
            .anyRequest().hasRole("ACTUATOR_ADMIN");
        return http.build();
    }
}
```

## 4. 엔드포인트 커스터마이징

### 4.1 Health 엔드포인트 커스터마이징

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        try {
            // 건강 검사 로직
            return Health.up()
                       .withDetail("customCheck", "OK")
                       .build();
        } catch (Exception e) {
            return Health.down()
                       .withException(e)
                       .build();
        }
    }
}
```

### 4.2 Info 엔드포인트 커스터마이징

```yaml
info:
  app:
    name: @project.name@
    version: @project.version@
    description: @project.description@
```

## 5. 모범 사례 및 주의사항

### 5.1 운영 환경 설정

- 필요한 엔드포인트만 선택적으로 노출
- 보안에 민감한 엔드포인트는 적절한 인증/인가 설정
- 메트릭 수집 주기와 보관 기간 최적화

### 5.2 모니터링 전략

- 핵심 메트릭 식별 및 알람 설정
- 분산 환경에서의 통합 모니터링 구성
- 로그 레벨 관리 전략 수립

## 6. 정리

- Spring Boot Actuator의 엔드포인트는 운영 환경에서 애플리케이션을 효과적으로 모니터링하고 관리할 수 있게 해주는 강력한 도구입니다. 
- 보안을 고려한 적절한 설정과 함께 활용하면 안정적인 운영에 큰 도움이 될 수 있습니다.