// .vuepress/config.js
//

module.exports = {
  title: '/dev/urandom',
  description: 'Generating everything ...',
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }]
  ],
  markdown: {
    config: md => {
      md.use(require('markdown-it-katex'));
    }
  },
  ga: 'UA-111257861-1',
  themeConfig: {
    nav: [
      { text: '$Home'   , link: '/' },
      { text: '/bλogs'  , link: '/blogs/' },
      { text: '/gallery', link: 'https://bl.ocks.org/Higuoxing' },
      { text: '/links'  , link: '/links/' }
    ],
    search: false,
  }
}
