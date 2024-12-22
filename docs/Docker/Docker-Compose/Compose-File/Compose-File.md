# 1 Docker Compose 파일 구조

- Docker Compose 파일은 YAML 형식으로 작성됩니다.
- 톱 레벨(Top-level) 요소는 YAML 파일의 최상위 레벨에 정의되는 주요 구성 요소입니다.
- 각 톱 레벨 요소는 특정한 목적과 역할을 가지고 있습니다.



# 2 name

- Docker Compose 프로젝트의 이름을 지정합니다.
- 명시적으로 지정하지 않으면 기본값이 사용됩니다.
- 환경 변수 `COMPOSE_PROJECT_NAME`으로 접근할 수 있습니다.



**예시**

```yaml
name: myapp

services:
  webapp:
    image: nginx
    command: echo "Running in ${COMPOSE_PROJECT_NAME}"
```



# 3 version

- 이전 버전과의 호환성을 위해 유지되고 있습니다.
- 최신 Docker Compose에서는 더 이상 사용되지 않으며, 사용 시 경고 메시지가 표시됩니다.
- Compose는 항상 가장 최신의 스키마를 사용합니다.



# 4 services

- [레퍼런스](https://docs.docker.com/reference/compose-file/services/)
- Docker Compose의 핵심 요소입니다.
- 실행할 컨테이너들을 정의합니다.



## 4.1 container_name

- 컨테이너의 이름을 명시적으로 지정합니다.
- 지정하지 않으면 Docker Compose가 자동으로 이름을 생성합니다.
- 지정된 이름은 유니크해야 합니다.



## 4.2 image

- 컨테이너를 생성할 때 사용할 이미지를 지정합니다.
- 태그를 함께 지정할 수 있으며, 환경 변수를 사용할 수 있습니다.
- 로컬에 이미지가 없으면 Docker Hub에서 자동으로 다운로드합니다.



## 4.3 restart

- 컨테이너의 재시작 정책을 설정합니다.
- `no`: 재시작하지 않습니다.
- `always`: 항상 재시작합니다.
- `on-failure`: 오류로 인해 종료될 때만 재시작합니다.
- `unless-stopped`: 명시적으로 중지하기 전까지 항상 재시작합니다.



## 4.4 ports

- 호스트와 컨테이너 간의 포트 매핑을 설정합니다.
- `호스트포트:컨테이너포트` 형식으로 지정합니다.
- 여러 포트를 매핑할 수 있습니다.



## 4.5 environment

- 컨테이너 내부에서 사용할 환경 변수를 설정합니다.
- 키-값 쌍으로 지정합니다.
- 데이터베이스 연결 정보, 설정값 등을 전달할 때 주로 사용됩니다.



## 4.6 depends_on

- 서비스 간의 의존성을 정의합니다.
- 지정된 서비스가 먼저 시작된 후에 현재 서비스가 시작됩니다.
- 단순히 시작 순서만 보장하며, 서비스가 완전히 준비될 때까지 기다리지는 않습니다.



## 4.7 networks

- 컨테이너가 연결될 네트워크를 지정합니다.
- 여러 네트워크에 동시에 연결할 수 있습니다.
- 같은 네트워크에 있는 컨테이너끼리 통신이 가능합니다.



## 4.8 platform

- 컨테이너가 실행될 플랫폼을 지정합니다.
- CPU 아키텍처나 운영체제를 명시적으로 지정할 수 있습니다.
- 크로스 플랫폼 환경에서 특히 유용합니다.



## 4.9 command

- 컨테이너가 시작될 때 실행할 명령어를 지정합니다.
- Dockerfile의 CMD 지시문을 오버라이드합니다.
- 문자열이나 배열 형태로 지정할 수 있습니다.



## 4.10 hostname

- 컨테이너의 호스트 이름을 설정합니다.
- 다른 컨테이너에서 이 호스트 이름으로 접근할 수 있습니다.
- 지정하지 않으면 컨테이너 ID가 호스트 이름으로 사용됩니다.



## 4.11 volumes

- 컨테이너와 호스트 시스템 간의 파일 시스템을 공유합니다.
- 데이터를 영구적으로 저장하거나 호스트와 파일을 공유할 때 사용합니다.
- 명명된 볼륨이나 바인드 마운트를 사용할 수 있습니다.
- `호스트경로:컨테이너경로` 형식으로 지정합니다.



# 5 networks

- 컨테이너 간의 네트워크를 정의합니다.
- 사용자 정의 네트워크를 생성하고 관리할 수 있습니다.



**주요 속성**

```yaml
networks:
  frontend:
    # 네트워크 드라이버 지정
    driver: bridge
    
    # 드라이버 옵션 설정
    driver_opts:
      com.docker.network.bridge.name: frontend_bridge
    
  backend:
    # 외부 네트워크 사용
    external: true
```



# 6 volumes

- 데이터를 영구적으로 저장하기 위한 볼륨을 정의합니다.
- 컨테이너 간에 데이터를 공유할 수 있습니다.



**주요 속성**

```yaml
volumes:
  db_data:
    # 볼륨 드라이버 지정
    driver: local
    
    # 드라이버 옵션 설정
    driver_opts:
      type: none
      device: /data/db
      o: bind
    
  backup:
    # 외부 볼륨 사용
    external: true
```



# 7 configs

- 서비스에서 사용할 설정 파일을 정의합니다.
- 런타임에 컨테이너에 설정을 주입할 수 있습니다.



**주요 속성**

```yaml
configs:
  http_config:
    file: ./httpd.conf
    
  app_config:
    external: true
    name: app_prod_config

services:
  webapp:
    configs:
      - source: http_config
        target: /etc/httpd/httpd.conf
```



# 8 secrets

- 비밀번호나 인증서와 같은 민감한 데이터를 관리합니다.
- 암호화되어 안전하게 저장됩니다.



**주요 속성**

```yaml
secrets:
  db_password:
    file: ./db_password.txt
    
  ssl_cert:
    external: true
    name: prod_ssl_cert

services:
  webapp:
    secrets:
      - source: db_password
        target: /run/secrets/db_password
```



#  9 전체 구성 예시

```yaml
name: myapp

services:
  webapp:
    build: ./webapp
    networks:
      - frontend
      - backend
    configs:
      - source: app_config
    secrets:
      - source: app_secret

  database:
    image: mysql:8
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

volumes:
  db_data:
    driver: local

configs:
  app_config:
    file: ./config/app.conf

secrets:
  app_secret:
    file: ./secrets/app.key
```



# 10 주의사항

- 각 톱 레벨 요소는 특정한 목적을 가지고 있으므로 적절히 사용해야 합니다.
- `version` 필드는 더 이상 사용되지 않으므로 새로운 프로젝트에서는 제외하는 것이 좋습니다.
- `secrets`와 `configs`는 Docker Swarm 모드에서 더 효과적으로 활용할 수 있습니다.
- 네트워크와 볼륨은 필요한 경우에만 명시적으로 정의하는 것이 좋습니다.
- 프로젝트 이름은 고유하고 의미 있게 지정하는 것이 좋습니다.