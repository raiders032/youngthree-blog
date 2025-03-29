## 1. Annotated Controllers

- Spring MVC는 @Controller와 @RestController 컴포넌트가 요청 매핑, 요청 입력, 예외 처리 등을 표현하기 위해 어노테이션을 사용하는 어노테이션 기반 프로그래밍 모델을 제공합니다. 
- 어노테이션이 적용된 컨트롤러는 유연한 메소드 시그니처를 가지며 기본 클래스를 확장하거나 특정 인터페이스를 구현할 필요가 없습니다. 
- 다음 예제는 어노테이션으로 정의된 컨트롤러를 보여줍니다.

```java
@Controller
public class HelloController {

    @GetMapping("/hello")
    public String handle(Model model) {
        model.addAttribute("message", "Hello World!");
        return "index";
    }
}
```

- 위 예제에서 컨트롤러의 메서드는 유연한 메서드 시그니처를 가질 수 있습니다. 
  - 특별히 정해진 패턴이 없습니다.
- 특정 클래스를 확장하거나 인터페이스를 구현하지 않습니다.
- 위 예제에서 메소드는 Model을 매개변수로 받고 String 형태의 뷰 이름을 반환하지만, 이 외에도 많은 다른 옵션이 존재하며 뒷부분에서 설명됩니다.

##  2. Request Mapping

- @RequestMapping 어노테이션을 사용하여 컨트롤러 메소드에 요청을 매핑할 수 있습니다. 
- 이 어노테이션은 URL, HTTP 메소드, 요청 파라미터, 헤더 및 미디어 타입으로 매칭하기 위한 다양한 속성을 가지고 있습니다. 
- 클래스 레벨에서 공유 매핑을 표현하거나 메소드 레벨에서 특정 엔드포인트 매핑으로 좁히기 위해 사용할 수 있습니다.
- HTTP 메소드에 특화된 @RequestMapping의 단축 변형들이 있습니다:
  - @GetMapping
  - @PostMapping
  - @PutMapping
  - @DeleteMapping
  - @PatchMapping
- 왜냐하면, 대부분의 컨트롤러 메소드는 기본적으로 모든 HTTP 메소드와 일치하는 @RequestMapping을 사용하는 것보다 특정 HTTP 메소드에 매핑되어야 하기 때문입니다. 
- 공유 매핑을 표현하기 위해서는 여전히 클래스 레벨에서 @RequestMapping이 필요합니다.

### 2.1 URI 패턴

- @RequestMapping 메소드는 URL 패턴을 사용하여 매핑할 수 있습니다. 
- 두 가지 방법이 있습니다
  - PathPattern
    - URL 경로에 대해 사전 파싱된 패턴으로, 이 경로도 PathContainer로 사전 파싱됩니다. 
    - 웹 사용을 위해 설계되었으며, 인코딩 및 경로 파라미터를 효과적으로 다루고 효율적으로 매칭합니다.
  - AntPathMatcher
    - 문자열 경로에 대해 문자열 패턴을 매칭합니다. 
    - 이는 클래스패스, 파일 시스템 및 기타 위치에서 리소스를 선택하기 위해 Spring 구성에서도 사용되는 원래 솔루션입니다. 
    - 효율성이 떨어지고 문자열 경로 입력은 URL의 인코딩 및 기타 문제를 효과적으로 처리하는 데 어려움이 있습니다.
- PathPattern은 웹 애플리케이션에 권장되는 솔루션이며 Spring WebFlux에서는 유일한 선택입니다. 
  - Spring MVC에서는 버전 5.3부터 사용 가능하며 버전 6.0부터는 기본적으로 활성화됩니다.

### 2.2 Media Types

- @RequestMapping 메소드는 요청 및 응답의 미디어 타입을 매핑할 수 있습니다.

#### 2.2.1 Consumable Media Types

- 요청의 Content-Type을 기반으로 요청 매핑을 좁힐 수 있습니다
- 콘텐츠 타입으로 매핑을 제한하기 위해 consumes 속성을 사용합니다.
- consumes 속성은 부정 표현식도 지원합니다.
  - 예를 들어, !text/plain은 text/plain을 제외한 모든 콘텐츠 타입을 의미합니다.

```java
@PostMapping(path = "/pets", consumes = "application/json") 
public void addPet(@RequestBody Pet pet) {
    // ...
}
```

- 위 예제에서 @PostMapping은 요청 본문이 JSON 형식인 경우에만 매핑됩니다.

#### 2.2.2 Produces Media Types

- Accept 요청 헤더와 컨트롤러 메서드가 생성하는 콘텐츠 타입 목록을 기반으로 요청 매핑을 좁힐 수 있습니다.
- 콘텐츠 타입으로 매핑을 제한하기 위해 produces 속성을 사용합니다.
- 미디어 타입은 문자 집합을 지정할 수 있습니다. 부정 표현식도 지원됩니다. 
  - 예를 들어, !text/plain은 "text/plain"을 제외한 모든 콘텐츠 타입을 의미합니다.

```java
@GetMapping(path = "/pets/{petId}", produces = "application/json") 
@ResponseBody
public Pet getPet(@PathVariable String petId) {
    // ...
}
```

- 위 예제에서 @GetMapping은 요청의 Accept 헤더가 JSON 형식인 경우에만 매핑됩니다.

### 2.3 Request Parameters

- 요청 파라미터 조건을 기반으로 요청 매핑을 좁힐 수 있습니다. 
- 요청 파라미터의 존재 여부(myParam), 부재 여부(!myParam), 또는 특정 값(myParam=myValue)을 테스트할 수 있습니다.

```java
@GetMapping(path = "/pets/{petId}", params = "myParam=myValue") 
public void findPet(@PathVariable String petId) {
    // ...
}
```

- 위 예제에서 @GetMapping은 요청의 쿼리 파라미터가 myParam=myValue인 경우에만 매핑됩니다.

### 2.4 Request Headers

- 요청 헤더 조건을 기반으로 요청 매핑을 좁힐 수 있습니다.

```java
@GetMapping(path = "/pets/{petId}", headers = "myHeader=myValue") 
public void findPet(@PathVariable String petId) {
    // ...
}
```

- myHeader가 myValue와 일치하는지 테스트합니다.
- Content-Type과 Accept 헤더도 headers 조건으로 매칭할 수 있지만, 대신 consumes와 produces를 사용하는 것이 더 좋습니다.

## 참고

- https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html
- https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html