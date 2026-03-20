---
date: 2026-03-20T21:30:00+01:00
draft: true
params:
    author: Andreas Flakstad
title: "How I Use Kimen for Kari and Linje"
---

I built Kimen because I wanted something very specific: a local-first way to
store secrets and project them into runtime only when I explicitly asked for
it.

That is now how I run two of my own systems as well: Kari and Linje.

Kari is the bigger, more operationally messy system. It has app runtime config,
backup jobs, REPL workflows, deploy scripts, and more than one environment
shape. Linje is smaller, but still has the same core problem: secrets,
configuration, and deploy-time projection need to be explicit and repeatable.

The interesting part is that neither application knows anything about Kimen.
They both stay boring. They read env vars or envfiles. Kimen lives outside the
app and handles the last-mile projection.

<!--more-->

That separation is the whole point for me.

If an app can simply read `System/getenv`, I can keep the application config
model straightforward. I do not need a secret-management layer inside the app,
I do not need long-lived shell exports, and I do not need to keep passing
around `.env` files by hand.

## The Basic Model

In both repos I check in Kimen profile maps. The maps describe intent: which
runtime names exist, which values are secrets, which values are constants, and
which profile should be used for which task.

For Linje, the main production profile is:

- `.kimen/profiles/linje-prod-app.kmap`

For Kari, I use more than one profile:

- `.kimen/profiles/kari-prod-app.kmap`
- `.kimen/profiles/kari-prod-backup.kmap`
- `.kimen/profiles/kari-dev.kmap`

That has turned out to be the sweet spot.

The profile files are safe to commit because they describe mappings, not
secret values. The vault stays local. The repos only contain the contract.

## Linje: One App Profile, One Render Path

Linje uses a straightforward render step:

```bash
scripts/kimen/render-envfiles.sh
```

That script does three things before writing the envfile:

1. `kimen map lint --profile linje-prod-app --strict`
2. `kimen doctor --profile linje-prod-app || true`
3. `kimen envfile --profile linje-prod-app --out .kimen/generated/linje.env`

That is exactly the kind of flow I wanted Kimen to support. The profile is
checked in. Validation is part of the script. The rendered envfile gets
generated locally with mode `600`.

Deploy uses the same model, but with one important improvement: Linje does not
need a permanent local plaintext envfile just because I am deploying.

The deploy helper renders into a temporary directory and uploads the result to
`/tmp/linje.env` on the VPS before the rest of the deploy runs. So the deploy
path is still explicit, but it does not encourage me to keep a loose envfile
around on disk for no reason.

I also added a bootstrap path in `scripts/kimen/bootstrap-vault-from-vps.sh`.
That script is useful when migrating an existing server into the Kimen model:
pull current env material from the VPS once, import it into the local vault,
then switch future rendering over to the checked-in profile map.

## Kari: Same Idea, More Surfaces

Kari is where the approach became more convincing to me, because it is not just
"render an envfile and deploy."

Kari has:

- app runtime env
- backup-job env
- local dev/repl workflows
- deploy-time scenario checks

I still use the same basic Kimen model.

The render script writes two envfiles from two different profiles:

```bash
scripts/kimen/render-envfiles.sh
```

That produces:

- `.kimen/generated/kari-app.env`
- `.kimen/generated/datomic-backup.env`

The part I especially like is that these different runtime shapes are explicit
in the profile names. I do not have one giant, fuzzy bucket of secrets. I have
profiles that correspond to concrete runtime uses.

Kari also uses Kimen for local developer workflows, not only for deploys.

The REPL launcher is a good example. `scripts/repl.sh` runs:

```bash
kimen run --profile "$PROFILE" -- clojure ...
```

That means I can start a REPL with the right environment for `kari-dev`
without first exporting a pile of variables into my shell session. The secret
projection lasts for that command invocation. The application process gets what
it needs; my shell does not become the secret store.

That is a small thing, but in practice it matters. It removes a lot of ambient
state.

## Why This Has Worked Well For Me

The biggest benefit is that the application boundary stays clean.

Kari and Linje are not coupled to Kimen APIs. They are coupled to runtime
inputs: env vars and files. That means the apps remain easy to understand and
easy to run in other contexts if I ever need to.

The second benefit is that configuration intent is reviewable.

When I change a `.kmap` file, I am changing the runtime contract in plain text.
That is much easier to reason about than ad hoc shell snippets, old deploy
notes, or a collection of hand-maintained `.env` files sitting in random
places.

The third benefit is that local and remote flows line up.

The same Kimen profiles drive:

- local render for inspection
- deploy-time envfile generation
- REPL launches
- migration/bootstrap scripts

That consistency has saved me from a lot of "works in one script, drifts in
another" problems.

## What I Do Not Expect Kimen To Solve

Kimen narrows the exposure window. It does not eliminate runtime trust.

Once Kari or Linje starts, the process still has access to the secrets it needs.
That is unavoidable. Kimen is not magic. It does not replace OS hardening,
machine access control, or careful application design.

It also is not trying to be a big central secrets platform with a web console
and a control plane. That is deliberate. My use case here is closer to:

- keep the vault local
- make projection explicit
- keep application code simple
- keep deploy/repl automation honest

That is enough for these systems.

## The Main Design Principle I Keep Coming Back To

I want the apps to stay boring and the runtime edge to stay explicit.

Kari and Linje should not contain a maze of secret-loading logic. They should
read the configuration they are given and do their job.

Kimen lets me keep it that way.

The vault is local. The profile maps are in the repo. The projection happens
only when I ask for it. And the operational scripts stay readable because the
secret-handling step is no longer hidden in shell state or scattered manual
steps.

That is the real reason I use Kimen for both projects: it makes the systems
simpler, not more elaborate.
