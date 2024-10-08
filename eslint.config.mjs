// Copyright 2024, University of Colorado Boulder

/**
 * ESLint configuration for rosetta.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import nodeEslintConfig from '../chipper/eslint/node.eslint.config.mjs';
import reactPlugin from '../chipper/node_modules/eslint-plugin-react/index.js';
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