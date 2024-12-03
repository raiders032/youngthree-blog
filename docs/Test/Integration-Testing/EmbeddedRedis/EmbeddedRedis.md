---
title: "Spring Boot 테스트를 위한 Embedded Redis 완벽 가이드"
description: "Spring Boot 애플리케이션 테스트를 위한 Embedded Redis 설정 방법을 알아봅니다. 임베디드 레디스의 개념, 컨테이너 레디스와의 차이점, 라이브러리 선택부터 동적 포트 설정까지 상세히 다룹니다."
tags: ["REDIS", "SPRING_BOOT", "TEST", "DOCKER", "BACKEND", "CACHE"]
keywords: ["embedded redis", "임베디드 레디스", "스프링부트", "테스트", "통합테스트", "레디스", "redis", "도커", "docker", "캐시", "cache", "테스트 설정"]
draft: false
hide_title: true
---

## 1. Embedded Redis란?

- Embedded Redis는 애플리케이션 개발 시 외부 Redis 서버 없이 애플리케이션 내부에서 실행되는 인메모리 Redis 서버입니다. 다양한 프로그래밍 언어와 프레임워크에서 지원되며, 주로 테스트 환경에서 실제 Redis 서버를 대체하기 위해 사용됩니다.
- 이 글에서는 Kotlin(Java)과 Spring Boot 환경에서의 구현 예시를 다루지만, Python(redis-server-py), Node.js(redis-memory-server) 등 다른 환경에서도 유사한 솔루션들이 존재합니다.

### 1.1 사용 목적
- 독립적인 테스트 환경 구성
- 외부 의존성 없는 테스트 실행
- CI/CD 파이프라인에서의 간편한 테스트
- 로컬 개발 환경 설정 간소화

## 2. Embedded Redis vs Container Redis

### 2.1 Embedded Redis
장점:
- JVM 내부에서 실행되어 추가 프로세스 불필요
- 빠른 시작과 종료
- 테스트 코드와 함께 시작/종료되는 라이프사이클
- 별도의 설치나 설정 불필요

단점:
- 메모리 사용량이 JVM에 포함
- 실제 Redis 버전과 완벽한 동일성 보장 어려움
- OS 의존적인 바이너리 필요

### 2.2 Container Redis (Docker)
장점:
- 실제 Redis와 동일한 환경
- 독립적인 프로세스로 실행
- 다양한 Redis 버전 선택 가능
- 운영 환경과 유사한 설정 가능

단점:
- Docker 설치 필요
- 상대적으로 느린 시작 시간
- 리소스 사용량이 더 많음
- 네트워크 설정 필요

## 3. 사용 가능한 라이브러리

### 3.1 레거시 라이브러리
```xml
<!-- 더 이상 업데이트되지 않는 라이브러리 -->
<dependency>
    <groupId>it.ozimov</groupId>
    <artifactId>embedded-redis</artifactId>
    <version>0.7.3</version>
</dependency>
```

### 3.2 최신 라이브러리
```xml
<!-- 새로운 포크 버전 - 적극 권장 -->
<dependency>
    <groupId>com.github.codemonstur</groupId>
    <artifactId>embedded-redis</artifactId>
    <version>1.4.3</version>
    <scope>test</scope>
</dependency>
```

### 3.3 라이브러리 비교
- `it.ozimov:embedded-redis`
  - 2020년 이후 업데이트 중단
  - 구버전 Redis만 지원
  - M1/M2 Mac 미지원

- `com.github.codemonstur:embedded-redis`
  - 최신 Redis 버전 지원 (6.2.7)
  - ARM64 아키텍처 지원
  - 활발한 유지보수
  - 다양한 OS 지원

## 4. Embedded Redis 설정하기

### 4.1 기본 설정
```kotlin
@TestConfiguration
class TestRedisConfig {
    private lateinit var redisServer: RedisServer
    private var redisPort: Int = 6379

    @PostConstruct
    fun startRedis() {
        redisServer = RedisServer(redisPort)
        redisServer.start()
    }

    @PreDestroy
    fun stopRedis() {
        if (::redisServer.isInitialized) {
            redisServer.stop()
        }
    }
}
```

## 5. 동적 포트 매핑

### 5.1 필요한 이유
- 고정 포트 사용의 문제점:
  - 동시 테스트 실행 시 포트 충돌
  - CI/CD 환경에서의 불안정성
  - 다른 애플리케이션과의 포트 충돌
  - 테스트 병렬 실행 불가

### 5.2 구현 방법
```kotlin
@TestConfiguration
class TestRedisConfig {
    private lateinit var redisServer: RedisServer
    private var redisPort: Int = 0

    @PostConstruct
    fun startRedis() {
        redisPort = findAvailablePort()
        redisServer = RedisServer(redisPort)
        redisServer.start()
    }

    private fun findAvailablePort(): Int {
        return ServerSocket(0).use { socket ->
            socket.localPort
        }
    }

    @Bean
    @Primary
    fun redisConnectionFactory(): RedisConnectionFactory {
        val redisConfig = RedisStandaloneConfiguration().apply {
            hostName = "localhost"
            port = redisPort
        }
        return LettuceConnectionFactory(redisConfig).apply {
            afterPropertiesSet()
        }
    }
}
```

### 5.3 동작 원리
1. `ServerSocket(0)`을 사용하여 시스템이 사용 가능한 포트 자동 할당
2. 할당받은 포트로 Redis 서버 시작
3. 같은 포트를 사용하는 RedisConnectionFactory 생성
4. 테스트 종료 시 자동으로 서버 종료

## 6. 실제 사용 예제

### 6.1 테스트 코드
```kotlin
@SpringBootTest
@Import(TestRedisConfig::class)
class RedisTest {
    
    @Autowired
    private lateinit var redisTemplate: RedisTemplate<String, String>
    
    @Test
    fun `Redis 캐시 작동 테스트`() {
        // given
        val key = "test:key"
        val value = "test value"
        
        // when
        redisTemplate.opsForValue().set(key, value)
        val result = redisTemplate.opsForValue().get(key)
        
        // then
        assertThat(result).isEqualTo(value)
    }
}
```

### 6.2 병렬 테스트 실행
```kotlin
@SpringBootTest
@Import(TestRedisConfig::class)
class ParallelRedisTest {
    
    @Test
    fun `여러 테스트 동시 실행`() {
        // 동적 포트 할당으로 인해 병렬 실행 가능
    }
}
```

## 7. 문제 해결

### 7.1 OS별 주의사항

:::warning
M1/M2 Mac 사용자 주의사항
- 최신 버전의 `com.github.codemonstur:embedded-redis` 사용 필요
- ARM64 아키텍처 지원 확인
:::

### 7.2 메모리 설정
```kotlin
redisServer = RedisServer.builder()
    .port(redisPort)
    .setting("maxmemory 128M")
    .build()
```

## 8. 마치며

- Embedded Redis는 Spring Boot 애플리케이션의 테스트를 위한 효과적인 도구입니다. 
- 특히 동적 포트 할당을 활용하면 안정적이고 독립적인 테스트 환경을 구성할 수 있습니다. 