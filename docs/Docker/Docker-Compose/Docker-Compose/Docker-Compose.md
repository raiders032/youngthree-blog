##  1 Docker Compose 소개

- Docker Compose는 다중 컨테이너 도커 애플리케이션을 정의하고 실행하기 위한 도구입니다.
- 하나의 호스트에서 여러 컨테이너를 쉽게 관리할 수 있게 해줍니다.
- Dockerfile과 함께 사용되어 컨테이너 구성을 정의합니다.
- 여러 컨테이너를 각각 빌드하고 실행할 필요 없이 하나의 명령어로 모든 작업을 수행할 수 있습니다.
- Docker Compose에 정의된 서비스들은 자동으로 하나의 기본 네트워크로 연결됩니다.



##  2 기본 명령어

- `docker compose build`
	- 이미지만 빌드하고 컨테이너는 시작하지 않습니다.
	- 기존 이미지가 있어도 새로 빌드합니다.
- `docker compose up`
	- 이미지가 없을 경우에만 빌드하고 컨테이너를 시작합니다.
	- `--build` 옵션을 추가하면 항상 이미지를 다시 빌드합니다.
	- `--no-build` 옵션은 이미지 빌드 없이 컨테이너만 시작합니다.
	- `-d` 옵션을 추가하면 백그라운드에서 실행됩니다.
- `docker compose down`
	- 실행 중인 컨테이너를 중지하고 삭제합니다.
	- 생성된 기본 네트워크도 함께 삭제됩니다.
	- `--volumes` 또는 `-v` 옵션을 추가하면 정의된 볼륨도 함께 삭제됩니다.
- `docker compose run`
	- 특정 서비스만 실행할 때 사용합니다.
	- `docker compose run servicename command` 형식으로 사용합니다.
	- 일회성 명령을 실행할 때 유용합니다.
	- `--rm` 옵션을 추가하면 컨테이너 종료 후 자동 삭제됩니다.
- `docker compose logs`
	- 컨테이너의 로그를 확인합니다.
	- `-f` 옵션을 추가하면 실시간으로 로그를 확인할 수 있습니다.
	- `docker compose logs [서비스명]` 형식으로 특정 서비스의 로그만 확인 가능합니다.
- `docker compose ps`
	- 현재 실행 중인 컨테이너 목록을 보여줍니다.
	- `-a` 옵션을 추가하면 중지된 컨테이너도 함께 보여줍니다.
- `docker compose stop`
	- 실행 중인 컨테이너를 중지합니다.
	- 컨테이너는 삭제되지 않고 그대로 유지됩니다.
	- 특정 서비스만 중지하려면 서비스 이름을 지정할 수 있습니다.
- `docker compose 
	- 중지된 컨테이너를 삭제합니다.
	- `-f` 옵션을 추가하면 실행 중인 컨테이너도 강제로 삭제합니다.
	- `-v` 옵션을 추가하면 연결된 볼륨도 함께 삭제합니다.



##  3 설치 방법

- Mac이나 Windows의 Docker Desktop을 설치하면 Docker Compose도 함께 설치됩니다.
- Linux 시스템의 경우 별도 설치가 필요합니다.



**Linux 설치 명령어**

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```



##  4 Docker Compose 파일 작성

- YAML 형식으로 작성합니다.
- 버전 3 형식이 가장 널리 사용됩니다.
- 주요 설정 항목들을 알아보겠습니다.
- [[Compose-File]] 참고



##  5 주의사항

- 실제 운영 환경에서는 보안을 위해 민감한 정보를 환경 변수 파일로 관리해야 합니다.
- 서비스 간의 의존성을 올바르게 설정해야 합니다.
- 볼륨 설정 시 데이터 지속성을 고려해야 합니다.
- 네트워크 설정이 필요한 경우 명시적으로 정의하는 것이 좋습니다.