---
title: "이진 탐색과 파라메트릭 서치"
description: "이진 탐색의 근간이 되는 단조성의 개념부터 파라메트릭 서치까지, 실전에서 활용 가능한 내용을 상세히 다룹니다. off-by-one 에러를 방지하는 전략과 Lower/Upper Bound의 구현 방법을 초보자도 이해할 수 있게 설명합니다."
tags: ["ALGORITHM", "BINARY_SEARCH", "DATA_STRUCTURE", "CODING_TEST", "PYTHON"]
keywords: ["이진탐색", "binary search", "이분탐색", "파라메트릭서치", "parametric search", "단조성", "monotonicity", "로우어바운드", "lower bound", "어퍼바운드", "upper bound", "알고리즘", "algorithm"]
draft: false
hide_title: true
---

## 1. 이진 탐색의 기본 원리

### 1.1 단조성(Monotonicity)의 이해

- 이진 탐색의 핵심은 단조성을 활용하는 것입니다. 
- 단조성이란 어떤 조건의 참/거짓이 한 번만 바뀌는 성질을 말합니다.

#### 1.1.1 일반적인 이진 탐색에서의 단조성
```
인데스:  0  1  2  3  4  5
배열:   1, 3, 5, 7, 9, 11
찾으려는 값: 7
각 위치에서 조건(arr[i] ≤ 7):
인덱스: 0  1  2  3  4  5
결과:   F  F  F  T  T  T
```

#### 1.1.2 파라메트릭 서치에서의 단조성
```
랜선 자르기 문제(길이가 x일 때 K개를 만들 수 있는가?)
길이: 1  2  3  4  5  6  7  8
가능: T  T  T  T  F  F  F  F
```

:::info
두 경우 모두 FFFTTT 또는 TTTFFF 패턴을 보입니다. 이런 단조성이 있을 때 이진 탐색을 적용할 수 있습니다.
:::

### 1.2 Off-by-one 에러 방지를 위한 구현 전략

- 단조성을 활용할 때는 다음과 같은 방식으로 구현하면 안전합니다

```python
def binary_search(condition):
    low = -1        # 항상 False를 가리킴
    high = len(arr) # 항상 True를 가리킴
    
    while low + 1 < high:  # low와 high가 인접할 때까지 반복
        mid = (low + high) // 2
        if condition(mid):
            high = mid  # True면 high를 줄임
        else:
            low = mid   # False면 low를 늘림
            
    return high  # 첫 번째 True의 위치
```
- 위 코드는 FFFTTT 단조성 패턴에 안전하게 대응할 수 있습니다. 

#### 1.2.1 주요 특징
- low와 high 사이에 항상 정답이 존재하도록 low와 high 초기화합니다.
- `low + 1 < high` 조건으로 종료 조건 명확히 설정합니다.
- FFFTTT 패턴인 경우 low는 마지막 F, high는 첫 번째 T를 가리킵니다.
- low와 high가 인접하면 종료하고 문제에서 요구하는 값에 따라 low 또는 high 반환합니다.

## 2. Lower Bound와 Upper Bound

### 2.1 개념 이해하기

- 정렬된 배열에서 특정 값의 위치를 찾을 때, 같은 값이 여러 개 있다면 어떤 위치를 반환해야 할까요?
- 이런 경우를 위해 두 가지 특별한 이진 탐색 방법이 있습니다:
  - Lower Bound: target 값이 처음 나타나는 위치 (가장 왼쪽)
  - Upper Bound: target 값보다 큰 값이 처음 나타나는 위치

**예시**

```python
index  0  1  2  3  4  5  6
arr = [1, 2, 2, 2, 3, 3, 4]
target = 2
```
- Lower Bound: index 1 위치를 반환
- Upper Bound: index 4 위치를 반환

### 2.2 Lower Bound

#### 2.2.1 정의와 특징
- 정렬된 배열에서 특정 값 이상이 처음 나타나는 위치를 찾습니다
- 수식으로는 `arr[i-1] < target ≤ arr[i]`를 만족하는 가장 작은 i를 찾습니다
- 다시 말해, `arr[i] >= target`을 만족하는 가장 작은 i를 찾습니다
- 배열의 모든 원소가 target보다 작다면 배열의 길이를 반환합니다

#### 2.2.2 구현

```
index  0  1  2  3  4  5  6
arr = [1, 2, 2, 2, 3, 3, 4]
target = 2
각 위치에서 조건(arr[i] >= target)
index  0  1  2  3  4  5  6
결과:   F  T  T  T  T  T  T
```
- 코드 구현에 앞서 FFFTTT 패턴을 확인합니다.
  - 결정 문제: `arr[i] >= target`
- 최종 적으로 low는 마지막 F, high는 첫 번째 T를 가리킵니다.
- lower bound는 `arr[i] >= target`를 만족하는 가장 작은 i를 찾습니다.
  - 따라서 high를 반환합니다.


```python
def lower_bound(arr, target):
    low = -1         # arr[low] < target을 항상 만족
    high = len(arr)  # arr[high] >= target을 항상 만족
    
    while low + 1 < high:
        mid = (low + high) // 2
        if arr[mid] >= target:  # mid 위치의 값이 target 이상이면
            high = mid          # 더 앞쪽도 확인
        else:
            low = mid           # 더 뒤쪽을 확인
    return high
```
### 2.3 Upper Bound

#### 2.3.1 정의와 특징
- 정렬된 배열에서 특정 값을 초과하는 첫 위치를 찾습니다
- 수식으로는 `arr[i-1] <= target < arr[i]`를 만족하는 가장 작은 i를 찾습니다
- 다시 말해, `arr[i] > target`을 만족하는 가장 작은 i를 찾습니다
- 배열의 모든 원소가 target보다 작거나 같다면 배열의 길이를 반환합니다

#### 2.3.2 구현

```
index  0  1  2  3  4  5  6
arr = [1, 2, 2, 2, 3, 3, 4]
target = 2
각 위치에서 조건(arr[i] > target)
index  0  1  2  3  4  5  6
결과:   F  F  F  F  T  T  T
```
- 코드 구현에 앞서 FFFTTT 패턴을 확인합니다.
    - 결정 문제: `arr[i] > target`
- 최종 적으로 low는 마지막 F, high는 첫 번째 T를 가리킵니다.
- upper bound는 `arr[i] > target`을 만족하는 가장 작은 i를 찾습니다.
    - 따라서 high를 반환합니다.

```python
def upper_bound(arr, target):
    low = -1         # arr[low] <= target을 항상 만족
    high = len(arr)  # arr[high] > target을 항상 만족
    
    while low + 1 < high:
        mid = (low + high) // 2
        if arr[mid] > target:   # mid 위치의 값이 target보다 크면
            high = mid          # 더 앞쪽도 확인
        else:
            low = mid           # 더 뒤쪽을 확인
    
    return high
```

### 2.4 활용: 특정 원소의 개수 구하기

- Lower Bound와 Upper Bound를 활용하면 정렬된 배열에서 특정 원소의 개수를 쉽게 구할 수 있습니다.

```python
def count_element(arr, target):
    return upper_bound(arr, target) - lower_bound(arr, target)
```

#### 2.4.1 동작 원리
```python
arr = [1, 2, 2, 2, 3, 3, 4]
target = 2

# lower_bound(arr, 2) = 1 (첫 번째 2의 위치)
# upper_bound(arr, 2) = 4 (첫 번째 3의 위치)
# 4 - 1 = 3 (2의 개수)
```

:::info
이 방법의 시간 복잡도는 O(log n)으로, 배열을 순회하면서 세는 O(n) 방법보다 효율적입니다.
:::

## 3. 파라메트릭 서치

- 파라메트릭 서치는 이진 탐색을 최적화 문제에 적용한 것입니다.
- 최적화 문제를 결정 문제로 바꾸어 단조성을 만들어냅니다.

### 3.1 기본 구조
```python
def parametric_search(left, right):
    low = left - 1      # 조건을 만족하지 않는 값
    high = right + 1    # 조건을 만족하는 값
    
    while low + 1 < high:
        mid = (low + high) // 2
        if decision(mid):  # 결정 문제
            high = mid     # 더 작은 값도 가능한지 시도
        else:
            low = mid      # 더 큰 값 시도
            
    return high  # 조건을 만족하는 최소값
```

### 3.2 실제 예제: 랜선 자르기
```python
def can_make_cables(cables, target_count, length):
    return sum(cable // length for cable in cables) >= target_count

def find_max_length(cables, target_count):
    low = 0    # 가능한 길이
    high = max(cables) + 1  # 불가능한 길이
    
    while low + 1 < high:
        mid = (low + high) // 2
        if can_make_cables(cables, target_count, mid):
            low = mid   # 가능하면 더 큰 길이 시도
        else:
            high = mid  # 불가능하면 더 작은 길이 시도
            
    return low  # 가능한 최대 길이
```

#### 3.2.1 예시로 이해하기
```python
cables = [8, 11, 13]  # 가지고 있는 랜선의 길이
target = 5            # 만들어야 하는 랜선의 개수

# 길이별로 만들 수 있는 랜선의 개수:
# 길이 1: 8 + 11 + 13 = 32개 (가능)
# 길이 2: 4 + 5 + 6 = 15개 (가능)
# 길이 3: 2 + 3 + 4 = 9개 (가능)
# 길이 4: 2 + 2 + 3 = 7개 (가능)
# 길이 5: 1 + 2 + 2 = 5개 (가능)
# 길이 6: 1 + 1 + 2 = 4개 (불가능)

# 답: 5 (가능한 최대 길이)
```

## 4. 구현시 주의사항

### 4.1 단조성 확인
- 일반 이진 탐색: 정렬된 배열에서 자연스럽게 주어짐
- 파라메트릭 서치: 결정 문제 설계시 의도적으로 만들어야 함

### 4.2 초기값 설정
- low는 반드시 조건을 만족하지 않는 값으로(FFFTTT 패턴인 경우)
- high는 반드시 조건을 만족하는 값으로(FFFTTT 패턴인 경우)
- 이 불변식이 깨지면 알고리즘이 실패할 수 있음

### 4.3 답 선택하기
- FFFTTT 패턴: high가 첫 번째 True
- TTTFFF 패턴: low가 마지막 True

:::warning
배열 범위를 벗어나는 값(-1이나 len(arr))을 사용할 때는 조건 함수에서 적절히 처리해야 합니다.
:::