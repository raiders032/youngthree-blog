---
title: "Collection"
description: "코틀린의 컬렉션 타입들을 상세히 알아봅니다. List, Set, Map 등 각 컬렉션의 특징과 사용법을 실제 예제와 함께 설명합니다. 불변/가변 컬렉션의 차이점과 ArrayDeque까지 다루는 포괄적인 가이드입니다."
tags: [ "KOTLIN", "DATA_STRUCTURE", "ALGORITHM", "BACKEND", "JVM" ]
keywords: [ "코틀린", "kotlin", "컬렉션", "collection", "리스트", "list", "셋", "set", "맵", "map", "자료구조", "data structure", "어레이덱", "arraydeque", "불변컬렉션", "가변컬렉션" ]
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

## 4. Colletion API

### 4.1 filter

- filter는 컬렉션에서 조건에 맞는 요소만을 추출하는 함수입니다.
- filter 함수는 컬렉션을 순회하면서 주어진 람다가 true를 반환하는 요소만을 포함하는 새로운 컬렉션을 생성합니다.
- 걸러내는 원소의 값 뿐 아니라 인덱스도 필요할 때는 `filterIndexed`를 사용합니다.
- 맵의 경우 키와 값을 처리하는 함수가 따로 존재합니다. `filterKeys`, `filterValues`를 사용합니다.

```kotlin
fun main() {
val list = listOf(1, 2, 3, 4)
println(list.filter { it % 2 == 0 })
// [2, 4]
```

- 위의 예제에서, filter 함수는 리스트에서 짝수인 요소만을 추출하여 새로운 리스트를 반환합니다.

### 4.2 map

- map은 컬렉션의 각 요소에 대해 주어진 변환 함수를 적용하여 새로운 컬렉션을 생성하는 함수입니다.
- 변환하는 연산이 원소의 값 뿐 아니라 인덱스도 필요할 때는 `mapIndexed`를 사용합니다.
- 맵의 경우 키와 값을 처리하는 함수가 따로 존재합니다. `mapKeys`, `mapValues`를 사용합니다.

```kotlin
fun main() {
	val list = listOf(1, 2, 3, 4)
	println(list.map { it * it })
	// [1, 4, 9, 16]
}
```

- 위의 예제에서, map 함수는 리스트의 각 요소를 제곱하여 새로운 리스트를 반환합니다.

### 4.3 reduce

- reduce는 컬렉션의 모든 요소를 하나의 값으로 축약하는 함수입니다.
	- 컬렉션의 정보를 종합하는데 유용합니다.
- 이 값은 누적기를 통해 점진적으로 만들어집니다.
- reduce 함수는 초깃값으로 컬렉션의 첫 번째 요소를 사용하며, 두 번째 요소부터 주어진 연산을 적용합니다.
- reduce 함수는 컬렉션이 비어있으면 NoSuchElementException을 발생시킵니다.
	- 빈 컬렉션에서도 안전하게 사용하려면 reduceOrNull 또는 fold를 사용해야 합니다.

#### 4.3.1 reduce의 동작 과정

- 첫 번째 요소가 초기 누적값(accumulator)이 됩니다.
- 두 번째 요소부터 순회하면서 누적값과 현재 요소에 대해 지정된 연산을 수행합니다.
- 연산 결과가 새로운 누적값이 됩니다.
- 모든 요소를 처리한 후 최종 누적값을 반환합니다.

```kotlin
fun main() {
  val numbers = listOf(1, 2, 3, 4)
  
  val sum = numbers.reduce { acc, n -> 
    println("누적값: $acc, 현재 요소: $n, 연산 결과: ${acc + n}")
    acc + n 
  }
  
  println("최종 결과: $sum")
}
```

```text
누적값: 1, 현재 요소: 2, 연산 결과: 3
누적값: 3, 현재 요소: 3, 연산 결과: 6
누적값: 6, 현재 요소: 4, 연산 결과: 10
최종 결과: 10
```

#### 4.3.2 fold와의 차이점

- fold는 reduce와 유사하지만 초기값을 명시적으로 제공할 수 있습니다.
- 따라서 빈 컬렉션에 대해서도 안전하게 사용할 수 있습니다.

```kotlin
fun main() {
  val numbers = listOf(1, 2, 3, 4)
  
  val sumWithFold = numbers.fold(10) { acc, n ->
    println("누적값: $acc, 현재 요소: $n, 연산 결과: ${acc + n}")
    acc + n
  }
  
  println("최종 결과: $sumWithFold")
}
```

```text
누적값: 10, 현재 요소: 1, 연산 결과: 11
누적값: 11, 현재 요소: 2, 연산 결과: 13
누적값: 13, 현재 요소: 3, 연산 결과: 16
누적값: 16, 현재 요소: 4, 연산 결과: 20
최종 결과: 20
```

#### 4.3.3 다양한 reduce 변형 함수들

- runningReduce: 각 단계에서의 누적값을 포함하는 리스트를 반환합니다.
- reduceRight: 컬렉션의 마지막 요소부터 시작하여 역순으로 연산을 수행합니다.
- reduceIndexed: 각 요소의 인덱스 정보도 함께 제공합니다.
- reduceRightIndexed: reduceRight의 인덱스 제공 버전입니다.

### 4.4 컬렉션에 Predicate 적용

- 컬렉션에 자주 수행하는 연산으로 컬렉션의 모든 원소가 어떤 조건을 만족하는지 판단하는 것이 있습니다.
- 코틀린에서는 all, any, none, count, find 등의 함수를 제공합니다.
- all: 모든 원소가 조건을 만족하는지 확인합니다.
- any: 하나라도 조건을 만족하는지 확인합니다.
- none: 모든 원소가 조건을 만족하지 않는지 확인합니다.
- count: 조건을 만족하는 원소의 개수를 반환합니다.
- find: 조건을 만족하는 첫 번째 원소를 반환합니다. 없으면 null을 반환합니다.
	- firstOrNull과 같은 기능입니다.

```kotlin
fun main() {
 val people = listOf(Person("Alice", 27), Person("Bob", 31))
 
 println(people.all { it.age <= 27 }) // false
 println(people.any { it.age <= 27 }) // true
 println(people.none { it.age <= 27 }) // false
 println(people.count { it.age <= 27 }) // 1
 println(people.find { it.age <= 27 }) // Person(name=Alice, age=27)
}
```

### 4.5 partition

- partition은 컬렉션을 두 개의 리스트로 나누는 함수입니다.
- 컬렉션을 어떤 Predicate을 만족하는 그룹과 그렇지 않은 그룹으로 나눌 때 유용합니다.

```kotlin
fun main() {
	val people = listOf(Person("Alice", 26), Person("Bob", 29), Person("Carol", 31))
	val comeIn = people.filer(canBeInClub27)
	val stayOut = people.filterNot(canBeInClub27)
	println(comeIn) // [Person(name=Alice, age=26)]
	println(stayOut) // [Person(name=Bob, age=29), Person(name=Carol, age=31)]
}
```

- predicate를 만족하는 원소는 comeIn 리스트에, 그렇지 않은 원소는 stayOut 리스트에 저장됩니다.
- 위 예시는 두 개의 리스트를 위해 전체 컬렉션을 두 번 순회합니다.

```kotlin
val (comeIn, stayOut) = people.partition(canBeInClub27)
println(comeIn) // [Person(name=Alice, age=26)]
println(stayOut) // [Person(name=Bob, age=29), Person(name=Carol, age=31)]
```

- partition은 컬렉션을 한 번만 순회하여 두 개의 리스트를 생성합니다.

### 4.6 groupBy

- groupBy는 컬렉션의 요소를 특정 키에 따라 그룹화하는 함수입니다.
  - partition과 유사하지만, partition은 `true`와 `false`로 나누는 반면, groupBy는 다양한 키로 그룹화할 수 있습니다.
  - 예를 들어, 사람을 나이에 따라 그룹화할 수 있습니다.

```kotlin
fun main() {
	val list = listOf("apple", "apricot", "banana", "cantaloupe")
	println(list.groupBy { String::first))
	// {a=[apple, apricot], b=[banana], c=[cantaloupe]}
}
```

- 위 예제에서, groupBy는 각 문자열의 첫 글자를 키로 사용하여 문자열을 그룹화합니다.

### 4.7 associate

- associate는 컬렉션의 각 요소를 키-값 쌍으로 변환하여 Map으로 만드는 함수입니다.

```kotlin
fun main() {
	val people = listOf(Person("Joe", 22), Person("Mary", 31))
	val nameToAge = people.associateBy { it.name to it.age }
	println(nameToAge) // {Joe=22, Mary=31}
	println(nameToAge["Joe"]) // 22
}
```

#### 4.7.1 associateWith & associateBy

- associateWith는 각 요소를 키로 사용하고, 제공된 람다는 각 요소에 대응하는 값을 만드는데 사용됩니다.
- associateBy는 각 요소를 맵의 값으로하고, 제공된 람다는 각 요소에 대응하는 키를 만드는데 사용됩니다.

##### 예시

```kotlin
fun main() {
	val people = listOf(Person("Joe", 22), Person("Mary", 31), Person("Jamie, 22))
	val personToAge = people.associateWith { it.age } // 람다는 값을 만드는 역할
	println(personToAge) // {Person(name=Joe, age=22)=22, Person(name=Mary, age=31)=31, Person(name=Jamie, age=22)=22}
	
	val ageToPerson = people.associateBy { it.age } // 람다는 키를 만드는 역할
	println(ageToPerson) // {22=Person(name=Jamie, age=22), 31=Person(name=Mary, age=31)}
}
```

- 위 예제에서, associateWith는 각 Person 객체를 키로 사용하고, age를 값으로 사용하여 Map을 생성합니다.
- associateBy는 각 Person 객체의 age를 키로 사용하고, Person 객체를 값으로 사용하여 Map을 생성합니다.
- 맵에서는 키는 유일하기 때문에 변환 함수가 중복된 키를 생성하면 마지막에 생성된 값만 남게 됩니다.
 
## 5. 마치며

- 코틀린의 컬렉션 시스템은 불변/가변 인터페이스의 명확한 구분과 풍부한 표준 라이브러리 함수를 통해 안전하고 효율적인 데이터 처리를 가능하게 합니다.
- 각 컬렉션 타입의 특성을 이해하고 적절히 활용하면, 더 견고하고 유지보수하기 쉬운 코드를 작성할 수 있습니다.