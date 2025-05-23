// Copyright 2022, University of Colorado Boulder

/**
 * Create a loading spinner.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { ReactElement } from 'react';

/**
 * This component displays a loading "spinner" (a little circle that loops, indicating something is loading).
 */
const LoadingSpinner = (): ReactElement => {
  return (
    <div className='spinner-border text-primary' role='status'>
      <span className='visually-hidden'>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;