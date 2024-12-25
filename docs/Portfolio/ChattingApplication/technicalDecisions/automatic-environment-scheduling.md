---
title: "개발/스테이징 환경의 비용 최적화를 위한 자동화 시스템"
description: "개발/스테이징 환경의 비용 최적화를 위한 자동화 시스템을 구축하고, AWS 클라우드 환경에서의 구현 방법과 효과를 소개합니다."
draft: false
hide_title: true
---

## 1. 개발/스테이징 환경의 비용 최적화를 위한 자동화 시스템
- 개발/스테이징 환경의 비용을 최적화하기 위해 개발 환경의 운영 시간을 제한하고, 자동화된 프로세스를 통해 환경을 시작/중지하는 시스템을 구축합니다.

### 1.1 현재 운영 방식의 문제점
- 개발/스테이징 환경이 24시간 운영되면서 다음과 같은 문제가 발생하고 있습니다
  - 업무 시간 외 불필요한 리소스 낭비와 비용 발생
  - 환경 시작/중지를 수동으로 관리해야 하는 운영상의 부담
  - 일관성 없는 리소스 관리로 인한 비효율

### 1.2 AWS CloudFormation 스택 구조
- 현재 시스템은 다음과 같은 중첩 스택 구조로 이루어져 있습니다

```
ChatAppMasterStack
├── NetworkStack (VPC, 서브넷, 보안그룹 등)
├── DatabaseStack (DocumentDB, Redis)
├── LoadBalancerStack (ALB, 타겟 그룹)
├── ECSClusterStack (ECS 클러스터, EC2 인스턴스)
└── ServerStack (ECS 서비스, 작업 정의)
```
- 이 구조에서는 마스터 스택을 생성하거나 삭제하면 모든 중첩 스택이 자동으로 함께 생성되거나 삭제됩니다. 
- 이러한 특성을 활용하여 환경 전체를 한 번에 관리할 수 있습니다.

### 1.3 비용 분석

**현재 월간 비용 (24시간 운영 기준)**:
- ECS 클러스터 (t3.small × 2대)
  - 시간당 $0.023 × 2대 = $0.046
  - 월 730시간 기준 = $16.79
- DocumentDB (db.t3.medium)
  - 시간당 $0.178
  - 월 기준 = $129.94
- ElastiCache for Redis (cache.t2.micro)
  - 시간당 $0.017
  - 월 기준 = $12.41
- 총 월간 비용: $159.14

**업무 시간 운영 시 예상 비용 (하루 9시간, 주 5일)**:
- 월 운영 시간: 180시간 (9시간 × 20일)
- 예상 월간 비용: $39.24
- 절감 가능 금액: $119.90 (약 75% 절감)

## 2. 해결 방안

### 2.1 시스템 구성 요소
- **EventBridge**: 정해진 시간에 자동으로 Step Functions를 실행합니다.
- **Step Functions**: 환경 생성/삭제 과정을 조율합니다.
  - 총 2개의 상태 머신을 사용해 환경 시작/중지 프로세스를 구현합니다.
  - EnvironmentStartStateMachine: 개발 환경을 시작하는 프로세스
  - EnvironmentStopStateMachine: 개발 환경을 중지하는 프로세스
- **Lambda Functions**: 세부 작업 수행 (ECR 태그 조회, Discord 알림 등)
  - GetECRTagsFunction: ECR에서 최신 이미지 태그 조회하는 함수
  - SendDiscordNotificationFunction: Discord로 알림을 전송하는 함수
- **CloudFormation**: 인프라스트럭처 생성 및 삭제
- **Discord Webhook**: 상태 변경 알림 전송

### 2.2 작동 방식
**환경 시작 프로세스 (오전 9시)**:
1. EventBridge가 Start Step Function 실행
2. Step Function이 다음 작업 순차 실행:
  - 기존 스택 존재 여부 확인
  - ECR에서 최신 이미지 태그 조회
  - ChatAppMasterStack 생성
  - 진행 상황 Discord 알림

**환경 중지 프로세스 (오후 6시)**:
1. EventBridge가 Stop Step Function 실행
2. Step Function이 다음 작업 순차 실행:
  - 스택 상태 확인
  - ChatAppMasterStack 삭제
  - 진행 상황 Discord 알림

## 3. 상세 구현

### 3.1 EventBridge 스케줄러 구현

infrastructure-scheduler.yaml에서 정의된 주요 컴포넌트:

**IAM 역할 구성**:
```yaml
# CloudFormation 실행 역할
CloudFormationServiceRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Principal:
            Service: cloudformation.amazonaws.com
          Action: sts:AssumeRole
    ManagedPolicyArns:
      - arn:aws:iam::aws:policy/AdministratorAccess

# Lambda 실행 역할
LambdaRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Statement:
        - Effect: Allow
          Principal:
            Service: lambda.amazonaws.com
          Action: sts:AssumeRole
    Policies:
      - PolicyName: ECRAccess
        PolicyDocument:
          Statement:
            - Effect: Allow
              Action: 
                - ecr:DescribeImages
                - ecr:ListImages
              Resource: '*'
```

**Lambda 함수 구현**:
```yaml
  GetECRTagsFunction:
    Type: AWS::Lambda::Function
    Properties:
      Handler: index.handler
      Runtime: python3.8
      Role: !GetAtt LambdaRole.Arn
      Code:
        ZipFile: |
          import boto3
          import json

          def handler(event, context):
              ecr = boto3.client('ecr')
              try:
                  response = ecr.describe_images(
                      repositoryName='chat-chat-http',
                      filter={
                          'tagStatus': 'TAGGED'
                      }
                  )

                  if not response.get('imageDetails'):
                      raise Exception("No tagged images found in repository chat-chat-http")

                  # Sort by image pushed time to get the most recent
                  sorted_images = sorted(
                      response['imageDetails'],
                      key=lambda x: x['imagePushedAt'],
                      reverse=True
                  )

                  tag = sorted_images[0]['imageTags'][0]
                  return {
                      'APIServerImageTag': tag,
                      'ChatServerImageTag': tag,
                      'NotificationServerImageTag': tag
                  }

              except Exception as e:
                  print(f"Error fetching tags: {str(e)}")
                  raise Exception(f"Failed to get valid tag: {str(e)}")
```
- ECR에서 태드 된 이미지를 조회하고, 최신 이미지 태그를 반환합니다.
- 모듈의 버전은 통일되어 있으므로, 모든 서버에 동일한 이미지 태그를 사용합니다.
  - 따라서 대표적으로 http 모듈의 이미지 태그를 사용합니다.

```yaml
  SendDiscordNotificationFunction:
    Type: AWS::Lambda::Function
    Properties:
      Handler: index.handler
      Runtime: python3.8
      Role: !GetAtt LambdaRole.Arn
      Code:
        ZipFile: |
          import json
          import urllib3
          import os
          
          def handler(event, context):
              http = urllib3.PoolManager()
          
              webhook_url = os.environ['DISCORD_WEBHOOK_URL']
              message = {
                  "embeds": [{
                      "title": event.get('title', 'Notification'),
                      "description": event.get('description', 'No additional details'),
                      "color": event.get('color', 3066993)
                  }]
              }
          
              encoded_msg = json.dumps(message).encode('utf-8')
              resp = http.request('POST', webhook_url, body=encoded_msg, 
                                  headers={'Content-Type': 'application/json'})
              return {"status_code": resp.status}
      Environment:
        Variables:
          DISCORD_WEBHOOK_URL: !Ref DiscordWebhookUrl
```
- Discord Webhook URL을 사용해 Discord 채널로 알림을 전송합니다.


**Step Functions 상태 머신 구성**:
```json
{
  "StartAt": "NotifyWorkflowStart",
  "States": {
    "NotifyWorkflowStart": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": {
        "FunctionName": "${SendDiscordNotificationFunction.Arn}",
        "Payload": {
          "title": "환경 시작 프로세스 시작",
          "description": "개발 환경 구성을 시작합니다...",
          "color": 3447003
        }
      },
      "Next": "CheckStackExists"
    },
    "CheckStackExists": {
      "Type": "Task",
      "Resource": "arn:aws:states:::aws-sdk:cloudformation:describeStacks",
      "Parameters": {
        "StackName": "ChatAppMasterStack"
      },
      "Next": "EvaluateStackStatus",
      "Catch": [
        {
          "ErrorEquals": ["CloudFormation.ValidationError"],
          "Next": "GetECRTags"
        }
      ]
    }
    // ... 이하 생략
  }
}
```

### 3.2 프론트엔드 구현

프론트엔드에서는 백엔드 상태를 주기적으로 확인하고, 상태에 따라 적절한 화면을 표시합니다:

```typescript
// 백엔드 상태 확인 훅
const useBackendStatus = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('https://api.streetcoder.club/actuator/health');
        const data = await response.json();
        
        if (data.status === 'UP') {
          setIsAvailable(true);
          setRetryCount(0);
        } else {
          handleBackendDown();
        }
      } catch (error) {
        handleBackendDown();
      }
    };

    const handleBackendDown = () => {
      setIsAvailable(false);
      
      // 3번까지만 재시도
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 5000);
      }
    };

    // 30초마다 상태 체크
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [retryCount]);

  return isAvailable;
};

// 애플리케이션 컨테이너
const AppContainer = () => {
  const isBackendAvailable = useBackendStatus();

  if (!isBackendAvailable) {
    return (
      <MaintenancePage
        startTime="오전 9시"
        contactEmail="support@streetcoder.club"
      />
    );
  }

  return <MainApplication />;
};

// 유지보수 페이지 컴포넌트
const MaintenancePage = ({ startTime, contactEmail }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center max-w-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          시스템 점검 중
        </h1>
        <p className="text-gray-600 mb-4">
          현재 시스템 정기 점검이 진행 중입니다.
          {startTime}에 서비스가 재개될 예정입니다.
        </p>
        <p className="text-sm text-gray-500">
          문의사항: {contactEmail}
        </p>
      </div>
    </div>
  );
};
```

## 4. 도입 효과

### 4.1 비용 절감
- 월간 인프라 비용 75% 절감 ($119.90 절약)
- 리소스 사용의 효율성 극대화
- 예측 가능한 비용 관리

### 4.2 운영 개선
- 수동 환경 관리 업무 제거
- Discord를 통한 투명한 상태 모니터링
- 자동화된 프로세스로 인적 오류 방지

### 4.3 기술적 이점
- AWS 네이티브 서비스를 활용한 안정적인 운영
- 프론트엔드 중심의 상태 관리로 사용자 경험 향상
- 확장 가능한 자동화 아키텍처 구축

## 5. 향후 개선 계획

- 수동 제어 기능 추가 (긴급 상황 대응)
- 상태 모니터링 및 메트릭 수집 강화
- 알림 채널 다변화 (이메일, 슬랙 등)
- 특수 상황(공휴일, 특별 근무일 등)에 대한 스케줄링 지원