---
title: CLI Reference
description: Every winter subcommand — with usage and an example.
---

The `winter` command manages the workspace across all repositories. Install it from the workspace root with `./tools/winter-cli/install.sh`; the wrapper auto-discovers the workspace by searching upward for `.winter/config.toml` + `tools/winter-cli/`.

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

### `ws connect` / `ws disconnect`

Point non-pinned worktrees at a remote feature branch, or clear that tracking. For `connect`, the trailing argument is the branch; everything before it is a segment-aware `<env>/<repo>` glob, so a bare `<env>` connects the whole env while an `<env>/<repo>` pattern targets specific worktrees — letting repos in one env carry independent branch names. `disconnect` is whole-env only (`<env>`).

```bash
winter ws connect alpha feature/new-checkout      # every non-pinned worktree in alpha
winter ws connect alpha/api feature/auth          # just alpha's api worktree
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

Print the port-offset index for an environment name. Returns the **persisted** index from `.winter/state.toml` when the env exists, or the **suggested** (hash) slot for a hypothetical name (with a note that it may shift on create due to collision-probing).

```bash
winter ws index my-feature
```

### `ws prune`

Remove disk state for repos no longer in the config (orphan clones, broken `.claude/` symlinks).

```bash
winter ws prune [--dry-run | --force]
```

### `ws worktrees`

List every existing feature-environment worktree and standalone repo as a flat table or JSON array. Each entry carries a `kind` of `worktree`, `standalone`, or `workspace`; the implicit workspace repo is the single `workspace` entry. Entries whose directory does not exist on disk are omitted. Intended for editor integrations (e.g. a Neovim fuzzy-finder `cd` picker).

```bash
winter ws worktrees [--status] [--json]
```

- `winter ws worktrees` — human-readable table.
- `winter ws worktrees --json` — JSON array for machine consumption.
- `winter ws worktrees --json --status` — JSON with per-repo git status (ahead/behind/dirty). Slower — does a git call per repo.

```bash
winter ws worktrees --json
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
winter repo add URL [--standalone] [--ref REF] [--name N] [--main-branch B] [--cmd C] [--pinned] [--path P] [--prefix P] [--git-exclude E] [--local]
```

- `--standalone` — add as a standalone repo instead of a project repo.
- `--ref REF` — pin the standalone repo to a branch, tag, or commit (standalone only; see `[[standalone_repository]]` in the [config reference](/winter-docs/cli-reference/config/#standalone_repository)).

```bash
winter repo add git@github.com:org/app.git --name app --cmd "pnpm install"
winter repo add git@github.com:org/ext.git --standalone --ref v1.2.0 --path .winter/ext/myext
```

### `repo remove`

Remove a repository entry from the config.

```bash
winter repo remove project/app
```

## `winter ext` — extension management

### `ext verify`

Verify that an extension conforms to the service capability spec. Runs golden invocations from the bundled spec and reports each check as a pass or fail. Exits non-zero if any check fails.

```bash
winter ext verify EXTENSION [--json]
```

`EXTENSION` is either the name of an installed standalone extension (as declared in `.winter/config.toml`) or a local path to an extension directory. The extension's `winter-ext.toml` must declare a service entrypoint via `[provides] service` (or the deprecated `orchestrate_services` alias).

```bash
winter ext verify winter-service-tmux         # by installed name
winter ext verify ./my-ext/                   # by local path
winter ext verify winter-service-tmux --json  # machine-readable results
```

### `ext new`

Scaffold a new extension that implements a capability slot. Generates a `winter-ext.toml`, an `index.md` skeleton, and a refuse-all stub entrypoint that passes `winter ext verify` out of the box. The action set and exit codes in the stub are derived from the bundled capability spec.

```bash
winter ext new NAME --capability SLOT [--dir DIR] [--force]
```

- `NAME` — the extension name (used in `winter-ext.toml` and as the default output directory).
- `--capability SLOT` — the capability slot to implement (e.g. `service`). Required.
- `--dir DIR` — output directory (default: `<cwd>/<name>/`; relative paths resolved against cwd).
- `--force` — overwrite a non-empty existing output directory.

```bash
winter ext new my-orchestrator --capability service
winter ext new my-orchestrator --capability service --dir /path/to/dir
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

Run winter-ecosystem *convention* checks — path notation, agent frontmatter, module boundaries — as opposed to `winter doctor`, which checks workspace health. `winter lint` is a dispatcher: it runs built-in core checks bundled with the CLI (currently module extractability, which enforces dependency direction) plus lint scripts contributed by installed extensions (and an optional workspace-level one) over the selected scope, and aggregates `pass` / `warn` / `fail` findings with `file:line`. The core checks always run; the contributed checks live in the extensions and workspace. Exit `0` unless something fails (warnings allowed).

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
winter service up alpha                               # start the environment's services
winter service down alpha                             # stop them
winter service status                                 # report all services in all envs
winter service status alpha                           # all services in alpha (expands to alpha/*)
winter service status alpha/api                       # one specific service
winter service status 'alpha/worker-*'                # services matching a glob within alpha
winter service status '*/backend'                     # backend service across every env
winter service restart alpha/api beta/worker-main     # bounce specific services (≥1 required)
winter service restart 'alpha/worker-*'               # bounce all matched workers in alpha
winter service logs alpha                             # stream all services' logs in alpha
winter service logs alpha/api                         # logs for one service (no prefix)
winter service logs 'alpha/worker-*'                  # aggregate logs across matched services in alpha
winter service logs '*/backend'                       # backend logs across all envs
winter service logs alpha -f                          # stream live until Ctrl-C (exit 130)
winter service logs alpha -n 50                       # last 50 lines
winter service logs alpha --since=5m                  # logs from the past 5 minutes
winter service logs alpha --since=2026-06-13T10:00:00Z  # since an absolute timestamp
winter service logs alpha -t                          # prefix each line with its RFC3339 timestamp
```

`status`, `restart`, and `logs` use **segment-aware glob PATTERNS** over `<env>/<service>` — the same vocabulary `winter ws` uses for `<env>/<repo>`. Within each segment, `*`, `?`, and `[...]` match as usual; `*` does not cross `/`. A bare `<env>` expands to `<env>/*`. Cross-environment selection is supported: `'*/backend'` selects the `backend` service across every env. `up` and `down` always operate on the whole environment. For `restart` and `logs`, at least one pattern is required. For `status`, omitting all patterns selects every service in every env.

`logs` accepts `PATTERN... [-f/--follow] [-n/--tail N] [--since DURATION|TIMESTAMP] [--until DURATION|TIMESTAMP] [-t/--timestamps]` (at least one PATTERN required). Each output line is prefixed with `<env>/<svc> | ` whenever more than one service may be in scope — see the [orchestrator contract](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/usage/service.md#orchestrator-contract) for the precise rule. Lines are written as portable plain text so `winter service logs alpha | grep ERROR` works regardless of orchestrator.

To register an orchestrator, set `capabilities.service` in the `[capabilities]` table in `.winter/config.toml` and `provides.service` in the extension's `winter-ext.toml` — see the [config reference](/winter-docs/cli-reference/config/#capability-registry) for the schema and the [orchestrator contract](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/usage/service.md#orchestrator-contract) for the full implementer-facing spec (argv rule, `WINTER_*` env vars, NDJSON wire format). The legacy `service_orchestrator` (workspace config) and `orchestrate_services` (extension manifest) keys are deprecated back-compat aliases — existing configs continue to work, but new workspaces should use `[capabilities]`/`[provides]`.

## `winter graph`

Print the module dependency graph declared in each installed extension's `winter-ext.toml` `requires` field. Every installed module that ships a `winter-ext.toml` becomes a node; its `requires` list becomes its edges. A read-only data command with a stable JSON contract; lint checks consume it via `$WINTER_CLI graph --json` to reason about dependencies without re-parsing manifests.

```bash
winter graph            # human-readable `module → deps` listing
winter graph --json     # {module: [requires...]} adjacency map
```

## `winter capabilities`

Read-only introspection of the capability registry. Lists every known slot, which extension is bound to it, how the binding was determined (explicit, implicit, ambiguous, or invalid), and whether each candidate's entrypoint file resolves on disk. Always exits `0` — misconfiguration is reported here; `winter doctor` is what fails on it.

```bash
winter capabilities           # human-readable per-slot binding listing
winter capabilities --json    # JSON array, one object per known slot
```

See [config.toml Reference → Capability registry](/winter-docs/cli-reference/config/#capability-registry) for the config keys and resolution rules.

:::note[Canonical source]
Agent-facing references: [`ai/winter-cli/index.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/index.md) (command hub, routing to per-topic `usage/` files), [`ai/winter-cli/setup.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/setup.md) (install + config).
:::
