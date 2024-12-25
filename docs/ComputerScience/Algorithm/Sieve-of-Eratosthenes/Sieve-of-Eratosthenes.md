---
title: "에라토스테네스의 체: 소수 찾기의 최적화된 알고리즘"
description: "에라토스테네스의 체 알고리즘에서 제곱근까지만 검사하는 최적화 방법과 그 수학적 원리를 상세히 설명합니다. 실제 구현 예제와 함께 직관적으로 이해할 수 있는 가이드를 제공합니다."
tags: ["ALGORITHM", "MATHEMATICS", "TIME_COMPLEXITY", "BIG_O", "PYTHON"]
keywords: ["에라토스테네스의 체", "소수", "prime number", "sieve of eratosthenes", "알고리즘", "algorithm", "최적화", "optimization", "제곱근", "square root"]
draft: false
hide_title: true
---

## 1. 에라토스테네스의 체 소개

- 에라토스테네스의 체는 주어진 범위 내의 모든 소수를 찾는 알고리즘입니다. 
- 여기서는 두 가지 중요한 최적화 방법을 자세히 살펴보겠습니다:
  - 검사 범위를 제곱근까지로 제한하기
  - 각 수의 배수를 지울 때 그 수의 제곱부터 시작하기

### 1.1 기본 동작 과정

1. 2부터 N까지의 모든 수를 나열합니다.
2. 아직 지워지지 않은 수 중 가장 작은 수를 찾습니다.
3. 그 수는 소수이므로 따로 저장합니다.
4. 그 수의 모든 배수를 지웁니다.
5. 2-4번 과정을 반복합니다.

## 2. 기본 구현

```python
def sieve_of_eratosthenes(n):
    # 모든 수를 소수로 초기화
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    
    # 2부터 sqrt(n)까지만 검사
    limit = int(n ** 0.5)
    for i in range(2, limit + 1):
        if is_prime[i]:
            # i의 제곱부터 시작하여 i의 배수들을 제거
            for j in range(i * i, n + 1, i):
                is_prime[j] = False
                
    return [i for i in range(2, n + 1) if is_prime[i]]
```

## 3. 두 가지 핵심 최적화 원리

### 3.1 제곱근까지만 검사하는 이유

:::note[왜 제곱근까지만 검사하나요?]
1. 에라토스테네스의 체는 각 숫자 i에 대해 "i로 나누어지는 모든 수를 제거"하는 과정입니다.
2. 여기서 중요한 성질:
	- 모든 합성수 N은 N = a × b 형태로 표현됩니다
	- a와 b 중 적어도 하나는 반드시 √N 이하입니다
	- 예: 28 = 4 × 7 (4는 √28 이하)
	- 예: 63 = 7 × 9 (7은 √63 이하)
3. 이것이 의미하는 것:
	- 모든 합성수는 반드시 √N 이하의 어떤 수로 나누어집니다
	- 따라서 √N 이하의 수들의 배수만 지워도 모든 합성수를 걸러낼 수 있습니다
:::

예를 들어 N = 100일 때:
- √100 = 10까지만 검사하면 충분합니다
- 11 이상의 수들 중:
	- 소수들(11, 13, 17, 19, ...)은 그대로 남습니다
	- 합성수들(12, 14, 15, 16, ...)은 이미 2, 3, 5, 7의 배수로 지워졌습니다.
    - 따라서 11 이상의 수들을 검사할 필요가 없습니다

### 3.2 i의 제곱부터 시작하는 이유

```python
for j in range(i * i, n + 1, i):  # i의 제곱부터 시작
```

i의 제곱보다 작은 i의 배수들은 이미 이전 단계에서 모두 처리되었기 때문입니다.

예를 들어 i = 5일 때:
- 5의 배수들: 5, 10, 15, 20, 25, 30, 35, ...
- 5 × 1 = 5
- 5 × 2 = 10 (2의 배수로 이미 처리됨)
- 5 × 3 = 15 (3의 배수로 이미 처리됨)
- 5 × 4 = 20 (2의 배수로 이미 처리됨)
- 5 × 5 = 25 (이전에 처리되지 않은 첫 번째 수)
- 따라서 25부터 시작하면 됩니다

## 4. 결론

에라토스테네스의 체는 두 가지 핵심 최적화를 통해 매우 효율적인 알고리즘이 됩니다:
1. 제곱근까지만 검사함으로써 불필요한 순회를 제거
2. 각 수의 배수를 지울 때 그 수의 제곱부터 시작함으로써 중복 작업을 제거

:::tip[실전 조언]
코딩 테스트에서 소수 관련 문제를 만났을 때, 이 두 가지 최적화를 적용한 에라토스테네스의 체를 사용하면 효율적으로 문제를 해결할 수 있습니다.
:::