---
title: "Gradle Dependencies"
description: "Gradle 빌드 시스템에서 의존성을 효과적으로 관리하는 방법을 상세히 알아봅니다. 의존성 선언부터 유형별 사용법, 그리고 프로젝트 의존성 목록 확인까지 실제 예제와 함께 설명합니다. 자바와 코틀린 프로젝트에서 Gradle을 활용하는 개발자를 위한 실용적인 가이드입니다."
tags: ["GRADLE", "DEPENDENCY_MANAGEMENT", "JAVA", "KOTLIN", "BUILD_TOOL", "BACKEND"]
keywords: ["그래들", "Gradle", "의존성", "의존성 관리", "dependency", "dependency management", "implementation", "compile", "runtime", "testImplementation", "자바", "Java", "코틀린", "Kotlin", "빌드 도구", "build tool", "라이브러리", "library", "외부 의존성", "external dependency", "프로젝트 의존성", "project dependency", "파일 의존성", "file dependency", "트랜지티브 의존성", "transitive dependency"]
draft: false
hide_title: true
---

## 1. Gradle 의존성 관리 이해하기

- Gradle은 강력한 의존성 관리 시스템을 제공하여 프로젝트에 필요한 라이브러리나 파일을 효과적으로 관리할 수 있게 합니다.
- 의존성 관리는 소프트웨어 개발에서 핵심적인 부분으로, 코드 재사용성과 모듈화를 촉진합니다.
- 의존성 관리를 통해 외부 라이브러리의 버전을 일관되게 유지하고, 호환성 문제를 예방할 수 있습니다.

### 1.1 프로듀서와 컨슈머 이해하기

- 의존성 관리에서는 '프로듀서(Producer)'와 '컨슈머(Consumer)'의 역할을 구분하는 것이 중요합니다.
- 프로듀서는 라이브러리를 개발하여 배포하는 역할을 합니다. 즉, 다른 개발자들이 사용할 코드를 만들어 제공합니다.
- 컨슈머는 이러한 라이브러리를 사용하는 측입니다. 컨슈머의 유형은 크게 두 가지입니다:
  - 다른 프로젝트나 라이브러리에 의존하는 프로젝트
  - 특정 라이브러리를 사용하기 위해 의존성을 선언하는 빌드 설정(Configuration)

## 2. 의존성 추가하기

- Gradle에서 의존성을 추가하려면 빌드 스크립트의 `dependencies{}` 블록을 사용합니다.
- `dependencies` 블록을 통해 외부 라이브러리, 로컬 JAR 파일, 또는 멀티 프로젝트 빌드 내의 다른 프로젝트와 같은 다양한 유형의 의존성을 지정할 수 있습니다.
- Gradle에서 외부 의존성은 설정 이름(예: implementation, compileOnly, testImplementation)과 그룹 ID(group), 아티팩트 ID(name), 버전을 포함하는 의존성 표기법을 사용하여 선언됩니다.
  - [Dependency Configurations 참고](../Dependency-Configurations/Dependency-Configurations.md)

```groovy
dependencies {
    // 설정 이름 + 의존성 표기법 - 그룹ID : 아티팩트ID(이름) : 버전
    configuration('<group>:<name>:<version>')
}
```

:::info
Gradle은 자동으로 트랜지티브 의존성(의존하는 라이브러리가 다시 의존하는 라이브러리)을 포함합니다.
:::

- Gradle은 컴파일 타임, 런타임 또는 테스트 관련 시나리오와 같이 의존성이 사용되는 범위를 정의하는 여러 설정 옵션을 제공합니다.
- 빌드 파일에서 Gradle이 의존성을 찾아야 하는 저장소를 지정할 수 있습니다.

## 3. 의존성 유형 이해하기

- Gradle에서는 크게 세 가지 유형의 의존성이 있습니다
  - 모듈 의존성: 리포지토리에 있는 외부 라이브러리
  - 프로젝트 의존성: 동일한 빌드 내의 다른 프로젝트
  - 파일 의존성: 로컬 파일 시스템에 있는 JAR 파일이나 디렉토리

### 3.1 모듈 의존성

- 모듈 의존성은 가장 일반적인 의존성입니다.
- 저장소(Maven Central, JCenter 등)에 있는 모듈을 참조합니다.

```groovy
dependencies {
    implementation 'org.codehaus.groovy:groovy:3.0.5'
    implementation 'org.codehaus.groovy:groovy-json:3.0.5'
    implementation 'org.codehaus.groovy:groovy-nio:3.0.5'
}
```

### 3.2 프로젝트 의존성

- 프로젝트 의존성을 통해 동일한 빌드 내의 다른 프로젝트에 대한 의존성을 선언할 수 있습니다.
- 여러 프로젝트가 동일한 Gradle 빌드의 일부인 멀티 프로젝트 빌드에서 유용합니다.
- 프로젝트 의존성은 프로젝트 경로를 참조하여 선언됩니다:

```groovy
dependencies {
    implementation project(':utils')
    implementation project(':api')
}
```

### 3.3 파일 의존성

- 일부 프로젝트에서는 JFrog Artifactory나 Sonatype Nexus와 같은 바이너리 저장소 제품에 의존하지 않고, 외부 의존성을 호스팅하고 해결할 수 있습니다.
- 대신 이러한 의존성을 공유 드라이브에 호스팅하거나 프로젝트 소스 코드와 함께 버전 관리에 포함시킬 수 있습니다.
- 이러한 의존성은 트랜지티브 의존성, 출처 또는 작성자에 대한 정보와 같은 메타데이터가 없는 파일이기 때문에 파일 의존성이라고 합니다.

```groovy
dependencies {
    runtimeOnly files('libs/a.jar', 'libs/b.jar')
    runtimeOnly fileTree('libs') { include '*.jar' }
}
```

:::warning
파일 의존성보다는 프로젝트 의존성이나 외부 의존성을 사용하는 것이 권장됩니다.
:::

## 4. 실제 예제 살펴보기

- Java 애플리케이션에서 Google의 핵심 Java 라이브러리인 Guava를 사용하는 예를 살펴보겠습니다.
- Java 앱에는 다음과 같은 Java 클래스가 포함되어 있습니다:

```java
package org.example;

import com.google.common.collect.ImmutableMap;  // Guava 라이브러리에서 가져옴

public class InitializeCollection {
    public static void main(String[] args) {
        ImmutableMap<String, Integer> immutableMap
            = ImmutableMap.of("coin", 3, "glass", 4, "pencil", 1);
    }
}
```

- Gradle 프로젝트에 Guava 라이브러리를 의존성으로 추가하려면 빌드 파일에 다음 줄을 추가해야 합니다:

```groovy
dependencies {
    implementation 'com.google.guava:guava:23.0'
}
```

- 여기서:
  - `implementation`은 설정입니다.
  - `com.google.guava:guava:23.0`은 라이브러리의 그룹, 이름, 버전을 지정합니다:
    - `com.google.guava`는 그룹 ID입니다.
    - `guava`는 아티팩트 ID(즉, 이름)입니다.
    - `23.0`은 버전입니다.

:::tip
Maven Central의 Guava 페이지를 참조하면 다양한 버전 정보를 확인할 수 있습니다.
:::

## 5. 프로젝트 의존성 목록 확인하기

- `dependencies` 태스크는 프로젝트의 의존성에 대한 개요를 제공합니다.
- 이 태스크는 사용 중인 의존성, resolve 방법, 트랜지티브 의존성을 포함한 관계를 이해하는 데 도움이 되며, 커맨드 라인에서 의존성 트리를 렌더링합니다.
- 이 태스크는 버전 충돌이나 누락된 의존성과 같은 의존성 문제를 디버깅하는 데 특히 유용할 수 있습니다.
- 예를 들어, 앱 프로젝트의 빌드 스크립트에 다음과 같은 줄이 포함되어 있다고 가정해 보겠습니다:

```groovy
dependencies {
    implementation("com.google.guava:guava:30.0-jre")
    runtimeOnly("org.apache.commons:commons-lang3:3.14.0")
}
```

- 앱 프로젝트에서 `dependencies` 태스크를 실행하면 다음과 같은 결과가 나타납니다:

```
$ ./gradlew app:dependencies

> Task :app:dependencies

------------------------------------------------------------
Project ':app'
------------------------------------------------------------

implementation - Implementation dependencies for the 'main' feature. (n)
\--- com.google.guava:guava:30.0-jre (n)

runtimeClasspath - Runtime classpath of source set 'main'.
+--- com.google.guava:guava:30.0-jre
|    +--- com.google.guava:failureaccess:1.0.1
|    +--- com.google.guava:listenablefuture:9999.0-empty-to-avoid-conflict-with-guava
|    +--- com.google.code.findbugs:jsr305:3.0.2
|    +--- org.checkerframework:checker-qual:3.5.0
|    +--- com.google.errorprone:error_prone_annotations:2.3.4
|    \--- com.google.j2objc:j2objc-annotations:1.3
\--- org.apache.commons:commons-lang3:3.14.0

runtimeOnly - Runtime-only dependencies for the 'main' feature. (n)
\--- org.apache.commons:commons-lang3:3.14.0 (n)
```

- 위 결과에서 `implementation` 설정에는 `com.google.guava:guava:30.0-jre` 의존성이 추가되었음을 명확히 볼 수 있습니다.
- `runtimeOnly` 설정의 경우, `org.org.apache.commons:commons-lang3:3.14.0` 의존성이 추가되었습니다.
- 또한 `runtimeClasspath` 설정에서는 `com.google.guava:guava:30.0-jre`의 트랜지티브 의존성 목록(Guava 라이브러리의 의존성)도 확인할 수 있습니다.

## 6. 의존성 관리 모범 사례

### 6.1 버전 명시적 관리

- 의존성 버전을 명시적으로 선언하여 예측 가능한 빌드를 보장합니다.
- 버전 범위를 사용하는 것보다 특정 버전을 지정하는 것이 좋습니다.

```groovy
// 권장
implementation 'com.google.guava:guava:30.0-jre'

// 권장하지 않음 (버전 범위)
implementation 'com.google.guava:guava:[28.0,)'
```

### 6.2 트랜지티브 의존성 관리

- 트랜지티브 의존성은 의존성 충돌을 일으킬 수 있으므로 주의해야 합니다.
- Gradle은 기본적으로 최신 버전을 선택하지만, 명시적으로 의존성 해결을 구성할 수도 있습니다.

```groovy
configurations.all {
    resolutionStrategy {
        // 특정 모듈의 버전 강제 지정
        force 'com.google.guava:guava:30.0-jre'
        
        // 특정 모듈 제외
        exclude group: 'org.slf4j', module: 'slf4j-simple'
    }
}
```

### 6.3 적절한 설정 사용

- 각 의존성에 적합한 설정을 사용하여 빌드 최적화와 클린한 의존성 그래프를 유지합니다.
  - `implementation`: 구현에 필요하지만 API의 일부가 아닌 의존성
  - `api`: 구현과 API의 일부인 의존성(Java 라이브러리 프로젝트)
  - `compileOnly`: 컴파일 시에만 필요한 의존성
  - `runtimeOnly`: 런타임에만 필요한 의존성
  - `testImplementation`: 테스트 구현에만 필요한 의존성

## 참고

- [Gradle 공식 문서](https://docs.gradle.org/current/userguide/declaring_dependencies.html)