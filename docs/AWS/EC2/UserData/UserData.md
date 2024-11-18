## 1 AWS EC2 User Data 소개

- AWS EC2 User Data는 EC2 인스턴스 시작 시 실행되는 스크립트나 설정을 지정할 수 있는 기능입니다.
- 이를 통해 인스턴스 생성 직후 자동으로 소프트웨어 설치, 업데이트, 구성 등의 작업을 수행할 수 있습니다.
- User Data는 인스턴스의 첫 번째 부팅 시에만 실행되며, 이후 재부팅 시에는 실행되지 않습니다.



## 2 User Data의 주요 특징

- User Data는 최대 16KB까지의 데이터를 지원합니다.
- 기본적으로 root 사용자 권한으로 실행됩니다.
- Base64로 인코딩된 형태로 전달됩니다.
- 인스턴스 메타데이터를 통해 User Data에 접근할 수 있습니다.
- 보안 그룹이나 네트워크 ACL 설정에 영향을 받지 않습니다.



## 3 User Data 스크립트 작성

- User Data 스크립트는 보통 셸 스크립트(#!로 시작)나 cloud-init 지시문 형태로 작성합니다.
- 스크립트는 UTF-8 인코딩으로 작성해야 합니다.



**기본적인 User Data 스크립트 예시**

```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd
echo "<h1>Hello from EC2 User Data</h1>" > /var/www/html/index.html
```

- 이 스크립트는 Amazon Linux 2 인스턴스에서 Apache 웹 서버를 설치하고 시작합니다.
- 그리고 간단한 HTML 페이지를 생성합니다.



## 4 User Data 사용 방법

### 4.1 EC2 인스턴스 생성 시 User Data 설정

- EC2 인스턴스를 생성할 때 "고급 세부 정보" 섹션에서 User Data를 입력할 수 있습니다.
- AWS Management Console, AWS CLI, AWS SDK 등을 통해 설정할 수 있습니다.



**AWS CLI를 사용한 User Data 설정 예시**

```bash
aws ec2 run-instances --image-id ami-xxxxxxxx --count 1 --instance-type t2.micro --key-name MyKeyPair --user-data file://my-script.sh
```

- `file://` 접두사를 사용하여 로컬 파일의 내용을 User Data로 전달할 수 있습니다.



### 4.2 기존 인스턴스의 User Data 수정

- 중지된 인스턴스의 User Data를 수정할 수 있습니다.
- 단, 수정된 User Data는 다음 인스턴스 시작 시에 실행됩니다.



**AWS CLI를 사용한 User Data 수정 예시**

```bash
aws ec2 modify-instance-attribute --instance-id i-1234567890abcdef0 --attribute userData --value file://new-script.sh
```

- 인스턴스를 중지한 후 이 명령어를 실행하고, 다시 시작하면 새로운 User Data가 적용됩니다.



## 5 User Data 스크립트 디버깅

- User Data 스크립트 실행 로그는 `/var/log/cloud-init-output.log` 파일에서 확인할 수 있습니다.
- 스크립트 실행 중 오류가 발생하면 이 로그 파일을 참조하여 문제를 해결할 수 있습니다.



**로그 확인 명령어**

```bash
cat /var/log/cloud-init-output.log
```

- SSH를 통해 인스턴스에 접속한 후 이 명령어를 실행하여 로그를 확인할 수 있습니다.



## 6 User Data의 활용 사례

- 웹 서버 자동 설정: Apache, Nginx 등의 웹 서버를 자동으로 설치하고 구성합니다.
- 데이터베이스 서버 초기화: MySQL, PostgreSQL 등의 데이터베이스를 설치하고 초기 설정을 수행합니다.
- 애플리케이션 배포: Git 저장소에서 코드를 받아와 애플리케이션을 자동으로 배포합니다.
- 시스템 업데이트: 최신 보안 패치를 적용하고 필요한 소프트웨어를 업데이트합니다.
- 모니터링 에이전트 설치: CloudWatch 에이전트 등의 모니터링 도구를 자동으로 설치하고 구성합니다.



## 7 User Data 사용 시 주의사항

- 민감한 정보(예: 암호, API 키)를 User Data에 직접 포함시키지 않도록 주의해야 합니다.
- User Data는 인스턴스 메타데이터를 통해 접근 가능하므로, 필요한 경우 암호화하여 사용해야 합니다.
- 스크립트가 너무 길거나 복잡한 경우, S3에 스크립트를 저장하고 User Data에서 이를 다운로드하여 실행하는 방식을 고려할 수 있습니다.
- User Data 스크립트의 실행 시간이 너무 길어지면 인스턴스 시작 시간에 영향을 줄 수 있으므로 주의해야 합니다.



## 8 결론

- EC2 User Data는 인스턴스 초기 설정을 자동화하는 강력한 도구입니다.
- 이를 통해 인프라 관리를 효율적으로 수행하고, 일관된 환경을 쉽게 구축할 수 있습니다.
- 하지만 보안과 성능을 고려하여 신중하게 사용해야 합니다.
- User Data를 효과적으로 활용하면 클라우드 환경에서의 인프라 관리를 크게 개선할 수 있습니다.