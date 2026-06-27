---
title: Running Services
description: Configure config.toml and use winter service up/down/status/restart/logs to run an environment's services in a per-environment tmux session.
---

Service orchestration is provided by the **[winter-service-tmux](/winter-docs/extensions/winter-service-tmux/)** extension. It runs each environment's services (backend, frontend, workers, …) in a dedicated tmux session, so multiple environments can run their own copies of the stack side by side without port conflicts. The extension implements the full `winter service` contract, so all service control goes through `winter service <action> <env>`.

## One-time setup: `config.toml`

The extension needs a project-specific **`config.toml`** manifest (at `.winter/config/winter-service-tmux/config.toml`) that declares which services to run and how the tmux panes are laid out. Without it, `./up` errors out. Author it (and its companion `layout-hook.sh`) by following the extension's [`context/workflow-setup.md`](https://github.com/paul-gross/winter-service-tmux/blob/master/context/workflow-setup.md) walkthrough; the `/ws-setup` flow prompts for this when the extension is installed.

`config.toml` is a declarative TOML manifest. It defines:

- the **`session_prefix`** (e.g. `mp`), used to name sessions `<prefix>-<env>` — `mp-alpha`, `mp-beta`, …;
- one **`[[service]]` entry per tmux pane**, each with a unique `name`, a `target` (`<window>.<pane>`), and a `command`;
- an optional **`log`** field per service (`"file"` by default, or `"pane"`) controlling how output is captured;
- the **`layout_hook`** path pointing to `layout-hook.sh`, which creates the tmux windows and panes.

For machine-specific overrides, add a gitignored **`config.local.toml`** next to the committed manifest. The reader merges it on top using the same overlay semantics: scalars replace, `[[service]]` and `[[status.url]]` entries merge keyed by `name`/`label`.

See [`workflow/config.toml.example`](https://github.com/paul-gross/winter-service-tmux/blob/master/workflow/config.toml.example) and [`workflow/config.local.toml.example`](https://github.com/paul-gross/winter-service-tmux/blob/master/workflow/config.local.toml.example) for the full annotated schema.

## Start, check, restart, stop

Use `winter service` — the stable interface that dispatches to the registered orchestrator:

```bash
winter service up alpha                  # start the environment's services in tmux session mp-alpha
winter service status alpha              # show this environment's services
winter service restart alpha/<service>   # reap and re-run one wedged/crashed service, leaving the rest up
winter service down alpha                # stop everything and reap child processes cleanly
```

The underlying `./up` / `./down` / `./status` / `./restart` scripts are also symlinked into every environment directory and can be run directly from the environment root — but prefer `winter service` so consumers are decoupled from the orchestrator implementation.

The env-root `./status` script is scoped to the session it's run from: it reports only that environment's running tmux session, and `./status --all` gives a cross-environment view of every running session. `winter service status` is orchestrator-neutral and **registry-driven**: `winter service status alpha` reports alpha's configured services — shown stopped when the environment isn't running, not omitted — and a bare `winter service status` (no pattern) lists every configured environment, stopped ones included, merged across all registered providers. `winter service restart` takes segment-aware `<env>/<service>` PATTERNS (at least one required), reaping just that pane and re-running its declared command while the other panes keep running — the sanctioned way to recover one service without a full `./down && ./up`. Note: the env-root `./restart` door is env-scoped and accepts bare service names only (not the `<env>/<service>` form).

## Reading service output

Use `winter service logs` — file-mode services write to `<env>/.winter/logs/<service>.log` (timestamped, size-rotated, persistent across restarts and `./down`):

```bash
winter service logs alpha              # all services, full backlog
winter service logs alpha/backend      # one service
winter service logs alpha -f           # follow (live tail, Ctrl-C to exit)
winter service logs alpha -n 50        # last 50 lines
winter service logs alpha --since=5m   # from the past 5 minutes
winter service logs alpha --since=2026-06-13T10:00:00Z   # since an absolute timestamp
winter service logs alpha -t           # prefix each line with its RFC3339 timestamp
```

Not all services write to a log file. The `log` field in each `[[service]]` entry controls capture mode:

- **`"file"` (default)** — stdout/stderr piped through a capture writer to `<env>/.winter/logs/<svc>.log`. Timestamped, survives `down`, readable with `winter service logs`.
- **`"pane"`** — launched bare (TTY preserved); output is read on demand via `tmux capture-pane` (no file persistence, no timestamps, requires a running session). Use for interactive panes (`shell`) or services where TTY fidelity matters more than persistence.
- **`"memory"`** — accepted and validated; not yet implemented (`logs` emits nothing for memory-mode services).

For `log="pane"` services, read the pane buffer directly:

```bash
tmux capture-pane -pt <prefix>-<env>:<window>.<pane>
```

## Rules

These conventions keep environments clean and reapable:

- **Never start services as background processes** — no `nohup`, no `&`. Always go through `winter service up` (or `./up`) so they land in the tmux session.
- **Never kill services directly** — no `kill`, `pkill`, or `tmux kill-session`. Always use `winter service down` (or `./down`) so child processes are reaped.
- **Recover one wedged service with `winter service restart alpha/<service>`** — not `kill`/`pkill`, and not a full down+up. It reaps just that pane and re-runs the service, leaving the rest of the session up.
- **Read output with `winter service logs`** for file-mode services. For `log="pane"` services, use `tmux capture-pane` directly.

## `winter service` interface

`winter service` is a **core winter command group** — `winter service up alpha`, `winter service down alpha`, `winter service status`, `winter service restart <PATTERN...>`, and `winter service logs <PATTERN...> [OPTIONS]` — that owns a stable interface and dispatches each call to whichever orchestrator the workspace registers. The design point is interchangeability: consumers depend on `winter service …`, not on any particular implementation.

`status`, `restart`, and `logs` use **segment-aware glob PATTERNS** over `<env>/<service>` — the same vocabulary `winter ws` uses for `<env>/<repo>`. A bare `<env>` expands to `<env>/*`; `'*/backend'` selects the `backend` service across every env (cross-environment selection is supported). `up` and `down` always operate on the whole environment. For `restart` and `logs`, at least one pattern is required; for `status`, omitting patterns selects every service in every env. See the [CLI Reference](/winter-docs/cli-reference/environment-runtime/#winter-service) for the full flag and example listing.

**The `winter-service-tmux` extension fully conforms to the `winter service` orchestrator contract.** Register it by adding a `[capabilities]` table to `.winter/config.toml` and a `[provides]` table to the extension's `winter-ext.toml`:

```toml
# .winter/config.toml
[capabilities]
service = "winter-service-tmux"

# .winter/ext/service-tmux/winter-ext.toml
[provides]
service = "workflow/orchestrate"
```

The legacy root key `service_orchestrator = "winter-service-tmux"` (workspace config) and `orchestrate_services = "workflow/orchestrate"` (extension manifest) are deprecated back-compat aliases — existing configs continue to work without modification, but new workspaces should use `[capabilities]`/`[provides]`.

## Multi-provider orchestration

When two or more extensions both declare `provides.service`, winter runs them in a **multi-provider** mode: `winter service up <env>` fans out to every provider and aborts on the first failure; `winter service down <env>` fans out best-effort (continues past failures so all providers get a chance to clean up). `status` merges each provider's output into a single document; `restart` and `logs` route each matched service to its owning provider (`logs` in follow mode requires all matched services to belong to a single provider).

A single provider is dispatched directly — no fan-out overhead. With multiple providers installed and **no explicit binding**, winter implicitly binds all of them (sorted by name) and fans out — no configuration change is needed. An explicit `capabilities.service` list restricts or reorders providers when you want control over which are used:

```toml
# .winter/config.toml  (explicit multi-provider example)
[capabilities]
service = ["winter-service-tmux", "my-second-orchestrator"]
```

Run `winter capabilities` to inspect the current binding — for a single provider `--json` emits a scalar `bound`; for multiple it emits an array (scalar-for-single preserves back-compat with existing machine clients).

## Workspace-scoped services

Some services — a shared database, a message broker, a container registry — should run once for the whole workspace rather than once per feature env. Declare them with `scope = "workspace"` in `config.toml`:

```toml
[[service]]
name    = "db"
target  = "0.0"
command = "postgres -D /usr/local/var/postgres"
scope   = "workspace"
```

Drive them with the reserved `workspace` target:

```bash
winter service up workspace          # start all workspace-scoped services
winter service down workspace        # stop the workspace session
winter service status workspace      # list workspace service states
winter service restart workspace/db  # restart one workspace service
```

`winter service up <env>` ensures the workspace session is running before it starts the per-env session — workspace singletons are guaranteed to be up when any env spins up. `down <env>` intentionally leaves the workspace session running; only `down workspace` tears it down. The `workspace` token is an exact reserved name — glob patterns like `work*` do NOT match it.

For the `winter service` command surface and flag reference, see the [CLI Reference](/winter-docs/cli-reference/environment-runtime/#winter-service). For the registration config keys and capability registry, see the [config reference](/winter-docs/cli-reference/config/#capability-registry). For the full implementer-facing orchestrator contract (argv rule, `WINTER_*` env vars, NDJSON wire format), see [`context/winter-cli/usage/service.md`](https://github.com/paul-gross/winter/blob/master/context/winter-cli/usage/service.md#orchestrator-contract).

:::note[Canonical source]
Conventions and setup live in the extension: [`winter-service-tmux`](https://github.com/paul-gross/winter-service-tmux) — see its [`index.md`](https://github.com/paul-gross/winter-service-tmux/blob/master/index.md) and [`context/workflow-setup.md`](https://github.com/paul-gross/winter-service-tmux/blob/master/context/workflow-setup.md). Adopter guide: [winter-service-tmux extension](/winter-docs/extensions/winter-service-tmux/).
:::
