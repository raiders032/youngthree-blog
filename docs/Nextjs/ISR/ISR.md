---
title: "ISR (Incremental Static Regeneration)"
description: "Next.js에서 증분 정적 재생성(ISR)의 개념, revalidate 동작, Pages/App Router 사용법과 온디맨드 재생성을 정리합니다."
keywords: ["Next.js", "ISR", "증분 정적 재생성", "revalidate", "getStaticProps", "온디맨드 재생성"]
tags: ["Next.js", "Frontend", "React"]
hide_title: true
last_update:
  date: 2025-03-04
  author: youngthree
---

## 1 ISR이란

**ISR(Incremental Static Regeneration)**은 페이지를 **정적으로 생성**하되, 일정 시간이 지나거나 특정 트리거 후 **백그라운드에서 다시 생성**해 점진적으로 갱신하는 방식입니다.

- **빌드 시**: SSG처럼 최초 HTML 생성.
- **revalidate 경과 후**: 다음 요청에서 기존 HTML을 먼저 반환하고, 백그라운드에서 재생성. 완료 후부터 새 HTML 서빙.
- SSG의 속도·캐시 이점을 유지하면서, 주기적으로 최신 데이터로 갱신할 수 있습니다.

## 2 특징

| 장점 | 단점 |
|------|------|
| **빌드 부담 분산**: 모든 경로를 빌드 시 만들 필요 없이, 필요 시점에 생성·갱신 가능 | revalidate 구간 동안은 이전 데이터가 노출될 수 있음 |
| **빠른 응답**: 정적 HTML을 CDN에서 서빙 | “실시간”이 꼭 필요하면 SSR이 더 적합 |
| **주기적 갱신**: revalidate 초 단위로 백그라운드 재생성 | 재생성 중 트래픽이 몰리면 서버 부하 증가 가능 |

- **온디맨드 재생성**: revalidate 시간을 기다리지 않고, API 호출로 특정 경로만 즉시 재생성할 수 있습니다 (CMS 웹훅, 관리자 액션 등).

## 3 revalidate 동작

- **revalidate: 60** 이면 “이 페이지는 최대 60초 동안 캐시된 HTML을 쓰고, 60초가 지난 뒤 **첫 번째로 들어온 요청**에서 기존 HTML을 먼저 보내준 다음, 백그라운드에서 새 HTML을 만든다”는 의미입니다.
- 재생성이 끝나기 전에 들어오는 요청은 계속 기존(stale) HTML을 받습니다.
- 재생성은 **요청이 들어올 때만** 트리거되므로, 트래픽이 없으면 갱신이 지연될 수 있습니다.

## 4 Pages Router 사용법

### 4.1 revalidate 지정

`getStaticProps` 반환 객체에 `revalidate`(초 단위)를 넣으면 해당 페이지가 ISR로 동작합니다.

```js
// pages/post/[id].js
export async function getStaticProps(context) {
  const { id } = context.params;
  const res = await fetch(`https://api.example.com/posts/${id}`);
  const post = await res.json();

  return {
    props: { post },
    revalidate: 60, // 60초마다 최대 1회 백그라운드 재생성
  };
}

export async function getStaticPaths() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  const paths = posts.map((p) => ({ params: { id: String(p.id) } }));

  return {
    paths,
    fallback: 'blocking', // 미리 생성 안 된 경로는 첫 요청 시 생성 후 캐시
  };
}

export default function Post({ post }) {
  return <article>{post.title}</article>;
}
```

- `fallback: 'blocking'`으로 `getStaticPaths`에 없는 경로도 첫 요청 시 서버에서 생성·캐시할 수 있습니다. 이후에는 revalidate 주기에 따라 갱신됩니다.

### 4.2 온디맨드 재생성 (Pages Router)

`getStaticProps`와 별도로, 재생성을 트리거하는 API 라우트를 둘 수 있습니다. Next.js 12.2+에서는 `revalidatePath` / `revalidateTag`(App Router)를 주로 사용합니다. Pages Router에서는 예전 방식으로 해당 경로를 재검증하는 API를 호출하는 패턴을 씁니다.

(실제 트리거는 배포 환경에 따라 다르며, Vercel 등에서는 On-Demand Revalidation API를 사용합니다.)

## 5 App Router 사용법

### 5.1 라우트 단위 revalidate

페이지에서 `revalidate`를 export하면 해당 라우트 전체에 적용됩니다.

```tsx
// app/post/[id]/page.tsx
export const revalidate = 60; // 60초

export default async function PostPage({ params }: { params: { id: string } }) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`);
  const post = await res.json();
  return <article>{post.title}</article>;
}
```

### 5.2 fetch 단위 revalidate

`revalidate`를 페이지가 아니라 **데이터 요청 단위**로 두고 싶으면 `fetch`의 `next.revalidate`를 사용합니다.

```tsx
// app/post/[id]/page.tsx
export default async function PostPage({ params }: { params: { id: string } }) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`, {
    next: { revalidate: 60 },
  });
  const post = await res.json();
  return <article>{post.title}</article>;
}
```

- 같은 페이지 안에서 요청마다 다른 revalidate를 줄 수 있습니다 (예: 메인 콘텐츠 60초, 부가 데이터 300초).

### 5.3 온디맨드 재생성 (App Router)

특정 경로만 즉시 재생성하려면 서버 액션 또는 API 라우트에서 `revalidatePath` / `revalidateTag`를 호출합니다.

```tsx
// app/actions.ts
import { revalidatePath } from 'next/cache';

export async function revalidatePost(id: string) {
  revalidatePath(`/post/${id}`);
}
```

- CMS 웹훅에서 이 액션을 호출하거나, 관리자 “갱신” 버튼에 연결하면 revalidate 주기를 기다리지 않고 해당 페이지만 갱신됩니다.
- `revalidateTag(tag)`로 태그 단위 캐시를 무효화할 수도 있습니다. `fetch(..., { next: { tags: ['posts'] } })`와 함께 사용합니다.

## 6 언제 쓰면 좋은지

- **자주 바뀌는 공개 페이지**이지만, 요청마다 서버 렌더링(SSR)까지는 부담될 때 (뉴스, 상품 목록, 블로그 등).
- **경로가 매우 많은 사이트**에서 빌드 시 전부 생성하기 어렵고, 첫 방문 시 생성 + 주기적 갱신으로 운영하고 싶을 때.
- **갱신 시점을 제어**하고 싶을 때: 주기(revalidate) + 필요 시 온디맨드 재생성.

항상 최신이어야 하거나 사용자별로 다른 화면이 필요하면 **SSR**, 변경이 거의 없으면 **SSG**가 더 적합합니다.
