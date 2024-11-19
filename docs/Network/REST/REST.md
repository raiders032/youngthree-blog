---
title: "REST 아키텍처의 이해와 구현 가이드"
description: "REST 아키텍처의 핵심 개념과 6가지 제한 조건을 상세히 설명하고, RESTful API 구현을 위한 실용적인 가이드를 제공합니다."
tags: ["RESTFUL_API", "ARCHITECTURE", "WEB"]
keywords: ["REST", "RESTful", "API", "웹 아키텍처", "HTTP", "Uniform Interface", "HATEOAS"]
draft: false
---

## 1. REST의 기본 개념

- REST(Representational State Transfer)는 네트워크 통신을 보다 확장성 있고 유연하게 만들기 위한 디자인 원칙의 모음입니다.
- REST는 시스템의 확장성과 유연성을 보장하기 위한 아키텍처 스타일입니다. 
- RESTful 시스템은 6가지 핵심 제한 조건을 따라야 합니다.

## 2. REST 아키텍처의 6가지 제한 조건

### 2.1 Client-server
- 아키텍처를 단순화시키고 작은 단위로 분리(decouple)함으로써 클라이언트-서버의 각 파트가 독립적으로 개선될 수 있도록 해줍니다.

### 2.2 Stateless
- 서버와 클라이언트가 상대방의 상태를 지속적으로 추적할 필요가 없습니다. 
- 서버는 과거의 요청을 기록하지 않고 모든 요청을 독립적으로 다룹니다. 
- 요청에는 필요한 모든 정보를 담고 있어야 하며, 이로 인해 규모 확장성이 향상됩니다.

### 2.3 Uniform Interface
- 서버와 클라이언트 사이의 공용어로서, 아래 4가지 하위 조건을 포함합니다.
- Uniform Interface는 서버와 클라이언트 간의 통신을 단순화하고, 서로 간의 의존성을 줄여줍니다.
- 이로 인해 서버가 변경되어도 클라이언트에 영향을 미치지 않습니다.

#### 2.3.1 Identification of Resources(자원의 식별)
- 리소스는 HTML 문서, 이미지, 특정 유저 정보 등 모든 것이 될 수 있습니다
- Identification of Resources이란 각 리소스의 안정적인 식별자를 의미합니다.
- 리소스의 상태가 변해도 식별자는 바뀌지 않습니다

#### 2.3.2 Manipulation of Resources Through Representations(메시지를 통한 리소스 조작)
- 클라이언트는 representations을 통해 리소스 조작을 요청할 수 있습니다
- 서버만이 리소스를 직접 변경할 수 있습니다
- HTTP 메서드(GET/POST/PUT/DELETE)를 통해 리소스를 컨트롤합니다
- 클라이언트는 리소스의 상태를 변경하기 위해 서버에 요청을 보냅니다

#### 2.3.3 Self-descriptive Messages(자체 표현 메시지)
- 메시지는 스스로를 설명할 수 있어야 합니다.
- 수신자가 메시지를 받았을 때 메시지를 이해하는데 피요한 모든 정보가 메시지에 포함되어 있어야 합니다.
- 따라서 수신자가 메시지만 봐도 메시지의 의미를 이해할 수 있습니다.

예시 - Self-descriptive 메시지:

```http
Content-Type: text/html

<!DOCTYPE html>
<html>
  <head>
    <title>Home Page</title>
  </head>
  <body>
    <div>Hello World!</div>
  </body>
</html>
```
- 위 예시에서 Content-Type 헤더는 메시지의 타입을 나타내며, 메시지의 내용을 이해하는데 필요한 정보를 제공합니다.
- http 명세에 미디어 타입은 IANA에 등록되어 있으며, 이를 통해 메시지의 타입을 정확히 알 수 있습니다.
  - IANA에 따르면 text/html 명세는 http://www.w3.org/TR/html 에 정의되어 있습니다.
- 명세에는 모든 태그에 대한 설명이 포함되어 있으므로, 수신자는 메시지를 이해할 수 있습니다.

예시 - Self-descriptive하지 못한 메시지:

```json
GET /todos HTTP/1.1
Host: example.org

HTTP/1.1 200 OK
Content-Type: application/json

[
    {"id": 1, "title": "회사 가기"},
    {"id": 2, "title": "집에 가기"}
]
```
- 위 예시에서는 Content-Type 헤더를 통해 메시지의 타입이 application/json임을 알 수 있습니다.
  - HTTP 명세에 미디어 타입은 IANA에 등록되어 있으므로 IANA에서 application/json 명세를 찾을 수 있습니다.
  - application/json 명세에는 JSON 문서 파싱 규칙에 대한 설명이 포함되어 있습니다.
  - 따라서 문서를 성공적으로 파싱할 수 있습니다.
- 하지만 메시지의 내용만으로는 메시지의 의미를 이해하기 어렵습니다.
  - 예를 들어, id는 무엇을 의미하는지, title은 무엇을 의미하는지 알 수 없습니다.
- 따라서 Self-descriptive하지 못한 메시지는 RESTful API의 제한 조건을 만족하지 못합니다.



#### 2.3.4 Hypermedia as the Engine of Application State (HATEOAS)
- 애플리케이션의 상태는 Hyperlink를 통해 전이되어야 합니다.
- `hypermedia`란 클라이언트가 서버로 부터 받은 응답에 클라이언트의 다음 행동을 하이퍼링크로 제공하는 것을 의미합니다.

예시 - HATEOAS:

```http
HTTP/1.1 200 OK
Content-Type: text/html

<!DOCTYPE html>
<html>
  <head>
    <title>Home Page</title>
  </head>
  </body>
    <div>Hello World!</div>
    <a href= “http://www.recurse.com”> Check out the Recurse Center! </a>
    <img src="awesome-pic.jpg">
  </body>
</html>
```
- 위 예시에서는 클라이언트가 서버로부터 받은 응답에 하이퍼링크가 포함되어 있습니다.
- 클라이언트는 하이퍼링크를 통해 다음 행동을 결정할 수 있습니다.

```json
HTTP/1.1 200 OK
Content-Type: application/json
Link: </articles/1>; rel="previous",
      </articles/3>; rel="next"

{
    "title": "The second article",
    "contents": "blah blah..."
}
```
- 위 예시에서는 클라이언트가 서버로부터 받은 응답에 `Link` 헤더가 포함되어 있습니다.
- 클라이언트는 `Link` 헤더를 통해 다음 행동을 결정할 수 있습니다.
- 만약 `Link` 헤더가 없다면 클라이언트는 다음 행동을 결정할 수 없기 때문에 HATEOAS를 만족하지 못합니다.

### 2.4 Caching
- 클라이언트의 응답 캐싱을 통해 서버-클라이언트 간 상호작용을 부분적으로 줄이거나 완전히 제거하여 확장성과 성능을 향상시킵니다.

### 2.5 Layered System
- 클라이언트와 서버 사이에 프록시, 게이트웨이 등의 중간 계층을 둘 수 있습니다.
- 각 계층은 인접한 계층하고만 상호작용합니다.
- 이로 인해 클라이언트는 대상 서버에 직접 연결되었는지, 또는 중간 계층에 연결되었는지 알 수 없습니다.
  - 따라서 시스템의 확장성이 향상됩니다.

### 2.6 Code on Demand (선택사항)
- 서버가 클라이언트에 실행 가능한 코드(예: JavaScript)를 전송하여 기능을 확장할 수 있습니다.

## 3. RESTful API 설계 가이드

### 3.1 URI 설계 원칙
- URI는 정보의 자원을 표현해야 합니다
- 자원에 대한 행위는 HTTP Method로 표현합니다

### 3.2 HTTP 메서드 활용

| METHOD | 역할 |
|--------|------|
| POST   | 리소스 생성 |
| GET    | 리소스 조회 |
| PUT    | 리소스 수정 |
| DELETE | 리소스 삭제 |

## 4. 실제 구현시 고려사항

### 4.1 현실적인 제약
- HTTP 프로토콜을 따르면 Client-Server, Stateless, Cache, Layered System은 자연스럽게 만족됩니다
- Code-on-Demand는 선택사항이므로 필수는 아닙니다
- Uniform Interface의 Self-descriptive messages와 HATEOAS가 가장 구현하기 어려운 부분입니다

### 4.2 해결 방안
- 명확한 API 문서화
- 표준 HTTP 상태 코드 활용
- 하이퍼미디어 링크 적극 활용
- 명확한 리소스 명명 규칙 수립