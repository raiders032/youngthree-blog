---
title: "Spring 로깅 시스템: 추상화와 구현체의 관계 이해하기"
description: "Spring의 로깅 시스템에 대한 이해를 돕습니다. 로깅 추상화(JCL, SLF4J)와 구현체(Logback, Log4j2, Java Util Logging)의 관계, 작동 방식, 그리고 실전 설정에 대해 알아봅니다. 스프링 부트 환경에서 로깅을 효과적으로 사용하는 방법을 다룹니다."
tags: [ "SPRING", "LOGGING", "LOGBACK", "LOG4J2", "SLF4J", "SPRING_BOOT", "BACKEND", "JAVA" ]
keywords: [ "스프링 로깅", "Spring Logging", "JCL", "SLF4J", "Logback", "Log4j2", "로그백", "로그포제이", "자바 로깅", "스프링부트 로깅", "로그 추상화", "로그 구현체", "Commons Logging", "로깅 설정", "Spring Boot Logging" ]
draft: false
hide_title: true
---

## 1. Spring 로깅 시스템 개요

- Spring Framework는 기본적으로 Jakarta Commons Logging(JCL)을 내부 로깅에 사용합니다.
- Spring Boot는 로깅 구현체를 열린 상태로 두어 개발자가 선택할 수 있도록 합니다.
- 기본적으로 Java Util Logging, Log4j2, Logback에 대한 설정이 제공됩니다.
- Spring Boot 스타터를 사용할 경우, Logback이 기본 로깅 구현체로 사용됩니다.

:::info Spring Boot 환경에서는 spring-boot-starter-logging이 spring-boot-starter-web에 포함되어 있어 별도의 의존성 추가 없이 Logback을 사용할 수 있습니다.
:::

## 2. 로깅 시스템의 구조: 추상화와 구현체

- Spring 로깅 시스템은 **추상화 계층**과 **구현체 계층**으로 나뉩니다. 
- 이 두 계층의 관계를 이해하는 것이 중요합니다.


### 2.1 로깅 추상화 계층

- 로깅 추상화 계층은 애플리케이션 코드가 특정 로깅 구현체에 직접 의존하지 않도록 중간에서 인터페이스 역할을 합니다.

#### 2.1.1 Jakarta Commons Logging(JCL)

- Spring Framework가 내부적으로 사용하는 로깅 추상화 라이브러리입니다.
- **런타임 시** 클래스패스에서 가장 먼저 발견되는 로깅 구현체를 사용합니다.
- 동적 바인딩 방식을 사용하여 구현체를 결정합니다.
- 장점: 구현체 교체 시 코드 변경 없이 가능합니다.
- 단점: 클래스로더 이슈가 발생할 수 있고, 의존성 충돌 문제가 있을 수 있습니다.

```java
// JCL 사용 예시
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class MyClass {
    private static final Log logger = LogFactory.getLog(MyClass.class);
    
    public void doSomething() {
        logger.info("JCL을 사용한 로그 메시지");
    }
}
```

#### 2.1.2 SLF4J(Simple Logging Facade for Java)

- JCL의 문제점을 개선한 더 현대적인 로깅 추상화 라이브러리입니다.
- **컴파일 타임**에 로깅 구현체를 바인딩합니다.
- 정적 바인딩 방식을 사용하여 클래스로더 이슈를 해결했습니다.
- 로깅 구현체와의 연결을 위한 어댑터(브릿지)를 사용합니다.
- 로그 메시지 형식화를 위한 파라미터화된 로깅 메서드를 제공합니다.
- 마커(Marker)를 통한 세밀한 로그 필터링이 가능합니다.

```java
// SLF4J 사용 예시
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MyClass {
    private static final Logger logger = LoggerFactory.getLogger(MyClass.class);
    
    public void doSomething() {
        logger.info("SLF4J를 사용한 로그 메시지: {}", "파라미터화 예시");
    }
}
```

:::tip[SLF4J vs JCL의 주요 차이점]

- **바인딩 시점**: JCL은 런타임, SLF4J는 컴파일 타임
- **성능**: SLF4J가 일반적으로 더 나은 성능 제공
- **메시지 형식화**: SLF4J는 파라미터화된 메시지 지원 (문자열 연결 연산 감소)
- **안정성**: SLF4J는 클래스로더 이슈가 적음
  :::

### 2.2 로깅 구현체 계층

로깅 추상화 라이브러리는 실제 로그를 처리하지 않으며, 로깅 작업을 수행하는 구현체가 필요합니다.

#### 2.2.1 Logback

- SLF4J의 기본 구현체로, Log4j의 후속 버전입니다.
- Spring Boot의 기본 로깅 구현체로 사용됩니다.
- 주요 특징:
  - 자동 리로딩 지원 (서버 재시작 없이 설정 변경 가능)
  - 효율적인 디스크 사용을 위한 로그 압축
  - 조건부 처리를 통한 필터링
  - Spring 프로필과 통합된 설정 가능
  - 5단계의 로그 레벨: ERROR, WARN, INFO, DEBUG, TRACE

```xml
<!-- logback-spring.xml 기본 구조 -->
<configuration>
    <!-- 콘솔에 로그 출력 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 파일에 로그 출력 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/application.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 로거 설정 -->
    <logger name="org.springframework" level="INFO"/>
    <logger name="com.myapp" level="DEBUG"/>

    <!-- 루트 로거 설정 -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

#### 2.2.2 Log4j2

- Log4j의 완전히 새로운 버전으로, 이전 버전과 비교하여 성능과 기능이 대폭 개선되었습니다.
- 주요 특징:
  - 비동기 로거를 통한 높은 성능
  - 가비지 컬렉션 부하 감소
  - 플러그인 아키텍처를 통한 확장성
  - XML, JSON, YAML 등 다양한 설정 형식 지원
  - 고급 필터링 기능
  - 동적 로그 레벨 변경 지원

```xml
<!-- log4j2-spring.xml 기본 구조 -->
<Configuration>
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </Console>
        <RollingFile name="RollingFile" fileName="logs/app.log"
                     filePattern="logs/app-%d{MM-dd-yyyy}-%i.log.gz">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="10 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="10"/>
        </RollingFile>
    </Appenders>
    <Loggers>
        <Root level="info">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="RollingFile"/>
        </Root>
    </Loggers>
</Configuration>
```

#### 2.2.3 Java Util Logging (JUL)

- JDK에 내장된 기본 로깅 API입니다.
- 별도의 의존성 필요 없이 사용 가능합니다.
- 제한된 기능을 제공하며, 기업용 애플리케이션에서는 잘 사용되지 않습니다.

:::warning Spring Boot는 실행 가능한 JAR로 애플리케이션을 실행할 때 Java Util Logging 사용을 권장하지 않습니다. 클래스로딩 이슈가 발생할 수 있기 때문입니다.
:::

## 3. Spring Boot의 로깅 시스템 작동 방식

### 3.1 자동 구성

Spring Boot는 다음 과정을 통해 로깅 시스템을 자동으로 구성합니다:

1. 클래스패스에 있는 로깅 구현체를 감지합니다.
2. 적절한 로깅 구현체를 선택합니다(기본값은 Logback).
3. 기본 로그 포맷을 적용합니다.
4. application.properties나 application.yml의 설정을 적용합니다.
5. 필요한 경우 커스텀 로깅 설정 파일을 로드합니다.

### 3.2 추상화와 구현체의 연결

- Spring Boot 환경에서 로깅 추상화와 구현체는 다음과 같이 연결됩니다:
- Spring 내부 코드는 JCL을 사용하지만, 스프링 부트는 JCL API 호출을 SLF4J로 리다이렉트하는 브릿지를 포함합니다.
- 개발자 코드는 일반적으로 SLF4J를 직접 사용합니다.
- 최종적으로 모든 로그는 Logback(또는 선택한 다른 구현체)으로 전달됩니다.

### 3.3 의존성 관계

Spring Boot 로깅 관련 의존성 관계는 다음과 같습니다:

```
spring-boot-starter-web
    └── spring-boot-starter-logging
            ├── logback-classic
            │     └── logback-core
            ├── log4j-to-slf4j (Log4j → SLF4J 브릿지)
            ├── jul-to-slf4j (Java Util Logging → SLF4J 브릿지)
            └── slf4j-api
```

이러한 구조로 인해:

- Log4j로 작성된 라이브러리의 로그는 SLF4J로 리다이렉트됩니다.
- Java Util Logging으로 작성된 라이브러리의 로그도 SLF4J로 리다이렉트됩니다.
- 모든 로그는 최종적으로 Logback에서 처리됩니다.

## 4. 로깅 설정 방법

### 4.1 application.properties/yml을 통한 기본 설정

```yaml
# 로그 레벨 설정
logging.level.root=warn
logging.level.org.springframework.web=debug
logging.level.org.hibernate=error
logging.level.com.myapp=debug

  # 로그 파일 설정
logging.file.name=myapp.log
logging.file.path=/var/logs

  # 로그 패턴 설정
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

### 4.2 커스텀 로깅 설정 파일

Spring Boot는 다음 로깅 설정 파일을 자동으로 인식합니다:

- **Logback**: `logback-spring.xml`, `logback.xml`
- **Log4j2**: `log4j2-spring.xml`, `log4j2.xml`
- **JUL**: `logging.properties`

:::tip 
Spring Boot는 `-spring` 접미사가 붙은 설정 파일 사용을 권장합니다(예:`logback-spring.xml`). 이 파일들은 Spring Boot가 완전히 제어할 수 있어 Spring 환경 속성이나 프로필 조건부 로깅 등의 기능을 사용할 수 있습니다.
:::

### 4.3 Logback 설정 예시 (logback-spring.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- Spring Boot의 기본 설정 가져오기 -->
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>

    <!-- 변수 정의 -->
    <property name="LOG_FILE" value="${LOG_FILE:-${LOG_PATH:-${LOG_TEMP:-${java.io.tmpdir:-/tmp}}}/spring.log}"/>

    <!-- 콘솔 출력 설정 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} %clr(${LOG_LEVEL_PATTERN:-%5p}) %clr(${PID:- }){magenta}
                %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint}
                %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}
            </pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 파일 출력 설정 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_FILE}</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} ${LOG_LEVEL_PATTERN:-%5p} ${PID:- } --- [%t] %-40.40logger{39} :
                %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}
            </pattern>
            <charset>UTF-8</charset>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${LOG_FILE}.%d{yyyy-MM-dd}.%i.gz</fileNamePattern>
            <maxFileSize>10MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>1GB</totalSizeCap>
        </rollingPolicy>
    </appender>

    <!-- 프로필 기반 설정 -->
    <springProfile name="dev">
        <logger name="com.myapp" level="DEBUG"/>
    </springProfile>

    <springProfile name="prod">
        <logger name="com.myapp" level="INFO"/>
    </springProfile>

    <!-- 루트 로거 설정 -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

## 5. 실전 로깅 전략 및 팁

### 5.1 로그 그룹 활용하기

- Spring Boot는 관련 로거를 그룹화할 수 있는 기능을 제공합니다

```yaml
# 로그 그룹 정의
logging.group.web=org.springframework.core.codec,org.springframework.http,org.springframework.web
logging.group.sql=org.hibernate.SQL,org.springframework.jdbc.core

  # 그룹 레벨 설정
logging.level.web=debug
logging.level.sql=debug
```

### 5.2 MDC(Mapped Diagnostic Context) 활용

- MDC는 특정 요청이나 세션과 관련된 정보를 로그에 포함시키는 기능입니다

```java
import org.slf4j.MDC;

// 컨트롤러나 인터셉터에서 MDC 설정
MDC.put("userId", user.getId());
MDC.put("requestId", requestId);

// 로그 출력
logger.info("사용자 요청 처리 중");

// 작업 완료 후 MDC 정리
MDC.clear();
```

logback-spring.xml 패턴에 MDC 값 포함:

```xml

<pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} [userId: %X{userId}, requestId: %X{requestId}] - %msg%n
</pattern>
```

### 5.3 구조화된 로깅(JSON 형식)

운영 환경에서는 로그 분석을 위해 JSON 형식의 구조화된 로깅이 유용합니다:

```xml
<!-- Logback 구조화된 로깅 설정 -->
<configuration>
    <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
    </appender>

    <root level="INFO">
        <appender-ref ref="JSON"/>
    </root>
</configuration>
```

의존성 추가:

```xml

<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

### 5.4 커스텀 로그 포맷 지정

Spring Boot에서 기본 로그 포맷을 커스터마이징하는 방법입니다:

```yaml
# 콘솔 로그 패턴
  logging.pattern.console=%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){blue} %clr(%5p) %clr(${PID}){magenta} %clr(---){faint} %clr([%15.15t]){yellow} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%n%wEx

# 파일 로그 패턴
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss.SSS} %5p ${PID} --- [%t] %-40.40logger{39}: %m%n%wEx
```

## 6. 결론

- Spring의 로깅 시스템은 추상화 계층과 구현체 계층으로 구성되어 있습니다.
- 추상화 계층(JCL, SLF4J)은 로깅 구현체와 애플리케이션 코드 사이의 인터페이스 역할을 합니다.
- 구현체 계층(Logback, Log4j2, JUL)은 실제 로깅 작업을 수행합니다.
- Spring Boot는 기본적으로 Logback을 사용하며, 브릿지를 통해 다양한 로깅 프레임워크의 통합을 지원합니다.
- 로깅 설정은 application.properties/yml이나 전용 설정 파일을 통해 가능합니다.
- 효과적인 로깅을 위해 로그 그룹, MDC, 구조화된 로깅 등의 고급 기능을 활용할 수 있습니다.

로깅 시스템을 올바르게 이해하고 설정하면, 애플리케이션 개발, 디버깅, 모니터링이 훨씬 더 효율적이고 효과적으로 이루어질 수 있습니다.

## 참고 자료

- [Spring Boot 로깅 공식 문서](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.logging)