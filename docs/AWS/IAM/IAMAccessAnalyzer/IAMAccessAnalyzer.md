## 1 AWS IAM Access Analyzer란?

- AWS IAM Access Analyzer는 외부 엔티티와 공유되는 조직 및 계정의 리소스를 식별하는 서비스입니다.
- 보안 관리자가 리소스에 대한 의도하지 않은 접근을 찾아내고 수정할 수 있도록 도와줍니다.
- IAM Access Analyzer는 수학적 증명을 사용하여 리소스 접근성을 분석합니다.
- 분석 결과를 통해 보안 태세를 강화하고 규정 준수를 입증할 수 있습니다.



## 2 주요 기능

- 외부 접근 가능한 리소스를 자동으로 검색하고 보고합니다.
- 정책 검증 및 생성을 지원하여 보안 모범 사례를 따르도록 돕습니다.
- 지속적인 모니터링으로 리소스 접근성 변경을 실시간으로 알려줍니다.
- AWS Organizations와 통합되어 조직 전체의 리소스를 분석할 수 있습니다.



## 3 정책 생성 기능

### 3.1 CloudTrail 기반 정책 생성

- IAM Access Analyzer는 CloudTrail 로그를 분석하여 최소 권한의 IAM 정책을 생성합니다:
  - CloudTrail에 기록된 AWS API 호출을 기반으로 실제 사용되는 권한만 포함
  - 지난 90일 동안의 활동을 분석하여 정책 생성
  - 불필요한 권한을 제거하여 보안 모범 사례 준수



**정책 생성 과정**

```plaintext
1. AWS CloudTrail 활성화
2. IAM Access Analyzer 접근
3. Policy generation 메뉴 선택
4. 분석할 IAM 역할이나 사용자 선택
5. Generate policy 클릭
```

### 3.2 정책 생성 요구사항

	- 정책 생성을 위해 필요한 조건:
	- CloudTrail이 활성화되어 있어야 함
	- 최소 90일 이상의 CloudTrail 로그 데이터
	- IAM Access Analyzer에 대한 적절한 권한 설정



## 4 분석 범위

- IAM Access Analyzer는 다음과 같은 AWS 리소스들을 분석합니다:
	- Amazon S3 버킷
	- IAM 역할
	- KMS 키
	- Lambda 함수 및 레이어
	- Amazon SQS 대기열
	- Secrets Manager 보안 암호
	- AWS Backup 볼트
	- Amazon EBS 스냅샷
	- Amazon ECR 리포지토리
	- Amazon EFS 파일 시스템
	- Amazon RDS 스냅샷



## 5 정책 생성 예시

### 5.1 AWS Management Console을 통한 정책 생성

**단계별 정책 생성 방법**

```plaintext
1. AWS Management Console에서 IAM 서비스로 이동
2. Access Analyzer 섹션 선택
3. Generate policy 메뉴 선택
4. 정책을 생성할 IAM 엔터티 선택
5. CloudTrail 데이터 분석 기간 설정
6. Generate policy 클릭하여 정책 생성
```



### 5.2 생성된 정책 예시

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::my-bucket/*"
            ]
        }
    ]
}
```

- CloudTrail 로그 분석 결과 실제로 사용된 S3 버킷 접근 권한만 포함됩니다.
- 불필요한 와일드카드 권한이 제거되어 최소 권한 원칙을 준수합니다.



## 6 모니터링 및 알림 설정

### 6.1 EventBridge 규칙 설정

**EventBridge 규칙 생성**

```bash
aws events put-rule \
    --name "AccessAnalyzerFindingsRule" \
    --event-pattern "{\"source\":[\"aws.access-analyzer\"]}"
```



### 6.2 SNS 알림 설정

- 새로운 결과가 발견되면 다음과 같은 채널로 알림을 받을 수 있습니다:
	- Amazon SNS 주제
	- Amazon EventBridge
	- AWS Security Hub
	- AWS CloudWatch



## 7 모범 사례

- IAM Access Analyzer 활용을 위한 권장 사항:
	- CloudTrail 로깅을 항상 활성화하여 정확한 정책 생성 지원
	- 정기적으로 정책을 검토하고 업데이트
	- 생성된 정책을 적용하기 전에 테스트 환경에서 검증
	- 최소 권한 원칙 준수를 위해 지속적으로 정책 최적화
	- 불필요한 권한 즉시 제거



## 8 결론

- IAM Access Analyzer는 AWS 리소스의 보안을 강화하는 필수 도구입니다.
- CloudTrail 로그를 기반으로 최소 권한의 IAM 정책을 자동 생성합니다.
- 과도한 권한을 가진 정책을 최적화하여 보안 위험을 최소화합니다.
- 지속적인 모니터링과 정책 최적화로 보안 태세를 강화합니다.
- 정책 생성 시 반드시 CloudTrail이 활성화되어 있어야 합니다.