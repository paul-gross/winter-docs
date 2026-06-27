---
title: winter-service-tmux
description: tmux-based service orchestration — run each environment's services side by side without port conflicts.
---

**[winter-service-tmux](https://github.com/paul-gross/winter-service-tmux)** provides service orchestration. It runs each feature environment's services (backend, frontend, workers, …) in a dedicated per-environment tmux session, so multiple environments can run their own copies of the stack at once without colliding on ports. The extension implements the full `winter service` contract — all service control goes through `winter service <action> <env>`.

## What it contributes

- **`winter service up/down/status/restart/logs <env>`** dispatch, backed by a Python orchestrator (`src/service_orchestrator/`).
- **`./up` / `./down` / `./status` / `./restart` scripts**, symlinked into every environment directory for direct use.
- **Single-service restart** — `winter service restart alpha <service>` (or `./restart <service>`) reaps one wedged or crashed service's pane and re-runs its declared command, leaving the rest of the session running.
- **Persistent log capture** — file-mode services write to `<env>/.winter/logs/<service>.log`; read with `winter service logs alpha`.
- **A per-environment tmux session** named `<session_prefix>-<env>` (e.g. `mp-alpha`).
- An **`on_env_init`** hook that wires the tmux session up when an environment is created.
- An **`on_env_destroy`** hook that tears the session down when an environment is destroyed.
- A **`winter doctor` probe** (`[wst]`) that checks tmux is installed, `session_prefix` is declared, no foreign sessions collide with the prefix, and the manifest validates cleanly.

For the full operating model — starting and stopping services, reading logs, and the conventions — see the [Running Services](/winter-docs/operations/services/) operations guide.

## When to adopt

Adopt this extension when your project has long-running services you start during development and you want several feature environments running in parallel. It is what makes "run `alpha` and `beta` side by side" work.

## How to configure

Register the extension in `.winter/config.toml` using the `[capabilities]` table, and declare `[provides]` in the extension's `winter-ext.toml`:

```toml
# .winter/config.toml
[capabilities]
service = "winter-service-tmux"

[[standalone_repository]]
name = "winter-service-tmux"
url = "git@github.com:paul-gross/winter-service-tmux.git"
path = ".winter/ext/service-tmux"

# .winter/ext/service-tmux/winter-ext.toml  (recommended form for the extension's manifest)
[provides]
service = "workflow/orchestrate"
```

The extension's published `winter-ext.toml` still declares the capability through the deprecated `orchestrate_services` alias (below) rather than a `[provides]` table; both resolve identically, so the form above is what a new manifest should use.

See the [config reference → Capability registry](/winter-docs/cli-reference/config/#capability-registry) for the full resolution rules.

:::note[Deprecated aliases]
The legacy `service_orchestrator = "winter-service-tmux"` root key (workspace config) and `orchestrate_services = "workflow/orchestrate"` (extension manifest) are back-compat aliases that continue to work for existing configs. New workspaces should use `[capabilities]`/`[provides]` instead.
:::

The extension needs a project-specific **`workspace:/.winter/config/winter-service-tmux/config.toml`** manifest and its companion **`workspace:/.winter/config/winter-service-tmux/layout-hook.sh`**. Follow the extension's [`context/workflow-setup.md`](https://github.com/paul-gross/winter-service-tmux/blob/master/context/workflow-setup.md) walkthrough (or run `/ws-setup`) to author them. Until `config.toml` exists, `./up` errors out.

`config.toml` declares every service by `name`, tmux `target` (`<window>.<pane>`), `command`, and `log` capture mode (`"file"` by default, `"pane"` for interactive panes or TTY-sensitive services). Commit it to source — it's the project's service config. For machine-specific overrides, add a gitignored **`config.local.toml`** next to it; the reader merges it on top (scalars replace; `[[service]]` and `[[status.url]]` entries merge keyed by `name`/`label`).

See [`workflow/config.toml.example`](https://github.com/paul-gross/winter-service-tmux/blob/master/workflow/config.toml.example) and [`workflow/config.local.toml.example`](https://github.com/paul-gross/winter-service-tmux/blob/master/workflow/config.local.toml.example) for the full annotated schema.

## Troubleshooting

- **`./up` errors immediately** — `config.toml` is missing or unreadable. Run the workflow-setup walkthrough.
- **A service didn't start** — read its logs with `winter service logs alpha <service>`. For `log="pane"` services (interactive panes, TTY-mode), use `tmux capture-pane -pt <prefix>-<env>:<window>.<pane>` (the target is in `config.toml`'s `[[service]]` entry).
- **One service wedged or crashed** — `winter service restart alpha <service>` (or `./restart <service>`) reaps just that pane and re-runs it, leaving the rest of the session up — no need to `winter service down` the whole stack.
- **Stale processes after a crash** — use `winter service down` (or `./down`) to reap the session cleanly rather than killing processes by hand.

## Key conventions

- **Never start services as background processes** (`nohup`, `&`) — always go through `winter service up` (or `./up`).
- **Never kill services directly** (`kill`, `pkill`, `tmux kill-session`) — always use `winter service down` (or `./down`), or `winter service restart alpha <service>` to bounce a single service.
- **Read output with `winter service logs`** for file-mode services. For `log="pane"` services, use `tmux capture-pane` directly.

:::note[Canonical source]
[`winter-service-tmux`](https://github.com/paul-gross/winter-service-tmux) — see its [`index.md`](https://github.com/paul-gross/winter-service-tmux/blob/master/index.md).
:::
