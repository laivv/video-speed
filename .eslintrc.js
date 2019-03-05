module.exports = {
  "parser": "babel-eslint",
  root: true,
  parserOptions: {
      sourceType: 'module',
      // ecmaFeatures: {
      //   "jsx": true
      // }
  },
  env: {
      browser: true,
  },
  extends: "standard",
  plugins: [
    'html'
  ],
  rules: {
      "indent": [1, 2],
      "quotes": [1, "single"],
      "semi": [1, "never"],
      "no-console": 1,
      "arrow-parens": 0
  }
}
