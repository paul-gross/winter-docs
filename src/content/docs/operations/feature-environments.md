---
title: Feature Environments & Worktrees
description: Create, list, and destroy feature environments, and understand how the config-driven port scheme assigns each env a private port block.
---

A **feature environment** is a coordinated set of git worktrees — one for every project repository — that share a branch name and a private block of ports. It's where a unit of work actually happens. Multiple environments coexist and run side by side without interfering, which is what makes parallel work (by people or agents) safe. See the [glossary](/winter-docs/getting-started/glossary/) for the underlying terms.

Each repository lives in two places:

- a **source checkout** at `projects/<repo>/`, kept on the main branch and **never edited directly**;
- a **worktree** inside each environment (`alpha/<repo>/`, `beta/<repo>/`, …) on a branch named after the environment.

## Create

```bash
winter ws init alpha          # create or reconcile one environment
winter ws init                # workspace-level reconcile (no target)
winter ws init --all          # reconcile every existing environment
```

`winter ws init alpha` runs `git worktree add -b alpha <main-branch>` for each project repo, copies your git identity in, writes git-exclude entries, runs the repo's setup `cmd`, seeds `alpha/.winter.env` with `WINTER_ENV` / `WINTER_ENV_INDEX` / `WINTER_PORT_BASE`, and fires every installed extension's `on_env_init` hook. Pinned repos get their worktree wired to track `origin/<main-branch>` instead of the environment branch.

The command is idempotent — re-run it any time to reconcile an environment after a config change.

When invoked without a target (`winter ws init`) or with `--all`, winter also fires each extension's `on_workspace_reconcile` hook once — before any per-env loop. This is the hook that regenerates workspace-level artifacts (like the service-to-pane reference map that winter-service-tmux produces) rather than per-environment state.

## List & inspect

```bash
winter ws list             # all environments and their feature-branch / status
winter ws status alpha     # git status across every worktree in alpha (== 'alpha/*')
winter ws diff alpha       # unified diff across every repo in alpha
```

## Port indexing

Every environment is assigned a unique integer index, and `winter ws init` derives its port base from that index:

```
port base = base_port + index × ports_per_env
```

With the defaults (`base_port = 4000`, `ports_per_env = 20`), alpha (index 1) → 4020, beta (2) → 4040, gamma (3) → 4060, and so on. `WINTER_PORT_BASE` is written into the environment's `.winter.env`; services derive their ports from it, so two environments never share a port.

The port layout is config-driven — all four knobs live in `.winter/config.toml` (see the [config reference](/winter-docs/cli-reference/config/#port-allocation)):

| Key | Default | Meaning |
|-----|---------|---------|
| `base_port` | `4000` | Start of this workspace's port band. Different values separate co-located workspaces (e.g. 4000 / 5000 / 6000). |
| `ports_per_env` | `20` | Ports allocated per environment. |
| `env_aliases` | first 10 Greek letters | Fixed-index env names (1..N). Aliases get stable, predictable slots. |
| `envs_per_workspace` | `48` | Maximum env index (1..N); must be ≥ `len(env_aliases) + 2`. Derives the hash band. |

**Index assignment** is persisted in `.winter/state.toml` (machine-local, gitignored):

- Configured aliases (`alpha`…`kappa` by default) always receive their fixed slot (1..N).
- All other names — additional Greek letters or arbitrary strings — get a SHA-1-derived slot in the hash band, with linear-probe collision resolution. The assigned index is stable once written.
- `winter ws destroy` removes the registry entry; the slot becomes available again.

To see the index for a name:

```bash
winter ws index my-feature
```

For an existing env this returns the **persisted** index. For a hypothetical name it returns the **suggested** slot (which may shift on create if another env already occupies it).

`winter doctor` validates the config invariant and warns on registry drift — stale entries, unregistered env dirs, out-of-range indices, duplicate assignments.

Conventional environment names: alpha, beta, gamma, delta, epsilon, zeta, eta, theta, iota, kappa, lambda, mu, nu, xi, omicron, pi, rho, sigma, tau, upsilon, phi, chi, psi, omega.

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
