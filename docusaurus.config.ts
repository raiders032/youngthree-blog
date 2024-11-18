import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Young Three의 개발 실험실',
  tagline: '성장하는 개발자의 기록',
  favicon: 'img/favicon.ico',
  url: 'https://youngthree-blog.vercel.app/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
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
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Young Three Blog',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Document',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/blog/tags', label: 'Tag', position: 'left'},
        {
          href: 'https://github.com/raiders032',
          label: 'GitHub',
          position: 'right',
        },
      ],
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
