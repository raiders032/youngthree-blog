## 1. Record

- Java Record는 Java 14에서 미리보기 기능으로 처음 도입되었고 Java 16(2021년 3월)에서 정식 기능으로 승인된 데이터 전용 클래스입니다. 
- Record는 데이터를 단순히 저장하고 전달하기 위한 목적으로 설계되었습니다.

## 2. Record의 주요 특징

- 불변성(Immutable)
  - Record는 불변 객체로 설계되어, 생성 후 상태를 변경할 수 없습니다. 
  - 이는 멀티스레드 환경에서 안전하게 사용할 수 있도록 합니다.
- 간결성
  - 적은 코드로 데이터 클래스를 정의할 수 있습니다.
- 편의성
  - 자동으로 생성자, getter, equals(), hashCode(), toString() 메서드를 생성합니다.
- 상속 불가
  - Record는 다른 클래스를 상속할 수 없으며, 다른 클래스도 Record를 상속할 수 없습니다.

## 3. Record가 자동으로 해주는 것

### 3.1 생성자

```java
public record Person (String name, String address) {}
```

- 위와 같이 정의하면, Record는 모든 필드를 매개변수로 받는 주 생성자를 자동으로 생성합니다.

```java
public Person(String name, String address) {
    this.name = name;
    this.address = address;
}
```

- Record는 자동으로 위와 같은 생성자를 생성합니다.

```java
Person person = new Person("John Doe", "100 Linda Ln.");
```

- 자동 생성된 생성자는 위와 같이 사용할 수 있습니다

### 3.2 Getter 메서드

```java
public record Person (String name, String address) {}
```

- 위와 같이 정의하면, Record는 다음과 같은 getter 메서드를 자동으로 생성합니다.
- getter 메서드는 필드 이름과 동일한 이름을 가집니다.

```java
public String name() {
    return this.name;
}

public String address() {
    return this.address;
}
```

- Record는 자동으로 위와 같은 getter 메서드를 생성합니다.

```java
@Test
public void givenValidNameAndAddress_whenGetNameAndAddress_thenExpectedValuesReturned() {
    String name = "John Doe";
    String address = "100 Linda Ln.";

    Person person = new Person(name, address);

    assertEquals(name, person.name());
    assertEquals(address, person.address());
}
```

## 4 생성자

### 4.1 표준 생성자(Canonical Constructor)

- Records를 선언할 때 자동으로 생성되는 기본 생성자입니다.
- 선언된 모든 컴포넌트(필드)를 매개변수로 받습니다.
- 각 매개변수 값을 해당 필드에 할당합니다.

```java
// 레코드 선언
public record Person(String name, int age) { }

// 컴파일러가 자동으로 다음과 같은 표준 생성자 생성
// public Person(String name, int age) {
//     this.name = name;
//     this.age = age;
// }

// 사용 예시
Person person = new Person("Kim", 30);
```

- Record는 선언된 필드에 대해 자동으로 생성된 표준 생성자를 사용하여 객체를 생성할 수 있습니다.

### 4.2 컴패트 생성자(Compact Constructor)

- 매개변수 목록 없이 정의되는 생성자입니다.
- 표준 생성자 내부에서 실행됩니다.
- 필드에 최종 할당되기 전에 유효성 검사 및 변환 작업 수행합니다.
- `this` 접두사 없이 필드에 직접 접근 가능합니다.

```java
public record Person(String name, int age) {
    // 컴팩트 생성자
    public Person {
        if (name == null) {
            throw new IllegalArgumentException("이름은 null이 될 수 없습니다");
        }
        if (age < 0) {
            throw new IllegalArgumentException("나이는 음수가 될 수 없습니다");
        }
        
        // 필드 변환 예시 (이름 앞뒤 공백 제거)
        name = name.trim();
    }
}

// 사용 예시
Person person = new Person("Kim ", 30);
```
- `Kim `의 공백이 제거되고 `Kim`으로 저장됨

### 4.3 커스텀 생성자(Custom Constructor)

- Record는 기본 생성자 외에도 커스텀 생성자를 정의할 수 있습니다.
- 반드시 표준 생성자나 다른 사용자 정의 생성자를 호출해야 합니다.

```java
public record Person(String name, int age) {
    // 이름만 받고 나이는 0으로 설정하는 커스텀 생성자
    public Person(String name) {
        this(name, 0); // 표준 생성자 호출
    }
    
    // 나이만 받고 이름은 "Unknown"으로 설정하는 커스텀 생성자
    public Person(int age) {
        this("Unknown", age); // 표준 생성자 호출
    }
}

// 사용 예시
Person person1 = new Person("Kim"); // Person[name=Kim, age=0]
Person person2 = new Person(30);    // Person[name=Unknown, age=30]
```

- 위와 같이 커스텀 생성자를 정의하면, Record는 기본 생성자 외에도 추가적인 생성자를 제공할 수 있습니다.
- 다양한 매개변수 조합으로 객체 생성이 가능합니다.

## 5. 사용 예시

```java
// Record 정의
public record Person(String name, int age) { }

// 사용
Person person = new Person("Kim", 30);
String name = person.name(); // getter 메서드 호출
int age = person.age();      // getter 메서드 호출
System.out.println(person);  // toString() 자동 구현: Person[name=Kim, age=30]
```

## 6. 적합한 사용 사례

- 데이터 전송 객체(DTO)
  - Record는 데이터를 전달하기 위한 객체로 적합합니다.
- API 응답 모델
  - API 응답으로 반환되는 데이터 구조를 정의하는 데 유용합니다.
- 불변 데이터 구조
  - Record는 불변성을 보장하므로, 상태가 변경되지 않는 데이터 구조에 적합합니다.