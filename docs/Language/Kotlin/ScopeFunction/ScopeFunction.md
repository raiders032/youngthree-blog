---
title: "Scope functions"
description: "코틀린의 스코프 함수(with, apply, let, also, run)의 개념과 차이점, 활용 패턴, 사용 시 모범 사례를 상세히 알아봅니다. 각 함수의 특성을 비교하고 실제 예제 코드로 명확한 사용법을 설명합니다."
tags: [ "KOTLIN", "FUNCTIONAL_PROGRAMMING", "SCOPE_FUNCTION", "BACKEND", "ANDROID", "MOBILE" ]
keywords: [ "코틀린", "kotlin", "스코프 함수", "scope function", "범위 함수", "with", "apply", "let", "also", "run", "함수형 프로그래밍", "functional programming", "수신 객체 지정 람다", "람다", "lambda", "확장 함수", "extension function", "안드로이드", "android" ]
draft: false
hide_title: true
---

## 1. 코틀린 스코프 함수 소개

- 스코프 함수(Scope functions)는 객체의 컨텍스트 내에서 코드 블록을 실행하기 위한 목적으로 존재하는 함수입니다.
- 이 함수들을 사용하면 객체의 이름을 반복하지 않고도 그 객체에 대해 여러 연산을 수행할 수 있습니다.
- 코틀린 표준 라이브러리는 다섯 가지 스코프 함수를 제공합니다: `with`, `apply`, `let`, `also`, `run`
- 이 함수들은 모두 람다식을 인자로 받고, 객체를 컨텍스트로 하여 특정 스코프에서 코드 블록을 실행합니다.

## 2. 스코프 함수의 공통점과 차이점

### 2.1 스코프 함수의 공통점

- 모든 스코프 함수는 코드 블록을 실행하기 위한 임시 스코프를 형성합니다.
- 이 스코프 내에서는 객체 이름을 사용하지 않고도 객체에 접근할 수 있습니다.
- 스코프 함수를 사용하면 코드의 가독성과 간결성이 향상됩니다.

### 2.2 스코프 함수의 차이점

스코프 함수들은 다음 세 가지 특성에 따라 구분됩니다:

1. **수신 객체 지정 방식**:
	- 수신 객체를 람다의 수신자(`this`)로 제공: `with`, `apply`, `run`
	- 수신 객체를 람다의 인자(`it`)로 제공: `let`, `also`
2. **반환 값**:
	- 컨텍스트 객체 반환: `apply`, `also`
	- 람다 결과 반환: `with`, `let`, `run`
3. **확장 함수 여부**:
	- 확장 함수로 호출: `apply`, `let`, `also`, `run`
	- 일반 함수로 호출: `with`

다음 표는 이러한 차이점을 요약합니다:

| 함수 | 수신 객체 참조 | 반환 값 | 확장 함수 여부 |
|------|------------|-------|------------|
| with | this | 람다 결과 | 일반 함수 |
| apply | this | 컨텍스트 객체 | 확장 함수 |
| run | this | 람다 결과 | 확장 함수 |
| let | it | 람다 결과 | 확장 함수 |
| also | it | 컨텍스트 객체 | 확장 함수 |

## 3. with 함수

`with`는 객체의 이름을 반복하지 않고도 그 객체의 멤버에 접근할 수 있게 해주는 함수입니다.

### 3.1 with 함수의 구조

```kotlin
inline fun <T, R> with(receiver: T, block: T.() -> R): R {
    return receiver.block()
}
```

- `receiver`: 수신 객체
- `block`: 수신 객체를 수신자(`this`)로 갖는 람다 블록
- 반환값: 람다 블록의 결과

### 3.2 with 사용 예시

**기본 예시**

```kotlin
// with 사용 전
val person = Person()
println(person.name)
println(person.age)
person.introduceYourself()

// with 사용 후
with(person) {
    println(name)       // person.name 대신
    println(age)        // person.age 대신
    introduceYourself() // person.introduceYourself() 대신
}
```

**StringBuilder로 문자열 만들기**

```kotlin
fun alphabet(): String {
    val stringBuilder = StringBuilder()
    return with(stringBuilder) {
        for (letter in 'A'..'Z') {
            append(letter)
        }
        append("\nNow I know the alphabet!")
        toString()
    }
}
```

더 간결하게 작성한 예시:

```kotlin
fun alphabet() = with(StringBuilder()) {
    for (letter in 'A'..'Z') {
        append(letter)
    }
    append("\nNow I know the alphabet!")
    toString()
}
```

### 3.3 with 사용 권장 상황

- 수신 객체를 변경하지 않고 멤버 함수를 여러 번 호출할 때
- 객체의 멤버에 대한 그룹 연산을 수행할 때
- 람다의 결과가 필요할 때
- 널이 아닌 객체에 대해 작업할 때

:::note
`with`는 확장 함수가 아니기 때문에 체이닝에 사용할 수 없습니다. 주로 지역 변수로 사용되는 객체에 적합합니다.
:::

## 4. apply 함수

`apply` 함수는 객체 초기화나 빌더 패턴 구현에 특히 유용합니다.

### 4.1 apply 함수의 구조

```kotlin
inline fun <T> T.apply(block: T.() -> Unit): T {
    block()
    return this
}
```

- `T`: 수신 객체 타입
- `block`: 수신 객체를 수신자(`this`)로 갖는 람다 블록
- 반환값: 수신 객체 자체

### 4.2 apply 사용 예시

**객체 초기화**

```kotlin
val peter = Person().apply {
    name = "Peter"
    age = 23
    email = "peter@example.com"
}
```

**문자열 빌더 사용**

```kotlin
fun alphabet() = StringBuilder().apply {
    for (letter in 'A'..'Z') {
        append(letter)
    }
    append("\nNow I know the alphabet!")
}.toString()
```

**뷰 설정(안드로이드)**

```kotlin
val textView = TextView(context).apply {
    text = "Sample Text"
    textSize = 20.0f
    setPadding(10, 0, 0, 0)
    setTextColor(Color.BLACK)
}
```

### 4.3 apply 사용 권장 상황

- 객체 초기화 시 프로퍼티를 설정할 때
- 빌더 패턴을 대체할 때
- 수신 객체 자신을 다시 반환해야 할 때
- 코드 블록 내에서 수신 객체를 변경해야 할 때

## 5. let 함수

`let` 함수는 nullable 객체를 처리하거나 지역 변수의 범위를 제한할 때 유용합니다.

### 5.1 let 함수의 구조

```kotlin
inline fun <T, R> T.let(block: (T) -> R): R {
    return block(this)
}
```

- `T`: 수신 객체 타입
- `block`: 수신 객체를 인자(`it`)로 갖는 람다 블록
- 반환값: 람다 블록의 결과

### 5.2 let 사용 예시

**널 체크 후 코드 실행**

```kotlin
val nullableName: String? = getNullableName()

// let 사용 전
if (nullableName != null) {
    println("Name length: ${nullableName.length}")
}

// let 사용 후
nullableName?.let {
    println("Name length: ${it.length}")
}
```

**지역 변수의 범위 제한**

```kotlin
val numbers = listOf("one", "two", "three", "four")
val modifiedList = numbers.map { it.uppercase() }.filter { it.length > 3 }.let {
    println("Elements count: ${it.size}")
    it.sorted()
}
```

**타입 변환과 동시에 연산 수행**

```kotlin
val str = "Hello"
val result = str.let {
    val firstChar = it.first().uppercase()
    val restChars = it.substring(1)
    firstChar + restChars
}
```

### 5.3 let 사용 권장 상황

- 널이 아닌 객체에 대해서만 코드 블록 실행할 때 (안전 호출 연산자 `?.`와 함께 사용)
- 지역 변수의 범위를 제한하고 싶을 때
- 하나의 표현식으로 여러 연산을 수행할 때
- 객체를 다른 타입으로 변환하고 결과를 사용할 때

## 6. also 함수

`also` 함수는 객체의 프로퍼티나 함수를 사용하는 것보다 객체 자체를 참조해야 할 때 유용합니다.

### 6.1 also 함수의 구조

```kotlin
inline fun <T> T.also(block: (T) -> Unit): T {
    block(this)
    return this
}
```

- `T`: 수신 객체 타입
- `block`: 수신 객체를 인자(`it`)로 갖는 람다 블록
- 반환값: 수신 객체 자체

### 6.2 also 사용 예시

**로깅이나 디버깅**

```kotlin
val numbers = mutableListOf("one", "two", "three")
numbers
    .also { println("The list before adding elements: $it") }
    .add("four")
```

**객체 유효성 검사**

```kotlin
class Book(author: Person) {
    val author = author.also {
        requireNotNull(it.age)
        println("Author's name: ${it.name}")
    }
}
```

**체이닝 중간에 추가 작업**

```kotlin
val peter = Person()
    .apply { name = "Peter" }
    .also { logPersonCreation(it) }
    .apply { age = 23 }
```

### 6.3 also 사용 권장 상황

- 객체 자체에 대한 참조가 필요할 때
- 로깅, 디버깅, 유효성 검사와 같은 부수 효과를 수행할 때
- 객체 자체를 다시 반환해야 할 때 (메서드 체이닝 시 유용)
- 객체 상태를 변경하지 않는 작업을 할 때

## 7. run 함수

`run` 함수는 객체 초기화와 결과 계산을 동시에 해야 할 때 유용합니다.

### 7.1 run 함수의 구조

**수신 객체의 확장 함수로서의 run**

```kotlin
inline fun <T, R> T.run(block: T.() -> R): R {
    return block()
}
```

**수신 객체 없는 버전의 run**

```kotlin
inline fun <R> run(block: () -> R): R {
    return block()
}
```

- `T`: 수신 객체 타입 (확장 함수 버전만)
- `block`: 람다 블록 (수신 객체 버전은 `this`로, 비-수신 객체 버전은 인자 없음)
- 반환값: 람다 블록의 결과

### 7.2 run 사용 예시

**객체 초기화와 계산을 한 번에**

```kotlin
val result = user.run {
    processBirthday()  // 사용자 나이 업데이트
    calculateBonus()   // 새로운 나이를 기준으로 보너스 계산
}
```

**지역 변수 범위 제한과 결과 계산**

```kotlin
val inserted: Boolean = run {
    val person = getPerson()
    val personDao = getPersonDao()
    personDao.insert(person)
}
```

**수신 객체 없는 버전**

```kotlin
val hexNumberRegex = run {
    val digits = "0-9"
    val hexDigits = "A-Fa-f"
    val sign = "+-"
    
    Regex("[$sign]?[$digits$hexDigits]+")
}
```

### 7.3 run 사용 권장 상황

- 객체 초기화와 반환 값 계산을 한 번에 처리할 때
- 지역 변수의 범위를 제한할 때
- 복잡한 표현식이나 여러 지역 변수가 필요한 계산에서 가독성을 높일 때
- 람다의 결과를 반환해야 할 때

## 8. 스코프 함수 사용 모범 사례

### 8.1 함수 선택 가이드라인

다음 질문에 따라 적절한 스코프 함수를 선택할 수 있습니다:

1. **객체 참조 방식**:
	- `this`로 수신 객체 멤버에 접근하고 싶다면: `with`, `apply`, `run`
	- `it`으로 객체를 명시적으로 참조하고 싶다면: `let`, `also`
2. **반환 값**:
	- 객체 자체를 반환하고 싶다면: `apply`, `also`
	- 람다 결과를 반환하고 싶다면: `with`, `let`, `run`
3. **사용 목적**:
	- 객체 초기화 및 구성: `apply`
	- 널 체크 후 코드 실행: `let`
	- 부수 효과 및 로깅: `also`
	- 객체 변환: `let`
	- 그룹 함수 호출: `with`
	- 표현식으로 값 계산: `run`

### 8.2 스코프 함수 중첩 사용 시 주의사항

- 스코프 함수를 과도하게 중첩하면 코드 가독성이 떨어질 수 있습니다.
- `this`를 사용하는 스코프 함수(`with`, `apply`, `run`)를 중첩해서 사용하면 현재 컨텍스트가 어느 객체인지 혼란스러울 수 있습니다.
- `it`을 사용하는 스코프 함수(`let`, `also`)를 중첩할 때는 매개변수 이름을 명시적으로 지정하는 것이 좋습니다.

```kotlin
// 좋지 않은 예
person.let {
    it.let {
        it.name = "New name"  // 어떤 'it'인지 혼란스러움
    }
}

// 좋은 예
person.let { person ->
    person.address.let { address ->
        address.city = "New York"
    }
}
```

### 8.3 체이닝 사용 권장 사례

스코프 함수를 체이닝하여 사용하면 가독성을 높일 수 있습니다:

```kotlin
val person = Person().apply {
    name = "John"
    age = 30
}.also {
    logPersonCreation(it)
}.run {
    if (age > 18) {
        "성인"
    } else {
        "미성년자"
    }
}
```

이 예시에서:
1. `apply`로 Person 객체를 초기화합니다.
2. `also`로 생성 로그를 남깁니다.
3. `run`으로 나이에 따른 구분을 계산합니다.

## 9. 실전 예제: 스코프 함수 활용 패턴

### 9.1 빌더 패턴 대체

```kotlin
data class EmailBuilder(
    var to: String = "",
    var subject: String = "",
    var body: String = ""
)

fun sendEmail(builder: EmailBuilder.() -> Unit) {
    val email = EmailBuilder().apply(builder)
    // 이메일 전송 로직...
    println("Email to ${email.to} with subject '${email.subject}' sent!")
}

// 사용 예
fun main() {
    sendEmail {
        to = "john@example.com"
        subject = "Kotlin Scope Functions"
        body = "Hello, check out these awesome functions!"
    }
}
```

### 9.2 리소스 관리 패턴

```kotlin
inline fun <T : Closeable, R> T.use(block: (T) -> R): R {
    var exception: Throwable? = null
    try {
        return block(this)
    } catch (e: Throwable) {
        exception = e
        throw e
    } finally {
        when {
            exception == null -> close()
            else -> try {
                close()
            } catch (closeException: Throwable) {
                // 원래 예외에 추가 정보로 추가
                exception.addSuppressed(closeException)
            }
        }
    }
}

// 사용 예
fun readFirstLine(path: String): String {
    BufferedReader(FileReader(path)).use { reader ->
        return reader.readLine()
    }
}
```

### 9.3 SQL 빌더 예제

```kotlin
private fun insert(user: User) = SqlBuilder().apply {
    append("INSERT INTO user (email, name, age) VALUES ")
    append("(?", user.email)
    append(",?", user.name)
    append(",?)", user.age)
}.also {
    println("Executing SQL update: $it")
}.run {
    jdbc.update(toString()) > 0
}
```

이 예제는:
1. `apply`로 SQL 문을 구성합니다.
2. `also`로 실행할 SQL을 로깅합니다.
3. `run`으로 SQL을 실행하고 성공 여부를 반환합니다.

## 10. 결론

- 코틀린의 스코프 함수(`with`, `apply`, `let`, `also`, `run`)는 코드의 가독성과 간결성을 높이는 강력한 도구입니다. 
- 각 함수는 특정 사용 사례에 맞게 설계되었으며, 이러한 함수들을 적절히 활용하면 더 표현력 있고 유지보수하기 쉬운 코드를 작성할 수 있습니다.

참고

- https://medium.com/@fatihcoskun/kotlin-scoping-functions-apply-vs-with-let-also-run-816e4efb75f5