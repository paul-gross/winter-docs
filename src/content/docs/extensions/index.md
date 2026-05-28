---
title: Extensions
description: Opt-in capabilities a winter workspace installs — conventions, agentic workflow, product backlog, service orchestration, and issue tooling.
---

Extensions are how a winter workspace gains capabilities beyond the core CLI. Each is a standalone repository the workspace clones and installs; once installed, it contributes **skills**, **agents**, lifecycle **hooks** (`on_env_init` / `on_env_destroy`), and **`winter doctor` probes**.

## The maintained extensions

| Extension | Adds |
|-----------|------|
| **[winter-harness](/winter-docs/extensions/winter-harness/)** | The conventions layer: code, markdown, and process conventions plus reference exemplars. |
| **[winter-workflow](/winter-docs/extensions/winter-workflow/)** | The agentic workflow: agent roles and the blizzard / thaw / review loops. |
| **[winter-product](/winter-docs/extensions/winter-product/)** | A product backlog model with refinement agents and skills. |
| **[winter-service-tmux](/winter-docs/extensions/winter-service-tmux/)** | tmux-based service orchestration (`up` / `down` / `status`). |
| **[winter-github](/winter-docs/extensions/winter-github/)** | AI-native GitHub issue tooling via the `gh` CLI. |

## How extensions install

Declare an extension as a `[[standalone_repository]]` in `.winter/config.toml`, then run `winter ws init` (or `/ws-setup`):

```toml
[[standalone_repository]]
name = "winter-workflow"
url = "git@github.com:paul-gross/winter-workflow.git"
path = ".winter/ext/workflow"   # optional; defaults to the repo name
```

On install, winter reads the extension's `winter-ext.toml` manifest and symlinks its skills and agents into the workspace's `.claude/` directory under a short **prefix** (e.g. `wf-blizzard`, `wst-…`). The prefix keeps extensions from colliding, and lets the same workspace install several at once.

An extension manifest can also declare lifecycle hooks and a `doctor` probe:

```toml
name = "winter-workflow"
prefix = "wf"
[hooks]
on_env_init    = "./hooks/init.sh"
on_env_destroy = "./hooks/destroy.sh"
doctor = "scripts/doctor.sh"
```

See the [config.toml reference](/winter-docs/cli-reference/config/) for the manifest schema and the `adopt_extensions` modes that control how aggressively winter processes a standalone repo's skills and agents.

The guides in this section explain, for each extension: what it contributes, when to adopt it, how to configure it, and its key conventions.
