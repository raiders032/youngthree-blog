---
title: "Spring Cloud OpenFeign 완벽 가이드: 선언적 HTTP 클라이언트의 모든 것"
description: "Spring Cloud OpenFeign을 사용하여 마이크로서비스 간 통신을 구현하는 방법을 상세히 알아봅니다. 기본 설정부터 고급 커스터마이징까지, 실무에서 바로 활용할 수 있는 예제와 함께 설명합니다."
tags: [ "OPENFEIGN", "SPRING_CLOUD", "MICROSERVICE", "REST_CLIENT", "SPRING", "BACKEND", "JAVA" ]
keywords: [ "OpenFeign", "오픈페인", "Feign", "페인", "Spring Cloud OpenFeign", "스프링 클라우드 오픈페인", "HTTP 클라이언트", "HTTP Client", "선언적 클라이언트", "Declarative Client", "마이크로서비스", "Microservice", "RestTemplate", "WebClient", "REST API", "스프링", "Spring" ]
draft: false
hide_title: true
---

## 1. Spring Cloud OpenFeign이란?

### 1.1 개념과 등장 배경

- Spring Cloud OpenFeign은 Netflix에서 개발한 Feign을 Spring Cloud 생태계에 통합한 선언적 HTTP 클라이언트 라이브러리입니다.
- 기존의 RestTemplate이나 WebClient를 사용할 때 발생하는 반복적인 코드 작성과 복잡한 설정을 해결하기 위해 등장했습니다.
- 인터페이스와 어노테이션만으로 HTTP API를 호출할 수 있어, 마치 로컬 메서드를 호출하는 것처럼 간단하게 외부 서비스와 통신할 수 있습니다.

#### 1.1.1 기존 방식의 문제점

```java
// RestTemplate을 사용한 기존 방식
@Service
public class UserService {
    private final RestTemplate restTemplate;
    
    public User getUser(Long userId) {
        String url = "http://user-service/users/" + userId;
        
        try {
            ResponseEntity<User> response = restTemplate.getForEntity(url, User.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            }
            throw new UserNotFoundException("User not found");
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new UserNotFoundException("User not found");
            }
            throw new ServiceException("Failed to get user", e);
        }
    }
}
```

- 위 코드의 문제점은 다음과 같습니다.
  - URL 구성, 예외 처리, 응답 검증 등 비즈니스 로직과 무관한 코드가 많습니다.
  - 동일한 패턴의 코드가 API 호출마다 반복됩니다.
  - 타입 안정성이 떨어지고 리팩토링이 어렵습니다.

#### 1.1.2 Feign을 사용한 개선

```java
// Feign Client 인터페이스
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/users/{userId}")
    User getUser(@PathVariable("userId") Long userId);
}

// 사용하는 서비스
@Service
public class UserService {
    private final UserClient userClient;
    
    public User getUser(Long userId) {
        return userClient.getUser(userId);
    }
}
```

- 개선된 점은 다음과 같습니다.
  - HTTP 통신 관련 코드가 완전히 숨겨집니다.
  - 인터페이스 기반으로 타입 안정성이 보장됩니다.
  - Spring MVC와 동일한 어노테이션을 사용하여 학습 곡선이 낮습니다.

### 1.2 주요 특징과 장점

- **선언적 접근 방식**
	- 인터페이스 선언만으로 HTTP 클라이언트를 생성합니다.
	- Spring이 런타임에 프록시 객체를 생성하여 실제 HTTP 호출을 처리합니다.
	- 개발자는 비즈니스 로직에만 집중할 수 있습니다.
- **Spring 생태계와의 완벽한 통합**
	- Spring MVC 어노테이션을 그대로 사용할 수 있습니다.
	- Spring Boot의 자동 설정을 활용합니다.
	- Spring Cloud LoadBalancer와 자동으로 통합됩니다.
- **확장 가능한 아키텍처**
	- 인코더/디코더를 커스터마이징하여 다양한 데이터 형식을 지원합니다.
	- 인터셉터를 통해 공통 로직(인증, 로깅 등)을 쉽게 추가할 수 있습니다.
	- 에러 디코더를 통해 일관된 예외 처리가 가능합니다.

## 2. 프로젝트 설정

### 2.1 의존성 추가

```gradle
// build.gradle
dependencies {
    implementation 'org.springframework.cloud:spring-cloud-starter-openfeign'
}

// Spring Cloud 버전 관리
dependencyManagement {
    imports {
        mavenBom "org.springframework.cloud:spring-cloud-dependencies:${springCloudVersion}"
    }
}
```

:::tip
Spring Cloud OpenFeign은 Spring Cloud의 버전 관리를 따르므로, 사용 중인 Spring Boot 버전과 호환되는 Spring Cloud 버전을 확인해야 합니다.
:::

### 2.2 Feign Client 활성화

```java
@SpringBootApplication
@EnableFeignClients
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

- @EnableFeignClients 어노테이션의 주요 속성
  - `basePackages`: 스캔할 패키지를 지정합니다.
  - `basePackageClasses`: 스캔할 패키지를 클래스로 지정합니다.
  - `defaultConfiguration`: 모든 Feign 클라이언트에 적용할 기본 설정을 지정합니다.
  - `clients`: 특정 Feign 클라이언트만 등록하고 싶을 때 사용합니다.

:::warning
@Configuration 클래스에서 @EnableFeignClients를 사용할 때는 반드시 스캔 범위를 명시해야 합니다. 그렇지 않으면 Feign 클라이언트를 찾을 수 없습니다.
:::

## 3. 기본 사용법

### 3.1 첫 번째 Feign Client 만들기

```java
@FeignClient(name = "product-service", url = "http://localhost:8081")
public interface ProductClient {
    
    @GetMapping("/products/{id}")
    Product getProduct(@PathVariable("id") Long id);
    
    @GetMapping("/products")
    List<Product> getProducts(@RequestParam("category") String category);
    
    @PostMapping("/products")
    Product createProduct(@RequestBody Product product);
    
    @PutMapping("/products/{id}")
    Product updateProduct(@PathVariable("id") Long id, @RequestBody Product product);
    
    @DeleteMapping("/products/{id}")
    void deleteProduct(@PathVariable("id") Long id);
}
```

### 3.2 서비스에서 사용하기

```java
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductClient productClient;
    
    public Product findProductById(Long id) {
        try {
            return productClient.getProduct(id);
        } catch (FeignException.NotFound e) {
            throw new ProductNotFoundException("Product not found with id: " + id);
        }
    }
    
    public List<Product> findProductsByCategory(String category) {
        return productClient.getProducts(category);
    }
}
```

## 4. 고급 설정

### 4.1 Named Client 이해하기

- Feign에서 각 클라이언트는 "named client"라는 개념으로 관리됩니다.
- @FeignClient의 name 속성이 바로 이 named client의 이름이 됩니다.
- Spring Cloud는 각 named client마다 독립적인 ApplicationContext를 생성하여 클라이언트별로 다른 설정을 적용할 수 있게 합니다.
- 이를 통해 서비스별로 다른 타임아웃, 재시도 정책, 인증 방식 등을 적용할 수 있습니다.

```java
@FeignClient(name = "payment-service")
public interface PaymentClient {
    @PostMapping("/payments")
    PaymentResult processPayment(@RequestBody PaymentRequest request);
}

@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/users/{id}")
    User getUser(@PathVariable("id") Long id);
}
```

- 이렇게 name으로 구분된 각 Feign Client는 독립적으로 설정할 수 있습니다.

```yml
spring:
  cloud:
    openfeign:
      client:
        config:
          payment-service:  # name="payment-service"인 클라이언트 설정
            connectTimeout: 10000
            readTimeout: 30000
          user-service:     # name="user-service"인 클라이언트 설정
            connectTimeout: 3000
            readTimeout: 3000
```

### 4.2 Configuration 클래스를 통한 커스터마이징

- 앞서 본 것처럼 application.yml로도 설정이 가능하지만, 더 복잡한 설정이나 프로그래밍 방식의 설정이 필요할 때는 Configuration 클래스를 사용합니다.

```java
// 결제 서비스에 특별한 설정이 필요한 경우
@FeignClient(name = "payment-service", configuration = PaymentClientConfig.class)
public interface PaymentClient {
    @PostMapping("/payments")
    PaymentResult processPayment(@RequestBody PaymentRequest request);
}

// @Configuration 어노테이션을 붙이지 않음 (중요!)
public class PaymentClientConfig {
    
    @Bean
    public Request.Options requestOptions() {
        // 연결 타임아웃 10초, 읽기 타임아웃 30초
        return new Request.Options(10000, 30000);
    }
    
    @Bean
    public Retryer retryer() {
        // 100ms 간격으로 최대 3번 재시도
        return new Retryer.Default(100, 1000, 3);
    }
    
    @Bean
    public ErrorDecoder errorDecoder() {
        return new PaymentErrorDecoder();
    }
    
    @Bean
    public RequestInterceptor authInterceptor() {
        return template -> {
            template.header("Authorization", "Bearer " + getToken());
        };
    }
}
```

:::danger
Configuration 클래스에 @Configuration을 붙이면 전역 설정이 되어 모든 Feign Client에 영향을 줄 수 있습니다. 특정 클라이언트에만 적용하려면 @Configuration을 붙이지
마세요.
:::

### 4.3 application.yml을 통한 설정

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          # 특정 클라이언트 설정
          payment-service:
            connectTimeout: 10000
            readTimeout: 30000
            loggerLevel: FULL
            errorDecoder: com.example.PaymentErrorDecoder
            retryer: com.example.CustomRetryer
            requestInterceptors:
              - com.example.AuthInterceptor
              - com.example.LoggingInterceptor

          user-service:
            connectTimeout: 3000
            readTimeout: 3000
            loggerLevel: BASIC

          # 모든 클라이언트 기본 설정
          default:
            connectTimeout: 5000
            readTimeout: 5000
            loggerLevel: NONE
```

### 4.4 설정 우선순위

설정은 다음 순서로 적용됩니다 (아래로 갈수록 우선순위가 높음):

1. FeignClientsConfiguration (Spring의 기본 설정)
2. application.yml의 default 설정
3. application.yml의 named client 설정
4. @FeignClient의 configuration 속성으로 지정한 클래스

## 5. HTTP 클라이언트 선택

### 5.1 기본 클라이언트의 한계

- Feign은 기본적으로 Java의 HttpURLConnection을 사용합니다.
- 연결 풀링이 제한적이고 성능이 상대적으로 떨어집니다.
- 프로덕션 환경에서는 더 나은 HTTP 클라이언트를 사용하는 것이 권장됩니다.

### 5.2 Apache HttpClient 5 사용하기

```gradle
dependencies {
    implementation 'io.github.openfeign:feign-hc5'
}
```

```yaml
spring:
  cloud:
    openfeign:
      httpclient:
        hc5:
          enabled: true
          # 연결 풀 설정
          max-connections: 200
          max-connections-per-route: 50
          time-to-live: 900
          time-to-live-unit: SECONDS
```

### 5.3 OkHttpClient 사용하기

```gradle
dependencies {
    implementation 'io.github.openfeign:feign-okhttp'
}
```

```yaml
spring:
  cloud:
    openfeign:
      okhttp:
        enabled: true
```

## 6. 에러 처리

### 6.1 커스텀 ErrorDecoder 구현

```java
public class CustomErrorDecoder implements ErrorDecoder {
    
    @Override
    public Exception decode(String methodKey, Response response) {
        switch (response.status()) {
            case 400:
                return new BadRequestException("잘못된 요청입니다");
            case 404:
                return new ResourceNotFoundException("리소스를 찾을 수 없습니다");
            case 500:
                return new InternalServerException("서버 오류가 발생했습니다");
            default:
                return new Exception("알 수 없는 오류가 발생했습니다");
        }
    }
}
```

### 6.2 Fallback 처리

```java
@FeignClient(
    name = "product-service",
    fallback = ProductClientFallback.class
)
public interface ProductClient {
    @GetMapping("/products/{id}")
    Product getProduct(@PathVariable("id") Long id);
}

@Component
public class ProductClientFallback implements ProductClient {
    
    @Override
    public Product getProduct(Long id) {
        // 기본값 반환 또는 캐시된 데이터 반환
        return Product.builder()
            .id(id)
            .name("Default Product")
            .available(false)
            .build();
    }
}
```

## 7. 로깅 설정

### 7.1 로깅 레벨

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          default:
            loggerLevel: FULL

logging:
  level:
    com.example.client: DEBUG
```

로깅 레벨 옵션:

- `NONE`: 로깅 없음 (기본값)
- `BASIC`: 요청 메서드, URL, 응답 상태, 실행 시간
- `HEADERS`: BASIC + 요청/응답 헤더
- `FULL`: HEADERS + 요청/응답 본문

## 8. URL 설정 우선순위

- [레퍼런스](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/#supported-ways-to-provide-url-to-a-feign-client)
- Feign 클라이언트에 URL을 제공하는 케이스는 다음과 같이 나눌 수 있습니다.

### 8.1 @FeignClient 어노테이션에서 URL을 제공하는 경우

- 아래와 같이 설정한 경우
  - `@FeignClient(name="testClient", url="http://localhost:8081")`
- URL은 어노테이션의 url 속성에서 해석되며, 로드 밸런싱 없이 처리됩니다.

### 8.2 @FeignClient 어노테이션과 설정 프로퍼티 모두에서 URL을 제공하는 경우

- 아래와 같이 설정한 경우
  - `@FeignClient(name="testClient", url="http://localhost:8081")`
  - application.yml에`spring.cloud.openfeign.client.config.testClient.url=http://localhost:8081` 프로퍼티 정의
- URL은 어노테이션의 url 속성에서 해석되며, 로드 밸런싱 없이 처리됩니다. 설정 프로퍼티에서 제공된 URL은 사용되지 않습니다.

### 8.3 @FeignClient 어노테이션에서는 URL을 제공하지 않고 설정 프로퍼티에서만 제공하는 경우

- 아래와 같이 설정한 경우
  - `@FeignClient(name="testClient")`
  - application.yml에 `spring.cloud.openfeign.client.config.testClient.url=http://localhost:8081`
- URL은 설정 프로퍼티에서 해석되며, 로드 밸런싱 없이 처리됩니다.
- spring.cloud.openfeign.client.refresh-enabled=true인 경우, 설정 프로퍼티에 정의된 URL은 Spring RefreshScope Support에서 설명된 대로 새로고침될 수
  있습니다.

### 8.4 @FeignClient 어노테이션과 설정 프로퍼티 모두에서 URL을 제공하지 않는 경우

- 아래와 같이 설정한 경우
  - `@FeignClient(name="testClient")`
- URL은 어노테이션의 name 속성에서 해석되며, 로드 밸런싱을 사용합니다.

### 8.5 주요 특징

- @FeignClient의 url 속성이 설정 프로퍼티보다 높은 우선순위를 가집니다.
- 명시적인 URL이 제공된 경우 로드 밸런싱이 비활성화되고, name만 제공된 경우 로드 밸런싱이 활성화됩니다.
- 설정 프로퍼티를 통해 URL을 제공하고 refresh-enabled=true로 설정하면 런타임에 URL을 변경할 수 있습니다.
- URL이 명시되지 않은 경우, name 속성이 서비스 디스커버리를 통해 실제 서비스 인스턴스를 찾는 데 사용됩니다.

## 9. 마무리

- Spring Cloud OpenFeign은 마이크로서비스 간 통신을 간소화하는 강력한 도구입니다.
- 선언적 방식으로 HTTP 클라이언트를 정의하여 보일러플레이트 코드를 제거하고, 개발자가 비즈니스 로직에 집중할 수 있게 해줍니다.
- 적절한 설정과 에러 처리를 통해 안정적이고 효율적인 서비스 간 통신을 구현할 수 있습니다.

## 참고

- [Spring Cloud OpenFeign 공식 문서](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/)
- [우아한형제들 기술블로그 - 우아한 Feign 적용기](https://techblog.woowahan.com/2630/)
- [토스 기술블로그 - Feign 코드 분석과 서버 성능 개선](https://toss.tech/article/23563)