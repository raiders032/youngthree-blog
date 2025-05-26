## 1 Jar

- Jar (Java Archive) 파일은 여러 Java 클래스 파일과 관련 메타데이터, 리소스(텍스트, 이미지 등)를 하나의 파일로 묶어 배포하기 위한 패키지 파일 형식입니다.
- 이러한 파일들은 주로 Java 애플리케이션 또는 라이브러리를 배포하는 데 사용됩니다.
- Jar 파일은 ZIP 형식으로 생성되며 .jar 파일 확장자를 가집니다.
- 컴파일된 Java 클래스 및 관련 리소스를 저장하는 데 사용되어 Java 소프트웨어 또는 라이브러리의 배포 및 배포를 용이하게 합니다.

### 1.1 작동 방식

- **컴파일**
	- Java 소스 파일(.java)은 Java 컴파일러에 의해 바이트코드(.class 파일)로 컴파일됩니다.
- **패키징**
	- 이러한 클래스 파일과 관련 리소스는 단일 Jar 파일로 함께 패키징됩니다.
	- 여기에는 구성 데이터 및 애플리케이션 진입점을 지정할 수 있는 매니페스트 파일(MANIFEST.MF)과 같은 파일에 대한 메타데이터가 포함될 수 있습니다.
- **실행**
	- Jar 파일에 애플리케이션의 진입점(메인 클래스)을 지정하는 매니페스트가 포함되어 있는 경우 JRE(Java Runtime Environment)에서 실행할 수 있습니다.
	- `java -jar myapplication.jar` 명령은 실행 가능한 Jar 파일을 실행하는 데 사용됩니다.

## 2 Jar의 종류

### 2.1 Plain Jar

- Plain Jar는 기본적인 Jar 파일로, 프로젝트의 컴파일된 클래스 파일과 리소스만을 포함합니다.
- 이는 외부 라이브러리나 종속성은 포함하지 않습니다.
- Plain Jar는 다른 프로젝트에서 라이브러리로 사용되거나, 클래스패스에 추가되어 사용될 수 있습니다.
- 하지만 Plain Jar 자체만으로는 실행할 수 없으며, 필요한 종속성을 별도로 제공해야 합니다.
- WAR와 다르게 JAR 파일은 내부에 라이브러리 역할을 하는 JAR 파일을 포함할 수 없습니다.
  - jar를 포함시켜도 인식되지 않습니다.
  - 이것이 JAR 파일 스펙의 한계이며 이를 해결하기 위해 Fat Jar를 사용합니다.

### 2.2 Fat Jar (Uber Jar)

- Fat Jar 또는 Uber Jar로도 불리는 이 파일은 애플리케이션을 실행하는 데 필요한 모든 종속성과 리소스를 포함하는 Jar 파일입니다.
- 즉, 프로젝트에서 사용된 모든 외부 라이브러리 파일이 Fat Jar에 포함되어 있어, 이 Jar 파일만으로 애플리케이션을 실행할 수 있습니다.
- jar안에는 jar를 포함시켜도 인식되지 않습니다. 그러나 클래스는 얼마든지 포함시킬 수 있습니다.
  - fat jar는 라이브러리에 사용되는 jar를 풀어 나오는 class를 뽑아 새로운 jar에 포함시는 방식으로 jar를 생성합니다. 그래서 fat jar라고 부릅니다.

#### 2.2.1 장점

- Fat Jar 덕분에 하나의 jar 파일에 필요한 라이브러리들을 내장할 수 있게 되었습니다.
- 내장 톰캣 라이브러리를 jar 내부에 내장하여 하나의 jar 파일로 배포부터, 웹 서버 설치, 실행까지 모든 것을 단순화 할 수도 있습니다.

#### 2.2.2 단점

- 이는 배포 과정을 단순화하지만 파일 크기가 증가하는 단점이 있습니다.
- 어떤 라이브러리가 포함되어 있는지 확인하기 어렵습니다.
  - 모든 class 파일을 풀어 어떤 라이브러리가 사용되고 있는지 추적하기 어렵습니다.
- 파일명 중복을 피할 수 없습니다.
  - 서로 다른 라이브러리에서 클래스나 리소스 명이 중복되는 경우 하나만 선택하고 나머지는 포기해야 합니다.

### 2.3 Boot Jar (실행 가능 Jar)

- Boot Jar는 Spring Boot 프레임워크에서 사용되는 특수한 유형의 Jar 파일입니다.
- 이는 Fat Jar의 개념을 확장하며 Spring Boot 애플리케이션을 실행하는 데 필요한 모든 것을 포함합니다.
- Boot Jar는 Spring Boot의 특정 구조를 따르며 내장 컨테이너(예: Tomcat)를 사용하여 웹 애플리케이션을 쉽게 배포하고 실행하기 위해 설계되었습니다.

#### 2.3.1 실행 가능 Jar의 필요성

- Spring Boot는 Fat Jar의 문제점을 해결하기 위해 jar 내부에 jar를 포함할 수 있는 특별한 구조의 jar를 만들었습니다.
- 이를 실행 가능 Jar(Executable Jar)라 하며, 다음과 같은 문제들을 해결합니다.
	- **라이브러리 식별 문제**: jar 내부에 jar를 포함하기 때문에 어떤 라이브러리가 포함되어 있는지 쉽게 확인할 수 있습니다.
	- **파일명 중복 문제**: `a.jar`, `b.jar` 내부에 같은 경로의 파일이 있어도 둘 다 인식할 수 있습니다.

:::note
실행 가능 Jar는 자바 표준이 아니라 Spring Boot에서 새롭게 정의한 것입니다.
:::

#### 2.3.2 Boot Jar 내부 구조

Boot Jar는 다음과 같은 구조를 가집니다:

```
boot-0.0.1-SNAPSHOT.jar
├── META-INF/
│   └── MANIFEST.MF
├── org/springframework/boot/loader/
│   └── JarLauncher.class (Spring Boot main() 실행 클래스)
└── BOOT-INF/
    ├── classes/ (개발한 class 파일과 리소스 파일)
    │   ├── hello/boot/BootApplication.class
    │   └── hello/boot/controller/HelloController.class
    ├── lib/ (외부 라이브러리)
    │   ├── spring-webmvc-6.0.4.jar
    │   └── tomcat-embed-core-10.1.5.jar
    ├── classpath.idx (외부 라이브러리 모음)
    └── layers.idx (Spring Boot 구조 정보)
```

#### 2.3.3 MANIFEST.MF 파일 구조

`java -jar xxx.jar` 실행 시 `META-INF/MANIFEST.MF` 파일을 읽어 실행 정보를 확인합니다:

```
Manifest-Version: 1.0
Main-Class: org.springframework.boot.loader.JarLauncher
Start-Class: hello.boot.BootApplication
Spring-Boot-Version: 3.0.2
Spring-Boot-Classes: BOOT-INF/classes/
Spring-Boot-Lib: BOOT-INF/lib/
Spring-Boot-Classpath-Index: BOOT-INF/classpath.idx
Spring-Boot-Layers-Index: BOOT-INF/layers.idx
Build-Jdk-Spec: 17
```

- **Main-Class**
  - 실제 실행되는 클래스는 `JarLauncher`입니다 (우리가 작성한 메인 클래스가 아님)
  - 스프링 부트가 빌드 시 Main-Class에 `JarLauncher`를 등록합니다.
  - 특별한 장치 없이는 jar안에는 jar를 넣을 수 없습니다.
  - `JarLauncher`가 jar 내부에서 jar를 읽어들이는 기능을 합니다. 이 작업을 진행한 후에 **Start-Class**에 지정된 main()을 호출하게 됩니다.
- **Start-Class**: 우리가 작성한 실제 애플리케이션의 메인 클래스입니다
- **기타 항목들**: Spring Boot가 내부에서 사용하는 정보들입니다

:::warning
`Main-Class`를 제외한 나머지는 자바 표준이 아니라 Spring Boot가 임의로 사용하는 정보입니다.
:::

#### 2.3.4 Spring Boot 로더

- `org/springframework/boot/loader` 하위에 있는 클래스들입니다.
- `JarLauncher`를 포함한 Spring Boot가 제공하는 실행 가능 Jar를 실제로 구동시키는 클래스들이 포함되어 있습니다.
- Spring Boot는 빌드 시에 이 클래스들을 포함해서 Boot Jar를 만들어줍니다.

#### 2.3.5 BOOT-INF 구조

- **classes**: 개발한 class 파일과 리소스 파일
- **lib**: 외부 라이브러리 jar 파일들
- **classpath.idx**: 외부 라이브러리 목록
- **layers.idx**: Spring Boot 구조 정보

:::tip
WAR 구조의 `WEB-INF`와 유사한 개념으로, `BOOT-INF`라는 이름을 사용합니다.
:::

#### 2.3.6 실행 과정

Boot Jar의 실행 과정은 다음과 같습니다:

1. `java -jar xxx.jar` 명령어 실행
2. `MANIFEST.MF` 파일 인식
3. `JarLauncher.main()` 실행
	- `BOOT-INF/classes/` 인식
	- `BOOT-INF/lib/` 인식
4. `BootApplication.main()` 실행 (실제 애플리케이션 시작)

:::info
IDE에서 직접 실행할 때는 `BootApplication.main()`을 바로 실행합니다. IDE가 필요한 라이브러리를 모두 인식할 수 있게 도와주기 때문에 `JarLauncher`가 필요하지 않습니다.
:::