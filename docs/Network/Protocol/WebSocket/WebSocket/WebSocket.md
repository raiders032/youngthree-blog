---
title: "WebSocket"
description: "WebSocket 프로토콜의 동작 원리와 HTTP와의 차이점을 상세히 알아봅니다. 실제 구현 예제와 함께 WebSocket의 핵심 개념부터 고급 활용법까지 다루는 종합 가이드입니다."
tags: [ "WEBSOCKET_API", "RESTFUL_API", "API_GATEWAY", "BACKEND", "WEB" ]
keywords: [ "웹소켓", "WebSocket", "실시간통신", "양방향통신", "풀듀플렉스", "full-duplex", "소켓통신", "Socket", "핸드쉐이크", "handshake", "HTTP", "TCP", "네트워크", "프로토콜", "Protocol" ]
draft: false
hide_title: true
---

## 1. WebSocket 프로토콜 개요

- WebSocket은 웹에서 실시간 양방향 통신을 구현하기 위한 표준 프로토콜입니다.
- [RFC 6455](https://tools.ietf.org/html/rfc6455)에 정의된 이 프로토콜은 현대 웹 애플리케이션의 실시간 기능 구현에 필수적인 요소가 되었습니다.

### 1.1 WebSocket의 핵심 특징

- **전이중 통신(Full-Duplex Communication)**
	- 단일 TCP 연결을 통해 클라이언트와 서버가 동시에 데이터를 주고받을 수 있습니다.
	- 별도의 요청 없이도 서버가 클라이언트에게 데이터를 전송할 수 있습니다.
- **효율적인 프로토콜 설계**
	- HTTP와 호환되도록 설계되어 기존 웹 인프라를 활용할 수 있습니다.
	- 80(WS) 및 443(WSS) 포트를 사용하여 기존 방화벽 규칙과 호환됩니다.

### 1.2 활용 사례

- **실시간 채팅 애플리케이션**
- **라이브 스코어보드 및 주식 시세**
- **실시간 협업 도구**
- **게임의 멀티플레이어 기능**
- **IoT 디바이스 모니터링**

## 2. WebSocket 연결 수립 과정

- WebSocket은 HTTP 프로토콜을 기반으로 연결을 수립합니다.
- 이 과정을 통해 클라이언트와 서버가 WebSocket 프로토콜로 전환됩니다. 이를 WebSocket Handshake라고 합니다.
- WebSocket 연결은 HTTP 업그레이드 요청으로 시작됩니다.
- 이 과정을 상세히 살펴보겠습니다.

### 2.1 클라이언트 요청

- 웹소켓 연결을 위해서는 먼저 클라이언트가 HTTP 요청을 보내야 합니다.
- 클라이언트는 다음과 같은 요청을 서버에 전송합니다

```http
GET /chat HTTP/1.1
Host: example.com:8000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

- `Upgrade: websocket`: 클라이언트가 웹소켓 프로토콜로 업그레이드하고자 함을 나타냅니다
- `Connection: Upgrade`: 현재 연결을 다른 프로토콜로 업그레이드하려는 의도를 표시합니다
- `Sec-WebSocket-Key`: 브라우저가 생성한 무작위 16바이트 값을 Base64로 인코딩한 키입니다.
	- 서버가 웹소켓 프로토콜을 지원하는지 확인하는 데 사용됩니다.
	- 매 연결마다 새롭게 생성되어야 합니다.
- `Sec-WebSocket-Version`
	- 클라이언트가 사용하는 웹소켓 프로토콜 버전을 나타냅니다. 일반적으로 "13"입니다
	- 서버가 해당 버전의 WebSocket을 이해하지 못하는 경우, 이해하는 버전을 포함한 Sec-WebSocket-Version 헤더를 다시 보내야 합니다
- 클라이언트는 여기서 확장기능이나 하위 프로토콜을 요청할 수 있습니다
- 또한 User-Agent, Referer, Cookie 또는 인증 헤더와 같은 일반적인 헤더들이 있을 수 있습니다.
	- 이러한 헤더들은 WebSocket과 직접적인 관련이 없으므로 원하는 대로 처리하면 됩니다.

### 2.2 서버 응답

- 서버가 핸드셰이크 요청을 받으면, 프로토콜이 HTTP에서 WebSocket으로 변경됨을 나타내는 특별한 응답을 보내야 합니다.
- 서버는 다음과 같은 응답을 클라이언트에 전송합니다:

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

- `101 Switching Protocols`: 서버가 프로토콜 전환을 승인했음을 나타내는 상태 코드입니다
- `Sec-WebSocket-Protocol`: 클라이언트가 요청한 서브프로토콜 중 서버가 선택한 것을 나타냅니다
- `Sec-WebSocket-Accept`: 클라이언트가 보낸 Sec-WebSocket-Key를 사용하여 생성된 값입니다.
	- 자세한 과정은 아래에서 다루겠습니다.

### 2.3 보안 키 생성 과정

- WebSocket 핸드쉐이크 과정에서 사용되는 보안 키 생성 과정을 살펴보겠습니다.
- 이렇게 복잡해 보이는 과정은 서버가 WebSocket을 지원하는지 클라이언트가 명확히 알 수 있도록 하기 위해 존재합니다.
- 이는 서버가 WebSocket 연결을 수락하지만 데이터를 HTTP 요청으로 해석하는 경우 보안 문제가 발생할 수 있기 때문에 중요합니다.

#### 생성 과정

- **Sec-WebSocket-Key 생성**
	- 클라이언트는 16바이트의 무작위 값을 생성합니다.
	- 이 값을 Base64로 인코딩하여 Sec-WebSocket-Key 헤더의 값으로 전송합니다.
		- 예: `dGhlIHNhbXBsZSBub25jZQ==`
	- 이는 캐시된 응답을 방지하고 유효한 WebSocket 요청임을 확인하기 위한 것입니다.
		- 매 요청마다 새로운 무작위 값을 사용하므로 중간 프록시 서버가 응답을 캐시할 수 없습니다.
		- 무작위성을 통해 일반 HTTP 요청이 아닌 의도된 WebSocket 연결 요청임을 보장합니다.
- **Sec-WebSocket-Accept 생성**
	- 서버는 다음 과정을 통해 응답 키를 생성합니다:
	- 클라이언트가 보낸 Sec-WebSocket-Key에 고정된 GUID 문자열을 추가
		- GUID(Globally Unique Identifier)는 WebSocket 프로토콜에서 고유하게 사용하는 식별자입니다.
		- `258EAFA5-E914-47DA-95CA-C5AB0DC85B11`라는 특정 값으로 고정되어 있습니다.
	- 연결된 문자열의 SHA-1 해시를 계산
	- 해시 값을 Base64로 인코딩
	- 따라서 Key가 `dGhlIHNhbXBsZSBub25jZQ==`였다면, Sec-WebSocket-Accept 헤더의 값은 `s3pPLMBiTxaQ9kYGzzhZRbK+xOo=`가 됩니다
		- 이 과정의 목적:
			- 서버가 실제로 WebSocket 프로토콜을 이해하고 구현했는지 확인합니다.
			- WebSocket을 지원하지 않는 서버는 이 복잡한 키 생성 과정을 구현하지 않았을 것입니다.
- **클라이언트의 검증 과정**
	- 클라이언트도 서버와 동일한 과정으로 예상되는 accept 값을 계산합니다:
		1. 자신이 보낸 Sec-WebSocket-Key + GUID 문자열
		2. SHA-1 해시 계산
		3. Base64 인코딩
	- 이 값과 서버가 보낸 Sec-WebSocket-Accept 값이 일치하는지 확인합니다.
	- 일치하지 않으면 연결을 즉시 종료합니다.

:::note[보안상 주의사항]
이 키 교환은 통신의 무결성이나 기밀성을 보장하지 않습니다. 이는 단순히 WebSocket 프로토콜의 올바른 구현 여부를 확인하는 용도입니다. 실제 보안은 반드시 TLS(WSS)를 통해 구현해야 합니다.
:::

## 3. HTTP vs WebSocket

### 3.1 아키텍처 비교

#### HTTP의 특징

- **요청-응답 모델**
	- 클라이언트의 요청이 있어야만 서버가 응답할 수 있습니다.
	- 각 요청은 독립적이며 상태를 유지하지 않습니다.
- **리소스 중심**
	- URL을 통해 다양한 리소스에 접근합니다.
	- HTTP 메서드(GET, POST 등)로 리소스를 조작합니다.

#### WebSocket의 특징

- **이벤트 기반 모델**
	- 연결이 수립된 후에는 양측 모두 자유롭게 메시지를 전송할 수 있습니다.
	- 단일 연결을 통해 지속적인 통신이 가능합니다.
- **메시지 중심**
	- URL은 초기 연결 수립에만 사용됩니다.
	- 이후의 모든 통신은 메시지 기반으로 이루어집니다.

### 3.2 프로토콜 수준 비교

:::tip[프로토콜 특성 비교]
| 특성 | HTTP | WebSocket |
|------|------|-----------|
| 연결 유지 | 일회성 | 지속적 |
| 통신 방향 | 단방향 | 양방향 |
| 상태 관리 | Stateless | Stateful |
| 헤더 크기 | 매 요청마다 전체 | 초기 연결시에만 |
| 실시간성 | 제한적 | 우수 |
:::

## 4. WebSocket 보안 고려사항

### 4.1 기본 보안 설정

- **WSS(WebSocket Secure) 사용**
	- HTTPS와 마찬가지로 TLS를 통한 암호화 필수
	- 중간자 공격 방지
- **Origin 검증**
	- WebSocket 핸드쉐이크의 Origin 헤더 검증
	- 허용된 출처의 연결만 수락

### 4.2 추가 보안 조치

:::warning[주의사항]

- 인증된 사용자의 연결만 허용
- 메시지 크기 제한 설정
- 연결 수 제한으로 DoS 공격 방지
- 정기적인 연결 상태 확인(Ping-Pong)
  :::

## 5. WebSocket 구현 시 모범 사례

### 5.1 연결 관리

- **자동 재연결 메커니즘**
	- 네트워크 불안정으로 인한 연결 끊김 대비
	- 지수 백오프를 통한 재연결 시도
- **Heartbeat 구현**
	- 정기적인 Ping-Pong 메시지 교환
	- 연결 상태 모니터링
- **Dos 공격 방지**
	- 동일한 클라이언트 IP 주소에서 여러번 연결 시도 차단
	- 예를 들어, 사용자 ID와 IP 주소를 기반으로 WebSocket 데이터를 포함하는 테이블을 만들어 관리합니다.

### 5.2 메시지 처리

- **메시지 형식 표준화**
	- JSON 등 구조화된 형식 사용
	- 메시지 타입과 페이로드 구분
- **에러 처리**
	- 명확한 에러 메시지 정의
	- 클라이언트에 적절한 에러 피드백 제공

## 6. 마치며

- WebSocket은 현대 웹 애플리케이션에서 실시간 기능을 구현하는 데 필수적인 기술입니다.
- HTTP의 한계를 극복하고 진정한 양방향 통신을 가능하게 함으로써, 더욱 풍부하고 인터랙티브한 웹 경험을 제공할 수 있게 되었습니다.

:::tip[추가 학습 자원]

- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [RFC 6455 - WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
- [IETF WebSocket Protocol Registry](https://www.iana.org/assignments/websocket/websocket.xml)
  :::