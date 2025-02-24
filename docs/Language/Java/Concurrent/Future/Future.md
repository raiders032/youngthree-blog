---
title: "Future"
description: "Java의 Future 인터페이스의 개념부터 실제 활용, 장단점까지 상세히 알아봅니다. Future를 사용한 비동기 프로그래밍의 모든 것을 실제 예제와 함께 설명합니다."
tags: ["JAVA", "ASYNC", "CONCURRENT", "BACKEND"]
keywords: ["자바", "퓨처", "Future", "비동기", "동시성", "concurrent", "async", "병렬처리", "parallel processing", "스레드", "thread"]
draft: false
hide_title: true
---

## 1. Future 소개

- Java 5부터 비동기 작업의 결과를 다루기 위해 Future 인터페이스를 제공합니다.
- Future는 비동기적으로 실행되는 작업의 미래 결과값을 표현합니다.
- ExecutorService의 submit() 메소드를 통해 작업을 제출하면 즉시 Future 객체를 반환받습니다.

### 1.1 Future 인터페이스의 주요 메서드

```java
public interface Future<V> {
    V get() throws InterruptedException, ExecutionException;
    V get(long timeout, TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException;
    boolean cancel(boolean mayInterruptIfRunning);
    boolean isCancelled();
    boolean isDone();
}
```

## 2. Future의 결과 얻기와 예외 처리

### 2.1 get() 메서드

- get()은 결과가 준비될 때까지 블로킹됩니다.
- 두 가지 버전이 있습니다:
  - get(): 결과가 준비될 때까지 무한정 대기
  - get(long timeout, TimeUnit unit): 지정된 시간만큼만 대기

```java
Future<String> future = executorService.submit(task);

try {
    // 최대 2초간 결과를 기다림
    String result = future.get(2, TimeUnit.SECONDS);
} catch (TimeoutException e) {
    // 2초 안에 결과를 받지 못한 경우
    future.cancel(true); // 작업 취소
} catch (ExecutionException e) {
    // 작업 실행 중 예외 발생
} catch (InterruptedException e) {
    // 현재 스레드가 인터럽트된 경우
    Thread.currentThread().interrupt();
}
```

### 2.2 작업 취소

```java
Future<String> future = executorService.submit(task);

// 작업 취소 시도
boolean cancelled = future.cancel(true);
if (cancelled) {
    // 취소 성공
} else {
    // 이미 완료되었거나 취소할 수 없는 상태
}

// 취소 여부 확인
if (future.isCancelled()) {
    // 작업이 취소된 상태
}
```

## 3. Future의 효율적인 활용

### 3.1 병렬 처리의 장점

```java
// 비효율적인 방식: 순차적 실행
for (Task task : tasks) {
    Future<Result> future = executor.submit(task);
    Result result = future.get(); // 매번 블로킹
} // 총 실행시간 = 각 작업 시간의 합

// 효율적인 방식: 병렬 실행
List<Future<Result>> futures = new ArrayList<>();
for (Task task : tasks) {
    futures.add(executor.submit(task));
}

for (Future<Result> future : futures) {
    Result result = future.get(); // 모든 작업이 병렬로 실행됨
} // 총 실행시간 ≈ 가장 오래 걸리는 작업 시간
```

:::tip
10초가 걸리는 작업 10개가 있다면:
- 순차 실행: 10초 × 10 = 100초
- 병렬 실행: ≈ 10초 (충분한 스레드가 있다고 가정)
  :::

### 3.2 주의사항

:::warning
작업 제출과 동시에 get()을 호출하면 병렬 처리의 이점을 살릴 수 없습니다:

```java
// 비효율적인 방식
for (Task task : tasks) {
    Future<Result> future = executor.submit(task);
    Result result = future.get(); // 즉시 블로킹되어 순차 실행과 동일
}
```
:::

## 4. Future의 내부 동작 흐름

Future를 통한 비동기 작업의 실행 과정을 상세히 살펴보겠습니다.

### 4.1 Future 생성 및 작업 제출

1. 클라이언트가 Callable 구현체(예: MyCallable)를 ExecutorService.submit()에 전달합니다.
2. submit() 호출 시 Future 객체가 생성됩니다.
  - Future는 인터페이스이며, 실제로는 FutureTask 구현체가 생성됩니다.
  - FutureTask는 전달받은 Callable 작업을 내부에 보관합니다.
3. 생성된 FutureTask는 ExecutorService의 작업 큐에 저장됩니다.

```java
ExecutorService executorService = Executors.newSingleThreadExecutor();
Future<String> future = executorService.submit(new MyCallable()); // FutureTask 생성
```

### 4.2 작업 실행

1. ExecutorService의 스레드가 큐에서 FutureTask를 가져옵니다.
2. 스레드는 FutureTask의 run() 메서드를 실행합니다.
3. run() 메서드 내에서 Callable의 call() 메서드가 호출됩니다.
4. 작업 결과는 FutureTask 내부에 저장됩니다.

:::info
FutureTask는 작업의 상태(미완료, 완료, 취소됨, 예외발생)를 관리하며,
이 상태에 따라 get() 메서드의 동작이 결정됩니다.
:::

### 4.3 결과 조회 과정

1. 클라이언트가 future.get()을 호출합니다.
2. FutureTask는 작업 완료 여부를 확인합니다:
  - 작업이 완료된 경우: 즉시 결과를 반환
  - 작업이 진행 중인 경우:
    - 호출 스레드는 RUNNABLE에서 WAITING 상태로 전환
    - 작업이 완료될 때까지 대기
3. 작업이 완료되면:
  - FutureTask는 대기 중인 스레드를 깨움
  - 스레드는 WAITING에서 RUNNABLE 상태로 전환
  - 결과가 반환됨

```java
try {
    String result = future.get(); // 작업이 완료될 때까지 대기
} catch (InterruptedException | ExecutionException e) {
    // 예외 처리
}
```

## 5. Future의 한계

- 여러 Future 간의 의존성 표현이 어렵습니다.
- 다음과 같은 작업이 복잡합니다:
  - 두 비동기 계산 결과 조합
  - 여러 Future 중 하나만 완료되면 되는 경우
  - Future 완료 시 콜백 실행
- 이러한 한계를 극복하기 위해 CompletableFuture가 도입되었습니다.

:::info
Future의 한계를 극복하기 위한 대안:
- CompletableFuture (Java 8+)
- 리액티브 프로그래밍 (RxJava, Project Reactor)
  :::