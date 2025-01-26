---
title: "Docker Compose CLI"
description: "Docker Compose의 주요 명령어를 실제 사용 사례와 함께 상세히 알아봅니다. 기본 명령어부터 고급 옵션까지 실무에서 자주 사용되는 모든 명령어를 다룹니다."
tags: ["DOCKER", "DOCKER_COMPOSE", "DEVOPS", "CONTAINER", "CLI"]
keywords: ["도커", "도커 컴포즈", "docker", "docker compose", "컨테이너", "container", "CLI", "명령어", "커맨드", "데브옵스", "devops"]
draft: false
hide_title: true
---

## 1. 기본 명령어

### 1.1 up - 컨테이너 실행
```bash
# 모든 서비스 실행
docker compose up

# 백그라운드에서 실행
docker compose up -d

# 특정 서비스만 실행
docker compose up nginx redis

# 컨테이너와 이미지를 모두 재생성
docker compose up --build

# 특정 scale로 서비스 실행
docker compose up --scale web=3
```

### 1.2 down - 컨테이너 종료
```bash
# 컨테이너와 네트워크 삭제
docker compose down

# 볼륨까지 함께 삭제
docker compose down -v

# 이미지까지 모두 삭제
docker compose down --rmi all
```

### 1.3 ps - 컨테이너 상태 확인
```bash
# 실행 중인 컨테이너 목록
docker compose ps

# 중지된 컨테이너 포함
docker compose ps -a
```

## 2. 로그 관련 명령어

### 2.1 logs - 로그 확인
```bash
# 모든 서비스의 로그 확인
docker compose logs

# 실시간 로그 확인
docker compose logs -f

# 특정 서비스의 로그만 확인
docker compose logs web

# 마지막 100줄만 확인
docker compose logs --tail=100
```

## 3. 컨테이너 관리 명령어

### 3.1 start/stop/restart - 컨테이너 제어
```bash
# 컨테이너 시작
docker compose start

# 컨테이너 중지
docker compose stop

# 컨테이너 재시작
docker compose restart

# 특정 서비스만 재시작
docker compose restart web
```

### 3.2 exec - 컨테이너 내부 명령 실행
```bash
# 컨테이너 내부 쉘 실행
docker compose exec web bash

# 특정 명령 실행
docker compose exec web npm install

# 특정 사용자로 명령 실행
docker compose exec -u root web bash
```

## 4. 빌드 관련 명령어

### 4.1 build - 이미지 빌드
```bash
# 모든 서비스 빌드
docker compose build

# 캐시 없이 빌드
docker compose build --no-cache

# 특정 서비스만 빌드
docker compose build web
```

### 4.2 pull - 이미지 가져오기
```bash
# 모든 서비스의 이미지 pull
docker compose pull

# 특정 서비스 이미지만 pull
docker compose pull redis
```

## 5. 구성 관련 명령어

### 5.1 config - 설정 확인
```bash
# 현재 구성 확인
docker compose config

# 구성 오류 검증
docker compose config --quiet
```

### 5.2 port - 포트 매핑 확인
```bash
# 특정 서비스의 포트 매핑 확인
docker compose port web 8080
```

## 6. 고급 명령어

### 6.1 top - 실행 중인 프로세스 확인
```bash
# 모든 서비스의 프로세스 확인
docker compose top

# 특정 서비스의 프로세스만 확인
docker compose top web
```

### 6.2 events - 이벤트 스트림 확인
```bash
# 실시간 이벤트 모니터링
docker compose events

# 특정 서비스의 이벤트만 확인
docker compose events web
```

## 7. 유용한 옵션들

### 7.1 공통 옵션
```bash
# 다른 위치의 compose 파일 사용
docker compose -f docker-compose.prod.yml up

# 프로젝트 이름 지정
docker compose -p myproject up

# 타임아웃 설정
docker compose --timeout 30 down
```

### 7.2 환경변수 활용
```bash
# 환경변수 파일 지정
docker compose --env-file .env.prod up

# 특정 환경변수 오버라이드
POSTGRES_VERSION=13 docker compose up
```

## 8. 실전 사용 예시

### 8.1 개발 환경 설정
```bash
# 개발 환경 시작
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 로그 모니터링
docker compose logs -f web

# 데이터베이스 마이그레이션
docker compose exec web python manage.py migrate
```

### 8.2 프로덕션 배포
```bash
# 프로덕션 환경 설정으로 시작
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 무중단 업데이트
docker compose up -d --no-deps --build web

# 상태 확인
docker compose ps
docker compose logs --tail=100 web
```

## 9. 문제 해결 팁

### 9.1 자주 발생하는 문제
- 컨테이너가 자동으로 재시작되지 않을 때:
```bash
docker compose up -d --force-recreate
```

- 네트워크 문제 해결:
```bash
docker compose down
docker compose up --force-recreate --renew-anon-volumes
```

### 9.2 디버깅
```bash
# 상세 로그 확인
docker compose --verbose up

# 구성 검증
docker compose config --quiet

# 특정 서비스 재빌드
docker compose build --no-cache web
```