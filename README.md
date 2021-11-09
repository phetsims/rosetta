# Rosetta

Rosetta is a tool for translating PhET simulations. It is built using the MERN tech stack: MongoDB, ExpressJS, React,
and NodeJS.

## Quick Start

```shell
# get the code, go to the code, and install dependencies
git clone git@github.com:phetsims/rosetta.git
cd rosetta
npm install

# add git hooks using husky
npm run pre

# bundle/compile react frontend using webpack/babel and serve static files for development
npm run dev

# bundle/compile react frontend using webpack/babel and serve static files for production
npm run pro
```