## 1. Spring Caching

- Spring Framework는 애플리케이션에 투명하게 캐싱을 추가하는 기능을 제공합니다.
- 이 추상화의 핵심은 메소드에 캐싱을 적용하여 캐시의 정보를 기반으로 실행 횟수를 줄이는 것입니다.
- 캐싱 로직은 호출자에게 어떠한 간섭도 없이 투명하게 적용됩니다.
- Spring Boot는 @EnableCaching 어노테이션을 통해 캐싱 지원이 활성화되는 한 캐시 인프라를 자동 설정합니다

### 1.1 의존성

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-cache'
}
```

- Spring Boot Starter Cache를 사용하여 캐싱을 사용할 수 있습니다.

### 1.2 @EnableCaching

- 캐싱 어노테이션을 선언한다고 해서 자동으로 그 기능이 작동하는 것은 아니라는 점에 유의해야 합니다.
- 캐싱 어노테이션을 활성화하려면 @Configuration 클래스 중 하나에 @EnableCaching 어노테이션을 추가해야 합니다.

```java
@Configuration
@EnableCaching
class CacheConfiguration {

    @Bean
    CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCacheSpecification("...");
        return cacheManager;
    }
}
```

## 2. 예시

```java
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

@Component
public class MyMathService {

    @Cacheable("piDecimals")
    public int computePiDecimal(int precision) {
        ...
    }
}
```

- 이 예제는 잠재적으로 비용이 많이 드는 작업에 캐싱을 사용하는 방법을 보여줍니다.
- computePiDecimal을 호출하기 전에, 추상화는 precision 인자와 일치하는 piDecimals 캐시에서 항목을 찾습니다.
- 항목이 발견되면 캐시의 내용이 즉시 호출자에게 반환되고 메소드는 실행되지 않습니다.
- 그렇지 않으면 메소드가 실행되고 값을 반환하기 전에 캐시가 업데이트됩니다.

## 3. Declarative Annotation-based Caching

- 스프링의 캐싱 추상화는 다음과 같은 자바 어노테이션을 제공합니다
	- @Cacheable: 캐시 채우기를 트리거합니다.
	- @CacheEvict: 캐시 제거를 트리거합니다.
	- @CachePut: 메소드 실행에 간섭하지 않고 캐시를 업데이트합니다.
	- @Caching: 하나의 메소드에 적용할 여러 캐시 작업을 그룹화합니다.
	- @CacheConfig: 클래스 레벨에서 일부 공통 캐시 관련 설정을 공유합니다.

### 3.1 @Cacheable 어노테이션

- 이름에서 알 수 있듯이, @Cacheable을 사용하여 캐시 가능한 메소드를 표시할 수 있습니다.
- 즉, 결과가 캐시에 저장되는 메소드이므로 (동일한 인수로) 후속 호출 시 메소드를 실제로 호출하지 않고 캐시의 값이 반환됩니다.
- 가장 간단한 형태로, 어노테이션 선언은 다음 예제와 같이 어노테이션이 달린 메소드와 연결된 캐시의 이름을 필요로 합니다
- @Cacheable 어노테이션을 사용하면 Cache-Aside(Lazy-Loading) 패턴을 구현할 수 있습니다.
	- Cache-Aside 패턴은 애플리케이션이 캐시를 직접 관리하는 방식입니다.
	- 데이터가 캐시에 없으면 애플리케이션이 데이터베이스에서 가져와서 캐시에 저장합니다.
	- 이후에는 캐시에서 데이터를 읽습니다.

```java
@Cacheable("books")
public Book findBook(ISBN isbn) {...}
```

- 위의 코드에서 findBook 메소드는 "books"라는 이름의 캐시와 연결됩니다.
- 메소드가 호출될 때마다 이미 실행되었는지 캐시를 확인하므로 반복할 필요가 없습니다.
- 대부분의 경우 하나의 캐시만 선언되지만, 이 어노테이션은 여러 이름을 지정할 수 있어 둘 이상의 캐시가 사용될 수 있습니다.
- 이 경우 메소드를 호출하기 전에 각 캐시를 확인합니다.

### 3.2 기본 키 생성

- 캐시는 기본적으로 키-값 저장소이므로, 캐시된 메소드의 각 호출을 캐시 액세스에 적합한 키로 변환해야 합니다.
- 캐싱 추상화는 다음 알고리즘에 기반한 간단한 KeyGenerator를 사용합니다.
	- 매개변수가 없으면 SimpleKey.EMPTY를 반환합니다.
	- 매개변수가 하나만 있으면 해당 인스턴스를 반환합니다.
	- 매개변수가 둘 이상이면 모든 매개변수를 포함하는 SimpleKey를 반환합니다.
- 이 접근 방식은 매개변수가 자연 키를 가지고 유효한 hashCode()와 equals() 메소드를 구현하는 한 대부분의 사용 사례에서 잘 작동합니다.
- 다른 기본 키 생성기를 제공하려면 org.springframework.cache.interceptor.KeyGenerator 인터페이스를 구현해야 합니다.

:::info
기본 키 생성 전략은 Spring 4.0 릴리스와 함께 변경되었습니다. 이전 버전의 Spring은 여러 키 매개변수의 경우 매개변수의 equals()가 아닌 hashCode()만 고려했습니다. 이로 인해 예상치 못한
키 충돌이 발생할 수 있었습니다(배경에 대해서는 spring-framework#14870 참조). 새로운 SimpleKeyGenerator는 이러한 시나리오에 복합 키를 사용합니다.
:::

### 3.3 Custom Key 사용하기

- @Cacheable 어노테이션은 key 속성을 통해 키가 생성되는 방법을 지정할 수 있습니다.
- SpEL을 사용하여 관심 있는 인수(또는 중첩된 속성)를 선택하고, 작업을 수행하거나, 심지어 코드를 작성하거나 인터페이스를 구현하지 않고도 임의의 메소드를 호출할 수 있습니다.

```java
@Cacheable(cacheNames="books", key="#isbn")
public Book findBook(ISBN isbn, boolean checkWarehouse, boolean includeUsed)

@Cacheable(cacheNames="books", key="#isbn.rawNumber")
public Book findBook(ISBN isbn, boolean checkWarehouse, boolean includeUsed)

@Cacheable(cacheNames="books", key="T(someType).hash(#isbn)")
public Book findBook(ISBN isbn, boolean checkWarehouse, boolean includeUsed)
```

- 위의 예제에서, key 속성은 SpEL 표현식으로 지정됩니다.
- 위의 코드 조각은 특정 인수, 그 속성 중 하나 또는 임의의 (정적) 메소드를 선택하는 것이 얼마나 쉬운지 보여줍니다.
- @Cacheable(cacheNames="books", key="T(someType).hash(#isbn)")
	- T(someType)은 someType이라는 클래스의 정적 메소드를 호출합니다.
	- 이 메소드는 isbn 매개변수를 사용하여 해시를 계산합니다.
	- 이렇게 하면 캐시 키를 생성할 수 있습니다.

```java
@Cacheable(cacheNames="books", keyGenerator="myKeyGenerator")
public Book findBook(ISBN isbn, boolean checkWarehouse, boolean includeUsed)
```

- 위의 예제에서, keyGenerator 속성은 org.springframework.cache.interceptor.KeyGenerator 인터페이스를 구현하는 사용자 정의 키 생성기를 지정합니다.
- 키를 생성하는 알고리즘이 복잡한 경우 이 방법을 사용할 수 있습니다.
- key와 keyGenerator 매개변수는 상호 배타적이며, 두 가지 모두 지정하는 작업은 예외를 발생시킵니다.

### 3.4 CacheManager와 CacheResolver

- 스프링은 캐시를 관리하는데 두 가지 개념을 사용합니다.
	- CacheManager: 캐시 저장소를 직접 관리하는 객체
	- CacheResolver: 어떤 캐시를 사용할지 결정하는 객체
- 보통은 간단한 방법으로 작동합니다. 어노테이션에 캐시 이름을 적으면 스프링이 알아서 해당 캐시를 찾아 사용합니다.
- 만약 여러 캐시 매니저를 사용한다면 각 메서드마다 어떤 캐시를 사용할지 지정할 수 있습니다.
	- 여러 종류의 캐시(Redis, Caffeine, Ehcache 등)를 동시에 사용하는 경우에 이 기능이 유용합니다.
	- `@Cacheable(cacheNames="books", cacheManager="anotherCacheManager")`:
		- books라는 캐시를 anotherCacheManager에서 찾습니다.
	- 더 복잡한 로직으로 캐시를 결정하고 싶다면 CacheResolver를 직접 구현하고 지정할 수 있습니다.
		- `@Cacheable(cacheResolver="runtimeCacheResolver")`
- cacheManager와 cacheResolver 둘 다 같이 사용하면 안 됩니다.
	- 둘 중 하나만 사용해야 합니다. 둘 다 지정하면 에러가 발생합니다.

```java
// Redis 캐시 사용
@Cacheable(cacheNames="frequentAccess", cacheManager="redisCacheManager")
public User getUser(String id) { ... }

// Caffeine 캐시 사용 (메모리 캐시가 더 적합한 경우)
@Cacheable(cacheNames="temporaryData", cacheManager="caffeineCacheManager")
public List<Product> getRecentProducts() { ... }
```

- 위의 예제에서, `@Cacheable` 어노테이션은 Redis 캐시와 Caffeine 캐시를 각각 사용합니다.

```java
public class SmartCacheResolver implements CacheResolver {
    @Override
    public Collection<? extends Cache> resolveCaches(CacheOperationInvocationContext<?> context) {
        // 파라미터나 상황에 따라 다른 캐시 반환 로직
        if (isHighPriorityOperation(context)) {
            return redisCache;  // 중요 데이터는 Redis에 저장
        } else {
            return caffeineCache;  // 덜 중요한 데이터는 로컬 메모리에 저장
        }
    }
}
```

- 더 복잡한 로직이 필요하다면 CacheResolver를 구현해서 실행 시점에 어떤 캐시를 사용할지 결정할 수 있습니다.
- 이런 방식으로 데이터의 특성(자주 변경되는지, 공유가 필요한지, 크기는 얼마나 되는지 등)에 따라 적절한 캐시 저장소를 선택적으로 사용할 수 있습니다.
- 예를 들어, 자주 조회되지만 거의 변경되지 않는 데이터는 로컬 메모리 캐시(Caffeine)에, 여러 서버에서 공유해야 하는 중요한 데이터는 Redis에 저장하는 전략을 구현할 수 있습니다.

### 3.5 조건부 캐싱

- Spring Framework의 캐싱 추상화는 메서드 결과를 캐싱할 때 조건을 설정할 수 있는 기능을 제공합니다.
- 이를 통해 모든 케이스가 아닌 특정 조건에서만 캐싱을 적용할 수 있습니다.

#### condition 속성

```java
@Cacheable(cacheNames="book", condition="#name.length() < 32") 
public Book findBook(String name)
```

- condition 속성은 SpEL(Spring Expression Language) 표현식을 사용하여 캐싱 여부를 결정합니다
- 이 예제에서는 name 매개변수의 길이가 32 미만인 경우에만 캐싱이 적용됩니다.
	- 조건이 true이면 메서드 결과가 캐시에 저장됩니다.
	- 조건이 false이면 메서드가 항상 실행되며 결과는 캐시에 저장되지 않습니다.

#### unless 속성

```java
@Cacheable(cacheNames="book", condition="#name.length() < 32", unless="#result.hardback") 
public Book findBook(String name)
```

- unless 속성은 condition과 달리 메서드 실행 후에 평가되며, 캐시에 결과를 저장할지 여부를 결정합니다.
- name 길이가 32 미만인 경우에만 캐싱 처리를 고려합니다(condition 조건)
- 그리고 결과 객체의 hardback 속성이 true가 아닌 경우에만 실제로 캐시에 저장합니다.
	- unless가 true면 캐시에 저장하지 않습니다.

#### Optional 반환 타입 지원

- Spring의 캐싱 추상화는 `java.util.Optional` 반환 타입도 지원합니다.

```java
@Cacheable(cacheNames="book", condition="#name.length() < 32", unless="#result?.hardback")
public Optional<Book> findBook(String name)
```

- Optional이 값을 포함하고 있으면 해당 값이 캐시에 저장됩니다.
- Optional이 비어있으면 캐시에 null이 저장됩니다.
- #result는 항상 실제 비즈니스 엔티티(여기서는 Book)를 참조하며, Optional 래퍼를 참조하지 않습니다.
- `#result?.hardback`에서 `?.`는 SpEL의 안전 탐색 연산자(safe navigation operator)로, #result가 null일 수 있기 때문에 사용됩니다.

### 3.6 @CachePut 애노테이션

- 메서드 실행에 간섭하지 않으면서 캐시를 업데이트해야 할 때 @CachePut 어노테이션을 사용할 수 있습니다.
- 즉, 메서드는 항상 호출되고 그 결과는 (@CachePut 옵션에 따라) 캐시에 저장됩니다.
- 이 어노테이션은 @Cacheable과 동일한 옵션을 지원하며, 메서드 흐름 최적화보다는 캐시 채우기에 사용해야 합니다.
- @CachePut 애노테이션을 사용하면 Write-Through 캐시를 구현할 수 있습니다.
	- Write-Through 캐시는 데이터베이스에 쓰기 작업을 수행할 때 캐시에도 동시에 쓰는 방식입니다.
	- 이렇게 하면 데이터베이스와 캐시 간의 일관성을 유지할 수 있습니다.

```java
@CachePut(cacheNames="book", key="#isbn")
public Book updateBook(ISBN isbn, BookDescriptor descriptor)
```

#### 주의사항

- 동일한 메서드에 @CachePut과 @Cacheable 어노테이션을 함께 사용하는 것은 일반적으로 권장되지 않습니다.
	- 왜냐하면 두 어노테이션은 서로 다른 동작 방식을 가지기 때문입니다.
	- 후자는 캐시를 사용하여 메서드 호출을 건너뛰게 하는 반면, 전자는 캐시 업데이트를 실행하기 위해 메서드 호출을 강제합니다.
- 이로 인해 예상치 못한 동작이 발생할 수 있으며, 특정 예외 케이스(예: 어노테이션이 서로를 배제하는 조건을 가지는 경우)를 제외하고 이러한 선언은 피해야 합니다.

### 3.7 @CacheEvict 어노테이션

- 캐시 추상화는 캐시 저장소의 채우기뿐만 아니라 제거도 허용합니다.
- 이 프로세스는 캐시에서 오래된 데이터나 사용되지 않는 데이터를 제거하는 데 유용합니다.
- @Cacheable과 달리, @CacheEvict는 캐시 제거를 수행하는 메서드를 표시합니다(즉, 캐시에서 데이터를 제거하는 트리거 역할을 하는 메서드).
- 형제 어노테이션과 마찬가지로, @CacheEvict는 작업의 영향을 받는 하나 이상의 캐시를 지정해야 하며, 사용자 정의 캐시 및 키 해석 또는 조건을 지정할 수 있습니다.
- 또한 키 기반 항목 제거가 아닌 캐시 전체 제거가 필요한지 여부를 나타내는 추가 매개변수(allEntries)가 있습니다.
- void 메서드는 @CacheEvict와 함께 사용할 수 있습니다.
	- 메서드가 트리거 역할을 하므로 반환 값은 무시됩니다(캐시와 상호 작용하지 않으므로).
	- 이는 캐시에 데이터를 추가하거나 캐시의 데이터를 업데이트하는 @Cacheable의 경우와는 다릅니다.

#### allEntries 속성

```java
@CacheEvict(cacheNames="books", allEntries=true) 
public void loadBooks(InputStream batch)
```

- 다음 예제는 books 캐시에서 모든 항목을 제거합니다
- allEntries 속성을 사용하여 캐시에서 모든 항목을 제거합니다.
- 이 옵션은 전체 캐시 영역을 비워야 할 때 유용합니다.
	- 각 항목을 개별적으로 제거하는 대신(시간이 오래 걸리고 비효율적임), 모든 항목이 하나의 작업으로 제거됩니다.

## 4. 지원되는 캐시 프로바이더

- Spring은 캐시 추상화(Cache Abstraction)라는 개념을 사용합니다. 
- 스프링 캐시는 Cache와 CacheManager 인터페이스에 의존합니다.
- 이는 실제 캐시 구현체(Redis, EhCache, Caffeine 등)와 상관없이 동일한 방식으로 캐시 기능을 사용할 수 있게 해주는 계층입니다.
- CacheManager 타입의 빈 또는 cacheResolver라는 이름의 CacheResolver 타입 빈을 정의하지 않으면, Spring Boot는 클래스패스를 스캔하여 사용 가능한 캐시 라이브러리를 우선순위 순서대로 찾습니다.

### 4.1 캐시 프로바이더 우선순위

- Spring Boot는 개발자가 캐시 설정을 직접 하지 않으면 자동으로 적절한 캐시 제공자를 찾아서 구성해줍니다.
- 캐시 프로바이더의 우선순위는 다음과 같습니다
  - Generic - 기본 ConcurrentHashMap 기반
  - JCache (JSR-107) - 표준 Java 캐시 API
  - EhCache 2.x
  - Hazelcast
  - Infinispan
  - Couchbase
  - Redis
  - Caffeine
  - Simple - 단순한 ConcurrentHashMap
- 특정 캐시 라이브러리를 추가하지 않으면 Spring Boot는 메모리에 동시성 맵을 사용하는 간단한 프로바이더를 자동 구성합니다.
	- 간단한 프로바이더는 실제 프로덕션 사용에는 권장되지 않지만, 시작하고 기능을 이해하는 데 좋습니다.

### 4.2 특정 프로파이더 지정하기

- 앞서 설명한 것처럼 Spring Boot는 클래스패스에 있는 캐시 라이브러리를 자동으로 감지해서 사용합니다. 
- 하지만 때로는 개발자가 원하는 특정 캐시 제공자를 강제로 사용하고 싶을 수 있습니다.
- 이 경우 `spring.cache.type` 속성을 사용하여 원하는 캐시 제공자를 지정할 수 있습니다.
- 만약 프로젝트에 Redis와 Caffeine 의존성이 모두 있다면. 우선순위에 따라 Redis가 선택됩니다. 
  - caffeine을 사용하고 싶다면 `spring.cache.type=caffeine`으로 설정하면 됩니다.
- 테스트 환경에서 캐시를 사용하지 않으려면 `spring.cache.type=none`으로 설정하면 됩니다.
  - 테스트에서는 캐시로 인한 성능 향상보다는 정확한 동작 검증이 중요합니다.
  - 캐시 때문에 테스트 결과가 달라지는 것을 방지합니다.

```yaml

### 4.2 캐시 프로바이더 설정

```java
@Configuration
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        // 개발자가 직접 CacheManager를 정의한 경우
        return new RedisCacheManager(...);
    }
    
    // 또는
    @Bean
    public CacheResolver cacheResolver() {
        // 개발자가 직접 CacheResolver를 정의한 경우
        return new SimpleCacheResolver(...);
    }
}
```

- 캐시 프로바이더를 설정하는 방법은 두 가지입니다.
  - CacheManager를 직접 정의하는 방법
  - CacheResolver를 직접 정의하는 방법
- 개발자가 위와 같은 설정을 하지 않았다면, Spring Boot는 클래스패스를 스캔해서 사용 가능한 캐시 라이브러리를 우선순위 순서대로 찾습니다.

## 5 Caffeine

- Caffeine은 Guava의 캐시를 Java 8로 다시 작성한 것으로, Guava 지원을 대체합니다. 

### 5.1 의존성 추가

```groovy
implementation 'com.github.ben-manes.caffeine:caffeine:3.2.0'
```

- 캐시 프로바이더를 제공하기 위해서 Caffeine 라이브러리를 사용합니다.
- https://mvnrepository.com/artifact/com.github.ben-manes.caffeine/caffeine 이곳에서 Caffeine 라이브러리를 확인할 수 있습니다.

### 5.2 Caffeine 설정

```yml
spring:
  cache:
    type: caffeine
    cache-names:
      - userCache
      - productCache
      - orderCache
    caffeine:
      spec: maximumSize=1000,expireAfterWrite=600s,recordStats
```

- 위의 예제는 Caffeine 캐시를 설정하는 방법을 보여줍니다.
- `spring.cache.type`을 caffeine으로 설정하면 CaffeineCacheManager가 자동으로 설정됩니다.
- `spring.cache.caffeine.spec` 속성을 사용하여 Caffeine 캐시의 설정을 지정할 수 있습니다.
- `maximumSize`는 캐시에 최대 항목수를 설정합니다.
- `expireAfterWrite`는 캐시 항목이 작성된 후 만료되는 시간을 설정합니다.
- `recordStats`는 캐시 통계를 기록하도록 설정합니다.

```java
@Configuration
@EnableCaching
public class MultiCacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        
        List<Cache> caches = Arrays.asList(
            buildCache("userCache", 1000, 30),
            buildCache("productCache", 5000, 60),
            buildCache("orderCache", 2000, 15)
        );
        
        cacheManager.setCaches(caches);
        return cacheManager;
    }

    private Cache buildCache(String name, int maximumSize, int expireAfterWriteMinutes) {
        return new CaffeineCache(name, Caffeine.newBuilder()
                .maximumSize(maximumSize)
                .expireAfterWrite(expireAfterWriteMinutes, TimeUnit.MINUTES)
                .recordStats()
                .build());
    }
}
```

- 위의 예제는 여러 개의 캐시를 개별적으로 설정하는 방법을 보여줍니다.


## 참고

- https://docs.spring.io/spring-boot/reference/io/caching.html
- https://docs.spring.io/spring-framework/reference/integration/cache/annotations.html