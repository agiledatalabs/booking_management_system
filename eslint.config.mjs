import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    ignores: [
      '**/*.mock.ts',
      '**/node_modules',
      '**/.github',
      '**/.idea',
      '**/.eslintrc-tmp.js',
      '**/dist',
      '**/*.json',
      '**/*.yml',
      '**/*.html',
      '**/graph.serviceuser.postgres.repository.service.ts',
      '**/migrations',
    ],
    languageOptions: { globals: { ...globals.node, ...globals.es5 } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      'no-undef': 'error',
      eqeqeq: 'off',
      'no-unused-expressions': 'error',
    },
  },
];
