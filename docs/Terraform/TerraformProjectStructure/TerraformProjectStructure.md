---
title: "Terraform Project Structure"
description: "Terraform 프로젝트의 기본 구조와 주요 구성 요소를 상세히 알아봅니다. 변수 정의, 출력값 설정, 모듈 구성 등 실무에서 필요한 모든 내용을 처음 배우는 사람도 이해할 수 있게 설명합니다."
tags: [ "TERRAFORM", "PROJECT_STRUCTURE", "IaC", "DEVOPS", "INFRASTRUCTURE", "CLOUD" ]
keywords: [ "테라폼", "terraform", "프로젝트 구조", "변수", "출력값", "모듈", "variables", "outputs", "modules", "IaC", "DevOps" ]
draft: false
hide_title: true
---

## 1. Terraform 프로젝트 이해하기

### 1.1 프로젝트란?

- Terraform 프로젝트는 인프라를 코드로 정의하는 파일들의 집합입니다.
- 마치 웹 개발 프로젝트가 HTML, CSS, JavaScript 파일로 구성되듯이, Terraform 프로젝트는 여러 `.tf` 파일들로 구성됩니다.

### 1.2 기본 디렉토리 구조

```plaintext
my-terraform-project/
├── main.tf           # 주요 리소스 정의
├── variables.tf      # 변수 선언
├── terraform.tfvars  # 변수 값 정의
├── outputs.tf        # 출력값 정의
├── providers.tf      # 프로바이더 설정
└── versions.tf       # 버전 제약 조건
```

- 각 파일의 역할:
	- `main.tf`: 실제로 생성할 인프라 자원을 정의하는 메인 파일
	- `variables.tf`: 프로젝트에서 사용할 변수들을 선언
	- `terraform.tfvars`: 선언된 변수들의 실제 값을 지정
	- `outputs.tf`: 인프라 생성 후 필요한 값들을 출력하도록 정의
	- `providers.tf`: AWS, Azure 등 사용할 클라우드 공급자 설정
	- `versions.tf`: Terraform과 프로바이더의 버전 관리

## 2. 변수 시스템 이해하기

### 2.1 변수가 필요한 이유

예를 들어 EC2 인스턴스를 생성하는 코드를 봅시다:

```hcl
# 변수 사용 없이 직접 값을 입력한 경우
resource "aws_instance" "server" {
  ami           = "ami-1234567890"
  instance_type = "t2.micro"
  tags = {
    Name = "production-server"
  }
}
```

이 코드의 문제점:

1. 개발 환경과 운영 환경에서 다른 인스턴스 타입을 사용하고 싶다면?
2. 다른 리전에서 다른 AMI ID를 사용해야 한다면?
3. 여러 곳에서 같은 값을 반복해서 사용한다면?

이러한 문제를 해결하기 위해 변수 시스템을 사용합니다.

### 2.2 변수 정의하기 (variables.tf)

```hcl
# variables.tf
variable "instance_type" {
  description = "EC2 인스턴스 타입"
  type        = string
  default     = "t2.micro"  # 기본값 설정
}

variable "environment" {
  description = "배포 환경 (dev/prod)"
  type        = string
}

variable "server_settings" {
  description = "서버 설정 값"
  type = object({
    name = string
    ami  = string
    tags = map(string)
  })
}
```

각 구성 요소 설명:

- `description`: 변수에 대한 설명 (문서화)
- `type`: 변수의 데이터 타입 (string, number, bool 등)
- `default`: 기본값 (선택사항)

### 2.3 변수 값 정의하기 (terraform.tfvars)

```hcl
# terraform.tfvars
instance_type = "t3.micro"
environment   = "prod"

server_settings = {
  name = "web-server"
  ami  = "ami-1234567890"
  tags = {
    Department = "Engineering"
    Owner      = "DevOps Team"
  }
}
```

:::tip
`terraform.tfvars`는 `variables.tf`에서 선언한 변수들의 실제 값을 지정하는 파일입니다. 이렇게 분리함으로써:

1. 민감한 정보를 별도 관리할 수 있습니다.
2. 환경별로 다른 값을 쉽게 적용할 수 있습니다.
3. 변수 선언과 값을 분리하여 코드를 더 깔끔하게 관리할 수 있습니다.
   :::

### 2.4 변수 사용하기 (main.tf)

```hcl
# main.tf
resource "aws_instance" "server" {
  ami           = var.server_settings.ami
  instance_type = var.instance_type
  
  tags = merge(
    var.server_settings.tags,
    {
      Environment = var.environment
      Name        = var.server_settings.name
    }
  )
}
```

변수를 사용할 때는 `var.변수명` 형식으로 참조합니다.

### 2.5 환경별 변수 파일 관리

```plaintext
my-terraform-project/
├── terraform.tfvars    # 공통 설정
├── dev.tfvars          # 개발 환경 설정
└── prod.tfvars         # 운영 환경 설정
```

```hcl
# dev.tfvars
instance_type = "t2.micro"
environment   = "dev"

# prod.tfvars
instance_type = "t3.large"
environment   = "prod"
```

환경별 변수 파일 적용:

```bash
# 개발 환경 배포
terraform apply -var-file="dev.tfvars"

# 운영 환경 배포
terraform apply -var-file="prod.tfvars"
```

## 3. 출력값 시스템 이해하기

### 3.1 출력값이 필요한 이유

인프라를 생성한 후에 필요한 정보들이 있습니다:

1. 생성된 EC2 인스턴스의 IP 주소
2. 데이터베이스 접속 엔드포인트
3. 생성된 리소스의 ID

이러한 정보들을 출력값으로 정의하여 쉽게 확인할 수 있습니다.

### 3.2 출력값 정의하기 (outputs.tf)

```hcl
# outputs.tf
output "instance_ip" {
  description = "EC2 인스턴스의 퍼블릭 IP 주소"
  value       = aws_instance.server.public_ip
}

output "instance_details" {
  description = "EC2 인스턴스 상세 정보"
  value = {
    id        = aws_instance.server.id
    public_ip = aws_instance.server.public_ip
    private_ip = aws_instance.server.private_ip
  }
}

output "database_endpoint" {
  description = "데이터베이스 접속 주소"
  value       = aws_db_instance.main.endpoint
  sensitive   = true  # 민감한 정보 마스킹
}
```

출력값 구성 요소:

- `description`: 출력값에 대한 설명
- `value`: 출력할 실제 값
- `sensitive`: 민감한 정보 여부

### 3.3 출력값 확인하기

```bash
# 모든 출력값 확인
terraform output

# 특정 출력값만 확인
terraform output instance_ip
```

## 4. 모듈 시스템 이해하기

### 4.1 모듈이 필요한 이유

코드의 재사용이 필요한 경우를 생각해봅시다:

1. 여러 프로젝트에서 같은 VPC 구성을 사용하고 싶을 때
2. 개발/스테이징/운영 환경에 같은 구성을 다른 값으로 배포할 때
3. 복잡한 인프라 구성을 논리적 단위로 나누고 싶을 때

이런 경우에 모듈을 사용합니다.

### 4.2 모듈 구조 예시

```plaintext
modules/vpc/
├── main.tf           # VPC 관련 리소스 정의
├── variables.tf      # 모듈의 입력 변수
└── outputs.tf        # 모듈의 출력값

modules/webapp/
├── main.tf           # 웹 애플리케이션 관련 리소스
├── variables.tf      # 모듈의 입력 변수
└── outputs.tf        # 모듈의 출력값
```

### 4.3 모듈 사용 예시

```hcl
# 프로젝트의 main.tf
module "vpc" {
  source = "./modules/vpc"
  
  vpc_cidr     = "10.0.0.0/16"
  subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
}

module "webapp" {
  source = "./modules/webapp"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.subnet_ids
}
```

:::tip
모듈은 '함수'처럼 생각할 수 있습니다:

- 입력값: variables.tf에 정의된 변수들
- 처리: main.tf에 정의된 리소스 생성 로직
- 출력값: outputs.tf에 정의된 출력값들
  :::

## 5. 마치며

- 변수 시스템을 통해 코드의 재사용성과 유지보수성을 높일 수 있습니다
- 출력값 시스템으로 필요한 정보를 쉽게 확인할 수 있습니다
- 모듈 시스템을 활용하여 복잡한 인프라를 관리하기 쉽게 구조화할 수 있습니다
- 이러한 시스템들을 적절히 활용하면:
  - 코드 중복을 줄일 수 있습니다
  - 환경별 설정을 쉽게 관리할 수 있습니다
  - 팀 협업이 용이해집니다
  - 인프라 관리가 더욱 체계적이 됩니다