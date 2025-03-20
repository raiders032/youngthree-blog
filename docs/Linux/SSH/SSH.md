---
title: "SSH"
description: "SSH(Secure Shell)의 기본 개념과 동작 원리부터 실제 설정까지 자세히 알아봅니다. 비대칭키와 대칭키 암호화 방식, 클라이언트 config 설정, 서버측 보안 설정까지 단계별로 설명합니다."
tags: ["SSH", "SECURITY", "ENCRYPTION", "LINUX", "SERVER", "DEVOPS"]
keywords: ["SSH", "Secure Shell", "시큐어셸", "ssh", "원격접속", "remote access", "비대칭키", "asymmetric key", "대칭키", "symmetric key", "공개키", "public key", "개인키", "private key", "리눅스", "linux", "서버", "server", "config", "설정", "비밀번호 인증", "키 인증", "key authentication", "ssh-keygen", "authorized_keys"]
draft: false
hide_title: true
---

## 1. SSH란?

- SSH는 Secure Shell의 줄임말로, 원격 호스트에 접속하기 위해 사용되는 보안 프로토콜입니다.
- 기존 원격 접속은 '텔넷(Telnet)'이라는 방식을 사용했는데, 암호화를 제공하지 않기 때문에 보안상 취약하다는 단점이 있습니다.
- 이를 보완하기 위해 SSH 기술이 등장했고, 현재 원격 접속 보안을 위한 필수적인 요소로 자리 잡고 있습니다.

## 2. SSH 동작원리

- SSH는 연결 상대를 인증하고 안전한 정보 전달을 위해 여러 가지 암호화 기술을 사용합니다.
- SSH는 비대칭키, 대칭키, 해싱 암호화 기술을 사용합니다.
  - [더 자세한 내용은 Encryption 참고](../../Common/Encryption/Encryption.md)

### 2.1 비대칭키 방식

- 가장 먼저 사용자와 서버가 서로의 정체를 증명해야 합니다. 이 시점에서 사용되는 것이 비대칭키 방식입니다.
- 비대칭키 방식에서는 서버 또는 사용자가 Key Pair(키 페어, 키 쌍)를 생성합니다.
- 키 페어는 공개 키와 개인 키의 두 가지로 이루어진 한 쌍을 뜻하며, 보통 공개 키의 경우 .pub, 개인 키의 경우 .pem의 파일 형식을 띕니다.
- 클라이언트가 키 페어를 생성할 경우 공개 키를 서버에 전송합니다.
- 서버는 공개 키를 받아서, 이 공개 키로 랜덤한 값을 생성해 클라이언트에게 전송합니다.
- 이 값은 클라이언트가 올바른 키 페어를 가지고 있는지 확인하는 일종의 시험지입니다.
- 클라이언트는 이 시험지를 개인 키로 풀어서 서버에 전송합니다.
- 서버는 전송받은 값과 자신이 처음 보낸 값을 비교하며, 값이 같으면 클라이언트를 신뢰할 수 있는 사용자로 판단하고 접속을 허용합니다.
- 이렇게 최초 접속 시 클라이언트와 서버 간의 인증 절차가 비대칭키 방식을 통해 완료됩니다.

#### 2.1.1 비대칭키 생성 예시

```bash
$ ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/my_custom_key
```

- 이 명령어를 실행하면, 키 페어가 생성됩니다.
- `-t ed25519`: 키 타입을 지정합니다. `ed25519`는 더 안전하고 최신 방식입니다.
- `-C "your_email@example.com"`: 키에 주석을 추가합니다.
- `-f ~/.ssh/my_custom_key`: 키 파일의 경로와 이름을 지정합니다. 여기서는 `~/.ssh/` 디렉토리에 `my_custom_key`라는 이름으로 키를 생성합니다.

### 2.2 대칭키 방식

- 서로의 신원을 확인한 후, 이제 정보를 주고받을 차례입니다.
- 주고받는 과정에서 정보가 유출되지 않도록 정보를 암호화해서 주고받는데, 여기서 사용되는 방식이 대칭키 방식입니다.
- 대칭키 방식에서는 비대칭키 방식과 달리 한 개의 키만을 사용하며, 이를 대칭 키라고 합니다.

## 3. 설정

- 클라이언트 쪽에서 config 파일을 작성하고 서버 쪽 특정 디렉토리에 클라이언트의 공개 키를 위치시키면 간단하게 SSH로 접속할 수 있습니다.

### 3.1 config 파일 작성(클라이언트)

```bash
Host worker-1   
  Hostname 192.168.154.100   
  Port 22   
  User ys   
  IdentityFile ~/.ssh/id_rsa
```

- `~/.ssh/config`에 SSH 설정 파일을 작성합니다.
- Host: 별칭을 부여하여 `ssh worker-1` 명령어로 192.168.154.100에 접속할 수 있게 합니다.
- Hostname: 접속할 서버의 IP 주소를 명시합니다.
- User: Linux 유저를 명시합니다.
- IdentityFile: 개인 키를 명시하는데, 비밀번호라고 생각하면 됩니다.

### 3.2 공개 키 설정(서버)

- SSH를 이용해 접속하려는 호스트에 클라이언트의 공개 키 정보를 추가해야 합니다.
- `ssh-copy-id -i ~/.ssh/id_ed25519.pub ys@worker-1` 명령을 이용해 클라이언트의 공개 키를 서버로 복사합니다.
- 공개 키는 기본적으로 서버의 `~/.ssh/authorized_keys` 파일에 추가됩니다.

:::tip
이제 `ssh worker-1` 명령어로 비대칭키 방식의 인증을 통해 간편하게 원격 호스트에 접속할 수 있습니다.
:::

## 4. 비밀번호 인증 비활성화

- 서버에서 SSH 접속 시 비밀번호 인증을 비활성화하고, 공개 키 인증만을 허용하도록 설정할 수 있습니다.
- 비밀번호 인증을 비활성화하고 키 방식 인증만 허용하려면 SSH 서버 설정 파일(`/etc/ssh/sshd_config`)을 수정해야 합니다.

### 4.1 설정 파일 수정

- `sudo vim /etc/ssh/sshd_config` 명령어로 설정 파일을 수정합니다.
- 다음 항목들을 확인하고 필요에 따라 주석을 해제하거나 값을 변경합니다:

```bash
# PasswordAuthentication 옵션을 no로 설정하여 비밀번호 인증 비활성화
PasswordAuthentication no

# PubkeyAuthentication 옵션을 yes로 설정하여 공개 키 인증 활성화
PubkeyAuthentication yes

# ChallengeResponseAuthentication 옵션을 no로 설정하여 챌린지 응답 인증 비활성화
ChallengeResponseAuthentication no

# UsePAM 옵션을 no로 설정하여 PAM 인증 비활성화
UsePAM no
```

### 4.2 Include 디렉토리의 파일 확인

- `/etc/ssh/sshd_config` 파일에는 추가적인 설정 파일을 포함하기 위해 `Include` 지시자가 있을 수 있습니다.
- 이 경우 해당 파일들도 확인하고 동일한 설정을 적용해야 합니다.
- `Include /etc/ssh/sshd_config.d/*.conf`
	- 위 지시자가 있다면, `/etc/ssh/sshd_config.d/` 디렉토리 내의 모든 `.conf` 파일을 확인하고 동일한 설정을 적용합니다.

### 4.3 SSH 데몬 재시작

- 설정을 변경한 후 SSH 데몬을 재시작합니다.
- `sudo systemctl restart sshd` 또는 `sudo service ssh restart`
- 이 설정을 통해 SSH 서버는 비밀번호 인증을 비활성화하고, 공개 키 인증만을 허용하게 됩니다.
- 이제 SSH 접속 시 반드시 공개 키를 사용해야 합니다.

:::warning
SSH 서버의 설정을 변경하기 전에 반드시 공개 키 인증이 제대로 작동하는지 확인하세요. 그렇지 않으면 서버에 접근할 수 없게 될 수 있습니다.
:::

## 참고 자료

- [Gabia Library - SSH](https://library.gabia.com/contents/infrahosting/9002/)
- [Gabia Library - SSH 설정](https://library.gabia.com/contents/9008/)
- [DigitalOcean - SSH 이해하기](https://www.digitalocean.com/community/tutorials/understanding-the-ssh-encryption-and-connection-process)