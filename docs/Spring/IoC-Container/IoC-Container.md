---
title: "IoC 컨테이너"
description: "스프링 프레임워크의 핵심 개념인 IoC 컨테이너, 빈 생명주기, 스코프에 대해 상세히 알아봅니다. ApplicationContext의 기능, 의존성 주입 방식, 컴포넌트 스캔, 싱글톤 패턴 활용, 그리고 빈 스코프와 생명주기 콜백까지 스프링의 근본적인 동작 원리를 자세히 설명합니다."
tags: [ "SPRING", "IOC_CONTAINER", "DEPENDENCY_INJECTION", "BEAN_LIFECYCLE", "BEAN_SCOPE", "BACKEND", "JAVA", "FRAMEWORK" ]
keywords: [ "스프링", "Spring", "IoC", "스프링 컨테이너", "Spring Container", "빈", "Bean", "의존성 주입", "DI", "Dependency Injection", "ApplicationContext", "싱글톤", "Singleton", "컴포넌트 스캔", "Component Scan", "생명주기", "Bean Lifecycle", "스코프", "Bean Scope", "스프링 빈", "초기화", "소멸", "PostConstruct", "PreDestroy" ]
draft: false
hide_title: true
---

## 1. IoC란?

- IoC(Inversion of Control, 제어의 역전)는 프로그램의 제어 흐름을 개발자가 아닌 외부 프레임워크가 관리하는 소프트웨어 디자인 원칙입니다.
- 전통적인 프로그래밍에서는 개발자가 필요한 객체를 직접 생성하고, 의존성을 연결하며, 메서드를 호출하는 등 제어의 주체가 되었습니다.
- 반면 IoC 패러다임에서는 이러한 제어 흐름이 "역전"되어, 프레임워크가 객체의 생성과 생명주기를 관리하고 애플리케이션 코드를 필요한 시점에 호출합니다.
- 스프링 프레임워크에서 IoC는 주로 의존관계 주입(Dependency Injection, DI)을 통해 구현됩니다.
- 객체 지향 설계의 5가지 원칙(SOLID) 중 의존관계 역전 원칙(DIP)을 효과적으로 지원합니다.
	- DIP: 프로그래머는 추상화에 의존해야 하며, 구체화에 의존하면 안 된다.
	- [SOLID 참고](../../OOP/SOLID/SOLID.md)

### 1.1 실제 의미

```java
public class UserService {
    private UserRepository userRepository = new UserRepositoryImpl(); // 직접 생성
    
    // 또는
    private UserRepository userRepository = ServiceLocator.getUserRepository(); // 서비스 로케이터 사용
}
```

- 위는 객체 생성과 의존성 설정을 직접 수행하는 전통적인 방식입니다.
- 이 방식은 객체 간의 결합도가 높아져 유연성이 떨어지며, 테스트가 어려워집니다.
- IoC 컨테이너는 이러한 문제를 해결하기 위해 객체 생성과 의존성 설정을 외부로 분리합니다.

```java
public class UserService {
    private final UserRepository userRepository;
    
    // 의존성이 외부에서 주입됨
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

- 반면 IoC 컨테이너에서는 객체가 필요한 다른 객체를 외부에서 주입받아 사용합니다.
- UserService가 구체적인 UserRepositoryImpl 클래스에 의존하지 않고, 인터페이스에만 의존합니다.
- 테스트 시 진짜 DB에 접근하는 UserRepositoryImpl 대신 가짜(mock) 구현체를 주입할 수 있습니다.
- 필요에 따라 다른 구현체로 쉽게 교체할 수 있어 유연성이 증가합니다.
- 이렇게 객체 간의 의존관계를 외부에서 주입받아 사용하는 것을 DI(Dependency Injection)라고 합니다.

## 2. ApplicationContext

- ApplicationContext는 스프링의 핵심 IoC 컨테이너입니다.
- 빈(Bean)을 초기화하고, 구성하고, 의존성을 조립하는 역할을 수행합니다.
- 컨테이너는 XML, Java Annotation 등의 configuration metadata를 읽어 어떤 빈을 초기화하고 의존성을 어떻게 조립할지 결정합니다.
- 기존에는 개발자가 직접 자바코드로 모든 것을 했다면 이제부터는 스프링 컨테이너에 객체를 스프링 빈으로 등록하고, 스프링 컨테이너에서 스프링 빈을 찾아서 사용할 수 있습니다.

### 2.1 ApplicationContext의 부가 기능

- ApplicationContext는 단순한 빈 관리 외에도 여러 부가 기능을 제공합니다:
	- **BeanFactory**: 빈 관리 및 조회 기능
	- **ApplicationEventPublisher**: 이벤트 발행과 구독 모델 지원
	- **EnvironmentCapable**: 환경변수 관리(로컬, 개발, 운영 환경 구분)
	- **ResourceLoader**: 파일, 클래스패스 등의 리소스 조회 기능

### 2.2 BeanFactory

- BeanFactory는 스프링 컨테이너의 최상위 인터페이스입니다.
- ApplicationContext는 BeanFactory를 상속받아 빈 관리 기능을 제공합니다.
- 실제로 빈을 관리하는 기능은 BeanFactory에 있지만, 보통은 ApplicationContext를 통해 간접적으로 사용합니다.
- `applicationContext.getBean()` 메서드는 BeanFactory로부터 상속받은 메서드입니다.
- BeanFactory를 직접 사용하는 경우는 거의 없으므로 일반적으로 ApplicationContext를 스프링 컨테이너라 합니다.

### 2.3 Configuration Metadata 설정

- 스프링 컨테이너는 configuration metadata에 명시한 대로 빈을 초기화하고 의존관계를 조립합니다.
- 스프링 컨테이너는 다양한 형식의 설정 정보를 받아드릴 수 있게 유연하게 설계되어 있습니다.
	- XML, Java Annotation, Java 코드 등 다양한 방식을 지원합니다.
	- 최근에는 스프링 부트를 많이 사용하면서 XML기반의 설정은 잘 사용하지 않습니다.

#### 2.3.1 Java 기반 설정

```java
@Configuration
public class AppConfig {
  
  @Bean
  public MemberService memberService() {
    return new MemberServiceImpl(memberRepository());
  }
  
  @Bean
  public OrderService orderService() {
    return new OrderServiceImpl(
      memberRepository(),
      discountPolicy());
  }
  
  @Bean
  public MemberRepository memberRepository() {
    return new MemoryMemberRepository();
  }
  
  @Bean
  public DiscountPolicy discountPolicy() {
    return new RateDiscountPolicy();
  } 
}
```

- `@Configuration` 애노테이션이 붙은 클래스는 스프링 설정 정보로 사용됩니다.
- `@Bean` 애노테이션이 붙은 메서드의 반환 객체가 스프링 컨테이너에 빈으로 등록됩니다.

### 2.4 컨테이너 생성

Java 기반 설정을 사용한 컨테이너 생성 방법:

```java
// ApplicationContext 생성
ApplicationContext applicationContext = new AnnotationConfigApplicationContext(AppConfig.class);

// ApplicationContext에서 빈 조회
MemberService memberService = applicationContext.getBean("memberService", MemberService.class);
```

- `AnnotationConfigApplicationContext`는 ApplicationContext 인터페이스의 구현체로, 애노테이션 기반의 설정 클래스를 읽어 빈을 초기화하고 의존성을 조립합니다.

## 3. 스프링 컨테이너 다루기

### 3.1 스프링 컨테이너 생성하기

스프링 컨테이너 생성은 다음 단계로 이루어집니다:

1. **스프링 컨테이너 생성**:
	- 구성 정보(Configuration)를 지정하여 컨테이너를 생성합니다.
	- 예: `new AnnotationConfigApplicationContext(AppConfig.class);`
2. **스프링 빈 등록**:
	- 구성 정보를 사용해 스프링 빈을 등록합니다.
	- 빈의 이름은 기본적으로 메서드 이름이 됩니다.
	- `@Bean(name="customName")`으로 이름을 직접 지정할 수도 있습니다.
	- 빈 이름은 중복되면 안 됩니다.
3. **의존관계 주입**:
	- 빈 사이의 의존관계가 있다면 의존성을 주입합니다.

### 3.1 스프링 컨테이너에서 빈 조회

- 스프링 컨테이너에서 빈을 조회하는 방법은 다음과 같습니다:

```java
// 빈 조회(빈이름, 타입)
MemberService memberService = applicationContext.getBean("memberService", MemberService.class);

// 타입으로 조회
MemberService memberService = applicationContext.getBean(MemberService.class);
```

- `getBean()` 메서드는 빈 이름과 타입을 지정해 빈을 조회합니다.
- 빈이 없으면 `NoSuchBeanDefinitionException`이 발생합니다.

#### 3.1.1 같은 타입의 빈이 둘 이상인 경우

- 만약 타입으로 조회 시 같은 타입의 빈이 둘 이상이면 `NoUniqueBeanDefinitionException`이 발생합니다.
- 이러한 경우 이름을 지정해 빈을 조회해야 합니다.

#### 3.1.2 상속 관계

- 부모 타입으로 조회하면 자식 타입도 함께 조회됩니다.
- 부모 타입으로 조회시 자식 타입이 둘 이상이면 `NoUniqueBeanDefinitionException`이 발생합니다.
	- 이 경우 빈 이름을 지정해야 합니다.
- getBeansOfType() 메서드를 사용하면 해당 타입의 모든 빈을 조회할 수 있습니다.

## 4. 싱글톤 컨테이너

- 스프링은 기본적으로 빈을 싱글톤으로 관리합니다.
- 싱글톤이란 애플리케이션 전체에서 해당 빈의 인스턴스를 하나만 생성하여 공유하는 방식입니다.
- 스프링 컨테이너가 항상 같은 빈을 반환하여 메모리를 효율적으로 사용할 수 있습니다.
- 스프링 컨테이너는 싱글톤 컨테이너 역할을 합니다. 이렇게 싱글톤 객체를 생성하고 관리하는 기능을 싱글톤 레지스트리라 합니다.

:::info
빈을 조회할 때마다 새 객체를 생성한다면 성능상 큰 오버헤드가 발생할 수 있습니다. 싱글톤 패턴은 이 문제를 해결하지만, 동시성 이슈를 고려해야 합니다.
:::

### 4.1 싱글톤 주의사항

- 싱글톤 객체는 상태를 유지하지 않아야 합니다(stateless).
- 특정 클라이언트에 의존적인 필드가 있으면 안 됩니다.
- 특정 클라이언트가 값을 변경할 수 있는 필드가 있으면 안 됩니다.
- 가급적 읽기만 가능해야 합니다.
- 필드 대신 지역변수, 파라미터, ThreadLocal 등을 사용해야 합니다.

### 4.2 @Configuration과 싱글톤

`@Configuration` 애노테이션은 싱글톤을 보장하는 데 중요한 역할을 합니다:

```java
@Configuration
public class AppConfig {
  
  @Bean
  public MemberService memberService() {
    return new MemberServiceImpl(memberRepository());
  }
  
  @Bean
  public OrderService orderService() {
    return new OrderServiceImpl(memberRepository(), discountPolicy());
  }
  
  @Bean
  public MemberRepository memberRepository() {
    return new MemoryMemberRepository();
  }
}
```

- 위 코드에서 `memberRepository()`는 여러 번 호출될 것 같습니다.
	- memberService을 만드는 코드에서 호출하고, orderService를 만드는 코드에서도 호출합니다.
	- 결과적으로 각각 다른 2개의 MemoryMemberRepository가 생성될 것 같습니다.
- 하지만 스프링 컨테이너는 싱글톤 레지스트리이므로, 빈이 싱글톤이 되도록 보장합니다.
- 여기서 비밀은 스프링 컨테이너가 `@Configuration` 애노테이션에 있습니다.
- 이는 스프링이 CGLIB 라이브러리를 사용해 `@Configuration` 클래스를 상속받은 임의의 다른 클래스를 만들고, 이미 등록된 빈이 있으면 해당 빈을 반환하도록 바이트코드를 조작하기 때문입니다.
- 만약 위 코드에서 @Configuration을 제거하면 호출할 때마다 새로운 MemoryMemberRepository가 생성됩니다.
	- 총 MemberRepository가 3번 호출되어 3개의 MemoryMemberRepository가 생성됩니다.
	- 즉 @Bean만 사용해도 스프링 빈으로 등록되지만, 싱글톤을 보장하지 않습니다.
- 스프링 설정 정보는 항상 @Configuration을 사용해야 합니다.

:::warning
`@Configuration`을 사용하지 않으면 싱글톤이 보장되지 않습니다. 메서드가 호출될 때마다 새로운 인스턴스가 생성됩니다.
:::

#### 4.2.1 CGLIB 예상 코드

```java
@Bean
public MemberRepository memberRepository() {
    if (memoryMemberRepository가 이미 스프링 컨테이너에 등록되어 있으면?) {
        return 스프링 컨테이너에서 찾아서 반환;
    } else { //스프링 컨테이너에 없으면
        기존 로직을 호출해서 MemoryMemberRepository를 생성하고 스프링 컨테이너에 등록
        return 반환;
    }
}
```

- @Bean이 붙은 메서드마다 이미 스프링 빈이 존재하면 존재하는 빈을 반환합니다.
- 스프링 빈이 없으면 생성해서 스프링 빈으로 등록하고 반환하는 코드가 동적으로 만들어집니다.
- 위는 예상 코드이며, 실제 동작 방식은 조금 다를 수 있습니다.
- 참고로 `AppConfig@CGLIB`는 AppConfig의 자식 타입이므로, AppConfig 타입으로 조회 할 수 있다.
	- `AppConfig@CGLIB`은 CGLIB 라이브러리가 기존 AppConfig 클래스를 상속받아 만든 임의의 다른 클래스입니다.

## 5. 컴포넌트 스캔

- 스프링은 `@Component` 애노테이션이 붙은 클래스를 자동으로 찾아 스프링 빈으로 등록하는 컴포넌트 스캔 기능을 제공합니다.
- 또한 `@Autowired` 애노테이션을 통해 의존관계를 자동으로 주입할 수 있습니다.

### 5.1 컴포넌트 스캔 사용 예시

```java
@Component
public class MemoryMemberRepository implements MemberRepository {
}

@Component
public class MemberServiceImpl implements MemberService {
  private final MemberRepository memberRepository;
  
  @Autowired
  public MemberServiceImpl(MemberRepository memberRepository) {
    this.memberRepository = memberRepository;
  }
}
```

- 생성자에 `@Autowired` 애노테이션을 붙이면 스프링 컨테이너가 자동으로 의존성을 주입합니다.
- 이때 기본 조회 전략은 타입이 같은 빈을 찾아 의존성을 주입합니다.
	- getBean(MemberRepository.class)와 동일하다고 이해하면 됩니다.

### 5.2 @ComponentScan 애노테이션

```java
@ComponentScan(
    basePackages = {"hello.core", "hello.service"}
)
```

- `basePackages`: 탐색할 패키지의 시작 위치를 지정합니다.
- 위치를 지정하지 않으면 `@ComponentScan`이 붙은 클래스의 패키지가 시작 위치가 됩니다.

:::tip
스프링 부트 애플리케이션의 시작점인 `@SpringBootApplication`에는 `@ComponentScan`이 포함되어 있어, 프로젝트 루트 패키지부터 컴포넌트 스캔이 시작됩니다.
:::

### 5.3 필터링

- `@ComponentScan`은 `includeFilters`와 `excludeFilters`를 사용해 스캔 대상을 필터링할 수 있습니다.
- includeFilters: 컴포넌트 스캔 대상을 추가로 지정합니다.
- excludeFilters: 컴포넌트 스캔 대상에서 제외합니다.
- @Component면 충분하기 때문에, includeFilters를 사용할 일은 거의 없습니다.
- excludeFilters 는 여러가지 이유로 간혹 사용할 때가 있지만 많지는 않습니다.

#### 5.3.1 예시

```java
@Configuration
@ComponentScan(
    includeFilters = @Filter(type = FilterType.ANNOTATION, classes = MyIncludeComponent.class),
    excludeFilters = @Filter(type = FilterType.ANNOTATION, classes = MyExcludeComponent.class)
)
static class ComponentFilterAppConfig {
}
```

- `@Filter` 애노테이션을 사용해 필터링 대상을 지정합니다.
- `FilterType.ANNOTATION`은 애노테이션을 기준으로 필터링합니다.
- `MyIncludeComponent` 애노테이션이 붙은 클래스는 스캔 대상에 포함되고, `MyExcludeComponent` 애노테이션이 붙은 클래스는 제외됩니다.

#### 5.3.2 FilterType 옵션

- `FilterType` 옵션으로 다음과 같은 필터링 방식을 지정할 수 있습니다:
	- `ANNOTATION`: 애노테이션을 기준으로 필터링합니다.
	- `ASSIGNABLE_TYPE`: 지정한 타입과 자식 타입을 모두 포함합니다.
	- `ASPECTJ`: AspectJ 패턴을 사용합니다.
	- `REGEX`: 정규 표현식을 사용합니다.
	- `CUSTOM`: 직접 구현한 필터를 사용합니다.

## 6. 빈 조회 충돌 시 해결 방법

```java
@Autowired
private DiscountPolicy discountPolicy
```

- @Autowired를 통해 의존성을 주입할 때, 빈 조회는 타입을 기준으로 이루어집니다.
- 만약 동일한 타입의 빈이 두 개 이상 존재한다면, 스프링은 빈 조회 시 충돌이 발생합니다.
- 이러한 경우 `NoUniqueBeanDefinitionException`이 발생하며, 이를 해결하기 위한 방법은 다음과 같습니다

### 6.1 @Autowired 필드 명 매칭

- @Autowired는 타입 매칭을 시도하고, 이때 여러 빈이 있으면 필드 이름, 파라미터 이름으로 빈 이름을 추가 매칭합니다.

```java
@Autowired
private DiscountPolicy rateDiscountPolicy
```

- 기존 코드에서 필드명을 `rateDiscountPolicy`로 변경하면, 스프링은 빈 이름이 `rateDiscountPolicy`인 빈을 주입합니다.
- 필드 명 매칭은 먼저 타입 매칭을 시도 하고 그 결과에 여러 빈이 있을 때 추가로 동작하는 기능입니다.

### 6.2 @Qualifier 사용

- @Qualifier는 추가 구분자를 붙여주는 방법입니다.
- 주입시 추가적인 방법을 제공하는 것이지 빈 이름을 변 경하는 것은 아닙니다.

```java
@Component
@Qualifier("mainDiscountPolicy")
public class RateDiscountPolicy implements DiscountPolicy {}

@Component
@Qualifier("fixDiscountPolicy")
public class FixDiscountPolicy implements DiscountPolicy {}

@Autowired
public OrderServiceImpl(MemberRepository memberRepository,
                        @Qualifier("mainDiscountPolicy") DiscountPolicy discountPolicy) {
    this.memberRepository = memberRepository;
    this.discountPolicy = discountPolicy;
}
```

- RateDiscountPolicy에는 `@Qualifier("mainDiscountPolicy")`를 붙여주고, FixDiscountPolicy에는 `@Qualifier("fixDiscountPolicy")`를
  붙여줍니다.
- OrderServiceImpl 생성자에 `@Qualifier("mainDiscountPolicy")`를 붙여주면, 스프링은 mainDiscountPolicy 빈을 주입합니다.
- 만약 mainDiscountPolicy를 찾지 못한다면 다음으로 빈 이름이 mainDiscountPolicy인 빈을 찾습니다.
- 이름으로도 찾지 못하면 NoUniqueBeanDefinitionException이 발생합니다.

### 6.3 @Primary 사용

- @Primary는 우선순위를 정하는 방법입니다.
- @Primary가 붙은 빈이 우선적으로 주입됩니다.

```java
@Component
@Primary
public class RateDiscountPolicy implements DiscountPolicy {}

@Component
public class FixDiscountPolicy implements DiscountPolicy {}

@Autowired
public OrderServiceImpl(MemberRepository memberRepository, DiscountPolicy discountPolicy) {
  this.memberRepository = memberRepository;
  this.discountPolicy = discountPolicy;
}
```

- RateDiscountPolicy에 `@Primary`를 붙여 우선순위를 부여합니다.
- 이렇게 하면 스프링은 RateDiscountPolicy 빈을 주입합니다.

### 6.4 @Qualifier와 @Primary 함께 사용

- @Qualifier와 @Primary를 함께 사용할 수 있습니다.
- @Qualifier가 우선적으로 적용되며, @Primary는 그 다음에 적용됩니다.
- 스프링은 자동보다는 수동이, 넒은 범위의 선택권 보다는 좁은 범위의 선택권이 우선 순위가 높습니다. 따라서 여기서도 @Qualifier가 우선권이 높습니다.

## 7. 빈 생명주기 콜백

- 스프링은 빈의 생명주기에 따라 초기화와 소멸 시점에 콜백을 제공합니다.
- 초기화 콜백: 빈이 생성되고 의존관계 주입이 완료된 후 호출됩니다.
- 소멸 전 콜백: 빈이 소멸되기 직전에 호출됩니다.
- 스프링은 세 가지 방법으로 빈 생명주기 콜백을 지원합니다
	- 인터페이스(InitializingBean, DisposableBean)
	- 설정 정보에 초기화 메서드, 소멸 메서드 지정
	- @PostConstruct, @PreDestroy 애노테이션 지원

### 7.1 스프링 빈의 이벤트 라이프사이클

1. 스프링 컨테이너 생성
2. 스프링 빈 생성
3. 의존관계 주입
4. 초기화 콜백
5. 빈 사용
6. 소멸 전 콜백
7. 스프링 컨테이너 종료

### 7.2 인터페이스

```java
package org.springframework.beans.factory;

public interface InitializingBean {
    void afterPropertiesSet() throws Exception;
}

package org.springframework.beans.factory;

public interface DisposableBean {
    void destroy() throws Exception;
}

public class NetworkClient implements InitializingBean, DisposableBean {
  @Override
  public void afterPropertiesSet() throws Exception {
    // 초기화 로직
  }
  
  @Override
  public void destroy() throws Exception {
    // 소멸 로직
  }
}
```

- InitializingBean과 DisposableBean 인터페이스를 구현하면 스프링 컨테이너가 초기화와 소멸 콜백을 지원합니다.
	- `afterPropertiesSet()`: 빈이 생성되고 의존관계 주입이 완료된 후 호출됩니다.
	- `destroy()`: 빈이 소멸되기 전에 호출됩니다.
- 하지만 이 방식은 스프링 전용 인터페이스에 의존하며, 메서드 이름을 변경할 수 없고, 외부 라이브러리에 적용할 수 없는 단점이 있습니다.
- 인터페이스를 사용하는 초기화, 종료 방법은 스프링 초창기에 나온 방법들이고, 지금은 다음의 더 나은 방법들이 있어서 거의 사용하지 않습니다.

### 6.2 설정 정보에 초기화 메서드, 종료 메서드 지정

```java
@Configuration
static class LifeCycleConfig {
  @Bean(initMethod = "init", destroyMethod = "close")
  public NetworkClient networkClient() {
    NetworkClient networkClient = new NetworkClient();
    networkClient.setUrl("http://hello-spring.dev");
    return networkClient;
  } 
}
```

- 이 방식은 메서드 이름을 자유롭게 지정할 수 있고, 스프링 코드에 의존하지 않으며, 외부 라이브러리에도 적용할 수 있습니다.
- 종료 메서드 추론
	- `@Bean`의 `destroyMethod` 속성에는 종료 메서드 이름을 지정할 수 있습니다.
	- 추가적으로 destroyMethod 속성은 특별한 기능이 있습니다.
	- 라이브러리 대부분이 close, shutdown이라는 이름의 종료 메서드를 사용하므로 추론 기능을 통해 close, shutdown 이라는 이름의 메서드를 자동으로 호출해줍니다.
	- 따라서 destroyMethod를 별도로 지정하지 않아도 됩니다.
	- 추론 기능을 사용하기 싫다면 `destroyMethod = ""`로 지정하면 됩니다.

### 6.3 @PostConstruct, @PreDestroy 애노테이션

```java
public class NetworkClient {
  @PostConstruct
  public void init() {
    // 초기화 로직
  }
  
  @PreDestroy
  public void close() {
    // 소멸 로직
  }
}
```

- 이 방식은 최신 스프링에서 가장 권장하는 방법으로, 간편하게 사용할 수 있고 자바 표준(JSR-250)이므로 다른 컨테이너에서도 동작합니다.
- 단, 외부 라이브러리에는 적용할 수 없습니다.
- 패키지를 보면 javax.annotation.PostConstruct이고 스프링에 의존하지 않습니다.

## 8. 빈 스코프

- 빈 스코프는 빈이 존재할 수 있는 범위를 의미합니다.
- 스프링은 다음 스코프를 지원합니다
	- 싱글톤: 기본 스코프로, 스프링 컨테이너의 시작과 종료까지 하나의 인스턴스만 유지
	- 프로토타입: 빈 요청마다 새로운 인스턴스 생성
	- 웹 관련 스코프:
		- **request**: 웹 요청이 들어오고 나갈 때까지 유지
		- **session**: 웹 세션이 생성되고 종료될 때까지 유지
		- **application**: 웹 서블릿 컨텍스트와 같은 범위로 유지

### 8.1 빈 스코프 지정

```java
@Scope("prototype")
@Component
public class HelloBean {}

// 또는
@Scope("prototype")
@Bean
PrototypeBean HelloBean() {
  return new HelloBean();
}
```

- `@Scope` 애노테이션을 사용해 빈 스코프를 지정할 수 있습니다.
- `@Scope("prototype")`은 프로토타입 스코프를 지정합니다.
- `@Scope("singleton")`은 싱글톤 스코프를 지정합니다.
- `@Scope("request")`, `@Scope("session")`, `@Scope("application")`은 웹 스코프를 지정합니다.

### 8.2 프로토타입 스코프

- 프로토타입 빈은 스프링 컨테이너에서 조회할 때마다 새로운 인스턴스가 생성됩니다.
- 스프링 컨테이너는 프로토타입 빈을 생성하고, 의존관계 주입, 초기화까지만 관리하고 이후 관리하지 않습니다.
	- `@PostConstruct` 초기화 콜백은 실행되지만, `@PreDestory` 종료 콜백은 실행되지 않습니다.
- 프로토타입 빈의 관리 책임은 프로토타입 빈을 받은 클라이언트에게 있습니다.

#### 8.2.1 프로토타입 빈의 생성 과정

1. 프로토타입 스코프 빈을 스프링 컨테이너에 요청
2. 스프링 컨테이너가 프로토타입 빈을 생성하고 의존관계 주입
3. 스프링 컨테이너가 생성한 프로토타입 빈을 클라이언트에 반환
4. 이후 같은 요청이 오면 항상 새로운 프로토타입 빈을 생성해 반환

:::tip
싱글톤 빈은 스프링 컨테이너가 관리하므로 스프링 컨테이너가 종료될 때 함께 종료되지만, 프로토타입 빈은 스프링 컨테이너가 생성과 의존관계 주입, 초기화까지만 관리하고 더이상 관리하지 않습니다.
:::