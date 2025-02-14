---
title: "ArgoCD"
description: "쿠버네티스 환경에서 GitOps를 구현하기 위한 ArgoCD의 개념, 아키텍처, 설치 방법부터 실제 애플리케이션 배포까지 상세히 알아봅니다. 지속적 배포(CD)를 자동화하고 인프라를 코드로 관리하고자 하는 개발자와 데브옵스 엔지니어를 위한 실용적인 가이드입니다."
tags: [ "ARGOCD", "GITOPS", "KUBERNETES", "DEVOPS", "CI_CD", "CLOUD_NATIVE", "INFRASTRUCTURE" ]
keywords: [ "ArgoCD", "아르고시디", "GitOps", "깃옵스", "Kubernetes", "쿠버네티스", "k8s", "데브옵스", "DevOps", "CI/CD", "지속적 배포", "Continuous Deployment", "인프라스트럭처", "Infrastructure as Code", "IaC", "클라우드 네이티브", "Cloud Native" ]
draft: false
hide_title: true
---

## 1. ArgoCD 소개

- ArgoCD는 쿠버네티스를 위한 선언적 GitOps 지속적 배포(CD) 도구입니다.
- Git 저장소에 있는 애플리케이션 정의와 구성을 쿠버네티스 클러스터의 원하는 상태로 자동으로 동기화합니다.
- 애플리케이션 배포와 라이프사이클 관리를 자동화하여 개발자와 운영팀의 작업을 단순화합니다.

### 1.1 GitOps란?

- GitOps는 인프라와 애플리케이션 구성을 코드로 관리하는 방식입니다.
- Git을 단일 진실 공급원(Single Source of Truth)으로 사용합니다.
- 모든 변경사항은 Git을 통해 이루어지며, 자동으로 클러스터에 반영됩니다.
- 버전 관리, 감사, 롤백이 용이하며 협업에 이점이 있습니다.

### 1.2 ArgoCD의 주요 특징

- 자동 동기화: Git 저장소의 변경사항을 자동으로 감지하고 클러스터에 적용
- 다양한 배포 전략 지원: Blue/Green, Canary, Rolling Update 등
- 강력한 보안: RBAC, SSO 통합, 다중 테넌시 지원
- 웹 UI: 직관적인 대시보드를 통한 애플리케이션 상태 모니터링
- 다양한 매니페스트 도구 지원: Helm, Kustomize, Jsonnet 등

## 2. ArgoCD 아키텍처

### 2.1 주요 컴포넌트

- API 서버
	- ArgoCD의 핵심 컴포넌트로 비즈니스 로직 처리
	- REST API 엔드포인트 제공
	- gRPC를 통한 다른 컴포넌트와의 통신
- Repository Server
	- Git 저장소의 애플리케이션 매니페스트 캐싱
	- 저장소 인증 관리
	- 매니페스트 생성 (Helm, Kustomize 등)
- Application Controller
	- 실제 클러스터 상태 모니터링
	- Git의 원하는 상태와 실제 상태 비교
	- 필요한 경우 동기화 수행

### 2.2 동작 방식

- ArgoCD는 선언적 방식으로 작동합니다
  - Argo CD는 쿠버네티스 컨트롤러로 구현되어 있으며, 실행 중인 애플리케이션을 지속적으로 모니터링하고 현재의 실제 상태를 Git 저장소에 명시된 원하는 목표 상태와 비교합니다.
  - 실제 상태가 목표 상태와 다른 배포된 애플리케이션은 'OutOfSync' (동기화 이탈) 상태로 간주됩니다.
  - Argo CD는 이러한 차이점을 보고하고 시각화하며, 자동 또는 수동으로 실제 상태를 원하는 목표 상태로 다시 동기화할 수 있는 기능을 제공합니다.
  - Git 저장소의 원하는 목표 상태에 대한 모든 수정사항은 자동으로 적용되어 지정된 대상 환경에 반영될 수 있습니다.
- 동작 방식
	- Git 저장소에 원하는 상태 정의
	- ArgoCD가 주기적으로 상태 확인
	- 차이가 발견되면 자동 또는 수동으로 동기화
	- 변경사항 적용 후 결과 모니터링

## 3. ArgoCD 설치 및 구성

### 3.1 설치 준비

- 쿠버네티스 클러스터가 필요합니다.
- kubectl이 구성되어 있어야 합니다.
- Git 저장소 접근 권한이 필요합니다.

### 3.2 설치 과정

#### 네임스페이스 생성

```bash
kubectl create namespace argocd
```

#### ArgoCD 설치

```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

#### 초기 패스워드 확인

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### 3.3 기본 설정

- Git 저장소 연결
	- HTTPS 또는 SSH 인증 구성
	- 프라이빗 저장소의 경우 인증 정보 추가
- RBAC 설정
	- 사용자 및 그룹 권한 구성
	- 프로젝트별 접근 제어 설정

## 4. 애플리케이션 배포하기

### 4.1 애플리케이션 정의

#### 기본 Application 매니페스트

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    targetRevision: HEAD
    path: guestbook
  destination:
    server: https://kubernetes.default.svc
    namespace: guestbook
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### 4.2 배포 전략 구성

- Sync Options
	- 자동/수동 동기화 설정
	- 리소스 정리(Prune) 옵션
	- Health 체크 설정
- 롤백 설정
	- 자동 롤백 조건 정의
	- 히스토리 유지 기간 설정

## 5. 모니터링과 문제 해결

### 5.1 상태 모니터링

- 웹 UI를 통한 모니터링
	- 애플리케이션 상태 확인
	- 동기화 히스토리 조회
	- 리소스 트리 뷰
- CLI를 통한 모니터링
	- argocd app list
	- argocd app get
	- argocd app logs

### 5.2 문제 해결 팁

- 동기화 실패 시 체크리스트:
	- Git 저장소 접근 가능 여부
	- 매니페스트 문법 오류
	- 리소스 충돌
	- 권한 문제
- 로그 분석:
	- Application Controller 로그 확인
	- Repo Server 로그 확인
	- API Server 로그 검토

## 6. 모범 사례

### 6.1 보안 강화

- 최소 권한 원칙 적용
- 정기적인 인증 정보 갱신
- 민감한 정보는 Sealed Secrets 사용

### 6.2 성능 최적화

- 적절한 동기화 간격 설정
- 리소스 요청/제한 구성
- 캐시 설정 최적화

### 6.3 운영 팁

- 명확한 태그 전략 수립
- 환경별 구성 분리
- 정기적인 백업 수행
- 모니터링 및 알림 구성

## 7. 결론

- ArgoCD는 GitOps 방식의 배포 자동화를 구현하는 강력한 도구입니다.
- 지속적 배포, 인프라 관리, 애플리케이션 라이프사이클 자동화를 효과적으로 지원합니다.
- 적절한 설정과 모범 사례를 따르면 안정적이고 확장 가능한 배포 파이프라인을 구축할 수 있습니다.