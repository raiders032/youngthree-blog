## 1 Multi Thread

## 2 Process와 Thread

### 2.1 Process

- **프로세스**란 실행 중인 프로그램이다
- 프로세스는 종종 프로그램 또는 애플리케이션과 동의어로 간주된다.
	- 그러나 사용자가 단일 애플리케이션으로 인식하는 것은 사실 협력 프로세스 집합일 수 있다.
	- 프로세스 간 통신(IPC)를 통해 프로세스 집합은 서로 통신한다.
- 프로세스는 독립적이기 때문에 하나의 프로세스에서 오류가 발생해도 다른 프로세스에 영향을 미치지 않는다
- [Process.md](../../../ComputerScience/OS/Process/Process.md)

### 2.2 Thread

- 스레드는 사전적 의미로 한 가닥의 실이라는 뜻이다
- 스레드는 경량 프로세스(lightweight processes)라고도 한다.
- 프로세스와 스레드는 모두 실행 환경을 제공하지만, 새 스레드를 만드는 것은 새 프로세스를 만드는 것보다 더 적은 리소스를 필요로 한다.
- 스레드는 프로세스 내에 존재하며, 모든 프로세스에는 하나 이상의 쓰레드가 있다.
	- 하나의 스레드가 예외를 발생시키면 프로세스 자체가 종료될 수 있어 다른 스레드에 양향을 미칠 수 있다
	- 따라서 멀티 스레드에서는 예외 처리를 잘 해야한다.
	- 스레드는 메모리 및 열린 파일을 포함하여 프로세스의 리소스를 공유합니다.
	- 이로 인해 효율적이지만 잠재적으로 동시성 문제가 발생할 수 있다.
- [Threads.md](../../../ComputerScience/OS/Threads/Threads.md)

## 3 Main Thread

- 모든 자바 애플리케이션은 메인 스레드가 main() 메소드를 실행하면서 시작합니다.
	- 자바는 실행 시점에 `main` 이라는 이름의 스레드를 만들고 프로그램의 시작점인 `main()` 메서드를 실행합니다.
- 싱글 스레드 애플리케이션은 메인 스레드가 종료하면 프로세스도 종료된다
- 멀티 스레드 애플리케이션은 실행 중인 스레드가 하나라도 있으면 프로세스가 종료되지 않는다
	- 메인 스레드가 종료되고 작업 스레드가 실행중인 경우 포함
- 메인 스레드는 필요에 따라 **작업 스레드를 만들어 병렬로 코드를 실행**한다.

## 4 Thread 생성 및 실행

- 자바에서는 작업 스레드도 객체로 생성된다
- Thread 객체 생성 방법
	1. `java.lang.Thread` 클래스를 객체화해서 사용
	2. `executor` 를 사용

### 4.1 Thread 클래스로 생성

- 작업 스레드 생성시 스레드가 실행할 코드를 제공해야 한다.
	- 스레드 생성시 생성자의 인자로 Runnable 인터페이스의 구현체가 들어간다.
	- 스레드는 Runnable 인터페이스를 구현한 구현체의 run()메소드를 실행한다.
	- 따라서 작업 스레드를 통해 실행하고자 하는 코드를 Runnable 인터페이스를 구현한 구현체의 run()메소드에 작성하면 된다.
- 작업 스레드는 생성되는 즉시 실행되는 것이 아니라 `start()` 메소드를 호출하면 실행된다
	- `start()`가 호출되면 매개값으로 받은 `Runnable`의 `run()` 메소드를 실행하면서 자신의 작업을 처리한다

```java
// 작업 Thread 생성
Thread thread = new Thread();

// 작업 Thread 실행
thread.start();
```

#### 4.1.1 Runnable 인터페이스

- `Runnable`은 인터페이스 하나의 추상 메소드를 가지고 있다
	- 이 메소드가 **스레드가 실행할 코드를 의미**한다.
- `Runnable`을 구현한 객체가 Thread 생성자의 인자로 들어간다.

```java
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
```

**Runnable 인터페이스를 직접 구현하는 방식**

```java
public class ImplementRunnable implements Runnable{
    @Override
    public void run() {
        System.out.println("ImplementRunnable.run");
    }
}
```

```java
public class Main {

    public static void main(String[] args) {
        ImplementRunnable task = new ImplementRunnable();
      	// 작업 Thread 생성
        Thread thread = new Thread(task);
      	// 작업 Thread 실행
        thread.start();
    }
}
```

**Runnable 익명 구현 객체 사용하는 방식**

- [익명 구현 객체(Anonymous Class) 참고](../Anonymous-Class/Anonymous-Class.md)

```java
public class Main {
    public static void main(String[] args) {
      	// 작업 Thread 생성
        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("Main.run");
            }
        });
      	// 작업 Thread 실행
        thread.start();
    }
}
```

**Runnable 익명 구현 객체 사용하는 방식: 람다식 이용**

- `Runnable`은 인터페이스는 Functional Interface이기 때문에 람다 표현식을 사용할 수 있다

```java
public class Main {
    public static void main(String[] args) {
      	// 작업 Thread 생성
        Thread thread = new Thread(() -> System.out.println("Main.run"));
      	// 작업 Thread 실행
        thread.start();
    }
}
```

#### 4.1.2 Thread 하위 클래스로부터 생성

- 작업 스레드가 실행할 작업을 Runnable로 만들지 않고, Thread의 하위 클래스로 작업 스레드를 정의하면서 작업 내용을 포함시킬 수도 있다.
- Thread 클래스를 상속한 후 run 메소드를 overriding해서 스레드가 실행할 코드를 작성하면 된다.

**하위 클래스 직접 생성**

```java
public class WorkerThread extends Thread {
  @Override
  public void run() {
      //스레드가 실행할 코드
  }
}
```

**익명 구현 객체 이용**

```java
Thread thread = new Thread() {
  public void run() {
      //스레드가 실행할 코드
  }
}
```

**스레드 실행**

```java
thread.start()
```

### 4.2 Thread 실행

- 스레드 객체를 생성한 다음에 `start()` 메서드를 호출하면 자바는 스레드를 위한 별도의 스택 공간을 할당합니다.
- `start()` 대신 `run()` 메서드를 직접 호출하면 새로운 스레드가 생성되지 않고 현재 스레드에서 `run()` 메서드가 실행되니 주의해야 합니다.

## 5 Daemon Thread

- 스레드는 사용자 스레드와 데몬 스레드로 구분됩니다.
- **사용자 스레드**
	- 프로그램의 주요 작업을 수행합니다.
	- 작업이 완료될 때까지 실행됩니다.
	- 모든 user 스레드가 종료되면 JVM도 종료됩니다.
- **데몬 스레드**
	- 백그라운드에서 보조적인 작업을 수행합니다.
	- 모든 user 스레드가 종료되면 데몬 스레드는 자동으로 종료됩니다.
	- JVM은 데몬 스레드의 실행 완료를 기다리지 않고 종료됩니다.

### 5.1 데몬 스레드 생성

```java
package thread.start;

public class DaemonThreadMain {
    public static void main(String[] args) {
        System.out.println(Thread.currentThread().getName() + ": main() start");
        DaemonThread daemonThread = new DaemonThread();
        daemonThread.setDaemon(true); // 데몬 스레드 여부
        daemonThread.start();
        System.out.println(Thread.currentThread().getName() + ": main() end");
    }
    
    static class DaemonThread extends Thread {
        @Override
        public void run() {
            System.out.println(Thread.currentThread().getName() + ": run() start");
            try {
                Thread.sleep(10000); // 10초간 실행
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            System.out.println(Thread.currentThread().getName() + ": run() end");
        }
    }
}

```

- `setDaemon(true)` : 데몬 스레드로 설정합니다.
- 데몬 스레드 여부는 `start()` 실행 전에 결정해야 합니다. 이후 변경할 수 없습니다.
- 기본 값은 `false` 입니다. (user 스레드가 기본)

## 6 Thread 정보

- `Thread` 클래스는 스레드를 생성하고 관리하는 기능을 제공한다.
- `Thread` 클래스가 제공하는 정보들을 확인해보자.

### 6.1 getId()

- 스레드의 고유 식별자를 반환하는 메서드입니다.
- 이 ID는 JVM 내에서 각 스레드에 대해 유일합니다.
- ID는 스레드가 생성될 때 할당되며, 직접 지정할 수 없습니다.

### 6.2 getName()

- 스레드의 이름을 반환하는 메서드입니다.
- 스레드의 이름은 생성자를 통해 지정할 수 있습니다.
- 지정하지 않으면 JVM이 자동으로 이름을 부여합니다.
- 스레드 ID는 중복되지 않지만, 스레드 이름은 중복될 수 있습니다.

### 6.3 getPriority()

- 스레드의 우선순위를 반환하는 메서드입니다.
- 스레드의 우선순위는 1부터 10까지 지정할 수 있습니다.
- 기본값은 5입니다.
- 우선순위가 높을수록 스레드가 CPU를 더 많이 할당받습니다.
- 실제 우선순위는 JVM의 구현과 운영체제에 따라 다를 수 있습니다.

### 6.4 getThreadGroup()

- 스레드가 속한 스레드 그룹을 반환하는 메서드입니다
- 스레드 그룹은 스레드를 그룹화하여 관리할 수 있는 기능을 제공합니다.
- 기본적으로 모든 스레드는 부모 스레드와 동일한 스레드 그룹에 속하게 됩니다.
- 스레드 그룹은 여러 스레드를 하나의 그룹으로 묶어서 특정 작업(예: 일괄 종료, 우선순위 설정 등)을 수행할 수 있습니다.
- 스레드 그룹을 직접적으로 사용하는 경우는 드물다.

### 6.5 getState()

- 스레드의 상태를 반환하는 메서드입니다.
- 스레드의 상태는 `NEW`, `RUNNABLE`, `BLOCKED`, `WAITING`, `TIMED_WAITING`, `TERMINATED` 중 하나입니다.
  - `Thread.State` 열거형에 정의되어 있습니다.
- **NEW**: 스레드가 아직 시작되지 않은 상태입니다.
- **RUNNABLE**: 스레드가 실행 중이거나 실행될 준비가 된 상태입니다.
- **BLOCKED**: 스레드가 동기화 락을 기다리는 상태입니다.
- **WAITING**: 스레드가 다른 스레드의 특정 작업이 완료되기를 기다리는 상태입니다.
- **TIMED_WAITING**: 일정 시간 동안 기다리는 상태입니다.
- **TERMINATED**: 스레드가 실행을 마친 상태입니다.

## 7 스레드의 생명 주기

- 스레드의 생명 주기는 스레드가 생성되어 실행되고 종료될 때까지의 과정을 의미합니다.
- 스레드의 생명 주기는 `NEW`, `RUNNABLE`, `BLOCKED`, `WAITING`, `TIMED_WAITING`, `TERMINATED` 여섯 가지 상태로 나눌 수 있습니다.

### 7.1 NEW

- 스레드가 생성되었지만 `start()` 메서드가 호출되지 않은 상태입니다.

### 7.2 RUNNABLE

- `start()` 메서드가 호출하면 스레드는 `RUNNABLE` 상태가 됩니다.
- RUNNABLE은 실행 중이거나 실행 준비가 된 상태를 의미합니다.
- 참고로 운영체제 스케줄러의 실행 대기열에 있든, CPU에서 실제 실행되고 있든 모두 `RUNNABLE` 상태입니다.
- 따라서 `RUNNABLE` 상태는 실행 중인 상태(CPU에서 실행 중)와 실행 대기 상태(운영체제 스케줄러 대기열에 있는 상태)를 모두 포함합니다.

### 7.3 BLOCKED

- 스레드가 동기화 블록 또는 메서드에 의해 락을 기다리는 상태입니다.
- 예를 들어, `synchronized` 블록에 진입하기 위해 락을 얻어야 하는 경우 이 상태에 들어갑니다.

### 7.4 WAITING

- 스레드가 다른 스레드가 특정 작업을 완료할 때까지 기다리는 상태입니다.
- `wait()`, `join()` 메서드가 호출될 때 이 상태가 됩니다.
- 스레드는 다른 스레드가 `notify()` 또는 `notifyAll()` 메서드를 호출하거나, `join()` 이 완료될 때까지 기다립니다.

### 7.5 TIMED_WAITING

- 스레드가 특정 시간 동안 다른 스레드의 작업이 완료되기를 기다리는 상태입니다.
- `sleep(long millis)` , `wait(long timeout)` , `join(long millis)` 메서드가 호출될 때 이 상태가 됩니다.
- 주어진 시간이 경과하거나 다른 스레드가 해당 스레드를 깨우면 이 상태에서 벗어납니다.
- 예: `Thread.sleep(1000);`

### 7.6 TERMINATED

- 스레드의 실행이 완료된 상태이다.
- 스레드가 정상적으로 종료되거나, 예외가 발생하여 종료된 경우 이 상태로 들어간다.
- 스레드는 한 번 종료되면 다시 시작할 수 없다.

## 8 Thread 상태 제어 메소드

- Thread의 메소드를 통해 Thread의 상태를 제어할 수 있다.
- https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/Thread.html

### 8.1 sleep()

- `sleep(long millis)`를 호출하면 스레드는 주어진 시간 동안 일시 정지 상태가 됩니다.
  - 스레드가 `TIMED_WAITING` 상태가 됩니다.
- 주어진 시간이 지나면 자동적으로  `RUNNABLE` 상태가 됩니다.
- 일시 정지 상태에서 주어진 시간을 다 기다리기 전에 `.interrupt()` 메소드가 호출되면 `InterruptedException`이 발생합니다.

```java
import java.awt.Toolkit;

public class SleepExample {
	public static void main(String[] args) {
		Toolkit toolkit = Toolkit.getDefaultToolkit();
		for(int i=0; i<10; i++) {
			toolkit.beep();
			try {
				Thread.sleep(3000);
			} catch (InterruptedException e) { }
		}
	}
}
```

### 8.2 yield()

- yield() 메소드를 호출한 스레드는 실행 대기 상태가 되고 우선순위가 동일하거나 높은 다른 스레드에게 실행을 양보한다.
- 스레드에 무의미한 반복이 있는 시점에 yield() 메소드를 사용하면 성능에 도움이 된다.

### 8.3 join()

- ThreadA가 ThreadB의 결과값을 사용할 경우 ThreadA는 ThreadB가 종료될 때 까지 기다려야한다.
- 이러한 경우 ThreadA가 `threadB.join()` 을 호출하면 ThreadB의 run() 메소드가 종료될 때까지 `WATING` 상태가 됩니다.
- `WATING` 상태는 스레드가 다른 스레드의 특정 작업이 완료되기를 무기한 기다리는 상태입니다.
  - `join()` 을 호출하는 스레드는 대상 스레드가 `TERMINATED` 상태가 될 때 까지 대기합니다.
  - 대상 스레드가`TERMINATED` 상태가 되면 호출 스레드는 다시 `RUNNABLE` 상태가 되면서 다음 코드를 수행합니다.
- `join(long millis)`을 호출하면 대상 스레드가 `ms` 시간이 지나면 호출 스레드는 다시 `RUNNABLE` 상태가 됩니다.
  - 이 때 join을 호출한 스레드는 `TIMED_WAITING` 상태가 됩니다.

```java
public class SumThread extends Thread {
	private long sum;

	public long getSum() {
		return sum;
	}

	public void setSum(long sum) {
		this.sum = sum;
	}

	@Override
	public void run() {
		for(int i=1; i<=100; i++) {
			sum += i;
		}
	}
}

public class JoinExample {
	public static void main(String[] args) {
		SumThread sumThread = new SumThread();
		sumThread.start();

		try {
      // sumThread가 종료될 때가지 메인 스레드를 일시 정지시킴
			sumThread.join();
		} catch (InterruptedException e) { }
		
		System.out.println(sumThread.getSum());
	}
}
```

### 8.4 interrupt()

- 특정 스레드의 인스턴스에 `interrupt()` 메서드를 호출하면, 해당 스레드에 인터럽트가 발생합니다.
- 인터럽트가 발생하면 해당 스레드에 `InterruptedException` 이 발생합니다. 
- 이때 인터럽트를 받은 스레드는 대기 상태에서 깨어나 `RUNNABLE` 상태가 되고, 코드를 정상 수행합니다.
- 이때 `InterruptedException` 을 `catch`로 잡아서 정상 흐름으로 변경하면 됩니다.
- 참고로 `interrupt()` 를 호출했다고 해서 즉각 `InterruptedException` 이 발생하는 것은 아닙니다.
  - 오직`sleep()` 처럼 `InterruptedException` 을 던지는 메서드를 호출 하거나 또는 호출 중일 때 예외가 발생한합니다.
  - 즉 대상 스레드가 `WATING`, `TIMED_WAITING` 상태일 때 `InterruptedException` 이 발생하면서 대상 스레드가 `RUNNABLE` 상태가 됩니다.

## 9 Thread Scheduling

- Thread Scheduling은 스레드의 개수가 코어의 수보다 많을 경우 **스레드를 어떤 순서에 의해 동시성으로 실행**할 것인가 결정하는 것
- 멀티 스레드
	- **동시성(Concurrency):** 하나의 코어에서 멀티 스레드가 번갈아가며 실행하는 성질
	- **병렬성(Parallelism)**: 멀티 코어에서 개별 스레드를 동시에 실행하는 성질
- 자바의 스레드 스케줄링은 우선순위 방식과 round robin방식을 사용한다.
	- 우선순위 방식
	- 우선순위가 높은 스레드가 실행 상태를 더 많이 가져감
		- 스레드에 우선순위를 부여할 수 있다.
		- 우선순위는 1~10, 10이 가장 높은 우선순위
		- 우선순위 기본값은 5
		- `thread.setPriority(10)` : 스레드에 우선순위 10 부여
	- round robin방식
	- 시간 할당량 만큼 스레드를 실행하고 다시 다른 스레드를 실행하는 방식
		- JVM에 의해서 순서가 정해져 코드로 제어 불가

## 10 Synchronization

- 스레드는 주로 필드 및 오브젝트 참조 필드에 대한 액세스를 공유하여 통신한다.
- 이는 매우 효율적인 방법이지만 **thread interference** 와 **memory consistency errors** 두가지 문제점이 발생할 수 있다.
- 이 문제를 해결하는 것이 Synchronization이다.

### 10.1 Thread Interference

- Thread Interference는 여러 스레드가 공유 변수를 사용할 때 스레드의 실행 순서에 따라 결과 값이 달라지는 상황을 의미한다.
- Thread Interference의 원인
	- 여러 쓰레드가 하나의 공유 변수를 동시에 조작할 때 interleave가 발생

**interleave**

- 단일 명령어처럼 보이는 오퍼레이션은 사실 JVM에서는 여러 단계를 거쳐 실행된다.
- 두개의 스레드가 공유 변수를 동시에 조작에 오퍼레이션의 단계들이 서로 포개지는 현상을 **interleave**라 한다.

**Counter.java**

```java
class Counter {
    private int c = 0;

    public void increment() {
        c++;
    }

    public void decrement() {
        c--;
    }

    public int value() {
        return c;
    }

}
```

**interleave 예시**

```java
public void increment() {
  c++;
}
```

- 위에 `c++;` 은 단일 오퍼레이션 처럼 보이지만 아래와 같은 단계로 구성되어 있다.
	1. c의 현재 값을 읽는다.
	2. 검색된 값을 1씩 증가시킵니다.
	3. 증가된 값을 다시 c에 저장합니다.
- `c--;` 도 위와 비슷하다
- ThreadA와 ThreadB가 각각 increment()와 decrement()를 호출한다고 해보자
	1. ThreadA: c를 읽는다. (c == 0)
	2. ThreadB: c를 읽는다. (c == 0)
	3. ThreadA: 읽은 값을 1 증가시킨다. (c == 1)
	4. ThreadB: 읽은 값을 1 감소시킨다. (c == -1)
	5. ThreadA: 결과를 c에 저장합니다. (c == 1)
	6. ThreadB: 결과를 c에 저장합니다. (c == -1)
- 우리가 원하는 최종 결과는 c == 0 이지만 오퍼레이션의 단계들이 interleave되면서 결과는 c == -1이 되었다.

### 10.2 Memory Consistency Errors

- [참고](https://docs.oracle.com/javase/tutorial/essential/concurrency/memconsist.html)

### 10.3 Synchronized Methods 

- Java는 동기화 메소드와 동기화 statements 두 가지 기본 동기화 방식을 제공한다.
- 메소드를 동기화하려면 메소드 선언에 synchronized 키워드를 추가한다.
- `synchronized` 키워드를 사용하면 thread interference와 memory consistency errors를 방지할 수 있다.

**Synchronized의 효과**

- 한 스레드가 어떤 객체의 Synchronized 메소드를 호출한 후 다른 스레드가 같은 객체의 임의의 Synchronized 메소드 호출하면 블록된다.
- synchronized 메소드가 종료될 때 자동적으로 happens-before 관계가 성립한다.
	- 동일한 객체에 대해 synchronized 메소드 호출하면 앞선 스레드가 변화시킨 객체의 상태를 뒤에 스레드가 볼 수 있을 때 첫 번째 스레드와 두 번째 스레드가 happens-before 관계라고 한다.

**Synchronized Methods 예시**

```java
public class SynchronizedCounter {
    private int c = 0;

    public synchronized void increment() {
        c++;
    }

    public synchronized void decrement() {
        c--;
    }

    public synchronized int value() {
        return c;
    }
}
```

### 10.4 Intrinsic Locks

- 모든 객체는 intrinsic lock을 가지고 있다.
- 객체의 필드에 대한 독점적인 접근이 필요한 스레드는 접근하기 전에 객체의 intrinsic lock을 획득하고, 작업이 완료되면 intrinsic lock을 해제해야 한다.
- 스레드는 lock을 획득하고 해제하는 시간 동안 intrinsic lock을 소유한다고 한다.
- 한 스레드가 intrinsic lock을 소유하고 있으면 다른 스레드 intrinsic lock을 획득할 수 없다.
	- 다른 스레드는 lock을 획득하려고 할 때 블록된다.
- 스레드가 lock을 해제하면 그 이후 동일한 lock을 획득하는 스레드와 happens-before 관계가 성립된다.

**Locks In Synchronized Methods**

- 스레드가 synchronized 메소드를 호출할 때 자동으로 메소드의 객체에 대한 intrinsic lock을 획득하고 메소드가 반환될 때 이를 해제한다.
	- 예외로 인해 return되는 경우에도 lock이 해제된다.
- static 메소드는 객체가 아닌 클래스와 연결되기 때문에 이 경우 스레드는 클래스와 연결된 클래스 객체에 대한 intrinsic lock을 획득한다.
	- 따라서 클래스의 static 필드에 대한 액세스는 클래스의 모든 인스턴스에 대한 lock과 구별되는 lock이다.

### 10.5 Synchronized Statements

- 동기화된 코드를 만드는 또 다른 방법은 Synchronized Statements를 사용하는 것이다
- Synchronized 메소드와 달리 Synchronized Statements는 intrinsic lock을 제공하는 객체를 지정해야한다.

**Synchronized Statements 예시**

```java
public void addName(String name) {
    synchronized(this) {
        lastName = name;
        nameCount++;
    }
    nameList.add(name);
}
```

**concurrency 향상**

- 위에 코드보다 아래의 코드가 동시 실행에 좋다
- c1, c2 필드에 대한 연산 `c1++`, `c2++` 이 interleave 되어도 무관한 상황이라 순전히 lock을 위한 객체를 생성

```java
public class MsLunch {
    private long c1 = 0;
    private long c2 = 0;

    public void inc1() {
        synchronized(this) {
            c1++;
        }
    }

    public void inc2() {
        synchronized(this) {
            c2++;
        }
    }
}
```

```java
public class MsLunch {
    private long c1 = 0;
    private long c2 = 0;
    private Object lock1 = new Object();
    private Object lock2 = new Object();

    public void inc1() {
        synchronized(lock1) {
            c1++;
        }
    }

    public void inc2() {
        synchronized(lock2) {
            c2++;
        }
    }
}
```

참고

- https://docs.oracle.com/javase/tutorial/essential/concurrency/index.html
- 이것이 자바다(이상민 저)
