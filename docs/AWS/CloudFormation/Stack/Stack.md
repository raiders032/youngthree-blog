## 1 CloudFormation Stack

- CloudFormation Stack은 AWS 리소스 컬렉션을 관리하는 단위입니다.
- 스택은 하나의 단위로 생성, 업데이트, 삭제할 수 있는 AWS 리소스 그룹입니다.
- 스택은 템플릿을 기반으로 생성됩니다. 
- 템플릿은 JSON 또는 YAML 형식의 텍스트 파일로, 필요한 AWS 리소스를 선언적으로 정의합니다.
- 스택을 사용하면 인프라를 코드로 관리할 수 있어, 버전 관리, 반복 가능한 배포, 일관성 있는 구성이 가능해집니다.



**기본 스택 템플릿 예시**

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: A simple EC2 instance

Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t2.micro
      ImageId: ami-0c55b159cbfafe1f0
```

- 이 예시는 단일 EC2 인스턴스를 생성하는 간단한 스택 템플릿입니다.



## 2 Nested Stacks 소개

- Nested Stacks는 다른 스택의 일부로 포함되는 스택입니다.
- 이를 통해 반복되는 패턴이나 공통 컴포넌트를 별도의 스택으로 분리하고, 다른 스택에서 호출할 수 있습니다.
- Nested Stacks는 CloudFormation 모범 사례로 간주됩니다.



### 2.1 Nested Stacks의 주요 특징

- 재사용 가능한 구성 요소를 분리할 수 있습니다.
	- 예: 여러 번 사용되는 로드 밸런서 구성
	- 예: 재사용되는 보안 그룹 설정
- Nested Stack을 업데이트하려면 항상 부모(루트) 스택을 업데이트해야 합니다.
- Nested Stack 자체에 또 다른 Nested Stack을 포함할 수 있습니다.



### 2.2 Nested Stacks의 장점

- 코드 재사용성 향상: 공통 구성 요소를 한 번 정의하고 여러 스택에서 재사용할 수 있습니다.
- 유지 보수 용이성: 공통 구성 요소를 한 곳에서 관리하므로 업데이트가 쉽습니다.
- 복잡성 관리: 대규모 인프라를 더 작고 관리하기 쉬운 구성 요소로 분할할 수 있습니다.



### 2.3  Nested Stacks 사용 예시

**부모 스택 템플릿 예시**
```yaml
Resources:
  NestedStack:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: https://s3.amazonaws.com/bucket-name/nested-stack.yaml
      Parameters:
        ParameterName: ParameterValue
```

- 이 예시에서 `NestedStack`은 S3에 저장된 별도의 템플릿 파일을 참조합니다.
- `Parameters` 섹션을 통해 Nested Stack에 파라미터를 전달할 수 있습니다.



## 3 Cross Stacks 소개

- Cross Stacks는 서로 다른 수명 주기를 가진 스택 간에 값을 공유할 때 유용합니다.
- Outputs Export와 Fn::ImportValue를 사용하여 구현합니다.
- 여러 스택에 동일한 값(예: VPC ID)을 전달해야 할 때 특히 유용합니다.



### 3.1 Cross Stacks의 주요 특징

- 스택 간 데이터 공유: 한 스택의 출력을 다른 스택의 입력으로 사용할 수 있습니다.
- 느슨한 결합: 스택들이 서로 독립적으로 생성 및 관리될 수 있습니다.
- 재사용성: 공통 인프라 구성 요소(예: VPC, 서브넷)를 여러 스택에서 재사용할 수 있습니다.



### 3.2 Cross Stacks 사용 예시

**값을 내보내는 스택 템플릿**

```yaml
Outputs:
  VPCId:
    Description: VPC ID
    Value: !Ref MyVPC
    Export:
      Name: MyVPCId
```



**값을 가져오는 스택 템플릿**

```yaml
Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t2.micro
      ImageId: ami-0c55b159cbfafe1f0
      NetworkInterfaces: 
        - AssociatePublicIpAddress: "true"
          DeviceIndex: "0"
          GroupSet: 
            - !Ref MySecurityGroup
          SubnetId: 
            Fn::ImportValue: MySubnetId
```

- 이 예시에서 두 번째 스택은 첫 번째 스택에서 내보낸 서브넷 ID를 가져와 사용합니다.



### 3.3 Nested Stacks vs Cross Stacks

- Nested Stacks:
	- 동일한 생명주기를 가진 리소스들을 관리할 때 유용합니다.
	- 상위 스택에만 중요하고 다른 스택과 공유되지 않는 구성 요소에 적합합니다.
	- 예: 애플리케이션 로드 밸런서의 올바른 구성 방법을 재사용할 때
- Cross Stacks:
	- 서로 다른 생명주기를 가진 스택 간에 값을 공유할 때 유용합니다.
	- 여러 스택에 동일한 값을 전달해야 할 때 적합합니다.
	- 예: VPC ID, 서브넷 ID 등을 여러 스택에서 공유할 때



## 4 결론

- CloudFormation Stacks는 AWS 리소스를 관리하는 강력한 도구입니다.
- Nested Stacks와 Cross Stacks는 복잡한 인프라를 더욱 효율적으로 관리할 수 있게 해주는 고급 기능입니다.
- Nested Stacks는 재사용 가능한 구성 요소를 관리하는 데 적합하며, Cross Stacks는 독립적인 스택 간에 값을 공유하는 데 유용합니다.
- 이러한 기능들을 적절히 활용하면 대규모 인프라를 더욱 효과적으로 관리하고, 코드의 재사용성을 높이며, 전체적인 인프라 관리의 복잡성을 줄일 수 있습니다.