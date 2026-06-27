---
title: Polyrepo Synchronization
description: Commands for keeping worktrees in sync with remotes — fetch, pull, merge, push, connect, and update.
---

Commands for keeping worktrees in sync with remote branches across all repos in an environment. For creating and inspecting environments, see [Workspace Lifecycle](/winter-docs/cli-reference/workspace-lifecycle/). For standalone-repo pin configuration, see the [config.toml Reference](/winter-docs/cli-reference/config/#standalone_repository).

## `winter ws` — sync commands

### `ws fetch`

Refresh remote-tracking refs and fast-forward each matched source checkout's local main. No feature-worktree changes.

```bash
winter ws fetch [PATTERNS...] [--standalone | --all]
```

```bash
winter ws fetch --all
```

### `ws pull`

Fetch, fast-forward each project's source-checkout main (best-effort), then integrate each worktree's tracked upstream. Ff-only by default.

```bash
winter ws pull [PATTERNS...] [--ff-only | --merge | --rebase] [--autostash] [--standalone | --all]
```

```bash
winter ws pull alpha --rebase
```

### `ws merge`

Merge an explicit source ref into matched worktrees. Does not fetch.

```bash
winter ws merge SOURCE_REF [PATTERNS...] [--ff-only | --merge | --no-ff] [--autostash] [--exclude-pinned | --only-pinned]
```

```bash
winter ws merge master alpha
```

### `ws push`

Push worktrees with commits ahead of upstream. Each non-pinned worktree pushes to the branch its own tracking config names (resolved per worktree); a non-pinned worktree with no upstream is reported `no upstream`. Pinned worktrees excluded by default.

```bash
winter ws push [PATTERNS...] [--include-pinned | --only-pinned] [--standalone | --all]
```

```bash
winter ws push alpha
```

### `ws connect` / `ws disconnect`

Point non-pinned worktrees at a remote feature branch, or clear that tracking. For `connect`, the trailing argument is the branch; everything before it is a segment-aware `<env>/<repo>` glob, so a bare `<env>` connects the whole env while an `<env>/<repo>` pattern targets specific worktrees — letting repos in one env carry independent branch names. `disconnect` is whole-env only (`<env>`).

```bash
winter ws connect alpha feature/new-checkout      # every non-pinned worktree in alpha
winter ws connect alpha/api feature/auth          # just alpha's api worktree
winter ws disconnect alpha
```

### `ws update`

Re-resolve `ref` pins for standalone repos and rewrite `.winter/config.lock`. Fetches the latest origin refs, re-resolves each pinned standalone's `ref`, checks out the resolved commit, and rewrites the lock file. This is the only command that advances a tag/commit pin or snaps a branch pin to the latest origin tip on demand, surfacing the change as a reviewable lock diff.

```bash
winter ws update [REPO] [--autostash] [--json]
```

- `winter ws update` — re-pin all pinned standalone repos.
- `winter ws update my-lib` — re-pin only `my-lib`.
- `--autostash` — stash the working tree before re-pinning, restore after.

```bash
winter ws update
```
