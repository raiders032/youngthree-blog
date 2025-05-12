## 1 Interface

- 코틀린의 Interface는 자바 8의 Interface와 비슷합니다.
- 추상 메서드뿐아니라 구현이 있는 메서드도 정의할 수 있습니다.
	- 자바 8의 디폴트 메서드와 유사합니다.
- 다만 인터페이스에는 아무런 상태(필드)가 들어갈 수 없습니다.

### 1.1 Interface 정의

```kotlin
interface Clickable {
  fun click()
}
```

- click이라는 추상 메서드가 있는 Interface를 정의했습니다.
- 이 인터페이스를 구현하는 클래스는 click 메서드를 구현해야 합니다.

### 1.2 구현이 있는 메서드

- 자바에서는 구현이 있는 메서드 앞에 `default` 키워드를 붙여야합니다.
- 하지만 코틀린에서는 별다른 키워드가 필요 없고 메서드 본문을 시그니처 뒤에 추가하면 됩니다.
- 아래의 showOff 메서드의 경우 자식에서 새로운 동작을 정의할 수도 있고 정의를 생략하면 디폴트 구현을 사용됩니다.

```kotlin
interface Clickable {
    fun click()
    fun showOff() = println("I'm clickable!")
}
```

- showOff 메서드는 구현이 있는 메서드입니다.
- 구현 클래스는 showOff 오버라이드하여 새로운 동작을 정의할 수 있고 정의를 생략하면 디폴트 구현을 사용합니다.

### 1.3 Interface 구현

- 자바에서는 `extends`와 `implement` 키워드를 사용하지만 코틀린에서는 클래스 이름에 `:`을 붙이고 인터페이스와 클래스 이름을 적는 것으로 클래스 확장과 인터페이스 구현을 모두 처리합니다.
- 자바의 `@Override`와 비슷한 `override` 변경자는 상위 클래스나 인터페이스에 있는 프로퍼티나 메서드를 오버라이드한다는 표시입니다.
- 자바와 달리 `override` 변경자를 꼭 사용해야 합니다.
	- 상위 클래스의 메서드와 시그니처가 같은 메서드가 하위 클래스에 선언되면 컴파일 에러가 발생합니다.
	- 이런 경우 `override`를 붙이거나 메서드 이름을 변경해 시그니처를 다르게해야 합니다.

```kotlin
class Button : Clickable {
    override fun click() = println("I was clicked")
}
```

- 위 예시에서 `Button` 클래스는 `Clickable` 인터페이스를 구현하고 있습니다.

