## 1 Kinesis Data Streams

- Amazon Kinesis Data Streams는 대규모 데이터를 실시간으로 수집하고 처리하는 AWS 서비스입니다.



## 2 주요 기능

### 2.1 데이터 보유 기간

- Amazon Kinesis Data Streams의 기본 데이터 보유 기간은 24시간입니다. 
- 이는 Kinesis 스트림에 기록된 데이터 레코드가 24시간 동안 유지됨을 의미합니다. 
- 필요에 따라 보유 기간을 최대 1년(365일)로 확장할 수 있습니다.
- 이 기간 내에 데이터를 다시 처리하거나 재생할 수 있는 기능을 제공합니다.



### 2.2 데이터 재처리 및 불변성

- Kinesis에 삽입된 데이터는 삭제할 수 없으며, 불변성을 유지합니다.
- 이는 데이터의 무결성과 일관성을 보장합니다.
- 동일한 파티션을 공유하는 데이터는 동일한 샤드로 전송되어 데이터 순서를 보장합니다.



### 2.3 데이터 생성자

- 데이터를 생성하는 방법은 여러 가지가 있습니다:
    - **AWS SDK**: AWS SDK를 사용하여 Kinesis에 데이터를 보낼 수 있습니다.
    - **Kinesis Producer Library (KPL)**: 고성능, 비동기 데이터 전송을 지원하는 라이브러리입니다.
    - **Kinesis Agent**: 로그 파일과 같은 데이터를 수집하여 Kinesis Data Streams로 전송하는 에이전트입니다.



### 2.4 데이터 소비자

- 데이터를 소비하는 방법도 두 가지가 있습니다:
    - **직접 작성**: Kinesis Client Library (KCL)와 AWS SDK를 사용하여 직접 데이터 소비 애플리케이션을 작성할 수 있습니다.
    - **관리형 서비스**: AWS Lambda, Kinesis Data Firehose, Kinesis Data Analytics와 같은 관리형 서비스를 사용하여 데이터를 처리할 수 있습니다.



## 3 용량 모드

### 3.1 Provisioned 모드

- 프로비저닝 모드에서는 사용자가 샤드 수를 직접 선택하고 관리합니다.
- 각 샤드는 초당 1MB의 입력(또는 초당 1000개의 레코드)과 초당 2MB의 출력을 처리할 수 있습니다.
- 샤드 수에 따라 시간당 요금이 부과됩니다.



### 3.2 On-demand 모드

- On-demand 모드에서는 용량을 프로비저닝하거나 관리할 필요가 없습니다.
- 기본 용량은 초당 4MB의 입력 또는 초당 4000개의 레코드입니다.
- 지난 30일 동안 관찰된 처리량 피크에 따라 자동으로 확장됩니다.
- 시간당 스트림당 요금과 데이터 입출력량에 따라 요금이 부과됩니다.



## 4 보안

### 4.1 접근 제어 및 권한 부여

- IAM 정책을 사용하여 접근 제어 및 권한 부여를 관리할 수 있습니다.



### 4.2 데이터 암호화

- 전송 중 데이터는 HTTPS 엔드포인트를 사용하여 암호화됩니다.
- 저장된 데이터는 KMS를 사용하여 암호화됩니다.
- 클라이언트 측에서 데이터 암호화/복호화를 구현할 수도 있지만, 이는 더 어렵습니다.



### 4.3 VPC 엔드포인트

- VPC 내에서 Kinesis에 접근하기 위해 VPC 엔드포인트를 사용할 수 있습니다.
- [[VPC-Endpoints]] 참고



### 4.4 API 호출 모니터링

- CloudTrail을 사용하여 API 호출을 모니터링할 수 있습니다.



## 5 Kinesis Data Firehose 비교

### 5.1 스트리밍 서비스

- Kinesis Data Streams는 대규모 데이터 인제스트를 위한 스트리밍 서비스입니다.
- Kinesis Data Firehose는 데이터를 다양한 대상에 실시간으로 로드하고 변환하는 완전 관리형 서비스입니다.



### 5.2 커스텀 코드 작성 vs 완전 관리형

- Kinesis Data Streams는 사용자 정의 코드를 작성하여 프로듀서와 컨슈머를 구현할 수 있습니다.
- Kinesis Data Firehose는 완전 관리형으로 인프라 관리를 자동화합니다.



### 5.3 실시간 vs 근실시간

- Kinesis Data Streams는 실시간(~200ms)의 데이터 처리를 지원합니다.
- Kinesis Data Firehose는 거의 실시간으로 데이터를 전달합니다.



### 5.4 스케일링 관리

- Kinesis Data Streams는 사용자가 직접 샤드 분할 및 병합을 통해 스케일링을 관리해야 합니다.
- Kinesis Data Firehose는 자동으로 스케일링됩니다.



### 5.5 데이터 저장 및 재생

- Kinesis Data Streams는 데이터를 1일부터 최대 365일까지 저장하고 재생할 수 있습니다.
- Kinesis Data Firehose는 데이터 저장을 지원하지 않으며, 재생 기능도 제공하지 않습니다.



## 6 데이터 순서

### 6.1 데이터 순서 보장

- Kinesis Data Streams는 데이터 순서를 보장하기 위해 파티션 키를 사용합니다.
- 동일한 파티션 키를 가진 데이터는 동일한 샤드로 전송됩니다.
- 이를 통해 동일한 파티션 키를 가진 데이터는 샤드 내에서 순서를 유지합니다.



### 6.2 예시: 트럭의 GPS 데이터

- 예를 들어, 100대의 트럭(truck_1, truck_2, ... truck_100)이 정기적으로 GPS 위치 데이터를 AWS로 전송한다고 가정합니다.
- 각 트럭의 이동을 정확하게 추적하려면 데이터를 순서대로 소비해야 합니다.
- 이를 위해 데이터를 "truck_id"라는 파티션 키 값으로 Kinesis에 전송합니다.
- 동일한 파티션 키를 가진 데이터는 항상 동일한 샤드로 전송됩니다.
- 평균적으로 하나의 샤드에는 20대의 트럭 데이터가 저장됩니다.
- 각 트럭의 데이터는 해당 샤드 내에서 순서를 유지합니다.



**참고 자료**

- [AWS Kinesis Data Streams 공식 문서](https://aws.amazon.com/kinesis/data-streams/)
- [Kinesis Data Streams 용량 모드](https://aws.amazon.com/kinesis/data-streams/pricing/)
- [Kinesis Data Streams 보안 가이드](https://aws.amazon.com/kinesis/data-streams/security/)