---
title: winter-nvim
description: Neovim integration for Winter workspaces — navigate environments, inspect status, and review cross-repo diffs from inside Neovim.
---

**[winter-nvim](https://github.com/paul-gross/winter-nvim)** integrates Winter with Neovim. It is not a workspace extension — it does not ship a `winter-ext.toml` manifest, is not installed by `winter ws init`, and does not appear in the workspace's extension graph. It is a user-level Neovim plugin that reads the workspace config and surfaces winter functionality inside the editor.

## What it provides

winter-nvim ships three integrated features:

- **Worktrees picker** — a fuzzy-finder over every `<env>/<repo>` feature-environment worktree and standalone repository; jump Neovim's working directory into it, restoring a saved session if one exists.
- **Workspace status dashboard** — a persistent toggle-able panel showing all feature-environment worktrees and their git state (ahead/behind/dirty/diverged), rendered as a navigable grid with quick-diffs openable in a new tab.
- **Cross-repo diff viewer** — aggregated multi-repo feature diff via `codediff.nvim`, with branch/uncommitted/staged variants.

For the full command surface, keybinding reference, and configuration options see the canonical source below.

## When to use

winter-nvim is for users whose primary editing environment is Neovim and who want Winter workspace awareness built into that environment rather than switching between the editor and a terminal dashboard.

It is independent of which extensions your workspace installs — you can use winter-nvim alongside any combination of winter-service-tmux, winter-service-docker, winter-github, winter-product, and so on.

## Installation and setup

winter-nvim is a standard Neovim plugin. Install it with your plugin manager (lazy.nvim, packer, etc.) pointing to the GitHub repository. The `winter` CLI must be on your `$PATH` — it is a hard requirement listed in the plugin's README.

For setup options, keybinding configuration, and integration details, see the **canonical source**:

:::note[Canonical source]
[`winter-nvim`](https://github.com/paul-gross/winter-nvim) — the authoritative reference for installation instructions, configuration options, and the keybinding surface. Setup details change with the plugin; read the repo rather than this page for current steps.
:::

## Why it is a related project, not an extension

A Winter extension integrates with the **workspace** — it ships skills, agents, and lifecycle hooks that the workspace uses during development. winter-nvim integrates with the **editor** — it is a user-level tool that reads workspace state but does not change it, and is installed per-user, not per-workspace. Classifying it as an extension would misrepresent how it installs and what it does.
