import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
    title: string;
    Svg: React.ComponentType<React.ComponentProps<'svg'>>;
    description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
    {
        title: 'Computer Science',
        Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
        description: (
            <>
                자료구조, 알고리즘, 운영체제 등
                개발자에게 필요한 CS 핵심 지식을 정리했습니다.
            </>
        ),
    },
    {
        title: '백엔드 개발',
        Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
        description: (
            <>
                Java/Kotlin과 Spring 생태계를 기반으로 한 백엔드 개발 경험과
                JPA, QueryDSL을 활용한 데이터 액세스 최적화 전략을 다룹니다.
            </>
        ),
    },
    {
        title: 'Cloud & DevOps',
        Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
        description: (
            <>
                AWS 클라우드 서비스를 활용한
                컨테이너 기반 인프라 구축 및 CI/CD 파이프라인 구성 경험을 공유합니다.
            </>
        ),
    },
];

function Feature({title, Svg, description}: FeatureItem) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--center">
                <Svg className={styles.featureSvg} role="img" />
            </div>
            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): JSX.Element {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}