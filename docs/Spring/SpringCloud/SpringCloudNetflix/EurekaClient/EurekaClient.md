---
title: "Eureka Client"
description: "Spring Cloud Netflix Eureka Client의 기본 설정부터 고급 설정까지 자세히 알아봅니다. 서비스 등록, 인증, 상태 체크 등 실제 운영에 필요한 모든 내용을 다룹니다."
tags: [ "SPRING_CLOUD", "EUREKA", "MICROSERVICES", "SPRING_BOOT", "JAVA", "BACKEND" ]
keywords: [ "유레카", "eureka", "클라이언트", "client", "서비스디스커버리", "service discovery", "마이크로서비스", "microservices", "스프링클라우드", "spring cloud" ]
draft: false
hide_title: true
---

## 1. Eureka Client 소개

- 마이크로서비스 아키텍처에서 서비스 디스커버리는 핵심 요소입니다.
- Eureka는 Netflix에서 개발한 서비스 디스커버리 서버로, Spring Cloud Netflix 프로젝트의 일부입니다.
- Eureka는 Client와 Server로 구성되며, Eureka Client는 서비스를 등록하고 Eureka Server로부터 등록된 서비스 정보를 조회합니다.

## 2. 기본 설정

- Eureka Client를 사용하려면 의존성을 추가하고 서비스를 등록해야 합니다.

### 2.1 의존성 추가

#### Maven 설정

```xml

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

:::tip[Jersey 제외하기]
기본적으로 Eureka Client는 HTTP 통신에 Jersey를 사용합니다. Jersey 의존성을 제외하고 Spring RestTemplate을 사용하려면:

```xml

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    <exclusions>
        <exclusion>
            <groupId>com.sun.jersey</groupId>
            <artifactId>jersey-client</artifactId>
        </exclusion>
        <exclusion>
            <groupId>com.sun.jersey</groupId>
            <artifactId>jersey-core</artifactId>
        </exclusion>
        <exclusion>
            <groupId>com.sun.jersey.contribs</groupId>
            <artifactId>jersey-apache-client4</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

:::

### 2.2 서비스 등록

#### 기본 애플리케이션 설정

```java
@SpringBootApplication
@RestController
public class Application {
    @RequestMapping("/")
    public String home() {
        return "Hello world";
    }

    public static void main(String[] args) {
        new SpringApplicationBuilder(Application.class)
            .web(true)
            .run(args);
    }
}
```

#### application.yml 설정

```yaml
spring:
  application:
    name: my-service  # 서비스 ID로 사용됨

eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/  # Eureka 서버 URL
```

- `eureka.client.serviceUrl.defaultZone`: Eureka 서버 URL의 기본값을 설정합니다.
- `spring.application.name`: 서비스 ID이자 호스트명으로 사용

## 3. 서비스 보안 설정

### 3.1 Basic 인증 설정

Eureka 서버에 Basic 인증이 설정된 경우, URL에 인증정보를 포함할 수 있습니다:

```yaml
eureka:
  client:
    serviceUrl:
      defaultZone: http://user:password@localhost:8761/eureka/
```

:::danger[제한사항]
Eureka의 제한으로 서버별로 다른 인증정보를 설정할 수 없으며, 첫 번째 설정만 사용됩니다.
:::

### 3.2 HTTPS 설정

HTTPS를 사용하려면 다음 설정이 필요합니다:

```yaml
eureka:
  instance:
    securePortEnabled: true
    nonSecurePortEnabled: false
    statusPageUrl: https://${eureka.hostname}/info
    healthCheckUrl: https://${eureka.hostname}/health
    homePageUrl: https://${eureka.hostname}/
```

## 4. 상태 체크와 헬스 체크

### 4.1 기본 설정

```yaml
eureka:
  instance:
    statusPageUrlPath: ${server.servletPath}/info
    healthCheckUrlPath: ${server.servletPath}/health
```

- `statusPageUrlPath`: 상태 페이지 URL 경로
- `healthCheckUrlPath`: 헬스 체크 URL 경로

### 4.2 헬스 체크 활성화

```yaml
eureka:
  client:
    healthcheck:
      enabled: true
```

- Eureka는 클라이언트 하트비트로만 클라이언트 상태를 확인합니다.
- Discovery Client는 Spring Boot Actuator의 실제 헬스체크 상태를 전달하지 않습니다.
	- 따라서 등록이 성공하면 항상 'UP' 상태로 표시됩니다.
- Eureka 헬스체크를 활성화하면:
	- 실제 애플리케이션 상태가 Eureka에 전달됨
	- 다른 애플리케이션들은 'UP' 상태가 아닌 서비스로 트래픽을 보내지 않음

:::warning[주의사항]
`healthcheck.enabled` 설정은 반드시 application.yml에 설정해야 합니다. bootstrap.yml에 설정하면 UNKNOWN 상태로 등록되는 등 부작용이 발생할 수 있습니다.
:::

### 4.3 커스텀 헬스 체크

더 세밀한 헬스 체크가 필요한 경우 `com.netflix.appinfo.HealthCheckHandler`를 구현하세요:

```java
public class CustomHealthCheckHandler implements HealthCheckHandler {
    @Override
    public InstanceInfo.InstanceStatus getStatus(InstanceInfo.InstanceStatus current) {
        // 커스텀 헬스 체크 로직 구현
        return InstanceInfo.InstanceStatus.UP;
    }
}
```

## 5. 메타데이터 관리

### 5.1 기본 메타데이터

- Eureka 인스턴스는 다음과 같은 기본 메타데이터를 제공합니다:
	- 호스트명
	- IP 주소
	- 포트 번호
	- 상태 페이지 URL
	- 헬스 체크 URL

### 5.2 커스텀 메타데이터 추가

```yaml
eureka:
  instance:
    metadata-map:
      zone: zone1
      customKey: customValue
```

## 6. 인스턴스 ID 설정

### 6.1 기본 인스턴스 ID 형식

기본적으로 Eureka 인스턴스 ID는 다음 형식을 따릅니다:

```
${spring.cloud.client.hostname}:${spring.application.name}:${spring.application.instance_id:${server.port}}}
```

예: `myhost:myappname:8080`

### 6.2 커스텀 인스턴스 ID 설정

```yaml
eureka:
  instance:
    instance-id: ${spring.application.name}:${random.value}
```

## 7. Eureka Client API 사용

### 7.1 EurekaClient 사용

```java
@Autowired
private EurekaClient discoveryClient;

public String serviceUrl() {
    InstanceInfo instance = discoveryClient.getNextServerFromEureka("STORES", false);
    return instance.getHomePageUrl();
}
```

:::danger[주의사항]
EurekaClient는 @PostConstruct나 @Scheduled 메서드에서 사용하지 마세요. ApplicationContext 초기화가 완료되지 않은 상태일 수 있습니다.
:::

### 7.2 DiscoveryClient 사용

```java
@Autowired
private DiscoveryClient discoveryClient;

public String serviceUrl() {
    List<ServiceInstance> list = discoveryClient.getInstances("STORES");
    if (list != null && list.size() > 0) {
        return list.get(0).getUri();
    }
    return null;
}
```

## 8. 서비스 등록 지연과 최적화

### 8.1 서비스 등록 주기

```yaml
eureka:
  instance:
    lease-renewal-interval-in-seconds: 30  # 기본값
```

- 서비스 인스턴스는 기본 30초 주기로 Eureka 서버에 하트비트를 보냅니다.
- 서비스가 발견 가능한 상태가 되려면 인스턴스, 서버, 클라이언트 모두가 로컬 캐시에 동일한 메타데이터를 가져야 합니다(3번의 하트비트가 필요할 수 있음).
- `eureka.instance.lease-renewal-interval-in-seconds` 주기를 변경할 수 있습니다.
- 30초 미만으로 설정하면 클라이언트가 다른 서비스와 더 빨리 연결됩니다.
- 하지만 운영 환경에서는 서버 내부 계산이 기본 갱신 주기를 가정하고 있어서 기본값을 유지하는 것이 좋습니다.

### 8.2 레지스트리 가져오기 주기

```yaml
eureka:
  client:
    registry-fetch-interval-seconds: 30  # 기본값
```

- 클라이언트는 30초마다 Eureka 서버에서 레지스트리 정보를 가져옵니다.
- 운영 환경에서는 기본값(30초) 사용을 권장합니다.
- 개발 환경에서는 더 빠른 서비스 발견을 위해 주기를 줄일 수 있습니다.
- 주기를 줄이면 Eureka 서버 부하가 증가할 수 있으니 주의해야 합니다.

### 8.3 클라이언트 리프레시 설정

- 기본적으로 EurekaClient 빈은 리프레시가 가능합니다(속성 변경/갱신 가능).
- 리프레시 발생 시 클라이언트들이 Eureka 서버에서 등록 해제되므로, 특정 서비스의 모든 인스턴스가 일시적으로 이용 불가능할 수 있습니다.
- 이를 방지하려면 eureka.client.refresh.enable=false로 리프레시 기능을 비활성화하면 됩니다.

```yaml
eureka:
  client:
    refresh:
      enable: false  # 리프레시 기능 비활성화
```

## 9. 존(Zone) 설정

### 9.1 기본 존 설정

```yaml
eureka:
  instance:
    metadataMap:
      zone: zone1
  client:
    preferSameZoneEureka: true
```

### 9.2 Spring Cloud LoadBalancer와 통합

Spring Cloud LoadBalancer의 Zone 기반 필터링을 위한 설정:

```yaml
spring:
  cloud:
    loadbalancer:
      eureka:
        approximateZoneFromHostname: true
```

:::tip[존 데이터 소스]
존 정보는 다음 순서로 결정됩니다:

1. Eureka 인스턴스 메타데이터의 zone 값
2. 서버 호스트네임의 도메인 이름 (approximateZoneFromHostname=true인 경우)
3. 클라이언트 설정의 eureka.client.availabilityZones
   :::

## 10. AWS 환경 설정

### 10.1 AWS 인식 설정

```java
@Bean
@Profile("!default")
public EurekaInstanceConfigBean eurekaInstanceConfig(InetUtils inetUtils) {
    EurekaInstanceConfigBean b = new EurekaInstanceConfigBean(inetUtils);
    AmazonInfo info = AmazonInfo.Builder.newBuilder().autoBuild("eureka");
    b.setDataCenterInfo(info);
    return b;
}
```

## 11. Cloud Foundry 환경 설정

### 11.1 라우터 설정

```yaml
eureka:
  instance:
    hostname: ${vcap.application.uris[0]}
    nonSecurePort: 80
    instanceId: ${vcap.application.instance_id}
```

:::info[Cloud Foundry 특징]

- 모든 인스턴스가 동일한 호스트네임 사용
- 글로벌 라우터를 통한 트래픽 처리
- vcap.application.instance_id로 인스턴스 구분
  :::