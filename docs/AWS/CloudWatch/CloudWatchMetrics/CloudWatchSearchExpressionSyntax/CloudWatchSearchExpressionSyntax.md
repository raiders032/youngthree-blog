---
title: "Amazon CloudWatch 검색 표현식 완벽 가이드"
description: "Amazon CloudWatch의 검색 표현식 기능을 처음부터 차근차근 알아봅니다. 기본 문법부터 실제 사용 사례까지, 실무에서 바로 활용할 수 있는 상세한 예제와 함께 설명하는 완벽 가이드입니다. 초보자도 쉽게 이해할 수 있는 CloudWatch 모니터링의 핵심 기능을 다룹니다."
tags: ["CLOUDWATCH", "MONITORING", "AWS", "DEVOPS", "CLOUD"]
keywords: ["클라우드워치", "CloudWatch", "검색표현식", "search expression", "AWS", "모니터링", "monitoring", "지표", "metrics", "아마존웹서비스", "devops", "데브옵스", "운영", "클라우드", "cloud", "관측성", "observability"]
draft: false
hide_title: true
---

## 1. CloudWatch 검색 표현식이란?

CloudWatch 검색 표현식은 AWS 서비스의 지표(metrics)를 쉽고 효과적으로 찾고 시각화하기 위한 강력한 쿼리 언어입니다. 복잡한 필터링이나 여러 지표를 한 번에 검색할 때 특히 유용합니다.

## 2. 검색 표현식의 기본 구조

### 2.1 기본 문법

검색 표현식의 기본 형식은 다음과 같습니다:

```
SEARCH(' {Namespace, DimensionName1, DimensionName2, ...} SearchTerm', 'Statistic')
```

각 구성 요소를 자세히 살펴보겠습니다:

1. **SEARCH**: 검색을 시작하는 키워드입니다.
2. **`중괄호 {...}`**: 검색할 지표의 범위를 지정합니다.
	- Namespace: AWS 서비스나 사용자 정의 네임스페이스
	- DimensionName: 지표를 구분하는 차원들
3. **SearchTerm**: 실제 검색할 용어나 조건
4. **Statistic**: 데이터를 어떻게 집계할지 지정 (Average, Sum 등)

### 2.2 실제 예시

```
SEARCH('{AWS/EC2,InstanceId} MetricName="CPUUtilization"', 'Average')
```

이 예시는:
- AWS/EC2 네임스페이스에서
- InstanceId 차원을 가진
- CPUUtilization이라는 지표를 검색하여
- Average(평균) 통계값을 보여줍니다

:::tip
처음 사용할 때는 이미 알고 있는 지표로 시작하여 검색 표현식에 익숙해지는 것이 좋습니다.
:::

## 3. 토큰화 - 검색의 기본 원리

### 3.1 토큰화란?

토큰화는 검색 시스템이 문자열을 작은 단위(토큰)로 나누는 과정입니다. CloudWatch는 이 토큰들을 사용해 검색을 수행합니다.

### 3.2 토큰화 규칙

CloudWatch는 다음과 같은 규칙으로 문자열을 토큰으로 나눕니다:

1. **대문자 구분**: 낙타 표기법의 대문자를 기준으로 나눔
2. **숫자 구분**: 숫자는 새로운 토큰의 시작
3. **특수문자 구분**: 영숫자가 아닌 문자는 구분자로 사용

### 3.3 토큰화 예시 상세 설명

| 원래 문자열 | 생성된 토큰 | 설명                                                 |
|------------|------------|----------------------------------------------------|
| CustomCount1 | customcount1, custom, count, 1 | - 'Custom'과 'Count'는 대문자로 시작해 분리 - '1'은 숫자라서 별도 토큰 |
| SDBFailure | sdbfailure, sdb, failure | - 'SDB'와 'Failure'는 대문자로 구분 - 모든 토큰은 소문자로 변환       |
| Project2-trial333 | project2trial333, project, 2, trial, 333 | - 하이픈(-)은 구분자로 사용 - 숫자들(2, 333)은 별도 토큰             |

:::info
토큰화를 이해하면 검색어를 더 효과적으로 작성할 수 있습니다. 예를 들어, "CPUUtilization"을 검색할 때 "cpu" 또는 "util"로도 찾을 수 있습니다.
:::

## 4. 검색 일치 방식 상세 설명

### 4.1 부분 일치 검색

부분 일치는 가장 기본적인 검색 방식입니다.

#### 특징:
- 대소문자를 구분하지 않음
- 토큰의 일부만 일치해도 검색됨
- 여러 토큰이 연속된 복합 토큰 검색 가능

#### 예시:
```
# 다음 검색어들은 모두 'CustomCount1' 지표를 찾을 수 있습니다
SEARCH(' count ', 'Average')
SEARCH(' Count ', 'Average')
SEARCH(' COUNT ', 'Average')
```

:::warning
'couNT'는 'cou'와 'NT'로 토큰화되어 'CustomCount1'을 찾지 못합니다!
:::

### 4.2 정확한 일치 검색

정확한 값을 찾을 때는 큰따옴표를 사용합니다.

#### 규칙:
- 대소문자를 정확히 구분
- 전체 문자열이 정확히 일치해야 함
- 영숫자가 아닌 문자도 정확히 일치해야 함

#### 예시:
```
# 네임스페이스에 공백이 있는 경우
SEARCH(' {"My Namespace"} MetricName="Errors" ', 'Average')

# 특수문자가 포함된 경우
SEARCH(' {"Custom@Namespace", "Dimension#Name"} ', 'Maximum')
```

## 5. 검색 범위 지정과 필터링

### 5.1 지표 스키마 사용

지표 스키마를 사용하면 검색 범위를 효과적으로 좁힐 수 있습니다.

```
# EC2 인스턴스의 CPU 사용률만 검색
SEARCH(' {AWS/EC2,InstanceId} MetricName="CPUUtilization" ', 'Average')

# 특정 인스턴스 유형의 메트릭 검색
SEARCH(' {AWS/EC2,InstanceType} "t2.micro" ', 'Average')
```

### 5.2 속성 이름 지정

검색을 더 정확하게 하려면 속성 이름을 지정하세요.

```
# 지표 이름으로만 검색
SEARCH(' MetricName="CPUUtilization" ', 'Average')

# 네임스페이스와 인스턴스 유형 조합
SEARCH(' InstanceType="t2.micro" Namespace="AWS/EC2" ', 'Average')
```

## 6. 부울 연산자 활용

### 6.1 기본 연산자

CloudWatch 검색에서는 세 가지 부울 연산자를 사용할 수 있습니다:

- **AND**: 모든 조건이 일치
- **OR**: 하나 이상의 조건이 일치
- **NOT**: 조건을 제외

:::warning
부울 연산자는 반드시 대문자로 작성해야 합니다. 'and', 'or', 'not'은 작동하지 않습니다.
:::

### 6.2 부울 연산자 사용 예시

#### 기본 사용
```
# EC2와 EBS 중 ReadOps 지표 검색
SEARCH(' (EC2 OR EBS) AND MetricName=ReadOps ', 'Maximum')

# 특정 인스턴스 제외
SEARCH(' {AWS/EC2,InstanceId} MetricName="CPUUtilization" NOT i-1234567890123456 ', 'Average')
```

#### 복잡한 조건 조합
```
# 중첩 조건 사용
SEARCH(' {AWS/Lambda,FunctionName} MetricName="Errors" OR (MetricName="Invocations" AND (ProjectA OR ProjectB)) ', 'Average')
```

## 7. 수학 표현식과 함께 사용

### 7.1 기본 사용법

검색 표현식은 수학 표현식 내에서 사용할 수 있습니다.

```
# 모든 Lambda 함수의 오류 합계
SUM(SEARCH(' {AWS/Lambda, FunctionName} MetricName="Errors" ', 'Sum'))
```

### 7.2 복합 사용 예시

여러 줄의 표현식을 조합하여 사용할 수 있습니다:

```
# 첫 번째 줄: 개별 함수의 오류 (ID: e1)
SEARCH(' {AWS/Lambda, FunctionName}, MetricName="Errors" ', 'Sum')

# 두 번째 줄: 전체 오류 합계
SUM(e1)
```

## 8. 특수한 사용 사례

### 8.1 크로스 계정 관측성

CloudWatch 크로스 계정 관측성이 설정된 경우, 계정 ID를 지정하여 검색할 수 있습니다.

```
# 특정 계정의 지표 검색
SEARCH(' :aws.AccountId = 444455556666 ', 'Average')

# 모니터링 계정 자체의 지표 검색
SEARCH(' :aws.AccountId = "LOCAL" ', 'Average')
```

### 8.2 특수 문자 처리

특수 문자가 포함된 이름을 검색할 때는 백슬래시로 이스케이프 처리가 필요합니다.

다음 문자는 반드시 이스케이프 처리해야 합니다:
- 큰따옴표 (\\")
- 백슬래시 (\\\\)
- 괄호 \\( \\)

```
# 특수 문자가 포함된 이름 검색
SEARCH(' "Europe\\France Traffic\(Network\)" ', 'Maximum')
```

## 9. 제한 사항 및 주의사항

### 9.1 기본 제한 사항

- 쿼리 최대 크기: 1024자
- 그래프당 최대 검색 표현식: 100개
- 그래프당 최대 시계열: 500개
- 검색 가능 기간: 최근 2주 이내 데이터만 검색 가능

:::warning
제한 사항을 초과하면 검색이 실패하거나 불완전한 결과가 반환될 수 있습니다.
:::

### 9.2 성능 최적화 팁

1. 가능한 한 네임스페이스와 차원을 지정하여 검색 범위를 좁히세요
2. 복잡한 검색은 여러 개의 간단한 검색으로 나누어 수행하세요
3. 자주 사용하는 검색은 대시보드에 저장하여 재사용하세요

## 10. 실전 활용 예시

### 10.1 일반적인 모니터링 시나리오

```
# 모든 EC2 인스턴스의 CPU 사용률 모니터링
SEARCH(' {AWS/EC2,InstanceId} MetricName="CPUUtilization" ', 'Average')

# 특정 태그가 있는 인스턴스만 모니터링
SEARCH(' {AWS/EC2,InstanceId} MetricName="CPUUtilization" "prod" ', 'Average')

# 여러 리전의 Lambda 함수 오류 모니터링
SEARCH(' {AWS/Lambda,FunctionName} MetricName="Errors" OR MetricName="Throttles" ', 'Sum')
```

### 10.2 고급 모니터링 시나리오

```
# 프로덕션 환경의 고비용 인스턴스 찾기
SEARCH(' {AWS/EC2,InstanceId} MetricName="CPUUtilization" "prod" NOT (t2 OR t3) ', 'Average')

# 특정 프로젝트의 모든 AWS 리소스 모니터링
SEARCH(' ProjectName="MyProject" NOT Namespace="AWS/Logs" ', 'Average')
```

:::tip
실제 환경에 적용하기 전에 테스트 환경에서 검색 표현식을 충분히 테스트하세요.
:::