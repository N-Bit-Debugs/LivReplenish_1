// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Base JavaScript configuration
  js.configs.recommended,
  
  // TypeScript configuration
  ...tseslint.configs.recommended,
  
  // Global configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // React specific rules
      'react/react-in-jsx-scope': 'off', // Next.js doesn't require React imports
      'react/prop-types': 'off', // We use TypeScript for prop validation
      
      // General JavaScript/TypeScript rules
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // Code quality rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      
      // Import/Export rules
      'no-duplicate-imports': 'error',
    },
  },
  
  // Next.js specific configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Next.js optimizations
      '@next/next/no-img-element': 'error',
      '@next/next/no-html-link-for-pages': 'error',
    },
  },
  
  // Configuration files
  {
    files: ['*.config.{js,ts}', '*.config.*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  
  // Test files configuration
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
    },
  },
  
  // Ignore patterns
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'dist/**',
      '*.min.js',
      'coverage/**',
      '.env*',
    ],
  },
];