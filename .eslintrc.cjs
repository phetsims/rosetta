module.exports = {
  "env": {
    "browser": true,
    "node": true
  },
  "extends": [
    "plugin:react/recommended",
    "../chipper/eslint/sim_eslintrc.js",
    "../chipper/eslint/node_eslintrc.js",
    "../chipper/eslint/format_eslintrc.js"
  ],
  "ignorePatterns": [
    "static/*"
  ],
  "parser": "@babel/eslint-parser",
  "parserOptions": {
    "babelOptions": {
      "presets": [
        "@babel/preset-react"
      ]
    },
    "requireConfigFile": false
  },
  "rules": {
    "bad-text": "off",
    "jsx-quotes": [
      "error",
      "prefer-single"
    ],
    "require-statement-match": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
};