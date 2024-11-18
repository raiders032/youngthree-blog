## 1 AWS CloudFormation ChangeSets 소개

- AWS CloudFormation ChangeSets은 스택 업데이트 전에 변경 사항을 미리 확인할 수 있는 기능입니다.
- 실제 리소스를 변경하기 전에 어떤 변경이 일어날지 미리 검토할 수 있습니다.
- 이를 통해 의도하지 않은 리소스 변경이나 서비스 중단을 방지할 수 있습니다.



## 2 ChangeSets의 주요 특징

- ChangeSets은 스택 업데이트 전에 변경 사항을 시뮬레이션합니다.
- 실제 리소스에는 영향을 주지 않고 안전하게 변경 사항을 검토할 수 있습니다.
- 여러 개의 ChangeSets을 생성하여 다양한 업데이트 시나리오를 비교할 수 있습니다.
- 변경 사항이 마음에 들지 않으면 ChangeSet을 삭제하고 다시 생성할 수 있습니다.



## 3 ChangeSets이 보여주는 정보

- 리소스의 추가, 수정, 삭제 여부
- 리소스 속성의 변경 사항
- 리소스 대체 여부
	- 일부 속성 변경의 경우 리소스를 새로 생성하고 기존 리소스를 삭제해야 합니다.
	- 이러한 경우 서비스 중단이 발생할 수 있으므로 특히 주의가 필요합니다.
- 중첩 스택의 경우 모든 하위 스택의 변경 사항도 함께 표시됩니다.



## 4 ChangeSets의 한계

- ChangeSets은 변경 사항만 보여주고 실제 업데이트 성공 여부는 보장하지 않습니다.
- 다음과 같은 경우 업데이트가 실패할 수 있습니다:
	- IAM 권한 부족
	- 리소스 할당량 초과
	- 리소스 제약 조건 위반
	- 템플릿 오류
- 따라서 실제 업데이트 전에 템플릿 유효성 검사도 함께 수행하는 것이 좋습니다.



## 5 ChangeSets 사용 방법

- AWS Management Console, AWS CLI, AWS SDK를 통해 ChangeSets을 생성하고 관리할 수 있습니다.



**AWS CLI를 통한 ChangeSet 생성**

```bash
aws cloudformation create-change-set \
  --stack-name my-stack \
  --template-body file://template.yaml \
  --change-set-name my-change-set
```



**AWS CLI를 통한 ChangeSet 정보 조회**

```bash
aws cloudformation describe-change-set \
  --stack-name my-stack \
  --change-set-name my-change-set
```



**AWS CLI를 통한 ChangeSet 실행**

```bash
aws cloudformation execute-change-set \
  --stack-name my-stack \
  --change-set-name my-change-set
```



## 6 ChangeSets 사용 모범 사례

- 모든 스택 업데이트 전에 반드시 ChangeSets을 검토합니다.
- 중요한 변경사항의 경우 여러 팀원과 함께 ChangeSets을 리뷰합니다.
- 리소스 대체가 필요한 변경의 경우 서비스 영향도를 충분히 검토합니다.
- 프로덕션 환경 적용 전에 개발/스테이징 환경에서 먼저 테스트합니다.
- ChangeSets 실행 전에 백업이나 스냅샷을 생성하여 롤백 계획을 수립합니다.



## 7 결론

- ChangeSets은 CloudFormation 스택 업데이트의 안전성을 높여주는 중요한 기능입니다.
- 실제 변경 전에 영향도를 파악할 수 있어 위험을 최소화할 수 있습니다.
- 다만 업데이트 성공을 보장하지는 않으므로 충분한 테스트와 검증이 필요합니다.
- 프로덕션 환경에서는 반드시 ChangeSets을 통해 변경 사항을 검토하는 것이 좋습니다.