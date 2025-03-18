---
title: "STOMP 프로토콜의 이해와 활용"
description: "WebSocket 통신을 구조화하는 STOMP 프로토콜에 대해 상세히 알아봅니다. 기본 개념부터 WebSocket과의 관계, 프레임 구조, 그리고 Spring Framework와 함께 사용하는 방법까지 실제 예제와 함께 설명합니다."
tags: [ "STOMP", "WEBSOCKET", "WEBSOCKET_API", "BACKEND", "SPRING", "MESSAGING", "WEB" ]
keywords: [ "스톰프", "STOMP", "웹소켓", "WebSocket", "메시징 프로토콜", "messaging protocol", "웹소켓 서브프로토콜", "WebSocket subprotocol", "스프링", "Spring", "백엔드", "backend", "실시간 통신", "real-time communication", "양방향 통신", "bidirectional communication", "pub/sub", "발행-구독", "publish-subscribe" ]
draft: false
hide_title: true
---

## 1. STOMP 프로토콜 소개

- WebSocket 프로토콜은 두 가지 유형의 메시지(텍스트와 바이너리)를 정의하지만, 그 내용은 정의되어 있지 않습니다.
- STOMP(Simple Text Oriented Messaging Protocol)는 WebSocket 위에서 동작하는 메시징 프로토콜로, 클라이언트와 서버가 메시지를 교환하는 방식을 정의합니다.
- STOMP는 클라이언트와 서버가 서브 프로토콜(즉, 더 높은 수준의 메시징 프로토콜)을 협상하는 메커니즘을 제공합니다.
- 서브 프로토콜의 사용은 선택적이지만, 어떤 방식이든 클라이언트와 서버는 메시지 내용을 정의하는 어떤 프로토콜에 동의해야 합니다.
- 즉, WebSocket 자체는 단순히 데이터 전송 채널을 제공할 뿐이며, 주고받는 메시지의 의미나 구조는 정의하지 않습니다.
- STOMP와 같은 서브 프로토콜이 그러한 의미 체계를 제공하여 WebSocket 통신을 더 구조화되고 의미 있게 만들어 줍니다.

### 1.1 STOMP의 기본 개념

- STOMP는 Ruby, Python, Perl 같은 스크립트 언어가 엔터프라이즈 메시지 브로커에 연결하기 위해 처음 만들어졌습니다.
- 일반적으로 사용되는 메시징 패턴의 최소 부분집합을 다루도록 설계되었습니다.
- TCP, WebSocket 등 신뢰할 수 있는 양방향 스트리밍 네트워크 프로토콜 위에서 사용 가능합니다.
- 텍스트 기반 프로토콜이지만, 메시지 페이로드는 텍스트 또는 바이너리 형식 모두 가능합니다.
- STOMP는 메시지의 목적지(destination)를 중심으로 설계되었으며, 발행-구독(publish-subscribe) 패턴을 쉽게 구현할 수 있습니다.

### 1.2 STOMP 프레임 구조

- STOMP는 HTTP를 모델로 한 프레임 기반 프로토콜로, 다음과 같은 구조를 가집니다:

```text
COMMAND
header1:value1
header2:value2

Body^@
```

- 명령(COMMAND): 프레임 유형을 나타내는 문자열(CONNECT, SEND, SUBSCRIBE 등)
- 헤더(Headers): 키-값 쌍으로 구성된 메타데이터
- 본문(Body): 메시지의 실제 내용
- 여기서 ^@는 NULL 문자(ASCII 0)로 메시지의 끝을 표시합니다.

## 2. STOMP 주요 명령어

### 2.1 클라이언트 명령어

- `CONNECT`: 서버와의 연결을 시작합니다.
- `SEND`: 지정된 목적지로 메시지를 전송합니다.
- `SUBSCRIBE`: 특정 목적지의 메시지를 구독합니다.
- `UNSUBSCRIBE`: 기존 구독을 취소합니다.
- `BEGIN`: 트랜잭션을 시작합니다.
- `COMMIT`: 트랜잭션을 완료합니다.
- `ABORT`: 트랜잭션을 중단합니다.
- `ACK`: 메시지 수신을 확인합니다.
- `NACK`: 메시지 처리 실패를 알립니다.
- `DISCONNECT`: 서버와의 연결을 종료합니다.

### 2.2 서버 명령어

- `CONNECTED`: 클라이언트의 CONNECT 요청에 대한 응답으로, 연결이 성공적으로 설정되었음을 알립니다.
- `MESSAGE`: 구독한 목적지로부터 메시지를 클라이언트에게 전달합니다.
- `RECEIPT`: 클라이언트의 요청에 대한 확인 응답을 제공합니다.
- `ERROR`: 오류 상황을 클라이언트에게 알립니다.

## 3. STOMP 메시지 예시

### 3.1 구독 예시

- 클라이언트가 주식 시세를 구독하는 경우:

```text
SUBSCRIBE
id:sub-1
destination:/topic/price.stock.*

^@
```

- `id`: 구독을 식별하는 고유 ID로, 나중에 구독 취소나 메시지 수신 시 참조됩니다.
- `destination`: 구독할 메시지의 주제나 경로를 지정합니다. 여기서는 모든 주식 가격에 대한 토픽을 구독합니다.

### 3.2 메시지 전송 예시

- 클라이언트가 거래 요청을 보내는 경우:

```text
SEND
destination:/queue/trade
content-type:application/json
content-length:44

{"action":"BUY","ticker":"MMM","shares":44}^@
```

- `destination`: 메시지를 보낼 목적지를 지정합니다.
- `content-type`: 메시지 본문의 MIME 타입을 지정합니다.
- `content-length`: 메시지 본문의 바이트 길이를 지정합니다.

### 3.3 서버의 메시지 브로드캐스트 예시

- 서버가 구독한 클라이언트에게 주식 시세를 전송하는 경우:

```text
MESSAGE
message-id:nxahklf6-1
subscription:sub-1
destination:/topic/price.stock.MMM

{"ticker":"MMM","price":129.45}^@
```

- `message-id`: 메시지의 고유 식별자입니다.
- `subscription`: 이 메시지가 어떤 구독에 대한 응답인지 나타냅니다.
- `destination`: 메시지의 원래 목적지입니다.

:::note 서버는 임의로 메시지를 보낼 수 없습니다. 모든 서버 메시지는 특정 클라이언트 구독에 대한 응답이어야 하며, 서버 메시지의 `subscription` 헤더는 클라이언트 구독의
`id` 헤더와 일치해야 합니다.
:::

## 4. STOMP의 목적지(Destination) 패턴

- STOMP 명세에서 목적지의 의미는 의도적으로 모호하게 남겨져 있습니다.
- 목적지는 어떤 문자열이든 될 수 있으며, STOMP 서버가 지원하는 목적지의 의미와 구문을 정의하는 것은 전적으로 서버의 몫입니다.
- 그러나 다음과 같은 일반적인 패턴이 널리 사용됩니다:
  - `/topic/...`: 발행-구독(one-to-many) 메시징에 사용
  - `/queue/...`: 지점 간(one-to-one) 메시징에 사용

## 5. Spring Framework에서의 STOMP 활용

- Spring WebSocket 애플리케이션은 클라이언트에 대한 STOMP 브로커 역할을 합니다.
- 메시지는 `@Controller` 메시지 처리 메서드로 라우팅되거나, 구독을 추적하고 구독된 사용자에게 메시지를 브로드캐스트하는 간단한 인메모리 브로커로 라우팅됩니다.
- Spring을 RabbitMQ, ActiveMQ 등의 전용 STOMP 브로커와 함께 사용하여 실제 메시지 브로드캐스팅을 처리할 수도 있습니다.
- 이 경우 Spring은 브로커와의 TCP 연결을 유지하고, 메시지를 릴레이하며, 브로커로부터 메시지를 연결된 WebSocket 클라이언트로 전달합니다.

### 5.1 Spring에서의 STOMP 설정 예시

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트로 메시지를 보낼 때 사용할 prefix 설정
        config.enableSimpleBroker("/topic", "/queue");
        // 클라이언트에서 메시지를 보낼 때 사용할 prefix 설정
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket 연결 엔드포인트 설정
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .withSockJS(); // SockJS 지원 추가
    }
}
```

### 5.2 메시지 핸들러 예시

```java
@Controller
public class StockController {

    @MessageMapping("/stock/trade")
    @SendTo("/topic/stock/transaction")
    public StockTransaction executeTrade(TradeRequest request) {
        // 거래 처리 로직
        StockTransaction transaction = stockService.executeTrade(request);
        return transaction;
    }
    
    // 특정 사용자에게만 메시지 전송
    @MessageMapping("/stock/quote")
    public void getQuote(QuoteRequest request, Principal principal) {
        StockQuote quote = stockService.getQuote(request.getTicker());
        simpMessagingTemplate.convertAndSendToUser(
            principal.getName(), 
            "/queue/stock/quote", 
            quote
        );
    }
}
```

### 5.3 클라이언트 측 연결 예시 (JavaScript)

```javascript
// STOMP 클라이언트 생성
const socket = new SockJS('/ws');
const stompClient = Stomp.over(socket);

// 연결 수립
stompClient.connect({}, function (frame) {
    console.log('Connected: ' + frame);

    // 토픽 구독
    stompClient.subscribe('/topic/stock/transaction', function (response) {
        const transaction = JSON.parse(response.body);
        displayTransaction(transaction);
    });

    // 개인 메시지 구독
    stompClient.subscribe('/user/queue/stock/quote', function (response) {
        const quote = JSON.parse(response.body);
        displayQuote(quote);
    });
});

// 메시지 전송
function sendTradeRequest(ticker, action, shares) {
    stompClient.send("/app/stock/trade", {},
        JSON.stringify({
            'ticker': ticker,
            'action': action,
            'shares': shares
        })
    );
}
```

## 6. STOMP의 장점과 고려사항

### 6.1 장점

- **표준화된 통신 방식**: WebSocket 위에 구조화된 메시징 계층을 제공하여 클라이언트와 서버 간의 통신 방식을 표준화합니다.
- **발행-구독 패턴**: 간편한 발행-구독 메커니즘을 통해 복잡한 실시간 기능을 쉽게 구현할 수 있습니다.
- **헤더와 메타데이터**: HTTP와 유사한 헤더 시스템을 통해 메시지에 메타데이터를 첨부할 수 있습니다.
- **다양한 클라이언트 지원**: 다양한 언어와 플랫폼에서 STOMP 클라이언트 라이브러리를 사용할 수 있습니다.
- **메시지 브로커 통합**: 메시지 브로커 시스템과의 연동을 통해 확장성 있는 메시징 인프라를 구축할 수 있습니다.

### 6.2 고려사항

- **오버헤드**: STOMP는 WebSocket보다 더 많은 오버헤드를 가질 수 있으므로, 매우 높은 성능이 요구되는 애플리케이션에서는 신중하게 고려해야 합니다.
- **복잡성**: 단순한 양방향 통신만 필요한 경우에는 STOMP가 불필요한 복잡성을 추가할 수 있습니다.
- **목적지 관리**: 복잡한 애플리케이션에서는 목적지 관리 및 권한 설정이 복잡해질 수 있습니다.
- **보안**: WebSocket 연결 자체의 보안과 더불어 메시지 수준의 인증 및 권한 부여를 고려해야 합니다.

## 7. 결론

- STOMP는 WebSocket 통신을 위한 강력하고 유연한 메시징 프로토콜을 제공합니다.
- HTTP 스타일의 프레임 구조와 헤더 시스템을 통해 메시지를 효과적으로 구조화할 수 있습니다.
- Spring Framework와의 훌륭한 통합을 통해 Java 애플리케이션에서 강력한 실시간 기능을 쉽게 구현할 수 있습니다.
- 발행-구독 패턴, 메시지 브로커 시스템과의 통합 등 다양한 메시징 패턴을 지원하여 복잡한 실시간 애플리케이션 개발에 적합합니다.
- WebSocket만으로는 구현하기 복잡한 고급 메시징 기능을 간소화하여 개발자 생산성을 향상시킵니다.

:::tip STOMP 프로토콜의 전체 사양을 검토하여 더 깊이 있는 이해를 얻는 것을 권장합니다. 또한 Spring Framework의 WebSocket 및 STOMP 지원에 대한 공식 문서를 참조하여 실제 애플리케이션에서의 구현 방법을 자세히 알아보세요.
:::