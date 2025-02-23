---
title: "Java ClassLoader 완벽 가이드"
description: "Java의 핵심 컴포넌트인 ClassLoader의 개념부터 동작 원리까지 상세히 알아봅니다. 동적 클래스 로딩의 장점, 클래스 로더의 종류와 계층 구조, 그리고 클래스 로딩의 전체 생명주기를 실제 예제와 함께 설명합니다."
tags: [ "JAVA", "JVM", "CLASSLOADER", "BACKEND" ]
keywords: [ "자바", "클래스로더", "Java", "ClassLoader", "JVM", "클래스 로딩", "동적 로딩", "class loading", "부트스트랩 클래스로더", "시스템 클래스로더", "바이트코드", "자바 가상머신" ]
draft: false
hide_title: true
---

## 1. ClassLoader 개요

- ClassLoader는 JVM(Java Virtual Machine)의 핵심 컴포넌트로, **자바 바이트코드(.class 파일)를 JVM의 메모리에 동적으로 로드하는 역할**을 담당합니다.
- 자바는 '동적 로드' 방식을 사용하는데, 이는 컴파일 시점이 아닌 **런타임에 클래스를 처음으로 참조할 때 해당 클래스를 로드하고 링크**하는 방식입니다.
- ClassLoader 덕분에 Java 런타임은 파일 시스템의 구조나 형식에 독립적으로 동작할 수 있습니다.

:::info
동적 로딩의 장점:

- 메모리 효율성: 필요한 클래스만 메모리에 로드
- 유연성: 런타임에 클래스를 교체하거나 수정 가능
- 모듈화: 플러그인이나 확장 기능을 쉽게 구현 가능
  :::

## 2. ClassLoader의 계층 구조

- ClassLoader는 계층적인 구조를 가지며, 각 계층은 특정 영역의 클래스 로딩을 담당합니다.

### 2.1 Bootstrap ClassLoader (Primordial ClassLoader)

- JVM의 핵심 컴포넌트를 로드하는 최상위 클래스 로더입니다.
- 자바 8까지는 `rt.jar`에서, 자바 9부터는 Java Runtime Image(JRT)에서 코어 자바 파일을 로드합니다.
- 다른 클래스 로더와 달리 네이티브 코드로 구현되어 있습니다.
- `<JAVA_HOME>/jre/lib` 디렉터리의 핵심 자바 클래스들을 로드합니다.

### 2.2 Platform ClassLoader (Extension ClassLoader)

- Java 9부터 Extension ClassLoader가 Platform ClassLoader로 변경되었습니다.
- JDK의 모듈 시스템에서 플랫폼 관련 확장을 로드합니다.
- `java.platform` 시스템 속성이나 `--module-path` 옵션으로 지정된 모듈을 로드합니다.
- `<JAVA_HOME>/jre/lib/ext` 디렉터리의 클래스들을 로드합니다.

### 2.3 System ClassLoader (Application ClassLoader)

- 애플리케이션의 클래스패스에 있는 클래스들을 로드합니다.
- Platform ClassLoader의 자식 클래스 로더입니다.
- 다음 위치에서 클래스를 로드합니다:
	- CLASSPATH 환경 변수
	- -classpath 또는 -cp 커맨드라인 옵션
	- 애플리케이션의 클래스패스

## 3. ClassLoader의 3가지 원칙

- ClassLoader는 다음 세 가지 핵심 원칙에 따라 동작합니다:

### 3.1 위임 모델 (Delegation Model)

ClassLoader는 Delegation Hierarchy Algorithm이라는 위임 계층 알고리즘을 사용하여 클래스를 로드합니다:

1. JVM이 클래스를 발견하면 해당 클래스가 이미 로드되었는지 확인합니다.
2. 클래스가 이미 메서드 영역에 로드되어 있다면 JVM은 실행을 계속합니다.
3. 클래스가 메서드 영역에 없다면 JVM은 ClassLoader 서브시스템에 로드를 요청하고, 이는 Application ClassLoader에게 제어권을 넘깁니다.
4. Application ClassLoader는 Platform ClassLoader에게 위임하고, Platform ClassLoader는 다시 Bootstrap ClassLoader에게 위임합니다.
5. Bootstrap ClassLoader는 Bootstrap classpath(JDK/JRE/LIB)에서 클래스를 찾습니다. 찾으면 로드하고, 못 찾으면 Platform ClassLoader에게 위임합니다.
6. Platform ClassLoader는 Extension classpath(JDK/JRE/LIB/EXT)에서 클래스를 찾습니다. 찾으면 로드하고, 못 찾으면 Application ClassLoader에게
   위임합니다.
7. Application ClassLoader는 Application classpath에서 클래스를 찾습니다. 찾으면 로드하고, 못 찾으면 ClassNotFoundException 예외가 발생합니다.

### 3.2 가시성 원칙 (Visibility Principle)

가시성 원칙은 다음과 같이 정의됩니다:

- 부모 ClassLoader가 로드한 클래스는 자식 ClassLoader에서 볼 수 있지만, 자식 ClassLoader가 로드한 클래스는 부모 ClassLoader에서 볼 수 없습니다.
- 예를 들어, Platform ClassLoader가 'GEEKS.class'를 로드했다면:
	- 이 클래스는 Platform ClassLoader와 Application ClassLoader에서만 보입니다
	- Bootstrap ClassLoader에서는 볼 수 없습니다
	- Bootstrap ClassLoader로 이 클래스를 다시 로드하려고 하면 java.lang.ClassNotFoundException 예외가 발생합니다

### 3.3 유일성 원칙 (Uniqueness Property)

유일성 원칙은 클래스 로딩의 중복을 방지합니다:

- 각 클래스는 시스템 내에서 유일해야 하며 중복 로딩되지 않습니다
- 부모 ClassLoader가 클래스를 찾지 못한 경우에만 현재 ClassLoader가 로드를 시도합니다
- 이를 통해 클래스의 일관성과 무결성을 보장합니다

## 4. 클래스 로드의 단계

ClassLoader는 다음과 같은 위임 계층 알고리즘을 따릅니다:

1. JVM이 클래스 로딩 요청을 받으면 해당 클래스가 이미 로드되었는지 확인합니다.
2. 로드되지 않은 경우, 다음 순서로 위임을 진행합니다:
	- Application ClassLoader → Platform ClassLoader → Bootstrap ClassLoader
3. 각 ClassLoader는 지정된 위치에서 클래스를 찾고, 필요한 경우 상위로 위임합니다.

:::tip 위임 모델의 장점

- 클래스 로딩의 일관성 보장
- 보안성 향상: 신뢰할 수 있는 코어 클래스를 우선적으로 로드
- 중복 로딩 방지
  :::

### 3.2 클래스 로딩 프로세스

클래스 로딩은 다음 세 단계를 거칩니다:

![클래스 로딩 프로세스](images/classloder.png)

#### 1. Loading

- 클래스 파일을 바이트 코드로 읽어 메모리에 로드합니다.
- 클래스의 정적 구조를 생성합니다.

#### 2. Linking

Linking 단계는 세 부분으로 나뉩니다:

1. Verification (검증)
	- 바이트코드가 JVM 명세에 맞게 구성되었는지 검사
	- 보안과 안정성을 위한 중요한 단계
2. Preparation (준비)
	- 클래스 변수(static 변수)를 위한 메모리 할당
	- 기본값으로 초기화
3. Resolution (해석)
	- 심볼릭 레퍼런스를 실제 메모리 참조로 교체
	- 상수 풀의 모든 참조를 해석

#### 3. Initialization

- static 변수를 선언된 값으로 초기화
- static 초기화 블록 실행

### 3.3 주요 메서드

ClassLoader는 다음과 같은 핵심 메서드를 제공합니다:

```java
// 클래스 로딩을 위한 기본 메서드
protected Class<?> loadClass(String name, boolean resolve)
    throws ClassNotFoundException {
    Class<?> c = findLoadedClass(name);
    if (c == null) {
        try {
            if (parent != null) {
                c = parent.loadClass(name, false);
            } else {
                c = findBootstrapClass0(name);
            }
        } catch (ClassNotFoundException e) {
            c = findClass(name);
        }
    }
    if (resolve) {
        resolveClass(c);
    }
    return c;
}
```

주요 메서드 목록:

- `loadClass(String name, boolean resolve)`: 클래스 로딩의 진입점
- `defineClass()`: 바이트 배열을 클래스 인스턴스로 변환
- `findClass(String name)`: 지정된 클래스를 찾음
- `findLoadedClass(String name)`: 이미 로드된 클래스인지 확인

## 4. ClassLoader의 특징

### 4.1 가시성 원칙 (Visibility Principle)

- 부모 ClassLoader가 로드한 클래스는 자식 ClassLoader에서 볼 수 있습니다.
- 자식 ClassLoader가 로드한 클래스는 부모 ClassLoader에서 볼 수 없습니다.

:::warning 가시성 예시
만약 Platform ClassLoader가 'GEEKS.class'를 로드했다면:

- Application ClassLoader에서 해당 클래스를 볼 수 있음
- Bootstrap ClassLoader에서는 해당 클래스를 볼 수 없음
  :::

### 4.2 유일성 (Uniqueness)

- 각 클래스는 한 번만 로드됩니다.
- 부모 ClassLoader에서 클래스를 찾지 못한 경우에만 현재 ClassLoader가 로드를 시도합니다.

## 5. 실제 활용 사례

### 5.1 플러그인 시스템

- 런타임에 새로운 기능을 동적으로 추가할 수 있습니다.
- 각 플러그인은 자체 ClassLoader를 가질 수 있습니다.

### 5.2 웹 애플리케이션

- 웹 서버는 각 웹 애플리케이션에 대해 별도의 ClassLoader를 사용합니다.
- 이를 통해 애플리케이션 간의 격리를 보장합니다.

### 5.3 프레임워크 확장

- 스프링과 같은 프레임워크는 ClassLoader를 활용하여 다양한 기능을 구현합니다.
- 예: 핫 스와핑, 동적 리로딩 등

## 6. 마치며

- Java ClassLoader는 JVM의 핵심 컴포넌트로서, 동적 클래스 로딩을 통해 자바의 유연성과 확장성을 제공합니다.
- 계층적 구조와 위임 모델을 통해 안전하고 효율적인 클래스 로딩을 보장하며, 이는 현대 자바 애플리케이션의 다양한 요구사항을 충족시키는 기반이 됩니다.