---
title: "JobRepository"
description: "Spring Batch의 핵심 구성 요소인 JobRepository의 역할과 메타데이터 스키마의 구조를 상세히 알아봅니다. 배치 작업의 상태 관리, 실행 정보 저장, 재시작 지원 등 엔터프라이즈급 배치 처리에 필수적인 개념들을 실무 관점에서 설명합니다."
tags: [ "SPRING_BATCH", "JOB_REPOSITORY", "DATABASE", "METADATA", "BACKEND", "SPRING", "JAVA" ]
keywords: [ "스프링배치", "Spring Batch", "JobRepository", "잡레포지토리", "메타데이터", "metadata", "스키마", "schema", "배치처리", "batch processing", "데이터베이스", "database", "실행정보", "execution", "스프링", "Spring", "자바", "Java", "백엔드", "backend" ]
draft: false
hide_title: true
---

## 1. JobRepository 개요

- Spring Batch는 엔터프라이즈급 배치 처리를 위한 강력하고 유연한 프레임워크입니다.
- 배치 작업의 실행 정보를 효과적으로 관리하고 추적하는 것은 매우 중요한데, 이를 위해 Spring Batch에서는 JobRepository를 제공합니다.
- JobRepository는 배치 작업의 실행에 관한 모든 정보를 저장하고 관리하는 핵심 구성 요소입니다.

### 1.1 JobRepository의 필요성

- 데몬처럼 끝없이 실행되는 작업이 아닌 언젠가 종료되는 처리를 UI 없이 독립 실행형으로 동작하도록 개발하는 것은 어렵지 않습니다.
	- CommandLineRunner를 사용하여 비즈니스 로직이 포함된 단일 기능을 실행한 뒤 종료되는 스프링 부트 애플리케이션을 만들 수 있습니다.
	- 이정도 작업에는 스프링 배치가 필요하지 않습니다.
- 그러나 문제는 진행 중인 작업의 상태를 추적하고, 실패한 작업을 재시작하며, 작업 실행 이력을 관리하는 것입니다.
	- 엔터프라이즈 환경에서는 매우 중요한 요구사항입니다.
- 잡의 상태 관리 기능은 스프링 배치가 제공하는 주요 기능 중 하나입니다.
	- 잡의 상태는 JobRepository에 저장되며, 이를 통해 배치 작업의 실행 이력을 관리할 수 있습니다.

### 1.2 JobRepository의 의미

- 스프링 배치에서 JobRepository는 두 가지 의미를 가집니다.
	- JobRepository 인터페이스: 배치 작업의 실행 정보를 저장하고 관리하는 역할을 정의합니다.
	- JobRepository 구현체: JobRepository 인터페이스를 구현한 클래스는 실제로 데이터베이스에 작업 실행 정보를 저장하고 조회하는 기능을 제공합니다.
- 개발자는 JobRepository 인터페이스를 직접 다루는 일이 거의 없으므로 구현체에 집중하게 됩니다.

### 1.3 관계형 데이터베이스 지원

- JobRepository는 일반적으로 관계형 데이터베이스에 작업 실행 정보를 저장합니다.
- 스프링 배치가 제공하는 여러 데이터베이스 테이블을 사용해 배치 메타데이터를 저장합니다.

## 2. JobRepository의 역할

### 2.1 주요 기능

- Job 및 Step 실행 정보 저장
	- JobRepository는 JobExecution, StepExecution 등의 객체를 생성하고 관련 정보를 데이터베이스에 저장합니다.
	- 이를 통해 배치 작업의 실행 상태, 시작/종료 시간, 처리한 레코드 수 등을 추적할 수 있습니다.
- ExecutionContext 관리
	- ExecutionContext는 Job이나 Step의 실행 중 상태 정보를 저장하는 데 사용됩니다.
	- JobRepository는 이러한 ExecutionContext를 데이터베이스에 저장하고 필요할 때 조회할 수 있도록 합니다.
- 재시작 지원
	- JobRepository에 저장된 실행 정보를 바탕으로 실패한 배치 작업을 재시작할 수 있습니다.
	- 이때 이전 실행에서 성공한 Step은 건너뛰고, 실패한 Step부터 다시 시작할 수 있습니다.

## 3. 메타데이터 스키마 구조

### 3.1 도메인 객체와 테이블 매핑

- Spring Batch의 메타데이터 테이블은 Java 도메인 객체와 밀접하게 매핑됩니다.
- 예를 들어, JobInstance, JobExecution, JobParameters, StepExecution은 각각 BATCH_JOB_INSTANCE, BATCH_JOB_EXECUTION,
  BATCH_JOB_EXECUTION_PARAMS, BATCH_STEP_EXECUTION 테이블에 매핑됩니다.
- ExecutionContext는 BATCH_JOB_EXECUTION_CONTEXT와 BATCH_STEP_EXECUTION_CONTEXT 테이블 모두에 매핑됩니다.
- JobRepository는 각 Java 객체를 올바른 테이블에 저장하고 관리하는 역할을 담당합니다.

### 3.2 DDL 스크립트

- Spring Batch 코어 JAR 파일에는 여러 데이터베이스 플랫폼에 대한 관계형 테이블 생성을 위한 스크립트 예제가 포함되어 있습니다.
- 이들 스크립트는 추가 인덱스 및 제약조건을 원하는 대로 수정하여 사용할 수 있습니다.
- 파일 이름은 `schema-*.sql` 형태이며, `*`은 목표 데이터베이스 플랫폼의 약칭입니다.
- 스크립트는 org.springframework.batch.core 패키지에 있습니다.

### 3.3 버전 컬럼과 낙관적 잠금

- Spring Batch는 데이터베이스 업데이트 시 낙관적 잠금(optimistic locking) 전략을 사용합니다.
- 레코드가 업데이트될 때마다 버전 컬럼의 값이 1씩 증가하며, 저장 시점에 버전 번호가 변경되었다면 OptimisticLockingFailureException이 발생합니다.

### 3.4 식별자 생성

- BATCH_JOB_INSTANCE, BATCH_JOB_EXECUTION, BATCH_STEP_EXECUTION 테이블에는 각각 `_ID`로 끝나는 기본 키 컬럼이 있습니다.
- 이 값은 데이터베이스에서 자동 생성되는 것이 아니라 별도의 시퀀스를 통해 생성됩니다.
- 많은 데이터베이스 벤더가 시퀀스를 지원하지 않는 경우, MySQL의 경우처럼 테이블을 사용하여 시퀀스를 대체할 수 있습니다.

## 4. JobRepository의 핵심 구성 요소

### 4.1 JobInstance

- 배치 Job의 논리적 실행 단위로, Job의 이름과 JobParameters의 조합으로 식별됩니다.
- 동일한 JobInstance에 대해 여러 번의 JobExecution이 존재할 수 있습니다.

### 4.2 JobExecution

- Job의 물리적 실행 단위로, 특정 시점에 실행된 Job의 상태 정보를 나타냅니다.
- JobInstance와 생성 시간으로 식별되며, 시작/종료 시간, 상태, ExitStatus 등의 정보를 포함합니다.

### 4.3 StepExecution

- Step의 물리적 실행 단위로, 특정 JobExecution 내에서 실행된 Step의 상태 정보를 나타냅니다.
- StepExecution은 JobExecution과 Step 이름으로 식별되며, 시작/종료 시간, 상태, commit count, rollback count 등의 정보를 포함합니다.

### 4.4 ExecutionContext

- Job 또는 Step 실행 중 필요한 상태 정보를 저장하는 Key-Value 형태의 데이터 구조입니다.
- JobExecution과 StepExecution은 각각 고유한 ExecutionContext를 가지고 있어, 실행 중 상태를 유지하고 재시작 시 이를 활용할 수 있습니다.

## 5. 주요 메타데이터 테이블

### 5.1 BATCH_JOB_INSTANCE

- JobInstance에 대한 모든 정보를 저장하고 전체 계층 구조의 최상위에 위치합니다.
- 고유 정보가 포함된 잡 파라미터로 잡을 처음 실행하면 단일 JobInstance 레코드가 테이블에 생성됩니다.

#### 테이블 필드

- JOB_INSTANCE_ID: JobInstance의 고유 식별자입니다.
- VERSION: 낙관적 잠금을 위한 버전 번호입니다.
- JOB_NAME: Job의 이름입니다.
- JOB_KEY: Job의 이름과 JobParameters를 기반으로 생성된 JobInstance의 고유 키입니다.(해시 값)

### 5.2 BATCH_JOB_EXECUTION_PARAMS

- JobParameters 객체에 대한 모든 정보를 저장하며, Job에 전달된 0개 이상의 키/값 쌍을 포함합니다.
- 이 테이블에는 잡이 매번 실행될 때마다 사용된 잡 파라미터를 저장합니다.

#### 테이블 필드

- JOB_EXECUTION_ID: JobExecution의 고유 식별자입니다.
- TYPE_CODE: 파라미터의 타입을 나타내는 문자열 코드입니다.
- KEY_NAME: 파라미터의 키 이름입니다.
- STRING_VAL: 문자열 타입 파라미터의 값입니다.
- DATE_VAL: 날짜 타입 파라미터의 값입니다.
- LONG_VAL: 숫자 타입 파라미터의 값입니다.
- DOUBLE_VAL: 실수 타입 파라미터의 값입니다.
- IDENTIFYING: 파라미터가 JobInstance를 식별하는 데 사용되는지 여부를 나타내는 플래그입니다.

### 5.3 BATCH_JOB_EXECUTION

- JobExecution 객체에 대한 모든 정보를 저장하며, Job이 실행될 때마다 새로운 JobExecution과 이 테이블의 새 행이 생성됩니다.
- 잡이 실행되는 동안 주기적으로 업데이트되며, 잡이 완료되면 최종 상태가 저장됩니다.

#### 테이블 필드

- JOB_EXECUTION_ID: JobExecution의 고유 식별자입니다.
- VERSION: 낙관적 잠금을 위한 버전 번호입니다.
- JOB_INSTANCE_ID: JobInstance의 고유 식별자입니다.
- CREATE_TIME: JobExecution이 생성된 시간입니다.
- START_TIME: JobExecution이 시작된 시간입니다.
- END_TIME: JobExecution이 종료된 시간입니다.
- STATUS: JobExecution의 현재 상태입니다.
- EXIT_CODE: JobExecution의 종료 코드입니다.
- EXIT_MESSAGE: EXIT_CODE와 관련된 메시지나 스택 트레이스입니다.
- LAST_UPDATED: JobExecution이 마지막으로 업데이트된 시간입니다.

### 5.4 BATCH_STEP_EXECUTION

- StepExecution 객체에 대한 모든 정보를 저장하며, 각 JobExecution에 대해 Step별로 최소 하나의 항목이 존재합니다.

#### 테이블 필드

- STEP_EXECUTION_ID: StepExecution의 고유 식별자입니다.
- VERSION: 낙관적 잠금을 위한 버전 번호입니다.
- STEP_NAME: Step의 이름입니다.
- JOB_EXECUTION_ID: JobExecution의 고유 식별자입니다.
- START_TIME: StepExecution이 시작된 시간입니다.
- END_TIME: StepExecution이 종료된 시간입니다.
- STATUS: StepExecution의 현재 상태입니다.
- COMMIT_COUNT: 커밋된 트랜잭션 수입니다.
- READ_COUNT: 읽은 레코드 수입니다.
- FILTER_COUNT: 필터링된 레코드 수입니다.
- WRITE_COUNT: 쓴 레코드 수입니다.
- READ_SKIP_COUNT: 읽기에서 건너뛴 레코드 수입니다.
- WRITE_SKIP_COUNT: 쓰기에서 건너뛴 레코드 수입니다.
- PROCESS_SKIP_COUNT: 처리에서 건너뛴 레코드 수입니다.
- ROLLBACK_COUNT: 롤백된 트랜잭션 수입니다.
- EXIT_CODE: StepExecution의 종료 코드입니다.
- EXIT_MESSAGE: StepExecution의 종료 메시지입니다.
- LAST_UPDATED: StepExecution이 마지막으로 업데이트된 시간입니다.

### 5.5 BATCH_JOB_EXECUTION_CONTEXT

- Job의 ExecutionContext에 대한 모든 정보를 저장하며, 각 JobExecution에 대해 정확히 하나의 Job ExecutionContext가 존재합니다.

#### 테이블 필드

- JOB_EXECUTION_ID: JobExecution의 고유 식별자입니다.
- SERIALIZED_CONTEXT: ExecutionContext의 직렬화된 값입니다.
- SHORT_CONTEXT: 트림 처리된 SERIALIZED_CONTEXT입니다.

### 5.6 BATCH_STEP_EXECUTION_CONTEXT

- Step의 ExecutionContext에 대한 모든 정보를 저장하며, 각 StepExecution에 대해 정확히 하나의 ExecutionContext가 존재합니다.

#### 테이블 필드

- STEP_EXECUTION_ID: StepExecution의 고유 식별자입니다.
- SERIALIZED_CONTEXT: ExecutionContext의 직렬화된 값입니다.
- SHORT_CONTEXT: 트림 처리된 SERIALIZED_CONTEXT입니다.

## 6. 실무 활용 팁

- 실제 운영 환경에서는 메타데이터 테이블의 크기가 빠르게 증가할 수 있습니다. 정기적인 데이터 정리 작업을 고려해야 합니다.
- JobRepository는 Spring Batch의 핵심 구성 요소이므로, 데이터베이스 연결 설정과 트랜잭션 관리에 특별한 주의를 기울여야 합니다.

## 7. 마치며

- JobRepository와 메타데이터 스키마는 Spring Batch의 핵심 구성 요소로, 배치 작업의 상태 관리와 재시작 기능을 제공합니다.
- 이러한 구조를 이해하면 Spring Batch 기반의 배치 애플리케이션을 더 효과적으로 설계하고 운영할 수 있습니다.
- 메타데이터 테이블의 구조를 파악하면 배치 작업의 실행 상태를 모니터링하고 문제를 해결하는 데 큰 도움이 됩니다.