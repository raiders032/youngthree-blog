## 1 템플릿 구성 요소

- [[Resource]]
- [[Output]]
- [[IntrinsicFunctions]]



## 3 매개변수

- 매개변수는 AWS CloudFormation 템플릿에 입력 값을 제공하는 방법입니다. 
- 이를 통해 템플릿을 회사 전반에서 재사용할 수 있으며, 사전에 값을 결정할 수 없는 경우 유용합니다. 
- 매개변수는 매우 강력하고 제어 가능하며, 템플릿에서 오류가 발생하는 것을 방지할 수 있습니다.



### 3.1 매개변수 설정

**Type 설정**

- 아래와 같은 Type을 지원합니다.
	- `String`: 문자열 형식의 값
	- `Number`: 숫자 형식의 값
	- `CommaDelimitedList`: 쉼표로 구분된 목록
	- `List<Number>`: 숫자 목록
	- `AWS-Specific Paramete`r: 기존 AWS 계정 값과 일치하는 값 (유효하지 않은 값 방지)
	- `List<AWS-Specific Parameter>`: AWS 특정 매개변수 목록
	- `SSM Parameter`: SSM Parameter Store에서 매개변수 값을 가져옴



**기타 설정**

- Description: 매개변수에 대한 설명
- ConstraintDescription: 제약 조건 설명 (문자열)
- MinLength/MaxLength: 최소/최대 길이
- MinValue/MaxValue: 최소/최대 값
- Default: 기본 값
- AllowedValues: 허용되는 값 목록 (배열)
- AllowedPattern: 허용되는 패턴 (정규 표현식)
- NoEcho: 매개변수 값을 출력하지 않음 (Boolean)



### 3.2 매개변수 예시

**EC2 인스턴스 타입 매개변수 예시**

```yaml
Parameters:
	InstanceType:
		Description: Choose an EC2 instance type
		Type: String
		AllowedValues:
		  - t2.micro
		  - t2.small
		  - t2.medium
		Default: t2.micro

Resources:
	MyEC2Instance:
		Type: AWS::EC2::Instance
		Properties:
		  InstanceType: !Ref InstanceType
		  ImageId: ami-0c02fb55956c7d316
```

- InstanceType 매개변수: EC2 인스턴스 타입을 선택할 수 있도록 합니다.
	- Description: 매개변수 설명을 제공합니다.
	- Type: 매개변수 타입을 정의합니다.
	- AllowedValues: 허용되는 값 목록을 설정합니다.
	- Default: 기본 값을 설정합니다.



**데이터베이스 비밀번호 매개변수 예시**

```yaml
Parameters:
  DBPassword:
	Description: The database admin password
	Type: String
	NoEcho: true

Resources:
  MyDBInstance:
	Type: AWS::RDS::DBInstance
	Properties:
	  DBInstanceClass: db.t2.micro
	  AllocatedStorage: 20
	  Engine: mysql
	  MasterUsername: admin
	  MasterUserPassword: !Ref DBPassword
	  DBInstanceIdentifier: mydbinstance
```

- DBPassword 매개변수: 데이터베이스 관리자 비밀번호를 설정할 수 있도록 합니다.
	- Description: 매개변수 설명을 제공합니다.
	- Type: 매개변수 타입을 정의합니다.
	- NoEcho: 매개변수 값을 출력하지 않도록 설정합니다.



### 3.3 매개변수 참조

- 매개변수는 템플릿 내 어디에서나 참조할 수 있습니다. 
- YAML에서는 `!Ref` 구문을 사용하여 매개변수를 참조합니다.



**매개변수 참조 예시**

```yaml
Resources:
  DBSubnet1:
	Type: AWS::EC2::Subnet
	Properties:
	  VpcId: !Ref MyVPC
```

- DBSubnet1 리소스: VPC ID를 MyVPC 매개변수를 참조하여 설정합니다.
	- VPC ID: 매개변수를 참조하여 값을 설정합니다.



### 3.4 의사 매개변수

- [레퍼런스](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html)
- AWS는 모든 CloudFormation 템플릿에서 사용할 수 있는 의사 매개변수를 제공합니다. 
- 이 매개변수들은 기본적으로 활성화되어 있으며, 언제든지 사용할 수 있습니다.



#### 3.4.1 주요 의사 매개변수

- AWS::AccountId: AWS 계정 ID
- AWS::Region: 스택이 생성되는 AWS 리전
- AWS::StackId: 스택의 ARN
- AWS::StackName: 스택의 이름
- AWS::NotificationARNs: 알림 ARN 목록
- AWS::NoValue: 값을 반환하지 않음



## 4 맵핑

- CloudFormation에서 맵핑은 키-값 쌍을 사용하여 템플릿 내에서 특정 값을 변환하는 데 사용됩니다.
- 이를 통해 리전별 설정 값을 관리할 수 있습니다.



### 4.1 리전별 값 매핑

```yaml
Mappings:
  RegionMap:
	us-east-1:
	  "HVM64": "ami-0ff8a91507f77f867"
	  "HVMG2": "ami-0a584ac55a7631c0c"
	us-west-1:
	  "HVM64": "ami-0bdb828fd58c52235"
	  "HVMG2": "ami-066ee5fd4a9ef77f1"
	eu-west-1:
	  "HVM64": "ami-047bb4163c506cd98"
	  "HVMG2": "ami-0a7c483d527806435"
```

- 맵핑을 사용하면 리전별로 다른 값을 설정할 수 있습니다.
- 예를 들어, 리전마다 다른 AMI ID를 사용할 수 있습니다.



### 4.2 매핑 값 참조

```yaml
Resources:
  MyEC2Instance:
	Type: "AWS::EC2::Instance"
	Properties:
	  ImageId: !FindInMap [RegionMap, !Ref "AWS::Region", HVM64]
	  InstanceType: t2.micro
```

- `Fn::FindInMap` 함수를 사용하여 맵핑에서 정의한 값을 참조할 수 있습니다.
- 예를 들어, 리전에 따라 적절한 AMI ID를 선택할 수 있습니다.
- 위 예제에서 `MyEC2Instance`는 `RegionMap` 매핑을 참조하여 리전에 따라 다른 AMI ID를 사용합니다.



### 4.3 조건부 논리 구현



```yaml
Conditions:
  IsUSRegion: !Equals [ !Ref "AWS::Region", "us-east-1" ]

Resources:
  MyBucket:
	Type: "AWS::S3::Bucket"
	Condition: IsUSRegion
	Properties:
	  BucketName: "my-us-bucket"
```

- 맵핑을 사용하면 조건부 논리를 쉽게 구현할 수 있습니다.
- 특정 조건에 따라 다른 리소스를 생성하거나 설정할 수 있습니다.
- 위 예제에서는 리전이 `us-east-1`인 경우에만 `MyBucket`을 생성합니다.



### 4.4 맵핑의 제한 사항

- 맵핑은 고정된 값을 사용하며, 동적으로 값을 변경할 수 없습니다.
- 맵핑은 템플릿 내에서만 사용 가능하며 외부 입력을 받을 수 없습니다.
- 따라서 미리 정의된 값을 사용할 때 유용합니다.



## 6 조건

- 조건은 특정 조건에 따라 리소스나 출력을 생성할지를 제어하는 데 사용됩니다.
- 조건은 다양한 값에 기반하여 설정할 수 있습니다.
	- 예: 환경(dev/test/prod), AWS 리전, 특정 매개변수 값 등
- 각 조건은 다른 조건, 매개변수 값 또는 매핑을 참조할 수 있습니다.



### 6.1 조건 정의

```yaml
Conditions:
  CreateProdResources: !Equals [ !Ref EnvType, prod ]
```

- 논리 ID는 사용자가 선택할 수 있으며, 조건의 이름을 정의합니다.
- 논리 함수는 다음 중 하나일 수 있습니다:
	- `Fn::And`
	- `Fn::Equals`
	- `Fn::If`
	- `Fn::Not`
	- `Fn::Or`



### 6.2 조건 사용

```yaml
Resources:
  MountPoint:
	Type: AWS::EC2::VolumeAttachment
	Condition: CreateProdResources
```

- 조건은 리소스, 출력 등 다양한 곳에 적용할 수 있습니다.