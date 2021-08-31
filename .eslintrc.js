module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    // 'plugin:vue/vue3-recommended',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    // The build toolchain isn't detecting custom interfaces
    'no-undef': 'off',

    // Fix issue with enums
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],

    // Allow private class variables to start with an underscore
    'no-underscore-dangle': ['error', { allowAfterThis: true }],

    // Allow import statements to be on a single line or multiple lines
    'object-curly-newline': ['error', { ImportDeclaration: { multiline: true } }],

    // Allow the name given to the default export to be the same as the file's name
    'import/no-named-as-default-member': 'off',

    // Not really a line length stickler- sometimes it's necessary, but keep it _somewhat_ manageable
    'max-len': ['error', {
      code: 120,
      ignoreComments: true,
      ignoreUrls: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
    }],

    // Keep vue templates legible
    'vue/html-self-closing': 'off',
    'vue/max-attributes-per-line': [
      'warn',
      {
        singleline: 3,
        multiline: {
          max: 1,
          allowFirstLine: false,
        },
      },
    ],

    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
