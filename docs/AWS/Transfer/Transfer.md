## 1 Transfer

- AWS Transfer Family는 파일을 Amazon S3 또는 Amazon EFS로 전송하거나 이들에서 전송받기 위한 완전 관리형 서비스입니다.
- FTP 프로토콜을 사용하여 파일 전송을 지원합니다.



### 1.1 지원되는 프로토콜

- **AWS Transfer for FTP**: File Transfer Protocol (FTP)
- **AWS Transfer for FTPS**: File Transfer Protocol over SSL (FTPS)
- **AWS Transfer for SFTP**: Secure File Transfer Protocol (SFTP)



### 1.2 주요 기능

- **관리형 인프라**: AWS Transfer Family는 관리형 인프라를 제공하여 사용자가 인프라 관리에 신경 쓰지 않고 파일 전송에 집중할 수 있습니다.
- **확장성**: 필요에 따라 쉽게 확장할 수 있어 대규모 파일 전송 작업에도 적합합니다.
- **신뢰성**: 높은 신뢰성을 제공하며, 여러 가용 영역(multi-AZ)에 걸쳐 고가용성을 보장합니다.
- **요금 체계**: 프로비저닝된 엔드포인트 시간당 요금과 데이터 전송량(GB)당 요금이 부과됩니다.
- **사용자 자격 증명 관리**: 서비스 내에서 사용자의 자격 증명을 저장하고 관리할 수 있습니다.
- **기존 인증 시스템과 통합**: Microsoft Active Directory, LDAP, Okta, Amazon Cognito, 커스텀 인증 시스템과 통합할 수 있습니다.



### 1.3 사용 사례

- **파일 공유**: AWS Transfer Family를 통해 조직 내외부와 안전하게 파일을 공유할 수 있습니다.
- **공공 데이터 세트**: 대규모 공공 데이터 세트를 손쉽게 공유하고 관리할 수 있습니다.
- **CRM 및 ERP 시스템 통합**: CRM(고객 관계 관리) 및 ERP(전사적 자원 관리) 시스템과 통합하여 파일 전송 작업을 자동화하고 효율적으로 관리할 수 있습니다.