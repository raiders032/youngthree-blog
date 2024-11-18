## 1 Redshift

- Amazon Redshift는 PostgreSQL을 기반으로 하지만 OLTP(Online Transaction Processing)가 아닌 OLAP(Online Analytical Processing) 용도로 사용됩니다.
- Amazon Redshift는 AWS(Amazon Web Services)에서 제공하는 완전 관리형, 페타바이트 규모의 데이터 웨어하우스 서비스입니다.
- Redshift는 대규모 데이터 세트에 대한 복잡한 분석 쿼리를 빠르게 실행하도록 최적화되어 있습니다.
- 다른 데이터 웨어하우스보다 10배 더 나은 성능을 제공하며, 페타바이트 규모로 확장할 수 있습니다.
- 데이터의 열 기반 저장 방식과 병렬 쿼리 엔진을 사용합니다.
- 사용한 만큼만 비용을 지불하며, 프로비저닝된 인스턴스에 따라 비용이 청구됩니다.
- SQL 인터페이스를 제공하여 쿼리를 수행할 수 있습니다.
- Amazon Quicksight, Tableau와 같은 BI 도구와 통합할 수 있습니다.
- Athena와 비교했을 때, 인덱스 덕분에 쿼리, 조인, 집계가 더 빠릅니다.



## 2 아키텍처

- **Leader Node**: 쿼리 계획 수립 및 결과 집계를 담당합니다.
- **Compute Node**: 쿼리를 실행하고 결과를 리더 노드로 전송합니다.
    - 노드 크기를 미리 프로비저닝해야 합니다.
    - 비용 절감을 위해 예약 인스턴스를 사용할 수 있습니다.



## 3 Snapshots & DR

- Redshift는 일부 클러스터에 대해 "다중 AZ" 모드를 지원합니다.
- 스냅샷은 클러스터의 시점 백업으로, 내부적으로 S3에 저장됩니다.
    - 스냅샷은 증분 백업으로, 변경된 부분만 저장합니다.
    - 스냅샷을 새로운 클러스터로 복원할 수 있습니다.
- 자동 스냅샷은 8시간마다, 5GB마다 또는 일정에 따라 생성됩니다. 보존 기간은 1일부터 35일까지 설정할 수 있습니다.
    - 수동 스냅샷은 사용자가 삭제할 때까지 보존됩니다.
    - Redshift는 클러스터의 스냅샷(자동 또는 수동)을 다른 AWS 리전으로 자동 복사하도록 구성할 수 있습니다.



## 4 데이터 로딩

- Redshift로의 대량 삽입은 성능이 훨씬 좋습니다.



## 5 Redshift Spectrum

- Redshift Spectrum을 사용하면 데이터를 로드하지 않고 S3에 이미 있는 데이터를 쿼리할 수 있습니다.
    - 쿼리를 시작하려면 Redshift 클러스터가 필요합니다.
    - 예: `SELECT COUNT (*), ... FROM S3.EXT_TABLE GROUP BY ...`
    - 쿼리는 수천 개의 Redshift Spectrum 노드로 제출됩니다.



## 6 OLTP와 OLAP

> [!NOTE] OLTP와 OLAP
> 
> - **OLTP (Online Transaction Processing)**: 일상의 트랜잭션 관리와 처리에 중점을 둡니다. 예: 은행 거래, 온라인 주문, 재고 관리.
> - **OLAP (Online Analytical Processing)**: 데이터 분석과 복잡한 쿼리에 중점을 둡니다. 대량의 데이터를 분석하고 정보를 제공하여 비즈니스 의사 결정에 도움을 줍니다.



**참고 자료**

- [Amazon Redshift Documentation](https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html)