// Copyright 2022, University of Colorado Boulder

module.exports = {
  env: {
    browser: true,
    node: true
  },
  extends: [
    'plugin:react/recommended',
    '../chipper/eslint/sim_eslintrc.js',
    '../chipper/eslint/node_eslintrc.js',
    '../chipper/eslint/format_eslintrc.js'
  ],
  ignorePatterns: [
    'static/*'
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    babelOptions: {
      presets: [
        '@babel/preset-react'
      ]
    },
    requireConfigFile: false
  },
  rules: {
    'bad-sim-text': 'off',
    'jsx-quotes': [
      'error',
      'prefer-single'
    ],
    'require-statement-match': 'off',
    'require-atomic-updates': [
      'error',
      { allowProperties: true }
    ],
    'default-import-match-filename': 'off',
    'react/no-unescaped-entities': 'off',
    'react/prop-types': 'off',

    // This rule doesn't apply to Rosetta.
    // See https://github.com/phetsims/phet-core/issues/100 for paper trail.
    'default-export-class-should-register-namespace': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};