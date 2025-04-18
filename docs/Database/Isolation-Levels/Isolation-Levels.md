## 1 Isolation levels

- 트랜잭션의 격리 수준(Isolation levels)이란 동시에 여러 트랜잭션이 처리될 때, 특정 트랜잭션이 다른 트랜잭션에서 변경하거나 조회하는 데이터를 볼 수 있도록 허용할지 말지를 결정하는 것입니다.
- ANSI 표준은 트랜잭션의 격리 수준을 4단계로 나누어 정의했습니다.
  - 격리 수준에는 `READ UNCOMMITTED`,  `READ COMMITTED`, `REAPEATABLE READ`, `SERIALIZABLE`이 있습니다.
  - 순서대로 뒤로 갈수록 격리 정도가 높아지며 동시에 동시성도 떨어집니다.
- `READ UNCOMMITTED`, `SERIALIZABLE`은 일반적으로 잘 사용되지 않습니다.
  - `READ UNCOMMITTED`: 트랜잭션이 커밋되지 않은 데이터를 읽을 수 있습니다. 이로 인해 Dirty reads 현상이 발생할 수 있습니다.
  - `SERIALIZABLE`: 트랜잭션이 순차적으로 실행됩니다. 이로 인해 성능 저하가 발생할 수 있습니다.
  - 자세한 설명은 아래에서 다룹니다.
- 실질적으로 `Serializable` 을 제외한 3가지 격리 수준의 성능 간에 큰 차이는 없습니다.
- 일반적인 온라인 서비스 용도의 데이터베이스는 `READ COMMITTED`, `REAPEATABLE READ` 둘 중에서 하나를 선택합니다.
	- 오라클은 주로  `READ COMMITTED`을 사용합니다.
	- MySQL에서는 주로 `REAPEATABLE READ`를 사용합니다.

## 2 Read phenomena

- `Read phenomena`이란 격리 수준에 따라 발생할 수 있는 3가지 부정합 문제를 말합니다.
- Dirty reads, Non-repeatable reads, Phantom reads가 있습니다.

### 2.1 Dirty reads

- 어떤 트랜잭션에서 처리한 작업이 완료되지 않았는데도 다른 트랜잭션에서 볼 수 있게 되는 현상입니다.

**예시**

![image-20210529221450637.png](images/image-20210529221450637.png)

초기 테이블 상태입니다.

![image-20210529221720192.png](images/image-20210529221720192.png)

트랜잭션 TX1와 TX2 시작 후 각각 조회 쿼리와 업데이트 쿼리문 실행합니다.

![image-20210529221842552.png](images/image-20210529221842552.png)
그 결과로 위와 같이 테이블 상태 QNT가 5 증가했다.

![image-20210529222012501.png](images/image-20210529222012501.png)

이후 TX1에서 다시 조회 쿼리 실행한다. 아직 커밋되지 않은 TX2의 변경사항을 읽었다. Dirty reads 현상이 발생했습니다.

![image-20210529222429621.png](images/image-20210529222429621.png)
어떠한 문제가 발생해 TX2이 롤백됩니다.

### 2.2 Non-repeatable reads

- 트랜잭션 안에서 같은 쿼리를 실행했을 때 결과가 다른 현상을 말합니다.
- 이러한 부정합 현상은 일반적인 웹 프로그램에서는 크게 문제되지 않지만 하나의 트랜잭션에서 동일 데이터를 여러번 읽고 변경하는 작업이 금전적인 처리와 관련되어 있다면 문제가 될 수 있습니다.
- 예를 들어, 다른 트랜잭션에서 입금과 출금 처리가 진행되고 있을 때 다른 트랜잭션에서 오늘 입금된 금액의 총 합을 계산한다고 했을 때 REPEATABLE READ가 보장되지 않으면 쿼리를 실행할 때마다 금액이 달라질 수 있습니다.

**예시**

![image-20210529221450637.png](images/image-20210529221450637.png)
초기 테이블 상태입니다.

![image-20210529223945660.png](images/image-20210529223945660.png)
트랜잭션 TX1와 TX2 시작 후 각각 조회 쿼리와 업데이트 쿼리문 실행 이후 TX2는 커밋까지 완료합니다.

![image-20210529224042871.png](images/image-20210529224042871.png)
현재 테이블 상태입니다.

![image-20210529224139912.png](images/image-20210529224139912.png)
TX1에서 TX2의 커밋된 데이터만 읽었음에도 불구하고 한 트랜잭션 안에서 실행한 쿼리문의 결과가 다릅니다. 이를 Non-repeatable reads 현상이라고 합니다.

### 2.3 Phantom reads

- 다른 트랜잭션에서 수행한 변경 작업에 의해 레코드가 보였다가 안 보였다가 하는 현상을 말합니다.

**예시**
![image-20210529221450637.png](images/image-20210529221450637.png)
초기 테이블 상태입니다.

![image-20210529224616517.png](images/image-20210529224616517.png)
트랜잭션 TX1와 TX2 시작 후 각각 조회 쿼리와 삽입 쿼리문 실행 후 TX2 커밋까지 완료합니다.

![image-20210529224521773.png](images/image-20210529224521773.png)
현재 테이블 상태입니다.

![image-20210529224706261.png](images/image-20210529224706261.png)
TX1 에서 조회 쿼리 실행한다. TX2에서 추가한 레코드가 포함된 결과가 보입니다. 이를 Phantom reads 현상이라고 합니다.

### 2.4 격리 수준에 따른 부정합 문제 발생 여부

|                  | Dirty reads | Non-repeatable reads | Phantom reads |
|------------------|-------------|----------------------|---------------|
| Read uncommitted | O           | O                    | O             |
| Read committed   | X           | O                    | O             |
| Repeatable Reads | X           | X                    | O(InnoDB는 X)  |
| Serializable     | X           | X                    | X             |

## 3 READ UNCOMMITTED

- 각 트랜잭션에서의 변경 내용이 COMMIT 이나 ROLLBACK 여부에 상관 없이 다른 트랜잭션에서 보여지는 격리 수준입니다.
- **Dirty reads**, **Non-repeatable reads**, **Phantom reads**  현상이 발생하는 격리 수준입니다.
- RDBMS 표준에서는 트랙잭션의 격리 수준으로 인정하지 않을 정도로 정합성에 문제가 많습니다.
  - 따라서 실제 서비스에서는 사용하지 않는 것이 좋습니다.
- MySQL을 사용한다면 최소한 `READ COMMITED` 이상의 격리 수준을 사용할 것을 권장합니다.

## 4 READ COMMITTED

- 어떤 트랜잭션에서 변경한 내용이 COMMIT이 완료되기 전까지는 다른 트랜잭션에서 조회할 수 없는 격리 수준입니다.
	- 따라서 **Dirty reads** 현상이 발생하지 않습니다.
- **Non-repeatable reads**, **Phantom reads**  현상이 발생하는 격리 수준입니다.
- 오라클 DBMS에서 기본적으로 사용하는 격리 수준입니다.

### 4.1 InnoDB 기준

- InnoDB 스토리지 엔진은 트랜잭션이 ROLLBACK될 가능성에 대비해 변경되기 전 레코드를 언두 공간에 백업해두고 실제 레코드 값을 변경합니다.
	- 이 방식을 MVCC(Multi Version Concurrency Control)라고 합니다.
- 트랜잭션 A 에서 회원번호가 1인 회원의 이름을 "A" 에서 "B"로 변경할 때 새로운 값인 "B"는 테이블에 즉시 기록됩니다.
- 이전 값인 "B"를 갖는 레코드는 언두 영역으로 백업됩니다.
- 트랜잭션 A가 커밋되기 전에 트랜잭션 B 가 회원 번호가 1인 회원을 SELECT하면 조회된 결과의 회원 이름은 "B"가 아니라 "A"로 조회됩니다.
- 트랜잭션 B의 쿼리 결과는 회원 테이블이 아니라 언두 영역에 백업된 레코드를 가져온 것입니다.

## 5 REAPEATABLE READ

- 하나의 트랜잭션 내에서 똑같은 SELECT 쿼리를 실행했을 때 항상 같은 결과를 보장해야 하는 격리 수준입니다.
- Repeatable Reads는 MySQL의 InnoDB 스토리지 엔진에서 기본으로 사용하는 격리 수준입니다.
- **Phantom reads**  현상이 발생하는 격리 수준입니다.
- InnoDB 스토리지 엔진은 트랜잭션이 ROLLBACK될 가능성에 대비해 변경되기 전 레코드를 언두 공간에 백업해두고 실제 레코드 값을 변경합니다.
	- 이 방식을 MVCC(Multi Version Concurrency Control)라고 합니다.
- 백업된 데이터는 불필요하다고 판단하는 시점에 주기적으로 삭제합니다.
- Undo에 백업된 레코드가 많아지면 MySQL 서버의 처리 성능이 떨어질 수 있습니다.
- MySQL에서는 트랜잭션마다 트랜잭션 ID를 부여하여 트랜잭션 ID보다 작은 트랜잭션 번호에서 변경한 것만 읽게 됩니다.

## 6 SERIALIZABLE

- 한 트랜잭션에서 읽고 쓰는 레코드를 다른 트랙잭션에서 절대 접근할 수 없는 격리 수준입니다.
- 두 트랜잭션을 병렬적으로 동시에 수행하는 것이 아닌 하나씩 순차적으로 수행합니다.
- 가장 엄격한 격리 수준이며 그만큼 동시 처리 성능도 다른 격리 수준보다 떨어집니다.
- **Dirty reads**, **Non-repeatable reads**, **Phantom reads**  현상이 발생하지 않는 격리 수준입니다.

## 7 트랜잭션 격리 수준 구현 방식

- 트랜잭션 격리 수준을 구현하기 위해 데이터베이스는 주로 락(Lock)과 MVCC(Multi-Version Concurrency Control) 기술을 사용합니다.

### 7.1 MySQL

#### 7.1.1 Undo 영역

- 언두 레코드는 InnoDB의 시스템 테이블 스페이스의 언두 영역에 기록됩니다.
- 언두 레코드는 트랜잭션의 격리 수중을 보장하기 위해 사용됩니다.
- 뿐만 아니라 트랜잭션의 Rollback을 위해서도 사용됩니다.
  - InnoDB 스토리지 엔진은 롤백 가능성을 대비해 변경되기 전 레코드를 언두 영역에 백업해두고 실제 레코드 값을 변경합니다.
  - 이러한 변경 방식을 MVCC라고 합니다.

#### 7.1.1 READ UNCOMMITTED

- 별도의 락을 사용하지 않으며 다른 트랜잭션의 변경사항이 커밋 되지 않아도 읽을 수 있습니다.

#### 7.1.2 READ COMMITTED

- MVCC를 사용하여 구현합니다.
- 

참조

- [Real MySQL](http://www.yes24.com/Product/Goods/6960931)

