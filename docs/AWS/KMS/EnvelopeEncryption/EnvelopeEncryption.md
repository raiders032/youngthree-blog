## 1 Envelope Encryption 개요

- Envelope Encryption은 대용량 데이터를 안전하고 효율적으로 암호화하는 방법입니다.
- KMS Encrypt API는 4KB 제한이 있어, 그 이상의 데이터는 Envelope Encryption을 사용해야 합니다.
- GenerateDataKey API가 Envelope Encryption의 핵심 API입니다.



## 2 데이터 키 (Data Keys) 이해하기

- 데이터 키는 데이터를 암호화하는 데 사용되는 대칭 키입니다.
- KMS 키와 달리 데이터 키는 AWS KMS 외부에서 사용할 수 있도록 반환됩니다.
- 데이터 키의 특징:
	- AWS KMS가 생성, 암호화, 복호화하지만 저장, 관리, 추적하지는 않습니다.
	- 사용자가 AWS KMS 외부에서 데이터 키를 관리하고 사용해야 합니다.



### 2.1 데이터 키 생성 과정

1. GenerateDataKey API를 호출하여 데이터 키를 생성합니다.
2. AWS KMS는 다음을 반환합니다:
	- 평문 데이터 키 (즉시 사용 가능)
	- KMS 키로 암호화된 데이터 키 (안전하게 저장 가능)



### 2.2 데이터 키를 이용한 암호화 과정

- 데이터 키 생성
	- AWS KMS의 `GenerateDataKey` API를 호출하여 데이터 키를 생성합니다.
	- 이 API 호출 결과로 두 가지 버전의 데이터 키를 받습니다.
		- 평문 데이터 키 (Plaintext Data Encryption Key, DEK)
		- KMS의 고객 마스터 키(CMK)로 암호화된 데이터 키 (Encrypted DEK)
-  데이터 암호화
    - AWS KMS는 직접 데이터를 암호화하지 않습니다. 
    - 대신 다음과 같은 방법으로 평문 데이터 키를 이용해 데이터를 암호화합니다
	    - OpenSSL, AWS Encryption SDK, 또는 기타 신뢰할 수 있는 암호화 라이브러리를 사용합니다.
	    - 이 라이브러리에 평문 데이터 키와 암호화할 데이터를 제공합니다.
	    - 라이브러리가 제공하는 암호화 알고리즘(예: AES-256)을 사용하여 데이터를 암호화합니다.
- 보안 조치
	- 암호화 작업이 완료되면 즉시 메모리에서 평문 데이터 키를 안전하게 제거합니다.
	    - 이는 메모리 덤프 공격 등으로부터 키를 보호하기 위함입니다.
	- 암호화된 데이터 키(Encrypted DEK)는 암호화된 데이터와 함께 저장합니다.
	    - 이 키는 이미 CMK로 암호화되어 있어 안전하게 저장할 수 있습니다.



### 2. 3 데이터 키를 이용한 복호화 과정

- 암호화된 데이터 키 복호화
	- 저장된 암호화된 데이터 키(Encrypted DEK)를 AWS KMS의 `Decrypt` API로 전송합니다.
	- AWS KMS는 다음 과정을 수행합니다
		- 요청한 사용자의 IAM 권한을 확인합니다.
		- 원래 사용된 CMK를 이용하여 암호화된 데이터 키를 복호화합니다.
		- 복호화된 평문 데이터 키를 응답으로 반환합니다.
- 데이터 복호화
	- 받은 평문 데이터 키를 이용하여 암호화된 데이터를 복호화합니다:
	- 암호화 시 사용한 것과 동일한 암호화 라이브러리를 사용합니다.
	- 라이브러리에 평문 데이터 키와 암호화된 데이터를 제공합니다.
	- 라이브러리의 복호화 기능을 사용하여 데이터를 원래 형태로 복원합니다.
- 보안 조치
    - 복호화 작업이 완료되면 즉시 메모리에서 평문 데이터 키를 안전하게 제거합니다.
    - 이는 암호화 과정과 마찬가지로 보안을 위한 중요한 단계입니다.



## 4 AWS Encryption SDK

- AWS Encryption SDK는 Envelope Encryption을 구현한 도구입니다.
- Java, Python, C, JavaScript 등 다양한 언어로 제공됩니다.
- CLI 도구로도 사용 가능합니다.



### 4.1 Data Key Caching

- Encryption SDK의 주요 기능 중 하나입니다.
- 새로운 데이터 키를 매번 생성하는 대신 기존 키를 재사용합니다.
- KMS 호출 횟수를 줄여 성능을 향상시키지만, 보안과의 trade-off가 있습니다.
- LocalCryptoMaterialsCache를 사용하여 캐싱 정책을 설정할 수 있습니다:
    - 최대 수명 (max age)
    - 최대 바이트 수 (max bytes)
    - 최대 메시지 수 (max number of messages)



## 5 Envelope Encryption의 장점

- **대용량 데이터 처리**: 4KB 이상의 데이터를 효율적으로 암호화할 수 있습니다.
- **성능 최적화**: 데이터 키로 직접 암호화하여 KMS 호출을 최소화합니다.
- **보안성**: 데이터 키 자체가 CMK로 보호되어 추가적인 보안 계층을 제공합니다.
- **확장성**: 다양한 크기의 데이터를 동일한 방식으로 처리할 수 있습니다.



## 6 사용 예시 코드

아래는 AWS SDK for Python (Boto3)을 사용한 Envelope Encryption 예시입니다:

```python
import boto3
from cryptography.fernet import Fernet

## KMS 클라이언트 생성
kms = boto3.client('kms')

## 데이터 키 생성
response = kms.generate_data_key(KeyId='alias/your-kms-key', KeySpec='AES_256')

## 평문 데이터 키와 암호화된 데이터 키
plaintext_key = response['Plaintext']
encrypted_key = response['CiphertextBlob']

## 데이터 암호화
data = b'This is a large file content'
f = Fernet(plaintext_key)
encrypted_data = f.encrypt(data)

## 암호화된 데이터와 암호화된 키 저장
with open('encrypted_file.bin', 'wb') as file:
    file.write(encrypted_key + encrypted_data)

print("Data encrypted and stored using Envelope Encryption.")

## 복호화 과정
with open('encrypted_file.bin', 'rb') as file:
    content = file.read()
    stored_encrypted_key = content[:len(encrypted_key)]
    stored_encrypted_data = content[len(encrypted_key):]

## 데이터 키 복호화
decrypted_key = kms.decrypt(CiphertextBlob=stored_encrypted_key)['Plaintext']

## 데이터 복호화
f = Fernet(decrypted_key)
decrypted_data = f.decrypt(stored_encrypted_data)

print("Decrypted data:", decrypted_data.decode())
```



## 7 결론

- Envelope Encryption은 AWS KMS의 핵심 기능으로, 대용량 데이터의 안전하고 효율적인 암호화를 가능하게 합니다.
- 데이터 키는 Envelope Encryption의 핵심 요소로, AWS KMS에서 생성되지만 외부에서 관리되고 사용됩니다.
- 4KB 이상의 데이터를 암호화할 때는 반드시 Envelope Encryption을 사용해야 합니다.
- AWS Encryption SDK를 활용하면 Envelope Encryption을 쉽게 구현할 수 있으며, 추가적인 기능인 Data Key Caching을 통해 성능을 최적화할 수 있습니다.
- 시험에서는 4KB 이상의 데이터 암호화에 대한 질문이 나올 경우, Envelope Encryption과 GenerateDataKey API를 언급해야 합니다.
- 데이터 키의 안전한 관리와 사용은 개발자의 책임이므로, 평문 데이터 키를 사용 후 즉시 메모리에서 제거하는 등의 보안 모범 사례를 따라야 합니다.