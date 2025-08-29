import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    background: 'background.ts',
    content: 'content.ts',
    popup: 'popup.tsx'
  },
  format: ['iife'],
  target: 'chrome58',
  outDir: 'dist',
  clean: true,
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV !== 'production',
  splitting: false,
  treeshake: true,
  platform: 'browser',
  globalName: {
    background: 'BookAIMarkBackground',
    content: 'BookAIMarkContent',
    popup: 'BookAIMarkPopup'
  },
  banner: {
    js: '/* BookAIMark AI Extension - Enhanced with AI features */'
  },
  esbuildOptions(options) {
    options.drop = process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [];
  }
}); 