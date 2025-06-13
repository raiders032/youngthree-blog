## 1. git diff

- Git diff는 커밋 간, 커밋과 작업 트리 간, 또는 두 파일 간의 변경사항을 보여주는 명령어입니다.

## 2. 예시

```bash
git diff
```

- 위 명령어는 현재 작업 디렉토리와 스테이징 영역을 비교합니다.

```bash
git diff --cached
gir diff --staged
```

- 위 명령어는 커밋 전 변경사항을 확인할 때 사용합니다.
- 스테이징 영역과 마지막 커밋을 비교하여 변경된 내용을 보여줍니다.
  - 즉 Staging Area와 Repository을 비교합니다
- `--cached` 또는 `--staged` 옵션은 같은 의미로, 스테이징 영역의 변경사항을 보여줍니다.

```bash
git diff HEAD
```

- 위 명령어는 현재 작업 디렉토리와 마지막 커밋을 비교합니다.
- 즉 Working Directory와 Repository을 비교합니다.