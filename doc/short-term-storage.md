# Short-Term Storage

What is short-term storage? It's a database where unfinished translations are stored. A translator might be working on a
translation and decide to save it for later when they have more time to finish it. The idea is that we store the
translation and then when they log back in we grab the translation from the database and present it to them, so they can
finish their translation.

It's dubious whether many translators use this feature or understand its purpose. A translator could easily submit an
unfinished translation and the behavior of Rosetta would probably[1] be the same.

[1] See "Possible Edge Case".

## Possible Edge Case

One possible edge case for saving a translation is:

* A user saves a translation with a set of string keys $S$.
* A new version of a simulation is published with a set of string keys $S'$ where $S' \neq S$.
* When the user logs back in, their saved translation with string keys $S$ is presented to them.
* The user finishes their translation with string keys $S$ and submits it to long-term storage thinking they've translated
  every string in the sim.
* Since $S' \neq S$, the user has not translated every string in the sim.

This edge case is probably rare enough to ignore. Adding code to prevent this from happening would be a lot of work, and
thus probably not worth it ([YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it)). However, it's good to
keep this edge case in mind.

## Setting Up MongoDB for Local Development

1. Install MongoDB. I suggest googling "how to install MongoDB on <your operating system\>". As of this writing,
   MongoDB has nice docs for how to install the Community Edition of MongoDB on Linux, macOS, and Windows. Ensure you 
   have a version of MongoDB that is compatible with the version running on the production server. (Details of the 
   installation are omitted because they will likely change.)
2. Once you have MongoDB installed, you need to run MongoDB. If you are following the official docs for installing the
   Community Edition of MongoDB, you should be able to find the official docs for how to run MongoDB. (As of this
   writing, the docs for how to run MongoDB are right beneath the docs for installing MongoDB.) If you are using a
   Unix-based operating system (i.e. Linux or macOS) and your computer uses `systemd`, you should be able to issue the
   command `sudo systemctl start mongod` (`mongod` is not a typo; it's _not_ supposed to be `mongodb`) to start MongoDB.
   To verify that it's running issue `sudo systemctl status mongod`.
3. Now that MongoDB is installed and running, we need to use the MongoDB shell `mongosh` to set up our database.
    1. Issue the command `mongosh` to enter the MongoDB shell and note the URI for the database. It will probably look
       something like `mongodb://127.0.0.1:27017/<some other stuff>`. If you don't have this URI set in
       `rosetta-config.env`, set it now. It should be `DB_URI=mongodb://127.0.0.1:27017` (without the trailing slash).
    2. Now we want to create a database and a collection (analogous to a table). To do so, you'll need to
       have `DB_NAME=rosetta`
       and `DB_SHORT_TERM_STORAGE_COLLECTION_NAME=shortTermTranslationStorage` set in
       `rosetta-config.env`. When you run Rosetta locally and save a translation, the `rosetta` database will be
       created, the short-term storage collection will be created and the translation will be stored in that collection.
       Open a new terminal window, run Rosetta locally, and save a translation. Alternatively, you could create a
       database using `mongosh`, by issuing `use rosetta`, but this doesn't create the database until you've stored data
       in it. You'd have to insert a document into the database
       using `db.<your collection name here>.insert({name: "Ada Lovelace", age: 205})` to ensure the database is
       created. This also creates the collection that you specify.
    3. To ensure the `rosetta` database was created successfully, issue `show databases`. You should see the `rosetta`
       database. To ensure the `shortTermTranslationStorage` collection was created successfully, issue `use rosetta` to
       switch to the `rosetta` database and issue `show collections`. You should see the `shortTermTranslationStorage`
       collection. If step 2 didn't work, ensure your key-value pairs in `rosetta-config.env` are correct. To ensure the
       translation was stored successfully, issue `db.shortTermTranslationStorage.find({userId: 123456})` to find all
       documents where the `userId` field is 123456, the `userId` given to the user if Rosetta is being run on
       localhost. If this command spits out a translation, congratulations are in order because you've successfully
       installed and set up MongoDB.

## Behavior of the Save Button

As of this writing, the save button overwrites any existing translations in the database with the same `userId`,
`simName`, and `locale`, so only one translation of sim/locale can be stored for a given user.