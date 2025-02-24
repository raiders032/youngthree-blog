---
title: "NIO"
description: "Java의 네트워크 프로그래밍 방식의 발전 과정을 상세히 알아봅니다. 전통적인 IO부터 NIO, 그리고 Netty까지 각각의 특징과 장단점을 예제 코드와 함께 살펴보며, 실제 개발에서 어떤 방식을 선택해야 하는지 이해합니다."
tags: [ "NIO", "NETTY", "TCP", "SOCKET", "CHANNEL", "BUFFER", "SELECTOR", "JAVA", "NETWORK", "SERVER" ]
keywords: [ "자바 NIO", "네티", "TCP 서버", "소켓 프로그래밍", "채널", "버퍼", "셀렉터", "비동기 IO", "논블로킹 IO", "자바 네트워크 프로그래밍", "NIO 버퍼", "NIO 채널", "netty framework", "네트워크 서버", "이벤트 루프" ]
draft: false
hide_title: true
---

## 1 NIO

- 자바 4에서 new Input/Ouput이라는 뜻으로 java.nio 패키지가 추가되었다.
- 자바 7에서 IO와 NIO 사이의 일관성 없는 클래스 설계를 바로 잡고 비동기 채널 등의 네트워크 지원을 대폭 강화한 NIO2 API가 추가 되었다.
- NIO2는 기존 java.nio의 하위 패키지로 제공된다.

### 1.1 IO와 차이점

#### 스트림과 채널

- IO는 스트림 기반이다. 따라서 데이터를 읽기 위해서는 입력 스트림을 생성해야 하고 데이터를 출력하기 위해서는 출력 스트림을 생성해야 한다.
- 하지만 NIO는 채널 기반이다. 채널은 스트림과 달리 양방향으로 입출력이 가능하다.
- 따라서 하나의 파일에서 데이터를 읽고 쓰는 작업을 모두 해야 한다면 FileChannel 하나만 생성하면 된다.

#### 버퍼

- IO에서는 출력 스트림이 1바이트를 쓰면 입력 스트림이 1바이트를 읽는다.
	- IO는 스트림에서 읽은 데이터를 즉시 처리하기 때문에 입력된 전체 데이터를 별도로 저장하지 않으면 입력된 데이터 위치를 이동해 가면서 자유롭게 이용할 수 없다.
	- IO에서는 추가적으로 보조 스트림인 `BufferedInputStream`, `BufferedOutputStream`을 연결해 버퍼를 사용해 복수 개의 바이트를 한꺼번에 입력받고 출력할 수 있다.
- IO와 다르게 NIO는 기본적으로 버퍼를 사용한다.
	- Channel에서 데이터를 읽으면 Buffer에 담긴다.
	- Channel에 데이터를 쓰려면 먼저 Buffer에 데이터를 담고 Buffer에 담긴 데이터를 Channel에 쓴다.

#### 논블로킹

- IO는 블록킹된다. 입력 스트림의 read() 메서드를 호출하면 데이터가 입력되기 전까지 스레드는 블로킹된다.
- IO스레드가 블로킹되면 다른 일을 할 수 없고 블로킹을 빠져나가기 위해 인터럽트도 할 수 없다.
	- 블로킹을 빠져나가는 유일한 방법은 스트림을 닫는 것이다.
- 반면에 NIO는 블로킹과 논블로킹을 모두 지원한다. NIO의 블로킹이 IO의 블로킹과 다른점은 스레드를 인터럽트해서 빠져나갈수 있다.
- NIO의 논블로킹은 입출력 작업 준비가 완되된 채널만 선택해서 작업 스레드가 처리하기 때문에 작업 스레드가 블로킹 되지 않는다.
- NIO 논블로킹의 핵심 객체는 멀티플렉서인 셀럭터다.
	- 셀렉터는 복수 개의 채널 중에서 준비 완료된 채널을 선택하는 방법을 제공한다.

## 2 버퍼

- NIO에서는 데이터를 입출력하기 위해 **항상 버퍼를 사용**해야 한다.
- 버퍼는 읽고 쓰기가 가능한 메모리 배열이다.
- 버퍼가 사용하는 메모리의 위치에 따라 non-direct 버퍼와 direct 버퍼로 분류된다.
	- non-direct 버퍼: JVM이 관리하는 힙 메모리 공간을 이용하는 버퍼
	- direct 버퍼: 운영체제가 관리하는 메모리 공간을 이용하는 버퍼

### 2.1 종류

#### 2.1.1 non-direct buffer

- JVM힙 메모리에 생성되는 버퍼를 의미합니다.
- JVM의 제한된 힙 메모리를 사용하므로 버퍼의 크기가 제한됩니다.
- 다이렉트 버퍼와 비교하여 생성과 삭제 속도가 빠릅니다.
- GC로 자동 메모리 관리가 가능합니다.

##### 동작 방식

- JVM 힙에 Non-Direct Buffer 생성
- I/O 요청 발생
- 커널 메모리에 임시 Direct Buffer 생성
- Non-Direct Buffer 데이터를 임시 Direct Buffer로 복사
- OS가 Direct Buffer로 I/O 수행
- 임시 Direct Buffer 해제

#### 2.1.2 direct buffer

- OS 커널 메모리에 직접 생성되는 버퍼를 의미합니다.
- 운영체제의 메모리를 할당받기 위해 운영체제의 네이티브 C 함수를 호출하고 여러가지 처리를 해야하므로 상대적으로 버퍼 생성이 느립니다.
	- 따라서 자주 생성하지 않고 생성한 버퍼를 재사용하는 것이 적합합니다.
- 운영체제가 관리하는 메모리를 사용하므로 운영체제가 허용하는 범위 내에서 대용량 버퍼를 사용할 수 있습니다.
- GC 대상 아니여서 명시적으로 해제해야 합니다.

##### 동작 방식

- JNI를 통해 커널 메모리에 Direct Buffer 생성
- I/O 요청 발생
- OS가 Direct Buffer로 직접 I/O 수행

### 2.2 버퍼 생성

- 데이터 타입별로 넌다이렉트 버퍼를 생성하기 위해서는 각 Buffer 클래스의 `allocate()`와 `wrap()` 메서드를 호출하면 된다.
- 다이렉트 버퍼는 `allocateDirect()` 메서드를 호출하면 된다.

**allocate() 메서드**

```java
ByteBuffer byteBuffer = ByteBuffer.allocate(100);  
CharBuffer charBuffer = CharBuffer.allocate(100);
```

- 최대 100개의 바이트를 저장하는 ByteBuffer를 생성하고 최대 100개의 문자를 저장하는 CharBuffer를 생성하는 코드

**wrap() 메서드**

```java
byte[] bytes = new byte[100];  
ByteBuffer byteBuffer = ByteBuffer.wrap(bytes);
```

- 각 타일별 Buffer는 모두 wrap() 메서드를 가지고 있다.
- wrap()는 이미 생성되어 있는 자바 배열을 래핑해서 Buffer 객체를 생성한다.

**allocateDirect()**

```java
ByteBuffer byteBuffer = ByteBuffer.allocateDirect(100);  
CharBuffer charBuffer = byteBuffer.asCharBuffer();
```

- allocateDirect() 메서드는 JVM 힙 메모리 바깥쪽 즉 운영체제가 관리하는 메모리에 다이렉트 버퍼를 생성한다.
- 이 메서드는 각 타입별 Buffer 클래스에는 없고 ByteBuffer만 제공한다.
	- 따라서 각 타입별로 다이렉트 버퍼를 생성하고 싶다면 asXX() 메서드를 호출해 얻을 수 있다.

### 2.3 Buffer의 위치 속성

- 버퍼를 사용하기 위해선 먼저 버퍼의 위치 속성을 잘 알아야 한다.
- 버퍼는 네 가지의 위치 속성을 가진다.
	- position
		- 현재 읽거나 쓰는 위치 값이다.
		- 인덱스 값이기 때문에 0부터 시작한다.
		- limit보다 큰 값을 가지 수 없다.
		- 만약 limit 값과 같다면 더 이상 데이터를 쓰거나 읽을 수 없다는 뜻이다.
	- limit
		- 버퍼에서 읽거나 쓸 수 있는 위치의 한계를 나타낸다.
		- 이 값은 capacity보다 같거나 작은 값을 가진다.
		- 최초에 버퍼를 만들면 capacity와 같은 값을 가진다.
	- capacity
		- 버퍼의 최대 데이터 개수
		- 메모리의 크기를 나타낸다.
	- mark
		- reset() 메서드를 호출했을 때 돌아갈 위치를 기록하는 속성이다.

### 2.4 Buffer 메서드

- [레퍼런스](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/nio/Buffer.html)

#### 2.4.1 clear()

```java
public Buffer clear() {  
    position = 0;  
    limit = capacity;  
    mark = -1;  
    return this;
}
```

- 버퍼의 위치 속성을 초기화 한다.

#### 2.4.2 flip()

```java
public Buffer flip() {  
    limit = position;  
    position = 0;  
    mark = -1;  
    return this;
}
```

- 데이터를 읽기 위해 위치 속성값을 변경한다.

#### 2.4.3 mark()

```java
public Buffer mark() {  
    mark = position;  
    return this;
}
```

- 현재 위치를 마킹한다.

#### 2.4.3 reset()

```java
public Buffer reset() {  
    int m = mark;  
    if (m < 0)  
        throw new InvalidMarkException();  
    position = m;  
    return this;
}
```

- 현재 위치(position)을 마킹한 위치로 변경한다.

## 3 Channel

- 채널은 NIO에서 데이터를 읽고 쓰는 연결을 나타낸다.
- 각 채널은 특정 I/O 서비스(예: 파일 I/O, 소켓 I/O)에 바인딩된다.
- 채널은 항상 버퍼와 함께 사용되며, 데이터는 버퍼를 통해 채널로 흐르거나 채널에서 버퍼로 흐른다.
- 채널은 블로킹과 논블로킹 모드를 모두 지원할 수 있다.

### 3.1 FileChannel

- [레퍼런스](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/nio/channels/FileChannel.html)
- `java.nio.channels.FileChannel`을 이용하면 파일 읽기와 쓰기를 할 수 있다.
- FileChannel은 동기화 처리가 되어 있어 쓰레드 세이프하다.

#### 3.1.1 FileChannel 생성과 닫기

```java
public static FileChannel open(Path path, OpenOption... options) 
```

- 정적 메서드인 open 메서드로 FileChannel을 생성할 수 있다.
- 첫 번째 path는 열거나 생성하고자 하는 파일의 경로를 Path 객체로 생성해 지정한다.
- 두 번째
  옵션은 [StandardOpenOption의](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/nio/file/StandardOpenOption.html)
  열거 상수를 나열하면 된다.

```java
FileChannel open = FileChannel.open(  
        Paths.get("/test.txt"),  
        StandardOpenOption.CREATE_NEW,  
        StandardOpenOption.WRITE  
);
```

- `/test.txt`  파일을 생성하고 쓰려면 위와 같이 채널을 생성한다.

#### 3.1.2 파일 읽기와 쓰기

- FileChannel의 read와 write 메서드는 블로킹된다.
- NIO에서는 비동기 파일 입출력 작업을 위해 AsynchronousFileChannel 클래스를 별도로 제공한다.

```java
public abstract int write(ByteBuffer src)
```

- 파일에 바이트를 쓰려면 FileChannel의 write() 메서드를 호출하면 된다.
- 매개값으로 ByteBuffer 객체를 주면 된다.
- ByteBuffer의 position부터 limit까지 파일에 쓰여진다.
- ByteBuffer에서 파일로 쓰여진 바이트 수가 반환된다.

```java
public abstract int read(ByteBuffer dst)
```

- 파일로부터 바이트를 읽기 위해 read() 메서드를 사용한다.
- 매개값으로 ByteBuffer 객체를 주면 파일에서 읽혀지는 바이트를 ByteBuffer의 position 부터 ByteBuffer에 저장한다.
- 반환값은 파일에서 ByteBuffer로 읽혀진 바이트 수다.
- 더 이상 읽을 바이트가 없다면 `-1`을 반환한다.

**파일 복사 예시**

```java
Path from = Paths.get("/Users/YT/Documents/test.txt");  
Path to = Paths.get("/Users/YT/Documents/test2.txt");  
  
FileChannel fileChannelFrom = FileChannel.open(from, StandardOpenOption.READ);  
FileChannel fileChannelTo = FileChannel.open(to, StandardOpenOption.CREATE, StandardOpenOption.WRITE);  
  
ByteBuffer byteBuffer = ByteBuffer.allocateDirect(100);  
int byteCount = 0;  
while (true) {  
    byteBuffer.clear();  
    byteCount = fileChannelFrom.read(byteBuffer);  
    if (byteCount == -1) break;  
    byteBuffer.flip();  
    fileChannelTo.write(byteBuffer);  
}  
  
fileChannelFrom.close();  
fileChannelTo.close();
```

- `/Users/YT/Documents/test.txt`파일을 `/Users/YT/Documents/test2.txt`로 복사하는 예시

## 4 Selctor

- Selctor는 하나의 스레드가 여러 채널의 이벤트를 모니터링할 수 있게 해주는 구성 요소이다.
- 선택자는 여러 채널을 등록하고, 이 채널들 중에서 I/O 작업이 가능한 채널을 결정한다.
	- 이를 통해 하나의 스레드가 여러 네트워크 연결을 효율적으로 관리할 수 있다.
- 선택자는 논블로킹 I/O 작업에 사용되며, 블로킹 방식의 문제를 해결해주는 중요한 기능이다.
- `Selector.open()` 메소드로 선택자를 생성하고, 채널에 `configureBlocking(false)`를 호출하여 논블로킹 모드로 설정한 후 선택자에 채널을 등록한다.

### 4.1 Selctor 생성

- Selector는 `Selector.open()` 정적 메소드를 호출하여 생성할 수 있다. 이 메소드는 새로운 Selector 객체를 반환한다.
- 생성된 Selector는 여러 채널을 관리하며, 이 채널들은 Selector에 등록되어야 한다.
	- `java.nio.channels.SelectableChannel` 하위 채널만 등록할 수 있다.
		- ServerSocketChannel, SocketChannel 등
	- 논블로킹으로 설정된 채널만 등록할 수 있다.
- Selector는 특정 이벤트(예: 연결 요청, 데이터 도착)가 발생할 때까지 블로킹하거나, 블로킹하지 않고 주기적으로 채널의 상태를 확인할 수 있다.

### 4.2 Channel 등록

- Selector에 채널을 등록하기 위해서는 채널을 논블로킹 모드로 설정해야 한다.
	- 이는 `configureBlocking(false)` 메소드를 호출하여 수행할 수 있다.
- 채널을 Selector에 등록하기 위해서는 채널의 `register()` 메소드를 사용한다.
	- 이 메소드는 `SelectionKey` 객체를 반환한다.
	- 이 키는 Selector와 채널 간의 관계를 나타낸다.
- `register()` 메소드는 관심 있는 I/O 이벤트 유형을 인자로 받는다.
	- 예를 들어, 읽기, 쓰기, 연결 가능, 수락 가능 등의 이벤트가 있다.

**예시**

```java
ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
serverSocketChannel.configureBlocking(false);
SelectionKey key = serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);

```

- 위 코드에서 `ServerSocketChannel`은 논블로킹 모드로 설정되고, Selector에 등록된다.
- 등록 시, 관심 있는 이벤트 유형으로 `OP_ACCEPT`를 지정하여, 연결 수락을 감지할 수 있다.
- 클라이언트 연결이 들어오면, Selector는 해당 이벤트를 감지하고, 애플리케이션은 이 정보를 사용하여 해당 이벤트를 처리할 수 있다.

### 4.3 준비된 채널 선택

- Selector는 등록된 채널들 중에서 I/O 작업이 가능한 채널을 선택하는 역할을 한다.
- `select()` 메소드를 호출하여 준비된 채널들을 선택할 수 있다.
	- 이 메소드는 하나 이상의 채널이 작업 준비가 되었을 때까지 블로킹된다.
	- 최소 하나의 SelectionKey로부터 작업 처리가 준비되었다는 통보가 올 때까지 블로킹된다.
- `select(long timeout)`은 지정된 시간 동안 블로킹되며, `selectNow()`는 즉시 반환된다.
- select, selectNow 메서드의 반환 값은 준비된 SelectionKey의 수이다.

**예시**

```java
while (true) {  
    int readyChannels = selector.select();  
    if (readyChannels == 0) continue;  
  
    Set<SelectionKey> selectedKeys = selector.selectedKeys();  
    Iterator<SelectionKey> keyIterator = selectedKeys.iterator();  
    while (keyIterator.hasNext()) {  
        SelectionKey key = keyIterator.next();  
        if (key.isAcceptable()) {  
            // 연결 수락 처리...  
        } else if (key.isReadable()) {  
            // 읽기 처리...  
        } else if (key.isWritable()) {  
            // 쓰기 처리...  
        }  
        keyIterator.remove();  
    }
}
```

- `select()` 메소드가 반환되면, 준비된 채널들의 집합을 처리할 수 있다.
- `selectedKeys()` 메소드를 사용하여 선택된 채널들의 `SelectionKey` 집합을 얻을 수 있습니다.
- 각 `SelectionKey`는 특정 채널의 준비된 이벤트를 나타낸다.
	- `isAcceptable()`, `isConnectable()`, `isReadable()`, `isWritable()` 등의 메소드를 사용하여 해당 이벤트에 따라 적절한 처리를 할 수 있다.

## 5 TCP 블로킹 채널

이 장에서는 간단한 TCP 서버를 통해 Java의 네트워크 프로그래밍 방식의 발전 과정을 살펴보겠습니다. 우리가 만들 서버는 다음과 같은 간단한 기능을 수행합니다:

1. 클라이언트의 연결을 수락
2. 연결된 클라이언트에게 "Hi!" 메시지 전송
3. 메시지 전송 후 연결 종료

### 5.1 Old I/O (OIO) 방식

가장 전통적인 방식으로, Java의 초기부터 제공된 블로킹 I/O를 사용한 구현입니다.

```java
public class PlainOioServer {
    public void serve(int port) throws IOException {
        // 서버 소켓 생성 및 포트 바인딩
        final ServerSocket socket = new ServerSocket(port); 
        try {
            for (;;) {
                // 클라이언트 연결 대기 (블로킹)
                final Socket clientSocket = socket.accept(); 
                System.out.println(
                    "Accepted connection from " + clientSocket);
                // 새 스레드 생성하여 클라이언트 처리
                new Thread(new Runnable() {                 
                    @Override
                    public void run() {
                        OutputStream out;
                        try {
                            out = clientSocket.getOutputStream();
                            // 클라이언트에 메시지 전송
                            out.write("Hi!\r\n".getBytes(
                                Charset.forName("UTF-8")));
                            out.flush();
                            // 연결 종료
                            clientSocket.close();               
                        } catch (IOException e) {
                            e.printStackTrace();
                        } finally {
                            try {
                                clientSocket.close();
                            } catch (IOException ex) {
                                // ignore on close
                            }
                        }
                    }
                }).start();                                    
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

**특징:**

- 구현이 직관적이고 이해하기 쉽습니다.
- 각 클라이언트 연결마다 새로운 스레드를 생성합니다.
- accept(), read(), write() 메소드가 모두 블로킹됩니다.
- 다수의 클라이언트 연결시 많은 스레드가 생성되어 리소스 낭비가 발생할 수 있습니다.

### 5.2 NIO 블로킹 방식

Java NIO를 사용하지만, 여전히 블로킹 방식으로 동작하는 구현입니다.

```java
public class PlainNioBlockingServer {
    public void serve(int port) throws IOException {
        ServerSocketChannel serverChannel = ServerSocketChannel.open();
        serverChannel.configureBlocking(true); // 블로킹 모드
        ServerSocket serverSocket = serverChannel.socket();
        serverSocket.bind(new InetSocketAddress(port));
        
        try {
            while (true) {
                // 클라이언트 연결 대기 (블로킹)
                final SocketChannel clientChannel = serverChannel.accept();
                System.out.println("Accepted connection from " + clientChannel);
                
                // 새 스레드를 생성하여 클라이언트 처리
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            // 메시지 전송을 위한 버퍼 준비
                            ByteBuffer buffer = ByteBuffer.wrap("Hi!\r\n".getBytes());
                            
                            // 버퍼의 모든 데이터를 클라이언트에 전송
                            while (buffer.hasRemaining()) {
                                clientChannel.write(buffer);
                            }
                        } catch (IOException e) {
                            e.printStackTrace();
                        } finally {
                            try {
                                // 연결 종료
                                clientChannel.close();
                            } catch (IOException ex) {
                                // ignore on close
                            }
                        }
                    }
                }).start();
            }
        } finally {
            serverChannel.close();
        }
    }
}
```

**특징:**

- NIO의 Channel과 Buffer를 사용합니다.
- OIO와 마찬가지로 각 클라이언트마다 새로운 스레드를 생성합니다.
- 버퍼를 사용하여 데이터 처리가 더 효율적입니다.
- 여전히 블로킹 방식으로 동작하여 동시성 처리에 한계가 있습니다.

## 6 TCP 논블로킹 채널

### 6.1 NIO 논블로킹 방식

Java NIO의 논블로킹 특성과 Selector를 활용한 가장 발전된 형태의 구현입니다.

```java
public class PlainNioServer {
    public void serve(int port) throws IOException {
        // ServerSocketChannel 열기
        ServerSocketChannel serverChannel = ServerSocketChannel.open();
        
        // 비동기 모드로 설정 
        serverChannel.configureBlocking(false);
        
        // 로컬 포트에 바인딩
        ServerSocket ssocket = serverChannel.socket();
        InetSocketAddress address = new InetSocketAddress(port);
        ssocket.bind(address);

        // Selector 생성 및 채널 등록
        Selector selector = Selector.open();
        serverChannel.register(selector, SelectionKey.OP_ACCEPT);

        final ByteBuffer msg = ByteBuffer.wrap("Hi!\r\n".getBytes());

        for (;;) {
            try {
                // 블로킹되어 새로운 이벤트를 기다림
                selector.select(); 
            } catch (IOException ex) {
                ex.printStackTrace();
                break;
            }

            // 준비된 이벤트들을 얻어옴
            Set<SelectionKey> readyKeys = selector.selectedKeys();
            Iterator<SelectionKey> iterator = readyKeys.iterator();

            while (iterator.hasNext()) {
                SelectionKey key = iterator.next();
                iterator.remove();

                try {
                    // 새로운 연결 수락
                    if (key.isAcceptable()) {
                        ServerSocketChannel server = (ServerSocketChannel)key.channel();
                        SocketChannel client = server.accept();
                        client.configureBlocking(false);
                        client.register(selector, SelectionKey.OP_WRITE | SelectionKey.OP_READ, msg.duplicate());
                        System.out.println("Accepted connection from " + client);
                    }
                    // 클라이언트에 데이터 쓰기
                    if (key.isWritable()) {
                        SocketChannel client = (SocketChannel)key.channel();
                        ByteBuf buffer = (ByteBuf)key.attachment(); 
                        while (buffer.hasRemaining()) {
                            if (client.write(buffer) == 0) {
                                break;
                            }
                        }
                        client.close();
                    }
                } catch (IOException ex) {
                    key.cancel();
                    try {
                        key.channel().close();
                    } catch (IOException cex) {
                    }
                }
            }
        }
    }
}
```

**특징과 장점:**

1. **단일 스레드로 다중 연결 처리**
	- Selector를 사용하여 여러 채널의 이벤트를 효율적으로 관리
	- 스레드 생성 비용 절감
2. **리소스 효율성**
	- 논블로킹 방식으로 동작하여 스레드 대기 시간 최소화
	- 버퍼를 사용한 효율적인 메모리 관리
3. **확장성**
	- 다수의 클라이언트 연결을 효율적으로 처리
	- 시스템 리소스를 효율적으로 사용

### 6.2 세 가지 방식의 비교

1. **OIO (Old I/O)**
	- 장점: 구현이 단순하고 이해하기 쉬움
	- 단점: 클라이언트당 스레드 생성으로 인한 리소스 낭비
2. **NIO 블로킹**
	- 장점: 버퍼를 사용한 효율적인 데이터 처리
	- 단점: OIO와 마찬가지로 클라이언트당 스레드 생성 필요
3. **NIO 논블로킹**
	- 장점: 단일 스레드로 다수의 클라이언트 처리 가능
	- 단점: 구현이 복잡하고 디버깅이 어려움

## 7 Netty 소개

- 지금까지 Java NIO를 사용한 네트워크 프로그래밍에 대해 알아보았습니다.
- NIO는 강력한 기능을 제공하지만, 직접 사용하기에는 몇 가지 어려움이 있습니다:
	- 복잡한 버퍼 관리
	- 까다로운 이벤트 처리 로직
	- 디버깅의 어려움
	- 동시성 처리의 복잡성
- 이러한 문제를 해결하기 위해 등장한 것이 바로 Netty입니다.

### 7.1 Netty란?

- Netty는 비동기 이벤트 기반 네트워크 애플리케이션 프레임워크입니다.
- NIO의 복잡한 처리를 추상화하여 개발자가 비즈니스 로직에 집중할 수 있게 해줍니다.
- [자세한 내용은 Netty Introduction 참고](../../../Netty/Introduction/Introduction.md)

### 7.2 앞서 본 TCP 서버를 Netty로 구현

- 이전에 살펴본 "Hi!" 메시지를 전송하는 서버를 Netty로 구현하면 다음과 같습니다:

```java
public class NettyNioServer {
    public void server(int port) throws Exception {
        final ByteBuf buf = Unpooled.copiedBuffer("Hi!\r\n",
                CharsetUtil.UTF_8);
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(group).channel(NioServerSocketChannel.class)
                .localAddress(new InetSocketAddress(port))
                .childHandler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    public void initChannel(SocketChannel ch) 
                        throws Exception {
                        ch.pipeline().addLast(
                            new ChannelInboundHandlerAdapter() {
                                @Override
                                public void channelActive(
                                    ChannelHandlerContext ctx) throws Exception {
                                    ctx.writeAndFlush(buf.duplicate())
                                        .addListener(
                                            ChannelFutureListener.CLOSE);
                                }
                            });
                    }
                });
            ChannelFuture f = b.bind().sync();
            f.channel().closeFuture().sync();
        } finally {
            group.shutdownGracefully().sync();
        }
    }
}
```