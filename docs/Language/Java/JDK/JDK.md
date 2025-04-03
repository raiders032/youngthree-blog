---
title: "JDK"
description: "Java 개발에 필수적인 JDK(Java Development Kit)의 구조와 기능을 알아봅니다. JRE, JVM과의 관계성을 명확히 이해하고, 버전별 차이점과 실무에서의 선택 기준까지 포괄적으로 설명합니다. Java 백엔드 개발자를 위한 필수 지식을 모두 담았습니다."
tags: ["JDK", "JRE", "JVM", "JAVA", "BACKEND"]
keywords: ["JDK", "Java Development Kit", "자바 개발 키트", "JRE", "Java Runtime Environment", "자바 런타임 환경", "JVM", "Java Virtual Machine", "자바 가상 머신", "자바", "Java", "백엔드", "backend", "개발환경", "자바개발", "자바설치", "LTS", "OpenJDK", "Oracle JDK"]
draft: false
hide_title: true
---

## 1. JDK, JRE, JVM 개요

- JDK(Java Development Kit), JRE(Java Runtime Environment), JVM(Java Virtual Machine)은 Java 기술의 핵심 구성 요소입니다.
- 이 세 가지 요소는 명확한 계층 구조를 가지며, 각각 고유한 역할과 책임을 갖고 있습니다.
- Java 개발자는 이들의 관계와 차이점을 이해함으로써 더 효율적인 개발과 배포 전략을 수립할 수 있습니다.

### 1.1 핵심 개념 한눈에 보기

- JDK는 Java 애플리케이션을 개발하기 위한 도구 모음으로, JRE와 개발 도구를 포함합니다.
- JRE는 Java 애플리케이션을 실행하기 위한 환경으로, JVM과 라이브러리를 포함합니다.
- JVM은 Java 바이트코드를 해석하고 실행하는 가상 머신으로, 플랫폼 독립성을 제공합니다.

:::info
JDK > JRE > JVM의 포함 관계를 가지고 있습니다. JDK를 설치하면 JRE와 JVM이 함께 설치됩니다.
:::

## 2. JDK(Java Development Kit) 심층 분석

- JDK는 Java 애플리케이션을 개발하는 데 필요한 모든 도구와 리소스를 포함하는, 개발자를 위한 완전한 패키지입니다.
- JDK는 JRE를 포함하며, 추가로 개발에 필요한 다양한 도구를 제공합니다.
- JDK는 Oracle JDK와 OpenJDK로 크게 나뉘며, 라이선스와 지원 정책에 차이가 있습니다.

### 2.1 JDK 구성 요소

- 개발 도구: 컴파일러(javac), 디버거(jdb), 아카이버(jar) 등
- JRE(Java Runtime Environment): Java 프로그램 실행에 필요한 런타임 환경
- Java 클래스 라이브러리: 표준 API 패키지 집합(java.lang, java.util 등)
- 실행 엔진: 클래스 로더, 바이트코드 검증기, 인터프리터

### 2.2 주요 개발 도구 상세 설명

- **javac**: Java 소스 코드(.java)를 바이트코드(.class)로 컴파일하는 컴파일러
  ```bash
  javac HelloWorld.java
  ```

- **java**: 컴파일된 Java 바이트코드를 실행하는 인터프리터
  ```bash
  java HelloWorld
  ```

- **javadoc**: Java 소스 코드에서 API 문서를 생성하는 도구
  ```bash
  javadoc -d docs HelloWorld.java
  ```

- **jar**: Java 애플리케이션을 위한 아카이브 파일을 생성하는 도구
  ```bash
  jar cf application.jar *.class
  ```

- **jdb**: Java 애플리케이션 디버깅을 위한 도구
  ```bash
  jdb HelloWorld
  ```

## 3. JRE(Java Runtime Environment) 이해하기

- JRE는 Java 애플리케이션을 실행하기 위한 환경으로, 개발이 아닌 실행만을 목적으로 합니다.
- JRE는 JVM과 Java 클래스 라이브러리, 기타 지원 파일을 포함합니다.
- JRE만 설치된 환경에서는 Java 애플리케이션을 실행할 수 있지만, 개발할 수는 없습니다.

### 3.1 JRE 구성 요소

- JVM(Java Virtual Machine): Java 바이트코드 실행 엔진
- 클래스 라이브러리: Java 표준 라이브러리(rt.jar 등)
- 지원 파일: 속성 설정, 리소스 파일 등

### 3.2 JRE의 역할

- 컴파일된 Java 프로그램(바이트코드)을 실행하는 환경 제공
- 메모리 관리 및 시스템 리소스 액세스 관리
- 클래스 로딩 및 검증
- Java API 라이브러리 제공

:::tip
Java 11부터 Oracle은 별도의 JRE 배포를 중단했습니다. 대신 `jlink` 도구를 사용하여 필요한 모듈만 포함한 커스텀 런타임을 생성할 수 있습니다.
:::

## 4. JVM(Java Virtual Machine) 심층 분석

- JVM은 Java 생태계의 핵심으로, "Write Once, Run Anywhere" 철학을 가능하게 하는 기술입니다.
- JVM은 Java 바이트코드를 각 운영체제에 맞게 해석하고 실행하는 가상 머신입니다.
- JVM은 메모리 관리, 가비지 컬렉션, 스레드 관리 등 중요한 역할을 수행합니다.
- [JVM의 자세한 내용 참고](../JVM/README.md)

### 4.1 JVM 아키텍처

- **클래스 로더 서브시스템**: 클래스 파일 로딩 및 검증
	- 로딩: 클래스 파일을 메모리에 로드
	- 링킹: 클래스 파일 검증, 준비, 해석
	- 초기화: 정적 변수 초기화 및 정적 블록 실행
- **런타임 데이터 영역**: JVM 메모리 구조
	- 메서드 영역: 클래스 구조, 메서드 데이터, 정적 변수 등 저장
	- 힙 영역: 객체 인스턴스 저장, 가비지 컬렉션 대상
	- 스택 영역: 메서드 호출 및 지역 변수 저장
	- PC 레지스터: 현재 실행 중인 JVM 명령어 주소 저장
	- 네이티브 메서드 스택: 네이티브 메서드 정보 저장
- **실행 엔진**: 바이트코드 실행
	- 인터프리터: 바이트코드를 한 줄씩 해석하고 실행
	- JIT 컴파일러: 자주 사용되는 코드를 네이티브 코드로 컴파일하여 성능 최적화
	- 가비지 컬렉터: 더 이상 참조되지 않는 객체 자동 제거

### 4.2 JVM 성능 최적화 기법

- **JIT 컴파일**: 자주 실행되는 코드(핫스팟)를 감지하여 네이티브 코드로 컴파일
- **가비지 컬렉션 튜닝**: 다양한 GC 알고리즘 선택 및 메모리 설정 최적화
- **메모리 관리**: 힙 크기 조정, 세대별 가비지 컬렉션 정책 설정

:::warning
JVM 튜닝은 애플리케이션의 특성과 실행 환경에 따라 크게 달라질 수 있습니다. 성능 테스트를 통한 검증이 필수적입니다.
:::

## 5. JDK, JRE, JVM의 상호 관계

- JDK는 JRE를 포함하고, JRE는 JVM을 포함하는 계층적 구조를 가집니다.
- 각 구성 요소는 특정 목적을 위해 설계되었으며, 함께 작동하여 Java 개발 및 실행 환경을 제공합니다.
- 이 계층 구조는 개발과 배포 환경의 분리를 가능하게 합니다.

### 5.1 구조적 관계 도식화

```
JDK (Java Development Kit)
├── 개발 도구 (javac, jar, javadoc, jdb 등)
├── JRE (Java Runtime Environment)
│   ├── 클래스 라이브러리 (rt.jar 등)
│   ├── 지원 파일
│   └── JVM (Java Virtual Machine)
│       ├── 클래스 로더
│       ├── 실행 엔진 (인터프리터, JIT 컴파일러, GC)
│       └── 런타임 데이터 영역
```

### 5.2 작동 원리

- **개발 단계**: 개발자가 JDK를 사용하여 Java 소스 코드(.java)를 작성하고 컴파일하여 바이트코드(.class)로 변환합니다.
- **배포 단계**: 컴파일된 바이트코드는 JRE가 설치된 모든 환경에서 실행할 수 있습니다.
- **실행 단계**: JVM이 바이트코드를 해석하고 실행합니다. 이 과정에서 JVM은 운영체제와 하드웨어 간의 중간 계층 역할을 합니다.

## 6. JDK 버전별 특징과 선택 기준

- Java는 1995년 첫 출시 이후 지속적으로 발전해왔으며, 주요 버전마다 중요한 기능과 개선 사항이 추가되었습니다.
- 2018년부터 Oracle은 6개월마다 새로운 버전을 출시하는 정책을 채택했으며, 특정 버전은 LTS(Long-Term Support)로 지정됩니다.
- 개발자는 프로젝트 특성, 안정성, 지원 기간 등을 고려하여 적절한 JDK 버전을 선택해야 합니다.

### 6.1 주요 LTS 버전 특징

- **Java 8 (LTS)**: 람다 표현식, 스트림 API, 새로운 날짜/시간 API 도입
- **Java 11 (LTS)**: 모듈 시스템 개선, HTTP 클라이언트 API, 로컬 변수 타입 추론(var)
- **Java 17 (LTS)**: 봉인 클래스, 패턴 매칭 for instanceof, 레코드 클래스
- **Java 21 (LTS)**: 가상 스레드, 외부 함수 및 메모리 API 개선, 레코드 패턴, 스위치 표현식 개선

### 6.2 OpenJDK vs Oracle JDK

- **OpenJDK**: 오픈 소스 구현체로, 무료로 사용 가능하며 커뮤니티 지원 중심
- **Oracle JDK**: 상업적 구현체로, 추가 기능과 기술 지원 제공(특정 조건에서 라이선스 비용 발생)

#### 6.2.1 특성 비교
| 특성 | OpenJDK | Oracle JDK |
|------|---------|------------|
| 라이선스 | GPL v2 with Classpath Exception | Oracle Technology Network License |
| 비용 | 무료 | 상업적 사용 시 유료(2019년 이후) |
| 지원 기간 | 커뮤니티 기반 | Oracle의 공식 지원 |
| 업데이트 주기 | 빠른 업데이트 | 정기적인 보안 업데이트 |
| 성능 | 거의 동일 | 특정 환경에서 약간의 최적화 |

:::tip
대부분의 사용 사례에서 OpenJDK와 Oracle JDK의 성능 차이는 미미합니다. 기업 환경에서는 지원 정책과 라이선스 비용을 주요 선택 기준으로 고려하세요.
:::

## 7. 실무에서의 JDK 선택과 관리

- 실무 환경에서는 프로젝트 요구사항, 팀 익숙도, 지원 기간, 호환성 등을 고려하여 JDK를 선택해야 합니다.
- 동일한 조직 내에서도 프로젝트별로 다른 JDK 버전을 사용할 수 있으며, 이를 효율적으로 관리하는 도구와 방법이 필요합니다.
- 버전 이전과 업그레이드는 신중하게 계획하고 테스트해야 합니다.

### 7.1 버전 관리 도구

- **SDKMAN**: 다양한 JDK 버전을 손쉽게 설치하고 전환할 수 있는 도구
- [SDKMAN 참고](../Tool/SDKMAN/SDKMAN.md)

### 7.2 Spring Boot 환경에서의 JDK 고려사항

- Spring Boot 버전에 따라 지원하는 Java 버전이 다르므로 호환성 확인이 필요합니다.
- Spring Boot 2.x는 Java 8, 11을 주로 지원하며, Spring Boot 3.x는 Java 17 이상을 요구합니다.
- `spring.boot.starter-parent`의 `java.version` 속성을 통해 Maven/Gradle 프로젝트의 JDK 버전 설정이 가능합니다.