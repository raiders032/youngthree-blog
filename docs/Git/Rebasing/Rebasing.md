---
title: "Git Rebase"
description: "Git에서 브랜치를 통합하는 두 가지 방법 중 하나인 Rebase에 대해 상세히 알아봅니다. Merge와의 차이점, 기본 사용법부터 고급 기능까지, 그리고 언제 사용해야 하고 언제 피해야 하는지에 대한 실용적인 가이드를 제공합니다."
tags: [ "GIT", "REBASE", "VERSION_CONTROL", "BACKEND", "DEVOPS" ]
keywords: [ "Git", "리베이스", "rebase", "깃", "브랜치", "branch", "머지", "merge", "버전관리", "version control", "형상관리", "git rebase", "git merge", "브랜치 통합", "branch integration", "커밋 히스토리", "commit history", "개발", "development" ]
draft: false
hide_title: true
---

## 1. Git Rebase란 무엇인가

- Git에서 브랜치를 통합하는 방법에는 크게 두 가지가 있습니다: `merge`와 `rebase`입니다.
- Rebase는 한 브랜치의 변경사항을 다른 브랜치 위에 "재적용"하는 방식으로 브랜치를 통합합니다.
- 결과적으로 더 깔끔하고 선형적인 커밋 히스토리를 만들 수 있습니다.

:::info[Rebase의 핵심 개념]
Rebase는 말 그대로 "기준점을 다시 설정"하는 것입니다. 현재 브랜치의 커밋들을 다른 브랜치의 최신 커밋 위에 차례대로 다시 적용합니다.
:::

## 2. Merge vs Rebase 비교

### 2.1 Merge 방식

- 두 브랜치의 최신 커밋과 공통 조상을 기준으로 3-way merge를 수행합니다.
- 새로운 merge 커밋을 생성하여 두 브랜치의 히스토리를 보존합니다.
- 브랜치의 실제 개발 과정이 그대로 기록됩니다.

### 2.2 Rebase 방식

- 현재 브랜치의 커밋들을 대상 브랜치 위에 순차적으로 재적용합니다.
- 새로운 커밋을 생성하지 않고 기존 커밋들을 이동시킵니다.
- 마치 처음부터 한 줄로 개발한 것처럼 선형적인 히스토리를 만듭니다.

:::tip[언제 어떤 방식을 사용할까?]

- **Merge**: 브랜치의 실제 개발 과정을 보존하고 싶을 때
- **Rebase**: 깔끔하고 읽기 쉬운 히스토리를 원할 때

:::

## 3. 기본 Rebase 사용법

### 3.1 기본 구문

#### Git Rebase 기본 명령어

```bash
# 현재 브랜치를 master 브랜치 위로 rebase
git checkout feature-branch
git rebase master

# 또는 한 번에
git rebase master feature-branch
```

이 명령어는 feature-branch의 커밋들을 master 브랜치의 최신 커밋 위에 재적용합니다.

### 3.2 Rebase 과정 이해하기

- Git은 두 브랜치의 공통 조상을 찾습니다.
- 현재 브랜치의 각 커밋에서 도입된 변경사항(diff)을 임시 파일에 저장합니다.
- 현재 브랜치를 대상 브랜치의 최신 커밋으로 재설정합니다.
- 저장된 변경사항들을 순서대로 다시 적용합니다.

#### Rebase 후 Fast-forward Merge

```bash
# rebase 완료 후 master 브랜치로 전환
git checkout master
# fast-forward merge 수행
git merge feature-branch
```

Rebase 후에는 fast-forward merge가 가능하여 깔끔한 선형 히스토리를 유지할 수 있습니다.

## 4. 고급 Rebase 기능

### 4.1 Interactive Rebase

#### 커밋 히스토리 수정하기

```bash
# 최근 3개 커밋을 대화형으로 수정
git rebase -i HEAD~3
```

Interactive rebase를 사용하면 커밋을 재정렬, 수정, 합치기, 삭제할 수 있습니다.

### 4.2 --onto 옵션 활용

#### 특정 범위의 커밋만 rebase하기

```bash
# client 브랜치에서 server 브랜치와 다른 부분만 master로 rebase
git rebase --onto master server client
```

이 명령어는 client 브랜치가 server 브랜치에서 분기된 이후의 커밋들만 master 브랜치 위로 이동시킵니다.

#### 브랜치를 직접 체크아웃하지 않고 rebase하기

```bash
# server 브랜치를 직접 master 위로 rebase
git rebase master server
```

## 5. Rebase 사용 시 주의사항

### 5.1 황금 규칙

:::danger[절대 하지 말아야 할 것]

**이미 원격 저장소에 푸시된 커밋은 rebase하지 마세요!**

다른 개발자들이 해당 커밋을 기반으로 작업했을 수 있습니다.

:::

### 5.2 문제가 되는 상황

- 공개 저장소에 푸시된 커밋을 rebase하면 다른 개발자들의 작업과 충돌이 발생할 수 있습니다.
- 같은 변경사항이 중복으로 나타나거나 복잡한 merge 상황이 발생할 수 있습니다.

### 5.3 안전한 Rebase 사용법

- 로컬에서만 작업한 커밋들은 자유롭게 rebase할 수 있습니다.
- 푸시하기 전에 히스토리를 정리하는 용도로 사용하세요.
- 팀원들과 rebase 사용에 대한 규칙을 미리 정하세요.

## 6. Rebase 충돌 해결

### 6.1 충돌 발생 시 대응 방법

#### 충돌 해결 과정

```bash
# 충돌 발생 시 파일을 수정한 후
git add <해결된_파일>
git rebase --continue

# rebase 중단하고 원래 상태로 돌아가기
git rebase --abort

# 특정 커밋 건너뛰기 (주의해서 사용)
git rebase --skip
```

충돌이 발생하면 Git이 rebase 과정을 일시 중단하고 사용자가 직접 해결할 수 있도록 합니다.

## 7. Pull with Rebase

### 7.1 기본 사용법

#### git pull --rebase

```bash
# merge 대신 rebase로 원격 변경사항 가져오기
git pull --rebase

# 또는 fetch + rebase
git fetch
git rebase origin/master
```

`git pull --rebase`를 사용하면 불필요한 merge 커밋 없이 깔끔한 히스토리를 유지할 수 있습니다.

### 7.2 기본 설정 변경

#### Pull 기본 동작을 rebase로 설정

```bash
# 전역적으로 pull의 기본 동작을 rebase로 설정
git config --global pull.rebase true

# 특정 저장소에서만 설정
git config pull.rebase true
```

## 8. Rebase vs Merge: 어떤 것을 선택할까?

### 8.1 Rebase를 선택하는 경우

- 깔끔하고 선형적인 히스토리를 원할 때
- 코드 리뷰나 히스토리 추적이 중요할 때
- 개인 작업 브랜치를 정리할 때

### 8.2 Merge를 선택하는 경우

- 실제 개발 과정을 보존하고 싶을 때
- 브랜치의 맥락이 중요할 때
- 팀 작업에서 안전성을 우선시할 때

:::tip[최적의 워크플로우]

**로컬에서는 rebase, 공유할 때는 merge**

- 로컬 작업을 정리할 때는 rebase를 사용하여 깔끔한 히스토리를 만들고
- 팀과 공유하는 브랜치에서는 merge를 사용하여 안전성을 확보하세요

:::

## 9. 실무에서의 Rebase 활용

### 9.1 Feature 브랜치 정리

#### 푸시 전 커밋 정리

```bash
# feature 브랜치에서 작업 완료 후
git rebase -i HEAD~5  # 최근 5개 커밋 정리
git rebase master     # master의 최신 변경사항 반영
```

### 9.2 팀 워크플로우에서의 활용

- 개인 브랜치에서는 자유롭게 rebase 사용
- 공유 브랜치에 merge하기 전에 히스토리 정리
- 코드 리뷰 과정에서 깔끔한 커밋 히스토리 제공

## 10. 마치며

- Rebase는 Git의 강력한 기능 중 하나로, 올바르게 사용하면 프로젝트의 히스토리를 훨씬 깔끔하게 관리할 수 있습니다.
- 하지만 잘못 사용하면 팀원들과의 협업에 심각한 문제를 일으킬 수 있으므로, 기본 원칙을 반드시 지켜야 합니다.
- 개인 작업에서는 적극적으로 활용하되, 공유된 커밋에 대해서는 신중하게 접근하는 것이 중요합니다.

:::info[핵심 정리]

- **Rebase는 커밋 히스토리를 선형으로 정리하는 도구입니다**
- **로컬 작업에서는 자유롭게, 공유된 커밋에서는 절대 사용하지 마세요**
- **팀과의 협업에서는 명확한 규칙을 정하고 사용하세요**

:::

## 참고

- https://git-scm.com/book/en/v2/Git-Branching-Rebasing