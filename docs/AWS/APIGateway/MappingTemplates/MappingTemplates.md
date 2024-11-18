## 1 AWS API Gateway Mapping Templates 심층 이해

- AWS API Gateway의 Mapping Templates는 API 요청과 응답 데이터를 변환하는 강력한 도구입니다.
- 이 기능은 주로 통합(Integration) 단계에서 사용되며, 클라이언트와 백엔드 서비스 간의 데이터 형식 차이를 해결합니다.
- Mapping Templates는 Apache Velocity Template Language(VTL)를 기반으로 하며, JSON 데이터 조작에 특화되어 있습니다.



## 2 API Gateway 요청/응답 흐름 이해

- API Gateway에서 요청과 응답의 흐름은 다음과 같습니다:
	1. Method Request
	2. Integration Request
	3. Backend
	4. Integration Response
	5. Method Response
- Method Request/Response: API의 구조와 인증을 정의합니다.
- Integration Request/Response: 실제 데이터 변환이 일어나는 단계입니다.
- Mapping Templates는 Integration Request와 Integration Response 단계에서 적용됩니다.



## 3 Mapping Templates의 적용 위치

### 3.1 Integration Request에서의 Mapping Template

- 클라이언트의 요청을 백엔드 서비스가 이해할 수 있는 형식으로 변환합니다.
- 예: JSON 형식의 요청 본문을 XML로 변환하거나, 요청 파라미터를 재구성할 때 사용합니다.



### 3.2 Integration Response에서의 Mapping Template

- 백엔드 서비스의 응답을 클라이언트가 기대하는 형식으로 변환합니다.
- 예: XML 응답을 JSON으로 변환하거나, 응답 데이터 구조를 재구성할 때 사용합니다.



## 4 Mapping Templates 작성 방법

- VTL과 JSONPath 표현식을 사용하여 작성합니다.



**기본 Mapping Template 구조**

```velocity
#set($inputRoot = $input.path('$'))
{
    "transformedKey": "$inputRoot.originalKey",
    "newValue": "$inputRoot.someValue.toUpperCase()"
}
```

- `$input.path('$')`: 입력 JSON의 루트에 접근합니다.
- `$inputRoot.originalKey`: JSON 경로로 특정 값에 접근합니다.
- `$inputRoot.someValue.toUpperCase()`: 값을 변환합니다.



## 5 Mapping Templates 사용 예시

### 5.1 Integration Request Mapping 예시

- 클라이언트 요청을 백엔드 형식으로 변환하는 예시입니다.



**클라이언트 요청 데이터**

```json
{
  "name": "John Doe",
  "age": 30
}
```



**Mapping Template (Integration Request)**

```velocity
#set($inputRoot = $input.path('$'))
{
  "user": {
    "fullName": "$inputRoot.name",
    "yearOfBirth": $util.escapeJavaScript("$input.json('$.age')"),
    "requestTime": "$context.requestTime"
  }
}
```



**변환된 백엔드 요청 데이터**

```json
{
  "user": {
    "fullName": "John Doe",
    "yearOfBirth": 1993,
    "requestTime": "20-Jun-2023 14:30:45"
  }
}
```



### 5.2 Integration Response Mapping 예시

- 백엔드 응답을 클라이언트 형식으로 변환하는 예시입니다.



**백엔드 응답 데이터**

```json
{
  "userId": 123,
  "userDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```



**Mapping Template (Integration Response)**

```velocity
#set($inputRoot = $input.path('$'))
{
  "id": $inputRoot.userId,
  "name": "$inputRoot.userDetails.firstName $inputRoot.userDetails.lastName",
  "contact": "$inputRoot.userDetails.email"
}
```



**변환된 클라이언트 응답 데이터**

```json
{
  "id": 123,
  "name": "John Doe",
  "contact": "john@example.com"
}
```



## 6 Mapping Templates 활용 팁

- 조건문 사용: `#if`, `#else`, `#elseif`를 사용하여 조건부 로직을 구현합니다.
- 반복문 사용: `#foreach`를 사용하여 배열이나 맵을 순회합니다.
- 유틸리티 메소드: `$util.escapeJavaScript()`, `$util.urlEncode()` 등을 활용합니다.
- 컨텍스트 변수: `$context` 객체를 통해 API 요청의 메타데이터에 접근합니다.



## 7 주의사항 및 모범 사례

- 성능 고려: 복잡한 변환 로직은 지연 시간을 증가시킬 수 있으므로 단순화합니다.
- 에러 처리: `$util.parseJson($input.json('$'))`를 사용하여 JSON 파싱 오류를 방지합니다.
- 보안: 민감한 정보를 노출하지 않도록 주의합니다.
- 테스트: API Gateway 콘솔의 테스트 기능을 활용하여 템플릿을 검증합니다.



## 8 결론

- AWS API Gateway의 Mapping Templates는 Integration 단계에서 데이터를 변환하는 강력한 도구입니다.
- 클라이언트와 백엔드 간의 데이터 형식 불일치를 해결하고, API의 유연성을 크게 향상시킵니다.
- Integration Request와 Integration Response에서 적절히 사용하여 원활한 데이터 흐름을 구현할 수 있습니다.
- 복잡한 변환 로직은 API 성능에 영향을 줄 수 있으므로, 균형 있는 사용이 중요합니다.
- Mapping Templates를 효과적으로 활용하면 더 유연하고 강력한 API를 구축할 수 있습니다.