---
title: Feature Environments & Worktrees
description: Create, list, and destroy feature environments, and understand Greek-letter port indexing.
---

A **feature environment** is a coordinated set of git worktrees — one for every project repository — that share a branch name and a private block of ports. It's where a unit of work actually happens. Multiple environments coexist and run side by side without interfering, which is what makes parallel work (by people or agents) safe. See the [glossary](/winter-docs/getting-started/glossary/) for the underlying terms.

Each repository lives in two places:

- a **source checkout** at `projects/<repo>/`, kept on the main branch and **never edited directly**;
- a **worktree** inside each environment (`alpha/<repo>/`, `beta/<repo>/`, …) on a branch named after the environment.

## Create

```bash
winter ws init alpha
```

For each project repo this runs `git worktree add -b alpha <main-branch>`, copies your git identity in, writes git-exclude entries, runs the repo's setup `cmd`, seeds `alpha/.winter.env` with `WINTER_ENV` / `WINTER_ENV_INDEX` / `WINTER_PORT_BASE`, and fires every installed extension's `on_env_init` hook. Pinned repos get their worktree wired to track `origin/<main-branch>` instead of the environment branch.

The command is idempotent — re-run it any time to reconcile an environment after a config change.

## List & inspect

```bash
winter ws list             # all environments and their feature-branch / status
winter ws status alpha     # git status across every worktree in alpha (== 'alpha/*')
winter ws diff alpha       # unified diff across every repo in alpha
```

## Greek-letter port indexing

Environments are conventionally named after Greek letters because each letter carries a fixed index, 1–24, and the index sets the environment's port offset:

```
port base = 4000 + 100 × index
alpha → 4100   beta → 4200   gamma → 4300   …
```

`winter ws init` writes `WINTER_PORT_BASE` into the environment's `.winter.env`; your services derive their ports from it, so two environments never collide. Non-Greek names (arbitrary feature names) get a deterministic hashed index in the range 26–281. To see the index a name resolves to:

```bash
winter ws index my-feature
```

The full alphabet, in order: alpha, beta, gamma, delta, epsilon, zeta, eta, theta, iota, kappa, lambda, mu, nu, xi, omicron, pi, rho, sigma, tau, upsilon, phi, chi, psi, omega.

## Destroy

```bash
winter ws destroy alpha              # standard teardown
winter ws destroy alpha --dry-run    # preview the plan, no side effects
winter ws destroy alpha --force      # bypass the dirty-worktree check
winter ws destroy alpha --strict     # abort if any on_env_destroy hook fails
```

Teardown fires every extension's `on_env_destroy` hook (the mirror of `on_env_init`), removes each per-repo worktree, deletes the environment directory, and strips the environment's entry from the workspace's git-exclude file.

:::caution
Prefer `winter ws destroy` over `rm -rf alpha/`. Manual removal skips the `on_env_destroy` hooks, leaving extension state — tmux sessions, watchers, provisioned databases — orphaned.
:::

:::note[Canonical source]
The exact git sequences behind each step are documented for agents in [`ai/worktree-ops.md`](https://github.com/paul-gross/winter/blob/master/ai/worktree-ops.md) and [`ai/workspace-layout.md`](https://github.com/paul-gross/winter/blob/master/ai/workspace-layout.md).
:::
