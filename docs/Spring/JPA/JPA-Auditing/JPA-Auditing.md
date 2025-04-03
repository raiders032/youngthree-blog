---
title: "Spring Data JPA Auditing"
description: "Spring Data에서 제공하는 Auditing 기능을 통해 엔티티의 생성 및 수정 이력을 추적하는 방법을 알아봅니다. 순수 JPA 방식부터 스프링의 어노테이션 기반 방식, 인터페이스 기반 방식까지 다양한 구현 방법과 실무에서의 활용 팁을 소개합니다."
tags: ["JPA", "SPRING_DATA", "AUDITING", "SPRING", "BACKEND", "JAVA"]
keywords: ["스프링 데이터", "Spring Data", "JPA", "Auditing", "감사", "이력 추적", "엔티티 추적", "CreatedDate", "LastModifiedDate", "CreatedBy", "LastModifiedBy", "AuditorAware", "엔티티 리스너", "EntityListener"]
draft: false
hide_title: true
---

## 1. Auditing 소개

- Spring Data는 엔티티의 생성자와 수정자, 그리고 생성 시간과 수정 시간을 자동으로 추적할 수 있는 강력한 기능을 제공합니다
- 이 기능을 통해 누가 언제 데이터를 변경했는지 투명하게 관리할 수 있어요
- Auditing 기능을 사용하려면 엔티티 클래스에 특정 애노테이션을 추가하거나 인터페이스를 구현하면 됩니다
- 추가로 애플리케이션 설정에서 감사 기능을 활성화하는 과정이 필요합니다

## 2. 순수 JPA 사용하기

- 먼저 Spring Data의 기능 없이 순수 JPA만으로 엔티티의 생성 시간과 수정 시간을 기록하는 방법을 알아보겠습니다
- JPA에서는 엔티티의 생명주기에 관련된 이벤트를 처리할 수 있는 여러 콜백 어노테이션을 제공합니다
	- `@PrePersist`: 엔티티가 저장되기 전에 호출되는 메서드를 지정
	- `@PostPersist`: 엔티티가 저장된 후에 호출되는 메서드를 지정
	- `@PreUpdate`: 엔티티가 업데이트되기 전에 호출되는 메서드를 지정
	- `@PostUpdate`: 엔티티가 업데이트된 후에 호출되는 메서드를 지정

### 2.1 예시

```java
@MappedSuperclass
@Getter
public class JpaBaseEntity {
    @Column(updatable = false)
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdDate = now;
        updatedDate = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedDate = LocalDateTime.now();
    }
}
```

- 위 클래스는 생성 시간과 수정 시간을 관리하는 기본 엔티티입니다
- `@PrePersist`를 통해 엔티티가 처음 저장될 때 생성 시간과 수정 시간을 현재 시간으로 설정합니다
- `@PreUpdate`를 통해 엔티티가 업데이트될 때마다 수정 시간을 현재 시간으로 갱신합니다
- 시간 추적이 필요한 클래스는 간단히 이 클래스를 상속받아 사용할 수 있습니다

```java
public class Member extends JpaBaseEntity {
  // 멤버 클래스의 다른 필드와 메서드들...
}
```

## 3. 어노테이션 기반 Auditing

- Spring Data는 엔티티의 감사 정보를 더 편리하게 관리할 수 있는 어노테이션들을 제공합니다
- 주요 어노테이션은 다음과 같습니다:
	- `@CreatedDate`: 엔티티가 생성된 시간을 기록
	- `@LastModifiedDate`: 엔티티가 마지막으로 수정된 시간을 기록
	- `@CreatedBy`: 엔티티를 생성한 사용자 정보를 기록
	- `@LastModifiedBy`: 엔티티를 마지막으로 수정한 사용자 정보를 기록

### 3.1 예시

```java
@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass
public class BaseEntity {
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdDate;
    
    @LastModifiedDate
    private LocalDateTime lastModifiedDate;
    
    @CreatedBy
    @Column(updatable = false)
    private String createdBy;
    
    @LastModifiedBy
    private String lastModifiedBy;
}
```

- `@EntityListeners(AuditingEntityListener.class)`는 이 엔티티에 Auditing 기능을 적용한다는 의미입니다
- 필요한 정보에 따라 어노테이션을 선택적으로 적용할 수 있습니다
- 날짜/시간 필드는 Java 8의 날짜 타입(LocalDateTime, LocalDate 등)뿐만 아니라 long, Long, 그리고 전통적인 Java Date와 Calendar 타입도 사용 가능합니다
- 이런 감사 관련 필드들은 반드시 루트 엔티티에 있을 필요는 없으며, 임베디드 타입에도 적용할 수 있습니다

## 4. 인터페이스 기반 감사 메타데이터

- 어노테이션 대신 인터페이스를 사용해 감사 메타데이터를 정의할 수도 있습니다
- Spring Data는 `Auditable` 인터페이스를 제공하며, 이를 구현하면 모든 감사 속성에 대한 getter/setter 메서드를 사용할 수 있습니다

```java
package org.springframework.data.domain;

import java.time.temporal.TemporalAccessor;
import java.util.Optional;

public interface Auditable<U, ID, T extends TemporalAccessor> extends Persistable<ID> {
    Optional<U> getCreatedBy();

    void setCreatedBy(U createdBy);

    Optional<T> getCreatedDate();

    void setCreatedDate(T creationDate);

    Optional<U> getLastModifiedBy();

    void setLastModifiedBy(U lastModifiedBy);

    Optional<T> getLastModifiedDate();

    void setLastModifiedDate(T lastModifiedDate);
}
```

- 이 인터페이스는 제네릭을 사용해 사용자 타입(U), ID 타입(ID), 그리고 시간 타입(T)을 유연하게 지정할 수 있습니다

## 5. AuditorAware 활용하기

- `@CreatedBy`나 `@LastModifiedBy` 어노테이션을 사용할 때는 현재 사용자 정보를 어떻게 가져올지 정의해야 합니다
- Spring Data는 이를 위해 `AuditorAware<T>` 인터페이스를 제공합니다
- 이 인터페이스를 구현해서 현재 로그인한 사용자나 시스템 정보를 가져오는 방법을 정의할 수 있습니다

### 5.1 예시

```java
class SpringSecurityAuditorAware implements AuditorAware<User> {

  @Override
  public Optional<User> getCurrentAuditor() {

    return Optional.ofNullable(SecurityContextHolder.getContext())
            .map(SecurityContext::getAuthentication)
            .filter(Authentication::isAuthenticated)
            .map(Authentication::getPrincipal)
            .map(User.class::cast);
  }
}
```

- 위 예시는 Spring Security를 사용해 현재 인증된 사용자 정보를 가져오는 방법을 보여줍니다
- SecurityContextHolder에서 현재 인증 정보를 가져와 User 객체로 변환하는 과정을 구현했습니다
- 실제 구현은 애플리케이션의 인증 방식에 따라 달라질 수 있습니다

## 6. 설정

### 6.1 AuditingEntityListener

- `AuditingEntityListener`는 JPA 엔티티의 감사 메타데이터를 처리하는 리스너입니다
- 이 리스너가 `@CreatedDate`, `@LastModifiedDate`, `@CreatedBy`, `@LastModifiedBy` 어노테이션을 인식하고 처리합니다

### 6.2 Auditing 활성화

- Spring Data JPA 1.5부터는 `@EnableJpaAuditing` 어노테이션을 사용해 감사 기능을 쉽게 활성화할 수 있습니다

```java
@Configuration
@EnableJpaAuditing
class Config {

  @Bean
  public AuditorAware<AuditableUser> auditorProvider() {
    return new AuditorAwareImpl();
  }
}
```

- 위 설정을 통해 Spring Data JPA의 Auditing 기능이 활성화됩니다
- `AuditorAware` 구현체를 빈으로 등록하여 사용자 정보를 제공하는 방법을 정의합니다

## 7. 실무 활용 팁

- 실무에서는 모든 엔티티에 생성 시간과 수정 시간은 필요하지만, 생성자와 수정자 정보는 필요 없는 경우가 많습니다
- 이런 경우를 위해 기본 엔티티를 계층적으로 구성하면 편리합니다

```java
public class BaseTimeEntity {
  @CreatedDate
  @Column(updatable = false)
  private LocalDateTime createdDate;
  
  @LastModifiedDate
  private LocalDateTime lastModifiedDate;
}
```

```java
public class BaseEntity extends BaseTimeEntity {
  @CreatedBy
  @Column(updatable = false)
  private String createdBy;
  
  @LastModifiedBy
  private String lastModifiedBy;
}
```

- 위와 같이 구성하면 시간 정보만 필요한 엔티티는 `BaseTimeEntity`를, 사용자 정보까지 필요한 엔티티는 `BaseEntity`를 상속받아 사용할 수 있습니다
- 이렇게 계층적으로 설계하면 필요에 따라 적절한 기본 클래스를 선택할 수 있어 유연성이 높아집니다

## 참고

- https://docs.spring.io/spring-data/jpa/reference/auditing.html