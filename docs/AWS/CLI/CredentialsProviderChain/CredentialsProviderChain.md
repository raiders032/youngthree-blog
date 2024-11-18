## 1 AWS CLI 자격 증명 제공자 체인 (Credentials Provider Chain)

- AWS CLI 자격 증명 제공자 체인은 API 요청을 수행할 때 사용할 AWS 자격 증명을 찾는 데 사용되는 일련의 방법입니다. 
- AWS CLI 명령을 실행할 때 도구는 이러한 요청을 인증하기 위해 자격 증명이 필요합니다.
- 자격 증명 제공자 체인은 AWS CLI가 이러한 자격 증명을 찾는 과정을 의미합니다.



### 1.1 AWS CLI 자격 증명 및 구성 설정의 우선 순위

1. 명령줄 옵션
2. 환경 변수
3. IAM 역할 맡기 (Assume role)
4. 웹 신원으로 IAM 역할 맡기
5. 자격 증명 파일 (~/.aws/credentials)
6. 사용자 지정 프로세스
7. 구성 파일 (~/.aws/config)
8. 컨테이너 자격 증명 (ECS 태스크)
9. EC2 인스턴스 프로파일 자격 증명



## 2 자격 증명 제공자 체인의 단계

### 2.1 명령줄 옵션

- CLI 명령을 실행할 때 `--access-key` 및 `--secret-key` 옵션을 사용하여 자격 증명을 직접 지정할 수 있습니다. 
- 이 방법은 다른 모든 자격 증명 제공자보다 우선합니다.

```bash
aws s3 ls --access-key YOUR_ACCESS_KEY_ID --secret-key YOUR_SECRET_ACCESS_KEY
```



### 2.2 환경 변수

- AWS CLI는 특정 환경 변수가 설정되어 있는지 확인합니다
	- `AWS_ACCESS_KEY_ID` 및 `AWS_SECRET_ACCESS_KEY`
	- 임시 보안 자격 증명을 사용하는 경우 `AWS_SESSION_TOKEN`도 필요합니다.

```bash
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN=YOUR_SESSION_TOKEN  # 선택 사항
```



### 2.3 공유 자격 증명 파일

- CLI는 일반적으로 `~/.aws/credentials`에 위치한 공유 자격 증명 파일에서 자격 증명을 찾습니다. 
- 이 파일에서는 여러 프로필을 지정할 수 있습니다.

```plaintext
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY

[profile_name]
aws_access_key_id = YOUR_PROFILE_ACCESS_KEY_ID
aws_secret_access_key = YOUR_PROFILE_SECRET_ACCESS_KEY
```



### 2.4 AWS 구성 파일

- 공유 자격 증명 파일과 유사하지만, 일반적으로 `~/.aws/config`에 위치한 구성 파일에서 자격 증명을 찾습니다. 
- 이 파일에서도 프로필을 지정할 수 있습니다.

```plaintext
[default]
region = us-west-2
output = json

[profile profile_name]
region = us-east-1
output = text
```



### 2.5 컨테이너 자격 증명

- AWS 컨테이너 서비스(ECS 등) 내에서 실행되는 경우, CLI는 컨테이너 메타데이터에서 자격 증명을 가져올 수 있습니다. 
- ECS 컨테이너 자격 증명 상대 URI를 확인합니다.



### 2.6 인스턴스 프로파일 자격 증명

- Amazon EC2 인스턴스에서 실행되는 경우, CLI는 인스턴스 메타데이터 서비스(IMDS)에서 자격 증명을 가져옵니다. 
- 이를 통해 CLI는 EC2 인스턴스에 할당된 IAM 역할을 사용할 수 있습니다.

```bash
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/role_name
```



## 3 우선 순위

- AWS CLI는 위의 순서로 자격 증명을 확인합니다. 
- 하나의 방법에서 유효한 자격 증명을 찾으면, 이를 사용하고 이후 방법은 건너뜁니다. 
- 이 순서는 명령줄 옵션과 같이 명시적으로 제공된 자격 증명이 인스턴스 프로파일 자격 증명과 같은 암시적으로 제공된 자격 증명보다 우선하도록 보장합니다.



## 4 주요 사항

- **유연성**: 자격 증명 제공자 체인은 자격 증명을 제공하고 관리하는 데 있어 유연성을 제공합니다.
- **보안**: 환경 변수, 공유 자격 증명 파일 또는 인스턴스 프로파일을 사용하여 자격 증명을 관리함으로써, 자격 증명을 코드에 하드코딩하지 않고도 보안을 유지할 수 있습니다.
- **모범 사례**: 가능한 경우 인스턴스 프로파일 또는 컨테이너 자격 증명과 같은 IAM 역할을 사용하는 것이 권장됩니다. 이러한 방법은 더 안전하며 장기 자격 증명을 수동으로 관리할 필요가 없습니다.
