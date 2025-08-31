---
date: 2025-01-27T10:00:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Org-mode Style Outlines for the Web"
---

I've always been a fan of Emacs org-mode's powerful outline functionality. My favorite features - hierarchical todos, metadata like due dates and priorities, and keyboard-driven navigation - have made it my go-to tool for task management. But what if you could have that same power in your web applications?

<!--more-->

The web is full of todo apps, but they all miss the mark. Simple checkboxes lack the power I need, while full project management tools overwhelm with features I don't want. I wanted the keyboard-driven efficiency of org-mode, but built for the web - accessible, integrable, and focused on what matters.

Here's an attempt to solve it - a modern web component that brings my favorite org-mode features to the web, with some adjustments:

{{< clarity-outline-simple >}}

The component is designed for keyboard-first interaction. You can navigate with Tab as usual, but also use arrow keys to move between items. Alt+arrow keys let you indent/outdent items, and Alt+Tab toggles collapse/expand. While it's optimized for keyboard use, it also supports mouse interactions - hover over items to see available actions with keyboard shortcut hints.

Notable features include priority marking (simplified from org-mode's A,B,C system - something is either priority or it's not), on-hold status (inspired by Basecamp's card tables as a separate state that can occur on any other status), assignment for collaboration (not possible in org-mode), custom status labels, event-driven integration, and built-in theming support.

The outline emits events for every interaction, designed to integrate with larger systems. You can't delete items here or add rich descriptions and comments - I intend to handle those on dedicated pages per outline item. This component focuses on the core outline functionality and navigation.

This is a start, a work in progress. The component supports keyboard navigation, custom status labels, and event-driven integration. You can find the source code and contribute at [github.com/andreasflakstad/clarity-outline](https://github.com/andreasflakstad/clarity-outline).
