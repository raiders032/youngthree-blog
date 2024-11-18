## 1 Amazon EBS(Elastic Block Store) 모니터링

- Amazon EBS는 EC2 인스턴스에 연결하여 사용하는 블록 스토리지 서비스입니다.
- EBS 볼륨의 성능과 상태를 모니터링하는 것은 시스템 안정성을 위해 매우 중요합니다.
- AWS는 CloudWatch를 통해 EBS 볼륨의 다양한 메트릭을 모니터링할 수 있는 기능을 제공합니다.



## 2 EBS 모니터링을 위한 도구

- AWS는 EBS 모니터링을 위한 두 가지 주요 도구를 제공합니다:
	- CloudWatch 기본 모니터링: EBS 볼륨의 기본적인 메트릭을 수집
	- CloudWatch Agent: 더 상세한 시스템 수준의 메트릭을 수집



## 3 CloudWatch 기본 모니터링

### 3.1 기본 메트릭

- EBS 볼륨은 기본적으로 다음과 같은 메트릭을 CloudWatch에 자동으로 전송합니다
- VolumeReadBytes: 읽기 작업의 바이트 수
- VolumeWriteBytes: 쓰기 작업의 바이트 수
- VolumeReadOps: 읽기 작업의 수
- VolumeWriteOps: 쓰기 작업의 수
- VolumeTotalReadTime: 읽기 작업에 소요된 총 시간
- VolumeTotalWriteTime: 쓰기 작업에 소요된 총 시간
- VolumeIdleTime: I/O 요청이 없었던 총 시간
- VolumeQueueLength: 대기 중인 I/O 요청의 수
- VolumeThroughputPercentage: 프로비저닝된 IOPS 대비 사용된 IOPS의 비율
- VolumeConsumedReadWriteOps: 프로비저닝된 IOPS 볼륨에서 소비된 I/O 작업의 수



## 4 CloudWatch Agent를 통한 상세 모니터링

### 4.1 Agent 설치 필요성

- 디스크 공간 사용량과 같은 운영체제 수준의 메트릭을 수집하려면 CloudWatch Agent 설치가 필요합니다.
- CloudWatch Agent는 다음과 같은 추가 메트릭을 수집할 수 있습니다
- 디스크 사용량 (used, free, total)
- 디스크 I/O 성능
- 메모리 사용량
- CPU 사용량
- 네트워크 성능



### 4.2 Agent 설치 및 구성

**CloudWatch Agent 설치 명령어**

```bash
wget https://s3.amazonaws.com/amazoncloudwatch-agent/linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```



**Agent 구성 파일 예시**

```json
{
  "metrics": {
    "metrics_collected": {
      "disk": {
        "measurement": [
          "used_percent",
          "used",
          "free"
        ],
        "resources": [
          "*"
        ]
      }
    }
  }
}
```

- 위 구성은 모든 디스크의 사용량 정보를 수집하도록 설정합니다.
- `resources: ["*"]`는 모든 디스크를 모니터링하겠다는 의미입니다.



## 5 CloudWatch 알람 설정

### 5.1 단일 메트릭 알람

- 하나의 메트릭에 대해 임계값을 설정하고 알람을 생성할 수 있습니다.
- 예를 들어, 디스크 사용량이 80%를 초과할 때 알람을 설정할 수 있습니다.



### 5.2 복합 알람 (Composite Alarm)

- 여러 메트릭 조건을 조합하여 하나의 알람으로 설정할 수 있습니다.
- AND 또는 OR 조건을 사용하여 복잡한 모니터링 규칙을 설정할 수 있습니다.
- 예시: 디스크 사용량이 80% 초과 AND DiskReadOps가 1000 초과일 때 알람 발생



## 6 알람 통지 설정

- CloudWatch 알람은 다양한 통지 방식을 지원합니다:
	- Amazon SNS를 통한 이메일 알림
	- AWS Lambda 함수 호출
	- EC2 인스턴스 작업 수행 (중지, 종료, 재부팅 등)
	- Systems Manager 자동화 실행



## 7 모니터링 모범 사례

- 중요한 프로덕션 시스템의 경우 CloudWatch Agent를 설치하여 상세한 메트릭을 수집합니다.
- 디스크 공간 사용량에 대해서는 여유있게 임계값을 설정합니다(예: 80%).
- 복합 알람을 사용하여 오탐을 줄입니다.
- 알람 기록을 정기적으로 검토하여 임계값을 조정합니다.
- 중요한 알람에 대해서는 여러 통지 채널을 설정합니다.



## 8 결론

- EBS 볼륨 모니터링은 시스템 안정성을 위한 필수 요소입니다.
- CloudWatch 기본 메트릭과 Agent를 통한 상세 메트릭을 조합하여 사용하면 효과적인 모니터링이 가능합니다.
- 복합 알람을 활용하면 더욱 정교한 모니터링 시스템을 구축할 수 있습니다.
- 정기적인 모니터링 설정 검토와 조정이 필요합니다.