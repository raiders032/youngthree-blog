---
title: "Disjoint Set(서로소 집합)"
description: "서로소 집합(Disjoint Set) 완벽 가이드: 서로소 집합(Disjoint Set) 자료구조의 개념부터 최적화된 구현까지 상세히 알아봅니다. 경로 압축과 Union by Height 최적화 기법의 정확한 시간 복잡도 분석을 포함한 완벽 가이드입니다."
tags: ["DATA_STRUCTURE", "ALGORITHM", "PYTHON", "CODING_TEST"]
keywords: ["서로소 집합", "disjoint set", "상호배타적집합", "유니온파인드", "union find", "서로소", "자료구조", "알고리즘", "경로압축", "path compression", "합집합찾기", "데이터구조"]
draft: false
hide_title: true
---

## 1. 서로소 집합 개요

- 서로소 집합(Disjoint Set)은 서로 중복되는 원소가 없는 둘 이상의 집합을 의미합니다. 
- 예를 들어, 집합 {1, 2}와 {3, 4}는 공통 원소가 없으므로 서로소 집합입니다. 
- 이 자료구조는 네트워크 연결 상태 파악, 사이클 판별, 최소 신장 트리 알고리즘 구현, 게임의 길드/팀 관리 시스템 등에서 유용하게 사용됩니다.

## 2. 자료구조 구현

- 서로소 집합은 트리 구조로 구현됩니다. 
- 각 원소는 자신이 속한 집합의 대표원소(루트)를 가리키며, 초기에는 각 원소가 자신만을 포함하는 단독 집합의 루트입니다. 
- 구현 시 배열을 사용하며, -1은 루트 노드를, 양수는 자신의 부모 노드의 인덱스를 의미합니다.

#### 초기화 코드
```python
def make_set(n):
    return [-1 for _ in range(n)]
```
- 초기에는 각 원소가 자신만을 포함하는 단독 집합이므로, 모든 원소를 -1로 초기화합니다.

## 3. 기본 연산과 최적화 기법

### 3.1 Find 연산

- Find 연산은 특정 원소가 속한 집합의 루트를 찾는 연산입니다. 
- 재귀적으로 부모를 따라가며 루트 노드(-1을 가진 노드)를 찾습니다.

#### 기본적인 Find 구현
```python
def find(parent, x):
    if parent[x] == -1:
        return x
    return find(parent, parent[x])
```
- 재귀적으로 부모를 따라가며 루트 노드를 찾습니다.
- 시간 복잡도: O(N)
  - 최악의 경우, 트리의 높이가 N이 되어 모든 노드를 탐색해야 합니다.

### 3.2 Union 연산

- Union 연산은 두 집합을 하나로 합치는 연산입니다. 
- 한 집합의 루트가 다른 집합의 루트를 가리키도록 합니다.

#### 기본적인 Union 구현
```python
def union(parent, a, b):
    root_a = find(parent, a)
    root_b = find(parent, b)
    
    # 이미 같은 집합인 경우
    if root_a == root_b:
        return False
        
    # b의 루트가 a의 루트를 가리키도록 설정
    parent[root_b] = root_a
    return True
```
- 각 원소의 루트를 찾은 후, 한 루트를 다른 루트의 부모로 설정합니다.
- 시간 복잡도: O(N)
  - Find 연산의 시간 복잡도가 O(N)이므로, Union 연산도 O(N)입니다. 

## 4. 최적화 기법과 시간 복잡도

### 4.1 Path Compression (경로 압축)

- Path Compression은 Find 연산을 수행하면서 발견한 모든 노드가 직접 루트를 가리키도록 하는 최적화 기법입니다.

:::note[Path Compression의 정확한 시간 복잡도]
Path Compression만 단독으로 사용할 경우의 시간 복잡도는 O(log N)이 아닌 O(log* N)입니다. 여기서 log* N은 iterative logarithm으로, N에 log를 몇 번 적용해야 1 이하가 되는지를 나타냅니다. 이는 log N보다 훨씬 작은 값이지만, 상수는 아닙니다.

예시:
- log* 16 = 3 (16 → 4 → 2 → 1)
- log* 65536 = 4 (65536 → 16 → 4 → 2 → 1)
:::

#### Path Compression 구현
```python
def find_with_compression(parent, x):
    if parent[x] < 0:
        return x
    parent[x] = find_with_compression(parent, parent[x])
    return parent[x]
```
- Find 연산 시, 루트를 찾은 후 해당 노드의 부모를 루트로 설정합니다.

### 4.2 Union by Height

- Union by Height는 트리의 높이를 최소화하기 위한 기법으로, 항상 높이가 더 큰 트리 아래에 높이가 작은 트리를 붙입니다.
- 두 트리의 높이가 같을 때만 결과 트리의 높이가 1 증가합니다.

#### Union by Height 구현
```python
def union_by_height(parent, a, b):
    root_a = find(parent, a)
    root_b = find(parent, b)
    
    if root_a == root_b:
        return False
        
    height_a = -parent[root_a]  # a 트리의 높이
    height_b = -parent[root_b]  # b 트리의 높이
    
    # 더 높은 트리가 root_a가 되도록
    if height_a < height_b:
        root_a, root_b = root_b, root_a
    
    # root_b를 root_a의 자식으로 설정
    parent[root_b] = root_a
    
    # 높이가 같은 경우 높이 증가
    if height_a == height_b:
        parent[root_a] -= 1
        
    return True
```
- 각 루트의 높이를 저장하고, 높이가 작은 트리를 높이가 큰 트리에 붙입니다.

#### 4.2.1 Union by Height 시간 복잡도

- Union by Height의 시간 복잡도를 계산해보겠습니다.
- 먼저 트리 높이가 증가 하는 조건에 대해서 살펴보겠습니다
  - Union by Height에서는 트리의 높이가 증가하는 경우가 매우 제한적입니다 
  - 높이가 증가하는 유일한 경우는 "두 트리의 높이가 정확히 같을 때" 뿐입니다 
  - 다른 높이의 트리를 합칠 때는 항상 작은 트리가 큰 트리 밑으로 들어가므로 최대 높이가 증가하지 않습니다
- 트리 크기와 높이의 관계
  - 높이가 h인 트리가 가질 수 있는 최소 노드 수를 분석해보면:
    - 높이 1: 최소 2개 노드
    - 높이 2: 최소 4개 노드
    - 높이 3: 최소 8개 노드
    - 높이 4: 최소 16개 노드
  - 즉, 높이가 h인 트리는 최소 2^h개의 노드를 가져야 합니다
- 최대 높이 도출
  - N개의 노드가 있을 때, 트리의 높이를 h라고 하면
  - 2^h ≤ N (트리의 최소 노드 수는 N을 넘을 수 없음)
  - h ≤ log₂N 
  - 따라서 트리의 높이는 항상 log₂N 이하가 됩니다
- 연신 시간 복잡도
  - Find 연산: 트리의 높이만큼 탐색하므로 O(log N)
  - Union 연산: 두 번의 Find 연산과 O(1)의 추가 작업이 필요하므로 O(log N)
- 따라서 Union by Height의 시간 복잡도는 O(log N)입니다

### 4.3 시간 복잡도 요약

각 최적화 기법별 시간 복잡도:

1. 기본 구현: O(N)
2. Union by Height만 사용: O(log N)
3. Path Compression만 사용: O(log* N)
4. 둘 다 사용: O(α(N)) ≈ O(1)

:::tip[α(N) 함수]
α(N)은 애커만 함수의 역함수로, 실제로는 4보다 작은 상수입니다. 따라서 서로소 집합의 최적화된 시간 복잡도는 상수 시간에 가깝습니다.
:::

## 5. 최적화된 최종 구현

```python
class DisjointSet:
    def __init__(self, n):
        self.parent = [-1 for _ in range(n)]
    
    def find(self, x):
        if self.parent[x] < 0:
            return x
        self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, a, b):
        root_a = self.find(a)
        root_b = self.find(b)
        
        if root_a == root_b:
            return False
            
        height_a = -self.parent[root_a]
        height_b = -self.parent[root_b]
        
        if height_a < height_b:
            root_a, root_b = root_b, root_a
            
        self.parent[root_b] = root_a
        if height_a == height_b:
            self.parent[root_a] -= 1
            
        return True
```

## 6. 응용 예제

### 6.1 사이클 판별

```python
def has_cycle(n, edges):
    ds = DisjointSet(n)
    
    for a, b in edges:
        if not ds.union(a, b):
            return True
    return False
```

### 6.2 네트워크 연결 상태 확인

```python
def is_connected(n, connections, queries):
    ds = DisjointSet(n)
    
    for a, b in connections:
        ds.union(a, b)
    
    return [ds.find(a) == ds.find(b) for a, b in queries]
```

## 7. 주의사항

1. 경로 압축 사용 시 실제 트리의 높이는 저장된 높이보다 작아질 수 있으나, 이는 Union by Height의 정확성에 영향을 주지 않습니다.
2. Union by Size라는 변형도 있으며, 이는 트리의 높이 대신 집합의 크기를 기준으로 합칩니다.
3. 구현 시 노드 번호의 시작점(0 또는 1)을 명확히 해야 합니다.