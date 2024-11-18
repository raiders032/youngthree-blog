## 1 Amazon S3 – Pre-Signed URLs

- Amazon S3의 Pre-Signed URLs는 지정된 시간 동안 특정 객체에 대한 액세스를 허용하는 URL을 생성하는 기능입니다.



**동작 과정**

1. 소유자(Owner)가 S3 버킷에 있는 객체에 대한 Pre-Signed URL을 생성합니다
2. 소유자는 생성된 Pre-Signed URL을 사용자(User)에게 전달합니다.
3. 사용자는 소유자로부터 받은 Pre-Signed URL을 사용하여 S3 버킷에 있는 특정 객체에 접근합니다.
4. Pre-Signed URL을 통해 GET 요청(다운로드)이나 PUT 요청(업로드)을 수행할 수 있습니다.



## 2 주요 기능

### 2.1 Pre-Signed URLs 생성

- S3 콘솔, AWS CLI 또는 SDK를 사용하여 Pre-Signed URLs를 생성할 수 있습니다.
- 생성된 URL은 일정 기간 동안만 유효합니다.



### 2.2 URL 만료 시간 설정

![[Pasted image 20240829165012.png]]

- S3 콘솔을 통해 생성할 경우, 최소 1분에서 최대 720분(12시간)까지 설정할 수 있습니다.
- AWS CLI를 사용할 경우, `--expires-in` 매개변수를 사용해 만료 시간을 초 단위로 설정할 수 있습니다.
	- 기본 만료 시간은 3600초이며, 최대 604800초(168시간)까지 설정 가능합니다.



### 2.3 권한 상속

- Pre-Signed URL을 받은 사용자는 URL을 생성한 사용자의 권한을 상속받습니다.
- 이를 통해 GET 또는 PUT 요청을 수행할 수 있습니다.



## 3 사용 예시

- 프리미엄 비디오 다운로드
	- 로그인한 사용자에게만 S3 버킷에서 프리미엄 비디오를 다운로드할 수 있도록 Pre-Signed URL을 제공할 수 있습니다.
- 동적으로 URL 생성
	- 끊임없이 변경되는 사용자 목록에 맞춰 동적으로 URL을 생성하여 파일 다운로드를 허용할 수 있습니다.
- 임시 파일 업로드
	- 특정 위치에 파일을 업로드할 수 있도록 사용자에게 임시로 권한을 부여하는 Pre-Signed URL을 생성할 수 있습니다.



## 4 CloudFront – Signed URLs와 비교

- CloudFront Signed URLs는 CloudFront 배포를 통해 제공되는 콘텐츠에 대한 제한된 접근을 허용하는 URL입니다.
- CloudFront는 전 세계에 분산된 엣지 로케이션을 통해 콘텐츠를 빠르게 제공하며, Signed URLs를 통해 인증된 사용자만 특정 콘텐츠에 접근할 수 있게 합니다.



**CloudFront Signed URLs의 주요 특징**

1. **콘텐츠 보호**
    - Signed URLs를 사용하면 특정 사용자만 특정 기간 동안 콘텐츠에 접근할 수 있도록 제한할 수 있습니다.
    - 만료 시간을 설정하여 URL의 유효 기간을 제어할 수 있습니다.
2. **전 세계 콘텐츠 배포**
    - CloudFront의 엣지 로케이션을 통해 전 세계 사용자에게 빠르게 콘텐츠를 배포할 수 있습니다.
    - 사용자와 가까운 엣지 서버에서 콘텐츠를 제공하므로 지연 시간이 줄어듭니다.
3. **다양한 콘텐츠 제공**
    - CloudFront Signed URLs를 통해 동영상, 이미지, 정적 웹사이트 파일 등 다양한 콘텐츠를 제공할 수 있습니다.
    - S3와 함께 사용하여 S3 버킷의 객체를 CloudFront를 통해 배포할 수 있습니다.



**S3 Pre-Signed URLs와 CloudFront Signed URLs의 비교**

- **S3 Pre-Signed URLs**
    - 주로 S3 버킷의 객체에 직접 접근할 때 사용됩니다.
    - GET, PUT 요청을 통해 객체를 업로드하거나 다운로드할 수 있습니다.
    - 제한된 시간 동안만 유효하며, 주로 일시적인 접근 권한을 부여하는 데 사용됩니다.
- **CloudFront Signed URLs**
    - CloudFront를 통해 배포되는 콘텐츠에 접근할 때 사용됩니다.
    - 주로 콘텐츠 배포에 사용되며, 전 세계 사용자에게 빠르게 제공할 수 있습니다.
    - Signed URLs를 통해 콘텐츠 보호 및 제한된 접근을 구현할 수 있습니다.



**참고 자료**

- [Amazon S3 Pre-Signed URLs 설명서](https://docs.aws.amazon.com/AmazonS3/latest/dev/ShareObjectPreSignedURL.html)
- [AWS CLI 사용법](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-options.html)