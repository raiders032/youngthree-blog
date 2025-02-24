---
title: "I/O"
description: "자바의 입출력(IO) 시스템과 스트림의 개념부터 실제 활용까지 상세히 알아봅니다. '모든 것은 스트림이다'라는 관점에서 파일, 콘솔, 네트워크 통신의 통합된 입출력 처리 방식을 이해합니다."
tags: [ "JAVA", "IO", "STREAM", "FILE", "NETWORK", "BACKEND" ]
keywords: [ "자바", "입출력", "스트림", "파일", "IO", "InputStream", "OutputStream", "Reader", "Writer", "자바IO", "네트워크", "소켓", "TCP", "파일처리", "버퍼", "자바스트림" ]
draft: false
hide_title: true
---

## 1. 자바 IO 시스템 개요

### 1.1 '모든 것은 스트림이다'

- 유닉스/리눅스는 "모든 것은 파일이다"라는 철학을 가지고 있습니다.
- 자바의 IO 시스템은 이러한 자원들(파일, 콘솔, 네트워크 등)에 대한 접근 방식으로 '스트림'이라는 추상화된 인터페이스를 제공합니다.
- 이를 통해:
	- 모든 입출력을 일관된 방식으로 처리할 수 있습니다. 예를 들어 파일에서 읽든, 네트워크에서 읽든 동일한 read() 메서드를 사용합니다.
	- 스트림은 데이터가 흐르는 단방향 통로로서, 입력(InputStream)과 출력(OutputStream)이 명확히 구분됩니다.
		- 개발자는 데이터의 출처나 목적지의 실제 구현 방식을 알 필요 없이, 스트림 인터페이스만을 통해 프로그래밍할 수 있습니다.

### 1.2 자바 IO의 핵심 개념

- **스트림(Stream)**: 데이터가 단방향으로 흐르는 통로
- **입력 스트림**: 프로그램으로 데이터가 들어오는 통로
- **출력 스트림**: 프로그램에서 데이터가 나가는 통로
- **버퍼**: 데이터를 임시 저장하는 메모리 영역

## 2. 스트림의 기본 구조

### 2.1 스트림의 종류

1. **처리 단위에 따른 분류**
	- 바이트 스트림: 모든 종류의 데이터 처리 (InputStream/OutputStream)
	- 문자 스트림: 텍스트 데이터 특화 처리 (Reader/Writer)
2. **기능에 따른 분류**
	- 기본 스트림: 데이터의 입출력을 담당
	- 보조 스트림: 기본 스트림에 추가 기능을 제공

```text
[데이터 소스] <-> [기본 스트림] <-> [보조 스트림] <-> [프로그램]
```

### 2.2 주요 스트림 클래스 계층도

```
InputStream (바이트 입력)           OutputStream (바이트 출력)
├── FileInputStream              ├── FileOutputStream
├── ByteArrayInputStream         ├── ByteArrayOutputStream
└── SocketInputStream            └── SocketOutputStream

Reader (문자 입력)                 Writer (문자 출력)
├── FileReader                   ├── FileWriter
├── BufferedReader               ├── BufferedWriter
└── InputStreamReader            └── OutputStreamWriter
```

## 3. 파일 시스템 접근

### 3.1 File 클래스

- File 클래스는 파일 시스템의 파일과 디렉토리를 표현합니다

```java
// 파일 생성
File file = new File("data.txt");
boolean created = file.createNewFile();

// 디렉토리 생성
File dir = new File("data");
boolean created = dir.mkdir();

// 파일 정보 확인
boolean exists = file.exists();
long length = file.length();
boolean isDir = file.isDirectory();
```

### 3.2 파일 입출력

```java
// 파일 읽기
try (FileInputStream fis = new FileInputStream("input.txt")) {
    byte[] buffer = new byte[1024];
    int length;
    while ((length = fis.read(buffer)) > 0) {
        // 데이터 처리
    }
}

// 파일 쓰기
try (FileOutputStream fos = new FileOutputStream("output.txt")) {
    String data = "Hello, World!";
    fos.write(data.getBytes());
}
```

- new FileInputStream()
	- 파일에서 데이터를 입력받는 스트림입니다.
	- 파일이 없으면 예외가 발생하므로 파일이 있는지 먼저 확인해야 합니다.
- new FileOutputStream()
	- 파일에 데이터를 출력하는 스트림입니다.
	- 파일이 없으면 파일을 자동으로 만들고, 데이터를 해당 파일에 저장합니다.
	- 폴더를 만들지는 않기 때문에 폴더는 미리 만들어두어야 합니다.

## 4. 콘솔 입출력

- 콘솔 입출력도 결국은 스트림을 통한 입출력입니다.
- 자바는 프로그램 시작 시 자동으로 세 가지 표준 스트림을 생성합니다
	- 표준 입력(stdin): System.in (InputStream)
	- 표준 출력(stdout): System.out (PrintStream)
		- 표준 에러(stderr): System.err (PrintStream)
- System.in은 키보드 입력을 받는 InputStream입니다
- System.out과 System.err는 콘솔에 출력하는 PrintStream입니다
- PrintStream은 OutputStream을 상속받아 더 편리한 출력 메서드(print(), println() 등)를 제공합니다
- 파일 입출력과 마찬가지로 바이트 단위로 데이터를 주고받습니다.

### 4.1 고수준 콘솔 입출력

```java
// Scanner를 이용한 입력
Scanner scanner = new Scanner(System.in);
String line = scanner.nextLine();

// PrintWriter를 이용한 출력
PrintWriter writer = new PrintWriter(System.out, true);
writer.println("Hello, World!");
```

## 5. 네트워크 통신

네트워크 통신도 스트림을 통해 동일한 방식으로 처리됩니다:

### 5.1 TCP 소켓 통신

```java
// 서버 측
ServerSocket serverSocket = new ServerSocket(8080);
Socket clientSocket = serverSocket.accept();
InputStream in = clientSocket.getInputStream();
OutputStream out = clientSocket.getOutputStream();

// 클라이언트 측
Socket socket = new Socket("localhost", 8080);
InputStream in = socket.getInputStream();
OutputStream out = socket.getOutputStream();
```

## 6. 보조 스트림

- 보조 스트림은 기본 스트림의 기능을 확장하거나 성능을 향상시킵니다

### 6.1 주요 보조 스트림

- **BufferedInputStream/BufferedOutputStream**: 버퍼링을 통한 성능 향상
- **DataInputStream/DataOutputStream**: 자바의 기본 데이터 타입 처리
- **ObjectInputStream/ObjectOutputStream**: 객체 직렬화 지원

```java
// 버퍼링 적용 예시
try (BufferedInputStream bis = new BufferedInputStream(
        new FileInputStream("large.file"))) {
    // 버퍼링된 읽기 작업
}
```

### 6.2 BufferedInputStream/BufferedOutputStream

#### 6.2.1 BufferedInputStream

- `BufferdInputStream` 은 `InputStream` 을 상속받습니다.
- 따라서 개발자 입장에서 보면 `InputStream` 과같은 기능을 그대로 사용할 수 있습니다.

##### 예시와 동작 과정

```java
package io.buffered;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.IOException;

import static io.buffered.BufferedConst.BUFFER_SIZE;
import static io.buffered.BufferedConst.FILE_NAME;

public class ReadFileV3 {
    public static void main(String[] args) throws IOException {
        FileInputStream fis = new FileInputStream(FILE_NAME);
        BufferedInputStream bis = new BufferedInputStream(fis, BUFFER_SIZE);
        long startTime = System.currentTimeMillis();
        int fileSize = 0;
        int data;
        while ((data = bis.read()) != -1) {
            fileSize++;
        }
        bis.close();
        long endTime = System.currentTimeMillis();
        System.out.println("File name: " + FILE_NAME);
        System.out.println("File size: " + (fileSize / 1024 / 1024) + "MB");
        System.out.println("Time taken: " + (endTime - startTime) + "ms");
    }
}
```

- `read()` 는 1byte만 조회합니다.
- `BufferedInputStream` 은 먼저 버퍼를 확인합니다. 버퍼에 데이터가 없으므로 데이터를 불러옵니다.
- `BufferedInputStream` 은 `FileInputStream` 에서 `read(byte[])` 을 사용해서 버퍼의 크기인 3byte 의 데이터를 불러옵니다.
- 불러온 데이터를 버퍼에 보관합니다.
- 버퍼에 있는 데이터 중에 1byte를 반환합니다.
- `read()` 를 또 호출하면 버퍼에 있는 데이터 중에 1byte를 반환합니다.
- `read()` 를 또 호출하면 버퍼에 있는 데이터 중에 1byte를 반환합니다.
- `read()` 를 호출하는데, 이번에는 버퍼가 비어있다.
- `FileInputStream` 에서 버퍼 크기만큼 조회하고 버퍼에 담아둡니다.
- 이런 방식을 반복합니다.

#### 6.2.2 BufferedOutputStream

- `BufferedOutputStream` 과 같이 단독으로 사용할 수 없고, 보조 기능을 제공하는 스트림을 보조 스트림이라 합니다.

##### 예시와 동작 과정

```java
package io.buffered;

import java.io.BufferedOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;

import static io.buffered.BufferedConst.*;

public class CreateFileV3 {
    public static void main(String[] args) throws IOException {
        FileOutputStream fos = new FileOutputStream(FILE_NAME);
        BufferedOutputStream bos = new BufferedOutputStream(fos, BUFFER_SIZE);
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < FILE_SIZE; i++) {
            bos.write(1);
        }
        bos.close();
        long endTime = System.currentTimeMillis();
        System.out.println("File created: " + FILE_NAME);
        System.out.println("File size: " + FILE_SIZE / 1024 / 1024 + "MB");
        System.out.println("Time taken: " + (endTime - startTime) + "ms");
    }
}
```

- `BufferedOutputStream` 은 버퍼 기능을 내부에서 대신 처리해줍니다. 
- 따라서 단순한 코드를 유지하면서 버퍼를 사용 하는 이점도 함께 누릴 수 있습니다.
- `BufferedOutputStream` 은 내부에서 단순히 버퍼 기능만 제공합니다. 따라서 반드시 대상 `OutputStream`이 있어야 합니다.
- 추가로 사용할 버퍼의 크기도 함께 전달할 수 있습니다.
  - 예시에서 `BUFFER_SIZE` 는 8KB로 설정되어 있습니다.
- BufferedOutputStream` 은 내부에 `byte[] buf` 라는 버퍼를 가지고 있습니다.
- `BufferedOutputStream` 에 `write(byte)` 를 통해 `byte` 하나를 전달하면 `byte[] buf` 에 보관됩니다.
- `buf` 가 가득 차거나 `flush()` 가 호출되면 `buf` 의 내용을 대상 `OutputStream` 으로 전달합니다.
- 이후에 `write(byte)` 가 호출되면 다시 버퍼를 채우는 식으로 반복합니다.
- `BufferedOutputStream` 를 close()할 때 내부에서 `flush()` 가 호출되어 버퍼의 내용을 대상 `OutputStream` 으로 전달합니다.
  - 따라서 `close()` 호출할 때 버퍼에 남은 데이터도 모두 전달됩니다.
  - 그리고 나서 다음 연결된 스트림의 `close()`를 호출합니다.

## 7. 스트림 사용 시 모범 사례

### 7.1 리소스 관리

- 항상 try-with-resources 구문 사용
- 명시적으로 close() 호출이 필요한 경우 finally 블록에서 처리
- 버퍼가 있는 출력 스트림의 경우 flush() 적절히 호출

### 7.2 성능 최적화

- 대용량 데이터 처리 시 버퍼 스트림 활용
- 문자 데이터는 문자 스트림 사용
- 한 번에 처리할 수 있는 데이터는 배열 단위로 처리

## 8. 마치며

- 자바의 IO 시스템은 "모든 것은 스트림이다"라는 단순하면서도 강력한 추상화를 통해 다양한 입출력 작업을 일관된 방식으로 처리할 수 있게 해줍니다.
- 파일, 메모리, 네트워크 등 데이터의 출처나 목적지에 관계없이 동일한 스트림 인터페이스를 사용함으로써 코드의 재사용성과 유지보수성을 높일 수 있습니다.