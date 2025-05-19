// Copyright 2024, University of Colorado Boulder

/**
 * ESLint configuration for rosetta client code.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import browserEslintConfig from '../../../perennial-alias/js/eslint/config/browser.eslint.config.mjs';
import reactPlugin from '../../../perennial-alias/node_modules/eslint-plugin-react/index.js';

export default [
  reactPlugin.configs.flat.recommended,
  ...browserEslintConfig,
  {
    rules: {
      'jsx-quotes': [
        'error',
        'prefer-single'
      ],
      'phet/default-import-match-filename': 'off',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      'phet/import-statement-extension': 'off',

      // It isn't clear that rosetta wants to use perennial's node modules via npm-dependencies/. If this isn't true,
      // please see https://github.com/phetsims/perennial/issues/372 and fix in rosetta.
      'no-restricted-imports': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }, {
    // Separate block so that we globally ignore this
    ignores: [
      'dist/**/*'
    ]
  }
];