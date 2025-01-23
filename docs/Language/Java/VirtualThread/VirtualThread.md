## 1. Virtual Thread

- JDK 21부터 새로운 스레드 모델인 Virtual Thread가 도입되었습니다.
- JDK에 정식 도입된 Virtual Thread는 기존의 KLT(kernel-level thread)와 ULT(user-level thread)를 1:1 매핑하여 사용하는 JVM의 스레드 모델을 개선한, 여러
  개의 가상 스레드를 하나의 네이티브 스레드에 할당하여 사용하는 모델입니다.
- 이 글에서는 Virtual Thread가 기존 스레드 모델과 어떤 점이 다른지 알아보겠습니다.
- OS 스레드를 그대로 사용하지 않고, JVM 내부에서 스레드를 관리하는 방식이다.

### 1.1 JDK 21의 Virtual Thread

- JDK 21부터 새로운 스레드 모델인 Virtual Thread가 도입되었습니다.s
- 바로 사용할 수 있을까요?
- 다른 기반 라이브러리와 서트파티가 지원해야 한다.
- 그래들, 코틀린, 스프링, 인텔리제이가 지원하기 시작했다.

## 2. JNI

- JNI(Java Native Interface)는 자바 애플리케이션에서 C, C++ 등의 네이티브 언어로 작성된 코드를 호출하거나 반대로 네이티브 코드에서 자바 코드를 호출할 수 있도록 하는 프로그래밍
  인터페이스입니다.
	- C, C++처럼 인터프리터 없이 OS가 바로 읽을 수 있는 형태의 네이티브 코드를 JVM이 호출할 수 있게 하는 인터페이스다
	- 쉽게 말해, JVM에서 다른 언어를 사용할 수 있게 한다
- 이 호출은 Java에서 메서드 앞에 native 키워드를 붙여 해당 메서드가 JNI를 사용함을 나타낸다.

## 3. 전통적인의 Java 스레드

- OS Thread를 래핑한 것 Platform Thread라고 부른다.
- 자바의 스레드를 사용하면 실제 OS 스레드를 사용한다.
- Java는 java.util.concurrent.ExecutorService를 두어 JVM 내부에서 스레드를 관리/실행한다.
- 여러 ExecutorService 중 ThreadPoolExecutor로 실제 스레드가 실행되는 부분만 간단히 살펴보자.
- 워커에 추가된 스레드는 결국 Thread.start를 실행한다.
- 즉, ExecutorService의 스케줄링 정책에 따라 JNI로 스레드를 실행하는 방식이다.

### 3.1 전통적인의 Java 스레드 한계

- OS 스레드를 직접 사용하면서 발생하는 문제점
	- 스레드 생성 비용이 높다.
	- 스레드 생성 비용이 높기 때문에 스레드 풀을 사용한다.
	- 스레드 풀을 사용하면 스레드 생성 비용을 줄일 수 있지만, 스레드 풀의 크기를 적절히 설정해야 한다.
	- 스레드 풀의 크기를 적절히 설정하지 않으면 스레드 생성 비용이 높아지거나 스레드 풀의 크기가 너무 커져서 메모리를 많이 사용하게 된다.
- 블로킹 I/O
	- 블로킹 I/O를 사용하면 스레드가 I/O 작업이 완료될 때까지 대기한다.
	- 즉 스레드를 효율적으로 사용하지 못한다.

### 3.2 대안 Reactive Programming

- 코드를 작성하고 이해하는 비용이 높다.
- 리액티브 동작하는 라이브러리가 필요하다.
	- NO JPA
- 동기식에서 리액티브 프로그래밍으로 전환하는 것은 쉽지 않다.

## 4. Virtual Thread가 해결하고자 하는 문제

- 애플리킹션의 높은 처리량 확보
 - 블로킹 발생 시 내부 스케줄링을 통해 다른 작업 처리
- 자바 플랫폼의 디자인과 조화를 이루는 코드 생성

## 5 Virtual Thread의 구조

- Os Thread, Carrier Thread, Virtual Thread- 

## 6. Virtual Thread states

- 9개의 상태를 가진다.

## 7. Virtual Thread 사용하기

## 8. Spring Boot에서 사용하기

## 9 Virtual Thread의 유의사항

- Thead Local 주의
- synchronized 주의
  - 사용 시 carrier thread가 블록될 수 있음 pinning이라고 함
  - reentrant lock을 사용하여 해결

## 10. 성능