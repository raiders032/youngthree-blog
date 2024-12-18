---
title: "Transit Gateway"
description: "AWS Transit Gateway의 핵심 기능과 구성 방법을 상세히 알아봅니다. VPC간 효율적인 네트워크 연결 구성부터 주의해야 할 CIDR 설정까지, AWS 네트워크 아키텍처 설계에 필요한 모든 내용을 다룹니다."
tags: ["API_GATEWAY", "AWS", "NETWORKING", "VPC", "CLOUD"]
keywords: ["AWS Transit Gateway", "트랜짓 게이트웨이", "VPC", "CIDR", "네트워크", "클라우드", "AWS 네트워킹", "하이브리드 클라우드", "VPC 피어링", "네트워크 아키텍처"]
draft: false
hide_title: true
---

## 1. AWS Transit Gateway 개요

- AWS Transit Gateway는 수천 개의 VPC와 온프레미스 네트워크를 중앙에서 연결하고 관리할 수 있게 해주는 네트워크 전이 허브입니다. 
- 이 서비스를 통해 허브 앤 스포크(hub-and-spoke) 아키텍처를 구성할 수 있어 네트워크 관리가 크게 단순화됩니다.

## 2. 사전 요구사항

:::warning[중요: CIDR 블록 설정]

Transit Gateway 구성 시 가장 중요한 전제조건은 VPC 간 CIDR 블록이 중복되지 않아야 한다는 것입니다. 동일한 CIDR 블록을 사용하는 VPC들 간에는 라우팅 테이블 업데이트가 불가능합니다.
:::

- 각 VPC는 고유한 CIDR 블록을 가져야 함
- AWS 계정 접근 권한
- 적절한 IAM 권한 설정
- 네트워크 구성에 대한 기본 이해

## 3. 주요 특징

### 3.1 중앙 집중식 네트워크 관리

- 단일 게이트웨이로 모든 VPC와 온프레미스 네트워크 연결 관리
- 네트워크 정책의 중앙 집중식 적용 가능
- 관리 오버헤드 감소

### 3.2 확장성과 유연성

- 수천 개의 VPC 연결 지원
- 온디맨드 방식의 네트워크 확장 가능
- 다양한 연결 옵션 제공 (VPC, VPN, Direct Connect)

### 3.3 비용 최적화

- 개별 연결 대비 비용 효율적
- 사용량 기반 과금 체계
- 중복 리소스 제거로 인한 비용 절감

## 4. 구성 프로세스

### 4.1 Transit Gateway 생성

:::info[CIDR 설정 확인]

Transit Gateway 생성 전, 연결할 모든 VPC의 CIDR 블록이 겹치지 않는지 반드시 확인하세요.
:::

#### 기본 설정
```bash
aws ec2 create-transit-gateway \
    --description "My Transit Gateway" \
    --options "Amazon ASN=64512,AutoAcceptSharedAttachments=enable,DefaultRouteTableAssociation=enable,DefaultRouteTablePropagation=enable,VpnEcmpSupport=enable,DnsSupport=enable"
```

### 4.2 VPC 연결 구성

- Transit Gateway Attachment 생성
- 라우팅 테이블 업데이트
- 보안 그룹 설정

### 4.3 라우팅 설정

:::danger[주의사항]

중복되는 CIDR 블록이 있는 경우:
1. VPC CIDR 블록 재설정
2. 서브넷 구조 재설계
3. IP 주소 할당 계획 수립
   :::

## 5. 모범 사례

- 네트워크 세분화를 위한 라우팅 테이블 분리
- 적절한 모니터링 및 로깅 설정
- 정기적인 네트워크 감사 수행
- CIDR 블록 계획 수립

## 6. 문제 해결

### 6.1 일반적인 문제

- CIDR 블록 중복
- 라우팅 테이블 구성 오류
- 연결 제한 초과

### 6.2 해결 방안

- VPC CIDR 재설계
- 네트워크 구성 검토
- AWS Support 활용

## 7. 결론

AWS Transit Gateway는 복잡한 네트워크 환경을 효율적으로 관리할 수 있게 해주는 강력한 서비스입니다. 하지만 성공적인 구현을 위해서는 CIDR 블록 설계부터 신중하게 접근해야 합니다.

## 참고 자료

- [AWS Transit Gateway 공식 문서](https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html)
- [AWS Transit Gateway 설정 가이드](https://docs.aws.amazon.com/vpc/latest/tgw/tgw-how-it-works.html)
- [VPC CIDR 설계 가이드](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Subnets.html)