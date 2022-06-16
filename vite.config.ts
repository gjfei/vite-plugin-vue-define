
import { defineConfig } from 'vite'
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
});
