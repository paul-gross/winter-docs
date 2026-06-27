---
title: Environment Runtime
description: Commands for starting services and provisioning feature environments — winter service and winter provision.
---

Commands for bringing a feature environment's services up and provisioning its dependencies and data. Service orchestration requires a registered orchestrator extension — see the [config.toml Reference → Capability registry](/winter-docs/cli-reference/config/#capability-registry). Provision handler configuration lives in the [config.toml Reference → Provision manifests](/winter-docs/cli-reference/config/#provision-manifests).

## `winter service` {#winter-service}

Control an environment's services through a stable interface that dispatches to whichever orchestrator extension the workspace registers. Consumers always depend on `winter service …`, never on the implementation, so the backend (tmux today, containers or a daemon tomorrow) can be swapped without re-teaching agents, docs, or habits.

```bash
winter service up alpha                               # start the environment's services
winter service down alpha                             # stop them
winter service status                                 # every configured env, stopped ones shown stopped
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

`status`, `restart`, and `logs` use **segment-aware glob PATTERNS** over `<env>/<service>` — the same vocabulary `winter ws` uses for `<env>/<repo>`. Within each segment, `*`, `?`, and `[...]` match as usual; `*` does not cross `/`. A bare `<env>` expands to `<env>/*`. Cross-environment selection is supported: `'*/backend'` selects the `backend` service across every env. `up` and `down` always operate on the whole environment. For `restart` and `logs`, at least one pattern is required. For `status`, omitting all patterns selects every service in every env — enumeration is registry-driven, so every configured environment appears, with stopped environments shown as stopped rather than omitted.

`logs` accepts `PATTERN... [-f/--follow] [-n/--tail N] [--since DURATION|TIMESTAMP] [--until DURATION|TIMESTAMP] [-t/--timestamps]` (at least one PATTERN required). Each output line is prefixed with `<env>/<svc> | ` whenever more than one service may be in scope — see the [orchestrator contract](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/usage/service.md#orchestrator-contract) for the precise rule. Lines are written as portable plain text so `winter service logs alpha | grep ERROR` works regardless of orchestrator.

To register an orchestrator, set `capabilities.service` in the `[capabilities]` table in `.winter/config.toml` and `provides.service` in the extension's `winter-ext.toml` — see the [config reference](/winter-docs/cli-reference/config/#capability-registry) for the schema and the [orchestrator contract](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/usage/service.md#orchestrator-contract) for the full implementer-facing spec (argv rule, `WINTER_*` env vars, NDJSON wire format). The legacy `service_orchestrator` (workspace config) and `orchestrate_services` (extension manifest) keys are deprecated back-compat aliases — existing configs continue to work, but new workspaces should use `[capabilities]`/`[provides]`.

## `winter provision` {#winter-provision}

Bring a feature environment to a working state after `winter ws init`: install dependencies, create resources (databases, queues, buckets), and load seed data. Re-runnable and idempotent. Reads `[[provision.*]]` handlers from `.winter/config.toml` and each installed extension's `winter-ext.toml` — see the [config reference → Provision manifests](/winter-docs/cli-reference/config/#provision-manifests).

```bash
winter provision alpha                          # full chain: dependency → resource → data
winter provision alpha dependency               # one sub-target only
winter provision alpha resource --reset         # destroy + recreate resources
winter provision alpha resource --destroy       # destroy resources only
winter provision alpha resource --seed          # create resources, then load data
winter provision alpha data --reset             # wipe + reload data
winter provision alpha --no-service-check       # skip the required_services check
winter provision alpha --json                   # NDJSON event stream
```

The bare form runs all three sub-targets (`dependency` → `resource` → `data`) in order; a handler failure aborts the rest. Action flags (`--reset`, `--destroy`, `--seed`) always require an explicit sub-target; `--seed` is valid only on `resource`, and `--reset`/`--destroy` cannot be combined. When a `resource`/`data` handler declares `required_services`, winter starts any that are not running before executing it (unless `--no-service-check`). See [Provisioning Environments](/winter-docs/operations/provisioning/) for the model and [`ai/winter-cli/usage/provision.md`](https://github.com/paul-gross/winter/blob/master/ai/winter-cli/usage/provision.md) for the full contract.

```bash
winter provision alpha
```
