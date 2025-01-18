---
title: "Components"
description: "Netty의 주요 컴포넌트인 Channel, EventLoop, ChannelFuture, ChannelHandler, 그리고 ChannelPipeline의 개념과 동작 방식을 자세히 살펴봅니다. 각 컴포넌트의 역할과 상호작용을 통해 Netty의 아키텍처를 이해해보세요."
tags: [ "NETTY", "CHANNEL", "EVENT_LOOP", "CHANNEL_HANDLER", "JAVA", "NETWORK", "SERVER", "BACKEND" ]
keywords: [ "네티", "netty", "채널", "channel", "이벤트루프", "eventloop", "채널핸들러", "channelhandler", "채널파이프라인", "channelpipeline", "자바", "java", "네트워크", "network", "서버", "server", "백엔드", "backend" ]
draft: false
hide_title: true
---

## 1. Netty 아키텍처 개요

- Netty는 비동기 이벤트 기반 네트워크 애플리케이션 프레임워크입니다.
- Netty의 아키텍처를 이해하기 위해서는 다음 핵심 구성요소들의 역할과 상호작용을 이해하는 것이 중요합니다:
	- Channel: 네트워크 소켓 추상화
	- EventLoop: 이벤트 처리 및 제어 흐름 관리
	- ChannelFuture: 비동기 작업 결과 처리
	- ChannelHandler: 데이터 처리 로직 구현
	- ChannelPipeline: ChannelHandler 체인 관리

## 2. Channel - 네트워크 통신의 기본 단위

- Channel은 네트워크 소켓을 추상화한 인터페이스입니다.
- 기본적인 I/O 작업(bind, connect, read, write)을 제공하며, Java의 기본 Socket 작업을 훨씬 단순화시켜줍니다.
	- Socket: 로우 레벨 네트워킹 기본 클래스
- Netty의 Channel 인터페이스는 Socket을 직접 다루는 복잡성을 크게 줄여주는 API를 제공합니다.

### 2.1 주요 Channel 구현체

- Netty는 다양한 프로토콜과 전송 방식을 지원하기 위해 여러 Channel 구현체를 제공합니다
	- NioSocketChannel: TCP 클라이언트 연결용
	- NioServerSocketChannel: TCP 서버 연결용
	- NioDatagramChannel: UDP 통신용
	- LocalServerChannel: 같은 JVM 내 통신용
	- EmbeddedChannel: 테스트용

## 3. EventLoop - 이벤트 처리의 핵심

- EventLoop는 연결의 수명주기 동안 발생하는 이벤트를 처리하는 핵심 컴포넌트입니다.

### 3.1 EventLoop의 주요 특징

- 하나의 EventLoop는 생명주기 동안 하나의 Thread에 바인딩됨
- 모든 I/O 이벤트는 할당된 Thread에서 처리
- 하나의 Channel은 하나의 EventLoop에 등록
- 하나의 EventLoop는 여러 Channel 담당 가능

:::info
EventLoop 모델의 가장 큰 장점은 Channel의 모든 I/O 작업이 동일한 Thread에서 실행되므로 동기화가 거의 필요 없다는 점입니다.
:::

## 4. ChannelFuture - 비동기 작업 결과 처리

- Netty의 모든 I/O 작업은 비동기로 실행됩니다.
- ChannelFuture는 이러한 비동기 작업의 결과를 나중에 확인할 수 있게 해주는 인터페이스입니다.
- ChannelFuture에는 addListener 메서드를 통해 ChannelFutureListener를 등록할 수 있습니다.
- ChannelFutureListener는 작업이 완료되었을 때 호출되는 콜백 메서드를 정의합니다.
	- 즉 ChannelFutureListener를 통해 비동기 작업의 성공 또는 실패 여부를 확인할 수 있습니다.

### 4.1 ChannelFuture 활용

```java
ChannelFuture future = channel.connect(new InetSocketAddress("127.0.0.1", 8080));
future.addListener(new ChannelFutureListener() {
    @Override
    public void operationComplete(ChannelFuture future) {
        if (future.isSuccess()) {
            System.out.println("Connection successful!");
        } else {
            System.err.println("Connection failed");
            future.cause().printStackTrace();
        }
    }
});
```

- 비동기 작업의 결과를 나타내는 ChannelFuture를 반환 받아, ChannelFutureListener를 등록하여 작업의 성공 여부를 확인합니다.
- ChannelFutureListener의 operationComplete 메서드는 작업이 완료되었을 때 호출되며, 작업의 성공 여부를 확인할 수 있습니다.

:::tip
ChannelFuture는 작업의 완료를 기다리는 동안 애플리케이션이 다른 작업을 수행할 수 있게 해줍니다.
:::

## 5. ChannelHandler - 데이터 처리 로직의 컨테이너

- 애플리케이션 개발자 입장에서 Netty의 주요 컴포넌트는 ChannelHandler입니다.
- ChannelHandler는 Netty 애플리케이션의 핵심 컴포넌트로, 실제 비즈니스 로직이 구현되는 곳입니다.
- ChannelHandler는 네트워크 이벤트에 의해 트리거되는 메서드를 정의하고, 이를 통해 데이터 처리 로직을 구현합니다.

### 5.1 주요 ChannelHandler 타입

- ChannelInboundHandler: 인바운드 이벤트 처리
- ChannelOutboundHandler: 아웃바운드 이벤트 처리
- ChannelDuplexHandler: 인바운드/아웃바운드 이벤트 모두 처리

### 5.2 인코더와 디코더

- 데이터 변환을 위한 특별한 형태의 ChannelHandler입니다:
	- Encoder: Java 객체를 바이트로 변환
	- Decoder: 바이트를 Java 객체로 변환

## 6. ChannelPipeline - 데이터 흐름 관리

- ChannelPipeline은 ChannelHandler들의 체인을 관리하는 컨테이너입니다.

### 6.1 ChannelPipeline의 특징

- 각 Channel은 자신만의 ChannelPipeline을 가짐
- Handler 체인을 통해 데이터가 순차적으로 처리됨
- 인바운드와 아웃바운드 이벤트가 각각 다른 경로로 전파

```plaintext
[인바운드 이벤트 흐름]
Socket → Handler1 → Handler2 → Handler3 → Application

[아웃바운드 이벤트 흐름]
Application → Handler3 → Handler2 → Handler1 → Socket
```

:::warning
ChannelPipeline에 Handler를 추가할 때는 순서가 매우 중요합니다. 잘못된 순서로 인해 데이터 처리가 의도한 대로 동작하지 않을 수 있습니다.
:::

## 7. 부트스트래핑 - 애플리케이션 시작하기

- Netty는 서버와 클라이언트의 시작을 위해 두 가지 부트스트랩 클래스를 제공합니다:
	- ServerBootstrap: 서버용
	- Bootstrap: 클라이언트용

### 7.1 주요 차이점

- ServerBootstrap은 두 개의 EventLoopGroup이 필요 (연결 수락용, 데이터 처리용)
- Bootstrap은 하나의 EventLoopGroup만 필요

## 8. 정리

- Netty의 각 컴포넌트는 명확한 역할을 가지고 있으며, 이들이 유기적으로 결합되어 고성능 네트워크 애플리케이션을 구현할 수 있게 해줍니다.
	- Channel: 네트워크 통신의 기본 단위
	- EventLoop: 이벤트 처리 및 실행 제어
	- ChannelFuture: 비동기 작업 결과 관리
	- ChannelHandler: 실제 비즈니스 로직 구현
	- ChannelPipeline: 데이터 처리 흐름 관리
- 이러한 컴포넌트들의 이해는 Netty 기반 애플리케이션을 개발할 때 필수적입니다.