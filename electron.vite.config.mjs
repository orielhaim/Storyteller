import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import i18nextLoader from 'vite-plugin-i18next-loader'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()] 
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
    tailwindcss(),
    i18nextLoader({
      paths: ['./src/renderer/src/locales'],
      namespaceResolution: 'basename'
    })]
  }
})