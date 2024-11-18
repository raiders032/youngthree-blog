## 1 DeletionPolicy

- CloudFormation 템플릿에서 `DeletionPolicy`는 리소스를 삭제할 때의 동작을 정의하는 속성입니다. 
- 이를 통해 리소스를 삭제하지 않고 보존하거나 백업을 생성할 수 있습니다. 
- `Delete`, `Retain`, `Snapshot` 세 가지 옵션이 있으며, 각각의 기능에 따라 리소스를 삭제하거나 보존하거나 백업을 생성할 수 있습니다.
- 이번 포스트에서는 `DeletionPolicy`의 세 가지 옵션에 대해 알아보겠습니다.



## 2 Delete

```yaml
Resources:
  MyBucket:
	Type: AWS::S3::Bucket
	DeletionPolicy: Delete
	Properties:
	  BucketName: my-sample-bucket
```

- Delete가 기본 옵션입니다.
- 리소스를 삭제할 때 추가적인 조치 없이 삭제됩니다.
- 단, S3 버킷의 경우 버킷이 비어 있지 않으면 삭제가 되지 않습니다



## 3 Retain

```yaml
Resources:
  MyBucket:
	Type: AWS::S3::Bucket
	DeletionPolicy: Retain
	Properties:
	  BucketName: my-sample-bucket
```

- 리소스를 보존합니다.
- 스택이 삭제되더라도 리소스는 삭제되지 않고 유지됩니다.



## 4 Snapshot

```yaml
Resources:
  MyDBInstance:
	Type: AWS::RDS::DBInstance
	DeletionPolicy: Snapshot
	Properties:
	  DBInstanceIdentifier: my-sample-db
	  DBInstanceClass: db.t2.micro
	  Engine: mysql
	  MasterUsername: admin
	  MasterUserPassword: password
```

- 지원되는 리소스의 경우, 삭제하기 전에 스냅샷을 생성합니다.
- 주로 RDS 데이터베이스, ElastiCache 클러스터, Redshift 클러스터 등에 사용됩니다.



## 5 사용 예시

### 5.1 RDS 인스턴스 예시

```yaml
Resources:
  MyDBInstance:
	Type: AWS::RDS::DBInstance
	DeletionPolicy: Snapshot
	Properties:
	  DBInstanceClass: db.t2.micro
	  AllocatedStorage: 20
	  Engine: mysql
	  MasterUsername: admin
	  MasterUserPassword: password
	  DBName: mydatabase
```



### 5.2 S3 버킷 예시

```yaml
Resources:
  MyBucket:
	Type: AWS::S3::Bucket
	DeletionPolicy: Retain
	Properties:
	  BucketName: my-sample-bucket
```



## 6 요약

- `DeletionPolicy` 속성은 리소스가 스택에서 삭제될 때의 동작을 제어합니다.
- `Delete`, `Retain`, `Snapshot` 세 가지 옵션이 있으며, 각각의 기능에 따라 리소스를 삭제하거나 보존하거나 백업을 생성할 수 있습니다.
- 이 속성은 데이터 손실을 방지하고 중요한 리소스를 보호하는 데 유용하게 사용됩니다.