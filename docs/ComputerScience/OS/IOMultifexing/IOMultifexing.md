---
title: "I/O Multiplexing"
description: "다중 입출력을 처리하기 위한 I/O 멀티플렉싱의 다양한 방식과 각각의 특징을 설명합니다. select, poll, epoll 함수들의 동작 원리와 활용 방법을 코드 예제와 함께 자세히 다룹니다."
tags: [ "SELECT", "POLL", "EPOLL", "MULTIPLEXING", "IO", "OPERATING_SYSTEM", "LINUX", "NETWORK_PROGRAMMING" ]
keywords: [ "멀티플렉싱", "IO 멀티플렉싱", "셀렉트", "폴", "이폴", "시스템콜", "파일 디스크립터", "fd", "소켓 프로그래밍", "이벤트 기반", "논블로킹", "레벨 트리거", "에지 트리거", "서버 프로그래밍", "고성능", "동시성" ]
draft: false
hide_title: true
---

## 1. I/O 멀티플렉싱 개요

- 커널에서는 하나의 스레드가 여러 개의 소켓(파일)을 핸들링할 수 있는 select, poll, epoll, io_uring과 같은 시스템 콜을 제공합니다.
- 멀티플렉싱 모델에서는 select 함수를 호출해서 여러 개의 소켓 중 read 함수 호출이 가능한 소켓이 생길 때까지 대기합니다.

### 1.1 동작 방식

![multiplexing-io](images/img_2.png)

- select 시스템 콜 단계
	- 애플리케이션이 select 시스템 콜을 호출
	- 커널이 "no data ready" 상태 확인
	- 커널이 데이터가 준비될 때까지 대기
	- 데이터가 준비되면 "return readable" 신호를 애플리케이션에 전달
- read 시스템 콜 단계
	- 애플리케이션이 read 시스템 콜 호출
	- 커널이 데이터를 복사 (copy data)
	- 데이터 복사가 완료되면 "return OK" 신호 전달
	- 애플리케이션이 복사된 데이터 처리 시작

### 1.2 File Descriptor

- 유닉스/리눅스 시스템에서 파일이나 소켓 같은 I/O 리소스를 식별하는 정수값입니다.
- 모든 I/O 리소스는 파일 디스크립터로 식별되며, 파일 디스크립터를 통해 I/O 작업을 수행합니다.
- [File Descriptor](../../../Linux/FileDescriptor/FileDescriptor.md) 참고

## 2. select 함수

```c
int select(int nfds, fd_set *readfds, fd_set *writefds, fd_set *exceptfds, struct timeval *timeout);
```

- [레퍼런스](https://man7.org/linux/man-pages/man2/select.2.html)

### 2.1 매개변수 설명

- nfds
	- 감시할 파일 디스크립터 중 가장 큰 번호 + 1
	- 예: fd 3, 5, 7을 감시한다면 nfds는 8
- readfds
	- 읽기가 가능한지 감시할 파일 디스크립터들의 집합
	- 읽기 가능 = 블로킹 없이 읽을 수 있는 상태
	- select() 반환 후에는 이벤트가 발생한 fd는 1, 발생하지 않은 fd는 0으로 설정됨
- writefds
	- 쓰기가 가능한지 감시할 파일 디스크립터들의 집합
	- 쓰기 가능 = 블로킹 없이 쓸 수 있는 상태
	- 주의: 대용량 쓰기는 여전히 블로킹될 수 있음
	- select() 호출이 끝나면 쓰기 가능한 fd는 1, 불가능한 fd는 0으로 설정됨
- exceptfds
	- 예외 상황을 감시할 파일 디스크립터들의 집합
	- 긴급 데이터 도착 등의 특별한 상황 감지
- timeout
	- NULL: 무한정 대기
	- {0, 0}: 즉시 반환 (폴링)
	- 지정값: 해당 시간만큼 대기

### 2.2 fd_set 구조체와 매크로

- fd_set은 파일 디스크립터의 집합을 나타내는 구조체입니다.
- POSIX 표준에 따르면 fd_set 구조체가 처리할 수 있는 최대 파일 디스크립터 수는 FD_SETSIZE 매크로로 정의됩니다.
- 대부분의 시스템에서 FD_SETSIZE은 1024로 정의되어 있습니다.

#### 2.2.1 fd_set을 조작하기 위한 주요 매크로:

- FD_ZERO(fd_set *set)
	- fd_set을 초기화하여 모든 파일 디스크립터를 제거
	- fd_set 사용 전 반드시 먼저 호출해야 함
- FD_SET(int fd, fd_set *set)
	- fd_set에 특정 파일 디스크립터를 추가
	- 이미 존재하는 fd를 추가해도 오류 발생하지 않음
- FD_CLR(int fd, fd_set *set)
	- fd_set에서 특정 파일 디스크립터를 제거
	- 존재하지 않는 fd를 제거해도 오류 발생하지 않음
- FD_ISSET(int fd, fd_set *set)
	- select() 호출 후 특정 파일 디스크립터가 fd_set에 여전히 존재하는지 확인
	- fd가 set에 존재하면 0이 아닌 값 반환, 없으면 0 반환

:::warning
select() 호출 후 fd_set이 수정되므로, 루프에서 select()를 사용할 때는 매 호출 전에 fd_set을 다시 초기화해야 합니다.
:::

### 2.3 동작 과정

- select 함수는 호출 시 커널에 파일 디스크립터 집합(readfds, writefds, exceptfds)을 전달합니다.
- 커널은 이 집합들을 복사하여 내부적으로 관리합니다.
- 지정된 파일 디스크립터 중 어느 하나라도 준비될 때까지(또는 타임아웃이 발생할 때까지) 스레드는 블록됩니다.
- 이벤트가 발생하면 커널은 관련 fd_set에서 해당 이벤트가 발생하지 않은 파일 디스크립터의 비트를 0으로 설정합니다.
- select는 준비된 파일 디스크립터의 총 개수를 반환합니다.
- 사용자는 반환 이후에 FD_ISSET 매크로를 사용하여 어떤 파일 디스크립터가 준비되었는지 확인해야 합니다.
- 이 과정은 O(n) 시간 복잡도를 가지며, 여기서 n은 감시 중인 파일 디스크립터의 총 개수(nfds)입니다.
- 루프에서 select를 반복 호출할 때는 fd_set이 수정되므로 매번 재설정이 필요합니다.

### 2.4 사용 예시

```c
fd_set read_fds;
struct timeval tv;

// fd_set 초기화
FD_ZERO(&read_fds);
FD_SET(socket_fd, &read_fds);    // 소켓 감시
FD_SET(STDIN_FILENO, &read_fds); // 키보드 입력 감시

// 5초 타임아웃 설정
tv.tv_sec = 5;
tv.tv_usec = 0;

// select 호출
int max_fd = (socket_fd > STDIN_FILENO ? socket_fd : STDIN_FILENO);
int ready = select(max_fd + 1, &read_fds, NULL, NULL, &tv);

if (ready > 0) {
    if (FD_ISSET(socket_fd, &read_fds)) {
        // 소켓에서 데이터 읽기 가능
    }
    if (FD_ISSET(STDIN_FILENO, &read_fds)) {
        // 키보드 입력 있음
    }
}
```

### 2.5 주요 특징

- 장점
	- 단일 스레드로 여러 입출력 동시 처리 가능
	- POSIX 표준으로 이식성이 좋음
	- 간단한 구현으로 적은 수의 fd 처리에 효과적
- 단점:
	- fd 개수 제한 (최대 1024개)
	- 매 호출마다 fd_set 초기화 필요
	- 준비된 fd 확인을 위해 전체 세트 검사 필요
	- 현대 애플리케이션에서는 epoll을 권장

:::tip
select()는 간단한 동시성 처리에는 유용하지만, 대규모 애플리케이션에서는 epoll 같은 더 효율적인 방식을 사용하는 것이 좋습니다.
:::

## 3. poll 함수

```c
int poll(struct pollfd *fds, nfds_t nfds, int timeout);
```

- [레퍼런스](https://man7.org/linux/man-pages/man2/poll.2.html)

### 3.1 매개변수 설명

- pollfd 구조체는 감시할 파일 디스크립터와 이벤트를 지정하는데 사용됩니다
- timeout
	- -1: 이벤트가 발생할 때까지 무한정 대기
	- 0: 즉시 반환 (비블로킹 폴링)
	- 양수: 지정된 밀리초만큼 대기
- 반환 값
	- poll() 함수는 성공하면 음수가 아닌 값을 반환합니다. 이벤트나 오류가 발생한 파일 디스크립터의 수입니다.
	- 반환 값이 0이면, 파일 디스크립터가 준비되기 전에 시스템 호출이 시간 초과되었음을 나타냅니다.
	- 오류가 발생하면 -1을 반환하고, errno 변수에 오류를 나타내는 값이 설정됩니다.

#### pollfd 구조체

```c
struct pollfd {
int   fd;         // 파일 디스크립터
short events;     // 감시할 이벤트
short revents;    // 발생한 이벤트
};
```

- pollfd 구조체는 감시할 파일 디스크립터와 이벤트를 지정하는데 사용됩니다
- events/revents 플래그
	- POLLIN: 읽을 데이터가 있음
	- POLLOUT: 쓰기가 가능한 상태
	- POLLPRI: 긴급 데이터 발생 (TCP 소켓의 OOB 데이터 등)
	- POLLERR: 에러 발생 (revents에서만 사용)
	- POLLHUP: 연결이 끊김 (revents에서만 사용)
	- POLLNVAL: 잘못된 요청 - fd가 열려있지 않음 (revents에서만 사용)

### 3.2 동작 과정

- poll도 select와 마찬가지로 멀티플렉싱을 구현하는 시스템 콜입니다.
- 파일 디스크립터의 이벤트를 기다리다가 이벤트가 발생하면, poll에서의 블록이 해제됩니다.
- poll 함수는 이벤트가 발생한 파일 디스크립터의 총 개수를 반환하지만, 어떤 파일 디스크립터에 이벤트가 발생했는지는 알려주지 않습니다.
- 따라서 프로그래머는 반환된 값(이벤트 발생 개수)만큼 pollfd 배열을 순회하면서 revents 필드를 검사해야 합니다.
- 각 파일 디스크립터의 revents 필드가 0이 아니면 해당 파일 디스크립터에 이벤트가 발생한 것입니다.
- 이 과정은 O(n) 시간 복잡도를 갖기 때문에, 감시하는 파일 디스크립터가 많을수록 검사 시간이 선형적으로 증가합니다.

### 3.3 사용 예시

```c
#define MAX_FDS 2

struct pollfd fds[MAX_FDS];
char buf[1024];

// 소켓과 표준 입력 감시 설정
fds[0].fd = sockfd;
fds[0].events = POLLIN;

fds[1].fd = STDIN_FILENO;
fds[1].events = POLLIN;

while (1) {
    int ret = poll(fds, MAX_FDS, 5000);  // 5초 타임아웃

    if (ret < 0) {
        perror("poll");
        break;
    }
    if (ret == 0) {
        printf("Poll timed out!\n");
        continue;
    }

    // 소켓 이벤트 체크
    if (fds[0].revents & POLLIN) {
        recv(sockfd, buf, sizeof(buf), 0);
        printf("Received: %s\n", buf);
    }

    // 표준 입력 이벤트 체크
    if (fds[1].revents & POLLIN) {
        read(STDIN_FILENO, buf, sizeof(buf));
        printf("Read from stdin: %s\n", buf);
    }
}
```

### 3.4 select와의 차이점

- **감시 방식**
	- select처럼 표준 입력, 출력, 에러를 따로 감시할 필요가 없습니다.
	- select는 fd_set로 읽기/쓰기/예외를 분리했습니다.
	- 단일 pollfd 구조체로 모든 이벤트 처리합니다.
- **타임아웃 처리**
	- select는 timeval 구조체 사용
	- poll은 별도 구조체 없이 타임아웃 설정 가능합니다.

### 3.5 장점과 한계

- select와 같이 단일 프로세스에서 여러 파일 입출력 처리 가능합니다.
- poll은 이론적으로 시스템 리소스가 허용하는 한 무제한의 파일 디스크립터를 감시할 수 있습니다.
	- 실제로는 프로세스당 열 수 있는 파일 디스크립터의 수에 의해 제한됩니다.
	- 현대 리눅스 시스템에서는 수만 개의 파일 디스크립터를 처리할 수 있습니다.
	- 그러나 파일 디스크립터 수가 증가할수록 선형적으로 성능이 저하될 수 있습니다.
- 이벤트 감시 방식이 더 단순하고 직관적입니다.
- 일부 UNIX 시스템은 poll을 지원하지 않아 이식성 제약있습니다.
- select와 poll 모두 이벤트가 발생한 파일 디스크립터를 찾기 위해 전체 디스크립터 집합을 순회해야 하는 O(n) 검사가 필요합니다.

#### ulimit

- ulimit은 리눅스와 유닉스 계열 운영체제에서 프로세스가 사용할 수 있는 시스템 리소스의 제한을 설정하는 도구입니다.
- [자세한 내용은 ulimit 참고](../../../Linux/Ulimit/Ulimit.md)

## 4. epoll 함수

### 4.1 개요

- epoll은 select와 poll의 단점을 보완하기 위해 리눅스 커널 2.5.44 버전에서 처음 소개된 시스템 콜입니다.
- 이벤트 기반의 I/O 모델을 사용하며, 이벤트가 발생한 파일 디스크립터만 반환하기 때문에 select와 poll의 단점을 보완했습니다.
- [레퍼런스](https://man7.org/linux/man-pages/man7/epoll.7.html)

### 4.2 주요 함수

```c

int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
```

#### 4.2.1 epoll_create1

```c
int epoll_create1(int flags);
```

- [레퍼런스](https://man7.org/linux/man-pages/man2/epoll_create1.2.html)
- epoll 인스턴스를 생성하고 이를 참조하는 파일 디스크립터를 반환합니다.
	- 에러 발생 시 -1을 반환합니다.
- flags 파라미터 : epoll 인스턴스 생성 옵션
	- 0: 만약 flags가 0이면, 더 이상 사용되지 않는 size 인자가 제거된 것 외에는, epoll_create1()은 epoll_create()와 동일합니다.
	- EPOLL_CLOEXEC: 새로운 파일 디스크립터에 close-on-exec (FD_CLOEXEC) 플래그를 설정합니다.
		- FD_CLOEXEC 플래그가 설정된 파일 디스크립터는 프로세스가 exec() 계열 함수(새로운 프로그램을 실행하는 함수)를 호출할 때 자동으로 닫힙니다.
- 생성된 파일 디스크립터는 더 이상 필요하지 않을 때 close()로 명시적으로 닫아야 합니다.

#### 4.2.2 epoll_ctl

```c
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *_Nullable event);
```

- [레퍼런스](https://man7.org/linux/man-pages/man2/epoll_ctl.2.html)
- epoll_ctl() 함수는 epoll 인스턴스의 "관심 목록"을 관리하는 함수입니다
- op를 통해 관심 목록에 파일 디스크립터를 추가, 수정, 삭제할 수 있습니다.
	- EPOLL_CTL_ADD: 새로운 파일 디스크립터를 감시 목록에 추가합니다.
	- EPOLL_CTL_MOD: 이미 감시 중인 파일 디스크립터의 설정을 변경합니다.
	- EPOLL_CTL_DEL: 파일 디스크립터를 감시 목록에서 제거합니다.
- fd
  - epoll 인스턴스에 추가할 파일 디스크립입니다.
- event
  - 파일 디스크립터의 이벤트 설정을 담은 epoll_event 구조체입니다.
- 반환값
	- 성공 시 0을 반환합니다.
	- 실패 시 -1을 반환하고 errno에 오류 코드를 설정합니다.

##### 예시

```c
struct epoll_event ev;
ev.events = EPOLLIN | EPOLLOUT; // 읽기 및 쓰기 이벤트 모두 감시
ev.data.fd = some_fd; // 이벤트 발생 시 식별을 위한 fd 저장

// epoll 인스턴스에 파일 디스크립터 추가
epoll_ctl(epoll_fd, EPOLL_CTL_ADD, some_fd, &ev);
```

#### 4.2.3 epoll_wait

```c
int epoll_wait(int epfd, struct epoll_event events[.maxevents], int maxevents, int timeout);
```

- [레퍼런스](https://man7.org/linux/man-pages/man2/epoll_wait.2.html)
- epoll_wait() 시스템 콜은 파일 디스크립터 epfd로 참조되는 epoll인스턴스에서 이벤트를 기다립니다.
- 이벤트가 발생한 파일 디스크립터의 정보를 events 배열에 저장합니다.
- epoll_wait()는 최대 maxevents 개수만큼 반환합니다. maxevents 인자는 0보다 커야 합니다.
- timeout 인자는 epoll_wait()가 블록할 밀리초 수를 지정합니다. 시간은 CLOCK_MONOTONIC 시계를 기준으로 측정됩니다.
	- timeout이 -1이면 무한정 대기합니다.
	- timeout이 0이면 즉시 반환합니다.
- epoll_wait() 호출은 다음 중 하나가 발생할 때까지 블록됩니다
	- 관심 목록에 있는 파일 디스크립터 중 하나에 이벤트가 발생
	- 호출이 시그널 핸들러에 의해 중단됨
	- timeout이 지남

### 4.3 동작 과정

- epoll은 select/poll과 달리 커널에서 이벤트 상태를 추적하며, 두 개의 주요 데이터 구조를 사용합니다:
	- "관심 목록"(interest list): 감시 대상 파일 디스크립터와 관심 이벤트 정보 저장
	- "준비 목록"(ready list): 이벤트가 발생한 파일 디스크립터 정보 저장
- 동작 단계:
	1. epoll_create1()로 epoll 인스턴스를 생성하면 커널 내부에 전용 데이터 구조가 할당됩니다.
	2. epoll_ctl()을 사용해 각 파일 디스크립터와 관심 이벤트(EPOLLIN, EPOLLOUT 등)를 관심 목록에 등록합니다.
	3. epoll_wait()를 호출하면 이벤트 발생을 기다리며 스레드가 블록됩니다.
	4. 이벤트가 발생하면 커널은 해당 파일 디스크립터 정보를 준비 목록에 추가합니다.
	5. epoll_wait()는 준비 목록의 이벤트 정보만 사용자 공간의 events 배열로 복사하여 반환합니다.
	6. 반환된 events 배열은 실제 이벤트가 발생한 파일 디스크립터만 포함하므로 전체 목록을 검사할 필요가 없습니다.
- epoll은 두 가지 트리거 모드를 지원합니다:
	- 레벨 트리거(Level Triggered, 기본 모드): 읽기/쓰기 가능 상태가 지속되는 한 계속 이벤트 통지 (select/poll과 유사)
	- 에지 트리거(Edge Triggered, EPOLLET 플래그): 상태 변화가 발생한 시점에만 한 번 통지 (더 효율적이지만 구현이 복잡)
- 성능 특징:
	- 이벤트가 발생한 파일 디스크립터만 반환하므로 O(1) 시간 복잡도로 이벤트 처리 가능
	- 매번 커널에 파일 디스크립터 집합을 전달하지 않아 시스템 콜 오버헤드 감소
	- 대규모 연결(수천, 수만 개)에서도 효율적인 성능 유지

### 4.4 트리거 모드

- epoll은 이벤트 감지 방식에 따라 두 가지 트리거 모드를 제공합니다:

#### 4.4.1 레벨 트리거(Level Triggered, LT)

- 기본 동작 방식으로, select와 poll과 유사하게 작동합니다.
- 읽기/쓰기 가능 상태가 지속되는 한 계속해서 이벤트를 통지합니다.
- 버퍼에 데이터가 남아있는 한 반복적으로 이벤트가 발생합니다.
- 이벤트를 놓칠 위험이 적어 구현이 더 간단합니다.

#### 4.4.2 에지 트리거(Edge Triggered, ET)

- `EPOLLET` 플래그를 지정하여 사용할 수 있습니다.
- 상태 변화가 발생한 시점에만 한 번 이벤트를 통지합니다.
- 예를 들어, 데이터가 도착할 때 한 번만 알림을 받고, 버퍼에 데이터가 남아있더라도 추가 알림은 없습니다.
- 더 효율적이지만 구현이 복잡하며, 이벤트를 놓치지 않도록 주의해야 합니다.

#### 4.4.3 동작 차이 예시

다음 시나리오를 통해 두 모드의 차이를 이해할 수 있습니다:

1. 파이프의 읽기 측(rfd)이 epoll 인스턴스에 등록됩니다.
2. 파이프 쓰기 측에서 2KB의 데이터를 씁니다.
3. `epoll_wait()`를 호출하면 rfd가 준비된 파일 디스크립터로 반환됩니다.
4. 파이프 읽기 측에서 1KB의 데이터만 읽습니다.
5. 다시 `epoll_wait()`를 호출합니다.

- **에지 트리거(ET) 모드**에서는 5단계의 `epoll_wait()` 호출이 대기 상태에 빠질 수 있습니다.
	- 이벤트는 상태 변화 시에만 생성되기 때문에, 2단계에서 데이터가 도착할 때 한 번만 이벤트가 발생하고 3단계에서 소비됩니다.
	- 4단계에서 버퍼의 일부 데이터만 읽었지만, 새로운 데이터가 도착하지 않았으므로 5단계에서는 이벤트가 발생하지 않습니다.
- **레벨 트리거(LT) 모드**에서는 5단계의 `epoll_wait()` 호출이 즉시 반환됩니다.
	- 버퍼에 여전히 데이터가 남아있는 상태이기 때문입니다.

#### 4.4.4 에지 트리거 사용 시 권장사항

에지 트리거(EPOLLET) 모드를 사용할 때는:

1. 반드시 넌블로킹(non-blocking) 파일 디스크립터를 사용해야 합니다.
2. `read()` 또는 `write()`가 `EAGAIN`을 반환한 후에만 이벤트를 기다려야 합니다.
3. 한 번의 이벤트 알림 후 더 이상 해당 파일 디스크립터를 처리하지 않으려면 `EPOLLONESHOT` 플래그를 함께 사용할 수 있습니다.
	- 이 경우 이벤트 처리 후 `epoll_ctl()`의 `EPOLL_CTL_MOD` 연산으로 파일 디스크립터를 다시 활성화해야 합니다.

#### 4.4.5 성능 최적화

- 에지 트리거 모드에서는 여러 스레드나 프로세스가 동일한 epoll 파일 디스크립터를 기다리고 있을 때, 이벤트가 발생하면 그 중 하나만 깨어납니다.
- 이는 "thundering herd"(다수의 프로세스가 동시에 깨어나는 현상) 문제를 방지하는 유용한 최적화입니다.

:::tip
대부분의 고성능 서버 애플리케이션은 에지 트리거 모드를 사용하지만, 구현 복잡성을 고려하여 특정 상황에 맞는 모드를 선택하는 것이 중요합니다.
:::

### 4.5 사용 예시

```c
#define MAX_EVENTS 10
struct epoll_event ev, events[MAX_EVENTS];
int epollfd;

// epoll 인스턴스 생성
epollfd = epoll_create1(0);
if (epollfd == -1) {
    perror("epoll_create1");
    exit(EXIT_FAILURE);
}

// 소켓 추가
ev.events = EPOLLIN;
ev.data.fd = listen_sock;
if (epoll_ctl(epollfd, EPOLL_CTL_ADD, listen_sock, &ev) == -1) {
    perror("epoll_ctl");
    exit(EXIT_FAILURE);
}

// 이벤트 대기
for (;;) {
    int nfds = epoll_wait(epollfd, events, MAX_EVENTS, -1);
    if (nfds == -1) {
        perror("epoll_wait");
        exit(EXIT_FAILURE);
    }

    for (int n = 0; n < nfds; ++n) {
        // 이벤트 처리
        if (events[n].data.fd == listen_sock) {
            // 새로운 연결 처리
        } else {
            // 데이터 처리
        }
    }
}
```

### 4.6 주요 특징

- **효율적인 이벤트 처리**
	- 상태 변화를 확인하기 위한 전체 파일 디스크립터 대상 반복문 불필요합니다.
	- 커널에서 상태 정보를 유지하여 매번 정보 전달 불필요합니다.
	- 이벤트 발생한 파일 디스크립터만 처리합니다.
- **확장성**
	- poll과 마찬가지로 별도의 정적 제한은 없으며, 시스템에서 허용하는 최대 파일 디스크립터 수에 따라 감시할 수 있습니다.
	- 보통 수천 개, 심지어 수만 개 이상의 파일 디스크립터를 효율적으로 감시할 수 있습니다.
	- 대규모 동시 연결 처리에 적합합니다.

### 4.7 한계

- Linux 전용 시스템 콜로 이식성 제한
- Windows의 IOCP 기반 시스템과의 호환성 문제
- select 대비 구현 복잡도 증가

## 5. POSIX와 이식성

### 5.1 POSIX 표준

- POSIX(Portable Operating System Interface)는 이식 가능 운영 체제 인터페이스의 약자로:
	- 서로 다른 UNIX OS의 공통 API를 정리
	- 이식성이 높은 유닉스 응용 프로그램 개발 목적
	- IEEE가 책정한 애플리케이션 인터페이스 규격

### 5.2 멀티플렉싱 API 선택 기준

1. **이식성 중시**
	- select: POSIX 표준으로 높은 이식성 필요시
	- poll: 유닉스 계열에서 향상된 기능 필요시
2. **성능 중시**
	- epoll: 리눅스 환경에서 고성능 필요시
	- IOCP: Windows 환경에서 고성능 필요시

참고

- https://man7.org/linux/man-pages/man2/select.2.html
- https://man7.org/linux/man-pages/man2/poll.2.html
- https://man7.org/linux/man-pages/man7/epoll.7.html