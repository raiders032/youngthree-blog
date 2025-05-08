---
title: "Spring MVC의 요청 유효성 검증 가이드"
description: "Spring MVC에서 요청 데이터의 유효성을 검증하는 다양한 방법과 예외 처리 전략을 알아봅니다. @Valid와 @Validated의 차이점, 예외 처리 방법, 그리고 실제 코드 예제를 통한 효과적인 유효성 검증 방법을 설명합니다."
tags: ["SPRING_MVC", "VALIDATION", "SPRING_BOOT", "EXCEPTION_HANDLING", "BACKEND", "JAVA", "WEB"]
keywords: ["스프링 MVC", "Spring MVC", "유효성 검증", "validation", "밸리데이션", "벨리데이션", "@Valid", "@Validated", "요청 검증", "MethodArgumentNotValidException", "HandlerMethodValidationException", "Bean Validation", "Jakarta Validation", "컨트롤러 검증", "스프링 부트", "Spring Boot", "예외 처리", "Exception Handling"]
draft: false
hide_title: true
---

## 1. Spring MVC 유효성 검증

- Spring MVC는 사용자의 입력 데이터를 검증하는 강력한 기능을 제공합니다.
- 유효성 검증은 API 안정성과 보안을 위해 필수적인 요소입니다.
- Jakarta Bean Validation과 통합되어 코드를 간결하게 유지할 수 있습니다.

## 2. 두 가지 유효성 검증 방식

### 2.1 객체 검증: @Valid/@Validated 사용하기

- 주로 JSON 요청 본문이나 폼 데이터와 같은 객체를 검증할 때 사용합니다.
- 객체 파라미터 앞에 `@Valid` 또는 `@Validated`를 붙이면 검증이 작동합니다.
- 유효성 검증에 실패하면 `MethodArgumentNotValidException` 예외가 발생합니다.

#### 객체 검증 예시 코드

```java
// User 클래스 정의
public class User {
    @NotBlank(message = "이름은 필수입니다")
    private String name;
    
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;
    
    @Min(value = 1, message = "나이는 1세 이상이어야 합니다")
    private int age;
    
    // getter, setter 생략
}

// 컨트롤러에서 유효성 검증 적용
@PostMapping("/users")
public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
    // 유효성 검증을 통과하면 이 코드가 실행됩니다
    return ResponseEntity.ok(userService.saveUser(user));
}
```

### 2.2 파라미터 검증: 제약 조건 직접 사용하기

- URL 경로 변수, 쿼리 파라미터, 헤더와 같은 개별 파라미터를 검증할 때 사용합니다.
- 파라미터 앞에 `@Min`, `@NotBlank` 등의 제약 조건을 직접 붙여 사용합니다.
- 유효성 검증에 실패하면 `HandlerMethodValidationException` 예외가 발생합니다.

#### 파라미터 검증 예시 코드

```java
@GetMapping("/products/{id}")
public ResponseEntity<Product> getProduct(
        @PathVariable @Min(value = 1, message = "ID는 양수여야 합니다") Long id) {
    // 유효성 검증을 통과하면 이 코드가 실행됩니다
    return ResponseEntity.ok(productService.findById(id));
}
```

:::info[중요]
`@Valid`는 객체 내부의 중첩된 제약 조건을 검증하기 위한 것이고, `@Min`, `@NotBlank` 등은 직접적인 제약 조건입니다. 두 가지 방식을 상황에 맞게 사용하세요.
:::

## 3. 유효성 검증 예외 처리하기

- 유효성 검증 실패 시 발생하는 두 가지 예외를 적절히 처리해야 합니다.
  - `MethodArgumentNotValidException`: 객체 검증 실패 시 발생
  - `HandlerMethodValidationException`: 파라미터 검증 실패 시 발생

### 3.1 기본적인 예외 처리 예시

```java
@RestControllerAdvice
public class ValidationExceptionHandler {

    // 객체 검증 실패 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        
        List<String> errors = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());
        
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("errors", errors);
        
        return ResponseEntity.badRequest().body(response);
    }

    // 파라미터 검증 실패 처리
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<Map<String, Object>> handleMethodValidationErrors(HandlerMethodValidationException ex) {
        Map<String, Object> response = new HashMap<>();
        List<String> errors = new ArrayList<>();
        
        ex.getAllValidationResults().forEach(result -> {
            errors.add(result.getMethodParameter().getParameterName() + ": " + 
                      result.getResolvableErrors().get(0).getDefaultMessage());
        });
        
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("errors", errors);
        
        return ResponseEntity.badRequest().body(response);
    }
}
```

## 4. 고급 유효성 검증 기법

### 4.1 수동 에러 처리: BindingResult 사용하기

- `BindingResult`를 사용하면 유효성 검증 실패 시 예외를 던지지 않고 직접 처리할 수 있습니다.
- 오류를 정확하게 파악하고 사용자 지정 응답을 제공하는 데 유용합니다.

```java
@PostMapping("/orders")
public ResponseEntity<?> createOrder(@Valid @RequestBody Order order, BindingResult bindingResult) {
    // 유효성 검증 실패 시 직접 처리
    if (bindingResult.hasErrors()) {
        Map<String, Object> errorResponse = new HashMap<>();
        List<String> errors = bindingResult.getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        
        errorResponse.put("errors", errors);
        return ResponseEntity.badRequest().body(errorResponse);
    }
    
    // 검증 통과 시 정상 처리
    return ResponseEntity.ok(orderService.placeOrder(order));
}
```

### 4.2 커스텀 유효성 검증 만들기

- 복잡한 비즈니스 로직 기반 검증을 위해 커스텀 Validator를 구현할 수 있습니다.

```java
// 커스텀 Validator 구현
public class ProductValidator implements Validator {
    @Override
    public boolean supports(Class<?> clazz) {
        return Product.class.isAssignableFrom(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        Product product = (Product) target;
        
        // 비즈니스 로직 기반 검증
        if (product.getPrice() < product.getCost()) {
            errors.rejectValue("price", "price.tooLow", 
                              "가격은 원가보다 높아야 합니다");
        }
        
        // 재고와 최소 주문 수량 비교
        if (product.getStock() < product.getMinOrderQuantity()) {
            errors.rejectValue("stock", "stock.insufficient", 
                              "재고가 최소 주문 수량보다 적습니다");
        }
    }
}

// 컨트롤러에 커스텀 Validator 등록
@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductValidator productValidator;
    
    @Autowired
    public ProductController(ProductValidator productValidator) {
        this.productValidator = productValidator;
    }

    @InitBinder
    protected void initBinder(WebDataBinder binder) {
        binder.addValidators(productValidator);
    }
    
    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        // 유효성 검증 통과 시 실행
        return ResponseEntity.ok(productService.save(product));
    }
}
```

## 5. 유효성 검증 메시지 관리하기

- 메시지 파일을 통해 다국어 지원 및 중앙화된 오류 메시지 관리가 가능합니다.

### 5.1 메시지 설정 예시

```java
@Configuration
public class MessageConfig {
    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource source = new ReloadableResourceBundleMessageSource();
        source.setBasename("classpath:messages");
        source.setDefaultEncoding("UTF-8");
        return source;
    }
    
    @Bean
    public LocalValidatorFactoryBean validator() {
        LocalValidatorFactoryBean bean = new LocalValidatorFactoryBean();
        bean.setValidationMessageSource(messageSource());
        return bean;
    }
}
```

### 5.2 메시지 파일 예시 (messages.properties)

```properties
# 기본 메시지
NotBlank.user.name=이름은 필수 항목입니다
Email.user.email=올바른 이메일 형식이 아닙니다
Min.user.age=나이는 {1}세 이상이어야 합니다

# 영문 메시지는 messages_en.properties에 정의
```

## 6. 실무 적용 시 권장 사항

### 6.1 유효성 검증 전략 선택 가이드

- 객체 전체 검증: `@Valid`/`@Validated` 사용
- 개별 파라미터 검증: 직접 제약 조건 어노테이션 사용
- 복잡한 비즈니스 로직 검증: 커스텀 Validator 구현
- 세밀한 오류 처리 필요: `BindingResult` 활용

### 6.2 성능과 사용성 개선 팁

- 오류 메시지는 명확하고 사용자 친화적으로 작성하세요
- 보안 정보가 오류 메시지를 통해 노출되지 않도록 주의하세요
- 복잡한 검증 로직은 서비스 계층으로 분리하세요
- 필요한 경우에만 전체 객체 그래프를 검증하세요

:::tip[유효성 검증 모범 사례]
- 입력은 항상 의심하고 검증하세요
- 오류 응답은 일관된 형식으로 제공하세요
- 클라이언트 측 검증과 서버 측 검증을 모두 구현하세요
- 유효성 검증 로직을 재사용 가능하게 설계하세요
  :::

## 7. 마치며

- Spring MVC의 유효성 검증 기능을 활용하면 안전하고 신뢰할 수 있는 API를 구축할 수 있습니다.
- 객체 검증과 파라미터 검증을 상황에 맞게 적절히 사용하고, 예외 처리를 잘 설계하는 것이 중요합니다.
- 실무에서는 비즈니스 요구사항에 맞게 커스텀 검증 로직을 추가하고, 사용자 친화적인 오류 메시지를 제공하세요.

## 참고

- [Spring 공식 문서: 유효성 검증](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html)