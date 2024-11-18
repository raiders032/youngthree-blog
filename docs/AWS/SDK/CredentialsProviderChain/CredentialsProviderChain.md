## 1 AWS SDK 기본 자격 증명 제공자 체인 (Java 예시)

- AWS SDK 기본 자격 증명 제공자 체인은 AWS 서비스와 통합된 애플리케이션을 개발할 때 자격 증명을 찾는 순서를 정의합니다. 
- Java SDK는 이러한 자격 증명을 특정 순서에 따라 검색하여 사용합니다.



## 2 Java SDK 자격 증명 검색 순서

### 2.1 Java 시스템 속성

- **Java 시스템 속성**: Java SDK는 먼저 시스템 속성에서 자격 증명을 찾습니다.
	- 속성 이름: `aws.accessKeyId`와 `aws.secretKey`



**설정 예시**

```java
System.setProperty("aws.accessKeyId", "YOUR_ACCESS_KEY_ID");
System.setProperty("aws.secretKey", "YOUR_SECRET_ACCESS_KEY");
```



### 2.2 환경 변수

- **환경 변수**: 시스템 속성에 자격 증명이 없으면 SDK는 환경 변수를 확인합니다.
- 환경 변수 이름: `AWS_ACCESS_KEY_ID`와 `AWS_SECRET_ACCESS_KEY`

```bash
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
```



### 2.3 기본 자격 증명 파일

- **기본 자격 증명 파일**: 환경 변수에도 자격 증명이 없으면 SDK는 공유 자격 증명 파일을 확인합니다.
- 파일 경로: `~/.aws/credentials`



**파일 내용 예시**

```plaintext
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY

[profile_name]
aws_access_key_id = YOUR_PROFILE_ACCESS_KEY_ID
aws_secret_access_key = YOUR_PROFILE_SECRET_ACCESS_KEY
```



### 2.4 Amazon ECS 컨테이너 자격 증명

- **Amazon ECS 컨테이너 자격 증명**: 기본 자격 증명 파일에도 자격 증명이 없으면 SDK는 ECS 컨테이너 내의 자격 증명을 확인합니다.
- ECS 컨테이너 내에서 실행되는 애플리케이션의 경우, 컨테이너 메타데이터 엔드포인트에서 자격 증명을 가져옵니다.



### 2.5 인스턴스 프로파일 자격 증명

- **인스턴스 프로파일 자격 증명**: ECS 컨테이너 자격 증명에도 자격 증명이 없으면 SDK는 EC2 인스턴스의 메타데이터 서비스(IMDS)를 통해 자격 증명을 확인합니다.
- 이는 EC2 인스턴스에 할당된 IAM 역할의 자격 증명을 자동으로 사용하도록 합니다.

```bash
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/role_name
```



## 3 Java SDK 예제 코드

- 아래 예제는 Java SDK가 기본 자격 증명 제공자 체인을 통해 자격 증명을 검색하고 S3 버킷의 객체 목록을 가져오는 코드입니다.

```java
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.S3ObjectSummary;

import java.util.List;

public class S3ListObjects {
    public static void main(String[] args) {
        // 기본 자격 증명 제공자 체인을 사용하여 S3 클라이언트 생성
        AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                .withCredentials(new DefaultAWSCredentialsProviderChain())
                .build();

        // S3 버킷의 객체 목록 가져오기
        List<S3ObjectSummary> objects = s3Client.listObjectsV2("my-bucket").getObjectSummaries();
        for (S3ObjectSummary os : objects) {
            System.out.println(os.getKey());
        }
    }
}
```

- 이 코드는 AWS SDK 기본 자격 증명 제공자 체인을 사용하여 자격 증명을 자동으로 검색하고, S3 클라이언트를 생성하여 S3 버킷의 객체 목록을 출력합니다.



## 4 결론

- AWS SDK 기본 자격 증명 제공자 체인은 여러 자격 증명 소스를 지원하여 개발자가 다양한 환경에서 애플리케이션을 쉽게 배포하고 실행할 수 있도록 합니다. 
- Java SDK는 이러한 자격 증명을 특정 순서에 따라 검색하여, 가장 적합한 자격 증명을 사용합니다. 
- 이를 통해 개발자는 보다 안전하고 유연한 방식으로 AWS 자원에 접근할 수 있습니다. 
