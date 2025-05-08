---
title: "JdbcTemplate"
---

## 1 JdbcTemplate

- [레퍼런스](https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html#jdbc-JdbcTemplate)
- JdbcTemplate은 spring-jdbc 라이브러리에 포함되어 있는데, 이 라이브러리는 스프링으로 JDBC를 사용할 때 기본으로 사용되는 라이브러리이다.
- JdbcTemplate를 사용하면 개발자는 SQL을 작성하고, 전달할 파리미터를 정의하고, 응답 값을 매핑하기만 하면 된다.
- SQL을 직접 사용하는 경우에 스프링이 제공하는 JdbcTemplate은 아주 좋은 선택지입니다.
  - JdbcTemplate은 JDBC를 매우 편리하게 사용할 수 있게 도와줍니다.
  - 실무에서 가장 간단하고 실용적인 방법으로 SQL을 사용하려면 JdbcTemplate을 사용하면 됩니다.

### 1.1 JDBC의 단점

- JDBC(Java Database Connectivity)는 자바에서 데이터베이스에 접근하기 위한 표준 API입니다.
	- [JDBC 참고](../../Language/Java/Database/JDBC/JDBC.md)
- 하지만 JDBC를 직접 사용하여 데이터베이스 연동을 구현하면 여러 가지 단점이 있습니다.
- 반복적인 코드 작성: 커넥션 획득, Statement 준비와 실행, ResultSet 처리, 커넥션 및 리소스 종료 등의 작업을 매번 반복해서 작성해야 합니다.
- 예외 처리의 어려움: JDBC에서 발생하는 예외는 체크 예외이므로 매번 try-catch 블록으로 처리해야 하며, 이로 인해 코드의 가독성이 떨어집니다.
- 트랜잭션 관리의 복잡성: 트랜잭션을 관리하기 위해서는 커넥션의 commit과 rollback을 직접 처리해야 하며, 이는 상당히 번거로운 작업입니다.

### 1.2 JdbcTemplate의 필요성

- 이러한 JDBC의 단점을 보완하고자 스프링에서는 JdbcTemplate을 제공합니다.
- JdbcTemplate은 JDBC를 래핑하여 위에서 언급한 문제점들을 해결해 줍니다.
- 반복적인 코드 제거
  - JdbcTemplate은 템플릿 콜백 패턴을 사용해서, JDBC를 직접 사용할 때 발생하는 대부분의 반복 작업을 대신 처리해준다.
  - 커넥션 획득, Statement 준비와 실행, ResultSet 처리, 리소스 종료 등의 작업을 내부적으로 처리합니다.
  - 개발자는 SQL 작성과 파라미터 설정, 결과 매핑에만 집중할 수 있습니다.
- 예외 처리 단순화
  - JdbcTemplate은 체크 예외를 언체크 예외로 변환해주므로 매번 try-catch 블록을 사용하지 않아도 됩니다. 
  - 이는 코드의 가독성을 높여줍니다.
- 트랜잭션 관리 편의성
  - JdbcTemplate은 트랜잭션 관리를 위한 유틸리티 메소드를 제공하므로 개발자는 복잡한 트랜잭션 관리 코드를 직접 작성하지 않아도 됩니다.

### 1.3 JdbcTemplate의 장점

- Jdbc를 직접 사용했을 때 직접 처리해야 하는 아래와 같은 부분들을 JdbcTemplate이 대신 처리해준다.
	- 커넥션 획득
	- statement 를 준비하고 실행
	- 결과를 반복하도록 루프를 실행
	- 커넥션 종료, statement , resultset 종료
	- 트랜잭션 다루기 위한 커넥션 동기화
	- 예외 발생시 스프링 예외 변환기 실행

### 1.4 JdbcTemplate의 단점

- 동적 SQL을 작성하기 어렵다.

## 2. JDBC 직접 사용과 JdbcTemplate 비교

- Java 애플리케이션에서 데이터베이스 작업을 할 때, 전통적인 JDBC API와 Spring의 JdbcTemplate을 비교해보면 코드 품질과 개발 생산성에 큰 차이가 있습니다.

### 2.1 JDBC 직접 사용 방식

- 전통적인 JDBC API를 직접 사용하면 다음과 같이 많은 상용구 코드를 작성해야 합니다.

```java
@Repository
public class UserDaoWithJdbc {
    
    private final DataSource dataSource;
    
    public UserDaoWithJdbc(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    public void save(User user) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        
        try {
            conn = dataSource.getConnection();
            conn.setAutoCommit(false); // 트랜잭션 시작
            
            pstmt = conn.prepareStatement("INSERT INTO users (id, name, email) VALUES (?, ?, ?)");
            pstmt.setLong(1, user.getId());
            pstmt.setString(2, user.getName());
            pstmt.setString(3, user.getEmail());
            pstmt.executeUpdate();
            
            conn.commit(); // 트랜잭션 커밋
        } catch (SQLException e) {
            if (conn != null) {
                try { 
                    conn.rollback(); // 오류 발생 시 롤백
                } catch (SQLException ex) {
                    /* 롤백 실패 로깅 처리 */
                }
            }
            throw new RuntimeException("사용자 저장 중 오류 발생", e);
        } finally {
            if (pstmt != null) {
                try { pstmt.close(); } catch (SQLException e) { /* 무시 */ }
            }
            if (conn != null) {
                try { 
                    conn.setAutoCommit(true); // 자동 커밋 모드 복원
                    conn.close(); 
                } catch (SQLException e) { /* 무시 */ }
            }
        }
    }
    
    public User findById(Long id) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        User user = null;
        
        try {
            conn = dataSource.getConnection();
            conn.setAutoCommit(false); // 트랜잭션 시작 (읽기 일관성을 위해)
            
            pstmt = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
            pstmt.setLong(1, id);
            rs = pstmt.executeQuery();
            
            if (rs.next()) {
                user = new User();
                user.setId(rs.getLong("id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
            }
            
            conn.commit(); // 트랜잭션 커밋
            return user;
        } catch (SQLException e) {
            if (conn != null) {
                try { 
                    conn.rollback(); // 오류 발생 시 롤백
                } catch (SQLException ex) {
                    /* 롤백 실패 로깅 처리 */
                }
            }
            throw new RuntimeException("사용자 조회 중 오류 발생", e);
        } finally {
            if (rs != null) {
                try { rs.close(); } catch (SQLException e) { /* 무시 */ }
            }
            if (pstmt != null) {
                try { pstmt.close(); } catch (SQLException e) { /* 무시 */ }
            }
            if (conn != null) {
                try { 
                    conn.setAutoCommit(true); // 자동 커밋 모드 복원
                    conn.close(); 
                } catch (SQLException e) { /* 무시 */ }
            }
        }
    }
}
```

- 위 코드에서 볼 수 있듯이, JDBC를 직접 사용하면 다음과 같은 패턴을 반복해야 합니다:
	- 연결 획득
	- 트랜잭션 시작 (setAutoCommit(false))
	- SQL 문 준비 및 실행
	- 결과 처리
	- 트랜잭션 커밋 또는 롤백
	- 자원 해제 (try-catch-finally 블록)
- 반복되는 상용구 코드가 많아 가독성이 떨어지고 실수할 가능성이 높습니다.
- 예외 처리가 복잡하고, 트랜잭션과 자원 관리를 위한 코드가 매우 장황합니다.
- 트랜잭션 관리를 잊어버리면 데이터 일관성 문제가 발생할 수 있습니다.

### 2.2 JdbcTemplate 사용 방식

- Spring의 JdbcTemplate을 사용하면 반복적인 상용구 코드를 획기적으로 줄일 수 있습니다.

```java
@Repository
public class UserDaoWithTemplate {

    private final JdbcTemplate jdbcTemplate;

    public UserDaoWithTemplate(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    public void save(User user) {
        String sql = "INSERT INTO users (id, name, email) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, user.getId(), user.getName(), user.getEmail());
    }

    public User findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, 
            new BeanPropertyRowMapper<>(User.class), id);
    }
}
```

- JdbcTemplate을 사용하면 코드가 훨씬 간결해지고 핵심 로직에 집중할 수 있습니다.
- 다음과 같은 장점이 있습니다:
	- 연결 관리, 자원 해제, 예외 처리 등을 JdbcTemplate이 대신 처리
	- 체크 예외(checked exception)를 언체크 예외(unchecked exception)로 변환
	- SQL 실행과 결과 처리에만 집중할 수 있어 가독성이 향상
	- 코드 양이 약 1/3로 감소
	- BeanPropertyRowMapper 등의 편리한 매핑 도구 제공

## 3. JdbcTemplate  설정

```groovy
implementation 'org.springframework.boot:spring-boot-starter-jdbc'
```

- JdbcTemplate을 사용하기 위해서는 spring-boot-starter-jdbc 의존성을 추가해야 합니다.

## 4. update 메서드

- JdbcTemplate의 update 메서드는 데이터를 추가, 수정, 삭제할 때 사용합니다.
- update 메서드는 SQL 쿼리와 파라미터를 전달하면 데이터베이스에 해당 쿼리를 실행합니다.
- update 메서드는 영향을 받은 행의 수를 반환합니다.

```java
@Override
public void update(Long itemId, ItemUpdateDto updateParam) {
    String sql = "update item set item_name=?, price=?, quantity=? where id=?";
    template.update(sql,
        updateParam.getItemName(),
        updateParam.getPrice(),
        updateParam.getQuantity(),
        itemId);
}
```

- update 메서드를 사용하여 데이터를 수정할 때는 SQL 쿼리와 파라미터를 전달하면 됩니다.
- SQL 쿼리에는 `?`를 사용하여 파라미터를 전달하고, 파라미터는 순서대로 전달합니다.

### 4.1 자동 증가 키 처리

```java
@Slf4j
@Repository
public class JdbcTemplateItemRepositoryV1 implements ItemRepository {
    private final JdbcTemplate template;

    public JdbcTemplateItemRepositoryV1(DataSource dataSource) {
        this.template = new JdbcTemplate(dataSource);
    }

    @Override
    public Item save(Item item) {
        String sql = "insert into item (item_name, price, quantity) values (?, ?, ?)";
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        template.update(connection -> {
            //자동 증가 키
            PreparedStatement ps = connection.prepareStatement(sql, new String[] {"id"});
            ps.setString(1, item.getItemName());
            ps.setInt(2, item.getPrice());
            ps.setInt(3, item.getQuantity());
            return ps;
        }, keyHolder);
        long key = keyHolder.getKey().longValue();
        item.setId(key);
        return item;
    }
}
```

- JdbcTemplate을 사용하여 데이터를 저장할 때 자동 증가 키를 처리하는 방법입니다.
- GeneratedKeyHolder를 사용하여 자동 증가 키를 저장하고, getKey() 메소드를 사용하여 자동 증가 키를 가져옵니다.
- JdbcTemplate이 제공하는 `SimpleJdbcInsert` 라는 훨씬 편리한 기능을 사용할 수도 있습니다.

## 5. queryForObject 메서드

```java
@Override
public Optional<Item> findById(Long id) {
    String sql = "select id, item_name, price, quantity from item where id = ?";
    try {
        Item item = template.queryForObject(sql, itemRowMapper(), id);
        return Optional.of(item);
    } catch (EmptyResultDataAccessException e) {
        return Optional.empty();
    }
}
```

- queryForObject 메서드는 단일 결과를 반환하는 쿼리를 실행할 때 사용합니다.
- `RowMapper`는 데이터베이스의 반환 결과인 `ResultSet`을 객체로 변환합니다.
- 결과가 없으면 `EmptyResultDataAccessException` 예외가 발생합니다.
- 결과가 둘 이상이면 `IncorrectResultSizeDataAccessException` 예외가 발생합니다.
- Optional을 반환하려면 `EmptyResultDataAccessException` 예외를 잡고 `Optional.empty()`를 반환하면 됩니다.

### 5.1 RowMapper

- RowMapper는 ResultSet의 한 행을 객체로 변환하는 인터페이스입니다.
- JDBC를 직접 사용할 때 `ResultSet` 를 사용했던 부분을 떠올리면 됩니다.
- 차이가 있다면 다음과 같이 JdbcTemplate이 다음과 같은 루프를 돌려주고, 개발자는 `RowMapper` 를 구현해서 그 내부 코드만 채운다고 이해하면 됩니다.

```java
while(resultSet 이 끝날 때 까지) {
	rowMapper(rs, rowNum)
}
```

## 6. query 메서드

- query 메서드는 여러 개의 결과를 반환하는 쿼리를 실행할 때 사용합니다.
- `RowMapper`는 데이터베이스의 반환 결과인 `ResultSet`을 객체로 변환합니다.
- 결과가 없으면 빈 리스트를 반환

## 7. batchUpdate 메서드

- 하나의 PreparedStatement를 사용해 여러 개의 업데이트 구문을 일괄 처리하는 메서드입니다. 
- 배치 업데이트와 BatchPreparedStatementSetter를 활용하여 값을 설정합니다.
- 약 JDBC 드라이버가 배치 업데이트를 지원하지 않는다면, 하나의 PreparedStatement로 각각 분리된 업데이트를 수행합니다.
- 반환 값
  - 배치 업데이트가 성공적으로 수행되면 각 SQL 구문이 영향을 준 행의 개수가 담긴 배열을 반환합니다.
  - MySQL 드라이버는 최적화가 되면 대체로 -2 (SUCCESS_NO_INFO) 를 반환함
    - 드라이버가 한 SQL로 보냈기 때문에 개별 row 영향 수를 알 수 없음

