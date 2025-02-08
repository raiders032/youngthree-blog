---
title: "Asynchronous Non-blocking Programming"
description: "네트워크 프로토콜부터 웹 애플리케이션까지, 비동기-논블로킹 프로그래밍이 각 계층에서 어떻게 발전하고 통합되는지 설명합니다. 각 계층의 핵심 개념과 상위 계층과의 유기적 관계를 중심으로 다룹니다."
tags: [ "ASYNC", "NON_BLOCKING", "NETWORK", "OPERATING_SYSTEM", "JAVA", "REACTOR_PATTERN", "NETTY", "REACTIVE_STREAMS" ]
keywords: [ "비동기", "async", "논블로킹", "non-blocking", "네트워크", "network", "운영체제", "OS", "자바", "java", "리액터패턴", "reactor pattern", "네티", "netty", "리액티브스트림즈", "reactive streams" ]
draft: false
hide_title: true
---

## 1. 소개

- 현대의 소프트웨어 시스템은 점점 더 많은 동시 사용자와 데이터를 처리해야 합니다.
- 전통적인 동기-블로킹 방식의 프로그래밍은 이러한 요구사항을 감당하기 어려워졌고, 이는 비동기-논블로킹 프로그래밍의 필요성으로 이어졌습니다.

### 1.1 학습 목표

- 이 문서를 통해 다음을 이해할 수 있습니다
  - 비동기-논블로킹 프로그래밍의 기반이 되는 각 계층의 핵심 개념
  - 하위 계층의 기술이 상위 계층에서 어떻게 추상화되고 발전하는지
  - 네트워크 프로토콜부터 웹 애플리케이션까지 전체 스택의 유기적 관계

### 1.2 왜 비동기-논블로킹인가?

- 전통적인 동기-블로킹 방식의 한계
	- 요청당 하나의 스레드 필요
	- 스레드 생성과 컨텍스트 스위칭 비용
	- 메모리 사용량 증가
	- 확장성 제한
- 비동기-논블로킹 방식의 이점:
	- 적은 수의 스레드로 많은 요청 처리
	- 시스템 리소스 효율적 사용
	- 높은 처리량과 확장성
	- 반응성 향상
- 이제 이러한 비동기-논블로킹 아키텍처가 어떻게 발전해왔는지, 가장 기본이 되는 네트워크 프로토콜부터 살펴보겠습니다.

## 2. 신뢰성 있는 데이터 전송의 시작: TCP

- [TCP](../../Network/Protocol/TCP/TCP.md)는 신뢰성 있는 데이터 전송을 보장하는 프로토콜입니다.

### 2.1 연결 생명주기

- 연결 수립 (3-way Handshake)
	- SYN → SYN+ACK → ACK
	- 초기 시퀀스 번호 동기화
	- 양방향 통신 준비
- 데이터 전송
	- 시퀀스 번호로 순서 보장
	- ACK를 통한 신뢰성 확보
	- 윈도우 사이즈로 흐름 제어
- 정상 종료 (4-way Handshake)
	- FIN → ACK → FIN → ACK
	- TIME_WAIT 상태로 안전한 종료

### 2.2 TCP 비정상 종료

- TCP 연결이 정상적인 4-way Handshake 과정을 거치지 않고 종료되는 경우를 비정상 종료라고 합니다.
- 비정상 종료는 크게 두 가지 형태로 발생합니다
	- RST 패킷을 통한 강제 종료: 연결 종료 시 상대방에게 RST 패킷을 전송하여 즉시 연결을 끊는 방식
	- 묵시적 비정상 종료: 물리적 연결 단절이나 시스템 장애로 인해 아무런 종료 신호 없이 연결이 끊어지는 경우
- 묵시적 비정상 종료를 감지하고 대응하기 위해 다음과 같은 방법을 사용합니다
	- TCP Keep-Alive: TCP 프로토콜 수준에서 연결 상태를 주기적으로 확인
	- Application Layer Heartbeat: 응용 프로그램 수준에서 주기적으로 상태 확인 메시지를 교환

## 2. OS 레벨의 진화: I/O 모델과 멀티플렉싱

### 2.1 I/O 모델의 발전

[IO Models](../../ComputerScience/OS/IOModels/IOModels.md)에서 설명하는 네 가지 I/O 모델의 진화:

1. 블로킹 I/O
	- 가장 기본적인 모델
	- 작업 완료까지 스레드 대기
	- 리소스 활용의 비효율성
2. 논블로킹 I/O
	- 즉시 제어권 반환
	- 지속적인 상태 확인 필요
	- CPU 자원 낭비 문제
3. [IO Multifexing](../../ComputerScience/OS/IOMultifexing/IOMultifexing.md)
	- 하나의 스레드로 여러 I/O 감시
	- select/poll의 등장과 한계
	- epoll을 통한 성능 개선
4. [Asynchronous IO](../../ComputerScience/OS/AsynchronousIO/AsynchronousIO.md)
	- 완전한 비동기 처리
	- Linux의 io_uring 시스템 콜
	- 커널이 I/O 완료 통지
	- 가장 효율적인 리소스 활용

### 2.2 Socket과 File Descriptor

- [OS Socket](../../ComputerScience/OS/Socket/Socket.md)에서 설명하는 것처럼:
	- 소켓은 네트워크 통신의 엔드포인트
	- 파일 디스크립터를 통한 일관된 인터페이스
	- "모든 것은 파일이다" 철학의 구현
- 이러한 OS 레벨의 발전은 상위 계층에서 다음과 같은 가능성을 열었습니다:
	- 효율적인 리소스 활용
	- 확장 가능한 서버 구현
	- 이벤트 기반 프로그래밍 모델

## 3. Java에서의 구현: IO에서 NIO로

### 3.1 전통적인 블로킹 I/O

- [Java IO를 황용한 TCP Socket Programming.](../../Language/Java/TCP-Socket-Programming/TCP-Socket-Programming.md)
	- Java IO 패키지를 사용해 블로킹 TCP 서버/클라이언트를 구현합니다.
	- 블로킹 서버의 한계를 설명합니다.
	- 멀티 스레드 방식을 사용해 다중 접속 서버를 구현합니다.

### 3.2 블로킹 I/O의 한계

- [다중 접속 서버의 구현](../../ComputerScience/OS/MultipleConnections/MultipleConnections.md)
- 블로킹 TCP 서버의 한계
	- 다수의 클라이언트가 연결하는 경우에는 문제가 발생합니다.
	- 처음 연결한 클라이언트가 연결을 종료하기 전까지는 다른 클라이언트의 연결은 listen 큐에 들어가 대기해야 합니다.
	- 따라서 다수의 요청을 처리할 수 없다는 문제가 있습니다.
- 이러한 문제를 해결하기 위해 다음과 같은 방법이 제안되었습니다
	- 멀티 프로세싱: fork() 함수를 사용해 자식 프로세스를 생성하는 방식
	- 멀티 스레딩: 스레드를 사용해 다수의 클라이언트 요청을 처리하는 방식
	- I/O 멀티플렉싱: select() 함수를 사용해 다수의 소켓을 모니터링하고, 이벤트가 발생한 소켓을 처리하는 방식

### 3.3 NIO의 혁신

- [Java NIO](../../Language/Java/NIO/NIO.md)가 가져온 변화:
- Channel과 Buffer
	- 양방향 데이터 전송
	- 효율적인 메모리 사용
	- 직접/비직접 버퍼 지원
- Selector
	- OS의 I/O 멀티플렉싱 추상화
	- 이벤트 기반 프로그래밍 지원
	- 단일 스레드로 다중 연결 처리
- 이러한 Java NIO의 기능은 상위 계층에서 다음과 같이 활용됩니다
	- Netty의 이벤트 루프 구현
	- 리액티브 스트림의 비동기 처리
	- 고성능 네트워크 애플리케이션 개발

## 4. 이벤트 기반 아키텍처의 등장: Reactor 패턴과 Netty

### 4.1 Reactor 패턴

- Reactor 패턴은 동시에 들어오는 여러 종류의 이벤트를 처리하기 위한 동시성을 다루는 디자인 패턴입니다.
- 이벤트 기반 아키텍처의 근간이 되는 패턴으로, 동시에 들어오는 여러 이벤트를 효율적으로 처리하기 위한 구조를 제공합니다

#### 4.1.1 주요 구성 요소

- Reactor (이벤트 루프)
	- 무한 반복문을 실행해 이벤트가 발생할 때까지 대기
	- 이벤트 발생 시 적절한 핸들러에게 디스패치
	- 모든 이벤트 처리의 중심 역할 수행
- Handler
	- 디스패치된 이벤트를 받아서 처리
	- 실제 비즈니스 로직 수행
	- 각 이벤트 타입에 맞는 처리 로직 구현

#### 4.1.2 동작 방식

- 이벤트 루프는 다음 단계를 반복적으로 수행합니다:
	- 이벤트 발생 대기
	- 이벤트 발생 시 적절한 핸들러로 디스패치
	- 핸들러에서 이벤트 처리
	- 다시 1단계로 돌아가 반복

### 4.2 Reactor 패턴과 Netty의 만남

- Reactor 패턴은 Java NIO의 진화와 만나 Netty라는 강력한 프레임워크로 발전했습니다.
- Netty는 Reactor 패턴의 개념을 실전적으로 구현하면서 여러 요소들을 추가했습니다.

## 5 고성능 네트워크 프레임워크: Netty

- Reactor 패턴을 기반으로 한 고성능 이벤트 처리 비동기-논블로킹 네트워크 프레임워크
- [Netty Introduction](../../Netty/Introduction/Introduction.md)에서 설명하는:
	- NIO의 복잡성 추상화
	- 사용하기 쉬운 API 제공
	- 높은 성능과 안정성
- [EventLoop](../../Netty/EventLoop/EventLoop.md)의 핵심 역할
	- EventLoop는 Reactor 패턴의 이벤트 루프를 구현
	- 각 Channel은 전용 EventLoop에 할당
		- 효율적인 스레드 관리
		- 작업 스케줄링
- [Components](../../Netty/Components/Components.md)의 주요 구성
	- EventLoop
		- 이벤트 처리의 핵심
		- 스레드 관리와 작업 실행
	- Channel
		- 네트워크 연결 추상화
		- 이벤트 파이프라인 제공
	- ChannelHandler
		- 데이터 처리 로직
		- 체인 형태의 구성

## 6. 비동기 스트림 처리의 표준화: Reactive Streams

- [ReactiveStream](../ReactiveStream/ReactiveStream/ReactiveStream.md)의 핵심 개념
	- 비동기 스트림 처리 표준
	- 배압(Backpressure) 메커니즘
	- Publisher-Subscriber 모델
- [Backpressure](../ReactiveStream/Backpressure/Backpressure.md)
	- 기존 옵저버 패턴(Push 방식)의 한계에 대해서 설명합니다.
	- Push 방식에서 Pull 방식으로의 전환을 통한 데이터 흐름 제어 대해서 설명합니다.

## 7. Reactive Streams의 구현: Project Reactor

- [Project Reactor](../ProjectReactor/ProjectReactor/ProjectReactor.md)는 현대적인 애플리케이션이 필요로 하는 고성능, 비동기, 논블로킹 프로그래밍을 지원하는
  Java 라이브러리입니다.
- 리액티브 프로그래밍을 위한 다양한 기능을 제공하여, 더 효율적이고 탄력적인 시스템을 구축할 수 있게 해줍니다.

### 7.1 백프레셔 구현

- [Backpressure](../ProjectReactor/Backpressure/Backpressure.md)
- Project Reactor에서의 백프레셔 구현 방식에 대해서 설명합니다.
- Publisher와 Subscriber 간의 데이터 흐름과 흐름 제어의 필요성에 대해서 설명합니다.
- 주요한 4가지 백프레셔 전략에 대해서 설명합니다.
	- ERROR: 초과 시 오류
	- DROP: 초과 데이터 폐기
	- LATEST: 최신 데이터 유지
	- BUFFER: 버퍼링 처리

### 7.2 효율적인 스케줄링

- [Scheduler](../ProjectReactor/Scheduler/Scheduler.md)
	- Project Reactor에서 제공하는 스케줄러의 종류에 대해서 설명합니다.
	- 스케줄러를 사용하는 이유에 대해서 설명합니다.
	- 각각의 스케줄러의 특성과 사용 목적에 대해서 설명합니다.
	- 스케줄러 오퍼레이터를 사용하는 방법에 대해서 설명합니다.

## 8. 웹 애플리케이션으로의 통합: Spring WebFlux

- [SpringWebflux](../../Spring/SpringWebflux/Introduction/Introduction.md)
	- 비동기-논블로킹 웹 스택
	- Reactor 기반 구현
	- 높은 확장성 제공

## 9. 계층 간 통합의 의미

### 9.1 수직적 통합

```
TCP (신뢰성 있는 전송)
  ↓
OS I/O 모델 (효율적인 I/O 처리)
  ↓
Java NIO (추상화된 비동기 I/O)
  ↓
Netty (이벤트 기반 네트워킹)
  ↓
Reactive Streams (표준화된 비동기 스트림)
  ↓
Project Reactor (실용적인 구현)
  ↓
Spring WebFlux (웹 애플리케이션 통합)
```

### 8.2 각 계층의 기여

- TCP: 신뢰성 있는 데이터 전송 보장
- OS: 효율적인 I/O 처리 메커니즘
- NIO: 비동기 I/O의 자바 구현
- Netty: 고성능 네트워크 프레임워크
- Reactive Streams: 비동기 처리 표준화
- Reactor: 실용적인 리액티브 프로그래밍
- WebFlux: 최종 사용자 레벨 프레임워크

:::tip
각 계층은 독립적으로 발전하면서도 상호 보완적인 관계를 유지합니다. 하위 계층의 복잡성은 상위 계층에서 추상화되어 개발자가 더 높은 수준의 추상화에 집중할 수 있게 합니다.
:::