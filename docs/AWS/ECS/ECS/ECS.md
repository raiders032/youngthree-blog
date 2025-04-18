## 1 ECS

- Amazon Elastic Container Service(ECS)는 확장 가능하고 안전한 방식으로 컨테이너 실행을 단순화하는 관리형 서비스입니다.

### 1.1 Amazon ECS

- Amazon ECS는 AWS에서 제공하는 완전관리형 컨테이너 오케스트레이션 서비스입니다.
- 이를 통해 Amazon EC2 인스턴스 또는 AWS Fargate 인프라 집합인 클러스터에 컨테이너를 실행, 중지 및 관리할 수 있습니다.
- ECS를 사용하면 자체 컨테이너 오케스트레이션 소프트웨어를 설치, 운영 및 확장하거나, 가상 머신 클러스터를 관리 및 유지할 필요가 없습니다.

### 1.2 ECS의 주요 기능

- **AWS Fargate를 사용한 서버리스 아키텍처**
	- ECS는 Fargate 시작 유형을 제공하므로 서버나 클러스터를 관리할 필요 없이 컨테이너를 실행할 수 있습니다.
	- 이는 기본 인프라에 대해 걱정하는 대신 애플리케이션 코드에 집중할 수 있음을 의미합니다.
- **AWS 서비스와의 통합**
	- ECS는 Amazon RDS, Amazon S3, AWS Lambda 등의 다른 AWS 서비스와 원활하게 통합되므로 애플리케이션 요구 사항을 충족하는 포괄적인 클라우드 환경을 구축할 수 있습니다.
- **확장성 및 안정성**
	- ECS는 요구 사항에 따라 애플리케이션을 동적으로 확장하여 고가용성과 안정성을 보장합니다.
	- 또한 복원력을 높이기 위해 여러 가용 영역에 걸쳐 컨테이너 배포를 지원합니다.
- **보안**
	- ECS를 사용하면 Amazon VPC를 사용한 네트워크 격리, 리소스 수준 권한, 민감한 데이터 암호화 등 AWS의 강력한 보안 기능을 활용할 수 있습니다.
- **개발자 생산성**
	- ECS는 컨테이너 관리 및 배포를 단순화하므로 개발자는 인프라 관리보다 애플리케이션 개발에 더 집중할 수 있습니다.
- **Compute Savings Plan**
	- ECS를 사용할 때, Compute Savings Plan을 통해 비용을 절감할 수 있습니다.
	- 1년 또는 3년 기간 동안 일정 금액을 지불하여, ECS를 포함한 다양한 AWS 컴퓨팅 서비스에서 할인 혜택을 받을 수 있습니다.

## 2 Amazon ECS의 구성요소

- 기본적으로 Amazon ECS는 세 가지 주요 구성 요소로 구성됩니다.
	- Task
	- Service
	- Cluster
- **작업 정의(Task Definition)**
	- 이는 애플리케이션의 청사진으로, Docker 이미지, CPU 및 메모리 할당, 네트워킹 설정, 로깅 구성 등을 포함합니다.
	- Docker 컨테이너를 AWS에서 실행하는 것은 ECS 클러스터에서 ECS Task을 실행하는 것과 같습니다.
- **서비스(Service)**: 클러스터 전체에서 실행하고 유지 관리해야 하는 작업 인스턴스 수를 정의합니다. 로드 밸런싱, 서비스 검색 및 애플리케이션 확장을 처리할 수 있습니다.
- **클러스터(Cluster)**: 서비스가 실행되고 관리되는 EC2 인스턴스 또는 Fargate 작업의 논리적 그룹입니다.

## 3 ECS 클러스터(Cluster)

- Amazon ECS(Amazon Elastic Container Service)를 사용하기 위해서는 먼저 ECS 클러스터를 생성해야 합니다.
- ECS Cluster는 컨테이너를 실행할 EC2 인스턴스 또는 Fargate 인스턴스의 그룹입니다.
	- 이것이 배포의 기반이 됩니다.
- ECS 클러스터는 컨테이너화된 애플리케이션을 배포, 관리 및 확장하는 데 사용되는 논리적 단위입니다. ECS에는 두 가지 유형의 클러스터가 있습니다
	- Amazon EC2 Instances
	- AWS Fargate

**생성 화면**

![[Pasted image 20240228134743.png]]

### 3.1 EC2 클러스터

- EC2 클러스터를 사용하면 관리하는 Amazon EC2 인스턴스 클러스터에서 컨테이너화된 애플리케이션을 실행할 수 있습니다.
- EC2 클러스터를 선택하면 인프라, 즉 EC2 인스턴스를 프로비저닝하고 유지 관리해야 합니다.
- 이 시작 유형은 특정 CPU 및 메모리 구성에 맞게 최적화하고 스팟 인스턴스를 활용할 수 있으므로 기본 인프라 측면에서 가장 유연성을 제공합니다.
- 각 EC2 인스턴스는 ECS 클러스터에 등록되기 위해 ECS 에이전트를 실행해야 합니다.
- EC2 클러스터에서 Auto Scaling Group을 사용하면 인스턴스를 자동으로 조정하여 클러스터의 수요에 맞출 수 있습니다.

**장점**

- 제어 및 사용자 지정: EC2 인스턴스에 대한 완전한 제어를 통해 운영 체제, 인스턴스 유형 및 기본 호스트 네트워킹을 사용자 지정할 수 있습니다.
- 비용 최적화: 예약 인스턴스 및 스팟 인스턴스를 사용하면 상당한 비용 절감 효과를 얻을 수 있습니다.

**단점**

- 관리 오버헤드: EC2 인스턴스 패치, 확장, 보안을 포함한 더 많은 직접 관리가 필요합니다.
- 복잡성: AWS 및 컨테이너 오케스트레이션에 익숙한 사용자에게 더 적합합니다.

### 3.2 Fargate 클러스터

- Fargate는 서버나 클러스터를 관리할 필요가 없는 컨테이너용 서버리스 컴퓨팅 엔진입니다.
- Fargate를 사용하면 컨테이너에 대한 CPU 및 메모리 요구 사항을 지정하기만 하면 Fargate가 기본 인프라 프로비저닝 및 관리를 담당합니다.
- Fargate를 사용할 때는 EC2 인스턴스들이 여전히 사용되지만, 이러한 인스턴스들은 AWS에 의해 내부적으로 관리되고 사용자는 이에 대해 신경 쓰지 않아도 됩니다.
- 사용자는 컨테이너 수준에서의 리소스만을 관리하며, AWS가 백엔드에서 필요한 인프라를 처리합니다.

**장점**

- 오버헤드 감소: 서버나 클러스터를 관리할 필요가 없어 운영 복잡성이 줄어듭니다.
- 간편한 확장: 수요에 따라 컴퓨팅 리소스를 자동으로 확장합니다.
- 가격 절감: 컨테이너가 사용하는 컴퓨팅 및 메모리 리소스에 대해서만 비용을 지불합니다.

**단점**

- 낮은 제어: 기본 인프라 또는 호스트 구성에 대한 제어가 제한됩니다.
- 비용이 더 높을 수 있음: 서버리스 컴퓨팅에 최적화되지 않은 워크로드의 경우 비용이 더 많이 들 수 있습니다.

### 3.3 EC2와 Fargate 비교

| 기능    | EC2 클러스터              | Fargate 클러스터                |
|-------|-----------------------|-----------------------------|
| 인프라   | 수동으로 관리되는 EC2 인스턴스    | 서버리스, AWS 관리                |
| 제어    | 높음(OS, 인스턴스 유형 등)     | 낮음(작업 정의로 제한)               |
| 비용    | 변동(스팟/예약 인스턴스 사용 가능)  | 실행시간당 고정비율                  |
| 스케일링  | 수동 또는 Auto Scaling 그룹 | AWS에서 자동으로 관리               |
| 오버헤드  | 높음(인스턴스 관리 필요)        | 낮음(관리할 인스턴스 없음)             |
| 사용 사례 | 특정 구성이 필요한 애플리케이션     | 사용 편의성과 빠른 확장이 우선시되는 애플리케이션 |

### 3.4 올바른 실행 유형 선택

- EC2와 Fargate 시작 유형 중에서 선택하는 것은 특정 애플리케이션 요구 사항과 운영 기본 설정에 따라 다릅니다.
- **EC2 시작 유형**: 특정 유형의 EC2 인스턴스가 필요하거나, 환경에 대한 세부적인 제어가 필요하거나, 예약 또는 스팟 인스턴스를 통해 비용 절감의 이점을 누릴 수 있는 애플리케이션에 가장 적합합니다.
- **Fargate 시작 유형**: 서버 관리를 선호하지 않거나, 빠른 확장이 필요하거나, 워크로드가 가변적인 애플리케이션을 갖고 있고, 실제 사용량을 기반으로 한 간단한 가격 책정 모델을 원하는 사용자에게
  적합합니다.

## 4 작업 정의(Task Definition)

- 클러스터가 준비되면, 태스크 정의(Task Definition)를 생성해야 합니다.
- 태스크 정의는 ECS에서 컨테이너를 실행하는 방법에 대한 설명을 담고 있습니다.
- 태스크 정의를 생성할 때는 컨테이너의 요구 사항을 상세히 지정해야 하며, 이 정보를 바탕으로 ECS가 애플리케이션을 올바르게 배포하고 실행할 수 있습니다.

### 4.1 태스크 정의의 구성 요소

#### 4.1.1 런치 타입

- **런치 타입**: 태스크가 Fargate 또는 EC2 클러스터에서 실행될지를 지정합니다.
	- **Fargate**: 서버리스 컴퓨팅 환경에서 태스크를 실행합니다.
	- **EC2**: 관리되는 EC2 인스턴스 클러스터에서 태스크를 실행합니다.

#### 4.1.2 OS 아키텍처

- **OS 아키텍처**: 태스크가 실행될 운영 체제 아키텍처를 지정합니다. (예: Linux, Windows)

#### 4.1.3 네트워크 모드

- **네트워크 모드**: 컨테이너의 네트워크 모드를 지정합니다. (예: bridge, host, awsvpc)

#### 4.1.4 태스크 크기

- **CPU 및 메모리**: 태스크 전체에 할당할 CPU 및 메모리 양을 지정합니다.

#### 4.1.5 태스크 역할

- **태스크 역할**: ECS 태스크가 AWS 서비스에 접근할 수 있도록 하는 IAM 역할을 지정합니다.
- **실행 역할**: ECS 에이전트가 태스크를 시작하고 중지할 수 있도록 하는 IAM 역할을 지정합니다.

#### 4.1.6 컨테이너 설정

- **이름**: 컨테이너의 이름을 지정합니다.
- **이미지 URL**: 사용할 Docker 이미지를 지정합니다.
- **포트 매핑**: 컨테이너의 내부 포트와 호스트의 외부 포트를 연결합니다.
- **환경 변수**: 컨테이너 실행 시 필요한 환경 변수를 설정합니다.
- **리소스 제한**: 각 컨테이너에 할당할 CPU 및 메모리 양을 지정합니다.
- **로깅 설정**: 컨테이너의 로그를 CloudWatch Logs 등 외부 로그 관리 시스템에 전송할 수 있도록 설정합니다.

#### 4.1.7 스토리지 설정

- **EFS 볼륨**: Amazon Elastic File System(EFS)와 같은 외부 스토리지를 ECS 태스크에 연결할 수 있습니다.
- **Docker 볼륨**: Docker 데이터 볼륨을 사용하여 컨테이너 간에 데이터를 공유할 수 있습니다.

#### 4.1.8 예시

```yaml
{
  "family": "sample-task",
  "requiresCompatibilities": [ "FARGATE" ],
  "cpu": "256",
  "memory": "512",
  "networkMode": "awsvpc",
  "runtimePlatform": {
    "operatingSystemFamily": "LINUX"
  },
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "sample-container",
      "image": "amazon/amazon-ecs-sample",
      "cpu": 256,
      "memory": 512,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80
        }
      ],
      "environment": [
        {
          "name": "ENV_VAR",
          "value": "value"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sample-task",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "mountPoints": [
        {
          "sourceVolume": "efs-volume",
          "containerPath": "/mnt/efs"
        }
      ]
    }
  ],
  "volumes": [
    {
      "name": "efs-volume",
      "efsVolumeConfiguration": {
        "fileSystemId": "fs-12345678",
        "rootDirectory": "/"
      }
    }
  ]
}
```

## 6 통합

### 6.1 Amazon EventBridge

- Amazon Elastic Container Service(ECS)와 Amazon EventBridge를 통합하여 사용하면, 이벤트 기반 아키텍처를 구축하여 ECS 서비스나 작업을 자동으로 트리거할 수 있습니다.
- 이는 애플리케이션의 반응성과 확장성을 크게 향상시킬 수 있습니다.

**사례**

- 데이터 처리: S3에 새로운 데이터 파일이 업로드될 때마다 ECS에서 배치 데이터 처리 작업을 자동으로 실행합니다.
- 애플리케이션 배포: GitHub와 같은 코드 저장소에 새로운 코드가 푸시될 때마다 ECS에서 새 버전의 애플리케이션을 자동으로 배포합니다.
- 작업 스케줄링: 매일 밤 데이터 백업 작업을 실행하는 일정 기반 규칙을 설정합니다.

## 7 IAM Roles for ECS

### 7.1 EC2 Instance Profile (EC2 Launch Type only)

- EC2 인스턴스 프로필은 EC2 시작 유형을 사용하는 경우에만 적용됩니다.
- 이 프로필은 ECS 에이전트에 의해 사용됩니다.
- 주요 기능:
	- **ECS 서비스에 API 호출**: ECS 에이전트가 이 Role을 사용하여 ECS 서비스에 필요한 API 호출을 수행합니다.
	- **CloudWatch Logs에 컨테이너 로그 전송**: ECS 에이전트가 컨테이너 로그를 CloudWatch Logs로 전송하여 중앙에서 로그를 모니터링할 수 있습니다.
	- **ECR에서 Docker 이미지 가져오기**: 이 Role을 통해 ECS 에이전트는 Amazon Elastic Container Registry (ECR)에서 Docker 이미지를 가져올 수 있습니다.
	- **Secrets Manager 또는 SSM Parameter Store에서 민감한 데이터 참조**: ECS 에이전트는 이 Role을 사용하여 Secrets Manager나 SSM Parameter
	  Store에 저장된 민감한 데이터를 참조할 수 있습니다.

### 7.2 ECSTask Role

- ECSTask Role은 각 ECS 작업에 특정 Role을 할당할 수 있도록 합니다.
- 주요 기능:
	- **특정 Role 할당**: 각 작업은 자신에게 할당된 특정 Role을 사용하여 AWS 리소스에 액세스할 수 있습니다.
	- **다양한 Role 사용**: 여러 ECS 서비스를 실행하는 경우, 각 서비스에 대해 다른 Role을 사용할 수 있습니다.
	- **작업 정의에서 Role 정의**: 작업 Role은 작업 정의(task definition)에서 정의됩니다. 이를 통해 작업을 생성할 때 필요한 권한을 명확하게 설정할 수 있습니다.