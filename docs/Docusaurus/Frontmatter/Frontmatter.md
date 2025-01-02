## 1. 프론트매터(Frontmatter)
- 프론트매터란 문서의 메타데이터를 정의하는 방식으로, 문서의 제목, 작성자, 작성일 등의 정보를 포함합니다. 
- 프론트매터는 문서의 내용과 분리되어 작성되며, 문서의 특정 정보를 추출하거나 표시하는 데 사용됩니다.
- 도큐사우루스(Docusaurus)의 프론트매터는 마크다운 파일 상단에 위치하며, YAML 형식으로 작성됩니다. 

:::tip
프론트매터는 반드시 파일의 맨 처음에 위치해야 하며, 시작과 끝을 나타내는 하이픈 사이에 공백이 없어야 합니다.
:::

## 2. 주요 속성
- 프론트매터에는 다양한 속성을 지정할 수 있으며, 주요 속성은 다음과 같습니다.

### 2.1 일반적인 속성
- title: 페이지의 제목을 지정합니다.
- description: 페이지에 대한 간단한 설명을 제공합니다.
- id: 문서의 고유 식별자를 설정합니다.
- slug: URL 경로를 커스터마이즈합니다.

### 2.2 블로그 관련 속성
- date: 블로그 포스트의 작성 날짜를 지정합니다 (예: 2023-01-01 또는 2023-01-01T10:00).
- authors: 작성자 정보를 설정합니다. 단일 작성자 또는 여러 작성자를 지정할 수 있습니다.
- tags: 블로그 포스트에 태그를 추가합니다.

### 2.3 문서 관련 속성
- sidebar_position: 사이드바에서의 문서 순서를 지정합니다.
- sidebar_label: 사이드바에 표시될 문서의 레이블을 설정합니다.

### 2.4 메타데이터 및 SEO
- keywords: 검색 엔진 최적화를 위한 키워드를 추가합니다.
- image: 소셜 미디어 공유 시 사용될 이미지를 지정합니다.

### 3. 예시
```yaml
---
title: "도큐사우루스로 기술 문서 작성하기"
description: "도큐사우루스를 사용하여 효과적인 기술 문서를 작성하는 방법을 단계별로 알아봅니다."
id: docusaurus-technical-writing
slug: /tutorials/docusaurus-technical-writing
date: 2024-01-02T10:00
authors:
  - name: John Doe
    title: Technical Writer
    url: https://github.com/johndoe
    image_url: https://github.com/johndoe.png
tags: ["DOCUSAURUS", "DOCUMENTATION", "TECHNICAL_WRITING"]
keywords:
  - 도큐사우루스
  - 기술문서
  - technical writing
  - documentation
sidebar_position: 1
sidebar_label: "기술 문서 작성"
---
```
