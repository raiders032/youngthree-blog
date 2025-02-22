## 1 SDKMAN

- SDKMAN!을 사용하여 Java를 설치하고 관리하는 방법에 대한 완벽 가이드를 제공하려고 합니다.
- SDKMAN!은 Java, Groovy, Scala 등 다양한 소프트웨어 개발 키트(SDK)를 쉽게 설치하고 관리할 수 있는 도구입니다.

### 1.1 주요 기능

- 다양한 JDK 배포판 지원 (Amazon Corretto, OpenJDK, Eclipse Temurin 등)
- 여러 Java 버전 동시 설치 및 전환
- 프로젝트별 Java 버전 관리
- Gradle, Maven, Kotlin 등 다른 JVM 기반 도구도 관리 가능

### 1.2 장점

- 커맨드 라인 기반의 간단한 설치/관리
- 버전 전환이 쉽고 빠름
- 여러 배포판을 한 곳에서 관리
- OS에 독립적으로 동작

## 2 SDKMAN 설치

```bash
// SDKMAN 설치
$ curl -s "https://get.sdkman.io" | bash

// SDKMAN 초기화
$ source "$HOME/.sdkman/bin/sdkman-init.sh"

// 설치 확인
sdk version
```

### 2.1 SDKMAN 업데이트

```bash
$ sdk selfupdate
```

- SDKMAN을 최신 버전으로 업데이트합니다.

## 3 특정 Java 설치

### 3.1 Java 버전 목록 조회

#### 명령어

```bash
$ sdk list java
```

- 설치 가능한 Java 버전 목록을 조회한다.

#### 출력 예시

```bash
================================================================================
Available Java Versions for macOS 64bit
================================================================================
 Vendor        | Use | Version      | Dist    | Status     | Identifier
--------------------------------------------------------------------------------
 Corretto      |     | 23.0.2       | amzn    |            | 23.0.2-amzn
               |     | 23.0.1       | amzn    |            | 23.0.1-amzn
               |     | 21.0.6       | amzn    |            | 21.0.6-amzn
               |     | 21.0.5       | amzn    |            | 21.0.5-amzn
               |     | 20.0.2       | amzn    | local only | 20.0.2-amzn
               |     | 17.0.14      | amzn    |            | 17.0.14-amzn
               |     | 17.0.13      | amzn    |            | 17.0.13-amzn
               | >>> | 17.0.8       | amzn    | local only | 17.0.8-amzn
               |     | 11.0.26      | amzn    |            | 11.0.26-amzn
               |     | 11.0.25      | amzn    |            | 11.0.25-amzn
               |     | 11.0.20      | amzn    | local only | 11.0.20-amzn
               |     | 8.0.442      | amzn    |            | 8.0.442-amzn
               |     | 8.0.432      | amzn    |            | 8.0.432-amzn
               |     | 8.0.382      | amzn    | local only | 8.0.382-amzn
 Gluon         |     | 22.1.0.1.r17 | gln     |            | 22.1.0.1.r17-gln
               |     | 22.1.0.1.r11 | gln     |            | 22.1.0.1.r11-gln
```

- 설치하고자 하는 Java 버전의 Identifier를 확인한다.

### 3.2 특정 버전 Java 설치

```bash
$ sdk install java 17.0. 10-amzn
```

- Amazon Corretto 17.0.10 버전을 설치한다.
- 원하는 벤더와 버전의 Identifier를 명시하여 설치할 수 있다.
- Identifier는 `sdk list java` 명령어로 확인할 수 있다.

## 4 Java 버전 확인

### 4.1 현재 버전 확인

```bash
$ sdk current java
Using java version 17.0.10-amzn
```

## 5 Java 버전 변경

- SDK의 use 명령어와 default 명령어는 Java 버전을 설정하는 데 사용되지만, 그 적용 범위와 지속성에 차이가 있습니다:

### 5.1 현재 세션에서만 변경

```bash
$ sdk use java 8.0.252-open
```

- 버전 변경 전에 해당 버전이 설치되어 있어야 한다.
- 현재 터미널 세션에만 적용됩니다.
- 임시적입니다. 터미널을 닫으면 설정이 사라집니다

### 5.2 기본값 변경

```bash
$ sdk default java java 17.0.10-amzn
```

- 시스템 전체에 적용됩니다.
- 영구적입니다. 터미널을 닫아도 설정이 유지됩니다.
- 특정 Java 버전을 기본값으로 설정