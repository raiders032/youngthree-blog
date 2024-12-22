---
title: "Kruskal 알고리즘"
description: "크루스칼 알고리즘의 동작 원리와 구현 방법을 상세히 설명합니다. 최소 신장 트리(MST) 구현을 위한 실제 코드 예제와 함께 알고리즘의 핵심 개념을 다룹니다."
tags: ["ALGORITHM", "GRAPH", "KRUSKAL", "MST", "GREEDY", "DISJOINT_SET", "DATA_STRUCTURE"]
keywords: ["크루스칼", "kruskal", "크루스칼 알고리즘", "최소 신장 트리", "MST", "Minimum Spanning Tree", "그래프", "graph", "그리디", "greedy", "서로소 집합", "disjoint set", "union-find", "알고리즘", "algorithm"]
draft: false
hide_title: true
---

## 1 크루스칼 알고리즘 소개

- 크루스칼(Kruskal) 알고리즘은 최소 신장 트리(Minimum Spanning Tree, MST)를 찾는 대표적인 알고리즘입니다.
- 이 알고리즘은 그리디(Greedy) 알고리즘으로 분류되며, 간선의 가중치를 기준으로 최소 비용의 간선부터 선택하여 트리를 구성합니다.

## 2 알고리즘 동작 원리

### 2.1 기본 동작 과정

크루스칼 알고리즘은 다음과 같은 순서로 동작합니다:

1. 모든 간선을 가중치(비용)에 따라 오름차순으로 정렬합니다.
2. 정렬된 간선을 순서대로 확인하며 다음 과정을 수행합니다:
	- 현재 간선이 사이클을 발생시키는지 확인
	- 사이클이 발생하지 않는 경우에만 해당 간선을 선택
3. 전체 간선에 대해 2번 과정을 반복합니다.

### 2.2 사이클 판별

- 사이클 발생 여부는 서로소 집합(Disjoint Set) 자료구조를 사용하여 판별합니다:
	- [Disjoint-Set.md](../../DataStructure/DisjointSet/DisjointSet)

1. 간선의 양 끝 노드에 대해 find 연산을 수행하여 각각의 루트 노드를 확인
2. 두 루트 노드가 같다면 사이클이 발생하므로 해당 간선을 제외
3. 두 루트 노드가 다르다면 union 연산을 수행하여 두 집합을 합침

### 2.3 구현 예제

- 다음은 백준 1922번 문제를 해결하는 크루스칼 알고리즘의 구현 코드입니다
	- https://www.acmicpc.net/problem/1922

```python
import sys
input = sys.stdin.readline

def find(node):
    """Find 연산: 노드의 루트 노드를 찾아 반환"""
    if disjoint_set[node] != node:
        disjoint_set[node] = find(disjoint_set[node])
    return disjoint_set[node]

def union(node1, node2):
    """Union 연산: 두 집합을 하나로 합침"""
    root1 = find(node1)
    root2 = find(node2)

    if root1 <= root2:
        disjoint_set[root2] = root1
    else:
        disjoint_set[root1] = root2

def kruskal():
    """크루스칼 알고리즘 구현"""
    V = int(input())  # 정점 개수
    E = int(input())  # 간선 개수
    
    # 간선 정보 입력 받기
    edges = []
    for _ in range(E):
        v1, v2, weight = map(int, input().split())
        edges.append((weight, v1, v2))
    
    # 간선을 가중치 기준으로 정렬
    edges.sort()
    
    # 최소 신장 트리 구성
    mst_cost = 0
    for weight, v1, v2 in edges:
        if find(v1) != find(v2):  # 사이클이 발생하지 않는 경우
            union(v1, v2)
            mst_cost += weight
            
    return mst_cost

# 초기화 및 실행
disjoint_set = [i for i in range(V + 1)]  # 서로소 집합 초기화
result = kruskal()
print(result)
```

## 3 시간 복잡도

크루스칼 알고리즘의 시간 복잡도는 두 주요 부분으로 구성됩니다:

### 3.1 전체 시간 복잡도: O(E log E)

여기서 E는 간선의 개수입니다. 전체 시간 복잡도는 다음 두 부분의 합으로 결정됩니다:

### 3.2 부분별 시간 복잡도 분석

1. **간선 정렬: O(E log E)**
	- 모든 간선을 가중치 기준으로 정렬
	- 비교 기반 정렬 알고리즘(예: 퀵소트, 머지소트 등) 사용
	- E개의 원소를 정렬하므로 O(E log E) 시간 소요

2. **서로소 집합 연산: O(E)**
	- 각 간선에 대해 다음 연산 수행:
		- Find 연산 2회 (각 정점의 루트 노드 확인)
		- Union 연산 최대 1회 (사이클이 없는 경우)
	- 최적화된 서로소 집합에서 각 연산의 시간 복잡도:
		- Find 연산: O(α(V)) ≈ O(1) (경로 압축 최적화)
		- Union 연산: O(α(V)) ≈ O(1) (랭크 기반 합집합 최적화)
		- α(V)는 애커만 함수의 역함수로, 실제로는 4보다 작은 상수
	- 따라서 E개의 간선에 대해 O(E) 시간 소요
    - [Disjoint Set 문서에서 시간 복잡도 참고](../../DataStructure/DisjointSet/DisjointSet)

### 3.3 결론 

- 두 부분의 시간 복잡도를 비교하면 O(E log E)가 O(E)를 지배
- 따라서 전체 시간 복잡도는 간선 정렬에 의해 결정되어 O(E log E)
- 이는 크루스칼 알고리즘이 중간 크기의 그래프에서도 효율적으로 동작할 수 있음을 의미

### 3.4 공간 복잡도

- 간선 리스트 저장: O(E)
- 서로소 집합 배열: O(V)
- 전체 공간 복잡도: O(E + V)

## 4 활용 및 응용

크루스칼 알고리즘은 다음과 같은 상황에서 활용됩니다:

- 네트워크 구축: 최소 비용으로 모든 노드를 연결
- 도로 건설: 최소 비용으로 모든 도시를 연결
- 전기 회로: 최소 비용으로 모든 단자를 연결

## 5 관련 문제

- [백준 1197번: 최소 스패닝 트리](https://www.acmicpc.net/problem/1197)
- [백준 1922번: 네트워크 연결](https://www.acmicpc.net/problem/1922)

## 6 참고 자료

- [동빈나 님의 알고리즘 강의](https://www.youtube.com/watch?v=LQ3JHknGy8c)
- [Disjoint Set 자료구조](../../DataStructure/DisjointSet/DisjointSet)