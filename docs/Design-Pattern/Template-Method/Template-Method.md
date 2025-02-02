---
title: "Template Method Pattern"
description: "객체지향 설계의 핵심 원칙인 '변하는 것과 변하지 않는 것의 분리'를 실현하는 템플릿 메서드 패턴을 상세히 다룹니다. 패턴의 개념, 구현 방법, 실전 활용 사례와 함께 장단점 분석을 통해 실무에서의 적절한 사용법을 알아봅니다."
tags: [ "TEMPLATE_METHOD", "DESIGN_PATTERN", "INHERITANCE", "JAVA", "SPRING", "BACKEND", "OOP" ]
keywords: [
  "템플릿 메서드 패턴",
  "template method pattern",
  "디자인 패턴",
  "design pattern",
  "상속",
  "inheritance",
  "추상 클래스",
  "abstract class",
  "오버라이딩",
  "overriding",
  "훅 메서드",
  "hook method",
  "알고리즘 골격",
  "algorithm skeleton",
  "객체지향",
  "oop",
  "자바",
  "java"
]
draft: false
hide_title: true
---

## 1. 템플릿 메서드 패턴 개요

- 템플릿 메서드 패턴은 객체지향 설계의 핵심 원칙인 "변하는 것과 변하지 않는 것을 분리"하는 것을 실현하는 고전적인 디자인 패턴입니다.

### 1.1 핵심 개념

- 알고리즘의 골격을 부모 클래스에 정의합니다.
- 변경이 필요한 부분만 자식 클래스에서 구현합니다.
- 전체 알고리즘 구조는 유지하면서 특정 단계만 변경 가능합니다.

:::info
GOF의 정의: "작업에서 알고리즘의 골격을 정의하고 일부 단계를 하위 클래스로 연기합니다. 템플릿 메서드를 사용하면 하위 클래스가 알고리즘의 구조를 변경하지 않고도 알고리즘의 특정 단계를 재정의할 수 있습니다."
:::

### 1.2 패턴의 구조

- 추상 클래스: 알고리즘의 뼈대 정의
- 구체 클래스: 실제 비즈니스 로직 구현
- 훅(Hook) 메서드: 선택적으로 오버라이딩 가능한 메서드

## 2. 템플릿 메서드 패턴 구현

### 2.1 추상 클래스 정의

```java
public abstract class AbstractTemplate<T> {
    private final LogTrace trace;
    
    public AbstractTemplate(LogTrace trace) {
        this.trace = trace;
    }
    
    // 템플릿 메서드: 알고리즘의 골격 정의
    public T execute(String message) {
        TraceStatus status = null;
        try {
            status = trace.begin(message);
            
            // 변하는 부분(자식 클래스에서 구현)
            T result = call();
            
            trace.end(status);
            return result;
        } catch (Exception e) {
            trace.exception(status, e);
            throw e;
        }
    }
    
    // 추상 메서드: 자식 클래스에서 반드시 구현
    protected abstract T call();
}
```

- AbstractTemplate는 템플릿 메서드인 `execute()`를 정의합니다.
- `execute()` 메서드는 알고리즘의 골격을 정의하고, `call()` 메서드를 호출합니다.
- `call()` 메서드는 추상 메서드로, 자식 클래스에서 반드시 구현해야 합니다.
	- 이 메서드는 구체 클래스에서 실제 비즈니스 로직을 구현합니다.
  - 구체 클래스마다 서로 다른 로직을 수행할 수 있습니다.

### 2.2 구체 클래스 구현

```java
@Slf4j
public class SubClassLogic1 extends AbstractTemplate {
    @Override
    protected void call() {
        log.info("비즈니스 로직1 실행");
    }
}
```

- 구체 클래스는 추상 클래스를 상속받아 `call()` 메서드를 구현합니다.
- `call()` 메서드는 구체 클래스마다 다른 비즈니스 로직을 수행할 수 있습니다.
- 템플릿 메서드 패턴을 통해 알고리즘의 구조는 유지하면서 특정 단계만 변경할 수 있습니다.

## 3. 패턴 활용하기

### 3.1 일반적인 상속 방식

```java
@Slf4j
public class OrderService extends AbstractTemplate<String> {
    @Override
    protected String call() {
        // 구체적인 비즈니스 로직 구현
        return "order processed";
    }
}
```

- 위 코드는 가장 일반적인 상속 방식으로 템플릿 메서드 패턴을 활용합니다.
- OrderService는 AbstractTemplate을 상속받아 `call()` 메서드를 구현합니다.


### 3.2 익명 클래스 활용

```java
@RestController
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final LogTrace trace;
    
    @GetMapping("/request")
    public String request(String itemId) {
        AbstractTemplate<String> template = new AbstractTemplate<>(trace) {
            @Override
            protected String call() {
                orderService.orderItem(itemId);
                return "ok";
            }
        };
        
        return template.execute("OrderController.request()");
    }
}
```

- 익명 클래스를 활용하면 템플릿 메서드 패턴을 더 유연하게 활용할 수 있습니다.
- OrderController에서는 AbstractTemplate을 익명 클래스로 구현하여 사용합니다.

## 4. 장단점 분석

### 4.1 장점

- 코드 중복 제거
- 알고리즘의 구조 유지
- 유지보수성 향상
- 확장성 확보

### 4.2 한계와 주의점

:::warning
템플릿 메서드 패턴은 상속을 사용하기 때문에 다음과 같은 한계가 있습니다:

- 컴파일 시점 의존 관계로 인한 강한 결합
- 부모 클래스 수정 시 자식 클래스 영향
- 상속의 단점을 그대로 안고 감
  :::

## 5. 대안 패턴

### 5.1 전략 패턴

- 상속 대신 위임을 사용합니다.
- 더 유연한 구조 제공합니다.
- 런타임에 알고리즘 변경이 가능합니다.
- [Strategy 참고](../Strategy/Strategy.md)

### 5.2 템플릿 콜백 패턴

- 전략 패턴의 확장으로, 콜백을 활용합니다.
- 전략 패턴은 생성 시점에 전략을 결정하지만, 템플릿 콜백 패턴은 실행 시점에 전략을 결정합니다.
- 따라서 보다 동적인 전략 변경이 가능합니다.
- [Template Callback 참고](../Template-Callback/Template-Callback.md)

:::tip
상속으로 인한 제약이 부담스러운 경우, 전략 패턴을 고려해 보세요. 전략 패턴은 템플릿 메서드 패턴과 비슷한 역할을 하면서도 상속의 단점을 제거할 수 있습니다.
:::

## 6. 실전 적용 가이드

### 6.1 적용 시나리오

- 알고리즘의 구조가 안정적일 때
- 변경이 필요한 부분이 명확할 때
- 코드 재사용이 주요 관심사일 때

### 6.2 구현 팁

- 추상 메서드는 필요한 만큼만 정의
- 훅 메서드를 적절히 활용
- 명확한 네이밍 규칙 적용
- 문서화를 통한 의도 명확히 전달

## 7. 마치며

- 템플릿 메서드 패턴은 알고리즘의 구조를 고정하면서 특정 단계만을 유연하게 변경할 수 있게 해주는 강력한 도구입니다. 
- 하지만 상속이라는 제약이 있으므로, 사용 시 이러한 제약과 대안을 충분히 고려해야 합니다.

참고 자료:

- [스프링 핵심 원리 - 고급편](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B3%A0%EA%B8%89%ED%8E%B8/dashboard)