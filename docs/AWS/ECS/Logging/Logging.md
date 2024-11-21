---
title: "ECS Container Logging"
description: "ECS 컨테이너 로깅 구현 가이드: awslogs와 사이드카 패턴: AWS ECS에서 컨테이너 로깅을 구현하는 두 가지 주요 방법인 awslogs 드라이버와 사이드카 패턴을 상세히 알아봅니다. 각 방식의 장단점과 실제 구현 방법을 예제와 함께 설명합니다."
tags: ["ECS", "AWS", "DOCKER", "LOGGING", "DEVOPS", "CLOUD"]
keywords: ["ECS", "로깅", "logging", "awslogs", "사이드카", "sidecar", "컨테이너", "container", "AWS", "CloudWatch", "로그", "도커", "docker", "데브옵스", "devops", "클라우드", "cloud"]
draft: false
hide_title: true
---

## 1. Amazon ECS 로깅 소개

- Amazon ECS(Elastic Container Service)에서 컨테이너 로깅을 구현하는 것은 애플리케이션 모니터링과 디버깅을 위한 핵심 요소입니다.
- 이 글에서는 ECS에서 사용할 수 있는 두 가지 주요 로깅 방식을 살펴보겠습니다.

## 2. awslogs 드라이버를 사용한 로깅

- awslogs 드라이버는 ECS의 기본 로깅 솔루션으로, 별도의 로그 수집 인프라 없이도 즉시 사용이 가능합니다.
- Fargate와 EC2 런치 타입에서 모두 사용 가능하며, Task Definition에서 설정을 통해 쉽게 구성할 수 있습니다.

### 2.1 awslogs 드라이버 개요

- awslogs 드라이버는 컨테이너의 로그를 직접 CloudWatch Logs로 전송하는 Docker 로깅 드라이버입니다.

:::info
awslogs 드라이버는 ECS의 기본 로깅 솔루션으로, 별도의 로그 수집 인프라 없이도 즉시 사용이 가능합니다.
:::

### 2.2 Launch Type별 구현 방법

#### 2.2.1 Fargate Launch Type

- Fargate에서 awslogs를 사용할 때의 주요 구성 요소:
  - Task Definition에서 logConfiguration 파라미터 설정 필요
  - TaskExecutionRole에 CloudWatch Logs 권한 필요
  - 지원되는 로그 드라이버: awslogs, splunk, awsfirelens

#### 예시 Task Definition
```json
{
  "family": "my-task-definition",
  "containerDefinitions": [
    {
      "name": "my-container",
      "image": "my-app-image:latest",
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/my-task-logs",
          "awslogs-region": "ap-northeast-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 2.2.2 EC2 Launch Type

- EC2 Launch Type에서의 구성 요소: 
  - 컨테이너 인스턴스에 CloudWatch Unified Agent 설치 필요
  - ECS Container Agent 구성 필요
  - EC2 인스턴스에 적절한 IAM 권한 필요

#### EC2 인스턴스 구성
```bash
# /etc/ecs/ecs.config 파일 설정
ECS_AVAILABLE_LOGGING_DRIVERS=["awslogs","json-file"]
```

### 2.3 IAM 권한 설정

:::warning
적절한 IAM 권한이 없으면 로그 전송이 실패할 수 있습니다. 최소 권한 원칙에 따라 필요한 권한만 부여하세요.
:::

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:log-group:/ecs/*"
        }
    ]
}
```

## 3. 사이드카 패턴을 사용한 로깅

### 3.1 사이드카 패턴 소개

사이드카 패턴은 주 컨테이너와 함께 실행되는 별도의 로깅 전용 컨테이너를 사용하는 방식입니다.

:::tip
사이드카 패턴은 로그 수집과 전송을 더 유연하게 제어할 수 있으며, CloudWatch Logs 외의 다른 로그 저장소도 지원할 수 있습니다.
:::

### 3.2 구현 방법

#### 3.2.1 Task Definition 예시
```json
{
  "family": "task-with-sidecar",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "my-app:latest",
      "logConfiguration": {
        "logDriver": "json-file"
      }
    },
    {
      "name": "log-router",
      "image": "fluent/fluentd:latest",
      "mountPoints": [
        {
          "sourceVolume": "docker-sock",
          "containerPath": "/var/run/docker.sock",
          "readOnly": true
        }
      ]
    }
  ]
}
```

### 3.3 사이드카 패턴의 장점

- 로그 수집 및 전송 로직을 애플리케이션과 분리
- 다양한 로그 처리 옵션 지원 (필터링, 포맷팅 등)
- 여러 대상으로 로그 전송 가능
- 로그 수집 설정을 동적으로 변경 가능

## 4. 로깅 방식 선택 가이드

### 4.1 awslogs 드라이버 선택 시기

- 간단한 로깅 요구사항
- CloudWatch Logs만을 대상으로 할 때
- 최소한의 설정으로 빠르게 시작하고 싶을 때

### 4.2 사이드카 패턴 선택 시기

- 복잡한 로그 처리 요구사항
- 여러 로그 대상 지원 필요
- 로그 처리 로직의 동적 변경 필요
- 커스텀 로그 포맷팅/필터링 필요

## 5. 모니터링 및 알림 설정

### 5.1 CloudWatch 알림 구성

```json
{
    "filter-pattern": "ERROR",
    "metric-transformations": [
        {
            "metricName": "ErrorCount",
            "metricNamespace": "ECS/Containers",
            "metricValue": "1"
        }
    ]
}
```

### 5.2 대시보드 구성

- 로그 볼륨 모니터링
- 에러 발생 빈도 추적
- 컨테이너 헬스 체크

## 6. 모범 사례

- 구조화된 로깅 사용 (JSON 형식 권장)
- 로그 보존 기간 설정
- 비용 모니터링 설정
- 정기적인 로그 분석 수행

:::tip
로그 그룹의 보존 기간을 적절히 설정하여 불필요한 비용 발생을 방지하세요.
:::