## Claude가 프로젝트를 기억하는 방법

- CLAUDE.md 파일로 지속적인 지시를 주고, 자동 메모리(auto memory)로 Claude가 학습 내용을 자동으로 쌓게 하세요.
- Claude Code 세션은 매번 새로운 컨텍스트 창으로 시작합니다. 
- 세션을 넘어 지식을 전달하는 방식은 두 가지입니다.
  - **CLAUDE.md 파일**: Claude에게 지속적인 맥락을 주기 위해 직접 작성하는 지시문
  - **자동 메모리**: 수정이나 선호에 따라 Claude가 스스로 적어 두는 메모

이 문서에서는 다음을 다룹니다.

* [CLAUDE.md 파일 작성 및 구성](#claudemd-파일)
* [`.claude/rules/`로 규칙을 특정 파일 유형에 한정](#clauderules로-규칙-구성)
* [자동 메모리 설정](#자동-메모리)으로 Claude가 자동으로 메모하도록 하기
* 지시가 따르지 않을 때 [문제 해결](#문제-해결)

## CLAUDE.md vs 자동 메모리

- Claude Code에는 두 가지 보완적인 메모리 체계가 있습니다. 
- 둘 다 매 대화 시작 시 로드되며, Claude는 이를 “설정”이 아니라 “컨텍스트”로 취급합니다. 
- 지시가 구체적이고 간결할수록 더 일관되게 따릅니다.

| | CLAUDE.md 파일 | 자동 메모리 |
| :--- | :--- | :--- |
| **작성자** | 사용자 | Claude |
| **내용** | 지시·규칙 | 학습 내용·패턴 |
| **범위** | 프로젝트, 사용자, 조직 | 작업 트리(working tree) 단위 |
| **로드 대상** | 매 세션 | 매 세션 (처음 200줄) |
| **용도** | 코딩 표준, 워크플로, 프로젝트 아키텍처 | 빌드 명령, 디버깅 인사이트, Claude가 발견한 선호 |

Claude의 동작을 가이드하고 싶을 때는 CLAUDE.md를 쓰고, 수정 사항에서 자동으로 학습시키고 싶을 때는 자동 메모리를 사용하세요.

- 서브에이전트도 자체 자동 메모리를 유지할 수 있습니다. 
- [서브에이전트 설정](/en/sub-agents#enable-persistent-memory)을 참고하세요.

## CLAUDE.md 파일

- CLAUDE.md는 프로젝트, 개인 워크플로, 또는 조직 전체에 대한 지속적인 지시를 주는 마크다운 파일입니다. 
- 일반 텍스트로 작성하면 Claude가 매 세션 시작 시 읽습니다.

### CLAUDE.md를 둘 위치

- 여러 위치에 둘 수 있으며, 위치에 따라 적용 범위가 달라집니다. 
- 더 구체적인 위치가 더 넓은 범위보다 우선합니다.

| 범위 | 위치 | 목적 | 사용 예 | 공유 대상 |
| --- | --- | --- | --- | --- |
| **관리형 정책** | • macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`<br />• Linux/WSL: `/etc/claude-code/CLAUDE.md`<br />• Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | IT/DevOps가 관리하는 조직 전체 지시 | 회사 코딩 표준, 보안 정책, 컴플라이언스 | 조직 내 모든 사용자 |
| **프로젝트 지시** | `./CLAUDE.md` 또는 `./.claude/CLAUDE.md` | 팀이 공유하는 프로젝트용 지시 | 프로젝트 아키텍처, 코딩 표준, 공통 워크플로 | 소스 관리로 팀원과 공유 |
| **사용자 지시** | `~/.claude/CLAUDE.md` | 모든 프로젝트에 적용되는 개인 선호 | 코드 스타일, 개인 도구 단축키 | 본인만 (모든 프로젝트) |

- 현재 작업 디렉터리보다 상위 디렉터리 계층에 있는 CLAUDE.md는 실행 시 전체가 로드됩니다. 
- 하위 디렉터리의 CLAUDE.md는 해당 디렉터리 내 파일을 Claude가 읽을 때 필요에 따라 로드됩니다. 
- [CLAUDE.md 로드 방식](#claudemd-로드-방식)에서 전체 해석 순서를 확인할 수 있습니다.
- 규모가 큰 프로젝트에서는 [프로젝트 규칙](#clauderules로-규칙-구성)으로 주제별 파일로 나눌 수 있습니다. 
- 규칙을 사용하면 특정 파일 유형이나 하위 디렉터리에만 지시를 적용할 수 있습니다.

### 프로젝트 CLAUDE.md 설정

- 프로젝트 CLAUDE.md는 `./CLAUDE.md` 또는 `./.claude/CLAUDE.md`에 둘 수 있습니다. 
- 이 파일을 만들고 프로젝트에서 작업하는 누구에게나 적용할 내용을 넣으세요: 빌드·테스트 명령, 코딩 표준, 아키텍처 결정, 네이밍 규칙, 공통 워크플로. 
- 버전 관리로 팀과 공유되므로 개인 선호보다는 프로젝트 수준 기준에 맞춥니다.
:::tip[CLAUDE.md 초안 자동 생성]
`/init`을 실행하면 CLAUDE.md 초안을 자동 생성할 수 있습니다.

- Claude가 코드베이스를 분석해 빌드 명령, 테스트 방법, 발견한 프로젝트 관례를 담은 파일을 만듭니다.
- 이미 CLAUDE.md가 있으면 덮어쓰지 않고 개선 제안을 합니다.
- 그다음 Claude가 스스로 찾기 어려운 지시는 직접 추가하면 됩니다.
:::

### 효과적인 지시 작성

- CLAUDE.md는 매 세션 시작 시 컨텍스트 창에 로드되어 대화와 함께 토큰을 사용합니다. 
- “강제 설정”이 아니라 “컨텍스트”이기 때문에, 지시를 어떻게 쓰느냐에 따라 따르는 정도가 달라집니다. 
- 구체적이고 간결하며 구조가 잘 잡힌 지시가 가장 잘 지켜집니다.
- **분량**: CLAUDE.md당 200줄 미만을 목표로 하세요. 
  - 길수록 컨텍스트를 더 쓰고 준수도가 떨어질 수 있습니다. 
  - 지시가 많아지면 [import](#추가-파일-import)나 [`.claude/rules/`](#clauderules로-규칙-구성)로 나누세요.
- **구조**
  - 마크다운 제목과 불릿으로 관련 지시를 묶으세요. 
  - Claude도 독자처럼 구조를 훑어보므로, 정리된 섹션이 긴 문단보다 따라하기 쉽습니다.
- **구체성**: 검증 가능할 정도로 구체적으로 쓰세요. 예:
  - “코드를 예쁘게” → “들여쓰기는 2칸 스페이스”
  - “테스트해라” → “커밋 전에 `npm test` 실행”
  - “파일 정리해라” → “API 핸들러는 `src/api/handlers/`에 둔다”
- **일관성**
  - 서로 모순되는 규칙이 있으면 Claude가 임의로 하나만 따를 수 있습니다. 
  - CLAUDE.md, 하위 디렉터리의 CLAUDE.md, [`.claude/rules/`](#clauderules로-규칙-구성)를 주기적으로 검토해 오래되거나 충돌하는 지시를 제거하세요. 
  - 모노레포에서는 [claudeMdExcludes](#특정-claudemd-제외)로 다른 팀의 관련 없는 CLAUDE.md를 제외할 수 있습니다.

### 추가 파일 import

- CLAUDE.md에서는 `@path/to/import` 문법으로 다른 파일을 불러올 수 있습니다. 
- import된 파일은 해당 CLAUDE.md와 함께 실행 시 컨텍스트에 펼쳐져 로드됩니다.
- 상대 경로와 절대 경로 모두 가능합니다. 상대 경로는 작업 디렉터리가 아니라 import를 쓴 파일 기준으로 해석됩니다. - import된 파일이 다시 다른 파일을 import할 수 있으며, 최대 5단계까지 허용됩니다.
- README, package.json, 워크플로 가이드를 넣으려면 CLAUDE.md 어디서든 `@`로 참조하면 됩니다.

```text
See @README for project overview and @package.json for available npm commands for this project.

# Additional Instructions
- git workflow @docs/git-instructions.md
```

- 체크인하고 싶지 않은 개인 선호는 홈 디렉터리 파일을 import할 수 있습니다. 
- import 문은 공유 CLAUDE.md에 두고, 실제 파일은 본인 머신에만 둡니다.

```text
# Individual Preferences
- @~/.claude/my-project-instructions.md
```

:::warning[외부 import 승인]
Claude Code가 프로젝트에서 외부 import를 처음 만나면 승인 대화상자에 파일 목록을 보여 줍니다. 거부하면 import는 비활성 상태로 유지되고 대화상자는 다시 뜨지 않습니다.
:::

구조화된 규칙 구성은 [`.claude/rules/`](#clauderules로-규칙-구성)를 참고하세요.

### CLAUDE.md 로드 방식

- Claude Code는 현재 작업 디렉터리에서 디렉터리 트리를 위로 올라가며 각 디렉터리에서 CLAUDE.md를 찾아 읽습니다. 
- 즉 `foo/bar/`에서 실행하면 `foo/bar/CLAUDE.md`와 `foo/CLAUDE.md`가 모두 로드됩니다.
- 현재 작업 디렉터리 아래 하위 디렉터리의 CLAUDE.md도 발견되며, 실행 시 한꺼번에 로드하지 않고 해당 하위 디렉터리 파일을 Claude가 읽을 때 포함됩니다.
- 다른 팀의 CLAUDE.md까지 같이 잡히는 큰 모노레포에서는 [claudeMdExcludes](#특정-claudemd-제외)로 제외할 수 있습니다.

#### 추가 디렉터리에서 로드

`--add-dir` 플래그로 메인 작업 디렉터리 밖의 추가 디렉터리에 접근할 수 있습니다. 
- 기본값으로는 이 디렉터리의 CLAUDE.md는 로드되지 않습니다.
- 추가 디렉터리에서도 CLAUDE.md, `.claude/CLAUDE.md`, `.claude/rules/*.md`를 로드하려면 환경 변수 `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD`를 설정하세요.

```bash
CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1 claude --add-dir ../shared-config
```

### .claude/rules/로 규칙 구성

규모가 큰 프로젝트에서는 `.claude/rules/` 디렉터리로 지시를 여러 파일로 나눌 수 있습니다. 모듈화되어 유지보수가 쉬우며, [경로별 규칙](#경로-한정-규칙)으로 특정 파일에만 로드되게 해 컨텍스트를 아낄 수 있습니다.

:::note[규칙 vs 스킬]
규칙은 매 세션 또는 해당 파일이 열릴 때 컨텍스트에 로드됩니다. 항상 컨텍스트에 둘 필요 없는 작업용 지시는 [스킬](/en/skills)을 사용하세요. 스킬은 호출하거나 Claude가 관련 있다고 판단할 때만 로드됩니다.
:::

#### 규칙 설정

프로젝트의 `.claude/rules/` 안에 마크다운 파일을 두면 됩니다. 파일 하나당 한 주제를 다루고, `testing.md`, `api-design.md`처럼 설명적인 이름을 쓰세요. `.md` 파일은 재귀적으로 탐색되므로 `frontend/`, `backend/` 같은 하위 디렉터리로 정리할 수 있습니다.

```text
your-project/
├── .claude/
│   ├── CLAUDE.md           # 메인 프로젝트 지시
│   └── rules/
│       ├── code-style.md   # 코드 스타일
│       ├── testing.md      # 테스트 규칙
│       └── security.md     # 보안 요구사항
```

[paths 프론트매터](#경로-한정-규칙)가 없는 규칙은 `.claude/CLAUDE.md`와 동일한 우선순위로 실행 시 로드됩니다.

#### 경로 한정 규칙

YAML 프론트매터의 `paths` 필드로 특정 파일에만 규칙을 적용할 수 있습니다. 이 조건부 규칙은 지정한 패턴과 일치하는 파일을 다룰 때만 적용됩니다.

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API 개발 규칙

- 모든 API 엔드포인트에 입력 검증 포함
- 표준 에러 응답 형식 사용
- OpenAPI 문서 주석 포함
```

`paths`가 없는 규칙은 무조건 로드되어 모든 파일에 적용됩니다. 경로 한정 규칙은 해당 패턴과 일치하는 파일을 Claude가 읽을 때만 적용되며, 도구 사용마다 적용되는 것은 아닙니다.

`paths`에는 glob 패턴을 써서 확장자, 디렉터리 등을 지정할 수 있습니다.

| 패턴 | 매칭 |
| --- | --- |
| `**/*.ts` | 모든 디렉터리의 TypeScript 파일 |
| `src/**/*` | `src/` 아래 모든 파일 |
| `*.md` | 프로젝트 루트의 마크다운 |
| `src/components/*.tsx` | 특정 디렉터리의 React 컴포넌트 |

여러 패턴을 쓰거나 중괄호 확장으로 여러 확장자를 한 패턴에 넣을 수 있습니다.

```markdown
---
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
---
```

#### 심볼릭 링크로 규칙 공유

`.claude/rules/`는 심볼릭 링크를 지원하므로, 공통 규칙 세트를 한곳에서 관리하고 여러 프로젝트에 링크할 수 있습니다. 심볼릭 링크는 정상적으로 해석·로드되며, 순환 링크는 감지되어 처리됩니다.

예: 공유 디렉터리와 단일 파일을 모두 링크하는 경우.

```bash
ln -s ~/shared-claude-rules .claude/rules/shared
ln -s ~/company-standards/security.md .claude/rules/security.md
```

#### 사용자 수준 규칙

`~/.claude/rules/`에 두는 개인 규칙은 머신의 모든 프로젝트에 적용됩니다. 프로젝트에 종속되지 않은 선호에 쓰세요.

```text
~/.claude/rules/
├── preferences.md    # 개인 코딩 선호
└── workflows.md      # 선호 워크플로
```

사용자 수준 규칙이 프로젝트 규칙보다 먼저 로드되므로, 프로젝트 규칙이 더 높은 우선순위를 가집니다.

### 대규모 팀에서 CLAUDE.md 관리

조직 전체에 Claude Code를 배포하는 경우, 지시를 중앙에서 관리하고 어떤 CLAUDE.md가 로드될지 제어할 수 있습니다.

#### 조직 전체 CLAUDE.md 배포

조직에서 한 머신의 모든 사용자에게 적용되는 CLAUDE.md를 중앙 관리할 수 있습니다. 이 파일은 개별 설정으로 제외할 수 없습니다.

1. **관리형 정책 경로에 파일 생성**
   * macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`
   * Linux/WSL: `/etc/claude-code/CLAUDE.md`
   * Windows: `C:\Program Files\ClaudeCode\CLAUDE.md`
2. **설정 관리 시스템으로 배포**
   MDM, 그룹 정책, Ansible 등으로 개발자 머신에 배포합니다. [관리형 설정](/en/permissions#managed-settings)에서 다른 조직 전체 설정도 확인할 수 있습니다.

#### 특정 CLAUDE.md 제외

큰 모노레포에서는 상위 CLAUDE.md에 본인 작업과 무관한 지시가 들어 있을 수 있습니다. `claudeMdExcludes` 설정으로 경로나 glob 패턴으로 특정 파일을 로드에서 제외할 수 있습니다.

다음 예는 상위 폴더의 최상위 CLAUDE.md와 다른 팀 규칙 디렉터리를 제외합니다. 제외를 본인 머신에만 두려면 `.claude/settings.local.json`에 넣으세요.

```json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```

패턴은 glob 문법으로 절대 경로와 매칭됩니다. `claudeMdExcludes`는 [설정 계층](/en/settings#settings-files)(사용자, 프로젝트, 로컬, 관리형 정책) 어디서나 설정할 수 있으며, 배열은 계층별로 병합됩니다.

관리형 정책 CLAUDE.md는 제외할 수 없어, 조직 전체 지시가 항상 적용됩니다.

## 자동 메모리

- 자동 메모리로 사용자가 별도로 작성하지 않아도 세션을 넘어 지식이 쌓입니다. 
- Claude가 작업하면서 빌드 명령, 디버깅 인사이트, 아키텍처 메모, 코드 스타일·워크플로 습관 등을 스스로 메모합니다. 
- 매 세션마다 저장하는 것은 아니고, 앞으로 대화에 도움이 될지 판단해 저장할 만한 것만 기록합니다.

:::note[버전 요구사항]
자동 메모리는 Claude Code v2.1.59 이상에서 사용할 수 있습니다. `claude --version`으로 버전을 확인하세요.
:::

### 자동 메모리 켜기/끄기

- 기본값은 켜져 있습니다. 
- 세션에서 `/memory`를 열고 자동 메모리 토글을 쓰거나, 프로젝트 설정에서 `autoMemoryEnabled`를 지정할 수 있습니다.

```json
{
  "autoMemoryEnabled": false
}
```

환경 변수로 끄려면 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`을 설정하세요.

### 저장 위치

- 프로젝트마다 `~/.claude/projects/<project>/memory/` 디렉터리가 있습니다. 
- `<project>` 경로는 git 저장소에서 나오므로, 같은 저장소의 모든 워크트리와 하위 디렉터리가 하나의 자동 메모리 디렉터리를 공유합니다. 
- git 저장소 밖에서는 프로젝트 루트가 사용됩니다.
- 다른 경로에 두려면 사용자 또는 로컬 설정에서 `autoMemoryDirectory`를 설정하세요.

```json
{
  "autoMemoryDirectory": "~/my-custom-memory-dir"
}
```

- 이 설정은 정책, 로컬, 사용자 설정에서 받습니다. 
- 프로젝트 설정(`.claude/settings.json`)에서는 받지 않아, 공유 프로젝트가 자동 메모리를 민감한 경로로 redirect하는 것을 막습니다.
- 해당 디렉터리에는 `MEMORY.md` 진입점과 선택적 주제 파일이 있습니다.

```text
~/.claude/projects/<project>/memory/
├── MEMORY.md          # 요약 인덱스, 매 세션 로드
├── debugging.md       # 디버깅 패턴 상세
├── api-conventions.md # API 설계 결정
└── ...
```

- `MEMORY.md`는 메모리 디렉터리의 인덱스 역할을 합니다. 
- Claude는 세션 동안 이 디렉터리의 파일을 읽고 쓰며, `MEMORY.md`로 어디에 무엇이 있는지 관리합니다.
- 자동 메모리는 머신 로컬입니다. 
- 같은 git 저장소 내의 모든 워크트리·하위 디렉터리가 하나의 메모리 디렉터리를 공유하며, 머신이나 클라우드 환경 간에는 공유되지 않습니다.

### 동작 방식

- `MEMORY.md`의 **처음 200줄**만 매 대화 시작 시 로드됩니다. 
- 200줄을 넘는 부분은 세션 시작 시 로드되지 않습니다. 
- Claude는 상세 내용을 별도 주제 파일로 옮겨 `MEMORY.md`를 짧게 유지합니다.
- 이 200줄 제한은 `MEMORY.md`에만 적용됩니다. 
- CLAUDE.md는 길이와 관계없이 전체 로드되지만, 짧을수록 준수도가 좋습니다.
- `debugging.md`, `patterns.md` 같은 주제 파일은 시작 시 로드되지 않습니다. 
  - Claude가 필요할 때 일반 파일 도구로 읽습니다.
- Claude는 세션 중에 메모리 파일을 읽고 씁니다. 
- Claude Code UI에서 "Writing memory" 또는 "Recalled memory"가 보이면 `~/.claude/projects/<project>/memory/`를 갱신하거나 읽고 있는 것입니다.

### 메모리 검토 및 수정

- 자동 메모리 파일은 일반 마크다운이라 언제든 읽고 수정·삭제할 수 있습니다. 
- [`/memory`](#memory로-보기-및-수정)를 실행하면 세션에 로드된 CLAUDE.md·규칙 파일 목록, 자동 메모리 켜기/끄기, 자동 메모리 폴더 열기 링크를 볼 수 있고, 파일을 선택하면 에디터에서 열립니다.

## /memory로 보기 및 수정

- `/memory` 명령으로 현재 세션에 로드된 CLAUDE.md·규칙 파일 목록, 자동 메모리 온/오프 토글, 자동 메모리 폴더 열기 링크를 볼 수 있습니다. 
- 파일을 선택하면 에디터에서 엽니다.

"항상 pnpm 쓰고 npm 말고", "API 테스트는 로컬 Redis 필요하다고 기억해"처럼 기억해 달라고 하면 Claude가 자동 메모리에 저장합니다. CLAUDE.md에 넣고 싶으면 "이걸 CLAUDE.md에 추가해"라고 하거나 `/memory`에서 해당 파일을 직접 수정하면 됩니다.

## 문제 해결

- CLAUDE.md와 자동 메모리에서 자주 생기는 문제와 확인 방법입니다.

### CLAUDE.md를 따르지 않아요

- CLAUDE.md 내용은 시스템 프롬프트가 아니라 사용자 메시지 뒤에 전달됩니다. 
- Claude가 읽고 따르려 하지만, 모호하거나 서로 충돌하는 지시는 엄격히 지키지 않을 수 있습니다.

확인 순서:

- `/memory`로 CLAUDE.md가 로드되는지 확인하세요. 목록에 없으면 Claude가 볼 수 없습니다.
- 해당 CLAUDE.md가 [CLAUDE.md 위치](#claudemd를-둘-위치)에 맞게 세션에 로드되는 경로에 있는지 확인하세요.
- 지시를 더 구체적으로 쓰세요. "들여쓰기 2칸"이 "코드 예쁘게"보다 낫습니다.
- CLAUDE.md끼리 충돌하는 지시가 없는지 확인하세요. 같은 동작에 대해 서로 다른 지시가 있으면 아무거나 따를 수 있습니다.

시스템 프롬프트 수준으로 넣고 싶다면 [`--append-system-prompt`](/en/cli-reference#system-prompt-flags)를 쓰세요. 매번 호출할 때 넘겨야 하므로 스크립트·자동화에 적합하고 대화형 사용에는 덜 적합합니다.

:::tip[지시 로드 디버깅]
[InstructionsLoaded 훅](/en/hooks#instructionsloaded)으로 어떤 지시 파일이 언제, 왜 로드되는지 로그할 수 있습니다. 경로 한정 규칙이나 하위 디렉터리 지연 로드 디버깅에 유용합니다.
:::

### 자동 메모리에 뭐가 저장됐는지 모르겠어요

- `/memory`를 실행한 뒤 자동 메모리 폴더를 선택해 저장된 내용을 확인하세요. 
- 모두 일반 마크다운이라 읽고 수정·삭제할 수 있습니다.

### CLAUDE.md가 너무 커요

- 200줄을 넘으면 컨텍스트를 더 쓰고 준수도가 떨어질 수 있습니다. 
- [추가 파일 import](#추가-파일-import)로 상세 내용을 별도 파일로 옮기거나, [`.claude/rules/`](#clauderules로-규칙-구성)로 나누세요.

### /compact 후에 지시가 사라진 것 같아요

- CLAUDE.md는 compaction 후에도 그대로 유지됩니다. 
- `/compact` 후에는 Claude가 CLAUDE.md를 디스크에서 다시 읽어 세션에 새로 넣습니다. 
- compaction 후에 사라진 지시는 대화에서만 준 것이고 CLAUDE.md에 쓰이지 않은 것입니다. 
- 세션을 넘어 유지하려면 CLAUDE.md에 추가하세요.
- [효과적인 지시 작성](#효과적인-지시-작성)에서 분량, 구조, 구체성 가이드를 참고하세요.

## 관련 자료

- [스킬](/en/skills): 필요할 때만 로드되는 반복 워크플로 패키지
- [설정](/en/settings): 설정 파일로 Claude Code 동작 구성
- [세션 관리](/en/sessions): 컨텍스트 관리, 대화 재개, 병렬 세션
- [서브에이전트 메모리](/en/sub-agents#enable-persistent-memory): 서브에이전트가 자체 자동 메모리 유지
