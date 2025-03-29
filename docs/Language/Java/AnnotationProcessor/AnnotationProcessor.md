---
title: "Annotation Processor"
description: "자바 애노테이션 프로세서의 개념부터 실전 구현까지 상세히 알아봅니다. 컴파일 타임 코드 생성의 원리와 작동 방식, Lombok과 같은 라이브러리 내부 구현, 그리고 커스텀 애노테이션 프로세서 개발 방법을 실제 예제와 함께 설명합니다."
tags: ["ANNOTATION_PROCESSOR", "JAVA", "COMPILE_TIME", "CODE_GENERATION", "BACKEND"]
keywords: ["애노테이션 프로세서", "annotation processor", "자바", "java", "코드 생성", "code generation", "컴파일 타임", "compile time", "롬복", "lombok", "APT", "Annotation Processing Tool", "메타프로그래밍", "metaprogramming", "보일러플레이트", "boilerplate", "자바 컴파일러", "javac"]
draft: false
hide_title: true
---

## 1. 애노테이션 프로세서 소개

- 애노테이션 프로세서는 자바 컴파일 시점에 특정 애노테이션이 붙은 요소를 검색하고 처리하는 특별한 도구입니다.
- 컴파일 시점에 동작하기 때문에 런타임 오버헤드가 없으며, 소스 코드나 바이트 코드를 분석하고 생성할 수 있습니다.
- 프로젝트 빌드 과정에서 자동으로 코드를 생성하거나 검증하는 데 주로 사용됩니다.

### 1.1 주요 특징과 장점

- 컴파일 타임 검증: 애노테이션 프로세서는 컴파일 단계에서 오류를 발견하여 런타임 오류를 미리 방지합니다.
- 보일러플레이트 코드 자동 생성: 반복적이고 기계적인 코드를 자동으로 생성하여 개발자 생산성을 높입니다.
- 메타프로그래밍 지원: 코드가 코드를 생성하는 메타프로그래밍 패러다임을 자바에서 구현할 수 있게 합니다.
- 타입 안전성 향상: 문자열 기반 참조 대신 컴파일러가 검증할 수 있는 형태로 코드를 생성합니다.

### 1.2 대표적인 활용 사례

- Lombok: `@Getter`, `@Setter`, `@Builder` 등의 애노테이션으로 반복적인 코드 자동 생성
- MapStruct: 객체 간 매핑을 위한 코드 자동 생성
- Dagger/Hilt: 의존성 주입을 위한 팩토리 코드 자동 생성
- QueryDSL: 타입 안전한 쿼리를 위한 Q 클래스 생성
- JPA 메타모델 생성기: JPA 정적 메타모델 클래스 생성

## 2. 애노테이션 프로세서 작동 원리

- 애노테이션 프로세서는 Java Compiler API(JSR 269)를 기반으로 작동합니다.
- javac 컴파일러가 소스 코드를 처리할 때 특정 라운드(round)에 걸쳐 애노테이션 프로세싱이 이루어집니다.

### 2.1 처리 과정

- 컴파일러는 소스 코드를 파싱하여 추상 구문 트리(AST)를 생성합니다.
- 컴파일러는 각 라운드마다 아직 처리되지 않은 애노테이션을 찾아 등록된 프로세서를 실행합니다.
- 프로세서는 애노테이션이 달린 요소(클래스, 메서드, 필드 등)에 접근하여 정보를 수집합니다.
- 필요에 따라 새로운 소스 파일을 생성하거나 오류/경고 메시지를 출력합니다.
- 새로운 소스 파일이 생성되면 다음 라운드에서 해당 파일도 처리 대상이 됩니다.
- 더 이상 처리할 애노테이션이 없거나 새로운 소스 파일이 생성되지 않으면 프로세싱이 종료됩니다.

### 2.2 주요 컴포넌트

- `javax.annotation.processing.Processor` 인터페이스: 모든 애노테이션 프로세서의 기본 인터페이스
- `javax.annotation.processing.AbstractProcessor` 클래스: 프로세서 구현을 위한 편의 클래스
- `javax.lang.model` 패키지: 언어 모델 요소 및 타입에 접근하기 위한 API
- `javax.annotation.processing.Filer` 인터페이스: 새로운 소스/리소스 파일 생성을 위한 API
- `javax.tools.Diagnostic` 클래스: 컴파일러 메시지(오류/경고) 출력을 위한 API

:::info
Java 9부터는 `javax.annotation.processing` 패키지가 `jakarta.annotation.processing`으로 이동했으며,
모듈 시스템 도입에 따라 `module-info.java`에서 프로세서 사용을 위한 설정이 필요할 수 있습니다.
:::

## 3. 간단한 애노테이션 프로세서 구현하기

### 3.1 개발 환경 설정

- 애노테이션 프로세서는 독립적인 모듈로 개발하는 것이 좋습니다.
- Maven이나 Gradle을 사용하여 프로젝트를 구성합니다.

#### Gradle 의존성 설정 예시
```gradle
dependencies {
    implementation 'com.google.auto.service:auto-service-annotations:1.0'
    annotationProcessor 'com.google.auto.service:auto-service:1.0'
    
    // 자바 코드 생성을 위한 유틸리티 라이브러리
    implementation 'com.squareup:javapoet:1.13.0'
}
```

### 3.2 간단한 애노테이션 정의

- 먼저 프로세싱할 대상 애노테이션을 정의합니다.

```java
package com.example.processor;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.SOURCE)
public @interface GenerateToString {
}
```

- `@Target`: 애노테이션이 적용될 요소를 지정 (여기서는 클래스, 인터페이스 등)
- `@Retention`: 애노테이션이 유지되는 범위 지정 (SOURCE는 컴파일 시에만 유지)

### 3.3 프로세서 클래스 구현

```java
package com.example.processor;

import com.google.auto.service.AutoService;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.*;
import javax.lang.model.type.TypeKind;
import javax.tools.Diagnostic;
import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@AutoService(Processor.class)
@SupportedAnnotationTypes("com.example.processor.GenerateToString")
@SupportedSourceVersion(SourceVersion.RELEASE_11)
public class ToStringProcessor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        // GenerateToString 애노테이션이 붙은 요소들 가져오기
        for (Element element : roundEnv.getElementsAnnotatedWith(GenerateToString.class)) {
            // 클래스인지 확인
            if (element.getKind() != ElementKind.CLASS) {
                processingEnv.getMessager().printMessage(
                    Diagnostic.Kind.ERROR, 
                    "GenerateToString은 클래스에만 적용할 수 있습니다.", 
                    element
                );
                continue;
            }

            TypeElement typeElement = (TypeElement) element;
            generateToStringMethod(typeElement);
        }
        return true;
    }

    private void generateToStringMethod(TypeElement typeElement) {
        // 클래스의 모든 필드 가져오기
        List<VariableElement> fields = typeElement.getEnclosedElements().stream()
            .filter(e -> e.getKind() == ElementKind.FIELD)
            .map(e -> (VariableElement) e)
            .collect(Collectors.toList());

        // toString 메소드 생성 로직 구현
        // JavaPoet 라이브러리를 사용한 코드 생성
        // ...
    }
}
```

- `@AutoService(Processor.class)`: 서비스 프로바이더 설정 자동화 (META-INF/services 파일 생성)
- `@SupportedAnnotationTypes`: 이 프로세서가 처리할 애노테이션 타입 지정
- `@SupportedSourceVersion`: 지원하는 자바 소스 버전 지정

## 4. 코드 생성 기법

### 4.1 JavaPoet 라이브러리 활용

- JavaPoet은 자바 소스 코드 생성을 위한 편리한 API를 제공합니다.
- 클래스, 메서드, 필드 등의 코드를 프로그래매틱하게 생성할 수 있습니다.

```java
private void generateToStringMethod(TypeElement typeElement) {
    String packageName = processingEnv.getElementUtils().getPackageOf(typeElement).getQualifiedName().toString();
    String className = typeElement.getSimpleName().toString();
    
    // 필드 목록 가져오기
    List<? extends Element> allMembers = processingEnv.getElementUtils().getAllMembers(typeElement);
    List<VariableElement> fields = allMembers.stream()
        .filter(member -> member.getKind() == ElementKind.FIELD)
        .filter(field -> !field.getModifiers().contains(Modifier.STATIC))
        .map(member -> (VariableElement) member)
        .collect(Collectors.toList());
    
    // toString 메서드 생성
    MethodSpec.Builder toStringMethodBuilder = MethodSpec.methodBuilder("toString")
        .addAnnotation(Override.class)
        .addModifiers(Modifier.PUBLIC)
        .returns(String.class);
    
    // 메서드 내용 구성
    StringBuilder sb = new StringBuilder();
    sb.append("return \"").append(className).append("{\" +\n");
    
    for (int i = 0; i < fields.size(); i++) {
        VariableElement field = fields.get(i);
        String fieldName = field.getSimpleName().toString();
        sb.append("    \"").append(fieldName).append("=\" + ").append(fieldName);
        
        if (i < fields.size() - 1) {
            sb.append(" + \", \" +\n");
        } else {
            sb.append(" + \"}\"");
        }
    }
    
    toStringMethodBuilder.addStatement(sb.toString());
    
    // 클래스 생성
    TypeSpec generatedClass = TypeSpec.classBuilder(className + "Generated")
        .superclass(typeElement.asType())
        .addModifiers(Modifier.PUBLIC)
        .addMethod(toStringMethodBuilder.build())
        .build();
    
    // 파일 생성
    try {
        JavaFile.builder(packageName, generatedClass)
            .build()
            .writeTo(processingEnv.getFiler());
    } catch (IOException e) {
        processingEnv.getMessager().printMessage(
            Diagnostic.Kind.ERROR,
            "코드 생성 중 오류 발생: " + e.getMessage()
        );
    }
}
```

### 4.2 템플릿 엔진 활용

- FreeMarker, Velocity 등의 템플릿 엔진을 사용하여 코드를 생성할 수도 있습니다.
- 복잡한 형태의 코드를 생성할 때 더 직관적일 수 있습니다.

```java
// FreeMarker 템플릿 엔진 설정 예시
private void generateFromTemplate(TypeElement element) {
    try {
        Configuration cfg = new Configuration(Configuration.VERSION_2_3_30);
        cfg.setClassLoaderForTemplateLoading(getClass().getClassLoader(), "templates");
        cfg.setDefaultEncoding("UTF-8");
        
        Template template = cfg.getTemplate("tostring.ftl");
        
        // 데이터 모델 구성
        Map<String, Object> model = new HashMap<>();
        model.put("className", element.getSimpleName().toString());
        model.put("packageName", processingEnv.getElementUtils().getPackageOf(element).toString());
        // ... 필드 정보 등 추가
        
        // 파일 생성
        String className = element.getSimpleName() + "Generated";
        JavaFileObject file = processingEnv.getFiler().createSourceFile(
            element.getQualifiedName() + "Generated"
        );
        
        try (Writer writer = file.openWriter()) {
            template.process(model, writer);
        }
    } catch (Exception e) {
        processingEnv.getMessager().printMessage(
            Diagnostic.Kind.ERROR,
            "템플릿 처리 중 오류 발생: " + e.getMessage()
        );
    }
}
```

## 5. 고급 애노테이션 프로세싱 기법

### 5.1 타입 시스템 활용

- `javax.lang.model` 패키지를 통해 자바의 타입 시스템에 접근할 수 있습니다.
- 제네릭, 배열, 와일드카드 등의 복잡한 타입도 처리 가능합니다.

```java
private void analyzeType(TypeElement element) {
    // 타입 미러를 통한 타입 분석
    TypeMirror superclass = element.getSuperclass();
    List<? extends TypeMirror> interfaces = element.getInterfaces();
    
    // 타입 유틸리티를 통한 타입 관계 확인
    Types typeUtils = processingEnv.getTypeUtils();
    Elements elementUtils = processingEnv.getElementUtils();
    
    TypeElement comparableType = elementUtils.getTypeElement("java.lang.Comparable");
    if (typeUtils.isAssignable(element.asType(), comparableType.asType())) {
        // Comparable 인터페이스 구현 클래스 처리
    }
    
    // 제네릭 타입 파라미터 처리
    List<? extends TypeParameterElement> typeParams = element.getTypeParameters();
    for (TypeParameterElement param : typeParams) {
        String paramName = param.getSimpleName().toString();
        List<? extends TypeMirror> bounds = param.getBounds();
        // 제네릭 타입 파라미터 처리 로직
    }
}
```

### 5.2 에러 핸들링과 메시지 출력

- 컴파일 타임 검증 및 피드백을 위한 에러/경고 처리 방법입니다.

```java
private void validateElement(Element element) {
    // 다양한 레벨의 메시지 출력
    Messager messager = processingEnv.getMessager();
    
    // 오류 메시지 (컴파일 실패)
    messager.printMessage(
        Diagnostic.Kind.ERROR, 
        "필수 필드가 누락되었습니다.", 
        element
    );
    
    // 경고 메시지 (컴파일은 진행)
    messager.printMessage(
        Diagnostic.Kind.WARNING, 
        "이 방식은 권장되지 않습니다.", 
        element
    );
    
    // 참고 메시지
    messager.printMessage(
        Diagnostic.Kind.NOTE, 
        "참고: 더 효율적인 방법이 있습니다.", 
        element
    );
}
```

### 5.3 증분 컴파일 지원

- 애노테이션 프로세서가 증분 컴파일 환경에서 제대로 동작하도록 하는 기법입니다.

```java
@Override
public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    if (roundEnv.processingOver()) {
        // 모든 라운드가 끝났을 때 수행할 작업
        return true;
    }
    
    // 각 라운드에서 수행할 작업
    // 이전에 생성한 파일 추적 등
    
    return true;
}
```

## 6. 실전 적용 사례

### 6.1 Lombok 내부 작동 원리

- Lombok은 가장 유명한 애노테이션 프로세서 기반 라이브러리입니다.
- Lombok은 일반적인 애노테이션 프로세서와 달리 AST(추상 구문 트리)를 직접 조작하는 방식을 사용합니다.

:::warning
Lombok은 컴파일러의 내부 API를 사용하기 때문에 자바 버전 변경 시 호환성 문제가 발생할 수 있습니다.
일반적인 애노테이션 프로세서는 공식 API만 사용하는 것이 권장됩니다.
:::

```java
// Lombok의 @Getter 처리 과정 (개념적 예시)
public class GetterProcessor {
    public void handleGetter(JCTree.JCClassDecl classDecl) {
        for (JCTree.JCVariableDecl field : fields) {
            if (!hasGetterMethod(field)) {
                JCTree.JCMethodDecl getter = createGetterMethod(field);
                classDecl.defs = classDecl.defs.append(getter);
            }
        }
    }
    
    private JCTree.JCMethodDecl createGetterMethod(JCTree.JCVariableDecl field) {
        // AST를 조작하여 getter 메소드 생성
        // ...
    }
}
```

### 6.2 MapStruct 매핑 원리

- MapStruct는 객체 간 매핑을 위한 코드를 생성하는 애노테이션 프로세서입니다.
- 컴파일 시점에 인터페이스를 분석하여 효율적인 매핑 코드를 생성합니다.

```java
// MapStruct에서 정의한 인터페이스 예시
@Mapper
public interface UserMapper {
    UserDTO userToDto(User user);
    User dtoToUser(UserDTO dto);
}

// MapStruct가 생성하는 구현체의 형태 (개념적 예시)
public class UserMapperImpl implements UserMapper {
    @Override
    public UserDTO userToDto(User user) {
        if (user == null) {
            return null;
        }
        
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        // 기타 필드 매핑
        
        return dto;
    }
    
    @Override
    public User dtoToUser(UserDTO dto) {
        // 역방향 매핑 구현
        // ...
    }
}
```

### 6.3 QueryDSL Q-Type 생성 원리

- QueryDSL은 타입 안전한 쿼리를 위한 메타 클래스를 생성합니다.
- JPA 엔티티를 분석하여 Q-Type 클래스를 생성하는 프로세서를 사용합니다.

```java
// 원본 엔티티 클래스
@Entity
public class User {
    @Id
    private Long id;
    private String username;
    private String email;
    // getters, setters...
}

// QueryDSL이 생성하는 Q-Type 클래스 (개념적 예시)
public class QUser extends EntityPathBase<User> {
    public static final QUser user = new QUser("user");
    
    public final NumberPath<Long> id = createNumber("id", Long.class);
    public final StringPath username = createString("username");
    public final StringPath email = createString("email");
    
    public QUser(String variable) {
        super(User.class, PathMetadataFactory.forVariable(variable));
    }
    // ...
}
```

## 7. 모범 사례와 주의사항

### 7.1 성능 최적화

- 애노테이션 프로세서는 빌드 시간에 영향을 미치므로 성능에 유의해야 합니다.
- 불필요한 파일 입출력이나 과도한 메모리 사용을 피합니다.
- 증분 컴파일을 고려하여 설계합니다.

```java
// 캐싱을 통한 성능 최적화 예시
private Map<String, TypeElement> processedElements = new HashMap<>();

@Override
public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    for (Element element : roundEnv.getElementsAnnotatedWith(MyAnnotation.class)) {
        TypeElement typeElement = (TypeElement) element;
        String key = typeElement.getQualifiedName().toString();
        
        // 이미 처리한 요소는 스킵
        if (processedElements.containsKey(key)) {
            continue;
        }
        
        // 처리 로직
        processElement(typeElement);
        
        // 처리한 요소 기록
        processedElements.put(key, typeElement);
    }
    return true;
}
```

### 7.2 테스트 방법

- 애노테이션 프로세서는 컴파일 시점에 동작하므로 테스트에 특별한 접근이 필요합니다.
- 컴파일 테스트 프레임워크(예: Google Compile Testing)를 활용합니다.

```java
// Google Compile Testing을 사용한 테스트 예시
@Test
public void testProcessor() {
    Compilation compilation = Compiler.javac()
        .withProcessors(new MyProcessor())
        .compile(JavaFileObjects.forSourceString(
            "com.example.test.TestClass",
            "package com.example.test;\n" +
            "\n" +
            "import com.example.processor.MyAnnotation;\n" +
            "\n" +
            "@MyAnnotation\n" +
            "public class TestClass {\n" +
            "  private String name;\n" +
            "}"
        ));
    
    // 컴파일 성공 확인
    assertThat(compilation).succeeded();
    
    // 생성된 파일 확인
    JavaFileObject generatedFile = compilation.generatedFile(
        StandardLocation.SOURCE_OUTPUT,
        "com.example.test",
        "TestClassGenerated.java"
    ).get();
    
    // 생성된 파일 내용 검증
    assertThat(generatedFile).contentsAsUtf8String().contains(
        "public class TestClassGenerated extends TestClass"
    );
}
```

### 7.3 배포 방법

- 애노테이션 프로세서는 일반적으로 독립된 라이브러리로 배포됩니다.
- 명확한 문서화와 버전 관리가 중요합니다.

```xml
<!-- Maven 배포 설정 예시 -->
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.8.1</version>
            <configuration>
                <source>11</source>
                <target>11</target>
                <annotationProcessorPaths>
                    <path>
                        <groupId>com.google.auto.service</groupId>
                        <artifactId>auto-service</artifactId>
                        <version>1.0</version>
                    </path>
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
</build>
```

## 8. 결론 및 고려사항

- 애노테이션 프로세서는 자바 개발의 강력한 도구이지만, 필요한 상황에 맞게 사용해야 합니다.
- 코드 생성의 장점과 한계를 이해하고 적절히 활용하는 것이 중요합니다.

### 8.1 장점

- 컴파일 타임 검증으로 런타임 오류 감소
- 반복적인 보일러플레이트 코드 제거
- 타입 안전성 향상
- 메타프로그래밍을 통한 코드 추상화
- 런타임 성능 오버헤드 없음

### 8.2 한계 및 고려사항

- 디버깅 난이도 증가 (생성된 코드 추적의 어려움)
- IDE 통합 문제 (일부 IDE에서 생성된 코드 인식 지연)
- 복잡한 구현으로 인한 유지보수 부담
- 컴파일 시간 증가 가능성
- 자바 버전 간 호환성 고려 필요