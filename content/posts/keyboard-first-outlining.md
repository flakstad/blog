---
date: 2025-09-01T10:00:00+02:00
draft: false
params:
    author: Andreas Flakstad
title: "Keyboard-First Outlining"
---

For as long as I’ve had to manage projects, I’ve disliked the tools built for the job.
Notion, Asana, Trello, Jira, ..all powerful, but also bloated, complicated, and designed around the mouse. Basecamp is a nice breath of fresh air with it's relative simplicity and focus on communication, but still falls short of the fluid keyboard-driven workflow I’ve always wanted.

Meanwhile, I kept coming back to my old favorite: Emacs org-mode.
Org has everything I love: hierarchical outlines, flexible todos, notes, deadlines, and lightning-fast keyboard navigation. The problem is, it’s not built for teams. Nobody else can easily see your progress. You end up either isolated in your org files or forced back into the big, bloated tools.

What I really want is simple: the speed and focus of org-mode combined with the visibility and integration of a web app. None of the existing tools get this balance right, so I’ve started building my own. The long-term vision is a full project management tool shaped by these principles, but the first step is small: an outline component for the web, inspired by org-mode.

<!--more-->

Here’s what it looks like:

{{< clarity-outline-simple >}}

The component is designed for keyboard-first interaction. You can fly through your tasks with arrows, use `Alt+arrow` to indent or outdent, and `Alt+Tab` to collapse or expand. Add new items with `Alt+Enter` to quickly expand your outline. Cycle through todo states with `Shift+left/right` arrows. When an item is focused, actions can be done with a single key press: **E** to edit, **S** to change status, **P** to mark priority, **A** to assign, etc. Mouse users aren’t left out: hover actions expose the same controls with shortcut hints. You won’t see rich task descriptions, comment threads or file uploads here; I think those belong on dedicated item pages. This component is the fast, structured backbone you can plug into bigger systems.

The outline takes JSON as input and emits events for every interaction. My plan is to drive it with [Datastar](https://data-star.dev/) with the server pushing live updates, but it can slot into any context.

My aim is to bring the clarity of org-mode into team-friendly web tools without sacrificing speed or simplicity. Maybe an agenda view or capture templates are up next?

[Source code](https://github.com/flakstad/clarity-outline)
