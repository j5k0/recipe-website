import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import customRules from './eslint-rules/lowercase-filenames.js';

export default [
{
    files: ['src/**/*.ts'],
    languageOptions: {
        parser: tsParser,
        parserOptions: {
            project: './tsconfig.json',
            tsconfigRootDir: import.meta.dirname,
        },
    },
    plugins: {
        '@typescript-eslint': tseslint,
        'custom': { rules: { 'lowercase-filenames': customRules } },
    },
    rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-redeclare': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/require-await': 'error',
        '@typescript-eslint/return-await': 'error',
        '@typescript-eslint/promise-function-async': 'error',
        '@typescript-eslint/no-useless-empty-export': 'warn',
        '@typescript-eslint/no-useless-default-assignment': 'warn',
        '@typescript-eslint/no-use-before-define': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-meaningless-void-operator': 'warn',
        '@typescript-eslint/no-loss-of-precision': 'warn',
        '@typescript-eslint/no-loop-func': 'error',
        '@typescript-eslint/no-extraneous-class': 'warn',
        '@typescript-eslint/no-empty-function': 'warn',
        '@typescript-eslint/no-dupe-class-members': 'warn',
        '@typescript-eslint/naming-convention': 'warn',
        'custom/lowercase-filenames': 'warn',
    },
},
];
