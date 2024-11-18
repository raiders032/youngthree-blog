## 1 AWS Auto Scaling Group Termination Policy 개요

- AWS Auto Scaling Group(ASG)은 인스턴스를 자동으로 확장하거나 축소하는 서비스입니다
- Termination Policy는 축소 이벤트 발생 시 어떤 인스턴스를 종료할지 결정하는 규칙입니다
- AWS는 Default Termination Policy와 함께 여러 가지 Predefined Termination Policy를 제공합니다
- 모든 Termination Policy는 Availability Zone 간의 균형을 우선적으로 고려합니다



## 2 Availability Zone 균형 유지

- ASG는 항상 Availability Zone 간의 균형 유지를 최우선으로 고려합니다
- Termination Policy의 적용 순서는 다음과 같습니다:
    - 가장 많은 인스턴스가 있는 Availability Zone을 식별합니다
    - 해당 Availability Zone 내에서 Scale-in Protection이 설정되지 않은 인스턴스를 찾습니다
    - 선택된 Availability Zone 내에서 Termination Policy를 적용합니다



## 3 Default Termination Policy의 동작 방식

- Default Termination Policy는 다음 순서로 인스턴스를 평가합니다:
- 1단계: 오래된 구성 확인
    - Launch Template 사용 그룹의 경우:
        - Launch Configuration을 사용하는 인스턴스 확인
        - 현재와 다른 Launch Template을 사용하는 인스턴스 확인
        - 현재 Launch Template의 가장 오래된 버전을 사용하는 인스턴스 확인
    - Launch Configuration 사용 그룹의 경우:
        - 가장 오래된 Launch Configuration을 사용하는 인스턴스 확인
- 2단계: 다음 Billing Hour 고려
    - 1단계에서 여러 인스턴스가 선택된 경우
    - 다음 Billing Hour에 가장 가까운 인스턴스를 선택
    - 동일한 조건의 인스턴스가 여러 개인 경우 무작위 선택



## 4 Mixed Instances Group에서의 Termination Policy

- Mixed Instances Group은 Spot Instance와 On-Demand Instance를 함께 사용하는 그룹입니다
- Mixed Instances Group에서는 다음과 같은 추가 기준이 적용됩니다:
    - Purchase Option(Spot/On-Demand) 비율을 유지하기 위한 Instance Type 선택
    - Availability Zone별 독립적인 Termination Policy 적용
    - Allocation Strategy에 따른 인스턴스 최적화



## 5 Predefined Termination Policies

- AWS는 다음과 같은 Predefined Termination Policy를 제공합니다:

- **Default**
    - Default Termination Policy를 사용합니다
    - 오래된 구성과 Billing Hour를 고려하여 종료할 인스턴스를 선택합니다
- **AllocationStrategy**
    - 남은 인스턴스들이 Allocation Strategy와 일치하도록 조정합니다
    - 선호하는 Instance Type이 변경되었을 때 유용합니다
    - Spot Instance의 분배를 최적화할 수 있습니다
- **OldestLaunchTemplate**
    - 가장 오래된 Launch Template을 사용하는 인스턴스를 종료합니다
    - 현재 사용하지 않는 Launch Template의 인스턴스를 우선 종료합니다
    - 구성 업데이트 시 이전 구성의 인스턴스를 단계적으로 제거할 때 유용합니다
- **OldestLaunchConfiguration**
    - 가장 오래된 Launch Configuration을 사용하는 인스턴스를 종료합니다
    - 구성 업데이트 시 이전 구성의 인스턴스를 단계적으로 제거할 때 유용합니다
- **ClosestToNextInstanceHour**
    - 다음 Billing Hour에 가장 가까운 인스턴스를 종료합니다
    - 시간당 요금이 부과되는 인스턴스의 사용을 최적화합니다
- **NewestInstance**
    - 그룹에서 가장 최근에 추가된 인스턴스를 종료합니다
    - 새로운 Launch Configuration을 테스트할 때 유용합니다
- **OldestInstance**
    - 그룹에서 가장 오래된 인스턴스를 종료합니다
    - Instance Type을 업그레이드할 때 유용합니다



## 6 Termination Policy 선택 시 고려사항

- Termination Policy 선택 시 다음 사항들을 고려해야 합니다:
    - Availability Zone 균형은 모든 Termination Policy보다 우선 적용됩니다
    - 새로운 Availability Zone이 추가되거나 불균형이 있는 경우, 더 최신 인스턴스가 먼저 종료될 수 있습니다
    - Instance Type 업그레이드나 구성 변경 시에는 적절한 Policy를 선택해야 합니다
    - 비용 최적화가 필요한 경우 ClosestToNextInstanceHour Policy를 고려합니다



## 7 결론

- ASG의 Termination Policy는 인프라 관리의 중요한 부분입니다
- 적절한 Termination Policy 선택으로 다음과 같은 이점을 얻을 수 있습니다:
    - 안정적인 애플리케이션 운영
    - 효율적인 리소스 관리
    - 비용 최적화
    - 원활한 인프라 업데이트
- 프로젝트의 요구사항을 고려하여 적절한 Termination Policy를 선택하는 것이 중요합니다