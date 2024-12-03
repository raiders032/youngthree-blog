## 1 GithubAction

## 2 workflow file

- workflow란 자동화 된 프로세스를 작성하는 것을 뜻한다.
  - 이 프로세스 안에서 한개 이상의 잡이 실행된다.
- 이러한 workflow는 YAML file로 작성되고 특정 이벤트 발생 시 실행시키거나 직접 실행시킬 수 도 있다.
- Workflows file은 리포지토리의 `.github/workflows` 디렉토리에 작성한다.
  - 이 디렉토리에 여러개의 workflow를 작성하는 것도 가능하다.
- [레퍼런스](https://docs.github.com/ko/actions/learn-github-actions/understanding-github-actions#understanding-the-workflow-file)

### 2.1 namea

- Optional
- workflow의 이름을 지정한다.

```yaml
name: learn-github-actions
```

### 2.2 on

- required
- workflow를 트리거할 이벤트를 지정한다.
  - push, pull_reqeust, pull_reqeust_review, pull_reqeust_review_comment 등
  - [이벤트 더 자세히 보기](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)

**예시**

- 아래의 예시는 master 브랜치에 푸시 이벤트가 발생하거나 master 브랜치에 풀 리퀘스트 이벤트가 발생하면 workflow가 실행된다.

```yaml
on:
	push:
		branches: [ master]
	pull_request:
		branches: [ master]
```

#### 2.2.1 push

- [레퍼런스](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#push)
- 커밋 또는 태그를 푸시했을 때 workflow가 트리거된다.
- 여러 필터를 사용해서 세세한 조절이 가능하다.

`branches`

- [레퍼런스](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#running-your-workflow-only-when-a-push-to-specific-branches-occurs)
- branches 필터를 사용하면 특정 브랜치에 push가 발생했을 때만 workflow를 시작할 수 있다.

```yaml
on:
  push:
    branches:
      - 'main'
      - 'releases/**'
```

- 위처럼 branches 필터를 설정하면 main 브랜치 또는 releases/로 시작하는 브랜치에 푸시가 발생하면 workflow가 시작된다.

`paths`

- [레퍼런스](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#running-your-workflow-only-when-a-push-affects-specific-files)
- paths 필터를 사용하면 특정 파일에 대한 push 이벤트가 발생했을 때만 workflow를 시작할 수 있다.
- branches 필터와 함께 사용하면 두 조건을 모두 만족했을 때 workflow가 시작된다.

```yaml
on:
  push:
    branches:
      - 'releases/**'
    paths:
      - '**.js'
```

- `releases/`로 시작하는 브랜치에 JavaScript (`.js`) file이 변경될 때만 workflow가 시작되는 예시

#### 2.2.2 pull request

- [레퍼런스](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request)
- pull request 발생 시 workflow를 트리거할 수 있다.
- pull request의 여러 액티비티 타입을 지정해서 pull request가 open되었을 때 또는 pull request가 reopne되었을 때 등 세세한 조절이 가능하다.

**예시**

```yaml
on:
  pull_request:
    types: [opened, reopened]
```

- 아래는 pull_request의 액티비티 타입으로 opened, reopened를 지정했다.
- 따라서 pull_request가 open되거나 reopen될 때 workflow가 트리거된다.

```yaml
on:
  pull_request:
    types:
      - opened
    branches:
      - 'releases/**'
```

- 이 워크플로우는 누군가가 releases/로 시작하는 브랜치를 대상으로 하는 풀 리퀘스트를 열 때 실행됩니다:

**Activity types**

- 지원되는 Activity types은 아래와 같다.
- Activity types을 지정하지 않으면 기본적으로 pull_request가 open, reopen 또는 헤드 브랜치가 변경될 때 workflow가 트리거 된다.
- assigned
- unassigned
- labeled
- unlabeled
- opened
  - PR이 처음 생성되었을 때 발생하는 이벤트입니다.
- edited
- closed
- reopened
  - 닫혀있던 PR이 다시 열릴 때 발생하는 이벤트입니다.
- synchronize
  - PR의 소스 브랜치에 새로운 커밋이 푸시되어 PR이 업데이트될 때 발생하는 이벤트입니다.
- converted_to_draft
- ready_for_review
- locked
- unlocked
- review_requested
- review_request_removed
- auto_merge_enabled
- auto_merge_disabled

### 2.3 jobs

- workflow에서 실행할 잡들의 묶음

**예시**

```yaml
jobs:
  build-java:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Set up JDK 1.8
      uses: actions/setup-java@v1
      with:
        java-version: 1.8

    - name: Grant execute permission for gradlew
      run: chmod +x gradlew

    - name: Build with Gradle
      run: ./gradlew build

    - name: Build and Push Docker Image
      uses: mr-smithers-excellent/docker-build-push@v4
      with:
        image: nanajanashia/demo-app
        registry: docker.io
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
```

#### 2.3.1 `jobs.<job_id>.runs-on`

- [레퍼런스](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idruns-on)
- `runs-on`은 GitHub Actions 워크플로우의 각 job이 실행될 환경을 지정하는 데 사용됩니다.
- 이는 작업이 실행될 가상 머신(VM)의 운영 체제와 버전을 결정합니다.
- 예를 들어, .NET 애플리케이션을 빌드하려면 Windows 환경이 필요할 수 있고, macOS 앱을 빌드하려면 macOS 환경이 필요할 수 있습니다.

#### 2.3.2 `jobs.<job_id>.outputs`

- [레퍼런스](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idoutputs)
- GitHub Actions의 job outputs 기능을 사용하면 job 간에 데이터를 전달할 수 있습니다.
- 한 job에서 생성된 결과값을 다른 job에서 참조하여 사용할 수 있습니다.
- `jobs.<job_id>.outputs`를 사용하여 job의 outputs map을 생성할 수 있습니다.
- Job outputs는 이 job에 의존하는 모든 downstream jobs에서 사용 가능합니다.
- Outputs는 유니코드 문자열이며, 최대 1MB까지 가능합니다.
- 워크플로우 실행당 모든 outputs의 총합은 최대 50MB입니다.
- 표현식이 포함된 job outputs는 각 job이 끝날 때 runner에서 평가됩니다.

**Output 정의하기**

```yaml

```

- job 내에서 `outputs` 섹션을 사용하여 output 변수를 정의합니다.
- 각 output은 고유한 이름을 가져야 합니다.
- output 값은 보통 step의 출력값을 참조합니다.

**예시**

```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    outputs:
      output1: ${{ steps.step1.outputs.test }}
      output2: ${{ steps.step2.outputs.test }}
    steps:
      - id: step1
        run: echo "test=hello" >> "$GITHUB_OUTPUT"
      - id: step2
        run: echo "test=world" >> "$GITHUB_OUTPUT"
  job2:
    runs-on: ubuntu-latest
    needs: job1
    steps:
      - env:
          OUTPUT1: ${{needs.job1.outputs.output1}}
          OUTPUT2: ${{needs.job1.outputs.output2}}
        run: echo "$OUTPUT1 $OUTPUT2"
```

#### 2.3.3 `jobs.<job_id>.strategy.matrix`

- [레퍼런스](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix)
- `jobs.<job_id>.strategy.matrix`는 GitHub Actions 워크플로우에서 다양한 작업 구성을 정의하는 데 사용되는 기능입니다.
- 이를 통해 여러 변수와 값의 조합으로 작업을 실행할 수 있습니다.
- 주요 특징은 다음과 같습니다
  - 목적: 여러 환경이나 설정에서 동일한 작업을 실행하고자 할 때 사용합니다.
  - 구조: 하나 이상의 변수를 정의하고, 각 변수에 대한 값의 배열을 지정합니다.
  - 작동 방식: 정의된 모든 변수의 가능한 조합에 대해 별도의 작업이 실행됩니다.
  - 제한: 최대 256개의 작업을 생성할 수 있습니다.
  - 컨텍스트 접근: 정의된 변수는 `matrix` 컨텍스트를 통해 워크플로우 파일의 다른 부분에서 참조할 수 있습니다.
  - 차원: 단일 차원(하나의 변수) 또는 다차원(여러 변수) 매트릭스를 만들 수 있습니다.
  - 동적 매트릭스: 컨텍스트나 이벤트 페이로드를 사용하여 동적으로 매트릭스를 생성할 수 있습니다.

**예시**

```yaml
jobs:
  example_matrix:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        version: [10, 12, 14]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.version }}
```

- 이 예시에서는 2개의 OS와 3개의 Node.js 버전으로 총 6개의 작업이 생성됩니다.
- 각 작업은 지정된 OS에서 실행되며, 해당하는 Node.js 버전을 사용합니다.
- 매트릭스 전략을 사용하면 다양한 환경에서 애플리케이션을 테스트하거나 여러 설정으로 빌드를 수행하는 등의 복잡한 워크플로우를 효율적으로 구성할 수 있습니다.

**Matrix Include 사용**

- `include`를 사용하여 기존 매트릭스 구성을 확장하거나 새로운 구성을 추가할 수 있습니다.
- 각 include 항목은 기존 매트릭스 조합에 추가되거나 새로운 조합을 생성합니다.

```yaml
strategy:
  matrix:
    fruit: [apple, pear]
    animal: [cat, dog]
    include:
      - color: green
      - color: pink
        animal: cat
      - fruit: apple
        shape: circle
      - fruit: banana
      - fruit: banana
        animal: cat
```

위 매트릭스는 다음과 같은 6개의 작업 조합을 생성합니다:

- `{fruit: apple, animal: cat, color: pink, shape: circle}`
- `{fruit: apple, animal: dog, color: green, shape: circle}`
- `{fruit: pear, animal: cat, color: pink}`
- `{fruit: pear, animal: dog, color: green}`
- `{fruit: banana}`
- `{fruit: banana, animal: cat}`

**Matrix Exclude 사용**

- `exclude`를 사용하여 특정 매트릭스 조합을 제외할 수 있습니다.
- 부분적인 매치만으로도 해당 조합이 제외됩니다.

```yaml
strategy:
  matrix:
    os: [macos-latest, windows-latest]
    version: [12, 14, 16]
    environment: [staging, production]
    exclude:
      - os: macos-latest
        version: 12
        environment: production
      - os: windows-latest
        version: 16
```

이 예시에서는:

- `{os: macos-latest, version: 12, environment: production}` 조합이 제외됩니다.
- `{os: windows-latest, version: 16}`와 매칭되는 모든 조합이 제외됩니다.

**주의사항**

- exclude는 include보다 먼저 처리됩니다.
- include를 사용하여 이전에 exclude된 조합을 다시 추가할 수 있습니다.
- 매트릭스 변수를 지정하지 않고 include만 사용할 경우, include에 명시된 조합만 실행

### 2.4 permissions

- [레퍼런스](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#permissions)
- GitHub Actions에서 `permissions` 키워드는 `GITHUB_TOKEN`의 기본 권한을 수정하는데 사용됩니다.
- 권한은 두 가지 레벨에서 설정할 수 있습니다:
  - 최상위 레벨: 워크플로우의 모든 작업에 적용
  - 작업 레벨: 특정 작업에만 적용

#### 2.4.1 권한 설정 방법

- 각 권한에 대해 다음과 같은 접근 레벨을 지정할 수 있습니다:
  - `read`: 읽기 권한 (해당되는 경우)
  - `write`: 쓰기 권한 (읽기 권한 포함)
  - `none`: 권한 없음
- 명시적으로 지정되지 않은 권한은 모두 `none`으로 설정됩니다.

#### 2.4.2 사용 가능한 권한 목록

- `actions`: GitHub Actions 작업 관련 권한
  - 예: 워크플로우 실행 취소 등
- `attestations`: 아티팩트 증명 작업 관련 권한
- `checks`: 체크 실행 및 체크 스위트 관련 권한
- `contents`: 저장소 컨텐츠 관련 권한
  - 예: 커밋 목록 조회, 릴리스 생성 등
- `deployments`: 배포 관련 권한
- `discussions`: GitHub Discussions 관련 권한
- `id-token`: OpenID Connect (OIDC) 토큰 관련 권한
- `issues`: 이슈 관련 권한
- `packages`: GitHub Packages 관련 권한
- `pages`: GitHub Pages 관련 권한
- `pull-requests`: 풀 리퀘스트 관련 권한
- `repository-projects`: GitHub 프로젝트(클래식) 관련 권한
- `security-events`: 코드 스캐닝 및 Dependabot 알림 관련 권한
- `statuses`: 커밋 상태 관련 권한

#### 2.4.3 권한 설정 예시

**전체 워크플로우에 대한 권한 설정**

```yaml
name: "My workflow"
on: [ push ]

##  모든 권한에 대해 읽기 권한 부여
permissions: read-all

jobs:
  job1:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Hello World"
```

**특정 권한만 설정**

```yaml
permissions:
  actions: read
  checks: write
  contents: read
  issues: write
```

**모든 권한 비활성화**

```yaml
permissions: {}
```

#### 2.4.4 Fork된 저장소에서의 권한

- Fork된 저장소에서는 `permissions` 키를 사용하여 읽기 권한을 추가하거나 제거할 수 있습니다.
- 단, 쓰기 권한은 일반적으로 부여할 수 없습니다.
- 예외: 관리자가 GitHub Actions 설정에서 "Send write tokens to workflows from pull requests" 옵션을 선택한 경우

### 2.5 env

- `env` 키를 사용해서 workflow에 환경변수를 지정할 수 있다.
- `env`의 위치에 따라 환경 변수의 스코프가 결정된다.
  - 최상위 레벨의 `env`에 정의된 변수는 워크플로의 모든 작업과 단계에서 사용할 수 있다.
  - 작업 레벨의 `env`에 정의된 변수는 해당 작업의 모든 단계에서 사용할 수 있다.
  - 단계 레벨의 `env`에 정의된 변수는 해당 단계에서만 사용할 수 있다.
- 환경 변수는 `${{ env.VARIABLE_NAME }}` 구문을 사용하여 워크플로 파일의 다른 부분에서 참조할 수 있다.
- 동일한 이름의 환경 변수가 여러 레벨에서 정의된 경우, 가장 구체적인 레벨의 변수가 우선한다.
  - 예를 들어, Step 레벨의변수가 Job 레벨이나 최상위 레벨의 동일한 이름의 변수를 오버라이드한다.

**예시**

```yaml
name: Greeting on variable day

on:
  workflow_dispatch

##  탑레벨에 env를 사용하면 workflow 내부 전체에서 사용이 가능하다.
env:
  DAY_OF_WEEK: Monday

jobs:
  greeting_job:
    runs-on: ubuntu-latest
    env:
      Greeting: Hello
    steps:
      - name: "Say Hello Mona it's Monday"
        run: echo "$Greeting $First_Name. Today is $DAY_OF_WEEK!"
        env:
          First_Name: Mona
```

## 3 Context

### 3.1 gitHub context

`github.ref_name`

- 워크플로가 시작된 브랜치의 이름 또는 태그의 심플 버전

`github.run_number`

- 워크플로를 실행을 나타내는 고유한 번호
- 워크플로의 첫 번째 실행에 대해 1에서 시작하여 새로운 실행마다 1씩 증가한다.
- 워크플로 실행을 다시 실행해도 번호가 변경되지 않는다.

## 4 Default environment variables

- [미리 정의된 환경변수들](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables)

`GITHUB_REF_NAME`

- 워크플로가 시작된 `브랜치의 이름` 또는 `태그`의 심플 버전
- 풀 버전은 `GITHUB_REF`를 사용한다.

`GITHUB_REF_TYPE`

- 워크플로가 트리거된 종류로 값으로 `branch` 또는 `tag`를 가진다
