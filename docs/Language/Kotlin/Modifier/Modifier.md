## 1 Access Modifier

- 코틀린에는 `public`, `private`, `protected`, `internal` 4가지의 접근 지시자가 있습니다.
- 코틀린의 기본 가시성은 `public`입니다.
- 자바의 기본 가시성인 `package-private`는 코틀린에 존재하지 않습니다.
- 코틀린은 패키지를 네임스페이스를 관리하기 위한 용도로만 사용합니다.
- `package-private`의 대안으로 코틀린에서는 `internal`이라는 새로운 접근 지시자를 도입했습니다.
- `internal`은 모듈 내부에서만 볼 수 있음을 나타냅니다.
	- 여기서 모듈이란 한 번에 한꺼번에 컴파일 되는 코틀린 파일을 의미합니다.
	- IntelliJ, 이클립스, 메이븐, gradle 등의 프로젝트가 모듈이 될 수 있습니다.
	- `internal` 키워드의 주요 목적은 모듈 외부에 노출하지 않고 모듈 내부에서만 사용할 수 있는 클래스나 함수를 정의하는 것입니다.
	- 이를 통해 모듈 외부로부터의 불필요한 접근을 방지하여 캡슐화와 코드의 안정성을 향상시킬 수 있습니다.
		- 예를 들어, 어떤 라이브러리를 개발하는 경우에 `internal` 클래스나 함수는 라이브러리 사용자가 볼 필요가 없는 내부 구현 세부사항을 숨기는 데 유용합니다.
		- 이렇게 함으로써 라이브러리의 API를 더 깔끔하게 유지할 수 있습니다.

### 1.1 public

- `public`은 어디서나 접근 가능한 가장 개방적인 접근 지시자입니다.
- 클래스, 함수, 프로퍼티 등 모든 요소에 적용할 수 있습니다.
- 코틀린에서는 접근 지시자를 명시하지 않으면 기본적으로 `public`으로 간주됩니다.
- 예를 들어, `public class MyClass`와 `class MyClass`는 동일한 의미입니다.

### 1.2 private

- `private`은 선언된 클래스 내부에서만 접근 가능한 가장 제한적인 접근 지시자입니다.
- 클래스 외부에서는 접근할 수 없으며, 상속받은 클래스에서도 접근이 불가능합니다.
- 파일의 최상위 수준에서 선언된 `private` 요소는 해당 파일 내에서만 접근이 가능합니다.

**예시**

```kotlin
class MyClass {
    private val secretValue = 42
    
    fun accessSecret() {
        println(secretValue) // 클래스 내부에서는 접근 가능
    }
}

fun main() {
    val instance = MyClass()
    // println(instance.secretValue) // 컴파일 오류: private 접근 불가
}
```

### 1.3 protected

- `protected`는 선언된 클래스와 그 클래스를 상속받은 하위 클래스에서만 접근 가능합니다.
- 자바와 달리, 코틀린에서 `protected` 멤버는 같은 패키지의 다른 클래스에서 접근할 수 없습니다.
- 최상위 선언에 적용할 수 없습니다.

**예시**

```kotlin
open class Base {
    protected val protectedValue = 10
}

class Derived : Base() {
    fun accessProtected() {
        println(protectedValue) // 상속받은 클래스에서 접근 가능
    }
}

fun main() {
    val base = Base()
    // println(base.protectedValue) // 컴파일 오류: protected 접근 불가
}
```

### 1.4 internal

- `internal`은 같은 모듈 내에서만 접근 가능한 접근 지시자이다.
- 모듈은 함께 컴파일되는 코틀린 파일의 집합을 의미한다.
- 이는 자바의 `package-private`과 유사하지만, 패키지 단위가 아닌 모듈 단위로 접근을 제한한다

**예시**

```kotlin
// ModuleA.kt
internal class InternalClass {
    fun doSomething() = println("InternalClass is doing something")
}

// 같은 모듈의 다른 파일
fun useInternalClass() {
    val instance = InternalClass() // 같은 모듈이므로 접근 가능
    instance.doSomething()
}

// 다른 모듈에서는 InternalClass에 접근할 수 없음
```

이러한 다양한 접근 지시자를 통해 코틀린은 캡슐화를 강화하고, 코드의 안정성과 유지보수성을 향상시킬 수 있다.

## 2 상속과 관련된 Modifier

### 2.1 final

- 자바에서는 클래스의 상속을 막거나 메서드의 오버라이딩을 막기 위해 `final`을 명시적으로 붙여야 했습니다.
- 코틀린의 클래스와 메서드는 기본적으로 `final`입니다.
	- 따라서 하위 클래스를 만들수 없고, 기반 클래스의 메서드를 하위 클래스가 오버라이드할 수도 없습니다.
- 클래스의 상속을 허용하려면 클래스 앞에 `open`변경자를 붙여야 합니다.
- 오버라이드를 허용하고 싶은 메서드나 프로퍼티 앞에도 `open`변경자를 붙여야 합니다.

:::info[취약한 기반 클래스]
하위 클래스가 기반 클래스에 대해 가졌던 가정이 기반 클래스를 변경함으로써 깨져버리는 경우에 생깁니다. 이런 경우 기반 클래스를 변경하는 경우 하위 클래스의 동작이 예기치 않게 바뀔 수 있습니다. 따라서 상속을 위한
설계 문서를 갖추거나, 그럴 수 없다면 상속을 금지하라는 조슈아 블로크의 조언에 따라 코틀린은 클래스와 메서드를 기본적으로  `final`로 만들었습니다.
:::

### 2.2 open

- 코틀린의 클래스와 메서드는 기본적으로  `final`입니다.
- 클래스의 상속을 허용하려면 클래스 앞에 `open`변경자를 붙여야 합니다.
- 오버라이드를 허용하고 싶은 메서드나 프로퍼티 앞에도 `open`변경자를 붙여야 한다.

#### 2.2.1 예시

```kotlin
open class RichButton: Clickable {
    fun disable() {} // 해당 함수는 final으로 하위 클래스가 오버라이딩할 수 없다.
    open fun animate() {} // 해당 함수는 open. 하위 클래스가 오버라이딩할 수 있다.
    override fun click() {} // 오버라이드한 메서드는 기본적으로 open이다.
}
```

- RichButton 클래스는 open으로 선언되어 다른 클래스가 이 클래스를 상속할 수 있습니다.
- disable 메서드는 final로 선언되어 하위 클래스에서 오버라이드할 수 없습니다.
- animate 메서드는 open으로 선언되어 하위 클래스에서 오버라이드할 수 있습니다.
- click 메서드는 Clickable 인터페이스를 구현하기 위해 오버라이드한 메서드입니다.
  - 오버라이드한 메서드는 기본적으로 open이다.
  - 오버라이드한 메서드의 구현을 하위 클래스에서 오버라이드하지 못하게 하려면 메서드 앞에 `final`을 붙여야 합니다.

```kotlin
class ThemeButton : RichButton() {
		override fun animate() {
				// 애니메이션 구현
		}
		
		override fun click() {
				// 클릭 이벤트 구현
		}
		
		override fun showOff() {
		}
}
```

- ThemeButton 클래스는 RichButton 클래스를 상속받은 클래스입니다.
- animate 메서드는 RichButton 클래스에서 open으로 선언되어 있으므로 ThemeButton 클래스에서 오버라이드할 수 있습니다
- click 메서드는 RichButton 클래스에서 오버라이드한 메서드입니다. 명시적으로 final을 지정하지 않았으므로 ThemeButton 클래스에서 오버라이드할 수 있습니다.
- showOff 메서드는 Clickable 인터페이스의 메서드입니다. RichButton에서 오버라이드하지 않았지만 여기서 오버라이드할 수 있습니다.

### 2.3 override

- 상위 클래스나 상위 인스턴스의 멤버를 오버라이딩 할 때는 `override` 키워드를 붙여야 합니다.
- 오버라이드하는 멤버는 기본적으로 `open`입니다. 하위 클래스의 오버라이드를 금지하려면 `final`을 붙여야 합니다.

### 2.4 abstract

- `abstract`는 추상 클래스를 정의할 때 사용합니다.
- 추상 클래스는 인스턴스화 할 수 없습니다.
- 추상 클래스는 구현이 없어 하위 클래스에서 오버라이딩해야만 하는 후상 멤버를 가지는 것이 일반적입니다.
- 추상 멤버는 `abstract`로 선언하며 항상 `open`입니다. 따라서 `open`을 명시할 필요는 없습니다.

#### 2.4.1 예시

```kotlin
abstract class AbstractClass {
		abstract fun abstractMethod() // 추상 메서드
		open fun openMethod() {} // 오버라이드 가능
		final fun finalMethod() {} // 오버라이드 불가능
}