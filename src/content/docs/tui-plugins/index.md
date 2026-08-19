---
title: TUI Plugins
description: Extend the winter dashboard and CLI with plugins — contribute status badges, TUI screens, keybound actions, and more.
---

TUI plugins extend the running `winter` tool — its dashboard and command surface — from outside the CLI's own source
tree. A plugin can paint status badges, add full TUI screens, and bind keyboard actions.

This is a different extension point from a [winter extension](/winter-docs/extensions/). A winter extension integrates
optional shipped surfaces with the *workspace* through a `winter-ext.toml` manifest; those surfaces can include skills,
agents, reusable methodology, hooks, probes, checks, or capability providers. A TUI plugin integrates with the *running
`winter` tool* itself.

## In this section

- **[Authoring a TUI Plugin](/winter-docs/tui-plugins/authoring/)** — how to write a `plugin.py`, where plugins are
  discovered, what a plugin can contribute (badges, screens, keybound actions), and a worked example using the
  `winter-service-tmux` status badge.
- **[TUI Plugin Examples](/winter-docs/tui-plugins/examples/)** — practical plugin shapes beyond the status badge:
  worktree repo decorators, environment decorators with config, keyboard actions, and multi-decorator compositions.
