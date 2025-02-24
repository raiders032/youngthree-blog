---
title: "B+Tree"
description: "데이터베이스 시스템의 인덱싱에 광범위하게 사용되는 B+Tree의 구조, 특징, 동작 원리를 상세히 알아봅니다. B-Tree와의 차이점, 실제 활용 사례, 그리고 성능상의 이점을 통해 B+Tree가 왜 데이터베이스에서 선호되는지 이해할 수 있습니다."
tags: [ "BPLUS_TREE", "DATA_STRUCTURE", "ALGORITHM", "DATABASE", "COMPUTER_SCIENCE" ]
keywords: [ "비플러스트리", "B+Tree", "B+ Tree", "B플러스트리", "데이터베이스", "인덱싱", "자료구조", "알고리즘", "트리구조", "데이터구조", "DB인덱스", "파일시스템" ]
draft: false
hide_title: true
---

## 1. B+Tree 소개

### 1.1 B+Tree의 정의

- B+Tree는 B-Tree의 변형으로, 데이터베이스와 파일 시스템에서 가장 널리 사용되는 인덱싱 자료구조입니다.
- 모든 데이터를 리프 노드에 저장하고, 내부 노드는 인덱스 역할만 수행하는 구조입니다.
- 리프 노드들은 연결 리스트로 연결되어 순차적 접근이 용이합니다.

### 1.2 B+Tree vs B-Tree

:::info[주요 차이점]
B+Tree는 B-Tree를 개선하여 데이터베이스 시스템에 더 적합하도록 설계되었습니다.
:::

- 데이터 저장 위치
	- B-Tree: 모든 노드가 데이터를 저장할 수 있음
	- B+Tree: 오직 리프 노드만 데이터를 저장
- 키 중복
	- B-Tree: 키가 중복되지 않음
	- B+Tree: 내부 노드의 키가 리프 노드에 중복되어 나타남
- 리프 노드 연결
	- B-Tree: 리프 노드 간 연결 없음
	- B+Tree: 리프 노드가 연결 리스트로 연결됨

## 2. B+Tree의 구조

### 2.1 노드 구성

- 내부 노드(Internal Node)
	- 키(Key): 자식 노드로의 분기를 위한 인덱스 값
	- 포인터(Pointer): 자식 노드를 가리키는 참조
- 리프 노드(Leaf Node)
	- 키(Key): 실제 데이터 레코드의 키 값
	- 데이터(Data): 실제 데이터 또는 데이터에 대한 참조
	- 다음 리프 노드 포인터: 순차적 접근을 위한 링크

### 2.2 구조적 특징

#### 2.2.1 차수(Order)에 따른 제약

- n차 B+Tree의 경우:
	- 내부 노드
		- 최대 n개의 자식을 가질 수 있음
		- 최소 ⌈n/2⌉개의 자식을 가져야 함
		- 키의 수는 자식 수보다 1개 적음
	- 리프 노드
		- 최대 n-1개의 키를 가질 수 있음
		- 최소 ⌈(n-1)/2⌉개의 키를 가져야 함

#### 2.2.2 정렬과 링크

- 모든 키는 정렬된 상태로 유지
- 리프 노드는 순차적 접근을 위해 양방향 또는 단방향으로 연결
- 모든 리프 노드는 같은 레벨에 위치

## 3. B+Tree 연산

### 3.1 검색(Search) 연산

#### 3.1.1 단일 키 검색

```python
def search(root, key):
    current = root
    
    # 리프 노드까지 이동
    while not current.is_leaf:
        i = 0
        while i < len(current.keys) and key >= current.keys[i]:
            i += 1
        current = current.children[i]
    
    # 리프 노드에서 키 검색
    for i, k in enumerate(current.keys):
        if k == key:
            return current.data[i]
    
    return None
```

#### 3.1.2 범위 검색

```python
def range_search(root, start_key, end_key):
    result = []
    
    # 시작 리프 노드 찾기
    current = find_leaf(root, start_key)
    
    # 범위 내의 모든 키 수집
    while current:
        for i, key in enumerate(current.keys):
            if start_key <= key <= end_key:
                result.append(current.data[i])
            elif key > end_key:
                return result
        current = current.next_leaf
    
    return result
```

### 3.2 삽입(Insertion) 연산

1. 리프 노드 찾기
	- 루트에서 시작하여 적절한 리프 노드까지 이동
2. 리프 노드에 키와 데이터 삽입
	- 공간이 있다면 정렬된 위치에 삽입
	- 공간이 없다면 분할 수행
3. 노드 분할 처리
	- 중간 키를 기준으로 노드를 둘로 분할
	- 분할된 노드를 연결 리스트로 연결
	- 부모 노드에 분할 키 추가

### 3.3 삭제(Deletion) 연산

1. 삭제할 키가 있는 리프 노드 찾기
2. 리프 노드에서 키와 데이터 제거
3. 노드가 최소 키 수를 만족하지 않는 경우:
	- 형제 노드에서 키를 빌리거나
	- 형제 노드와 병합
4. 필요한 경우 내부 노드 갱신

## 4. B+Tree의 장점

### 4.1 검색 성능

- 모든 검색이 리프 노드까지 진행되어 일관된 검색 시간 보장
- 리프 노드 간 연결로 범위 검색이 매우 효율적
- 트리의 균형이 유지되어 최악의 경우에도 로그 시간 보장

### 4.2 디스크 접근 최적화

- 노드 크기를 디스크 블록 크기에 맞춰 I/O 최적화
- 순차적 데이터 접근이 용이하여 디스크 캐시 활용도 높음
- 데이터가 리프 노드에만 있어 메모리 사용 효율적

## 5. 실제 활용

### 5.1 데이터베이스 시스템

- MySQL의 InnoDB 스토리지 엔진
	- 기본 인덱스 구조로 B+Tree 사용
	- 클러스터드 인덱스와 세컨더리 인덱스 모두 구현
- PostgreSQL
	- 인덱스 구현에 B+Tree 변형 사용
	- GiST(Generalized Search Tree) 프레임워크 제공

### 5.2 파일 시스템

- 많은 현대 파일 시스템의 메타데이터 관리
- 디렉토리 구조 인덱싱
- 파일 할당 테이블 관리

## 6. 성능 고려사항

### 6.1 시간 복잡도

- 검색: O(log n)
- 삽입: O(log n)
- 삭제: O(log n)
- 순차 접근: O(1) per record

### 6.2 공간 활용

- 노드 활용도: 최소 50%
- 데이터가 리프 노드에만 존재하여 내부 노드의 캐시 효율성 높음

### 6.3 최적화 전략

- 노드 크기 최적화
	- 디스크 블록 크기 고려
	- 캐시 라인 크기 고려
- 버퍼 관리
	- 자주 접근하는 노드 캐싱
	- 프리페치 전략 수립

## 7. 구현 시 고려사항

### 7.1 동시성 제어

- 읽기/쓰기 락 구현
- 노드 분할/병합 시 락 범위 관리
- 데드락 방지 전략

### 7.2 장애 복구

- WAL(Write-Ahead Logging) 구현
- 체크포인트 메커니즘
- 복구 프로토콜 설계

## 8. 결론

- B+Tree는 데이터베이스 시스템에서 가장 널리 사용되는 인덱스 자료구조입니다.
- 효율적인 검색, 삽입, 삭제 연산과 함께 범위 검색에서 탁월한 성능을 제공합니다.
- 디스크 기반 시스템에 최적화된 구조로, 실제 시스템에서 널리 활용되고 있습니다.

## 참고 자료

- Database Management Systems, Raghu Ramakrishnan
- Introduction to Algorithms, CLRS
- The Art of Computer Programming, Vol. 3, Donald Knuth
- MySQL 5.7 Reference Manual
- PostgreSQL Documentation