---
title: "JDBC"
description: "자바 애플리케이션에서 데이터베이스를 효율적으로 다루기 위한 JDBC의 개념과 사용법을 알아봅니다. JDBC의 등장 배경부터 Connection Pool, DataSource까지 데이터베이스 연결 관리 방법에 대해 상세히 설명합니다."
tags: [ "JDBC", "DATABASE", "JAVA", "BACKEND", "CONNECTION_POOL", "DATA_SOURCE" ]
keywords: [ "JDBC", "Java Database Connectivity", "자바 데이터베이스 연결", "커넥션 풀", "Connection Pool", "데이터소스", "DataSource", "ORM", "SQL Mapper", "MyBatis", "JPA", "하이버네이트", "Hibernate", "DriverManager", "자바", "Java", "데이터베이스", "Database", "DB" ]
draft: false
hide_title: true
---

## 1. JDBC 개요

- JDBC(Java Database Connectivity)는 자바에서 데이터베이스에 접속할 수 있도록 하는 자바 API입니다.
- JDBC는 데이터베이스에서 자료를 쿼리하거나 업데이트하는 방법을 제공합니다.
- JDBC는 표준 인터페이스로, 다양한 데이터베이스와 연동할 수 있게 해줍니다.

### 1.1 JDBC의 등장 이유

- 애플리케이션을 개발할 때 중요한 데이터는 대부분 데이터베이스에 보관합니다.
- 클라이언트가 애플리케이션 서버를 통해 데이터를 저장하거나 조회하면, 애플리케이션 서버는 다음 과정을 통해서 데이터베이스를 사용합니다.

#### 1.1.1 데이터베이스 사용 과정

- 커넥션 연결: 주로 TCP/IP를 사용해서 커넥션을 연결합니다.
- SQL 전달: 애플리케이션 서버는 DB가 이해할 수 있는 SQL을 연결된 커넥션을 통해 DB에 전달합니다.
- 결과 응답: DB는 전달된 SQL을 수행하고 그 결과를 응답합니다. 애플리케이션 서버는 응답 결과를 활용합니다.

#### 1.1.2 데이터베이스 변경시 문제점

- 각각의 데이터베이스마다 커넥션을 연결하는 방법, SQL을 전달하는 방법, 그리고 결과를 응답 받는 방법이 모두 다릅니다.
- 데이터베이스를 다른 종류의 데이터베이스로 변경하면 애플리케이션 서버에 개발된 데이터베이스 사용 코드도 함께 변경해야 합니다.
- 개발자가 각각의 데이터베이스마다 커넥션 연결, SQL 전달, 그리고 그 결과를 응답 받는 방법을 새로 학습해야 합니다.
- 이러한 문제점을 해결하기 위해 JDBC라는 표준이 만들어졌습니다.

:::info
JDBC 이전에는 개발자가 Oracle, MySQL, PostgreSQL 등 각 데이터베이스별로 다른 방식의 코드를 작성해야 했습니다. JDBC는 이러한 문제를 해결하기 위해 표준 인터페이스를 제공합니다.
:::

### 1.2 JDBC 인터페이스

- JDBC는 대표적으로 아래 3가지 인터페이스를 제공합니다.
	- [java.sql.Connection](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/Connection.html):
	  데이터베이스와의 연결을 담당합니다.
	- [java.sql.Statement](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/Statement.html): SQL 쿼리를
	  실행하기 위한 인터페이스입니다.
	- [java.sql.ResultSet](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/ResultSet.html): SQL 쿼리 실행
	  결과를 담는 객체입니다.
- 개발자는 이 표준 인터페이스를 사용해 데이터베이스를 사용하면 됩니다.

### 1.3 JDBC 구현체

- JDBC 인터페이스만으로는 기능이 동작하지 않습니다. 이를 구현한 구현체가 필요합니다.
- 각각의 DB 벤더는 자신의 DB에 맞도록 JDBC 인터페이스를 구현해 제공하며 이를 `JDBC 드라이버`라고 합니다.
- 예를 들어서 MySQL DB에 접근 할 수 있는 것은 MySQL JDBC 드라이버라 하고, Oracle DB에 접근할 수 있는 것은 Oracle JDBC 드라이버라 합니다.

### 1.4 JDBC의 장점

- 애플리케이션 로직이 JDBC 인터페이스에 의존하기 때문에 다른 DB로 변경하는 경우 애플리케이션 로직 코드의 변경 없이 드라이버만 변경하면 됩니다.
- 과거 각각의 DB 사용법을 익혀야 했지만 표준 API인 JDBC를 사용하므로 개발자는 JDBC 인터페이스 사용법만 학습하면 됩니다.

### 1.5 한계점

- JDBC의 등장으로 많은 것이 편리해졌지만, 각각의 데이터베이스마다 SQL, 데이터타입 등의 일부 사용법이 다릅니다.
- ANSI SQL이라는 표준이 있기는 하지만 일반적인 부분만 공통화했기 때문에 한계가 있습니다.
- 결국 데이터베이스를 변경하면 JDBC 코드는 변경하지 않아도 되지만 SQL은 해당 데이터베이스에 맞도록 변경해야합니다.
	- JPA(Java Persistence API)를 사용하면 이렇게 각각의 데이터베이스마다 다른 SQL을 정의해야 하는 문제도 많은 부분 해결할 수 있습니다.
- JDBC는 1997년에 출시될 정도로 오래된 기술이고, 사용하는 방법도 복잡합니다.
	- 그래서 최근에는 JDBC를 직접 사용하기 보다는 JDBC를 편리하게 사용하는 다양한 기술이 존재합니다.

## 2. ORM과 SQL Mapper

- 최근에는 JDBC를 직접 사용하기 보다 ORM이나 SQL Mapper를 사용합니다.
- 이 기술들도 내부에서는 모두 JDBC를 사용합니다.

### 2.1 SQL Mapper

- SQL Mapper는 SQL만 직접 작성하면 나머지 번거로운 일은 SQL Mapper가 대신 해결해줍니다.
	- 결과를 객체로 편리하게 매핑해줍니다.
- 대표적으로 스프링 JdbcTemplate, MyBatis가 있습니다.

#### 2.1.1 SQL Mapper의 장점

- JDBC를 편리하게 사용하도록 도와줍니다.
- SQL 응답 결과를 객체로 편리하게 변환해줍니다.
- JDBC의 반복 코드를 제거해줍니다.
- SQL Mapper는 SQL만 작성할 줄 알면 금방 배워서 사용할 수 있습니다.

#### 2.1.2 SQL Mapper의 단점

- 개발자가 SQL을 직접 작성해야합니다.
- 데이터베이스 변경 시 SQL 쿼리를 수정해야 할 수 있습니다.

### 2.2 ORM

- ORM은 객체를 관계형 데이터베이스 테이블과 매핑해주는 기술입니다.
- JPA는 자바 진영의 ORM 표준 인터페이스이고, 이것을 구현한 것으로 하이버네이트와 이클립스 링크 등의 구현 기술이 있습니다.
	- 스프링 데이터 JPA, Querydsl은 JPA를 더 편리하게 사용할 수 있게 도와주는 프로젝트입니다.

#### 2.2.1 ORM의 장점

- 개발자는 반복적인 SQL을 직접 작성하지 않고, ORM 기술이 개발자 대신에 SQL을 동적으로 만들어 실행해줍니다.
- 각각의 데이터베이스마다 다른 SQL을 사용하는 문제도 중간에서 해결해줍니다.
- 객체 중심의 개발이 가능하여 생산성이 향상됩니다.

#### 2.2.2 ORM의 단점

- 편리한 반면에 쉬운 기술은 아니므로 실무에서 사용하려면 깊이있게 학습해야 합니다.
- 복잡한 쿼리나 성능이 중요한 경우 직접 SQL을 작성하는 것이 더 효율적일 수 있습니다.

:::tip
ORM과 SQL Mapper는 상호 배타적인 기술이 아닙니다. 많은 프로젝트에서 두 가지 접근 방식을 함께 사용하여 각 기술의 장점을 활용합니다. 예를 들어, 간단한 CRUD 작업에는 ORM을, 복잡한 쿼리에는
SQL Mapper를 사용하는 방식입니다.
:::

## 3. JDBC 직접 사용하기

### 3.1 JDBC DriverManager

- [레퍼런스](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/DriverManager.html)
- DriverManager는 JDBC가 제공하는 클래스로, 라이브러리에 등록된 DB 드라이버들을 관리하고, 커넥션을 획득하는 기능을 제공합니다.

#### 3.1.1 getConnection 메서드

```java
public static Connection getConnection(String url, Properties info)
public static Connection getConnection(String url, String user, String password)
public static Connection getConnection(String url)
```

- DriverManager는 커넥션을 얻기 위한 3가지의 메서드를 제공합니다.
- 등록된 JDBC drivers 목록 중 적합한 드라이버를 선택해 커넥션을 반환합니다.

#### 3.1.2 DriverManager 작동 과정

- 애플리케이션 로직에서 커넥션이 필요하면 `DriverManager.getConnection()`을 호출합니다.
- DriverManager는 등록된 드라이버 목록을 가지고 있는데 이 드라이버들에게 정보를 넘겨 커넥션을 획득할 수 있는지 확인합니다.
	- 넘겨주는 정보에는 URL, 사용자이름, 비밀번호 등이 있습니다.
	- URL: `jdbc:h2:tcp://localhost/~/test`
	- `jdbc:h2`로 시작하기 때문에 H2 드라이버가 처리할 수 있으므로 H2 드라이버가 실제 데이터베이스에 연결해서 커넥션을 획득하고 이 커넥션을 클라이언트에 반환합니다.
- 커넥션을 획득할 수 없다면 다음 드라이버를 확인합니다.
- 커넥션을 획득할 수 있다면 찾은 커넥션 구현체가 커넥션을 획득하고 클라이언트에 반환합니다.

### 3.2 Connection 획득하기

- 데이터베이스 커넥션을 획득하려면 JDBC가 제공하는 `DriverManager.getConnection()`을 사용하면 됩니다.
- 라이브러리에 있는 데이터베이스 드라이버를 찾아서 해당 드라이버가 제공하는 커넥션을 반환해줍니다.

#### 3.2.1 DBConnectionUtil 예제

- `DriverManager.getConnection()` 메서드를 호출해 커넥션을 획득합니다.
- H2 데이터베이스 드라이버가 작동해서 실제 데이터베이스와 커넥션을 맺고 그 결과를 반환해줍니다.

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

@Slf4j
public class DBConnectionUtil {
  private static final String URL = "jdbc:h2:tcp://localhost/~/test";
  private static final String USERNAME = "sa";
  private static final String PASSWORD = "";

  public static Connection getConnection() {
    try {
      Connection connection = DriverManager.getConnection(URL, USERNAME, PASSWORD);
      log.info("get connection={}, class={}", connection, connection.getClass());
      return connection;
    } catch (SQLException e) {
      throw new IllegalStateException(e);
    }
  }
}
```

#### 3.2.2 테스트 코드와 실행 결과

```java
@Test
void connection() {
  Connection connection = DBConnectionUtil.getConnection();
  assertThat(connection).isNotNull();
}
```

```
DBConnectionUtil - get connection=conn0: url=jdbc:h2:tcp://localhost/~/test
user=SA, class=class org.h2.jdbc.JdbcConnection
```

- 실행 결과를 보면 `class=class org.h2.jdbc.JdbcConnection` 부분을 확인할 수 있습니다.
- 이것이 바로 H2 데이터베이스 드라이버가 제공하는 H2 전용 커넥션으로 JDBC 표준 커넥션 인터페이스인 java.sql.Connection 인터페이스를 구현하고 있습니다.

### 3.3 SQL 전달 및 결과 응답

- 커넥션을 획득한 후에는 SQL을 데이터베이스에 전달하고 결과를 응답받아야 합니다.

#### 3.3.1 MemberRepository 예제

- 아래 예제는 3개의 메서드를 가지고 있습니다.
	- getConnection 메서드: 데이터베이스 커넥션을 획득합니다.
	- findById 메서드: 커넥션을 가지고 SQL을 데이터베이스에 전달하고 결과를 응답받습니다.
	- close 메서드: 사용한 리소스를 정리합니다.

```java
@Slf4j
public class MemberRepository {
  private Connection getConnection() {
    return DBConnectionUtil.getConnection();
  }

  public Member findById(String memberId) throws SQLException {
    // 데이터베이스에 전달할 sql을 정의합니다
    String sql = "select * from member where member_id = ?";
    Connection con = null;
    // PreparedStatement는 Statement의 자식 타입인데, ?를 통한 파라미터 바인딩을 가능하게 해줍니다.
    PreparedStatement pstmt = null;
    ResultSet rs = null;

    try {
      con = getConnection();
      // 데이터베이스에 전달할 SQL과 파라미터로 전달할 데이터들을 준비합니다.
      pstmt = con.prepareStatement(sql);
      // SQL의 첫 번째 ?에 값을 지정합니다
      pstmt.setString(1, memberId);
      // Statement를 통해 준비된 SQL을 커넥션을 통해 실제 데이터베이스에 전달합니다
      rs = pstmt.executeQuery();
      if (rs.next()) {
        Member member = new Member();
        member.setMemberId(rs.getString("member_id"));
        member.setMoney(rs.getInt("money"));
        return member;
      } else {
        throw new NoSuchElementException("member not found memberId=" + memberId);
      }
    } catch (SQLException e) {
      log.error("db error", e);
      throw e;
    } finally {
      // 리소스 정리
      close(con, pstmt, rs);
    }
  }

  private void close(Connection con, Statement stmt, ResultSet rs) {
    if (rs != null) {
      try {
        rs.close();
      } catch (SQLException e) {
        log.info("error", e);
      }
    }
    if (stmt != null) {
      try {
        stmt.close();
      } catch (SQLException e) {
        log.info("error", e);
      }
    }
    if (con != null) {
      try {
        con.close();
      } catch (SQLException e) {
        log.info("error", e);
      }
    }
  }
}
```

#### 3.3.2 getConnection 메서드

- 앞서 정의한 DBConnectionUtil를 통해서 데이터베이스 커넥션을 획득합니다.

#### 3.3.3 findById 메서드

- memberId로 Member를 찾아 반환하는 메서드입니다.
- DriverManager를 통해서 커넥션을 얻고 PreparedStatement를 이용해 데이터베이스에 전달할 SQL과 파라미터로 전달할 데이터들을 준비합니다.
- pstmt.executeQuery()로 sql을 실제 데이터베이스에 전달하고 그 결과를 ResultSet으로 받습니다.
- rs.next()는 커서를 다음으로 이동시키며 최초의 커서는 데이터를 가리키고 있지 않기 때문에 rs.next()를 최초 한번은 호출해야 데이터를 조회할 수 있습니다.
- rs.next()의 결과가 true면 커서의 이동 결과 데이터가 있다는 뜻입니다.
- rs.next()의 결과가 false면 더이상 커서가 가리키는 데이터가 없다는 뜻입니다.

#### 3.3.4 close 메서드

- 쿼리를 실행하고 나면 리소스를 반드시 정리해야 합니다.
- 예외가 발생하든, 하지 않든 항상 수행되어야 하므로 finally 구문에 주의해서 작성해야합니다.
- 리소스를 정리하지 않으면 커넥션이 끊어지지 않고 계속 유지되는 문제가 발생할 수 있습니다.
- 이런 것을 리소스 누수라고 하는데, 결과적으로 커넥션 부족으로 장애가 발생할 수 있습니다.
- 리소스를 정리할 때는 항상 역순으로 해야합니다. ResultSet -> Statement -> Connection 순으로 리소스를 반환합니다.

:::warning
리소스 정리를 하지 않으면 데이터베이스 커넥션이 부족해져 애플리케이션 전체가 멈출 수 있습니다. 이는 실제 운영 환경에서 자주 발생하는 심각한 문제입니다. Java 7부터는 try-with-resources 구문을
사용하여 더 쉽게 리소스를 관리할 수 있습니다.
:::

## 4. Connection Pool

- Connection Pool이란 데이터베이스 커넥션을 미리 생성해두고 필요할 때 가져다 쓰는 기법입니다.
- 대표적인 커넥션 풀 오픈소스는 commons-dbcp2, tomcat-jdbc pool, HikariCP 등이 있습니다.
	- 성능과 사용의 편리함 측면에서 최근에는 HikariCP를 주로 사용합니다.

### 4.1 데이터베이스 커넥션을 획득하는 과정

- 애플리케이션 로직은 DB 드라이버를 통해 커넥션을 조회합니다.
- DB 드라이버는 DB와 TCP/IP 커넥션을 연결합니다. 물론 이 과정에서 3-way handshake 같은 TCP/IP 연결을 위한 네트워크 동작이 발생합니다.
- DB 드라이버는 TCP/IP 커넥션이 연결되면 ID, PW와 기타 부가정보를 DB에 전달합니다.
- DB는 ID, PW를 통해 내부 인증을 완료하고, 내부에 DB 세션을 생성합니다.
- DB는 커넥션 생성이 완료되었다는 응답을 보냅니다.
- DB 드라이버는 커넥션 객체를 생성해서 클라이언트에 반환합니다.

### 4.2 Connection Pool 등장 배경

- 커넥션을 새로 만드는 것은 과정도 복잡하고 시간도 많이 소모되는 일입니다.
- TCP/IP 커넥션을 새로 생성하기 위한 리소스를 매번 사용해야 합니다.
- SQL을 실행하는 시간 뿐만 아니라 커넥션을 새로 만드는 시간이 추가되기 때문에 결과적으로 응답 속도에 영향을 줍니다.
- 즉 사용자의 요청마다 커넥션을 새로 만들어서 사용하는 것은 비효율적입니다.
- 따라서 커넥션을 미리 생성해서 `커넥션 풀`이라는 곳에 보관하고 커넥션이 필요한 경우 커넥션 풀에서 가져와 사용하고 반납하는 것이 효율적입니다.

### 4.3 Connection Pool 사용

- 애플리케이션이 시작하는 시점에 커넥션 풀은 필요한 만큼 커넥션을 미리 확보해서 풀에 보관합니다.
	- 기본 값은 보통 10개입니다.
- 커넥션 풀에 들어 있는 커넥션은 TCP/IP로 DB와 커넥션이 연결되어 있는 상태이기 때문에 언제든지 즉시 SQL을 DB에 전달할 수 있습니다.
- 애플리케이션 로직에서 이제는 DB 드라이버를 통해서 새로운 커넥션을 획득하는 것이 아닙니다.
	- 커넥션 풀을 통해 이미 생성되어 있는 커넥션을 객체 참조로 가져다 씁니다.
- 커넥션을 모두 사용하고 나면 이제는 커넥션을 종료하는 것이 아니라, 다음에 다시 사용할 수 있도록 해당 커넥션을 그대로 커넥션 풀에 반환합니다.

:::tip
대부분의 실제 운영 환경에서는 커넥션 풀을 사용합니다. 스프링 부트 2.0부터는 기본적으로 HikariCP를 제공하므로 별도의 설정 없이도 커넥션 풀을 사용할 수 있습니다.
:::

## 5. DataSource

### 5.1 DataSource 등장 배경

- 지금까지 커넥션을 얻는 방법으로 DriverManager를 직접 사용하거나 Connection Pool을 사용하는 방법에 대해서 학습했습니다.
- DriverManager와 Connection Pool을 통해 커넥션을 얻는 방식이 공통화되어 있지 않습니다.
- 따라서 애플리케이션을 개발하면서 DriverManager를 통해 커넥션 획득하다가 커넥션 풀로 변경 시 애플리케이션 코드의 변경이 필요합니다.
- 자바에서는 이런 문제를 해결하기 위해 `javax.sql.DataSource`라는 인터페이스를 제공합니다.
- DataSource는 커넥션을 획득하는 방법을 추상화한 인터페이스입니다.

### 5.2 DataSource 인터페이스

- DataSource 인터페이스는 다음과 같이 매우 단순합니다:

```java
public interface DataSource {
    Connection getConnection() throws SQLException;
}
```

- DataSource는 **추상화**된 인터페이스로, 애플리케이션은 이 인터페이스에 의존하면 됩니다.
- 대부분의 커넥션 풀은 DataSource 인터페이스를 이미 구현해두었습니다.
- DriverManager는 DataSource 인터페이스를 구현하지 않았지만, 스프링에서는 DriverManagerDataSource 클래스를 제공하여 DataSource 인터페이스에 맞게
  DriverManager를 사용할 수 있게 해줍니다.
- 애플리케이션 코드는 DataSource 인터페이스에만 의존하기 때문에 DriverManager를 사용하다가 커넥션 풀을 사용하도록 변경해도 애플리케이션 코드를 변경하지 않아도 됩니다.

### 5.3 DriverManagerDataSource 예제

스프링이 제공하는 DriverManagerDataSource를 사용하는 예제입니다:

```java
@Test
void dataSourceDriverManager() throws SQLException {
    // DriverManagerDataSource - 항상 새로운 커넥션 획득
    DriverManagerDataSource dataSource = new DriverManagerDataSource(
            "jdbc:h2:tcp://localhost/~/test", "sa", ""
    );
    
    // DataSource 인터페이스를 통해 커넥션 획득
    Connection con1 = dataSource.getConnection();
    Connection con2 = dataSource.getConnection();
    
    log.info("connection={}, class={}", con1, con1.getClass());
    log.info("connection={}, class={}", con2, con2.getClass());
}
```

실행 결과:

```
DriverManagerDataSource - Creating new JDBC DriverManager Connection to [jdbc:h2:tcp:..test]
DriverManagerDataSource - Creating new JDBC DriverManager Connection to [jdbc:h2:tcp:..test]
connection=conn0: url=jdbc:h2:tcp://..test user=SA, class=class org.h2.jdbc.JdbcConnection
connection=conn1: url=jdbc:h2:tcp://..test user=SA, class=class org.h2.jdbc.JdbcConnection
```

이 로그를 보면 DriverManagerDataSource를 사용해도 항상 새로운 커넥션을 생성하는 것을 확인할 수 있습니다.

### 5.4 HikariDataSource 예제

HikariCP의 DataSource 구현체인 HikariDataSource를 사용하는 예제입니다:

```java
@Test
void dataSourceConnectionPool() throws SQLException {
    // HikariCP를 통한 DataSource 생성
    HikariDataSource dataSource = new HikariDataSource();
    dataSource.setJdbcUrl("jdbc:h2:tcp://localhost/~/test");
    dataSource.setUsername("sa");
    dataSource.setPassword("");
    dataSource.setMaximumPoolSize(10);
    
    // DataSource 인터페이스를 통해 커넥션 획득
    Connection con1 = dataSource.getConnection();
    Connection con2 = dataSource.getConnection();
    
    log.info("connection={}, class={}", con1, con1.getClass());
    log.info("connection={}, class={}", con2, con2.getClass());
}
```

실행 결과:

```
get connection=HikariProxyConnection@xxxxxxxx1 wrapping conn0: url=jdbc:h2:... user=SA
get connection=HikariProxyConnection@xxxxxxxx2 wrapping conn0: url=jdbc:h2:... user=SA
```

- 커넥션 풀 사용시 `conn0` 커넥션이 재사용 된 것을 확인할 수 있습니다.
- 테스트는 순서대로 실행되기 때문에 커넥션을 사용하고 다시 돌려주는 것을 반복한다. 따라서 `conn0` 만 사용됩니다.
- 웹 애플리케이션에 동시에 여러 요청이 들어오면 여러 쓰레드에서 커넥션 풀의 커넥션을 다양하게 가져가는 상황을 확인할 수 있습니다.

### 5.5 Repository에서 DataSource 활용

Repository에서 DataSource를 활용하는 예제입니다:

```java
@Slf4j
@Repository
public class MemberRepositoryV1 {
    private final DataSource dataSource;
    
    // DataSource 의존성 주입
    public MemberRepositoryV1(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    // DataSource를 통한 커넥션 획득
    private Connection getConnection() throws SQLException {
        Connection con = dataSource.getConnection();
        log.info("get connection={}, class={}", con, con.getClass());
        return con;
    }
    
    // 회원 조회 메서드
    public Member findById(String memberId) throws SQLException {
        String sql = "select * from member where member_id = ?";
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        
        try {
            con = getConnection();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, memberId);
            rs = pstmt.executeQuery();
            
            if (rs.next()) {
                Member member = new Member();
                member.setMemberId(rs.getString("member_id"));
                member.setMoney(rs.getInt("money"));
                return member;
            } else {
                throw new NoSuchElementException("member not found memberId=" + memberId);
            }
        } catch (SQLException e) {
            log.error("db error", e);
            throw e;
        } finally {
            // 리소스 정리
            JdbcUtils.closeResultSet(rs);
            JdbcUtils.closeStatement(pstmt);
            JdbcUtils.closeConnection(con);
        }
    }
    
    // 기타 CRUD 메서드...
}
```

- `DataSource`의 구현체를 `DriverManagerDataSource`에서 `HikariDataSource`로 변경하더라도 MemberRepositoryV1은 `DataSource` 인터페이스에만 의존하므로 애플리케이션 코드를 변경할 필요가 없습니다.

### 5.6 스프링에서 DataSource 설정과 의존성 주입

- 실제 스프링 애플리케이션에서는 DataSource를 빈으로 등록하고 의존성 주입(DI)을 통해 사용합니다. 
- 스프링의 DI를 활용하면 구현 기술을 변경할 때 애플리케이션 코드를 수정할 필요 없이 설정만 변경하면 됩니다.

#### 5.6.1 JavaConfig 방식 설정

```java
@Configuration
public class DatabaseConfig {
    
    @Bean
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:h2:tcp://localhost/~/test");
        dataSource.setUsername("sa");
        dataSource.setPassword("");
        dataSource.setMaximumPoolSize(10);
        return dataSource;
    }
}
```

#### 5.6.2 스프링 부트 application.yml 설정

```yaml
spring:
  datasource:
    url: jdbc:h2:tcp://localhost/~/test
    username: sa
    password:
    driver-class-name: org.h2.Driver
    hikari:
      maximum-pool-size: 10
```

#### 5.6.3 서비스 계층에서 Repository 사용

```java
@Service
public class MemberService {
    private final MemberRepositoryV1 memberRepository;
    
    // 생성자 주입 방식으로 Repository 주입받기
    public MemberService(MemberRepositoryV1 memberRepository) {
        this.memberRepository = memberRepository;
    }
    
    // 회원 조회 서비스
    public Member findMember(String memberId) throws SQLException {
        return memberRepository.findById(memberId);
    }
    
    // 기타 서비스 메서드...
}
```

#### 5.6.4 스프링의 의존성 주입 흐름

1. 스프링 컨테이너는 설정 정보를 통해 DataSource 빈을 생성합니다.
2. 이때 실제 구현체는 HikariDataSource, DriverManagerDataSource 등이 될 수 있습니다.
3. DataSource 빈이 생성되면 MemberRepositoryV1에 주입됩니다.
4. MemberRepositoryV1 빈이 생성되면 MemberService에 주입됩니다.
5. 이렇게 의존성 주입을 통해 각 계층이 연결됩니다.

#### 5.6.5 DI의 장점

- **구현체 변경 용이성**: 실제 구현체(HikariCP, 다른 커넥션 풀, 테스트용 DataSource 등)를 바꿔도 애플리케이션 코드의 변경 없이 설정만 변경하면 됩니다.
- **테스트 용이성**: 테스트 환경에서는 인메모리 데이터베이스나 테스트용 구현체로 쉽게 교체할 수 있습니다.
- **유지보수성 향상**: 데이터베이스 연결 방식이 변경되어도 애플리케이션 코드는 수정할 필요가 없습니다.

:::info
DataSource를 스프링의 의존성 주입을 통해 사용하면 JDBC 구현 기술을 변경하더라도 애플리케이션 코드를 변경할 필요가 없습니다. 이는 객체지향 설계의 중요한 원칙인 DIP(Dependency
Inversion Principle)와 OCP(Open-Closed Principle)를 따르는 것입니다. 구체적인 커넥션 획득 방법이 변경되어도 애플리케이션 코드는 변경되지 않기 때문에 유지보수성이 크게
향상됩니다.
:::

## 6. 정리

- JDBC는 자바에서 데이터베이스에 접근하기 위한 표준 API입니다.
- JDBC의 핵심 인터페이스는 Connection, Statement, ResultSet입니다.
- JDBC 드라이버는 JDBC 인터페이스의 구현체로, 각 데이터베이스 벤더에서 제공합니다.
- 커넥션 풀은 데이터베이스 커넥션을 미리 생성해두고 필요할 때 가져다 쓰는 기법으로, 성능 향상에 도움이 됩니다.
- DataSource는 커넥션을 획득하는 방법을 추상화한 인터페이스로, 애플리케이션 코드의 변경 없이 커넥션 획득 방법을 전환할 수 있게 해줍니다.
- 최근에는 JDBC를 직접 사용하기보다 MyBatis, JPA와 같은 ORM이나 SQL Mapper를 사용하는 추세입니다.

참고

- [스프링 DB 1편 - 데이터 접근 핵심 원리](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-db-1/dashboard)