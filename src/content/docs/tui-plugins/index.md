---
title: TUI Plugins
description: Extend the winter dashboard and CLI with plugins — contribute status badges, TUI screens, keybound actions, and more.
---

TUI plugins extend the running `winter` tool — its dashboard and command surface — from outside the CLI's own source tree. A plugin can paint status badges, add full TUI screens, and bind keyboard actions.

This is a different extension point from a [winter extension](/winter-docs/extensions/). An extension integrates with the *workspace* — it ships skills, agents, and lifecycle hooks via a `winter-ext.toml` manifest. A TUI plugin integrates with the *running `winter` tool* itself.

## In this section

- **[Authoring a TUI Plugin](/winter-docs/tui-plugins/authoring/)** — how to write a `plugin.py`, where plugins are discovered, what a plugin can contribute (badges, screens, keybound actions), and a worked example using the `winter-service-tmux` status badge.
