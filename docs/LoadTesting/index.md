---
title: "Load Testing"
---

## Load Testing

- 잘못된 부하 테스트
- [Web System Design](WebSystemDesign/WebSystemDesign.md)
	- 부하 테스트는 가용성과 확장성이 높은 시스템을 구축하기 위한 방법입니다.
	- 해당 글을 통해 가용성과 확장성에 대해서 이해할 수 있습니다.
	- 온프레미스에서 가용성과 확장성이 높은 시스템을 구축하기는 어렵습니다.
	- 클라우드 디자인 패턴을 활용하면 가용성과 확장성이 높은 시스템을 쉽게 구축할 수 있습니다.
- [부하 테스트란?.md](LoadTesting/LoadTesting.md)
	- 부하 테스트의 목적
	- 부하 테스트에서의 시스템 성능 지표
	- 시스템 성능 개선 기본 지식
	- 좋은 부하 테스트에 대한 지표
- [부하 테스트 도구](LoadTestingTool/LoadTestingTool)
	- 테스트 도구, 프로파일링 도구, 모니터링 도구에 대한 개념과 선택 기준 제공
	- Apache JMeter
	- Locust
	- K6
- [모니터링 도구와 프로파일링 도구](MonitoringAndProfilingTools/MonitoringAndProfilingTools)
	- top, netstat
	- cloudwatch
- 부하테스트
	- PDCK(Plan, Do, Check, Act)
	- [Plan.md](Plan/Plan.md): 부하 테스트 계획
	- [Do.md](Do/Do.md): 부하 테스트 실행과 병목 현상 확인
	- 원인 분석과 개선