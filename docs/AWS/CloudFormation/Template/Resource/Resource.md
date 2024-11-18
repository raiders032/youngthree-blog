## 1 AWS CloudFormation 템플릿의 리소스 소개

- AWS CloudFormation은 인프라를 코드로 관리할 수 있게 해주는 서비스입니다.
- CloudFormation 템플릿에서 가장 중요한 부분 중 하나가 바로 '리소스(Resources)' 섹션입니다.
- 리소스 섹션에서는 AWS 인프라를 구성하는 다양한 요소들을 정의합니다.
- 이 글에서는 CloudFormation 템플릿의 리소스에 대해 자세히 알아보겠습니다.



## 2 리소스의 기본 구조

- CloudFormation 템플릿의 리소스 섹션은 다음과 같은 기본 구조를 가집니다:



**리소스 섹션의 기본 구조**

```yaml
Resources:
  LogicalID:
    Type: ResourceType
    Properties:
      Property1: Value1
      Property2: Value2
```

- `Resources`: 템플릿의 리소스 섹션을 시작하는 키워드입니다.
- `LogicalID`: 해당 리소스를 식별하는 고유한 이름입니다. 템플릿 내에서 이 ID를 사용해 리소스를 참조할 수 있습니다.
- `Type`: 생성할 AWS 리소스의 유형을 지정합니다. 예: `AWS::EC2::Instance`, `AWS::S3::Bucket` 등
- `Properties`: 해당 리소스의 구체적인 설정을 정의하는 섹션입니다.



## 3 리소스 유형 (Resource Types)

- AWS CloudFormation은 다양한 AWS 서비스에 대한 리소스 유형을 제공합니다.
- 리소스 유형은 `AWS::ServiceName::ResourceType` 형식으로 지정됩니다.
- 주요 리소스 유형 몇 가지를 살펴보겠습니다:



### 3.1 EC2 인스턴스 (AWS::EC2::Instance)

- EC2 인스턴스를 생성하는 리소스 유형입니다.



**EC2 인스턴스 리소스 예시**

```yaml
Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-0c55b159cbfafe1f0
      InstanceType: t2.micro
      KeyName: my-key-pair
      SecurityGroups:
        - my-security-group
```

- `ImageId`: 사용할 AMI(Amazon Machine Image)의 ID를 지정합니다.
- `InstanceType`: 인스턴스의 유형(크기)을 지정합니다.
- `KeyName`: SSH 접속에 사용할 키 페어의 이름을 지정합니다.
- `SecurityGroups`: 인스턴스에 적용할 보안 그룹을 지정합니다.



### 3.2 S3 버킷 (AWS::S3::Bucket)

- S3 버킷을 생성하는 리소스 유형입니다.



**S3 버킷 리소스 예시**

```yaml
Resources:
  MyS3Bucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-unique-bucket-name
      AccessControl: Private
      VersioningConfiguration:
        Status: Enabled
```

- `BucketName`: 생성할 S3 버킷의 이름을 지정합니다. 전역적으로 유일해야 합니다.
- `AccessControl`: 버킷의 접근 제어 설정을 지정합니다.
- `VersioningConfiguration`: 버킷의 버전 관리 설정을 지정합니다.



### 3.3 VPC (AWS::EC2::VPC)

- Virtual Private Cloud(VPC)를 생성하는 리소스 유형입니다.



**VPC 리소스 예시**

```yaml
Resources:
  MyVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      InstanceTenancy: default
      Tags:
        - Key: Name
          Value: MyVPC
```

- `CidrBlock`: VPC의 IP 주소 범위를 CIDR 형식으로 지정합니다.
- `EnableDnsHostnames`: VPC 내의 인스턴스에 대해 DNS 호스트네임을 활성화할지 여부를 지정합니다.
- `EnableDnsSupport`: VPC에 대해 DNS 지원을 활성화할지 여부를 지정합니다.
- `InstanceTenancy`: VPC 내에서 실행되는 EC2 인스턴스의 테넌시 속성을 지정합니다.
- `Tags`: VPC에 태그를 추가합니다.



## 4 리소스 속성 (Resource Properties)

- 각 리소스 유형마다 고유한 속성 집합을 가지고 있습니다.
- 이러한 속성을 통해 리소스의 세부 설정을 구성할 수 있습니다.
- 속성은 필수 속성과 선택적 속성으로 나뉩니다.
- AWS 문서를 참조하여 각 리소스 유형의 사용 가능한 속성을 확인할 수 있습니다.



## 5 리소스 간 종속성 (Resource Dependencies)

- CloudFormation은 리소스 간의 종속성을 자동으로 파악하고 적절한 순서로 리소스를 생성합니다.
- 명시적으로 종속성을 지정해야 하는 경우 `DependsOn` 속성을 사용할 수 있습니다.



**종속성 지정 예시**

```yaml
Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    DependsOn: MyVPC
    Properties:
      # ... 속성 내용 ...

  MyVPC:
    Type: AWS::EC2::VPC
    Properties:
      # ... 속성 내용 ...
```

- 위 예시에서 `MyEC2Instance`는 `MyVPC`에 종속됩니다.
- CloudFormation은 `MyVPC`를 먼저 생성한 후 `MyEC2Instance`를 생성합니다.



## 6 리소스 참조 (Resource References)

- 템플릿 내에서 다른 리소스의 값을 참조해야 할 때가 있습니다.
- 이럴 때 `Ref` 함수나 `Fn::GetAtt` 함수를 사용할 수 있습니다.



**리소스 참조 예시**

```yaml
Resources:
  MyVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16

  MySubnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref MyVPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select 
        - 0
        - !GetAZs 
          Ref: 'AWS::Region'
```

- `!Ref MyVPC`: `MyVPC` 리소스의 ID를 참조합니다.
- `!GetAZs`: 지정된 리전의 가용 영역 목록을 가져옵니다.
- `!Select`: 리스트에서 특정 인덱스의 값을 선택합니다.



## 7 리소스 업데이트 동작

- CloudFormation 스택을 업데이트할 때 리소스의 변경 사항에 따라 다양한 업데이트 동작이 발생할 수 있습니다:
	- 업데이트 없음: 변경 사항이 없는 경우
	- 업데이트 가능: 중단 없이 업데이트 가능한 경우
	- 대체: 리소스를 삭제하고 새로 생성해야 하는 경우
- 각 리소스 유형마다 업데이트 동작이 다르므로 AWS 문서를 참조하여 확인해야 합니다.



## 8 결론

- AWS CloudFormation 템플릿의 리소스 섹션은 인프라를 코드로 정의하는 핵심 부분입니다.
- 다양한 AWS 서비스에 대한 리소스를 정의하고 구성할 수 있습니다.
- 리소스 간의 종속성과 참조를 통해 복잡한 인프라도 효과적으로 관리할 수 있습니다.
- CloudFormation을 사용하면 일관성 있고 재현 가능한 방식으로 AWS 인프라를 배포하고 관리할 수 있습니다.
- 리소스에 대한 깊이 있는 이해는 효과적인 CloudFormation 템플릿 작성의 기본이 됩니다.