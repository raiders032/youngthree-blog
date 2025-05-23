## 1 싱글톤 패턴

- 클래스의 인스턴스가 딱 1개만 생성하여 제공하는 디자인 패턴이다.
	- 시스템 런타임, 환경 세팅에 대한 정보 등, 인스턴스가 여러개 일 때 문제가 생길 수 있는 경우 사용한다.
- 그래서 객체 인스턴스를 2개 이상 생성하지 못하도록 막아야 한다.
	- private 생성자를 사용해서 외부에서 임의로 new 키워드를 사용하지 못하도록 막아야 한다.
- 다른 디자인 패턴(빌더, 퍼사드, 추상 팩토리 등) 구현체의 일부로 쓰이기도 한다.

### 1.1  Thread Safe하지 않은 구현

- 생성자를 private으로 만들어 외부에서 new로 새로운 객체를 만들지 못하게한다.
- getInstance()는 static으로 만들어 한개의 인스턴스를 제공한다.

```java
public class Settings {
  private static Settings instance; 
  
  private Settings() {}

  public static Settings getInstance() { 
    if (instance == null) {
      instance = new Settings();
    }
    return instance; 
  }
}
```

**문제점**

- 멀티 스레드 환경에서 Thread Safe하지 않다.
- `instance = new Settings();` 라인을 보자
	- 스레드 A가 해당 라인을 실행하는 도중에 컨텍스트 스위칭 발생
	- 스레드 B는 `if (instance == null)` 이 참이기 때문에 다음 라인 실행
	- 어떤 스레드가 `instance = new Settings();` 를 마지막에 실행한 스레드가 만든 객체가 싱글톤 객체가 될 것

### 1.2 synchronized 구현

**예시**

```java
public class Settings {
  private static Settings instance; 

  private Settings() {}

  public static synchronized Settings getInstance() { 
    if (instance == null) {
      instance = new Settings(); 
    }
    return instance; 
  }
}
```

- 클래스 로딩 시점
	- JVM이 Settings 클래스를 필요로 할 때
	- (예: 다른 클래스에서 Settings 클래스를 참조할 때) 클래스 로더에 의해 Settings 클래스가 로딩됩니다.
	- 이때 static 멤버인 instance 변수가 메모리에 할당되고 기본값인 null로 초기화됩니다.
	- 클래스의 정적 초기화 블록(있다면)이 실행됩니다.
	- 이 시점에서는 아직 Settings 객체가 생성되지 않았습니다.
- 객체 생성 시점
	- getInstance() 메소드가 처음으로 호출될 때까지 Settings 객체는 생성되지 않습니다.
	- 이를 "지연 초기화(Lazy Initialization)"라고 합니다.
	- getInstance()가 호출되면, 메소드 전체가 동기화(synchronized)되어 실행됩니다.
	- if (instance == null) 조건을 검사하고, null이면 새로운 Settings 객체를 생성합니다.
	- 생성된 객체의 참조를 static instance 변수에 할당합니다
	- 이후 getInstance() 호출에서는 이미 생성된 객체를 반환합니다.
- 동기화(Synchronization)의 영향
	- synchronized 키워드로 인해 한 번에 하나의 스레드만 getInstance() 메소드에 진입할 수 있습니다.
	- 이는 멀티스레드 환경에서 단 하나의 인스턴스만 생성됨을 보장합니다.
	- 하지만 메소드 전체가 동기화되어 있어, 객체 생성 이후에도 매번 락(lock)을 획득하고 해제하는 과정이 필요합니다.
- 성능 고려사항
	- 첫 호출 시: 객체 생성과 동기화로 인해 약간의 성능 부하가 있습니다.
	- 이후 호출: 객체 생성은 없지만, 여전히 동기화로 인한 오버헤드가 발생합니다.
	- 높은 동시성 환경에서는 이 동기화 과정이 병목점이 될 수 있습니다.

### 1.3 Eager Initialization 구현

- 클래스가 로딩되는 시점에 스태틱한 필드가 초기화 되면서 객체가 만들어진다.
- Thread Safe하다

```java
public class Settings {
  private static final Settings INSTANCE = new Settings();
  
  private Settings() {}

  public static Settings getInstance() { 
    return INSTANCE;    
  }    
}
```

- 실제 `java.lang.Runtime` 가 이 방식으로 구현됨

```java
package java.lang;

public class Runtime {
  private static final Runtime currentRuntime = new Runtime();

  public static Runtime getRuntime() {
    return currentRuntime;
  }
}
```

**문제점**

- 미리 만드는 것이 문제일 수 있다
- 생성에 많은 시간이 드는 객체지만 막상 사용하지 않는 경우
	- 싱글톤 객체를 실제 사용되는 시점에 만들고 싶다면?

### 1.4 double checked locking 구현

- 싱글톤 객체를 필요한 시점에 만들고 싶다(lazy initialization)
- Thread Safe하다
- 기존 synchronized 구현의 더 효율적인 버전
	- getInstance() 메서드가 호출될 때 마다 매번 동기화 작업을 할 필요가 없다.
	- 이미 인스턴스가 있는 경우 동기화 로직이 아예 실행되지 않기 때문
- volatile?
	- 1.5 이상부터 동작

```java
public class Settings {
  private static volatile Settings instance; 

  private Settings() {}

  public static Settings getInstance() { 
    if (instance == null) {
      synchronized (Settings.class) { 
        if (instance == null) {
          instance = new Settings(); 
        }
      } 
    }
    return instance; 
  }
}
```

### 1.5 static inner 클래스로 구현

```java
public class Settings {
  private Settings() {}
  
  private static class SettingsHolder {
    private static final Settings SETTINGS = new Settings();
  }
  
  public static Settings getInstance() { 
    return SettingsHolder.SETTINGS;
 	}
}
```

- 지연 초기화(Lazy Initialization)
	- SettingsHolder 클래스는 Settings 클래스가 로드될 때 함께 로드되지 않습니다.
	- getInstance() 메소드가 호출될 때 SettingsHolder 클래스가 로드되고, 이때 SETTINGS가 생성됩니다
- 스레드 안전성
	- JVM이 클래스 로딩 시점에 단 한 번만 인스턴스를 생성하므로 스레드 안전성이 보장됩니다.
	- 별도의 동기화 처리가 필요 없습니다.
- 성능
	- 동기화 로직이 없어 성능이 우수합니다.
	- 필요한 시점에 인스턴스가 생성되므로 메모리 효율성도 좋습니다.
- 간결성
	- 코드가 간결하고 이해하기 쉽습니다.
- 직렬화 대응
	- 직렬화를 위해서는 추가적인 처리가 필요할 수 있습니다.

## 2 싱글톤 패턴 문제점

- 싱글톤 패턴을 구현하는 코드 자체가 많이 들어간다.
- 의존관계상 클라이언트가 구체 클래스에 의존한다.
	- DIP를 위반한다.
- 클라이언트가 구체 클래스에 의존해서 OCP 원칙을 위반할 가능성이 높다.
- 테스트하기 어렵다.
- 내부 속성을 변경하거나 초기화 하기 어렵다.
- private 생성자로 자식 클래스를 만들기 어렵다.
- 결론적으로 유연성이 떨어진다.
- 안티패턴으로 불리기도 한다.