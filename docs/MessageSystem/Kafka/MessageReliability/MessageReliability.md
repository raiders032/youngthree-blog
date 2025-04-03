## 1. Message Delivery Semantics

- 메시지 전달 시맨틱스(Message Delivery Semantics)는 메시징 시스템이 메시지 전달에 대해 제공하는 보장 수준을 의미합니다. 
- Kafka에서는 주로 세 가지 전달 시맨틱스를 지원합니다
  - At most once: 메시지는 한 번 전달되며, 시스템 장애가 발생하면 메시지가 손실될 수 있고 재전송되지 않습니다.
  - At least once: 이는 메시지가 한 번 이상 전달된다는 의미입니다. 시스템 장애가 발생해도 메시지는 절대 손실되지 않지만, 한 번 이상 전달될 수 있습니다.
  - Exactly once: 이는 각 메시지가 정확히 한 번만 전달되는 선호되는 동작입니다. 시스템의 일부가 실패하더라도 메시지는 절대 손실되거나 두 번 읽히지 않습니다.

### 1.1 Latency와 Message durability

- Message Delivery Semantics은 Latency와 Message durability 간의 트레이드오프를 고려해야 합니다.
- Latency는 메시지가 Producer에서 Consumer로 전달되는 데 걸리는 시간입니다.
- Message durability는 메시지가 안전하게 저장되고 손실되지 않도록 보장하는 정도입니다.
- 일반적으로 Latency와 Message durability는 서로 반비례 관계에 있습니다.
- 즉, Latency를 줄이기 위해 Message durability를 희생할 수 있고, 반대로 Message durability를 높이기 위해 Latency를 늘릴 수 있습니다.

## 2. 메시지 유실이 발생하는 구간

- Producer에서 Broker로 메시지를 전송하는 과정에서 유실이 발생할 수 있습니다.
  - 이 과정에서 유실을 방지하기 위한 메커니즘으로는 ACK(acknowledgment) 설정을 통해 메시지가 Broker에 안전하게 저장되었는지 확인할 수 있습니다.
  - 이 과정을 Producer Confirmation이라고 합니다.
- Broker에서 Consumer로 메시지를 전송하는 과정에서도 유실이 발생할 수 있습니다.
  - 이 과정에서 유실을 방지하기 위한 메커니즘으로는 Consumer Offset을 사용하여 메시지를 추적하고, 재처리할 수 있는 기능을 제공합니다.
  - 이 과정을 Consumer Acknowledgment라고 합니다.

### 2.1 Producer-Broker

- Kafka의 내구성은 프로듀서가 브로커로부터 ack를 받는 것에 달려 있습니다. 
- 그 ack를 받지 못한다고 해서 반드시 요청 자체가 실패했다는 의미는 아닙니다. 
- 브로커는 메시지를 쓴 후에 프로듀서에게 ack를 보내기 전에 충돌할 수 있습니다. 
- 또한 메시지를 토픽에 쓰기 전에도 충돌할 수 있습니다. 
- 프로듀서가 실패의 성격을 알 수 있는 방법이 없기 때문에, 메시지가 성공적으로 쓰여지지 않았다고 가정하고 재시도할 수밖에 없습니다. 
- 일부 경우에는 이로 인해 Kafka 파티션 로그에 동일한 메시지가 중복되어 최종 소비자가 메시지를 두 번 이상 받게 됩니다.

#### 2.1.1 Producer Confirmation

- Producer Confirmation은 Producer가 메시지를 전송한 후, Broker로부터 ACK을 받는 과정을 의미합니다.
- Producer의 acks 옵션을 설정하여 메시지 전송 시 ACK을 기다리는 방식을 조정할 수 있습니다.
- acks 옵션은 다음과 같은 세 가지 값으로 설정할 수 있습니다.
  - 0: Producer는 메시지를 전송한 후 ACK을 기다리지 않고 다음 메시지를 전송합니다. 이 경우 메시지가 유실될 수 있습니다.
  - 1: Leader Broker가 메시지를 수신한 후 ACK을 Producer에게 전송합니다. Leader Broker의 복제 완료 전에 장애가 발생하면 메시지가 유실될 수 있습니다.
  - all: 모든 ISR(In-Sync Replica) Broker가 메시지를 수신한 후 ACK을 Producer에게 전송합니다. 이 경우 메시지가 유실되지 않지만, 성능이 저하될 수 있습니다.

### 2.2 Brocker

### 2.3 

### 2.2 Consumer AckMode

- Consumer AckMode Consumer가 메시지를 수신한 후, Broker에게 ACK을 전송하는 과정을 의미합니다.
- Consumer의 AcksMode 옵션을 설정하여 메시지 수신 후 ACK을 전송하는 방식을 조정할 수 있습니다.

## 3. At Most Once(최대 한 번)

- 메시지가 유실될 수 있지만, 중복 처리되지 않는 시맨틱스입니다.
- Producer는 메세지를 최대 한번 전송합니다.
  - Producer는 메시지를 전송한 후, ACK을 기다리지 않고 다음 메시지를 전송합니다.
- Broker는 메시지를 수신한 후, ACK을 Producer에게 전송하지 않습니다.
- 최대 한 번 전송은 일부 메시지가 손실되더라도 높은 처리량을 원하는 경우에 적합합니다.
  - 대량의 로그 수집이나 IoT 같은 환경에서 사용됩니다.

### 3.1 Producer Confirmation

- 최저 지연 시간을 위해 메시지는 "fire and forget" 방식으로 비동기적으로 전송될 수 있습니다. 
- 이는 프로듀서가 메시지 수신에 대한 어떠한 확인도 기다리지 않음을 의미합니다.
- 프로듀서의 acks 옵션을 0으로 설정하여 해당 방식을 사용합니다.

### 3.2 Consumer AckMode

- At Most Once에서 Consumer는 메시지를 처리하기 전에 먼저 오프셋을 커밋합니다.
- 즉, 메시지를 실제로 처리하기 전에 이미 "처리 완료"로 표시하는 것입니다.
- 이 방식의 결과:
  - 만약 메시지 처리 중 Consumer가 실패하면, 해당 메시지는 다시 처리되지 않습니다(이미 커밋되었으므로).
  - 재시작 시 Consumer는 마지막으로 커밋된 오프셋 이후부터 메시지를 가져옵니다.
- 이러한 접근 방식은 일부 메시지가 유실될 수 있지만, 절대 중복 처리되지 않음을 보장합니다.

## 4. At Least Once(최소 한 번)

- At Least Once 시멘틱은 메시지가 한 번 이상 전달된다는 의미입니다. 
- 시스템 장애가 발생해도 메시지는 절대 손실되지 않지만, 한 번 이상 전달될 수 있습니다.
- 중복 처리가 문제가 되는 상황이라면 프로듀서와 컨슈머의 멱등성이 중요합니다.

:::info
멱등성이란 어떤 연산을 여러 번 수행해도 결과가 동일하다는 성질입니다. 예를 들어, 데이터베이스에서 특정 레코드를 업데이트하는 작업이 멱등적이라면, 같은 업데이트 여러 번 수행해도 결과는 동일합니다.
:::

### 4.1 Producer Confirmation

- At Least Once에서는 프로듀서가 메시지가 커밋되었다는 응답을 기대했지만 받지 못한 경우, 메시지를 재전송합니다.
  - Producer가 메시지를 전송한 후, ACK을 기다립니다.
  - 만약 ACK을 받지 못하면, Producer는 메시지를 재전송합니다.
- 메시지 중복
  - 프로듀서 ack가 시간 초과되거나 오류를 수신하면 메시지가 Kafka 토픽에 쓰이지 않았다고 가정하고 메시지 전송을 재시도할 수 있습니다.
  - 만약 메시지가 성공적으로 Kafka 토픽에 기록되었으나, 브로커가 ACK를 Producer에게 전송하기 전에 장애가 발생한다면, Producer는 ACK를 받지 못했으므로 동일한 메시지를 재전송하게 됩니다. 
  - 이로 인해 동일한 메시지가 토픽에 중복 기록되고, 결과적으로 Consumer는 같은 메시지를 여러 번 처리하게 됩니다

#### 4.1.1 관련 옵션

- `acks`: 1 또는 all로 설정하여 메시지가 Broker에 안전하게 저장되었는지 확인합니다.
- `retries`: 메시지 전송 실패 시 재전송 횟수를 설정합니다.

### 4.2 Consumer AckMode

- At Least Once에서 Consumer는 메시지를 완전히 처리한 후에만 오프셋을 커밋합니다.
- 이 방식의 결과:
  - 만약 메시지 처리 중 Consumer가 실패하면, 해당 메시지는 재처리됩니다(아직 커밋되지 않았으므로).
  - 재시작 시 Consumer는 마지막으로 커밋된 오프셋 이후부터 메시지를 가져와 다시 처리합니다.
- 이 방식은 메시지 유실을 방지하지만, 동일한 메시지가 여러 번 처리될 수 있습니다.
- Consumer 애플리케이션은 중복 처리에 대응할 수 있도록 설계되어야 합니다(멱등성 처리).

## 5. Exactly Once(정확히 한 번)

- 메시지가 유실되지 않고, 중복 처리되지 않는 시맨틱스입니다.
- Kafka 0.11 버전부터 지원되는 기능으로, 가장 강력한 전달 보장을 제공합니다.
- 트랜잭션 API와 멱등성 Producer를 조합하여 구현됩니다.

### 5.1 Producer Confirmation


- 버전 0.11.0.0부터 프로듀서는 트랜잭션 전달을 활용할 수 있습니다. 
- 이는 프로듀서가 메시지가 수신되고 성공적으로 복제되었다는 확인을 요청할 수 있으며, 메시지를 재전송할 경우 멱등성으로 재전송하여 기존 메시지가 중복되지 않고 덮어쓰여진다는 의미입니다. 
- 이는 지연 시간이 더 길지만 가장 높은 내구성을 제공합니다. 
- 트랜잭션 보장을 활성화하려면 컨슈머도 적절하게 구성되어야 합니다.

#### 5.1.1 관련 옵션

- `transactional.id`: 트랜잭션을 사용할 때 고유한 ID를 설정합니다.
- `enable.idempotence`: 멱등성을 활성화합니다.

### 5.2 Consumer AckMode

- Kafka Streams 애플리케이션과 같이 Kafka 토픽에서 소비하고 다른 토픽에 생성할 때, Kafka는 버전 0.11.0.0에 추가된 트랜잭션 프로듀서 기능을 활용하여 정확히 한 번 의미 체계를 달성합니다. 
- 컨슈머의 위치는 토픽의 메시지로 저장되므로, 오프셋 데이터는 처리된 데이터가 출력 토픽에 기록될 때와 동일한 트랜잭션에서 Kafka에 기록됩니다. 
- 트랜잭션이 중단되면 컨슈머의 위치는 이전 값으로 되돌아가며, isolation_level 속성을 사용하여 출력 토픽이 다른 컨슈머에게 표시되는지 여부를 지정할 수 있습니다. 
- 기본 격리 수준인 read_uncommitted의 경우, 중단된 트랜잭션의 메시지를 포함한 모든 메시지가 컨슈머에게 표시됩니다. 
- read_committed에서는 컨슈머가 커밋된 트랜잭션의 메시지만 읽습니다.

#### 5.2.1 관련 옵션

- `isolation.level`: 컨슈머가 읽을 수 있는 메시지의 격리 수준을 설정합니다.
  - `read_uncommitted`: 모든 메시지를 읽습니다.
  - `read_committed`: 커밋된 메시지만 읽습니다.

- https://docs.confluent.io/kafka/design/delivery-semantics.html
- https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/
- https://oliveyoung.tech/2024-10-16/oliveyoung-scm-oms-kafka/
