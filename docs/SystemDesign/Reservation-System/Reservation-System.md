##  1 서론

- 본 글에서는 대규모 예약 시스템 설계 시 발생하는 동시성 문제와 해결 방안에 대해 설명합니다.
- 항공권 예약, 공연 티켓팅, 숙박 예약 등 다양한 도메인에서 적용할 수 있는 내용을 다룹니다.
- 실제 시스템 구현에 필요한 구체적인 기술과 패턴을 소개합니다.



##  2 시스템 요구사항 및 규모 설정

- 일일 사용자 수: 100만 명
- 피크 시간대 동시 접속자: 10만 명
- QPS (Query Per Second): 5,000
	- [[TPS-QPS]] 참고
- TPS (Transaction Per Second): 1,000
	- [[TPS-QPS]] 참고
- 데이터 특성:
    - 예약 가능 객실 수: 10만 개
    - 일일 예약 건수: 5만 건
    - 데이터 저장 기간: 1년



##  3 데이터베이스 선택

- 예약 시스템의 특성상 데이터의 정합성이 매우 중요합니다.
- ACID 특성이 보장되어야 하므로 관계형 데이터베이스(RDBMS)를 선택합니다.
- NoSQL과 RDBMS 비교:
    - RDBMS 장점:
        - 트랜잭션 지원
        - 데이터 정합성 보장
        - 복잡한 쿼리 처리 가능
    - RDBMS 단점:
        - 수평적 확장이 어려움
        - 비용이 상대적으로 높음
    - NoSQL 장점:
        - 수평적 확장 용이
        - 높은 처리량
        - 유연한 스키마
    - NoSQL 단점:
        - 제한적인 트랜잭션 지원
        - 일관성 보장이 상대적으로 약함



##  4 동시성 문제 해결

###  4.1 문제 시나리오

- 동일 사용자의 중복 예약:
    - 네트워크 오류로 인한 재시도
    - 사용자의 중복 클릭
- 서로 다른 사용자의 동시 예약:
    - 마지막 남은 1개 객실에 대한 동시 예약 시도
    - 경쟁 상태(Race Condition) 발생



###  4.2 클라이언트 측 해결 방안

- 중복 제출 방지:
    - 예약 버튼 비활성화
    - 로딩 인디케이터 표시
- 멱등성 키 사용:
    - 각 요청에 고유한 식별자 부여
    - 서버에서 중복 요청 필터링



**멱등성 키 구현 예시**

```javascript
const reservationRequest = async (roomId) => {
    const idempotencyKey = generateUUID();
    
    try {
        const response = await axios.post('/api/reservations', {
            roomId,
            idempotencyKey
        });
        return response.data;
    } catch (error) {
        if (error.response.status === 409) {
            // 중복 요청 처리
            return error.response.data;
        }
        throw error;
    }
}
```



###  4.3 데이터베이스 격리 수준

- READ UNCOMMITTED:
    - 더티 리드 발생 가능
    - 예약 시스템에 부적합
- READ COMMITTED:
    - 더티 리드 방지
    - 반복 가능하지 않은 읽기 발생 가능
- REPEATABLE READ:
    - 반복 가능한 읽기 보장
    - 팬텀 리드 발생 가능
- SERIALIZABLE:
    - 가장 강력한 격리 수준
    - 성능 저하가 큼



###  4.4 락(Lock) 전략

####  4.4.1 비관적 락

- 트랜잭션 시작 시점에 락을 획득합니다.
- 동시성이 낮고 충돌이 자주 발생하는 경우 적합합니다.

**비관적 락 구현 예시**
```sql
BEGIN TRANSACTION;

SELECT * FROM rooms 
WHERE id = :roomId 
FOR UPDATE;

UPDATE rooms 
SET availability = availability - 1
WHERE id = :roomId 
AND availability > 0;

INSERT INTO reservations (room_id, user_id, created_at)
VALUES (:roomId, :userId, NOW());

COMMIT;
```



####  4.4.2 낙관적 락

- 충돌이 발생하지 않을 것이라 가정하고 버전 정보를 이용합니다.
- 동시성이 높고 충돌이 적은 경우 적합합니다.

**낙관적 락 구현 예시**
```java
@Entity
public class Room {
    @Id
    private Long id;
    
    @Version
    private Long version;
    
    private Integer availability;
    
    public void decreaseAvailability() {
        if (availability > 0) {
            availability--;
        } else {
            throw new NoAvailabilityException();
        }
    }
}
```



####  4.4.3 데이터베이스 제약조건

- 유니크 제약조건을 활용한 중복 예약 방지:
    - 복합 유니크 키 사용
    - 자연스러운 데이터 정합성 보장

**테이블 생성 예시**
```sql
CREATE TABLE reservations (
    id BIGINT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT unique_reservation UNIQUE (room_id, date)
);
```



##  5 시스템 확장성 확보

###  5.1 데이터베이스 샤딩

- 데이터를 여러 데이터베이스에 분산 저장합니다.
- 샤딩 키 선택이 중요합니다:
    - 지역 기반 샤딩
    - 시간 기반 샤딩
    - 해시 기반 샤딩

**샤딩 구현 예시**
```java
public class ShardingRouter {
    private static final int SHARD_COUNT = 4;
    
    public String getShardKey(Long roomId) {
        return "shard_" + (roomId % SHARD_COUNT);
    }
}
```



###  5.2 캐싱 전략

- 읽기 성능 향상을 위한 캐시 도입:
    - Redis 활용
    - 객실 정보 캐싱
    - 예약 가능 여부 캐싱

**Redis 캐시 구현 예시**
```java
@Service
public class RoomAvailabilityService {
    private final RedisTemplate<String, Integer> redisTemplate;
    private final RoomRepository roomRepository;
    
    public Integer getAvailability(Long roomId) {
        String cacheKey = "room:availability:" + roomId;
        Integer availability = redisTemplate.opsForValue().get(cacheKey);
        
        if (availability == null) {
            availability = roomRepository.getAvailability(roomId);
            redisTemplate.opsForValue().set(cacheKey, availability, 1, TimeUnit.HOURS);
        }
        
        return availability;
    }
}
```



##  6 서비스 간 데이터 일관성

- 분산 트랜잭션 처리:
    - Saga 패턴 적용
    - 보상 트랜잭션 구현
- 이벤트 기반 아키텍처:
    - 메시지 큐 활용
    - 멱등성 보장

**Saga 패턴 구현 예시**
```java
@Service
public class ReservationSaga {
    public void processReservation(ReservationRequest request) {
        try {
            // 1단계: 예약 생성
            Reservation reservation = reservationService.create(request);
            
            // 2단계: 결제 처리
            Payment payment = paymentService.process(reservation);
            
            // 3단계: 알림 발송
            notificationService.send(reservation);
            
        } catch (Exception e) {
            // 보상 트랜잭션 실행
            compensate(request);
            throw e;
        }
    }
    
    private void compensate(ReservationRequest request) {
        // 각 단계별 보상 트랜잭션 실행
    }
}
```



##  7 모니터링 및 알림

- 시스템 상태 모니터링:
    - 예약 성공/실패 비율
    - 동시성 충돌 발생 빈도
    - 응답 시간 분포
- 이상 징후 탐지:
    - 임계치 기반 알림
    - 자동 복구 메커니즘



##  8 결론

- 대규모 예약 시스템 설계 시 동시성 제어가 핵심입니다.
- 다양한 기술과 패턴을 조합하여 최적의 해결책을 도출해야 합니다.
- 시스템 규모와 특성에 따라 적절한 전략을 선택하는 것이 중요합니다.
- 지속적인 모니터링과 개선이 필요합니다.