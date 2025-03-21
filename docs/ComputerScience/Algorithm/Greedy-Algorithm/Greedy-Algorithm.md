## 1 Greedy Algorithm

* 그리디 알고리즘은 글로벌 최적을 찾기 위해 각 단계에서 로컬 최적의 선택을 하는 휴리스틱 문제 해결 알고리즘이다
* 그리디 알고리즘은 바로 눈앞에 이익만을 쫓는 알고리즘을 말한다
* 대부분의 경우 뛰어난 결과를 도출하지 못하지만 드물게 최적해를 보장한다
* 최적해를 찾을 수 없는 경우 주어진 시간 내에 그런대로 괜찮은 해를 찾는 것을 목표로 한다



### 1.1 대표적인 예시

* 다익스트라 알고리즘
* 허프만 코딩



## 2 적용 가능성

* 그리디 알고리즘을 적용할 수 있는 문제들은 **탐욕 선택 속성**을 가지고 있는 **최적 부분 구조**인 문제들이다
* 2가지 조건을 만족하면 최적해를 찾을 수 있다



### 2.1 탐욕 선택 속성

* Greedy Choice Property
* 앞의 선택이 이후 선택에 영향을 주지 않는 것을 의미한다
* 다시 말해 그리디 알고리즘은 선택을 다시 고려하지 않는다



### 2.2 최적 부분 구조

* Optimal Substructure
* 문제의 최적 해결 방법이 부분 문제에 대한 최적 해결 방법으로 구성되는 경우를 말한다



## 3. Tip

1. 보통 최소/최대화 문제
2. 정렬을 해야 속도가 빨리질 수도 있다
3. 여러가지 방식으로 그리디 알고리즘이 가능하다면 반례를 통하여 제거할 것

| 알고리즘            | 풀이 가능한 문제의 특징              | 풀이 가능한 문제 및 알고리즘                              |
| ------------------- | ------------------------------------ | --------------------------------------------------------- |
| 다이나믹 프로그래밍 | 최적 부분 구조<br />중복된 하위 문제 | 0-1 배낭 문제<br />피보나치 수열<br />다익스트라 알고리즘 |
| 그리디 알고리즘     | 최적 부분 구조<br />탐욕 선택 속성   | 분할 가능 배낭 문제<br />다익스트라 알고리즘              |
| 분할 정복           | 최적 부분 구조                       | 병합 정렬<br />퀵 정렬                                    |



## 4 다이나믹 프로그래밍과 비교

* 흔히 그리디 알고리즘은 다이나믹 프로그래밍과 비교된다
* 다이나믹 프로그래밍은 하위 문제에 대한 최적의 솔루션을 찾은 다음 이 결과들을 결합해한 정보에 입각해 전역 최적 솔루션을 선택
* 그리디 알고리즘은 각 단계마다 로컬 최적해를 찾는 문제로 접근해 문제를 더 작게 줄여가는 형태 



## 5 대표 문제



### 4.1분할 가능 배낭 문제



### 4.2 동전 바꾸기 문제

* 동전의 액면이 10원, 50원, 100원 처럼 증가하면서 이전 액면의 배수 이상이 되면 그리디 알고리즘을 풀 수 있다
* 우리나라 동전은 항상 배수 이상이므로 그리디로 풀 수 있다



**문제**

* [BOJ - 11047.동전 0](https://www.acmicpc.net/problem/11047)



관련 자료

* http://www.kocw.net/home/cview.do?cid=240178eac2f2278d
