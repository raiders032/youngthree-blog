---
title: "ConcurrentHashMap"
description: "Java의 ConcurrentHashMap에 대해 기본 개념부터 내부 동작 원리까지 상세히 알아봅니다. HashMap의 기본 구조를 바탕으로 동시성 처리 방식을 이해하고, 실제 활용 사례를 통해 효과적인 사용법을 학습합니다."
tags: ["CONCURRENTHASHMAP", "JAVA_COLLECTIONS", "MULTITHREADING", "DATA_STRUCTURE", "JAVA", "BACKEND"]
keywords: ["ConcurrentHashMap", "컨커런트해시맵", "동시성", "멀티스레드", "자바", "해시맵", "hashmap", "동기화", "락", "버킷", "해시"]
draft: false
hide_title: true
---

## 1. HashMap의 기본 구조 이해하기
- ConcurrentHashMap을 이해하기 위해서는 먼저 HashMap의 기본 구조를 이해해야 합니다.
- HashMap은 키-값 쌍을 저장하는 자료구조로, 해시 함수를 사용해 키를 버킷에 매핑합니다.

### 1.1 HashMap의 내부 구조
- HashMap은 내부적으로 다음과 같은 구조를 가집니다

1. **배열 (버킷 배열)**
   - 데이터를 저장하는 여러 개의 버킷(bucket)으로 구성된 배열
   - 각 버킷은 실제 데이터를 저장하는 공간
2. **해시 함수**
   - 키(key)를 특정 버킷에 매핑하는 함수
   - 같은 키는 항상 같은 버킷으로 매핑됨

:::info
버킷(Bucket)은 데이터를 저장하는 '상자'라고 생각하면 됩니다.
해시 함수는 각 키가 어떤 상자에 들어가야 하는지 결정합니다.
:::

### 1.2 데이터 저장 과정

```java
HashMap<String, String> map = new HashMap<>();
map.put("apple", "red");

// 내부적으로 일어나는 과정:
// 1. "apple" 문자열의 해시값 계산
// 2. 해시값을 버킷 배열의 크기로 나눈 나머지로 버킷 인덱스 결정
// 3. 해당 버킷에 키-값 쌍 저장
```

## 2. ConcurrentHashMap의 동시성 처리

### 2.1 일반 HashMap의 문제점
- 여러 스레드가 동시에 HashMap을 사용할 때 발생할 수 있는 문제

```java
// 스레드 1과 2가 동시에 같은 버킷에 접근할 때
Thread 1: map.put("apple", "red");
Thread 2: map.put("banana", "yellow");
// 데이터 충돌 또는 손실 가능
```

### 2.2 ConcurrentHashMap의 해결 방식
- Java 8의 ConcurrentHashMap은 버킷 단위로 락(lock)을 걸어 동시성 문제를 해결합니다:

**버킷별 독립적인 락**
 ```java
 ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
 
 // 다른 버킷에 접근하는 경우 동시 처리 가능
 Thread 1: map.put("apple", "red");     // 버킷 1 사용
 Thread 2: map.put("banana", "yellow"); // 버킷 2 사용
 ```

**세밀한 동기화**
 ```java
 // 내부 동작 방식 (의사 코드)
 V put(K key, V value) {
     // 1. 키의 해시값으로 버킷 찾기
     int hash = hash(key);
     int bucket = hash & (bucketCount - 1);
     
     // 2. 해당 버킷의 첫 노드를 락으로 사용
     synchronized (bucket의 첫 노드) {
         // 3. 데이터 추가 또는 수정
     }
 }
 ```

### 2.3 데이터 구조
- 각 버킷의 데이터는 노드(Node)라는 형태로 저장됩니다:

```java
// 노드의 기본 구조
class Node<K,V> {
    final K key;           // 키
    volatile V value;      // 값
    volatile Node<K,V> next; // 다음 노드 참조
    final int hash;        // 해시값
}
```

:::tip
volatile 키워드는 멀티스레드 환경에서 변수의 가시성(visibility)을 보장합니다.
모든 스레드가 항상 최신 값을 볼 수 있게 합니다.
:::

## 3. ConcurrentHashMap의 주요 특징

### 3.1 락 없는 읽기 작업
- 읽기 작업은 락을 사용하지 않아 매우 빠릅니다

```java
// get 작업은 락 없이 수행
String value = map.get("apple");
```

### 3.2 버킷별 독립적인 락
- 서로 다른 버킷의 작업은 동시에 처리 가능

```java
// 동시에 실행 가능한 작업들
Thread 1: map.put("apple", "red");      // 버킷 1
Thread 2: map.put("banana", "yellow");  // 버킷 2
Thread 3: map.get("orange");           // 락 없이 읽기
```

## 4. 실제 활용 예제

### 4.1 간단한 캐시 구현

```java
public class SimpleCache {
    private final ConcurrentHashMap<String, Object> cache = 
        new ConcurrentHashMap<>();
    
    public Object get(String key, Supplier<?> valueLoader) {
        // 키가 없을 때만 새 값을 계산하여 저장
        return cache.computeIfAbsent(key, k -> valueLoader.get());
    }
}

// 사용 예
SimpleCache cache = new SimpleCache();
String value = (String) cache.get("key", () -> "expensive computation");
```

### 4.2 동시 요청 카운터

```java
public class RequestCounter {
    private final ConcurrentHashMap<String, Long> counts = 
        new ConcurrentHashMap<>();
    
    public void incrementCount(String endpoint) {
        // 원자적으로 카운트 증가
        counts.merge(endpoint, 1L, Long::sum);
    }
    
    public long getCount(String endpoint) {
        return counts.getOrDefault(endpoint, 0L);
    }
}
```

## 5. 주의사항과 모범 사례

### 5.1 Null 사용 금지

```java
// 이런 코드는 사용하면 안 됨
map.put(null, value);    // NullPointerException
map.put(key, null);      // NullPointerException

// 대신 이렇게 사용
map.remove(key);         // 값을 제거하고 싶을 때
```

### 5.2 크기 최적화

```java
// 예상 크기를 지정하여 생성
ConcurrentHashMap<String, String> map = 
    new ConcurrentHashMap<>(initialCapacity);

// 크기 관련 메서드는 추정치임을 인지
int approximateSize = map.size();  // 정확한 값이 아닐 수 있음
```

## 6. 마치며
- ConcurrentHashMap은 다음과 같은 상황에서 최적의 선택입니다:
  - 여러 스레드가 동시에 맵에 접근하는 경우
  - 읽기 작업이 쓰기 작업보다 많은 경우
  - 높은 동시성이 요구되는 경우