---
title: "Reflection"
description: "자바 리플렉션의 핵심 개념과 실제 활용 방법을 상세히 다룹니다. 기본 개념부터 고급 활용법, 성능 고려사항까지 실무에서 필요한 모든 내용을 포함합니다."
tags: [ "REFLECTION", "JAVA", "BACKEND", "SPRING" ]
keywords: [ "자바 리플렉션", "java reflection", "리플렉션", "reflection", "메타데이터", "metadata", "런타임", "runtime", "동적 프로그래밍", "dynamic programming", "스프링", "spring framework" ]
draft: false
hide_title: true
---

## 1 Reflection

- Reflection이란 클래스로더를 통해 읽어온 클래스 정보를 사용하는 기술이다.
- 자바는 클래스와 인터페이스의 메타 데이터를 Class 클래스로 관리한다.
	- 여기서 메타 데이터란 클래스의 이름, 생성자 정보, 메서드 정보 등을 의미한다.
- 리플렉션 기술을 사용하면 클래스나 메서드의 메타정보를 동적으로 획득하고, 코드도 동적으로 호출할 수 있다.
- 리플렉션은 런타임에 동작하는 기능입니다. 프로그램 실행 중에 클래스, 메소드, 필드 등의 메타데이터에 접근합니다.

## 2. Class 객체 얻기

- 자바는 클래스와 인터페이스의 메타 데이터를 Class객체로 관리하기 때문에 Reflection을 사용하기 위해서는 먼저 Class 객체를 얻어야 합니다.
- Class 객체를 얻는 방법에는 세 가지가 있습니다.
	- Object.getClass() 사용
	- 클래스 리터럴 사용
	- Class.forName() 사용

### 2.1 Object.getClass()

- Object 클래스의 getClass() 메서드를 이용하면 해당 클래스의 Class 객체를 얻을 수 있습니다.
- getClass() 메서드는 해당 클래스의 객체가 있을 때 사용할 수 있습니다.
	- 만약 객체를 생성하기 전에 Class 객체를 얻고 싶다면 Class의 static 메서드 forName을 이용하면 됩니다.

#### 예시

```java
String str = "hello";
Class<?> cls = str.getClass();
```

### 2.2 클래스 리터럴 사용

- 클래스 리터럴을 사용하면 컴파일 시점에 클래스가 로드되어 Class 객체를 얻을 수 있습니다.

#### 예시

```java
Class<?> cls = String.class;
```

### 2.3 Class.forName()

```java
public static Class<?> forName(String className)
                        throws ClassNotFoundException
```

- Class.forName() 메서드를 이용하면 클래스 이름을 이용하여 Class 객체를 얻을 수 있습니다.
- 클래스에 대한 FQCN를 입력하면 해당 클래스의 Class 객체를 반환합니다.
	- 예를 들어, 자바의 ArrayList 클래스에 대한 FQCN은 `java.util.ArrayList` 입니다.
- 매개값으로 주어진 클래스를 찾지 못하면 ClassNotFoundException 예외가 발생합니다.

#### 예시

```java
try {
    Class<?> cls = Class.forName("java.lang.String");
} catch (ClassNotFoundException e) {
    // 예외 처리
}
```

## 3 Class 클래스

- [레퍼런스](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Class.html)
- `Class` 객체를 이용하면 클래스의 생성자, 필드, 메소드 정보를 알아낼 수 있습니다.

**Class 객체의 리플렉션 메소드**

- [레퍼런스](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Class.html#method-summary)
- [getDeclaredConstructors](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Class.html#getDeclaredConstructors())()
	- Constructor 객체의 배열을 반환
- [getDeclaredFields](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Class.html#getDeclaredFields())()
	- Field 객체의 배열을 반환
- [getFields](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Class.html#getFields())()
	- Field 객체의 배열을 반환(상속된 필드 포함)
	- public 멤버만 가져옴
- [getDeclaredMethods](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Class.html#getDeclaredMethods())()
	- Method 객체의 배열을 반환
- [getMethods](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Class.html#getMethods())()
	- Method 객체의 배열을 반환(상속된 메소드 포함)
	- 단 public 멤버만 가져옴

## 4 Reflection으로 할 수 있는 것

- 프로그램 실행 시간에 클래스 내부의 메서드와 필드에 대한 정보를 얻을 수 있습니다.
- 클래스의 객체를 생성할 수 있습니다.
- 객체 필드의 접근 제어자에 관계없이 그 필드에 대한 참조를 얻어내어 값을 가져오거나 설정할 수 있습니다.

## 5 Reflection을 사용하는 이유

- 프로그램이 어떻게 동작하는지 실행 시간에 관측하고 조정할 수 있도록 도와줍니다.
- 메서드나 생성자, 필드에 직접 접근할 수 잇기 때문에 프로그램을 디버깅하거나 테스트할 때 유용합니다.

## 6 주의사항

- 리플렉션을 사용하면 클래스와 메서드의 메타정보를 사용해서 애플리케이션을 동적으로 유연하게 만들 수 있습니다.
- 하지만 리플렉션 기술은 런타임에 동작하기 때문에, 컴파일 시점에 오류를 잡을 수 없습니다.
- 따라서 `리플렉션은 일반적으로 사용하면 안된다.`
- 리플렉션은 프레임워크 개발이나 또는 매우 일반적인 공통 처리가 필요할 때 부분적으로 주의해서 사용해야 합니다.

## 7 애노테이션 프로세싱과의 차이

- 리플렉션은 런타임에 동작하는 기술이고, 애노테이션 프로세싱은 컴파일 시점에 동작하는 기술입니다.
- 애노테이션 프로세싱은 컴파일 시간을 증가시키지만 런타임 성능에 영향이 없는 반면, 리플렉션은 런타임 성능에 영향을 줄 수 있습니다.
- 애노테이션 프로세싱은 주로 코드 생성과 컴파일 타임 검증에 사용되고, 리플렉션은 동적 코드 분석과 런타임 메타데이터 접근에 사용됩니다.
- 애노테이션 프로세싱은 컴파일 시 오류를 발견하여 빠른 피드백이 가능하지만, 리플렉션은 런타임 오류를 발생시킬 수 있습니다