---
title: "Queue"
description: "자료구조 큐(Queue)의 기본 개념부터 실제 구현까지 상세히 알아봅니다. FIFO 특성, 추상 자료형(ADT), 주요 연산, 원형 큐, 우선순위 큐 등을 다루며 자바를 이용한 구현 예제를 제공합니다."
tags: ["QUEUE", "DATA_STRUCTURE", "JAVA", "ALGORITHM", "COMPUTER_SCIENCE"]
keywords: ["큐", "queue", "자료구조", "data structure", "FIFO", "선입선출", "원형큐", "circular queue", "우선순위큐", "priority queue", "자바", "java", "추상자료형", "ADT", "abstract data type"]
draft: false
hide_title: true
---

## 1. 큐(Queue) 개요

- 큐는 일상생활에서 흔히 볼 수 있는 대기열과 같은 방식으로 동작하는 자료구조입니다.
- 데이터가 들어온 순서대로 처리되며, 가장 먼저 들어온 데이터가 가장 먼저 나가는 구조를 가집니다.

### 1.1 FIFO vs LIFO

- FIFO(First In First Out)
    - 큐의 핵심 특성
    - 먼저 들어온 데이터가 먼저 나감
    - 예: 프린터 대기열, 은행 번호표 시스템
- LIFO(Last In First Out)
    - 스택의 특성
    - 마지막에 들어온 데이터가 먼저 나감
    - 예: 웹 브라우저 뒤로 가기 기능

:::info[FIFO의 실생활 예시]

일상생활에서의 FIFO:
- 은행 창구: 먼저 온 고객이 먼저 서비스 받음
- 식당 대기열: 먼저 도착한 손님이 먼저 입장
- 컨베이어 벨트: 먼저 올려진 물건이 먼저 도착

:::

## 2. 큐 ADT(Abstract Data Type)

- 큐는 다음과 같은 추상 자료형으로 정의됩니다.

:::info[Abstract Data Type(ADT)]
추상 자료형(Abstract Data Type, ADT)은 자료구조의 동작 방식을 추상적으로 정의한 것입니다. 실제 구현 방법은 숨기고, 사용자 관점에서 필요한 연산들만 정의합니다. 마치 자판기에서 버튼만 누르면 음료수가 나오는 것처럼, 내부 동작 방식을 알지 않아도 사용할 수 있게 합니다.
:::

### 2.1 기본 연산자

- ADT로 정의된 큐는 다음과 같은 연산을 지원합니다
    - enqueue(item): 큐의 뒤쪽(rear)에 항목 추가
    - dequeue(): 큐의 앞쪽(front)에서 항목 제거 및 반환
    - peek() 또는 front(): 큐의 맨 앞 항목 조회
    - isEmpty(): 큐가 비어있는지 확인
    - size(): 현재 큐에 있는 항목의 개수 반환

### 2.2 큐의 특성

- 데이터 삽입은 뒤(rear)에서만, 삭제는 앞(front)에서만 발생
- 중간에 있는 데이터에 직접 접근 불가
- 순차적인 데이터 처리에 적합

## 3. 큐의 주요 연산

### 3.1 Enqueue 연산

```java
public void enqueue(E item) {
    if (size == capacity) {
        throw new IllegalStateException("Queue is full");
    }
    elements[rear] = item;
    rear = (rear + 1) % capacity;
    size++;
}
```
새로운 요소를 큐의 뒤쪽에 추가합니다.

### 3.2 Dequeue 연산

```java
public E dequeue() {
    if (isEmpty()) {
        throw new NoSuchElementException("Queue is empty");
    }
    E item = elements[front];
    elements[front] = null;
    front = (front + 1) % capacity;
    size--;
    return item;
}
```
큐의 앞쪽에서 요소를 제거하고 반환합니다.

## 4. 큐의 종류

### 4.1 선형 큐(Linear Queue)

- 가장 기본적인 형태의 큐
- 배열로 구현 시 dequeue 연산 후 앞쪽 공간 재사용 불가
- 메모리 낭비 발생 가능

### 4.2 원형 큐(Circular Queue)

- 배열의 처음과 끝이 연결된 형태
- 메모리를 효율적으로 사용
- modulo 연산을 통해 인덱스 순환

:::warning[원형 큐의 주의사항]
원형 큐에서는 공백 상태와 포화 상태를 구분하기 위해 한 칸을 비워둡니다.
실제 저장 가능한 요소 수는 배열 크기 - 1입니다.
:::

### 4.3 우선순위 큐(Priority Queue)

- FIFO가 아닌 우선순위에 따라 데이터 처리
- 힙(Heap) 자료구조로 구현
- 응용 분야: 프로세스 스케줄링, 네트워크 패킷 우선순위 처리

## 5. 큐 구현 (Java)

### 5.1 원형 큐 구현

```java
public class CircularQueue<E> {
    private static final int DEFAULT_CAPACITY = 10;
    private E[] elements;
    private int front;
    private int rear;
    private int size;
    private final int capacity;
    
    @SuppressWarnings("unchecked")
    public CircularQueue() {
        elements = (E[]) new Object[DEFAULT_CAPACITY];
        capacity = DEFAULT_CAPACITY;
        front = 0;
        rear = 0;
        size = 0;
    }
    
    public void enqueue(E item) {
        if (isFull()) {
            throw new IllegalStateException("Queue is full");
        }
        elements[rear] = item;
        rear = (rear + 1) % capacity;
        size++;
    }
    
    public E dequeue() {
        if (isEmpty()) {
            throw new NoSuchElementException("Queue is empty");
        }
        E item = elements[front];
        elements[front] = null;
        front = (front + 1) % capacity;
        size--;
        return item;
    }
    
    public E peek() {
        if (isEmpty()) {
            throw new NoSuchElementException("Queue is empty");
        }
        return elements[front];
    }
    
    public boolean isEmpty() {
        return size == 0;
    }
    
    public boolean isFull() {
        return size == capacity;
    }
    
    public int size() {
        return size;
    }
}
```

### 5.2 사용 예시

```java
CircularQueue<Integer> queue = new CircularQueue<>();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);

System.out.println(queue.dequeue());  // 출력: 1
System.out.println(queue.peek());     // 출력: 2
System.out.println(queue.size());     // 출력: 2
```

## 6. 큐의 활용

- 큐는 다음과 같은 다양한 상황에서 활용됩니다
    - 프로세스 관리(운영체제)
    - 프린터 출력 관리
    - 네트워크 패킷 처리
    - BFS(너비 우선 탐색) 구현
    - 작업 스케줄링

### 6.1 BFS에서의 활용

```java
public void bfs(Graph graph, Node start) {
    Queue<Node> queue = new LinkedList<>();
    Set<Node> visited = new HashSet<>();
    
    queue.offer(start);
    visited.add(start);
    
    while (!queue.isEmpty()) {
        Node current = queue.poll();
        System.out.println(current.value);
        
        for (Node neighbor : graph.getNeighbors(current)) {
            if (!visited.contains(neighbor)) {
                queue.offer(neighbor);
                visited.add(neighbor);
            }
        }
    }
}
```

## 7. 마치며

- 큐는 순차적인 데이터 처리가 필요한 다양한 상황에서 활용되는 중요한 자료구조입니다.
- FIFO 특성을 이해하고 적절한 종류의 큐를 선택하여 사용하면, 효율적인 프로그램 설계가 가능합니다.
- 특히 BFS나 작업 스케줄링과 같은 알고리즘에서 큐의 활용은 필수적입니다.