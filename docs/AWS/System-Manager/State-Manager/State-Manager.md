## 1 AWS Systems Manager State Manager 소개

- AWS Systems Manager State Manager는 관리형 인스턴스(EC2 및 온프레미스 서버)를 사용자가 정의한 상태로 유지하는 프로세스를 자동화하는 강력한 도구입니다. 
- 이 서비스를 통해 인프라의 일관성을 유지하고, 구성 드리프트를 방지하며, 규정 준수를 보장할 수 있습니다.



## 2 State Manager의 주요 기능

### 2.1 상태 정의 및 유지

- State Manager를 사용하면 다음과 같은 상태를 정의하고 유지할 수 있습니다:
	- 특정 소프트웨어 패키지가 설치되어 있어야 함
	- 특정 포트(예: 22번 포트)가 닫혀 있어야 함
	- 안티바이러스 소프트웨어가 설치 및 실행 중이어야 함
	- 특정 구성 파일이 존재하고 올바른 내용을 포함해야 함
- 이러한 상태 정의를 통해 모든 관리형 인스턴스가 원하는 구성을 유지하도록 할 수 있습니다.



### 2.2 주요 사용 사례

- State Manager의 일반적인 사용 사례는 다음과 같습니다:
1. **인스턴스 부트스트래핑**: 새로운 인스턴스를 시작할 때 필요한 소프트웨어를 자동으로 설치하고 구성합니다.
2. **OS 및 소프트웨어 업데이트 스케줄링**: 정기적으로 운영 체제 패치와 소프트웨어 업데이트를 적용합니다.
3. **보안 설정 유지**: 방화벽 규칙, 사용자 권한 등의 보안 설정을 일관되게 유지합니다.
4. **구성 드리프트 방지**: 시간이 지남에 따라 발생할 수 있는 구성 변경을 감지하고 수정합니다.



## 3 State Manager Association

- State Manager의 핵심 개념은 "Association"입니다. 
- Association은 관리형 인스턴스에 유지하고자 하는 상태를 정의합니다.



### 3.1 Association의 구성 요소

- **대상 인스턴스**: Association을 적용할 인스턴스 또는 인스턴스 그룹
- **SSM Document**: 수행할 작업을 정의하는 문서
- **파라미터**: SSM Document에 전달할 파라미터
- **일정**: Association을 적용할 빈도 또는 특정 시간



### 3.2 Association 예시

다음은 CloudWatch 에이전트를 구성하는 Association의 예시입니다:

```json
{
  "name": "Configure-CW-Agent",
  "association": {
    "name": "Configure-CloudWatch-Agent",
    "instanceId": "*",
    "documentName": "AWS-ConfigureAWSPackage",
    "parameters": {
      "action": ["Install"],
      "name": ["AmazonCloudWatchAgent"]
    },
    "scheduleExpression": "cron(0 2 ? * SUN *)"
  }
}
```

- 이 Association은 모든 인스턴스에 CloudWatch 에이전트를 설치하고, 매주 일요일 오전 2시에 이 구성을 확인 및 적용합니다.



## 4 SSM Documents와 State Manager

- State Manager는 SSM Documents를 사용하여 수행할 작업을 정의합니다. 
- 이를 통해 다양한 구성 및 관리 작업을 수행할 수 있습니다.
- [[Documents]] 참고



### 4.1 사전 정의된 SSM Documents

- AWS는 다양한 일반적인 작업을 위한 사전 정의된 SSM Documents를 제공합니다. 예를 들면:
	- `AWS-ConfigureAWSPackage`: AWS 패키지 설치 및 구성
	- `AWS-UpdateSSMAgent`: SSM Agent 업데이트
	- `AWS-RunPatchBaseline`: 패치 적용



### 4.2 사용자 정의 SSM Documents

- 특정 요구 사항에 맞는 사용자 정의 SSM Documents를 생성할 수도 있습니다. 
- 이를 통해 복잡한 구성 작업이나 사용자 지정 스크립트를 실행할 수 있습니다.



## 5 State Manager의 장점

1. **일관성 유지**: 모든 관리형 인스턴스가 정의된 상태를 유지하도록 보장합니다.
2. **자동화**: 반복적인 관리 작업을 자동화하여 운영 효율성을 높입니다.
3. **규정 준수**: 보안 및 규정 준수 요구 사항을 지속적으로 충족시킵니다.
4. **유연성**: 다양한 구성 및 관리 작업을 수행할 수 있어 다양한 사용 사례에 적용 가능합니다.
5. **가시성**: Association의 적용 상태와 결과를 쉽게 모니터링할 수 있습니다.



## 6 실제 사용 예시

### 6.1 보안 설정 유지

다음은 모든 EC2 인스턴스의 22번 포트를 닫는 Association 예시입니다:

```json
{
  "name": "Close-Port-22",
  "association": {
    "name": "ClosePort22",
    "documentName": "AWS-RunShellScript",
    "targets": [{
      "key": "InstanceIds",
      "values": ["*"]
    }],
    "parameters": {
      "commands": [
        "iptables -A INPUT -p tcp --dport 22 -j DROP",
        "service iptables save"
      ]
    },
    "scheduleExpression": "rate(1 day)"
  }
}
```

- 이 Association은 매일 모든 EC2 인스턴스에서 실행되어 22번 포트가 닫혀 있는지 확인하고, 필요한 경우 포트를 닫습니다.



## 7 결론

- AWS Systems Manager State Manager는 관리형 인스턴스의 상태를 일관되게 유지하는 강력한 도구입니다. 
- Association을 통해 원하는 상태를 정의하고, SSM Documents를 사용하여 구체적인 작업을 지정할 수 있습니다. 
- 이를 통해 인프라의 일관성을 유지하고, 보안 및 규정 준수 요구사항을 충족시키며, 운영 효율성을 크게 향상시킬 수 있습니다. 
- State Manager를 효과적으로 활용하면 대규모 인프라 관리의 복잡성을 줄이고, 더 안정적이고 예측 가능한 환경을 유지할 수 있습니다.



**참고 자료**

- [AWS Systems Manager State Manager 공식 문서](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-state.html)
- [AWS Systems Manager State Manager Association 참조](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_CreateAssociation.html)