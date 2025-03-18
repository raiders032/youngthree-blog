---
title: "변경 가능성을 최소화하라"
description: "자바에서 불변 클래스를 만드는 방법과 그 장점을 상세히 알아봅니다. 불변 클래스의 다섯 가지 규칙과 함께 실제 예제 코드를 통해 불변성이 프로그램 안정성과 성능에 미치는 영향을 설명합니다."
tags: [ "JAVA", "IMMUTABILITY", "THREAD_SAFETY", "EFFECTIVE_JAVA", "BACKEND" ]
keywords: [ "불변 클래스", "immutable class", "이뮤터블", "이뮤터빌리티", "자바", "java", "스레드 안전성", "thread safety", "쓰레드 세이프", "방어적 복사", "defensive copy", "불변식", "invariant", "이펙티브 자바", "effective java" ]
draft: false
hide_title: true
---

## 1. 불변 클래스

- `불변 클래스란 인스턴스 내부 값을 수정할 수 없는 클래스`입니다
- 불변 클래스의 인스턴스에 간직된 정보는 고정되며 객체가 파괴되는 순간까지 절대 달라지지 않습니다
- 자바 플랫폼 라이브러리의 다양한 불변 클래스
  - String과 박싱된 기본 타입 클래스들 BigInteger, BigDecimal

## 2. 불변 클래스의 장점

- 불변 클래스는 가변 클래스보다 설계하고 구현하고 사용하기 쉬우며 오류가 생길 여지가 적습니다

**Thread Safe**

- **불변 객체는 근본적으로 `Thread Safe`하여 따로 동기화할 필요 없습니다**
- 불변 클래스는 클래스를 Thread Safe하게 만드는 가장 쉬운 방법입니다
- Thread Safe하기 때문에 불변 객체를 안심하고 공유할 수 있습니다
  - 불변 객체는 최대한 재활용하는 것이 좋습니다
  - 가장 쉬운 불변 클래스 재활용 방법은 상수(public static final)로 제공하는 것입니다

**캐싱**

- 불변 클래스는 자주 사용되는 인스턴스를 캐싱하여 같은 인스턴스를 중복 생성하지 않게 해주는 적정 팩토리를 제공할 수 있습니다
- 예를들어 박싱된 기본 타입 전부와 BigInteger등이 있습니다
- 캐싱된 인스턴스를 재사용하면 메모리 사용량과 가비지 컬렉션 비용이 줄어듭니다

**방어적 복사**

- 불변 객체는 자유롭게 공유할 수 있어 방어적 복사도 필요없습니다
- 복사해도 원본과 똑같으니 복사 자체가 의미가 없습니다

**내부 데이터 공유**

- 불변 객체끼리 내부 데이터를 공유할 수 있습니다
- BigInteger 클래스는 내부에서 값의 부호를 나타내는 int 변수와 크기를 나타내는 int 배열을 사용합니다
  - BigInteger의 negate 메서드는 크기는 같고 부호만 반대인 새로운 BigInteger를 생성합니다
  - 이때 배열은 비록 가변이지만 복사하지 않고 원본 인스턴스와 공유합니다
  - 따라서 새로 만든 BigInteger도 원본 BigInteger의 int 배열을 같이 가리킵니다

**구성요소**

- 객체를 만들 때 다른 불변 객체들을 구성요소로 사용하면 이점이 많습니다
- 값이 바뀌지 않는 구성요소들로 이뤄진 객체라면 구조가 복잡해도 불변식을 유지하기 수월하기 때문입니다
  - 맵이나 집합 안에 담긴 값이 바뀌면 불변식이 허물어집니다
- 예로 불변 객체는 맵의 키와 Set의 원소로 쓰기에 안성맞춤입니다

:::info
**불변식**

- 프로그램이 실행되는 동안 반드시 만족해야 하는 조건을 말합니다
- 예를 들어 Period 클래스의 start 필드의 값은 반드시 end 필드 값보다 앞서야 하므로 두 값이 역전되면 불변식이 깨진 것입니다
- 가변 객체에서도 불변식이 존재할 수 있습니다
  :::

**원자성을 제공합니다**

- 상태가 변하지 않으니 잠깐이라도 불일치 상태에 빠질 가능성이 없습니다

## 3. 불변 클래스 규칙

- 클래스를 불변으로 만들려면 다섯 가지 규칙을 따르면 됩니다

### 3.1 변경자를 제공하지 않습니다

- 객체의 상태를 변경하는 메소드(변경자)를 메소드를 제공하지 않습니다

### 3.2 클래스 확장 불가

- 하위 클래스에서 부주의하게 혹은 나쁜 의도로 객체의 상태를 변하게 하는 것을 막습니다
  - 하위 클래스에서 새로운 필드를 추가하고 변경자를 만들면 더 이상 불변 클래스가 아니게됩니다

- 상속을 막으려면 클래스에 final 키워드를 적용합니다
- 더 유연한 방법으로 모든 생성자를 private 혹은 package-private으로 만들고 public 정적 팩토리를 제공하는 방법
  - 패키지 바깥의 클라이언트에서 바라본 이 불변 객체는 사실상 final입니다
  - public이나 protected 생성자가 없으니 다른 패키지에서 이 클래스를 확장하는 것이 불가능합니다

### 3.3 모든 필드를 final로 선언

- 시스템이 강제하는 수단을 이용해 설계자의 의도를 명확히 드러내는 방법입니다
- 새로 생성된 인스턴스를 동기화 작업 필요없이 다른 스레드로 건네도 문제 없이 동작하게끔 보장하는데 필요합니다

### 3.4 모든 필드 private으로 선언

- 필드가 참조하는 가변 객체를 클라이언트에서 직접 접근하여 수정하는 것을 막습니다
- 기본 타입 필드나 불변 객체를 참조하는 필드를 public final로 선언해도 불변 객체가 되지만 캡슐화가 깨져 권장하지 않습니다

### 3.5 가변 컴포넌트 접근 제한

- 자신 외에는 내부의 가변 컴포넌트에 접근할 수 없도록 합니다
- 클래스에 가변 객체를 참조하는 필드가 하나라도 있다면 클라이언트가 그 객체의 참조를 얻을 수 없도록 해야합니다
- 가변 객체를 참조하는 필드가 클라이언트가 제공한 객체를 가리키게 해서는 안됩니다
- 접근자 메소드가 가변 객체를 참조하는 필드를 그대로 반환해서는 안됩니다
- 생성자, 접근자, readObjcet 메소드 모두에서 방어적 복사를 수행해야 합니다

## 4. 불변 클래스 예시

#### Complex.java

```java
public final class Complex {
  private final double re;
  private final double im;

  public static final Complex ZERO = new Complex(0, 0);
  public static final Complex ONE  = new Complex(1, 0);
  public static final Complex I    = new Complex(0, 1);

  public Complex(double re, double im) {
    this.re = re;
    this.im = im;
  }

  public double realPart()      { return re; }
  public double imaginaryPart() { return im; }

  public Complex plus(Complex c) {
    return new Complex(re + c.re, im + c.im);
  }

  // Static factory, used in conjunction with private constructor (Page 85)
  public static Complex valueOf(double re, double im) {
    return new Complex(re, im);
  }

  public Complex minus(Complex c) {
    return new Complex(re - c.re, im - c.im);
  }

  public Complex times(Complex c) {
    return new Complex(re * c.re - im * c.im,
                       re * c.im + im * c.re);
  }

  public Complex dividedBy(Complex c) {
    double tmp = c.re * c.re + c.im * c.im;
    return new Complex((re * c.re + im * c.im) / tmp,
                       (im * c.re - re * c.im) / tmp);
  }

  @Override public boolean equals(Object o) {
    if (o == this)
      return true;
    if (!(o instanceof Complex))
      return false;
    Complex c = (Complex) o;

    // See page 47 to find out why we use compare instead of ==
    return Double.compare(c.re, re) == 0
      && Double.compare(c.im, im) == 0;
  }
  @Override public int hashCode() {
    return 31 * Double.hashCode(re) + Double.hashCode(im);
  }

  @Override public String toString() {
    return "(" + re + " + " + im + "i)";
  }
}
```

### 4.1 변경자를 제공하지 않습니다

- 사칙연산 메서드(plus, minus, times, dividedBy)들이 인스턴스 자신을 수정하지 않고 새로운 Complex 인스턴스를 반환합니다
- 이처럼 피연산자에 함수를 적용해 그 결과를 반환하지만, 피연산자 자체는 그대로인 프로그래밍 패턴을 함수형 프로그래밍이라고 합니다
- 사칙연산 메서드 plus를 add라고 명명하지 않은 이유도 해당 메서드가 객체의 값을 변경하지 않는다는 사실을 강조하려는 의도입니다
- 함수형 프로그래밍을 하면 코드에서 불변이 되는 영역의 비율이 높아집니다

### 4.2 클래스 확장 불가

- 상속을 막기위해 클래스에 final 키워드를 적용했습니다

```java
public final class Complex {
	...
}
```

### 4.3 모든 필드 final로 선언

- 모든 필드가 final으로 선언되었습니다

```java
public final class Complex {
  private final double re;
  private final double im;
}
```

### 4.4 모든 필드 private으로 선언

- 모든 필드가 private으로 선언되었습니다

```java
public final class Complex {
  private final double re;
  private final double im;
}
```

## 5. 불변 클래스 사용

### 5.1 상수

- 불변 객체는 근본적으로 Thread Safe하여 따로 동기화할 필요 없습니다
  - 불변 클래스는 클래스를 Thread Safe하게 만드는 가장 쉬운 방법입니다
- Thread Safe하기 때문에 불변 객체를 최대한 재활용해야 합니다!
- 가장 쉬운 재활용 방법은 상수(public static final)로 제공하는 것입니다

#### Complex.java

- [Complex 클래스](#4-불변-클래스-예시)는 불변 클래스입니다

```java
public static final Complex ZERO = new Complex(0, 0);
public static final Complex ONE  = new Complex(1, 0);
public static final Complex I    = new Complex(0, 1);
```

### 5.2 정적 팩토리

- 자주 사용되는 불변 인스턴스를 캐싱하여 같은 인스턴스를 중복 생성하지 않게 해주는 정적 팩토리를 제공해야 합니다
- 박싱된 기본 타입 클래스 전부와 BigInteger가 여기 속합니다
- 이런 정적 팩토리를 사용하면 여러 클라이언트가 객체를 공유하여 메모리 사용량과 가비지 컬렉션 비용을 줄일 수 있습니다
- 새로운 클래스를 설계할 때 public 생성자 대신 정적 팩토리를 만들어두면 클라이언트 수정없이 나중에 캐시 기능 추가가 가능합니다

## 6. 불변 클래스의 단점

- 값이 다르면 무조건 독립된 객체를 생성해야 합니다
  - 값의 가짓수가 많다면 이들을 모두 만드는데 큰 비용이 듭니다
- 원하는 객체를 만들기 까지 여러 단계를 거쳐야 한다면, 쓸모없는 객체가 많이 생깁니다
  - 최종 단계의 객체를 만들면 중간 단계의 객체는 쓸모없기 때문입니다
- 위 문제의 해결점으로 다단계 연산을 제거하는 가변 동반 클래스를 작성합니다
  - String의 가변 동반 클래스는 StringBuilder와 StringBuffer입니다

## 7. 정리

- 클래스는 꼭 필요한 경우가 아니라면 불변이어야 합니다
- `불변으로 만들 수 없는 클래스라도 변경할 수 있는 부분을 최소한으로 줄이자`
- 다른 합당한 이유가 없다면 모든 필드는 `private final`이어야 합니다
- 생성자는 불변식 설정이 모두 완료된, 초기화가 완벽히 끝난 상태의 객체를 생성해야 합니다