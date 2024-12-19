---
title: "Managed Rule(관리형 규칙)"
description: "AWS Config의 관리형 규칙을 상세히 알아봅니다. 보안, 운영 효율성을 위한 주요 규칙들의 설정 방법과 모범 사례를 실제 예제와 함께 설명합니다. AWS 리소스의 규정 준수를 자동화하고 모니터링하는 방법을 배우실 수 있습니다."
tags: ["AWS_CONFIG", "AWS", "EC2", "S3", "IAM", "CLOUD", "SECURITY", "DEVOPS"]
keywords: ["AWS Config", "AWS 컨피그", "관리형 규칙", "managed rules", "AWS 보안", "AWS security", "규정 준수", "compliance", "리소스 모니터링", "resource monitoring", "클라우드 보안", "cloud security", "AWS 모니터링", "AWS monitoring", "보안 자동화", "security automation", "AWS 리소스 관리", "resource management", "AWS 감사", "AWS audit"]
draft: false
hide_title: true
---

## 1 AWS Config와 관리형 규칙 소개

- AWS Config는 AWS 리소스의 구성을 평가, 감사 및 평가할 수 있게 해주는 서비스입니다.
- 관리형 규칙은 AWS가 사전 정의한 규칙으로, 일반적인 규정 준수 검사를 쉽게 구현할 수 있게 해줍니다.
- 이러한 규칙들은 보안, 운영 효율성, 비용 최적화 등 다양한 측면을 다룹니다.

## 2 AWS Config 관리형 규칙의 장점

- 즉시 사용 가능한 미리 정의된 규칙을 제공합니다.
- AWS 모범 사례를 기반으로 설계되었습니다.
- 지속적인 업데이트와 유지보수를 AWS가 담당합니다.
- 최소한의 설정으로 복잡한 규정 준수 검사를 구현할 수 있습니다.

## 3 주요 관리형 규칙 예시

### 3.1 보안 관련 규칙

- **s3-bucket-public-read-prohibited**: S3 버킷의 공개 읽기 액세스를 모니터링
- **iam-password-policy**: IAM 암호 정책이 지정된 요구 사항을 충족하는지 확인
- **encrypted-volumes**: EBS 볼륨이 암호화되어 있는지 확인
- **vpc-sg-open-only-to-authorized-ports**: 보안 그룹의 인바운드 규칙 검사
- **restricted-ssh**: security group에 SSH 액세스 제한 했는지 확인

### 3.2 운영 효율성 관련 규칙

- **required-tags**: 필수 태그가 리소스에 적용되어 있는지 확인
- **ec2-instance-detailed-monitoring-enabled**: EC2 상세 모니터링 활성화 여부 확인
- **cloudtrail-enabled**: CloudTrail 로깅이 활성화되어 있는지 확인
- **ec2-instance-profile-attached**: EC2 인스턴스 프로필이 연결되어 있는지 확인

## 4 관리형 규칙 구성 방법

### 4.1 기본 설정 단계

1. AWS Config 콘솔에서 "규칙 추가" 선택
2. "AWS 관리형 규칙" 카테고리에서 원하는 규칙 선택
3. 규칙 파라미터 구성
4. 범위 설정 (모든 리소스 또는 특정 리소스)
5. 교정 작업 설정 (선택 사항)

### 4.2 예시: S3 버킷 공개 액세스 모니터링 설정

**AWS 콘솔에서 설정**

1. AWS Config 콘솔 접속
2. '규칙' 메뉴에서 '규칙 추가' 선택
3. 's3-bucket-public-read-prohibited' 규칙 선택
4. 규칙 이름과 설명 입력
5. SNS 알림 설정 (선택)

**AWS CLI를 통한 설정**

```bash
aws configservice put-config-rule --config-rule '{
    "ConfigRuleName": "s3-public-read-prohibited",
    "Source": {
        "Owner": "AWS",
        "SourceIdentifier": "S3_BUCKET_PUBLIC_READ_PROHIBITED"
    },
    "Scope": {
        "ComplianceResourceTypes": [
            "AWS::S3::Bucket"
        ]
    }
}'
```

- 위 명령은 S3 버킷의 공개 읽기 액세스를 금지하는 규칙을 생성합니다.
- 규칙 위반 시 자동으로 비준수 상태로 표시됩니다.

## 5 알림 설정

### 5.1 SNS 주제 생성

```bash
aws sns create-topic --name config-rule-notifications
```

### 5.2 SNS 구독 설정

```bash
aws sns subscribe \
    --topic-arn arn:aws:sns:region:account-id:config-rule-notifications \
    --protocol email \
    --notification-endpoint your-email@example.com
```

### 5.3 Config 규칙에 SNS 연결

```bash
aws configservice put-config-rule --config-rule '{
    "ConfigRuleName": "s3-public-read-prohibited",
    "Source": {
        "Owner": "AWS",
        "SourceIdentifier": "S3_BUCKET_PUBLIC_READ_PROHIBITED"
    },
    "Scope": {
        "ComplianceResourceTypes": [
            "AWS::S3::Bucket"
        ]
    },
    "ConfigRuleState": "ACTIVE"
}'
```

## 6 자동 교정 설정

- 규칙 위반 시 자동으로 교정 작업을 수행할 수 있습니다.
- 교정 작업은 SSM Automation 문서를 사용하여 정의됩니다.

### 6.1 교정 작업 정의

```json
{
    "Type": "AWS::Config::RemediationConfiguration",
    "Properties": {
        "ConfigRuleName": "s3-public-read-prohibited",
        "TargetType": "SSM_DOCUMENT",
        "TargetId": "AWS-DisableS3BucketPublicReadWrite",
        "Parameters": {
            "AutomationAssumeRole": {
                "StaticValue": {
                    "Values": [
                        "arn:aws:iam::account-id:role/RemediationRole"
                    ]
                }
            },
            "BucketName": {
                "ResourceValue": {
                    "Value": "RESOURCE_ID"
                }
            }
        }
    }
}
```

## 7 문제 해결 가이드

### 7.1 일반적인 문제

- **규칙이 평가되지 않는 경우**:
	- AWS Config 레코더가 활성화되어 있는지 확인
	- IAM 권한이 올바르게 설정되어 있는지 확인
	- 대상 리소스가 규칙 범위에 포함되어 있는지 확인
- **알림이 수신되지 않는 경우**:
	- SNS 주제 권한 확인
	- 이메일 구독이 확인되었는지 확인
	- CloudWatch 로그에서 오류 확인

## 8 모범 사례

- 필요한 규칙만 활성화하여 비용 최적화
- 정기적으로 규칙 평가 결과 검토
- 중요한 규칙에 대해서만 알림 설정
- 자동 교정 작업 설정 시 충분한 테스트 수행
- 규칙 변경 사항을 문서화하고 추적

## 9 결론

- AWS Config 관리형 규칙은 AWS 리소스의 규정 준수를 자동으로 모니터링하고 관리하는 강력한 도구입니다.
- S3 버킷의 공개 액세스와 같은 중요한 보안 설정을 지속적으로 모니터링할 수 있습니다.
- SNS를 통한 알림과 자동 교정 기능을 활용하면 신속하게 문제에 대응할 수 있습니다.
- 이를 통해 보안 정책을 효과적으로 시행하고 규정 준수를 유지할 수 있습니다.