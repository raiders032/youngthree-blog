## 1 Hash Table

* Hash Table은 키와 값을 쌍으로 저장할 수 있는 자료구조
* 해시 테이블의 가장 큰 특징은 대부분의 연산이 분할 상환 분석에 따른 시간 복잡도가 O(1)이라는 점이다
* 덕분에 데이터의 양에 관계 없이 빠른 성능을 기대할 수 있다



### 1.1 Hash Function

* 해시 함수란 임의 크기 데이터를 고정 크기 값으로 매핑하는데 사용할 수 있는 함수를 말한다
* 해시 테이블의 핵심은 해시 함수다
* 해시 테이블을 인덱싱하기위해 해시 함수를 사용하는 것을 해싱(Hashing)이라 한다



**좋은 해시 함수의 특징**

* 해시 함수 값 충돌의 최소화
* 쉽고 빠른 연산
* 해시 테이블 전체에 해시 값이 균일하게 분포
* 사용할 키의 모든 정보를 이용하여 해싱



### 1.2 충돌

* 여러개의 키를 해시 함수를 통해 해시 값으로 변경할 때 해시 값이 중복될 수 있는데 이를 `충돌`이라고 한다.
* 서로 다른 두 개의 해시 값이 같은 인덱스를 가리키는 경우도 `충돌`이라고 한다.
* 비둘기집 원리에 따라 키의 수가 해시 테이블의 크기보다 크다면 반드시 충돌이 일어날 것이다



> **비둘기집 원리**
>
> n개의 아이템을 m개의 컨테이너에 넣을 때, n > m 이라면 적어도 하나의 컨테이너에는 반드시 2개 이상의 아이템이 들어 있다는 원리를 말한다



## 2 Hash Table의 구현

* 충돌 발생을 어떻게 처리하는지에 따라 개별 체이닝, 오픈 어드레싱 방식으로 구분된다



### 2.1 개별 체이닝

* 해시 테이블의 기본 방식으로 충돌 발생 시 연결 리스트로 연결하는 방식을 사용한다
* 대부분의 탐색은 O(1)이지만 최악의 경우 O(n)이 될 수 있다.
  * 최악의 경우: 모든 경우의 해시 값이 중복되어 충돌이 발생한 경우
* 자바 8에서는 데이터의 개수가 많아지면 레드-블랙 트리에 저장하는 형태로 병행해 사용하기도 했다.



**동작 방식**

1. 키의 해시 값을 계산한다
2. 해시 값을 이용해 배열의 인덱스를 구한다
3. 같은 인덱스가 있다면 연결 리스트로 연결한다



### 2.2 오픈 어드레싱

* 충돌 발생 시 탐사를 통해 빈공간을 찾아 빈 공간에 키 밸류를 저장하는 방식
* 값을 무한정 저장할 수 있는 체이닝 방식과 달리 오픈 어드레싱 방식은 전체 해시 테이블의 크기 이상의 데이터를 저장할 수 없다
  * 해시 테이블의 크기가 n이면 n개의 데이터만 저장 가능
  * 따라서 버킷 사이즈 보다 데이터의 수가 큰 경우 더 큰 크기의 다른 버킷을 생성한 후 복사하는 리해싱 작업이 필요하다



**선형 탐사**

* 오픈 어드레싱 방식중 가장 간단한 방식
* 충돌이 발생할 경우 해당 위치부터 순차적으로 탐사를 진행하고 비어있는 공간에 데이터를 삽입한다
* 구현이 간단하고 의외로 전체적인 성능이 좋은편이다
* 그러나 데이터들이 고르게 분포되지 않고 뭉치는 현상인 **클러스터링**이 발생할 수 있다
  * 이로인해 탐사 시간이 증가하고 전체적인 효율이 떨어진다

참고

* 파이썬 알고리즘 인터뷰(박상길 저)