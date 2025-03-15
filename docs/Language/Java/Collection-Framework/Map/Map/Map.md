## 1 Map Interface

- Map은 키(key)와 값(value)을 매핑하는 자료구조입니다.
	- 여기서 키와 값은 모두 객체입니다.
- Map은 중복되는 키를 가질 수 없습니다.
	- 기존에 저장된 키와 동일한 키로 값을 저장하면 기존 값은 새로운 값으로 대체됩니다.
- Map은 중복된 값을 가질 수 있습니다.
- 각 키는 최대 하나의 값과 매핑됩니다

### 1.1 메소드

- [참고](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/Map.html)

**기본 값을 가지는 맵 만들기**

```java
static <K, V> Map<K, V> newAttributeMap(Map<K, V>defaults, Map<K, V> overrides) {
    Map<K, V> result = new HashMap<K, V>(defaults);
    result.putAll(overrides);
    return result;
}
```

### 1.2 구현체

- [HashMap](#2-hashmap-class)
	- 일반적인 용도로 가장 많이 사용되는 해시 테이블 기반 구현체
- [HashTable](#3-hashtable-class)
	- 레거시 클래스로, ConcurrentHashMap으로 대체됨 (사용 권장하지 않음)
- [TreeMap](#4-treemap-class)
	- 키의 자연 순서 또는 생성자에 제공된 Comparator에 따라 정렬된 트리 기반 구현체
- [LinkedHashMap](#5-linkedhashmap-class)
	- 삽입 순서 또는 접근 순서를 보존하는 해시 테이블과 연결 리스트 기반 구현체

### 1.3 aggregate operation

- Java 8부터 스트림 API와 함께 Map 관련 집계 연산이 강화되었습니다.
- Collectors 클래스는 스트림에서 Map으로 결과를 수집하는 다양한 메서드를 제공합니다.
- JDK8의 aggregate operation 사용해서 Map으로 결과 받기 예시

**부서별 직원 리스트**

```java
Map<Department, List<Employee>> byDept = employees.stream()
.collect(Collectors.groupingBy(Employee::getDepartment));
```

**부서별 총 봉급**

```java
Map<Department, Integer> totalByDept = employees.stream()
.collect(Collectors.groupingBy(Employee::getDepartment,
Collectors.summingInt(Employee::getSalary)));
```

**도시별 사람**

```java
Map<String, List<Person>> peopleByCity = personStream
  .collect(Collectors.groupingBy(Person::getCity));
```

### 1.4 Map 순회하기

- Map의 메서드 중 Collection 타입을 반환하는 메서드를 이용해 맵을 순회할 수 있습니다.
	- keySet(): Map이 가진 키의 Set을 반환합니다.
	- values(): Map이 가진 값의 Collection을 반환합니다.
		- entrySet(): Map이 가진 키-값 쌍의 Set을 반환합니다.

**Map Interface**

```java
public interface Map<K, V> {
  Set<K> keySet();
  Collection<V> values();
  Set<Map.Entry<K, V>> entrySet();
}
```

**예시1**

```java
for (KeyType key : m.keySet())
  System.out.println(key);
```

```java
for (Iterator<Type> it = m.keySet().iterator(); it.hasNext(); )
  if (it.next().isBogus())
    it.remove();
```

```java
for (Map.Entry<KeyType, ValType> e : m.entrySet())
  System.out.println(e.getKey() + ": " + e.getValue());
```

## 2 HashMap Class

- 해시 테이블을 기반으로 Map 인터페이스를 구현한 클래스입니다.
	- 연결 리스트로 이루어진 배열을 가지고 있다
- HashMap의 키로 사용할 객체는 hashCode()와 equals() 메서드를 적절히 재정의해야 합니다.
	- String은 이미 hashCode()와 equals()가 적절히 재정의되어 있어 키로 자주 사용됩니다.
- 키와 값의 타입은 기본 타입을 사용할 수 없고 클래스 및 인터페이스 타입만 가능하다.
- 키와 값으로 null을 허용합니다.

### 2.1 특징

- Not ordered
	- HashMap은 요소들이 추가된 순서를 보존하지 않습니다.
	- 순서가 중요한 경우에는 HashMap의 변형인 LinkedHashMap을 사용할 수 있는데, LinkedHashMap은 삽입 순서를 유지합니다.
- Thread-unsafe
	- HashMap은 스레드 안전(thread-safe)하지 않습니다.
	- 이는 여러 스레드가 동시에 같은 HashMap에 접근할 경우 데이터 불일치가 발생할 수 있다는 것을 의미합니다.
	- 스레드 안전성이 필요한 경우에는 ConcurrentHashMap을 사용해야 합니다. ConcurrentHashMap은 동시성을 지원하도록 특별히 설계되었습니다.
- Capacity and load factor
	- HashMap은 용량(capacity)과 로드 팩터(load factor)라는 두 가지 중요한 속성을 가지고 있습니다:
		- 용량(Capacity)
		- HashMap이 보유할 수 있는 요소(버킷)의 수입니다. 기본 초기 용량은 16입니다.
	- 로드 팩터(Load Factor)
		- HashMap이 리사이징(크기 조정)되기 전에 얼마나 차도록 허용할 것인지를 나타내는 측정값입니다.
		- 기본 로드 팩터는 0.75입니다. 이는 HashMap이 75% 차게 되면(즉, 12개의 버킷이 사용되면) 자동으로 크기가 조정된다는 것을 의미합니다.

### 2.2 Capacity and load factor

- HashMap은 용량(capacity)과 로드 팩터(load factor)라는 두 가지 중요한 속성을 가지고 있습니다:
- 용량(Capacity)
	- HashMap이 보유할 수 있는 요소(버킷)의 수입니다.
	- 이는 HashMap이 인스턴스화될 때 보유할 수 있는 버킷(내부 배열의 칸)의 수입니다.
	- 기본 초기 용량은 16입니다.
- 로드 팩터(Load Factor)
	- 로드 팩터는 HashMap의 용량을 증가시켜야 하는 시점을 결정하는 백분율 값입니다.
	- HashMap이 리사이징(크기 조정)되기 전에 얼마나 차도록 허용할 것인지를 나타내는 측정값입니다.
	- 기본 로드 팩터는 0.75입니다. 이는 HashMap이 75% 차게 되면(즉, 12개의 버킷이 사용되면) 자동으로 크기가 조정된다는 것을 의미합니다.
- 리해싱(Rehashing)
	- 리해싱은 HashMap이 임계값에 도달한 후 용량을 두 배로 늘리는 과정입니다.
	- 초기 용량을 높게 설정하면 리해싱이 전혀 수행되지 않을 수 있습니다.
- 예시
	- 초기 용량이 16이고 로드 팩터가 0.75인 HashMap에 13번째 요소가 추가되면, HashMap은 내부 배열의 크기를 두 배로 늘려 32로 확장하고 모든 기존 항목을 새 버킷에 재배치(rehash)
	  합니다.
	- 이 과정은 시간이 많이 소요될 수 있으므로, 필요한 용량을 미리 알고 있다면 초기 생성 시 적절한 크기로 설정하는 것이 성능상 유리합니다.

### 2.3 성능

- 검색과 삽입에 O(1) 시간이 소요된다
- 해시 테이블은 성능에 영향을 미치는 두 가지 파라미터를 가지고 있다
	- *initial capacity* 와 *load factor*
- initial capacity
	- 해시 테이블의 버킷의 개수
	- 기본값 16
- `load factor == n/k`
	- n: 해시 테이블에 저장된 개수
	- k: 버킷의 개수
	- 해시맵의 디폴트 로드 팩터는 0.75(시간과 공간 비용의 적절한 절충안이라고 한다)
	- 일반적으로 로드 팩터가 증가할 수록 해시 테이블의 성능은 점점 감소한다
	- 자바10의 경우 0.75를 넘어서는 경우 동적 배열처럼 해시 테이블의 공간을 재할당한다
- 자바 8부터는 체이닝(여러 키가 같은 버킷에 해시될 때)을 위해 연결 리스트 대신 자가 균형 이진 검색 트리(Self-Balancing Binary Search Tree)를 사용하기 시작했습니다.
	- 해시 버킷에 저장된 항목 수가 특정 임계값(TREEIFY_THRESHOLD)을 초과하면, 해당 버킷은 연결 리스트에서 Red-Black Tree와 같은 균형 트리 구조로 변환됩니다
	- 기본적으로 TREEIFY_THRESHOLD는 8로 설정되어 있으며, 버킷 내 항목이 8개를 초과하면 트리로 변환됩니다
		- 자가 균형 이진 검색 트리의 장점은 최악의 경우(모든 키가 동일한 슬롯에 매핑되는 경우)에도 검색 시간이 O(Log n)이라는 점입니다.
	- 이는 자바 8 이전에는 최악의 경우 검색 시간이 O(n)이었던 것과 비교하여 상당한 성능 향상을 제공합니다.
	- 이 변화는 해시 충돌이 많이 발생하는 상황에서 특히 큰 성능 향상을 가져옵니다.
	- 버킷 내에 있는 항목의 수가 특정 임계값(보통 8)을 초과하면, 그 버킷의 연결 리스트는 균형 트리로 변환되어 검색 효율성을 높입니다.

## 3 HashTable Class

- `HashMap` 과 동일한 내부 구조를 가지고있다.
- `HashMap` 과 차이점:  `HashTable`은 동기화된 메소드로 구성되어 있기 때문에 멀티 스레드가 동시에 이 메소드를 실행 할 수 없다. 따라서 `Thread Safe`하다

**HashTable 클래스**

- method에 synchronized 키워드가 적용되어 한 스레드만 메소드를 실행할 수 있다.

```java
public class Hashtable<K,V>
  extends Dictionary<K,V>
  implements Map<K,V>, Cloneable, java.io.Serializable {

  public synchronized int size() {
    return count;
  }

  public synchronized boolean isEmpty() {
    return count == 0;
  }

  public synchronized Enumeration<K> keys() {
    return this.<K>getEnumeration(KEYS);
  }

  public synchronized Enumeration<V> elements() {
    return this.<V>getEnumeration(VALUES);
  }

}
```

**Thread Safe Map**

- Thread Safe한 Map이 필요하다면 HashTable 대신 ConcurrentHashMap을 사용하는 것이 권장된다.

### 3.1 HashMap과 HashTable

- 키에 대한 해시 값을 사용하여 값을 저장하고 조회하며, 키-값 쌍의 개수에 따라 동적으로 크기가 증가하는 associate array라고 할 수 있다.
	- associate array를 지칭하는 다른 용어가 있는데, 대표적으로 Map, Dictionary, Symbol Table 등이다.
- HashMap과 HashTable은 Java의 API 이름이다.
- HashMap과 HashTable은 Map 인터페이스를 구현하고 있기 때문에 HashMap과 HashTable이 제공하는 기능은 같다.

**HashTable**

- HashTable이란 JDK 1.0부터 있던 Java의 API이다
- HashTable의 현재 가치는 JRE 1.0, JRE 1.1 환경을 대상으로 구현한 Java 애플리케이션이 잘 동작할 수 있도록 하위 호환성을 제공하는 것

**HashMap**

- HashMap은 Java 2에서 처음 선보인 Java Collections Framework에 속한 API다.
- HashMap은 보조 해시 함수(Additional Hash Function)를 사용하기 때문에 보조 해시 함수를 사용하지 않는 HashTable에 비하여 해시 충돌(hash collision)이 덜 발생할 수
  있어 상대으로 성능상 이점이 있다.
- HashTable 구현에는 거의 변화가 없는 반면, HashMap은 지속적으로 개선되고 있다.

## 4 TreeMap Class

- TreeMap은 키의 자연 순서(natural ordering) 또는 사용자 정의 Comparator에 따라 정렬된 순서로 키-값 쌍을 저장합니다.
- 내부적으로는 Red-Black Tree(레드-블랙 트리)라는 자가 균형 이진 검색 트리를 사용하여 추가, 제거, 검색 등의 작업을 O(log n)의 시간 복잡도로 효율적으로 수행합니다.
- TreeMap은 정렬을 위해 엔트리의 키가 Comparable을 구현해야 하거나 생성자에 Comparator를 제공해야 합니다.
	- [Comparable Comparator 참고](../../../Comparable-Comparator/Comparable-Comparator.md)
- Comparable를 구현하지 않은 객체를 키로 사용하려면 TreeMap 생성시 정렬자(Comparator의 구현체)를 제공하면 된다.
- 기본적으로 부모 키값과 비교해서 키 값이 낮은 것은 왼쪽 자식노드에, 키 값이 높은 것은 오른쪽 자식 노드에 객체를 저장한다.
- thread-safe하지 않다

### 4.1 특징

- 항상 정렬된 상태 유지:
	- TreeMap에 저장된 키는 항상 정렬된 상태를 유지합니다.
	- 이 정렬은 키의 자연 순서(Comparable 인터페이스를 구현한 경우) 또는 TreeMap 생성 시 제공된 Comparator에 의해 결정됩니다.
	- 이 특성은 키를 정렬된 순서로 처리해야 하는 경우 매우 유용합니다.
- 시간 복잡도:
	- TreeMap의 대부분의 작업(get, put, remove 등)은 O(log n)의 시간 복잡도를 갖습니다.
	- 이는 내부적으로 균형 잡힌 트리 구조를 사용하기 때문입니다.
	- HashMap이 평균적으로 O(1)의 시간 복잡도를 가지는 것에 비해 약간 느리지만, 정렬된 상태를 유지해야 하는 경우에는 TreeMap이 더 적합합니다.
- null 키 허용 여부:
	- TreeMap은 null을 키로 허용하지 않습니다.
	- null 키를 삽입하려고 하면 NullPointerException이 발생합니다.
	- 이는 키를 비교해야 하기 때문입니다. 그러나 TreeMap은 값(value)으로는 null을 허용합니다.
- 동기화 지원 여부:
	- TreeMap은 기본적으로 동기화되지 않습니다.
	- 즉, 멀티스레드 환경에서 여러 스레드가 동시에 TreeMap을 수정하면 예기치 않은 결과가 발생할 수 있습니다.
		- 스레드 안전한 작업이 필요한 경우, Collections.synchronizedMap 메서드를 사용하여 동기화된 맵을 얻을 수 있습니다.

### 4.2 메소드

- [레퍼런스](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/TreeMap.html)
- Map은 순서가 없지만 TreeMap은 순서가 있기 때문에 순서와 관련된 메소드를 사용하려면 참조 변수의 타입을 Map 대신 TreeMap을 사용하자
- 아래는 순서와 관련된 메소드 일부이다.

| Modifier and Type | Method                | Description                                                                                                                          |
|:------------------|:----------------------|:-------------------------------------------------------------------------------------------------------------------------------------|
| `Map.Entry<K,V>`  | `firstEntry()`        | Returns a key-value mapping associated with the least key in this map, or `null` if the map is empty.                                |
| `Map.Entry<K,V>`  | `lastEntry()`         | Returns a key-value mapping associated with the greatest key in this map, or `null` if the map is empty.                             |
| `Map.Entry<K,V>`  | `lowerEntry(K key)`   | Returns a key-value mapping associated with the greatest key strictly less than the given key, or `null` if there is no such key.    |
| `Map.Entry<K,V>`  | `higherEntry(K key)`  | Returns a key-value mapping associated with the least key strictly greater than the given key, or `null` if there is no such key.    |
| `Map.Entry<K,V>`  | `floorEntry(K key)`   | Returns a key-value mapping associated with the greatest key less than or equal to the given key, or `null` if there is no such key. |
| `Map.Entry<K,V>`  | `ceilingEntry(K key)` | Returns a key-value mapping associated with the least key greater than or equal to the given key, or `null` if there is no such key. |

### 4.3 성능

- 검색과 삽입에 O(log N) 시간이 소요됩니다.
- TreeMap에 요소를 삽입하는 것은 일반 Map(예: HashMap)에 요소를 삽입하는 것보다 느릴 수 있습니다.
	- 이는 TreeMap이 요소들의 정렬된 순서를 유지해야 하기 때문입니다.
	- 삽입 시 적절한 위치를 찾고 트리의 균형을 다시 맞추는 과정이 필요하므로, 삽입 작업의 시간 복잡도는 O(log n)입니다.
	- 반면 HashMap의 경우 평균적으로 O(1)의 시간 복잡도를 가집니다.

## 5 LinkedHashMap Class

- LinkedHashMap은 Java의 Collections Framework에서 Map 인터페이스를 구현한 클래스입니다.
- 이 자료구조는 키-값 쌍을 저장하면서 동시에 요소가 삽입된 순서를 유지하는 특징을 가지고 있습니다.
- LinkedHashMap 클래스는 기본적으로 동기화되지 않습니다.
- 생성자에서 `accessOrder`라는 불린 값을 설정하여, 삽입 순서를 유지할 것인지 접근 순서를 유지할 것인지를 결정할 수 있다.
	- `false`: 삽입 순서 유지
	- `true`: 접근 순서 유지
- 접근 순서가 설정된 LinkedHashMap에서는 `get`, `put`, `putAll` 같은 메소드를 호출할 때마다 해당 엔트리가 마지막 위치로 이동합니다.
- `removeEldestEntry(Map.Entry<K,V> eldest)` 메소드를 오버라이드하여, 맵에 새로운 엔트리가 추가될 때 가장 오래된 엔트리를 자동으로 삭제할 수 있습니다.
	- 이 기능을 사용하여 캐시 같은 자료 구조를 구현할 수 있습니다.

### 5.1 내부 구조

- LinkedHashMap은 HashMap을 확장(extends)하고 Map 인터페이스를 구현합니다.
- 데이터는 노드 형태로 저장되며, 구현 방식은 이중 연결 리스트(doubly-linked list)와 유사합니다.
- 각 노드는 다음과 같은 요소로 구성됩니다
	- Key: 데이터의 키 (HashMap에서 상속)
	- Value: 키에 연결된 값
	- Next: LinkedHashMap의 다음 노드 주소
	- Previous: LinkedHashMap의 이전 노드 주소

### 5.1 생성자

```java
public LinkedHashMap(int initialCapacity)
public LinkedHashMap(int initialCapacity, float loadFactor)
public LinkedHashMap(int initialCapacity, float loadFactor, boolean accessOrder)
```

- LinkedHashMap은 다양한 생성자를 제공한다. 주요 생성자는 위과 같다.
- `initialCapacity`: 해시 테이블의 초기 크기.
- `loadFactor`
	- 로드 팩터(해시 테이블의 용량이 어느 정도 차면 자동으로 크기를 조정할 지 결정하는 값).
	- 기본값은 0.75로, 이는 해시 테이블의 75%가 차면 자동으로 해시 테이블의 크기를 늘린다는 의미이다.
	- 로드 팩터를 낮게 설정하면 메모리 사용량은 증가하지만, 충돌의 가능성이 감소하여 조회 성능이 향상될 수 있다.
	- 반대로 로드 팩터를 높게 설정하면 메모리 사용은 줄어들지만, 충돌의 가능성이 증가하여 조회 성능이 저하될 수 있다.
- `accessOrder`:`false`면 삽입 순서를 유지,`true`면 접근 순서를 유지.

### 5.2 성능

- 검색과 삽입에 O(1) 시간이 소요됩니다.

### 5.3 LRU 캐시 구현

```java
import java.util.LinkedHashMap;
import java.util.Map;

public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LRUCache(int capacity) {
        // true = use access order instead of insertion order.
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        // Remove the oldest element whenever size > capacity
        return size() > capacity;
    }

    // Access methods for the cache
    public V getCache(K key) {
        return super.getOrDefault(key, null);
    }

    public void setCache(K key, V value) {
        super.put(key, value);
    }
}
```

- `capacity`는 캐시가 보유할 수 있는 최대 항목 수입니다.
- 생성자는 지정된`capacity`, 기본 로드 인자(0.75) 및`accessOrder = true`를 사용하여`LinkedHashMap`을 초기화합니다
	- `accessOrder를` `true로` 지정했기 때문에 마지막 액세스 시간을 기준으로 요소의 순서를 유지합니다.
- `removeEldestEntry`메소드는 제거 정책을 구현하기 위해 재정의되었습니다.
	- Map의 크기가 지정된 용량을 초과하면 true를 반환하고 가장 나중에 액세스한 항목의 제거됩니다.
- 'getCache' 및 'setCache' 메소드는 항목 액세스 및 추가를 위해 각각 제공됩니다.

## 6 어떤 구현체를 사용해야 될까?

- 원소의 키로 정렬이 필요하면 TreeMap을 사용한다.
- 최상의 성능과 원소의 순서를 신경쓰지 않는다면 HashMap을 사용한다.
- HashMap에 가까운 성능과 원소 삽인 순서가 필요하다면 LinkedHashMap을 사용한다.

**예시**

- 키의 순서
- HashMap: 무작위
- TreeMap: 키의 값을 기준으로 정렬 됨
- linkedHashMap: 삽입 순서로 정렬 됨

```java
@Test
void testMap() {
  List<String> strings = Arrays.asList("if", "it", "is", "to", "be", "it", "is", "up", "to", "me", "to", "delegate");
  Map<String, Integer> hashMap = new HashMap<>();
  Map<String, Integer> treeMap = new TreeMap<>();
  Map<String, Integer> linkedHashMap = new LinkedHashMap<>();

  for (String a : strings) {
    Integer freq = hashMap.get(a);
    hashMap.put(a, (freq == null) ? 1 : freq + 1);

    freq = treeMap.get(a);
    treeMap.put(a, (freq == null) ? 1 : freq + 1);

    freq = linkedHashMap.get(a);
    linkedHashMap.put(a, (freq == null) ? 1 : freq + 1);
  }

  Assertions.assertThat(hashMap.size()).isEqualTo(8);
  Assertions.assertThat(treeMap.size()).isEqualTo(8);
  Assertions.assertThat(linkedHashMap.size()).isEqualTo(8);

  System.out.println("hashMap: " + hashMap);
  System.out.println("treeMap: " + treeMap);
  System.out.println("linkedHashMap: " + linkedHashMap);
}
```

```java
hashMap: {delegate=1, be=1, me=1, is=2, it=2, to=3, up=1, if=1}
treeMap: {be=1, delegate=1, if=1, is=2, it=2, me=1, to=3, up=1}
linkedHashMap: {if=1, it=2, is=2, to=3, be=1, up=1, me=1, delegate=1}
```

참고

* https://docs.oracle.com/javase/tutorial/collections/interfaces/map.html
* https://docs.oracle.com/javase/tutorial/collections/implementations/map.html
* https://d2.naver.com/helloworld/831311
* 이것이 자바다(이상민 저)