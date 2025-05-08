---
title: "Gradle Repositories"
description: "Gradle에서 의존성을 해결하기 위한 다양한 저장소 유형과 선언 방법을 자세히 알아봅니다. 공개 저장소부터 비공개 저장소, 로컬 저장소까지 실제 예제 코드와 함께 설명하고, Maven, Ivy, AWS S3, Google Cloud Storage 등 다양한 연결 방식을 소개합니다."
tags: ["GRADLE", "REPOSITORY", "DEPENDENCY_MANAGEMENT", "MAVEN", "IVY", "BACKEND", "JAVA", "KOTLIN"]
keywords: ["그래들", "Gradle", "저장소", "repository", "의존성", "dependency", "메이븐", "Maven", "메이븐 센트럴", "Maven Central", "아이비", "Ivy", "로컬 저장소", "local repository", "비공개 저장소", "private repository", "커스텀 저장소", "custom repository", "AWS S3", "Google Cloud Storage", "SFTP", "HTTPS", "인증", "authentication", "자바", "Java", "코틀린", "Kotlin", "빌드 도구", "build tool"]
draft: false
hide_title: true
---

## 1. Gradle 저장소 이해하기

- Gradle은 프로젝트에서 사용하는 의존성을 다운로드할 수 있는 위치를 알아야 합니다.
- 저장소(Repository)는 Gradle이 필요한 라이브러리나 플러그인을 찾는 곳입니다.
- 예를 들어, `com.google.guava:guava:30.0-jre` 의존성은 공개 Maven Central 저장소(`mavenCentral()`)에서 다운로드할 수 있습니다.
- Gradle은 Maven Central에서 guava 소스 코드(jar 형태)를 찾아 다운로드하고, 이를 사용해 프로젝트를 빌드합니다.

### 1.1 저장소 기본 선언 방법

- `build.gradle(.kts)` 파일의 `repositories` 블록에서 의존성을 위한 저장소를 여러 개 추가할 수 있습니다:

```groovy
repositories {
    mavenCentral()   // 공개 저장소
    maven {          // 비공개/커스텀 저장소
        url = uri("https://company/com/maven2")
    }
    mavenLocal()     // 로컬 저장소
    flatDir {        // 파일 위치
        dirs "libs"
    }
}
```

- Gradle은 Maven, Ivy 또는 플랫 디렉토리 형식을 기반으로 하는 하나 이상의 저장소에서 의존성을 해결할 수 있습니다.
- Gradle에서 의존성을 해결할 때는 repositories 블록에 선언된 순서대로 저장소를 검색합니다. 
  - 만약 동일한 라이브러리가 여러 저장소에 존재한다면, Gradle은 가장 먼저 선언된 저장소에서 찾은 버전을 사용합니다.

## 2. 공개 저장소 선언하기

- 소프트웨어를 개발하는 조직은 오픈 소스 의존성을 다운로드하고 사용하기 위해 공개 바이너리 저장소를 활용할 수 있습니다.
- 인기 있는 공개 저장소로는 Maven Central과 Google Android 저장소가 있습니다.
- Gradle은 이러한 널리 사용되는 저장소에 대한 내장 약식 표기법을 제공합니다:

```groovy
repositories {
    mavenCentral()
    google()
    gradlePluginPortal()
}
```

- 내부적으로 Gradle은 약식 표기법으로 정의된 공개 저장소의 해당 URL에서 의존성을 해결합니다.
- 모든 약식 표기법은 `RepositoryHandler` API를 통해 사용할 수 있습니다.
  - [약식 표기법 참고](https://docs.gradle.org/current/dsl/org.gradle.api.artifacts.dsl.RepositoryHandler.html)

## 3. 비공개 또는 커스텀 저장소 선언하기

- 대부분의 기업 프로젝트는 인트라넷 내에서만 접근할 수 있는 바이너리 저장소를 구축합니다.
- 사내 저장소를 통해 팀은 내부 바이너리를 게시하고, 사용자와 보안을 관리합니다.
- 커스텀 URL을 지정하는 것은 대중적이지 않지만 공개적으로 사용 가능한 저장소를 선언하는 데 유용합니다.
- 커스텀 URL이 있는 저장소는 `RepositoryHandler` API에서 사용할 수 있는 해당 메서드를 호출하여 Maven 또는 Ivy 저장소로 지정할 수 있습니다:

```groovy
repositories {
    maven {
        url = uri("https://maven-central.storage.apis.com")
    }
    ivy {
        url = uri("https://github.com/ivy-rep/")
    }
}
```

## 4. 로컬 저장소 선언하기

- Gradle은 로컬 Maven 저장소에서 사용 가능한 의존성을 활용할 수 있습니다.
- 로컬 Maven 캐시를 저장소로 선언하려면 빌드 스크립트에 다음을 추가하면 됩니다:

```groovy
repositories {
    mavenLocal()
}
```

## 5. 지원되는 저장소 유형 이해하기

- Gradle은 형식과 연결 측면에서 의존성을 위한 다양한 소스를 지원합니다.
- 다음과 같은 다양한 형식에서 의존성을 해결할 수 있습니다:
  - Maven 호환 아티팩트 저장소(예: Maven Central)
  - Ivy 호환 아티팩트 저장소(커스텀 레이아웃 포함)
  - 로컬(플랫) 디렉토리
- 또한 다양한 연결 방식을 지원합니다:
  - 인증된 저장소
  - HTTPS, SFTP, AWS S3, Google Cloud Storage와 같은 다양한 원격 프로토콜

### 5.1 다양한 저장소 유형 예시

- Gradle은 여러 형식의 저장소와 다양한 연결 방식을 지원합니다. 
- 아래는 다양한 저장소 유형을 설정하는 예시입니다:

#### 5.1.1 커스텀 레이아웃이 있는 Ivy 저장소

```groovy
repositories {
    ivy {
        url = 'https://your.ivy.repo/url'
        layout 'pattern', {
            ivy '[organisation]/[module]/[revision]/[type]s/[artifact]-[revision].[ext]'
            artifact '[organisation]/[module]/[revision]/[type]s/[artifact]-[revision].[ext]'
        }
    }
}
```

#### 5.1.2 인증된 HTTPS Maven 저장소

```groovy
repositories {
    maven {
        url = 'https://your.secure.repo/url'
        credentials {
            username = 'your-username'
            password = 'your-password'
        }
    }
}
```

#### 5.1.3 SFTP 저장소

```groovy
repositories {
    maven {
        url = 'sftp://your.sftp.repo/url'
        credentials {
            username = 'your-username'
            password = 'your-password'
        }
    }
}
```

#### 5.1.4 AWS S3 저장소

```groovy
repositories {
    maven {
        url = "s3://your-bucket/repository-path"
        credentials(AwsCredentials) {
            accessKey = 'your-access-key'
            secretKey = 'your-secret-key'
        }
    }
}
```

#### 5.1.5 Google Cloud Storage 저장소

```groovy
repositories {
    maven {
        url = "gcs://your-bucket/repository-path"
    }
}
```

## 6. 저장소 선언 모범 사례

### 6.1 저장소 선언 순서

- 저장소는 선언된 순서대로 검색되므로, 가장 자주 사용하는 저장소를 먼저 선언하여 의존성 해결 속도를 높이는 것이 좋습니다.
- 로컬 저장소를 먼저 선언하면 네트워크 요청을 줄일 수 있습니다.

```groovy
repositories {
    mavenLocal()     // 로컬 저장소 먼저 검색
    mavenCentral()   // 그 다음 Maven Central 검색
    // 기타 저장소들...
}
```

### 6.2 보안 고려사항

- 비공개 저장소에 접근할 때는 자격 증명을 하드코딩하지 않는 것이 좋습니다.
- 대신, 환경 변수나 프로퍼티 파일을 통해 자격 증명을 제공하세요:

```groovy
repositories {
    maven {
        url = 'https://your.secure.repo/url'
        credentials {
            username = System.getenv('REPO_USERNAME')
            password = System.getenv('REPO_PASSWORD')
        }
    }
}
```

### 6.3 저장소 미러링

- 공용 저장소의 미러를 사용하면 네트워크 지연 시간을 줄이고 빌드 성능을 향상시킬 수 있습니다.

```groovy
repositories {
    maven {
        url = 'https://your-company-mirror.com/maven-central'
        name = 'Company Maven Central Mirror'
    }
    // 미러가 실패할 경우 대체 저장소
    mavenCentral()
}
```

## 참고

- [Gradle 공식 문서 - Repositories](https://docs.gradle.org/current/userguide/declaring_repositories.html)~~~~