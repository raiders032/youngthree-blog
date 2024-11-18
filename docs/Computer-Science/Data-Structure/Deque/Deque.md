---
title: "Deque"
description: "자료구조 데크(Deque)의 개념과 특징, 구현 방법을 초보자도 이해하기 쉽게 설명합니다. 이중 연결 리스트를 활용한 구현 방법과 파이썬의 collections.deque 사용법을 알아봅니다."
tags: ["자료구조", "데크", "Python", "알고리즘", "이중연결리스트"]
keywords: ["deque", "double-ended queue", "자료구조", "파이썬", "collections.deque"]
draft: false
---

## 1. 데크(Deque)의 개념

* 데크는 Double-Ended Queue의 줄임말입니다
* 양쪽 끝에서 모두 데이터를 삽입하고 삭제할 수 있는 자료구조입니다
* 스택과 큐의 장점을 모두 가지고 있는 확장된 자료구조입니다
    * 스택처럼 후입선출(LIFO) 연산이 가능합니다
    * 큐처럼 선입선출(FIFO) 연산도 가능합니다

## 2. 데크의 주요 특징

* 양방향 입출력이 가능합니다
    * 앞쪽과 뒤쪽 모두에서 삽입 연산이 가능합니다
    * 앞쪽과 뒤쪽 모두에서 삭제 연산이 가능합니다
* 데이터의 삽입과 삭제가 빠릅니다
    * 양끝에서의 작업은 O(1) 시간복잡도를 가집니다
* 중간 데이터 접근은 상대적으로 느립니다
    * 임의 접근 시 O(n) 시간복잡도가 발생합니다

## 3. 구현 방법

### 3.1 이중 연결 리스트 구현

**기본 노드 클래스**
```python
class Node:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None
```

**데크 클래스 구현**
```python
class Deque:
    def __init__(self):
        self.head = None
        self.tail = None
        self.size = 0
```

### 3.2 Python의 collections.deque 사용

**collections 모듈 임포트**
```python
from collections import deque
```

**기본 사용법**
```python
# 데크 생성
my_deque = deque()

# 데이터 추가
my_deque.append(1)      # 오른쪽 끝에 추가
my_deque.appendleft(2)  # 왼쪽 끝에 추가
```

## 4. 활용 사례

* 웹 브라우저의 방문 기록 관리
* 작업 스케줄링
* 문자열 처리
    * 회문(palindrome) 검사
    * 문자열 버퍼 관리
* 슬라이딩 윈도우 알고리즘