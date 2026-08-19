---
title: Workspace Lifecycle
description: Commands for creating, inspecting, adopting, restoring, and destroying feature environments and worktrees.
---

Commands for creating, inspecting, adopting, restoring, pruning, and destroying feature environments and worktrees. For
syncing worktrees with remote branches, see [Polyrepo Synchronization](/winter-docs/cli-reference/polyrepo-sync/). For
port and environment configuration, see the [config.toml Reference](/winter-docs/cli-reference/config/#port-allocation).

## `winter ws` — workspace & environments

### `ws init`

Reconcile the workspace against the config. Idempotent.

```bash
winter ws init [TARGET] [--all]
```

- `winter ws init` — clone/refresh source checkouts and standalone repos.
- `winter ws init alpha` — create or reconcile the `alpha` environment.
- `winter ws init --all` — source checkouts, standalones, and every existing environment.

```bash
winter ws init alpha
```

### `ws list`

List all feature environments with their feature branch and status.

```bash
winter ws list
```

### `ws status`

Show git status across matched worktrees, source checkouts, and workspace-level state (orphans, drift). No network by
default — reports last-fetched state.

```bash
winter ws status [PATTERNS...] [--json] [--fetch]
```

- `winter ws status` — whole workspace.
- `winter ws status alpha` — every worktree in `alpha` (equivalent to `alpha/*`).
- `winter ws status alpha/winter` — one specific worktree.
- `winter ws status '*/winter'` — that repo across every environment.

`--fetch` refreshes remote-tracking refs first (network). `--json` emits a stable, versioned snapshot
(`schema_version: 1`) covering environments, source checkouts, and workspace-level drift — suitable for scripting.

**Exit codes:** `0` clean; `1` dirty or drifted; `2` command error (e.g. a pattern that matches nothing). When PATTERNS
are given, exit code reflects only the matched worktrees; global drift is shown as context but does not affect it.

```bash
winter ws status
```

### `ws diff`

Unified diff across all repos in an environment.

```bash
winter ws diff alpha [--staged | --branch] [--repo REPO]
```

```bash
winter ws diff alpha --branch
```

### `ws checkout`

Adopt an existing remote feature branch into an environment (all-or-nothing reset). No network — `fetch` first.

```bash
winter ws checkout alpha feature/existing-branch
```

### `ws reset`

Move matched worktree branches to a ref, all-or-nothing across the run. Git's own soft/mixed/hard semantics, applied
across every matched non-pinned worktree. Upstream tracking is never touched — unlike `checkout`, this is the bare
`git reset` half.

```bash
winter ws reset PATTERNS... REF [--soft | --mixed | --hard] [--force] [--dry-run] [--json]
```

```bash
winter ws reset alpha/winter origin/main            # one worktree, --mixed (default)
winter ws reset alpha origin/main --hard            # every non-pinned worktree in alpha
winter ws reset alpha origin/main --hard --dry-run  # preview the plan
```

`--hard` refuses on any matched worktree that is dirty or carries commits it would abandon, unless `--force`; the
refusal is all-or-nothing, so one refused repo blocks every repo.

**`--hard` does not remove untracked files.** It resets the three trees git tracks, so a file that was never added
survives it — use `ws clean` for those.

:::note[Canonical source] Mode semantics, the safety gate, ref tokens, and the confirmation threshold are owned by
`context/winter-cli/usage/ws/reset.md` in the `winter` repo. :::

### `ws clean`

Remove untracked files and untracked directories from matched non-pinned worktrees — the `git clean -fd` complement to
`ws reset`. Run both to return a worktree to a pristine ref.

```bash
winter ws clean PATTERNS... [--force] [--dry-run] [--json]
```

```bash
winter ws clean alpha/winter --dry-run       # preview; removes nothing
winter ws clean alpha                        # prompts before removing
winter ws clean alpha --force                # skip the prompt (scripted use)
winter ws clean alpha --json --dry-run       # NDJSON preview
```

**Ignored files are never removed** in any mode, so `.venv`, `node_modules`, and build output survive and a clean never
forces a re-provision. Removed files are unrecoverable — no reflog stands behind them — so the command prompts before
removing anything at any worktree count unless `--force` or `--dry-run`, and `--dry-run` lists every path it would
delete.

**`--json` requires `--force` or `--dry-run`** on this command, unlike the rest of the CLI: the confirmation prompt
would otherwise write human text onto the NDJSON stream and block a non-interactive consumer.

Unlike `reset` and `checkout`, a clean is **not** all-or-nothing — a deleted file has nothing to roll back to. A run
that fails partway still reports what it already removed and names the worktree it stopped on.

:::note[Canonical source] Flag semantics, the NDJSON event shape, and partial-failure behavior are owned by
`context/winter-cli/usage/ws/clean.md` in the `winter` repo. :::

### `ws destroy`

Tear down an environment: fire `on_env_destroy` hooks, remove worktrees, delete the directory.

```bash
winter ws destroy alpha [--force | --strict | --dry-run]
```

```bash
winter ws destroy alpha --dry-run
```

### `ws index`

Print the port-offset index for an environment name. Returns the **persisted** index from `.winter/state.toml` when the
env exists, or the **suggested** (hash) slot for a hypothetical name (with a note that it may shift on create due to
collision-probing).

```bash
winter ws index my-feature
```

### `ws prune`

Remove disk state for repos no longer in the config (orphan clones, broken `.claude/` symlinks).

```bash
winter ws prune [--dry-run | --force]
```

### `ws worktrees`

List every existing feature-environment worktree and standalone repo as a flat table or JSON array. Each entry carries a
`kind` of `worktree`, `standalone`, or `workspace`; the implicit workspace repo is the single `workspace` entry. Entries
whose directory does not exist on disk are omitted. Intended for editor integrations (e.g. a Neovim fuzzy-finder `cd`
picker).

```bash
winter ws worktrees [--status] [--json]
```

- `winter ws worktrees` — human-readable table.
- `winter ws worktrees --json` — JSON array for machine consumption.
- `winter ws worktrees --json --status` — JSON with per-repo git status (ahead/behind/dirty). Slower — does a git call
  per repo.

```bash
winter ws worktrees --json
```
