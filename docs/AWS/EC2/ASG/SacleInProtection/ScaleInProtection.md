## 1 Scale-in 보호 개요

- Scale-in 보호는 Auto Scaling Group(ASG)에서 어떤 인스턴스를 종료할 수 있는지 제어하는 기능입니다.
- 특히 컨테이너 기반 워크로드나 장시간 실행되는 작업을 보호하는 데 유용합니다.
- 기본적으로 ASG 생성 시에는 비활성화되어 있으며, ASG는 그룹 내 모든 인스턴스를 종료할 수 있습니다.



## 2 Scale-in 보호 메커니즘

### 2.1 보호 수준

#### 2.1.1 그룹 수준 보호

- ASG 수준에서 설정하는 기본 보호 메커니즘
- 새로 시작되는 모든 인스턴스에 자동으로 적용
- 인스턴스가 InService 상태가 되면 보호가 시작됨
- 기존 인스턴스에는 영향을 주지 않음



#### 2.1.2 인스턴스 수준 보호

- 개별 인스턴스에 대해 독립적으로 적용
- ASG의 설정과 관계없이 특정 인스턴스만 보호 가능
- 동적으로 활성화/비활성화 가능



## 3 Scale-in 보호의 제한사항

Scale-in 보호는 다음 상황에서는 인스턴스를 보호하지 않습니다:

1. 상태 확인 실패로 인한 교체
2. Spot 인스턴스 중단
3. Capacity Block 예약 종료
4. `terminate-instance-in-auto-scaling-group` 명령을 통한 수동 종료
5. EC2 콘솔, CLI, API를 통한 수동 종료

**참고**: EC2 수동 종료로부터 보호하려면 별도로 EC2 종료 보호를 활성화해야 합니다.



## 4 Scale-in 보호 구현

### 4.1 ASG 수준 설정

#### 4.1.1 AWS CLI를 사용한 설정

```bash
## 신규 인스턴스에 대한 Scale-in 보호 활성화
aws autoscaling update-auto-scaling-group \
    --auto-scaling-group-name my-asg \
    --new-instances-protected-from-scale-in
```



#### 4.1.2 Console을 통한 설정

1. EC2 콘솔의 Auto Scaling Groups 섹션 접근
2. 해당 ASG 선택
3. Details 탭에서 Advanced configurations 편집
4. "Enable instance scale-in protection" 옵션 선택



### 4.2 인스턴스 수준 설정

#### 4.2.1 AWS CLI를 사용한 설정

```bash
## 특정 인스턴스에 대한 Scale-in 보호 활성화
aws autoscaling set-instance-protection \
    --auto-scaling-group-name my-asg \
    --instance-ids i-1234567890abcdef0 \
    --protected-from-scale-in
```



#### 4.2.2 장기 실행 작업을 위한 프로그래밍 방식 구현

```python
import boto3
from botocore.exceptions import ClientError

def process_long_running_task():
    instance_id = get_instance_id()
    asg_name = get_asg_name()
    
    try:
        # Scale-in 보호 활성화
        enable_protection(instance_id, asg_name)
        
        # 장시간 실행되는 작업 수행 (예: SQS 메시지 처리)
        process_messages()  # 최대 12시간 소요
        
    finally:
        # 작업 완료 후 보호 해제
        disable_protection(instance_id, asg_name)

def enable_protection(instance_id, asg_name):
    client = boto3.client('autoscaling')
    response = client.set_instance_protection(
        InstanceIds=[instance_id],
        AutoScalingGroupName=asg_name,
        ProtectedFromScaleIn=True
    )
    return response
```



## 5 주의사항 및 고려사항

### 5.1 모든 인스턴스가 보호된 경우

- Scale-in 이벤트 발생 시 원하는 용량은 감소하지만 실제 종료는 불가능
- 활동 기록에 다음 메시지 표시:
  "Could not scale to desired capacity because all remaining instances are protected from scale in"



### 5.2 인스턴스 분리 및 재연결

- 보호된 인스턴스를 분리하면 보호 설정이 손실됨
- 재연결 시 현재 ASG의 보호 설정을 상속
- 웜 풀에서 이동하는 인스턴스도 ASG의 보호 설정을 상속



## 6 모범 사례

### 6.1 장기 실행 작업을 위한 설계

1. 작업 시작 전 보호 활성화
2. try-finally 블록을 사용한 안전한 보호 해제
3. 오류 처리 및 로깅 구현
4. 상태 모니터링 구현



### 6.2 권장 구현 패턴

```python
import boto3
import logging
from botocore.exceptions import ClientError

class TaskProcessor:
    def __init__(self):
        self.asg_client = boto3.client('autoscaling')
        self.instance_id = self.get_instance_id()
        self.asg_name = self.get_asg_name()
    
    def process_messages(self):
        try:
            self.enable_protection()
            logging.info("Scale-in protection enabled")
            
            # 메시지 처리 로직
            self.process_sqs_messages()
            
        except Exception as e:
            logging.error(f"Error during processing: {e}")
            raise
            
        finally:
            try:
                self.disable_protection()
                logging.info("Scale-in protection disabled")
            except ClientError as e:
                logging.error(f"Failed to disable protection: {e}")
```



## 7 문제 해결

### 7.1 일반적인 문제

- 보호 설정이 적용되지 않는 경우:
	- IAM 권한 확인
	- 인스턴스 상태 확인 (InService 상태여야 함)
	- API 호출 응답 확인
- 보호된 인스턴스가 종료되는 경우:
	- 종료 원인 파악 (상태 확인, Spot 중단 등)
	- CloudTrail 로그 확인
	- 활동 기록 검토



### 7.2 모니터링 및 알림

```bash
## CloudWatch 경보 설정
aws cloudwatch put-metric-alarm \
    --alarm-name ProtectedInstanceTermination \
    --metric-name GroupProtectedFromScaleIn \
    --namespace AWS/AutoScaling \
    --statistic Maximum \
    --period 300 \
    --threshold 0 \
    --comparison-operator LessThanThreshold \
    --evaluation-periods 1 \
    --alarm-actions [SNS_TOPIC_ARN]
```

이 가이드를 통해 Scale-in 보호 메커니즘을 효과적으로 구현하고 관리할 수 있습니다. 특히 SQS 메시지 처리와 같은 장시간 실행 작업에서 작업 중단을 방지하는 데 유용합니다.

