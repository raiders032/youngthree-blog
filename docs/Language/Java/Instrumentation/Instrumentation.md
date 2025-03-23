---
title: "Java Instrumentation API"
description: "Java Instrumentation API의 개념부터 자바 에이전트 구현 및 활용까지 실제 예제로 알아봅니다. ATM 애플리케이션의 성능 측정 사례를 통해 바이트코드 조작, 에이전트 로딩, 구현 방법을 자세히 설명합니다."
tags: ["JAVA", "JVM", "INSTRUMENTATION", "BYTECODE", "AGENT", "BACKEND", "JAVA_AGENT"]
keywords: ["자바 계측", "Java Instrumentation", "바이트코드 조작", "자바 에이전트", "Java Agent", "동적 로딩", "정적 로딩", "바이트코드 변환", "자바 API", "JVM", "Javassist", "Premain", "Agentmain", "ClassFileTransformer"]
draft: false
hide_title: true
---

## 1. Java Instrumentation API 소개

- Java Instrumentation API는 컴파일된 Java 클래스의 바이트코드를 검사하고 수정할 수 있는 기능을 제공합니다.
- 계측(Instrumentation)이란 데이터 수집을 위해 메서드에 바이트코드를 추가하는 것으로, 애플리케이션의 상태나 동작을 변경하지 않습니다.

:::info
계측 도구의 예시로는 모니터링 에이전트, 프로파일러, 커버리지 분석기, 이벤트 로거 등이 있습니다.
:::

## 2. 실제 활용 사례: ATM 애플리케이션 성능 측정

이 글에서는 다음과 같은 두 개의 모듈로 구성된 예제 프로젝트를 통해 Java Instrumentation API를 설명합니다:

- ATM 애플리케이션: 돈을 인출할 수 있는 기본 기능 제공
- Java 에이전트: ATM 애플리케이션의 코드를 수정하지 않고 인출 작업의 수행 시간을 측정하는 기능 추가

## 3. Java 에이전트 개요

- Java 에이전트는 JVM이 제공하는 Instrumentation API를 활용하여 로드된 바이트코드를 변경하는 특수한 JAR 파일입니다.
- 에이전트는 소스 코드를 수정하지 않고도 애플리케이션의 동작을 확장하거나 모니터링할 수 있게 해줍니다.

### 3.1 에이전트 로드 방식

#### 정적 로드(Static Load)

- 애플리케이션 시작 시 `-javaagent` 옵션을 사용하여 로드합니다.
- 에이전트의 `premain` 메서드가 애플리케이션의 `main` 메서드 실행 전에 호출됩니다.
- 실행 예시:

```
java -javaagent:agent.jar -jar application.jar
```

정적 로드 실행 로그:
```
22:24:39.296 [main] INFO - [Agent] In premain method
22:24:39.300 [main] INFO - [Agent] Transforming class MyAtm
22:24:39.407 [main] INFO - [Application] Starting ATM application
22:24:41.409 [main] INFO - [Application] Successful Withdrawal of [7] units!
22:24:41.410 [main] INFO - [Application] Withdrawal operation completed in:2 seconds!
22:24:53.411 [main] INFO - [Application] Successful Withdrawal of [8] units!
22:24:53.411 [main] INFO - [Application] Withdrawal operation completed in:2 seconds!
```

#### 동적 로드(Dynamic Load)

- 이미 실행 중인 JVM에 Java Attach API를 사용하여 에이전트를 로드합니다.
- 에이전트의 `agentmain` 메서드가 호출됩니다.
- Java Attach API 사용 예시:

```java
VirtualMachine jvm = VirtualMachine.attach(jvmPid);
jvm.loadAgent(agentFile.getAbsolutePath());
jvm.detach();
```

### 3.2 실제 동적 로드 시나리오

프로덕션 환경에서 실행 중인 ATM 애플리케이션에 다운타임 없이 트랜잭션 시간 측정 기능을 추가하는 예제:

1. 먼저 애플리케이션 실행:
```
java -jar application.jar StartMyAtmApplication
22:44:21.154 [main] INFO - [Application] Starting ATM application
22:44:23.157 [main] INFO - [Application] Successful Withdrawal of [7] units!
```

2. 첫 번째 거래 후, 에이전트 동적 연결:
```
java -jar application.jar LoadAgent
22:44:27.022 [main] INFO - Attaching to target JVM with PID: 6575
22:44:27.306 [main] INFO - Attached to target JVM and loaded Java agent successfully
```

3. 에이전트 연결 후 로그:
```
22:44:27.229 [Attach Listener] INFO - [Agent] In agentmain method
22:44:27.230 [Attach Listener] INFO - [Agent] Transforming class MyAtm
22:44:33.157 [main] INFO - [Application] Successful Withdrawal of [8] units!
22:44:33.157 [main] INFO - [Application] Withdrawal operation completed in:2 seconds!
```

:::note
두 번째 인출 작업부터 수행 시간이 표시되는 것을 확인할 수 있습니다. 애플리케이션 코드를 수정하지 않고도 실행 중에 기능이 추가되었습니다.
:::

## 4. Java 에이전트 구현하기

### 4.1 주요 Instrumentation API 메서드

- `addTransformer`: 인스트루먼테이션 엔진에 트랜스포머를 추가
- `getAllLoadedClasses`: JVM에 의해 현재 로드된 모든 클래스의 배열을 반환
- `retransformClasses`: 이미 로드된 클래스의 바이트코드를 변환
- `removeTransformer`: 등록된 트랜스포머를 제거
- `redefineClasses`: 클래스를 새로운 바이트코드로 완전히 대체

### 4.2 Premain과 Agentmain 메서드 구현

```java
public static void premain(String agentArgs, Instrumentation inst) {
    LOGGER.info("[Agent] In premain method");
    String className = "com.baeldung.instrumentation.application.MyAtm";
    transformClass(className, inst);
}

public static void agentmain(String agentArgs, Instrumentation inst) {
    LOGGER.info("[Agent] In agentmain method");
    String className = "com.baeldung.instrumentation.application.MyAtm";
    transformClass(className, inst);
}

private static void transformClass(String className, Instrumentation instrumentation) {
    Class<?> targetCls = null;
    ClassLoader targetClassLoader = null;
    
    // Class.forName으로 클래스 찾기 시도
    try {
        targetCls = Class.forName(className);
        targetClassLoader = targetCls.getClassLoader();
        transform(targetCls, targetClassLoader, instrumentation);
        return;
    } catch (Exception ex) {
        LOGGER.error("Class [{}] not found with Class.forName");
    }
    
    // 로드된 모든 클래스 순회하며 대상 클래스 찾기
    for(Class<?> clazz: instrumentation.getAllLoadedClasses()) {
        if(clazz.getName().equals(className)) {
            targetCls = clazz;
            targetClassLoader = targetCls.getClassLoader();
            transform(targetCls, targetClassLoader, instrumentation);
            return;
        }
    }
    throw new RuntimeException("Failed to find class [" + className + "]");
}

private static void transform(Class<?> clazz, ClassLoader classLoader, Instrumentation instrumentation) {
    AtmTransformer dt = new AtmTransformer(clazz.getName(), classLoader);
    instrumentation.addTransformer(dt, true);
    try {
        instrumentation.retransformClasses(clazz);
    } catch (Exception ex) {
        throw new RuntimeException("Transform failed for: [" + clazz.getName() + "]", ex);
    }
}
```

### 4.3 ClassFileTransformer 구현

Javassist 라이브러리를 사용하여 MyAtm 클래스에 시간 측정 코드를 추가하는 예:

```java
public class AtmTransformer implements ClassFileTransformer {
    @Override
    public byte[] transform(
      ClassLoader loader, 
      String className, 
      Class<?> classBeingRedefined, 
      ProtectionDomain protectionDomain, 
      byte[] classfileBuffer) {
        
        byte[] byteCode = classfileBuffer;
        String finalTargetClassName = this.targetClassName.replaceAll("\\.", "/");
        
        if (!className.equals(finalTargetClassName)) {
            return byteCode;
        }

        if (className.equals(finalTargetClassName) && loader.equals(targetClassLoader)) {
            LOGGER.info("[Agent] Transforming class MyAtm");
            try {
                ClassPool cp = ClassPool.getDefault();
                CtClass cc = cp.get(targetClassName);
                CtMethod m = cc.getDeclaredMethod(WITHDRAW_MONEY_METHOD);
                
                // 시작 시간 측정 코드 추가
                m.addLocalVariable("startTime", CtClass.longType);
                m.insertBefore("startTime = System.currentTimeMillis();");

                // 종료 시간 측정 및 로그 코드 추가
                StringBuilder endBlock = new StringBuilder();
                m.addLocalVariable("endTime", CtClass.longType);
                m.addLocalVariable("opTime", CtClass.longType);
                endBlock.append("endTime = System.currentTimeMillis();");
                endBlock.append("opTime = (endTime-startTime)/1000;");
                endBlock.append(
                  "LOGGER.info(\"[Application] Withdrawal operation completed in:\" + " +
                  "opTime + \" seconds!\");");

                m.insertAfter(endBlock.toString());

                byteCode = cc.toBytecode();
                cc.detach();
            } catch (NotFoundException | CannotCompileException | IOException e) {
                LOGGER.error("Exception", e);
            }
        }
        return byteCode;
    }
}
```

### 4.4 에이전트 JAR 매니페스트 파일

에이전트 JAR 파일의 매니페스트에 다음 속성을 추가:

```
Agent-Class: com.baeldung.instrumentation.agent.MyInstrumentationAgent
Can-Redefine-Classes: true
Can-Retransform-Classes: true
Premain-Class: com.baeldung.instrumentation.agent.MyInstrumentationAgent
```

## 5. 바이트코드 조작 시점

바이트코드 조작은 다음 세 가지 시점에 발생할 수 있습니다:

### 5.1 클래스 로드 시 변환

- 클래스가 JVM에 처음 로드될 때 바이트코드를 변환합니다.
- 아직 로드되지 않은 클래스에만, 즉 앞으로 로드될 클래스에만 적용됩니다.

### 5.2 이미 로드된 클래스의 변환

- 이미 JVM에 로드된 클래스의 바이트코드를 변환합니다.
- `retransformClasses` 메서드를 사용하여 구현합니다.
- 위 ATM 예제에서 사용한 방식입니다.

### 5.3 클래스 재정의(Redefinition)

- 이미 로드된 클래스를 완전히 새로운 바이트코드로 대체합니다.
- `redefineClasses` 메서드를 사용합니다.
- 변환보다 더 광범위한 변경이 가능하지만 제약도 더 많습니다.

## 6. 자바 에이전트 활용 사례

- 애플리케이션 모니터링: 성능 측정, 메모리 사용량 추적
- 프로파일링: 메서드 실행 시간 측정, 병목 현상 식별
- 로깅 강화: 특정 메서드 호출 시 자동 로깅 추가
- 테스트 커버리지 분석: 코드의 어느 부분이 실행되었는지 추적
- 보안 감사: 민감한 메서드 호출 감시
- 핫 스왑(Hot swapping): 실행 중인 애플리케이션의 코드 업데이트

## 7. 결론

- Java Instrumentation API를 사용하면 애플리케이션 코드를 수정하지 않고도 바이트코드를 동적으로 변경할 수 있습니다.
- 정적 로드와 동적 로드 메커니즘을 통해 다양한 시나리오에 맞게 에이전트를 적용할 수 있습니다.
- 실제 ATM 애플리케이션 예제를 통해 본 것처럼, 기존 애플리케이션에 모니터링, 로깅 등의 기능을 비침투적으로 추가할 수 있습니다.
- 특히 레거시 시스템이나 서드파티 라이브러리 확장 시 매우 유용한 기술입니다.

## 참고

- https://www.baeldung.com/java-instrumentation