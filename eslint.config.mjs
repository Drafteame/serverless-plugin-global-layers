import { configs, plugins } from 'eslint-config-airbnb-extended';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['node_modules/', 'build/', 'coverage/'],
  },
  plugins.stylistic,
  plugins.importX,
  ...configs.base.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // airbnb-extended defaults assume CJS (extensions: 'never', noUselessIndex: true).
      // ESM requires explicit file extensions on relative imports.
      'import-x/extensions': ['error', 'ignorePackages'],
      'import-x/no-useless-path-segments': ['error', { noUselessIndex: false }],
    },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        before: 'readonly',
        after: 'readonly',
      },
    },
  },
  {
    files: ['mocks/**/*.js'],
    rules: {
      'class-methods-use-this': 'off',
    },
  },
  prettierConfig,
];
