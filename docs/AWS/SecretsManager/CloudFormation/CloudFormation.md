## 1 CloudFormation과 Secrets Manager의 통합: 안전한 Secret 관리

- AWS CloudFormation은 인프라를 코드로 관리할 수 있게 해주는 강력한 도구입니다.
- AWS Secrets Manager는 데이터베이스 Secret번호, API 키 등의 민감한 정보를 안전하게 관리하는 서비스입니다.
- 이 두 서비스를 통합하면 보안을 강화하면서도 인프라 배포를 자동화할 수 있습니다.



## 2 Secrets Manager를 사용해야 하는 이유

- **중앙화된 Secret 관리**: 모든 Secret을 한 곳에서 관리할 수 있습니다.
- **자동 로테이션**: 정기적으로 Secret을 자동으로 변경할 수 있습니다.
- **세분화된 액세스 제어**: IAM을 통해 Secret에 대한 접근을 세밀하게 제어할 수 있습니다.
- **암호화**: 저장 및 전송 중인 데이터가 항상 암호화됩니다.



## 3 CloudFormation에서 Secrets Manager 사용하기

### 3.1 Secret 생성하기

**Secret 생성 예시**

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'A sample template'

Resources:
  MySecret:
    Type: 'AWS::SecretsManager::Secret'
    Properties:
      Name: 'MyDatabaseSecret'
      Description: 'Secret for my RDS database'
      GenerateSecretString:
        SecretStringTemplate: '{"username": "admin"}'
        GenerateStringKey: 'password'
        PasswordLength: 16
        ExcludeCharacters: '"@/\'
```

- CloudFormation 템플릿에서 `AWS::SecretsManager::Secret` 리소스를 사용하여 Secret을 생성할 수 있습니다.
- 이 예시에서는 "admin"이라는 사용자 이름과 16자리의 무작위 Secret번호를 생성합니다.
- `GenerateSecretString` 속성을 사용하여 안전한 Secret번호를 자동으로 생성합니다.



### 3.2 Secret 참조하기

- 생성된 Secret은 동적 참조를 사용하여 다른 리소스에서 참조할 수 있습니다.



**RDS 인스턴스 생성 예시**

```yaml
MyRDSInstance:
  Type: 'AWS::RDS::DBInstance'
  Properties:
    DBName: 'MyDatabase'
    Engine: 'mysql'
    MasterUsername: '{{resolve:secretsmanager:MyDatabaseSecret:SecretString:username}}'
    MasterUserPassword: '{{resolve:secretsmanager:MyDatabaseSecret:SecretString:password}}'
    DBInstanceClass: 'db.t3.micro'
    AllocatedStorage: '20'
```

- `{{resolve:secretsmanager:SecretId:SecretString:JsonKey}}` 형식을 사용하여 Secret 값을 참조합니다.
- 이 방식으로 템플릿에 직접 민감한 정보를 포함시키지 않고도 안전하게 사용할 수 있습니다.



## 4 Secret 로테이션 설정

- Secrets Manager의 강력한 기능 중 하나는 Secret의 자동 로테이션입니다.
- CloudFormation을 사용하여 이 기능을 설정할 수 있습니다.



**로테이션 설정 예시**

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Template with Secrets Manager Secret'

Resources:
  MySecret:
    Type: 'AWS::SecretsManager::Secret'
    Properties:
      Name: 'MyDatabaseSecret'
      Description: 'Secret for my RDS database'
      GenerateSecretString:
        SecretStringTemplate: '{"username": "admin"}'
        GenerateStringKey: 'password'
        PasswordLength: 16
        ExcludeCharacters: '"@/\'

  MySecretRotationSchedule:
    Type: AWS::SecretsManager::RotationSchedule
    Properties:
      SecretId: !Ref MySecret
      RotationLambdaARN: !GetAtt MyRotationLambda.Arn
      RotationRules:
        AutomaticallyAfterDays: 30
```

- 이 설정은 30일마다 Secret을 자동으로 로테이션합니다.
- `MyRotationLambda`는 로테이션 로직을 구현한 Lambda 함수입니다.



## 5 보안 강화를 위한 추가 팁

- **최소 권한 원칙**: IAM 역할에 필요한 최소한의 권한만 부여하세요.
- **암호화 사용**: KMS와 통합하여 추가적인 암호화 계층을 제공할 수 있습니다.
- **버전 관리**: Secret의 이전 버전을 유지하여 필요시 롤백할 수 있습니다.
- **감사 로깅**: CloudTrail을 활성화하여 Secret 액세스에 대한 감사 로그를 유지하세요.



## 6 결론

- CloudFormation과 Secrets Manager의 통합은 인프라 배포의 자동화와 보안을 동시에 달성할 수 있게 해줍니다.
- 이를 통해 민감한 정보를 안전하게 관리하면서도 인프라를 코드로 관리할 수 있습니다.
- 자동 로테이션, 중앙화된 관리, 세분화된 액세스 제어 등의 기능을 활용하여 전체적인 보안 태세를 강화할 수 있습니다.
- 이러한 방식은 DevOps 및 보안 팀 모두에게 이점을 제공하며, 현대적인 클라우드 아키텍처의 핵심 요소입니다.