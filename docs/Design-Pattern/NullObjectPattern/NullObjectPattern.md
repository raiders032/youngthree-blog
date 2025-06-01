---
title: "Null Object Pattern"
description: "조영호의 오브젝트 책에서 소개된 Null Object Pattern을 통해 영화 할인 정책 예제로 null 체크를 우아하게 제거하는 방법을 알아봅니다. 다형성을 활용하여 더 안전하고 깔끔한 코드를 작성하는 실용적인 접근법을 설명합니다."
tags: [ "NULL_OBJECT_PATTERN", "DESIGN_PATTERN", "JAVA", "OBJECT_ORIENTED", "SPRING", "BACKEND" ]
keywords: [ "널 오브젝트 패턴", "null object pattern", "널체크", "null check", "디자인패턴", "design pattern", "자바", "java", "객체지향", "object oriented", "다형성", "polymorphism", "할인정책", "discount policy", "오브젝트", "조영호" ]
draft: false
hide_title: true
---

## 1. Null Object Pattern이란?

- Null Object Pattern은 null 참조를 특별한 객체로 대체하여 null 체크를 제거하는 디자인 패턴입니다.
- 이번 글에서는 조영호님의 "오브젝트"라는 도서에서 영화 할인 정책을 예시로 이 패턴의 효과적인 활용법을 설명합니다.

:::info
Null Object Pattern의 핵심은 "아무것도 하지 않는 행동"을 가진 객체를 만들어 null 대신 사용하는 것입니다.
:::

## 2. 문제 상황: null 체크의 번거로움

### 2.1 기존 설계의 문제점

- 영화 예매 시스템에서 Movie 클래스가 할인 정책을 가질 때, 할인 정책이 없는 경우를 어떻게 처리해야 할까요?

#### 기존 방식 - null 허용

```java
public class Movie {
    private String title;
    private Duration runningTime;
    private Money fee;
    private DiscountPolicy discountPolicy; // null 가능

    public Movie(String title, Duration runningTime, Money fee, 
                 DiscountPolicy discountPolicy) {
        this.title = title;
        this.runningTime = runningTime;
        this.fee = fee;
        this.discountPolicy = discountPolicy;
    }

    public Money calculateMovieFee(Screening screening) {
        if (discountPolicy == null) {
            return fee;
        }
        return fee.minus(discountPolicy.calculateDiscountAmount(screening));
    }
}
```

- 위 방식의 문제점
	- 매번 null 체크를 해야 함
	- 실수로 null 체크를 빼먹을 위험
	- 코드 가독성 저하
	- 다형성의 장점을 활용하지 못함

## 3. Null Object Pattern 적용

### 3.1 다중성을 1로 고정

- 할인 정책의 다중성을 "0 또는 1"에서 "1"로 변경하고, 할인이 없는 경우를 위한 특별한 정책을 만듭니다.

#### 할인 정책 추상 클래스

```java
public abstract class DiscountPolicy {
    private List<DiscountCondition> conditions = new ArrayList<>();

    public DiscountPolicy(DiscountCondition... conditions) {
        this.conditions = Arrays.asList(conditions);
    }

    public Money calculateDiscountAmount(Screening screening) {
        for (DiscountCondition each : conditions) {
            if (each.isSatisfiedBy(screening)) {
                return getDiscountAmount(screening);
            }
        }
        return Money.ZERO;
    }

    abstract protected Money getDiscountAmount(Screening screening);
}
```

### 3.2 NoneDiscountPolicy 구현

- 할인을 하지 않는 정책을 나타내는 Null Object를 구현합니다.

#### Null Object 구현

```java
public class NoneDiscountPolicy extends DiscountPolicy {
    
    @Override
    protected Money getDiscountAmount(Screening screening) {
        return Money.ZERO;
    }
}
```

- NoneDiscountPolicy는 할인 조건을 체크하지 않고 항상 0원을 반환합니다.
- 이것이 "아무것도 하지 않는 행동"의 구현입니다.

### 3.3 개선된 Movie 클래스

- 이제 Movie 클래스에서 null 체크가 완전히 사라집니다.

#### null 체크 제거된 코드

```java
public class Movie {
    private String title;
    private Duration runningTime;
    private Money fee;
    private DiscountPolicy discountPolicy; // 항상 null이 아님

    public Movie(String title, Duration runningTime, Money fee, 
                 DiscountPolicy discountPolicy) {
        this.title = title;
        this.runningTime = runningTime;
        this.fee = fee;
        this.discountPolicy = discountPolicy;
    }

    public Money calculateMovieFee(Screening screening) {
        // null 체크 불필요!
        return fee.minus(discountPolicy.calculateDiscountAmount(screening));
    }
}
```

- Movie의 DiscountPolicy를 필수 의존성으로 변경하여, 항상 유효한 할인 정책 객체를 가지도록 합니다.
- 따라서 null 체크가 필요 없어지고, 코드가 훨씬 깔끔해집니다.

## 4. 사용 예시

### 4.1 할인 정책이 있는 영화

```java
// 금액 할인 정책이 있는 영화
Movie avatar = new Movie(
    "아바타",
    Duration.ofMinutes(120),
    Money.wons(10000),
    new AmountDiscountPolicy(Money.wons(800),
        new SequenceCondition(1),
        new SequenceCondition(10))
);
```

### 4.2 할인 정책이 없는 영화

```java
// 할인 정책이 없는 영화 - null 대신 NoneDiscountPolicy 사용
Movie starWars = new Movie(
    "스타워즈",
    Duration.ofMinutes(210),
    Money.wons(10000),
    new NoneDiscountPolicy() // null 대신 Null Object 사용
);
```

## 5. Null Object Pattern의 장점

### 5.1 코드 안전성 향상

- NullPointerException 발생 가능성 제거
- 컴파일 타임에 null 관련 오류 방지
- 일관된 메서드 호출 방식

### 5.2 다형성 활용

- 모든 할인 정책을 동일한 방식으로 처리
- 조건문 제거로 코드 복잡도 감소
- 새로운 할인 정책 추가 시 기존 코드 변경 불필요

### 5.3 유지보수성 개선

- 코드의 일관성 유지
- 버그 발생 가능성 감소
- 테스트 코드 작성 용이성

## 6. 마치며

- Null Object Pattern은 null 체크를 제거하고 다형성을 활용하여 더 안전하고 깔끔한 코드를 작성할 수 있게 해주는 유용한 패턴입니다. 
- 조영호님의 『오브젝트』에서 제시한 영화 할인 정책 예제처럼, 선택적 의존성을 가진 객체 설계에서 특히 효과적입니다.
- 핵심은 "아무것도 하지 않음"도 하나의 행동으로 보고, 이를 객체로 표현하는 것입니다. 이를 통해 null 체크 없이도 일관된 메서드 호출이 가능해집니다.