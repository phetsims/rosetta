// Copyright 2024, University of Colorado Boulder

/**
 * ESLint configuration for rosetta.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import browserEslintConfig from '../perennial-alias/js/eslint/config/browser.eslint.config.mjs';
import nodeEslintConfig from '../perennial-alias/js/eslint/config/node.eslint.config.mjs';

export default [
  ...nodeEslintConfig,
  ...browserEslintConfig,
  {
    rules: {
      'phet/bad-sim-text': 'off',
      'require-atomic-updates': [
        'error',
        { allowProperties: true }
      ],
      'phet/default-import-match-filename': 'off',

      // This rule doesn't apply to Rosetta.
      // See https://github.com/phetsims/phet-core/issues/100 for paper trail.
      'phet/default-export-class-should-register-namespace': 'off',

      '@typescript-eslint/consistent-indexed-object-style': 'off',

      'phet/no-object-spread-on-non-literals': 'off',

      // It isn't clear that rosetta wants to use perennial's node modules via npm-dependencies/. If this isn't true,
      // please see https://github.com/phetsims/perennial/issues/372 and fix in rosetta.
      'no-restricted-imports': 'off',

      'no-void': 'off',

      // Rosetta imports a lot of css and svg files
      'phet/import-statement-extension': 'off',
      'jsx-quotes': [
        'error',
        'prefer-single'
      ],
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off'
    }
  }, {
    // Separate block so that we globally ignore this
    ignores: [
      'static/*',
      'src/client/dist/**/*'
    ]
  }
];