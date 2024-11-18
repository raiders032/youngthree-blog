---
title: Amazon Machine Images (AMI)
description: AMI (Amazon Machine Image)는 EC2 인스턴스를 시작하는 데 필요한 모든 정보가 포함된 템플릿입니다. AMI의 구성 요소, 유형, 생성 방법, 사용 사례, 관리 방법 등에 대해 알아봅니다.
keywords: [aws, ami]
tags: [AWS, EC2, AMI]
draft: true
authors:
  - name: Noh Young Sam
    title: 개발자
    url: https://github.com/raiders032
    image_url: https://github.com/raiders032.png
---

## 1 Amazon Machine Images

- Amazon Machine Image (AMI)는 EC2 인스턴스를 시작하는 데 필요한 모든 정보가 포함된 템플릿입니다.
- AMI에는 운영 체제, 애플리케이션 서버, 애플리케이션 등 인스턴스의 소프트웨어 구성이 포함됩니다.
- AMI는 AWS Management Console, AWS CLI, SDK를 통해 사용할 수 있습니다.
- AMIs는 특정 AWS 리전을 위해 구축되며, 각 AWS 리전마다 고유합니다. 
	- 다른 AWS 리전에서 AMI를 사용하여 EC2 인스턴스를 시작할 수는 없지만, 해당 AMI를 대상 AWS 리전으로 복사한 후 이를 사용하여 EC2 인스턴스를 생성할 수 있습니다.



## 2 AMI의 구성 요소

- **루트 볼륨 템플릿**: 운영 체제, 애플리케이션 서버, 애플리케이션을 포함합니다.
- **인스턴스 스토리지 매핑**: 인스턴스 시작 시 연결되는 볼륨을 지정합니다.
- **시작 권한**: 특정 AWS 계정이 AMI에서 인스턴스를 시작할 수 있도록 권한을 부여합니다.
- **블록 디바이스 매핑**: 인스턴스 시작 시 연결될 EBS 볼륨, 인스턴스 스토어, 스냅샷 정보를 포함합니다.



## 3 AMI 유형

- **퍼블릭 AMI**: 모든 AWS 사용자에게 공개되어 사용이 가능합니다.
- **공유 AMI**: 특정 AWS 계정과 공유된 AMI입니다.
- **커뮤니티 AMI**: AWS 커뮤니티에서 제공하며, 사용자는 자신의 요구에 맞는 AMI를 선택할 수 있습니다.
- **Marketplace AMI**: AWS Marketplace에서 제공하는 상용 AMI로, 라이센스 및 지원을 포함합니다.



## 4 AMI 생성 방법

- **AWS Management Console**
    - EC2 대시보드에서 인스턴스를 선택하고, "이미지 생성"을 클릭하여 AMI를 생성할 수 있습니다.
    - 인스턴스 상태를 중지하지 않고 AMI를 생성할 수 있습니다.
- **AWS CLI**
	- `aws ec2 create-image --instance-id i-1234567890abcdef0 --name "My server" --no-reboot`
    - `--no-reboot` 옵션을 사용하여 인스턴스를 재부팅하지 않고 AMI를 생성할 수 있습니다.
- **SDK**
    - AWS SDK를 사용하여 프로그래밍 방식으로 AMI를 생성할 수 있습니다.



## 5 AMI 사용 사례

- **인프라 자동화**: 동일한 설정으로 여러 인스턴스를 신속하게 시작할 수 있습니다.
- **백업 및 복원**: 현재 인스턴스 상태를 저장하고 필요할 때 복원할 수 있습니다.
- **배포 환경 표준화**: 여러 환경에서 일관된 인스턴스 구성을 보장할 수 있습니다.



## 6 AMI 관리

- **AMI 삭제**
    - 더 이상 사용하지 않는 AMI는 삭제하여 비용을 절감할 수 있습니다.
    - AWS Management Console 또는 AWS CLI를 사용하여 AMI를 삭제할 수 있습니다.
- **AMI 복사**
    - AMI를 다른 리전으로 복사하여 글로벌 배포를 지원할 수 있습니다.
    - AWS Management Console 또는 AWS CLI를 사용하여 AMI를 복사할 수 있습니다.



## 7 Amazon Data Lifecycle Manager

- [AWS Data Lifecycle Manager 공식 문서](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/snapshot-lifecycle.html)
- Amazon Data Lifecycle Manager를 사용하면 EBS 스냅샷과 EBS 지원 AMI의 생성, 보존, 삭제를 자동화할 수 있습니다.
- 스냅샷 및 AMI 관리를 자동화하면 다음과 같은 이점을 얻을 수 있습니다:
    - 정기적인 백업 일정을 통해 중요한 데이터를 보호합니다.
    - 정기적으로 갱신되는 표준화된 AMI를 생성합니다.
    - 감사자나 내부 규정 준수를 위해 백업을 보존합니다.
    - 오래된 백업을 삭제하여 스토리지 비용을 절감합니다.
    - 데이터를 격리된 리전이나 계정으로 백업하는 재해 복구 백업 정책을 생성합니다.



## 8 AMI No-Reboot 옵션

- AMI No-Reboot 옵션은 EC2 인스턴스에서 AMI를 생성할 때 인스턴스를 재부팅하지 않고 이미지를 만드는 기능입니다.
- 이 옵션의 주요 특징:
    - 서비스 중단을 최소화할 수 있습니다.
    - AMI 생성 시간이 단축됩니다.
    - 실행 중인 인스턴스의 실시간 상태를 그대로 캡처할 수 있습니다.
- 주의사항
    - 데이터 일관성이 완벽하게 보장되지 않을 수 있습니다.
    - 메모리나 캐시의 데이터가 디스크에 완전히 쓰여지지 않았을 수 있습니다.
- 사용 방법
    - AWS Management Console: AMI 생성 시 'No reboot' 옵션 체크
    - AWS CLI: `aws ec2 create-image` 명령어에 `--no-reboot` 플래그 추가



## 9 AMI 마이그레이션 및 공유 시나리오

### 9.1 가용 영역(AZ) 간 마이그레이션

#### 9.1.1 비암호화 AMI의 AZ 간 마이그레이션

- 가장 단순한 마이그레이션 시나리오:
  1. 원본 인스턴스에서 AMI 생성
  2. 새로운 AZ에서 인스턴스 시작
  3. 필요한 경우 Elastic IP 재할당
  4. 테스트 후 원본 인스턴스 종료



#### 9.1.2 암호화된 AMI의 AZ 간 마이그레이션

- KMS 키가 동일 리전에서 사용되므로 추가 설정 불필요:
  1. 원본 인스턴스에서 암호화된 AMI 생성
  2. 새로운 AZ에서 인스턴스 시작
  3. 동일한 KMS 키로 자동 암호화 유지
  4. 테스트 후 원본 인스턴스 종료



### 9.2 리전 간 마이그레이션

#### 9.2.1 비암호화 AMI의 리전 간 마이그레이션

- 기본적인 리전 간 복사 프로세스:
	- 원본 인스턴스에서 AMI 생성
	- AMI를 대상 리전으로 복사
	- 대상 리전에서 새 인스턴스 시작



**비암호화 AMI 복사 명령어**

```bash
aws ec2 copy-image \
    --source-region us-east-1 \
    --source-image-id ami-1234567890abcdef0 \
    --name "Cross-Region-AMI" \
    --region us-west-2
```



#### 9.2.2 암호화된 AMI의 리전 간 마이그레이션

- 리전별 KMS 키 고려 필요:
	- 원본 리전에서 암호화된 AMI 생성
	- 대상 리전에 새로운 KMS 키 생성
	- AMI 복사 시 새 KMS 키로 재암호화
	- 대상 리전에서 새 인스턴스 시작



**암호화된 AMI 복사 명령어**

```bash
aws ec2 copy-image \
    --source-region us-east-1 \
    --source-image-id ami-1234567890abcdef0 \
    --name "Cross-Region-Encrypted-AMI" \
    --region us-west-2 \
    --encrypted \
    --kms-key-id alias/target-region-key
```



### 9.3 계정 간 AMI 공유

#### 9.3.1 비암호화 AMI의 계정 간 공유

- 비교적 간단한 공유 프로세스:
  1. AMI 시작 권한을 대상 계정에 부여
  2. 대상 계정에서 AMI 사용



**비암호화 AMI 공유 명령어**

```bash
aws ec2 modify-image-attribute \
    --image-id ami-1234567890abcdef0 \
    --launch-permission "Add=[{UserId=123456789012}]"
```



#### 9.3.2 암호화된 AMI의 계정 간 공유

- 복잡한 권한 설정 필요:
  1. KMS 키 정책 설정
  2. AMI 공유 권한 설정
  3. 스냅샷 공유 권한 설정



**KMS 키 정책 설정**

```json
{
    "Sid": "Allow access for sharing encrypted AMI",
    "Effect": "Allow",
    "Principal": {
        "AWS": "arn:aws:iam::TARGET-ACCOUNT-ID:root"
    },
    "Action": [
        "kms:DescribeKey",
        "kms:ReEncrypt*",
        "kms:CreateGrant",
        "kms:Decrypt"
    ],
    "Resource": "*"
}
```



### 9.4 각 시나리오별 주요 고려사항

#### 9.4.1 AZ 간 마이그레이션

- **비암호화 AMI**:
	- 추가 설정 불필요
	- 빠른 마이그레이션 가능
	- 데이터 전송 비용 없음
- **암호화된 AMI**:
	- 동일 KMS 키 사용 가능
	- 추가 권한 설정 불필요
	- 자동 암호화 유지



#### 9.4.2 리전 간 마이그레이션

- **비암호화 AMI**:
	- 단순한 복사 프로세스
	- 리전 간 데이터 전송 비용 발생
	- 대상 리전의 서비스 제한 확인 필요
- **암호화된 AMI**:
	- 리전별 KMS 키 생성 필요
	- 복사 시 재암호화 필요
	- 키 관리 복잡성 증가



#### 9.4.3 계정 간 공유

- **비암호화 AMI**:
	- 단순한 권한 설정
	- 빠른 공유 가능
	- 보안 검토 필요
- **암호화된 AMI**:
	- KMS 키 권한 설정 필수
	- 스냅샷 공유 권한 필요
	- 복잡한 권한 관리 필요
	- 정기적인 권한 검토 중요



**참고 자료**

- [Amazon EC2 User Guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html)
- [AWS Data Lifecycle Manager 공식 문서](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/snapshot-lifecycle.html)