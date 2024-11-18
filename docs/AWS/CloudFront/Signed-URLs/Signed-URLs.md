## 1 CloudFront Signed URL의 이해와 활용

- CloudFront Signed URL은 Amazon CloudFront를 통해 배포되는 프리미엄 또는 비공개 콘텐츠에 대한 안전한 액세스를 제공하는 강력한 도구입니다.
- 이 기능을 통해 전 세계 사용자에게 제한된 액세스 권한을 가진 콘텐츠를 효과적으로 배포할 수 있습니다.



## 2 CloudFront Signed URL의 구성 요소

- CloudFront Signed URL에는 다음과 같은 핵심 정보가 포함됩니다:
	- **만료 시간**: URL의 유효 기간을 지정합니다.
	- **IP 범위 제한**: 특정 IP 주소 또는 범위로 액세스를 제한할 수 있습니다.
	- **리소스 경로**: 접근 가능한 파일 또는 콘텐츠를 나타냅니다.
	- **서명**: URL의 무결성을 보장하는 암호화된 서명입니다.



## 3 CloudFront Signed URL 생성 및 사용 프로세스

CloudFront Signed URL의 생성 및 사용 과정은 다음과 같습니다:

1. **애플리케이션에서 Signed URL 생성**:
	- 애플리케이션 서버는 AWS SDK를 사용하여 CloudFront Signed URL을 생성합니다.
	- 이 과정에서 애플리케이션은 필요한 정책(만료 시간, IP 범위 등)을 포함시킵니다.
2. **클라이언트에게 Signed URL 전달**:
	- 생성된 Signed URL은 인증 및 인가 과정을 거친 클라이언트에게 반환됩니다.
3. **클라이언트의 콘텐츠 요청**:
	- 클라이언트는 받은 Signed URL을 사용하여 CloudFront에 콘텐츠를 요청합니다.
4. **CloudFront의 요청 처리**:
	- CloudFront는 Signed URL의 유효성을 검증합니다.
	- 유효한 경우, 요청된 콘텐츠를 가장 가까운 엣지 로케이션에서 제공합니다.
5. **S3에서 콘텐츠 가져오기**:
	- 만약 요청된 콘텐츠가 엣지 로케이션에 캐시되어 있지 않다면, CloudFront는 Origin Access Control(OAC)을 통해 S3 버킷에서 해당 객체를 가져옵니다.
6. **클라이언트에게 콘텐츠 전달**:
	- CloudFront는 요청된 콘텐츠를 클라이언트에게 안전하게 전달합니다.



## 4 CloudFront Signed URL의 사용

- 사용자는 받은 Signed URL을 통해 콘텐츠에 액세스 요청을 보냅니다.
- CloudFront는 URL의 서명을 확인하고 포함된 정책을 검사합니다.
- 유효한 경우, CloudFront는 가장 가까운 엣지 로케이션에서 요청된 콘텐츠를 제공합니다.



## 5 CloudFront Signed URL의 장점

- **글로벌 배포**: CloudFront의 전 세계 엣지 네트워크를 활용하여 낮은 지연 시간으로 콘텐츠를 제공합니다.
- **높은 보안성**: URL에 포함된 서명과 정책으로 무단 액세스를 방지합니다.
- **유연한 액세스 제어**: IP 제한, 만료 시간 등을 통해 세밀한 액세스 제어가 가능합니다.
- **캐싱 이점**: CloudFront의 캐싱 기능을 활용하여 성능을 향상시킵니다.



## 6 CloudFront Signed URL vs S3 Pre-Signed URL

CloudFront Signed URL은 S3 Pre-Signed URL과 다음과 같은 차이점이 있습니다:

- **범위**
	- CloudFront Signed URL은 일반적으로 CloudFront 배포를 통한 단일 파일에 대한 액세스를 제공합니다. 
	- 여러 파일에 대한 액세스는 CloudFront Signed Cookies를 통해 제공됩니다.
	- S3 Pre-Signed URL도 마찬가지로 일반적으로 단일 S3 객체에 대한 액세스를 제공합니다.
- **성능**
	- CloudFront Signed URL은 글로벌 엣지 네트워크를 활용하여 더 빠른 콘텐츠 전송이 가능하지만, S3 Pre-Signed URL은 S3에 직접 액세스하므로 지역적 제한이 있을 수 있습니다.
- **보안 기능**
	- CloudFront Signed URL은 IP 범위 제한, 경로 기반 액세스 등 더 다양한 보안 옵션을 제공합니다.
- **사용 사례**
	- CloudFront Signed URL은 글로벌 콘텐츠 배포와 프리미엄 콘텐츠 액세스에 적합하며, S3 Pre-Signed URL은 임시 파일 업로드/다운로드에 더 적합합니다.



## 7 결론

- CloudFront Signed URL은 안전하고 효율적인 글로벌 콘텐츠 배포를 위한 강력한 도구입니다.
- 높은 보안성, 유연한 액세스 제어, 글로벌 성능 최적화를 제공하여 다양한 사용 사례에 적합합니다.
- S3 Pre-Signed URL과 비교하여 더 복잡하지만, 대규모 콘텐츠 배포와 고급 액세스 제어가 필요한 경우에 이상적인 선택입니다.