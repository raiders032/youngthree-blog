---
title: "DataSource"
description: "DataSource: 데이터베이스 커넥션 풀의 개념과 필요성, 그리고 스프링에서 기본으로 사용되는 HikariCP의 특징과 장점을 알아봅니다. DataSource 추상화를 통한 유연한 데이터베이스 연결 관리 방법을 설명합니다."
tags: [ "SPRING", "DATABASE", "HIKARICP", "PERFORMANCE", "BACKEND" ]
keywords: [ "커넥션풀", "connection pool", "히카리CP", "HikariCP", "데이터소스", "DataSource", "스프링부트", "Spring Boot", "JDBC", "데이터베이스", "성능최적화", "DB커넥션", "DB연결" ]
draft: false
hide_title: true
---

## 1. 데이터베이스 커넥션의 비용

- 데이터베이스 커넥션을 생성하는 과정은 생각보다 많은 비용이 발생합니다.
- 매 요청마다 새로운 커넥션을 생성한다면 다음과 같은 복잡한 과정을 거쳐야 합니다:
	- DB 드라이버가 TCP/IP 연결 수립 (3-way handshake)
	- DB 드라이버는 TCP/IP 연결을 통해 데이터베이스 인증 과정 수행(DB 계정, 비밀번호 확인 및 부가 정보 확인)
	- DB는 내부 인증 후 세션을 생성하고, 클라이언트에게 세션 정보를 전달
	- DB 드라이버는 최종 커넥션 객체를 생성하고 반환

:::warning[성능 문제]
이러한 과정은 단순한 SQL 실행 시간 외에 추가적인 지연을 발생시키며, 결과적으로 사용자 경험에 부정적인 영향을 미칠 수 있습니다.
:::

## 2. 커넥션 풀의 등장

- 이러한 문제를 해결하기 위해 등장한 것이 바로 '커넥션 풀(Connection Pool)'입니다.

### 2.1 커넥션 풀의 작동 방식

- 애플리케이션 시작 시점에 미리 커넥션을 생성하여 풀(Pool)에 보관합니다.
- 애플리케이션에서 커넥션 요청 시 풀에서 즉시 제공합니다.
- 사용이 완료된 커넥션은 종료하지 않고 풀에 반환합니다.
	- 여기서 주의할 점은 커넥션을 종료하는 것이 아니라 커넥션이 살아있는 상태로 커넥션 풀에 반환하는 것입니다.
- 기본적으로 10개 정도의 커넥션을 유지 (설정 가능)
- 커넥션 풀의 커넥션은 TCP/IP로 DB와 커넥션이 연결되어 있는 상태이기 때문에 언제든지 즉시 SQL을 DB에 전달할 수 있습니다.

### 2.2 커넥션 풀의 장점

1. **성능 향상**
	- 커넥션 생성 시간 단축
	- TCP/IP 연결 비용 감소
	- 데이터베이스 인증 과정 생략
2. **리소스 관리**
	- 커넥션 수를 제한하여 데이터베이스 보호
	- 서버 리소스 사용량 예측 가능

## 3. HikariCP: 스프링의 기본 커넥션 풀

- 스프링 부트 2.0부터는 HikariCP를 기본 커넥션 풀로 채택했습니다.
- 대표적으로 커넥션 풀 오픈소스로 commons-dbcp2, tomcat-jdbc pool, HikariCP 등이 있습니다.
- HikariCP는 성능과 안정성이 우수하며, 스프링 부트에서 기본으로 사용되는 이유가 여기에 있습니다.

### 3.1 주요 특징

```java
// HikariCP 설정 예시
HikariDataSource dataSource = new HikariDataSource();
dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
dataSource.setUsername("user");
dataSource.setPassword("password");
dataSource.setMaximumPoolSize(10);
dataSource.setPoolName("MyPool");
```

- 빠른 성능 (벤치마크에서 타 커넥션 풀 대비 우수)
- 가벼운 용량
- 안정적인 동작
- 편리한 모니터링

### 3.2 HikariCP 동작 방식

:::info[커넥션 풀 초기화 과정]

1. 별도의 스레드에서 커넥션을 생성합니다.
2. 애플리케이션 실행 지연 없이 백그라운드에서 풀 채우기
3. 설정된 최대 풀 사이즈까지 커넥션 유지
   :::

## 4. DataSource를 통한 추상화

- 스프링에서는 `javax.sql.DataSource` 인터페이스를 통해 커넥션 획득 방법을 추상화합니다.

### 4.1 DataSource 인터페이스

```java
public interface DataSource {
   Connection getConnection() throws SQLException;
}
```

- 이 인터페이스의 핵심 기능은 `getConnection()` 메서드로, 이를 통해 커넥션을 획득합니다.
- 대부분의 커넥션 풀은 DataSource 인터페이스를 구현하고 있습니다.
	- 따라서 애플리케이션 코드에서는 DataSource 인터페이스만 사용하면 됩니다.
	- DBCP2, Tomcat JDBC Pool, HikariCP 등의 커넥션 풀 코드를 직접 사용하지 않아도 됩니다.

### 4.2 장점

1. **유연한 구현체 교체**
	- DriverManagerDataSource에서 HikariCP로 변경 시 애플리케이션 코드 수정 불필요
	- 다양한 커넥션 풀 라이브러리 적용 가능
2. **설정과 사용의 분리**
	- DriverManager는 커넥션을 획득할 때 마다 URL, 전달해야 한다.
	- 반면에 DataSource는 설정 클래스에서 한 번만 설정하면, 커넥션 획들 시 단순히 getConnection() 메서드만 호출하면 된다.

### 4.3 예시

```java
// 설정 (Configuration)
@Bean
public DataSource dataSource() {
    HikariDataSource dataSource = new HikariDataSource();
    dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
    dataSource.setUsername("user");
    dataSource.setPassword("password");
    return dataSource;
}

// 사용 (Repository)
@Repository
public class UserRepository {
    private final DataSource dataSource;
    
    public UserRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    public User findById(Long id) {
        try (Connection conn = dataSource.getConnection()) {
            // SQL 실행
        }
    }
}
```

- 설정 클래스에서 DataSource 빈을 생성하고, Repository에서 DataSource를 주입받아 사용합니다.
- 이렇게 하면 설정 변경 시 애플리케이션 코드 수정이 필요 없습니다.

## 5. 커넥션 풀 사이징

- 커넥션 풀의 적절한 크기 설정은 성능에 큰 영향을 미칩니다.

:::tip[풀 사이즈 계산 공식]

- 기본 공식: 커넥션 풀 크기 = (CPU 코어 수 * 2) + 효과적인 디스크 스핀들 수
- 실제 환경에서는 부하 테스트를 통한 최적화 필요
  :::

## 6. 마치며

- 커넥션 풀은 데이터베이스 연결 관리에 있어 필수적인 요소입니다.
- 특히 스프링 부트에서 기본으로 제공하는 HikariCP는 성능과 안정성이 검증되어 있어, 특별한 이유가 없다면 이를 사용하는 것이 좋습니다.
- 데이터베이스 커넥션 관리는 애플리케이션의 성능과 안정성에 직접적인 영향을 미치는 중요한 요소이므로, 커넥션 풀의 동작 원리와 설정 방법을 잘 이해하고 있어야 합니다.