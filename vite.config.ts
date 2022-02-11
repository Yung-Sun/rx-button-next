import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    cssCodeSplit: true,
    lib: {
      entry: path.resolve(__dirname, 'src/components/index.ts'),
      name: 'rx-button-next',
      formats:['umd'],
      fileName: (format) => `rx-button-next.${format}.js`
    }
  }
})
