import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    passWithNoTests: true,
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000'
    }
  }
})
