/** @type {import('jest').Config} */
module.exports = {
  // Use multiple projects for monorepo testing
  projects: [
    {
      displayName: 'web-app',
      testMatch: ['<rootDir>/apps/web/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/apps/web/$1',
        '^@bookaimark/(.*)$': '<rootDir>/packages/$1/src',
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      collectCoverageFrom: [
        'apps/web/**/*.{js,jsx,ts,tsx}',
        '!apps/web/**/*.d.ts',
        '!apps/web/.next/**',
        '!apps/web/coverage/**',
        '!apps/web/node_modules/**',
      ],
    },
    {
      displayName: 'packages',
      testMatch: ['<rootDir>/packages/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapping: {
        '^@bookaimark/(.*)$': '<rootDir>/packages/$1/src',
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      collectCoverageFrom: [
        'packages/**/*.{js,jsx,ts,tsx}',
        '!packages/**/*.d.ts',
        '!packages/**/node_modules/**',
      ],
    },
    {
      displayName: 'features',
      testMatch: ['<rootDir>/features/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/apps/web/$1',
        '^@bookaimark/(.*)$': '<rootDir>/packages/$1/src',
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      collectCoverageFrom: [
        'features/**/*.{js,jsx,ts,tsx}',
        '!features/**/*.d.ts',
        '!features/**/node_modules/**',
      ],
    },
    {
      displayName: 'backend',
      testMatch: ['<rootDir>/backend/**/*.{test,spec}.{js,ts}'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|ts)$': 'babel-jest',
      },
      collectCoverageFrom: [
        'backend/**/*.{js,ts}',
        '!backend/**/*.d.ts',
        '!backend/node_modules/**',
      ],
    },
  ],
  
  // Global configuration
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Verbose output
  verbose: true,
  
  // Collect coverage from all files
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  
  // Global setup and teardown
  globalSetup: '<rootDir>/jest.global-setup.js',
  globalTeardown: '<rootDir>/jest.global-teardown.js',
} 