## 1. Logback

- Logback은 인기 있는 log4j 프로젝트의 후속작으로 의도되었습니다. 
- log4j의 창시자인 Ceki Gülcü에 의해 설계되었습니다. 
- 산업용 수준의 로깅 시스템을 설계하는 데 있어 10년간 쌓인 경험을 기반으로 합니다. 
- 그 결과물인 logback은 때로는 상당한 차이로 기존의 모든 로깅 시스템보다 더 빠르고 더 작은 메모리 공간을 차지합니다. 
- 그리고 중요한 것은, logback이 다른 로깅 시스템에는 없는 독특하고 매우 유용한 기능들을 제공한다는 점입니다.

## 2. Architecture

### 2.1 Logback의 아키텍처

- Logback의 기본 아키텍처는 다양한 상황에 적용될 수 있도록 충분히 일반적으로 설계되었습니다. 
- 현재 logback은 logback-core, logback-classic, logback-access의 세 모듈로 나뉘어 있습니다.
- core 모듈은 다른 두 모듈의 기반을 마련합니다

### 2.1 Logger, Appender 및 Layout

- Logback은 Logger, Appender, Layout이라는 세 가지 주요 클래스를 기반으로 구축되었습니다. 
- 이 세 가지 유형의 컴포넌트는 개발자가 메시지 유형과 레벨에 따라 메시지를 로깅하고, 런타임에 이러한 메시지가 어떻게 포맷되고 어디에 보고되는지 제어할 수 있도록 함께 작동합니다.
- Logger 클래스는 logback-classic 모듈의 일부입니다. 
  - 반면, Appender와 Layout 인터페이스는 logback-core의 일부입니다. 
  - 범용 모듈인 logback-core는 로거의 개념이 없습니다.
  
## 3. Configuration

## 4. Appenders

- Logback에서 appender는 로그 메시지가 출력되는 대상을 의미합니다
- 다양한 유형이 있습니다: 콘솔, 파일, 데이터베이스, 원격 서버 등
- 하나의 로거에 여러 appender를 연결할 수 있어 동시에 여러 대상에 로그를 남길 수 있습니다

## 5. Encoders

- 엔코더는 로깅 이벤트를 바이트 배열로 변환하고, 그 바이트 배열을 OutputStream에 쓰는 역할을 담당합니다. 
- 로깅 데이터가 실제로 어떤 형태로 저장될지 결정하는 중요한 컴포넌트입니다.

### 5.1 Encoder 인터페이스

```java
public interface Encoder<E> extends ContextAware, LifeCycle {
    byte[] headerBytes(); // 헤더 바이트 반환 (스트림 열 때 호출됨)
    byte[] encode(E event); // 이벤트를 바이트로 인코딩
    byte[] footerBytes(); // 푸터 바이트 반환 (스트림 닫기 전 호출됨)
}
```

### 5.2 주요 Encoder 구현체

- LayoutWrappingEncoder:
  - 기존 레이아웃을 엔코더로 감싸서 사용할 수 있게 해줌
  - 레이아웃이 생성한 문자열을 지정된 문자 인코딩(charset)으로 바이트로 변환
- PatternLayoutEncoder:
  - 가장 많이 사용되는 엔코더
  - 패턴 레이아웃을 감싸는 특화된 LayoutWrappingEncoder
  - %d %level [%thread] %logger{36} - %msg%n 같은 패턴 사용 가능
- JsonEncoder:
  - 로깅 이벤트를 JSON 형식으로 변환
  - JSON Lines 표준을 따름 (각 로그 이벤트가 한 줄의 JSON으로 표현)
  - 각 필드의 출력 여부를 설정 가능 (withFormattedMessage, withMessage 등)

### 5.3 Pattern과 charset

- Pattern은 로그 메시지의 형식을 정의하는 문자열입니다.
- charset은 로그 메시지를 인코딩하는 문자 집합을 지정합니다.
  - 예를 들어, UTF-8, ISO-8859-1 등의 문자 집합을 사용할 수 있습니다.



## 참고

- https://logback.qos.ch/manual/index.html