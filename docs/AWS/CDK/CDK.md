## 1 AWS CDK (Cloud Development Kit)

- AWS CDK는 클라우드 인프라를 코드로 정의하고 프로비저닝할 수 있게 해주는 오픈 소스 소프트웨어 개발 프레임워크입니다.
- CDK를 사용하면 친숙한 프로그래밍 언어를 사용하여 클라우드 리소스를 정의할 수 있습니다.
- CDK는 정의된 리소스를 AWS CloudFormation 템플릿으로 변환하여 실제 인프라를 생성합니다.



## 2 CDK의 주요 특징

- **다양한 프로그래밍 언어 지원**: TypeScript, JavaScript, Python, Java, C#/.NET, Go 등을 지원합니다.
- **높은 수준의 추상화**: 복잡한 인프라 구성을 간단한 코드로 표현할 수 있습니다.
- **재사용성**: 컴포넌트를 모듈화하여 재사용할 수 있습니다.
- **유연성**: 필요에 따라 로우 레벨 CloudFormation 구성과 혼합하여 사용할 수 있습니다.
- **타입 안정성**: 정적 타입 언어를 사용할 경우, 컴파일 시점에 많은 오류를 잡을 수 있습니다.



## 3 CDK의 주요 개념

### 3.1 CDK Constructs

- CDK Construct는 최종 CloudFormation 스택을 생성하는 데 필요한 모든 것을 캡슐화한 컴포넌트입니다.
- 단일 AWS 리소스(예: S3 버킷)부터 여러 관련 리소스(예: 작업자 대기열과 컴퓨팅)까지 다양한 수준을 표현할 수 있습니다.
- AWS Construct Library는 CDK에 포함된 Construct 모음으로, 모든 AWS 리소스에 대한 Construct를 포함합니다.
- Construct Hub에는 AWS, 타사 및 오픈 소스 CDK 커뮤니티의 추가 Construct가 포함되어 있습니다.



#### 3.1.1 Layer 1 Constructs (L1)

- CFN Resources라고도 불리며, CloudFormation에서 직접 사용 가능한 모든 리소스를 나타냅니다.
- CloudFormation 리소스 사양에서 주기적으로 생성됩니다.
- Construct 이름은 Cfn으로 시작합니다(예: CfnBucket).
- 모든 리소스 속성을 명시적으로 구성해야 합니다.



**예시 코드**

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

const myBucket = new s3.CfnBucket(this, 'MyBucket', {
  bucketName: 'my-bucket-name',
  versioning: {
	status: 'Enabled'
  }
});
```



#### 3.1.2 Layer 2 Constructs (L2)

- AWS 리소스를 나타내지만 더 높은 수준의 intent-based API를 제공합니다.
- L1과 유사한 기능을 제공하지만 편리한 기본값과 boilerplate 코드가 포함되어 있습니다.
- 리소스 속성에 대한 모든 세부 사항을 알 필요가 없습니다.
- 리소스 작업을 더 간단하게 만드는 메서드를 제공합니다
	- 예:bucket.addLifeCycleRule()



**예시 코드**

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

const myBucket = new s3.Bucket(this, 'MyBucket', {
  bucketName: 'my-bucket-name',
  versioned: true,
  encryption: s3.BucketEncryption.S3_MANAGED,
  removalPolicy: cdk.RemovalPolicy.DESTROY
});

myBucket.addLifecycleRule({
  expiration: cdk.Duration.days(90)
});
```



#### 3.1.3 Layer 3 Constructs (L3)

- Patterns라고도 불리며, 여러 관련 리소스를 나타냅니다.
- AWS에서 일반적인 작업을 완료하는 데 도움이 됩니다.
- 복잡한 아키텍처나 패턴을 단일 Construct로 추상화합니다.



**예시**

- aws-apigateway.LambdaRestApi: Lambda 함수로 지원되는 API Gateway를 나타냅니다.
- aws-ecs-patterns.ApplicationLoadBalancerFargateService: Application Load Balancer가 있는 Fargate 클러스터를 포함하는 아키텍처를 나타냅니다.



**예시 코드**

```typescript
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

const helloFunction = new lambda.Function(this, 'HelloHandler', {
  runtime: lambda.Runtime.NODEJS_14_X,
  handler: 'hello.handler',
  code: lambda.Code.fromAsset('lambda')
});

new apigateway.LambdaRestApi(this, 'HelloApi', {
  handler: helloFunction
});
```



### 3.2 Stack

- Stack은 CDK의 배포 단위입니다.
- 하나 이상의 Construct를 포함하며, CloudFormation 스택으로 변환됩니다.
- 여러 Stack을 조합하여 복잡한 아키텍처를 구성할 수 있습니다.
- 각 Stack은 독립적으로 배포, 업데이트, 삭제될 수 있습니다.



**예시 코드**

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class MyStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
	super(scope, id, props);

	new s3.Bucket(this, 'MyBucket', {
	  versioned: true,
	  encryption: s3.BucketEncryption.S3_MANAGED,
	  removalPolicy: cdk.RemovalPolicy.DESTROY
	});
  }
}
```



### 3.3 App

- App은 CDK 애플리케이션의 루트 구조입니다.
- 하나 이상의 Stack을 포함할 수 있습니다.
- CDK 애플리케이션의 진입점 역할을 합니다.
- App 인스턴스를 생성하고 Stack을 추가하여 CDK 애플리케이션을 구성합니다.



**예시 코드**

```typescript
import * as cdk from 'aws-cdk-lib';
import { MyStack } from './my-stack';

const app = new cdk.App();
new MyStack(app, 'MyStack');
app.synth();
```



## 4 CDK 사용 예시

- 아래는 S3 버킷과 Lambda 함수를 생성하는 간단한 CDK 애플리케이션 예시입니다.



**TypeScript를 사용한 CDK 코드 예시**

```TypeScript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class MyInfraStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
	super(scope, id, props);

	// S3 버킷 생성
	const bucket = new s3.Bucket(this, 'MyBucket', {
	  versioned: true,
	  encryption: s3.BucketEncryption.S3_MANAGED,
	  removalPolicy: cdk.RemovalPolicy.DESTROY
	});

	// Lambda 함수 생성
	const lambdaFn = new lambda.Function(this, 'MyLambda', {
	  runtime: lambda.Runtime.NODEJS_14_X,
	  handler: 'index.handler',
	  code: lambda.Code.fromAsset('lambda'),
	  environment: {
		BUCKET_NAME: bucket.bucketName
	  }
	});

	// S3 버킷에 대한 읽기 권한을 Lambda 함수에 부여
	bucket.grantRead(lambdaFn);
  }
}
```

- 이 예시에서는 S3 버킷과 Lambda 함수를 생성하고, Lambda 함수에 S3 버킷에 대한 읽기 권한을 부여합니다.
- CDK를 사용하면 이렇게 간단한 코드로 복잡한 인프라를 정의할 수 있습니다.



## 5 CDK의 장점

- **코드로서의 인프라**: 버전 관리, 코드 리뷰, 테스트 등 소프트웨어 개발 프랙티스를 인프라 관리에 적용할 수 있습니다.
- **생산성 향상**: 높은 수준의 추상화와 재사용 가능한 컴포넌트를 통해 개발 속도를 높일 수 있습니다.
- **타입 안정성**: 정적 타입 언어를 사용할 경우, 많은 오류를 사전에 방지할 수 있습니다.
- **유연성**: 필요에 따라 로우 레벨 CloudFormation 구성과 혼합하여 사용할 수 있습니다.
- **통합 개발 환경**: IDE의 자동 완성, 리팩토링 도구 등을 활용할 수 있습니다.



## 6 CDK 시작하기

1. **CDK CLI 설치**: npm을 사용하여 CDK CLI를 전역으로 설치합니다.

```bash
npm install -g aws-cdk
```

2. **새 CDK 프로젝트 생성**: 원하는 언어로 새 CDK 프로젝트를 초기화합니다.

```bash
mkdir my-cdk-project
cd my-cdk-project
cdk init app --language typescript
```

3. **CDK 앱 개발**: 생성된 프로젝트 구조에 따라 스택과 리소스를 정의합니다.

4. **CDK 앱 배포**: 정의한 인프라를 AWS에 배포합니다.

```bash
cdk deploy
```



### 6.1 주요 CDK 명령어

- CDK를 사용할 때 알아두면 유용한 주요 명령어들입니다:
- `npm install -g aws-cdk-lib`: CDK CLI와 라이브러리를 설치합니다.
- `cdk init app`: 지정된 템플릿에서 새로운 CDK 프로젝트를 생성합니다.
- `cdk synth`: CloudFormation 템플릿을 합성하고 출력합니다.
- `cdk bootstrap`: CDK Toolkit 스테이징 스택을 배포합니다.
- `cdk deploy`: 스택(들)을 배포합니다.
- `cdk diff`: 로컬 CDK와 배포된 스택 간의 차이를 확인합니다.
- `cdk destroy`: 스택(들)을 삭제합니다.



## 7 결론

- AWS CDK는 클라우드 인프라를 코드로 정의하고 관리하는 강력한 도구입니다.
- 개발자들에게 친숙한 프로그래밍 언어를 사용하여 복잡한 AWS 인프라를 간단하게 표현할 수 있습니다.
- CDK를 통해 인프라 관리에 소프트웨어 엔지니어링 모범 사례를 적용할 수 있어, 더 안정적이고 유지보수가 쉬운 인프라를 구축할 수 있습니다.
- AWS 클라우드 인프라를 효율적으로 관리하고자 하는 팀이라면 CDK의 도입을 고려해볼 만합니다.