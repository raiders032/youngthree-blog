---
title: "Java TCP 소켓 프로그래밍 완벽 가이드"
description: "Java에서 TCP 소켓 프로그래밍을 구현하는 방법을 상세히 알아봅니다. 서버와 클라이언트 구현부터 실제 통신까지, 실습 예제와 함께 TCP 네트워크 프로그래밍의 기초를 마스터해보세요."
tags: [ "JAVA", "NETWORK", "TCP", "SOCKET", "SERVER", "BACKEND" ]
keywords: [ "자바", "java", "tcp", "소켓", "socket", "네트워크", "network", "서버", "server", "클라이언트", "client", "통신", "백엔드", "backend", "소켓프로그래밍", "네트워크프로그래밍" ]
draft: false
hide_title: true
---

## 1. TCP 네트워킹

### 1.1 TCP 프로토콜 이해

- TCP(Transmission Control Protocol)는 신뢰성 있는 데이터 전송을 보장하는 연결 지향적 프로토콜입니다.
- 주요 특징:
	- 연결 지향성: 데이터 전송 전 연결 수립 필요
	- 신뢰성 보장: 데이터 손실, 중복, 순서 변경 방지
	- 흐름 제어: 송신자와 수신자 간의 데이터 처리 속도 조절
	- 혼잡 제어: 네트워크 상황에 따른 데이터 전송량 조절
	- 양방향 통신(Full-duplex): 데이터의 동시 송수신 가능

### 1.2 TCP 통신 기본 개념

- 3-way handshaking을 통한 연결 수립
	1. SYN: 클라이언트가 서버에 연결 요청
	2. SYN+ACK: 서버가 클라이언트에 요청 수락
	3. ACK: 클라이언트가 수락 확인
- 연결 해제는 4-way handshaking으로 진행됩니다.

## 2. ServerSocket과 Socket 클래스

### 2.1 ServerSocket 클래스

- Java에서는 `java.net.ServerSocket` 클래스를 사용하여 TCP 서버를 구현합니다.
- ServerSocket은 서버 측 연결을 담당하는 클래스입니다.
- ServerSocket을 통해 클라이언트의 연결 요청을 수락하고, 클라이언트와 통신할 Socket을 생성합니다.
	- 여기서 Socket은 클라이언트와의 실제 데이터 통신을 담당합니다.
- 주의 사항: ServerSocket은 클라이언트의 연결을 수락하고, Socket은 실제 데이터 송수신을 담당합니다.

#### 2.1.1 주요 메서드

- 생성자
	- `ServerSocket()`
		- 기본 생성자 바운드되지 않은 ServerSocket 생성합니다.
		- 생성 후 bind 메서드로 주소와 포트를 지정해야 합니다.
	- `ServerSocket(int port)`
		- 특정 포트에 바인딩된 ServerSocket 생성합니다.
		- 서버의 상태는 LISTEN 상태가 됩니다.
	- `ServerSocket(int port, int backlog)`
		- 포트와 대기 큐 크기 지정합니다. backlog는 대기열의 최대 길이를 의미합니다.
		- backlog는 값은 힌트(hint)로 사용되며, OS가 실제로 다른 값을 사용할 수 있습니다.
		- 0이나 음수를 지정하면 OS의 기본값이 사용됩니다.
	- `ServerSocket(int port, int backlog, InetAddress bindAddr)`
		- 주소와 포트 지정합니다. 주소를 지정하여 특정 네트워크 인터페이스에 바인딩할 수 있습니다.
		- 만약 bindAddr을 지정하지 않으면(null) 모든 네트워크 인터페이스에서 들어오는 연결을 수락합니다
- 주요 메서드
	- `Socket accept()`
		- 클라이언트의 연결 요청을 수락하고 클라이언트와 통신할 Socket을 생성합니다.
		- 블로킹 메서드로, 클라이언트 연결 요청이 올 때까지 대기합니다.
	- `void bind(SocketAddress endpoint)`
		- 서버소켓에 주소와 포트를 바인딩합니다.
		- 서버의 상태는 LISTEN 상태가 됩니다.
	- `void close()`
		- 서버소켓을 닫습니다.

### 2.2 Socket 클래스

- Socket은 실제 데이터 통신을 담당하는 클래스입니다.
- 클라이언트와 서버 간의 연결을 나타내며 데이터 송수신에 사용됩니다.

#### 2.2.1 주요 메서드

- 생성자
	- `Socket()`
		- 기본 생성자로 바운드되지 않은 소켓을 생성합니다.
		- 생성 후 connect 메서드로 서버에 연결해야 합니다.
	- `Socket(String host, int port)`
		- 지정된 호스트와 포트로 소켓을 생성하고 즉시 연결을 시도합니다.
		- 블로킹 메서드로 연결이 완료될 때까지 대기합니다.
	- `Socket(InetAddress address, int port)`
		- InetAddress로 지정된 주소와 포트로 소켓을 생성하고 연결합니다.
	- `Socket(String host, int port, InetAddress localAddr, int localPort)`
		- 로컬 주소와 포트를 지정하여 소켓을 생성합니다.
- 주요 메서드
	- `void connect(SocketAddress endpoint)`
		- 지정된 서버 주소로 연결을 시도합니다.
		- 기본 생성자로 생성한 소켓을 연결할 때 사용합니다.
		- 블로킹 메서드로 연결이 완료될 때까지 대기합니다.
	- `InputStream getInputStream()`
		- 소켓으로부터 데이터를 읽기 위한 입력 스트림을 반환합니다.
	- `OutputStream getOutputStream()`
		- 소켓으로 데이터를 쓰기 위한 출력 스트림을 반환합니다.
	- `void close()`
		- 소켓을 닫고 모든 리소스를 해제합니다.

## 3. 서버 개발

### 3.1 기본 서버 구현

- 기본적인 TCP 서버는 다음 단계로 구현됩니다:
	1. ServerSocket 생성
	2. 클라이언트 연결 대기(accept)
	3. 클라이언트와의 통신
	4. 연결 종료

**기본 서버 구현 예제**

```java
public class BasicServer {
    public static void main(String[] args) {
        try (ServerSocket serverSocket = new ServerSocket(8888)) {
            System.out.println("서버가 시작되었습니다.");
            
            while (true) {
                try (Socket clientSocket = serverSocket.accept()) {
                    handleClient(clientSocket);
                }
            }
        }
    }

    private static void handleClient(Socket clientSocket) throws IOException {
        // 클라이언트 처리 로직
    }
}
```

- ServerSocket을 생성합니다. 포트 번호를 지정하여 서버를 바인딩합니다.
- 무한 루프를 통해 클라이언트의 연결 요청을 수락합니다.
- accept 메서드는 클라이언트의 연결 요청이 올 때까지 블로킹됩니다. 반환 값으로 클라이언트와 통신할 Socket을 생성합니다.
	- 연결된 클라이언트의 IP 주소와 포트 번호는 Socket 객체에서 확인할 수 있습니다.
	- Socket의 getRemoteSocketAddress() 메서드로 확인할 수 있습니다.
	- InetSocketAddress 객체로 반환됩니다
- 클라이언트와의 통신은 별도의 스레드로 처리하는 것이 좋습니다.
	- 연결을 수락하는 메인 스레드와 클라이언트와의 통신을 담당하는 스레드를 분리하여 병렬 처리하는 것이 일반적입니다.

### 3.2 서버 설정

- 서버의 다양한 설정 옵션을 지정할 수 있습니다.

```java
ServerSocket serverSocket = new ServerSocket();
serverSocket.setReuseAddress(true);  // 주소 재사용
serverSocket.setSoTimeout(10000);    // 타임아웃 설정
serverSocket.setReceiveBufferSize(65536);  // 수신 버퍼 크기
```

## 4. 클라이언트 개발

### 4.1 기본 클라이언트 구현

- TCP 클라이언트의 기본 구현 단계
	1. Socket 생성 및 서버 연결
	2. 데이터 송수신
	3. 연결 종료

```java
public class BasicClient {
    public static void main(String[] args) {
        try (Socket socket = new Socket("localhost", 8888)) {
            System.out.println("서버에 연결되었습니다.");
            
            // 데이터 송수신 로직
            sendData(socket);
            receiveData(socket);
        }
    }

    private static void sendData(Socket socket) throws IOException {
        // 데이터 전송 로직
    }

    private static void receiveData(Socket socket) throws IOException {
        // 데이터 수신 로직
    }
}
```

## 5. Socket 데이터 통신

- 클랑인터와 서버가 연결이 맺어 지면 양쪽은 Socket 객체를 통해 데이터를 주고 받습니다.
- Socket 객체로부터 입력 스트림과 출력 스트림을 얻어 데이터를 송수신합니다.

### 5.1 입력 스트림 처리

- 소켓에서 데이터를 읽어오는 방법을 알아봅니다.
- 상대방이 보낸 데이터를 받기 위해서는 데이터를 저장할 `byte[]` 배열을 생성하고 이를 매개값으로 하는 InputStream의 read() 메서드를 호출합니다.
	- read() 메서드는 데이터를 읽어올 때까지 블로킹됩니다.
	- 블로킹이 해제되는 경우
		- 상대방이 데이터를 보냄
		- 상대방이 정상적으로 Socket의 close() 메서드를 호출함
		- 상대방이 비정상적으로 연결을 끊음
	- 데이터를 읽으면 읽은 바이트 수를 반환합니다.
	- 읽은 데이터가 없으면 -1을 반환합니다.
	- 읽은 데이터는 바이트 배열에 저장됩니다.

**예시**

```java
// 기본 바이트 스트림
InputStream in = socket.getInputStream();

// 문자 기반 스트림
BufferedReader reader = new BufferedReader(
    new InputStreamReader(socket.getInputStream())
);

// 객체 스트림
ObjectInputStream ois = new ObjectInputStream(socket.getInputStream());
```

- Socket의 getInputStream() 메서드로 입력 스트림을 얻어옵니다.
- 바이트 스트림, 문자 스트림, 객체 스트림 등 다양한 스트림을 사용할 수 있습니다.

### 5.2 출력 스트림 처리

- 소켓으로 데이터를 전송하는 방법을 알아봅니다.
- 상대방에게 데이터를 전송하기 위해서는 데이터를 저장한 `byte[]` 배열을 매개값으로 하는 OutputStream의 write() 메서드를 호출합니다.

```java
// 기본 바이트 스트림
OutputStream out = socket.getOutputStream();

// 문자 기반 스트림
PrintWriter writer = new PrintWriter(
    socket.getOutputStream(), true  // autoFlush 활성화
);

// 객체 스트림
ObjectOutputStream oos = new ObjectOutputStream(socket.getOutputStream());
```

## 6. 스레드 병렬 처리

### 6.1 멀티스레드 서버 구현

스레드풀을 사용한 서버 구현:

```java
public class ThreadPoolServer {
    private static final int THREAD_POOL_SIZE = 10;
    private final ExecutorService executorService;

    public ThreadPoolServer() {
        this.executorService = Executors.newFixedThreadPool(THREAD_POOL_SIZE);
    }

    public void start() {
        try (ServerSocket serverSocket = new ServerSocket(8888)) {
            while (true) {
                Socket clientSocket = serverSocket.accept();
                executorService.submit(new ClientHandler(clientSocket));
            }
        }
    }
}
```

### 6.2 성능 최적화

성능 향상을 위한 주요 설정:

```java
// 소켓 버퍼 크기 설정
socket.setReceiveBufferSize(65536);
socket.setSendBufferSize(65536);

// Keep-Alive 설정
socket.setKeepAlive(true);

// 타임아웃 설정
socket.setSoTimeout(30000);

// TCP_NODELAY 설정 (Nagle 알고리즘 비활성화)
socket.setTcpNoDelay(true);
```

:::tip
실제 운영 환경에서는 다음 사항을 고려하세요:

- 적절한 스레드풀 크기 설정
- 연결 타임아웃 설정
- 버퍼 크기 최적화
- 예외 처리 및 로깅
  :::

:::warning
리소스 관리에 주의하세요:

- 모든 스트림과 소켓은 반드시 닫아야 합니다
- try-with-resources 구문 사용을 권장합니다
- 메모리 누수에 주의하세요
  :::