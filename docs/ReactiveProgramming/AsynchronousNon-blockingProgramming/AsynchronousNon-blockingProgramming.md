---
title: "Asynchronous Non-blocking Programming"
---

## 1. Asynchronous Non-blocking Programming

- OS레벨부터 애플리케이션 레벨에 이르기까지 비동기-논블로킹 프로그래밍에 대해 알아봅니다.

## 2. OS

- 운영체제 수준에서 제공하는 I/O 모델과 시스템 콜은 모든 비동기-논블로킹 프로그래밍의 기초가 됩니다
- [IO Models](../../ComputerScience/OS/IOModels/IOModels.md)
	- 동기/비동기 블로킹/논블로킹의 개념과 I/O 모델에 대해 설명합니다.
	- 제어권에 따라 블로킹/논블로킹을 구분하고, 작업 완료 여부에 따라 동기/비동기를 구분합니다.
	- I/O 모델의 조합: 동기-블로킹, 동기-논블로킹, 비동기-논블로킹에 대해 설명합니다.
	- 각 모델의 특징과 장단점을 이해하면 상위 레벨 구현의 동작 원리를 더 잘 이해할 수 있습니다.
- [OS Socket](../../ComputerScience/OS/Socket/Socket.md)
	- Socket에 대한 개요와 File Descriptor에 대해 설명합니다.
	- Socket 또한 파일이라는 개념을 이해하면, 소켓을 통한 입출력을 이해하는 데 도움이 됩니다.
- [IO Multifexing](../../ComputerScience/OS/IOMultifexing/IOMultifexing.md)
	- select, poll, epoll 시스템 콜의 동작 방식을 설명합니다.
	- 이러한 시스템 콜들이 Java NIO나 Netty같은 상위 구현의 기반이 됩니다.
- [Multiple Connections](../../ComputerScience/OS/MultipleConnections/MultipleConnections.md)
	- 실제 서버 구현에서 다중 접속을 처리하는 다양한 방식을 소개합니다.
	- 블로킹 TCP 서버의 문제점을 설명하고, 다중 접속 서버를 구현하는 방법을 소개합니다.
	- 대표적인 방법으로 멀티 프로세싱, 멀티 스레딩, I/O 멀티플렉싱을 소개합니다.
	- 블로킹 방식의 한계부터 현대적인 비동기 방식까지의 발전 과정을 이해할 수 있습니다.

## 3. Java

- Java의 I/O 처리 방식은 전통적인 블로킹 방식에서 현대적인 논블로킹 방식으로 발전해왔습니다
- [Java OIO](../../Language/Java/IO/IO.md)
	- Java의 전통적인 블로킹 I/O 모델을 설명합니다.
	- 단순하지만 성능상 한계가 있는 이 모델을 이해하면 NIO의 필요성을 더 잘 이해할 수 있습니다.
- [Java NIO](../../Language/Java/NIO/NIO.md)
	- 현대적인 논블로킹 I/O 모델을 다룹니다.
	- Channel, Buffer, Selector 등 핵심 개념과 실제 구현 방법을 배울 수 있습니다.
  - Direct Buffer와 Non-Direct Buffer의 차이점을 이해하고, 각각의 장단점을 파악할 수 있습니다.

## 4. Reactor Pattern

### 4.1 Reactor Pattern 개요

- Reactor 패턴은 동시에 들어오는 여러 종류의 이벤트를 처리하기 위한 동시성을 다루는 디자인 패턴 중 하나입니다.
- Reactor 패턴은 이벤트 기반 아키텍처의 근간이 되는 패턴입니다.
- 동시에 들어오는 여러 이벤트를 효율적으로 처리하기 위한 구조를 제공합니다.
- 주요 구성요소
	- Reactor: 무한 반복문을 실행해 이벤트가 발생할 때까지 대기하다가 이벤트가 발생하면 처리할 수 있는 핸들러에게 디스패치합니다. 이벤트 루프라고도 부릅니다.
	- Handler: 이벤트를 받아 필요한 비즈니스 로직을 수행합니다.
- 이벤트 루프는 다음 작업을 반복합니다.
	- 이벤트가 발생하기를 대기한다.
	- 이벤트가 발생하면 처리할 수 있는 핸들러에 이벤트를 디스패치한다.
	- 핸들러에서 이벤트를 처리한다.
	- 다시 1~3 단계를 반복한다.

### 4.2 구현체

- Netty
- node.js
- 각 구현체들은 Reactor 패턴을 기반으로 하면서도 고유한 특징을 가지고 있습니다.

### 4.3 NIO로 구현해보는 간단한 Event Loop 예시

### 4.4 이벤트 루프를 블록하면 안 되는 이유

- 이벤트 루프의 블로킹은 전체 시스템의 성능에 치명적인 영향을 미칠 수 있습니다.
- 결과적으로 핸들러에서 스레드 블록을 유발하는 작업이나 시간이 오래 걸리는 작업을 처리하는 경우에는 해당 시간 동안 이벤트 루프가 블록되기 때문에 발생한 이벤트를 처리하는 시간도 지연됩니다.
- 이벤트 루프가 블록되는 문제를 피하고 높은 응답성을 유지하기 위해서는 스레드 블록을 유발하는 작업은 이벤트 루프가 아닌 별도 스레드에서 수행해야 합니다.
- 또한 핸들러에 블록을 유발하는 작업은 없지만 이벤트를 처리하는 로직 자체가 CPU가 많이 필요한 작업을 포함하고 있어서 시간이 많이 필요한 경우에는 작업 범위를 분할해서 처리해야 합니다.

## 5. Netty

- 현대적인 네트워크 애플리케이션 프레임워크입니다:
- [Introduction.md](../../Netty/Introduction/Introduction.md)
	- Netty의 기본 개념과 아키텍처를 설명합니다.
- [Components.md](../../Netty/Components/Components.md)
	- EventLoop, Channel, ChannelHandler, ChannelPipeline 등 주요 컴포넌트를 상세히 다룹니다.
	- 각 컴포넌트가 어떻게 협력하여 비동기-논블로킹 처리를 구현하는지 이해할 수 있습니다.

## 6. Reactive Streams

- Reactive Streams는 non-blocking backpressure를 갖춘 비동기 스트림 처리를 위한 표준을 제공하는 것을 목적으로 합니다.
- [ReactiveStream 개요](../ReactiveStream/ReactiveStream/ReactiveStream.md)
	- Reactive Streams의 핵심 개념과 특징을 설명합니다.
- [Backpressure란?](../ReactiveStream/Backpressure/Backpressure.md)
	- 전통적인 옵저버 패턴의 Push 방식의 한계와 이를 해결하는 백프레셔 메커니즘을 설명합니다.
	- 실제 시스템에서 부하 제어가 어떻게 이루어지는지 배울 수 있습니다.

## 7. Project Reactor

- Project Reactor는 Reactive Streams의 대표적인 구현체로써, Subscriber의 처리 능력을 존중하여 데이터 스트림을 비동적으로 처리할 수 있게한다.
- [Backpressure](../ProjectReactor/Backpressure/Backpressure.md)
	- Project Reactor의 백프레셔 구현 방식을 설명합니다.
  - ERROR, DROP, BUFFER, LATEST 네 가지 백프레셔 전략을 설명합니다.
- [Scheduler](../ProjectReactor/Scheduler/Scheduler.md)
	- 비동기 처리를 위한 스케줄러의 동작 방식을 다룹니다.

## 8. Spring WebFlux

- Spring WebFlux는 Spring Framework의 일부로써, 비동기-논블로킹 웹 애플리케이션을 개발할 수 있게 해줍니다.
- [SpringWebflux.md](../../Spring/SpringWebflux/SpringWebflux.md)
	- Spring WebFlux의 주요 개념과 특징을 설명합니다.