---
title: "Input Transformation"
description: "AWS EventBridge의 Input Transformation 기능을 상세히 알아봅니다. 이벤트 데이터를 타겟에 전달하기 전에 어떻게 변환하고 커스터마이징할 수 있는지 실제 예제와 함께 설명합니다. JSON Path를 활용한 변수 정의부터 일반적인 문제 해결까지 다룹니다."
tags: ["API_GATEWAY", "AWS", "RESTFUL_API"]
keywords: ["이벤트브릿지", "EventBridge", "input transformation", "인풋 트랜스포메이션", "이벤트 변환", "AWS", "아마존 웹서비스", "JSON Path", "이벤트 처리", "서버리스"]
draft: false
hide_title: true
---

## 1. EventBridge Input Transformation 소개

- EventBridge Input Transformation은 이벤트의 데이터를 타겟으로 전달하기 전에 커스터마이징할 수 있는 강력한 기능입니다. 
- JSON Path를 사용하여 원본 이벤트의 값을 참조하는 변수를 정의하고, 이를 통해 타겟에 전달될 이벤트를 원하는 형태로 변환할 수 있습니다.

## 2. 주요 특징

### 2.1 변수 정의 제한 사항
- 최대 100개의 변수 정의 가능
- 각 변수는 원본 이벤트의 값을 참조
- JSON Path 문법의 부분 지원
    - 점 표기법 (예: $.detail)
    - 대시와 언더스코어
    - 영숫자 문자
    - 배열 인덱스
    - 와일드카드(*)

### 2.2 사전 정의된 변수
- `aws.events.rule-arn`: EventBridge 규칙의 ARN
- `aws.events.rule-name`: EventBridge 규칙의 이름
- `aws.events.event.ingestion-time`: 이벤트 수신 시간 (ISO 8601 타임스탬프)
- `aws.events.event`: 원본 이벤트 페이로드 (detail 필드 제외)
- `aws.events.event.json`: 전체 원본 이벤트 페이로드 (detail 필드 포함)

## 3. Input Transformation 구성하기

### 3.1 Input Path 작성법

- Input Path는 변수를 정의하는 데 사용됩니다. 
- 원본 이벤트에서 값을 추출하고 변수로 사용할 JSON Path를 작성합니다.
- 이렇게 정의된 변수는 Input Template에서 참조할 수 있습니다.

**예시**

```json
{
  "version": "0",
  "id": "7bf73129-1428-4cd3-a780-95db273d1602",
  "detail-type": "EC2 Instance State-change Notification",
  "source": "aws.ec2",
  "account": "123456789012",
  "time": "2015-11-11T21:29:54Z",
  "region": "us-east-1",
  "resources": [
    "arn:aws:ec2:us-east-1:123456789012:instance/i-abcd1111"
  ],
  "detail": {
    "instance-id": "i-0123456789",
    "state": "RUNNING"
  }
}
```
- 위는 EC2 인스턴스 상태 변경 알림의 예시입니다.

```json
{
  "timestamp": "$.time",
  "instance": "$.detail.instance-id",
  "state": "$.detail.state",
  "resource": "$.resources[0]"
}
```
- 위 Input Path는 원본 이벤트에서 `time`, `detail.instance-id`, `detail.state`, `resources[0]` 값을 추출하여 변수로 정의합니다.
- 이렇게 정의된 변수는 Input Template에서 참조할 수 있습니다.

### 3.2 Input Template 작성법

- Input Template은 타겟에 전달할 정보의 템플릿을 정의합니다. 
- 문자열이나 JSON 형식으로 작성할 수 있습니다.

#### 3.2.1 문자열 템플릿 예시

**예시**
```json
"instance <instance> is in <state>"
```
- 위 템플릿은 `instance`와 `state` 변수를 참조하여 문자열을 생성합니다.

**결과**
```json
"instance i-0123456789 is in RUNNING"
```
- 위 결과는 Input Path에서 추출한 변수를 템플릿에 적용한 결과입니다.

#### 3.2.2 JSON 템플릿 예시
**예시**
```json
{
  "instance": <instance>,
  "state": "<state>",
  "instanceStatus": "instance \"<instance>\" is in <state>"
}
```

**결과**
```json
{
  "instance": "i-0123456789",
  "state": "RUNNING",
  "instanceStatus": "instance \"i-0123456789\" is in RUNNING"
}
```
- 위 결과는 Input Path에서 추출한 변수를 템플릿에 적용한 결과입니다.

## 4. 일반적인 문제와 해결 방법

### 4.1 주의사항
- 문자열의 경우 따옴표가 필요합니다
- JSON path 생성 시 유효성 검사가 없습니다
- 존재하지 않는 JSON path를 참조하는 변수는 출력에 나타나지 않습니다
- `aws.events.event.json` 같은 JSON 속성은 JSON 필드의 값으로만 사용 가능합니다

### 4.2 문자열 처리 시 고려사항
- Input Path로 추출된 값은 Input Template에서 이스케이프되지 않습니다
- JSON 객체나 배열을 참조하는 변수가 문자열에 사용될 경우, 내부 따옴표가 제거됩니다
- 문자열 변수값은 자동으로 따옴표가 추가되지만, JSON 객체나 배열을 나타내는 변수에는 따옴표를 추가하지 않아야 합니다

## 5. 마치며

- EventBridge Input Transformation은 이벤트 기반 아키텍처에서 데이터를 효과적으로 가공하고 전달하는 핵심 기능입니다. 
- JSON Path를 활용한 유연한 변수 정의와 다양한 템플릿 옵션을 통해 원하는 형태로 이벤트를 변환할 수 있습니다. 
- 단, 문자열 처리나 JSON 객체 다루기와 같은 몇 가지 주의사항을 잘 이해하고 적용한다면, 더욱 효과적인 이벤트 처리 시스템을 구축할 수 있습니다.