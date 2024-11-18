## 1 AWS CloudFormation Custom Resources 소개

- CloudFormation Custom Resources는 AWS CloudFormation 스택을 사용할 때 기본 제공되지 않는 사용자 정의 작업을 수행할 수 있게 해주는 기능입니다.
- 예를 들어, 스택 생성/업데이트/삭제 시 특별한 정리 작업이나 외부 리소스와의 연동이 필요한 경우 사용합니다.
- AWS Lambda 함수나 Amazon SNS 토픽을 통해 원하는 작업을 자동화할 수 있습니다.

 

## 2 Custom Resources가 필요한 경우

- 다음과 같은 상황에서 Custom Resources를 활용할 수 있습니다:
	- CloudFormation에서 아직 지원하지 않는 AWS 신규 서비스를 사용해야 할 때
	- 사내 온프레미스 시스템과 연동이 필요할 때
	- 서드파티 API나 서비스와 통합해야 할 때
	- 스택 생성/삭제 시 특별한 정리 작업이 필요할 때
	- 복잡한 초기화나 설정 작업을 자동화하고 싶을 때



## 3 Custom Resource Provider 이해하기

- Custom Resource Provider는 CloudFormation의 사용자 정의 리소스 요청을 실제로 처리하는 실행자입니다.
- Provider는 크게 두 가지 유형이 있습니다:



### 3.1 Lambda Provider

- 가장 일반적으로 사용되는 Provider 유형입니다.
- Python, Node.js 등 다양한 프로그래밍 언어로 구현 가능합니다.
- AWS SDK를 통해 모든 AWS 서비스에 접근할 수 있습니다.
- 복잡한 로직이나 API 호출이 필요한 경우에 적합합니다.



### 3.2 SNS Provider

- SNS 토픽을 통해 메시지를 전달받아 처리하는 방식입니다.
- 여러 구독자에게 동시에 알림을 보낼 수 있습니다.
- 메시지 전달의 신뢰성이 보장됩니다.
- 간단한 알림이나 비동기 처리가 필요한 경우에 적합합니다.



## 4 Custom Resources 작동 방식

- Custom Resources의 작동 흐름은 다음과 같습니다:

1. **요청 시작**: 
	   - Template Developer가 Custom Resource가 포함된 CloudFormation 템플릿을 생성합니다.
	   - 스택 create/update/delete 작업을 시작합니다.
1. **요청 처리**:
	- CloudFormation이 Custom Resource Provider(Lambda 또는 SNS)에게 요청을 전송합니다.
	- 요청에는 S3 pre-signed URL이 포함되어 있어 응답을 전송할 위치를 지정합니다.
2. **작업 수행**:
	- Provider(Lambda/SNS)가 필요한 작업을 수행합니다.
	- 외부 API 호출이나 리소스 관리 등 원하는 작업을 실행합니다.
3. **응답 전송**:
	- 작업이 완료되면 Provider는 S3 pre-signed URL을 사용해 JSON 형식의 응답을 S3에 업로드합니다.
4. **완료 처리**:
	- CloudFormation이 S3의 응답을 확인하고 스택 작업을 계속 진행합니다.



## 5 실제 사용 예시: S3 버킷 자동 비우기

### 5.1 문제 상황

- AWS S3 버킷은 내부에 객체가 있으면 삭제할 수 없습니다.
- CloudFormation 스택 삭제 시 비어있지 않은 S3 버킷 때문에 실패하는 경우가 많습니다.
- 수동으로 버킷을 비우고 다시 스택 삭제를 시도해야 하는 번거로움이 있습니다.



### 5.2 Custom Resource를 통한 해결

```yaml
Resources:
  # 1. S3 버킷 정의
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-example-bucket

  # 2. Custom Resource 정의
  EmptyBucketCustomResource:
    Type: Custom::EmptyBucket
    Properties:
      ServiceToken: !GetAtt EmptyBucketFunction.Arn  # Lambda 함수 연결
      BucketName: !Ref MyBucket  # 버킷 이름 전달

  # 3. Lambda 함수 정의
  EmptyBucketFunction:
    Type: AWS::Lambda::Function
    Properties:
      Runtime: python3.8
      Handler: index.handler
      Role: !GetAtt LambdaExecutionRole.Arn
      Code:
        ZipFile: |
          import boto3
          import cfnresponse
          
          def handler(event, context):
              try:
                  # 스택 삭제 시에만 버킷 비우기 실행
                  if event['RequestType'] == 'Delete':
                      s3 = boto3.resource('s3')
                      bucket = s3.Bucket(event['ResourceProperties']['BucketName'])
                      bucket.objects.all().delete()
                      print(f"Successfully emptied bucket {bucket.name}")
                  
                  cfnresponse.send(event, context, cfnresponse.SUCCESS, {})
              except Exception as e:
                  print(e)
                  cfnresponse.send(event, context, cfnresponse.FAILED, {})
```

- 이 예시에서는:
	- Custom Resource가 S3 버킷과 연결됩니다.
	- Lambda Provider를 사용하여 버킷 비우기 작업을 처리합니다.
	- 스택 삭제 시 Lambda 함수가 트리거됩니다.
	- Lambda 함수가 버킷의 모든 객체를 자동으로 삭제합니다.
	- 버킷이 비워진 후 CloudFormation이 버킷을 안전하게 삭제할 수 있습니다.
- ServiceToken은 Custom Resource가 어떤 Provider를 사용할지 지정하는 필수 속성입니다.
	- ServiceToken 값으로는 Lambda 함수의 ARN 또는 SNS 토픽의 ARN을 지정합니다.



## 6 Custom Resources 작성 시 주의사항

- **응답 전송 필수**:
	- Custom Resource는 반드시 성공/실패 여부를 CloudFormation에 알려야 합니다.
	- 응답을 보내지 않으면 CloudFormation이 타임아웃될 수 있습니다.
- **오류 처리**:
	- 모든 예외 상황을 적절히 처리해야 합니다.
	- 실패 시에도 반드시 응답을 전송해야 합니다.
- **Provider 선택**:
	- 작업의 특성에 맞는 Provider를 선택해야 합니다.
	- Lambda는 복잡한 처리에, SNS는 간단한 알림에 적합합니다.
- **멱등성 보장**:
	- 같은 작업이 여러 번 실행되어도 안전하도록 설계해야 합니다.
	- 특히 Update 작업 시 주의가 필요합니다.



## 7 Custom Resources의 장점

- **자동화**:
	- 수동 작업이 필요한 과정을 자동화할 수 있습니다.
	- 인프라 관리의 일관성을 높일 수 있습니다.
- **유연성**:
	- CloudFormation의 기본 기능을 넘어서는 작업을 수행할 수 있습니다.
	- 외부 시스템과의 통합이 가능합니다.
- **재사용성**:
	- 한번 만든 Custom Resource를 여러 스택에서 재사용할 수 있습니다.
	- 공통 작업을 템플릿화할 수 있습니다.



## 8 결론

- Custom Resources는 CloudFormation의 기능을 확장하는 강력한 도구입니다.
- Provider를 통해 다양한 사용자 정의 작업을 수행할 수 있습니다.
- Lambda나 SNS를 Provider로 사용하여 거의 모든 종류의 사용자 정의 작업을 자동화할 수 있습니다.
- 적절히 활용하면 인프라 관리의 효율성과 안정성을 크게 높일 수 있습니다.