## 1 Amazon Athena

- Amazon Athena는 표준 SQL을 사용하여 Amazon Simple Storage Service(Amazon S3)에 직접 저장된 데이터를 쉽게 분석할 수 있는 대화형 쿼리 서비스입니다.
- Athena는 고객이 Amazon S3에 저장된 비구조화, 반구조화 및 구조화 데이터를 분석할 수 있도록 돕습니다.
    - 예를 들어, CSV, JSON 또는 Apache Parquet 및 Apache ORC 같은 열 기반 데이터 형식이 있습니다.
    - 고객은 Athena를 사용하여 ANSI SQL을 사용한 ad hoc 쿼리를 실행할 수 있으며, 데이터를 Athena에 집계하거나 로드할 필요가 없습니다.
- Serverless 쿼리 서비스로 S3에 저장된 데이터를 분석하는 데 사용됩니다.
    - S3에 저장된 데이터를 SQL을 사용하여 직접 쿼리할 수 있어 별도의 인프라스트럭처 구성이나 관리가 필요하지 않습니다.
- Presto 기반으로 표준 SQL 언어를 사용하여 파일을 쿼리합니다.
- CSV, JSON, ORC, Avro, Parquet 형식을 지원합니다.
- 가격: 스캔된 데이터 1TB당 $5.00가 부과됩니다.
- 일반적으로 Amazon Quicksight와 함께 보고서 및 대시보드를 작성하는 데 사용됩니다.



### 1.1 주요 사용 사례

- 비즈니스 인텔리전스, 분석, 보고서 작성
- VPC Flow Logs, ELB Logs, CloudTrail 트레일 등을 분석 및 쿼리하는 데 사용됩니다.
- 시험 팁: 서버리스 SQL을 사용하여 S3의 데이터를 분석하려면 Athena를 사용합니다.



## 2 Performance Improvement

### 2.1 Columnar Data and Compression

- columnar 데이터 사용으로 비용 절감(스캔 감소)과 성능 향상을 도모할 수 있습니다.
    - Apache Parquet 또는 ORC 형식이 권장됩니다.
    - Glue를 사용하여 데이터를 Parquet 또는 ORC로 변환할 수 있습니다.
- 데이터를 압축하면 더 작은 크기로 검색할 수 있습니다.
    - 예: bzip2, gzip, lz4, snappy, zlib, zstd 등



### 2.2 Data Partitioning

- S3에 데이터를 파티셔닝하여 가상 열에 대한 쿼리를 쉽게 수행할 수 있습니다.
- 데이터 파티셔닝은 쿼리 성능을 향상시키며, 특정 열의 값을 기준으로 데이터를 분할하여 필요한 부분만 읽을 수 있게 합니다.
- 예시: `s3://athena-examples/flight/parquet/year=1991/month=1/day=1/`
    - 이 예시에서 데이터는 연도, 월, 일 별로 파티셔닝되어 있으며, 이는 쿼리 시 특정 기간의 데이터를 빠르게 필터링할 수 있게 합니다.



## 3 Federated Query

- Amazon Athena의 Federated Query 기능을 사용하면 다양한 데이터 소스에 걸쳐 SQL 쿼리를 실행할 수 있습니다.
    - 관계형, 비관계형, 객체 및 커스텀 데이터 소스(AWS 또는 온프레미스)에 저장된 데이터를 대상으로 쿼리를 실행할 수 있습니다.
- Federated Queries는 AWS Lambda에서 실행되는 Data Source Connectors를 사용합니다.
    - Data Source Connectors는 Athena가 여러 데이터 소스에서 데이터를 가져와 쿼리를 실행할 수 있도록 돕습니다.
    - 예를 들어, CloudWatch Logs, DynamoDB, RDS 등 다양한 데이터 소스와 연결할 수 있습니다.
- Federated Query의 과정:
    - **연결 설정**: 먼저, Athena에서 쿼리를 실행할 데이터 소스와 연결을 설정합니다. 이 연결은 AWS Lambda를 통해 이루어집니다.
    - **쿼리 실행**: SQL 쿼리를 작성하여 다양한 데이터 소스에 걸쳐 데이터를 조회합니다. Lambda 함수는 각 데이터 소스에서 데이터를 가져와 쿼리를 실행합니다.
    - **결과 저장**: 쿼리 결과는 Amazon S3에 저장됩니다. 이를 통해 결과 데이터를 다른 서비스와 쉽게 연계할 수 있습니다.



**참고 자료**

- [Amazon Athena Documentation](https://docs.aws.amazon.com/athena/latest/ug/what-is.html)
- [Amazon Athena Performance Tuning](https://docs.aws.amazon.com/athena/latest/ug/performance-tuning.html)
- [Federated Query in Amazon Athena](https://docs.aws.amazon.com/athena/latest/ug/connect-to-a-data-source.html)