import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import type FooterType from '@theme/DocItem/Footer';
import Giscus from '@giscus/react';
import { useColorMode } from '@docusaurus/theme-common';

type Props = {
    props?: unknown;
};

export default function FooterWrapper(props: Props): JSX.Element {
    const { colorMode } = useColorMode();

    return (
        <>
            <Footer {...props} />
            <div className="mt-8"> {/* 댓글창 위 여백 */}
                <Giscus
                    repo="raiders032/youngthree-blog"
                    repoId="R_kgDONREpvQ"
                    category="Q&A"
                    categoryId="DIC_kwDONREpvc4CkXgb"
                    mapping="pathname"
                    strict="0"
                    reactionsEnabled="1"
                    emitMetadata="0"
                    inputPosition="bottom"
                    theme={colorMode}
                    lang="ko"
                />
            </div>
        </>
    );
}

// Type assertion to ensure type safety
export type { FooterType };