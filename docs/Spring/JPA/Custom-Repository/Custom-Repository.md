---
title: "Spring Data JPA 사용자 정의 리포지토리 구현"
description: "Spring Data JPA에서 사용자 정의 리포지토리를 구현하는 방법을 상세히 알아봅니다. 기본 구현부터 Fragment 기반 설계, QueryDSL 통합까지 실무에서 활용할 수 있는 완벽한 가이드를 제공합니다."
tags: [ "CUSTOM_REPOSITORY", "SPRING_DATA_JPA", "JPA", "QUERYDSL", "SPRING", "BACKEND", "DATABASE" ]
keywords: [ "사용자 정의 리포지토리", "custom repository", "커스텀 리포지토리", "Spring Data JPA", "스프링 데이터 JPA", "리포지토리 구현", "repository implementation", "fragment", "프래그먼트", "QueryDSL", "쿼리DSL", "JPA", "스프링", "Spring" ]
draft: false
hide_title: true
---

## 1. 사용자 정의 리포지토리란

- Spring Data JPA는 인터페이스만 정의하면 구현체를 자동으로 생성해주는 강력한 기능을 제공합니다.
- 하지만 때로는 복잡한 쿼리나 특별한 로직이 필요할 때가 있습니다.
- 사용자 정의 리포지토리는 Spring Data JPA의 기본 기능을 확장하여 개발자가 직접 구현한 메서드를 추가할 수 있게 해줍니다.

:::info
실무에서는 주로 QueryDSL이나 Spring JDBC Template과 함께 사용할 때 사용자 정의 리포지토리 기능을 자주 활용합니다.
:::

### 1.1 사용자 정의 리포지토리가 필요한 경우

- 복잡한 동적 쿼리 작성이 필요할 때
- JPQL로 표현하기 어려운 네이티브 쿼리를 사용해야 할 때
- 여러 엔티티를 조인하여 DTO로 조회해야 할 때
- 성능 최적화를 위한 특별한 쿼리 로직이 필요할 때

## 2. 기본 사용자 정의 리포지토리 구현

### 2.1 사용자 정의 인터페이스 정의

```java
public interface MemberRepositoryCustom {
    List<MemberTeamDto> search(MemberSearchCondition condition);
}
```

- 먼저 직접 구현할 메서드를 정의하는 인터페이스를 만듭니다.
- 이 인터페이스를 프래그먼트 인터페이스라고 합니다.

### 2.2 사용자 정의 인터페이스 구현 클래스 작성

- 구현 클래스의 이름은 반드시 특정 명명 규칙을 따라야 합니다.
- `리포지토리 인터페이스 이름 + Impl` 또는 `사용자 정의 인터페이스 이름 + Impl`
- @Enable<StoreModule>Repositories(repositoryImplementationPostfix = …)를 설정하여 저장소별 접미사를 커스터마이징할 수 있습니다.

```java
@RequiredArgsConstructor
public class MemberRepositoryImpl implements MemberRepositoryCustom {
    
    private final JPAQueryFactory queryFactory;

    @Override
    public List<MemberTeamDto> search(MemberSearchCondition condition) {
        return queryFactory
            .select(new QMemberTeamDto(
                member.id,
                member.username,
                member.age,
                team.id,
                team.name))
            .from(member)
            .leftJoin(member.team, team)
            .where(
                usernameEq(condition.getUsername()),
                teamNameEq(condition.getTeamName()),
                ageGoe(condition.getAgeGoe()),
                ageLoe(condition.getAgeLoe())
            )
            .fetch();
    }
    
    private BooleanExpression usernameEq(String username) {
        return isEmpty(username) ? null : member.username.eq(username);
    }
    
    private BooleanExpression teamNameEq(String teamName) {
        return isEmpty(teamName) ? null : team.name.eq(teamName);
    }
    
    private BooleanExpression ageGoe(Integer ageGoe) {
        return ageGoe == null ? null : member.age.goe(ageGoe);
    }
    
    private BooleanExpression ageLoe(Integer ageLoe) {
        return ageLoe == null ? null : member.age.loe(ageLoe);
    }
}
```

### 2.3 메인 리포지토리 인터페이스에서 상속

```java
public interface MemberRepository extends JpaRepository<Member, Long>, MemberRepositoryCustom {
    List<Member> findByUsername(String username);
}
```

- 리포지토리 인터페이스가 프래그먼트 인터페이스를 확장하도록 합니다.
- JpaRepository 인터페이스와 프래그먼트 인터페이스를 확장하면 CRUD와 커스텀 기능이 결합되어 클라이언트에서 사용할 수 있게 됩니다.

## 3. Fragment 기반 고급 구현

### 3.1 Fragment란

- Spring Data는 Fragment라는 개념을 통해 리포지토리를 구성합니다.
- Fragment는 기본 리포지토리, 기능적 측면(QueryDSL 등), 사용자 정의 인터페이스와 구현체를 포함합니다.
- 여러 Fragment를 조합하여 하나의 완전한 리포지토리를 만들 수 있습니다.

### 3.2 다중 Fragment 구현

```java
// 첫 번째 Fragment
interface HumanRepository {
    void someHumanMethod(User user);
}

class HumanRepositoryImpl implements HumanRepository {
    @Override
    public void someHumanMethod(User user) {
        // 사용자 정의 구현
    }
}

// 두 번째 Fragment
interface ContactRepository {
    void someContactMethod(User user);
    User anotherContactMethod(User user);
}

class ContactRepositoryImpl implements ContactRepository {
    @Override
    public void someContactMethod(User user) {
        // 사용자 정의 구현
    }
    
    @Override
    public User anotherContactMethod(User user) {
        // 사용자 정의 구현
    }
}
```

### 3.3 다중 Fragment를 사용하는 리포지토리

```java
interface UserRepository extends CrudRepository<User, Long>, 
                               HumanRepository, 
                               ContactRepository {
    // 쿼리 메서드 선언
}
```

- 리포지토리는 여러 개의 사용자 정의 구현을 조합할 수 있습니다.
- 사용자 정의 구현은 기본 구현보다 높은 우선순위를 가집니다.
- 같은 메서드 시그니처가 있다면 사용자 정의 구현이 우선합니다.

## 4. 기본 메서드 재정의

### 4.1 공통 메서드 재정의를 위한 Fragment

```java
interface CustomizedSave<T> {
    <S extends T> S save(S entity);
}

class CustomizedSaveImpl<T> implements CustomizedSave<T> {
    @Override
    public <S extends T> S save(S entity) {
        // 사용자 정의 save 로직
        return entity;
    }
}
```

- save 메서드를 재정의하는 Fragment를 정의합니다.

### 4.2 재사용 가능한 Fragment 활용

```java
interface UserRepository extends CrudRepository<User, Long>, CustomizedSave<User> {
}

interface PersonRepository extends CrudRepository<Person, Long>, CustomizedSave<Person> {
}
```

## 5. 설정 및 구성

### 5.1 기본 설정

- Spring Data는 리포지토리가 위치한 패키지 하위에서 사용자 정의 구현 클래스를 자동으로 찾습니다.
- 기본적으로 `Impl` 접미사를 사용하여 구현 클래스를 찾습니다.

### 5.2 사용자 정의 접미사 설정

```java
@EnableJpaRepositories(repositoryImplementationPostfix = "MyPostfix")
class Configuration {
    // 설정
}
```

- 이 설정을 사용하면 `CustomizedUserRepositoryMyPostfix` 형태의 클래스를 찾습니다.

### 5.3 모호성 해결

- 동일한 클래스 이름의 구현체가 여러 패키지에 있는 경우, Spring Data는 빈 이름을 사용하여 어떤 것을 사용할지 결정합니다.

```java
// 첫 번째 구현체 (기본적으로 사용됨)
package com.acme.impl.one;

class CustomizedUserRepositoryImpl implements CustomizedUserRepository {
    // 구현
}

// 두 번째 구현체 (특별한 이름 지정)
package com.acme.impl.two;

@Component("specialCustomImpl")
class CustomizedUserRepositoryImpl implements CustomizedUserRepository {
    // 구현
}
```

- 위 경우 `CustomizedUserRepositoryImpl`은 기본적으로 사용됩니다.
- 첫번 째 구현체의 빈 이름은 `customizedUserRepositoryImpl`이 됩니다.
  - 이는 프래그맨트 인터페이스의 이름과 Impl 접미사를 조합한 것이기 때문에 첫 번째 구현체가 우선적으로 사용됩니다.
- 두 번째 구현체를 사용하려면 

## 6. 기본 리포지토리 커스터마이징

### 6.1 모든 리포지토리에 공통 기능 추가

- 모든 리포지토리의 동작을 변경하고 싶다면 기본 리포지토리 클래스를 확장할 수 있습니다.

```java
class MyRepositoryImpl<T, ID> extends SimpleJpaRepository<T, ID> {
    
    private final EntityManager entityManager;
    
    MyRepositoryImpl(JpaEntityInformation entityInformation,
                     EntityManager entityManager) {
        super(entityInformation, entityManager);
        this.entityManager = entityManager;
    }
    
    @Override
    @Transactional
    public <S extends T> S save(S entity) {
        // 모든 리포지토리에서 사용할 공통 save 로직
        return super.save(entity);
    }
}
```

### 6.2 사용자 정의 기본 리포지토리 설정

```java
@Configuration
@EnableJpaRepositories(repositoryBaseClass = MyRepositoryImpl.class)
class ApplicationConfiguration {
    // 설정
}
```

## 7. JpaContext 활용

### 7.1 다중 EntityManager 환경에서의 활용

- 여러 EntityManager 인스턴스를 사용하는 환경에서는 JpaContext를 활용할 수 있습니다.

```java
class UserRepositoryImpl implements UserRepositoryCustom {
    
    private final EntityManager em;
    
    @Autowired
    public UserRepositoryImpl(JpaContext context) {
        this.em = context.getEntityManagerByManagedType(User.class);
    }
    
    // 구현 메서드들
}
```

:::warning
JpaContext를 사용하면 도메인 타입이 다른 persistence unit에 할당되더라도 리포지토리를 수정할 필요가 없다는 장점이 있습니다.
:::

## 8. 실전 예제 및 테스트

### 8.1 검색 조건을 사용한 동적 쿼리 테스트

```java
@Test
public void searchTest() {
    // Given
    Team teamA = new Team("teamA");
    Team teamB = new Team("teamB");
    em.persist(teamA);
    em.persist(teamB);
    
    Member member1 = new Member("member1", 10, teamA);
    Member member2 = new Member("member2", 20, teamA);
    Member member3 = new Member("member3", 30, teamB);
    Member member4 = new Member("member4", 40, teamB);
    em.persist(member1);
    em.persist(member2);
    em.persist(member3);
    em.persist(member4);
    
    MemberSearchCondition condition = new MemberSearchCondition();
    condition.setAgeGoe(35);
    condition.setAgeLoe(40);
    condition.setTeamName("teamB");
    
    // When
    List<MemberTeamDto> result = memberRepository.search(condition);
    
    // Then
    assertThat(result).extracting("username").containsExactly("member4");
}
```

## 9. 대안적 접근법

:::tip
항상 사용자 정의 리포지토리가 필요한 것은 아닙니다. 경우에 따라서는 별도의 클래스를 만들어 Spring Bean으로 등록하고 직접 사용하는 것도 좋은 방법입니다.

예: `MemberQueryRepository`를 인터페이스가 아닌 클래스로 만들고 `@Repository` 어노테이션을 사용하여 Spring Bean으로 등록
:::

### 9.1 독립적인 리포지토리 클래스

```java
@Repository
@RequiredArgsConstructor
public class MemberQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    public List<MemberTeamDto> search(MemberSearchCondition condition) {
        // 구현 로직
    }
}
```

이 방법은 Spring Data JPA와는 별개로 동작하지만, 때로는 더 명확하고 관리하기 쉬울 수 있습니다.

## 참고

- https://docs.spring.io/spring-data/jpa/reference/repositories/custom-implementations.html