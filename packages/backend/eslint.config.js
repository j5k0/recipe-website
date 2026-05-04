// packages/backend/eslint.config.js
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import customRules from './eslint-rules/lowercase-filenames.js';

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
        '@typescript-eslint': tseslint,
        'custom': { rules: { 'lowercase-filenames': customRules } },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'custom/lowercase-filenames': 'warn',
    },
  },
];
