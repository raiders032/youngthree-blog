---
title: "Externalized Configuration"
description: "Spring Boot의 외부 설정 기능을 상세히 알아봅니다. 설정 우선순위, 다양한 설정 방법, 환경별 설정 관리까지 실제 프로젝트에 바로 적용할 수 있는 실용적인 가이드를 제공합니다."
tags: ["EXTERNALIZED_CONFIGURATION", "SPRING_BOOT", "BACKEND", "JAVA", "CONFIGURATION", "PROPERTIES"]
keywords: ["외부설정", "externalized configuration", "스프링부트", "spring boot", "설정관리", "configuration", "프로퍼티", "properties", "yaml", "환경변수", "environment variables", "설정우선순위", "property source", "application.properties", "@Value", "@ConfigurationProperties"]
draft: false
hide_title: true
---

## 1. Spring Boot 외부 설정이란

- Spring Boot의 외부 설정(Externalized Configuration)은 동일한 애플리케이션 코드를 서로 다른 환경에서 실행할 수 있도록 설정을 외부화하는 기능입니다.
- 개발, 테스트, 운영 환경에서 각각 다른 데이터베이스 정보나 API 키를 사용해야 할 때 코드 변경 없이 설정만으로 이를 해결할 수 있습니다.
- Java 프로퍼티 파일, YAML 파일, 환경 변수, 명령행 인수 등 다양한 외부 설정 소스를 지원합니다.

:::tip
외부 설정을 사용하면 코드와 설정을 분리하여 애플리케이션의 유연성을 크게 높일 수 있습니다. 특히 컨테이너 환경에서는 필수적인 기능입니다.
:::

## 2. 설정값 사용 방법

### 2.1 @Value 어노테이션

- 가장 간단한 방법으로 `@Value` 어노테이션을 사용하여 프로퍼티 값을 직접 주입할 수 있습니다.

#### @Value 사용 예시

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MyBean {

    @Value("${name}")
    private String name;
    
    @Value("${app.timeout:30}")
    private int timeout; // 기본값 30 설정
    
    // getter 메서드들...
}
```

위 예시에서 `name` 프로퍼티는 설정 파일에서 값을 가져오며, `timeout`은 설정값이 없을 경우 기본값 30을 사용합니다.

### 2.2 Environment 추상화

- Spring의 `Environment` 인터페이스를 통해 프로그래밍 방식으로 설정값에 접근할 수 있습니다.

#### Environment 사용 예시

```java
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ConfigService {

    private final Environment env;
    
    public ConfigService(Environment env) {
        this.env = env;
    }
    
    public String getDatabaseUrl() {
        return env.getProperty("database.url", "jdbc:h2:mem:testdb");
    }
}
```

### 2.3 @ConfigurationProperties

- 구조화된 객체로 설정값을 바인딩할 때 사용하는 가장 권장되는 방법입니다.

#### @ConfigurationProperties 사용 예시

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.database")
public class DatabaseProperties {
    
    private String url;
    private String username;
    private String password;
    private int maxConnections = 10;
    
    // getter, setter 메서드들...
}
```

이 방식을 사용하면 `app.database.url`, `app.database.username` 등의 프로퍼티가 자동으로 객체에 바인딩됩니다.

## 3. 설정 소스 우선순위

- Spring Boot는 매우 특별한 PropertySource 순서를 사용하여 설정값의 재정의를 허용합니다.
- 나중에 오는 프로퍼티 소스가 이전 소스에 정의된 값들을 재정의할 수 있습니다.

### 3.1 우선순위 목록 (높은 순위부터)

- 명령행 인수
- `SPRING_APPLICATION_JSON`의 프로퍼티
- ServletConfig 초기화 매개변수
- ServletContext 초기화 매개변수
- `java:comp/env`의 JNDI 속성
- Java 시스템 프로퍼티 (`System.getProperties()`)
- OS 환경 변수
- `random.*` 프로퍼티를 가진 RandomValuePropertySource
- 설정 데이터 (application.properties 파일 등)
- `@Configuration` 클래스의 `@PropertySource` 어노테이션
- 기본 프로퍼티 (`SpringApplication.setDefaultProperties(Map)`로 지정)

:::warning
`@PropertySource` 어노테이션으로 지정한 프로퍼티 소스는 애플리케이션 컨텍스트가 새로고침될 때까지 Environment에 추가되지 않습니다. 따라서 `logging.*`이나 `spring.main.*`과 같은 프로퍼티 설정에는 사용할 수 없습니다.
:::

### 3.2 설정 데이터 파일 우선순위

- JAR 외부의 프로필별 application 프로퍼티 (`application-{profile}.properties`)
- JAR 외부의 application 프로퍼티 (`application.properties`)
- JAR 내부의 프로필별 application 프로퍼티 (`application-{profile}.properties`)
- JAR 내부의 application 프로퍼티 (`application.properties`)

## 4 선택적 위치 (Optional Locations)

- 기본적으로 지정한 설정 데이터 위치가 존재하지 않으면, Spring Boot는 ConfigDataLocationNotFoundException을 발생시키고 애플리케이션이 시작되지 않습니다.
- 특정 위치를 지정하되 해당 위치가 항상 존재하지 않아도 괜찮다면, `optional:` 접두사를 사용할 수 있습니다.
- 이 접두사는 `spring.config.location`, `spring.config.additional-location` 속성뿐만 아니라 `spring.config.import` 선언에서도 사용할 수 있습니다.
- 예를 들어, spring.config.import 값을 `optional:file:./myconfig.properties`로 설정하면 myconfig.properties 파일이 없어도 애플리케이션이 시작됩니다.
- 모든 ConfigDataLocationNotFoundException 오류를 무시하고 항상 애플리케이션을 계속 시작하려면, `spring.config.on-not-found` 속성을 사용할 수 있습니다.

## 5 추가 데이터 가져오기

- [레퍼런스](https://docs.spring.io/spring-boot/reference/features/external-config.html#features.external-config.files.importing)
- `spring.config.import` 속성을 사용하여 다른 위치에서 추가 설정 데이터를 가져올 수 있습니다. 
- import된 dev.properties의 값들은 import를 트리거한 파일보다 우선순위를 가집니다.
- 추가 데이터 임포트는 여러번 정의해도 한번만 가져옵니다.

### 5.1 예시

```yml
spring.application.name=myapp
spring.config.import=optional:file:./dev.properties
```

- 위의 예시에서, dev.properties는 spring.application.name을 다른 값으로 재정의할 수 있습니다.
- 그 이유는 트리거한 파일보다. dev.properties의 우선순위가 높기 때문입니다.
- `optional:` 접두사를 사용하여 dev.properties가 없어도 애플리케이션이 시작되도록 설정했습니다.

## 참고

- https://docs.spring.io/spring-boot/reference/features/external-config.html