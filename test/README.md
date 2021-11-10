# `tests`

As of this writing, the only tests in this directory are tests for the API functions. The API functions are the crux of
Rosetta. They take the data gathered and packaged up on the backend and make it available to the frontend. If one of the
API functions fails, it's likely that Rosetta will fail altogether.

If your API function is `foo.js`, please name the test file `foo.test.js`.