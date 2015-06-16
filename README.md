# rosetta
UI and serve-side support for translating PhET HTML5 simulations

This code is based on Node.js, ExpressJS, and the doT templating engine.

### setup for local testing

Create a postgres database called "rosetta"

```createdb rosetta```

Create a table in the rosetta database and add a sql function used in the rosetta code:

```psql rosetta -f init.sql```

If defaults do not work, you will need to add a different pgConnectionString in config.json
