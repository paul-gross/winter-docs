---
title: Polyrepo Git Operations
description: Run git across every repo at once — fetch, pull, push, merge, and connect/disconnect — and know when to use each.
---

Winter's `ws` subcommands apply a git operation across every repository in an environment in one shot, reading the workspace config to handle pinned repos and running in parallel. They accept segment-aware glob patterns over `<env>/<repo>`, so you can target one environment, one repo, or many at once.

```bash
winter ws fetch alpha           # whole environment
winter ws push alpha/app-web    # one repo
winter ws pull '*/app-api'      # the app-api worktree in every environment
```

## The commands

| Command | What it does | When to use |
|---------|--------------|-------------|
| `winter ws pull <env>` | Fetch, then ff-only integrate each worktree's **tracked upstream** (feature branch for non-pinned, main for pinned). | Bring down remote commits on your feature branch. |
| `winter ws merge <ref> <env>` | Merge an arbitrary ref (another env, a branch, `origin/...`) into matched worktrees. No fetch. | Fold one environment into another, or merge a specific branch. |
| `winter ws push <env>` | Push worktrees with commits ahead of upstream. Non-pinned → each worktree's own tracked feature branch (resolved per worktree); pinned excluded by default. | Ship completed work. |
| `winter ws connect <env> <branch>` | Set each non-pinned worktree's upstream to `origin/<branch>`. | Point an environment at a remote feature branch (see below). |
| `winter ws disconnect <env>` | Unset upstream tracking on each non-pinned worktree. | Free an environment to be reused for a different feature. |
| `winter ws fetch <env>` | Refresh remote-tracking refs and fast-forward each source checkout's local main. No feature-worktree changes. | Bring `origin/<main>` into the source checkouts; before an offline `merge` or `checkout`. |
| `winter ws checkout <env> <branch>` | All-or-nothing reset of every worktree to `origin/<branch>`. | Adopt an existing remote feature branch. |

### fetch vs. pull vs. merge

These three overlap, so the distinction matters:

- **`fetch`** refreshes remote-tracking refs and fast-forwards the source checkouts' main — no feature-worktree changes. Run it before an offline `merge` or `checkout`, or to bring the latest `origin/<main>` into the source checkouts new envs branch from.
- **`pull`** targets each worktree's *tracked upstream* and is ff-only by default — use it to integrate your own feature-branch commits.
- **`merge`** takes an *explicit* source ref and does not fetch — use it for env-to-env folds or to fold `origin/<main>` into a worktree (`winter ws fetch` first, then `winter ws merge origin/<main> <env>`).

## Branch model

Each environment uses a **Greek-letter branch locally** (e.g. `alpha`) and tracks a separate **remote feature branch** (e.g. `feature/new-checkout`) that you set with `winter ws connect`. The remote branch is created on first push:

```bash
winter ws connect alpha feature/new-checkout
# ... do work, commit per repo ...
winter ws push alpha
```

`winter ws connect` points every non-pinned repo in an environment at the same remote feature-branch name, so that's the usual shape. `push` doesn't rely on it, though: it resolves each worktree's target from that worktree's own tracking config, so a worktree you re-point individually still pushes to its own branch, and a non-pinned worktree with no upstream is reported per-repo as `no upstream — run winter ws connect first` (order-independent) rather than borrowing a sibling's branch.

## Pinned repos

A **pinned** repo never participates in feature branching — its worktree tracks `origin/<main>`. Pinned repos are skipped by `connect`/`disconnect` and **excluded from `push` by default**. To ship a change you landed on a pinned repo's main branch:

```bash
winter ws push --include-pinned    # non-pinned + pinned
winter ws push --only-pinned       # just the pinned set
```

In a workspace where **every** repo is pinned, a bare `winter ws push <env>` therefore pushes nothing by default and reports a skip line:

```
! alpha: 1 pinned repo(s) with commits skipped — use --include-pinned or --only-pinned
```

That is not "nothing to push" — the commits exist; the default scope excluded them. Re-run with one of the flags above, or push the repo directly with plain `git push`.

## Committing

Winter does not wrap per-repo git. Stage and commit with plain `git` inside each worktree, then use `winter ws push` to ship the environment. Follow each repo's own commit conventions.

:::note[Canonical source]
Full command reference: [`ai/winter-cli/index.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/index.md). Raw git equivalents for every operation: [`ai/worktree-ops.md`](https://github.com/paul-gross/winter/blob/master/ai/worktree-ops.md). See also the [CLI Reference](/winter-docs/cli-reference/).
:::
