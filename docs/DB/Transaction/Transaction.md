## 1 Transaction

* 하나의 논리적 작업 단위를 구성하는 일련의 연산들의 집합을 트랜잭션이라고 한다
* 트랜잭션은 작업의 **완전성**을 보장해준다
* 즉, 논리적인 작업 셋을 모두 완벽하게 처리하거나 또는 처리하지 못할 경우에는 원 상태로 복구해서 작업의 일부만 적용되는 현상(Partial Update)이 발생하지 않게 만들어주는 기능이다.



### 1.1 Transaction과 Locking

**Locking**

* Locking과 서로 비슷한 개념이지만 Locking은 **동시성**을 제어하기 위한 기능이다.
* 트랜잭션은 데이터의 **정합성**을 보장하기 위한 기능이다.
* [Locking.md](../Locking/Locking.md) 참고



### 1.2 Transaction을 지원하는 스토리지 엔진의 장점

* 많은 개발자들이 트랜잭션에 대해 깊이 생각하기 싫어서 트랜잭션을 지원하지 않는 MyISAM을 선택한다고 하는데 트랜잭션을 지원하지 않는 스토리지 엔진의 테이블이 더 많은 고민거리를 만들어낸다
* 트랜잭션을 지원하는 InnoDB는 쿼리 중 일부라도 오류가 발생하면 트랜잭션 원칙대로 전체를 원상태로 만든다
* 하지만 트랜잭션을 지원하지 않는 MyISAM을 사용했는데 쿼리 중 일부가 오류가 난다면 부분 업데이트 현상이 발생하면서 실패한 쿼리로 인해 남은 레코드를 다시 삭제하는 재처리 작업이 필요할 수 있다
* 트랙잭션은 골치 아픈 기능이 아니라 그만큼 애플리케이션 개발에서 고민해야 할 문제를 줄여주는 아주 필수적인 DBMS의 기능이라는 점을 기억하자



## 2 ACID 원칙

* Transaction은 ACID 원칙을 보장해야한다



### 2.1 Atomicity(원자성)

* 트랜잭션은 종종 여러 명령문으로 구성된다
* 원자성은 각 트랜잭션이 완전히 성공하거나 완전히 실패하는 단일 "단위"로 처리되도록 보장한다.
* **트랜잭션의 모든 연산이 데이터베이스에 반영되던가 아니면 한개의 연산도 반영되지 말아야한다**
* 데이터베이스 업데이트가 부분적으로 발생하는 것을 방지한다.



### 2.2 Consistency(일관성)

* 데이터베이스의 제약사항이 트랜잭션을 시작하기 전과 후 같아야한다.
* 트랜잭션 수행이 보존해야 할 일관성은 기본 키, 외래 키 제약과 같은 명시적인 무결성 제약 조건들뿐만 아니라, 자금 이체 예에서 두 계좌 잔고의 합은 이체 전후가 같아야 한다는 사항과 같은 비명시적인 일관성 조건들도 있다.



### 2.3 Isolation(독립성/고립성)

* 트랜잭션은 종종 동시에 실행된다
* 각각의 트랜잭션이 동시에 실행되고 있는 다른 트랜잭션을 인지하지 못한다는 것을 의미한다.
* 트랜잭션의 중간 결과과 동시에 실행되고 있는 다른 트랜잭션으로부터 감쳐줘야한다.
* 트랜잭션 연산중에 다른 트랜잭션이 값을 읽어버리면 잘못 된 값을 읽을 수 있기 때문이다.
* Isolation 성질을 보장할 수 있는 가장 쉬운 방법은 모든 트랜잭션을 순차적으로 수행하는 것이다. 
* 하지만 병렬적 수행의 장점을 얻기 위해서 DBMS는 병렬적으로 수행하면서도 일렬(serial) 수행과 같은 결과를 보장할 수 있는 방식을 제공하고 있다.



### 2.4 Durability(지속성)

* 내구성은 트랜잭션이 커밋 된 후 시스템 오류(예 : 정전 또는 충돌)의 경우에도 커밋 된 상태로 유지되도록 보장합니다.
* 일반적으로 완료된 트랜잭션이 비 휘발성 메모리에 기록된다는 것을 의미합니다.



## 3 Transaction을 사용할 때 주의할 점

* 트랜잭션은 꼭 필요한 최소의 코드에만 적용하는 것이 좋다. 
	* 즉 트랜잭션의 범위를 최소화하라는 의미다. 
* 일반적으로 데이터베이스 커넥션은 개수가 제한적이다. 그런데 각 단위 프로그램이 커넥션을 소유하는 시간이 길어진다면 사용 가능한 여유 커넥션의 개수는 줄어들게 된다. 
* 그러다 어느 순간에는 각 단위 프로그램에서 커넥션을 가져가기 위해 기다려야 하는 상황이 발생할 수도 있는 것이다.



### 3.1 외부 통신 작업

* 메일 전송이나 FTP 파일 전송 작업 또는 네트워크를 통해 원격 서버와 통신하는 등과 같은 작업은 어떻게 해서든 DBMS의 트랙잭션 내에서 제거하는 것이 좋다



## 4 Transaction State

![트랜잭션 상태 다이어그램](images/transaction-status.png)

**Active** 

트랜잭션의 활동 상태. 트랜잭션이 실행중이며 동작중인 상태를 말한다.

**Failed**

트랜잭션 실패 상태. 트랜잭션이 더이상 정상적으로 진행 할 수 없는 상태를 말한다.

**Partially Committed**

트랜잭션의 `Commit` 명령이 도착한 상태. 트랜잭션의 `commit`이전 `sql`문이 수행되고 `commit`만 남은 상태를 말한다.

**Committed**

트랜잭션 완료 상태. 트랜잭션이 정상적으로 완료된 상태를 말한다.

**Aborted**

트랜잭션이 취소 상태. 트랜잭션이 취소되고 트랜잭션 실행 이전 데이터로 돌아간 상태를 말한다.

**Partially Committed 와 Committed 의 차이점**

`Commit` 요청이 들어오면 상태는 `Partial Commited` 상태가 된다. 이후 `Commit`을 문제없이 수행할 수 있으면 `Committed` 상태로 전이되고, 만약 오류가 발생하면 `Failed` 상태가 된다. 즉, `Partial Commited`는 `Commit` 요청이 들어왔을때를 말하며, `Commited`는 `Commit`을 정상적으로 완료한 상태를 말한다.



관련 자료

* [DBMS는 어떻게 트랜잭션을 관리할까? - Naver D2](https://d2.naver.com/helloworld/407507)