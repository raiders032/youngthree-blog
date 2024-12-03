---
title: "DualStack"
description: "AWS ELB DualStack와 Public IPv4가 없는 새로운 DualStack 완벽 가이드: AWS Elastic Load Balancer의 DualStack 네트워킹과 2024년 5월에 출시된 Public IPv4가 없는 새로운 DualStack 기능에 대해 상세히 알아봅니다. IPv4와 IPv6를 지원하는 ELB의 구성 방법과 작동 원리, 그리고 실제 구현 시나리오를 다룹니다."
tags: ["AWS", "ELB", "NETWORKING", "IPV6", "IPV4", "CLOUD", "INFRASTRUCTURE", "VPC", "ALB"]
keywords: ["AWS ELB", "듀얼스택", "DualStack", "로드밸런서", "IPv6", "IPv4", "네트워킹", "VPC", "서브넷", "ALB", "NLB", "클라우드 네트워킹", "AWS 네트워킹", "public IPv4"]
draft: false
hide_title: true
---

## 1. AWS ELB의 IP 주소 유형 소개

AWS Application Load Balancer(ALB)는 세 가지 IP 주소 유형을 지원합니다:

- **ipv4**: 클라이언트가 IPv4 주소만 사용하여 연결
- **dualstack**: 클라이언트가 IPv4와 IPv6 주소 모두 사용하여 연결
- **dualstack-without-public-ipv4**: 클라이언트가 IPv6 주소만 사용하여 연결 (2024년 5월 출시)

## 2. DualStack의 주요 특징

### 2.1 기본 DualStack 특징
- IPv4와 IPv6를 동시에 지원
- ALB와 NLB 모두에서 사용 가능
- 대상 그룹에서 IPv4와 IPv6 대상 혼합 사용 가능
- 클라이언트와 대상 간 IP 버전 자동 변환

### 2.2 새로운 DualStack without Public IPv4 특징
- Public IPv4 주소 없이 인터넷 연결 ALB 구성 가능
- 클라이언트는 IPv6만 사용하여 연결
- ALB와 대상 간 통신은 private IPv4 사용 가능
- Public IPv4 비용 절감 가능

## 3. 네트워크 구성 요구사항

### 3.1 VPC 요구사항
- IPv4 CIDR 구성 (예: 10.0.0.0/16)
- IPv6 CIDR 구성 (예: 2001:db8:1234:1a00::/56)
- 인터넷 게이트웨이로 향하는 IPv6 기본 라우트(::/0) 필요

### 3.2 서브넷 구성
- 최소 두 개의 가용 영역에 서브넷 필요
- 각 서브넷은 dual-stack 구성 필요
- Public 서브넷의 경우 인터넷 게이트웨이 연결 필요

## 4. 구현 방법

### 4.1 AWS CLI를 통한 구현
```bash
aws elbv2 create-load-balancer \
--name Dualstack-without-PublicIPv4-ALB \  
--subnets subnet-12345678 subnet-87654321 \ 
--security-groups sg-12345678 \ 
--ip-address-type dualstack-without-public-ipv4
```

### 4.2 AWS Console을 통한 구현
1. EC2 콘솔에서 Load Balancer 섹션으로 이동
2. Create Load Balancer 선택
3. 스키마를 internet-facing으로 설정
4. IP address type을 dualstack-without-public-ipv4로 선택
5. VPC, 서브넷, 보안 그룹 선택
6. 대상 그룹과 리스너 구성

## 5. 마이그레이션 전략

### 5.1 신규 ALB 생성 방식
1. 새로운 dualstack-without-public-ipv4 ALB 생성
2. 테스트 완료 후 트래픽 전환
3. 기존 환경 제거

### 5.2 기존 ALB 변환 방식
1. HTTP 클라이언트 keepalive 기간을 60초로 조정
2. IP 주소 유형을 dualstack-without-public-ipv4로 변경
3. DNS 레코드 확인 (AAAA 레코드만 표시되는지 확인)
4. 1시간 + 클라이언트 keepalive 시간 후 keepalive 기간 원복

## 6. 고려사항

- 마이그레이션 전 Public IPv4 사용 클라이언트 확인 필요
- ALB 액세스 로그의 client:port 필드로 확인 가능
- 외부 IdP 인증 사용 시 IPv4 통신 필요
- AWS WAF, 방화벽 등의 IPv6 지원 여부 확인 필요
- DNS 변경 시 IPv6 주소만 반환되도록 변경됨

## 7. 결론

AWS ELB의 새로운 dualstack-without-public-ipv4 기능은 IPv6 전용 통신을 지원하면서도 Public IPv4 비용을 절감할 수 있는 효과적인 솔루션을 제공합니다. 적절한 마이그레이션 전략과 고려사항을 검토하여 성공적인 구현이 가능합니다.