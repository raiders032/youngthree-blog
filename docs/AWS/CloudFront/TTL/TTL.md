## 1 AWS CloudFront Caching TTL 개요

- TTL(Time to Live)은 객체가 CloudFront 캐시에 머무는 시간을 결정합니다.
- 적절한 TTL 설정은 콘텐츠의 신선도와 원본 서버 부하 사이의 균형을 유지하는 데 중요합니다.
- CloudFront는 다양한 방법으로 TTL을 설정하고 제어할 수 있습니다.



## 2 CloudFront TTL 설정 우선순위

- CloudFront는 오리진 서버로부터 받은 응답 헤더와 자체 캐시 동작(behavior) 설정을 조합하여 객체의 TTL을 결정합니다.
- 이 과정에서 CloudFront는 정해진 우선순위에 따라 TTL 값을 선택합니다.
- 결정된 TTL 만큼 객체를 캐시에 저장하고, 이 기간 동안 후속 요청에 대해 캐시된 객체를 제공합니다.



CloudFront는 다음 우선순위에 따라 TTL을 결정합니다:

1. `Cache-Control: max-age` 지시문 (가장 높은 우선순위)
2. `Cache-Control: s-maxage` 지시문
3. `Expires` 헤더
4. CloudFront 캐시 동작(behavior)의 기본 TTL 설정 (가장 낮은 우선순위)



**주의:**

- `Cache-Control: max-age`는 `Expires` 헤더보다 우선적으로 사용됩니다.



## 3 TTL 설정 및 캐싱 메커니즘 흐름

- 클라이언트, CloudFront, 오리진 서버 간의 상호작용을 통한 TTL 설정 및 캐싱 메커니즘의 흐름은 다음과 같습니다:



**흐름**

- 클라이언트 요청:
    - 클라이언트가 CloudFront에 콘텐츠를 요청합니다.
- CloudFront 캐시 확인:
    - CloudFront는 요청된 객체가 캐시에 있는지 확인합니다.
    - 캐시에 있고 TTL이 만료되지 않았다면, CloudFront는 캐시된 객체를 클라이언트에게 반환합니다.
- 오리진 서버 요청:
    - 객체가 캐시에 없거나 TTL이 만료되었다면, CloudFront는 오리진 서버에 요청을 보냅니다.
- 오리진 서버 응답:
    - 오리진 서버는 요청된 객체와 함께 캐시 제어 헤더를 포함하여 응답합니다.
    - 주요 캐시 제어 헤더:
        - `Cache-Control: max-age=<seconds>`
        - `Cache-Control: s-maxage=<seconds>`
        - `Expires: <http-date>`
- CloudFront TTL 결정:
    - CloudFront는 오리진 서버의 응답 헤더와 자체 캐시 동작 설정을 바탕으로 TTL을 결정합니다.
    - 우선순위에 따라 적절한 TTL 값을 선택합니다.
- 객체 캐싱 및 클라이언트 응답:
    - CloudFront는 결정된 TTL에 따라 객체를 캐시합니다.
    - 캐시된 객체를 클라이언트에게 반환합니다.
- 후속 요청 처리:
    - TTL 기간 동안 같은 객체에 대한 후속 요청은 캐시에서 직접 제공됩니다.
    - TTL이 만료되면 CloudFront는 오리진 서버에 재검증 요청을 보내거나 새로운 콘텐츠를 요청합니다.


## 4 오리진 응답 헤더를 통한 TTL 제어

- 오리진 서버는 응답 헤더를 통해 CloudFront의 캐싱 동작을 제어할 수 있습니다:



### 4.1 Cache-Control 헤더

- `Cache-Control: max-age=<seconds>`는 가장 선호되는 TTL 설정 방법입니다.
- 예: `Cache-Control: max-age=3600` (1시간 동안 캐시)



### 4.2 Expires 헤더

- `Cache-Control: max-age`가 없을 경우 사용됩니다.
- 예: `Expires: Wed, 21 Oct 2023 07:28:00 GMT`



### 4.3 추가 Cache-Control 지시문

- `no-cache`: 재검증 없이 캐시된 응답을 사용하지 않도록 지시
- `no-store`: 응답을 캐시하지 않도록 지시
- `must-revalidate`: TTL이 만료된 후 오리진 서버에 재검증을 요청



## 5 CloudFront 캐시 동작(Behavior) 설정

CloudFront 콘솔에서 캐시 동작을 설정하여 TTL을 추가로 제어할 수 있습니다:



### 5.1 객체 캐싱(Object Caching) 설정

- **Use origin cache headers**: 
	- 오리진 서버의 캐시 헤더를 그대로 사용합니다.
	- 오리진 서버가 일관된 캐시 정책을 가지고 있을 때 유용합니다.
- **Customize**:
	- 최소 TTL, 최대 TTL, 기본 TTL을 직접 설정합니다.
	- 오리진 서버의 캐시 헤더와 함께 작동하여 TTL의 범위를 제한합니다.



### 5.2 Customize 옵션 상세 설정

- **최소 TTL (Minimum TTL)**:
	- 객체가 캐시에 머무는 최소 시간을 정의합니다.
	- 오리진의 `Cache-Control: max-age` 값이 이 값보다 작아도 최소 TTL이 적용됩니다.
	- 예: 최소 TTL이 60초일 때 오리진이 `max-age=30`을 반환하면, 60초 동안 캐시됩니다.
- **최대 TTL (Maximum TTL)**:
	- 객체가 캐시에 머무는 최대 시간을 제한합니다.
	- 오리진의 `Cache-Control: max-age` 값이 이 값보다 크면 최대 TTL이 적용됩니다.
	- 예: 최대 TTL이 3600초일 때 오리진이 `max-age=7200`을 반환하면, 3600초 동안만 캐시됩니다.
- **기본 TTL (Default TTL)**:
	- 오리진 응답에 `Cache-Control: max-age`나 `Expires` 헤더가 없을 때 사용됩니다.
	- 예: 기본 TTL이 300초이고 오리진이 캐시 헤더를 포함하지 않으면, 300초 동안 캐시됩니다.



## 6 TTL 설정 예시 및 시나리오

### 6.1 오리진 서버가 일관된 캐시 헤더를 제공하는 경우

- **설정:**
	- Object Caching: "Use origin cache headers"
	- 오리진 서버 응답: `Cache-Control: max-age=3600`
- **결과:** 
	- 객체는 1시간 동안 캐시됩니다.



### 6.2 TTL 범위를 제한하고 싶은 경우

- **설정:**
	- Object Caching: "Customize"
	- 최소 TTL: 60초
	- 최대 TTL: 3600초 (1시간)
	- 기본 TTL: 300초 (5분)
- **시나리오 1:**
	- 오리진 서버 응답: `Cache-Control: max-age=30`
	- 결과: 최소 TTL인 60초 동안 캐시됩니다.
- **시나리오 2:**
	- 오리진 서버 응답: `Cache-Control: max-age=7200`
	- 결과: 최대 TTL인 3600초 (1시간) 동안 캐시됩니다.
- **시나리오 3:**
	- 오리진 서버 응답: 캐시 헤더 없음
	- 결과: 기본 TTL인 300초 (5분) 동안 캐시됩니다.



## 7 TTL 설정 전략 및 고려사항

- **정적 콘텐츠:**
	- 긴 TTL 설정 (예: 1주일 또는 1개월)
	- 오리진 서버 설정: `Cache-Control: max-age=2592000` (30일)
- **자주 변경되는 동적 콘텐츠:**
	- 짧은 TTL 설정 (예: 5분 또는 1시간)
	- 오리진 서버 설정: `Cache-Control: max-age=300` (5분)
- **개인화된 콘텐츠:**
	- TTL을 0으로 설정하거나 캐싱 비활성화
	- 오리진 서버 설정: `Cache-Control: no-store, no-cache`
- **API 응답:**
	- 짧은 TTL과 함께 조건부 요청 사용
	- 오리진 서버 설정: `Cache-Control: max-age=60, must-revalidate`



## 8 결론

- CloudFront의 TTL 설정은 오리진 서버의 캐시 헤더와 CloudFront의 캐시 동작 설정의 조합으로 결정됩니다.
- 오리진 서버, CloudFront, 클라이언트 간의 상호작용을 이해하는 것이 효과적인 캐싱 전략 수립에 중요합니다.
- 콘텐츠의 특성과 업데이트 빈도에 따라 적절한 TTL 전략을 선택해야 합니다.
- 정기적인 모니터링과 최적화를 통해 캐싱 효율성과 콘텐츠 신선도 사이의 균형을 유지해야 합니다.