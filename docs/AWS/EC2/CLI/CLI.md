## 1 EC2 관리를 위한 AWS CLI 가이드

- AWS CLI(Command Line Interface)를 사용하면 명령줄에서 Amazon EC2 인스턴스를 관리할 수 있습니다.
- 이 가이드에서는 EC2 인스턴스 관리에 필요한 주요 AWS CLI 명령어들을 소개합니다.



## 2 인스턴스 조회

- EC2 인스턴스 목록을 조회하는 것은 가장 기본적인 작업입니다.
- `describe-instances` 명령어를 사용하여 현재 리전의 모든 EC2 인스턴스 정보를 조회할 수 있습니다.



**모든 인스턴스 조회**

```bash
aws ec2 describe-instances
```

- 이 명령어는 모든 인스턴스의 상세 정보를 JSON 형식으로 반환합니다.
- 출력이 너무 많은 경우, `--query` 옵션을 사용하여 필요한 정보만 추출할 수 있습니다.



**인스턴스 ID와 상태만 조회**

```bash
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name]' --output table
```

- 이 명령어는 인스턴스 ID와 현재 상태를 테이블 형식으로 보여줍니다.



## 3 인스턴스 시작

- 새로운 EC2 인스턴스를 시작하려면 `run-instances` 명령어를 사용합니다.
- 이 명령어를 사용할 때는 AMI ID, 인스턴스 타입, 키 페어 등의 정보가 필요합니다.



**인스턴스 시작 예시**

```bash
aws ec2 run-instances --image-id ami-xxxxxxxx --count 1 --instance-type t2.micro --key-name MyKeyPair --security-group-ids sg-xxxxxxxx --subnet-id subnet-xxxxxxxx
```

- `--image-id`: 사용할 AMI의 ID
- `--count`: 시작할 인스턴스의 수
- `--instance-type`: 인스턴스 타입
- `--key-name`: 사용할 키 페어의 이름
- `--security-group-ids`: 적용할 보안 그룹의 ID
- `--subnet-id`: 인스턴스를 시작할 서브넷의 ID



## 4 인스턴스 중지 및 시작

- 실행 중인 인스턴스를 중지하거나 중지된 인스턴스를 다시 시작할 수 있습니다.



**인스턴스 중지**

```bash
aws ec2 stop-instances --instance-ids i-1234567890abcdef0
```



**인스턴스 시작**

```bash
aws ec2 start-instances --instance-ids i-1234567890abcdef0
```

- `--instance-ids` 옵션 뒤에 해당 인스턴스의 ID를 지정합니다.
- 여러 인스턴스를 동시에 중지하거나 시작하려면 ID를 공백으로 구분하여 나열하면 됩니다.



## 5 인스턴스 종료

- 더 이상 필요하지 않은 인스턴스는 종료할 수 있습니다.
- 종료된 인스턴스는 영구적으로 삭제되므로 주의해야 합니다.



**인스턴스 종료**

```bash
aws ec2 terminate-instances --instance-ids i-1234567890abcdef0
```

- 이 명령어는 지정된 인스턴스를 영구적으로 종료합니다.
- 종료 전에 중요한 데이터를 백업했는지 확인하세요.



## 6 인스턴스 태그 관리

- 태그를 사용하면 EC2 인스턴스를 쉽게 구분하고 관리할 수 있습니다.



**태그 추가**

```bash
aws ec2 create-tags --resources i-1234567890abcdef0 --tags Key=Name,Value=MyServer
```



**태그 제거**

```bash
aws ec2 delete-tags --resources i-1234567890abcdef0 --tags Key=Name
```

- `--resources` 옵션 뒤에 태그를 추가하거나 제거할 인스턴스의 ID를 지정합니다.
- `--tags` 옵션을 사용하여 키-값 쌍 형태로 태그를 지정합니다.



## 7 인스턴스 모니터링

- EC2 인스턴스의 상태와 성능을 모니터링하는 것은 중요합니다.



**상세 모니터링 활성화**

```bash
aws ec2 monitor-instances --instance-ids i-1234567890abcdef0
```



**상세 모니터링 비활성화**

```bash
aws ec2 unmonitor-instances --instance-ids i-1234567890abcdef0
```

- 상세 모니터링을 활성화하면 1분 간격으로 메트릭을 수집할 수 있습니다.
- 기본 모니터링은 5분 간격으로 메트릭을 수집합니다.



## 8 결론

- AWS CLI를 사용하면 EC2 인스턴스를 효율적으로 관리할 수 있습니다.
- 이 가이드에서 다룬 명령어들은 EC2 관리의 기본이 되는 작업들입니다.
- 더 복잡한 작업이나 자동화가 필요한 경우, 이러한 기본 명령어들을 조합하여 사용할 수 있습니다.
- AWS CLI의 `--help` 옵션을 활용하면 각 명령어에 대한 더 자세한 정보를 얻을 수 있습니다.