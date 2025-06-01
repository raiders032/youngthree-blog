## 1 Class

### 1.1 클래스 정의

```kotlin
class Person(val name:String)
```

**동일한 Java**

```java
public class Person{
	private final String name;
  
	public Person(String name) {
	this.name = name;
	}
	
	public String getName() {
	return name;
	}
}
```

### 1.2 프로퍼티

- 자바에서는 필드와 접근자를 한데 묶어 프로퍼티라고 합니다.
- 자바에서는 데이터를 필드에 저장하며 멤버 필드의 가시성을 일반적으로 private으로 정의합니다.
	- 이 경우 클라이언트가 클래스의 필드에 접근이 필요한 경우 접근자 메서드를 사용합니다.
	- 접근자 메서드는 getter와 setter가 있습니다.
- 코틀린은 프로퍼티를 언어 기본 기능으로 제공합니다.
- 코틀린의 프로퍼티는 자바의 필드와 접근자 메서드를 완전히 대신합니다.
- val로 선언한 프로퍼티는 읽기 전용입니다.
	- 비공개 필드와 public getter를 만들어집니다.
- var로 선언한 프로퍼티는 읽기/쓰기가 가능합니다.
	- 비공개 필드와 public setter와 getter를 만들어 냅니다.

### 1.3 커스텀 접근자

- 직사각형 클래스인 Rectangle을 정의하면서 자신이 정사각형인지 알려주는 기능을 만들어보자.

```kotlin
class Rectangle(val height:Int, val width:Int) {
  val isSquare: Boolean
  	get () {
      return height == width
    }
}
```

- 정사각형인지를 별도의 필드에 저장할 필요가 없다.
- isSquare 프로퍼티에는 자체 값을 저장하는 필드가 필요없다.
- 이 프로퍼티에는 자체 구현을 제공하는 getter만 존재한다.
- 클라이언트가 프로퍼티에 접근할 때마다 getter가 프로퍼티 값을 매번 계산한다.

## 2 자바 클래스와 차이점

- 코틀린의 클래스는 기본적으로 `final`, `pulic`이다.
- 중첩 클래스는 기본적으로 내부 클래스가 아니다.
	- 외부 클래스에 대한 참조가 없다.

## 3 abstract class

- abstract로 선언한 클래스는 인스턴스화할 수 없다.
- 추상 멤버는 항상 열려있어 추상 멤버 앞에 `open` 변경자를 명시할 필요가 없다.

**예시**

- 추상 클래스에는 abstract 변경자를 붙인다.
- 추상 메서드에도 abstract 변경자를 붙인다.
- 메서드에 abstract 변경자를 붙이지 않으면 추상 메서드가 아니다.

```kotlin
abstract class Animated {
	// 추상 메서드
	abstract fun animate()
	
	// 비추상 메서드도 기본적으로 final이기 때문에 원한다면 open을 명시해야 함
	open fun stopAnimating() {}
	
	// 비추상 메서드 기본적으로 final
	fun animateTwice() {}
}
```

## 4 nested class

- 자바처럼 코틀린에서도 클래스 안에 클래스를 정의할 수 있습니다.
- 클래스 안에 다른 클래스를 선언하면 도우미 클래스를 캡슐화하거나 코드 정의를 그 코드를 사용하는 곳 근처에 두는 데 유용합니다.

### 4.1 자바와의 차이점

- 자바의 nested class는 기본적으로 Inner Class로 선언됩니다.
	- 자바의 Inner Class는 `static` 키워드 없이 선언된 중첩 클래스를 의미합니다.
	- Inner Class 클래스는 암묵적으로 바깥 클래스에 대한 참조를 가집니다.
	- 자바에서 암묵적인 바깥 클래스에 대한 참조를 없애려면 `static` 키워드를 사용해야 합니다.
- 코틀린에서는 nested class는 기본적으로 바깥 클래스에 대한 참조가 없습니다.
	- 즉 명시적으로 요청하지 않는 한 바깥쪽 클래스 인스턴스에 대한 접근 권한이 없습니다.
	- 즉 자바의 Static Nested Class와 같습니다.
	- 자바의 Inner Class처럼 바깥 클래스에 대한 참조 포함하고 싶다면 `inner` 변경자를 붙여야 합니다.
- 코틀린에서는 바깥 클래스의 인스턴스를 가리키는 참조를 표기하는 법이 자바와 다릅니다.
	- 바깥쪽 클래스의 인스턴스에 접근하려면 `this@Outer`라고 써야 합니다.

### 4.2 내포 클래스와 내부 클래스

- 내포 클래스는 바깥 클래스에 대한 참조가 없는 중첩 클래스입니다.
	- `class` 키워드로 정의합니다.
- 내부 클래스는 바깥 클래스에 대한 참조가 있는 중첩 클래스입니다.
	- `inner class` 키워드로 정의합니다.

#### 예시

```kotlin
class Outer {
	inner class Inner {
		fun getOuterReference() = this@Outer
	}
}
```

- 내부 클래스 Inner에서 바깥 클래스 Outer의 인스턴스에 접근하려면 `this@Outer`를 사용해야 합니다.

## 5 생성자와 초기화 블록

- 코틀린에서는 클래스의 인스턴스를 생성할 때 사용되는 두 가지 타입의 생성자가 있습니다.
	- 주 생성자(primary constructor)와 부 생성자(secondary constructor).
	- 이들은 클래스의 인스턴스화와 초기화 과정에서 중요한 역할을 합니다.
- constructor 키워드는 주 생성자나 부 생성자를 정의할 때 사용한다.

### 5.1 Primary Constructor(주 생성자)

- 클래스를 초기화할 때 주로 사용하는 생성자로 클래스 본문 밖에 정의합니다.
- 주 생성자는 생상자 파라미터를 지정하고 그 생성자 파라미터에 의해 초기화되는 프로퍼티를 정의하는 두 가지 목적으로 사용됩니다.

#### 5.1.1 초기화 블록

- init 키워드는 초기화 블록을 시작할 수 있습니다.
- 초기화 블록에는 클래스의 객체가 만들어질 때 실행될 초기화 코드가 들어갑니다.
- 초기화 블록은 주로 주 생성자와 함께 사용됩니다.
- 주 생성자는 제한적이기 때문에 별도의 코드를 포함할 수 없어 초기화 블록이 필요합니다.

##### 예시

```kotlin
class User constructor(_nickname: String) {
    val nickname: String

    init {
        nickname = _nickname
    }
}
```

- 위 예시에서 User 클래스는 nickname이라는 프로퍼티를 가지고 있습니다.
- nickname은 주 생성자 파라미터 _nickname으로 초기화됩니다.

```kotlin
class User(_nickname: String) {
    val nickname: String = _nickname
}
```

- 위 예시를 더 간결하게 표현할 수 있습니다.
- 프로퍼티를 초기화하는 식이나 초기화 블록 안에서 주 생성자의 파라미터를 참조할 수 있습니다.

```kotlin
class User(val nickname: String)
```

- 위 예시를 더 간결하게 표현할 수 있습니다.
- 주 생성자의 파라미터로 프로퍼티를 초기화한다면 그 주 생성자 파라미터 이름 앞에 val을 추가하는 방식으로 프로퍼티 정의화 초기화를 간략히 위와 같이 쓸 수 있습니다.
- 생성자 파라미터에도 기본값을 지정할 수 있습니다.

### 5.2 Secondary Constructor(부 생성자)

- 부 생성자는 클래스 본문 안에 정의된 생성자입니다.
- 일반적으로 코틀린에서 생성자가 여럿 있는 경우가 많지 않습니다.
	- 인자에 대한 기본값을 제공하기 위해 부 생성자를 사용하는 것은 권장되지 않습니다.
- 오버로드한 생성자가 필요한 경우 디폴트 파라미터 값과 이름 붙인 인자 문법을 사용해 해결할 수 있습니다.
- 부 생성자는 `constructor` 키워드로 정의합니다.
- 클래스에 주 생성자가 없다면 모든 부 생성자는 반드시 상위 클래스를 초기화하거나 다른 생성자에게 생성을 위임해야 합니다.

#### 예시

```kotlin
class MyDownloader : Downloader {
		constructor(url: String?) : this(URI(url))
		constructor(uri: URI?) : super(uri)
}
```

- 첫 번째 부 생성자는 URI 객체를 만들어 다른 생성자에게 생성을 위임합니다.
- 두 번째 부 생성자는 super(uri)로 상위 클래스의 생성자를 호출합니다.

### 5.3 기반 클래스 생성자 호출

- 기반 클래스의 생성자가 인자를 받는 경우 클래스의 주 생성자에서 기반 클래스의 생성자를 호출해야 합니다.
- 기반 클래스를 초기화하려면 기반 클래스 이름 뒤에 생성자 인자를 괄호 안에 넣어야 합니다.

#### 예시

```kotlin
open class User(val nickname: String) {}
class SocialUser(nickname: String) : User(nickname) {}
```

- 위 예시에서 SocialUser 클래스는 User 클래스를 상속받습니다.
- User 클래스의 생성자는 nickname이라는 인자를 받습니다.
- SocialUser 클래스의 주 생성자에서 User(nickname)으로 기반 클래스의 생성자를 호출합니다.

### 5.4 private 생성자

- 어떤 클래스를 외부에서 인스턴스화할 수 없도록 하려면 생성자를 private으로 선언하면 됩니다.

```kotlin
class Secretive private constructor(private val agentName: String) {}
```

- Secretive 클래스는 주 생성잦만 있고 비공개이므로 외부에서 인스턴스화할 수 없습니다.

## 6 data class

- 어떤 클래스가 데이터를 담는 용도로만 사용된다면 toString, equals, hashCode를 반드시 오버라이드해야 합니다.
- 코틀린에서는 data 라는 변경자를 클래스 앞에 붙이면 필요한 메서드를 컴파일러가 자동으로 만들어줍니다.
  - 컴파일러가 equals, hashCode, toString, copy 메서드를 만들어 줍니다.
- data 변경자가 붙은 클래스를 데이터 클래스라고 부릅니다.

### 6.1 사용 예시

```kotlin
data class Client(val name: String, val postalCode: Int)
```

- equals와 hashcode는 주 생성자에 나열된 모든 프로퍼티를 고려해 만들어진다.
- 주 생성자 밖에 정의된 프로퍼티는 고려 대상이 아니다!

### 6.2 data 클래스와 불변성

- data 클래스의 프로퍼티가 꼭 val일 필요는 없습니다.
- 하지만 data 클래스의 모든 프로퍼티를 읽기 전용으로 만들어서 data 클래스를 불변 클래스로 만들길 권장합니다.
- HashMap 컨테이너에 data 클래스를 담는 경우 불변성이 필수입니다.
	- 키로 쓰인 data 클래스의 프로퍼티를 변경하면 컨테이너 상태가 잘못될수 있기 때문 입니다.
- data 클래스를 불변 객체로 더 쉽게 사용할 수 있게 코틀린 컴파일러는 copy라는 메서드를 제공합니다.
  - copy 메서드는 객체를 복사하면서 일부 프로퍼티 값을 바꿀 수 있습니다.
  - 복사본은 원본과 다른 생명주기를 가지고 있습니다.
  - 복사복을 제거해도 원본에 전혀 영향을 미치지 않습니다.

## 7 클래스 위임: by

- 상속에 의해서 두 객체가 강력하게 결합하는 것을 막는 방법으로 데코레이터 패턴을 사용할 수 있습니다.
	- [상속보다는 컴포지션을 사용하라](../../Java/Effective-Java/Chapter4/Item18/Item18.md) 참고
  - 코틀린은 기본적으로 클래스를 final로 취급하기로 결정했습니다.
  - 따라서 상속을 염두에 두고 설계된 클래스에 open 키워드를 붙여야 합니다.
- 상속을 사용하지 않고 기존 클래스에 새로운 동작을 추가하는 방법으로 데코레이터 패턴을 사용할 수 있습니다.
  - 데코레이터 패턴의 단점은 준비 코드가 상당히 많이 필요하다는 점입니다.
  - 코틀린은 이러한 준비 코드를 컴파일러가 만들어 주기 때문에 데코레이터 패턴을 쉽게 사용할 수 있습니다.
  - 데코레이터가 기존 클래스 객체의 포워딩하는 메서드를 자동으로 만들어 줍니다.
  - [Decorator 참고](../../../Design-Pattern/Decorator/Decorator.md)
- by 키워드를 사용하면 클래스 위임을 쉽게 구현할 수 있습니다.
  - 컴파일러가 전달 메서드를 자동으로 만들어 줍니다.
  - 메서드 중 일부의 동작을 변경하고 싶다면 메서드를 오버라이드하면 컴파일러가 생성한 메서드 대신 오버라이드한 메서드가 사용됩니다.

:::info[Decorator]
데코레이터 패턴은 객체에 새로운 기능을 추가하는 구조적 디자인 패턴입니다. 
이 패턴의 핵심은 기존 클래스와 같은 인터페이스를 가지는 데코레이터 클래스를 만들어, 기존 클래스의 기능을 확장하는 것입니다.
데코레이터 내부 필드로 기존 클래스에 대한 참조를 가지고 있으며, 새로 정의해야 하는 기능은 데코레이터의 메서드에 구현합니다.
기존 기능이 그대로 필요한 부분은 데코레이터의 메서드가 기존 클래스의 메서드에게 요청을 전달하는 방식으로 구현합니다.
:::

### 7.1 사용 예시

```kotlin
class DelegatingCollection<T> (
	innnerList: Collection<T> = ArrayList<T>()
) : Collection<T> by innnerList {}
```

- 위 예시는 새로운 기능 없이 기존 클래스의 기능을 그대로 쓰는 경우입니다.

```kotlin
class CountingSet<T>(
        val innerSet: MutableCollection<T> = HashSet<T>()
) : MutableCollection<T> by innerSet {
  
    var objectsAdded = 0

    override fun add(element: T): Boolean {
        objectsAdded++
        return innerSet.add(element)
    }

    override fun addAll(c: Collection<T>): Boolean {
        objectsAdded += c.size
        return innerSet.addAll(c)
    }
}
```

- 위 예시는 add와 addAll 메서드에 대해서 새로운 기능을 정의한 경우입니다.

## 8 object

- object 키워드는 코틀린에서 싱글턴 객체를 선언하거나 클래스의 동반 객체를 정의할 때 사용합니다.
- object 키워드를 사용하면 클래스 정의와 인스턴스 생성을 동시에 처리합니다.
- object로 선언된 객체는 코드가 처음 실행될 때 단 한 번만 생성됩니다.

### 8.1 객체 선언: 싱글턴 쉽게 만들기

- object 키워드는 코틀린에서 싱글턴 패턴을 언어 차원에서 지원하는 강력한 기능입니다. 
  - 자바에서 복잡한 코드로 구현해야 했던 싱글턴을 간단하게 만들 수 있습니다.
- 객체 선언은 클래스를 정의하고 그 클래스의 인스턴스를 만들어 변수에 저장하는 모든 작업을 한 문장으로 처리합니다.
- 객체 선언에서는 생성자를 사용할 수 없습니다.
- 싱글턴 객체는 선언문이 있는 위치에서 생성자 호출 없이 즉시 생성됩니다.
- 객체 선언도 클래스나 인터페이스를 상속할 수 있습니다.

#### 8.1.1 object: 객체 선언 예시

```kotlin
import java.util.Comparator
import java.io.File

object CaseInsensitiveFileComparator : Comparator<File> {
  override fun compare(file1: File, file2: File): Int {
      return file1.path.compareTo(file2.path, ignoreCase = true)
  }
}

fun main(args: Array<String>) {
  println(CaseInsensitiveFileComparator.compare(File("/User"), File("/user")))
  val files = listOf(File("/Z"), File("/a"))
  println(files.sortedWith(CaseInsensitiveFileComparator))
}
```

- Comparator는 두 객체를 인자로 받아 비교하는 메서드입니다. Comparator 안에는 데이터를 저장할 필요가 없습니다.
- 어떤 클래스에 속한 객체를 비교할 때 사용하는 Comparator는 보통 클래스마다 단 하나만 있으면 됩니다.
- 따라서 Comparator 인스턴스를 만드는 방법으로 객체 선언이 가장 좋은 방법입니다.
- 싱글턴 객체를 사용할 때는 

### 8.2 companion object: 동반 객체

- 코틀린은 자바의 static 키워드를 지원하지 않습니다. 대신 다음을 사용합니다:
  - 패키지 수준의 최상위 함수
  - 객체 선언(object)
	- 동반 객체(companion object)
- 클래스 내부에 companion object를 선언하면 그 클래스의 동반 객체가 됩니다.
- 동반 객체는 자신을 감싸고 있는 클래스의 모든 private 멤버에 접근할 수 있습니다.
- 동반 객체의 멤버는 감싸는 클래스의 이름만으로 접근 가능합니다(마치 자바의 정적 메서드처럼).

:::info[최상위 함수]
최상위 함수는 private으로 표시된 클래스 비공개 멤버에 접근할 수 없습니다. 팩토리 메서드와 같이 클래스의 private 생성자에 접근해야 하는 경우 동반 객체가 이상적인 해결책입니다.
:::

#### 8.2.1 companion 사용 예시

```kotlin
class A {
    companion object {
        fun bar() {
            println("Companion object called")
        }
    }
}

fun main(args: Array<String>) {
    A.bar()
}
```

- 클래스 이름을 사용해 그 클래스에 속한 동반 객체의 메서드를 호출할 수 있습니다.

```kotlin
fun getFacebookName(accountId: Int) = "fb:$accountId"

class User private constructor(val nickname: String) {
    companion object {
        fun newSubscribingUser(email: String) =
            User(email.substringBefore('@'))

        fun newFacebookUser(accountId: Int) =
            User(getFacebookName(accountId))
    }
}

fun main(args: Array<String>) {
    val subscribingUser = User.newSubscribingUser("bob@gmail.com")
    val facebookUser = User.newFacebookUser(4)
    println(subscribingUser.nickname)
}
```

- 동반 객체는 클래스 내부 구조에 접근할 수 있어 팩토리 메서드 구현에 이상적입니다.
- 위 예제에서 User 생성자는 private으로 선언되어 직접 접근이 불가능합니다.
- 대신 동반 객체에 정의된 팩토리 메서드를 통해서만 인스턴스를 생성할 수 있습니다.
- 이 패턴은 인스턴스 생성 로직을 캡슐화하고 다양한 방식으로 객체를 생성할 수 있게 해줍니다.

#### 8.2.2 동반 객체 이름 붙이기

```kotlin
class Person(val name: String) {
    companion object Factory {
        fun create(name: String): Person = Person(name)
    }
}

fun main() {
    // 클래스 이름으로 접근
    val person1 = Person.create("John")
    
    // 동반 객체 이름으로도 접근 가능
    val person2 = Person.Factory.create("Jane")
}
```

- 동반 객체에 이름을 붙일 수 있지만, 이름을 생략하면 기본적으로 Companion이라는 이름이 사용됩니다.
- 이름을 붙이든 생략하든 클래스 이름만으로 멤버에 접근할 수 있습니다.

### 8.3 object와 companion object 비교

- 공통점
  - 두 방식 모두 클래스 정의와 동시에 인스턴스를 생성합니다.
  - 두 방식 모두 싱글턴 패턴을 구현하는 데 활용할 수 있습니다.
  - 두 방식 모두 인터페이스를 구현하거나 클래스를 상속할 수 있습니다.
- 차이점
  - object: 독립적인 싱글턴 객체를 생성
  - companion object: 특정 클래스에 종속된 싱글턴 객체를 생성하며, 해당 클래스의 private 멤버에 접근 가능

## 9 sealed class

### 9 sealed 클래스란?

- `sealed` 클래스는 특정 클래스 계층을 정의할 때 사용됩니다.
- `sealed` 클래스는 상위 클래스의 하위 클래스들을 제한할 수 있습니다.
- 이를 통해 특정 클래스의 하위 클래스를 미리 정의된 집합으로 한정할 수 있습니다.
	- 봉인된(sealed) 클래스를 직접 상속한 하위 클래스가 모두 컴파일 시점에 알려져 있어야 합니다.

### 9.1 sealed 클래스의 특징

- `sealed` 클래스의 하위 클래스들은 반드시 동일한 파일에 정의되어야 합니다.
- 이를 통해 클래스 계층의 구조를 명확하게 하고, 코드의 가독성을 높일 수 있습니다.
- `sealed` 클래스는 암시적으로 `abstract`이므로 직접 인스턴스화할 수 없습니다.
	- `sealed` 변경자가 추상 클래스임을 의미합니다. 따라서 `sealed` 클래스에 `abstract`를 붙일 필요는 없습니다.
- `sealed` 클래스의 하위 클래스들은 상위 클래스의 모든 추상 멤버를 구현해야 합니다.
- `sealed` 클래스로 표시된 클래스는 자동으로 `open`이 되어 하위 클래스에서 상속이 가능합니다.

### 9.2 사용 예시

- `sealed` 클래스를 사용하여 결과 타입을 정의할 수 있습니다.
- 아래 예시는 성공(Success)과 오류(Error) 상태를 나타내는 `Response` 클래스를 정의합니다.

```kotlin
sealed class Response<out T> {
    data class Success<out T>(val data: T) : Response<T>()
    
    data class Error(
        val errorCode: ErrorCode,
        val errorMessage: String,
        val fieldErrors: List<FieldError> = emptyList()
    ) : Response<Nothing>()
}

data class FieldError(
    val field: String,
    val message: String
)

enum class ErrorCode {
    INVALID_REQUEST,
    NOT_FOUND,
    INTERNAL_ERROR
}

```

- `Response` 클래스는 성공 응답과 오류 응답을 포함하는 sealed 클래스이다.
- `Success` 클래스는 데이터만 포함하며, `Error` 클래스는 오류 코드, 메시지, 필드 오류를 포함한다.

### 9.3 sealed 클래스의 장점

- `sealed` 클래스는 컴파일러가 모든 하위 클래스를 알고 있어, `when` 구문에서 모든 경우를 처리하도록 강제할 수 있습니다.
- 이는 `when` 구문에서 누락된 하위 클래스에 대해 컴파일러가 경고를 제공할 수 있음을 의미합니다.
- `sealed` 클래스를 사용하면 디폴트 분기를 사용하지 않아도 됩니다.

#### 예시

```kotlin
fun handleResponse(response: Response<Any>) {
    when(response) {
        is Response.Success -> {
            println("Success: ${response.data}")
        }
        is Response.Error -> {
            println("Error: ${response.errorCode}, ${response.errorMessage}")
        }
    }
}
```

- `Response` 클래스의 모든 하위 클래스가 처리되었는지 확인할 수 있습니다.
- `handleResponse` 함수는 `Response` 타입의 모든 하위 클래스에 대해 적절히 처리합니다.
- 나중에 새로운 하위 클래스가 추가되면 when 구문에서 컴파일러가 경고를 발생시킵니다.

### 9.4 sealed 인터페이스와 클래스

- 코틀린 1.5부터 `sealed` 인터페이스를 사용할 수 있습니다.
- 인터페이스도 클래스와 마찬가지로 특정 구현체들을 제한할 수 있습니다.

#### 예시

```kotlin
sealed interface Shape

data class Circle(val radius: Double) : Shape
data class Rectangle(val height: Double, val width: Double) : Shape
```

- `Shape` 인터페이스를 상속하는 `Circle`과 `Rectangle` 클래스는 반드시 동일한 파일에 정의되어야 합니다.
- 이는 `sealed` 클래스와 동일한 방식으로 작동합니다.

## 10. inline class

- 인라인 클래스를 사용하면 성능을 희생하지 않고 타입 안전성을 높일 수 있습니다.
- 인라인으로 표시하려면 클래스가 프로퍼티를 하나만 가져야 하며, 그 프로퍼티는 주 생성자에서 초기화되어야 합니다.
- 인라인 클래스는 계층에 참여하지 않습니다. 즉, 인라인 클래스는 다른 클래스를 상속할 수 없고 다른 클래스가 상속할 수도 없습니다.
- 어떤 클래스를 인라인 클래스로 만들기 위해서는 클래스 앞에 `value` 키워드를 붙이고 `@JvmInline` 애노테이션을 붙여야 합니다.