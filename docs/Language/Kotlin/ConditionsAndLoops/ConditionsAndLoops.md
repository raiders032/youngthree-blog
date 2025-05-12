---
title: "Conditions and loops"
description: "코틀린의 조건문(if, when)과 반복문(for, while)에 대한 상세 설명과 활용법을 알아봅니다. 표현식으로서의 if, when의 다양한 사용법, 가드 조건, 그리고 효율적인 반복문 작성 방법을 실제 예제와 함께 살펴봅니다."
tags: [ "KOTLIN", "PROGRAMMING", "BACKEND", "JVM" ]
keywords: [ "코틀린", "Kotlin", "조건문", "반복문", "if문", "when문", "for문", "while문", "if expression", "when expression", "guard condition", "가드 조건", "반복", "루프", "loop", "조건부 논리", "conditional logic", "코틀린 제어문", "코틀린 분기문", "break", "continue", "범위", "range", "JVM" ]
draft: false
hide_title: true
---

## 1. 코틀린의 조건문

- 코틀린은 두 가지 주요 조건문인 `if`와 `when`을 제공합니다.
- 자바와 달리 코틀린에서 이 조건문들은 표현식(expression)으로 사용될 수 있어 값을 반환할 수 있습니다.
- 여기서 표현식이란 값을 반환하는 코드 블록을 의미합니다.
	- 반대로 구문(statement)은 값을 반환하지 않는 코드 블록을 의미합니다.

### 1.1 If 표현식

- 코틀린에서 `if`는 표현식이므로 값을 반환할 수 있습니다.
- 이로 인해 자바의 삼항 연산자(`condition ? then : else`)가 필요 없습니다.

#### 1.1.1 기본 사용법

```kotlin
// 기본 형태
var max = a
if (a < b) max = b

// else 사용
if (a > b) {
    max = a
} else {
    max = b
}

// 표현식으로 사용
max = if (a > b) a else b

// else if 사용
val maxLimit = 1
val maxOrLimit = if (maxLimit > a) maxLimit else if (a > b) a else b

println("max is $max")
println("maxOrLimit is $maxOrLimit")
```

#### 1.1.2 블록을 포함한 if 표현식

```kotlin
val max = if (a > b) {
    print("Choose a")
    a  // 블록의 마지막 표현식이 반환값이 됩니다
} else {
    print("Choose b")
    b
}
```

- `if`를 표현식으로 사용할 때(값을 반환하거나 변수에 할당할 때)는 `else` 분기가 필수입니다.
- `if` 분기에 블록을 사용하는 경우 블록의 마지막 식이 그 분기의 값이 됩니다.

### 1.2 When 표현식

- if와 마찬가지로 값을 반환할 수 있는 표현식입니다.
- `when`은 자바의 `switch`와 유사하지만 더 강력한 기능을 제공합니다.
- 여러 조건에 따라 코드를 실행하는 조건부 표현식입니다.

#### 1.2.1 기본 사용법

```kotlin
val x = 2
when (x) {
    1 -> print("x == 1")
    2 -> print("x == 2")
    else -> print("x is neither 1 nor 2")
}
```

- 자바와 달리 각 분기의 끝에 `break`를 명시할 필요가 없습니다.

#### 1.2.2 표현식과 구문으로서의 when

```kotlin
val text = when (x) {
    1 -> "x == 1"
    2 -> "x == 2"
    else -> "x is neither 1 nor 2"
}
```

- 위는 표현식으로 사용(값을 반환)한 예시입니다.

```kotlin
when (x) {
    1 -> print("x == 1")
    2 -> print("x == 2")
    else -> print("x is neither 1 nor 2")
}
```

- 구문으로 사용 (값을 반환하지 않음)한 예시입니다.

#### 1.2.3 주체가 있는 when과 없는 when

```kotlin
when(x) { ... }
```

- 위는 주체가 있는 when의 예시입니다.
- when 식의 인자로 아무 객체나 사용할 수 있습니다.
- 인자로 받은 객체가 각 분기 조건에 있는 객체와 같은지 비교합니다.
- when 식은 인자 값과 일치하는 조건 값을 찾을 때까지 각 분기를 검사합니다.
	- 분기 조건에 있는 객체를 비교할 때 동등성을 사용합니다.

```kotlin
when {
    a > b -> "a is greater than b"
    a < b -> "a is less than b"
    else -> "a is equal to b"
}
```

- 주체가 없는 when의 예시입니다.
- when에 아무 인자가 없으면 각 분기의 조건이 불리언 결과를 계산하는 식이어야 합니다.

:::warning
when을 표현식으로 사용할 때는 모든 가능한 경우를 처리해야 합니다. 즉, 철저해야(exhaustive) 합니다. 모든 경우를 처리하지 않으면 컴파일러는 오류를 발생시킵니다.
:::

#### 1.2.4 다양한 when 사용법

- 여러 조건을 한 줄에 콤마로 결합:

```kotlin
when (x) {
    0, 1 -> print("x == 0 or x == 1")
    else -> print("otherwise")
}
```

- 임의 표현식을 조건으로 사용:

```kotlin
when (x) {
    s.toInt() -> print("s encodes x")
    else -> print("s does not encode x")
}
```

- 범위나 컬렉션 내 포함 여부 확인:

```kotlin
when (x) {
    in 1..10 -> print("x is in the range")
    in validNumbers -> print("x is valid")
    !in 10..20 -> print("x is outside the range")
    else -> print("none of the above")
}
```

- 타입 확인(스마트 캐스트 지원):

```kotlin
fun hasPrefix(x: Any) = when(x) {
    is String -> x.startsWith("prefix")  // x가 자동으로 String으로 캐스팅됨
    else -> false
}
```

- if-else if 체인 대체:

```kotlin
when {
    x.isOdd() -> print("x is odd")
    y.isEven() -> print("y is even")
    else -> print("x+y is odd")
}
```

- 주체 변수 캡처:

```kotlin
fun Request.getBody() =
    when (val response = executeRequest()) {
        is Success -> response.body
        is HttpError -> throw HttpException(response.status)
    }
```

### 1.3 가드 조건(Guard Conditions)

:::note[실험적 기능]
가드 조건은 실험적 기능으로 언제든지 변경될 수 있습니다.
:::

- 가드 조건을 사용하면 when 표현식의 분기에 여러 조건을 포함할 수 있습니다.
- 주체가 있는 when 표현식이나 구문에서 사용할 수 있습니다.

#### 기본 사용법

```kotlin
sealed interface Animal {
    data class Cat(val mouseHunter: Boolean) : Animal
    data class Dog(val breed: String) : Animal
}

fun feedAnimal(animal: Animal) {
    when (animal) {
        // 기본 조건만 있는 분기
        is Animal.Dog -> feedDog()
        // 기본 조건과 가드 조건이 모두 있는 분기
        is Animal.Cat if !animal.mouseHunter -> feedCat()
        // 위 조건 중 어느 것도 일치하지 않을 경우
        else -> println("Unknown animal")
    }
}
```

#### 가드 조건의 특징

- 가드 조건이 있는 분기의 코드는 기본 조건과 가드 조건이 모두 true로 평가될 때만 실행됩니다.
- 기본 조건이 일치하지 않으면 가드 조건은 평가되지 않습니다.
- 가드 조건은 else if도 지원합니다:

```kotlin
when (animal) {
    is Animal.Dog -> feedDog()
    is Animal.Cat if !animal.mouseHunter -> feedCat()
    else if animal.eatsPlants -> giveLettuce()
    else -> println("Unknown animal")
}
```

- 논리 연산자를 사용해 여러 가드 조건을 결합할 수 있습니다:

```kotlin
when (animal) {
    is Animal.Cat if (!animal.mouseHunter && animal.hungry) -> feedCat()
}
```

#### 가드 조건 활성화 방법

- CLI에서 활성화:

```
kotlinc -Xwhen-guards main.kt
```

- Gradle에서 활성화:

```kotlin
// build.gradle.kts 파일에 추가
kotlin.compilerOptions.freeCompilerArgs.add("-Xwhen-guards")
```

## 2. 코틀린의 반복문

- 코틀린은 다양한 종류의 반복문을 제공하여 컬렉션이나 범위를 효율적으로 순회할 수 있습니다.

### 2.1 For 루프

- 코틀린의 `for` 루프는 이터레이터를 제공하는 모든 것을 순회할 수 있습니다.
- C#의 `foreach` 루프와 유사합니다.

#### 2.1.1 기본 사용법

```kotlin
for (item in collection) print(item)

// 블록을 사용한 for 루프
for (item: Int in ints) {
    // 코드
}
```

#### 2.1.2 범위를 이용한 반복

```kotlin
// 1부터 3까지 반복
for (i in 1..3) {
    print(i)
}

// 6부터 0까지 2씩 감소하며 반복
for (i in 6 downTo 0 step 2) {
    print(i)
}
// 출력: 1236420
```

#### 2.1.3 배열이나 리스트를 인덱스와 함께 순회

```kotlin
// 인덱스를 사용한 순회
for (i in array.indices) {
    print(array[i])
}

// withIndex 함수를 사용한 순회
for ((index, value) in array.withIndex()) {
    println("the element at $index is $value")
}
```

:::tip
배열이나 범위에 대한 for 루프는 인덱스 기반 루프로 컴파일되어 이터레이터 객체를 생성하지 않으므로 성능 면에서 유리합니다.
:::

### 2.2 While 루프

- 코틀린은 `while`과 `do-while` 두 가지 형태의 while 루프를 제공합니다.
- 두 루프의 차이점은 조건 검사 시점입니다.

#### 2.2.1 while 루프

```kotlin
while (x > 0) {
    x--
}
```

- 조건을 먼저 검사하고, 조건이 충족되면 본문을 처리한 후 다시 조건 검사로 돌아갑니다.

#### 2.2.2 do-while 루프

```kotlin
do {
    val y = retrieveData()
} while (y != null) // y는 여기서도 사용 가능합니다!
```

- 본문을 먼저 처리한 후 조건을 검사합니다.
- 조건이 충족되면 루프가 반복됩니다.
- do-while 루프의 본문은 조건에 관계없이 최소 한 번은 실행됩니다.

### 2.3 루프에서의 Break와 Continue

- 코틀린은 루프에서 전통적인 `break`와 `continue` 연산자를 지원합니다.
	- `break`: 가장 가까운 루프를 종료합니다.
	- `continue`: 현재 루프 반복을 건너뛰고 다음 반복으로 진행합니다.

#### 2.3.1 내포된 루프

- 내포된 루프의 경우 코틀린에서는 레이블을 지정할 수 있습니다.
- 그 후 braek이나 continue를 레이블과 함께 사용하여 특정 루프를 종료하거나 건너뛸 수 있습니다.
- 레이블은 `@` 기호 다음에 식별자를 붙인 것 입니다.

##### 예시

```kotlin
outer@ while(outerCondition) {
	while (innerCondition) {
		if (shouldExitInner) break
		if (shouldSkipInner) continue
		if (shouldExit) break@outer
		if (shouldSkip) continue@outer
	}
}
```

- 바깥 루프에 outer 레이블을 붙였습니다.
- 레이블을 지정하지 않으면 break과 continue는 가장 안쪽 루프에 적용됩니다.
- 레이블을 지정하면 break과 continue는 해당 레이블이 붙은 루프에 적용됩니다.

:::info
이러한 제어문에 대한 자세한 내용은 코틀린 공식 문서의 "Returns and jumps" 섹션에서 확인할 수 있습니다.
:::

## 3. 실전 활용 팁

### 3.1 표현식으로서의 조건문 활용

코틀린에서 조건문은 표현식이므로 다음과 같이 활용할 수 있습니다:

```kotlin
// 변수 초기화
val max = if (a > b) a else b

// 함수 반환값
fun max(a: Int, b: Int) = if (a > b) a else b

// when을 사용한 타입 체크와 변환
fun describe(obj: Any): String =
    when (obj) {
        1          -> "One"
        "Hello"    -> "Greeting"
        is Long    -> "Long number"
        !is String -> "Not a string"
        else       -> "Unknown"
    }
```

### 3.2 효율적인 반복문 작성

- 컬렉션이나 범위를 직접 순회할 때는 `for-in` 구문을 사용합니다.
- 인덱스가 필요할 때는 `indices` 속성이나 `withIndex()` 함수를 사용합니다.
- 범위에 대한 반복문에서는 `downTo`, `step`, `until` 등의 함수를 활용합니다.

```kotlin
// 10부터 1까지 2씩 감소
for (i in 10 downTo 1 step 2) {
    print("$i ")
}
// 출력: 10 8 6 4 2

// 1부터 9까지 (10 미만)
for (i in 1 until 10) {
    print("$i ")
}
// 출력: 1 2 3 4 5 6 7