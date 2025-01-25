##  1 서론

- API 설계에서 멱등성(Idempotency)은 매우 중요한 개념입니다.
- 특히 결제, 예약과 같은 중요한 비즈니스 트랜잭션에서 필수적입니다.
- 본 글에서는 멱등성 키의 개념과 구현 방법에 대해 상세히 다룹니다.



##  2 멱등성이란?

###  2.1 기본 개념

- 멱등성은 동일한 연산을 여러 번 수행해도 결과가 달라지지 않는 성질입니다.
- 수학에서 f(f(x)) = f(x)를 만족하는 성질과 같습니다.
- API에서는 "같은 요청을 여러 번 보내도 서버의 상태가 같게 유지되는 것"을 의미합니다.



###  2.2 HTTP 메서드별 멱등성

- 기본적으로 멱등성을 가진 메서드:
    - GET: 데이터 조회만 수행
    - PUT: 전체 리소스를 매번 동일하게 덮어씀
    - DELETE: 이미 삭제된 리소스를 다시 삭제해도 결과는 동일
- 멱등성이 없는 메서드:
    - POST: 매 요청마다 새로운 리소스 생성 가능



##  3 멱등성이 필요한 이유

###  3.1 네트워크 불안정성

- 클라이언트가 응답을 받지 못하는 상황:
    - 네트워크 타임아웃
    - 연결 끊김
    - 서버 에러
- 클라이언트는 요청이 성공했는지 알 수 없어 재시도가 필요합니다.



###  3.2 사용자 행동

- 사용자가 여러 번 버튼을 클릭하는 경우
- 브라우저 새로고침
- 뒤로가기 후 다시 시도



##  4 멱등성 키 구현

###  4.1 클라이언트 구현

**기본 구현 예시**

```javascript
class IdempotencyKeyManager {
    constructor() {
        this.keyMap = new Map();
    }

    async executeWithIdempotency(apiCall, payload) {
        const idempotencyKey = this.generateKey();
        
        try {
            const response = await axios.post('/api/endpoint', {
                ...payload,
                idempotencyKey
            }, {
                headers: {
                    'Idempotency-Key': idempotencyKey
                }
            });
            
            this.keyMap.set(idempotencyKey, response.data);
            return response.data;
            
        } catch (error) {
            if (error.response?.status === 409) {
                // 중복 요청인 경우 이전 응답 반환
                return this.keyMap.get(idempotencyKey);
            }
            throw error;
        }
    }

    generateKey() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
```



###  4.2 서버 구현

**Redis를 사용한 구현 예시**

```java
@Service
public class IdempotencyService {
    private final RedisTemplate<String, String> redisTemplate;
    private static final long KEY_EXPIRATION_DAYS = 15;

    @Async
    public <T> T executeWithIdempotency(String idempotencyKey, 
                                      Supplier<T> operation) {
        String lockKey = "lock:" + idempotencyKey;
        String resultKey = "result:" + idempotencyKey;
        
        // 이미 처리된 요청인지 확인
        String cachedResult = redisTemplate.opsForValue().get(resultKey);
        if (cachedResult != null) {
            return objectMapper.readValue(cachedResult, new TypeReference<>() {});
        }
        
        // 락 획득 시도
        Boolean acquired = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, "locked", 
                        Duration.ofMinutes(5));
        
        if (acquired != null && acquired) {
            try {
                // 실제 비즈니스 로직 실행
                T result = operation.get();
                
                // 결과 캐시 저장
                redisTemplate.opsForValue()
                    .set(resultKey, 
                         objectMapper.writeValueAsString(result),
                         Duration.ofDays(KEY_EXPIRATION_DAYS));
                
                return result;
            } finally {
                redisTemplate.delete(lockKey);
            }
        } else {
            throw new DuplicateRequestException();
        }
    }
}
```



###  4.3 데이터베이스 구현

**관계형 데이터베이스를 사용한 구현 예시**

```sql
CREATE TABLE idempotency_keys (
    key VARCHAR(300) PRIMARY KEY,
    result TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    status VARCHAR(20)
);

CREATE INDEX idx_expires_at ON idempotency_keys(expires_at);
```



##  5 멱등성 키 관리

###  5.1 키 생성 전략

- UUID 사용:
    - 충돌 가능성이 극히 낮음
    - 분산 시스템에서 안전
- 타임스탬프 + 랜덤값:
    - 시간 순서 파악 가능
    - 디버깅이 용이



###  5.2 키 유효기간 관리

- 일반적으로 15일 정도의 유효기간 설정
- 만료된 키는 자동 삭제되도록 구현
- 스케줄러를 통한 정기적인 정리



###  5.3 저장소 선택

- Redis:
    - 빠른 응답 속도
    - 자동 만료 기능
    - 간단한 구현
- 관계형 데이터베이스:
    - 트랜잭션 지원
    - 복잡한 쿼리 가능
    - 영구 저장 필요 시



##  6 모범 사례

###  6.1 에러 처리

```javascript
async function handlePayment(paymentData) {
    const idempotencyKey = generateUUID();
    
    try {
        const response = await paymentService.process(paymentData, {
            headers: {
                'Idempotency-Key': idempotencyKey
            },
            retry: {
                maxAttempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                }
            }
        });
        
        return response;
        
    } catch (error) {
        if (error.response?.status === 409) {
            // 중복 요청 처리
            return error.response.data;
        }
        
        if (error.response?.status === 500) {
            // 서버 에러의 경우 재시도 필요 여부 확인
            return await checkTransactionStatus(idempotencyKey);
        }
        
        throw error;
    }
}
```



###  6.2 성능 최적화

- 인메모리 캐시 사용
- 인덱스 최적화
- 주기적인 만료 데이터 정리



##  7 결론

- 멱등성 키는 안전한 API 설계의 핵심 요소입니다.
- 특히 금전적 트랜잭션이나 중요한 비즈니스 로직에서 필수적입니다.
- 적절한 구현과 관리가 중요합니다.
- 시스템의 특성에 맞는 저장소와 만료 정책을 선택해야 합니다.