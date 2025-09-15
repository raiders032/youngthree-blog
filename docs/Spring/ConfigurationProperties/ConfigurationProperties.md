---
title: "Type-Safe Configuration Properties"
description: "Spring Boot의 Type-Safe Configuration Properties를 상세히 알아봅니다. @ConfigurationProperties를 통한 구조화된 설정 관리, Constructor Binding, 유연한 바인딩, 검증 등 실제 프로젝트에 바로 적용할 수 있는 모든 기능을 다룹니다."
tags: ["CONFIGURATION_PROPERTIES", "SPRING_BOOT", "BACKEND", "JAVA", "TYPE_SAFE", "CONFIGURATION"]
keywords: ["configuration properties", "설정 프로퍼티", "@ConfigurationProperties", "type-safe", "타입 세이프", "설정 관리", "configuration", "스프링 부트", "spring boot", "JavaBean", "Constructor Binding", "Relaxed Binding", "설정 검증", "validation"]
draft: false
hide_title: true
---

## 1. Type-Safe Configuration Properties 소개

`@Value("${property}")` 어노테이션을 사용한 설정 프로퍼티 주입은 여러 프로퍼티를 다루거나 계층적 데이터 구조를 가진 경우 번거로울 수 있습니다. Spring Boot는 강타입 빈을 통해 애플리케이션 설정을 관리하고 검증할 수 있는 대안적인 방법을 제공합니다.

:::tip[Type-Safe Configuration의 장점]
- **타입 안전성**: 컴파일 타임에 타입 오류를 검출할 수 있습니다.
- **구조화된 설정**: 관련된 설정들을 하나의 클래스로 그룹화할 수 있습니다.
- **IDE 지원**: 자동 완성과 설정 메타데이터를 제공합니다.
- **검증 기능**: JSR-303 검증 어노테이션을 활용할 수 있습니다.
:::

## 2. JavaBean Properties Binding

표준 JavaBean 프로퍼티를 선언하는 빈을 바인딩할 수 있습니다.

### 2.1 기본 예제

```java
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("my.service")
public class MyProperties {

    private boolean enabled;

    private InetAddress remoteAddress;

    private final Security security = new Security();

    // getter / setter 메서드들...

    public boolean isEnabled() {
        return this.enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public InetAddress getRemoteAddress() {
        return this.remoteAddress;
    }

    public void setRemoteAddress(InetAddress remoteAddress) {
        this.remoteAddress = remoteAddress;
    }

    public Security getSecurity() {
        return this.security;
    }

    public static class Security {

        private String username;

        private String password;

        private List<String> roles = new ArrayList<>(Collections.singleton("USER"));

        // getter / setter 메서드들...

        public String getUsername() {
            return this.username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return this.password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public List<String> getRoles() {
            return this.roles;
        }

        public void setRoles(List<String> roles) {
            this.roles = roles;
        }
    }
}
```

### 2.2 매핑되는 프로퍼티

위의 POJO는 다음 프로퍼티들을 정의합니다:

- `my.service.enabled` - 기본값 false
- `my.service.remote-address` - String에서 변환 가능한 타입
- `my.service.security.username` - 중첩된 "security" 객체
- `my.service.security.password`
- `my.service.security.roles` - 기본값 USER를 가진 String 컬렉션

:::note[바인딩 요구사항]
이러한 방식은 기본 빈 생성자와 getter/setter 메서드에 의존합니다. 바인딩은 Spring MVC와 동일하게 표준 Java Beans 프로퍼티 디스크립터를 통해 수행됩니다.
:::

### 2.3 Setter 생략 가능한 경우

다음 경우에는 setter를 생략할 수 있습니다:

- **Map**: 초기화되어 있다면 getter만 필요하고 setter는 필수가 아닙니다
- **컬렉션과 배열**: 인덱스나 쉼표로 구분된 값으로 접근 가능합니다
- **중첩 POJO**: 초기화되어 있다면 setter가 필요하지 않습니다

:::warning[Lombok 사용 시 주의사항]
Project Lombok을 사용하는 경우, 특별한 생성자를 생성하지 않도록 주의하세요. 컨테이너가 객체를 자동으로 인스턴스화할 때 사용됩니다.
:::

## 3. Constructor Binding

이전 예제를 불변(immutable) 방식으로 다시 작성할 수 있습니다.

### 3.1 불변 클래스 예제

```java
import java.net.InetAddress;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties("my.service")
public class MyProperties {

    private final boolean enabled;

    private final InetAddress remoteAddress;

    private final Security security;

    public MyProperties(boolean enabled, InetAddress remoteAddress, Security security) {
        this.enabled = enabled;
        this.remoteAddress = remoteAddress;
        this.security = security;
    }

    // getter 메서드들...

    public boolean isEnabled() {
        return this.enabled;
    }

    public InetAddress getRemoteAddress() {
        return this.remoteAddress;
    }

    public Security getSecurity() {
        return this.security;
    }

    public static class Security {

        private final String username;

        private final String password;

        private final List<String> roles;

        public Security(String username, String password, @DefaultValue("USER") List<String> roles) {
            this.username = username;
            this.password = password;
            this.roles = roles;
        }

        // getter 메서드들...

        public String getUsername() {
            return this.username;
        }

        public String getPassword() {
            return this.password;
        }

        public List<String> getRoles() {
            return this.roles;
        }
    }
}
```

### 3.2 Constructor Binding 규칙

- 단일 매개변수화된 생성자가 있으면 constructor binding이 사용됩니다
- 여러 생성자가 있는 경우 `@ConstructorBinding` 어노테이션으로 지정할 수 있습니다
- Constructor binding을 사용하지 않으려면 매개변수화된 생성자에 `@Autowired`를 붙이거나 private으로 만듭니다

:::info[기본값 지정]
`@DefaultValue` 어노테이션을 사용하여 생성자 매개변수와 레코드 컴포넌트에 기본값을 지정할 수 있습니다. 변환 서비스가 문자열 값을 대상 타입으로 변환합니다.
:::

### 3.3 Constructor Binding 활성화

Constructor binding을 사용하려면 `@EnableConfigurationProperties` 또는 configuration property scanning으로 클래스를 활성화해야 합니다.

:::warning[주의사항]
- 일반적인 Spring 메커니즘으로 생성된 빈(`@Component`, `@Bean` 메서드 등)에서는 constructor binding을 사용할 수 없습니다
- `-parameters` 옵션으로 컴파일해야 합니다 (Spring Boot의 Gradle 플러그인이나 Maven에서 자동으로 처리)
:::

## 4. @ConfigurationProperties 타입 활성화

Spring Boot는 `@ConfigurationProperties` 타입을 바인딩하고 빈으로 등록하는 인프라를 제공합니다.

### 4.1 클래스별 활성화

```java
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(SomeProperties.class)
public class MyConfiguration {

}
```

```java
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("some.properties")
public class SomeProperties {

}
```

### 4.2 Configuration Property Scanning

```java
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan({ "com.example.app", "com.example.another" })
public class MyApplication {

}
```

:::note[빈 이름 규칙]
Configuration property scanning이나 `@EnableConfigurationProperties`를 통해 등록된 빈의 이름은 `<prefix>-<fqn>` 형식을 따릅니다. 여기서 `<prefix>`는 어노테이션에 지정된 환경 키 접두사이고, `<fqn>`은 빈의 정규화된 이름입니다.
:::

### 4.3 권장사항

:::tip[최선의 관례]
`@ConfigurationProperties`는 환경과만 관련되어야 하며, 특히 컨텍스트에서 다른 빈을 주입하지 않는 것이 좋습니다. 다른 빈을 주입해야 하는 경우 `@Component`를 사용하고 JavaBean 기반 프로퍼티 바인딩을 사용하세요.
:::

## 5. @ConfigurationProperties 타입 사용

이 설정 스타일은 SpringApplication 외부 YAML 설정과 특히 잘 작동합니다.

### 5.1 YAML 설정 예제

```yaml
my:
  service:
    remote-address: 192.168.1.1
    security:
      username: "admin"
      roles:
      - "USER"
      - "ADMIN"
```

### 5.2 서비스에서 사용

```java
import org.springframework.stereotype.Service;

@Service
public class MyService {

    private final MyProperties properties;

    public MyService(MyProperties properties) {
        this.properties = properties;
    }

    public void openConnection() {
        Server server = new Server(this.properties.getRemoteAddress());
        server.start();
        // ...
    }

    // ...
}
```

:::info[메타데이터 생성]
`@ConfigurationProperties`를 사용하면 IDE에서 자동 완성을 제공하는 메타데이터 파일을 생성할 수 있습니다.
:::

## 6. 서드파티 설정

클래스에 `@ConfigurationProperties`를 사용하는 것 외에도 public `@Bean` 메서드에서도 사용할 수 있습니다.

### 6.1 서드파티 컴포넌트 설정

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class ThirdPartyConfiguration {

    @Bean
    @ConfigurationProperties("another")
    public AnotherComponent anotherComponent() {
        return new AnotherComponent();
    }
}
```

`another` 접두사로 정의된 JavaBean 프로퍼티는 `AnotherComponent` 빈에 매핑됩니다.

## 7. 유연한 바인딩 (Relaxed Binding)

Spring Boot는 Environment 프로퍼티를 `@ConfigurationProperties` 빈에 바인딩할 때 유연한 규칙을 사용합니다.

### 7.1 바인딩 예제

```java
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("my.main-project.person")
public class MyPersonProperties {

    private String firstName;

    public String getFirstName() {
        return this.firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
}
```

### 7.2 사용 가능한 프로퍼티 이름들

| 프로퍼티 | 설명 |
|---------|------|
| `my.main-project.person.first-name` | 케밥 케이스 (권장) |
| `my.main-project.person.firstName` | 표준 카멜 케이스 |
| `my.main-project.person.first_name` | 언더스코어 표기법 |
| `MY_MAINPROJECT_PERSON_FIRSTNAME` | 대문자 형식 (환경 변수) |

:::note[접두사 규칙]
어노테이션의 접두사 값은 반드시 케밥 케이스여야 합니다 (소문자이고 `-`로 구분).
:::

### 7.3 프로퍼티 소스별 유연한 바인딩 규칙

| 프로퍼티 소스 | 단순 타입 | 리스트 |
|-------------|----------|------|
| Properties 파일 | 카멜 케이스, 케밥 케이스, 언더스코어 | `[ ]` 또는 쉼표로 구분된 값 |
| YAML 파일 | 카멜 케이스, 케밥 케이스, 언더스코어 | 표준 YAML 리스트 또는 쉼표로 구분된 값 |
| 환경 변수 | 언더스코어를 구분자로 하는 대문자 | 언더스코어로 둘러싸인 숫자 값 |
| 시스템 프로퍼티 | 카멜 케이스, 케밥 케이스, 언더스코어 | `[ ]` 또는 쉼표로 구분된 값 |

:::tip[권장사항]
가능하면 프로퍼티를 소문자 케밥 형식으로 저장하는 것을 권장합니다 (예: `my.person.first-name=Rod`).
:::

## 8. Map 바인딩

Map 프로퍼티에 바인딩할 때는 원래 키 값이 보존되도록 특별한 대괄호 표기법을 사용해야 할 수 있습니다.

### 8.1 Map 바인딩 예제

```properties
my.map[/key1]=value1
my.map[/key2]=value2
my.map./key3=value3
```

위 프로퍼티들은 `/key1`, `/key2`, `key3`를 키로 가진 Map에 바인딩됩니다. `key3`에서는 대괄호로 둘러싸이지 않았기 때문에 슬래시가 제거되었습니다.

:::warning[YAML 파일 주의사항]
YAML 파일에서는 키가 올바르게 파싱되도록 대괄호를 따옴표로 둘러싸야 합니다.

```yaml
my:
  map:
    "[/key1]": value1
    "[/key2]": value2
    "/key3": value3
```
:::

### 8.2 스칼라 값과 Map

스칼라 값에 바인딩할 때는 `.`이 포함된 키를 대괄호로 둘러쌀 필요가 없습니다. 스칼라 값에는 열거형과 `Object`를 제외한 `java.lang` 패키지의 모든 타입이 포함됩니다.

## 9. 환경 변수에서 바인딩

대부분의 운영 체제는 환경 변수 이름에 대해 엄격한 규칙을 적용합니다. Spring Boot의 유연한 바인딩 규칙은 가능한 한 이러한 명명 제한과 호환되도록 설계되었습니다.

### 9.1 변환 규칙

정규 형식의 프로퍼티 이름을 환경 변수 이름으로 변환하려면:

1. 점(`.`)을 언더스코어(`_`)로 바꿉니다
2. 대시(`-`)를 제거합니다
3. 대문자로 변환합니다

예: `spring.main.log-startup-info` → `SPRING_MAIN_LOGSTARTUPINFO`

### 9.2 객체 리스트 바인딩

환경 변수를 사용하여 객체 리스트에 바인딩할 수도 있습니다. 리스트에 바인딩하려면 변수 이름에서 요소 번호를 언더스코어로 둘러싸야 합니다.

예: `my.service[0].other` → `MY_SERVICE_0_OTHER`

### 9.3 환경 변수에서 Map 바인딩

```java
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("my.props")
public class MyMapsProperties {

    private final Map<String, String> values = new HashMap<>();

    public Map<String, String> getValues() {
        return this.values;
    }
}
```

`MY_PROPS_VALUES_KEY=value`로 설정하면 values Map에 `{"key"="value"}` 항목이 포함됩니다.

:::note[대소문자 변환]
환경 변수 이름만 소문자로 변환되고 값은 변환되지 않습니다. `MY_PROPS_VALUES_KEY=VALUE`로 설정하면 `{"key"="VALUE"}` 항목이 포함됩니다.
:::

## 10. 복합 타입 병합

리스트가 여러 곳에서 구성되면 전체 리스트를 교체하는 방식으로 재정의가 작동합니다.

### 10.1 리스트 병합 예제

```java
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("my")
public class MyProperties {

    private final List<MyPojo> list = new ArrayList<>();

    public List<MyPojo> getList() {
        return this.list;
    }
}
```

다음 설정을 고려하세요:

```properties
my.list[0].name=my name
my.list[0].description=my description
#---
spring.config.activate.on-profile=dev
my.list[0].name=my another name
```

`dev` 프로필이 활성화되면 리스트는 여전히 하나의 항목만 포함합니다 (이름은 "my another name", 설명은 null).

### 10.2 Map 병합

Map 프로퍼티의 경우 여러 소스에서 가져온 프로퍼티 값으로 바인딩할 수 있습니다. 하지만 여러 소스의 동일한 프로퍼티에 대해서는 가장 높은 우선순위를 가진 것이 사용됩니다.

```java
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("my")
public class MyProperties {

    private final Map<String, MyPojo> map = new LinkedHashMap<>();

    public Map<String, MyPojo> getMap() {
        return this.map;
    }
}
```

:::info[병합 규칙 적용 범위]
이러한 병합 규칙은 파일뿐만 아니라 모든 프로퍼티 소스의 프로퍼티에 적용됩니다.
:::

## 11. 속성 변환

Spring Boot는 `@ConfigurationProperties` 빈에 바인딩할 때 외부 애플리케이션 프로퍼티를 올바른 타입으로 강제 변환하려고 시도합니다.

### 11.1 커스텀 타입 변환

커스텀 타입 변환이 필요한 경우 다음을 제공할 수 있습니다:

- `ConversionService` 빈 (빈 이름 `conversionService`)
- 커스텀 프로퍼티 에디터 (`CustomEditorConfigurer` 빈 통해)
- 커스텀 컨버터 (`@ConfigurationPropertiesBinding`으로 어노테이션된 빈 정의)

:::warning[초기화 순서 주의]
프로퍼티 변환에 사용되는 빈은 애플리케이션 라이프사이클 초기에 요청되므로 `ConversionService`가 사용하는 종속성을 제한해야 합니다.
:::

### 11.2 Duration 변환

Spring Boot는 duration 표현에 대한 전용 지원을 제공합니다.

```java
import java.time.Duration;
import java.time.temporal.ChronoUnit;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.convert.DurationUnit;

@ConfigurationProperties("my")
public class MyProperties {

    @DurationUnit(ChronoUnit.SECONDS)
    private Duration sessionTimeout = Duration.ofSeconds(30);

    private Duration readTimeout = Duration.ofMillis(1000);

    // getter / setter 메서드들...
}
```

### 11.3 지원되는 Duration 형식

- 일반적인 long 표현 (기본 단위는 밀리초)
- 표준 ISO-8601 형식
- 값과 단위가 결합된 읽기 쉬운 형식 (`10s`는 10초)

### 11.4 지원되는 단위

- `ns` - 나노초
- `us` - 마이크로초  
- `ms` - 밀리초
- `s` - 초
- `m` - 분
- `h` - 시간
- `d` - 일

### 11.5 DataSize 변환

Spring Framework의 `DataSize` 값 타입을 사용하여 바이트 크기를 표현할 수 있습니다.

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.convert.DataSizeUnit;
import org.springframework.util.unit.DataSize;
import org.springframework.util.unit.DataUnit;

@ConfigurationProperties("my")
public class MyProperties {

    @DataSizeUnit(DataUnit.MEGABYTES)
    private DataSize bufferSize = DataSize.ofMegabytes(2);

    private DataSize sizeThreshold = DataSize.ofBytes(512);

    // getter/setter 메서드들...
}
```

### 11.6 지원되는 DataSize 단위

- `B` - 바이트
- `KB` - 킬로바이트
- `MB` - 메가바이트
- `GB` - 기가바이트
- `TB` - 테라바이트

### 11.7 Base64 데이터 변환

Spring Boot는 Base64로 인코딩된 바이너리 데이터 해결을 지원합니다.

```properties
my.property=base64:SGVsbG8gV29ybGQ=
```

`Resource` 프로퍼티는 리소스 경로를 제공하는 데도 사용할 수 있어 더욱 다양하게 활용할 수 있습니다.

## 12. @ConfigurationProperties 검증

Spring Boot는 Spring의 `@Validated` 어노테이션으로 어노테이션된 `@ConfigurationProperties` 클래스의 검증을 시도합니다.

### 12.1 기본 검증

```java
import java.net.InetAddress;

import jakarta.validation.constraints.NotNull;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties("my.service")
@Validated
public class MyProperties {

    @NotNull
    private InetAddress remoteAddress;

    // getter/setter 메서드들...

    public InetAddress getRemoteAddress() {
        return this.remoteAddress;
    }

    public void setRemoteAddress(InetAddress remoteAddress) {
        this.remoteAddress = remoteAddress;
    }
}
```

### 12.2 중첩 검증

중첩 프로퍼티에 검증을 적용하려면 관련 필드에 `@Valid`를 어노테이션해야 합니다.

```java
import java.net.InetAddress;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties("my.service")
@Validated
public class MyProperties {

    @NotNull
    private InetAddress remoteAddress;

    @Valid
    private final Security security = new Security();

    // getter/setter 메서드들...

    public static class Security {

        @NotEmpty
        private String username;

        // getter/setter 메서드들...

        public String getUsername() {
            return this.username;
        }

        public void setUsername(String username) {
            this.username = username;
        }
    }
}
```

### 12.3 커스텀 Validator

`configurationPropertiesValidator`라는 빈 정의를 생성하여 커스텀 Spring Validator를 추가할 수도 있습니다.

:::warning[static 메서드 권장]
`@Bean` 메서드는 static으로 선언해야 합니다. configuration properties validator는 애플리케이션 라이프사이클 초기에 생성되므로, `@Bean` 메서드를 static으로 선언하면 `@Configuration` 클래스를 인스턴스화하지 않고도 빈을 생성할 수 있습니다.
:::

:::info[Actuator 지원]
`spring-boot-actuator` 모듈에는 모든 `@ConfigurationProperties` 빈을 노출하는 엔드포인트가 포함되어 있습니다. 웹 브라우저에서 `/actuator/configprops`를 가리키거나 동등한 JMX 엔드포인트를 사용하세요.
:::

## 13. @ConfigurationProperties vs @Value

`@Value` 어노테이션은 핵심 컨테이너 기능이지만 type-safe configuration properties와 동일한 기능을 제공하지 않습니다.

### 13.1 기능 비교

| 기능 | @ConfigurationProperties | @Value |
|------|-------------------------|--------|
| 유연한 바인딩 | 예 | 제한적 |
| 메타데이터 지원 | 예 | 아니오 |
| SpEL 평가 | 아니오 | 예 |

### 13.2 @Value 사용 시 권장사항

`@Value`를 사용하고 싶다면 정규 형식(소문자만 사용하는 케밥 케이스)을 사용하여 프로퍼티 이름을 참조하는 것을 권장합니다.

```java
// 권장
@Value("${demo.item-price}")

// 비권장  
@Value("${demo.itemPrice}")
```

:::tip[최종 권장사항]
자체 컴포넌트에 대한 설정 키 세트를 정의하는 경우, `@ConfigurationProperties`로 어노테이션된 POJO로 그룹화하는 것을 권장합니다. 이렇게 하면 자체 빈에 주입할 수 있는 구조화되고 type-safe한 객체를 제공할 수 있습니다.
:::

### 13.3 SpEL 표현식 주의사항

:::warning[SpEL 처리 시점]
애플리케이션 프로퍼티 파일의 SpEL 표현식은 파일을 파싱하고 환경을 채울 때 처리되지 않습니다. 하지만 `@Value`에서 SpEL 표현식을 작성하는 것은 가능합니다. 애플리케이션 프로퍼티 파일의 프로퍼티 값이 SpEL 표현식인 경우 `@Value`를 통해 사용될 때 평가됩니다.
:::

---

이 문서는 Spring Boot의 Type-Safe Configuration Properties에 대한 포괄적인 가이드입니다. 실제 프로젝트에서 구조화되고 안전한 설정 관리를 위해 `@ConfigurationProperties`를 적극 활용해보세요.
