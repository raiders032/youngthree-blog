---
title: "TaskExecutor"
description: "Spring Framework의 TaskExecutor 추상화와 관련 기능을 상세히 알아봅니다. 스레드 풀 추상화부터 다양한 TaskExecutor 구현체와 사용법, @Async 애노테이션 기반 비동기 처리까지 자세히 설명합니다. 스프링 애플리케이션에서 효율적인 비동기 프로그래밍을 위한 핵심 가이드입니다."
tags: ["SPRING", "TASK_EXECUTOR", "ASYNC", "THREAD_POOL", "CONCURRENCY", "JAVA", "BACKEND"]
keywords: ["스프링", "Spring", "태스크 익스큐터", "TaskExecutor", "비동기", "Asynchronous", "스레드풀", "ThreadPool", "멀티스레드", "MultiThread", "동시성", "Concurrency", "Async", "비동기 처리", "스프링 비동기", "자바 스레드 풀", "스레드 관리", "ThreadPoolTaskExecutor", "Future"]
draft: false
hide_title: true
---

## 1. Spring TaskExecutor 소개

- Spring의 TaskExecutor는 Java의 스레드 풀(thread pool)을 추상화한 인터페이스입니다.
- "executor"라는 이름은 실제 구현이 반드시 스레드 풀일 필요는 없다는 사실에서 유래했습니다.
- executor는 단일 스레드로 동작하거나 심지어 동기적으로 실행될 수도 있습니다.
- Spring의 추상화는 Java SE와 Jakarta EE 환경 간의 구현 세부 사항을 숨겨줍니다.

### 1.1 TaskExecutor 인터페이스

- Spring의 TaskExecutor 인터페이스는 java.util.concurrent.Executor 인터페이스와 동일합니다.
- 원래 이 인터페이스가 만들어진 주요 이유는 Java 5 이전 버전에서도 스레드 풀을 사용할 수 있도록 추상화하기 위함이었습니다.
- 이 인터페이스는 단일 메서드(execute(Runnable task))만 가지며, 스레드 풀의 시맨틱과 구성에 따라 실행할 태스크를 받습니다.

### 1.2 TaskExecutor의 용도

- TaskExecutor는 원래 다른 Spring 컴포넌트에게 스레드 풀 추상화를 제공하기 위해 만들어졌습니다.
- ApplicationEventMulticaster, JMS의 AbstractMessageListenerContainer, Quartz 통합 등의 컴포넌트가 스레드 풀링을 위해 이 추상화를 사용합니다.
- 개발자의 빈에서도 스레드 풀링 동작이 필요한 경우 이 추상화를 활용할 수 있습니다.

## 2. TaskExecutor 구현체 종류

- Spring은 여러 가지 TaskExecutor 구현체를 제공합니다. 
- 대부분의 경우 직접 구현체를 만들 필요가 없습니다. 
- Spring이 제공하는 주요 구현체는 다음과 같습니다:

### 2.1 SyncTaskExecutor

- 이 구현체는 비동기적으로 실행되지 않습니다.
- 각 호출은 호출한 스레드에서 직접 실행됩니다.
- 주로 멀티스레딩이 필요하지 않은 간단한 테스트 케이스와 같은 상황에서 사용됩니다.

### 2.2 SimpleAsyncTaskExecutor

- 이 구현체는 스레드를 재사용하지 않습니다.
- 대신 각 호출마다 새로운 스레드를 시작합니다.
- 동시성 제한을 지원하여 제한을 초과하는 호출은 슬롯이 확보될 때까지 차단됩니다.
- JDK 21에서는 "virtualThreads" 옵션이 활성화된 경우 가상 스레드를 사용합니다.
- Spring의 라이프사이클 관리를 통한 정상 종료(graceful shutdown)를 지원합니다.

### 2.3 ConcurrentTaskExecutor

- 이 구현체는 java.util.concurrent.Executor 인스턴스에 대한 어댑터입니다.
- ThreadPoolTaskExecutor라는 대안은 Executor 구성 매개변수를 빈 프로퍼티로 노출합니다.
- ConcurrentTaskExecutor를 직접 사용할 필요는 거의 없습니다.
  - 대신 ThreadPoolTaskExecutor를 사용할 수 있습니다.
  - 그러나 ThreadPoolTaskExecutor가 요구사항에 충분히 유연하지 않은 경우 ConcurrentTaskExecutor가 대안이 될 수 있습니다.

### 2.4 ThreadPoolTaskExecutor

- 이 구현체가 가장 일반적으로 사용됩니다.
- 자바의 ThreadPoolExecutor를 스프링 스타일로 쉽게 설정할 수 있도록 해줍니다.
  - 코어 스레드 수, 최대 스레드 수, 대기열 용량 등을 간단히 설정 가능
  - Java의 표준 ThreadPoolExecutor 클래스를 내부적으로 사용하여 스레드 풀을 관리합니다.
- 일시 중지/재개 기능과 Spring의 라이프사이클 관리를 통한 정상 종료를 제공합니다.
- 일반 자바 Executor를 그대로 사용하고 싶다면 대신 ConcurrentTaskExecutor를 사용하세요.

## 3. TaskExecutor 사용 방법

- Spring의 TaskExecutor 구현체는 일반적으로 의존성 주입과 함께 사용됩니다. 
- 다음 예제에서는 ThreadPoolTaskExecutor를 사용하여 비동기적으로 일련의 메시지를 출력하는 빈을 정의합니다

### 3.1 기본 예제

```java
public class TaskExecutorExample {

    private class MessagePrinterTask implements Runnable {

        private String message;

        public MessagePrinterTask(String message) {
            this.message = message;
        }

        public void run() {
            System.out.println(message);
        }
    }

    private TaskExecutor taskExecutor;

    public TaskExecutorExample(TaskExecutor taskExecutor) {
        this.taskExecutor = taskExecutor;
    }

    public void printMessages() {
        for(int i = 0; i < 25; i++) {
            taskExecutor.execute(new MessagePrinterTask("Message" + i));
        }
    }
}
```

- 이 예제에서는 직접 스레드를 풀에서 가져와 실행하는 대신, Runnable을 큐에 추가합니다. 
- 그런 다음 TaskExecutor가 내부 규칙을 사용하여 태스크가 실행되는 시기를 결정합니다.

### 3.2 TaskExecutor 구성

- TaskExecutor가 사용하는 규칙을 구성하기 위해 간단한 빈 프로퍼티를 노출합니다:

```java
@Bean
ThreadPoolTaskExecutor taskExecutor() {
    ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
    taskExecutor.setCorePoolSize(5);
    taskExecutor.setMaxPoolSize(10);
    taskExecutor.setQueueCapacity(25);
    return taskExecutor;
}

@Bean
TaskExecutorExample taskExecutorExample(ThreadPoolTaskExecutor taskExecutor) {
    return new TaskExecutorExample(taskExecutor);
}
```

### 3.3 TaskDecorator 활용

- 대부분의 TaskExecutor 구현체는 제출된 태스크를 TaskDecorator로 자동으로 감싸는 방법을 제공합니다.
- 데코레이터는 태스크 실행 전/후에 사용자 정의 동작을 구현할 수 있습니다.
- 태스크 실행 전후에 메시지를 로깅하는 간단한 구현을 살펴보겠습니다:

```java
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.core.task.TaskDecorator;

public class LoggingTaskDecorator implements TaskDecorator {

    private static final Log logger = LogFactory.getLog(LoggingTaskDecorator.class);

    @Override
    public Runnable decorate(Runnable runnable) {
        return () -> {
            logger.debug("Before execution of " + runnable);
            runnable.run();
            logger.debug("After execution of " + runnable);
        };
    }
}
```

- 먼저 TaskDecorator 인터페이스를 구현합니다.
- 이 인터페이스는 decorate(Runnable task) 메서드를 가지고 있으며, 이 메서드는 Runnable을 받아서 새로운 Runnable을 반환합니다.
- 아규먼트로 받은 Runnable은 실제 태스크를 실행하는 Runnable입니다.
- 태스크 앞 뒤로 로깅을 추가합니다.

```java
@Bean
ThreadPoolTaskExecutor decoratedTaskExecutor() {
    ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
    taskExecutor.setTaskDecorator(new LoggingTaskDecorator());
    return taskExecutor;
}
```

- 그런 다음 TaskExecutor 인스턴스에 데코레이터를 구성할 수 있습니다:
- 여러 데코레이터가 필요한 경우 org.springframework.core.task.support.CompositeTaskDecorator를 사용하여 여러 데코레이터를 순차적으로 실행할 수 있습니다.

## 4. @Async 애노테이션 사용하기

- Spring은 @Async 애노테이션을 사용하여 비동기 메서드를 쉽게 정의할 수 있는 기능을 제공합니다.
- TaskExecutor를 직접 사용하지 않고 애노테이션을 사용하여 비동기 메서드를 정의할 수 있습니다.
- The @EnableAsync annotation switches on Spring’s ability to run @Async methods in a background thread pool.

### 4.1 기본 사용법

- 메서드에 @Async 애노테이션을 제공하여 해당 메서드의 호출이 비동기적으로 발생하도록 할 수 있습니다. 
- 즉, 호출자는 호출 즉시 반환하고, 메서드의 실제 실행은 Spring TaskExecutor에 제출된 태스크에서 발생합니다.
- 가장 간단한 경우, void를 반환하는 메서드에 애노테이션을 적용할 수 있습니다:

```java
@Async
void doSomething() {
    // 이것은 비동기적으로 실행됩니다
}
```

- @Scheduled 애노테이션이 있는 메서드와 달리, 이러한 메서드는 인수를 받을 수 있습니다. 
- 런타임에 일반적인 방식으로 호출자가 호출하기 때문입니다. 

### 4.2 @EnableAsync 설정

- @Async 애노테이션을 사용하려면 @EnableAsync 애노테이션을 사용하여 비동기 지원을 활성화해야 합니다.

```java
@SpringBootApplication
@EnableAsync
public class AsyncMethodApplication {

  public static void main(String[] args) {
    // close the application context to shut down the custom ExecutorService
    SpringApplication.run(AsyncMethodApplication.class, args).close();
  }

  @Bean
  public Executor taskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(2);
    executor.setMaxPoolSize(2);
    executor.setQueueCapacity(500);
    executor.setThreadNamePrefix("GithubLookup-");
    executor.initialize();
    return executor;
  }

}
```

- @EnableAsync 애노테이션은 Spring의 비동기 메서드 지원을 활성화합니다.

### 4.3 반환 값이 있는 비동기 메서드

- 값을 반환하는 메서드도 비동기적으로 호출할 수 있습니다. 
- 그러나 이러한 메서드는 Future 타입의 반환 값을 가져야 합니다. 
- 이는 호출자가 해당 Future에서 get()을 호출하기 전에 다른 작업을 수행할 수 있도록 비동기 실행의 이점을 제공합니다:

```java
@Async
Future<String> returnSomething(int i) {
    // 이것은 비동기적으로 실행됩니다
}
```

- @Async 메서드는 일반 java.util.concurrent.Future 반환 타입뿐만 아니라 Spring의 org.springframework.util.concurrent.ListenableFuture 또는 Spring 4.2부터는 JDK 8의 java.util.concurrent.CompletableFuture도 선언할 수 있습니다. 
- 이를 통해 비동기 태스크와 더 풍부한 상호 작용과 추가 처리 단계와의 즉각적인 구성이 가능합니다.

:::warning
@Async를 @PostConstruct와 같은 라이프사이클 콜백과 함께 사용할 수 없습니다. Spring 빈을 비동기적으로 초기화하려면 현재 대상에서 @Async 애노테이션이 있는 메서드를 호출하는 별도의 초기화 Spring 빈을 사용해야 합니다:
:::

```java
public class SampleBeanImpl implements SampleBean {

    @Async
    void doSomething() {
        // ...
    }
}

public class SampleBeanInitializer {

    private final SampleBean bean;

    public SampleBeanInitializer(SampleBean bean) {
        this.bean = bean;
    }

    @PostConstruct
    public void initialize() {
        bean.doSomething();
    }
}
```

### 4.4 @Async에서 Executor 지정하기

- 기본적으로 메서드에 @Async를 지정할 때 사용되는 executor는 비동기 지원을 활성화할 때 구성된 것입니다. 
- XML을 사용하는 경우 "annotation-driven" 요소 또는 AsyncConfigurer 구현체입니다. 하지만 특정 메서드를 실행할 때 기본값이 아닌 다른 executor를 지정해야 할 경우 @Async 애노테이션의 value 속성을 사용할 수 있습니다:

```java
@Async("otherExecutor")
void doSomething(String s) {
    // 이것은 "otherExecutor"에 의해 비동기적으로 실행됩니다
}
```

- 이 경우 "otherExecutor"는 Spring 컨테이너의 모든 Executor 빈의 이름이거나, 모든 Executor와 관련된 한정자의 이름일 수 있습니다
  - Spring의 @Qualifier 애노테이션으로 지정된 것

### 4.5 @Async의 예외 관리

- @Async 메서드가 Future 유형의 반환 값을 가질 때는 메서드 실행 중에 발생한 예외를 쉽게 관리할 수 있습니다. 
- 이 예외는 Future 결과에서 get을 호출할 때 발생합니다. 
- 그러나 반환 타입이 void인 경우 예외는 잡히지 않고 전달될 수 없습니다. 
- 이러한 예외를 처리하기 위해 AsyncUncaughtExceptionHandler를 제공할 수 있습니다:

```java
public class MyAsyncUncaughtExceptionHandler implements AsyncUncaughtExceptionHandler {

    @Override
    public void handleUncaughtException(Throwable ex, Method method, Object... params) {
        // 예외 처리
    }
}
```

- 기본적으로 예외는 단순히 로깅됩니다. 
- AsyncConfigurer 또는 `<task:annotation-driven/> `XML 요소를 사용하여 사용자 정의 AsyncUncaughtExceptionHandler를 정의할 수 있습니다.

## 5. 실무 적용 팁

### 5.1 적절한 TaskExecutor 선택하기

- 단순 테스트 및 동기 실행: SyncTaskExecutor
- 간단한 비동기 실행(스레드 재사용 없음): SimpleAsyncTaskExecutor
- 일반적인 애플리케이션 스레드 풀: ThreadPoolTaskExecutor
- 특수한 Executor 적응이 필요한 경우: ConcurrentTaskExecutor
- Jakarta EE 환경: DefaultManagedTaskExecutor

### 5.2 ThreadPoolTaskExecutor 최적화 가이드

- corePoolSize: 항상 활성 상태로 유지되는 기본 스레드 수
- maxPoolSize: 동시 작업이 많을 때 풀이 확장될 수 있는 최대 스레드 수
- queueCapacity: 모든 스레드가 사용 중일 때 작업을 대기시키는 큐의 크기
- keepAliveSeconds: 유휴 스레드가 종료되기 전에 대기하는 시간(초)
- allowCoreThreadTimeOut: true로 설정하면 코어 스레드도 시간 초과로 종료될 수 있음
- threadNamePrefix: 생성된 스레드의 이름 접두사(디버깅에 유용)

### 5.3 비동기 실행 주의사항

- 트랜잭션 전파: @Async 메서드는 호출자의 트랜잭션 컨텍스트를 상속하지 않음
- 프록시 제한: 같은 클래스 내의 @Async 메서드 호출은 프록시되지 않음(self-invocation)
- 테스트 복잡성: 비동기 실행은 테스트를 더 복잡하게 만들 수 있음
- 예외 처리: void 반환 메서드의 예외 처리를 위한 전략 필요

## 6. 결론

- Spring의 TaskExecutor 추상화와 @Async 애노테이션은 Java 애플리케이션에서 비동기 작업을 구현하는 강력한 방법을 제공합니다. 
- 이러한 기능을 이해하고 적절히 활용하면 애플리케이션의 성능과 응답성을 크게 향상시킬 수 있습니다.
- 특히 ThreadPoolTaskExecutor는 대부분의 애플리케이션 요구 사항을 충족시키는 유연한 스레드 풀 구현을 제공합니다.
- Spring의 비동기 지원은 복잡한 동시성 코드를 직접 작성하지 않고도 비동기 실행의 이점을 활용할 수 있게 해줍니다. 
- 그러나 트랜잭션 관리, 예외 처리, 테스트와 같은 특정 측면에 주의를 기울여야 효과적으로 사용할 수 있습니다.

## 참고

- [Spring Framework 공식 문서: Task Execution and Scheduling](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)