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

Each project source checkout and standalone also reports the work no remote holds: `local_only_commits` counts commits
on any local branch that no remote-tracking branch reaches, and `stashes` counts stash entries. The SYNC cell shows them
as `N local-only, N stash`, and `--json` carries both fields. They are informational and do not affect the exit code.

**Exit codes:** `0` clean; `1` dirty or drifted; `2` command error (e.g. a pattern that matches nothing). When PATTERNS
are given, exit code reflects only the matched worktrees; global drift is shown as context but does not affect it.

A worktree of a [nested workspace](/winter-docs/operations/nested-workspaces/#ws-status) also reports that workspace's
environment count, dirty state, and unpushed work.

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

**Ignored files are never removed** in any mode, so `.venv`, `node_modules`, and build output survive and a `ws clean`
never forces a re-provision — resetting declared build artifacts is
[`winter clean`](/winter-docs/cli-reference/environment-runtime/#winter-clean)'s job, a separate command. Removed files
are unrecoverable — no reflog stands behind them — so the command prompts before removing anything at any worktree count
unless `--force` or `--dry-run`, and `--dry-run` lists every path it would delete.

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

When an environment hosts a [nested workspace](/winter-docs/operations/nested-workspaces/#ws-destroy), its environments
are destroyed first, and the teardown is refused unless `--force` when:

- a nested environment is dirty;
- the nested workspace holds work that exists nowhere else (unpushed commits, local-only branches, stashes);
- the nested workspace cannot be read.

After the nested environments are gone, the outer destroy also stops the nested workspace's workspace-scope services,
running `winter service down workspace` there, before the worktree is removed. It does this only when the nested
workspace binds a `service` capability. A failure aborts the teardown unless `--force`, and `--dry-run` lists the step.

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

### `ws fingerprint`

Print one digest that identifies this workspace's *definition*, so two copies of a workspace can be compared with a
single value. Two copies print the same digest exactly when their definitions match — useful to prove two setups
identical or to detect one that changed underneath a trial. No network calls; it never changes refs, the index, or the
working tree.

```bash
winter ws fingerprint [--json]
```

**Covered:** the workspace repo's tracked content, and the name and tracked content of each `[[standalone_repository]]`.
Staged and uncommitted changes to tracked files count, because the digest follows the repo's tracked content, not its
commit: two copies with different uncommitted edits never share a digest. Two copies whose commit histories differ but
whose files are identical match, and so do a dirty repo and a clean one whose tracked content is identical, such as a
change staged and then reverted.

**Not covered:** untracked files (generated projections, local scratch), feature environments, and project repositories
— their commits vary per environment.

Without `--json`, the output is the digest alone: a 64-character lowercase hex string on one line. With `--json`, one
object:

```json
{
  "digest": "9f2c0e…",
  "workspace": { "name": "my-workspace", "commit": "…", "tree": "…", "dirty": false },
  "standalones": [{ "name": "winter-context", "commit": "…", "tree": "…", "dirty": true }]
}
```

`commit` is informational; `tree` is the tracked content the digest is computed from; `dirty` is `true` when a tracked
file has a staged or unstaged change. `dirty` is reported but not hashed. `standalones` is sorted by name.

**Exit codes:** `0` digest printed; `1` a git probe failed, or the workspace or a declared standalone is not cloned (run
`winter ws init` first) — nothing is printed to stdout.

:::note[Canonical source] The digest's exact definition and serialization are owned by
`context/winter-cli/usage/ws/fingerprint.md` in the `winter` repo. :::
