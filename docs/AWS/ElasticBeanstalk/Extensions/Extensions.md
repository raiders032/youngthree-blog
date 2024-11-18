## 1 AWS Elastic Beanstalk Extensions

- AWS Elastic Beanstalk는 간단한 코드 배포와 관리 기능을 제공하는 AWS의 완전 관리형 서비스입니다.
- Elastic Beanstalk Extensions를 사용하면 애플리케이션 배포를 더 세밀하게 제어하고 구성할 수 있습니다.
- 이 글에서는 Elastic Beanstalk Extensions의 개요와 활용 방법을 설명합니다.



## 2 Elastic Beanstalk Extensions란?

- Elastic Beanstalk Extensions는 소스 코드와 함께 배포할 수 있는 구성 파일들입니다.
- 이러한 구성 파일들은 `.ebextensions` 디렉토리에 위치하며, YAML 또는 JSON 형식으로 작성됩니다.
- .config 확장자를 사용하여 다양한 설정을 정의할 수 있습니다 (예: `logging.config`).



## 3 주요 기능

### 3.1 구성 파일을 통한 설정

- **코드와 함께 배포**: 코드가 포함된 ZIP 파일과 함께 `.ebextensions` 디렉토리를 Elastic Beanstalk에 배포합니다.
- **자동 구성**: UI에서 설정한 모든 매개변수를 코드로 구성할 수 있습니다.
- **예시**:
    - RDS, ElastiCache, DynamoDB 등 추가 리소스를 정의합니다.
    - 기본 설정을 변경하기 위해 `option_settings`를 사용합니다.



### 3.2 디렉토리 구조 및 형식

- **디렉토리 위치**: `.ebextensions` 디렉토리는 소스 코드 루트에 위치해야 합니다.
- **형식**: YAML 또는 JSON 형식을 지원합니다.



**예시 파일**

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    LOG_LEVEL: DEBUG
```

- `.ebextensions/logging.config` 파일 작성



## 4 예제 구성 파일

### 4.1 RDS 인스턴스 추가

- RDS 인스턴스를 추가하여 애플리케이션에서 사용할 수 있도록 구성할 수 있습니다.



**예시**

```yaml
Resources:
  myDB:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceClass: db.t2.micro
      Engine: MySQL
      DBName: mydatabase
      MasterUsername: admin
      MasterUserPassword: password

```

- `.ebextensions/rds.config` 파일 작성



### 4.2 기본 설정 변경

- 애플리케이션의 기본 설정을 변경할 수 있습니다.



**예시**

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    PARAM1: value1
    PARAM2: value2
```

- `.ebextensions/options.config` 파일 작성



## 5 리소스 관리

- `.ebextensions`에 의해 관리되는 리소스는 환경이 삭제되면 함께 삭제됩니다.
- 이는 환경의 라이프사이클과 연동되어 리소스를 자동으로 관리할 수 있음을 의미합니다.



## 6 장점 및 주의사항

### 6.1 장점

- **자동화된 설정**: 코드를 배포할 때 필요한 모든 설정을 자동화할 수 있습니다.
- **일관성**: 모든 환경에서 동일한 설정을 유지할 수 있습니다.
- **유연성**: 추가 리소스나 설정 변경이 필요할 때 쉽게 수정할 수 있습니다.



### 6.2 주의사항

- **환경 삭제 시 리소스 삭제**: `.ebextensions`에 의해 생성된 리소스는 환경 삭제 시 함께 삭제되므로, 이점을 유의해야 합니다.
- **구성 파일 형식**: YAML 또는 JSON 형식의 정확성을 유지해야 합니다.



## 7 결론

- AWS Elastic Beanstalk Extensions는 배포 과정에서 필요한 다양한 설정을 코드로 관리할 수 있는 강력한 도구입니다.
- 이를 통해 개발자는 코드와 인프라 설정을 함께 관리하여 배포의 일관성과 효율성을 높일 수 있습니다.
- .ebextensions 디렉토리와 구성 파일을 활용하여, AWS 리소스와 애플리케이션 환경을 세밀하게 제어하고 최적화할 수 있습니다.



**참고 자료**

- [AWS Elastic Beanstalk 공식 문서](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)