# Running Rosetta Remotely

## Rosetta's Configuration on Legacy Servers and PhET Server

Rosetta lives in /data/share/phet/rosetta. It's designed to work as a stand-alone repository.
Thus, it shouldn't need any other repositories cloned as siblings.

The user to run Rosetta is "phet-admin". It requires the certain fields filled out in
phet-admin's HOME/.phet/build-local.json (see the assertions in rosetta.js). These fields
should be filled out, but they may need to modified or updated.

The Rosetta uses syslog to save output to the Winston log. You can view the logs by typing
`sudo journalctl -u rosetta`. To tail the logs type `sudo journalctl -f -u rosetta`.

## Legacy Servers ("Simian" and "Figaro")

* Start: `sudo /etc/init.d/rosetta start`
* Stop: `sudo /etc/init.d/rosetta stop`
* Check if Rosetta is running (note the lack of sudo): `/etc/init.d/rosetta status`

## PhET Server

* Start: `sudo systemctl start rosetta`
* Stop: `sudo systemctl stop rosetta`
* Restart: `sudo systemctl restart rosetta`
* Check status (method 1): `sudo systemctl status rosetta`
* Check status (method 2): `sudo journalctl -u rosetta`