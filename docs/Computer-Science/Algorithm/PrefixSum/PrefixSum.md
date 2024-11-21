---
title: "누적합(Prefix Sum)"
description: "누적합(Prefix Sum) 완벽 가이드: 1차원부터 2차원까지: 배열의 누적합(Prefix Sum) 알고리즘에 대해 상세히 알아봅니다. 1차원 배열부터 2차원 배열까지 실제 예제와 함께 설명하고, 알고리즘으로서의 의미와 활용 사례를 다룹니다."
tags: ["ARRAY", "ALGORITHM", "DATA_STRUCTURE", "TIME_COMPLEXITY", "CODING_TEST"]
keywords: ["누적합", "prefix sum", "구간합", "range sum", "부분합", "partial sum", "알고리즘", "algorithm", "자료구조", "data structure", "코딩테스트", "coding test", "알고리즘 최적화", "algorithm optimization"]
draft: false
hide_title: true
---

## 1. 누적합(Prefix Sum)이란?

- 누적합은 배열의 각 위치까지의 원소들의 합을 미리 계산해두는 기법입니다.
- 특정 구간의 합을 빠르게 계산해야 할 때 유용하게 사용됩니다.
- 구간의 합이 아니라 구간의 업데이트를 빠르게 수행해야 할 때는 차분 배열을 사용합니다.
  - 차분 배열
  - 구간 업데이트를 O(1) 시간에 수행할 수 있는 장점이 있습니다.
  - [DifferenceArray.md](../DifferenceArray/DifferenceArray.md) 참고


### 1.1 기본 개념

- 누적합 배열의 각 원소는 원본 배열의 처음부터 해당 위치 직전까지의 모든 원소의 합을 저장합니다.
- 구간 [L, R]의 합을 O(1) 시간에 계산 가능합니다.
- 메모리를 조금 더 사용하는 대신 반복적인 구간 합 계산을 최적화합니다.

### 1.2 누적합 배열의 특별한 설계

- 누적합 배열(prefix_sum)은 다음과 같은 특징을 가집니다:
  - prefix_sum[i]는 원본 배열의 0번째부터 (i-1)번째까지의 합을 저장
  - prefix_sum[0]은 항상 0으로 초기화
  - prefix_sum의 길이는 원본 배열보다 1만큼 더 김
- 이렇게 설계하는 이유:
  - 구간 합 계산이 더 직관적이고 일관됨
  - 경계 조건(0번째 인덱스, 마지막 인덱스) 처리가 간단
  - 실수할 가능성이 줄어듦

```python
# 기존 방식(포함하지 않는 방식)
sum_0_to_2 = prefix_sum[3] - prefix_sum[0]  # 10 - 0 = 10

# 포함하는 방식
sum_0_to_2 = prefix_sum[2]  # 특별 처리 필요
```
- 만약 prefix_sum[i]는 원본 배열의 0번째부터 i번째까지의 합을 저장한다면
- 0번째 인덱스부터 시작하는 구간 합에 대해서 특별한 처리가 필요합니다.

## 2. 1차원 배열의 누적합

### 2.1 구현 방법

#### 누적합 배열 생성
```python
def create_prefix_sum(arr):
    n = len(arr)
    prefix_sum = [0] * (n + 1)  # 길이가 n+1인 배열 생성

    for i in range(n):
        prefix_sum[i + 1] = prefix_sum[i] + arr[i]

    return prefix_sum
```
- `prefix_sum[i + 1]`는 `arr[0]`부터 `arr[i]`까지의 합을 저장합니다.
- 따라서 `prefix_sum[i]`와 `arr[i]`를 더하면 `arr[0]`부터 `arr[i]`까지의 합이 됩니다.

#### 구간 합 계산
```python
def get_range_sum(prefix_sum, left, right):
    return prefix_sum[right + 1] - prefix_sum[left]
```
- `prefix_sum[right + 1]`에서 `prefix_sum[left]`를 빼면 구간 [left, right]의 합이 됩니다.

### 2.2 상세 예제와 설명

:::note[예제 데이터]
원본 배열: `[1, 3, 6, 2, 5, 4]`
누적합 배열: `[0, 1, 4, 10, 12, 17, 21]`

각 prefix_sum 값의 의미:
- prefix_sum[0] = 0 (아무 원소도 포함하지 않음)
- prefix_sum[1] = 1 (arr[0]까지의 합)
- prefix_sum[2] = 4 (arr[0:2]까지의 합: 1 + 3)
- prefix_sum[3] = 10 (arr[0:3]까지의 합: 1 + 3 + 6)
- prefix_sum[4] = 12 (arr[0:4]까지의 합: 1 + 3 + 6 + 2)
  :::

구간 합 계산 예시:
```python
# 인덱스 1부터 3까지의 구간 합
sum_1_3 = prefix_sum[4] - prefix_sum[1]  # 12 - 1 = 11
# 실제로 arr[1] + arr[2] + arr[3] = 3 + 6 + 2 = 11

# 인덱스 0부터 2까지의 구간 합
sum_0_2 = prefix_sum[3] - prefix_sum[0]  # 10 - 0 = 10
# 실제로 arr[0] + arr[1] + arr[2] = 1 + 3 + 6 = 10
```

## 3. 2차원 배열의 누적합

- 이번엔 2차원 배열의 누적합을 구하는 방법에 대해 알아봅니다.
- 2차원 배열의 각 위치까지의 원소들의 합을 미리 계산해두는 방법입니다.
- 2차원 배열의 특정 구간의 합을 빠르게 계산할 수 있습니다.
- 1차원 배열의 누적합과 비슷하게 구현할 수 있습니다.
- 2차원 배열의 누적합을 구하면 2차원 구간 합을 O(1) 시간에 계산할 수 있습니다.

### 3.1 구현 방법

#### 2차원 누적합 배열 생성
```python
def create_2d_prefix_sum(matrix):
    if not matrix or not matrix[0]:
        return []

    rows, cols = len(matrix), len(matrix[0])
    # (rows+1) x (cols+1) 크기의 배열 생성
    prefix_sum = [[0] * (cols + 1) for _ in range(rows + 1)]

    for i in range(rows):
        for j in range(cols):
            prefix_sum[i + 1][j + 1] = (
                prefix_sum[i][j + 1] +     # 위쪽
                prefix_sum[i + 1][j] -     # 왼쪽
                prefix_sum[i][j] +         # 중복 제거
                matrix[i][j]               # 현재 값
            )

    return prefix_sum
```

#### 2차원 구간 합 계산
```python
def get_2d_range_sum(prefix_sum, x1, y1, x2, y2):
    return (
        prefix_sum[x2 + 1][y2 + 1] -
        prefix_sum[x1][y2 + 1] -
        prefix_sum[x2 + 1][y1] +
        prefix_sum[x1][y1]
    )
```

### 3.2 상세 예제와 설명

:::note[예제 데이터]
원본 행렬:
```
1 2 3
4 5 6
7 8 9
```

누적합 행렬:
```
0  0  0  0
0  1  3  6
0  5  12 21
0  12 27 45
```

각 행과 열의 첫 번째 값이 0인 이유:
1. 2차원에서도 1차원과 같은 설계 원칙 적용
2. 경계 조건 처리 단순화
3. 구간 합 계산 공식의 일관성 유지
:::

## 4. 시간 복잡도와 공간 복잡도

### 4.1 1차원 누적합

- 시간 복잡도:
  - 누적합 배열 생성: O(N)
  - 구간 합 계산: O(1)
- 공간 복잡도: O(N)

### 4.2 2차원 누적합

- 시간 복잡도:
  - 누적합 배열 생성: O(N×M)
  - 구간 합 계산: O(1)
- 공간 복잡도: O(N×M)

## 5. 누적합의 장단점

### 5.1 장점

1. 반복적인 구간 합 계산이 필요할 때 효율적
2. 구간 합 계산이 O(1)로 매우 빠름
3. 코드가 간결하고 실수할 가능성이 적음
4. 2차원까지 확장 가능

### 5.2 단점

1. 추가 메모리 필요
2. 배열이 자주 변경되는 경우 누적합 배열 재계산 필요
3. 초기 전처리 시간 필요

## 6. 실전 활용 팁

### 6.1 적용하기 좋은 경우

- 구간 합을 여러 번 계산해야 할 때
- 배열이 자주 변경되지 않을 때
- 메모리 제한이 충분할 때

### 6.2 주의사항

- 메모리 제한 확인
- 배열 크기가 커질 때의 공간 복잡도 고려
- 0번 인덱스 처리 주의

## 7. 마치며

- 누적합은 단순하지만 강력한 최적화 기법입니다. 
- 특히 구간 합을 자주 계산해야 하는 상황에서 매우 유용하며, 1차원뿐만 아니라 2차원으로도 확장하여 다양한 문제를 해결할 수 있습니다.
