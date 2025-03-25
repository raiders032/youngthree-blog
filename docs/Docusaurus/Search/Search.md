## 1. Search

- Docusaurus에서 제공하는 검색 옵션은 아래와 같습니다.
  - [Algolia DocSearch](https://docsearch.algolia.com/)
  - Typesense DocSearch
  - Local Search
  - Your own SearchBar component
- 이번 문서에서는 Docusaurus에서 공식 지원하는 Algolia DocSearch를 사용하는 방법을 알아보겠습니다.

## 2. Algolia DocSearch

- Algolia DocSearch는 Docusaurus에서 제공하는 검색 옵션 중 하나로, 사용자가 사이트 내에서 검색을 할 수 있도록 도와줍니다.
- Algolia DocSearch는 무료로 사용할 수 있으며, Docusaurus에서 공식적으로 지원하고 있습니다.
- Algolia DocSearch를 사용하려면 아래와 같은 단계를 따라야 합니다.
- [apply to the DocSearch program](https://docsearch.algolia.com/apply)
  - 위 링크를 통해 먼저 DocSearch 프로그램에 신청합니다.
- DocSearch 크롤러가 주기적으로 사이트를 크롤링하여 색인을 생성합니다.

## 3. Index Configuration

- 2단계에서 DocSearch 프로그램에 신청하고 승인이 완료되면 이메일이 발송됩니다.
- 해당 이메일에 DocSearch에 당신의 프로젝트를 등록할 수 있는 정보가 포함되어 있습니다.
- 이메일에 "Accept this invitation to get started!"라는 링크를 클릭하여 Algolia로 이동합니다.
- 초기 비밀번호를 설정하고 로그인합니다.

## 4. Connecting Algolia

- Docusaurus의 @docusaurus/preset-classic은 Algolia DocSearch 통합을 지원합니다.
- 클래식 프리셋을 사용하는 경우 추가 설치가 필요하지 않습니다.
- 이제 `docusaurus.config.js`에 Algolia DocSearch 설정을 추가합니다.

```javascript
export default {
  // ...
  themeConfig: {
    // ...
    algolia: {
      // The application ID provided by Algolia
      appId: 'YOUR_APP_ID',

      // Public API key: it is safe to commit it
      apiKey: 'YOUR_SEARCH_API_KEY',

      indexName: 'YOUR_INDEX_NAME',

      // Optional: see doc section below
      contextualSearch: true,

      // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
      externalUrlRegex: 'external\\.com|domain\\.com',

      // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
      replaceSearchResultPathname: {
        from: '/docs/', // or as RegExp: /\/docs\//
        to: '/',
      },

      // Optional: Algolia search parameters
      searchParameters: {},

      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',

      // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
      insights: false,

      //... other Algolia params
    },
  },
};
```

- 위와 같이 `docusaurus.config.js`에 Algolia 설정을 추가하면 검색이 가능해집니다.
- 위 설정 정보는 이메일에 포함된 정보를 통해 확인할 수 있습니다.