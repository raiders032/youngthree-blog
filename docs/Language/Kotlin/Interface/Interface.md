---
title: "Interface"
description: "Kotlin 인터페이스의 정의, 구현, 프로퍼티, 상속, 오버라이딩 충돌 해결 및 JVM 기본 메서드 생성"
keywords: ["Kotlin", "Interface", "인터페이스", "상속", "오버라이딩"]
tags: ["Kotlin", "Interface"]
hide_title: true
last_update:
  date: 2026-01-04
  author: youngthree
---

## 1 Interface

- 코틀린의 Interface는 자바 8의 Interface와 비슷합니다.
- 추상 메서드뿐아니라 구현이 있는 메서드도 정의할 수 있습니다.
  - 자바 8의 디폴트 메서드와 유사합니다.
- 다만 인터페이스에는 아무런 상태(필드)가 들어갈 수 없습니다.
- 프로퍼티를 가질 수 있지만, 추상 프로퍼티이거나 접근자 구현을 제공해야 합니다.

### 1.1 Interface 정의

- `interface` 키워드를 사용하여 인터페이스를 정의합니다.

```kotlin
interface Clickable {
  fun click()
}
```

- click이라는 추상 메서드가 있는 Interface를 정의했습니다.
- 이 인터페이스를 구현하는 클래스는 click 메서드를 구현해야 합니다.

### 1.2 구현이 있는 메서드

- 자바에서는 구현이 있는 메서드 앞에 `default` 키워드를 붙여야합니다.
- 하지만 코틀린에서는 별다른 키워드가 필요 없고 메서드 본문을 시그니처 뒤에 추가하면 됩니다.
- 아래의 showOff 메서드의 경우 자식에서 새로운 동작을 정의할 수도 있고 정의를 생략하면 디폴트 구현을 사용됩니다.

```kotlin
interface Clickable {
    fun click()
    fun showOff() = println("I'm clickable!")
}
```

- showOff 메서드는 구현이 있는 메서드입니다.
- 구현 클래스는 showOff 오버라이드하여 새로운 동작을 정의할 수 있고 정의를 생략하면 디폴트 구현을 사용합니다.

### 1.3 Interface 구현

- 자바에서는 `extends`와 `implement` 키워드를 사용하지만 코틀린에서는 클래스 이름에 `:`을 붙이고 인터페이스와 클래스 이름을 적는 것으로 클래스 확장과 인터페이스 구현을 모두 처리합니다.
- 자바의 `@Override`와 비슷한 `override` 변경자는 상위 클래스나 인터페이스에 있는 프로퍼티나 메서드를 오버라이드한다는 표시입니다.
- 자바와 달리 `override` 변경자를 꼭 사용해야 합니다.
  - 상위 클래스의 메서드와 시그니처가 같은 메서드가 하위 클래스에 선언되면 컴파일 에러가 발생합니다.
  - 이런 경우 `override`를 붙이거나 메서드 이름을 변경해 시그니처를 다르게해야 합니다.
- 클래스나 객체는 하나 이상의 인터페이스를 구현할 수 있습니다.

```kotlin
class Button : Clickable {
    override fun click() = println("I was clicked")
}
```

- 위 예시에서 `Button` 클래스는 `Clickable` 인터페이스를 구현하고 있습니다.

## 2 인터페이스의 프로퍼티

- 인터페이스에서 프로퍼티를 선언할 수 있습니다.
- 인터페이스에 선언된 프로퍼티는 추상 프로퍼티이거나 접근자 구현을 제공해야 합니다.
- 인터페이스에 선언된 프로퍼티는 뒷받침 필드(backing field)를 가질 수 없습니다.
  - 따라서 인터페이스에 선언된 접근자에서는 뒷받침 필드를 참조할 수 없습니다.

```kotlin
interface MyInterface {
    val prop: Int // 추상 프로퍼티

    val propertyWithImplementation: String
        get() = "foo"

    fun foo() {
        print(prop)
    }
}

class Child : MyInterface {
    override val prop: Int = 29
}
```

- `prop`은 추상 프로퍼티로 구현 클래스에서 반드시 오버라이드해야 합니다.
- `propertyWithImplementation`은 접근자 구현을 제공하므로 구현 클래스에서 오버라이드하지 않아도 됩니다.

## 3 인터페이스 상속

- 인터페이스는 다른 인터페이스를 상속할 수 있습니다.
- 상속받은 멤버의 구현을 제공하고, 새로운 함수와 프로퍼티를 선언할 수 있습니다.
- 이러한 인터페이스를 구현하는 클래스는 누락된 구현만 정의하면 됩니다.

```kotlin
interface Named {
    val name: String
}

interface Person : Named {
    val firstName: String
    val lastName: String

    override val name: String get() = "$firstName $lastName"
}

data class Employee(
    // 'name' 구현은 필요하지 않음
    override val firstName: String,
    override val lastName: String,
    val position: Position
) : Person
```

- `Person` 인터페이스는 `Named` 인터페이스를 상속합니다.
- `Person`에서 `name` 프로퍼티의 기본 구현을 제공하므로, `Employee`에서는 `name`을 구현할 필요가 없습니다.

## 4 오버라이딩 충돌 해결

- 상위 타입 목록에 여러 타입을 선언하면 동일한 메서드의 구현을 둘 이상 상속받을 수 있습니다.

```kotlin
interface A {
    fun foo() { print("A") }
    fun bar()
}

interface B {
    fun foo() { print("B") }
    fun bar() { print("bar") }
}

class C : A {
    override fun bar() { print("bar") }
}

class D : A, B {
    override fun foo() {
        super<A>.foo()
        super<B>.foo()
    }

    override fun bar() {
        super<B>.bar()
    }
}
```

- 인터페이스 A와 B 모두 `foo()`와 `bar()` 함수를 선언합니다.
- 둘 다 `foo()`를 구현하지만, B만 `bar()`를 구현합니다.
  - A에서 `bar()`는 함수 본문이 없으면 인터페이스의 기본값인 추상으로 간주됩니다.
- A에서 구체 클래스 C를 파생하는 경우, `bar()`를 오버라이드하고 구현을 제공해야 합니다.
- A와 B에서 D를 파생하는 경우, 여러 인터페이스에서 상속받은 모든 메서드를 구현해야 합니다.
  - 단일 구현을 상속받은 메서드(`bar()`)와 여러 구현을 상속받은 메서드(`foo()`) 모두 해당됩니다.
- 상위 타입의 구현을 호출할 때는 `super<타입명>`을 사용합니다.

## 5 JVM 기본 메서드 생성

- JVM에서 인터페이스에 선언된 함수는 기본 메서드로 컴파일됩니다.
- `-jvm-default` 컴파일러 옵션을 사용하여 이 동작을 제어할 수 있습니다.

### 5.1 옵션 값

- `enable` (기본값): 인터페이스에 기본 구현을 생성하고, 하위 클래스와 DefaultImpls 클래스에 브릿지 함수를 포함합니다. 이전 Kotlin 버전과의 바이너리 호환성을 유지하려면 이 모드를 사용합니다.
- `no-compatibility`: 인터페이스에 기본 구현만 생성합니다. 호환성 브릿지와 DefaultImpls 클래스를 건너뛰므로 새로운 Kotlin 코드에 적합합니다.
- `disable`: 기본 메서드를 건너뛰고 호환성 브릿지와 DefaultImpls 클래스만 생성합니다.

### 5.2 Gradle 설정

- Gradle Kotlin DSL에서 `-jvm-default` 컴파일러 옵션을 설정하려면 `jvmDefault` 프로퍼티를 설정합니다.

```kotlin
kotlin {
    compilerOptions {
        jvmDefault = JvmDefaultMode.NO_COMPATIBILITY
    }
}
```
