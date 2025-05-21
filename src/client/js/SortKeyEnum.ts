// Copyright 2022, University of Colorado Boulder

/**
 * Export a sort key enum. These sort keys are arrays. The first item in the array is the
 * primary sort key, and the subsequent values are "fallback" sort keys. You can think of
 * them as "tie-breaker" sort keys.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

const SortKeyEnum = {
  SIM_TITLE: [ 'simTitle' ],
  TOTAL_STRINGS: [ 'percentTotal', 'totalStrings' ],
  SIM_SPECIFIC_PERCENT: [ 'percentSimSpecific', 'numSimSpecificStrings' ],
  COMMON_PERCENT: [ 'percentCommon', 'numCommonStrings' ],
  SHARED_PERCENT: [ 'percentShared', 'numSharedStrings' ]
};

Object.freeze( SortKeyEnum );

export default SortKeyEnum;