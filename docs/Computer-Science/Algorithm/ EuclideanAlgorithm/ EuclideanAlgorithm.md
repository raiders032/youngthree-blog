---
title: "유클리드 호제법의 모든 것: 최대공약수와 최소공배수의 완벽한 이해"
description: "유클리드 호제법의 기본 개념부터 증명, 최대공약수와 최소공배수의 관계, 그리고 실제 응용까지 모든 것을 상세히 설명합니다. 수학적 기초부터 프로그래밍 구현까지 완벽하게 다룹니다."
tags: ["ALGORITHM", "MATHEMATICS", "PYTHON", "TIME_COMPLEXITY"]
keywords: ["유클리드 호제법", "최대공약수", "최소공배수", "GCD", "LCM", "증명", "알고리즘"]
draft: false
hide_title: true
---

## 1. 기본 개념 정리

### 1.1 최대공약수(GCD)
- 정의: 두 수의 공통된 약수 중 가장 큰 수
- 표기: gcd(a,b)
- 성질:
    - gcd(a,b) = gcd(b,a)
    - gcd(a,0) = |a|
    - gcd(a,1) = 1

### 1.2 최소공배수(LCM)
- 정의: 두 수의 공통된 배수 중 가장 작은 양의 정수
- 표기: lcm(a,b)
- 성질:
    - lcm(a,b) = lcm(b,a)
    - lcm(a,0) = 0
    - lcm(a,1) = |a|

### 1.3 GCD와 LCM의 관계
```
a × b = gcd(a,b) × lcm(a,b)
```

## 2. 유클리드 호제법

### 2.1 기본 원리
두 양의 정수 a, b에 대해:
```
gcd(a,b) = gcd(b, a mod b)
```

### 2.2 동작 과정 예시
a = 48, b = 18의 경우:
```
48 = 2 × 18 + 12
18 = 1 × 12 + 6
12 = 2 × 6 + 0
따라서 gcd(48,18) = 6
```

## 3. 수학적 증명

### 3.1 직접 증명
1) a = bq + r이라 하자 (나눗셈 정리)
2) d를 a,b의 임의의 공약수라 하면:
    - d|a, d|b
    - d|(a-bq) = r
3) 따라서 a,b의 모든 공약수는 b,r의 공약수
4) 역으로 b,r의 공약수도 a,b의 공약수
5) 두 집합이 같으므로 최대공약수도 같음

### 3.2 귀류법 증명
1) gcd(a,b) ≠ gcd(b,r)이라 가정
2) d₁ = gcd(a,b), d₂ = gcd(b,r)이라 하자
3) d₁은 b,r의 공약수이므로 d₁ ≤ d₂
4) d₂는 a,b의 공약수이므로 d₂ ≤ d₁
5) 따라서 d₁ = d₂로 모순

## 4. 구현과 최적화

### 4.1 기본 구현
```python
# 재귀 버전
def gcd_recursive(a, b):
    if b == 0:
        return abs(a)
    return gcd_recursive(b, a % b)

# 반복문 버전
def gcd_iterative(a, b):
    while b:
        a, b = b, a % b
    return abs(a)

# 최소공배수
def lcm(a, b):
    return abs(a * b) // gcd_iterative(a, b)
```

### 4.2 최적화된 이진 GCD
```python
def binary_gcd(a, b):
    if a == 0:
        return b
    if b == 0:
        return a
        
    # 2의 공통 인수 제거
    shift = 0
    while ((a | b) & 1) == 0:
        a >>= 1
        b >>= 1
        shift += 1
        
    while (a & 1) == 0:
        a >>= 1
        
    while b != 0:
        while (b & 1) == 0:
            b >>= 1
            
        if a > b:
            a, b = b, a
        b -= a
        
    return a << shift
```

## 5. 중요한 응용

### 5.1 여러 수의 최대공약수
```python
def multiple_gcd(numbers):
    from functools import reduce
    return reduce(gcd_iterative, numbers)
```

### 5.2 서로소 판정
```python
def is_coprime(a, b):
    return gcd_iterative(a, b) == 1
```

### 5.3 분수 약분
```python
def reduce_fraction(num, den):
    g = gcd_iterative(num, den)
    return num // g, den // g
```

## 6. 확장 유클리드 호제법

### 6.1 베주 항등식
임의의 두 정수 a, b에 대해 다음을 만족하는 정수 x, y가 존재:
```
ax + by = gcd(a,b)
```

### 6.2 구현
```python
def extended_gcd(a, b):
    if a == 0:
        return b, 0, 1
    gcd, x1, y1 = extended_gcd(b % a, a)
    x = y1 - (b // a) * x1
    y = x1
    return gcd, x, y
```

## 7. 실전 문제 해결 전략

### 7.1 GCD를 활용한 문제 유형
1. 분수 약분
2. 공약수 개수 구하기
3. 순열 사이클 찾기
4. 최대공약수의 최대/최소값 찾기

### 7.2 문제 해결 팁
- GCD와 LCM의 관계식 활용
- 여러 수의 GCD는 순차적 계산
- 음수 입력 고려
- 오버플로우 주의

:::warning
매우 큰 수를 다룰 때는 이진 GCD 알고리즘 사용을 고려하세요.
:::

## 8. 시간 복잡도 분석

### 8.1 일반적인 경우
- 유클리드 호제법: O(log(min(a,b)))
- 이진 GCD: O(log(max(a,b)))

### 8.2 최악의 경우
- 연속된 피보나치 수에서 발생
- 여전히 O(log n) 보장

## 9. 마치며

유클리드 호제법은 단순하면서도 강력한 알고리즘입니다. 최대공약수와 최소공배수의 개념은 수학의 기초가 되며, 이를 효율적으로 계산하는 유클리드 호제법의 이해는 알고리즘 학습에서 중요한 부분을 차지합니다.

:::tip
실제 코딩 테스트나 실무에서는 대부분의 경우 단순한 유클리드 호제법으로 충분합니다. 하지만 최적화가 필요한 특수한 경우에는 이진 GCD를 고려해보세요.
:::