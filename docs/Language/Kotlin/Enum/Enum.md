## 1. Enum

- 코틀린에서 enum은 소프트 키워드입니다.
  - 소프트 키워드의 의미는 class 앞에서만 특별한 의미를 지니지만 다른 곳에서는 일반적인 이름에 사용할 수 있습니다.
  - 반면 class는 키워드라서 이름으로 class를 사용할 수 없어 clazz나 aClass와 같은 이름을 사용합니다.

**enum 선언**

```kotlin
enum class Color {
    RED, ORANGE, YELLOW, GREEN, BLUE, INDIGO, VIOLET
}
```

## 2. 프로퍼티와 메서드

- 자바와 마찬가지로 enum은 단순히 값만 열거하는 존재가 아닙니다.
  - enum은 프로퍼티와 메서드를 가질 수 있습니다.
- 코틀린에서 `;`이 필수인 부분
	- enum에서 메서드를 정의할 경우 상수 목록과 메서드 정의 사이에 반드시 `;`을 넣어야 합니다.

### 2.1 예시

```kotlin
enum class Color(val r: Int, val g: Int, val b: Int) {
    RED(255, 0, 0),
    ORANGE(255, 165, 0),
    YELLOW(255, 255, 0),
    GREEN(0, 255, 0),
    BLUE(0, 0, 255),
    INDIGO(75, 0, 130),
    VIOLET(238, 130, 238);
    
    fun rgb() = (r * 256 + g) * 256 + b
    fun printColor() = println("'$this is $rgb")
}
```

- 이넘 상수의 프로퍼티 r, g, b는 각각 색상의 빨강, 초록, 파랑 성분을 나타냅니다.
- 각 상수를 생성할 때 r, g, b 값을 지정합니다.
- 위 예시에서 코틀린에서 유일하게 `;`을 사용한 부분을 볼 수 있습니다.
  - 이넘 상수 목록과 메서드 정의 사이에 반드시 `;`을 넣어야 합니다.