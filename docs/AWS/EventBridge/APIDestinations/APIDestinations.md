## 1 EventBridge API Destinations 소개

- Amazon EventBridge API destinations는 이벤트 버스 규칙이나 파이프의 대상으로 HTTP 엔드포인트를 호출할 수 있게 해주는 기능입니다
- AWS 서비스들 간의 이벤트 라우팅뿐만 아니라 SaaS 애플리케이션 및 AWS 외부의 애플리케이션과도 API 호출을 통해 연동할 수 있습니다
- CONNECT와 TRACE를 제외한 모든 HTTP 메서드를 사용할 수 있습니다
- 가장 일반적으로 사용되는 HTTP 메서드는 PUT과 POST입니다
- 입력 변환기(Input Transformer)를 사용하여 특정 HTTP 엔드포인트의 파라미터에 맞게 이벤트를 커스터마이징할 수 있습니다



## 2 주요 제한사항

- API destinations는 프라이빗 대상을 지원하지 않습니다
    - VPC 인터페이스 엔드포인트 미지원
    - 프라이빗 HTTPS API 미지원
    - 프라이빗 네트워크 및 애플리케이션 로드밸런서 미지원
- API destination 엔드포인트에 대한 요청은 최대 클라이언트 실행 시간이 5초입니다
- 타임아웃된 요청은 재시도 정책에 구성된 최대값까지 재시도됩니다
    - 기본 최대값: 24시간, 185회
- 최대 재시도 횟수 초과 시:
    - Dead-letter 큐가 구성되어 있다면 해당 큐로 전송
    - 구성되어 있지 않다면 이벤트는 삭제됨



## 3 서비스 연결 역할

- API destination용 연결을 생성하면 서비스 연결 역할이 계정에 추가됩니다
- 역할 이름: AWSServiceRoleForAmazonEventBridgeApiDestinations
- EventBridge는 이 역할을 사용하여:
    - Secrets Manager에 시크릿을 생성하고 저장
    - 시크릿 관리에 필요한 최소한의 권한만 부여
    - 계정 내 연결과 관련된 시크릿만 관리 가능



## 4 HTTP 헤더 처리

### 4.1 기본 포함되는 헤더

- EventBridge는 다음 헤더를 모든 요청에 기본적으로 포함합니다:
    - User-Agent: Amazon/EventBridge/ApiDestinations
    - Content-Type: application/json; charset=utf-8 (기본값)
    - Range: bytes=0-1048575
    - Accept-Encoding: gzip,deflate
    - Connection: close
    - Content-Length: 엔티티 본문의 크기(바이트)
    - Host: 요청이 전송되는 서버의 호스트명과 포트



### 4.2 제한되는 헤더

- 다음 헤더는 오버라이드할 수 없습니다:
    - User-Agent
    - Range



## 5 오류 처리

### 5.1 재시도 정책

- 다음 오류 코드의 경우 재시도됩니다:
    - 409: 충돌
    - 429: 너무 많은 요청
    - 5xx: 서버 오류
- 다음 오류 코드는 재시도되지 않습니다:
    - 1xx: 정보
    - 2xx: 성공
    - 3xx: 리다이렉션
    - 4xx: 클라이언트 오류 (429 제외)



### 5.2 재시도 간격

- EventBridge는 표준 HTTP 응답 헤더인 Retry-After를 읽어 재시도 대기 시간을 결정합니다
- 정의된 재시도 정책과 Retry-After 헤더 중 더 보수적인 값을 선택합니다
- Retry-After 값이 음수인 경우 해당 이벤트에 대한 재시도를 중단합니다



## 6 이벤트 전송 최적화

- 초당 호출 비율이 생성되는 호출 수보다 훨씬 낮게 설정되면 이벤트가 24시간 재시도 시간 내에 전송되지 않을 수 있습니다
- 예시:
    - 초당 10회 호출로 설정했으나 초당 수천 개의 이벤트가 생성되는 경우
    - 24시간을 초과하는 이벤트 백로그가 빠르게 쌓일 수 있음
- 이벤트 손실 방지를 위한 권장사항:
    - Dead-letter 큐 설정
    - 실패한 호출의 이벤트를 나중에 처리할 수 있도록 함



## 7 모범 사례

- 적절한 초당 호출 비율 설정하기
- Dead-letter 큐 구성하여 실패한 이벤트 보존하기
- 타임아웃과 재시도 정책 신중하게 설정하기
- 헤더 처리 시 제한사항 고려하기
- 프라이빗 엔드포인트 제한사항 유의하기