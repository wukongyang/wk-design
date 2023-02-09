import { defineConfig } from 'dumi'
import path from 'path'
const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  outputPath: 'docs-dist',
  history: {
    type: 'hash',
  },
  favicons: ['https://wukongyang.github.io/wk-design/logo.svg'],
  themeConfig: {
    name: 'wk-design',
    nav: [
      { title: '介绍', link: '/guide' },
      { title: '组件', link: '/components/Button' },
    ],
    footer: 'Copyright © 2023 | Powered by wukongyang',
  },
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
  cssMinifier: 'esbuild',
  logo: 'https://wukongyang.github.io/wk-design/logo.svg',
  base: '/',
  // @ts-ignore
  exportStatic: false,
  publicPath: isDev ? '/' : 'https://wukongyang.github.io/wk-design/',
  styles: [
    `.dumi-default-features-item {
      text-align: center;
    }
    body .dumi-default-sidebar>dl>dt {
      font-size: 16px;
    }
    body .dumi-default-sidebar>dl>dd>a {
      color: #717484;
      font-size: 14px;
    }
    `,
  ],
  define: { 'process.env.APP': process.env.APP },
})
