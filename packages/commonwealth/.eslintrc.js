const path = require('path');

module.exports = {
  settings: {
    'import/resolver': {
      webpack: {
        config: path.resolve(__dirname, 'webpack/webpack.base.config.js'),
      },
    },
    'react': {
      'version': 'detect',
    }
  },
  plugins: ['@tanstack/query'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/ban-types': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-cycle': 'off',
    'import/named': 'off',
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'no-console': 0,
    'camelcase': 0,
    'no-else-return': 0,
    'no-unused-vars': 0,
    'no-unused-expressions': 0,
    'class-methods-use-this': 0,
    'import/newline-after-import': 0,
    'import/no-named-default': 0,
    'prefer-destructuring': 0,
    'comma-dangle': 0,
    'array-bracket-spacing': 0,
    'no-plusplus': 0,
    'consistent-return': 0,
    'object-curly-newline': 0,
    'nonblock-statement-body-position': 0,
    'no-extraneous-dependencies': 0,
    'curly': 0,
    'no-nested-ternary': 0,
    'import/first': 0,
    'import/no-extraneous-dependencies': 0,
    'arrow-body-style': 0,
    'key-spacing': 0,
    'quote-props': 0,
    'no-alert': 0,
    'no-undef': 0,
    'no-confusing-arrow': 0,
    'one-var-declaration-per-line': 0,
    'one-var': 0,
    'lines-between-class-members': 0,
    'max-classes-per-file': ['error', 5],
    'max-len': [
      1,
      {
        code: 120,
        tabWidth: 2,
      },
    ],
    'no-constant-condition': [
      'error',
      {
        checkLoops: false,
      },
    ],
    'no-restricted-syntax': 0,
    'no-trailing-spaces': ['error'],
    'no-useless-constructor': 0,
    'no-empty-function': 0,
    'import/prefer-default-export': 0,
    'dot-notation': 0,
    'no-lonely-if': 0,
    'no-multi-spaces': 0,
    'no-await-in-loop': 0,
    'no-async-promise-executor': 0,
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 0,
    'prettier/prettier': 0,
    '@typescript-eslint/no-empty-interface': [
      'error',
      {
        allowSingleExtends: true,
      },
    ],
    '@tanstack/query/exhaustive-deps': 'error',
    '@tanstack/query/prefer-query-object-syntax': 'error',
    'react/destructuring-assignment': [1, 'always'],
    'react/function-component-definition': [1, { "namedComponents": "arrow-function" }],
    'react/no-multi-comp': [1, { "ignoreStateless": false }],
    'react/jsx-curly-brace-presence': [1, { props: "never", children: "never" }],
    '@typescript-eslint/no-unused-vars': 1,
    'react/jsx-key': 1
  },
  ignorePatterns: ['server/scripts/setupPrerenderService.ts'],
  extends: [
    'plugin:@tanstack/eslint-plugin-query/recommended',
    "plugin:react-hooks/recommended",
    "plugin:react/recommended"
  ],
}
