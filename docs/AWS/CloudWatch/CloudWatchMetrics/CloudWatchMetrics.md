## 1 Amazon CloudWatch Metrics 소개

- Amazon CloudWatch Metrics는 AWS 리소스와 애플리케이션의 모니터링 데이터를 수집하고 추적하는 서비스입니다.
- 이 서비스를 통해 시스템 성능, 리소스 사용량, 애플리케이션 상태 등을 실시간으로 모니터링할 수 있습니다.
- CloudWatch Metrics는 AWS 서비스와 통합되어 있어, 대부분의 AWS 리소스에 대한 메트릭을 자동으로 수집합니다.
- 또한 사용자 지정 메트릭을 생성하여 비즈니스 특정 데이터를 모니터링할 수도 있습니다.



## 2 CloudWatch Metrics의 주요 개념

- CloudWatch Metrics를 이해하기 위해서는 몇 가지 핵심 개념을 알아야 합니다.
- 이러한 개념들은 CloudWatch Metrics를 효과적으로 사용하는 데 도움이 됩니다.



### 2.1 메트릭(Metric)

- 메트릭은 모니터링하려는 변수의 시계열 데이터 포인트입니다.
- 예를 들어, EC2 인스턴스의 CPU 사용률, S3 버킷의 총 요청 수 등이 메트릭이 될 수 있습니다.
- 각 메트릭은 이름, 네임스페이스, 차원 등의 속성을 가집니다.



### 2.2 네임스페이스(Namespace)

- 네임스페이스는 관련 메트릭을 그룹화하는 컨테이너입니다.
- AWS 서비스는 일반적으로 "AWS/서비스명" 형식의 네임스페이스를 사용합니다.
- 예를 들어, Amazon EC2의 메트릭은 "AWS/EC2" 네임스페이스에 속합니다.



### 2.3 차원(Dimension)

- 차원은 메트릭의 신원을 정의하는 이름/값 쌍입니다.
- 메트릭은 최대 10개의 차원을 가질 수 있습니다.
- 예를 들어, EC2 인스턴스 ID나 EBS 볼륨 ID가 차원이 될 수 있습니다.



### 2.4 통계(Statistics)

- 통계는 지정된 기간 동안의 메트릭 데이터 집계입니다.
- CloudWatch는 Average, Minimum, Maximum, Sum, SampleCount 등의 통계를 제공합니다.
- 사용자 지정 통계를 정의할 수도 있습니다.



### 2.5 기간(Period)

- 기간은 특정 통계와 연관된 시간의 길이입니다.
- 기본 기간은 60초(1분)이지만, 1초에서 1일(86,400초) 사이의 값으로 설정할 수 있습니다.



## 3 CloudWatch Metrics 사용하기

- CloudWatch Metrics를 사용하여 AWS 리소스와 애플리케이션을 모니터링하는 방법을 알아보겠습니다.



### 3.1 AWS 관리 콘솔을 통한 메트릭 확인

- AWS 관리 콘솔에서 CloudWatch 서비스로 이동합니다.
- 왼쪽 메뉴에서 "Metrics"를 선택합니다.
- 원하는 네임스페이스를 선택하고, 확인하고 싶은 메트릭을 선택합니다.
- 그래프 영역에서 메트릭 데이터를 시각적으로 확인할 수 있습니다.



### 3.2 AWS CLI를 이용한 메트릭 조회

- AWS CLI를 사용하여 메트릭 데이터를 조회할 수 있습니다.



**메트릭 목록 조회**

```bash
aws cloudwatch list-metrics --namespace AWS/EC2
```



**특정 메트릭의 통계 데이터 조회**

```bash
aws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization --dimensions Name=InstanceId,Value=i-1234567890abcdef0 --start-time 2023-01-01T00:00:00Z --end-time 2023-01-02T00:00:00Z --period 3600 --statistics Average
```

- 위 명령어는 특정 EC2 인스턴스의 CPU 사용률 평균을 1시간 간격으로 조회합니다.
- `--start-time`과 `--end-time`은 데이터를 조회할 시간 범위를 지정합니다.
- `--period`는 데이터 집계 간격을 초 단위로 지정합니다.



### 3.3 사용자 지정 메트릭 생성

- CloudWatch에서 제공하지 않는 메트릭을 추적하고 싶다면, 사용자 지정 메트릭을 생성할 수 있습니다.
- [[CustomMetric]] 참고



**AWS CLI를 이용한 사용자 지정 메트릭 생성**

```bash
aws cloudwatch put-metric-data --namespace "MyApplication" --metric-name "PageViewCount" --value 100 --timestamp $(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

- 위 명령어는 "MyApplication" 네임스페이스에 "PageViewCount"라는 메트릭을 생성하고, 현재 시간에 값 100을 추가합니다.
- `--timestamp` 옵션을 사용하여 데이터 포인트의 시간을 지정할 수 있습니다.



## 4 CloudWatch 대시보드 사용하기

- CloudWatch 대시보드를 사용하면 여러 메트릭을 한 눈에 볼 수 있는 사용자 지정 홈 페이지를 만들 수 있습니다.



### 4.1 대시보드 생성

- AWS 관리 콘솔의 CloudWatch 서비스에서 "Dashboards"를 선택합니다.
- "Create dashboard" 버튼을 클릭하고 대시보드 이름을 입력합니다.
- 위젯 추가 화면에서 원하는 위젯 유형(라인 차트, 숫자, 게이지 등)을 선택합니다.
- 추가하고 싶은 메트릭을 선택하고 위젯을 구성합니다.
- 필요한 만큼 위젯을 추가하고 배치합니다.



### 4.2 대시보드 공유

- 생성한 대시보드를 다른 사람과 공유할 수 있습니다.
- 대시보드 화면에서 "Share dashboard" 버튼을 클릭합니다.
- 공유 옵션(링크 공유, 이메일로 공유 등)을 선택하고 필요한 설정을 합니다.
- 공유 받은 사람은 읽기 전용으로 대시보드를 볼 수 있습니다.



## 5 CloudWatch Alarms 설정하기

- CloudWatch Alarms를 사용하면 메트릭이 특정 임계값을 초과할 때 알림을 받을 수 있습니다.



### 5.1 알람 생성

- CloudWatch 콘솔에서 "Alarms" 섹션으로 이동합니다.
- "Create alarm" 버튼을 클릭합니다.
- 알람을 설정할 메트릭을 선택합니다.
- 알람 조건(임계값, 평가 기간 등)을 설정합니다.
- 알람 작업(SNS 주제로 알림 보내기, Auto Scaling 작업 수행 등)을 설정합니다.
- 알람 이름과 설명을 입력하고 알람을 생성합니다.



### 5.2 AWS CLI를 이용한 알람 생성

**알람 생성 예시**

```bash
aws cloudwatch put-metric-alarm --alarm-name cpu-mon --alarm-description "Alarm when CPU exceeds 70%" --metric-name CPUUtilization --namespace AWS/EC2 --statistic Average --period 300 --threshold 70 --comparison-operator GreaterThanThreshold --dimensions Name=InstanceId,Value=i-12345678 --evaluation-periods 2 --alarm-actions arn:aws:sns:us-east-1:111122223333:MyTopic --unit Percent
```

- 위 명령어는 EC2 인스턴스의 CPU 사용률이 5분(300초) 동안 평균 70%를 초과할 경우 알람을 발생시킵니다.
- `--alarm-actions` 옵션을 통해 알람 발생 시 실행할 작업(여기서는 SNS 주제로 알림 보내기)을 지정합니다.



## 6 CloudWatch Metrics 모범 사례

- CloudWatch Metrics를 효과적으로 사용하기 위한 몇 가지 모범 사례를 소개합니다.



### 6.1 적절한 메트릭 선택

- 모든 가능한 메트릭을 모니터링하는 것이 아니라, 비즈니스에 중요한 메트릭을 선별하여 모니터링합니다.
- 시스템 성능, 사용자 경험, 비즈니스 목표와 관련된 핵심 메트릭을 식별합니다.



### 6.2 적절한 granularity 설정

- 메트릭 데이터의 granularity(세분성)를 적절히 설정합니다.
- 너무 세밀한 데이터는 스토리지 비용을 증가시키고, 너무 큰 간격은 중요한 이벤트를 놓칠 수 있습니다.
- 대부분의 경우 1분 또는 5분 간격이 적절합니다.



### 6.3 효과적인 대시보드 구성

- 관련 메트릭을 그룹화하여 대시보드를 구성합니다.
- 가장 중요한 메트릭을 쉽게 볼 수 있도록 대시보드를 설계합니다.
- 필요에 따라 여러 대시보드를 만들어 다양한 관점에서 시스템을 모니터링합니다.



### 6.4 알람 임계값 최적화

- 알람 임계값을 너무 낮게 설정하면 false positive가 많이 발생할 수 있습니다.
- 반대로 너무 높게 설정하면 중요한 이슈를 놓칠 수 있습니다.
- 시스템의 정상 동작 패턴을 분석하여 적절한 임계값을 설정합니다.



### 6.5 로그와의 연계

- CloudWatch Logs와 Metrics를 연계하여 사용합니다.
- 메트릭 알람이 발생했을 때 관련 로그를 빠르게 확인할 수 있도록 설정합니다.
- 이를 통해 문제의 근본 원인을 더 빠르게 파악할 수 있습니다.



## 7 결론

- Amazon CloudWatch Metrics는 AWS 환경에서 리소스와 애플리케이션을 모니터링하는 강력한 도구입니다.
- 주요 메트릭을 지속적으로 추적하고, 효과적인 대시보드를 구성하며, 적절한 알람을 설정함으로써 시스템의 건강 상태를 항상 파악할 수 있습니다.
- CloudWatch Metrics를 잘 활용하면 성능 문제를 사전에 감지하고, 리소스 사용을 최적화하며, 전반적인 시스템 reliability를 향상시킬 수 있습니다.
- 지속적인 모니터링과 개선을 통해 AWS 환경을 더욱 효율적으로 관리하고 운영할 수 있을 것입니다.



## 8 CloudWatch Metrics Explorer

- CloudWatch Metrics Explorer는 태그 및 리소스 속성을 기반으로 메트릭을 필터링하고 시각화하는 도구입니다.
- 동적으로 변화하는 리소스 환경에서 특히 유용합니다.
- 태그 기반 필터링을 통해 특정 그룹의 리소스를 자동으로 모니터링할 수 있습니다.



### 8.1 Metrics Explorer의 주요 기능

- 태그 기반 필터링을 통한 리소스 모니터링
- 여러 리소스의 메트릭을 하나의 그래프로 통합
- 동적 리소스 환경에서 자동 업데이트
- 대시보드와의 완벽한 통합



### 8.2 Metrics Explorer 사용하기

- CloudWatch 콘솔에서 "Metrics Explorer" 메뉴 선택
- 모니터링할 메트릭과 리소스 유형 선택
- 태그 또는 속성 기반 필터 설정
- 시각화 옵션 구성 및 대시보드에 추가



## 9 Auto Scaling 환경의 모니터링

- Auto Scaling 그룹의 리소스는 동적으로 변화하므로 특별한 모니터링 전략이 필요합니다.
- CloudWatch는 Auto Scaling 환경을 위한 특별한 기능을 제공합니다.



### 9.1 Auto Scaling 태그 활용

- Auto Scaling 그룹은 자동으로 태그를 생성합니다.
- `aws:autoscaling:groupName` 태그를 통해 그룹의 모든 인스턴스를 식별할 수 있습니다.
- 이 태그를 활용하여 Metrics Explorer에서 필터링이 가능합니다.



### 9.2 동적 리소스 모니터링 설정

- Metrics Explorer에서 Auto Scaling 태그로 필터링
- 자동으로 새로운 인스턴스 감지 및 모니터링
- 종료된 인스턴스는 자동으로 모니터링에서 제외



### 9.3 Auto Scaling 대시보드 구성

- Metrics Explorer 시각화를 대시보드에 추가
- 태그 기반 필터링으로 자동 업데이트 구성
- CPU 사용률 등 주요 메트릭 통합 모니터링



## 10 태그 기반 모니터링 전략

- 태그는 AWS 리소스를 효과적으로 관리하고 모니터링하는 핵심 도구입니다.



### 10.1 태그 설계

- 일관된 태그 명명 규칙 수립
- 모니터링에 필요한 필수 태그 정의
- Auto Scaling 그룹의 자동 태그 활용



### 10.2 태그 기반 필터링

- Metrics Explorer에서 태그 기반 필터 설정
- 여러 태그를 조합한 복잡한 필터링 구성
- 동적 환경에서 자동 업데이트 활용



### 10.3 태그 모니터링 모범 사례

- 태그 기반 접근 방식 사용
- 수동 설정보다 자동화된 태그 활용
- 일관된 태그 정책 유지



## 11 운영 효율성 최적화

- 운영 효율성을 높이기 위한 CloudWatch 활용 방법입니다.



### 11.1 자동화된 모니터링

- 태그 기반 자동 리소스 감지
- Metrics Explorer를 통한 동적 모니터링
- 수동 설정 최소화



### 11.2 확장 가능한 모니터링

- 리소스 증가에 자동으로 대응
- 태그 기반 필터링으로 유연성 확보
- 운영 오버헤드 최소화



## 12 요약 및 추가 고려사항

- CloudWatch Metrics Explorer는 동적 환경에서 강력한 모니터링 도구입니다.
- Auto Scaling 환경에서는 태그 기반 접근 방식이 가장 효율적입니다.
- 자동화된 모니터링 구성으로 운영 효율성을 극대화할 수 있습니다.
- 태그 전략과 Metrics Explorer를 적절히 활용하면 복잡한 환경에서도 효과적인 모니터링이 가능합니다.