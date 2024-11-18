## 1 CloudFront

- [레퍼런스](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
- Amazon CloudFront는 사용자에게 HTML, CSS, JS, 이미지 파일과 같은 정적 및 동적 웹 콘텐츠의 배포 속도를 높여주는 CDN 서비스다.
- CloudFront는 전 세계 데이터 센터 네트워크인 엣지 로케이션을 통해 콘텐츠를 사용자와 가까운 곳에서 전달한다.
	- CloudFront는 전 세계에 216개의 엣지 로케이션을 가지고 있다.
- 사용자가 CloudFront로 제공되는 콘텐츠를 요청하면, 요청은 최소의 지연 시간을 제공하는 엣지 로케이션으로 전달된다, 따라서 최상의 성능으로 콘텐츠가 제공된다.




> [!NOTE] CDN (Content Delivery Network)
 CDN은 Content Delivery Network의 약자로, 사용자에게 웹 콘텐츠를 빠르게 전달하기 위해 전 세계 여러 지점에 데이터를 복제해 놓는 네트워크 시스템을 의미한다. 기본 원리는 사용자가 어떤 콘텐츠(이미지, 동영상, 웹 페이지 등)에 접근하려 할 때, 가장 가까운 서버에서 해당 콘텐츠를 받아볼 수 있도록 하는 것이다. 이를 통해 콘텐츠 로딩 시간을 줄이고, 서버의 부하를 분산시켜 웹 서비스의 효율과 속도를 향상시킨다.



### 1.1 동작 방식

- 만약 콘텐츠가 지연 시간이 가장 적은 엣지 로케이션에 이미 있다면, CloudFront는 즉시 그것을 전달한다.
- 만약 그 엣지 로케이션에 콘텐츠가 없다면, CloudFront는 사용자가 정의한 Origin에서 그 콘텐츠를 가져온다.
	- 해당 컨텐츠는 엣지 로케이션에 캐시되어 다음 요청에는 빠르게 응답할 수 있다.



### 1.2 비디오 스트리밍 지원

- CloudFront는 실시간 스트리밍 및 주문형 비디오 스트리밍을 모두 지원하여 비디오 콘텐츠 제공을 최적화할 수 있습니다.
- 실시간 스트리밍: CloudFront는 HLS(HLS), MPEG-DASH, Smooth Streaming 등의 프로토콜을 지원하여 실시간 비디오 스트리밍을 제공합니다.
- 주문형 스트리밍: CloudFront는 S3 또는 다른 오리진에서 제공하는 비디오 파일을 전 세계적으로 빠르게 전송할 수 있습니다.



## 2 Origin

- Amazon CloudFront는 다양한 오리진 유형을 지원하여 전 세계에 콘텐츠를 배포할 수 있게 합니다.
- CloudFront 배포의 오리진은 CloudFront가 사용자 요청을 받았을 때 해당 콘텐츠를 가져오는 위치입니다.
- 다음은 CloudFront에서 설정할 수 있는 오리진 유형입니다



**유형**

- **Amazon S3 버킷**
	- 정적 파일과 미디어를 저장하고 CloudFront를 통해 전 세계에 배포할 수 있는 스토리지 서비스입니다.
	- S3 버킷을 오리진으로 사용하면 웹사이트 이미지, 스타일시트, 자바스크립트 파일 등의 정적 콘텐츠를 쉽게 제공할 수 있습니다.
- **Amazon EC2 인스턴스**
	- 사용자 정의 애플리케이션이 실행되는 서버입니다. 
	- EC2 인스턴스를 오리진으로 사용하면 동적 웹 애플리케이션을 전 세계 사용자에게 효과적으로 제공할 수 있습니다
- **Elastic Load Balancing (ELB)**
	- 여러 EC2 인스턴스에 대한 트래픽을 자동으로 분산시켜주는 서비스입니다.
	- ELB를 오리진으로 사용하면 여러 서버에 걸친 로드 밸런싱을 통해 애플리케이션의 가용성과 내구성을 향상시킬 수 있습니다.



## 3 Geo Resitriction

- 지리적 제한을 사용하면 사용자의 지리적 위치에 따라 콘텐츠에 액세스할 수 있는 사람을 제어할 수 있습니다.
- Amazon CloudFront를 사용하면 특정 국가의 요청을 차단하도록 지리적 제한을 구성할 수 있습니다.
- 저작권법을 준수해야 하거나 다양한 지역의 사용자에게 맞춤형 콘텐츠를 제공하려는 경우 특히 유용합니다.
- 허용 목록(Allowlist)을 설정하면 승인된 국가 목록에 포함된 사용자만 콘텐츠에 액세스할 수 있습니다.
- 차단 목록(Blocklist)을 설정하면 금지된 국가 목록에 포함된 사용자가 콘텐츠에 액세스하지 못하도록 할 수 있습니다.
- 사용자의 국가는 서드파티 Geo-IP 데이터베이스를 사용하여 결정됩니다.



## 4 Price Classes

- 콘텐츠를 제공하는 데 사용되는 엣지 로케이션의 수를 조정하여 CloudFront 비용을 제어할 수 있습니다.
- CloudFront는 콘텐츠를 제공하는 데 사용되는 엣지 서버의 지리적 위치를 제한하여 비용을 제어하는 ​​데 도움이 되는 총 3가지 등급을 제공합니다.
	- all, 200, 100



**All**
- 이 옵션에는 전 세계적으로 사용 가능한 모든 CloudFront 엣지 위치가 포함됩니다.
- 이 등급을 선택하면 전체 CloudFront 네트워크를 사용하여 가능한 최고의 성능으로 콘텐츠를 제공할 수 있습니다.
- 이는 모든 지역을 활용하기 때문에 가장 비용이 많이 드는 옵션이지만 전 세계 사용자에게 최고의 대기 시간과 속도를 제공합니다.



**200(Price Class 200)**

- 이 가격 클래스에는 대부분의 엣지 로케이션이 포함되지만 가장 비싼 엣지 로케이션은 제외됩니다. 
- 특히 호주, 브라질, 인도, 일본, 남아프리카공화국 등 비용이 더 높은 국가의 일부 엣지 로케이션은 제외됩니다. 
- 이 계층 옵션을 선택하면 전 세계 고객을 대상으로 광범위한 도달 범위와 상대적으로 높은 성능을 유지하면서 비용을 절감할 수 있습니다.



**100(Price Class 100)**
- 가장 비용 효율적인 옵션이며 운영 비용이 가장 낮은 엣지 로케이션만 포함됩니다.
- 주로 북미와 유럽의 엣지 위치로 콘텐츠 전송을 제한합니다.
- 이 가격 등급을 선택하면 비용을 최소화할 수 있지만, 포함된 엣지 로케이션에서 멀리 떨어진 사용자, 특히 이 가격 등급에서 제외된 지역에 있는 사용자의 경우 지연 시간이 길어질 수 있습니다.



## 5 Global Accelerator와 비교

- Amazon CloudFront와 함께 사용하면 애플리케이션에 도달하는 경로를 최적화하여 추가적인 성능 향상을 제공할 수 있습니다.
- 콘텐츠 전송에 중점을 둔 CloudFront와 달리 Global Accelerator는 일관된 네트워크 성능을 제공하고 인터넷 애플리케이션에 대한 가용성 및 지역 장애 조치를 향상시킵니다.



### 5.1 AWS Global Accelerator

- AWS 내부 네트워크를 활용하여 애플리케이션으로 라우팅합니다.
- 애플리케이션에 대해 2개의 Anycast IP가 생성됩니다.
- Anycast IP는 트래픽을 Edge Locations로 직접 전송합니다.
- Edge Locations는 트래픽을 애플리케이션으로 전송합니다.



### 5.2 AWS Global Accelerator의 특징

- Elastic IP, EC2 인스턴스, ALB, NLB, 공용 또는 사설 네트워크와 함께 작동합니다.
- 일관된 성능을 제공합니다.
- 지능형 라우팅을 통해 가장 낮은 대기 시간과 빠른 지역 장애 조치를 제공합니다.
- 클라이언트 캐시 문제 없음(고정 IP 사용으로 인해).
- AWS 내부 네트워크를 사용합니다.
- 헬스 체크를 수행합니다.
- 애플리케이션의 전 세계 가용성을 지원합니다(비정상 상태일 경우 1분 이내 장애 조치).
- 재해 복구에 탁월합니다(헬스 체크 덕분에).
- 보안이 강화됩니다(외부 IP 2개만 허용 목록에 추가).
- AWS Shield를 통한 DDoS 보호를 제공합니다.



### 5.3 AWS Global Accelerator vs CloudFront

- 두 서비스 모두 AWS 글로벌 네트워크와 전 세계의 엣지 로케이션을 사용합니다.
- 두 서비스 모두 AWS Shield와 통합되어 DDoS 보호를 제공합니다.



**CloudFront**

- 캐시 가능한 콘텐츠(예: 이미지 및 비디오)와 동적 콘텐츠(예: API 가속 및 동적 사이트 제공)의 성능을 향상시킵니다.
- 콘텐츠는 엣지에서 제공됩니다.



**Global Accelerator**

- TCP 또는 UDP를 통한 다양한 애플리케이션의 성능을 향상시킵니다.
- 하나 이상의 AWS 리전에서 실행되는 애플리케이션으로 엣지에서 패킷을 프록시합니다.
- 비HTTP 사용 사례(예: 게임(UDP), IoT(MQTT), VoIP)에 적합합니다.
- 고정 IP 주소가 필요한 HTTP 사용 사례에 적합합니다.
- 결정적이고 빠른 지역 장애 조치가 필요한 HTTP 사용 사례에 적합합니다.



## 6 Invalidating files

- [레퍼런스](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)
- CloudFront는 콘텐츠를 캐싱하기 때문에 Origin의 콘텐츠를 업데이트해도 TTL이 지나기 전까지는 CloudFront는 업데이트 된 콘텐츠를 가져오지 않는다.
- 콘텐츠를 업데이트하고 이를 바로 CloudFront에 반영하고 싶다면 Invalidating 기능을 사용해서 캐시의 일부분을 제거할 수 있다.
- 캐시에서 콘텐츠를 제거하면 다음 요청에 의해서 최신 버전의 콘텐츠를 Origin에서 가져올 것이다.



## 7 Restricting Access to an Amazon Simple Storage Service (S3) Origin Using CloudFront

- OAC와 OAI는 CloudFront를 통해서만 S3 버킷에 접근하도록 하여, S3 버킷이 직접적으로 외부에 공개되지 않도록 합니다. 이를 통해 S3 버킷의 보안을 강화할 수 있습니다.
- CloudFront는 Amazon S3 원본에 인증된 요청을 보내는 두 가지 방법을 제공합니다
	- Origin Access Control (OAC)
	- Origin Access Identity (OAI)
- OAC는 더 많은 기능과 유연성을 제공하며, 특히 2022년 12월 이후 출시된 AWS 리전에서 유리합니다.
- OAI는 제한적이거나 추가 작업이 필요한 경우가 있습니다.



### 7.1 Origin Access Control (OAC)

- **장점**
    - 모든 AWS 리전의 S3 버킷을 지원.
    - AWS KMS (SSE-KMS)로 암호화된 Amazon S3 서버 측 암호화 지원.
    - 동적 요청(PUT 및 DELETE) 지원.



**OAC 설정 방법**

- **Prerequisites**
    - CloudFront 배포와 Amazon S3 버킷 원본이 필요.
    - 원본은 정규 S3 버킷이어야 함.
- **권한 부여**
    - OAC가 S3 버킷에 접근할 수 있도록 S3 버킷 정책을 설정.

```json
{
    "Version": "2012-10-17",
    "Statement": {
        "Sid": "AllowCloudFrontServicePrincipalReadOnly",
        "Effect": "Allow",
        "Principal": {
            "Service": "cloudfront.amazonaws.com"
        },
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::<S3 bucket name>/*",
        "Condition": {
            "StringEquals": {
                "AWS:SourceArn": "arn:aws:cloudfront::111122223333:distribution/<CloudFront distribution ID>"
            }
        }
    }
}

```



**SSE-KMS 사용 시**

- KMS 키 정책에 OAC를 추가하여 사용 권한을 부여.

```json
{
    "Sid": "AllowCloudFrontServicePrincipalSSE-KMS",
    "Effect": "Allow",
    "Principal": {
        "Service": [
            "cloudfront.amazonaws.com"
        ]
    },
    "Action": [
        "kms:Decrypt",
        "kms:Encrypt",
        "kms:GenerateDataKey*"
    ],
    "Resource": "*",
    "Condition": {
        "StringEquals": {
            "AWS:SourceArn": "arn:aws:cloudfront::111122223333:distribution/<CloudFront distribution ID>"
        }
    }
}

```



- **OAC 생성 및 설정**
    - CloudFront 콘솔에서 OAC를 생성하고 S3 원본에 추가.



### 7.2 Origin Access Identity (OAI)

- CloudFront가 S3 버킷에 접근할 수 있도록 하는 특수한 IAM 사용자.
- S3 버킷이 직접 공개되지 않고 CloudFront를 통해서만 접근 가능.



**OAI 설정 방법**

- **OAI 생성**
    - CloudFront 콘솔에서 OAI 생성 후 ARN 복사.
- **S3 버킷 정책 수정**
    - OAI의 ARN을 추가하여 접근 권한 부여.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity <OAI ID>"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<bucket_name>/*"
        }
    ]
}

```

- **CloudFront 배포에 OAI 추가**
    - CloudFront 배포 설정에서 OAI를 사용하여 원본 접근 설정.



## 8 Field-Level Encryption

- [레퍼런스](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/field-level-encryption.html)
- CloudFront Field-Level Encryption은 민감한 데이터를 보호하는 추가적인 보안 계층을 제공합니다.
- 클라이언트에서 전송하는 특정 데이터를 암호화하여 오리진 서버와 애플리케이션 스택 전체에서 안전하게 전송합니다.



### 8.1 필드 레벨 암호화 정책

- **암호화 필드 설정**: CloudFront 배포를 구성할 때 POST 요청에서 암호화할 필드를 지정합니다.
- **공개 키 사용**: 데이터를 암호화하는 데 사용할 공개 키를 지정합니다.
- **제한**: 요청 당 최대 10개의 필드를 암호화할 수 있습니다.



### 8.2 데이터 보호

- **종단 간 보안**: 클라이언트에서 전송된 데이터는 서버에 도달하기 전까지 암호화 상태로 유지됩니다.
- **서버 측 복호화**: 서버는 개인 키를 사용하여 암호화된 필드를 복호화합니다.



### 8.3 공개 키 관리

- **AWS Key Management Service (KMS)**: KMS를 통해 공개 키와 개인 키 쌍을 생성하고 관리할 수 있습니다.
- **안전한 키 저장**: KMS는 키를 안전하게 저장하고 접근을 엄격하게 제어합니다.



### 8.4 사용 사례

- 민감한 데이터 전송
	- 클라이언트가 전송하는 신용카드 정보, 개인 식별 정보(PII), 의료 정보 등을 안전하게 전송합니다.
- 규정 준수
	- 금융, 헬스케어, 정부 기관 등 규제가 엄격한 산업에서 데이터 보호 규정을 준수하는 데 도움을 줍니다.
- 데이터 유출 방지
	- 중간 경로에서 데이터가 유출되더라도 암호화된 필드는 보호된 상태로 유지되어 데이터 유출로 인한 위험을 최소화합니다.




**참고 자료**

- [AWS CloudFront Field-Level Encryption 공식 문서](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/field-level-encryption.html)
- [AWS Key Management Service(KMS) 공식 문서](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html)