module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 6,
    ecmaFeatures: {
      impliedStrict: true,
    },
    sourceType: 'module',
  },
  ignorePatterns: ['.eslintrc.js'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended'
  ],
  plugins: [
    '@typescript-eslint',
    'jest'
  ],
  env: {
    node:true,
    'jest/globals': true,
    jest: true
  },
  rules: {
    // eslint
    'consistent-return': ['warn'],
    curly: ['warn', 'all'],
    indent: ['warn', 2],
    'linebreak-style': ['warn', 'unix'],
    'no-async-promise-executor': ['warn'],
    'no-await-in-loop': ['warn'],
    'no-constructor-return': ['warn'],
    'no-global-assign': ['warn'],
    'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
    'no-param-reassign': ['warn'],
    'no-promise-executor-return': ['warn'],
    'no-return-await': ['warn'],
    'no-var': ['warn'],
    'no-undef': ['warn'],
    'no-useless-return': ['warn'],
    quotes: ['warn', 'single'],
    'require-await': ['warn'],
    'require-atomic-updates': ['warn'],
    semi: ['warn', 'always'],
    // typescript
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-unsafe-assignment': ['off'],
    '@typescript-eslint/explicit-function-return-type': ['warn'],
    '@typescript-eslint/no-floating-promises': ['warn', { ignoreVoid: false }],
    '@typescript-eslint/no-misused-promises': ['warn'],
    '@typescript-eslint/no-unnecessary-condition': ['warn'],
    '@typescript-eslint/no-unnecessary-type-constraint': ['warn'],
    '@typescript-eslint/no-unsafe-return': ['warn'],
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/no-use-before-define': ['warn'],
    '@typescript-eslint/strict-boolean-expressions': ['warn'],
  },
};
