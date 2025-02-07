---
title: "Spring Boot Actuator"
description: "Spring Boot Actuator의 주요 기능과 활용 방법을 상세히 알아봅니다. 운영 환경에서 필수적인 모니터링과 관리 기능들을 실제 예제와 함께 설명합니다."
tags: [ "SPRING_BOOT", "ACTUATOR", "MONITORING", "BACKEND", "JAVA" ]
keywords: [ "스프링부트", "액추에이터", "spring boot", "actuator", "모니터링", "운영", "관리", "엔드포인트", "매트릭스", "로깅" ]
draft: false
hide_title: true
---

## 1. Spring Boot Actuator란?

- Spring Boot Actuator는 운영 환경에서 애플리케이션을 모니터링하고 관리하기 위한 다양한 기능을 제공하는 Spring Boot의 하위 프로젝트입니다.
- 개발자와 운영자가 애플리케이션의 상태를 실시간으로 파악하고 관리할 수 있도록 도와주는 필수적인 도구입니다.

## 2. 주요 기능 개요

### 2.1 엔드포인트 (Endpoints)

- 애플리케이션의 상태와 정보를 확인할 수 있는 다양한 기능 제공
- health, metrics, info 등 다양한 내장 엔드포인트 제공
- 커스텀 엔드포인트 구현 가능
- 각 엔드포인트는 HTTP 또는 JMX를 통해 접근 가능
	- 예시 health: 애플리케이션 건강 상태 확인
	- HTTP: `/actuator/health`
	- JMX: `org.springframework.boot:type=Endpoint,name=Health`
- [자세한 내용은 Endpoint 참고](Endpoint/Endpoint.md)

### 2.2 HTTP 모니터링

- `/actuator` 기본 경로로 모든 엔드포인트 접근 가능
	- 예: `/actuator/health`, `/actuator/metrics`
- RESTful API 형태로 데이터 제공
- 웹 브라우저나 HTTP 클라이언트로 손쉽게 접근

### 2.3 JMX 모니터링

- 모든 엔드포인트를 JMX MBeans 형태로도 제공
- JConsole, VisualVM 등 Java 모니터링 도구로 접근
- 원격에서도 실시간 모니터링 가능
- 기본적으로 활성화되어 있지 않으므로 별도 설정 필요
	- `spring.jmx.enabled=true` 설정으로 활성화 필요

### 2.4 관찰성 (Observability)

- Spring Boot Actuator는 애플리케이션의 관찰성을 위한 핵심 기능을 제공합니다
- 로깅, 메트릭스, 트레이스의 세 가지 핵심 요소를 통합 제공
- Micrometer를 통한 통합된 관찰성 API 제공
- 각 요소는 Actuator 엔드포인트를 통해 외부에서 접근 가능
	- 메트릭스: `/actuator/metrics`
	- 로깅: `/actuator/loggers`
	- 트레이스: Zipkin, Jaeger 등과 연동
- OpenTelemetry 지원으로 표준화된 관찰성 구현
- 실행 중인 애플리케이션의 내부 상태를 상세히 모니터링 가능

### 2.5 로거 (Loggers)

- 런타임에서 로그 레벨 동적 조정
- 로거 설정 확인 및 수정
- 로그 출력 패턴 관리
- [Logger 참고](Logger/Logger.md)

### 2.6 메트릭스 (Metrics)

- 애플리케이션 성능 지표 수집
- JVM 메모리 사용량, GC 활동 등 시스템 메트릭
- 사용자 정의 메트릭 추가 가능

### 2.7 트레이싱 (Tracing)

- 요청 처리 과정의 상세 추적
- 마이크로서비스 환경에서의 분산 추적
- Zipkin, Jaeger 등과의 통합

### 2.8 감사 (Auditing)

- 주요 이벤트 기록 및 추적
- 보안 관련 이벤트 로깅
- 사용자 정의 감사 이벤트 지원

### 2.9 HTTP 교환 기록

- HTTP 요청/응답 내역 기록
- 디버깅 및 문제 해결에 활용
- 성능 분석을 위한 데이터 제공

### 2.10 프로세스 모니터링

- 애플리케이션 프로세스 상태 모니터링
- CPU 사용량, 메모리 사용량 등 확인
- 스레드 덤프 생성 및 분석

### 2.11 Cloud Foundry 지원

- Cloud Foundry 플랫폼과의 통합
- 클라우드 환경에서의 모니터링
- 자동 구성 및 설정 지원

## 3. 활용 시나리오

### 3.1 운영 환경 모니터링

- 실시간 애플리케이션 상태 확인
- 성능 병목 지점 식별
- 문제 상황 조기 발견

### 3.2 장애 대응

- 상세한 시스템 정보 수집
- 로그 레벨 동적 조정
- 트레이스 데이터 분석

### 3.3 성능 최적화

- 메트릭 데이터 기반 성능 분석
- 리소스 사용량 모니터링
- 병목 구간 식별 및 개선

## 4. 보안 고려사항

### 4.1 엔드포인트 보안

- 중요 정보를 포함하는 엔드포인트 보호
- Spring Security와의 통합
- IP 기반 접근 제어

### 4.2 인증 및 권한 설정

- 엔드포인트별 권한 설정
- CORS 설정
- SSL/TLS 적용

## 5. 마치며

- Spring Boot Actuator는 현대적인 Spring Boot 애플리케이션의 운영에 필수적인 도구입니다. 