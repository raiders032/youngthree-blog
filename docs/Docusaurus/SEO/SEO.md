---
title: Docusaurus SEO 가이드 검색엔진 최적화 설정하기
description: Docusaurus에서 제공하는 SEO 기능의 모든 것을 알아봅니다. 전역 메타데이터 설정부터 사이트맵 생성, 리치 검색 결과 최적화까지 상세히 설명합니다. Docusaurus로 검색엔진 친화적인 문서 사이트를 구축하는 방법을 단계별로 안내합니다.
date: 2024-11-20
tags: [DOCUSAURUS, SEO, STATIC_SITE, DOCUMENTATION, METADATA, REACT, JAVASCRIPT]
keywords: [Docusaurus, 도큐사우루스, 도큐사우루스 SEO, 검색엔진 최적화, SEO, 정적 사이트, 메타데이터, 사이트맵, robots.txt, 리치 검색, 시맨틱 마크업, 정적 사이트 생성기, 문서화, 기술 문서, 메타 태그, 검색 최적화]
draft: false
hide_title: true
---

## 1 Docusaurus SEO 소개

- Docusaurus는 다양한 방식으로 검색 엔진 최적화(SEO)를 지원합니다
- 이 글에서는 Docusaurus에서 SEO를 설정하는 방법에 대해 자세히 알아보겠습니다

## 2 전역 메타데이터 설정

- 사이트 전체에 적용되는 메타 속성을 설정할 수 있습니다
- docusaurus.config.js 파일에서 설정이 가능합니다
- 설정된 메타데이터는 모든 페이지의 HTML `<head>` 태그 안에 자동으로 포함됩니다

**메타데이터 설정 예시**
```javascript
export default {
  themeConfig: {
    metadata: [
      {name: 'keywords', content: 'cooking, blog'},
      {name: 'twitter:card', content: 'summary_large_image'},
    ],
  }
}
```

## 3 개별 페이지 메타데이터 설정

- 각 페이지별로 고유한 메타데이터를 설정할 수 있습니다
- Markdown 파일에서는 front matter를 사용합니다
- React 페이지에서는 `<Head>` 컴포넌트를 사용합니다

**Markdown 페이지 메타데이터 설정**
```markdown
---
title: 검색 엔진용 제목 (실제 제목과 다를 수 있음)
description: 페이지 설명
image: 소셜 미디어 카드용 썸네일 이미지
keywords: [키워드1, 키워드2, 키워드3]
---
```

## 4 정적 HTML 생성

- Docusaurus는 정적 사이트 생성기입니다
- 모든 URL 경로에 대해 정적 HTML 파일을 생성합니다
- 이를 통해 검색 엔진이 콘텐츠를 더 쉽게 발견할 수 있습니다

## 5 이미지 메타 설명

- 이미지의 alt 태그는 검색 엔진에게 이미지의 내용을 알려줍니다
- 스크린 리더 사용자나 이미지를 볼 수 없는 경우에도 유용합니다
- title 속성을 추가하여 마우스 호버 시 툴팁을 표시할 수 있습니다

**이미지 메타 설정 예시**
```markdown
![Docusaurus 배너](./assets/banner.png '이미지 제목')
```

## 6 리치 검색 정보

- Docusaurus 블로그는 리치 검색 결과를 기본적으로 지원합니다
- 블로그 포스트의 게시일, 작성자, 이미지 등의 메타 정보를 설정하면 활용됩니다
- 이를 통해 검색 결과에서 더 풍부한 정보를 제공할 수 있습니다

## 7 로봇 파일 설정

- robots.txt 파일을 통해 검색 엔진의 크롤링 동작을 제어할 수 있습니다
- static 폴더에 robots.txt 파일을 생성하여 설정합니다

**기본적인 robots.txt 예시**
```text
User-agent: *
Disallow:
```

## 8 사이트맵 파일

- @docusaurus/plugin-sitemap 플러그인이 기본으로 제공됩니다
- sitemap.xml 파일을 자동으로 생성합니다
- 프로덕션 빌드 후 https://example.com/[baseUrl]/sitemap.xml에서 확인 가능합니다
- 검색 엔진 크롤러가 사이트를 더 정확하게 크롤링하는데 도움을 줍니다

## 9 사람이 읽기 쉬운 링크

- Docusaurus는 파일 이름을 링크로 사용합니다
- slug를 사용하여 URL을 원하는 형태로 변경할 수 있습니다
- 이를 통해 더 의미 있고 기억하기 쉬운 URL을 만들 수 있습니다

## 10 구조화된 콘텐츠

- 검색 엔진은 HTML 마크업을 통해 웹페이지의 구조를 이해합니다
- Docusaurus는 시맨틱 마크업을 사용하여 페이지를 구성합니다
    - `<aside>`: 사이드바
    - `<nav>`: 내비게이션 바
    - `<main>`: 메인 콘텐츠
- CommonMark 문법은 대부분 해당하는 HTML 태그로 변환됩니다
- 일관된 Markdown 사용은 검색 엔진의 페이지 이해도를 높입니다

## 11 결론

- Docusaurus는 강력한 SEO 기능을 기본적으로 제공합니다
- 전역 및 개별 페이지 메타데이터 설정을 통해 세밀한 SEO 제어가 가능합니다
- 정적 HTML 생성, 사이트맵, 리치 검색 정보 등 다양한 SEO 최적화 기능을 활용할 수 있습니다
- 시맨틱 마크업과 구조화된 콘텐츠를 통해 검색 엔진의 콘텐츠 이해도를 높일 수 있습니다