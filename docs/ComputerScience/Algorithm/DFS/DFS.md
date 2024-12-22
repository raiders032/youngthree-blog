---
title: "DFS"
description: "깊이 우선 탐색(DFS) 알고리즘의 동작 원리와 구현 방법을 상세히 알아봅니다. 재귀와 스택을 활용한 구현 방법, 실제 코딩 테스트 문제 해결 전략까지 다룹니다. 그래프와 트리 탐색의 기초를 다지고 싶은 개발자를 위한 실용적인 가이드입니다."
tags: ["DFS", "ALGORITHM", "DATA_STRUCTURE", "RECURSION", "PYTHON", "CODING_TEST"]
keywords: ["깊이우선탐색", "depth first search", "DFS", "디에프에스", "깊이 우선 탐색", "그래프탐색", "graph traversal", "재귀", "recursion", "스택", "stack", "알고리즘", "algorithm", "자료구조", "data structure", "코딩테스트", "coding test"]
draft: false
hide_title: true
---

## 1. 깊이 우선 탐색(DFS) 개요

- 깊이 우선 탐색(Depth-First Search, DFS)은 그래프나 트리 구조에서 가능한 한 깊이 들어가면서 탐색을 진행하는 알고리즘입니다.
- 미로 찾기를 할 때 한 방향으로 계속 가다가 막히면 다시 돌아와서 다른 방향으로 가는 것과 유사합니다.

### 1.1 DFS의 특징

- 한 경로를 끝까지 탐색한 후 다음 경로로 이동
- 재귀 함수나 스택으로 구현 가능
- 백트래킹이 필요한 문제에 적합
- 모든 노드를 방문하는 것이 목표일 때 사용

## 2. DFS 동작 원리

### 2.1 기본 알고리즘

1. 시작 노드를 방문 처리
2. 현재 노드와 연결된 미방문 노드를 찾아 방문
3. 더 이상 방문할 노드가 없으면 이전 노드로 돌아감
4. 모든 노드를 방문할 때까지 2-3 반복

:::info[DFS vs BFS]

DFS는 깊이를 우선으로 하는 반면, BFS(너비 우선 탐색)는 너비를 우선으로 탐색합니다. 미로에서 DFS는 한 길을 끝까지 가보는 전략이고, BFS는 현재 위치에서 갈 수 있는 모든 길을 한 칸씩 가보는 전략입니다.

:::

## 3. DFS 구현 방법

### 3.1 재귀를 이용한 구현

#### 기본 구조
```python
def dfs(graph, v, visited):
    # 현재 노드를 방문 처리
    visited[v] = True
    print(v, end=' ')
    
    # 현재 노드와 연결된 다른 노드를 재귀적으로 방문
    for i in graph[v]:
        if not visited[i]:
            dfs(graph, i, visited)

# 그래프를 인접 리스트로 표현
graph = [
    [],             # 0번 노드는 사용하지 않음
    [2, 3, 8],     # 1번 노드와 연결된 노드들
    [1, 7],        # 2번 노드와 연결된 노드들
    [1, 4, 5],     # 3번 노드와 연결된 노드들
    [3, 5],        # 4번 노드와 연결된 노드들
    [3, 4],        # 5번 노드와 연결된 노드들
    [7],           # 6번 노드와 연결된 노드들
    [2, 6, 8],     # 7번 노드와 연결된 노드들
    [1, 7]         # 8번 노드와 연결된 노드들
]

# 방문 여부를 저장할 리스트
visited = [False] * 9

# DFS 호출
dfs(graph, 1, visited)  # 1번 노드부터 탐색 시작
```

### 3.2 스택을 이용한 구현

#### 반복문 구조
```python
def dfs_iterative(graph, start):
    visited = []
    stack = [start]
    
    while stack:
        v = stack.pop()
        if v not in visited:
            visited.append(v)
            stack.extend(reversed(graph[v]))
    
    return visited
```

## 4. DFS 활용 사례

### 4.1 미로 탐색 문제

```python
def solve_maze(maze, start, end):
    def dfs(x, y):
        if x < 0 or x >= len(maze) or y < 0 or y >= len(maze[0]):
            return False
        
        if maze[x][y] == 1:  # 길이 있는 경우
            maze[x][y] = 0   # 방문 처리
            
            # 상하좌우 탐색
            dfs(x-1, y)
            dfs(x+1, y)
            dfs(x, y-1)
            dfs(x, y+1)
            return True
            
        return False
    
    return dfs(start[0], start[1])
```

### 4.2 연결 요소 찾기

```python
def count_components(n, edges):
    def dfs(node):
        visited[node] = True
        for neighbor in graph[node]:
            if not visited[neighbor]:
                dfs(neighbor)
    
    # 그래프 생성
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    
    visited = [False] * n
    count = 0
    
    # 모든 노드에 대해 DFS 수행
    for i in range(n):
        if not visited[i]:
            dfs(i)
            count += 1
    
    return count
```

- 연결 요소란 그래프 내에서 서로 연결된 부분 그래프를 의미합니다.
  - [Graph.md](../../DataStructure/Graph/Graph.md)의 연결 요소 참고

## 5. DFS 시간 복잡도

### 5.1 인접 행렬을 사용할 경우
- 시간 복잡도: O(V²)
  - 각 정점을 방문할 때마다(V)
  - 해당 정점과 연결된 정점을 찾기 위해 모든 정점을 확인해야 함(V)
- V는 정점의 개수

### 5.2 인접 리스트를 사용할 경우
- 시간 복잡도: O(V + E)
  - 각 정점은 정확히 한 번씩 방문됨(V)
  - 각 정점 방문 시 해당 정점의 인접 리스트를 확인 모든 정점의 인접 리스트를 합하면 총 간선 수(E)
- V는 정점의 개수, E는 간선의 개수

:::tip[성능 최적화 팁]

- 방문 체크는 set 자료구조 사용
- 재귀 깊이가 깊어질 경우 시스템 재귀 한도 조정
- 가지치기(pruning)를 통한 불필요한 탐색 방지
- 그래프가 밀집되어 있다면(간선이 많다면) 인접 행렬이 더 효율적일 수 있습니다. 
- 그래프가 희소하다면(간선이 적다면) 인접 리스트가 더 효율적입니다. 
- 대부분의 실제 그래프는 희소 그래프이므로 인접 리스트를 더 많이 사용합니다.

:::

## 6. 코딩 테스트에서의 DFS

### 6.1 자주 나오는 문제 유형
- 경로 찾기
- 연결 요소 개수 세기
- 사이클 판별
- 백트래킹이 필요한 문제

### 6.2 문제 해결 전략
1. 그래프 표현 방식 결정 (인접 리스트 vs 인접 행렬)
2. 방문 처리 방법 선택
3. 종료 조건 명확히 설정
4. 가지치기 조건 고려

:::warning[주의사항]

- 재귀 깊이 제한에 주의
- 무한 루프 방지를 위한 방문 체크
- 메모리 사용량 고려
- 스택 오버플로우 주의

:::

### 6.3 추천 문제

- [양과 늑대](https://school.programmers.co.kr/learn/courses/30/lessons/92343)

## 7. 마치며

DFS는 그래프와 트리 탐색의 기본이 되는 알고리즘입니다. 재귀적 사고방식을 기르고 백트래킹 문제를 해결하는 데 필수적인 도구이므로, 코딩 테스트 준비나 실제 개발에서 자주 활용됩니다.

:::tip[학습 추천사항]

1. 기본적인 그래프 탐색 문제부터 시작
2. 재귀와 반복 두 가지 방식 모두 구현해보기
3. 실제 코딩 테스트 문제 풀이 연습
4. 다양한 응용 문제에 적용해보기

:::