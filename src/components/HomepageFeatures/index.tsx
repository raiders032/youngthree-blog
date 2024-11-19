import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

export default function HomepageFeatures(): JSX.Element {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className={styles.getStarted}>
                    <Heading as="h2">기술 문서 둘러보기</Heading>
                    <p>CS, 데이터베이스, 클라우드 등 다양한 개발 지식을 정리했습니다.</p>
                    <Link
                        className="button button--primary button--lg"
                        to="/docs/intro">
                        문서 구경하기 →
                    </Link>
                </div>
            </div>
        </section>
    );
}