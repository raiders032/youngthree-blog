---
title: "Spring MVC ResponseBodyAdvice 완벽 가이드"
description: "Spring MVC에서 HTTP 응답 본문을 가로채서 수정할 수 있는 ResponseBodyAdvice 인터페이스에 대해 상세히 알아봅니다. 기본 개념부터 실제 구현 방법, 활용 사례까지 실제 예제 코드와 함께 설명합니다."
tags: ["RESPONSE_BODY_ADVICE", "SPRING_MVC", "WEB_MVC", "SPRING", "BACKEND", "JAVA", "HTTP", "INTERCEPTOR"]
keywords: ["ResponseBodyAdvice", "응답 인터셉터", "HTTP 응답", "Spring MVC", "컨트롤러 어드바이스", "@ControllerAdvice", "HttpMessageConverter", "응답 가로채기", "응답 수정", "백엔드"]
draft: false
hide_title: true
---

## 1. ResponseBodyAdvice 소개

### 1.1 개념

- `ResponseBodyAdvice`는 Spring MVC에서 `@ResponseBody` 또는 `ResponseEntity`를 사용하는 컨트롤러 메서드의 실행 후, HttpMessageConverter로 응답 본문이 작성되기 전에 응답을 커스터마이징할 수 있게 해주는 인터페이스입니다.
- 컨트롤러가 반환한 데이터가 실제 HTTP 응답으로 변환되기 직전에 가로채서 수정할 수 있는 기능을 제공합니다.

### 1.2 주요 특징

- Spring 4.1부터 도입된 인터페이스입니다.
- HTTP 응답 본문을 전역적으로 가로채고 수정할 수 있습니다.
- `@ControllerAdvice`와 함께 사용하면 자동으로 감지되어 등록됩니다.
  - 또한 `@ControllerAdvice` 어노테이션과 함께 사용되어 여러 컨트롤러에 걸쳐 응답 본문에 전역적인 변경사항을 적용할 때 활용됩니다.
- `RequestMappingHandlerAdapter`와 `ExceptionHandlerExceptionResolver`에 직접 등록할 수도 있습니다.

## 2. ResponseBodyAdvice 인터페이스 구조

### 2.1 인터페이스 정의

```java
public interface ResponseBodyAdvice<T> {
    
    boolean supports(MethodParameter returnType, 
                    Class<? extends HttpMessageConverter<?>> converterType);
    
    @Nullable
    T beforeBodyWrite(@Nullable T body,
                     MethodParameter returnType,
                     MediaType selectedContentType,
                     Class<? extends HttpMessageConverter<?>> selectedConverterType,
                     ServerHttpRequest request,
                     ServerHttpResponse response);
}
```

### 2.2 메서드 상세 설명

#### 2.2.1 supports 메서드

```java
boolean supports(MethodParameter returnType, 
                Class<? extends HttpMessageConverter<?>> converterType)
```

- **역할**: 이 컴포넌트가 주어진 컨트롤러 메서드의 반환 타입과 선택된 HttpMessageConverter 타입을 지원하는지 확인
- **매개변수**:
  - `returnType`: 컨트롤러 메서드의 반환 타입
  - `converterType`: 선택된 컨버터 타입
- **반환값**: `beforeBodyWrite` 메서드가 호출되어야 하면 `true`, 아니면 `false`

#### 2.2.2 beforeBodyWrite 메서드

```java
@Nullable
T beforeBodyWrite(@Nullable T body,
                 MethodParameter returnType,
                 MediaType selectedContentType,
                 Class<? extends HttpMessageConverter<?>> selectedConverterType,
                 ServerHttpRequest request,
                 ServerHttpResponse response)
```

- **역할**: HttpMessageConverter가 선택된 후, write 메서드가 호출되기 직전에 실행
- **매개변수**:
  - `body`: 작성될 응답 본문
  - `returnType`: 컨트롤러 메서드의 반환 타입
  - `selectedContentType`: 콘텐츠 협상을 통해 선택된 콘텐츠 타입
  - `selectedConverterType`: 응답에 쓰기 위해 선택된 컨버터 타입
  - `request`: 현재 요청
  - `response`: 현재 응답
- **반환값**: 전달받은 본문 또는 수정된(새로운) 인스턴스

## 3. 동작 원리와 실행 순서

### 3.1 Spring MVC 요청 처리 흐름에서의 위치

1. **클라이언트 요청** → Spring 애플리케이션으로 HTTP 요청이 들어옵니다.
2. **DispatcherServlet** → 모든 요청을 받아 처리를 시작합니다.
3. **HandlerMapping** → 요청 URL에 맞는 컨트롤러 메서드를 찾습니다.
4. **HandlerAdapter** → 찾은 컨트롤러 메서드를 실행할 어댑터를 선택합니다.
5. **Controller 메서드 실행** → 실제 비즈니스 로직이 처리되고 결과가 반환됩니다.
6. **반환값 처리** → 컨트롤러가 반환한 값을 HTTP 응답으로 변환하는 과정이 시작됩니다.
7. **ResponseBodyAdvice.supports() 호출** → 등록된 모든 ResponseBodyAdvice에 대해 지원 여부를 확인합니다.
8. **supports() 결과 판단**:
   - `true`인 경우: **ResponseBodyAdvice.beforeBodyWrite() 호출** → 응답 본문을 수정할 기회를 제공합니다.
   - `false`인 경우: 바로 다음 단계로 진행합니다.
9. **HttpMessageConverter 선택** → 응답 데이터를 HTTP 형식으로 변환할 컨버터를 선택합니다.
10. **HTTP 응답 본문 작성** → 최종 응답 본문이 작성됩니다.
11. **클라이언트에게 응답** → 완성된 HTTP 응답이 클라이언트로 전송됩니다.

### 3.2 실행 순서

1. **컨트롤러 메서드 실행 완료**
2. **ResponseBodyAdvice.supports() 호출**: 등록된 모든 ResponseBodyAdvice에 대해 지원 여부 확인
3. **ResponseBodyAdvice.beforeBodyWrite() 호출**: 지원하는 advice에 대해 응답 본문 수정 기회 제공
4. **HttpMessageConverter 선택 및 실행**: 최종 응답 본문을 HTTP 응답으로 변환

## 4. 기본 구현 예제

### 4.1 간단한 ResponseBodyAdvice 구현

```java
@ControllerAdvice
public class GlobalResponseBodyAdvice implements ResponseBodyAdvice<Object> {
    
    @Override
    public boolean supports(MethodParameter returnType, 
                           Class<? extends HttpMessageConverter<?>> converterType) {
        // 모든 응답에 대해 적용
        return true;
    }
    
    @Override
    public Object beforeBodyWrite(Object body, 
                                 MethodParameter returnType,
                                 MediaType selectedContentType, 
                                 Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                 ServerHttpRequest request, 
                                 ServerHttpResponse response) {
        
        // 모든 응답을 표준 형식으로 래핑
        if (body instanceof ApiResponse) {
            return body; // 이미 래핑된 경우
        }
        
        return ApiResponse.success(body);
    }
}
```

### 4.2 표준 응답 형식 클래스

```java
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    
    private ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data);
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
    
    // getter 메서드들...
}
```

## 5. 실용적인 활용 사례

### 5.1 보안 헤더 추가

```java
@ControllerAdvice
public class SecurityHeaderAdvice implements ResponseBodyAdvice<Object> {
    
    @Override
    public boolean supports(MethodParameter returnType, 
                           Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }
    
    @Override
    public Object beforeBodyWrite(Object body, 
                                 MethodParameter returnType,
                                 MediaType selectedContentType, 
                                 Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                 ServerHttpRequest request, 
                                 ServerHttpResponse response) {
        
        // 보안 헤더 추가
        response.getHeaders().add("X-Content-Type-Options", "nosniff");
        response.getHeaders().add("X-Frame-Options", "DENY");
        response.getHeaders().add("X-XSS-Protection", "1; mode=block");
        
        return body;
    }
}
```

### 5.2 민감한 정보 마스킹

```java
@ControllerAdvice
public class DataMaskingAdvice implements ResponseBodyAdvice<Object> {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public boolean supports(MethodParameter returnType, 
                           Class<? extends HttpMessageConverter<?>> converterType) {
        // JSON 응답에만 적용
        return converterType.equals(MappingJackson2HttpMessageConverter.class);
    }
    
    @Override
    public Object beforeBodyWrite(Object body, 
                                 MethodParameter returnType,
                                 MediaType selectedContentType, 
                                 Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                 ServerHttpRequest request, 
                                 ServerHttpResponse response) {
        
        if (body instanceof User) {
            User user = (User) body;
            // 개인정보 마스킹
            user.setPhoneNumber(maskPhoneNumber(user.getPhoneNumber()));
            user.setEmail(maskEmail(user.getEmail()));
        }
        
        return body;
    }
    
    private String maskPhoneNumber(String phone) {
        if (phone == null || phone.length() < 4) return phone;
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }
    
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String masked = parts[0].substring(0, Math.min(2, parts[0].length())) + "***";
        return masked + "@" + parts[1];
    }
}
```

## 6. 조건부 적용 및 필터링

### 6.1 특정 컨트롤러에만 적용

```java
@ControllerAdvice(basePackages = "com.example.api.v1")
public class V1ResponseAdvice implements ResponseBodyAdvice<Object> {
    
    @Override
    public boolean supports(MethodParameter returnType, 
                           Class<? extends HttpMessageConverter<?>> converterType) {
        // v1 패키지의 컨트롤러에만 적용
        return returnType.getContainingClass().getPackage().getName()
                .startsWith("com.example.api.v1");
    }
    
    // ...
}
```

### 6.2 특정 어노테이션이 있는 메서드에만 적용

```java
// 커스텀 어노테이션 정의
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface WrapResponse {
}

@ControllerAdvice
public class ConditionalResponseAdvice implements ResponseBodyAdvice<Object> {
    
    @Override
    public boolean supports(MethodParameter returnType, 
                           Class<? extends HttpMessageConverter<?>> converterType) {
        // @WrapResponse 어노테이션이 있는 메서드에만 적용
        return returnType.hasMethodAnnotation(WrapResponse.class);
    }
    
    @Override
    public Object beforeBodyWrite(Object body, 
                                 MethodParameter returnType,
                                 MediaType selectedContentType, 
                                 Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                 ServerHttpRequest request, 
                                 ServerHttpResponse response) {
        
        return ApiResponse.success(body);
    }
}
```

## 7. 고급 활용 및 주의사항

### 7.1 성능 고려사항

:::warning[성능 주의사항]
ResponseBodyAdvice는 모든 응답에 대해 실행되므로 성능에 영향을 줄 수 있습니다. `supports()` 메서드를 효율적으로 구현하여 불필요한 처리를 피해야 합니다.
:::

```java
@ControllerAdvice
public class OptimizedResponseAdvice implements ResponseBodyAdvice<Object> {
    
    private final Set<Class<?>> supportedTypes = Set.of(
        User.class, Product.class, Order.class
    );
    
    @Override
    public boolean supports(MethodParameter returnType, 
                           Class<? extends HttpMessageConverter<?>> converterType) {
        // 빠른 타입 체크로 성능 최적화
        Class<?> returnClass = returnType.getParameterType();
        return supportedTypes.contains(returnClass);
    }
    
    // ...
}
```

### 7.2 예외 처리

```java
@ControllerAdvice
public class SafeResponseAdvice implements ResponseBodyAdvice<Object> {
    
    private static final Logger logger = LoggerFactory.getLogger(SafeResponseAdvice.class);
    
    @Override
    public Object beforeBodyWrite(Object body, 
                                 MethodParameter returnType,
                                 MediaType selectedContentType, 
                                 Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                 ServerHttpRequest request, 
                                 ServerHttpResponse response) {
        
        try {
            return processResponse(body);
        } catch (Exception e) {
            logger.error("Error processing response in ResponseBodyAdvice", e);
            // 예외 발생 시 원본 반환
            return body;
        }
    }
    
    private Object processResponse(Object body) {
        // 응답 처리 로직
        return body;
    }
}
```

### 7.3 다중 ResponseBodyAdvice 순서 제어

```java
@ControllerAdvice
@Order(1) // 높은 우선순위
public class HighPriorityAdvice implements ResponseBodyAdvice<Object> {
    // ...
}

@ControllerAdvice
@Order(2) // 낮은 우선순위
public class LowPriorityAdvice implements ResponseBodyAdvice<Object> {
    // ...
}
```

## 참고 자료

- [Spring Framework Reference - ResponseBodyAdvice](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/ResponseBodyAdvice.html)
- [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring MVC Documentation](https://docs.spring.io/spring-framework/reference/web/webmvc.html)
