## 1 AWS CloudFormation CreationPolicy

- AWS CloudFormation은 인프라를 코드로 관리할 수 있게 해주는 강력한 서비스입니다.
- 이 서비스의 중요한 기능 중 하나가 CreationPolicy입니다.
- CreationPolicy를 통해 리소스 생성 과정을 더욱 세밀하게 제어할 수 있습니다.



## 2 CreationPolicy란?

- CreationPolicy는 CloudFormation 스택의 리소스 생성 과정을 제어하는 정책입니다.
- 이 정책은 특정 리소스가 성공적으로 생성되었는지 확인하는 데 사용됩니다.
- 주로 EC2 인스턴스, Auto Scaling 그룹 등의 리소스에 적용됩니다.
- CreationPolicy를 사용하면 리소스 생성이 완료되었다는 신호를 받을 때까지 CloudFormation이 대기합니다.



## 3 CreationPolicy의 주요 속성

- CreationPolicy에는 다음과 같은 주요 속성이 있습니다:
	- **ResourceSignal**: 리소스가 생성 완료 신호를 보내야 하는 횟수를 지정합니다.
	- **Timeout**: CloudFormation이 생성 완료 신호를 기다리는 최대 시간을 지정합니다.



## 4 CreationPolicy 사용 예시

- 다음은 EC2 인스턴스에 CreationPolicy를 적용하는 예시입니다:

```yaml
Resources:
  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-0abcdef1234567890
      InstanceType: t2.micro
    CreationPolicy:
      ResourceSignal:
        Timeout: PT15M
        Count: 1
```

- 이 예시에서 CloudFormation은 최대 15분 동안 1개의 성공 신호를 기다립니다.
- 15분 이내에 신호를 받지 못하면 스택 생성이 실패하고 롤백됩니다.



## 5 CreationPolicy의 장점

- CreationPolicy를 사용하면 다음과 같은 이점이 있습니다:
	- 리소스 생성의 신뢰성 향상
	- 복잡한 설정 과정의 완료 보장
	- 스택 생성 실패 시 자동 롤백으로 일관성 유지
	- 긴 설치 과정이 필요한 애플리케이션 배포에 유용



## 6 실제 사용 사례: 커스텀 AMI 생성

- 다음은 CreationPolicy를 사용하여 커스텀 AMI를 생성하는 과정을 제어하는 예시입니다:

```yaml
Resources:
  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-0abcdef1234567890
      InstanceType: t2.micro
      UserData: 
        Fn::Base64: !Sub |
          #!/bin/bash
          # 소프트웨어 설치 및 구성 스크립트
          /opt/aws/bin/cfn-signal -e $? --stack ${AWS::StackName} --resource MyInstance --region ${AWS::Region}
    CreationPolicy:
      ResourceSignal:
        Timeout: PT4H
        Count: 1
```

- 이 템플릿에서는 EC2 인스턴스가 생성된 후 UserData 스크립트가 실행됩니다.
- 스크립트가 완료되면 `cfn-signal` 명령을 통해 CloudFormation에 신호를 보냅니다.
- CreationPolicy는 최대 4시간 동안 이 신호를 기다립니다.
- 4시간 내에 신호를 받지 못하면 스택 생성이 실패하고 롤백됩니다.



## 7 주의사항

- CreationPolicy 사용 시 다음 사항에 주의해야 합니다:
	- Timeout 값은 신중하게 설정해야 합니다.  너무 짧으면 정상적인 프로세스도 실패할 수 있습니다.
	- 리소스에서 반드시 신호를 보내도록 해야 합니다.  그렇지 않으면 스택이 무기한 대기할 수 있습니다.
	- 복잡한 설치 과정이 있는 경우, 오류 처리 로직을 포함시켜야 합니다.



## 8 결론

- CreationPolicy는 CloudFormation 스택의 리소스 생성을 더욱 안정적으로 관리할 수 있게 해줍니다.
- 특히 긴 설치 시간이 필요한 애플리케이션이나 커스텀 AMI 생성 과정에서 매우 유용합니다.
- 적절히 사용하면 인프라 배포의 신뢰성과 일관성을 크게 향상시킬 수 있습니다.
- 그러므로 CloudFormation을 사용할 때 CreationPolicy의 활용을 적극 고려해 보시기 바랍니다.