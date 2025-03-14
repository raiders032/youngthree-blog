---
title: "DispatcherHandler"
description: "Spring WebFlux의 핵심 컴포넌트인 DispatcherHandler의 동작 방식과 아키텍처를 Spring MVC의 DispatcherServlet과 비교하며 상세히 알아봅니다. Front Controller 패턴의 구현과 요청 처리 과정, 주요 컴포넌트들의 역할을 다룹니다."
tags: [ "WEBFLUX", "SPRING", "SPRING_MVC", "REACTIVE", "BACKEND", "JAVA" ]
keywords: [ "디스패처핸들러", "dispatcher handler", "스프링웹플럭스", "spring webflux", "스프링", "spring", "리액티브", "reactive", "디스패처서블릿", "dispatcher servlet", "스프링MVC", "spring mvc", "웹플럭스", "webflux", "프론트컨트롤러", "front controller" ]
draft: false
hide_title: true
---

## 1. DispatcherHandler 소개

- Spring WebFlux의 DispatcherHandler는 Spring MVC의 DispatcherServlet과 유사한 역할을 하는 핵심 컴포넌트입니다.
- 두 프레임워크 모두 Front Controller 패턴을 기반으로 설계되었으며, 중앙 집중형 컴포넌트를 통해 요청을 처리합니다.

:::info[Front Controller 패턴이란?]
Front Controller 패턴은 모든 웹 요청을 단일 진입점에서 처리하는 디자인 패턴입니다.
이 패턴의 주요 특징은:

- 모든 요청이 하나의 컨트롤러를 통과
- 요청에 대한 공통 처리 로직 중앙화
- 보안, 로깅, 라우팅 등의 횡단 관심사를 효율적으로 처리
- 뷰나 비즈니스 로직으로의 제어 흐름을 일관되게 관리
  :::

### 1.1 Front Controller 패턴 구현

- Spring MVC: DispatcherServlet이 모든 웹 요청의 진입점 역할
- Spring WebFlux: DispatcherHandler가 reactive 스택에서 같은 역할 수행

### 1.2 주요 특징

- **공유 알고리즘을 통한 요청 처리**
	- DispatcherHandler는 모든 요청에 대해 일관된 처리 알고리즘을 제공합니다.
- **위임 컴포넌트를 통한 실제 작업 수행**
	- 실제 비즈니스 로직의 처리는 각각의 전문화된 컴포넌트들에게 위임됩니다.
	- 예를 들어, HandlerMapping은 요청 경로 분석을, HandlerAdapter는 실제 핸들러 실행을, HandlerResultHandler는 결과 처리를 담당합니다.
- **유연한 워크플로우 지원**
	- 각 단계별로 다양한 구현체를 제공하고 있어, 개발자는 자신의 요구사항에 맞는 컴포넌트를 선택하거나 직접 구현하여 사용할 수 있습니다.
	- 예를 들어 @RequestMapping 기반의 핸들러뿐만 아니라 함수형 엔드포인트도 동일한 구조 내에서 처리할 수 있습니다.
- **Spring 설정을 통한 위임 컴포넌트 자동 발견**
	- ApplicationContext를 통해 필요한 컴포넌트들을 자동으로 찾아 구성합니다.
	- 개발자는 원하는 컴포넌트를 Bean으로 등록하기만 하면 되며, DispatcherHandler가 이를 자동으로 찾아 적절한 시점에 사용합니다.

## 2. 기본 아키텍처

### 2.1 WebFlux 애플리케이션의 주요 구성요소

Spring WebFlux 애플리케이션은 다음과 같은 주요 컴포넌트들로 구성됩니다

- webHandler라는 빈 이름을 가진 DispatcherHandler: 모든 웹 요청의 진입점으로, 전체 요청 처리 과정을 조율합니다.
- WebFilter와 WebExceptionHandler
	- WebFilter는 요청이 DispatcherHandler에 도달하기 전에 가장 먼저 동작합니다
	- 인증, 로깅, CORS 처리 등 공통적인 전처리 작업을 수행합니다
	- 필터 체인을 통해 순차적으로 실행되며, 각 필터는 다음 필터로 요청을 전달합니다
	- WebExceptionHandler는 전체 처리 과정에서 발생하는 예외를 캐치하여 적절한 오류 응답을 생성합니다
- DispatcherHandler 전용 빈들의 협력 과정
	- HandlerMapping이 요청 URL과 매칭되는 핸들러를 찾습니다
	- 찾은 핸들러는 HandlerAdapter를 통해 실행됩니다
	- 핸들러의 실행 결과는 HandlerResultHandler가 받아 최종 응답으로 변환합니다
	- 자세한 내용은 아래에서 다루겠습니다.

### 2.2 요청 처리 체인 구성

```java
ApplicationContext context = ...
HttpHandler handler = WebHttpHandlerBuilder.applicationContext(context).build();
```

이렇게 구성된 HttpHandler는 서버 어댑터와 함께 사용할 준비가 완료됩니다.

### 2.3 ServerWebExchange 이해하기

- ServerWebExchange는 Spring WebFlux에서 웹 요청-응답 교환을 나타내는 인터페이스입니다.
	- 쉽게 말해 "HTTP 요청/응답과 관련된 모든 정보를 담고 있는 컨테이너"입니다.
- Spring MVC의 ServletRequest/ServletResponse와 유사한 역할을 하지만, 리액티브 스택에 맞게 설계되었습니다.

#### 주요 특징과 역할

- **요청-응답 컨텍스트**
	- HTTP 요청과 응답에 대한 접근을 제공합니다
	- 요청 처리에 필요한 추가 컨텍스트 정보를 포함합니다
	- 세션 관리, 요청 속성, 경로 변수 등을 처리합니다
- **불변성 보장**
	- 모든 mutating 메서드는 새로운 ServerWebExchange 인스턴스를 반환합니다
	- 이는 리액티브 프로그래밍의 불변성 원칙을 따릅니다
	- 여러 스레드에서 안전하게 접근할 수 있습니다

#### 주요 메서드와 기능

```java
public interface ServerWebExchange {
    // 요청 관련
    ServerHttpRequest getRequest();
    
    // 응답 관련
    ServerHttpResponse getResponse();
    
    // 세션 관리
    Mono<WebSession> getSession();
    
    // 요청 속성 관리
    Map<String, Object> getAttributes();
    
    // 경로 변수 접근
    Map<String, String> getPathVariables();
    
    // 폼 데이터 접근
    Mono<MultiValueMap<String, String>> getFormData();
    
    // 멀티파트 데이터 접근
    Mono<MultiValueMap<String, Part>> getMultipartData();
}
```

#### 실제 사용 예시

```java
@RestController
public class UserController {
    @GetMapping("/users/{id}")
    public Mono<User> getUser(ServerWebExchange exchange) {
        // 경로 변수 접근
        String userId = exchange.getPathVariables().get("id");
        
        // 요청 헤더 접근
        String authorization = exchange.getRequest()
            .getHeaders()
            .getFirst("Authorization");
            
        // 요청 속성 설정
        exchange.getAttributes().put("user-id", userId);
        
        // 비즈니스 로직 수행
        return userService.findById(userId);
    }
}
```

:::tip[ServerWebExchange vs ServletRequest/Response]
Spring MVC의 ServletRequest/Response와 비교했을 때 ServerWebExchange의 주요 차이점:

- 리액티브 스트림 지원: 비동기-논블로킹 처리 가능
- 불변성 보장: 모든 수정 작업이 새 인스턴스 생성
- 통합된 컨텍스트: 요청/응답 관련 정보를 하나의 객체로 관리
- 함수형 스타일: 명령형이 아닌 선언적 프로그래밍 지원
  :::

## 3. 특수 빈 타입

- DispatcherHandler는 요청을 처리하고 적절한 응답을 만들기 위해 특별한 빈들에게 작업을 위임합니다.
- 이러한 빈들은 보통 기본 구현체가 제공되지만, 속성을 커스터마이징하거나, 확장하거나, 완전히 다른 구현체로 교체할 수 있습니다.
- DispatcherHandler는 다음과 같은 특수 빈들에게 작업을 위임합니다
	- HandlerMapping: 요청을 적절한 핸들러에 매핑
	- HandlerAdapter: 핸들러를 실행하고 결과를 HandlerResult로 래핑
	- HandlerResultHandler: 핸들러 실행 결과를 처리하고 응답을 완성

### 3.1 HandlerMapping

- HandlerMapping은 요청을 적절한 핸들러에 매핑하는 역할을 합니다.

#### 3.1 HandlerMapping 인터페이스

```java
public interface HandlerMapping {
    Mono<Object> getHandler(ServerWebExchange exchange);
}
```

- `getHandler()`: 파리미터로 입력 받은 ServerWebExchange에 매칭되는 핸들러를 반환합니다.
- 주요 구현체로는:
	- RequestMappingHandlerMapping: @RequestMapping 어노테이션이 붙은 메서드용
	- RouterFunctionMapping: 함수형 엔드포인트 라우트용
	- SimpleUrlHandlerMapping: URI 패턴과 WebHandler 인스턴스의 명시적 등록용

#### 3.2 HandlerMapping 구현체별 설정 예시

##### RequestMappingHandlerMapping 설정 예시

- RequestMappingHandlerMapping은 @RequestMapping 어노테이션을 사용한 컨트롤러 메서드를 등록하고 매핑합니다.

```java
@Configuration
@EnableWebFlux
public class WebFluxConfig {
    
    @Bean
    public RequestMappingHandlerMapping requestMappingHandlerMapping() {
        RequestMappingHandlerMapping mapping = new RequestMappingHandlerMapping();
        mapping.setOrder(0);  // 우선순위 설정
        mapping.setUseSuffixPatternMatch(false);  // 접미사 패턴 매칭 비활성화
        mapping.setUseTrailingSlashMatch(true);   // 후행 슬래시 매칭 활성화
        
        // 커스텀 패스매처 설정 (옵션)
        PathPatternParser patternParser = new PathPatternParser();
        patternParser.setCaseSensitive(false);    // 대소문자 구분 비활성화
        mapping.setPatternParser(patternParser);
        
        return mapping;
    }
}
```

```java
@RestController
@RequestMapping("/api")
public class UserController {
    
    @GetMapping("/users/{id}")
    public Mono<User> getUser(@PathVariable String id) {
        return userService.findById(id);
    }
    
    @PostMapping("/users")
    public Mono<User> createUser(@RequestBody User user) {
        return userService.save(user);
    }
}
```

##### RouterFunctionMapping 설정 예시

- RouterFunctionMapping은 함수형 엔드포인트 방식으로 라우트를 정의합니다.

```java
@Configuration
public class RoutesConfig {
    
    @Bean
    public RouterFunctionMapping routerFunctionMapping() {
        RouterFunctionMapping mapping = new RouterFunctionMapping();
        mapping.setOrder(-1);  // RequestMappingHandlerMapping보다 높은 우선순위
        return mapping;
    }
    
    @Bean
    public RouterFunction<ServerResponse> userRoutes(UserHandler userHandler) {
        return route()
            .GET("/api/users/{id}", userHandler::getUser)
            .POST("/api/users", userHandler::createUser)
            .build();
    }
}
```

```java
@Component
public class UserHandler {
    
    private final UserService userService;
    
    public UserHandler(UserService userService) {
        this.userService = userService;
    }
    
    public Mono<ServerResponse> getUser(ServerRequest request) {
        String id = request.pathVariable("id");
        return userService.findById(id)
            .flatMap(user -> ServerResponse.ok().bodyValue(user))
            .switchIfEmpty(ServerResponse.notFound().build());
    }
    
    public Mono<ServerResponse> createUser(ServerRequest request) {
        return request.bodyToMono(User.class)
            .flatMap(userService::save)
            .flatMap(savedUser -> 
                ServerResponse.created(URI.create("/api/users/" + savedUser.getId()))
                    .bodyValue(savedUser)
            );
    }
}
```

##### SimpleUrlHandlerMapping 설정 예시

- SimpleUrlHandlerMapping은 URL 패턴을 직접 WebHandler 인스턴스에 매핑합니다.
- 기본적으로 HTTP 메서드를 구분하지 않습니다.

```java
@Configuration
public class WebHandlerConfig {
    
    @Bean
    public SimpleUrlHandlerMapping simpleUrlHandlerMapping() {
        Map<String, Object> urlMap = new HashMap<>();
        
        // 특정 경로에 WebHandler 인스턴스 매핑
        urlMap.put("/resources/**", resourceWebHandler());
        urlMap.put("/ws/**", webSocketHandler());
        urlMap.put("/metrics", metricsHandler());
        
        SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping();
        mapping.setUrlMap(urlMap);
        mapping.setOrder(10);  // 우선순위 설정 (값이 클수록 우선순위 낮음)
        
        return mapping;
    }
    
    @Bean
    public ResourceWebHandler resourceWebHandler() {
        ResourceWebHandler handler = new ResourceWebHandler();
        handler.setLocations(Arrays.asList(
            new ClassPathResource("static/"),
            new FileSystemResource("/path/to/resources/")
        ));
        return handler;
    }
    
    @Bean
    public WebSocketHandler webSocketHandler() {
        // WebSocket 핸들러 구현체 반환
        return new CustomWebSocketHandler();
    }
    
    @Bean
    public WebHandler metricsHandler() {
        // 커스텀 WebHandler 구현체 반환
        return new MetricsWebHandler();
    }
}
```

```java
public class MetricsWebHandler implements WebHandler {
    
    @Override
    public Mono<Void> handle(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        
        // 메트릭 데이터 생성
        Map<String, Object> metrics = collectMetrics();
        
        // 응답 데이터 설정
        DataBufferFactory bufferFactory = response.bufferFactory();
        try {
            byte[] bytes = new ObjectMapper().writeValueAsBytes(metrics);
            DataBuffer buffer = bufferFactory.wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (Exception e) {
            return Mono.error(e);
        }
    }
    
    private Map<String, Object> collectMetrics() {
        // 애플리케이션 메트릭 수집 로직
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("memory", Runtime.getRuntime().totalMemory());
        metrics.put("threads", Thread.activeCount());
        metrics.put("uptime", ManagementFactory.getRuntimeMXBean().getUptime());
        return metrics;
    }
}
```

### 3.2 HandlerAdapter

- DispatcherHandler가 매핑된 핸들러를 실제로 호출할 수 있도록 도와주는 역할을 합니다.
- 예를 들어, 어노테이션이 붙은 컨트롤러를 호출하기 위해서는 해당 어노테이션들을 분석해야 하는데, HandlerAdapter가 이러한 세부사항을 DispatcherHandler로부터 숨깁니다.

#### 3.2 HandlerAdapter 인터페이스

```java
public interface HandlerAdapter {
    boolean supports(Object handler);

    Mono<HandlerResult> handle(ServerWebExchange exchange, Object handler);
}
```

- `supports()`: 핸들러가 해당 어댑터에 의해 처리될 수 있는지 여부를 반환합니다.
- `handle()`: 핸들러를 실행하고 결과를 HandlerResult로 래핑합니다.
- 주요 구현체로는:
	- RequestMappingHandlerAdapter: @RequestMapping 어노테이션이 붙은 메서드용
	- RouterFunctionAdapter: 함수형 엔드포인트 라우트용
	- SimpleHandlerAdapter: WebHandler 인스턴스의 명시적 등록용

### 3.3 HandlerResultHandler

- 핸들러 실행 결과를 처리하고 응답을 완성하는 역할을 담당합니다.
- 주요 구현체들은 다음과 같습니다:

| 결과 핸들러 타입                   | 처리하는 반환값                                         | 기본 우선순위           |
|-----------------------------|--------------------------------------------------|-------------------|
| ResponseEntityResultHandler | ResponseEntity (주로 @Controller에서 사용)             | 0                 |
| ServerResponseResultHandler | ServerResponse (주로 함수형 엔드포인트에서 사용)               | 0                 |
| ResponseBodyResultHandler   | @ResponseBody 메서드나 @RestController 클래스의 반환값      | 100               |
| ViewResolutionResultHandler | CharSequence, View, Model, Map 등 모델 속성으로 처리되는 객체 | Integer.MAX_VALUE |

## 4. 요청 처리 프로세스

DispatcherHandler의 요청 처리 과정은 다음과 같습니다:

1. 각 HandlerMapping에 매칭되는 핸들러를 찾도록 요청
2. 첫 번째로 매칭된 핸들러를 사용
3. 적절한 HandlerAdapter를 통해 핸들러 실행
4. 실행 결과를 HandlerResult로 래핑
5. HandlerResultHandler를 통해 처리를 완료하고 응답 작성

## 5. 예외 처리

### 5.1 예외 처리 메커니즘

:::warning
WebFlux에서의 예외 처리는 비동기 특성을 고려해야 합니다:

- HandlerAdapter는 요청 핸들러 실행 중 발생하는 예외를 내부적으로 처리
- 비동기 값을 반환하는 경우 예외가 지연될 수 있음
- DispatchExceptionHandler를 통한 예외 처리 지원
  :::

### 5.2 주요 예외 처리 시점

- 핸들러 매핑 전 발생하는 예외
- WebFilter 실행 중 발생하는 예외
- 핸들러 실행 결과 처리 중 발생하는 예외

## 6. 마치며

- Spring WebFlux의 DispatcherHandler는 Spring MVC의 DispatcherServlet과 유사한 패턴을 따르지만, reactive 스택에 맞게 재설계되었습니다.
- 두 프레임워크 모두 Front Controller 패턴을 통해 요청을 중앙에서 관리하며, 실제 처리는 위임 컴포넌트들에게 맡기는 구조를 가지고 있습니다.
- 이러한 설계는 높은 확장성과 유연성을 제공하며, 각각의 환경에 맞는 최적화된 성능을 제공합니다.