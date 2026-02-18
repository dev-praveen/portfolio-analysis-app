import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Enforce explicit return types on exported functions
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      // Disallow any
      '@typescript-eslint/no-explicit-any': 'error',
      // Require await in async functions
      '@typescript-eslint/require-await': 'error',
      // Enforce consistent type imports
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      // Disallow floating promises
      '@typescript-eslint/no-floating-promises': 'error',
      // No unused vars
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Ignore build output and config files themselves
    ignores: ['dist/**', 'node_modules/**'],
  },
);
