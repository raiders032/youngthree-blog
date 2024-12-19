---
title: "Notifications"
description: "EC2 Auto Scaling 그룹의 인스턴스 변경 사항을 실시간으로 모니터링하는 방법을 알아봅니다. Amazon SNS를 활용한 알림 설정부터 이벤트 유형별 상세 설명, 실제 구성 방법까지 자세히 다룹니다."
tags: ["EC2", "AWS", "API_GATEWAY", "RESTFUL_API"]
keywords: ["EC2 Auto Scaling", "AWS", "Amazon SNS", "오토스케일링", "알림", "모니터링", "AWS 자동화", "클라우드 모니터링", "인프라 관리", "AWS 운영"]
draft: false
hide_title: true
---

## 1. EC2 Auto Scaling 알림 소개

- EC2 Auto Scaling 그룹은 애플리케이션의 수요에 따라 인스턴스를 자동으로 조정합니다. 
- 이러한 변경사항을 실시간으로 모니터링하기 위해 Amazon SNS(Simple Notification Service)를 활용할 수 있습니다.

### 1.1 알림의 필요성

- 인스턴스 변경 사항 실시간 파악
- 수동 모니터링 작업 제거
- RequestLimitExceeded 오류 방지
- 인프라 변경에 대한 즉각적인 대응 가능

## 2. SNS 알림 이벤트 유형

- EC2 Auto Scaling은 다음과 같은 주요 이벤트에 대한 알림을 제공합니다.
  - `autoscaling:EC2_INSTANCE_LAUNCH`: 인스턴스 시작 성공
  - `autoscaling:EC2_INSTANCE_LAUNCH_ERROR`: 인스턴스 시작 실패
  - `autoscaling:EC2_INSTANCE_TERMINATE`: 인스턴스 종료 성공
  - `autoscaling:EC2_INSTANCE_TERMINATE_ERROR`: 인스턴스 종료 실패

:::info
각 알림은 인스턴스별로 개별적으로 전송되며, best-effort 방식으로 전달됩니다.
:::

## 3. SNS 알림 구성 방법

### 3.1 SNS 토픽 생성

#### SNS 토픽 이름 규칙
- 길이: 1-256자
- 사용 가능 문자: 대소문자, 숫자, 언더스코어(_), 하이픈(-)

### 3.2 알림 설정 단계

1. SNS 토픽 생성
2. 이메일 구독 설정
3. 구독 확인 이메일 승인
4. Auto Scaling 그룹에 알림 구성

### 3.3 AWS CLI를 통한 구성

```bash
aws autoscaling put-notification-configuration \
  --auto-scaling-group-name my-asg \
  --topic-arn arn \
  --notification-types \
    "autoscaling:EC2_INSTANCE_LAUNCH" \
    "autoscaling:EC2_INSTANCE_TERMINATE"
```

## 4. 알림 메시지 구조

- 알림 메시지에는 다음 정보가 포함됩니다:
  - Event: 발생한 이벤트 유형
  - AccountId: AWS 계정 ID
  - AutoScalingGroupName: Auto Scaling 그룹 이름
  - AutoScalingGroupARN: Auto Scaling 그룹 ARN
  - EC2InstanceId: EC2 인스턴스 ID

:::tip
메시지 예시:
```json
{
  "Service": "AWS Auto Scaling",
  "Time": "2016-09-30T19:00:36.414Z",
  "RequestId": "4e6156f4-a9e2-4bda-a7fd-33f2ae528958",
  "Event": "autoscaling:EC2_INSTANCE_LAUNCH",
  "EC2InstanceId": "i-0598c7d356eba48d7"
}
```
:::

## 5. 암호화된 SNS 토픽 사용

### 5.1 KMS 키 정책 설정

- 암호화된 SNS 토픽을 사용할 경우, 다음과 같은 KMS 키 정책이 필요합니다:

```json
{
  "Sid": "Allow service-linked role use of the customer managed key",
  "Effect": "Allow",
  "Principal": {
    "AWS": "arn:aws:iam::123456789012:role/aws-service-role/autoscaling.amazonaws.com/AWSServiceRoleForAutoScaling"
  },
  "Action": [
    "kms:GenerateDataKey*",
    "kms:Decrypt"
  ],
  "Resource": "*"
}
```

:::warning
aws:SourceArn과 aws:SourceAccount 조건 키는 암호화된 토픽에 대한 키 정책에서 지원되지 않습니다.
:::

## 6. 알림 구성 삭제

- 더 이상 알림이 필요하지 않은 경우, 다음 명령어로 구성을 삭제할 수 있습니다:

```bash
aws autoscaling delete-notification-configuration \
  --auto-scaling-group-name my-asg \
  --topic-arn arn
```

## 7. 모범 사례

- 중요 이벤트만 선택적으로 구독하여 알림 피로도 방지
- 자동화된 대응을 위해 EventBridge와 연계 고려
- 암호화가 필요한 경우 KMS 키 정책 신중히 설정
- 정기적인 알림 테스트로 구성 상태 확인

:::tip
수동으로 인스턴스 수를 조정하여 알림이 제대로 작동하는지 테스트해볼 수 있습니다.
:::