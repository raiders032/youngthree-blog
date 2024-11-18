## 1 Disjoint Set 개요

- 서로소 집합(Disjoint Set)은 서로 중복되는 원소가 없는 둘 이상의 집합을 의미합니다.
- 예를 들어, 집합 {1, 2}와 {3, 4}는 공통 원소가 없기 때문에 서로소 집합입니다.
- 서로소 집합 자료구조는 다음과 같은 상황에서 매우 유용하게 사용됩니다:
    - 네트워크 연결 상태 파악
    - 사이클 판별
    - 최소 신장 트리 알고리즘 구현
    - 게임의 길드/팀 관리 시스템



## 2 자료구조 구현

- 서로소 집합은 트리 구조를 사용하여 구현합니다.
- 각 원소는 자신이 속한 집합의 대표원소(루트)를 가리킵니다.
- 초기에는 각 원소가 자신만을 포함하는 단독 집합의 루트입니다.
- 구현 시 배열을 사용하며, 다음과 같이 표현합니다:
    - `-1`: 루트 노드를 의미합니다.
    -  양수: 자신의 부모 노드의 인덱스를 저장



**초기화 코드**

```python
def make_set(n):
    # 크기가 n인 서로소 집합 초기화
    # 초기에는 모든 노드가 루트 노드
    return [-1 for _ in range(n)]
```



## 3 기본 연산

### 3.1 Find 연산

- Find 연산은 특정 원소가 속한 집합의 루트를 찾는 연산입니다.
- 재귀적으로 부모를 따라가면서 루트 노드를 찾습니다.
- 루트 노드는 `-1` 을 가지는 노드입니다.
- 시간 복잡도: O(N)
    - 최악의 경우 트리가 한쪽으로 치우쳐져서 높이가 N이 될 수 있음



**기본적인 Find 구현**

```python
def find(parent, x):
    # 루트 노드인 경우 자신을 반환 
    if parent[x] == -1:
        return x
    # 루트를 찾을 때까지 재귀적으로 탐색
    return find(parent, parent[x])
```



### 3.2 Union 연산

- Union 연산은 두 개의 집합을 하나로 합치는 연산입니다.
- 기본적인 구현에서는 단순히 한 집합의 루트가 다른 집합의 루트를 가리키도록 합니다.
- 합치기에 성공하면 True, 이미 같은 집합이면 False를 반환합니다.
- 시간 복잡도: O(N)
    - Find 연산을 포함하므로 O(N)



**기본적인 Union 구현**

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



## 4 최적화 기법

### 4.1 Union by Height (높이를 이용한 합치기)

- 트리의 높이를 최소화하기 위한 최적화 기법입니다.
- parent 배열의 음수 값으로 트리의 높이를 표현합니다:
    - -1은 높이가 1인 트리의 루트
    - -2는 높이가 2인 트리의 루트
    - -3은 높이가 3인 트리의 루트
- 항상 높이가 더 큰 트리 아래에 높이가 작은 트리를 붙입니다.
- 두 트리의 높이가 같을 때만 결과 트리의 높이가 1 증가합니다.



**Union by Height 구현**
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
        height_a, height_b = height_b, height_a
        
    # b를 a 아래에 붙임
    parent[root_b] = root_a
    
    # 높이가 같았다면 합친 후 높이 1 증가
    if height_a == height_b:
        parent[root_a] -= 1
        
    return True
```



### 4.2 Path Compression (경로 압축)

- Find 연산을 수행하면서 발견한 모든 노드들이 직접 루트를 가리키도록 합니다.
- 이를 통해 이후의 Find 연산이 더 빠르게 수행됩니다.
- 경로 압축을 사용하면 실제 트리의 높이는 parent 배열에 저장된 높이보다 작아질 수 있습니다.



**Path Compression 구현**
```python
def find_with_compression(parent, x):
    if parent[x] < 0:
        return x
        
    # 경로 압축: 재귀 호출의 결과를 저장
    parent[x] = find_with_compression(parent, parent[x])
    return parent[x]
```



### 4.3 시간 복잡도 분석

- n은 원소의 개수, m은 연산의 개수일 때:


**기본 구현**

- Find: O(n)
- Union: O(n)
- 최악의 경우 트리가 한쪽으로 치우쳐질 수 있음



**Union by Height만 적용**

- Find: O(log n)
- Union: O(log n)
- 트리의 높이가 log n을 넘지 않음



**Path Compression만 적용**

- 평균적으로 Find: O(log n)
- 최악의 경우는 여전히 O(n)
- 연속된 Find 연산에서 점점 빨라짐



**둘 다 적용 (Union by Height + Path Compression)**

- 평균 시간복잡도: O(α(n))
    - α(n)은 아커만 함수의 역함수
    - 실제로는 4를 거의 넘지 않는 매우 작은 상수
- 사실상 상수 시간에 가까운 성능을 보임



## 5 최적화된 최종 구현

```python
class DisjointSet:
    def __init__(self, n):
        # 음수: 루트 노드이며 절대값이 트리의 높이
        # 양수: 부모 노드의 인덱스
        self.parent = [-1 for _ in range(n)]  # 초기 높이는 1
    
    def find(self, x):
        if self.parent[x] < 0:
            return x
        # Path Compression
        self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, a, b):
        root_a = self.find(a)
        root_b = self.find(b)
        
        if root_a == root_b:
            return False  # 이미 같은 집합
            
        height_a = -self.parent[root_a]  # a 트리의 높이
        height_b = -self.parent[root_b]  # b 트리의 높이
        
        # 더 높은 트리가 root_a가 되도록
        if height_a < height_b:
            root_a, root_b = root_b, root_a
            height_a, height_b = height_b, height_a
            
        # b를 a 아래에 붙임
        self.parent[root_b] = root_a
        
        # 높이가 같았다면 합친 후 높이 1 증가
        if height_a == height_b:
            self.parent[root_a] -= 1
            
        return True  # 집합을 합침
```



## 6 응용 예제

### 6.1 사이클 판별

- 무방향 그래프에서 사이클 존재 여부를 판별할 수 있습니다.
- 각 간선을 확인하면서 두 정점이 이미 같은 집합에 속해있다면 사이클이 존재합니다.



**사이클 판별 코드**

```python
def has_cycle(n, edges):
    ds = DisjointSet(n)
    
    for a, b in edges:
        # 이미 같은 집합에 속한 경우 사이클 발견
        if not ds.union(a, b):
            return True
    return False
```



### 6.2 네트워크 연결 상태 확인

- 두 노드가 같은 네트워크에 속해있는지 확인할 수 있습니다.
- 온라인 게임의 파티 시스템이나 친구 관계 확인 등에 활용됩니다.



**네트워크 연결 확인 코드**

```python
def is_connected(n, connections, queries):
    ds = DisjointSet(n)
    
    # 연결 정보 처리
    for a, b in connections:
        ds.union(a, b)
    
    # 쿼리 처리
    result = []
    for a, b in queries:
        result.append(ds.find(a) == ds.find(b))
    return result
```



## 7 주의사항

- 경로 압축을 사용할 때 실제 트리의 높이가 저장된 높이보다 작아질 수 있습니다:
    - 이는 성능에는 영향을 주지 않습니다
    - Union by Height의 정확성에도 영향을 미치지 않습니다
- 트리의 높이 대신 집합의 크기를 저장하는 구현도 가능합니다:
    - 음수 값을 집합의 크기로 활용
    - 이를 Union by Size라고 합니다
- 실제 구현 시에는 노드 번호가 0부터 시작하는지 1부터 시작하는지 주의해야 합니다.