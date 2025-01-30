---
title: "destroy"
description: "Terraform의 destroy 명령어를 상세히 알아봅니다. 인프라 리소스의 안전한 제거부터 종속성 관리까지, 실무에서 알아야 할 모든 내용을 다룹니다."
tags: [ "TERRAFORM", "INFRASTRUCTURE", "AWS", "IaC", "DEVOPS", "CLOUD" ]
keywords: [ "테라폼", "terraform", "테라폼 destroy", "terraform destroy", "인프라 삭제", "infrastructure termination", "리소스 제거", "AWS", "클라우드", "DevOps" ]
draft: false
hide_title: true
---

## 1. terraform destroy 명령어 소개

- `terraform destroy`는 Terraform으로 관리되는 인프라 리소스를 제거하는 명령어입니다
- 현재 Terraform 프로젝트에서 관리하는 모든 리소스를 종료합니다
- 프로젝트 외부의 다른 리소스는 영향받지 않습니다

:::warning
이 명령어는 되돌릴 수 없는 작업을 수행하므로 매우 신중하게 사용해야 합니다.
:::

## 2. 실행 계획 검토

### 2.1 삭제 계획 출력 예시

```bash
$ terraform destroy
Terraform will perform the following actions:

  # aws_instance.app_server will be destroyed
  - resource "aws_instance" "app_server" {
      - ami                          = "ami-08d70e59c07c61a3a" -> null
      - arn                          = "arn:aws:ec2:us-west-2:561656980159:instance/i-0fd4a35969bd21710" -> null
      ...
    }

Plan: 0 to add, 0 to change, 1 to destroy.
```

### 2.2 계획 해석 방법

- `-` 기호: 삭제될 리소스 표시
- `-> null`: 현재 값이 삭제되어 null이 될 것임을 의미
- 요약 정보: 삭제될 리소스 수 표시

## 3. 삭제 프로세스

### 3.1 삭제 확인

```bash
Do you really want to destroy all resources?
  Terraform will destroy all your managed infrastructure, as shown above.
  There is no undo. Only 'yes' will be accepted to confirm.

  Enter a value: yes
```

- 안전성을 위해 `yes`만 허용
- 신중한 검토 후 확인 필요

### 3.2 삭제 진행 과정

```bash
aws_instance.app_server: Destroying... [id=i-0fd4a35969bd21710]
aws_instance.app_server: Still destroying... [id=i-0fd4a35969bd21710, 10s elapsed]
aws_instance.app_server: Destruction complete after 31s

Destroy complete! Resources: 1 destroyed.
```

- 실시간 진행 상황 표시
- 리소스별 삭제 시간 표시
- 최종 삭제 결과 요약

## 4. 종속성 관리

### 4.1 리소스 삭제 순서

- Terraform이 자동으로 적절한 삭제 순서 결정
- 리소스 간 종속성을 고려하여 안전한 순서로 제거
- 예시 시나리오:
	1. 먼저 EC2 인스턴스 종료
	2. 그 다음 연결된 EBS 볼륨 제거
	3. 마지막으로 보안 그룹 삭제

### 4.2 종속성 관련 주의사항

- 순환 종속성 확인
- 외부 종속성 고려
- 수동 개입이 필요한 케이스 식별

## 5. 안전한 삭제를 위한 전략

### 5.1 사전 준비사항

- 백업 확인
	- 중요 데이터 백업
	- 상태 파일 복사
- 영향도 분석
	- 연결된 시스템 확인
	- 사용자 영향 평가

### 5.2 부분 삭제 옵션

```bash
# 특정 리소스만 삭제
terraform destroy -target=aws_instance.app_server

# 특정 모듈의 리소스만 삭제
terraform destroy -target=module.frontend
```

:::tip
`-target` 옵션을 사용하면 특정 리소스나 모듈만 선택적으로 삭제할 수 있습니다.
:::

## 6. 실무 활용 팁

### 6.1 삭제 전 체크리스트

1. 상태 파일 최신 여부 확인
2. 백업 상태 검증
3. 종속성 맵 검토
4. 영향받는 시스템 목록 작성
5. 롤백 계획 수립

### 6.2 문제 해결 시나리오

- 삭제 실패 시 대응
	- 오류 로그 분석
	- 수동 정리 절차
	- 상태 파일 복구
- 부분 삭제 실패
	- 종속성 확인
	- 수동 개입 판단

## 7. 자동화 환경에서의 활용

### 7.1 CI/CD 파이프라인 통합

```bash
# 자동화된 환경에서의 사용 예
terraform destroy -auto-approve -var-file=prod.tfvars
```

### 7.2 안전장치 구현

- 환경별 권한 제한
- 삭제 금지 태그 설정
- 감사 로그 활성화

## 8. 마치며

- `terraform destroy`는 강력하지만 위험할 수 있는 명령어입니다
- 실행 전 철저한 계획과 검토가 필수적입니다
- 종속성 관리와 안전한 삭제 전략이 성공적인 운영의 핵심입니다