## 1 VPC Flow Logs

- VPC Flow Logs는 인터페이스로 들어오는 IP 트래픽 정보를 캡처합니다.
- 이를 통해 네트워크 연결 문제를 모니터링하고 해결할 수 있습니다.



## 2 주요 특징
### 2.1 다양한 레벨의 로그 캡처

- VPC Flow Logs는 VPC, 서브넷, Elastic Network Interface(ENI) 레벨에서 트래픽 로그를 캡처할 수 있습니다.
- AWS 관리 인터페이스(ELB, RDS, ElastiCache, Redshift, WorkSpaces, NATGW, Transit Gateway 등)에서도 네트워크 정보를 캡처합니다.



### 2.2 로그 저장소

- 캡처된 플로우 로그 데이터는 S3, CloudWatch Logs, Kinesis Data Firehose로 전송할 수 있습니다.
- 이를 통해 다양한 분석 및 모니터링 도구와 통합하여 사용할 수 있습니다.



### 2.3 네트워크 문제 해결

- 플로우 로그는 보안 그룹 또는 네트워크 ACL(NACL)로 인해 발생한 요청 성공 또는 실패 정보를 제공합니다.
- srcaddr와 dstaddr 필드는 문제를 일으키는 IP를 식별하는 데 도움을 줍니다.
- srcport와 dstport 필드는 문제를 일으키는 포트를 식별하는 데 도움을 줍니다.



## 3 로그 필드

- **account-id**: AWS 계정 ID
- **srcaddr**: 소스 IP 주소
- **dstaddr**: 목적지 IP 주소
- **srcport**: 소스 포트
- **dstport**: 목적지 포트
- **protocol**: 프로토콜
- **packets**: 패킷 수
- **bytes**: 바이트 수
- **start**: 시작 시간
- **end**: 종료 시간
- **action**: 요청 성공 또는 실패 정보 (Security Group / NACL에 의해 결정됨)
- **log-status**: 로그 상태



## 4 사용 사례
### 4.1 분석 및 모니터링

- VPC Flow Logs는 네트워크 사용 패턴 및 악의적인 행위를 분석하는 데 사용할 수 있습니다.
- S3에 저장된 플로우 로그는 Athena를 사용하여 쿼리할 수 있으며, CloudWatch Logs Insights를 통해 실시간 분석이 가능합니다.



### 4.2 문제 해결

- 네트워크 연결 문제 발생 시, 플로우 로그를 통해 문제의 원인을 신속하게 파악할 수 있습니다.
- Inbound 또는 Outbound 요청이 REJECT되는 경우, 해당 로그를 확인하여 NACL 또는 보안 그룹 설정을 점검할 수 있습니다.



## 5 VPC Flow Logs 아키텍처 예시

- VPC Flow Logs는 다양한 방식으로 아키텍처를 구성할 수 있습니다.
- 다음은 몇 가지 일반적인 아키텍처 예시입니다.



### 5.1 CloudWatch Logs와 통합

- VPC Flow Logs 데이터를 CloudWatch Logs로 전송합니다.
- CloudWatch Contributor Insights를 사용하여 주요 IP 주소를 분석할 수 있습니다.
- 이를 통해 네트워크 트래픽을 모니터링하고, 상위 10개 IP 주소를 확인할 수 있습니다.



### 5.2 CloudWatch Alarm과 SNS 연동

- 특정 트래픽 유형(예: SSH, RDP)에 대한 메트릭 필터를 설정합니다.
- CloudWatch Alarm을 통해 이상 트래픽에 대한 경고를 설정할 수 있습니다.
- 경고 발생 시, Amazon SNS를 통해 알림을 받을 수 있습니다.



### 5.3 S3와 Athena를 통한 분석

- VPC Flow Logs 데이터를 S3 버킷에 저장합니다.
- Amazon Athena를 사용하여 저장된 플로우 로그 데이터를 쿼리합니다.
- 이를 통해 네트워크 트래픽 패턴을 분석하고, 문제를 파악할 수 있습니다.
- Amazon QuickSight를 사용하여 쿼리 결과를 시각화할 수 있습니다.



## 6 VPC Flow Logs 필터 설정

- VPC Flow Logs를 생성할 때 필터 설정을 통해 캡처할 트래픽 유형을 지정할 수 있습니다.
- 필터 설정은 로그 생성 시 지정해야 하며, 생성 후에는 변경할 수 없습니다.



### 6.1 필터 옵션

- VPC Flow Logs는 다음 세 가지 필터 옵션을 제공합니다:
  - **모든 트래픽 캡처**: 모든 네트워크 트래픽을 로깅합니다.
  - **수락된 트래픽만 캡처**: 보안 그룹이나 네트워크 ACL에 의해 허용된 트래픽만 로깅합니다.
  - **거부된 트래픽만 캡처**: 보안 그룹이나 네트워크 ACL에 의해 거부된 트래픽만 로깅합니다.



### 6.2 필터 설정 변경

- 기존 Flow Log의 필터 설정은 변경할 수 없습니다.
- 필터 설정을 변경하려면 새로운 Flow Log를 생성해야 합니다.
- 새 Flow Log 생성 시 원하는 필터 설정을 선택할 수 있습니다.



### 6.3 모든 트래픽 로깅

- 네트워크 문제 해결을 위해서는 모든 트래픽을 로깅하는 것이 중요합니다.
- 거부된 트래픽이 로그에 나타나지 않는 경우, 현재 Flow Log가 '수락된 트래픽만 캡처' 옵션으로 설정되어 있을 가능성이 높습니다.
- 이 경우, '모든 트래픽 캡처' 옵션으로 새로운 Flow Log를 생성해야 합니다.



## 7 문제 해결 예시

- 거부된 트래픽이 로그에 나타나지 않는 문제를 해결하는 단계:
  1. AWS Management Console에서 VPC 서비스로 이동합니다.
  2. 해당 VPC 또는 서브넷을 선택합니다.
  3. 'Flow Logs' 탭에서 '생성' 버튼을 클릭합니다.
  4. 필터 설정에서 '모든 트래픽 캡처'를 선택합니다.
  5. 로그 대상(S3, CloudWatch Logs, Kinesis Data Firehose)을 선택합니다.
  6. 필요한 IAM 역할을 설정합니다.
  7. Flow Log를 생성합니다.
- 이렇게 새로운 Flow Log를 생성하면 거부된 트래픽을 포함한 모든 트래픽이 로깅됩니다.