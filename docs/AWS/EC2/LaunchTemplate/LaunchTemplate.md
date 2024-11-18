## 1 Launch Template이란?

- **Launch Template**은 EC2 인스턴스를 시작할 때 필요한 모든 설정을 저장한 템플릿입니다.
- 여러 Auto Scaling Group이나 인스턴스를 시작할 때 일관된 설정을 적용할 수 있습니다.
- Launch Template을 사용하면 설정 관리가 간편해지고, 인스턴스를 일관성 있게 배포할 수 있습니다.



## 2 Launch Template의 주요 구성 요소

- **AMI (Amazon Machine Image)**: EC2 인스턴스에서 사용할 운영 체제 및 소프트웨어 구성을 정의합니다.
- **인스턴스 유형**: 인스턴스의 CPU, 메모리, 네트워킹 성능 등을 설정합니다.
- **키 페어**: SSH를 통해 EC2 인스턴스에 접근할 수 있는 키 페어를 설정합니다.
- **보안 그룹**: 인스턴스의 트래픽을 제어하는 보안 규칙을 설정합니다.
- **네트워크 설정**: VPC, 서브넷, 퍼블릭 IP 등 네트워크 관련 설정을 정의합니다.
- **스토리지 설정**: 인스턴스에서 사용할 EBS 볼륨 등의 스토리지를 설정합니다.
- **고급 설정**: 스팟 인스턴스, 사용자 데이터 스크립트 등 추가적인 설정을 정의합니다.



## 3 Launch Template 생성 단계

### 3.1 AWS Management Console에서 Launch Template 생성

- **Step 1**: AWS Management Console에 로그인합니다.
- **Step 2**: EC2 대시보드로 이동합니다.
- **Step 3**: 왼쪽 메뉴에서 "Launch Templates"를 선택하고 "Create launch template" 버튼을 클릭합니다.



### 3.2 Launch Template 설정

#### 3.2.1 기본 정보 입력

- **Launch template name**: 템플릿의 이름을 입력합니다.
    - 예: `my-launch-template`
- **Template version description**: 템플릿 버전에 대한 설명을 입력합니다.
    - 예: `Initial version`



#### 3.2.2 Amazon Machine Image (AMI) 선택

- **AMI**: 사용할 AMI를 선택합니다.
    - 예: Amazon Linux 2 AMI



#### 3.2.3 인스턴스 유형 설정

- **Instance type**: 인스턴스 유형을 선택합니다.
    - 예: `t2.micro`



#### 3.2.4 키 페어 설정

- **Key pair**: EC2 인스턴스에 접근할 키 페어를 선택하거나 생성합니다.



#### 3.2.5 보안 그룹 설정

- **Security groups**: 인스턴스의 트래픽을 제어할 보안 그룹을 선택하거나 생성합니다.
    - 예: `default security group`



#### 3.2.6 네트워크 설정

- **Network settings**: VPC 및 서브넷을 선택합니다.
    - VPC: `my-vpc`
    - Subnet: `my-subnet`



#### 3.2.7 스토리지 설정

- **Storage (volumes)**: 인스턴스에서 사용할 EBS 볼륨을 설정합니다.
    - 예: 기본 8GB gp2 EBS 볼륨



#### 3.2.8 고급 설정

- **Purchasing options**: 스팟 인스턴스를 사용할 경우 설정합니다.
    - **Request Spot Instances**: 스팟 인스턴스를 요청할지 선택합니다.
- **User data**: 인스턴스 시작 시 실행할 사용자 데이터 스크립트를 추가합니다.
    - 예: 초기 설정 스크립트



### 3.3 Launch Template 생성 완료

- **Step 11**: 모든 설정을 완료한 후 "Create launch template" 버튼을 클릭하여 템플릿을 생성합니다.



## 4 Launch Template 활용하기

### 4.1 Auto Scaling Group과 함께 사용

- **Auto Scaling Group (ASG)**을 생성할 때, 생성한 Launch Template을 선택하여 일관된 설정으로 인스턴스를 시작할 수 있습니다.
- ASG 설정 시 Launch Template을 기반으로 온디맨드 및 스팟 인스턴스를 혼합하여 사용할 수 있습니다.

### 4.2 개별 인스턴스 시작

- EC2 대시보드에서 인스턴스를 시작할 때 Launch Template을 선택하여 일관된 설정으로 인스턴스를 배포할 수 있습니다.



## 5 마무리

- Launch Template을 사용하면 EC2 인스턴스를 시작할 때 필요한 설정을 간편하게 관리할 수 있습니다.
- 여러 인스턴스를 일관성 있게 배포할 수 있으며, Auto Scaling Group과 함께 사용하면 더욱 효율적으로 리소스를 관리할 수 있습니다.
- 이 가이드를 따라 Launch Template을 생성하고 활용하여 인프라를 최적화하십시오.