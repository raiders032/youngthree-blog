## 1 HTTP Header

* 헤더와 메서드는 클라이언트와 서버가 무엇을 하는지 결정하기 위해 함께 사용된다.
* 헤더의 종류는 크게 다섯 가지로 분류된다.
	* 일반 헤더(general headers)
	* 요청 헤더(request headers)
	* 응답 헤더(response headers)
	* 엔티티 헤더(entity headers)
	* 확장 헤더(extension headers)

## 2 일반 헤더(general headers)

- 일반 헤더는 서버와 클라이언트 모두가 사용한다.
- 예를 들어 Date 헤더는 서버와 클라이언트를 가리지 않고 메시지가 만들어진 시점을 지칭하기 위해 사용된다.

## 3 요청 헤더(request headers)

- 요청 헤더는 클라이언트가 서버에 보내는 요청 메시지에 포함되는 부가 정보입니다. 
- 이를 통해 클라이언트는 서버에게 자신이 선호하는 데이터 타입이나 기타 중요한 정보를 전달합니다.

### 3.1 기타 요청 헤더

| 헤더       | 설명                                               |
| ---------- | -------------------------------------------------- |
| Client-IP  | 클라이언트가 실행된 컴퓨터의 IP를 제공한다.        |
| From       | 클라이언트 사용자의 메일 주소를 제공한다.          |
| Host       | 요청의 대상이 되는 서버의 호스트 명과 포트를 준다. |
| Referer    | 현재 요청 URI가 들어있었던 문서의 URL을 제공한다.  |
| User-Agent | 요청을 보낸 애플리케이션 이름을 서버에게 말해준다. |



#### 3.1.1 Host

- 요청한 호스트의 정보를 담고 있습니다.
- HTTP/1.1에서는 필수 헤더입니다.
- 하나의 서버가 여러 도메인을 처리하거나, 하나의 IP 주소에 여러 도메인이 연결된 경우에 중요합니다.



#### 3.1.2 User-Agent

- 클라이언트 애플리케이션 정보(예: 웹 브라우저 종류와 버전)를 제공합니다.
- 예시: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36`
- 서버는 이 정보를 통해 클라이언트별 최적화된 컨텐츠를 제공하거나 통계를 수집할 수 있습니다.



#### 3.1.3 Referer

- 현재 요청된 페이지로 연결되는 이전 웹 페이지의 주소를 담고 있습니다.
- 웹 사이트 유입 경로 분석에 사용될 수 있습니다.
- 참고: 'referer'는 'referrer'의 오타지만, 그대로 사용되고 있습니다.



#### 3.1.4 X-Forwarded-For

- 클라이언트의 실제 IP 주소를 서버에 전달하는 데 사용됩니다.
- 프록시 서버나 로드 밸런서를 통해 요청이 전달될 때 유용합니다.
- 형식: `X-Forwarded-For: client_ip, proxy1_ip, proxy2_ip`
- 보안 및 로깅 목적으로 사용되며, 클라이언트의 실제 위치를 파악하는 데 도움이 됩니다.



#### 3.1.4 X-Forwarded-For

- 클라이언트의 실제 IP 주소를 서버에 전달하는 데 사용됩니다.
- 프록시 서버나 로드 밸런서를 통해 요청이 전달될 때 유용합니다.
- 형식: `X-Forwarded-For: client_ip, proxy1_ip, proxy2_ip`
- 보안 및 로깅 목적으로 사용되며, 클라이언트의 실제 위치를 파악하는 데 도움이 됩니다.



#### 3.1.5 X-Forwarded-Host

- 클라이언트가 요청한 원본 호스트를 나타냅니다.
- 프록시나 로드 밸런서를 통과할 때 원래의 Host 헤더 값을 보존합니다.
- 예: `X-Forwarded-Host: www.original-host.com`



#### 3.1.6 X-Forwarded-Proto

- 클라이언트가 서버에 연결할 때 사용한 원본 프로토콜(HTTP 또는 HTTPS)을 나타냅니다.
- SSL 종료 프록시 뒤에 있는 서버가 원래 요청이 HTTPS였는지 확인하는 데 유용합니다.
- 예: `X-Forwarded-Proto: https`



#### 3.1.7 X-Forwarded-Port

- 클라이언트가 서버에 연결할 때 사용한 원본 포트를 나타냅니다.
- 프록시나 로드 밸런서가 다른 포트로 요청을 전달할 때 원래 포트 정보를 유지하는 데 사용됩니다.
- 예: `X-Forwarded-Port: 443`

#### 3.1.8 X-Real-IP

- X-Forwarded-For와 유사하지만, 가장 처음 클라이언트의 IP 주소만을 포함합니다.
- 일부 프록시 서버나 로드 밸런서에서 사용됩니다.
- 예: `X-Real-IP: 203.0.113.195`

### 3.2 Accpt 관련 헤더

| 헤더            | 설명                                                |
| --------------- | --------------------------------------------------- |
| Accept          | 서버에게 서버가 보내도 되는 미디어 종류를 말해준다. |
| Accept-Charset  | 서버에게 서버가 보내도 되는 문자집합을 말해준다.    |
| Accept-Encoding | 서버에게 서버가 보내도 되는 인코딩을 말해준다.      |
| Accept-Language | 서버에게 서버가 보내도 되는 언어를 말해준다.        |



**협상과 우선순위**

```http
GET /event
Accept-Language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7
```

* Quality Values(q) 값 사용
* 0~1, 클수록 높은 우선순위
* 생략하면 1

```http
GET /event
Accept: text/*, text/plain, text/plain;format=flowed, */*
```

* 구체적인 것이 우선한다
* 우선순위
  1. `text/plain;format=flowed`
  2. `text/plain`
  3. `text/*`
  4. `*/*`





### 3.3 **요청 보안 헤더**

| 헤더          | 설명                                                         |
| ------------- | ------------------------------------------------------------ |
| Authorization | 클라이언트가 서버에게 제공하는 인증 그자체에 대한 정보를 담고 있다. |
| Cookie        | 클라이언트가 서버에게 토큰을 전달할 때 사용한다. 진짜 보안 헤더는 아니지만 보안에 영향을 줄 수 있다는 것을 확실 |



#### 3.3.1 Authorization

* 클라이언트 인증 정보를 서버에 전달
* Authorization: Basic xxxxxxxxxxxxxxxx



#### 3.3.2 Cookie 

* 클라이언트가 서버에서 받은 쿠키를 저장하고, HTTP 요청시 서버로 전달



## 4 응답 헤더(response headers)

- 응답 메시지는 클라이언트에게 정보를 제공하기 위한 자신만의 헤더를 가지고 있다.



### 4.1 기타 헤더

| 헤더   | 설명                            |
| ------ | ------------------------------- |
| Age    | 응답이 얼마나 오래되었는지      |
| Server | 서버 애플리케이션의 이름과 버전 |



#### 4.1.1 Server

* 요청을 처리하는 ORIGIN 서버의 소프트웨어 정보
  * 여러 서버중 응답을 만들어 준 서버를 ORIGIN 서버라고한다.
* 예시 `Server: Apache/2.2.22 (Debian)`



### 4.2 협상 헤더

| 헤더          | 설명                                                         |
| ------------- | ------------------------------------------------------------ |
| Accept-Ranges | 서버가 자원데 대해 받아들일 수 있는 범위의 형태              |
| Vary          | 서버가 확인해 보아야 하고 그렇기 때문에 응답에 영향을 줄 수 있는 헤더들의 목록이다. 예를 들어 서버가 클라이언트에게 보내줄 리소스의 가장 적절한 버전을 선택하기 위해 살펴보아야하는 헤더들의 목록 |



### 4.3 응답 보안 헤더

#### 4.3.1 Set-Cookie

* 서버에서 클라이언트로 쿠키 전달(응답)



#### 4.3.2 WWW-Authenticate

* 리소스 접근시 필요한 인증 방법 정의
* 401 Unauthorized 응답과 함께 사용
* WWW-Authenticate: Newauth realm="apps", type=1,  title="Login to \"apps\"", Basic realm="simple"



## 5 엔티티 헤더(entity headers)

- 엔티티 헤더란 엔티티 본문에 대한 헤더를 말한다.
- 엔티티 헤더는 본문에 들어있는 데이터의 타입이 무엇인지 말해줄 수 있다.
- `Content-Type: text/html; charset=iso-latin-1`
  - 애플리케이션에게 데이터가 iso-latin-1 문자집합으로 된 HTML 문서임을 알려준다.



### 5.1 기타 헤더

| 헤더       | 설명                                                                             |
| -------- | ------------------------------------------------------------------------------ |
| Allow    | 이 엔티티에 대해 수행할 수 있는 요청 메서드를 나열한다.                                               |
| Location | 클라이언트에게 엔티티가 실제로 어디에 위치하고 있는지 말해준다. 수신자에게 리소스에 대한 아마도 새로운 위치(URL)를 알려줄 때 사용한다. |



### 5.2 콘텐츠 헤더



#### 5.2.1 [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)

* Content-Type은 representation 헤더이다.
* 이 헤더에 엔티티 본문의 MIME 타입을 기술한다.
* 응답과 요청에서 모두 사용된다



**응답 예시**

```http
HTTP/1.1 200 OK
Content-Type: text/html;charset=UTF-8 
Content-Length: 3423

<html> 
	<body>...</body>
</html>
```

```http
HTTP/1.1 200 OK 
Content-Type: application/json 
Content-Length: 16

{"data":"hello"}
```



##### **multipart/form-data 타입**

- HTML 폼을 이용한 전송 방식에는 두 가지 방식이 있다
  - `application/x-www-form-urlencoded`
  - `multipart/form-data`
  - HTML에 `enctype` 속성을 따로 명시하지 않으면 기본적으로 `application/x-www-form-urlencoded` 가 선택된다
- `multipart/form-data`은 문자와 바이너리(파일)을 동시에 전송할 때 사용한다
- `application/x-www-form-urlencoded`은 엔티티 본문에 문자열을 담고 있기 때문에 파일을 전송할 수 없다.



**multipart/form-data 사용 예시**

- 아래와 같이 `multipart/form-data`을 사용하려면 `enctype` 속성에 명시해야 한다.
- HTML에 `enctype` 속성을 따로 명시하지 않으면 기본적으로 `application/x-www-form-urlencoded` 가 선택된다

```html

<form action="/" method="post" enctype="multipart/form-data">
    <input type="text" name="description" value="some text">
    <input type="file" name="myFile">
    <button type="submit">Submit</button>
</form>
```



**http request**

- boundary 문자로 컨텐츠가 구분되어 있다
- `Content-Disposition` : 항목별 헤더가 추가되어 있고 여기에 부가 정보를 추가한다
- 폼의 일반 데이터는 문자가 전송되고 파일의 경우 파일 이름과 `Content-Type` 이 추가되고 바이너리 데이터가 전송된다

``````http
POST /foo HTTP/1.1
Content-Length: 68137
Content-Type: multipart/form-data; boundary=---------------------------974767299852498929531610575

-----------------------------974767299852498929531610575
Content-Disposition: form-data; name="description"

some text
-----------------------------974767299852498929531610575
Content-Disposition: form-data; name="myFile"; filename="example.jpg"
Content-Type: image/jpeg

<이미지 바이너리 데이터>
-----------------------------974767299852498929531610575--
``````



#### 5.2.2 Content-Encoding

* 표현 데이터를 압축하기 위해 사용
* 데이터를 전달하는 곳에서 압축 후 인코딩 헤더 추가 
* 데이터를 읽는 쪽에서 인코딩 헤더의 정보로 압축 해제
* 예시
  * gzip, deflate, identity

```http
HTTP/1.1 200 OK
Content-Type: text/html;charset=UTF-8 
Content-Encoding: gzip 
Content-Length: 521

lkj123kljoiasudlkjaweioluywlnfdo912u34ljko98udjkl
```



#### 5.2.3 **Content-Language**

* 표현 데이터의 자연 언어
* 예시
  * ko, en, en-US

```http
HTTP/1.1 200 OK
Content-Type: text/html;charset=UTF-8 
Content-Language: ko 
Content-Length: 521

<html> 
안녕하세요.
</html>
```



#### 5.2.4 Content-Length

* 표현 데이터의 길이

```http
HTTP/1.1 200 OK
Content-Type: text/html;charset=UTF-8 
Content-Length: 5

hello
```





### 5.3 엔티티 캐싱 헤더



## 6 확장 헤더(extension headers)

- 확장 헤더는 애플리케이션 개발자들에 의해 만들어졌지만 아직 승인된 HTTP 명세에는 추가되지 않은 `비표준 헤더`다.
- HTTP 프로그램들은 확장 헤더의 의미를 모른다 할지라도 용인하고 전달해야할 필요가 있다.



참고

- 