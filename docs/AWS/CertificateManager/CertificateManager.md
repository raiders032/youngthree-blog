### SSL 인증서란?

##### SSL

>  SSL(Secure Sockets Layer) 인증서는 웹사이트의 신원을 확인하는 디지털 인증서이며 SSL 기술을 이용하여 서버에 전송되는 정보를 암호화합니다. 암호화는 데이터를 판독할 수 없는 포맷으로 변환하는 과정이며 이 포맷은 적합한 암호 해독 키로만 판독 가능한 포맷으로 되돌릴 수 있습니다.

###### TLS

> SSL과 같은 말이다. 네스케이프에 의해서 SSL이 발명되었고, 이것이 점차 폭넓게 사용되다가 표준화 기구인 IETF의 관리로 변경되면서 TLS라는 이름으로 바뀌었다. TLS 1.0은 SSL 3.0을 계승한다. 하지만 TLS라는 이름보다 SSL이라는 이름이 훨씬 많이 사용되고 있다.

###### SSL 인증서의 주요 기능

1. 클라이언트가 접속한 서버가 신뢰 할 수 있는 서버임을 보장합니다.
2. SSL 통신에 사용할 공개키를 클라이언트에게 제공합니다.

###### SSL 인증서의 포함된 정보

1. 인증서 발행 기관의 디지털 서명
2. 서비스의 정보 (인증서를 발급한 CA, 서비스의 도메인 등등)
3. 인증서 보유자의 공개 키 사본 (공개키의 내용, 공개키의 암호화 방법)
4. 인증서 보유자의 이름
5. 인증서의 일련 번호 및 만료일



___



### SSL/TLS 인증서 발급하기

* AWS에선 SSL 인증서를 무료로 발급해줍니다.
* AWS를 사용하는 동안은 AWS 인증서는 자동으로 갱신됩니다.



