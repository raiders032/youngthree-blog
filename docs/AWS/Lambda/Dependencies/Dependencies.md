## 1 AWS Lambda 함수의 의존성 관리하기

- AWS Lambda는 서버리스 컴퓨팅의 핵심 서비스입니다. 
- 하지만 복잡한 애플리케이션을 개발할 때는 외부 라이브러리에 의존하게 되는 경우가 많습니다. 
- 이런 의존성을 효과적으로 관리하는 방법에 대해 알아보겠습니다.



## 2 외부 라이브러리 의존성 처리

- Lambda 함수가 AWS X-Ray SDK, 데이터베이스 클라이언트 등 외부 라이브러리에 의존한다면 특별한 처리가 필요합니다.
- 이러한 패키지들을 Lambda 함수 코드와 함께 설치하고 압축해야 합니다.
- 이는 Lambda 실행 환경에서 필요한 모든 의존성을 함께 제공하기 위함입니다.



## 3 프로그래밍 언어별 의존성 관리 방법

### 3.1 Node.js

- Node.js 프로젝트의 경우 npm을 사용하여 의존성을 관리합니다.
- "node_modules" 디렉토리에 필요한 모든 패키지를 설치합니다.
- 함수 코드와 node_modules 디렉토리를 함께 압축합니다.



**예시 명령어**


```bash 
npm install
zip -r function.zip . 
``` 



### 3.2 Python

- Python 프로젝트에서는 pip를 사용하여 의존성을 관리합니다.
- `--target` 옵션을 사용하여 특정 디렉토리에 패키지를 설치할 수 있습니다.



**예시 명령어**


```bash  
pip install --target ./package -r requirements.txt 
zip -r function.zip . 
``` 



### 3.3 Java

- Java 프로젝트의 경우 필요한 .jar 파일을 포함시켜야 합니다.
- 메이븐이나 그레이들과 같은 빌드 도구를 사용하여 의존성을 관리하고 패키징할 수 있습니다.



## 4 Lambda 함수 업로드 시 주의사항

- 압축된 함수 크기가 50MB 미만이라면 Lambda 콘솔이나 CLI를 통해 직접 업로드할 수 있습니다.
- 50MB를 초과하는 경우 먼저 S3에 업로드한 후 Lambda 함수를 생성하거나 업데이트해야 합니다.



## 5 네이티브 라이브러리 사용 시 고려사항

- 네이티브 라이브러리를 사용해야 하는 경우, Amazon Linux 환경에서 컴파일해야 합니다.
- 이는 Lambda 실행 환경과의 호환성을 보장하기 위함입니다.



## 6 AWS SDK 사용

- AWS SDK는 모든 Lambda 함수에 기본적으로 포함되어 있습니다.
- 따라서 AWS 서비스를 사용하는 코드를 작성할 때 별도로 SDK를 설치할 필요가 없습니다.



## 7 결론

- Lambda 함수의 의존성을 효과적으로 관리하는 것은 서버리스 애플리케이션 개발의 중요한 부분입니다.
- 언어별 특성을 고려하여 적절한 도구와 방법을 사용해야 합니다.
- 함수 크기, 네이티브 라이브러리 사용 여부 등을 고려하여 최적의 배포 전략을 선택해야 합니다.
- AWS SDK의 기본 제공을 활용하면 AWS 서비스 통합을 더욱 쉽게 구현할 수 있습니다.