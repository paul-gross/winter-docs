---
title: config.toml Reference
description: Every key in .winter/config.toml and the .winter/config.local.toml overlay — types, defaults, and behavior.
---

Winter reads two files and merges them: the committed workspace config and a gitignored per-user overlay.

- `.winter/config.toml` — the committed workspace config (repo list, excludes, defaults).
- `.winter/config.local.toml` — a gitignored overlay for per-user settings. It uses the same schema and overrides the shared config key by key.

## Top-level keys

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `main_branch` | string | `"main"` | Workspace-default main branch. Each `[[project_repository]]` may override it. |
| `session_prefix` | string | — | tmux session prefix used by the service-orchestration extension. |
| `adopt_extensions` | string | `"winter"` | How aggressively standalone repos contribute skills/agents: `winter`, `all`, or `none` (see below). |
| `doctor` | string (path) | — | Optional workspace-level `winter doctor` probe script, relative to the workspace root, must be executable. |
| `lint` | string (path) | — | Optional workspace-level `winter lint` check script, relative to the workspace root, must be executable. |
| `service_orchestrator` | string | — | Extension name that handles `winter service` dispatch. Must match a `[[standalone_repository]]` that ships a `winter-ext.toml` with an `orchestrate_services` key (see [Service orchestration](#service-orchestration)). |
| `git_excludes` | string[] | `[]` | Entries appended to every repo's `.git/info/exclude` on `winter ws init`. |

### `adopt_extensions` modes

| Value | Behavior |
|-------|----------|
| `winter` (default) | Process only standalone repos that have a `winter-ext.toml`. SKILL.md frontmatter is strictly validated. |
| `all` | Process any standalone repo with a `skills/`, `agents/`, `.claude/skills/`, or `.claude/agents/` directory, manifest or not. Frontmatter validation downgrades from refuse to warn. |
| `none` | Skip extension processing entirely. Standalone repos are still cloned; no symlinks are created. |

## Port allocation {#port-allocation}

Four keys control how ports are assigned to feature environments. All are optional; the defaults keep workspaces on clean 1000-port boundaries (4000–4979 with the defaults).

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `base_port` | integer | `4000` | Start of this workspace's port band. Set a distinct value to separate co-located workspaces (e.g. `5000`, `6000`). |
| `ports_per_env` | integer | `20` | Ports allocated per feature environment. Per-env port base = `base_port + index × ports_per_env`. |
| `env_aliases` | string[] | first 10 Greek letters (`alpha`…`kappa`) | Fixed-index env names. Each alias gets a stable, predictable index (1..N in list order). All other env names hash into the remaining band. |
| `envs_per_workspace` | integer | `48` | Maximum feature-env index (1..N). Must be `≥ len(env_aliases) + 2`; config load errors otherwise. Derives the hash band size. |

**Validation invariant:** `envs_per_workspace ≥ len(env_aliases) + 2`. `winter doctor` checks this and warns on any violation.

**Index 0 is reserved** and is never assigned to any environment. It is earmarked for a future single-slot "local" environment — a pre-seeded shared dataset/area. The slot immediately after the aliases (`N+1`, default index 11) is also reserved as a buffer between the fixed alias band and the hash band; this is why the invariant requires `+2` not `+1`. With defaults, the total occupied band is `(48 + 1) × 20 = 980` ports (the band spans indices 0–48 inclusive, so 4000–4979).

**Index assignment** is persisted in `.winter/state.toml` (machine-local, gitignored — not a config file). `winter ws init` allocates and records the index; `winter ws destroy` removes the entry. The read path loads the recorded value; for pre-registry environments (created before this feature), it falls back to recomputing from the name.

## `[[project_repository]]`

Repos cloned into `projects/` and worktreed into Greek-letter environment directories. Entries appear in CLI/TUI output in declared order, so list high-priority repos first.

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `url` | string | — (required) | Clone URL. |
| `name` | string | trailing path segment of `url`, `.git` stripped | Directory under `projects/` and the user-facing label everywhere. |
| `main_branch` | string | top-level `main_branch` | Per-repo override of the main branch. |
| `cmd` | string[] | `[]` | Commands run after clone and in every worktree (e.g. `["pnpm install"]`). |
| `pinned` | bool | `false` | Track `origin/<main>`, skip feature branching, exclude from `push` by default. |
| `git_excludes` | string[] | `[]` | Per-repo excludes, merged with the workspace-wide list. |

```toml
[[project_repository]]
name = "app-web"
url = "git@github.com:org/app-web.git"
cmd = ["pnpm install"]

[[project_repository]]
name = "shared-tools"
url = "git@github.com:org/shared-tools.git"
pinned = true
```

## `[[standalone_repository]]`

Repos cloned at the workspace root (or a configured `path`), with no worktree and no feature branching. Used for winter extensions and auxiliary repos.

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `url` | string | — (required) | Clone URL. |
| `name` | string | derived from `url` | Repo name; default clone directory. |
| `path` | string | `name` | Clone location, relative to the workspace root. |
| `prefix` | string | from `winter-ext.toml`/name | Symlink-prefix override for an extension's skills/agents. |

```toml
[[standalone_repository]]
name = "winter-service-tmux"
url = "git@github.com:paul-gross/winter-service-tmux.git"
path = ".winter/ext/service-tmux"
```

## `[keybindings]`

Remaps the `winter dashboard` keys. Every built-in (and plugin) dashboard action has a stable *action id*; an id with no entry keeps its default.

| Key | Type | Default | Meaning |
|-----|------|---------|---------|
| `leader` | string | `"\\"` | Key spec that `<leader>` expands to. |
| `timeoutlen` | integer | `1000` | Milliseconds to wait for the next key of a chord sequence (Neovim's `timeoutlen`). |

Action-id → key-spec entries live in the `[keybindings.bindings]` sub-table, with quoted ids so a dotted id stays a flat key. Specs are Neovim-inspired — single keys, modifier chords (`<C-s>`), `<leader>` expansion, and multi-key sequences (`gd`, `<leader>S`):

```toml
[keybindings]
timeoutlen = 400

[keybindings.bindings]
"workspace.refresh" = "<C-r>"
"worktree.open_detail" = "o"
"plugin.codediff" = "<leader>d"
```

The full action-id list and key-spec grammar are in the canonical reference below.

## Local overlay (`.winter/config.local.toml`)

Same schema as the shared config; keys override key by key. Most commonly it carries your git identity, which winter applies to every repo it manages during `winter ws init`:

```toml
[git]
user.name = "Jane Doe"
user.email = "jane@example.com"
```

You can also declare additional `[[project_repository]]` / `[[standalone_repository]]` entries here that you don't want committed to the shared config.

## Implicit workspace repo

The `workspace` repo is discovered implicitly — it is not declared in either file. Winter detects it from the filesystem as the repo the CLI is invoked from.

## Service orchestration

`winter service` owns a stable `up`/`down`/`status`/`restart`/`logs` interface and dispatches each call to a single orchestrator extension the workspace registers. Two distinctly-named keys connect the interface to an implementation:

- **`service_orchestrator`** (top-level in `.winter/config.toml` or the local overlay) — the name of an installed extension. Must match a `[[standalone_repository]]` entry that ships a `winter-ext.toml`.
- **`orchestrate_services`** (in that extension's `winter-ext.toml`) — an executable entrypoint path, relative to the extension's repo root.

```toml
# .winter/config.toml
service_orchestrator = "winter-service-tmux"

# .winter/ext/service-tmux/winter-ext.toml  (inside the extension repo)
orchestrate_services = "workflow/service"
```

With both keys in place, `winter service <action> <env>` resolves the orchestrator and runs its entrypoint. When either is missing — no `service_orchestrator` in config.toml, a name matching no installed extension, or an extension without an `orchestrate_services` key in winter-ext.toml — the command fails and names the specific gap. Only one orchestrator is supported; there is no per-env selection.

The full implementer-facing contract (uniform argv rule, `WINTER_*` env vars per action, NDJSON wire format for `logs`, idempotent backstop filters, and exit codes) lives in the canonical reference — see [`ai/winter-cli/usage/service.md#orchestrator-contract`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/usage/service.md#orchestrator-contract).

## Extension manifests

Per-extension configuration lives in each extension's own `winter-ext.toml`, not in `config.toml`. See the [Extensions](/winter-docs/extensions/) guides.

Key fields in `winter-ext.toml`:

| Key | Meaning |
|-----|---------|
| `name` | Default symlink prefix when no override is set. |
| `prefix` | Optional shorter prefix; takes precedence over `name`. |
| `skills_dir` / `agents_dir` | Explicit paths; override default discovery. |
| `doctor` | Executable emitting NDJSON probe events for `winter doctor`. |
| `lint` | Executable(s) emitting NDJSON findings for `winter lint` (string or list). |
| `orchestrate_services` | Executable entrypoint path for `winter service` dispatch (see [Service orchestration](#service-orchestration)). |
| `requires` | Other module names this one depends on; consumed by `winter graph`. |

### Extension hooks

Lifecycle hooks are declared in a `[hooks]` table inside `winter-ext.toml`:

```toml
[hooks]
on_env_init            = "./hooks/init.sh"
on_env_destroy         = "./hooks/destroy.sh"
on_workspace_reconcile = "./hooks/workspace-reconcile.sh"
```

All hook paths are relative to the extension directory. Winter resolves them against the extension root.

#### `on_env_init` and `on_env_destroy`

`on_env_init` fires after `winter ws init <env>` creates every per-repo worktree and seeds `.winter.env`. `on_env_destroy` fires before `winter ws destroy <env>` removes any worktree. Use them to provision and release per-environment state — tmux sessions, databases, watchers.

The hook script runs with **cwd at the env root** (`<workspace>/<env>/`) and receives:

| Var | Meaning |
|-----|---------|
| `WINTER_WORKSPACE_DIR` | Absolute path to the workspace root. |
| `WINTER_EXT_DIR` | Absolute path to this extension's clone. |
| `WINTER_EXT_PREFIX` | The resolved symlink prefix for this extension. |
| `WINTER_ENV` | The env name (`alpha`, `beta`, …). |
| `WINTER_ENV_INDEX` | The persisted port-offset index for this env (alias envs get fixed slots 1..N; ad-hoc names hash into the remainder band). |
| `WINTER_PORT_BASE` | `base_port + ports_per_env × WINTER_ENV_INDEX` (defaults: `4000 + 20 × index`). |

#### `on_workspace_reconcile`

`on_workspace_reconcile` fires **once per workspace-level reconcile**: `winter ws init` (no target) and `winter ws init --all`.

Firing order: after standalone/extension repos are reconciled (so the extension exists on disk); for `--all`, before the per-env loop begins.

The hook script runs with **cwd at the workspace root** and receives only the workspace trio:

| Var | Meaning |
|-----|---------|
| `WINTER_WORKSPACE_DIR` | Absolute path to the workspace root. |
| `WINTER_EXT_DIR` | Absolute path to this extension's clone. |
| `WINTER_EXT_PREFIX` | The resolved symlink prefix for this extension. |

`WINTER_ENV`, `WINTER_ENV_INDEX`, and `WINTER_PORT_BASE` are deliberately absent — this hook is not scoped to any feature environment.

Use `on_workspace_reconcile` for one-time workspace-level setup that should re-run whenever the workspace is re-reconciled: writing workspace-level config or reference files, registering the extension with an external tool, or regenerating derived artifacts the whole workspace shares. A concrete example: winter-service-tmux regenerates its `setup-tmux.md` service-to-pane map here, so it always stays in sync with `setup-tmux.sh` without a manual walkthrough step.

Failure semantics follow the same per-extension boolean aggregation as the env hooks.

:::note[Canonical source]
Full configuration reference for agents: [`ai/winter-cli/setup.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/setup.md).
:::
