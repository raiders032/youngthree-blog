---
title: "Implementing Binary Plugins"
description: "Gradle 바이너리 플러그인을 개발하는 방법을 상세히 설명합니다. 플러그인 기본 구조부터 확장 기능 구현까지 실제 예제와 함께 알아봅니다."
tags: [ "GRADLE", "PLUGIN", "BUILD_TOOL", "JAVA", "KOTLIN", "BACKEND" ]
keywords: [ "그래들", "Gradle", "플러그인", "Plugin", "바이너리 플러그인", "Binary Plugin", "빌드 도구", "Build LoadTestingTool", "자바", "코틀린" ]
draft: false
hide_title: true
---

## 1. 바이너리 플러그인 개요

- 바이너리 플러그인은 JAR 파일로 컴파일되어 배포되는 Gradle 플러그인입니다.
- 일반적으로 Java나 Kotlin으로 작성되며, 다음과 같은 특징을 가집니다:
	- 재사용 가능한 빌드 로직을 포함
	- 프로젝트 간 공유 가능
	- 메이븐 저장소를 통한 배포 가능
	- IDE 지원을 통한 개발 용이성

## 2. Plugin Development 플러그인 사용하기

### 2.1 기본 설정

- Plugin Development 플러그인(`java-gradle-plugin`)은 Gradle 플러그인 개발을 돕는 도구입니다.
- 다음과 같은 기능을 제공합니다:
	- Java 플러그인 자동 적용
	- `gradleApi()` 의존성 자동 추가
	- 플러그인 디스크립터 자동 생성
	- 플러그인 마커 아티팩트 설정

```groovy
plugins {
    id 'java-gradle-plugin'
}

gradlePlugin {
    plugins {
        simplePlugin {
            id = 'org.example.greeting'
            implementationClass = 'org.example.GreetingPlugin'
        }
    }
}
```

## 3. Gradle 플러그인의 핵심 구성 요소

- Gradle 플러그인은 세 가지 핵심 구성 요소로 이루어집니다:
	- `Plugin<Project>`: 플러그인의 진입점이자 전체 조율자
	- `Extension`: 사용자로부터 설정값을 받는 인터페이스
	- `Task`: 실제 작업을 수행하는 실행 단위
- 이들의 관계를 이해하는 것이 플러그인 개발의 핵심입니다.

## 4. Plugin 구현하기

- Plugin은 전체 플러그인의 설정과 동작을 조율하는 핵심 클래스입니다.
- Plugin 인터페이스를 구현하여 플러그인의 동작을 정의합니다.

```java
public class DocumentationPlugin implements Plugin<Project> {
    @Override
    public void apply(Project project) {
        // 1. Extension 등록
        DocumentationExtension extension = project.getExtensions()
            .create("documentation", DocumentationExtension.class);

        // 2. Extension 값을 사용하여 Task 생성 및 구성
        project.getTasks().create("generateDocs", DocumentationTask.class, task -> {
            task.setOutputDir(extension.getOutputDir());
            task.setTitle(extension.getTitle());
        });
    }
}
```

### 4.1 플러그인 설정

build.gradle에서 플러그인을 등록합니다:

```groovy
plugins {
    id 'java-gradle-plugin'  // Gradle 플러그인 개발을 위한 플러그인
}

gradlePlugin {
    plugins {
        documentation {
            id = 'com.example.documentation'  // 플러그인 식별자
            implementationClass = 'com.example.DocumentationPlugin'
        }
    }
}
```

## 5. Extension으로 사용자 설정 받기

- Extension은 사용자가 build.gradle에서 플러그인의 동작을 커스터마이즈할 수 있게 해주는 설정 메커니즘입니다.
- 대부분의 플러그인은 빌드 스크립트에서 설정값을 받아 동작을 조정합니다.
- 이러한 기능은 Extension을 통해 구현됩니다.

### 5.1 Extension 클래스 정의

- 사용자 설정을 받을 Extension 클래스를 정의합니다
- Extension 클래스는 사용자 설정값을 저장하는 필드와 getter/setter 메서드로 구성됩니다.
- 사용자 설정값은 Extension 객체를 통해 Task로 전달됩니다.

#### 예시

```java
public class DocumentationExtension {
    private String outputDir;
    private String title;

    // getter와 setter
    public String getOutputDir() { return outputDir; }
    public void setOutputDir(String outputDir) { this.outputDir = outputDir; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
```

### 5.2 Plugin에서 Extension 등록

```java
public class DocumentationPlugin implements Plugin<Project> {
    @Override
    public void apply(Project project) {
        // 1. Extension 등록
        DocumentationExtension extension = project.getExtensions()
            .create("documentation", DocumentationExtension.class);

        // 2. Extension 값을 사용하여 Task 생성 및 구성
        project.getTasks().create("generateDocs", DocumentationTask.class, task -> {
            task.setOutputDir(extension.getOutputDir());
            task.setTitle(extension.getTitle());
        });
    }
}
```

- `project.getExtensions().create()` 메서드를 통해 Extension을 등록합니다.
- 이제 플러그인 사용자는 `build.gradle`에서 Extension의 설정값을 지정할 수 있습니다.

### 5.3 사용자가 build.gradle에서 설정

```groovy
documentation {  // Extension 이름으로 설정 블록 생성
    outputDir = 'build/docs'  // Extension의 속성 설정
    title = 'My Project Docs'
}
```

- 사용자는 build.gradle에서 `documentation` 블록을 통해 Extension의 설정값을 지정할 수 있습니다.
	- 이전 Extension에서 설정한 `documentation` 이름을 사용합니다.
- 이 설정값은 Plugin에서 Task로 전달되어 실제 작업에 사용됩니다.

## 6. Task로 실제 작업 수행하기

- Task는 Extension에서 받은 설정값을 사용하여 실제 작업을 수행하는 실행 단위입니다.
- 그래들에는 다양한 기본 Task 타입이 제공되며, 사용자가 직접 Task를 정의할 수도 있습니다.

### 6.1 커스텀 Task 정의

- 커스텀 Task는 `DefaultTask` 클래스를 상속받아 구현합니다.
- `@TaskAction` 애노테이션은 Gradle Task의 실제 실행 로직이 포함된 메서드를 표시합니다.
- 하나의 Task에 여러 `@TaskAction` 메서드를 사용하는 것은 권장되지 않습니다.
	- @TaskAction 메서드들의 실행 순서는 보장되지 않습니다.
	- 따라서 여러 @TaskAction 메서드를 사용하는 대신, 하나의 @TaskAction 메서드 내에서 여러 메서드를 순서대로 호출하는 것이 더 안전한 방법입니다
	- 복잡한 태스크 로직의 경우, 여러 개의 작은 태스크로 나누고 dependsOn을 사용하여 실행 순서를 제어하는 것이 좋습니다.

```java
public class DocumentationTask extends DefaultTask {
    private String outputDir;
    private String title;

    // setter 메서드들
    public void setOutputDir(String outputDir) {
        this.outputDir = outputDir;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }

    @TaskAction  // 실제 작업을 수행하는 메서드
    public void generate() {
        System.out.println("Generating documentation in " + outputDir);
        System.out.println("Title: " + title);
        // 실제 문서 생성 로직
    }
}
```

### 6.2 Plugin에서 Task 생성 및 Extension 연결

```java
public class DocumentationPlugin implements Plugin<Project> {
    @Override
    public void apply(Project project) {
        // 1. Extension 등록
        DocumentationExtension extension = project.getExtensions()
            .create("documentation", DocumentationExtension.class);

        // 2. Extension 값을 사용하여 Task 생성 및 구성
        project.getTasks().create("generateDocs", DocumentationTask.class, task -> {
            task.setOutputDir(extension.getOutputDir());
            task.setTitle(extension.getTitle());
        });
    }
}
```

- Plugin에서 Extension을 등록하고, Extension의 설정값을 Task로 전달합니다.
- project.getTasks().create()를 통해 새로운 Task를 생성합니다.
- 첫 번째 매개변수 "generateDocs"는 Task의 이름으로, 사용자가 Gradle 명령어로 실행할 때 사용됩니다.
- 두 번째 매개변수는 Task의 클래스 타입입니다.
	- Task 클래스는 `DocumentationTask`로, 앞서 정의한 커스텀 Task입니다.
- 세 번째 매개변수는 Task의 설정을 구성하는 람다 표현식입니다.
	- 람다식에서 Task의 속성을 Extension의 값과 연결합니다.

### 6.3 Task 실행

```bash
./gradlew generateDocs
```

- 플러그인 사용자는 위 명령으로 Task를 실행할 수 있습니다

## 7. 전체 흐름 예시

실제 동작하는 간단한 문서 생성 플러그인의 전체 코드를 보겠습니다:

```java
// 1. Extension 정의
public class DocumentationExtension {
    private String outputDir = "build/docs";  // 기본값 설정
    private String title = "Documentation";

    // getter/setter
}

// 2. Task 정의
public class DocumentationTask extends DefaultTask {
    private String outputDir;
    private String title;

    @TaskAction
    public void generate() {
        // 실제 작업 수행
        File outDir = getProject().file(outputDir);
        outDir.mkdirs();
        // 문서 생성 로직...
    }
    
    // setter 메서드들
}

// 3. Plugin 구현
public class DocumentationPlugin implements Plugin<Project> {
    @Override
    public void apply(Project project) {
        // Extension 등록
        DocumentationExtension extension = project.getExtensions()
            .create("documentation", DocumentationExtension.class);

        // Task 생성 및 Extension 연결
        project.getTasks().create("generateDocs", DocumentationTask.class, task -> {
            task.setOutputDir(extension.getOutputDir());
            task.setTitle(extension.getTitle());
        });
    }
}
```

사용자는 이 플러그인을 다음과 같이 사용합니다:

```groovy
plugins {
    id 'com.example.documentation'
}

documentation {
    outputDir = 'custom/docs/dir'
    title = 'My Custom Documentation'
}
```

## 8. 기본 작업 Task 활용

- Gradle은 자주 사용되는 작업을 위한 기본 Task 타입들을 제공합니다:
	- Copy: 파일 복사
	- Delete: 파일/디렉토리 삭제
	- Zip: 파일 압축
	- JavaCompile: Java 소스 컴파일
- 이러한 기본 Task들을 활용하면 일반적인 작업들을 쉽게 구현할 수 있습니다

```java
// 청소 Task 생성 예시
project.getTasks().create("cleanDocs", Delete.class, task -> {
    task.delete(project.file(extension.getOutputDir()));
});
```