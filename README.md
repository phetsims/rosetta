# Rosetta

Rosetta is a tool for translating PhET simulations. It is built using the MERN tech stack: MongoDB, Express, React,
and Node.

## Quick Start

```shell
# get the code, go to the code, and install dependencies
git clone git@github.com:phetsims/rosetta.git
cd rosetta
npm install

# add git hooks using husky
npm run pre

# compile/bundle react frontend using babel/webpack and serve static files for development
npm run dev

# compile/bundle react frontend using babel/webpack and serve static files for production
npm run pro
```