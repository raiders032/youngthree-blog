## 1 AWS Directory Service

- AWS Directory Service는 Microsoft Active Directory(AD)를 다른 AWS 서비스와 함께 사용하는 다양한 방법을 제공합니다.
- 디렉터리는 사용자, 그룹, 장치에 대한 정보를 저장하며, 관리자는 이를 통해 정보와 리소스에 대한 접근을 관리합니다.
- AWS Directory Service는 클라우드에서 기존 Microsoft AD 또는 LDAP 지원 애플리케이션을 사용하려는 고객에게 여러 디렉터리 옵션을 제공합니다.
- 또한, 사용자, 그룹, 장치 및 접근을 관리하기 위해 디렉터리를 필요로 하는 개발자에게도 동일한 옵션을 제공합니다.



## 2 선택할 디렉터리 서비스

### 2.1 필요한 작업별 추천 디렉터리 서비스

- **클라우드에서 AD 또는 LDAP가 필요할 때**:
    
    - **AWS Directory Service for Microsoft Active Directory(Standard Edition 또는 Enterprise Edition)**:
        - AWS 클라우드에서 실제 Microsoft AD가 필요하거나 AD 지원 작업 및 AWS 애플리케이션(예: Amazon WorkSpaces, Amazon QuickSight) 또는 Linux 애플리케이션을 위한 LDAP 지원이 필요한 경우 사용합니다.
    - **AD Connector**:
        - 온프레미스 사용자가 AD 자격 증명으로 AWS 애플리케이션 및 서비스에 로그인할 수 있도록 하려면 사용합니다.
        - 또한, Amazon EC2 인스턴스를 기존 Active Directory 도메인에 가입시키는 데 사용할 수 있습니다.
    - **Simple AD**:
        - 기본적인 Active Directory 호환성을 제공하는 저비용 디렉터리가 필요하거나, LDAP 호환 애플리케이션을 위한 LDAP 호환성이 필요한 경우 사용합니다.
- **SaaS 애플리케이션 개발 시**:
    
    - **Amazon Cognito**:
        - 고확장성 SaaS 애플리케이션을 개발하고, 소셜 미디어 ID와 함께 구독자를 관리하고 인증할 수 있는 확장 가능한 디렉터리가 필요한 경우 사용합니다.



## 3 AWS Directory Service 옵션

- AWS Directory Service는 여러 디렉터리 유형을 제공합니다. 아래에서 각 옵션에 대한 자세한 내용을 확인할 수 있습니다.



### 3.1 AWS Directory Service for Microsoft Active Directory

- **AWS Managed Microsoft AD**라고도 불리는 AWS Directory Service for Microsoft Active Directory는 AWS 클라우드에서 관리되는 실제 Microsoft Windows Server Active Directory(AD)로 구동됩니다.
- 이 서비스는 광범위한 Active Directory 지원 애플리케이션을 AWS 클라우드로 마이그레이션할 수 있게 해줍니다.
- Microsoft SharePoint, Microsoft SQL Server Always On Availability Groups 및 많은 .NET 애플리케이션과 함께 작동합니다.
- 또한, Amazon WorkSpaces, Amazon WorkDocs, Amazon QuickSight, Amazon Chime, Amazon Connect 및 Amazon Relational Database Service for Microsoft SQL Server(Amazon RDS for SQL Server, Amazon RDS for Oracle, Amazon RDS for PostgreSQL)를 포함한 AWS 관리 애플리케이션 및 서비스를 지원합니다.
- AWS Managed Microsoft AD는 HIPAA 또는 PCI DSS 준수를 위해 디렉터리의 준수를 활성화할 때 AWS 클라우드에서 사용할 수 있는 애플리케이션에 대해 승인되었습니다.
- AWS Managed Microsoft AD에 사용자 및 그룹을 추가하고, AWS Managed Microsoft AD 도메인에 가입된 Windows 컴퓨터에서 친숙한 Active Directory 도구를 사용하여 그룹 정책을 관리합니다.



### 3.2 AD Connector

- AD Connector는 온프레미스 Active Directory와 AWS 서비스 간의 브리지 역할을 합니다.
- 이를 통해 사용자들은 온프레미스 AD 자격 증명을 사용하여 AWS 애플리케이션 및 서비스에 로그인할 수 있습니다.



### 3.3 Simple AD

- Simple AD는 소규모 환경에 적합한 저비용 디렉터리 서비스로, 기본적인 Active Directory 기능과 LDAP 호환성을 제공합니다.
- Samba 4와 호환되는 애플리케이션을 지원합니다.



### 3.4 Amazon Cognito

- Amazon Cognito는 고확장성 SaaS 애플리케이션을 위한 확장 가능한 디렉터리를 제공하여 구독자를 관리하고 인증할 수 있습니다.
- 소셜 미디어 ID와의 통합을 지원합니다.



**참고 자료**

- [AWS Directory Service 개요](https://aws.amazon.com/directoryservice/)
- [How to choose Active Directory solutions on AWS](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/directory_service_ad.html)
- [AWS Managed Microsoft AD](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/directory_microsoft_ad.html)
- [AD Connector](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/directory_ad_connector.html)
- [Simple AD](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/directory_simple_ad.html)
- [Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)