## 1 AWS EC2 Elastic IP란?

- AWS EC2 Elastic IP는 동적 클라우드 컴퓨팅을 위해 설계된 고정 공인 IPv4 주소입니다.
- Elastic IP를 사용하면 인스턴스나 네트워크 인터페이스의 공인 IP 주소를 지속적으로 유지할 수 있습니다.
- 일반적인 EC2 인스턴스의 공인 IP는 인스턴스 중지/시작 시 변경될 수 있지만, Elastic IP는 변경되지 않습니다.
- 이는 도메인 네임 시스템(DNS)의 변경 없이 인스턴스나 소프트웨어의 고장을 신속하게 마스킹할 수 있게 해줍니다.



## 2 Elastic IP의 주요 특징

- **고정된 공인 IP 주소**: Elastic IP는 할당 후 해제하기 전까지 변경되지 않는 고정 IP 주소입니다.
- **계정에 종속**: Elastic IP는 AWS 계정에 종속되며, 계정 내의 리소스에 자유롭게 할당할 수 있습니다.
- **리전 한정**: Elastic IP는 특정 AWS 리전 내에서만 사용할 수 있습니다.
- **동적 재할당**: 필요에 따라 인스턴스 간에 Elastic IP를 빠르게 재할당할 수 있습니다.
- **비용 최적화**: 실행 중인 인스턴스에 연결된 Elastic IP는 무료이지만, 할당만 하고 사용하지 않으면 요금이 부과됩니다.



## 3 Elastic IP 할당 및 연결 방법

### 3.1 AWS Management Console을 통한 할당

1. AWS Management Console에 로그인합니다.
2. EC2 대시보드로 이동합니다.
3. 왼쪽 메뉴에서 "네트워크 및 보안" > "탄력적 IP"를 선택합니다.
4. "탄력적 IP 주소 할당" 버튼을 클릭합니다.
5. 필요한 경우 태그를 추가하고 "할당" 버튼을 클릭합니다.



### 3.2 AWS CLI를 통한 할당

- AWS CLI를 사용하여 Elastic IP를 할당하려면 다음 명령어를 사용합니다:



**Elastic IP 할당**

```bash
aws ec2 allocate-address --domain vpc
```

- 이 명령어는 VPC에서 사용할 수 있는 Elastic IP를 할당합니다.
- 명령이 성공하면 할당된 Elastic IP 주소와 할당 ID가 반환됩니다.



### 3.3 Elastic IP를 인스턴스에 연결

할당받은 Elastic IP를 인스턴스에 연결하는 방법은 다음과 같습니다:

1. EC2 대시보드의 "탄력적 IP" 페이지에서 할당받은 IP를 선택합니다.
2. "작업" 버튼을 클릭하고 "탄력적 IP 주소 연결"을 선택합니다.
3. 연결할 인스턴스를 선택하고 "연결" 버튼을 클릭합니다.

AWS CLI를 사용하여 연결하려면 다음 명령어를 사용합니다:



**Elastic IP 연결**

```bash
aws ec2 associate-address --instance-id i-1234567890abcdef0 --allocation-id eipalloc-1234567890abcdef0
```

- `--instance-id`: Elastic IP를 연결할 인스턴스의 ID
- `--allocation-id`: 할당받은 Elastic IP의 할당 ID



## 4 Elastic IP 사용 시 주의사항

- **비용 관리**: 할당만 하고 사용하지 않는 Elastic IP에 대해서는 요금이 부과됩니다. 불필요한 Elastic IP는 즉시 해제하는 것이 좋습니다.
- **한계**: 기본적으로 리전당 5개의 Elastic IP로 제한됩니다. 필요한 경우 AWS 지원팀에 요청하여 한도를 늘릴 수 있습니다.
- **네트워크 인터페이스**: Elastic IP는 인스턴스가 아닌 네트워크 인터페이스와 연결됩니다. 따라서 인스턴스의 네트워크 인터페이스를 변경하면 Elastic IP 연결이 해제될 수 있습니다.
- **DNS 캐싱**: Elastic IP를 재할당한 후에도 일부 클라이언트에서는 DNS 캐싱으로 인해 이전 IP로 접속할 수 있습니다. TTL(Time to Live) 설정을 적절히 관리해야 합니다.



## 5 Elastic IP 모범 사용 사례

- **고가용성 설계**: 장애 조치(Failover) 시나리오에서 Elastic IP를 사용하여 신속하게 트래픽을 건강한 인스턴스로 리다이렉션할 수 있습니다.
- **도메인 연결**: 고정 도메인 이름을 Elastic IP에 연결하여 안정적인 웹 서비스를 제공할 수 있습니다.
- **SSH 접속**: 관리용 SSH 접속을 위해 Elastic IP를 사용하면, 인스턴스 재시작 후에도 동일한 IP로 접속할 수 있습니다.
- **화이트리스트**: 보안 그룹이나 방화벽의 화이트리스트에 Elastic IP를 등록하여 안정적인 접근 제어를 구현할 수 있습니다.



## 6 Elastic IP 해제 방법

- Elastic IP를 더 이상 사용하지 않을 경우, 불필요한 비용 발생을 방지하기 위해 해제해야 합니다.



### 6.1 AWS Management Console을 통한 해제

1. EC2 대시보드의 "탄력적 IP" 페이지로 이동합니다.
2. 해제할 Elastic IP를 선택합니다.
3. "작업" 버튼을 클릭하고 "탄력적 IP 주소 연결 해제"를 선택합니다.
4. 연결 해제 후, "작업" 버튼을 다시 클릭하고 "탄력적 IP 주소 릴리스"를 선택합니다.



### 6.2 AWS CLI를 통한 해제

AWS CLI를 사용하여 Elastic IP를 해제하려면 다음 명령어를 순서대로 사용합니다:



**Elastic IP 연결 해제**

```bash
aws ec2 disassociate-address --association-id eipassoc-1234567890abcdef0
```



**Elastic IP 릴리스**

```bash
aws ec2 release-address --allocation-id eipalloc-1234567890abcdef0
```

- `--association-id`: Elastic IP 연결의 연결 ID
- `--allocation-id`: 할당받은 Elastic IP의 할당 ID



## 7 결론

- AWS EC2 Elastic IP는 클라우드 환경에서 고정 공인 IP 주소를 제공하는 유용한 서비스입니다.
- 고가용성 설계, 안정적인 도메인 연결, 관리 용이성 등 다양한 이점을 제공합니다.
- 하지만 비용 관리와 한계에 주의해야 하며, 필요하지 않을 때는 즉시 해제하는 것이 좋습니다.
- Elastic IP를 효과적으로 활용하면 더욱 안정적이고 유연한 클라우드 인프라를 구축할 수 있습니다.