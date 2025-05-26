---
title: "Bean Post Processor"
description: "스프링 빈 후처리기(Bean Post Processor)의 개념부터 실제 활용까지 알아봅니다. 스프링이 빈을 생성하고 관리하는 프로세스에 개입하여 프록시를 자동으로 생성하는 방법과 스프링 AOP의 내부 동작 원리를 이해하는 데 필요한 핵심 개념을 설명합니다."
tags: ["BEAN_POST_PROCESSOR", "PROXY", "SPRING_AOP", "SPRING", "JAVA", "BACKEND"]
keywords: ["빈후처리기", "Bean Post Processor", "BeanPostProcessor", "스프링", "Spring", "프록시", "Proxy", "스프링AOP", "Spring AOP", "AspectJ", "어드바이저", "Advisor", "포인트컷", "Pointcut", "어드바이스", "Advice", "자동프록시생성기", "Auto Proxy Creator"]
draft: false
hide_title: true
---

## 1. 빈 후처리기(Bean Post Processor) 소개

- 스프링은 빈을 생성하고 의존관계를 주입한 후에, 최종적으로 빈 객체를 조작할 수 있는 기회를 제공합니다.
- 빈 후처리기(Bean Post Processor)는 이름 그대로 빈을 생성한 후에 무언가를 처리하는 용도로 사용됩니다.
- 빈 후처리기를 사용하면 스프링이 관리하는 빈을 중간에 조작하거나, 다른 객체로 바꿔치기할 수 있습니다.

### 1.1 스프링 빈 생명주기와 후처리기의 위치

- **스프링 빈 생명주기의 흐름**
	- **빈 생성**: 스프링 컨테이너가 빈을 생성합니다. (예: `@Bean` 어노테이션, 컴포넌트 스캔 등)
	- **의존 관계 주입**: 필요한 의존 관계를 주입합니다.
	- **초기화 콜백**: 빈이 생성되고 의존관계 주입이 완료된 후 호출됩니다.
	- **사용**: 빈을 실제로 사용합니다.
	- **소멸 전 콜백**: 빈이 소멸되기 직전에 호출됩니다.
	- **소멸**: 스프링 컨테이너에서 빈을 제거합니다.
- **빈 후처리기**는 초기화 콜백 전후에 위치하며, 이 시점에 빈 객체를 조작하거나 다른 객체로 바꿔치기할 수 있습니다.

## 2. 빈 후처리기의 동작 원리

### 2.1 BeanPostProcessor 인터페이스

```java
public interface BeanPostProcessor {
    Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException;
    Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException;
}
```

- 빈 후처리기를 구현하려면 `BeanPostProcessor` 인터페이스를 구현해야 합니다.
  - `postProcessBeforeInitialization`: 빈 객체의 초기화 메서드(`@PostConstruct` 등) 호출 전에 실행됩니다.
  - `postProcessAfterInitialization`: 빈 객체의 초기화 메서드 호출 후에 실행됩니다.

### 2.2 빈 후처리기 기본 예제

다음은 빈 후처리기의 기본적인 동작을 보여주는 예제입니다.

```java
@Slf4j
static class AToBPostProcessor implements BeanPostProcessor {
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        log.info("beanName={} bean={}", beanName, bean);
        if (bean instanceof A) {
            return new B();
        }
        return bean;
    }
}
```

- 이 후처리기는 매우 단순합니다: 타입이 `A`인 빈이 있으면 `B` 타입의 새로운 객체를 생성해서 반환합니다. 
- 즉, A 타입의 빈을 B 타입의 빈으로 교체하는 것입니다.

### 2.3 빈 후처리기 등록 방법

빈 후처리기를 사용하려면 스프링 빈으로 등록해야 합니다.

```java
@Configuration
static class BeanPostProcessorConfig {
    @Bean(name = "beanA")
    public A a() {
        return new A();
    }
    
    @Bean
    public AToBPostProcessor helloPostProcessor() {
        return new AToBPostProcessor();
    }
}
```

- 이렇게 등록하면 스프링은 등록된 빈 후처리기를 찾아서 빈 생성 과정에 적용합니다.

## 3. 프록시와 빈 후처리기

### 3.1 프록시 자동 생성을 위한 빈 후처리기

- 빈 후처리기의 가장 일반적인 사용 사례 중 하나는 **프록시 자동 생성**입니다. 
- 스프링 AOP와 같이 원본 빈을 프록시로 감싸서 추가 기능을 제공하는 경우에 활용됩니다.
- 다음은 특정 패키지 내의 모든 빈에 프록시를 적용하는 후처리기 예제입니다

```java
@Slf4j
public class PackageLogTraceProxyPostProcessor implements BeanPostProcessor {
    private final String basePackage;
    private final Advisor advisor;
    
    public PackageLogTraceProxyPostProcessor(String basePackage, Advisor advisor) {
        this.basePackage = basePackage;
        this.advisor = advisor;
    }
    
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        log.info("param beanName={} bean={}", beanName, bean.getClass());
        
        // 프록시 적용 대상 여부 체크
        String packageName = bean.getClass().getPackageName();
        if (!packageName.startsWith(basePackage)) {
            return bean;
        }
        
        // 프록시 생성
        ProxyFactory proxyFactory = new ProxyFactory(bean);
        proxyFactory.addAdvisor(advisor);
        Object proxy = proxyFactory.getProxy();
        log.info("create proxy: target={} proxy={}", bean.getClass(), proxy.getClass());
        return proxy;
    }
}
```

- 이 후처리기는:
  1. 특정 패키지(`basePackage`)에 속한 빈만 프록시로 변환합니다.
  2. 대상 빈의 패키지명이 `basePackage`로 시작하지 않으면 원본 빈을 그대로 반환합니다.
  3. 프록시 대상인 경우 `ProxyFactory`를 사용하여 프록시를 생성합니다.
  4. 생성된 프록시에 `advisor`를 추가합니다.
  5. 생성된 프록시를 반환하여 원본 빈 대신 사용되도록 합니다.
- 위 후처리기는 예시로 프록시 대상을 패키지명으로 구분했지만, 실제로는 포인트컷을 사용하여 더 정교한 매칭 규칙을 적용할 수 있습니다.

### 3.2 빈 후처리기 설정

- 프록시 생성 빈 후처리기를 적용하는 설정 예제입니다:

```java
@Configuration
@Import({AppV1Config.class, AppV2Config.class})
public class BeanPostProcessorConfig {
    @Bean
    public PackageLogTraceProxyPostProcessor logTraceProxyPostProcessor(LogTrace logTrace) {
        return new PackageLogTraceProxyPostProcessor("hello.proxy.app", getAdvisor(logTrace));
    }
    
    private Advisor getAdvisor(LogTrace logTrace) {
        // pointcut
        NameMatchMethodPointcut pointcut = new NameMatchMethodPointcut();
        pointcut.setMappedNames("request*", "order*", "save*");
        
        // advice
        LogTraceAdvice advice = new LogTraceAdvice(logTrace);
        
        // advisor = pointcut + advice
        return new DefaultPointcutAdvisor(pointcut, advice);
    }
}
```

- 이 설정은:
  1. `hello.proxy.app` 패키지 내의 모든 빈을 프록시 생성 대상으로 지정합니다.
  2. 메서드 이름이 "request*", "order*", "save*"로 시작하는 메서드에만 적용되는 포인트컷을 정의합니다.
  3. 실제 부가 기능을 제공하는 어드바이스를 설정합니다.
  4. 포인트컷과 어드바이스를 결합한 어드바이저를 생성합니다.
- 이렇게 설정하면 스프링 컨테이너가 생성한 빈 중에서 `hello.proxy.app` 패키지에 속한 빈들은 자동으로 프록시로 변환됩니다.

## 4. 자동 프록시 생성기(AnnotationAwareAspectJAutoProxyCreator)

- 빈 후처리기를 직접 구현하는 것은 번거로울 수 있습니다. 
- 스프링은 이런 프록시 생성 로직을 자동화하는 **자동 프록시 생성기**를 제공합니다.

### 4.1 스프링이 제공하는 자동 프록시 생성기

- 스프링 AOP의 핵심에는 `AnnotationAwareAspectJAutoProxyCreator`라는 빈 후처리기가 있습니다.
  - 이름 그대로 자동으로 프록시를 생성해주는 빈 후처리기입니다.
- 이 후처리기는:
  - 스프링 빈으로 등록된 `Advisor`들을 찾아서 자동으로 프록시 생성 로직을 적용합니다.
    - `Advisor`는 포인트컷과 어드바이스를 하나로 묶은 것입니다. 
    - 따라서 포인트컷을 통해 어떤 메서드에 부가 기능을 적용할지 알 수 있으며 어드바이스를 통해 실제 부가 기능을 제공합니다.
  - `@Aspect` 어노테이션이 붙은 스프링 빈을 찾아서 Advisor로 변환하여 처리합니다.
- 이 기능을 사용하려면 다음과 같이 스프링 부트 AOP 스타터를 추가해야 합니다.

```groovy
implementation 'org.springframework.boot:spring-boot-starter-aop'
```

### 4.2 자동 프록시 생성기 작동 과정

- **생성**
  - 스프링이 스프링 빈 대상이 되는 객체를 생성합니다. (`@Bean`, 컴포넌트 스캔 모두 포함)
- **전달**
  - 생성된 객체를 빈 저장소에 등록하기 직전에 빈 후처리기에 전달합니다.
- **모든 Advisor 빈 조회**
   - 자동 프록시 생성기 - 빈 후처리기는 스프링 컨테이너에서 모든 `Advisor`를 조회합니다.
- **프록시 적용 대상 체크**
  - 조회한 `Advisor`에 포함된 포인트컷을 사용해 해당 객체가 프록시 적용 대상인지 판단합니다. 
  - 클래스 정보와 모든 메서드를 포인트컷에 매칭해 조건이 하나라도 만족하면 프록시 적용 대상이 됩니다.
- **프록시 생성**
  - 프록시 적용 대상이면 프록시를 생성하고 반환해 스프링 빈으로 등록합니다. 
  - 프록시 적용 대상이 아니면 원본 객체를 반환해 스프링 빈으로 등록합니다.
- **빈 등록**
  - 반환된 객체를 스프링 빈으로 등록합니다.

### 4.3 자동 프록시 생성기 적용 예제

```java
@Configuration
@Import({AppV1Config.class, AppV2Config.class})
public class AutoProxyConfig {
    @Bean
    public Advisor advisor1(LogTrace logTrace) {
        NameMatchMethodPointcut pointcut = new NameMatchMethodPointcut();
        pointcut.setMappedNames("request*", "order*", "save*");
        LogTraceAdvice advice = new LogTraceAdvice(logTrace);
        return new DefaultPointcutAdvisor(pointcut, advice);
    }
}
```
- 위는 자동 프록시 생성기를 사용하는 설정 예제입니다.
- 이 설정은 단지 `Advisor`만 빈으로 등록합니다. 
- 나머지 프록시 생성 과정은 `AnnotationAwareAspectJAutoProxyCreator` 빈 후처리기가 자동으로 처리합니다.
  - 위에서 설명한 동작 과정을 거쳐 `Advisor`에 포함된 포인트컷을 사용해 프록시를 생성하고 적용합니다.
- 여기서 중요한 부분이 포인트컷입니다. 포인트컷은 2가지 용도로 사용됩니다.
  - **프록시 적용 대상 체크(생성 단계)**
    - 어떤 객체에 프록시를 적용할지 결정합니다.
    - 자동 프록시 생성기는 포인트컷을 사용해서 해당 빈이 프록시를 생성할 필요가 있는지 없는지 체크합니다.
    - 클래스의 모든 메서드를 포인트컷에 매칭해 조건이 하나라도 만족하면 프록시 적용 대상이 됩니다.
    - 만약 매칭되는 것이 없으면 원본 객체를 그대로 반환합니다.
  - **부가 기능 적용 대상 체크(사용 단계)**
    - 프록시가 호출되었을 때 부가 기능인 어드바이스를 적용할지 말지 포인트컷을 보고 판단합니다.
    - 포인트컷 조건식이 만족되면 어드바이스를 적용합니다.
- 예를 들어, `save()`메서드에만 부가 기능을 적용하고 `find()` 메서드에는 적용하지 않는 경우를 생각해봅시다. 
  - 생성 단계에서만 포인트컷을 적용하면, 프록시가 생성될 때 `save()` 메서드에만 어드바이스가 적용됩니다. 
  - 하지만 사용 단계에서 `find()` 메서드를 호출할 때도 포인트컷을 체크하지 않으면, `find()` 메서드가 호출될 때 어드바이스가 적용되지 않음을 보장할 수 없습니다. 
  - 따라서 사용 단계에서도 포인트컷을 체크하여 `save()` 메서드에만 어드바이스가 적용되도록 해야 합니다.

### 4.4 포인트컷 표현식 사용

- 메서드 이름 패턴만으로는 복잡한 매칭 규칙을 표현하기 어렵습니다. 
- 스프링은 AspectJ의 표현식 문법을 차용한 강력한 포인트컷 표현식을 지원합니다.

```java
@Bean
public Advisor advisor2(LogTrace logTrace) {
    AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
    pointcut.setExpression("execution(* hello.proxy.app..*(..))");
    LogTraceAdvice advice = new LogTraceAdvice(logTrace);
    return new DefaultPointcutAdvisor(pointcut, advice);
}
```

- 이 설정은 `hello.proxy.app` 패키지와 그 하위 패키지에 있는 모든 클래스의 모든 메서드에 프록시를 적용합니다.
- 더 복잡한 표현식도 가능합니다

```java
@Bean
public Advisor advisor3(LogTrace logTrace) {
    AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
    pointcut.setExpression("execution(* hello.proxy.app..*(..)) && !execution(* hello.proxy.app..noLog(..))");
    LogTraceAdvice advice = new LogTraceAdvice(logTrace);
    return new DefaultPointcutAdvisor(pointcut, advice);
}
```

- 이 표현식은 `hello.proxy.app` 패키지와 그 하위 패키지의 모든 메서드 중에서 `noLog()`라는 이름의 메서드는 제외합니다.

## 5. 다수의 Advisor 적용

- 예를 들어서 어떤 스프링 빈이 `advisor1` , `advisor2` 가 제공하는 포인트컷의 조건을 모두 만족하면 프록시 자동 생성기는 프록시를 몇 개 생성할까요?
- 프록시 자동 생성기는 프록시를 하나만 생성합니다.
- 프록시 팩토리가 생성하는 프록시는 내부에 여러 `advisor` 들을 포함할 수 있기 때문입니다.
- 만약 여러 `advisor` 들이 적용되는 경우, 프록시는 해당되는 모든 `advisor`를 가지고 있습니다.

## 6. 스프링 AOP와 빈 후처리기의 관계

### 6.1 스프링 AOP의 내부 동작 원리

- 스프링 AOP는 내부적으로 빈 후처리기와 프록시를 통해 구현됩니다:
  - 스프링 컨테이너가 빈을 생성합니다.
  - 빈 후처리기가 Advisor와 대상 빈을 찾아 프록시 적용 대상인지 확인합니다.
  - 프록시 적용 대상이면 프록시를 생성하고 원본 빈 대신 프록시를 빈으로 등록합니다.
  - 클라이언트는 원본 빈을 호출하는 것처럼 코드를 작성하지만, 실제로는 프록시를 호출하게 됩니다.
  - 프록시는 부가 기능(어드바이스)을 수행한 다음 원본 빈을 호출합니다.

### 6.2 어드바이저, 포인트컷, 어드바이스의 역할

- **어드바이저(Advisor)**: 포인트컷과 어드바이스를 하나로 묶은 것
- **포인트컷(Pointcut)**: 어디에 부가 기능을 적용할지 판단하는 필터링 로직
- **어드바이스(Advice)**: 프록시가 호출하는 부가 기능
- 스프링 AOP에서는:
  - 포인트컷을 통해 어떤 메서드에 부가 기능을 적용할지 결정합니다.
  - 어드바이스를 통해 실제 부가 기능 로직을 구현합니다.
  - 어드바이저는 포인트컷과 어드바이스를 연결하여 스프링 빈으로 등록됩니다.
  - 자동 프록시 생성기는 이 어드바이저를 사용하여 필요한 빈에 프록시를 적용합니다.

## 7. @Aspect AOP

- 스프링 애플리케이션에 프록시를 적용하려면 포인트컷과 어드바이스로 구성되어 있는 어드바이저(`Advisor`)를 스프링 빈으로 등록하면 됩니다.
- 빈으로 등록 된 `Advisor`는 자동 프록시 생성기(`AnnotationAwareAspectJAutoProxyCreator`)에 의해 프록시로 변환됩니다.
- 스프링은 `@Aspect` 애노테이션으로 매우 편리하게 포인트컷과 어드바이스로 구성되어 있는 어드바이저 생성 기능을 지원합니다.
- `@Aspect` 애노테이션을 사용하면 `@Pointcut`, `@Before`, `@After`, `@Around` 등의 애노테이션을 사용하여 간단하게 어드바이저를 정의할 수 있습니다.

### 7.1 @Aspect 애노테이션 사용 예제

```java
package hello.proxy.config.v6_aop.aspect;

import hello.proxy.trace.TraceStatus;
import hello.proxy.trace.logtrace.LogTrace;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;

@Slf4j
@Aspect
public class LogTraceAspect {
    private final LogTrace logTrace;

    public LogTraceAspect(LogTrace logTrace) {
        this.logTrace = logTrace;
    }

    @Around("execution(* hello.proxy.app..*(..))")
    public Object execute(ProceedingJoinPoint joinPoint) throws Throwable {
        TraceStatus status = null;
        log.info("target={}", joinPoint.getTarget()); // 실제 호출 대상
        // log.info("getArgs={}", joinPoint.getArgs()); // 전달인자
        log.info("getSignature={}", joinPoint.getSignature()); // join point 시그

        try {
            String message = joinPoint.getSignature().toShortString();
            status = logTrace.begin(message);
            // 로직 호출
            Object result = joinPoint.proceed();
            logTrace.end(status);
            return result;
        } catch (Exception e) {
            logTrace.exception(status, e);
            throw e;
        }
    }
}
```

- `AnnotationAwareAspectJAutoProxyCreator`는 `@Aspect` 애노테이션이 붙은 빈을 찾아서 Advisor로 변환합니다.

### 7.2 @Aspect를 Advisor로 변환하는 과정

- 스프링 애플리케이션 로딩 시점에 자동 프록시 생성기를 호출한다
- 자동 프록시 생성기는 스프링 컨테이너에서 `@Aspect` 애노테이션이 붙은 스프링 빈을 모두 조회합니다.
- `@Aspect` 어드바이저 빌더를 통해 `@Aspect` 애노테이션 정보를 기반으로 어드바이저를 생성합니다.
- 생성한 어드바이저를 `@Aspect` 어드바이저 빌더 내부에 저장합니다.
- @Aspect 어드바이저 빌더
  - `BeanFactoryAspectJAdvisorsBuilder` 클래스입니다.
  - `@Aspect` 의 정보를 기반으로 포인트컷, 어드바이스, 어드바이저를 생성하고 보관하는 것을 담당합니다.
  - `@Aspect` 의 정보를 기반으로 어드바이저를 만들고, @Aspect 어드바이저 빌더 내부 저장소에 캐시합니다.
  - 캐시에 어드바이저가 이미 만들어져 있는 경우 캐시에 저장된 어드바이저를 반환합니다.

### 7.3 어드바이저 기반으로 프록시를 생성하는 과정

- **생성**
  - 스프링 빈 대상이 되는 객체를 생성한다. (`@Bean`, 컴포넌트 스캔 모두 포함)
- **전달**
  - 생성된 객체를 빈 저장소에 등록하기 직전에 빈 후처리기에 전달한다.
- **Advisor 조회**:
  - Advisor 빈 조회: 스프링 컨테이너에서 `Advisor` 빈을 모두 조회한다.
  - @Aspect Advisor 조회: `@Aspect` 어드바이저 빌더 내부에 저장된 `Advisor`를 모두 조회한다.
- **프록시 적용 대상 체크**: 
  - 앞서 조회한 `Advisor`에 포함되어 있는 포인트컷을 사용해서 해당 객체가 프록시를 적용할 대상인지 판단한다. 
  - 이때 객체의 클래스 정보는 물론이고, 해당 객체의 모든 메서드를 포인트컷에 하나하나 모두 매칭해본다. 
  - 조건이 하나라도 만족하면 프록시 적용 대상이 된다.
- **프록시 생성**
  - 프록시 적용 대상이면 프록시를 생성하고 프록시를 반환한다. 
  - 그래서 프록시를 스프링 빈으로 등록한다. 
  - 만약 프록시 적용 대상이 아니라면 원본 객체를 반환해서 원본 객체를 스프링 빈으로 등록한다.
- **빈 등록**
  - 반환된 객체는 스프링 빈으로 등록된다.