## 1 Bastion Hosts

- AWS에서 Bastion Host는 프라이빗 서브넷에 있는 EC2 인스턴스에 SSH로 접근할 수 있도록 도와주는 서버입니다.
- Bastion Host는 퍼블릭 서브넷에 위치하며, 다른 모든 프라이빗 서브넷과 연결됩니다.

## 2 Bastion Host 설정

### 2.1 Bastion Host 생성

- **퍼블릭 서브넷에 위치**
  - Bastion Host는 인터넷과 통신할 수 있도록 퍼블릭 서브넷에 생성됩니다.
- **보안 그룹 설정**
  - Bastion Host의 보안 그룹은 인터넷에서의 SSH 접근을 허용해야 합니다.
  - **포트 22**에서 인터넷으로부터의 인바운드 트래픽을 허용합니다.
  - 보안을 위해 회사의 퍼블릭 CIDR과 같은 제한된 CIDR에서만 접근을 허용합니다.

### 2.2 프라이빗 서브넷의 EC2 인스턴스 설정

- **보안 그룹 설정**
  - 프라이빗 서브넷에 있는 EC2 인스턴스의 보안 그룹은 Bastion Host에서의 접근을 허용해야 합니다.
  - Bastion Host의 보안 그룹 또는 Bastion Host의 프라이빗 IP를 인바운드 규칙에 추가하여 SSH 접근을 허용합니다.

## 3 Bastion Host의 역할

- **보안 강화**
  - 직접적으로 인터넷과 연결되지 않은 프라이빗 서브넷의 EC2 인스턴스에 안전하게 접근할 수 있도록 합니다.
- **중간 점검 지점**
  - SSH를 통해 Bastion Host를 경유하여 프라이빗 서브넷의 인스턴스에 접근함으로써, 네트워크 보안을 강화합니다.

## 4 Bastion Host 설정 예시

### 4.1 Bastion Host 보안 그룹 설정

- **인바운드 규칙**
  - **포트 22**: 접근 소스는 회사의 퍼블릭 CIDR 또는 관리자가 지정한 제한된 IP 범위

```
Type      Protocol   Port Range   Source
SSH       TCP        22           X.X.X.X/32 (회사 퍼블릭 CIDR)
```

### 4.2 프라이빗 서브넷의 EC2 인스턴스 보안 그룹 설정

- **인바운드 규칙**
  - **포트 22**: 접근 소스는 Bastion Host의 보안 그룹 ID 또는 Bastion Host의 프라이빗 IP

```
Type      Protocol   Port Range   Source
SSH       TCP        22           sg-xxxxxxxx (Bastion Host의 보안 그룹 ID)

```

## 5 Bastion Host를 통한 SSH 접근 절차

- **Bastion Host에 SSH로 접속**
  - 먼저 퍼블릭 서브넷에 위치한 Bastion Host에 SSH를 통해 접속합니다.
- **프라이빗 서브넷의 EC2 인스턴스에 접속**
  - Bastion Host에서 프라이빗 서브넷의 EC2 인스턴스로 SSH를 통해 접속합니다.

**참고 자료**

- [Amazon VPC 공식 문서](https://docs.aws.amazon.com/vpc/index.html)
- [AWS Management Console](https://aws.amazon.com/console/)