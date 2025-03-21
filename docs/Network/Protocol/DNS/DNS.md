---
title: "DNS(Domain Name System)의 이해와 동작 원리"
description: "DNS의 기본 개념부터 동작 원리, 구성 요소, 레코드 타입까지 상세히 알아봅니다. 도메인 이름이 IP 주소로 변환되는 전체 과정을 자세히 설명합니다."
tags: ["DNS", "NETWORK", "INFRASTRUCTURE", "WEB"]
keywords: ["DNS", "Domain Name System", "네임서버", "도메인", "IP 주소", "DNS 레코드", "DNS 동작원리", "네트워크"]
draft: false
---

## 1 DNS(Domain Name System)

### 1.1 DNS란?

- DNS는 도메인 이름을 IP 주소로 변환해주는 시스템입니다.
- 인터넷 프로토콜 통신에는 IP 주소가 필요하지만, 사람이 기억하기 어렵습니다.
- 따라서 IP 주소에 별칭(도메인 이름)을 붙여 사용하며, 이를 다시 IP 주소로 변환하는 과정을 name resolution이라고 합니다.
- DNS는 이러한 name resolution 기능을 제공하여 사용자가 쉽게 기억할 수 있는 도메인 이름으로 웹사이트에 접속할 수 있게 해줍니다.

#### IP 주소

- 컴퓨터 네트워크에서 장치들이 서로를 인식하고 통신을 하기 위해서 사용하는 특수한 번호입니다.
- 트워크에 연결된 장치가 라우터이든 일반 서버이든, 모든 기계는 이 특수한 번호를 가지고 있어야 합니다.
- [IP.md](../IP/IP.md)(IP 주소 참고)

### 1.2 hosts 파일
- 인터넷 상용화 이전(DNS가 없던 시절) 핸드폰에 전화번호를 저장하듯 각 단말에 hosts파일을 넣어두고 도메인과 IP 주소를 직접 관리했습니다.

#### hosts 파일

```
93.184.216.34	example.com
```

- hosts 파일은 `/etc/hosts`에 위치하며, 도메인과 IP 주소의 매핑 정보를 담고 있습니다.
- `example.com`에 요청을 보내면 먼저 hosts 파일에서 `example.com`을 찾아 이를 `93.184.216.34` IP 주소로 변환한 다음 통신을 이어갑니다.
- 즉 DNS가 없던 시절에는 hosts 파일을 통해 name resolution 기능을 사용했습니다.

#### hosts 파일의 단점

![image-20230725134625076](images/image-20230725134625076.png)

- 작은 네트워크의 경우 각각의 호스트의 hosts 파일을 관리하는 것이 가능했습니다.
- 하지만 네트워크가 커지고 호스트들이 많아 졌을 때를 생각해보면 hosts 파일로 name resolution을 관리하는 것은 매우 번거로운 일입니다.
- web이라는 도메인의 IP 주소를 변경하면 모든 호스트의 hosts 파일을 일괄적으로 업데이트해야 합니다.

![image-20230725135601081](images/image-20230725135601081.png)

- 인터넷이 상용화되어 네트워크가 거대해지자 더 이상 hosts 파일로는 관리할 수 없어졌고 name resolution 기능을 제공하는 별도의 중앙 서버를 만들게 되는데 이것이 바로 DNS입니다.
- 따라서 요즘에는 로컬에 존재하는 hosts 파일로 name resolution을 하지 않고 중앙 집중 서버인 DNS에 name resolution 기능을 사용합니다.
	- 하지만 지금도 IP 주소를 모르는 도메인이 있는 경우 hosts 파일에서 먼저 찾고 없을 때 DNS에 질의합니다.
	- 이러한 순서는 `/etc/nsswitch.conf` 파일에 `host: files dns`라고 기본 설정되어 있기 때문입니다.
	- 원하면 순서를 변경할 수 있습니다.

#### Host
- 네트워크에 연결된 장치(컴퓨터, 서버 등)들에게 부여되는 고유한 이름입니다.
- 도메인과 유사하지만 더 넓은 의미를 가지고 있습니다.
- 인터넷에서 호스트 이름은 인터넷에 연결된 호스트(컴퓨터)의 이름으로, 보통 호스트의 지역 이름에 도메인 이름을 붙인 것을 말합니다.
- 예를 들면, www.naver.com (웹 서버), mail.naver.com (메일 서버) 와 같이 네이버에서 사용되는 모든 호스트 이름에 naver.com이란 도메인 이름이 붙어 있습니다.

## 2 Domain

* IP 주소는 사람이 기억하기 어렵기 때문에 IP 주소에 이름을 부여할 수 있게 했는데, 이것을 도메인이라고 합니다.
* 넓은 의미로는 네트워크상에서 컴퓨터를 식별하는 호스트명을 가리키며, 좁은 의미에서는 도메인 레지스트리에게서 등록된 이름을 의미합니다.
* IP 주소 대신 도메인 주소를 이용하면 서비스중인 IP 주소가 변경되더라도 도메인 주소 그대로 유지해 접속 방법 변경없이 서비스를 그대로 유지할 수 있습니다

#### 도메인 이름의 구조

![image-20210419230348508.png](images/image-20210419230348508.png)
* root domain : `.`
* Top-level domain: `.com`
* Second-level domain: `example`
* Sub domain: `blog`

## 3 DNS 서버
- DNS 서버의 종류로 DNS Server, 루트 네임 서버, TLD 네임 서버, 권한 있는 네임 서버가 있습니다.
- DNS 서버는 DNS 쿼리의 첫 단계며 클라이언트와 DNS 네임서버 사이의 중개자 역할을 합니다.
- 루트 네임 서버는 DNS Server가 DNS 레코드를 요청하는 과정의 첫 단계입니다.
- TLD 네임 서버는 .com, .net 또는 URL의 마지막 점 뒤에 오는 것 같은 일반적인 도메인 확장자를 공유하는 모든 도메인 이름의 정보를 유지하고 있습니다.
- 권한 있는 네임 서버는 도메인 이름에 고유한 정보를 포함하며 DNS A 레코드에서 찾은 도메인의 IP 주소를 DNS Sever에 제공하거나, 도메인에 CNAME 레코드(별칭)가 있는 경우 DNS Sever에 별칭 도메인을 제공합니다.

### 3.1 DNS Server

* DNS Server 또는 Local DNS라고 불리며, 클라이언트가 DNS 쿼리를 보내는 곳입니다.
* DNS Server는 DNS 쿼리의 첫 단계며 클라이언트와 DNS 네임서버 사이의 중개자 역할을 합니다.
	* 쿼리: 도메인의 IP 주소를 찾는 행위

#### DNS Server의 동작 과정 

1. 웹 클라이언트로부터 DNS 쿼리를 받은 후 캐시된 데이터로 응답한다
2. 캐시된 데이터가 없는 경우 아래와 같은 동작을 거친다
3. 루트 네임서버에 DNS 쿼리
4. TLD 네임서버에 DNS 쿼리
5. 권한 있는 네임서버에 DNS 쿼리
6. 권한 있는 네임서버로부터 응답에는 도메인의 IP 주소가 있으며 응답을 클라이언트에 보냅니다.
7. 도메인과 매핑되는 IP 주소를 캐싱한다

#### DNS Server 설정 

- 대부분의 인터넷 사용자는 ISP에서 제공하는 DNS server를 사용하지만 아래와 같은 퍼블릭 DNS server를 이용하도록 설정할 수 있습니다.
  - [Cisco OpenDNS](https://www.opendns.com/setupguide/): 208.67.222.222 and 208.67.220.220;
  - [Cloudflare 1.1.1.1](http://1.1.1.1/): 1.1.1.1 and 1.0.0.1;
  - [Google Public DNS](https://dns.google.com/): 8.8.8.8 and 8.8.4.4; and
  - [Quad9](https://www.quad9.net/): 9.9.9.9 and 149.112.112.112.

![image-20210419225940424](images/image-20210419225940424.png)

### 3.2 루트 네임 서버

* 전 세계의 13개의 DNS 루트 네임서버가 있고 모든 DNS Server에 알려져 있습니다.
* 루트 네임 서버는 DNS Server가 DNS 레코드를 요청하는 과정의 첫 단계입니다.
* 루트 서버는 도메인 이름을 포함한 DNS Server의 쿼리를 수용하며 루트 네임서버는 해당 도메인의 확장자(.com,. net, .org, etc.)에 따라 DNS Server를 TLD 네임서버에 보내 응답합니다.
* 루트 네임서버는 비영리 단체인 ICANN(Internet Corporation for Assigned Names and Numbers)이 관리합니다.

### 3.3 TLD 네임 서버

* Top-level Domain Name Server
* TLD 네임서버는 .com, .net 또는 URL의 마지막 점 뒤에 오는 것 같은 일반적인 도메인 확장자를 공유하는 모든 도메인 이름의 정보를 유지하고 있습니다.
* 예를 들어 TLD 네임서버는 ‘.com’으로 끝나는 모든 웹사이트의 정보를 갖고 있습니다.
* 사용자가 google.com을 검색하는 경우 DNS Server는 루트 네임서버로부터 응답을 받은 후 쿼리를 .com TLD 네임서버에 보내고, 해당 네임서버는 해당 도메인의 권한 있는 네임서버를 가리켜 응답합니다.

#### 최상위 도메인의 종류
* 일반 최상위 도메인
	* 국가별로 고유하지 않은 도메인이다
	* 예) .com, .org, .net, .edu, .gov
* 국가 코드 최상위 도메인
	* 여기에는 국가 또는 주와 관련된 모든 도메인이 포함된다.
	*  예) .uk, .us, .ru, .jp
* TLD 네임 서버는 Registry(등록소)가 관리합니다.
	* .com, .net TLD 네임 서버는 VeriSign Global Registry Services 라는 기업이 관리한다.


### 3.4 권한 있는 네임 서버

* Authoritative Name Server
* DNS Sever가 TLD 네임서버로부터 응답을 받으면, DNS Sever는 해당 응답을 권한 있는 네임서버로 보내고, 권한 있는 네임서버는 해당 도메인의 정보를 가지고 있습니다. 
* 일반적으로 권한 있는 네임서버는 IP 주소를 확인하는 마지막 단계입니다.
* 권한 있는 네임서버는 도메인 이름에 고유한 정보(예: google.com)를 포함하며 DNS A 레코드에서 찾은 도메인의 IP 주소를 DNS Sever에 제공하거나, 도메인에 CNAME 레코드(별칭)가 있는 경우 DNS Sever에 별칭 도메인을 제공하며, 이 때 DNS Sever는 권한 있는 네임서버에서 레코드(종종 IP 주소를 포함하는 A 레코드)를 얻기 위해 완전히 새로운 DNS 조회를 수행해야 합니다.
* 보통 권한 있는 네임 서버를 직접 구축하지않고 Registrar(등록대행자)가 제공하는 권한 있는 네임 서버를 사용합니다.
	* Registrar(등록대행자)로는 가비아가 있습니다.

## 4 DNS 동작 과정

#### `example.com` 의 IP 주소를 찾는 과정

1. 클라이언트는 도메인을 쿼리하기 전 로컬에 있는 DNS 캐시 정보에서 도메인(`example.com` )을 찾는다
   * DNS 조회를 통해 확인한 동적 DNS 캐시와 hosts파일에 저장되어 있는 정적 DNS 캐시를 확인한다
2. 도메인이 로컬 캐시에 없으면 클라이언트는 DNS Server에 도메인(`example.com` )을 쿼리한다
3. DNS Server는 `example.com` 이 로컬 캐시와 자체 설정되어 있는지 확인하고 있으면 바로 클라이언트에게 응답한다.
4. DNS Server에 `example.com`이 없다면 해당 도메인을 찾기위해 루트 네임 서버에 `.com`에 대한 TLD 정보를 가진 도메인 주소를 쿼리한다.
5. 루트 네임 서버가 .`com` 을 관리하는 TLD 네임 서버에 대한 정보를 DNS 서버에 응답한다
6. DNS 서버가 다시 `example.com` 을 TLD 네임 서버에 쿼리합니다
7. TLD 네임 서버는 `example.com`에 대한 정보를 가진 권한 있는 네임 서버에 대한 정보를 DNS 서버에 응답한다
8. DNS 서버가 다시 `example.com`을 권한 있는 네임 서버에 쿼리한다
9. 권한 있는 네임 서버는 `example.com`에 대한 정보를 DNS 서버에 응답한다
10. DNS 서버는 `example.com`에 대한 정보를 로컬 캐시에 저장하고 클라이언트에 `example.com`에 대한 정보를 응답한다
11. 클라이언트는 DNS 서버로 부터 받은 `example.com`에 대한 IP 주소 정보를 이용해 사이트에 접속한다

## 5 DNS 주요 레코드

* 도메인에는 다양한 내용을 매핑할 수 있는 레코드가 있다

### 5.1 A 레코드

* A 레코드는 도메인 주소를 IPv4주소로 변환하는 레코드다
* 클라이언트가 DNS에 질의한 도메인 주소를 A 레코드에 설정된 IP 주소로 응답한다


### 5.2 AAAA 레코드

- AAAA 레코드는 도메인 주소를 IPv6 주소로 변환하는 레코드다.
- A 레코드와 동일한 기능을 수행하지만 IPv6 주소를 사용한다.
- IPv6 주소 체계는 128비트로 이루어져 있으며, A 레코드의 IPv4 주소보다 더 많은 주소를 제공한다.

### 5.3 CNAME 레코드

- CNAME 레코드는 별칭과 도메인을 매핑해주는 레코드입니다.
- CNAME 레코드는 루트 도메인(기본 도메인)에는 사용할 수 없습니다.
	- 루트 도메인은 'example.com'과 같은 도메인을 의미합니다.
	- 대신, 서브도메인에 CNAME 레코드를 사용할 수 있습니다.
	- 예: `www.example.com`, `blog.example.com`

#### 예시

* `www.example.com`라는 별칭으로  `example.com` 도메인을 확인하고 내부적으로 `example.com`의 IP 주소를 질의해 응답합니다.

| 레코드(Type)              | 값           |
| ---------------------- | ----------- |
| www.example.com(CNAME) | example.com |
| example.com(A)         | 10.10.10.10 |


**CNAME 레코드를 사용하는 이유**

* `www.example.com`과 `example.com` 도메인을 각각 A 레코드로 등록하면 IP 주소 변경 시 각각의 레코드를 수정해야합니다.
* CNAME 레코드를 사용해  `example.com`에 `www.example.com` 별칭을 등록하고 `example.com`도메인을 A 레코드 등록하면 IP 주소 변경 시 A 레코드의 값만 변경하면  `www.example.com` 도메인의 IP 주소도 자동으로 변경됩니다.



### 5.4 NS 레코드

- NS 레코드는 네임 서버(Name Server) 레코드를 정의한다.
- 특정 도메인에 대한 DNS 쿼리를 처리할 권한이 있는 네임 서버를 지정한다.
- 도메인의 DNS 정보를 관리하는 네임 서버를 가리키며, 도메인의 권한 있는 네임 서버를 나타낸다.
- 여러 개의 NS 레코드를 설정하여 도메인의 가용성과 신뢰성을 높일 수 있다.

관련 자료

* [생활코딩](https://www.youtube.com/watch?v=zrqivQVj3JM&list=PLuHgQVnccGMCI75J-rC8yZSVGZq3gYsFp&index=1)
* https://aws.amazon.com/ko/route53/what-is-dns/
* https://www.cloudflare.com/ko-kr/learning/dns/dns-server-types/#authoritative-nameserver