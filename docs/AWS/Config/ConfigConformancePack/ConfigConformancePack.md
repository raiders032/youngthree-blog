---
title: "Config Conformance Pack"
description: "AWS Config Conformance Pack과 Organizational Rules를 사용하여 AWS 리소스의 규정 준수를 자동으로 관리하는 방법을 알아봅니다. 두 서비스의 차이점과 활용 방법을 실제 예제와 함께 상세히 설명합니다."
tags: ["AWS_CONFIG", "CONFORMANCE_PACK", "SECURITY", "COMPLIANCE", "AWS", "CLOUD", "AWS_ORGANIZATIONS"]
keywords: ["AWS Config", "Conformance Pack", "컨포먼스팩", "규정준수", "보안", "클라우드보안", "AWS보안", "Config Rules", "컨피그룰", "AWS 컨피그", "CICD", "CI/CD", "AWS Organizations", "보안자동화", "Organizational Rules", "조직 규칙"]
draft: false
hide_title: true
---

## 1. AWS Config 규정 준수 도구 소개

- AWS Config는 두 가지 주요 규정 준수 관리 도구를 제공합니다 
- Organizational Rules와 Conformance Pack입니다. 
- 각각의 도구는 서로 다른 수준에서 규정 준수를 관리하며, 조직의 요구사항에 따라 적절히 선택하여 사용할 수 있습니다.

### 1.1 Organizational Rules vs. Conformance Pack 비교

:::info
두 도구의 주요 차이점을 이해하면 조직에 적합한 규정 준수 전략을 수립할 수 있습니다.
:::

| 특성 | Organizational Rules | Conformance Pack |
|------|---------------------|------------------|
| 범위 | AWS Organization 전체 | AWS 개별 계정 또는 Organization |
| 평가 유형 | 조직 수준에서 정의되고 적용되는 사전 정의된 규칙에 대한 리소스 평가 | 계정 수준에서 정의되고 적용되는 사전 정의된 규칙에 대한 리소스 평가 |
| 규칙 수 | 단일 규칙 | 다수의 규칙 동시 적용 가능 |
| 준수 수준 | 조직 수준에서 관리 | 계정 수준에서 관리 |

### 1.2 Organizational Rules 소개

- Organizational Rules는 AWS Organizations를 사용하는 환경에서 모든 계정에 걸쳐 일관된 규칙을 적용하고 관리할 수 있게 해주는 기능입니다.

:::tip
Organizational Rules는 중앙집중식 규정 준수 관리가 필요한 대규모 조직에 특히 유용합니다.
:::

## 2. AWS Config Conformance Pack 소개

- AWS Config Conformance Pack은 AWS 리소스의 규정 준수를 자동으로 평가하고 관리하기 위한 통합 솔루션입니다.
- Config Rules와 자동 교정 작업을 하나의 패키지로 묶어 조직 전체에 일관된 보안 정책을 적용할 수 있게 해줍니다.

### 2.1 주요 특징

- YAML 형식의 템플릿 파일로 정의
- AWS 계정 및 리전 또는 AWS Organizations 전체에 배포 가능
- 사전 구성된 샘플 팩 제공
- 사용자 정의 Config Rules 지원
- Lambda 함수를 통한 사용자 정의 평가 로직 구현 가능
- Parameters를 통한 유연한 구성

## 3. Conformance Pack의 구성 요소

### 3.1 Config Rules

Conformance Pack은 두 가지 유형의 Config Rules를 포함할 수 있습니다:

- AWS Config Managed Rules: AWS에서 제공하는 사전 정의된 규칙
- Custom Config Rules: Lambda 함수를 통해 구현하는 사용자 정의 규칙

### 3.2 파라미터 설정

:::info
파라미터를 사용하면 동일한 Conformance Pack을 다양한 환경에서 재사용할 수 있습니다.
:::

예시 파라미터 구성:
```yaml
Parameters:
  IamPasswordPolicyParamMinimumPasswordLength:
    Default: "14"
    Type: String
  AccessKeysRotatedParamMaxAccessKeyAge:
    Default: "90"
    Type: String
```

### 3.3 리소스 정의

Config Rule 리소스는 다음과 같이 정의됩니다:

```yaml
Resources:
  IamPasswordPolicy:
    Properties:
      ConfigRuleName: iam-password-policy
      InputParameters:
        minimumPasswordLength: IamPasswordPolicyParamMinimumPasswordLength
    Type: AWS::Config::ConfigRule
```

## 4. AWS Config Organizational Rules 구현

### 4.1 구성 방법

```yaml
OrganizationConfigRule:
  Type: AWS::Config::OrganizationConfigRule
  Properties:
    OrganizationConfigRuleName: organization-required-tags
    OrganizationManagedRuleMetadata:
      RuleIdentifier: required-tags
      InputParameters:
        tag1Key: "Environment"
        tag1Value: "Production,Development,Staging"
```

### 4.2 적용 전략

- 모든 멤버 계정에 동일한 규칙 적용
- 중앙집중식 모니터링 및 보고
- 자동화된 규정 준수 평가

## 5. 배포 및 관리

### 5.1 배포 방법

Conformance Pack은 다음 두 가지 방법으로 배포할 수 있습니다:

- AWS Config 콘솔 사용
- AWS CLI 사용

:::tip
AWS Organizations를 사용하는 경우, 위임된 관리자 계정을 지정하여 중앙에서 Conformance Pack을 관리할 수 있습니다.
:::

### 5.2 CI/CD 통합

Conformance Pack은 CI/CD 파이프라인과 통합하여 자동화된 규정 준수 관리를 구현할 수 있습니다:

1. Developer가 코드를 CodeCommit에 체크인
2. CodeBuild를 통한 빌드 및 테스트
3. AWS Config Conformance Pack으로 자동 배포
4. CloudFormation을 통한 인프라 변경 사항 적용

## 6. 통합 규정 준수 전략

### 6.1 Organizational Rules와 Conformance Pack 조합

규모가 큰 조직에서는 두 도구를 조합하여 사용하는 것이 효과적입니다:

1. Organizational Rules 사용
    - 조직 전체에 적용되어야 하는 핵심 보안 정책
    - 리소스 태깅 정책
    - 기본 보안 구성 요구사항

2. Conformance Pack 사용
    - 부서별 또는 프로젝트별 특수 요구사항
    - 상세한 보안 구성 검사
    - 복잡한 규정 준수 요구사항

### 6.2 모범 사례

- Organizational Rules로 기본 정책 설정
- Conformance Pack으로 세부 요구사항 구현
- 정기적인 규정 준수 검토 및 보고
- 자동화된 교정 작업 구성

## 7. 모니터링 및 감사

### 7.1 규정 준수 모니터링

- AWS Config 대시보드를 통한 실시간 모니터링
- 규정 준수 상태 추적
- 위반 사항 자동 알림 설정

### 7.2 감사 및 보고

- 정기적인 규정 준수 보고서 생성
- 감사 추적을 위한 로그 관리
- 교정 활동 기록 유지

## 8. 결론

- AWS Config의 Organizational Rules와 Conformance Pack은 각각의 장점을 가진 강력한 규정 준수 관리 도구입니다. 
- 조직의 규모와 요구사항에 따라 두 도구를 적절히 조합하여 사용하면, 효과적이고 확장 가능한 규정 준수 관리 체계를 구축할 수 있습니다. 
- 특히 AWS Organizations를 사용하는 대규모 환경에서는 두 도구의 장점을 모두 활용하여 포괄적인 규정 준수 전략을 수립하는 것이 권장됩니다.