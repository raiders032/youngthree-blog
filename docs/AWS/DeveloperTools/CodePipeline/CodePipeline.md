---
title: "CodePipeline"
description: "AWS CodePipeline의 핵심 기능과 모니터링 방법을 상세히 알아봅니다. 파이프라인 상태 알림 설정부터 외부 도구와의 통합까지 실제 예제와 함께 설명합니다."
tags: ["AWS", "CODEPIPELINE", "DEVOPS", "CI_CD", "CLOUD"]
keywords: ["AWS", "CodePipeline", "CI/CD", "파이프라인", "데브옵스", "클라우드", "모니터링", "알림", "이벤트브리지", "람다", "SNS"]
draft: false
hide_title: true
---

## 1 AWS CodePipeline 개요

- AWS CodePipeline은 소프트웨어 릴리스 프로세스를 자동화하는 완전관리형 지속적 통합 및 지속적 배포(CI/CD) 서비스입니다.
- 이 강력한 도구를 사용하면 애플리케이션과 인프라 업데이트를 빠르고 안정적으로 배포할 수 있습니다.
- 이 글에서는 AWS CodePipeline의 주요 특징, 작동 방식, 그리고 이를 효과적으로 활용하는 방법에 대해 알아보겠습니다.
- CodePipeline은 코드 변경이 발생할 때마다 빌드, 테스트, 배포 단계를 자동으로 실행합니다.
- 이를 통해 개발자는 새로운 기능이나 버그 수정을 신속하게 프로덕션 환경에 반영할 수 있습니다.

## 2 CodePipeline의 주요 특징

### 2.1 완전관리형 서비스

- AWS가 인프라를 관리하므로, 사용자는 파이프라인 로직에만 집중할 수 있습니다.
- 확장성과 고가용성이 보장됩니다.

### 2.2 유연한 워크플로우

- 다양한 소스 제공자, 빌드 도구, 배포 대상을 지원합니다.
- 사용자 정의 작업을 통해 파이프라인을 확장할 수 있습니다.

### 2.3 시각화 및 모니터링

- 파이프라인의 각 단계를 시각적으로 확인할 수 있습니다.
- 실시간으로 파이프라인 상태를 모니터링할 수 있습니다.

### 2.4 통합 및 확장성

- 다른 AWS 서비스와 쉽게 통합됩니다.
- 서드파티 도구와의 연동도 지원합니다.

## 3 CodePipeline 작동 방식

- CodePipeline은 CI/CD 워크플로우를 시각적으로 구성하고 관리할 수 있는 도구입니다.
- 다양한 AWS 서비스 및 서드파티 도구와 통합되어 유연한 파이프라인을 구성할 수 있습니다.

### 3.1 파이프라인 구성 요소

- CodePipeline은 다음과 같은 주요 구성 요소로 이루어집니다

1. **소스 단계**:
	- 지원 서비스: CodeCommit, ECR, S3, Bitbucket, GitHub
	- 역할: 코드 변경을 감지합니다.
2. **빌드 단계**:
	- 지원 서비스: CodeBuild, Jenkins, CloudBees, TeamCity
	- 역할: 코드를 컴파일하고 패키징합니다.
3. **테스트 단계**:
	- 지원 서비스: CodeBuild, AWS Device Farm, 기타 서드파티 도구
	- 역할: 자동화된 테스트를 실행합니다.
4. **배포 단계**:
	- 지원 서비스: CodeDeploy, Elastic Beanstalk, CloudFormation, ECS, S3
	- 역할: 애플리케이션을 프로덕션 환경에 배포합니다.
5. **호출 단계**:
	- 지원 서비스: Lambda, Step Functions
	- 역할: 추가적인 로직이나 워크플로우를 실행합니다.

### 3.2 파이프라인 구조

- 파이프라인은 여러 단계(stage)로 구성됩니다.
- 각 단계는 순차적 작업 및/또는 병렬 작업을 포함할 수 있습니다.
- 일반적인 파이프라인 구조 예: 빌드 → 테스트 → 배포 → 부하 테스트 → ...
- 필요한 경우 특정 단계에서 수동 승인 과정을 정의할 수 있습니다.

### 3.3 파이프라인 실행 흐름

1. 소스 단계에서 코드 변경을 감지하면 파이프라인이 시작됩니다.
2. 각 단계는 정의된 순서대로 실행되며, 이전 단계의 출력을 다음 단계의 입력으로 사용합니다.
3. 병렬 작업이 정의된 경우 동시에 실행됩니다.
4. 수동 승인이 필요한 단계에서는 승인될 때까지 파이프라인이 대기합니다.
5. 모든 단계가 성공적으로 완료되면 파이프라인 실행이 종료됩니다.

## 4 CodePipeline 구성 예시

```yaml
pipeline:
  name: MyAppPipeline
  stages:
    - name: Source
      actions:
        - name: SourceAction
          actionType: Source
          provider: GitHub
          outputArtifacts:
            - name: SourceOutput
    - name: Build
      actions:
        - name: BuildAction
          actionType: Build
          provider: CodeBuild
          inputArtifacts:
            - name: SourceOutput
          outputArtifacts:
            - name: BuildOutput
    - name: Deploy
      actions:
        - name: DeployAction
          actionType: Deploy
          provider: ECS
          inputArtifacts:
            - name: BuildOutput
```

- 이 예시에서는 GitHub에서 소스 코드를 가져와 CodeBuild로 빌드한 후, ECS에 배포하는 파이프라인을 정의하고 있습니다.

## 5 CodePipeline 모니터링 및 알림 설정

### 5.1 이벤트 기반 모니터링

CodePipeline은 다양한 이벤트를 생성하며, 이를 모니터링하고 대응하는 방법이 있습니다:

- **Amazon EventBridge (CloudWatch Events)**
	- 파이프라인 상태 변경을 실시간으로 감지
	- 세밀한 이벤트 필터링 지원
	- 다양한 대상 서비스로 이벤트 라우팅 가능
- **AWS CloudTrail**
	- API 수준의 활동 로깅
	- 감사 및 규정 준수용
	- 장기 보관이 필요한 이벤트 추적
- **Amazon CloudWatch**
	- 메트릭스 기반 모니터링
	- 대시보드 생성
	- 알림 설정

### 5.2 실시간 알림 구성

파이프라인 상태 변경에 대한 실시간 알림을 설정하는 아키텍처:

1. **EventBridge 규칙 생성**
	- 소스: CodePipeline
	- 이벤트 패턴: Pipeline Execution State Change
	- 대상: SNS 토픽
2. **SNS 토픽 설정**
	- 메시지 형식 정의
	- 구독자 설정
	- 접근 정책 구성
3. **Lambda 함수 통합**
	- SNS 구독 설정
	- 외부 웹훅 호출 로직 구현
	- 오류 처리 및 재시도 로직

:::info
EventBridge → SNS → Lambda 패턴은 확장성이 높고 안정적인 이벤트 처리를 제공합니다.
:::

## 6 CodePipeline과 다른 AWS 서비스와의 통합

- CodePipeline은 다음과 같은 AWS 서비스와 원활하게 통합됩니다:
	- **CodeCommit**: 소스 코드 관리
	- **CodeBuild**: 빌드 및 테스트 자동화
	- **CodeDeploy**: 애플리케이션 배포 자동화
	- **Elastic Beanstalk**: PaaS 환경으로 배포
	- **ECS/EKS**: 컨테이너 오케스트레이션 서비스로 배포
	- **Lambda**: 서버리스 함수 배포
	- **EventBridge (CloudWatch Events)**
		- 이벤트 기반 파이프라인 트리거
		- 상태 변경 모니터링
		- 다른 AWS 서비스와의 통합
	- **Simple Notification Service (SNS)**
		- 알림 전달 서비스
		- 다양한 구독 프로토콜 지원
		- 메시지 필터링 기능
	- **Lambda**
		- 커스텀 로직 실행
		- 외부 시스템 통합
		- 이벤트 처리 및 변환

- 이러한 통합을 통해 전체 소프트웨어 개발 라이프사이클을 AWS 생태계 내에서 관리할 수 있습니다.

## 7 CodePipeline 모범 사례

### 7.1 파이프라인 구조화

- 각 단계를 명확히 정의하고 필요한 경우 병렬 실행을 활용합니다.
- 환경별(개발, 스테이징, 프로덕션)로 별도의 파이프라인을 구성합니다.

### 7.2 보안 강화

- IAM 역할을 사용하여 최소 권한 원칙을 적용합니다.
- 중요한 정보는 AWS Secrets Manager를 사용하여 관리합니다.

### 7.3 모니터링 및 로깅

- CloudWatch와 통합하여 파이프라인 실행을 모니터링합니다.
- 실패한 단계에 대한 알림을 설정합니다.

### 7.4 아티팩트 관리

- 아티팩트를 버전 관리하여 롤백이 가능하도록 합니다.
- 불필요한 아티팩트는 주기적으로 정리합니다.

## 8 Artifacts

- CodePipeline에서 각 단계는 아티팩트(Artifacts)를 생성할 수 있습니다.
	- 아티팩트는 빌드나 테스트 과정에서 생성된 결과물입니다.
	- 예를 들어, 소스 코드, 빌드된 애플리케이션 파일, 테스트 결과 등이 아티팩트에 포함될 수 있습니다.
- 생성된 아티팩트는 S3 버킷에 저장되며, 다음 단계로 전달됩니다.
- CodePipeline의 아티팩트는 각 단계를 연결해주는 중요한 요소입니다.

**예시**

- 첫 번째 단계에서 소스 코드가 S3에 저장된 후, CodeBuild 단계에서 이를 빌드합니다.
- 빌드된 아티팩트는 다시 S3에 저장되고, 이후 CodeDeploy 단계에서 이 아티팩트를 활용해 배포 작업이 진행됩니다.

