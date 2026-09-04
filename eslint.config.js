import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', 'public/mockServiceWorker.js'] },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // unused-imports gives auto-fixable removal; disable the base rule it replaces.
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/require-await': 'error',

      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*'],
              message: 'Use the "@/" path alias instead of deep relative imports.',
            },
          ],
        },
      ],
    },
  },

  /**
   * The assessment runner is a separate surface and stays one.
   *
   * A child sitting an assessment holds a sitting session, not a teacher's JWT,
   * and must never receive an answer key. The teacher surface legitimately
   * carries `is_correct` — the question bank returns it, authoring sends it, and
   * the review screen renders it — so the guarantee cannot be "no schema in the
   * app has answers". It has to be "the runner cannot reach those schemas".
   *
   * Omitting the field is not enough on its own: an `.omit()` someone later
   * deletes fails silently. This rule fails loudly instead, at lint time and in
   * CI, and the runner keeps its own longhand schemas.
   */
  {
    files: ['src/features/runner/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*'],
              message: 'Use the "@/" path alias instead of deep relative imports.',
            },
            {
              group: ['@/features/teacher/*', '@/features/teacher/**'],
              message:
                'The runner must not import teacher modules: their schemas carry answer keys (is_correct). Write the runner shape longhand instead.',
            },
            {
              group: ['@/features/school-admin/*', '@/features/school-admin/**'],
              message: 'The runner must not import school management modules.',
            },
            {
              group: ['@/lib/auth/token-store', '@/lib/api/client'],
              message:
                'The runner authenticates with X-Sitting-Session, not a JWT. Use @/lib/api/runner-client and @/lib/api/sitting-store.',
            },
          ],
        },
      ],
    },
  },

  // Tests may be looser than app code.
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'no-console': 'off',
    },
  },

  // Config files run in Node and are outside the app tsconfig project.
  {
    files: ['*.config.{js,ts}', 'commitlint.config.js'],
    languageOptions: { globals: globals.node },
    extends: [tseslint.configs.disableTypeChecked],
  },

  prettier,
);
