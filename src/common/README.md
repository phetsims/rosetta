# `common`

This directory contains modules used in both the frontend/client and the
backend/server.

## Config Files

As of this writing, there are two config files in this directory:
`publicConfig.js` and `privateConfig.js`. `publicConfig.js` is a file built†
from a subset of the "real" config, i.e. the `~/.phet/rosetta-config.json`
file. The values contained in `publicConfig.js` are those needed by the
client-side code, some of which are needed more-or-less immediately upon
starting the app. (Otherwise, we'd need to show a loading screen for a second
or two.) Some values in the object exported by the `privateConfig.js` are
secrets we don't want to import in client-side code. `privateConfig.js` just
reads the `~/.phet/rosetta-config.json` file, parses the JSON, and exports the
resultant object.

† The `publicConfig.js` file is built using the `make-public-config-file.mjs`
script located in the `scripts` directory. This is the first thing that runs
when we `npm start`.