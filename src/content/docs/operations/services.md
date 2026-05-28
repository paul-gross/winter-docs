---
title: Running Services
description: Configure workflow.sh and use up / down / status to run an environment's services in a per-environment tmux session.
---

Service orchestration is provided by the **[winter-service-tmux](/winter-docs/extensions/)** extension. It runs each environment's services (backend, frontend, workers, …) in a dedicated tmux session, so multiple environments can run their own copies of the stack side by side without port conflicts.

## One-time setup: `workflow.sh`

The extension needs a project-specific `workflow.sh` that declares which services to run and how the tmux panes are laid out. Until it exists, `./up` errors out. Generate it (and its agent-facing companion `workflow.md`) by following the extension's [`ai/workflow-setup.md`](https://github.com/paul-gross/winter-service-tmux/blob/master/ai/workflow-setup.md) walkthrough; the `/ws-setup` flow prompts for this when the extension is installed.

`workflow.sh` defines:

- the **session prefix** (e.g. `mp`), used to name sessions `<prefix>-<env>` — `mp-alpha`, `mp-beta`, …;
- the **services** and their tmux `<window>.<pane>` layout;
- the commands each service runs, which read `WINTER_PORT_BASE` so each environment binds its own ports.

`workflow.md` is the human/agent reference that maps each service name to its `<window>.<pane>` target — start there rather than reverse-engineering pane indices from `workflow.sh`.

## Start, check, stop

The `up` / `down` / `status` scripts are symlinked into every environment directory. Run them from the environment root:

```bash
cd alpha
./up        # start the environment's services in tmux session mp-alpha
./status    # show what's running
./down      # stop everything and reap child processes cleanly
```

## Reading service output

Services run inside tmux, so read their logs with `tmux capture-pane` against the service's pane target (listed in `workflow.md`):

```bash
tmux capture-pane -pt mp-alpha:<window>.<pane>
```

## Rules

These conventions keep environments clean and reapable:

- **Never start services as background processes** — no `nohup`, no `&`. Always go through `./up` so they land in the tmux session.
- **Never kill services directly** — no `kill`, `pkill`, or `tmux kill-session`. Always use `./down` so child processes are reaped.
- **Read pane output with `tmux capture-pane`**, using the targets in `workflow.md`.

:::note[Canonical source]
Conventions and setup live in the extension: [`winter-service-tmux`](https://github.com/paul-gross/winter-service-tmux) — see its [`index.md`](https://github.com/paul-gross/winter-service-tmux/blob/master/index.md) and [`ai/workflow-setup.md`](https://github.com/paul-gross/winter-service-tmux/blob/master/ai/workflow-setup.md). Adopter guide: [winter-service-tmux extension](/winter-docs/extensions/).
:::
