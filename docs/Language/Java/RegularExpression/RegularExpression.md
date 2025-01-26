---
title: "Regular Expression"
description: "Java의 정규표현식 기능을 완벽하게 마스터하기 위한 가이드입니다. Pattern과 Matcher 클래스의 상세한 사용법부터 성능 최적화, 유니코드 지원까지 실전에서 바로 활용할 수 있는 내용을 다룹니다."
tags: ["REGEX", "JAVA", "STRING", "PATTERN_MATCHING", "BACKEND"]
keywords: ["정규표현식", "정규식", "regex", "regular expression", "레그엑스", "자바", "java", "패턴매칭", "pattern matching", "문자열처리", "Pattern클래스", "Matcher클래스", "유니코드", "Unicode"]
draft: false
hide_title: true
---

## 1. Java 정규표현식의 기초
- 정규표현식(Regular Expression)은 문자열을 처리하기 위한 강력한 도구입니다.
  - 정규 표현식은 특정한 규칙을 가진 문자열의 집합을 표현하기 위해 사용되는 형식 언어입니다.
  - 주로 문자열 검색, 유효성 검사, 데이터 추출 등에 활용됩니다.
- Java에서는 `java.util.regex` 패키지를 통해 정규표현식 기능을 제공하며, 주로 `Pattern`과 `Matcher` 클래스를 사용합니다.

### 1.1 Pattern과 Matcher의 관계

:::info
Pattern 객체는 불변(immutable)이며 스레드 안전합니다. 반면 Matcher 객체는 스레드 안전하지 않습니다.
:::

```java
// 기본적인 사용 패턴
Pattern pattern = Pattern.compile("a*b");
Matcher matcher = pattern.matcher("aaaaab");
boolean matches = matcher.matches();

// 일회성 매칭을 위한 간편 메소드
boolean isMatch = Pattern.matches("a*b", "aaaaab");
```
- Pattern 클래스는 정규 표현식 패턴을 컴파일하고 생성하는 역할을 합니다.
- Matcher 클래스는 패턴을 입력 문자열에 적용하여 매칭 작업을 수행합니다.

## 2. 정규표현식 문법 상세

### 2.1 문자 표현

:::note 백슬래시 처리
Java 문자열에서 백슬래시를 표현하려면 두 번 이스케이프해야 합니다.
예: 실제 정규식 `\d`를 Java에서는 `\\d`로 작성
:::

```java
// 일반 문자
x       // 문자 x 자체
\\      // 백슬래시
\t      // 탭
\n      // 줄바꿈
\r      // 캐리지 리턴
\f      // 폼피드
```

### 2.2 자주 사용되는 문자 클래스

```java
[abc]       // a, b, c 중 하나
[^abc]      // a, b, c를 제외한 모든 문자
[a-zA-Z]    // 영문자
[a-z&&[^m-p]] // a-z에서 m-p를 제외
```

### 2.3 미리 정의된 문자 클래스

```java
.   // 모든 문자 (줄바꿈 문자 제외)
\d  // 숫자: [0-9]
\D  // 숫자가 아닌 문자: [^0-9]
\s  // 공백 문자: [ \t\n\x0B\f\r]
\S  // 공백이 아닌 문자
\w  // 단어 문자: [a-zA-Z_0-9]
\W  // 단어가 아닌 문자
```

## 3. 고급 패턴 매칭

### 3.1 경계 매칭

```java
^     // 라인의 시작
$     // 라인의 끝
\b    // 단어 경계
\B    // 비단어 경계
\A    // 입력의 시작
\Z    // 입력의 끝 (최종 종결자 제외)
\z    // 입력의 끝
```

### 3.2 수량자(Quantifiers)

:::warning 탐욕적(Greedy) vs 게으른(Lazy) 수량자
기본적으로 수량자는 탐욕적입니다. 가능한 많은 문자를 매칭하려 합니다.
게으른 수량자(?)를 사용하면 최소한의 문자만 매칭합니다.
:::

```java
// 탐욕적 수량자
X?     // X가 0번 또는 1번
X*     // X가 0번 이상
X+     // X가 1번 이상
X{n}   // X가 정확히 n번
X{n,}  // X가 n번 이상
X{n,m} // X가 n번 이상 m번 이하

// 게으른 수량자
X??    // X가 0번 또는 1번 (최소 매칭)
X*?    // X가 0번 이상 (최소 매칭)
X+?    // X가 1번 이상 (최소 매칭)
```

### 3.3 그룹과 캡처

:::tip
그룹은 왼쪽에서 오른쪽으로 번호가 매겨지며, 전체 패턴은 항상 그룹 0입니다.
:::

```java
// 기본 그룹
(X)         // 캡처 그룹
(?:X)       // 비캡처 그룹
(?<name>X)  // 이름이 있는 캡처 그룹

// 그룹 참조
\1          // 첫 번째 그룹 참조
\k<name>    // 이름이 있는 그룹 참조
```

## 4. 유니코드 지원

### 4.1 유니코드 속성

```java
\p{IsHangul}     // 한글 문자
\p{IsLatin}      // 라틴 문자
\p{Lu}           // 대문자
\p{Ll}           // 소문자
\p{IsAlphabetic} // 알파벳 문자
```

### 4.2 유니코드 스크립트와 블록

```java
// 스크립트
\p{script=Hangul}  // 한글 스크립트
\p{sc=Han}         // 한자 스크립트

// 블록
\p{block=Hangul}   // 한글 블록
\p{blk=CJK}        // CJK 블록
```

## 5. 실전 패턴 예제

### 5.1 이메일 주소 검증

```java
public static final Pattern EMAIL_PATTERN = Pattern.compile(
    "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*" +
    "@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
);

public static boolean isValidEmail(String email) {
    return EMAIL_PATTERN.matcher(email).matches();
}
```

### 5.2 한글 이름 검증

```java
public static final Pattern KOREAN_NAME_PATTERN = Pattern.compile(
    "^[가-힣]{2,5}$"
);

public static boolean isValidKoreanName(String name) {
    return KOREAN_NAME_PATTERN.matcher(name).matches();
}
```

## 6. 성능 최적화

### 6.1 Pattern 객체 재사용

:::danger
Pattern.compile()은 비용이 큰 연산입니다.
가능한 static final로 선언하여 재사용하세요.
:::

```java
// 좋은 예
private static final Pattern URL_PATTERN = 
    Pattern.compile("^https?://[\\w.-]+\\.[a-zA-Z]{2,6}(/.*)?$");

// 피해야 할 예
public boolean isValidUrl(String url) {
    return Pattern.matches("^https?://[\\w.-]+\\.[a-zA-Z]{2,6}(/.*)?$", url);
}
```

### 6.2 복잡한 패턴 최적화

```java
// 비효율적인 패턴
String inefficientPattern = ".*foo.*";  // 전체 문자열 스캔

// 효율적인 패턴
String efficientPattern = ".*?foo.*?";  // 최소 매칭
// 또는
String moreEfficientPattern = "foo";    // contains() 사용이 더 효율적
```

## 7. 자주 발생하는 실수와 해결방법

### 7.1 메타문자 이스케이프

:::warning
다음 문자들은 메타문자이므로 리터럴로 사용시 이스케이프 필요:
`.<>()[]{}\\^$|?*+`
:::

```java
// 마침표(.)를 찾고 싶을 때
Pattern.compile("\\.");

// 괄호를 찾고 싶을 때
Pattern.compile("\\(.*\\)");
```

### 7.2 줄바꿈 처리

```java
// 기본적으로 .은 줄바꿈을 매치하지 않음
Pattern pattern1 = Pattern.compile(".*");

// 줄바꿈을 포함한 매칭을 원할 경우
Pattern pattern2 = Pattern.compile(".*", Pattern.DOTALL);
// 또는
Pattern pattern3 = Pattern.compile("(?s).*");
```

## 8. Matcher 클래스의 고급 기능

### 8.1 find()와 group() 활용

```java
Pattern pattern = Pattern.compile("(\\w+)=(\\d+)");
Matcher matcher = pattern.matcher("width=100,height=200");

while (matcher.find()) {
    String key = matcher.group(1);    // 첫 번째 그룹
    String value = matcher.group(2);  // 두 번째 그룹
    System.out.println(key + ": " + value);
}
```

### 8.2 문자열 치환

```java
Pattern pattern = Pattern.compile("cat");
Matcher matcher = pattern.matcher("A cat and another cat");

// 첫 번째 발견된 패턴만 치환
String result1 = matcher.replaceFirst("dog");

// 모든 패턴 치환
String result2 = matcher.replaceAll("dog");

// 조건부 치환
StringBuffer result = new StringBuffer();
while (matcher.find()) {
    matcher.appendReplacement(result, 
        matcher.group().equals("cat") ? "dog" : "pet");
}
matcher.appendTail(result);
```

## 9. 마치며
- Java의 정규표현식은 강력한 문자열 처리 기능을 제공하지만, 적절히 사용하는 것이 중요합니다.
- 주요 고려사항:
  - Pattern 객체의 재사용으로 성능 최적화
  - 적절한 이스케이프 처리
  - 유니코드 지원 활용
  - 그룹과 캡처의 효과적인 사용
  - 수량자 선택 시 성능 고려
