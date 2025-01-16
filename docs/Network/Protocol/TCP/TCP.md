---
title: "TCP"
description: "TCP(Transmission Control Protocol)의 핵심 개념과 동작 원리를 상세히 알아봅니다. 시퀀스 번호, ACK, 윈도우 사이즈, 3방향 핸드셰이크, 상태 전이 등 TCP의 주요 메커니즘을 실제 예제와 함께 설명합니다."
tags: [ "TCP", "NETWORK", "PROTOCOL", "COMPUTER_SCIENCE", "WEB" ]
keywords: [ "TCP", "TCP/IP", "전송제어프로토콜", "네트워크", "프로토콜", "3방향 핸드셰이크", "three-way handshake", "시퀀스넘버", "sequence number", "윈도우사이즈", "window size", "네트워크프로토콜", "컴퓨터통신", "상태전이", "state transition" ]
draft: false
hide_title: true
---

## 1. TCP 프로토콜 개요

- TCP(Transmission Control Protocol)는 신뢰할 수 없는 공용망에서도 정보 유실 없는 통신을 보장하는 핵심 프로토콜입니다.
- TCP/IP 프로토콜 스택의 전송 계층(Transport Layer)에 위치하며, 다음과 같은 특징을 가집니다.
    - 세션을 안전하게 연결하고 데이터를 분할하여 전송
    - 세그먼트에 번호를 부여하고 전송 확인을 통한 신뢰성 보장
    - 수신자의 처리 능력을 고려한 전송 크기 조절
    - 흐름 제어와 혼잡 제어를 통한 안정적인 통신

:::info[계층별 프로토콜과 데이터 단위]

- 응용 계층 (Application Layer): 메시지 (Message)
    - HTTP, FTP, SMTP 등
- 전송 계층 (Transport Layer): 세그먼트 (Segment)
    - TCP, UDP
- 인터넷 계층 (Internet Layer): 패킷 (Packet)
    - IP, ICMP, ARP
- 네트워크 액세스 계층 (Network Access Layer): 프레임 (Frame)
    - 이더넷, Wi-Fi
      :::

## 2. TCP 세그먼트 헤더 구조

![image-20220722095949416.png](images/image-20220722095949416.png)

- TCP 헤더는 데이터 전송에 필요한 다양한 제어 정보를 포함합니다:

### 2.1 기본 헤더 필드

- **Source Port (16비트)**: 출발지 포트 번호
- **Destination Port (16비트)**: 목적지 포트 번호
- **Sequence Number (32비트)**: 전송하는 데이터의 순서 번호
- **Acknowledgment Number (32비트)**: 다음에 받기를 기대하는 시퀀스 번호
- **Offset (4비트)**: TCP 헤더의 길이(32비트 워드 단위)
- **Window Size (16비트)**: 수신자가 받을 수 있는 데이터의 크기

### 2.2 제어 플래그 (Control Flags)

- **SYN**: 연결 시작을 나타내며, 초기 연결 설정 시 1로 설정
- **ACK**: 응답 번호가 유효함을 나타내며, 초기 SYN을 제외한 모든 세그먼트에서 1로 설정
- **FIN**: 정상적인 연결 종료를 요청할 때 사용
- **RST**: 비정상적인 상황에서 연결을 강제 종료할 때 사용
- **URG**: 긴급 데이터가 포함되어 있음을 표시
- **PSH**: 수신 즉시 응용 프로그램으로 데이터 전달을 요청

## 3. TCP 연결 관리

![img.png](images/img.png)

- TCP 연결은 신중하게 관리되는 상태 기계(State Machine)를 통해 이루어집니다.
- 각 연결은 여러 상태를 거치며, 이를 상태 전이(State Transition)라고 합니다.

## 4. 연결 설정 과정 (3-way Handshake)

### 4.1 시작하기 전 상태

- **서버**: 
  - 처음에는 CLOSED 상태
  - `socket()` 함수 호출로 소켓 생성
  - `bind()` 함수로 포트 번호 할당
  - `listen()` 함수 호출로 `LISTEN` 상태로 전환
  - 이제 서버는 클라이언트의 연결 요청을 받을 준비 완료

#### 4.2 way Handshake 연결 과정 상세 설명

![img.png](images/img2.png)

##### Step 1: 클라이언트의 연결 요청

- **클라이언트 동작**:
    - CLOSED → SYN_SENT로 상태 변경
    - SYN 세그먼트 생성 및 전송
- **서버 동작**:
    - LISTEN 상태에서 SYN 세그먼트 수신
    - 클라이언트의 ISN(100) 저장

**전송되는 세그먼트 구조**

```
TCP 세그먼트 구조:
- Source Port: 12345 (임의의 포트)
- Destination Port: 80 (서버 포트)
- Sequence Number: 100 (임의의 ISN)
- ACK Number: 0
- Flags: SYN=1, ACK=0
- Window Size: 8192 (예시)
```

##### Step 2: 서버의 응답

- 서버 동작:
  - LISTEN 상태에서 SYN 세그먼트 수신
  - LISTEN → SYN_RECEIVED로 상태 변경
  - SYN+ACK 세그먼트 생성 및 전송

**전송되는 세그먼트**

```
TCP 세그먼트 구조:
- Source Port: 80
- Destination Port: 12345
- Sequence Number: 300 (서버의 ISN)
- ACK Number: 101 (클라이언트 ISN + 1)
- Flags: SYN=1, ACK=1
- Window Size: 65535 (예시)
```

##### Step 3: 클라이언트의 최종 확인

- 클라이언트 동작:
    - SYN_SENT 상태에서 ACK 세그먼트 수신
    - SYN_SENT → ESTABLISHED로 상태 변경
    - ACK 세그먼트 생성 및 전송
- 서버 동작:
    - SYN_RECEIVED 상태에서 ACK 세그먼트 수신
    - SYN_RECEIVED → ESTABLISHED로 상태 변경
- 양방향 데이터 통신 준비 완료

**전송되는 세그먼트**

```
TCP 세그먼트 구조:
- Source Port: 12345
- Destination Port: 80
- Sequence Number: 101
- ACK Number: 301 (서버 ISN + 1)
- Flags: ACK=1
- Window Size: 8192
```

:::info[시퀀스 번호와 데이터 길이]
TCP에서 시퀀스 번호는 바이트 스트림의 위치를 나타냅니다:

- 다음 ACK 번호 = 현재 시퀀스 번호 + 데이터 길이
- SYN과 FIN 플래그는 시퀀스 공간에서 1바이트를 차지
- 예: 시퀀스 번호 1000으로 100바이트 데이터 전송 시
- 다음 ACK 번호는 1100 (1000 + 100)
  :::

### 4.2 시퀀스 번호(ISN)가 중요한 이유

- 연결의 신뢰성 보장
- 이전 연결과의 구분
- 패킷 순서 보장
- 재전송 메커니즘 지원

:::warning[연결 설정의 중요성]
3방향 핸드셰이크는 다음과 같은 중요한 목적을 가집니다:

- 양쪽 모두 송수신이 가능한 상태인지 확인
- 초기 시퀀스 번호 동기화
- 연결 파라미터(윈도우 크기 등) 협상
  :::

## 5 데이터 전송 단계

### 5.1 ESTABLISHED 상태에서의 동작

- 양방향 데이터 전송 가능 (Full Duplex)
- 각 패킷마다 시퀀스 번호 부여
- 수신측은 받은 패킷에 대해 ACK 응답
- 예시:

```
클라이언트 → 서버: SEQ=102, 데이터 크기=100
서버 → 클라이언트: ACK=202 (102 + 100)
```

## 6. 연결 종료 과정 (4-way Handshake)

### 6.1 첫 번째 단계: Active Close 시작

- **Active Close 측 동작**
    - ESTABLISHED → FIN_WAIT_1 상태로 전환
    - FIN 패킷 전송
    - "더 이상 보낼 데이터가 없음"을 알림

- **Passive Close 측 동작**
    - ESTABLISHED → CLOSE_WAIT 상태로 전환
    - ACK 패킷으로 FIN 수신 확인
    - 아직 보낼 데이터가 있을 수 있음

### 6.2 두 번째 단계: Passive Close의 데이터 전송

- **Active Close 측**
    - FIN_WAIT_1 → FIN_WAIT_2 상태로 전환
    - ACK 수신 후 상태 변경
    - 여전히 데이터를 받을 수 있음

- **Passive Close 측**
    - CLOSE_WAIT 상태 유지
    - 남은 데이터 전송 완료
    - 응용 프로그램의 close() 호출 대기

### 6.3 세 번째 단계: Passive Close 종료

- **Passive Close 측**
    - CLOSE_WAIT → LAST_ACK 상태로 전환
    - FIN 패킷 전송
    - "모든 데이터 전송 완료"를 알림

- **Active Close 측**
    - FIN_WAIT_2 → TIME_WAIT 상태로 전환
    - ACK 패킷 전송

### 6.4 마지막 단계: 연결 종료 완료

- **Passive Close 측**
    - LAST_ACK → CLOSED 상태로 전환
    - 연결 즉시 종료

- **Active Close 측**
    - TIME_WAIT 상태에서 대기 (2MSL 시간 동안)
    - 이후 CLOSED 상태로 전환

### 6.5 TIME_WAIT의 중요성

#### 6.5.1 목적

- 지연된 패킷 처리를 위한 대기
- 이전 연결의 패킷이 새로운 연결에 영향을 주는 것을 방지
- 신뢰성 있는 연결 종료 보장
- 일반적으로 2MSL(Maximum Segment Lifetime) 시간 동안 유지

#### 6.5.2 실제 영향

- 서버 측에서 주로 발생
    - 클라이언트의 연결 종료 요청에 대한 응답으로 발생
    - 포트 재사용에 제한이 생길 수 있음
- 성능 고려사항
    - 많은 클라이언트 연결이 있는 서버의 경우 영향
    - TIME_WAIT 상태의 소켓이 리소스를 점유
    - SO_REUSEADDR 소켓 옵션으로 일부 해결 가능

### 6.6 종료 과정의 예외 상황

#### 6.6.1 동시 종료 (Simultaneous Close)

- 양쪽이 동시에 FIN을 보내는 경우
- 각자 FIN_WAIT_1 상태에서 시작
- 정상적으로 종료 가능

#### 6.6.2 비정상 종료

- RST(Reset) 패킷 사용
    - 즉시 연결 종료
    - TIME_WAIT 상태 없이 종료
    - 데이터 유실 가능성 있음

:::warning[주의사항]
TIME_WAIT 상태를 임의로 줄이거나 우회하는 것은 권장되지 않습니다. 네트워크의 신뢰성과 안정성을 위한 중요한 메커니즘입니다.
:::

## 7. TCP vs UDP 비교

- TCP와 UDP는 전송 계층의 대표적인 프로토콜로, 각각 다른 특성과 용도를 가집니다:

| 특성    | TCP                          | UDP                   |
|-------|------------------------------|-----------------------|
| 연결 방식 | 연결 지향적 (Connection-oriented) | 비연결형 (Connectionless) |
| 신뢰성   | 높음 (오류 제어 수행)                | 낮음 (오류 제어 없음)         |
| 전송 순서 | 보장                           | 보장하지 않음               |
| 전송 방식 | 유니캐스트                        | 유니캐스트, 멀티캐스트, 브로드캐스트  |
| 주요 용도 | 신뢰성이 필요한 데이터 전송              | 실시간 스트리밍, 게임 등        |

:::info[선택 기준]

- TCP: 데이터의 정확한 전달이 중요한 경우 (웹, 이메일, 파일 전송)
- UDP: 실시간성이 중요한 경우 (음성/영상 스트리밍, 온라인 게임)
  :::

## 8. 결론

- TCP는 복잡한 제어 메커니즘을 통해 신뢰성 있는 데이터 전송을 보장합니다.
- 3방향 핸드셰이크, 시퀀스 번호 관리, 윈도우 크기 조절 등의 특징은 현대 인터넷 통신의 근간을 이루고 있으며, 특히 데이터의 정확한 전달이 중요한 애플리케이션에서 필수적인 프로토콜입니다.
- 상태 전이를 통한 체계적인 연결 관리는 TCP의 신뢰성과 안정성을 보장하는 핵심 메커니즘입니다.