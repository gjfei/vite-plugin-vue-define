
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
export default  defineConfig({
  build: {
    lib: {
      entry: 'index.ts',
      formats: ['cjs', 'es'],
      fileName: (format) => `[name].${format}.js`,
    },
  },
  optimizeDeps: {
    exclude: ['vite'],
  },
  plugins: [dts()]
});
