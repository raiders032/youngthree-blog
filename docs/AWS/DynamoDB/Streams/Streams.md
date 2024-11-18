## 1 Amazon DynamoDB Streams 소개

- Amazon DynamoDB Streams는 DynamoDB 테이블의 데이터 수정 사항을 실시간으로 캡처하는 강력한 기능입니다.
- 이 기능은 테이블의 항목이 생성, 수정, 또는 삭제될 때마다 해당 변경 사항을 순서가 지정된 스트림으로 기록합니다.
- DynamoDB Streams를 통해 데이터 변경에 실시간으로 반응하고, 다양한 용도로 활용할 수 있습니다.



## 2 DynamoDB Streams의 주요 특징

- **순서가 보장된 스트림**: 테이블의 항목 수준 수정사항이 발생한 순서대로 기록됩니다.
- **데이터 보존**: 스트림 레코드는 최대 24시간 동안 보존됩니다.
- **다양한 처리 옵션**: 스트림 데이터는 AWS Lambda, Kinesis Client Library (KCL) 애플리케이션, 또는 Kinesis Data Streams로 전송하여 처리할 수 있습니다.
- **유연한 데이터 캡처**: 스트림에 기록될 정보를 선택적으로 구성할 수 있습니다.



## 3 스트림 레코드의 구성 옵션

- DynamoDB Streams를 구성할 때, 스트림에 기록될 정보를 다음 옵션 중에서 선택할 수 있습니다:
	- **KEYS_ONLY**: 수정된 항목의 키 속성만 기록됩니다.
	- **NEW_IMAGE**: 항목이 수정된 후의 전체 새로운 이미지가 기록됩니다.
	- **OLD_IMAGE**: 항목이 수정되기 전의 전체 이전 이미지가 기록됩니다.
	- **NEW_AND_OLD_IMAGES**: 항목의 새로운 이미지와 이전 이미지가 모두 기록됩니다.



## 4 DynamoDB Streams의 아키텍처

- DynamoDB Streams는 Kinesis Data Streams와 유사한 샤드 기반 구조를 사용합니다.
- 하지만 DynamoDB Streams의 경우, 사용자가 직접 샤드를 프로비저닝할 필요가 없습니다. AWS가 자동으로 관리합니다.
- 스트림을 활성화한 이후에 발생하는 변경 사항만 기록되며, 이전 데이터는 소급하여 기록되지 않습니다.



## 5 DynamoDB Streams와 AWS Lambda의 통합

- AWS Lambda 함수를 사용하여 DynamoDB Streams의 데이터를 효율적으로 처리할 수 있습니다.
- 이를 위해 Event Source Mapping을 정의하여 Lambda 함수가 DynamoDB Streams에서 데이터를 읽을 수 있도록 설정해야 합니다.
- Lambda 함수에는 DynamoDB Streams에서 데이터를 읽을 수 있는 적절한 권한이 필요합니다.
- Lambda 함수는 동기적으로 호출되어 스트림 데이터를 처리합니다.



## 6 DynamoDB Streams의 사용 사례

- **실시간 반응**: 새로운 사용자 등록 시 환영 이메일 전송 등 실시간 이벤트에 대응할 수 있습니다.
- **분석**: 데이터 변경 패턴을 실시간으로 분석하여 인사이트를 얻을 수 있습니다.
- **파생 테이블 생성**: 주 테이블의 변경 사항을 기반으로 다른 테이블을 자동으로 업데이트할 수 있습니다.
- **검색 인덱싱**: OpenSearch Service와 같은 검색 엔진의 인덱스를 실시간으로 업데이트할 수 있습니다.
- **크로스 리전 복제**: 여러 지역에 걸쳐 데이터를 일관성 있게 복제할 수 있습니다.



## 7 DynamoDB Streams 처리 레이어

- DynamoDB Streams의 데이터는 다양한 방식으로 처리될 수 있습니다:
- **KCL (Kinesis Client Library) 애플리케이션**: 스트림 데이터를 처리하는 커스텀 애플리케이션을 개발할 수 있습니다.
- **AWS Lambda**: 서버리스 방식으로 스트림 데이터를 처리할 수 있습니다.
- **Kinesis Data Streams**: DynamoDB Streams의 데이터를 Kinesis Data Streams로 전송하여 추가적인 처리나 분석을 수행할 수 있습니다.
- **Kinesis Data Firehose**: 스트림 데이터를 S3, Redshift 등의 다른 AWS 서비스로 전달할 수 있습니다.



## 8 결론

- Amazon DynamoDB Streams는 DynamoDB 테이블의 데이터 변경 사항을 실시간으로 추적하고 활용할 수 있는 강력한 기능입니다.
- 이를 통해 실시간 데이터 처리, 크로스 리전 복제, 데이터 동기화 등 다양한 사용 사례를 구현할 수 있습니다.
- AWS Lambda와의 원활한 통합을 통해 서버리스 아키텍처를 구축할 수 있으며, 다른 AWS 서비스와의 연계를 통해 복잡한 데이터 처리 파이프라인을 구성할 수 있습니다.
- DynamoDB Streams를 활용하면 데이터베이스의 변경 사항을 기반으로 한 실시간 애플리케이션 개발이 가능해져, 더욱 동적이고 반응적인 시스템을 구축할 수 있습니다.