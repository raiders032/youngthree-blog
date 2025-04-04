## private 생성자나 열거타입으로 싱글턴임을 보증하라



## 1 싱글턴(Singleton)

* 싱글턴이란 인스턴스를 오직 하나만 생성할 수 있는 클래스
*  [Singleton.md](../../../../../Design-Pattern/Singleton/Singleton.md) 참고



**사용예시**

- 무상태 객체 (stateless)
- 설계상 유일해야 하는 시스템 컴포넌트
- DBCP(DataBase Connection Pool), 로그기록 객체 등



### 1.1장점

* 한번의 객체 생성으로 재사용이 가능해져 메모리 낭비를 방지할 수 있다.
* 전역성을 갖기 때문에 다른 객체와 공유가 용이히다.



### 1.2 단점

* 클래스를 싱글턴으로 만들면 이를 사용하는 클라이언트를 테스트하기 어려워질 수 있다. 
* 타입을 인터페이스로 정의한 다음 그 인터페이스를 구현해 만든 싱글턴이 아니라면 싱글턴 인스턴스를 가짜 구현(mock)으로 대체할 수 없기 때문이다.



## 2 싱글턴을 만드는 방식



### 2.1 public static final 필드 방식

```java
import java.io.Serializable;

public class Elvis implements IElvis, Serializable {
  public static final Elvis INSTANCE = new Elvis();
  private static boolean created;

  private Elvis() {
    // 리플렉션을 통해 private 생성자를 호출할 수 있기 때문에 2번 호출되면 인스턴스 생성을 막는 로직
    if (created) {
      throw new UnsupportedOperationException("can't be created by constructor.");
    }

    created = true;
  }

  public void leaveTheBuilding() {
    System.out.println("Whoa baby, I'm outta here!");
  }

  public void sing() {
    System.out.println("I'll have a blue~ Christmas without you~");
  }

  // 이 메서드는 보통 클래스 바깥(다른 클래스)에 작성해야 한다!
  public static void main(String[] args) {
    Elvis elvis = Elvis.INSTANCE;
    elvis.leaveTheBuilding();
  }

  private Object readResolve() {
    return INSTANCE;
  }

}
```

* public, protected 생성자가 없으므로 클래스가 초기화될 때 만들어진 인스턴스가 전체 시스템에서 하나 뿐임이 보장된다.



#### 2.1.1 장점

- 해당 클래스가 싱글턴임이 API에 명백히 드러난다.
  - public static 필드가 final이니 절대로 다른 객체를 참조할 수 없다 
- 간결하다



#### 2.1.2 단점

- 리플레션을 사용해 또 다른 인스턴스를 만드는 것이 가능하다.
  - 이를 위한 방어 코드가 필요하다
- 직렬화된 인스턴스를 역직렬화할 때 마다 새로운 인스턴스가 만들어진다.
  - 이를 위한 방어 코드가 필요하다.



**리플렉션 방어하기**

- 예외적으로 권한이 있는 클라이언트는 리플렉션 API인 `AccessibleObject.setAccessible`을 사용해 private 생성자를 호출할 수 있다. 
- 리플렉션을 통해 생성자를 가져오고 setAccessible(true)를 호출하면 private 생성자를 호출할 수 있다.
- 아래와 같이 또 다른 Elvis 인스턴스를 만드는 것이 가능하다.
- 이러한 공격을 방지하고자 한다면, 생성자에서 두 번 객체를 생성하려고 할 때 예외를 던지게 하면 된다.
- [Reflection.md](../../../Reflection/Reflection.md) 참고

```java
Constructor<Elvis> defaultConstructor = Elvis.class.getDeclaredConstructor();
defaultConstructor.setAccessible(true);
Elvis elvis2 = defaultConstructor.newInstance();
```



**역직렬화 방어하기**

```
```



### 2.2 정적 팩토리 방식

```java
public class Printer {
    private static final Printer INSTANCE = new Printer();
    private Printer() { ... }
    public static Printer getInstance() { return INSTANCE; }

    public void print() { ... }
}
```

* `Printer.getInstance`는 항상 같은 객체의 참조를 반환하므로 제 2의 인스턴스를 만들지 않는다. 
* public static final 필드 방식과 마찬가지로 리플랙션 API에 의해 예외적인 상황이 발생할 수는 있다.



#### 2.2.1 장점

**API를 바꾸지 않고도 싱글턴이 아니게 변경할 수 있다.**

- 호출하는 스레드별로 다른 인스턴스를 넘기게 하는 등



**정적 팩토리를 제네릭 싱글턴 팩터리로 만들 수 있다.**

- 클라이언트가 원하는 타입으로 사용할 수 있다.

```java
public class MetaElvis<T> {

  private static final MetaElvis<Object> INSTANCE = new MetaElvis<>();

  private MetaElvis() { }

  @SuppressWarnings("unchecked")
  public static <E> MetaElvis<E> getInstance() { return (MetaElvis<E>) INSTANCE; }

  public void say(T t) {
    System.out.println(t);
  }

  public void leaveTheBuilding() {
    System.out.println("Whoa baby, I'm outta here!");
  }

  public static void main(String[] args) {
    MetaElvis<String> elvis1 = MetaElvis.getInstance();
    MetaElvis<Integer> elvis2 = MetaElvis.getInstance();
    System.out.println(elvis1);
    System.out.println(elvis2);
    elvis1.say("hello");
    elvis2.say(100);
  }

}
```



**정적 팩토리의 메서드 참조를 공급자(Supplier)로 사용할 수 있다는 점**

- `Elvis::getInstance`를 `Supplier<Elvis> elvisSupplier`로 사용할 수 있다.

```java
public class Concert {

  public void start(Supplier<Elvis> elvisSupplier) {
    Elvis elvis = elvisSupplier.get();
    elvis.sing();
  }

  public static void main(String[] args) {
    Concert concert = new Concert();
    concert.start(Elvis::getInstance);
  }

}
```



#### 2.2.2 단점

- 리플레션을 사용해 또 다른 인스턴스를 만드는 것이 가능하다.
  - 이를 위한 방어 코드가 필요하다
- 직렬화된 인스턴스를 역직렬화할 때 마다 새로운 인스턴스가 만들어진다.
  - 이를 위한 방어 코드가 필요하다.



### 2.3 열거 타입 방식

```java
public enum Printer {
    INSTANCE;

    public void print() { ... }
}
```

* public static final 필드 방식과 비슷하지만 더 간결하고, 추가 노력 없이 직렬화할 수 있다
* 아주 복잡한 직렬화 상황이나 리플렉션 공격에서도 제2의 인스턴스가 생기는 일을 막아준다. 
* **대부분 상황에서는 원소가 하나뿐인 열거 타입이 싱글턴을 만드는 가장 좋은 방법이다.** 



#### 2.3.1 장점

- enum은 리플렉션으로 생성자를 가져올 수 없기 때문에 앞선 두 가지 방식처럼 리플렉션 방어 코드가 필요하지 않다.
- 직렬화 후 역직렬화하면 같은 인스턴스를 얻을 수 있다.



#### 2.3.2 단점

- 단, 만들려는 싱글턴이 Enum 외의 클래스를 상속해야 한다면 이 방법은 사용할 수 없다.



### 2.4 Lazy Initialization

* public static final 필드 방식과 정적 팩토리 방식은 클래스가 로딩되는 시점에 스태틱한 필드가 초기화 되면서 객체가 만들어진다.
* 생성에 많은 시간이 드는 객체지만 막상 사용하지 않는 경우

  * 싱글톤 객체를 실제 사용되는 시점에 만들고 싶다면?
  * 실제 사용되는 시점에 싱글톤 객체를 만드는 Lazy Initialization 방식을 사용
* [Singleton.md](../../../../../Design-Pattern/Singleton/Singleton.md) 참고



### 2.5 유의점

* public static final 필드 방식과 정적 팩토리 방식으로 만들어진 싱글턴 클래스를 직렬화하려면 단순히 `Serializable`을 구현한다고 선언하는 것만으로는 부족하다.
* 모든 인스턴스 필드에 `transient`를 선언하고, `readResolve` 메서드를 제공해야만 역직렬화시에 새로운 인스턴스가 만들어지는 것을 방지할 수 있다. 
* 만약 이렇게 하지 않으면 초기화해둔 인스턴스가 아닌 다른 인스턴스가 반환된다.

**예시**

```java
private Object readResolve() {
    return INSTANCE;
}
```



참고

* [이펙티브 자바 3/E](http://www.kyobobook.co.kr/product/detailViewKor.laf?mallGb=KOR&ejkGb=KOR&barcode=9788966262281)