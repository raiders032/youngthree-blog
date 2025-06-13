---
title: "Git 명령어 치트 시트"
description: "Git에서 커밋을 수정하고 되돌리는 다양한 방법을 정리한 실용적인 치트 시트입니다. git commit --amend, git reset, git rebase를 활용한 커밋 히스토리 관리 방법과 복구 기법까지 상세히 설명합니다."
tags: ["GIT", "VERSION_CONTROL", "DEVELOPMENT_TOOLS", "COMMAND_LINE", "BACKEND"]
keywords: ["git", "깃", "커밋", "commit", "수정", "되돌리기", "reset", "amend", "rebase", "치트시트", "cheat sheet", "git 명령어", "버전관리", "version control", "git reset --hard", "git reset --soft", "git reflog", "커밋 복구"]
draft: false
hide_title: true
---

## Git 커밋 수정하기 치트 시트

## 1. 마지막 커밋 수정하기

### 1.1 커밋 메시지만 수정하기

- 가장 최근 커밋의 메시지만 변경할 때 사용합니다.

```bash
git commit --amend -m "새로운 커밋 메시지"
```

- 에디터를 열어서 메시지를 수정하려면 `-m` 옵션 없이 사용합니다.

```bash
git commit --amend
```

:::tip 에디터 관련 팁

에디터가 vim으로 열린다면 `i`를 눌러 입력 모드로 전환하고, 수정 후 `Esc`를 누른 다음 `:wq`를 입력하여 저장하고 종료합니다.

:::

### 1.2 파일 추가하면서 커밋 수정하기

- 빠뜨린 파일이나 추가 변경사항을 마지막 커밋에 포함시킬 때 사용합니다.

```bash
# 빠뜨린 파일 스테이징
git add forgotten-file.txt

# 마지막 커밋에 포함시키기 (메시지 수정)
git commit --amend

# 또는 메시지 변경 없이
git commit --amend --no-edit
```

:::warning 주의사항

`git commit --amend`는 기존 커밋을 완전히 새로운 커밋으로 교체합니다. 이미 원격 저장소에 푸시된 커밋을 수정한 경우 강제 푸시(`git push --force`)가 필요할 수 있습니다.

:::

## 2. 이전 커밋들 수정하기(rebase)

- 이전 커밋을 수정하려면 `rebase -i` 명령어를 사용합니다.
	- 최신 커밋을 수정할 때는 git commit --amend를 사용할 수 있습니다.
- rebase를 사용하면 커밋 히스토리가 변경되므로, 이미 푸시된 커밋을 수정할 때는 팀원들과 협의가 필요합니다

### 2.1 백업 브랜치 생성

- 중요한 작업 전에는 항상 백업을 만들어두는 것이 좋습니다.

```bash
# 수정 전 백업
git branch backup-branch

# 수정 작업 수행
git rebase -i HEAD~3

# 문제 발생시 복구
git reset --hard backup-branch
```

### 2.2 최근 n개의 커밋 수정하기

- 여러 커밋을 한 번에 수정하거나 정리할 때 사용합니다.

```bash
# 최근 3개 커밋을 인터랙티브하게 수정
git rebase -i HEAD~3

# 이후 에디터가 열리면 수정할 커밋을 선택합니다.
pick 7ee1762 4
pick 9f1a8db 5
pick 464b89c 6

# Rebase f9f3985..464b89c onto f9f3985 (3 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup <commit> = like "squash", but discard this commit's log message
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
# .       create a merge commit using the original merge commit's
# .       message (or the oneline, if no original merge commit was
# .       specified). Use -c <commit> to reword the commit message.
#
# These lines can be re-ordered; they are executed from top to bottom.
```

- 위 명령어를 실행하면 에디터가 열리고, 최근 3개의 커밋 목록이 표시됩니다.
- 각 커밋 앞에 있는 명령어를 변경하여 원하는 작업을 수행할 수 있습니다.

```bash
# 이후 에디터가 열리면 수정할 커밋을 선택합니다.
pick 7ee1762 4
pick 9f1a8db 5
r 464b89c 6

# Rebase f9f3985..464b89c onto f9f3985 (3 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup <commit> = like "squash", but discard this commit's log message
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
# .       create a merge commit using the original merge commit's
# .       message (or the oneline, if no original merge commit was
# .       specified). Use -c <commit> to reword the commit message.
#
# These lines can be re-ordered; they are executed from top to bottom.
```

- 464b89c 커밋의 메시지를 수정하려면 `reword` 명령어를 사용합니다. 줄여서 `r`로 표시할 수 있습니다.
- 에디터를 저장하고 종료하면, Git이 해당 커밋을 수정하기 위해 멈춥니다.

```bash
666
# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# Date:      Fri Jun 13 00:00:31 2025 +0900
#
# interactive rebase in progress; onto f9f3985
# Last commands done (3 commands done):
#    pick 9f1a8db 5
#    reword 464b89c 6
# No commands remaining.
# You are currently editing a commit while rebasing branch 'master' on 'f9f3985'.
#
# Changes to be committed:
#       modified:   REAM.md
#
# Untracked files:
#       asdfsadf
#
"~/Desktop/project/study/git-demo/.git/COMMIT_EDITMSG" 20L, 603B
```

- 이제 에디터가 열리면 커밋 메시지를 수정할 수 있습니다.

#### 2.2.1 에디터에서 나타나는 옵션들

에디터에서 각 커밋 앞의 명령어를 변경하여 다양한 작업을 수행할 수 있습니다.

```bash
# 예시 화면:
# pick a1b2c3d 첫 번째 커밋
# pick e4f5g6h 두 번째 커밋  
# pick i7j8k9l 세 번째 커밋
```

**사용 가능한 명령어:**

- `pick (p)`: 커밋을 그대로 유지
- `reword (r)`: 커밋 메시지만 변경
- `edit (e)`: 커밋을 수정하기 위해 멈춤
- `squash (s)`: 이전 커밋과 합치기 (메시지 결합)
- `fixup (f)`: 이전 커밋과 합치되 메시지는 버리기
- `drop (d)`: 커밋 삭제

## 3. reset 명령어 사용하기

### 3.1 reset 옵션별 차이점

- Git reset은 세 가지 주요 옵션이 있으며, 각각 다른 영역에 영향을 미칩니다.
- reset 명령으로 삭제된 커밋을 복구하고 싶다면 `git reflog`를 사용해야 합니다.

#### 3.1.1 git reset --soft

- HEAD만 이동시키고 스테이징 영역과 작업 디렉토리는 그대로 유지합니다.
- 커밋만 취소하고 변경사항은 스테이징된 상태로 보존됩니다.

```bash
git reset --soft HEAD~1
```

#### 3.1.2 git reset --mixed (기본값)

- HEAD와 스테이징 영역을 초기화하지만 작업 디렉토리는 유지합니다.
- 커밋과 스테이징을 취소하지만 파일 변경사항은 보존됩니다.

```bash
git reset HEAD~1
# 또는
git reset --mixed HEAD~1
```

#### 3.1.3 git reset --hard

- HEAD, 스테이징 영역, 작업 디렉토리를 모두 초기화합니다.
- 모든 변경사항이 완전히 삭제됩니다.

```bash
git reset --hard HEAD~1
```

:::danger 위험!

`git reset --hard`는 작업 디렉토리의 모든 변경사항을 삭제합니다. 사용하기 전에 중요한 변경사항이 없는지 반드시 확인하세요.

:::

### 3.2 여러 커밋 삭제하기

#### 3.2.1 최근 n개의 커밋 완전 삭제

```bash
# 최근 3개 커밋을 완전히 삭제
git reset --hard HEAD~3
```

#### 3.2.2 커밋은 삭제하되 변경사항은 스테이징 영역에 보존

```bash
# 최근 3개 커밋을 삭제하지만 변경사항은 스테이징된 상태로 유지
git reset --soft HEAD~3
```

#### 3.2.3 커밋과 스테이징은 삭제하되 파일 변경사항은 보존

```bash
# 최근 3개 커밋을 삭제하고 변경사항은 작업 디렉토리에 언스테이징된 상태로 유지
git reset HEAD~3
```

## 4. 삭제된 커밋 복구하기

### 4.1 git reflog 사용하기

- Git reflog는 HEAD의 변경 이력을 보여주어 삭제된 커밋을 복구할 수 있게 해줍니다.

```bash
# reflog 확인
git reflog
```

#### 4.1.1 reflog 출력 예시

```bash
a1b2c3d HEAD@{0}: reset: moving to HEAD~1
e4f5g6h HEAD@{1}: commit: 삭제된 커밋
i7j8k9l HEAD@{2}: commit: 이전 커밋
```

### 4.2 커밋 복구 방법

#### 4.2.1 특정 커밋으로 되돌리기

```bash
# 특정 커밋 해시로 되돌리기
git reset --hard e4f5g6h

# 또는 reflog 참조 사용
git reset --hard HEAD@{1}
```

:::info reflog 보존 기간

Git reflog는 기본적으로 90일 동안 유지됩니다. 시간이 너무 오래 지나면 복구가 불가능할 수 있으므로 가능한 빨리 복구 작업을 수행하세요.

:::

## 5. untracked 파일 처리하기

### 5.1 untracked 제거하기

- Git에서 추적되지 않는(untracked) 파일을 제거하려면 `git clean` 명령어를 사용합니다.
- git clean으로 삭제된 파일은 Git 히스토리에 없으므로 복구 불가합니다.
- 반드시 -n 옵션으로 먼저 확인해야 합니다.

```bash
# 지워질 파일들 미리 확인 (실제로 지우지 않음)
git clean -n

# 또는
git clean --dry-run

# untracked 파일들 삭제
git clean -f

# untracked 디렉토리까지 삭제
git clean -fd
```

## 6. 작업 내용 임시 저장하기

- 작업 중인 내용을 임시로 저장하고 나중에 복구할 때는 `git stash` 명령어를 사용합니다.
- 작업 도중 브랜치를 변경할 때 유용합니다.
  - working directory와 staging area의 변경사항을 임시로 저장하고 깨끗한 상태로 되돌립니다.
  - 이후 브랜치를 변경한 후 작업을 완료합니다.
  - 다시 원래 브랜치로 돌아와서 `git stash pop` 명령어로 임시 저장된 작업 내용을 복구합니다.

### 6.1 stash 사용하기

```bash
# 현재 working directory와 staging area의 변경사항이 있는 상태
git status       
On branch test
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   asdfsadf

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   asdfsadf


# 다른 브랜치로 이동이 불가능함
git switch master
error: Your local changes to the following files would be overwritten by checkout:
        asdfsadf
Please commit your changes or stash them before you switch branches.
Aborting

#  임시로 작업 내용을 저장
git stash push -m "try1"   
Saved working directory and index state On test: try1

#  working directory와 staging area가 깨끗한 상태로 되돌아감
git status              
On branch test
nothing to commit, working tree clean

# 다른 브랜치로 이동 가능
git switch master

# 작업 완료 후 원래 브랜치로 돌아옴
git switch test

# 임시 저장된 작업 내용 복구
git stash pop           
On branch test
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   asdfsadf

no changes added to commit (use "git add" and/or "git commit -a")
Dropped refs/stash@{0} (15c43149b43c0221d739a030505e09d3190aa843)

# 작업 내용이 working directory에 복구 됨 
git status              
On branch test
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   asdfsadf

no changes added to commit (use "git add" and/or "git commit -a")
```


## 7. 실전 팁과 주의사항

### 7.1 안전한 Git 사용을 위한 팁

- **백업 습관**: 중요한 작업 전에는 항상 백업 브랜치를 생성하세요.
- **자주 커밋**: 작은 단위로 자주 커밋하여 손실 위험을 줄이세요.
- **원격 저장소 활용**: 정기적으로 원격 저장소에 푸시하여 백업을 유지하세요.

### 7.2 공유된 브랜치에서 주의사항

- 다른 팀원과 공유하는 브랜치에서는 `git reset --hard`나 `git commit --amend` 사용을 피하세요.
- 이미 푸시된 커밋을 수정할 때는 팀원과 사전 협의가 필요합니다.
- 강제 푸시(`git push --force`) 대신 `git push --force-with-lease`를 사용하는 것이 더 안전합니다.

### 7.3 복구 불가능한 상황

- 커밋되지 않은 변경사항은 `git reset --hard` 후 복구가 불가능합니다.
- `git stash`를 활용하여 임시 변경사항을 보관하는 습관을 기르세요.

```bash
# 임시 변경사항 보관
git stash

# 위험한 작업 수행
git reset --hard HEAD~3

# 필요시 변경사항 복구
git stash pop
```