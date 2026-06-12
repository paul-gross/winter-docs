---
title: Extensions
description: Opt-in capabilities a winter workspace installs — product backlog, service orchestration, and issue tooling.
---

Extensions are how a winter workspace gains capabilities beyond the core CLI. Each is a standalone repository the workspace clones and installs; once installed, it contributes **skills**, **agents**, lifecycle **hooks** (`on_env_init` / `on_env_destroy`), **`winter doctor` probes**, and **`winter lint` checks**.

## The maintained extensions

These are *consumable* extensions — generic capabilities a workspace installs and uses as-is:

| Extension | Adds |
|-----------|------|
| **[winter-product](/winter-docs/extensions/winter-product/)** | A product backlog model with refinement agents and skills. |
| **[winter-service-tmux](/winter-docs/extensions/winter-service-tmux/)** | tmux-based service orchestration (`up` / `down` / `status` / `restart`). |
| **[winter-github](/winter-docs/extensions/winter-github/)** | AI-native GitHub issue tooling via the `gh` CLI. |

The maintainer's conventions ([winter-harness](/winter-docs/examples/winter-harness/)) and agentic workflow ([winter-workflow](/winter-docs/examples/winter-workflow/)) install and run just like these, but they are the maintainer's own opinionated, swappable implementations — adopt them as-is or fork your own. They're grouped under [Examples](/winter-docs/examples/).

## How extensions install

Declare an extension as a `[[standalone_repository]]` in `.winter/config.toml`, then run `winter ws init` (or `/ws-setup`):

```toml
[[standalone_repository]]
name = "winter-service-tmux"
url = "git@github.com:paul-gross/winter-service-tmux.git"
path = ".winter/ext/service-tmux"   # optional; defaults to the repo name
```

On install, winter reads the extension's `winter-ext.toml` manifest and symlinks its skills and agents into the workspace's `.claude/` directory under a short **prefix** (e.g. `wp-todo`, `wst-…`). The prefix keeps extensions from colliding, and lets the same workspace install several at once.

An extension manifest can also declare lifecycle hooks, a `doctor` probe, and a `lint` check:

```toml
name = "winter-service-tmux"
prefix = "wst"
doctor = "scripts/doctor.sh"   # NDJSON health probe for `winter doctor`
lint   = "scripts/lint.sh"     # NDJSON convention checks for `winter lint`
[hooks]
on_env_init    = "./hooks/init.sh"
on_env_destroy = "./hooks/destroy.sh"
```

See the [config.toml reference](/winter-docs/cli-reference/config/) for the manifest schema and the `adopt_extensions` modes that control how aggressively winter processes a standalone repo's skills and agents.

The guides in this section explain, for each extension: what it contributes, when to adopt it, how to configure it, and its key conventions.

## Plugins: extending the dashboard and CLI

Beyond skills, agents, and hooks, an extension (or a standalone `.winter/plugins/` directory) can ship a **TUI plugin** — a `plugin.py` that contributes status badges, TUI screens, and keybound actions to the running dashboard. See [Authoring a TUI plugin](/winter-docs/tui-plugins/authoring/).
