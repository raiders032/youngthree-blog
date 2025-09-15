## 1. OAuth2

- Spring Security는 OAuth2에 대한 광범위한 지원을 제공합니다.
- 이번 글에서는 OAuth 2.0을 서블릿 기반 애플리케이션에 통합하는 방법을 다룹니다.
- Spring Security는 OAuth2에 대해서 두 가지의 기능을 제공합니다.
  - OAuth2 Resource Server 
  - OAuth2 Client
  - 참고: OAuth2 Login은 강력한 기능이지만 독립 기능이 아니라 OAuth2 Client에 기반합니다.
  - Authorization Server 역할은 Spring Authorization Server(별도 프로젝트)가 담당합니다.
  - 전형적 아키텍처: 사용자용 클라이언트 앱 + 다수의 리소스 서버(API) + 제3자 인증 서버.

> 본 문서는 Spring Security 6.5.x 레퍼런스에 기반한 요약입니다. 자세한 내용은 문서 하단 참고 링크를 확인하세요.

## 2. OAuth2 Resource Server

- 목적: Bearer Token(주로 JWT)을 검증하여 보호된 리소스를 제공하는 서버 역할을 구현합니다.
- 의존성 추가 (Spring Boot):

```gradle
implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'
```

```maven
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
  <version>${spring-boot.version}</version>
</dependency>
```

- 최소 보안 설정 (예시):

```java
http
  .authorizeHttpRequests(auth -> auth
    .requestMatchers("/public/**").permitAll()
    .anyRequest().authenticated()
  )
  .oauth2ResourceServer(oauth2 -> oauth2.jwt());
```

- 특징 요약:
  - JWT/불투명 토큰(opaque) 검증 지원
  - 멀티테넌시, Bearer token, DPoP 등 고급 시나리오 지원
  - Boot 사용 시 자동 설정 이점이 큼

- Boot 속성 설정 (예시):

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://issuer.example.com/realms/demo
          # 또는 jwk-set-uri: https://issuer.example.com/realms/demo/protocol/openid-connect/certs
        # 불투명 토큰(Introspection) 사용 시
        # opaque-token:
        #   introspection-uri: https://issuer.example.com/oauth2/introspect
        #   client-id: demo-client
        #   client-secret: demo-secret
```

- 보안 구성 (권장 예시):

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
  http
    .csrf(csrf -> csrf.disable()) // API 서버라면 보통 비활성화
    .authorizeHttpRequests(auth -> auth
      .requestMatchers("/public/**").permitAll()
      .anyRequest().authenticated()
    )
    .oauth2ResourceServer(oauth2 -> oauth2.jwt());
  return http.build();
}
```

- 권한 매핑(SCOPE → GrantedAuthority) 커스터마이징:

```java
@Bean
JwtDecoder jwtDecoder(NimbusJwtDecoder jwtDecoder) {
  return jwtDecoder; // Boot가 issuer-uri로 자동 구성한 디코더를 주입받아 그대로 사용 가능
}

@Bean
JwtAuthenticationConverter jwtAuthenticationConverter() {
  JwtGrantedAuthoritiesConverter scopes = new JwtGrantedAuthoritiesConverter();
  scopes.setAuthorityPrefix("SCOPE_");
  scopes.setAuthoritiesClaimName("scope"); // 또는 "scp", "roles" 등

  JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
  converter.setJwtGrantedAuthoritiesConverter(scopes);
  return converter;
}

@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
  http
    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
    .oauth2ResourceServer(oauth2 -> oauth2
      .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
    );
  return http.build();
}
```

- Audience/Issuer 검증 추가 (예시):

```java
@Bean
JwtDecoder jwtDecoder() {
  NimbusJwtDecoder decoder = NimbusJwtDecoder.withIssuerLocation("https://issuer.example.com/realms/demo").build();
  OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer("https://issuer.example.com/realms/demo");
  OAuth2TokenValidator<Jwt> audience = new AudienceValidator("api-audience");
  decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(withIssuer, audience));
  return decoder;
}
```

- Bearer Token 해석 커스터마이징:

```java
@Bean
BearerTokenResolver bearerTokenResolver() {
  DefaultBearerTokenResolver resolver = new DefaultBearerTokenResolver();
  resolver.setAllowUriQueryParameter(true); // 필요 시 쿼리 파라미터 허용
  // resolver.setBearerTokenHeaderName("X-Access-Token"); // 커스텀 헤더명 사용 예
  return resolver;
}
```

- 메서드 보안 사용 예:

```java
@PreAuthorize("hasAuthority('SCOPE_read')")
public ResponseEntity<String> readOnly() { /* ... */ }
```

- 멀티테넌시 개요:
  - 요청 도메인/헤더 등에 따라 `JwtDecoder`를 테넌트별로 선택하는 전략 사용
  - `JwtDecoderFactory<HttpServletRequest>`를 활용하여 요청 컨텍스트별 디코더 생성 가능

- DPoP-bound Access Tokens:
  - DPoP 키로 토큰을 바인딩하여 재사용 공격을 완화하는 고급 기능
  - 리소스 서버는 DPoP 헤더와 토큰의 바인딩 일치를 검증해야 함
  - 세부 구현은 공식 문서 고급 주제 참고

## 3. OAuth2 Client

- OAuth2 Client는 OAuth2 인증을 사용하여 외부 서비스에 접근하는 클라이언트 애플리케이션을 구현하는 데 사용됩니다.
- 자세한 내용은 아래 문서를 참고하세요.
  - [OAuth Client](../OAuthClient/OAuthClient.md)

- 의존성 추가 (Spring Boot):

```gradle
implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'
```

```maven
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-client</artifactId>
  <version>${spring-boot.version}</version>
</dependency>
```

- OAuth2 Login(사용자 로그인)과의 관계:
  - OAuth2 Login은 OAuth2 Client의 하위 기능입니다. 로그인은 `.oauth2Login()`으로 활성화합니다.

```java
http
  .authorizeHttpRequests(auth -> auth
    .anyRequest().authenticated()
  )
  .oauth2Login();
```

- 토큰 획득/갱신 클라이언트:
  - Spring Security 6.2+에서는 커스터마이징하지 않는 한 기본 `OAuth2AuthorizedClientManager`가 자동 구성됩니다.
  - 특별히 `RestOperations` 커스터마이징이 필요할 때만 관련 Bean을 명시적으로 제공하면 됩니다.

- 지원 그랜트 타입 요약:
  - Authorization Code (PKCE 포함)
  - Refresh Token
  - Client Credentials
  - Password (Deprecated; 사용 지양)
  - JWT Bearer
  - Token Exchange (RFC 8693)

- 클라이언트 등록 예시(application.yaml):

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: your-client-id
            client-secret: your-client-secret
            scope: user:email,read:user
        provider:
          github:
            authorization-uri: https://github.com/login/oauth/authorize
            token-uri: https://github.com/login/oauth/access_token
            user-info-uri: https://api.github.com/user
            user-name-attribute: id
```

- WebClient 통합 예시:

```java
@Bean
WebClient webClient(ClientRegistrationRepository registrations, OAuth2AuthorizedClientRepository clients) {
  ServletOAuth2AuthorizedClientExchangeFilterFunction oauth2 =
      new ServletOAuth2AuthorizedClientExchangeFilterFunction(registrations, clients);
  oauth2.setDefaultClientRegistrationId("github");
  return WebClient.builder().apply(oauth2.oauth2Configuration()).build();
}

// 사용 예
String body = webClient
  .get()
  .uri("https://api.github.com/user")
  .retrieve()
  .bodyToMono(String.class)
  .block();
```

- AuthorizedClientManager 커스터마이징 (필요 시):

```java
@Bean
OAuth2AuthorizedClientManager authorizedClientManager(
    ClientRegistrationRepository registrations,
    OAuth2AuthorizedClientRepository authorizedClients) {

  OAuth2AuthorizedClientProvider provider = OAuth2AuthorizedClientProviderBuilder.builder()
    .authorizationCode()
    .refreshToken()
    .clientCredentials()
    .build();

  DefaultOAuth2AuthorizedClientManager manager =
    new DefaultOAuth2AuthorizedClientManager(registrations, authorizedClients);
  manager.setAuthorizedClientProvider(provider);
  return manager;
}
```

- Token refresh 자동 처리: `OAuth2AuthorizedClientExchangeFilterFunction`가 만료 임박 시 자동 갱신을 수행합니다(Refresh Token 보유 시).

## 4. 추가 참고 자료

- 공식 문서:
  - Spring Security Reference – OAuth2 (서블릿): `https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html`

- 관련 프로젝트:
  - Spring Authorization Server: 조직 내 자체 Authorization Server 구축 시 사용

- 세부 주제:
  - OAuth 2.0 Login, OAuth 2.0 Client, OAuth 2.0 Resource Server 섹션을 문서에서 순차적으로 참고하세요.

> 출처: Spring Security 공식 문서 [OAuth2](`https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html`)

## 5. OAuth2 Login (OIDC 포함)

- 개요: 소셜/IDP 로그인(UI 포함) 기능으로 OAuth2 Client에 기반합니다.
- 최소 설정:

```java
http
  .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
  .oauth2Login();
```

- 사용자 속성 매핑(Custom OAuth2UserService):

```java
@Bean
SecurityFilterChain login(HttpSecurity http, OAuth2UserService<OAuth2UserRequest, OAuth2User> customUserService) throws Exception {
  http
    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
    .oauth2Login(oauth2 -> oauth2.userInfoEndpoint(user -> user.userService(customUserService)));
  return http.build();
}
```

- OIDC Logout 연동: OIDC Provider의 RP-Initiated Logout 엔드포인트 사용 가능(문서 고급 설정 참고)
- 토큰 엔드포인트 커스터마이징(6.2 이전 스타일): `DefaultAuthorizationCodeTokenResponseClient`에 커스텀 `RestOperations` 주입

## 6. Testing 요약 (Servlet)

- MockMvc 설정:

```java
@AutoConfigureMockMvc
@SpringBootTest
class ApiTests {
  @Autowired MockMvc mockMvc;

  @Test
  void whenJwt_thenOk() throws Exception {
    mockMvc.perform(get("/api")
        .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_read"))))
      .andExpect(status().isOk());
  }
}
```

- RequestPostProcessors:
  - `jwt()`, `oauth2Login()`, `user()`, `httpBasic()`, `csrf()`, `logout()` 등 사용 가능
- 결과 매처/핸들러: `SecurityMockMvcResultMatchers`, `SecurityMockMvcRequestPostProcessors`

## 7. 참고/출처

- 공식 문서: [Spring Security – OAuth2 (Servlet)](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)
- 리소스 서버: [JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html), [Opaque Token](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/opaque-token.html), [Bearer Tokens](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/bearer-tokens.html), [DPoP](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/dpop.html)
- 클라이언트/로그인: [OAuth2 Client](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html), [OAuth2 Login](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/index.html)