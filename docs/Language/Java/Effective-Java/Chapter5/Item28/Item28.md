## 배열보다는 리스트를 사용하라



## 1 배열과 리스트의 차이점

* 배열과 리스트의 주요한 차이가 두 가지 있다



### 1.1 배열은 공변이다

#### 1.1.1 배열

- Sub가 Super의 하위 타입이라면 배열 Sub[]은 배열 Super[]의 하위 타입이 된다.
- 이를 공변(함께 변한다는 뜻)이라 한다



#### 1.1.2 제네릭

- 불공변(invariant)
- 서로 다른 타입 `Type1`과 `Type2`가 있을 때, `List<Type1>`은 `List<Type2>`의 하위 타입도 아니고, 상위 타입도 아니다.
- 위 개념만 봤을 때 제네릭에 문제가 있을수 있다고 생각할 수 있지만 문제가 있는 쪽은 배열이다.



#### 1.1.3 배열과 리스트 비교 예시

**배열 사용 예시**

* 문법상 허용되지만 런타임에 실패하는 코드
* Long이 Object의 하위 타입이면 Long[]은 Objectp[]의 하위 타입이 된다

```java
Object[]objectArray = new Long[1];
objectArray[0]="타입이 달리 넣을 수 없다."; // ArrayStoreException을 던진다.
```



**리스트 사용 예시**

* 문법에 맞지 않아 컴파일되지 않은 코드
* `List<Long>` 타입이 `List<Object>` 타입의 서브 타입이 아니기 때문
* [Generic.md](../../../Generic/Generic.md)의 Generic과 Subtype 참고

```java
List<Object> ol = new ArrayList<Long>(); // 호환되지 않는 타입이다.
ol.add("타입이 달라 넣을 수 없다.");
```



**결과**

* 어느 쪽이든 Long형 저장소에 String을 넣을 수 없다
* 그러나 배열을 사용하면 이 사실을 런타임에야 알게 되지만 리스트를 사용하면 컴파일 시점에 바로 알 수 있다



### 1.2 배열은 실체화가 된다

* 배열은 런타임에도 자신이 담기로 한 원소의 타입을 인지하고 확인한다.
* Long 배열에 String을 넣으려 하면 ArrayStoreException이 발생한다.
* 반면, 제네릭은 타입 정보가 런타임에는 소거(erasure)된다.
* 소거(erasure)
  - 원소 타입을 컴파일타임에만 검사하며, 런타임에는 알 수 조차 없다.
  - 제네릭이 지원되기 전의 레거시 코드와 제네릭 타입을 함께 사용할 수 있게 해주는 메커니즘
  - 자바 5가 제네릭으로 순조롭게 전환될 수 있도록 해줬다.



## 2 배열과 제네릭의 부조화

- 배열은 제네릭 타입, 매개변수화 타입, 타입 매개변수로 사용할 수 없다.
  - 즉, 코드를 new List[], new List[], new E[] 식으로 작성하면 컴파일할 때 제네릭 배열 생성 오류를 일으킨다.
- 제네릭 배열을 만들지 못하게 막은 이유는 무엇일까?
  - 타입 안전하지 않기 때문이다.
  - 이를 허용하게 되는 경우 컴파일러가 자동 생성한 형변환 코드에서 런타임에 ClassCastException이 발생할 수 있다.
  - 런타임에 ClassCastException이 발생하는 일을 막아주겠다는 제네릭 타입 시스템의 취지에 어긋난다.



참고

* [이펙티브 자바 3/E](http://www.kyobobook.co.kr/product/detailViewKor.laf?mallGb=KOR&ejkGb=KOR&barcode=9788966262281)