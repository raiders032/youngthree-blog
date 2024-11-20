---
title: "도큐사우루스 Admonitions 가이드"
description: "도큐사우루스의 Admonitions 기능을 상세히 알아봅니다. 기본 사용법부터 커스터마이징까지 실제 예제와 함께 설명합니다. 기술 문서를 더 효과적으로 작성하고 싶은 개발자를 위한 실용적인 가이드입니다."
tags: ["DOCUSAURUS", "MARKDOWN", "DOCUMENTATION", "FRONTEND", "REACT", "WEB"]
keywords: ["도큐사우루스", "Docusaurus", "어드모니션", "Admonitions", "마크다운", "Markdown", "기술문서", "Technical Documentation", "노트", "팁", "경고", "위험", "정보"]
draft: false
hide_title: true
---

## 1. Admonitions 소개

- 도큐사우러스의 Admonitions는 문서에서 중요한 정보를 강조하고 구조화하는 강력한 기능입니다. 
- 기본 마크다운 문법을 확장하여 다양한 종류의 알림박스를 만들 수 있습니다.
- 노트, 팁, 경고, 위험 등 다양한 타입을 지원하며, 사용자 정의 타입도 추가할 수 있습니다.

## 2. 기본 사용법

### 2.1 기본 구문

- Admonitions는 세 개의 콜론(`:::`)으로 시작하고 끝나며, 타입을 지정하여 사용합니다.
- 타입에는 `note`, `tip`, `info`, `warning`, `danger` 등이 있습니다.
- 블록 안에서는 마크다운 문법을 사용할 수 있습니다.

예시:

```markdown
:::note

여기에 내용을 작성합니다. **마크다운** _문법을_ 사용할 수 있습니다.

:::
```

:::note

여기에 내용을 작성합니다. **마크다운** _문법을_ 사용할 수 있습니다.

:::

### 2.2 지원하는 타입

- `note`: 일반적인 노트
- `tip`: 유용한 팁이나 트릭
- `info`: 추가 정보
- `warning`: 주의사항
- `danger`: 위험 요소나 주의해야 할 심각한 문제

#### 2.2.1 타입별 예시

```markdown
:::tip

유용한 팁을 알려드립니다!

:::

:::warning

이 부분을 주의하세요!

:::

:::danger

심각한 문제가 발생할 수 있습니다!

:::
```
:::tip

유용한 팁을 알려드립니다!

:::

:::warning

이 부분을 주의하세요!

:::

:::danger

심각한 문제가 발생할 수 있습니다!

:::

## 3. 고급 기능

### 3.1 제목 지정하기

- 대괄호를 사용하여 Admonition의 제목을 지정할 수 있습니다.

```markdown
:::note[나만의 제목]

제목이 있는 노트입니다.

:::
```
:::note[나만의 제목]

제목이 있는 노트입니다.

:::

### 3.2 중첩 사용

- Admonitions는 중첩해서 사용할 수 있습니다. 
- 콜론의 개수로 레벨을 구분합니다.

```markdown
:::::info[Parent]

Parent content

::::danger[Child]

Child content

:::tip[Deep Child]

Deep child content

:::

::::

:::::
```
:::::info[Parent]

Parent content

::::danger[Child]

Child content

:::tip[Deep Child]

Deep child content

:::

::::

:::::

## 4. 실전 팁

### 4.1 Prettier 사용 시 주의사항

- Prettier로 마크다운 파일을 포맷팅할 때, Admonitions 문법이 깨질 수 있습니다. 
- 이를 방지하기 위해 시작과 끝 지시자 주위에 빈 줄을 추가하세요.

```markdown
<!-- 권장 방식 -->
:::note

내용을 작성합니다.

:::

<!-- 권장하지 않는 방식 -->
:::note
내용을 작성합니다.
:::
```

### 4.2 효과적인 사용 방법

- `note`: 일반적인 부가 설명에 사용
- `tip`: 생산성을 높이는 팁이나 모범 사례 공유
- `info`: 추가적인 배경 정보나 관련 지식 제공
- `warning`: 잠재적인 문제나 주의사항 안내
- `danger`: 심각한 오류나 보안 문제 경고

## 5. 마치며

- Admonitions는 도큐사우러스에서 문서를 더 효과적으로 작성할 수 있게 도와주는 강력한 도구입니다.
- 적절히 활용하면 문서의 가독성과 사용자 경험을 크게 향상시킬 수 있습니다. 