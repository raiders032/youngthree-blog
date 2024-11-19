## 1 MyBatis

- MyBatis는 스프링에서 제공하는 JdbcTemplate보다 더 많은 기능을 제공하는 SQL Mapper다.
- 기본적으로 JdbcTemplate이 제공하는 대부분의 기능을 제공한다.
- JdbcTemplate과 비교해서 MyBatis의 가장 매력적인 점은 SQL을 XML에 편리하게 작성할 수 있고 또 **동적 쿼리**를 매우 편리하게 작성할 수 있다는 점이다.



### 1.1 의존성 추가

- [레퍼런스](https://mybatis.org/mybatis-3/dependency-info.html)

**Gradle**

```grovy
compile 'org.mybatis:mybatis:3.5.13'
```



**Maven**
```xml
<dependency>
  <groupId>org.mybatis</groupId>
  <artifactId>mybatis</artifactId>
  <version>3.5.13</version>
</dependency>
```



### 1.2 SqlSessionFactory

- 객체는 SQL 세션을 생성하는 팩토리 역할을 하며, MyBatis의 핵심 구성 요소 중 하나다.
- SqlSessionFactory를 통해 얻은 SqlSession 인스턴스는 데이터베이스에 SQL 명령을 실행하기 위한 주요 인터페이스다.
- SqlSessionFactory 인스턴스는 SqlSessionFactoryBuilder를 사용하여 생성할 수 있다. 
	- SqlSessionFactoryBuilder는 XML 설정 파일이나 사용자 정의 Configuration 클래스 인스턴스에서 SqlSessionFactory 인스턴스를 생성한다.



**SqlSessionFactory 생성하기(XML)**

```java
String resource = "org/mybatis/example/mybatis-config.xml"; InputStream inputStream = Resources.getResourceAsStream(resource);
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
```



### 1.3  SqlSession

- SqlSessionFactory를 사용하여 SqlSession 인스턴스를 얻을 수 있다.
- SqlSession은 데이터베이스에 대한 SQL 명령을 실행하는 데 필요한 모든 메소드를 포함하고 있다.



## 2 Configuration

- MyBatis의 설정은 MyBatis의 동작 방식에 중대한 영향을 미칩니다.
- 구성 파일의 상위 수준 구조는 아래과 같습니다.



**구조**

- **configuration**: MyBatis 설정의 루트 요소.
- **properties**: 외부 속성을 구성하는데 사용. 예를 들어, 데이터베이스 연결 정보 같은 것들.
- **settings**: MyBatis의 동작 방식을 조정할 수 있는 세부 설정을 제공한다.
- **typeAliases**: 자바 타입에 대한 별칭을 설정하여, XML 구성에서 사용할 수 있게 한다.
- **typeHandlers**: 데이터베이스와의 커뮤니케이션에서 자바 타입과 JDBC 타입 간의 변환을 관리한다.
- **objectFactory**: 결과 객체의 인스턴스를 생성할 때 사용하는 팩토리.
- **plugins**: MyBatis가 실행 중인 특정 시점에 호출을 가로채는 플러그인을 구성한다.
- **environments**: 다양한 환경(예: 개발, 테스트, 프로덕션)에 대한 설정을 정의한다.
    - **environment**: 특정 환경에 대한 구성을 정의한다.
    - **transactionManager**: 트랜잭션 관리 방식을 설정한다.
    - **dataSource**: 데이터베이스 연결 정보를 설정한다.
- **databaseIdProvider**: 데이터베이스 벤더를 식별하는데 사용된다. 다양한 데이터베이스에서 작동하는 SQL을 제공할 때 유용하다.
- **mappers**: SQL 매퍼 파일들의 위치를 지정한다. 이는 SQL 명령어들을 포함한 XML 파일들을 의미한다.



## 3 Mapper Interface

- 마이바티스 매핑 XML을 호출해주는 매퍼 인터페이스를  선언한다.
- 인터페이스에는 @Mapper 애노테이션을 붙여주어야 한다. 그래야 MyBatis에서 인식할 수 있다.



## 4 Mapper XML

- [레퍼런스](https://mybatis.org/mybatis-3/sqlmap-xml.html#Result_Maps)



### select

- [레퍼런스](https://mybatis.org/mybatis-3/sqlmap-xml.html#select)



### insert

- [레퍼런스](https://mybatis.org/mybatis-3/sqlmap-xml.html#insert-update-and-delete)



### Result Maps

- Result Maps를 사용하면 SQL 쿼리 결과를 Java 객체로 바인딩할 수 있다.




## 5 Dynamic SQL





## 6 MyBatis의 플러그인

- MyBatis는 "플러그인"이라는 강력한 기능을 제공합니다. 
- 이 기능을 통해 개발자는 매핑된 구문의 실행 도중 특정 지점에서 호출을 가로챌 수 있습니다. 
- 이 기능은 런타임에 MyBatis의 기존 동작을 수정하거나 사용자 정의 동작을 추가하는 데 특히 유용합니다.



### 6.1 플러그인

- [레퍼런스](https://mybatis.org/mybatis-3/configuration.html#plugins)
- MyBatis는 실행 중 특정 시점에서 호출을 가로채는 것을 허용한다.
- 기본적으로 MyBatis는 다음의 메소드 호출을 가로채도록 플러그인을 허용한다
	- Executor (update, query, flushStatements, commit, rollback, getTransaction, close, isClosed)
	- ParameterHandler (getParameterObject, setParameters)
	- ResultSetHandler (handleResultSets, handleOutputParameters)
	- StatementHandler (prepare, parameterize, batch, update, query)
- MyBatis도 결국에는 JDBC를 사용하는데 JDBC를 사용하는 여러 시점에 개입할 수 있도록 플러그인을 허용하는 것이다.
- 예를 들면 StatementHandler의 prepare 메서드는 MyBatis의 SQL 쿼리 실행 과정 중에서 SQL문을 준비하고 JDBC의 PreparedStatement를 생성하는 단계다.
	- 이 시점에 개입해서 SQL 쿼리를 실행하기 전에 실제로 실행될 SQL을 수정하거나 조작할 수 있다.



### 6.2 @Intercepts

- `@Intercepts` 어노테이션은 MyBatis가 제공하는 플러그인을 만들 때 사용된다.
- 이를 통해 개발자는 특정 메서드 호출을 가로챌 수 있으며, 이는 MyBatis의 기본 동작에 영향을 미칠 수 있다.



### 6.3 @Signature

- 어노테이션은 가로챌 메소드의 시그니처를 정의한다.
- type, method, args로 구성된다.


**type**

- 이 플러그인이 개입할 대상의 타입이다.
	- 가로채야 할 메소드가 속한 클래스나 인터페이스.
- `StatementHandler`는 MyBatis에서 SQL 구문을 준비하는 클래스다.



**method**

- 해당 플러그인이 개입할 대상의 메서드 이름이다.



**args**

- 가로채야 할 메소드의 매개변수 타입들을 배열로 나타냅니다



### 6.4 Invocation

- Invocation 객체는 MyBatis에서 플러그인 인터셉터(Interceptor)를 작성할 때 사용되는 핵심 클래스입니다. 
- 이는 특정 메소드 호출을 가로채기 위한 메커니즘을 제공합니다. 
- Invocation 객체는 인터셉터가 원래 메소드 호출을 수정하거나 확장할 수 있도록 필요한 정보들을 담고 있습니다. 
- 여기에는 다음과 같은 주요 구성 요소가 포함됩니다
	- **Target**: 실제로 메소드를 호출하는 대상 객체입니다. 예를 들어, MyBatis에서 SQL 실행을 담당하는 Executor 객체가 될 수 있습니다.
	- **Method**: 호출될 메소드를 나타내는 Method 객체입니다. Java 리플렉션을 통해 메소드의 이름, 매개변수 타입 등을 조회하거나 호출할 수 있습니다.
	- **Args**: 메소드 호출에 전달될 인수 배열입니다. 이 배열에는 메소드에 전달된 인자들이 순서대로 포함됩니다. 예를 들어, MappedStatement, parameterObject, RowBounds, ResultHandler와 같은 객체들이 포함될 수 있습니다.



#### 6.4.1

#### 6.4.2

#### 6.4.3 Args

- Invocation 객체의 Args는 메소드 호출 시 전달되는 인수(arguments) 배열을 포함하고 있습니다. 
- 이 배열은 MyBatis의 플러그인이 가로채는 메소드 호출에 전달된 실제 데이터입니다. 
- 이를 통해 플러그인은 메소드 호출 전후에 특정 작업을 수행하거나, 호출된 메소드의 동작을 수정할 수 있습니다.
- Args 배열은 호출되는 메소드의 시그니처에 따라 달라질 수 있으며, 각 인수는 그 위치에 맞는 특정 객체입니다. 
- 일반적으로 MyBatis의 Executor와 관련된 플러그인에서 query 메소드를 가로챌 때 다음과 같은 요소들이 포함됩니다:
	1. **MappedStatement (mappedStatement)**: 이 객체는 실행할 SQL 문에 대한 모든 정보가 포함된 MyBatis의 중요한 구성 요소입니다. SQL 문, 매핑된 결과 객체, 입력 매개변수 등의 정보를 담고 있습니다.
	2. **Parameter Object (parameterObject)**: SQL 쿼리에 바인딩될 실제 데이터가 포함된 객체입니다. 이 객체는 SQL 실행 시 필요로 하는 모든 입력 매개변수를 담고 있으며, 간단한 데이터 타입일 수도 있고, 복잡한 사용자 정의 객체일 수도 있습니다.
	3. **RowBounds (rowBounds)**: 페이징 정보나 결과 제한을 지정하는 데 사용되는 객체입니다. limit와 offset 값을 설정하여 쿼리 결과의 일부만을 가져올 수 있게 합니다. 기본적으로 RowBounds.DEFAULT는 제한 없이 모든 결과를 가져오는 것을 의미합니다.
	4. **ResultHandler (resultHandler)**: 쿼리 실행 후 결과를 처리하는 객체입니다. 기본적으로 MyBatis는 결과를 리스트로 반환하지만, ResultHandler를 사용하여 결과 처리를 커스터마이징할 수 있습니다. 예를 들어, 결과를 스트리밍 방식으로 처리하거나, 특정 로직에 맞게 데이터를 변환할 수 있습니다.