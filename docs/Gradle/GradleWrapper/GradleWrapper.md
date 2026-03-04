---
title: "Gradle Wrapper"
description: "Gradle Wrapper 추가, 사용, 업그레이드, 커스터마이징 및 Wrapper JAR 무결성 검증 가이드"
keywords: ["Gradle", "Wrapper", "gradlew", "빌드"]
tags: ["Gradle", "Build"]
hide_title: true
last_update:
  date: 2026-02-04
  author: youngthree
---

## 1. 개요

- **Gradle 빌드를 실행하는 권장 방식**은 Gradle Wrapper(이하 "Wrapper")를 사용하는 것이다.
- **Wrapper는 스크립트**(`gradlew` 또는 `gradlew.bat`)로, 선언된 버전의 Gradle을 호출하며 필요 시 미리 다운로드한다. 
- 설치된 Gradle로 `gradle build`를 실행하는 대신, **`./gradlew build`**로 Wrapper를 통해 빌드를 실행한다.
- Wrapper는 별도 다운로드로 제공되지 않으며, `gradle wrapper` 태스크로 생성한다.

**Wrapper 사용 세 가지 경우**

1. **Wrapper 추가**: 새 Gradle 프로젝트를 설정하고 Wrapper를 추가한다.
2. **Wrapper 사용**: 이미 Wrapper가 있는 프로젝트에서 Wrapper로 빌드를 실행한다.
3. **Wrapper 업그레이드**: Wrapper를 새 Gradle 버전으로 업그레이드한다.

**Wrapper를 사용할 때의 이점**

- 특정 Gradle 버전으로 프로젝트를 통일해 더 안정적이고 견고한 빌드를 만든다.
- 다른 사용자에게 Gradle 버전을 제공하는 것은 Wrapper 정의만 바꾸면 된다.
- 다른 실행 환경(IDE, CI 서버 등)에서 Gradle 버전을 제공하는 것도 Wrapper 정의만 바꾸면 된다.

## 2. Gradle Wrapper 추가하기

- Gradle Wrapper는 **다운로드하는 것이 아니다**.
- Wrapper 파일을 생성하려면 머신에 설치된 Gradle 런타임이 필요하다. 
- 설치 방법은 공식 문서의 Installation을 참고한다. 다행히 최초 Wrapper 파일 생성은 한 번만 하면 된다.
- 모든 기본 Gradle 빌드에는 `wrapper`라는 내장 태스크가 있다. 태스크 목록에서는 "Build Setup tasks" 그룹에 있다.
- `wrapper` 태스크를 실행하면 프로젝트 디렉토리에 필요한 Wrapper 파일이 생성된다.

```bash
$ gradle wrapper
```

```text
> Task :wrapper

BUILD SUCCESSFUL in 0s
1 actionable task: 1 executed
```

:::note[버전 관리]

다른 개발자와 실행 환경에서 Wrapper 파일을 쓰려면 **버전 관리에 커밋**해야 한다. Wrapper 파일( JAR 포함)은 크기가 작다. JAR을 버전 관리에 넣는 것은 일반적인 방식이다. 일부 조직은 바이너리를 버전 관리에 넣는 것을 허용하지 않으며, 이에 대한 우회 방법은 없다.

:::

- 생성된 Wrapper 설정 파일 `gradle/wrapper/gradle-wrapper.properties`에는 Gradle 배포판에 대한 다음 정보가 저장된다.
  - Gradle 배포판을 호스팅하는 **서버**
  - **배포판 유형**. 기본값 `-bin`은 런타임만 포함하고 샘플/문서는 포함하지 않는다.
  - 빌드 실행에 사용하는 **Gradle 버전**. 기본적으로 `wrapper` 태스크는 Wrapper 파일을 생성할 때 사용한 Gradle 버전을 사용한다.
  - (선택) Gradle 배포판 다운로드 시 사용하는 **타임아웃**(ms)
  - (선택) 배포판 URL **검증** 여부(boolean)

**`gradle/wrapper/gradle-wrapper.properties`에 생성되는 distribution URL 예시**

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-9.3.1-bin.zip
```

:::tip[-bin vs -all]

대부분의 빌드에는 **-bin** 배포판을 사용한다. -bin에는 빌드와 실행에 필요한 런타임만 들어 있다. Gradle 소스와 문서까지 포함한 -all 배포판보다 다운로드 용량이 작고 CI에서 캐시하기에도 유리하다.

:::

**Wrapper 파일 생성 시 사용할 수 있는 명령줄 옵션**

| 옵션 | 설명 |
|------|------|
| `--gradle-version` | Wrapper가 다운로드·실행에 사용할 Gradle 버전. properties에 쓰기 전에 distribution URL이 검증된다. 9 이상에서는 major/minor만 지정 가능(예: `9` → 최신 9.x.y, `9.1` → 최신 9.1.x). 라벨: `latest`, `release-candidate`, `release-milestone`, `release-nightly`, `nightly` |
| `--distribution-type` | Wrapper가 사용할 Gradle 배포 유형. `bin`, `all`. 기본값 `bin`. |
| `--gradle-distribution-url` | Gradle 배포 ZIP의 전체 URL. 이 옵션을 쓰면 `--gradle-version`, `--distribution-type`은 무시된다. 사내 네트워크에 배포판을 호스팅할 때 유용. URL은 properties에 쓰기 전에 검증된다. |
| `--gradle-distribution-sha256-sum` | 다운로드한 Gradle 배포판 검증에 쓸 SHA256 해시 |
| `--network-timeout` | Gradle 배포판 다운로드 시 네트워크 타임아웃(ms). 기본값 10000 |
| `--no-validate-url` | 설정된 distribution URL 검증 비활성화 |
| `--validate-url` | 설정된 distribution URL 검증 활성화(기본값) |

- `--gradle-version` 또는 `--gradle-distribution-url`로 URL을 설정한 경우, `https` 스킴이면 HEAD 요청으로, `file` 스킴이면 파일 존재 여부로 검증한다.

**예: 9.3.1 버전, -all 배포판으로 Wrapper 생성(IDE 코드 완성·소스 탐색용)**

```bash
$ gradle wrapper --gradle-version 9.3.1 --distribution-type all
```

```text
> Task :wrapper

BUILD SUCCESSFUL in 0s
1 actionable task: 1 executed
```

- 그 결과 Wrapper properties 파일에는 다음 URL이 들어간다.

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-9.3.1-all.zip
```

**Wrapper 파일이 있는 프로젝트 레이아웃 예시**

```text
.
├── a-subproject
│   └── build.gradle.kts
├── settings.gradle.kts
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew
└── gradlew.bat
```

- Groovy DSL을 쓰면 `build.gradle`, `settings.gradle`이 된다. Wrapper 파일은 `gradle` 디렉토리와 프로젝트 루트에 위치한다.

**파일 역할**

| 파일 | 역할 |
|------|------|
| `gradle-wrapper.jar` | Gradle 배포판 다운로드 코드를 담은 Wrapper JAR |
| `gradle-wrapper.properties` | Wrapper 런타임 동작 설정(예: 호환 Gradle 버전). 프록시 등 더 일반적인 설정은 다른 파일에 둔다. |
| `gradlew`, `gradlew.bat` | Wrapper로 빌드를 실행하는 셸 스크립트(Unix)와 배치 스크립트(Windows) |

- Gradle을 설치하지 않고도 Wrapper로 빌드를 실행할 수 있다. 프로젝트에 Wrapper 파일이 없으면 생성해야 한다.

## 3. Gradle Wrapper 사용하기

- **빌드는 항상 Wrapper로 실행하는 것을 권장**한다. 그러면 동일하고 제어된 Gradle 버전으로 빌드가 실행된다.
- 사용 방법은 설치된 Gradle로 빌드하는 것과 같다. OS에 따라 `gradle` 대신 `gradlew` 또는 `gradlew.bat`을 실행하면 된다.

**Windows에서 Java 프로젝트 Wrapper 사용 예**

```bash
$ gradlew.bat build
```

```text
Downloading https://services.gradle.org/distributions/gradle-5.0-all.zip
.....................................................................................
Unzipping C:\Documents and Settings\Claudia\.gradle\wrapper\dists\gradle-5.0-all\...
Set executable permissions for: ...\gradle-5.0\bin\gradle

BUILD SUCCESSFUL in 12s
1 actionable task: 1 executed
```

- Gradle 배포판이 이전에 `GRADLE_USER_HOME`에 없었다면, Wrapper가 다운로드한 뒤 그 위치에 저장한다. 이후에는 `gradle-wrapper.properties`의 distribution URL이 바뀌지 않는 한 기존 배포판을 재사용한다.

:::note[실행 위치]

Wrapper 셸/배치 스크립트는 단일·멀티 프로젝트 빌드의 **루트**에 있다. 서브프로젝트 디렉토리에서 빌드를 실행할 때는 해당 스크립트 경로를 지정해야 한다(예: `../../gradlew tasks`).

:::

## 4. Gradle Wrapper 업그레이드하기

- 프로젝트는 새 기능과 개선을 위해 Gradle 버전을 올리는 경우가 많다.
- **권장 방법**은 [2. Gradle Wrapper 추가하기](#2-gradle-wrapper-추가하기)에서처럼 `wrapper` 태스크를 실행하고 대상 Gradle 버전을 지정하는 것이다. 이렇게 하면 해당 Gradle 버전에 맞는 Wrapper 스크립트·배치 파일 최적화가 적용된다.
- 변경된 Wrapper 파일은 버전 관리에 커밋하는 것이 좋다.
- `wrapper` 태스크를 한 번 실행하면 **`gradle-wrapper.properties`만** 갱신되고, `gradle-wrapper.jar`는 그대로인 경우가 많다. 보통은 문제 없다. 새 Gradle은 구 Wrapper 파일로도 실행 가능하다.

:::tip[모든 Wrapper 파일 최신화]

**모든** Wrapper 파일을 완전히 최신 상태로 만들려면 `wrapper` 태스크를 **두 번** 실행해야 할 수 있다.

:::

**최신 버전으로 업그레이드**

```bash
# macOS, Linux
$ ./gradlew wrapper --gradle-version latest
```

```bash
# Windows
$ gradlew.bat wrapper --gradle-version latest
```

```text
BUILD SUCCESSFUL in 4s
1 actionable task: 1 executed
```

**특정 버전으로 업그레이드**

```bash
# macOS, Linux
$ ./gradlew wrapper --gradle-version 9.3.1
```

```bash
# Windows
$ gradlew.bat wrapper --gradle-version 9.3.1
```

- 업그레이드 후 `./gradlew --version`으로 버전을 확인할 수 있다.

:::tip[wrapper JAR·스크립트 갱신]

`gradlew`, `gradlew.bat`을 최신으로 만들려면 **wrapper 태스크를 한 번 더** 실행해 Gradle 배포 바이너리를 받고(필요 시) 스크립트를 갱신해야 한다.

:::

- `gradle-wrapper.properties`의 `distributionUrl`을 **직접 수정**해서 Gradle 버전을 바꿀 수도 있다. 위 팁은 이 경우에도 적용된다.

:::note[Gradle 9.0.0 이후 버전 형식]

Gradle 9.0.0부터는 버전이 **항상** X.Y.Z 형식이다. `gradle-wrapper.properties`에서는 major나 minor만 쓰는 것은 지원하지 않는다.

:::

## 5. Gradle Wrapper 커스터마이징

- 대부분은 Wrapper 기본 동작으로 충분하다. 다만 정책, 보안, 선호에 따라 Wrapper 동작을 바꿀 수 있다.
- 내장 `wrapper` 태스크가 여러 옵션을 제공한다. 대부분의 설정은 `Wrapper` 태스크 타입에서 노출된다.

**예: 매번 업그레이드 시 -all을 쓰고 싶을 때**

- 매번 `--distribution-type all`을 입력하지 않으려면 `wrapper` 태스크를 설정하면 된다.

**build.gradle.kts**

```kotlin
tasks.wrapper {
    distributionType = Wrapper.DistributionType.ALL
}
```

**build.gradle (Groovy)**

```groovy
tasks.named('wrapper') {
    distributionType = Wrapper.DistributionType.ALL
}
```

- 이렇게 설정한 뒤 `./gradlew wrapper --gradle-version 9.3.1`만 실행해도 properties에는 -all 배포 URL이 들어간다.

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-9.3.1-all.zip
```

- 더 많은 설정은 API 문서를 참고한다. Gradle 배포판에 Wrapper 설정 샘플도 포함되어 있다.

### 5.1 인증이 필요한 Gradle 배포 다운로드

- Wrapper는 **HTTP Basic 인증**을 사용하는 서버에서 Gradle 배포판을 받을 수 있다. 사내 보호 서버에 배포판을 두는 경우에 쓰인다.
- 사용자명·비밀번호는 **시스템 프로퍼티** 또는 **`distributionUrl`에 직접** 넣을 수 있다. 시스템 프로퍼티가 `distributionUrl` 내 자격 증명보다 우선한다.

:::warning[Basic 인증과 HTTP]

HTTP Basic 인증은 **HTTPS** URL에서만 사용해야 한다. HTTP에서는 자격 증명이 평문으로 전달된다.

:::

- 시스템 프로퍼티는 사용자 홈의 `.gradle/gradle.properties` 등으로 지정할 수 있다.
- Basic 인증 자격 증명을 시스템 프로퍼티로 넣는 예:

```properties
systemProp.gradle.wrapperUser=username
systemProp.gradle.wrapperPassword=password
```

- `gradle/wrapper/gradle-wrapper.properties`의 **`distributionUrl`에 자격 증명을 넣는** 방법도 있다. 이 파일은 버전 관리에 커밋되는 경우가 많다.

:::note[distributionUrl 자격 증명]

공유 자격 증명을 distributionUrl에 넣는 것은 **통제된 환경**에서만 사용하는 것이 좋다.

:::

**distributionUrl에 자격 증명 넣기**

```properties
distributionUrl=https://username:password@somehost/path/to/gradle-distribution.zip
```

- 프록시(인증 유무 무관)와 함께 쓸 수 있다. 프록시 설정은 "Accessing the web via a proxy" 문서를 참고한다.

### 5.2 다운로드한 Gradle 배포판 검증

- Wrapper는 다운로드한 Gradle 배포판을 **SHA-256 해시**로 검증할 수 있다. 중간자 공격으로 배포판이 변조되는 것을 줄이는 데 도움이 된다.
- 이 기능을 쓰려면 사용할 Gradle 배포판에 대응하는 **.sha256** 파일을 다운로드한다.

**SHA-256 파일 다운로드**

- stable, release candidate, nightly 배포에서 .sha256 파일을 받을 수 있다. 파일 내용은 해당 zip의 SHA-256 해시 한 줄이다.
- [Gradle distribution checksums](https://gradle.org/release-checksums/) 목록도 참고할 수 있다.

**검증 설정**

- 다운로드한 SHA-256 해시를 `gradle-wrapper.properties`의 **`distributionSha256Sum`** 에 넣거나, 명령줄에서 **`--gradle-distribution-sha256-sum`** 으로 지정한다.

```properties
distributionSha256Sum=371cb9fbebbe9880d147f59bab36d61eee122854ef8c9ee1ecf12b82368bcf10
```

- 설정된 해시와 서버에서 받은 배포판의 해시가 다르면 빌드가 실패한다. 검증은 **아직 해당 Wrapper 배포판을 다운로드하지 않았을 때만** 수행된다.

:::note[distributionSha256Sum과 wrapper 태스크]

`gradle-wrapper.properties`에 `distributionSha256Sum`이 있는데 태스크 설정에서 해시를 지정하지 않으면 Wrapper 태스크가 실패할 수 있다. Gradle 버전을 바꾸지 않고 Wrapper 태스크를 실행하면 `distributionSha256Sum` 설정은 유지된다.

:::

## 6. Gradle Wrapper JAR 무결성 검증

- Wrapper JAR은 바이너리이며, 개발자와 빌드 서버에서 실행된다. 이런 파일은 **실행 전에 신뢰할 수 있는지 확인**하는 것이 좋다.
- Wrapper JAR은 보통 프로젝트 버전 관리에 커밋되므로, 악의적인 사용자가 "Gradle 버전만 올리는" PR로 원본 JAR을 변조된 JAR으로 바꿀 가능성이 있다.
- Gradle은 PR에 올라온 Wrapper JAR을 **알려진 정상 체크섬 목록**과 비교하는 GitHub Action을 제공한다.
- Gradle은 (3.3~4.0.2를 제외한) 모든 릴리스에 대한 JAR 체크섬을 공개하므로, Wrapper JAR을 **수동으로** 검증할 수도 있다.

### 6.1 GitHub에서 Wrapper JAR 자동 검증

- 해당 GitHub Action은 Gradle과 별도로 릴리스되므로, 프로젝트에 적용하는 방법은 Action 문서를 참고한다.

### 6.2 Wrapper JAR 수동 검증

- 다음 명령으로 Wrapper JAR 체크섬을 확인할 수 있다.

**Linux**

```bash
$ cd gradle/wrapper
```

```bash
$ curl --location --output gradle-wrapper.jar.sha256 \
       https://services.gradle.org/distributions/gradle-9.3.1-wrapper.jar.sha256
```

```bash
$ echo " gradle-wrapper.jar" >> gradle-wrapper.jar.sha256
```

```bash
$ sha256sum --check gradle-wrapper.jar.sha256
```

```text
gradle-wrapper.jar: OK
```

**macOS**

```bash
$ cd gradle/wrapper
```

```bash
$ curl --location --output gradle-wrapper.jar.sha256 \
       https://services.gradle.org/distributions/gradle-9.3.1-wrapper.jar.sha256
```

```bash
$ echo " gradle-wrapper.jar" >> gradle-wrapper.jar.sha256
```

```bash
$ shasum --check gradle-wrapper.jar.sha256
```

```text
gradle-wrapper.jar: OK
```

**Windows (PowerShell)**

```powershell
> $expected = Invoke-RestMethod -Uri https://services.gradle.org/distributions/gradle-9.3.1-wrapper.jar.sha256
```

```powershell
> $actual = (Get-FileHash gradle\wrapper\gradle-wrapper.jar -Algorithm SHA256).Hash.ToLower()
```

```powershell
> @{$true = 'OK: Checksum match'; $false = "ERROR: Checksum mismatch!`nExpected: $expected`nActual:   $actual"}[$actual -eq $expected]
```

```text
OK: Checksum match
```

### 6.3 체크섬 불일치 시

- 체크섬이 예상과 다르다면, 업그레이드된 Gradle 배포로 `wrapper` 태스크를 실행하지 않았을 가능성이 있다.
- 먼저 **실제 체크섬**이 다른 Gradle 버전의 것과 일치하는지 확인한다.
- 아래 명령으로 각 OS에서 Wrapper JAR의 실제 체크섬을 구할 수 있다.

**Linux**

```bash
$ sha256sum gradle/wrapper/gradle-wrapper.jar
```

**macOS**

```bash
$ shasum --algorithm=256 gradle/wrapper/gradle-wrapper.jar
```

**Windows (PowerShell)**

```powershell
> (Get-FileHash gradle\wrapper\gradle-wrapper.jar -Algorithm SHA256).Hash.ToLower()
```

- 구한 체크섬이 `<https://gradle.org/release-checksums/>`에 있으면, 해당 Wrapper JAR은 검증된 것이다. JAR을 생성한 Gradle 버전과 `gradle-wrapper.properties`의 버전이 다르면, `wrapper` 태스크를 한 번 더 실행해 Wrapper JAR을 갱신해도 된다.
- 목록에 없으면 milestone, release candidate, nightly 빌드이거나 Gradle 3.3~4.0.2에서 생성된 JAR일 수 있다. 출처를 확인하고, 증명되기 전까지는 신뢰하지 않는 것이 좋다. 변조를 의심하면 security@gradle.com으로 연락한다.

## 7. 참고

- [Gradle Wrapper (공식 문서)](https://docs.gradle.org/current/userguide/gradle_wrapper.html)
