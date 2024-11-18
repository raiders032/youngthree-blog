## 1 Amazon ECS Task Definitions

- Amazon ECS Task Definitions은 컨테이너 애플리케이션의 구성을 정의하는 JSON 형식의 파일입니다.
- 각 태스크 정의에는 컨테이너 정의, 볼륨, 네트워크 모드, IAM 역할 등의 설정이 포함됩니다.
- ECS에서의 작업 정의(Task Definition)는 단순히 컨테이너가 어떻게 실행되어야 하는지를 설명하는 청사진(설계도) 역할을 합니다.
- 작업 정의 자체는 컨테이너를 실행하지 않으며, 실제 컨테이너 실행을 위해서는 작업 정의를 기반으로 작업(Task) 또는 서비스(Service)를 생성해야 합니다.



## 2 주요 구성 요소

### 2.1 컨테이너 정의(Container Definitions)

- **이미지**: 컨테이너에서 사용할 Docker 이미지의 이름과 태그를 지정합니다.
- **메모리 및 CPU**: 컨테이너에 할당할 메모리와 CPU 리소스를 정의합니다.
- **환경 변수**: 컨테이너 내에서 사용할 환경 변수를 설정할 수 있습니다.
- **포트 매핑**: 컨테이너의 내부 포트를 호스트 포트와 매핑하여 외부에서 접근할 수 있도록 합니다.
- **로깅 설정**: Amazon CloudWatch Logs와 같은 로깅 서비스에 컨테이너의 로그를 전송할 수 있도록 구성합니다.
- 태스크 정의(Task Definition)에서 최대 10개의 컨테이너를 정의할 수 있습니다.



## 3 볼륨(Volumes)

- **호스트 볼륨(Host Volume)**: 호스트 EC2 인스턴스의 파일 시스템을 컨테이너에 마운트하여 데이터를 공유합니다.
- **EFS 볼륨**: Amazon Elastic File System을 사용하여 여러 컨테이너에서 파일을 공유할 수 있습니다.



## 4 네트워크 모드(Network Mode)

- **브리지 모드(Bridge Mode)**: 기본 네트워크 모드로, 컨테이너와 호스트 간에 네트워크 연결을 설정합니다.
- **호스트 모드(Host Mode)**: 컨테이너와 호스트가 동일한 네트워크 네임스페이스를 공유합니다.
- **awsvpc 모드**: 컨테이너에 자체적인 네트워크 인터페이스와 고정 IP를 할당합니다.



## 5 IAM 역할(IAM Roles)

- **태스크 역할(Task Role)**
    - 컨테이너가 특정 AWS 서비스에 액세스할 수 있도록 권한을 부여하는 IAM 역할입니다.
    - 예를 들어, 컨테이너가 DynamoDB 테이블에 접근해야 한다면, 해당 작업을 수행할 수 있는 권한을 부여하는 역할을 할당합니다.
- **실행 역할(Execution Role)**
    - ECS 에이전트가 AWS API를 호출할 때 사용하는 IAM 역할입니다.
    - 예를 들어, 컨테이너 이미지를 Amazon ECR에서 가져오기 위한 권한을 포함할 수 있습니다.
    - 실행 역할은 ECS 태스크를 시작하고 모니터링하는 데 필요한 권한을 제공합니다.



## 6 Task Definition 생성 방법

### 6.1 AWS Management Console을 통한 생성

1. **ECS 대시보드로 이동**: AWS Management Console에서 "Elastic Container Service (ECS)"를 선택합니다.
2. **Task Definitions 선택**: 왼쪽 메뉴에서 "Task Definitions"를 선택하고, "Create new Task Definition" 버튼을 클릭합니다.
3. **런치 타입 선택**: 작업을 실행할 런치 타입을 선택합니다(Fargate 또는 EC2).
4. **세부 사항 입력**:
    - 태스크 정의 이름을 입력합니다.
    - 컨테이너 정의, 볼륨, 네트워크 모드, IAM 역할 등을 설정합니다.
5. **생성 완료**: 모든 설정을 완료한 후 "Create" 버튼을 클릭하여 태스크 정의를 생성합니다.



### 6.2 AWS CLI를 통한 생성

- AWS CLI를 사용하여 Task Definition을 생성할 수도 있습니다. JSON 파일을 작성하고 아래 명령어를 사용합니다:
	- `aws ecs register-task-definition --cli-input-json file://task-definition.json`
- **task-definition.json** 파일에는 컨테이너 정의, 메모리, CPU, 네트워크 설정 등이 포함되어야 합니다.



## 7 Best Practices

- **작은 이미지 사용**: 가능한 작은 Docker 이미지를 사용하여 배포 속도를 높이고 보안 위험을 줄입니다.
- **명확한 로깅 설정**: CloudWatch Logs를 사용하여 애플리케이션 로그를 중앙에서 모니터링할 수 있도록 구성합니다.
- **환경 변수의 안전한 관리**: 환경 변수를 통해 중요한 정보를 안전하게 전달하고, 필요에 따라 AWS Secrets Manager 또는 Parameter Store를 사용합니다.
- **리소스 할당 최적화**: 각 컨테이너에 필요한 최소한의 리소스만 할당하여 비용을 절감하고 효율성을 높입니다.



## 8 런치 타입

- **Fargate**: 서버리스 컨테이너 런치 타입으로, 인프라 관리를 필요로 하지 않습니다. AWS에서 자동으로 인프라를 관리합니다.
- **EC2**: 사용자 지정 또는 관리형 EC2 인스턴스에서 컨테이너를 실행합니다. 인프라 관리를 사용자가 직접 수행합니다.
- 한 개의 Task Definition에서 **Fargate**와 **EC2** 두 가지 런치 타입을 동시에 설정할 수 있습니다. 이를 통해 사용자는 다양한 작업에 적합한 인프라를 선택할 수 있습니다.



## 9 Amazon ECS – Load Balancing (EC2 Launch Type)

![[Pasted image 20240805104706.png]]

- **Dynamic Host Port Mapping**: 태스크 정의에서 컨테이너 포트만 정의한 경우 동적 호스트 포트 매핑이 가능합니다.
- **ALB의 역할**: ALB는 EC2 인스턴스에서 적절한 포트를 찾아 트래픽을 라우팅합니다.
- **보안 그룹 설정**: EC2 인스턴스의 보안 그룹에서 ALB의 보안 그룹에서 사용하는 모든 포트를 허용해야 합니다.



## 10 Amazon ECS – Load Balancing (Fargate)

![[Pasted image 20240805104718.png]]

- **고유한 프라이빗 IP**: 각 태스크는 고유한 프라이빗 IP를 가집니다.
- **컨테이너 포트 정의**: 호스트 포트는 적용되지 않으며 컨테이너 포트만 정의합니다.
- **예시**:
    - ECS ENI 보안 그룹: ALB에서 포트 80 허용.
    - ALB 보안 그룹: 웹에서 포트 80/443 허용.



**참고 자료**

- [ECS Task Definitions 관리](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html)