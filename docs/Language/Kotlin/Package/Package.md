---
title: "Package"
description: "코틀린의 패키지와 임포트 개념을 상세히 알아봅니다. 자바와 다른 코틀린의 패키지 시스템, 임포트 사용법, 그리고 효율적인 디렉토리 관리 방법까지 실제 예제와 함께 설명합니다."
tags: ["KOTLIN", "PROGRAMMING", "BACKEND", "JVM"]
keywords: ["코틀린", "Kotlin", "패키지", "package", "임포트", "import", "디렉토리", "directory", "네임스페이스", "namespace", "코틀린 패키지", "코틀린 임포트", "자바 패키지", "패키지 구조", "코틀린 디렉토리", "JVM", "백엔드", "backend"]
draft: false
hide_title: true
---

## 1. Package

- 코틀린은 클래스를 조직화하기 위해 패키지라는 개념을 사용합니다.
- 모든 코틀린 파일에는 맨 앞에 package 선언이 올 수 있습니다.
- package 문이 있는 파일에 들어있는 모든 선언(클래스, 함수, 프로퍼티)은 해당 패키지에 속합니다.

### 1.1 패키지 선언 예시

```kotlin
package gemotry.shapes

class Rectangle(val height: Int, val width: Int) {
	val isSquare: Boolean
		get() = height == width
}

fun createUniqueSquare(): Rectangle {
	return Rectangle(1, 1)
}
```

- 파일 맨 앞에 `package gemotry.shapes`가 선언되어 있습니다.
- 이 파일에 정의된 모든 선언은 `gemotry.shapes` 패키지에 속합니다.
  - 여시서는 `Rectangle` 클래스와 `createUniqueSquare` 함수가 해당 패키지에 속합니다.

## 2. import

- 코틀린은 클래스와 함수를 구분하지 않고 import 키워드로 모든 종류의 선언을 가져올 수 있습니다.
- 같은 패키지에 속해있다면 다른 파일에 정의된 선언도 import 없이 직접 사용할 수 있습니다.
- 다른 패키지에 속해있다면 import 문을 사용해야 합니다.

### 2.1 import 예시

```kotlin
pagage gemotry.example

import gemotry.shapes.Rectangle
import gemotry.shapes.createUniqueSquare

fun main() {
	val square = createUniqueSquare()
	println("Square: ${square.isSquare}")
}
```

## 3. 디렉토리 구조

- 자바에서는 패키지의 구조와 디렉토리 구조가 일치해야 했습니다.
- 코틀린에서는 여러 클래스를 같은 파일에 넣을 수 있고, 파일의 이름도 마음대로 정할 수 있습니다.
- 코틀린에서는 디스크상의 어느 디렉토리에 소스코드 파일을 위치시키든 관계가 없습니다.
- 하지만 대부분의 경우 자바와 같이 패키지별로 디렉토리를 구성하는 것이 좋습니다.
- 특히 자바와 코틀린을 함께 사용하는 경우 자바의 방식을 따르는 것이 좋습니다.