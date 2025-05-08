---
title: "Property"
description: "코틀린 프로퍼티의 다양한 특징과 활용법을 알아봅니다. var와 val의 차이부터 커스텀 접근자, 지연 초기화, 위임 프로퍼티까지 실제 예제를 통해 코틀린 프로퍼티의 모든 것을 설명합니다."
tags: [ "KOTLIN", "PROPERTY", "BACKEND", "PROGRAMMING", "JAVA" ]
keywords: [ "코틀린", "kotlin", "프로퍼티", "property", "게터", "getter", "세터", "setter", "백킹 필드", "backing field", "lateinit", "지연 초기화", "const", "컴파일 상수", "위임 프로퍼티", "delegated property", "가변성", "mutability", "불변성", "immutability" ]
draft: false
hide_title: true
---

## 1. 코틀린 프로퍼티의 기본 개념

- 코틀린에서 프로퍼티(Property)는 객체의 상태를 나타내는 핵심 요소입니다.
- 자바에서 프로퍼티란 필드와 게터/세터 메서드를 결합한 개념으로, 보다 간결하고 표현력 있는 코드를 작성할 수 있게 해줍니다.
- 코틀린은 프로퍼티를 언어 기본 기능으로 제공합니다.
- 코틀린은 프로퍼티를 선언할 때 크게 두 가지 유형으로 구분합니다.
	- `var`: 가변(mutable) 프로퍼티로, 값을 읽고 쓸 수 있습니다.
	- `val`: 읽기 전용(read-only) 프로퍼티로, 초기화 후에는 값을 변경할 수 없습니다.

### 1.1 기본 프로퍼티 선언 및 사용

```kotlin
class Address {
    var name: String = "Holmes, Sherlock"
    var street: String = "Baker"
    var city: String = "London"
    var state: String? = null
    var zip: String = "123456"
}
```

- 코틀린에서는 클래스의 프로퍼티를 위와 같이 선언합니다.

```kotlin
fun copyAddress(address: Address): Address {
    val result = Address() // 코틀린에는 'new' 키워드가 없습니다
    result.name = address.name // 접근자(accessor)가 호출됩니다
    result.street = address.street
    // ...
    return result
}
```

- 프로퍼티를 사용할 때는 단순히 이름으로 참조하면 됩니다.

## 2. 게터와 세터 (Getters and Setters)

- 코틀린 프로퍼티의 전체 문법은 다음과 같습니다:

```kotlin
var <프로퍼티명>[: <타입>] [= <초기화 식>]
    [<게터>]
    [<세터>]
```

- 초기화 식, 게터, 세터는 모두 선택사항입니다.
- 타입은 초기화 식이나 게터의 반환 타입에서 추론될 수 있다면 생략 가능합니다.

```kotlin
var initialized = 1 // Int 타입으로 추론됨, 기본 게터와 세터가 제공됨
```

### 2.1 커스텀 접근자 (Custom Accessors)

- 코틀린에서는 프로퍼티에 대한 커스텀 접근자를 정의할 수 있습니다.
- 커스텀 게터를 정의하면, 프로퍼티에 접근할 때마다 해당 코드가 실행됩니다.
- 어떤 프로퍼티가 같은 객체 안의 다른 프로퍼티에서 계산된 결과인 경우 커스텀 접근자를 사용합니다.

**예시**

```kotlin
class Rectangle(val width: Int, val height: Int) {
    val area: Int // 게터의 반환 타입에서 추론 가능하므로 타입 생략 가능
        get() = this.width * this.height
}
```

```kotlin
val area get() = this.width * this.height
```

- 타입이 추론 가능한 경우 더 간결하게 작성할 수 있습니다:

```kotlin
var stringRepresentation: String
    get() = this.toString()
    set(value) {
        setDataFromString(value) // 문자열을 파싱하여 다른 프로퍼티에 값을 할당
    }
```

- 커스텀 세터도 정의할 수 있으며, 프로퍼티에 값을 할당할 때마다 호출됩니다:
- 관례적으로 세터의 파라미터 이름은 `value`를 사용하지만, 원하는 다른 이름을 선택할 수도 있습니다.

### 2.2 접근자 가시성 변경 및 애노테이션

- 접근자의 가시성을 변경하거나 애노테이션을 추가하려면 본문 없이 접근자를 정의할 수 있습니다.

**예시**

```kotlin
var setterVisibility: String = "abc"
    private set // 세터가 private으로 설정되며 기본 구현을 유지합니다

var setterWithAnnotation: Any? = null
    @Inject set // 세터에 Inject 애노테이션 적용
```

## 3. 백킹 필드와 백킹 프로퍼티

### 3.1 백킹 필드 (Backing Fields)

- Backing field는 프로퍼티의 값을 메모리에 저장하기 위한 특별한 필드입니다.
- 코틀린에서는 직접적으로 필드를 선언할 수 없고, 대신 필요할 때 자동으로 생성됩니다.
- 접근자 내에서 `field` 식별자를 사용하여 백킹 필드를 참조할 수 있습니다.
	- field 식별자: 사용자 정의 getter와 setter 내에서만 사용 가능한 특별한 식별자입니다.
- setter 내에서 프로퍼티 이름을 직접 사용하면 무한 재귀가 발생하기 때문에 field 식별자를 사용합니다.
- 프로퍼티가 다른 프로퍼티나 계산된 값에만 의존할 경우 backing field가 필요하지 않습니다.

**예시**

```kotlin
var counter = 0 // 초기화 식은 백킹 필드에 직접 할당됩니다
    set(value) {
        if (value >= 0)
            field = value
            // counter = value // 오류: 스택 오버플로우! 실제 이름 'counter'를 사용하면 세터가 재귀적으로 호출됩니다
    }
```

- `field` 식별자는 프로퍼티의 접근자 내에서만 사용할 수 있습니다.
- 백킹 필드는 프로퍼티가 최소한 하나의 접근자에 대해 기본 구현을 사용하거나, 커스텀 접근자가 `field` 식별자를 통해 참조할 경우에만 생성됩니다.
- field는 실제 값을 저장하는 backing field를 참조합니다.

**백킹 필드가 생성되지 않는 예시**

```kotlin
val isEmpty: Boolean
    get() = this.size == 0
```

- 이 프로퍼티는 다른 프로퍼티의 값에 기반하여 계산되므로 자체 값을 저장할 필요가 없습니다.

### 3.2 백킹 프로퍼티 (Backing Properties)

- 암시적 백킹 필드로는 충분하지 않은 경우, 백킹 프로퍼티를 사용할 수 있습니다:

```kotlin
private var _table: Map<String, Int>? = null
public val table: Map<String, Int>
    get() {
        if (_table == null) {
            _table = HashMap() // 타입 파라미터가 추론됩니다
        }
        return _table ?: throw AssertionError("Set to null by another thread")
    }
```

- 이 패턴은 지연 초기화나 스레드 안전성이 필요한, 보다 복잡한 초기화 로직을 구현할 때 유용합니다.

:::tip
JVM에서 기본 게터와 세터를 가진 private 프로퍼티에 대한 접근은 함수 호출 오버헤드를 피하도록 최적화됩니다.
:::

## 4. 컴파일 타임 상수 (Compile-time Constants)

- 읽기 전용 프로퍼티의 값이 컴파일 시점에 알려진 경우, `const`를 사용하여 컴파일 타임 상수로 표시할 수 있습니다:

```kotlin
const val SUBSYSTEM_DEPRECATED: String = "This subsystem is deprecated"

@Deprecated(SUBSYSTEM_DEPRECATED) fun foo() { ... }
```

- `const` 수정자를 사용하려면 다음 요구사항을 충족해야 합니다:
	- 최상위 프로퍼티이거나 object 선언 또는 companion object의 멤버여야 합니다.
	- String 타입이나 기본 타입(Int, Long 등)으로 초기화되어야 합니다.
	- 커스텀 게터를 가질 수 없습니다.
- 컴파일러는 상수의 사용을 인라인화하여 상수에 대한 참조를 실제 값으로 대체합니다.
- 이러한 프로퍼티는 애노테이션에서도 사용할 수 있습니다.

## 5. 지연 초기화 프로퍼티 (Late-initialized Properties)

- 일반적으로 non-nullable 타입의 프로퍼티는 생성자에서 초기화되어야 합니다.
- 그러나 의존성 주입이나 단위 테스트의 setup 메서드 등에서 초기화하는 경우와 같이, 생성자에서 초기화하는 것이 불편한 경우가 있습니다.
- 이러한 경우, `lateinit` 수정자를 사용하여 프로퍼티를 나중에 초기화할 수 있습니다:

```kotlin
class MyTest {
    lateinit var subject: TestSubject

    @SetUp fun setup() {
        subject = TestSubject()
    }

    @Test fun test() {
        subject.method()  // 직접 역참조 가능
    }
}
```

- `lateinit`은 다음 조건에서 사용할 수 있습니다:
	- 클래스 본문에 선언된 `var` 프로퍼티 (주 생성자가 아니며, 커스텀 접근자가 없는 경우)
	- 최상위 프로퍼티와 지역 변수
	- 프로퍼티 타입은 non-nullable이어야 하며, 기본 타입(Int, Boolean 등)이 아니어야 합니다.
- 초기화되기 전에 `lateinit` 프로퍼티에 접근하면, 해당 프로퍼티가 초기화되지 않았음을 명확히 식별하는 특별한 예외가 발생합니다.

### 5.1 lateinit 프로퍼티의 초기화 확인

- `lateinit` 프로퍼티가 이미 초기화되었는지 확인하려면 해당 프로퍼티 참조에 `.isInitialized`를 사용합니다:

```kotlin
if (foo::bar.isInitialized) {
    println(foo.bar)
}
```

- 이 확인은 같은 타입, 외부 타입 중 하나, 또는 같은 파일의 최상위 레벨에서 선언되어 어휘적으로 접근 가능한 프로퍼티에만 사용할 수 있습니다.

## 6. 프로퍼티 오버라이딩

- 코틀린에서는 프로퍼티도 메서드처럼 오버라이딩이 가능합니다.
- 기본 클래스에서 선언된 프로퍼티를 하위 클래스에서 재정의할 수 있습니다:

```kotlin
open class Shape {
    open val vertexCount: Int = 0
}

class Rectangle : Shape() {
    override val vertexCount: Int = 4
}
```

- `var` 프로퍼티를 `val` 프로퍼티로 오버라이드할 수 없지만, `val` 프로퍼티는 커스텀 게터가 있는 `var` 프로퍼티로 오버라이드할 수 있습니다:

```kotlin
interface Shape {
    val vertexCount: Int
}

class Rectangle(override val vertexCount: Int = 4) : Shape

class Polygon : Shape {
    override var vertexCount: Int = 0  // val을 var로 오버라이드
}
```

## 7. 위임 프로퍼티 (Delegated Properties)

- 프로퍼티는 단순히 백킹 필드에서 읽고 쓰는 것 외에도 다양한 동작을 수행할 수 있습니다.
- 위임 프로퍼티를 사용하면 프로퍼티의 게터와 세터의 동작을 다른 객체에 위임할 수 있습니다:

```kotlin
class Example {
    var p: String by Delegate()
}
```

- 위 코드에서 `p` 프로퍼티의 게터와 세터는 `Delegate` 클래스의 인스턴스에 의해 처리됩니다.

### 7.1 표준 위임 프로퍼티

코틀린 표준 라이브러리는 다양한 유용한 위임 프로퍼티를 제공합니다:

#### 7.1.1 Lazy 프로퍼티

- `lazy()` 함수는 첫 번째 접근 시에만 평가되는 지연 계산 프로퍼티를 구현합니다:

```kotlin
val lazyValue: String by lazy {
    println("Computed!")
    "Hello"
}

// 첫 접근 시 "Computed!"가 출력되고 "Hello"가 반환됩니다
// 이후 접근에서는 계산 없이 "Hello"만 반환됩니다
```

#### 7.1.2 Observable 프로퍼티

- `Delegates.observable()`은 값이 변경될 때마다 호출되는 콜백을 등록할 수 있습니다:

```kotlin
var name: String by Delegates.observable("Initial value") { property, oldValue, newValue ->
    println("$oldValue -> $newValue")
}
```

#### 7.1.3 Map 위임

- 맵을 사용하여 프로퍼티 값을 저장할 수 있습니다:

```kotlin
class User(val map: Map<String, Any?>) {
    val name: String by map
    val age: Int by map
}

val user = User(mapOf(
    "name" to "John Doe",
    "age" to 25
))
```

## 8. 프로퍼티의 실제 활용 사례

### 8.1 데이터 캡슐화 강화

- 코틀린 프로퍼티의 커스텀 접근자를 활용하면 데이터 접근 시 유효성 검사나 부수 효과를 쉽게 구현할 수 있습니다:

```kotlin
class User {
    var email: String = ""
        set(value) {
            require(value.contains("@")) { "Invalid email format" }
            field = value
        }
}
```

### 8.2 계산된 프로퍼티

- 데이터를 저장하지 않고 계산된 값을 반환하는 프로퍼티를 쉽게 구현할 수 있습니다:

```kotlin
class Circle(val radius: Double) {
    val area: Double
        get() = Math.PI * radius * radius
        
    val circumference: Double
        get() = 2 * Math.PI * radius
}
```

### 8.3 지연 초기화를 통한 성능 최적화

- 비용이 많이 드는 리소스를 필요할 때만 초기화하여 성능을 최적화할 수 있습니다:

```kotlin
class ResourceManager {
    private val resourceCache = mutableMapOf<String, Resource>()
    
    val heavyResource: Resource by lazy {
        println("Heavy resource initialized")
        Resource("data.bin")
    }
    
    fun getResource(name: String): Resource {
        return resourceCache.getOrPut(name) {
            Resource(name)
        }
    }
}
```

### 8.4 스프링 프레임워크와의 통합

- `lateinit`은 스프링과 같은 DI 프레임워크와 함께 사용할 때 특히 유용합니다:

```kotlin
@Service
class UserService {
    @Autowired
    lateinit var userRepository: UserRepository
    
    fun findUser(id: Long): User {
        return userRepository.findById(id).orElseThrow()
    }
}
```

## 9. 결론

- 코틀린의 프로퍼티는 자바의 필드와 접근자 메서드보다 더 강력하고 표현력이 뛰어납니다.
- 기본적인 사용 외에도 커스텀 접근자, 백킹 필드, 지연 초기화, 위임 프로퍼티 등 다양한 기능을 제공합니다.
- 이러한 기능들을 적절히 활용하면 더 간결하고, 안전하며, 유지보수가 용이한 코드를 작성할 수 있습니다.
- 특히 불변성을 지향하는 코드에서는 `val`과 커스텀 게터를 조합하여 강력한 추상화를 구현할 수 있습니다.

:::tip
코틀린 프로퍼티의 가장 큰 장점은 보일러플레이트 코드를 줄이면서도, 필요할 때 세밀한 제어가 가능하다는 점입니다. 기본 접근자만으로 충분한 경우에는 간결하게 작성하고, 복잡한 로직이 필요한 경우에만 커스텀 접근자를
구현하는 것이 좋습니다.
:::

:::warning
`lateinit`과 nullable 타입(`String?`)은 모두 null을 허용하지만, 그 의도와 사용 방식이 다릅니다. 초기화가 확실히 이루어지지만 시점이 생성자 이후인 경우에는 `lateinit`을, 값이
없을 수도 있는 경우에는 nullable 타입을 사용하는 것이 적절합니다.
:::

## 참고

- https://kotlinlang.org/docs/properties.html