---
title: "Profiles"
description: "스프링 프로파일의 개념부터 실전 활용까지 상세히 알아봅니다. 개발, 테스트, 운영 환경별 설정 관리와 조건부 빈 등록 등 실무에서 필요한 모든 내용을 다룹니다."
tags: [ "SPRING", "SPRING_BOOT", "CONFIGURATION", "JAVA", "BACKEND" ]
keywords: [ "스프링 프로파일", "spring profiles", "프로파일", "profiles", "스프링", "spring", "환경설정", "configuration", "개발환경", "운영환경", "테스트환경", "조건부 빈", "환경변수" ]
draft: false
hide_title: true
---

## 1. 프로파일이란?

- 스프링 프로파일은 애플리케이션의 실행 환경별로 다른 설정을 적용할 수 있게 해주는 메커니즘입니다.
- 개발, 테스트, 운영 등 각 환경에 맞는 설정과 빈을 구성할 수 있습니다.

## 2. 프로파일의 용도

- 환경별 데이터베이스 설정 분리 (개발 DB, 운영 DB)
- 외부 서비스 연동 설정 관리 (테스트용 Mock, 실제 API)
- 로깅 레벨 환경별 구성
- 캐시 설정 분리
- 모니터링 도구 환경별 활성화

## 3. 프로파일 활성화 방법

- 프로파일 활성화 방법은 다음과 같이 여러 가지가 있습니다
- 또한 다중 프로파일 활성화가 가능합니다.

### 3.1 환경 변수로 지정

```bash
export SPRING_PROFILES_ACTIVE=dev,local
```

### 3.2 JVM 아규먼트로 지정

```bash
java -jar -Dspring.profiles.active=dev myapp.jar
```

### 3.3 application.yml에서 지정

```yaml
spring:
  profiles:
    active: dev
```

### 3.4 @ActiveProfiles 어노테이션

- `@ActiveProfiles` 어노테이션으로 프로파일을 활성화 할 수 있습니다.

```java
// 테스트에서 사용
@SpringBootTest
@ActiveProfiles("test")
class MyTest {
    // ...
}

// Configuration에서 사용
@Configuration
@ActiveProfiles("dev")
public class AppConfig {
    // ...
}
```

## 4. 프로파일 설정 파일 구성

### 4.1 파일 명명 규칙

- 스프링 부트는 프로파일별 설정 파일을 자동으로 감지하고 로드하는 규칙을 가지고 있습니다.
- 기본 설정 파일:
	- application.properties 또는 application.yml
	- 모든 환경에서 공통으로 사용되는 기본 설정 정의
		- 특정 프로파일이 활성화되면 해당 프로파일의 설정이 이 기본 설정을 덮어씁니다
- 프로파일별 설정 파일:
	- `application-{profile}.properties` 또는 `application-{profile}.yml`
	- `{profile}` 부분에 실제 프로파일 이름이 들어갑니다
	- 예: development 프로파일용 application-development.yml
- 설정 로드 우선순위:
	- 프로파일 설정 파일이 기본 설정 파일보다 우선순위가 높습니다
	- 예: dev 프로파일 활성화시 application-dev.yml의 설정이 application.yml의 동일 설정을 덮어씁니다.

```
src/main/resources/
├── application.yml               # 공통 설정
├── application-dev.yml          # 개발 환경
├── application-prod.yml         # 운영 환경
└── application-test.yml         # 테스트 환경
```

### 4.2 설정 파일 작성 방법

#### 4.2.1 단일 파일 방식

```yaml
# 기본 설정
server:
  port: 8080

---
# dev 프로파일 설정 시작
spring:
  config:
    activate:
      on-profile: dev
server:
  port: 8081

---
# prod 프로파일 설정 시작
spring:
  config:
    activate:
      on-profile: prod
server:
  port: 443
```

- YAML 파일에서 spring.config.activate.on-profile은 문서 구분자(---)와 함께 사용하여 프로파일별 설정 블록을 구분합니다.
- 이렇게 하나의 YAML 파일 안에서 여러 프로파일의 설정을 관리할 수 있습니다. 프로파일이 활성화되면 해당 블록의 설정이 적용됩니다.
- 문서 구분자(---) 사용 필수입니다.
- 각 블록의 시작에 spring.config.activate.on-profile 지정합니다.
- 프로파일 미지정 블록은 공통 설정으로 적용됩니다.

#### 분리 파일 방식 (application-dev.yml)

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    username: sa
    password:
```

## 5. @Profile 어노테이션 활용

- `@Profile` 어노테이션은 특정 프로파일이 활성화됐을 때만 빈을 등록하거나 설정을 활성화하는 조건부 구성을 가능하게 합니다.

### 5.1 클래스 레벨 적용

```java
@Configuration
@Profile("dev")
public class DevConfig {
    // ...
}
```

- dev 프로파일에서만 이 설정 클래스의 모든 빈이 등록됨.

### 5.2 메소드 레벨 적용

```java
@Configuration
public class DatabaseConfig {
    
    @Bean
    @Profile("dev")
    public DataSource devDataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .build();
    }
}
```

- dev 프로파일에서만 이 devDataSource 빈이 등록됨.

### 5.3 프로파일 표현식

- @Profile은 논리 연산자를 사용한 복잡한 조건 설정이 가능합니다

```java
@Profile("!prod") // prod가 아닌 경우
@Profile("dev & local") // dev와 local 모두 활성화된 경우
@Profile("dev | stage") // dev나 stage 중 하나라도 활성화된 경우
```

## 6. 프로파일 우선순위

1. ServletConfig 파라미터
2. ServletContext 파라미터
3. JNDI (java:comp/env/spring.profiles.active)
4. JVM 시스템 프로퍼티 (-Dspring.profiles.active)
5. 환경 변수 (SPRING_PROFILES_ACTIVE)
6. application.yml의 spring.profiles.active

## 7. 실전 활용 예제

### 7.1 환경별 로깅 설정

#### application-dev.yml

```yaml
logging:
  level:
    root: DEBUG
    com.myapp: DEBUG
```

#### application-prod.yml

```yaml
logging:
  level:
    root: WARN
    com.myapp: INFO
```

### 7.2 조건부 빈 등록

```java
@Component
@Profile("dev")
public class DevService implements MyService {
    // 개발 환경용 구현
}

@Component
@Profile("prod")
public class ProdService implements MyService {
    // 운영 환경용 구현
}
```

## 8. 프로파일 사용 시 주의사항

- 민감한 정보는 환경 변수나 외부 설정 관리 도구 사용
- 프로파일 이름은 일관된 네이밍 규칙 적용
- 활성화된 프로파일 로그 확인
- 기본 프로파일 설정 관리