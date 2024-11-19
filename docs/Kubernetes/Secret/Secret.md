## 1 Secret

- 컨테이너에 전달하는 정보의 보안 유지가 필요없는 경우 컨피그맵을 통해 전달할 수 있다.
- 그러나 설정 안에는 보안이 유지돼야 하는 자격증명과 개인 암호화 키와 같은 민감한 정보가 포함돼 있다.
- 이러한 민감한 정보를 보관하고 배포하기 위해 쿠버네티스는 시크릿이라는 별도 오브젝트를 제공한다.
- 시크릿은 키와 값을 쌍으로 가진 맵으로 컨피그맵과 매우 유사하다.
- 노드 자체적으로 시크릿을 항상 메모리에만 저장한다.
  - 물리저장소에 기록하지 않아 시크릿을 삭제한 후에 디스크를 완전이 삭제하는 작업이 필요없다.



### 1.1 용도

- 시크릿은 다음과 같은 상황에 사용할 수 있다.
- 환경변수로 시크릿 항목을 컨테이너에 전달
- 시크릿 항목을 볼륨 파일로 노출



### 1.2 컨피그맵과 비교

- 민감하지 않고 일반 설정 데이터는 컨피그맵을 사용한다.
- 본질적으로 민감한 데이터는 시크릿을 사용해 키 아래에 보관하는 것이 필요하다
  - 설정 파일이 일반 데이터와 민감한 데이터를 모두 가지고 있다면 파일은 시크릿 안에 저장해야 한다.
- Secret 매니페스트는 base64로 인코딩되어 있지만 암호화되어 있지 않다
  - 이를 암호화하기 위해서는 kubesec/sealedSecret/ExternalSecret과 같은 오픈 소스 소프트웨어를 이용해보자



### 1.3 시크릿의 타입

- 아래와 같은 타입이 있다.
- [레퍼런스](https://kubernetes.io/docs/concepts/configuration/secret/#secret-types)

| 종류                                  | 개요                                    |      |
| ------------------------------------- | --------------------------------------- | ---- |
| `Opaque`                              | 일반적인 범용 용도                      |      |
| `kubernetes.io/service-account-token` | ServiceAccount token                    |      |
| `kubernetes.io/dockercfg`             | serialized `~/.dockercfg` file          |      |
| `kubernetes.io/dockerconfigjson`      | serialized `~/.docker/config.json` file |      |
| `kubernetes.io/basic-auth`            | credentials for basic authentication    |      |
| `kubernetes.io/ssh-auth`              | credentials for SSH authentication      |      |



## 2 Secret 생성



### 2.1 Imperative 방식



**literal**

```bash
$ kubectl create secret generic db-user-pass \
    --from-literal=username=devuser \
    --from-literal=password='S!B\*d$zDsb='
```



**file**

- 컨피그맵과 마찬가지로 파일을 읽어 값으로 저장할 수 있다.
- 키는 파일의 이름이 된다.

```bash
$ echo -n 'admin' | base64 > ./username.txt
$ echo -n 'S!B\*d$zDsb=' | base64 > ./password.txt
$ kubectl create secret generic db-user-pass \
    --from-file=./username.txt \
    --from-file=./password.txt
```

키로 파일 이름대신 다른 것을 지정하고 싶다면 아래와 같이 한다. 아래의 예시는 키는 username으로 값은 ./username.txt 파일의 내용으로 설정한다.

```shell
kubectl create secret generic db-user-pass \
    --from-file=username=./username.txt \
    --from-file=password=./password.txt
```



### 2.2 Declarative 방식

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
type: Opaque
data:
  username: YWRtaW4=
  password: MWYyZDFlMmU2N2Rm
```

- 매니페스트 작성 시 base64로 인코딩된 값을 추가한다.

- 인코딩된 값은 다음과 같이 얻을 수 있다.

```bash
$ echo -n 'admin' | base64
YWRtaW4
```

- `data`가 아닌 `stringData` 필드를 사용하면 일반 텍스트로 작성할 수 있다.
  - 둘다 설정한 경우 `stringData`가 우선순위가 높다.



## 3 imagePullSecrets

- 프라이빗 컨테이너 이미지 레지스트리를 사용하는 경우 쿠버네티스에서 자격증명을 전달하는 것이 필요하다.
- 공개 이미지 레지스트리에 저장된 이미지는 가져오는데 특별한 자격증명이 필요없다.



**프라이빗 저장소를 사용하는 파드에 필요한 작업**

- 레지스트리 자격증명을 가진 시크릿 생성
- 파드 매니페스트에 `imagePullSecrets` 필드에 해당 시크릿 참조



**Sevice Account에 이미지 풀 시크릿 추가하기**

```bash
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "mySecret"}]}'
```



### 3.1 도커 허브

- 도커 허브에 프라이빗 레지스트리를 만들 수 있다.



**도커 레지스트리 인증을 위한 시크릿을 생성**

- generic 형식이 아닌 docker-registry 유형의 시크릿을 만든다.

```bash
kubectl create secret docker-registry mydockerhubsecret \
--docker-server=my-registry.example.com \
--docker-username=username \
--docker-password=password \
--docker-email=my@email.com
```



**파드 매니페스트**

```yml
apiVersion: v1
kind: Pod
metadata:
  name: private-pod
spec:
  imagePullSecrets:
  - name: mydockerhubsecret
  containers:
  - image: username/private:tag
    name: main
```



## 4 시크릿 사용



### 4.1 환경변수로 컨테이너에 전달

- 시크릿에 정의된 키 밸류 쌍을 컨터이너 환경변수로 사용할 수 있다.
- `spec.containers[].env.valuFrom.secretKeyRef` 를 사용한다.
- [레퍼런스](https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/#define-a-container-environment-variable-with-data-from-a-single-secret)



**CongifMap 생성**

```yaml
kubectl create secret generic backend-user --from-literal=backend-username='backend-admin'
```



**Pod Definition**

- pod에서 secret 사용하기 `spec.containers[].env.valuFrom.secretKeyRef` 를 사용해 특정 키를 사용할 수 있다.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: env-single-secret
spec:
  containers:
  - name: envars-test-container
    image: nginx
    env:
    - name: SECRET_USERNAME
      valueFrom:
        secretKeyRef:
          name: backend-user
          key: backend-username
```



**확인**

```bash
## 파드 생성
kubectl create -f https://k8s.io/examples/pods/inject/pod-single-secret-env-variable.yaml
## 환경변수 확인
kubectl exec -i -t env-single-secret -- /bin/sh -c 'echo $SECRET_USERNAME'
## 출력 결과
backend-admin
```



### 4.2 시크릿의 모든 항목을 환경변수로 사용하기

**시크릿 생성**

```bash
kubectl create secret generic test-secret --from-literal=username='my-app' --from-literal=password='39528$vdg7Jb'
```



**모든 항목 사용하기**

- `spec.containers[].envFrom.secretRef.name` 필드에 시크릿 이름을 지정하면 해당 시크릿의 모든 항목을 컨테이너의 환경변수로 사용할 수 있다.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: envfrom-secret
spec:
  containers:
  - name: envars-test-container
    image: nginx
    envFrom:
    - secretRef:
        name: test-secret
```



**확인**

```bash
## 파드 생성
kubectl create -f https://k8s.io/examples/pods/inject/pod-secret-envFrom.yaml

## 환경 변수 확인
kubectl exec -i -t envfrom-secret -- /bin/sh -c 'echo "username: $username\npassword: $password\n"'

## 출력 결과
username: my-app
password: 39528$vdg7Jb

```





참고

- https://kubernetes.io/docs/concepts/configuration/secret/
- [쿠버네티스 인 액션](https://product.kyobobook.co.kr/detail/S000001804912)