---
title: "Big O 표기법 완벽 가이드"
description: "Big O 표기법의 개념부터 실전 활용까지 상세히 알아봅니다. 시간 복잡도와 공간 복잡도를 이해하고 알고리즘의 효율성을 분석하는 방법을 배워보세요. 초보자를 위한 실용적인 예제와 함께 설명합니다."
date: 2024-11-19
tags: [ALGORITHM, DATA_STRUCTURE, CODING_TEST, BIG_O, TIME_COMPLEXITY]
keywords: [Big O Notation, 시간 복잡도, 공간 복잡도, 알고리즘 분석, 알고리즘 효율성, 알고리즘 성능]
draft: false
hide_title: true
sidebar_position: 1
---

## 1. Big O 표기법이란?

- 알고리즘의 성능과 효율성을 분석하는 수학적 표기법입니다
- 입력 크기(n)가 증가할 때 알고리즘의 시간이나 공간이 어떻게 증가하는지 표현합니다
- 최악의 경우(Worst Case)를 기준으로 성능을 측정합니다
- 상수항과 계수는 제거하고 가장 큰 차수의 항만 고려합니다

## 2. 빅오의 기본 규칙

### 2.1 상수항 제외

- 빅오는 입력 크기에 따른 증가율만 고려합니다
- 실제 연산 횟수나 상수 계수는 제외됩니다

**상수항 제외 예시 - 배열의 절반만 순회**
```python
def find_in_half(arr):
    # O(n/2) -> O(n)
    for i in range(len(arr) // 2):
        if arr[i] == target:
            return i
    return -1
```
- O(n/2)는 O(n)으로 표기합니다.

**상수항 제외 예시 - 2차원 배열의 절반만 순회**
```python
def process_half_matrix(matrix):
    n = len(matrix)
    # O(n²/2) -> O(n²)
    for i in range(n):
        for j in range(i):  # 대각선 아래 부분만 처리
            process(matrix[i][j])
```
- O(n²/2)는 O(n²)으로 표기합니다.

**상수항 제외 예시 - 반복문 내 여러 연산**
```python
def process_with_constants(arr):
    # O(4n) -> O(n) 
    for i in range(len(arr)):
        calculate_sum(arr[i])     # 1회 연산
        find_average(arr[i])      # 1회 연산
        update_max(arr[i])        # 1회 연산
        check_threshold(arr[i])   # 1회 연산
```
- 반복문 내부에 4개의 연산이 있어도 O(4n)은 O(n)으로 표기합니다
- 상수 4는 증가율에 영향을 주지 않으므로 제외됩니다

### 2.2 비우세항 제외

- 가장 빠르게 증가하는 항만 남기고 나머지는 제외합니다

**비우세항 제외 예시**
```python
def example_function(n):
    # O(n² + n + 1) -> O(n²)
    
    for i in range(n):  # O(n)
        for j in range(n):  # O(n)
            print(i, j)
            
    for k in range(n):  # O(n)
        print(k)
        
    print("done")  # O(1)
```
- O(n² + n + 1)은 O(n²)으로 표기합니다.

### 2.3 입력이 다르면 변수도 다르다

**서로 다른 입력 크기의 예시**
```python
def compare_arrays(arr_a, arr_b):
    # O(a + b): a와 b는 서로 다른 입력
    for i in arr_a:  # O(a)
        print(i)
    
    for j in arr_b:  # O(b)
        print(j)

def process_same_array(arr):
    # O(2n) -> O(n): 같은 입력을 두 번 순회
    for i in arr:  # O(n)
        print(i)
    
    for j in arr:  # O(n)
        print(j)
```
- 서로 다른 입력 크기의 변수는 다른 변수로 표기합니다.
- 같은 입력을 두 번 순회하는 경우에는 O(2n) 대신 O(n)으로 표기합니다.
  - 상수항은 제외합니다.

### 2.4 단계의 합산과 곱

**같은 레벨의 반복문 - 합산**
```python
def sequential_loops(n):
    # O(n + n) = O(2n) -> O(n)
    for i in range(n):
        print(i)
        
    for j in range(n):
        print(j)
```
- 같은 레벨의 반복문은 합산하여 표기합니다.

**중첩된 반복문 - 곱**
```python
def nested_loops(n):
    # O(n * n) = O(n²)
    for i in range(n):
        for j in range(n):
            print(i, j)
```
- 중첩된 반복문은 곱하여 표기합니다.

**상수 반복문이 포함된 중첩 반복문**
```python
def nested_with_constant(n):
    # O(n * n * 1000000) -> O(n²)
    for i in range(n):
        for j in range(n):
            for k in range(1000000):  # 상수 반복
                print(i, j, k)
```
- O(n * n * 1000000)은 O(n²)으로 표기합니다.
- 상수 반복문은 영향을 주지 않으므로 제외합니다.

## 3. 대표적인 시간 복잡도

### 3.1 O(1) - 상수 시간

- 입력 크기와 관계없이 항상 일정한 시간이 소요됩니다
- 배열의 인덱스 접근이 대표적인 예시입니다

**O(1) 예제**
```python
def get_first_element(arr):
    return arr[0]
```

### 3.2 O(log n) - 로그 시간

- 입력 크기가 증가할 때 실행 시간이 로그함수처럼 증가합니다
- 이진 탐색이 대표적인 예시입니다

**O(log n) 예제**
```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

### 3.3 O(n) - 선형 시간

- 입력 크기에 비례하여 실행 시간이 증가합니다
- 배열 순회가 대표적인 예시입니다

**O(n) 예제**
```python
def find_max(arr):
    max_val = arr[0]
    for num in arr:
        if num > max_val:
            max_val = num
    return max_val
```

### 3.4 O(n log n) - 선형 로그 시간

- 퀵 정렬, 병합 정렬과 같은 효율적인 정렬 알고리즘의 시간 복잡도입니다

**O(n log n) 예제**
```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)
```

### 3.5 O(n²) - 이차 시간

- 중첩된 반복문에서 주로 나타납니다
- 버블 정렬, 선택 정렬이 대표적인 예시입니다

**O(n²) 예제**
```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
```

### 3.6 O(n!) - 팩토리얼 시간

- 모든 가능한 순열을 생성하는 경우에 나타납니다
- n이 증가할수록 실행 시간이 급격하게 증가합니다
- 외판원 순회 문제(TSP)가 대표적인 예시입니다

**O(n!) 예제**
```python
def generate_permutations(arr):
    if len(arr) <= 1:
        return [arr]
    
    perms = []
    for i in range(len(arr)):
        curr = arr[i]
        remaining = arr[:i] + arr[i+1:]
        
        for p in generate_permutations(remaining):
            perms.append([curr] + p)
    
    return perms
```

## 4. 재귀 알고리즘의 시간 복잡도

### 4.1 재귀 시간 복잡도 분석

- 재귀 호출의 횟수와 각 호출당 작업량을 고려합니다
- 재귀 트리를 그려서 분석하면 도움이 됩니다

**피보나치 재귀 예시**
```python
def fibonacci(n):
    if n <= 1:
        return n
    # T(n) = T(n-1) + T(n-2) + O(1)
    # 시간 복잡도: O(2ⁿ)
    return fibonacci(n-1) + fibonacci(n-2)
```
- 피보나치 재귀 함수의 시간 복잡도는 O(2ⁿ)입니다.
- 재귀 호출이 2번씩 일어나기 때문입니다.

## 5. 공간 복잡도

- 알고리즘이 사용하는 메모리 공간을 분석합니다
- 입력 크기에 따라 추가로 필요한 메모리를 계산합니다
- 재귀 함수의 경우 호출 스택도 고려해야 합니다

**공간 복잡도 예제**
```python
def create_matrix(n):
    # O(n²) 공간 복잡도
    matrix = [[0] * n for _ in range(n)]
    return matrix
```

## 6. 시간 복잡도 비교

### 6.1 실행 시간 비교

- O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)
- 입력 크기가 커질수록 차이가 극명해집니다
- 실제 애플리케이션에서는 일반적으로 O(n log n) 이하를 목표로 합니다

### 6.2 자료구조별 시간 복잡도

- 배열: 접근 O(1), 검색 O(n)
- 해시테이블: 평균 O(1), 최악의 경우 O(n)
- 이진 탐색 트리: 평균 O(log n), 최악의 경우 O(n)