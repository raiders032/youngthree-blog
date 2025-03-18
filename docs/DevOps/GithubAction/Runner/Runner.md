##  1 Runner

- runner는 실제 워크플로우를 실행하는 서버를 의미합니다.
- GitHub는 Ubuntu Linux, Microsoft Windows, 그리고 macOS runner를 제공합니다.
- 각각의 워크플로우는 새롭게 프로비저닝된 가상 머신에서 실행됩니다.
- 다른 운영체제가 필요하거나 특정 하드웨어가 필요하다면 직접 runner를 구성할 수도 있습니다.
    - [Hosting your own runners](https://docs.github.com/en/actions/hosting-your-own-runners) 참고



##  2 self-hosted runners

- self-hosted runner는 GitHub에서 호스팅하는 runner보다 하드웨어, 운영 체제 및 소프트웨어 도구에 대해 더 많은 제어를 제공합니다.
- 자체 호스팅 runner를 사용하면, 더 큰 작업을 실행할 수 있는 처리 능력이나 메모리와 같은 사용자의 요구에 맞는 맞춤 하드웨어 구성을 만들 수 있습니다.
- 또한, 로컬 네트워크에서 사용 가능한 소프트웨어를 설치하고, GitHub에서 호스팅하는 runner가 제공하지 않는 운영 체제를 선택할 수 있습니다.
- self-hosted runner는 물리적, 가상, 컨테이너 내, 현장(온프레미스), 또는 클라우드 내에서 사용할 수 있습니다.
- 자체 호스팅 러너가 14일 이상 GitHub Actions에 연결되지 않은 경우 자동으로 GitHub에서 제거됩니다. 
- 임시 자체 호스팅 러너는 1일 이상 GitHub Actions에 연결되지 않은 경우 자동으로 GitHub에서 제거됩니다.



###  2.1.1 관리 레벨

- 관리 레벨에 따라 관리 범위를 지정할 수 있습니다.
- 리포지토리 수준: 리포지토리 수준 runner는 단일 리포지토리에 한정합니다.
- 조직 수준: 조직 수준 runner는 조직 내 여러 리포지토리의 작업을 처리할 수 있습니다.
- 엔터프라이즈 수준: 엔터프라이즈 수준 runner는 엔터프라이즈 계정의 여러 조직에 할당될 수 있습니다.



###  2.1.2 서비스 설정

- [레퍼런스](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/configuring-the-self-hosted-runner-application-as-a-service)
- self-hosted runner 애플리케이션을 서비스로 설정하여 머신이 시작될 때마다 runner 애플리케이션이 자동으로 시작되도록 할 수 있습니다.
- systemd를 사용하는 Linux 시스템의 경우, runner를 성공적으로 추가한 후 생성된 svc.sh 스크립트를 사용하여 애플리케이션을 서비스로 설치하고 관리할 수 있습니다.
- runner 애플리케이션을 설치한 디렉토리에서 셸을 엽니다.
- 아래의 명령어를 사용하여 self-hosted runner 서비스를 설치하고 관리할 수 있습니다.



**명령어**

```bash
// 서비스 설치
$ sudo ./svc.sh install

// 서비스 시작
$ sudo ./svc.sh start

// 서비스 상태 확인
$ sudo ./svc.sh status

// 서비스 중지
$ sudo ./svc.sh stop

// 서비스 제거
$ sudo ./svc.sh uninstall

```



###  2.1.4 라벨

- GitHub Actions는 워크플로우를 실행하기 위해 runner를 사용합니다.
- 라벨을 사용하면 runner의 특성에 따라 정리하고, 특정 라벨을 가진 runner에서만 워크플로우를 실행하도록 설정할 수 있습니다.
- 라벨은 운영 체제, 하드웨어 사양, 특정 프로젝트 또는 팀에 전용된 runner 등 다양한 특성에 따라 지정될 수 있습니다.



**워크플로우에서 라벨 사용**

```yaml
name: CI

on: [push]

jobs:
  build:
    runs-on: [self-hosted, gpu]
    steps:
      - uses: actions/checkout@v2
      - name: Build Project
        run: ./build.sh

```

- 워크플로우 파일에서 runs-on 키를 사용하여 특정 라벨을 가진 runner를 지정할 수 있습니다.
- 여러 라벨을 지정하여 지정된 모든 라벨을 만족하는 runner에서 작업을 실행할 수 있습니다.
- 지정된 라벨을 가진 runner가 여러 대일 경우, GitHub Actions는 가능한 runner 중에서 임의로 하나를 선택하여 작업을 실행합니다.
- 라벨이 지정되지 않은 경우, 기본적으로 GitHub에서 제공하는 호스팅 runner가 사용됩니다.



##  3 Adding a self-hosted runner to an organization

- 조직 수준에서 자체 호스팅 러너를 추가하면 조직 내 여러 리포지토리의 작업을 처리할 수 있습니다.
- 자체 호스팅 러너를 조직에 추가하려면 조직 소유자여야 합니다.



**설치 과정**

1. GitHub에 로그인한 후 조직의 메인 페이지로 이동합니다.
2. 조직의 설정으로 이동하기 위해 페이지 상단의 메뉴에서 'Settings'를 선택합니다.
3. 왼쪽 사이드바에서 'Actions' 메뉴를 찾아 선택한 후, 'Runners' 탭으로 이동합니다.
4. 페이지 상단의 'New runner' 버튼을 클릭합니다.
5. runner를 설치할 운영 체제(OS)와 아키텍처를 선택한 다음, GitHub에서 제공하는 지시사항을 따릅니다. 이 지시사항은 self-hosted runner 애플리케이션을 다운로드하고, 해당 조직에 대해 runner를 구성하는 방법을 안내합니다.
6. 다운로드한 runner 애플리케이션을 조직의 서버에 설치하고, 구성 스크립트를 실행할 때 조직의 URL과 특정 조직에 대한 runner의 등록 토큰을 사용합니다.
7. runner 구성이 완료되면, 지시된 대로 runner 서비스를 시작합니다.



###  3.1 리눅스에 설치

```bash
##  Create a folder  
$ mkdir actions-runner && cd actions-runner

##  Download the latest runner package  
$ curl -o actions-runner-linux-x64-2.317.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.317.0/actions-runner-linux-x64-2.317.0.tar.gz

##  Optional: Validate the hash  
$ echo "0eksmd2sj3f8c6028aff475475a457d380053f9d01877d5hcc01a17b2a91161d actions-runner-linux-x64-2.317.0.tar.gz" | shasum -a 256 -c

##  Extract the installer  
$ tar xzf ./actions-runner-linux-x64-2.317.0.tar.gz

##  Create the runner and start the Configuration experience  
$ ./config.sh --url https://github.com/Project --token ALQA7YXCS8A5SZVDJSZLA2EDAZPO2X2

##  서비스 설치
$ sudo ./svc.sh install

##  서비스 시작
$ sudo ./svc.sh start

##  서비스 상태 확인
$ sudo ./svc.sh status

##  서비스 중지
$ sudo ./svc.sh stop

##  서비스 제거
$ sudo ./svc.sh uninstall
```



###  3.2 MacOs 설치

**다운로드**

```bash
##  Create a folder
$ mkdir actions-runner && cd actions-runnerCopied!

##  Download the latest runner package
$ curl -o actions-runner-osx-x64-2.317.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.317.0/actions-runner-osx-x64-2.317.0.tar.gz

##  Optional: Validate the hash
$ echo "0b23ee79731522d9e1229d14d62c200e06ac9d7dddf5641966209a7700a43c14  actions-runner-osx-x64-2.317.0.tar.gz" | shasum -a 256 -c

##  Extract the installer
$ tar xzf ./actions-runner-osx-x64-2.317.0.tar.gz
```



**설정**

```bash

##  Create the runner and start the Configuration experience
$ ./config.sh --url https://github.com/ --token <TOKEN>  

##  Last step, run it!   
$ ./run.sh`
```