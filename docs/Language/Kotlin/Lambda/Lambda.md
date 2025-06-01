## 1 Lambda

- 람다 식(lambda expression)은 기본적으로 다른 함수에 넘길 수 있는 작은 코드 조각을 의미합니다.
- 람다를 따로 선언해서 변수에 저장할 수 있지만 대부분 함수에 인자로 넘기면서 바로 람다를 정의하는 경우가 많습니다.

### 1.1 코드 블록을 함수 인자로 넘기기

- "이벤트가 발생하면 이 핸들러를 실행하자" 또는 "데이터 구조의 모든 원소에 이 연산을 적용하자"와 같은 생각을 코드로 구현할 때 일련의 동작을 변수에 저장하거나 다른 함수에 넘기는 경우가 있습니다.
- 자바 8 이전에는 익명 클래스를 통해 코드를 함수에 넘기거나 변수에 저장할 수 있었습니다.
	- [Anonymous Class 참고](../../Java/Anonymous-Class/Anonymous-Class.md)
- 클래스를 선언하고 클래스의 인스턴스를 함수에 넘기는 방식으로 상당히 번거로운 작업이었습니다.
- 함수형 프로그래밍 언어에서는 함수를 값처럼 다루는 접근 방식을 택해 이 문제를 해결합니다.

## 2 람다 식의 문법

- 코틀린 람다 식은 항상 중괄호로 둘러싸여 있습니다.
- `->`가 인자 목록과 분문을 구분합니다.

### 2.1 람다 예시

```kotlin
{x: Int, y:Int -> x + y}
```

- 위 예시는 두 개의 Int형 인자를 받아서 그 합을 반환하는 람다 식입니다.
- 인자 목록 주변에 괄호가 없다는 점을 꼭 유의하세요.

```kotlin
val sum = { x: Int, y: Int ->
   println("Computing the sum of $x and $y...")
   x + y
}

println(sum(1, 2))
```

- 위와 같이 람다식을 변수에 저장할 수 있습니다.
- 람다를 변수에 저정할 때는 파라미터의 타입을 추론할 문맥이 없기 때문에 타입을 명시해야 합니다.

### 2.1 람다식 줄여 쓰기

**원본**

```kotlin
val people = listOf(Person("Alice", 29), Person("Bob", 31))
println(people.maxBy({person -> person.age}))
```

- `people` 리스트에서 나이(`age`)가 가장 많은 사람을 찾는 예시입니다.
- 여기서 중괄호 `{}` 안에 있는 코드가 람다식입니다.
- `maxBy` 함수에 람다식을 전달하여, 각 `Person` 객체의 `age` 속성을 기준으로 최대값을 찾습니다.
- 여기서 코드를 더 간결하게 줄여보겠습니다.

#### 2.1.1 람다식 소괄호에서 빼기

```kotlin
val people = listOf(Person("Alice", 29), Person("Bob", 31))
println(people.maxBy() { person -> person.age })
```

- 함수 호출 시 맨 뒤에 있는 인자가 람다식이면 그 람다를 괄호 밖으로 빼낼 수 있는 문법적인 관습이 있습니다.
- `maxBy` 함수의 람다식을 괄호 밖으로 이동시켰습니다.
- 이는 가독성을 높이고 코드 작성을 간편하게 만듭니다.

#### 2.1.2 람다식을 함수의 유일한 인자로 썼을 때

```kotlin
val people = listOf(Person("Alice", 29), Person("Bob", 31))
println(people.maxBy { person -> person.age })
```

- 람다가 함수의 유일한 인자라면 빈 괄호 `()`를 생략할 수 있습니다.
- 이렇게 하면 코드가 더 간결해집니다.

#### 2.1.3 it 사용하기

```kotlin
val people = listOf(Person("Alice", 29), Person("Bob", 31))
println(people.maxBy { it.age })
```

- 파라미터 이름을 지정하지 않으면 `it`이라는 이름의 디폴트 파라미터가 만들어집니다.
- 람다의 파라미터가 하나뿐이고 그 타입을 컴파일러가 추론할 수 있는 경우 it을 사용할 수 있습니다.

### 2.2 람다식의 결과 값

- 람다식의 본문이 여러줄로 이루어진 경우 본문의 맨 마지막에 있는 식이 람다의 결과 값이 됩니다.
- 이때 명시적인 return이 필요하지 않습니다.

```kotlin
fun main() {
	val sum = { x: Int, y: Int ->
			println("Computing the sum of $x and $y...")
			x + y // 마지막 식이 람다의 결과 값
	}

	println(sum(1, 2)) 
	// Computing the sum of 1 and 2...
	// 3
}
```

- 위 예시에서 `x + y`가 람다의 결과 값입니다.

## 3 람다가 캡쳐한 변수: 현재 영역에 있는 변수 접근

- 람다를 함수 안에서 정의하면 함수의 파라미터뿐 아니라 람다 정의보다 앞에 선언된 로컬 변수까지 람다에서 접근할 수 있습니다.
- 코틀린 람다 안에서는 파이널 변수가 아닌 변수에 접근할 수 있다는 점이 자바와 다릅니다.
	- 따라서 람다 안에서 바깥 변수를 변경할 수 있습니다.
	- 자바는 람다 안에서 접근할 수 있는 변수가 final로 선언된 변수만 가능합니다.

#### 3.1 예시

```kotlin
fun printMessagesWithPrefix(messages: Collection<String>, prefix: String) {
		messages.forEach { message ->
				println("$prefix $it")
		}
}

fun main() {
	val errors = listOf("403 Forbidden", "404 Not Found")
	printMessagesWithPrefix(errors, "Error:")
	// Error: 403 Forbidden
	// Error: 404 Not Found
}
```

- forEach는 각 원소에 대해 수행할 작업을 람다로 받습니다.
- forEach에 넘겨주는 람다는 자신을 둘러싼 영역에 정의된 prefix 변수와 다른 변수를 접근할 수 있습니다.

#### 3.2 바깥 함수 변수 변경하기

```kotlin
fun printProblemCounts(reseponse: Collection<String>) {
	var clientErrors = 0 // 람다에서 접근할 수 있는 바깥 변수
	var serverErrors = 0 // 람다에서 접근할 수 있는 바깥 변수

	response.forEach { response ->
		if (response.startsWith("4")) {
			clientErrors++ // 바깥 변수를 변경
		} else if (response.startsWith("5")) {
			serverErrors++ // 바깥 변수를 변경
		}
	}

	println("$clientErrors client errors, $serverErrors server errors")
}

fun main() {
	val responses = listOf("200 OK", "418 I'm a teapot", "500 Internal Server Error")
	printProblemCounts(responses)
	// 1 client errors, 1 server errors
}
```

- 위 예시에서 `clientErrors`와 `serverErrors`는 람다 안에서 접근할 수 있는 바깥 변수입니다.
- 위 예제에서 prefix, clientErrors, serverErrors와 같이 람다 안에서 접근할 수 있는 외부 변수를 `람다가 캡쳐한 변수`라고 부릅니다.

### 3.3 람다가 캡쳐한 변수

- 기본적으로 함수 안에 정의된 로컬 변수의 생명주기는 함수의 생명주기와 같습니다.
- 하지만 어떤 함수가 자신의 로컬 변수를 캡처한 람다를 반환하거나 다른 변수에 저장한다면 로컬 변수의 생명주기와 함수의 생명주기가 달라질 수 있습니다.
- 캡처한 변수가 있는 람다를 저정한 후 함수가 끝난 뒤에 실행해도 람다의 본문 코드는 여전히 캡처한 변수를 사용할 수 있습니다.
- 파이널 변수를 캡처한 경우에는 람다 코드를 변수 값과 함께 저장합니다. 파이널이 아닌 경우 변수를 특별한 래퍼로 감싸고 래퍼에 대한 참조를 람다 코드와 함께 저장합니다.

## 4 멤버 참조

- 람다를 사용해 코드 블록을 넘길 수 있습니다. 그런데 이러한 코드 블록이 이미 함수로 정의된 경우 어떻게 할까요?
- 그 함수를 호출하는 람다를 만들면 되지만 이는 중복된 코드입니다.
- 이런 경우 멤버 참조를 이용하면 이미 정의된 함수를 직접 넘길 수 있습니다.

### 4.1 멤버 참조 예시

- 코틀린에서는 함수를 값으로 변경할 수 있습니다. 이 때 `::`을 사용합니다.
- `::`을 사용하는 식을 멤버 참조라고 부릅니다.
	- `::`은 클래스의 이름과 참조하려는 멤버(프로퍼티나 메서드) 이름 사이에 위치합니다.
- 멤버 참조는 정확히 한 메서드를 호출하거나 한 프로퍼티에 접근하는 함수 값을 만들어 줍니다.
- 이를 이용해 함수를 값으로 바꾸고 변수에 담았다.

```kotlin
class Person(val name: String, val age: Int)

val age = Person::age
```

- 위 예시에서 `age`는 `Person` 클래스의 `age` 프로퍼티를 참조하는 멤버 참조입니다.
- 멤버 참조 뒤에는 괄호를 넣으면 안됩니다.
- 해당 대상을 참조할 뿐이지 호출하는 것이 아니기 때문입니다.

### 4.2 생성자 참조

```kotlin
data class Person(val name: String, val age: Int)

fun main(args: Array<String>) {
    val createPerson = ::Person
    val p = createPerson("Alice", 29)
    println(p)
}
```

- `::클래스이름` 으로 생성자 참조를 만들 수 있습니다.
- Person 인스턴스를 만드는 동작을 값으로 저장했습니다.

### 4.3 확장 함수 참조

```kotlin
data class Person(val name: String, val age: Int)
fun Person.isAdult() = age >= 21
val predicate = Person::isAdult
```

- `클래스이름::확장함수이름`으로 확장 함수 참조를 만들 수 있습니다.

## 5 수신 객체 지정 람다

- 수신 객체 지정 람다란 수신 객체를 명시하지 않고 람다의 본문 안에서 다른 객체의 메서드를 호출할 수 있게하는 기법입니다.
- 코틀린 표준 라이브러리의 with, apply, also를 사용해보면서 수신 객체 지정 람다를 알아보겠습니다.

### 5.1 with

- 어떤 객체의 이름을 반복하지 않고도 그 객체에 대해 다양한 연산을 수행할 수 있다면 좋을 것입니다.
- 코틀린에서는 언어 구성 요소로 제공하진 않지만 with라는 라이브러리 함수를 통해 이 기능을 제공합니다.
- 아래 예시를 통해 with를 사용해보겠습니다.

#### 5.1.1 with 사용하기

```kotlin
fun alphabet(): String {
    val result = StringBuilder()
    for (letter in 'A'..'Z') {
         result.append(letter)
    }
    result.append("\nNow I know the alphabet!")
    return result.toString()
}

fun main(args: Array<String>) {
    println(alphabet())
}
```

- 위 코드에서는 result에 대해 여러 메서드를 호출하면서 result를 반복사용하고 있습니다.
- 위 코드를 with를 사용해서 리팩터링 해보겠습니다.

```kotlin
fun alphabet(): String {
    val stringBuilder = StringBuilder()
    return with(stringBuilder) { // 메서드를 호출하려는 수신 객체를 지정한다.
        for (letter in 'A'..'Z') {
            this.append(letter) // this를 명시해서 수신 객체의 메서드를 호출한다.
        }
        append("\nNow I know the alphabet!") // this를 생략해서 수신 객체의 메서드를 호출한다.
        this.toString() // 람다의 값을 반환한다.
    }
}

fun main(args: Array<String>) {
    println(alphabet())
}
```

- 위 예시에서 `with`를 사용해 `StringBuilder` 객체를 수신 객체로 지정했습니다.
- 람다 안에서 명시적으로 this 참조를 사용해 수신 객체에 접근할 수 있습니다.

```kotlin
fun alphabet() = with(StringBuilder()) {
    for (letter in 'A'..'Z') {
        append(letter)
    }
    append("\nNow I know the alphabet!")
    toString()
}

fun main(args: Array<String>) {
    println(alphabet())
}
```

- 위 예시는 this를 생략했습니다.

#### 5.1.2 with 설명

- with문은 언어에서 제공하는 특별한 구문 같지만 실제로 파라미터가 2개 있는 함수입니다.
- 위 예시에서 첫 번째 파라미터는 stringBuilder고 두 번째 파라미터는 람다입니다.
- 람다를 괄호 밖으로 빼는 관례에 따라 언어가 제공하는 특별한 구문처럼 보입니다.
- with는 첫 번째 인자로 받은 객체를 두번 째 인자로 받은 람다의 수신 객체로 만들어줍니다.
- with가 반환하는 값은 람다 코드를 실행한 결과입니다.
	- 람다 식의 결과는 마지막 식의 값입니다.
- 람다식의 결과 대신 수신 객체가 필요한 경우에는 아래서 살펴 볼 `apply` 라이브러리 함수를 사용합니다.

#### 5.1.3 메서드 이름 충돌

- with에게 인자로 넘긴 객체의 메서드 이름과 with를 사용하는 코드가 들어있는 클래스의 메서드가 같은 경우에 바깥쪽 클래스의 메서드를 호출하고 싶다면 `this@OuterClass.toString()`과 같은
  구문을 사용한다.

### 5.2 apply

- `apply`는 `with`와 거의 같은 함수입니다.
- 유일한 차이점은 `apply`는 항상 자신에게 전달된 수신 객체를 반환한다는 점입니다.
	- `with`는 람다의 결과를 반환합니다.
- 이런 `apply` 함수는 객체의 인스턴스를 만들면서 즉시 프로퍼티 중 일부를 초기화하는데 용이하다.

#### 5.2.1 예시

```kotlin
fun alphabet() = StringBuilder().apply {
    for (letter in 'A'..'Z') {
        append(letter)
    }
    append("\nNow I know the alphabet!")
}.toString()

fun main(args: Array<String>) {
    println(alphabet())
}
```

- 위에 `with`의 예시를 `apply`를 사용해 리팩터링 했습니다.

#### 5.2.2 초기화 예시

- `apply` 함수는 객체의 인스턴스를 만들면서 즉시 프로퍼티 중 일부를 초기화하는데 용이합니다.
- 보통 별도의 Builder객체가 이런 역할을 담당하지만 코틀린에서는 apply를 사용해 객체의 인스턴스를 만들면서 즉시 프로퍼티 중 일부를 초기화 할 수 있습니다.

```kotlin
fun createViewCustomAttributes(context: Context) = 
TextView(context).apply {
  text = "Samplt Text"
  textSize = 20.0
  setPadding(10, 0, 0, 0)
}
```

- 새로운 TextView 인스턴스를 만들고 즉시 apply에게 넘겨줍니다.
- apply에 전달된 TextView가 수신 객체가 됩니다.
- 따라서 TextView의 메서드를 호출하거나 프로퍼티를 설정할 수 있습니다.
- 람다가 실행되고 나면 apply는 람다에 의해 초기화된 TextView 인스턴스를 반환합니다.

### 5.3 buildString, buildList, buildSet, buildMap

```kotlin
fun alphbet() = buildString {
    for (letter in 'A'..'Z') {
        append(letter)
    }
    append("\nNow I know the alphabet!")
}
```

- `buildString`의 인자는 수신 객체 지정 람다이며, 수신 객체는 항상 `StringBuilder`입니다.
- `buildString`은 `StringBuilder` 객체를 만드는 일과 toString을 호출하는 일을 알아서 처리해줍니다.

```kotlin
val fibonacci = buildList {
  addAll(listOf(1, 1, 2))
  add(3)
  add(index = 0, element = 3)
}
```

- 읽기 전용 리스트를 만들지만 생성 과정에서는 가변 컬렉션인 것처럼 다루고 싶다면 `buildList`를 사용합니다.

```kotlin
val shoulAdd = true
val fruits = buildSet {
  add("apple")
  if(shoulAdd) {
    add(listOf("Apple", "Banana", "Cherry"))
    }
}
```

- `buildSet`은 읽기 전용 세트를 만들지만 생성 과정에서는 가변 컬렉션인 것처럼 다루고 싶다면 `buildSet`을 사용합니다.

```kotlin
val medals = buildMap<String, Int> {
  put("Gold", 1)
  putAll(listOf("Silver" to 2, "Bronze" to 3))
```

- `buildMap`은 읽기 전용 맵을 만들지만 생성 과정에서는 가변 컬렉션인 것처럼 다루고 싶다면 `buildMap`을 사용합니다.

### 5.3 also

- `also`는 `apply`와 마찬가지로 수신 객체를 받으며, 그 수신 객체에 대해 어떤 동작을 수행한 후 수신 객체를 반환합니다.
- `apply`와의 차이점은 `also`는 수신 객체를 `인자로 참조한다는 점입니다.
  - 따라서 `apply`와는 달리 `this`를 사용하지 않고 `it`을 사용해야 합니다.
- 주요 사용 목적
  - apply: 객체 초기화 및 구성에 주로 사용됩니다. 객체의 프로퍼티를 설정할 때 this를 생략할 수 있어 코드가 간결해집니다.
  - also: 객체에 부수 작업을 수행할 때 (로깅, 유효성 검사 등) 주로 사용됩니다. 람다 내에서 it으로 객체를 명시적으로 참조하므로 코드의 가독성이 향상됩니다.