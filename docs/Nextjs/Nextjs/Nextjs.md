---
title: "Next.js 렌더링 전략: SSR, SSG, ISR"
description: "Next.js의 서버 사이드 렌더링(SSR), 정적 생성(SSG), 증분 정적 재생성(ISR) 개념과 사용 시점을 정리합니다."
keywords: ["Next.js", "SSR", "SSG", "ISR", "렌더링", "getServerSideProps", "getStaticProps", "revalidate"]
tags: ["Next.js", "Frontend", "React"]
hide_title: true
last_update:
  date: 2025-03-04
  author: youngthree
---

## 1 개요

Next.js는 페이지 단위로 **어디서·언제** HTML을 만들지 선택할 수 있습니다. 대표적인 세 가지 방식은 **SSR**, **SSG**, **ISR**입니다.

| 방식 | HTML 생성 시점 | 적합한 용도 |
|------|----------------|-------------|
| **SSR** | 매 요청마다 서버에서 생성 | 실시간 데이터, 개인화, SEO + 최신성 |
| **SSG** | 빌드 시 한 번 생성 | 블로그, 랜딩, 변경 적은 콘텐츠 |
| **ISR** | 빌드 시 생성 + 주기적/온디맨드 재생성 | 자주 바뀌는 정적 페이지, 대량 페이지 |

---

## 2 SSR (Server-Side Rendering)

### 2.1 개념

- **매 요청마다** 서버에서 HTML을 만들어 응답합니다.
- 사용자 요청 → 서버에서 데이터 조회·렌더링 → HTML 전달 → 클라이언트에서 hydrate.

### 2.2 특징

- **항상 최신 데이터**: 요청 시점에 맞춰 데이터를 가져오므로 실시간에 가깝습니다.
- **SEO**: 검색엔진이 완성된 HTML을 받습니다.
- **개인화**: 쿠키·헤더를 활용해 사용자별로 다른 HTML을 줄 수 있습니다.
- **단점**: TTFB가 길어질 수 있고, 서버 부하가 요청 수에 비례합니다.

### 2.3 사용법 (Pages Router)

```js
// pages/post/[id].js
export async function getServerSideProps(context) {
  const { id } = context.params;
  const res = await fetch(`https://api.example.com/posts/${id}`);
  const post = await res.json();

  return {
    props: { post },
    // revalidate 같은 옵션 없음 — 항상 요청 시 실행
  };
}

export default function Post({ post }) {
  return <article>{post.title}</article>;
}
```

### 2.4 사용법 (App Router)

- App Router에서는 **기본이 서버 컴포넌트**이므로, `async` 서버 컴포넌트에서 직접 fetch 후 렌더링하면 SSR과 동일한 효과입니다.
- 동적 렌더링을 쓰려면 `dynamic = 'force-dynamic'` 또는 쿠키/헤더 등 동적 API 사용 시 자동으로 동적 렌더링됩니다.

```tsx
// app/post/[id]/page.tsx
export const dynamic = 'force-dynamic'; // 동적 렌더링 보장

export default async function PostPage({ params }: { params: { id: string } }) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`);
  const post = await res.json();
  return <article>{post.title}</article>;
}
```

---

## 3 SSG (Static Site Generation)

### 3.1 개념

- **빌드 시점**에 HTML을 한 번 생성하고, 그 결과를 그대로 서빙합니다.
- 요청 시 서버에서 매번 렌더링하지 않습니다.

### 3.2 특징

- **빠른 응답**: 이미 만들어진 정적 파일을 CDN에서 바로 전달할 수 있습니다.
- **서버 부하 적음**: 런타임에 서버 연산이 거의 없습니다.
- **단점**: 빌드 이후 바뀐 데이터는 재빌드·재배포 전까지 반영되지 않습니다.

### 3.3 사용법 (Pages Router)

```js
// pages/posts.js
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();

  return {
    props: { posts },
  };
}

export default function Posts({ posts }) {
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

- 동적 경로(예: `/post/[id]`)일 때는 `getStaticPaths`로 어떤 `id`들을 미리 생성할지 지정합니다.

### 3.4 사용법 (App Router)

- 기본이 정적 생성입니다. `fetch`를 쓰면 빌드 시 한 번 요청되고 결과가 캐시됩니다.
- 동적 세그먼트가 있어도 `generateStaticParams`로 경로 목록을 주면 해당 경로들은 빌드 시 생성됩니다.

```tsx
// app/posts/page.tsx
export default async function PostsPage() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

---

## 4 ISR (Incremental Static Regeneration)

### 4.1 개념

- 페이지를 **정적으로 생성**하되, 일정 시간이 지나거나 특정 트리거 후 **백그라운드에서 다시 생성**해 점진적으로 갱신하는 방식입니다.
- SSG와 SSR의 중간: 정적의 이점을 유지하면서 주기적으로 최신 데이터로 갱신할 수 있습니다.

### 4.2 특징

- **빌드 시**: 최초 HTML 생성(SSG와 동일).
- **revalidate 시간 경과 후**: 다음 해당 페이지 요청이 오면 기존 HTML을 먼저 반환하고, 백그라운드에서 재생성합니다. 재생성 완료 후 다음 요청부터 새 HTML 서빙.
- **온디맨드 재생성**: 특정 경로만 수동/웹훅으로 재생성하는 API도 제공됩니다.

### 4.3 사용법 (Pages Router)

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

### 4.4 사용법 (App Router)

- `fetch`의 `next.revalidate` 옵션으로 revalidate 시간을 지정합니다.

```tsx
// app/post/[id]/page.tsx
export const revalidate = 60; // 60초

export default async function PostPage({ params }: { params: { id: string } }) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`, {
    next: { revalidate: 60 },
  });
  const post = await res.json();
  return <article>{post.title}</article>;
}
```

- 경로별로 다른 revalidate를 주고 싶으면 `fetch(..., { next: { revalidate: 30 } })`처럼 요청 단위로 지정할 수 있습니다.

---

## 5 선택 가이드

- **항상 최신 + 개인화 필요** → SSR(동적 렌더링).
- **변경 거의 없음, 속도·비용 중요** → SSG.
- **자주 바뀌지만 요청마다 렌더는 부담** → ISR로 주기/온디맨드 재생성.

App Router에서는 **기본이 정적**이므로, 동적 데이터·쿠키·헤더를 쓰면 자동으로 동적(SSR)으로 전환됩니다. `revalidate`를 두면 해당 경로는 ISR처럼 동작합니다.
