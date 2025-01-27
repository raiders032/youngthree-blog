---
title: "Install"
description: "Terraform의 설치 방법과 첫 실습 과정을 단계별로 안내합니다. macOS, Ubuntu, Windows의 설치 방법, 설치 확인, 자동완성 설정부터 Docker를 이용한 NGINX 서버 배포까지 실전 중심으로 설명합니다."
tags: [ "TERRAFORM_CLI", "DOCKER", "NGINX", "IaC", "DEVOPS", "CLOUD", "INFRASTRUCTURE" ]
keywords: [ "테라폼", "terraform", "테라폼 설치", "terraform install", "도커", "docker", "엔진엑스", "nginx", "데브옵스", "devops", "인프라 자동화", "infrastructure automation", "코드형 인프라", "infrastructure as code", "클라우드", "cloud", "홈브류", "homebrew", "apt", "초콜라티", "chocolatey" ]
draft: false
hide_title: true
---

# Terraform 설치부터 첫 실습까지: 완벽 가이드

## 1. Terraform 설치하기

### 1.1 macOS 설치

- Homebrew를 통해 Terraform을 설치하는 방법을 알아보겠습니다.

#### 1.1.1 HashiCorp 탭 설치

```bash
# HashiCorp의 모든 Homebrew 패키지가 포함된 저장소 추가
$ brew tap hashicorp/tap
```

#### 1.1.2 Terraform 설치

```bash
# 공식 Terraform 패키지 설치
$ brew install hashicorp/tap/terraform
```

:::info[참고사항]
이 방식으로 설치하면 서명된 바이너리가 설치되며, 새로운 공식 릴리스가 있을 때마다 자동으로 업데이트됩니다.
:::

#### 1.1.3 Terraform 업데이트

- 최신 버전으로 업데이트하려면 다음 단계를 따릅니다:

```bash
# Homebrew 업데이트
$ brew update

# Terraform 최신 버전으로 업그레이드
$ brew upgrade hashicorp/tap/terraform
```

### 1.2 Ubuntu 설치

- HashiCorp의 공식 apt 저장소를 통해 Terraform을 설치하는 방법을 알아보겠습니다.

**시스템 패키지 설치**

```bash
# 필수 패키지 설치
$ sudo apt-get update && sudo apt-get install -y gnupg software-properties-common
```

**HashiCorp GPG 키 설치**

```bash
# GPG 키 다운로드 및 설치
$ wget -O- https://apt.releases.hashicorp.com/gpg | \
gpg --dearmor | \
sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null

# GPG 키 검증
$ gpg --no-default-keyring \
--keyring /usr/share/keyrings/hashicorp-archive-keyring.gpg \
--fingerprint
```

**HashiCorp 저장소 추가**

```bash
# apt 저장소 추가
$ echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
sudo tee /etc/apt/sources.list.d/hashicorp.list

# 저장소 정보 업데이트
$ sudo apt update
```

**Terraform 설치**

```bash
# 공식 Terraform 패키지 설치
$ sudo apt-get install terraform
```

:::info[참고사항]
이 방식으로 설치하면 HashiCorp의 공식 저장소에서 서명된 패키지가 설치되며, apt를 통해 새로운 릴리스를 자동으로 업데이트할 수 있습니다.
:::

**Terraform 업데이트**
최신 버전으로 업데이트하려면 다음 단계를 따릅니다:

```bash
# apt 저장소 업데이트
$ sudo apt update

# Terraform 최신 버전으로 업그레이드
$ sudo apt-get install --only-upgrade terraform
```

### 1.3 Windows 설치

- Windows에서는 Chocolatey 패키지 관리자나 공식 설치 프로그램을 통해 설치할 수 있습니다.

**Chocolatey를 사용한 설치**

```powershell
# Terraform 패키지 설치
choco install terraform
```

**수동 설치**

1. [Terraform 다운로드 페이지](https://www.terraform.io/downloads)에서 Windows 버전 다운로드
2. ZIP 파일 압축 해제
3. 실행 파일을 원하는 위치로 이동 (예: `C:\terraform`)
4. 시스템 환경 변수 PATH에 경로 추가

**Terraform 업데이트**

```powershell
# Chocolatey를 사용한 경우
choco upgrade terraform
```

## 2. 설치 확인

### 2.1 명령어 확인

- 설치가 제대로 되었는지 확인하기 위해 새 터미널을 열고 Terraform의 사용 가능한 하위 명령어들을 확인합니다

```bash
$ terraform -help
Usage: terraform [-version] [-help] <command> [args]

The available commands for execution are listed below.
The most common, useful commands are shown first, followed by
less common or more advanced commands. If you're just getting
started with Terraform, stick with the common commands. For the
other commands, please read the help and docs before usage.
##...
```

특정 하위 명령어에 대한 자세한 도움말을 보려면:

```bash
$ terraform -help plan
```

:::warning[문제 해결]
만약 `terraform` 명령어를 찾을 수 없다는 오류가 발생하면, PATH 환경 변수가 올바르게 설정되지 않은 것입니다. Terraform이 설치된 디렉토리가 PATH에 포함되어 있는지 확인하세요.
:::

### 2.2 자동 완성 설정

- Bash나 Zsh 쉘에서 Terraform 명령어의 자동 완성을 활성화할 수 있습니다.

**Bash 설정**

```bash
# 설정 파일 생성
$ touch ~/.bashrc

# 자동 완성 설치
$ terraform -install-autocomplete
```

**Zsh 설정**

```bash
# 설정 파일 생성
$ touch ~/.zshrc

# 자동 완성 설치
$ terraform -install-autocomplete
```

:::info
자동 완성 기능을 사용하려면 설치 후 쉘을 재시작해야 합니다.
:::

## 3. Quick Start: Docker로 NGINX 서버 배포하기

- 이제 Terraform을 사용해 Docker로 NGINX 서버를 배포하는 실습을 진행해보겠습니다.
- 이 실습은 Mac, Windows, Linux 모두에서 가능합니다.

### 3.1 사전 준비

**Docker Desktop 설치 및 실행**

- Mac: Docker Desktop for Mac 설치 후 실행

```bash
$ open -a Docker
```

- Windows: Docker Desktop for Windows 설치 후 실행
- Linux: Docker Engine 설치 후 실행

### 3.2 프로젝트 설정

작업 디렉토리를 생성하고 이동합니다:

```bash
# 디렉토리 생성
$ mkdir learn-terraform-docker-container

# 디렉토리로 이동
$ cs learn-terraform-docker-container
```

:::info[작업 디렉토리의 역할]
이 디렉토리는 인프라를 정의하는 구성 파일들을 포함하며, Terraform이 필요한 플러그인, 모듈, 상태 정보를 저장하는 공간이 됩니다.
:::

### 3.3 Terraform 구성 파일 작성

작업 디렉토리에 `main.tf` 파일을 생성하고 다음 내용을 작성합니다:

```hcl
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {}

resource "docker_image" "nginx" {
  name         = "nginx"
  keep_locally = false
}

resource "docker_container" "nginx" {
  image = docker_image.nginx.image_id
  name  = "tutorial"

  ports {
    internal = 80
    external = 8000
  }
}
```

### 3.4 NGINX 서버 배포

**프로젝트 초기화**

```bash
# Docker 프로바이더 다운로드 및 초기화
$ terraform init
```

**NGINX 컨테이너 배포**

```bash
# 인프라 배포 (확인 메시지에 'yes' 입력)
$ terraform apply
```

### 3.5 배포 확인

NGINX 서버가 제대로 배포되었는지 확인하는 방법:

1. 웹 브라우저에서 확인
	- `http://localhost:8000` 접속
2. Docker 컨테이너 확인

```bash
$ docker ps
CONTAINER ID   IMAGE          COMMAND                  CREATED          STATUS          PORTS                  NAMES
425d5ee58619   e791337790a6   "nginx -g 'daemon of…"   20 seconds ago   Up 19 seconds   0.0.0.0:8000->80/tcp   tutorial
```

### 3.6 리소스 삭제

실습이 끝났다면 생성된 리소스를 삭제합니다:

```bash
$ terraform destroy
```

:::tip[축하합니다!]
이제 Terraform을 사용하여 첫 번째 인프라를 성공적으로 배포하고 삭제해보았습니다. 이 경험을 바탕으로 더 복잡한 인프라 관리에 도전해보세요.
:::

## 4. 다음 단계

- Terraform의 기본 사용법을 익혔다면, 다음 주제들을 학습해보세요:

1. 클라우드 프로바이더 연동
	- AWS, Azure, GCP 등의 클라우드 서비스 관리
	- 클라우드 자격 증명 설정
2. Terraform 핵심 개념
	- 상태(State) 관리
	- 모듈 사용법
	- 변수와 출력값
	- 워크스페이스
3. 실전 프로젝트
	- VPC 구성
	- 서버리스 인프라 구축
	- 컨테이너 오케스트레이션
	- 데이터베이스 관리

:::info[참고]
더 자세한 내용은 [Terraform 공식 문서](https://www.terraform.io/docs)를 참고하세요.
:::

**Terraform 설치**

```bash
# 공식 Terraform 패키지 설치
$ brew install hashicorp/tap/terraform
```

:::info[참고사항]
이 방식으로 설치하면 서명된 바이너리가 설치되며, 새로운 공식 릴리스가 있을 때마다 자동으로 업데이트됩니다.
:::

**Terraform 업데이트**
최신 버전으로 업데이트하려면 다음 단계를 따릅니다:

```bash
# Homebrew 업데이트
$ brew update

# Terraform 최신 버전으로 업그레이드
$ brew upgrade hashicorp/tap/terraform
```

### 1.2 Ubuntu 설치

- HashiCorp의 공식 apt 저장소를 통해 Terraform을 설치하는 방법을 알아보겠습니다.

**시스템 패키지 설치**

```bash
# 필수 패키지 설치
$ sudo apt-get update && sudo apt-get install -y gnupg software-properties-common
```

**HashiCorp GPG 키 설치**

```bash
# GPG 키 다운로드 및 설치
$ wget -O- https://apt.releases.hashicorp.com/gpg | \
gpg --dearmor | \
sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null

# GPG 키 검증
$ gpg --no-default-keyring \
--keyring /usr/share/keyrings/hashicorp-archive-keyring.gpg \
--fingerprint
```

**HashiCorp 저장소 추가**

```bash
# apt 저장소 추가
$ echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
sudo tee /etc/apt/sources.list.d/hashicorp.list

# 저장소 정보 업데이트
$ sudo apt update
```

**Terraform 설치**

```bash
# 공식 Terraform 패키지 설치
$ sudo apt-get install terraform
```

:::info[참고사항]
이 방식으로 설치하면 HashiCorp의 공식 저장소에서 서명된 패키지가 설치되며, apt를 통해 새로운 릴리스를 자동으로 업데이트할 수 있습니다.
:::

**Terraform 업데이트**
최신 버전으로 업데이트하려면 다음 단계를 따릅니다:

```bash
# apt 저장소 업데이트
$ sudo apt update

# Terraform 최신 버전으로 업그레이드
$ sudo apt-get install --only-upgrade terraform
```

### 1.3 Windows 설치

- Windows에서는 Chocolatey 패키지 관리자나 공식 설치 프로그램을 통해 설치할 수 있습니다.

**Chocolatey를 사용한 설치**

```powershell
# Terraform 패키지 설치
choco install terraform
```

**수동 설치**

1. [Terraform 다운로드 페이지](https://www.terraform.io/downloads)에서 Windows 버전 다운로드
2. ZIP 파일 압축 해제
3. 실행 파일을 원하는 위치로 이동 (예: `C:\terraform`)
4. 시스템 환경 변수 PATH에 경로 추가

**Terraform 업데이트**

```powershell
# Chocolatey를 사용한 경우
choco upgrade terraform
```

## 2. 설치 확인

### 2.1 명령어 확인

- 설치가 제대로 되었는지 확인하기 위해 새 터미널을 열고 Terraform의 사용 가능한 하위 명령어들을 확인합니다

```bash
$ terraform -help
Usage: terraform [-version] [-help] <command> [args]

The available commands for execution are listed below.
The most common, useful commands are shown first, followed by
less common or more advanced commands. If you're just getting
started with Terraform, stick with the common commands. For the
other commands, please read the help and docs before usage.
##...
```

특정 하위 명령어에 대한 자세한 도움말을 보려면:

```bash
$ terraform -help plan
```

:::warning[문제 해결]
만약 `terraform` 명령어를 찾을 수 없다는 오류가 발생하면, PATH 환경 변수가 올바르게 설정되지 않은 것입니다. Terraform이 설치된 디렉토리가 PATH에 포함되어 있는지 확인하세요.
:::

### 2.2 자동 완성 설정

- Bash나 Zsh 쉘에서 Terraform 명령어의 자동 완성을 활성화할 수 있습니다.

**Bash 설정**

```bash
# 설정 파일 생성
$ touch ~/.bashrc

# 자동 완성 설치
$ terraform -install-autocomplete
```

**Zsh 설정**

```bash
# 설정 파일 생성
$ touch ~/.zshrc

# 자동 완성 설치
$ terraform -install-autocomplete
```

:::info
자동 완성 기능을 사용하려면 설치 후 쉘을 재시작해야 합니다.
:::

## 3. Quick Start: Docker로 NGINX 서버 배포하기

- 이제 Terraform을 사용해 Docker로 NGINX 서버를 배포하는 실습을 진행해보겠습니다.
- 이 실습은 Mac, Windows, Linux 모두에서 가능합니다.

### 3.1 사전 준비

**Docker Desktop 설치 및 실행**

- Mac: Docker Desktop for Mac 설치 후 실행

```bash
$ open -a Docker
```

- Windows: Docker Desktop for Windows 설치 후 실행
- Linux: Docker Engine 설치 후 실행

### 3.2 프로젝트 설정

작업 디렉토리를 생성하고 이동합니다:

```bash
# 디렉토리 생성
$ mkdir learn-terraform-docker-container

# 디렉토리로 이동
$ cs learn-terraform-docker-container
```

:::info[작업 디렉토리의 역할]
이 디렉토리는 인프라를 정의하는 구성 파일들을 포함하며, Terraform이 필요한 플러그인, 모듈, 상태 정보를 저장하는 공간이 됩니다.
:::

### 3.3 Terraform 구성 파일 작성

작업 디렉토리에 `main.tf` 파일을 생성하고 다음 내용을 작성합니다:

```hcl
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {}

resource "docker_image" "nginx" {
  name         = "nginx"
  keep_locally = false
}

resource "docker_container" "nginx" {
  image = docker_image.nginx.image_id
  name  = "tutorial"

  ports {
    internal = 80
    external = 8000
  }
}
```

### 3.4 NGINX 서버 배포

**프로젝트 초기화**

```bash
# Docker 프로바이더 다운로드 및 초기화
$ terraform init
```

**NGINX 컨테이너 배포**

```bash
# 인프라 배포 (확인 메시지에 'yes' 입력)
$ terraform apply
```

### 3.5 배포 확인

NGINX 서버가 제대로 배포되었는지 확인하는 방법:

1. 웹 브라우저에서 확인
	- `http://localhost:8000` 접속
2. Docker 컨테이너 확인

```bash
$ docker ps
CONTAINER ID   IMAGE          COMMAND                  CREATED          STATUS          PORTS                  NAMES
425d5ee58619   e791337790a6   "nginx -g 'daemon of…"   20 seconds ago   Up 19 seconds   0.0.0.0:8000->80/tcp   tutorial
```

### 3.6 리소스 삭제

실습이 끝났다면 생성된 리소스를 삭제합니다:

```bash
$ terraform destroy
```

:::tip[축하합니다!]
이제 Terraform을 사용하여 첫 번째 인프라를 성공적으로 배포하고 삭제해보았습니다. 이 경험을 바탕으로 더 복잡한 인프라 관리에 도전해보세요.
:::

## 4. 다음 단계

- Terraform의 기본 사용법을 익혔다면, 다음 주제들을 학습해보세요:

1. 클라우드 프로바이더 연동
	- AWS, Azure, GCP 등의 클라우드 서비스 관리
	- 클라우드 자격 증명 설정
2. Terraform 핵심 개념
	- 상태(State) 관리
	- 모듈 사용법
	- 변수와 출력값
	- 워크스페이스
3. 실전 프로젝트
	- VPC 구성
	- 서버리스 인프라 구축
	- 컨테이너 오케스트레이션
	- 데이터베이스 관리

:::info[참고]
더 자세한 내용은 [Terraform 공식 문서](https://www.terraform.io/docs)를 참고하세요.
:::