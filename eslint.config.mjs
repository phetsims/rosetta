// Copyright 2024, University of Colorado Boulder

/**
 * ESLint configuration for rosetta.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import nodeEslintConfig from '../perennial-alias/js/eslint/config/node.eslint.config.mjs';

export default [
  ...nodeEslintConfig,
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

      // It isn't clear that rosetta wants to use perennial's node modules via npm-dependencies/. If this isn't true,
      // please see https://github.com/phetsims/perennial/issues/372 and fix in rosetta.
      'no-restricted-imports': 'off',

      // Rosetta imports a lot of css and svg files
      'phet/import-statement-extension': 'off'
    }
  }, {
    // Separate block so that we globally ignore this
    ignores: [
      'static/*'
    ]
  }
];