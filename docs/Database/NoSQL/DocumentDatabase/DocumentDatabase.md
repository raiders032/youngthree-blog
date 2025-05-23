## 1. Document Database

- 문서는 문서 데이터베이스의 주요 개념입니다.
- 문서 데이터베이스는 문서를 저장하고 조회합니다.
- 문서는 XML, JSON, BSON 등의 형식으로 저장됩니다.
- 문서는 맵, 컬렉션, 스칼라 값을 가질 수 있습니다.
- 저장된 문서는 서로 비슷하지만 구조가 완전히 같지 않아도 됩니다.
- 문서 데이터베이스는 키-값 저장소의 값 부분에서 문서를 저장한다고 볼 수 있습니다.
  - 즉 문서 데이터베이스는 값을 거머사할 수 있는 키-값 저장소라고 볼 수 있습니다.

## 2. 문서

- 문서 데이터베이스 에서는 컬렉션에 구조가 다른 문서를 저장할 수 있습니다.
- 테이블의 모든 행이 같은 스키마를 따라야하는 관계형 데이터베이스와는 다릅니다.

## 3 특징


## 4 일관성

- 몽고 디비는 데이터베이스에서 복제본 집합을 사용해 일관성 수준을 설정합니다.
- 쓰기가 모든 슬레이브에 복제될 때까지 기다릴지 아니면 주어신 수의 슬레이브에 복제되면 바로 응답할지 설정할 수 있습니다.
- 각 쓰기 명령마다 성공을 반환하기 전에 쓰기를 전파해야 하는 서버 수를 설정할 수 있습니다.

## 5 트랜잭션

- 전통적인 관계형 데이터베이스에서 트랜잭션이란 insert, update, delete 같은 명령으로 여러 테이블에 걸쳐 데이터베이스를 변경한 다음 commit 또는 rollback으로 변경을 확정하거나 취소하는 것을 말합니다.
- 일반적으로 NoSQL 솔루션에서는 유효하지 않습니다.
- 쓰기는 성공하거나 실패한다. 단일 문서 수준에서 트랜잭션을 원자적 트랜잭션이라 합니다.

## 6 가용성

- 몽고 디비는 복제를 수행하고 복제본 집합을 사용해 고가용성을 확보한다.
- 모든 요청을 마스터 노드로 가고 데이터는 슬레이브 노드로 복제된다.
- 마스터 노드가 다운되면 복제본 집합에서 남은 노드가 투표를 통해 새로운 마스터를 선정한다.
- 다운된 마스터 노드가 복구되면 슬레이브로 복제본 집합에 다시 참여한다. 모든 데이터를 끌어와 다른 노드의 상태를 따라잡는다.


## 7 조회 기능

## 8 확장성

- 여기서 확장성은 노드를 추가하거나 데이터 스토리지를 변경하는 것을 의미합니다.
- 읽기 부하에 대한 확장성은 읽기 슬레이브를 추가해 읽기 요청을 슬레이브에서 처리하게 하면 달성할 수 있습니다.
- 쓰기 확장성이 필요한 경우 샤딩을 사용할 수 있습니다.

## 9 사용처

### 9.1 적절한 사용처

- 이벤트 로깅
- 콘텐츠 관리 시스템, 블로깅 플랫폼
- 우베 분석 또는 실시간 분석
- 전자상거래 애플리케이션

### 9.2 사용하지 말아야 할 때

- 여러 연산에 걸친 복잡한 트랜잭션
- 변화하는 집합 구조에 대한 쿼리