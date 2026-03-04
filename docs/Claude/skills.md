# Skills로 Claude 확장하기

> Claude Code에서 Claude의 기능을 확장하는 skills를 생성, 관리, 공유합니다. 커스텀 슬래시 명령어를 포함합니다.

Skills는 Claude가 할 수 있는 것을 확장합니다. `SKILL.md` 파일에 지시사항을 작성하면, Claude가 이를 자신의 툴킷에 추가합니다. Claude는 관련이 있을 때 skills를 사용하거나, `/skill-name`으로 직접 호출할 수도 있습니다.

> **참고**: `/help`나 `/compact` 같은 내장 명령어는 interactive mode를 참조하세요.

> **커스텀 슬래시 명령어가 skills로 통합되었습니다.** `.claude/commands/review.md` 파일과 `.claude/skills/review/SKILL.md`의 skill 모두 `/review`를 생성하며 동일하게 동작합니다. 기존 `.claude/commands/` 파일들은 계속 작동합니다. Skills는 추가 기능을 제공합니다: 지원 파일을 위한 디렉토리, 사용자 또는 Claude가 호출할지를 제어하는 frontmatter, 그리고 관련이 있을 때 Claude가 자동으로 로드하는 기능.

Claude Code skills는 여러 AI 도구에서 작동하는 [Agent Skills](https://agentskills.io) 오픈 표준을 따릅니다. Claude Code는 이 표준을 호출 제어(invocation control), 서브에이전트 실행(subagent execution), 동적 컨텍스트 주입(dynamic context injection) 같은 추가 기능으로 확장합니다.

> **역주:**
> - **Plugin**: Claude Code의 확장 기능(skills, hooks, CLAUDE.md 등)을 하나로 패키징해서 다른 프로젝트나 팀과 공유할 수 있는 배포 단위입니다.
> - **Command**: skills 이전에 사용하던 커스텀 슬래시 명령어 방식입니다. `.claude/commands/` 폴더에 `.md` 파일로 저장합니다. 현재는 skills로 통합되었지만, 기존 command 파일도 계속 작동합니다.

---

## 시작하기

### 첫 번째 skill 만들기

이 예제는 시각적 다이어그램과 비유를 사용해 코드를 설명하도록 Claude를 가르치는 skill을 만듭니다. 기본 frontmatter를 사용하므로, 무언가가 어떻게 동작하는지 물어볼 때 Claude가 자동으로 로드하거나, `/explain-code`로 직접 호출할 수 있습니다.

**1단계: skill 디렉토리 만들기**

개인 skills 폴더에 skill을 위한 디렉토리를 만듭니다. 개인 skills는 모든 프로젝트에서 사용할 수 있습니다.

```bash
mkdir -p ~/.claude/skills/explain-code
```

**2단계: SKILL.md 작성하기**

모든 skill에는 두 부분으로 구성된 `SKILL.md` 파일이 필요합니다: Claude가 언제 skill을 사용할지 알려주는 YAML frontmatter(`---` 마커 사이)와, skill이 호출될 때 Claude가 따르는 지시사항이 담긴 markdown 콘텐츠. `name` 필드는 `/슬래시-명령어`가 되고, `description`은 Claude가 해당 skill을 언제 자동으로 로드할지 결정하는 데 도움을 줍니다.

`~/.claude/skills/explain-code/SKILL.md` 파일을 만듭니다:

```yaml
---
name: explain-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
---

When explaining code, always include:

1. **Start with an analogy**: Compare the code to something from everyday life
2. **Draw a diagram**: Use ASCII art to show the flow, structure, or relationships
3. **Walk through the code**: Explain step-by-step what happens
4. **Highlight a gotcha**: What's a common mistake or misconception?

Keep explanations conversational. For complex concepts, use multiple analogies.
```

**3단계: skill 테스트하기**

두 가지 방법으로 테스트할 수 있습니다:

**Claude가 자동으로 호출하도록** description과 일치하는 질문을 합니다:
```
How does this code work?
```

**또는 직접 호출합니다** skill 이름으로:
```
/explain-code src/auth/login.ts
```

어느 쪽이든, Claude는 설명에 비유와 ASCII 다이어그램을 포함해야 합니다.

---

### skill 저장 위치

skill을 어디에 저장하느냐에 따라 누가 사용할 수 있는지가 결정됩니다:

| 위치       | 경로                                                      | 적용 범위                      |
| :--------- | :-------------------------------------------------------- | :----------------------------- |
| Enterprise | managed settings 참조                                      | 조직 내 모든 사용자            |
| Personal   | `~/.claude/skills/<skill-name>/SKILL.md`                  | 내 모든 프로젝트               |
| Project    | `.claude/skills/<skill-name>/SKILL.md`                    | 해당 프로젝트만                |
| Plugin     | `<plugin>/skills/<skill-name>/SKILL.md`                   | 플러그인이 활성화된 곳         |

여러 레벨에서 같은 이름의 skill이 있으면, 높은 우선순위의 위치가 우선합니다: enterprise > personal > project. Plugin skills는 `plugin-name:skill-name` 네임스페이스를 사용하므로, 다른 레벨과 충돌하지 않습니다. `.claude/commands/`에 파일이 있다면 동일하게 동작하지만, skill과 command가 같은 이름이면 skill이 우선합니다.

#### 중첩 디렉토리 자동 탐색

하위 디렉토리의 파일을 작업할 때, Claude Code는 중첩된 `.claude/skills/` 디렉토리에서 skills를 자동으로 탐색합니다. 예를 들어, `packages/frontend/`에서 파일을 편집하고 있다면, Claude Code는 `packages/frontend/.claude/skills/`에서도 skills를 찾습니다. 이는 패키지별로 고유한 skills를 가진 모노레포 구성을 지원합니다.

각 skill은 `SKILL.md`를 진입점으로 하는 디렉토리입니다:

```
my-skill/
├── SKILL.md           # 메인 지시사항 (필수)
├── template.md        # Claude가 출력할 때 참고하는 양식
├── examples/
│   └── sample.md      # 예상 형식을 보여주는 예제 출력
└── scripts/
    └── validate.sh    # Claude가 실행할 수 있는 스크립트
```

`SKILL.md`는 메인 지시사항을 담고 있으며 필수입니다. 나머지 파일들은 선택 사항이며, 더 강력한 skills를 만들 수 있게 해줍니다:

- `template.md` - Claude가 출력할 때 참고하는 양식
- `examples/` - 원하는 출력 형식의 예제
- `scripts/` - Claude가 실행할 수 있는 스크립트
- 기타 상세한 레퍼런스 문서

`SKILL.md`에서 이 파일들을 언급해두면, Claude가 각 파일의 용도와 언제 참조해야 하는지 파악할 수 있습니다.

#### 추가 디렉토리의 skills

`--add-dir`로 추가된 디렉토리 내의 `.claude/skills/`에 정의된 skills는 자동으로 로드되고, 실시간 변경 감지가 적용됩니다. 따라서 세션 중에 편집해도 재시작 없이 반영됩니다.

---

## skill 설정

Skills는 `SKILL.md` 상단의 YAML frontmatter와 그 아래의 markdown 콘텐츠로 설정합니다.

### skill 콘텐츠 유형

Skill 파일에는 어떤 지시사항이든 담을 수 있지만, 어떻게 호출할지 생각하면 무엇을 포함할지 결정하는 데 도움이 됩니다:

**Reference content (참조 콘텐츠)** 는 Claude가 현재 작업에 적용할 지식을 추가합니다. 컨벤션, 패턴, 스타일 가이드, 도메인 지식 등. 이 콘텐츠는 인라인으로 실행되어 Claude가 대화 컨텍스트와 함께 사용할 수 있습니다.

```yaml
---
name: api-conventions
description: API design patterns for this codebase
---

When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
- Include request validation
```

**Task content (작업 콘텐츠)** 는 배포, 커밋, 코드 생성 같은 특정 작업을 위한 단계별 지시사항을 Claude에게 제공합니다. 보통 Claude가 알아서 실행하도록 두기보다 `/skill-name`으로 직접 호출하고 싶은 작업들입니다. `disable-model-invocation: true`를 추가하면 Claude가 자동으로 트리거하는 것을 방지할 수 있습니다.

```yaml
---
name: deploy
description: Deploy the application to production
context: fork
disable-model-invocation: true
---

Deploy the application:
1. Run the test suite
2. Build the application
3. Push to the deployment target
```

`SKILL.md`에는 무엇이든 담을 수 있지만, skill이 어떻게 호출될지(사용자가, Claude가, 또는 둘 다), 어디서 실행될지(인라인 또는 서브에이전트)를 생각해보면 무엇을 포함할지 결정하는 데 도움이 됩니다. 복잡한 skills의 경우, 메인 skill을 간결하게 유지하기 위해 지원 파일을 추가할 수도 있습니다.

> **역주:**
> - **인라인(inline)**: 현재 대화 컨텍스트 안에서 실행됨. 대화 내용을 참조할 수 있음.
> - **서브에이전트(subagent)**: 별도의 격리된 컨텍스트에서 실행됨. 대화 기록에 접근 불가.

---

### Frontmatter 레퍼런스

markdown 콘텐츠 외에, `SKILL.md` 파일 상단의 `---` 마커 사이에 YAML frontmatter 필드로 skill 동작을 설정할 수 있습니다:

```yaml
---
name: my-skill
description: What this skill does
disable-model-invocation: true
allowed-tools: Read, Grep
---

Your skill instructions here...
```

모든 필드는 선택 사항입니다. Claude가 언제 해당 skill을 사용할지 알 수 있도록 `description`만 권장됩니다.

| 필드                        | 필수 여부   | 설명                                                                                                                                                   |
| :-------------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                      | 아니오      | skill의 표시 이름. 생략 시 디렉토리 이름 사용. 소문자, 숫자, 하이픈만 가능 (최대 64자).                                                                 |
| `description`               | 권장        | skill이 무엇을 하고 언제 사용하는지. Claude가 해당 skill을 적용할지 결정할 때 사용. 생략 시 markdown 콘텐츠의 첫 단락 사용.                              |
| `argument-hint`             | 아니오      | 자동완성 시 예상 인자를 표시하는 힌트. 예: `[issue-number]` 또는 `[filename] [format]`.                                                                 |
| `disable-model-invocation`  | 아니오      | `true`로 설정하면 Claude가 자동으로 이 skill을 로드하지 않음. `/name`으로 수동 트리거하고 싶은 워크플로우에 사용. 기본값: `false`.                        |
| `user-invocable`            | 아니오      | `false`로 설정하면 `/` 메뉴에서 숨김. 사용자가 직접 호출하면 안 되는 배경 지식에 사용. 기본값: `true`.                                                   |
| `allowed-tools`             | 아니오      | 이 skill이 활성화되었을 때 Claude가 권한 요청 없이 사용할 수 있는 도구들.                                                                               |
| `model`                     | 아니오      | 이 skill이 활성화되었을 때 사용할 모델.                                                                                                                 |
| `context`                   | 아니오      | `fork`로 설정하면 분리된 서브에이전트 컨텍스트에서 실행.                                                                                                |
| `agent`                     | 아니오      | `context: fork` 설정 시 사용할 서브에이전트 유형.                                                                                                       |
| `hooks`                     | 아니오      | 이 skill의 라이프사이클에 한정된 hooks.                                                                                                                 |

#### 사용 가능한 문자열 치환

Skills는 skill 콘텐츠 내에서 동적 값을 위한 문자열 치환을 지원합니다:

| 변수                   | 설명                                                                                                                                          |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `$ARGUMENTS`           | skill 호출 시 전달된 모든 인자. 콘텐츠에 `$ARGUMENTS`가 없으면 인자가 `ARGUMENTS: <value>` 형태로 끝에 추가됨.                                  |
| `$ARGUMENTS[N]`        | 0부터 시작하는 인덱스로 특정 인자에 접근. 예: `$ARGUMENTS[0]`은 첫 번째 인자.                                                                  |
| `$N`                   | `$ARGUMENTS[N]`의 축약형. 예: `$0`은 첫 번째 인자, `$1`은 두 번째 인자.                                                                        |
| `${CLAUDE_SESSION_ID}` | 현재 세션 ID. 로깅, 세션별 파일 생성, skill 출력과 세션 연결에 유용.                                                                           |

**치환 사용 예시:**

```yaml
---
name: session-logger
description: Log activity for this session
---

Log the following to logs/${CLAUDE_SESSION_ID}.log:

$ARGUMENTS
```

---

### 지원 파일 추가

Skills는 디렉토리 내에 여러 파일을 포함할 수 있습니다. 이렇게 하면 `SKILL.md`는 핵심 내용에 집중하고, Claude는 필요할 때만 상세 참조 자료에 접근합니다. 큰 레퍼런스 문서, API 명세, 예제 모음 등은 skill이 실행될 때마다 컨텍스트에 로드될 필요가 없습니다.

```
my-skill/
├── SKILL.md (필수 - 개요 및 탐색)
├── reference.md (상세 API 문서 - 필요 시 로드)
├── examples.md (사용 예제 - 필요 시 로드)
└── scripts/
    └── helper.py (유틸리티 스크립트 - 로드되지 않고 실행됨)
```

`SKILL.md`에서 지원 파일을 참조해서 Claude가 각 파일의 내용과 언제 로드할지 알 수 있게 합니다:

```markdown
## 추가 자료

- 전체 API 세부사항은 [reference.md](reference.md) 참조
- 사용 예제는 [examples.md](examples.md) 참조
```

> **팁:** `SKILL.md`는 500줄 이하로 유지하세요. 상세 참조 자료는 별도 파일로 분리하세요.

---

### 호출 권한 제어

기본적으로 사용자와 Claude 모두 어떤 skill이든 호출할 수 있습니다. `/skill-name`으로 직접 호출하거나, Claude가 대화와 관련이 있을 때 자동으로 로드할 수 있습니다. 두 가지 frontmatter 필드로 이를 제한할 수 있습니다:

* **`disable-model-invocation: true`**: 사용자만 skill을 호출할 수 있습니다. 부작용이 있거나 타이밍을 직접 제어하고 싶은 워크플로우에 사용하세요. 예: `/commit`, `/deploy`, `/send-slack-message`. 코드가 준비된 것 같다고 Claude가 알아서 배포하는 건 원하지 않을 테니까요.

* **`user-invocable: false`**: Claude만 skill을 호출할 수 있습니다. 명령어로 실행하기엔 맞지 않는 배경 지식에 사용하세요. 예를 들어 `legacy-system-context` skill은 레거시 시스템의 작동 방식을 설명합니다. Claude는 관련이 있을 때 이 정보를 알아야 하지만, `/legacy-system-context`는 사용자가 직접 호출할 의미 있는 액션이 아닙니다.

두 필드가 호출과 컨텍스트 로딩에 미치는 영향:

| Frontmatter                      | 사용자 호출 | Claude 호출 | 컨텍스트 로딩 시점                                           |
| :------------------------------- | :---------- | :---------- | :----------------------------------------------------------- |
| (기본값)                          | 가능        | 가능        | description은 항상 컨텍스트에 있음, 호출 시 전체 skill 로드   |
| `disable-model-invocation: true` | 가능        | 불가        | description이 컨텍스트에 없음, 사용자 호출 시 전체 skill 로드 |
| `user-invocable: false`          | 불가        | 가능        | description은 항상 컨텍스트에 있음, 호출 시 전체 skill 로드   |

이 예제는 사용자만 트리거할 수 있는 deploy skill을 만듭니다. `disable-model-invocation: true` 필드가 Claude의 자동 실행을 방지합니다:

```yaml
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
---

Deploy $ARGUMENTS to production:

1. Run the test suite
2. Build the application
3. Push to the deployment target
4. Verify the deployment succeeded
```

### 도구 접근 제한

`allowed-tools` 필드로 skill이 활성화되었을 때 Claude가 사용할 수 있는 도구를 제한할 수 있습니다. 이 skill은 Claude가 파일을 탐색만 하고 수정은 못하는 읽기 전용 모드를 만듭니다:

```yaml
---
name: safe-reader
description: Read files without making changes
allowed-tools: Read, Grep, Glob
---
```

### skill에 인자 전달하기

사용자와 Claude 모두 skill 호출 시 인자를 전달할 수 있습니다. 인자는 `$ARGUMENTS` 플레이스홀더를 통해 사용할 수 있습니다.

이 skill은 GitHub 이슈를 번호로 수정합니다. `$ARGUMENTS` 플레이스홀더는 skill 이름 뒤에 오는 내용으로 대체됩니다:

```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS following our coding standards.

1. Read the issue description
2. Understand the requirements
3. Implement the fix
4. Write tests
5. Create a commit
```

`/fix-issue 123`을 실행하면, Claude는 "Fix GitHub issue 123 following our coding standards..."를 받습니다.

인자와 함께 skill을 호출했는데 skill에 `$ARGUMENTS`가 없으면, Claude Code가 skill 콘텐츠 끝에 `ARGUMENTS: <입력값>`을 추가해서 Claude가 입력 내용을 볼 수 있게 합니다.

위치별로 개별 인자에 접근하려면 `$ARGUMENTS[N]` 또는 축약형 `$N`을 사용합니다:

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $0 component from $1 to $2.
Preserve all existing behavior and tests.
```

`/migrate-component SearchBar React Vue`를 실행하면 `$0`은 `SearchBar`로, `$1`은 `React`로, `$2`는 `Vue`로 대체됩니다.

---

## 고급 패턴

### 동적 컨텍스트 주입

`` !`command` `` 문법은 skill 콘텐츠가 Claude에게 전송되기 전에 셸 명령어를 실행합니다. 명령어 출력이 플레이스홀더를 대체하므로, Claude는 명령어가 아닌 실제 데이터를 받습니다.

이 skill은 GitHub CLI로 실시간 PR 데이터를 가져와서 풀 리퀘스트를 요약합니다. `` !`gh pr diff` `` 등의 명령어가 먼저 실행되고, 출력이 프롬프트에 삽입됩니다:

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

이 skill이 실행될 때:

1. 각 `` !`command` ``가 즉시 실행됨 (Claude가 보기 전에)
2. 출력이 skill 콘텐츠의 플레이스홀더를 대체
3. Claude는 실제 PR 데이터가 포함된 완성된 프롬프트를 받음

이것은 전처리이며, Claude가 실행하는 것이 아닙니다. Claude는 최종 결과만 봅니다.

> **팁:** skill에서 확장된 사고(extended thinking)를 활성화하려면 skill 콘텐츠 어디에든 "ultrathink"라는 단어를 포함하세요.

### 서브에이전트에서 skill 실행하기

skill을 격리된 환경에서 실행하려면 frontmatter에 `context: fork`를 추가하세요. skill 콘텐츠가 서브에이전트를 구동하는 프롬프트가 됩니다. 대화 기록에는 접근할 수 없습니다.

> **주의:** `context: fork`는 명시적인 지시사항이 있는 skills에만 의미가 있습니다. skill에 작업 없이 "이 API 컨벤션을 사용하라" 같은 가이드라인만 있으면, 서브에이전트는 가이드라인만 받고 실행할 프롬프트가 없어서 의미 있는 출력 없이 반환됩니다.

Skills와 서브에이전트는 두 방향으로 함께 작동합니다:

| 접근 방식                     | 시스템 프롬프트                           | 작업                        | 추가 로드                    |
| :---------------------------- | :---------------------------------------- | :-------------------------- | :--------------------------- |
| `context: fork`가 있는 Skill  | 에이전트 유형에서 (`Explore`, `Plan` 등)  | SKILL.md 콘텐츠             | CLAUDE.md                    |
| `skills` 필드가 있는 Subagent | 서브에이전트의 markdown 본문              | Claude의 위임 메시지        | 프리로드된 skills + CLAUDE.md |

`context: fork`를 사용하면 skill에 작업을 작성하고 이를 실행할 에이전트 유형을 선택합니다. 반대 방향(skills를 참조 자료로 사용하는 커스텀 서브에이전트 정의)은 Subagents 문서를 참조하세요.

#### 예제: Explore 에이전트를 사용한 리서치 skill

이 skill은 분리된 Explore 에이전트에서 리서치를 실행합니다. skill 콘텐츠가 작업이 되고, 에이전트는 코드베이스 탐색에 최적화된 읽기 전용 도구를 제공합니다:

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:

1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

이 skill이 실행될 때:

1. 새로운 격리된 컨텍스트가 생성됨
2. 서브에이전트가 skill 콘텐츠를 프롬프트로 받음
3. `agent` 필드가 실행 환경(모델, 도구, 권한)을 결정
4. 결과가 요약되어 메인 대화로 반환됨

`agent` 필드는 사용할 서브에이전트 구성을 지정합니다. 옵션에는 내장 에이전트(`Explore`, `Plan`, `general-purpose`) 또는 `.claude/agents/`의 커스텀 서브에이전트가 포함됩니다. 생략 시 `general-purpose`를 사용합니다.

### Claude의 skill 접근 제한

기본적으로 Claude는 `disable-model-invocation: true`가 설정되지 않은 모든 skill을 호출할 수 있습니다. `allowed-tools`를 정의한 skills는 해당 skill이 활성화되었을 때 Claude가 개별 승인 없이 해당 도구들을 사용할 수 있게 합니다. 권한 설정은 여전히 다른 모든 도구의 기본 승인 동작을 제어합니다. `/compact`나 `/init` 같은 내장 명령어는 Skill 도구를 통해 사용할 수 없습니다.

Claude가 호출할 수 있는 skills를 제어하는 세 가지 방법:

**모든 skills 비활성화** - `/permissions`에서 Skill 도구를 거부:

```
# deny 규칙에 추가:
Skill
```

**특정 skills 허용 또는 거부** - permission 규칙 사용:

```
# 특정 skills만 허용
Skill(commit)
Skill(review-pr *)

# 특정 skills 거부
Skill(deploy *)
```

Permission 문법: `Skill(name)`은 정확히 일치, `Skill(name *)`은 접두사 일치 및 모든 인자 허용.

**개별 skills 숨기기** - frontmatter에 `disable-model-invocation: true` 추가. 이렇게 하면 해당 skill이 Claude의 컨텍스트에서 완전히 제거됩니다.

> **참고:** `user-invocable` 필드는 메뉴 표시 여부만 제어하며, Skill 도구 접근은 제어하지 않습니다. 프로그래밍적 호출을 차단하려면 `disable-model-invocation: true`를 사용하세요.

---

## skill 공유

Skills는 대상에 따라 다양한 범위로 배포할 수 있습니다:

* **Project skills**: `.claude/skills/`를 버전 관리에 커밋
* **Plugins**: 플러그인에 `skills/` 디렉토리 생성
* **Managed**: managed settings를 통해 조직 전체에 배포

### 시각적 출력 생성

Skills는 어떤 언어의 스크립트든 번들하고 실행할 수 있어서, 단일 프롬프트로는 불가능한 기능을 Claude에게 제공합니다. 강력한 패턴 중 하나는 시각적 출력 생성입니다: 데이터 탐색, 디버깅, 리포트 생성을 위해 브라우저에서 열리는 인터랙티브 HTML 파일.

이 예제는 코드베이스 탐색기를 만듭니다: 디렉토리를 펼치고 접을 수 있고, 파일 크기를 한눈에 보고, 색상으로 파일 유형을 식별할 수 있는 인터랙티브 트리 뷰.

Skill 디렉토리 생성:

```bash
mkdir -p ~/.claude/skills/codebase-visualizer/scripts
```

`~/.claude/skills/codebase-visualizer/SKILL.md` 생성:

```yaml
---
name: codebase-visualizer
description: Generate an interactive collapsible tree visualization of your codebase. Use when exploring a new repo, understanding project structure, or identifying large files.
allowed-tools: Bash(python *)
---

# Codebase Visualizer

Generate an interactive HTML tree view that shows your project's file structure with collapsible directories.

## Usage

Run the visualization script from your project root:

```bash
python ~/.claude/skills/codebase-visualizer/scripts/visualize.py .
```

This creates `codebase-map.html` in the current directory and opens it in your default browser.

## What the visualization shows

- **Collapsible directories**: Click folders to expand/collapse
- **File sizes**: Displayed next to each file
- **Colors**: Different colors for different file types
- **Directory totals**: Shows aggregate size of each folder
```

테스트하려면, 아무 프로젝트에서 Claude Code를 열고 "Visualize this codebase"라고 요청하세요. Claude가 스크립트를 실행하고, `codebase-map.html`을 생성하고, 브라우저에서 엽니다.

이 패턴은 모든 시각적 출력에 적용됩니다: 의존성 그래프, 테스트 커버리지 리포트, API 문서, 데이터베이스 스키마 시각화 등. 번들된 스크립트가 무거운 작업을 하고, Claude는 오케스트레이션을 담당합니다.

---

## 문제 해결

### Skill이 트리거되지 않음

Claude가 예상대로 skill을 사용하지 않을 때:

1. description에 사용자가 자연스럽게 말할 키워드가 포함되어 있는지 확인
2. `What skills are available?`에 해당 skill이 나타나는지 확인
3. description과 더 일치하도록 요청을 다시 표현해보기
4. skill이 user-invocable이면 `/skill-name`으로 직접 호출

### Skill이 너무 자주 트리거됨

원하지 않을 때 Claude가 skill을 사용하는 경우:

1. description을 더 구체적으로 작성
2. 수동 호출만 원하면 `disable-model-invocation: true` 추가

### Claude가 모든 skills를 보지 못함

Skill descriptions는 Claude가 사용 가능한 것을 알 수 있도록 컨텍스트에 로드됩니다. skills가 많으면 문자 수 한도를 초과할 수 있습니다. 한도는 컨텍스트 윈도우의 2%로 동적으로 조정되며, 폴백은 16,000자입니다. `/context`를 실행해서 제외된 skills에 대한 경고를 확인하세요.

한도를 변경하려면 `SLASH_COMMAND_TOOL_CHAR_BUDGET` 환경 변수를 설정하세요.

---

## 관련 자료

* **Subagents**: 전문화된 에이전트에게 작업 위임
* **Plugins**: skills와 다른 확장을 패키징하고 배포
* **Hooks**: 도구 이벤트를 중심으로 워크플로우 자동화
* **Memory**: 지속적인 컨텍스트를 위한 CLAUDE.md 파일 관리
* **Interactive mode**: 내장 명령어와 단축키
* **Permissions**: 도구 및 skill 접근 제어
