// @ts-check
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['coverage/', 'node_modules/', '.wrangler/', '.scannerwork/'] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: { parserOptions: { projectService: true } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      // Named exports only (owner rule).
      'no-restricted-syntax': [
        'error',
        { selector: 'ExportDefaultDeclaration', message: 'Use named exports only.' },
      ],
    },
  },
  {
    files: ['*.config.mjs', '*.config.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['*.config.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
