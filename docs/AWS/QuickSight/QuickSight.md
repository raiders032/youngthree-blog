## 1 QuickSight

- Amazon QuickSight는 서버리스 머신 러닝 기반의 비즈니스 인텔리전스(BI) 서비스로, 대화형 대시보드를 생성할 수 있습니다.
	- 이 서비스를 사용하면 사용자는 데이터를 빠르게 시각화하고, 분석하며, 비즈니스 인사이트를 얻을 수 있습니다.
- 자동으로 확장 가능하며, 세션당 과금 방식으로 비용 효율적입니다.
- QuickSight는 AWS 데이터, 타사 데이터, 빅 데이터, 스프레드시트 데이터, SaaS 데이터, B2B 데이터 등을 단일 대시보드에서 통합할 수 있습니다.



### 1.1 데이터 소스

- [레퍼런스](https://docs.aws.amazon.com/quicksight/latest/user/supported-data-sources.html)
- AWS 기반 데이터 소스
    - Amazon Athena
    - Amazon Aurora
    - Amazon OpenSearch Service
    - Amazon Redshift
    - Amazon Redshift Spectrum
    - Amazon S3
    - Amazon S3 Analytics
    - AWS IoT Analytics
    - Timestream
- 외부 데이터 소스
    - Apache Spark 2.0 이상
    - Databricks (E2 플랫폼에서만) on Spark 1.6 이상, 버전 3.0까지
    - Exasol 7.1.2 이상
    - Google BigQuery
    - MariaDB 10.0 이상
    - Microsoft SQL Server 2012 이상
    - MySQL 5.7 이상
    - Oracle 12c 이상
    - PostgreSQL 9.3.1 이상
    - Presto 0.167 이상
    - Snowflake
    - Starburst
    - Teradata 14.0 이상
    - Trino
- 파일 데이터 소스
    - CSV 및 TSV – 콤마 구분 및 탭 구분 텍스트 파일
    - ELF 및 CLF – 확장 및 공통 로그 형식 파일
    - JSON – 평면 또는 반구조화 데이터 파일
    - XLSX – Microsoft Excel 파일
- SaaS 애플리케이션 및 API
    - Adobe Analytics
    - GitHub
    - Jira
    - Salesforce
    - ServiceNow



## 2 주요 기능

### 2.1 SPICE 엔진

- QuickSight는 SPICE(Super-fast, Parallel, In-memory Calculation Engine)를 사용하여 데이터를 인메모리로 처리합니다.
- 이를 통해 데이터가 QuickSight에 로드되면 빠른 성능으로 분석을 수행할 수 있습니다.



### 2.2 고급 보안 기능

- QuickSight 엔터프라이즈 에디션에서는 컬럼 수준 보안(Column-Level Security, CLS)을 설정할 수 있습니다.
- 사용자와 그룹을 정의하고, 대시보드 및 분석 결과를 공유할 수 있습니다.
- 사용자와 그룹은 QuickSight 내부에서만 존재하며, IAM과는 별개로 관리됩니다.



## 3 사용 사례

### 3.1 비즈니스 분석

- QuickSight를 통해 비즈니스 데이터를 분석하고 시각화하여 중요한 인사이트를 도출할 수 있습니다.
- 대시보드를 사용해 실시간 데이터를 모니터링하고, 비즈니스 의사 결정을 지원할 수 있습니다.



### 3.2 시각화 생성

- 다양한 데이터 소스로부터 데이터를 가져와서 대화형 시각화를 생성할 수 있습니다.
- 드래그 앤 드롭 인터페이스를 사용하여 사용자가 쉽게 시각화를 만들고 조작할 수 있습니다.



### 3.3 애드혹 분석

- 필요에 따라 데이터를 탐색하고 분석할 수 있는 애드혹 분석 기능을 제공합니다.
- 데이터 필터링, 정렬, 파라미터 설정 등을 통해 심층적인 분석이 가능합니다.



## 4 QuickSight 대시보드 및 분석

### 4.1 대시보드

- 대시보드는 분석의 읽기 전용 스냅샷으로, 다른 사용자와 공유할 수 있습니다.
- 대시보드는 분석의 구성(필터링, 파라미터, 컨트롤, 정렬)을 유지합니다.
- 대시보드를 공유하려면 먼저 게시해야 합니다.



### 4.2 분석 공유

- 분석 결과를 사용자 또는 그룹과 공유할 수 있습니다.
- 대시보드를 통해 분석 결과를 쉽게 배포하고, 관련된 데이터를 시각적으로 전달할 수 있습니다.



**참고 자료**
- [Amazon QuickSight](https://aws.amazon.com/quicksight/)
