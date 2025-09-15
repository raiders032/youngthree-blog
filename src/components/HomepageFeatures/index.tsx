import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

export default function HomepageFeatures(): JSX.Element {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className={styles.cards}>
                    <div className={styles.card}>
                        <Heading as="h2">기술 문서 둘러보기</Heading>
                        <p>CS, 데이터베이스, 클라우드 등 다양한 개발 지식을 정리했습니다.</p>
                        <Link className="button button--primary button--lg" to="/docs/intro">
                            문서 구경하기 →
                        </Link>
                    </div>

                    <div className={styles.card}>
                        <Heading as="h2">재테크 둘러보기</Heading>
                        <p>ISA, 연금, 자산배분 등 개인 재무 관리 자료를 모았습니다.</p>
                        <Link className="button button--secondary button--lg" to="/finance">
                            재테크 바로가기 →
                        </Link>
                    </div>

                    <div className={styles.card}>
                        <Heading as="h2">포트폴리오 보기</Heading>
                        <p>설계, 기술 선택, CI/CD 등 프로젝트 기록을 한곳에 모았습니다.</p>
                        <Link className="button button--secondary button--lg" to="/portfolio">
                            포트폴리오 보기 →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}