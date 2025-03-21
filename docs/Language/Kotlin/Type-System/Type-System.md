## 1 코틀린의 원시 타입
- 코틀린은 원시 타입과 래퍼 타입을 구분하지 않는다.
	- 자바는 원시 타입과 참조 타입을 구분한다.
	- 원시 타입에는 값이 직접 들어가지만 참조 타입에는 변수에는 메모리 상의 객체 위치가 들어간다.
- 원시 타입과 래퍼 타입을 구분하지 않으면 코틀린은 항상 객체로 표현하는 것일까?
	- 그렇지 않다!
- 대부분의 경우 코틀린의 Int 타입은 자바의 int 타입으로 컴파일 된다.
	- 이런 컴파일이 불가능한 경우는 컬렉션과 같이 제네릭 클래스를 사용하는 경우 밖에 없다.

### 1.1 널이 될 수 있는 원시 타입
- 코틀린의 Int는 널이 아니기 때문에 쉽게 자바의 int로 컴파일 된다. 반대도 마찬가지다.
- 하지만 코틀린의 널이 될 수 있는 타입을 자바 원시 타입으로 표현할 수 없다.
- 따라서 코틀린에서 널이 될 수 있는 원시 타입(Int?)을 사용하면 자바의 래퍼 타입(java.lang.Integer)으로 컴파일 된다.

## 2 Any, Unit, Nothing

### 2.1 Any
- 자바에서 Object가 클래스 계층의 최상이 타입이듯 코틀린에서는 Any 타입이 모든 널이 될 수 없는 타입의 조상 타입이다.
	- 코틀린에서 Any를 사용하면 자바 바이트코드의 Object로 컴파일 된다.
- 널을 포함하는 모든 값을 대입할 변수를 선언하려면 Any? 타입을 사용한다.

### 2.2 Unit
- 코틀린 Unit 타입은 자바 void와 같은 기능을 한다.

### 2.3 Nothing
- 반환 값이라는 개념 자체가 의미 없는 함수가 일부 존재한다.
- 예를 들어 테스트 라이브러리들은 fail이라는 함수를 제공하는데 특별한 메시지가 들어있는 예외를 던져서 현재 테스트를 실패시킨다.
- 이런 함수를 호출하는 코드를 분석하는 경우 함수가 정삭적으로 끝나지 않는다는 사실을 알면 유용한데 이를 표현하기 위해 Nothing이라는 특별한 반환 타입이 있다.
- Nothing은 함수의 반환 타입이나 반환 타입으로 쓰일 타입 파라미터로만 쓸 수 있다.

## 3 컬렉션과 배열

### 3.1 널 가능성과 컬렉션
- 타입 인자로 쓰인 타입에도 ?를 붙일 수 있다.
	- 즉 `List<Int?>`는 Int? 타입의 값을 저장할 수 있다.
	- 다른말로 리스트에는 Int나 null을 저장할 수 있다.
- `List<Int?>`와 `List<Int>?`는 다르니 주의하자
	- `List<Int?>`: 리스트 자체는 널이 아니지만 리스트에 들어있는 각 원소는 널이 될 수 있다.
	- `List<Int>?`: 리스트 자체가 널이 될 수 있지만 리스트 안에는 널이 아닌 값만 들어있다.
	- `List<Int?>?`: 널이 될 수 있는 값으로 이루어진 널이 될 수 있는 리스트

### 3.2 읽기 전용과 변경 가능한 컬렉션
- 코틀린의 컬렉션은 데이터를 접근하는 인터페이스와 컬렉션 안의 데이터를 변경하는 인터페이스를 분리했다.
- 코틀린은 가장 기초적인 `kotlin.colletions.Collection` 인터페이스를 제공해 이터레이션, 컬렉션의 크기, 원소 검사 및 조회 기능을 제공한다.
	- 원소를 제거하거나 추가하는 메서드는 제공하지 않는다.
- 컬렉션 데이터 수정이 필요한 경우 `kotlin.colletions.MutableCollection`을 사용한다.
	- MutableCollection은 위 Collection을 확장해 데이터 추가와 삭제 등의 메서드를 추가로 제공한다.

**주의점**
`kotlin.colletions.Collection`
- **읽기 전용 컬렉션이 항상 Thread Safe하지는 않다.**
- 같은 컬렉션 객체를 각각 읽기 전용 타입과 변경 가능 타입으로 참조하는 경우 변경 가능 타입 쪽에서 컬렉션의 내용을 변경하는 도중 읽기 전용 타입에서 참조한다면 ConcurrentModificationException 등의 예외가 발생할 수 있다.

`kotlin.colletions.MutableCollection`
- 어떤 함수가 인자로 kotlin.colletions.MutableCollection를 받는다면 그 함수가 컬렉션의 데이터를 바꿀 수 있다는 것을 의미한다. 
- 원본의 변경을 막고자한다면 컬렉션의 복사복을 넘겨주는 방어적 복사가 필요하다.


:::tip
항상 읽기 전용인 `kotlin.colletions.Collection`을 사용하고 컬렉션 데이터 수정이 필요한 경우에만 `kotlin.colletions.MutableCollection`을 사용하자.
:::

### 3.3 배열
- 코틀린은 자바와 마찬가지로 배열을 제공한다.
- [Array 참고](../Array/Array.md)