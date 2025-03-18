---
title: "Multi Project Build"
description: "Gradle 멀티 프로젝트 빌드의 구조와 설정 방법을 상세히 알아봅니다. 루트 프로젝트와 서브 프로젝트의 구성, 플러그인 관리, 그리고 공통 설정 방법을 다룹니다."
tags: [ "GRADLE", "BUILD_TOOL", "JAVA", "KOTLIN", "BACKEND" ]
keywords: [ "그레이들", "gradle", "멀티프로젝트", "multi-project", "빌드도구", "build tool", "자바", "java", "코틀린", "kotlin", "백엔드", "backend" ]
draft: false
hide_title: true
---

## 1. 멀티 프로젝트 빌드 기초

- Gradle은 여러 서브 프로젝트로 구성된 대규모 프로젝트의 빌드를 지원합니다.
- 이는 일반적으로 '멀티-모듈 프로젝트'로 불리며, 하나의 루트 프로젝트와 하나 이상의 서브 프로젝트로 구성됩니다.

### 1.1 멀티 프로젝트 구조

- 멀티 프로젝트의 기본 구조는 다음과 같습니다

```
├── .gradle
│   └── ⋮
├── gradle
│   ├── libs.version.toml
│   └── wrapper
├── gradlew
├── gradlew.bat
├── settings.gradle.kts  
├── sub-project-1
│   └── build.gradle.kts 
└── sub-project-2
    └── build.gradle.kts
```

- 이 구조에서 주목해야 할 중요한 점들은 다음과 같습니다
- `.gradle`, `gradle`, `gradlew`, `gradlew.bat`, `settings.gradle.kts` 파일이 루트 디렉토리에 위치합니다.
- `settings.gradle.kts` 파일은 모든 서브 프로젝트를 포함해야 합니다.
- 각 서브 프로젝트는 자체 `build.gradle.kts` 파일을 가집니다.

## 2. 루트 프로젝트 설정

- 루트 프로젝트의 `build.gradle.kts`는 전체 프로젝트의 공통 설정을 관리합니다.

### 2.1 플러그인 관리

- 플러그인 설정은 `plugins` 블록에서 이루어집니다:

**예시**

```kotlin
plugins {
    kotlin("jvm") version "1.5.0" apply false
    id("org.springframework.boot") version "2.5.0" apply false
}
```

:::info
`apply false` 옵션의 의미:

- 플러그인을 선언만 하고 루트 프로젝트에는 적용하지 않습니다
- 하위 프로젝트에서 필요할 때 사용할 수 있도록 합니다
- 플러그인 버전을 중앙에서 관리할 수 있게 해줍니다
  :::

### 2.2 전체 프로젝트 공통 설정

- `allprojects` 블록은 루트 프로젝트를 포함한 모든 프로젝트에 적용되는 설정을 정의합니다:

**예시**

```kotlin
allprojects {
    group = "com.example"
    version = "1.0.0"
    
    repositories {
        mavenCentral()
    }
}
```

### 2.3 서브 프로젝트 공통 설정

- `subprojects` 블록은 서브 프로젝트에만 적용되는 설정을 정의합니다

**예시**

```kotlin
subprojects {
    apply(plugin = "org.jetbrains.kotlin.jvm")
    
    dependencies {
        implementation("org.jetbrains.kotlin:kotlin-stdlib")
    }
}
```

## 3. 서브 프로젝트 설정

- 각 서브 프로젝트는 자신만의 `build.gradle.kts` 파일을 가지며, 여기서 프로젝트별 고유한 설정을 정의합니다

**예시**

```kotlin
plugins {
    kotlin("jvm")
    id("org.springframework.boot")
}

dependencies {
    implementation(project(":shared"))
    implementation("org.springframework.boot:spring-boot-starter-web")
}
```

:::tip
서브 프로젝트에서는 버전을 지정하지 않고 플러그인을 적용할 수 있습니다. 버전은 루트 프로젝트에서 관리됩니다.
:::