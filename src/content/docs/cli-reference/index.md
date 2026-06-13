---
title: CLI Reference
description: Every winter subcommand — with usage and an example.
---

The `winter` command manages the workspace across all repositories. Install it from the workspace root with `./tools/winter-cli/install.sh`; the wrapper auto-discovers the workspace by searching upward for `.winter/config.toml`.

Most commands accept `--json` for machine-readable output. For the configuration file these commands read, see the **[config.toml Reference](/winter-docs/cli-reference/config/)**.

:::tip
To run an in-development copy of the CLI from a feature worktree without reinstalling, prefix any command with `--winter=PATH` (must be the first argument), e.g. `winter --winter=./alpha/winter ws status`.
:::

## Root flags

`winter --version` prints the installed CLI version (read from package metadata) and exits; `winter --help` lists every command and root flag.

```bash
winter --version
```

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

Show git status across matched worktrees, source checkouts, and workspace-level state (orphans, drift). No network by default — reports last-fetched state.

```bash
winter ws status [PATTERNS...] [--json] [--fetch]
```

- `winter ws status` — whole workspace.
- `winter ws status alpha` — every worktree in `alpha` (equivalent to `alpha/*`).
- `winter ws status alpha/winter` — one specific worktree.
- `winter ws status '*/winter'` — that repo across every environment.

`--fetch` refreshes remote-tracking refs first (network). `--json` emits a stable, versioned snapshot (`schema_version: 1`) covering environments, source checkouts, and workspace-level drift — suitable for scripting.

**Exit codes:** `0` clean; `1` dirty or drifted; `2` command error (e.g. a pattern that matches nothing). When PATTERNS are given, exit code reflects only the matched worktrees; global drift is shown as context but does not affect it.

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

## `winter service`

Control an environment's services through a stable interface that dispatches to whichever orchestrator extension the workspace registers. Consumers always depend on `winter service …`, never on the implementation, so the backend (tmux today, containers or a daemon tomorrow) can be swapped without re-teaching agents, docs, or habits.

```bash
winter service up alpha                # start the environment's services
winter service down alpha              # stop them
winter service status alpha            # report service status
winter service restart alpha backend   # bounce one service by name
winter service logs alpha              # stream all services' logs (last 200 lines)
winter service logs alpha api          # logs for the `api` service only
winter service logs alpha -f           # stream live until Ctrl-C (exit 130)
winter service logs alpha -n 50        # last 50 lines
winter service logs alpha --since=5m   # logs from the past 5 minutes
winter service logs alpha --since=2026-06-13T10:00:00Z  # since an absolute timestamp
winter service logs alpha -t           # prefix each line with its RFC3339 timestamp
```

`logs` accepts `[SERVICE...] [-f/--follow] [-n/--tail N] [--since DURATION|TIMESTAMP] [--until DURATION|TIMESTAMP] [-t/--timestamps]`. When multiple services are in scope, each output line is prefixed with the service name; a single explicit service produces unprefixed output. Lines are written as portable plain text so `winter service logs alpha | grep ERROR` works regardless of orchestrator.

To register an orchestrator, set `service_orchestrator` in `.winter/config.toml` (naming the extension) and `orchestrate_services` in the extension's `winter-ext.toml` (the entrypoint path) — see the [config reference](/winter-docs/cli-reference/config/#service-orchestration) for the schema and the [orchestrator contract](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/usage/service.md#orchestrator-contract) for the full implementer-facing spec (argv rule, `WINTER_*` env vars, NDJSON wire format).

:::note[Canonical source]
Agent-facing references: [`ai/winter-cli/index.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/index.md) (command hub, routing to per-topic `usage/` files), [`ai/winter-cli/setup.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/setup.md) (install + config).
:::
