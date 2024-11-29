import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Young Three의 개발 실험실',
  tagline: '개발자를 위한 기술 문서 모음 - AWS, 알고리즘, Java, Kotlin 등의 기술 가이드와 팁을 제공합니다.',
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
          changefreq: 'monthly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
          lastmod: "date"
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    metadata: [
      {name: 'keywords', content: '개발, 프로그래밍, 웹개발, 백엔드, 기술블로그'},
      {name: 'author', content: 'Young Three'},
    ],
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
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/docs/tags', label: 'Tag', position: 'left'},
        {
          href: 'https://github.com/raiders032',
          label: 'GitHub',
          position: 'right',
        },
      ],
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
              label: '블로그',
              to: '/blog',
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
