## 1 Global Accelerator

- [레퍼런스](https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html)
- AWS Global Accelerator는 전 세계 사용자에게 애플리케이션 성능을 최적화하고 가용성을 보장하는 서비스입니다.
- 글로벌 엣지 네트워크를 통해 사용자 트래픽을 최적의 경로로 유도하여 응답 시간을 줄이고 안정적인 연결을 제공합니다.



## 2 주요 기능

### 2.1 트래픽 관리

- **Global Accelerator**는 전 세계 엣지 로케이션을 활용하여 트래픽을 전달합니다. 이를 통해 낮은 지연 시간과 높은 가용성을 보장합니다.
- **정적 IP 주소**: 두 개의 정적 IP 주소를 제공하여, 다중 리전의 엔드포인트에 대해 하나의 IP 주소를 사용할 수 있습니다.
- **고가용성 및 장애 조치**: 문제가 발생한 엔드포인트에서 자동으로 건강한 엔드포인트로 트래픽을 전환합니다.



### 2.2 성능 최적화

- **AWS 글로벌 네트워크**를 통해 트래픽을 전송하여 지연 시간과 패킷 손실을 최소화합니다.
- **지속적인 경로 최적화**를 통해 트래픽이 가장 빠르고 안정적인 경로로 전달되도록 합니다.



## 3 Global Accelerator와 CloudFront 비교

### 3.1 목적

- **Global Accelerator**
    - 주로 애플리케이션의 전반적인 성능과 안정성을 높이는 데 중점을 둡니다.
    - TCP 및 UDP 트래픽의 전송 속도와 안정성을 개선합니다.
- **CloudFront**
    - 정적 및 동적 콘텐츠를 캐싱 및 배포하여 웹 애플리케이션의 성능을 향상시킵니다.



### 3.2 트래픽 처리

- **Global Accelerator**
    - 클라이언트 트래픽을 가장 가까운 엣지 로케이션으로 유도하고, AWS 글로벌 네트워크를 통해 애플리케이션 엔드포인트로 전달합니다.
    - 네트워크 장애 시 자동으로 트래픽을 다른 건강한 엔드포인트로 전환합니다.
- **CloudFront**
    - 전 세계적으로 분산된 엣지 로케이션에서 콘텐츠를 캐싱하여 사용자에게 빠르게 제공하여 지연 시간을 줄입니다.
    - 주로 HTTP 및 HTTPS 트래픽을 처리합니다.



### 3.3 주요 사용 사례

- **Global Accelerator**
    - 실시간 게임, 비디오 스트리밍, IoT 애플리케이션 등에서 낮은 지연 시간과 높은 안정성이 요구되는 경우에 적합합니다.
- **CloudFront**
    - 웹사이트, API, 비디오 온디맨드 스트리밍, 소프트웨어 배포 등에서 정적 및 동적 콘텐츠의 빠른 제공이 필요한 경우에 적합합니다.



### 3.4 통합 및 비용

- **Global Accelerator**
    - 정적 IP 주소와 고가용성 기능을 제공하여, 엔드포인트 장애 시에도 중단 없는 서비스를 제공합니다.
    - 비용은 데이터 전송량과 리전 수에 따라 달라집니다.
- **CloudFront**
    - 캐싱 및 배포를 통해 트래픽 비용을 절감할 수 있습니다.
    - 비용은 데이터 전송량, 요청 수, 엣지 로케이션에 따라 달라집니다.



## 4 Global Accelerator 구성 요소

### 4.1 정적 IP 주소

- Global Accelerator는 각 가속기에 대해 정적 IP 주소를 제공합니다.
- 이 정적 IP 주소는 AWS 엣지 네트워크에서 anycast됩니다.
- IPv4 및 듀얼 스택(IPv4 및 IPv6) 구성에 따라 IP 주소가 제공됩니다.



### 4.2 Accelerator

- Accelerator는 AWS 글로벌 네트워크를 통해 트래픽을 엔드포인트로 라우팅하여 애플리케이션 성능을 최적화합니다.
- 표준 가속기와 맞춤형 라우팅 가속기의 두 가지 유형이 있습니다.




### 4.3 DNS 이름

- 각 Accelerator는 기본 DNS 이름을 할당받습니다.
- 정적 IP 주소 대신 DNS 이름을 사용하여 트래픽을 라우팅할 수 있습니다.



### 4.4 네트워크 존

- 네트워크 존은 AWS의 가용 영역과 유사한 물리적 인프라로 구성된 독립적인 단위입니다.
- 가속기에 대해 하나 이상의 정적 IP 주소를 제공합니다.



### 4.5 Listener

- Listener는 클라이언트 연결을 처리하며, 포트와 프로토콜에 따라 트래픽을 처리합니다.
- 각 Listener는 하나 이상의 엔드포인트 그룹과 연결되어 있습니다.



### 4.6 Endpoint Group

- 각 엔드포인트 그룹은 특정 AWS 리전에 연결됩니다.
- 엔드포인트 그룹에는 NLB, ALB, EC2 인스턴스, Elastic IP 주소 등 여러 엔드포인트가 포함될 수 있습니다.
- 트래픽 다이얼 설정을 통해 트래픽 비율을 조정할 수 있습니다.



### 4.7 Endpoint

- 엔드포인트는 Global Accelerator가 트래픽을 라우팅하는 리소스입니다.
- 엔드포인트에는 NLB, ALB, EC2 인스턴스 또는 Elastic IP 주소가 포함될 수 있습니다.



**참고 자료**

- [Global Accelerator](https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html)
- [CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)