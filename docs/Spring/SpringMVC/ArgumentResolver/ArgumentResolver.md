---
title: "Spring MVC의 Argument Resolver 완벽 가이드"
description: "Spring MVC에서 컨트롤러 메서드의 파라미터를 처리하는 핵심 메커니즘인 Argument Resolver에 대해 상세히 알아봅니다. 기본 개념부터 동작 원리, 커스텀 구현 방법까지 실제 예제 코드와 함께 설명합니다."
tags: ["ARGUMENT_RESOLVER", "SPRING_MVC", "WEB_MVC", "SPRING", "BACKEND", "JAVA", "WEB"]
keywords: ["아규먼트 리졸버", "argument resolver", "핸들러메소드아규먼트리졸버", "HandlerMethodArgumentResolver", "스프링", "Spring", "스프링 MVC", "Spring MVC", "컨트롤러", "파라미터 바인딩", "파라미터 처리", "커스텀 어노테이션", "웹 개발", "백엔드"]
draft: false
hide_title: true
---

## 1. Argument Resolver 소개

- Spring MVC의 Argument Resolver는 컨트롤러 메서드의 파라미터를 어떻게 처리하고 바인딩할지 결정하는 핵심 메커니즘입니다.
- 정식 이름은 `HandlerMethodArgumentResolver`로, 컨트롤러 메서드(핸들러)가 호출될 때 메서드의 파라미터 값을 결정하는 역할을 담당합니다.
- 이 인터페이스는 HTTP 요청에서 데이터를 추출하여 컨트롤러 메서드의 파라미터로 변환하는 과정을 처리합니다.

### 1.1 주요 역할

- HTTP 요청의 여러 부분(경로 변수, 쿼리 파라미터, 헤더, 쿠키, 세션, 요청 본문 등)에서 데이터를 추출합니다.
- 추출한 데이터를 컨트롤러 메서드 파라미터의 타입에 맞게 변환합니다.
- 어노테이션을 기반으로 특정 파라미터에 값을 주입하는 방법을 결정합니다.

## 2. HandlerMethodArgumentResolver 인터페이스

- `HandlerMethodArgumentResolver` 인터페이스는 두 개의 핵심 메서드로 구성됩니다.

### 2.1 인터페이스 구조

```java
public interface HandlerMethodArgumentResolver {
    
    boolean supportsParameter(MethodParameter parameter);
    
    Object resolveArgument(MethodParameter parameter, 
                          ModelAndViewContainer mavContainer,
                          NativeWebRequest webRequest, 
                          WebDataBinderFactory binderFactory) throws Exception;
}
```

- `supportsParameter`: 이 리졸버가 주어진 파라미터를 지원하는지 확인합니다.
- `resolveArgument`: 지원되는 파라미터에 대해 실제 값을 결정합니다.
- [참고](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/method/support/HandlerMethodArgumentResolver.html)

### 2.2 동작 원리

1. Spring MVC는 컨트롤러 메서드가 호출될 때 모든 등록된 `HandlerMethodArgumentResolver`에 대해 `supportsParameter` 메서드를 호출하여 각 파라미터를 처리할 수 있는 리졸버를 찾습니다.
2. 적합한 리졸버를 찾으면 `resolveArgument` 메서드를 호출하여 실제 파라미터 값을 결정합니다.
3. 이 값은 컨트롤러 메서드를 호출할 때 해당 파라미터로 전달됩니다.

## 3. Spring MVC의 기본 Argument Resolver

- Spring MVC는 다양한 상황에 맞게 여러 Argument Resolver를 기본으로 제공합니다.

### 3.1 주요 내장 Argument Resolver

- `RequestParamMethodArgumentResolver`: `@RequestParam` 어노테이션이 붙은 파라미터 처리
- `PathVariableMethodArgumentResolver`: `@PathVariable` 어노테이션이 붙은 파라미터 처리
- `RequestHeaderMethodArgumentResolver`: `@RequestHeader` 어노테이션이 붙은 파라미터 처리
- `CookieValueMethodArgumentResolver`: `@CookieValue` 어노테이션이 붙은 파라미터 처리
- `ModelMethodProcessor`: `Model` 타입의 파라미터 처리
- `RequestResponseBodyMethodProcessor`: `@RequestBody` 및 `@ResponseBody` 어노테이션이 붙은 파라미터 처리
- `SessionAttributeMethodArgumentResolver`: `@SessionAttribute` 어노테이션이 붙은 파라미터 처리
- `ServletRequestMethodArgumentResolver`: `HttpServletRequest` 및 관련 타입의 파라미터 처리
- `ServletResponseMethodArgumentResolver`: `HttpServletResponse` 및 관련 타입의 파라미터 처리
- [참고](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/method/support/HandlerMethodArgumentResolver.html)

### 3.2 동작 예시

```java
@RestController
@RequestMapping("/users")
public class UserController {
    
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id,
                       @RequestParam(required = false) String name,
                       @RequestHeader("User-Agent") String userAgent,
                       HttpServletRequest request) {
        // ...
    }
    
    @PostMapping
    public User createUser(@RequestBody User user) {
        // ...
    }
}
```

이 예시에서:
- `@PathVariable Long id`: `PathVariableMethodArgumentResolver`가 처리
- `@RequestParam String name`: `RequestParamMethodArgumentResolver`가 처리
- `@RequestHeader String userAgent`: `RequestHeaderMethodArgumentResolver`가 처리
- `HttpServletRequest request`: `ServletRequestMethodArgumentResolver`가 처리
- `@RequestBody User user`: `RequestResponseBodyMethodProcessor`가 처리

## 4. 커스텀 Argument Resolver 구현

- 기본 제공되는 Argument Resolver만으로는 특정 요구사항을 충족하기 어려울 때 커스텀 리졸버를 구현할 수 있습니다.

### 4.1 구현 단계

1. 커스텀 어노테이션 정의 (필요한 경우)
2. `HandlerMethodArgumentResolver` 인터페이스 구현
3. 구현한 리졸버를 Spring MVC 설정에 등록

### 4.2 커스텀 어노테이션 예시

```java
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {
}
```

### 4.3 커스텀 리졸버 구현 예시

```java
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterType().equals(User.class) && 
               parameter.hasParameterAnnotation(CurrentUser.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, 
                                 ModelAndViewContainer mavContainer,
                                 NativeWebRequest webRequest, 
                                 WebDataBinderFactory binderFactory) throws Exception {
        HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);
        String token = extractTokenFromRequest(request);
        
        // 토큰에서 사용자 정보 추출 로직
        User currentUser = getUserFromToken(token);
        return currentUser;
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        // 요청에서 토큰 추출하는 로직
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
    
    private User getUserFromToken(String token) {
        // 토큰에서 사용자 정보를 가져오는 로직
        // 실제 구현은 JWT 파싱 등의 작업이 포함될 수 있음
        // ...
        return new User();
    }
}
```

### 4.4 리졸버 등록

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new CurrentUserArgumentResolver());
    }
}
```

### 4.5 컨트롤러에서 사용 예시

```java
@RestController
@RequestMapping("/api")
public class UserController {

    @GetMapping("/profile")
    public ResponseEntity<UserProfile> getUserProfile(@CurrentUser User user) {
        // @CurrentUser 어노테이션을 사용하면 CurrentUserArgumentResolver가 
        // 요청에서 현재 인증된 사용자 정보를 자동으로 주입
        UserProfile profile = userService.getProfile(user.getId());
        return ResponseEntity.ok(profile);
    }
}
```

## 5. Argument Resolver와 HttpMessageConverter의 관계

- Argument Resolver와 HttpMessageConverter는 서로 다른 역할을 하지만 함께 작동하는 경우가 있습니다.
- 특히 `@RequestBody` 어노테이션을 처리하는 `RequestResponseBodyMethodProcessor`는 HTTP 요청 본문을 Java 객체로 변환하기 위해 HttpMessageConverter를 사용합니다.

### 5.1 처리 흐름

1. `RequestResponseBodyMethodProcessor`(Argument Resolver)가 `@RequestBody` 어노테이션이 있는 파라미터를 발견합니다.
2. HTTP 요청의 Content-Type을 확인하여 적절한 HttpMessageConverter를 선택합니다.
3. 선택된 HttpMessageConverter가 HTTP 요청 본문을 지정된 Java 타입으로 변환합니다.
4. 변환된 객체가 컨트롤러 메서드의 파라미터로 전달됩니다.

### 5.2 관계 다이어그램

```
HTTP 요청 → DispatcherServlet → HandlerAdapter
                                       ↓
                               Argument Resolver
                                       ↓
                             (필요한 경우) HttpMessageConverter
                                       ↓
                                  컨트롤러 메서드
```

## 6. 성능 고려사항 및 모범 사례

### 6.1 성능 최적화

- Argument Resolver는 모든 요청 처리 시 호출되므로 성능에 영향을 줄 수 있습니다.
- `supportsParameter` 메서드는 매우 효율적으로 구현해야 합니다.
- 가능하면 `resolveArgument` 메서드 내에서 캐싱을 활용하여 반복적인 계산을 줄입니다.

### 6.2 모범 사례

- 한 가지 책임만 처리하는 집중된 Argument Resolver를 설계합니다.
- 예외 처리를 철저히 하여 사용자 친화적인 오류 메시지를 제공합니다.
- 디버깅을 위한 로깅을 적절히 추가합니다.
- 단위 테스트를 작성하여 리졸버가 예상대로 작동하는지 확인합니다.

```java
@Test
public void testCurrentUserArgumentResolver() {
    // 테스트 설정 및 모의 객체 생성
    CurrentUserArgumentResolver resolver = new CurrentUserArgumentResolver();
    MethodParameter parameter = // 파라미터 설정
    ModelAndViewContainer mavContainer = new ModelAndViewContainer();
    NativeWebRequest webRequest = // 웹 요청 모의 객체 설정
    WebDataBinderFactory binderFactory = // 바인더 팩토리 설정
    
    // 테스트 실행
    User user = (User) resolver.resolveArgument(parameter, mavContainer, webRequest, binderFactory);
    
    // 검증
    assertNotNull(user);
    assertEquals(expectedId, user.getId());
}
```