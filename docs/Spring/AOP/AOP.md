---
title: "Spring AOP"
description: "스프링 AOP(Aspect Oriented Programming)의 개념부터 실제 구현까지 상세히 설명합니다. 횡단 관심사 분리, 포인트컷, 어드바이스 유형, AspectJ와의 관계, 그리고 실제 사용 예제를 통해 스프링 AOP의 강력한 기능을 마스터할 수 있는 완벽 가이드입니다."
tags: ["SPRING_AOP", "ASPECT", "POINTCUT", "ADVICE", "SPRING", "JAVA", "BACKEND"]
keywords: ["스프링 AOP", "Spring AOP", "관점 지향 프로그래밍", "Aspect Oriented Programming", "횡단 관심사", "crosscutting concerns", "포인트컷", "pointcut", "어드바이스", "advice", "어드바이저", "advisor", "조인포인트", "joinpoint", "애스펙트", "aspect", "AspectJ", "프록시", "proxy", "위빙", "weaving", "어라운드", "around", "비포", "before", "애프터", "after"]
draft: false
hide_title: true
---

## 1. Aspect Oriented Programming

- 관점 지향 프로그래밍(AOP)은 객체 지향 프로그래밍(OOP)을 보완하는 프로그램 구조에 대한 또 다른 사고 방식을 제공합니다.
- OOP에서의 핵심 모듈화 단위는 클래스인 반면, AOP에서는 관점(Aspect)이 모듈화 단위입니다.
- 관점은 여러 타입과 객체에 걸쳐 있는 관심사(예: 트랜잭션 관리)의 모듈화를 가능하게 합니다.
- 이러한 관심사는 AOP 문헌에서 종종 "횡단 관심사(crosscutting concerns)"라고 불립니다.
- Spring의 핵심 구성 요소 중 하나는 AOP 프레임워크입니다.
- Spring IoC 컨테이너는 AOP에 의존하지 않지만(즉, 원하지 않으면 AOP를 사용할 필요가 없음), AOP는 Spring IoC를 보완하여 매우 강력한 미들웨어 솔루션을 제공합니다.

### 1.1 횡단 관심사(Crosscutting Concerns)

- 횡단 관심사는 여러 모듈에서 발생하는 관심사입니다.
	- 예를 들어서 로그 추적 로직, 트랜잭션 기능이 있습니다.
- 이러한 부가 기능은 단독으로 사용되지 않고, 핵심 기능과 함께 사용됩니다.
	- 예를 들어서 로그 추적 기능은 어떤 핵심 기능이 호출되었는지 로그를 남기기 위해 사용됩니다.
- 부가 기능은 이름 그대로 핵심 기능을 보조하기 위해 존재합니다.
- 보통 부가 기능은 여러 클래스에 걸쳐서 함께 사용됩니다.
- 예를 들어서 모든 애플리케이션 호출을 로깅 해야 하는 요구사항을 생각해봅시다.
	- 이러한 부가 기능은 횡단 관심사(cross-cutting concerns)가 됩니다.
	- 쉽게 이야기해서 하나의 부가 기능이 여러 곳에 동일하게 사용된다는 뜻입니다.
- 그런데 이런 부가 기능을 여러 곳에 적용하려면 너무 번거롭습니다.
	- 예를 들어서 부가 기능을 적용해야 하는 클래스가 100개면 100개 모두에 동일한 코드를 추가해야 합니다.
	- 부가 기능을 별도의 유틸리티 클래스로 만든다고 해도, 해당 유틸리티 클래스를 호출하는 코드가 결국 필요합니다.
	- 만약 부가 기능에 수정이 발생하면, 100개의 클래스 모두를 하나씩 찾아가면서 수정해야 합니다.
- 부가 기능처럼 특정 로직을 애플리케이션 전반에 적용하는 문제는 일반적인 OOP 방식으로는 해결이 어렵습니다.
	- 이러한 문제를 해결하기 위해 등장한 것이 AOP입니다.

## 2. AOP Concepts

- AOP 개념과 용어를 정의하는 것으로 시작하겠습니다. 이 용어들은 Spring에만 국한된 것이 아닙니다.
- 불행하게도, AOP 용어는 특별히 직관적이지 않습니다. 그러나 Spring이 자체 용어를 사용한다면 더욱 혼란스러울 것입니다.
- 따라서 자체 용어가 아닌 일반적인 용어를 사용하여 AOP를 설명하겠습니다.

### 2.1 Aspect

- 여러 클래스에 걸쳐 있는 관심사의 모듈화입니다.
- 트랜잭션 관리는 엔터프라이즈 Java 애플리케이션에서 횡단 관심사의 좋은 예입니다.
- Spring AOP에서 관점은 일반 클래스(스키마 기반 접근 방식) 또는 @Aspect 어노테이션이 달린 일반 클래스(@AspectJ 스타일)를 사용하여 구현됩니다.
	- 스프링 AOP를 사용할 때는 `@Aspect` 애노테이션을 주로 사용하는데, 이 애노테이션도 AspectJ가 제공하는 애노테이션입니다.
	- 스프링에서는 AspectJ가 제공하는 애노테이션이나 관련 인터페이스만 사용하는 것이고, 실제 AspectJ가 제공하는 컴파일, 로드타임 위버 등을 사용하는 것은 아닙니다.

### 2.2 Advisor

- 해당 용어는 스프링 AOP에서만 사용되는 특별한 용어입니다.
- Pointcut과 Advice의 결합입니다.
- 즉 어드바이스가 언제 실행되어야 하는지를 결정하는 포인트컷과 횡단 관심사에 대한 구체적인 동작을 나타내는 어드바이스를 결합합니다.

### 2.3 Joinpoint

- 어드바이스가 적용될 수 있는 위치를 의미합니다.
	- 메소드 실행, 생성자 호출, 필드 값 접근, static 메서드 접근 같은 프로그램 실행 중 지점입니다.
	- 조인 포인트는 추상적인 개념입니다. AOP를 적용할 수 있는 모든 지점이라 생각하면 됩니다.
- **Spring AOP에서 조인 포인트는 항상 메서드 실행을 나타냅니다.**
	- 즉 Spring AOP에서는 조인 포인트는 메서드와 같다고 생각할 수 있습니다.
- 일반적으로는 생성자, 필드 값 접근, static 메서드 접근, 메서드 실행을 포함합니다.
	- AspectJ를 사용해서 컴파일 시점과 클래스 로딩 시점에 적용하는 AOP는 바이트코드를 실제 조작하기 때문에 해당 기능을 모든 지점에 다 적용할 수 있습니다.

### 2.4 Advice

- 특정 조인 포인트에서 관점이 취하는 행동입니다. 쉽게 말해 부가 로직입니다.
	- 예를들어, 트랜잭션 관리, 로깅, 보안, 캐싱 등이 있습니다.
- 어드바이스의 다양한 유형에는 "around", "before", "after" 어드바이스가 있습니다.
- Spring을 포함한 많은 AOP 프레임워크는 어드바이스를 인터셉터로 모델링하고 조인 포인트 주변에 인터셉터 체인을 유지합니다.

### 2.5 Pointcut

- 조인 포인트와 일치하는 조건식입니다.
	- 조인 포인트 중에서 어드바이스가 적용될 위치를 선별하는 기능을 합니다.
	- 즉 Pointcut은 Advice가 적용될 Joinpoint를 결정합니다.
- 어드바이스는 포인트컷 표현식과 연결되어 해당 포인트컷과 일치하는 모든 조인 포인트에서 실행됩니다(예: 특정 이름을 가진 메서드의 실행).
- 포인트컷 표현식과 일치하는 조인 포인트의 개념은 AOP의 핵심이며, Spring은 기본적으로 AspectJ 포인트컷 표현식 언어를 사용합니다.

### 2.6 Introduction

- 타입을 대신하여 추가 메서드나 필드를 선언하는 것입니다.
- Spring AOP를 사용하면 어떤 어드바이스된 객체에도 새로운 인터페이스(및 해당 구현)를 도입할 수 있습니다.
- 예를 들어, 캐싱을 단순화하기 위해 인트로덕션을 사용하여 빈이 IsModified 인터페이스를 구현하도록 할 수 있습니다. (인트로덕션은 AspectJ 커뮤니티에서 inter-type 선언으로 알려져 있습니다.)

### 2.7 Target object

- 하나 이상의 관점에 의해 어드바이스되는 객체입니다.
- "어드바이스된 객체"라고도 합니다. Spring AOP는 런타임 프록시를 사용하여 구현되므로 이 객체는 항상 프록시된 객체입니다.
- 프록시에 대해서 더 알고 싶다면 아래 글을 읽어보세요.
	- [Proxy 참고](../../Design-Pattern/Proxy/Proxy.md)

### 2.8 AOP proxy

- 관점 계약(어드바이스 메서드 실행 등)을 구현하기 위해 AOP 프레임워크에 의해 생성된 객체입니다.
- Spring 프레임워크에서 AOP 프록시는 JDK 동적 프록시 또는 CGLIB 프록시입니다.
	- JDK 동적 프록시와 CGLIB 프록시에 대해 더 알고 싶다면 아래 글을 읽어보세요.
	- [Proxy 참고](../../Design-Pattern/Proxy/Proxy.md)

### 2.9 Weaving

- 관점을 다른 애플리케이션 타입이나 객체와 연결하여 어드바이스된 객체를 만드는 과정입니다.
- 이는 컴파일 시간(예: AspectJ 컴파일러 사용), 클래스 로딩 시점, 런타임에 수행될 수 있습니다.
- 컴파일 시점
	- AspectJ 컴파일러를 사용하여 `.java` 소스 코드를 `.class` 파일로 컴파일할 때 부가 기능 로직을 추가할 수 있습니다.
	- 이해하기 쉽게 풀어서 이야기하면 부가 기능 코드가 핵심 기능이 있는 컴파일된 코드 주변에 실제로 붙어 버린다고 생각하면 됩니다.
	- 컴파일 시점에 부가 기능을 적용하려면 특별한 컴파일러도 필요하고 복잡한 설정도 필요합니다.
- 클래스 로딩 시점
	- 클래스 로더를 사용하여 클래스를 로딩할 때 부가 기능을 적용합니다.
	- `.class` 를 JVM에 저장하기 전에 조작할 수 있는 기능을 사용합니다.(java Instrumentation)
	- 참고로 수 많은 모니터링 툴들이 이 방식을 사용합니다.
	- 이 시점에 애스펙트를 적용하는 것을 로드 타임 위빙이라 합니다.
	- 로드 타임 위빙은 자바를 실행할 때 특별한 옵션(`java -javaagent`)을 통해 클래스 로더 조작기를 지정해야 합니다.
- 런타임 시점
	- 런타임에 부가 기능을 적용합니다.
	- Spring AOP는 다른 순수 Java AOP 프레임워크와 마찬가지로 런타임에 위빙을 수행합니다.
	- 런타임에 부가 기능을 적용하려면 프록시 객체를 만들어야 합니다.
	- 해당 과정에 대해 알고싶다면 아래 글을 읽어보세요.
	- [BeanPostProcessor 참고](../BeanPostProcessor/BeanPostProcessor.md)

## 3 AOP Advice

- Spring AOP는 다음과 같은 유형의 어드바이스를 제공합니다.
	- Before 어드바이스: 조인 포인트 전에 실행되지만 조인 포인트로의 실행 흐름을 방지할 수 없는 어드바이스입니다(예외를 던지지 않는 한).
	- After returning 어드바이스: 조인 포인트가 정상적으로 완료된 후 실행될 어드바이스입니다(예: 메서드가 예외를 던지지 않고 반환하는 경우).
	- After throwing 어드바이스: 메서드가 예외를 던져 종료되는 경우 실행될 어드바이스입니다.
	- After (finally) 어드바이스: 조인 포인트가 종료되는 방식(정상 또는 예외적 반환)에 관계없이 실행될 어드바이스입니다.
	- Around 어드바이스
	- 메서드 호출과 같은 조인 포인트를 둘러싸는 어드바이스입니다.
	- 이는 가장 강력한 종류의 어드바이스입니다.
	- Around 어드바이스는 메서드 호출 전후에 사용자 정의 동작을 수행할 수 있습니다.
	- 또한 조인 포인트로 진행할지 또는 자체 반환 값을 반환하거나 예외를 던져 어드바이스된 메서드 실행을 우회할지 선택할 책임이 있습니다.

### 3.1 Before Advice

- @Before 어노테이션을 사용하여 애스펙트에서 before 어드바이스를 선언할 수 있습니다.
- `@Around` 와 다르게 작업 흐름을 변경할 수는 없습니다.
  - @Before는 메서드 종료 시 자동으로 target이 호출됩니다.
  - 예외가 발생하면 다음 코드가 호출되지는 않습니다.

### 3.2 After Returning Advice

- After returning 어드바이스는 일치하는 메서드 실행이 정상적으로 반환될 때 실행됩니다.
- @AfterReturning 어노테이션을 사용하여 선언할 수 있습니다.
- `@Around` 와 다르게 반환되는 객체를 변경할 수는 없습니다.
  - 반환 객체를 변경하려면 `@Around` 를 사용해야 합니다.
  - 참고로 반환 객체를 조작할 수 는 있습니다.

```java
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.AfterReturning;

@Aspect
public class AfterReturningExample {

    @AfterReturning(
        pointcut="execution(* com.xyz.dao.*.*(..))",
        returning="retVal")
    public void doAccessCheck(Object retVal) {
        // ...
    }
}
```

- 어드바이스 본문에서 실제로 반환된 값에 접근해야 할 필요가 있습니다.
- returning 속성에 사용된 이름은 어드바이스 메서드의 파라미터 이름과 일치해야 합니다.
- 서드 실행이 반환될 때, 반환 값은 해당 인자 값으로 어드바이스 메서드에 전달됩니다.
- returning 절은 또한 지정된 타입의 값을 반환하는 메서드 실행만 일치하도록 제한합니다

### 3.3 After Throwing Advice

- After throwing 어드바이스는 일치하는 메서드 실행이 예외를 던지며 종료될 때 실행됩니다.

```java
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.AfterThrowing;

@Aspect
public class AfterThrowingExample {

    @AfterThrowing("execution(* com.xyz.dao.*.*(..))")
    public void doRecoveryActions() {
        // ...
    }
}
```

- 위 예시와 같이 @AfterThrowing 어노테이션을 사용하여 선언할 수 있습니다:

```java
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.AfterThrowing;

@Aspect
public class AfterThrowingExample {

    @AfterThrowing(
        pointcut="execution(* com.xyz.dao.*.*(..))",
        throwing="ex")
    public void doRecoveryActions(DataAccessException ex) {
        // ...
    }
}
```

- 종종 주어진 타입의 예외가 던져질 때만 어드바이스가 실행되기를 원하며, 또한 어드바이스 본문에서 던져진 예외에 접근할 필요가 있습니다.
- 일치를 제한하고(원하는 경우 - 그렇지 않으면 예외 타입으로 Throwable 사용) 던져진 예외를 어드바이스 파라미터에 바인딩하는 데 throwing 속성을 사용할 수 있습니다.
- throwing 속성에 사용된 이름은 어드바이스 메서드의 파라미터 이름과 일치해야 합니다.
- 메서드 실행이 예외를 던지며 종료될 때, 예외는 해당 인자 값으로 어드바이스 메서드에 전달됩니다.
- throwing 절은 또한 지정된 타입의 예외를 던지는 메서드 실행만 일치하도록 제한합니다(이 경우 DataAccessException).

### 3.4 After (Finally) Advice

- AspectJ에서의 @After 어드바이스는 try-catch 문의 finally 블록과 유사하게 "after finally advice"로 정의됩니다.
- 조인 포인트(사용자 선언 대상 메서드)에서 정상 반환 또는 예외 발생 등 모든 결과에 대해 호출되며, 성공적인 정상 반환에만 적용되는 @AfterReturning과 대조됩니다.
- 일반적으로 리소스를 해제하는 데 사용됩니다.

### 3.5 Around Advice

- 메서드 호출과 같은 조인 포인트를 둘러싸는 어드바이스입니다. 이는 가장 강력한 종류의 어드바이스입니다.
- Around 어드바이스는 메서드 호출 전후에 사용자 정의 동작을 수행할 수 있습니다.
- 또한 조인 포인트로 진행할지 또는 자체 반환 값을 반환하거나 예외를 던져 어드바이스된 메서드 실행을 우회할지 선택할 책임이 있습니다.
- 메서드 실행 전후에 작업을 수행하고 메서드가 언제, 어떻게, 심지어 실행될지 여부까지 결정할 기회가 있습니다.
- . Around 어드바이스는 스레드 안전한 방식으로 메서드 실행 전후에 상태를 공유해야 하는 경우에 자주 사용됩니다
	- 예를 들어, 타이머를 시작하고 중지하는 경우 사용합니다.
- Around 어드바이스는 @Around 어노테이션으로 메서드에 어노테이션을 지정하여 선언됩니다.
- 메서드는 반환 타입으로 Object를 선언해야 하며, 메서드의 첫 번째 파라미터는 ProceedingJoinPoint 타입이어야 합니다.
- 어드바이스 메서드 본문 내에서, 기본 메서드가 실행되도록 ProceedingJoinPoint에서 proceed()를 호출해야 합니다.
- 인자 없이 proceed()를 호출하면 호출자의 원래 인자가 호출될 때 기본 메서드에 제공됩니다.
- 고급 사용 사례의 경우, 인자 배열(Object[])을 받아들이는 proceed() 메서드의 오버로드된 변형이 있습니다.
- 배열의 값은 호출될 때 기본 메서드에 대한 인자로 사용됩니다.
- around 어드바이스에 의해 반환된 값은 메서드 호출자가 보는 반환 값입니다.
	- 예를 들어, 간단한 캐싱 애스펙트는 캐시에서 값을 가지고 있으면 캐시에서 값을 반환하거나, 그렇지 않으면 proceed()를 호출(그리고 그 값을 반환)할 수 있습니다.
	- proceed는 around 어드바이스 본문 내에서 한 번, 여러 번 또는 전혀 호출되지 않을 수 있습니다.
- around 어드바이스 메서드의 반환 타입을 void로 선언하면, 호출자에게 항상 null이 반환되어 실질적으로 proceed() 호출 결과를 무시합니다.
	- 따라서 around 어드바이스 메서드는 Object 반환 타입을 선언하는 것이 권장됩니다

### 3.6 타입 선택 가이드

- Around 어드바이스는 가장 일반적인 유형의 어드바이스입니다.
- Spring AOP는 AspectJ와 같이 다양한 어드바이스 유형을 제공하므로, 필요한 동작을 구현할 수 있는 가장 간단한 어드바이스 유형을 사용하는 것이 좋습니다.
	- 예를 들어, before 어드바이스로 충분한 경우 around 어드바이스를 사용하지 마세요.
	- 예를 들어, 메서드의 반환 값으로 캐시만 업데이트하면 되는 경우, Around 어드바이스가 동일한 작업을 수행할 수 있지만 After returning 어드바이스를 구현하는 것이 더 좋습니다.
- 가장 특정한 어드바이스 유형을 사용하면 오류 가능성이 적은 더 간단한 프로그래밍 모델을 제공합니다.
- 예를 들어, Around 어드바이스에 사용되는 JoinPoint의 proceed() 메서드를 호출할 필요가 없으므로 이를 호출하지 못하는 실수를 할 수 없습니다.

### 3.7 현재 JoinPoint에 접근

- 모든 어드바이스 메서드는 첫 번째 파라미터로 org.aspectj.lang.JoinPoint 타입의 파라미터를 선언할 수 있습니다.
  - 생략도 가능합니다.
- 하지만 around 어드바이스는 JoinPoint의 하위 클래스인 ProceedingJoinPoint 타입의 첫 번째 파라미터를 선언해야 한다는 점에 유의하세요.
- JoinPoint 인터페이스는 여러 유용한 메서드를 제공합니다:
  - `getArgs()` : 메서드 인수를 반환합니다.
  - `getThis()` : 프록시 객체를 반환합니다.
  - `getTarget()` : 대상 객체를 반환합니다.
  - `getSignature()` : 조언되는 메서드에 대한 설명을 반환합니다.
  - `toString()` : 조언되는 방법에 대한 유용한 설명을 인쇄합니다.

#### ProceedingJoinPoint

- ProceedingJoinPoint는 JoinPoint의 하위 인터페이스입니다.
- ProceedingJoinPoint 인터페이스는 proceed() 메서드를 추가로 제공합니다.
- proceed() 메서드는 다음 어드바이스나 타켓을 호출합니다.

### 3.8 Advice 순서 지정

- 여러 개의 advice가 모두 같은 조인 포인트에서 실행되고자 할 때 어떻게 될까요?
- Spring AOP는 AspectJ와 동일한 우선순위 규칙을 따라 advice 실행 순서를 결정합니다.
- 서로 다른 aspect에 정의된 두 개의 advice가 모두 동일한 조인 포인트에서 실행되어야 하는 경우, 별도로 지정하지 않는 한 실행 순서는 정의되지 않습니다.
- 우선순위를 지정하여 실행 순서를 제어할 수 있습니다.
- 이는 aspect 클래스에서 org.springframework.core.Ordered 인터페이스를 구현하거나 @Order 어노테이션으로 어노테이션을 달아 일반적인 Spring 방식으로 수행됩니다.
  - @Order는 클래스에 적용할 수 있으며, Ordered 인터페이스를 구현하는 것과 동일한 효과를 제공합니다. 즉 Aspect 클래스에 적용할 수 있습니다.
  - 같은 클래스의 여러 Advice에 대해 순서는 지정할 수 없습니다.
  - 이런 경우 두개의 Aspect 클래스로 분리하고, 각각에 @Order를 적용하여 순서를 지정할 수 있습니다.
- 두 개의 aspect가 주어진 경우, Ordered.getOrder()(또는 어노테이션 값)에서 더 낮은 값을 반환하는 aspect가 더 높은 우선순위를 갖습니다.

## 4. AspectJ와의 관계

- Spring AOP는 100% 완벽한 AOP 솔루션을 제공하는 것이 아니라, Spring의 다른 기능들과 잘 통합되어 일반적인 기업용 Java 애플리케이션의 문제(트랜잭션 관리, 보안, 로깅 등)를 해결하는 데
  초점을 맞추고 있습니다.
- 더 강력하고 세밀한 AOP가 필요하면 AspectJ를 사용할 수 있고, Spring은 이와의 통합도 지원합니다.

### 4.1 Spring AOP의 현재 지원 범위

- Spring AOP는 현재 메서드 실행 조인 포인트(Spring 빈의 메서드 실행에 대한 어드바이스)만 지원합니다.
- 필드 접근 및 업데이트 조인 포인트에 대한 어드바이스가 필요하다면 AspectJ와 같은 언어를 고려해보세요.
- 하지만 실무에서는 대부분의 경우 메서드 실행 조인 포인트만으로 충분합니다. 즉 Spring AOP가 제공하는 기능만으로 충분합니다.

### 4.2 Spring AOP의 접근 방식

- Spring AOP의 접근 방식은 대부분의 다른 AOP 프레임워크와 다릅니다.
- 목표는 가장 완벽한 AOP 구현을 제공하는 것이 아닙니다
- 오히려 목표는 AOP 구현과 Spring IoC 간의 긴밀한 통합을 제공하여 엔터프라이즈 애플리케이션의 일반적인 문제를 해결하는 데 도움을 주는 것입니다.
- Spring 프레임워크의 AOP 기능은 일반적으로 Spring IoC 컨테이너와 함께 사용됩니다.
- 이는 다른 AOP 구현과의 중요한 차이점입니다.
- 매우 세분화된 객체(일반적으로 도메인 객체)에 대한 어드바이스와 같은 일부 작업은 AspectJ가 최선의 선택입니다.
- 그러나 경험에 따르면 Spring AOP는 AOP에 적합한 엔터프라이즈 Java 애플리케이션의 대부분의 문제에 탁월한 솔루션을 제공합니다.

### 4.3 AspectJ와의 관계

- 스프링은 AspectJ의 문법을 차용하고 프록시 방식의 AOP를 적용합니다. AspectJ를 직접 사용하는 것이 아닙니다.
	- 스프링 AOP를 사용할 때는 `@Aspect` 애노테이션을 주로 사용하는데, 이 애노테이션도 AspectJ가 제공하는 애노테이션입니다.
	- 스프링에서는 AspectJ가 제공하는 애노테이션이나 관련 인터페이스만 사용합니다.
	- 실제 AspectJ가 제공하는 컴파일, 로드타임 위버 등을 사용하는 것은 아닙니다.
- Spring AOP는 포괄적인 AOP 솔루션을 제공하기 위해 AspectJ와 경쟁하려고 하지 않습니다.
- Spring AOP와 같은 프록시 기반 프레임워크와 AspectJ와 같은 완전한 프레임워크 모두 가치가 있으며, 경쟁이 아닌 상호 보완적입니다.
- Spring은 일관된 Spring 기반 애플리케이션 아키텍처 내에서 AOP의 모든 사용을 가능하게 하기 위해 Spring AOP와 IoC를 AspectJ와 원활하게 통합합니다.

## 5. AOP 프록시

- Spring AOP는 AOP 프록시로 표준 JDK 동적 프록시를 기본적으로 사용합니다.
	- 이는 모든 인터페이스(또는 인터페이스 집합)가 프록시될 수 있게 합니다.
- Spring AOP는 CGLIB 프록시도 사용할 수 있습니다.
	- 이는 인터페이스가 아닌 클래스를 프록시하는 데 필요합니다.
	- 기본적으로 비즈니스 객체가 인터페이스를 구현하지 않으면 CGLIB가 사용됩니다.
- 클래스보다는 인터페이스를 기반으로 프로그래밍하는 것이 좋은 관행이므로, 비즈니스 클래스는 일반적으로 하나 이상의 비즈니스 인터페이스를 구현합니다.
- 인터페이스에 선언되지 않은 메서드에 어드바이스가 필요하거나 구체적인 타입으로 프록시된 객체를 메서드에 전달해야 하는 경우에는 CGLIB 사용을 강제할 수 있습니다.

:::info
스프링 부트 2.0 버전부터 CGLIB를 기본으로 사용하도록 변경되었습니다. 따라서 인터페이스가 있어도 JDK 동적 프록시가 아닌 CGLIB 프록시가 사용됩니다. 원한다면 JDK 동적 프록시를 사용하도록 설정할 수 있습니다. 
:::

### 5.1 Spring AOP의 동작 방식

- Spring AOP는 '프록시 기반'입니다.
- 즉, 원본 객체 대신 프록시 객체가 사용되어 메서드 호출을 가로채고 추가 동작(어드바이스)을 수행합니다.
	- 이 방식은 AspectJ와 같은 바이트코드 변환 방식과는 다르게 작동합니다.
	- 프록시로 등록되는 과정을 알고 싶다면 아래 글을 읽어보세요.
	- [BeanPostProcessor 참고](../BeanPostProcessor/BeanPostProcessor.md)
- Spring AOP의 프록시 기반 특성은 일부 제한사항을 가지고 있으며, 이를 이해하는 것이 Spring AOP를 효과적으로 사용하는 데 중요합니다.
- 예를 들어, 같은 클래스 내의 메서드 호출은 프록시를 거치지 않기 때문에 AOP가 적용되지 않는 등의 특성이 있습니다.

## 6. Aspect 선언하기

- @AspectJ 애스펙트(즉, @Aspect 애노테이션이 있는) 클래스로 정의된 애플리케이션 컨텍스트의 모든 빈은 Spring에 의해 자동으로 감지되고 Spring AOP를 구성하는 데 사용됩니다.
	- 이를 위해 @AspectJ 지원을 활성화 해야 합니다. Spring Boot의 경우 'spring-boot-starter-aop' 의존성을 추가하면 자동으로 활성화됩니다.
- 애스펙트 클래스는 @Configuration 클래스의 @Bean 메서드를 통해 등록하거나, 다른 Spring 관리 빈과 마찬가지로 클래스패스 스캐닝을 통해 Spring이 자동 감지하도록 할 수 있습니다.
- 그러나 @Aspect 애노테이션만으로는 클래스패스에서 자동 감지하기에 충분하지 않다는 점에 유의하세요.
	- 이를 위해 별도의 @Component 애노테이션을 추가해야 합니다.

```java
@Aspect
@Component
public class NotVeryUsefulAspect {
}
```

- 다른 클래스와 마찬가지로 메서드와 필드를 가질 수 있습니다.
- 또한 포인트컷, 어드바이스 및 인트로덕션(inter-type) 선언을 포함할 수 있습니다.

## 7. Pointcut 선언하기

- 포인트컷은 관심 조인 포인트를 결정하여 어드바이스가 실행되는 시점을 제어합니다.
- Spring AOP는 Spring 빈에 대한 메서드 실행 조인 포인트만 지원하므로, 포인트컷을 Spring 빈의 메서드 실행과 매칭하는 것으로 생각할 수 있습니다.
- `@Around` 에 포인트컷 표현식을 직접 넣을 수 도 있지만, `@Pointcut` 애노테이션을 사용해서 별도로 분리할 수 있습니다.
	- 이렇게 분리하면 하나의 포인트컷 표현식을 여러 어드바이스에서 함께 사용할 수 있습니다.

### 7.1 포인트컷 구조

- 포인트컷 선언은 두 부분으로 구성됩니다
	- 이름과 매개변수로 구성된 시그니처
	- 관심 있는 메서드 실행을 정확히 결정하는 포인트컷 표현식

```java
@Pointcut("execution(* transfer(..))") // 포인트컷 표현식
private void anyOldTransfer() {} // 포인트컷 시그니처
```

- @AspectJ 스타일의 AOP에서 포인트컷 시그니처는 일반 메서드 정의로 제공되며, 포인트컷 표현식은 @Pointcut 애노테이션을 사용하여 표시됩니다.
- 포인트컷 시그니처 역할을 하는 메서드는 반환 타입이 void여야 합니다.
- 이 예시는 'transfer'라는 이름의 모든 메서드 실행과 일치하는 'anyOldTransfer'라는 포인트컷을 정의합니다.

### 7.2 지원되는 포인트컷 지정자(PCD)

- Spring AOP는 다음 AspectJ pointcut 지정자를 지원합니다:
	- execution: 메소드 실행 조인 포인트 매칭 (Spring AOP에서 가장 기본적인 지정자)
	- within: 특정 타입 내의 조인 포인트로 제한
	- this: 빈 참조(Spring AOP 프록시)가 주어진 타입의 인스턴스인 경우로 제한
	- target: 대상 객체(프록시된 애플리케이션 객체)가 주어진 타입의 인스턴스인 경우로 제한
	- args: 인자가 주어진 타입의 인스턴스인 경우로 제한
	- @target: 실행 객체의 클래스가 주어진 타입의 어노테이션을 가진 경우로 제한
	- @args: 실제 전달된 인자의 런타임 타입이 주어진 타입의 어노테이션을 가진 경우로 제한
	- @within: 주어진 어노테이션을 가진 타입 내의 조인 포인트로 제한
	- @annotation: 조인 포인트의 주체(Spring AOP에서 실행 중인 메소드)가 주어진 어노테이션을 가진 경우로 제한
	- bean: 특정 이름의 Spring 빈으로 조인 포인트 매칭 제한 (Spring AOP 전용)

### 7.3 Spring AOP의 Pointcut 표현식 예제

#### execution 지정자 예제

- `execution(public * *(..))`: 모든 public 메소드 실행 시 적용
- `execution(* set*(..))`: "set"으로 시작하는 모든 메소드 실행 시 적용
- `execution(* com.xyz.service.AccountService.*(..))`: AccountService 인터페이스에 정의된 모든 메소드 실행 시 적용
- `execution(* com.xyz.service.*.*(..))`: service 패키지에 정의된 모든 메소드 실행 시 적용
- `execution(* com.xyz.service..*.*(..))`: service 패키지와 모든 하위 패키지에 정의된 메소드 실행 시 적용

#### within 지정자 예제

- `within(com.xyz.service.*)`: service 패키지 내 클래스의 모든 메소드 실행 시 적용
- `within(com.xyz.service..*)`: service 패키지와 모든 하위 패키지 내 클래스의 메소드 실행 시 적용

#### this & target 지정자 예제

- `this(com.xyz.service.AccountService)`: 프록시 객체가 AccountService 인터페이스를 구현한 경우의 메소드 실행 시 적용
- `target(com.xyz.service.AccountService)`: 대상 객체(원본 객체)가 AccountService 인터페이스를 구현한 경우의 메소드 실행 시 적용

#### args 지정자 예제

- `args(java.io.Serializable)`: 런타임에 전달된 인자가 Serializable 타입인 메소드 실행 시 적용
	- 주의: `execution(* *(java.io.Serializable))`과 다름. args는 런타임 타입을 체크하고, execution은 메소드 시그니처를 체크함

#### 어노테이션 관련 지정자 예제

- `@target(org.springframework.transaction.annotation.Transactional)`
	- 대상 객체의 클래스에 @Transactional 어노테이션이 적용된 경우의 메소드 실행 시 적용
	- 런타임 객체 타입에 적용된 어노테이션을 검사합니다
	- 실제 구현 클래스에 직접 붙어있는 어노테이션을 확인합니다
- `@within(org.springframework.transaction.annotation.Transactional)`
	- 대상 객체의 선언된 타입에 @Transactional 어노테이션이 적용된 경우의 메소드 실행 시 적용
	- 선언 타입에 적용된 어노테이션을 검사합니다
	- 클래스나 인터페이스의 정적 선언에 붙어있는 어노테이션을 확인합니다
- `@annotation(org.springframework.transaction.annotation.Transactional)`: 실행 중인 메소드 자체에 @Transactional 어노테이션이 적용된 경우 적용
- `@args(com.xyz.security.Classified)`: 메소드가 단일 파라미터를 가지며, 그 파라미터의 런타임 타입에 @Classified 어노테이션이 적용된 경우 적용
- @within은 클래스/인터페이스 선언 시점의 어노테이션을 체크하고, @target은 런타임에 실제 객체 타입의 어노테이션을 체크합니다.

#### bean 지정자 예제

- `bean(tradeService)`: "tradeService"라는 이름의 Spring 빈에 대한 메소드 실행 시 적용
- `bean(*Service)`: 이름이 "Service"로 끝나는 모든 Spring 빈에 대한 메소드 실행 시 적용 (예: userService, accountService)

### 7.4 표현식 결합

- pointcut 표현식은 &&, ||, ! 연산자를 사용하여 결합할 수 있습니다.
- 또한 이름으로 pointcut 표현식을 참조할 수 있습니다.

```java
@Pointcut("execution(public * *(..))")
public void publicMethod() {}

@Pointcut("within(com.xyz.trading..*)")
public void inTrading() {}

@Pointcut("publicMethod() && inTrading()")
public void tradingOperation() {}
```

- 위 예시는 public 메서드와 com.xyz.trading 패키지 내의 메서드 실행을 모두 포함하는 tradingOperation 포인트컷을 정의합니다.
- `publicMethod()`와 같이 포인트컷 이름을 사용하여 다른 포인트컷을 참조할 수 있습니다.
- 이러한 포인트컷을 사용하면 여러 어드바이스에서 동일한 포인트컷을 참조할 수 있으므로 중복을 피할 수 있습니다.

```java
public class CommonPointcuts {
    @Pointcut("within(com.xyz.web..*)")
    public void inWebLayer() {}
    
    @Pointcut("within(com.xyz.service..*)")
    public void inServiceLayer() {}
    
    // 기타 pointcut 정의들...
}
```

- 대규모 애플리케이션에서는 자주 사용되는 명명된 pointcut 표현식을 캡슐화하는 전용 클래스를 정의하는 것이 좋습니다.
- 이런 클래스는 일반적으로 CommonPointcuts와 같은 형태를 가집니다.

### 7.5 좋은 Pointcut 작성법

- 효과적인 pointcut은 다음 세 가지 그룹의 지정자를 포함해야 합니다:
	- 종류(Kinded) 지정자: 특정 종류의 조인 포인트 선택 (execution, get, set, call, handler)
	- 범위(Scoping) 지정자: 관심 있는 조인 포인트 그룹 선택 (within, withincode)
	- 컨텍스트(Contextual) 지정자: 컨텍스트 기반 매칭 (this, target, @annotation)
- 잘 작성된 pointcut은 적어도 처음 두 유형(종류와 범위)을 포함해야 합니다.
- 컨텍스트 지정자는 조인 포인트 컨텍스트를 기반으로 매칭하거나 어드바이스에서 사용하기 위해 해당 컨텍스트를 바인딩하는 데 포함할 수 있습니다.
- 특히 범위 지정자는 매칭 속도가 매우 빠르므로, 가능하면 항상 이를 포함하는 것이 좋습니다.

## 8. 실제 사용 예제

- 이제 Spring AOP의 주요 개념을 살펴보았으므로, 실제로 어떻게 사용하는지 살펴보겠습니다.
- 커스텀한 `@Retry` 애노테이션으로 메서드에 재시도 로직을 적용하는 예제를 살펴보겠습니다.

### 8.1 @Retry 애노테이션 정의

```java
package hello.aop.exam.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Retry {
    int value() default 3;
}
```

- `@Retry` 애노테이션은 메서드에 적용할 수 있으며, 기본적으로 최대 3번 재시도합니다.

### 8.2 RetryAspect 구현

```java
package hello.aop.exam.aop;

import hello.aop.exam.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;

@Slf4j
@Aspect
public class RetryAspect {

    @Around("@annotation(retry)")
    public Object doRetry(ProceedingJoinPoint joinPoint, Retry retry) throws Throwable {
        log.info("[retry] {} retry={}", joinPoint.getSignature(), retry);
        int maxRetry = retry.value();
        Exception exceptionHolder = null;
        for (int retryCount = 1; retryCount <= maxRetry; retryCount++) {
            try {
                log.info("[retry] try count={}/{}", retryCount, maxRetry);
                return joinPoint.proceed();
            } catch (Exception e) {
                exceptionHolder = e;
            }
        }
        throw exceptionHolder;
    }
}
```

- `@Retry` 애노테이션이 적용된 메서드에 대해 재시도 로직을 적용하는 `RetryAspect`를 구현합니다.
- @annontaion을 사용하여 `@Retry` 애노테이션이 적용된 메서드에 대해 어드바이스를 적용합니다.
- `@Retry` 애노테이션의 value를 통해 재시도 횟수를 지정할 수 있습니다.
- 재시도 중 예외가 발생하면 해당 예외를 저장하고, 최대 재시도 횟수를 초과하면 해당 예외를 다시 던집니다.

### 8.3 사용

```java
package hello.aop.exam;
import hello.aop.exam.annotation.Retry;
import hello.aop.exam.annotation.Trace;
import org.springframework.stereotype.Repository;

@Repository
public class ExamRepository {
	
	@Retry(value = 4)
	public String save(String itemId) {
		//...
	}
}
```

- `@Retry` 애노테이션을 사용하여 `ExamRepository`의 `save` 메서드에 재시도 로직을 적용합니다.
- `@Retry` 애노테이션의 value를 통해 재시도 횟수를 지정할 수 있습니다.
- 위 예시는 최대 4번 재시도합니다.

## 9. Spring AOP의 제한사항

- Spring AOP는 프록시 기반의 AOP 구현이므로, 일부 제한사항이 있습니다.

### 9.1 프록시와 내부 호출 문제

- Spring AOP는 런타임에 프록시 객체를 생성하여 AOP를 적용합니다.
- 따라서 AOP를 적용하려면 항상 프록시를 통해서 대상 객체(Target)을 호출해야 합니다.
- 만약 프록시를 거치지 않고 대상 객체를 직접 호출하게 되면 AOP가 적용되지 않고, 어드바이스도 호출되지 않습니다.
  - 대상 객체의 내부에서 메서드 호출이 발생하면 프록시를 거치지 않고 대상 객체를 직접 호출하는 문제가 발생합니다.
  - 즉 `public` 메서드에서 `public` 메서드를 내부 호출하는 경우에는 문제가 발생합니다. 이 경우 인터널 메서드에는 AOP가 적용되지 않습니다.
- 실제 코드에 AOP를 직접 적용하는 AspectJ를 사용하면 이런 문제가 발생하지 않습니다.
  - 하지만 내부 호출 문제를 해결하기 위해 AspectJ를 사용하는 것은 권장되지 않습니다.
  - 지금부터 내부 호출 문제를 해결하는 방법을 살펴보겠습니다.

#### 대안1: 자기 자신 주입

- 내부 호출을 해결하는 가장 간단한 방법은 자기 자신을 의존관계 주입 받는 것입니다.
-  생성자 주입은 순환 사이클을 만들기 때문에 실패합니다.
- 반면에 수정자 주입은 스프링이 생성된 이후에 주입할 수 있기 때문에 오류가 발생하지 않습니다.
- 따라서 세터를 통해 자신을 주입받아야 합니다.
  - 여기서 주입 받는 대상은 프록시 객체입니다.

#### 대안2: 구조 변경

- 앞선 방법들은 자기 자신을 주입하는 조금 어색한 방법입니다.
- 가장 나은 대안은 내부 호출이 발생하지 않도록 구조를 변경하는 것입니다.
- 내부호출 로직을 별도 클래스로 분리하고, 해당 클래스를 주입받아 사용하는 방법이 있습니다.
- 이렇게 하면 내부 호출이 발생하지 않으므로 AOP가 적용됩니다.
- `private` 메서드처럼 작은 단위에는 AOP를 적용하지 않습니다.
  - 따라서 AOP 적용을 위해 `private` 메서드를 외부 클래스로 변경하고 `public`으로 변경하는 일은 거의 없습니다.

### 9.2 JDK 동적 프록시의 한계

- 인터페이스 기반으로 프록시를 생성하는 JDK 동적 프록시는 구체 클래스로 타입 캐스팅이 불가능한 한계가 있습니다.

```java
package hello.aop.proxyvs;

import hello.aop.member.MemberService;
import hello.aop.member.MemberServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.aop.framework.ProxyFactory;

import static org.junit.jupiter.api.Assertions.assertThrows;

@Slf4j
public class ProxyCastingTest {
    @Test
    void jdkProxy() {
        MemberServiceImpl target = new MemberServiceImpl();
        ProxyFactory proxyFactory = new ProxyFactory(target);
        proxyFactory.setProxyTargetClass(false); // JDK 동적 프록시

        // 프록시를 인터페이스로 캐스팅 성공
        MemberService memberServiceProxy = (MemberService) proxyFactory.getProxy();
        log.info("proxy class={}", memberServiceProxy.getClass());

        // JDK 동적 프록시를 구현 클래스로 캐스팅 시도 실패, ClassCastException 예외 발생
        assertThrows(ClassCastException.class, () -> {
            MemberServiceImpl castingMemberService = (MemberServiceImpl) memberServiceProxy;
        });
    }
}
```

- 위 예시는 JDK 동적 프록시를 구현 클래스로 캐스팅하려고 시도하면 `ClassCastException` 예외가 발생합니다.
- JDK Proxy는 `MemberService`인터페이스를 기반으로 생성된 프록시입니다.
- 따라서 JDK Proxy는 `MemberService`로 캐스팅은 가능하지만`MemberServiceImpl` 이 어떤 것인지 전혀 알지 못합니다.
- 따라서 `MemberServiceImpl` 타입으로는 캐스팅이 불가능합니다.

```java
@Test
void cglibProxy() {
    MemberServiceImpl target = new MemberServiceImpl();
    ProxyFactory proxyFactory = new ProxyFactory(target);
    proxyFactory.setProxyTargetClass(true); // CGLIB 프록시
    
    // 프록시를 인터페이스로 캐스팅 성공
    MemberService memberServiceProxy = (MemberService) proxyFactory.getProxy();
    log.info("proxy class={}", memberServiceProxy.getClass());
    
    // CGLIB 프록시를 구현 클래스로 캐스팅 시도 성공
    MemberServiceImpl castingMemberService = (MemberServiceImpl) memberServiceProxy;
}
```

- 반면에 CGLIB 프록시는 구체 클래스로 타입 캐스팅이 가능합니다.
- CGLIB는 `MemberServiceImpl` 구체 클래스를 기반으로 프록시를 생성하기 때문에 구체 클래스로 캐스팅이 가능합니다.
- 요약
  - JDK 동적 프록시는 대상 객체인 `MemberServiceImpl`로 캐스팅 할 수 없다.
  - CGLIB 프록시는 대상 객체인 `MemberServiceImpl`로 캐스팅 할 수 있다.

```java
package hello.aop.proxyvs;

import hello.aop.member.MemberService;
import hello.aop.member.MemberServiceImpl;
import hello.aop.proxyvs.code.ProxyDIAspect;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@Slf4j
@SpringBootTest(properties = {"spring.aop.proxy-target-class=false"}) //JDK 동적 프록시, DI 예외 발생
//@SpringBootTest(properties = {"spring.aop.proxy-target-class=true"}) //CGLIB 프록시, 성공
@Import(ProxyDIAspect.class)
public class ProxyDITest {

    @Autowired 
    MemberService memberService; //JDK 동적 프록시 OK, CGLIB OK

    @Autowired 
    MemberServiceImpl memberServiceImpl; //JDK 동적 프록시 X, CGLIB OK

    @Test
    void go() {
        log.info("memberService class={}", memberService.getClass());
        log.info("memberServiceImpl class={}", memberServiceImpl.getClass());
        memberServiceImpl.hello("hello");
    }
}
```

```text
BeanNotOfRequiredTypeException: Bean named 'memberServiceImpl' is expected to be
of type 'hello.aop.member.MemberServiceImpl' but was actually of type
'com.sun.proxy.$Proxy54'
```

- 프록시를 구체 타입으로 캐스팅 할 수 없을 떄 발생하는 문제를 알아봅시다.
- `properties = {"spring.aop.proxy-target-class=false"}`로 설정하면 JDK 동적 프록시를 사용하게 됩니다.
- 해당 설정을 사용해서 스프링 AOP가 JDK 동적 프록시를 사용하도록 하면 다음과 같이 오류가 발생한다.
- `memberServiceImpl` 에 주입되길 기대하는 타입은 `hello.aop.member.MemberServiceImpl` 이지만 실제 넘어온 타입은 `com.sun.proxy.$Proxy54` 입니다.
- JDK Proxy는 `MemberService` 인터페이스를 기반으로 만들어집니다.
  - 따라서 `MemberServiceImpl` 타입이 뭔지 전혀 모릅니다. 따라서 `MemberServiceImpl` 타입으로 주입받을 수 없습니다.
- `spring.aop.proxy-target-class=true`로 설정하면 CGLIB 프록시를 사용하면 이 문제가 발생하지 않습니다.
- 하지만 DI를 받는 클라이언트 코드에서 구체 타입을 사용하는 것은 좋은 방법이 아닙니다.
  - DI를 받는 클라이언트 코드에서는 인터페이스를 사용하는 것이 좋습니다.
	- 따라서 올바르게 설계된 코드에서는 이런 문제가 자주 발생하지 않습니다.
  - 그럼에도 불구하고 테스트, 또는 여러가지 이유로 AOP 프록시가 적용된 구체 클래스를 직접 의존관계 주입 받아야 하는 경우가 있을 수 있습니다.

### 9.3 CGLIB의 한계

- CGLIB는 `final` 클래스나 `final` 메서드에 대해 프록시를 생성할 수 없습니다.
- AOP를 적용할 대상에는 `final` 클래스나`final` 메서드를 잘 사용하지는 않으므로 이 부분은 크게 문제가 되지는 않습니다.

## 참고

- https://docs.spring.io/spring-framework/reference/core/aop.html
- https://docs.spring.io/spring-framework/reference/core/aop/introduction-defn.html
- https://docs.spring.io/spring-framework/reference/core/aop/introduction-spring-defn.html
- https://docs.spring.io/spring-framework/reference/core/aop/introduction-proxies.html
- https://docs.spring.io/spring-framework/reference/core/aop/ataspectj/at-aspectj.
- https://docs.spring.io/spring-framework/reference/core/aop/ataspectj/pointcuts.html
- https://docs.spring.io/spring-framework/reference/core/aop/ataspectj/advice.html