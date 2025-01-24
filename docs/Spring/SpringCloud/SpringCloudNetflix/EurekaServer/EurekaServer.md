---
title: "Eureka Server"
description: "Spring Cloud Netflix Eureka Server의 설정과 운영 방법을 상세히 설명합니다. 기본 설정부터 고가용성 구성, 보안 설정까지 실제 예제 코드와 함께 다룹니다."
tags: [ "SPRING_CLOUD", "EUREKA", "MICROSERVICES", "SPRING_BOOT", "JAVA", "BACKEND" ]
keywords: [ "유레카", "eureka", "스프링클라우드", "spring cloud", "마이크로서비스", "microservices", "서비스디스커버리", "service discovery", "스프링부트", "spring boot", "자바", "java", "고가용성", "high availability" ]
draft: false
hide_title: true
---

## 1. Eureka Server 소개

- Eureka Server는 Netflix에서 개발하고 Spring Cloud에서 채택한 서비스 디스커버리 서버입니다.
- 마이크로서비스 아키텍처에서 각 서비스의 위치를 동적으로 관리하고 로드밸런싱을 지원합니다.
- Eureka Server의 데이터 저장 방식
	- 별도의 영구 저장소(DB 등)를 사용하지 않고 메모리에 데이터를 저장
	- 서비스 인스턴스들이 주기적으로 하트비트를 보내서 등록 정보를 최신 상태로 유지
- Eureka Client의 캐시 동작
	- 클라이언트도 Eureka 서버의 등록 정보를 메모리에 캐시로 저장
	- 서비스 호출할 때마다 Eureka 서버에 요청하지 않고 캐시된 정보 활용
		- 이를 통해 성능 향상 및 서버 부하 감소

## 2. 기본 설정

### 2.1 의존성 추가

#### Maven 설정

```xml

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

#### Gradle 설정

```groovy
buildscript {
  dependencies {
    classpath("org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
  }
}

apply plugin: "spring-boot"

dependencyManagement {
  imports {
    mavenBom "org.springframework.cloud:spring-cloud-dependencies:${springCloudVersion}"
  }
}
```

### 2.2 애플리케이션 설정

#### EurekaServerApplication.java

```java
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        new SpringApplicationBuilder(EurekaServerApplication.class)
            .web(true)
            .run(args);
    }
}
```

- 서버는 `/eureka/*` 경로에 일반 Eureka 기능을 위한 홈페이지와 HTTP API 엔드포인트를 가지고 있습니다.

## 3. 운영 모드 설정

### 3.1 단독 모드 설정

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

### 3.2 고가용성 모드 설정

- 여러 Eureka Server를 실행하여 고가용성을 확보할 수 있습니다.
- Eureka Server의 Peer 관계
	- 기본적으로 모든 Eureka 서버는 동시에 Eureka 클라이언트로도 동작합니다.
	- 최소 하나 이상의 Peer 서버 URL이 필요합니다.
	- Peer URL을 설정하지 않으면 서비스는 동작하지만, Peer 등록 실패 로그가 지속적으로 발생합니다.
- Peer 간 연결과 동기화
	- 모든 Peer가 최소 하나의 엣지로 연결되어 있다면 등록 정보가 자동 동기화
	- 데이터센터 내부 또는 데이터센터 간에 물리적으로 분리 배치 가능
		- "split-brain" 유형의 장애에도 시스템 생존 가능

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

- peer1 프로필: hostname이 peer1인 서버, peer2를 defaultZone으로 지정
- peer2 프로필: hostname이 peer2인 서버, peer1을 defaultZone으로 지정
- 각 서버는 다른 피어를 defaultZone으로 등록
- 상호 참조하여 서비스 레지스트리 동기화
- 한 서버 장애 시에도 서비스 지속 가능

## 4. 보안 설정

### 4.1 Spring Security 통합

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

:::danger[CSRF 보호]
Spring Security를 사용할 때는 Eureka 클라이언트가 CSRF 토큰을 가지고 있지 않으므로, `/eureka/**` 엔드포인트에 대해 CSRF 검사를 비활성화해야 합니다.
:::

## 5. JDK 11 지원

### 5.1 JAXB 의존성 추가

JDK 11에서는 JAXB 모듈이 제거되었으므로 다음 의존성을 추가해야 합니다:

```xml

<dependency>
    <groupId>org.glassfish.jaxb</groupId>
    <artifactId>jaxb-runtime</artifactId>
</dependency>
```

## 6. 모니터링과 관리

### 6.1 서버 대시보드

Eureka Server는 `/eureka/*` 경로에서 관리 UI와 HTTP API 엔드포인트를 제공합니다:

- 등록된 서비스 목록 조회
- 서비스 상태 확인
- 인스턴스 정보 확인

:::tip[운영 팁]

- 운영 환경에서는 최소 2대 이상의 서버를 구성하세요
- 네트워크 파티션 발생 시에도 서비스가 가능하도록 데이터센터 간 분산 배치를 고려하세요
- 주기적으로 등록된 서비스의 상태를 모니터링하세요
  :::