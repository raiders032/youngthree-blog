## 1 gRPC

- gRPC는 Google에서 개발한 오픈 소스 하이퍼텍스트 전송 프로토콜(HTTP/2) 기반의 원격 프로시저 호출(RPC) 프레임워크입니다.
- gRPC에서 클라이언트 애플리케이션은 마치 로컬 객체를 호출하는 것처럼 다른 머신에 있는 서버 애플리케이션의 메서드를 직접 호출할 수 있어, 분산 애플리케이션과 서비스를 더 쉽게 만들 수 있습니다. 

## 2 Protocol Buffers

- 기본적으로 gRPC는 Google의 성숙한 오픈 소스 구조화된 데이터 직렬화 메커니즘인 Protocol Buffers를 사용합니다
- JSON과 같은 다른 데이터 형식과도 함께 사용할 수 있습니다.
- Protocol Buffers로 작업할 때 첫 번째 단계는 직렬화하려는 데이터의 구조를 proto 파일에 정의하는 것입니다. 
- 이것은 .proto 확장자를 가진 일반 텍스트 파일입니다. 

```proto
message Person {
  string name = 1;
  int32 id = 2;
  bool has_ponycopter = 3;
}
```

- 위의 proto 파일은 Person 메시지를 정의하고 있습니다.
- 그런 다음, 데이터 구조를 지정한 후 Protocol Buffer 컴파일러 protoc을 사용하여 proto 정의에서 선호하는 언어의 데이터 접근 클래스를 생성합니다. 
- 이 클래스들은 name()과 set_name()과 같은 각 필드에 대한 간단한 접근자와 전체 구조를 원시 바이트로/에서 직렬화/파싱하는 메서드를 제공합니다. 
- 예를 들어, 선택한 언어가 C++이라면 위의 예제에 대해 컴파일러를 실행하면 Person이라는 클래스가 생성됩니다. 
- 그런 다음 이 클래스를 애플리케이션에서 사용하여 Person Protocol Buffer 메시지를 채우고, 직렬화하고, 검색할 수 있습니다.
- gRPC 서비스는 일반 proto 파일에 정의하며, RPC 메서드 매개변수와 반환 타입은 Protocol Buffer 메시지로 지정합니다