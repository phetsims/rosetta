// Copyright 2024, University of Colorado Boulder

/**
 * ESlint configuration for rosetta.
 *
 * TODO: JB: Review rosetta configuration and test linting, see https://github.com/phetsims/chipper/issues/1451
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import reactPlugin from 'eslint-plugin-react';
import nodeEslintConfig from '../chipper/eslint/node.eslint.config.mjs';
import globals from '../chipper/node_modules/globals/index.js';

export default [
  reactPlugin.configs.flat.recommended,
  ...nodeEslintConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      'phet/bad-sim-text': 'off',
      'jsx-quotes': [
        'error',
        'prefer-single'
      ],
      'phet/require-statement-match': 'off',
      'require-atomic-updates': [
        'error',
        { allowProperties: true }
      ],
      'phet/default-import-match-filename': 'off',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',

      // This rule doesn't apply to Rosetta.
      // See https://github.com/phetsims/phet-core/issues/100 for paper trail.
      'phet/default-export-class-should-register-namespace': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }, {
    ignores: [
      'static/*'
    ]
  }
];