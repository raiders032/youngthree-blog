---
title: "도큐사우루스 프론트매터 필드 가이드"
description: "도큐사우루스의 모든 프론트매터 필드에 대한 상세 설명과 사용법을 다룹니다. 문서 작성에 필요한 메타데이터 설정부터 SEO, 사이드바 구성까지 완벽 가이드."
tags: [ "DOCUSAURUS", "MARKDOWN", "DOCUMENTATION", "FRONTEND", "REACT", "WEB" ]
keywords: [ "도큐사우루스", "프론트매터", "메타데이터", "문서작성", "기술문서", "Docusaurus", "Frontmatter", "Documentation", "Technical Writing" ]
draft: false
hide_title: true
---

## 1. 기본 식별자 및 문서 정보

### id

- **타입**: string
- **기본값**: 확장자를 제외한 파일 경로
- **설명**: 문서의 고유 식별자

### title

- **타입**: string
- **기본값**: 마크다운 제목 또는 id
- **설명**: 문서의 제목. 페이지 메타데이터와 여러 곳에서 대체값으로 사용
- **특징**: 마크다운에 제목이 없으면 자동으로 문서 상단에 추가됨

### title_meta

- **타입**: string
- **기본값**: frontMatter.title
- **설명**: SEO를 위한 메타데이터 제목 (`<head>`의 `<title>`, og:title)
- **용도**: 표시되는 제목과 SEO 제목이 다를 때 사용

## 2. 사이드바 및 네비게이션

### pagination_label

- **타입**: string
- **기본값**: sidebar_label 또는 title
- **설명**: 이전/다음 문서 버튼에 표시되는 텍스트

### sidebar_label

- **타입**: string
- **기본값**: title
- **설명**: 사이드바에 표시되는 문서 레이블

### sidebar_position

- **타입**: number
- **기본값**: 기본 정렬 순서
- **설명**: 자동 생성된 사이드바 항목에서의 문서 위치 제어

### sidebar_class_name

- **타입**: string
- **기본값**: undefined
- **설명**: 자동 생성된 사이드바에서 특정 레이블에 클래스 이름 부여

### sidebar_custom_props

- **타입**: object
- **기본값**: undefined
- **설명**: 사이드바 항목에 커스텀 props 할당

### displayed_sidebar

- **타입**: string
- **기본값**: undefined
- **설명**: 현재 문서 브라우징 시 특정 사이드바 강제 표시

## 3. 문서 표시 설정

### hide_title

- **타입**: boolean
- **기본값**: false
- **설명**: 프론트매터로 선언된 제목 숨김 (마크다운 제목에는 영향 없음)

### hide_table_of_contents

- **타입**: boolean
- **기본값**: false
- **설명**: 우측 목차 숨김 여부

### toc_min_heading_level

- **타입**: number
- **기본값**: 2
- **설명**: 목차에 표시될 최소 헤딩 레벨 (2-6 사이, max값 이하)

### toc_max_heading_level

- **타입**: number
- **기본값**: 3
- **설명**: 목차에 표시될 최대 헤딩 레벨 (2-6 사이)

## 4. 페이지네이션 및 편집

### pagination_next

- **타입**: string | null
- **기본값**: 사이드바의 다음 문서
- **설명**: "다음" 페이지네이션 링크 대상 문서 ID (null로 비활성화 가능)

### pagination_prev

- **타입**: string | null
- **기본값**: 사이드바의 이전 문서
- **설명**: "이전" 페이지네이션 링크 대상 문서 ID (null로 비활성화 가능)

### parse_number_prefixes

- **타입**: boolean
- **기본값**: numberPrefixParser 플러그인 옵션
- **설명**: 숫자 접두사 파싱 비활성화 여부

### custom_edit_url

- **타입**: string | null
- **기본값**: editUrl 플러그인 옵션으로 계산
- **설명**: 문서 편집 URL (null로 "이 페이지 편집" 비활성화 가능)

## 5. SEO 및 메타데이터

### keywords

- **타입**: string[]
- **기본값**: undefined
- **설명**: 검색 엔진용 키워드 메타 태그

### description

- **타입**: string
- **기본값**: 마크다운 첫 줄
- **설명**: 검색 엔진용 문서 설명 (`<meta name="description">`, og:description)

### image

- **타입**: string
- **기본값**: undefined
- **설명**: 소셜 미디어 링크 프리뷰용 이미지 (og:image)

## 6. URL 및 태그

### slug

- **타입**: string
- **기본값**: 파일 경로
- **설명**: 문서 URL 커스터마이징 (`/<routeBasePath>/<slug>`)
- **패턴**: 'my-doc', '/my/path/myDoc', '/.' 등 지원

### tags

- **타입**: Tag[]
- **기본값**: undefined
- **설명**: 문서 태그 목록 (문자열 또는 label/permalink 객체)
- **특징**: tags 파일의 키 참조 가능

## 7. 문서 상태

### draft

- **타입**: boolean
- **기본값**: false
- **설명**: 개발 환경에서만 접근 가능한 초안 문서 표시

### unlisted

- **타입**: boolean
- **기본값**: false
- **설명**: 프로덕션에서 숨겨지고 인덱싱되지 않는 문서
- **특징**: 직접 링크로만 접근 가능

### last_update

- **타입**: FrontMatterLastUpdate
- **기본값**: undefined
- **설명**: 마지막 업데이트 작성자/날짜 재정의
- **형식**: 파싱 가능한 날짜 문자열 사용 가능

:::tip
프론트매터 필드는 문서의 특성과 목적에 맞게 선택적으로 사용하세요. 모든 필드를 사용할 필요는 없습니다.
:::

:::warning
날짜 형식이나 숫자 범위 등 각 필드의 제약사항을 반드시 준수해야 합니다.
:::


## 참고

- https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter