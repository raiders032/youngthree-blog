---
title: "엔티티 매핑"
description: "JPA를 사용할 때 가장 중요한 엔티티와 테이블 매핑 방법을 알아봅니다. 객체-테이블 매핑, 기본 키 매핑, 필드-컬럼 매핑, 연관관계 매핑의 핵심 개념과 모범 사례를 실제 코드 예시와 함께 상세히 설명합니다."
tags: ["JPA", "ENTITY_MAPPING", "HIBERNATE", "ORM", "SPRING_DATA_JPA", "DATABASE", "BACKEND", "JAVA", "SPRING"]
keywords: ["JPA", "자바 ORM", "엔티티", "매핑", "테이블 매핑", "Entity", "매핑 어노테이션", "기본키", "identity", "시퀀스", "table", "필드", "컬럼", "연관관계", "스키마", "기본키 매핑", "column", "엔티티 매핑", "하이버네이트", "스프링 데이터"]
draft: false
hide_title: true
---

## 1 엔티티 매핑

- JPA를 사용할 때 가장 중요한 일은 엔티티와 테이블을 매핑하는 것입니다.
- JPA는 다양한 매핑 어노테이션을 지원하고 객체와 테이블 매핑, 기본 키 매핑, 필드와 컬럼 매핑, 연관관계 매핑 크게 4가지로 분류한 수 있습니다.
- 각각 분류마다 대표하는 어노테이션을 알아보자.

### 1.1 엔티티 클래스의 필수 조건

- [레퍼런스](https://jakarta.ee/learn/docs/jakartaee-tutorial/current/persist/persistence-intro/persistence-intro.html#_requirements_for_entity_classes)
- 어노테이션 요구사항 
  - 클래스는 반드시 jakarta.persistence.Entity 어노테이션으로 annotated 되어야 합니다.
- 생성자 요구사항
  - 클래스는 반드시 **public 또는 protected 접근 제한자를 가진 기본 생성자(no-argument constructor)**를 가져야 합니다.
  - 다른 생성자들도 추가로 가질 수 있습니다.
- final 제한사항
  - 클래스는 final로 선언되어서는 안 됩니다.
  - 어떤 메서드나 영속 인스턴스 변수도 final로 선언되어서는 안 됩니다.
- 직렬화 요구사항
  - Entity 인스턴스가 분리된 객체(detached object)로 값에 의해 전달되는 경우(예: 세션 빈의 원격 비즈니스 인터페이스를 통해), 클래스는 반드시 Serializable 인터페이스를 구현해야 합니다.
- 상속 관계
  - Entity는 Entity 클래스와 non-Entity 클래스 모두를 상속할 수 있습니다.
  - non-Entity 클래스도 Entity 클래스를 상속할 수 있습니다. 
- 필드 접근 제한
  - 영속 인스턴스 변수들은 반드시 private, protected, 또는 package-private으로 선언되어야 합니다.
  - 이러한 변수들은 오직 Entity 클래스의 메서드들에 의해서만 직접 접근될 수 있습니다.
  - 클라이언트는 반드시 접근자 메서드(accessor methods) 또는 비즈니스 메서드를 통해 Entity의 상태에 접근해야 합니다.

:::info
여기서 "영속 인스턴스 변수"란 JPA가 관리하는 엔티티의 필드를 의미합니다. 즉, 데이터베이스에 저장되는 필드를 말합니다. transient 필드나 static 필드는 영속 인스턴스 변수에 포함되지 않습니다.
:::

## 2 객체와 테이블 매핑

### 2.1 @Entity

- JPA를 사용해서 테이블과 매핑할 클래스에 해당 어노테이션을 붙이며 이 클래스를 엔티티라고 부릅니다.
- 주의사항
  - 기본 생성자 필수(public 또는 protected)
  - final클래스, enum, interface, inner에는 사용할 수 없습니다.
  - 저장할 필드에 final을 사용하면 안 됩니다.

**속성**

| 속성   | 설명             | 기본값    |
|:-----|----------------|--------|
| name | 엔티티 이름을 지정합니다. | 클래스 이름 |

### 2.2 @Table

- 엔티티와 매핑할 테이블을 지정합니다.
  - 생략하면 엔티티 이름을 테이블 이름으로 사용한다.

**속성**

| 속성                | 설명                     | 기본값    |
|-------------------|------------------------|--------|
| name              | 테이블 이름을 지정합니다.         | 엔티티 이름 |
| uniqueConstraints | DDL 생성 시에 유니크 제약 조건 생성 |        |

#### 2.2.1 uniqueConstraints

- @Column의 unique 속성은 한 컬럼에 간단한 유니크 제약 조건을 걸 때 사용합니다.
- 스키마 자동 생성 기능을 사용해서 DDL을 만들 때만 사용됩니다.
- @Table의 uniqueConstraints 속성은 두 컬럼 이상을 이용해 유니크 제약 조건을 걸 수 있습니다.
  - 또한 유니크 제약 조건에 이름을 부여할 수 있습니다.

```java
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "open_banking_accounts", uniqueConstraints = {
  @UniqueConstraint(name = "FINTECH_USE_NUM_UNIQUE", columnNames = {"fintech_use_num"})
})
@Entity
public class OpenBankingAccount extends BaseTimeEntity {
  @Column(name = "fintech_use_num")
  private String fintechUseNum;
}
```

- 위 예시는 `fintech_use_num` 컬럼에 유니크 제약 조건을 걸고, 이 제약 조건의 이름을 `FINTECH_USE_NUM_UNIQUE`로 지정한 것입니다.

## 3 기본 키 매핑

- 기본키 매핑 방법은 두가지 방법이 있습니다.
- ID를 직접 할당하는 직접 할당 방법과 ID를 자동으로 할당하는 자동 생성 방법이 있습니다.
  - 직접 할당: @Id만 사용합니다.
  - 자동 생성: @Id와 @GeneratedValue를 함께 사용합니다.

### 3.1 @Id

- 엔티티 클래스의 필드를 테이블의 기본 키에 매핑합니다.
- 이 필드를 **식별자 필드**라고 합니다.

### 3.2 기본키 직접 할당하는 방식

- @Id만 사용하고 @GeneratedValue 사용하지 않고 기본키를 직접 할당하는 방식입니다.

#### 3.2.1 Persistable 인터페이스

- save() 메서드는 내부적으로 두 가지 다른 작업을 수행할 수 있습니다.
  - persist(): 완전히 새로운 엔티티를 데이터베이스에 삽입
  - merge(): 기존 엔티티를 업데이트
- 문제는 Spring Data JPA가 어떻게 엔티티가 새 것인지 기존 것인지 구분하는가입니다.
  - Spring Data JPA는 id 값이 있으면 "이 엔티티는 기존 것이다"라고 판단하고 merge()를 호출합니다.
  - @GeneratedValue를 사용하지 않고 id 값을 직접 할당하는 경우, id 값이 존재하므로 merge()가 호출됩니다.
- merge() 호출은 다음과 같은 비효율적인 과정을 거칩니다
  - 먼저 데이터베이스에 해당 ID의 엔티티가 있는지 SELECT 쿼리를 실행합니다.
  - 데이터베이스에 해당 엔티티가 없으면 새 엔티티로 판단하고 INSERT 실행합니다.
  - 있으면 기존 엔티티를 수정하는 UPDATE 실행합니다.
  - 즉, 실제로는 새 엔티티인데도 불필요한 SELECT 쿼리가 추가로 실행됩니다.
- 이 문제를 해결하기 위해서는 Persistable 인터페이스를 구현해야 합니다.
  - Spring Data JPA는 Persistable 인터페이스를 제공합니다. 
  - 이 인터페이스를 구현하면 엔티티가 새 것인지 기존 것인지를 직접 판단하는 로직을 제공할 수 있습니다.
  - @CreatedDate와 같은 감사(Auditing) 필드를 사용하면 엔티티가 새 것인지 쉽게 판단할 수 있습니다:

```java
package org.springframework.data.domain;

public interface Persistable<ID> {
    @Nullable
    ID getId();

    boolean isNew();
}
```

- Persistable 인터페이스는 getId()와 isNew() 메서드를 제공합니다.
  - getId(): 엔티티의 ID를 반환합니다.
  - isNew(): 엔티티가 새 것인지 여부를 판단합니다. true면 새 것, false면 기존 것입니다.

#### 3.2.2 기본키 직접 할당 방식 예시

```java
@Entity  
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Item implements Persistable<String> {
  @Id
  private String id;
      
  @CreatedDate
  private LocalDateTime createdDate;
  public Item(String id) {
    this.id = id;
  }
      
  @Override
  public String getId() {
		return id; 
  }
  
  @Override
  public boolean isNew() {
    return createdDate == null;
  }
}
```

- `@Id`만 사용했습니다.
- Persistable을 구현해 새로운 엔티티 확인 여부를 직접 구현했습니다.
- createdDate는 영속화되기 전에는 null이므로, null인 경우 새 엔티티로 판단합니다.
- JPA가 엔티티를 저장할 때 @CreatedDate 필드가 자동으로 설정됩니다.
- 불필요한 SELECT 쿼리를 실행하지 않아 성능상 이점이 있습니다.

### 3.3 @GeneratedValue

- 기본 키를 직접 할당하는 대신에 데이터베이스가 생성해주는 값을 사용합니다.
- 데이터베이스 벤더가 지원하는 방식에 맞게 사용합니다.

**strategy속성에 사용할 수 있는 전략**

| 사용 가능한 전략 | 설명                                                  |
|-----------|-----------------------------------------------------|
| IDENTITY  | 데이터베이스에 위임 / MYSQL, Postgresql, SQL Server          |
| SEQUENCE  | 데이터베이스 시퀀스 오브젝트 사용 / ORACLE / @SequenceGenerator 필요 |
| TABLE     | 키 생성용 테이블 사용 / 모든 DB에서 사용 / @TableGenerator 필요      |
| AUTO      | 방언에 따라 자동 지정 / 기본값                                  |

**예시**

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

#### 3.3.1 IDENTITY 전략

- 기본 키 생성을 데이터베이스에 위임합니다.
- 주로 MySQL, PostgreSQL, SQL Server, DB2에서 사용 합니다.
- 먼저 데이터베이스에 값을 저장하고 나서 기본 키를 구할 수 있을 때 사용합니다.
- JPA는 보통 트랜잭션 커밋 시점에 INSERT SQL 실행합니다.
- AUTO_ INCREMENT는 데이터베이스에 INSERT SQL을 실행한 이후에 ID 값을 알 수 있습니다.
- IDENTITY 전략은 em.persist() 시점에 즉시 INSERT SQL 실행 하고 DB에서 식별자를 조회합니다.
  - 따라서 이 전략은 트랙잭션을 지원하는 쓰기 지연이 동작하지 않습니다.

#### 3.3.2 SEQUENCE 전략

- 데이터베이스 시퀀스는 유일한 값을 순서대로 생성하는 특별한 데이터베이스 오브젝트입니다.
- 오라클, PostgreSQL, DB2, H2 데이터베이스에서 사용합니다.

```java
@Entity
@SequenceGenerator(
 name = "MEMBER_SEQ_GENERATOR",
 sequenceName = "MEMBER_SEQ", //매핑할 데이터베이스 시퀀스 이름
 initialValue = 1, allocationSize = 1)
public class Member { 
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "MEMBER_SEQ_GENERATOR")
    private Long id; 
}
```

#### 3.3.3 TABLE 전략

- 키 생성 전용 테이블을 하나 만들어서 데이터베이스 시퀀스를 흉내 내는 전략입니다.
- 모든 데이터베이스에 적용 가능하다는 장점이 있으나 성능이 좋지 못하다는 단점이 있습니다.
- TABLE 전략은 잘 사용하지 않습니다.

#### 3.3.4 주의사항

- 엔티티를 영속화 할 때 새로운 엔티티인지 아닌지 판단해서 새로운 엔티티라면 save()를 호출하고 아니면 merge()를 호출합니다.
- JPA 식별자 생성 전략이 @GenerateValue 면 save() 호출 시점에 식별자가 없으므로 새로운 엔티티로 인식해서 정상 동작합니다.
- JPA 식별자 생성 전략이 @Id 만 사용해서 직접 할당이면 이미 식별자 값이 있는 상태로 save() 를 호출합니다.
  - 이 경우 merge() 가 호출됩니다.
  - merge() 는 우선 DB를 호출해서 값을 확인하고, DB에 값이 없으면 새로운 엔티티로 인지하므로 매우 비효율적입니다.
  - 따라서 Persistable 를 사용해서 새로운 엔티티 확인 여부를 직접 구현하게는 효과적입니다.

## 4 필드와 컬럼 매핑

### 4.1 @Column

- @Column을 사용하여 엔티티의 필드를 테이블의 컬럼에 매핑합니다.

| 속성                    | 설명                                                             | 기본값       |
|-----------------------|----------------------------------------------------------------|-----------|
| name                  | 필드와 매핑할 테이블의 컬럼 이름                                             | 객체의 필드 이름 |
| insertable, updatable | 등록, 변경 가능 여부                                                   | TRUE      |
| nullable(DDL)         | null 값의 허용 여부를 설정한다. false로 설정하면 DDL 생성 시에 not null 제약조건이 붙는다. |           |
| unique(DDL)           | @Table의 uniqueConstraints와 같지만 한 컬럼에 간단히 유니크 제약조건을 걸 때 사용한다.   |           |
| length                | 문자열을 갖는 컴럼의 경우 문자열의 최대 길이를 지정한다.                               | 255       |

#### 4.1.1 unique

- 유니크 제약조건과 생성된 DDL

```java
@Column(unique=true)
private Long personNumber;
```

```sql
alter table Person
    add constraint UK_d44q5lfa9xx370jv2k7tsgsqt unique (personNumber)
```

#### 4.1.2 length

- 문자열을 갖는 컴럼의 경우 문자열의 최대 길이를 지정합니다.


### 4.2 @Enumerated

- 자바 enum 타입을 매핑할 때 사용합니다.
- EnumType.STRING을 사용하는 것을 권장합니다.
- EnumType.ORDINAL을 사용하면 enum의 순서가 바뀌면 데이터베이스에 저장된 값과 매핑이 안될 수 있습니다.

| 속성    | 설명                                    | 기본값              |
|-------|---------------------------------------|------------------|
| value | EnumType.ORDINAL: enum 순서를 데이터베이스에 저장 | EnumType.ORDINAL |
| value | EnumType.STRING: enum 이름을 데이터베이스에 저장  | EnumType.ORDINAL |

### 4.3 @Temporal

- 날짜 타입(java.util.Date, java.util.Calendar)을 매핑할 때 사용합니다.
- LocalDate, LocalDateTime을 사용할 때는 생략 가능(최신 하이버네이트 지원)

| 속성    | 설명                                                                                                                                                                                                                                 | 기본값 |
|-------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----|
| value | TemporalType.DATE: 날짜, 데이터베이스 date 타입과 매핑 <br />(예: 2013–10–11)  <br />TemporalType.TIME: 시간, 데이터베이스 time 타입과 매핑 <br />(예: 11:11:11)  <br />TemporalType.TIMESTAMP: 날짜와 시간, 데이터베이 스 timestamp 타입과 매핑<br />(예: 2013–10–11 11:11:11) |     |

### 4.4 @Lob

- 데이터베이스 BLOB, CLOB 타입과 매핑
- @Lob에는 지정할 수 있는 속성이 없습니다.
- 매핑하는 필드 타입이 문자면 CLOB 매핑, 나머지는 BLOB 매핑
  - CLOB: String, char[], java.sql.CLOB
  - BLOB: byte[], java.sql. BLOB

**예시**

```java
@Getter
@ToString
@Embeddable
@NoArgsConstructor
public class OpenBankingToken {
  private static final String TOKEN_TYPE = "Bearer";
  @Lob
  private String accessToken;
  @Lob
  private String refreshToken;
  private int expiresIn;
  private String scope;
  private String userSeqNo;

  @Builder
  public OpenBankingToken(String accessToken, String refreshToken, int expiresIn, String scope, String userSeqNo) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
    this.scope = scope;
    this.userSeqNo = userSeqNo;
  }
}
```

```sql
    create table user_accounts
    (
        user_account_id bigint generated by default as identity,
        balance         integer,
        access_token    clob,
        expires_in      integer not null,
        refresh_token   clob,
        scope           varchar(255),
        user_seq_no     varchar(255),
        password        varchar(255),
        user_id         varchar(255),
        primary key (user_account_id)
    )
```

### 4.5 @Transient

- 필드 매핑을 하지 않을 때 사용합니다.
- 주로 메모리상에서만 임시로 어떤 값을 보관하고 싶을 때 사용합니다.

## 5. 연관 관계 매핑

- JPA는 객체지향적 관점에서 연관관계를 매핑할 수 있는 다양한 방법을 제공한다.
- 자세한 내용은 아래를 참고하세요
  - [Relationship-Mapping.md](../Relationship-Mapping/Relationship-Mapping.md)

## 6 데이터베이스 스키마 자동 생성

- JPA는 클래스의 매핑 정보를 가지고 데이터베이스 방언을 사용해서 데이터베이스 스키마를 자동적으로 생성하는 기능을 제공합니다.
- 이 기능을 사용하면 애플리케이션 실행 시점에 데이터베이스 테이블이 자동 생성되므로 개발자의 수고를 덜 수 있습니다.
- 하지만 자동 생성된 DDL이 운영 환경에서 사용할 만큼 완벽하지 않기 때문에 개발 용도나 참고용으로 사용하는 것이 좋습니다.

### 6.1 특징

- DDL을 애플리케이션 실행 시점에 자동 생성힙니다.
- 테이블중심 -> 객체중심
- 데이터베이스 방언을 활용해서 데이터베이스에 맞는 적절한 DDL 생성합니다.
- 자동 생성된 DDL은 개발 장비에서만 사용합니다.

**hibernate.hbm2ddl.auto**

| 옵션          | 설명                               |
|-------------|----------------------------------|
| create      | 기존테이블 삭제 후 다시 생성 (DROP + CREATE) |
| create-drop | create와 같으나 종료시점에 테이블 DROP       |
| update      | 변경된 부분만 반영(운영DB에는 사용하지 않는다)      |
| validate    | 엔티티와 테이블이 정상 매핑되었는지만 확인          |
| none        | 사용하지 않음                          |

```properties
## application.properties 예시
spring.jpa.hibernate.ddl-auto = validate
```

### 6.2 주의사항

- 운영 장비에는 절대 create, create-drop, update 사용하면 안됩니다.
- 개발 초기에는 create 또는 update를 사용하고 테스트 서버는 update 또는 validate를 사용합니다.
- 스테이징과 운영 서버는 validate 또는 none을 사용합니다.

### 6.3 DDL 생성 기능

- 데이터베이스 스키마 자동 생성 기능으로 DDL을 생성할 때 제약조건을 추가하고 싶다면 DDL 생성 기능을 이용합니다.
- **DDL 생성 기능은 DDL을 자동 생성할 때만 사용되고 JPA의 실행 로직에는 영향을 주지 않습니다.**
- **따라서 스키마 자동 생성 기능을 사용하지 않는다면 사용할 이유가 없습니다.**
- 하지만 개발자가 손쉽게 제약조건을 알 수 있다는 장점이 있습니다.

**예시**

- 제약조건 추가: 회원 이름은 **필수**, 10자 이하
- 유니크 제약조건 추가

```java
// email, name 유니크 제약 조건 추가
@Table(name = "users",
       uniqueConstraints = {@UniqueConstraint(name = "EMAIL_UNIQUE", columnNames = {"EMAIL"}),
                            @UniqueConstraint(name = "NAME_UNIQUE", columnNames = {"NAME"})})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // 회원 이름은 필수, 10자 이하 제약 조건 추가
  @Column(nullable = false, length = 10)
  private String name;

  @Column(nullable = false)
  private String email;
}
```

```
[Hibernate] 
    drop table if exists users CASCADE 
[Hibernate] 
    create table users (
       	id bigint generated by default as identity,
        email varchar(255) not null,
        name varchar(10) not null,
        primary key (id)
    )
[Hibernate] 
    alter table users 
       add constraint EMAIL_UNIQUE unique (email)
[Hibernate] 
    alter table users 
       add constraint NAME_UNIQUE unique (name)
```

## 참고

- [자바 ORM 표준 JPA 프로그래밍 - 기본편](https://www.inflearn.com/course/ORM-JPA-Basic/dashboard)

