---
title: "GitHub CODEOWNERS 완벽 가이드: 코드 소유권 관리로 리뷰 워크플로우 개선하기"
description: "GitHub CODEOWNERS 파일을 사용하여 코드 소유권을 관리하는 방법을 알아봅니다. 파일 위치, 문법, 브랜치 보호 규칙과의 연동까지 실전 예제와 함께 효과적인 코드 리뷰 프로세스를 구축하는 방법을 설명합니다."
tags: ["GITHUB", "CODE_REVIEW", "DEVOPS", "COLLABORATION", "VERSION_CONTROL"]
keywords: ["깃허브", "GitHub", "코드오너스", "CODEOWNERS", "코드소유권", "code ownership", "코드 리뷰", "code review", "풀 리퀘스트", "pull request", "브랜치 보호", "branch protection", "코드 품질", "협업", "collaboration", "깃", "git", "버전 관리", "version control"]
draft: false
hide_title: true
---

## 1. GitHub CODEOWNERS 소개

- GitHub CODEOWNERS는 리포지토리 내 코드의 책임자를 정의하는 기능입니다.
- 이를 통해 특정 코드 영역에 대해 자동으로 리뷰 요청을 받을 담당자나 팀을 지정할 수 있습니다.
- 풀 리퀘스트가 생성될 때 변경된 파일에 대한 코드 소유자에게 자동으로 리뷰 요청이 전송됩니다.

### 1.1 CODEOWNERS의 주요 이점

- 팀 구성원의 전문 분야를 명확히 하고 책임 소재를 분명히 합니다.
- 적절한 리뷰어를 수동으로 찾아 지정하는 과정을 자동화합니다.
- 코드 변경 시 관련 전문가의 리뷰를 보장하여 코드 품질을 향상시킵니다.
- 브랜치 보호 규칙과 결합하여 코드 소유자의 승인 없이는 병합할 수 없도록 설정할 수 있습니다.

### 1.2 사용 권한

- CODEOWNERS 파일을 생성하거나 편집하려면 리포지토리에 대한 쓰기 권한이 필요합니다.
- 코드 소유자로 지정된 사용자나 팀도 리포지토리에 대한 쓰기 권한이 있어야 합니다.
- 관리자 또는 소유자 권한이 있는 사용자는 풀 리퀘스트 병합 전에 코드 소유자의 승인을 필수로 요구하도록 설정할 수 있습니다.

## 2. CODEOWNERS 설정 방법

### 2.1 파일 위치

- CODEOWNERS 파일은 다음 위치 중 하나에 생성할 수 있습니다:
  - `.github/` 디렉토리
  - 리포지토리의 루트 디렉토리
  - `docs/` 디렉토리
- GitHub는 위의 순서대로 파일을 검색하고 처음 발견한 파일을 사용합니다.
- 각 CODEOWNERS 파일은 리포지토리의 단일 브랜치에 대한 코드 소유자를 지정합니다.

:::info
서로 다른 브랜치에 대해 다른 코드 소유자를 지정할 수 있습니다. 예를 들어, 기본 브랜치의 코드베이스에는 `@octo-org/codeowners-team`을, GitHub Pages용 gh-pages 브랜치에는 `@octocat`을 지정할 수 있습니다.
:::

### 2.2 파일 크기 제한

- CODEOWNERS 파일은 3MB 미만이어야 합니다.
- 이 제한을 초과하는 파일은 로드되지 않으며, 코드 소유자 정보가 표시되지 않고 적절한 코드 소유자에게 리뷰 요청이 전송되지 않습니다.
- 파일 크기를 줄이려면 와일드카드 패턴을 사용하여 여러 항목을 하나의 항목으로 통합하는 것이 좋습니다.

## 3. CODEOWNERS 문법 가이드

### 3.1 기본 문법

- CODEOWNERS 파일은 gitignore 파일과 유사한 패턴 규칙을 사용합니다.
- 각 줄은 파일 패턴과 하나 이상의 소유자로 구성됩니다.
- 소유자는 `@username` 또는 `@org/team-name` 형식을 사용합니다.

#### 기본 문법 예시
```
# 이것은 주석입니다.
# 각 줄은 파일 패턴과 하나 이상의 소유자로 구성됩니다.

# 이 소유자들은 리포지토리의 모든 파일에 대한 기본 소유자가 됩니다.
# 나중에 더 구체적인 매칭이 없는 한, @global-owner1과 @global-owner2가
# 풀 리퀘스트에 대한 리뷰 요청을 받게 됩니다.
*       @global-owner1 @global-owner2

# JavaScript 파일을 수정하는 풀 리퀘스트는 @js-owner에게만 리뷰 요청이 갑니다.
*.js    @js-owner

# 이메일 주소도 사용할 수 있습니다.
*.go docs@example.com
```

### 3.2 고급 패턴 사용법

- 디렉토리와 하위 디렉토리에 대한 소유권을 지정할 수 있습니다.
- 특정 경로에 대한 소유자를 지정하거나 제외할 수 있습니다.
- 여러 소유자를 동일한 패턴에 매칭시키려면 모든 소유자가 같은 줄에 있어야 합니다.

#### 고급 패턴 예시
```
# 루트의 /build/logs/ 디렉토리와 그 하위 디렉토리의 모든 파일은 @doctocat이 소유합니다.
/build/logs/ @doctocat

# docs/* 패턴은 docs/getting-started.md와 같은 파일은 일치하지만
# docs/build-app/troubleshooting.md와 같이 더 깊이 중첩된 파일은 일치하지 않습니다.
docs/* docs@example.com

# 리포지토리 내 어디에나 있는 apps 디렉토리의 파일은 @octocat이 소유합니다.
apps/ @octocat

# /scripts/ 디렉토리 내의 모든 변경은 @doctocat 또는 @octocat의 승인이 필요합니다.
/scripts/ @doctocat @octocat

# /logs/ 디렉토리(예: /build/logs/, /scripts/logs/, /deeply/nested/logs/)의 모든 파일은
# @octocat이 소유합니다.
**/logs @octocat
```

### 3.3 문법 제한 사항

- gitignore 파일에서 작동하는 일부 문법 규칙은 CODEOWNERS 파일에서 작동하지 않습니다:
  - `\`를 사용하여 `#`로 시작하는 패턴을 이스케이프하는 기능
  - `!`를 사용하여 패턴을 무효화하는 기능
  - `[ ]`를 사용하여 문자 범위를 정의하는 기능

:::warning
CODEOWNERS 경로는 대소문자를 구분합니다. GitHub는 대소문자를 구분하는 파일 시스템을 사용하기 때문에, macOS와 같이 대소문자를 구분하지 않는 시스템에서도 CODEOWNERS 파일에서 경로와 파일은 올바른 대소문자를 사용해야 합니다.
:::

## 4. 실전 CODEOWNERS 설정 예시

### 4.1 팀 기반 소유권 설정

- 팀을 코드 소유자로 지정할 수 있습니다.
- 팀은 @org/team-name 형식으로 식별되어야 합니다.
- 팀은 리포지토리에 대한 명시적인 쓰기 권한이 있어야 합니다.

```
# 텍스트 파일은 octo-org 조직의 octocats 팀이 소유합니다.
*.txt @octo-org/octocats

# 프론트엔드 코드는 프론트엔드 팀이 담당합니다.
/frontend/ @company/frontend-team

# 백엔드 코드는 백엔드 팀이 담당합니다.
/backend/ @company/backend-team

# 인프라 관련 코드는 DevOps 팀이 담당합니다.
/infrastructure/ @company/devops-team
```

### 4.2 하위 디렉토리 제외 설정

- 특정 디렉토리를 소유하면서 일부 하위 디렉토리는 제외하는 설정도 가능합니다.

```
# /apps/ 디렉토리는 @octocat이 소유하지만
# /apps/github 하위 디렉토리는 소유자가 비어있어 제외됩니다.
# 따라서 apps/github에 대한 변경은 리포지토리에 쓰기 권한이 있는
# 모든 사용자의 승인으로 이루어질 수 있습니다.
/apps/ @octocat
/apps/github

# 또는 다른 소유자를 지정할 수도 있습니다.
/apps/ @octocat
/apps/github @doctocat
```

### 4.3 다양한 파일 유형에 대한 소유권 설정

```
# 기본 소유자 설정
*       @default-owner

# 프로그래밍 언어별 소유자
*.js    @javascript-expert
*.py    @python-expert
*.java  @java-expert
*.go    @golang-expert

# 문서 관련 파일
*.md    @documentation-team
*.txt   @documentation-team
*.pdf   @documentation-team

# 설정 파일
*.yml   @devops-team
*.json  @devops-team
*.toml  @devops-team
*.xml   @devops-team

# 테스트 파일
**/test/       @qa-team
**/*test*.js   @qa-team
**/*spec*.js   @qa-team
```

## 5. CODEOWNERS와, 브랜치 보호 규칙 연동

- 리포지토리 소유자는 브랜치 보호 규칙을 업데이트하여 변경된 코드가 해당 파일의 소유자에 의해 검토되도록 할 수 있습니다.
- 브랜치 보호 규칙을 편집하고 "코드 소유자의 리뷰 필요" 옵션을 활성화하면 됩니다.

:::info
코드 소유자의 리뷰가 필요한 경우, 소유자 중 누구든지 한 명의 승인으로도 이 요구 사항을 충족할 수 있습니다. 예를 들어, CODEOWNERS 파일에 `*.js @global-owner1 @global-owner2`와 같은 라인이 있다면, JavaScript 파일의 변경은 @global-owner1 또는 @global-owner2 중 한 명의 승인만으로도 충분합니다.
:::

### 5.1 CODEOWNERS 파일 자체 보호하기

- 리포지토리를 무단 변경으로부터 완전히 보호하려면 CODEOWNERS 파일 자체에 대한 소유자도 정의해야 합니다.
- 가장 안전한 방법은 리포지토리의 `.github` 디렉토리에 CODEOWNERS 파일을 정의하고, 리포지토리 소유자를 CODEOWNERS 파일의 소유자로 지정하는 것입니다.

```
# CODEOWNERS 파일의 소유자 지정
/.github/CODEOWNERS @owner_username

# 또는 .github 디렉토리 전체의 소유자 지정
/.github/ @owner_username
```

### 5.2 Ruleset을 활용한 대안

- 브랜치 보호 규칙 대신 Ruleset을 사용할 수도 있습니다.
- Ruleset은 상태 및 관리자 액세스 권한 없이도 더 나은 발견 가능성과 같은 몇 가지 장점이 있습니다.
- 여러 Ruleset을 동시에 적용할 수도 있습니다.

## 6. CODEOWNERS 작동 방식

### 6.1 Pull Request 워크플로우

- 누군가 코드를 수정하는 풀 리퀘스트를 열면 해당 코드의 소유자에게 자동으로 리뷰 요청이 전송됩니다.
- 코드 소유자는 초안 풀 리퀘스트에 대해서는 자동으로 리뷰 요청을 받지 않습니다.
- 초안 풀 리퀘스트를 리뷰 준비 상태로 표시하면 코드 소유자에게 자동으로 알림이 전송됩니다.

### 6.2 소유자 식별 방법

- 파일에 코드 소유자가 있는 경우, 리포지토리에서 파일을 찾아보고 도구 팁에서 코드 소유권 세부 정보를 확인할 수 있습니다.
- UI에서는 파일 헤더에 방패 아이콘 위에 마우스를 올리면 "Owned by USER or TEAM (from CODEOWNERS line NUMBER)" 형식의 도구 팁이 표시됩니다.

### 6.3 포크와 CODEOWNERS

- 풀 리퀘스트는 해당 풀 리퀘스트의 베이스 브랜치에서 CODEOWNERS 버전을 사용하여 리뷰 요청을 트리거합니다.
- 포크에서 풀 리퀘스트를 생성하고 베이스 브랜치가 업스트림 리포지토리에 있는 경우, 풀 리퀘스트는 업스트림 리포지토리의 해당 브랜치에 있는 CODEOWNERS 파일을 사용합니다.
- 베이스 브랜치가 포크 내의 브랜치인 경우, 풀 리퀘스트는 포크의 해당 브랜치에 있는 CODEOWNERS 파일을 사용합니다.

## 7. 실무 팁 및 권장 사항

- 코드 소유자는 해당 영역의 전문가로 지정하되, 너무 많은 파일에 대한 책임을 한 사람에게 부여하지 마세요.
- 기술 도메인, 기능 영역 또는 코드베이스의 특정 부분을 기준으로 소유권을 구성하세요.
- 팀원들의 휴가나 부재 시를 고려하여 각 영역에 최소 2명 이상의 소유자를 지정하는 것이 좋습니다.
- 정기적으로 CODEOWNERS 파일을 검토하고 업데이트하여 팀 구성 변경이나 책임 영역 변화를 반영하세요.
- 복잡한 규칙보다는 단순하고 명확한 패턴을 사용하는 것이 좋습니다.
- 새로운 팀원 온보딩 과정에서 CODEOWNERS 파일을 활용하여 코드베이스의 책임 영역을 설명하세요.

## 8. 결론

- GitHub CODEOWNERS는 코드 소유권을 명확히 하고 코드 리뷰 프로세스를 자동화하는 강력한 도구입니다.
- 적절한 설정을 통해 변경된 코드가 해당 영역의 전문가에 의해 검토되도록 보장할 수 있습니다.
- 브랜치 보호 규칙과 함께 사용하면 코드 품질을 높이고 의도하지 않은 변경을 방지할 수 있습니다.
- 팀 구조와 책임 영역에 맞게 CODEOWNERS 파일을 구성하고 정기적으로 업데이트하면 효과적인 협업 환경을 조성할 수 있습니다.