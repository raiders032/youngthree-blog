---
title: "Spring Cloud Netflix"
description: "Spring Cloud Netflix의 핵심 컴포넌트인 Eureka를 중심으로 마이크로서비스 아키텍처의 서비스 디스커버리 구현 방법을 상세히 알아봅니다. Eureka Server 설정부터 Client 구성, 고가용성 확보까지 실무에 필요한 모든 내용을 다룹니다."
tags: ["EUREKA", "SPRING_CLOUD", "MICROSERVICES", "SPRING", "JAVA", "BACKEND", "WEB"]
keywords: ["스프링 클라우드", "spring cloud", "유레카", "eureka", "마이크로서비스", "microservices", "서비스 디스커버리", "service discovery", "스프링", "spring", "넷플릭스", "netflix", "백엔드", "backend"]
draft: false
hide_title: true
---

## 1. Spring Cloud Netflix 소개
- Spring Cloud Netflix는 검증된 Netflix OSS 컴포넌트들을 Spring Boot 애플리케이션에서 쉽게 사용할 수 있게 해주는 통합 프로젝트입니다. 
- 이 프로젝트를 통해 마이크로서비스 아키텍처의 핵심 패턴들을 손쉽게 구현할 수 있습니다.
- 주요 컴포넌트
  - Service Discovery (Eureka)
  - Circuit Breaker (Hystrix)
  - Intelligent Routing (Zuul)
  - Client Side Load Balancing (Ribbon)

## 2. Eureka를 이용한 서비스 디스커버리

### 2.1 서비스 디스커버리란?
- 마이크로서비스 아키텍처에서는 수많은 서비스 인스턴스들이 동적으로 생성되고 제거됩니다. 
- 이러한 환경에서 각 서비스의 위치(호스트, 포트)를 수동으로 관리하는 것은 매우 어렵고 취약한 방식입니다.
- Eureka는 이러한 문제를 해결하기 위한 서비스 디스커버리 솔루션으로, 다음과 같은 특징을 제공합니다:
  - 서비스 등록 및 탐색
  - 상태 모니터링
  - 고가용성을 위한 복제
  - 메타데이터 관리

### 2.2 Eureka 서버 구축하기

#### 2.2.1 의존성 추가

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

#### 2.2.2 서버 애플리케이션 설정

```java
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

#### 2.2.3 설정 파일 (application.yml)

```yaml
server:
  port: 8761

eureka:
  instance:
    hostname: localhost
  client:
    registerWithEureka: false
    fetchRegistry: false
    serviceUrl:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
```

## 3. Eureka 클라이언트 구성

### 3.1 클라이언트 의존성 추가

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

### 3.2 클라이언트 설정

```yaml
spring:
  application:
    name: my-service

eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
```

:::tip
서비스 이름(`spring.application.name`)은 다른 서비스들이 이 서비스를 찾을 때 사용하는 식별자가 됩니다.
:::

## 4. 고가용성 확보

### 4.1 Peer Awareness
- Eureka 서버는 서로를 인식하고 레지스트리 정보를 복제하여 고가용성을 제공할 수 있습니다.

```yaml
---
spring:
  profiles: peer1
eureka:
  instance:
    hostname: peer1
  client:
    serviceUrl:
      defaultZone: https://peer2/eureka/

---
spring:
  profiles: peer2
eureka:
  instance:
    hostname: peer2
  client:
    serviceUrl:
      defaultZone: https://peer1/eureka/
```

### 4.2 Zone 기반 라우팅
- 여러 데이터센터나 가용 영역에 걸쳐 서비스를 배포할 때는 Zone을 활용하여 네트워크 지연을 최소화할 수 있습니다.

```yaml
eureka:
  instance:
    metadataMap:
      zone: zone1
  client:
    preferSameZoneEureka: true
```

## 5. 보안 설정

### 5.1 Spring Security 통합
- Eureka 서버에 보안을 적용하려면 Spring Security를 추가하고 다음과 같이 설정합니다:

```java
@EnableWebSecurity
class WebSecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().ignoringAntMatchers("/eureka/**");
        super.configure(http);
    }
}
```

:::warning
CSRF 보호를 완전히 비활성화하는 것은 권장되지 않습니다. Eureka 엔드포인트에 대해서만 선택적으로 비활성화하세요.
:::

## 6. 운영 시 고려사항

### 6.1 JDK 11 지원
- JDK 11에서는 JAXB 모듈이 제거되었으므로, 다음 의존성을 추가해야 합니다:

```xml
<dependency>
    <groupId>org.glassfish.jaxb</groupId>
    <artifactId>jaxb-runtime</artifactId>
</dependency>
```

### 6.2 클라이언트 갱신 주기
- 기본적으로 Eureka 클라이언트는 30초마다 하트비트를 전송합니다. 
- 개발 환경에서는 이 주기를 줄일 수 있지만, 운영 환경에서는 기본값을 유지하는 것이 좋습니다.

```yaml
eureka:
  instance:
    leaseRenewalIntervalInSeconds: 30
```

## 7. 마치며
- Spring Cloud Netflix와 Eureka를 활용하면 마이크로서비스 아키텍처의 핵심 과제인 서비스 디스커버리를 효과적으로 구현할 수 있습니다. 
- 특히 고가용성 구성과 Zone 기반 라우팅은 대규모 분산 시스템 운영에 큰 도움이 됩니다.
- 실제 프로덕션 환경에서는 다음 사항들을 고려하세요:
  - 적절한 타임아웃 설정
  - 보안 설정 강화
  - 모니터링 구축
  - 장애 복구 전략 수립

참고
- [Spring Cloud Netflix](https://cloud.spring.io/spring-cloud-netflix/reference/html/#service-discovery-eureka-clients)