---
title: "Stack"
description: "자료구조 스택(Stack)의 기본 개념부터 실제 구현까지 상세히 알아봅니다. LIFO 특성, 추상 자료형(ADT), 주요 연산, 콜 스택의 동작 원리, 스택 오버플로우 등을 다루며 자바를 이용한 구현 예제를 제공합니다."
tags: ["STACK", "DATA_STRUCTURE", "JAVA", "ALGORITHM", "COMPUTER_SCIENCE"]
keywords: ["스택", "stack", "자료구조", "data structure", "LIFO", "후입선출", "콜스택", "call stack", "스택오버플로우", "stack overflow", "자바", "java", "추상자료형", "ADT", "abstract data type"]
draft: false
hide_title: true
---

## 1. 스택(Stack) 개요

- 스택은 가장 기본적이면서도 실제 컴퓨터 시스템에서 널리 사용되는 자료구조입니다. 
- 책을 쌓아올리는 것처럼, 데이터를 순차적으로 쌓고 가장 최근에 쌓은 데이터부터 꺼낼 수 있는 구조를 가집니다.

### 1.1 LIFO vs FIFO

- LIFO(Last In First Out)
    - 스택의 핵심 특성
    - 마지막에 들어온 데이터가 가장 먼저 나감
    - 예: 브라우저 뒤로 가기 기능
- FIFO(First In First Out)
    - 큐(Queue)의 특성
    - 먼저 들어온 데이터가 먼저 나감
    - 예: 프린터 출력 대기열

:::info[LIFO와 FIFO 비교]

실생활 예시로 이해하기:
- LIFO(스택): 접시 쌓기 - 가장 위에 있는 접시부터 사용
- FIFO(큐): 은행 대기열 - 먼저 온 사람이 먼저 서비스 받음

:::

## 2. 스택 ADT(Abstract Data Type)

- 스택은 다음과 같은 추상 자료형으로 정의됩니다.

:::info[Abstract Data Type(ADT)]
추상 자료형(Abstract Data Type, ADT)은 데이터와 그 데이터에 대한 연산을 명기한 것으로, 구현 방법을 명시하지 않고 데이터와 연산을 추상적으로 정의한 것입니다.
추상화란 복잡한 내부 동작은 숨기고, 필수적인 부분만 들어내는 것을 의미합니다. 자동차를 운전할 때 엔진의 작동 원리를 몰라도 운전대와 페달만으로 조작할 수 있는 것과 같은 원리입니다.
:::


### 2.1 기본 연산자

- ADT로 정의된 스택은 다음과 같은 연산을 지원합니다.
- push(item): 스택의 맨 위에 항목 추가
- pop(): 스택의 맨 위 항목 제거 및 반환
- peek() 또는 top(): 스택의 맨 위 항목 조회
- isEmpty(): 스택이 비어있는지 확인
- size(): 현재 스택에 있는 항목의 개수 반환

### 2.2 스택의 특성

- 한쪽 끝(top)에서만 모든 연산이 이루어짐
- 중간에 있는 데이터에 직접 접근 불가
- 데이터의 접근이 제한적이지만 구현이 단순하고 효율적

## 3. 스택의 주요 연산

### 3.1 Push 연산

```java
public void push(E item) {
    if (size >= capacity) {
        throw new StackOverflowError();
    }
    elements[size++] = item;
}
```
새로운 요소를 스택의 top에 추가합니다.

### 3.2 Pop 연산

```java
public E pop() {
    if (isEmpty()) {
        throw new EmptyStackException();
    }
    E item = elements[--size];
    elements[size] = null; // 메모리 누수 방지
    return item;
}
```
스택의 top에서 요소를 제거하고 반환합니다.

## 4. 콜 스택(Call Stack)

- 콜 스택은 프로그램의 서브루틴 호출을 추적하는 스택 자료구조입니다.
  - 서브루틴: 함수 또는 메서드
- 함수 호출 시 스택에 프레임을 추가하고, 함수 종료 시 스택에서 프레임을 제거합니다.
  - 프레임: 함수 호출 시 생성되는 지역 변수, 매개변수, 복귀 주소 등의 정보를 담고 있는 블록

### 4.1 동작 원리

```java
public static void main(String[] args) {
    functionA();
}

static void functionA() {
    functionB();
}

static void functionB() {
    System.out.println("Hello");
}
```

실행 순서:
1. main() 함수가 스택에 push
2. functionA() 호출 시 스택에 push
3. functionB() 호출 시 스택에 push
4. functionB() 완료 시 pop
5. functionA() 완료 시 pop
6. main() 완료 시 pop

## 5. 스택 오버플로우(Stack Overflow)

### 5.1 발생 원인

- 스택의 크기를 초과하는 데이터 저장 시도
- 무한 재귀 호출
- 과도한 메모리 사용

### 5.2 예방 방법

- 적절한 종료 조건을 가진 재귀 함수 설계
- 스택 크기의 적절한 설정
- 반복문을 활용한 대체 구현 검토

:::warning[스택 오버플로우 예시]

```java
public static void infiniteRecursion() {
    infiniteRecursion(); // 종료 조건이 없는 재귀 호출
}
```

이러한 코드는 스택 오버플로우를 발생시킵니다.
:::

## 6. 스택 구현 (Java)

### 6.1 배열을 이용한 구현

```java
public class ArrayStack<E> {
    private static final int DEFAULT_CAPACITY = 10;
    private E[] elements;
    private int size;
    
    @SuppressWarnings("unchecked")
    public ArrayStack() {
        elements = (E[]) new Object[DEFAULT_CAPACITY];
    }
    
    public void push(E item) {
        ensureCapacity();
        elements[size++] = item;
    }
    
    public E pop() {
        if (isEmpty()) {
            throw new EmptyStackException();
        }
        E item = elements[--size];
        elements[size] = null;
        return item;
    }
    
    public E peek() {
        if (isEmpty()) {
            throw new EmptyStackException();
        }
        return elements[size - 1];
    }
    
    public boolean isEmpty() {
        return size == 0;
    }
    
    public int size() {
        return size;
    }
    
    private void ensureCapacity() {
        if (size == elements.length) {
            elements = Arrays.copyOf(elements, 2 * size + 1);
        }
    }
}
```

### 6.2 사용 예시

```java
ArrayStack<Integer> stack = new ArrayStack<>();
stack.push(1);
stack.push(2);
stack.push(3);

System.out.println(stack.pop());  // 출력: 3
System.out.println(stack.peek()); // 출력: 2
System.out.println(stack.size()); // 출력: 2
```

## 7. 스택의 활용

- 스택은 다음과 같은 다양한 상황에서 활용됩니다
  - 함수 호출 관리 (콜 스택)
  - 웹 브라우저의 방문 기록
  - 실행 취소 (Undo) 기능
  - 수식의 괄호 검사
  - DFS(깊이 우선 탐색) 구현

## 8. 마치며

- 스택은 단순하지만 강력한 자료구조로, 컴퓨터 시스템의 핵심적인 부분에서 활용됩니다. 
- LIFO 특성을 잘 이해하고 적절한 상황에서 활용한다면, 효율적인 프로그램 설계가 가능합니다.