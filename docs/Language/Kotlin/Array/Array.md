---
title: "Array"
description: "코틀린의 배열(Array)을 상세히 알아봅니다. 기본 개념부터 생성 방법, 활용 사례, 그리고 컬렉션과의 비교까지 실제 예제와 함께 살펴봅니다. 프리미티브 타입 배열의 성능상 이점과 실전에서의 올바른 사용법을 다룹니다."
tags: ["ARRAY", "DATA_STRUCTURE", "ALGORITHM", "TIME_COMPLEXITY"]
keywords: ["코틀린", "kotlin", "배열", "array", "자료구조", "data structure", "프리미티브배열", "primitive array", "다차원배열", "multidimensional array", "컬렉션", "collection"]
draft: false
hide_title: true
---

## 1. 코틀린 배열의 이해

### 1.1 배열의 개념과 특징
- 배열은 동일한 타입(또는 하위 타입)의 값들을 고정된 크기로 저장하는 자료구조입니다. 
- 코틀린에서 가장 일반적인 배열 형태는 `Array` 클래스로 표현되는 객체형 배열입니다.

:::info
코틀린의 배열은 항상 가변(mutable)이며, 크기가 고정되어 있다는 특징이 있습니다. 이는 다른 컬렉션 타입들과 구별되는 중요한 특성입니다.
:::

### 1.2 배열과 컬렉션의 차이
- 코틀린에서는 대부분의 경우 컬렉션 사용을 권장합니다.
- 배열은 다음과 같은 특별한 요구사항이 있을 때 사용합니다:
  - 저수준(low-level) 요구사항이 있는 경우
  - 특별한 성능 최적화가 필요한 경우
  - 커스텀 자료구조 구현이 필요한 경우

:::tip
컬렉션의 장점:
- 읽기 전용(read-only) 컬렉션 지원으로 코드의 의도를 명확히 표현
- 요소의 추가/제거가 용이
- 구조적 동등성 비교(==) 연산자 사용 가능
:::

## 2. 배열 생성하기

### 2.1 기본 생성 방법
- 코틀린에서 배열을 생성하는 방법에는 여러 가지가 있습니다

#### arrayOf() 함수 사용
```kotlin
// [1, 2, 3] 값을 가진 배열 생성
val simpleArray = arrayOf(1, 2, 3)
```

#### arrayOfNulls() 함수 사용
```kotlin
// null로 채워진 크기 3의 배열 생성
val nullArray: Array<Int?> = arrayOfNulls(3)
```

#### Array 생성자 사용
```kotlin
// 인덱스의 제곱값을 문자열로 가지는 배열 생성
val squareArray = Array(5) { i -> (i * i).toString() }
// 결과: ["0", "1", "4", "9", "16"]
```

### 2.2 다차원 배열 생성
- 코틀린에서는 배열을 중첩하여 다차원 배열을 만들 수 있습니다:

```kotlin
// 2차원 배열 생성
val twoDArray = Array(2) { Array<Int>(2) { 0 } }
// 결과: [[0, 0], [0, 0]]

// 3차원 배열 생성
val threeDArray = Array(3) { Array(3) { Array<Int>(3) { 0 } } }
```

:::note
다차원 배열의 각 차원은 서로 다른 타입이나 크기를 가질 수 있습니다.
:::

## 3. 배열의 활용

### 3.1 요소 접근과 수정
- 배열의 요소는 인덱스 연산자 `[]`를 사용하여 접근하고 수정할 수 있습니다:

```kotlin
val simpleArray = arrayOf(1, 2, 3)
simpleArray[0] = 10 // 첫 번째 요소를 10으로 변경
```

### 3.2 가변 인자 함수에서의 활용
- 배열은 가변 인자(vararg) 함수에 스프레드 연산자(*)를 사용하여 전달할 수 있습니다:

```kotlin
fun printAll(vararg strings: String) {
    strings.forEach { print(it) }
}

val letters = arrayOf("c", "d")
printAll("a", "b", *letters) // abcd 출력
```

### 3.3 배열 변환 함수들

#### 배열 요소의 합계
```kotlin
val numbers = arrayOf(1, 2, 3)
println(numbers.sum()) // 6 출력
```

#### 배열 요소 섞기
```kotlin
val numbers = arrayOf(1, 2, 3)
numbers.shuffle() // 요소들의 순서가 무작위로 변경됨
```

## 4. 프리미티브 타입 배열
- 만약 `Array` 클래스를 프리미티브 값과 함께 사용하면 박싱(boxing) 오버헤드가 발생합니다.
  - 프리미티브 값이 객체로 박싱되어 메모리 사용량이 증가하고 성능이 저하됩니다.
- 박싱 오버헤드를 피하기 위해 코틀린은 프리미티브 타입 배열을 제공합니다.

**`Array<T>`와 프리미티브 배열의 차이**
```kotlin
// Array<Boolean>의 경우 각 요소가 Boolean 객체로 박싱됨
val boxedArray = Array<Boolean>(5) { false }

// BooleanArray의 경우 프리미티브 boolean 값을 직접 저장
val primitiveArray = BooleanArray(5)
```

### 4.1 개요와 종류
- 코틀린은 박싱 오버헤드를 피하기 위한 프리미티브 타입 배열을 제공합니다
  - `BooleanArray`: Java의 `boolean[]`에 대응
  - `ByteArray`: Java의 `byte[]`에 대응
  - `CharArray`: Java의 `char[]`에 대응
  - `DoubleArray`: Java의 `double[]`에 대응
  - `FloatArray`: Java의 `float[]`에 대응
  - `IntArray`: Java의 `int[]`에 대응
  - `LongArray`: Java의 `long[]`에 대응
  - `ShortArray`: Java의 `short[]`에 대응

:::warning
일반 `Array` 클래스를 프리미티브 값과 함께 사용하면 각 요소가 객체로 박싱되어 메모리 사용량이 증가하고 성능이 저하됩니다. 성능이 중요한 경우 반드시 프리미티브 타입 배열을 사용하세요.
:::

### 4.2 프리미티브 배열 생성 예시

```kotlin
// 크기가 5인 Int 배열 생성 (0으로 초기화)
val intArray = IntArray(5)

// 특정 값으로 초기화
val anotherIntArray = IntArray(5) { 42 }

// 인덱스 기반 초기화
val indexBasedArray = IntArray(5) { it * 2 }
```

## 5. 배열과 컬렉션 간의 변환

### 5.1 List나 Set으로 변환

```kotlin
val array = arrayOf("a", "b", "c", "c")
val list = array.toList() // [a, b, c, c]
val set = array.toSet()   // [a, b, c]
```

### 5.2 Map으로 변환

```kotlin
val pairArray = arrayOf("apple" to 120, "banana" to 150)
val map = pairArray.toMap() // {apple=120, banana=150}
```

## 6. 실전 활용 팁

### 6.1 배열 사용이 적절한 경우
- 고정된 크기의 데이터 구조가 필요할 때
- 성능이 매우 중요한 연산에서
- 저수준 API와의 상호운용성이 필요할 때

### 6.2 컬렉션 사용이 적절한 경우
- 동적으로 크기가 변하는 데이터 구조가 필요할 때
- 불변성이 중요할 때
- 고수준의 함수형 연산이 필요할 때

:::tip
실제 개발에서는 특별한 이유가 없다면 컬렉션 사용을 우선 고려하세요. 배열은 특수한 요구사항이 있을 때 선택적으로 사용하는 것이 좋습니다.
:::

## 7. 마치며
- 코틀린의 배열은 강력하면서도 주의가 필요한 자료구조입니다. 
- 고정된 크기와 가변성이라는 특성을 잘 이해하고, 적절한 상황에서 활용하는 것이 중요합니다. 
- 대부분의 일반적인 상황에서는 컬렉션을 사용하되, 성능이나 저수준 작업이 필요한 특수한 경우에 배열을 선택적으로 활용하시기 바랍니다.