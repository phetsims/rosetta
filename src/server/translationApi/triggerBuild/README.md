# `requestTriggerBuild`

## Background/Context

There have been times when a need has arisen to build (or rebuild) a simulation for a non-English locale. While one
might be tempted to do this via the normal translation interface by making and submitting a small change and then
reverting it and submitting again, this will unfortunately cause the submitter to be listed on the website as one of the
credited translators for that simulation. Issue https://github.com/phetsims/perennial/issues/178 describes a scenario
where the need to trigger builds without being credited arose. To fill this need, a route was added through which a PhET
team member can trigger a build of a simulation for a given locale. There are three parameters for this route: the sim
name, the locale, and the user ID that should be credited. The user ID can be obtained by looking in babel for the user
ID of the most recent translator.

## Instructions (Hard Way)

1. If necessary, edit the phetsims/babel file for the translation as needed. Commit directly to master.
2. Make sure the instance of Rosetta that you plan to use has the flag for sending build requests in its config file
   set to true.
3. Obtain the user ID you wish to use from phetsims/babel.
4. Create and enter your URL in a web browser (you will be asked to sign in if you aren't already). Use the following
   URL pattern:
   ```
   https://ox-dev.colorado.edu/translate/api/requestTriggerBuild/{sim-name}/{locale code}/{translator ID}
   ```
   Example: 
   ```
   https://phet.colorado.edu/translate/api/requestTriggerBuild/circuit-construction-kit-ac/fa/333624
   ```
5. Check Rosetta's logs and the build server's logs as desired. These log files are located on 
   phet-server2/phet-server-dev and will require SSH to view.
6. Make sure your build went through successfully and the translation is published to the website. (This should take
   about five minutes.)

## Instructions (Slightly Easier Way)

1. Follow steps 1-3 in the "Hard Way" instructions.
2. Go to the Rosetta admin page.
3. Enter the sim name, user ID, and locale code in the form on the admin page.
4. Click the button to rebuild the sim.
5. Follow steps 5 and 6 in the "Hard Way" instructions.