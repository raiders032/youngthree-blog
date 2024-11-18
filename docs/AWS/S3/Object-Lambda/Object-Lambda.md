## 1 Amazon S3 Object Lambda

- Amazon S3 Object Lambda는 S3 객체에 대한 GET, LIST, HEAD 요청을 처리하는 동안 사용자 지정 코드를 실행할 수 있는 기능입니다.
- 이를 통해 데이터를 수정하거나 필터링할 수 있으며, 기존 애플리케이션 코드를 변경하지 않고도 S3 데이터를 동적으로 처리할 수 있습니다.



## 2 주요 기능

### 2.1 사용자 지정 코드 실행

- S3 Object Lambda는 AWS Lambda 함수를 사용하여 S3 객체 요청 시 사용자 지정 코드를 실행할 수 있습니다.
- GET 요청을 수정하여 데이터를 필터링하거나 변환할 수 있습니다.
- 호출 애플리케이션이 객체를 검색하기 전에 AWS Lambda 함수를 사용해 객체를 변경할 수 있습니다.



### 2.2 S3 Object Lambda 액세스 포인트

- Lambda 함수를 구성하고 S3 Object Lambda Access Point에 연결할 수 있습니다.
- 그 이후부터는 S3가 자동으로 S3 Object Lambda Access Point를 통해 검색된 모든 데이터를 처리하기 위해 Lambda 함수를 호출하고, 변환된 결과를 애플리케이션에 반환합니다.
- S3 LIST 요청의 결과를 커스터마이징할 수 있으며, S3 HEAD 요청으로 반환되는 메타데이터를 수정할 수 있습니다.



## 3 사용 사례

### 3.1 민감한 정보 필터링

- 분석 또는 비생산 환경에서 개인 식별 정보를 수정하여 반환할 수 있습니다.
- 이를 통해 민감한 데이터가 노출되지 않도록 할 수 있습니다.



### 3.2 데이터 형식 변환

- XML을 JSON으로 변환하는 등의 데이터 형식 변환을 수행할 수 있습니다.
- 다양한 클라이언트 애플리케이션에서 데이터를 더 쉽게 처리할 수 있습니다.



### 3.3 이미지 변환 및 워터마킹

- 이미지를 요청한 사용자의 세부 정보를 기반으로 이미지 크기를 조정하고 워터마크를 추가할 수 있습니다.
- 이미지 파일을 S3 버킷에 저장하고, 사용자가 이미지를 요청할 때 S3 Object Lambda를 사용하여 동적으로 크기를 조정하거나 변환할 수 있습니다.



## 4 설정 방법

### 4.1 Lambda 함수 생성

- S3 Object Lambda를 사용하려면 먼저 AWS Lambda 콘솔에서 Lambda 함수를 생성해야 합니다.
- 이 함수는 S3 객체 요청을 처리할 코드를 포함합니다.



### 4.2 S3 Object Lambda 액세스 포인트 생성

- S3 콘솔에서 Object Lambda Access Point를 생성하여 기존 S3 버킷과 통합합니다.
- 이 액세스 포인트를 통해 S3 객체 요청이 Lambda 함수로 전달됩니다.



### 4.3 정책 설정

- Lambda 함수와 S3 버킷 간의 액세스를 제어하기 위해 필요한 IAM 정책을 설정합니다.
- 이 정책은 Lambda 함수가 S3 객체에 접근할 수 있도록 허용합니다.



**참고 자료**

- [Amazon S3 Object Lambda 설명서](https://docs.aws.amazon.com/AmazonS3/latest/userguide/transforming-objects.html)
- [AWS Lambda 설명서](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)