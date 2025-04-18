## 1 AWS Schema Conversion Tool (SCT)

- AWS Schema Conversion Tool(SCT)은 데이터베이스 스키마를 한 데이터베이스 엔진에서 다른 엔진으로 변환할 수 있도록 도와주는 도구입니다.
- 이 도구는 데이터베이스 마이그레이션 과정에서 중요한 역할을 하며, 특히 이종 데이터베이스 엔진 간의 마이그레이션에 유용합니다.



### 1.1 주요 기능

- **자동 스키마 변환**
    - SCT는 소스 데이터베이스의 스키마를 분석하고 타겟 데이터베이스 엔진에 맞게 자동으로 변환합니다.
    - 예를 들어, Oracle에서 PostgreSQL로 또는 SQL Server에서 Aurora로 변환할 수 있습니다.
- **스키마 최적화**
    - SCT는 스키마 변환 과정에서 타겟 데이터베이스 엔진의 최적 성능을 위해 스키마를 최적화합니다.
    - 변환된 스키마가 타겟 엔진의 베스트 프랙티스를 따르도록 보장합니다.
- **변환 보고서 제공**
    - SCT는 변환 과정에서 발생한 모든 변경 사항을 기록하고 상세한 보고서를 제공합니다.
    - 이 보고서는 마이그레이션 후 발생할 수 있는 문제를 미리 식별하는 데 도움이 됩니다.



### 1.2 지원되는 소스와 타겟 데이터베이스

- SCT는 다양한 소스와 타겟 데이터베이스 엔진을 지원합니다.
- **지원되는 소스 데이터베이스**
    - Oracle, SQL Server, MySQL, MariaDB, PostgreSQL, Sybase, DB2 등
- **지원되는 타겟 데이터베이스**
    - Amazon Aurora, Amazon RDS, Amazon Redshift, MySQL, PostgreSQL 등



### 1.3 AWS DMS와의 통합

- **DMS와 통합 사용**
    - AWS DMS(Database Migration Service)와 함께 SCT를 사용하면 데이터베이스 마이그레이션을 더욱 효율적으로 수행할 수 있습니다.
    - SCT는 데이터베이스 스키마를 변환하고, DMS는 실제 데이터를 마이그레이션합니다.
    - 이 두 도구의 결합을 통해 온프레미스 데이터베이스를 AWS로 손쉽게 이전할 수 있습니다.
- **통합 마이그레이션 과정**
    1. **스키마 변환**
        - SCT를 사용하여 소스 데이터베이스의 스키마를 타겟 데이터베이스 엔진으로 변환합니다.
        - 변환된 스키마를 타겟 데이터베이스에 적용합니다.
    2. **데이터 마이그레이션**
        - DMS를 사용하여 소스 데이터베이스에서 타겟 데이터베이스로 데이터를 마이그레이션합니다.
        - DMS는 변경 데이터 캡처(CDC) 기능을 사용하여 실시간으로 데이터를 동기화할 수 있습니다.



### 1.4 사용 사례

- **이종 데이터베이스 마이그레이션**
    - Oracle에서 Amazon Aurora PostgreSQL로, SQL Server에서 Amazon RDS MySQL로 마이그레이션하는 경우.
- **데이터베이스 현대화**
    - 기존 온프레미스 데이터베이스를 클라우드로 이전하여 관리 효율성을 높이고 성능을 최적화하려는 경우.
- **비용 절감**
    - 고비용의 상용 데이터베이스 엔진에서 오픈 소스 기반의 저비용 데이터베이스 엔진으로 이전하여 비용을 절감하려는 경우.