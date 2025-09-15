## 1. Virtual Thread란?

- Virtual Thread는 JDK 21에서 정식 공개된 Project Loom의 핵심 기능으로, JVM이 관리하는 경량 스레드입니다. 기존 OS 스레드(플랫폼 스레드) 대비 생성/스케줄링/컨텍스트 스위칭 비용이 매우 작아 대규모 동시성 처리를 동기 코드 그대로 구현할 수 있게 합니다.
- 블로킹 I/O 대기 시 Virtual Thread는 캐리어(platform) 스레드에서 언마운트되어(park) 다른 작업이 실행될 수 있게 하고, 완료 시 다시 마운트되어 실행을 이어갑니다.

## 2. 기존 Thread 모델

- Heap에 존재하는 많은 ULT 중 하나가 JVM의 스케줄링에 따라 KLT에 매핑되어 실행하는 형태가 기존의 Java 스레드 모델입니다.

- 요청 당 스레드(Thread-per-Request) 모델은 단순하지만, 동시 연결이 증가할수록 스레드 수와 문맥 전환 비용, 스택 메모리 사용이 병목이 되기 쉽습니다.

## 3. Virtual Thread 모델

- Virtual Thread는 "소수의 캐리어 플랫폼 스레드" 위에서 "매우 많은 수의 Virtual Thread"가 마운트/언마운트되며 실행되는 모델입니다. JVM 스케줄러가 이를 관리하여, I/O 대기 시 캐리어 스레드를 점유하지 않고도 높은 동시성을 달성합니다.
- 효과
  - 동기 블로킹 스타일 코드를 그대로 유지하면서도 높은 동시성 달성
  - 스레드 생성 비용과 컨텍스트 스위칭 비용의 대폭 감소
  - 기존 `Thread` API 및 모니터링 도구와 높은 호환성

### 사용 예시

```java
// 1) 단일 Virtual Thread 시작
Thread.ofVirtual().start(() -> {
    System.out.println("Hello from " + Thread.currentThread());
});

// 2) 작업마다 새로운 Virtual Thread를 사용하는 Executor
try (var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        int taskId = i;
        executor.submit(() -> doBlockingIo(taskId));
    }
}

void doBlockingIo(int id) {
    // 블로킹 I/O 호출(예: HTTP, DB)
}
```

## 4. Virtual Thread의 상태

- 일반 스레드와 동일한 수명 주기(NEW/RUNNABLE/WAITING/TIMED_WAITING/TERMINATED)를 따르며, Virtual Thread 특성상 "마운트/언마운트(park/unpark)" 전이가 추가로 관찰됩니다.
- 핀닝(pinning)이 발생하면 캐리어 스레드에서 언마운트되지 못해 이점이 줄어듭니다(아래 5장 참조). 진단에는 `-Djdk.tracePinnedThreads=short` 옵션이 유용합니다.

## 5. Virtual Thread Pinning

Virtual Thread의 핵심 이점은 블로킹 시에도 캐리어 스레드를 점유하지 않는다는 점입니다. 하지만 다음 상황에서는 Virtual Thread가 캐리어 스레드에 고정(pinning)되어 언마운트되지 못합니다.

- 대표적 원인
  - `synchronized` 블록/메서드에서 모니터 대기로 블로킹되는 경우
  - JNI를 통한 네이티브 메서드 호출 중 블로킹되는 경우
- 진단 방법
  - `-Djdk.tracePinnedThreads=short` 옵션으로 핀닝 스택을 로그로 확인
- 대응 가이드
  - 가능하면 `synchronized` 대신 `ReentrantLock` 등 `java.util.concurrent` 락 사용
  - 임계 구역은 매우 짧게 유지하고, I/O를 포함하지 않도록 설계
  - 의존 라이브러리를 Virtual Thread 친화 버전으로 업그레이드
    - MySQL: https://github.com/mysql/mysql-connector-j/pull/95
    - UUID: https://github.com/f4b6a3/uuid-creator/commit/3e684b1dec472b51a641bbd1762b33c9ea62bc77

특히 Spring Boot 2.x 계열처럼 `synchronized` 사용이 많은 라이브러리가 섞여 있으면 핀닝이 빈번할 수 있습니다. Virtual Thread의 장점을 충분히 살리려면 의존 모듈의 마이그레이션(혹은 업그레이드)이 선행되어야 합니다.

## 6. Spring에서의 사용

- Spring Framework 6.1 / Spring Boot 3.2+에서는 프로퍼티 한 줄로 MVC/서블릿 스택에서 Virtual Thread를 활성화할 수 있습니다.

```properties
spring.threads.virtual.enabled=true
```

- 효과
  - Spring MVC + 서블릿 컨테이너(Tomcat/Jetty/Undertow 등)에서 요청 당 Virtual Thread 모델을 손쉽게 적용
  - 기존 동기 블로킹 코드도 높은 동시성으로 동작
- 함께 고려할 점
  - JDBC 커넥션 풀 크기, 외부 API 레이트 리밋, 파일 디스크립터 한도 등 다운스트림 자원 상한을 조정
  - 필요 시 `Semaphore` 등으로 동시성 상한을 애플리케이션 레벨에서 제한
  - 이미 논블로킹 스택(WebFlux/Netty)을 사용 중이라면 체감 이점은 상대적으로 작을 수 있음

## 7. 베스트 프랙티스와 안티패턴

- 권장
  - 작업 단위마다 Virtual Thread를 생성하는 실행기: `Executors.newVirtualThreadPerTaskExecutor()`
  - I/O 바운드 블로킹 코드를 단순하고 읽기 쉬운 동기 스타일로 유지
  - 컨텍스트 전파가 필요하면 `ScopedValue`(JDK 21) 검토
- 지양
  - 긴 `synchronized` 블록, 네이티브 블로킹 호출 → 핀닝 유발
  - 무제한 ThreadLocal 사용 → 메모리 급증
  - CPU 바운드 대용량 연산 전부를 Virtual Thread로 처리 → 이점 미미

## 참고

- [Java의 미래, Virtual Thread](https://techblog.woowahan.com/15398/)
- [[Project Loom] Virtual Thread에 봄(Spring)은 왔는가](https://arc.net/l/quote/youwthjl)
- [Virtual Thread의 기본 개념 이해하기](https://d2.naver.com/helloworld/1203723)
- [코루틴과 Virtual Thread 비교와 사용](https://tech.kakaopay.com/post/coroutine_virtual_thread_wayne/)