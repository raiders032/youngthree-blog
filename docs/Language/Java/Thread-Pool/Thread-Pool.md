---
title: "Thread Pool"
description: "자바의 스레드 풀과 Executor Framework를 상세히 알아봅니다. 스레드 풀의 개념부터 ExecutorService를 활용한 실전 예제까지, 자바 동시성 프로그래밍의 핵심 개념을 단계별로 설명합니다."
tags: [ "THREAD_POOL", "EXECUTOR_SERVICE", "JAVA", "CONCURRENT", "BACKEND" ]
keywords: [ "스레드풀", "thread pool", "쓰레드풀", "executor service", "이그제큐터서비스", "자바", "java", "동시성", "concurrent", "병렬처리", "parallel processing", "백엔드", "backend" ]
draft: false
hide_title: true
---

## 1. 스레드 풀의 이해

### 1.1 스레드 풀이란?

- 스레드 풀은 다음과 같은 특징을 가진 스레드 관리 메커니즘입니다
- 미리 정해진 개수의 작업 처리 스레드를 생성하고 유지하는 기법입니다.
- 작업 큐(Queue)를 통해 작업을 스레드에 분배합니다.
- 작업 처리가 끝난 스레드는 다시 작업 큐에서 새로운 작업을 가져와 처리합니다.

### 1.2 스레드 풀의 장점

- 스레드 생성/폐기 비용 감소
	- 각 스레드는 자신만의 스택을 가지고 있어 생성/폐기에 비용이 많이 듭니다.
	- 스레드 생성 작업은 운영체제 커널 수준에서 이루어지며 시스템 콜을 통해 처리합니다. 따라서 CPU와 메모리 리소스가 소모됩니다.
	- 참고로 스레드 하나는 보통 1MB 이상의 메모리를 사용한다.
- 시스템 자원의 효율적 관리
	- 서버의 CPU, 메모리 자원은 한정되어 있기 때문에, 스레드는 무한하게 만들 수 없습니다.
	- 이런 문제를 해결하려면 우리 시스템이 버틸 수 있는, 최대 스레드의 수 까지만 스레드를 생성할 수 있게 관리해야 합니다.
- 작업 요청에 대한 응답 시간 단축

### 1.2 Executor 인터페이스

- Executor는 자바의 동시성 프로그래밍에서 가장 기본이 되는 인터페이스입니다.
- 실무에서는 스레드를 직접 하나하나 생성해서 사용하는 일이 드물다.
- 대신에 지금부터 설명할 ExecutorService를 주로 사용하는데, 이 기술을 사용하면 매우 편리하게 멀티스레드 프로그래밍을 할 수 있습니다.
- 주요 특징
	- 작업 제출과 작업 실행을 분리
	- 단순한 하나의 메서드만 제공
	- 작업의 실행 방식을 추상화

**인터페이스**

```java
public interface Executor {
    void execute(Runnable command);
}
```

- 단순히 하나의 메서드를 제공하는 인터페이스
- 결과 값을 반환하지 않는 작업을 처리할 때 사용합니다.(fire-and-forget)
	- 반면에 ExecutorService 인터페이스에는 반환 값을 처리할 수 있는 submit 메서드가 있습니다.

### 1.3 ExecutorService 인터페이스

- ExecutorService는 Executor를 상속하며, 더 다양한 기능을 제공합니다
	- 작업 생명주기 관리
	- 비동기 작업 결과 조회
	- 스레드 풀 종료 기능
- 주요 기능:
	- 작업 제출(submit)
	- 작업 스케줄링
	- 작업 결과 조회
	- 스레드 풀 상태 관리

```java
public interface ExecutorService extends Executor {
    void shutdown();
    List<Runnable> shutdownNow();
    boolean isShutdown();
    // ... 기타 메서드들
}
```

### 1.4 Executors 유틸리티 클래스

- Executors는 다양한 ExecutorService 구현체를 생성하는 팩토리 메서드를 제공합니다.

```java
// 고정 크기 스레드 풀
ExecutorService fixedPool = Executors.newFixedThreadPool(5);

// 캐시 스레드 풀
ExecutorService cachedPool = Executors.newCachedThreadPool();

// 단일 스레드 풀
ExecutorService singlePool = Executors.newSingleThreadExecutor();
```

:::warning
스레드 풀 크기 선정 시 주의사항:

- CPU 코어 수
- 메모리 사용량
- 작업의 특성(CPU 바운드/IO 바운드)
  를 고려해야 합니다.
  :::

## 2. Thread Pool 생성과 관리

- Executors로 ExecutorService의 구현 객체를 만들 수 있습니다.
- Executors의 다양한 정적 메소드로 ExecutorService의 구현 객체를 만들 수 있는데 이것이 바로 스레드 풀입니다.
- ExecutorService의 기본 구현체로 ThreadPoolExecutor가 있습니다.
	- `ThreadPoolExecutor` 를 사용하면 스레드 풀에 사용되는 숫자와 블로킹 큐등 다양한 속성을 조절할 수 있습니다.
	- `corePoolSize` : 스레드 풀에서 관리되는 기본 스레드의 수
	- `maximumPoolSize` : 스레드 풀에서 관리되는 최대 스레드 수
	- `keepAliveTime` , `TimeUnit unit` : 기본 스레드 수를 초과해서 만들어진 스레드가 생존할 수 있는 대기 시간, 이 시간 동안 처리할 작업이 없다면 초과 스레드는 제거된다.
	- `BlockingQueue workQueue` : 작업을 보관할 블로킹 큐
- Executors의 정적 메서드는 기본 구현체인 ThreadPoolExecutor의 설정을 대신하여 ThreadPoolExecutor를 생성합니다.

**Executors의 정적 메소드**

| 메소드                 | 초기 스레드 수 | 코어 스레드 수 | 최대 스레드 수          |
|---------------------|----------|----------|-------------------|
| newCachedThreadPool | 0        | 0        | Integer.MAX_VALUE |
| newFixedThreadPool  | 0        | nThreads | nThreads          |

### 2.1 newCachedThreadPool

```java
// Executors의 정적 메서드를 사용
ExecutorService executorService = Executors.newCachedThreadPool();

// ThreadPoolExecutor를 직접 직접 사용 
new ThreadPoolExecutor(0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS,new SynchronousQueue<Runnable>());
```

- 기본 스레드를 사용하지 않고, 60초 생존 주기를 가진 초과 스레드만 사용합니다.
- 큐에 작업을 저장하지 않습니다.
	- 대신에 생산자의 요청을 스레드 풀의 소비자 스레드가 직접 받아서 바로 처리합니다.
	- 모든 요청이 대기하지 않고 스레드가 바로바로 처리한다. 따라서 빠른 처리가 가능합니다.
	- 쉽게 이야기해서 중간에 버퍼를 두지 않는 스레드간 직거래라고 생각하면 됩니다.
- 캐시 스레드 풀 전략은 매우 빠르고, 유연한 전략이다.
- 이 전략은 기본 스레드도 없고, 대기 큐에 작업도 쌓이지 않습니다.
- 대신에 작업 요청이 오면 초과 스레드로 작업을 바로바 로 처리한다. 따라서 빠른 처리가 가능합니다. 
- 초과 스레드의 수도 제한이 없기 때문에 CPU, 메모리 자원만 허용한다면 시스템의 자원을 최대로 사용할 수 있습니다.
- 추가로 초과 스레드는 60초간 생존하기 때문에 작업 수에 맞추어 적절한 수의 스레드가 재사용된다.
- 이런 특징 때문에 요청이 갑자기 증가하면 스레드도 갑자기 증가하고, 요청이 줄어들면 스레드도 점점 줄어듭니다.
- 이 전략은 작업의 요청 수에 따라서 스레드도 증가하고 감소하므로, 매우 유연한 전략입니다.
- 캐시 스레드 풀 전략은 서버의 자원을 최대한 사용하지만, 서버가 감당할 수 있는 임계점을 넘는 순간 시스템이 다운될 수 있다.

### 2.2 newFixedThreadPool

```java
// CPU 코어의 수만큼 최대 스레드를 사용하는 스레드 풀을 생성하는 예제
Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());

// ThreadPoolExecutor를 직접 사용
new ThreadPoolExecutor(1, 1,0L, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<Runnable>())
```

- 스레드 풀에 `nThreads` 만큼의 기본 스레드를 생성합니다. 초과 스레드는 생성하지 않습니다.
- 스레드 수가 고정되어 있기 때문에 CPU, 메모리 리소스가 어느정도 예측 가능한 안정적인 방식입니다.

### 2.3 newSingleThreadExecutor

## 3 Thread Pool 종료

- 스레드 풀의 스레드는 기본적으로 데몬 스레드가 아니기 때문에 main 스레드가 종료되더라도 작업을 처리하기 위해 계속 실행 상태로 남아있다.
	- 그래서 main() 메소드가 실행이 끝나도 애플리케이션 프로세스는 종료되지 않는다
- 애플리케이션을 종료하려면 스레드풀을 종료시켜 스레드들이 종료 상태가 되도록 처리해야한다.

### 3.1 ExecutorService의 종료

- ExecutorService` 에는 종료와 관련된 다양한 메서드가 존재합니다.
- void shutdown()
	- 새로운 작업을 받지 않고, 이미 제출된 작업을 모두 완료한 후에 종료합니다.
	- 이 상태에서 작업을 넣으면 java.util.concurrent.RejectedExecutionException가 발생합니다.
	- 논 블로킹 메서드입니다.
	- 이 메서드를 호출한 스레드는 대기하지 않고 즉시 다음 코드를 호출합니다.
	- 이미 들어온 모든 작업을 다 처리하고 서비스를 우아하게 종료(graceful shutdown)하는 것을 권장합니다.
- `List<Runnable> shutdownNow()`
	- 새로운 작업을 받지 않습니다.
	- 실행 중인 작업을 중단하고, 대기 중인 작업을 반환하며 즉시 종료합니다.
	- 실행 중인 작업을 중단하기 위해 인터럽트를 발생시킨다.
	- 논 블로킹 메서드입니다.
- close()
	- close() 는 자바 19부터 지원하는 서비즈 종료 메서드이다. 이 메서드는 shutdown() 과 같다고 생각하면 됩니다.
	- 더 정확히는 `shutdown()` 을 호출하고, 하루를 기다려도 작업이 완료되지 않으면 `shutdownNow()` 를 호출합니다.

## 4 작업 처리

### 4.1 작업 생성

- 하나의 작업은 Runnable 또는 Callable 구현 클래스로 표현합니다.
	- 차이는 반환값이 없으면 Runnable 있으면 Callable입니다.
- 스레드풀의 스레드는 작업 큐에서 Runnable 또는 Callable 객체를 가져와 run() 또는 call() 메소드를 실행합니다.

```java
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
```

```java
@FunctionalInterface
public interface Callable<V> {
    V call() throws Exception;
}
```

### 4.2 작업 처리 요청

- 작업 처리 요청이란 ExecutorService의 작업 큐에 Runnable 또는 Callable 객체를 넣은 행위를 말한다.

#### ExecutorService 인터페이스

| 리턴 타입       | 메소드                               | 설명                                                      |
|-------------|-----------------------------------|---------------------------------------------------------|
| `void`      | `execute(Runnable command)`       | Runnable을 작업 큐에 저장. 작업 결과를 받지 못함                        |
| `Future<T>` | `submit(Callable<T> task)`        | Runnable 또는 Callable을 작업 큐에 저장 리턴된 Future를 통해 작업 결과를 얻음 |
| `Future<?>` | `submit(Runnable task)`           | Runnable 또는 Callable을 작업 큐에 저장 리턴된 Future를 통해 작업 결과를 얻음 |
| `Future<T>` | `submit(Runnable task, T result)` | Runnable 또는 Callable을 작업 큐에 저장 리턴된 Future를 통해 작업 결과를 얻음 |

- execute()는 작업 처리중 예외 발생하면 스레드 종료되고 스레드 풀에서 제거됩니다.
- submit()은 작업 처리중 예외가 발생하더라도 스레드 종료되지 않고 다음 작업을 위해 재사용된다.
	- 가급적 스레드 생성 오버헤드를 줄이기 위해 submit()을 사용하는 것이 좋습니다.

## 5 블로킹 방식의 작업 완료 통보(Future)

- ExecutorService의 submit() 메소드는 Runnable 또는 Callable를 작업 큐에 넣고 즉시 Future 객체를 리턴합니다.
- Future 객체는 작업 결과가 아니라 작업이 완료될 때까지 기다렸다가 최종 결과를 얻는데 사용됩니다.
- 작업을 처리하는 스레드가 작업을 완료하기 전까지 get() 메소드가 블로킹되어 다른 코드를 실행할 수 없습니다.
	- 따라서 get() 메소드를 호출하는 스레드는 새로운 스레드가 되어야합니다.

```java
ExecutorService executorService = Executors.newCachedThreadPool();
Future<String> future = executorService.submit(() -> "result");
// 다른 스레드에서 Future의 get 메소드 호출
executorService.submit(() -> future.get());
```

#### Future 인터페이스

| 리턴 타입   | 메소드                                 | 설명                                                                      |
|---------|-------------------------------------|-------------------------------------------------------------------------|
| V       | get()                               | 작업이 완료될 때까지 블로킹되어있다가 처리 결과 V를 리턴                                        |
| V       | get(long timeout, TimeUnit unit)    | timeout 시간 전에 작업이 완료되면 결과 V를 리턴하지만, 작업이 완료되지 않으면 TImeoutException을 발생시킴 |
| boolean | cancel(boolean mayInterruptRunning) | 작업 처리가 진행 중일 경우 취소시킴                                                    |
| boolean | isCancelled()                       | 작업이 취소되었는지 여부                                                           |
| boolean | isDone()                            | 작업이 처리가 완료되었는지 여부                                                       |

### 5.1 반환값이 없는 작업 완료 통보

- submit() 메소드의 아규먼트로 Runnable 객체를 전달할 수 있다.
- Runnable은 결과 값이 없지만 submit()는 Future를 반환한다.
- 반환된 Future는 스레드가 작업 처리를 정상적으로 완료했는지 아니면 예외가 발생했는지 확인할 때 사용된다.
	- 정상 완료: `future.get() == null`
	- 예외 발생: 스레드가 작업 처리 도중 interrupt되면 InterruptedException을 발생시키고 예외가 발생하면 ExcutionException을 발생시킨다.

```java
try {
  future.get();
} catch (InterruptedException e) {
  // 작업 도중 스레드가 interrupt 될 경우 처리 코드
} catch (ExecutionException e) {
  // 작업 도중 예외가 발생된 경우 처리 코드
}
```

*- 예시*-

```java
public class NoResultExample {
  public static void main(String[] args) {
    ExecutorService executorService = Executors.newFixedThreadPool(
      Runtime.getRuntime().availableProcessors()
    );

    System.out.println("[작업 처리 요청]");
    Runnable runnable = () -> {
      int sum = 0;
      for (int i = 1; i <= 10; i++) {
        sum+=i;
      }
      System.out.println("[처리 결과] " + sum);
    };

    Future future = executorService.submit(runnable);

    try {
      future.get();
      System.out.println("[작업 처리 완료]");
    } catch (Exception e) {
      System.out.println("[실행 예외 발생] " + e.getMessage());
      e.printStackTrace();
    }

    executorService.shutdown(); // 스레드 풀 종료
  }
}
```

### 5.2 반환값이 있는 작업 완료 통보

- 스레드가 작업 완료한 후에 처리 결과를 얻어야 된다면 작업 객체를 Callable로 생성하면 된다.

```java
public class YesResultExample {
  public static void main(String[] args) {
    ExecutorService executorService = Executors.newFixedThreadPool(
      Runtime.getRuntime().availableProcessors()
    );

    System.out.println("[작업 처리 요청]");
    Callable<Integer> callable = () -> {
      int sum = 0;

      for (int i = 1; i <= 10; i++) {
        sum += i;
      }
      System.out.println("[처리 결과] " + sum);

      return sum;
    };

    Future<Integer> future = executorService.submit(callable);

    try {
      Integer resultInteger = future.get();
      System.out.println("[future.get()] " + resultInteger);
      System.out.println("[작업 처리 완료]");
    } catch (Exception e) {
      System.out.println("[실행 예외 발생] " + e.getMessage());
      e.printStackTrace();
    }

    executorService.shutdown();
  }
}
```

### 5.3 콜백 방식 작업 완료 통보

- 콜백이란 애플리케이션이 스레드에게 작업 처리를 요청한 후 스레드가 작업을 완료하면 특정 메소드를 자동 실행하는 기법을 말한다.
	- 이때 자동 실행되는 메소드를 콜백 메소드라고 한다.

- 콜백 메소드를 가진 클래스가 필요하다.
	- 직접 정의하거나 `java.nio.channels.CompletionHandler`를 이용한다.
- `java.nio.channels.CompletionHandler`
	- 비동기 통신에서 콜백 객체를 만들 때 사용된다.
	- 정상종료를 위한 `.completed()` 메소드가 존재한다.
	- 예외처리를 위한 `.failed()` 메소드가 존재한다.

```java
public interface CompletionHandler<V,A> {
    void completed(V result, A attachment);
    void failed(Throwable exc, A attachment);
}
```

- 위에서 A attachment는 콜백 메소드 결과값 외에 추가적으로 전달할 객체가 있으면 설정해주면 된다.
	- 없으면 null

*- 예시*-

```java
public class CallbackExample {
    private ExecutorService executorService;

    public CallbackExample() {
        executorService = Executors.newFixedThreadPool(
                Runtime.getRuntime().availableProcessors()
        );
    }

    private CompletionHandler<Integer, Void> callback = new CompletionHandler<Integer, Void>() {
        @Override
        public void completed(Integer result, Void attachment) {
            System.out.println("completed() 실행: " + result);
        }

        @Override
        public void failed(Throwable exc, Void attachment) {
            System.out.println("failed() 실행: " + exc.toString());
        }
    };

    public void doWork(final String x, final String y) {
        Runnable task = new Runnable() {
            @Override
            public void run() {
                try {
                    int intX = Integer.parseInt(x);
                    int intY = Integer.parseInt(y);
                    int result = intX + intY;
                    callback.completed(result, null);
                } catch (NumberFormatException e) {
                    callback.failed(e, null);
                }
            }
        };

        executorService.submit(task);
    }

    public void finish() {
        executorService.shutdown();
    }

    public static void main(String[] args) {
        CallbackExample callbackExample = new CallbackExample();
        callbackExample.doWork("3", "3");
        callbackExample.doWork("3", "삼");
        callbackExample.finish();
    }
}
```