# Rosetta
UI and server-side support for translating PhET HTML5 simulations

This code is based on Node.js, ExpressJS, and the doT templating engine.

### Starting and stopping rosetta on simian and figaro

To start:
```sudo /etc/init.d/rosetta start```

To stop:
```sudo /etc/init.d/rosetta stop```

### Setup for local testing

Create a postgres database called "rosetta"

```createdb rosetta```

Create a table in the rosetta database and add a sql function used in the rosetta code:

```psql rosetta -f init.sql```

If defaults do not work, you will need to add a different pgConnectionString in build-local.json
