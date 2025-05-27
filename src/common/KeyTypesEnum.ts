// Copyright 2022, University of Colorado Boulder

/**
 * Export a string key type enum.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

const KeyTypesEnum: { [ key: string ]: 'simSpecific' | 'shared' | 'common' } = {
  SIM_SPECIFIC: 'simSpecific',
  SHARED: 'shared',
  COMMON: 'common'
};

Object.freeze( KeyTypesEnum );

export default KeyTypesEnum;