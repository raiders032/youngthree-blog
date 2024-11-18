## 1 AWS 리소스 그룹이란?

- AWS 리소스 그룹은 여러 AWS 리소스를 한 번에 관리하고 자동화할 수 있는 서비스입니다.
- 리소스 그룹을 사용하면 다수의 리소스에 대한 작업을 효율적으로 수행할 수 있습니다.
- 리소스 그룹으로 할 수 있는 작업은 사용하는 AWS 서비스에 따라 다릅니다.



## 2 리소스 그룹 접근 방법

- **AWS Management Console**: AWS 관리 콘솔의 상단 내비게이션 바에서 Services를 선택하고, Management & Governance 아래에서 Resource Groups & Tag Editor를 선택합니다.
- **직접 링크**: [AWS Resource Groups 콘솔](https://console.aws.amazon.com/resource-groups/home)을 통해 접근할 수 있습니다.
- **Resource Groups API**: AWS CLI 명령어 또는 AWS SDK 프로그래밍 언어를 사용하여 리소스 그룹을 관리할 수 있습니다. 자세한 내용은 [AWS Resource Groups API Reference](https://docs.aws.amazon.com/ARG/latest/APIReference/Welcome.html)를 참조하십시오.



## 3 리소스 그룹의 주요 개념

### 3.1 리소스란?

- AWS에서 리소스는 작업할 수 있는 엔티티를 의미합니다.
	- 예시: Amazon EC2 인스턴스, AWS CloudFormation 스택, Amazon S3 버킷.
- 여러 리소스를 그룹으로 관리하면 각 서비스 콘솔을 이동할 필요 없이 한 번에 관리할 수 있습니다.
- 대량 작업 예시: 업데이트 또는 보안 패치 적용, 애플리케이션 업그레이드, 네트워크 트래픽에 대한 포트 열기/닫기, 로그 및 모니터링 데이터 수집.



### 3.2 리소스 그룹이란?

- 리소스 그룹은 동일한 AWS 리전에 있는 AWS 리소스의 모음입니다.
- 그룹의 쿼리에 지정된 기준을 충족하는 리소스만 포함됩니다.
- 리소스 그룹을 만드는 데 사용할 수 있는 두 가지 쿼리 유형:
    - **태그 기반 쿼리**: 리소스 유형과 태그 목록을 지정하여 구성원 자격을 기반으로 함.
    - **CloudFormation 스택 기반 쿼리**: 특정 AWS CloudFormation 스택을 기반으로 그룹 구성원 자격을 지정함.



## 4 리소스 그룹의 사용 사례

- AWS 관리 콘솔은 기본적으로 AWS 서비스별로 구성되어 있습니다.
- 리소스 그룹을 사용하면 태그나 CloudFormation 스택의 리소스를 기준으로 정보를 구성하고 통합할 수 있는 사용자 지정 콘솔을 만들 수 있습니다.
- 사용 사례:
    - 개발, 스테이징, 프로덕션 등 애플리케이션의 다른 단계 관리.
    - 여러 부서나 개인이 관리하는 프로젝트.
    - 특정 프로젝트를 위해 함께 사용하거나 그룹으로 관리하고 모니터링하려는 AWS 리소스 세트.
    - Android 또는 iOS와 같은 특정 플랫폼에서 실행되는 애플리케이션과 관련된 리소스 세트.

예시:

- 웹 애플리케이션 개발 중 알파, 베타, 릴리스 단계를 각각 관리하는 리소스 그룹을 생성할 수 있습니다.
- 리소스 그룹 페이지에서 각 버전의 리소스 상태를 확인하고, 필요한 설정을 수정할 수 있습니다.



## 5 AWS Resource Groups와 권한

- 리소스 그룹 기능은 계정 수준에서 권한이 부여됩니다.
- 올바른 IAM 권한을 가진 IAM 주체(역할 및 사용자)는 생성된 리소스 그룹을 사용할 수 있습니다.
- 태그는 리소스의 속성이므로 계정 전체에서 공유됩니다.
- 부서 또는 전문 그룹의 사용자는 공통 태그를 사용하여 역할 및 책임에 맞는 리소스 그룹을 생성할 수 있습니다.
- 공통 태그 풀을 사용하면 리소스 그룹을 공유할 때 태그 정보 누락이나 충돌 걱정을 하지 않아도 됩니다.



## 6 AWS Resource Groups 리소스

- Resource Groups에서 사용 가능한 유일한 리소스는 그룹입니다.
- 그룹에는 고유한 Amazon Resource Names(ARNs)가 있습니다.
- ARN에 대한 자세한 내용은 [Amazon Resource Names (ARN) 및 AWS 서비스 네임스페이스](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html)를 참조하십시오.

|리소스 유형|ARN 형식|
|---|---|
|Resource Group|arn:aws:resource-groups:region:account/group-name|



## 7 태그 작동 방식

- 태그는 키-값 쌍으로 AWS 리소스를 구성하는 메타데이터 역할을 합니다.
- 대부분의 AWS 리소스에서는 리소스를 생성할 때 태그를 추가할 수 있습니다.
- 태그 편집기를 사용하여 여러 지원 리소스에 태그를 한 번에 추가, 제거 또는 교체할 수 있습니다.
- 태그 기반 쿼리는 태그에 AND 연산자를 할당하여, 지정된 모든 태그를 만족하는 리소스를 반환합니다.

**중요**: 개인 식별 정보(PII) 또는 기타 기밀 또는 민감한 정보를 태그에 저장하지 마십시오. 태그는 청구 및 관리 서비스를 제공하는 데 사용되며, 민감한 데이터를 저장하기 위한 것이 아닙니다.



**참고 자료**

- [AWS Resource Groups 공식 문서](https://docs.aws.amazon.com/ARG/latest/userguide/what-is-resource-groups.html)
- [AWS Resource Groups API Reference](https://docs.aws.amazon.com/ARG/latest/APIReference/Welcome.html)
- [Tag Editor User Guide](https://docs.aws.amazon.com/ARG/latest/userguide/tag-editor.html)