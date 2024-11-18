## 1 AWS Unified CloudWatch Agent 소개

- AWS Unified CloudWatch Agent는 Amazon EC2 인스턴스와 온프레미스 서버에서 시스템 수준 지표와 로그를 수집하는 통합 도구입니다.
- 이 에이전트는 기존의 CloudWatch Logs 에이전트와 CloudWatch 지표 수집 스크립트를 대체하며, 더 많은 기능과 향상된 성능을 제공합니다.
- Unified CloudWatch Agent를 사용하면 시스템 리소스 사용량, 애플리케이션 성능, 로그 데이터 등을 종합적으로 모니터링할 수 있습니다.



## 2 Unified CloudWatch Agent의 주요 기능

- **다양한 환경 지원**: EC2 인스턴스, 온프레미스 서버 등 다양한 환경에서 사용 가능합니다.
- **추가 시스템 수준 지표 수집**: RAM, 프로세스, 사용된 디스크 공간 등의 지표를 수집합니다.
- **CloudWatch Logs로 로그 전송**: EC2 인스턴스 내부의 로그를 CloudWatch Logs로 전송합니다.
- **중앙 집중식 구성**: AWS Systems Manager Parameter Store를 사용하여 구성을 중앙에서 관리합니다.
- **IAM 권한 관리**: 적절한 IAM 권한 설정이 필요합니다.
- **사용자 지정 네임스페이스**: 기본 네임스페이스는 CWAgent이지만, 필요에 따라 변경 가능합니다.



## 3 Unified CloudWatch Agent 설치 및 구성

### 3.1 설치 과정

- IAM 역할 또는 사용자 생성
	- CloudWatch에 지표를 쓰고 로그를 보낼 수 있는 권한 필요
- 에이전트 다운로드 및 설치
	- Amazon Linux: `sudo yum install amazon-cloudwatch-agent`
	- Ubuntu: `sudo apt-get install amazon-cloudwatch-agent`
	- Windows: MSI 인스톨러 사용
- 구성 파일 생성
	- `amazon-cloudwatch-agent-config-wizard` 명령 실행 또는 수동으로 JSON 파일 작성
- 에이전트 시작
	- `sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:configuration-file-path`



### 3.2 구성 파일 예시

```json
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "cwagent"
  },
  "metrics": {
    "metrics_collected": {
      "cpu": {
        "resources": [
          "*"
        ],
        "measurement": [
          "usage_active"
        ],
        "totalcpu": false
      },
      "mem": {
        "measurement": [
          "used_percent"
        ]
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/syslog",
            "log_group_name": "syslog",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
```



## 4 procstat 플러그인 활용

- procstat 플러그인은 개별 프로세스의 시스템 사용량을 모니터링하는 데 사용됩니다.
- Linux와 Windows 서버 모두 지원합니다.
- CPU 사용 시간, 메모리 사용량 등 프로세스별 상세 지표를 수집할 수 있습니다.



### 4.1 procstat 플러그인 구성

프로세스 모니터링 방법:
- `pid_file`: 프로세스 ID (PID) 파일 이름 지정
- `exe`: 프로세스 이름 지정 (정규 표현식 사용 가능)
- `pattern`: 프로세스 시작 명령어 패턴 지정 (정규 표현식 사용 가능)



### 4.2 procstat 구성 예시

```json
{
  "metrics": {
    "metrics_collected": {
      "procstat": [
        {
          "exe": "nginx",
          "measurement": [
            "cpu_usage",
            "memory_rss"
          ]
        }
      ]
    }
  }
}
```

- 이 구성은 nginx 프로세스의 CPU 사용량과 RSS 메모리 사용량을 모니터링합니다.
- procstat 플러그인이 수집하는 지표는 "procstat" 접두사로 시작합니다 (예: procstat_cpu_time, procstat_cpu_usage).



## 5 Unified CloudWatch Agent 사용 시 장점

- **통합 모니터링**: 시스템 지표와 로그를 하나의 에이전트로 수집할 수 있습니다.
- **세분화된 지표 수집**: RAM, 디스크 I/O, 개별 프로세스 등 더 많은 시스템 수준 지표를 수집할 수 있습니다.
- **유연한 구성**: JSON 형식의 구성 파일을 통해 필요한 지표와 로그만 선택적으로 수집할 수 있습니다.
- **중앙 집중식 관리**: Systems Manager Parameter Store를 통해 여러 인스턴스의 구성을 중앙에서 관리할 수 있습니다.
- **크로스 플랫폼 지원**: Linux, Windows 등 다양한 운영 체제에서 사용 가능합니다.



## 6 모범 사례 및 주의사항

- **최소 권한 원칙 준수**: 에이전트에 필요한 최소한의 IAM 권한만 부여하세요.
- **리소스 사용량 고려**: 지표 수집 간격과 수집하는 지표의 수를 적절히 조절하여 리소스 사용량을 최적화하세요.
- **로그 관리**: 중요한 로그만 선택적으로 CloudWatch Logs로 전송하여 비용을 관리하세요.
- **구성 버전 관리**: 에이전트 구성 파일의 버전을 관리하고, 변경 사항을 추적하세요.
- **모니터링 및 알림 설정**: 수집된 지표를 기반으로 CloudWatch 경보를 설정하여 문제 상황을 신속하게 감지하세요.



## 7 결론

- AWS Unified CloudWatch Agent는 EC2 인스턴스와 온프레미스 서버의 모니터링을 크게 개선합니다.
- 시스템 지표와 로그를 통합적으로 수집하고 관리할 수 있어 운영 효율성이 향상됩니다.
- procstat 플러그인을 통해 개별 프로세스 수준의 상세한 모니터링이 가능합니다.
- 적절한 구성과 모범 사례를 따르면, 시스템의 전반적인 상태를 더욱 정확하게 파악하고 문제에 신속하게 대응할 수 있습니다.
- Unified CloudWatch Agent를 효과적으로 활용하여 AWS 리소스와 애플리케이션의 성능과 안정성을 지속적으로 개선할 수 있습니다.