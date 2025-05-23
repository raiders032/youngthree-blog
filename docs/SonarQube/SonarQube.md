## 1. SonarQube

## 2. 주요 기능

- 최고 DevOps 플랫폼과의 통합
  - GitHub Actions, GitLab CI/CD, Azure Pipelines, Bitbucket Pipelines, Jenkins 등과 원활하게 통합
  - 자동 코드 분석 트리거 및 작업 환경에 코드 품질 상태 표시
  - 개발 워크플로우에 자연스럽게 통합되어 프로젝트 온보딩 용이
- 명확한 품질 게이트(Quality Gate)
  - 정의된 코드 품질 기준을 충족하지 않을 경우 빌드 파이프라인 실패 처리
  - 품질 이슈가 있는 코드의 병합이나 배포를 사전에 방지
  - 개발 생명주기 후반에 발견되는 문제로 인한 비용과 리스크 감소
- 고성능 및 운영 효율성
  - 다양한 배포 옵션: 온프레미스, 클라우드, 서버형, Docker, Kubernetes
  - 멀티스레딩, 다중 컴퓨팅 엔진, 언어별 최적화 로딩으로 최상의 성능 제공
  - 대규모 코드베이스에서도 빠른 분석 가능
- 빠르고 정확한 분석
  - 시간 단위가 아닌 분 단위로 실행 가능한 코드 품질 메트릭 제공
  - "Clean as You Code" 접근법으로 작업 중인 코드의 작은 부분만 검사
  - 새 코드의 품질에 대한 정확한 피드백 제공
- 주요 언어를 위한 중요 보안 규칙
  - 6,000개 이상의 코딩 규칙 제공
  - Java, C#, PHP, Python 등에 대한 업계 최고 수준의 오염 분석(taint analysis)
  - 개발 워크플로우 내에서 코딩 이슈를 적시에 발견
- 공유 및 통합된 설정
  - 팀을 코드 품질 기준에 맞게 조정하는 특정 코딩 표준 설정
  - "Learn as You Code" 기능으로 개발자 스킬 향상 지원
  - 일관된 코딩 스타일과 품질 유지
- IDE에서 실시간 이슈 해결
  - SonarQube for IDE를 통해 코딩 중 실시간으로 이슈 발견 및 해결
  - 서버에 연결 시 IDE에서도 동일한 코딩 정책 적용
  - Connected Mode로 서버와 IDE 간 일관된 규칙 적용
- 코드 커버리지 측정
  - 테스트로 검증된 코드베이스 비율 확인
  - 코드 건강 상태에 대한 귀중한 인사이트 제공
  - 커버리지가 낮은 영역 식별 및 개선 가이드## 3. 소나큐브 동작 원리

## 3. 소나 큐브 구성 요소

- SonarQube Server
  - 분석 결과를 저장하고 웹 인터페이스를 제공하는 중앙 서버
  - 코드 품질 데이터베이스와 웹 서버를 포함
  - 기본적으로 별도의 서버로 구축 필요 (온프레미스 또는 클라우드)
- 소나큐브 스캐너
  - 소스 코드를 분석하고 결과를 서버로 전송하는 클라이언트 도구
  - 빌드 툴과 통합되어 동작 (Maven, Gradle, Jenkins 등)
- 데이터베이스
  - 분석 결과와 설정을 저장 (기본적으로 H2 DB 사용, 프로덕션에서는 PostgreSQL 권장)

## 4. 동작 과정

- 코드 분석 트리거
  - 빌드 프로세스 중에 소나큐브 스캐너가 실행됨
  - 로컬 개발 환경에서 직접 실행 가능
  - CI/CD 파이프라인에서 자동으로 실행 가능
- 소스 코드 분석
  - 스캐너가 소스 코드를 로컬에서 분석
  - 분석 중 실제 코드 내용은 로컬에서만 처리 (소스 코드 자체는 서버로 전송되지 않음)
  - 대신 분석 결과 메타데이터만 서버로 전송
- 결과 전송
  - 분석 완료 후 결과 메타데이터를 소나큐브 서버로 전송
  - 전송되는 데이터: 이슈 위치, 유형, 심각도, 메트릭 값 등
  - 서버는 이 데이터를 처리하여 데이터베이스에 저장
- 보고서 생성
  - 서버는 수신된 데이터를 처리하여 보고서 생성
  - 웹 인터페이스를 통해 분석 결과와 트렌드 확인 가능