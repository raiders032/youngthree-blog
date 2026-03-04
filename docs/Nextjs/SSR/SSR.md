---
title: "SSR (Server-Side Rendering)"
description: "Next.js에서 서버 사이드 렌더링(SSR)의 개념, 특징, Pages/App Router 사용법을 정리합니다."
keywords: ["Next.js", "SSR", "서버 사이드 렌더링", "getServerSideProps", "동적 렌더링"]
tags: ["Next.js", "Frontend", "React"]
hide_title: true
last_update:
  date: 2025-03-04
  author: youngthree
---

## 1 SSR이란

- **SSR(Server-Side Rendering)**은 **매 요청마다** 서버에서 HTML을 만들어 응답하는 방식입니다.
- 사용자 요청 → 서버에서 데이터 조회·렌더링 → HTML 전달 → 클라이언트에서 hydrate.
- CSR(Client-Side Rendering)과 달리, 첫 응답에 이미 콘텐츠가 포함된 HTML이 옵니다.

## 2 특징

| 장점 | 단점 |
|------|------|
| **항상 최신 데이터**: 요청 시점에 데이터를 가져와 실시간에 가깝게 제공 | TTFB가 길어질 수 있음 |
| **SEO**: 검색엔진이 완성된 HTML을 수집 가능 | 서버 부하가 요청 수에 비례 |
| **개인화**: 쿠키·헤더로 사용자별 다른 HTML 제공 가능 | 빌드 시 생성이 없어 CDN 캐시 이점이 제한적 |

- 실시간성·개인화·SEO가 모두 필요할 때 SSR을 고려합니다.

## 3 Pages Router 사용법

### 3.1 getServerSideProps

- 페이지에서 `getServerSideProps`를 export하면 해당 페이지는 **매 요청마다** 서버에서 실행됩니다.

```js
// pages/post/[id].js
export async function getServerSideProps(context) {
  const { id } = context.params;
  const res = await fetch(`https://api.example.com/posts/${id}`);
  const post = await res.json();

  return {
    props: { post },
  };
}

export default function Post({ post }) {
  return <article>{post.title}</article>;
}
```

- `context`: `params`, `req`, `res`, `query`, `resolvedUrl` 등 제공.
- `revalidate` 같은 옵션은 없으며, 항상 요청 시 실행됩니다.

### 3.2 쿠키·헤더 활용 (개인화)

```js
export async function getServerSideProps(context) {
  const { req } = context;
  const token = req.cookies.token;
  const res = await fetch('https://api.example.com/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const user = await res.json();

  return {
    props: { user },
  };
}
```

## 4 App Router 사용법

### 4.1 기본: 서버 컴포넌트

- App Router에서는 **기본이 서버 컴포넌트**입니다. 
- `async` 페이지에서 직접 fetch 후 렌더링하면 SSR과 동일하게 동작합니다.
- **동적 렌더링**이 되려면: `cookies()`, `headers()`, `searchParams` 등 동적 API를 사용하거나, `dynamic = 'force-dynamic'`을 지정합니다.
- 이들을 쓰지 않고 `fetch`만 하면 기본적으로 **정적 생성**이 됩니다.

### 4.2 동적 렌더링 보장

```tsx
// app/post/[id]/page.tsx
export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: { params: { id: string } }) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`);
  const post = await res.json();
  return <article>{post.title}</article>;
}
```

### 4.3 쿠키·헤더로 개인화

```tsx
// app/dashboard/page.tsx
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const res = await fetch('https://api.example.com/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const user = await res.json();

  return <div>Hello, {user.name}</div>;
}
```

- `cookies()`, `headers()` 사용 시 해당 라우트는 자동으로 동적 렌더링(SSR)됩니다.

## 5 언제 쓰면 좋은지

- **실시간/최신 데이터**가 꼭 필요할 때 (주식, 경매, 대시보드 등).
- **사용자별로 다른 화면**이 필요할 때 (로그인 정보, 권한 기반 UI).
- **SEO**가 중요하면서도 **콘텐츠가 요청마다 달라져야** 할 때.
- 반대로, 변경이 거의 없는 공개 페이지는 SSG나 ISR이 더 적합합니다.
