## 1 Optimization



## 2 성능 지표



### 2.1 처리율

- `일정 시간동안 완료한 작업 단위 수`로 표시한다.
- 예) 초당 처리 가능한 트랜잭션 수
- 처리율이 실제 성능을 반영하는 의미 있는 지표가 되려면 수치를 얻은 기준 플랫폼에 대해 기술해야 한다.
  - 하드웨어 스펙, OS, 소프트웨어 스택, 시스템이 단일 서버인지 클러스터인지 등
- 트랜잭션과 워크로드는 테스트할 때 마다 동일해야 한다.
  - 워크로드: 시스템이 주어진 시간 내에 처리해야 할 작업 할당량



### 2.2 지연

- `하나의 트랜잭션을 처리할 때 까지 소요된 시간`입니다.
- 지연을 종단 시간이라고도 한다



### 2.3 용량

- 시스템이 보유한 작업 병렬성의 총량을 의미한다
- 즉 `시스템이 동시 처리 가능한 작업 단위(트랜잭션)의 개수`를 말한다



### 2.4 사용률

- 성능 분석 업무중 가장 흔한 태스 시스템 리소르를 효율적으로 활용하는 것
- 사용률은 워크로드에 따라서 리소스별 들쑥날쑥할 수 있다
- 계산 집약적 워크로드(그래픽 처리, 암호화)를 주면 CPU 사용률은 100%에 육박하지만 메모리 사용률은 얼마 나오지 않는다



### 2.5 효율

- `처리율을 리소스 사용률로 나눈 값`으로 측정



### 2.6 확장성

- 처리율이나 시스템의 용량은 처리하는데 사용할 수 있는 리소스에 달려있다
- `리소스 추가에 따른 처리율 변화`는 시스템의 확장성을 가늠하는 척도다
- 확장성은 궁극적으로 정확히 리소스를 투입한 만큼 처리율이 변경되는 형태를 지향한다.
  - 클러스터를 2배 확장해 트랜잭션 처리량도 2배가 느는 것을 지향함
- 그러나 현실적으로 선형 확장을 달성하기란 매우 어렵다



### 2.7 저하

- 요청 또는 클라이언트가 증가하건 요청 접수 속도가 증가하건 어떤 형태로든 시스템이 더 많은 부하를 받으면 지연 또는 처리율 측정값에 변화가 생긴다
- 이 변화는 사용률에 따라 다르다. 시스템을 덜 사용하고 있으면 측정값이 느슨하게 변하고 시스템이 풀 가동된 상태면 처리율이 더 늘어나지 않는(즉 지연이 증가하는) 양상을 띤다
- 이런 현상을 부하 증가에 따른 저하라고 한다.