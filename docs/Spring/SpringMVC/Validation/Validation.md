## 1. Spring MVC Validation

- 이번 글에서는 Spring MVC에서 Validation을 어떻게 설정하고 사용하는지에 대해 알아보겠습니다.
- Spring MVC는 @RequestMapping 메서드에 대한 내장 유효성 검증 기능이 있습니다. 
  - @RequestMapping 메서드란 Spring MVC에서 HTTP 요청을 처리하는 메서드를 의미합니다.
  - 말 그대로 @RequestMapping 어노테이션이 붙은 메서드입니다.

## 2. Spring MVC Validation 예시

- 세부 내용을 알아보기 전에 Validation을 사용하는 예시를 먼저 살펴보면서 이해를 돕겠습니다.

```java
@PostMapping("/users")
public ResponseEntity<String> registerUser(
        @Valid @RequestBody UserRegistrationRequest request) {
    // 실제로는 여기서 서비스 로직을 호출하여 사용자를 등록할 것입니다.
    return ResponseEntity.ok("User registered successfully: " + request.email());
}

public record UserRegistrationRequest(
        @NotBlank(message = "{validation.email.notBlank}")
        @Email(message = "{validation.email.invalid}")
        String email,

        @NotBlank(message = "{validation.password.notBlank}")
        @Size(min = 8, max = 20, message = "{validation.password.size}")
        @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*]).+$", message = "{validation.password.pattern}")
        String password,

        @NotBlank(message = "{validation.password.confirm.notBlank}")
        String confirmPassword,

        @NotBlank(message = "{validation.name.notBlank}")
        String name,

        @Past(message = "{validation.birthDate.past}")
        LocalDate birthDate) {
}
```

- 위의 예시에서 @Valid 어노테이션을 사용하여 UserRegistrationRequest 객체에 대한 유효성 검사를 수행합니다.
- UserRegistrationRequest 클래스에 정의된 필드에 대해 유효성 검사를 수행합니다.
- 즉 컨트롤러 메서드 내부에서 직접 입력값 검증을 수행하는 것이 아니라, Spring MVC가 자동으로 검증을 수행합니다.
- 어떻게 이 기능이 작동하는지 알아보겠습니다.

## 3. 두 가지 유효성 검증 방식

- Spring MVC에서는 두 가지 유효성 검증 방식을 제공합니다.
- 하나는 검증하고 싶은 파라미터에 @Valid 어노테이션을 붙여 검증하는 방식이고 또 다른 하나는 파라미터에 직접 제약 조건을 붙여 검증하는 방식입니다.
  - 메서드 인자 검증: @Valid 어노테이션을 사용하여 메서드 인자에 대한 유효성 검증을 수행합니다.
  - 메서드 검증: @Constraint 어노테이션(@Min, @NotBlank 등)을 사용하여 메서드 인자 또는 반환값에 대한 유효성 검증을 수행합니다.
- 아래 예시를 통해 구분해보겠습니다.

### 3.1 두 가지 유효성 방식 예시

#### 3.1.1 메서드 인자 검증(Method Argument Validation)

- 메서드 인자 검증은 아래 조건을 만족해야 합니다.
- 검증하고자 하는 파라미터에 @Valid 또는 @Validated 어노테이션을 붙여야 합니다.
- 파라미터 바로 뒤에 Errors 또는 BindingResult 타입의 파라미터가 없어야 합니다.
- 아규먼트 리졸버가 @ModelAttribute, @RequestBody, 또는 @RequestPart가 붙은 파라미터에 대해서 위 조건을 만족하는 경우에만 유효성 검증을 수행합니다.

```java
@PostMapping("/users")
public ResponseEntity<String> registerUser(
        @Valid @RequestBody UserRegistrationRequest request) {
    // 실제로는 여기서 서비스 로직을 호출하여 사용자를 등록할 것입니다.
    return ResponseEntity.ok("User registered successfully: " + request.email());
}

public record UserRegistrationRequest(
        @NotBlank(message = "{validation.email.notBlank}")
        @Email(message = "{validation.email.invalid}")
        String email,

        @NotBlank(message = "{validation.password.notBlank}")
        @Size(min = 8, max = 20, message = "{validation.password.size}")
        @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*]).+$", message = "{validation.password.pattern}")
        String password,

        @NotBlank(message = "{validation.password.confirm.notBlank}")
        String confirmPassword,

        @NotBlank(message = "{validation.name.notBlank}")
        String name,

        @Past(message = "{validation.birthDate.past}")
        LocalDate birthDate) {
}
```

- 위 예시가 메서드 인자 검증인 이유는 아래와 같습니다.
- @Valid 어노테이션이 UserRegistrationRequest 파라미터에 붙어있습니다.
- @Valid 어노테이션이 붙은 파라미터 뒤에 Errors 또는 BindingResult 타입의 파라미터가 없습니다.
- @ModelAttribute, @RequestBody, @RequestPart가 붙은 파라미터입니다.
- 따라서 메서드 인자 검증이 수행됩니다.

#### 3.1.2 메서드 검증(Method Validation)

- 메서드 검증은 아래 조건을 만족해야 합니다.
- @Constraint 어노테이션(@Min, @NotBlank 등)이 파라미터에 직접 붙어 있어야 합니다.
- 또는 반환값 검증을 위해 메서드에 @Constraint 어노테이션(@Min, @NotBlank 등)이 직접 붙어 있어야 합니다.

```java
@GetMapping("/users/{id}")
public ResponseEntity<String> getUserById(
       @PathVariable @NotNull @Min(value = 1, message = "{validation.id.min}") Long id) {
   return ResponseEntity.ok("User found with ID: " + id);
}

@GetMapping("/users/search")
public ResponseEntity<String> searchUsers(
       @RequestParam(required = false) @Size(min = 2, message = "{validation.name.size}") String name,
       @RequestParam(required = false) @Min(value = 18, message = "{validation.age.min}") Integer age,
       @RequestParam(required = false) @Pattern(regexp = "^[MF]$", message = "{validation.gender.pattern}") String gender) {

   return ResponseEntity.ok("Users found with criteria: name=" + name + ", age=" + age + ", gender=" + gender);
}

@PostMapping("/users/validate-email")
@NotNull(message = "{validation.response.notNull}")
public ResponseEntity<Boolean> validateEmail(
       @RequestParam @NotBlank @Email(message = "{validation.email.invalid}") String email) {

   // 이메일 유효성 검사 로직
   boolean isValid = email != null && email.contains("@");
   return ResponseEntity.ok(isValid);
}
```

- 위 예시가 메서드 검증인 이유는 아래와 같습니다.
- 첫 번째 메서드에서는 id 파라미터에 @NotNull과 @Min 어노테이션이 직접 붙어 있습니다.
- 두 번째 메서드에서는 각 파라미터에 @Size, @Min, @Pattern 어노테이션이 직접 붙어 있습니다.
- 세 번째 메서드에서는 파라미터에 @NotBlank, @Email 어노테이션이 직접 붙어 있고, 메서드 자체에도 @NotNull 어노테이션이 붙어 있어 반환값도 검증합니다.
- 이러한 경우 메서드 검증이 수행됩니다.

### 3.2 두 가지 검증 방식이 모두 적용되는 경우

- 메서드 인자 검증 조건과 메서드 검증 조건이 모두 만족되는 경우에는 메서드 검증이 우선적으로 적용됩니다.

```java
@PostMapping("/users")
public ResponseEntity<String> registerUser(
        @Valid @NotNull(message = "{validation.request.notNull}") @RequestBody UserRegistrationRequest request) {
    // 실제로는 여기서 서비스 로직을 호출하여 사용자를 등록할 것입니다.
    return ResponseEntity.ok("User registered successfully: " + request.email());
}
```

- 위 예시에서는 @Valid와 @NotNull 어노테이션이 모두 붙어 있습니다.
- 따라서 메서드 인자 검증과 메서드 검증 조건을 모두 만족합니다.
- 이런 경우에는 메서드 검증이 우선적으로 적용되어 파라미터가 null인지 먼저 확인하고, null이 아닐 경우 @Valid를 통해 객체 내부 필드의 유효성을 검증합니다.

:::info
@Valid는 제약 조건 어노테이션이 아니라, 객체 내부의 중첩된 제약 조건을 위한 것입니다. 객체의 필드에 적용된 제약 조건을 재귀적으로 검증하도록 지시하는 표시자 역할을 합니다. 즉 @Valid 단독으로는 "메서드 유효성 검증"(method validation)을 트리거하지 않고, "메서드 인자 유효성 검증"(method argument validation)을 트리거합니다.
반대로 제약 조건 어노테이션(@Min, @NotBlank 등)은 메서드 인자 유효성 검증을 트리거합니다. 따라서 @Valid와 제약 조건 어노테이션이 함께 사용되면 메서드 인자 유효성 검증이 우선적으로 적용됩니다.
:::

### 3.3 검증 실패 시 예외

- 두 가지 유효성 검증 방식 모두 검증에 실패하면 예외가 발생하지만 서로 다른 예외가 발생합니다.
  - 메서드 인자 검증 실패: `MethodArgumentNotValidException`
  - 메서드 검증 실패: `HandlerMethodValidationException`
- 따라서 애플리케이션은 `MethodArgumentNotValidException`과 `HandlerMethodValidationException` 두 가지 모두를 처리해야 합니다. 
- 컨트롤러 메서드 시그니처에 따라 두 예외 중 어느 것이든 발생할 수 있기 때문입니다. 
- 그러나 이 두 예외는 매우 유사하게 설계되어 있어 거의 동일한 코드로 처리할 수 있습니다. 
- 주요 차이점은 전자는 단일 객체에 대한 것이고, 후자는 메서드 파라미터 목록에 대한 것입니다

## 4. 예외 처리

- 이제 검증 실패 시 발생한 두 가지 예외에 대해서 어떻게 처리할 수 있는지 알아보겠습니다.
- 애플리케이션은 MethodArgumentNotValidException과 HandlerMethodValidationException 둘 다 처리해야 합니다. 
  - 두 예외 모두 컨트롤러 메서드 시그니처에 따라 발생할 수 있기 때문입니다. 
  - 하지만 이 두 예외는 매우 유사하게 설계되어 있어서 거의 동일한 코드로 처리할 수 있습니다. 
  - 주요 차이점은 전자는 단일 객체를 위한 것이고, 후자는 메서드 파라미터 리스트를 위한 것입니다.

### 4.1 Spring MVC의 Error Responses

- REST 서비스에서는 오류 응답 본문에 상세 정보를 포함하는 것이 일반적인 요구사항입니다.
- Spring Framework는 "HTTP API를 위한 문제 상세 정보" 명세인 RFC 9457을 지원합니다.
- 이 지원을 위한 주요 추상화는 다음과 같습니다
- ProblemDetail
  - RFC 9457 문제 상세 정보 표현
  - 명세에 정의된 표준 필드와 비표준 필드를 위한 간단한 컨테이너입니다.
- ErrorResponse
  - HTTP 상태, 응답 헤더, RFC 9457 형식의 본문을 포함한 HTTP 오류 응답 상세 정보를 노출하는 계약
  - 이를 통해 예외가 HTTP 응답에 매핑되는 방법의 세부 정보를 캡슐화하고 노출할 수 있습니다. 
  - 모든 Spring MVC 예외는 이를 구현합니다.
- ErrorResponseException
  - 다른 클래스가 편리한 기본 클래스로 사용할 수 있는 기본 ErrorResponse 구현입니다.
- ResponseEntityExceptionHandler
  - 모든 Spring MVC 예외와 ErrorResponseException을 처리하고 본문이 있는 오류 응답을 렌더링하는 @ControllerAdvice를 위한 편리한 기본 클래스입니다.

### 4.2 렌더링

- @ExceptionHandler나 @RequestMapping 메서드에서 ProblemDetail 또는 ErrorResponse를 반환하여 RFC 9457 응답을 렌더링할 수 있습니다. 
- 이는 다음과 같이 처리됩니다
  - ProblemDetail의 status 속성이 HTTP 상태를 결정합니다.
  - ProblemDetail의 instance 속성이 아직 설정되지 않았다면 현재 URL 경로에서 설정됩니다.

###  4.3 


## 참고

- https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html
- https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html