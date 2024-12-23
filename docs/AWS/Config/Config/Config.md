---
title: "Config"
description: "AWS Config를 통한 클라우드 리소스 감사와 규정 준수 관리 방법을 상세히 알아봅니다. 구성 기록부터 자동 수정까지, AWS Config의 핵심 기능과 실제 활용 사례를 다룹니다."
tags: ["AWS_CONFIG", "AWS", "CLOUD", "DEVOPS", "SECURITY", "AUTOMATION", "EC2", "CLOUDWATCH", "CLOUDTRAIL"]
keywords: ["AWS Config", "클라우드 감사", "리소스 관리", "규정 준수", "구성 관리", "보안 설정", "자동화", "모니터링", "감사", "컨피그", "AWS 구성", "클라우드 거버넌스", "리소스 추적", "보안 규정", "컴플라이언스", "CloudWatch", "CloudTrail"]
draft: false
hide_title: true
---

## 1. AWS Config 개요

- AWS Config는 AWS 리소스의 구성을 감사하고 평가하는 서비스입니다. 
- 이 서비스는 다음과 같은 핵심 기능을 제공합니다:
  - AWS 리소스의 구성 변경사항 기록 및 추적
  - 규정 준수 상태 모니터링 및 평가
  - 구성 변경 이력 조회 및 분석

## 2. AWS Config의 주요 특징

### 2.1 리소스 구성 관리

- 모든 리소스 구성 변경사항을 자동으로 기록
- 시간에 따른 구성 변경 이력 추적
- S3 버킷에 구성 데이터 저장 (Athena로 분석 가능)
- 리전별 서비스이며, 여러 리전과 계정에 걸쳐 집계 가능

### 2.2 일반적인 사용 사례

- 다음과 같은 보안 관련 질문들을 해결할 수 있습니다:
  - 보안 그룹에 SSH 접근이 무제한으로 허용되어 있는가?
  - S3 버킷에 공개 액세스가 설정되어 있는가?
  - Application Load Balancer의 구성이 시간에 따라 어떻게 변경되었는가?

## 3. Config Rules

### 3.1 규칙 유형

- AWS 관리형 규칙
  - AWS에서 제공하는 사전 정의된 규칙
  - [ManagedRule.md](../ManagedRule/ManagedRule.md) 참고
- 사용자 정의 규칙
  - Lambda 함수를 통해 직접 정의한 규칙
  - 예시: EBS 디스크가 gp2 유형인지 확인
  - 예시: EC2 인스턴스가 t2.micro 유형인지 확인

### 3.2 규칙 평가

- 트리거 방식:
	- 구성 변경 시 자동으로 평가합니다.
	- 정기적인 간격으로 평가합니다.
- 주의사항: 규칙은 작업을 방지하지 않고 평가만 수행합니다.

### 3.3 비용

- 무료 티어 없음
- 구성 항목당 $0.003 (리전별)
- 규칙 평가당 $0.001 (리전별)

## 4. 자동 수정 및 알림

### 4.1 자동 수정 기능

- SSM Automation Documents를 사용한 비준수 리소스 자동 수정
- AWS 관리형 또는 사용자 정의 Automation Documents 활용
- Lambda 함수를 호출하는 사용자 정의 Automation Documents 생성 가능
- 자동 수정 후에도 비준수 상태가 지속될 경우를 위한 재시도 설정 가능

### 4.2 알림 구성

- EventBridge
  - EventBridge를 사용하여 비준수 상태의 리소스에 대한 알림을 트리거할 수 있습니다.
- SNS
  - SNS를 사용하여 설정 변경과 규칙 평가 결과에 대한 정보를 sns topic으로 전송할 수 있습니다.

## 5. CloudWatch vs CloudTrail vs Config

- **CloudWatch**: 성능 모니터링, 이벤트 및 경고, 로그 분석
- **CloudTrail**: API 호출 기록, 특정 리소스에 대한 트레일 정의
- **Config**: 구성 변경 기록, 규정 준수 평가, 구성 변경 및 준수 상태 타임라인 제공

## 6. 실제 사용 시나리오: 태그 기반 EC2 인스턴스 관리

### 6.1 시나리오 설명

- 한 회사의 SysOps 관리자가 AWS 계정의 보안과 규정 준수를 유지 관리하고 있습니다.
- 회사 정책에 따라 모든 EC2 인스턴스에는 부서 태그가 있어야 합니다.
- 부서 태그가 없는 EC2 인스턴스는 실시간으로 종료되어야 합니다.

### 6.2 해결 방안

- AWS Config 규칙 생성
	- `required-tags` 관리형 규칙을 사용하여 비준수 리소스를 식별합니다.
	- 이 규칙은 특정 태그(여기서는 '부서' 태그)가 없는 EC2 인스턴스를 비준수로 표시합니다.
- 자동 수정 구성
	- `AWS-TerminateEC2Instance` 자동화 문서를 사용하여 자동 수정을 구성합니다.
	- 이 자동화 문서는 비준수로 표시된 EC2 인스턴스를 자동으로 종료합니다.

### 6.3 구현 단계

- AWS Config 콘솔에서 새 규칙 생성
	- 'required-tags' 관리형 규칙 선택
	- 규칙 파라미터 설정: `tag1Key=department`
- 자동 수정 설정
	- 규칙 세부 정보 페이지에서 '수정 작업' 선택
	- 'AWS-TerminateEC2Instance' 자동화 문서 선택
	- 필요한 IAM 역할 및 권한 설정
- 규칙 활성화 및 모니터링
	- 규칙을 활성화하고 평가 결과 모니터링
	- 비준수 인스턴스가 자동으로 종료되는지 확인

### 6.4 이점

- 자동화된 규정 준수: 수동 개입 없이 회사 정책을 자동으로 적용할 수 있습니다.
- 실시간 대응: 비준수 인스턴스를 즉시 감지하고 조치를 취할 수 있습니다.
- 감사 및 보고: AWS Config를 통해 모든 변경 사항과 조치를 추적하고 보고할 수 있습니다.

## 7. 모범 사례

- 중요한 리소스 변경에 대한 알림 설정
- 규정 준수 요구사항에 따른 자동 수정 규칙 구성
- 정기적인 규정 준수 보고서 생성 및 검토
- 다중 계정 환경에서의 집계된 뷰 활용

## 8. 결론

- AWS Config는 클라우드 환경의 규정 준수와 보안을 유지하는 데 필수적인 도구입니다. 
- 자동화된 감사, 평가, 수정 기능을 통해 조직의 보안 정책을 효과적으로 실행할 수 있으며, 실제 사용 사례에서 볼 수 있듯이 복잡한 규정 준수 요구사항도 효율적으로 관리할 수 있습니다.