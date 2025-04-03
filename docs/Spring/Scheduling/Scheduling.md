---
title: "Spring TaskScheduler"
author: "Java/Spring 개발자"
date: "2025-03-27"
categories: ["Spring", "Scheduling", "Java"]
tags: ["TaskScheduler", "Cron", "Spring Boot"]
---

## 1. Spring TaskScheduler

- Spring은 미래의 특정 시점에 실행할 작업을 예약하기 위한 다양한 메서드가 있는 TaskScheduler SPI를 제공합니다.
- Spring의 TaskScheduler는 Java 애플리케이션에서 작업 스케줄링을 관리하기 위한 추상화 계층을 제공합니다.
- 이러한 추상화로 인해 아래와 같은 이점이 있습니다.
  - 애플리케이션 코드와 실제 스레드 관리 방식을 분리
  - 다양한 환경(로컬, 서버 등)에 동일한 코드로 배포 가능
  - 특히 엔터프라이즈 환경에서 스레드 관리 정책 준수 용이

### 1.1 TaskScheduler 인터페이스

- 다음은 TaskScheduler 인터페이스 정의입니다

```java
public interface TaskScheduler {

    Clock getClock();

    ScheduledFuture schedule(Runnable task, Trigger trigger);

    ScheduledFuture schedule(Runnable task, Instant startTime);

    ScheduledFuture scheduleAtFixedRate(Runnable task, Instant startTime, Duration period);

    ScheduledFuture scheduleAtFixedRate(Runnable task, Duration period);

    ScheduledFuture scheduleWithFixedDelay(Runnable task, Instant startTime, Duration delay);

    ScheduledFuture scheduleWithFixedDelay(Runnable task, Duration delay);
}
```

- 가장 간단한 메서드는 Runnable과 Instant만 받는 schedule 메서드입니다.
  - 이는 지정된 시간 이후에 작업이 한 번 실행되게 합니다.
- 다른 모든 메서드는 작업을 반복적으로 실행하도록 예약할 수 있습니다.
- fixed-rate와 fixed-delay 메서드는 단순한 주기적 실행을 위한 것이지만, Trigger를 받는 메서드는 훨씬 더 유연합니다.

### 1.2 TaskScheduler 구현체

- **DefaultManagedTaskScheduler**
  - Jakarta EE 환경에서 JSR-236 표준 ManagedScheduledExecutorService에 위임
- **ConcurrentTaskScheduler**
  - 로컬 ScheduledExecutorService를 래핑한 단순한 구현체
- **ThreadPoolTaskScheduler**
  - 가장 일반적으로 사용되는 구현체로, ScheduledExecutorService에 위임하면서 스프링 빈 스타일의 구성 제공합니다.
  - Spring 6.1에서 일시 중지/재개 기능이 추가되었습니다.
- **SimpleAsyncTaskScheduler**
  - JDK 21의 가상 스레드에 최적화된 새로운 구현체
  - 단일 스케줄러 스레드를 사용하지만 각 작업마다 별도의 스레드 생성

## 2. Trigger 인터페이스

- Trigger 인터페이스는 본질적으로 JSR-236에서 영감을 받았습니다.
- Trigger의 기본 아이디어는 실행 시간이 이전 실행 결과 또는 임의 조건에 기반하여 결정될 수 있다는 것입니다.

```java
public interface Trigger {

    Instant nextExecution(TriggerContext triggerContext);
}

public interface TriggerContext {

    Clock getClock();

    Instant lastScheduledExecution();

    Instant lastActualExecution();

    Instant lastCompletion();
}
```

- TriggerContext가 가장 중요한 부분입니다. 이는 모든 관련 데이터를 캡슐화하고, 필요한 경우 미래에 확장할 수 있습니다.
- TriggerContext는 인터페이스입니다(기본적으로 SimpleTriggerContext 구현이 사용됨).

### 2.1 Trigger 구현체

- Spring은 Trigger 인터페이스의 두 가지 구현체를 제공합니다.
- 가장 흥미로운 것은 CronTrigger입니다. 이를 통해 cron 표현식을 기반으로 작업을 예약할 수 있습니다.
- 예를 들어, 다음 작업은 평일 9시부터 5시까지의 "업무 시간" 동안 매 시간 15분마다 실행되도록 예약됩니다.
  - `scheduler.schedule(task, new CronTrigger("0 15 9-17 * * MON-FRI"));`

## 3. 프로그래밍 방식으로 TaskScheduler 사용하기

TaskScheduler 인터페이스를 직접 사용하여 프로그래밍 방식으로 작업을 스케줄링할 수 있습니다. 이 방식은 동적인 스케줄링이 필요하거나 런타임에 스케줄을 변경해야 하는 경우에 유용합니다.

### 3.1 TaskScheduler 빈 설정

```java
@Configuration
public class SchedulingConfig {
    
    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(10);
        scheduler.setThreadNamePrefix("task-scheduler-");
        scheduler.initialize();
        return scheduler;
    }
}
```

### 3.2 스케줄러 직접 사용 예제

```java
@Service
public class ScheduledTaskService {
    
    private final TaskScheduler taskScheduler;
    
    public ScheduledTaskService(TaskScheduler taskScheduler) {
        this.taskScheduler = taskScheduler;
    }
    
    // 단일 작업 스케줄링
    public void scheduleOneTimeTask() {
        Instant executionTime = Instant.now().plusSeconds(60);
        taskScheduler.schedule(
            () -> System.out.println("1분 후에 실행되는 작업"),
            executionTime
        );
    }
    
    // 고정 지연으로 반복 작업 스케줄링
    public ScheduledFuture<?> scheduleTaskWithFixedDelay() {
        return taskScheduler.scheduleWithFixedDelay(
            () -> System.out.println("5초 간격으로 실행되는 작업"),
            Duration.ofSeconds(5)
        );
    }
    
    // 고정 속도로 반복 작업 스케줄링
    public ScheduledFuture<?> scheduleTaskWithFixedRate() {
        return taskScheduler.scheduleAtFixedRate(
            () -> System.out.println("3초마다 실행되는 작업"),
            Duration.ofSeconds(3)
        );
    }
    
    // Cron 표현식을 사용한 작업 스케줄링
    public ScheduledFuture<?> scheduleTaskWithCronTrigger() {
        // 매일 오전 9시에 실행
        CronTrigger cronTrigger = new CronTrigger("0 0 9 * * ?");
        return taskScheduler.schedule(
            () -> System.out.println("매일 오전 9시에 실행되는 작업"),
            cronTrigger
        );
    }
    
    // 작업 취소 예제
    public void cancelScheduledTask(ScheduledFuture<?> future) {
        boolean canceled = future.cancel(false);
        if (canceled) {
            System.out.println("작업이 성공적으로 취소되었습니다.");
        } else {
            System.out.println("작업 취소에 실패했습니다.");
        }
    }
}
```

### 3.3 동적 스케줄링 활용 예시

```java
@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {

    private final ScheduledTaskService scheduledTaskService;
    private final Map<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();
    
    public ScheduleController(ScheduledTaskService scheduledTaskService) {
        this.scheduledTaskService = scheduledTaskService;
    }
    
    @PostMapping("/fixed-rate/{seconds}")
    public ResponseEntity<String> scheduleFixedRateTask(@PathVariable int seconds) {
        String taskId = UUID.randomUUID().toString();
        ScheduledFuture<?> future = scheduledTaskService.taskScheduler.scheduleAtFixedRate(
            () -> System.out.println("작업 ID: " + taskId + " 실행 중"),
            Duration.ofSeconds(seconds)
        );
        
        scheduledTasks.put(taskId, future);
        return ResponseEntity.ok("작업이 성공적으로 스케줄링되었습니다. 작업 ID: " + taskId);
    }
    
    @DeleteMapping("/{taskId}")
    public ResponseEntity<String> cancelTask(@PathVariable String taskId) {
        ScheduledFuture<?> future = scheduledTasks.get(taskId);
        if (future != null) {
            boolean canceled = future.cancel(false);
            if (canceled) {
                scheduledTasks.remove(taskId);
                return ResponseEntity.ok("작업이 성공적으로 취소되었습니다.");
            } else {
                return ResponseEntity.badRequest().body("작업 취소에 실패했습니다.");
            }
        }
        return ResponseEntity.notFound().build();
    }
}
```

이 예제는 TaskScheduler를 직접 주입받아 사용하는 방법을 보여줍니다. REST API를 통해 동적으로 작업을 스케줄링하고 취소할 수 있는 기능을 구현했습니다.

## 4. 애노테이션으로 스케줄링하기

- Spring은 @Scheduled 애노테이션을 사용하여 메서드에 스케줄링을 적용할 수 있습니다. 
- 이 방식은 정적인 스케줄링에 적합하며, 설정이 간단합니다.

### 4.1 스케줄링 어노테이션 활성화

```java
@Configuration
@EnableAsync
@EnableScheduling
public class SchedulingConfiguration {
}
```

- @EnableScheduling 애노테이션을 사용하여 스케줄링을 활성화합니다.

### 4.2 @Scheduled 애노테이션 사용

- 트리거 메타데이터와 함께 메서드에 @Scheduled 어노테이션을 추가할 수 있습니다.
- 스케줄링될 메서드는 void 반환을 가져야 하며 어떤 인수도 받아들이지 않아야 함에 유의하세요.
- 메서드가 애플리케이션 컨텍스트의 다른 객체와 상호 작용해야 하는 경우, 일반적으로 의존성 주입을 통해 제공됩니다.
- @Scheduled는 반복 가능한 어노테이션으로 사용될 수 있습니다.
  - 동일한 메서드에서 여러 개의 스케줄 선언이 발견되면, 각각은 독립적으로 처리되며, 각각에 대해 별도의 트리거가 발생합니다.
  - 결과적으로, 이러한 공통 위치 스케줄은 겹칠 수 있으며 병렬로 또는 즉각적인 연속으로 여러 번 실행될 수 있습니다.

#### 4.2.1 고정 지연(fixed delay)

```java
@Scheduled(fixedDelay = 5000)
public void doSomething() {
    // 주기적으로 실행되어야 하는 작업
}
```

- 위 메서드는 고정 지연(fixed delay)으로 5초(5000밀리초)마다 호출되며, 이는 기간이 **각 이전 호출의 완료 시간부터 측정**됨을 의미합니다.
  - 각 호출이 완료된 후 5초가 지나면 다음 호출이 시작됩니다.
- 기본적으로 고정 지연, 고정 속도 및 초기 지연 값에는 밀리초가 시간 단위로 사용됩니다.

```java
@Scheduled(fixedDelay = 5, timeUnit = TimeUnit.SECONDS)
public void doSomething() {
    // 주기적으로 실행되어야 하는 작업
}
```

- 기본적으로 고정 지연, 고정 속도 및 초기 지연 값에는 밀리초가 시간 단위로 사용됩니다.
- 초나 분과 같은 다른 시간 단위를 사용하려면 @Scheduled의 timeUnit 속성을 통해 이를 구성할 수 있습니다.

#### 4.2.2 고정 속도(fixed rate)

- 고정 속도(fixed-rate) 실행이 필요한 경우, 어노테이션 내에서 fixedRate 속성을 사용할 수 있습니다.

```java
@Scheduled(fixedRate = 5, timeUnit = TimeUnit.SECONDS)
public void reportCurrentTime() {
    log.info("The time is now {}", dateFormat.format(new Date()));
}
```

```text
20yy-mm-ddT07:23:01.665-04:00  INFO 19633 --- [   scheduling-1] c.e.schedulingtasks.ScheduledTasks       : The time is now 07:23:01
20yy-mm-ddT07:23:06.663-04:00  INFO 19633 --- [   scheduling-1] c.e.schedulingtasks.ScheduledTasks       : The time is now 07:23:06
20yy-mm-ddT07:23:11.663-04:00  INFO 19633 --- [   scheduling-1] c.e.schedulingtasks.ScheduledTasks       : The time is now 07:23:11
```

- 위 메서드는 5초마다 호출됩니다.
- 즉, **각 호출은 5초마다 시작되며, 이전 호출이 완료되는지 여부와는 관계없이 실행**됩니다.
- 이 예제는 fixedRate() 스케줄링을 사용하므로 수동으로 중단할 때까지 애플리케이션이 무기한 실행됩니다.

##### Fixed Rate vs Fixed Delay

- Spring의 @Scheduled 어노테이션을 사용하여 예약된 작업을 실행할 수 있지만, fixedDelay와 fixedRate 속성에 따라 실행 방식이 달라집니다.
- fixedDelay 속성은 작업의 한 실행이 종료된 시간과 동일한 작업의 다음 실행이 시작되는 시간 사이에 n 밀리초의 지연이 있도록 보장합니다.
  - 이 속성은 특히 태스크의 인스턴스가 항상 하나만 실행되도록 해야 할 때 유용합니다. 의존적인 작업들에 대해 상당히 도움이 됩니다.
- fixedRate 속성은 매 n 밀리초마다 예약된 작업을 실행합니다. 이는 작업의 이전 실행 여부를 확인하지 않습니다.
  - 이는 작업의 모든 실행이 독립적일 때 유용합니다. 메모리 크기와 스레드 풀 크기를 초과하지 않을 것으로 예상된다면, fixedRate가 상당히 편리할 것입니다.
  - 다만, 들어오는 작업들이 빠르게 완료되지 않으면 "메모리 부족 예외(Out of Memory exception)"가 발생할 가능성이 있습니다.

#### 4.2.3 초기 지연(initial delay)

- 고정 지연 및 고정 속도 태스크의 경우, 메서드의 첫 실행 전에 기다려야 할 시간의 양을 지정하여 초기 지연을 지정할 수 있습니다
- 이것은 @Scheduled 애노테이션의 initialDelay 속성을 사용하여 설정할 수 있습니다.

```java
@Scheduled(initialDelay = 1000, fixedRate = 5000)
public void doSomething() {
    // 주기적으로 실행되어야 하는 작업
}
```

- 위 메서드는 1초 후에 첫 번째 실행이 시작되고, 이후 5초마다 호출됩니다.

#### 4.2.4 cron 표현식

- 단순 주기적 스케줄링이 충분히 표현적이지 않은 경우, cron 표현식을 제공할 수 있습니다.

```java
@Scheduled(cron="*/5 * * * * MON-FRI")
public void doSomething() {
    // 평일에만 실행되어야 하는 작업
}
```

- 위 메서드는 매 5초마다 호출되며, 평일에만 실행됩니다.

## 5. 스케줄 매개변수화

- 스케줄을 하드코딩하는 것은 간단하지만, 일반적으로 전체 앱을 다시 컴파일하고 재배포하지 않고도 스케줄을 제어할 수 있어야 합니다.
- Spring Expressions을 활용하여 태스크의 구성을 외부화하고, 이를 properties 파일에 저장할 수 있습니다.

```java
@Scheduled(fixedDelayString = "${fixedDelay.in.milliseconds}")

@Scheduled(fixedRateString = "${fixedRate.in.milliseconds}")

@Scheduled(cron = "${cron.expression}")
```

### 5.1 프로퍼티 파일 설정

```properties
# application.properties
fixedDelay.in.milliseconds=5000
fixedRate.in.milliseconds=1000
cron.expression=0 15 10 15 * ?
initialDelay.in.milliseconds=1000
```

- 위와 같이 application.properties 파일에 스케줄링 매개변수를 정의할 수 있습니다.
- 이를 통해 애플리케이션 재배포 없이 설정 파일만 변경하여 스케줄링 동작을 조정할 수 있습니다.

## 참고

- https://docs.spring.io/spring-framework/reference/integration/scheduling.html
- https://spring.io/guides/gs/scheduling-tasks
- https://www.baeldung.com/spring-scheduled-tasks