---
date: 2026-03-20T21:30:00+01:00
draft: true
params:
    author: Andreas Flakstad
title: "Kimen"
---

I built Kimen because I kept running into config setups that felt too
complicated.

The app would read config from one place, secrets from another, defaults from a
third, and then merge all of it at runtime. That usually meant more code inside
the app just to figure out how it should start.

I wanted something simpler: one command that prepares the environment for the
app before the app starts.

That command should know about the profile, the secrets, and the config. The
app should not care where those values came from. It should just read env vars
or files and start.

That is what Kimen is.

It is a local tool that stores secrets in an encrypted vault and projects them
into runtime only when I ask for it. The CLI and runtime live in
[kimen](https://github.com/flakstad/kimen), and the separate site/docs work
lives in [kimen-site](https://github.com/flakstad/kimen-site).

<!--more-->

## What Kimen Is

Secrets stay in the vault. Profiles in the repo describe what a runtime needs.
Then Kimen prepares the runtime shape for one command.

That can mean starting a process with env vars:

```bash
kimen run --env SERVICE_API_TOKEN=demo_service_api_token -- ./your-command
```

Or rendering an envfile for a deploy script or supervisor:

```bash
kimen envfile --env SERVICE_API_TOKEN=demo_service_api_token --out .env.runtime
```

Or running with a checked-in profile:

```bash
kimen run --profile some-profile -- ./your-command
```

The setup happens before startup. The app does not need its own secret loading
system.

## Why I Built It

I did not want applications to keep growing more environment-specific logic.

I wanted the config and secret decisions to happen outside the app, in one
place, before launch. The app can then run the same way in dev, prod, a REPL,
or a deploy script.

The application code stays simpler. It reads env vars or files.

The runtime contract is visible. The profile can live in the repo without
containing the secret values themselves. So I can see what a runtime needs
without teaching the application how to fetch it.

I also wanted to avoid long-lived shell exports and hand-managed `.env` files.
The values should be prepared for the command I am running, not left lying
around in the shell.

## How I Use It Today

For deploys, I use Kimen to render envfiles ahead of time.

For Kari, I keep checked-in profiles for the app runtime, the backup job, and
local development. The deploy flow renders the envfiles locally and uploads
them to the VPS:

```bash
scripts/kimen/render-envfiles.sh
```

That means Kari's VPS only receives rendered envfiles such as
`/etc/kari/kari-app.env` and `/etc/kari/datomic-backup.env`. Linje follows the
same shape. Its deploy script renders `linje.env` into a temporary directory
locally and uploads it to the VPS.

For Kari locally, I also use Kimen to start the REPL:

```bash
./scripts/repl.sh
```

That script runs the REPL through `kimen run --profile kari-dev -- clojure ...`
and prints the nREPL endpoint. Then I use `cider-connect-clj` from Emacs and
connect to that endpoint.

More generally, this is how I run programs that need secrets and config:

```bash
kimen run --profile some-profile -- ./your-command
```
