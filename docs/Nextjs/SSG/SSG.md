---
title: "SSG (Static Site Generation)"
description: "Next.js에서 정적 사이트 생성(SSG)의 개념, 특징, Pages/App Router 사용법을 정리합니다."
keywords: ["Next.js", "SSG", "정적 생성", "getStaticProps", "getStaticPaths", "generateStaticParams"]
tags: ["Next.js", "Frontend", "React"]
hide_title: true
last_update:
  date: 2025-03-04
  author: youngthree
---

## 1 SSG란

- **SSG(Static Site Generation)**는 **빌드 시점**에 HTML을 한 번 생성하고, 그 결과를 그대로 서빙하는 방식입니다.
- `next build` 시 데이터 fetch + 렌더링이 실행되어 정적 HTML(및 자산)이 생성됩니다.
- 요청 시에는 이미 만들어진 파일을 반환하므로 서버에서 매번 렌더링하지 않습니다.

## 2 특징

| 장점 | 단점 |
|------|------|
| **빠른 응답**: 정적 파일을 CDN에서 바로 전달 가능 | 빌드 이후 바뀐 데이터는 재빌드·재배포 전까지 반영 안 됨 |
| **서버 부하 적음**: 런타임에 서버 연산이 거의 없음 | 모든 경로를 빌드 시 생성하려면 빌드 시간·리소스 증가 |
| **캐시·CDN 활용 용이**: HTML 단위 캐시에 적합 | 실시간·개인화 콘텐츠에는 부적합 |

- 블로그, 랜딩, 문서 사이트, 변경이 잦지 않은 공개 페이지에 적합합니다.

## 3 Pages Router 사용법

### 3.1 getStaticProps (정적 페이지)

페이지에서 `getStaticProps`를 export하면 **빌드 시** 한 번 실행되고, 반환한 `props`로 페이지가 렌더링됩니다.

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

### 3.2 동적 경로: getStaticPaths

- 경로가 동적일 때(예: `/post/[id]`)는 **어떤 경로를 미리 생성할지** `getStaticPaths`로 지정합니다.

```js
// pages/post/[id].js
export async function getStaticPaths() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  const paths = posts.map((p) => ({ params: { id: String(p.id) } }));

  return {
    paths,
    fallback: false, // paths 외 경로는 404
    // fallback: true  → 미리 생성 안 된 경로는 첫 요청 시 생성
    // fallback: 'blocking' → 첫 요청 시 서버에서 생성 후 캐시
  };
}

export async function getStaticProps({ params }) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`);
  const post = await res.json();

  return {
    props: { post },
  };
}

export default function Post({ post }) {
  return <article>{post.title}</article>;
}
```

| fallback | 동작 |
|----------|------|
| `false` | `paths`에 있는 경로만 제공, 나머지는 404 |
| `true` | 없는 경로는 첫 요청 시 생성 가능. 생성 전에는 로딩 UI 필요 |
| `'blocking'` | 없는 경로는 첫 요청 시 서버에서 생성 후 응답, 이후 캐시 |

### 3.3 fallback 옵션 상세

**`fallback: false`**

- `getStaticPaths`가 반환한 `paths`에 있는 경로만 빌드 시 생성합니다.
- **그 외 경로**(예: 새로 추가된 글 ID)로 접속하면 **404**가 반환됩니다.
- **적합한 경우**: 경로 개수가 적고, 빌드 시 모두 알 수 있으며, 존재하지 않는 ID 접근을 404로 처리해도 될 때 (예: 소규모 블로그, 고정된 상품 목록).

**`fallback: 'blocking'`**

- `paths`에 없는 경로로 **첫 요청**이 오면, 서버에서 **해당 경로에 대해 `getStaticProps`를 실행한 뒤** HTML을 만든 다음 그 결과를 응답합니다. 
- 사용자는 로딩이 끝난 **완성된 HTML**을 받습니다.
- 생성된 HTML은 캐시되므로, **이후 같은 경로 요청**은 정적 페이지처럼 바로 반환됩니다.
- **적합한 경우**: `fallback: true`처럼 경로를 나중에 생성하고 싶지만, 로딩 UI를 두기 어렵거나 SEO상 첫 응답부터 완성된 HTML을 주고 싶을 때. 첫 요청의 TTFB는 길어질 수 있습니다.

**`fallback: true`**

- `paths`에 없는 경로로 **첫 요청**이 오면, Next.js가 먼저 **빈 props로 페이지를 보여줍니다**. 
- 이때 `router.isFallback`이 `true`이므로 로딩 UI를 렌더링해야 합니다.
- 서버에서 해당 경로에 대해 `getStaticProps`를 실행해 HTML을 생성한 뒤, **같은 사용자에게는 JSON으로 props만 보내** 페이지를 갱신하고, 생성된 HTML은 디스크에 저장해 다음 요청부터는 정적 페이지로 서빙합니다.
- **적합한 경우**: 경로가 매우 많아 빌드 시 전부 생성하기 부담스럽고, 일부는 첫 방문 시만 생성해도 될 때. 로딩 UI를 구현할 수 있어야 합니다.

```js
export default function Post({ post }) {
  const router = useRouter();
  if (router.isFallback) {
    return <div>로딩 중...</div>;
  }
  return <article>{post.title}</article>;
}
```

## 4 App Router 사용법

### 4.1 기본: 정적 생성

- App Router에서는 **기본이 정적 생성**입니다. 
- 동적 API(`cookies`, `headers`, `searchParams` 등)를 쓰지 않으면 페이지는 빌드 시 생성됩니다.

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

- `fetch` 결과는 빌드 시 한 번 요청되고 캐시됩니다 (재검증 없음).

### 4.2 동적 세그먼트: generateStaticParams

- 동적 경로(예: `app/post/[id]/page.tsx`)를 **빌드 시** 생성하려면 `generateStaticParams`로 경로 목록을 반환합니다.

```tsx
// app/post/[id]/page.tsx
export async function generateStaticParams() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  return posts.map((p) => ({ id: String(p.id) }));
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`);
  const post = await res.json();
  return <article>{post.title}</article>;
}
```

- `generateStaticParams`로 반환한 `id`에 해당하는 경로들이 빌드 시 생성됩니다.
- 여기서 반환되지 않은 경로는 **동적 라우트**로 처리될 수 있으므로, 필요하면 `dynamicParams` 등으로 제어합니다.

### 4.3 정적 생성 명시

```tsx
export const dynamic = 'force-static';
```

- 동적 API를 쓰지 않는 한 기본이 정적이므로, 보통 생략해도 됩니다. 명시적으로 정적임을 나타내고 싶을 때 사용합니다.

## 5 언제 쓰면 좋은지

- **변경이 거의 없는 공개 콘텐츠**: 블로그, 문서, 랜딩, 프로모션 페이지.
- **응답 속도·CDN·비용**을 우선할 때.
- **실시간 데이터나 사용자별 개인화**가 필요 없을 때.
- 데이터가 가끔 바뀌지만 요청마다 렌더할 필요는 없다면 **ISR**을 고려하면 됩니다.
