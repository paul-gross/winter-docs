---
title: Operations
description: The day-to-day operating model for winter — feature environments, polyrepo git, and running services.
---

This section is the task-oriented guide to operating a winter workspace day to day. It covers what you do constantly: managing feature environments, running git across many repos at once, provisioning them, and starting and stopping services. The pages here describe the user-facing model; each links to the full command reference for the details.

## The operating lifecycle

Winter's operations form a closed loop: compose a workspace, create an environment, establish repository state, provision it, start services, work inside the isolated space, iterate through nested feedback loops, and finally tear down. The sections below follow that loop.

### 1. Compose a workspace

A winter workspace is assembled from project repositories, a harness that supplies conventions, and extensions that add capabilities — service orchestration, GitHub tooling, agentic workflow skills. Everything is declared in `.winter/config.toml`; `winter ws init` keeps the filesystem aligned with that declaration. You compose the workspace once and reconcile it whenever the config changes.

### 2. Create a feature environment

`winter ws init <env>` creates a coordinated set of git worktrees — one per project repo — all branched from the current main and sharing a private port block. Alpha gets one block, beta the next; two environments can run the full stack simultaneously without port collisions. See [Feature Environments & Worktrees](/winter-docs/operations/feature-environments/).

### 3. Establish repository state

With worktrees in place, connect them to the remote feature branches:

```
winter ws connect alpha feature/my-feature
```

From here, `winter ws pull` integrates remote commits across all repos and `winter ws push` ships them. For cross-cutting work that touches repos independently, connect individual worktrees to separate branches and pull or push each in isolation. Raw `git` handles per-repo staging, committing, and conflict resolution — winter wraps only the multi-repo operations. See [Polyrepo Git Operations](/winter-docs/operations/polyrepo-git/).

### 4. Provision the environment

`winter provision <env>` runs in three ordered stages — dependency → resource → data — to bring the environment from bare worktrees to a working state. Each stage is idempotent; re-run any stage after pulling new migrations, adding a dependency, or resetting a dataset. When you need a clean slate mid-stream, the reset flags wipe and recreate individual stages without touching the whole environment. See [Provisioning Environments](/winter-docs/operations/provisioning/).

### 5. Start services

Winter distinguishes two tiers:

- **Workspace-scoped services** (shared databases, brokers, registries) start once for the whole workspace with `winter service up workspace` and stay up across all feature environments, so they are available before per-environment work begins.
- **Feature-environment-scoped services** (backend, frontend, workers) start per-environment with `winter service up alpha` in a dedicated tmux session. Multiple environments run their own copies of the stack simultaneously without port conflicts.

See [Running Services](/winter-docs/operations/services/).

### 6. Work inside the environment

With a provisioned environment and live services, an agent or person works directly in the isolated space: code is in the worktrees, live endpoints are at the environment's private port block, and logs are at `<env>/.winter/logs/`. Nothing bleeds into another environment.

### 7. Iterate through nested feedback loops

The operating model is built for rapid iteration. Several feedback loops nest inside each other:

- **Edit → test**: change code in a worktree and run the test suite against the live services in the same environment. No other environment is affected.
- **Service restart → log inspection**: if a service crashes or wedges, restart just that pane while the rest of the session keeps running, then follow its log to confirm recovery. See [Running Services](/winter-docs/operations/services/).
- **Data reset → revalidation**: wipe and reload fixtures between test runs and revalidate against the running stack — without stopping services or rebuilding the environment. See [Provisioning Environments](/winter-docs/operations/provisioning/).
- **Cross-repo integration**: pull a collaborating branch into one worktree, run the integration suite, and push your own changes — all within the same environment, all via `winter ws` commands. See [Polyrepo Git Operations](/winter-docs/operations/polyrepo-git/).
- **Delivery validation**: when the inner loops close, push the feature branches and run final validation against the live environment before teardown.

### 8. Tear down

`winter ws destroy alpha` fires every extension's teardown hook — stopping services, cleaning provisioned resources, removing worktrees — and frees the port slot for reuse. Prefer `winter ws destroy` over `rm -rf` so extension state is not orphaned. See [Feature Environments & Worktrees](/winter-docs/operations/feature-environments/).

## CLI first, raw git when you need it

Use the `winter` CLI for anything that spans repositories — it reads the workspace config, handles pinned repos, runs in parallel, and is idempotent. Drop to raw `git` for single-repo work: staging, committing, resolving conflicts, interactive rebase.

The pages here describe the user-facing model. The exhaustive, agent-facing procedures live in winter's own `context/` references, linked from each page — most notably [`context/worktree-ops.md`](https://github.com/paul-gross/winter/blob/master/context/worktree-ops.md) and [`context/winter-cli/index.md`](https://github.com/paul-gross/winter/blob/master/context/winter-cli/index.md).
