## 1 AWS Lambda Environment Variables

- AWS Lambda Environment Variables는 Lambda 함수의 동작을 조정하는 강력한 도구입니다.
- 이는 코드를 직접 수정하지 않고도 함수의 동작을 변경할 수 있게 해줍니다.
- Environment Variables는 키-값 쌍 형태의 문자열로 저장됩니다.



## 2 Environment Variables의 주요 특징

### 2.1 코드 내 사용 가능성

- Lambda 함수 내에서 Environment Variables에 쉽게 접근할 수 있습니다.
- 이를 통해 설정값, API 키, 데이터베이스 연결 문자열 등을 동적으로 관리할 수 있습니다.



### 2.2 Lambda 서비스의 시스템 변수

- Lambda 서비스는 자체적으로 몇 가지 시스템 환경 변수를 추가합니다.
- 이러한 변수들은 함수의 실행 컨텍스트, 버전 정보 등을 제공합니다.



### 2.3 비밀 정보 저장

- Environment Variables는 비밀 정보를 저장하는 데에도 유용합니다.
- AWS Key Management Service(KMS)를 사용하여 이러한 비밀 정보를 암호화할 수 있습니다.



## 3 Environment Variables 암호화

### 3.1 Lambda 서비스 키 사용

- 기본적으로 Lambda 서비스는 자체 서비스 키를 사용하여 환경 변수를 암호화합니다.
- 이는 추가 설정 없이 기본적인 보안을 제공합니다.



### 3.2 고객 관리형 키(CMK) 사용

- 보다 강화된 보안이 필요한 경우, 고객이 직접 관리하는 CMK를 사용할 수 있습니다.
- CMK를 사용하면 키 관리에 대한 더 많은 통제권을 가질 수 있습니다.



## 4 Environment Variables 활용 예시

### 4.1 데이터베이스 연결 정보 관리

```python
import os

db_host = os.getenv("DB_HOST")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")

## 데이터베이스 연결 로직
```



### 4.2 API 엔드포인트 관리

```python
import os
import requests

api_endpoint = os.getenv("API_ENDPOINT")
api_key = os.getenv("API_KEY")

response = requests.get(f"{api_endpoint}/data", headers={"Authorization": f"Bearer {api_key}"})
```



## 5 Environment Variables 사용 시 주의사항

- 민감한 정보는 반드시 암호화하여 저장해야 합니다.
- Environment Variables의 총 크기 제한(4KB)을 고려해야 합니다.
- 함수 코드를 업데이트할 때 Environment Variables도 함께 검토하고 필요시 업데이트해야 합니다.



## 6 결론

- AWS Lambda Environment Variables는 함수의 유연성과 보안성을 크게 향상시킵니다.
- 코드 변경 없이 함수의 동작을 조정할 수 있어 개발 및 운영 효율성이 높아집니다.
- 적절히 활용하면 Lambda 함수의 관리와 유지보수가 훨씬 쉬워집니다.