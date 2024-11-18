## 1 Kinesis Data Firehose

- Amazon Kinesis Data Firehose는 데이터를 스트리밍하여 다양한 AWS 서비스로 실시간으로 로드하고 변환할 수 있는 완전 관리형 서비스입니다.



## 2 주요 기능

### 2.1 근실시간 데이터 로드

- Kinesis Data Firehose는 수집된 데이터를 실시간으로 Amazon S3, Amazon Redshift, Amazon Elasticsearch Service, Splunk 등으로 로드할 수 있습니다.



### 2.2 데이터 변환

- 스트림 데이터를 대상으로 전달하기 전에 변환할 수 있습니다.
- AWS Lambda를 사용하여 데이터를 실시간으로 변환할 수 있습니다.
- 예를 들어, 데이터 포맷 변환, 데이터 필터링, 사용자 정의 변환 등을 수행할 수 있습니다.



### 2.3 데이터 배치 처리 및 압축

- 데이터를 특정 시간 간격 또는 특정 크기 단위로 배치 처리할 수 있습니다.
- 이를 통해 데이터 전송 효율성을 높이고 비용을 절감할 수 있습니다.
- 버퍼 인터벌은 0초(버퍼링 없음)에서 900초까지 설정할 수 있으며, 버퍼 크기는 최소 1MB입니다.
- 지원되는 압축 형식에는 Gzip, Zip, Snappy, Hadoop-compatible Snappy 등이 있습니다.
- 이러한 버퍼링과 배치 처리로 인해 Kinesis Data Firehose는 실시간성이 아닌 근실시간성을 가지게 됩니다.



### 2.4 자동 스케일링

- Kinesis Data Firehose는 자동으로 스케일링하여 데이터 수집 및 처리량에 맞춰 확장됩니다.
- 사용자는 인프라를 관리할 필요 없이 서비스의 확장성을 활용할 수 있습니다.



### 2.5 데이터 암호화

- 전송 중 데이터는 HTTPS 엔드포인트를 사용하여 암호화됩니다.
- 저장된 데이터는 KMS를 사용하여 암호화할 수 있습니다.
- 데이터가 안전하게 전송되고 저장되도록 보장합니다.



## 3 사용 사례

### 3.1 로그 및 이벤트 데이터 분석

- Kinesis Data Firehose를 사용하여 애플리케이션 로그, 시스템 로그, 사용자 활동 로그 등을 실시간으로 수집하고 분석할 수 있습니다.
- Amazon S3에 저장된 데이터를 Amazon Redshift 또는 Amazon Elasticsearch Service로 로드하여 분석할 수 있습니다.



### 3.2 실시간 데이터 분석

- 실시간 스트리밍 데이터를 변환하고 분석할 수 있습니다.
- AWS Lambda를 사용하여 데이터를 변환한 후 Amazon Redshift로 로드하여 실시간으로 분석할 수 있습니다.



### 3.3 보안 및 모니터링

- Kinesis Data Firehose는 CloudWatch Logs와 통합되어 데이터 흐름을 모니터링하고 문제를 감지할 수 있습니다.
- CloudTrail을 사용하여 API 호출을 추적하고, 데이터 보안 및 컴플라이언스를 유지할 수 있습니다.



## 4 요금

- Kinesis Data Firehose는 사용한 데이터 전송량에 따라 요금이 부과됩니다.
- 전송된 데이터 양, 데이터 변환에 사용된 Lambda 함수 실행 시간, 대상에 저장된 데이터 크기 등을 기반으로 요금이 책정됩니다.



## 5 설정 및 사용법

### 5.1 데이터 스트림 생성

- AWS Management Console, AWS CLI, AWS SDK를 사용하여 Kinesis Data Firehose 전송 스트림을 생성할 수 있습니다.
- 스트림의 소스, 대상, 버퍼 크기 및 시간 간격, 데이터 변환 옵션 등을 설정할 수 있습니다.



### 5.2 데이터 전송 및 변환

- Kinesis Data Firehose 전송 스트림으로 데이터를 전송할 수 있습니다.
- AWS Lambda를 사용하여 데이터를 변환하고, 설정된 대상에 데이터를 로드할 수 있습니다.



## 6 소스와 데스티네이션

### 6.1 소스

- Kinesis Data Firehose는 다양한 데이터 소스로부터 데이터를 수집할 수 있습니다.
- **Kinesis Data Streams**: Kinesis Data Streams로부터 데이터를 받아 처리할 수 있습니다.
- **Direct Put**: 애플리케이션이 직접 Kinesis Data Firehose로 데이터를 전송할 수 있습니다.



### 6.2 데스티네이션

- 데이터를 Amazon S3, Amazon Redshift, Amazon Elasticsearch Service, Splunk 등 다양한 대상에 로드할 수 있습니다.
- 또한, 사용자 정의 HTTP 엔드포인트나 타사 서비스로도 데이터를 전달할 수 있습니다.



## 7 Kinesis Data Streams와 비교

### 7.1 스트리밍 서비스

- Kinesis Data Streams는 대규모 데이터 인제스트를 위한 스트리밍 서비스입니다.
- Kinesis Data Firehose는 데이터를 다양한 대상에 실시간으로 로드하고 변환하는 완전 관리형 서비스입니다.



### 7.2 커스텀 코드 작성 vs 완전 관리형

- Kinesis Data Streams는 사용자 정의 코드를 작성하여 프로듀서와 컨슈머를 구현할 수 있습니다.
- Kinesis Data Firehose는 완전 관리형으로 인프라 관리를 자동화합니다.



### 7.3 실시간 vs 근실시간

- Kinesis Data Streams는 실시간(~200ms)의 데이터 처리를 지원합니다.
- Kinesis Data Firehose는 거의 실시간으로 데이터를 전달합니다.



### 7.4 스케일링 관리

- Kinesis Data Streams는 사용자가 직접 샤드 분할 및 병합을 통해 스케일링을 관리해야 합니다.
- Kinesis Data Firehose는 자동으로 스케일링됩니다.



### 7.5 데이터 저장 및 재생

- Kinesis Data Streams는 데이터를 1일부터 최대 365일까지 저장하고 재생할 수 있습니다.
- Kinesis Data Firehose는 데이터 저장을 지원하지 않으며, 재생 기능도 제공하지 않습니다.



**참고 자료**

- [AWS Kinesis Data Firehose 공식 문서](https://aws.amazon.com/kinesis/data-firehose/)
- [Kinesis Data Firehose 설정 가이드](https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html)
- [Kinesis Data Firehose 요금 안내](https://aws.amazon.com/kinesis/data-firehose/pricing/)
- [AWS Kinesis Data Streams 공식 문서](https://aws.amazon.com/kinesis/data-streams/)