## 1 날짜와 시간

- Mysql은 날짜만 저장하거나 시간만 따로 저장할 수 있으면 날짜와 시간을 합쳐서 하나의 컬럼에 저장할 수 있다.

| 데이터타입 | 크기                            |
| ---------- | ------------------------------- |
| YEAR       | 1바이트                         |
| DATE       | 3바이트                         |
| TIME       | 3바이트 + 밀리초 단위 저장 공간                      |
| DATETIME   | 5바이트 + 밀리초 단위 저장 공간 |
| TIMESTAMP  | 4바이트 + 밀리초 단위 저장 공간 |

- 밀리초 단위는 2자리당 1바이트의 공간이 필요하다.
- MySQL 8.0에서는 마이크로초까지 저장 가능한 DATETIME(6) 타입을 사용한다.
	- 5바이트 + 3바이트
	- DATETIME 타입 뒤에 괄호에 가져올 밀리초의 자릿수를 명시한다.