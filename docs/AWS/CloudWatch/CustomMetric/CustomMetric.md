## 1 CloudWatch 사용자 정의 메트릭 소개

- Amazon CloudWatch는 AWS 리소스와 애플리케이션의 모니터링을 위한 서비스입니다.
- CloudWatch 사용자 정의 메트릭(Custom Metrics)은 기본 제공 메트릭 외에 사용자가 직접 정의하고 데이터를 전송할 수 있는 메트릭입니다.
- 사용자 정의 메트릭을 통해 애플리케이션이나 인프라의 특정 요구사항에 맞는 데이터를 모니터링할 수 있습니다.



## 2 사용자 정의 메트릭의 정의 및 관리

- 사용자 정의 메트릭은 주로 다음과 같은 방법으로 정의하고 관리합니다:
	- AWS Management Console
	- AWS Command Line Interface (CLI)
	- AWS SDK
- 이러한 도구를 사용하여 메트릭의 이름, 네임스페이스, 차원 등을 정의합니다.
- 실제 메트릭 데이터는 애플리케이션이나 스크립트에서 생성되어 CloudWatch로 전송됩니다.



## 3 사용자 정의 메트릭 데이터 전송

- CloudWatch 사용자 정의 메트릭 데이터는 `PutMetricData` API를 통해 CloudWatch로 전송됩니다.
- 이 API는 정의된 메트릭에 대한 데이터 포인트를 CloudWatch에 보내는 역할을 합니다.



**예시 코드 (AWS CLI 사용)**

```bash
aws cloudwatch put-metric-data --metric-name "MemoryUsage" --namespace "CustomMetrics" --value 85.5 --unit Percent
```

- 이 예시에서는 "MemoryUsage"라는 이름의 메트릭에 대한 데이터 포인트를 "CustomMetrics" 네임스페이스로 전송하고 있습니다.
- 메트릭 값은 85.5이며, 단위는 퍼센트입니다.



## 4 사용자 정의 메트릭 활용 예시

- 사용자 정의 메트릭은 다양한 용도로 활용될 수 있습니다. 예를 들면:
	- 메모리(RAM) 사용량 모니터링
	- 디스크 공간 사용량 추적
	- 로그인한 사용자 수 집계
	- 애플리케이션 특정 성능 지표 측정
- 이러한 메트릭들은 기본 제공되는 CloudWatch 메트릭으로는 측정할 수 없는 애플리케이션 특정 데이터를 추적하는 데 유용합니다.



## 5 Dimensions (차원)

- Dimensions는 메트릭을 세분화하는 데 사용되는 속성입니다.
- 예를 들어, EC2 인스턴스 ID나 환경 이름을 dimension으로 사용할 수 있습니다.
- Dimensions을 사용하면 동일한 메트릭 이름을 가진 데이터 포인트를 다양한 관점에서 분석할 수 있습니다.




**예시 코드 (AWS CLI 사용)**

```bash
aws cloudwatch put-metric-data --metric-name "CPUUsage" --namespace "CustomMetrics" --value 75.0 --unit Percent --dimensions Instance.id=i-1234567890abcdef0,Environment.name=Production
```

- 이 예시에서는 "CPUUsage" 메트릭에 두 개의 dimension을 추가하여 데이터를 전송하고 있습니다:
	- Instance.id: 특정 EC2 인스턴스를 식별
	- Environment.name: 해당 인스턴스가 속한 환경을 지정



## 6 메트릭 해상도 (Metric Resolution)

- CloudWatch 사용자 정의 메트릭은 두 가지 해상도를 제공합니다:
	1. 표준 해상도: 1분 (60초)
	2. 고해상도: 1초, 5초, 10초, 또는 30초
- 해상도는 `PutMetricData` API 호출 시 `StorageResolution` 파라미터를 통해 지정할 수 있습니다.
- 고해상도 메트릭은 더 세밀한 모니터링이 가능하지만, 비용이 더 높습니다.



**예시 코드 (AWS CLI 사용)**

```bash
aws cloudwatch put-metric-data --metric-name "APILatency" --namespace "CustomMetrics" --value 120 --unit Milliseconds --storage-resolution 1
```

- 이 예시에서는 "APILatency" 메트릭 데이터를 1초 해상도로 전송하고 있습니다.



## 7 메트릭 데이터 포인트 제한

- CloudWatch는 과거 2주와 미래 2시간 이내의 타임스탬프를 가진 메트릭 데이터 포인트만 허용합니다.
- 이는 데이터를 전송하는 시스템(예: EC2 인스턴스)의 시간 설정이 정확한지 확인해야 함을 의미합니다.
- 잘못된 시간 설정으로 인해 메트릭 데이터가 누락되거나 거부될 수 있으므로 주의가 필요합니다.



## 8 사용자 정의 메트릭의 모니터링 및 알람 설정

- 사용자 정의 메트릭은 CloudWatch 콘솔에서 확인하고 모니터링할 수 있습니다.
- 이러한 메트릭을 기반으로 CloudWatch 알람을 설정하여 특정 조건이 충족될 때 알림을 받을 수 있습니다.



**알람 설정 예시 (AWS CLI 사용)**

```bash
aws cloudwatch put-metric-alarm --alarm-name "HighMemoryUsage" --alarm-description "Alarm when memory usage exceeds 90%" --metric-name "MemoryUsage" --namespace "CustomMetrics" --statistic Average --period 60 --threshold 90 --comparison-operator GreaterThanThreshold --evaluation-periods 1 --alarm-actions arn:aws:sns:us-east-1:123456789012:MyTopic
```

- 이 예시에서는 "MemoryUsage" 메트릭이 90%를 초과할 때 알람이 트리거되도록 설정하고 있습니다.



## 9 결론

- CloudWatch 사용자 정의 메트릭은 AWS Management Console, CLI, 또는 SDK를 통해 정의하고 관리합니다.
- `PutMetricData` API를 사용하여 정의된 메트릭에 대한 데이터를 CloudWatch로 전송합니다.
- Dimensions를 활용하여 메트릭을 세분화하고, 다양한 해상도 옵션을 통해 필요에 맞는 상세도로 데이터를 수집할 수 있습니다.
- 정확한 시간 설정과 데이터 포인트 제한을 고려하여 메트릭 데이터를 관리해야 합니다.
- 사용자 정의 메트릭을 활용한 알람 설정으로 시스템의 이상 징후를 신속하게 감지하고 대응할 수 있습니다.