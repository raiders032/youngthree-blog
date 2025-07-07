## 1. OAuth2 Client

### 1.1 OAuth2 Client 사용 사례

- OAuth 2.0 또는 OpenID Connect 1.0을 사용하여 사용자 로그인을 구현하고 싶은 경우
- 사용자를 위해 서드파티 API에 액세스하기 위한 액세스 토큰을 얻기 위해 RestClient를 사용하고 싶은 경우
- 사용자를 위해 서드파티 API에 액세스하기 위한 액세스 토큰을 얻기 위해 WebClient를 사용하고 싶은 경우
- 두 가지 모두 구현하고 싶은 경우 (사용자 로그인 그리고 서드파티 API 액세스)

### 1.2 의존성 추가

- OAuth2 Client를 시작하려면 프로젝트에 spring-security-oauth2-client 의존성을 추가하세요.
- Spring Boot를 사용하는 경우, 다음 스타터를 추가하면 됩니다.

```gradle
implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'
```

## 2. OAuth2 Login

- OAuth 2.0 로그인 기능은 사용자가 OAuth 2.0 제공업체(GitHub 등)나 OpenID Connect 1.0 제공업체(Google 등)의 기존 계정을 사용하여 애플리케이션에 로그인할 수 있도록
  지원합니다.
- "Google로 로그인" 또는 "GitHub로 로그인"과 같은 소셜 로그인 시나리오를 구현합니다.
- OAuth2 로그인은 OAuth2 클라이언트 기능 위에 구축된 상위 수준의 기능으로, 독립적으로 동작하지 않으며 OAuth2 클라이언트가 필수적으로 필요합니다.
- OAuth 2.0 인증 프레임워크와 OpenID Connect Core 1.0에서 명시된 Authorization Code Grant 플로우를 기반으로 구현됩니다.

### 2.1 Spring Boot 샘플

- Spring Boot는 OAuth 2.0 로그인을 위한 완전한 자동 구성 기능을 제공합니다.
- 이 섹션에서는 Google을 인증 제공업체로 사용하여 OAuth 2.0 로그인 샘플을 구성하는 방법을 설명합니다.

### 2.2 Google OAuth 2.0 로그인 설정

- 로그인을 위해 Google의 OAuth 2.0 인증 시스템을 사용하려면, OAuth 2.0 자격 증명을 얻기 위해 Google API Console에서 프로젝트를 설정해야 합니다.
- Google의 OAuth 2.0 구현은 OpenID Connect 1.0 사양을 준수하며 OpenID 인증을 받았습니다.
- 구글 콘솔에서 프로젝트 설정을 완료한 후, 클라이언트 ID와 클라이언트 시크릿으로 구성된 자격 증명을 가진 새로운 OAuth 클라이언트가 생성됩니다.

### 2.3 리다이렉트 URI 설정

- 리다이렉트 URI는 최종 사용자가 Google로 인증을 완료하고 동의 페이지에서 OAuth 클라이언트(이전 단계에서 생성)에 대한 액세스 권한을 부여한 후 사용자 에이전트가 다시 리다이렉트되는 애플리케이션 내의
  경로입니다.
- "Set a redirect URI" 하위 섹션에서 Authorized redirect URIs 필드가 localhost:8080/login/oauth2/code/google로 설정되어 있는지 확인하세요.
- 기본 리다이렉트 URI 템플릿은 {baseUrl}/login/oauth2/code/{registrationId}입니다. registrationId는 ClientRegistration의 고유 식별자입니다.
- OAuth 클라이언트가 프록시 서버 뒤에서 실행되는 경우, 애플리케이션이 올바르게 구성되었는지 확인하기 위해 프록시 서버 구성을 확인해야 합니다. 또한 redirect-uri에 지원되는 URI 템플릿 변수들을
  참조하세요.

### 2.4 application.yml 설정

```yml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: google-client-id
            client-secret: google-client-secret
```

- 이제 Google과 함께 새로운 OAuth 클라이언트가 있으므로, 인증 플로우에 OAuth 클라이언트를 사용하도록 애플리케이션을 위와 같이 구성합니다.
- spring.security.oauth2.client.registration은 OAuth 클라이언트 속성의 기본 속성 접두사입니다.
- 기본 속성 접두사 다음에는 Google과 같은 ClientRegistration의 ID가 옵니다.
- client-id와 client-secret 속성의 값을 앞서 생성한 OAuth 2.0 자격 증명으로 바꿔주세요.

### 2.5 애플리케이션 실행

- Spring Boot 샘플을 실행하고 localhost:8080으로 이동하세요.
- 그러면 기본 자동 생성된 로그인 페이지로 리다이렉트되며, 이 페이지에는 Google 링크가 표시됩니다.
- Google 링크를 클릭하면 인증을 위해 Google로 리다이렉트됩니다.
- Google 계정 자격 증명으로 인증한 후, 동의 화면이 표시됩니다.
- 동의 화면에서는 앞서 생성한 OAuth 클라이언트에 대한 액세스를 허용하거나 거부하도록 요청합니다. OAuth 클라이언트가 이메일 주소와 기본 프로필 정보에 액세스할 수 있도록 허용하려면 Allow를 클릭하세요.
- 이 시점에서 OAuth 클라이언트는 UserInfo 엔드포인트에서 이메일 주소와 기본 프로필 정보를 검색하고 인증된 세션을 설정합니다.

### 2.6 CommonOAuth2Provider

- `CommonOAuth2Provider`는 널리 알려진 여러 제공업체(Google, GitHub, Facebook, Okta)에 대한 기본 클라이언트 속성 세트를 미리 정의합니다.
- 예를 들어, `authorization-uri`, `token-uri`, `user-info-uri`는 제공업체별로 자주 변경되지 않습니다.
- 따라서 기본값을 제공하여 필요한 구성을 줄이는 것이 합리적입니다.

#### 2.6.1 기본 CommonOAuth2Provider 사용

- 앞에서 설명한 것처럼 Google 클라이언트를 구성할 때는 `client-id`와 `client-secret` 속성만 필요합니다.

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: google-client-id
            client-secret: google-client-secret         
```

- 클라이언트 속성의 자동 기본값 설정은 registrationId(google)가 CommonOAuth2Provider의 GOOGLE enum과 일치하기 때문에 원활하게 작동합니다(대소문자 구분 안 함).

#### 2.6.2 다른 registrationId 사용하기

- google-login과 같이 다른 registrationId를 지정하고 싶은 경우에도 provider 속성을 구성하여 클라이언트 속성의 자동 기본값 설정을 활용할 수 있습니다

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google-login: # registrationId를 google-login으로 설정
            provider: google      # provider 속성을 google로 설정
            client-id: google-client-id
            client-secret: google-client-secret
```

- registrationId는 google-login으로 설정됩니다.
- provider 속성은 google로 설정되어 CommonOAuth2Provider.GOOGLE.getBuilder()에 설정된 클라이언트 속성의 자동 기본값 설정을 활용합니다.
- 이 방식을 사용하면 동일한 OAuth2 제공업체에 대해 여러 개의 다른 등록을 만들 수 있습니다.
	- 예를 들어, 서로 다른 scope나 redirect-uri를 가진 여러 Google 로그인 옵션을 제공할 수 있습니다.

#### 2.6.3 지원되는 CommonOAuth2Provider

- Spring Security는 다음과 같은 제공업체를 기본적으로 지원합니다:
	- GOOGLE: Google OAuth2 로그인
	- GITHUB: GitHub OAuth2 로그인
	- FACEBOOK: Facebook OAuth2 로그인
	- OKTA: Okta OAuth2/OIDC 로그인
- 각 제공업체에 대해 다음과 같은 기본값이 설정됩니다:
	- Authorization URI
	- Token URI
	- User Info URI
	- User Name Attribute Name
	- Client Name
	- Scopes (제공업체별로 다름)

## 3 OAuth2 Login 고급 설정

- [레퍼런스](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/advanced.html)
- 앞서 보여준 OAuth2 Login 샘플을 사용하면 기본적인 OAuth2 로그인 기능을 구현할 수 있습니다.
- 기본적인 설정을 사용하면 대부분의 경우 충분하지만, 더 복잡한 요구 사항이 있는 경우 OAuth2 Login을 세밀하게 조정할 수 있습니다.
- HttpSecurity.oauth2Login() 메서드를 통해 OAuth 2.0 Login의 다양한 구성 옵션을 설정할 수 있습니다.
- 주요 구성 옵션들은 OAuth 2.0 프로토콜의 엔드포인트별로 그룹화되어 있어 직관적인 설정이 가능합니다.

### 3.1 OAuth 2.0 프로토콜 엔드포인트

- OAuth 2.0 Authorization Framework에서 정의하는 주요 엔드포인트는 다음과 같습니다.
	- Authorization Endpoint: 클라이언트가 리소스 소유자로부터 인가를 받기 위해 사용하는 엔드포인트
	- Token Endpoint: 클라이언트가 인가 코드를 액세스 토큰으로 교환하기 위해 사용하는 엔드포인트
	- Redirection Endpoint: 인가 서버가 인가 결과를 클라이언트에게 반환하기 위해 사용하는 엔드포인트
	- UserInfo Endpoint: 인증된 사용자에 대한 클레임 정보를 반환하는 OAuth 2.0 보호 리소스

### 3.2 OAuth 2.0 Login 구성 예시

```java
@Configuration
@EnableWebSecurity
public class OAuth2LoginSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(authorization -> authorization
                        // Authorization Endpoint 설정
                )
                .redirectionEndpoint(redirection -> redirection
                        // Redirection Endpoint 설정
                )
                .tokenEndpoint(token -> token
                        // Token Endpoint 설정
                )
                .userInfoEndpoint(userInfo -> userInfo
                        // UserInfo Endpoint 설정
                )
            );
        return http.build();
    }
}
```

### 3.3 Redirection Endpoint 구성

#### 3.3.1 기본 Redirection Endpoint

- Redirection Endpoint란 OAuth 2.0 인증 플로우에서 인가 서버가 인가 결과를 클라이언트에게 반환하는 엔드포인트입니다.
- OAuth 2.0 Login은 Authorization Code Grant를 활용하므로, 인가 자격 증명은 인가 코드입니다.
- 기본 Authorization Response baseUri는 /login/oauth2/code/*입니다.

#### 3.3.2 커스텀 Redirection Endpoint 설정

```java
@Configuration
@EnableWebSecurity
public class OAuth2LoginSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .oauth2Login(oauth2 -> oauth2
                .redirectionEndpoint(redirection -> redirection
                    .baseUri("/login/oauth2/callback/*")
                )
            );
        return http.build();
    }
}
```

- 위 예시에서는 Redirection Endpoint의 baseUri를 /login/oauth2/callback/*로 설정했습니다.
- 위와 같이 커스텀하게 설정한 경우, ClientRegistration.redirectUri도 일치하도록 수정해야 합니다.

### 3.4 UserInfo Endpoint 고급 구성

## 4. OAuth2 Client 핵심 구성 요소

### 4.1 ClientRegistration

- ClientRegistration은 OAuth 2.0 Provider에 등록된 클라이언트의 정보를 담는 핵심 클래스입니다.
- 클라이언트 ID, 시크릿, 인증 방식, 리다이렉트 URI 등 OAuth2 통신에 필요한 모든 정보를 포함합니다.

#### 4.1.1 주요 속성들

- 기본 클라이언트 정보
	- registrationId: ClientRegistration을 고유하게 식별하는 ID
	- clientId: OAuth2 Provider에서 발급한 클라이언트 식별자
	- clientSecret: 클라이언트 인증을 위한 비밀키
	- clientAuthenticationMethod: Provider와의 인증 방식 (client_secret_basic, client_secret_post 등)
- OAuth2 플로우 설정
	- authorizationGrantType: 인증 그랜트 타입 (authorization_code, client_credentials 등)
	- redirectUri: 인증 완료 후 리다이렉트될 URI
	- scopes: 요청할 권한 범위 (openid, email, profile 등)
- Provider 엔드포인트 정보
	- authorizationUri: 인증 서버의 Authorization Endpoint
	- tokenUri: 토큰 발급을 위한 Token Endpoint
	- userInfoEndpoint: 사용자 정보 조회 엔드포인트
	- jwkSetUri: JWT 서명 검증을 위한 JWK Set URI

### 4.2 ClientRegistrationRepository

- ClientRegistrationRepository는 여러 OAuth2 클라이언트 등록 정보를 관리하는 저장소 역할을 합니다.
- Spring Boot는 자동으로 InMemoryClientRegistrationRepository를 생성하여 ApplicationContext에 Bean으로 등록합니다.

### 4.3 OAuth2AuthorizedClient

- OAuth2AuthorizedClient는 인증이 완료된 클라이언트를 나타내는 클래스입니다.
- OAuth2AccessToken, OAuth2RefreshToken, ClientRegistration, 그리고 리소스 소유자(Principal) 정보를 함께 관리합니다.

#### 4.3.1 주요 구성 요소

- OAuth2AccessToken: API 호출에 사용되는 액세스 토큰
- OAuth2RefreshToken: 액세스 토큰 갱신을 위한 리프레시 토큰 (선택적)
- ClientRegistration: 클라이언트 등록 정보
- principalName: 인증을 허가한 리소스 소유자의 식별자

### 4.4 OAuth2AuthorizedClientRepository

- 웹 요청 간에 OAuth2AuthorizedClient 정보를 유지하는 역할
- HttpSession 기반의 저장소로 주로 사용됨
- 웹 애플리케이션에서 사용자별 인증 정보 관리

### 4.5 OAuth2AuthorizedClientService

- 애플리케이션 레벨에서 OAuth2AuthorizedClient를 관리
- 서비스 애플리케이션이나 백그라운드 작업에 적합
- 사용자 상호작용 없이 동작하는 시스템에서 사용

## 5. 소셜 로그인 상세 플로우

### 5.1 전체 아키텍처 개요

- Frontend(React, Vue 등)와 Backend(Spring Boot) 간의 OAuth2 로그인 플로우를 이해하기 위해 전체 아키텍처를 살펴보겠습니다.
- 이 아키텍처는 JWT를 사용하여 인증을 처리하고, OAuth2 Provider(예: Google)와 통신하여 사용자 인증을 수행합니다.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│OAuth2 Provider│
│   (SPA)     │◀────│(Spring Boot)│◀────│   (Google)    │
└─────────────┘     └─────────────┘     └─────────────┘
      JWT               OAuth2              OAuth2
```

### 5.2 OAuth2 로그인 플로우 상세 분석

- OAuth2 로그인 플로우는 여러 Spring Security 컴포넌트들이 유기적으로 협력하여 동작합니다.
- 각 단계별로 어떤 컴포넌트가 어떤 역할을 수행하는지 상세히 살펴보겠습니다.

#### 5.2.1 인증 시작 단계

- 사용자가 "Google로 로그인" 버튼을 클릭했을 때 인증 플로우가 시작됩니다.
- 프론트엔드는 백엔드의 `/oauth2/authorization/google` 엔드포인트로 요청을 보냅니다.
- 이 요청은 `OAuth2AuthorizationRequestRedirectFilter`에 의해 가로채집니다.
- 필터는 `ClientRegistrationRepository`에서 "google"이라는 registrationId로 등록된 `ClientRegistration` 정보를 조회합니다.
	- registrationId는 요청 엔드포인트(/oauth2/authorization/{registrationId})의 마지막 값에서 추출됩니다. 여기서는 `google`입니다.
- `DefaultOAuth2AuthorizationRequestResolver`가 OAuth2 인증 요청을 생성합니다:
	- Google의 authorization-uri를 기반으로 리다이렉트 URL 구성
	- client-id, redirect-uri, response-type, scope 등의 파라미터 추가
	- CSRF 공격 방지를 위한 state 파라미터 생성 (랜덤 UUID)
	- PKCE(Proof Key for Code Exchange) 사용 시 code_challenge 추가
- 생성된 `OAuth2AuthorizationRequest` 객체는 `AuthorizationRequestRepository`에 저장됩니다 (기본적으로 HttpSession 사용).
- 필터는 HTTP 302 응답을 생성하고, Location 헤더에 위에서 만든 Google 인증 URL을 넣어 브라우저에 보냅니다.
- 브라우저는 이 302 응답을 받아 자동으로 Google 인증 서버로 이동(리다이렉트)합니다.
- 사용자는 Google 로그인 및 동의 화면을 보게 됩니다.

#### 5.2.2 OAuth2 Provider 인증 단계

- 이전 단계에서 브라우저가 Google 인증 서버로 리다이렉트되었습니다.
- 따라서 사용자는 Google 로그인 페이지를 보게 됩니다.
- 이미 Google에 로그인되어 있다면 바로 권한 동의 화면으로 이동합니다.
- 권한 동의 화면에서는 애플리케이션이 요청한 scope(email, profile 등)에 대한 접근 권한을 표시합니다.
- 사용자가 동의하면 Google은 Authorization Code와 state 파라미터를, Google API 콘솔에서 등록한 redirect-uri로 브라우저를 리다이렉트하여 전달합니다.
	- Google API 콘솔에서 등록한 redirect-uri는 `http://localhost:8080/login/oauth2/code/google`로 설정했다고 가정합니다.

#### 5.2.3 Authorization Code 처리 단계

- 리다이렉트된 브라우저가 `/login/oauth2/code/google?code=인증코드&state=상태값` 형태로 백엔드에 요청합니다.
- `OAuth2LoginAuthenticationFilter`가 이 요청을 가로채고 처리를 시작합니다.
- 먼저 `AuthorizationRequestRepository`에서 저장된 `OAuth2AuthorizationRequest`를 조회합니다.
- state 파라미터를 검증하여 CSRF 공격이 아님을 확인합니다.
- `OAuth2LoginAuthenticationToken`을 생성하여 `AuthenticationManager`에 전달합니다.
- `OAuth2LoginAuthenticationProvider`가 실제 인증 처리를 수행합니다:
	- `OAuth2AccessTokenResponseClient`를 사용하여 Authorization Code를 Access Token으로 교환합니다.
	- 내부적으로 Google의 token endpoint로 POST 요청 전송
	- client-id, client-secret, code, grant-type 등을 전송
	- 응답으로 access_token, token_type, expires_in, scope 등을 받음

#### 5.2.4 사용자 정보 조회 단계

- Token 교환이 성공하면 `OAuth2UserService`가 호출됩니다.
- 기본적으로 `DefaultOAuth2UserService`가 사용되지만, 커스터마이징을 위해 `CustomOAuth2UserService`를 구현합니다.
- `OAuth2UserRequest` 객체가 생성되어 서비스에 전달됩니다:
	- ClientRegistration 정보
	- OAuth2AccessToken
	- 추가 파라미터들
- UserInfo Endpoint로 GET 요청을 보내 사용자 정보를 조회합니다:
	- Authorization 헤더에 Bearer 토큰 포함
	- Google의 경우 `https://www.googleapis.com/oauth2/v2/userinfo` 엔드포인트 사용
- 응답으로 받은 JSON 데이터를 `OAuth2User` 객체로 변환합니다.

#### 5.2.5 커스텀 사용자 정보 처리

**CustomOAuth2UserService에서의 처리:**

```java
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    
    private final UserRepository userRepository;
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. 부모 클래스의 loadUser를 호출하여 기본 OAuth2User 획득
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        // 2. Provider 정보 확인
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration()
            .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();
        
        // 3. Provider별 사용자 정보 파싱
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
            registrationId, 
            oauth2User.getAttributes()
        );
        
        // 4. 로컬 데이터베이스와 동기화
        User user = processOAuth2User(registrationId, userInfo);
        
        // 5. CustomOAuth2User 객체 생성 및 반환
        return new CustomOAuth2User(
            Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
            oauth2User.getAttributes(),
            userNameAttributeName,
            user
        );
    }
    
    private User processOAuth2User(String registrationId, OAuth2UserInfo userInfo) {
        // 이메일이 없는 경우 예외 처리
        if (StringUtils.isEmpty(userInfo.getEmail())) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }
        
        // 기존 사용자 조회
        Optional<User> userOptional = userRepository.findByEmail(userInfo.getEmail());
        User user;
        
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Provider가 다른 경우 예외 처리
            if (!user.getProvider().equals(AuthProvider.valueOf(registrationId.toUpperCase()))) {
                throw new OAuth2AuthenticationProcessingException(
                    "Looks like you're signed up with " + user.getProvider() + " account. " +
                    "Please use your " + user.getProvider() + " account to login."
                );
            }
            // 사용자 정보 업데이트
            user = updateExistingUser(user, userInfo);
        } else {
            // 새 사용자 등록
            user = registerNewUser(registrationId, userInfo);
        }
        
        return user;
    }
}
```

- 이 단계에서는 OAuth2 Provider로부터 받은 사용자 정보를 애플리케이션의 도메인 모델로 변환합니다.
- Provider별로 다른 응답 형식을 통일된 인터페이스로 추상화합니다.
- 데이터베이스에 사용자 정보를 저장하거나 업데이트합니다.
- 필요한 권한(authorities)을 설정합니다.

#### 5.2.6 인증 완료 및 후처리

**인증 성공 후의 처리:**

- `OAuth2LoginAuthenticationProvider`는 최종적으로 `OAuth2LoginAuthenticationToken`을 생성합니다.
- 이 토큰은 인증된 상태를 나타내며, Principal로 `OAuth2User` 객체를 포함합니다.
- `SecurityContextHolder`에 인증 정보가 저장됩니다.
- `OAuth2AuthorizedClientService`가 `OAuth2AuthorizedClient` 객체를 생성하여 저장합니다:
	- ClientRegistration
	- PrincipalName
	- OAuth2AccessToken
	- OAuth2RefreshToken (있는 경우)
- 설정된 `AuthenticationSuccessHandler`가 호출됩니다.

#### 5.2.7 JWT 토큰 발급 및 리다이렉트

**최종 클라이언트 응답:**

- `OAuth2AuthenticationSuccessHandler`에서 JWT 토큰을 생성합니다.
- 인증된 사용자 정보를 기반으로 클레임을 구성합니다.
- 프론트엔드 URL로 토큰과 함께 리다이렉트합니다.
- 프론트엔드는 URL에서 토큰을 추출하여 로컬 스토리지에 저장합니다.

### 5.3 핵심 컴포넌트 상호작용 다이어그램

```
┌─────────────────────┐
│ OAuth2Authorization │
│ RequestRedirectFilter│
└──────────┬──────────┘
           │ 1. 인증 요청 시작
           ▼
┌─────────────────────┐
│ClientRegistration   │
│    Repository       │
└──────────┬──────────┘
           │ 2. 클라이언트 정보 조회
           ▼
┌─────────────────────┐
│  OAuth2 Provider    │
│  (Google)           │
└──────────┬──────────┘
           │ 3. 사용자 인증
           ▼
┌─────────────────────┐
│OAuth2Login          │
│AuthenticationFilter │
└──────────┬──────────┘
           │ 4. Authorization Code 처리
           ▼
┌─────────────────────┐
│OAuth2AccessToken    │
│   ResponseClient    │
└──────────┬──────────┘
           │ 5. Token 교환
           ▼
┌─────────────────────┐
│CustomOAuth2User     │
│     Service         │
└──────────┬──────────┘
           │ 6. 사용자 정보 처리
           ▼
┌─────────────────────┐
│AuthenticationSuccess│
│      Handler        │
└─────────────────────┘
           7. JWT 발급 및 리다이렉트
```

이렇게 Spring Security OAuth2 Client는 여러 컴포넌트들이 체계적으로 협력하여 안전하고 표준화된 OAuth2 로그인 플로우를 구현합니다.

## 6. JWT 토큰 기반 인증 시스템 구축

### 6.1 핵심 구현 컴포넌트

### 6.1 JWT 토큰 서비스

```java
@Service
public class JwtTokenService {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    @Value("${jwt.expiration}")
    private Long tokenExpiration;
    
    public String generateToken(Authentication authentication) {
        Date expiryDate = new Date(System.currentTimeMillis() + tokenExpiration);
        
        return Jwts.builder()
                .setSubject(authentication.getName())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, secretKey)
                .compact();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
        
        return claims.getSubject();
    }
}
```

### 6.2 Custom OAuth2 User Service

```java
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    
    private final UserRepository userRepository;
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        // Provider별 사용자 정보 추출
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
            userRequest.getClientRegistration().getRegistrationId(),
            oauth2User.getAttributes()
        );
        
        // 사용자 조회 또는 생성
        User user = findOrCreateUser(userInfo);
        
        return new CustomOAuth2User(oauth2User, user);
    }
    
    private User findOrCreateUser(OAuth2UserInfo userInfo) {
        return userRepository.findByEmail(userInfo.getEmail())
                .map(user -> updateUser(user, userInfo))
                .orElseGet(() -> createUser(userInfo));
    }
}
```

### 6.3 OAuth2 인증 성공 핸들러

```java
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private final JwtTokenService tokenService;
    
    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                      HttpServletResponse response,
                                      Authentication authentication) throws IOException {
        String token = tokenService.generateToken(authentication);
        
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", token)
                .build().toUriString();
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
```

### 6.4 JWT 인증 필터

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenService tokenService;
    private final UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {
        String token = extractTokenFromRequest(request);
        
        if (token != null && tokenService.validateToken(token)) {
            String username = tokenService.getUsernameFromToken(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

### 6.5 사용자 도메인 모델

```java
@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String name;
    
    private String profileImageUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider;
    
    @Column(nullable = false)
    private String providerId;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

## 7. 보안 설정 통합

### 7.1 완성된 Security Configuration

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler successHandler;
    private final OAuth2AuthenticationFailureHandler failureHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/error", "/oauth2/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .successHandler(successHandler)
                .failureHandler(failureHandler)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 7.2 환경별 설정 관리

#### application.yml

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - openid
              - email
              - profile
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope:
              - user:email
              - read:user

app:
  oauth2:
    redirect-uri: http://localhost:3000/oauth2/redirect
  jwt:
    secret: ${JWT_SECRET}
    expiration: 86400000 # 24시간
```

## 참고

- https://docs.spring.io/spring-security/reference/servlet/oauth2/login/index.html
- https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html