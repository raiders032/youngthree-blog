---
title: "useEffect"
description: "React useEffect 훅의 개념, 의존성 배열, 클린업 함수를 정리합니다. 부수 효과를 선언하고 구독·API 호출·DOM 조작 시 주의사항과 실무 패턴을 다룹니다."
keywords: ["React", "useEffect", "훅", "Hook", "부수 효과", "Side Effect", "클린업", "의존성 배열"]
tags: ["React", "Frontend", "Hook"]
hide_title: true
last_update:
  date: 2025-03-02
  author: youngthree
---

## 1 useEffect란

- `useEffect`는 함수형 컴포넌트에서 **부수 효과(side effect)**를 선언할 때 쓰는 훅입니다.
- 렌더링 결과(JSX)와 직접 관계없는 동작을 "렌더가 반영된 뒤" 실행할 수 있게 합니다.
- 데이터 구독, API 호출, DOM 수동 조작, 타이머 등은 `useEffect` 안에서 처리하는 것이 일반적입니다.

## 2 기본 사용법

### 2.1 시그니처

```jsx
useEffect(() => {
  // 부수 효과 로직
  return () => { /* 클린업 (선택) */ };
}, [deps]);
```

- **첫 번째 인자**: 실행할 함수(effect 함수).
- **두 번째 인자**: 의존성 배열. 생략하거나, `[]`, `[a, b]` 형태로 넘깁니다.

### 2.2 의존성 배열에 따른 실행 시점

| 의존성 배열 | 실행 시점 |
|------------|-----------|
| 생략 | 매 렌더 후 실행 |
| `[]` | 마운트 후 한 번만 실행 |
| `[a, b]` | 마운트 시 + `a` 또는 `b`가 바뀐 렌더 후 실행 |

```jsx
// 매 렌더 후 실행 (의존성 배열 생략)
useEffect(() => {
  console.log('렌더 완료 후 실행');
});

// 마운트 시 한 번만 (컴포넌트 등장 시)
useEffect(() => {
  fetchData();
}, []);

// userId가 바뀔 때마다
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

## 3 클린업 함수

- effect 함수에서 **함수를 반환**하면, 그 함수는 다음 effect 실행 전·또는 컴포넌트 언마운트 시 React가 호출합니다(클린업).

```jsx
useEffect(() => {
  const id = setInterval(() => setCount((c) => c + 1), 1000);
  return () => clearInterval(id); // 클린업: 타이머 해제
}, []);
```

- 구독(subscription), 이벤트 리스너, 타이머는 클린업에서 해제하지 않으면 메모리 누수나 중복 실행의 원인이 됩니다.

## 4 자주 쓰는 패턴

### 4.1 API 호출

```jsx
useEffect(() => {
  let cancelled = false;

  async function load() {
    const data = await fetchSomething(id);
    if (!cancelled) setData(data);
  }
  load();

  return () => { cancelled = true; }; // 요청 후 응답 전 언마운트 시 상태 갱신 방지
}, [id]);
```

- `id`가 바뀌면 새 요청을 보내고, 응답이 오기 전에 컴포넌트가 사라지면 `setState`를 호출하지 않도록 플래그로 막는 패턴입니다.

### 4.2 구독(Subscription)

```jsx
useEffect(() => {
  const sub = eventSource.subscribe(handler);
  return () => sub.unsubscribe();
}, []);
```

- 구독은 보통 마운트 시 시작하고, 클린업에서 해제합니다.

### 4.3 DOM 측정·조작

```jsx
useEffect(() => {
  const rect = ref.current.getBoundingClientRect();
  setDimensions(rect);
}, []);
```

- DOM이 렌더된 뒤에만 접근해야 하므로 `useEffect` 안에서 처리합니다.

## 5 주의사항

### 5.1 훅 규칙

- `useEffect`는 컴포넌트 **최상위**에서만 호출합니다. 조건문·반복문·중첩 함수 안에서 호출하면 안 됩니다.

### 5.2 의존성 누락

- effect 안에서 사용하는 props·state는 의존성 배열에 넣는 것이 좋습니다. 누락하면 오래된 클로저 값을 참조할 수 있습니다.
- ESLint `react-hooks/exhaustive-deps` 규칙을 켜 두면 도움이 됩니다.

### 5.3 무한 루프

- effect 안에서 매번 setState를 하고, 그 state를 의존성에 넣으면 매 렌더마다 effect가 돌면서 무한 루프가 납니다. 
- 상태 갱신이 꼭 필요한지, 의존성을 줄일 수 있는지 검토해야 합니다.

### 5.4 Strict Mode와 개발 시 이중 실행

- React 18 Strict Mode에서는 개발 환경에서 effect를 의도적으로 두 번 실행할 수 있습니다. 
- 클린업이 제대로 작성되어 있으면 동작에 문제가 없어야 합니다.

## 6 정리

- `useEffect`는 렌더 이후에 실행되는 부수 효과를 선언하는 훅입니다.
- 의존성 배열로 "언제 실행할지"를 제어하고, 반환 함수로 클린업(구독 해제·타이머 해제 등)을 처리합니다.
- API 호출·구독·DOM 조작은 effect 안에서 하고, 의존성을 정확히 넣고 클린업을 짜 두면 버그와 메모리 누수를 줄일 수 있습니다.
