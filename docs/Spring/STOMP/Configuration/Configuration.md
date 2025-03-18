## 1. Spring STOMP 관련 설정


## 2. Enable STOMP

- Spring Boot에서 STOMP를 사용하기 위해서는 `@EnableWebSocketMessageBroker` 어노테이션을 사용하여 WebSocket 메시지 브로커를 활성화해야 합니다.

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfiguration implements WebSocketMessageBrokerConfigurer {

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		// /portfolio is the HTTP URL for the endpoint to which a WebSocket (or SockJS)
		// client needs to connect for the WebSocket handshake
		registry.addEndpoint("/portfolio");
	}

	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
		// STOMP messages whose destination header begins with /app are routed to
		// @MessageMapping methods in @Controller classes
		config.setApplicationDestinationPrefixes("/app");
		// Use the built-in message broker for subscriptions and broadcasting and
		// route messages whose destination header begins with /topic or /queue to the broker
		config.enableSimpleBroker("/topic", "/queue");
	}
}
```

- `registerStompEndpoints` 메서드는 STOMP 엔드포인트를 등록합니다. 
  - 클라이언트는 이 엔드포인트에 연결하여 WebSocket 핸드셰이크를 수행합니다.
  - `/portfolio`는 WebSocket 핸드셰이크를 위한 HTTP URL입니다.
- `configureMessageBroker` 메서드는 메시지 브로커를 설정합니다.
  - `setApplicationDestinationPrefixes`는 STOMP 메시지의 목적지 헤더가 `/app`으로 시작하는 경우, 해당 메시지를 `@MessageMapping` 메서드로 라우팅합니다.
  - `enableSimpleBroker` 메서드는 Spring에서 제공하는 간단한 메시지 브로커를 활성화하는 역할을 합니다. 
  - 이 브로커는 메모리 내에서 동작하며, 주로 개발 및 테스트 환경에서 사용됩니다. 
  - 이 메서드는 특정 접두사로 시작하는 메시지를 브로커로 라우팅하도록 설정합니다.
  - 이 설정을 통해 클라이언트는 /topic 또는 /queue로 시작하는 목적지로 메시지를 보내고, 브로커는 해당 메시지를 적절한 구독자에게 전달합니다.

참고

- https://docs.spring.io/spring-framework/reference/web/websocket/stomp/enable.html