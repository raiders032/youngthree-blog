## 1 Aurora

- [레퍼런스](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html)
- Aurora는 MySQL 및 PostgreSQL과 호환되는 완전 관리형 관계형 데이터베이스 엔진입니다.
- 대부분의 기존 애플리케이션 변경 없이 MySQL의 처리량의 최대 5배, PostgreSQL의 처리량의 최대 3배를 제공합니다.
- Aurora의 스토리지는 자동으로 확장되며 최대 128 tebibytes (TiB)까지 지원합니다.
- 또한, Aurora는 데이터베이스 클러스터링과 복제를 자동화하고 표준화하여 데이터베이스 관리의 복잡성을 줄여줍니다.

## 2 Replication

- [레퍼런스](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Replication.html)
- Aurora DB 클러스터는 여러 데이터베이스 인스턴스를 가질 수 있습니다. 
- 첫 번째 인스턴스는 쓰기 작업을 담당하는 **writer DB**이고, 두 번째 및 세 번째 인스턴스부터는 읽기 작업을 담당하는 **Aurora Replicas** 또는 **reader DB**입니다.
- 새로운 인스턴스를 추가하면 Aurora는 자동으로 writer DB에서 reader DB로 데이터를 복제합니다.
- 이 과정은 Aurora가 자동으로 처리하므로, 관리자가 별도로 설정할 필요가 없습니다.
- Aurora Replicas는 클러스터 내의 읽기 요청을 처리하여, writer DB의 부하를 줄이고 전체 성능을 향상시킵니다.
- 이러한 구조는 가용성을 높이는 데도 도움이 됩니다. 만약 writer DB가 장애가 발생하여 사용할 수 없게 되면, Aurora는 자동으로 reader DB 중 하나를 새로운 writer DB로 승격시킵니다.
- Aurora DB 클러스터는 최대 15개의 Aurora Replicas를 가질 수 있으며, 이러한 인스턴스들은 여러 가용 영역(AZ)에 분산되어 배치될 수 있습니다. 이는 데이터베이스의 고가용성과 내결함성을 보장합니다.

### 2.1 동기화 지연(Lag)

- **동기화 지연**은 writer DB와 reader DB 간의 데이터 복제에서 발생할 수 있는 시간 차이를 의미합니다.
- Aurora는 기본적으로 비동기식 복제를 사용하므로, reader DB는 writer DB의 변경 사항을 즉시 반영하지 않을 수 있습니다.
- 이 지연은 일반적으로 짧지만, 클러스터의 부하나 네트워크 상태에 따라 달라질 수 있습니다.
- **Aurora에서는 동기화 지연을 최소화하기 위해 다양한 최적화 기법을 사용**하며, 이러한 지연 시간을 모니터링할 수 있는 도구도 제공합니다.
- **Amazon CloudWatch**를 통해 ReplicationLag 지표를 모니터링하여, 클러스터 내의 복제 상태와 지연 시간을 확인할 수 있습니다.
- 또한, 적절한 리소스 프로비저닝과 아키텍처 설계를 통해 동기화 지연을 줄이는 것이 중요합니다.
- **고가용성과 성능을 위해,** 가능한 한 여러 가용 영역에 인스턴스를 분산 배치하고, 읽기 트래픽을 효과적으로 분산 처리하는 것이 필요합니다.

## 3 Database Cloning

- [레퍼런스](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Managing.Clone.html)
- 데이터베이스 클로닝은 Aurora의 기능으로, 기존 데이터베이스의 정확한 사본을 빠르게 생성할 수 있습니다.
- 클로닝은 몇 분 내에 완료되며, 클로닝된 데이터베이스는 원본 데이터베이스와 동일한 데이터를 포함합니다.
- 클로닝된 데이터베이스는 독립적으로 작동하므로, 스테이징, 테스트 또는 개발 목적으로 사용할 수 있습니다.
- 클로닝 작업은 프로덕션 데이터베이스의 성능에 영향을 주지 않으며, 이를 통해 스테이징 환경을 빠르고 효율적으로 구성할 수 있습니다.
- 클로닝 기능은 데이터베이스 관리 및 운영의 유연성을 높여주며, 복잡한 데이터베이스 복제 설정 없이도 손쉽게 복제본을 만들 수 있습니다.

## 4 Aurora DB 클러스터

![Pasted image 20240622121318.png](images/Pasted%20image%2020240622121318.png)

- 클러스터 내에서 데이터베이스 인스턴스는 읽기 및 쓰기 작업을 효율적으로 분산하여 고가용성과 확장성을 제공합니다.

### 4.1 Writer Endpoint

- **Writer Endpoint**는 Aurora 클러스터에서 유일하게 쓰기 작업을 처리하는 엔드포인트입니다.
- 클러스터 내의 하나의 인스턴스만이 writer 역할을 수행하며, 애플리케이션의 모든 쓰기 작업은 이 엔드포인트를 통해 이루어집니다.
- Writer Endpoint는 자동 장애 조치(failover) 기능을 지원하여, 현재 writer 인스턴스에 장애가 발생하면 클러스터 내 다른 인스턴스가 새로운 writer로 승격됩니다.

### 4.2 마스터와 리더의 데이터 공유 (공유 볼륨)

- Aurora 클러스터는 **공유 스토리지 볼륨**을 사용하여 마스터 인스턴스(Writer)와 리더 인스턴스(Reader) 간에 데이터를 공유합니다.
- 모든 데이터는 클러스터 내 인스턴스가 접근할 수 있는 단일 스토리지 볼륨에 저장됩니다.
- 이 접근 방식 덕분에, 마스터와 리더 인스턴스는 동일한 데이터를 실시간으로 사용할 수 있으며 데이터 일관성을 유지합니다.
- 마스터 인스턴스는 쓰기 작업을 처리하며, 리더 인스턴스는 읽기 작업만을 처리합니다.
- 이러한 공유 스토리지 구조는 데이터 복제 및 동기화를 간소화하고 성능을 향상시킵니다.

### 4.3 Reader Endpoint

- **Reader Endpoint**는 클러스터 내의 모든 읽기 전용 인스턴스를 대상으로 하는 엔드포인트입니다.
- 애플리케이션의 읽기 작업은 이 엔드포인트를 통해 여러 리더 인스턴스로 분산되어 처리됩니다.
- 이를 통해 읽기 작업 부하를 효과적으로 분산시키고, 읽기 성능을 향상시킬 수 있습니다.
- Reader Endpoint는 클러스터의 상태에 따라 동적으로 읽기 인스턴스를 조정할 수 있습니다.

## 5 Amazon Aurora Global Database

![Pasted image 20240622162228.png](images/Pasted%20image%2020240622162228.png)

- [레퍼런스](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html)
- Amazon Aurora 글로벌 데이터베이스는 여러 AWS 리전에 걸쳐 분산되어 있어, 저지연 글로벌 읽기 성능을 제공하고 전체 AWS 리전에 영향을 미칠 수 있는 드문 장애로부터 빠르게 복구할 수 있습니다. 
- Aurora 글로벌 데이터베이스는 하나의 리전에 기본 DB 클러스터를 가지며, 다른 리전에 최대 다섯 개의 보조 DB 클러스터를 가질 수 있습니다.. 
	- 쓰기 작업은 기본 AWS 리전의 기본 DB 클러스터에 직접 수행됩니다. 
- Aurora는 전용 인프라를 사용하여 데이터를 보조 AWS 리전으로 복제하며, 지연 시간은 일반적으로 1초 이내입니다.
- Aurora 글로벌 데이터베이스는 복제를 위해 데이터베이스 엔진이 아닌 클러스터 스토리지 볼륨을 사용합니다

## 6 Backups

### 6.1 Automated Backups

- 자동 백업은 1일부터 최대 35일까지 보관할 수 있습니다.
- 자동 백업은 비활성화할 수 없으며, 이 기간 내에서 시점 복구(Point-in-Time Recovery)를 지원합니다.
- Aurora는 자동으로 데이터베이스를 백업하고, 이를 사용하여 데이터베이스를 특정 시점으로 복원할 수 있습니다.

### 6.2 Manual Snapshots

- 수동 스냅샷은 사용자가 직접 트리거하여 생성할 수 있습니다.
- 수동으로 생성된 스냅샷은 사용자가 원하는 기간 동안 보관할 수 있으며, 자동으로 삭제되지 않습니다.
- 수동 스냅샷을 사용하여 데이터베이스를 특정 시점으로 복원할 수 있습니다.

## 7 Log Export

- 레퍼런스
	- [PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraPostgreSQL.CloudWatch.html)
	- [MySQL](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Integrating.CloudWatch.html)
- Aurora PostgreSQL 및 MySQL DB 클러스터의 로그를 정기적으로 Amazon CloudWatch Logs로 내보낼 수 있습니다.
- 이를 통해 클러스터의 로그 이벤트가 자동으로 CloudWatch Logs로 게시됩니다.
- 게시된 로그 데이터는 CloudWatch Logs에서 분석할 수 있으며, 알람을 설정하고 메트릭을 확인할 수 있습니다.



### 7.1 Aurora PostgreSQL

- PostgreSQL 로그를 CloudWatch Logs로 내보내려면 Aurora PostgreSQL DB 클러스터를 생성하거나 기존 클러스터를 수정하여 로그 내보내기 옵션을 활성화해야 합니다.
- CloudWatch Logs에 내보내진 PostgreSQL 로그는 내구성이 높은 스토리지에 저장되며, 필요에 따라 로그 보관 기간을 설정할 수 있습니다.
- 지원되는 PostgreSQL 버전:
    - 14.3 이상
    - 13.3 이상
    - 12.8 이상
    - 11.12 이상

### 7.2 Aurora MySQL

- MySQL 로그를 CloudWatch Logs로 내보내려면 Aurora MySQL DB 클러스터를 생성하거나 기존 클러스터를 수정하여 로그 내보내기 옵션을 활성화해야 합니다.
- CloudWatch Logs에 내보내진 MySQL 로그는 내구성이 높은 스토리지에 저장되며, 필요에 따라 로그 보관 기간을 설정할 수 있습니다.
- 내보낼 수 있는 로그 유형:
    - 일반 로그
    - 느린 쿼리 로그
    - 감사 로그
    - 오류 로그

## 8 Storage

### 8.1 Standard Storage

- **Standard Storage**는 Aurora의 기본 스토리지 옵션으로, 다양한 워크로드에 적합한 균형 잡힌 성능을 제공합니다.
- SSD 기반의 스토리지는 높은 성능과 안정성을 보장하며, 일반적인 애플리케이션에 충분한 I/O 처리 능력을 갖추고 있습니다.
- Standard Storage는 데이터 읽기 및 쓰기 작업에 대해 일관된 성능을 제공하며, Aurora 클러스터에서 자동으로 확장 가능합니다.

### 8.2 I/O-Optimized Storage

- **I/O-Optimized Storage**는 높은 I/O 성능이 필요한 애플리케이션에 최적화된 옵션입니다.
- I/O 집약적인 작업, 예를 들어 대규모 데이터 분석이나 고성능 데이터베이스 워크로드에 적합합니다.
- 이 옵션은 높은 처리량과 낮은 지연 시간을 제공하여, 대량의 읽기/쓰기 작업에서도 성능 저하 없이 처리할 수 있습니다.
- I/O-Optimized Storage는 Aurora의 표준 스토리지와 마찬가지로 자동 확장 기능을 제공하며, 최대 128TiB까지 확장 가능합니다.
- 이 스토리지 옵션은 높은 성능 요구를 충족시키기 위해 더 높은 IOPS(초당 입출력 작업 수)를 제공합니다.

**참고 자료**

- [Aurora 개요](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html)
- [Aurora 복제](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Replication.html)