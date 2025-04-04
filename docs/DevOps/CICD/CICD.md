##  1 CI/CD

- CI/CD는 앱 개발 단계를 자동화하여 고객에게 앱을 수시로 전달하는 방식이다. 
- CI/CD는 `Continuous Integration`, `Continuous Delivery`, `Continuous Deployment`로 구성되어 있다.



**CI/CD 과정**
![continuous_delivery.4f4cddb8556e2b1a0ca0872ace4d5fe2f68bbc58.png](images/continuous_delivery.4f4cddb8556e2b1a0ca0872ace4d5fe2f68bbc58.png)

- 소스 코드의 변경을 커밋하면 Continuous Integration 과정을 거져 빌드 및 테스트되어 리포지토리에 통합된다.
- 이후 Continuous Delivery 과정을 거치면 테스트 환경(스테이징 환경)에 배포하여 통합 테스트, 로드 테스트 등을 진행한다
  - Continuous Delivery 과정을 거치면 최종적으로 개발자가 수동으로 프로덕션 환경에 배포를 결정한다
- 이후 Continuous Deployment 과정을 거치면 Continuous Delivery과 마찬가지로 작동한 후 최종적으로 프로덕션 환경에 배포하는것 까지 자동화된다.

##  2 Continuous Integration

- 자속적인 통합이란 애플리케이션에 대한 새로운 코드 변경 사항이 정기적으로 빌드 및 테스트되어 공유 리포지토리에 통합되는 것을 의미한다
- 따라서 여러 명의 개발자가 동시에 애플리케이션 개발과 관련된 코드 작업을 할 경우 서로 충돌할 수 있는 문제를 해결할 수 있다



###  2.1 CI가 필요한 이유

- 조직에서 특정한 날을 정해 모든 분기 소스 코드를 병합하는 경우, 결과적으로 반복적인 수작업에 많은 시간을 소모하게 된다
- CI를 통해 개발자들은 코드 변경 사항을 공유 브랜치로 다시 병합하는 작업을 더욱 수월하게 자주 수행할 수 있다
- 개발자가 애플리케이션에 적용한 변경 사항이 병합되면 자동화 테스트실행을 통해 변경 사항이 애플리케이션에 제대로 적용되었는지를 확인한다
  - 테스트를 통과하지 못한 경우 병합하지 않아 즉각적인 피드백을 받을 수 있다



##  3 Continuous Delivery

- 지속적 전달에서는 모든 코드 변경이 빌드 및 테스트된 후, 비프로덕션 테스트 또는 스테이징 환경으로 푸시된다
- 프로덕션 배포 전에 여러 개의 병렬 테스트 단계가 있을 수 있습니다. 
- 지속적 전달에서는 개발자가 단순한 유닛 테스트 외에도 다양한 테스트를 자동화할 수 있으므로, 고객에게 배포하기 전에 여러 차원에서 애플리케이션 업데이트를 확인할 수 있습니다. 
- 이러한 테스트에는 UI 테스트, 로드 테스트, 통합 테스트, API 안정성 테스트 등이 포함될 수 있습니다. 
- 이를 통해 개발자는 업데이트를 좀 더 철저히 검증하고 문제를 사전에 발견할 수 있습니다.



###  3.1 Continuous Deployment와의 차이점

- 지속적 전달과 지속적 배포의 차이점은 프로덕션에 업데이트에 대한 수동 승인 존재 여부입니다. 
- 지속적 배포의 경우 명시적 승인 없이 자동으로 프로덕션이 일어납니다. 
- [참고](https://aws.amazon.com/ko/devops/continuous-delivery/)

##  4 Continuous Deployment

- Continuous Deployment는 프로덕션 준비가 완료된 빌드를 코드 리포지토리에 자동으로 릴리스하는 지속적 제공의 확장된 형태인 지속적 배포는 애플리케이션을 프로덕션으로 릴리스하는 작업을 자동화합니다. 
- 프로덕션 이전의 파이프라인 단계에는 수동 작업 과정이 없으므로, 지속적 배포가 제대로 이루어지려면 테스트 자동화가 제대로 설계되어 있어야 합니다.
- 실제 사례에서 지속적 배포란 개발자가 애플리케이션에 변경 사항을 작성한 후 몇 분 이내에 애플리케이션을 자동으로 실행할 수 있는 것을 의미합니다(자동화된 테스트를 통과한 것으로 간주). 
- 이를 통해 사용자 피드백을 지속적으로 수신하고 통합하는 일이 훨씬 수월해집니다. 
- 이러한 모든 CI/CD 적용 사례는 애플리케이션 배포의 위험성을 줄여주므로 애플리케이션 변경 사항을 한 번에 모두 릴리스하지 않고 작은 조각으로 세분화하여 더욱 손쉽게 릴리스할 수 있습니다. 
- 그러나 자동화된 테스트는 CI/CD 파이프라인의 여러 테스트 및 릴리스 단계를 수행할 수 있어야 하기 때문에 많은 선행 투자가 필요합니다.
- [참고](https://www.redhat.com/ko/topics/devops/what-is-ci-cd)