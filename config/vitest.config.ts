import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['../backend/tests/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next']
  },
  resolve: {
    alias: {
      '@': '../frontend',
      '@/components': '../frontend/components',
      '@/lib': '../frontend/lib',
      '@/hooks': '../frontend/hooks',
      '@/utils': '../backend/utils',
      '@/types': '../backend/types'
    }
  }
}) 