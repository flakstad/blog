---
date: 2026-06-10T12:00:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: ""
---

1. Start With The Caveat
     Odin builds quickly. For many programs, stop/build/run is enough. Hot reload is mainly valuable
     when runtime state is expensive to recreate manually.

  2. Name The Inspiration
     Mention Karl Zylinski’s Odin/Raylib hot reload template and the Clojure/Lisp habit of working
     inside a running program.

  3. Introduce Olive
     Olive is a small live-development tool for Odin. Its main feature is a generic hot reload
     workflow for ordinary Odin programs: keep one root state value alive while rebuilding and
     reloading the code that operates on it. The production program stays normal; Olive adds a
     development-mode adapter.

  4. Where Hot Reload Pays Off
     Games, simulations, and UI/editor tools where you have navigated or evolved the program into a
     specific state that you do not want to recreate after every code change.

  5. Where It Is Usually Overkill
     Small CLIs, pure libraries, batch jobs, tests, and server-side code where important state
     should generally live outside the process.

  6. The Core Split
     Resident host owns durable in-process state. Reloadable module owns behavior. Generated adapter
     connects them. One root state value survives reloads.

  7. What The User Writes
     Root state type, init, run, optional on_load / on_unload, and reload.conf.

  8. What Olive Generates
     Host/module Odin files, exported symbols, dynamic library loading, state size/alignment checks,
     and why root state layout changes require restart.

  9. The Workflow
     olive run keeps the host alive. olive watch rebuilds the reloadable module. Edit code, reload
     behavior, keep the current game/simulation/UI state.

  10. Secondary Tooling
     Mention scratch eval and saved temp values briefly as side experiments around REPL-like
     workflows, not the main value.

  11. Closing Thesis
     Olive is not about making Odin dynamic. It is about preserving hard-won interactive state while
     continuing to write ordinary Odin.
