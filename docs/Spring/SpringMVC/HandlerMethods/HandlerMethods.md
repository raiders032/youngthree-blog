## 1. Spring MVC Handler Methods

- @RequestMapping 핸들러 메서드는 유연한 시그니처를 가지며, 지원되는 다양한 컨트롤러 메서드 인수와 반환 값을 선택할 수 있습니다.

## 2. 컨트롤러 메서드 인자

- [레퍼런스](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/arguments.html)
- 요청 처리 관련 인자:
  - WebRequest, ServletRequest - 요청 접근 방법
  - HttpSession - 세션 접근 (항상 null이 아님)
  - PushBuilder - HTTP/2 리소스 푸시를 위한 Servlet 4.0 API
  - Principal - 인증된 사용자 정보
  - InputStream, Reader - 원시 요청 본문 접근
  - OutputStream, Writer - 원시 응답 본문 접근
- 어노테이션 기반 데이터 접근:
  - @PathVariable - URI 템플릿 변수 접근
  - @MatrixVariable - URI 경로 세그먼트의 이름-값 쌍 접근
  - @RequestParam - 서블릿 요청 파라미터 및 멀티파트 파일 접근
  - @RequestHeader - 요청 헤더 접근
  - @CookieValue - 쿠키 접근
  - @RequestBody - HTTP 요청 본문 접근
  - @RequestPart - 멀티파트 요청의 특정 부분 접근
  - @ModelAttribute - 모델 속성 접근
  - @SessionAttribute - 세션 속성 접근
  - @RequestAttribute - 요청 속성 접근
- 모델/뷰 관련 인자:
  - Map, Model, ModelMap - 뷰 렌더링을 위한 모델 접근
  - RedirectAttributes - 리다이렉트 속성 및 플래시 속성 지정
  - Errors, BindingResult - 데이터 바인딩 및 검증 오류 접근
- 기타:
  - HttpMethod - 요청의 HTTP 메서드
  - Locale - 현재 요청 로케일
  - TimeZone, ZoneId - 현재 요청 시간대
  - UriComponentsBuilder - URL 준비
  - 단순 타입의 다른 인자들은 @RequestParam으로 해석됨
  - 복합 타입의 다른 인자들은 @ModelAttribute로 해석됨

## 3. 컨트롤러 메서드의 반환 값

- [레퍼런스](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/return-types.html)
- 응답 본문 관련 반환 값:
  - @ResponseBody - 반환 값이 HttpMessageConverter를 통해 응답 본문으로 변환됨
  - `HttpEntity<B>`, `ResponseEntity<B>` - 헤더와 본문을 포함한 전체 응답 지정
  - HttpHeaders - 본문 없이 헤더만 있는 응답 반환
  - ErrorResponse, ProblemDetail - RFC 9457 형식의 오류 응답 렌더링
- 뷰 관련 반환 값:
  - String - ViewResolver로 해석될 뷰 이름
  - View - 렌더링에 사용할 뷰 인스턴스
  - Map, Model - 암시적 모델에 추가될 속성
  - @ModelAttribute - 모델에 추가될 속성
  - ModelAndView - 사용할 뷰와 모델 속성, 선택적으로 응답 상태
  - FragmentsRendering, `Collection<ModelAndView>` - 여러 프래그먼트 렌더링
- 비동기 처리 관련 반환 값:
  - void - 특정 조건에서 응답이 완전히 처리됐음을 의미
  - `DeferredResult<V>` - 비동기적으로 값 생성
  - `Callable<V>` - Spring MVC 관리 스레드에서 비동기적으로 값 생성
  - `ListenableFuture<V>`, `CompletionStage<V>`, `CompletableFuture<V>` - DeferredResult의 대안
  - ResponseBodyEmitter, SseEmitter - 비동기적으로 객체 스트림 방출
  - StreamingResponseBody - 비동기적으로 응답 OutputStream에 쓰기
  - Reactor와 ReactiveAdapterRegistry로 등록된 다른 리액티브 타입 - 단일/다중 값 처리

## 4. @RequestParam

- [레퍼런스](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html)
- @RequestParam 어노테이션을 사용하여 서블릿 요청 파라미터(즉, 쿼리 파라미터 또는 폼 데이터)를 컨트롤러의 메서드 인자에 바인딩할 수 있습니다.
- 기본적으로 이 어노테이션을 사용하는 메서드 파라미터는 필수이지만, @RequestParam 어노테이션의 required 플래그를 false로 설정하거나 인자를 java.util.Optional 래퍼로 선언하여 메서드 파라미터가 선택적임을 지정할 수 있습니다.
- 대상 메서드 파라미터 타입이 String이 아닌 경우 타입 변환이 자동으로 적용됩니다. 타입 변환 섹션을 참조하세요.
- @RequestParam 어노테이션이 어노테이션에 파라미터 이름을 지정하지 않고 `Map<String, String>` 또는
  `MultiValueMap<String, String>`으로 선언된 경우, 맵은 각 파라미터 이름에 대한 요청 파라미터 값으로 채워집니다.
- 인자 타입을 배열이나 리스트로 선언하면 동일한 파라미터 이름에 대해 여러 파라미터 값을 받을 수 있습니다.
  - 예를 들어 `@RequestParam("name") String[] names`는 `?name=foo&name=bar`와 같은 요청을 처리할 수 있습니다.

### 4.1 암묵적 @RequestParam 처리

- 스프링 MVC는 특정 조건을 만족하는 메서드 파라미터에 @RequestParam 어노테이션을 명시적으로 붙이지 않아도 자동으로 요청 파라미터를 바인딩합니다.
- 다음 조건을 모두 만족하는 파라미터는 암묵적으로 @RequestParam으로 처리됩니다:
  - 파라미터 타입이 단순 값 타입일 때 (문자열, 숫자, 날짜 등의 기본 타입이나 그 래퍼 클래스)
  - 다른 어떤 인자 리졸버에 의해 처리되지 않을 때

 ```java
@GetMapping("/pets")
public String findPets(String name, int age) {
   return "petList";
}
```
- 위의 예시에서 name과 age는 단순 값 타입이므로 @RequestParam 어노테이션을 명시적으로 붙이지 않아도 스프링이 자동으로 요청 파라미터를 바인딩합니다.
- 이 기능은 코드를 간결하게 유지하는 데 도움이 되지만, 명시적으로 @RequestParam을 사용하면 코드 가독성이 향상되고 요청 파라미터 바인딩 의도가 명확해집니다.
- 따라서 명시적인 어노테이션 사용을 권장합니다.

## 5. @RequestHeader

- [레퍼런스](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestheader.html)
- @RequestHeader를 사용하면 HTTP 요청 헤더를 메서드 인자에 바인딩할 수 있습니다.

### 5.1 예시

```java
@GetMapping("/demo")
public void handle(
		@RequestHeader("Accept-Encoding") String encoding, 
		@RequestHeader("Keep-Alive") long keepAlive) { 
	//...
}
```

- `Accept-Encoding` 헤더의 값을 encoding 변수에 바인딩합니다.
- `Keep-Alive` 헤더의 값을 long 타입으로 변환하여 keepAlive 변수에 바인딩합니다.
- 만약 타겟 메서드 파라미터의 타입이 String이 아니면 타입 변환이 자동으로 적용됩니다.
- `Map<String, String>`, `MultiValueMap<String, String>` 또는
  `HttpHeaders`에 @RequestHeader를 사용하면 요청 헤더의 이름과 값을 모두 포함하는 맵을 생성할 수 있습니다.
- 인자 타입을 배열이나 리스트로 선언하면 동일한 파라미터 이름에 대해 여러 파라미터 값을 받을 수 있습니다.

### 5.2 속성

- `@RequestHeader`는 다음과 같은 속성을 지원합니다.
  - name: 요청 헤더 이름
  - value: name과 동일한 속성입니다. @RequestHeader(name = "foo")와 @RequestHeader(value = "foo")는 동일합니다.
  - required: 기본값은 true이며, 요청 헤더가 없으면 예외가 발생합니다. false로 설정하면 요청 헤더가 없어도 예외가 발생하지 않습니다.
  - defaultValue: 요청 헤더가 없을 때 사용할 기본값을 지정합니다. 이 값은 required 속성이 false일 때만 사용됩니다.

## 6. @ModelAttribute

- [레퍼런스](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html)
- @ModelAttribute 메서드 파라미터 어노테이션은 요청 파라미터, URI 경로 변수 및 요청 헤더를 모델 객체에 바인딩합니다.

```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public String processSubmit(@ModelAttribute Pet pet) { 
    // 메서드 로직...
}
```

- 위의 예시에서 @ModelAttribute 어노테이션을 사용하여 Pet 객체를 생성하고, 요청 파라미터를 해당 객체에 바인딩합니다.
- 요청 파라미터, URI 경로 변수 및 요청 헤더를 모델 객체에 바인딩합니다.

### 6.1 생성자 바인딩과 프로퍼티 바인딩

- Spring에서는 HTTP 요청 데이터를 객체에 바인딩하는 두 가지 주요 방식이 있습니다.
- 생성자 바인딩(Constructor Binding)과 프로퍼티 바인딩(Property Binding)입니다.
  - 생성자 바인딩: 객체 생성 시점에 생성자 매개변수로 값을 전달하여 객체를 초기화합니다.
  - 프로퍼티 바인딩: 객체가 생성된 후, setter 메서드를 통해 값을 설정합니다.
- 프로퍼티 바인딩은 유연하지만 몇 가지 보안 문제가 있습니다.
  - 불변성 보장 어려움: setter가 있으면 객체 상태가 언제든 변경될 수 있습니다.
- 따라서 Spring에서는 생성자 바인딩을 권장하고 있습니다.


### 6.2 암묵적 @ModelAttribute 처리

- 스프링 MVC 컨트롤러에서 메서드 파라미터를 처리할 때, 기본적으로 어떤 어노테이션도 붙어있지 않은 복잡한 객체는 자동으로 @ModelAttribute로 처리됩니다.
  - 이것이 바로 '암시적 @ModelAttribute' 처리입니다.
- 스프링은 다음 두 가지 조건을 모두 만족하는 파라미터를 암시적 @ModelAttribute로 처리합니다.
  - 단순 값 타입이 아닌 파라미터:
    - `BeanUtils.isSimpleProperty()`에 의해 판단됩니다.
    - 단순 값 타입에는 원시 타입(int, boolean 등), 그 래퍼 클래스들(Integer, Boolean 등), String, 날짜 관련 타입, 및 기타 몇 가지 기본적인 타입들이 포함됩니다.
    - 즉, 사용자 정의 클래스나 복잡한 객체는 단순 값 타입이 아니라고 판단됩니다.
  - 다른 인자 리졸버로 해결되지 않는 파라미터:
    - 스프링은 파라미터를 처리하기 위한 여러 리졸버를 가지고 있습니다.
    - 예를 들어, @RequestParam, @PathVariable, @RequestBody, @RequestHeader 등의 어노테이션이 붙은 파라미터는 각각의 전용 리졸버에 의해 처리됩니다.
    - 어떤 특정 리졸버에도 해당되지 않는 파라미터가 있다면, 그리고 그것이 단순 값 타입이 아니라면, 스프링은 이를 @ModelAttribute로 처리합니다.

#### 예시

```java
@PostMapping("/users")
public String createUser(User user) {
    // user 객체는 암시적으로 @ModelAttribute로 처리됨
    // HTTP 요청의 파라미터들이 user 객체의 필드에 바인딩됨
    userService.create(user);
    return "redirect:/users";
}
```

- 위 코드에서 User 클래스는 단순 값 타입이 아니고, 어떤 특별한 어노테이션도 붙어있지 않기 때문에 스프링은 이를 암시적으로 @ModelAttribute로 처리합니다.
- 즉, HTTP 요청의 파라미터들(쿼리 스트링, 폼 데이터 등)이 User 객체의 동일한 이름을 가진 필드에 자동으로 바인딩됩니다.
- 이 기능 덕분에 코드를 더 간결하게 작성할 수 있지만, 코드의 명확성을 위해 또는 GraalVM과 같은 특수한 환경에서는 명시적으로 @ModelAttribute 어노테이션을 사용하는 것이 좋습니다.

### 6.3 BindingResult

- 데이터 바인딩이 오류를 발생시키는 경우, 기본적으로 MethodArgumentNotValidException이 발생합니다.
  - 즉 컨트롤러 메서드가 호출되지 않습니다.
- 컨트롤러 메소드에서 이러한 오류를 처리하기 위해 @ModelAttribute 바로 다음에 BindingResult 인자를 추가할 수도 있습니다.
  - 이 경우 컨트롤러 메서드가 호출되고, BindingResult 인자에 바인딩 오류가 포함됩니다.
- BindingResult는 데이터 바인딩 및 검증 오류를 포함하는 객체입니다.
  - 객체에 타입 오류 등으로 바인딩이 실패하는 경우 스프링이 `FieldError` 생성해서 `BindingResult` 에 넣어줍니다.

```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public String processSubmit(@ModelAttribute("pet") Pet pet, BindingResult result) { 
	if (result.hasErrors()) {
		return "petForm";
	}
	// ...
}
```

- BindingResult는 @ModelAttribute와 함께 사용되며, @ModelAttribute가 처리하는 객체에 대한 바인딩 결과를 포함합니다.
- BindingResult는 @ModelAttribute 바로 다음에 위치해야 합니다.
- BindingResult는 데이터 바인딩 및 검증 오류를 포함하는 객체입니다.

## 7. @RequestBody

- [레퍼런스](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html)
- @RequestBody 어노테이션을 사용하면 요청 본문을 읽어 HttpMessageConverter를 통해 Object로 역직렬화할 수 있습니다.
  - MVC Config의 Message Converters 옵션을 사용하여 메시지 변환을 구성하거나 커스터마이징할 수 있습니다.
- 폼 데이터는 @RequestBody가 아닌 @RequestParam을 사용하여 읽어야 합니다.

### 7.1 예시

```java
@PostMapping("/accounts")
public void handle(@RequestBody Account account) {
    // ...
}
```

- 위의 예시에서 @RequestBody 어노테이션을 사용하여 요청 본문을 Account 객체로 역직렬화합니다.

### 7.2 검증

- @RequestBody는 jakarta.validation.Valid 또는 Spring의 @Validated 어노테이션과 함께 사용할 수 있으며, 두 경우 모두 표준 빈 검증이 적용됩니다.
- 기본적으로 유효성 검증 오류는 MethodArgumentNotValidException을 발생시키며, 이는 400(BAD_REQUEST) 응답으로 변환됩니다.
- 또는 다음 예시와 같이 컨트롤러 내에서 Errors 또는 BindingResult 인자를 통해 유효성 검증 오류를 로컬에서 처리할 수 있습니다:

```java
@PostMapping("/accounts")
public void handle(@Valid @RequestBody Account account, Errors errors) {
	// ...
}
```

- @Valid 애노테이션을 사용하여 Account 객체에 대한 유효성 검증을 수행합니다.
- Errors 객체를 통해 유효성 검증 오류를 확인할 수 있습니다.
  - 유효성 검증 오류가 발생하면 Errors 객체에 오류 정보가 담깁니다.

## 참고

- [Spring MVC Handler Methods](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods.html)
- https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html