## 1 AWS CodeBuild의 buildspec.yml 파일 이해하기

- AWS CodeBuild는 소스 코드를 컴파일하고, 테스트를 실행하며, 소프트웨어 패키지를 생성하는 완전 관리형 빌드 서비스입니다.
- buildspec.yml 파일은 CodeBuild가 빌드 프로세스를 실행하는 데 사용하는 핵심 구성 파일입니다.
- 이 파일은 빌드 환경 설정부터 실행할 명령어, 결과물 처리까지 빌드 프로세스의 모든 측면을 정의합니다.



## 2 buildspec.yml 파일의 위치와 구조

- buildspec.yml 파일은 반드시 프로젝트의 루트 디렉토리에 위치해야 합니다.
- 이 파일은 YAML 형식으로 작성되며, 여러 섹션으로 구성됩니다.
- 주요 섹션으로는 version, env, phases, artifacts, cache 등이 있습니다.



## 3 환경 변수 설정 (env 섹션)

- env 섹션에서는 빌드 프로세스에서 사용할 환경 변수를 정의합니다.
- 세 가지 방식으로 환경 변수를 설정할 수 있습니다:
	- variables: 일반 텍스트 변수를 직접 정의합니다.
	- parameter-store: AWS Systems Manager Parameter Store에 저장된 변수를 사용합니다.
	- secrets-manager: AWS Secrets Manager에 저장된 비밀 값을 사용합니다.



### 3.1 env 섹션 예시

```yaml
env:
  variables:
	JAVA_HOME: "/usr/lib/jvm/java-8-openjdk-amd64"
  parameter-store:
	DB_URL: "prod_db_url"
  secrets-manager:
	DB_PASSWORD: "prod_db_password"
```

- 이 예시에서는 JAVA_HOME을 일반 변수로, DB_URL을 Parameter Store에서, DB_PASSWORD를 Secrets Manager에서 가져옵니다.



## 4 빌드 단계 정의 (phases 섹션)

- phases 섹션은 빌드 프로세스의 각 단계에서 실행할 명령어를 지정합니다.
- 주요 단계는 다음과 같습니다:
	- install: 빌드에 필요한 종속성을 설치합니다.
	- pre_build: 빌드 전에 실행할 준비 명령어를 지정합니다.
	- build: 실제 빌드 명령어를 실행합니다.
	- post_build: 빌드 후 마무리 작업을 수행합니다.



### 4.1 phases 섹션 예시

```yaml
phases:
  install:
	runtime-versions:
	  java: corretto11
  pre_build:
	commands:
	  - echo "Logging in to Amazon ECR..."
	  - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_ENDPOINT
  build:
	commands:
	  - echo "Building the application..."
	  - mvn clean package
  post_build:
	commands:
	  - echo "Building Docker image..."
	  - docker build -t $ECR_REPO:$IMAGE_TAG .
	  - docker push $ECR_REPO:$IMAGE_TAG
```

- 이 예시에서는 Java 11을 설치하고, ECR에 로그인한 후, Maven을 사용해 애플리케이션을 빌드하고, Docker 이미지를 생성하여 ECR에 푸시합니다.



## 5 빌드 결과물 정의 (artifacts 섹션)

- artifacts 섹션은 빌드 결과물을 어떻게 처리할지 정의합니다.
- 일반적으로 결과물을 S3 버킷에 업로드하며, KMS를 사용해 암호화됩니다.



### 5.1 artifacts 섹션 예시

```yaml
artifacts:
  files:
	- target/my-app.jar
  name: my-app-$(date +%Y-%m-%d).zip
  discard-paths: yes
```

- 이 예시에서는 target/my-app.jar 파일을 결과물로 지정하고, 날짜를 포함한 이름으로 ZIP 파일을 생성합니다.



## 6 캐시 설정 (cache 섹션)

- cache 섹션은 향후 빌드 속도를 높이기 위해 캐시할 파일을 지정합니다.
- 주로 종속성 파일을 캐시하여 S3에 저장합니다.



### 6.1 cache 섹션 예시

```yaml
cache:
  paths:
	- '/root/.m2/**/*'
```

- 이 예시에서는 Maven의 로컬 저장소를 캐시하여 다음 빌드에서 종속성 다운로드 시간을 줄입니다.



## 7 전체 buildspec.yml 예시

```yaml
version: 0.2

env:
  variables:
	JAVA_HOME: "/usr/lib/jvm/java-8-openjdk-amd64"
  parameter-store:
	DB_URL: "prod_db_url"
  secrets-manager:
	DB_PASSWORD: "prod_db_password"

phases:
  install:
	runtime-versions:
	  java: corretto11
  pre_build:
	commands:
	  - echo "Logging in to Amazon ECR..."
	  - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_ENDPOINT
  build:
	commands:
	  - echo "Building the application..."
	  - mvn clean package
  post_build:
	commands:
	  - echo "Building Docker image..."
	  - docker build -t $ECR_REPO:$IMAGE_TAG .
	  - docker push $ECR_REPO:$IMAGE_TAG

artifacts:
  files:
	- target/my-app.jar
  name: my-app-$(date +%Y-%m-%d).zip
  discard-paths: yes

cache:
  paths:
	- '/root/.m2/**/*'
```

- 이 예시는 Java 애플리케이션을 빌드하고, Docker 이미지를 생성하여 ECR에 푸시하는 완전한 buildspec.yml 파일입니다.



## 8 결론

- buildspec.yml 파일은 AWS CodeBuild의 핵심 구성 요소입니다.
- 이 파일을 통해 빌드 프로세스의 모든 측면을 세밀하게 제어할 수 있습니다.
- 환경 변수 설정, 빌드 단계 정의, 결과물 처리, 캐시 설정 등을 통해 효율적이고 안전한 빌드 파이프라인을 구축할 수 있습니다.
- buildspec.yml 파일을 잘 활용하면 CI/CD 프로세스를 자동화하고 최적화하는 데 큰 도움이 될 것입니다.