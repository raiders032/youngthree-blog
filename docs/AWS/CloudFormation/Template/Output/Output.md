## 1 Outputs

- AWS CloudFormation은 인프라를 코드로 관리할 수 있게 해주는 강력한 서비스입니다.
- CloudFormation 템플릿의 Outputs 섹션은 스택 생성 후 필요한 정보를 제공하는 중요한 부분입니다.
- Outputs 섹션을 통해 생성된 리소스의 정보를 쉽게 확인하고 다른 스택에서 참조할 수 있습니다.



## 2 Outputs 섹션의 기본 구조

- Outputs 섹션은 CloudFormation 템플릿의 최상위 레벨에 위치합니다.
- 각 출력 항목은 고유한 논리적 ID를 가지며, 값과 설명을 포함할 수 있습니다.



**기본 구조 예시**

```yaml
Outputs:
  LogicalID:
    Description: 이 출력 항목에 대한 설명
    Value: 출력할 값
    Export:
      Name: 내보낼 이름
```

- `LogicalID`: 출력 항목의 고유 식별자입니다.
- `Description`: 이 출력 항목에 대한 설명입니다. (선택사항)
- `Value`: 실제로 출력될 값입니다.
- `Export`: 다른 스택에서 이 값을 참조할 수 있도록 내보내기 위한 설정입니다. (선택사항)



## 3 Outputs 사용의 장점

- Outputs 섹션을 활용하면 다음과 같은 이점을 얻을 수 있습니다:

1. **정보 공유**: 생성된 리소스의 중요 정보를 쉽게 확인할 수 있습니다.
2. **스택 간 연계**: 한 스택의 출력을 다른 스택에서 입력으로 사용할 수 있습니다.
3. **자동화 지원**: CI/CD 파이프라인에서 출력 값을 활용할 수 있습니다.
4. **문서화**: 스택의 주요 결과물을 명확히 정의할 수 있습니다.



## 4 Outputs 섹션 작성 예시

- 실제 CloudFormation 템플릿에서 Outputs 섹션을 어떻게 작성하는지 살펴보겠습니다.



**EC2 인스턴스 정보 출력 예시**

```yaml
Outputs:
  InstanceId:
    Description: 생성된 EC2 인스턴스의 ID
    Value: !Ref MyEC2Instance
    Export:
      Name: !Sub "${AWS::StackName}-InstanceId"
  
  PublicIP:
    Description: EC2 인스턴스의 퍼블릭 IP 주소
    Value: !GetAtt MyEC2Instance.PublicIp
  
  PrivateIP:
    Description: EC2 인스턴스의 프라이빗 IP 주소
    Value: !GetAtt MyEC2Instance.PrivateIp
```

- 이 예시에서는 EC2 인스턴스의 ID, 퍼블릭 IP, 프라이빗 IP를 출력합니다.
- `!Ref`와 `!GetAtt` 내장 함수를 사용하여 리소스의 속성을 참조합니다.
- `InstanceId`는 `Export`를 통해 다른 스택에서 참조할 수 있도록 내보내고 있습니다.



## 5 Outputs 값 참조하기

- 다른 스택에서 내보낸 출력 값을 참조하려면 `Fn::ImportValue` 함수를 사용합니다.



**다른 스택의 출력 값 참조 예시**

```yaml
Resources:
  MySecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: 보안 그룹 예시
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 22
          ToPort: 22
          SourceSecurityGroupId: !ImportValue MyVPCStack-SGId
```

- 이 예시에서는 `MyVPCStack-SGId`라는 이름으로 내보낸 보안 그룹 ID를 참조하고 있습니다.
- `!ImportValue` 단축 문법을 사용하여 가독성을 높였습니다.



## 6 Outputs 사용 시 주의사항

- Outputs 섹션을 사용할 때 다음 사항들을 주의해야 합니다:

1. **순환 종속성 방지**: 스택 간 참조 시 순환 종속성이 생기지 않도록 주의해야 합니다.
2. **이름 충돌 방지**: 내보내는 이름이 AWS 계정 내에서 고유해야 합니다.
3. **삭제 순서 고려**: 출력을 참조하는 스택이 있다면, 참조하는 스택을 먼저 삭제해야 합니다.
4. **값 변경 주의**: 내보낸 값을 변경하면 이를 참조하는 모든 스택에 영향을 줄 수 있습니다.



## 7 AWS Management Console에서 Outputs 확인하기

- AWS Management Console에서 CloudFormation 스택의 Outputs를 쉽게 확인할 수 있습니다:

1. AWS Management Console에 로그인합니다.
2. CloudFormation 서비스 페이지로 이동합니다.
3. 해당 스택을 선택합니다.
4. "Outputs" 탭을 클릭합니다.
5. 여기서 정의된 모든 출력 값들을 확인할 수 있습니다.



## 8 결론

- CloudFormation 템플릿의 Outputs 섹션은 스택 생성 후 중요 정보를 쉽게 확인하고 공유할 수 있게 해줍니다.
- 적절히 사용하면 스택 간 연계, 자동화, 문서화 등 다양한 이점을 얻을 수 있습니다.
- 하지만 순환 종속성, 이름 충돌 등의 잠재적 문제를 주의해야 합니다.
- Outputs를 효과적으로 활용하여 더욱 체계적이고 관리하기 쉬운 CloudFormation 템플릿을 작성해보세요.