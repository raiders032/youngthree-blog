---
title: "apply"
description: "Terraform의 apply 명령어를 상세히 알아봅니다. 실행 계획 검토부터 실제 인프라 생성까지, 안전하고 효과적인 인프라 배포 방법을 실무 예제와 함께 설명합니다."
tags: [ "TERRAFORM", "INFRASTRUCTURE", "AWS", "IaC", "DEVOPS", "CLOUD" ]
keywords: [ "테라폼", "terraform", "테라폼 apply", "terraform apply", "인프라 배포", "infrastructure deployment", "실행 계획", "execution plan", "AWS", "클라우드", "DevOps", "IaC" ]
draft: false
hide_title: true
---

## 1. terraform apply 명령어 소개

- `terraform apply`는 Terraform 구성을 실제 인프라에 적용하는 명령어입니다
- 이 명령어는 구성 파일에 정의된 상태로 인프라를 생성, 수정, 또는 삭제합니다
- 실행 전 계획을 보여주고 사용자의 확인을 받아 안전한 배포를 보장합니다

## 2. 실행 계획(Execution Plan) 이해하기

### 2.1 계획 출력 형식

```hcl
$ terraform apply

Terraform will perform the following actions:

  # aws_instance.app_server will be created
  + resource "aws_instance" "app_server" {
      + ami                          = "ami-830c94e3"
      + arn                          = (known after apply)
      ...
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

### 2.2 계획 해석 방법

- 리소스 변경 표시:
	- `+`: 새로 생성될 리소스
	- `-`: 삭제될 리소스
	- `~`: 수정될 리소스
	- `->`: 교체될 리소스
- `(known after apply)`: 리소스 생성 후에만 알 수 있는 값
	- 예: AWS EC2 인스턴스의 ARN, IP 주소 등
- 요약 정보: 추가, 변경, 삭제될 리소스 수 표시

:::info
Git의 diff 형식과 유사하여, 변경사항을 직관적으로 이해할 수 있습니다.
:::

## 3. 인프라 변경 승인과 적용

### 3.1 변경 승인 프로세스

```bash
Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes
```

- 실행 계획 검토 후 `yes`를 입력하여 변경 승인
- 안전성을 위해 `yes` 외의 다른 값은 거부됨
- 이 단계에서 안전하게 취소 가능

### 3.2 적용 과정 모니터링

```bash
aws_instance.app_server: Creating...
aws_instance.app_server: Still creating... [10s elapsed]
aws_instance.app_server: Still creating... [20s elapsed]
aws_instance.app_server: Creation complete after 36s [id=i-01e03375ba238b384]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

- 실시간으로 진행 상황 표시
- 작업 소요 시간 확인 가능
- 생성된 리소스의 ID 등 중요 정보 표시

:::tip
리소스 생성에 시간이 걸리는 경우(예: EC2 인스턴스), Terraform이 완료될 때까지 대기합니다.
:::

## 4. 주요 옵션과 활용

### 4.1 자주 사용되는 옵션

- `-auto-approve`: 승인 과정 생략
- `-target`: 특정 리소스만 적용
- `-var-file`: 변수 파일 지정
- `-refresh=false`: 상태 새로고침 건너뛰기

### 4.2 자동화된 배포

```bash
# CI/CD 파이프라인 예시
terraform apply -auto-approve -var-file=prod.tfvars
```

:::warning
`-auto-approve` 옵션은 CI/CD 환경에서만 사용하고, 수동 작업 시에는 권장하지 않습니다.
:::

## 5. 문제 해결과 주의사항

### 5.1 일반적인 문제 해결

- 리전 설정 확인
	- AWS 프로바이더 블록의 리전과 콘솔 리전 일치 필요
- VPC 설정 검증
	- 기본 VPC 삭제 여부 확인
	- 서브넷 가용성 검사

### 5.2 안전한 적용을 위한 체크리스트

- 실행 계획 상세 검토
- 영향 받는 리소스 수 확인
- 중요 데이터 손실 가능성 점검
- 비용 영향 평가

## 6. 실무 활용 팁

### 6.1 대규모 변경 관리

- 작은 단위로 나누어 적용
- `-target` 옵션 활용
- 의존성 순서 고려

### 6.2 운영 환경 적용 전략

- 스테이징 환경에서 먼저 테스트
- 백업과 롤백 계획 수립
- 적용 시간대 선정
- 팀 구성원 리뷰 진행

## 7. 마치며

- `terraform apply`는 IaC의 핵심 명령어로, 신중하고 계획적인 사용이 필요합니다
- 실행 계획 검토와 변경 승인 과정은 안전한 인프라 변경을 위한 중요한 단계입니다
- 자동화된 환경에서도 적절한 검증과 모니터링이 필수적입니다