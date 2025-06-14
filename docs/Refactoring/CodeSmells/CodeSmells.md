---
title: "Code Smells"
description: "Martin Fowler의 코드 스멜 개념을 상세히 설명합니다. Bloaters, Object-Orientation Abusers, Change Preventers, Dispensables, Couplers 5가지 분류와 각각의 특징, 해결 방법을 다룹니다. 리팩토링을 통해 코드 품질을 향상시키고 싶은 개발자를 위한 실무 중심 가이드입니다."
tags: [ "CODE_SMELL", "REFACTORING", "CODE_QUALITY", "CLEAN_CODE", "JAVA", "SPRING", "BACKEND" ]
keywords: [ "코드스멜", "code smell", "코드 스멜", "코드냄새", "리팩토링", "refactoring", "마틴파울러", "martin fowler", "클린코드", "clean code", "코드품질", "code quality", "나쁜코드", "bad code", "bloaters", "비대한코드", "객체지향남용", "변경방해자", "불필요한것들", "결합자", "자바", "java", "스프링", "spring" ]
draft: false
hide_title: true
---

## 1. 코드 스멜이란 무엇인가

- 코드 스멜(Code Smell)은 Martin Fowler가 1999년 저서 "Refactoring: Improving the Design of Existing Code"에서 처음 체계화한 개념입니다.
- 코드가 기능적으로는 정상 작동하지만, 설계나 구조상 문제가 있어 향후 유지보수나 확장에 어려움을 줄 수 있는 징후를 의미합니다.
- 코드 스멜은 버그나 오류가 아니라 "개선이 필요한 신호"로, 리팩토링을 통해 해결할 수 있습니다.

:::info
코드 스멜은 "냄새"라는 표현을 사용해서 직관적으로 "뭔가 문제가 있다"는 느낌을 주지만, 즉시 수정해야 하는 것은 아닙니다. 상황에 따라 우선순위를 정해 점진적으로 개선하는 것이 좋습니다.
:::

### 1.1 코드 스멜의 중요성

- **유지보수성 향상**: 문제가 되는 코드 패턴을 조기에 발견하여 수정 비용을 줄입니다.
- **가독성 개선**: 이해하기 어려운 코드 구조를 개선하여 팀의 생산성을 높입니다.
- **버그 예방**: 복잡하고 결합도가 높은 코드에서 발생할 수 있는 버그를 사전에 방지합니다.
- **확장성 확보**: 새로운 요구사항에 유연하게 대응할 수 있는 코드 구조를 만듭니다.

### 1.2 코드 스멜과 기술 부채

- 코드 스멜은 기술 부채(Technical Debt)의 구체적인 징후라고 볼 수 있습니다.
- 단기적으로는 문제없이 작동하지만, 장기적으로는 개발 속도를 늦추고 유지보수 비용을 증가시킵니다.
- 적절한 리팩토링을 통해 이러한 부채를 줄여나가는 것이 중요합니다.

## 2. Martin Fowler의 코드 스멜 분류 체계

- Martin Fowler는 코드 스멜을 다음 5가지 주요 카테고리로 분류했습니다
	- **Bloaters** (비대한 코드)
	- **Object-Orientation Abusers** (객체지향 남용자)
	- **Change Preventers** (변경 방해자)
	- **Dispensables** (불필요한 것들)
	- **Couplers** (결합자)

## 3. Bloaters (비대한 코드)

- 비대한 코드는 크기가 비정상적으로 커서 다루기 어려운 코드를 의미합니다.
- 시간이 지나면서 점진적으로 커져서 관리가 어려워진 코드들이 이 범주에 속합니다.

### 3.1 Long Method (긴 메서드)

- [레퍼런스](https://refactoring.guru/smells/long-method)
- 징후와 증상
	- 메서드가 너무 많은 코드 라인을 포함하고 있습니다.
	- 일반적으로 10줄보다 긴 메서드는 문제를 제기하기 시작해야 합니다.
- 문제의 원인
	- 메서드에는 항상 무언가가 추가되지만 제거되는 것은 없습니다.
	- 기존 메서드에 추가하는 것보다 새로운 메서드를 만드는 것이 더 어려운 경우가 많습니다.
	- 이는 또 다른 줄이 추가되고 또 다른 줄이 추가되어 스파게티 코드의 엉킴을 만들어냅니다.
- 성능
	- 많은 사람들이 주장하는 것처럼 메서드 수의 증가가 성능에 해를 끼칠까요? 거의 모든 경우에 그 영향은 너무 미미해서 걱정할 가치가 없습니다.

#### 3.1.1 해결 방법

- 경험상, 메서드 내부의 무언가에 주석을 달고 싶다면, 그 코드를 가져와서 새로운 메서드에 넣어야 합니다.
- 설명이 필요하다면 한 줄이라도 별도의 메서드로 분리될 수 있고 분리되어야 합니다.
- 메서드 본문의 길이를 줄이려면 Extract Method를 사용하세요.
  - Extract Method: 긴 메서드의 일부분을 별도의 메서드로 분리하는 기법입니다.
- 지역 변수와 매개변수가 메서드 추출을 방해한다면, Replace Temp with Query, Introduce Parameter Object 또는 Preserve Whole Object를 사용하세요.
  - Replace Temp with Query: 임시 변수를 제거하고, 해당 값을 반환하는 메서드로 대체하는 기법입니다.
  - Introduce Parameter Object: 여러 개의 매개변수를 하나의 객체로 묶어서 전달하는 기법입니다.
  - Preserve Whole Object: 객체의 여러 속성을 개별적으로 전달하는 대신 객체 전체를 전달하는 기법입니다.
- 이전의 방법들이 도움이 되지 않는다면, Replace Method with Method Object를 통해 전체 메서드를 별도의 객체로 이동시키는 것을 시도해보세요.
  - Replace Method with Method Object: 복잡한 메서드를 별도의 클래스로 추출하여 여러 메서드로 분해하는 기법
- 조건 연산자와 루프는 코드가 별도의 메서드로 이동될 수 있다는 좋은 단서입니다. 
  - 조건문의 경우 Decompose Conditional을 사용하세요. 
  - 루프가 방해가 된다면 Extract Method를 시도해보세요.
  - Decompose Conditional: 복잡한 조건문을 별도의 메서드로 분해하는 기법

#### 3.1.2 이점

- 모든 종류의 객체지향 코드 중에서 짧은 메서드를 가진 클래스가 가장 오래 살아남습니다. 
- 메서드나 함수가 길어질수록 이해하고 유지보수하기가 더 어려워집니다.
- 또한, 긴 메서드는 원치 않는 중복 코드를 숨기기에 완벽한 장소를 제공합니다.

### 3.2 Large Class (거대한 클래스)

- **특징**: 하나의 클래스가 너무 많은 책임을 가지고 있는 경우입니다.
- **문제점**: 단일 책임 원칙(SRP)을 위반하며, 클래스의 응집도가 낮아집니다.
- **해결방법**: Extract Class나 Extract Subclass를 통해 책임을 분리합니다.
- **실무 예시**: UserService가 사용자 관리뿐만 아니라 이메일 발송, 파일 업로드, 알림 등 모든 기능을 처리하는 경우입니다.

### 3.3 Long Parameter List (긴 매개변수 목록)

- **특징**: 메서드의 매개변수가 4개 이상으로 많은 경우입니다.
- **문제점**: 메서드 호출이 복잡해지고, 매개변수 순서를 기억하기 어려워집니다.
- **해결방법**: Parameter Object 패턴을 사용해 관련 매개변수들을 객체로 묶습니다.
- **실무 예시**: 보고서 생성 메서드에 시작일, 종료일, 지역, 카테고리, 포맷 등 10개 이상의 매개변수가 있는 경우입니다.

### 3.4 Data Clumps (데이터 덩어리)

- **특징**: 항상 함께 나타나는 데이터 그룹이 여러 곳에서 반복되는 경우입니다.
- **문제점**: 코드 중복이 발생하고, 관련 데이터의 일관성을 보장하기 어려워집니다.
- **해결방법**: Extract Class를 통해 관련 데이터를 하나의 클래스로 묶습니다.
- **실무 예시**: 주소 정보(거리, 도시, 우편번호, 국가)가 Customer, Supplier, Order 클래스에 각각 개별 필드로 존재하는 경우입니다.

### 3.5 Primitive Obsession (기본형 집착)

- 징후와 증상
  - 간단한 작업에 작은 객체 대신 원시 타입을 사용 (통화, 범위, 전화번호용 특수 문자열 등)
  - 정보 코딩을 위한 상수 사용 (관리자 권한을 가진 사용자를 참조하기 위한 USER_ADMIN_ROLE = 1과 같은 상수)
  - 데이터 배열에서 사용할 필드명으로 문자열 상수 사용

#### 3.5.1 해결 방법

- 다양한 원시 타입 필드가 많다면, 그 중 일부를 논리적으로 그룹화하여 자체 클래스로 만드는 것이 가능할 수 있습니다. 
  - 더 좋게는, 이 데이터와 관련된 동작도 클래스로 이동시키세요. 
  - 이 작업을 위해 Replace Data Value with Object를 시도해보세요.
- 원시 타입 필드의 값이 메서드 매개변수에서 사용된다면, Introduce Parameter Object 또는 Preserve Whole Object를 사용하세요.
- 복잡한 데이터가 변수에 코딩되어 있을 때는, Replace Type Code with Class, Replace Type Code with Subclasses 또는 Replace Type Code with State/Strategy를 사용하세요.
- 변수 중에 배열이 있다면, Replace Array with Object를 사용하세요.

#### 3.5.2 이점

- 원시 타입 대신 객체를 사용함으로써 코드가 더 유연해집니다.
- 코드의 이해성과 구성이 향상됩니다. 특정 데이터에 대한 연산이 흩어져 있지 않고 같은 장소에 있습니다. 
- 이 모든 이상한 상수들과 왜 그것들이 배열에 있는지에 대한 이유를 더 이상 추측할 필요가 없습니다.
- 중복 코드를 더 쉽게 찾을 수 있습니다.

## 4. Object-Orientation Abusers (객체지향 남용자)

객체지향 원칙을 잘못 적용하거나 무시하는 코드들입니다. 객체지향의 이점을 제대로 활용하지 못하는 경우가 많습니다.

### 4.1 Switch Statements (스위치 문)

- **특징**: 타입에 따른 분기 처리가 여러 곳에 흩어져 있는 경우입니다.
- **문제점**: 새로운 타입이 추가될 때마다 모든 switch문을 수정해야 합니다.
- **해결방법**: Replace Type Code with Polymorphism을 통해 다형성을 활용합니다.
- **실무 예시**: 결제 타입에 따라 처리 로직, 수수료 계산, 설명 생성이 각각 다른 곳에 switch문으로 구현된 경우입니다.

### 4.2 Temporary Field (임시 필드)

- **특징**: 특정 상황에서만 사용되는 인스턴스 변수가 있는 경우입니다.
- **문제점**: 객체의 상태가 불명확해지고, 필드의 용도를 이해하기 어려워집니다.
- **해결방법**: Extract Class를 통해 관련 필드들을 별도 객체로 분리합니다.
- **실무 예시**: Calculator 클래스에서 복잡한 계산을 할 때만 사용되는 중간 결과 저장용 필드들이 있는 경우입니다.

### 4.3 Refused Bequest (거부된 유산)

- **특징**: 하위 클래스가 상위 클래스의 메서드나 속성을 사용하지 않거나 재정의해서 무효화하는 경우입니다.
- **문제점**: 상속 관계가 부적절하게 설계되어 리스코프 치환 원칙을 위반합니다.
- **해결방법**: Replace Inheritance with Delegation이나 상속 구조를 재설계합니다.
- **실무 예시**: Bird 클래스를 상속받은 Penguin 클래스에서 fly() 메서드를 예외를 던지도록 재정의하는 경우입니다.

### 4.4 Alternative Classes with Different Interfaces (다른 인터페이스를 가진 대안 클래스들)

- **특징**: 같은 일을 하지만 메서드 시그니처가 다른 클래스들이 있는 경우입니다.
- **문제점**: 클라이언트 코드에서 일관된 방식으로 사용할 수 없습니다.
- **해결방법**: Rename Method나 Extract Superclass를 통해 인터페이스를 통일합니다.
- **실무 예시**: XMLParser와 JsonParser가 각각 parseXml(), parseJson() 메서드를 가지는 대신 공통의 parse() 메서드를 가져야 하는 경우입니다.

## 5. Change Preventers (변경 방해자)

코드 변경을 어렵게 만드는 구조적 문제들입니다. 한 곳을 수정하기 위해 여러 곳을 동시에 수정해야 하는 경우가 많습니다.

### 5.1 Divergent Change (확산적 변경)

- **특징**: 하나의 클래스가 여러 가지 이유로 자주 변경되는 경우입니다.
- **문제점**: 단일 책임 원칙을 위반하며, 변경 시 예상치 못한 부작용이 발생할 수 있습니다.
- **해결방법**: Extract Class를 통해 변경 이유별로 클래스를 분리합니다.
- **실무 예시**: User 클래스가 사용자 정보 변경, 권한 관리 변경, 알림 설정 변경 등 다양한 이유로 수정되는 경우입니다.

### 5.2 Shotgun Surgery (산탄총 수술)

- **특징**: 하나의 변경사항을 적용하기 위해 여러 클래스를 동시에 수정해야 하는 경우입니다.
- **문제점**: 변경 시 놓치는 부분이 생길 수 있고, 실수할 가능성이 높아집니다.
- **해결방법**: Move Method나 Move Field를 통해 관련 기능을 한 곳으로 모읍니다.
- **실무 예시**: 데이터베이스 스키마 변경 시 Repository, Service, DTO, Controller 등 여러 레이어의 클래스들을 모두 수정해야 하는 경우입니다.

### 5.3 Parallel Inheritance Hierarchies (평행 상속 계층)

- **특징**: 한 클래스의 서브클래스를 만들 때마다 다른 클래스의 서브클래스도 만들어야 하는 경우입니다.
- **문제점**: 코드 중복이 발생하고 계층 구조가 복잡해집니다.
- **해결방법**: Move Method와 Move Field를 사용해 중복을 제거하고 구조를 단순화합니다.
- **실무 예시**: Employee 계층(Manager, Developer, Designer)과 EmployeeReport 계층(ManagerReport, DeveloperReport, DesignerReport)이 항상 함께 확장되는 경우입니다.

## 6. Dispensables (불필요한 것들)

- 코드에서 제거해도 되거나 오히려 제거하는 것이 좋은 요소들입니다. 
- 코드를 더 깔끔하고 이해하기 쉽게 만듭니다.

### 6.1 Comments (주석)

- **특징**: 코드의 의도를 설명하기 위한 과도한 주석이 있는 경우입니다.
- **문제점**: 코드가 변경되어도 주석은 업데이트되지 않아 혼란을 야기할 수 있습니다.
- **해결방법**: Extract Method나 Rename Method를 통해 코드 자체가 의도를 명확히 드러내도록 합니다.
- **실무 예시**: 복잡한 비즈니스 로직에 대한 긴 주석 대신 메서드명과 변수명을 명확하게 작성하는 것이 좋습니다.

:::warning
모든 주석이 나쁜 것은 아닙니다. API 문서, 복잡한 알고리즘 설명, 비즈니스 규칙에 대한 주석은 여전히 유용합니다.
:::

### 6.2 Duplicate Code (중복 코드)

- **특징**: 동일하거나 유사한 코드가 여러 곳에 존재하는 경우입니다.
- **문제점**: 수정 시 모든 중복 부분을 찾아서 변경해야 하고, 일부를 놓칠 위험이 있습니다.
- **해결방법**: Extract Method, Pull Up Method, Form Template Method 등을 사용해 중복을 제거합니다.
- **실무 예시**: 여러 컨트롤러에서 동일한 검증 로직이나 예외 처리 로직이 반복되는 경우입니다.

### 6.3 Lazy Class (게으른 클래스)

- **특징**: 충분한 기능을 수행하지 않아 존재 가치가 의문스러운 클래스입니다.
- **문제점**: 불필요한 복잡성을 추가하고 코드 이해를 어렵게 만듭니다.
- **해결방법**: Inline Class나 Collapse Hierarchy를 통해 클래스를 제거하거나 통합합니다.
- **실무 예시**: 단순히 다른 클래스의 메서드를 호출하기만 하는 Wrapper 클래스나 필드만 있고 로직이 없는 DTO 클래스입니다.

### 6.4 Dead Code (죽은 코드)

- **특징**: 더 이상 사용되지 않는 코드입니다.
- **문제점**: 코드베이스를 불필요하게 복잡하게 만들고 유지보수 부담을 증가시킵니다.
- **해결방법**: 사용되지 않는 코드를 완전히 제거합니다.
- **실무 예시**: 리팩토링 과정에서 남겨진 사용되지 않는 메서드나 더 이상 호출되지 않는 API 엔드포인트입니다.

### 6.5 Data Class (데이터 클래스)

- [레퍼런스](https://refactoring.guru/smells/data-class)
- 징후와 증상
  - 데이터 클래스는 필드와 이에 접근하기 위한 기본적인 메서드들(getter와 setter)만을 포함하는 클래스를 의미합니다. 
  - 이런 클래스들은 단순히 다른 클래스들이 사용하는 데이터의 컨테이너 역할만 합니다. 
  - 이러한 클래스들은 추가적인 기능을 포함하지 않으며, 자신이 소유한 데이터에 대해 독립적으로 작업을 수행할 수 없습니다.
  - Data Class의 문제는 "비즈니스 로직이 있어야 할 곳에 데이터만 있는 경우"를 의미합니다.
    - 데이터 전송이나 값 표현이 목적이라면 데이터만 있어도 괜찮지만, 도메인 개념을 표현하는 객체라면 해당 데이터에 대한 행동도 함께 가져야 함을 의미합니다.
- 문제의 원인
  - 데이터 클래스는 객체지향 프로그래밍의 이점을 활용하지 못하고, 단순히 데이터를 전달하는 용도로만 사용됩니다.
	- 이러한 클래스들은 비즈니스 로직을 포함하지 않으며, 다른 클래스에 의존하여 작업을 수행합니다.

#### 6.5.1 해결 방법

- 클래스가 public 필드를 포함하고 있다면, 필드 캡슐화(Encapsulate Field)를 사용하여 직접 접근을 차단하고 getter와 setter를 통해서만 접근하도록 요구하세요.
  - 하지만 getter와 setter를 사용한다고 해서 진정한 캡술화를 달성한 것은 아닙니다.
  - 대신, Move Method를 사용하여 클래스에 비즈니스 로직을 추가하세요.
- 컬렉션(배열 등)에 저장된 데이터에 대해서는 컬렉션 캡슐화(Encapsulate Collection)를 사용하세요.
- 해당 클래스를 사용하는 클라이언트 코드를 검토하세요. 그 안에서 데이터 클래스 자체에 위치하는 것이 더 좋을 기능을 찾을 수 있을 것입니다. 
  - 이런 경우라면, 메서드 이동(Move Method)과 메서드 추출(Extract Method)을 사용하여 이 기능을 데이터 클래스로 마이그레이션하세요.
- 클래스가 잘 설계된 메서드들로 채워진 후에는, 클래스 데이터에 대해 지나치게 광범위한 접근을 제공하는 기존의 데이터 접근 메서드들을 제거하고 싶을 것입니다. 
  - 이를 위해 설정 메서드 제거(Remove Setting Method)와 메서드 숨기기(Hide Method)가 도움이 될 수 있습니다.

### 6.5 Speculative Generality (추측에 의한 일반화)

- **특징**: 미래에 필요할 것 같다는 추측으로 만든 불필요한 추상화입니다.
- **문제점**: YAGNI(You Aren't Gonna Need It) 원칙을 위반하며 불필요한 복잡성을 추가합니다.
- **해결방법**: Collapse Hierarchy, Inline Class, Remove Parameter 등을 통해 과도한 일반화를 제거합니다.
- **실무 예시**: 현재는 하나의 구현체만 있는데 미래 확장을 위해 만든 복잡한 인터페이스 계층입니다.

## 7. Couplers (결합자)

클래스 간의 과도한 결합을 나타내는 코드 스멜들입니다. 높은 결합도는 코드 변경을 어렵게 만들고 재사용성을 떨어뜨립니다.

### 7.1 Feature Envy (기능에 대한 욕심)

- 징후와 증상
  - 메서드가 자신의 데이터보다 다른 객체의 데이터에 더 많이 접근하는 경우입니다.
- 문제의 원인
  - 필드들이 데이터 클래스로 이동된 후에 발생할 수 있습니다. 
  - 이런 경우라면 해당 데이터를 사용하는 연산들도 함께 이 클래스로 이동시키는 것을 고려해야 합니다.

#### 7.1.1 해결 방법

- 기본 원칙으로, 함께 변경되는 것들은 같은 곳에 두어야 합니다. 
  - 일반적으로 데이터와 그 데이터를 사용하는 함수들은 함께 변경됩니다
- 메서드 전체가 다른 클래스 데이터만 사용하는 경우 Move Method를 사용하여 해당 클래스로 메서드를 이동시키세요.
- 메서드 일부분만 다른 클래스 데이터를 사용하는 경우 Extract Method를 사용하여 해당 부분을 별도의 메서드로 추출하고, 그 메서드를 호출하는 클래스로 이동시킵니다.

### 7.2 Inappropriate Intimacy (부적절한 친밀성)

- **특징**: 두 클래스가 서로의 private 영역에 과도하게 접근하는 경우입니다.
- **문제점**: 클래스 간의 결합도가 높아져 독립적인 변경이 어려워집니다.
- **해결방법**: Move Method, Move Field, Extract Class 등을 통해 결합도를 낮춥니다.
- **실무 예시**: Order와 OrderItem 클래스가 서로의 내부 구현에 과도하게 의존하는 경우입니다.

### 7.3 Message Chains (메시지 체인)

- **특징**: 클라이언트가 객체의 연쇄적인 호출을 통해 필요한 정보를 얻는 경우입니다.
- **문제점**: Law of Demeter를 위반하며, 중간 객체 구조 변경 시 클라이언트 코드도 수정해야 합니다.
- **해결방법**: Hide Delegate를 통해 중간 단계를 숨기거나 Extract Method로 체인을 캡슐화합니다.
- **실무 예시**: `customer.getAddress().getCity().getName()` 같은 긴 체인 호출입니다.

### 7.4 Middle Man (중개자)

- **특징**: 클래스가 단순히 다른 클래스로 작업을 위임하기만 하는 경우입니다.
- **문제점**: 불필요한 간접성을 추가하여 코드를 복잡하게 만듭니다.
- **해결방법**: Remove Middle Man을 통해 중개자를 제거하고 직접 통신하도록 합니다.
- **실무 예시**: Department 클래스가 Manager 클래스의 메서드를 그대로 위임만 하는 경우입니다.

## 참고

- https://refactoring.guru/refactoring/smells