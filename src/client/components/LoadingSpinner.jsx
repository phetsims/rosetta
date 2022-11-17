// Copyright 2022, University of Colorado Boulder

/**
 * Create a loading spinner.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/**
 * This component displays a loading "spinner" (a little circle that loops, indicating something is loading).
 *
 * @returns {JSX.Element}
 */
const LoadingSpinner = () => {
  return (
    <div className='spinner-border text-primary' role='status'>
      <span className='visually-hidden'>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;