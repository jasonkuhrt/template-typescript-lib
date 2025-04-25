import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import onlyWarn from 'eslint-plugin-only-warn'
import tsdoc from 'eslint-plugin-tsdoc'
import tsEslint from 'typescript-eslint'

export default tsEslint.config(
  eslint.configs.recommended,
  stylistic.configs.recommended,
  tsEslint.configs.recommendedTypeChecked,
  tsEslint.configs.strictTypeChecked,
  tsEslint.configs.eslintRecommended,
  tsEslint.configs.stylisticTypeChecked,
  {
    ignores: ['build', 'eslint.config.js', '**/__snapshots__/**/*'],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      // https://github.com/microsoft/tsdoc/tree/master/eslint-plugin
      tsdoc: tsdoc,
      // This makes it so the IDE reports lint rejections as warnings only. This is
      // better than errors because most lint rejections are not runtime errors. This
      // allows IDE errors to be exclusive for e.g. static type errors which often are
      // reflective of real runtime errors.
      // https://github.com/bfanger/eslint-plugin-only-warn
      onlyWarn,
      '@stylistic': stylistic,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'warn',
      'tsdoc/syntax': 'warn',
      // TypeScript makes these safe & effective
      'no-case-declarations': 'off',
      // Same approach used by TypeScript noUnusedLocals
      '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      // Needed when working with .mts/.cts where a lone e.g. <T> is not allowed
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      // Useful for organizing Types
      '@typescript-eslint/no-namespace': 'off',
      // Turn training wheels off. When we want these we want these.
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': ['warn', { 'ts-expect-error': false }],
      // Disable dprint conflicts:
      '@stylistic/member-delimiter-style': 'off',
      '@stylistic/no-multi-spaces': 'off',
      '@stylistic/comma-spacing': 'off',
      '@stylistic/quotes': ['warn', 'backtick'],
    },
  },
)
