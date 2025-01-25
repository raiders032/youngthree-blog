---
title: "Virtual Thread 동작 원리: Continuation과 스케줄링 메커니즘 심층 분석"
description: "Java Virtual Thread의 내부 동작 원리를 상세히 설명합니다. Continuation 패턴, 스케줄링 메커니즘, 그리고 Carrier Thread와의 상호작용을 코드 예제와 함께 다룹니다."
tags: [ "CONTINUATION", "VIRTUAL_THREAD", "CONCURRENCY", "JVM", "JAVA", "COROUTINE", "BACKEND" ]
keywords: [ "컨티뉴에이션", "continuation", "가상 스레드", "virtual thread", "동시성", "concurrency", "코루틴", "coroutine", "캐리어 스레드", "carrier thread" ]
draft: false
hide_title: true
---

## 1. Continuation 기반 Virtual Thread

- Virtual Thread는 코루틴과 유사한 Continuation 패턴을 사용합니다.
- Continuation은 프로그램의 실행 상태를 캡처하고 나중에 재개할 수 있게 하는 메커니즘입니다.

### 1.1 Continuation의 구조

:::info
Continuation은 다음 요소들을 포함합니다:

- 실행 컨텍스트(스택 프레임)
- 로컬 변수 상태
- 프로그램 카운터
  :::

```java
class VirtualThreadContinuation {
    private StackFrameInfo[] frames;
    private Map<String, Object> localVariables;
    private int programCounter;
    
    void capture() {
        // 현재 실행 상태 캡처
    }
    
    void resume() {
        // 저장된 상태에서 실행 재개
    }
}
```

## 2. 스케줄링 메커니즘

### 2.1 Fork/Join 풀 기반 스케줄링

Virtual Thread는 ForkJoinPool을 사용하여 스케줄링됩니다:

```java
public class VirtualThreadScheduler {
    private static final ForkJoinPool SCHEDULER = 
        new ForkJoinPool(
            Runtime.getRuntime().availableProcessors(),
            ForkJoinPool.defaultForkJoinWorkerThreadFactory,
            null,
            true
        );
}
```

### 2.2 마운팅과 언마운팅

:::note
Virtual Thread는 Carrier Thread에 동적으로 마운트되고 언마운트됩니다:

1. 블로킹 작업 발생 시 언마운트
2. 작업 재개 가능 시 다른 Carrier Thread에 마운트
3. 컨텍스트 스위칭 최소화
   :::

## 3. Carrier Thread와의 상호작용

### 3.1 핀닝(Pinning) 메커니즘

```java
synchronized void criticalSection() {
    // Virtual Thread가 Carrier Thread에 고정됨
    // 다른 Virtual Thread로 전환 불가
}
```

### 3.2 블로킹 처리

```java
public class VirtualThreadExample {
    public void performIO() {
        // I/O 작업 시작 시
        // 1. 현재 상태를 Continuation으로 저장
        // 2. Carrier Thread에서 언마운트
        FileInputStream.read();  // 블로킹 I/O
        // 3. I/O 완료 시 새로운 Carrier Thread에 마운트
        // 4. Continuation에서 상태 복원
    }
}
```

## 4. 코루틴과의 비교

### 4.1 구조적 차이점

:::tip
Virtual Thread와 코루틴의 주요 차이점:

- 스코프: Virtual Thread는 전역적, 코루틴은 구조적
- 상태 관리: Virtual Thread는 자동, 코루틴은 명시적
- 취소 처리: Virtual Thread는 인터럽트, 코루틴은 취소 신호
  :::

### 4.2 성능 특성

```java
// Virtual Thread는 블로킹 I/O에 최적화
Future<?> future = virtualThreadExecutor.submit(() -> {
    // 자동 상태 저장 및 복원
    performBlockingIO();
});

// 코루틴은 중단 지점 명시적 지정
suspend fun coroutineExample() {
    // 명시적 중단 지점
    delay(1000)
}
```

## 5. 최적화 기법

### 5.1 스택 프레임 최적화

Virtual Thread는 스택 프레임을 힙으로 이동시켜 메모리를 최적화합니다:

```java
class StackFrameOptimization {
    private static class HeapFrame {
        Object[] locals;
        int programCounter;
        HeapFrame previous;
    }
    
    void optimizeStack() {
        // 스택 -> 힙 전환 시
        HeapFrame frame = captureStackFrame();
        storeInHeap(frame);
        // 힙 -> 스택 전환 시
        restoreFromHeap(frame);
    }
}
```

### 5.2 컨텍스트 스위칭 최적화

```java
public class ContextSwitchOptimization {
    void handleBlocking() {
        if (isBlockingOperation()) {
            // 1. 현재 Virtual Thread의 상태 저장
            Continuation cont = captureContinuation();
            
            // 2. Carrier Thread 해제
            unmountFromCarrier();
            
            // 3. 블로킹 작업 완료 후
            // 다른 Carrier Thread에서 재개
            cont.resume();
        }
    }
}
```

## 6. 고급 디버깅 기법

:::warning
디버깅 시 주의사항:

- 스택 트레이스가 힙으로 이동된 상태 확인
- Carrier Thread 전환 추적
- Continuation 상태 검사
  :::

```java
void debugVirtualThread() {
    Thread vThread = Thread.currentThread();
    if (vThread.isVirtual()) {
        System.out.println("Mounted: " + isThreadMounted());
        System.out.println("Carrier: " + getCarrierThread());
        System.out.println("Continuation State: " + 
            getContinuationState());
    }
}
```