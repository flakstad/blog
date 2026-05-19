---
date: 2026-05-19T14:35:00+02:00
draft: false
params:
    author: Andreas Flakstad
title: "Shhh, Don't Put Secrets in the Repo"
---

Let's talk about app config and secrets.

Every web app needs a port, URLs, feature flags, API keys, OAuth secrets, maybe
a service account JSON file, maybe a certificate and key.

Some values come from environment variables. Some come from local files. Some
are defaults. Some are fetched from a secret manager. Some need to be written as
files because the library using them expects a path.

The common answer I've been exposed to is to make the app orchestrate all of
this. Add a config library and teach it where to look.

Well, that works, but now startup has its own rules. Does the env var override the
file? Does the local profile override the default? Does the cloud secret replace
the local one? To understand how the program starts, I have to understand the
precedence rules inside the app.

<!--more-->

Local development often adds another problem. Developers are expected to keep
secret files around, remember to not check them in, add them to `.gitignore`.
While `.gitignore` prevents accidental commits, it does not prevent local tools
from reading the file. And that certainly matters if you play with AI agents.
When an agent examines the project, ignored files are of course still local
files it can read. If the secret is sitting in the working tree, the agent can
see it.

So is there a better way? Well, here's one way I came up with. Some secret
managers can do parts of this, but they are usually focused on fetching secrets
at runtime and require internet access. I wanted something small and dedicated,
that works offline, and solves problems in my local workflows. So, the source
code repo should describe what config and secrets it needs, but the repo should
not contain any secret values. The app should not need to know how to load secrets
from five different places. And reading secrets should not require internet
access.

Introducing [Kimen](https://github.com/flakstad/kimen), a local-first secrets tool. It is
basically a small vault plus a projection step.

The vault stores your secrets. The projection step turns vault keys into the
environment variables and files a process expects, just before that process
starts.

Let's start with one secret which we'll call `prod.database_url`:

```bash
kimen secret set prod.database_url
```

That call prompts for you to type out the secret safely in the terminal, without putting it in shell history,
an env var, or a text file on disk.

Then later we project that secret into the environment of your program:

```bash
kimen run --env DATABASE_URL=prod.database_url -- ./your-app
```

The app sees `DATABASE_URL` like any other environment variable. It does not
call Kimen or know about the vault.

If we have many secrets to project a good approach is to add a profile to the
repo; a small config file with placeholders for secrets. The left side of the
following is what the app will see. The right side is what Kimen will retrieve
from the vault.

So let's create a file in the repo at `.kimen/profiles/prod.kmap`:

```text
env DATABASE_URL=prod.database_url
env SERVICE_API_TOKEN=prod.service_api_token
env PORT=const:5050
file credentials.json=prod.gcp_credentials_json
envpath GOOGLE_APPLICATION_CREDENTIALS=credentials.json
```

`file` here renders a secret to a runtime file. `envpath` sets an environment
variable to the path of that rendered file. `const:5050` is the syntax for
declaring a config constant in the profile that should not be replaced by a
secret value.

The names on the right in the profile are not secret values. They are keys in
the vault. This profile can be checked in safely because it only describes the runtime
shape.

Then, when I start the program, Kimen hydrates that profile for this one run:

```bash
kimen run --profile prod -- ./your-app
```

Kimen resolves `prod` to the `prod.kmap` file, reads the mappings, fetches the
referenced vault values, sets `DATABASE_URL`, `SERVICE_API_TOKEN`, and `PORT`,
renders `credentials.json` into a temporary runtime directory, and sets
`GOOGLE_APPLICATION_CREDENTIALS` to that file path.

The app still does not call Kimen. It just reads from the standard environment.

For deploys to my VPS services, I use the same profiles to render envfiles before uploading them to
the server. Kimen runs locally; the server only receives the rendered envfiles.
This can also be done in a CI pipeline.

For local development, I typically use a dev profile to start the REPL:

```bash
kimen run --profile dev -- clojure ...
```

Each invocation of `kimen` that accesses the vault requires a passphrase. If I
plan to run several of these within a short timeframe it can be nice to unlock
the vault only once:

```bash
kimen session start --ttl 15m
```

That gives trusted same-user tools a bounded window to use the vault without
asking for the passphrase again. Then I can lock it when I am done, or let the
timeframe expire:

```bash
kimen session lock
```

The important boundary is still before the app starts, not inside the app.

Source code: [github.com/flakstad/kimen](https://github.com/flakstad/kimen)
