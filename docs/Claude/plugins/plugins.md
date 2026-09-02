---
title: "플러그인 만들기"
description: "스킬, 에이전트, 훅, MCP 서버로 Claude Code를 확장하는 커스텀 플러그인을 만드는 방법을 다룹니다. 단독 설정과 플러그인 선택 기준, 퀵스타트, 구조 개요, 고급 개발, 기존 설정 마이그레이션까지 정리합니다."
tags: [ "CLAUDE", "PLUGINS", "EXTENSION", "SKILLS", "MCP" ]
keywords: [ "플러그인", "Claude Code", "plugins", "Skills", "에이전트", "훅", "hooks", "MCP", "마켓플레이스" ]
draft: false
hide_title: true
---

## 1. 플러그인 vs 단독 설정

- Claude Code에서 커스텀 스킬, 에이전트, 훅을 넣는 방법은 단독 설정(`.claude/`)과 플러그인 두 가지입니다.
- 단독 설정은 한 프로젝트·개인용, 플러그인은 팀·커뮤니티 공유와 버전 관리·마켓플레이스 배포에 적합합니다.

| 방식 | 스킬 이름 예 | 적합한 경우 |
| :--- | :--- | :--- |
| **단독 설정** (`.claude/` 디렉터리) | `/hello` | 개인 워크플로, 프로젝트 전용 커스터마이징, 빠른 실험 |
| **플러그인** (`.claude-plugin/plugin.json`이 있는 디렉터리) | `/plugin-name:hello` | 팀·커뮤니티와 공유, 버전 관리된 배포, 여러 프로젝트에서 재사용 |

#### 단독 설정을 쓸 때

- 한 프로젝트만 위한 커스터마이징
- 공유할 필요 없는 개인 설정
- 패키징 전 스킬·훅 실험
- `/hello`, `/deploy`처럼 짧은 스킬 이름을 쓸 때

#### 플러그인을 쓸 때

- 팀이나 커뮤니티와 기능 공유
- 여러 프로젝트에서 같은 스킬·에이전트 사용
- 버전 관리와 쉬운 업데이트가 필요한 확장
- 마켓플레이스를 통한 배포
- 스킬 이름에 네임스페이스가 붙어도 괜찮을 때 (플러그인 간 이름 충돌 방지)

:::tip[실험 → 공유 순서]

먼저 `.claude/`에서 단독 설정으로 빠르게 반복하고, 공유할 준비가 되면 [기존 설정을 플러그인으로 변환](#5-기존-설정을-플러그인으로-변환하기)하세요.

:::

## 2. 퀵스타트

- 플러그인에 대해서 알아보기 위해 직접 플러그인을 만들어 보겠습니다.
- 커스텀 스킬이 있는 플러그인을 만듭니다. 
- 매니페스트 작성, 스킬 추가, `--plugin-dir`로 로컬 테스트까지 진행합니다.

### 2.1 사전 요구사항

- Claude Code [설치 및 인증](https://code.claude.com/docs/en/quickstart#step-1-install-claude-code) 완료
- Claude Code 1.0.33 이상 (`claude --version`으로 확인)

:::note[/plugin 명령이 안 보일 때]

`/plugin` 명령이 보이지 않으면 Claude Code를 최신 버전으로 업데이트하세요. [Troubleshooting](https://code.claude.com/docs/en/troubleshooting)에서 업그레이드 방법을 확인할 수 있습니다.

:::

### 2.2 첫 번째 플러그인 만들기

#### 플러그인 디렉터리 만들기

- 플러그인은 각각 자신의 디렉터리에 두고, 그 안에 매니페스트와 스킬·에이전트·훅을 넣습니다.

```bash
mkdir my-first-plugin
```

#### 플러그인 매니페스트 만들기

- `.claude-plugin/plugin.json`이 플러그인 식별 정보(이름, 설명, 버전)를 정의합니다.
- Claude Code는 이 메타데이터로 플러그인 매니저에 표시합니다. 
- 플러그인 폴더 안에 `.claude-plugin` 디렉터리를 만들고, 그 안에 `plugin.json`을 둡니다.

```bash
mkdir my-first-plugin/.claude-plugin
```

`my-first-plugin/.claude-plugin/plugin.json`을 아래 내용으로 만듭니다.

```json
{
  "name": "my-first-plugin",
  "description": "기초를 익히기 위한 인사 플러그인",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  }
}
```

| 필드 | 용도 |
| :--- | :--- |
| `name` | 고유 식별자이자 스킬 네임스페이스. 스킬은 이 이름으로 접두사가 붙음 (예: `/my-first-plugin:hello`) |
| `description` | 플러그인 찾기·설치 시 플러그인 매니저에 표시됨 |
| `version` | [시맨틱 버저닝](https://code.claude.com/docs/en/plugins-reference#version-management)으로 릴리스 관리 |
| `author` | 선택. 출처 표시용 |

- `homepage`, `repository`, `license` 등 추가 필드는 [매니페스트 스키마 전체](https://code.claude.com/docs/en/plugins-reference#plugin-manifest-schema)를 참고하세요.

#### 스킬 추가하기

- 스킬은 `skills/` 디렉터리에 둡니다.
- 스킬 하나 = `SKILL.md`를 포함한 폴더 하나이며, 폴더 이름이 스킬 이름이 되고 플러그인 네임스페이스가 접두사로 붙습니다 (`my-first-plugin` 안의 `hello/` → `/my-first-plugin:hello`).

```bash
mkdir -p my-first-plugin/skills/hello
```

`my-first-plugin/skills/hello/SKILL.md`를 아래 내용으로 만듭니다.

```markdown
---
description: 친절한 메시지로 사용자에게 인사
disable-model-invocation: true
---

사용자에게 따뜻하게 인사하고, 오늘 무엇을 도와드릴지 물어보세요.
```

#### 플러그인 테스트하기

- `--plugin-dir` 플래그로 플러그인을 로드해 Claude Code를 실행합니다.

```bash
claude --plugin-dir ./my-first-plugin
```

실행된 뒤 새 스킬을 사용해 봅니다.

```shell
/my-first-plugin:hello
```

Claude가 인사로 응답합니다. `/help`를 실행하면 플러그인 네임스페이스 아래에 해당 스킬이 나옵니다.

:::note[네임스페이스를 쓰는 이유]

플러그인 스킬은 항상 네임스페이스가 붙습니다 (예: `/greet:hello`). 여러 플러그인에 같은 이름의 스킬이 있어도 충돌하지 않습니다. 접두사를 바꾸려면 `plugin.json`의 `name` 필드를 수정하면 됩니다.

:::

#### 스킬에 인자 추가하기

- 사용자 입력을 받으려면 `$ARGUMENTS` 플레이스홀더를 사용합니다.
- 스킬 이름 뒤에 사용자가 입력한 텍스트가 여기로 들어갑니다.

`SKILL.md`를 다음처럼 수정합니다.

```markdown
---
description: 이름을 넣어 맞춤 인사
---

# Hello 스킬

"$ARGUMENTS"라는 이름의 사용자에게 따뜻하게 인사하고, 오늘 무엇을 도와드릴지 물어보세요. 인사는 개인적이고 격려가 되도록 하세요.
```

변경 사항을 반영하려면 `/reload-plugins`를 실행한 뒤, 이름을 넣어 스킬을 호출해 봅니다.

```shell
/my-first-plugin:hello Alex
```

- Claude가 이름을 넣어 인사합니다. 
- 스킬에 인자 넘기는 방법은 [Skills](https://code.claude.com/docs/en/skills#pass-arguments-to-skills)를 참고하세요.

#### 퀵스타트 결과

- **플러그인 매니페스트** (`.claude-plugin/plugin.json`): 플러그인 메타데이터
- **스킬 디렉터리** (`skills/`): 커스텀 스킬
- **스킬 인자** (`$ARGUMENTS`): 동적 동작을 위한 사용자 입력

:::tip[--plugin-dir 활용]

`--plugin-dir`은 개발·테스트에 유용합니다. 다른 사람과 공유할 준비가 되면 [플러그인 마켓플레이스 만들기 및 배포](https://code.claude.com/docs/en/plugin-marketplaces)를 참고하세요.

:::

## 3. 플러그인 구조 개요

- 스킬만 넣은 플러그인을 만들었지만, 플러그인에는 커스텀 에이전트, 훅, MCP 서버, LSP 서버 등 더 넣을 수 있습니다.

:::warning[흔한 실수]

`commands/`, `agents/`, `skills/`, `hooks/`를 `.claude-plugin/` **안**에 두지 마세요. `.claude-plugin/` 안에는 `plugin.json`만 둡니다. 나머지 디렉터리는 모두 플러그인 **루트**에 둡니다.

:::

| 디렉터리/파일 | 위치 | 용도 |
| :--- | :--- | :--- |
| `.claude-plugin/` | 플러그인 루트 | `plugin.json` 매니페스트 (구성 요소가 기본 위치를 쓰면 선택적) |
| `commands/` | 플러그인 루트 | 마크다운 파일로 된 슬래시 명령 |
| `agents/` | 플러그인 루트 | 커스텀 에이전트 정의 |
| `skills/` | 플러그인 루트 | `SKILL.md`가 있는 Agent Skills |
| `hooks/` | 플러그인 루트 | `hooks.json`으로 이벤트 핸들러 |
| `.mcp.json` | 플러그인 루트 | MCP 서버 설정 |
| `.lsp.json` | 플러그인 루트 | 코드 인텔리전스용 LSP 서버 설정 |
| `settings.json` | 플러그인 루트 | 플러그인 활성화 시 적용되는 기본 [설정](https://code.claude.com/docs/en/settings) |

:::note[다음 단계]

에이전트, 훅, MCP 서버, LSP 서버를 더 넣고 싶다면 [더 복잡한 플러그인 개발](#4-더-복잡한-플러그인-개발)로 넘어가세요. 기술 명세 전체는 [Plugins reference](https://code.claude.com/docs/en/plugins-reference)를 참고하세요.

:::

## 4. 더 복잡한 플러그인 개발

- 기본 플러그인에 익숙해졌다면, 더 정교한 확장을 만들 수 있습니다.

### 4.1 플러그인에 스킬 추가하기

- 플러그인에는 [Agent Skills](https://code.claude.com/docs/en/skills)를 넣어 Claude 능력을 확장할 수 있습니다.
- 스킬은 모델이 호출하며, 작업 맥락에 따라 Claude가 자동으로 사용합니다.
- 플러그인 루트에 `skills/` 디렉터리를 만들고, `SKILL.md`가 들어 있는 스킬 폴더를 추가합니다.

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── code-review/
        └── SKILL.md
```

- 각 `SKILL.md`에는 `name`, `description` 필드가 있는 프론트매터와 그다음 지침이 필요합니다.

```yaml
---
name: code-review
description: 모범 사례와 잠재적 이슈를 위해 코드를 검토합니다. 코드 리뷰, PR 확인, 코드 품질 분석 시 사용합니다.
---

코드 검토 시 다음을 확인하세요:
1. 코드 구조와 조직
2. 에러 처리
3. 보안 이슈
4. 테스트 커버리지
```

- 플러그인 설치 후 `/reload-plugins`를 실행하면 스킬이 로드됩니다. 
- 점진적 공개, 도구 제한 등은 [Agent Skills](https://code.claude.com/docs/en/skills)를 참고하세요.

### 4.2 플러그인에 LSP 서버 추가하기

:::tip[일반 언어는 공식 플러그인 사용]

TypeScript, Python, Rust처럼 흔한 언어는 공식 마켓플레이스의 미리 만든 LSP 플러그인을 설치하세요. 공식으로 지원하지 않는 언어를 쓸 때만 커스텀 LSP 플러그인을 만드세요.

:::

- LSP(Language Server Protocol) 플러그인은 Claude에 실시간 코드 인텔리전스를 제공합니다.
- 공식 LSP 플러그인이 없는 언어를 지원하려면 플러그인 루트에 `.lsp.json`을 추가해 직접 만들 수 있습니다.

```json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": {
      ".go": "go"
    }
  }
}
```

- 플러그인을 설치하는 사용자는 해당 언어 서버 바이너리를 본인 머신에 설치해 두어야 합니다.
- LSP 설정 옵션 전체는 [LSP servers](https://code.claude.com/docs/en/plugins-reference#lsp-servers)를 참고하세요.

### 4.3 플러그인과 함께 기본 설정 배포하기

- 플러그인 루트에 `settings.json`을 두면, 플러그인 활성화 시 적용할 기본 구성을 넣을 수 있습니다. 
- 현재는 `agent` 키만 지원합니다.
- `agent`를 설정하면 플러그인의 [커스텀 에이전트](https://code.claude.com/docs/en/sub-agents) 중 하나가 메인 스레드로 활성화되고, 그 에이전트의 시스템 프롬프트, 도구 제한, 모델이 적용됩니다.
- 플러그인으로 Claude Code의 기본 동작을 바꿀 수 있습니다.

```json
{
  "agent": "security-reviewer"
}
```

- 이 예는 플러그인 `agents/`에 정의된 `security-reviewer` 에이전트를 활성화합니다. 
- `settings.json`의 설정이 `plugin.json`의 `settings`보다 우선하며, 알 수 없는 키는 무시됩니다.

#### 복잡한 플러그인 구성하기

- 구성 요소가 많으면 기능별로 디렉터리를 나눕니다.
- [Plugin directory structure](https://code.claude.com/docs/en/plugins-reference#plugin-directory-structure)에서 레이아웃과 패턴을 참고하세요.

#### 로컬에서 플러그인 테스트하기

- 개발 중에는 `--plugin-dir` 플래그로 플러그인을 테스트합니다. 
- 설치 없이 해당 디렉터리의 플러그인을 직접 로드합니다.
- `--plugin-dir`으로 준 플러그인 이름이 이미 설치된 마켓플레이스 플러그인과 같으면, 그 세션에서는 로컬 복사본이 우선합니다.

```bash
claude --plugin-dir ./my-plugin
```

- 이미 설치된 플러그인을 수정해서 테스트할 때 유용합니다. 
- 관리형 설정으로 강제 활성화된 마켓플레이스 플러그인만 이 방식으로 덮어쓸 수 없습니다.
- 플러그인을 수정한 뒤 `/reload-plugins`를 실행하면 재시작 없이 반영됩니다. 
- 명령, 스킬, 에이전트, 훅, MCP·LSP 서버가 다시 로드됩니다.

#### 확인할 항목

- `/plugin-name:skill-name`으로 스킬 실행
- `/agents`에 에이전트가 보이는지 확인
- 훅이 기대대로 동작하는지 확인

:::tip[여러 플러그인 동시 로드]

플래그를 여러 번 써서 한 번에 여러 플러그인을 로드할 수 있습니다.

```bash
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```
:::

#### 플러그인 문제 디버깅하기

1. **구조 확인**: 디렉터리가 플러그인 루트에 있는지, `.claude-plugin/` 안에 있지 않은지 확인
2. **구성 요소별 테스트**: 명령, 에이전트, 훅을 각각 테스트
3. **검증·디버깅 도구**: [Debugging and development tools](https://code.claude.com/docs/en/plugins-reference#debugging-and-development-tools)에서 CLI와 문제 해결 방법 참고

#### 플러그인 공유하기

- 설치·사용법을 담은 `README.md` 포함
- `plugin.json`에서 [시맨틱 버저닝](https://code.claude.com/docs/en/plugins-reference#version-management) 사용
- [플러그인 마켓플레이스](https://code.claude.com/docs/en/plugin-marketplaces)를 통해 배포
- 넓게 배포하기 전에 팀원이 플러그인을 써 보도록 함
- 마켓플레이스에 올리면 [플러그인 발견 및 설치](https://code.claude.com/docs/en/discover-plugins) 안내대로 다른 사용자가 설치할 수 있습니다

#### 공식 마켓플레이스 제출

- **Claude.ai**: [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit)
- **Console**: [platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit)

:::note[기술 명세·디버깅·배포]

기술 명세 전체, 디버깅 방법, 배포 전략은 [Plugins reference](https://code.claude.com/docs/en/plugins-reference)를 참고하세요.

:::

## 5. 기존 설정을 플러그인으로 변환하기

- 이미 `.claude/`에 스킬이나 훅이 있다면, 공유와 배포를 위해 플러그인으로 옮길 수 있습니다.

### 5.1 마이그레이션 단계

1. **플러그인 구조 만들기**
   - 새 플러그인 디렉터리를 만듭니다.
   - 매니페스트 파일 `my-plugin/.claude-plugin/plugin.json`을 만듭니다.

```bash
mkdir -p my-plugin/.claude-plugin
```

```json
{
  "name": "my-plugin",
  "description": "단독 설정에서 옮긴 플러그인",
  "version": "1.0.0"
}
```

2. **기존 파일 복사하기**
   - 기존 설정을 플러그인 디렉터리로 복사합니다.

```bash
# 명령 복사
cp -r .claude/commands my-plugin/

# 에이전트 복사 (있는 경우)
cp -r .claude/agents my-plugin/

# 스킬 복사 (있는 경우)
cp -r .claude/skills my-plugin/
```

3. **훅 마이그레이션하기**
   - 설정에 훅이 있다면 훅 디렉터리를 만듭니다.
   - `my-plugin/hooks/hooks.json`을 만들고 `.claude/settings.json` 또는 `settings.local.json`의 `hooks` 객체를 그대로 복사합니다. 훅 명령은 stdin으로 JSON을 받으므로, 파일 경로를 쓰려면 `jq`로 추출할 수 있습니다.

```bash
mkdir my-plugin/hooks
```

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npm run lint:fix" }]
      }
    ]
  }
}
```

4. **마이그레이션한 플러그인 테스트하기**
   - 플러그인을 로드해 모든 구성 요소가 동작하는지 확인합니다.

```bash
claude --plugin-dir ./my-plugin
```

   - 명령 실행, `/agents`에 에이전트 표시, 훅 발동을 각각 확인합니다.

### 5.2 마이그레이션 시 바뀌는 것

| 단독 설정 (`.claude/`) | 플러그인 |
| :--- | :--- |
| 한 프로젝트에서만 사용 | 마켓플레이스로 공유 가능 |
| `.claude/commands/`에 파일 | `plugin-name/commands/`에 파일 |
| `settings.json`에 훅 | `hooks/hooks.json`에 훅 |
| 공유 시 수동 복사 | `/plugin install`로 설치 |

:::note[중복 제거]
마이그레이션 후 `.claude/`에 있던 원본 파일은 제거해도 됩니다. 로드 시 플러그인 버전이 우선합니다.
:::

## 6. 다음 단계

- Claude Code 플러그인 구조를 파악했다면, 목적에 맞는 경로를 선택하면 됩니다.

### 6.1 플러그인 사용자

- [플러그인 발견 및 설치](https://code.claude.com/docs/en/discover-plugins): 마켓플레이스 탐색 및 플러그인 설치
- [팀 마켓플레이스 구성](https://code.claude.com/docs/en/discover-plugins#configure-team-marketplaces): 팀용 저장소 단위 플러그인 설정

### 6.2 플러그인 개발자

- [마켓플레이스 만들기 및 배포](https://code.claude.com/docs/en/plugin-marketplaces): 플러그인 패키징 및 공유
- [Plugins reference](https://code.claude.com/docs/en/plugins-reference): 기술 명세 전체
- 구성 요소별 상세 문서:
  - [Skills](https://code.claude.com/docs/en/skills): 스킬 개발
  - [Subagents](https://code.claude.com/docs/en/sub-agents): 에이전트 설정과 기능
  - [Hooks](https://code.claude.com/docs/en/hooks): 이벤트 처리와 자동화
  - [MCP](https://code.claude.com/docs/en/mcp): 외부 도구 연동

---

출처: [Create plugins](https://code.claude.com/docs/en/plugins)
