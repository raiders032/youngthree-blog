---
title: "Spring Cloud Config"
description: "Spring Cloud Config의 기본 개념부터 실전 활용, Kubernetes ConfigMap과의 비교까지 상세히 알아봅니다. 설정 파일 관리와 동적 설정 변경을 위한 최적의 선택을 도와드립니다."
tags: ["SPRING_CLOUD_CONFIG", "SPRING_CLOUD", "KUBERNETES", "CONFIGMAP", "SPRING", "DEVOPS", "BACKEND"]
keywords: ["스프링 클라우드 컨피그", "spring cloud config", "컨피그맵", "configmap", "설정 관리", "Configuration management", "스프링", "spring", "쿠버네티스", "kubernetes"]
draft: false
hide_title: true
---

## 1. Spring Cloud Config 개요
- Spring Cloud Config는 분산 시스템에서 설정을 외부화하고 중앙에서 관리하기 위한 솔루션입니다. 
- 모든 환경(개발, 테스트, 운영)의 설정을 한 곳에서 관리하고, 애플리케이션의 재시작 없이 설정을 변경할 수 있습니다.

### 1.1 주요 특징
- Git 저장소를 백엔드로 사용하여 설정의 버전 관리 가능
- 설정 변경 시 실시간 반영 지원
- 암호화/복호화 기능 내장
- REST API 제공
- 다양한 형식(YAML, Properties, JSON) 지원

## 2. 구성 요소

### 2.1 Config Server
- Config Server는 설정을 제공하는 서버로, 다음과 같이 구성합니다:

```java
@SpringBootApplication
@EnableConfigServer
public class ConfigServer {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServer.class, args);
    }
}
```

**서버 설정**
```yaml
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/myorg/config-repo
          search-paths: configs
          default-label: main
```

### 2.2 Config Client
- 각 마이크로서비스는 Config Client가 되어 설정을 가져옵니다

```yaml
spring:
  application:
    name: my-service
  cloud:
    config:
      uri: http://config-server:8888
      fail-fast: true
```

:::tip
`fail-fast: true`를 설정하면 Config Server에 연결할 수 없을 때 애플리케이션 구동을 실패시킵니다. 설정이 필수적인 경우 권장됩니다.
:::

## 3. 설정 파일 구조
- Git 저장소의 구조는 다음과 같이 구성합니다:

```
config-repo/
├── application.yml          # 공통 설정
├── my-service.yml          # 서비스별 공통 설정
├── my-service-dev.yml      # 개발 환경 설정
└── my-service-prod.yml     # 운영 환경 설정
```

우선순위는 다음과 같습니다:
1. `my-service-{profile}.yml`
2. `my-service.yml`
3. `application-{profile}.yml`
4. `application.yml`

## 4. 동적 설정 갱신

### 4.1 서버 측 설정

```yaml
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/myorg/config-repo
          force-pull: true
```

### 4.2 클라이언트 측 설정

```java
@RefreshScope
@RestController
public class ApiController {
    @Value("${my.property}")
    private String myProperty;
    
    // ...
}
```

:::info
`@RefreshScope`가 붙은 빈은 설정이 갱신될 때 재생성됩니다.
:::

## 5. 보안 설정

### 5.1 암호화 설정

```yaml
encrypt:
  key: my-secret-key
```

암호화된 값 사용:
```yaml
spring:
  datasource:
    password: '{cipher}AQA6EN7aXNXrBiIE...'
```

## 6. Kubernetes ConfigMap과의 비교

### 6.1 주요 차이점

특성 | Spring Cloud Config | Kubernetes ConfigMap
-----|---------------------|--------------------
저장소 | Git (버전 관리 가능) | 클러스터 내부 저장
변경 감지 | 자동 (WebHook/폴링) | 수동 또는 도구 필요
이력 관리 | Git 이력 | 별도 이력 없음
암호화 | 내장 기능 | Secret 객체 필요
적용 범위 | 환경 독립적 | k8s 클러스터 한정

### 6.2 선택 기준
- Spring Cloud Config 선택 사례:
  - 멀티 클라우드/하이브리드 환경
  - Git 기반 이력 관리 필요
  - Spring 기반 시스템
- ConfigMap 선택 사례:
  - k8s 단일 환경
  - 단순한 설정 관리
  - 다양한 언어/프레임워크

### 6.3 함께 사용하기
- 실제로는 두 시스템을 목적에 따라 함께 사용하는 경우가 많습니다:

```yaml
# ConfigMap: 인프라 설정
server:
  port: 8080
management:
  endpoints:
    web:
      exposure:
        include: "*"

# Spring Cloud Config: 비즈니스 설정
business:
  feature-toggles:
    new-billing: true
  api:
    external:
      url: https://api.external.com
      key: ${encrypted.api.key}
```

## 7. 운영 시 고려사항

### 7.1 모니터링

- Config Server 상태 모니터링
- 설정 변경 감사 로그
- 클라이언트 연결 상태 확인

### 7.2 장애 대응

1. Config Server 이중화
2. 설정 캐싱 전략
3. 폴백(fallback) 설정 구성

:::warning
운영 환경에서는 반드시 Config Server를 이중화하고, 클라이언트의 캐시 전략을 적절히 설정하세요.
:::

## 8. 결론
- Spring Cloud Config와 Kubernetes ConfigMap은 각각의 장단점이 있습니다. 
- 시스템의 요구사항과 운영 환경을 고려하여 적절히 선택하거나 혼용하는 것이 바람직합니다. 
- 특히 Spring 기반의 마이크로서비스 아키텍처에서는 Spring Cloud Config의 강력한 기능들이 큰 장점이 될 수 있습니다.