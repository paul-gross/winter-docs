---
title: Running Services
description: Configure setup-tmux.sh and use up / down / status / restart to run an environment's services in a per-environment tmux session.
---

Service orchestration is provided by the **[winter-service-tmux](/winter-docs/extensions/)** extension. It runs each environment's services (backend, frontend, workers, …) in a dedicated tmux session, so multiple environments can run their own copies of the stack side by side without port conflicts.

## One-time setup: `setup-tmux.sh`

The extension needs a project-specific `setup-tmux.sh` that declares which services to run and how the tmux panes are laid out. Until it exists, `./up` errors out. Generate it (and its agent-facing companion `setup-tmux.md`) by following the extension's [`ai/workflow-setup.md`](https://github.com/paul-gross/winter-service-tmux/blob/master/ai/workflow-setup.md) walkthrough; the `/ws-setup` flow prompts for this when the extension is installed.

`setup-tmux.sh` defines:

- the **session prefix** (e.g. `mp`), used to name sessions `<prefix>-<env>` — `mp-alpha`, `mp-beta`, …;
- the **services** and their tmux `<window>.<pane>` layout;
- the commands each service runs, which read `WINTER_PORT_BASE` so each environment binds its own ports.

`setup-tmux.md` is the human/agent reference that maps each service name to its `<window>.<pane>` target — start there rather than reverse-engineering pane indices from `setup-tmux.sh`.

For machine-specific overrides, add a gitignored `setup-tmux.local.sh` next to it — the scripts source it on top of the committed `setup-tmux.sh`. The legacy filenames `workflow.sh` / `workflow.md` (and `workflow.local.sh`) are still honored as fallbacks.

## Start, check, restart, stop

The `up` / `down` / `status` / `restart` scripts are symlinked into every environment directory. Run them from the environment root:

```bash
cd alpha
./up                 # start the environment's services in tmux session mp-alpha
./status             # show this environment's services
./status --all       # cross-environment view of every running session
./restart <service>  # reap and re-run one wedged/crashed service, leaving the rest up
./down               # stop everything and reap child processes cleanly
```

Each script is scoped to the environment it's run from: `alpha/status` reports only the `mp-alpha` session, the same way `./up` and `./down` default to their own environment. There is no worktree-name argument to `./status` — pass `--all` when you want to see every running environment at once. `./restart` takes a **service name** (not an env), reaping just that service's pane and re-running its declared command while the other panes keep running — the sanctioned way to recover one service without a full `./down && ./up`.

## Reading service output

Services run inside tmux, so read their logs with `tmux capture-pane` against the service's pane target (listed in `setup-tmux.md`):

```bash
tmux capture-pane -pt mp-alpha:<window>.<pane>
```

## Rules

These conventions keep environments clean and reapable:

- **Never start services as background processes** — no `nohup`, no `&`. Always go through `./up` so they land in the tmux session.
- **Never kill services directly** — no `kill`, `pkill`, or `tmux kill-session`. Always use `./down` so child processes are reaped.
- **Recover one wedged service with `./restart <service>`** — not `kill`/`pkill`, and not a full `./down && ./up`. It reaps just that pane and re-runs the service, leaving the rest of the session up.
- **Read pane output with `tmux capture-pane`**, using the targets in `setup-tmux.md`.

## Relationship to `winter service`

`winter service` is a **core winter command group** — `winter service up alpha`, `winter service down alpha`, `winter service status alpha`, `winter service restart alpha <service>`, and `winter service logs alpha [OPTIONS]` — that owns a stable interface and dispatches each call to whichever orchestrator the workspace registers. The design point is interchangeability: consumers depend on `winter service …`, not on any particular implementation.

**The `winter-service-tmux` extension does not yet conform to the `winter service` orchestrator contract.** The `./up` / `./down` / `./status` / `./restart` scripts described above are the current way to control services in a tmux-backed workspace, and they continue to be the correct approach today. Conforming the tmux extension to the `winter service` interface is a separate, not-yet-done follow-up; once that work lands, the same operations will be reachable via `winter service up alpha` etc., without changing the underlying tmux implementation.

For the `winter service` command surface and flag reference, see the [CLI Reference](/winter-docs/cli-reference/#winter-service). For the registration config keys (`service_orchestrator` in `.winter/config.toml` naming the extension, and `orchestrate_services` in that extension's `winter-ext.toml` as the entrypoint path), see the [config reference](/winter-docs/cli-reference/config/#service-orchestration). For the full implementer-facing orchestrator contract (argv rule, `WINTER_*` env vars, NDJSON wire format), see [`ai/winter-cli/usage.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/usage.md#orchestrator-contract).

:::note[Canonical source]
Conventions and setup live in the extension: [`winter-service-tmux`](https://github.com/paul-gross/winter-service-tmux) — see its [`index.md`](https://github.com/paul-gross/winter-service-tmux/blob/master/index.md) and [`ai/workflow-setup.md`](https://github.com/paul-gross/winter-service-tmux/blob/master/ai/workflow-setup.md). Adopter guide: [winter-service-tmux extension](/winter-docs/extensions/).
:::
