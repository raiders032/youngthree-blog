---
title: "Application Auto Scaling"
description: "AWS Application Auto Scaling으로 리소스 자동 확장 관리하기: AWS Application Auto Scaling을 사용하여 여러 AWS 서비스의 리소스를 효율적으로 자동 확장하는 방법을 알아봅니다. 스케일링 계획 설정부터 정책 유형까지 상세히 설명합니다."
tags: ["APPLICATION_AUTO_SCALING", "AWS", "CLOUD", "DEVOPS", "INFRASTRUCTURE"]
keywords: ["AWS", "애플리케이션 오토스케일링", "application auto scaling", "오토스케일링", "auto scaling", "AWS 자동확장", "클라우드", "cloud", "인프라", "infrastructure", "데브옵스", "devops", "AWS 서비스", "스케일링", "scaling"]
draft: false
hide_title: true
---
## 1. AWS Application Auto Scaling 소개

- AWS Application Auto Scaling은 AWS 서비스들의 리소스를 자동으로 확장하고 관리할 수 있게 해주는 중앙 집중식 서비스입니다.
- 이 서비스를 통해 애플리케이션의 성능을 일정하게 유지하면서도 최적의 비용으로 운영할 수 있습니다.

### 1.1 주요 특징

- 중앙 집중식 관리: 여러 AWS 서비스의 리소스를 한 곳에서 관리
- 자동 용량 조정: 실시간 수요 변화에 따른 자동 스케일링
- 간편한 설정: 복잡한 알람 설정 없이 스케일링 계획 수립
- 비용 최적화: 필요한 만큼만 리소스를 사용하여 비용 절감

## 2. 지원하는 AWS 서비스

Application Auto Scaling은 다음과 같은 AWS 서비스들과 통합됩니다:

- AppStream 2.0: 플릿 관리
- Aurora: 리플리카 관리
- Comprehend: 문서 분류 및 엔티티 인식 엔드포인트
- DynamoDB: 테이블 및 GSI 처리
- ElastiCache for Redis: 복제 그룹 관리
- EMR: 클러스터 리소스 관리
- ECS: 서비스 스케일링
- KeySpaces: 테이블 처리량 조정
- Lambda: 프로비저닝된 동시성 관리
- MSK: 브로커 스토리지 관리
- Neptune: 클러스터 용량 조정
- SageMaker: 엔드포인트 변형 관리
- Spot Fleet: 요청 용량 조정

## 3. 스케일링 계획 설정

### 3.1 리소스 선택 방법

- CloudFormation 스택 기반 검색
- 태그 기반 검색
- EC2 Auto Scaling 그룹 직접 선택

:::tip
태그를 효율적으로 사용하면 여러 환경(개발, 스테이징, 프로덕션)의 리소스를 쉽게 구분하고 관리할 수 있습니다.
:::

### 3.2 스케일링 정책 유형

#### 대상 추적 스케일링 (Target Tracking)

- 특정 지표의 목표값을 설정하여 자동 조정
- 예: CPU 사용률 70% 유지

#### 단계 스케일링 (Step Scaling)

- 지표 변화에 따라 단계별로 용량 조정
- 예: CPU 사용률이 80% 이상이면 인스턴스 2개 추가

#### 예약 스케일링 (Scheduled Scaling)

- 정해진 일정에 따라 용량 조정
- 예: 업무 시간에 용량 증가, 야간에 감소

## 4. 모범 사례

### 4.1 스케일링 계획 설계

- 적절한 지표 선택
  - 서비스 특성에 맞는 지표 사용
  - 비즈니스 요구사항 반영
- 점진적 확장
  - 급격한 확장보다 단계적 접근 권장
  - 안정성 확보와 비용 제어

### 4.2 모니터링 및 최적화

- CloudWatch와 통합하여 상세 모니터링
- 정기적인 스케일링 정책 검토 및 조정
- 비용 분석 및 최적화

:::warning
급격한 트래픽 변화가 예상되는 경우, 예약 스케일링과 대상 추적 스케일링을 조합하여 사용하는 것이 좋습니다.
:::

## 5. 실제 구현 예시

### 5.1 DynamoDB 테이블 자동 스케일링

```json
{
  "ScalingPlanName": "DynamoDBScaling",
  "ApplicationSource": {
    "TagFilters": [
      {
        "Key": "Environment",
        "Values": ["Production"]
      }
    ]
  },
  "ScalingInstructions": [
    {
      "ServiceNamespace": "dynamodb",
      "ResourceId": "table/Users",
      "ScalableDimension": "dynamodb:table:WriteCapacityUnits",
      "MinCapacity": 5,
      "MaxCapacity": 100,
      "TargetTrackingConfigurations": [
        {
          "PredefinedScalingMetricSpecification": {
            "PredefinedMetricType": "DynamoDBWriteCapacityUtilization"
          },
          "TargetValue": 70.0
        }
      ]
    }
  ]
}
```

### 5.2 ECS 서비스 자동 스케일링

```json
{
  "ScalingPlanName": "ECSServiceScaling",
  "ApplicationSource": {
    "CloudFormationStackARN": "arn:aws:cloudformation:region:account:stack/MyECSStack"
  },
  "ScalingInstructions": [
    {
      "ServiceNamespace": "ecs",
      "ResourceId": "service/MyCluster/MyService",
      "ScalableDimension": "ecs:service:DesiredCount",
      "MinCapacity": 2,
      "MaxCapacity": 10,
      "TargetTrackingConfigurations": [
        {
          "PredefinedScalingMetricSpecification": {
            "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
          },
          "TargetValue": 75.0
        }
      ]
    }
  ]
}
```

## 6. 결론

- AWS Application Auto Scaling은 다양한 AWS 서비스의 리소스를 효율적으로 관리할 수 있게 해주는 강력한 도구입니다.
- 중앙 집중식 관리 방식과 다양한 스케일링 정책을 통해 애플리케이션의 성능을 최적화하면서도 비용을 효율적으로 관리할 수 있습니다.
