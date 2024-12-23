## 1 AWS CodeGuru 소개

- AWS CodeGuru는 머신러닝 기반의 자동화된 코드 리뷰와 애플리케이션 성능 추천을 제공하는 서비스입니다.
- 개발자들의 코드 품질을 향상시키고 애플리케이션의 성능을 최적화하는데 도움을 줍니다.
- 크게 두 가지 주요 기능을 제공합니다:
	- CodeGuru Reviewer: 정적 코드 분석을 통한 자동화된 코드 리뷰 (개발 단계)
	- CodeGuru Profiler: 런타임 중 애플리케이션 성능 분석 및 추천 (운영 단계)



## 2 CodeGuru Reviewer 상세 설명

- CodeGuru Reviewer는 코드의 품질과 보안을 자동으로 분석하는 도구입니다.
- 주요 기능은 다음과 같습니다:
	- 코드의 중요한 문제점 식별
	- 보안 취약점 탐지
	- 발견하기 어려운 버그 검출
	- 일반적인 코딩 베스트 프랙티스 검사
	- 리소스 누수 확인
	- 입력값 검증 확인
- 머신러닝과 자동화된 추론을 사용합니다.
- 수백만 건의 코드 리뷰와 수천 개의 오픈소스 및 아마존 리포지토리의 경험을 바탕으로 합니다.
- Java와 Python 언어를 지원합니다.
- GitHub, Bitbucket, AWS CodeCommit과 통합됩니다.



## 3 CodeGuru Profiler 상세 설명

- CodeGuru Profiler는 애플리케이션의 런타임 동작을 이해하는데 도움을 줍니다.
- 주요 기능과 특징은 다음과 같습니다:
	- 코드 비효율성 식별 및 제거
	- 애플리케이션 성능 개선 (예: CPU 사용률 감소)
	- 컴퓨팅 비용 절감
	- 힙 메모리 사용량 요약 제공
	- 이상 징후 탐지
- AWS 또는 온프레미스 환경에서 실행되는 애플리케이션을 지원합니다.
- 애플리케이션에 미치는 영향이 최소화되도록 설계되었습니다.



## 4 CodeGuru Reviewer Secrets Detector

- CodeGuru Reviewer Secrets Detector는 코드에 하드코딩된 비밀을 찾아내는 기능입니다.
- 다음과 같은 항목들을 검출합니다:
	- 비밀번호
	- API 키
	- 접근 자격 증명
	- SSH 키
- 코드뿐만 아니라 설정 파일과 문서 파일도 검사합니다.
- 발견된 비밀을 AWS Secrets Manager로 자동 보호하는 방안을 제시합니다.



## 5 Lambda 함수와의 통합

- CodeGuru Profiler는 AWS Lambda 함수와 통합하여 사용할 수 있습니다.
- 통합 방법은 다음과 같습니다:
	- Function Decorator '@with_lambda_profiler' 사용
	- Lambda 함수의 .zip 파일에 codeguru_profiler_agent 의존성 추가
	- Lambda Layers 사용
- Lambda 함수 설정에서 프로파일링을 활성화해야 합니다.



## 6 사용 시 장점

- 개발 생산성 향상:
	- 자동화된 코드 리뷰로 개발자의 시간을 절약합니다.
	- 일관된 코드 품질을 유지할 수 있습니다.
- 보안 강화:
	- 보안 취약점을 조기에 발견할 수 있습니다.
	- 민감한 정보의 노출을 방지합니다.
- 비용 최적화:
	- 성능 병목점을 찾아 개선할 수 있습니다.
	- 리소스 사용을 최적화할 수 있습니다.
- 운영 효율성:
	- 런타임 문제를 사전에 발견할 수 있습니다.
	- 모니터링과 문제 해결이 용이합니다.



## 7 결론

- AWS CodeGuru는 코드 품질과 애플리케이션 성능 향상을 위한 강력한 도구입니다.
- 머신러닝을 활용한 자동화된 분석으로 개발자의 생산성을 높여줍니다.
- 보안과 성능 최적화를 동시에 고려할 수 있는 통합된 솔루션을 제공합니다.
- AWS의 다른 서비스들과의 원활한 통합으로 더욱 효과적인 개발 환경을 구축할 수 있습니다.