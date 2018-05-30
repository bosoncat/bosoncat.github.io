// .vuepress/config.js
//

module.exports = {
  title: 'Higuoxing',
  description: '',
  markdown: {
    config: md => {
      md.use(require('markdown-it-katex'));
    }
  },
  ga: 'UA-111257861-1',
  themeConfig: {
    nav: [
      { text: '$Home', link: '/' },
      { text: '/bλogs', link: '/blogs/' },
      { text: '/ideas', link: '/ideas/' },
      { text: '/links', link: '/links/' }
    ],
    search: false,
  }
}
