## 1 S3 Encryption

- Amazon S3에서는 네 가지 방법으로 객체를 암호화할 수 있습니다.



## 2 서버 측 암호화 (SSE)

### 2.1 Amazon S3 관리 키를 사용하는 서버 측 암호화 (SSE-S3)

![[Pasted image 20240802145236.png]]

- 기본적으로 활성화되어 있습니다.
- AWS가 처리하고 관리하는 키를 사용하여 S3 객체를 암호화합니다.
- 객체는 서버 측에서 AES-256 방식으로 암호화됩니다.
- 헤더 "x-amz-server-side-encryption": "AES256"을 설정해야 합니다.
- 새로운 버킷과 객체에 대해 기본적으로 활성화됩니다.
- Amazon S3는 객체를 암호화하기 위해 자체 관리 키를 사용합니다.
	- 이러한 키는 주기적으로 자동으로 회전됩니다.
	- 사용자가 키 관리 또는 회전에 대해 신경 쓸 필요가 없습니다.



### 2.2 AWS KMS 키를 사용하는 서버 측 암호화 (SSE-KMS)

![[Pasted image 20240802145227.png]]

- AWS Key Management Service (AWS KMS)를 사용하여 암호화 키를 관리합니다.
- KMS의 장점: 사용자 제어 및 CloudTrail을 사용한 키 사용 감사
- 객체는 서버 측에서 암호화됩니다.
- 헤더 "x-amz-server-side-encryption": "aws:kms"를 설정해야 합니다.



#### 2.2.1 SSE-KMS의 제한 사항

- SSE-KMS를 사용할 경우 KMS 제한에 영향을 받을 수 있습니다.
- 업로드 시, GenerateDataKey KMS API가 호출됩니다.
- 다운로드 시, Decrypt KMS API가 호출됩니다.
- 이러한 호출은 초당 KMS 할당량에 포함됩니다 
	- (지역에 따라 5500, 10000, 30000 요청/초).
- Service Quotas Console을 사용하여 할당량 증가를 요청할 수 있습니다.



### 2.3 SSE-C(고객 제공 키를 사용하는 서버 측 암호화)

![[Pasted image 20240802145215.png]]

- 사용자가 자체적으로 관리하는 암호화 키를 사용하여 암호화합니다.
- Amazon S3는 사용자가 제공한 암호화 키를 저장하지 않습니다.
- 반드시 HTTPS를 사용해야 합니다.
- 암호화 키는 모든 HTTP 요청마다 HTTP 헤더에 제공되어야 합니다.



## 3 클라이언트 측 암호화

- 클라이언트 측에서 직접 객체를 암호화합니다.
- Amazon S3 클라이언트 측 암호화 라이브러리와 같은 클라이언트 라이브러리를 사용할 수 있습니다.
- 클라이언트는 데이터를 Amazon S3로 전송하기 전에 스스로 암호화해야 합니다.
- 클라이언트는 Amazon S3에서 데이터를 가져올 때 스스로 복호화해야 합니다.
- 고객이 키와 암호화 사이클을 완전히 관리합니다.



## 4 전송 중 암호화 (Encryption in Transit)

- 전송 중 암호화는 SSL/TLS를 사용하여 데이터를 암호화하는 것을 의미합니다.
- Amazon S3는 두 가지 엔드포인트를 제공합니다:
	- **HTTP 엔드포인트**: 암호화되지 않은 전송
	- **HTTPS 엔드포인트**: 전송 중 암호화
- **HTTPS** 사용을 권장합니다.
- **HTTPS**는 SSE-C(Server-Side Encryption with Customer-Provided Keys)를 사용할 때 필수입니다.
- 대부분의 클라이언트는 기본적으로 **HTTPS 엔드포인트**를 사용합니다.



### 4.1 전송 중 암호화 강제하기

- S3 버킷에 대한 모든 요청이 SSL/TLS(HTTPS)를 통해 이루어지도록 강제할 수 있습니다.
- 이를 위해 버킷 정책을 사용하여 암호화되지 않은 연결(HTTP)을 통한 액세스를 거부할 수 있습니다.



**HTTPS를 강제하는 버킷 정책 예시**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "DenyHTTPAccess",
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ],
            "Condition": {
                "Bool": {
                    "aws:SecureTransport": "false"
                }
            }
        }
    ]
}
```

- 이 정책은 `aws:SecureTransport` 조건이 `false`일 때(즉, HTTPS를 사용하지 않을 때) 모든 S3 작업을 거부합니다.
- 이 정책을 적용하면 HTTPS를 통해서만 버킷에 액세스할 수 있으며, 전송 중 암호화가 보장됩니다.



## 5 기존 객체 암호화

- S3 버킷에서 암호화를 활성화하면 **새로운 객체**만 자동으로 암호화됩니다. 
	- 기존 객체는 자동으로 암호화되지 않습니다. 
	- 기존 객체를 암호화하려면 수동으로 암호화 작업을 수행해야 합니다.
- Amazon S3 Batch Operations를 사용하여 기존 객체를 암호화된 상태로 일괄 처리할 수 있습니다.
	- [[Batch-Operation]]



## 6 데이터 업로드 전 암호화 및 전송 중 암호화하기

- **조건**: 데이터가 S3 버킷에 업로드되기 전에 암호화되어야 하며, 전송 중에도 암호화되어야 합니다.
- 데이터가 업로드되기 전에 암호화되도록 하려면 **클라이언트 측 암호화**를 사용합니다.
- 데이터가 전송 중에 암호화되도록 하려면 **HTTPS**를 사용합니다.



### 6.1 클라이언트 측 암호화 (Client-Side Encryption) 및 HTTPS

- **클라이언트 측 암호화**는 데이터를 S3로 전송하기 전에 클라이언트에서 직접 암호화하는 방식입니다.
- Amazon S3 클라이언트 측 암호화 라이브러리를 사용하여 암호화 작업을 수행할 수 있습니다.
- 이 방법을 사용하면 데이터는 클라이언트에서 암호화된 후 S3로 전송되기 때문에, 전송 중에도 암호화된 상태를 유지합니다.
- 클라이언트는 데이터를 복호화할 수 있는 키를 관리해야 합니다.
- **HTTPS** 프로토콜을 사용하여 전송 중 암호화를 보장합니다.
    - 데이터는 HTTPS를 통해 암호화된 상태로 전송됩니다.



## 7 버킷 정책으로 암호화 강제하기

### 7.1 버킷 정책을 통한 암호화 강제

- Amazon S3 버킷 정책을 사용하여 모든 객체가 특정 암호화 방식으로 업로드되도록 강제할 수 있습니다.
- 이는 PutObject 요청에 특정 헤더가 포함되도록 요구함으로써 이루어집니다.



### 7.2 SSE-S3 강제 적용 예시

- 모든 업로드된 객체가 SSE-S3(Amazon S3 관리 키)로 암호화되도록 강제하려면 다음과 같은 버킷 정책을 설정합니다:

```json
{
  "Version": "2012-10-17",
  "Id": "SSE-S3-Policy",
  "Statement": [
    {
      "Sid": "RequireSSES3",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

- 이 정책은 `x-amz-server-side-encryption` 헤더가 `AES256`으로 설정되지 않은 PutObject 요청을 거부합니다.