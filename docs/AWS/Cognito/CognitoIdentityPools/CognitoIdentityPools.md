## 1 AWS Cognito Identity Pools

- AWS Cognito Identity Pools은 애플리케이션 사용자에게 임시 AWS 자격 증명을 제공하는 서비스입니다.
- 이를 통해 사용자는 AWS 리소스에 안전하게 접근할 수 있습니다.
- Cognito Identity Pools은 다양한 인증 제공자와 통합되어 유연한 인증 옵션을 제공합니다.



## 2 주요 특징

- **임시 AWS 자격 증명 제공**: 사용자에게 제한된 시간 동안 유효한 AWS 자격 증명을 발급합니다.
- **다양한 인증 제공자 지원**: 
	- Amazon Cognito User Pools
	- 소셜 인증 제공자 (Facebook, Google, Apple 등)
	- SAML 기반 인증 제공자
	- 개발자 인증 시스템
- **세분화된 접근 제어**: IAM 역할을 통해 사용자별로 AWS 리소스에 대한 접근 권한을 세밀하게 제어할 수 있습니다.
- **미인증 접근 지원**: 게스트 사용자에게도 제한된 접근 권한을 부여할 수 있습니다.
- **디바이스 동기화**: 여러 디바이스 간 사용자 데이터를 동기화할 수 있습니다.



## 3 작동 방식

Cognito Identity Pools의 작동 방식은 다음과 같은 단계로 이루어집니다:

1. **인증**:
    - 사용자가 지원되는 인증 제공자(예: Cognito User Pools, Facebook, Google 등)를 통해 로그인합니다.
    - 인증에 성공하면, 인증 제공자로부터 토큰을 받습니다.
2. **토큰 교환**:
    - 애플리케이션은 받은 토큰을 Cognito Identity Pools에 전달합니다.
    - 이 과정은 `AWS.CognitoIdentityCredentials` 객체를 통해 자동으로 처리됩니다.
3. **자격 증명 발급**:
    - Cognito Identity Pools는 전달받은 토큰을 검증합니다.
    - 토큰이 유효한 경우, 임시 AWS 자격 증명을 발급합니다.
    - 이 자격 증명은 AccessKeyId, SecretKey, SessionToken으로 구성됩니다.
4. **리소스 접근**:
    - 애플리케이션은 발급받은 자격 증명을 사용하여 AWS 리소스에 접근합니다.



## 4 코드 예시

```javascript
// AWS SDK 설정
const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';

// Cognito Identity Pool ID 설정
const identityPoolId = 'us-east-1:1234567890abcdef';

// Cognito User Pool에서 받은 ID 토큰 (예시)
const idToken = 'eyJraWQiOiJLTzRVMWZs...';

// Cognito Identity Credentials 설정
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId,
    Logins: {
        'cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXX': idToken
    }
});

// 자격 증명 가져오기
AWS.config.credentials.get((error) => {
    if (error) {
        console.error('자격 증명 가져오기 오류:', error);
        return;
    }

    // 자격 증명 출력
    console.log('Access Key:', AWS.config.credentials.accessKeyId);
    console.log('Secret Key:', AWS.config.credentials.secretAccessKey);
    console.log('Session Token:', AWS.config.credentials.sessionToken);

    // S3 클라이언트 생성
    const s3 = new AWS.S3();

    // S3 버킷의 객체 목록 가져오기
    s3.listObjects({ Bucket: 'my-bucket' }, (err, data) => {
        if (err) {
            console.error('객체 목록 가져오기 오류:', err);
        } else {
            console.log('S3 객체들:', data.Contents);
        }
    });
});
```

- 다음은 Cognito Identity Pools를 사용하여 자격 증명을 얻고, 이를 활용해 S3 버킷에 접근하는 JavaScript 코드 예시입니다
- AWS SDK를 설정하고 리전을 지정합니다.
- Cognito Identity Pool ID를 설정합니다.
- Cognito User Pool에서 받은 ID 토큰을 사용하여 Cognito Identity Credentials를 설정합니다.
- `get()` 메서드를 호출하여 실제 AWS 자격 증명을 가져옵니다.
- 가져온 자격 증명 정보를 콘솔에 출력합니다.
- 이 자격 증명을 사용하여 S3 클라이언트를 생성하고, 버킷의 객체 목록을 가져옵니다.



### 4.1 주의사항

- 이 방식을 통해 애플리케이션은 사용자별로 고유한 임시 AWS 자격 증명을 얻을 수 있습니다.
- 발급된 자격 증명은 일정 시간이 지나면 만료되므로, 주기적으로 새로운 자격 증명을 얻어야 합니다.
- 실제 프로덕션 환경에서는 자격 증명 관리와 보안에 더욱 주의를 기울여야 합니다.



## 5 Cognito Identity Pools vs Cognito User Pools

- Cognito Identity Pools과 Cognito User Pools은 서로 다른 목적을 가진 서비스입니다.
- 아래에서 두 서비스의 주요 차이점을 살펴보겠습니다.



### 5.1 주요 목적

- **Cognito Identity Pools**:
    - AWS 리소스에 대한 임시 접근 권한을 제공합니다.
    - 다양한 인증 제공자와 통합하여 AWS 자격 증명을 발급합니다.
- **Cognito User Pools**:
    - 사용자 디렉토리를 관리하고 인증 기능을 제공합니다.
    - 애플리케이션의 사용자 관리와 인증을 담당합니다.



### 5.2 주요 기능

- **Cognito Identity Pools**:
    - AWS 자격 증명 발급
    - 다양한 인증 제공자 통합
    - 세분화된 접근 제어 (IAM 역할 연결)
- **Cognito User Pools**:
    - 사용자 등록 및 로그인
    - 비밀번호 정책 관리
    - 다중 인증 (MFA) 지원
    - 사용자 프로필 관리



### 5.3 인증 방식

- **Cognito Identity Pools**:
    - 직접적인 인증을 제공하지 않습니다.
    - 다른 인증 제공자의 토큰을 AWS 자격 증명으로 변환합니다.
- **Cognito User Pools**:
    - 자체적인 사용자 인증 시스템을 제공합니다.
    - 사용자명/비밀번호, 소셜 로그인 등의 인증 방식을 지원합니다.



### 5.4 사용 사례

- **Cognito Identity Pools**:
    - 모바일 또는 웹 애플리케이션에서 AWS 리소스에 직접 접근해야 할 때 사용합니다.
    - 예: 사용자별 S3 버킷 접근, Lambda 함수 호출 등
- **Cognito User Pools**:
    - 애플리케이션의 사용자 관리 및 인증이 필요할 때 사용합니다.
    - 예: 사용자 등록, 로그인, 프로필 관리 등



## 6 결론

- Cognito Identity Pools은 다양한 인증 제공자와 통합하여 AWS 리소스에 대한 안전한 접근을 제공합니다.
- Cognito User Pools과 함께 사용하면 강력한 사용자 관리 및 인증 시스템을 구축할 수 있습니다.
- 두 서비스를 적절히 조합하여 사용하면 안전하고 확장 가능한 애플리케이션을 개발할 수 있습니다.
- 각 서비스의 특징과 차이점을 이해하고 프로젝트의 요구사항에 맞게 선택하는 것이 중요합니다.