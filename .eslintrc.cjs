require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-airbnb-with-typescript',
    '@vue/eslint-config-prettier',
  ],
  rules: {
    'import/extensions': 0,
    'vue/html-button-has-type': [
      'error',
      {
        button: true,
        submit: true,
        reset: true,
      },
    ],
  },
};
