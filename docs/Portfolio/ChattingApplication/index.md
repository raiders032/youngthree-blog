---
title: "CHAT CHAT"
description: "AWS 기반의 클라우드 네이티브 실시간 채팅 플랫폼 개발 프로젝트를 소개합니다. 마이크로서비스 아키텍처, WebSocket 기반 실시간 통신, DevOps 환경 구축 등 주요 기술 스택과 개발 과정을 상세히 다룹니다."
tags: ["WEBSOCKET_API", "RESTFUL_API", "AWS", "EC2", "API_GATEWAY", "AMPLIFY"]
keywords: ["채팅", "실시간채팅", "웹소켓", "websocket", "AWS", "클라우드", "cloud", "마이크로서비스", "microservices", "데브옵스", "devops", "도커", "docker", "스프링", "spring", "코틀린", "kotlin", "레디스", "redis", "몽고DB", "mongodb", "웹플럭스", "webflux"]
draft: false
hide_title: true
sidebar_position: 1
---

# ChatChat - 채팅 플랫폼

## 1. 프로젝트 개요
- 클라우드 네이티브 아키텍처를 기반으로 한 고성능 실시간 채팅 플랫폼입니다. 
- 대규모 사용자의 동시 접속을 안정적으로 지원하며, 확장성과 사용자 경험을 최우선으로 고려하여 설계되었습니다.
- **개발 기간**: 2024.01 ~ 진행 중
- **팀 구성**: Backend 3명, Frontend 1명
- **담당 역할**
  - DevOps 설계 및 구현 (단독)
  - 백엔드 아키텍처 설계 및 개발

## 2. 핵심 기능

### 2.1 실시간 채팅 및 알림
- 실시간 일대다 채팅
- 사용자 온라인 상태 실시간 관리
- 메시지 확인 수 실시간 반영
- 읽지 않은 메시지 알림 및 카운트

### 2.2 실시간 동기화 시스템
- 사용자 프로필 변경 실시간 반영 (프로필 이미지, 이름 등)
- 대화방 목록에서 읽은 메시지 수 실시간 업데이트
- 새로운 공지사항 실시간 알림 및 표시
- 채팅방 참여자 목록 실시간 업데이트

### 2.3 고성능 메시징 시스템
- Spring WebFlux와 Kotlin 코루틴 기반 비동기 처리
- WebSocket과 Redis Pub/Sub 기반 실시간 메시징
- 커스텀 WebSocket 메시지 라우팅

### 2.4 DevOps 환경 구축
- AWS 기반 클라우드 인프라 설계 및 구현
- Infrastructure as Code를 통한 리소스 관리 자동화
- CI/CD 파이프라인 구축
- 컨테이너 기반 마이크로서비스 아키텍처 구현
- 개발 환경 생성 및 제거 자동화 시스템 구축(업무 시간에만 개발 환경 운영)

## 3. 기술 스택

### 3.1 Backend
- **Framework**: Spring Boot, Spring WebFlux
- **Language**: Kotlin
- **Database**: MongoDB(DocumentDB), Redis(ElastiCache)
- **Message Protocol**: WebSocket, HTTP API

### 3.2 DevOps (단독 구현)
- **Infrastructure**
  - AWS ECS (컨테이너 오케스트레이션)
  - AWS DocumentDB (데이터베이스)
  - AWS ElastiCache (Redis 캐싱 및 Message Broker)
  - AWS ALB (로드밸런싱)
  - AWS Route 53 (DNS 관리)
  - AWS ACM (인증서 관리)
  - AWS EventBridge (환경 스케줄링)
  - AWS Step Functions (워크플로우 관리)
  - AWS Lambda (이벤트 처리)
  - AWS S3 (채팅 첨부파일 및 미디어 저장소)
  - AWS Secrets Manager (데이터베이스 자격증명 관리)
  - AWS Parameter Store (환경 설정 관리)
- **IaC**
  - AWS CloudFormation(인프라스트럭처 코드화)
- **Container**
  - Docker(컨테이너 이미지 빌드)
  - AWS ECS(컨테이너 관리)
- **CI/CD**
  - GitHub Actions(자동화된 빌드/배포)
  - AWS ECR(컨테이너 이미지 저장소)
- **Monitoring**
  - AWS CloudWatch(로그 수집 및 모니터링)

## 4. 주요 개발 포인트

### 4.1 DevOps 환경 구축 (단독 수행)
- AWS CloudFormation을 활용한 인프라스트럭처 자동화
- 네트워크, 데이터베이스, 로드밸런서, ECS 클러스터 등 모든 AWS 리소스의 코드화
- 멀티 스택 구조를 통한 체계적인 리소스 관리
- GitHub Actions를 활용한 CI/CD 파이프라인 구축
- 모듈별 자동 빌드 및 테스트
- ECR을 활용한 컨테이너 이미지 관리
- ECS 자동 배포 구현
- 마이크로서비스 운영 환경 구축
- 서비스별 독립적인 스케일링 및 배포 가능한 구조
- 로드밸런서를 통한 트래픽 분산
- DNS 기반 서비스 라우팅
- AWS EventBridge와 AWS Step Functions를 활용한 개발 환경 자동 시작/종료 구현

### 4.2 고성능 데이터 처리
- 비동기 프로그래밍 모델 적용
- 실시간 데이터 동기화 최적화
- 분산 캐시 시스템 구현

## 5. 시스템 아키텍처
- 마이크로서비스 기반의 확장 가능한 아키텍처 설계
- 실시간 메시지 처리를 위한 이벤트 기반 아키텍처 구현
- 상세 내용은 [시스템 아키텍처 설계 문서](./architecture.md) 참고
  - 전체 시스템 구성도
  - 서비스 간 통신 흐름
  - 데이터 흐름도
  - 주요 컴포넌트 설명
  - 기술적 의사결정 내용

## 6. CI/CD 파이프라인
- GitHub Actions 기반 자동화된 빌드/배포 시스템
- 모듈별 독립적인 배포 전략
- 상세 내용은 [CI/CD 파이프라인 상세](./cicdPipeline.md) 참고
    - 파이프라인 구성도
    - 자동화된 테스트 전략
    - 무중단 배포 프로세스
    - 모니터링 및 알림 체계

## 7. 프로젝트 고민거리 및 해결과정
- 프로젝트를 진행하면서 마주친 다양한 기술적 도전 과제들과 그 해결 과정을 정리했습니다.
- 이러한 기술적 고민들과 해결 과정에 대한 상세 내용은 [기술적 의사결정 및 문제해결 과정](./technicalDecisions/technicalDecisions)에서 확인하실 수 있습니다.

## 8. 프로젝트 링크
- [서비스 URL](https://www.streetcoder.club)

## 9. 실행 화면
[스크린샷 및 설명]