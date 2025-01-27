---
title: "Modules"
description: "Terraform의 모듈 시스템을 상세히 알아봅니다. 루트 모듈과 차일드 모듈의 개념, 모듈 블록의 구성, 상태 관리까지 실무에서 바로 적용할 수 있는 모든 내용을 포괄적으로 다룹니다."
tags: [ "TERRAFORM", "MODULE", "IaC", "DEVOPS", "INFRASTRUCTURE", "CLOUD" ]
keywords: [ "테라폼", "terraform", "모듈", "module", "테라폼 모듈", "terraform module", "인프라 as 코드", "IaC", "Infrastructure as Code", "데브옵스", "DevOps", "클라우드", "cloud", "인프라스트럭처", "infrastructure", "모듈 블록", "module block" ]
draft: false
hide_title: true
---

## 1. Terraform 모듈 개요

- Terraform 모듈은 함께 사용되는 여러 리소스를 담는 컨테이너입니다.
- 한 디렉토리 내의 `.tf` 또는 `.tf.json` 파일들의 집합으로 구성되며, 인프라 구성을 재사용 가능한 형태로 패키징하는 주요 방법입니다.

## 2. 모듈의 종류와 구조

### 2.1 루트 모듈

- 모든 Terraform 구성에는 최소한 하나의 모듈이 존재하며, 이를 루트 모듈이라고 합니다.
	- 메인 작업 디렉토리의 `.tf` 파일들로 구성
	- 전체 Terraform 구성의 진입점 역할
	- 다른 모듈을 호출하는 시작점

### 2.2 차일드 모듈

- 루트 모듈에서 호출되는 하위 모듈을 차일드 모듈이라고 합니다.
	- 동일한 구성 내에서 여러 번 호출 가능
	- 여러 구성에서 재사용 가능
	- 모듈화를 통한 코드 재사용성 향상

## 3. 모듈 블록 작성하기

### 3.1 기본 구문

- 모듈을 호출할 때는 다음과 같은 기본 구문을 사용합니다:

```hcl
module "servers" {
  source = "./app-cluster"

  servers = 5
}
```

### 3.2 필수 및 선택적 인자

- `source`: 모든 모듈에서 필수적으로 필요한 인자입니다.
- `version`: 레지스트리 모듈 사용 시 권장되는 인자입니다.
- 그 외 인자들: 모듈의 입력 변수에 해당하는 값들입니다.
	- 위 예시에서 `servers`는 모듈의 입력 변수에 해당합니다.

:::warning
모듈의 버전을 명시적으로 지정하지 않으면, 예기치 않은 업데이트로 인한 문제가 발생할 수 있습니다.
:::

### 3.3 메타 아규먼트

- 메타 인자는 모듈에만 국한되지 않고 모든 Terraform의 블록(리소스, 데이터 소스 등)에서 사용할 수 있습니다.
	- count - 동일한 리소스를 여러 개 생성
	- for_each - 맵/셋을 사용해 여러 리소스를 더 세밀하게 생성
	- depends_on - 명시적 종속성 정의
	- providers - 특정 프로바이더 구성 지정
	- lifecycle - 리소스 생명주기 관리(생성/삭제 순서 등)

```hcl
module "web_app" {
  source = "./modules/web_app"
  
  count = 3
  for_each = var.environments
  depends_on = [aws_vpc.main]
  providers = {
    aws = aws.west
  }
}
```

## 4. 모듈 소스 관리

### 4.1 로컬 모듈

```hcl
module "network" {
  source = "./modules/network"
}
```

### 4.2 레지스트리 모듈

:::info
Terraform Registry는 공개적으로 사용 가능한 모듈들을 호스팅하는 플랫폼입니다. 버전 관리와 함께 사용하면 안정적인 모듈 관리가 가능합니다.
:::

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.2.0"
}
```

### 4.3 프라이빗 레지스트리

- 조직 내부에서 사용하는 모듈을 공유하기 위한 프라이빗 레지스트리도 있습니다.
	- HCP Terraform과 Terraform Enterprise에서 제공
	- 조직 특화된 인프라 요구사항 충족
	- 내부 모듈 공유 및 관리 용이

## 5. 모듈 출력값 활용

### 5.1 출력값 정의

- 차일드 모듈의 출력값을 상위 모듈에서 사용할 수 있습니다:

```hcl
# 차일드 모듈 내부
output "instance_ids" {
  value = aws_instance.app[*].id
}

# 상위 모듈에서 사용
resource "aws_elb" "example" {
  instances = module.servers.instance_ids
}
```

## 6. 모듈 상태 관리

### 6.1 모듈 리소스 이동

:::tip
리소스를 다른 모듈로 이동할 때는 리팩토링 블록을 사용하여 상태를 보존할 수 있습니다.
:::

### 6.2 리소스 교체

- 특정 리소스를 교체해야 할 때는 `-replace` 옵션을 사용합니다:

```bash
terraform plan -replace=module.example.aws_instance.example
```

### 6.3 모듈 제거

- Terraform 1.7 이상에서는 `removed` 블록을 사용하여 모듈을 안전하게 제거할 수 있습니다:

```hcl
removed {
  from = module.example

  lifecycle {
    destroy = false
  }
}
```

:::danger
모듈을 제거할 때는 신중하게 접근해야 합니다. `destroy = false` 옵션을 사용하면 실제 인프라는 유지한 채로 Terraform 상태에서만 제거할 수 있습니다.
:::

## 7. 모듈 개발 모범 사례

### 7.1 재사용성 고려사항

- 범용적으로 사용 가능하도록 설계
- 적절한 변수와 출력값 정의
- 문서화를 통한 사용법 명시

### 7.2 모듈 구조화

:::warning
모듈은 단일 책임 원칙을 따르도록 설계하는 것이 좋습니다. 너무 많은 기능을 하나의 모듈에 포함시키면 재사용성과 유지보수성이 떨어질 수 있습니다.
:::

- 논리적 단위로 모듈 분리
- 명확한 입/출력 인터페이스 정의
- 버전 관리 전략 수립

### 7.3 문서화와 예제

- 상세한 README 문서 작성
- 예제 코드 제공
- 변수에 대한 유효성 검사 구현
- 사용 사례와 제한사항 명시

## 8. 마치며

Terraform 모듈은 인프라 코드의 재사용성과 유지보수성을 크게 향상시킬 수 있는 강력한 도구입니다. 적절한 모듈화 전략과 체계적인 관리를 통해 효율적이고 안정적인 인프라 운영이 가능해집니다.