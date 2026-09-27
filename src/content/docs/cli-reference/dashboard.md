---
title: Dashboard
description: The winter dashboard command — launching and operating the interactive TUI.
---

The `winter dashboard` command launches an interactive TUI for monitoring workspace status, environments, and per-repo
tracking. Key bindings are configurable — see the
[config.toml Reference → `[keybindings]`](/winter-docs/cli-reference/config/#keybindings).

## `winter dashboard`

Interactive TUI showing workspace status, environments, and per-repo tracking. Press `L` for the captured-error log; `c`
to clear it. Press `M` to open the Agent matrix screen, which shows the same resolved agent model/effort data
[`winter agents`](/winter-docs/cli-reference/diagnostics/#winter-agents) prints; there `r` refreshes it and `i` runs the
full workspace-level `winter ws init` (cloning missing repos, running their setup commands and hooks, and re-rendering
stale agent files). Every key is remappable — see the [`[keybindings]`](/winter-docs/cli-reference/config/#keybindings)
config section.

```bash
winter dashboard
```

See
[`context/winter-cli/usage/dashboard.md`](https://github.com/paul-gross/winter/blob/master/context/winter-cli/usage/dashboard.md)
for the default keys, the Agent matrix screen, layouts, and the action-id table.
