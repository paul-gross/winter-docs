---
title: CLI Reference
description: Command reference for the winter CLI, organized by functional area.
---

The `winter` command manages the workspace across all repositories. Install it from the workspace root with `./tools/winter-cli/install.sh`; the wrapper auto-discovers the workspace by searching upward for `.winter/config.toml` + `tools/winter-cli/`.

:::tip
To run an in-development copy of the CLI from a feature worktree without reinstalling, prefix any command with `--winter=PATH` (must be the first argument), e.g. `winter --winter=./alpha/winter ws status`.
:::

Most commands accept `--json` for machine-readable output. Root flags (`--version`, `--help`) and the `--winter` dev flag are in the [Global Reference](/winter-docs/cli-reference/global-reference/). For the configuration file these commands read, see the **[config.toml Reference](/winter-docs/cli-reference/config/)**.

## Command families

Choose the area that matches your task:

| Area | Commands | Use when… |
|------|----------|-----------|
| [Workspace lifecycle](/winter-docs/cli-reference/workspace-lifecycle/) | `ws init`, `ws list`, `ws status`, `ws diff`, `ws destroy`, `ws prune`, `ws worktrees`, `ws index`, `ws checkout` | Creating, inspecting, adopting, and tearing down feature environments and worktrees. |
| [Polyrepo synchronization](/winter-docs/cli-reference/polyrepo-sync/) | `ws fetch`, `ws pull`, `ws merge`, `ws push`, `ws connect`, `ws disconnect`, `ws update` | Keeping worktrees in sync with upstream branches. |
| [Repository & extension management](/winter-docs/cli-reference/repo-ext/) | `winter repo`, `winter ext` | Adding project repos, scaffolding or verifying extensions. |
| [Environment runtime](/winter-docs/cli-reference/environment-runtime/) | `winter service`, `winter provision` | Starting services and provisioning environment dependencies. |
| [Diagnostics & introspection](/winter-docs/cli-reference/diagnostics/) | `winter doctor`, `winter lint`, `winter graph`, `winter capabilities` | Validating health, linting conventions, and inspecting the module graph. |
| [Dashboard](/winter-docs/cli-reference/dashboard/) | `winter dashboard` | Launching the interactive TUI. |
| [Global reference](/winter-docs/cli-reference/global-reference/) | `--version`, `--help`, `--winter`, `--json` | Root flags that apply to every command. |
| [config.toml reference](/winter-docs/cli-reference/config/) | All config keys | Config file schema, port allocation, provision manifests, extension manifests. |

:::note[Canonical source]
Agent-facing references: [`ai/winter-cli/index.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/index.md) (command hub, routing to per-topic `usage/` files), [`ai/winter-cli/setup.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/setup.md) (install) and [`ai/winter-cli/configuration/index.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/configuration/index.md) (configuration hub).
:::
