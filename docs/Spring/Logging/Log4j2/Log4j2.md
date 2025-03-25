# 1 Log4j2

- **Log4j2**는 Apache Software Foundation에서 개발한 자바 기반 로깅 프레임워크입니다.
- 기존 Log4j의 후속 버전으로, 성능과 기능이 대폭 향상되었습니다.
- 비동기 로깅 지원으로 높은 성능을 제공합니다.
- Log4j2는 SLF4J(Simple Logging Facade for Java)와 Apache Commons Logging (JCL)의 구현체입니다.

# 2 Log4j2 소개

- **Log4j2**는 고성능 로깅을 위해 설계된 자바 기반 로깅 프레임워크입니다.
- 비동기 로깅을 지원하여 애플리케이션 성능에 미치는 영향을 최소화합니다.
- 다양한 설정 파일 형식을 지원하여 유연한 구성을 제공합니다.
- 고급 필터링 및 동적 로그 레벨 변경 기능을 통해 로그를 세밀하게 제어할 수 있습니다.

# 3 주요 기능

## 3.1 비동기 로깅

- Log4j2는 비동기 로깅을 통해 로그 성능을 극대화합니다.
- 비동기 로깅은 로그 이벤트를 별도의 스레드에서 처리하여 애플리케이션 성능 저하를 최소화합니다.

## 3.2 고급 필터링

- 다양한 필터링 옵션을 제공하여 로그를 세밀하게 제어할 수 있습니다.
- 필터는 로그 이벤트를 허용하거나 거부하는 역할을 하며, 여러 단계에서 적용될 수 있습니다.

## 3.3 동적 로그 레벨 변경

- 애플리케이션 실행 중에도 로그 레벨을 동적으로 변경할 수 있습니다.
- 이 기능을 통해 애플리케이션의 로깅 동작을 실시간으로 조정할 수 있습니다.

## 3.4 다양한 설정 파일 형식

- XML, JSON, YAML 형식의 설정 파일을 지원합니다.
- 설정 파일을 통해 로거, 앱렌더, 레이아웃 등을 유연하게 구성할 수 있습니다.

# 4 설정 파일 구조

- Log4j2 설정 파일은 주로 XML, JSON, YAML 형식으로 작성됩니다.
- 설정 파일은 다음과 같은 주요 요소로 구성됩니다:

## 4.1 Configuration

- 설정 파일의 루트 요소입니다.

**속성**

- [레퍼런스](https://logging.apache.org/log4j/2.x/manual/configuration.html#configuration-syntax)
- status
  - 설정 파일이 처리되는 동안 발생하는 내부 로그 메시지의 수준을 지정합니다.
  - 가능한 값: `OFF`, `FATAL`, `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`, `ALL`
- name
  - 설정의 이름을 지정합니다.
  - 이 속성은 일반적으로 설정의 식별자 역할을 합니다.
- packages
  - 추가적인 플러그인 패키지 경로를 지정합니다.
  - 플러그인은 커스텀 앱렌더, 레이아웃, 필터 등을 정의할 때 사용됩니다

## 4.2 Properties

- 로그 파일 경로, 패턴 등 전역적으로 사용할 수 있는 속성을 정의합니다.

## 4.3 Appenders

- 로그 메시지를 출력할 대상을 정의합니다.
- 콘솔, 파일, 원격 서버 등 다양한 출력을 지원합니다.

## 4.4 Loggers

- 로그 메시지를 생성할 로거를 정의합니다.
- 루트 로거와 패키지별 로거를 설정할 수 있습니다.

# 5 설정 예시

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
    <Properties>
        <Property name="logDir">logs</Property>
        <Property name="logPattern">%d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} - %msg%n</Property>
    </Properties>

    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="${logPattern}"/>
        </Console>
        <File name="File" fileName="${logDir}/app.log">
            <PatternLayout pattern="${logPattern}"/>
        </File>
    </Appenders>

    <Loggers>
        <Root level="info">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="File"/>
        </Root>
        <Logger name="com.example" level="debug" additivity="false">
            <AppenderRef ref="Console"/>
        </Logger>
    </Loggers>
</Configuration>
```

- 다음은 Log4j2 설정 파일의 예시입니다.
- 이 예시는 콘솔과 파일로 로그를 출력하도록 설정합니다.
- `logDir` 속성을 사용하여 로그 파일의 디렉토리를 지정하고, `logPattern` 속성을 통해 로그 형식을 정의합니다.
- `Appenders` 섹션에서는 콘솔과 파일 출력 방식을 정의하고, `Loggers` 섹션에서는 기본 루트 로거와 특정 패키지(`com.example`)에 대한 로거를 설정합니다.

# 6 Log4j2의 주요 로깅 레벨

- **OFF**: 로깅을 완전히 비활성화합니다.
- **FATAL**: 치명적인 오류가 발생했을 때 사용합니다. 시스템이 중단될 위험이 있는 상황을 나타냅니다.
- **ERROR**: 오류가 발생했을 때 사용합니다. 일반적인 오류 상황을 나타냅니다.
- **WARN**: 경고 메시지를 나타냅니다. 오류는 아니지만 주의가 필요한 상황을 나타냅니다.
- **INFO**: 정보성 메시지를 나타냅니다. 애플리케이션의 정상적인 동작을 기록할 때 사용합니다.
- **DEBUG**: 디버깅을 위한 상세한 정보를 나타냅니다. 개발 및 디버깅 과정에서 유용한 정보를 기록합니다.
- **TRACE**: 매우 상세한 디버깅 정보를 나타냅니다. 세밀한 추적이 필요한 경우 사용합니다.
- **ALL**: 모든 레벨의 로그를 출력합니다.
- 이들 로깅 레벨은 로그 메시지의 중요도에 따라 계층 구조를 가지며, 특정 레벨을 설정하면 그 이상의 중요도를 가진 모든 로그 메시지가 출력됩니다.
- 예를 들어, 로그 레벨을 `INFO`로 설정하면 `INFO`, `WARN`, `ERROR`, `FATAL` 레벨의 로그 메시지가 출력됩니다.

**참고 자료**

- [Spring Logging 공식 문서](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#boot-features-logging)
- [Jakarta Commons Logging 공식 문서](https://commons.apache.org/proper/commons-logging/)
- [SLF4j 공식 문서](http://www.slf4j.org/)
- [Log4j2 공식 문서](https://logging.apache.org/log4j/2.x/manual/configuration.html)