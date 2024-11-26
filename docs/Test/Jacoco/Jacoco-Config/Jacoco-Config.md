##  1 JaCoCo 설정

- JaCoCo 플러그인은 크게 4가지 주요 설정 영역이 있습니다:
- `jacoco { }`: 플러그인의 전역 설정 (Extension)
- `jacocoTestReport`: 리포트 생성 Task
- `jacocoTestCoverageVerification`: 커버리지 검증 Task 
- `test { jacoco { } }`: 테스트 Task의 JaCoCo 관련 설정



##  2 플러그인 전역 설정 (Extension)

```groovy
jacoco {
    // JaCoCo 버전 설정
    toolVersion = "0.8.12"
    
    // 리포트 저장 위치 설정
    reportsDirectory = layout.buildDirectory.dir('customJacocoReportDir')
    
    // 특정 Task에 JaCoCo 적용
    applyTo(myCustomTask)
}
```

- JaCoCo 플러그인의 기본적인 동작을 정의합니다.
- 버전과 리포트 디렉토리 등 전역 설정을 관리합니다.



###  2.1 toolVersion

- 사용할 JaCoCo JAR 파일의 버전을 지정합니다.
- String 타입으로 제공됩니다.
- https://www.eclemma.org/jacoco/ 버전 참고



###  2.2 reportsDirectory

```groovy
jacoco {
    toolVersion = "0.8.12"
    // 방법 1: 절대 경로 사용
    reportsDirectory = file("$buildDir/reports/jacoco")
    
    // 방법 2: 상대 경로 사용
    reportsDirectory = layout.buildDirectory.dir('reports/jacoco')
    
    // 방법 3: 프로젝트 루트 기준 경로 지정
    reportsDirectory = layout.projectDirectory.dir('my-reports/jacoco')
}
```

- 리포트가 생성될 디렉토리를 지정합니다.
- 기본값: `${project.reporting.baseDir}/jacoco`
- DirectoryProperty 타입으로 제공됩니다.
- 일반적으로는 build 디렉토리 내에 리포트를 생성하는 것이 좋습니다. 왜냐하면:



##  3 리포트 생성 Task (jacocoTestReport)

- JaCoCo는 테스트 실행 결과를 다양한 형식의 리포트로 변환합니다.
- 바이너리 형태의 실행 데이터(.exec)를 사람이나 도구가 읽을 수 있는 형태로 변환합니다.
	- jacocoTestReport는 테스트 실행 결과(.exec 파일)가 필요합니다.
	- 기본적으로 test 태스크와의 의존관계가 설정되어 있지 않습니다.
	- 명시적인 의존관계 설정이 필요합니다.
- jacocoTestReport Task를 통해 리포트 생성을 제어할 수 있습니다.



**예시**

```groovy
jacocoTestReport {
    // 테스트 Task 의존성
    dependsOn test
    
    reports {
        // HTML 리포트 설정
        html {
            required = true
            outputLocation = layout.buildDirectory.dir('jacocoHtml')
        }
        
        // XML 리포트 설정
        xml {
            required = false
        }
        
        // CSV 리포트 설정
        csv {
            required = false
        }
    }
}
```



###  3.1 HTML 리포트

```groovy
html {
	// 활성화 여부
    required = true  

	// 출력 위치
    outputLocation = layout.buildDirectory.dir('jacocoHtml')  
}
```

- 웹 브라우저에서 확인할 수 있는 시각적 리포트입니다.
- 코드 커버리지를 직관적으로 파악할 수 있습니다.
- 색상 코드를 통해 커버리지 상태를 쉽게 확인할 수 있습니다:
    - 빨간색: 커버되지 않은 코드
    - 노란색: 일부만 커버된 코드
    - 녹색: 완전히 커버된 코드



###  3.2 XML 리포트

```groovy
xml {
    required = true
    outputLocation = layout.buildDirectory.file('jacoco/report.xml')
}
```

- CI/CD 도구나 품질 분석 도구와의 통합에 사용됩니다.
- SonarQube 등의 코드 품질 분석 도구가 이 형식을 주로 사용합니다.
- 상세한 메트릭 정보를 포함합니다.



##  4 커버리지 검증 Task (jacocoTestCoverageVerification)

- jacocoTestCoverageVerification은 코드 커버리지가 지정된 기준을 충족하는지 검증하는 Task입니다.
- Gradle 빌드의 성공/실패로 검증 결과를 표시합니다.
- 원하는 커버리지 기준을 만족하지 못하면 빌드가 실패합니다.



###  4.1 기본 설정

```groovy
jacocoTestCoverageVerification {
    violationRules {
        rule {
            enabled = true
            element = 'CLASS'
            
            limit {
                counter = 'LINE'
                value = 'COVEREDRATIO'
                minimum = 0.50
            }
        }
    }
}
```



###  4.2 Rule 설정

**element (커버리지 체크 단위)**

- 커버리지를 체크할 단위를 지정합니다.
- 지원하는 단위:
	- `BUNDLE`: 패키지 번들(프로젝트 전체)
	- `CLASS`: 클래스
	- `GROUP`: 논리적 번들 그룹
	- `METHOD`: 메서드
	- `PACKAGE`: 패키지
	- `SOURCEFILE`: 소스 파일
- 기본값: `BUNDLE`



**includes/excludes**

```groovy
rule {
    enabled = true
    element = 'CLASS'
    
    // 특정 패키지만 포함
    includes = ['com.example.core.*']
    
    // 특정 패키지 제외
    excludes = [
        'com.example.config.*',
        'com.example.dto.*'
    ]
    
    limit {
        counter = 'LINE'
        value = 'COVEREDRATIO'
        minimum = 0.80
    }
}
```

- `includes`: 검증을 적용할 패키지 지정
- `excludes`: 검증에서 제외할 패키지 지정
- 와일드카드(`*`, `?`) 사용 가능



###  4.3 Limit 설정

**counter (측정 단위)**

```groovy
limit {
    counter = 'BRANCH'  // 분기 커버리지
    value = 'COVEREDRATIO'
    minimum = 0.80
}
```

측정 가능한 단위:
	- `BRANCH`: 조건문 등의 분기 커버리지
	- `CLASS`: 클래스 커버리지
	- `COMPLEXITY`: 복잡도
	- `INSTRUCTION`: Java 바이트코드 명령어 수준
	- `METHOD`: 메소드 커버리지
	- `LINE`: 실제 코드 라인 수준
	- 기본값: `INSTRUCTION`



**value (측정 방식)**

```groovy
limit {
    counter = 'LINE'
    value = 'COVEREDRATIO'  // 커버된 비율
    minimum = 0.80          // 80% 이상 요구
}
```

지원하는 측정 방식:
	- `COVEREDCOUNT`: 커버된 개수
	- `COVEREDRATIO`: 커버된 비율 (0.0 ~ 1.0)
	- `MISSEDCOUNT`: 커버되지 않은 개수
	- `MISSEDRATIO`: 커버되지 않은 비율
	- `TOTALCOUNT`: 전체 개수
	- 기본값: `COVEREDRATIO`



###  4.4 복합 규칙 설정 예시

```groovy
jacocoTestCoverageVerification {
    violationRules {
        // 규칙 1: 라인 커버리지
        rule {
            enabled = true
            element = 'CLASS'
            includes = ['com.example.core.*']
            excludes = ['com.example.core.config.*']
            
            limit {
                counter = 'LINE'
                value = 'COVEREDRATIO'
                minimum = 0.80
            }
        }
        
        // 규칙 2: 분기 커버리지
        rule {
            enabled = true
            element = 'CLASS'
            includes = ['com.example.core.*']
            
            limit {
                counter = 'BRANCH'
                value = 'COVEREDRATIO'
                minimum = 0.70
            }
        }
        
        // 규칙 3: 메소드 커버리지
        rule {
            enabled = true
            element = 'METHOD'
            
            limit {
                counter = 'METHOD'
                value = 'COVEREDCOUNT'
                minimum = 10
            }
        }
    }
}
```



###  4.5 모범 사례

- 점진적인 커버리지 목표 설정
	- 초기에는 달성 가능한 수준으로 설정
	- 시간이 지남에 따라 점진적으로 높여감
- 중요도에 따른 차등 적용
	- 핵심 비즈니스 로직: 높은 커버리지 요구
	- 설정/유틸리티 클래스: 낮은 커버리지 허용
- excludes를 통한 예외 처리
	- 설정 클래스, DTO 등 테스트가 불필요한 클래스 제외
	- 자동 생성된 코드 제외



##  5 테스트 Task JaCoCo 설정

- 테스트 실행 시 JaCoCo 에이전트의 동작을 제어하는 설정입니다.



###  5.1 기본 설정값

```groovy
test {
    jacoco {
        enabled = true                        // JaCoCo 측정 활성화
        includes = []                         // 포함할 클래스 패턴
        excludes = []                         // 제외할 클래스 패턴
        excludeClassLoaders = []              // 제외할 클래스로더
        includeNoLocationClasses = false      // 위치 정보 없는 클래스 포함 여부
        sessionId = "<auto-generated>"        // 세션 ID
        dumpOnExit = true                    // 종료 시 실행 데이터 덤프
        output = JacocoTaskExtension.Output.FILE
        address = "localhost"                 // TCP/IP 모드 주소
        port = 6300                          // TCP/IP 모드 포트
        jmx = false                          // JMX 기능 사용 여부
    }
}
```



###  5.2 파일 및 디렉토리 설정

```groovy
test {
    jacoco {
        // 실행 데이터 파일 위치
        destinationFile = layout.buildDirectory
            .file('jacoco/jacocoTest.exec')
            .get().asFile
            
        // 클래스 덤프 디렉토리
        classDumpDir = layout.buildDirectory
            .dir('jacoco/classpathdumps')
            .get().asFile
    }
}
```



###  5.3 측정 대상 설정

```groovy
test {
    jacoco {
        // 특정 패키지만 포함
        includes = ['com.example.*']
        
        // 특정 패키지 제외
        excludes = ['com.example.excluded.*']
    }
}
```



##  6 출력 모드 설정

- JaCoCo는 세 가지 출력 모드를 지원합니다:
	- `FILE`: 실행 데이터를 파일로 저장 (기본값)
	- `TCP_SERVER`: TCP 서버로 전송
	- `TCP_CLIENT`: TCP 클라이언트로 전송



```groovy
test {
    jacoco {
        // TCP 서버 모드 설정 예시
        output = JacocoTaskExtension.Output.TCP_SERVER
        address = "192.168.1.100"
        port = 8000
    }
}
```