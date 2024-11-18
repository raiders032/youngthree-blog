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
                    repoId="여기에_repo_ID입력"
                    category="Comments"
                    categoryId="여기에_category_ID입력"
                    mapping="pathname"
                    reactionsEnabled="1"
                    emitMetadata="0"
                    inputPosition="top"
                    theme={colorMode === 'dark' ? 'dark_high_contrast' : 'light'}
                    lang="ko"
                    loading="lazy"
                />
            </div>
        </>
    );
}

// Type assertion to ensure type safety
export type { FooterType };