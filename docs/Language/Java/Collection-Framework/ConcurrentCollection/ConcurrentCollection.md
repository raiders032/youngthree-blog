## 1 Concurrent Collection 개요

- java.util` 패키지에 소속되어 있는 컬렉션 프레임워크는 원자적인 연산을 제공하지 않습니다.
- 예를 들어서 하나의 `ArrayList` 인스턴스에 여러 스레드가 동시에 접근하는 경우 스레드 세이프(Thread Safe)하지 않습니다.
- 따라서 여러 스레드가 접근해야 한다면 `synchronized` , `Lock` 등을 통해 안전한 임계 영역을 구현해야 합니다.

### 1.1 Synchronization Wrappers 컬렉션

- Java에서는 Synchronization Wrappers 컬렉션을 제공하여 멀티 스레드 환경에서 하나의 스레드가 요소를 안전하게 처리하게 도와줍니다.
- Collections의 static 메소드를 사용하여 비동기화된 컬렉션을 동기화된 컬렉션으로 바꿔줄 수 있습니다.
- 이 방식은 프록시 패턴을 사용하여 원본 컬렉션을 감싸고 있으며, 각 메소드 호출 시에 `synchronized` 키워드를 사용하여 동기화를 수행합니다.

```java
```java
public class Collections {
  public static <T> Collection<T> synchronizedCollection(Collection<T> c);
  public static <T> Set<T> synchronizedSet(Set<T> s);
  public static <T> List<T> synchronizedList(List<T> list);
  public static <K,V> Map<K,V> synchronizedMap(Map<K,V> m);
  public static <T> SortedSet<T> synchronizedSortedSet(SortedSet<T> s);
  public static <K,V> SortedMap<K,V> synchronizedSortedMap(SortedMap<K,V> m);
}
```

- `Collections` 는 다음과 같이 다양한 `synchronized` 동기화 메서드를 지원합니다.
- 이 메서드를 사용하면 `List` ,`Collection` , `Map` , `Set` 등 다양한 동기화 프록시를 만들어낼 수 있습니다.

### 1.2 Synchronization Wrappers 컬렉션의 단점

- 비록 `synchronized` 키워드가 멀티스레드 환경에서 안전한 접근을 보장하지만, 각 메서드 호출 시마다 동기화 비용이 추가된다. 이로 인해 성능 저하가 발생할 수 있다.
	- 따라서 싱글 스레드 환경에서는 사용하지 않는 것이 좋다.
- 전체 컬렉션에 대해 동기화가 이루어지기 때문에, 잠금 범위가 넓어질 수 있습니다.
	- 이는 잠금 경합(lock contention)을 증가시키고, 병렬 처리의 효율성을 저하시키는 요인이 됩니다.
	- 모든 메서드에 대해 동기화를 적용하다 보면, 특정 스레드가 컬렉션을 사용하고 있을 때 다른 스레드들이 대기해야 하는 상황이 빈번해질 수 있습니다.
- 정교한 동기화가 불가능합니다.
	- `synchronized` 프록시를 사용하면 컬렉션 전체에 대한 동기화가 이루어지 지만, 특정 부분이나 메서드에 대해 선택적으로 동기화를 적용하는 것은 어렵습니다.
	- 이는 과도한 동기화로 이어질 수 있습니다.
- 자바는 이런 단점을 보완하기 위해 `java.util.concurrent` 패키지에 동시성 컬렉션(concurrent collection)을 제공합니다.

## 2 Concurrent Collection

- 자바 1.5부터 동시성에 대한 많은 혁신이 이루어졌습니다. 그 중에 동시성을 위한 컬렉션도 있습니다.
- `java.util.concurrent` 패키지는 고성능 멀티스레드 환경을 지원하는 다양한 동시성 컬렉션 클래스들을 제공합니다.
- 이러한 컬렉션들은 더 정교한 잠금 메커니즘을 사용하여 동시 접근을 효율적으로 처리합니다.

### 2.1 동시성 컬렉션의 특징

- 다양한 성능 최적화 기법이 적용되어 있습니다:
	- `synchronized` 키워드
	- `Lock` (`ReentrantLock`)
	- `CAS` (Compare And Swap)
	- 분할 잠금 기술(segment lock)
- 필요한 경우 일부 메서드에 대해서만 동기화를 적용하는 등 유연한 동기화 전략을 제공합니다.
- 매우 정교한 동기화를 구현하면서 동시에 성능도 최적화되어 있습니다.

### 2.2 주요 동시성 컬렉션 클래스

#### List 인터페이스 구현체

- `CopyOnWriteArrayList`: `ArrayList`의 동시성 처리 대안
	- 데이터를 변경할 때 복사본을 만들어 작업하므로 읽기 작업이 많은 경우 적합

#### Set 인터페이스 구현체

- `CopyOnWriteArraySet`: `HashSet`의 동시성 처리 대안
- `ConcurrentSkipListSet`: `TreeSet`의 대안
	- 정렬된 순서를 유지하며 `Comparator` 사용 가능

#### Map 인터페이스 구현체

- `ConcurrentHashMap`: `HashMap`의 동시성 처리 대안
- `ConcurrentSkipListMap`: `TreeMap`의 대안
	- 정렬된 순서를 유지하며 `Comparator` 사용 가능

#### Queue/Deque 인터페이스 구현체

- `ConcurrentLinkedQueue`: 비차단(non-blocking) 큐
- `ConcurrentLinkedDeque`: 비차단(non-blocking) 데크

### 2.3 블로킹 큐(BlockingQueue) 구현체

- `ArrayBlockingQueue`
	- 크기가 고정된 블로킹 큐
	- 공정(fair) 모드 사용 가능 (성능 저하 가능성 있음)
- `LinkedBlockingQueue`
	- 크기가 무한하거나 고정된 블로킹 큐
- `PriorityBlockingQueue`
	- 우선순위가 높은 요소를 먼저 처리하는 블로킹 큐
- `SynchronousQueue`
	- 데이터를 저장하지 않는 블로킹 큐
	- 생산자와 소비자 간의 직접적인 핸드오프(hand-off) 메커니즘 제공
- `DelayQueue`
	- 지연된 요소를 처리하는 블로킹 큐
	- 각 요소는 지정된 지연 시간이 지난 후에만 소비 가능
	- 스케줄링 작업에 주로 사용
