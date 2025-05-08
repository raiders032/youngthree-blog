## 1. WebClient

- Spring WebFlux는 HTTP 요청을 수행하기 위한 클라이언트를 포함합니다.
- WebClient는 비동기 및 논블로킹 방식으로 HTTP 요청을 수행할 수 있는 클라이언트입니다.

### 1.1 HTTP client library

- WebClient는 실제 HTTP 요청을 수행하기 위해 하위 수준의 HTTP 클라이언트 라이브러리가 필요합니다.
- WebClient 자체는 리액티브 프로그래밍 모델을 위한 고수준 API를 제공하지만, 실제 네트워크 통신은 이러한 HTTP 클라이언트 라이브러리를 통해 이루어집니다.
- Spring WebFlux의 WebClient가 기본적으로 지원하는 HTTP 클라이언트 라이브러리들은 다음과 같습니다:
- Reactor Netty
  - Spring WebFlux의 기본 HTTP 클라이언트 라이브러리입니다.
  - Netty 기반으로 비동기 논블로킹 I/O를 제공합니다.
  - WebClient.create()를 호출하면 기본적으로 Reactor Netty 클라이언트가 사용됩니다.
  - 예: new ReactorClientHttpConnector(HttpClient.create())
- JDK HttpClient
  - Java 11부터 도입된 표준 HTTP 클라이언트입니다.
  - 비동기 요청을 지원합니다.
  - 예: new JdkClientHttpConnector()

#### 예시

```java
// Reactor Netty 사용 (기본값)
WebClient webClient = WebClient.create();

// 또는 명시적으로 설정
HttpClient httpClient = HttpClient.create(); // Reactor Netty 클라이언트
WebClient webClient = WebClient.builder()
    .clientConnector(new ReactorClientHttpConnector(httpClient))
    .build();

// JDK HttpClient 사용
java.net.http.HttpClient jdkHttpClient = java.net.http.HttpClient.newBuilder()
    .followRedirects(java.net.http.HttpClient.Redirect.NORMAL)
    .connectTimeout(Duration.ofSeconds(10))
    .build();
WebClient webClient = WebClient.builder()
    .clientConnector(new JdkClientHttpConnector(jdkHttpClient))
    .build();
```

- WebClient를 생성할 때 이러한 HTTP 클라이언트 중 하나를 선택하여 설정할 수 있습니다.
- 각 HTTP 클라이언트 라이브러리는 성능 특성, 기능, 설정 옵션이 다르므로 애플리케이션의 요구사항에 맞는 것을 선택할 수 있습니다.

## 2. Configuration

- [레퍼런스](https://docs.spring.io/spring-framework/reference/web/webflux-webclient/client-builder.html)

### 2.1 WebClient 생성

- WebClient를 생성하는 가장 간단한 방법은 다음의 정적 팩토리 메소드를 사용하는 것입니다.
  - `WebClient.create()`
- 더 많은 옵션을 위해 `WebClient.builder()`를 사용할 수도 있습니다.
  - uriBuilderFactory: 기본 URL로 사용할 맞춤형 UriBuilderFactory
  - defaultUriVariables: URI 템플릿 확장 시 사용할 기본값
  - defaultHeader: 모든 요청에 대한 헤더
  - defaultCookie: 모든 요청에 대한 쿠키
  - defaultRequest: 모든 요청을 커스터마이즈하기 위한 Consumer
  - filter: 모든 요청에 대한 클라이언트 필터
  - exchangeStrategies: HTTP 메시지 리더/라이터 커스터마이징
  - clientConnector: HTTP 클라이언트 라이브러리 설정
  - observationRegistry: 관찰성(Observability) 지원을 위한 레지스트리
  - observationConvention: 기록된 관찰에서 메타데이터를 추출하기 위한 선택적 커스텀 규칙

```java
WebClient client = WebClient.builder()
    .codecs(configurer -> ... )
    .build();
```

- WebClient의 builder 메서드로 WebClient를 생성할 수 있습니다.

```java
WebClient client1 = WebClient.builder()
    .filter(filterA).filter(filterB).build();

WebClient client2 = client1.mutate()
    .filter(filterC).filter(filterD).build();

// client1은 filterA, filterB를 가짐
// client2는 filterA, filterB, filterC, filterD를 가짐
```

- 한 번 빌드된 WebClient는 불변입니다.
- 그러나 복제하여 수정된 복사본을 위와 같이 만들 수 있습니다

### 2.2 MaxInMemorySize

- 코덱은 애플리케이션 메모리 문제를 방지하기 위해 메모리에 데이터를 버퍼링하는 제한이 있습니다.
- 기본적으로 이 값은 256KB로 설정되어 있습니다.
- 이것이 충분하지 않으면 다음과 같은 오류가 발생합니다
  - `org.springframework.core.io.buffer.DataBufferLimitException`

```java
WebClient webClient = WebClient.builder()
    .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
    .build();
```

- 위와 같이 maxInMemorySize를 설정하여 메모리 제한을 늘릴 수 있습니다.

## 3. retrieve 메서드

- retrieve() 메서드는 응답을 추출하는 방법을 선언하는 데 사용할 수 있습니다.
이 메서드를 호출한 후, 응답을 어떻게 처리할지 지정할 수 있는 다양한 메서드 체인을 제공합니다.


### 3.1 전체 ResponseEntity 가져오기

```java
WebClient client = WebClient.create("https://example.org");

Mono<ResponseEntity<Person>> result = client.get()
    .uri("/persons/{id}", id)
    .accept(MediaType.APPLICATION_JSON)
    .retrieve()
    .toEntity(Person.class);
```

- toEntity() 메서드는 HTTP 상태 코드, 헤더, 그리고 본문을 포함한 전체 ResponseEntity를 반환합니다. 
- 이는 응답의 모든 측면에 액세스해야 할 때 유용합니다.

### 3.2 본문만 가져오기

```java
WebClient client = WebClient.create("https://example.org");

Mono<Person> result = client.get()
    .uri("/persons/{id}", id)
    .accept(MediaType.APPLICATION_JSON)
    .retrieve()
    .bodyToMono(Person.class);
```

- bodyToMono()는 응답 본문만 추출하여 지정된 타입으로 변환합니다.
- Mono는 단일 결과를 나타내는 리액티브 타입입니다. 
- 즉, 하나의 Person 객체를 비동기적으로 받아오게 됩니다.

### 3.3 스트리밍 응답 처리

```java
Flux<Quote> result = client.get()
    .uri("/quotes")
    .accept(MediaType.TEXT_EVENT_STREAM)
    .retrieve()
    .bodyToFlux(Quote.class);
```

- bodyToFlux()는 여러 항목의 스트림을 처리할 때 사용합니다. 
- Flux는 0-N개의 결과를 비동기적으로 처리할 수 있는 리액티브 타입입니다. 
- 이 예제에서는 Server-Sent Events(SSE)를 사용하여 실시간으로 스트리밍되는 Quote 객체들을 처리합니다.

### 3.4 오류 처리 메커니즘

- 기본적으로 WebClient는 4xx나 5xx와 같은 오류 HTTP 상태 코드를 받으면 WebClientResponseException을 발생시킵니다. 
- 이 예외는 HTTP 상태 코드에 따라 다양한 하위 클래스(예: WebClientResponseException.NotFound - 404 오류의 경우)를 가지고 있습니다.
- onStatus 메서드를 이용하면 오류 응답을 사용자 정의 방식으로 처리할 수 있습니다.


```java
Mono<Person> result = client.get()
    .uri("/persons/{id}", id)
    .accept(MediaType.APPLICATION_JSON)
    .retrieve()
    .onStatus(
        HttpStatusCode::is4xxClientError, 
        response -> {
            // 클라이언트 오류 응답(4xx) 처리 로직
            if (response.statusCode().equals(HttpStatus.NOT_FOUND)) {
                return Mono.error(new PersonNotFoundException(id));
            }
            return Mono.error(new ClientErrorException(
                "Client error: " + response.statusCode()));
        }
    )
    .onStatus(
        HttpStatusCode::is5xxServerError, 
        response -> {
            // 서버 오류 응답(5xx) 처리 로직
            return Mono.error(new ServerErrorException(
                "Server error: " + response.statusCode()));
        }
    )
    .bodyToMono(Person.class);
```

- onStatus() 메서드는 두 개의 인자를 받습니다:
  - 상태 코드를 검사하는 predicate 함수
  - 조건이 일치할 때 실행할 함수(주로 커스텀 예외를 생성하는 로직)
- 이를 통해 오류 응답을 도메인별 예외로 변환하거나, 오류 응답 본문에서 상세 정보를 추출하는 등의 작업을 수행할 수 있습니다.

### 3.5 retrieve()와 exchange()의 차이점

- WebClient는 retrieve() 외에도 exchange() 메서드를 제공합니다.
  - retrieve()는 일반적인 사용 사례에 최적화된 고수준 API로, 응답 상태 코드 처리와 본문 추출을 간소화합니다.
  - exchange()는 응답 엔티티에 대한 더 많은 제어가 필요할 때 사용하는 저수준 API이지만, 리소스 해제를 직접 관리해야 하는 책임이 있습니다.
  - 대부분의 경우 retrieve()를 사용하는 것이 권장됩니다.
- 이러한 방식으로 WebClient의 retrieve() 메서드는 HTTP 응답을 처리하기 위한 유연하고 강력한 API를 제공하며, 리액티브 프로그래밍 모델에 맞게 비동기적으로 응답을 처리할 수 있게 해줍니다.

## 참고

- https://docs.spring.io/spring-framework/reference/web/webflux-webclient.html