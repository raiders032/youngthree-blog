## 1 AWS Systems Manager (SSM) Patch Manager

- AWS Systems Manager (SSM) Patch Manager는 AWS 인프라의 패치 관리를 자동화하는 강력한 도구입니다.
- 이 서비스를 사용하면 대규모 EC2 인스턴스 그룹의 운영 체제와 애플리케이션 패치를 효율적으로 관리할 수 있습니다.
- Patch Manager를 통해 보안 업데이트를 신속하게 적용하고 시스템의 전반적인 보안 상태를 향상시킬 수 있습니다.



## 2 Patch Baseline 이해하기

- Patch Baseline은 인스턴스에 어떤 패치를 적용하고 어떤 패치를 제외할지 정의하는 규칙 집합입니다.
- AWS는 다양한 운영 체제에 대한 사전 정의된 Patch Baseline을 제공합니다.
- 사용자는 자신의 요구사항에 맞는 사용자 정의 Patch Baseline을 생성할 수도 있습니다.



## 3 사전 정의된 Patch Baseline

- AWS에서 관리하는 사전 정의된 Patch Baseline은 다양한 운영 체제를 지원합니다.
- 이러한 기본 Baseline은 수정할 수 없지만, 대부분의 일반적인 패치 관리 요구사항을 충족합니다.
- AWS-RunPatchBaseline이라는 SSM 문서를 사용하여 운영 체제와 애플리케이션 패치를 모두 적용할 수 있습니다.



**AWS-RunPatchBaseline 사용 예시**

```bash
aws ssm send-command --document-name "AWS-RunPatchBaseline" --targets "Key=instanceids,Values=i-1234567890abcdef0" --parameters "Operation=Install"
```

- 이 명령은 지정된 EC2 인스턴스에 대해 패치 설치 작업을 실행합니다.



## 4 사용자 정의 Patch Baseline 생성

- 사용자 정의 Patch Baseline을 생성하여 특정 요구사항에 맞는 패치 관리 전략을 구현할 수 있습니다.
- 이를 통해 다음과 같은 사항을 지정할 수 있습니다:
  - 대상 운영 체제
  - 허용할 패치 목록
  - 거부할 패치 목록
  - 대체 패치 저장소 등



**사용자 정의 Patch Baseline 생성 예시**

```bash
aws ssm create-patch-baseline --name "MyCustomPatchBaseline" --operating-system "WINDOWS" --approval-rules "PatchRules=[{PatchFilterGroup={PatchFilters=[{Key=PRODUCT,Values=[WindowsServer2016]},{Key=CLASSIFICATION,Values=[CriticalUpdates,SecurityUpdates]}]},ApproveAfterDays=7}]"
```

- 이 명령은 Windows Server 2016에 대한 중요 업데이트와 보안 업데이트를 7일 후에 자동 승인하는 사용자 정의 Patch Baseline을 생성합니다.



## 5 Patch Group 활용하기

- Patch Group은 특정 Patch Baseline과 연결된 인스턴스 집합입니다.
- 이를 통해 다양한 환경(예: 개발, 테스트, 프로덕션)에 대해 서로 다른 패치 전략을 적용할 수 있습니다.
- Patch Group을 사용하려면 다음 사항을 고려해야 합니다:
  - 인스턴스에 'Patch Group'이라는 태그 키를 사용하여 태그를 지정해야 합니다.
  - 하나의 인스턴스는 하나의 Patch Group에만 속할 수 있습니다.
  - 하나의 Patch Group은 하나의 Patch Baseline에만 등록될 수 있습니다.


**EC2 인스턴스에 Patch Group 태그 추가 예시**

```bash
aws ec2 create-tags --resources i-1234567890abcdef0 --tags Key=Patch Group,Value=Production
```

- 이 명령은 지정된 EC2 인스턴스에 'Production'이라는 값을 가진 'Patch Group' 태그를 추가합니다.



## 6 패치 적용 프로세스

- Patch Manager의 패치 적용 프로세스는 다음과 같은 단계로 이루어집니다:
  1. AWS 콘솔, SDK, 또는 CLI를 통해 패치 적용 명령을 실행합니다.
  2. SSM Agent가 대상 인스턴스의 패치 기준선을 쿼리합니다.
  3. Patch Manager가 적용 가능한 패치를 결정합니다.
  4. 패치가 인스턴스에 설치됩니다.
  5. 필요한 경우 인스턴스가 재부팅됩니다.
  6. 패치 적용 결과가 보고됩니다.



## 7 Maintenance Windows 활용

- Maintenance Windows를 사용하여 패치 적용 일정을 예약할 수 있습니다.
- 이를 통해 업무 시간 외에 패치를 적용하거나, 정기적인 패치 일정을 설정할 수 있습니다.
- Rate Control을 사용하여 동시에 패치를 적용할 수 있는 대상의 최대 수나 비율을 지정할 수 있습니다.



**Maintenance Window 생성 예시**

```bash
aws ssm create-maintenance-window --name "Weekly-Patch-Window" --schedule "cron(0 2 ? * SUN *)" --duration "PT4H" --allow-unassociated-targets --cutoff "PT30M"
```

- 이 명령은 매주 일요일 새벽 2시에 시작하여 최대 4시간 동안 실행되는 Maintenance Window를 생성합니다.



## 8 결론

- AWS Systems Manager Patch Manager는 대규모 인프라의 패치 관리를 간소화하고 자동화하는 강력한 도구입니다.
- Patch Baseline, Patch Group, Maintenance Windows 등의 기능을 활용하여 효율적이고 안전한 패치 관리 전략을 구현할 수 있습니다.
- 이를 통해 시스템의 보안을 강화하고, 운영 효율성을 높일 수 있습니다.
- AWS CLI나 SDK를 사용하여 패치 관리 프로세스를 더욱 자동화하고 프로그래밍 방식으로 제어할 수 있습니다.