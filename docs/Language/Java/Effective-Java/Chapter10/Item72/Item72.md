---
title: "표준 예외를 사용하라"
description: "자바에서 표준 예외를 효과적으로 활용하는 방법에 대해 알아봅니다. 코드의 가독성을 높이고 메모리 사용량을 줄이는 표준 예외 활용 전략과 주요 표준 예외의 적절한 사용 상황을 설명합니다. 불필요한 커스텀 예외를 만들지 않고 기존 표준 예외를 재사용하는 모범 사례를 소개합니다."
tags: [ "EXCEPTION_HANDLING", "JAVA", "BACKEND", "CLEAN_CODE" ]
keywords: [ "자바 표준 예외", "표준 예외", "standard exception", "Java 예외", "Java exception", "IllegalArgumentException", "IllegalStateException", "예외 처리", "exception handling", "커스텀 예외", "custom exception", "예외 확장", "exception extending", "자바", "Java" ]
draft: false
hide_title: true
---

## 1. 개요

- 표준 예외를 사용하면 API가 다른 사람이 익히고 사용하기 쉬워집니다.
- 많은 프로그래머에게 이미 익숙한 규약을 그대로 따르기 때문입니다.
- 예외 클래스 수가 적을수록 메모리 사용량도 줄고 클래스를 적재하는 시간도 적어집니다.

## 2. 많이 사용되는 표준 예외

- 상황에 부합한다면 항상 표준 예외를 재사용하는 것이 좋습니다.
- API 문서를 참고해 그 예외가 어떤 상황에서 던져지는지 꼭 확인해야 합니다.
- 이름뿐만 아니라 던져지는 맥락도 부합할 때만 재사용해야 합니다.

### 2.1 IllegalArgumentException

- 호출자가 인수로 부적절한 값을 넘길 때 던지는 예외입니다.
- 예) 반복 횟수를 지정하는 매개변수에 음수를 건네는 경우 사용합니다.

**IllegalArgumentException를 대체하는 경우**

- 메서드가 던지는 모든 예외를 잘못된 인수(IllegalArgumentException)로 뭉뚱그릴 수 있지만 따로 구분해 쓰는 게 보통입니다.
- 메서드 인수로 null 값을 허용하지 않는 메서드에 null을 건네면 **NullPointerException**을 던집니다.
- 어떤 시퀀스의 허용 범위를 넘는 값을 건넬 때 **IndexOutOfBoundsException**을 던집니다.

### 2.2 IllegalStateException

- 대상 객체의 상태가 호출된 메서드를 수행하기 적합하지 않을 때 던지는 예외입니다.
- 예) 제대로 초기화되지 않은 객체를 사용할 때 던집니다.

**IllegalStateException과 IllegalArgumentException**

- 표준 예외의 주요 쓰임이 상호 배타적이지 않아 예외를 선택하기 어려운 경우가 있습니다.
- 예를 들어 카드 덱을 표현하는 객체가 있고 인수로 건넨 수만큼의 카드를 뽑아 나눠주는 메서드가 있습니다.
  - 남아 있는 카드 수보다 큰 값을 건네면 어떤 예외를 던져야할까요?
  - 인수가 너무 크다고 본다면 IllegalArgumentException을 선택할 것입니다.
  - 덱에 남은 수가 너무 적다고 본다면 IllegalStateException을 선택할 것입니다.
- 이런 상황에서 일반적인 규칙:
  - 인수 값이 무엇이었든 어차피 실패한다면 IllegalStateException을 그렇지 않으면 IllegalArgumentException을 선택하는 것이 좋습니다.

### 2.3 ConcurrentModificationException

- 단일 스레드에서 사용하려고 설계한 객체를 여러 스레드가 동시에 수정하려고 할 때 던집니다.
- 사실 동시 수정을 확실히 검출할 수 있는 안정된 방법이 없으니 이 예외는 문제가 생길 수 있다는 가능성을 알려주는 용도로 사용됩니다.

### 2.4 UnsupportedOperationException

- 클라이언트가 요청한 동작을 대상 객체가 지원하지 않을 때 던집니다.
- 대부분 객체는 자신이 정의한 메서드를 모두 지원하니 흔히 쓰이는 예외는 아닙니다.
- 인터페이스의 메서드를 일부 구현할 수 없을 때 사용합니다.
  - 예) 원소를 넣을 수만 있는 List 구현체에 클라이언트가 remove를 호출하면 이 예외를 던집니다.

## 3. 직접 사용하지 않는 예외

- Exception, RuntimeException, Throwable, Error는 직접 사용하지 말아야 합니다.
- 위 클래스는 추상클래스로 여겨야 합니다.
- 위 예외들은 다른 예외들의 상위 클래스이므로(여러 성격의 예외들을 포괄하는) 안정적으로 테스트할 수 없습니다.

## 4. 예외 확장

- 더 많은 정보를 제공하길 원한다면 표준 예외를 확장해도 좋습니다.
- 단 예외는 직렬화할 수 있으며 직렬화는 많은 부담이 따르니 이 사실만으로도 나만의 예외를 새로 만들지 않아야하는 근거로 충분합니다.