---
title: "BFS(너비 우선 탐색) 완벽 가이드 - 개념부터 구현까지"
description: "BFS(Breadth First Search) 알고리즘의 개념, 동작 원리, 구현 방법을 상세히 알아봅니다. 큐를 활용한 구현 방법과 시간 복잡도 분석을 통해 BFS의 효율성을 이해하고, 실제 문제 해결에 적용하는 방법을 설명합니다."
tags: ["ALGORITHM", "DATA_STRUCTURE", "BFS", "PYTHON", "CODING_TEST"]
keywords: ["BFS", "너비 우선 탐색", "그래프 탐색", "알고리즘", "큐", "최단경로", "그래프 순회"]
draft: false
---

## 1 BFS 개념

* BFS(Breadth First Search)는 너비 우선 탐색의 약자입니다
* 그래프나 트리 구조에서 노드를 탐색하는 알고리즘입니다
  * [Graph.md](../../Data-Structure/Graph/Graph.md) 참고
  * [Tree.md](../../Data-Structure/Tree/Tree.md) 참고
* 시작 노드에서 가까운 노드부터 차례대로 탐색합니다
* 같은 레벨의 노드들을 먼저 방문한 후 다음 레벨로 진행합니다
  * 레벨이란 시작 노드로부터의 거리를 의미합니다.

### 1.1 BFS의 특징

* 큐(Queue) 자료구조를 사용합니다
* 그래프의 각 간선이 가중치가 1이거나 가중치가 없는 경우에 최단 경로를 찾는데 유용합니다 
  * 가중치가 없는 경우: 모든 간선의 비용이 1이라고 간주합니다 
  * 중치가 서로 다른 경우: 다익스트라 알고리즘을 사용해야 합니다
* 메모리를 많이 사용하는 단점이 있습니다

## 2 BFS 동작 원리

* 시작 노드를 큐에 넣고 방문 처리를 합니다
* 큐에서 노드를 꺼내 해당 노드의 인접 노드를 확인합니다
* 방문하지 않은 인접 노드를 모두 큐에 넣고 방문 처리합니다
* 큐가 빌 때까지 위 과정을 반복합니다

### 2.1 Python 구현 예시

#### BFS 기본 구현
```python
from collections import deque

def bfs(graph, start, visited):
    # 시작 노드를 큐에 넣고 방문 처리
    queue = deque([start])    # deque를 사용하여 큐 구현 (popleft의 시간복잡도가 O(1))
    visited[start] = True     # 시작 노드 방문 처리
    
    # 큐가 빌 때까지 반복
    while queue:
        # 큐에서 하나의 노드를 꺼내기
        v = queue.popleft()   # 현재 노드를 큐에서 꺼내서 방문
        print(v, end=' ')     # 방문 노드 출력
        
        # 해당 노드의 인접 노드들을 모두 확인
        for i in graph[v]:            # 현재 노드와 연결된 다른 노드를 확인
            if not visited[i]:        # 방문하지 않은 노드라면
                queue.append(i)       # 큐에 노드를 삽입
                visited[i] = True     # 방문 처리
```

#### 그래프 예시와 실행
```python
graph = [
    [],
    [2, 3, 8],
    [1, 7],
    [1, 4, 5],
    [3, 5],
    [3, 4],
    [7],
    [2, 6, 8],
    [1, 7]
]

visited = [False] * 9
bfs(graph, 1, visited)  # 1 2 3 8 7 4 5 6
```
* BFS 탐색 순서: 1(level 0) → 2,3,8(level 1) → 7,4,5(level 2) → 6(level 3)
* 같은 레벨의 노드들을 모두 방문한 후 다음 레벨로 이동합니다
* 각 레벨은 시작 노드로부터의 거리를 의미합니다

## 3 복잡도

### 3.1 시간 복잡도
- 노드의 수를 V, 간선의 수를 E라고 할 때 시간 복잡도를 계산해보겠습니다.
- 인접 행렬 사용: O(V²)
	- 먼저 각 노드를 방문합니다. O(V)
	- 각 노드마다 모든 노드를 확인합니다. O(V)
      - 인접 행렬에서는 한 노드의 모든 연결을 확인하기 위해 O(V) 시간이 걸립니다
    - 총 O(V²) 시간이 걸립니다
- 인접 리스트 사용: O(V + E)
  - 각 노드를 큐에 넣고 빼는 연산: O(V)
  - 각 간선을 한 번씩 확인하는 연산: O(E)
  - 이 두 연산은 서로 중첩되어 발생하지 않고, 각각 독립적으로 수행됩니다

### 3.2 공간 복잡도

- 인접 행렬 사용
  - 방문 여부를 저장하는 visited 배열: O(V)
  - 그래프를 저장하는 2차원 배열: O(V²)
  - 총 O(V²)의 공간이 필요합니다
  - 메모리 사용량이 많아서 큰 그래프에서는 사용하기 어렵습니다
- 인접 리스트 사용
  - 방문 여부를 저장하는 visited 배열: O(V)
  - 그래프를 저장하는 리스트: O(V + E)
  - 총 O(V + E)의 공간이 필요합니다
  - 메모리 사용량이 적어서 대부분의 경우 사용됩니다

## 4 BFS의 활용

### 4.1 최단 경로 문제에서의 BFS

* BFS가 최단 경로를 보장하는 조건
	* 모든 간선의 가중치가 동일해야 합니다
	* 음의 가중치가 없어야 합니다
	* 간선의 가중치가 다르다면 다익스트라 알고리즘을 사용해야 합니다
* 적용 가능한 문제 유형
	* 미로 탈출 (모든 이동 거리가 1인 경우)
	* 최소 단계 찾기 문제
	* 최단 거리가 동일 비용인 경우

### 4.2 레벨 단위 처리 문제

* 트리의 레벨 순회
* 주변 지역 탐색
* 단계별 처리가 필요한 문제

### 4.3 실전 활용 예시

#### 미로 탈출 문제 구현
```python
def maze_escape(maze, start):
    n = len(maze)
    m = len(maze[0])
    queue = deque([(start[0], start[1], 0)])  # x, y, distance
    
    dx = [-1, 1, 0, 0]  # 상하좌우
    dy = [0, 0, -1, 1]
    
    while queue:
        x, y, dist = queue.popleft()
        
        if x == n-1 and y == m-1:  # 도착점
            return dist
            
        for i in range(4):
            nx = x + dx[i]
            ny = y + dy[i]
            
            if 0 <= nx < n and 0 <= ny < m and maze[nx][ny] == 1:
                maze[nx][ny] = 0  # 방문 처리
                queue.append((nx, ny, dist + 1))
```

## 5 추천 문제
- [PCCP 기출문제 2번 / 석유 시추](https://school.programmers.co.kr/learn/courses/30/lessons/250136)