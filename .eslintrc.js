module.exports = {
  root: true,
  parserOptions: {
    "parser": "babel-eslint",
    "sourceType": 'module'
  },
  parser: "vue-eslint-parser",
  env: {
    "browser": true,
    "node": true,
    "es6": true
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  plugins: [
    'vue',
    'prettier'
  ],
  "rules": {
    "no-console": 0
  }
}