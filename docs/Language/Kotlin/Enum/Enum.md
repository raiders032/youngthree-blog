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

## 3. JSON 직렬화와 역직렬화

### 3.1 기본 동작

- 별도 설정 없이 enum을 JSON으로 직렬화하면 **enum의 name**이 문자열로 변환됩니다.

```kotlin
enum class Status {
    PENDING, APPROVED, REJECTED
}

// 직렬화 결과: "PENDING"
```

### 3.2 Jackson 사용

Spring Boot에서 기본으로 사용하는 Jackson 라이브러리를 활용한 방법입니다.

**@JsonValue로 특정 값 사용**

```kotlin
enum class Status(
    @JsonValue val code: String
) {
    PENDING("pending"),
    APPROVED("approved"),
    REJECTED("rejected")
}

// 직렬화 결과: "pending"
```

**@JsonCreator로 역직렬화 커스터마이징**

```kotlin
enum class Status(val code: String) {
    PENDING("pending"),
    APPROVED("approved"),
    REJECTED("rejected");

    companion object {
        @JvmStatic
        @JsonCreator
        fun fromCode(code: String): Status =
            entries.find { it.code == code }
                ?: throw IllegalArgumentException("Unknown status: $code")
    }
}
```

**대소문자 구분 없이 역직렬화**

```kotlin
// ObjectMapper 설정
val mapper = ObjectMapper().apply {
    enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS)
}

// "pending", "PENDING", "Pending" 모두 Status.PENDING으로 역직렬화
```

**@JsonSerialize / @JsonDeserialize로 커스텀 클래스 지정**

복잡한 직렬화 로직이 필요할 때 커스텀 Serializer/Deserializer 클래스를 만들어 사용합니다.

```kotlin
@JsonSerialize(using = StatusSerializer::class)
@JsonDeserialize(using = StatusDeserializer::class)
enum class Status(val code: String, val description: String) {
    PENDING("P", "대기중"),
    APPROVED("A", "승인됨"),
    REJECTED("R", "거절됨")
}

// 커스텀 Serializer
class StatusSerializer : JsonSerializer<Status>() {
    override fun serialize(value: Status, gen: JsonGenerator, serializers: SerializerProvider) {
        gen.writeStartObject()
        gen.writeStringField("code", value.code)
        gen.writeStringField("description", value.description)
        gen.writeEndObject()
    }
}

// 커스텀 Deserializer
class StatusDeserializer : JsonDeserializer<Status>() {
    override fun deserialize(p: JsonParser, ctxt: DeserializationContext): Status {
        val node = p.codec.readTree<JsonNode>(p)
        val code = node.get("code").asText()
        return Status.entries.find { it.code == code }
            ?: throw IllegalArgumentException("Unknown status code: $code")
    }
}
```

```kotlin
// 직렬화 결과
// {"code":"P","description":"대기중"}
```

:::info[사용 시점]

- `@JsonValue`: 단순히 특정 필드 값만 사용할 때
- `@JsonSerialize`: 객체 형태로 직렬화하거나 복잡한 변환 로직이 필요할 때

:::

### 3.3 Kotlinx.serialization 사용

Kotlin 공식 직렬화 라이브러리를 사용하는 방법입니다.

**기본 사용**

```kotlin
@Serializable
enum class Status {
    PENDING, APPROVED, REJECTED
}

// 직렬화 결과: "PENDING"
```

**@SerialName으로 커스텀 이름 지정**

```kotlin
@Serializable
enum class Status {
    @SerialName("pending") PENDING,
    @SerialName("approved") APPROVED,
    @SerialName("rejected") REJECTED
}

// 직렬화 결과: "pending"
```

### 3.4 알 수 없는 값 처리

API 응답에서 예상치 못한 enum 값이 올 경우를 대비한 패턴입니다.

```kotlin
enum class Status(val code: String) {
    PENDING("pending"),
    APPROVED("approved"),
    REJECTED("rejected"),
    UNKNOWN("unknown");

    companion object {
        @JvmStatic
        @JsonCreator
        fun fromCode(code: String?): Status =
            entries.find { it.code == code } ?: UNKNOWN
    }
}
```

:::tip[하위 호환성]

서버에서 새로운 enum 값이 추가될 수 있는 경우, UNKNOWN과 같은 기본값을 두면 클라이언트가 깨지지 않습니다.

:::