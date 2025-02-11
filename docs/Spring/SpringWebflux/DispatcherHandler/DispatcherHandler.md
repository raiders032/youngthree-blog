---
title: "DispatcherHandler"
description: "Spring WebFlux의 핵심 컴포넌트인 DispatcherHandler의 동작 방식과 아키텍처를 Spring MVC의 DispatcherServlet과 비교하며 상세히 알아봅니다. Front Controller 패턴의 구현과 요청 처리 과정, 주요 컴포넌트들의 역할을 다룹니다."
tags: [ "WEBFLUX", "SPRING", "SPRING_MVC", "REACTIVE", "BACKEND", "JAVA" ]
keywords: [ "디스패처핸들러", "dispatcher handler", "스프링웹플럭스", "spring webflux", "스프링", "spring", "리액티브", "reactive", "디스패처서블릿", "dispatcher servlet", "스프링MVC", "spring mvc", "웹플럭스", "webflux", "프론트컨트롤러", "front controller" ]
draft: false
hide_title: true
---

## 1. DispatcherHandler 소개

- Spring WebFlux의 DispatcherHandler는 Spring MVC의 DispatcherServlet과 유사한 역할을 하는 핵심 컴포넌트입니다.
- 두 프레임워크 모두 Front Controller 패턴을 기반으로 설계되었으며, 중앙 집중형 컴포넌트를 통해 요청을 처리합니다.

:::info[Front Controller 패턴이란?]
Front Controller 패턴은 모든 웹 요청을 단일 진입점에서 처리하는 디자인 패턴입니다.
이 패턴의 주요 특징은:

- 모든 요청이 하나의 컨트롤러를 통과
- 요청에 대한 공통 처리 로직 중앙화
- 보안, 로깅, 라우팅 등의 횡단 관심사를 효율적으로 처리
- 뷰나 비즈니스 로직으로의 제어 흐름을 일관되게 관리
  :::

### 1.1 Front Controller 패턴 구현

- Spring MVC: DispatcherServlet이 모든 웹 요청의 진입점 역할
- Spring WebFlux: DispatcherHandler가 reactive 스택에서 같은 역할 수행

### 1.2 주요 특징

- **공유 알고리즘을 통한 요청 처리**
	- DispatcherHandler는 모든 요청에 대해 일관된 처리 알고리즘을 제공합니다.
- **위임 컴포넌트를 통한 실제 작업 수행**
	- 실제 비즈니스 로직의 처리는 각각의 전문화된 컴포넌트들에게 위임됩니다.
	- 예를 들어, HandlerMapping은 요청 경로 분석을, HandlerAdapter는 실제 핸들러 실행을, HandlerResultHandler는 결과 처리를 담당합니다.
- **유연한 워크플로우 지원**
	- 각 단계별로 다양한 구현체를 제공하고 있어, 개발자는 자신의 요구사항에 맞는 컴포넌트를 선택하거나 직접 구현하여 사용할 수 있습니다.
	- 예를 들어 @RequestMapping 기반의 핸들러뿐만 아니라 함수형 엔드포인트도 동일한 구조 내에서 처리할 수 있습니다.
- **Spring 설정을 통한 위임 컴포넌트 자동 발견**
	- ApplicationContext를 통해 필요한 컴포넌트들을 자동으로 찾아 구성합니다.
	- 개발자는 원하는 컴포넌트를 Bean으로 등록하기만 하면 되며, DispatcherHandler가 이를 자동으로 찾아 적절한 시점에 사용합니다.

## 2. 기본 아키텍처

### 2.1 WebFlux 애플리케이션의 주요 구성요소

Spring WebFlux 애플리케이션은 다음과 같은 주요 컴포넌트들로 구성됩니다

- webHandler라는 빈 이름을 가진 DispatcherHandler: 모든 웹 요청의 진입점으로, 전체 요청 처리 과정을 조율합니다.
- WebFilter와 WebExceptionHandler
	- WebFilter는 요청이 DispatcherHandler에 도달하기 전에 가장 먼저 동작합니다
	- 인증, 로깅, CORS 처리 등 공통적인 전처리 작업을 수행합니다
	- 필터 체인을 통해 순차적으로 실행되며, 각 필터는 다음 필터로 요청을 전달합니다
	- WebExceptionHandler는 전체 처리 과정에서 발생하는 예외를 캐치하여 적절한 오류 응답을 생성합니다
- DispatcherHandler 전용 빈들의 협력 과정
	- HandlerMapping이 요청 URL과 매칭되는 핸들러를 찾습니다
	- 찾은 핸들러는 HandlerAdapter를 통해 실행됩니다
	- 핸들러의 실행 결과는 HandlerResultHandler가 받아 최종 응답으로 변환합니다
	- 자세한 내용은 아래에서 다루겠습니다.

### 2.2 요청 처리 체인 구성

```java
ApplicationContext context = ...
HttpHandler handler = WebHttpHandlerBuilder.applicationContext(context).build();
```

이렇게 구성된 HttpHandler는 서버 어댑터와 함께 사용할 준비가 완료됩니다.

## 3. 특수 빈 타입

- DispatcherHandler는 요청을 처리하고 적절한 응답을 만들기 위해 특별한 빈들에게 작업을 위임합니다.
- 이러한 빈들은 보통 기본 구현체가 제공되지만, 속성을 커스터마이징하거나, 확장하거나, 완전히 다른 구현체로 교체할 수 있습니다.
- DispatcherHandler는 다음과 같은 특수 빈들에게 작업을 위임합니다
	- HandlerMapping: 요청을 적절한 핸들러에 매핑
	- HandlerAdapter: 핸들러를 실행하고 결과를 HandlerResult로 래핑
	- HandlerResultHandler: 핸들러 실행 결과를 처리하고 응답을 완성

### 3.1 HandlerMapping

- HandlerMapping은 요청을 적절한 핸들러에 매핑하는 역할을 합니다.
- 주요 구현체로는:
	- RequestMappingHandlerMapping: @RequestMapping 어노테이션이 붙은 메서드용
	- RouterFunctionMapping: 함수형 엔드포인트 라우트용
	- SimpleUrlHandlerMapping: URI 패턴과 WebHandler 인스턴스의 명시적 등록용

### 3.2 HandlerAdapter

- DispatcherHandler가 매핑된 핸들러를 실제로 호출할 수 있도록 도와주는 역할을 합니다.
- 예를 들어, 어노테이션이 붙은 컨트롤러를 호출하기 위해서는 해당 어노테이션들을 분석해야 하는데, HandlerAdapter가 이러한 세부사항을 DispatcherHandler로부터 숨깁니다.

### 3.3 HandlerResultHandler

- 핸들러 실행 결과를 처리하고 응답을 완성하는 역할을 담당합니다.
- 주요 구현체들은 다음과 같습니다:

| 결과 핸들러 타입                   | 처리하는 반환값                                         | 기본 우선순위           |
|-----------------------------|--------------------------------------------------|-------------------|
| ResponseEntityResultHandler | ResponseEntity (주로 @Controller에서 사용)             | 0                 |
| ServerResponseResultHandler | ServerResponse (주로 함수형 엔드포인트에서 사용)               | 0                 |
| ResponseBodyResultHandler   | @ResponseBody 메서드나 @RestController 클래스의 반환값      | 100               |
| ViewResolutionResultHandler | CharSequence, View, Model, Map 등 모델 속성으로 처리되는 객체 | Integer.MAX_VALUE |

## 4. 요청 처리 프로세스

DispatcherHandler의 요청 처리 과정은 다음과 같습니다:

1. 각 HandlerMapping에 매칭되는 핸들러를 찾도록 요청
2. 첫 번째로 매칭된 핸들러를 사용
3. 적절한 HandlerAdapter를 통해 핸들러 실행
4. 실행 결과를 HandlerResult로 래핑
5. HandlerResultHandler를 통해 처리를 완료하고 응답 작성

## 5. 예외 처리

### 5.1 예외 처리 메커니즘

:::warning
WebFlux에서의 예외 처리는 비동기 특성을 고려해야 합니다:

- HandlerAdapter는 요청 핸들러 실행 중 발생하는 예외를 내부적으로 처리
- 비동기 값을 반환하는 경우 예외가 지연될 수 있음
- DispatchExceptionHandler를 통한 예외 처리 지원
  :::

### 5.2 주요 예외 처리 시점

- 핸들러 매핑 전 발생하는 예외
- WebFilter 실행 중 발생하는 예외
- 핸들러 실행 결과 처리 중 발생하는 예외

## 6. 마치며

- Spring WebFlux의 DispatcherHandler는 Spring MVC의 DispatcherServlet과 유사한 패턴을 따르지만, reactive 스택에 맞게 재설계되었습니다.
- 두 프레임워크 모두 Front Controller 패턴을 통해 요청을 중앙에서 관리하며, 실제 처리는 위임 컴포넌트들에게 맡기는 구조를 가지고 있습니다.
- 이러한 설계는 높은 확장성과 유연성을 제공하며, 각각의 환경에 맞는 최적화된 성능을 제공합니다.