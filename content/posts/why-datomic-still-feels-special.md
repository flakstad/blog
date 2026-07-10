---
date: 2026-07-10T10:00:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Why Datomic Still Feels Special"
---

Idea note.

This should be a personal Datomic appreciation post, not a recap of Magnar
Sveen's talk and not a full FC/IS explainer.

The central point is still database values. `d/db` gives the middle of the
program an immutable database value that can be passed around like ordinary
data. That is the part that feels most magical, especially when writing in a
Functional Core / Imperative Shell style: the shell can own the connection and
the writes, while the core can receive a stable snapshot and make decisions from
it.

Use real HeiKari examples if this becomes a full post. Good candidates:

- `kari.feature-flags/feature-enabled?`, which receives `db` and answers a
  small product question
- `kari.core.account-dashboard-view/get-account-phone-numbers`, which receives
  `db` and account id
- a planner that returns `[:db/safe-transact {...}]` as data for the shell to
  execute
- `resources/schema.edn`, where adding product state is often adding another
  attribute as the service develops

The post should probably start from a concrete HeiKari situation, not from the
architecture pattern. Something like: a request or form submit needs to answer a
small question about an account before deciding what to do. I want that question
to live in an ordinary function, not hidden inside a handler, repository, or
transaction session.

Supporting points:

- Flexible facts/schema are the second strongest reason this model feels good.
  HeiKari keeps gaining attributes as the service changes: phone numbers,
  booking settings, feature flags, call transfer rules, voice settings,
  transcripts, summaries, follow-up state, and similar product data.
- Datalog is the third reason. It lets the code ask for the facts that must be
  true, which often matches the domain question better than starting from table
  joins.
- Time/history is cool and important to Datomic, but it should not dominate
  this post because I have not leaned on it heavily in HeiKari yet.

Keep the code examples real but few. One small `d/q` example and maybe one
effect/transaction-data example is probably enough. If the post needs more FC/IS
detail, that belongs in the separate `how-i-do-fcis-in-heikari.md` note.

Possible ending:

- Datomic is still special because it lets the database participate in the
  value-oriented middle of the program, instead of only existing as an effect at
  the edge.
- Link to Magnar Sveen's "11 insights after 11 years with the functional
  database Datomic" as the deeper Datomic talk to watch.
- Link to Gary Bernhardt's FC/IS reference and Magnar Sveen / Christian
  Johansen's Norwegian "En arkitektur på vranga" talk as FC/IS background.

Reference input from Magnar's talk, not a structure to copy:

1. Datomic is fundamentally different from SQL: entity, attribute, value,
   transaction/facts rather than tables first.
2. Datomic can model square data, sparse data, graphs, mixed data, and the
   complexities of the world.
3. Datomic is a database of facts that never change.
4. Datomic keeps track of time for attributes, instead of every table needing
   its own `createdAt` / `updatedAt` style columns.
5. Datomic keeps historic data for attributes and entities, with `as-of` and
   history-oriented views.
6. You can query the database as it was at a given point in time.
7. Queries do not disrupt other services in the same way, because of Datomic's
   split between clients, transactor/server, and storage.
8. Datalog is surprisingly expressive.
9. The `T` in `EAVT` is transaction, not time.
10. Transactions can be expressed with plain old data.
11. User data deserves the same care we give source code; the Git-versus-folder
    analogy is good background for that point.

Use these as calibration only. The actual post should remain my own view:
database values first, flexible facts/schema second, Datalog third, with time
and history acknowledged but not overemphasized.

Open questions for the actual post:

- Which HeiKari example is concrete enough without becoming internal
  documentation?
- Should the title stay broad, or become something like "A Database Value for
  the Functional Core"?
- Should this post be published before or after the dedicated HeiKari FC/IS
  post?
