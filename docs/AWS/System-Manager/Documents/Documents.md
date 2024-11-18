## 1 AWS Systems Manager (SSM) Documents 소개

- AWS Systems Manager (SSM) Documents는 AWS 리소스를 관리하고 자동화하는 데 사용되는 구성 파일입니다.
- SSM Documents는 시스템 관리 작업을 정의하고 실행하는 데 필요한 정보를 포함하고 있습니다.
- 이를 통해 복잡한 관리 작업을 간소화하고 일관성 있게 수행할 수 있습니다.



## 2 SSM Documents의 구조

- SSM Documents는 JSON 또는 YAML 형식으로 작성됩니다.
- 주요 구성 요소는 다음과 같습니다:
	- 파라미터 (Parameters): 문서 실행 시 필요한 입력 값을 정의합니다.
	- 액션 (Actions): 실제로 수행할 작업을 정의합니다.
	- 스키마 버전 (Schema Version): 문서의 구조를 정의하는 버전 정보입니다.



## 3 SSM Documents의 종류

- AWS Systems Manager는 다양한 종류의 Documents를 제공합니다:
	- Command documents: 인스턴스에서 명령을 실행합니다.
	- Automation documents: 복잡한 작업을 자동화합니다.
	- Policy documents: 인스턴스의 상태를 정의하고 유지합니다.
	- Session documents: Session Manager 세션을 구성합니다.



## 4 SSM Documents 사용 예시

- 다음은 간단한 SSM Document 예시입니다:




**예시: 인스턴스에 소프트웨어 설치**

```yaml
schemaVersion: '2.2'
description: 'Install software on EC2 instance'
parameters:
  software:
    type: String
    description: 'Software package to install'
    default: 'htop'
mainSteps:
  - action: 'aws:runShellScript'
    name: 'installSoftware'
    inputs:
      runCommand:
        - 'sudo yum update -y'
        - 'sudo yum install -y {{ software }}'
```

- 이 Document는 EC2 인스턴스에 지정된 소프트웨어를 설치합니다.
- `parameters` 섹션에서 설치할 소프트웨어를 지정할 수 있습니다.
- `mainSteps` 섹션에서 실제 설치 명령을 정의합니다.



## 5 기존 AWS SSM Documents 활용

- AWS는 많은 미리 정의된 SSM Documents를 제공합니다.
- 이러한 Documents를 활용하면 일반적인 관리 작업을 쉽게 수행할 수 있습니다.
- 예를 들어, `AWS-RunPatchBaseline`은 인스턴스 패치 관리에 사용됩니다.



## 6 SSM Documents의 장점

- 일관성: 동일한 작업을 여러 리소스에 일관되게 적용할 수 있습니다.
- 자동화: 복잡한 작업을 자동화하여 인적 오류를 줄일 수 있습니다.
- 버전 관리: Documents의 버전을 관리하여 변경 사항을 추적할 수 있습니다.
- 재사용성: 한 번 작성한 Document를 여러 환경에서 재사용할 수 있습니다.



## 7 SSM Documents 생성 및 관리

- AWS Management Console, AWS CLI, 또는 AWS SDK를 통해 SSM Documents를 생성하고 관리할 수 있습니다.
- 다음은 AWS CLI를 사용하여 Document를 생성하는 예시입니다:



**SSM Document 생성 예시**

```bash
aws ssm create-document --content file://my-document.yaml --name "My-Custom-Document" --document-type "Command"
```

- 이 명령은 `my-document.yaml` 파일의 내용을 사용하여 "My-Custom-Document"라는 이름의 Command Document를 생성합니다.



## 8 SSM Documents 실행 방법

- SSM Documents는 여러 AWS Systems Manager 서비스와 통합되어 있어 다양한 방식으로 실행할 수 있습니다.
- 주요 실행 방법은 다음과 같습니다:
	- Run Command
	- State Manager
	- Maintenance Windows
	- Automation



## 9 Run Command를 사용한 SSM Documents 실행 예시

- Run Command는 SSM Documents를 실행하는 가장 일반적인 방법 중 하나입니다.
- 다음은 AWS Management Console에서 Run Command를 사용하여 SSM Document를 실행하는 과정입니다:

**과정**

1. AWS Systems Manager 콘솔에 접속합니다.
2. 왼쪽 메뉴에서 "Run Command"를 선택합니다.
3. "Run a command" 버튼을 클릭합니다.
4. Command document 목록에서 실행할 document를 선택합니다. (예: AWS-RunShellScript)
5. Command parameters 섹션에서 필요한 파라미터를 입력합니다.
6. Targets 섹션에서 명령을 실행할 인스턴스를 선택합니다.
7. 기타 옵션을 설정한 후 "Run" 버튼을 클릭하여 명령을 실행합니다.

- AWS CLI를 사용하여 Run Command로 SSM Document를 실행하는 예시는 다음과 같습니다:

**Run Command를 사용한 SSM Document 실행 예시 (CLI)**

```bash
aws ssm send-command \
    --document-name "AWS-RunShellScript" \
    --parameters commands=["echo Hello World"] \
    --targets "Key=instanceids,Values=i-1234567890abcdef0" \
    --comment "Run hello world script"
```

- 이 명령은 "AWS-RunShellScript" Document를 사용하여 지정된 EC2 인스턴스에서 "Hello World"를 출력하는 쉘 스크립트를 실행합니다.



## 10 결론

- AWS SSM Documents는 AWS 리소스 관리를 위한 강력한 도구입니다.
- JSON 또는 YAML 형식으로 작성되며, 파라미터와 액션을 정의하여 다양한 관리 작업을 수행할 수 있습니다.
- AWS에서 제공하는 미리 정의된 Documents를 활용하거나, 필요에 따라 커스텀 Documents를 생성할 수 있습니다.
- SSM Documents는 Run Command, State Manager, Maintenance Windows, Automation 등 다양한 SSM 서비스와 통합되어 있어 유연하게 실행할 수 있습니다.
- 이를 통해 복잡한 관리 작업을 자동화하고, 일관성 있게 수행할 수 있어 운영 효율성을 크게 향상시킬 수 있습니다.