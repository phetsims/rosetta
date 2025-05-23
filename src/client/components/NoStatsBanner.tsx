// Copyright 2023, University of Colorado Boulder

/**
 * A banner that is displayed when translation stats are unavailable.
 * See https://github.com/phetsims/rosetta/issues/410#issuecomment-1563781403
 * for more info.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { ReactElement } from 'react';

const NoStatsBanner = (): ReactElement => {
  return (
    <div className='alert alert-warning' role='alert'>
      Translation stats are unavailable right now. You can
      still translate sims by clicking the link to the sim
      in the table below.
    </div>
  );
};

export default NoStatsBanner;