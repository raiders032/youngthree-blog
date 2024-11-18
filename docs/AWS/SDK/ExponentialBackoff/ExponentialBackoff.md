## 1 Exponential Backoff

- Exponential Backoff는 주로 네트워크 요청에서 일시적인 오류나 과부하 상태를 처리하기 위해 사용하는 재시도 전략입니다.
- AWS와 같은 클라우드 서비스에서 API 호출 시 일시적인 오류가 발생하면, 일정 시간 간격을 두고 재시도하는 것이 효과적입니다.



## 2 Exponential Backoff의 원리

- 기본 개념은 재시도 간격을 점진적으로 늘려가는 것입니다.
- 첫 번째 실패 후 일정 시간(예: 1초) 대기하고, 두 번째 실패 후 두 배의 시간(예: 2초), 그 다음에는 네 배의 시간(예: 4초) 대기하는 방식입니다.
- 이러한 방식으로 서버 과부하를 줄이고 성공할 확률을 높입니다.



## 3 AWS에서 Exponential Backoff 사용

### 3.1 AWS SDK의 자동 재시도

- 대부분의 AWS SDK는 Exponential Backoff를 포함한 자동 재시도 메커니즘을 기본으로 제공합니다.
- 이는 개발자가 직접 재시도 로직을 구현하지 않아도 되도록 합니다.
- 예를 들어, Boto3(Python용 AWS SDK)는 자동으로 일시적인 오류를 감지하고 재시도합니다.



### 3.2 수동 구현

- 만약 AWS SDK를 사용하지 않거나, 특정 상황에서 직접 구현이 필요할 경우, Exponential Backoff를 수동으로 구현할 수 있습니다.
- 이는 직접 API 호출을 처리하는 코드에서 재시도 로직을 추가하는 것을 의미합니다.



#### Python 예제 코드

```python
import time
import requests

def make_api_call(url, max_retries=5):
    retries = 0
    while retries < max_retries:
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        elif response.status_code in [500, 503]:  # 서버 오류
            retries += 1
            wait_time = 2 ** retries  # 지수 백오프
            time.sleep(wait_time)
        else:
            response.raise_for_status()
    raise Exception("최대 재시도 횟수를 초과했습니다")

## 사용 예시
try:
    result = make_api_call('https://example.com/api/resource')
except Exception as e:
    print(f"API 호출 실패: {e}")
```



## 4 Exponential Backoff의 장점

- **과부하 방지**: 재시도 간격을 점진적으로 늘려 서버 과부하를 방지합니다.
- **성공률 증가**: 일시적인 오류가 해결될 시간을 주어 성공 확률을 높입니다.
- **유연성**: 다양한 재시도 전략과 결합하여 효과적으로 사용할 수 있습니다.



## 5 Exponential Backoff 적용 시 고려사항

### 5.1 적용 대상

- **5xx 서버 오류**: 서버에서 발생하는 일시적인 오류에 대해 적용합니다.
- **ThrottlingException**: 과도한 요청으로 인해 발생하는 AWS 서비스의 제한 오류에 대해 적용합니다.



### 5.2 적용하지 않는 대상

- **4xx 클라이언트 오류**: 잘못된 요청이나 권한 문제 등 클라이언트 측 오류에는 재시도를 적용하지 않습니다. 이러한 오류는 요청을 수정해야 합니다.



## 6 결론

- Exponential Backoff는 일시적인 오류와 과부하 상태를 처리하는 데 매우 유용한 전략입니다.
- AWS SDK를 사용하면 자동으로 적용되며, 수동으로 구현할 수도 있습니다.
- 올바른 재시도 전략을 통해 안정적이고 신뢰성 높은 애플리케이션을 구축할 수 있습니다.