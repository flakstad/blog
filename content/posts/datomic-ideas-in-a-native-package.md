---
date: 2026-06-26T14:00:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Datomic Ideas in a Native Package"
---

I keep coming back to one idea from Datomic: the database is a value.

Datomic is a database from the Clojure world. It has a lot of interesting parts,
but this is the one that really sticks with me. You ask a connection for a
database snapshot, and that snapshot does not change under your feet. You can
pass it to a function, query it, keep it around, compare it with another
snapshot, and generally treat it like ordinary data.

Writes still happen, of course. But they happen through explicit transactions.
Reads happen against stable database values.

<!--more-->

That changes the shape of application code.

Most databases are used as ambient mutable state. A function needs some data, so
it reaches through a connection, a repository, an ORM session, a transaction
context, or some other handle. Suddenly the function depends on when it runs and
what the outside world looks like at that moment.

Datomic gives you something else to pass around: a stable view of the database.

The database-as-value idea is the part I like most, but it works because the
rest of the model points in the same direction.

The data model is made of facts. An entity has an attribute with a value. Over
time you add and retract facts instead of pretending the old state never
existed. That makes history feel much less bolted on. The transaction is also a
real thing in the system, so you can attach context to it. Who did this? Which
request caused it? Was it a user action, an import, a migration?

Datomic also uses Datalog as its query language. I wish more people got to use
Datalog in normal application code. It is a good fit for data that has
relationships, which is almost all interesting application data. Instead of
starting from tables and manually assembling joins, you describe the facts that
must be true.

A query can move through the graph of facts from whichever point is convenient.
It still needs indexes and a planner and all the ordinary database machinery
underneath, but as an interface for asking questions, Datalog is pleasantly
direct.

So application code can look like this:

```clojure
(defn visible-projects [db user-id]
  (d/q '[:find ?project
         :in $ ?user
         :where
         [?membership :membership/user ?user]
         [?membership :membership/project ?project]]
       db
       user-id))
```

That function does not own a connection. It does not transact. It does not know
where the database is hosted. It just receives a snapshot and returns an answer.

That is the part that fits Functional Core / Imperative Shell so well. Keep the
messy edge of the program imperative: HTTP, files, queues, clocks, users,
commits. Keep the middle as much as possible as functions over values. A
database snapshot can be one of those values.

Pull is another part of the same feeling. Once a query finds the entity or
entities you care about, pull lets you describe the shape you want back. It is
not arbitrary object loading through an ORM. It is explicit data selection,
written as data.

That theme keeps showing up. Queries are data. Transactions are data. Pull
patterns are data. Database snapshots are values.

You can approximate this with other databases, but it usually takes extra
structure: repositories, unit-of-work objects, mocks, fixtures, containers, and a
lot of discipline. With Datomic, the good shape is closer to the default.

What I find strange is that this way of working is still so closely tied to
Clojure.

It makes sense historically. Clojure makes these ideas feel natural. DataScript
is another Clojure/ClojureScript project, and it takes many of the same ideas
and makes them available as an in-memory database. Datalevin is in the same
wider family, pushing embedded Datalog further with durable storage.

Those projects are important references. More than references, really. I do not
think I would even try this without the existing DataScript and Datalevin code
bases to study. They are open source implementations of hard-won ideas, and that
changes what is possible for a small experiment like this.

They also make me wonder what this programming model would look like if it were
packaged more like SQLite.

By that I mean: a small native library, embedded in the application, with a local
database file, no server required, and usable from more than one host language.
Not SQL, and not trying to be Datomic. Just borrowing the parts of the Datomic
model that make application code feel different.

That is why I am building Vev.

At this stage Vev is still very much an exploration. The question is whether a
native, embedded, Datomic-flavored Datalog database can keep the important shape
intact: facts, transactions, Datalog queries, pull-style reads, and above all
immutable database snapshots that can be passed around as values.

The first version is in-memory. That keeps the focus on semantics before storage:
what is a transaction, what does a query mean, what does a pull result look like,
what does it mean to hold a database snapshot?

For those questions I am looking closely at DataScript because its behavior is a
good practical reference for the Clojure-side programming model, and because the
implementation is there to learn from. I am also looking at Datalevin for
implementation guidance, especially around the path from an in-memory engine
toward something durable and embedded.

If the idea holds up, durability can come later. SQLite is the obvious first
thing to try, not because Vev should become SQL-shaped, but because it has the
right adoption properties: local, portable, inspectable, easy to ship.

I do not know yet how far this should go. Right now I mostly want to see if the
core feeling can survive in a small native package: Datalog, facts, transactions,
pull, and a database you can pass around like a value.
