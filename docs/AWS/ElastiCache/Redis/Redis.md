## 1 Redis OSS Cache 생성 과정

- Amazon ElastiCache를 사용하여 Redis OSS Cache를 생성하면 인메모리 데이터 스토어를 손쉽게 관리할 수 있습니다.
- 이 과정에서는 서버리스 옵션을 사용하여 자동 확장 가능한 캐시를 설정하는 방법을 다룹니다.

## 2 생성 페이지

- AWS 관리 콘솔에 로그인한 후, ElastiCache 서비스로 이동합니다.
- **Create Redis OSS Cache** 옵션을 클릭하여 캐시 생성 과정을 시작합니다.

## 3 Deployment option 선택

- **Serverless**: 서버 관리 없이 자동으로 확장 가능한 캐시를 생성합니다. 애플리케이션의 트래픽 요구에 맞춰 자동으로 스케일링되며, 서버리스 환경에서 운영됩니다.
- **Design your own cache**: 노드 유형, 크기, 개수를 선택하여 맞춤형 캐시를 생성합니다.
- 이번 글에서는 Design your own cache 옵션에 대해서 생성 과정을 알아보겠습니다.

## 4 Design your own cache

- 이 섹션에서는 사용자가 원하는 대로 ElastiCache 구성을 설정할 수 있습니다.

## 5 Creation method 선택

![[Pasted image 20240731114824.png]]

- 먼저 Creation method 선택합니다. 아래와 같은 방법이 제공됩니다.
	- **Easy create**: AWS에서 권장하는 최적의 설정을 사용하여 클러스터를 빠르게 생성합니다.
	- **Cluster cache**: 새 클러스터를 위한 모든 구성 옵션을 설정할 수 있습니다.
	- **Restore from backup**: 기존 .rdb 파일에서 데이터를 복원하여 클러스터를 생성합니다.
- Cluster cache를 선택하여 모든 설정을 직접 구성해봅시다.

## 6 Cluster mode 설정

- **Cluster mode** 옵션은 클러스터 모드를 활성화하거나 비활성화할 수 있습니다.
- **Enabled**:
	- 여러 샤드에 걸쳐 데이터 복제를 활성화하여 확장성과 가용성을 향상시킵니다.
	- 데이터를 최대 500개의 노드 그룹에 분할하여 성능을 개선할 수 있습니다.
	- 일부 명령어는 클러스터 모드에서 사용할 수 없습니다.
- **Disabled**:
	- Redis 클러스터는 하나의 샤드(노드 그룹)만 가지며, 최대 5개의 읽기 복제본을 포함합니다.

## 7 Cluster info 설정

![[Pasted image 20240731114918.png]]

- 클러스터의 이름을 지정합니다.

## 8 Location 설정

![[Pasted image 20240731114942.png]]

- Location 설정
	- AWS Cloud: ElastiCache 인스턴스를 AWS 클라우드에서 호스팅하는 옵션입니다. 기본적으로 이 옵션이 선택되어 있으며, AWS의 인프라를 사용하여 안정적이고 확장 가능한 환경을 제공합니다.
	- On premises: AWS Outposts를 통해 로컬 데이터 센터나 온프레미스 환경에서 ElastiCache 인스턴스를 배포하는 옵션입니다. 이 경우 먼저 Outpost에서 서브넷 ID를 생성해야
	  합니다.
- Multi-AZ 설정
	- Enable: 여러 가용 영역(AZ)에 걸쳐 자동 장애 조치(failover) 기능을 제공하여 고가용성을 보장합니다. 기본 노드에 장애가 발생하면 다른 AZ에 있는 읽기 복제본으로 자동 전환합니다.
- Auto-failover 설정
	- Enable: 주 노드가 장애를 겪을 경우, ElastiCache Auto Failover는 읽기 복제본으로의 자동 장애 조치를 통해 고가용성을 제공합니다. 이 옵션은 Multi-AZ 설정이 활성화된 경우
	  함께 활성화됩니다.

## 9 Cluster 설정

![[Pasted image 20240731115324.png]]

**Cluster Settings 설정**

- **Engine version**
	- Redis 엔진의 버전을 선택하는 옵션입니다.
	- 여기서는 Redis 7.1 버전을 선택했습니다.
	- Redis 버전은 사용하려는 기능과 호환성에 따라 선택할 수 있습니다.
- **Port**
	- 노드가 연결을 수락하는 포트 번호를 지정합니다.
	- 기본 포트 번호는 6379입니다.
	- 다른 애플리케이션과의 충돌을 피하기 위해 다른 포트를 지정할 수도 있습니다.
- **Parameter groups**
	- 노드와 클러스터의 런타임 속성을 제어하는 파라미터 그룹을 설정합니다.
	- 이 그룹은 Redis 인스턴스의 성능, 보안 설정 등을 정의할 수 있습니다.
- **Node type**
	- 배포할 노드 유형 및 해당 메모리 크기를 지정합니다.
	- 예를 들어, `cache.r7g.large`는 13.07 GiB 메모리와 최대 12.5 Gbps 네트워크 성능을 제공하는 노드 유형입니다.
	- 노드 유형은 성능 요구 사항과 예산에 따라 선택할 수 있습니다.
- **Number of shards**
	- 클러스터에 포함될 샤드의 수를 지정합니다.
	- 샤드는 데이터를 분할하여 저장하고 읽기 및 쓰기 작업을 병렬로 처리할 수 있게 합니다.
	- 여기서는 3개의 샤드를 설정했습니다
- **Replicas per shard**
	- 각 샤드당 생성할 복제본(리드 리플리카)의 수를 설정합니다.
	- 복제본은 읽기 성능을 향상시키고 데이터 가용성을 높이는 데 사용됩니다.
	- 이 예시에서는 샤드당 2개의 복제본을 설정했습니다.

## 10 연결 설정

- **Network type**: 클러스터가 지원할 IP 버전을 선택합니다.
	- **IPv4**: 클러스터가 IPv4 프로토콜을 통해서만 통신하도록 설정합니다.
	- **Dual stack (IPv4 & IPv6)**: 클러스터가 IPv4 및 IPv6 프로토콜을 모두 지원하도록 설정합니다.
- **Subnet groups**: 클러스터가 위치할 서브넷 그룹을 선택하거나 새로 생성합니다.
- **Associated subnets**: 클러스터가 위치할 서브넷과 가용 영역을 선택합니다.

## 11 Advanced Settings 설정

### 11.1 보안 설정

- **Encryption at rest**: 데이터가 디스크에 저장될 때 암호화하는 기능입니다. "Enable"을 선택하면 저장된 데이터가 암호화됩니다.
- **Encryption in transit**: 서비스와 클라이언트 간에 이동하는 데이터를 암호화합니다. "Enable"을 선택하여 활성화할 수 있습니다.
- **Security groups**: 보안 그룹은 클러스터에 대한 네트워크 접근을 제어하는 방화벽 역할을 합니다. "Manage" 버튼을 클릭하여 보안 그룹을 선택하거나 추가할 수 있습니다.

### 11.2 백업 설정

- **Enable automatic backups**: 자동 백업을 활성화하면 ElastiCache가 일일 백업을 생성하여 클러스터 데이터를 안전하게 보관합니다.
- **Backup retention period**: 자동 백업이 삭제되기 전 보관되는 기간을 설정합니다. 기본값은 1일입니다.
- **Backup window**: 자동 백업이 시작되는 일일 시간 범위를 지정합니다. "No preference"를 선택하면 AWS가 임의로 백업 시간을 설정합니다.

### 11.3 유지보수 설정

- **Maintenance window**: 운영 체제 패치, 드라이버 업데이트 및 소프트웨어 설치와 같은 업데이트가 수행되는 시간 범위를 설정합니다.
- **Auto upgrade minor versions**: 새로운 마이너 버전이 출시되면 클러스터를 자동으로 최신 마이너 버전으로 업그레이드하는 옵션입니다. 유지보수 창 동안에만 업그레이드가 진행됩니다.
- **Topic for Amazon SNS notification**: 유지보수 및 기타 중요한 이벤트에 대한 알림을 받을 SNS 주제를 선택하거나 ARN(Amazon Resource Name)을 입력합니다.
  알림을 받지 않으려면 "Disable notifications"를 선택합니다.

### 11.4 로그 설정

- **Slow logs**: 지정된 실행 시간을 초과하는 쿼리에 대한 Redis 느린 로그를 제공하는 옵션입니다.
- **Engine logs**: 쿼리가 지정된 실행 시간을 초과할 경우 엔진 로그를 제공합니다.