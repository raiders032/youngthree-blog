## 1 ELB Request Routing Algorithms

- Elastic Load Balancing(ELB)의 핵심 기능 중 하나는 들어오는 요청을 여러 대상에 효율적으로 분배하는 것입니다.
- 이를 위해 ELB는 다양한 Request Routing Algorithms(요청 라우팅 알고리즘)을 제공합니다.
- 각 알고리즘은 특정 상황과 요구사항에 맞게 최적화되어 있어, 적절한 선택이 중요합니다.



## 2 주요 Request Routing Algorithms

### 2.1 Round Robin

- 가장 기본적이고 널리 사용되는 알고리즘입니다.
- 들어오는 요청을 순차적으로 각 대상에 균등하게 분배합니다.
- 모든 대상이 동일한 처리 능력을 가질 때 효과적입니다.
- Application Load Balancer(ALB)와 Network Load Balancer(NLB)에서 기본으로 사용됩니다.



### 2.2 Least Outstanding Requests (LOR)

- 현재 처리 중인 요청이 가장 적은 대상으로 새로운 요청을 라우팅합니다.
- 대상 간 처리 능력 차이가 있거나, 요청 처리 시간이 다양할 때 유용합니다.
- Application Load Balancer에서 사용 가능합니다.



### 2.3 Weighted Target Groups

- 각 대상 그룹에 가중치를 할당하여 트래픽 분배 비율을 조정합니다.
- 서로 다른 용량이나 중요도를 가진 대상 그룹 간에 트래픽을 분배할 때 유용합니다.
- Application Load Balancer에서 지원됩니다.



### 2.4 Flow Hash

- 연결의 특정 속성(예: 소스 IP, 목적지 IP, 프로토콜 등)을 기반으로 일관된 해시를 생성하여 라우팅합니다.
- 동일한 클라이언트에서 오는 연결이 항상 같은 대상으로 라우팅되도록 보장합니다.
- Network Load Balancer에서 주로 사용됩니다.



## 3 ELB 유형별 지원 알고리즘

### 3.1 Application Load Balancer (ALB)

- Round Robin (기본)
- Least Outstanding Requests
- Weighted Target Groups



### 3.2 Network Load Balancer (NLB)

- Flow Hash (기본)
- Round Robin (추가 설정 필요)



### 3.3 Classic Load Balancer (CLB)

- Round Robin (기본)
- Sticky Sessions (선택적)



## 4 알고리즘 설정 방법

### 4.1 Application Load Balancer (ALB)

#### 4.1.1 Round Robin (기본 설정)

- 별도의 설정이 필요 없습니다. ALB의 기본 동작입니다.



#### 4.1.2 Least Outstanding Requests

- AWS Management Console에서 설정할 수 없으며, AWS CLI나 SDK를 통해 설정해야 합니다.



**AWS CLI를 사용한 설정 예시:**

```bash
aws elbv2 modify-target-group-attributes \
    --target-group-arn arn:aws:elasticloadbalancing:region:account-id:targetgroup/my-targets/73e2d6bc24d8a067 \
    --attributes Key=load_balancing.algorithm.type,Value=least_outstanding_requests
```



#### 4.1.3 Weighted Target Groups

1. AWS Management Console에서 ALB를 선택합니다.
2. 'Listeners' 탭으로 이동합니다.
3. 규칙을 추가하거나 수정합니다.
4. 'Then forward to' 액션에서 여러 대상 그룹을 선택하고 각각에 가중치를 할당합니다.



**AWS CLI를 사용한 설정 예시:**

```bash
aws elbv2 create-rule \
    --listener-arn arn:aws:elasticloadbalancing:region:account-id:listener/app/my-load-balancer/50dc6c495c0c9188/f2f7dc8efc522ab2 \
    --priority 10 \
    --conditions Field=path-pattern,Values='/api/*' \
    --actions Type=forward,ForwardConfig='{TargetGroups=[{TargetGroupArn=arn:aws:elasticloadbalancing:region:account-id:targetgroup/my-targets/73e2d6bc24d8a067,Weight=80},{TargetGroupArn=arn:aws:elasticloadbalancing:region:account-id:targetgroup/my-other-targets/73e2d6bc24d8a067,Weight=20}]}'
```



### 4.2 Network Load Balancer (NLB)

#### 4.2.1 Flow Hash (기본 설정)

- 별도의 설정이 필요 없습니다. NLB의 기본 동작입니다.



#### 4.2.2 Round Robin

- NLB에서 Round Robin을 사용하려면 대상 그룹 유형을 'IP addresses'로 설정해야 합니다.



**AWS CLI를 사용한 설정 예시:**

```bash
aws elbv2 create-target-group \
    --name my-ip-targets \
    --protocol TCP \
    --port 80 \
    --target-type ip \
    --vpc-id vpc-3ac0fb5f
```



### 4.3 Classic Load Balancer (CLB)

#### 4.3.1 Round Robin (기본 설정)

- 별도의 설정이 필요 없습니다. CLB의 기본 동작입니다.



#### 4.3.2 Sticky Sessions

1. AWS Management Console에서 CLB를 선택합니다.
2. 'Description' 탭에서 'Edit attributes'를 클릭합니다.
3. 'Port Configuration'에서 'Enable load balancer generated cookie stickiness'를 선택합니다.
4. 쿠키 만료 기간을 설정합니다.

**AWS CLI를 사용한 설정 예시:**

```bash
aws elb create-lb-cookie-stickiness-policy \
    --load-balancer-name my-load-balancer \
    --policy-name my-cookie-policy \
    --cookie-expiration-period 60
```



## 5 알고리즘 선택 시 고려사항

- **애플리케이션 특성**: 상태 유지(stateful) vs 무상태(stateless) 애플리케이션
- **성능 요구사항**: 균등한 분배 vs 최적의 리소스 활용
- **클라이언트 요구사항**: 동일 서버로의 연속적인 요청 필요 여부
- **인프라 구성**: 대상의 처리 능력이 동일한지 여부
- **모니터링 및 분석**: 각 알고리즘의 성능을 모니터링하고 분석하여 최적의 선택을 할 것



## 6 결론

- ELB의 Request Routing Algorithms은 효율적인 트래픽 분배를 위한 핵심 기능입니다.
- 각 ELB 유형별로 지원하는 알고리즘이 다르므로, 사용 중인 로드 밸런서 유형을 고려해야 합니다.
- 애플리케이션의 특성과 요구사항에 맞는 알고리즘을 선택하고 적절히 구성하는 것이 중요합니다.
- 정기적인 모니터링과 성능 분석을 통해 선택한 알고리즘의 효과를 평가하고 필요시 조정해야 합니다.
- AWS CLI나 SDK를 활용하면 보다 세밀한 설정이 가능하므로, 복잡한 요구사항이 있는 경우 이를 활용하는 것이 좋습니다.