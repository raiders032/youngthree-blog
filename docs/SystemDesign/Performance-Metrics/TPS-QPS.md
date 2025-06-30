---
title: "QPS와 TPS"
description: "MySQL 데이터베이스의 성능 지표인 QPS(Queries Per Second)와 TPS(Transactions Per Second)의 정확한 계산 방법을 알아봅니다. 여러 계산 방식의 차이점과 실제 운영 환경에서 사용해야 할 올바른 방법을 상세히 설명합니다."
tags: [ "MYSQL", "DATABASE", "PERFORMANCE", "MONITORING", "BACKEND", "QPS", "TPS" ]
keywords: [ "MySQL", "QPS", "TPS", "데이터베이스 성능", "쿼리 성능", "트랜잭션 성능", "성능 모니터링", "데이터베이스 모니터링", "GTID", "Questions", "Queries", "성능 튜닝", "데이터베이스 최적화", "MySQL 성능", "초당 쿼리 수", "초당 트랜잭션 수" ]
draft: false
hide_title: true
---

## 1. QPS와 TPS란?

- 데이터베이스 성능 테스트, 모니터링, 실제 비즈니스 데이터베이스 부하를 이해할 때 가장 중요한 두 가지 성능 지표가 있습니다.
- 바로 QPS(Queries Per Second)와 TPS(Transactions Per Second)입니다.
	- **QPS**: 초당 처리되는 쿼리 수를 의미합니다
	- **TPS**: 초당 처리되는 트랜잭션 수를 의미합니다

:::info
이 두 지표는 데이터베이스의 처리 능력과 현재 부하 상태를 파악하는 핵심 메트릭으로, 올바른 계산 방법을 알고 있어야 정확한 성능 분석이 가능합니다.
:::

## 2. QPS 계산 방법

### 2.1 QPS 정의와 혼란

- QPS는 "Queries-per-second"의 줄임말로 초당 쿼리 처리율을 의미합니다.
- 하지만 실제로는 계산 방법에 대해 여러 가지 해석이 존재합니다.
- 여러 가지 해석이 존재하는 이유는 QPS의 Q(Query)가 무엇을 의미하는지에 대한 혼란 때문입니다.
- 이번 글에서는 QPS의 Q(Query)가 무엇을 의미하는지에 대한 명확한 정의와 계산 방법을 알아보겠습니다.

### 2.2 QPS 계산 방법 비교

- MySQL를 예시로 QPS를 계산하는 방법에 대해서 세 가지 방법을 소개합니다.

#### 2.2.1 방법 1: DQL(Select)만 계산

- QPS의 Q(Query)를 "쿼리"로 이해하고, 이를 DQL(Data Query Language)로 해석하여 SELECT 문만을 대상으로 하는 방법입니다.
- 읽기 작업만 측정되며, 쓰기 작업이 없으면 QPS가 0이 되는 비합리적인 결과를 초래할 수 있습니다.
- 이 방법은 QPS의 정의를 너무 제한적으로 해석한 잘못된 방법입니다.
	- 실제 운영 환경에서는 사용하지 않는 것이 좋습니다.

:::info
DQL(Data Query Language)은 데이터베이스에서 데이터를 조회하는 데 사용되는 SQL 명령어로, SELECT문이 있습니다.
SQL은 용도에 따라 DQL(조회), DDL(구조정의), DML(데이터조작), DCL(권한관리)로 분류됩니다.
:::

#### 2.2.2 방법 2: Queries 상태값 사용

- QPS의 Q(Query)를 "쿼리"로 해석하되, DQL에 국한하지 않고 모든 SQL 문을 포함하는 방법입니다.
  - 실제로 Q는 넓은 개념으로 해석되어야 합니다.
  - SQL이 무엇인지 생각해보면, **SQL = DQL + DML + DDL + DCL**이므로, QPS의 Q도 SQL의 Q와 마찬가지로 일반화된 Query, 즉 모든 SQL 문을 의미해야 합니다.
- 그렇다면 MySQL 데이터베이스 서버에서 모든 SQL 문의 총 개수를 어떻게 얻을 수 있을까요?
	- MySQL에서는 `SHOW GLOBAL STATUS LIKE 'Queries'` 명령을 통해 이를 확인할 수 있습니다.
	- 해당 명령을 통해 QPS를 계산하는 방법은 다음과 같습니다.

```sql
-- 현재 Queries 값 확인
SHOW
GLOBAL STATUS LIKE 'Queries';

-- t초 후 다시 확인하여 차이값을 t로 나누어 계산
QPS
= (Queries_after - Queries_before) / t
```

- Queries 카운트는 서버에서 실행된 문장의 수를 나타냅니다.
	- 서버에서 실행된 모든 문장의 수를 카운트합니다.
	- Questions 카운트와 달리 이 변수는 저장 프로시저에서 실행된 문장도 포함합니다.
	- COM_PING이나 COM_STATISTICS 명령은 카운트하지 않습니다.
- 따라서 두 번째 방법의 계산 방식은 SHOW GLOBAL STATUS LIKE 'Queries'를 실행하고, t초 후에 다시 SHOW GLOBAL STATUS LIKE 'Queries'를 실행하여 이전과 이후의
  Queries 수의 차이를 t초로 나누어 Queries-per-second를 계산하는 것입니다.

#### 2.2.3 방법 3: Questions 상태값 사용 (권장)

- 방법 3의 계산 방법은 방법 2와 유사하지만, `SHOW GLOBAL STATUS LIKE 'Queries'`를 `SHOW GLOBAL STATUS LIKE 'Questions'`로 수정한 점이 다릅니다.
- 그렇다면 Questions는 무엇을 의미할까요? MySQL 공식 문서의 설명은 다음과 같습니다.
	- Questions는 서버에서 실행된 문장의 수를 나타내지만, Queries 변수와 달리 클라이언트가 서버로 보낸 문장만 포함하고 저장 프로그램 내에서 실행된 문장은 포함하지 않습니다.
	- 또한 COM_PING, COM_STATISTICS, COM_STMT_PREPARE, COM_STMT_CLOSE, COM_STMT_RESET 명령은 카운트하지 않습니다.

```sql
-- 현재 Questions 값 확인
SHOW
GLOBAL STATUS LIKE 'Questions';

-- t초 후 다시 확인하여 계산
QPS
= (Questions_after - Questions_before) / t
```

- **Questions 상태값의 특징:**
	- 클라이언트가 서버로 보낸 문장만 카운트
	- 저장 프로시저 내부 문장은 제외
	- Prepared Statement 관련 명령들도 제외

### 2.3 Queries vs Questions 차이점

| 구분               | Queries | Questions | 비고                      |
|------------------|---------|-----------|-------------------------|
| 저장 프로시저          | 포함      | 제외        | 내부 저장 문장, 비텍스트 SQL 상호작용 |
| COM_STMT_PREPARE | 포함      | 제외        | Prepared statements     |
| COM_STMT_CLOSE   | 포함      | 제외        | Prepared statements     |
| COM_STMT_RESET   | 포함      | 제외        | Prepared statements     |

- Queries가 더 많은 통계를 카운트하기 때문에, 이론적으로 Queries 카운트는 항상 Questions 카운트보다 크거나 같습니다.
- 일반적인 비즈니스 환경에서는 저장 프로시저와 Prepared Statement를 거의 사용하지 않으므로, 두 방법의 결과는 거의 동일합니다.
- 하지만 더 정확한 클라이언트 요청 기반 QPS를 원한다면 Questions을 사용하는 것을 권장합니다.

## 3. TPS 계산 방법

### 3.1 TPS 정의

- MySQL 공식 문서에 따르면, TPS는 "Transactions Per Second"의 줄임말로, 데이터베이스 서버가 단위 시간당 처리하는 트랜잭션 수를 의미합니다.

:::warning
TPS는 InnoDB 스토리지 엔진에서만 의미가 있습니다. MyISAM 엔진에서는 트랜잭션을 지원하지 않으므로 TPS를 논의할 수 없습니다.
:::

### 3.2 TPS 계산 방법 비교

#### 3.2.1 방법 1: CRUD 문장 합계 (부정확)

- 앞서 QPS 계산에서 `SHOW GLOBAL STATUS`를 학습했는데, 이를 TPS 계산에도 동일하게 적용할 수 있습니다.
- `Com_insert`, `Com_delete`, `Com_update`, `Com_select`를 얻어서 TPS를 계산하는 방법입니다.
	- Com_xxx 문장 카운터 변수는 각 xxx 문장이 실행된 횟수를 나타냅니다.
	- 각 문장 유형마다 하나의 상태 변수가 있습니다.
	- 예를 들어, `Com_delete`와 `Com_update`는 각각 DELETE와 UPDATE 문장의 수를 나타냅니다.
	- 다중 테이블 삭제나 다중 테이블 업데이트가 있을 경우, 사용해야 하는 카운트 변수는 `Com_delete_multi`와 `Com_update_multi`입니다.

```sql
-- 잘못된 방법
TPS
= (Com_insert + Com_delete + Com_update + Com_select + 
       Com_delete_multi + Com_update_multi) / t
```

- 문제점
	- 하나의 트랜잭션에 여러 SQL이 포함될 수 있음
	- 위 방식은 트랜잭션이 정확히 하나의 SQL 문장으로 구성된다고 가정하는 것임
	- SQL 개수와 트랜잭션 개수는 다른 개념
	- 트랜잭션의 정의에 위배됨

#### 3.2.2 방법 2: Commit/Rollback 합계 (제한적)

- 트랜잭션에는 begin과 commit/rollback 문이 필요합니다.
- 그렇다면 commit과 rollback의 합계를 계산하는 것, 즉 `Com_commit` + `Com_rollback`을 계산하여 TPS를 구할 수 있지 않을까요?

```sql
-- 제한적인 방법
TPS
= (Com_commit + Com_rollback) / t
```

- 문제점
	- MySQL은 Oracle과 다릅니다. Oracle에서는 트랜잭션이 명시적으로 커밋되어야 하며, commit을 실행해야만 트랜잭션이 커밋됩니다.
	- MySQL은 기본적으로 autocommit=1 설정
	- 대부분의 트랜잭션이 자동 커밋되어 Com_commit이 0이 될 수 있음
	- 마스터-슬레이브 환경에서 마스터와 슬레이브의 TPS가 다르게 계산됨

:::info
MySQL에서는 autocommit이 기본적으로 활성화되어 있어, begin과 commit/rollback으로 명시적으로 감싸지 않는 한, 하나의 SQL문이 실행된 후 자동으로 커밋됩니다.
:::

#### 3.2.3 방법 3: GTID 기반 계산 (권장)

- MySQL에 익숙한 분들은 데이터베이스에서 GTID를 활성화하는 것이 필수적인 지표라는 것을 알고 있을 것입니다. 
- GTID (Global Transaction Identifier)
  - GTID는 글로벌 트랜잭션 식별자로, 복제 클러스터에서 마스터가 커밋하는 각 트랜잭션에 대해 고유한 ID가 생성되는 것을 보장합니다.
- **GTID 구조:**
  - GTID = source_id:transaction_id
  - source_id: 트랜잭션을 실행하는 주 데이터베이스의 server-uuid 값
  - transaction_id: 1부터 시작하는 자동 증가 시퀀스
- GTID 기반 TPS 계산의 장점
  - 하나의 트랜잭션은 고유한 GTID만 생성하고, transaction_id 부분이 증가 시퀀스이므로, 이 값을 기반으로 TPS를 계산하는 것이 가장 정확한 방법

```sql
-- GTID 상태 확인
SHOW
MASTER STATUS;
-- 또는 슬레이브에서는
SHOW
SLAVE STATUS;
```

- MySQL에서는 `SHOW MASTER STATUS` 명령을 사용하여 `Executed_Gtid_Set`을 확인할 수 있으며, 이는 이 인스턴스에서 실행된 GTID 집합을 나타냅니다.
- **GTID(Global Transaction Identifier) 특징:**
  - MySQL 5.6부터 지원
  - 각 트랜잭션마다 고유한 식별자 생성
  - source_id:transaction_id 형태
  - transaction_id는 1부터 시작하는 증가 시퀀스

##### GTID 기반 TPS 계산 예시

```sql
mysql
> SHOW MASTER STATUS
\G
*************************** 1. row ***************************
             File: mysql-bin.000006
         Position: 926206
     Binlog_Do_DB: 
 Binlog_Ignore_DB: 
Executed_Gtid_Set: 59bf2dea-e3b5-11eb-ae63-02000aba3f7b:1-2516
```

```bash
# t초 간격으로 GTID 값의 차이를 계산
TPS = (GTID_transaction_id_after - GTID_transaction_id_before) / t
```

##### 주의 사항

- 일부에서는 GTID가 SELECT 유형의 트랜잭션을 포함하지 않는다고 지적할 수 있습니다.
- 앞서 언급했듯이 GTID(Global Transaction Identifier)는 글로벌 트랜잭션 식별자를 나타냅니다.
  - GTID는 SELECT만 수행하는 트랜잭션에 GTID 번호를 부여하지 않습니다
  - 즉, 공식적으로는 이러한 쿼리를 트랜잭션으로 간주하지 않습니다.
- **TPS와 QPS의 올바른 이해:**
  - **TPS의 본질**: TPS(Transactions Per Second)는 원래 데이터 변경을 수반하는 실제 트랜잭션만을 대상으로 합니다
  - **단순 조회는 TPS 대상이 아님**: SELECT만 수행하는 읽기 전용 쿼리는 데이터를 변경하지 않으므로 엄밀한 의미의 트랜잭션이 아닙니다
  - **GTID 방식이 정확한 이유**: GTID는 데이터 변경이 발생하는 트랜잭션에만 부여되므로, 진정한 의미의 TPS를 측정할 수 있습니다
- 읽기/쓰기 차원의 분리
  - 비즈니스 읽기에 관심이 있다면 QPS를 확인하세요
  - 비즈니스 쓰기에 관심이 있다면 TPS를 확인하세요
- **결론:**
  - **TPS (GTID 기반)**: 데이터 변경 트랜잭션의 처리 성능 측정 → 쓰기 성능 지표
  - **QPS (Questions 기반)**: 모든 쿼리(조회 포함)의 처리 성능 측정 → 전체 쿼리 처리 능력 지표

## 4. 실제 운영 환경에서의 권장사항

### 4.1 QPS 모니터링

```sql
-- Questions 기반 QPS 계산 스크립트 예시
SELECT VARIABLE_VALUE as current_questions
FROM performance_schema.global_status
WHERE VARIABLE_NAME = 'Questions';
```

### 4.2 TPS 모니터링

```sql
-- GTID 기반 TPS 모니터링
SHOW
MASTER STATUS;
-- Executed_Gtid_Set에서 transaction_id 추출하여 계산
```

### 4.3 모니터링 도구 활용

- **Prometheus + Grafana**: mysqld_exporter를 통한 자동 수집
- **MySQL Enterprise Monitor**: 상용 모니터링 솔루션
- **PMM (Percona Monitoring and Management)**: 오픈소스 모니터링 도구

## 5. 성능 최적화를 위한 활용 방법

### 5.1 QPS/TPS 기반 용량 계획

- **QPS**: 읽기 성능과 전체 쿼리 부하 측정
- **TPS**: 쓰기 성능과 트랜잭션 처리 능력 측정

### 5.2 임계값 설정

```sql
-- 예시: 서버 사양에 따른 임계값 설정
QPS
임계값: 1000 (경고), 1500 (위험)
TPS 임계값: 500 (경고), 800 (위험)
```

:::info
임계값은 서버 사양, 애플리케이션 특성, 비즈니스 요구사항에 따라 달라집니다. 충분한 부하 테스트를 통해 적절한 값을 설정해야 합니다.
:::

## 6. 마치며

- MySQL의 QPS와 TPS를 정확히 계산하는 것은 데이터베이스 성능 관리의 기본입니다. 
- 각 계산 방법의 장단점을 이해하고, 운영 환경에 맞는 적절한 방법을 선택하여 사용하시기 바랍니다.
  - **QPS**: Questions 상태값 기반 계산 권장
  - **TPS**: GTID 기반 계산 권장 (MySQL 5.6 이상)
  - **모니터링**: 자동화된 도구를 활용하여 지속적인 관찰

## 참고

- https://segmentfault.com/a/1190000040620512/en