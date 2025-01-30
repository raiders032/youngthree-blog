---
title: "init"
description: "Terraform의 init 명령어를 상세히 알아봅니다. 기본적인 사용법부터 백엔드 초기화, 프로바이더 설치, 자동화 환경에서의 활용까지 실무에서 필요한 모든 내용을 다룹니다."
tags: [ "TERRAFORM", "INITIALIZATION", "IaC", "DEVOPS", "INFRASTRUCTURE", "CLOUD" ]
keywords: [ "테라폼", "terraform", "테라폼 초기화", "terraform init", "인프라 as 코드", "IaC", "Infrastructure as Code", "데브옵스", "DevOps", "클라우드", "cloud", "백엔드", "프로바이더" ]
draft: false
hide_title: true
---

## 1. terraform init 명령어 소개

- terraform init은 Terraform 구성 파일이 포함된 작업 디렉토리를 초기화하는 명령어입니다.
- 새로운 Terraform 구성을 작성하거나 기존 구성을 버전 관리 시스템에서 복제한 후 실행해야 하는 첫 번째 명령어입니다.

:::info
이 명령어는 여러 번 실행해도 안전합니다. 기존 구성이나 상태를 삭제하지 않고, 작업 디렉토리를 최신 상태로 유지합니다.
:::

## 2. 기본 사용법

### 2.1 명령어 구문

```bash
terraform init [options]
```

### 2.2 주요 옵션

- `-input=true`: 필요한 경우 사용자 입력 요청
- `-lock=false`: 상태 파일 잠금 비활성화
- `-lock-timeout=<duration>`: 상태 잠금 대기 시간 설정
- `-no-color`: 출력에서 색상 코드 비활성화
- `-upgrade`: 모듈과 플러그인 업그레이드 활성화

## 3. 소스 모듈 복사

### 3.1 빈 디렉토리에 모듈 복사

```bash
terraform init -from-module=MODULE-SOURCE
```

### 3.2 사용 사례

- 버전 관리 시스템에서 구성 체크아웃
- 예제 구성을 기반으로 새로운 구성 생성

:::tip
일상적인 사용에서는 버전 관리 시스템의 명령어를 직접 사용하여 구성을 체크아웃하는 것을 권장합니다.
:::

## 4. 백엔드 초기화

### 4.1 백엔드 구성 업데이트

```bash
terraform init -reconfigure  # 기존 구성 무시
terraform init -migrate-state  # 상태 마이그레이션 시도
```

### 4.2 주요 옵션

- `-force-copy`: 마이그레이션 확인 프롬프트 자동 승인
- `-backend=false`: 백엔드 구성 건너뛰기
- `-backend-config=...`: 동적 백엔드 설정 지정

:::warning
백엔드 구성을 변경할 때는 `-reconfigure` 또는 `-migrate-state` 옵션이 필요합니다.
:::

## 5. 차일드 모듈 설치

### 5.1 모듈 설치 옵션

- `-upgrade`: 이미 설치된 모듈도 최신 소스로 업데이트
- `-get=false`: 모듈 설치 과정 건너뛰기

### 5.2 모듈 설치 과정

- 구성에서 모듈 블록 검색
- 참조된 모듈의 소스 코드 검색
- 지정된 위치에서 모듈 설치

## 6. 프로바이더 플러그인 설치

### 6.1 플러그인 설치 프로세스

```hcl
provider "aws" {
  region = "us-west-2"
}
```

- `terraform init` 명령어 실행 시, 프로바이더 플러그인을 자동으로 설치합니다.
- Terraform은 구성에서 참조된 프로바이더를 자동으로 찾아 설치합니다
- 프로바이더는 현재 작업 디렉토리의 숨겨진 하위 디렉토리인 .terraform에 다운로드되어 설치됩니다
- terraform init 실행 시 설치된 프로바이더의 버전이 출력됩니다
- Terraform은 `.terraform.lock.hcl`이라는 잠금 파일을 생성하여 사용된 프로바이더의 정확한 버전을 지정합니다
- 이를 통해 프로젝트에 사용되는 프로바이더의 업데이트 시점을 제어할 수 있습니다

### 6.2 설치 옵션

- `-upgrade`: 버전 제약 조건 내에서 최신 버전 설치
- `-plugin-dir=PATH`: 특정 디렉토리에서만 플러그인 설치
- `-lockfile=MODE`: 종속성 잠금 파일 모드 설정

:::danger
프로바이더 플러그인 설치는 보안에 중요한 영향을 미칠 수 있습니다. 신뢰할 수 있는 소스의 플러그인만 사용하세요.
:::

## 7. 자동화 환경에서의 활용

### 7.1 CI/CD 파이프라인 통합

- 자동화 환경에서 terraform init을 실행할 때 고려할 사항:
	- 플러그인 로컬 캐싱
	- 버전 관리 시스템과의 통합
	- 일관된 실행 환경 보장

### 7.2 환경 변수 활용

```bash
export TF_DATA_DIR="/custom/path/.terraform"
terraform init
```

## 8. 작업 디렉토리 관리

### 8.1 다른 구성 디렉토리 지정

Terraform 0.14 이상에서는 `-chdir` 전역 옵션을 사용합니다:

```bash
terraform -chdir=environments/prod init
```

### 8.2 데이터 디렉토리 위치 변경

:::tip
`TF_DATA_DIR` 환경 변수를 사용하여 `.terraform` 디렉토리의 위치를 customizing할 수 있습니다.
:::

## 9. 마치며

- terraform init은 Terraform 워크플로우의 시작점이자 가장 중요한 명령어 중 하나입니다. 