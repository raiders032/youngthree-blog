##  1 Docker Image

- Docker Image란 코드, 런타임, 시스템 도구, 시스템 라이브러리 및 설정과 같은 응용 프로그램을 실행하는데 필요한 모든 것을 포함하는 가볍고 독립적이며 실행 가능한 소프트웨어 패키지입니다.  

* 이미지는 컨테이너를 생성할 때 필요한 요소이다.
* `이미지`는 여러 개의 계층으로 된 바이너리 파일로 존재하고, 컨테이너를 생성하고 실행할 때 `읽기 전용`으로 사용된다.
* 이미지는 응용 프로그램을 실행하는데 필요한 모든 것을 포함하고 있다.
* 이미지는 시작시 실행 될 명령어와 파일 스냅샷을 가지고 있다.



##  2 Image Layer

![image-20201117215748040](images/docker.png)

* 이미지는 여러개의 레이어로 구성된 바이너리 파일로 존재한다.
* 각각의 이미지 레이어는 JSON 파일을 가진다
  * 이 JSON 파일에 레이어에 대한 메타데이터가 담겨있다.
* 모든 이미지 레이어를 합쳐 컨테이너를 생성할 때 사용된다.
* Dokcerfile 하나 하나의 인스트럭션이 하나의 레이어가 된다.
* 이미지를 재빌드할 때 변화가 없는 레이어는 캐시된 데이터를 사용
  * 한 레이어의 변화가 있을 경우 그 이후 레이어는 다시 빌드를 하게 된다.



##  3 Container Layer

* 실행중인 컨테이너에 대한 변경 사항들은 모두 컨테이너 레이어에 저장된다.
  * 이미지 레이어는 읽기 전용
  * 컨테이너 레이어는 쓰기가 가능하다
* 컨테이너 레이어는 로컬 호스트의 파일 시스템에 존재하는 디렉토리이다.
* 컨테이너 레이어는 컨테이너가 제거될 때 까지 호스트 파일 시스템에 존재한다.
* 컨테이너가 삭제되면 모든 변경 사항이 사라진다.(Containers are **ephemeral**)
  * 이러한 데이터를 영속화하기 위해 볼륨을 사용한다.



##  4 copy on wirte

* 여러개의 레이어를 효율적으로 다루기위해 도커는 copy on write 기법을 사용한다
* copy on write은 한 파일이 이미 존재한다면 새로 생성하지 않는 것이다.
* 만약 한 파일이 하위 레이어에 존재한다면 상위 레이어에서 해당 파일을 포함할 이유가 없다.
  * 예시: 레이어1 에 `/opt/nginx/index.html`이라는 파일이 있으면 레이어2에 굳이 해당 파일을 보유할 이유가 없다.
* 그렇다면 하위 레이어에 포함된 파일을 수정하면 어떻게 처리해야 될까?
  * 이미지 읽기는 위에서 아래방향으로 수행되기 때문에 컨테이너는 상위 레이어의 파일을 사용할 것이다.
  * 만약 레이어1의  `/opt/nginx/index.html`을 수정하고 저장하면 컨테이너는 수정된 파일을 컨테이너 레이어에 저장할 것이다.
  * 해당 레이어가 최상위 레이어이기 때문에 수정된 파일이 사용될 것이다.



##  5 Docker Image 생성

- 먼저 `docker search`를 통해 이미지를 검색하고 `docker pull` 명령어로 이미지를 내려받아 사용할 수 있다.
- 컨테이너에 애플리케이션을 위한 특정 개발 환경을 직접 구축하고 이를 이미지로 만드는 방법이 있다.
- `docker commit`이라는 명령어로 컨테이너를 이미지로 만들 수 있다.



##  6 Docker 이미지 추출

- 도커 이미지를 별도로 저장하거나 옮기는 등 필요에 따라 이미지를 단일 바이너리 파일로 저장해야할 때가 있다
- `docker save` 명령어를 이용하면 이미지의 모든 메타데이터를 포함해 하나의 파일로 추출할 수 있다.
- 추출된 이미지는 다시 `docker load` 명령어로 도커에 다시 로드할 수 있다



**예시**

```bash
docker save -o ubuntu_14_04.tar ubuntu:14.04
docker load -i ubuntu_14_04.tar
```



##  7 이미지 배포

- save나 export와 같은 방법으로 이미지를 단일 파일로 추출해서 배포하는 방식은 매우 비효율적이다
  - 도커의 이미지 구조인 레이어 형태를 이용하지 않음
- 도커에서 공식적으로 제공하는 도커 허브 이미지 저장소를 사용하는 방법
- 도커 사설 레지스트리를 사용하는 방법



##  8 이미지 생성 과정

- 빌드 프로세스는 도커 클라이언트가 수행하지 않고 도커 데몬이 수행한다.
- 디렉토리 전체 콘텐츠가 도커 데몬에 업로드되고 그곳에서 이미지가 빌드된다.
- Dockerfile에 기록된 명령어를 하나 하나를 스텝이라고 한다.
- 하나의 스텝마다 이전 스텝에서 만들어진 이미지로 임시 컨테이너를 생성하고 명령어를 적용하고 이를 이미지로 커밋하고 컨테이너는 삭제한다.
- 따라서 dockerfile의 명령어 수만큼 레이어가 존재하게 되며 중간에 컨테이너도 같은 수만큼 생성되고 삭제된다.



**예시**

- Running in `fbc63d321d73` 새로운 컨테이너를 생성함
- CMD /bin/ls 명령어를 적용하고 이미지를 커밋함
- ---> `3286931702ad` 커밋된 이미지 레이어의 ID
- Removing intermediate container `fbc63d321d73` 컨테이너 삭제

```bash
$ docker build -f ctx/Dockerfile http://server/ctx.tar.gz

Downloading context: http://server/ctx.tar.gz [===================>]    240 B/240 B
Step 1/3 : FROM busybox
 ---> 8c2e06607696
Step 2/3 : ADD ctx/container.cfg /
 ---> e7829950cee3
Removing intermediate container b35224abf821
Step 3/3 : CMD /bin/ls
 ---> Running in fbc63d321d73
 ---> 3286931702ad
Removing intermediate container fbc63d321d73
Successfully built 377c409b35e4
```





참고

* [Kubernetes and Docker - An Enterprise Guide](https://www.amazon.com/Kubernetes-Docker-Effectively-containerize-applications/dp/183921340X)
* [시작하세요! 도커/쿠버네티스](http://www.kyobobook.co.kr/product/detailViewKor.laf?mallGb=KOR&ejkGb=KOR&barcode=9791158392291)