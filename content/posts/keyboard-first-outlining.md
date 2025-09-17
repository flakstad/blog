---
date: 2025-09-01T10:00:00+02:00
draft: false
params:
    author: Andreas Flakstad
title: "Keyboard-First Outlining"
---

For as long as I’ve had to manage projects, I’ve disliked the tools built for
the job. Notion, Asana, Trello, Jira, ..all powerful, but also bloated,
complicated, and designed around the mouse. Basecamp is a nice breath of fresh
air with it's relative simplicity and focus on communication, but still falls
short of the fluid keyboard-driven workflow I’ve always wanted.

Meanwhile, I kept coming back to my old favorite: Emacs org-mode. Org has
everything I love: hierarchical outlines, flexible todos, notes, deadlines, and
lightning-fast keyboard navigation. The problem is, it’s not built for teams.
Nobody else can easily see your progress. You end up either isolated in your org
files or forced back into the big, bloated tools.

What I really want is simple: the speed and focus of org-mode combined with the
visibility and integration of a web app. None of the existing tools strike this
balance, so I’ve started building my own. The long-term vision is a complete
project management tool shaped by these principles, but the first step is
modest: an outline component for the web, inspired by org-mode.

<!--more-->

Here’s what it looks like:

{{< clarity-outline-simple >}}

The component is designed for keyboard-first interaction.
- Move focus through the outline with the arrow keys, or with Emacs
  (`Ctrl+F/B/N/P`) or Vi (`H/J/K/L`)
  bindings.
- Move items around in the structure using the same keys but while holding the `Alt` modifier.
- Collapse and expand items that have sub-items with `Alt+T`.
- Add new todos with `Alt+Enter`.
- Cycle through item status with `Shift+←/→`.

When an item is focused, actions can be done with a single key press: `E` to
edit, `S` to change status, `P` to mark priority, `A` to assign, etc. Mouse
users aren't left out: hover actions expose the same controls with shortcut
hints, and items can be reordered with drag and drop.

You won’t see rich task descriptions, comment threads or file uploads here; I think those belong on dedicated item pages. This component is the fast, structured backbone you can plug into bigger systems.

The outline takes JSON as input and emits events for every interaction. My plan is to drive it with [Datastar](https://data-star.dev/) with the server pushing live updates, but it can slot into any context.

My aim is to bring the clarity of org-mode into team-friendly web tools without sacrificing speed or simplicity. Maybe an agenda view or capture templates are up next?

[Source code](https://github.com/flakstad/clarity-outline)
