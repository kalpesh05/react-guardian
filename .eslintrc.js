module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-undef': 'off', // TypeScript handles this
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};
