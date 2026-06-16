---
title: Operations
description: The day-to-day operating model for winter — feature environments, polyrepo git, and running services.
---

This section is the task-oriented guide to operating a winter workspace day to day. It covers the three things you do constantly: managing feature environments, running git across many repos at once, and starting and stopping services.

- **[Feature Environments & Worktrees](/winter-docs/operations/feature-environments/)** — create, list, and destroy environments; how the config-driven port scheme keeps them from colliding.
- **[Polyrepo Git Operations](/winter-docs/operations/polyrepo-git/)** — `fetch`, `pull`, `push`, `merge`, and `connect`/`disconnect` across every repo, with guidance on when to use each.
- **[Running Services](/winter-docs/operations/services/)** — the `setup-tmux.sh` setup and the `up` / `down` / `status` / `restart` scripts the service-orchestration extension provides.

## CLI first, raw git when you need it

Use the `winter` CLI for anything that spans repositories — it reads the workspace config, handles pinned repos, runs in parallel, and is idempotent. Drop to raw `git` for single-repo work: staging, committing, resolving conflicts, interactive rebase.

The pages here describe the user-facing model. The exhaustive, agent-facing procedures live in winter's own `ai/` references, linked from each page — most notably [`ai/worktree-ops.md`](https://github.com/paul-gross/winter/blob/master/ai/worktree-ops.md) and [`ai/winter-cli/index.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/index.md).
