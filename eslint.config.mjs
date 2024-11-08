// Copyright 2024, University of Colorado Boulder

/**
 * ESLint configuration for rosetta.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { getBrowserConfiguration } from '../perennial-alias/js/eslint/config/browser.eslint.config.mjs';
import rootEslintConfig from '../perennial-alias/js/eslint/config/root.eslint.config.mjs';
import getNodeConfiguration from '../perennial-alias/js/eslint/config/util/getNodeConfiguration.mjs';
import reactPlugin from '../perennial-alias/node_modules/eslint-plugin-react/index.js';

const browserFiles = [
  'src/client/**/*'
];

export default [
  reactPlugin.configs.flat.recommended,
  ...rootEslintConfig,
  ...getNodeConfiguration( {
    files: [ '**/*' ],
    ignores: browserFiles
  } ),
  ...getBrowserConfiguration( {
    files: browserFiles
  } ),
  {
    rules: {
      'phet/bad-sim-text': 'off',
      'jsx-quotes': [
        'error',
        'prefer-single'
      ],
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
    // Separate block so that we globally ignore this
    ignores: [
      'static/*',
      'src/client/dist/**/*'
    ]
  }
];