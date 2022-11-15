# Workflow

This document describes my (Liam Mulhall) workflow in the hopes that future maintainers understand why things are the
way they are.

## IDE and Formatting

I use the JetBrains WebStorm IDE with the PhET code style (`/phet-info/ide/idea/phet-idea-codestyle.xml`)
to work on Rosetta. Students can get any JetBrains IDE for free using their CU credentials. PhET employees can get
IntelliJ Idea and WebStorm, but I'm not sure whether they can get the other JetBrains IDE's.

Adhering to PhET's code style is a must. The best way to do that is to use a JetBrains IDE with the PhET code style
mentioned above. I would recommend using WebStorm instead of IntelliJ Idea because WebStorm is meant for JavaScript
development whereas IntelliJ Idea is meant for Java development.

## Local Development

I've set the `start` script to lint and transpile/bundle React code using Vite, and then start the Node/Express server.
When I make a change to the client or the server, I simply run the `start` script (`npm run start` or `npm start`) to
see if my change works and play around with Rosetta. When I'm done, I stop the script. Rinse and repeat.