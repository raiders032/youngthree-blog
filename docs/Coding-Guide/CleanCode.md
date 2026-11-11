## 1. Clean Code

- 이 문서는 LLM이 코드를 작성/리뷰할 때 참고할 **지침서**이다.
- `Clean Code`(로버트 C. 마틴)와 `이펙티브 코틀린`(마르친 모스칼라)에서 다루는 원칙 중, 언어에 상관없이 통용되는 공통 원칙과 코틀린에 특화된 원칙을 함께 정리한다.
- 각 섹션은 "원칙 → 이유 → 코틀린 예시" 순서로 구성한다.

## 2. 이름 짓기 (Naming)

- 변수, 함수, 클래스의 이름만 보고도 **의도가 드러나야 한다.** 주석으로 의도를 보완해야 한다면 이름을 다시 지어야 한다는 신호다.
- 발음하기 어렵거나 축약된 이름(`mngr`, `tmp`, `data2`)을 쓰지 않는다.
- 한 개념에는 한 단어만 사용한다. (`fetch`/`get`/`retrieve`를 프로젝트 안에서 혼용하지 않기)
- 불리언 값은 `is`, `has`, `can` 등으로 시작해 참/거짓 의미를 명확히 한다. (`isValid`, `hasNext`)
- 컬렉션 타입임을 이름에서 유추할 수 있게 한다. (`users` 단수/복수 구분, `userList`처럼 타입명을 억지로 넣지 않기)
- 검색으로 찾기 쉬운 이름을 사용한다. 매직 넘버 대신 상수로 추출한다.

```kotlin
// Bad
val d: Int = 7 // 무엇의 7인지 알 수 없다

// Good
const val DAYS_IN_WEEK = 7
```

## 3. 함수 설계

### 3.1 작게, 한 가지 일만

- 함수는 **한 가지 일**만 해야 하고, 그 일을 **잘** 해야 한다.
- 함수 하나의 들여쓰기 depth는 1~2단계를 넘지 않는 것이 좋다. depth가 깊어지면 조기 반환(early return), 가드 절(guard clause), 함수 추출로 해소한다.
- 함수 이름이 `~그리고~` 형태(`validateAndSave`)가 된다면 함수를 분리할 신호다.

```kotlin
// Bad
fun processOrder(order: Order) {
    if (order.isValid()) {
        if (order.items.isNotEmpty()) {
            // 저장 로직
        }
    }
}

// Good
fun processOrder(order: Order) {
    if (!order.isValid()) return
    if (order.items.isEmpty()) return
    save(order)
}
```

### 3.2 함수당 추상화 수준은 하나로

- 한 함수 안에서 고수준 정책과 저수준 구현 세부사항을 섞지 않는다. 함수를 읽었을 때 모든 문장이 비슷한 "추상화 수준"에 있어야 한다.
- 추상화 수준이 섞이면 무엇이 핵심 로직이고 무엇이 세부 구현인지 구분하기 어려워진다. 세부 구현은 이름이 붙은 함수로 추출해 한 단계 아래로 내린다.
- "내려가기 규칙(Stepdown Rule)": 코드를 위에서 아래로 읽었을 때 추상화 수준이 한 단계씩 낮아지도록 함수를 배치한다.

```kotlin
// Bad: 정책(주문 처리)과 구현 세부사항(문자열 포맷팅, DB 커넥션)이 섞여 있다
fun processOrder(order: Order) {
    if (!order.isValid()) return

    val summary = "Order#${order.id} - ${order.items.joinToString(",") { it.name }}"
    println(summary)

    val connection = DriverManager.getConnection(DB_URL)
    connection.use { it.prepareStatement(INSERT_SQL).execute() }
}

// Good: 각 함수가 한 가지 추상화 수준을 유지한다
fun processOrder(order: Order) {
    if (!order.isValid()) return
    logSummary(order)
    save(order)
}

private fun logSummary(order: Order) {
    println("Order#${order.id} - ${order.items.joinToString(",") { it.name }}")
}

private fun save(order: Order) {
    DriverManager.getConnection(DB_URL).use { it.prepareStatement(INSERT_SQL).execute() }
}
```

### 3.3 매개변수는 적게

- 인자가 3개를 넘어가면 관련된 값들을 데이터 클래스로 묶는 것을 고려한다.
- 코틀린은 **이름 있는 인자(named argument)** 와 **기본값(default parameter)** 을 지원하므로, 자바식 점층적 생성자/오버로딩 대신 이를 활용한다.

```kotlin
// Bad: 자바 스타일의 오버로딩
fun createUser(name: String) = createUser(name, 0)
fun createUser(name: String, age: Int) = createUser(name, age, null)

// Good
fun createUser(name: String, age: Int = 0, email: String? = null): User
```

### 3.4 부수 효과(side effect) 최소화, 명령과 조회 분리

- 함수는 이름에서 기대되는 동작 외의 부수 효과를 숨겨서는 안 된다.
- **CQS(Command-Query Separation)**: 값을 반환하는 함수는 상태를 변경하지 않고, 상태를 변경하는 함수는 값을 반환하지 않도록 분리한다.

```kotlin
// Bad: 조회처럼 보이지만 상태를 변경한다
fun getNextId(): Int = nextId++

// Good: 이름으로 부수 효과를 드러낸다
fun incrementAndGetId(): Int = ++nextId
```

## 4. 가변성 제한 (Mutability)

- 가변 상태는 추론, 테스트, 동시성 관리를 모두 어렵게 만든다. **기본은 불변**으로 설계하고, 필요할 때만 가변을 허용한다.
- `var`보다 `val`을, 가변 컬렉션(`MutableList`)보다 읽기 전용 컬렉션(`List`)을 우선 사용한다.
- 클래스 프로퍼티도 가능하면 `val`로 선언하고, 상태 변경이 필요하면 `data class`의 `copy()`로 새 인스턴스를 만드는 방식을 고려한다.
- 읽기 전용으로 선언했다고 완전히 불변인 것은 아니다. `val list = mutableListOf(...)`처럼 읽기 전용 참조가 가변 객체를 가리킬 수 있음에 주의한다.

```kotlin
// Bad
class User(var name: String, var age: Int)

// Good
data class User(val name: String, val age: Int)
val olderUser = user.copy(age = user.age + 1)
```

## 5. Null 안정성

- 플랫폼 타입(자바 상호운용 시 `String!`)을 그대로 흘려보내지 말고, 진입점에서 즉시 널 가능 여부를 명시적으로 처리한다.
- `!!`(non-null assertion)는 널이 절대 발생할 수 없음을 증명할 수 있을 때만 사용한다. 근거 없는 `!!`는 런타임 `NullPointerException`을 코드에 심는 것과 같다.
- 안전 호출(`?.`), 엘비스 연산자(`?:`), `let`을 조합해 널을 값으로 다룬다.
- 예외적인 상황을 널로 표현할지, sealed class(`Result`, `Either`)로 표현할지 의도적으로 선택한다. 단순 부재는 `null`, 실패 이유를 설명해야 한다면 예외나 sealed 타입을 사용한다.

```kotlin
// Bad
fun findUser(id: Long): User = repository.find(id)!!

// Good
fun findUser(id: Long): User? = repository.find(id)

val name = findUser(id)?.name ?: "Unknown"
```

## 6. 클래스와 타입 설계

- **캡슐화**: 프로퍼티를 외부에 그대로 노출하지 말고, 불변식(invariant)이 있다면 생성자/setter에서 검증한다.
- **상속보다 컴포지션**: `open class`를 만들기 전에 인터페이스 위임(`by`)이나 컴포지션으로 해결할 수 없는지 먼저 검토한다. 상속을 허용할 클래스가 아니라면 기본적으로 `final`(코틀린 기본값)을 유지한다.
- 다형성이 필요한 상태를 표현할 때는 `sealed class`/`sealed interface`로 닫힌 계층을 만들어 `when` 분기에서 컴파일 타임에 누락을 방지한다.
- 객체 생성이 복잡하면(선택 인자가 많고 유효성 검증이 필요하면) 기본값 있는 생성자 → 빌더 → DSL 순으로 필요에 따라 단계적으로 고려한다. 코틀린에서는 기본값 있는 생성자만으로 해결되는 경우가 대부분이다.

```kotlin
sealed interface PaymentResult
data class Success(val transactionId: String) : PaymentResult
data class Failure(val reason: String) : PaymentResult

fun handle(result: PaymentResult) = when (result) {
    is Success -> log("성공: ${result.transactionId}")
    is Failure -> log("실패: ${result.reason}")
    // else 분기 불필요 - sealed이므로 컴파일러가 누락을 검출
}
```

## 7. 에러 처리

- 예외는 **예외적인 상황**에만 사용한다. 흐름 제어(정상적인 분기)를 예외로 처리하지 않는다.
- 한 함수 안에서 처리 로직과 에러 처리 로직을 섞지 않는다. `try-catch` 블록의 범위를 최소화하고, 가능하면 에러 처리를 별도 함수로 추출한다.
- 실패가 예상되는 도메인 로직(입력 검증, 네트워크 호출 등)은 예외 대신 `Result<T>`나 커스텀 sealed 타입으로 실패를 값으로 다루는 것을 고려한다. 예외는 스택 트레이스 비용이 크고 호출부에서 놓치기 쉽다.
- 빈 `catch` 블록으로 예외를 삼키지 않는다. 최소한 로그를 남기거나 의도적으로 무시하는 이유를 주석으로 남긴다.
- 표준 예외(`IllegalArgumentException`, `IllegalStateException`, `NoSuchElementException` 등)를 우선 사용하고, 커스텀 예외는 호출자가 실제로 다르게 처리해야 할 때만 만든다.

```kotlin
// Bad
fun parse(input: String): Int {
    try {
        return input.toInt()
    } catch (e: Exception) {
        return 0 // 실패가 조용히 숨겨진다
    }
}

// Good
fun parse(input: String): Int? = input.toIntOrNull()
```

## 8. 주석과 가독성

- **좋은 코드는 주석이 필요 없는 코드다.** 주석을 쓰기 전에 함수/변수 이름을 바꿔서 해결할 수 없는지 먼저 확인한다.
- 코드가 "왜"(why) 그렇게 작성되었는지(비즈니스 제약, 알려진 버그 우회, 성능 트레이드오프) 설명할 때만 주석을 남긴다. "무엇을"(what) 하는지는 코드 자체가 설명해야 한다.
- 주석 처리된 죽은 코드, 이력 정보(작성자/날짜), TODO 없는 임시 주석은 남기지 않는다. 버전 관리 시스템이 이력을 담당한다.
- KDoc은 공개 API(라이브러리, 모듈 경계)에는 유용하지만, 내부 구현 세부사항까지 문서화할 필요는 없다.

## 9. 코틀린다운 코드 작성

- **확장 함수**는 남용하지 않는다. 클래스의 핵심 책임에 가까운 동작은 멤버 함수로, 부가적인 유틸리티는 확장 함수로 분리한다.
- `apply`, `let`, `run`, `also`, `with` 등 스코프 함수는 가독성을 높일 때만 사용한다. 중첩해서 사용하면 오히려 가독성이 떨어지므로 지양한다.
- 큰 컬렉션을 여러 단계로 변환할 때는 `List` 대신 `Sequence`를 사용해 중간 컬렉션 생성을 피한다. 단, 작은 컬렉션이나 단일 연산에는 `Sequence`의 오버헤드가 오히려 손해이므로 무조건적으로 쓰지 않는다.
- 데이터를 표현할 때는 `data class`, 상태 없는 로직 묶음은 `object`(싱글턴)나 최상위 함수로 표현한다.
- 연산자 오버로딩, 인픽스 함수는 도메인에서 자연스러운 경우에만 사용한다. 남용하면 코드를 읽는 사람이 실제 동작을 추측해야 한다.

## 10. 동시성 (Coroutines)

- 코루틴 스코프는 구조화된 동시성(structured concurrency) 원칙을 따른다. `GlobalScope`처럼 생명주기가 관리되지 않는 스코프 사용을 피한다.
- `CancellationException`은 흡수하지 않는다. `catch (e: Exception)`으로 모든 예외를 잡을 때 취소 예외까지 삼키면 코루틴 취소가 전파되지 않는다.
- 공유 가변 상태에 여러 코루틴이 동시에 접근한다면, 락 대신 `Mutex`나 액터 패턴, 혹은 애초에 상태를 불변으로 설계하는 방법을 우선 검토한다.
- blocking 호출(네트워크 I/O, 파일 I/O 등)은 `Dispatchers.IO`로 옮기고, `Dispatchers.Main`/기본 디스패처를 블로킹하지 않는다.

## 11. 테스트 가능한 코드

- 테스트하기 쉬운 코드가 대체로 잘 설계된 코드다. 함수/클래스가 테스트하기 어렵다면 의존성이 과도하거나 책임이 섞여 있다는 신호로 받아들인다.
- 테스트는 F.I.R.S.T 원칙을 따른다: Fast(빠르게), Independent(독립적으로), Repeatable(반복 가능하게), Self-Validating(스스로 검증), Timely(적시에 작성).
- 하나의 테스트는 하나의 개념만 검증한다. `Given-When-Then` 구조로 준비-실행-검증을 분리한다.
- 시간, 랜덤 값, 전역 상태처럼 테스트를 비결정적으로 만드는 의존성은 주입 가능한 형태로 분리한다.

## 12. LLM 코드 생성 체크리스트

코드를 작성/수정한 뒤 아래 항목을 스스로 점검한다.

- [ ] 이름만 보고 의도를 알 수 있는가? 주석으로 이름을 보완하고 있지 않은가?
- [ ] 함수가 한 가지 일만 하는가? 들여쓰기가 2단계를 넘지 않는가?
- [ ] `var`, `MutableList` 등 가변 상태를 꼭 필요한 곳에서만 사용했는가?
- [ ] `!!`를 근거 없이 사용하지 않았는가? 널 가능성을 타입으로 드러냈는가?
- [ ] 예외를 흐름 제어에 사용하지 않았는가? 실패 케이스를 값으로 표현할 수 있는가?
- [ ] 빈 catch 블록, 삼켜진 예외가 없는가?
- [ ] 기존 코드 스타일(네이밍, 구조)과 일관성이 있는가?
- [ ] 요청한 범위를 벗어난 리팩터링/기능 추가를 하지 않았는가? (YAGNI)
- [ ] 중복 로직이 있다면 기존 유틸/함수를 재사용했는가? (DRY, 그러나 섣부른 추상화는 피한다)
- [ ] 테스트로 검증 가능한 구조인가?

## 참고

- Robert C. Martin, *Clean Code: A Handbook of Agile Software Craftsmanship*
- Marcin Moskała, *Effective Kotlin*
- https://blog.goorm.io/commit_14th_sketch/
