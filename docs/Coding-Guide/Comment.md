## 1. 주석

- 주석은 나쁜 코드를 보완하지 못한다. 코드가 지저분해서 주석을 달아야 한다면, 주석보다 코드부터 정리해야 한다.
- 주석은 코드로 의도를 표현하지 못했을 때 사용하는 **차선책**이다. 진실은 코드에만 있고, 주석은 시간이 지나면 코드와 어긋나기(stale) 쉽다.
- 주석을 달고 싶다면 먼저 "이름을 바꾸거나 함수를 추출해서 코드 자체로 설명할 수 없는가"를 먼저 자문한다.

## 2. 좋은 주석

### 2.1 법적인 주석(Legal Comments)

- 저작권, 라이선스 정보처럼 회사 규정상 명시해야 하는 주석.

```java
// Copyright (C) 2024 by Object Mentor, Inc. All rights reserved.
// GNU General Public License 조건에 따라 배포된다.
```

### 2.2 정보를 제공하는 주석(Informative Comments)

- 정규표현식이 의미하는 값의 형태, 반환값의 형식 등 코드만으로는 바로 알기 어려운 정보를 알려준다.
- 다만 가능하다면 정보를 함수/변수 이름으로 옮기는 편이 더 낫다.

```java
// kk:mm:ss EEE, MMM dd, yyyy 형식이다
Pattern timeMatcher = Pattern.compile("\\d*:\\d*:\\d* \\w*, \\w* \\d*, \\d*");
```

### 2.3 의도를 설명하는 주석(Explanation of Intent)

- 어떤 결정을 왜 그렇게 내렸는지 배경을 설명한다. 코드만 보면 이상해 보이는 구현이 사실은 의도된 선택임을 알려준다.

```java
// 스레드를 대량으로 생성하는 방법으로 문제를 재현하려 시도한다
for (int i = 0; i < 25000; i++) {
    WidgetBuilderThread widgetBuilderThread =
        new WidgetBuilderThread(widgetBuilder, text, parent, failFlag);
}
```

### 2.4 의미를 명료하게 밝히는 주석(Clarification)

- 표준 라이브러리처럼 코드를 바꿀 수 없거나, 인자/반환값 자체가 모호해 그 의미를 옆에서 번역해줘야 할 때 사용한다.
- 다만 주석 내용이 실제로 맞는지 검증하기 어려우므로, 가능하면 값을 의미 있는 변수로 뽑아내는 방법을 먼저 고려한다.

```java
assertTrue(a.compareTo(a) == 0);   // a == a
assertTrue(a.compareTo(b) != 0);   // a != b
```

### 2.5 결과를 경고하는 주석(Warning of Consequences)

- 다른 개발자에게 특정 코드를 건드릴 때 발생할 위험을 미리 알려준다.

```java
// 여유 시간이 충분하지 않다면 이 테스트는 실행하지 마라.
public void _testWithReallyBigFile() {
    writeLinesToFile(10000000);
    ...
}
```

```java
// 이 클래스는 스레드에 안전하지 않다. 다중 스레드 환경에서는 별도로 동기화해야 한다.
```

### 2.6 TODO 주석

- "지금 당장은 할 수 없지만 앞으로 해야 할 일"을 남긴다.
- 단, TODO를 핑계로 방치하지 않도록 주기적으로 점검하고 정리해야 한다.

```java
// TODO-MdM 현재 필요하지 않다.
// 체크아웃 모델을 도입하면 함수가 필요 없어진다.
protected VersionInfo makeVersion() throws Exception {
    return null;
}
```

### 2.7 중요성을 강조하는 주석(Amplification)

- 별것 아니어 보이는 코드가 실제로는 중요하다는 점을 강조한다.

```java
// trim은 매우 중요하다. 문자열에 시작 공백문자가 있으면 문자열이 다른 문자열로 인식된다.
String listItemContent = match.group(3).trim();
```

### 2.8 공개 API의 Javadoc

- 공개 API(라이브러리, 모듈 경계 등 외부에서 사용하는 코드)는 사용자가 구현을 보지 않고도 사용할 수 있도록 잘 작성된 Javadoc이 유용하다.

## 3. 나쁜 주석

대부분의 주석은 여기에 해당한다. 부실한 코드를 지탱하거나, 잘못된 정보를 전달하거나, 코드보다 못한 결정을 정당화하는 주석은 모두 나쁜 주석이다.

### 3.1 주절거리는 주석

- 특별한 이유 없이 의무감으로 작성한 주석. 다른 곳까지 뒤져야 의미를 알 수 있다면 독자와 제대로 소통하지 못하는 주석이다.

```java
public void loadProperties() {
    try {
        String propertiesPath = propertiesLocation + "/" + PROPERTIES_FILE;
        FileInputStream propertiesStream = new FileInputStream(propertiesPath);
        loadedProperties.load(propertiesStream);
    } catch (IOException e) {
        // 속성 파일이 없다면 기본값을 모두 메모리로 읽어들였다는 뜻이다.
    }
}
```

### 3.2 같은 이야기를 중복하는 주석(Redundant Comments)

- 코드만 읽어도 알 수 있는 내용을 그대로 반복한다. 코드보다 읽기 오히려 더 오래 걸리고, 코드와 어긋날 위험만 늘린다.

```java
// this.closed가 true일 때 반환되는 유틸리티 메서드다.
// 타임아웃에 도달하면 예외를 던진다.
public synchronized void waitForClose(final long timeoutMillis) throws Exception {
    if (!closed) {
        wait(timeoutMillis);
        if (!closed) throw new Exception("MockResponseSender could not be closed");
    }
}
```

### 3.3 오해할 여지가 있는 주석(Misleading Comments)

- 의도는 좋았지만 미묘하게 부정확해서 독자가 잘못된 믿음을 갖게 만드는 주석. 코드와 어긋난 주석은 없느니만 못하다.

### 3.4 의무적으로 다는 주석(Mandated Comments)

- "모든 함수/변수에는 Javadoc을 달아야 한다" 같은 규칙 때문에 억지로 채워 넣은 주석. 코드를 헷갈리게 하고 거짓 정보를 퍼뜨릴 여지만 만든다.

```java
/**
 * @param title CD 제목
 * @param author CD 저자
 * @param tracks 트랙 숫자
 * @param durationInMinutes CD 길이(분)
 */
public void addCD(String title, String author, int tracks, int durationInMinutes) {
    ...
}
```

### 3.5 이력을 기록하는 주석(Journal Comments)

- 파일 상단에 변경 이력을 계속 추가하는 방식. 지금은 버전 관리 시스템(git)이 그 역할을 대신하므로 완전히 제거해도 된다.

### 3.6 있으나 마나 한 주석(Noise Comments)

- 당연한 사실을 재진술할 뿐 새로운 정보가 없다. 습관적으로 채워 넣다 보면 정작 중요한 주석까지 무시하게 만든다.

```java
/** 기본 생성자 */
protected AnnualDateRule() {
}

/** 월 중 일자 */
private int dayOfMonth;
```

### 3.7 함수/변수로 표현할 수 있는데 굳이 주석을 단 경우

- 코드 일부를 설명하는 주석이 있다면, 그 코드를 이름이 있는 함수나 변수로 추출해 주석 없이도 뜻이 드러나게 만드는 편이 낫다.

```java
// Bad
// 전역 목록 <smodule>에 속하는 module인지 확인한다.
if ((module.getDependees().get(subSysMod.getSubSystem()) != null) &&
    !module.getName().equals(smodule)) {

// Good
ArrayList moduleDependees = module.getDependees();
String ourSubSystem = subSysMod.getSubSystem();
if (moduleDependees.contains(ourSubSystem) && !module.getName().equals(smodule)) {
```

### 3.8 위치를 표시하는 주석(Position Markers)

- `// Actions //////////////////////` 처럼 특정 위치를 강조하는 배너. 반드시 필요한 경우가 아니면 잡음이 되므로 남용하지 않는다.

### 3.9 닫는 괄호에 다는 주석(Closing Brace Comments)

- 중첩된 블록의 끝에 `} // while` 처럼 표시하는 주석. 함수가 이런 표시가 필요할 만큼 길고 복잡하다면, 주석 대신 함수 자체를 줄이는 것이 먼저다.

### 3.10 저자를 표시하는 주석(Attributions and Bylines)

- `/* 홍길동이 추가함 */` 같은 주석. 누가 언제 작성했는지는 버전 관리 시스템의 blame 정보가 훨씬 정확하게 기록한다.

### 3.11 주석으로 처리된 코드(Commented-Out Code)

- 사용하지 않는 코드를 지우지 않고 주석으로만 남겨두는 것. 다른 사람은 지워도 되는지 알 수 없어 지우기를 꺼리게 되고, 시간이 지나면 의미 없는 쓰레기 코드가 쌓인다. 버전 관리 시스템을 믿고 바로 삭제한다.

```java
// InputStreamResponse response = new InputStreamResponse();
// response.setBody(formatter.getResultStream(), formatter.getByteCount());
InputStreamResponse response = new InputStreamResponse();
```

### 3.12 HTML 주석

- 코드 안의 주석에 HTML 태그가 섞여 있으면 사람이 읽기 어렵다. 문서화 도구가 HTML로 변환하는 역할을 대신해야지, 소스 코드 안에서 사람이 직접 HTML을 읽게 만들면 안 된다.

### 3.13 전역 정보(Nonlocal Information)

- 주석을 적은 위치와 무관한, 시스템 전반의 정보(예: 기본 포트 번호)를 지역 주석에 적어두면 해당 코드가 변경돼도 주석은 갱신되지 않는다. 설명하려는 코드 바로 근처에서, 그 코드에 대한 이야기만 한다.

### 3.14 너무 많은 정보(Too Much Information)

- 흥미로운 역사, 관련 없는 세부사항 등 필요 이상의 정보를 주석에 채워 넣지 않는다.

### 3.15 모호한 관계(Inobvious Connection)

- 주석과 그 주석이 설명하는 코드의 관계가 명확하지 않은 경우. 주석을 다는 이유는 코드를 설명하기 위해서인데, 정작 그 주석 자체를 다시 설명해야 한다면 본말이 전도된 것이다.

### 3.16 짧은 함수에 붙은 함수 헤더

- 짧고 한 가지 일만 하는 함수에는 긴 설명이 필요 없다. 함수 이름과 인자만으로 설명이 충분하도록 만들고, 헤더 주석은 최소화한다.

### 3.17 비공개 코드의 Javadoc

- 공개 API가 아닌 내부 코드에 형식적인 Javadoc을 다는 것은 대개 불필요한 잡음이다.

## 4. 체크리스트

- [ ] 이 주석이 없어도 코드(이름, 구조)만으로 의도가 드러나는가? → 드러난다면 주석을 지우고 코드를 개선한다.
- [ ] 주석이 코드와 다른 내용을 말하고 있지 않은가? (오해를 유발하는 주석)
- [ ] 당연한 내용을 반복하고 있지 않은가? (noise, redundant)
- [ ] 주석 처리된 죽은 코드, 변경 이력, 작성자 정보를 남겨두고 있지 않은가? → 버전 관리 시스템에 맡기고 삭제한다.
- [ ] 이 주석은 "왜(why)"를 설명하는가, 아니면 "무엇을(what)"을 설명하는가? → "무엇을"이라면 대부분 불필요하다.
- [ ] TODO 주석이 방치되어 있지 않은가?

## 참고

- Robert C. Martin, *Clean Code: A Handbook of Agile Software Craftsmanship*, Chapter 4. Comments
