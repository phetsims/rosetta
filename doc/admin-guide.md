Administration Guide for the PhET Translation Utility
-----------------------------------------------------

Note: This isn't very complete at this time, but it seemed important to have a place where some information is kept that
would enable PhET developers to administer this utility.

Background
==========
Rosetta, also known as the translation utility, is a node server that runs on phet-server.  As of this writing, the code
on phet-server is kept in the directory /data/share/phet/rosetta, and git is used to pull updates.  When an update is
pulled, the rosetta process needs to be restarted before the change will take effect (see below).

Starting and Stopping
=====================

Restart:
```sudo systemctl restart rosetta```

Stop:
```sudo systemctl stop rosetta```

To Disable (i.e. put up the "down for maintenance" type page):
As of 2/13/2019, this is in flux, but the way to do it is edit the ENABLED flag in the version of rosetta.js that is
running on phet-sever (see the comment in the file), then restart rosetta using the command above.



