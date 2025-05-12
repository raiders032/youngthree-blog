---
title: "Functions"
description: "코틀린 함수의 기본 개념부터 고급 기능까지 상세히 알아봅니다. 최상위 함수, 중위 함수, 가변 인자, 디폴트 파라미터 등 코틀린의 함수 기능을 Java와 비교하며 실제 예제 코드와 함께 설명합니다. 자바 개발자가 코틀린으로 쉽게 전환할 수 있는 실용적인 가이드입니다."
tags: ["KOTLIN", "FUNCTION", "NAMED_ARGUMENT", "DEFAULT_PARAMETER", "PROGRAMMING", "JVM", "JAVA"]
keywords: ["코틀린", "kotlin", "코틀린 함수", "kotlin function", "최상위 함수", "top-level function", "중위 함수", "infix function", "가변 인자", "vararg", "디폴트 파라미터", "default parameter", "named argument", "이름 있는 인자", "로컬 함수", "local function", "함수형 프로그래밍", "functional programming", "JVM", "자바", "java"]
draft: false
hide_title: true
---

## 1 Functions

- 코틀린의 함수는 `fun` 키워드를 사용해 함수를 정의합니다.
- 파라미터 이름 뒤에 그 파라미터의 타입을 명시합니다.
- 함수를 최상위 수준에 정의할 수 있습니다.
	- 꼭 클래스 안에 함수를 넣어야 할 필요가 없습니다.
	- 이를 `최상위 함수`라고 합니다.
- 함수의 반환 타입은 파라미터 목록을 닫는 괄호 다음에 콜론과 함께 위치합니다.

**예시**

```kotlin
fun double(x: Int): Int {
    return 2 * x
}
```

## 2 expression이 본문인 함수

### 2.1 expression과 statement의 차이

- 식(expression)은 `값을 만들어` 내며 다른 식의 하위 요소로 계산에 참여할 수 있습니다.
- 문(statement)은 자신을 둘러싸고 있는 가장 안쪽 블록의 최상위 요소로 존재하며 `아무런 값을 만들어내지 않는다`.
	- 식(expression)과의 차이점은 값을 만들어내지 않는다는 점입니다.
- 자바에서는 모든 제어 구조가 문인 반면에 코틀린에서는 루프를 제외한 모든 제어 구조가 식입니다.

### 2.2 블록이 본문인 함수(Explicit return types)

- [레퍼런스](https://kotlinlang.org/docs/functions.html#explicit-return-types)
- 코틀린 에서 if 문은 expression(식)입니다.
- 아래는 `블록이 본문인 함수(block body function)`라고 합니다.
	- 본문이 중괄호로 둘러싸인 함수를 의미합니다.
- 블록이 본문인 함수는 **반환 타입을 명시적으로 지정**해야 합니다.

#### 예시

```kotlin
fun max(a: Int, b: Int): Int {
  return if (a > b) a else b
}
```

- 위의 예시에서 `return` 키워드를 사용하여 값을 명시적으로 반환하고 있습니다.

### 2.3 식이 본문인 함수(Single-expression functions)

- [레퍼런스](https://kotlinlang.org/docs/functions.html#single-expression-functions)
- 위에서 본 것과 같이 함수 본문이 식 하나로 이루어진 경우 아래와 같이 간결하게 표현할 수 있습니다.
- 아래와 같은 함수를 `식이 본문인 함수(expression body function)`라고 합니다.
	- 등호와 식으로 이루어진 함수를 의미합니다.
- 식이 본문인 경우 **반환 타입을 추론할 수 있어 생략 가능**합니다.
	- 실제로 모든 변수나 모든 식에는 타입이 있으며, 모든 함수는 반환타입이 정해져야 합니다.
	- 컴파일러가 함수 본문 식을 분석해서 식의 결과 타입을 함수 반환 타입으로 정해줍니다. 이를 `타입 추론(type inference)`이라고 합니다.

#### 예시

```kotlin
fun max(a: Int, b: Int) = if (a > b) a else b
```

- 식이 본문이 함수를 정의하고 반환 타입을 생략했습니다.
- 이 경우 컴파일러가 반환 타입을 `Int`로 추론합니다.

## 3 Parameters

- [레퍼런스](https://kotlinlang.org/docs/functions.html#parameters)
- 함수의 파라미터들은 `, ` 를 기준으로 분리합니다.

```kotlin
fun powerOf(number: Int, exponent: Int): Int { /*...*/ }
```

## 4 Named arguments

- [레퍼런스](https://kotlinlang.org/docs/functions.html#named-arguments)
- 코틀린으로 작성한 함수를 호출할 때는 인자 중 일부의 이름을 명시할 수 있다.
- 어느 하나라도 이름을 명시하고 나면 혼동을 막기 위해 그 뒤에 오는 모든 인자는 이름을 꼭 명시해야 한다

**예시**

```kotlin
fun <T> joinToString(
    collection: Collection<T>,
    separator: String,
    prefix: String,
    postfix: String
)
```

```kotlin
joinToString(collection, " ", "", ".")
joinToString(collection, separator = " ", prefix = "", postfix = ".")
```

## 5 Default arguments

- [레퍼런스](https://kotlinlang.org/docs/functions.html#default-arguments)
- 자바에서는 일부 클래스에서 오버로딩한 메서드가 너무 많아진다는 문제가 있습니다.
- 코틀린에서는 함수 선언에서 파라미터의 디폴트 값을 지정할 수 있으므로 이런 오버로드 중 상당수를 피할 수 있습니다.
- 함수의 디폴트 파라미터는 함수 선언 쪽에서 지정합니다.
	- 따라서 함수의 디폴트 값을 변경하면 해당 함수를 호출하는 코드 중에 값을 지정하지 않는 모든 인자는 자동으로 바뀐 디폴트 값을 적용받습니다.

### 5.1 예시

```kotlin
fun <T> joinToString(
    collection: Collection<T>,
    separator: String = ", ",
    prefix: String = "",
    postfix: String = ""
)
```

- separator, prefix, postfix에 디폴트 값을 지정했습니다.

```kotlin
joinToString(list)
joinToString(list, postfix = ".", prefix = "")
```

- 호출할 때 디폴트 파라미터 값이 있는 인자를 생략할 수 있습니다.
- 이름 붙인 인자 붙여서 사용하면 순서와 관계없이 지정할 수 있습니다.
	- 예를 들어, `joinToString(list, postfix = ".", prefix = "")`와 같이 지정할 수 있습니다.
- 일반 호출 문법을 사용할 때는 함수를 선언할 때와 같은 순서로 인자를 지정해야 합니다.
	- 이 경우 일부를 생략하고 싶을 때 뒤쪽의 연속적으로 인자들을 생략할 수 있습니다.
	- 예를 들어, `joinToString(list, ", ")`와 같이 collection과 separator를 지정하고 나머지 인자들은 생략할 수 있습니다.

## 6 최상위 함수

- 자바에서는 모든 코드를 클래스의 메서드로 작성해야 합니다.
- 그 결과 다양한 정적 메서드를 모아두는 역할만 담당하는 클래스인 유틸리티 클래스가 생겨났습니다.
	- 유틸리티 클래스: 상태나 인스턴스 메서드는 없는 클래스
	- JDK의 Collections 클래스가 전형적인 예시
- 코틀린에서는 이런 무의미한 클래스가 필요 없습니다.
- 대신 함수를 직접 소스 파일의 최상위 수준, 모든 클래스의 밖에 위치시키면 됩니다.

### 6.1 최상위 함수 정의하기

```kotlin
@JvmName("StringsFuctions")
package strings

fun joinToString(): String {...}
```

- 위와 같이 join.kt 파일을 정의하면 joinToString이라는 최상위 함수를 정의한 것입니다.

### 6.2 가능한 이유

- JVM이 클래스 안에 들어있는 코드만 실행할 수 있기 때문에 컴파일러가 이 파일을 컴파일 할 때 새로운 클래스를 정의해줍니다.
	- 코틀린만 사용하는 경우 위 사실만 기억하면 됩니다.
- **join.kt** 파일을 컴파일한 결과와 같은 자바 코드는 아래와 같습니다.
- 코틀린 컴파일러가 생성하는 클래스의 이름은 소스 파일의 이름과 대응됩니다.

```java
package strings;

public class JoinKt {
  public static String joinToString(...) {...}
}
```

### 6.3 최상위 함수를 자바에서 사용하기

```java
import strings.JoinKt;

JoinKt.joinToString(list, ", ", "", "");
```

### 6.4 파일에 대응하는 클래스의 이름 변경

- 파일에 대응하는 클래스의 이름을 변경하려면 코틀린 파일 최상단에 @JvmName 애노테이션을 사용합니다.
- 해당 애노테이션은 파일의 맨 앞, 패키지 이름 선언 앞에 위치해야 합니다.

```kotlin
@JvmName("StringsFuctions")
package strings

fun joinToString(): String {...}
```

```java
import strings.StringsFuctions;

StringsFuctions.joinToString(list, ", ", "", "");
```

## 7 Variable number of arguments

- [레퍼런스](https://kotlinlang.org/docs/functions.html#variable-number-of-arguments-varargs)
- 가변 인자 함수
- var 키워드를 사용하면 호출 시 인자 개수가 달라질 수 있는 함수를 정의할 수 있다.

**예시**

```kotlin
fun <T> asList(vararg ts: T): List<T> {
    val result = ArrayList<T>()
    for (t in ts) // ts is an Array
        result.add(t)
    return result
}
```

```kotlin
val list = asList(1, 2, 3)
```

**가변 길이 인자로 배열 넘기기**

- 이미 배열에 들어있는 원소를 가변 길이 인자로 넘길 때 자바와 코틀린이 다르다.
- 자바에서는 배열을 그냥 넘기면 되지만 코틀린에서는 배열을 명시적으로 풀어서 배열의 각 원소가 인자로 전달되어야 한다.
- 이때 스프레드 연산자를 사용한다.
	- 배열 앞에 `*`를 붙이면 된다.

```kotlin
fun main(args: Array<String>){
  val list = listOf("args:", *args)
  print(list)
}
```

## 8 중위 함수 호출

- [레퍼런스](https://kotlinlang.org/docs/functions.html#infix-notation)
- 중위 함수 호출 구문을 사용하면 인자가 하나뿐인 메서드를 간편하게 호출할 수 있습니다.

### 8.1 중위 함수 호출 예시

```kotlin
val map = mapOf(1 to "one", 2 to "two", 53 to "fifty-three")
```

- 맵을 만들 때 위와 같이 mapOf 함수를 이용합니다.
- 여기서 to는 코틀린 키워드가 아닙니다.
- 이 코드는 중위 호출이라는 특별한 방식으로 **to라는 일반 메서드**를 호출한 것입니다.

### 8.2 중위 함수 호출 하기

- 수신 객체와 유일한 메서드 인자 사이에 메서드 이름을 넣는 방식으로 호출합니다.
- 중위 호출은 인자가 하나뿐인 일반 메서드나 확장 함수에 적용할 수 있습니다.

```kotlin
// to 메서드를 일반적인 방식으로 호출한다.
1.to("one")

// 위 방식을 중위 호출 방식 변경했다.
1 to "one"
```

- 위의 두 코드는 같은 의미입니다.

### 8.3 함수에 중위 호출 적용하기

- 함수에 `infix` 변경자를 함수 선언 앞에 붙이면 중위 호출이 가능해집니다.
- 모든 함수에 중위 호출은 적용할 수 없고 아래의 모든 조건을 만족할 때 infix 키워드를 적용할 수 있습니다.
	- 함수 또는 확장 함수
	- 하나의 파라미터
	- 파라미터는 가변 인자가 아니다.
	- 파라미터가 디폴트 값을 가지고 있지 않다.

```kotlin
infix fun Int.shl(x: Int): Int { ... }

// calling the function using the infix notation
1 shl 2

// is the same as
1.shl(2)
```

## 9 로컬 함수

- 코틀린에서는 함수에서 추출한 함수를 원 함수 내부에 중첩시킬 수 있습니다.
- 중첩된 함수를 로컬 함수라고 합니다.
- 로컬 함수는 자신이 속한 바깥 함수의 모든 파라미터와 변수를 사용할 수 있습니다.

### 9.1 로컬 함수 예시

```kotlin
fun parsePath(path: String) {
		fun parseNode(node: String) { /*...*/ }
		fun parseLeaf(leaf: String) { /*...*/ }

		val parts = path.split("/")
		for (part in parts) {
				if (part.startsWith("node")) {
						parseNode(part)
				} else {
						parseLeaf(part)
				}
		}
}
```

- 위의 예시에서 parseNode와 parseLeaf는 로컬 함수입니다.
- parsePath 함수의 파라미터와 변수를 사용할 수 있습니다.
