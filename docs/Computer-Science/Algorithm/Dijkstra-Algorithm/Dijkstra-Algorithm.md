## 1 Dijkstra's Algorithm

* 한 지점에서 다른 모든 지점까지의 최단 거리를 구하는 알고리즘입니다.
- 네비게이션 길찾기처럼 '최단 경로'를 찾는데 사용됩니다.
- 단, 길의 거리가 음수인 경우는 계산할 수 없습니다.
	* 음수 간선의 순환이 발생한 경우 해당 알고리즘으로 최단 경로를 구할 수 없습니다.
	* 이런 경우  [Bellman-Ford-Algorithm](../Bellman-Ford-Algorithm/Bellman-Ford-Algorithm.md)을 사용한다.
* 매 순간 가장 좋아 보이는 선택을 하는 그리디 알고리즘의 대표적인 예시입니다.



### 1.1 그리디 알고리즘인 이유

- 다익스트라는 매 순간 '현재 알고 있는 최단 거리가 가장 짧은 노드'를 선택합니다.
- 한번 선택된 노드의 최단거리는 이후에 절대 바뀌지 않습니다.
    - 이는 음수 간선이 없다는 전제 하에 성립합니다.
    - 현재까지 발견된 최단 거리보다 더 짧은 경로는 존재할 수 없기 때문입니다.
- 이처럼 '현재 상태에서 보이는 가장 최선의 선택'을 반복하는 방식이 그리디 알고리즘의 특징입니다.



## 2 동작과정

### 2.1 기본 개념

1. 출발 노드 설정
2. 최단 거리 테이블 초기화 
	* 출발 노드가 1인 경우 아래와 같이 테이블 초기화
	* ![[Pasted image 20231113150958.png]]
3. 방문하지 않은 노드 중에서 최단 거리가 가장 짧은 노드를 선택
4. 해당 노드를 거쳐 다른 노드로 가는 비용을 계산하여 최단 거리 테이블을 갱신
5. 위 과정에서 3번과 4번을 반복



### 2.2 단계별 설명

- 예를 들어 서울에서 다른 도시로 가는 최단 거리를 구한다고 가정해보겠습니다.



#### 1단계: 시작 준비

```
서울: 0km
인천: 무한대
수원: 무한대
대전: 무한대
```

- 출발점(서울)까지의 거리는 0으로 설정합니다.
- 다른 모든 도시까지의 거리는 '무한대'로 설정합니다.



#### 2단계: 가장 가까운 도시 선택

- 아직 방문하지 않은 도시 중 가장 가까운 도시를 선택합니다.
- 처음에는 서울(0km)이 선택됩니다.



#### 3단계: 거리 업데이트

- 선택한 도시를 거쳐 갈 수 있는 모든 도시의 거리를 계산합니다.
- 더 짧은 거리가 있다면 업데이트합니다.

```
서울 → 인천: 30km
서울 → 수원: 40km
서울 → 대전: 140km

[업데이트 후]
서울: 0km
인천: 30km
수원: 40km
대전: 140km
```



#### 4단계: 반복

- 다시 미방문 도시 중 가장 가까운 곳(인천, 30km) 선택
- 인천을 거쳐갈 수 있는 도시들의 거리 업데이트
- 이 과정을 모든 도시를 방문할 때까지 반복



## 3 예제 코드

```python
import sys
import heapq
input = sys.stdin.readline

V, E = map(int, input().split())
source_vertex = int(input())
graph = [list() for _ in range(V + 1)]

for _ in range(E):
    vertex1, vertex2, weight = map(int, input().split())
    graph[vertex1].append((vertex2, weight))

## #최단 거리 배열 초기화
min_distance = [sys.maxsize] * (V + 1)

## #출발 정점의 최단 거리는 0으로 설정
min_distance[source_vertex] = 0

## #우선순위 큐에 (최단거리, 출발정점) 삽입
min_heap = [(0, source_vertex)]

while min_heap:
  	# 우선순위 큐에서 최단 거리가 가장 짧은 정점 선택
    distance, vertex = heapq.heappop(min_heap)
 		
    # 현재 정점을 이미 방문 했으면 무시하기
    if min_distance[vertex] < distance:
        continue
		
    # 현재 정점에서 방문할 수 있는 다른 정점까지의 최단 거리 갱신 
    for next_vertex, weight in graph[vertex]:
        if distance + weight < min_distance[next_vertex]:
            min_distance[next_vertex] = distance + weight
            heapq.heappush(min_heap, (min_distance[next_vertex], next_vertex))

for distance in min_distance[1:]:
    if distance == sys.maxsize:
        print("INF")
        continue
    print(distance)
```

* https://www.acmicpc.net/problem/1753
* 방문하지 않은 노드 중에서 최단 거리가 가장 짧은 노드를 선택하기 위해 우선순위 큐를 사용한 다익스트라 구현
* `V, E` : 정점의 개수, 간선의 개수
* `source_vertex`: 출발 정점
* `graph` : 그래프의 인접 리스트 표현
* `min_distance` : 출발 정점으로부터 다른 모든 정점까지의 최단 거리를 나타내는 배열



## 4 시간 복잡도

**선형탐색 이용**

* 노드의 수(V)만큼 매번 최단 거리가 짧은 노드를 선형탐색(V)한다
* 따라서 전체 시간 복잡도는 O(V^2)이다



**최소 힙(우선순위 큐) 사용** 

* 전체 시간 복잡도: O(E + (V + E) logV), 일반적으로 O(E log V)로 표현 
* 그래프 구성: O(E)
* 다익스트라 알고리즘 실행:
	- 정점 추출 (V번 반복):
	    - 우선순위 큐에서 정점을 꺼내는 작업을 최대 V번 수행합니다.
	    - 각 추출 연산은 O(log V) 시간이 걸립니다.
	    - 따라서 이 부분의 총 시간 복잡도는 O(V log V)입니다.
	- 간선 검사 및 거리 갱신 (최대 E번 반복):
	    - 각 정점이 추출될 때마다 해당 정점에 연결된 모든 간선을 검사합니다.
	    - 모든 간선은 최대 한 번씩만 검사됩니다.
	    - 간선 검사 시 거리가 갱신되면 우선순위 큐에 새로운 정보를 삽입합니다.
	    - 각 삽입 연산은 O(log V) 시간이 걸립니다.
	    - 따라서 이 부분의 총 시간 복잡도는 O(E log V)입니다.
* 최악의 경우 (완전 그래프): O(V^2 log V)
* 대부분의 실제 그래프: O(E log V) (E가 V^2보다 훨씬 작은 경우)



## 5 음수 간선이 허용되지 않는 이유

```
[예시 그래프]
A → B: 2
B → C: -3
A → C: 0
```

- A에서 C로 가는 경로가 두 가지 있습니다:
    1. A → C (거리: 0)
    2. A → B → C (거리: 2 + (-3) = -1)
- 다익스트라 알고리즘의 동작
    1. A에서 시작해서 가장 가까운 C를 선택 (거리: 0)
    2. C의 최단거리가 확정되었다고 판단
    3. 하지만 실제로는 B를 거쳐 가는 경로가 더 짧음 (-1)
- 이처럼 음수 간선이 있으면 한번 확정한 최단거리가 나중에 더 짧아질 수 있어 알고리즘이 실패합니다.



## 6 문제

* https://www.acmicpc.net/problem/1504



참고 

* https://www.youtube.com/watch?v=acqm9mM1P6o&list=PLRx0vPvlEmdAghTr5mXQxGpHjWqSz0dgC&index=7