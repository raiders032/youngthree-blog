## 1 CloudFormation Drift Detection 개요

- AWS CloudFormation은 인프라를 코드로 관리할 수 있게 해주는 서비스입니다.
- 하지만 CloudFormation으로 생성된 리소스가 수동으로 변경되는 것을 완벽하게 막을 수는 없습니다.
- 이러한 수동 변경 사항을 탐지하고 관리하기 위해 AWS는 Drift Detection 기능을 제공합니다.
- Drift Detection은 실제 리소스의 현재 상태와 템플릿에 정의된 기대 상태를 비교하여 차이점을 찾아냅니다.



## 2 Drift Detection의 중요성

- 인프라의 일관성을 유지하기 위해서는 모든 변경사항이 CloudFormation을 통해 이루어져야 합니다.
- 수동 변경은 다음과 같은 문제를 일으킬 수 있습니다:
	- 환경의 일관성 저하
	- 버전 관리의 어려움
	- 재현 가능한 배포의 어려움
	- 예기치 않은 동작 발생
- Drift Detection을 통해 이러한 문제들을 조기에 발견하고 해결할 수 있습니다.



## 3 Stack 수준의 Drift Detection

- CloudFormation Stack 전체 또는 개별 리소스에 대해 Drift Detection을 수행할 수 있습니다.
- Stack 수준의 Drift Detection은 다음과 같은 특징이 있습니다:
	- 전체 스택의 모든 리소스를 한 번에 검사합니다
	- 변경된 리소스의 상세 정보를 제공합니다
	- 템플릿과 실제 구성의 차이점을 시각적으로 보여줍니다



## 4 StackSet의 Drift Detection

- StackSet은 여러 AWS 계정과 리전에 걸쳐 스택을 관리할 수 있게 해주는 기능입니다.
- StackSet의 Drift Detection은 다음과 같이 작동합니다:
	- StackSet에 속한 모든 스택 인스턴스에 대해 Drift Detection을 수행합니다
	- 하나의 리소스라도 변경되었다면 해당 스택은 'drifted' 상태가 됩니다
	- 하나의 스택이라도 'drifted' 상태라면 StackSet 전체가 'drifted' 상태가 됩니다



## 5 Drift 상태의 종류

- CloudFormation은 다음과 같은 Drift 상태를 제공합니다:
	- DRIFTED: 리소스가 템플릿과 다르게 변경됨
	- IN_SYNC: 리소스가 템플릿과 일치함
	- DELETED: 리소스가 삭제됨
	- MODIFIED: CloudFormation을 통해 정상적으로 변경됨
	- NOT_CHECKED: Drift Detection이 수행되지 않음



## 6 Drift Detection 활용 예시

**AWS CLI를 사용한 Drift Detection 실행**

```bash
aws cloudformation detect-stack-drift --stack-name my-stack
```



**AWS CLI를 사용한 Drift Detection 결과 확인**

```bash
aws cloudformation describe-stack-resource-drifts --stack-name my-stack
```



## 7 Drift Detection 모범 사례

- 정기적인 Drift Detection 실행:
	- 주기적으로 Drift Detection을 실행하여 변경사항을 조기에 발견합니다
	- 자동화된 스크립트를 통해 정기적인 검사를 수행할 수 있습니다
- 변경 사항 관리:
	- 발견된 Drift는 가능한 빨리 해결하여 인프라의 일관성을 유지합니다
	- 모든 변경은 CloudFormation 템플릿을 통해 이루어지도록 합니다
- 모니터링 및 알림:
	- CloudWatch Events를 사용하여 Drift 발생 시 알림을 받을 수 있습니다
	- 심각한 Drift는 즉시 대응할 수 있도록 설정합니다



## 8 제한 사항 및 주의사항

- CloudFormation을 통한 직접적인 스택 변경은 Drift로 간주되지 않습니다
- 일부 리소스 속성은 Drift Detection에서 제외될 수 있습니다
- StackSet의 Drift Detection은 추가 비용이 발생할 수 있습니다
- 대규모 스택의 경우 Drift Detection에 상당한 시간이 소요될 수 있습니다



## 9 결론

- CloudFormation Drift Detection은 인프라의 일관성을 유지하는 데 필수적인 도구입니다
- 정기적인 Drift Detection을 통해 예기치 않은 변경을 조기에 발견할 수 있습니다
- 발견된 Drift는 신속하게 해결하여 인프라의 신뢰성을 유지해야 합니다
- 체계적인 Drift 관리 전략을 수립하여 인프라의 안정성을 확보할 수 있습니다