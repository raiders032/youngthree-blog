---
title: "EKS Logging"
description: "Amazon EKS 로깅 가이드: CloudWatch Agent와 로그 드라이버의 역할 이해하기: Amazon EKS 환경에서 CloudWatch Agent와 로그 드라이버(Fluent Bit/Fluentd)의 역할과 차이점을 명확히 설명합니다. 각 구성요소의 목적과 함께 사용해야 하는 이유를 알아봅니다."
tags: ["EKS", "CLOUDWATCH", "KUBERNETES", "CONTAINER", "MONITORING", "LOGGING", "AWS", "DEVOPS"]
keywords: ["eks", "amazon eks", "kubernetes", "쿠버네티스", "로깅", "logging", "클라우드워치", "cloudwatch", "컨테이너", "container", "모니터링", "monitoring", "데브옵스", "devops", "플루언트비트", "fluent bit", "플루언트디", "fluentd"]
draft: false
hide_title: true
---

## 1. EKS 로깅의 두 가지 핵심 구성요소

- EKS 환경에서 완전한 모니터링을 위해서는 CloudWatch Agent와 로그 드라이버가 모두 필요합니다. 
- 각각이 서로 다른 목적으로 동작하기 때문입니다.

:::info[중요]
CloudWatch Agent와 로그 드라이버는 상호 보완적인 관계이며, 둘 다 설치하여 사용하는 것이 권장됩니다.
:::

### 1.1 CloudWatch Agent의 역할
- 노드 수준의 시스템 메트릭 수집
    - CPU 사용률
    - 메모리 사용량
    - 디스크 I/O
    - 네트워크 트래픽
- 수집한 메트릭을 CloudWatch로 전송
- 커스텀 메트릭 설정 가능

### 1.2 로그 드라이버(Fluent Bit/Fluentd)의 역할
- 컨테이너 로그 수집 (`/var/log/containers`에 저장)
- 애플리케이션 로그 수집
- 수집한 로그를 CloudWatch Logs로 전송
- 로그 포맷팅 및 필터링 가능

## 2. 두 구성요소가 모두 필요한 이유

### 2.1 데이터 유형의 차이
- CloudWatch Agent: 수치형 메트릭 데이터
- 로그 드라이버: 텍스트 형태의 로그 데이터

### 2.2 모니터링 범위의 차이
- CloudWatch Agent: 노드 수준의 시스템 상태
- 로그 드라이버: 컨테이너와 애플리케이션 수준의 이벤트

## 3. CloudWatch Container Insights와의 통합

Container Insights는 위 두 구성요소가 수집한 데이터를 활용하여:
- 통합 대시보드 제공
- 노드, 파드, 컨테이너 수준의 모니터링
- 성능 지표 시각화
- 알람 설정 기능 제공

## 4. 구성 예시

### 4.1 CloudWatch Agent 설정
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: amazon-cloudwatch
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: cloudwatch-agent
  namespace: amazon-cloudwatch
spec:
  selector:
    matchLabels:
      name: cloudwatch-agent
  template:
    metadata:
      labels:
        name: cloudwatch-agent
    spec:
      containers:
        - name: cloudwatch-agent
          image: amazon/cloudwatch-agent:latest
          # ... 설정 생략
```

### 4.2 Fluent Bit 설정
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: logging
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
  namespace: logging
spec:
  selector:
    matchLabels:
      name: fluent-bit
  template:
    metadata:
      labels:
        name: fluent-bit
    spec:
      containers:
        - name: fluent-bit
          image: public.ecr.aws/aws-observability/aws-for-fluent-bit:latest
          # ... 설정 생략
```

## 5. 주의사항

:::warning
- 두 구성요소는 각각 별도의 IAM 권한이 필요합니다.
- 리소스 사용량과 비용 최적화를 위해 적절한 설정이 필요합니다.
- 로그 보존 기간과 필터링 설정을 통해 비용을 관리해야 합니다.
  :::