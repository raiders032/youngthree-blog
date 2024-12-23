## 1 SSL(Secure Sockets Layer)

- SSL(Secure Sockets Layer)은 암호화 기반 인터넷 보안 프로토콜입니다. 
- 인터넷 통신의 개인정보 보호, 인증, 데이터 무결성을 보장하기 위해 Netscape가 1995년 처음으로 개발했습니다. 
- SSL은 현재 사용 중인 TLS 암호화의 전신입니다.



### 1.1 SSL와 TLS

- SSL은 TLS(Transport Layer Security)이라는 또 다른 프로토콜의 바로 이전 버전입니다. 
- 1999년 IETF(Internet Engineering Task Force)는 SSL에 대한 업데이트를 제안했습니다. 
- IETF가 이 업데이트를 개발하고 Netscape는 더 이상 참여하지 않게 되면서, 이름이 TLS로 바뀌었습니다. 
- SSL의 최종 버전(3.0)과 TLS 첫 버전의 차이는 크지 않으며, 이름이 바뀐 것은 소유권 변경을 나타내기 위한 것입니다.
	- 더이상 Netscape와 관련이 없다.
- 이들은 긴밀히 연계되어 있어 두 용어가 혼합되어 사용되는 경우가 많습니다. 
- TLS를 아직 SSL이라 부르기도 하고, SSL의 인지도가 높으므로, ‘SSL/TLS 암호화’라 부르는 경우도 있습니다.



### 1.2 SSL의 최신 상태

- SSL은 1996년 SSL 3.0 이후 업데이트되지 않았으며, 앞으로 사라지게 될 것으로 여겨지고 있습니다. 
- SSL 프로토콜에는 알려진 취약성이 여러 가지 있으며 보안 전문가들은 SSL의 사용을 중단하라고 권장합니다. 
- 실제로, 최신 웹 브라우저는 대부분 이제 SSL을 지원하지 않습니다.
- TLS는 현재 온라인으로 실행되고 있는 최신 암호화 프로토콜인데, 아직 이를 "SSL 암호화"라고 부르는 사람도 있습니다. 
- 이 때문에 보안 솔루션 구매 시 혼란이 일어날 수 있습니다. 
- 실제로, 현재 "SSL"을 제공하는 업체는 사실 상 TLS 보호를 제공하는 것이며, 이는 거의 20년 동안 업계 표준으로 자리 잡고 있습니다. 
- 하지만 아직도 많은 고객이 "SSL 보호"를 찾고 있기 때문에, 많은 제품 페이지에 이 용어가 나타나고 있습니다.



> 출처
>
> - https://www.cloudflare.com/ko-kr/learning/ssl/what-is-ssl/



## 2 TLS(Transport Layer Security)

- TLS는 인터넷을 통한 통신을 위한 개인 정보 보호 및 데이터 보안을 용이하게 하도록 설계된 널리 채택된 보안 프로토콜이다. 
- TLS의 주요 사용 사례는 웹 브라우저가 웹 사이트를 로드하는 것과 같은 웹 응용 프로그램과 서버 간의 통신을 암호화하는 것이다.
- TLS는 email, 메시징 및 VoIP(Voice over IP)와 같은 다른 통신을 암호화하는 데도 사용할 수 있다



### 2.1 TLS의 기능

- **Encryption**: 전송되는 데이터를 암호화해 제 3자가 데이터를 읽을 수 없게한다.
- **Authentication**: 정보를 교환하는 당사자가 자신이 주장하는 주체인지 확인한다.
- **Integrity**: 데이터가 위조되거나 변조되지 않았는지 확인한다.



### 2.2 TLS의 동작과정

- TLS은 높은 수준의 개인정보 보호를 제공하기 위해, 웹에서 전송되는 데이터를 암호화한다. 
	- 데이터를 가로채려는 자는 거의 해독할 수 없는 복잡한 문자만 보게 된다.
- TLS은 두 통신 장치 사이에 [핸드셰이크](https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/)라는 **인증** 프로세스를 시작하여 두 장치의 ID를 확인한다.
- TLS은 또한 **데이터 무결성**을 제공하기 위해 데이터에 디지털 서명하여 데이터가 의도된 수신자에 도착하기 전에 조작되지 않았다는 것을 확인한다.



### 2.3 HTTPS와의 차이점

- HTTPS는 HTTP 프로토콜 위에 TLS 암호화를 구현한 것이다.
- 따라서 HTTPS를 사용하는 모든 웹 사이트는 TLS 암호화를 사용한다.



## 3 TLS Handshake

### 3.1 동작과정

- 아래는 TLS 1.3 버전 이전의 동작 과정이다.

1. **The 'client hello' message**
   - The client initiates the handshake by sending a "hello" message to the server. 
   - The message will include which TLS version the client supports, the cipher suites supported, and a string of random bytes known as the "client random."
2. **The 'server hello' message**
   - In reply to the client hello message, the server sends a message containing the server's [SSL certificate](https://www.cloudflare.com/learning/ssl/what-is-an-ssl-certificate/), the server's chosen cipher suite, and the "server random," another random string of bytes that's generated by the server.
3. **Authentication**
   - The client verifies the server's SSL certificate with the certificate authority that issued it. 
   - This confirms that the server is who it says it is, and that the client is interacting with the actual owner of the domain.
4. **The premaster secret** 
   - The client sends one more random string of bytes, the "premaster secret." 
   - The premaster secret is encrypted with the public key and can only be decrypted with the private key by the server. 
   - The client gets the [public key](https://www.cloudflare.com/learning/ssl/how-does-public-key-encryption-work/) from the server's SSL certificate.
5. **Private key used**
   - The server decrypts the premaster secret.
6. **Session keys created**
   - Both client and server generate session keys from the client random, the server random, and the premaster secret. 
   - They should arrive at the same results.
7. **Client is ready**
   - The client sends a "finished" message that is encrypted with a session key.
8. **Server is ready** 
   - The server sends a "finished" message encrypted with a session key.
9. **Secure symmetric encryption achieved** 
   - The handshake is completed, and communication continues using the session keys.



> 참고
>
> 1.3 버전의 동작 과정을 https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/ 이곳을 참조한다.



## 4 TLS의 정보

- TLS certificates는 아래와 같은 정보를 가지고 있다.
	- The [domain name](https://www.cloudflare.com/learning/dns/glossary/what-is-a-domain-name/) that the certificate was issued for
	- Which person, organization, or device it was issued to
	- Which certificate authority issued it
	- The certificate authority's digital signature
	- Associated subdomains
	- Issue date of the certificate
	- Expiration date of the certificate
	- The public key (the private key is kept secret)



## 5 openssl

```bash
openssl s_client -connect {hostname}:{port} -showcerts
```

- OpenSSL 도구를 사용하여 원격 서버에서 TLS 인증서 보기




```bash
echo | openssl s_client -connect {hostname}:{port} -showcerts | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > server.crt
```

- OpenSSL 도구를 사용하여 원격 서버에서 TLS 인증서를 다운로드



```bash
openssl x509 -in server.crt -text -noout
```