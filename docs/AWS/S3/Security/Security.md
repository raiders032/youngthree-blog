## 1 Security

- Amazon S3는 데이터 보안을 위해 다양한 메커니즘을 제공합니다. 
- 이는 사용자 기반 보안과 리소스 기반 보안으로 구분됩니다.



### 1.1 사용자 기반 보안

- 특정 사용자가 어떤 API 호출을 허용할지를 정의합니다. 
- 이는 AWS Identity and Access Management(IAM)를 통해 설정됩니다.
- 예: 특정 사용자가 S3 버킷에서 객체를 읽거나 쓸 수 있도록 허용할 수 있습니다.



### 1.2 리소스 기반 보안

- **버킷 정책(Bucket Policies)**
    - S3 콘솔에서 버킷 전체에 적용되는 규칙을 설정합니다. 
	- 이는 크로스 계정 액세스를 허용할 수 있습니다.
	- 예: 특정 계정의 사용자가 내 버킷에 접근할 수 있도록 허용할 수 있습니다.
- **객체 접근 제어 목록(Object Access Control List)**
    - 더 세밀한 접근 제어를 설정할 수 있습니다. 
    - 객체 단위로 접근 권한을 설정할 수 있으며, 필요에 따라 비활성화할 수 있습니다.
    - 예: 특정 사용자에게 특정 객체에 대한 읽기 권한을 부여할 수 있습니다.
- **버킷 접근 제어 목록(Bucket Access Control List)**
	- 버킷 수준에서 접근 권한을 설정할 수 있으며, 일반적으로 사용되지 않으며 비활성화할 수 있습니다.



### 1.3 Block Public Access

![[Pasted image 20240624162353.png]]

- 이 설정은 회사 데이터 유출을 방지하기 위해 만들어졌습니다.
- 버킷이 절대 퍼블릭이 되어서는 안 된다는 것을 알고 있다면, 이 설정을 활성화 상태로 유지하십시오.
- 퍼블릭 액세스 차단 설정은 사용자 기반 보안과 리소스 기반 보안과는 별도의 보안 레이어로 작동합니다.
- 리소스 기반으로 허용된 퍼블릭 액세스라도 퍼블릭 액세스 차단 설정이 활성화된 경우에는 차단됩니다.
- 설정 항목
	- **Block all public access**: 모든 퍼블릭 액세스를 차단합니다.
	- **Block public access to buckets and objects granted through new access control lists (ACLs)**: 새로운 ACL을 통해 부여된 퍼블릭 액세스를 차단합니다.
	- **Block public access to buckets and objects granted through any access control lists (ACLs)**: 모든 ACL을 통해 부여된 퍼블릭 액세스를 차단합니다.
	- **Block public access to buckets and objects granted through new public bucket or access point policies**: 새로운 퍼블릭 버킷 또는 액세스 포인트 정책을 통해 부여된 퍼블릭 액세스를 차단합니다.
	- **Block public and cross-account access to buckets and objects through any public bucket or access point policies**: 모든 퍼블릭 버킷 또는 액세스 포인트 정책을 통해 부여된 퍼블릭 및 크로스 계정 액세스를 차단합니다.



## 2 Bucket Policy

- 버킷 정책은 Amazon S3 버킷에 대한 액세스를 제어하는 리소스 기반 정책입니다. 
- 이를 통해 버킷과 그 안의 객체에 대한 세밀한 권한 관리가 가능합니다.



### 2.1 구성요소

- 버킷 정책은 다음과 같은 주요 요소로 구성됩니다

1. Version: 정책 언어의 버전을 명시합니다.
2. Id: 정책의 선택적 식별자입니다.
3. Statement: 하나 이상의 개별 명령문을 포함합니다. 각 명령문은 다음 요소로 구성됩니다:
    - Sid: 명령문의 선택적 식별자입니다.
    - Effect: 명령문이 지정된 작업을 허용할지(Allow) 거부할지(Deny)를 지정합니다.
    - Principal: 정책이 적용되는 AWS 계정, 사용자, 역할 또는 서비스를 지정합니다.
    - Action: 허용 또는 거부되는 특정 AWS 작업을 명시합니다.
    - Resource: 정책이 적용되는 AWS 리소스를 지정합니다.
    - Condition: (선택사항) 정책이 적용되는 조건을 지정합니다.



### 2.2 실제 예시

- 다음은 몇 가지 일반적인 시나리오에 대한 버킷 정책 예시입니다:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "FullAccessForSpecificUser",
            "Effect": "Allow",
            "Principal": {"AWS": "arn:aws:iam::123456789012:user/username"},
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::my-bucket",
                "arn:aws:s3:::my-bucket/*"
            ]
        }
    ]
}
```

- 특정 IAM 사용자에게 전체 액세스 권한 부여
- 이 정책은 특정 IAM 사용자(arn:aws:iam::123456789012:user/username)에게 'my-bucket'이라는 버킷과 그 안의 모든 객체에 대한 전체 액세스 권한을 부여합니다.



```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowSpecificIP",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-bucket/*",
            "Condition": {
                "IpAddress": {"aws:SourceIp": "203.0.113.0/24"}
            }
        }
    ]
}
```

- 이 정책은 특정 IP 범위(203.0.113.0/24)에서만 'my-bucket' 버킷의 객체를 읽을 수 있도록 허용합니다.


```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-public-bucket/*"
        }
    ]
}
```

- 이 정책은 'my-public-bucket' 버킷의 모든 객체에 대해 퍼블릭 읽기 액세스를 허용합니다. 
- 웹사이트 호스팅에 자주 사용되는 설정입니다.



## 3 S3를 오직 CloudFront를 통해서만 접근하게 하기

- S3 버킷에 대한 직접 접근을 차단하고 CloudFront를 통해서만 접근하도록 설정하는 것은 보안 강화와 함께 비용 절감 및 성능 향상을 도모할 수 있는 중요한 설정입니다. 
- 이를 위해 AWS에서는 Origin Access Control (OAC)을 사용하여 이 기능을 구현할 수 있습니다.



### 3.1 S3 버킷 정책 설정

- S3 버킷 정책을 통해 오리진 액세스 컨트롤(OAC)만 버킷에 접근할 수 있도록 제한합니다.
- 이는 모든 공용 접근을 차단하고 CloudFront를 통해서만 콘텐츠를 제공하도록 설정하는 방법입니다.



#### 3.1.1 CloudFront OAC 생성

1. **CloudFront 콘솔로 이동**: AWS Management Console에서 CloudFront 서비스 페이지로 이동합니다.
2. **새 배포 생성 또는 기존 배포 편집**: 새로운 CloudFront 배포를 생성하거나, 기존 배포를 편집합니다.
3. **오리진 설정**: 오리진 설정 섹션에서 S3 버킷을 선택하고, "Restrict Bucket Access"를 활성화합니다.
4. **OAC 생성**: "Create a New Origin Access Control"을 선택하여 새로운 OAC를 생성하고, 이 OAC를 S3 버킷에 연결합니다.



#### 3.1.2 S3 버킷 정책에 OAC 추가

1. **S3 콘솔로 이동**: AWS Management Console에서 S3 서비스 페이지로 이동합니다.
2. **버킷 선택**: CloudFront와 연결할 S3 버킷을 선택합니다.
3. **권한 탭 선택**: 버킷의 "Permissions" 탭을 선택합니다.
4. **버킷 정책 편집**: 기존 버킷 정책에 OAC를 사용하도록 설정합니다. 예시 정책은 다음과 같습니다:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<ACCOUNT_ID>:role/CloudFrontOriginAccessRole"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}

```

- 여기서 `<ACCOUNT_ID>`와 `YOUR_BUCKET_NAME`은 각각 AWS 계정 ID와 S3 버킷 이름으로 대체합니다.



### 3.2 CloudFront 배포 설정

- CloudFront 배포를 설정하여 S3 버킷의 콘텐츠가 CloudFront를 통해서만 제공되도록 합니다.



#### 3.2.1 오리진 설정

- CloudFront 배포에서 오리진으로 S3 버킷을 설정합니다.
- "Restrict Bucket Access"를 선택하고, 이전에 생성한 OAC를 선택하여 S3 버킷에 대한 모든 직접 접근을 차단합니다.



#### 3.2.2 캐시 정책 및 오리진 요청 정책

- **캐시 정책**: CloudFront 캐시 설정을 조정하여 콘텐츠의 캐싱 전략을 설정합니다. 이를 통해 특정 요청에 대한 응답 속도를 개선하고 비용을 절감할 수 있습니다.
- **오리진 요청 정책**: 필요에 따라 CloudFront가 S3에 전송할 헤더를 구성할 수 있습니다. 예를 들어, 특정 사용자 지정 헤더를 추가하거나 제거할 수 있습니다.



### 3.3 테스트 및 검증

1. **CloudFront 배포 URL 테스트**: CloudFront 배포의 URL을 사용하여 S3 버킷의 콘텐츠에 접근해 봅니다.
2. **S3 버킷 직접 접근 차단 확인**: S3 버킷의 객체 URL을 직접 접근하여 접근이 차단되었는지 확인합니다. 이때, OAC를 사용하지 않은 모든 접근은 차단되어야 합니다.



## 4 CORS 설정

- Cross-Origin Resource Sharing(CORS)은 웹 애플리케이션이 동일 출처 정책(Same-Origin Policy)을 우회하여 다른 출처의 리소스에 접근할 수 있게 합니다.
- Amazon S3는 CORS 규칙을 사용하여 버킷에서 호스팅되는 객체에 대해 다른 출처의 요청을 허용할 수 있습니다.



### 4.1 CORS 설정 방법

- S3 버킷에 CORS 설정을 추가하려면 다음 단계를 따릅니다:

    1. **S3 콘솔로 이동**: AWS Management Console에서 S3 서비스 페이지로 이동합니다.
    2. **버킷 선택**: CORS 설정을 추가할 S3 버킷을 선택합니다.
    3. **권한 탭 선택**: 버킷의 "Permissions" 탭을 선택합니다.
    4. **CORS 규칙 추가**: "Cross-origin resource sharing (CORS)" 섹션에서 "Edit" 버튼을 클릭하고 CORS 규칙을 추가합니다.



**예시 CORS 규칙**:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT",
            "POST",
            "DELETE"
        ],
        "AllowedOrigins": [
            "http://www.example1.com"
        ],
        "ExposeHeaders": []
    },
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT",
            "POST",
            "DELETE"
        ],
        "AllowedOrigins": [
            "http://www.example2.com"
        ],
        "ExposeHeaders": []
    },
    {
        "AllowedHeaders": [],
        "AllowedMethods": [
            "GET"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```

- AllowedOrigins: 요청을 허용할 출처를 지정합니다. `*`는 모든 출처를 의미합니다.
- AllowedMethods: 허용할 HTTP 메서드를 지정합니다. 예: "GET", "POST", "PUT"
- AllowedHeaders: 요청에서 허용할 헤더를 지정합니다. `*`는 모든 헤더를 의미합니다.
- ExposeHeaders: 클라이언트 응답에서 노출할 헤더를 지정합니다. 예: "x-amz-server-side-encryption"
- MaxAgeSeconds: 브라우저에서 요청 결과를 캐시할 수 있는 기간을 초 단위로 지정합니다.



### 4.2 CORS 설정 적용 후 확인

- CORS 설정이 적용된 후 웹 브라우저에서 다른 출처의 요청이 성공적으로 이루어지는지 확인합니다.
- 이를 통해 S3 버킷의 객체가 적절히 액세스되고 있는지 검증할 수 있습니다.