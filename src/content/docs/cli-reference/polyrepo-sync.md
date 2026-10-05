---
title: Polyrepo Synchronization
description: Commands for keeping worktrees in sync with remotes — fetch, pull, merge, push, connect, and update.
---

Commands for keeping worktrees in sync with remote branches across all repos in an environment. For creating and
inspecting environments, see [Workspace Lifecycle](/winter-docs/cli-reference/workspace-lifecycle/). For standalone-repo
pin configuration, see the [config.toml Reference](/winter-docs/cli-reference/config/#standalone_repository).

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

Fetch, fast-forward each project's source-checkout main (best-effort), then integrate each worktree's tracked upstream.
Ff-only by default.

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

Push worktrees with commits ahead of upstream. Each non-pinned worktree pushes to the branch its own tracking config
names (resolved per worktree); a non-pinned worktree with no upstream is reported `no upstream`. Pinned worktrees
excluded by default.

```bash
winter ws push [PATTERNS...] [--include-pinned | --only-pinned] [--standalone | --all]
```

```bash
winter ws push alpha
```

### `ws connect` / `ws disconnect`

Point non-pinned worktrees at a remote feature branch, or clear that tracking. For `connect`, the trailing argument is
the branch; everything before it is a segment-aware `<env>/<repo>` glob, so a bare `<env>` connects the whole env while
an `<env>/<repo>` pattern targets specific worktrees — letting repos in one env carry independent branch names.
`disconnect` is whole-env only (`<env>`).

```bash
winter ws connect alpha feature/new-checkout      # every non-pinned worktree in alpha
winter ws connect alpha/api feature/auth          # just alpha's api worktree
winter ws disconnect alpha
```

### `ws update`

Re-resolve `ref` pins for standalone repos and rewrite `.winter/config.lock`. Fetches the latest origin refs,
re-resolves each pinned standalone's `ref`, checks out the resolved commit, and rewrites the lock file. This is the only
command that advances a tag/commit pin or snaps a branch pin to the latest origin tip on demand, surfacing the change as
a reviewable lock diff. With `--freeze`, it instead pins every unpinned standalone to its current checkout (see
[Freezing the workspace](#freezing-the-workspace)).

```bash
winter ws update [REPOS]... [--autostash] [--json]
winter ws update --freeze [REPOS]... [--force] [--json]
```

Each `REPO` is a bare glob over standalone-repo names (no `<env>/` segment).

- `winter ws update` — re-pin all pinned standalone repos.
- `winter ws update my-lib` — re-pin only `my-lib`.
- `winter ws update 'winter-*'` — re-pin every pinned standalone whose name matches the glob.
- `--autostash` — stash the working tree before re-pinning, restore after.

```bash
winter ws update
```

#### Freezing the workspace

A workspace is only fully reproducible when every standalone is pinned, but standalones without a `ref` float at
whatever their checkout last pulled. `--freeze` pins them all at once, as one reviewable diff:

```bash
winter ws update --freeze                 # pin every unpinned standalone
winter ws update --freeze 'winter-*'      # only the matching ones
winter ws update --freeze my-lib --force  # pin my-lib's HEAD despite uncommitted changes
git diff .winter                          # config.toml gains ref lines; config.lock gains entries
```

For each matched standalone:

- **No `ref`** — writes `ref = "<sha>"` (the checkout's full `HEAD` commit) into `.winter/config.toml`, preserving its
  comments and layout, and records the commit in `.winter/config.lock`. A repo declared only in
  `.winter/config.local.toml` gets the `ref` there instead.
- **Already has a `ref`** — skipped; neither file changes. To move an existing pin, run `ws update` without `--freeze`.

Freezing reads the checkout only: it does not fetch or check anything out. A commit that has not been pushed pins fine,
but a fresh clone cannot resolve it until it is. Project repositories are never pinned.

Each repo reports one outcome: pinned, already pinned, or refused with the reason. A repo is refused when:

- it has uncommitted changes (`--force` pins its committed `HEAD` anyway; the uncommitted changes are not part of the
  pin);
- it is not cloned (run `winter ws init`);
- it is not a git repository;
- it is not declared in `config.toml` or `config.local.toml`, so there is nowhere to write its `ref`.

A refusal does not stop the other repos from being pinned, but the command exits non-zero, with `--json` too. Two
combinations are rejected outright: `--force` without `--freeze`, and `--freeze` with `--autostash`.

:::note[Canonical source] Full flag semantics and error messages are owned by `context/winter-cli/usage/ws/update.md` in
the `winter` repo. :::
