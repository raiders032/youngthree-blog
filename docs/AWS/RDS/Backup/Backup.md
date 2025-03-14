## 1 Amazon RDS 백업

- Amazon RDS(Relational Database Service)는 데이터베이스 인스턴스의 자동 백업 기능을 제공합니다.
- 이 기능은 데이터 손실을 방지하고 특정 시점으로의 복원을 가능하게 하는 중요한 도구입니다.
- 자동 백업 또는 DB 스냅샷으로부터의 복원은 새로운 DB 인스턴스를 생성합니다.
- 이 복원 과정이 기존 DB 인스턴스를 변경하는 것이 아니라, 완전히 새로운 DB 인스턴스를 생성합니다.



## 2 자동 백업 (Automated Backups)
### 2.1 자동 백업의 특징

- RDS는 기본적으로 매일 데이터베이스 인스턴스의 백업을 자동으로 생성합니다.
- 자동 백업은 "연속적"이며, 특정 시점으로의 복구(Point-in-Time Recovery)를 가능하게 합니다.
- 백업은 정해진 백업 보존 기간 동안 유지됩니다.
- 백업 보존 기간은 0일부터 35일까지 설정할 수 있으며, 기본값은 7일입니다.
- 백업을 비활성화하려면 보존 기간을 0으로 설정하면 됩니다.

### 2.2 백업 구성요소

- 자동 백업에는 데이터베이스 스냅샷과 트랜잭션 로그 백업이 포함됩니다.
- 트랜잭션 로그는 5분 간격으로 백업되어 특정 시점으로의 복원을 가능하게 합니다.
- 스냅샷과 로그 백업을 조합하여 특정 시점으로의 복원이 이루어집니다.

### 2.3 백업 저장 위치

- 자동 백업은 RDS 인스턴스가 위치한 리전 내의 S3 스토리지에 저장됩니다.
- 이로 인해 높은 내구성과 가용성을 보장합니다.
- 백업 데이터는 암호화되어 저장되며, 암호화 키는 사용자가 관리할 수 있습니다.

### 2.4 백업 윈도우

- 자동 백업은 선호하는 백업 윈도우 동안 매일 수행됩니다.
- 백업이 백업 윈도우 동안 완료되지 않으면 윈도우가 끝난 후에도 백업이 완료될 때까지 계속 진행됩니다.
- 백업 윈도우는 DB 인스턴스 또는 멀티 AZ DB 클러스터의 주간 유지 관리 윈도우와 겹칠 수 없습니다.

### 2.5 백업 중단과 지연

- 자동 백업 윈도우 동안 백업 프로세스가 초기화될 때 잠시 동안 스토리지 I/O가 중단될 수 있습니다 (보통 몇 초 미만).
- 멀티 AZ 배포의 경우 백업 동안 몇 분 동안 지연 시간이 증가할 수 있습니다.
- MariaDB, MySQL, Oracle 및 PostgreSQL의 경우 멀티 AZ 배포에서 백업이 스탠바이에서 수행되므로 주요 I/O 활동이 중단되지 않습니다.
- SQL Server의 경우 싱글 AZ와 멀티 AZ 배포 모두에서 주요 I/O 활동이 백업 동안 잠시 중단됩니다.
- Db2의 경우 스탠바이에서 백업이 수행되더라도 I/O 활동이 잠시 중단됩니다.

### 2.6 백업 건너뛰기

- 자동 백업이 시작될 때 DB 인스턴스나 클러스터가 과도한 작업을 수행 중인 경우, 자동 백업이 때때로 건너뛰어질 수 있습니다.
- 백업이 건너뛰어진 경우에도 포인트 인 타임 복구(PITR)를 수행할 수 있으며, 다음 백업 윈도우 동안 백업이 다시 시도됩니다.

### 2.7 기본 백업 윈도우

- DB 인스턴스 또는 멀티 AZ DB 클러스터를 생성할 때 선호하는 백업 윈도우를 지정하지 않으면, Amazon RDS가 기본 30분 백업 윈도우를 할당합니다.
- 기본 백업 윈도우는 각 AWS 리전의 8시간 블록 중에서 임의로 선택됩니다.

### 2.8 백업 보존

- DB 인스턴스를 삭제할 때 자동 백업을 보존할 수 있습니다.
- 보존된 자동 백업은 인스턴스 삭제 후에도 지정된 기간 동안 유지됩니다.

### 2.9 복구

- RDS는 데이터베이스 인스턴스를 백업을 통해 쉽게 복구할 수 있도록 합니다.
- 특정 시점으로 복구하려면, 원하는 시점의 트랜잭션 로그를 사용하여 복원이 진행됩니다.
- 백업을 사용하여 새 인스턴스를 생성하거나, 기존 인스턴스를 대체할 수 있습니다.

### 2.10 비용

- 자동 백업 기능 사용 시, 백업 데이터 저장 비용이 발생합니다.
- 기본적으로 백업 데이터는 RDS 인스턴스 크기의 100%에 해당하는 스토리지 용량까지 무료로 제공됩니다.
- 초과된 용량에 대해서는 S3 스토리지 요금이 부과됩니다.



## 3 스냅샷 (Snapshots)

- 스냅샷은 데이터베이스의 전체 복사본을 특정 시점에 생성하는 기능입니다.
- 사용자가 수동으로 생성하거나 자동화된 스케줄에 따라 생성할 수 있습니다.
- 스냅샷은 증분식으로 저장되어 스토리지 비용을 절약할 수 있습니다.
- 스냅샷은 리전 간 복사가 가능하며, 이를 통해 재해 복구 및 지역 간 데이터 마이그레이션을 지원합니다.



### 3.1 암호화된 스냅샷

- 암호화된 RDS 인스턴스의 스냅샷도 자동으로 암호화됩니다.
- 암호화된 스냅샷을 다른 리전으로 복사할 때, 대상 리전에서 새로운 KMS 키를 사용하여 재암호화할 수 있습니다.
- 암호화된 스냅샷은 암호화를 해제할 수 없으며, 항상 암호화된 상태로 유지됩니다.



## 4 크로스 리전 자동 백업 (Cross-Region Automated Backups)

- Amazon RDS는 크로스 리전 자동 백업 기능을 제공합니다.
- 이 기능을 사용하면 소스 DB 인스턴스의 자동 백업과 수동 스냅샷을 다른 AWS 리전으로 자동으로 복제할 수 있습니다.
- 크로스 리전 자동 백업은 재해 복구, 규정 준수, 데이터 중복성 등의 목적으로 사용됩니다.



### 4.1 크로스 리전 자동 백업의 특징

- 소스 DB 인스턴스와 동일한 백업 보존 기간을 사용합니다.
- 백업 데이터는 대상 리전에서 암호화되어 저장됩니다.
- 증분 백업 방식을 사용하여 데이터 전송 비용과 시간을 최소화합니다.
- 운영 효율성이 높아 관리 오버헤드를 줄일 수 있습니다.



### 4.2 크로스 리전 자동 백업 설정 방법

1. RDS 콘솔에서 해당 DB 인스턴스를 선택합니다.
2. "수정" 버튼을 클릭합니다.
3. "백업" 섹션에서 "다른 AWS 리전으로 자동 백업 복제 활성화"를 선택합니다.
4. 대상 리전을 선택합니다.
5. 변경 사항을 저장합니다.



## 5 백업 및 복제 방법 비교

### 5.1 크로스 리전 자동 백업

- 장점: 
	- 가장 운영 효율적인 방법
	- 자동화된 프로세스로 관리 오버헤드 최소화
	- 증분 백업으로 데이터 전송 비용 절감
- 단점: 
	- 모든 DB 엔진이나 인스턴스 유형에서 지원되지 않을 수 있음



### 5.2 리전 간 읽기 전용 복제본

- 장점: 
	- 실시간에 가까운 데이터 복제
	- 읽기 부하 분산 가능
- 단점: 
	- 리소스 사용량이 높음
	- 비용이 더 많이 듦



### 5.3 AWS Database Migration Service (AWS DMS)

- 장점: 
	- 다양한 데이터베이스 간 마이그레이션 지원
	- 지속적인 복제 가능
- 단점: 
	- 설정이 복잡할 수 있음
	- 추가적인 서비스 비용 발생



### 5.4 수동 스냅샷 복사

- 장점: 
	- 간단하고 직관적인 방법
	- 필요할 때마다 수행 가능
- 단점: 
	- 수동 작업이 필요하여 운영 효율성이 낮음
	- 대규모 데이터의 경우 시간이 많이 소요될 수 있음



## 6 결론

- Amazon RDS의 백업 및 복제 기능은 다양한 요구사항을 충족시킬 수 있는 유연성을 제공합니다.
- 크로스 리전 자동 백업은 운영 효율성과 데이터 보호를 모두 만족시키는 최적의 솔루션입니다.
- 암호화된 RDS 인스턴스의 경우, 모든 백업과 스냅샷도 자동으로 암호화되어 보안을 유지합니다.
- 각 방법의 장단점을 고려하여 비즈니스 요구사항에 가장 적합한 솔루션을 선택해야 합니다.