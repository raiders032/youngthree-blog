---
title: "MyBatis"
description: "자바 애플리케이션에서 데이터베이스 접근을 위한 MyBatis 프레임워크의 특징과 사용법을 알아봅니다. XML 기반 SQL 매핑, 동적 쿼리 작성, 설정 방법부터 플러그인 시스템까지 MyBatis의 핵심 기능을 실용적인 예제와 함께 살펴봅니다."
tags: ["MYBATIS", "DATABASE", "JAVA", "BACKEND", "SQL", "ORM"]
keywords: ["마이바티스", "MyBatis", "SQL 매퍼", "SQL Mapper", "동적 쿼리", "Dynamic SQL", "XML 매핑", "데이터베이스", "자바", "JDBC", "ORM", "데이터 접근", "데이터 액세스", "DAO", "영속성", "SQL 매핑"]
draft: false
hide_title: true
---

## 1. MyBatis 소개

- MyBatis는 자바 애플리케이션에서 관계형 데이터베이스에 액세스하기 위한 SQL 매퍼 프레임워크입니다. 
- 기존 JDBC의 복잡성을 추상화하고, Spring의 JdbcTemplate보다 더 많은 기능을 제공합니다.

### 1.1 MyBatis의 주요 특징

- **SQL과 자바 코드의 분리**: SQL 쿼리를 XML 파일에 따로 작성하여 자바 코드와 분리
- **간결한 코드**: JDBC의 반복적인 코드를 제거하고 핵심 비즈니스 로직에 집중 가능
- **강력한 동적 쿼리**: 조건에 따라 SQL을 동적으로 구성하는 기능 제공
- **객체-결과 매핑**: 데이터베이스 결과를 자바 객체로 쉽게 매핑
- **확장성**: 플러그인 시스템을 통한 기능 확장

### 1.2 JdbcTemplate과 비교

JdbcTemplate에 비해 MyBatis가 갖는 가장 큰 장점:

- **SQL을 XML에 편리하게 작성** 가능
- **동적 쿼리**를 매우 효과적으로 구현 가능
- 복잡한 객체 관계 매핑 지원
- 다양한 데이터베이스 벤더 지원

## 2. MyBatis 시작하기

### 2.1 의존성 추가

**Gradle**

```groovy
implementation 'org.mybatis:mybatis:3.5.13'
```

**Maven**

```xml
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.5.13</version>
</dependency>
```

### 2.2 기본 구성 요소

MyBatis의 핵심 컴포넌트:

- **SqlSessionFactoryBuilder**: 설정 파일을 읽어 SqlSessionFactory 생성
- **SqlSessionFactory**: SqlSession 인스턴스를 생성하는 팩토리
- **SqlSession**: SQL 명령을 실행하는 주요 인터페이스
- **Mapper Interface**: SQL 매핑 파일과 자바 인터페이스를 연결
- **Mapper XML 파일**: SQL 쿼리와 매핑 정보를 포함하는 XML 파일

### 2.3 기본 설정

**SqlSessionFactory 생성**

```java
String resource = "org/mybatis/example/mybatis-config.xml";
InputStream inputStream = Resources.getResourceAsStream(resource);
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
```

**SqlSession 사용**

```java
try (SqlSession session = sqlSessionFactory.openSession()) {
    // SQL 명령 실행
    User user = session.selectOne("org.mybatis.example.UserMapper.findById", 1);
    
    // 트랜잭션 커밋
    session.commit();
}
```

## 3. MyBatis 설정

MyBatis의 설정은 XML 기반 설정 파일을 통해 이루어집니다.

### 3.1 mybatis-config.xml 구조

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
  PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
  <!-- 설정 요소들 -->
</configuration>
```

### 3.2 주요 설정 요소

- **properties**: 외부 속성 파일 설정 (DB 연결 정보 등)
- **settings**: MyBatis 동작 방식 조정
- **typeAliases**: 자바 타입 별칭 설정
- **typeHandlers**: 자바-JDBC 타입 변환 관리
- **environments**: 다양한 환경(개발, 테스트, 운영) 설정
	- **environment**: 특정 환경 구성
		- **transactionManager**: 트랜잭션 관리 방식
		- **dataSource**: 데이터베이스 연결 정보
- **mappers**: SQL 매퍼 파일 위치 지정

### 3.3 설정 예제

```xml
<configuration>
  <properties resource="application.properties"/>
  
  <settings>
    <setting name="cacheEnabled" value="true"/>
    <setting name="lazyLoadingEnabled" value="true"/>
    <setting name="mapUnderscoreToCamelCase" value="true"/>
  </settings>
  
  <typeAliases>
    <package name="com.example.domain"/>
  </typeAliases>
  
  <environments default="development">
    <environment id="development">
      <transactionManager type="JDBC"/>
      <dataSource type="POOLED">
        <property name="driver" value="${jdbc.driver}"/>
        <property name="url" value="${jdbc.url}"/>
        <property name="username" value="${jdbc.username}"/>
        <property name="password" value="${jdbc.password}"/>
      </dataSource>
    </environment>
  </environments>
  
  <mappers>
    <mapper resource="mappers/UserMapper.xml"/>
    <mapper resource="mappers/ProductMapper.xml"/>
  </mappers>
</configuration>
```

## 4. Mapper 인터페이스와 XML

MyBatis에서는 Mapper 인터페이스와 XML 파일을 통해 SQL을 관리합니다.

### 4.1 Mapper 인터페이스

```java
@Mapper
public interface UserMapper {
    User findById(Long id);
    List<User> findAll();
    void save(User user);
    void update(User user);
    void delete(Long id);
}
```

- 인터페이스에 `@Mapper` 애노테이션을 붙여 MyBatis가 인식하게 함
- 메서드 호출 시 매핑된 XML의 SQL이 실행됨
- Spring과 함께 사용할 경우 자동 주입 가능

### 4.2 Mapper XML

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">
  <select id="findById" resultType="User">
    SELECT * FROM users WHERE id = #{id}
  </select>
  
  <select id="findAll" resultType="User">
    SELECT * FROM users
  </select>
  
  <insert id="save" parameterType="User">
    INSERT INTO users (name, email)
    VALUES (#{name}, #{email})
  </insert>
  
  <update id="update" parameterType="User">
    UPDATE users
    SET name = #{name},
        email = #{email}
    WHERE id = #{id}
  </update>
  
  <delete id="delete">
    DELETE FROM users WHERE id = #{id}
  </delete>
</mapper>
```

### 4.3 Result Maps

복잡한 객체 매핑을 위해 ResultMap을 사용합니다:

```xml
<resultMap id="userResultMap" type="User">
  <id property="id" column="user_id" />
  <result property="username" column="user_name"/>
  <result property="email" column="user_email"/>
  <association property="profile" javaType="Profile">
    <id property="id" column="profile_id"/>
    <result property="bio" column="bio"/>
  </association>
</resultMap>

<select id="selectUserWithProfile" resultMap="userResultMap">
  SELECT u.id as user_id, u.username as user_name, u.email as user_email,
         p.id as profile_id, p.bio as bio
  FROM users u
  LEFT JOIN profiles p ON u.id = p.user_id
  WHERE u.id = #{id}
</select>
```

## 5. 동적 SQL

MyBatis의 가장 강력한 기능 중 하나는 동적 SQL 생성 기능입니다.

### 5.1 조건부 SQL (if)

```xml
<select id="findByCondition" resultType="User">
  SELECT * FROM users
  WHERE 1=1
  <if test="name != null">
    AND name LIKE #{name}
  </if>
  <if test="email != null">
    AND email = #{email}
  </if>
</select>
```

### 5.2 다중 조건 (choose, when, otherwise)

```xml
<select id="findUsers" resultType="User">
  SELECT * FROM users
  WHERE 1=1
  <choose>
    <when test="name != null">
      AND name LIKE #{name}
    </when>
    <when test="email != null">
      AND email = #{email}
    </when>
    <otherwise>
      AND active = true
    </otherwise>
  </choose>
</select>
```

### 5.3 반복 처리 (foreach)

```xml
<select id="findByIds" resultType="User">
  SELECT * FROM users
  WHERE id IN
  <foreach item="id" collection="list" open="(" separator="," close=")">
    #{id}
  </foreach>
</select>
```

### 5.4 SQL 조각 재사용 (sql, include)

```xml
<sql id="userColumns">
  id, name, email, created_at
</sql>

<select id="selectUser" resultType="User">
  SELECT <include refid="userColumns"/> FROM users WHERE id = #{id}
</select>
```

## 6. MyBatis 플러그인 시스템

MyBatis는 확장 가능한 플러그인 시스템을 제공합니다.

### 6.1 플러그인 개요

- 플러그인은 SQL 실행 과정 중 특정 지점에서 호출을 가로채 기능을 확장
- 다음 객체의 메소드를 가로챌 수 있음:
	- **Executor**: SQL 실행을 담당 (update, query, commit, rollback 등)
	- **ParameterHandler**: 파라미터 바인딩 담당
	- **ResultSetHandler**: 결과 처리 담당
	- **StatementHandler**: SQL 문 준비 및 실행 담당

### 6.2 플러그인 작성 예시

```java
@Intercepts({
  @Signature(
    type = StatementHandler.class,
    method = "prepare",
    args = {Connection.class, Integer.class}
  )
})
public class ExamplePlugin implements Interceptor {
  private Properties properties;

  @Override
  public Object intercept(Invocation invocation) throws Throwable {
    // 원본 StatementHandler 가져오기
    StatementHandler handler = (StatementHandler) invocation.getTarget();
    
    // 원본 SQL 가져오기
    BoundSql boundSql = handler.getBoundSql();
    String sql = boundSql.getSql();
    
    // SQL 로깅 또는 수정
    System.out.println("Original SQL: " + sql);
    
    // 원본 메소드 실행
    return invocation.proceed();
  }

  @Override
  public Object plugin(Object target) {
    return Plugin.wrap(target, this);
  }

  @Override
  public void setProperties(Properties properties) {
    this.properties = properties;
  }
}
```

### 6.3 플러그인 등록

```xml
<plugins>
  <plugin interceptor="com.example.ExamplePlugin">
    <property name="someProperty" value="100"/>
  </plugin>
</plugins>
```

### 6.4 플러그인 활용 사례

- SQL 실행 로깅
- 성능 모니터링
- 페이징 처리 자동화
- 감사(Audit) 기능 구현
- 테넌트 ID 자동 삽입 (멀티테넌트 애플리케이션)
- 데이터 암호화/복호화

## 7. Spring과 MyBatis 통합

Spring Framework와 MyBatis를 함께 사용하면 더 강력한 애플리케이션을 구축할 수 있습니다.

### 7.1 의존성 추가

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.3.1</version>
</dependency>
```

### 7.2 Spring Boot 설정

```yaml
# application.yml
mybatis:
  mapper-locations: classpath:mappers/**/*.xml
  type-aliases-package: com.example.domain
  configuration:
    map-underscore-to-camel-case: true
```

### 7.3 Mapper 스캔

```java
@SpringBootApplication
@MapperScan("com.example.mapper")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

## 8. 실제 구현 예제

### 8.1 도메인 클래스

```java
public class User {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
    
    // getter, setter, constructor
}
```

### 8.2 Mapper 인터페이스

```java
@Mapper
public interface UserMapper {
    @Select("SELECT * FROM users WHERE id = #{id}")
    User findById(Long id);
    
    List<User> findByCondition(UserSearchCriteria criteria);
    
    @Insert("INSERT INTO users (name, email) VALUES (#{name}, #{email})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void save(User user);
}
```

### 8.3 XML 매핑 파일

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">
  <select id="findByCondition" resultType="User">
    SELECT * FROM users
    <where>
      <if test="name != null">
        name LIKE CONCAT('%', #{name}, '%')
      </if>
      <if test="email != null">
        AND email = #{email}
      </if>
      <if test="createdAfter != null">
        AND created_at >= #{createdAfter}
      </if>
    </where>
    ORDER BY created_at DESC
    <if test="limit != null">
      LIMIT #{limit}
    </if>
    <if test="offset != null">
      OFFSET #{offset}
    </if>
  </select>
</mapper>
```

### 8.4 서비스 클래스

```java
@Service
public class UserService {
    private final UserMapper userMapper;
    
    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }
    
    public User findById(Long id) {
        return userMapper.findById(id);
    }
    
    public List<User> findByCondition(UserSearchCriteria criteria) {
        return userMapper.findByCondition(criteria);
    }
    
    @Transactional
    public void createUser(User user) {
        userMapper.save(user);
    }
}
```