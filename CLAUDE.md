# CLAUDE.md — Rosetta

Guidance for Claude Code when working in **rosetta**, PhET's simulation translation tool.

> **This is NOT a standard PhET sim repo.** The parent `../CLAUDE.md` (the monorepo file) is written for the
> TypeScript *sim* repos — its `./bin/check --fix` verification, the `phet-*` skills, and the sim
> model/view/PhET-iO conventions do **not** apply here. Follow this file and `doc/` instead. Rosetta is a
> standalone MERN app that happens to live under the monorepo root.

## What it is

A MERN tool (MongoDB, Express, React, Node) for translating PhET HTML5 sims. The server gathers/packages
translation data, exposes API endpoints, serves the built client, stores translations, and requests builds
(PhET's build server does the actual building). The client is a React UI with three pages: select-locale,
select-sim (the "translation report"), and the translation form.

- **Long-term storage** (published translations): the `phetsims/babel` GitHub repo.
- **Short-term storage** (saved/unfinished translations): MongoDB on phet-server2.
- **Translation report**: streams per-sim stats over SSE; constrained by the GitHub API rate limit; cached in
  memory until restart.

## Stack & layout

- **TypeScript + ESM** (`"type": "module"`). The server runs `.ts` directly via `../perennial-alias/bin/sage`.
- **NPM workspaces** — root `package.json` defines workspaces `src/client`, `src/server`, `scripts`.
  - `src/client/` — React frontend, bundled by **Vite** (workspace name `client`).
  - `src/server/` — Node/Express/Mongo backend, entry `src/server/app.ts` (workspace name `server`).
  - `src/common/` — code shared between client and server (plain directory, not a workspace).
- **Sibling dependency:** `../perennial-alias` (provides `sage` for running TS). Must exist at the monorepo root.

## Common commands

Run from the rosetta root unless noted.

```sh
npm start            # make client config -> lint -> type-check -> build client -> start server
npm run dev          # like start but with watch (concurrently runs client + nodemon server)
npm run lint         # grunt lint  (use this, NOT ../bin/check)
npm run type-check   # grunt type-check
npm run start-node   # start the server only (sage run src/server/app.ts)
npm run debug        # build client + start server with --inspect

# Workspace-scoped install / run:
npm i <pkg> -w client      # or -w server
npm run <script> -w client
```

**Verification after changes:** `npm run lint` and `npm run type-check`.

## Config

Runtime config lives at `~/.phet/rosetta-config.json` (copy `sampleConfig.json` as a starting point; some
secret fields must be obtained from other PhET devs). MongoDB setup for local dev is documented in
`doc/implementation-notes.md`.

## Conventions

- **One thing per file** (UNIX philosophy); prefer **one export per file**, named to match the file.
- **Export at the end of the file**, not inline at definitions.
- **Server logging:** log on entering a function, on important actions, and on return. Use the `logger`
  (winston), keep messages **lowercase**, minimal punctuation, not full sentences. Use the `verbose` level for
  logs inside loops.
- **Client:** do **not** use `console` in production code.
- Author attribution: `@author {{Name}} (PhET Interactive Simulations)`.

## More docs

- `doc/implementation-notes.md` — architecture, workspaces, MongoDB setup, conventions (authoritative).
- `doc/admin-guide.md` — running/administering the deployed service.
- `doc/release-process.md` — how releases are cut.
- `doc/how-to-change-a-string-key.md`, `doc/background.md`.
