---
title: "Collection"
description: "코틀린의 컬렉션 타입들을 상세히 알아봅니다. List, Set, Map 등 각 컬렉션의 특징과 사용법을 실제 예제와 함께 설명합니다. 불변/가변 컬렉션의 차이점과 ArrayDeque까지 다루는 포괄적인 가이드입니다."
tags: ["KOTLIN", "DATA_STRUCTURE", "ALGORITHM", "BACKEND", "JVM"]
keywords: ["코틀린", "kotlin", "컬렉션", "collection", "리스트", "list", "셋", "set", "맵", "map", "자료구조", "data structure", "어레이덱", "arraydeque", "불변컬렉션", "가변컬렉션"]
draft: false
hide_title: true
---

## 1. 코틀린 컬렉션의 이해

### 1.1 컬렉션이란?
- 코틀린의 컬렉션은 프로그램에서 여러 개의 데이터를 효율적으로 관리하고 처리하기 위한 자료구조입니다. 
- 컬렉션은 동일한 타입(및 해당 타입의 하위 타입)의 객체들을 그룹으로 저장하고 처리할 수 있게 해줍니다.

:::note
코틀린의 컬렉션은 Java나 Python 등 다른 언어의 컬렉션과 개념적으로 유사하지만, 불변(Immutable)과 가변(Mutable) 컬렉션을 명확히 구분한다는 특징이 있습니다.
:::

### 1.2 코틀린 컬렉션의 주요 특징
- 코틀린의 컬렉션은 다음과 같은 주요 특징을 가집니다:
  - 불변/가변 인터페이스 분리
  - 타입 파라미터의 공변성(Covariance) 지원
  - 풍부한 표준 라이브러리 함수 제공
  - Null 안전성 보장

## 2. 컬렉션의 종류

### 2.1 List
- List는 순서가 있는 컬렉션으로, 동일한 요소의 중복을 허용합니다.

#### 불변 List 사용 예시

```kotlin
val numbers = listOf("one", "two", "three", "four")
println("Number of elements: ${numbers.size}")
println("Third element: ${numbers[2]}")
println("Index of element \"two\": ${numbers.indexOf("two")}")
```

#### 가변 List 사용 예시

```kotlin
val numbers = mutableListOf(1, 2, 3, 4)
numbers.add(5)
numbers.removeAt(1)
numbers[0] = 0
println(numbers)
```

:::tip
코틀린의 MutableList의 기본 구현체는 ArrayList입니다. ArrayList는 내부적으로 크기가 조절되는 배열을 사용하여 구현되어 있습니다.
:::

### 2.2 Set
- Set은 중복을 허용하지 않는 컬렉션입니다. 
- 요소의 순서는 일반적으로 중요하지 않습니다.

#### 불변 Set 예시

```kotlin
val numbers = setOf(1, 2, 3, 4)
println("Number of elements: ${numbers.size}")
if (numbers.contains(1)) println("1 is in the set")

val numbersBackwards = setOf(4, 3, 2, 1)
println("The sets are equal: ${numbers == numbersBackwards}")
```

:::info
LinkedHashSet은 요소의 삽입 순서를 보존하는 반면, HashSet은 순서를 보장하지 않지만 메모리를 더 효율적으로 사용합니다.
:::

### 2.3 Map
- Map은 키-값 쌍을 저장하는 컬렉션입니다. 
- 키는 고유해야 하지만, 값은 중복될 수 있습니다.

#### 불변 Map 예시

```kotlin
val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3)
println("All keys: ${numbersMap.keys}")
println("All values: ${numbersMap.values}")
println("Value by key 'key2': ${numbersMap["key2"]}")
```

#### 가변 Map 예시

```kotlin
val numbersMap = mutableMapOf("one" to 1, "two" to 2)
numbersMap.put("three", 3)
numbersMap["one"] = 11
println(numbersMap)
```

### 2.4 ArrayDeque

ArrayDeque는 양방향 큐의 구현체로, 배열 기반의 자료구조입니다. 스택이나 큐로도 활용할 수 있습니다.

```kotlin
val deque = ArrayDeque(listOf(1, 2, 3))
deque.addFirst(0)
deque.addLast(4)
println(deque) // [0, 1, 2, 3, 4]

println(deque.first()) // 0
println(deque.last()) // 4
```

## 3. 컬렉션 선택 가이드
- 각 상황에 맞는 컬렉션 선택을 위한 가이드라인입니다:
  - 순서가 중요하고 중복을 허용해야 할 때: List 사용
  - 고유한 요소만 필요할 때: Set 사용
  - 키-값 쌍으로 데이터를 관리해야 할 때: Map 사용
  - 양쪽 끝에서의 빠른 삽입/삭제가 필요할 때: ArrayDeque 사용

:::warning
가변 컬렉션을 val로 선언해도 내부 요소는 변경할 수 있습니다. 하지만 참조 자체는 변경할 수 없으므로, 가능한 한 val을 사용하는 것이 안전합니다.
:::

## 4. 마치며
- 코틀린의 컬렉션 시스템은 불변/가변 인터페이스의 명확한 구분과 풍부한 표준 라이브러리 함수를 통해 안전하고 효율적인 데이터 처리를 가능하게 합니다. 
- 각 컬렉션 타입의 특성을 이해하고 적절히 활용하면, 더 견고하고 유지보수하기 쉬운 코드를 작성할 수 있습니다.