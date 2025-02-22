---
title: "k6 메트릭스 완벽 가이드: 표준부터 프로토콜별 메트릭스까지"
description: "k6의 모든 내장 메트릭스를 상세히 설명합니다. 표준 메트릭스, HTTP, 브라우저, WebSocket, gRPC 등 프로토콜별 메트릭스의 의미와 활용법을 자세히 다룹니다. 성능 테스트를 시작하는 개발자부터 전문가까지 참고할 수 있는 완벽한 가이드입니다."
tags: ["K6", "PERFORMANCE_TEST", "LOAD_TEST", "METRICS", "MONITORING", "DEVOPS", "TESTING", "WEBSOCKET", "GRPC"]
keywords: ["k6", "케이식스", "성능 테스트", "performance test", "부하 테스트", "load test", "메트릭스", "metrics", "모니터링", "monitoring", "데브옵스", "devops", "테스팅", "testing", "웹소켓", "websocket", "grpc", "브라우저", "browser"]
draft: false
hide_title: true
---

## 1. k6 메트릭스 개요

- k6는 모든 테스트에서 내장 메트릭스와 커스텀 메트릭스를 생성합니다. 
- 각 지원되는 프로토콜마다 고유한 메트릭스가 있으며, 이를 통해 다양한 측면의 성능을 측정할 수 있습니다.

## 2. 표준 내장 메트릭스

- k6는 사용하는 프로토콜과 관계없이 항상 다음 메트릭스들을 수집합니다.

### 2.1 체크 및 데이터 관련 메트릭스

- `checks`
	- 유형: Rate
	- 설명: 성공한 체크의 비율
	- 활용: 테스트 조건의 충족 여부 확인
- `data_received`
	- 유형: Counter
	- 설명: 수신된 데이터의 총량
	- 활용: 개별 URL별 데이터 추적 가능
- `data_sent`
	- 유형: Counter
	- 설명: 전송된 데이터의 총량
	- 활용: 개별 URL별 데이터 추적 가능

### 2.2 실행 관련 메트릭스

- `dropped_iterations`
	- 유형: Counter
	- 설명: 시작되지 못한 반복 횟수
	- 원인: VU 부족(arrival-rate executors) 또는 시간 부족(iteration-based executors의 maxDuration 만료)
- `iteration_duration`
	- 유형: Trend
	- 설명: 설정과 정리 시간을 포함한 전체 반복 완료 시간
	- 참고: 특정 시나리오의 반복 함수 지속 시간 계산 가능
- `iterations`
	- 유형: Counter
	- 설명: VU가 JS 스크립트(기본 함수)를 실행한 총 횟수

### 2.3 VU 관련 메트릭스

- `vus`
	- 유형: Gauge
	- 설명: 현재 활성화된 가상 사용자 수
- `vus_max`
	- 유형: Gauge
	- 설명: 최대 가상 사용자 수
	- 참고: 부하 확장 시 성능 영향을 피하기 위해 VU 리소스가 미리 할당됨

## 3. HTTP 관련 메트릭스

HTTP 요청이 포함된 테스트에서만 생성되는 메트릭스들입니다.

:::info
모든 http_req_* 메트릭스의 타임스탬프는 요청 종료 시점에 기록됩니다. 즉, k6가 응답 본문의 끝을 수신하거나 요청이 타임아웃될 때 타임스탬프가 생성됩니다.
:::

### 3.1 요청/응답 관련 메트릭스

- `http_req_duration`
	- 유형: Trend
	- 설명: 요청의 총 소요 시간
	- 계산: http_req_sending + http_req_waiting + http_req_receiving의 합계
	- 참고: DNS 조회와 연결 시간은 제외됨
- `http_req_sending`
	- 유형: Trend
	- 설명: 원격 호스트로 데이터를 전송하는 데 걸린 시간
- `http_req_receiving`
	- 유형: Trend
	- 설명: 원격 호스트로부터 응답 데이터를 수신하는 데 걸린 시간
- `http_req_waiting`
	- 유형: Trend
	- 설명: 원격 호스트로부터 응답을 기다리는 시간(TTFB, Time To First Byte)

### 3.2 연결 관련 메트릭스

- `http_req_blocked`
	- 유형: Trend
	- 설명: 요청을 시작하기 전에 사용 가능한 TCP 연결 슬롯을 기다리는 시간
- `http_req_connecting`
	- 유형: Trend
	- 설명: 원격 호스트와 TCP 연결을 수립하는 데 걸린 시간
- `http_req_tls_handshaking`
	- 유형: Trend
	- 설명: 원격 호스트와 TLS 세션 핸드셰이크에 소요된 시간

### 3.3 기타 HTTP 메트릭스

- `http_req_failed`
	- 유형: Rate
	- 설명: setResponseCallback에 따른 실패한 요청의 비율
- `http_reqs`
	- 유형: Counter
	- 설명: k6가 생성한 총 HTTP 요청 수

## 4. 브라우저 메트릭스

k6 브라우저 모듈은 Core Web Vitals를 기반으로 메트릭스를 생성합니다.

### 4.1 핵심 Web Vitals

- `browser_web_vital_cls`
	- 설명: 페이지의 시각적 안정성을 측정
	- 측정 방식: 보이는 페이지 콘텐츠의 예기치 않은 레이아웃 이동량을 수치화
	- 참고: Cumulative Layout Shift 관련 상세 정보 제공
- `browser_web_vital_fid`
	- 설명: 웹 페이지의 반응성을 측정
	- 측정 방식: 사용자의 첫 상호작용(예: 버튼 클릭)과 브라우저 응답 사이의 지연 시간을 수치화
	- 참고: First Input Delay 관련 상세 정보 제공
- `browser_web_vital_lcp`
	- 설명: 가장 큰 콘텐츠 요소가 보이기까지의 시간을 측정
	- 참고: Largest Contentful Paint 관련 상세 정보 제공

### 4.2 기타 Web Vitals

- `browser_web_vital_fcp`
	- 설명: 브라우저가 페이지의 첫 번째 DOM 요소(텍스트, 이미지, 헤더 등)를 렌더링하는 데 걸리는 시간을 측정
	- 참고: First Contentful Paint 관련 상세 정보 제공
- `browser_web_vital_inp`
	- 설명: 페이지의 반응성을 측정하는 실험적 메트릭
	- 참고: Interaction to Next Paint 관련 상세 정보 제공
- `browser_web_vital_ttfb`
	- 설명: 브라우저 요청과 서버 응답 시작 사이의 시간을 측정
	- 참고: Time to First Byte 관련 상세 정보 제공

## 5. WebSocket 메트릭스

WebSocket 서비스와의 상호작용 시 생성되는 메트릭스입니다. 실험적 또는 레거시 websockets API를 통해 측정됩니다.

### 5.1 연결 관련 메트릭스

- `ws_connecting`
	- 유형: Trend
	- 설명: WebSocket 연결 요청의 총 소요 시간
- `ws_session_duration`
	- 유형: Trend
	- 설명: WebSocket 세션의 지속 시간
	- 측정: 연결 시작부터 VU 실행 종료까지의 시간

### 5.2 메시지 및 세션 관련 메트릭스

- `ws_msgs_received`
	- 유형: Counter
	- 설명: 수신된 총 메시지 수
- `ws_msgs_sent`
	- 유형: Counter
	- 설명: 전송된 총 메시지 수
- `ws_ping`
	- 유형: Trend
	- 설명: ping 요청과 pong 수신 사이의 지속 시간
- `ws_sessions`
	- 유형: Counter
	- 설명: 시작된 총 WebSocket 세션 수

## 6. gRPC 메트릭스

gRPC API를 통한 서비스 상호작용 시 생성되는 메트릭스입니다.

:::note
스트림 관련 메트릭스(grpc_streams*)는 k6 버전 0.49.0 이상 또는 k6/experimental/grpc 모듈(버전 0.45.0 이상)에서만 사용 가능합니다.
:::

### 6.1 요청 관련 메트릭스

- `grpc_req_duration`
	- 유형: Trend
	- 설명: 원격 호스트로부터 응답을 받는 데 걸리는 시간

### 6.2 스트림 관련 메트릭스

- `grpc_streams`
	- 유형: Counter
	- 설명: 시작된 총 스트림 수
- `grpc_streams_msgs_received`
	- 유형: Counter
	- 설명: 수신된 총 메시지 수
- `grpc_streams_msgs_sent`
	- 유형: Counter
	- 설명: 전송된 총 메시지 수