---
title: "Gradle 자바 플러그인 완벽 가이드"
description: "Gradle의 자바 플러그인을 효과적으로 활용하는 방법을 알아봅니다. 기본 태스크, 소스셋 구성, 의존성 관리부터 증분 컴파일과 어노테이션 프로세싱까지 자세히 설명합니다. 자바 프로젝트를 더 효율적으로 빌드하고 관리하는 데 필요한 모든 지식을 제공합니다."
tags: [ "GRADLE", "JAVA", "BUILD_TOOL", "DEPENDENCY_MANAGEMENT", "JVM", "BACKEND" ]
keywords: [ "그레이들", "Gradle", "자바 플러그인", "Java Plugin", "빌드 툴", "Build Tool", "의존성 관리", "Dependency Management", "소스셋", "Source Set", "태스크", "Task", "컴파일", "Compile", "증분 컴파일", "Incremental Compilation", "어노테이션 프로세싱", "Annotation Processing", "빌드 캐시", "Build Cache", "자바 라이브러리", "Java Library", "자바 프로젝트", "Java Project" ]
draft: false
hide_title: true
---

## 1. Gradle 자바 플러그인 소개

- Gradle의 자바 플러그인은 자바 프로젝트를 컴파일, 테스트, 번들링하는 기능을 제공합니다.
- 다른 JVM 언어 플러그인의 기반이 되는 핵심 플러그인입니다.
- 현재는 기능이 확장된 `java-library`나 `application` 플러그인 사용을 권장합니다.

### 1.1 플러그인 적용 방법

- 빌드 스크립트에 다음과 같이 플러그인을 적용합니다.

```gradle
plugins {
    id 'java'
}
```

## 2. 주요 태스크(Tasks)

- 자바 플러그인은 프로젝트에 다음과 같은 태스크들을 추가합니다.

### 2.1 주요 빌드 태스크

- `compileJava` (JavaCompile)
    - 프로덕션 자바 소스 파일을 JDK 컴파일러를 사용하여 컴파일합니다.
    - 컴파일 클래스패스에 기여하는 모든 태스크에 의존합니다.
- `processResources` (ProcessResources)
    - 프로덕션 리소스를 리소스 디렉토리로 복사합니다.
- `classes`
    - `compileJava`와 `processResources`에 의존하는 집계 태스크입니다.
    - 다른 플러그인이 추가 컴파일 태스크를 연결할 수 있습니다.
- `jar` (Jar)
    - 클래스와 리소스를 포함한 프로덕션 JAR 파일을 생성합니다.
    - `classes` 태스크에 의존합니다.
- `javadoc` (Javadoc)
    - 프로덕션 자바 소스에 대한 API 문서를 Javadoc을 사용하여 생성합니다.

### 2.2 테스트 관련 태스크

- `compileTestJava` (JavaCompile)
    - 테스트 자바 소스 파일을 컴파일합니다.
    - `classes`와 테스트 컴파일 클래스패스에 기여하는 모든 태스크에 의존합니다.
- `processTestResources` (Copy)
    - 테스트 리소스를 테스트 리소스 디렉토리로 복사합니다.
- `testClasses`
    - `compileTestJava`와 `processTestResources`에 의존하는 집계 태스크입니다.
- `test` (Test)
    - JUnit이나 TestNG를 사용하여 단위 테스트를 실행합니다.
    - `testClasses`와 테스트 런타임 클래스패스를 생성하는 모든 태스크에 의존합니다.

### 2.3 기타 유틸리티 태스크

- `clean` (Delete)
    - 프로젝트 빌드 디렉토리를 삭제합니다.
- `cleanTaskName` (Delete)
    - 지정된 태스크에 의해 생성된 파일을 삭제합니다. 예를 들어, `cleanJar`는 `jar` 태스크에 의해 생성된 JAR 파일을 삭제합니다.

### 2.4 라이프사이클 태스크

- `assemble`
    - 프로젝트의 모든 아카이브를 조립하는 집계 태스크입니다.
    - `jar` 태스크에 의존합니다.
- `check`
    - 테스트 실행과 같은 검증 태스크를 수행하는 집계 태스크입니다.
    - `test` 태스크에 의존합니다.
- `build`
    - 프로젝트의 전체 빌드를 수행하는 집계 태스크입니다.
    - `check`와 `assemble` 태스크에 의존합니다.
- `buildNeeded`
    - 프로젝트와 의존하는 모든 프로젝트의 전체 빌드를 수행합니다.
- `buildDependents`
    - 프로젝트와 해당 프로젝트에 의존하는 모든 프로젝트의 전체 빌드를 수행합니다.

:::note
태스크 간의 관계는 이름에서도 알 수 있듯이 계층적이며, 상위 태스크 실행 시 종속된 하위 태스크들이 함께 실행됩니다.
:::

## 3. 프로젝트 레이아웃

### 3.1 기본 디렉토리 구조

자바 플러그인은 다음과 같은 프로젝트 레이아웃을 기본적으로 가정합니다:

- `src/main/java` - 프로덕션 자바 소스
- `src/main/resources` - 프로덕션 리소스(XML, 속성 파일 등)
- `src/test/java` - 테스트 자바 소스
- `src/test/resources` - 테스트 리소스
- `src/sourceSet/java` - 'sourceSet'이라는 이름의 소스 세트에 대한 자바 소스
- `src/sourceSet/resources` - 'sourceSet'이라는 이름의 소스 세트에 대한 리소스

:::tip
이러한 디렉토리가 반드시 존재하거나 내용이 있을 필요는 없습니다. Gradle은 발견된 내용만 컴파일하고 누락된 항목은 무시합니다.
:::

### 3.2 프로젝트 레이아웃 변경하기

소스 세트를 구성하여 프로젝트 레이아웃을 변경할 수 있습니다. 아래는 메인 자바 소스와 리소스 디렉토리를 변경하는 예시입니다:

```gradle
sourceSets {
    main {
        java {
            srcDirs = ['src/java']
        }
        resources {
            srcDirs = ['src/resources']
        }
    }
}
```

## 4. 소스 세트(Source Sets)

- 소스 세트는 함께 컴파일되고 실행되는 소스 파일의 논리적 그룹입니다.
- 자바 플러그인은 기본적으로 두 개의 소스 세트를 추가합니다:
    - `main` - 프로젝트의 프로덕션 소스 코드를 포함하며, 컴파일되어 JAR로 조립됩니다.
    - `test` - 프로젝트의 테스트 소스 코드를 포함합니다.

### 4.1 소스 세트 속성

소스 세트는 다음과 같은 중요한 속성을 가집니다:

- `name` (읽기 전용) - 소스 세트의 이름
- `output` (읽기 전용) - 소스 세트의 출력 파일
    - `output.classesDirs` - 소스 세트의 클래스를 생성하는 디렉토리
    - `output.resourcesDir` - 소스 세트의 리소스를 생성하는 디렉토리
- `compileClasspath` - 소스 파일을 컴파일할 때 사용하는 클래스패스
- `runtimeClasspath` - 소스 세트의 클래스를 실행할 때 사용하는 클래스패스
- `java` (읽기 전용) - 소스 세트의 자바 소스 파일
    - `java.srcDirs` - 자바 소스 파일이 있는 소스 디렉토리
- `resources` (읽기 전용) - 소스 세트의 리소스
    - `resources.srcDirs` - 리소스가 있는 디렉토리

### 4.2 새 소스 세트 정의하기

통합 테스트를 위한 소스 세트를 생성하는 예시:

```gradle
sourceSets {
    intTest {
        compileClasspath += sourceSets.main.output
        runtimeClasspath += sourceSets.main.output
    }
}
```

### 4.3 소스 세트 활용 예시

#### 소스 세트의 클래스를 포함하는 JAR 생성:

```gradle
tasks.register('intTestJar', Jar) {
    from sourceSets.intTest.output
}
```

#### 소스 세트에 대한 Javadoc 생성:

```gradle
tasks.register('intTestJavadoc', Javadoc) {
    source sourceSets.intTest.allJava
    classpath = sourceSets.intTest.compileClasspath
}
```

#### 소스 세트의 테스트 실행:

```gradle
tasks.register('intTest', Test) {
    testClassesDirs = sourceSets.intTest.output.classesDirs
    classpath = sourceSets.intTest.runtimeClasspath
}
```

## 5. 의존성 관리

### 5.1 의존성 구성(Configurations)

- 자바 플러그인은 다음과 같은 의존성 구성을 추가합니다:

#### 5.1.1 의존성 선언 구성

- `implementation` - 컴파일 타임과 런타임 모두에 필요한 의존성
- `compileOnly` - 컴파일 타임에만 필요하고 런타임 클래스패스에는 포함되지 않는 의존성
- `runtimeOnly` - 런타임에만 필요하고 컴파일 클래스패스에는 포함되지 않는 의존성
- `testImplementation` - 테스트 소스 세트의 컴파일 타임과 런타임 모두에 필요한 의존성
- `testCompileOnly` - 테스트 소스 세트의 컴파일 타임에만 필요한 의존성
- `testRuntimeOnly` - 테스트 소스 세트의 런타임에만 필요한 의존성
- `annotationProcessor` - 프로젝트의 소스 코드 컴파일 중에 사용되는 어노테이션 프로세서

#### 5.1.2 해결 가능한 구성

- `compileClasspath` - 메인 소스를 컴파일할 때 사용하는 클래스패스
- `runtimeClasspath` - 메인 소스를 실행할 때 사용하는 클래스패스
- `testCompileClasspath` - 테스트 소스를 컴파일할 때 사용하는 클래스패스
- `testRuntimeClasspath` - 테스트 소스를 실행할 때 사용하는 클래스패스

:::info
각 소스 세트에 대해 유사한 구성이 추가됩니다. 소스 세트 이름이 'sourceSet'인 경우, 'sourceSetImplementation', 'sourceSetCompileOnly' 등의 구성이 생성됩니다.
:::

### 5.2 의존성 구성 다이어그램

의존성 구성 간의 관계는 다음과 같습니다:

- 파란색 배경 - 의존성을 선언할 수 있는 구성
- 녹색 배경 - 태스크가 소비하는 구성으로, 직접 의존성을 선언하지 않음
- 회색 배경 - 태스크

## 6. 확장 기능

자바 플러그인은 `java` 확장 기능을 프로젝트에 추가합니다. 이를 통해 자바 관련 속성을 구성할 수 있습니다.

### 6.1 툴체인 및 호환성

- `toolchain` - JVM 도구를 사용하는 태스크에서 사용할 자바 툴체인
- `sourceCompatibility` - 자바 소스를 컴파일할 때 사용할 자바 버전 호환성
- `targetCompatibility` - 클래스를 생성할 자바 버전

```gradle
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}
```

### 6.2 패키징

- `withJavadocJar()` - Javadoc을 자동으로 패키징하고 `-javadoc.jar` 아티팩트가 있는 `javadocElements` 변형을 생성
- `withSourcesJar()` - 소스 코드를 자동으로 패키징하고 `-sources.jar` 아티팩트가 있는 `sourceElements` 변형을 생성

### 6.3 디렉토리 속성

- `reporting.baseDir` - 빌드 디렉토리를 기준으로 보고서를 생성할 디렉토리의 이름
- `reportsDir` - 보고서를 생성할 디렉토리
- `testResultsDirName` - 테스트 결과 .xml 파일을 생성할 디렉토리의 이름
- `testResultsDir` - 테스트 결과 .xml 파일을 생성할 디렉토리
- `libsDirName` - 라이브러리를 생성할 디렉토리의 이름
- `libsDir` - 라이브러리를 생성할 디렉토리

## 7. 증분 자바 컴파일(Incremental Java Compilation)

- Gradle은 기본적으로 정교한 증분 자바 컴파일러를 제공합니다.
- 증분 빌드는 훨씬 빠르며, 변경이 필요한 클래스 파일만 변경됩니다.

### 7.1 작동 방식

- Gradle은 변경의 영향을 받는 모든 클래스를 다시 컴파일합니다.
- 클래스가 변경되었거나 영향을 받는 다른 클래스에 의존하는 경우 영향을 받습니다.
- 클래스의 의존성은 바이트코드의 타입 참조 또는 컴파일러 플러그인을 통한 심볼 분석에서 결정됩니다.

:::tip
느슨한 결합과 같은 좋은 소프트웨어 설계 원칙을 적용하면 증분 컴파일 성능을 향상시킬 수 있습니다. 예를 들어, 구체적인 클래스와 종속 클래스 사이에 인터페이스를 두면 인터페이스가 변경될 때만 종속 클래스가 다시
컴파일되고 구현이 변경될 때는 다시 컴파일되지 않습니다.
:::

### 7.2 알려진 이슈

- 리소스를 읽는 어노테이션 프로세서를 사용하는 경우, 해당 리소스를 컴파일 태스크의 입력으로 선언해야 합니다.
- 리소스 파일이 변경되면 Gradle은 전체 재컴파일을 트리거합니다.
- 사용자 지정 실행 파일이나 `javaHome`을 사용하면 일부 최적화가 비활성화됩니다.

## 8. 증분 어노테이션 프로세싱

- Gradle 4.7부터 증분 컴파일러는 증분 어노테이션 프로세싱도 지원합니다.
- 모든 어노테이션 프로세서는 이 기능을 사용하려면 옵트인(opt-in)해야 합니다.

### 8.1 어노테이션 프로세서 종류

Gradle은 두 가지 일반적인 카테고리의 어노테이션 프로세서를 지원합니다:

1. **"isolating"** 프로세서
    - 각 주석이 달린 요소를 격리된 상태로 보고, 생성된 파일이나 유효성 검사 메시지 생성
    - 예: `@Entity` 주석이 달린 각 타입에 대해 `<TypeName>Repository`를 생성하는 `EntityProcessor`

2. **"aggregating"** 프로세서
    - 여러 소스 파일을 하나 이상의 출력 파일이나 유효성 검사 메시지로 집계
    - 예: `@Service` 주석이 달린 각 타입에 대해 하나의 메서드가 있는 단일 `ServiceRegistry`를 생성하는 `ServiceRegistryProcessor`

### 8.2 증분 어노테이션 프로세서 등록

프로세서의 META-INF 디렉토리에 있는 파일을 사용하여 증분 컴파일을 위한 프로세서를 등록할 수 있습니다:

```
org.gradle.EntityProcessor,isolating
org.gradle.ServiceRegistryProcessor,aggregating
```

### 8.3 제한 사항

두 카테고리 모두 다음과 같은 제한 사항이 있습니다:

- CLASS 또는 RUNTIME 유지 주석만 읽을 수 있습니다.
- 사용자가 `-parameters` 컴파일러 인수를 전달하는 경우에만 매개변수 이름을 읽을 수 있습니다.
- 파일을 생성할 때 Filer API를 사용해야 합니다.
- 컴파일러별 API에 의존해서는 안 됩니다.

## 9. 컴파일 회피(Compilation Avoidance)

- 종속 프로젝트가 ABI 호환 방식으로 변경된 경우(비공개 API만 변경됨), 자바 컴파일 태스크는 최신 상태로 유지됩니다.
- 즉, 프로젝트 A가 프로젝트 B에 의존하고 B의 클래스가 ABI 호환 방식으로 변경된 경우(일반적으로 메서드 본문만 변경), Gradle은 A를 다시 컴파일하지 않습니다.

### 9.1 공용 API에 영향을 주지 않는 변경 유형

- 메서드 본문 변경
- 주석 변경
- 비공개 메서드, 필드 또는 내부 클래스 추가, 제거 또는 변경
- 리소스 추가, 제거 또는 변경
- 클래스패스의 jar 또는 디렉토리 이름 변경
- 매개변수 이름 변경

:::warning
어노테이션 프로세서의 경우 구현 세부 정보가 중요하므로, 어노테이션 프로세서 경로에 별도로 선언해야 합니다. Gradle은 컴파일 클래스패스의 어노테이션 프로세서를 무시합니다.
:::

```gradle
dependencies {
    // dagger 컴파일러와 그 전이적 의존성은 어노테이션 처리 클래스패스에서만 찾을 수 있습니다
    annotationProcessor 'com.google.dagger:dagger-compiler:2.44'

    // 그리고 우리는 여전히 컴파일 클래스패스 자체에 Dagger 라이브러리가 필요합니다
    implementation 'com.google.dagger:dagger:2.44'
}
```

## 10. 변형 인식 선택(Variant Aware Selection)

- JVM 플러그인 세트는 사용된 의존성에 대한 변형 인식 해결(variant aware resolution)을 활용합니다.
- 또한 JVM 생태계의 특성에 맞게 Gradle 속성을 구성하기 위한 속성 호환성 및 모호성 해소 규칙을 설치합니다.

참고

- https://docs.gradle.org/current/userguide/java_plugin.html#sec:java_plugin_and_dependency_management