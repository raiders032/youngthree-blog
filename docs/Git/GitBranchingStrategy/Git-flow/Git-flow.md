## 1. Git-flow 전략

- Git-flow에는 5가지 종류의 브랜치가 존재합니다. 
- 항상 유지되는 메인 브랜치들(master, develop)과 일정 기간 동안만 유지되는 보조 브랜치들(feature, release, hotfix)이 있습니다.
  - master : 제품으로 출시될 수 있는 브랜치
  - develop : 다음 출시 버전을 개발하는 브랜치
  - feature : 기능을 개발하는 브랜치
  - release : 이번 출시 버전을 준비하는 브랜치
  - hotfix : 출시 버전에서 발생한 버그를 수정 하는 브랜치

## 2. 개발 흐름

- 처음에는 master와 develop 브랜치가 존재합니다. 
- 물론 develop 브랜치는 master에서부터 시작된 브랜치입니다. 
- develop 브랜치에서는 상시로 버그를 수정한 커밋들이 추가됩니다. 
- 새로운 기능 추가 작업이 있는 경우 develop 브랜치에서 feature 브랜치를 생성합니다. 
- feature 브랜치는 언제나 develop 브랜치에서부터 시작하게 됩니다. 
- 기능 추가 작업이 완료되었다면 feature 브랜치는 develop 브랜치로 merge 됩니다. 
- develop에 이번 버전에 포함되는 모든 기능이 merge 되었다면 QA를 하기 위해 develop 브랜치에서부터 release 브랜치를 생성합니다. 
- QA를 진행하면서 발생한 버그들은 release 브랜치에 수정됩니다. 
- QA를 무사히 통과했다면 release 브랜치를 master와 develop 브랜치로 merge 합니다. 
- 마지막으로 출시된 master 브랜치에서 버전 태그를 추가합니다.

## 3. 브랜치 별 상세

### 3.1 master(main)

- 제품으로 출시될 수 있는 브랜치입니다.
- master 브랜치에 있는 커밋들은 항상 배포 가능한 상태여야 합니다.
- master 브랜치에 태그를 달아서 배포 버전을 관리합니다.

### 3.2 develop

- 다음 출시 버전을 개발하는 브랜치입니다.
- master 브랜치에서부터 시작된 브랜치입니다.
- 상시로 버그를 수정한 커밋들이 추가됩니다.
- 새로운 기능 추가 작업이 있는 경우 develop 브랜치에서 feature 브랜치를 생성합니다.
- 기능 추가 작업이 완료되었다면 feature 브랜치는 develop 브랜치로 merge 됩니다.
- QA를 하기 위해 develop 브랜치에서부터 release 브랜치를 생성합니다.
- QA를 진행하면서 발생한 버그들은 release 브랜치에 수정됩니다.
  - release 브랜치에서 수정된 버그는 develop 브랜치에도 merge 됩니다.
- QA를 무사히 통과했다면 release 브랜치를 master와 develop 브랜치로 merge 합니다.
- develop 브랜치는 지속적으로 운영됩니다.

### 3.3 feature

- 기능을 개발하는 브랜치입니다.
- develop 브랜치에서부터 시작합니다.
- 기능 추가 작업이 완료되었다면 feature 브랜치는 develop 브랜치로 merge 됩니다.
- feature 브랜치는 기능 추가 작업이 끝나면 삭제합니다.

### 3.4 release

- 이번 출시 버전을 준비하는 브랜치입니다.
- develop 브랜치에서부터 시작합니다.
- QA를 진행하면서 발생한 버그들은 release 브랜치에 수정됩니다.
  - release 브랜치에서 수정된 버그는 develop 브랜치에도 merge 됩니다
- QA를 무사히 통과했다면 release 브랜치를 master와 develop 브랜치로 merge 합니다.
- release 브랜치는 QA가 끝나면 삭제합니다.

### 3.5 hotfix

- 출시 버전에서 발생한 버그를 수정하는 브랜치입니다.
- master 브랜치에서부터 시작합니다.
- hotfix 브랜치에서 수정된 버그는 develop 브랜치에도 merge 됩니다.
- hotfix 브랜치는 버그 수정이 끝나면 삭제합니다.

## 참고

- https://techblog.woowahan.com/2553/