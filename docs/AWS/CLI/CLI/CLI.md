## 1 AWS CLI

- AWS CLI(Command Line Interface)는 AWS 서비스를 관리하기 위한 명령줄 도구입니다.
- 이를 통해 AWS 리소스를 효율적으로 관리하고 자동화할 수 있습니다.
- AWS CLI는 다양한 운영체제에서 사용할 수 있으며, 명령어 기반 인터페이스를 제공합니다.



## 2 주요 기능

### 2.1 리소스 관리

- AWS CLI를 사용하여 EC2, S3, RDS 등 다양한 AWS 리소스를 생성, 수정, 삭제할 수 있습니다.
- 복잡한 작업을 스크립트로 자동화하여 효율성을 높일 수 있습니다.
- 예: EC2 인스턴스 시작 및 중지, S3 버킷 생성 및 객체 업로드



### 2.2 설정 및 구성

- AWS CLI를 설치한 후, `aws configure` 명령을 통해 설정을 완료할 수 있습니다.
- 설정 과정에서 AWS 액세스 키, 비밀 키, 디폴트 리전, 출력 형식을 지정할 수 있습니다.
- 예: `aws configure` 명령을 통해 AWS 자격 증명과 기본 리전을 설정



### 2.3 스크립트 및 자동화

- AWS CLI는 셸 스크립트와 결합하여 반복적인 작업을 자동화할 수 있습니다.
- 예를 들어, 정기적인 백업 작업을 스크립트로 작성하여 자동으로 실행할 수 있습니다.
- 스크립트를 사용하면 일관된 리소스 관리가 가능하며, 인프라를 코드로 관리하는 데 유용합니다.



## 3 AWS CLI 설치

### 3.1 Windows

- Windows에서 AWS CLI를 설치하려면 MSI 인스톨러를 다운로드하여 실행합니다.
- 설치 후 명령 프롬프트에서 `aws --version` 명령을 실행하여 설치를 확인할 수 있습니다.



### 3.2 macOS 및 Linux

- macOS 및 Linux에서는 패키지 관리자 또는 직접 설치 스크립트를 사용하여 AWS CLI를 설치할 수 있습니다.
- 예: `curl`과 `unzip`을 사용하여 AWS CLI를 다운로드하고 설치
- 설치 후 터미널에서 `aws --version` 명령을 실행하여 설치를 확인할 수 있습니다.

```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
aws --version
```



## 4 AWS CLI 명령어 예시

### 4.1 S3 버킷 생성

- AWS CLI를 사용하여 S3 버킷을 생성할 수 있습니다.
- 예: `aws s3 mb s3://my-bucket`

```bash
aws s3 mb s3://my-bucket
```



### 4.2 EC2 인스턴스 시작

- AWS CLI를 사용하여 EC2 인스턴스를 시작할 수 있습니다.
- 예: `aws ec2 run-instances --image-id ami-0abcdef1234567890 --count 1 --instance-type t2.micro`

```bash
aws ec2 run-instances --image-id ami-0abcdef1234567890 --count 1 --instance-type t2.micro
```



### 4.3 IAM 사용자 생성

- AWS CLI를 사용하여 IAM 사용자를 생성할 수 있습니다.
- 예: `aws iam create-user --user-name new-user`

```bash
aws iam create-user --user-name new-user
```



## 5 고급 기능

### 5.1 AWS CLI 프로필

- AWS CLI는 여러 프로필을 설정하여 다양한 AWS 계정을 관리할 수 있습니다.
- `~/.aws/credentials` 파일에 프로필을 추가하고, `--profile` 옵션을 사용하여 명령어 실행 시 특정 프로필을 지정할 수 있습니다.



### 5.2 파라미터 스토어

- AWS Systems Manager Parameter Store를 사용하여 환경 변수와 같은 파라미터를 안전하게 저장하고 관리할 수 있습니다.
- AWS CLI를 통해 파라미터를 생성, 조회, 업데이트할 수 있습니다.



### 5.3 CloudFormation 통합

- AWS CLI를 사용하여 CloudFormation 스택을 관리할 수 있습니다.
- 예: `aws cloudformation create-stack --stack-name my-stack --template-body file://template.yaml`

```bash
aws cloudformation create-stack --stack-name my-stack --template-body file://template.yaml
```



## 6 결론

- AWS CLI는 강력한 명령줄 도구로, AWS 리소스를 효율적으로 관리하고 자동화할 수 있습니다.
- 다양한 운영체제에서 사용 가능하며, 스크립트와 결합하여 반복 작업을 자동화할 수 있습니다.
- AWS CLI를 사용하여 AWS 인프라를 코드로 관리하고, 효율성을 극대화해보세요.
