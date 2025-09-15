import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
    title: 'Young Three의 실험실',
    tagline: 'Young Three의 개발 실험실은 Java/Spring 백엔드 개발자를 위한 종합적인 기술 문서 라이브러리 웹사이트입니다. 이 웹사이트는 컴퓨터 과학의 기초 개념부터 최신 클라우드 기술과 아키텍처 패턴까지, 실무에서 바로 활용할 수 있는 지식을 체계적으로 정리하여 제공합니다.',
    favicon: 'img/favicon.ico',
    url: 'https://blog.youngthree.me/',
    baseUrl: '/',
    onBrokenLinks: "log",
    onBrokenMarkdownLinks: 'warn',

    i18n: {
        defaultLocale: 'ko',
        locales: ['ko'],
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    exclude: [],
                    tags: 'tags.yml',
                    showLastUpdateTime: false,
                    showLastUpdateAuthor: false,
                    onInlineTags: 'ignore',
                },
                blog: {
                    showReadingTime: true,
                    feedOptions: {
                        type: ['rss', 'atom'],
                        xslt: true,
                    },
                    // Useful options to enforce blogging best practices
                    onInlineTags: 'warn',
                    onInlineAuthors: 'warn',
                    onUntruncatedBlogPosts: 'warn',
                },
                sitemap: {
                    filename: 'sitemap.xml',
                    ignorePatterns: ['/docs/tags/**', '/blog/**', '/finance/tags/**', '/portfolio/tags/**'],
                    changefreq: 'weekly',
                    lastmod: "date",
                    createSitemapItems: async (params) => {
                        const {defaultCreateSitemapItems, ...rest} = params;
                        const items = await defaultCreateSitemapItems(rest);

                        return items.map(item => {
                            if (item.url.includes('/docs/intro')) {
                                return {...item, priority: 1.0};
                            }

                            if (item.url.includes('/docs/AWS')) {
                                return {...item, priority: 0.3};
                            }

                            return item;
                        });
                    },
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    plugins: [
        [
            '@docusaurus/plugin-content-docs',
            {
                id: 'finance',
                path: 'finance',
                routeBasePath: 'finance',
                sidebarPath: './sidebars.finance.ts',
                exclude: [],
                tags: 'tags.yml',
                showLastUpdateTime: false,
                showLastUpdateAuthor: false,
                onInlineTags: 'ignore',
            },
        ],
        [
            '@docusaurus/plugin-content-docs',
            {
                id: 'portfolio',
                path: 'portfolio',
                routeBasePath: 'portfolio',
                sidebarPath: './sidebars.portfolio.ts',
                exclude: [],
                tags: 'tags.yml',
                showLastUpdateTime: false,
                showLastUpdateAuthor: false,
                onInlineTags: 'ignore',
            },
        ],
    ],

    themeConfig: {
        metadata: [
            {name: 'keywords', content: '개발, 프로그래밍, 웹개발, 백엔드, 기술블로그'},
            {name: 'author', content: 'Young Three'},
        ],
        docs: {
            sidebar: {
                hideable: true,
                autoCollapseCategories: true
            }
        },
        navbar: {
            title: 'Young Three Blog',
            logo: {
                alt: 'My Site Logo',
                src: 'img/logo.svg',
                srcDark: 'img/logo-dark.svg',
            },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'documentSidebar',
                    position: 'left',
                    label: 'Document',
                },
                {
                    type: 'docSidebar',
                    docsPluginId: 'finance',
                    sidebarId: 'financeSidebar',
                    position: 'left',
                    label: 'Finance',
                },
                {
                    type: 'docSidebar',
                    docsPluginId: 'portfolio',
                    sidebarId: 'portfolioSidebar',
                    position: 'left',
                    label: 'Portfolio',
                },
                {
                    href: 'https://github.com/raiders032',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        algolia: {
            appId: 'SY4OB1RDU7',
            apiKey: '72a9182ad487c6b58032ff5cb476a480',
            indexName: 'youngthree',
            contextualSearch: true,
            searchPagePath: 'search',
            insights: false,
        },
        giscus: {
            repo: 'raiders032/youngthree-blog',
            repoId: 'R_kgDONREpvQ',
            category: 'Q&A',
            categoryId: 'DIC_kwDONREpvc4CkXgb',
            mapping: 'pathname',
            reactionsEnabled: '1',
            theme: 'light',
            darkTheme: 'dark_high_contrast',
            lang: 'ko'
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: '콘텐츠',
                    items: [
                        {
                            label: '기술 문서',
                            to: '/docs/intro',
                        },
                        {
                            label: '재테크',
                            to: '/finance',
                        },
                        {
                            label: '포트폴리오',
                            to: '/portfolio',
                        },
                    ],
                },
                {
                    title: '커뮤니티',
                    items: [
                        {
                            label: 'LinkedIn',
                            href: 'https://www.linkedin.com/in/youngthree',
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/raiders032',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Young Three's Dev Lab. Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
