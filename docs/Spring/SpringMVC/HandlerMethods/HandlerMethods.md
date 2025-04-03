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
  - \@ResponseBody - 반환 값이 HttpMessageConverter를 통해 응답 본문으로 변환됨
  - HttpEntity\<B\>, ResponseEntity\<B\> - 헤더와 본문을 포함한 전체 응답 지정
  - HttpHeaders - 본문 없이 헤더만 있는 응답 반환
  - ErrorResponse, ProblemDetail - RFC 9457 형식의 오류 응답 렌더링
- 뷰 관련 반환 값:
  - String - ViewResolver로 해석될 뷰 이름
  - View - 렌더링에 사용할 뷰 인스턴스
  - Map, Model - 암시적 모델에 추가될 속성
  - \@ModelAttribute - 모델에 추가될 속성
  - ModelAndView - 사용할 뷰와 모델 속성, 선택적으로 응답 상태
  - FragmentsRendering, Collection\<ModelAndView\> - 여러 프래그먼트 렌더링
- 비동기 처리 관련 반환 값:
  - void - 특정 조건에서 응답이 완전히 처리됐음을 의미
  - DeferredResult\<V\> - 비동기적으로 값 생성
  - Callable\<V\> - Spring MVC 관리 스레드에서 비동기적으로 값 생성
  - ListenableFuture\<V\>, CompletionStage\<V\>, CompletableFuture\<V\> - DeferredResult의 대안
  - ResponseBodyEmitter, SseEmitter - 비동기적으로 객체 스트림 방출
  - StreamingResponseBody - 비동기적으로 응답 OutputStream에 쓰기
  - Reactor와 ReactiveAdapterRegistry로 등록된 다른 리액티브 타입 - 단일/다중 값 처리

## 4. @RequestParam

- [레퍼런스](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html)
- @RequestParam 어노테이션을 사용하여 서블릿 요청 파라미터(즉, 쿼리 파라미터 또는 폼 데이터)를 컨트롤러의 메서드 인자에 바인딩할 수 있습니다.
- 기본적으로 이 어노테이션을 사용하는 메서드 파라미터는 필수이지만, @RequestParam 어노테이션의 required 플래그를 false로 설정하거나 인자를 java.util.Optional 래퍼로 선언하여 메서드 파라미터가 선택적임을 지정할 수 있습니다.
- 대상 메서드 파라미터 타입이 String이 아닌 경우 타입 변환이 자동으로 적용됩니다. 타입 변환 섹션을 참조하세요.
- @RequestParam 어노테이션이 어노테이션에 파라미터 이름을 지정하지 않고 `Map<String, String>` 또는 `MultiValueMap<String, String>`으로 선언된 경우, 맵은 각 파라미터 이름에 대한 요청 파라미터 값으로 채워집니다.
- 인자 타입을 배열이나 리스트로 선언하면 동일한 파라미터 이름에 대해 여러 파라미터 값을 받을 수 있습니다.
  - 예를 들어 `@RequestParam("name") String[] names`는 `?name=foo&name=bar`와 같은 요청을 처리할 수 있습니다.

## 5. @ModelAttribute

- [레퍼런스](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html)
- @ModelAttribute 메서드 파라미터 어노테이션은 요청 파라미터, URI 경로 변수 및 요청 헤더를 모델 객체에 바인딩합니다.
- 이 어노테이션은 다음과 같은 데이터를 자바 객체에 바인딩합니다
  - 요청 파라미터(URL 쿼리 파라미터, 폼 데이터)
  - URI 경로 변수(path variables)
  - 요청 헤더

### 5.1 BindingResult

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

## 참고

- https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods.html
- https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html