---
title: "그래프(Graph)"
description: "그래프의 기본 개념부터 다양한 종류, 표현 방법, 순회 알고리즘까지 상세히 알아봅니다. 트리와의 차이점, DAG와 위상 정렬의 관계, 연결 요소의 개념과 구현까지 그래프를 깊이 있게 이해해보세요."
date: 2024-11-19
tags: ["GRAPH", "DATA_STRUCTURE", "ALGORITHM", "DFS", "BFS", "TOPOLOGY_SORT", "UNION_FIND"]
keywords: ["그래프", "graph", "그래프 자료구조", "graph data structure", "DFS", "BFS", "깊이우선탐색", "너비우선탐색", "인접행렬", "인접리스트", "위상정렬", "연결요소", "컴포넌트", "유니온파인드"]
draft: false
hide_title: true
---

## 1. 그래프의 개요

- 정점(Vertex)과 간선(Edge)으로 구성된 비선형 자료구조입니다
- 객체 간의 관계를 표현하는데 가장 적합한 자료구조입니다
- 네트워크 모델을 추상화한 자료구조로 다양한 분야에서 활용됩니다

#### 비선형 자료구조
- 비선형 자료구조란 데이터를 순차적으로 저장하지 않는 자료구조를 의미합니다 
- 데이터가 계층적이거나 네트워크 형태로 연결된 구조를 표현할 때 사용합니다 
- 하나의 데이터 뒤에 여러 개의 데이터가 올 수 있습니다. 따라서 데이터 탐색 시 여러 경로를 따라가야 합니다 
- 대표적인 비선형 자료구조로는 그래프, 트리, 힙 등이 있습니다

### 1.1 그래프의 특징

- 두 정점 사이에 여러 경로가 존재할 수 있습니다
- 순환(Cycle)이 발생할 수 있습니다
- 네트워크 형태의 관계 표현이 가능합니다
- 하나의 그래프는 여러 개의 연결 요소로 구성될 수 있습니다

## 2. 트리와 그래프 비교

### 2.1 주요 차이점

| 특성 | 그래프 | 트리 |
|------|--------|------|
| 순환 | 가능 | 불가능 |
| 방향성 | 방향 있거나 없을 수 있음 | 부모에서 자식으로의 단방향 |
| 루트 노드 | 존재하지 않음 | 반드시 하나 존재 |
| 부모-자식 관계 | 없음 | 명확히 존재 |
| 노드 간 경로 | 여러 경로 가능 | 유일한 경로 존재 |
| 연결성 | 연결되지 않을 수 있음 | 모든 노드 연결됨 |

## 3. 그래프의 구성 요소와 종류

### 3.1 기본 구성 요소

#### 3.1.1 정점(Vertex)
```python
class Vertex:
    def __init__(self, value):
        self.value = value
        self.edges = []
```
- 정점은 값을 가지며 간선의 집합을 가집니다
- 값은 정점을 식별하는 데 사용됩니다

#### 3.1.2 간선(Edge)
```python
class Edge:
    def __init__(self, from_vertex, to_vertex, weight=None):
        self.from_vertex = from_vertex
        self.to_vertex = to_vertex
        self.weight = weight
```
- 간선은 두 정점을 연결하며 가중치를 가질 수 있습니다
- 가중치는 두 정점 사이의 거리나 비용을 나타냅니다

### 3.2 그래프의 종류

#### 3.2.1 무향 그래프(Undirected Graph)
```python
def add_undirected_edge(graph, v1, v2):
    graph[v1].append(v2)
    graph[v2].append(v1)
```
- 간선에 방향성이 없는 그래프입니다.
- 두 정점 사이의 연결을 양방향으로 표현합니다.

#### 3.2.2 유향 그래프(Directed Graph)
```python
def add_directed_edge(graph, from_v, to_v):
    graph[from_v].append(to_v)
```
- 간선에 방향성이 있는 그래프입니다.
- 한 정점에서 다른 정점으로의 방향이 존재합니다.

#### 3.2.3 가중 그래프(Weighted Graph)
```python
def add_weighted_edge(graph, from_v, to_v, weight):
    graph[from_v].append((to_v, weight))
```
- 간선에 가중치가 있는 그래프입니다.
- 두 정점 사이의 거리나 비용을 나타내는 가중치를 가집니다.

#### 3.2.4 자가 루프 그래프(Self-loop Graph)
- 노드가 자기 자신을 가리키는 간선을 가진 그래프

#### 3.2.5 DAG(Directed Acyclic Graph)
- 방향성이 있고 순환이 없는 그래프
- 위상 정렬의 기반이 되는 자료구조
  - 위상 정렬이란 선후 관계가 정의된 작업들을 순서대로 나열하는 알고리즘입니다.
  - [Topology-Sort.md](../../Algorithm/Topology-Sort/Topology-Sort.md) 참고

### 3.3 연결 요소(Component)

- 그래프 내에서 서로 분리된 부분 그래프를 의미합니다
- 하나의 그래프는 여러 개의 연결 요소로 구성될 수 있습니다

#### 3.3.1 연결 요소의 특징

- 연결 요소 내의 모든 노드는 서로 경로로 연결되어야 합니다
- 연결 요소 외부의 노드와는 연결되지 않아야 합니다
- 무방향 그래프에서는 '연결 요소', 방향 그래프에서는 '강한 연결 요소'라고 합니다

#### 3.3.2 연결 요소 찾기 알고리즘

##### DFS를 이용한 방법
```python
def find_components_dfs(graph):
    def dfs(vertex):
        visited[vertex] = component_id
        for neighbor in graph[vertex]:
            if visited[neighbor] == -1:
                dfs(neighbor)
    
    visited = [-1] * len(graph)
    component_id = 0
    
    for vertex in range(len(graph)):
        if visited[vertex] == -1:
            dfs(vertex)
            component_id += 1
    
    return component_id, visited
```
- 방문하지 않은 정점을 시작으로 DFS를 수행하여 연결 요소를 찾습니다
- 방문 여부를 나타내는 visited 배열을 사용합니다


##### BFS를 이용한 방법
```python
from collections import deque

def find_components_bfs(graph):
    def bfs(start):
        queue = deque([start])
        visited[start] = component_id
        
        while queue:
            vertex = queue.popleft()
            for neighbor in graph[vertex]:
                if visited[neighbor] == -1:
                    visited[neighbor] = component_id
                    queue.append(neighbor)
    
    visited = [-1] * len(graph)
    component_id = 0
    
    for vertex in range(len(graph)):
        if visited[vertex] == -1:
            bfs(vertex)
            component_id += 1
    
    return component_id, visited
```
- 방문하지 않은 정점을 시작으로 BFS를 수행하여 연결 요소를 찾습니다

##### Disjoint Set(Union-Find)을 이용한 방법
```python
class DisjointSet:
    def __init__(self, size):
        self.parent = list(range(size))
        self.rank = [0] * size
    
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1

def find_components_unionfind(graph):
    n = len(graph)
    ds = DisjointSet(n)
    
    # 모든 간선에 대해 union 수행
    for vertex in range(n):
        for neighbor in graph[vertex]:
            ds.union(vertex, neighbor)
    
    # 각 노드의 루트 노드를 찾아 연결 요소 식별
    components = {}
    for vertex in range(n):
        root = ds.find(vertex)
        if root not in components:
            components[root] = []
        components[root].append(vertex)
    
    return len(components), [ds.find(i) for i in range(n)]
```
- Disjoint Set(Union-Find) 자료구조를 사용하여 연결 요소를 찾습니다
- 각 노드의 루트 노드를 찾아 연결 요소를 식별합니다
  - [Disjoint-Set.md](../DisjointSet/DisjointSet) 참고

## 4. 그래프의 표현 방법

### 4.1 인접 행렬(Adjacency Matrix)
```python
class GraphMatrix:
    def __init__(self, vertices):
        self.V = vertices
        self.graph = [[0] * vertices for _ in range(vertices)]
    
    def add_edge(self, v1, v2, weight=1):
        self.graph[v1][v2] = weight
        self.graph[v2][v1] = weight  # 무향 그래프의 경우
```
- 정점 간의 연결 관계를 2차원 배열로 표현합니다
- 간선의 존재 여부를 O(1) 시간에 확인할 수 있습니다
- 메모리 사용량이 O(V²)로 크다는 단점이 있습니다
- 무향 그래프의 경우 대각선을 기준으로 대칭성을 가집니다
- 가중치가 있는 그래프의 경우 0이 아닌 값으로 가중치를 표현합니다
- 연결되지 않은 정점 사이의 거리를 무한대로 표현할 수 있습니다

### 4.2 인접 리스트(Adjacency List)
```python
class GraphList:
    def __init__(self, vertices):
        self.V = vertices
        self.graph = [[] for _ in range(vertices)]
    
    def add_edge(self, v1, v2, weight=1):
        self.graph[v1].append((v2, weight))
        self.graph[v2].append((v1, weight))  # 무향 그래프의 경우
```
- 각 정점마다 연결된 정점을 리스트로 표현합니다
- 간선의 존재 여부를 O(V) 시간에 확인할 수 있습니다
- 메모리 사용량이 O(V + E)로 적다는 장점이 있습니다
- 무향 그래프의 경우 각 정점의 연결 리스트에 반대편 정점을 추가합니다
- 가중치가 있는 그래프의 경우 정점과 가중치를 튜플로 표현합니다

## 5. 그래프 순회

### 5.1 깊이 우선 탐색(DFS)
```python
def dfs(graph, start):
    visited = set()
    
    def dfs_recursive(vertex):
        visited.add(vertex)
        print(vertex, end=' ')
        
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                dfs_recursive(neighbor)
    
    dfs_recursive(start)
```
- 재귀 함수를 이용하여 깊이 우선 탐색을 수행합니다
- 방문한 정점을 저장하는 visited 집합을 사용합니다
  - 무한 루프를 방지하기 위해 방문 여부를 확인합니다
- [DFS.md](../../Algorithm/DFS/DFS.md) 참고

### 5.2 너비 우선 탐색(BFS)
```python
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    
    while queue:
        vertex = queue.popleft()
        print(vertex, end=' ')
        
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```
- 큐를 이용하여 너비 우선 탐색을 수행합니다
- 방문한 정점을 저장하는 visited 집합과 큐를 사용합니다
- [BFS.md](../../Algorithm/BFS/BFS.md) 참고

## 6 추천 문제
- 연결 요소 찾기 문제
  - [프로그래머스 네트워크](https://school.programmers.co.kr/learn/courses/30/lessons/43162?language=java)