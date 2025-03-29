---
title: "Spring의 HTTP Message Converter 완벽 가이드"
description: "Spring Framework의 HTTP Message Converter에 대해 상세히 알아봅니다. HTTP 요청과 응답의 본문을 다양한 형식으로 변환하는 방법, 주요 구현체들의 특징, 실제 적용 사례까지 자세히 설명합니다. RESTful API 개발에 필수적인 지식을 얻을 수 있는 가이드입니다."
tags: ["HTTP_MESSAGE_CONVERTER", "SPRING_MVC", "REST_API", "SPRING", "BACKEND", "JAVA", "WEB"]
keywords: ["HTTP 메시지 컨버터", "HTTP Message Converter", "스프링", "Spring", "스프링부트", "Spring Boot", "REST", "RESTful", "API", "JSON 변환", "XML 변환", "컨텐츠 타입", "Content-Type", "미디어 타입", "MIME 타입"]
draft: false
hide_title: true
---

## 1. HTTP Message Converter 소개

- Spring Framework의 HTTP Message Converter는 HTTP 요청과 응답의 본문을 자바 객체로 변환하거나, 자바 객체를 HTTP 응답 본문으로 변환하는 인터페이스입니다.
- `spring-web` 모듈에 포함된 `HttpMessageConverter` 인터페이스는 `InputStream`과 `OutputStream`을 통해 HTTP 요청과 응답의 본문을 읽고 쓰는 기능을 제공합니다.
- HTTP Message Converter는 클라이언트 측(예: RestClient, RestTemplate)과 서버 측(예: Spring MVC REST 컨트롤러)에서 모두 사용됩니다.

### 1.1 주요 특징

- 다양한 미디어 타입(MIME 타입)에 대한 구체적인 구현체가 프레임워크에 기본 제공됩니다.
- 클라이언트 측에서는 RestClient와 RestTemplate에 기본적으로 등록됩니다.
- 서버 측에서는 RequestMappingHandlerAdapter에 기본적으로 등록됩니다.
- 각 컨버터는 기본 미디어 타입을 가지고 있으며, `supportedMediaTypes` 속성을 설정하여 재정의할 수 있습니다.

### 1.2 HttpMessageConverter 인터페이스

```java
package org.springframework.http.converter;

public interface HttpMessageConverter<T> {
    boolean canRead(Class<?> clazz, @Nullable MediaType mediaType);
    boolean canWrite(Class<?> clazz, @Nullable MediaType mediaType);
    List<MediaType> getSupportedMediaTypes();
    T read(Class<? extends T> clazz, HttpInputMessage inputMessage)
        throws IOException, HttpMessageNotReadableException;
    void write(T t, @Nullable MediaType contentType, HttpOutputMessage outputMessage)
        throws IOException, HttpMessageNotWritableException;
}
```

- canRead(), canWrite(): 메시지 컨버터가 해당 클래스, 미디어타입을 지원하는지 체크합니다.
- getSupportedMediaTypes(): 메시지 컨버터가 지원하는 미디어 타입을 반환합니다.
- read(), write(): HTTP 요청과 응답의 본문을 읽고 쓰는 메서드입니다.

### 1.3 동작 과정

# HTTP 요청/응답 처리 과정

## 요청 데이터 읽기

- 컨트롤러에서 HttpEntity나 @RequestBody를 사용할 때 메시지 컨버터가 동작
- 메시지 컨버터는 다음 조건을 확인하여 `canRead()` 호출:
	- 대상 클래스 타입을 지원하는지 (byte[], String, HelloData 등)
	- HTTP 요청의 Content-Type 미디어 타입을 지원하는지 (text/plain, application/json, */* 등)
- 조건이 만족되면 `read()` 메서드를 호출하여 객체를 생성하고 반환

## 응답 데이터 쓰기

- 컨트롤러에서 @ResponseBody나 HttpEntity로 값을 반환할 때 메시지 컨버터가 동작
- 메시지 컨버터는 다음 조건을 확인하여 `canWrite()` 호출:
	- 반환 대상 클래스 타입을 지원하는지 (byte[], String, HelloData 등)
	- HTTP 요청의 Accept 미디어 타입을 지원하는지 (text/plain, application/json, */* 등)
	- 또는 @RequestMapping의 produces 속성에 지정된 미디어 타입을 지원하는지
- 조건이 만족되면 `write()` 메서드를 호출하여 HTTP 응답 메시지 바디에 데이터를 생성

## 2. 주요 HttpMessageConverter 구현체

- Spring Framework는 다양한 데이터 형식을 처리하기 위한 여러 HTTP Message Converter 구현체를 제공합니다.
- 각 구현체는 특정 미디어 타입과 자바 객체 간의 변환을 담당합니다.

### 2.1 StringHttpMessageConverter

- 문자열 인스턴스를 HTTP 요청과 응답으로부터 읽고 쓸 수 있는 구현체입니다.
- 기본적으로 모든 텍스트 미디어 타입(`text/*`)을 지원합니다.
- Content-Type은 `text/plain`으로 작성됩니다.

### 2.2 FormHttpMessageConverter

- 폼 데이터를 HTTP 요청과 응답으로부터 읽고 쓸 수 있는 구현체입니다.
- 기본적으로 `application/x-www-form-urlencoded` 미디어 타입을 읽고 씁니다.
- 폼 데이터는 `MultiValueMap<String, String>`으로 읽고 쓰여집니다.
- 또한 `MultiValueMap<String, Object>`에서 읽은 멀티파트 데이터를 쓸 수 있습니다(읽을 수는 없음).
- 기본적으로 `multipart/form-data`를 지원합니다.
- 폼 데이터 작성을 위한 추가적인 멀티파트 하위 타입이 지원될 수 있습니다.

### 2.3 ByteArrayHttpMessageConverter

- 바이트 배열을 HTTP 요청과 응답으로부터 읽고 쓸 수 있는 구현체입니다.
- 기본적으로 모든 미디어 타입(`*/*`)을 지원합니다.
- Content-Type은 `application/octet-stream`으로 작성됩니다.
- `supportedMediaTypes` 속성을 설정하고 `getContentType(byte[])` 메서드를 재정의하여 변경할 수 있습니다.

### 2.4 MarshallingHttpMessageConverter

- Spring의 `Marshaller`와 `Unmarshaller` 추상화를 사용하여 XML을 읽고 쓸 수 있는 구현체입니다.
- `org.springframework.oxm` 패키지의 추상화를 활용합니다.
- 사용하기 전에 `Marshaller`와 `Unmarshaller`가 필요하며, 생성자나 빈 속성을 통해 주입할 수 있습니다.
- 기본적으로 `text/xml`과 `application/xml`을 지원합니다.

### 2.5 MappingJackson2HttpMessageConverter

- Jackson의 `ObjectMapper`를 사용하여 JSON을 읽고 쓸 수 있는 구현체입니다.
- Jackson이 제공하는 어노테이션을 통해 JSON 매핑을 필요에 맞게 사용자 정의할 수 있습니다.
- 추가적인 제어가 필요한 경우(특정 타입에 대해 사용자 정의 JSON 직렬화/역직렬화가 필요한 경우), `ObjectMapper` 속성을 통해 사용자 정의 `ObjectMapper`를 주입할 수 있습니다.
- 기본적으로 `application/json`을 지원합니다.
- 이 컨버터를 사용하려면 `com.fasterxml.jackson.core:jackson-databind` 의존성이 필요합니다.

:::info
JSON 처리를 위한 Jackson 라이브러리는 Spring Boot에서 기본적으로 포함되어 있습니다. 하지만 순수 Spring 프로젝트를 사용하는 경우 별도로 의존성을 추가해야 합니다.
:::

### 2.6 MappingJackson2XmlHttpMessageConverter

- Jackson XML 확장의 `XmlMapper`를 사용하여 XML을 읽고 쓸 수 있는 구현체입니다.
- JAXB 또는 Jackson이 제공하는 어노테이션을 통해 XML 매핑을 필요에 맞게 사용자 정의할 수 있습니다.
- 추가적인 제어가 필요한 경우, `ObjectMapper` 속성을 통해 사용자 정의 `XmlMapper`를 주입할 수 있습니다.
- 기본적으로 `application/xml`을 지원합니다.
- 이 컨버터를 사용하려면 `com.fasterxml.jackson.dataformat:jackson-dataformat-xml` 의존성이 필요합니다.

### 2.7 MappingJackson2CborHttpMessageConverter

- CBOR(Concise Binary Object Representation) 형식으로 데이터를 처리할 수 있는 구현체입니다.
- `com.fasterxml.jackson.dataformat:jackson-dataformat-cbor` 의존성이 필요합니다.

### 2.8 SourceHttpMessageConverter

- `javax.xml.transform.Source`를 HTTP 요청과 응답으로부터 읽고 쓸 수 있는 구현체입니다.
- `DOMSource`, `SAXSource`, `StreamSource`만 지원됩니다.
- 기본적으로 `text/xml`과 `application/xml`을 지원합니다.

### 2.9 GsonHttpMessageConverter

- Google의 Gson을 사용하여 JSON을 읽고 쓸 수 있는 구현체입니다.
- 이 컨버터를 사용하려면 `com.google.code.gson:gson` 의존성이 필요합니다.

### 2.10 JsonbHttpMessageConverter

- Jakarta Json Bind API를 사용하여 JSON을 읽고 쓸 수 있는 구현체입니다.
- 이 컨버터를 사용하려면 `jakarta.json.bind:jakarta.json.bind-api` 의존성과 구현체가 필요합니다.

### 2.11 ProtobufHttpMessageConverter

- Protobuf 메시지를 이진 형식으로 읽고 쓸 수 있는 구현체입니다.
- `application/x-protobuf` 콘텐츠 타입을 사용합니다.
- 이 컨버터를 사용하려면 `com.google.protobuf:protobuf-java` 의존성이 필요합니다.

### 2.12 ProtobufJsonFormatHttpMessageConverter

- JSON 문서와 Protobuf 메시지 간의 변환을 지원하는 구현체입니다.
- 이 컨버터를 사용하려면 `com.google.protobuf:protobuf-java-util` 의존성이 필요합니다.

## 3. HTTP Message Converter 설정 방법

- Spring MVC에서 HTTP Message Converter를 설정하는 방법은 여러 가지가 있습니다.
- Java 설정과 XML 설정 모두 지원됩니다.

### 3.1 Java 설정을 통한 설정

#### WebMvcConfigurer를 통한 설정
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        // 기본 컨버터를 모두 제거하고 새로운 컨버터만 사용
        converters.add(new MappingJackson2HttpMessageConverter());
        converters.add(new StringHttpMessageConverter());
    }
    
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        // 기본 컨버터를 유지하면서 추가 또는 수정
        converters.add(new MappingJackson2XmlHttpMessageConverter());
    }
}
```

- 이 설정을 통해 Spring MVC가 사용하는 HTTP Message Converter를 사용자 정의할 수 있습니다.

### 3.2 Spring Boot에서의 설정

- Spring Boot는 자동 구성을 통해 많은 HTTP Message Converter를 자동으로 등록합니다.
- 클래스패스에 특정 라이브러리가 있으면 해당 컨버터를 자동으로 등록합니다.

#### 커스텀 ObjectMapper 설정
```java
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return objectMapper;
    }
}
```

Spring Boot는 이렇게 정의된 ObjectMapper 빈을 자동으로 사용합니다.

## 4. 사용 사례

### 4.1 REST 컨트롤러에서의 사용

- Spring MVC REST 컨트롤러에서는 HTTP Message Converter가 자동으로 사용됩니다.
- `@RequestBody`와 `@ResponseBody` 어노테이션이 HTTP Message Converter를 사용합니다.

#### 예시 코드
```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        // user 객체는 HTTP 요청 본문에서 변환됩니다.
        // 반환되는 user 객체는 HTTP 응답 본문으로 변환됩니다.
        return ResponseEntity.ok(user);
    }
}
```

### 4.2 RestTemplate에서의 사용

- RestTemplate은 HTTP 클라이언트로서 HTTP Message Converter를 사용합니다.

#### 예시 코드
```java
RestTemplate restTemplate = new RestTemplate();
User user = new User("John", "Doe");
User response = restTemplate.postForObject("https://example.com/api/users", user, User.class);
```

### 4.3 RestClient에서의 사용

- RestClient는 RestTemplate의 대안으로 제공되는 최신 HTTP 클라이언트입니다.

#### 예시 코드
```java
RestClient restClient = RestClient.create();
User user = new User("John", "Doe");
User response = restClient.post()
                          .uri("https://example.com/api/users")
                          .body(user)
                          .retrieve()
                          .body(User.class);
```

## 5. 주의 사항 및 팁

- Content-Type과 Accept 헤더는 HTTP Message Converter 선택에 중요한 역할을 합니다.
- JSON이 기본 형식이지만, XML이나 다른 형식도 필요에 따라 사용할 수 있습니다.
- 커스텀 HTTP Message Converter를 구현

## 6. Argument Resolver와 관계

- 요청의 경우 @RequestBody를 처리하는 ArgumentResolver가 있고, ArgumentResolver가 있습니다.
  - 이 Argument Resolver들이 HTTP Message Converter를 사용하여 요청 본문을 읽습니다.
- 응답의 경우 @ResponseBody와 HttpEntity를 처리하는 ReturnValueHandler가 따로 있습니다.
  - 이 ReturnValueHandler들이 HTTP Message Converter를 사용하여 응답 본문을 작성합니다.
- [ArgumentResolver 참고](../ArgumentResolver/ArgumentResolver.md)

## 참고

- https://docs.spring.io/spring-framework/reference/web/webmvc/message-converters.html