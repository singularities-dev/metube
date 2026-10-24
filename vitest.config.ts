import { defineConfig } from 'vitest/config';

// Tests cover the pure core in src/lib; the UI is checked by hand and by type checks.
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/*.test.ts', 'src/lib/i18n/messages/**'],
      reporter: ['text-summary', 'json-summary', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
});
