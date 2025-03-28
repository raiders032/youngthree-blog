## 1 Replication

* Redis는 리더 팔로워(마스터-복제) 복제를 사용한다.
* 팔로워 Redis 인스턴스를 마스터 인스턴스의 정확한 같은 복사본으로 사용할 수 있다.
	* 팔로원 레디스는 연결이 끊어질 때마다 마스터에 자동으로 다시 연결된다.
	* 팔로워 레디스는 마스터에 발생하는 작업에 관계없이 마스터의 정확한 같은 복사본이 된다.

## 2 Replication 동작 방식

1. 마스터 데이터 집합의 변경을 replica에 업데이트 한다.
	* 마스터와 복제본 인스턴스가 잘 연결된 경우 마스터 측에서 발생하는 데이터 변경을 명령어 스트림을 전송하여 복제본에 업데이트 한다.
2. 마스터와 복제본의 링크 끊어짐
	* 네트워크 문제로 인해 또는 마스터 또는 복제본에서 시간 초과가 감지되어 복제본이 다시 연결한다.
	* 재연결 후 부분 재동기화를 진행한다.
	* 이는 연결이 끊기는 동안 놓친 명령 스트림의 일부만 가져오려고 한다는 것을 의미한다.
3. 부분 재동기화가 불가능한 경우
	* 복제본은 전체 재동기화를 요청한다.
	* 여기에는 마스터가 모든 데이터의 스냅샷을 만들어 복제본으로 전송한 다음 데이터 세트가 변경될 때 명령 스트림을 계속 전송해야 하는 보다 복잡한 프로세스가 포함됩니다.

참고

* https://redis.io/topics/replication