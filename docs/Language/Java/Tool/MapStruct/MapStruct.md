## 1 MapStruct

* MapStruct는 type-safe하게 빈과 빈을 매핑시켜주는 annotation processor이다.
* 개발자는 mapper 인터페이스만 작성하면 컴파일 시점에 MapStruct가 해당 인터페이스의 구현을 자동으로 만들어준다.
* 소스 객체에서 타켓 객체로 매핑할 때 자바의 평범한 메소드를 이용해 매핑한다
	* 리플렉션을 사용하지 않아 성능이 좋다.



## 2 Dependency

**Maven**

```xml
<properties>
    <org.mapstruct.version>1.4.2.Final</org.mapstruct.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
        <version>${org.mapstruct.version}</version>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.8.1</version>
            <configuration>
                <source>1.8</source>
                <target>1.8</target>
                <annotationProcessorPaths>
                    <path>
                        <groupId>org.mapstruct</groupId>
                        <artifactId>mapstruct-processor</artifactId>
                        <version>${org.mapstruct.version}</version>
                    </path>
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
</build>
```

**Gradle**

```groovy
plugins {
    id "com.diffplug.eclipse.apt" version "3.26.0" // Only for Eclipse
}

dependencies {
    implementation "org.mapstruct:mapstruct:${mapstructVersion}"
    annotationProcessor "org.mapstruct:mapstruct-processor:${mapstructVersion}"

    // If you are using mapstruct in test code
    testAnnotationProcessor "org.mapstruct:mapstruct-processor:${mapstructVersion}"
}
```



## 3 Defining a mapper

* mapper를 만들고 싶다면 인터페이스만 정의하고 인터페이스에  `@Mapper` 애노테이션을 적용한다.
* MapStruct가 빌드 시점의 인터페이스의 구현체를 만들어 준다.



### 3.1 Basic mappings

- 소스 엔티티와 타겟 엔티티의 프로퍼티 이름이 같으면 자동적으로 매핑
- 소스 엔티티와 타겟 엔티티의 프로퍼티 이름이 다르면 `@Mapping` 애노테이션을 통해 명시

```java
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface CarMapper {
  @Mapping(source = "make", target = "manufacturer")
  @Mapping(source = "numberOfSeats", target = "seatCount")
  CarDto carToCarDto(Car car);

  @Mapping(source = "name", target = "fullName")
  PersonDto personToPersonDto(Person person);
}
```



**Code generated by MapStruct**

- 아래는 MapStruct가 생성한 CarMapper 인터페이스의 구현체다.
- 리플렉션 없이 게터와 세터를 이용해 빈과 빈을 매핑하고 있다.

```java
public class CarMapperImpl implements CarMapper {

  @Override
  public CarDto carToCarDto(Car car) {
    if ( car == null ) {
      return null;
    }

    CarDto carDto = new CarDto();

    if ( car.getFeatures() != null ) {
      carDto.setFeatures( new ArrayList<String>( car.getFeatures() ) );
    }
    carDto.setManufacturer( car.getMake() );
    carDto.setSeatCount( car.getNumberOfSeats() );
    carDto.setDriver( personToPersonDto( car.getDriver() ) );
    carDto.setPrice( String.valueOf( car.getPrice() ) );
    if ( car.getCategory() != null ) {
      carDto.setCategory( car.getCategory().toString() );
    }
    carDto.setEngine( engineToEngineDto( car.getEngine() ) );

    return carDto;
  }

  @Override
  public PersonDto personToPersonDto(Person person) {
    //...
  }

  private EngineDto engineToEngineDto(Engine engine) {
    if ( engine == null ) {
      return null;
    }

    EngineDto engineDto = new EngineDto();

    engineDto.setHorsePower(engine.getHorsePower());
    engineDto.setFuel(engine.getFuel());

    return engineDto;
  }
}
```



### 3.2 Adding custom methods to mappers

- 종종 MapStruct가 매핑 코드를 생성하지 못하는 복잡한 매핑 로직이 있을 수 있다.
- 이러한 경우 수작업으로 매핑 작업을 할 수 있다.
- Mapper 인터페이스에 default 메서드로 수동 매핑 로직을 작성한다.
- 이 메서드는 아규먼트의 타입과 반환타입이 일치하면 호출될 것이다.



**예시**

```java
@Mapper
public interface PostInfoMapper {
  PostInfoMapper INSTANCE = Mappers.getMapper(PostInfoMapper.class);

  @Mapping(target = "userId", source = "user.id")
  @Mapping(target = "postId", source = "id")
  @Mapping(target = "boardName", source = "board.name")
  @Mapping(target = "likeCount", expression = "java(post.getLikeCount())")
  @Mapping(target = "commentCount", expression = "java(post.getComments().size())")
  @Mapping(target = "tags", expression = "java(post.getTagNames())")
  PostInfo of(Post post);

  default Map<CommentInfo, List<CommentInfo>> of(List<Comment> comments) {
    Map<CommentInfo, List<CommentInfo>> commentMap = new LinkedHashMap<>();

    for (Comment comment : comments) {
      if (comment.getParentComment() == null) {
        commentMap.put(of(comment), new ArrayList<>());
        continue;
      }
      Comment parentComment = comment.getParentComment();
      commentMap.get(parentComment).add(of(comment));
    }

    return commentMap;
  }
}
```



## 5 Retrieving a mapper

- 빈과 빈을 매핑하기 위해서는 mapper가 필요한데 mapper를 얻어오는 방법을 알아보자.



### 5.1 The Mappers factory 

* DI framework를 사용하지 않고 `org.mapstruct.factory.Mappers` 클래스를 통해 Mapper 인스턴스를 얻을 수 있다.
* 관습적으로 mapper 인터페이스는 INSTANCE라는 이름을 가진 멤버를 정의한다.

```java
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface CarMapper {
  CarMapper INSTANCE = Mappers.getMapper( CarMapper.class );
  CarDto carToCarDto(Car car);
}
```

```java
Car car = ...;
CarDto dto = CarMapper.INSTANCE.carToCarDto( car );
```



### 5.2 [Using dependency injection](https://mapstruct.org/documentation/stable/reference/html/#using-dependency-injection)




## 6 Advanced mapping options

### 6.1 Expressions

- [레퍼런스](https://mapstruct.org/documentation/stable/reference/html/#expressions)
- 아래와 같이 자바 표현식을 사용할 수 있다.

```java
@Mapper
public interface TakeoutOrderInfoMapper {
    TakeoutOrderInfoMapper INSTANCE = Mappers.getMapper(TakeoutOrderInfoMapper.class);
    
  @Mapping(target = "takeoutOrderId", source = "id")
    @Mapping(target = "shopId", source = "takeoutOrder.shop.id")
    @Mapping(target = "totalPrice", expression = "java(takeoutOrder.getTotalPrice())")
    TakeoutOrderInfo of(TakeoutOrder takeoutOrder);
}
```



## 7 생성자 사용

- [레퍼런스](https://mapstruct.org/documentation/stable/reference/html/#mapping-with-constructors)
- 소스에서 타겟 객체로 매핑할 때 생성자를 사용할 수 있다.
- 매핑할 때 사용할 생성자를 선택하는 규칙이 존재한다.



**생성자 우선순위**

1. `@Default` 애노테이션을 붙은 생성자를 선택한다.
2. 하나의 퍼블릭 생성자가 있는 경우 해당 생성자를 사용한다.
3. 파라미터가 없는 기본 생성자가 선택된다. 다른 파라미터가 있는 생성자는 무시된다.
4. 사용가능 한 생성자가 여러개인 경우 컴파일 에러가 발생한다.



**예시**

```java
public class Vehicle {

    protected Vehicle() { }

    // MapStruct will use this constructor, because it is a single public constructor
    public Vehicle(String color) { }
}

public class Car {

    // MapStruct will use this constructor, because it is a parameterless empty constructor
    public Car() { }

    public Car(String make, String color) { }
}

public class Truck {

    public Truck() { }

    // MapStruct will use this constructor, because it is annotated with @Default
    @Default
    public Truck(String make, String color) { }
}

public class Van {

    // There will be a compilation error when using this class because MapStruct cannot pick a constructor

    public Van(String make) { }

    public Van(String make, String color) { }

}
```



참고

* https://mapstruct.org/documentation/stable/reference/html/#defining-mapper