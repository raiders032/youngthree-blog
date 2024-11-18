## 1 AWS EC2의 Shutdown Behavior와 Termination Protection

- AWS EC2 인스턴스를 사용할 때 알아두면 유용한 두 가지 중요한 기능이 있습니다.
- 바로 Shutdown Behavior와 Termination Protection입니다.
- 이 두 기능은 EC2 인스턴스의 종료 방식과 보호에 관련된 설정입니다.
- 이 글에서는 각 기능의 동작 방식과 주의할 점에 대해 자세히 알아보겠습니다.



## 2 Shutdown Behavior

- Shutdown Behavior는 EC2 인스턴스의 운영 체제(OS)에서 종료 명령을 실행했을 때 인스턴스가 어떻게 반응할지를 결정하는 설정입니다.
- 이 설정은 두 가지 옵션을 제공합니다: 'Stop'과 'Terminate'입니다.
- 기본값은 'Stop'으로 설정되어 있습니다.



## 3 Shutdown Behavior 옵션

### 3.1 Stop (기본값)

- 'Stop' 옵션을 선택하면, OS에서 종료 명령을 실행했을 때 EC2 인스턴스가 중지됩니다.
- 중지된 인스턴스는 나중에 다시 시작할 수 있습니다.
- 이 옵션은 인스턴스의 데이터를 보존하고 싶을 때 유용합니다.



### 3.2 Terminate

- 'Terminate' 옵션을 선택하면, OS에서 종료 명령을 실행했을 때 EC2 인스턴스가 완전히 종료됩니다.
- 종료된 인스턴스는 영구적으로 삭제되며, 더 이상 사용할 수 없게 됩니다.
- 이 옵션은 인스턴스를 더 이상 사용하지 않을 때 유용합니다.



## 4 Shutdown Behavior 주의사항

- Shutdown Behavior 설정은 AWS 콘솔에서 인스턴스를 종료할 때는 적용되지 않습니다.
- 이 설정은 오직 EC2 인스턴스의 운영 체제 내에서 종료 명령을 실행할 때만 적용됩니다.
- AWS CLI에서는 'InstanceInitiatedShutdownBehavior' 속성을 통해 이 설정을 제어할 수 있습니다.



## 5 Termination Protection

- Termination Protection은 EC2 인스턴스가 실수로 종료되는 것을 방지하는 기능입니다.
- 이 기능을 활성화하면 AWS 콘솔이나 CLI를 통해 인스턴스를 종료하려고 할 때 추가적인 확인 단계가 필요합니다.
- Termination Protection은 특히 중요한 인스턴스를 보호하는 데 유용합니다.



## 6 Termination Protection 동작 방식

- Termination Protection이 활성화된 인스턴스를 종료하려고 하면, AWS는 경고 메시지를 표시합니다.
- 인스턴스를 종료하려면 먼저 Termination Protection을 비활성화해야 합니다.
- 이 추가적인 단계는 실수로 인한 데이터 손실을 방지하는 데 도움이 됩니다.



## 7 Shutdown Behavior와 Termination Protection의 상호작용

- Shutdown Behavior와 Termination Protection은 서로 다른 상황에서 작동하는 별개의 기능입니다.
- 주의해야 할 중요한 점이 있습니다:
	- Shutdown Behavior가 'Terminate'로 설정되어 있고, Termination Protection이 활성화되어 있더라도,
	- 운영 체제 내에서 종료 명령을 실행하면 인스턴스는 여전히 종료됩니다.
- 이는 Termination Protection이 AWS 콘솔이나 CLI를 통한 종료만을 방지하기 때문입니다.



## 8 실제 사용 예시

- 다음과 같은 상황을 가정해 보겠습니다:
  - EC2 인스턴스의 Shutdown Behavior가 'Terminate'로 설정되어 있습니다.
  - Termination Protection이 활성화되어 있습니다.
  - 이 상태에서 운영 체제 내에서 종료 명령을 실행하면 어떻게 될까요?

**결과**
```
인스턴스는 종료됩니다!
```

- 이는 Termination Protection이 OS 내에서의 종료 명령에는 영향을 미치지 않기 때문입니다.
- Shutdown Behavior 설정이 'Terminate'로 되어 있어 OS에서의 종료 명령이 인스턴스를 완전히 종료시킵니다.



## 9 모범 사례

- 중요한 EC2 인스턴스의 경우:
  - Shutdown Behavior를 'Stop'으로 설정하세요.
  - Termination Protection을 활성화하세요.
- 이렇게 설정하면 실수로 인한 데이터 손실을 최소화할 수 있습니다.
- 정기적으로 중요한 데이터를 백업하는 것도 잊지 마세요.



## 10 결론

- Shutdown Behavior와 Termination Protection은 EC2 인스턴스를 안전하게 관리하는 데 중요한 기능입니다.
- 두 기능의 차이점과 상호작용을 이해하는 것이 중요합니다.
- 적절히 설정하면 의도치 않은 인스턴스 종료와 데이터 손실을 방지할 수 있습니다.
- AWS 서비스를 사용할 때는 항상 보안과 데이터 보호를 최우선으로 고려해야 합니다.