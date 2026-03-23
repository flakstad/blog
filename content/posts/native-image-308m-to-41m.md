---
date: 2026-02-20T15:00:00+01:00
draft: false
params:
    author: Andreas Flakstad
title: "From 308MB to 41MB: shrinking a GraalVM native image"
---

A short, practical recipe for getting smaller Clojure native binaries with
GraalVM `native-image`. Prompted by ongoing work building `Ro`, a local-first work system
with web, CLI and TUI interfaces.

These are the biggest levers I found doing this work initially. There are many
other config flags and approaches to take to bring this down further, and I will
likely explore them more as the project matures.

Baseline observation building a native image of the project on macOS:

```bash
ls -lh ~/.local/bin/ro
# -rwxr-xr-x ... 308M ... ~/.local/bin/ro
```

Goal: reduce size without breaking runtime behavior.

<!--more-->

## 1) Find out what is big

On macOS, check Mach-O section sizes. In my case, the binary was dominated by:

- `__DATA,__svm_heap` (~280 MiB)

That points to **frozen image heap content**, not just debug symbols or static linking.

Quick helpers:

```bash
# macOS: section breakdown (look for __svm_heap)
size -m ~/.local/bin/ro | rg -n "__svm_heap|__TEXT|__DATA" || true

# Linux: section breakdown 
# (look for .svm_heap / svm_heap depending on toolchain)
readelf -S ./ro | rg -n "svm_heap|\\.text|\\.data" || true
```

## 2) Treat broad resource inclusion as suspect #1

The biggest win came from removing a “just include everything” resource rule:

- Bad default? (copied from examples): `-H:IncludeResources=.*`

Replacing it with a targeted regex dropped the binary from ~308 MiB to ~55 MiB immediately, at the cost of **missing web assets** until I tightened the pattern.

My rule of thumb now:

- If you have `IncludeResources=.*`, assume your binary is bloated until proven otherwise.

## 3) Change one thing at a time

I kept a tiny matrix per variant:

- file size
- `__svm_heap` / `.svm_heap`
- smoke tests that match real usage (not just “it starts”)

For `ro` the smokes were:

- CLI: `--help`, a “real command” that exercises JSON formatting, etc.
- Web: load the UI and verify `/assets/*` returns 200 (not 404)

Example table (abbreviated):

| Variant | Size | `__svm_heap` | Outcome |
|---|---|---:|---:|
| Baseline (`IncludeResources=.*`, no `-Os`) | 307.71 MiB | 280.38 MiB | Works |
| Remove `IncludeResources=.*` only | 54.85 MiB | 29.50 MiB | CLI works, web assets 404 |
| `-Os` + lean flags, no broad resources | 40.51 MiB | 26.88 MiB | CLI works, web assets 404 |
| `-Os` + targeted resources (final) | **41.01 MiB** | **27.37 MiB** | Works |

## 4) Add the “cheap” size flags

These helped slightly

- `-Os` (optimize for size)
- avoid “kitchen sink” flags unless you know why you need them (for me, `--enable-all-security-services` was just noise)

## 5) Use a targeted `IncludeResources` regex

My final resource allowlist (yours will differ, and should be driven by your smoke tests):

```text
(app\\.css|theme_mode\\.js|datastar\\.js(\\.map)?|keyboard\\.js|keyboard/.*|fonts/.*|themes/.*)
```

The important thing is the approach:

1. Start with “too small” (no broad include).
2. Run your web/CLI smokes.
3. Add only the assets you actually need.

## Summary: my initial recipe

1. Inspect section composition first (`__svm_heap` / `.svm_heap`).
2. Remove `-H:IncludeResources=.*` (or similar) as early as possible.
3. Add back resources with a targeted regex, driven by smoke tests.
4. Add `-Os` and remove unused “big hammer” flags.
5. Track changes in a tiny table so you can reproduce the outcome later.
