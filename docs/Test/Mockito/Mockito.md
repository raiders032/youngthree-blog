---
title: "Mockito 5로 시작하는 실용적인 테스트 코드 작성"
description: "Java의 대표적인 mocking 프레임워크인 Mockito 5의 사용법을 상세히 알아봅니다. 테스트 더블의 개념부터 실전에서 자주 사용되는 검증 기법까지 실제 예제와 함께 설명합니다."
tags: ["MOCKITO", "JUNIT", "TESTING", "JAVA", "SPRING"]
keywords: ["모키토", "mockito", "모키토5", "mockito5", "단위테스트", "unit test", "테스트", "test", "자바", "java", "스프링", "spring", "검증", "verify", "아규먼트매처", "argument matcher"]
draft: false
hide_title: true
---

## 1. Mockito란?

- Mockito는 Java 진영에서 가장 인기 있는 mocking 프레임워크입니다. 
- 단위 테스트를 작성할 때 테스트 대상 코드가 의존하는 객체들을 가짜(mock)로 대체하여 테스트를 용이하게 만들어줍니다.
- 예를 들어, 데이터베이스나 외부 API에 의존하는 코드를 테스트할 때 실제 데이터베이스나 API 대신 Mockito로 만든 가짜 객체를 사용할 수 있습니다.

### 1.1 테스트 더블의 종류

- Mockito에서 제공하는 대표적인 테스트 더블은 다음과 같습니다
- Mock: 가짜 객체를 생성하여 그 객체의 모든 행동을 프로그래밍할 수 있습니다.
- Spy: 실제 객체를 감싸서 일부 메서드만 가짜로 대체할 수 있습니다.
- Stub: 미리 준비된 답변으로 메서드 호출에 응답하는 객체입니다.

## 2. Mockito 5 설정하기

### 2.1 의존성 추가

최신 Spring Boot 3.x 프로젝트를 사용한다면 별도의 설정 없이 `spring-boot-starter-test`에 Mockito가 포함되어 있습니다. 하지만 수동으로 설정해야 하는 경우 다음과 같이 의존성을 추가합니다:

**Maven의 경우**
```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>5.14.2</version>
    <scope>test</scope>
</dependency>
```

**Gradle의 경우**
```groovy
testImplementation 'org.mockito:mockito-core:5.14.2'
```

### 2.2 JUnit 5와 통합

- Mockito 5는 JUnit 5와 원활하게 통합됩니다. 
- `@ExtendWith(MockitoExtension.class)`를 사용하여 Mockito의 기능을 JUnit 테스트에서 사용할 수 있습니다:

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    // 테스트 코드
}
```

## 3. Mock 객체 생성하기

Mock 객체를 생성하는 방법은 크게 두 가지가 있습니다.

### 3.1 애노테이션을 사용한 방법

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;  // Mock 객체 생성
    
    @InjectMocks
    private UserService userService;  // Mock을 주입받는 대상
    
    // 테스트 메서드...
}
```

- `@Mock`: Mock 객체를 생성합니다.
- `@InjectMocks`: `@Mock`으로 생성된 객체를 자동으로 주입받습니다.

### 3.2 직접 생성하는 방법

```java
UserRepository userRepository = mock(UserRepository.class);
UserService userService = new UserService(userRepository);
```

- 이 방법은 테스트 메서드 내에서 지역적으로 Mock 객체가 필요할 때 유용합니다.

## 4. Stubbing: Mock 객체의 행동 정의하기

- Stubbing은 Mock 객체가 어떻게 동작해야 하는지 정의하는 것입니다.

### 4.1 기본적인 Stubbing

```java
// Mock 객체의 메서드가 특정 값을 반환하도록 설정
when(userRepository.findById(1L))
    .thenReturn(Optional.of(new User(1L, "John")));

// BDD 스타일로도 같은 동작을 정의할 수 있습니다
given(userRepository.findById(1L))
    .willReturn(Optional.of(new User(1L, "John")));
```

### 4.2 여러 번 호출될 때의 동작

```java
// 순차적으로 다른 값을 반환하도록 설정
when(userRepository.findById(1L))
    .thenReturn(Optional.of(user1))  // 첫 번째 호출
    .thenReturn(Optional.of(user2))  // 두 번째 호출
    .thenThrow(new RuntimeException());  // 세 번째 호출
```

### 4.3 조건부 응답

```java
// 메서드 호출 시 전달된 인자에 따라 다른 동작을 하도록 설정
when(userRepository.findById(anyLong()))
    .thenAnswer(invocation -> {
        Long id = invocation.getArgument(0);
        if (id < 0) {
            throw new IllegalArgumentException("Invalid ID");
        }
        return Optional.of(new User(id, "User " + id));
    });
```

## 5. 검증(Verification)

- 검증은 Mock 객체의 메서드들이 예상대로 호출되었는지 확인하는 과정입니다.
- Mockito에서는 `verify` 메서드를 사용하여 검증을 수행합니다.
- 검증은 Mock 객체가 실제로 사용되는 방식을 확인하고 테스트 대상 코드의 동작을 검증하는 데 도움이 됩니다.

### 5.1 기본적인 검증

```java
// userService.deleteUser(1L) 메서드를 호출한 후...

// deleteById가 정확히 한 번 호출되었는지 검증
verify(userRepository).deleteById(1L);

// 특정 횟수만큼 호출되었는지 검증
verify(userRepository, times(3)).findById(any());

// 전혀 호출되지 않았는지 검증
verify(userRepository, never()).save(any());
```

### 5.2 아규먼트 검증

- 아규먼트 검증은 Mock 객체의 메서드가 호출될 때 전달된 인자를 검증하는 것입니다.
- Mockito에서는 `eq`, `any`, `notNull`, `startsWith` 등의 아규먼트 매처를 사용하여 검증할 수 있습니다.

#### 기본 아규먼트 매처 사용하기

```java
// 정확한 값과 매칭
verify(userRepository).findById(eq(1L));

// 어떤 타입의 값이든 매칭
verify(userRepository).save(any(User.class));

// null 여부로 매칭
verify(userRepository).findById(notNull());

// 문자열 패턴 매칭
verify(userRepository).findByUsername(startsWith("john"));
```

#### ArgumentCaptor를 사용한 상세 검증

ArgumentCaptor는 메서드 호출 시 전달된 인자를 캡처하여 나중에 검증할 수 있게 해줍니다:

```java
@Test
void verifyUserUpdate() {
    // ArgumentCaptor 준비
    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
    
    // 테스트 실행
    userService.updateUser(1L, "John Doe", "john@example.com");
    
    // 메서드 호출 시 전달된 User 객체 캡처
    verify(userRepository).save(userCaptor.capture());
    
    // 캡처한 User 객체의 속성 검증
    User capturedUser = userCaptor.getValue();
    assertThat(capturedUser.getName()).isEqualTo("John Doe");
    assertThat(capturedUser.getEmail()).isEqualTo("john@example.com");
}
```

#### 여러 아규먼트 동시 검증

```java
@Test
void verifyMultipleArguments() {
    // 테스트 실행
    userService.updateUserRole(1L, "ADMIN");
    
    // 여러 아규먼트를 한 번에 검증
    verify(userRepository).saveUserAndRole(
        argThat(user -> user.getId().equals(1L)),
        argThat(role -> role.getName().equals("ADMIN"))
    );
}
```

### 5.3 호출 순서 검증

특정 메서드들이 정해진 순서대로 호출되었는지 검증할 수 있습니다:

```java
// 호출 순서 검증을 위한 InOrder 객체 생성
InOrder inOrder = inOrder(userRepository, emailService);

// 순서대로 검증
inOrder.verify(userRepository).save(any(User.class));
inOrder.verify(emailService).sendWelcomeEmail(any(String.class));

// 더 이상의 호출이 없었는지 확인
inOrder.verifyNoMoreInteractions();
```

## 6. 모범 사례와 주의사항

### 6.1 불필요한 Stubbing 피하기

테스트에 실제로 필요한 동작만 stub해야 합니다:

```java
// 안 좋은 예 - 사용하지 않는 stub
when(userRepository.findById(any())).thenReturn(Optional.empty());
when(userRepository.save(any())).thenReturn(new User());

// 좋은 예 - 테스트에 필요한 것만 stub
when(userRepository.findById(1L)).thenReturn(Optional.of(new User(1L, "John")));
```

### 6.2 BDD 스타일 사용 권장

BDD(Behavior-Driven Development) 스타일을 사용하면 테스트의 의도를 더 명확하게 표현할 수 있습니다:

```java
// Given (준비)
given(userRepository.findById(1L))
    .willReturn(Optional.of(new User(1L, "John")));

// When (실행)
User user = userService.getUser(1L);

// Then (검증)
then(userRepository).should().findById(1L);
assertThat(user.getName()).isEqualTo("John");
```

### 6.3 Strict Stubbing 활용

Mockito 5는 기본적으로 strict stubbing을 사용합니다. 불필요한 stubbing을 방지하려면:

```java
// 필요한 경우에만 lenient 모드 사용
@Mock(lenient = true)
private UserRepository userRepository;

// 또는 특정 stub에만 적용
lenient().when(userRepository.findById(any()))
    .thenReturn(Optional.empty());
```

## 7. Mockito 5의 새로운 기능

Mockito 5에서는 다음과 같은 새로운 기능들이 추가되었습니다:

1. 향상된 타입 안전성
  - 제네릭 타입에 대한 더 나은 지원
  - 컴파일 시점의 타입 체크 강화

2. Java 17+ 지원
  - 레코드 클래스 모킹 지원
  - 봉인된 클래스와 인터페이스 지원

3. 성능 개선
  - 더 빠른 Mock 객체 생성
  - 메모리 사용량 최적화

## 관련 자료

- [Mockito 공식 문서](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [Mockito GitHub](https://github.com/mockito/mockito)
- [Mockito 릴리즈 노트](https://github.com/mockito/mockito/releases)