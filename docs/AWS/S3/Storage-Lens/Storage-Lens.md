## 1 S3 – Storage Lens

- Amazon S3 Storage Lens는 AWS의 S3 스토리지 서비스에서 데이터를 이해하고 분석하며 최적화할 수 있는 강력한 도구입니다.
- 전체 AWS 조직의 스토리지를 분석하여 비용 효율성을 발견하고 데이터 보호 모범 사례를 적용할 수 있습니다.
- 30일 간의 사용 및 활동 메트릭을 통해 이상 현상을 탐지하고 비용 절감을 위한 최적화 방안을 식별할 수 있습니다.
- 조직, 특정 계정, 지역, 버킷 또는 접두사별로 데이터를 집계하여 상세한 분석이 가능합니다.
- 기본 대시보드를 제공하거나, 사용자 정의 대시보드를 생성하여 필요에 맞게 데이터를 시각화할 수 있습니다.
- 메트릭을 매일 S3 버킷에 CSV 또는 Parquet 형식으로 내보내도록 구성할 수 있습니다.



## 2 주요 기능

### 2.1 스토리지 지표 제공

- Storage Lens는 29가지 이상의 지표를 통해 S3 버킷과 객체 수준의 스토리지 사용 현황을 모니터링할 수 있습니다.
- 지표에는 스토리지 사용량, 객체 수, 요청 수, 트래픽, 오류율 등이 포함됩니다.
- 이러한 지표를 통해 사용자는 스토리지 사용 패턴을 이해하고, 비효율적인 사용을 식별할 수 있습니다.



### 2.2 대시보드 및 보고서

- Storage Lens는 AWS Management Console에서 대시보드를 통해 스토리지 사용 현황을 시각적으로 제공합니다.
- 대시보드는 다양한 필터와 시각화 옵션을 제공하여 사용자가 필요한 정보를 쉽게 찾고 분석할 수 있도록 돕습니다.
- 또한, 정기적인 보고서를 생성하여 이메일로 받을 수 있으며, 이를 통해 지속적인 모니터링이 가능합니다.



### 2.3 비용 절감 인사이트

- Storage Lens는 스토리지 비용 절감을 위한 인사이트를 제공합니다.
- 사용되지 않는 객체, 오래된 버전의 객체, 비효율적인 스토리지 클래스 사용 등을 식별하여 최적화 방안을 제시합니다.
- 이를 통해 사용자는 불필요한 비용을 줄이고, 스토리지 리소스를 효율적으로 관리할 수 있습니다.



### 2.4 보안 및 규정 준수

- Storage Lens는 데이터 보안 및 규정 준수를 위한 인사이트도 제공합니다.
- 퍼블릭 접근이 허용된 객체, 암호화되지 않은 객체 등을 식별하여 보안 위험을 줄일 수 있습니다.
- 규정 준수를 위해 데이터 보존 기간, 접근 제어 설정 등을 모니터링하고 관리할 수 있습니다.



## 3 사용 방법

### 3.1 Storage Lens 활성화

- AWS Management Console에서 S3 서비스로 이동한 후, Storage Lens를 선택하여 활성화할 수 있습니다.
- 기본 설정으로 활성화하거나, 사용자 정의 설정을 통해 원하는 지표와 보고서 주기를 선택할 수 있습니다.



### 3.2 대시보드 설정

- Storage Lens 대시보드는 기본 제공 대시보드 외에도 사용자 정의 대시보드를 생성할 수 있습니다.
- 필요한 지표를 선택하고, 필터와 정렬 옵션을 설정하여 맞춤형 대시보드를 만들 수 있습니다.
- 대시보드를 통해 실시간으로 스토리지 사용 현황을 모니터링할 수 있습니다.



### 3.3 보고서 생성 및 분석

- Storage Lens는 정기적인 보고서를 생성하여 이메일로 제공합니다.
- 보고서에는 선택한 지표와 인사이트가 포함되며, 이를 통해 스토리지 사용 패턴을 분석하고 최적화 방안을 찾을 수 있습니다.
- 보고서는 CSV 형식으로 다운로드하여 로컬에서 추가 분석도 가능합니다.



## 4 Storage Lens – Metrics

### 4.1 Summary Metrics

- Summary Metrics는 S3 스토리지에 대한 일반적인 인사이트를 제공합니다.
- 예시:
    - **StorageBytes**: 총 저장된 바이트 수
    - **ObjectCount**: 총 객체 수
- 사용 사례:
    - 가장 빠르게 성장하는 버킷이나 사용되지 않는 버킷과 접두사를 식별합니다.



### 4.2 Cost-Optimization Metrics

- Cost-Optimization Metrics는 스토리지 비용을 관리하고 최적화하는 데 도움을 줍니다.
- 예시:
    - **NonCurrentVersionStorageBytes**: 버전 관리된 객체의 저장된 바이트 수
    - **IncompleteMultipartUploadStorageBytes**: 완료되지 않은 멀티파트 업로드의 저장된 바이트 수
- 사용 사례:
    - 7일 이상 된 완료되지 않은 멀티파트 업로드를 가진 버킷을 식별합니다.
    - 낮은 비용의 스토리지 클래스로 전환할 수 있는 객체를 식별합니다.



### 4.3 Data-Protection Metrics

- Data-Protection Metrics는 데이터 보호 기능에 대한 인사이트를 제공합니다.
- 예시:
    - **VersioningEnabledBucketCount**: 버전 관리가 활성화된 버킷 수
    - **MFADeleteEnabledBucketCount**: MFA 삭제가 활성화된 버킷 수
    - **SSEKMSEnabledBucketCount**: 서버 사이드 암호화(SSE-KMS)가 활성화된 버킷 수
    - **CrossRegionReplicationRuleCount**: 교차 지역 복제가 설정된 버킷 수
- 사용 사례:
    - 데이터 보호 모범 사례를 따르지 않는 버킷을 식별합니다.



### 4.4 Access-management Metrics

- Access-management Metrics는 S3 객체 소유권에 대한 인사이트를 제공합니다.
- 예시:
    - **ObjectOwnershipBucketOwnerEnforcedBucketCount**: 객체 소유권이 버킷 소유자로 강제된 버킷 수
- 사용 사례:
    - 버킷이 어떤 객체 소유권 설정을 사용하는지 식별합니다.



### 4.5 Event Metrics

- Event Metrics는 S3 이벤트 알림에 대한 인사이트를 제공합니다.
- 예시:
    - **EventNotificationEnabledBucketCount**: S3 이벤트 알림이 구성된 버킷 수
- 사용 사례:
    - 어떤 버킷에 S3 이벤트 알림이 구성되어 있는지 식별합니다.



### 4.6 Performance Metrics

- Performance Metrics는 S3 전송 가속화에 대한 인사이트를 제공합니다.
- 예시:
    - **TransferAccelerationEnabledBucketCount**: 전송 가속화가 활성화된 버킷 수
- 사용 사례:
    - 전송 가속화가 활성화된 버킷을 식별합니다.



### 4.7 Activity Metrics

- Activity Metrics는 스토리지 요청에 대한 인사이트를 제공합니다.
- 예시:
    - **AllRequests**: 모든 요청 수
    - **GetRequests**: GET 요청 수
    - **PutRequests**: PUT 요청 수
    - **ListRequests**: LIST 요청 수
    - **BytesDownloaded**: 다운로드된 바이트 수



### 4.8 Detailed Status Code Metrics

- Detailed Status Code Metrics는 HTTP 상태 코드에 대한 인사이트를 제공합니다.
- 예시:
    - **200OKStatusCount**: HTTP 200 OK 상태 코드 수
    - **403ForbiddenErrorCount**: HTTP 403 Forbidden 상태 코드 수
    - **404NotFoundErrorCount**: HTTP 404 Not Found 상태 코드 수