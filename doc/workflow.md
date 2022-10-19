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
start the Node/Express server. When I make a change to the client or the server, I simply run the `npm run dev` script
to see if my change works and play around with Rosetta. When I'm done, I stop the script. Rinse and repeat.

Some people might find this a cumbersome process, but I find it helps me catch bugs. It's also dead simple. It also
gives me a mental break while the script runs. Sometimes I use that time to stretch and relax a bit, and sometimes I use
that time to review my notes. (I like to handwrite notes prior to writing code.)

### Integrating Changes

I recommend following the vanilla GitHub development process.

1. Fork Rosetta to your personal GitHub account.
2. Create a branch on your personal GitHub account.
3. Once you're satisfied with your work, and you're sure it's passing lint and tests, submit a pull request and merge
   your branch into Rosetta's main branch, which as of this writing is still (unfortunately) named master. If you think
   it's necessary, you can request a PR review, but keep in mind that Rosetta is not PhET's biggest fish to fry, so your
   PR might not get reviewed in a timely fashion. For most PR's, passing lint and tests (automated and manual) is
   sufficient.

I like to follow this process because it keeps the `phetsims/rosetta` repository "clean". That is, all the dirty work
happens in your forked repository. It also provides you with the somewhat contrived opportunity to review your own code
before merging your PR.