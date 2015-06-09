# rosetta
UI and serve-side support for translating PhET HTML5 simulations

This code is based on Node.js, ExpressJS, and the doT templating engine.

# setup for local testing

Create a postgres database called "rosetta"

```createdb rosetta```

Create a table in the rosetta database with the following SQL command:

```sql
CREATE TABLE saved_translations (
    user_id bigint,
    stringkey varchar(255),
    repository varchar(255),
    locale varchar(8),
    stringvalue varchar(255) NOT NULL,
    timestamp timestamp NOT NULL,
    PRIMARY KEY (user_id, stringkey, repository, locale)
);
```
