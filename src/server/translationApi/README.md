# `translationApi`

This directory contains modules for serving JSON data that the React frontend
consumes. The API endpoint routes are defined in `translationApi.js` and the
API endpoint functions are defined in the `api` subdirectory.

This directory also contains other subdirectories. These subdirectories contain
modules that are features on top of the base functionality of Rosetta. Ideally,
we could maintain Rosetta so that the base functionality (the modules in the
root directory of `translationApi`) is independent of the functionality in the
subdirectories. That is, we should be able to blow away any of the
subdirectories, and the base functionality of Rosetta should still work.