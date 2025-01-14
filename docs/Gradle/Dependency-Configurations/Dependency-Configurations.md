##  1 Gradle Dependency Configurations

- [레퍼런스](https://docs.gradle.org/current/userguide/dependency_configurations.html)
- Gradle을 사용하여 프로젝트를 관리할 때, 의존성 관리는 매우 중요한 부분입니다.
- Gradle의 dependency configurations는 의존성의 범위와 사용 목적을 정의하는 강력한 도구입니다.
- 이 글에서는 주요 dependency configurations의 의미와 사용법, 그리고 언제 어떤 configuration을 사용해야 하는지 자세히 알아보겠습니다.



##  2 implementation

- `implementation`은 가장 일반적으로 사용되는 configuration입니다.
- 컴파일 타임과 런타임 모두에서 필요한 의존성을 정의합니다.
- 이 의존성은 프로젝트의 소스 코드를 컴파일하는 데 사용되며, 런타임에도 필요합니다.
- `implementation`으로 정의된 의존성은 프로젝트를 사용하는 다른 모듈로 전이되지 않습니다.



**예시 코드**

```groovy
implementation 'org.springframework.boot:spring-boot-starter-web'
```

- 위 예시는 Spring Boot Web Starter를 프로젝트에 추가하는 것을 보여줍니다.
- 이 의존성은 컴파일 시와 런타임에 모두 필요하지만, 다른 모듈로 전이되지 않습니다.



##  3 api (Java Library 플러그인 전용)

- `api`는 `implementation`과 유사하지만, 의존성 전이 측면에서 차이가 있습니다.
- 컴파일 타임과 런타임에 필요하며, 다른 모듈로도 전이되어야 하는 의존성을 정의합니다.
- 주로 라이브러리를 개발할 때 사용됩니다.
- `api`로 정의된 의존성은 프로젝트를 사용하는 다른 모듈로 전이됩니다.



**예시 코드**

```groovy
api 'com.google.guava:guava:30.1-jre'
```

- 위 예시는 Google Guava 라이브러리를 프로젝트에 추가하고, 이를 사용하는 다른 모듈에서도 사용할 수 있게 합니다.
- 라이브러리 개발 시 공개 API에 사용되는 의존성에 적합합니다.



##  4 compileOnly

- `compileOnly`는 컴파일 시에만 필요한 의존성을 위한 configuration입니다.
- 컴파일 타임에만 필요하고 런타임에는 필요 없는 의존성을 정의합니다.
- 주로 어노테이션 프로세서나 컴파일 시 유틸리티에 사용됩니다.
- 런타임에 클래스패스에 포함되지 않으므로 메모리 사용량을 줄일 수 있습니다.



**예시 코드**

```groovy
compileOnly 'org.projectlombok:lombok:1.18.20'
```

- 위 예시는 Lombok 라이브러리를 컴파일 시에만 사용하도록 추가합니다.
- Lombok은 컴파일 시 코드를 생성하지만, 런타임에는 필요하지 않습니다.



##  5 runtimeOnly

- `runtimeOnly`는 런타임에만 필요한 의존성을 위한 configuration입니다.
- 런타임에만 필요하고 컴파일 타임에는 필요 없는 의존성을 정의합니다.
- 주로 데이터베이스 드라이버나 로깅 라이브러리에 사용됩니다.
- 컴파일 시간을 단축시킬 수 있습니다.



**예시 코드**

```groovy
runtimeOnly 'com.h2database:h2'
```

- 위 예시는 H2 데이터베이스를 런타임에만 사용하도록 추가합니다.
- 데이터베이스 드라이버는 컴파일 시에는 필요하지 않지만, 애플리케이션 실행 시에는 필요합니다.



##  6 testImplementation

- `testImplementation`은 테스트 코드를 위한 configuration입니다.
- 테스트를 컴파일하고 실행하는 데 필요한 의존성을 정의합니다.
- 테스트 코드에서만 사용되며, 메인 소스 코드에는 영향을 주지 않습니다.
- 테스트 관련 라이브러리(예: JUnit, Mockito)를 이 configuration으로 추가합니다.



**implementation과 차이**

- `implementation`으로 선언된 의존성은 테스트 코드에서도 사용할 수 있습니다.
- 테스트 컴파일 및 실행 시, `implementation` 의존성이 테스트 클래스패스에 포함됩니다.
- 그러나 테스트에만 필요한 의존성의 경우, `testImplementation`을 사용하는 것이 좋습니다.



**예시 코드**

```groovy
testImplementation 'org.junit.jupiter:junit-jupiter-api:5.7.0'
```

- 위 예시는 JUnit 5를 테스트 의존성으로 추가합니다.
- 이 의존성은 테스트 코드 컴파일과 실행 시에만 사용되며, 프로덕션 코드에는 포함되지 않습니다.



##  7 annotationProcessor

- `annotationProcessor`는 자바 어노테이션 프로세서를 위한 특별한 configuration입니다.
- 컴파일 시점에 코드를 생성하거나 분석하는 어노테이션 프로세서에 대한 의존성을 정의합니다.
- 주로 Lombok, MapStruct 등의 라이브러리와 함께 사용됩니다.
- 어노테이션 프로세서를 별도의 클래스패스에서 실행하여 성능을 향상시킵니다.



**예시 코드**

```groovy
annotationProcessor 'org.projectlombok:lombok:1.18.20'
```

- 위 예시는 Lombok을 어노테이션 프로세서로 추가합니다.
- Lombok은 컴파일 시점에 코드를 생성하는 도구로, 이 configuration을 통해 효율적으로 처리됩니다.



##  8 결론

- 올바른 dependency configuration을 선택하는 것은 프로젝트의 빌드 성능, 런타임 성능, 그리고 의존성 관리의 명확성에 큰 영향을 미칩니다.
- 각 configuration의 특성을 이해하고 프로젝트의 요구사항에 맞게 적절히 사용하면, 더 효율적이고 유지보수하기 쉬운 프로젝트를 만들 수 있습니다.
- 다음 단계로, 여러분의 프로젝트에서 사용 중인 의존성들을 검토하고, 각 의존성이 가장 적절한 configuration으로 정의되어 있는지 확인해보세요.
- 이를 통해 프로젝트의 구조를 개선하고 빌드 성능을 최적화할 수 있을 것입니다.