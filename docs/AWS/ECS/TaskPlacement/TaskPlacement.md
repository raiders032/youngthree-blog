## 1 Task Placement

- Amazon Elastic Container Service(ECS)는 Amazon EC2 인스턴스 클러스터에서 Docker 컨테이너를 실행하고 관리할 수 있게 해줍니다.
- ECS의 핵심 기능 중 하나는 작업 배치(Task Placement)로, 이는 사용 가능한 인스턴스에 작업을 어떻게 스케줄링하고 배치할지 결정합니다. 
- 작업 배치 기능은 EC2 런치 타입에서만 적용할 수 있습니다.



## 2 작업 배치 과정

- 작업 배치 전략은 최선의 노력을 다해 수행됩니다.
- Amazon ECS가 태스크를 배치할 때, 다음의 과정을 통해 적절한 EC2 컨테이너 인스턴스를 선택합니다:



**작업 배치 과정**

1. **CPU, 메모리 및 포트 요구사항을 충족하는 인스턴스 식별**
    - ECS는 먼저 태스크의 리소스 요구사항(CPU, 메모리, 포트)을 만족시키는 인스턴스를 식별합니다.
    - 이는 태스크가 필요한 자원을 효율적으로 사용할 수 있도록 보장합니다.
2. **작업 배치 제약 조건을 충족하는 인스턴스 식별**
    - 이후 ECS는 특정 태스크가 요구하는 제약 조건을 만족하는 인스턴스를 확인합니다.
    - 예를 들어, 특정 가용 영역 또는 특정 태그가 붙은 인스턴스만 선택할 수 있습니다.
3. **작업 배치 전략을 충족하는 인스턴스 식별**
    - 마지막으로 ECS는 지정된 배치 전략을 충족하는 인스턴스를 선택합니다.
    - 이는 태스크의 분산 및 균형을 최적화하기 위해 사용됩니다.
4. **인스턴스 선택**
    - 앞의 모든 단계를 거쳐 최종적으로 태스크를 실행할 인스턴스를 선택합니다.



## 3 작업 배치 전략

- ECS는 클러스터 내에서 작업을 분배하는 여러 배치 전략을 제공합니다. 
- 이러한 전략은 자원 활용을 최적화하고 부하를 분산하며 높은 가용성을 보장하는 데 도움이 됩니다.



### 3.1 Binpack

- Binpack 전략은 CPU 또는 메모리의 가장 적은 사용량을 기준으로 작업을 배치합니다. 
- EC2 인스턴스 사용을 최소화하여 비용 절감에 도움이 됩니다.



**사용 예시**

```json

"placementStrategy": [
	{
		"type": "binpack",
		"field": "cpu"
	}
]
    ```



### 3.2 Random

- Random 전략은 사용 가능한 인스턴스에 작업을 무작위로 분배합니다. 
- 이 전략은 특정 자원 제약 없이 부하를 분산하는 데 도움이 됩니다.



 **사용 예시**
 
```json
"placementStrategy": [
	{
		"type": "random"
	}
]
```



### 3.3 Spread

- Spread 전략은 지정된 속성(예: 인스턴스 ID, 가용 영역 또는 사용자 정의 속성)을 기준으로 작업을 고르게 분배합니다.
-  이 전략은 높은 가용성과 내결함성을 향상시킵니다.



**사용 예시**

```json
"placementStrategy": [
	{
		"type": "spread",
		"field": "attribute:ecs.availability-zone"
	}
]
```

- 작업을 서로 다른 가용 영역에 분배.



## 4 배치 제약 조건

- 배치 제약 조건은 작업을 배치할 위치를 지정하는 규칙입니다. 
- 이들은 배치 전략과 함께 사용되어 작업 배치를 보다 정밀하게 제어할 수 있습니다.



### 4.1 MemberOf

- MemberOf 제약 조건은 작업이 특정 조건을 충족하는 인스턴스에 배치되도록 보장합니다. 
- 이는 작업 배치를 위한 사용자 정의 규칙을 정의하는 데 유용합니다.



**사용 예시**

```json
"placementConstraints": [
	{
		"type": "memberOf",
		"expression": "attribute:ecs.instance-type =~ t2.*"
	}
]
```

- 특정 속성을 가진 인스턴스에 작업 배치.



### 4.2 DistinctInstance

- DistinctInstance 제약 조건은 동일한 작업 정의의 작업이 서로 다른 인스턴스에 배치되도록 보장합니다.
- 이 제약 조건은 동일한 인스턴스에 여러 작업이 집중되지 않도록 하여 가용성을 높입니다.



**사용 예시**

```json
"placementConstraints": [
	{
		"type": "distinctInstance"
	}
]
```




**참고 자료**

- [Amazon ECS 공식 문서](https://docs.aws.amazon.com/ecs/latest/userguide/what-is-ecs.html)
- [ECS 작업 배치 전략](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-placement-strategies.html)
