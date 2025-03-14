---
title: "Status Checks(상태 확인)"
description: "AWS EC2가 제공하는 세 가지 상태 확인 유형(시스템, 인스턴스, EBS 상태 확인)에 대해 상세히 알아봅니다. 각 유형의 특징, 모니터링 방법, 그리고 자동 복구 설정까지 실제 예제와 함께 설명합니다."
tags: ["EC2", "AWS", "MONITORING", "CLOUDWATCH", "HIGH_AVAILABILITY", "DEVOPS", "EBS"]
keywords: ["EC2", "상태확인", "status checks", "시스템상태", "인스턴스상태", "EBS상태", "클라우드워치", "CloudWatch", "자동복구", "auto recovery", "AWS", "모니터링", "고가용성"]
draft: false
hide_title: true
---

## 1. EC2 상태 확인 개요

### 1.1 상태 확인의 기본 사항
- EC2 인스턴스의 상태 확인은 하드웨어 및 소프트웨어 문제를 식별하기 위한 자동화된 검사입니다.
- 1분 간격으로 자동으로 수행되며, pass 또는 fail 상태를 반환합니다.
- AWS에 내장된 기능으로, 비활성화하거나 삭제할 수 없습니다.
- 모든 검사 통과 시 "OK" 상태, 하나라도 실패 시 "impaired" 상태로 표시됩니다.

### 1.2 상태 확인 대시보드
![EC2 상태 확인 대시보드](images/Pasted%20image%2020240905101312.png)

### 1.3 세 가지 유형 비교

| 구분 | 시스템 상태 확인 | 인스턴스 상태 확인 | EBS 상태 확인 |
|-----|----------------|------------------|--------------|
| 모니터링 대상 | AWS 시스템/하드웨어 | 인스턴스 소프트웨어/네트워크 | 연결된 EBS 볼륨 |
| 책임 주체 | AWS | 사용자 | AWS/사용자 |
| CloudWatch 메트릭 | StatusCheckFailed_System | StatusCheckFailed_Instance | StatusCheckFailed_AttachedEBS |

## 2. 시스템 상태 확인(System Status Checks)

### 2.1 개념
- AWS 시스템과 관련된 문제를 모니터링합니다.
- EC2 인스턴스가 실행되는 물리적 호스트의 문제를 감지합니다.

### 2.2 감지하는 문제 유형
- 네트워크 연결 끊김
- 시스템 전원 손실
- 물리적 호스트의 소프트웨어 문제
- 네트워크 도달성에 영향을 미치는 하드웨어 문제

### 2.3 해결 방법
- AWS의 호스트 수정 완료 대기
- EC2 인스턴스를 새로운 호스트로 이동
	- EBS 기반: 인스턴스 중지 후 시작
	- Instance Store 기반: 인스턴스 종료 후 교체

### 2.4 베어메탈 인스턴스 특이사항
- OS 레벨에서 재시작 시 일시적으로 실패 상태 표시 가능
- 인스턴스 사용 가능 상태가 되면 자동으로 통과 상태로 변경

## 3. 인스턴스 상태 확인(Instance Status Checks)

### 3.1 개념
- 개별 EC2 인스턴스의 소프트웨어 및 네트워크 구성을 모니터링합니다.
- ARP 요청을 통해 네트워크 인터페이스(NIC)의 상태를 확인합니다.

### 3.2 감지하는 문제 유형
- 잘못된 네트워크 구성
- 메모리 부족
- 손상된 파일 시스템
- 호환되지 않는 커널

### 3.3 특수 상황
- Windows 인스턴스: 재부팅 중이나 Instance Store 기반 번들링 중에는 일시적 실패 표시
- systemd-networkd 사용 Linux: 네트워크 구성이 다른 시작 작업보다 먼저 완료될 수 있음

### 3.4 해결 방법
- 인스턴스 재부팅
- 인스턴스 구성 수정
- 운영체제 레벨의 문제 해결

## 4. EBS 상태 확인(Attached EBS Status Checks)

### 4.1 개념
- 연결된 EBS 볼륨의 도달성과 I/O 작업 완료 가능성을 모니터링합니다.
- StatusCheckFailed_AttachedEBS 메트릭은 하나 이상의 볼륨에서 I/O 작업 실패 시 장애를 나타냅니다.

### 4.2 감지하는 문제 유형
- EBS 볼륨 기반 스토리지 하위 시스템의 하드웨어/소프트웨어 문제
- EBS 볼륨 도달성에 영향을 미치는 물리적 호스트 문제
- 인스턴스와 EBS 볼륨 간의 연결 문제

### 4.3 해결 방법
- AWS의 문제 해결 대기
- 영향받은 볼륨 교체
- 인스턴스 중지 후 시작

## 5. 모니터링 및 자동 복구

### 5.1 CloudWatch 통합
- 각 상태 확인 유형별 CloudWatch 메트릭 제공
- 1분 간격으로 메트릭 업데이트
- 알람 설정을 통한 자동화 가능

### 5.2 자동 복구 옵션

#### 5.2.1 CloudWatch 알람 방식
![자동 복구 설정](images/Pasted%20image%2020240905101407.png)
![알람 구성 상세](images/Pasted%20image%2020240905101452.png)

특징:
- 동일한 네트워크 설정 유지
- EIP, 메타데이터 보존
- SNS 알림 지원

#### 5.2.2 Auto Scaling 그룹 방식
- EBS 볼륨 장애 감지 및 인스턴스 자동 교체
- 네트워크 설정은 유지되지 않음

:::warning
Auto Scaling 방식 사용 시 IP 주소가 변경될 수 있습니다.
:::

## 6. 모범 사례

### 6.1 모니터링 전략
- 모든 상태 확인 유형에 대한 통합 모니터링 구성
- CloudWatch 대시보드를 통한 시각화
- 적절한 알림 임계값 설정

### 6.2 자동화 구성
- 워크로드 특성에 맞는 복구 방식 선택
- 자동 복구 시나리오 테스트
- 복구 실패에 대한 대체 계획 수립

## 7. 결론

- Amazon EC2의 상태 확인은 시스템, 인스턴스, EBS 세 가지 유형을 통해 포괄적인 모니터링을 제공합니다. 
- 각 유형은 서로 다른 계층의 문제를 감지하고 해결하는 방법을 제공하며, CloudWatch와의 통합을 통해 자동화된 모니터링 및 복구가 가능합니다. 
- 세 가지 유형의 특성을 이해하고 적절한 모니터링과 자동 복구 메커니즘을 구축하면 안정적인 EC2 운영이 가능합니다.