## 1 CloudWatch Logs

- CloudWatch Logs를 사용하면 애플리케이션 및 시스템 로그를 중앙에서 수집하고 관리할 수 있습니다.



### 1.1 로그 그룹

- 로그 그룹은 CloudWatch Logs에서 로그 데이터를 논리적으로 그룹화하는 컨테이너입니다.
- 각 로그 그룹은 일반적으로 애플리케이션, 시스템 또는 서비스의 이름을 따서 명명됩니다.
- 로그 그룹을 사용하면 여러 로그 스트림을 하나의 그룹으로 관리할 수 있습니다.
- 로그 그룹에는 로그 보존 기간을 설정할 수 있으며, 이 기간이 지나면 로그 데이터가 자동으로 삭제됩니다.
- 예를 들어, 로그 그룹 "MyApplicationLogs"에는 애플리케이션의 다양한 로그 스트림이 포함될 수 있습니다.



### 1.2 로그 스트림

- 로그 스트림은 개별 로그 항목의 순차적 스트림을 나타내며, 로그 그룹 내에 존재합니다.
- 로그 스트림은 애플리케이션 인스턴스, 로그 파일, 컨테이너 등을 기준으로 생성될 수 있습니다.
- 각 로그 스트림은 고유한 식별자를 가지며, 로그 데이터는 타임스탬프와 함께 순차적으로 추가됩니다.
- 예를 들어, 로그 그룹 "MyApplicationLogs" 내에 "Instance1"과 "Instance2"라는 로그 스트림이 있을 수 있습니다.



### 1.3 로그 암호화

- CloudWatch Logs는 기본적으로 로그 데이터를 암호화하여 저장합니다.
- KMS(Key Management Service) 기반 암호화를 설정하여 사용자 관리형 키를 사용할 수 있습니다.
- 이를 통해 로그 데이터의 보안을 강화하고 규정 준수를 충족할 수 있습니다.



### 1.4 로그 만료 정책

- 로그 그룹마다 로그 데이터의 보존 기간을 설정할 수 있습니다.
- 보존 기간은 로그 데이터가 CloudWatch Logs에 저장되는 기간을 의미합니다.
- 설정된 보존 기간이 지나면 로그 데이터는 자동으로 삭제됩니다.
- 예를 들어, 보존 기간을 30일로 설정하면 30일이 지난 로그 데이터는 자동으로 삭제됩니다.



## 2 로그 데이터 전송 대상

- CloudWatch Logs는 로그 데이터를 다음과 같은 다양한 대상으로 전송할 수 있습니다.
- **Amazon S3**: 장기 보관 및 분석을 위해 로그 데이터를 Amazon S3로 내보낼 수 있습니다.
- **Kinesis Data Streams**: 실시간 로그 데이터를 스트리밍하여 실시간 분석과 처리에 사용할 수 있습니다.
- **Kinesis Data Firehose**: 실시간 로그 데이터를 다양한 대상(Amazon S3, Amazon Redshift, Amazon OpenSearch Service 등)으로 전송할 수 있습니다.
- **AWS Lambda**: 로그 이벤트가 발생할 때 Lambda 함수를 호출하여 실시간 처리를 수행할 수 있습니다.
- **OpenSearch**: 로그 데이터를 OpenSearch로 전송하여 강력한 검색 및 분석 기능을 활용할 수 있습니다.



  # 3 로그 데이터 소스

- CloudWatch Logs의 주요 로그 데이터 소스는 다음과 같습니다.
- **SDK**: AWS SDK를 사용하여 애플리케이션에서 직접 로그를 CloudWatch Logs로 전송할 수 있습니다.
- **CloudWatch Logs Agent**: EC2 인스턴스 또는 온프레미스 서버에서 실행되며, 로그 파일을 CloudWatch Logs로 전송합니다.
- **CloudWatch Unified Agent**: CloudWatch Logs Agent의 업그레이드 버전으로, 추가적인 시스템 레벨 메트릭과 로그를 수집할 수 있습니다.
- **Elastic Beanstalk**: Elastic Beanstalk 애플리케이션의 로그를 자동으로 수집하여 CloudWatch Logs로 전송합니다.
- **ECS**: 컨테이너 로그를 수집하여 CloudWatch Logs로 전송합니다.
- **AWS Lambda**: Lambda 함수의 실행 로그를 자동으로 CloudWatch Logs에 저장합니다.
- **VPC Flow Logs**: VPC의 네트워크 트래픽 로그를 CloudWatch Logs로 전송하여 네트워크 모니터링과 보안 분석에 활용할 수 있습니다.
- **API Gateway**: API Gateway에서 발생하는 요청 및 응답 로그를 CloudWatch Logs로 전송합니다.
- **CloudTrail**: CloudTrail 로그를 필터링하여 CloudWatch Logs로 전송하여 AWS 계정의 활동을 모니터링할 수 있습니다.
- **Route53**: DNS 쿼리 로그를 수집하여 CloudWatch Logs로 전송합니다.



## 4 CloudWatch Logs Insights

- CloudWatch Logs Insights를 사용하면 CloudWatch Logs에 저장된 로그 데이터를 검색하고 분석할 수 있습니다.
- 예를 들어, 로그에서 특정 IP를 찾거나 "ERROR" 문자열의 발생 횟수를 셀 수 있습니다.
- Logs Insights는 목적에 맞게 설계된 쿼리 언어를 제공합니다.
- AWS 서비스 및 JSON 로그 이벤트에서 필드를 자동으로 발견합니다.
- 원하는 이벤트 필드를 가져오고, 조건에 따라 필터링하며, 집계 통계를 계산하고, 이벤트를 정렬하고, 이벤트 수를 제한할 수 있습니다.
- 쿼리를 저장하고 CloudWatch 대시보드에 추가할 수 있습니다.
- 여러 AWS 계정의 다양한 로그 그룹을 쿼리할 수 있습니다.
- Logs Insights는 실시간 엔진이 아닌 쿼리 엔진입니다.



## 5 CloudWatch Logs – S3 Export

![[Pasted image 20240703141436.png]]

- CloudWatch Logs 데이터를 Amazon S3로 내보낼 수 있습니다.
- 로그 데이터가 내보내기 가능해지기까지 최대 12시간이 걸릴 수 있습니다.
- 로그 내보내기 작업을 시작하려면 `CreateExportTask` API 호출을 사용합니다.
- S3로의 로그 내보내기는 실시간 또는 거의 실시간이 아니므로, 실시간 로그 처리가 필요한 경우에는 로그 구독(Log Subscriptions)을 사용하는 것이 더 적합합니다.



## 6 CloudWatch Logs Subscriptions

![[Pasted image 20240808103956.png]]

- CloudWatch Logs 구독을 사용하면 실시간으로 로그 이벤트를 처리하고 분석할 수 있습니다.
- 실시간 로그 이벤트를 Kinesis Data Streams, Kinesis Data Firehose, 또는 AWS Lambda로 전송할 수 있습니다.
- 구독 필터(Subscription Filter)를 사용하여 특정 조건에 맞는 로그 이벤트만 선택적으로 대상에 전달할 수 있습니다.
- 크로스-계정 구독을 통해 로그 이벤트를 다른 AWS 계정의 리소스(Kinesis Data Streams, Kinesis Data Firehose)로 전송할 수 있습니다.



## 7 CloudWatch Logs for EC2

- 기본적으로, EC2 인스턴스에서 생성된 로그는 자동으로 CloudWatch로 전송되지 않습니다.
- 원하는 로그 파일을 CloudWatch로 전송하려면 EC2 인스턴스에 CloudWatch 에이전트를 실행해야 합니다.
- 에이전트를 설정할 때 올바른 IAM 권한이 있는지 확인해야 합니다.
- CloudWatch 로그 에이전트는 온프레미스 서버에서도 설정할 수 있습니다.



### 7.1 CloudWatch Logs Agent 및 Unified Agent

- **CloudWatch Logs Agent**와 **CloudWatch Unified Agent**는 가상 서버(EC2 인스턴스 및 온프레미스 서버)에서 로그를 수집하고 전송하는 데 사용됩니다.
- 이 에이전트들을 사용하면 로그 데이터를 중앙에서 관리하고, 실시간으로 모니터링하며, 분석할 수 있습니다.



#### 7.1.1 CloudWatch Logs Agent

- **CloudWatch Logs Agent**는 Amazon EC2 인스턴스 및 온프레미스 서버에서 로그 파일을 수집하여 Amazon CloudWatch Logs로 전송하는 에이전트입니다.
- 에이전트의 구 버전으로, CloudWatch Logs로만 로그를 전송할 수 있습니다.
- 주로 애플리케이션 및 시스템 로그 파일을 모니터링하고 수집하는 데 사용됩니다.
- CloudWatch Logs Agent는 다음과 같은 기능을 제공합니다:
	- **로그 파일 모니터링**: 지정된 로그 파일을 지속적으로 모니터링하여 새로운 로그 항목을 실시간으로 수집합니다.
	- **필터링 및 패턴 매칭**: 특정 로그 항목을 필터링하거나 패턴 매칭을 통해 선택적으로 전송할 수 있습니다.
	- **다양한 로그 파일 형식 지원**: 일반 텍스트 로그, JSON 로그 등 다양한 형식의 로그 파일을 지원합니다.



#### 7.1.2 CloudWatch Unified Agent

- **CloudWatch Unified Agent**는 CloudWatch Logs Agent의 업그레이드 버전으로, 추가적인 시스템 레벨 메트릭과 로그를 수집할 수 있는 에이전트입니다.
- 로그와 시스템 메트릭을 통합하여 수집할 수 있어 더 강력한 모니터링 기능을 제공합니다.
- SSM Parameter Store를 사용하여 중앙에서 구성할 수 있습니다.
- CloudWatch Unified Agent는 다음과 같은 기능을 제공합니다
	- **로그 수집 및 전송**: CloudWatch Logs로 로그 데이터를 실시간으로 전송할 수 있습니다.
	- **다양한 로그 형식 지원**: 텍스트 로그, JSON 로그, Apache 및 Nginx 액세스 로그 등 다양한 로그 형식을 지원합니다.
	- **중앙 집중식 관리**: SSM Parameter Store를 사용하여 여러 인스턴스의 에이전트 구성을 중앙에서 관리할 수 있습니다.
- 시스템 레벨 메트릭
	- CPU 사용률, 메모리 사용량, 디스크 I/O, 네트워크 트래픽 등 다양한 시스템 메트릭을 수집할 수 있습니다.
	- **CPU**: active, guest, idle, system, user, steal
	- **디스크 메트릭**: free, used, total, Disk IO (writes, reads, bytes, iops)
	- **RAM**: free, inactive, used, total, cached
	- **Netstat**: TCP 및 UDP 연결 수, 네트워크 패킷, 바이트
	- **프로세스**: total, dead, blocked, idle, running, sleep
	- **스왑 공간**: free, used, used %



## 8 CloudWatch Logs Metric Filter

- CloudWatch Logs Metric Filter를 사용하면 로그 데이터를 기반으로 메트릭을 생성할 수 있습니다.
- 이를 통해 로그 이벤트에서 중요한 정보를 추출하고, 해당 정보를 메트릭으로 변환하여 모니터링할 수 있습니다.



### 8.1 주요 기능

- 로그 분석 및 필터링: 특정 패턴을 로그 데이터에서 검색하고, 해당 패턴이 발견될 때마다 메트릭을 생성합니다.
- 메트릭 생성: 로그 데이터에서 발생하는 특정 이벤트나 오류를 메트릭으로 변환하여 CloudWatch에서 모니터링할 수 있습니다.
- 알람 설정: 생성된 메트릭을 기반으로 CloudWatch 알람을 설정하여, 특정 조건이 발생할 때 알림을 받을 수 있습니다.



### 8.2 사용 방법

1. 로그 그룹 선택
    - CloudWatch Logs 콘솔에서 로그 그룹을 선택합니다.
2. 필터 및 메트릭 생성
    - "Create Metric Filter"를 선택하여 필터 패턴을 정의합니다.
3. 필터 패턴 정의
    - 로그 이벤트에서 검색할 패턴을 정의합니다. 예를 들어, 특정 오류 메시지를 검색할 수 있습니다.
4. 메트릭 이름 및 값 설정
    - 필터 패턴이 일치할 때 생성할 메트릭의 이름과 값을 설정합니다.
5. 메트릭 필터 저장
    - 필터를 저장하여 메트릭을 생성합니다.



### 8.3 예시

- 특정 오류 코드(예: 404)를 로그에서 검색하여 해당 이벤트가 발생할 때마다 메트릭을 증가시키는 필터를 생성할 수 있습니다.

```plaintext
Filter Pattern: [ip, id, user, timestamp, request, status_code=404, size]
Metric Name: 404Errors
Metric Value: 1
```



### 8.4 장점

- 실시간 모니터링: 로그 데이터를 실시간으로 분석하여 중요한 이벤트를 신속하게 감지할 수 있습니다.
- 자동화된 알림: 중요한 이벤트가 발생할 때 자동으로 알림을 받을 수 있어 빠르게 대응할 수 있습니다.
- 향상된 가시성: 로그 데이터를 메트릭으로 변환하여 시각적으로 모니터링할 수 있습니다.



### 8.5 주의 사항

- 필터는 데이터를 소급해서 필터링하지 않습니다. 
- 필터는 생성된 후 발생하는 이벤트에 대해서만 메트릭 데이터를 게시합니다.
- Metric Filter는 최대 3개의 차원을 지정할 수 있습니다.