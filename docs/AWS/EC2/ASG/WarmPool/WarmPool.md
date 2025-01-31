---
title: "Warm Pool"
description: "AWS EC2 Auto Scaling Warm Pool 완벽 가이드: EC2 Auto Scaling Warm Pool의 개념부터 구성 방법, 인스턴스 상태 관리, 제한사항까지 상세히 알아봅니다. 긴 부팅 시간을 가진 애플리케이션의 지연 시간을 효과적으로 줄이는 방법을 설명합니다."
tags: ["WARM_POOL", "AUTO_SCALING", "EC2", "AWS", "CLOUD"]
keywords: ["워밍풀", "warm pool", "warm-pool", "오토스케일링", "auto scaling", "autoscaling", "EC2", "AWS", "클라우드", "cloud", "인스턴스", "instance", "스케일아웃", "scale out", "하이버네이션", "hibernation", "라이프사이클훅", "lifecycle hook"]
draft: false
hide_title: true
---

## 1 AWS EC2 Auto Scaling Warm Pool 이란?

- Warm Pool은 EC2 Auto Scaling Group을 위해 사전 초기화된 EC2 인스턴스 풀입니다.
- 애플리케이션이 스케일 아웃해야 할 때 Auto Scaling Group이 Warm Pool의 인스턴스를 활용할 수 있습니다.
  - 새로운 인스턴스를 시작하는 대신 Warm Pool의 인스턴스를 사용하여 애플리케이션 트래픽을 빠르게 처리할 수 있습니다.
- 인스턴스가 애플리케이션 트래픽을 빠르게 처리할 수 있도록 준비된 상태를 유지합니다.
- 부팅 시간이 긴 애플리케이션의 지연 시간을 줄일 수 있습니다.

## 2 주의사항

- Warm Pool이 실제로 필요하지 않은 경우에 생성하면 불필요한 비용이 발생할 수 있습니다.
- 첫 번째 부팅 시간이 애플리케이션에 눈에 띄는 지연 문제를 일으키지 않는다면 Warm Pool은 필요하지 않을 수 있습니다.
- 혼합 인스턴스 정책이 있는 Auto Scaling 그룹에는 Warm Pool을 추가할 수 없습니다.
- Spot 인스턴스를 요청하는 시작 템플릿이나 시작 구성이 있는 Auto Scaling 그룹에도 추가할 수 없습니다.

## 3 Warm Pool의 기본 크기

- 기본적으로 Warm Pool의 크기는 Auto Scaling 그룹의 최대 용량과 원하는 용량의 차이로 계산됩니다.
- 예시:
	- Auto Scaling 그룹의 원하는 용량이 6이고 최대 용량이 10인 경우
	- Warm Pool을 처음 설정하고 초기화할 때 Pool의 크기는 4가 됩니다.

## 4 Warm Pool Size 설정

- MaxGroupPreparedCapacity 옵션을 사용하여 Warm Pool의 최대 용량을 별도로 지정할 수 있습니다.
- 그룹의 현재 용량보다 큰 사용자 지정 값을 설정해야 합니다.
- 사용자 지정 값을 제공하면 Warm Pool의 크기는 다음과 같이 계산됩니다:
	- 사용자 지정 값과 그룹의 현재 원하는 용량의 차이
- 예시:
	- Auto Scaling 그룹의 원하는 용량이 6
	- 최대 용량이 20
	- 사용자 지정 값이 8인 경우
	- Warm Pool을 처음 설정하고 초기화할 때 Pool의 크기는 2가 됩니다.

## 5 Warm Pool 인스턴스 상태

- Warm Pool의 인스턴스는 세 가지 상태 중 하나로 유지할 수 있습니다:
	- Stopped
	- Running
	- Hibernated

### 5.1 Stopped 상태

- 비용을 최소화하는 가장 효과적인 방법입니다.
- 사용하는 볼륨과 인스턴스에 연결된 Elastic IP 주소에 대해서만 비용을 지불합니다.

### 5.2 Hibernated 상태

- 메모리 내용(RAM)을 삭제하지 않고 인스턴스를 중지할 수 있습니다.
- 인스턴스가 최대 절전 모드일 때:
	- 운영 체제에 RAM 내용을 Amazon EBS 루트 볼륨에 저장하도록 신호를 보냅니다.
	- 인스턴스가 다시 시작되면 루트 볼륨이 이전 상태로 복원됩니다.
	- RAM 내용이 다시 로드됩니다.
- 비용:
	- EBS 볼륨 (RAM 내용 저장 포함)
	- 인스턴스에 연결된 Elastic IP 주소에 대해서만 비용 지불

### 5.3 Running 상태

- Warm Pool 내에서 인스턴스를 Running 상태로 유지하는 것도 가능합니다.
- 불필요한 요금이 발생할 수 있으므로 권장하지 않습니다.
- 인스턴스가 중지되거나 최대 절전 모드일 때는 인스턴스 자체 비용을 절약할 수 있습니다.
- 인스턴스가 실행 중일 때만 비용을 지불합니다.

### 5.4 상태별 비용 비교 예시 (m5.large 기준)

- 예시 구성:
	- 인스턴스 유형: m5.large
	- EBS 볼륨: 10GB
	- 기간: 30일

#### Running 상태 비용
- 인스턴스 비용: $0.096/시간 * 24시간 * 30일 = $69.12
- EBS 볼륨 비용: $0.10/GB-월 * 10GB = $1.00
- **총 비용: $70.12/월**

#### Stopped 상태 비용
- 인스턴스 비용: $0 (정지 상태)
- EBS 볼륨 비용: $0.10/GB-월 * 10GB = $1.00
- **총 비용: $1.00/월**

#### Hibernated 상태 비용
- 인스턴스 비용: $0 (최대 절전 모드)
- EBS 볼륨 비용:
	- 기본 볼륨: $0.10/GB-월 * 10GB = $1.00
	- RAM 저장 추가 볼륨 (예: 8GB RAM): $0.10/GB-월 * 8GB = $0.80
- **총 비용: $1.80/월**

:::tip[비용 최적화 팁]
위 비용 비교를 보면 Running 상태 대비 Stopped나 Hibernated 상태를 사용할 때 최대 98% 비용 절감이 가능합니다. 특별한 이유가 없다면 Stopped 상태 사용을 권장합니다.
:::

## 6 Lifecycle Hooks
 
- Lifecycle Hooks를 사용하여 인스턴스를 대기 상태로 둘 수 있습니다.
- 인스턴스가 시작되거나 종료되기 전에 사용자 정의 작업을 수행할 수 있습니다.
- Warm Pool 구성에서 Lifecycle Hooks는 다음과 같은 경우 인스턴스를 지연시킵니다:
	- 인스턴스가 중지되거나 최대 절전 모드로 전환될 때
	- 스케일 아웃 이벤트 중에 서비스에 투입될 때
- Lifecycle Hook 없이 Warm Pool을 추가하면 문제가 발생할 수 있습니다:
	- 초기화를 완료하는 데 시간이 오래 걸리는 인스턴스가 준비되기 전에
	- 중지되거나 최대 절전 모드로 전환될 수 있습니다.
	- 스케일 아웃 이벤트 중에 서비스에 투입될 수 있습니다.

## 7 Instance Reuse Policy

- 기본적으로 Auto Scaling 그룹이 축소될 때 Amazon EC2 Auto Scaling은 인스턴스를 종료합니다.
- 그런 다음 종료된 인스턴스를 대체하기 위해 새 인스턴스를 Warm Pool에 시작합니다.
- Instance Reuse Policy를 지정하면:
	- 인스턴스를 Warm Pool로 반환할 수 있습니다.
	- 애플리케이션 트래픽을 처리하도록 이미 구성된 인스턴스를 재사용할 수 있습니다.

## 8 인스턴스 업데이트

- Warm Pool의 인스턴스를 업데이트하려면:
	- 새로운 시작 템플릿이나 시작 구성을 생성합니다.
	- Auto Scaling 그룹과 연결합니다.
- 새 인스턴스는 새로운 AMI와 시작 템플릿/구성에 지정된 업데이트를 사용하여 시작됩니다.
- 기존 인스턴스는 영향을 받지 않습니다.
- 새로운 시작 템플릿/구성을 사용하는 대체 Warm Pool 인스턴스를 강제로 시작하려면:
	- 인스턴스 새로 고침을 시작하여 그룹의 롤링 업데이트를 수행할 수 있습니다.
- 인스턴스 새로 고침 순서:
	- 먼저 InService 인스턴스를 교체합니다.
	- 그런 다음 Warm Pool의 인스턴스를 교체합니다.

## 9 제한 사항

- 혼합 인스턴스 정책이 있는 Auto Scaling 그룹에는 Warm Pool을 추가할 수 없습니다.
- Spot 인스턴스를 요청하는 시작 템플릿/구성이 있는 Auto Scaling 그룹에는 추가할 수 없습니다.
- 루트 디바이스로 인스턴스 스토어를 사용하는 인스턴스는 중지하거나 최대 절전 모드로 전환할 수 없습니다.
- Warm Pool이 고갈된 상태에서 스케일 아웃 이벤트가 발생하면:
	- 인스턴스가 Auto Scaling 그룹에 직접 시작됩니다(콜드 스타트).
- 가용 영역의 용량이 부족한 경우에도 콜드 스타트가 발생할 수 있습니다.
- Warm Pool 내의 인스턴스가 시작 프로세스 중에 문제가 발생하면:
	- InService 상태에 도달하지 못하는 경우
	- 인스턴스는 시작 실패로 간주되어 종료됩니다.

## 10 결론

- Warm Pool은 긴 부팅 시간을 가진 애플리케이션의 지연 시간을 줄이는 데 효과적입니다.
- 비용 최적화를 위해 Stopped 또는 Hibernated 상태를 사용하는 것이 좋습니다.
- Lifecycle Hooks를 적절히 활용하여 인스턴스 초기화를 관리해야 합니다.
- Instance Reuse Policy를 통해 구성된 인스턴스를 효율적으로 재사용할 수 있습니다.
- 실제로 필요한 경우에만 Warm Pool을 사용하여 불필요한 비용 발생을 방지해야 합니다.