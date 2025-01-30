---
title: "plan"
description: "Terraform의 핵심 명령어인 plan의 모든 것을 알아봅니다. 기본 사용법부터 고급 옵션까지 실무에서 활용할 수 있는 다양한 시나리오와 함께 설명합니다. 인프라 변경사항을 안전하게 관리하고 싶은 데브옵스 엔지니어를 위한 상세 가이드입니다."
tags: [ "TERRAFORM", "PLAN", "IaC", "DEVOPS", "INFRASTRUCTURE", "AWS", "CLOUD" ]
keywords: [ "테라폼", "terraform", "plan", "플랜", "인프라스트럭처", "infrastructure", "코드형 인프라", "IaC", "데브옵스", "devops", "클라우드", "cloud", "AWS", "실행계획", "인프라 관리" ]
draft: false
hide_title: true
---

## 1. Terraform Plan 개요

### 1.1 Plan 명령어의 목적

- Terraform plan은 인프라 변경사항을 실제로 적용하기 전에 미리 확인할 수 있게 해주는 핵심 명령어입니다. 
- plan을 실행하면 Terraform은 다음과 같은 작업을 수행합니다:
  - 현재 인프라의 상태를 확인하여 Terraform 상태 파일을 최신화
  - 현재 구성과 이전 상태를 비교하여 차이점 분석
  - 원격 인프라를 구성과 일치시키기 위한 변경 작업 제안

### 1.2 Plan의 중요성

:::info
plan 명령어는 제안된 변경사항을 실제로 적용하지 않습니다. 이는 변경사항을 적용하기 전에 검토하고 팀과 공유할 수 있게 해주는 안전장치입니다.
:::

## 2. 기본 사용법

### 2.1 기본 명령어

```bash
terraform plan
```

이 명령어는 현재 작업 디렉토리에서 루트 모듈 구성을 찾아 실행 계획을 생성합니다.

### 2.2 계획 파일 저장

```bash
terraform plan -out=plan.tfplan
```

:::tip
계획 파일을 저장하면 나중에 정확히 같은 변경사항을 apply할 수 있습니다. CI/CD 파이프라인에서 특히 유용합니다.
:::

## 3. 특수 계획 모드

### 3.1 삭제 모드 (Destroy Mode)

```bash
terraform plan -destroy
```

- 이 모드는 현재 존재하는 모든 원격 객체를 삭제하기 위한 계획을 생성합니다. 
- 개발 환경과 같이 일시적인 인프라를 관리할 때 유용합니다.

### 3.2 새로고침 전용 모드 (Refresh-Only Mode)

```bash
terraform plan -refresh-only
```

:::warning
이 모드는 Terraform v0.15.4 이상에서만 사용할 수 있습니다.
:::

Terraform 외부에서 발생한 인프라 변경사항을 상태 파일에 반영할 때 사용합니다.

## 4. 고급 옵션

### 4.1 변수 설정

```bash
# 단일 변수 설정
terraform plan -var 'environment=production'

# 변수 파일 사용
terraform plan -var-file="prod.tfvars"
```

### 4.2 리소스 타겟팅

```bash
terraform plan -target=aws_instance.example
```

:::warning
-target 옵션은 특별한 상황에서만 사용해야 합니다. 일상적인 작업에서는 권장되지 않습니다.
:::

### 4.3 상세 종료 코드 활성화

```bash
terraform plan -detailed-exitcode
```

종료 코드로 계획 결과를 파악할 수 있습니다:

- 0: 변경사항 없음
- 1: 오류 발생
- 2: 변경사항 있음

## 5. 실무 활용 팁

### 5.1 자동화 환경에서의 사용

```bash
terraform plan -input=false -lock-timeout=20s
```

CI/CD 파이프라인에서 사용할 때는 다음 옵션들을 고려하세요:

- `-input=false`: 사용자 입력 비활성화
- `-lock-timeout`: 상태 파일 잠금 타임아웃 설정
- `-no-color`: 색상 출력 비활성화

### 5.2 보안 고려사항

:::danger
plan 파일에는 민감한 데이터가 평문으로 저장될 수 있습니다. plan 파일을 안전하게 관리하고 공유해야 합니다.
:::

## 6. 마치며

- Terraform plan은 인프라 변경사항을 안전하게 관리할 수 있게 해주는 강력한 도구입니다. 
- 기본적인 사용법부터 시작해서 다양한 옵션들을 상황에 맞게 활용한다면, 더욱 안정적인 인프라 관리가 가능할 것입니다.

:::tip
실제 변경사항을 적용하기 전에는 항상 plan 결과를 신중하게 검토하는 습관을 들이세요. 특히 프로덕션 환경에서는 더욱 중요합니다.
:::