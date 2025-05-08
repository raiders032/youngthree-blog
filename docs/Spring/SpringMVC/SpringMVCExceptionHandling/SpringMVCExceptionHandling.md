---
title: "Spring MVC Exception Handling"
description: "스프링 MVC에서 제공하는 다양한 예외 처리 방법과 최적화 전략을 알아봅니다. @ExceptionHandler 어노테이션을 활용한 글로벌/로컬 예외 처리, 다양한 반환 타입, 적절한 응답 형식 구성, 그리고 @ControllerAdvice를 이용한 확장성 있는 예외 처리 아키텍처 구축 방법을 자세히 설명합니다."
tags: [ "EXCEPTION_HANDLING", "SPRING_MVC", "CONTROLLER_ADVICE", "SPRING", "BACKEND", "JAVA" ]
keywords: [ "스프링 예외 처리", "Spring Exception Handling", "ExceptionHandler", "ControllerAdvice", "RestControllerAdvice", "스프링 MVC", "Spring MVC", "예외 처리", "Exception Handling", "글로벌 예외 처리", "컨트롤러 어드바이스", "에러 응답", "스프링부트", "Spring Boot", "자바", "Java" ]
draft: false
hide_title: true
---

## 1. 스프링 MVC 예외 처리 개요

- 스프링 MVC는 애플리케이션에서 발생하는 예외를 우아하게 처리할 수 있는 다양한 메커니즘을 제공합니다.
- 예외 처리는 애플리케이션의 안정성과 사용자 경험 향상에 중요한 역할을 합니다.
- 스프링의 예외 처리 방식은 크게 다음과 같이 나뉩니다:
  - 컨트롤러 레벨의 `@ExceptionHandler`
  - 글로벌 레벨의 `@ControllerAdvice` 또는 `@RestControllerAdvice`
  - HTTP 상태 코드 기반의 오류 페이지

## 2. @ExceptionHandler 애노테이션

- `@ExceptionHandler` 애노테이션은 컨트롤러 또는 `@ControllerAdvice` 클래스 내에서 예외를 처리하는 메서드를 지정하는 데 사용됩니다.
- 이 애노테이션이 적용된 메서드는 지정된 예외 타입이 발생했을 때 자동으로 호출됩니다.

### 2.1 기본 사용법

- `@Controller`나 `@RestController` 클래스 내에서 사용할 수 있습니다.
- 처리하고자 하는 예외 타입을 지정하여 해당 예외가 발생했을 때 특정 응답을 반환할 수 있습니다.

#### 기본 예제 코드

```java
@Controller
public class SimpleController {

    @ExceptionHandler(IOException.class)
    public ResponseEntity<String> handle() {
        return ResponseEntity.internalServerError().body("Could not read file storage");
    }
}
```

- 이 예제는 `IOException`이 발생했을 때 500 상태 코드와 함께 에러 메시지를 반환합니다.

### 2.2 예외 매핑 방식

- 예외 매핑은 발생한 최상위 예외 또는 중첩된 원인 예외와 일치시킬 수 있습니다.
- 스프링 5.3부터는 임의의 깊이에 있는 원인 예외까지 매칭할 수 있습니다(이전 버전에서는 직접적인 원인만 고려했습니다).
- 여러 예외 메서드가 매칭될 때는 일반적으로 최상위 예외 매치가 원인 예외 매치보다 우선시됩니다.

#### 예외 매핑 예시

```text
ServiceException → DataAccessException → SQLException → IOException
```

- 위와 같은 예외 계층 구조에서 5.3 이전에는 IOException을 처리하는 핸들러가 있어도 ServiceException이나 그 직접적인 원인인 DataAccessException만 확인했기 때문에 매칭되지 않았습니다
- 하지만 5.3부터는 예외 체인을 깊게 탐색해서 IOException까지 확인하므로 해당 핸들러가 작동할 수 있게 되었습니다.

### 2.3 예외 매개변수 선언

```java
@ExceptionHandler({FileSystemException.class, RemoteException.class})
public ResponseEntity<String> handleIoException(IOException ex) {
    return ResponseEntity.internalServerError().body(ex.getMessage());
}
```

- 이 예제에서는 `FileSystemException`과 `RemoteException`을 처리하며, 이 두 예외는 모두 `IOException`을 확장합니다.

#### 2.4 일반 예외 타입 사용 예제

```java
@ExceptionHandler({FileSystemException.class, RemoteException.class})
public ResponseEntity<String> handleExceptions(Exception ex) {
    return ResponseEntity.internalServerError().body(ex.getMessage());
}
```

- 매개변수로 `Exception`을 사용하여 더 일반적인 시그니처를 가질 수 있습니다.

:::warning 예외 매칭 동작에 주의하세요. 최상위 예외와 원인 예외 매칭은 의외의 결과를 가져올 수 있습니다.
:::

- 최상위 예외와 원인 예외 매칭의 차이를 이해하는 것이 중요합니다:
  - `IOException` 변형에서는 메서드가 일반적으로 실제 `FileSystemException` 또는 `RemoteException` 인스턴스를 인자로 받습니다.
  - 그러나 이러한 예외가 `IOException` 래퍼 내에 전파되는 경우, 전달된 예외 인스턴스는 래퍼 예외입니다.
  - `handle(Exception)` 변형에서는 래핑 시나리오에서 항상 래퍼 예외와 함께 호출됩니다.
- 가능한 한 메서드 시그니처에서 구체적인 예외 타입을 사용하는 것이 좋습니다.
- 여러 예외를 처리하는 메서드를 각 특정 예외 타입에 대한 개별 `@ExceptionHandler` 메서드로 분리하는 것이 좋습니다.

### 2.4 미디어 타입 매핑

- `@ExceptionHandler` 메서드는 생성 가능한 미디어 타입을 선언할 수도 있습니다.
- 이를 통해 HTTP 클라이언트가 요청한 미디어 타입에 따라 오류 응답을 세분화할 수 있습니다.
- 일반적으로 "Accept" HTTP 요청 헤더를 기반으로 합니다.

#### 미디어 타입 매핑 예제

```java
@ExceptionHandler(produces = "application/json")
public ResponseEntity<ErrorMessage> handleJson(IllegalArgumentException exc) {
    return ResponseEntity.badRequest().body(new ErrorMessage(exc.getMessage(), 42));
}

@ExceptionHandler(produces = "text/html")
public String handle(IllegalArgumentException exc, Model model) {
    model.addAttribute("error", new ErrorMessage(exc.getMessage(), 42));
    return "errorView";
}
```

여기서는 동일한 예외 타입을 처리하지만 다른 미디어 타입으로 응답합니다. JSON을 요청하는 클라이언트에는 JSON 오류가 제공되고 브라우저에는 HTML 오류 뷰가 제공됩니다.

### 2.5 메서드 매개변수

`@ExceptionHandler` 메서드는 다음과 같은 매개변수를 지원합니다:

- **예외 타입**: 발생한 예외에 접근하기 위해 사용
- **HandlerMethod**: 예외를 발생시킨 컨트롤러 메서드에 접근하기 위해 사용
- **WebRequest, NativeWebRequest**: Servlet API 직접 사용 없이 요청 파라미터와 속성에 접근
- **ServletRequest, ServletResponse**: 요청이나 응답의 특정 타입에 접근
- **HttpSession**: 세션 존재 보장(null이 아님)
- **Principal**: 현재 인증된 사용자
- **HttpMethod**: 요청의 HTTP 메서드
- **Locale**: 현재 요청의 로케일
- **TimeZone, ZoneId**: 현재 요청과 관련된 시간대
- **OutputStream, Writer**: 원시 응답 본문에 접근
- **Map, Model, ModelMap**: 오류 응답 모델에 접근
- **RedirectAttributes**: 리디렉션 시 사용할 속성 지정
- **@SessionAttribute**: 세션 속성에 접근
- **@RequestAttribute**: 요청 속성에 접근

:::note 세션 접근은 스레드 안전하지 않습니다. 여러 요청이 세션에 동시에 접근하는 경우 `RequestMappingHandlerAdapter` 인스턴스의 `synchronizeOnSession` 플래그를
`true`로 설정하는 것을 고려하세요.
:::

### 2.6 반환 값

`@ExceptionHandler` 메서드는 다음과 같은 반환 값을 지원합니다:
  - **@ResponseBody**: 반환값이 `HttpMessageConverter`를 통해 변환되고 응답에 작성됩니다.
  - **`HttpEntity<B>`, `ResponseEntity<B>`**: 반환값이 헤더와 본문을 포함한 전체 응답을 지정합니다.
  - **ErrorResponse**: RFC 9457 오류 응답을 본문의 세부 정보와 함께 렌더링합니다.
  - **ProblemDetail**: RFC 9457 오류 응답을 본문의 세부 정보와 함께 렌더링합니다.
  - **String**: `ViewResolver`를 통해 해석될 뷰 이름
  - **View**: 렌더링에 사용할 `View` 인스턴스
  - **Map, Model**: 암시적 모델에 추가될 속성
  - **@ModelAttribute**: 암시적 모델에 추가될 속성
  - **ModelAndView**: 사용할 뷰와 모델 속성, 선택적으로 응답 상태
  - **void**: 메서드가 응답을 완전히 처리한 것으로 간주됩니다.
  - **기타 반환값**: 단순 타입이 아닌 경우 모델 속성으로 처리됩니다.

#### ResponseEntity 예제

```java
@ExceptionHandler(UserNotFoundException.class)
public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
    ErrorResponse error = new ErrorResponse(ex.getMessage());
    return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
}
```

## 3. @ControllerAdvice를 활용한 글로벌 예외 처리

- `@ControllerAdvice` 또는 `@RestControllerAdvice` 클래스에 선언된 `@ExceptionHandler`, `@InitBinder`,
  `@ModelAttribute` 메서드는 모든 컨트롤러에 적용됩니다.
- 스프링 5.3부터 `@ControllerAdvice`의 `@ExceptionHandler` 메서드는 모든 `@Controller` 또는 다른 핸들러의 예외를 처리하는 데 사용할 수 있습니다.

### 3.1 기본 사용법

- `@ControllerAdvice`는 `@Component`로 메타 어노테이션되어 있어 컴포넌트 스캔을 통해 스프링 빈으로 등록할 수 있습니다.
- `@RestControllerAdvice`는 `@ControllerAdvice`와 `@ResponseBody`로 메타 어노테이션되어 있습니다.

#### ControllerAdvice 예제

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("Resource not found", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse error = new ErrorResponse("Internal server error", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

### 3.2 적용 범위 제한

- `@ControllerAdvice` 애노테이션은 적용할 컨트롤러와 핸들러의 집합을 좁힐 수 있는 속성을 가지고 있습니다.

#### 적용 범위 제한 예제

```java
// @RestController로 어노테이션된 모든 컨트롤러 대상
@ControllerAdvice(annotations = RestController.class)
public class RestApiExceptionHandler {
    // 예외 처리 메서드들...
}

// 특정 패키지 내의 모든 컨트롤러 대상
@ControllerAdvice("org.example.controllers")
public class PackageSpecificExceptionHandler {
    // 예외 처리 메서드들...
}

// 특정 클래스에 할당 가능한 모든 컨트롤러 대상
@ControllerAdvice(assignableTypes = {ControllerInterface.class, AbstractController.class})
public class TypeSpecificExceptionHandler {
    // 예외 처리 메서드들...
}
```

:::warning 위 예제의 선택자는 런타임에 평가되므로 광범위하게 사용할 경우 성능에 부정적인 영향을 미칠 수 있습니다.
:::

### 3.3 적용 우선순위

- 시작 시 `RequestMappingHandlerMapping`과 `ExceptionHandlerExceptionResolver`는 컨트롤러 어드바이스 빈을 감지하고 런타임에 적용합니다.
- `@ControllerAdvice`의 글로벌 `@ExceptionHandler` 메서드는 `@Controller`의 로컬 메서드 이후에 적용됩니다.
- 반대로 글로벌 `@ModelAttribute`와 `@InitBinder` 메서드는 로컬 메서드 이전에 적용됩니다.

### 3.4 다중 @ControllerAdvice 구성

- 다수의 @ControllerAdvice가 있는 경우, 스프링은 `@Order` 애노테이션을 사용하여 우선순위를 설정할 수 있습니다.
- 예외 처리 시에는 일반적으로 원인(cause)보다 루트 예외(root exception)에 대한 매칭이 우선되지만, 이 판단은 하나의 @ControllerAdvice 또는 컨트롤러 클래스 내에서만 이루어집니다.
- 따라서 우선순위가 더 높은 @ControllerAdvice에서 예외의 cause에 대한 매칭이 있다면, 우선순위가 낮은 다른 @ControllerAdvice에서의 루트 예외 매칭보다 더 우선시됩니다.

```java
@ControllerAdvice
@Order(1)  // 숫자가 작을수록 우선순위 높음
public class HighPriorityAdvice {
    // 예외 처리 메서드들
}

@ControllerAdvice
@Order(2)
public class LowPriorityAdvice {
    // 이 클래스는 위 클래스보다 나중에 적용됨
}
```

- `@Order` 애노테이션은 `org.springframework.core.annotation.Order` 패키지에 포함되어 있습니다.
- 숫자가 작을수록 우선순위가 높습니다.
- 생략하면 기본 우선순위는 Ordered.LOWEST_PRECEDENCE (즉, 매우 낮은 우선순위)가 됩니다.

## 참고

- https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html
- https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-advice.html