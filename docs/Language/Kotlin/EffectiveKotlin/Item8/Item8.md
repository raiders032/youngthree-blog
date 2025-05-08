## 1. Item 8: 적절하게 null을 처리하라

- null은 `값이 부족하다`는 것을 의미합니다.
- 프로퍼티가 null이라는 것은 값이 설정되지 않았거나, 제거되었다는 것을 나타냅니다.
- 함수가 null을 반환한다는 것은 여러 의미를 가질 수 있습니다.
	- String.toIntOrNull()은 String으로 적절하게 변환할 수 없는 경우 null을 반환합니다.
	- Iterable.firstOrNull(() -> Boolean)과 같이 조건을 만족하는 첫 번째 요소를 찾지 못한 경우 null을 반환합니다.
- 이처럼 null은 여러 의미를 가질 수 있습니다. 이는 처리하는 사람은 API 사용자입니다.

## 2. null을 처리하는 방법

- 기본적으로 nullable 타입은 세 가지 방법은로 처리할 수 있습니다.
	- `?.`, 스마트 캐스팅, Elvis 연산자를 이용해 안전하게 null을 처리할 수 있습니다.
	- 오류를 throw하는 방법도 있습니다.
	- 함수 또는 프로퍼티를 리팩터링해서 nullable 타입이 아니도록 만들 수 있습니다.

## 3. Safe Call

- 이전에 언급한 것처럼 null을 안전하게 처리하는 방법은 `?.`를 사용하는 것입니다.
- 애플리케이션 사용자의 관점에서 가장 안전한 방법입니다.
- 개발자에게도 편리한 방법입니다.
- 이 방식을 가장 많이 사용합니다.

### 3.1 예시

```koltlin
printer?.print()
```

- 위 코드는 printer가 null이 아닐 때만 print()를 호출합니다.

## 4. 스마트 캐스팅

- 스마트 캐스팅은 코틀린이 제공하는 강력한 타입 검사 기능으로, 특정 조건에서 컴파일러가 자동으로 타입 변환을 처리해주는 기능입니다.

:::info
스마트 캐스트란 간단히 말해, 코틀린이 타입을 자동으로 변환해주는 기능입니다.
예를 들어, 어떤 객체의 타입을 확인하면(예: "이게 문자열인지 확인"), 코틀린은 그 이후로 해당 객체를 그 타입으로 간주합니다. 일일이 "이제부터 이 객체를 문자열로 취급해줘"라고 명시적으로 캐스팅할 필요가
없습니다.
불변 값(변하지 않는 값)에 대해 코틀린이 타입 체크를 기억하고 있다가, 필요할 때 자동으로 안전하게 타입을 변환해 줍니다. 이로 인해 코드가 더 간결하고 가독성이 좋아집니다.
:::

### 4.1 예시

```kotlin
if (printer != null) printer.print()
```

- 위 코드는 printer가 null이 아닐 때만 print()를 호출합니다.
- 이 경우, 코틀린은 printer가 null이 아님을 알고 있으므로, print()를 호출할 때마다 null 체크를 하지 않아도 됩니다.

## 5. Elvis 연산자

- 엘비스 연산자는 이항 연산자로 좌항 값이 null이 아니면 좌합 값을 결과로 하고 좌항 값이 널이면 우항 값을 결과로 합니다.
- [Nullable Type 참고](../../Nullable-Type/Nullable-Type.md)

## 6. 오류 throw 하기

- 이전에 살펴본 코드에서는 printer가 null인 경우 개발자에게 알리지 않고 코드가 그대로 진행됩니다.
  - 이런 경우 printer가 null이 되라라 예상하지 못했다면 print 메서드가 호출되지 않아 문제가 발생할 수 있습니다.
  - 이는 개발자가 오류를 발견하기 어렵게 만듭니다.
  - 따라서 개발자가 어떤 코드를 보고 `당연히 그럴 것이다`라고 생각하는 부분에서 문제가 발생할 경우 오류를 발생시켜 주는 것이 좋습니다.
- 오류를 강제로 발생시킬 때는 `throw`, `!!`, requireNotNull, checkNotNull을 사용할 수 있습니다.

## 7. not-null assertion의 문제

- nullable을 처리하는 가장 간단한 방법은 `!!` 연산자를 사용하는 것입니다.
- 하지만 이 방법을 사용하면 자바에서 nullable을 처리할 때 발생할 수 있는 문제가 똑갑이 발생합니다.
- `!!` 연산자는 null이 아닌 값을 보장하지 않기 때문에, null이 발생할 경우 NullPointerException(NPE)을 발생시킵니다.
- `!!`은 사용하기 쉽지만, 좋은 해결 책은 아닙니다.
- `!!` 연산자가 의미 있는 경우는 굉장히 드뭅니다.
  - 일반적으로 nullability가 제대로 표현되지 않는 라이브러리를 사용할 때 정도에만 사용합니다.

## 8. 의미 없는 nullability 피하기

- nullability는 어떻게든 적절하게 처리해야 하므로 비용이 발생합니다.
- 따라서 필요한 경우가 아니라면 nullability 자체를 피하는 것이 좋습니다.

### 8.1 nullability를 피하는 방법

- 클래스에서 nullability에 따라 여러 함수를 제공할 수 있습니다.
  - 대표적인 예로 `List<T>`의 get과 getOrNull이 있습니다.
- 어떤 값이 클래스 생성 이후에 확실하게 설정된다는 보장이 있다면 lateinit 프로퍼티와 notNull 델리게이트를 사용하세요
- 빈 컬렉션 대신 null을 사용하지 마세요.
  - null은 컬렉션 자체가 없다는 것을 의미합니다.
  - 요소가 부족하다는 것을 나타내려면 빈 컬렉션을 사용하세요.
- nullable enum과 None enum 값은 완전히 다른 의미를 가집니다.
  - null enum은 별도로 처리해야 하지만 Nono enum은 정의에 없으므로 필요한 경우에 사용하는 쪽에서 추가해서 활용할 수 있다는 의미입니다.

### 8.2 클래스에서 nullability에 따라 여러 함수 제공하기

- 코틀린 표준 라이브러리는 null 처리를 위해 다양한 함수 쌍을 제공합니다.
- 예를 들어, `List<T>`는 `get`과 `getOrNull`을 제공합니다.

```kotlin
val list = listOf(1, 2, 3)

// get: 인덱스가 범위를 벗어나면 예외 발생
try {
    val element = list.get(5) // 또는 list[5]
} catch(e: IndexOutOfBoundsException) {
    println("인덱스가 범위를 벗어났습니다")
}

// getOrNull: 인덱스가 범위를 벗어나면 null 반환
val elementOrNull = list.getOrNull(5) // null 반환
println(elementOrNull) // null
```

### 8.3 lateinit과 notNull 델리게이트 사용하기

- 코틀린에서는 lateinit 프로퍼티와 notNull 델리게이트를 사용하여 nullability를 피할 수 있습니다.
- 초기화를 나중에 하지만, 사용 전에는 반드시 초기화될 것이 확실한 프로퍼티가 있다면 lateinit을 사용하세요.
  - 처음 사용하기 전에 반드시 초기화가 되어 있을 경우에만 사용하세요.
  - 만약 초기화 전에 값을 사용하려고 하면 예외가 발생합니다.
- lateinit은 기본 타입(Int, Boolean 등)에는 사용할 수 없습니다.
  - 이런 경우 lateint보다는 약간 느리지만, Delagate.notNull을 사용합니다.

### 8.4 빈 컬렉션 대신 null 사용하지 않기

- 빈 컬렉션은 "요소가 0개 있다"는 의미이고, null 컬렉션은 "컬렉션 자체가 존재하지 않는다"는 의미입니다. 
- 대부분의 경우 빈 컬렉션을 사용하는 것이 더 명확하고 안전합니다.

```kotlin
// 잘못된 사용법
fun getUsers(): List<User>? {
    return if (hasUsers()) {
        usersList
    } else {
        null // 사용자가 없으면 null 반환 - 좋지 않은 방식
    }
}

// 올바른 사용법
fun getUsers(): List<User> {
    return if (hasUsers()) {
        usersList
    } else {
        emptyList() // 사용자가 없으면 빈 리스트 반환
    }
}
```

### 8.5 nullable enum vs None enum 값

- nullable enum은 null을 허용하는 enum 타입입니다.
- None enum 값은 enum 타입의 특정 값으로, 해당 값이 없음을 나타냅니다.

```kotlin
// nullable enum 사용
enum class Color { RED, GREEN, BLUE }

// null을 사용하여 색상 없음을 표현
val textColor: Color? = null
```

```kotlin
// None enum 값 사용
enum class Color { RED, GREEN, BLUE, NONE }

// NONE을 사용하여 색상 없음을 표현
val textColor: Color = Color.NONE
```

```kotlin
when (textColor) {
    Color.RED -> println("빨강")
    Color.GREEN -> println("초록")
    Color.BLUE -> println("파랑")
    null -> println("색상 없음")
} // null 케이스를 별도로 처리해야 함

// None enum 값 사용 시
when (textColor) {
    Color.RED -> println("빨강")
    Color.GREEN -> println("초록")
    Color.BLUE -> println("파랑")
    Color.NONE -> println("색상 없음")
} // 컴파일러가 모든 케이스 처리를 강제할 수 있음 (when을 식으로 사용할 때)
```

- when 표현식에서 null 케이스를 별도로 처리해야 합니다. 컴파일러가 null 케이스 처리를 강제하지 않습니다.
- when 표현식에서 다른 enum 값과 같이 처리됩니다. 컴파일러가 모든 enum 값 처리를 강제할 수 있습니다.

## 참고

- https://kotlinlang.org/docs/typecasts.html#smart-casts