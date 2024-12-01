## 1 EKS

- Amazon Elastic Kubernetes Service(EKS)는 AWS에서 완전관리형 Kubernetes 클러스터를 실행할 수 있도록 도와주는 서비스입니다.
- Amazon EKS는 Kubernetes 클러스터를 쉽게 설치, 운영 및 확장할 수 있도록 지원하는 관리형 서비스입니다.
- EKS는 Kubernetes 마스터 노드를 자동으로 관리하고, 고가용성 및 보안을 보장합니다.
- EKS는 필요에 따라 클러스터를 자동으로 확장 및 축소할 수 있습니다.
- **EKS와 ECS의 차이점**
	- EKS는 Kubernetes API를 사용하고, ECS는 AWS 독점 API를 사용합니다. 
	- 두 서비스는 유사한 목표를 가지고 있지만, 사용 방식이 다릅니다.
- **EC2 및 Fargate 지원**
	- EKS는 EC2 인스턴스와 Fargate를 통해 워커 노드를 배포할 수 있습니다. 
	- EC2는 관리형 인프라를 제공하고, Fargate는 서버리스 컨테이너를 배포합니다.
- **사용 사례**
	- 회사가 온프레미스 또는 다른 클라우드에서 Kubernetes를 이미 사용 중이거나 AWS로 마이그레이션하려는 경우 EKS를 사용하면 좋습니다.
- **클라우드 독립성**
	- Kubernetes는 클라우드에 종속되지 않으며, Azure, GCP 등 다양한 클라우드에서 사용할 수 있습니다.
- **멀티 리전 배포**
	- 여러 리전에 걸쳐 애플리케이션을 배포하려면 각 리전에 EKS 클러스터를 생성해야 합니다.
- **로그 및 메트릭 수집**
	- CloudWatch Container Insights를 사용하여 로그와 메트릭을 수집할 수 있습니다.



## 2 EKS의 주요 기능

- **고가용성**: EKS는 여러 가용 영역에 걸쳐 클러스터를 분산시켜 고가용성을 보장합니다.
- **자동 업데이트**: EKS는 Kubernetes 버전 및 패치를 자동으로 업데이트하여 클러스터를 항상 최신 상태로 유지합니다.
- **통합된 서비스**: EKS는 AWS의 다양한 서비스와 통합되어 있습니다. 예를 들어, IAM을 통한 권한 관리, VPC를 통한 네트워크 설정, CloudWatch를 통한 모니터링 등이 가능합니다.
- **보안**: EKS는 데이터 평문 전송 방지, IAM을 통한 세분화된 권한 제어, 그리고 AWS WAF 및 Shield를 통한 애플리케이션 보호를 제공합니다.



## 3 EKS 클러스터 구성 요소

- **Kubernetes 마스터**: EKS는 관리형 Kubernetes 마스터를 제공하여 클러스터 관리의 복잡성을 줄입니다.
- **노드 그룹**: EKS 클러스터는 EC2 인스턴스로 구성된 노드 그룹으로 확장할 수 있습니다. EKS는 또한 AWS Fargate를 지원하여 서버리스 방식으로 노드를 관리할 수 있습니다.
- **Fargate 지원**: EKS는 Fargate를 통해 서버리스 Kubernetes를 지원하며, 이를 통해 노드 프로비저닝 및 관리에 대한 부담을 줄일 수 있습니다.
- **IAM 통합**: EKS는 IAM과 통합되어 클러스터와 Kubernetes 리소스에 대한 액세스를 세분화하여 제어할 수 있습니다.



## 4 EKS의 장점

- **관리의 용이성**: EKS는 Kubernetes 클러스터 관리의 복잡성을 줄여줍니다. AWS가 마스터 노드를 관리하므로 사용자는 애플리케이션 실행에만 집중할 수 있습니다.
- **보안 및 규정 준수**: EKS는 AWS의 보안 표준을 준수하며, IAM 통합을 통해 세분화된 권한 관리를 제공합니다.
- **유연성**: EKS는 EC2 인스턴스와 Fargate를 모두 지원하여 다양한 워크로드에 유연하게 대응할 수 있습니다.
- **비용 효율성**: 필요에 따라 클러스터를 자동으로 확장 및 축소할 수 있어 비용을 최적화할 수 있습니다.



## 5 EKS 사용 사례

- **마이크로서비스 아키텍처**: EKS는 마이크로서비스를 관리하고 배포하는 데 적합합니다.
- **데이터 처리**: 대규모 데이터 처리 작업을 자동으로 확장 및 축소하여 효율적으로 관리할 수 있습니다.
- **CI/CD 파이프라인**: EKS를 사용하여 지속적인 통합 및 배포 파이프라인을 설정할 수 있습니다.
- **하이브리드 애플리케이션**: 온프레미스와 클라우드 환경을 통합하여 하이브리드 애플리케이션을 관리할 수 있습니다.



## 6 EKS 노드 유형

- **Managed Node Groups**:
    - 노드를 자동으로 생성 및 관리합니다(EC2 인스턴스).
    - 노드는 EKS가 관리하는 Auto Scaling Group의 일부입니다.
    - On-Demand 또는 Spot Instances를 지원합니다.
- **Self-Managed Nodes**:
    - 사용자가 직접 노드를 생성하고 EKS 클러스터에 등록하여 관리합니다.
    - Amazon EKS Optimized AMI를 사용할 수 있습니다.
    - On-Demand 또는 Spot Instances를 지원합니다.
- **AWS Fargate**:
    - 유지보수가 필요 없으며, 노드를 관리하지 않습니다.



## 7 EKS 데이터 볼륨

- **StorageClass 매니페스트**: EKS 클러스터에서 StorageClass 매니페스트를 지정해야 합니다.
- **Container Storage Interface(CSI) 드라이버**: CSI 호환 드라이버를 사용합니다.
- **지원 스토리지**:
    - Amazon EBS
    - Amazon EFS(Fargate와 함께 사용 가능)
    - Amazon FSx for Lustre
    - Amazon FSx for NetApp ONTAP