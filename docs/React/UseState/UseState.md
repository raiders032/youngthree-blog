---
title: "useState"
description: "React useState 훅의 개념, 사용법, 주의사항을 정리합니다. 함수형 컴포넌트에서 상태를 선언하고 갱신하는 방법과 배치 업데이트, 지연 초기화 등 실무 팁을 다룹니다."
keywords: ["React", "useState", "훅", "Hook", "상태", "State", "함수형 컴포넌트"]
tags: ["React", "Frontend", "Hook"]
hide_title: true
last_update:
  date: 2025-03-02
  author: youngthree
---

## 1 useState란

- `useState`는 React 함수형 컴포넌트에서 **지역 상태(local state)**를 선언하고 갱신할 때 쓰는 훅(Hook)입니다.
- 호출 시 **현재 상태 값**과 **그 값을 바꾸는 setter 함수** 한 쌍을 반환합니다.
- 상태가 바뀌면 컴포넌트가 다시 렌더링됩니다.

## 2 기본 사용법

### 2.1 선언과 갱신

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  );
}
```

- `useState(0)`: 초기값은 `0`.
- `count`: 현재 상태 값.
- `setCount`: 상태를 바꾸는 함수. 호출 시 컴포넌트가 리렌더링됩니다.

### 2.2 Setter에 함수 넘기기

- 다음 상태가 **이전 상태에 의존**할 때는 값 대신 **함수**를 넘기는 것이 안전합니다.

```jsx
// 이전 상태 기반으로 증가
<button onClick={() => setCount((prev) => prev + 1)}>증가</button>
```

- 이벤트 핸들러가 빠르게 여러 번 호출되거나, 배치 업데이트 시에도 최신 이전 상태를 기준으로 갱신됩니다.

## 3 초기값 다루기

### 3.1 지연 초기화(Lazy initial state)

- 초기값 계산 비용이 크면 **함수**를 넘겨서, 첫 렌더에서만 한 번 실행되게 할 수 있습니다.

```jsx
const [state, setState] = useState(() => expensiveComputation());
```

- `useState(expensiveComputation())`처럼 쓰면 매 렌더마다 함수가 호출됩니다.
- `useState(() => expensiveComputation())`처럼 쓰면 초기 렌더 시 한 번만 호출됩니다.

## 4 주의사항

### 4.1 직접 변경 금지

- 상태는 **불변**처럼 다룹니다. 배열·객체를 바꿀 때는 기존 값을 복사한 뒤 setter에 넘깁니다.

```jsx
// 나쁜 예: 직접 변경
items.push(newItem);
setItems(items);

// 좋은 예: 새 배열 전달
setItems((prev) => [...prev, newItem]);
```

### 4.2 배치 업데이트

- React 18부터 이벤트 핸들러 안에서 여러 번 setState를 호출해도 **한 번의 리렌더**로 묶입니다(자동 배치).
- 같은 이벤트 핸들러에서 `setCount(a); setCount(b);`처럼 호출하면 마지막 갱신만 반영된 상태로 한 번만 렌더됩니다.

### 4.3 훅 규칙

- `useState`는 **컴포넌트 최상위**에서만 호출합니다. 조건문, 반복문, 중첩 함수 안에서 호출하면 안 됩니다.

## 5 정리

- `useState`는 함수형 컴포넌트에서 상태를 쓰기 위한 기본 훅입니다.
- setter에는 값 또는 `(prev) => next` 형태의 함수를 넘길 수 있고, 이전 상태에 의존할 때는 함수 형태를 사용하는 것이 좋습니다.
- 비용이 큰 초기값은 지연 초기화 함수로 넘기고, 상태는 불변처럼 다루면 예측하기 쉬운 컴포넌트를 만들 수 있습니다.
