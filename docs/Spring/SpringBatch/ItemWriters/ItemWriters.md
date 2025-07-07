---
title: "ItemWriter"
description: "Spring Batch의 ItemWriter 구현체들을 상세히 알아봅니다. JdbcBatchItemWriter, HibernateItemWriter, FlatFileItemWriter 등 주요 구현체의 사용법과 특징, ClassifierCompositeItemWriter를 활용한 동적 데이터 처리, 그리고 커스텀 ItemWriter 개발 방법까지 실무에서 활용할 수 있는 완전한 가이드를 제공합니다."
tags: ["SPRING_BATCH", "ITEMWRITER", "DATABASE", "FILE_IO", "SPRING", "BACKEND", "JAVA"]
keywords: ["스프링배치", "Spring Batch", "ItemWriter", "아이템라이터", "배치처리", "batch processing", "데이터출력", "data output", "JdbcBatchItemWriter", "HibernateItemWriter", "FlatFileItemWriter", "ClassifierCompositeItemWriter", "커스텀라이터", "custom writer", "배치작업", "bulk insert", "파일출력", "file output", "데이터베이스", "database", "스프링", "Spring", "자바", "Java", "백엔드", "backend"]
draft: false
hide_title: true
---

## 1 ItemWriter

- ItemWriter는 Spring Batch에서 데이터를 출력하는 역할을 담당하는 핵심 인터페이스입니다.
- ItemReader와는 반대 개념으로, 데이터를 읽어오는 대신 데이터를 써내는 작업을 수행합니다.
- 데이터베이스 삽입/업데이트, 파일 쓰기, 메시지 큐 전송 등 다양한 출력 작업을 처리할 수 있습니다.
- ItemWriter는 ItemReader와 함께 Spring Batch의 청크 지향 처리(Chunk-oriented Processing)에서 핵심적인 역할을 합니다. 
  - Reader가 데이터를 읽어오면, Processor가 가공하고, Writer가 최종 결과를 출력하는 구조입니다.

### 1.1 인터페이스

```java
@FunctionalInterface
public interface ItemWriter<T> {
	void write(@NonNull Chunk<? extends T> chunk) throws Exception;
}
```

- ItemWriter는 매우 간단한 구조의 제네릭 인터페이스입니다.
- 단일 메서드 write()만을 정의하고 있어 구현이 용이합니다.
- 이 인터페이스는 제네릭 타입 T를 사용하여 다양한 종류의 데이터를 처리할 수 있습니다.

### 1.2 write 메서드의 특징

- write 메서드는 개별 아이템이 아닌 Chunk 단위로 데이터를 받습니다.
- ItemReader 인터페이스와 비교하면 read() 메서드가 단일 아이템을 반환하는 것과 달리, write() 메서드는 아이템의 목록을 받습니다.
- 이는 배치 처리에서 성능 최적화를 위해 여러 아이템을 묶어서 처리하기 때문입니다.
  - Spring Batch는 설정된 청크 크기만큼의 아이템을 모아서 ItemWriter에 전달합니다.
  - 예를 들어, 청크 크기가 100이면 100개의 아이템이 리스트 형태로 전달됩니다.
  - 이를 통해 네트워크 왕복 횟수를 줄이고 성능을 향상시킬 수 있습니다.
- 청크 프로세싱에 대해서 더 자세히 알고 싶다면 아래 문서를 참고하세요.
  - [Chunk oriented Processing](../Config/StepConfig/Chunk-orientedProcessing/Chunk-orientedProcessing.md)

## 2 데이터베이스 기반 구현체

- Spring Batch는 다양한 데이터베이스 기반 ItemWriter 구현체를 제공합니다.
- 구현체 목록을 확인하고 싶다면 아래 링크를 참고하세요.
  - [레퍼런스](https://docs.spring.io/spring-batch/reference/readers-and-writers/item-reader-writer-implementations.html#databaseWriters)

### 2.1 JdbcBatchItemWriter

- JdbcBatchItemWriter는 JDBC를 사용하여 데이터베이스에 배치 처리로 데이터를 저장하는 ItemWriter 구현체입니다.
- JdbcBatchItemWriter는 내부적으로 JdbcTemplate를 감싸고 있는 래퍼에 지나지 않습니다.
  - 청크 단위로 전달받은 아이템들을 JdbcTemplate의 배치 기능을 사용하여 한 번에 SQL을 실행하여 성능을 최적화합니다.
- SQL 파라미터를 채우는 방식에 따라 두 가지 구현 방법을 제공합니다.
  - Named Parameter 방식: SQL 쿼리에서 파라미터 이름을 사용하여 매핑합니다.
  - Positional Parameter 방식: 물음표(`?`)를 값의 플레이스홀더로 사용하여 파라미터 순서를 지정합니다.

#### 2.1.1 주요 구성 옵션

- **dataSource**: 데이터베이스 연결을 위한 DataSource 설정 (필수)
- **sql**: 실행할 SQL 쿼리문 설정 (필수)
- **assertUpdates**: SQL 실행 후 영향받은 행 수를 검증할지 여부 (기본값: true)
- **itemSqlParameterSourceProvider**: Named Parameter 방식에서 아이템을 SqlParameterSource로 변환하는 프로바이더
- **itemPreparedStatementSetter**: Positional Parameter 방식에서 PreparedStatement에 파라미터를 설정하는 세터

#### 2.1.2 Named Parameter 방식

- 콜론(`:`)을 사용한 Named Parameter 방식으로 SQL을 작성합니다.
- Named Parameter 방식을 사용하려면 ItemSqlParameterSourceProvider를 설정해야 합니다.
- ItemSqlParameterSourceProvider의 구현체는 아이템에서 파라미터 값을 추출해 SqlParameterSource 객체로 반환하는 역할을 합니다.
- 스프링 배치는 이 인터페이스에 대한 구현체를 제공해 아이템에서 값을 추출하려고 직접 구현할 필요가 없습니다.
  - BeanPropertyItemSqlParameterSourceProvider를 사용하여 아이템의 프로퍼티를 자동으로 매핑할 수 있습니다.
  - 이 구현체를 사용한다면, 아이템의 필드명과 SQL 쿼리의 Named Parameter명이 일치해야 합니다.
  - JdbcBatchItemWriterBuilder를 사용할 때 `beanMapped()` 메서드를 호출하면 BeanPropertyItemSqlParameterSourceProvider 구현체를 사용하게 됩니다.

```java
@Bean
public JdbcBatchItemWriter<Person> namedParameterWriter(DataSource dataSource) {
    return new JdbcBatchItemWriterBuilder<Person>()
            .dataSource(dataSource)
            .sql("INSERT INTO people (first_name, last_name, age) VALUES (:firstName, :lastName, :age)")
            .beanMapped()  // Named Parameter 방식에서 사용
            .build();
}
```

- 위 예시에서 `beanMapped()` 메서드를 호출하면, `BeanPropertyItemSqlParameterSourceProvider`가 자동으로 설정되어 아이템의 프로퍼티를 Named Parameter로 매핑합니다.
- Person 클래스의 필드명과 SQL 쿼리의 Named Parameter명이 일치해야 합니다.
- 위 예시에서는 `firstName`, `lastName`, `age` 필드가 Person 클래스에 정의되어 있어야 합니다.

##### 커스텀 ItemSqlParameterSourceProvider 구현

- 만약 BeanPropertyItemSqlParameterSourceProvider 외에 다른 방식으로 아이템의 값을 추출하고 싶다면, ItemSqlParameterSourceProvider 인터페이스를 구현하여 커스텀 프로바이더를 만들 수 있습니다.
- 커스텀 구현체는 데이터 변환, 타입 지정, 조건부 로직 등을 추가할 수 있어 더 유연한 처리가 가능합니다.
- 커스텀 구현이 필요한 경우
  - 필드명과 SQL 파라미터명이 다른 경우(같으면 BeanPropertyItemSqlParameterSourceProvider 사용)
  - 데이터 변환이나 계산이 필요한 경우
  - 특정 SQL 타입을 명시해야 하는 경우
  - 조건부 로직이 필요한 경우

```java
public class CustomItemSqlParameterSourceProvider implements ItemSqlParameterSourceProvider<Person> {
   @Override
   public SqlParameterSource createSqlParameterSource(Person person) {
       return new MapSqlParameterSource()
           .addValue("firstName", person.getFirstName())
           .addValue("lastName", person.getLastName())
           .addValue("age", person.getAge());
   }
}
```

#### 2.1.3 Positional Parameter(?) 방식

- 물음표(?)를 사용한 Positional Parameter 방식으로 SQL을 작성합니다.
- `ItemPreparedStatementSetter`를 구현하여 수동으로 파라미터를 설정합니다.
  - ItemPreparedStatementSetter는 가 아이템의 값을 추출하고 PreparedStatement에 그 값을 세팅하는 것을 추상화한 인터페이스입니다.
- 파라미터의 순서와 타입을 직접 제어할 수 있어 더 세밀한 매핑이 가능합니다.

```java
@Bean
public JdbcBatchItemWriter<Person> positionalParameterWriter(DataSource dataSource) {
    return new JdbcBatchItemWriterBuilder<Person>()
            .dataSource(dataSource)
            .sql("INSERT INTO people (first_name, last_name, age) VALUES (?, ?, ?)")
            .itemPreparedStatementSetter(new ItemPreparedStatementSetter<Person>() {
                @Override
                public void setValues(Person person, PreparedStatement ps) throws SQLException {
                    ps.setString(1, person.getFirstName());    // 첫 번째 ?
                    ps.setString(2, person.getLastName());     // 두 번째 ?
                    ps.setInt(3, person.getAge());             // 세 번째 ?
                }
            })
            .build();
}
```

### 2.2 HibernateItemWriter

- HibernateItemWriter는 Hibernate를 사용하여 데이터베이스에 데이터를 저장하는 ItemWriter 구현체입니다.
- Hibernate Session을 사용하여 엔티티 객체를 저장하며, 일괄 처리를 위해 flush()와 clear()를 호출합니다.
- SessionFactory와 엔티티 클래스 정보를 설정하여 사용할 수 있습니다.

**예시**

```java
@Bean
public HibernateItemWriter<Person> writer(SessionFactory sessionFactory) {
    return new HibernateItemWriterBuilder<Person>()
            .sessionFactory(sessionFactory)
            .build();
}
```

## 3. 파일 기반 구현체

### 3.1 FlatFileItemWriter

- FlatFileItemWriter는 데이터를 파일로 출력하는 ItemWriter 구현체입니다.
- 다양한 형식(CSV, XML, JSON 등)으로 데이터를 출력할 수 있으며, 파일 경로와 출력 포맷을 설정할 수 있습니다.
- LineAggregator를 사용하여 객체를 문자열로 변환하여 출력합니다.

**예시**

```java
@Bean
public FlatFileItemWriter<Person> writer() {
    return new FlatFileItemWriterBuilder<Person>()
            .name("personItemWriter")
            .resource(new FileSystemResource("output/persons.csv"))
            .delimited()
            .names("firstName", "lastName")
            .build();
}
```

## 4 ClassifierCompositeItemWriter

- ClassifierCompositeItemWriter는 Spring Batch에서 제공하는 ItemWriter의 한 형태로, 분류기(Classifier) 기능을 사용하여 항목을 기반으로 다른 ItemWriter를
  선택합니다.
- 즉, 기록하려는 항목의 유형 또는 상태에 따라 서로 다른 ItemWriter를 선택할 수 있습니다.
- 이렇게 하면 동일한 흐름에서 서로 다른 유형의 데이터를 동적으로 처리하는 것이 가능해집니다.
- 예를 들어, 여러분이 고객 데이터와 제품 데이터를 각각 다른 테이블에 작성해야하는 경우가 있다고 가정해보겠습니다. 이 경우 ClassifierCompositeItemWriter를 사용하면, 입력 데이터의 유형(
  고객 또는 제품)에 따라 적절한 ItemWriter(고객 데이터 또는 제품 데이터를 처리하는)를 선택할 수 있습니다.
- 분류기(Classifier)는 고유의 분류 로직을 포함하는 컴포넌트로, 보통 람다 표현식 또는 별도의 클래스로 정의됩니다.
- 이 분류기는 각 항목에 대해 호출되며, 선택된 ItemWriter의 write() 메서드를 호출 합니다.
- 이를 통해 항목 유형에 따라 다른 쓰기 작업을 수행하도록 구성할 수 있습니다.

## 5 커스텀 ItemWriter 개발

- 스프링 배치에서 제공하는 ItemWriter 구현체로 처리할 수 없는 경우, 커스텀 ItemWriter를 개발할 수 있습니다.
- ItemWriter 인터페이스를 구현하여 write() 메서드를 오버라이드하면 됩니다.
- 필요에 따라 다양한 방식으로 데이터를 처리하고 출력할 수 있습니다.