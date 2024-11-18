## 1 AWS CloudFormation Capabilities 소개

- AWS CloudFormation은 인프라를 코드로 관리할 수 있게 해주는 강력한 서비스입니다.
- CloudFormation 템플릿을 배포할 때 때로는 특별한 권한이 필요할 수 있습니다.
- 이러한 특별한 권한을 'Capabilities'라고 부릅니다.
- Capabilities는 템플릿이 특정 리소스를 생성하거나 수정할 수 있음을 명시적으로 인정하는 방법입니다.
- 이는 보안을 강화하고 의도치 않은 리소스 변경을 방지하는 데 도움이 됩니다.



## 2 CAPABILITY_IAM과 CAPABILITY_NAMED_IAM

- CAPABILITY_IAM과 CAPABILITY_NAMED_IAM은 IAM 리소스와 관련된 capabilities입니다.
- 이 capabilities는 CloudFormation 템플릿이 IAM 리소스를 생성하거나 수정할 때 필요합니다.
- IAM 리소스에는 IAM 사용자, 역할, 그룹, 정책, 액세스 키, 인스턴스 프로필 등이 포함됩니다.
- CAPABILITY_IAM은 일반적인 IAM 리소스 생성에 사용됩니다.
- CAPABILITY_NAMED_IAM은 이름이 지정된 IAM 리소스를 생성할 때 사용됩니다.
- 이 capabilities를 사용하면 템플릿이 중요한 IAM 리소스를 생성할 수 있음을 명시적으로 인정하게 됩니다.



## 3 CAPABILITY_AUTO_EXPAND

- CAPABILITY_AUTO_EXPAND는 템플릿에 매크로나 중첩 스택이 포함되어 있을 때 필요합니다.
- 매크로는 템플릿의 동적 변환을 수행하는 기능입니다.
- 중첩 스택은 스택 내에 다른 스택을 포함하는 구조를 말합니다.
- 이 capability를 사용하면 템플릿이 배포 전에 변경될 수 있음을 인정하는 것입니다.
- CAPABILITY_AUTO_EXPAND는 복잡한 인프라 구조를 더 유연하게 관리할 수 있게 해줍니다.



## 4 InsufficientCapabilitiesException

- InsufficientCapabilitiesException은 필요한 capabilities가 제공되지 않았을 때 발생하는 예외입니다.
- 이 예외는 보안 조치의 일환으로 CloudFormation에 의해 발생됩니다.
- 템플릿에 IAM 리소스나 매크로, 중첩 스택이 포함되어 있지만 해당 capabilities를 지정하지 않으면 이 예외가 발생합니다.
- 이 예외를 방지하려면 템플릿의 내용을 잘 파악하고 필요한 capabilities를 명시적으로 지정해야 합니다.



## 5 Capabilities 사용 방법

- AWS Management Console을 통해 스택을 생성하거나 업데이트할 때 capabilities를 지정할 수 있습니다.
- AWS CLI를 사용할 경우, `--capabilities` 옵션을 통해 필요한 capabilities를 지정할 수 있습니다.
- AWS SDK를 사용하는 경우, 스택 생성 또는 업데이트 API 호출 시 `capabilities` 파라미터를 설정할 수 있습니다.



## 6 Capabilities 사용 시 주의사항

- Capabilities는 템플릿에 실제로 필요한 경우에만 사용해야 합니다.
- 불필요한 capabilities를 지정하면 보안 위험이 증가할 수 있습니다.
- 템플릿의 내용을 충분히 검토하고 이해한 후에 적절한 capabilities를 선택해야 합니다.
- 특히 CAPABILITY_NAMED_IAM을 사용할 때는 생성되는 IAM 리소스의 이름을 신중히 검토해야 합니다.



## 7 결론

- AWS CloudFormation Capabilities는 인프라 관리의 안전성과 유연성을 높여줍니다.
- 적절한 capabilities를 사용함으로써 의도치 않은 리소스 변경을 방지하고 보안을 강화할 수 있습니다.
- 하지만 capabilities의 사용은 신중해야 하며, 항상 최소 권한 원칙을 따라야 합니다.
- CloudFormation을 효과적으로 사용하기 위해서는 capabilities의 개념을 잘 이해하고 적절히 활용하는 것이 중요합니다.