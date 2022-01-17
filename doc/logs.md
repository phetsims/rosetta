# Logging

On the server, we like to log

* when we enter a function,
* when the function does something important, and
* when the function finishes or returns.

This way, when we look at the logs we can see when a function is called, what it does, what other functions it calls,
and when it finishes or returns. The idea behind this is to make debugging easier.

On the client, we *do not* use `console` in production.

We try to keep logs lowercase to reduce fatigue when reading logs. We also try to keep punctuation in logs to a minimum
for the same reason.

```js
import logger from './logger.js';

logger.info( 'logs are all lowercase' );
logger.info( 'logs not full sentences' );
logger.info( 'logs eschew punctuation' );

for ( let i = 0; i < 1000; i++ ) {
  logger.verbose( 'if a log is going to be called in a loop, consider using the verbose logging level' );
}
```