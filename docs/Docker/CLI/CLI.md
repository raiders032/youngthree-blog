###  [docker attach](https://docs.docker.com/engine/reference/commandline/attach/)

> Attach local standard input, output, and error streams to a running container

```bash
 docker attach [OPTIONS] CONTAINER
```



---



###  docker build

> Build an image from a Dockerfile

- [레퍼런스](https://docs.docker.com/engine/reference/commandline/build/)
- -t 옵션을 사용하지 않으면 16진수 형태의 이름으로 이미지가 만들어지므로 가급적 -t 옵션을 사용하자



**Usage**

```shell
docker build [OPTIONS] PATH | URL | -
```



**Options**

| Options     | Description                                             |
| ----------- | ------------------------------------------------------- |
| --build-arg | Set build-time variables                                |
| --tag , -t  | Name and optionally a tag in the ‘name:tag’ format      |
| --rm        | Remove intermediate containers after a successful build |
| --file , -f | Name of the Dockerfile (Default is ‘PATH/Dockerfile’)   |



**예시**

```shell
docker build -t neptunes032/react-test-app -f ./frontend/Dockerfile.dev ./frontend
docker build -t neptunes032/docker-frontend ./frontend
docker build .
```



---



###  docker commit

> Create a new image from a container’s changes

- [레퍼런스](https://docs.docker.com/engine/reference/commandline/commit/)



**Usage**

```shell
docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
```



**Options**

| Name, shorthand    | Default | Description                                                |
| ------------------ | ------- |------------------------------------------------------------|
| `--author` , `-a`  |         | Author (e.g., "John Hannibal Smith [hannibal@a-team.com>]) |
| `--change` , `-c`  |         | Apply Dockerfile instruction to the created image          |
| `--message` , `-m` |         | Commit message                                             |
| `--pause` , `-p`   | `true`  | Pause container during commit                              |



**예시**

```bash
##  c3f279d17e0a 컨테이너를 svendowideit/testimage:version3라는 이름을 가지는 이미지로 만든다
docker commit c3f279d17e0a  svendowideit/testimage:version3
##  새로운 환경변수 ENV DEBUG=true를 가지는 이미지를 생성한다
docker commit --change "ENV DEBUG=true" c3f279d17e0a  svendowideit/testimage:version3
```



---



###  docker container ls

> List containers

```
docker container ls [OPTIONS]
```



---



###  docker container prune

> Remove all stopped containers

```
docker container prune [OPTIONS]
```

| Options        | Descripton                            |
| :------------- | ------------------------------------- |
| --filter       | Provide filter values (e.g. ‘until=') |
| `--force , -f` | Do not prompt for confirmation        |



---



###  docker container rm

> Remove one or more containers

```
docker container rm [OPTIONS] CONTAINER [CONTAINER...]
```



---



###  docker create

> Create a new container

- [레퍼런스](https://docs.docker.com/engine/reference/commandline/create/)
- 새로운 컨테이너를 생성만 하며 시작하지 않는다.
- 생성된 컨테이너는 `docker start` 명령어를 통해 시작시킨다.



---



###  docker cp

> Copy files/folders between a container and the local filesystem

```bash
 docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH|-
```

**예시**

```bash
##  로컬 파일 시스템의 /Users/YT/Downloads/license.xml 파일을 tibero(컨테이너 이름) 컨테이너의 /usr/local/ 위치로 복사
docker cp /Users/YT/Downloads/license.xml tibero:/usr/local/
```



---



###  docker exec

> Run a command in a running container

```
docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```

| Options             | Descripton                                            |
| :------------------ |-------------------------------------------------------|
| --detach , -d       | Detached mode: run command in  the background         |
| --detach-keys       | Override the key sequence for  detaching a container  |
| --env  , -e         | Set environment variables                             |
| --interactive  , -i | Keep STDIN open even if not attached                  |
| --privileged        | Give extended privileges to the  command              |
| --tty ,  -t         | Allocate a pseudo-TTY                                 |
| --user  , -u        | Username or UID (format:  `<name\|uid>[:<group\|gid>]`) |
| --workdir  , -w     | Working directory inside the container                |



예시

```
docker exec -it jenkins /bin/bash
```



___



###  docker images

> List images

```
docker images [OPTIONS] [REPOSITORY[:TAG]]
```



___



###  docker image ls

> List images

```
docker image ls [OPTIONS] [REPOSITORY[:TAG]]
```



___



###  docker image prune

> Remove unused images

```
docker image prune [OPTIONS]
```

| Options      | Description                                      |
| ------------ | ------------------------------------------------ |
| --all , -a   | Remove all unused images, not just dangling ones |
| --filter     | Provide filter values (e.g. ‘until=')            |
| --force , -f | Do not prompt for confirmation                   |



___



###  docker image rm

> Remove one or more images

```
docker image rm [OPTIONS] IMAGE [IMAGE...]
```



예시

```shell
##  모든 이미지 삭제
docker image rm $(docker images -q) 
```



___



###  [docker inspect](https://docs.docker.com/engine/reference/commandline/inspect/)

> Return low-level information on Docker objects

```
docker inspect [OPTIONS] NAME|ID [NAME|ID...]
```

| Options           | Default | Description                                       |
| ----------------- | ------- | ------------------------------------------------- |
| `--format` , `-f` |         | Format the output using the given Go template     |
| `--size` , `-s`   |         | Display total file sizes if the type is container |
| `--type`          |         | Return JSON for specified type                    |



**예시**

```bash
##  인스턴스 ip 조회
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $INSTANCE_ID
```



---



###  docker load

> Load an image from a tar archive or STDIN

- [레퍼런스](https://docs.docker.com/engine/reference/commandline/load/)



**Usage**

```
$ docker load [OPTIONS]
```



---



###  docker logs

> Fetch the logs of a container

```
docker logs [OPTIONS] CONTAINER
```

| Options           | Description                                      |
| ----------------- | ------------------------------------------------ |
| --follow , -f     | Follow log output                                |
| --tail            | Number of lines to show from the end of the logs |
| --timestamps , -t | Show timestamps                                  |



___



###  docker network ls

> List networks

```shell
docker network ls [OPTIONS]
```



___



###  docker network connect

> Connect a container to a network

```bash
docker network connect [OPTIONS] NETWORK CONTAINER
```



---



###  docker network create

> Create a network

```bash
docker network create [OPTIONS] NETWORK
```

| Options           | Default  | Description                                             |
| ----------------- | -------- | ------------------------------------------------------- |
| `--driver` , `-d` | `bridge` | Driver to manage the Network                            |
| `--gateway`       |          | IPv4 or IPv6 Gateway for the master subnet              |
| `--ip-range`      |          | Allocate container ip from a sub-range                  |
| `--subnet`        |          | Subnet in CIDR format that represents a network segment |

**예시**

```bash
##  bridge 드라이버 네트워크 생성
docker network create --driver bridge network-name

## 
docker network create --driver bridge \
--subnet 172.72.0.0/16 \
--ip-range 172.72.0.0/24 \
--gateway 172.72.0.1 \
custom_network
```



---



###  docker network disconnect

> Disconnect a container from a network

```bash
docker network disconnect [OPTIONS] NETWORK CONTAINER
```



---



###  docker ps

> List containers

```
docker ps [OPTIONS]
```

| Options      | Description                                      |
| ------------ | ------------------------------------------------ |
| --all , -a   | Show all containers (default shows just running) |
| --quiet , -q | Only display numeric IDs                         |
|              |                                                  |



예시

```shell
// 모든 컨테이너 삭제
docker rm `docker ps -a -q`
```



___



###  docker pull

>  Pull an image or a repository from a registry

```
docker pull [OPTIONS] NAME[:TAG|@DIGEST]
```

- [레퍼런스](https://docs.docker.com/engine/reference/commandline/pull/)



---



###  docker push

> Push an image or a repository to a registry

```
docker push [OPTIONS] NAME[:TAG]
```



---



###  docker run

> Run a command in a new container

- [레퍼런스](https://docs.docker.com/engine/reference/commandline/run/)



**Usage**

```
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```



**Options**

| Options            | Description                                        |
| ------------------ | -------------------------------------------------- |
| --attach , -a      | Attach to STDIN, STDOUT or STDERR                  |
| --detach , -d      | Run container in background and print container ID |
| --env , -e         | Set environment variables                          |
| --interactive , -i | Keep STDIN open even if not attached               |
| --publish , -p     | Publish a container’s port(s) to the host          |
| --publish-all , -P | Publish all exposed ports to random ports          |
| --rm               | Automatically remove the container when it exits   |
| --volume , -v      | Bind mount a volume                                |
| --tty , -t         | Allocate a pseudo-TTY                              |



**예시**

```shell
docker run -e CI=true neptunes032/react-test-app npm run test
docker run -p 3000:80 -d --name feedback-app --rm feedback-node
```



####  Publish or expose port (-p, --expose)

> This binds port `8080` of the container to TCP port `80` on `127.0.0.1` of the host machine. You can also specify `udp` and `sctp` ports. The [Docker User Guide](https://docs.docker.com/network/links/) explains in detail how to manipulate ports in Docker.

```
docker run -p 127.0.0.1:80:8080/tcp ubuntu bash
```



___



###  [docker rm](https://docs.docker.com/engine/reference/commandline/rm/)

> Remove one or more containers

```shell
docker rm [OPTIONS] CONTAINER [CONTAINER...]
```

| Options        | Description                                             |
| -------------- | ------------------------------------------------------- |
| --force , -f   | Force the removal of a running container (uses SIGKILL) |
| --link , -l    | Remove the specified link                               |
| --volumes , -v | Remove anonymous volumes associated with the container  |



**예시**

```bash
##  모든 도커 컨테이너 제거
docker rm $(docker ps -a -q)
##  모든 정지된 컨테이너 삭제 
docker rm $(docker ps --filter status=exited -q)
```



---



###  docker save

> Save one or more images to a tar archive (streamed to STDOUT by default)

- [레퍼런스](https://docs.docker.com/engine/reference/commandline/save/)
- 이미지를 단일 바이너리 파일로 저장하고 `docker load` 명령어를 통해 단일 바이너리 파일을 다시 도커에 로드한다. 



**Usage**

```
$ docker save [OPTIONS] IMAGE [IMAGE...]
```



---



###  docker search

> Search the Docker Hub for images

- [레퍼런스](https://docs.docker.com/engine/reference/commandline/search/)



---



###  docker start

> Start one or more stopped containers

```
docker start [OPTIONS] CONTAINER [CONTAINER...]
```

- [레퍼런스](https://docs.docker.com/engine/reference/commandline/start/)



---



###  [docker stop](https://docs.docker.com/engine/reference/commandline/stop/)

> Stop one or more running containers

```
docker stop [OPTIONS] CONTAINER [CONTAINER...]
```

| Name, shorthand | Default | Description                                |
| --------------- | ------- | ------------------------------------------ |
| `--time` , `-t` | `10`    | Seconds to wait for stop before killing it |

**예시**

```shell
##  구동중인 모든 컨테이너 중지
docker stop $(docker ps -a -q)
```



---



###  docker tag

> Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE

```shell
docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
```



참고

* https://docs.docker.com/engine/reference/run/
