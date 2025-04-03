---
title: "Spring"
---

## Spring

### Spring Framework

- [IoC-Container](IoC-Container)
- [Dependency Injection](DependencyInjection/DependencyInjection.md)
	- 의존성 주입 방법: 생성자 주입, 수정자 주입, 필드 주입, 일반 메서드 주입
- [Spring Transaction](Transaction/index.md)
  - [Transaction](Transaction/Transaction/Transaction.md)
    - PlatformTransactionManager, @Transactional
  - [Transaction Propagation](Transaction/TransactionPropagation/TransactionPropagation.md)
    - @Transactional
- [Profiles](SpringProfiles/SpringProfiles.md)
- [Spring Retry](SpringRetry/SpringRetry.md)
  - @EnableRetry, @Retryable
- [Spring Boot Actuator](SpringBootActuator/index.md)
- [AOP](AOP/AOP.md)
  - Crosscutting Concerns
  - Aspect, Joinpoint, Advice, Pointcut
  - AspectJ
- [JdbcTemplate](JdbcTemplate/JdbcTemplate.md)
- [Spring Caching](Caching/SpringCaching.md)
	- CacheManager, CacheResolver
	- @Cacheable, @CachePut, @CacheEvict
  - Caffeine
- [Scheduling](Scheduling/Scheduling.md)
	- TaskScheduler, @EnableScheduling, @Scheduled
- [Task Execution](TaskExecution/TaskExecution.md)
	- TaskExecutor, @EnableAsync, @Async
- [Bean Post Processor](BeanPostProcessor/BeanPostProcessor.md)

### Spring MVC

- [Spring MVC](SpringMVC/index.md)

### Spring WebFlux

- [Introduction](SpringWebflux/Introduction/Introduction.md)
- [Dispatcher Handler](SpringWebflux/DispatcherHandler/DispatcherHandler.md)

### [Spring Cloud](SpringCloud/index.md)

- Spring Cloud Netflix
	- [Eureka Client](SpringCloud/SpringCloudNetflix/EurekaClient/EurekaClient.md)
	- [Eureka Server](SpringCloud/SpringCloudNetflix/EurekaServer/EurekaServer.md)
- [Spring Cloud Gateway](SpringCloud/SpringCloudGateway/SpringCloudGateway.md)
- [Spring Cloud Config](SpringCloud/SpringCloudConfig/SpringCloudConfig.md)
- [Spring Cloud Bus](SpringCloud/SpringCloudBus/SpringCloudBus.md)

### [Spring JPA](JPA/index.md)

- [Lock](JPA/Lock/Lock.md)
	- Silent Data Loss, Optimistic Lock, Pessimistic Lock 