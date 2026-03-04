---
title: "Skills"
description: "Claude Code에서 Skills를 사용하여 Claude의 기능을 확장하는 방법"
keywords: ["Claude", "Skills", "슬래시 명령", "커스텀 명령", "워크플로우"]
tags: ["Claude", "Skills", "Automation"]
hide_title: true
last_update:
  date: 2026-02-04
  author: youngthree
---

## 1. Skills 개요

- Skills는 Claude의 기능을 확장합니다.
- `SKILL.md` 파일에 지침을 작성하면 Claude가 이를 툴킷에 추가합니다.
- Claude가 관련성을 판단하여 자동으로 사용하거나, `/skill-name`으로 직접 호출할 수 있습니다.

:::note[Agent Skills 표준]

Claude Code Skills는 여러 AI 도구에서 작동하는 [Agent Skills](https://agentskills.io) 오픈 표준을 따릅니다.

:::

## 2. 시작하기

### 2.1 첫 번째 Skill 만들기

코드를 시각적 다이어그램과 비유로 설명하는 skill을 만들어봅니다.

**Skill 디렉토리 생성**

```bash
mkdir -p ~/.claude/skills/explain-code
```

**SKILL.md 작성**

`~/.claude/skills/explain-code/SKILL.md` 파일을 생성합니다.

```yaml
---
name: explain-code
description: 코드를 시각적 다이어그램과 비유로 설명합니다. 코드 동작 방식을 설명하거나 코드베이스를 가르치거나 "이게 어떻게 동작하나요?"라는 질문에 사용합니다.
---

코드를 설명할 때 항상 다음을 포함하세요:

1. **비유로 시작**: 코드를 일상생활의 무언가에 비유합니다.
2. **다이어그램 그리기**: ASCII 아트로 흐름, 구조, 관계를 보여줍니다.
3. **코드 살펴보기**: 단계별로 무슨 일이 일어나는지 설명합니다.
4. **함정 강조**: 흔한 실수나 오해는 무엇인가요?

설명을 대화체로 유지하세요. 복잡한 개념에는 여러 비유를 사용하세요.
```

**Skill 테스트**

두 가지 방법으로 테스트할 수 있습니다.

- Claude가 자동으로 호출하도록: "이 코드가 어떻게 동작하나요?"
- 직접 호출: `/explain-code src/auth/login.ts`

### 2.2 Skill이 저장되는 위치

Skill을 저장하는 위치에 따라 사용 범위가 결정됩니다.

| 위치 | 경로 | 적용 범위 |
|------|------|----------|
| Enterprise | 관리 설정 참조 | 조직의 모든 사용자 |
| Personal | `~/.claude/skills/<skill-name>/SKILL.md` | 모든 프로젝트 |
| Project | `.claude/skills/<skill-name>/SKILL.md` | 현재 프로젝트만 |
| Plugin | `<plugin>/skills/<skill-name>/SKILL.md` | 플러그인이 활성화된 곳 |

**우선순위**: Enterprise > Personal > Project

**디렉토리 구조**

```
my-skill/
├── SKILL.md           # 메인 지침 (필수)
├── template.md        # Claude가 채울 템플릿
├── examples/
│   └── sample.md      # 예상 형식을 보여주는 예제 출력
└── scripts/
    └── validate.sh    # Claude가 실행할 수 있는 스크립트
```

- SKILL.md는 필수 파일입니다.
- 나머지 파일은 선택사항입니다.

:::info[자동 탐색]

중첩된 디렉토리에서 작업할 때, Claude Code는 중첩된 `.claude/skills/` 디렉토리에서 자동으로 skills를 탐색합니다. 모노레포 설정에 유용합니다.

:::

## 3. Skill 구성

### 3.1 Frontmatter 참조

`SKILL.md` 상단의 YAML frontmatter로 skill 동작을 구성합니다.

```yaml
---
name: my-skill
description: 이 skill이 하는 일
disable-model-invocation: true
allowed-tools: Read, Grep
---

여기에 skill 지침 작성...
```

**주요 필드**

| 필드 | 필수 | 설명 |
|------|------|------|
| `name` | 아니오 | 표시 이름. 생략하면 디렉토리 이름 사용 (최대 64자) |
| `description` | 권장 | skill이 하는 일과 언제 사용하는지. Claude가 자동 로드 시점을 결정하는 데 사용 |
| `argument-hint` | 아니오 | 자동완성 시 표시되는 힌트 (예: `[issue-number]`) |
| `disable-model-invocation` | 아니오 | `true`로 설정하면 Claude가 자동 로드하지 않음. 수동으로만 호출 가능. 기본값: `false` |
| `user-invocable` | 아니오 | `false`로 설정하면 `/` 메뉴에서 숨김. 배경 지식용. 기본값: `true` |
| `allowed-tools` | 아니오 | skill 활성화 시 Claude가 권한 요청 없이 사용할 수 있는 도구 |
| `model` | 아니오 | skill 활성화 시 사용할 모델 |
| `context` | 아니오 | `fork`로 설정하면 subagent 컨텍스트에서 실행 |
| `agent` | 아니오 | `context: fork` 시 사용할 subagent 타입 |

**문자열 치환**

| 변수 | 설명 |
|------|------|
| `$ARGUMENTS` | skill 호출 시 전달된 모든 인자 |
| `$ARGUMENTS[N]` | N번째 인자 (0부터 시작) |
| `$N` | `$ARGUMENTS[N]`의 단축 표현 |
| `${CLAUDE_SESSION_ID}` | 현재 세션 ID |

**예시**

```yaml
---
name: session-logger
description: 이 세션의 활동을 기록
---

다음을 logs/${CLAUDE_SESSION_ID}.log에 기록:

$ARGUMENTS
```

### 3.2 Skill 콘텐츠 유형

**참조 콘텐츠**

Claude가 현재 작업에 적용할 지식을 추가합니다. 규칙, 패턴, 스타일 가이드, 도메인 지식 등입니다.

```yaml
---
name: api-conventions
description: 이 코드베이스의 API 디자인 패턴
---

API 엔드포인트 작성 시:
- RESTful 네이밍 규칙 사용
- 일관된 에러 형식 반환
- 요청 검증 포함
```

**작업 콘텐츠**

배포, 커밋, 코드 생성 같은 특정 작업에 대한 단계별 지침입니다. `disable-model-invocation: true`를 추가하여 수동 호출만 허용할 수 있습니다.

```yaml
---
name: deploy
description: 애플리케이션을 프로덕션에 배포
context: fork
disable-model-invocation: true
---

애플리케이션 배포:
1. 테스트 스위트 실행
2. 애플리케이션 빌드
3. 배포 대상에 푸시
```

### 3.3 지원 파일 추가

Skills는 디렉토리 내에 여러 파일을 포함할 수 있습니다. `SKILL.md`는 핵심만 담고, 상세한 참조 자료는 필요할 때만 Claude가 접근하도록 합니다.

```
my-skill/
├── SKILL.md (필수 - 개요 및 네비게이션)
├── reference.md (상세 API 문서 - 필요 시 로드)
├── examples.md (사용 예제 - 필요 시 로드)
└── scripts/
    └── helper.py (유틸리티 스크립트 - 실행됨, 로드 안 됨)
```

`SKILL.md`에서 지원 파일을 참조하여 Claude가 각 파일의 내용과 로드 시점을 알 수 있도록 합니다.

```markdown
## 추가 리소스

- 완전한 API 세부사항은 [reference.md](reference.md)를 참조하세요
- 사용 예제는 [examples.md](examples.md)를 참조하세요
```

:::tip[파일 크기 권장사항]

`SKILL.md`는 500줄 이하로 유지하세요. 상세한 참조 자료는 별도 파일로 분리하세요.

:::

### 3.4 호출 제어

기본적으로 사용자와 Claude 모두 skill을 호출할 수 있습니다. 두 개의 frontmatter 필드로 제한할 수 있습니다.

**`disable-model-invocation: true`**

사용자만 skill을 호출할 수 있습니다. 부작용이 있거나 타이밍을 제어하려는 워크플로우에 사용합니다.

```yaml
---
name: deploy
description: 애플리케이션을 프로덕션에 배포
disable-model-invocation: true
---

$ARGUMENTS를 프로덕션에 배포:

1. 테스트 스위트 실행
2. 애플리케이션 빌드
3. 배포 대상에 푸시
4. 배포 성공 확인
```

**`user-invocable: false`**

Claude만 skill을 호출할 수 있습니다. 사용자가 직접 호출할 의미가 없는 배경 지식에 사용합니다.

**호출 및 컨텍스트 로딩**

| Frontmatter | 사용자 호출 | Claude 호출 | 컨텍스트 로드 시점 |
|-------------|------------|-------------|------------------|
| (기본값) | 예 | 예 | 설명은 항상, 전체 skill은 호출 시 |
| `disable-model-invocation: true` | 예 | 아니오 | 설명은 컨텍스트에 없음, 전체 skill은 사용자 호출 시 |
| `user-invocable: false` | 아니오 | 예 | 설명은 항상, 전체 skill은 호출 시 |

### 3.5 도구 접근 제한

`allowed-tools` 필드로 skill 활성화 시 Claude가 사용할 수 있는 도구를 제한합니다.

```yaml
---
name: safe-reader
description: 변경 없이 파일 읽기
allowed-tools: Read, Grep, Glob
---
```

### 3.6 인자 전달

사용자와 Claude 모두 skill 호출 시 인자를 전달할 수 있습니다. `$ARGUMENTS` 플레이스홀더로 사용 가능합니다.

**전체 인자 사용**

```yaml
---
name: fix-issue
description: GitHub 이슈 수정
disable-model-invocation: true
---

코딩 표준에 따라 GitHub 이슈 $ARGUMENTS를 수정하세요.

1. 이슈 설명 읽기
2. 요구사항 이해
3. 수정 구현
4. 테스트 작성
5. 커밋 생성
```

`/fix-issue 123`을 실행하면 "코딩 표준에 따라 GitHub 이슈 123을 수정하세요..."를 받습니다.

**개별 인자 접근**

```yaml
---
name: migrate-component
description: 컴포넌트를 한 프레임워크에서 다른 프레임워크로 마이그레이션
---

$0 컴포넌트를 $1에서 $2로 마이그레이션하세요.
모든 기존 동작과 테스트를 보존하세요.
```

`/migrate-component SearchBar React Vue`를 실행하면:
- `$0` = `SearchBar`
- `$1` = `React`
- `$2` = `Vue`

## 4. 고급 패턴

### 4.1 동적 컨텍스트 주입

`` !`command` `` 구문은 skill 콘텐츠가 Claude에게 전송되기 전에 셸 명령을 실행합니다. 명령 출력이 플레이스홀더를 대체하므로 Claude는 명령이 아닌 실제 데이터를 받습니다.

```yaml
---
name: pr-summary
description: Pull Request의 변경사항 요약
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request 컨텍스트
- PR diff: !`gh pr diff`
- PR 코멘트: !`gh pr view --comments`
- 변경된 파일: !`gh pr diff --name-only`

## 작업
이 pull request를 요약하세요...
```

실행 순서:

1. 각 `` !`command` ``가 즉시 실행됩니다 (Claude가 보기 전)
2. 출력이 skill 콘텐츠의 플레이스홀더를 대체합니다
3. Claude는 실제 PR 데이터가 포함된 완전히 렌더링된 프롬프트를 받습니다

:::tip[Extended Thinking]

skill에서 [extended thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking)을 활성화하려면 skill 콘텐츠 어디에나 "ultrathink"라는 단어를 포함하세요.

:::

### 4.2 Subagent에서 Skill 실행

- frontmatter에 `context: fork`를 추가하면 skill이 격리된 환경에서 실행됩니다. 
- skill 콘텐츠가 subagent를 구동하는 프롬프트가 됩니다.

:::warning[명시적 지침 필요]

`context: fork`는 명시적 지침이 있는 skills에만 적합합니다. "이러한 API 규칙 사용"과 같은 가이드라인만 있고 작업이 없으면 subagent가 가이드라인을 받지만 실행 가능한 프롬프트가 없어 의미 있는 출력 없이 반환됩니다.

:::

**Skills와 Subagents의 관계**

| 접근 방식 | 시스템 프롬프트 | 작업 | 추가 로드 |
|-----------|----------------|------|-----------|
| `context: fork`가 있는 Skill | 에이전트 타입에서 (`Explore`, `Plan` 등) | SKILL.md 콘텐츠 | CLAUDE.md |
| `skills` 필드가 있는 Subagent | Subagent의 마크다운 본문 | Claude의 위임 메시지 | 사전 로드된 skills + CLAUDE.md |

**예시: Explore 에이전트를 사용한 연구 Skill**

```yaml
---
name: deep-research
description: 주제를 철저히 연구
context: fork
agent: Explore
---

$ARGUMENTS를 철저히 연구하세요:

1. Glob과 Grep을 사용하여 관련 파일 찾기
2. 코드 읽기 및 분석
3. 특정 파일 참조와 함께 결과 요약
```

실행 순서:

1. 새로운 격리된 컨텍스트 생성
2. Subagent가 skill 콘텐츠를 프롬프트로 받습니다
3. `agent` 필드가 실행 환경(모델, 도구, 권한)을 결정합니다
4. 결과가 요약되어 메인 대화로 반환됩니다

**에이전트 타입**

- `agent` 필드는 사용할 subagent 구성을 지정합니다
- 옵션: `Explore`, `Plan`, `general-purpose` 또는 `.claude/agents/`의 커스텀 subagent
- 생략하면 `general-purpose` 사용

### 4.3 Claude의 Skill 접근 제한

기본적으로 Claude는 `disable-model-invocation: true`가 설정되지 않은 모든 skill을 호출할 수 있습니다.

**모든 skills 비활성화**

`/permissions`에서 Skill 도구를 거부합니다.

```
# 거부 규칙에 추가:
Skill
```

**특정 skills 허용/거부**

```
# 특정 skills만 허용
Skill(commit)
Skill(review-pr *)

# 특정 skills 거부
Skill(deploy *)
```

권한 구문: 정확한 매치는 `Skill(name)`, 접두사 매치는 `Skill(name *)`

**개별 skills 숨기기**

frontmatter에 `disable-model-invocation: true` 추가하면 Claude의 컨텍스트에서 완전히 제거됩니다.

:::note[user-invocable vs disable-model-invocation]

`user-invocable` 필드는 메뉴 표시만 제어하며, Skill 도구 접근은 제어하지 않습니다. 프로그래밍 방식 호출을 차단하려면 `disable-model-invocation: true`를 사용하세요.

:::

## 5. Skill 공유

Skills는 대상에 따라 다양한 범위로 배포할 수 있습니다.

- **프로젝트 skills**: `.claude/skills/`를 버전 관리에 커밋
- **플러그인**: 플러그인에 `skills/` 디렉토리 생성
- **관리형**: 관리 설정을 통해 조직 전체에 배포

### 5.1 시각적 출력 생성

Skills는 모든 언어로 스크립트를 번들링하고 실행할 수 있어, 단일 프롬프트로는 불가능한 기능을 Claude에게 제공합니다. 강력한 패턴 중 하나는 시각적 출력 생성입니다. 데이터 탐색, 디버깅, 보고서 생성을 위해 브라우저에서 여는 인터랙티브 HTML 파일입니다.

**예시: 코드베이스 탐색기**

디렉토리를 확장/축소할 수 있고, 파일 크기를 한눈에 볼 수 있으며, 색상으로 파일 유형을 식별하는 인터랙티브 트리 뷰입니다.

Skill 디렉토리 생성:

```bash
mkdir -p ~/.claude/skills/codebase-visualizer/scripts
```

`~/.claude/skills/codebase-visualizer/SKILL.md` 생성:

```yaml
---
name: codebase-visualizer
description: 코드베이스의 인터랙티브 축소 가능한 트리 시각화를 생성합니다. 새 저장소 탐색, 프로젝트 구조 이해, 큰 파일 식별 시 사용합니다.
allowed-tools: Bash(python *)
---

# 코드베이스 시각화

프로젝트의 파일 구조를 축소 가능한 디렉토리로 보여주는 인터랙티브 HTML 트리 뷰를 생성합니다.

## 사용법

프로젝트 루트에서 시각화 스크립트 실행:

\`\`\`bash
python ~/.claude/skills/codebase-visualizer/scripts/visualize.py .
\`\`\`

현재 디렉토리에 `codebase-map.html`을 생성하고 기본 브라우저에서 엽니다.

## 시각화 내용

- **축소 가능한 디렉토리**: 폴더를 클릭하여 확장/축소
- **파일 크기**: 각 파일 옆에 표시
- **색상**: 파일 유형별로 다른 색상
- **디렉토리 총합**: 각 폴더의 집계 크기 표시
```

이 패턴은 모든 시각적 출력에 작동합니다: 의존성 그래프, 테스트 커버리지 보고서, API 문서, 데이터베이스 스키마 시각화 등.

## 6. 문제 해결

### 6.1 Skill이 트리거되지 않음

Claude가 예상할 때 skill을 사용하지 않는 경우:

1. description에 사용자가 자연스럽게 말할 키워드가 포함되어 있는지 확인
2. `What skills are available?`에서 skill이 표시되는지 확인
3. description과 더 일치하도록 요청을 다시 표현
4. skill이 user-invocable이면 `/skill-name`으로 직접 호출

### 6.2 Skill이 너무 자주 트리거됨

Claude가 원하지 않을 때 skill을 사용하는 경우:

1. description을 더 구체적으로 작성
2. 수동 호출만 원하면 `disable-model-invocation: true` 추가

### 6.3 Claude가 모든 skills를 보지 못함

Skill descriptions가 컨텍스트에 로드되어 Claude가 사용 가능한 것을 알 수 있습니다. skills가 많으면 문자 예산을 초과할 수 있습니다. 예산은 컨텍스트 윈도우의 2%로 동적으로 확장되며, 대체 값은 16,000자입니다.

`/context`를 실행하여 제외된 skills에 대한 경고를 확인하세요.

제한을 재정의하려면 `SLASH_COMMAND_TOOL_CHAR_BUDGET` 환경 변수를 설정하세요.

## 7. 관련 리소스

- [Subagents](https://code.claude.com/docs/en/sub-agents): 전문화된 에이전트에 작업 위임
- [Plugins](https://code.claude.com/docs/en/plugins): skills를 다른 확장과 함께 패키징 및 배포
- [Hooks](https://code.claude.com/docs/en/hooks): 도구 이벤트 주변의 워크플로우 자동화
- [Memory](https://code.claude.com/docs/en/memory): 지속적인 컨텍스트를 위한 CLAUDE.md 파일 관리
- [Interactive mode](https://code.claude.com/docs/en/interactive-mode): 내장 명령 및 단축키
- [Permissions](https://code.claude.com/docs/en/permissions): 도구 및 skill 접근 제어
