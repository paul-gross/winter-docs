---
title: CLI Reference
description: Every winter subcommand — workspace, repo, doctor, and dashboard — with usage and an example.
---

The `winter` command manages the workspace across all repositories. Install it from the workspace root with `./tools/winter-cli/install.sh`; the wrapper auto-discovers the workspace by searching upward for `.winter/config.toml`.

Most commands accept `--json` for machine-readable output. For the configuration file these commands read, see the **[config.toml Reference](/winter-docs/cli-reference/config/)**.

:::tip
To run an in-development copy of the CLI from a feature worktree without reinstalling, prefix any command with `--winter=PATH` (must be the first argument), e.g. `winter --winter=./alpha/winter ws status alpha`.
:::

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

Git status across all repos in an environment.

```bash
winter ws status alpha
```

### `ws diff`

Unified diff across all repos in an environment.

```bash
winter ws diff alpha [--staged | --branch] [--repo REPO]
```

```bash
winter ws diff alpha --branch
```

### `ws fetch`

Refresh remote-tracking refs and fast-forward each matched source checkout's local main. No feature-worktree changes.

```bash
winter ws fetch [PATTERNS...] [--standalone | --all]
```

```bash
winter ws fetch --all
```

### `ws pull`

Fetch, then integrate each worktree's tracked upstream. Ff-only by default.

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

Push worktrees with commits ahead of upstream. Pinned worktrees excluded by default.

```bash
winter ws push [PATTERNS...] [--include-pinned | --only-pinned] [--standalone | --all]
```

```bash
winter ws push alpha
```

### `ws connect` / `ws disconnect`

Point a non-pinned environment at a remote feature branch, or clear that tracking.

```bash
winter ws connect alpha feature/new-checkout
winter ws disconnect alpha
```

### `ws checkout`

Adopt an existing remote feature branch into an environment (all-or-nothing reset). No network — `fetch` first.

```bash
winter ws checkout alpha feature/existing-branch
```

### `ws destroy`

Tear down an environment: fire `on_env_destroy` hooks, remove worktrees, delete the directory.

```bash
winter ws destroy alpha [--force | --strict | --dry-run]
```

```bash
winter ws destroy alpha --dry-run
```

### `ws index`

Print the port-offset index for an environment name (Greek = 1–24, otherwise hashed 26–281).

```bash
winter ws index my-feature
```

### `ws prune`

Remove disk state for repos no longer in the config (orphan clones, broken `.claude/` symlinks).

```bash
winter ws prune [--dry-run | --force]
```

## `winter repo` — repositories

### `repo list`

List all project and standalone repositories.

```bash
winter repo list
```

### `repo add`

Add a repository to the config (`--local` writes the gitignored overlay instead).

```bash
winter repo add URL [--standalone] [--name N] [--main-branch B] [--cmd C] [--pinned] [--path P] [--prefix P] [--git-exclude E] [--local]
```

```bash
winter repo add git@github.com:org/app.git --name app --cmd "pnpm install"
```

### `repo remove`

Remove a repository entry from the config.

```bash
winter repo remove project/app
```

## `winter doctor`

Run preflight checks across core probes, the optional workspace probe, and each extension's probes. Exit `0` unless something fails (warnings allowed).

```bash
winter doctor [--json]
```

```bash
winter doctor
```

## `winter lint`

Run winter-ecosystem *convention* checks — path notation, agent frontmatter, module boundaries — as opposed to `winter doctor`, which checks workspace health. `winter lint` is a dispatcher: it runs lint scripts contributed by installed extensions (and an optional workspace-level one) over the selected scope and aggregates `pass` / `warn` / `fail` findings with `file:line`. It owns dispatch only; the checks live in the extensions. Exit `0` unless something fails (warnings allowed).

```bash
winter lint            # the whole workspace (same as --all)
winter lint <repo>     # one repo by name
winter lint <env>      # every worktree in a feature env
winter lint --changed  # only the dirty / un-pushed files in the current repo
winter lint --json     # NDJSON event stream
```

## `winter dashboard`

Interactive TUI showing workspace status, environments, and per-repo tracking. Press `L` for the captured-error log; `c` to clear it. Every key is remappable — see the [`[keybindings]`](/winter-docs/cli-reference/config/#keybindings) config section.

```bash
winter dashboard
```

:::note[Canonical source]
Agent-facing references: [`ai/winter-cli/usage.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/usage.md) (commands), [`ai/winter-cli/setup.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/setup.md) (install + config), [`ai/winter-cli/index.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/index.md).
:::
