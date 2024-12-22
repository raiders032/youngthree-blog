---
title: "이벤트 처리 아키텍처 설계"
description: "실시간 채팅 시스템의 이벤트 처리 아키텍처를 설계하고, 기존의 문제점을 해결하는 방안을 제시합니다."
draft: false
hide_title: true
---

## 1. 문제 상황

### 1.1 실시간 채팅의 복잡한 이벤트 처리
- 실시간 채팅 시스템에서는 다양한 형태의 이벤트가 발생하며, 각각의 이벤트는 고유한 처리 방식이 필요합니다.

**주요 이벤트 종류**
- 메시지 관련: 생성, 수정, 삭제, 반응 추가
- 채팅방 관련: 생성, 인원 입장/퇴장, 정보 변경
- 사용자 관련: 상태 변경, 프로필 업데이트
- 시스템 관련: 하트비트, 연결 상태 관리

### 1.2 기존 구현의 문제점

#### 1.2.1 확장성 제약
```kotlin
class EventProcessor {
    fun processEvent(event: Event) {
        when (event.type) {
            EventType.MESSAGE_CREATED -> handleMessageCreated(event)
            EventType.MESSAGE_UPDATED -> handleMessageUpdated(event)
            EventType.USER_JOINED -> handleUserJoined(event)
            // 계속해서 늘어나는 분기문...
        }
    }
}
```
- 단일 클래스가 모든 이벤트 처리 담당
- 새로운 이벤트 추가 시 기존 코드 수정 필요
  - 만약 MESSAGE_DELETED 이벤트 추가 시 MESSAGE_DELETED 이벤트 핸들러와 별개로 EventProcessor에 분기문 추가 필요
- 테스트와 유지보수가 어려움

#### 1.2.2 타입 안전성 부족
```kotlin
fun handleMessageCreated(event: Event) {
    val data = event.data as MessageCreatedData  // 런타임 에러 위험
    // 처리 로직...
}
```
- 타입 캐스팅으로 인한 런타임 에러 위험
- 컴파일 타임에 타입 관련 오류 감지 불가

### 1.3 해결해야 할 과제
1. 이벤트 처리 로직의 분산 및 모듈화
2. 타입 안전성 보장
3. 새로운 이벤트 추가의 용이성
4. 테스트 용이성 확보
5. 유지보수성 향상

## 2. 해결 방안 도출

### 2.1 Spring MVC에서 영감을 얻다
- Spring MVC의 `@RequestMapping`과 `DispatcherServlet` 에서 해결의 실마리를 발견했습니다.

**Spring MVC의 핵심 장점:**
- 어노테이션 기반의 선언적 라우팅
- 중앙 디스패처를 통한 요청 분배
- 명확한 책임 분리

### 2.2 새로운 아키텍처 설계
- 이러한 장점들을 이벤트 처리 시스템에 적용하여 다음과 같은 구조를 설계했습니다.

#### 2.2.1 이벤트 타입 정의
```kotlin
enum class EventType(val dataType: KClass<*>? = null) {
    MESSAGE_CREATED(MessageCreated::class),
    USER_CHANGED(UserChanged::class),
    READ_RECEIPT_UPDATED(ReadReceiptUpdated::class),
    // 타입 안전성이 보장된 이벤트 정의
}
```
- 이벤트 타입을 열거형으로 정의하고, 각 이벤트에 대한 데이터 타입을 명시했습니다.

#### 2.2.2 이벤트 핸들러 인터페이스
```kotlin
interface EventHandler<T> {
    suspend fun handle(context: ExecutionContext, request: T): Mono<Any?>
}
```
- 모든 이벤트 핸들러는 `EventHandler` 인터페이스를 구현하여 이벤트 처리 로직을 정의합니다.
  - 이로 인해 이벤트 핸들러는 비즈니스 로직에 집중할 수 있습니다.
- `ExecutionContext`는 이벤트 처리 과정에서 필요한 정보를 전달하는 컨텍스트 객체입니다.

#### 2.2.3 이벤트 매핑 어노테이션
```kotlin
@Component
@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class EventMapping(val value: EventType)
```
- 각 이벤트 핸들러에는 `@EventMapping` 어노테이션을 사용하여 어떤 이벤트를 처리할지 명시합니다.
  - `value` 속성에는 처리할 이벤트 타입을 지정합니다.
- `@Component` 어노테이션을 통해 Spring Bean으로 등록됩니다.
- 이벤트 핸들러 클래스에는 반드시 `@EventMapping` 어노테이션이 필요합니다.
- EventDispatche가 이 어노테이션을 기준으로 이벤트를 처리할 이벤트 핸들러를 지정합니다.

#### 2.2.4 중앙 디스패처
```kotlin
@Component
class EventDispatcher(context: ApplicationContext) {
    private val eventTypeMap: Map<EventType, EventHandler<Any?>> = context
        .getBeansWithAnnotation(EventMapping::class.java)
        .values
        .filterIsInstance<EventHandler<Any?>>()
        .associateBy { it.javaClass.getAnnotation(EventMapping::class.java)!!.value }
}
```
- `EventDispatcher`는 Spring의 `ApplicationContext`를 통해 등록된 모든 이벤트 핸들러를 수집하고, 이벤트 타입에 따라 적합한 핸들러에 이벤트를 전달합니다.
- Cross-cutting concern을 분리하여 각 이벤트 핸들러는 비즈니스 로직에만 집중할 수 있습니다.
    - 모든 이벤트 핸들러에서 공통적으로 필요한 로직은 `EventDispatcher`에서 처리 할 수 있습니다.
    - 예를 들어, 이벤트 핸들러의 실행 시간 측정, 로깅, 에러 핸들링 등
    - 실제로 `EventDispatcher`는 사용자 정보와 같은 공통 정보를 `ExecutionContext`에 담아 이벤트 핸들러에 전달합니다.

## 3. 개선된 이벤트 처리 시스템

### 3.1 이벤트 핸들러 구현 예시
```kotlin
@EventMapping(EventType.MESSAGE_CREATED)
class MessageCreatedHandler(
    private val localEventPublisher: LocalEventPublisher,
    private val roomSessionManager: RoomSessionManager,
) : EventHandler<MessageCreated> {
    override suspend fun handle(context: ExecutionContext, request: MessageCreated): Mono<Any?> {
        publishEventToRoomMembers(request.roomId, createMessageCreatedEvent(request))
        return Mono.empty()
    }
}
```
- EventHandler 인터페이스를 구현하며 처리할 이벤트 타입을 EventHandler의 제네릭 타입으로 지정합니다.
- `@EventMapping` 어노테이션을 통해 이벤트 핸들러가 처리할 이벤트 타입을 명시합니다.
  - 이로 인해 Spring Bean으로 등록된 이벤트 핸들러는 `EventDispatcher`에 의해 자동으로 매핑됩니다.
- `handle` 메서드에서 이벤트 처리 로직을 구현합니다.
- 필요한 서비스나 컴포넌트는 생성자 주입을 통해 주입받습니다.
- ExecutionContext를 통해 이벤트 처리 과정에서 필요한 정보를 전달받습니다.

### 3.2 시스템의 장점
1. **타입 안전성**
    - 컴파일 타임에 타입 오류 감지
    - 런타임 에러 가능성 감소
2. **모듈화와 확장성**
    - 각 핸들러가 독립적으로 동작
    - 새로운 이벤트 추가가 용이
3. **테스트 용이성**
    - 각 핸들러를 독립적으로 테스트 가능
    - 모의 객체 사용이 쉬움

## 4. 도입 효과

### 4.1 정성적 개선
- 코드 가독성 향상
- 유지보수성 개선
- 개발자 생산성 증가

## 5. 결론
- Spring MVC의 디자인 패턴을 채택하여 이벤트 처리 시스템을 재설계함으로써, 초기에 직면했던 문제들을 효과적으로 해결했습니다. 
- 히 타입 안전성, 확장성, 유지보수성 측면에서 큰 개선을 이루었습니다.