## AWS Lambda의 효과적인 로깅과 모니터링: CloudWatch와 X-Ray 활용하기

- AWS Lambda는 서버리스 컴퓨팅의 핵심 서비스로, 코드 실행에 대한 인프라 관리 없이 애플리케이션을 구축할 수 있게 해줍니다. 
- 그러나 서버리스 환경에서도 애플리케이션의 성능과 동작을 모니터링하고 문제를 진단하는 것은 매우 중요합니다. 
- AWS는 Lambda 함수의 효과적인 로깅과 모니터링을 위해 CloudWatch와 X-Ray를 제공합니다.



## 1 CloudWatch를 이용한 Lambda 로깅과 Metrics

### 1.1 CloudWatch Logs

- Lambda 실행 로그는 자동으로 CloudWatch Logs에 저장됩니다.
- 로그 저장을 위해서는 Lambda 함수의 실행 역할에 CloudWatch Logs 쓰기 권한이 있어야 합니다.



**IAM 정책 예시**

```json
{
   "Version": "2012-10-17",
   "Statement": [
       {
           "Effect": "Allow",
           "Action": [
               "logs:CreateLogGroup",
               "logs:CreateLogStream",
               "logs:PutLogEvents"
           ],
           "Resource": "arn:aws:logs:*:*:*"
       }
   ]
}
```



### 1.2 CloudWatch Metrics

- CloudWatch Metrics를 통해 다양한 Lambda 관련 지표를 모니터링할 수 있습니다:
	- Invocations: 함수 호출 횟수
	- Duration: 함수 실행 시간
	- Concurrent Executions: 동시 실행 수
	- Error count 및 Success Rates: 오류 발생 횟수와 성공률
	- Throttles: 제한(throttling) 발생 횟수
	- Async Delivery Failures: 비동기 호출 실패 횟수
	- Iterator Age: Kinesis 및 DynamoDB Streams 사용 시 레코드 처리 지연 시간
- 이러한 지표를 통해 Lambda 함수의 성능과 상태를 실시간으로 모니터링하고, 필요한 경우 경보를 설정하여 신속하게 대응할 수 있습니다.



## 2 X-Ray를 이용한 Lambda 트레이싱

- AWS X-Ray는 애플리케이션의 분산 추적을 가능하게 하는 서비스로, Lambda 함수의 성능 분석과 병목 현상 식별에 매우 유용합니다.



### 2.1 X-Ray 활성화 방법

1. Lambda 콘솔에서 함수 구성의 "Active Tracing" 옵션을 활성화합니다.
2. Lambda 함수 코드에 AWS X-Ray SDK를 통합합니다.
3. Lambda 함수의 실행 역할에 적절한 X-Ray 권한을 부여합니다.



**필요한 IAM 관리형 정책**

- `AWSXRayDaemonWriteAccess`

### 2.2 X-Ray 환경 변수

X-Ray와 관련된 주요 환경 변수:

- `_X_AMZN_TRACE_ID`: 트레이싱 헤더 정보를 포함
- `AWS_XRAY_CONTEXT_MISSING`: 기본값은 LOG_ERROR
- `AWS_XRAY_DAEMON_ADDRESS`: X-Ray 데몬의 IP 주소와 포트



### 2.3 X-Ray 사용 이점

- 함수 실행의 전체 흐름을 시각화할 수 있습니다.
- 다운스트림 서비스 호출의 지연 시간을 식별할 수 있습니다.
- 오류 발생 지점을 정확히 파악할 수 있습니다.



## 3 효과적인 로깅과 모니터링 전략

1. **구조화된 로깅**: JSON 형식으로 로그를 출력하여 검색과 분석을 용이하게 합니다.
2. **로그 레벨 활용**: 개발 단계에서는 상세한 로그를, 프로덕션에서는 중요 정보만 로깅하도록 설정합니다.
3. **메트릭 대시보드 생성**: 주요 지표를 한눈에 볼 수 있는 CloudWatch 대시보드를 구성합니다.
4. **경보 설정**: 중요 지표에 대한 CloudWatch 경보를 설정하여 이상 징후를 신속하게 감지합니다.
5. **X-Ray 세그먼트 활용**: 코드 내에서 X-Ray 세그먼트를 생성하여 특정 로직의 성능을 상세히 분석합니다.



## 4 결론

- AWS Lambda의 효과적인 로깅과 모니터링은 서버리스 애플리케이션의 안정성과 성능을 보장하는 데 필수적입니다. 
- CloudWatch와 X-Ray를 적절히 활용하면 Lambda 함수의 동작을 상세히 파악하고, 문제를 신속하게 진단하며, 최적의 성능을 유지할 수 있습니다. 
- 이를 통해 개발자는 인프라 관리에 시간을 쏟기보다는 비즈니스 로직 개선에 더 집중할 수 있으며, 결과적으로 더 안정적이고 효율적인 서버리스 애플리케이션을 구축할 수 있습니다.