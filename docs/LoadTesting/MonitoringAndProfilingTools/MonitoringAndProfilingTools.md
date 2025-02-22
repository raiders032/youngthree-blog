---
title: "Monitoring And Profiling Tools"
description: "부하 테스트를 진행하면서 효과적으로 시스템을 모니터링하고 프로파일링하는 방법을 알아봅니다. Throughput과 Latency 분석부터 AWS CloudWatch를 활용한 실시간 모니터링까지, 실전적인 시스템 분석 방법을 다룹니다."
tags: [ "MONITORING", "AWS", "PERFORMANCE_TEST", "PROFILING", "DEVOPS", "SYSTEM_ADMIN" ]
keywords: [ "부하 테스트", "시스템 모니터링", "프로파일링", "성능 테스트", "throughput", "latency", "top", "netstat", "CloudWatch", "시스템 성능", "성능 분석", "모니터링 도구" ]
draft: false
hide_title: true
---

## 1. 모니터링 도구와 프로파일링 도구

- 부하 테스트를 실행할 때는 Throughput 모니터링 도구와 시각화 도구가 필수적입니다.
- 그러나 프로파일링 도구를 활용하면 부하 테스트를 하게 되면 프로파일링 도구의 응답 시간에 영향을 주어 시스템의 실제 성능을 왜곡할 수 있습니다.
- 이러한 문제를 해결하기 위해 다음과 같은 접근 방식이 필요합니다.

### 1.1 주요 모니터링 도구

시스템 모니터링을 위한 핵심 도구들:

- top 명령어와 netstat 명령어
- AWS 관리 콘솔
- Xhprof
- New Relic

## 2. 리소스 모니터링을 위한 top 명령어

### 2.1 top 명령어 기본 사용법

- 시스템을 실시간으로 모니터링하기 위한 가장 기본적인 도구인 top 명령어는 시스템 전체와 프로세스별 CPU와 메모리 사용량 등을 볼 수 있어 부하 테스트 시에 유용하게 사용됩니다.

```bash
$ top
top - 03:17:50 up 197 days, 18:54, 1 user, load average: 0.00, 0.00, 0.00
Tasks: 234 total, 1 running, 233 sleeping, 0 stopped, 0 zombie
Cpu(s): 0.2%us, 0.2%sy, 0.0%ni, 99.7%id, 0.0%wa, 0.0%hi, 0.0%si, 0.0%st
Mem: 4049868k total, 2470912k used, 1578956k free, 104832k buffers
```

### 2.2 CPU 사용률 분석

- **사용자 프로세스 CPU 사용률(us)**: 0.2%us는 '사용자 프로세스 CPU 사용률(0.2%)'을 의미
- **시스템 프로세스 CPU 사용률(sy)**: 0.2%sy는 '시스템 프로세스 CPU 사용률(0.2%)'을 의미
- **유휴 CPU 비율(id)**: 시스템의 여유 자원을 나타냄

:::info
사용자 프로세스 CPU 사용률은 미들웨어나 애플리케이션 프로그램에 사용되는 CPU 사용률을 의미합니다. 부하 테스트 중 이 수치가 높을 때는 CPU를 애플리케이션에서 
사용하고 있는 비율이 높은 것으로 일반적으로 좋은 의미라고 볼 수 있다. 반대로 시스템 프로세스 CPU 사용률이 높은 경우 파일이나 네트워크 입출력 등에 CPU가 사용되고 있는 것으로 볼 수 있다.
:::

### 2.3 메모리 사용량 모니터링

- **전체 메모리**: 4049868k total
- **사용 중인 메모리**: 2470912k used
- **가용 메모리**: 1578956k free
- **버퍼/캐시**: 시스템 성능 향상을 위한 버퍼와 캐시 메모리

## 3. 네트워크 모니터링을 위한 netstat

### 3.1 netstat 명령어 활용

- netstat 명령어는 TCP 등 네트워크 통신 상태를 볼 수 있는 핵심 도구입니다.
- 웹 시스템이 고부하 상태일 때는 TCP/IP 통신 부분이 병목 구간인 경우가 많아 이를 확인하는 것이 중요합니다.

```bash
$ netstat -nato
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address    Foreign Address    State    Timer
tcp   0      0      0.0.0.0:22      0.0.0.0:*         LISTEN   off (0.00/0/0)
tcp   0      224    10.0.0.40:22    153.156.43.25:63515 ESTABLISHED on
```

### 3.2 TCP 연결 상태 분석

- 부하 테스트 시에 확인할 주요 상태:
- ESTABLISHED: 현재 연결된 상태
- TIME_WAIT: TCP 연결 종료 대기 상태
- LISTEN: 연결 요청 대기 상태
- 여기서 가장 중요한 상태는 TIME_WAIT 상태입니다. 이 상태가 많아지면 TCP 포트가 부족하여 새로운 연결을 받지 못하는 상황이 발생할 수 있습니다.

### 3.3 리눅스 설정 법

- `net.ipv4.tcp_tw_reuse`
  - TIME_WAIT 상태의 포트를 재사용할 수 있도록 설정합니다.
  - 해당 값을 1로 설정하면 TIME_WAIT 상태의 포트를 재사용할 수 있습니다.
- `net.ipv4.tcp_fin_timeout`
  - FIM_WAIT_2 상태의 타임아웃을 설정합니다.
  - 기본값은 60초이며, 이 값을 줄이면 부하가 많을 때 도움이 됩니다.
  - 그러나 너무 짧게 하면 문제가 발생할 수 있어 10~30초 정도로 설정하는 것이 좋습니다.