---
title: "Dependency Injection"
description: "스프링 프레임워크에서 사용되는 다양한 의존성 주입 방법을 비교 분석합니다. 생성자 주입, 수정자 주입, 필드 주입, 일반 메서드 주입의 장단점과 실제 사용 사례를 코드 예제와 함께 상세히 설명하고, 최신 개발 트렌드에 맞는 권장 방식을 제시합니다."
tags: [ "DEPENDENCY_INJECTION", "SPRING", "SPRING_BOOT", "BACKEND", "JAVA" ]
keywords: [ "의존성 주입", "dependency injection", "DI", "스프링", "spring", "생성자 주입", "constructor injection", "수정자 주입", "setter injection", "필드 주입", "field injection", "롬복", "lombok", "자바", "java", "스프링부트", "spring boot", "스프링 프레임워크", "spring framework", "의존관계", "의존성" ]
draft: false
hide_title: true
---

## 1. 의존성 주입 개요

- 의존성 주입(Dependency Injection, DI)은 스프링 프레임워크의 핵심 기능 중 하나입니다.
- 객체 간의 결합도를 낮추고 코드의 재사용성과 테스트 용이성을 높이는 기법입니다.
- 스프링에서는 다양한 방식으로 의존성을 주입할 수 있으며, 각 방식에는 고유한 특징과 장단점이 있습니다.
- 의존성 주입 방법에는 크게 생성자 주입, 수정자 주입, 필드 주입, 일반 메서드 주입이 있습니다.

### 1.1 의존성 주입(DI)이란?

- 의존성 주입(DI)은 객체가 자신이 필요로 하는 다른 객체들(의존성)을 다음 세 가지 방법으로만 정의하는 과정입니다
  - 생성자 매개변수를 통해
  - 팩토리 메서드의 매개변수를 통해
  - 객체가 생성되거나 팩토리 메서드에서 반환된 후에 설정되는 속성을 통해
- 컨테이너는 빈(Bean)을 생성할 때 이러한 의존성들을 주입합니다.

## 2. 생성자 주입(Constructor Injection)

- 생성자를 통해 의존 객체를 주입받는 방법입니다.
- 객체가 생성될 때 의존성이 주입되므로 불변, 필수 의존관계에 적합합니다.
- 스프링 4.3부터는 생성자가 단 하나만 있는 경우 `@Autowired` 애노테이션을 생략해도 자동으로 주입됩니다.
	- 단, 해당 클래스가 스프링 빈으로 등록된 경우에만 해당됩니다.
  - 생성자가 2개 이상인 경우에는 생성자에 어노테이션을 붙여주어야 합니다.

:::info
생성자 주입은 객체 생성 시점에 딱 한 번만 호출되므로 불변성을 보장합니다.
:::


### 2.1 생성자 주입 예제 코드

```java
@Component
public class OrderServiceImpl implements OrderService {
    private final MemberRepository memberRepository;
    private final DiscountPolicy discountPolicy;

    @Autowired
    public OrderServiceImpl(MemberRepository memberRepository, DiscountPolicy
            discountPolicy) {
        this.memberRepository = memberRepository;
        this.discountPolicy = discountPolicy;
    }
}
```

- 이 코드에서는 생성자를 통해 MemberRepository와 DiscountPolicy를 주입받고 있습니다.

### 2.2 생성자 주입 장점

- 불변성을 보장할 수 있습니다. 
  - 생성자 주입은 객체 생성 시점에 의존성을 주입하므로 final 키워드를 사용할 수 있습니다. 
  - 이를 통해 객체의 생명주기 동안 의존성이 변경되지 않도록 보장할 수 있습니다. 
  - 반면 세터나 필드 주입은 객체 생성 이후에 의존성을 주입하기 때문에 final 키워드를 사용할 수 없고, 의존성이 언제든 변경될 수 있습니다.
- 생성자 주입에서 순환 참조는 런타임(애플리케이션 구동 시점)에 감지됩니다
  - 예를 들어 A 클래스가 B 클래스를 의존하고, B 클래스가 다시 A 클래스를 의존하는 경우, 생성자 주입에서는 객체 생성 자체가 불가능해져 애플리케이션 구동 시점에 BeanCurrentlyInCreationException이 발생합니다. 
  - 반면 필드나 세터 주입에서는 객체가 먼저 생성된 후 의존성이 주입되기 때문에 순환 참조가 런타임에 즉시 발견되지 않습니다.
    - 해당 메서드가 호출되거나 필드가 사용될 때 문제가 발생하므로, 실제 운영 중에 발견될 가능성이 높습니다.
- 테스트 용이성이 높습니다. 
  - 생성자 주입을 사용하면 스프링 컨테이너 없이도 단순히 필요한 의존성을 생성자에 전달하여 객체를 생성할 수 있습니다.
  - 반면 필드 주입의 경우 스프링 컨테이너가 없으면 의존성 주입이 불가능하여 테스트가 어렵습니다.
- 가독성
  - 의존성이 명시적으로 드러납니다. 
  - 생성자의 파라미터를 통해 해당 클래스가 어떤 의존성을 가지고 있는지 명확하게 알 수 있습니다. 
  - 이는 코드의 가독성과 이해도를 높여주며, 필요한 의존성이 누락되었을 때 컴파일 에러가 발생하여 개발자가 바로 알 수 있습니다.
- null 방지
  - NullPointerException을 방지할 수 있습니다. 
  - 생성자 주입은 객체 생성 시점에 모든 의존성이 주입되어야 하므로, 의존성이 null인 상태로 객체가 생성될 수 없습니다.
  - 만약 필요한 의존성 빈이 없다면 스프링은 다음과 같은 오류를 발생시킵니다.(NoSuchBeanDefinitionException)
  - 이로 인해 런타임에 NullPointerException이 발생할 가능성이 크게 줄어듭니다.

### 2.3 순환 의존성

- 만약 생성자 주입을 사용한다면, 해결할 수 없는 순환 의존성 시나리오가 생길 수 있습니다.
- 클래스는 생성자 주입을 통해 B 클래스의 인스턴스를 필요로 하고, B 클래스는 생성자 주입을 통해 A 클래스의 인스턴스를 필요로 합니다. 
- A와 B 클래스에 대한 빈을 서로 주입되도록 구성하면, 스프링 IoC 컨테이너는 런타임에 이 순환 참조를 감지하고 BeanCurrentlyInCreationException을 던집니다.
- 한 가지 가능한 해결책은 일부 클래스의 소스 코드를 수정하여 생성자가 아닌 세터를 통해 구성되도록 하는 것입니다. 
  - 또는 생성자 주입을 피하고 세터 주입만 사용하는 방법도 있습니다. 다시 말해, 권장되지는 않지만 세터 주입으로 순환 의존성을 구성할 수 있습니다.
  - 설계 변경을 통한 순환 의존성 제거가 가장 좋은 해결책입니다.

**예시**

```java
@Service
public class AService {
    private final BService bService;
    
    @Autowired
    public AService(BService bService) {
        this.bService = bService;
    }
}

@Service
public class BService {
    private final AService aService;
    
    @Autowired
    public BService(AService aService) {
        this.aService = aService;
    }
}
```

- 예를 들어 A 클래스와 B 클래스가 서로를 의존하는 상황을 생각해보겠습니다
- AService를 생성하려면 BService의 인스턴스가 필요합니다.
- BService를 생성하려면 AService의 인스턴스가 필요합니다.
- 이러한 상황에서 Spring은 애플리케이션 컨텍스트를 초기화할 수 없게 되고, 컴파일 시점에 다음과 같은 오류가 발생합니다:

## 3. 수정자 주입(Setter Injection)

- 수정자(setter) 메서드를 통해 의존관계를 주입하는 방법입니다.
- 선택적이거나 변경 가능성이 있는 의존관계에 사용합니다.
- 기본적으로 `@Autowired`는 주입할 대상이 없으면 오류가 발생합니다.
	- 주입할 대상이 없어도 동작하게 하려면 `@Autowired(required = false)`로 지정해야 합니다.

:::warning
수정자 주입은 객체 생성 후에 호출되므로, 객체 생성 시점에는 필요한 의존성이 모두 주입되지 않을 수 있습니다.
:::

### 3.1 예시

```java
@Component
public class OrderServiceImpl implements OrderService {
    private MemberRepository memberRepository;
    private DiscountPolicy discountPolicy;

    @Autowired
    public void setMemberRepository(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Autowired
    public void setDiscountPolicy(DiscountPolicy discountPolicy) {
        this.discountPolicy = discountPolicy;
    }
}
```

이 코드에서는 setter 메서드를 통해 의존성을 주입받고 있습니다.

## 4. 필드 주입(Field Injection)

- 필드에 직접 `@Autowired`를 사용하여 의존성을 주입하는 방법입니다.
- 코드가 간결하다는 장점이 있지만, 외부에서 변경이 불가능하여 테스트하기 어렵다는 치명적인 단점이 있습니다.
- DI 프레임워크 없이는 의존성을 주입할 방법이 없어 단위 테스트가 어렵습니다.

:::danger
필드 주입은 편리하지만 테스트 용이성, 불변성 등의 측면에서 심각한 단점이 있어 실무에서는 지양해야 합니다.
:::

#### 필드 주입 예제 코드

```java
@Component
public class OrderServiceImpl implements OrderService {
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private DiscountPolicy discountPolicy;
}
```

이 코드에서는 필드에 직접 `@Autowired`를 사용하여 의존성을 주입하고 있습니다.

## 5. 일반 메서드 주입(Method Injection)

- 일반 메서드를 통해 의존성을 주입받는 방법입니다.
- 한 번에 여러 필드를 주입받을 수 있다는 특징이 있습니다.
- 실무에서는 잘 사용되지 않는 방식입니다.

#### 일반 메서드 주입 예제 코드

```java
@Component
public class OrderServiceImpl implements OrderService {
    private MemberRepository memberRepository;
    private DiscountPolicy discountPolicy;

    @Autowired
    public void init(MemberRepository memberRepository, DiscountPolicy
            discountPolicy) {
        this.memberRepository = memberRepository;
        this.discountPolicy = discountPolicy;
    }
}
```

이 코드에서는 일반 메서드인 `init()`을 통해 의존성을 주입받고 있습니다.

## 6. 의존성 주입 방식 선택 기준

- 실무에서는 **생성자 주입**을 권장합니다.
- 생성자 주입을 선택해야 하는 이유는 다음과 같습니다:

### 6.1 불변성 보장

- 대부분의 의존관계는 애플리케이션 종료 시점까지 변경되지 않아야 합니다.
- 수정자 주입은 `setXxx` 메서드를 public으로 열어두어야 하므로 의도치 않은 변경 위험이 있습니다.
- 생성자 주입은 객체 생성 시 딱 한 번만 호출되므로 불변성을 보장합니다.

### 6.2 필수 의존성 보장

- 생성자 주입은 필드에 `final` 키워드를 사용할 수 있어 컴파일 시점에 누락된 의존성을 확인할 수 있습니다.
- 다른 주입 방식은 모두 객체 생성 후에 호출되므로 `final` 키워드를 사용할 수 없습니다.

:::tip
생성자 주입은 프레임워크에 의존하지 않는 순수한 자바 언어의 특징을 활용하는 방식이므로, 스프링 없이도 단위 테스트가 용이합니다.
:::

## 7. 의존성 주입 최신 트렌드

- 최근 스프링 개발에서는 다음과 같은 단계적 접근 방식이 권장됩니다:

### 7.1 기본 생성자 주입 방식

#### 1단계: @Autowired와 함께 사용

```java
@Component
public class OrderServiceImpl implements OrderService {
    private final MemberRepository memberRepository;
    private final DiscountPolicy discountPolicy;

    @Autowired
    public OrderServiceImpl(MemberRepository memberRepository, DiscountPolicy
            discountPolicy) {
        this.memberRepository = memberRepository;
        this.discountPolicy = discountPolicy;
    }
}
```

#### 7.2 생성자 하나인 경우 @Autowired 생략

```java
@Component
public class OrderServiceImpl implements OrderService {
    private final MemberRepository memberRepository;
    private final DiscountPolicy discountPolicy;

    public OrderServiceImpl(MemberRepository memberRepository, DiscountPolicy
            discountPolicy) {
        this.memberRepository = memberRepository;
        this.discountPolicy = discountPolicy;
    }
}
```

### 7.3 Lombok 라이브러리 활용

- Lombok의 `@RequiredArgsConstructor` 애노테이션을 사용하면 `final` 필드를 모아 생성자를 자동으로 생성해줍니다.
- 이 방식은 코드의 양을 줄이고 가독성을 높이는 장점이 있습니다.

:::tip
최신 스프링 프로젝트에서는 생성자를 하나만 두고 @Autowired를 생략하거나, Lombok의 @RequiredArgsConstructor를 활용하는 방식이 주로 사용됩니다.
:::

#### Lombok을 활용한 생성자 주입 예제 코드

```java
@RequiredArgsConstructor
@Component
public class OrderServiceImpl implements OrderService {
    private final MemberRepository memberRepository;
    private final DiscountPolicy discountPolicy;
}
```

위 코드에서 Lombok의 `@RequiredArgsConstructor`가 `final` 필드를 파라미터로 받는 생성자를 자동으로 생성합니다.

## 8. 결론

- 의존성 주입은 스프링의 핵심 기능으로, 객체 간의 결합도를 낮추고 유지보수성을 높입니다.
- 다양한 주입 방식 중에서 생성자 주입이 불변성, 필수 의존성 등의 측면에서 가장 권장됩니다.
- 최신 스프링 개발에서는 생성자 주입과 Lombok을 함께 활용하는 방식이 널리 사용됩니다.
- 필수적인 의존성은 생성자 주입으로, 선택적인 의존성은 수정자 주입을 조합하여 사용하는 것이 좋은 방법입니다.

### 참고 자료

- [스프링 핵심 원리 - 기본편](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B8%B0%EB%B3%B8%ED%8E%B8#)
- [생성자 주입을 사용해야 하는 이유](https://madplay.github.io/post/why-constructor-injection-is-better-than-field-injection)