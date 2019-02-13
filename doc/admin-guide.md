Administration Guide for the PhET Translation Utility
-----------------------------------------------------

Note: This isn't very complete at this time, but it seemed important to have a place where some information is kept that
would enable PhET developers to administer this utility.

Restart:
```sudo systemctl restart rosetta```

Stop:
```sudo systemctl stop rosetta```

To Disable (i.e. put up the "down for maintenance" type page):
As of 2/13/2019, this is in flux, but the way to do it is edit the ENABLED flag in the version of rosetta.js that is
running on phet-sever (see the comment in the file), then restart rosetta using the command above.



