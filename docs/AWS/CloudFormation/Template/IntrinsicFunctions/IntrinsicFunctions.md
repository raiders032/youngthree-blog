---
title: CloudFormation 내장 함수
description: AWS CloudFormation의 내장 함수(Intrinsic Functions) 총정리
---


## 1 AWS CloudFormation 내장 함수 (Intrinsic Functions) 총정리

- AWS CloudFormation은 템플릿 작성 시 유용하게 사용할 수 있는 다양한 내장 함수를 제공합니다.
- 이러한 함수들은 템플릿의 유연성을 높이고, 동적인 값 처리를 가능하게 합니다.
- 이 글에서는 CloudFormation의 주요 내장 함수들을 자세히 살펴보고, 그 사용법을 알아보겠습니다.



## 2 내장 함수 소개

- CloudFormation 내장 함수는 템플릿 내에서 동적인 값을 생성하거나 조작하는 데 사용됩니다.
- 이 함수들은 리소스 속성 값을 설정하거나, 조건을 평가하거나, 출력 값을 생성하는 데 활용됩니다.
- 주요 내장 함수들은 다음과 같습니다:
  - Ref
  - Fn::GetAtt
  - Fn::Join
  - Fn::Split
  - Fn::Sub
  - Fn::ImportValue
  - Fn::FindInMap
  - Condition Functions (Fn::If, Fn::And, Fn::Or, Fn::Not, Fn::Equals)



## 3 내장 함수 문법: '!' vs 'Fn::'

- CloudFormation 템플릿에서 내장 함수를 사용할 때 두 가지 문법을 사용할 수 있습니다: '!' 접두사와 'Fn::' 접두사
- 이 두 문법은 동일한 기능을 제공하지만, 사용되는 상황과 형식이 다릅니다.

### 3.1 '!' 접두사

- '!' 접두사는 YAML 형식의 템플릿에서 주로 사용됩니다.
- 이 문법은 더 간결하고 가독성이 좋습니다.
- 예시:

```yaml
MyBucket:
  Type: 'AWS::S3::Bucket'
  Properties:
    BucketName: !Ref BucketNameParameter
```

### 3.2 'Fn::' 접두사

- 'Fn::' 접두사는 JSON 형식의 템플릿에서 주로 사용됩니다.
- YAML 형식에서도 사용 가능하지만, 더 장황한 형태입니다.
- 예시:

```json
{
  "MyBucket": {
    "Type": "AWS::S3::Bucket",
    "Properties": {
      "BucketName": {
        "Fn::Ref": "BucketNameParameter"
      }
    }
  }
}
```

### 3.3 주의사항

- 모든 함수가 '!' 문법을 지원하는 것은 아닙니다. (예: Fn::GetAZs는 !GetAZs를 지원하지 않습니다)
- 일부 함수는 '!' 문법을 사용할 때 약간 다른 형식을 가집니다. (예: !Sub는 Fn::Sub와 약간 다른 문법을 가집니다)
- 동일한 템플릿 내에서 두 가지 문법을 혼용해서 사용할 수 있습니다.



## 4 주요 내장 함수 상세 설명

### 4.1 Ref

- `Ref` 함수는 파라미터나 리소스의 값을 참조할 때 사용합니다.
- 파라미터를 참조할 경우 해당 파라미터의 값을 반환합니다.
- 리소스를 참조할 경우 해당 리소스의 식별자(예: 물리적 ID)를 반환합니다.

**사용 예시**

```yaml
Parameters:
  InstanceType:
    Type: String
    Default: t2.micro

Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: !Ref InstanceType
      ImageId: ami-1234567890abcdef0
```

- 위 예시에서 `!Ref InstanceType`은 `Parameters` 섹션에서 정의된 `InstanceType` 파라미터의 값을 참조합니다.



### 4.2 Fn::GetAtt

- `Fn::GetAtt` 함수는 리소스의 속성 값을 가져올 때 사용합니다.
- 리소스의 논리적 이름과 속성 이름을 인자로 받습니다.

**사용 예시**

```yaml
Resources:
  MyBucket:
    Type: AWS::S3::Bucket

Outputs:
  BucketARN:
    Value: !GetAtt MyBucket.Arn
```

- 위 예시에서 `!GetAtt MyBucket.Arn`은 `MyBucket` 리소스의 `Arn` 속성 값을 가져옵니다.



### 4.3 Fn::Join

- `Fn::Join` 함수는 AWS CloudFormation에서 여러 값을 하나의 문자열로 결합할 때 사용하는 내장 함수입니다. 
- 이 함수는 문자열 조합을 유연하게 할 수 있어, 동적인 리소스 이름이나 ARN을 생성할 때 특히 유용합니다.
- `Fn::Join` 함수는 두 개의 파라미터를 받습니다:
	- delimiter (구분자): 값들 사이에 삽입될 문자열입니다.
	- list of values (값들의 리스트): 결합할 값들의 목록입니다.

**예시**

```yaml
!Join 
  - delimiter
  - [ value1, value2, ... ]
```

**사용 예시**

```yaml
!Join 
  - ':'
  - - 'arn'
    - 'aws'
    - 'iam'
    - !Ref 'AWS::AccountId'
    - 'role/my-role-name'
```

- 위 예시는 'arn:aws:iam:123456789012:role/my-role-name'과 같은 문자열을 생성합니다. (여기서 '123456789012'는 실제 AWS 계정 ID로 대체됩니다)



### 4.4 Fn::Split

- `Fn::Split` 함수는 문자열을 구분자를 기준으로 분할하여 리스트로 만듭니다.
- 구분자와 분할할 문자열을 인자로 받습니다.

**사용 예시**
```yaml
!Split 
  - ','
  - !ImportValue 'ExportedSubnetIDs'
```

- 위 예시에서 `ExportedSubnetIDs`가 'subnet-1234,subnet-5678,subnet-9012'와 같은 값이라면, 이를 ['subnet-1234', 'subnet-5678', 'subnet-9012'] 리스트로 분할합니다.



### 4.5 Fn::Sub

- `Fn::Sub` 함수는 문자열 내의 변수를 실제 값으로 대체합니다.
- `${VariableName}` 형식으로 변수를 지정하고, 이를 실제 값으로 대체합니다.

**사용 예시**

```yaml
!Sub 
  - 'arn:aws:ec2:${AWS::Region}:${AWS::AccountId}:instance/${InstanceId}'
  - InstanceId: !Ref MyEC2Instance
```

- 위 예시는 지정된 EC2 인스턴스의 ARN을 생성합니다. `${AWS::Region}`과 `${AWS::AccountId}`는 자동으로 현재 리전과 계정 ID로 대체됩니다.



### 4.6 Fn::ImportValue

- `Fn::ImportValue` 함수는 다른 스택에서 내보낸(exported) 출력 값을 가져올 때 사용합니다.
- 스택 간 값을 공유할 때 유용합니다.

**사용 예시**
```yaml
Resources:
  MySecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      VpcId: !ImportValue MyVPCStack-VPCID
```

- 위 예시에서 `MyVPCStack-VPCID`는 다른 스택에서 내보낸 VPC ID 값을 가져옵니다.



### 4.7 Fn::FindInMap

- `Fn::FindInMap` 함수는 템플릿에 정의된 매핑에서 키에 해당하는 값을 찾을 때 사용합니다.
- 매핑 이름, 최상위 키, 두 번째 레벨 키를 인자로 받습니다.

**사용 예시**
```yaml
Mappings:
  RegionMap:
    us-east-1:
      HVM64: ami-0ff8a91507f77f867
    us-west-1:
      HVM64: ami-0bdb828fd58c52235

Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !FindInMap 
        - RegionMap
        - !Ref 'AWS::Region'
        - HVM64
```

- 위 예시에서 `!FindInMap`은 현재 리전에 따라 적절한 AMI ID를 선택합니다.



### 4.8 Condition Functions

- Condition Functions는 조건을 평가하고 결과에 따라 리소스를 생성하거나 속성을 설정할 때 사용합니다.
- 주요 Condition Functions: Fn::If, Fn::And, Fn::Or, Fn::Not, Fn::Equals

**Fn::If 사용 예시**
```yaml
Conditions:
  CreateProdResources: !Equals 
    - !Ref EnvType
    - prod

Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: !If 
        - CreateProdResources
        - t2.large
        - t2.micro
```

- 위 예시에서 `EnvType` 파라미터가 'prod'일 경우 t2.large 인스턴스를, 그렇지 않으면 t2.micro 인스턴스를 생성합니다.



## 5 내장 함수 사용 시 주의사항

- 내장 함수는 템플릿의 특정 부분에서만 사용할 수 있습니다. (예: 리소스 속성, 출력 값 등)
- 일부 함수는 중첩해서 사용할 수 있지만, 모든 조합이 가능한 것은 아닙니다.
- YAML 형식에서 '!' 문법을 사용할 때는 공백에 주의해야 합니다.
- JSON 형식에서는 함수를 객체로 표현해야 하므로, 문법이 더 복잡할 수 있습니다.
- 스택 생성/업데이트 시 함수의 결과값이 유효한지 확인해야 합니다.


## 6 결론

- CloudFormation 내장 함수는 템플릿을 동적이고 재사용 가능하게 만드는 강력한 도구입니다.
- 각 함수의 특성과 사용법을 이해하면 더 효율적이고 유연한 인프라 관리가 가능해집니다.
- '!' 문법과 'Fn::' 문법을 상황에 맞게 적절히 사용하면 템플릿의 가독성과 유지보수성을 높일 수 있습니다.
- 실제 프로젝트에 적용할 때는 AWS 공식 문서를 참조하여 최신 정보와 제한사항을 확인하는 것이 좋습니다.