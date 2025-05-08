## 

## 2. HttpHandler

- HttpHandler는 HTTP 요청과 응답을 처리하기 위한 단일 메서드를 가진 간단한 인터페이스입니다.
  - HTTP 요청 처리를 위한 가장 기본적인 계약(contract)만 정의합니다.
- 이 인터페이스는 의도적으로 최소한의 기능만 포함하고 있으며, 다양한 HTTP 서버 API를 추상화하는 것이 주요 목적입니다.

```java
package org.springframework.http.server.reactive;

import reactor.core.publisher.Mono;

public interface HttpHandler {
    Mono<Void> handle(ServerHttpRequest request, ServerHttpResponse response);
}
```

### 2.1 HttpHandler 어댑터

- Spring WebFlux에서 HttpHandler는 HTTP 요청 처리를 위한 단일 메서드를 갖는 간단한 인터페이스입니다.
- 하지만 Reactor Netty, Undertow, Tomcat 등의 서버들은 각자 고유한 API를 가지고 있습니다.
- 이러한 서버 API를 HttpHandler와 연결하기 위해 어댑터 패턴을 사용합니다.


## 3. WebHandler

- HttpHandler보다 약간 높은 수준의 웹 API입니다.
- 요청을 여러 WebExceptionHandler, 여러 WebFilter, 그리고 단일 WebHandler 컴포넌트의 체인을 통해 처리하기 위한 범용 웹 API를 제공합니다.
- 이를 기반으로 어노테이션 기반 컨트롤러나 함수형 엔드포인트와 같은 구체적인 프로그래밍 모델이 구축됩니다.
  - Spring WebFlux는 Spring MVC와 유사하게 프론트 컨트롤러 패턴을 중심으로 설계되었습니다.
  - 이 패턴에서는 중앙 WebHandler인 DispatcherHandler가 요청 처리를 위한 공통 알고리즘을 제공합니다.
  - [DispatcherHandler 참고](../DispatcherHandler/DispatcherHandler.md)

### 3.1 WebHandler 인터페이스

```java
package org.springframework.web.server;

import reactor.core.publisher.Mono;

public interface WebHandler {
    Mono<Void> handle(ServerWebExchange exchange);
}

```

- WebHandler는 ServerWebExchange라는 단일 인자를 받습니다.
- ServerWebExchange는 HTTP 요청과 응답을 포함하여 웹 요청 처리에 필요한 모든 정보를 제공합니다.