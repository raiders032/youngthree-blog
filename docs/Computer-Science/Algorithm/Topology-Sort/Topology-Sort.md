---
title: "토폴로지 정렬(Topology Sort)"
description: "DAG(Directed Acyclic Graph)에서 선후관계가 있는 작업들의 순서를 결정하는 토폴로지 정렬 알고리즘을 상세히 알아봅니다. 큐를 이용한 구현 방법과 실전 문제 해결 방법을 다룹니다."
date: 2024-11-19
tags: ["TOPOLOGY_SORT", "GRAPH", "QUEUE", "ALGORITHM", "DATA_STRUCTURE", "CODING_TEST"]
keywords: ["토폴로지 정렬", "위상 정렬", "topology sort", "topological sort", "방향성 비순환 그래프", "DAG", "directed acyclic graph", "선수과목", "선행조건", "알고리즘", "그래프 알고리즘"]
draft: false
hide_title: true
---

## 1. 토폴로지 정렬이란?

- 선후 관계가 정의된 작업들을 순서대로 나열하는 알고리즘입니다
- DAG(Directed Acyclic Graph, 방향성 비순환 그래프)에서만 적용 가능합니다
- 선수과목, 프로젝트 일정 관리 등에 활용됩니다

### 1.1 적용 조건

- 그래프는 방향성이 있어야 합니다
- 사이클이 없어야 합니다
- 시작점이 존재해야 합니다 (진입차수가 0인 노드)

## 2. 구현 방법

### 2.1 큐를 이용한 구현

- 진입차수(들어오는 간선의 수)를 이용합니다
- 시간 복잡도: O(V + E) (V: 정점 수, E: 간선 수)

#### 2.1.1 알고리즘 단계

- 모든 노드의 진입차수를 계산합니다
- 진입차수가 0인 노드를 큐에 삽입합니다
- 다음 과정을 노드 수만큼 반복합니다:
	- 큐에서 노드를 꺼냅니다
	- 꺼낸 노드와 연결된 모든 간선을 제거합니다
	- 새롭게 진입차수가 0이 된 노드를 큐에 삽입합니다

### 2.2 구현 예제

#### 2.2.1 백준 2252번: 줄 세우기 문제 풀이

```python
import sys
from collections import deque

def topology_sort(N, graph, inDegree):
    """
    토폴로지 정렬을 수행하는 함수
    
    Args:
        N (int): 노드의 개수
        graph (list): 그래프의 인접 리스트
        inDegree (list): 각 노드의 진입차수
    
    Returns:
        list: 위상 정렬된 결과
    """
    queue = deque()
    result = []

    # 진입차수가 0인 노드를 큐에 삽입
    for i in range(1, N + 1):
        if inDegree[i] == 0:
            queue.append(i)

    # 노드의 수만큼 반복
    for _ in range(N):
        # 큐가 비어있다면 사이클이 존재
        if not queue:
            return None
            
        # 큐에서 노드를 꺼내어 결과에 추가
        current = queue.popleft()
        result.append(current)

        # 연결된 노드들의 진입차수를 감소
        for next_node in graph[current]:
            inDegree[next_node] -= 1
            # 진입차수가 0이 되면 큐에 삽입
            if inDegree[next_node] == 0:
                queue.append(next_node)

    return result

def main():
    input = sys.stdin.readline
    
    # 입력 받기
    N, M = map(int, input().split())
    graph = [[] for _ in range(N + 1)]
    inDegree = [0] * (N + 1)

    # 그래프 구성
    for _ in range(M):
        a, b = map(int, input().split())
        graph[a].append(b)
        inDegree[b] += 1

    # 위상 정렬 수행
    result = topology_sort(N, graph, inDegree)
    
    # 결과 출력
    if result:
        print(*result)
    else:
        print("사이클이 존재합니다")

if __name__ == "__main__":
    main()
```

## 3. 실전 응용

### 3.1 대표적인 문제 유형

- 선수과목 순서 결정하기
- 프로젝트 일정 관리
- 작업 순서 정하기

### 3.2 추천 문제

- 백준 2252번: 줄 세우기
	- 기본적인 토폴로지 정렬 구현
- 백준 14567번: 선수과목
	- 선수과목 조건을 토폴로지 정렬로 해결

## 4. 시간 복잡도 분석

### 4.1 각 단계별 복잡도

- 진입차수 계산: O(E)
- 큐를 이용한 정렬: O(V + E)
- 전체 시간 복잡도: O(V + E)

### 4.2 공간 복잡도

- 인접 리스트: O(E)
- 진입차수 배열: O(V)
- 큐: O(V)
- 전체 공간 복잡도: O(V + E)

## 5. 참고 자료

- [유튜브 강의: 토폴로지 정렬 알고리즘](https://www.youtube.com/watch?v=qzfeVeajuyc)
- [백준 온라인 저지](https://www.acmicpc.net/problem/2252)