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

### 1.2 현재 AWS CloudFormation 스택 구조
```
ChatAppMasterStack
├── NetworkStack (VPC, 서브넷, 보안그룹 등)
├── DatabaseStack (DocumentDB, Redis)
├── LoadBalancerStack (ALB, 타겟 그룹)
├── ECSClusterStack (ECS 클러스터, EC2 인스턴스)
└── ServerStack (ECS 서비스, 작업 정의)
```
- 현재 시스템은 다음과 같은 중첩 스택 구조로 이루어져 있습니다
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
- 개발/스테이징 환경의 비용을 최적화하기 위해 다음과 같은 자동화 시스템을 구축합니다.
- 자동화 시스템은 AWS 서비스를 활용해 환경 시작/중지 프로세스를 자동화하고, Discord로 알림을 전송합니다.

### 2.1 시스템 구성 요소
- **EventBridge**: 정해진 시간에 자동으로 Step Functions를 실행합니다.
- **Step Functions**: 환경 생성/삭제 과정을 조율합니다.
  - 총 2개의 상태 머신을 사용해 환경 시작/중지와 관련된 복잡한 프로세스를 구현합니다.
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
- 자동화 시스템의 구성 요소는 AWS CloudFormation을 사용해 정의합니다.
- 자동화 시스템의 핵심인 EventBridge, Step Functions, Lambda Functions에 대해서만 구현 방법을 소개합니다.

### 3.1 EventBridge 스케줄러 구현
- 먼저 EventBridge 스케줄러를 정의합니다.
- `StartEnvironmentRule`과 `StopEnvironmentRule`을 생성하여 평일 오전 9시와 오후 6시에 Step Functions을 실행하도록 설정합니다.
- 이때, Step Functions은 환경 시작/중지 프로세스를 실행합니다.

**AWS CloudFormation 템플릿**
```yaml
  SchedulerStartRule:
    Type: AWS::Events::Rule
    Properties:
      Description: 'EventBridge rule to start development environment at 9 AM'
      ScheduleExpression: 'cron(0 0 ? * MON-FRI *)'
      State: ENABLED
      Targets:
        - Arn: !Ref EnvironmentStartStateMachine
          Id: "StartDevelopmentEnvironment"
          RoleArn: !GetAtt EventBridgeRole.Arn

  SchedulerStopRule:
    Type: AWS::Events::Rule
    Properties:
      Description: 'EventBridge rule to stop development environment at 6 PM'
      ScheduleExpression: 'cron(0 9 ? * MON-FRI *)'
      State: ENABLED
      Targets:
        - Arn: !Ref EnvironmentStopStateMachine
          Id: "StopDevelopmentEnvironment"
          RoleArn: !GetAtt EventBridgeRole.Arn

```
- `ScheduleExpression`을 사용해 스케줄을 정의합니다.
- `Targets`에 실행할 Step Functions을 지정합니다.

### 3.2 Lambda Functions 구현
- `GetECRTagsFunction`과 `SendDiscordNotificationFunction`을 정의합니다.
- `GetECRTagsFunction`: ECR에서 최신 이미지 태그를 조회하는 함수
- `SendDiscordNotificationFunction`: Discord로 알림을 전송하는 함수

**AWS CloudFormation 템플릿**
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
```
- `GetECRTagsFunction`은 ECR에서 이미지 태그를 조회하는 함수입니다.
  - `describe_images` 메서드를 사용해 chat-chat-http 리포지토리의 태그된 이미지를 조회합니다.
  - 가장 최신 이미지를 선택하여 반환합니다.
  - 각 모듈은 같은 이미지 태그를 사용하므로 대표적으로 하나의 태그만 사용했습니다.
- `SendDiscordNotificationFunction`은 Discord로 알림을 전송하는 함수입니다.
  - Discord Webhook URL을 환경 변수로부터 읽어와 알림 메시지를 전송합니다.
  - `title`, `description`, `color` 등의 파라미터를 받아 사용자 정의 메시지를 전송합니다.
  - Step Functions에서 상황에 맞는 메시지를 전송하기 위해 사용됩니다.

### 3.3 Step Functions 구현
- `EnvironmentStartStateMachine`과 `EnvironmentStopStateMachine`을 정의합니다.
- `EnvironmentStartStateMachine`: 개발 환경 시작 프로세스 정의
- `EnvironmentStopStateMachine`: 개발 환경 중지 프로세스 정의

#### 3.2.1 EnvironmentStartStateMachine
- 개발 환경 시작 프로세스를 정의합니다.
- 환경 시작 전에 기존 스택이 존재하는지 확인하고, ECR에서 이미지 태그를 조회한 후 스택을 생성합니다.
- 이미 스택이 존재하거나 스택 생성이 진행 중인 경우 알림을 전송하고 프로세스를 종료합니다.

**AWS CloudFormation 템플릿**
```yaml
  EnvironmentStartStateMachine:
    Type: AWS::StepFunctions::StateMachine
    Properties:
      RoleArn: !GetAtt StepFunctionsRole.Arn
      DefinitionString:
        !Sub |
        {
          "Comment": "Development Environment Start Workflow",
          "StartAt": "NotifyWorkflowStart",
          "TimeoutSeconds": 3600,
          "States": {
            "NotifyWorkflowStart": {
              "Type": "Task",
              "Resource": "arn:aws:states:::lambda:invoke",
              "Parameters": {
                "FunctionName": "${SendDiscordNotificationFunction.Arn}",
                "Payload": {
                  "title": "Development Environment Startup Initiated",
                  "description": "Starting ChatApp infrastructure deployment process...",
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
              "ResultPath": "$.stackInfo",
              "Next": "EvaluateInitialStackStatus",
              "Catch": [
                {
                  "ErrorEquals": ["CloudFormation.CloudFormationException"],
                  "ResultPath": "$.error",
                  "Next": "GetECRTags"
                }
              ]
            },
            "EvaluateInitialStackStatus": {
              "Type": "Choice",
              "Choices": [
                {
                  "Variable": "$.stackInfo.Stacks[0].StackStatus",
                  "StringMatches": "*_COMPLETE",
                  "Next": "NotifyStackAlreadyExists"
                },
                {
                  "Variable": "$.stackInfo.Stacks[0].StackStatus",
                  "StringMatches": "*_IN_PROGRESS",
                  "Next": "NotifyStackInProgress"
                }
              ],
              "Default": "GetECRTags"
            },
            "NotifyStackInProgress": {
              "Type": "Task",
              "Resource": "arn:aws:states:::lambda:invoke",
              "Parameters": {
                "FunctionName": "${SendDiscordNotificationFunction.Arn}",
                "Payload": {
                  "title": "Environment Start Failed",
                  "description": "Stack operation already in progress. Please wait for it to complete.",
                  "color": 15158332
                }
              },
              "End": true
            },
            "NotifyStackAlreadyExists": {
              "Type": "Task",
              "Resource": "arn:aws:states:::lambda:invoke",
              "Parameters": {
                "FunctionName": "${SendDiscordNotificationFunction.Arn}",
                "Payload": {
                  "title": "Environment Start Skipped",
                  "description": "ChatApp infrastructure is already running",
                  "color": 3447003
                }
              },
              "End": true
            },
            "GetECRTags": {
              "Type": "Task",
              "Resource": "arn:aws:states:::lambda:invoke",
              "Parameters": {
                "FunctionName": "${GetECRTagsFunction.Arn}",
                "Payload.$": "$"
              },
              "ResultPath": "$.imageTags",
              "Next": "CreateStack",
              "Retry": [
                {
                  "ErrorEquals": ["States.ALL"],
                  "IntervalSeconds": 30,
                  "MaxAttempts": 3,
                  "BackoffRate": 2.0
                }
              ]
            },
            "CreateStack": {
              "Type": "Task",
              "Resource": "arn:aws:states:::aws-sdk:cloudformation:createStack",
              "Parameters": {
                "StackName": "ChatAppMasterStack",
                "RoleARN": "${CloudFormationServiceRole.Arn}",
                "TemplateURL": "https://${S3BucketName}.s3.amazonaws.com/${S3KeyPrefix}master-stack.yaml",
                "Parameters": [
                  {
                    "ParameterKey": "APIServerImageTag",
                    "ParameterValue.$": "$.imageTags.Payload.APIServerImageTag"
                  },
                  {
                    "ParameterKey": "ChatServerImageTag",
                    "ParameterValue.$": "$.imageTags.Payload.ChatServerImageTag"
                  },
                  {
                    "ParameterKey": "NotificationServerImageTag",
                    "ParameterValue.$": "$.imageTags.Payload.NotificationServerImageTag"
                  }
                ],
                "Capabilities": [
                  "CAPABILITY_IAM",
                  "CAPABILITY_NAMED_IAM"
                ]
              },
              "Next": "WaitForStackOperation",
              "Retry": [
                {
                  "ErrorEquals": ["States.ALL"],
                  "IntervalSeconds": 30,
                  "MaxAttempts": 3,
                  "BackoffRate": 2.0
                }
              ]
            },
            "WaitForStackOperation": {
              "Type": "Wait",
              "Seconds": 60,
              "Next": "CheckStackDeployment"
            },
            "CheckStackDeployment": {
              "Type": "Task",
              "Resource": "arn:aws:states:::aws-sdk:cloudformation:describeStacks",
              "Parameters": {
                "StackName": "ChatAppMasterStack"
              },
              "ResultPath": "$.deploymentCheck",
              "Next": "EvaluateDeploymentStatus",
              "Catch": [
                {
                  "ErrorEquals": ["CloudFormation.CloudFormationException"],
                  "ResultPath": "$.error",
                  "Next": "SendFailureNotification"
                }
              ]
            },
            "EvaluateDeploymentStatus": {
              "Type": "Choice",
              "Choices": [
                {
                  "Variable": "$.deploymentCheck.Stacks[0].StackStatus",
                  "StringEquals": "CREATE_COMPLETE",
                  "Next": "SendSuccessNotification"
                },
                {
                  "Variable": "$.deploymentCheck.Stacks[0].StackStatus",
                  "StringMatches": "*_IN_PROGRESS",
                  "Next": "WaitForStackOperation"
                }
              ],
              "Default": "SendFailureNotification"
            },
            "SendSuccessNotification": {
              "Type": "Task",
              "Resource": "arn:aws:states:::lambda:invoke",
              "Parameters": {
                "FunctionName": "${SendDiscordNotificationFunction.Arn}",
                "Payload": {
                  "title": "Development Environment Started",
                  "description": "ChatApp infrastructure deployed successfully",
                  "color": 3066993
                }
              },
              "End": true
            },
            "SendFailureNotification": {
              "Type": "Task",
              "Resource": "arn:aws:states:::lambda:invoke",
              "Parameters": {
                "FunctionName": "${SendDiscordNotificationFunction.Arn}",
                "Payload": {
                  "title": "Infrastructure Deployment Failed",
                  "description.$": "$.error.Cause",
                  "color": 15158332
                }
              },
              "End": true
            }
          }
        }
```
- `NotifyWorkflowStart`: 개발 환경 시작을 알리는 Discord 알림을 전송합니다.
- `CheckStackExists`: ChatAppMasterStack이 이미 존재하는지 확인합니다.
  - 존재하면 `EvaluateInitialStackStatus`로 이동합니다. 
  - 존재하지 않으면 `GetECRTags`로 이동합니다. 
- `EvaluateInitialStackStatus`: ChatAppMasterStack의 상태를 확인합니다.
    - `*_COMPLETE` 상태이면 `NotifyStackAlreadyExists`로 이동합니다. 
    - `*_IN_PROGRESS` 상태이면 `NotifyStackInProgress`로 이동합니다.
- `GetECRTags`: ECR에서 최신 이미지 태그를 조회합니다.
- `CreateStack`: ChatAppMasterStack을 생성합니다.
- `WaitForStackOperation`: 스택 생성 작업이 완료될 때까지 60초 대기합니다.
- `CheckStackDeployment`: 스택 생성 상태를 확인합니다.
- `EvaluateDeploymentStatus`: 스택 생성 상태를 평가합니다.
  - `CREATE_COMPLETE` 상태이면 `SendSuccessNotification`으로 이동합니다.
  - `*_IN_PROGRESS` 상태이면 `WaitForStackOperation`으로 이동합니다.

#### 3.2.2 EnvironmentStopStateMachine
- 개발 환경 중지 프로세스를 정의합니다.
- `EnvironmentStopStateMachine`은 `EnvironmentStartStateMachine`과 유사한 구조를 가집니다.
- 중지 프로세스를 수행하고, Discord로 알림을 전송합니다.

**AWS CloudFormation 템플릿**
```yaml
  EnvironmentStopStateMachine:
    Type: AWS::StepFunctions::StateMachine
    Properties:
      RoleArn: !GetAtt StepFunctionsRole.Arn
      DefinitionString:
        !Sub |
        {
          "Comment": "Development Environment Stop Workflow",
          "StartAt": "NotifyWorkflowStart",
          "TimeoutSeconds": 3600,
          "States": {
            "NotifyWorkflowStart": {
              "Type": "Task",
              "Resource": "arn:aws:states:::lambda:invoke",
              "Parameters": {
                "FunctionName": "${SendDiscordNotificationFunction.Arn}",
                "Payload": {
                  "title": "Development Environment Shutdown Initiated",
                  "description": "Starting ChatApp infrastructure shutdown process...",
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
              "ResultPath": "$.stackInfo",
              "Next": "EvaluateStackStatus",
              "Catch": [
                {
                  "ErrorEquals": ["CloudFormation.CloudFormationException"],
                  "ResultPath": "$.error",
                  "Next": "NotifyStackNotExists"
                }
              ]
            },
            "EvaluateStackStatus": {
              "Type": "Choice",
              "Choices": [
                {
                  "Variable": "$.stackInfo.Stacks[0].StackStatus",
                  "StringMatches": "*_IN_PROGRESS",
                  "Next": "NotifyStackInProgress"
                }
              ],
              "Default": "DeleteStack"
            },
            "NotifyStackInProgress": {
              "Type": "Task",
              "Resource": "arn:aws:states:::lambda:invoke",
              "Parameters": {
                "FunctionName": "${SendDiscordNotificationFunction.Arn}",
                "Payload": {
                  "title": "Environment Stop Failed",
                  "description": "Stack operation already in progress. Please wait for it to complete.",
                  "color": 15158332
                }
              },
              "End": true
            },
            "NotifyStackNotExists": {
              "Type": "Task",
              "Resource": "arn:aws:states:::lambda:invoke",
              "Parameters": {
                "FunctionName": "${SendDiscordNotificationFunction.Arn}",
                "Payload": {
                  "title": "Environment Stop Skipped",
                  "description.$": "$.error.Cause",
                  "color": 3447003
                }
              },
              "End": true
            },
            "DeleteStack": {
              "Type": "Task",
              "Resource": "arn:aws:states:::aws-sdk:cloudformation:deleteStack",
              "Parameters": {
                "StackName": "ChatAppMasterStack",
                "RoleARN": "${CloudFormationServiceRole.Arn}"
              },
              "Next": "WaitForStackOperation",
              "Retry": [
                {
                  "ErrorEquals": ["States.ALL"],
                  "IntervalSeconds": 30,
                  "MaxAttempts": 3,
                  "BackoffRate": 2.0
                }
              ]
            },
            "WaitForStackOperation": {
              "Type": "Wait",
              "Seconds": 60,
              "Next": "CheckStackDeletion"
            },
            "CheckStackDeletion": {
              "Type": "Task",
              "Resource": "arn:aws:states:::aws-sdk:cloudformation:describeStacks",
              "Parameters": {
                "StackName": "ChatAppMasterStack"
              },
              "ResultPath": "$.deletionCheck",
              "Next": "EvaluateDeletionStatus",
              "Catch": [
                {
                  "ErrorEquals": ["CloudFormation.CloudFormationException"],
                  "ResultPath": "$.error",
                  "Next": "SendSuccessNotification"
                }
              ]
            },
            "EvaluateDeletionStatus": {
              "Type": "Choice",
              "Choices": [
                {
                  "Variable": "$.deletionCheck.Stacks[0].StackStatus",
                  "StringEquals": "DELETE_COMPLETE",
                  "Next": "SendSuccessNotification"
                },
                {
                  "Variable": "$.deletionCheck.Stacks[0].StackStatus",
                  "StringMatches": "*_IN_PROGRESS",
                  "Next": "WaitForStackOperation"
                }
              ],
              "Default": "SendFailureNotification"
            },
            "SendSuccessNotification": {
              "Type": "Task",
              "Resource": "arn:aws:states:::lambda:invoke",
              "Parameters": {
                "FunctionName": "${SendDiscordNotificationFunction.Arn}",
                "Payload": {
                  "title": "Development Environment Stopped",
                  "description": "ChatApp infrastructure deleted successfully",
                  "color": 3066993
                }
              },
              "End": true
            },
            "SendFailureNotification": {
              "Type": "Task",
              "Resource": "arn:aws:states:::lambda:invoke",
              "Parameters": {
                "FunctionName": "${SendDiscordNotificationFunction.Arn}",
                "Payload": {
                  "title": "Infrastructure Deletion Failed",
                  "description.$": "$.deletionCheck.Stacks[0].StackStatus",
                  "color": 15158332
                }
              },
              "End": true
            }
          }
        }
```
- `NotifyWorkflowStart`: 개발 환경 중지를 알리는 Discord 알림을 전송합니다.
- `CheckStackExists`: ChatAppMasterStack이 존재하는지 확인합니다.
    - 존재하면 `EvaluateStackStatus`로 이동합니다.
    - 존재하지 않으면 `NotifyStackNotExists`로 이동합니다.
- `EvaluateStackStatus`: ChatAppMasterStack의 상태를 확인합니다.
  - 스택 작업이 이미 진행 중인 경우 `NotifyStackInProgress`로 이동합니다.
  - 그렇지 않으면 `DeleteStack`으로 이동합니다.
- `DeleteStack`: ChatAppMasterStack을 삭제합니다.
- `WaitForStackOperation`: 스택 삭제 작업이 완료될 때까지 60초 대기합니다.
- `CheckStackDeletion`: 스택 삭제 상태를 확인합니다.
- `EvaluateDeletionStatus`: 스택 삭제 상태를 평가합니다.
    - `DELETE_COMPLETE` 상태이면 `SendSuccessNotification`으로 이동합니다.
    - `*_IN_PROGRESS` 상태이면 `WaitForStackOperation`으로 이동합니다.

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
- 확장 가능한 자동화 아키텍처 구축

## 5. 향후 개선 계획
- 수동 제어 기능 추가 (긴급 상황 대응)
- 상태 모니터링 및 메트릭 수집 강화
- 알림 채널 다변화 (이메일, 슬랙 등)
- 특수 상황(공휴일, 특별 근무일 등)에 대한 스케줄링 지원