---
title: "Spring Framework의 Bean Validation 완벽 가이드"
description: "Spring Framework에서 제공하는 Bean Validation 기능을 상세히 알아봅니다. 기본 개념부터 설정 방법, 커스텀 제약 조건 구현, 메서드 검증까지 실제 예제 코드와 함께 설명합니다. Spring 기반 애플리케이션에서 안정적인 데이터 검증을 구현하고자 하는 개발자를 위한 가이드입니다."
tags: [ "BEAN_VALIDATION", "SPRING", "SPRING_BOOT", "VALIDATION", "BACKEND", "JAVA" ]
keywords: [ "빈 검증", "Bean Validation", "스프링", "Spring", "스프링부트", "Spring Boot", "자바", "Java", "검증", "Validation", "유효성 검사", "Validator", "제약조건", "Constraint", "어노테이션", "Annotation", "ConstraintValidator", "JSR-380", "LocalValidatorFactoryBean", "데이터 바인딩", "Data Binding", "메서드 검증", "Method Validation" ]
draft: false
hide_title: true
---

## 1. Bean Validation 개요

- Bean Validation은 Java 애플리케이션에서 제약 조건 선언과 메타데이터를 통한 일관된 검증 방법을 제공합니다.
- Bean Validation은 객체의 유효성 검증을 위한 표준화된 방법을 제공하는 기술 명세입니다.
  - JSR-380(Bean Validation 2.0)이라는 기술 표준이며 검증 애노테이션과 인터페이스의 모음입니다.
  - Hibernate Validator는 Bean Validation의 대표적인 구현체입니다.
- 도메인 모델 속성에 선언적 검증 제약 조건을 어노테이션으로 추가하면 런타임에 이를 강제합니다.
- 이미 정의된 제약 조건이 있으며, 사용자 정의 제약 조건도 구현할 수 있습니다.

### 1.1 간단한 예제

- 다음은 두 개의 속성을 가진 간단한 PersonForm 모델 예제입니다

```java
public class PersonForm {
    private String name;
    private int age;
}
```

- Bean Validation을 사용하면 다음과 같이 제약 조건을 선언할 수 있습니다:

```java
public class PersonForm {

    @NotNull
    @Size(max=64)
    private String name;

    @Min(0)
    private int age;
}
```

- Bean Validation 검증기는 선언된 제약 조건을 기반으로 이 클래스의 인스턴스를 검증합니다.
- API에 대한 일반적인 정보는 Bean Validation 명세를 참조하세요.
- 특정 제약 조건에 대해서는 Hibernate Validator 문서를 확인하세요.

## 2. Bean Validation Provider 구성하기

- Spring은 Bean Validation API를 완벽하게 지원하며, Bean Validation Provider를 Spring 빈으로 구성할 수 있습니다.
- 이를 통해 애플리케이션에서 검증이 필요한 모든 곳에 `jakarta.validation.ValidatorFactory` 또는 `jakarta.validation.Validator`를 주입할 수 있습니다.

:::info 프로바이더(provider)는 Bean Validation API를 구현하는 실제 라이브러리를 의미합니다. Bean Validation API(예: jakarta.validation 패키지)는 인터페이스와 어노테이션만 정의하고 있으며, 실제 검증 로직을 수행하는 구현체는 따로 필요합니다. 이 구현체를
`Bean Validation Provider`라고 부릅니다. 가장 널리 사용되는 Bean Validation 프로바이더는 Hibernate Validator입니다.
:::

### 2.1 기본 Validator 구성

```java
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@Configuration
public class AppConfig {

    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }
}
```

- `LocalValidatorFactoryBean`을 사용하여 기본 Validator를 Spring 빈으로 구성할 수 있습니다:
- `LocalValidatorFactoryBean`은 `jakarta.validation.ValidatorFactory`와 `jakarta.validation.Validator` 모두를 구현합니다.
- 위의 기본 구성은 기본 부트스트랩 메커니즘을 사용하여 Bean Validation을 초기화합니다.
- Hibernate Validator와 같은 Bean Validation 제공자가 클래스패스에 있어야 하며 자동으로 감지됩니다.

## 3. Validator 주입하기

### 3.1 Jakarta Validator 주입

- `LocalValidatorFactoryBean`은 `jakarta.validation.ValidatorFactory`와 `jakarta.validation.Validator` 모두를 구현합니다.
- Bean Validation API를 직접 사용하려면 후자에 대한 참조를 주입할 수 있습니다:

```java
import jakarta.validation.Validator;

@Service
public class MyService {

    @Autowired
    private Validator validator;
}
```

- `LocalValidatorFactoryBean`은 `jakarta.validation.Validator`를 구현했기 때문에, 빈으로 주입할 수 있습니다.

### 3.2 Spring Validator 주입

- `LocalValidatorFactoryBean`은 `jakarta.validation.Validator`를 구현할 뿐만 아니라
  `org.springframework.validation.Validator`에도 적응합니다.
- 빈이 Spring Validation API를 필요로 하는 경우 후자에 대한 참조를 주입할 수 있습니다:

```java
import org.springframework.validation.Validator;

@Service
public class MyService {

    @Autowired
    private Validator validator;
}
```

- `org.springframework.validation.Validator`로 사용될 때, `LocalValidatorFactoryBean`은 기본
  `jakarta.validation.Validator`를 호출한 다음:
  - `ConstraintViolations`를 `FieldErrors`로 변환합니다.
  - `validate` 메서드에 전달된 `Errors` 객체에 등록합니다.

## 4. 사용자 정의 제약 조건 구성

- 이미 정의된 제약 조건을 사용할 수 있지만, 사용자 정의 제약 조건을 구현할 수도 있습니다.
- 각 Bean Validation 제약 조건은 두 부분으로 구성됩니다:
  - 제약 조건과 구성 가능한 속성을 선언하는 `@Constraint` 어노테이션
  - 제약 조건의 동작을 구현하는 `jakarta.validation.ConstraintValidator` 인터페이스의 구현체
- 따라서 사용자 정의 제약 조건을 구현하려면 두 가지를 모두 구현해야 합니다.

### 4.1 사용자 정의 제약 정의하기

```java
@Target({ElementType.METHOD, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy=MyConstraintValidator.class)
public @interface MyConstraint {
}
```

- 먼저 @MyConstraint라는 커스텀 어노테이션을 만듭니다.
- 이 어노테이션은 필드나 메소드에 적용될 수 있도록 @Target으로 지정되고, 런타임에도 유지되도록 @Retention(RetentionPolicy.RUNTIME)으로 설정됩니다.
- 중요한 것은 @Constraint(validatedBy=MyConstraintValidator.class)로 이 어노테이션이 어떤 검증기 클래스에 의해 처리될지 명시합니다.

### 4.2 사용자 정의 제약 검증기 구현하기

- 이제 실제 검증 로직을 수행하는 `ConstraintValidator` 구현체를 작성합니다.
- MyConstraintValidator 클래스는 ConstraintValidator 인터페이스를 구현하여 실제 유효성 검증 로직을 제공합니다.

```java
import jakarta.validation.ConstraintValidator;

public class MyConstraintValidator implements ConstraintValidator {

    @Autowired;
    private Foo aDependency;

    // ...
}
```

- 이 클래스는 Spring의 의존성 주입을 활용할 수 있어, @Autowired를 통해 다른 빈(예: Foo 타입의 빈)을 주입받을 수 있습니다.
- 이렇게 구성하면 @MyConstraint 어노테이션을 도메인 모델의 필드나 메소드에 적용했을 때, Spring이 MyConstraintValidator의 인스턴스를 생성하고 필요한 의존성을 주입한 후 검증 로직을 실행하게 됩니다.

### 4.3 ConstraintValidator 인터페이스

```java
public interface ConstraintValidator<A extends Annotation, T> {
    default void initialize(A constraintAnnotation) {}
    boolean isValid(T value, ConstraintValidatorContext context);
}
```

- ConstraintValidator는 Bean Validation API의 핵심 인터페이스입니다.
- 커스텀 제약 조건(Custom Constraint)을 구현할 때 사용됩니다.
- 제네릭을 통해 검증할 애노테이션 타입과 검증 대상 타입을 지정합니다.
- 제네릭 파라미터
  - `A extends Annotation`: 커스텀 제약 조건 애노테이션 타입
  - `T`: 검증할 값의 타입
- 메서드
  - `initialize()`: 초기화를 위한 콜백 메서드
  - `isValid()`: 실제 검증 로직을 구현하는 메서드

## 5. Spring 기반 메서드 검증

- 메서드 검증은 메서드의 매개변수나 반환값을 Bean Validation을 통해 검증하는 기능입니다.
- Spring에서는 이 기능을 MethodValidationPostProcessor를 통해 사용할 수 있습니다.

### 5.1 설정하기

```java
@Configuration
public class ApplicationConfiguration {
    @Bean
    public static MethodValidationPostProcessor validationPostProcessor() {
        return new MethodValidationPostProcessor();
    }
}
```

- 먼저 다음과 같이 MethodValidationPostProcessor 빈을 설정합니다.
- `MethodValidationPostProcessor`는 Spring AOP를 사용하여 메서드 호출 시 매개변수와 반환값을 검증합니다.

### 5.2 @Validated 어노테이션

- MethodValidationPostProcessor를 설정한 후, 메서드 검증을 적용할 클래스에 `@Validated` 어노테이션을 추가합니다.
- 이 어노테이션은 Spring AOP를 통해 메서드 호출 시 검증을 수행합니다.
- 주의 사항
  - 클래스 레벨에 @Validated 어노테이션을 붙여야 합니다.
  - 유효성 검증이 필요한 메서드 파라미터에 @Valid 또는 @Validated를 붙여야 합니다.
- @Validated가 붙은 클래스의 AOP 프록시가 생성됩니다. 
  - 메서드 호출 시 해당 프록시가 파라미터와 반환값의 유효성을 검사합니다. 
  - 유효성 검증에 실패하면 기본적으로 ConstraintViolationException이 발생합니다.
  - 단, 이 방식을 사용하려면 앞서 언급한 MethodValidationPostProcessor 빈이 Spring 컨텍스트에 등록되어 있어야 합니다.

```java
@Service
@Validated
public class UserService {
    public User createUser(@NotNull @Valid User user) {
        // ...
    }
}
```

### 5.3 웹 환경에서의 메서드 검증

- Spring MVC와 WebFlux는 컨트롤러 메서드의 검증을 위해 AOP 없이도 특별한 지원을 제공합니다.
- 컨트롤러의 핸들러 메서드 매개변수에 @Valid 또는 @Validated를 붙이면 자동으로 검증됩니다.
- 이 경우 별도로 클래스에 @Validated를 붙이거나 MethodValidationPostProcessor를 설정할 필요가 없습니다.

```java
@RestController
public class UserController {
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        // 이미 user는 검증되었습니다
        return ResponseEntity.ok(userService.createUser(user));
    }
}
```

## 6. 메서드 검증 예외

- 메서드 검증이 실패하면 기본적으로 `ConstraintViolations` 집합과 함께 `jakarta.validation.ConstraintViolationException`이 발생합니다.
- 대안으로, `ConstraintViolations`가 `MessageSourceResolvable` 오류로 조정된 `MethodValidationException`이 대신 발생하도록 할 수 있습니다.

### 6.1 설정

```java
@Configuration
public class ApplicationConfiguration {

    @Bean
    public static MethodValidationPostProcessor validationPostProcessor() {
        MethodValidationPostProcessor processor = new MethodValidationPostProcessor();
        processor.setAdaptConstraintViolations(true);
        return processor;
    }
}
```

- 위와 같이 설정하면 `MethodValidationPostProcessor`가 `ConstraintViolations`를 `MessageSourceResolvable` 오류로 조정합니다.
- 이렇게 하면 검증 오류가 발생했을 때 `MethodValidationException`이 발생합니다.

### 6.2 MethodValidationException 이해하기

- `MethodValidationException`은 메서드 파라미터별로 오류를 그룹화하는 `ParameterValidationResults` 목록을 포함합니다.
- 각 결과는 `MethodParameter`, 인수 값, 그리고 `ConstraintViolations`에서 조정된 `MessageSourceResolvable` 오류 목록을 노출합니다.
- 필드와 속성에 대한 캐스케이드 위반이 있는 `@Valid` 메서드 파라미터의 경우, `ParameterValidationResult`는
  `org.springframework.validation.Errors`를 구현하는 `ParameterErrors`이며 검증 오류를 `FieldErrors`로 노출합니다.

## 7. 검증 오류 사용자 정의

- 조정된 `MessageSourceResolvable` 오류는 구성된 `MessageSource`를 통해 로케일 및 언어별 리소스 번들과 함께 사용자에게 표시할 오류 메시지로 변환할 수 있습니다.

### 7.1 사용자 정의 예제

- 다음 클래스 선언을 고려해 보세요:

```java
record Person(@Size(min = 1, max = 10) String name) {
}

@Validated
public class MyService {

    void addStudent(@Valid Person person, @Max(2) int degrees) {
        // ...
    }
}
```

#### 7.1.1 Person.name()에 대한 ConstraintViolation 사용자 정의

- `Person.name()`에 대한 `ConstraintViolation`은 다음을 포함하는 `FieldError`로 조정됩니다:
  - 오류 코드: "Size.person.name", "Size.name", "Size.java.lang.String", "Size"
  - 메시지 인수: "name", 10, 1 (필드 이름 및 제약 조건 속성)
  - 기본 메시지: "size must be between 1 and 10"
- 기본 메시지를 사용자 정의하려면 위의 오류 코드 및 메시지 인수를 사용하여 `MessageSource` 리소스 번들에 속성을 추가할 수 있습니다.
- 메시지 인수 "name"은 그 자체로 오류 코드 "person.name" 및 "name"을 가진 `MessageSourceResolvable`이며 이 역시 사용자 정의할 수 있습니다.

```properties
Size.person.name=Please, provide a {0} that is between {2} and {1} characters long
person.name=username
```

#### 7.1.2 degrees 메서드 파라미터에 대한 ConstraintViolation 사용자 정의

- `degrees` 메서드 파라미터에 대한 `ConstraintViolation`은 다음을 포함하는 `MessageSourceResolvable`로 조정됩니다:
  - 오류 코드: "Max.myService#addStudent.degrees", "Max.degrees", "Max.int", "Max"
  - 메시지 인수: "degrees", 2 (필드 이름 및 제약 조건 속성)
  - 기본 메시지: "must be less than or equal to 2"
- 위의 기본 메시지를 사용자 정의하려면 다음과 같은 속성을 추가할 수 있습니다:

```properties
Max.degrees=You cannot provide more than {1} {0}
```

## 8. 추가 구성 옵션

- 대부분의 경우 기본 `LocalValidatorFactoryBean` 구성으로 충분합니다.
- 메시지 보간부터 순회 해석까지 다양한 Bean Validation 구성에 대한 여러 구성 옵션이 있습니다.
- 이러한 옵션에 대한 자세한 내용은 [LocalValidatorFactoryBean javadoc](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/validation/beanvalidation/LocalValidatorFactoryBean.html)을 참조하세요.

## 9. DataBinder 구성하기

- `DataBinder` 인스턴스를 `Validator`로 구성할 수 있습니다.
- 구성 후 `binder.validate()`를 호출하여 `Validator`를 호출할 수 있습니다.
- 모든 유효성 검사 `Errors`는 자동으로 바인더의 `BindingResult`에 추가됩니다.

:::info
HTTP 요청 파라미터나 폼 데이터와 같은 외부 데이터를 자바 객체에 바인딩하는 역할을 합니다. 바인딩 과정에서 타입 변환을 처리합니다. 또한 데이터의 유효성을 검사하는 기능도 제공합니다. 바인딩 결과는 `BindingResult` 객체에 저장됩니다.
:::

### 9.1 프로그래밍 방식으로 DataBinder 사용하기

- 다음 예제는 대상 객체에 바인딩한 후 유효성 검사 로직을 호출하기 위해 프로그래밍 방식으로 `DataBinder`를 사용하는 방법을 보여줍니다:

```java
Foo target = new Foo();
DataBinder binder = new DataBinder(target);
binder.setValidator(new FooValidator());

// 대상 객체에 바인딩
binder.bind(propertyValues);

// 대상 객체 검증
binder.validate();

// 유효성 검사 오류를 포함하는 BindingResult 가져오기
BindingResult results = binder.getBindingResult();
```

### 9.2 다중 Validator 구성하기

- Spring 애플리케이션에서는 다양한 데이터 유효성 검증 전략을 필요로 하는 경우가 많습니다. 
- DataBinder는 이러한 다양한 요구사항을 충족시키기 위해 여러 Validator를 동시에 사용할 수 있는 기능을 제공합니다.
- DataBinder에서는 다음 두 가지 메소드를 통해 여러 Validator를 구성할 수 있습니다:
  - `dataBinder.addValidators(Validator... validators);` : 기존 Validator에 추가
  - `dataBinder.replaceValidators(Validator... validators);`: 기존 Validator를 대체

```java
@Controller
public class UserController {

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        // 이미 등록된 글로벌 Bean Validator에 추가로 커스텀 Validator 추가
        binder.addValidators(new UserNameValidator());
        binder.addValidators(new PasswordMatchValidator());
    }
    
    @PostMapping("/users")
    public String createUser(@Valid User user, BindingResult result) {
        if (result.hasErrors()) {
            return "user-form";
        }
        // 사용자 저장 로직
        return "redirect:/users";
    }
}
```

- 위는 컨트롤러에서 글로벌 Validator와 로컬 Validator를 결합하는 예제입니다.
- 글로벌 Validator
  - 애플리케이션 전체에 적용되는 Validator
  - 주로 도메인 객체의 필드 수준 유효성 검사에 사용
- 로컬 Validator
  - 특정 컨트롤러나 특정 요청에만 적용되는 Validator
  - 주로 객체 간의 관계나 비즈니스 규칙에 관련된 복잡한 유효성 검사에 사용
- 위 예제에서 @Valid 어노테이션은 글로벌 Bean Validator를 활성화하고, @InitBinder를 통해 추가된 로컬 Validator들도 함께 실행됩니다.
- 다중 Validator가 구성된 경우, 유효성 검사는 다음 순서로 실행됩니다
  - 글로벌 Validator(대체로 Bean Validation)가 먼저 실행됩니다.
  - addValidators()로 추가된 로컬 Validator들이 추가된 순서대로 실행됩니다.

## 참고

- [Spring Java Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html)[Bean-Validation.md](../../../../../%EB%8B%A4%EB%A5%B8%20%EC%BB%B4%ED%93%A8%ED%84%B0/Mac%20M2Max/share/docs/OLD%20TIL/Spring/Validation/Bean-Validation/Bean-Validation.md)
- [Spring MVC Validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html)