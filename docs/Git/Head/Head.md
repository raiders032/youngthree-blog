## 1. Head

- Git에서 HEAD는 현재 체크아웃된 커밋을 가리키는 포인터입니다.

## 2. HEAD의 정체

- `HEAD`의 정체를 이해하기 위해 물리적 구현을 살펴보겠습니다.
- `HEAD`는 `.git/HEAD` 파일에 저장되어 있습니다.

```bash
cat .git/HEAD
ref: refs/heads/feat/ys/git-demo

cat .git/refs/heads/feat/ys/git-demo               
e1e7bb8dc6e38b373f3997b26503f45adfbd4fe2
```