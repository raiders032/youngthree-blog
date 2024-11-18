## 1 AWS EFS 백업 개요

- Amazon EFS는 AWS Backup과 네이티브 통합되어 있는 완전 관리형 서비스입니다
- AWS Backup을 통해 자동화된 정책 기반의 백업 관리가 가능합니다
- EFS Console에서 생성한 File System은 기본적으로 AWS Backup으로 자동 백업됩니다
- 파일 단위 복구가 필요한 경우 AWS Backup의 부분 복원 기능을 활용할 수 있습니다



## 2 AWS Backup의 주요 기능

- AWS Backup을 통해 다음과 같은 작업을 수행할 수 있습니다:
    - Backup Plan을 통한 자동 백업 스케줄링 관리
    - 백업 보존 기간 설정
    - Lifecycle Policy 설정
    - 전체 또는 항목 단위 복원 지원
    - 새로운 File System 또는 기존 File System으로 복원 가능
    - 개별 파일 단위의 빠른 복구 지원



## 3 백업 및 복구 옵션 비교

### 3.1 AWS Backup을 통한 복구

- 가장 비용 효율적인 방식입니다
- 주요 특징:
    - 백업 Vault에 직접 저장
    - 개별 파일의 빠른 복구 지원
    - 부분 복원 작업으로 특정 파일만 선택적 복구 가능
    - 관리 오버헤드 최소화
    - 네이티브 통합으로 추가 서비스 불필요



### 3.2 대체 백업 방식

- **Amazon DLM 사용**
    - S3 Glacier와 통합 가능하나 EFS에 최적화되지 않음
    - 개별 파일 복구가 복잡하고 시간 소요
    - EFS 백업에는 권장되지 않음
- **AWS DataSync를 통한 복제**
    - 다른 Region에 백업 가능
    - 지속적인 동기화 비용 발생
    - 개별 파일 복구 시 전체 복사 필요
    - 비용 효율성이 떨어짐
- **S3 Glacier 직접 사용**
    - 검색 요청에 추가 비용 발생
    - 복구 시간이 길어질 수 있음
    - EFS와의 통합이 복잡함



## 4 파일 단위 복구 프로세스

- AWS Backup을 통한 개별 파일 복구 단계
    - Backup Vault에서 복원 지점 선택
    - 부분 복원 작업 선택
    - 복구할 특정 파일이나 디렉토리 지정
    - 복원 위치 선택 (새로운 또는 기존 File System)
- 복구 성능:
    - 복원 속도: 초당 500개 파일 또는 150MB 중 더 느린 속도
    - 개별 파일 복구 시 전체 복원보다 빠름
    - 최소한의 다운타임으로 복구 가능



## 5 백업 특성

### 5.1 증분 백업 (Incremental Backup)

- AWS Backup은 EFS File System의 증분 백업을 수행합니다
- 초기 백업:
    - File System 전체를 복사합니다
- 이후 백업:
    - 변경, 추가, 삭제된 파일과 디렉토리만 복사합니다
    - 전체 복원을 위한 참조 데이터는 유지됩니다
- 이를 통해 다음과 같은 이점이 있습니다:
    - 백업 완료 시간 최소화
    - 중복 데이터 방지로 스토리지 비용 절감



### 5.2 백업 일관성 (Backup Consistency)

- EFS는 고가용성을 위해 설계되어 백업 중에도 File System 접근과 수정이 가능합니다
- 하지만 백업 중 File System 수정 시 다음과 같은 불일치가 발생할 수 있습니다:
    - 데이터 중복
    - 데이터 누락
    - 데이터 왜곡
- 일관성 있는 백업을 위한 권장사항:
    - 백업 중 File System을 수정하는 애플리케이션 일시 중지
    - File System 수정이 적은 시간대로 백업 일정 조정



## 6 백업 성능

- AWS Backup의 성능 특성:
    - 백업 속도: 초당 1,000개 파일 또는 300MB 중 더 느린 속도
    - 복원 속도: 초당 500개 파일 또는 150MB 중 더 느린 속도
- 주요 특징:
    - 최대 백업 작업 기간은 30일입니다
    - Burst Credit을 소비하지 않습니다
    - General Purpose 성능 모드의 File Operation 제한에 포함되지 않습니다



## 7 백업 관리

### 7.1 자동 백업 설정

- 기본 EFS Backup Plan 특징:
    - 일일 백업 수행
    - 35일 보존 기간
    - 기본 EFS Backup Vault에 저장
    - 기본 Backup Plan과 Vault는 삭제 불가



### 7.2 On-demand 백업

- Backup Plan 없이도 단일 리소스의 즉시 백업 가능
- Cold Storage 전환을 위한 Lifecycle 설정 가능
- Cold Storage 전환 시 특징:
    - 가장 최근 Warm 백업에 없는 데이터만 Cold Storage로 전환
    - 나머지 데이터는 Warm Storage로 과금



## 8 백업 제한사항

- 동시 백업 제한:
    - 리소스당 하나의 동시 백업만 허용
    - 백업이 진행 중일 때 예약 또는 On-demand 백업이 실패할 수 있음
- 백업 삭제:
    - 기본 EFS Backup Vault는 Recovery Point 삭제 거부 정책 설정
    - 백업 삭제를 위해서는 Vault Access Policy 변경 필요



## 9 비용 최적화

- AWS Backup을 사용한 EFS 백업의 비용 최적화 방안:
    - 증분 백업을 통한 스토리지 비용 절감
    - 필요한 파일만 선택적으로 복구하여 복원 비용 최소화
    - 적절한 백업 보존 기간 설정으로 장기 스토리지 비용 관리
    - Cold Storage 계층을 활용한 비용 효율적인 장기 보관
    - 불필요한 중복 백업 방지



## 10 IAM 권한

- AWS Backup은 Service-linked Role을 자동 생성합니다
- EFS 백업 관련 주요 IAM 액션:
    - elasticfilesystem:backup
    - elasticfilesystem:restore
- 이러한 액션은 다음 정책에서 사용 가능:
    - File System Policy
    - Identity-based IAM Policy



## 11 결론

- AWS EFS의 가장 효율적인 백업 및 복구 솔루션은 AWS Backup 사용입니다
- 개별 파일 복구가 필요한 경우 AWS Backup의 부분 복원 기능이 최적의 선택입니다
- 비용과 복구 시간을 고려할 때 다른 백업 방식들은 EFS에 최적화되어 있지 않습니다
- AWS Backup을 통해 백업부터 복구까지 통합된 관리가 가능합니다
- 적절한 백업 전략과 정책 설정으로 데이터를 안전하게 보호할 수 있습니다