---
title: winter-service-tmux
description: tmux-based service orchestration — run each environment's services side by side without port conflicts.
---

**[winter-service-tmux](https://github.com/paul-gross/winter-service-tmux)** provides service orchestration. It runs each feature environment's services (backend, frontend, workers, …) in a dedicated per-environment tmux session, so multiple environments can run their own copies of the stack at once without colliding on ports.

## What it contributes

- **`up` / `down` / `status`** scripts, symlinked into every environment directory.
- A **per-environment tmux session** named `<session_prefix>-<env>` (e.g. `mp-alpha`).
- An `on_env_init` hook that wires the session up when an environment is created.

For the full operating model — starting and stopping services, reading pane output, and the conventions — see the [Running Services](/winter-docs/operations/services/) operations guide.

## When to adopt

Adopt this extension when your project has long-running services you start during development and you want several feature environments running in parallel. It is what makes "run `alpha` and `beta` side by side" work.

## How to configure

```toml
[[standalone_repository]]
name = "winter-service-tmux"
url = "git@github.com:paul-gross/winter-service-tmux.git"
path = ".winter/ext/service-tmux"
```

The extension needs a project-specific **`setup-tmux.sh`** that declares which services to run and the tmux pane layout, plus a companion **`setup-tmux.md`** that maps service names to `<window>.<pane>` targets. Generate both by following the extension's [`ai/workflow-setup.md`](https://github.com/paul-gross/winter-service-tmux/blob/master/ai/workflow-setup.md) walkthrough; `/ws-setup` prompts for this when the extension is installed. Until `setup-tmux.sh` exists, `./up` errors out. A gitignored **`setup-tmux.local.sh`** can overlay machine-specific overrides on top; the legacy names `workflow.sh` / `workflow.md` still work as fallbacks.

## Troubleshooting

- **`./up` errors immediately** — `setup-tmux.sh` is missing or unreadable. Run the workflow-setup walkthrough.
- **`setup-tmux.md` is missing** — re-run the setup walkthrough's final step; don't reverse-engineer pane indices from `setup-tmux.sh`.
- **A service didn't start** — read its pane with `tmux capture-pane -pt <prefix>-<env>:<window>.<pane>` (targets are in `setup-tmux.md`).
- **Stale processes after a crash** — use `./down` to reap the session cleanly rather than killing processes by hand.

## Key conventions

- **Never start services as background processes** (`nohup`, `&`) — always go through `./up`.
- **Never kill services directly** (`kill`, `pkill`, `tmux kill-session`) — always use `./down`.
- **Read output with `tmux capture-pane`**, using the targets in `setup-tmux.md`.

:::note[Canonical source]
[`winter-service-tmux`](https://github.com/paul-gross/winter-service-tmux) — see its [`index.md`](https://github.com/paul-gross/winter-service-tmux/blob/master/index.md).
:::
