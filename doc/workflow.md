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

I've configured WebStorm to format the file when I save. If you like Vim keybindings, JetBrains maintains a Vim plugin
for their IDE's called IdeaVim. You can source your Vim configuration in your IdeaVim configuration if you want to.
IdeaVim supports some Vim plugins like easymotion and NERDTree.

## Development

I try to keep my development process as simple as possible.

### Local Development and Testing

I've set the `npm run dev` script to lint and compile/bundle React code using Vite, and then
start the Node/Express server. When I make a change to the client or the server, I simply run the `start` script
(`npm run start` or `npm start`) to see if my change works and play around with Rosetta. When I'm done, I stop the
script. Rinse and repeat.