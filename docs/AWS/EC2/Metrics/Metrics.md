## 1 AWS EC2 메트릭 이해하기

- AWS EC2(Elastic Compute Cloud) 메트릭은 인스턴스의 성능과 상태를 모니터링하는 데 중요한 역할을 합니다.
- 이러한 메트릭들은 AWS CloudWatch와 통합되어 실시간으로 수집, 추적 및 분석됩니다.
- EC2 메트릭을 통해 인스턴스의 CPU 사용률, 네트워크 트래픽, 디스크 활동 등을 모니터링할 수 있습니다.
- 이 글에서는 EC2 메트릭의 종류, CloudWatch와의 통합, 커스텀 메트릭 설정 방법, 그리고 메트릭의 해상도와 측정 주기에 대해 알아보겠습니다.

## 2 CloudWatch와 EC2 메트릭 통합

- Amazon CloudWatch는 AWS 리소스와 애플리케이션을 실시간으로 모니터링하는 서비스입니다.
- EC2 인스턴스는 기본적으로 CloudWatch와 통합되어 있어, 별도의 설정 없이도 기본 메트릭을 수집합니다.
- CloudWatch는 EC2 인스턴스로부터 메트릭 데이터를 수집하고, 이를 그래프로 시각화하거나 경보를 설정하는 데 사용합니다.
- 기본 모니터링은 5분 간격으로 메트릭을 수집하며, 상세 모니터링을 활성화하면 1분 간격으로 수집할 수 있습니다.

## 3 EC2 기본 메트릭

- EC2 인스턴스는 CloudWatch에 다음과 같은 기본 메트릭을 자동으로 전송합니다:
	- **CPUUtilization**: CPU 사용률 (%)
	- **DiskReadOps**: 디스크 읽기 작업 수
	- **DiskWriteOps**: 디스크 쓰기 작업 수
	- **DiskReadBytes**: 디스크에서 읽은 바이트 수
	- **DiskWriteBytes**: 디스크에 쓴 바이트 수
	- **NetworkIn**: 네트워크로 받은 바이트 수
	- **NetworkOut**: 네트워크로 보낸 바이트 수
	- **NetworkPacketsIn**: 네트워크로 받은 패킷 수
	- **NetworkPacketsOut**: 네트워크로 보낸 패킷 수
	- **StatusCheckFailed**: 인스턴스 상태 확인 실패 여부
	- **StatusCheckFailed_Instance**: 인스턴스 레벨 상태 확인 실패 여부
	- **StatusCheckFailed_System**: 시스템 레벨 상태 확인 실패 여부
- [StatusChecks](../StatusChecks/StatusChecks.md) 참고

## 4 기본 메트릭의 해상도와 측정 주기

- EC2 기본 메트릭의 해상도와 측정 주기는 모니터링 유형에 따라 다릅니다:
- **기본 모니터링**:
	- 측정 주기: 5분
	- 해상도: 5분
	- 비용: 무료
- **세부 모니터링**:
	- 측정 주기: 1분
	- 해상도: 1분
	- 비용: 추가 비용 발생

**세부 모니터링을 활성화하는 방법**

1. AWS Management Console 사용:
	- EC2 대시보드에서 인스턴스 선택
	- "작업" > "모니터링" > "세부 모니터링 관리"
	- "세부 모니터링 활성화" 선택
2. AWS CLI 사용-
	- `aws ec2 monitor-instances --instance-ids i-1234567890abcdef0`
	- 세부 모니터링을 활성화하면 더 빠른 대응이 가능하지만, 추가 비용이 발생합니다.
	- 대규모 프로덕션 환경이나 빠른 스케일링이 필요한 경우에 유용합니다.

## 5 RAM 메트릭

- 기본적으로 EC2 인스턴스의 RAM(메모리) 사용량은 CloudWatch에서 자동으로 수집되지 않습니다.
- RAM 메트릭을 수집하려면 추가적인 설정이 필요합니다.
- RAM 메트릭을 얻는 방법에는 크게 두 가지가 있습니다:
	1. CloudWatch 에이전트 사용
	2. 커스텀 메트릭 생성

## 6 CloudWatch 에이전트를 통한 RAM 메트릭 수집

- CloudWatch 에이전트를 사용하면 RAM 사용량을 포함한 더 많은 시스템 레벨 메트릭을 수집할 수 있습니다.

**CloudWatch 에이전트 설치 (Amazon Linux 2)**

```bash
sudo yum install amazon-cloudwatch-agent
```

**에이전트 구성 파일 예시**

```json
{
  "metrics": {
    "metrics_collected": {
      "mem": {
        "measurement": [
          "mem_used_percent"
        ],
        "metrics_collection_interval": 60
      }
    }
  }
}
```

**CloudWatch 에이전트 시작**

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/path/to/config.json -s
```

- 이 설정을 통해 RAM 사용량을 포함한 추가 메트릭을 CloudWatch에서 확인할 수 있습니다.

### 6.1 CloudWatch 에이전트로 수집 가능한 주요 추가 메트릭

1. **메모리 (RAM) 관련 메트릭**
	- mem_used_percent: 사용 중인 메모리 비율
	- mem_used: 사용 중인 메모리 양
	- mem_available: 사용 가능한 메모리 양
2. **디스크 관련 메트릭**
	- disk_used_percent: 디스크 사용 비율
	- disk_free: 남은 디스크 공간
	- disk_total: 전체 디스크 공간
	- diskio_reads, diskio_writes: 디스크 I/O 읽기/쓰기 작업 수
3. **네트워크 관련 상세 메트릭**
	- net_bytes_sent, net_bytes_recv: 네트워크로 보내고 받은 바이트 수
	- net_packets_sent, net_packets_recv: 네트워크로 보내고 받은 패킷 수
	- net_drop_in, net_drop_out: 드롭된 인바운드/아웃바운드 패킷 수
4. **프로세스 관련 메트릭**
	- processes_total: 총 프로세스 수
	- processes_running: 실행 중인 프로세스 수
	- processes_blocked: 블록된 프로세스 수
5. **스왑 메모리 관련 메트릭**
	- swap_used: 사용 중인 스왑 메모리 양
	- swap_free: 사용 가능한 스왑 메모리 양
6. **파일 시스템 관련 메트릭**
	- file_handles_max: 최대 파일 핸들 수
	- file_handles_allocated: 할당된 파일 핸들 수

## 7 커스텀 메트릭

- EC2 인스턴스에서 기본 메트릭 외에 추가적인 데이터를 모니터링하고 싶다면 커스텀 메트릭을 사용할 수 있습니다.
- 커스텀 메트릭을 통해 애플리케이션 특정 메트릭, 비즈니스 메트릭 등을 CloudWatch에 전송할 수 있습니다.
- 커스텀 메트릭은 AWS CLI, AWS SDK, 또는 CloudWatch API를 통해 생성할 수 있습니다.

**AWS CLI를 사용한 커스텀 메트릭 전송 예시**

```bash
aws cloudwatch put-metric-data --metric-name MyCustomMetric --namespace MyNamespace --value 42 --dimensions InstanceId=i-1234567890abcdef0
```

- 이 명령어는 'MyCustomMetric'이라는 이름의 커스텀 메트릭을 'MyNamespace' 네임스페이스에 전송합니다.
- 값은 42이며, 특정 EC2 인스턴스 ID와 연결됩니다.

## 8 커스텀 메트릭의 해상도와 측정 주기

- 커스텀 메트릭의 해상도와 측정 주기는 사용자가 직접 설정할 수 있습니다:
	- **최소 해상도**: 1초
	- **최대 해상도**: 1시간 (3600초)
	- **권장 측정 주기**:
		- 일반적으로 1분 또는 5분
		- 필요에 따라 더 짧은 주기 (예: 10초) 설정 가능

**1분 해상도의 커스텀 메트릭 전송**

```bash
aws cloudwatch put-metric-data --metric-name MyCustomMetric --namespace MyNamespace --value 42 --dimensions InstanceId=i-1234567890abcdef0 --timestamp $(date -u +"%Y-%m-%dT%H:%M:%SZ") --storage-resolution 60
```

- `--storage-resolution 60`은 1분(60초) 해상도를 의미합니다.
- 해상도를 높일수록 (주기를 짧게 할수록) 더 세밀한 모니터링이 가능하지만, 비용이 증가합니다.

## 9 메트릭 모니터링 및 경보 설정

- CloudWatch를 통해 수집된 메트릭을 모니터링하고 경보를 설정할 수 있습니다:
	1. CloudWatch 콘솔에서 "경보 생성" 선택
	2. 메트릭 선택 (예: CPUUtilization)
	3. 임계값 설정 (예: 80% 이상일 때)
	4. 알림 방법 설정 (예: SNS 주제로 이메일 전송)

**AWS CLI를 사용한 경보 생성 예시**

```bash
aws cloudwatch put-metric-alarm --alarm-name cpu-mon --alarm-description "Alarm when CPU exceeds 70%" --metric-name CPUUtilization --namespace AWS/EC2 --statistic Average --period 300 --threshold 70 --comparison-operator GreaterThanThreshold --dimensions Name=InstanceId,Value=i-12345678 --evaluation-periods 2 --alarm-actions arn:aws:sns:us-east-1:111122223333:MyTopic --unit Percent
```

- 이 명령어는 CPU 사용률이 70%를 초과할 때 경보를 발생시키는 설정을 생성합니다.

## 10 메트릭 데이터 보존

- CloudWatch는 메트릭 데이터를 15개월 동안 보존합니다.
- 데이터 포인트의 기간에 따라 보존 기간 내 해상도가 다릅니다:
	- 60초 미만 기간: 3시간
	- 60초 (1분): 15일
	- 300초 (5분): 63일
	- 3600초 (1시간): 455일 (15개월)

## 11 결론

- EC2 메트릭은 인스턴스의 성능과 상태를 모니터링하는 데 필수적인 도구입니다.
- CloudWatch와의 통합을 통해 기본 메트릭을 쉽게 수집하고 분석할 수 있습니다.
- 기본 메트릭은 5분 간격으로 수집되며, 세부 모니터링을 통해 1분 간격으로 줄일 수 있습니다.
- RAM 메트릭을 포함한 추가적인 시스템 메트릭은 CloudWatch 에이전트를 통해 수집할 수 있습니다.
- 커스텀 메트릭을 사용하면 비즈니스나 애플리케이션 특정 데이터도 모니터링할 수 있으며, 최소 1초에서 최대 1시간까지의 해상도로 설정 가능합니다.
- 적절한 경보 설정을 통해 문제 상황을 신속하게 감지하고 대응할 수 있습니다.
- EC2 메트릭을 효과적으로 활용하면 시스템의 안정성과 성능을 크게 향상시킬 수 있습니다.