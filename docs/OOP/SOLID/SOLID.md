## 1 SOLID

- SOLID란 클린코드로 유명한 로버트 마틴이 좋은 객체 지향 설계의 5가지 원칙을 정리한 것입니다.
- 소프트웨어 설계를 이해하기 쉽고 유연하고 유지보수하기 쉽게 만들기 위해 사용되는 원칙 5가지를 뜻한다.
- 5가지 원칙
	- Single Responsibility Principle(단일 책임 원칙)
	- Open-Closed Principle(개방-폐쇄 원칙)
	- Liskov Substitution Principle(리스코프 치환 원칙)
	- Interface Segregation Principle(인터페이스 분리 원칙)
	- Dependency Inversion Principle(의존 역전 원칙)

### 1.1 SOLID를 언제 적용할까?

- SOLID는 디커플링을 중요하게 여기니 대규모 프로젝트일수록 유용하다 따라서 모든 프로젝트에 적용할 수 있다고 생각하지 말자
- 많은 프로젝트의 시작은 직접적/구체적인 설계로 시작하고 규모가 커지면서 유연성이 필요해지면 SOLID를 고려해봐도 좋습니다.

### 1.2 응집도와 결합도

- SOLID는 원칙을 섦명하기에 앞서 응집도와 결합도를 이해하는 것이 중요합니다.
- 응집도(Cohesion)
	- 모듈 내부의 요소들이 얼마나 밀접하게 연관되어 있는지를 나타내는 척도입니다.
  - 응집도는 변경이 발생할 때 모듈 내부에서 발생하는 변경의 정도로 측정할 수 있습니다.
	- 하나의 변경을 수용하기 위해 모듈 전체가 변경되면 응집도가 높고 모듈의 일부만 변경되면 응집도가 낮은 것입니다.
	- 하나의 변경을 수용하기 위해 하나의 모듈만 변경된다면 응집도가 높고 다수의 모듈이 함께 변경돼야 한다면 응집도가 낮은 것입니다.
- 결합도(Coupling)
	- 결합도는 의존성의 정도를 나타내며 다른 모듈에 대해 얼마나 많은 지식을 갖고 있는지를 나타내는 척도입니다.
  - 결합도는 한 모듈이 변경되기 위해서 다른 모듈의 변경을 요구하는 정도로 측정할 수 있습니다.
  - 내부 구현을 변경했을 때 이것이 다른 모듈에 영향을 미치는 경우 두 모듈 사이의 결합도가 높다고 표현합니다.
  - 반면 퍼블릭 인터페이스를 수정했을 때만 다른 모듈에 영향을 미치는 경우 두 모듈 사이의 결합도가 낮다고 표현합니다.
- SOLID 원칙은 응집도를 높이고 결합도를 낮추는 것을 목표로 합니다.
- 응집도가 높고 결합도가 낮은 모듈은 변경이 발생할 때 파급 효과가 적고, 이해하기 쉽고, 유지보수가 용이합니다.

## 2 Single Responsibility Principle

- 단일 책임 원칙(SRP)은 클래스가 하나의 책임만 가져야 한다는 원칙입니다.
  - 여기서 책임이라는 의미가 잘 이해되지 않을 수 있습니다.
  - SRP에서 책임은 변경으로 해석하는 것이 좋습니다.
  - 즉 단일 책임 원칙은 클래스가 변경되는 이유가 하나만 있어야 한다는 것입니다.
- 한 클래스를 변경하기 위한 한 가지 이상의 이유를 생각할 수 있다면, 그 클래스는 한 가지 이상의 책임을 맡고 있는 것입니다.
- 코드를 보는 대부분의 사람들이 이해할 수 있는 크기로 클래스를 만드는 것이 좋습니다.
- 변경이 있을 때 파급 효과가 적으면 단일 책임 원칙을 잘 따른 것입니다.
- 단일 책임 원칙은 다른 원칙과 비교하여 가장 이해하기도, 적용하기도 어려운 원칙입니다.
  - 아래 단일 책임 원칙 가이드를 참고하여 적용해보세요.

### 2.1 SRP와 응집도

- 응집도 또한 변경의 정도로 측정하기 때문에 SRP와 관련이 깊습니다.
  - SRP는 모듈의 응집도를 높이는 데 도움을 줍니다.
- 응집도는 모듈에 포함된 내부 요소들이 연관돼 있는 정도를 나타냅니다.
  - 응집도는 변경이 발생할 때 모듈 내부에서 발생하는 변경의 정도로 측정할 수 있습니다.
  - 하나의 변경을 수용하기 위해 모듈 전체가 변경되면 응집도가 높고 모듈의 일부만 변경되면 응집도가 낮은 것입니다.
  - 하나의 변경을 수용하기 위해 하나의 모듈만 변경된다면 응집도가 높고 다수의 모듈이 함께 변경돼야 한다면 응집도가 낮은 것입니다.

### 2.2 SRP 적용하기

- 클래스가 하나 이상의 이유로 변경된다면 응집도가 낮은 것입니다.
  - 이 경우 SRP를 적용해 변경의 이유를 기준으로 클래스를 분리해야 합니다.
- 특정한 메서드 그룹이 특정한 속성 그룹만 사용한다면 응집도가 낮은 것입니다.
  - 함께 사용되는 메서드와 속성 그룹을 기준으로 클래스를 분리해야 합니다.
- 클래스 인스턴스 초기화 시 경우에 따라서 서로 다른 속성들을 초기화한다면 응집도가 낮은 것입니다.
	- 초기화되는 속성의 그룹을 기준으로 클래스를 분리해야 합니다.

### 2.3 단일 책임 원칙 가이드

- 책임을 한 문장으로 적어본다.
  - 클래스의 책임을 설명하는데 `그리고`나 `또는`이 들어간다면 여러 개의 책임을 담당하는 클래스입니다.
- 메서드들을 분류한다.
  - 이름이나 목적이 비슷한 메서드들을 그룹으로 묶어 나열합니다. 
  - 이 메서드 그룹별로 클래스를 분리할 수 있는지 검토합니다.
- 인스턴스 변수와 메서드 사이의 관계를 살펴본다.
  - 일부 인스턴스 변수가 일부 메서드에 의해서만 사용되는지 확인합니다. 
  - 만약 그렇다면 이 인스턴스 변수와 메서드들을 그룹으로 묶어 클래스를 분리할 수 있습니다.
- 서로 배타적으로 초기화되는 인스턴스 변수가 있는지 살펴본다.
  - 어떤 변수들이 초기화될 때 함께 초기화되지 않는 인스턴스 변수들이 있는지 확인합니다.
- 테스트하고 싶은 private 메서드가 있는지 살펴본다.
  - 너무 많은 private 메서드가 있을 때 테스트하고 싶은 private 메서드가 존재하는지 확인합니다.
  - 이런 메서드들은 테스트하기 위해 public으로 변경하는 것보다 클래스를 분리하는 것이 좋습니다.
- 외부 의존성을 찾는다.
  - 데이터베이스 연결이나 외부 시스템과의 연동 등과 같이 외부에 위치하는 불안정한 의존성을 찾습니다.
  - 이런 의존성은 별도의 클래스로 분리하는 것이 좋습니다.

## 3 Open-Closed Principle

- 소프트웨어 개체는 **확장에 대해 열려** 있어야 하고, **수정에 대해서는 닫혀** 있어야 한다.
- 확장에 대해 열려 있다: 애플리케이션의 요구사항이 변경될 때 이 변경에 맞게 새로운 동작을 추가해서 애플리케이션에 기능을 추가할 수 있다.
- 수정에 대해 닫혀 있다: 기존의 코드를 수정하지 않고도 애플리케이션의 동작을 추가하거나 변경할 수 있다.
- 즉 OCP는 기존의 코드를 수정하지 않고도 새로운 기능을 추가할 수 있도록 하는 원칙이다.

### 3.1 컴파일 타임 의존성과 런타임 의존성

- 사실 개방 폐쇄 원칙은 런타임 의존성과 컴파일 타임 의존성에 관한 이야기입니다.
- 개방 폐쇄 원칙을 따르는 설계란 컴파일타임 의존성은 유지하면서 런타임 의존성의 가능성을 확장하고 수정할 수 있는 구조라고 할 수 있습니다.
- 예를들어, 클라이언트가 인터페이스에 의존하고, 인터페이스를 구현한 클래스가 런타임에 결정되는 구조입니다.

### 3.2 추상화

- 컴파일 타임 의존성과 런타임 의존성을 분리하는 방법은 추상화입니다.
- 추상화는 핵심적인 부분만 남기고 불필요한 부분은 생략함으로써 복잡성을 극복하는 기법입니다.
- 추상화 과정을 거치면 문맥이 바뀌더라도 변하지 않는 부분만 남게 되고 문맥에 따라 변하는 부분은 생략된다.
  - 여기서 변하지 않는 부분이 컴파일 타임 의존성이고, 변하는 부분이 런타임 의존성입니다.
- 모듈이 추상화에 의존하면 수정에 대해 닫혀 있을 수 있습니다.
- 그 모듈의 행위는 추상화의 새 파생 클래스를 만듦으로써 확장이 가능하기 때문입니다.

### 3.3 OCP의 단점

- OCP를 따르자면 비용이 들어갑니다. 적절한 추상화를 만들기 위해서는 개발 시간과 노력뿐만 아니라 이런 추상화는 소프트웨어 설계의 복잡성을 높이기도 합니다.
- 개발자가 감당할 수 있는 추상화의 정도에는 한계가 있기 때문입니다.
- 지나치고 불필요한 추상화로 설계에 부하를 주지 않으려면 추상화가 실제로 필요할 때까지 기다렸다가 사용하는 편이 좋습니다.
  - 즉, 구현체가 하나만 있다면 굳이 인터페이스를 만들 필요는 없습니다.

### 3.4 주의사항 

```java
public class MemberService {
  private MemberRepository memberRepository = new MemoryMemberRepository();
}
```

```java
public class MemberService {
  private MemberRepository memberRepository = new JdbcMemberRepository();
}
```

- 위 코드의 `MemberService` 클래스는 `MemberRepository` 인터페이스를 의존하고 있습니다.
- 이렇게만 보면 OCP를 잘 지키고 있는 것처럼 보입니다. 
- 그러나 `MemberService` 클라이언트가 구현 클래스를 직접 선택하므로 구현 객체를 변경하려면 클라이언트 코드를 변경해야한다.
- 즉 OCP를 위반하고 있습니다.

### 3.5 OCP를 지키는 방법

- 어떻게 OCP를 지킬 수 있을까요?
- 단순히 어떤 개념을 추상화했다고 수정에 대해 닫혀 있는 설계를 만들 수 있는 것은 아닙니다.
- 개방 폐쇄 원칙이 가능하려면 모든 요소가 추상화에 의존해야 합니다.
- 예를 들어, Movie가 DiscountPolicy라는 추상화에 의존하려면 Movie 내부에서 AmountDiscountPolicy와 같은 구체 클래스 인스턴스를 생성해서는 안 됩니다.
- 이를 해결하기 위해서 가장 보편적인 방법은 객체를 생성할 책임을 클라이언트로 옮기는 것입니다.
- MemberService는 생성자에 의존성을 명시적으로 정의하고 이를 사용하는 클라이언트가 적절한 구현체를 주입하는 방식입니다.
- 이런 방식은 의존성 주입(Dependency Injection, DI)이라고 부릅니다.
- 즉 객체를 생성하고, 연관관계를 맺어주는 별도의 조립, 설정자가 필요합니다.
- Spring은 이런 역할을 해주는 프레임워크입니다.

## 4 Liskov Substitution Principle

- 서브타입은 그것의 기반 타입으로 치환 가능해야 한다는 원칙입니다.
- 프로그램의 객체는 프로그램의 정확성을 깨뜨리지 않으면서 하위 타입의 인스턴스로 바꿀 수 있어야 합니다.
- 간단히 말해, 부모가 할 수 있었던 일은 자식도 다 할 수 있어야 한다는 것을 의미합니다.
- LSP의 핵심
  - **클라이언트가 차이점을 인식하지 못한 채 기반 클래스의 인터페이스를 통해 서브클래스를 사용할 수 있어야 합니다.**

### 4.1 바바라 리스코프의 정의

- 바바라 리스코프는 올바른 상속 관계의 특징을 정의하기 위해 리스코프 치환 원칙을 발표했습니다.
- 공식적인 정의는 다음과 같습니다.

:::info
"S형의 각 객체 o1에 대해 T형의 객체 o2가 존재하여, T에 의해 정의된 모든 프로그램 P에서 T가 S로 치환될 때, P의 동작이 변하지 않으면 S는 T의 서브타입이다."
:::

### 4.2 LSP의 필요성

- 다형성을 지원하기 위한 핵심 원칙입니다.
- 인터페이스를 구현한 구현체를 믿고 사용하려면, 이 원칙이 반드시 필요합니다.
- 단순히 컴파일에 성공하는 것을 넘어서, 런타임에서도 올바른 동작을 보장해야 합니다.

### 4.3 서브타이핑 vs 서브클래싱

- 서브클래싱 (Subclassing)
  - 다른 클래스의 코드를 재사용할 목적으로 상속을 사용하는 것입니다.
  - 구현 상속 또는 클래스 상속이라고도 부릅니다.
  - 코드 재사용이 주된 목적입니다.
- 서브타이핑 (Subtyping)
  - 타입 계층을 구현하기 위해 상속을 사용하는 것입니다.
  - 인터페이스 상속이라고도 부릅니다.
  - 다형성과 대체 가능성이 주된 목적입니다.
- 리스코프 치환 원칙은 올바른 상속 관계의 특징을 정의하기 위해 제안된 것입니다.
  - 여기서 올바른 상속이란 서브클래싱이 아닌 서브타이핑을 의미합니다. 즉 단순 코드 재사용이 아닌 다형성과 대체 가능성을 의미합니다.

### 4.4 LSP 위반 사례

```java
interface Car {
    void accelerate(); // 앞으로 가라는 기능
}

class NormalCar implements Car {
    @Override
    public void accelerate() {
        // 앞으로 이동
        moveForward();
    }
}

class ReverseCar implements Car {
    @Override
    public void accelerate() {
        // 뒤로 이동 - LSP 위반!
        moveBackward();
    }
}
```

- 이 예시에서 ReverseCar는 LSP를 위반합니다.
- 클라이언트는 accelerate() 메서드가 앞으로 가는 기능을 수행할 것으로 기대하지만, ReverseCar는 뒤로 갑니다.
- 느리더라도 앞으로 가야 LSP를 만족합니다.

```java
// Vector를 상속받은 Stack
class Stack<E> extends Vector<E> {
    public E push(E item) {
        addElement(item);
        return item;
    }
    
    public E pop() {
        // Stack의 LIFO 동작
        return remove(size() - 1);
    }
}
```

- 클라이언트가 Vector에 대해 기대하는 행동을 Stack에 대해서는 기대할 수 없습니다.
- Stack에는 포함되어서는 안 되는 Vector의 퍼블릭 인터페이스가 Stack의 퍼블릭 인터페이스에 포함됩니다.
- 이는 서브타이핑이 아니라 서브클래싱 관계입니다.

```java
class Rectangle {
    protected int width;
    protected int height;
    
    public void setWidth(int width) {
        this.width = width;
    }
    
    public void setHeight(int height) {
        this.height = height;
    }
    
    public int getArea() {
        return width * height;
    }
}

class Square extends Rectangle {
    @Override
    public void setWidth(int width) {
        this.width = width;
        this.height = width; // 정사각형이므로 높이도 같이 변경
    }
    
    @Override
    public void setHeight(int height) {
        this.width = height; // 정사각형이므로 너비도 같이 변경
        this.height = height;
    }
}
```

```java
public void resize(Rectangle rectangle, int width, int height) {
    rectangle.setWidth(width);
    rectangle.setHeight(height);
    
    // 클라이언트는 너비와 높이가 독립적으로 설정될 것으로 기대
    assert rectangle.getWidth() == width;
    assert rectangle.getHeight() == height;
}
```

- Rectangle 인스턴스로는 정상 동작하지만, Square 인스턴스로는 assertion이 실패합니다.
- 정사각형과 직사각형은 어휘적으로는 is-a 관계가 성립하지만, 프로그래밍에서는 LSP를 위반합니다.

### 4.5 LSP와 OCP

- 리스코프 치환 원칙은 개방 폐쇄 원칙을 따르는 데 필수적입니다.
- 자식 클래스가 클라이언의 고나점에서 부모 클래스를 대체할 수 있다면 기능 확장을 위해 자식 클래스를 추가하더라도 코드를 수정할 필요가 없습니다.
- 따라서 리스코프 치환 원칙은 OCP를 만족하는 설계를 위한 전제 조건입니다.
- 일반적으로 리크소프 치환 원칙 위반은 잠재적인 OCP 위반을 의미합니다.

### 4.6 LSP를 만족하는 설계 방법

- 클라이언트와 서버 사이의 협력을 의무와 이익으로 구성된 계약의 관점에서 표현한 것을 계약에 의한 설계라고 부릅니다.
- 계약에 의한 설계는 3가지 요소로 구성됩니다.
	- 사전 조건(Precondition): 클라이언트가 메서드를 실행하기 전에 만족시켜야 하는 조건
	- 사후 조건(Postcondition): 메서드가 실행된 후 클라이언트에게 보장해야 하는 조건
	- 클래스 불변식(Invariant): 메서드 실행 전과 실행 후에 인스턴스가 만족시켜야 하는 클래스의 불변 조건
- 서브타입이 리스코프 치환 원칙을 만족시키기 위해 클라이언트와 수퍼타입 간에 체결된 계약을 준수해야 합니다.
- LSP와 계약
  - 서브타입에 더 강한 사전 조건을 정의할 수 없습니다.
  - 서브타입에 슈퍼타입과 같거나 더 강한 사조조건을 정의할 수 있습니다.
  - 서브타입에 더 약한 사후 조건을 정의할 수 없습니다.

## 5 Interface Segregation Principle

- 큰 인터페이스 몇 개 보다 작은 인터페이스가 많은 것이 좋다.
- 클라이언트가 오로지 자신이 필요로 하는 메서드만 알면 되도록 넓은 인터페이스를 특화된 인터페이스로 분리해야 한다
- 클라이언트가 사용하지 않는 메서드를 강제로 구현하는 일이 없을 때까지 인터페이스를 분할해야한다.
- 인터페이스가 명확해지고, 대체 가능성이 높아진다.
- 예시
	- 자동차 인터페이스 -> 운전 인터페이스, 정비 인터페이스로 분리
	- 사용자 클라이언트 -> 운전자 클라이언트, 정비사 클라이언트로 분리
	- 정비 인터페이스 자체가 변해도 운전자 클라이언트에 영향을 주지 않음

## 6 Dependency Inversion Principle

- 이 원칙은 두 가지 핵심 규칙으로 구성됩니다
  - 상위 수준 모듈은 하위 수준 모듈에 의존해서는 안 된다. 둘 다 추상화에 의존해야 한다.
  - 추상화는 세부 사항에 의존해서는 안 된다. 세부 사항이 추상화에 의존해야 한다.
- 간단히 표현하면 "구현 클래스에 의존하지 말고, 인터페이스에 의존하라"는 뜻입니다.
- 클라이언트가 인터페이스에 의존해야 유연하게 구현체를 변경할 수 있기 때문입니다.

### 6.1 의존성 역전 원칙 위반 시 문제점

- 객체 간의 협력에서 상위 수준 모듈은 비즈니스 로직과 정책을 담당하는 핵심 부분입니다.
- 하위 수준 모듈은 데이터 저장, 파일 처리 등 구체적인 구현 세부사항을 담당합니다.
- 상위 수준 모듈이 하위 수준 모듈에 직접 의존하면, 하위 수준 모듈의 변경이 상위 수준 모듈에 영향을 미치게 됩니다.

### 6.2 실제 예시를 통한 문제 상황

- 전화 통화 시간을 계산하는 시스템을 예로 들어보겠습니다.
- 초기 요구사항
  - 010-1111-2222 번호의 전체 통화 시간을 계산해야 합니다.
	- 통화 내역은 CSV 파일로 저장되어 있습니다.

```java
// 하위 수준 모듈 - CSV 파일을 읽는 구체적인 구현
public class CsvReader {
    public List<CallRecord> readCallRecords(String filePath) {
        // CSV 파일 읽기 로직
        return callRecords;
    }
}

// 상위 수준 모듈 - 통화 시간 계산 로직
public class CallTimeCalculator {
    private CsvReader csvReader; // 구체 클래스에 의존
    
    public CallTimeCalculator() {
        this.csvReader = new CsvReader(); // 직접 생성
    }
    
    public int calculateTotalCallTime(String phoneNumber) {
        List<CallRecord> records = csvReader.readCallRecords("calls.csv");
        // 통화 시간 계산 로직
        return totalTime;
    }
}
```

- 요구사항이 변경되어 통화 내역을 JSON 형식으로 저장하게 되었습니다.
- 이 경우 JsonReader라는 새로운 클래스를 만들어야 하고, 필연적으로 CallTimeCalculator의 코드도 수정해야 합니다.
- 본질적인 비즈니스 로직(통화 시간 계산)과 관계없는 파일 형식 변경 때문에 상위 수준 모듈을 수정해야 하는 상황입니다.

```java
// 추상화 - 데이터 읽기 인터페이스
public interface DataReader {
    List<CallRecord> readCallRecords(String source);
}

// 하위 수준 모듈들 - 추상화를 구현
public class CsvReader implements DataReader {
    @Override
    public List<CallRecord> readCallRecords(String filePath) {
        // CSV 파일 읽기 로직
        return callRecords;
    }
}

public class JsonReader implements DataReader {
    @Override
    public List<CallRecord> readCallRecords(String filePath) {
        // JSON 파일 읽기 로직
        return callRecords;
    }
}

// 상위 수준 모듈 - 추상화에 의존
public class CallTimeCalculator {
    private final DataReader dataReader;
    
    public CallTimeCalculator(DataReader dataReader) { // 의존성 주입
        this.dataReader = dataReader;
    }
    
    public int calculateTotalCallTime(String phoneNumber) {
        List<CallRecord> records = dataReader.readCallRecords("calls");
        // 통화 시간 계산 로직 (변경 없음)
        return totalTime;
    }
}
```

- 이제 파일 형식이 변경되어도 CallTimeCalculator는 수정할 필요가 없습니다.
- 여기서 주의할 점이 CallCollector가 직접 CsvReader나 JsonReader를 생성하지 않는 것입니다.
- 의존성 주입을 사용하여 CallCollector가 Reader 인터페이스를 통해 CsvReader나 JsonReader를 주입받도록 합니다.
- 이렇게 하면 상위 수준 모듈과 하위 수준 모듈 모두 추상화에 의존하게 되어, 하위 수준 모듈의 변경이 상위 수준 모듈에 영향을 미치지 않게 됩니다.

### 6.3 DIP를 지키지 못하는 예

```java
public class MemberService {
  private MemberRepository memberRepository = new MemoryMemberRepository();
}
```

- `MemberRepository` 인터페이스를 구현한 `MemoryMemberRepository` 와 `JdbcMemberRepository` 클래스가 있습니다.
- 위 코드는 `MemberService` 클라이언트가 `MemberRepository` 인터페이스를 의존해 DIP를 지키고 있는 것처럼 보입니다.
- 그러나 `MemberService` 클라이언트가 구현 클래스를 직접 선택하므로 `MemoryMemberRepository`도 동시에 의존하고 있습니다.
  - new를 잘못 사용하면 클래스 간의 결합도가 강해집니다.
  - new 연산자를 사용하기 위해서는 구체 클래스의 이름을 직접 기술해야 합니다.
  - 이는 추상화에 의존하는 것이 아닌 구체 클래스에 의존할 수밖에 없기 때문에 결합도가 강해집니다.
- 즉 구현 클래스에 의존하고 있으므로 DIP를 위반하고있습니다.

```java
@Service
public class MemberService {
    private final MemberRepository memberRepository;
    
    // 생성자 주입을 통한 의존성 주입
    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }
    
    public void save(Member member) {
        memberRepository.save(member);
    }
}

@Repository
public class MemoryMemberRepository implements MemberRepository {
    // 구현 로직
}
```

- 위와 같이 `MemberService` 생성자를 통한 의존성 주입을 사용하면 `MemberService`는 `MemberRepository` 인터페이스에만 의존하게 됩니다.

### 6.4 DIP와 DI(Dependency Injection)의 관계

- DIP는 원칙(principle)이고, DI는 이 원칙을 지키기 위한 구체적인 기법(technique)입니다.
- 의존성 역전 원칙(DIP)이 "무엇을" 달성해야 하는지 말해준다면, 의존성 주입(DI)은 "어떻게" 달성할 수 있는지 알려줍니다.
- DIP 원칙을 따르려면 추상화에 의존해야 하는데, 실제로 코드가 동작하려면 결국 구체적인 구현체가 필요합니다.
- 이때 의존성 주입(DI)이 등장합니다. DI는 필요한 구현체를 외부에서 주입받아 사용함으로써:
  - 클래스가 직접 구현체를 생성하지 않고
  - 인터페이스를 통해 소통하게 하며
	- 구현체의 교체가 용이하도록 만들어줍니다.

### 6.5 의존성 역전과 패키지

- 의존성 역전 원칙은 단순히 클래스 간의 의존성 방향만이 아니라 인터페이스의 소유권과 패키지 구조에도 적용됩니다.

#### 6.5.1 SEPARATE INTERFACE 패턴

- 마틴 파울러가 제시한 SEPARATE INTERFACE 패턴의 핵심 원칙은 다음과 같습니다:
  - 인터페이스는 클라이언트가 속한 패키지에 위치해야 합니다
  - 추상화를 별도의 독립적인 패키지가 아니라 클라이언트 패키지에 포함시켜야 합니다
  - 함께 재사용될 필요가 없는 클래스들은 별도의 독립적인 패키지에 모아야 합니다

#### 6.5.2 잘못된 패키지 구조 예시

- 많은 개발자들이 다음과 같이 인터페이스를 별도 패키지에 분리하는 실수를 합니다.

```text
com.example.interfaces
├── DataReader.java            // 인터페이스
├── CsvReader.java             // 구현체
└── JsonReader.java            // 구현체

com.example.business
└── CallTimeCalculator.java    // 클라이언트
```

- DataReader 인터페이스가 실제 사용자인 CallTimeCalculator와 다른 패키지에 위치
- 추상화의 안정성이 떨어짐: 구현체들과 함께 있어 구현 세부사항의 변경에 영향을 받을 수 있음

#### 6.5.3 올바른 패키지 구조 예시

```text
com.example.business
├── CallTimeCalculator.java    // 클라이언트
└── DataReader.java            // 인터페이스 (클라이언트와 같은 패키지)

com.example.infrastructure
├── CsvReader.java             // 구현체
└── JsonReader.java            // 구현체
```

- 높은 응집도: 비즈니스 로직과 그것이 사용하는 인터페이스가 함께 위치
- 안정성 보장: DataReader 인터페이스가 구현 세부사항과 분리되어 안정적
- 낮은 결합도: infrastructure 패키지 변경이 business 패키지에 영향을 주지 않음

#### 6.5.4 패키지 레벨 DIP의 이론적 배경

- 안정성 관점
  - 상위 수준 모듈(CallTimeCalculator)은 하위 수준 모듈(CsvReader, JsonReader)보다 더 안정적입니다
  - 상위 수준 모듈은 본질적인 목적(통화 시간 계산)과 관련이 있어 불필요한 이유로 변경되어서는 안 됩니다
  - 하위 수준 모듈은 세부사항(파일 읽기 방식)에 속하므로 자주 변경될 수 있습니다
- 소유권 관점
  - 인터페이스(DataReader)는 상위 수준 모듈에 속해야 합니다
	- 추상화가 세부사항에 의존하면 안정적이어야 하는 추상화가 불안정해집니다

## 참고

- 김영한 스프링 핵심 원리 - 기본편 강의
- 오브젝트 - 조영호